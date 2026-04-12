import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Reads env at call time so Vite can inline `VITE_*` in the client bundle.
 * Never call `createClient` with empty strings — it throws and kills the whole app
 * (blank screen on hosts like Vercel when env is missing).
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key);
}

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Vercel: Project Settings → Environment Variables).',
    );
  }
  if (!client) {
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL!.trim(),
      import.meta.env.VITE_SUPABASE_ANON_KEY!.trim(),
    );
  }
  return client;
}

/** Lazy proxy: real client is created only when configured and first used. */
const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const c = getClient();
    const value = Reflect.get(c, prop, receiver) as unknown;
    if (typeof value === 'function') {
      return (value as (...a: unknown[]) => unknown).bind(c);
    }
    return value;
  },
}) as SupabaseClient;

export default supabase;
