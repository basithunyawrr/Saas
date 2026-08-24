import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { demoModeEnabled, getMyProfile, signIn as authSignIn, signOut as authSignOut, type AppRole, type DEMO_ACCOUNTS } from '../lib/auth';

type DemoAccount = typeof DEMO_ACCOUNTS[string];
type AuthContextValue = { session: Session | null; user: User | null; role: AppRole | null; loading: boolean; configured: boolean; demo: DemoAccount | null; signIn: (email:string,password:string)=>Promise<{error:any}>; signOut:()=>Promise<{error:any}> };
const AuthContext=createContext<AuthContextValue|null>(null);

export function AuthProvider({children}:{children:React.ReactNode}){
  const [session,setSession]=useState<Session|null>(null); const [role,setRole]=useState<AppRole|null>(null); const [demo,setDemo]=useState<DemoAccount|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{const stored=localStorage.getItem('eduflow_demo_session');if(demoModeEnabled()&&stored){try{const d=JSON.parse(stored) as DemoAccount;setDemo(d);setRole(d.role);}catch{localStorage.removeItem('eduflow_demo_session')}} if(!supabase){setLoading(false);return;} let mounted=true; supabase.auth.getSession().then(async({data})=>{if(!mounted)return;setSession(data.session);if(data.session){const{data:p}=await getMyProfile();setRole((p?.role as AppRole|null)??null)}setLoading(false)});const{data:{subscription}}=supabase.auth.onAuthStateChange(async(_event,next)=>{if(!mounted)return;setSession(next);if(next){const{data:p}=await getMyProfile();setRole((p?.role as AppRole|null)??null)}else{setRole(null)}});return()=>{mounted=false;subscription.unsubscribe()};},[]);
  const signIn=async(email:string,password:string)=>{const result=await authSignIn(email,password);if(result.demo){setDemo(result.demo);setRole(result.demo.role);} return{error:result.error};};
  const signOut=async()=>{setDemo(null);setSession(null);setRole(null);return authSignOut();};
  return <AuthContext.Provider value={{session,user:session?.user??null,role,loading,configured:!!supabase,demo,signIn,signOut}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used inside AuthProvider');return context;}
