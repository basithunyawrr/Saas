-- Phase 7: production security hardening and plan enforcement

create or replace function public.has_role(p_role public.app_role)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role=p_role); $$;

create or replace function public.is_school_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select public.has_role('admin'); $$;

create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path=public
as $$ select public.has_role('teacher'); $$;

create or replace function public.is_student()
returns boolean language sql stable security definer set search_path=public
as $$ select public.has_role('student'); $$;

create or replace function public.is_parent()
returns boolean language sql stable security definer set search_path=public
as $$ select public.has_role('parent'); $$;

create or replace function public.can_manage_school(p_school_id uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select public.is_active_super_admin() or (public.is_school_admin() and p_school_id=public.current_school_id()); $$;

-- Safe profile visibility.
drop policy if exists "profiles self or superadmin read" on public.profiles;
drop policy if exists "profiles superadmin manage" on public.profiles;
drop policy if exists "profiles school admin manage" on public.profiles;
create policy "profiles self read" on public.profiles for select using (id=auth.uid());
create policy "profiles school management read" on public.profiles for select using (public.can_manage_school(school_id));
create policy "profiles superadmin manage" on public.profiles for all using (public.is_active_super_admin()) with check (public.is_active_super_admin());
create policy "profiles admin manage" on public.profiles for all using (public.is_school_admin() and role<>'super_admin' and school_id=public.current_school_id()) with check (public.is_school_admin() and role<>'super_admin' and school_id=public.current_school_id());

-- Academic years/classes/subjects: only Super Admin or School Admin may write.
drop policy if exists academic_years_school on public.academic_years;
drop policy if exists classes_school on public.classes;
drop policy if exists subjects_school on public.subjects;
create policy academic_years_read on public.academic_years for select using (school_id=public.current_school_id() or public.is_active_super_admin());
create policy academic_years_write on public.academic_years for all using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id));
create policy classes_read on public.classes for select using (school_id=public.current_school_id() or public.is_active_super_admin());
create policy classes_write on public.classes for all using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id));
create policy subjects_read on public.subjects for select using (school_id=public.current_school_id() or public.is_active_super_admin());
create policy subjects_write on public.subjects for all using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id));

-- Membership/enrollment/links.
drop policy if exists "members read own school" on public.school_members;
drop policy if exists "members superadmin manage" on public.school_members;
drop policy if exists "members admin manage" on public.school_members;
create policy members_read on public.school_members for select using (school_id=public.current_school_id() or public.is_active_super_admin());
create policy members_admin_write on public.school_members for all using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id) and role<>'super_admin');

drop policy if exists enrollments_school on public.student_enrollments;
create policy enrollments_read on public.student_enrollments for select using (school_id=public.current_school_id() or public.is_active_super_admin());
create policy enrollments_admin_write on public.student_enrollments for all using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id));

drop policy if exists teacher_assignments_school on public.teacher_assignments;
create policy teacher_assignments_read on public.teacher_assignments for select using (school_id=public.current_school_id() or public.is_active_super_admin());
create policy teacher_assignments_admin_write on public.teacher_assignments for all using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id));

drop policy if exists parent_links_school on public.parent_student_links;
create policy parent_links_self_read on public.parent_student_links for select using (parent_id=auth.uid() or student_id=auth.uid() or public.can_manage_school(school_id));
create policy parent_links_admin_write on public.parent_student_links for all using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id));

-- Attendance: admins/teachers write; students/parents read their applicable records.
drop policy if exists attendance_school on public.attendance;
create policy attendance_read on public.attendance for select using (
  public.is_active_super_admin() or public.can_manage_school(school_id) or student_id=auth.uid() or
  exists(select 1 from public.parent_student_links l where l.parent_id=auth.uid() and l.student_id=attendance.student_id and l.school_id=attendance.school_id)
);
create policy attendance_teacher_insert on public.attendance for insert with check (
  (public.is_active_super_admin() or public.is_school_admin() or public.is_teacher()) and
  (public.is_active_super_admin() or school_id=public.current_school_id())
);
create policy attendance_staff_update on public.attendance for update using (
  (public.is_active_super_admin() or public.is_school_admin() or public.is_teacher()) and
  (public.is_active_super_admin() or school_id=public.current_school_id())
) with check (public.is_active_super_admin() or school_id=public.current_school_id());
create policy attendance_admin_delete on public.attendance for delete using (public.is_active_super_admin() or (public.is_school_admin() and school_id=public.current_school_id()));

-- Timetable is admin-managed and school-readable.
drop policy if exists timetable_school on public.timetable_entries;
create policy timetable_read on public.timetable_entries for select using (school_id=public.current_school_id() or public.is_active_super_admin());
create policy timetable_write on public.timetable_entries for all using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id));

-- Assignments: teachers/admins manage; students read and submit.
drop policy if exists assignments_tenant on public.assignments;
create policy assignments_read on public.assignments for select using (school_id=public.current_school_id() or public.is_active_super_admin());
create policy assignments_staff_write on public.assignments for all using (
  public.is_active_super_admin() or public.is_school_admin() or (public.is_teacher() and school_id=public.current_school_id())
) with check (public.is_active_super_admin() or public.is_school_admin() or (public.is_teacher() and school_id=public.current_school_id()));

drop policy if exists submissions_tenant on public.assignment_submissions;
create policy submissions_student_read on public.assignment_submissions for select using (
  student_id=auth.uid() or public.is_active_super_admin() or public.can_manage_school(school_id) or (public.is_teacher() and school_id=public.current_school_id())
);
create policy submissions_student_insert on public.assignment_submissions for insert with check (student_id=auth.uid() and school_id=public.current_school_id());
create policy submissions_student_update on public.assignment_submissions for update using (
  student_id=auth.uid() or public.is_active_super_admin() or (public.is_school_admin() and school_id=public.current_school_id()) or (public.is_teacher() and school_id=public.current_school_id())
) with check (public.is_active_super_admin() or school_id=public.current_school_id());
create policy submissions_staff_delete on public.assignment_submissions for delete using (public.is_active_super_admin() or (public.is_school_admin() and school_id=public.current_school_id()));

-- Exams/results/report cards.
drop policy if exists exams_tenant on public.exams;
create policy exams_read on public.exams for select using (school_id=public.current_school_id() or public.is_active_super_admin());
create policy exams_staff_write on public.exams for all using (
  public.is_active_super_admin() or (public.is_school_admin() and school_id=public.current_school_id()) or (public.is_teacher() and school_id=public.current_school_id())
) with check (public.is_active_super_admin() or school_id=public.current_school_id());

drop policy if exists results_tenant on public.exam_results;
create policy results_read on public.exam_results for select using (
  public.is_active_super_admin() or public.can_manage_school(school_id) or (student_id=auth.uid()) or
  exists(select 1 from public.parent_student_links l where l.parent_id=auth.uid() and l.student_id=exam_results.student_id and l.school_id=exam_results.school_id)
);
create policy results_staff_write on public.exam_results for all using (
  public.is_active_super_admin() or (public.is_school_admin() and school_id=public.current_school_id()) or (public.is_teacher() and school_id=public.current_school_id())
) with check (public.is_active_super_admin() or school_id=public.current_school_id());

drop policy if exists reports_tenant on public.report_cards;
create policy reports_read on public.report_cards for select using (
  public.is_active_super_admin() or public.can_manage_school(school_id) or (student_id=auth.uid() and published=true) or
  exists(select 1 from public.parent_student_links l where l.parent_id=auth.uid() and l.student_id=report_cards.student_id and l.school_id=report_cards.school_id and report_cards.published=true)
);
create policy reports_staff_write on public.report_cards for all using (
  public.is_active_super_admin() or (public.is_school_admin() and school_id=public.current_school_id()) or (public.is_teacher() and school_id=public.current_school_id())
) with check (public.is_active_super_admin() or school_id=public.current_school_id());

-- Announcements: staff publish; school members read published items.
drop policy if exists announcements_tenant on public.announcements;
create policy announcements_read on public.announcements for select using ((school_id=public.current_school_id() and published=true) or public.is_active_super_admin() or public.can_manage_school(school_id));
create policy announcements_staff_write on public.announcements for all using (
  public.is_active_super_admin() or (public.is_school_admin() and school_id=public.current_school_id()) or (public.is_teacher() and school_id=public.current_school_id())
) with check (public.is_active_super_admin() or school_id=public.current_school_id());

-- Commercial data privacy.
drop policy if exists "school admins read subscription" on public.school_subscriptions;
create policy subscription_read on public.school_subscriptions for select using (school_id=public.current_school_id() or public.is_active_super_admin());
drop policy if exists "school admins read usage" on public.usage_snapshots;
create policy usage_read on public.usage_snapshots for select using (school_id=public.current_school_id() or public.is_active_super_admin());
drop policy if exists "school members read onboarding" on public.onboarding_progress;
create policy onboarding_read on public.onboarding_progress for select using (school_id=public.current_school_id() or public.is_active_super_admin());
drop policy if exists "school admins update onboarding" on public.onboarding_progress;
create policy onboarding_manage on public.onboarding_progress for all using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id));

-- Central plan limit enforcement.
create or replace function public.assert_school_limit(p_school_id uuid, p_metric text)
returns boolean language plpgsql security definer set search_path=public
as $$
declare
  limit_value integer;
  current_count integer;
begin
  select case p_metric when 'students' then pc.max_students when 'teachers' then pc.max_teachers when 'classes' then pc.max_classes end
    into limit_value
  from public.school_subscriptions ss join public.plan_catalog pc on pc.id=ss.plan_id
  where ss.school_id=p_school_id and ss.status in ('trial','active');
  if limit_value is null then return true; end if;
  if p_metric='students' then select count(*) into current_count from public.profiles where school_id=p_school_id and role='student';
  elsif p_metric='teachers' then select count(*) into current_count from public.profiles where school_id=p_school_id and role='teacher';
  elsif p_metric='classes' then select count(*) into current_count from public.classes where school_id=p_school_id;
  else raise exception 'Unknown plan metric'; end if;
  if current_count >= limit_value then raise exception 'Plan limit reached for %', p_metric using errcode='P0001'; end if;
  return true;
end;
$$;

create or replace function public.enforce_profile_plan_limit()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if new.school_id is not null and new.role in ('student','teacher') then
    if tg_op='INSERT' or (old.school_id is distinct from new.school_id or old.role is distinct from new.role) then perform public.assert_school_limit(new.school_id,case when new.role='student' then 'students' else 'teachers' end); end if;
  end if;
  return new;
end;
$$;
drop trigger if exists enforce_profile_plan_limit on public.profiles;
create trigger enforce_profile_plan_limit before insert or update of school_id,role on public.profiles for each row execute function public.enforce_profile_plan_limit();

create or replace function public.enforce_class_plan_limit()
returns trigger language plpgsql security definer set search_path=public
as $$ begin perform public.assert_school_limit(new.school_id,'classes'); return new; end; $$;
drop trigger if exists enforce_class_plan_limit on public.classes;
create trigger enforce_class_plan_limit before insert on public.classes for each row execute function public.enforce_class_plan_limit();

create index if not exists audit_logs_school_created_idx on public.audit_logs(school_id,created_at desc);
create index if not exists audit_logs_actor_created_idx on public.audit_logs(actor_id,created_at desc);
create index if not exists profiles_school_role_idx on public.profiles(school_id,role);
create index if not exists subscriptions_status_idx on public.school_subscriptions(status,trial_ends_at);
create index if not exists usage_school_captured_idx on public.usage_snapshots(school_id,captured_at desc);
