import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('Supabase environment variables are missing. Configure them before production deployment.');
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'missing-publishable-key',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
