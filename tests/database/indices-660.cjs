const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');
const sql=fs.readFileSync(path.resolve(__dirname,'../../supabase/migrations/20261114190936_indices_fk_operaciones_auditoria_660.sql'),'utf8');
const indexes={
 idx_dw_660_operaciones_creado_por:['operaciones','creado_por'],
 idx_dw_660_operaciones_actualizado_por:['operaciones','actualizado_por'],
 idx_dw_660_operaciones_eliminado_por:['operaciones','eliminado_por'],
 idx_dw_660_auditoria_usuario_id:['auditoria','usuario_id'],
 idx_dw_660_documento_versiones_creado_por:['documento_versiones','creado_por'],
 idx_dw_660_invitaciones_invitado_por:['invitaciones','invitado_por'],
 idx_dw_660_solicitudes_autorizacion_usuario_id:['solicitudes_autorizacion','usuario_id']
};
(async()=>{
 const db=new PGlite();
 try{
  await db.exec('create table public.operaciones(id text primary key,creado_por uuid,actualizado_por uuid,eliminado_por uuid); create table public.auditoria(id uuid primary key,usuario_id uuid); create table public.documento_versiones(id uuid primary key,creado_por uuid); create table public.invitaciones(id uuid primary key,invitado_por uuid); create table public.solicitudes_autorizacion(id uuid primary key,usuario_id uuid);');
  await db.exec(sql);
  await db.exec(sql);
  const rows=(await db.query("select tablename,indexname,indexdef from pg_indexes where schemaname='public' and indexname like 'idx_dw_660_%'")).rows;
  assert.equal(rows.length,Object.keys(indexes).length);
  for(const [name,expected] of Object.entries(indexes)){
   const row=rows.find(r=>r.indexname===name);
   assert.ok(row,'No se creó '+name);
   assert.equal(row.tablename,expected[0]);
   assert.ok(row.indexdef.includes('('+expected[1]+')'),name);
  }
  console.log('APROBADAS 7 relaciones e idempotencia de la migración 6.60.');
 }finally{await db.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
