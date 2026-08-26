import { supabase } from './supabase';

export type AppRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

const VALID_ROLES = new Set<AppRole>(['super_admin', 'admin', 'teacher', 'student', 'parent']);

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
  const { data: authData, error: authError } = await client.auth.getUser();

  if (authError) return { data: null, error: authError };
  if (!authData.user) return { data: null, error: null };

  const { data, error } = await client
    .from('profiles')
    .select('id,full_name,phone,role,school_id,created_at,updated_at')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (error) {
    console.error('Profile fetch error:', error);
    return { data: null, error };
  }

  if (!data) {
    return {
      data: null,
      error: new Error('Your account profile could not be found. Please contact your school administrator.'),
    };
  }

  const normalizedRole = typeof data.role === 'string' ? data.role.trim().toLowerCase() : '';
  if (!VALID_ROLES.has(normalizedRole as AppRole)) {
    return {
      data: null,
      error: new Error(`Invalid EduFlow role: ${data.role ?? 'missing'}`),
    };
  }

  return {
    data: { ...data, role: normalizedRole as AppRole },
    error: null,
  };
}
