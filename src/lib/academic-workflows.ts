import { supabase } from './supabase';
const unavailable=()=>({data:[],error:new Error('Supabase is not configured')});
export async function listAssignments(){if(!supabase)return unavailable();return supabase.from('assignments').select('*').order('created_at',{ascending:false});}
export async function createAssignment(input:any){if(!supabase)throw new Error('Supabase is not configured');return supabase.from('assignments').insert(input).select().single();}
export async function listSubmissions(){if(!supabase)return unavailable();return supabase.from('assignment_submissions').select('*').order('submitted_at',{ascending:false});}
export async function submitAssignment(input:any){if(!supabase)throw new Error('Supabase is not configured');return supabase.from('assignment_submissions').upsert(input,{onConflict:'assignment_id,student_id'}).select().single();}
export async function gradeSubmission(id:string,marks:number,feedback?:string){if(!supabase)throw new Error('Supabase is not configured');return supabase.from('assignment_submissions').update({marks,feedback,status:'graded'}).eq('id',id).select().single();}
export async function listExams(){if(!supabase)return unavailable();return supabase.from('exams').select('*').order('exam_date',{ascending:true});}
export async function createExam(input:any){if(!supabase)throw new Error('Supabase is not configured');return supabase.from('exams').insert(input).select().single();}
export async function listResults(studentId?:string){if(!supabase)return unavailable();let q=supabase.from('exam_results').select('*').order('id');if(studentId)q=q.eq('student_id',studentId);return q;}
export async function saveExamResult(input:any){if(!supabase)throw new Error('Supabase is not configured');return supabase.from('exam_results').upsert(input,{onConflict:'exam_id,student_id,subject_id'}).select().single();}
export async function listReportCards(studentId?:string){if(!supabase)return unavailable();let q=supabase.from('report_cards').select('*').order('created_at',{ascending:false});if(studentId)q=q.eq('student_id',studentId);return q;}
export async function saveReportCard(input:any){if(!supabase)throw new Error('Supabase is not configured');return supabase.from('report_cards').upsert(input,{onConflict:'student_id,term'}).select().single();}
export async function listAnnouncements(){if(!supabase)return unavailable();return supabase.from('announcements').select('*').order('created_at',{ascending:false});}
export async function createAnnouncement(input:any){if(!supabase)throw new Error('Supabase is not configured');return supabase.from('announcements').insert(input).select().single();}
