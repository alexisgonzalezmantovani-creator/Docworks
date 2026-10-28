const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class {constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage&&this.port1.onmessage({data:undefined}),0)};}};
let reads=[],writes=[],sessionUser='owner-a',sessionPause=null;
const client={auth:{getSession:()=>sessionPause?sessionPause.promise:Promise.resolve({data:{session:{user:{id:sessionUser}}},error:null})},rpc:(name,args)=>new Promise(resolve=>{(name.endsWith('obtener')?reads:writes).push({args,resolve});})};
window.supabase={createClient:()=>client};
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-session-'));
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(path.join(dir,'src/App.tsx'),'utf8')+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createRoot,createElement,useState,usePerfilSupabase};',resolveDir:path.join(dir,'src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'app.cjs')});
const app=require(path.join(tmp,'app.cjs'));
let api,count=0;function check(label,fn){fn();count++;console.log('OK',label);}
const ctx=(user='owner-a',tenant='tenant-a',role='dueno')=>({usuario:{id:user,rol_base:role},inmobiliaria:{id:tenant}});
function Harness({context}){const [perfil,setPerfil]=app.useState({});const hook=app.usePerfilSupabase(context,perfil,setPerfil);api={...hook,perfil};return null;}
const root=app.createRoot(document.getElementById('test'));
async function render(context){await app.act(async()=>root.render(app.createElement(Harness,{context})));}
async function resolveRead(index,data){await app.act(async()=>reads[index].resolve(data));}
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
(async()=>{
 await render(ctx());
 let result=await api.guardarAhora({nombre:'Prematuro'});
 check('no guarda antes de leer la nube',()=>{assert.ok(result.error);assert.equal(writes.length,0);});
 await resolveRead(0,{data:{nombre:'A',rol:'dueno',plantillas:{reserva:{version:1}}},error:null});
 check('carga inicial conserva modelos de nube',()=>{assert.equal(api.perfil.nombre,'A');assert.equal(api.cargado,true);});
 const oldSave=api.guardarAhora;
 await render(ctx('broker-a','tenant-a','broker'));
 check('cambiar usuario de misma inmobiliaria vuelve a leer',()=>{assert.equal(reads.length,2);assert.notEqual(api.perfil.nombre,'A');assert.equal(api.cargado,false);});
 result=await oldSave({nombre:'No debe escribirse'});
 check('callback de usuario anterior rechazado antes de RPC',()=>{assert.equal(result.contextoObsoleto,true);assert.equal(writes.length,0);});
 await render(ctx('owner-b','tenant-b'));sessionUser='owner-b';
 await resolveRead(2,{data:{nombre:'B',rol:'dueno'},error:null});
 await resolveRead(1,{data:{nombre:'Respuesta antigua',rol:'broker'},error:null});
 check('lectura tardía no reemplaza otro usuario o inmobiliaria',()=>assert.equal(api.perfil.nombre,'B'));
 sessionPause=deferred();let pending=api.guardarAhora({nombre:'B editado'});await app.act(async()=>{});
 await render(ctx());sessionUser='owner-a';
 sessionPause.resolve({data:{session:{user:{id:'owner-b'}}},error:null});sessionPause=null;
 result=await pending;
 check('cambio durante recuperación de sesión no escribe',()=>{assert.equal(result.contextoObsoleto,true);assert.equal(writes.length,0);});
 await resolveRead(3,{data:{nombre:'A',rol:'dueno'},error:null});
 sessionUser='otro-usuario';result=await api.guardarAhora({nombre:'Incorrecto'});
 check('sesión SDK diferente al contexto no escribe',()=>{assert.equal(result.contextoObsoleto,true);assert.equal(writes.length,0);});
 sessionUser='owner-a';pending=api.guardarAhora({nombre:'Guardado válido'});await app.act(async()=>{});
 check('sesión y contexto coincidentes envían una RPC',()=>{assert.equal(writes.length,1);assert.equal(writes[0].args.p_datos.nombre,'Guardado válido');});
 await app.act(async()=>writes[0].resolve({data:{nombre:'Guardado válido'},error:null}));
 result=await pending;check('guardado vigente devuelve éxito',()=>assert.equal(result.error,null));
 pending=api.guardarAhora({nombre:'Pendiente'});await app.act(async()=>{});
 await render(ctx('owner-b','tenant-b'));sessionUser='owner-b';
 await resolveRead(4,{data:{nombre:'B actual',rol:'dueno'},error:null});
 await app.act(async()=>writes[1].resolve({error:{message:'Error antiguo'}}));
 result=await pending;
 check('respuesta tardía informa contexto obsoleto para impedir rollback ajeno',()=>{assert.equal(result.contextoObsoleto,true);assert.equal(api.perfil.nombre,'B actual');});
 await render(ctx('owner-c','tenant-c'));sessionUser='owner-c';
 await resolveRead(5,{data:null,error:{message:'Fallo de red'}});
 result=await api.guardarAhora({nombre:'No sobrescribir remoto'});
 check('fallo de lectura mantiene guardado bloqueado',()=>{assert.equal(api.cargado,false);assert.ok(result.error);assert.equal(writes.length,2);});
 sessionUser='broker-d';await render(ctx('broker-d','tenant-d','broker'));
 await resolveRead(6,{data:{_cloud_missing:true,rol:'broker',nombre_usuario:'Asesor de prueba'},error:null});
 check('perfil remoto ausente no eleva asesor a dueño',()=>{assert.equal(api.perfil.rol,'broker');assert.equal(api.perfil.nombre_usuario,'Asesor de prueba');});
 const claveAntes=api.contexto;
 await render(ctx('broker-d','tenant-d','admin'));
 check('cambio de rol invalida contexto y vuelve a leer',()=>{assert.notEqual(api.contexto,claveAntes);assert.equal(api.cargado,false);assert.equal(reads.length,8);});
 await resolveRead(7,{data:{rol:'admin'},error:null});
 await render(null);result=await api.guardarAhora({});
 check('sin cuenta no hay guardado',()=>{assert.ok(result.error);assert.equal(writes.length,2);});
 await app.act(async()=>root.unmount());dom.window.close();
 console.log('APROBADAS',count,'verificaciones de transición de sesión con SDK simulado.');
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close();});
