const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{PGlite}=require('@electric-sql/pglite');
(async()=>{
 const db=new PGlite(),id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');let n=0;
 const check=(s,f)=>{f();n++;console.log('OK',s)};
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema docworks_private;grant usage on schema docworks_private to authenticated;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create table public.inmobiliarias(id uuid primary key);create table public.usuarios(id uuid primary key,inmobiliaria_id uuid,nombre text,rol_base text,activo boolean);create table public.operaciones(id text primary key,inmobiliaria_id uuid,datos jsonb,creado_por uuid,eliminado_en timestamptz,estado text);create function docworks_private.puede_leer_operacion(i uuid,d jsonb,c uuid) returns boolean language sql security definer set search_path='' as $$select exists(select 1 from public.usuarios u where u.id=auth.uid() and u.activo and u.inmobiliaria_id=i and (u.rol_base in ('dueno','admin','viewer') or coalesce(d->>'broker_id',c::text)=u.id::text))$$;`);
 await db.query('insert into inmobiliarias values($1),($2)',[id(1),id(2)]);
 for(const [user,tenant,rol] of [[10,1,'dueno'],[11,1,'broker'],[12,1,'broker'],[13,1,'viewer'],[20,2,'dueno']]){await db.query('insert into usuarios values($1,$2,$3,$4,true)',[id(user),id(tenant),'QA '+user,rol]);await db.query('insert into auth.users values($1,$2,now())',[id(user),'qa'+user+'@example.invalid']);}
 await db.query(`insert into operaciones values('op-a',$1,$2,$3,null,'activo'),('op-b',$4,'{}',$5,null,'activo')`,[id(1),{broker_id:id(11)},id(10),id(2),id(20)]);
 const sql=fs.readFileSync(path.join(__dirname,'../../supabase/propuestas/recordatorios-634.sql'),'utf8');await db.exec(sql);await db.exec(sql);check('infraestructura idempotente',()=>assert.ok(true));
 async function actor(i){await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${id(i)}',false);`);}
 const firma=new Date(Date.now()+3*86400000).toISOString();
 const programar=(op='op-a',dest=id(11),ant=60)=>db.query('select fn_recordatorio_guardar($1,$2,$3,$4) as r',[op,dest,firma,ant]);
 await actor(10);const inicial=(await db.query("select fn_recordatorios_contexto('op-a') as r")).rows[0].r;check('correo apagado en estado inicial',()=>assert.equal(inicial.habilitado,false));await assert.rejects(programar(),/no están habilitados/);n++;
 await db.exec('reset role;update docworks_private.correo_config set habilitado=true;');await actor(10);
 const first=(await programar()).rows[0].r.id,repeat=(await programar()).rows[0].r.id;check('reintento conserva un único aviso',()=>assert.equal(first,repeat));
 const ctx=(await db.query("select fn_recordatorios_contexto('op-a') as r")).rows[0].r;
 check('destinatarios sólo dueño y broker asignado',()=>assert.deepEqual(ctx.destinatarios.map(x=>x.id).sort(),[id(10),id(11)].sort()));
 await assert.rejects(programar('op-a',id(20)),/Destinatario no permitido/);n++;await assert.rejects(programar('op-a',id(12)),/Destinatario no permitido/);n++;
 await actor(11);await assert.rejects(programar('op-a',id(10)),/Destinatario no permitido/);n++;await assert.rejects(programar('op-b'),/Operación no disponible/);n++;
 await actor(13);await assert.rejects(programar(),/Operación no disponible/);n++;
 await actor(20);await assert.rejects(db.query("select fn_recordatorios_contexto('op-a')"),/Operación no disponible/);n++;
 await actor(10);await assert.rejects(programar('op-a',id(11),2),/no válidas/);n++;await assert.rejects(db.query('select fn_recordatorio_guardar($1,$2,now(),0)',['op-a',id(11)]),/futuro/);n++;
 await db.query('select fn_recordatorio_cancelar($1)',[first]);await db.query('select fn_recordatorio_cancelar($1)',[first]);
 await db.exec('reset role;');const cancelado=(await db.query('select estado from docworks_private.recordatorios where id=$1',[first])).rows[0].estado;check('cancelación repetida es segura',()=>assert.equal(cancelado,'cancelado'));
 await db.exec(`update docworks_private.recordatorios set estado='pendiente',enviar_en=now()-interval '1 minute';set role service_role;`);
 const batch=(await db.query('select fn_recordatorios_tomar() as r')).rows[0].r;
 check('servicio toma sólo correo confirmado de Auth',()=>{assert.equal(batch.length,1);assert.equal(batch[0].email,'qa11@example.invalid');});
 const segunda=(await db.query('select fn_recordatorios_tomar() as r')).rows[0].r;check('segunda invocación no vuelve a tomar el aviso',()=>assert.deepEqual(segunda,[]));
 await db.query("select fn_recordatorio_resultado($1,'aceptado','proveedor-qa')",[first]);await db.exec('reset role;');
 const estado=(await db.query('select estado,proveedor_id from docworks_private.recordatorios where id=$1',[first])).rows[0];check('aceptación conserva referencia y estado',()=>assert.deepEqual(estado,{estado:'aceptado',proveedor_id:'proveedor-qa'}));
 await actor(10);await assert.rejects(db.query('select fn_recordatorios_tomar()'),/permission denied/);n++;await assert.rejects(db.query("select * from docworks_private.recordatorios"),/permission denied/);n++;
 await db.exec('reset role;set role anon;');await assert.rejects(db.query("select fn_recordatorios_contexto('op-a')"),/permission denied/);n++;
 await db.exec(`reset role;update docworks_private.recordatorios set estado='pendiente';update public.operaciones set datos='{}' where id='op-a';set role service_role;`);
 assert.deepEqual((await db.query('select fn_recordatorios_tomar() as r')).rows[0].r,[]);n++;await db.exec('reset role;');const reasignado=(await db.query('select estado from docworks_private.recordatorios')).rows[0].estado;check('reasignación cancela el aviso anterior',()=>assert.equal(reasignado,'cancelado'));
 await db.exec(`update docworks_private.recordatorios set estado='enviando',tomado_en=now()-interval '11 minutes';set role service_role;`);await db.query('select fn_recordatorios_tomar()');await db.exec('reset role;');
 const ambiguo=(await db.query('select estado from docworks_private.recordatorios')).rows[0].estado;check('respuesta perdida queda por verificar y no se reenvía',()=>assert.equal(ambiguo,'verificar'));
 await db.close();console.log('APROBADAS '+n+' verificaciones SQL de recordatorios, sin envíos reales.');
})().catch(e=>{console.error(e);process.exitCode=1});
