const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),ts=require('typescript'),{JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-resiliente-')),dom=new JSDOM('<div id="root"></div>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];global.IS_REACT_ACT_ENVIRONMENT=true;global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};HTMLElement.prototype.scrollIntoView=()=>{};window.scrollTo=()=>{};
Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});Object.defineProperty(navigator,'onLine',{value:true,configurable:true});
const source=fs.readFileSync(dir+'/src/App.tsx','utf8'),parsed=ts.createSourceFile('App.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),fns={};(function visit(n){if(ts.isFunctionDeclaration(n)&&n.name)fns[n.name.text]=n.getText(parsed);ts.forEachChild(n,visit)})(parsed);
const harness=`
function crearGuardadoPrueba(servidor,inicial={}){
 let operaciones=inicial.operaciones||[],editOp=inicial.editOp||null,showForm=true,formInitialOverride=null;
 const perfil={rol:'dueno',plantillas:{}},clausulas=[],bloquesReserva=[];
 const contexto={usuario:{id:'owner',rol_base:'dueno'},inmobiliaria:{id:'tenant-a'},habilitado:true},docworksAuth={contexto,session:{}},opsSupabase=servidor;
 const accionesContextoRef={current:crearControlContextoOperaciones(claveContextoOperaciones(contexto))},formSaveIdRef={current:null},formSnapshotRef={current:null},showFormRef={current:false},draftPromptRef={current:null},sincronizacionDraftEnCursoRef={current:false},cierresDevolucionEnCursoRef={current:false};
 const setOperaciones=f=>{operaciones=typeof f==='function'?f(operaciones):f},setEditOp=x=>{editOp=x},setShowForm=x=>{showForm=x},setFormInitialOverride=x=>{formInitialOverride=x};
 const marcarOperacionPendiente=()=>{},desmarcarOperacionPendiente=()=>{},reportSave=()=>{},setDocAutoAction=()=>{},abrirDoc=()=>{};
 ${fns.saveOp}
 ${fns.sincronizarDraftOffline}
 ${fns.reintentarCierresDevolucion}
 return {saveOp,sincronizarDraftOffline,reintentarCierresDevolucion,estado:()=>({operaciones,showForm}),contexto,cambiarContexto(c){docworksAuth.contexto=c;accionesContextoRef.current.actualizar(claveContextoOperaciones(c));}};
}
import {act,createElement} from 'react';import {createRoot} from 'react-dom/client';
export {crearGuardadoPrueba,act,createElement,createRoot,OperacionForm,EMPTY_OP,SAMPLE_OP_PREVIEW,lsSet,lsGet,contextoBorradorOperacion,draftTieneContenido,buildDocSections,opParaDocumento,docToPlainText};`;
require('esbuild').buildSync({stdin:{contents:source+'\n'+harness,resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
const a=require(tmp+'/app.cjs'),root=a.createRoot(document.getElementById('root'));let checks=0,failures=0;async function check(label,fn){try{await fn();checks++;console.log('OK',label)}catch(e){failures++;console.error('FALLA',label,e.message)}}
const data={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',comprador_nombre:'Compradora de prueba'};
(async()=>{
await check('respuesta perdida después de guardar no duplica al reintentar',async()=>{const rows=new Map(),attempts=[];let first=true;const h=a.crearGuardadoPrueba({guardar:async op=>{rows.set(op.id,JSON.parse(JSON.stringify(op)));attempts.push(op.id);if(first){first=false;throw Error('Respuesta perdida después del commit')}return {operacion:op}}});await h.saveOp(data,'guardar','borrador');await h.saveOp({...data,comprador_nombre:'Nombre corregido'},'guardar','borrador');assert.equal(rows.size,1);assert.equal(attempts[0],attempts[1]);assert.equal([...rows.values()][0].comprador_nombre,'Nombre corregido');assert.equal(h.estado().operaciones.length,1)});
await check('sincronización offline conserva identidad después de una respuesta perdida',async()=>{const rows=new Map();let first=true;const h=a.crearGuardadoPrueba({guardar:async op=>{rows.set(op.id,JSON.parse(JSON.stringify(op)));if(first){first=false;throw Error('Respuesta perdida')}return {operacion:op}}});a.lsSet('draftOperacion',{data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});await h.sincronizarDraftOffline();assert.ok(a.lsGet('draftOperacion',null));const recuperado=a.crearGuardadoPrueba({guardar:async op=>{rows.set(op.id,JSON.parse(JSON.stringify(op)));return {operacion:op}}});await recuperado.sincronizarDraftOffline();assert.equal(rows.size,1);assert.equal(a.lsGet('draftOperacion',null),null)});

await check('dos sincronizaciones offline simultáneas solo envían una solicitud',async()=>{
 let resolve;const pending=new Promise(r=>{resolve=r});let calls=0;
 const h=a.crearGuardadoPrueba({guardar:async op=>{calls++;await pending;return {operacion:op}}});
 a.lsSet('draftOperacion',{data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});
 const primero=h.sincronizarDraftOffline();
 const segundo=h.sincronizarDraftOffline();
 assert.equal(calls,1);
 resolve();await Promise.all([primero,segundo]);
 assert.equal(calls,1);assert.equal(a.lsGet('draftOperacion',null),null);
});
await check('fallo de sincronización permite reintentar sin perder el identificador',async()=>{
 const ids=[];let fallar=true;
 const h=a.crearGuardadoPrueba({guardar:async op=>{ids.push(op.id);if(fallar)throw Error('Sin conexión');return {operacion:op}}});
 a.lsSet('draftOperacion',{data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});
 await h.sincronizarDraftOffline();
 const pendiente=a.lsGet('draftOperacion',null);
 assert.ok(pendiente);assert.ok(pendiente.editId);assert.equal(pendiente.editId,pendiente.data.id);
 fallar=false;await h.sincronizarDraftOffline();
 assert.equal(ids.length,2);assert.equal(ids[0],ids[1]);
 assert.equal(a.lsGet('draftOperacion',null),null);
});
await check('un borrador modificado durante la sincronización no se borra',async()=>{
 let resolve;const pending=new Promise(r=>{resolve=r});
 const h=a.crearGuardadoPrueba({guardar:async op=>{await pending;return {operacion:op}}});
 a.lsSet('draftOperacion',{data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});
 const guardando=h.sincronizarDraftOffline();
 const nuevo=a.lsGet('draftOperacion',null);
 a.lsSet('draftOperacion',{...nuevo,data:{...nuevo.data,comprador_nombre:'Cambio mientras guardaba'}});
 resolve();await guardando;
 assert.equal(a.lsGet('draftOperacion',null).data.comprador_nombre,'Cambio mientras guardaba');
});
await check('un rechazo explícito del servidor no borra el borrador y permite reintentar',async()=>{
 let calls=0;const ids=[];
 const h=a.crearGuardadoPrueba({guardar:async op=>{calls++;ids.push(op.id);return calls===1?{error:{message:'Servicio temporalmente no disponible'}}:{operacion:op}}});
 a.lsSet('draftOperacion',{data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});
 await h.sincronizarDraftOffline();
 assert.ok(a.lsGet('draftOperacion',null));
 await h.sincronizarDraftOffline();
 assert.equal(calls,2);assert.equal(ids[0],ids[1]);
 assert.equal(a.lsGet('draftOperacion',null),null);
});
await check('tras fallar una sincronización concurrente el bloqueo se libera',async()=>{
 let reject;const pending=new Promise((_resolve,r)=>{reject=r});let calls=0;
 const h=a.crearGuardadoPrueba({guardar:async op=>{calls++;if(calls===1)return pending;return {operacion:op}}});
 a.lsSet('draftOperacion',{data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});
 const primero=h.sincronizarDraftOffline();const segundo=h.sincronizarDraftOffline();
 assert.equal(calls,1);reject(Error('Se cortó internet'));await Promise.all([primero,segundo]);
 assert.ok(a.lsGet('draftOperacion',null));
 await h.sincronizarDraftOffline();assert.equal(calls,2);
 assert.equal(a.lsGet('draftOperacion',null),null);
});
await check('guardar una operación no borra un borrador modificado durante la espera',async()=>{
 let resolve;const pending=new Promise(r=>{resolve=r});
 const h=a.crearGuardadoPrueba({guardar:async op=>{await pending;return {operacion:op}}});
 const anterior={data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)};
 a.lsSet('draftOperacion',anterior);
 const guardando=h.saveOp(data,'guardar','borrador');
 a.lsSet('draftOperacion',{...anterior,data:{...data,comprador_nombre:'Modificado mientras guardaba'}});
 resolve();await guardando;
 assert.equal(a.lsGet('draftOperacion',null).data.comprador_nombre,'Modificado mientras guardaba');
});
await check('si el borrador cambia mientras se guarda el formulario permanece abierto',async()=>{
 let resolve;const pending=new Promise(r=>{resolve=r});
 const h=a.crearGuardadoPrueba({guardar:async op=>{await pending;return {operacion:op}}});
 const inicial={data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)};
 a.lsSet('draftOperacion',inicial);
 const guardando=h.saveOp(data,'guardar','borrador');
 a.lsSet('draftOperacion',{...inicial,data:{...data,comprador_nombre:'Nueva versión sin guardar'}});
 resolve();const resultado=await guardando;
 assert.equal(resultado.borradorPendiente,true);
 assert.equal(h.estado().showForm,true);
 assert.equal(a.lsGet('draftOperacion',null).data.comprador_nombre,'Nueva versión sin guardar');
});
await check('respuesta vacía del servidor no confirma guardado ni cierra el formulario',async()=>{
 const h=a.crearGuardadoPrueba({guardar:async()=>null});
 const result=await h.saveOp(data,'guardar','borrador');
 assert.ok(result.error);assert.equal(h.estado().showForm,true);
 assert.equal(h.estado().operaciones.length,0);
});
await check('respuesta con objeto vacío no confirma guardado ni cierra el formulario',async()=>{
 const h=a.crearGuardadoPrueba({guardar:async()=>({})});
 const result=await h.saveOp(data,'guardar','borrador');
 assert.ok(result.error);assert.equal(h.estado().showForm,true);
 assert.equal(h.estado().operaciones.length,0);
});
await check('respuesta con objeto vacío en sincronización conserva el borrador',async()=>{
 const h=a.crearGuardadoPrueba({guardar:async()=>({})});
 a.lsSet('draftOperacion',{data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});
 await h.sincronizarDraftOffline();
 assert.ok(a.lsGet('draftOperacion',null));
 assert.equal(h.estado().operaciones.length,0);
});
await check('respuesta vacía en sincronización conserva el borrador offline',async()=>{
 const h=a.crearGuardadoPrueba({guardar:async()=>null});
 a.lsSet('draftOperacion',{data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});
 await h.sincronizarDraftOffline();
 assert.ok(a.lsGet('draftOperacion',null));
 assert.equal(h.estado().operaciones.length,0);
});
await check('reintento de cierre sin confirmación conserva la reserva pendiente',async()=>{
 const padre={...data,id:'padre-pendiente',estado:'cerrado',proceso_estado:'pendiente_cierre_devolucion'};
 const devolucion={...data,id:'devolucion-pendiente',tipo:'devolucion_reserva',parent_id:padre.id,estado:'activo'};
 const h=a.crearGuardadoPrueba({guardar:async()=>({})},{operaciones:[padre,devolucion]});
 await h.reintentarCierresDevolucion();
 assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).proceso_estado,'pendiente_cierre_devolucion');
});
await check('reintentos simultáneos de cierre solo realizan una solicitud',async()=>{
 const padre={...data,id:'padre-concurrente',estado:'cerrado',proceso_estado:'pendiente_cierre_devolucion'};
 const devolucion={...data,id:'devolucion-concurrente',tipo:'devolucion_reserva',parent_id:padre.id,estado:'activo'};
 let resolve;const pending=new Promise(r=>{resolve=r});let calls=0;
 const h=a.crearGuardadoPrueba({guardar:async op=>{calls++;await pending;return {operacion:op}}},{operaciones:[padre,devolucion]});
 const primero=h.reintentarCierresDevolucion();const segundo=h.reintentarCierresDevolucion();
 assert.equal(calls,1);resolve();await Promise.all([primero,segundo]);
 assert.equal(calls,1);
 assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).proceso_estado,'rechazada');
});
await check('un fallo antes de confirmar la devolución no marca la reserva para cerrarla',async()=>{
 const padre={...data,id:'padre-sin-cierre',estado:'activo',proceso_estado:'aceptada'};const h=a.crearGuardadoPrueba({guardar:async()=>{throw Error('Sin conexión antes de guardar')}},{operaciones:[padre]});
 await h.saveOp({...data,tipo:'devolucion_reserva',parent_id:padre.id},'guardar','activo');assert.deepEqual(h.estado().operaciones,[padre]);assert.equal(a.lsGet('docworks:devolucion:cierre-pendiente:'+padre.id,null),null);
});
await check('si se confirmó la devolución, reintentar el cierre solo actualiza la reserva',async()=>{
 const padre={...data,id:'padre-con-cierre',estado:'activo'},calls=[];let fallaPadre=true;const h=a.crearGuardadoPrueba({guardar:async op=>{calls.push({...op});return op.id===padre.id&&fallaPadre?{error:{message:'Cierre rechazado temporalmente'}}:{operacion:op}}},{operaciones:[padre]});
 await h.saveOp({...data,tipo:'devolucion_reserva',parent_id:padre.id},'guardar','activo');assert.equal(h.estado().operaciones.filter(o=>o.tipo==='devolucion_reserva').length,1);assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).proceso_estado,'pendiente_cierre_devolucion');
 fallaPadre=false;await h.reintentarCierresDevolucion();assert.equal(calls.filter(o=>o.tipo==='devolucion_reserva').length,1);assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).proceso_estado,'rechazada');assert.equal(a.lsGet('docworks:devolucion:cierre-pendiente:'+padre.id,null),null);
});
await check('una respuesta tardía no altera el listado ni el borrador de otra sesión',async()=>{
 let resolve;const pending=new Promise(r=>{resolve=r}),h=a.crearGuardadoPrueba({guardar:()=>pending});a.lsSet('draftOperacion',{data,contexto:a.contextoBorradorOperacion(h.contexto)});const syncing=h.sincronizarDraftOffline();h.cambiarContexto({usuario:{id:'otro',rol_base:'dueno'},inmobiliaria:{id:'tenant-b'},habilitado:true});const otro={data:{...data,comprador_nombre:'Otra sesión'},contexto:{usuarioId:'otro',inmobiliariaId:'tenant-b'}};a.lsSet('draftOperacion',otro);resolve({operacion:{...data,id:'antiguo'}});await syncing;assert.equal(h.estado().operaciones.length,0);assert.deepEqual(a.lsGet('draftOperacion',null),otro);
});
let snapshot={current:null};const formProps={snapshotRef:snapshot,contextoBorrador:{usuarioId:'owner',inmobiliariaId:'tenant-a'},clausulas:[],perfil:{rol:'dueno',plantillas:{}},equipo:[],operaciones:[],onSave:async()=>({}),onCancel:()=>{},reportSave:()=>{}};
await check('una operación nueva conserva su identidad al editar y recuperar el borrador',async()=>{await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'nuevo'})));const id=snapshot.current.data.id;assert.ok(id);const compra=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Compra'));await a.act(async()=>compra.click());await a.act(async()=>document.querySelectorAll('.step-dot')[1].click());const el=document.querySelector('#dw-field-comprador_nombre');await a.act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'Nombre Escrito');el.dispatchEvent(new Event('input',{bubbles:true}))});assert.equal(snapshot.current.data.id,id);const draft=a.lsGet('draftOperacion',null);assert.equal(draft.editId,id);await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'recuperado',initial:draft.data})));assert.equal(snapshot.current.data.id,id);assert.equal(snapshot.current.data.comprador_nombre,'Nombre Escrito')});

await check('identidad técnica no convierte un formulario vacío en una operación',async()=>{await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'vacio'})));assert.ok(snapshot.current.data.id);assert.equal(a.draftTieneContenido(snapshot.current.data),false)});
await check('autorización no imprime cotitulares del comprador y al volver conserva sus datos',async()=>{
 const original={...data,id:'cambio-tipo',tipo:'comodato',comprador_nombre:'Compradora Real',comprador_telefono_en_doc:true,comprador_cotitulares:[{nombre:'Cotitular Real',dni:'30123456'}]};
 await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'cambio-tipo',initial:original,perfil:{rol:'dueno',nombre:'Inmobiliaria Prueba',matricula:'1234',plantillas:{}}})));
 await a.act(async()=>document.querySelector('.step-dot').click());const byText=t=>[...document.querySelectorAll('.dw-grupo-tipo-card')].find(x=>x.textContent.includes(t));
 await a.act(async()=>byText('Autorización de Venta').click());assert.equal(snapshot.current.data.comprador_nombre,'Inmobiliaria Prueba');assert.deepEqual(snapshot.current.data.comprador_cotitulares,[]);assert.ok(!a.docToPlainText(a.buildDocSections(a.opParaDocumento(snapshot.current.data),[],'exclusividad')).includes('Cotitular Real'));
 await a.act(async()=>byText('Comodato').click());assert.equal(snapshot.current.data.comprador_nombre,original.comprador_nombre);assert.deepEqual(snapshot.current.data.comprador_cotitulares,original.comprador_cotitulares);assert.equal(snapshot.current.data.comprador_telefono_en_doc,true);
});
await check('los datos automáticos de la inmobiliaria no cuentan como una autorización completada',async()=>{
 await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'autorizacion-vacia',initial:{...a.EMPTY_OP,tipo:'exclusividad'},perfil:{rol:'dueno',nombre:'Inmobiliaria Prueba',matricula:'1234',direccion:'Dirección institucional',email:'correo@example.test',telefono:'111111',plantillas:{}}})));
 assert.equal(a.draftTieneContenido(snapshot.current.data),false);
});
await check('una autorización recuperada no inventa al comodatario con el nombre de la inmobiliaria',async()=>{
 await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'autorizacion-recuperada',initial:{...data,id:'autorizacion',tipo:'exclusividad',comprador_nombre:'Inmobiliaria Prueba',exclusividad_inmobiliaria_autofill:true},perfil:{rol:'dueno',nombre:'Inmobiliaria Prueba',matricula:'1234',plantillas:{}}})));
 await a.act(async()=>document.querySelector('.step-dot').click());await a.act(async()=>[...document.querySelectorAll('.dw-grupo-tipo-card')].find(x=>x.textContent.includes('Comodato')).click());assert.equal(snapshot.current.data.comprador_nombre,'');assert.equal(snapshot.current.data.comprador_dni,'');assert.deepEqual(snapshot.current.data.comprador_cotitulares,[]);
});
await check('cambiar el tipo al guardar captura el modelo correcto y mantiene el ID',async()=>{let saved;const h=a.crearGuardadoPrueba({guardar:async op=>{saved=op;return {operacion:op}}},{editOp:{...data,id:'existente',tipo:'comodato',plantilla_snapshot:{tipo:'comodato',version:1}}});await h.saveOp({...data,tipo:'exclusividad'},'guardar','borrador');assert.equal(saved.id,'existente');assert.equal(saved.plantilla_snapshot.tipo,'exclusividad')});
await check('sincronización recuperada agrega la operación aunque el listado aún no la tuviera',async()=>{const h=a.crearGuardadoPrueba({guardar:async op=>({operacion:op})});a.lsSet('draftOperacion',{data:{...data,id:'pendiente'},editId:'pendiente',contexto:a.contextoBorradorOperacion(h.contexto)});await h.sincronizarDraftOffline();assert.equal(h.estado().operaciones.length,1);assert.equal(h.estado().operaciones[0].id,'pendiente');assert.ok(h.estado().operaciones[0].plantilla_snapshot)});
await a.act(async()=>root.unmount());dom.window.close();console.log('RESULTADO '+checks+' aprobadas, '+failures+' fallas.');if(failures)process.exitCode=1;
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1});
