import { supabase } from './supabase';

export type AppRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return { data: { session: null }, error: null };
  return supabase.auth.getSession();
}
