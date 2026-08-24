import { supabase } from './supabase';

export type TimetableEntry = {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string | null;
  weekday: number;
  start_time: string;
  end_time: string;
  room: string | null;
  classes?: { name: string; section: string } | null;
  subjects?: { name: string } | null;
};

export async function getTodayTimetable() {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') };
  const school = await supabase.rpc('current_school_id');
  if (school.error || !school.data) return { data: null, error: school.error || new Error('School not found') };
  const weekday = new Date().getDay() || 7;
  return supabase
    .from('timetable_entries')
    .select('id,class_id,subject_id,teacher_id,weekday,start_time,end_time,room,classes(name,section),subjects(name)')
    .eq('school_id', school.data)
    .eq('weekday', weekday)
    .order('start_time', { ascending: true });
}
