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
  return requireClient().auth.signOut();
}

export async function getSession() {
  return requireClient().auth.getSession();
}

export async function getMyProfile() {
  const client = requireClient();
  const { data: authData } = await client.auth.getUser();
  if (!authData.user) return { data: null, error: null };
  return client.from('profiles').select('id,full_name,phone,role,school_id,created_at,updated_at').eq('id', authData.user.id).maybeSingle();
}
