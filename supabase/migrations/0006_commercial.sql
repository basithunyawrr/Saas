create table if not exists public.plan_catalog (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  monthly_price numeric(12,2) not null default 0,
  annual_price numeric(12,2) not null default 0,
  max_students integer,
  max_teachers integer,
  max_classes integer,
  features jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.school_subscriptions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  plan_id uuid not null references public.plan_catalog(id),
  status text not null default 'trial' check (status in ('trial','active','past_due','cancelled','paused')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly','annual')),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique(school_id)
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete set null,
  event_type text not null,
  provider text,
  provider_event_id text,
  amount numeric(12,2),
  currency text default 'USD',
  status text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(provider,provider_event_id)
);

create table if not exists public.usage_snapshots (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  students_count integer not null default 0,
  teachers_count integer not null default 0,
  classes_count integer not null default 0,
  storage_bytes bigint not null default 0,
  captured_at timestamptz not null default now()
);

create table if not exists public.onboarding_progress (
  school_id uuid primary key references public.schools(id) on delete cascade,
  completed_steps jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.school_has_feature(p_feature text)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(
  select 1 from public.school_subscriptions ss join public.plan_catalog pc on pc.id=ss.plan_id
  where ss.school_id=public.current_school_id() and ss.status in ('trial','active') and coalesce((pc.features->>p_feature)::boolean,false)
); $$;

alter table public.plan_catalog enable row level security;
alter table public.school_subscriptions enable row level security;
alter table public.billing_events enable row level security;
alter table public.usage_snapshots enable row level security;
alter table public.onboarding_progress enable row level security;

create policy "plans are publicly readable" on public.plan_catalog for select using (active=true or public.is_super_admin());
create policy "school admins read subscription" on public.school_subscriptions for select using (school_id=public.current_school_id() or public.is_super_admin());
create policy "super admins manage subscriptions" on public.school_subscriptions for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super admins read billing events" on public.billing_events for select using (public.is_super_admin());
create policy "school admins read usage" on public.usage_snapshots for select using (school_id=public.current_school_id() or public.is_super_admin());
create policy "school members read onboarding" on public.onboarding_progress for select using (school_id=public.current_school_id() or public.is_super_admin());
create policy "school admins update onboarding" on public.onboarding_progress for all using (school_id=public.current_school_id()) with check (school_id=public.current_school_id());

insert into public.plan_catalog(code,name,description,monthly_price,annual_price,max_students,max_teachers,max_classes,features)
values
('starter','Starter','For small schools',19,190,250,25,20,'{"attendance":true,"assignments":true,"reports":true,"announcements":true,"analytics":false}'),
('growth','Growth','For growing schools',49,490,1000,100,75,'{"attendance":true,"assignments":true,"reports":true,"announcements":true,"analytics":true}'),
('enterprise','Enterprise','For larger school groups',99,990,null,null,null,'{"attendance":true,"assignments":true,"reports":true,"announcements":true,"analytics":true,"priority_support":true,"sso":true}')
on conflict (code) do nothing;
