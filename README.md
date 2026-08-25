# EduFlow

Modern school management SaaS for administrators, teachers, students and parents.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Netlify is configured through `netlify.toml` to build the Vite app and publish `dist/`, with SPA fallback routing.

## Demo access

The app includes public demo accounts for previewing each role. Demo mode is intentionally read-only when Supabase is not configured.

- Super Admin: `superadmin@demo.eduflow.test`
- Administrator: `admin@demo.eduflow.test`
- Teacher: `teacher@demo.eduflow.test`
- Student: `student@demo.eduflow.test`
- Parent: `parent@demo.eduflow.test`
- Demo password: `Demo@2026!`

## Role workspaces

- **Super Admin:** platform-level school and subscription administration.
- **Administrator:** people, classes, subjects, attendance, academic workflows, reports, billing and school settings.
- **Teacher:** timetable, assignments, submissions, grading, exams, announcements and sign-out.
- **Student:** assignments, submissions, results and report cards.
- **Parent:** linked children, results, report cards, exams and school announcements.

## Database

Supabase migrations live under `supabase/migrations/` and include tenant isolation, role-based access control, academic workflows, commercial controls, school settings and role-portal access policies.

For real school data, configure the variables in `.env.example` before starting the app.
