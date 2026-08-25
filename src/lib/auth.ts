import { supabase } from './supabase';

export type AppRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

export const DEMO_ACCOUNTS: Record<string,{password:string;role:AppRole;name:string;schoolId:string;email:string}> = {
  'superadmin@demo.eduflow.test': { email:'superadmin@demo.eduflow.test', password:'Demo@2026!', role:'super_admin', name:'Demo Super Admin', schoolId:'demo-platform' },
  'admin@demo.eduflow.test': { email:'admin@demo.eduflow.test', password:'Demo@2026!', role:'admin', name:'Demo School Admin', schoolId:'demo-school-001' },
  'teacher@demo.eduflow.test': { email:'teacher@demo.eduflow.test', password:'Demo@2026!', role:'teacher', name:'Demo Teacher', schoolId:'demo-school-001' },
  'student@demo.eduflow.test': { email:'student@demo.eduflow.test', password:'Demo@2026!', role:'student', name:'Demo Student', schoolId:'demo-school-001' },
  'parent@demo.eduflow.test': { email:'parent@demo.eduflow.test', password:'Demo@2026!', role:'parent', name:'Demo Parent', schoolId:'demo-school-001' },
};

export function demoModeEnabled() { return import.meta.env.VITE_ENABLE_DEMO_ACCOUNTS === 'true'; }

export function getDemoAccount(email:string,password:string){
  if(!demoModeEnabled()) return null;
  const account=DEMO_ACCOUNTS[email.trim().toLowerCase()];
  return account && account.password===password ? account : null;
}

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  return supabase;
}

export async function signIn(email: string, password: string) {
  const demo = getDemoAccount(email,password);
  if (demo) {
    localStorage.setItem('eduflow_demo_session', JSON.stringify(demo));
    return { data: { user: null, session: null }, error: null, demo };
  }
  return { ...(await requireClient().auth.signInWithPassword({ email, password })), demo:null };
}

export async function signUp(email: string, password: string, fullName: string) {
  return requireClient().auth.signUp({ email, password, options: { data: { full_name: fullName } } });
}

export async function signOut() {
  localStorage.removeItem('eduflow_demo_session');
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
