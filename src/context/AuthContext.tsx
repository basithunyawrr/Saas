import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { signIn as authSignIn, signOut as authSignOut } from '../lib/auth';
import type { AppRole } from '../lib/auth';

type AuthContextValue = { session: Session | null; user: User | null; role: AppRole | null; loading: boolean; configured: boolean; signIn: (email:string,password:string)=>Promise<{error:any}>; signOut:()=>Promise<{error:any}> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session,setSession]=useState<Session|null>(null); const [role,setRole]=useState<AppRole|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ let mounted=true; if(!supabase){setLoading(false);return;} supabase.auth.getSession().then(async({data})=>{if(!mounted)return;setSession(data.session); if(data.session){const {data:p}=await supabase.from('profiles').select('role').eq('id',data.session.user.id).maybeSingle();setRole((p?.role as AppRole)|null)}}).finally(()=>mounted&&setLoading(false)); const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s); if(!s)setRole(null)}); return()=>{mounted=false;subscription.unsubscribe()}; },[]);
  const signIn=async(email:string,password:string)=>{const {error}=await authSignIn(email,password);return {error}}; const signOut=async()=>authSignOut();
  return <AuthContext.Provider value={{session,user:session?.user??null,role,loading,configured:!!supabase,signIn,signOut}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used inside AuthProvider');return c;}
