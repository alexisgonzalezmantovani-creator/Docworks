const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{PGlite}=require('@electric-sql/pglite'),{setup,A}=require('./superadmin-cierre.cjs');
(async()=>{
 const db=new PGlite();await db.exec(setup+`create role service_role;create schema docworks_private;alter table membresias add mercadopago_preapproval_id text,add mercadopago_init_point text,add mercadopago_last_sync_at timestamptz;grant usage on schema public to service_role;`);
 await db.exec(fs.readFileSync(path.resolve(__dirname,'../../supabase/propuestas/checkout-reserva-633.sql'),'utf8'));
 const call=`select fn_mp_reservar_checkout('${A}','${A}',100,'ARS','qa@example.test',null) d`;
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(db.query(call),/permission denied/);await db.exec('reset role');}
 await db.exec('set role service_role');const a=(await db.query(call)).rows[0].d,b=(await db.query(call)).rows[0].d;assert.equal(a.nuevo,true);assert.equal(b.nuevo,false);assert.equal(a.clave,b.clave);
 await assert.rejects(db.query(call.replace('100,','200,')),/otros datos/);
 await assert.rejects(db.query(`select fn_mp_finalizar_checkout('${A}','${A}','sub1','https://www.mercadopago.com.ar/checkout','pending')`),/inexistente/);
 const finish=`select fn_mp_finalizar_checkout('${A}','${a.clave}','sub1','https://www.mercadopago.com.ar/checkout','pending')`;
 await db.query(finish);await db.query(finish);await assert.rejects(db.query(call),/membresía cambió/);
 await db.exec('reset role');assert.equal((await db.query(`select mercadopago_preapproval_id id from membresias where id='${A}'`)).rows[0].id,'sub1');
 assert.equal((await db.query('select count(*)::int n from docworks_private.checkout_intentos')).rows[0].n,1);
 await db.close();console.log('APROBADAS 10 comprobaciones SQL de reserva de checkout.');
})().catch(e=>{console.error(e);process.exitCode=1});
