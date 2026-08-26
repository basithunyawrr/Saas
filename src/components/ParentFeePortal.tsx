import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, Loader2, Upload, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Challan = { id:string; student_id:string; school_id:string; month:string; amount:number; status:'pending'|'submitted'|'verified'|'rejected'; transaction_reference:string|null; payment_proof_url:string|null; created_at:string };
type Bank = { bank_name:string; account_title:string; account_number:string; iban:string|null };

const money=(n:number)=>new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:0}).format(n);

export function ParentFeePortal(){
  const [rows,setRows]=useState<Challan[]>([]),[bank,setBank]=useState<Bank|null>(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [selected,setSelected]=useState<Challan|null>(null),[reference,setReference]=useState(''),[note,setNote]=useState('');

  const load=async()=>{setLoading(true);setError('');try{
    if(!supabase)throw new Error('Supabase is not configured.');
    const {data:user,error:userError}=await supabase.auth.getUser();if(userError)throw userError;if(!user)throw new Error('Please sign in first.');
    const {data:profile,error:profileError}=await supabase.from('profiles').select('id,school_id,role').eq('id',user.id).maybeSingle();if(profileError)throw profileError;
    if(!profile?.school_id||!['parent','student'].includes(profile.role))throw new Error('This portal is available to parents and students only.');
    let studentIds:string[]=[];
    if(profile.role==='student')studentIds=[profile.id];
    else{const {data:links,error:linkError}=await supabase.from('student_parents').select('student_id').eq('parent_id',profile.id);if(linkError)throw linkError;studentIds=(links||[]).map(x=>x.student_id);}
    if(studentIds.length){const {data,error:challanError}=await supabase.from('fee_challans').select('id,student_id,school_id,month,amount,status,transaction_reference,payment_proof_url,created_at').in('student_id',studentIds).eq('school_id',profile.school_id).order('month',{ascending:false});if(challanError)throw challanError;setRows((data||[]) as Challan[]);}
    else setRows([]);
    const {data:bankData,error:bankError}=await supabase.from('school_bank_accounts').select('bank_name,account_title,account_number,iban').eq('school_id',profile.school_id).maybeSingle();if(bankError)throw bankError;setBank(bankData);
  }catch(e){setError(e instanceof Error?e.message:'Unable to load fee portal.');}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);

  const open=(c:Challan)=>{setSelected(c);setReference(c.transaction_reference||'');setNote('');setError('');setMessage('')};
  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!selected||!reference.trim())return;setSaving(true);setError('');setMessage('');try{
    if(!supabase)throw new Error('Supabase is not configured.');
    const {data,error:updateError}=await supabase.from('fee_challans').update({transaction_reference:reference.trim(),payment_proof_url:note.trim()||null,status:'submitted'}).eq('id',selected.id).eq('status','pending').select('id,student_id,school_id,month,amount,status,transaction_reference,payment_proof_url,created_at').maybeSingle();
    if(updateError)throw updateError;if(!data)throw new Error('This challan has already been submitted or changed.');
    setRows(old=>old.map(x=>x.id===data.id?data as Challan:x));setSelected(null);setMessage('Payment proof submitted for verification.');
  }catch(e){setError(e instanceof Error?e.message:'Unable to submit payment proof.');}finally{setSaving(false)}};

  if(loading)return <section className="ops"><div className="empty-state"><Loader2 className="spin"/> Loading fee portal…</div></section>;
  return <section className="ops">
    <div className="ops-head"><div><span className="eyebrow">FAMILY PORTAL</span><h2>Fee payments</h2><p>View your challans, payment instructions, and submission status.</p></div></div>
    {error&&<div className="ops-error"><AlertCircle size={15}/>{error}</div>}{message&&<div className="ops-success"><CheckCircle2 size={15}/>{message}</div>}
    <div className="panel"><div className="panel-head"><b><Building2 size={16}/> School bank details</b></div>{bank?<div className="form-grid"><div><small>Bank Name</small><b>{bank.bank_name}</b></div><div><small>Account Title</small><b>{bank.account_title}</b></div><div><small>Account Number</small><b>{bank.account_number}</b></div><div><small>IBAN</small><b>{bank.iban||'Not provided'}</b></div></div>:<div className="empty-state"><Building2 size={20}/> Bank details have not been configured by the school.</div>}</div>
    <div className="ops-table" style={{marginTop:18}}>{rows.length===0?<div className="empty-state"><Wallet size={24}/><b>No fee challans found</b></div>:rows.map(c=><div className="ops-row" key={c.id}><div><b>{c.month}</b><small>{money(Number(c.amount))}</small></div><span className={`status ${c.status}`}>{c.status}</span>{c.status==='pending'?<button className="primary" onClick={()=>open(c)}>Submit Payment Proof</button>:<span>{c.status==='verified'?'Payment verified':'Under review'}</span>}</div>)}</div>
    {selected&&<div className="modal-back"><div className="login"><button className="x" onClick={()=>setSelected(null)}>×</button><h2>Submit payment proof</h2><p>{selected.month} · {money(Number(selected.amount))}</p><form onSubmit={submit}><label>Transaction reference<input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Bank transaction/reference number" required/></label><label>Receipt note / proof URL<textarea rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional receipt note or uploaded proof URL"/></label><button className="primary big full" disabled={saving||!reference.trim()}>{saving?<><Loader2 size={15} className="spin"/> Submitting…</>:<><Upload size={15}/> Submit Payment Proof</>}</button></form></div></div>}
  </section>;
}
