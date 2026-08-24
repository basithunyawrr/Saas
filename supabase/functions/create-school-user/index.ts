import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';
const cors={ 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type' };
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  try{
    const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!key)return json({error:'Server configuration is incomplete'},500);
    const db=createClient(url,key,{auth:{persistSession:false}});const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401);
    const token=auth.replace(/^Bearer\s+/i,'');const {data:{user},error:uerr}=await db.auth.getUser(token);if(uerr||!user)return json({error:'Unauthorized'},401);
    const {data:actor}=await db.from('profiles').select('role,school_id').eq('id',user.id).maybeSingle();
    if(!actor||actor.role!=='admin'||!actor.school_id)return json({error:'Only a school Admin can create school users'},403);
    const body=await req.json();const role=String(body.role||'');if(!['teacher','student','parent'].includes(role))return json({error:'Invalid school role'},400);
    const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||''),fullName=String(body.full_name||'').trim(),phone=String(body.phone||'').trim()||null;
    if(!email||!password||!fullName)return json({error:'Name, email and password are required'},400);if(password.length<10)return json({error:'Temporary password must be at least 10 characters'},400);
    const {data:created,error:ce}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:fullName,phone}});if(ce)return json({error:/already|exists|registered/i.test(ce.message)?'An account with this email already exists':ce.message},/already|exists|registered/i.test(ce.message)?409:400);
    if(!created.user)return json({error:'Unable to create account'},500);
    const {error:pe}=await db.from('profiles').upsert({id:created.user.id,full_name:fullName,phone,role,school_id:actor.school_id,updated_at:new Date().toISOString()});
    if(pe){await db.auth.admin.deleteUser(created.user.id);return json({error:'Profile could not be created'},500)}
    await db.from('school_members').upsert({school_id:actor.school_id,user_id:created.user.id,role,status:'active'},{onConflict:'school_id,user_id'});
    await db.from('audit_logs').insert({actor_id:user.id,school_id:actor.school_id,action:`${role}.created`,target_type:'profile',target_id:created.user.id,metadata:{email}});
    return json({user_id:created.user.id,role,message:'School user created'},201);
  }catch(e){return json({error:e instanceof Error?e.message:'Unexpected server error'},500)}
});
