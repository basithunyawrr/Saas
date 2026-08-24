create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  name text not null, start_date date, end_date date, is_current boolean not null default false, created_at timestamptz not null default now(),
  unique(school_id,name)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid references public.academic_years(id) on delete set null, name text not null, section text not null default 'A', room text,
  created_at timestamptz not null default now(), unique(school_id,academic_year_id,name,section)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  name text not null, code text, created_at timestamptz not null default now(), unique(school_id,name)
);

create table if not exists public.student_enrollments (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  roll_number text, enrolled_at timestamptz not null default now(), active boolean not null default true,
  unique(student_id,class_id)
);

create table if not exists public.teacher_assignments (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(), unique(teacher_id,class_id,subject_id)
);

create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  relationship text, created_at timestamptz not null default now(), unique(parent_id,student_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  attendance_date date not null, status text not null check(status in ('present','absent','late','excused')),
  marked_by uuid not null references public.profiles(id) on delete restrict, note text, created_at timestamptz not null default now(),
  unique(student_id,attendance_date)
);

create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade, subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null, weekday smallint not null check(weekday between 1 and 7), start_time time not null,
  end_time time not null, room text, created_at timestamptz not null default now()
);

create index if not exists classes_school_idx on public.classes(school_id);
create index if not exists subjects_school_idx on public.subjects(school_id);
create index if not exists enrollments_school_idx on public.student_enrollments(school_id);
create index if not exists attendance_school_date_idx on public.attendance(school_id,attendance_date);
create index if not exists timetable_school_day_idx on public.timetable_entries(school_id,weekday,start_time);

alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.student_enrollments enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.parent_student_links enable row level security;
alter table public.attendance enable row level security;
alter table public.timetable_entries enable row level security;

create policy academic_years_school on public.academic_years for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy classes_school on public.classes for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy subjects_school on public.subjects for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy enrollments_school on public.student_enrollments for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy teacher_assignments_school on public.teacher_assignments for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy parent_links_school on public.parent_student_links for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy attendance_school on public.attendance for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy timetable_school on public.timetable_entries for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
