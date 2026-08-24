import { supabase } from './supabase';

export type SchoolSettings = {
  school_id: string;
  contact_email: string | null;
  contact_phone: string | null;
  timezone: string;
  academic_year: string | null;
  updated_at?: string;
};

export async function getSchoolSettings() {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
  const school = await supabase.rpc('current_school_id');
  if (school.error || !school.data) return { data: null, error: school.error || new Error('School not found') };
  return supabase.from('school_settings').select('*').eq('school_id', school.data).maybeSingle();
}

export async function saveSchoolSettings(values: Partial<Omit<SchoolSettings, 'school_id' | 'updated_at'>>) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
  const school = await supabase.rpc('current_school_id');
  if (school.error || !school.data) return { data: null, error: school.error || new Error('School not found') };
  return supabase.from('school_settings').upsert({ school_id: school.data, ...values, updated_at: new Date().toISOString() }, { onConflict: 'school_id' }).select().single();
}
