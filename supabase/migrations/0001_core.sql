create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin','admin','teacher','student','parent');

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.app_role not null default 'student',
  school_id uuid references public.schools(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  school_id uuid references public.schools(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'super_admin'); $$;

create or replace function public.current_school_id()
returns uuid language sql stable security definer set search_path = public
as $$ select school_id from public.profiles where id = auth.uid(); $$;

create policy "super admins manage schools" on public.schools for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "members read own school" on public.schools for select using (id = public.current_school_id());

create policy "users read own profile" on public.profiles for select using (id = auth.uid());
create policy "super admins manage profiles" on public.profiles for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "school admins manage school profiles" on public.profiles for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.school_id = profiles.school_id)
) with check (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.school_id = profiles.school_id)
);

create policy "super admins read audit logs" on public.audit_logs for select using (public.is_super_admin());
create policy "authenticated users write audit logs" on public.audit_logs for insert with check (actor_id = auth.uid());
