import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) return json({ error: 'Server configuration is incomplete' }, 500);

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user) return json({ error: 'Unauthorized' }, 401);

    const { data: actor } = await adminClient.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (actor?.role !== 'super_admin') return json({ error: 'Only Super Admin can create Admin accounts' }, 403);

    const body = await req.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const fullName = String(body.full_name ?? '').trim();
    const phone = String(body.phone ?? '').trim() || null;
    const schoolId = body.school_id ? String(body.school_id) : null;

    if (!email || !password || !fullName) return json({ error: 'Full name, email and password are required' }, 400);
    if (password.length < 10) return json({ error: 'Temporary password must be at least 10 characters' }, 400);

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName, phone } });
    if (createError) {
      const duplicate = /already|exists|registered/i.test(createError.message);
      return json({ error: duplicate ? 'An account with this email already exists' : createError.message }, duplicate ? 409 : 400);
    }
    if (!created.user) return json({ error: 'Unable to create account' }, 500);

    const { error: profileError } = await adminClient.from('profiles').upsert({ id: created.user.id, full_name: fullName, phone, role: 'admin', school_id: schoolId, updated_at: new Date().toISOString() });
    if (profileError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: 'Admin profile could not be created' }, 500);
    }

    if (schoolId) await adminClient.from('school_members').upsert({ school_id: schoolId, user_id: created.user.id, role: 'admin', status: 'active' }, { onConflict: 'school_id,user_id' });
    await adminClient.from('audit_logs').insert({ actor_id: user.id, school_id: schoolId, action: 'admin.created', target_type: 'profile', target_id: created.user.id, metadata: { email } });

    return json({ user_id: created.user.id, message: 'Admin account created' }, 201);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected server error' }, 500);
  }
});
