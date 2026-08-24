create table if not exists public.school_settings (
  school_id uuid primary key references public.schools(id) on delete cascade,
  contact_email text,
  contact_phone text,
  timezone text not null default 'Asia/Karachi',
  academic_year text,
  updated_at timestamptz not null default now()
);

alter table public.school_settings enable row level security;

create policy "school members read settings" on public.school_settings
  for select using (school_id = public.current_school_id());

create policy "school admins manage settings" on public.school_settings
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.school_id = school_settings.school_id)
  ) with check (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.school_id = school_settings.school_id)
  );
