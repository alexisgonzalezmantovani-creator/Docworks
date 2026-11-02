// Todas las escrituras se ejecutan en PostgreSQL WASM en memoria. Sin URL ni credenciales.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const localModule=process.env.DOCWORKS_TEST_PGLITE_MODULE;
if(localModule&&!path.isAbsolute(localModule))throw new Error('La variante de PGlite debe ser un módulo local con ruta absoluta.');
const {PGlite}=require(localModule||'@electric-sql/pglite');
const root=path.resolve(__dirname,'../..');
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'permisos-catalogo.json'),'utf8'));
const structure=JSON.parse(fs.readFileSync(path.join(__dirname,'permisos-estructura.json'),'utf8'));
const proposal=fs.readFileSync(path.join(root,'supabase/propuestas/permisos-operaciones.sql'),'utf8');
const rollback=fs.readFileSync(path.join(root,'supabase/propuestas/permisos-operaciones-rollback.sql'),'utf8');
const uid=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const A=uid(1),B=uid(2),owner=uid(11),admin=uid(12),broker=uid(13),seller=uid(14),viewer=uid(15),broker2=uid(16),inactive=uid(17),foreign=uid(21),foreignBroker=uid(22),superuser=uid(98),missing=uid(99);
const people=[[owner,A,'dueno',true],[admin,A,'admin',true],[broker,A,'broker',true],[seller,A,'vendedor',true],[viewer,A,'viewer',true],[broker2,A,'broker',true],[inactive,A,'broker',false],[foreign,B,'admin',true],[foreignBroker,B,'broker',true]];
let checks=0;const db=new PGlite();
function ok(label){checks++;console.log('OK',label);}
async function actor(id,role='authenticated'){
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);
 assert.ok(['authenticated','anon'].includes(role));await db.exec('set role '+role);
}
async function call(id,sql,params=[],role='authenticated'){await actor(id,role);return (await db.query(sql,params)).rows;}
async function state(){await db.exec('reset role');const rows=await db.query(`select jsonb_build_object('operaciones',(select coalesce(jsonb_agg(to_jsonb(o) order by id),'[]') from operaciones o),'versiones',(select coalesce(jsonb_agg(to_jsonb(v) order by id),'[]') from documento_versiones v),'auditoria',(select coalesce(jsonb_agg(to_jsonb(a) order by id),'[]') from auditoria a)) as datos`);return rows.rows[0].datos;}
async function denied(label,id,sql,params=[],code='42501',role='authenticated'){
 const before=await state();let caught;
 try{await call(id,sql,params,role);}catch(e){caught=e;}
 assert.ok(caught,label+' debe ser rechazado');assert.equal(caught.code,code,label+': '+caught.message);
 assert.deepEqual(await state(),before,label+' no cambia operación, historial ni auditoría');ok(label);
}
const save='select * from public.fn_operacion_guardar($1,$2,$3,$4,$5::jsonb)';
const data=(assigned,extra={})=>({...{texto:'Cláusula personalizada ficticia',firmas:[{nombre:'[NOMBRE]'}],comprador_cotitulares:[{nombre:'[COTITULAR]'}],plantilla_snapshot:{version:3,clausulas:[{contenido:'Conservar texto pactado.'}]}},...(assigned?{broker_id:assigned}:{}),...extra});
async function saveAs(who,id,payload,parent=null){return call(who,save,[id,'reserva','borrador',parent,JSON.stringify(payload)]);}
async function setup(){
 await db.exec(`create role authenticated nologin;create role anon nologin;create role service_role nologin bypassrls;
 create schema auth;create schema docworks_private;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to authenticated,anon;
 create table auth.users(id uuid primary key);
 create table public.inmobiliarias(id uuid primary key);
 create table public.solicitudes_autorizacion(id uuid primary key);
 create table public.plantillas(id uuid primary key,inmobiliaria_id uuid);
 create type public.rol_base_t as enum('dueno','admin','broker','vendedor','viewer');
 create type public.perfil_permisos_t as enum('junior','semisenior','senior');
 create type public.auditoria_origen_t as enum('directa','trigger','autorizacion');
 create table public.membresias(inmobiliaria_id uuid,estado text,es_prueba boolean,fecha_vencimiento timestamptz);
 create table public.qa_superadmins(id uuid primary key);
 create function public.fn_es_super_admin(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.qa_superadmins where id=p_id)$$;`);
 const cols=catalog.catalogo.find(x=>x.tipo==='columnas').datos;
 for(const table of ['usuarios','operaciones','documento_versiones','auditoria']){
  const fields=cols.filter(c=>c.tabla===table).map(c=>c.columna+' '+c.tipo+(c.default?' default '+c.default:'')+(c.nullable==='NO'?' not null':''));
  await db.exec('create table public.'+table+'('+fields.join(',')+');');
 }
 for(const c of structure.find(x=>x.tipo==='constraints').datos.toSorted((a,b)=>Number(a.definicion.startsWith('FOREIGN'))-Number(b.definicion.startsWith('FOREIGN'))))await db.exec('alter table public.'+c.tabla+' add constraint '+c.nombre+' '+c.definicion);
 const funcs=new Map(catalog.funciones.map(f=>[f.proname,f.definicion]));
 const names=['fn_mi_inmobiliaria','fn_es_admin','fn_operacion_guardar','fn_operacion_eliminar','fn_operacion_restaurar','fn_operacion_eliminar_permanente','fn_operaciones_listar','fn_operaciones_papelera','fn_operaciones_purgar_vencidas','fn_operaciones_vaciar_papelera','fn_auditoria_registrar'];
 for(const name of names){await db.exec(funcs.get(name));}
 const fnSigs={fn_mi_inmobiliaria:'()',fn_es_admin:'(uuid)',fn_operacion_guardar:'(text,text,text,text,jsonb)',fn_auditoria_registrar:'(text,text,jsonb)'};
 for(const name of names){const sig=fnSigs[name]||(name.startsWith('fn_operaciones_')?'()':'(text)');await db.exec('revoke all on function public.'+name+sig+' from public,anon;grant execute on function public.'+name+sig+' to authenticated;');}
 for(const t of ['operaciones','documento_versiones','auditoria','usuarios'])await db.exec('alter table public.'+t+' enable row level security;');
 for(const p of catalog.catalogo.find(x=>x.tipo==='policies').datos)await db.exec('create policy '+p.policyname+' on public.'+p.tablename+' for select to '+p.roles.join(',')+' using('+p.qual+');');
 await db.exec('create policy usuarios_select on public.usuarios for select to authenticated using(inmobiliaria_id=public.fn_mi_inmobiliaria());grant select on public.usuarios to authenticated;');
 for(const p of structure.find(x=>x.tipo==='table_privileges').datos)await db.exec('grant '+p.privilegio+' on public.'+p.tabla+' to '+p.rol);
 for(const t of catalog.catalogo.find(x=>x.tipo==='triggers').datos){await db.exec(t.funcion);await db.exec(t.definicion);}
 await db.query('insert into inmobiliarias(id) values($1),($2)',[A,B]);
 for(const [id,tenant,role,active] of people){await db.query('insert into auth.users(id) values($1)',[id]);await db.query('insert into usuarios(id,inmobiliaria_id,email,nombre,rol_base,activo) values($1,$2,$3,$4,$5,$6)',[id,tenant,'ficticio-'+role+'@example.invalid','[USUARIO FICTICIO]',role,active]);}
 await db.query('insert into auth.users(id) values($1),($2)',[missing,superuser]);await db.query('insert into qa_superadmins(id) values($1)',[superuser]);
 await db.query("insert into membresias values($1,'activa',false,now()+interval '1 month'),($2,'activa',false,now()+interval '1 month')",[A,B]);
 const fixtures=[['own',A,broker,broker],['other',A,broker2,broker2],['seller',A,seller,seller],['legacy',A,null,broker],['unassigned',A,null,null],['foreign',B,foreignBroker,foreign],['trash',A,broker,owner],['old-trash',A,broker,owner],['foreign-trash',B,foreignBroker,foreign]];
 for(const [id,tenant,assigned,creator] of fixtures){
  await db.query("insert into operaciones(id,inmobiliaria_id,tipo,datos,creado_por) values($1,$2,'reserva',$3::jsonb,$4)",[id,tenant,JSON.stringify(data(assigned)),creator]);
  await db.query("insert into documento_versiones(inmobiliaria_id,operacion_id,version,tipo_documento,documento,creado_por) values($1,$2,1,'reserva',$3::jsonb,$4)",[tenant,id,JSON.stringify({texto:'Versión ficticia anterior',operacion_id:id}),creator]);
 }
 await db.exec("update operaciones set eliminado_en=now() where id in ('trash','foreign-trash');update operaciones set eliminado_en=now()-interval '31 days' where id='old-trash';");
 await db.exec('reset role');
}
(async()=>{try{
 await setup();console.log('Motor local:',(await db.query('select version()')).rows[0].version);
 // Reproduce el hallazgo únicamente en memoria y revierte la escritura de prueba.
 await db.exec('begin');await saveAs(viewer,'baseline-viewer',data(viewer));await db.exec('reset role;rollback');ok('reproducción local: viewer podía crear con la función anterior');
 const beforeDDL=await state();await db.exec(proposal);assert.deepEqual(await state(),beforeDDL);ok('propuesta solo DDL: datos, firmas, snapshots e historial intactos');
 assert.equal((await db.query("select has_schema_privilege('authenticated','docworks_private','USAGE') as acceso")).rows[0].acceso,false);ok('no se abre el esquema privado al cliente');
 for(const who of [owner,admin,viewer]){const ids=(await call(who,'select id from fn_operaciones_listar()')).map(x=>x.id);assert.ok(ids.includes('own')&&ids.includes('other')&&!ids.includes('foreign'));ok('lectura del equipo y aislamiento: '+who.slice(-2));}
 for(const who of [broker,seller]){
  const expected=who===broker?['legacy','own']:['seller'];
  assert.deepEqual((await call(who,'select id from fn_operaciones_listar() order by id')).map(x=>x.id),expected);ok('RPC: lectura solo de propias '+who.slice(-2));
  assert.deepEqual((await call(who,"select id from operaciones where eliminado_en is null order by id")).map(x=>x.id),expected);ok('RLS: lectura solo de propias '+who.slice(-2));
  assert.deepEqual((await call(who,'select distinct operacion_id from documento_versiones where operacion_id not in (\'trash\',\'old-trash\') order by operacion_id')).map(x=>x.operacion_id),expected);ok('historial protegido por operación '+who.slice(-2));
  const logs=await call(who,'select valor_nuevo,valor_anterior from auditoria');assert.ok(logs.length);assert.ok(logs.every(x=>expected.concat(who===broker?['trash','old-trash']:[]).includes((x.valor_nuevo||x.valor_anterior).id)));ok('auditoría no expone otras operaciones '+who.slice(-2));
 }
 for(const who of [inactive,missing,superuser]){assert.equal((await call(who,'select * from fn_operaciones_listar()')).length,0);ok('sin acceso tenant: '+who.slice(-2));}
 for(const who of [viewer,inactive,missing,superuser])for(const [label,sql,args] of [
  ['crear',save,['deny-'+who,'reserva','borrador',null,JSON.stringify(data(who))]],
  ['editar',save,['own','reserva','borrador',null,JSON.stringify(data(broker))]],
  ['borrar','select fn_operacion_eliminar($1)',['own']],['restaurar','select fn_operacion_restaurar($1)',['trash']],
  ['permanente','select fn_operacion_eliminar_permanente($1)',['trash']],['purgar','select fn_operaciones_purgar_vencidas()',[]],['vaciar','select fn_operaciones_vaciar_papelera()',[]]
 ])await denied(label+' rechazado '+who.slice(-2),who,sql,args);
 await denied('JWT anónimo',null,save,['anon','reserva','borrador',null,'{}'],'42501','anon');
 for(const who of [owner,admin,broker,seller]){
  const id='created-'+who.slice(-2);const result=await saveAs(who,id,data(null));assert.equal(result[0].id,id);
  if([broker,seller].includes(who))assert.equal(result[0].datos.broker_id,who);ok('alta permitida y asignación propia: '+who.slice(-2));
 }
 for(const who of [broker,seller]){
  await denied('no asigna otra persona '+who.slice(-2),who,save,['spoof-'+who,'reserva','borrador',null,JSON.stringify(data(broker2))]);
  await denied('no edita ajena '+who.slice(-2),who,save,['other','reserva','borrador',null,JSON.stringify(data(who))]);
  for(const action of ['eliminar','restaurar','eliminar_permanente'])await denied('sin permiso '+action+' '+who.slice(-2),who,'select fn_operacion_'+action+'($1)',[action==='eliminar'?'own':'trash']);
  for(const action of ['purgar_vencidas','vaciar_papelera'])await denied('sin permiso '+action+' '+who.slice(-2),who,'select fn_operaciones_'+action+'()');
 }
 await denied('vendedor no edita ni sus propias operaciones',seller,save,['seller','reserva','borrador',null,JSON.stringify(data(seller))]);
 await denied('broker no reasigna operación propia',broker,save,['own','reserva','borrador',null,JSON.stringify(data(broker2))]);
 await denied('broker no borra asignación propia',broker,save,['own','reserva','borrador',null,JSON.stringify(data(null))]);
 await denied('payload con rol falso no permite editar',seller,save,['seller','reserva','borrador',null,JSON.stringify(data(seller,{rol:'dueno',inmobiliaria_id:B}))]);
 const original=(await state()).operaciones.find(x=>x.id==='own').datos;
 await saveAs(broker,'own',{...original,nota:'Cambio ficticio autorizado'});let after=await state();
 const version=after.versiones.find(x=>x.operacion_id==='own'&&x.version===2);assert.deepEqual(version.documento.datos,original);assert.deepEqual(after.operaciones.find(x=>x.id==='own').datos.firmas,original.firmas);assert.deepEqual(after.operaciones.find(x=>x.id==='own').datos.comprador_cotitulares,original.comprador_cotitulares);assert.deepEqual(after.operaciones.find(x=>x.id==='own').datos.plantilla_snapshot,original.plantilla_snapshot);ok('edición propia preserva firmas, cotitulares, snapshot e historial anterior');
 await saveAs(broker,'legacy',data(null,{nota:'Edición histórica sin reasignar'}));ok('operación sin broker_id conserva acceso por creador');
 for(const who of [owner,admin]){
  await denied('no cruza tenant al editar '+who.slice(-2),who,save,['foreign','reserva','borrador',null,JSON.stringify(data(owner))]);
  for(const action of ['eliminar','restaurar','eliminar_permanente'])await denied('no cruza tenant '+action+' '+who.slice(-2),who,'select fn_operacion_'+action+'($1)',[action==='eliminar'?'foreign':'foreign-trash']);
 }
 await denied('no se puede editar papelera',owner,save,['trash','reserva','borrador',null,JSON.stringify(data(broker))]);
 await denied('no se asigna asesor de otro tenant',owner,save,['bad-assignee','reserva','borrador',null,JSON.stringify(data(foreignBroker))]);
 await denied('parent ajeno al asesor',broker,save,['child-hidden','boleto','borrador','other',JSON.stringify(data(broker))],'P0001');
 await denied('parent de otro tenant',owner,save,['child-foreign','boleto','borrador','foreign',JSON.stringify(data(owner))],'P0001');
 await denied('no se agrega auditoría a una operación ajena',broker,'select fn_auditoria_registrar($1,$2,$3::jsonb)',['exportar_con_faltantes','other','{}']);
 await call(broker,'select fn_auditoria_registrar($1,$2,$3::jsonb)',['exportar_con_faltantes','own','{}']);ok('exportación propia conserva registro de auditoría');
 for(const who of [viewer,broker,seller,owner]){
  await denied('sin escritura directa de operaciones '+who.slice(-2),who,"update operaciones set estado='cerrado' where id='own'");
  await denied('sin inserción directa de historial '+who.slice(-2),who,"insert into documento_versiones(inmobiliaria_id,operacion_id,version,tipo_documento) values($1,'own',90,'reserva')",[A]);
  await denied('sin TRUNCATE de versiones '+who.slice(-2),who,'truncate documento_versiones');
 }
 await denied('anónimo no trunca versiones',null,'truncate documento_versiones',[],'42501','anon');
 await call(owner,'select fn_operacion_eliminar($1)',['own']);assert.ok((await state()).operaciones.find(x=>x.id==='own').eliminado_en);ok('dueño mueve a papelera');
 await call(admin,'select fn_operacion_restaurar($1)',['own']);assert.equal((await state()).operaciones.find(x=>x.id==='own').eliminado_en,null);ok('admin restaura dentro del tenant');
 await db.exec('reset role');await db.query("update membresias set es_prueba=true,fecha_vencimiento=now()-interval '1 day' where inmobiliaria_id=$1",[A]);
 await denied('se conserva bloqueo de prueba vencida',owner,save,['expired','reserva','borrador',null,'{}'],'P0001');
 await db.exec('reset role');await db.query('update membresias set es_prueba=false where inmobiliaria_id=$1',[A]);
 await call(admin,'select fn_operaciones_purgar_vencidas()');after=await state();assert.ok(!after.operaciones.some(x=>x.id==='old-trash'));assert.ok(after.operaciones.some(x=>x.id==='trash'));assert.ok(after.operaciones.some(x=>x.id==='foreign-trash'));ok('purga respeta 30 días y tenant; cascada histórica existente');
 await call(owner,'select fn_operacion_eliminar_permanente($1)',['trash']);assert.ok(!(await state()).operaciones.some(x=>x.id==='trash'));ok('borrado permanente autorizado');

 await saveAs(admin,'created-12',data(broker2,{nota:'Reasignada por administración'}));
 await saveAs(broker2,'created-12',data(broker2,{nota:'Edición del asesor asignado'}));ok('admin reasigna y asesor asignado puede editar');
 await denied('otro asesor no reclama operación reasignada',broker,save,['created-12','reserva','borrador',null,JSON.stringify(data(broker))]);
 await db.exec('reset role');await db.query("update usuarios set rol_base='viewer' where id=$1",[broker]);
 await denied('baja de permisos se aplica sin confiar en rol anterior',broker,save,['own','reserva','borrador',null,JSON.stringify(data(broker))]);
 await db.exec('reset role');await db.query("update usuarios set rol_base='broker' where id=$1",[broker]);

 await db.exec('reset role;begin;alter function docworks_private.puede_leer_operacion(uuid,jsonb,uuid) security invoker');
 await assert.rejects(db.exec(rollback),/Cambió un helper/);await db.exec('rollback');ok('rollback rechaza cambios de seguridad del helper');
 const beforePolicyDrift=await state();await db.exec('begin;alter policy operaciones_select on operaciones using(true)');
 await assert.rejects(db.exec(rollback),/Cambió una política/);await db.exec('rollback');assert.deepEqual(await state(),beforePolicyDrift);ok('rollback rechaza políticas modificadas sin pisarlas');
 const beforeRollback=await state();await db.exec(rollback);assert.deepEqual(await state(),beforeRollback);ok('rollback DDL no altera datos, historial o auditoría');
 assert.equal((await db.query("select to_regprocedure('docworks_private.puede_leer_operacion(uuid,jsonb,uuid)') as f")).rows[0].f,null);ok('rollback retira helpers y restaura políticas');


 await db.exec('begin;alter function fn_operaciones_listar() security invoker');
 await assert.rejects(db.exec(proposal),/Preflight: cambió public.fn_operaciones_listar/);await db.exec('rollback');ok('preflight rechaza cambio de SECURITY DEFINER');
 await db.exec('begin;alter policy operaciones_select on operaciones using(true)');
 await assert.rejects(db.exec(proposal),/Cambió una política/);await db.exec('rollback');ok('preflight rechaza política alterada aunque conserve nombre');
 await db.exec(proposal);ok('reaplicación sobre baseline restaurada');
 await db.exec(rollback);
 const beforePreflight=await state();await db.exec("create or replace function public.fn_operaciones_listar() returns table(id text,tipo text,estado text,parent_id text,datos jsonb,creado_en timestamptz,actualizado_en timestamptz) language sql stable security definer set search_path=public,pg_temp as $$ select id,tipo,estado,parent_id,datos,creado_en,actualizado_en from operaciones where false $$");
 await assert.rejects(db.exec(proposal),/Preflight: cambió public.fn_operaciones_listar/);await db.exec('rollback');assert.deepEqual(await state(),beforePreflight);assert.equal((await db.query("select to_regprocedure('docworks_private.puede_leer_operacion(uuid,jsonb,uuid)') as f")).rows[0].f,null);ok('preflight rechaza definiciones modificadas antes de instalar helpers');
 console.log('APROBADAS',checks,'verificaciones SQL en memoria. Ninguna conexión a producción.');
}finally{await db.close();}})().catch(e=>{console.error(e.message);console.error(e.stack);process.exitCode=1});
