import type { AppState, DateKey } from '../types';
import type { ChildStats } from '../engine/stats';
import { authHeader, supabase } from './supabase';

export const CONSENT_VERSION = '2026-11-v1';

export interface ChildRow { id: string; nickname: string; created_at: string }

function db() {
  if (!supabase) throw new Error('Cloud is not configured');
  return supabase;
}
function check<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

export async function hasConsent(): Promise<boolean> {
  const rows = check(await db().from('consents').select('version').eq('version', CONSENT_VERSION));
  return (rows ?? []).length > 0;
}

export async function acceptConsent(userId: string) {
  check(await db().from('consents').upsert({ parent_id: userId, version: CONSENT_VERSION, accepted_at: new Date().toISOString() }));
}

export async function listChildren(): Promise<ChildRow[]> {
  return check(await db().from('children').select('id, nickname, created_at').order('created_at')) ?? [];
}

export async function createChild(userId: string, nickname: string): Promise<ChildRow> {
  const row = check(await db().from('children').insert({ parent_id: userId, nickname }).select('id, nickname, created_at').single());
  if (!row) throw new Error('Could not add the child');
  return row as ChildRow;
}

export async function deleteChild(childId: string) {
  check(await db().from('children').delete().eq('id', childId));
}

export async function fetchState(childId: string): Promise<{ state: AppState; updatedAt: string } | null> {
  const row = check(await db().from('child_state').select('state, updated_at').eq('child_id', childId).maybeSingle());
  return row ? { state: row.state as AppState, updatedAt: row.updated_at as string } : null;
}

export async function saveState(childId: string, state: AppState, stats: ChildStats, updatedAt: string) {
  check(await db().from('child_state').upsert({ child_id: childId, state, updated_at: updatedAt }));
  check(await db().from('child_stats').upsert({ child_id: childId, stats, last_active: stats.lastActive, updated_at: updatedAt }));
}

export async function fetchImages(childId: string): Promise<{ image_id: string; data_url: string }[]> {
  return check(await db().from('child_images').select('image_id, data_url').eq('child_id', childId)) ?? [];
}

export async function saveImage(childId: string, imageId: string, dataUrl: string) {
  check(await db().from('child_images').upsert({ child_id: childId, image_id: imageId, data_url: dataUrl }));
}

export async function removeImage(childId: string, imageId: string) {
  check(await db().from('child_images').delete().eq('child_id', childId).eq('image_id', imageId));
}

export async function removeAllImages(childId: string) {
  check(await db().from('child_images').delete().eq('child_id', childId));
}

export async function submitFeedback(childId: string, weekStart: DateKey, rating: number, comment?: string) {
  check(await db().from('feedback').upsert({ child_id: childId, week_start: weekStart, rating, comment: comment || null }, { onConflict: 'child_id,week_start' }));
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { 'content-type': 'application/json', ...(await authHeader()), ...(init?.headers ?? {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error ?? `Server said ${res.status}`), { status: res.status });
  return body as T;
}

export interface AdminChild {
  id: string; nickname: string; createdAt: string; lastActive: string | null; statsUpdatedAt: string | null;
  stats: ChildStats | null; feedback: { weekStart: string; rating: number; comment: string | null }[];
}
export interface AdminFamily { parentEmail: string; signedUpAt: string; lastSignIn: string | null; children: AdminChild[] }

export const fetchAdmin = () => api<{ families: AdminFamily[] }>('/api/admin-stats');
export async function isAdmin(): Promise<boolean> {
  try { await api('/api/admin-stats?check=1'); return true; } catch { return false; }
}
export const deleteAccount = () => api<{ ok: true }>('/api/delete-account', { method: 'POST', body: '{}' });
