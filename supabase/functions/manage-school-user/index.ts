import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const cors={ 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type' };
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  try{
    const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!url||!key)return json({error:'Server configuration is incomplete'},500);
    const db=createClient(url,key,{auth:{persistSession:false}});
    const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401);
    const token=auth.replace(/^Bearer\s+/i,'');
    const {data:{user},error:uerr}=await db.auth.getUser(token);if(uerr||!user)return json({error:'Unauthorized'},401);
    const {data:actor}=await db.from('profiles').select('role,school_id').eq('id',user.id).maybeSingle();
    if(!actor||actor.role!=='admin'||!actor.school_id)return json({error:'Only a school Admin can manage school users'},403);

    const body=await req.json();
    const targetId=String(body.user_id||'');
    const action=String(body.action||'');
    if(!targetId||!['update','deactivate','reactivate'].includes(action))return json({error:'Invalid request'},400);
    if(targetId===user.id)return json({error:'You cannot deactivate your own account'},400);

    const {data:target}=await db.from('profiles').select('id,full_name,phone,role,school_id').eq('id',targetId).maybeSingle();
    if(!target||target.school_id!==actor.school_id||!['teacher','student','parent'].includes(target.role))return json({error:'User not found in your school'},404);

    if(action==='update'){
      const fullName=String(body.full_name||'').trim();
      const phone=String(body.phone||'').trim()||null;
      if(!fullName)return json({error:'Full name is required'},400);
      const {error}=await db.from('profiles').update({full_name:fullName,phone,updated_at:new Date().toISOString()}).eq('id',targetId).eq('school_id',actor.school_id);
      if(error)return json({error:error.message},400);
      await db.auth.admin.updateUserById(targetId,{user_metadata:{full_name:fullName,phone}});
      await db.from('audit_logs').insert({actor_id:user.id,school_id:actor.school_id,action:`${target.role}.updated`,target_type:'profile',target_id:targetId,metadata:{full_name:fullName}});
      return json({message:'User updated'});
    }

    const status=action==='deactivate'?'inactive':'active';
    const {error:me}=await db.from('school_members').update({status}).eq('school_id',actor.school_id).eq('user_id',targetId);
    if(me)return json({error:me.message},400);
    const {error:ae}=await db.auth.admin.updateUserById(targetId,{ban_duration:status==='inactive'?'876000h':'none'});
    if(ae)return json({error:ae.message},400);
    await db.from('audit_logs').insert({actor_id:user.id,school_id:actor.school_id,action:`${target.role}.${action}d`,target_type:'profile',target_id:targetId,metadata:{status}});
    return json({message:`User ${status}`});
  }catch(e){return json({error:e instanceof Error?e.message:'Unexpected server error'},500)}
});
