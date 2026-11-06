const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const ts=require('typescript'),esbuild=require('esbuild'),{JSDOM}=require('jsdom');
const dom=new JSDOM('<html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class {constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage&&this.port1.onmessage({data:undefined}),0)};}};
HTMLElement.prototype.scrollIntoView=function(){};window.scrollTo=function(){};
let currentUser='owner',sessionPause=null,loaderPause=null,writePause=null,rejectWrite=null,calls=[];
const row={id:'op-own',tipo:'reserva',estado:'activo',parent_id:null,datos:{comprador_nombre:'[COMPRADOR]',vendedor_nombre:'[VENDEDOR]',broker_id:'broker',created_at:'2026-11-02T12:00:00Z'},creado_en:'2026-11-02T12:00:00Z'};
const client={auth:{getSession:()=>sessionPause?sessionPause.promise:Promise.resolve({data:{session:currentUser?{user:{id:currentUser}}:null}})},
 rpc(name,args){calls.push({name,args});if(name==='fn_operaciones_listar')return Promise.resolve({data:[row]});if(name==='fn_operaciones_papelera')return Promise.resolve({data:[{...row,id:'trash',eliminado_en:'2026-11-02T12:00:00Z'}]});if(name==='fn_operaciones_purgar_vencidas')return Promise.resolve({data:null});if(rejectWrite)return Promise.reject(rejectWrite);return writePause?writePause.promise:Promise.resolve({data:args.p_datos?[{...row,id:args.p_id,datos:args.p_datos}]:null});},
 channel(){return {on(){return this},subscribe(){return this}}},removeChannel(){},
 from(){return {select(){return this},eq(){return this},order(){return Promise.resolve({data:[{id:'v1',version:1,documento:{id:'op-own',datos:{}},tipo_documento:'reserva'}]})}}}
};
global.__loadOperationsClient=()=>loaderPause?loaderPause.promise:Promise.resolve(client);
const rootDir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-roles-'));
let source=fs.readFileSync(path.join(rootDir,'src/App.tsx'),'utf8');
source=source.replace('dwObtenerSesionRobusta, loadSupabaseJs }','dwObtenerSesionRobusta }')+'\nfunction loadSupabaseJs(){return globalThis.__loadOperationsClient();}';
// Se prueban los handlers reales extraídos por AST, con cierres de estado ficticios.
const parsed=ts.createSourceFile('App.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),functions={};
function walk(node){if(ts.isFunctionDeclaration(node)&&node.name){functions[node.name.text]=node.getText(parsed);}ts.forEachChild(node,walk)}walk(parsed);
const handlerNames=['accionPapeleraConfirmada','eliminarOpDirecto','restoreOp','deleteOpPermanente','vaciarPapelera','crearDocumentoConfirmado','sincronizarDraftOffline','duplicarOp','yaConvertido','convertirAContrato','convertirARefuerzo','onConvertirDevolucion','convertirABoleto','convertirAComodato'];
for(const name of handlerNames)assert.ok(functions[name],name);
source+=`\nfunction crearAccionesPrueba(inicial,servidor,contexto){
 let operaciones=inicial.operaciones.slice(),papelera=inicial.papelera.slice(),editOp=null,formTipo=null,showForm=false,confirmVaciar=true;
 const perfil=inicial.perfil||{rol:"dueno",plantillas:{}},clausulas=[],bloquesReserva=[];
 const docworksAuth={contexto,session:{}},opsSupabase=servidor,documentosPendientesRef={current:new Map()},showFormRef={current:false},draftPromptRef={current:null},accionesContextoRef={current:crearControlContextoOperaciones(claveContextoOperaciones(contexto))};
 const setOperaciones=f=>{operaciones=typeof f==='function'?f(operaciones):f},setPapelera=f=>{papelera=typeof f==='function'?f(papelera):f};
 const setEditOp=x=>{editOp=x},setFormTipo=x=>{formTipo=x},setShowForm=x=>{showForm=x},setConfirmVaciarPapelera=x=>{confirmVaciar=x};
 ${handlerNames.map(n=>functions[n]).join('\n')}
 return {${handlerNames.join(',')},estado:()=>({operaciones,papelera,editOp,formTipo,showForm,confirmVaciar}),cambiarContexto(c){docworksAuth.contexto=c;accionesContextoRef.current.actualizar(claveContextoOperaciones(c));}};
}
import {act,createElement} from 'react';import {createRoot} from 'react-dom/client';
export {act,createElement,createRoot,useOperacionesSupabase,DashboardView,PapeleraView,OperacionForm,DocumentHeaderActions,NegociacionPanel,ReservaDecisionPanel,contextoBorradorOperacion,borradorDelContexto,crearAccionesPrueba,permisosOperacion,prepararAltaOperacion,crearControlContextoOperaciones,ejecutarCambioConfirmado,lsGet,lsSet,lsRemove};`;
esbuild.buildSync({stdin:{contents:source,resolveDir:path.join(rootDir,'src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'app.cjs')});
const app=require(path.join(tmp,'app.cjs')),mount=app.createRoot(document.getElementById('test'));
let count=0,api;function check(label,fn){fn();count++;console.log('OK',label)}
const context=(role='dueno',id='owner',tenant='tenant-a')=>({usuario:{id,rol_base:role},inmobiliaria:{id:tenant},habilitado:true});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
const buttons=()=>Array.from(document.querySelectorAll('button'));const button=t=>buttons().find(b=>b.textContent.trim()===t);
async function render(element){await app.act(async()=>{mount.render(element);await Promise.resolve()});}
async function click(el){assert.ok(el,'botón esperado');await app.act(async()=>el.click());}
function Hook({ctx}){api=app.useOperacionesSupabase(ctx);return null;}
async function hook(ctx){await render(app.createElement(Hook,{ctx}));}
const fakeOp={...row.datos,id:'op-own',tipo:'reserva',estado:'activo'};
const dashboardProps={operaciones:[fakeOp],clausulas:[],perfil:{rol:'dueno'},bloquesReserva:[],papelera:[],onNew(){},onEdit(){},onDelete(){},onViewDoc(){},onChangeEstado(){},onDuplicar(){},onRestoreVersion(){},onConvertir(){},onConvertirComodato(){},onConvertirRefuerzo(){},onConvertirBoleto(){},onConvertirDevolucion(){}};
const initial={operaciones:[fakeOp],papelera:[{...fakeOp,id:'trash',deleted_at:'2026-11-02T12:00:00Z'}]};
(async()=>{try{
 for(const role of ['dueno','admin','broker','vendedor','viewer']){
  const id=['broker','vendedor'].includes(role)?role:'owner';currentUser=id;
  await render(app.createElement(app.DashboardView,{...dashboardProps,usuarioActual:{id,rol_base:role}}));
  check('Nueva operación por rol '+role,()=>assert.equal(!!buttons().find(b=>b.textContent.includes('Nueva operación')),role!=='viewer'));
  check('Editar por rol '+role,()=>assert.equal(!!button('Editar'),['dueno','admin','broker'].includes(role)));
  await click(document.querySelector('.op-more'));
  check('menú sin acciones prohibidas '+role,()=>{assert.equal(!!button('Eliminar'),['dueno','admin'].includes(role));assert.equal(!!button('Marcar cerrado'),['dueno','admin','broker'].includes(role));assert.equal(!!button('Duplicar'),role!=='viewer');});
  await click(button('Historial de acciones'));
  check('historial sin restaurar para lectura '+role,()=>assert.equal(!!button('Restaurar'),['dueno','admin','broker'].includes(role)));
  await render(null);
 }
 await render(app.createElement(app.DashboardView,{...dashboardProps,usuarioActual:{id:'broker-ajeno',rol_base:'broker'}}));
 check('asesor sin botón de editar asignación ajena',()=>assert.equal(!!button('Editar'),false));
 await render(null);
 for(const can of [false,true]){
  await render(app.createElement(app.PapeleraView,{papelera:initial.papelera,puedeGestionar:can,onRestore(){},onDeletePermanente(){},onVaciar(){},setConfirmVaciar(){}}));
  check('papelera muestra gestión solo autorizada '+can,()=>{assert.equal(!!button('↩ Restaurar'),can);assert.equal(!!button('Eliminar def.'),can);assert.equal(!!button('Vaciar papelera'),can)});await render(null);
 }

 await render(app.createElement(app.DocumentHeaderActions,{onPDF(){},onDOCX(){},onShare(){}}));
 check('encabezado de lectura conserva exportación y oculta edición',()=>{assert.equal(!!button('Editar'),false);assert.ok(buttons().length>=2)});await render(null);
 await render(app.createElement(app.NegociacionPanel,{op:fakeOp}));check('negociación solo lectura no deja controles activos',()=>assert.equal(document.querySelector('fieldset').disabled,true));await render(null);
 await render(app.createElement(app.ReservaDecisionPanel,{op:fakeOp}));check('decisiones de reserva solo lectura',()=>assert.ok(buttons().every(b=>b.disabled)));await render(null);

 app.lsRemove('draftOperacion');
 await render(app.createElement(app.OperacionForm,{initial:fakeOp,contextoBorrador:app.contextoBorradorOperacion(context()),clausulas:[],perfil:{rol:'dueno'},equipo:[],operaciones:[],onSave(){},onCancel(){},onTipoChange(){},reportSave(){}}));
 await app.act(async()=>window.dispatchEvent(new Event('beforeunload')));
 check('borrador guarda usuario e inmobiliaria fuera de los datos documentales',()=>{const draft=app.lsGet('draftOperacion',null);assert.equal(draft.contexto.usuarioId,'owner');assert.equal(draft.contexto.inmobiliariaId,'tenant-a');assert.equal(draft.data.contexto,undefined)});await render(null);app.lsRemove('draftOperacion');
 currentUser='owner';await hook(context());calls=[];
 const before=JSON.stringify({ops:api.operaciones,papelera:api.papelera});writePause=deferred();let pending;
 await app.act(async()=>{pending=api.eliminar('op-own');await Promise.resolve()});check('borrar no modifica datos antes de confirmar',()=>assert.equal(JSON.stringify({ops:api.operaciones,papelera:api.papelera}),before));
 await app.act(async()=>writePause.resolve({error:{message:'No autorizado de prueba'}}));await pending;writePause=null;
 check('rechazo conserva lista y expone error',()=>{assert.equal(JSON.stringify({ops:api.operaciones,papelera:api.papelera}),before);assert.ok(api.error)});
 calls=[];writePause=deferred();let p1,p2;await app.act(async()=>{p1=api.restaurar('trash');p2=api.restaurar('trash');await Promise.resolve()});
 check('doble pulsación comparte una escritura',()=>assert.equal(calls.filter(c=>c.name==='fn_operacion_restaurar').length,1));
 await app.act(async()=>writePause.resolve({data:null}));await Promise.all([p1,p2]);writePause=null;
 for(const role of ['viewer','broker','vendedor']){currentUser=role;await hook(context(role,role));calls=[];await app.act(async()=>{await api.eliminar('op-own');await api.restaurar('trash');await api.eliminarPermanente('trash');await api.vaciarPapelera()});check('sin RPC de papelera para '+role,()=>assert.equal(calls.length,0));}
 currentUser='vendedor';await hook(context('vendedor','vendedor'));calls=[];let result;
 await app.act(async()=>{result=await api.guardar({...fakeOp,id:'nueva',broker_id:''})});check('alta asigna vendedor antes de enviar y usa respuesta normalizada',()=>{const sent=calls.find(c=>c.name==='fn_operacion_guardar');assert.equal(sent.args.p_datos.broker_id,'vendedor');assert.equal(result.operacion.broker_id,'vendedor')});
 calls=[];await app.act(async()=>{result=await api.guardar(fakeOp)});check('vendedor no edita operación existente',()=>{assert.ok(result.error);assert.equal(calls.length,0)});
 currentUser='owner';await hook(context());calls=[];currentUser='otro';await app.act(async()=>{result=await api.guardar({...fakeOp,id:'new-session'})});check('sesión diferente bloquea envío',()=>{assert.ok(result.error);assert.equal(calls.length,0)});

 currentUser='owner';await hook(context());calls=[];loaderPause=deferred();
 await app.act(async()=>{pending=api.guardar({...fakeOp,id:'sdk-pending'});await Promise.resolve()});
 currentUser='owner-b';await hook(context('dueno','owner-b','tenant-b'));
 await app.act(async()=>loaderPause.resolve(client));result=await pending;loaderPause=null;
 check('cambio de contexto durante carga de SDK impide escritura',()=>{assert.equal(result.contextoObsoleto,true);assert.ok(!calls.some(c=>c.name==='fn_operacion_guardar'))});
 currentUser='owner';await hook(context());
 currentUser='owner';sessionPause=deferred();calls=[];await app.act(async()=>{pending=api.guardar({...fakeOp,id:'old-context'});await Promise.resolve()});
 currentUser='owner-b';await hook(context('dueno','owner-b','tenant-b'));
 await app.act(async()=>sessionPause.resolve({data:{session:{user:{id:'owner'}}}}));result=await pending;sessionPause=null;
 check('cambio de inmobiliaria durante sesión impide guardar',()=>{assert.equal(result.contextoObsoleto,true);assert.ok(!calls.some(c=>c.name==='fn_operacion_guardar'))});
 currentUser='owner';await hook(context());calls=[];writePause=deferred();await app.act(async()=>{pending=api.eliminar('op-own');await Promise.resolve()});
 currentUser='owner-b';await hook(context('dueno','owner-b','tenant-b'));await app.act(async()=>writePause.resolve({error:{message:'ERROR ANTIGUO'}}));result=await pending;writePause=null;
 check('respuesta tardía no contamina error de nueva sesión',()=>{assert.equal(result.contextoObsoleto,true);assert.equal(api.error,null)});
 await render(null);currentUser='owner';await hook(context());calls=[];writePause=deferred();await app.act(async()=>{pending=api.guardar({...fakeOp,id:'late-unmount'});await Promise.resolve()});await render(null);writePause.resolve({data:[]});result=await pending;writePause=null;
 check('desmontaje invalida respuesta de escritura',()=>assert.equal(result.contextoObsoleto,true));
 const noChanges=()=>JSON.stringify(initial);
 for(const action of ['eliminarOpDirecto','restoreOp','deleteOpPermanente','vaciarPapelera'])for(const throws of [false,true]){
  const server=Object.fromEntries(['eliminar','restaurar','eliminarPermanente','vaciarPapelera'].map(x=>[x,()=>throws?Promise.reject(new Error('Fallo ficticio')):Promise.resolve({error:{message:'Rechazo ficticio'}})]));
  const a=app.crearAccionesPrueba(initial,server,context());await a[action](action==='eliminarOpDirecto'?'op-own':'trash');
  check(action+' conserva listas ante '+(throws?'excepción':'rechazo'),()=>assert.equal(JSON.stringify({operaciones:a.estado().operaciones,papelera:a.estado().papelera}),noChanges()));
 }
 const doneServer=Object.fromEntries(['eliminar','restaurar','eliminarPermanente','vaciarPapelera'].map(x=>[x,()=>Promise.resolve({data:null})]));
 let a=app.crearAccionesPrueba(initial,doneServer,context());await a.eliminarOpDirecto('op-own');check('eliminación confirmada mueve una sola copia',()=>{assert.equal(a.estado().operaciones.length,0);assert.equal(a.estado().papelera.filter(x=>x.id==='op-own').length,1)});
 a=app.crearAccionesPrueba(initial,doneServer,context());await a.restoreOp('trash');check('restauración confirmada preserva contenido y elimina fecha de papelera',()=>{assert.equal(a.estado().papelera.length,0);const restored=a.estado().operaciones.find(x=>x.id==='trash');assert.equal(restored.comprador_nombre,fakeOp.comprador_nombre);assert.equal(restored.deleted_at,undefined)});
 a=app.crearAccionesPrueba(initial,doneServer,context());await a.deleteOpPermanente('trash');check('borrado permanente confirmado',()=>assert.equal(a.estado().papelera.length,0));
 a=app.crearAccionesPrueba(initial,doneServer,context());await a.vaciarPapelera();check('vaciado confirmado cierra confirmación',()=>{assert.equal(a.estado().papelera.length,0);assert.equal(a.estado().confirmVaciar,false)});
 const delayed=deferred();a=app.crearAccionesPrueba(initial,{...doneServer,eliminar:()=>delayed.promise},context());pending=a.eliminarOpDirecto('op-own');a.cambiarContexto(context('dueno','owner-b','tenant-b'));delayed.resolve({data:null});result=await pending;
 check('handler de papelera descarta éxito tardío',()=>{assert.equal(result.contextoObsoleto,true);assert.equal(a.estado().operaciones.length,1)});
 for(const name of ['convertirAContrato','convertirARefuerzo','onConvertirDevolucion','convertirABoleto','convertirAComodato','duplicarOp']){
  a=app.crearAccionesPrueba(initial,{guardar:()=>Promise.resolve({error:{message:'Documento rechazado'}})},context());await a[name](fakeOp);
  check(name+' no deja documento ni abre editor si falla',()=>{assert.equal(a.estado().operaciones.length,1);assert.equal(a.estado().showForm,false)});
 }
 let sent;const sourceOp={...fakeOp,broker_id:'broker',plantilla_snapshot:{version:7},comprador_cotitulares:[{nombre:'[COTITULAR]'}]};
 a=app.crearAccionesPrueba({...initial,operaciones:[sourceOp]},{guardar:op=>{sent=op;return Promise.resolve({operacion:op})}},context('broker','broker'));
 await a.duplicarOp(sourceOp);check('duplicar autorizado conserva snapshot y cotitulares',()=>{assert.deepEqual(sent.plantilla_snapshot,sourceOp.plantilla_snapshot);assert.deepEqual(sent.comprador_cotitulares,sourceOp.comprador_cotitulares);assert.equal(sent.estado,'borrador');assert.notEqual(sent.id,sourceOp.id)});
 a=app.crearAccionesPrueba({...initial,operaciones:[sourceOp]},{guardar:op=>{sent=op;return Promise.resolve({operacion:op})}},context('broker','broker'));await a.convertirABoleto(sourceOp);
 check('conversión confirmada abre el nuevo documento propio',()=>{assert.equal(a.estado().formTipo,'boleto');assert.equal(a.estado().showForm,true);assert.equal(sent.parent_id,'op-own');assert.equal(sent.broker_id,'broker')});
 check('documento vinculado captura su propio modelo antes del primer guardado',()=>{assert.equal(sent.plantilla_snapshot.tipo,'boleto');assert.ok(sent.plantilla_snapshot.body_blocks.length>0);assert.equal(sent.plantilla_version,1)});
 const perfilDestino={rol:'dueno',plantillas:{boleto:{version:9,clausulas_ids:[],obligatorias_ids:[]}},encabezados_custom:{boleto:'INTRODUCCIÓN DEL MODELO VIGENTE'}};
 a=app.crearAccionesPrueba({...initial,perfil:perfilDestino},{guardar:op=>{sent=op;return Promise.resolve({operacion:op})}},context());await a.convertirABoleto(fakeOp);
 perfilDestino.encabezados_custom.boleto='INTRODUCCIÓN MODIFICADA DESPUÉS';
 check('el modelo del boleto recién creado queda fijado aunque cambie la biblioteca',()=>{assert.equal(sent.plantilla_version,9);assert.equal(sent.plantilla_snapshot.introduccion,'INTRODUCCIÓN DEL MODELO VIGENTE')});
 let countWrites=0;a=app.crearAccionesPrueba(initial,{guardar:()=>{countWrites++;return Promise.resolve({data:[]})}},context('vendedor','vendedor'));await a.onConvertirDevolucion(fakeOp);
 check('vendedor no inicia conversión que requiere editar/cerrar padre',()=>{assert.equal(countWrites,0);assert.equal(a.estado().showForm,false)});

 const createPending=deferred();countWrites=0;a=app.crearAccionesPrueba(initial,{guardar:()=>{countWrites++;return createPending.promise}},context());
 const create1=a.convertirABoleto(fakeOp),create2=a.convertirABoleto(fakeOp);createPending.resolve({data:[]});await Promise.all([create1,create2]);
 check('doble clic de conversión crea un solo documento',()=>{assert.equal(countWrites,1);assert.equal(a.estado().operaciones.length,2)});
 Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});Object.defineProperty(navigator,'onLine',{value:true,configurable:true});
 for(const draftContext of [null,{usuarioId:'otro',inmobiliariaId:'tenant-a'},{usuarioId:'owner',inmobiliariaId:'otro-tenant'}]){
  const draft={data:{...fakeOp,id:undefined},contexto:draftContext};app.lsSet('draftOperacion',draft);const beforeDraft=app.lsGet('draftOperacion',null);countWrites=0;
  a=app.crearAccionesPrueba(initial,{guardar:()=>{countWrites++;return Promise.resolve({data:[]})}},context());await a.sincronizarDraftOffline();
  check('no sincroniza borrador sin contexto propio '+JSON.stringify(draftContext),()=>{assert.equal(countWrites,0);assert.deepEqual(app.lsGet('draftOperacion',null),beforeDraft)});
 }
 app.lsSet('draftOperacion',{data:fakeOp,contexto:app.contextoBorradorOperacion(context())});countWrites=0;
 a=app.crearAccionesPrueba(initial,{guardar:op=>{countWrites++;return Promise.resolve({operacion:op})}},context());await a.sincronizarDraftOffline();
 check('sincroniza borrador propio confirmado y retira solo ese borrador',()=>{assert.equal(countWrites,1);assert.equal(app.lsGet('draftOperacion',null),null)});
 app.lsSet('draftOperacion',{data:fakeOp,contexto:app.contextoBorradorOperacion(context())});
 a=app.crearAccionesPrueba(initial,{guardar:()=>Promise.resolve({contextoObsoleto:true})},context());await a.sincronizarDraftOffline();
 check('respuesta obsoleta no borra borrador offline',()=>assert.ok(app.lsGet('draftOperacion',null)));app.lsRemove('draftOperacion');

 const pendingDraft=deferred();const ownedDraft={data:fakeOp,contexto:app.contextoBorradorOperacion(context())};app.lsSet('draftOperacion',ownedDraft);
 a=app.crearAccionesPrueba(initial,{guardar:()=>pendingDraft.promise},context());pending=a.sincronizarDraftOffline();
 const changedDraft={data:{...fakeOp,comprador_nombre:'[BORRADOR NUEVO]'},contexto:{usuarioId:'otro',inmobiliariaId:'tenant-b'}};app.lsSet('draftOperacion',changedDraft);pendingDraft.resolve({operacion:fakeOp});await pending;
 check('reintento no elimina un borrador escrito mientras esperaba',()=>assert.deepEqual(app.lsGet('draftOperacion',null),changedDraft));app.lsRemove('draftOperacion');
 const ctl=app.crearControlContextoOperaciones('a');const valid=ctl.capturar();ctl.actualizar('b');ctl.actualizar('a');check('ABA invalida la solicitud original',()=>assert.equal(valid(),false));
 console.log('APROBADAS',count,'verificaciones de roles, flujos y respuestas tardías (DOM y servicios simulados).');
}finally{await app.act(async()=>mount.unmount());dom.window.close();}})().catch(e=>{console.error(e);process.exitCode=1});
