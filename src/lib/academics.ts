import { supabase } from './supabase';

const missing=()=>new Error('Supabase is not configured');
export const listClasses=()=>supabase?supabase.from('classes').select('id,name,section,room,academic_year_id,created_at').order('name'):Promise.resolve({data:[],error:missing()});
export const createClass=(school_id:string,name:string,section='A',room?:string,academic_year_id?:string)=>supabase?supabase.from('classes').insert({school_id,name,section,room,academic_year_id}).select().single():Promise.reject(missing());
export const listSubjects=()=>supabase?supabase.from('subjects').select('id,name,code,created_at').order('name'):Promise.resolve({data:[],error:missing()});
export const createSubject=(school_id:string,name:string,code?:string)=>supabase?supabase.from('subjects').insert({school_id,name,code}).select().single():Promise.reject(missing());
export const listEnrollments=()=>supabase?supabase.from('student_enrollments').select('id,student_id,class_id,roll_number,active,enrolled_at').order('enrolled_at',{ascending:false}):Promise.resolve({data:[],error:missing()});
export const enrollStudent=(school_id:string,student_id:string,class_id:string,roll_number?:string)=>supabase?supabase.from('student_enrollments').insert({school_id,student_id,class_id,roll_number}).select().single():Promise.reject(missing());
export const listAttendance=(date:string)=>supabase?supabase.from('attendance').select('id,student_id,class_id,attendance_date,status,note,marked_by').eq('attendance_date',date):Promise.resolve({data:[],error:missing()});
export const markAttendance=(row:{school_id:string;student_id:string;class_id:string;attendance_date:string;status:string;marked_by:string;note?:string})=>supabase?supabase.from('attendance').upsert(row,{onConflict:'student_id,attendance_date'}).select().single():Promise.reject(missing());
export const listTimetable=()=>supabase?supabase.from('timetable_entries').select('id,class_id,subject_id,teacher_id,weekday,start_time,end_time,room').order('weekday').order('start_time'):Promise.resolve({data:[],error:missing()});
