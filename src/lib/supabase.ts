import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Sign-in works with Supabase's default emails: the parent clicks the link in the email (picked up
 * from the address bar here), or types a 6-digit code if the email template includes one.
 * Null when Supabase isn't configured: the app then runs in single-device "local mode" (handy for development). */
export const supabase: SupabaseClient | null = url && key
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' } })
  : null;

export const cloudEnabled = !!supabase;

export async function authHeader(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  return data.session ? { authorization: `Bearer ${data.session.access_token}` } : {};
}
