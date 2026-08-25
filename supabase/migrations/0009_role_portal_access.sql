-- Phase 9: role portal access hardening
-- Parents may read only the profiles of students they are explicitly linked to.
create policy "profiles linked parent read" on public.profiles for select using (
  exists (
    select 1 from public.parent_student_links l
    where l.parent_id=auth.uid()
      and l.student_id=profiles.id
      and l.school_id=profiles.school_id
  )
);

-- Teachers may read student profiles in their current school so grading and
-- classroom workflows can identify learners without exposing other tenants.
create policy "profiles teacher school read" on public.profiles for select using (
  public.is_teacher() and school_id=public.current_school_id()
);

create index if not exists parent_links_parent_student_idx on public.parent_student_links(parent_id,student_id);
create index if not exists teacher_assignments_teacher_class_idx on public.teacher_assignments(teacher_id,class_id);
