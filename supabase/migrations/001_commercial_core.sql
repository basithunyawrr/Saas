-- EduFlow commercial foundation: multi-tenant school management
create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin','admin','teacher','student','parent');

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  email text,
  phone text,
  address text,
  city text,
  country text,
  website text,
  logo_url text,
  status text not null default 'active' check (status in ('active','inactive','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  role public.app_role not null default 'student',
  school_id uuid references public.schools(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  section text not null default 'A',
  class_teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(school_id,name,section)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text,
  description text,
  created_at timestamptz not null default now(),
  unique(school_id,name)
);

create table if not exists public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  active boolean not null default true,
  unique(student_id, class_id)
);

create table if not exists public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(teacher_id,class_id,subject_id)
);

create table if not exists public.parent_student (
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  primary key(parent_id,student_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  marked_by uuid not null references public.profiles(id) on delete restrict,
  attendance_date date not null,
  status text not null check (status in ('present','absent','late','excused')),
  note text,
  created_at timestamptz not null default now(),
  unique(student_id,attendance_date)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists profiles_school_role_idx on public.profiles(school_id,role);
create index if not exists classes_school_idx on public.classes(school_id);
create index if not exists subjects_school_idx on public.subjects(school_id);
create index if not exists enrollments_school_idx on public.student_enrollments(school_id);
create index if not exists attendance_school_date_idx on public.attendance(school_id,attendance_date);
create index if not exists audit_school_date_idx on public.audit_logs(school_id,created_at desc);

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='super_admin' and status='active'); $$;

create or replace function public.current_school_id() returns uuid
language sql stable security definer set search_path=public
as $$ select school_id from public.profiles where id=auth.uid() and status='active' limit 1; $$;

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.student_enrollments enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.parent_student enable row level security;
alter table public.attendance enable row level security;
alter table public.audit_logs enable row level security;

create policy schools_read on public.schools for select using (public.is_super_admin() or id=public.current_school_id());
create policy schools_manage on public.schools for all using (public.is_super_admin() or id=public.current_school_id()) with check (public.is_super_admin() or id=public.current_school_id());

create policy profiles_read on public.profiles for select using (public.is_super_admin() or id=auth.uid() or school_id=public.current_school_id());
create policy profiles_manage on public.profiles for all using (public.is_super_admin() or (school_id=public.current_school_id() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin' and p.status='active'))) with check (public.is_super_admin() or (school_id=public.current_school_id() and role <> 'super_admin'));

create policy classes_tenant on public.classes for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy subjects_tenant on public.subjects for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy enrollments_tenant on public.student_enrollments for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy assignments_tenant on public.teacher_assignments for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy parent_links_tenant on public.parent_student for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy attendance_tenant on public.attendance for all using (public.is_super_admin() or school_id=public.current_school_id()) with check (public.is_super_admin() or school_id=public.current_school_id());
create policy audit_read on public.audit_logs for select using (public.is_super_admin() or school_id=public.current_school_id());
create policy audit_insert on public.audit_logs for insert with check (public.is_super_admin() or school_id=public.current_school_id());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public
as $$
begin
  insert into public.profiles(id,email,full_name) values (new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict (id) do update set email=excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
