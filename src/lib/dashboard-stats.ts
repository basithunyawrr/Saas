import { supabase } from './supabase';

const unavailable = () => new Error('Supabase is not configured');

export type DashboardStats = {
  students: number;
  teachers: number;
  classes: number;
  attendanceToday: number;
};

export async function getDashboardStats(): Promise<{ data: DashboardStats | null; error: any }> {
  if (!supabase) return { data: null, error: unavailable() };
  const school = await supabase.rpc('current_school_id');
  if (school.error || !school.data) return { data: null, error: school.error || new Error('School not found') };
  const schoolId = school.data;
  const today = new Date().toISOString().slice(0, 10);
  const [students, teachers, classes, attendance] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('attendance_date', today),
  ]);
  const failure = [students, teachers, classes, attendance].find(r => r.error);
  if (failure?.error) return { data: null, error: failure.error };
  return {
    data: {
      students: students.count || 0,
      teachers: teachers.count || 0,
      classes: classes.count || 0,
      attendanceToday: attendance.count || 0,
    },
    error: null,
  };
}
