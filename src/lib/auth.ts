import { supabase } from './supabase';

export type AppRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  return supabase;
}

export async function signIn(email: string, password: string) {
  return requireClient().auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, fullName: string) {
  return requireClient().auth.signUp({ email, password, options: { data: { full_name: fullName } } });
}

export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return { data: { session: null }, error: null };
  return supabase.auth.getSession();
}

export async function getMyProfile() {
  if (!supabase) return { data: null, error: null };
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { data: null, error: null };
  return supabase.from('profiles').select('id,full_name,phone,role,school_id,created_at,updated_at').eq('id', authData.user.id).maybeSingle();
}
