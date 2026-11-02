// Shared helpers for the Vercel functions. Files starting with "_" are not deployed as routes.
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export interface Req { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown; query?: Record<string, string | string[]> }
export interface Res { status(code: number): Res; json(body: unknown): void; setHeader(k: string, v: string): void }

let service: SupabaseClient | null = null;

/** Server-only client with the service-role key (bypasses row-level security). Never sent to browsers. */
export function serviceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw Object.assign(new Error('Accounts are not configured yet'), { status: 500 });
  service ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return service;
}

/** The signed-in parent, verified from their Supabase access token. */
export async function requireUser(req: Req): Promise<User> {
  const h = req.headers.authorization;
  const token = typeof h === 'string' && h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) throw Object.assign(new Error('Please sign in again'), { status: 401 });
  const { data, error } = await serviceClient().auth.getUser(token);
  if (error || !data.user) throw Object.assign(new Error('Please sign in again'), { status: 401 });
  return data.user;
}

export function isAdminEmail(email?: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  return !!email && admins.includes(email.toLowerCase());
}

export async function handle(res: Res, fn: () => Promise<unknown>) {
  res.setHeader('cache-control', 'no-store');
  try {
    res.status(200).json(await fn());
  } catch (e) {
    const err = e as Error & { status?: number };
    res.status(err.status ?? 500).json({ error: err.status ? err.message : 'Something went wrong' });
  }
}
