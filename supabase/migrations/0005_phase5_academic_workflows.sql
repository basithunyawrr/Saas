create table if not exists public.assignments (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
 title text not null, description text, class_id uuid references public.classes(id) on delete set null,
 subject_id uuid references public.subjects(id) on delete set null, created_by uuid references public.profiles(id) on delete set null,
 due_date date, max_marks numeric(8,2) not null default 100, status text not null default 'published' check(status in ('draft','published','closed')),
 created_at timestamptz not null default now()
);
create table if not exists public.assignment_submissions (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
 assignment_id uuid not null references public.assignments(id) on delete cascade, student_id uuid not null references public.profiles(id) on delete cascade,
 submitted_at timestamptz, content text, marks numeric(8,2), feedback text, status text not null default 'pending' check(status in ('pending','submitted','graded','late')),
 unique(assignment_id,student_id)
);
create table if not exists public.exams (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
 name text not null, term text, exam_date date, description text, status text not null default 'scheduled' check(status in ('draft','scheduled','completed','published')),
 created_at timestamptz not null default now()
);
create table if not exists public.exam_results (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
 exam_id uuid not null references public.exams(id) on delete cascade, student_id uuid not null references public.profiles(id) on delete cascade,
 subject_id uuid not null references public.subjects(id) on delete cascade, marks numeric(8,2) not null default 0, max_marks numeric(8,2) not null default 100,
 grade text, remarks text, unique(exam_id,student_id,subject_id)
);
create table if not exists public.report_cards (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
 student_id uuid not null references public.profiles(id) on delete cascade, term text not null,
 overall_percentage numeric(5,2), overall_grade text, class_rank integer, teacher_remarks text, principal_remarks text,
 published boolean not null default false, published_at timestamptz, created_at timestamptz not null default now(), unique(student_id,term)
);
create table if not exists public.announcements (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
 title text not null, body text not null, audience text not null default 'all' check(audience in ('all','teachers','students','parents','staff')),
 created_by uuid references public.profiles(id) on delete set null, published boolean not null default true, created_at timestamptz not null default now()
);
create index if not exists assignments_school_idx on public.assignments(school_id,created_at desc);
create index if not exists submissions_student_idx on public.assignment_submissions(student_id);
create index if not exists exams_school_idx on public.exams(school_id,exam_date);
create index if not exists results_student_idx on public.exam_results(student_id);
create index if not exists reports_student_idx on public.report_cards(student_id,term);
create index if not exists announcements_school_idx on public.announcements(school_id,created_at desc);

alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.exams enable row level security;
alter table public.exam_results enable row level security;
alter table public.report_cards enable row level security;
alter table public.announcements enable row level security;

create policy assignments_tenant on public.assignments for all using(public.is_super_admin() or school_id=public.current_school_id()) with check(public.is_super_admin() or school_id=public.current_school_id());
create policy submissions_tenant on public.assignment_submissions for all using(public.is_super_admin() or school_id=public.current_school_id()) with check(public.is_super_admin() or school_id=public.current_school_id());
create policy exams_tenant on public.exams for all using(public.is_super_admin() or school_id=public.current_school_id()) with check(public.is_super_admin() or school_id=public.current_school_id());
create policy results_tenant on public.exam_results for all using(public.is_super_admin() or school_id=public.current_school_id()) with check(public.is_super_admin() or school_id=public.current_school_id());
create policy reports_tenant on public.report_cards for all using(public.is_super_admin() or school_id=public.current_school_id()) with check(public.is_super_admin() or school_id=public.current_school_id());
create policy announcements_tenant on public.announcements for all using(public.is_super_admin() or school_id=public.current_school_id()) with check(public.is_super_admin() or school_id=public.current_school_id());
