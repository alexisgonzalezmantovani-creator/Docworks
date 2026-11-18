const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),ts=require('typescript'),{JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-resiliente-')),dom=new JSDOM('<div id="root"></div>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];global.IS_REACT_ACT_ENVIRONMENT=true;
let cambioTipoPendiente=null;
window.addEventListener('dw:confirm',ev=>{
 if(String(ev.detail?.message||'').includes('Cambiar el tipo de documento'))cambioTipoPendiente=ev.detail.onConfirm;
});
global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};HTMLElement.prototype.scrollIntoView=()=>{};window.scrollTo=()=>{};
Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});Object.defineProperty(navigator,'onLine',{value:true,configurable:true});
const source=fs.readFileSync(dir+'/src/App.tsx','utf8'),parsed=ts.createSourceFile('App.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),fns={};(function visit(n){if(ts.isFunctionDeclaration(n)&&n.name)fns[n.name.text]=n.getText(parsed);ts.forEachChild(n,visit)})(parsed);
const harness=`
function crearGuardadoPrueba(servidor,inicial={}){
 let operaciones=inicial.operaciones||[],editOp=inicial.editOp||null,showForm=true,formInitialOverride=null;
 const perfil={rol:'dueno',plantillas:{}},clausulas=[],bloquesReserva=[];
 const contexto={usuario:{id:'owner',rol_base:'dueno'},inmobiliaria:{id:'tenant-a'},habilitado:true},docworksAuth={contexto,session:{}},opsSupabase=servidor;
 const accionesContextoRef={current:crearControlContextoOperaciones(claveContextoOperaciones(contexto))},formSaveIdRef={current:null},formSnapshotRef={current:null},showFormRef={current:false},draftPromptRef={current:null},sincronizacionDraftEnCursoRef={current:false},cierresDevolucionEnCursoRef={current:false},documentosPendientesRef={current:new Map()};
 const setOperaciones=f=>{operaciones=typeof f==='function'?f(operaciones):f},setEditOp=x=>{editOp=x},setShowForm=x=>{showForm=x},setFormInitialOverride=x=>{formInitialOverride=x};
 const marcarOperacionPendiente=()=>{},desmarcarOperacionPendiente=()=>{},reportSave=()=>{},setDocAutoAction=()=>{},abrirDoc=()=>{},setFormTipo=()=>{};
 ${fns.saveOp}
 ${fns.sincronizarDraftOffline}
 ${fns.reintentarCierresDevolucion}
 ${fns.crearDocumentoConfirmado}
 return {saveOp,sincronizarDraftOffline,reintentarCierresDevolucion,crearDocumentoConfirmado,estado:()=>({operaciones,showForm}),contexto,cambiarContexto(c){docworksAuth.contexto=c;accionesContextoRef.current.actualizar(claveContextoOperaciones(c));}};
}
function crearConfirmacionGuardadoPrueba(servidor){
 let operaciones=[{id:'restaurable',tipo:'reserva',comprador_nombre:'Versión vigente'}];
 let showForm=true,guardandoSalida=false,errorSalida='',confirmCloseForm=true,view='operaciones',navPendiente=null,viewDoc=null;
 const opsSupabase=servidor,perfil={rol:'dueno',plantillas:{}},clausulas=[],bloquesReserva=[];
 const draftData={...EMPTY_OP,...SAMPLE_OP_PREVIEW,tipo:'reserva',comprador_nombre:'Borrador en edición'};
 const formSnapshotRef={current:{data:draftData,editId:null}},formSaveIdRef={current:null};
 const salidaEnCursoRef={current:false},salidaRevisionRef={current:0};
 const accionesContextoRef={current:{capturar:()=>()=>true}};
 const setOperaciones=f=>{operaciones=typeof f==='function'?f(operaciones):f};
 const setViewDoc=f=>{viewDoc=typeof f==='function'?f(viewDoc):f};
 const setGuardandoSalida=v=>{guardandoSalida=v},setErrorSalida=v=>{errorSalida=v};
 const setConfirmCloseForm=v=>{confirmCloseForm=v},setShowForm=v=>{showForm=v};
 const setEditOp=()=>{},setFormInitialOverride=()=>{},setView=v=>{view=v},setNavPendiente=v=>{navPendiente=v};
 const marcarOperacionPendiente=()=>{},desmarcarOperacionPendiente=()=>{};
 const borradorFormularioActual=()=>formSnapshotRef.current;
 ${fns.guardarBorradorYSalir}
 ${fns.salirSinGuardarFormulario}
 ${fns.restaurarVersion}
 return {guardarBorradorYSalir,salirSinGuardarFormulario,restaurarVersion,estado:()=>({operaciones,showForm,guardandoSalida,errorSalida,confirmCloseForm,view,viewDoc,formSnapshot:formSnapshotRef.current}),
   cambiarBorrador:(cambios)=>{
    const actual=formSnapshotRef.current;
    const nuevo={...actual,data:{...actual.data,...cambios}};
    formSnapshotRef.current=nuevo;
    lsSet('draftOperacion',{...nuevo,ts:Date.now()});
   },
   restaurarFormularioSinCambios:()=>{
    // Simular un render real de OperacionForm: el estado del usuario conserva
    // sus campos y no incluye metadatos agregados para la RPC.
    const actual=formSnapshotRef.current;
    const crudo={...actual,data:{...draftData}};
    formSnapshotRef.current=crudo;
    lsSet('draftOperacion',{...crudo,ts:Date.now()});
   },
   abrirVista:(op)=>{viewDoc=op}};
}
import {act,createElement} from 'react';import {createRoot} from 'react-dom/client';
export {crearGuardadoPrueba,crearConfirmacionGuardadoPrueba,act,createElement,createRoot,OperacionForm,EMPTY_OP,SAMPLE_OP_PREVIEW,lsSet,lsGet,contextoBorradorOperacion,draftTieneContenido,buildDocSections,opParaDocumento,docToPlainText};`;
require('esbuild').buildSync({stdin:{contents:source+'\n'+harness,resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
const a=require(tmp+'/app.cjs'),root=a.createRoot(document.getElementById('root'));let checks=0,failures=0;
async function confirmarCambioTipo(){
 const aceptar=cambioTipoPendiente;cambioTipoPendiente=null;
 assert.equal(typeof aceptar,'function','Un cambio de documento con datos debe solicitar confirmación');
 await a.act(async()=>aceptar());
}async function check(label,fn){try{await fn();checks++;console.log('OK',label)}catch(e){failures++;console.error('FALLA',label,e.message)}}
const data={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',comprador_nombre:'Compradora de prueba'};
(async()=>{
await check('documentos nuevos: sin confirmación del mismo ID no aparecen como creados',async()=>{
 for(const modo of ['nulo','vacio','id-distinto']){
  const h=a.crearGuardadoPrueba({guardar:async op=>modo==='nulo'?null:modo==='vacio'?{}:{operacion:{...op,id:'id-ajeno'}}});
  const res=await h.crearDocumentoConfirmado({...data,tipo:'boleto'},'boleto',false);
  assert.ok(res?.error,'la respuesta '+modo+' debe rechazarse');
  assert.equal(h.estado().operaciones.length,0,'no se inventan documentos');
 }
});
await check('documentos nuevos: confirmación válida crea una sola operación',async()=>{
 let llamadas=0;
 const h=a.crearGuardadoPrueba({guardar:async op=>{llamadas++;return {operacion:{...op,inmueble_direccion:'Dirección confirmada'}}}});
 const res=await h.crearDocumentoConfirmado({...data,tipo:'boleto'},'boleto',false);
 assert.ok(!res.error);
 assert.equal(llamadas,1);
 assert.equal(h.estado().operaciones.length,1);
 assert.equal(h.estado().operaciones[0].id,res.operacion.id);
 assert.equal(h.estado().operaciones[0].inmueble_direccion,'Dirección confirmada','se usa la confirmación del servidor');
});
await check('guardar borrador: respuesta vacía conserva formulario y copia local',async()=>{
 for(const guardar of [async()=>null,async()=>({}),async()=>({operacion:{id:'otro-id'}})]){
  const h=a.crearConfirmacionGuardadoPrueba({guardar});
  await h.guardarBorradorYSalir();
  const estado=h.estado();
  assert.equal(estado.showForm,true);
  assert.equal(estado.confirmCloseForm,true);
  assert.match(estado.errorSalida,/No se pudo guardar/);
  assert.equal(estado.operaciones.length,1,'no se inventa una operación guardada');
  assert.ok(a.lsGet('draftOperacion',null)?.data?.id,'el borrador se conserva para recuperar');
 }
});
await check('guardar y salir no confunde formulario sin cambios con operación enriquecida',async()=>{
 let confirmar;const pendiente=new Promise(r=>{confirmar=r});
 const h=a.crearConfirmacionGuardadoPrueba({guardar:async op=>{await pendiente;return {operacion:op};}});
 const guardando=h.guardarBorradorYSalir();
 const enviado=a.lsGet('draftOperacion',null);
 assert.ok(enviado?.editId,'se asignó ID antes de esperar al servidor');
 h.restaurarFormularioSinCambios();
 confirmar();await guardando;
 assert.equal(h.estado().showForm,false,'debe cerrar cuando el usuario no cambió los datos');
 assert.equal(h.estado().confirmCloseForm,false);
 assert.equal(h.estado().errorSalida,'','no hay cambios pendientes falsos');
 assert.equal(a.lsGet('draftOperacion',null),null,'limpia el mismo borrador confirmado');
 assert.equal(h.estado().operaciones.find(o=>o.id===enviado.editId)?.comprador_nombre,'Borrador en edición');
});
await check('guardar y salir preserva ediciones hechas mientras responde Supabase',async()=>{
 let confirmar;const pendiente=new Promise(r=>{confirmar=r});let intentos=0,ids=[];
 const h=a.crearConfirmacionGuardadoPrueba({guardar:async op=>{
   intentos++;ids.push(op.id);
   if(intentos===1)await pendiente;
   return {operacion:op};
 }});
 const guardando=h.guardarBorradorYSalir();
 const enviado=a.lsGet('draftOperacion',null);
 assert.ok(enviado?.editId,'se conserva el ID antes de enviar');
 h.cambiarBorrador({comprador_nombre:'Modificación durante guardado'});
 confirmar();await guardando;
 assert.equal(h.estado().showForm,true,'el formulario no se cierra al guardar una versión anterior');
 assert.equal(h.estado().confirmCloseForm,true,'el diálogo de salida queda disponible');
 assert.match(h.estado().errorSalida,/cambios más recientes/,'se explica por qué sigue abierto');
 assert.equal(a.lsGet('draftOperacion',null).data.comprador_nombre,'Modificación durante guardado','el borrador nuevo no se borra');
 assert.equal(h.estado().operaciones.find(o=>o.id===enviado.editId)?.comprador_nombre,'Borrador en edición','el primer guardado fue confirmado');
 await h.guardarBorradorYSalir();
 assert.equal(intentos,2,'permite reintentar guardando los cambios recientes');
 assert.equal(ids[0],ids[1],'no crea una segunda operación');
 assert.equal(h.estado().showForm,false,'cierra solo después de confirmar la última versión');
 assert.equal(h.estado().operaciones.find(o=>o.id===enviado.editId)?.comprador_nombre,'Modificación durante guardado');
 assert.equal(a.lsGet('draftOperacion',null),null,'limpia el borrador confirmado');
});
await check('no se puede descartar el borrador mientras Supabase confirma el guardado',async()=>{
 let resolver;const pendiente=new Promise(r=>{resolver=r});
 const h=a.crearConfirmacionGuardadoPrueba({guardar:async op=>{await pendiente;return {operacion:op};}});
 const guardando=h.guardarBorradorYSalir();
 assert.equal(h.estado().guardandoSalida,true,'está guardando en el servidor');
 const local=a.lsGet('draftOperacion',null);
 assert.ok(local?.data?.id,'la copia local existe mientras guarda');
 h.salirSinGuardarFormulario();
 assert.equal(h.estado().showForm,true,'no se sale con la petición enviada');
 assert.equal(h.estado().confirmCloseForm,true,'no se oculta el diálogo prematuramente');
 assert.deepEqual(a.lsGet('draftOperacion',null),local,'no se borra el borrador en curso');
 resolver();await guardando;
 assert.equal(h.estado().showForm,false,'el guardado exitoso permite salir');
 assert.equal(h.estado().operaciones.length,2,'la operación confirmada aparece una sola vez');
 assert.equal(a.lsGet('draftOperacion',null),null,'el borrador se limpia después de confirmar');
});
await check('guardar borrador: confirmación válida permite salir sin duplicar',async()=>{
 const h=a.crearConfirmacionGuardadoPrueba({guardar:async op=>({operacion:op})});
 await h.guardarBorradorYSalir();
 const estado=h.estado();
 assert.equal(estado.showForm,false);
 assert.equal(estado.confirmCloseForm,false);
 assert.equal(estado.operaciones.length,2);
 assert.equal(a.lsGet('draftOperacion',null),null);
});
await check('restaurar versión: sin respuesta o ID ajeno conserva lo vigente',async()=>{
 const version={version:2,documento:{id:'restaurable',tipo:'reserva',datos:{tipo:'reserva',comprador_nombre:'Versión histórica'}}};
 for(const guardar of [async()=>null,async()=>({}),async()=>({operacion:{id:'otra-operacion'}})]){
  const h=a.crearConfirmacionGuardadoPrueba({guardar});
  h.abrirVista({id:'restaurable',tipo:'reserva',comprador_nombre:'Versión vigente'});
  const res=await h.restaurarVersion(version);
  assert.ok(res?.error,'no se puede informar restauración sin confirmación');
  assert.equal(h.estado().operaciones[0].comprador_nombre,'Versión vigente');
  assert.equal(h.estado().viewDoc.comprador_nombre,'Versión vigente');
 }
});
await check('restaurar versión: servidor confirma y refresca lista y visor',async()=>{
 const version={version:2,documento:{id:'restaurable',tipo:'reserva',datos:{tipo:'reserva',comprador_nombre:'Versión histórica'}}};
 const h=a.crearConfirmacionGuardadoPrueba({guardar:async op=>({operacion:{...op,comprador_nombre:'Versión histórica confirmada'}})});
 h.abrirVista({id:'restaurable',tipo:'reserva',comprador_nombre:'Versión vigente'});
 const res=await h.restaurarVersion(version);
 assert.equal(res?.operacion?.id,'restaurable');
 assert.equal(h.estado().operaciones[0].comprador_nombre,'Versión histórica confirmada');
 assert.equal(h.estado().viewDoc.comprador_nombre,'Versión histórica confirmada');
});
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
await check('guardar operación: una confirmación de otro ID no cierra el formulario',async()=>{
 const h=a.crearGuardadoPrueba({guardar:async op=>({operacion:{...op,id:'otra-operacion'}})});
 const respuesta=await h.saveOp(data,'guardar','borrador');
 assert.ok(respuesta.error,'una operación ajena no confirma el guardado');
 assert.equal(h.estado().showForm,true,'el formulario no se cierra');
 assert.equal(h.estado().operaciones.length,0,'la operación ajena no se añade al listado');
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
await check('sincronización offline: ID ajeno conserva el borrador y permite reintentar',async()=>{
 const ids=[];const h=a.crearGuardadoPrueba({guardar:async op=>{
  ids.push(op.id);
  return {operacion:ids.length===1?{...op,id:'id-ajeno'}:op};
 }});
 a.lsSet('draftOperacion',{data,editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});
 await h.sincronizarDraftOffline();
 const pendiente=a.lsGet('draftOperacion',null);
 assert.ok(pendiente?.data?.id,'el borrador se conserva al recibir otro ID');
 assert.equal(h.estado().operaciones.length,0,'no incorpora operaciones ajenas');
 await h.sincronizarDraftOffline();
 assert.equal(ids.length,2);
 assert.equal(ids[0],ids[1],'el reintento mantiene el identificador original');
 assert.equal(a.lsGet('draftOperacion',null),null,'la confirmación correcta limpia el borrador');
 assert.equal(h.estado().operaciones[0]?.id,ids[0]);
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
await check('cierre pendiente: respuesta de otra reserva no confirma ni borra el pendiente',async()=>{
 const padre={...data,id:'padre-cierre-id-erroneo',estado:'cerrado',proceso_estado:'pendiente_cierre_devolucion'};
 const devolucion={...data,id:'devolucion-cierre-id-erroneo',tipo:'devolucion_reserva',parent_id:padre.id,estado:'activo'};
 let intentos=0;const h=a.crearGuardadoPrueba({guardar:async op=>{
  intentos++;
  return {operacion:intentos===1?{...op,id:'otra-reserva'}:op};
 }},{operaciones:[padre,devolucion]});
 await h.reintentarCierresDevolucion();
 assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).proceso_estado,'pendiente_cierre_devolucion');
 await h.reintentarCierresDevolucion();
 assert.equal(intentos,2,'el cierre debe poder reintentarse');
 assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).proceso_estado,'rechazada');
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
await check('cambio de inmobiliaria durante el cierre no modifica operaciones de la sesión nueva',async()=>{
 const padre={...data,id:'padre-cambio-tenant',estado:'cerrado',proceso_estado:'pendiente_cierre_devolucion'};
 const devolucion={...data,id:'devolucion-cambio-tenant',tipo:'devolucion_reserva',parent_id:padre.id,estado:'activo'};
 let resolve;const pending=new Promise(r=>{resolve=r});
 const h=a.crearGuardadoPrueba({guardar:async op=>{await pending;return {operacion:op}}},{operaciones:[padre,devolucion]});
 const guardando=h.reintentarCierresDevolucion();
 h.cambiarContexto({usuario:{id:'otro',rol_base:'dueno'},inmobiliaria:{id:'tenant-b'},habilitado:true});
 resolve();await guardando;
 assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).proceso_estado,'pendiente_cierre_devolucion');
});
await check('devolución confirmada y cierre sin respuesta conserva marca de reintento',async()=>{
 const padre={...data,id:'padre-respuesta-vacia',tipo:'reserva',estado:'activo'};
 const devolucion={...data,id:'devolucion-respuesta-vacia',tipo:'devolucion_reserva',parent_id:padre.id};
 const h=a.crearGuardadoPrueba({guardar:async op=>op.id===padre.id?{}:{operacion:op}},{operaciones:[padre]});
 await h.saveOp(devolucion,'guardar','activo');
 const estado=h.estado();
 assert.equal(estado.showForm,false);
 assert.equal(estado.operaciones.find(o=>o.id===padre.id).proceso_estado,'pendiente_cierre_devolucion');
 assert.equal(estado.operaciones.filter(o=>o.id===devolucion.id).length,1);
});
await check('devolución confirmada con cierre de otra reserva conserva cierre pendiente',async()=>{
 const padre={...data,id:'padre-cierre-ajeno',tipo:'reserva',estado:'activo'};
 const devolucion={...data,id:'devolucion-cierre-ajeno',tipo:'devolucion_reserva',parent_id:padre.id};
 const h=a.crearGuardadoPrueba({guardar:async op=>({operacion:op.id===padre.id?{...op,id:'otra-reserva'}:op})},{operaciones:[padre]});
 await h.saveOp(devolucion,'guardar','activo');
 assert.equal(h.estado().showForm,false,'la devolución confirmada permite salir');
 assert.equal(h.estado().operaciones.filter(o=>o.id===devolucion.id).length,1,'no duplica la devolución');
 assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).proceso_estado,'pendiente_cierre_devolucion');
 assert.ok(a.lsGet('docworks:devolucion:cierre-pendiente:'+padre.id,null),'deja el reintento marcado');
});
await check('devolución confirmada deja reserva cerrada y rechazada según servidor',async()=>{
 const padre={...data,id:'padre-cierre-ok',tipo:'reserva',estado:'activo'};
 const devolucion={...data,id:'devolucion-cierre-ok',tipo:'devolucion_reserva',parent_id:padre.id};
 const h=a.crearGuardadoPrueba({guardar:async op=>({operacion:op.id===padre.id?{...op,proceso_estado:'rechazada',estado:'cerrado'}:op})},{operaciones:[padre]});
 await h.saveOp(devolucion,'guardar','activo');
 assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).estado,'cerrado');
 assert.equal(h.estado().operaciones.find(o=>o.id===padre.id).proceso_estado,'rechazada');
 assert.equal(h.estado().operaciones.filter(o=>o.id===devolucion.id).length,1);
});
await check('borrador creado mientras se espera respuesta mantiene el formulario abierto',async()=>{
 let resolve;const pending=new Promise(r=>{resolve=r});
 const h=a.crearGuardadoPrueba({guardar:async op=>{await pending;return {operacion:op}}});
 a.lsSet('draftOperacion',null);
 const guardando=h.saveOp(data,'guardar','borrador');
 a.lsSet('draftOperacion',{data:{...data,comprador_nombre:'Borrador creado durante espera'},editId:null,contexto:a.contextoBorradorOperacion(h.contexto)});
 resolve();const resultado=await guardando;
 assert.equal(resultado.borradorPendiente,true);
 assert.equal(h.estado().showForm,true);
 assert.equal(a.lsGet('draftOperacion',null).data.comprador_nombre,'Borrador creado durante espera');
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

await check('la última tecla llega al borrador si el iPhone oculta la app antes del render',async()=>{
 await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'pagehide-ultimo-cambio'})));
 const compra=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Compra'));
 await a.act(async()=>compra.click());
 await a.act(async()=>document.querySelectorAll('.step-dot')[1].click());
 const campo=document.querySelector('#dw-field-comprador_nombre');
 assert.ok(campo,'El campo de nombre está presente');
 const valor='Cambio guardado al ocultar la aplicación';
 await a.act(async()=>{
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(campo,valor);
  campo.dispatchEvent(new Event('input',{bubbles:true}));
  // La suspensión ocurre ANTES de resolver la actualización de React.
  window.dispatchEvent(new Event('pagehide'));
  const pendiente=a.lsGet('draftOperacion',null);
  assert.equal(pendiente.data.comprador_nombre,valor);
  assert.equal(pendiente.editId,pendiente.data.id);
 });
 assert.equal(snapshot.current.data.comprador_nombre,valor);
});
await check('recarga tras WhatsApp conserva el paso y la información escrita',async()=>{
 await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'paso-navegacion'})));
 const compra=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Compra'));
 await a.act(async()=>compra.click());
 await a.act(async()=>document.querySelectorAll('.step-dot')[1].click());
 const campo=document.querySelector('#dw-field-comprador_nombre');assert.ok(campo);
 await a.act(async()=>{
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(campo,'Nombre desde WhatsApp');
  campo.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await a.act(async()=>document.querySelectorAll('.step-dot')[3].click());
 window.dispatchEvent(new Event('pagehide'));
 const draft=a.lsGet('draftOperacion',null);
 assert.equal(draft.navigation.step,4);
 assert.equal(draft.navigation.grupo,'compra');
 assert.equal(draft.data.comprador_nombre,'Nombre desde WhatsApp');
 await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'paso-restaurado',initial:draft.data,resumeNavigation:draft.navigation})));
 assert.equal(document.querySelectorAll('.step-dot')[3].getAttribute('data-active'),'1');
 assert.equal(snapshot.current.data.comprador_nombre,'Nombre desde WhatsApp');
});
await check('identidad técnica no convierte un formulario vacío en una operación',async()=>{await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'vacio'})));assert.ok(snapshot.current.data.id);assert.equal(a.draftTieneContenido(snapshot.current.data),false)});
await check('autorización no imprime cotitulares del comprador y al volver conserva sus datos',async()=>{
 const original={...data,id:'cambio-tipo',tipo:'comodato',comprador_nombre:'Compradora Real',comprador_telefono_en_doc:true,comprador_cotitulares:[{nombre:'Cotitular Real',dni:'30123456'}]};
 await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'cambio-tipo',initial:original,perfil:{rol:'dueno',nombre:'Inmobiliaria Prueba',matricula:'1234',plantillas:{}}})));
 await a.act(async()=>document.querySelector('.step-dot').click());const byText=t=>[...document.querySelectorAll('.dw-grupo-tipo-sections .dw-grupo-card')].find(x=>x.textContent.includes(t));
 await a.act(async()=>byText('Autorización de Venta').click());assert.equal(snapshot.current.data.comprador_nombre,original.comprador_nombre,'Antes de confirmar debe conservar los datos del comprador');await confirmarCambioTipo();assert.equal(snapshot.current.data.comprador_nombre,'Inmobiliaria Prueba');assert.deepEqual(snapshot.current.data.comprador_cotitulares,[]);assert.ok(!a.docToPlainText(a.buildDocSections(a.opParaDocumento(snapshot.current.data),[],'exclusividad')).includes('Cotitular Real'));
 // Después de elegir Autorización se avanza al paso 2; para volver a Comodato se abre Tipo.
 await a.act(async()=>document.querySelector('.step-dot').click());
 await a.act(async()=>byText('Comodato').click());await confirmarCambioTipo();assert.equal(snapshot.current.data.comprador_nombre,original.comprador_nombre);assert.deepEqual(snapshot.current.data.comprador_cotitulares,original.comprador_cotitulares);assert.equal(snapshot.current.data.comprador_telefono_en_doc,true);
});
await check('los datos automáticos de la inmobiliaria no cuentan como una autorización completada',async()=>{
 await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'autorizacion-vacia',initial:{...a.EMPTY_OP,tipo:'exclusividad'},perfil:{rol:'dueno',nombre:'Inmobiliaria Prueba',matricula:'1234',direccion:'Dirección institucional',email:'correo@example.test',telefono:'111111',plantillas:{}}})));
 assert.equal(a.draftTieneContenido(snapshot.current.data),false);
});
await check('una autorización recuperada no inventa al comodatario con el nombre de la inmobiliaria',async()=>{
 await a.act(async()=>root.render(a.createElement(a.OperacionForm,{...formProps,key:'autorizacion-recuperada',initial:{...data,id:'autorizacion',tipo:'exclusividad',comprador_nombre:'Inmobiliaria Prueba',exclusividad_inmobiliaria_autofill:true},perfil:{rol:'dueno',nombre:'Inmobiliaria Prueba',matricula:'1234',plantillas:{}}})));
 await a.act(async()=>document.querySelector('.step-dot').click());await a.act(async()=>{const comodato=[...document.querySelectorAll('.dw-grupo-tipo-sections .dw-grupo-card')].find(x=>x.textContent.includes('Comodato'));assert.ok(comodato,'El botón Comodato debe aparecer en Otros documentos');comodato.click();});await confirmarCambioTipo();assert.equal(snapshot.current.data.comprador_nombre,'');assert.equal(snapshot.current.data.comprador_dni,'');assert.deepEqual(snapshot.current.data.comprador_cotitulares,[]);
});
await check('cambiar el tipo al guardar captura el modelo correcto y mantiene el ID',async()=>{let saved;const h=a.crearGuardadoPrueba({guardar:async op=>{saved=op;return {operacion:op}}},{editOp:{...data,id:'existente',tipo:'comodato',plantilla_snapshot:{tipo:'comodato',version:1}}});await h.saveOp({...data,tipo:'exclusividad'},'guardar','borrador');assert.equal(saved.id,'existente');assert.equal(saved.plantilla_snapshot.tipo,'exclusividad')});
await check('sincronización recuperada agrega la operación aunque el listado aún no la tuviera',async()=>{const h=a.crearGuardadoPrueba({guardar:async op=>({operacion:op})});a.lsSet('draftOperacion',{data:{...data,id:'pendiente'},editId:'pendiente',contexto:a.contextoBorradorOperacion(h.contexto)});await h.sincronizarDraftOffline();assert.equal(h.estado().operaciones.length,1);assert.equal(h.estado().operaciones[0].id,'pendiente');assert.ok(h.estado().operaciones[0].plantilla_snapshot)});
await a.act(async()=>root.unmount());dom.window.close();console.log('RESULTADO '+checks+' aprobadas, '+failures+' fallas.');if(failures)process.exitCode=1;
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1});
