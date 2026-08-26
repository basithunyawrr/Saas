import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, PlusCircle, RefreshCw, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ChallanStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
interface Challan { id:string; student_id:string; school_id:string; month:string; amount:number; status:ChallanStatus; transaction_reference:string|null; payment_proof_url:string|null; created_at:string; student?:{full_name:string|null}; }

const money = (n:number) => new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:0}).format(n);
const statusClass = (s:ChallanStatus) => `status ${s}`;

export function FeeManagement(){
  const [schoolId,setSchoolId]=useState(''); const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
  const [amount,setAmount]=useState(''); const [rows,setRows]=useState<Challan[]>([]); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState(''); const [message,setMessage]=useState('');

  const load=async()=>{ setLoading(true); setError(''); try{
    if(!supabase) throw new Error('Supabase is not configured.');
    const {data:user,error:userError}=await supabase.auth.getUser(); if(userError) throw userError; if(!user) throw new Error('Please sign in as an administrator.');
    const {data:profile,error:profileError}=await supabase.from('profiles').select('school_id,role').eq('id',user.id).maybeSingle(); if(profileError) throw profileError;
    if(!profile?.school_id || !['admin','super_admin'].includes(profile.role)) throw new Error('You do not have permission to manage fees.');
    setSchoolId(profile.school_id);
    const {data,error:challanError}=await supabase.from('fee_challans').select('id,student_id,school_id,month,amount,status,transaction_reference,payment_proof_url,created_at,student:profiles!fee_challans_student_id_fkey(full_name)').eq('school_id',profile.school_id).order('created_at',{ascending:false});
    if(challanError) throw challanError; setRows((data||[]) as unknown as Challan[]);
  }catch(e){setError(e instanceof Error?e.message:'Unable to load fee challans.');}finally{setLoading(false);} };
  useEffect(()=>{load()},[]);

  const stats=useMemo(()=>{const verified=rows.filter(x=>x.status==='verified'); const open=rows.filter(x=>x.status==='pending'||x.status==='submitted'); const paidStudents=new Set(verified.map(x=>x.student_id)); return {received:verified.reduce((s,x)=>s+Number(x.amount||0),0),pending:open.reduce((s,x)=>s+Number(x.amount||0),0),paid:paidStudents.size,unpaid:Math.max(0,new Set(rows.map(x=>x.student_id)).size-paidStudents.size)}},[rows]);

  const generate=async()=>{setError('');setMessage('');const value=Number(amount);if(!month||!Number.isFinite(value)||value<=0){setError('Select a month and enter a fee amount greater than zero.');return;}setSaving(true);try{
    if(!supabase||!schoolId) throw new Error('School context is unavailable.');
    const {data:students,error:studentError}=await supabase.from('profiles').select('id').eq('school_id',schoolId).eq('role','student'); if(studentError) throw studentError; if(!students?.length) throw new Error('No active students were found for this school.');
    const payload=students.map(s=>({student_id:s.id,school_id:schoolId,month,amount:value,status:'pending' as const}));
    const {error:insertError}=await supabase.from('fee_challans').upsert(payload,{onConflict:'student_id,month',ignoreDuplicates:true}); if(insertError) throw insertError;
    setMessage(`${students.length} monthly challans generated.`); await load();
  }catch(e){setError(e instanceof Error?e.message:'Unable to generate challans.');}finally{setSaving(false)}};

  return <section className="ops">
    <div className="ops-head"><div><span className="eyebrow">FINANCE</span><h2>Fee management</h2><p>Generate monthly challans and track school fee collection.</p></div><button className="primary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button></div>
    {error&&<div className="ops-error"><AlertCircle size={15}/>{error}</div>}{message&&<div className="ops-success"><CheckCircle2 size={15}/>{message}</div>}
    <div className="stats-grid">
      <div className="stat-card"><span>Total Fees Received</span><b>{money(stats.received)}</b></div><div className="stat-card"><span>Total Fees Pending</span><b>{money(stats.pending)}</b></div><div className="stat-card"><span>Paid Students</span><b>{stats.paid}</b></div><div className="stat-card"><span>Unpaid Students</span><b>{stats.unpaid}</b></div>
    </div>
    <div className="panel" style={{marginTop:18}}><div className="panel-head"><b><Wallet size={16}/> Generate monthly challans</b></div><div className="form-grid"><label>Month<input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><label>Amount (PKR)<input type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 15000"/></label><div style={{display:'flex',alignItems:'end'}}><button className="primary" onClick={generate} disabled={saving}>{saving?<><Loader2 size={15} className="spin"/> Generating…</>:<><PlusCircle size={15}/> Generate Monthly Challans</>}</button></div></div></div>
    {loading?<div className="empty-state"><Loader2 className="spin"/> Loading challans…</div>:rows.length===0?<div className="empty-state"><Wallet size={24}/><b>No fee challans yet</b><small>Generate a monthly batch above to begin tracking payments.</small></div>:<div className="ops-table" style={{marginTop:18}}><div className="ops-row" style={{fontWeight:700}}><span>Student</span><span>Month</span><span>Amount</span><span>Status</span></div>{rows.map(r=><div className="ops-row" key={r.id}><div><b>{r.student?.full_name||r.student_id}</b><small>{r.transaction_reference?`Ref: ${r.transaction_reference}`:'No transaction reference'}</small></div><span>{r.month}</span><span>{money(Number(r.amount))}</span><span className={statusClass(r.status)}>{r.status}</span></div>)}</div>}
  </section>;
}
