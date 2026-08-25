-- Phase 10: teacher-scoped academic access and immutable audit coverage

drop policy if exists "profiles teacher school read" on public.profiles;
create policy "profiles teacher students read" on public.profiles for select using (public.is_teacher() and school_id=public.current_school_id() and role='student');

drop policy if exists assignments_read on public.assignments;
create policy assignments_read on public.assignments for select using (
  public.is_active_super_admin()
  or public.can_manage_school(school_id)
  or (public.is_teacher() and school_id=public.current_school_id() and (created_by=auth.uid() or exists(select 1 from public.teacher_assignments ta where ta.teacher_id=auth.uid() and ta.class_id=assignments.class_id and ta.school_id=assignments.school_id)))
  or (public.is_student() and school_id=public.current_school_id() and status='published' and (class_id is null or exists(select 1 from public.student_enrollments se where se.student_id=auth.uid() and se.class_id=assignments.class_id and se.school_id=assignments.school_id and se.active=true)))
);

drop policy if exists assignments_staff_write on public.assignments;
create policy assignments_staff_write on public.assignments for all using (
  public.is_active_super_admin()
  or (public.is_school_admin() and school_id=public.current_school_id())
  or (public.is_teacher() and school_id=public.current_school_id() and (created_by=auth.uid() or exists(select 1 from public.teacher_assignments ta where ta.teacher_id=auth.uid() and ta.class_id=assignments.class_id and ta.school_id=assignments.school_id)))
) with check (
  public.is_active_super_admin()
  or (public.is_school_admin() and school_id=public.current_school_id())
  or (public.is_teacher() and school_id=public.current_school_id() and created_by=auth.uid() and (class_id is null or exists(select 1 from public.teacher_assignments ta where ta.teacher_id=auth.uid() and ta.class_id=assignments.class_id and ta.school_id=assignments.school_id)))
);

drop policy if exists submissions_student_read on public.assignment_submissions;
create policy submissions_student_read on public.assignment_submissions for select using (
  student_id=auth.uid()
  or public.is_active_super_admin()
  or public.can_manage_school(school_id)
  or (public.is_teacher() and school_id=public.current_school_id() and exists(select 1 from public.assignments a where a.id=assignment_submissions.assignment_id and a.school_id=assignment_submissions.school_id and (a.created_by=auth.uid() or exists(select 1 from public.teacher_assignments ta where ta.teacher_id=auth.uid() and ta.class_id=a.class_id and ta.school_id=a.school_id))))
);

drop policy if exists submissions_student_update on public.assignment_submissions;
create policy submissions_student_update on public.assignment_submissions for update using (
  student_id=auth.uid()
  or public.is_active_super_admin()
  or public.can_manage_school(school_id)
  or (public.is_teacher() and school_id=public.current_school_id() and exists(select 1 from public.assignments a where a.id=assignment_submissions.assignment_id and a.school_id=assignment_submissions.school_id and (a.created_by=auth.uid() or exists(select 1 from public.teacher_assignments ta where ta.teacher_id=auth.uid() and ta.class_id=a.class_id and ta.school_id=a.school_id))))
) with check (public.is_active_super_admin() or school_id=public.current_school_id());

-- Teachers only see timetable entries assigned to them; other school roles retain schedule visibility.
drop policy if exists timetable_read on public.timetable_entries;
create policy timetable_read on public.timetable_entries for select using (
  public.is_active_super_admin()
  or (public.is_school_admin() and school_id=public.current_school_id())
  or (public.is_teacher() and school_id=public.current_school_id() and teacher_id=auth.uid())
  or ((public.is_student() or public.is_parent()) and school_id=public.current_school_id())
);

-- Teachers only see and write attendance for classes they are assigned to.
drop policy if exists attendance_read on public.attendance;
create policy attendance_read on public.attendance for select using (
  public.is_active_super_admin()
  or public.can_manage_school(school_id)
  or (public.is_teacher() and school_id=public.current_school_id() and exists(select 1 from public.teacher_assignments ta where ta.teacher_id=auth.uid() and ta.class_id=attendance.class_id and ta.school_id=attendance.school_id))
  or student_id=auth.uid()
  or exists(select 1 from public.parent_student_links l where l.parent_id=auth.uid() and l.student_id=attendance.student_id and l.school_id=attendance.school_id)
);

drop policy if exists attendance_teacher_insert on public.attendance;
create policy attendance_teacher_insert on public.attendance for insert with check (
  (public.is_active_super_admin() or public.is_school_admin() or (public.is_teacher() and exists(select 1 from public.teacher_assignments ta where ta.teacher_id=auth.uid() and ta.class_id=attendance.class_id and ta.school_id=attendance.school_id)))
  and (public.is_active_super_admin() or school_id=public.current_school_id())
);

drop policy if exists attendance_staff_update on public.attendance;
create policy attendance_staff_update on public.attendance for update using (
  public.is_active_super_admin()
  or public.can_manage_school(school_id)
  or (public.is_teacher() and school_id=public.current_school_id() and exists(select 1 from public.teacher_assignments ta where ta.teacher_id=auth.uid() and ta.class_id=attendance.class_id and ta.school_id=attendance.school_id))
) with check (public.is_active_super_admin() or school_id=public.current_school_id());

drop policy if exists attendance_admin_delete on public.attendance;
create policy attendance_admin_delete on public.attendance for delete using (public.is_active_super_admin() or (public.is_school_admin() and school_id=public.current_school_id()));

-- Sensitive academic mutations are captured server-side.
create or replace function public.audit_sensitive_change()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  insert into public.audit_logs(actor_id,school_id,action,target_type,target_id,metadata)
  values(auth.uid(),coalesce(new.school_id,old.school_id),tg_table_name||'.'||lower(tg_op),tg_table_name,coalesce(new.id,old.id),jsonb_build_object('operation',tg_op,'before',to_jsonb(old),'after',to_jsonb(new)));
  if tg_op='DELETE' then return old; else return new; end if;
end;
$$;

drop trigger if exists audit_assignment_submission_change on public.assignment_submissions;
create trigger audit_assignment_submission_change after insert or update or delete on public.assignment_submissions for each row execute function public.audit_sensitive_change();
drop trigger if exists audit_exam_result_change on public.exam_results;
create trigger audit_exam_result_change after insert or update or delete on public.exam_results for each row execute function public.audit_sensitive_change();
drop trigger if exists audit_report_card_change on public.report_cards;
create trigger audit_report_card_change after insert or update or delete on public.report_cards for each row execute function public.audit_sensitive_change();
drop trigger if exists audit_attendance_change on public.attendance;
create trigger audit_attendance_change after insert or update or delete on public.attendance for each row execute function public.audit_sensitive_change();

create index if not exists assignments_class_status_idx on public.assignments(school_id,class_id,status);
create index if not exists submissions_assignment_status_idx on public.assignment_submissions(assignment_id,status);
