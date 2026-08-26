-- EduFlow fee challans and school bank accounts
create table if not exists public.school_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  bank_name text not null,
  account_title text not null,
  account_number text not null,
  iban text,
  created_at timestamptz not null default now()
);

create table if not exists public.fee_challans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null,
  month text not null,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'submitted', 'verified', 'rejected')),
  transaction_reference text,
  payment_proof_url text,
  created_at timestamptz not null default now()
);

alter table public.school_bank_accounts enable row level security;
alter table public.fee_challans enable row level security;

-- Helper predicates are based on the authenticated user's profile.
-- Admins are scoped to their own school.
create policy "admins manage school bank accounts"
on public.school_bank_accounts
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
      and p.school_id = school_bank_accounts.school_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
      and p.school_id = school_bank_accounts.school_id
  )
);

create policy "students and parents view school bank accounts"
on public.school_bank_accounts
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.school_id = school_bank_accounts.school_id
      and p.role in ('student', 'parent')
  )
);

create policy "admins manage school fee challans"
on public.fee_challans
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
      and p.school_id = fee_challans.school_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
      and p.school_id = fee_challans.school_id
  )
);

create policy "students and parents view own fee challans"
on public.fee_challans
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
      and p.id = fee_challans.student_id
  )
  or exists (
    select 1
    from public.profiles parent
    join public.student_parents sp on sp.parent_id = parent.id
    where parent.id = auth.uid()
      and parent.role = 'parent'
      and sp.student_id = fee_challans.student_id
  )
);

create policy "students and parents update own fee challans"
on public.fee_challans
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
      and p.id = fee_challans.student_id
  )
  or exists (
    select 1
    from public.profiles parent
    join public.student_parents sp on sp.parent_id = parent.id
    where parent.id = auth.uid()
      and parent.role = 'parent'
      and sp.student_id = fee_challans.student_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
      and p.id = fee_challans.student_id
  )
  or exists (
    select 1
    from public.profiles parent
    join public.student_parents sp on sp.parent_id = parent.id
    where parent.id = auth.uid()
      and parent.role = 'parent'
      and sp.student_id = fee_challans.student_id
  )
);

create index if not exists idx_school_bank_accounts_school_id on public.school_bank_accounts(school_id);
create index if not exists idx_fee_challans_school_id on public.fee_challans(school_id);
create index if not exists idx_fee_challans_student_id on public.fee_challans(student_id);
create index if not exists idx_fee_challans_status on public.fee_challans(status);
