import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Loader2, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BankAccount {
  id?: string;
  school_id: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
}

const emptyAccount: BankAccount = {
  school_id: '', bank_name: '', account_title: '', account_number: '', iban: '',
};

export function SchoolBankSettings() {
  const [account, setAccount] = useState<BankAccount>(emptyAccount);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) throw new Error('Please sign in as a school administrator.');
        const { data: profile, error: profileError } = await supabase
          .from('profiles').select('school_id,role').eq('id', userData.user.id).maybeSingle();
        if (profileError) throw profileError;
        if (!profile?.school_id || !['admin', 'super_admin'].includes(profile.role)) {
          throw new Error('You do not have permission to manage bank details.');
        }
        const { data, error: bankError } = await supabase
          .from('school_bank_accounts')
          .select('id,school_id,bank_name,account_title,account_number,iban')
          .eq('school_id', profile.school_id).maybeSingle();
        if (bankError) throw bankError;
        if (active) setAccount(data || { ...emptyAccount, school_id: profile.school_id });
      } catch (e) { if (active) setError(e instanceof Error ? e.message : 'Unable to load bank details.'); }
      finally { if (active) setLoading(false); }
    };
    load(); return () => { active = false; };
  }, []);

  const update = (field: keyof BankAccount, value: string) => setAccount(a => ({ ...a, [field]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMessage('');
    if (!account.bank_name.trim() || !account.account_title.trim() || !account.account_number.trim()) {
      setError('Bank name, account title, and account number are required.'); return;
    }
    if (account.iban && !/^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(account.iban.replace(/\s/g, '').toUpperCase())) {
      setError('Please enter a valid Pakistani IBAN or leave it blank.'); return;
    }
    setSaving(true);
    try {
      if (!supabase) throw new Error('Supabase is not configured.');
      const payload = { school_id: account.school_id, bank_name: account.bank_name.trim(), account_title: account.account_title.trim(), account_number: account.account_number.trim(), iban: account.iban.trim().toUpperCase() || null };
      const query = account.id
        ? supabase.from('school_bank_accounts').update(payload).eq('id', account.id).eq('school_id', account.school_id).select('id,school_id,bank_name,account_title,account_number,iban').single()
        : supabase.from('school_bank_accounts').insert(payload).select('id,school_id,bank_name,account_title,account_number,iban').single();
      const { data, error: saveError } = await query;
      if (saveError) throw saveError;
      setAccount(data); setMessage('Bank details saved successfully.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save bank details.'); }
    finally { setSaving(false); }
  };

  if (loading) return <section className="ops"><div className="empty-state"><Loader2 className="spin"/> Loading bank settings…</div></section>;

  return <section className="ops">
    <div className="ops-head"><div><span className="eyebrow">SCHOOL SETTINGS</span><h2>Bank account details</h2><p>Official payment details shown to parents and students for fee payments.</p></div></div>
    {error && <div className="ops-error"><AlertCircle size={15}/>{error}</div>}
    {message && <div className="ops-success"><CheckCircle2 size={15}/>{message}</div>}
    <form onSubmit={save} className="panel" style={{maxWidth:760}}>
      <div className="panel-head"><b><Building2 size={16}/> Official payment account</b><span>Secure</span></div>
      <div className="form-grid">
        <label>Bank Name<input value={account.bank_name} onChange={e=>update('bank_name',e.target.value)} placeholder="e.g. Meezan Bank" required /></label>
        <label>Account Title<input value={account.account_title} onChange={e=>update('account_title',e.target.value)} placeholder="School account title" required /></label>
        <label>Account Number<input value={account.account_number} onChange={e=>update('account_number',e.target.value)} placeholder="Account number" required /></label>
        <label>IBAN<input value={account.iban} onChange={e=>update('iban',e.target.value)} placeholder="PK00 XXXX 0000 0000 0000 0000" /></label>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}><button className="primary" type="submit" disabled={saving}>{saving?<><Loader2 size={15} className="spin"/> Saving…</>:<><Save size={15}/> Save bank details</>}</button></div>
    </form>
  </section>;
}
