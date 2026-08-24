import { supabase } from './supabase';

export async function getReportStats() {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
  const school = await supabase.rpc('current_school_id');
  if (school.error || !school.data) return { data: null, error: school.error || new Error('School not found') };
  const schoolId = school.data;
  const [results, reports] = await Promise.all([
    supabase.from('exam_results').select('marks,max_marks').eq('school_id', schoolId),
    supabase.from('report_cards').select('id,term,academic_year').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(8),
  ]);
  if (results.error) return { data: null, error: results.error };
  if (reports.error) return { data: null, error: reports.error };
  const rows = results.data || [];
  const possible = rows.reduce((n: number, r: any) => n + Number(r.max_marks || 0), 0);
  const earned = rows.reduce((n: number, r: any) => n + Number(r.marks || 0), 0);
  return { data: { passRate: possible ? Math.round((earned / possible) * 100) : 0, resultsCount: rows.length, reports: reports.data || [] }, error: null };
}
