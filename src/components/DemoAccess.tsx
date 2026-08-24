import React from 'react';

const accounts = [
  ['Super Admin','superadmin@demo.eduflow.test','Demo@2026!'],
  ['School Admin','admin@demo.eduflow.test','Demo@2026!'],
  ['Teacher','teacher@demo.eduflow.test','Demo@2026!'],
  ['Student','student@demo.eduflow.test','Demo@2026!'],
];

export function DemoAccess(){return <section className="demo-access" id="demo"><div className="demo-access-inner"><div className="demo-access-heading"><span className="eyebrow">LIVE DEMO</span><h2>Try every EduFlow role instantly.</h2><p>Use these public demo credentials to explore the platform. Demo accounts contain sample data and are completely separate from real school accounts.</p></div><div className="demo-account-grid">{accounts.map(([role,email,password])=><article className="demo-account" key={email}><strong>{role}</strong><div><small>Email</small><code>{email}</code></div><div><small>Password</small><code>{password}</code></div></article>)}</div><div className="demo-access-note">Demo credentials are intentionally public. Do not use them for real school data.</div></div></section>}
