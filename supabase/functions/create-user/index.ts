import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const auth = req.headers.get('Authorization');
    if (!auth) return json({ error: 'Unauthorized' }, 401);

    const adminClient = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const token = auth.replace(/^Bearer\s+/i, '');
    const { data: { user: caller }, error: callerError } = await adminClient.auth.getUser(token);
    if (callerError || !caller) return json({ error: 'Unauthorized' }, 401);

    const { data: actor } = await adminClient.from('profiles').select('id,role,status,school_id').eq('id', caller.id).single();
    if (!actor || actor.status !== 'active' || !['super_admin','admin'].includes(actor.role)) return json({ error: 'Forbidden' }, 403);

    const body = await req.json();
    const { email, password, full_name, phone, role, school_id } = body;
    if (!email || !password || !full_name || !role) return json({ error: 'Missing required fields' }, 400);
    if (!['admin','teacher','student','parent'].includes(role)) return json({ error: 'Invalid role' }, 400);
    if (actor.role === 'admin' && (role === 'admin' || school_id !== actor.school_id)) return json({ error: 'You can only create users in your own school' }, 403);
    if (actor.role === 'super_admin' && role === 'admin' && school_id === undefined) return json({ error: 'school_id may be null for a new admin' }, 400);

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name } });
    if (createError) {
      const duplicate = /already|exists|registered/i.test(createError.message);
      return json({ error: duplicate ? 'An account with this email already exists.' : createError.message }, duplicate ? 409 : 400);
    }
    if (!created.user) return json({ error: 'Unable to create account' }, 500);

    const effectiveSchool = actor.role === 'admin' ? actor.school_id : (school_id || null);
    const { error: profileError } = await adminClient.from('profiles').upsert({ id: created.user.id, email, full_name, phone: phone || null, role, school_id: effectiveSchool, status: 'active' });
    if (profileError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: 'Account created but profile setup failed.' }, 500);
    }
    await adminClient.from('audit_logs').insert({ school_id: effectiveSchool, actor_id: caller.id, action: `${role}_created`, entity_type: 'profile', entity_id: created.user.id, metadata: { email } });
    return json({ user: { id: created.user.id, email, role, school_id: effectiveSchool } }, 201);
  } catch (e) { return json({ error: e instanceof Error ? e.message : 'Unexpected server error' }, 500); }
});
