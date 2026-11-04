// Prueba de la carga inicial en PostgreSQL en memoria. Nunca se conecta a producción.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {PGlite}=require(process.env.DOCWORKS_TEST_PGLITE_MODULE||'@electric-sql/pglite');
(async()=>{
 const db=new PGlite(),sql=fs.readFileSync(path.resolve(__dirname,'../../scripts/provisionar-biblioteca-base.sql'),'utf8');
 await db.exec(`create type public.proteccion_t as enum('B');create table inmobiliarias(id uuid primary key);create table clausulas(id uuid primary key default gen_random_uuid(),inmobiliaria_id uuid,titulo text,categoria text,contenido text,tipos jsonb,obligatoria boolean,proteccion proteccion_t,orden integer,activo boolean default true);create table configuracion_inmobiliaria(inmobiliaria_id uuid primary key,datos jsonb,actualizada_en timestamptz);`);
 const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002';
 await db.query('insert into inmobiliarias values($1),($2)',[A,B]);
 const datos={nombre:'Prueba',encabezados_custom:{reserva:'Texto propio intacto'},plantillas:{reserva:{clausulas_ids:['id-previo'],version:7,body_blocks:[{contenido:'Cláusula propia'}]},comodato:{clausulas_ids:['comodato-previo']}}};
 await db.query('insert into configuracion_inmobiliaria values($1,$2,now()),($3,$4,now())',[A,JSON.stringify(datos),B,'{}']);
 await db.query(`insert into clausulas(inmobiliaria_id,titulo,contenido,tipos,obligatoria,activo) values($1,'Crédito hipotecario (por Alexis)','Texto propio sin reemplazar.','["reserva"]',false,true),($1,'Entrega amoblada con inventario','Texto borrado por el usuario.','["reserva"]',false,false)`,[A]);
 await db.query(`insert into clausulas(inmobiliaria_id,titulo,contenido,tipos,obligatoria) values($1,'Condición propia previa','Se conserva.','["todos"]',false)`,[B]);
 const primera=await db.query(sql);assert.equal(primera.rows[0].clausulas_agregadas,6);assert.equal(primera.rows[0].inmobiliarias_configuradas,2);
 const r=await db.query('select * from clausulas where inmobiliaria_id=$1',[A]);
 assert.equal(r.rows.length,4);assert.equal(r.rows.find(c=>c.titulo.includes('Alexis')).contenido,'Texto propio sin reemplazar.');assert.equal(r.rows.find(c=>c.titulo.includes('amoblada')).activo,false);
 const cfg=(await db.query('select datos from configuracion_inmobiliaria where inmobiliaria_id=$1',[A])).rows[0].datos;
 assert.equal(cfg.encabezados_custom.reserva,datos.encabezados_custom.reserva);assert.equal(cfg.plantillas.reserva.version,7);assert.deepEqual(cfg.plantillas.reserva.body_blocks,datos.plantillas.reserva.body_blocks);assert.deepEqual(cfg.plantillas.comodato,datos.plantillas.comodato);assert.ok(cfg.plantillas.reserva.clausulas_ids.includes('id-previo'));assert.equal(cfg.plantillas.reserva.clausulas_ids.length,3);
 const antes=JSON.stringify((await db.query('select * from configuracion_inmobiliaria order by inmobiliaria_id')).rows);const segunda=await db.query(sql);assert.equal(segunda.rows[0].clausulas_agregadas,0);assert.equal(segunda.rows[0].inmobiliarias_configuradas,0);assert.equal(JSON.stringify((await db.query('select * from configuracion_inmobiliaria order by inmobiliaria_id')).rows),antes);
 await db.close();console.log('APROBADA biblioteca base: deduplicación, bajas respetadas, textos/versiones conservados, opcionales e idempotencia.');
})().catch(e=>{console.error(e);process.exitCode=1});
