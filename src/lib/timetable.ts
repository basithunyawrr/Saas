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

async function schoolAndDay(){
  if(!supabase)return {schoolId:null,weekday:0,error:new Error('Supabase is not configured')};
  const school=await supabase.rpc('current_school_id');
  if(school.error||!school.data)return {schoolId:null,weekday:0,error:school.error||new Error('School not found')};
  return {schoolId:school.data,weekday:new Date().getDay()||7,error:null};
}

export async function getTodayTimetable(){
  const ctx=await schoolAndDay();
  if(ctx.error||!supabase)return {data:null,error:ctx.error};
  return supabase.from('timetable_entries').select('id,class_id,subject_id,teacher_id,weekday,start_time,end_time,room,classes(name,section),subjects(name)').eq('school_id',ctx.schoolId).eq('weekday',ctx.weekday).order('start_time',{ascending:true});
}

export async function getTodayTeacherTimetable(){
  const ctx=await schoolAndDay();
  if(ctx.error||!supabase)return {data:null,error:ctx.error};
  const user=await supabase.auth.getUser();
  if(user.error||!user.data.user)return {data:null,error:user.error||new Error('Not authenticated')};
  return supabase.from('timetable_entries').select('id,class_id,subject_id,teacher_id,weekday,start_time,end_time,room,classes(name,section),subjects(name)').eq('school_id',ctx.schoolId).eq('weekday',ctx.weekday).eq('teacher_id',user.data.user.id).order('start_time',{ascending:true});
}
