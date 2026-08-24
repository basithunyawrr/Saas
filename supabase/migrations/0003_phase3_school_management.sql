-- Phase 3: commercial school/admin/user management
create table if not exists public.school_members (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null check (role <> 'super_admin'),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  unique (school_id, user_id)
);

create index if not exists school_members_school_idx on public.school_members(school_id);
create index if not exists school_members_user_idx on public.school_members(user_id);

create or replace function public.is_active_super_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='super_admin'); $$;

create or replace function public.is_active_school_admin(target_school uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin' and p.school_id=target_school); $$;

create or replace function public.my_role()
returns public.app_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id=auth.uid(); $$;

-- Replace recursive profile policies from the initial foundation with helper-backed policies.
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "super admins manage profiles" on public.profiles;
drop policy if exists "school admins manage school profiles" on public.profiles;

create policy "profiles self or superadmin read" on public.profiles for select using (
  id = auth.uid() or public.is_active_super_admin() or school_id = public.current_school_id()
);
create policy "profiles superadmin manage" on public.profiles for all using (public.is_active_super_admin()) with check (public.is_active_super_admin());
create policy "profiles school admin manage" on public.profiles for all using (
  role <> 'super_admin' and public.is_active_school_admin(school_id)
) with check (
  role <> 'super_admin' and public.is_active_school_admin(school_id)
);

alter table public.school_members enable row level security;
create policy "members read own school" on public.school_members for select using (
  public.is_active_super_admin() or school_id = public.current_school_id()
);
create policy "members superadmin manage" on public.school_members for all using (public.is_active_super_admin()) with check (public.is_active_super_admin());
create policy "members admin manage" on public.school_members for all using (public.is_active_school_admin(school_id)) with check (public.is_active_school_admin(school_id) and role <> 'super_admin');

-- School creation is restricted to super admins or authenticated admins creating their own first school.
drop policy if exists "super admins manage schools" on public.schools;
create policy "schools superadmin manage" on public.schools for all using (public.is_active_super_admin()) with check (public.is_active_super_admin());
create policy "schools members read" on public.schools for select using (id = public.current_school_id());

-- Every new auth user gets a profile. Role/school assignment is deliberately kept server-side.
create or replace function public.handle_auth_user_created()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, phone, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'phone', 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute function public.handle_auth_user_created();

-- Utility function for safe slug creation.
create or replace function public.slugify_school_name(input text)
returns text language sql immutable
as $$ select trim(both '-' from regexp_replace(lower(regexp_replace(coalesce(input,''),'[^a-zA-Z0-9]+','-','g')),'-+','-','g')); $$;
