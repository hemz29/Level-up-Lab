import type { AppState } from '../types';
import { initialState, snapshot, useStore } from '../store';
import { computeStats } from '../engine/stats';
import { todayKey } from '../engine/dates';
import { deleteImage, getImage, kvStorage, putImage } from './db';
import * as cloud from './cloud';
import { cloudEnabled } from './supabase';

/**
 * Keeps the active child's progress saved: first to this device (IndexedDB, works offline),
 * then to the cloud a couple of seconds later. Whichever copy is newer wins when a child opens.
 */
let activeChild: string | null = null;
let unsubscribe: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let dirtyCloud = false;
let saving: Promise<void> = Promise.resolve();

export type SyncStatus = 'saved' | 'saving' | 'offline';
const listeners = new Set<(s: SyncStatus) => void>();
let status: SyncStatus = 'saved';
function setStatus(s: SyncStatus) { status = s; listeners.forEach((l) => l(s)); }
export function onSyncStatus(l: (s: SyncStatus) => void) { listeners.add(l); l(status); return () => { listeners.delete(l); }; }

const localKey = (id: string) => `state:${id}`;

interface Saved { state: AppState; updatedAt: string }

async function readLocal(id: string): Promise<Saved | null> {
  const raw = await kvStorage.getItem(localKey(id));
  return raw ? (JSON.parse(raw) as Saved) : null;
}

export async function openChild(childId: string): Promise<void> {
  await closeChild();
  activeChild = childId;
  const local = await readLocal(childId);
  let best = local;
  if (cloudEnabled) {
    try {
      const remote = await cloud.fetchState(childId);
      if (remote && (!local || remote.updatedAt > local.updatedAt)) best = remote;
      if (local && (!remote || local.updatedAt > remote.updatedAt)) dirtyCloud = true; // local edits made offline
      for (const img of await cloud.fetchImages(childId)) {
        if (!(await getImage(img.image_id))) await putImage(img.image_id, img.data_url);
      }
    } catch {
      setStatus('offline');
      dirtyCloud = true;
    }
  }
  useStore.getState().replaceAll(best?.state ?? initialState());
  useStore.setState({ hydrated: true });
  useStore.getState().dailyHousekeeping();
  unsubscribe = useStore.subscribe(() => schedule());
  if (dirtyCloud) schedule();
}

function schedule() {
  if (timer) clearTimeout(timer);
  setStatus('saving');
  timer = setTimeout(() => { void flush(); }, 1500);
}

export function flush(): Promise<void> {
  if (timer) { clearTimeout(timer); timer = null; }
  const id = activeChild;
  if (!id) return saving;
  const state = snapshot();
  const updatedAt = new Date().toISOString();
  saving = saving.then(async () => {
    await kvStorage.setItem(localKey(id), JSON.stringify({ state, updatedAt }));
    if (!cloudEnabled) { setStatus('saved'); return; }
    try {
      await cloud.saveState(id, state, computeStats(state, todayKey()), updatedAt);
      dirtyCloud = false;
      setStatus('saved');
    } catch {
      dirtyCloud = true;
      setStatus('offline');
    }
  });
  return saving;
}

export async function closeChild() {
  if (!activeChild) return;
  await flush();
  unsubscribe?.();
  unsubscribe = null;
  activeChild = null;
  useStore.getState().resetAll();
  useStore.setState({ hydrated: false });
}

// retry cloud saves when the connection comes back, and save before the tab closes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { if (dirtyCloud && activeChild) void flush(); });
  setInterval(() => { if (dirtyCloud && activeChild && navigator.onLine) void flush(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && activeChild) void flush(); });
}

export function currentChildId() { return activeChild; }

/** Drawings: saved on this device and (for signed-in families) in the child's cloud copy. */
export async function storeImage(id: string, dataUrl: string) {
  await putImage(id, dataUrl);
  if (cloudEnabled && activeChild) await cloud.saveImage(activeChild, id, dataUrl).catch(() => undefined);
}

export async function dropImage(id: string) {
  await deleteImage(id);
  if (cloudEnabled && activeChild) await cloud.removeImage(activeChild, id).catch(() => undefined);
}

/** Parent → Erase everything: wipes this child's progress and drawings everywhere. */
export async function eraseActiveChild() {
  const ids = useStore.getState().gallery.map((g) => g.id);
  for (const id of ids) await deleteImage(id);
  if (cloudEnabled && activeChild) await cloud.removeAllImages(activeChild).catch(() => undefined);
  useStore.getState().resetAll();
  useStore.setState({ hydrated: true });
  await flush();
}

export async function forgetLocalChild(childId: string) {
  await kvStorage.removeItem(localKey(childId));
}
