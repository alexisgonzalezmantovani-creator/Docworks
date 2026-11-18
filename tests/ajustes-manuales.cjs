const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),ts=require('typescript'),{JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-ajustes-')),dom=new JSDOM('<div id="root"></div>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};
let confirmar=false,preguntas=0;window.confirm=()=>{preguntas++;return confirmar};
const source=fs.readFileSync(dir+'/src/App.tsx','utf8'),parsed=ts.createSourceFile('App.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),fns={};
(function visit(n){if(ts.isFunctionDeclaration(n)&&n.name)fns[n.name.text]=n.getText(parsed);ts.forEachChild(n,visit)})(parsed);
assert.ok(fns.cerrarVisorSeguro,'la app protege el cierre del visor');
const cierre=fns.cerrarVisorSeguro;
require('esbuild').buildSync({stdin:{contents:source+`
import {act,createElement} from 'react';import {createRoot} from 'react-dom/client';
let ultimoGuardado=null,llamadas=0,modo='ok',resolverGuardado=null;
function AjustesHarness(){
 const [autoAction,setAutoAction]=useState(null),[viewDoc,setViewDoc]=useState({...EMPTY_OP,...SAMPLE_OP_PREVIEW,id:'qa-ajustes',tipo:'reserva',plantilla_snapshot:{tipo:'reserva',body_blocks:[{id:'reserva.qa',titulo:'Texto de prueba',contenido:'Texto original de prueba.',activo:true,orden:1},{id:'reserva.precio',titulo:'Precio',contenido:'La suma de {{precio_letras}}.',activo:true,orden:2},{id:'reserva.legado',titulo:'Precio histórico',contenido:'El monto será [precio en letras].',activo:true,orden:3}]}}),[tab,setTab]=useState('reserva'),[destino,setDestino]=useState('visor');
 const salidaVisorRef=useRef(null),setDocAutoAction=()=>{};
 ${cierre}
 return <><button onClick={()=>cerrarVisorSeguro()}>Cerrar visor QA</button><button onClick={()=>cerrarVisorSeguro(()=>setDestino('formulario'))}>Editar operación QA</button><button onClick={()=>setAutoAction('pdf')}>Exportar PDF QA</button><output id="destino">{destino}</output>{viewDoc&&<DocumentViewer op={viewDoc} perfil={{nombre:'Inmobiliaria de prueba',plantillas:{}}} clausulas={[]} operaciones={[viewDoc]} bloquesReserva={[]} tab={tab} onChangeTab={setTab} salidaGuardRef={salidaVisorRef} autoAction={autoAction} onAutoActionDone={()=>setAutoAction(null)} onUpdateOperation={async next=>{llamadas++;if(modo==='error')return {error:{message:'Error de guardado de prueba'}};if(modo==='sin_respuesta')return null;if(modo==='vacia')return {};if(modo==='demora')await new Promise(r=>resolverGuardado=r);ultimoGuardado=next;setViewDoc(next);return {operacion:next};}}/>}</>;
}
export {act,createElement,createRoot,AjustesHarness,generarPDF,generarDOCX,buildDocSections,opParaDocumento};export const estadoAjustes=()=>({ultimoGuardado,llamadas});export const modoAjustes=m=>modo=m;export const resolverAjustes=()=>resolverGuardado();
`,resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
// Ejecutar también los manejadores reales de exportación con una descarga simulada
// que falla la primera vez. Esto prueba el botón Reintentar sin tocar archivos del usuario.
const exportSource=fs.readFileSync(dir+'/src/Operaciones.tsx','utf8');
const exportAst=ts.createSourceFile('Operaciones.tsx',exportSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const exportHandlers={};(function visitar(n){if(ts.isFunctionDeclaration(n)&&['handlePDF','handleDOCX','handleShareWhatsApp','hayEntregaEnCurso'].includes(n.name?.text))exportHandlers[n.name.text]=n.getText(exportAst);ts.forEachChild(n,visitar)})(exportAst);
assert.ok(exportHandlers.handlePDF&&exportHandlers.handleDOCX&&exportHandlers.handleShareWhatsApp&&exportHandlers.hayEntregaEnCurso,'existen los manejadores y el bloqueo de entregas');
function simularDescarga(formato,modo='ok'){
 let estado={accion:null,error:'',busy:{},generados:0,intentos:0,modo,liberar:null};
 const iniciar=new Function('estado','formato',`
   const guardandoAjuste=false,hayCambiosAjuste=()=>false;
   const descargaEnCursoRef={current:{pdf:false,docx:false,share:false}};
   const setBusy=f=>estado.busy=typeof f==='function'?f(estado.busy):f;
   const setErr=x=>estado.error=x,setLastAction=x=>estado.accion=x;
   const setLastPdf=()=>{},setLastDocx=()=>{};
   const getDoc=()=>({titulo:'Reserva ficticia'});
   const tabActual={label:'Reserva'},op={inmueble_direccion:'Inmueble ficticio'};
   const exportacionCompartida=async()=>{estado.generados++;return {blob:{},filename:'test'};};
   const descargarArchivo=async()=>{estado.intentos++;
     if(estado.modo==='pendiente-descarga')await new Promise(r=>estado.liberar=r);
     else if(estado.intentos===1)throw Error('Descarga simulada interrumpida');};
   const dwNotify=()=>{};
   const entregarArchivo=async()=>{estado.intentos++;
     if(estado.modo==='pendiente')await new Promise(r=>estado.liberar=r);
     if(estado.modo==='error'&&estado.intentos===1)throw Error('Compartir interrumpido');
     if(estado.modo==='cancelar')throw Object.assign(new Error('Usuario canceló'),{name:'AbortError'});
     return 'shared';
   };
   ${exportHandlers.hayEntregaEnCurso}
   ${exportHandlers.handlePDF}
   ${exportHandlers.handleDOCX}
   ${exportHandlers.handleShareWhatsApp}
   return {iniciar:formato==='pdf'?handlePDF:formato==='docx'?handleDOCX:handleShareWhatsApp,
      acciones:{pdf:handlePDF,docx:handleDOCX,share:handleShareWhatsApp}};
 `)(estado,formato);
 return {...iniciar,estado};
}
const a=require(tmp+'/app.cjs');let root,checks=0;
const botones=()=>[...document.querySelectorAll('button')],boton=t=>{const el=botones().find(b=>b.textContent.trim()===t);assert.ok(el,'botón '+t);return el};
async function click(el){await a.act(async()=>el.click())}
async function iniciar(abrirEditor=true){if(root)await a.act(async()=>root.unmount());root=a.createRoot(document.getElementById('root'));await a.act(async()=>{root.render(a.createElement(a.AjustesHarness));await new Promise(r=>setTimeout(r,30))});if(abrirEditor){document.querySelector('[data-testid="dw-ajustes-manuales"]').open=true;await click(document.querySelector('[data-testid="dw-ajustes-manuales"] button'));}}
async function escribir(valor){const el=document.querySelector('textarea');assert.ok(el);await a.act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,valor);el.dispatchEvent(new Event('input',{bubbles:true}))});}
async function check(label,fn){await fn();checks++;console.log('OK',label)}
(async()=>{
 await check('PDF, Word y WhatsApp nunca abren dos entregas a la vez',async()=>{
  for(const [primera,segunda,modo] of [
    ['pdf','share','pendiente-descarga'],
    ['docx','pdf','pendiente-descarga'],
    ['share','docx','pendiente']
  ]){
    const prueba=simularDescarga(primera,modo);
    const inicial=prueba.acciones[primera]();
    for(let i=0;i<30&&!prueba.estado.liberar;i++)await Promise.resolve();
    assert.equal(typeof prueba.estado.liberar,'function',primera+' se mantiene en curso');
    await prueba.acciones[segunda]();
    assert.equal(prueba.estado.intentos,1,'la segunda entrega no debe iniciarse si '+primera+' está abierta');
    assert.equal(prueba.estado.accion,primera,'el primer envío no pierde su estado');
    prueba.estado.liberar();
    await inicial;
    assert.equal(prueba.estado.accion,null,primera+' debe quedar completado');
    await prueba.acciones[segunda]();
    assert.equal(prueba.estado.intentos,2,segunda+' vuelve a estar disponible después del primer envío');
  }
 });
 await check('PDF y Word permiten reintentar tras una descarga fallida',async()=>{
  for(const formato of ['pdf','docx']){
    const prueba=simularDescarga(formato);
    await prueba.iniciar();
    assert.equal(prueba.estado.accion,formato,'la falla debe conservar el botón Reintentar');
    assert.match(prueba.estado.error,/Descarga simulada interrumpida/);
    await prueba.iniciar();
    assert.equal(prueba.estado.accion,null,'el reintento correcto debe limpiar la acción');
    assert.equal(prueba.estado.error,'','el error desaparece después del reintento');
    assert.equal(prueba.estado.intentos,2,'la descarga se vuelve a intentar');
  }
 });
 await check('compartir bloquea el doble toque y libera el bloqueo al terminar',async()=>{
  const prueba=simularDescarga('share','pendiente');
  const primero=prueba.iniciar();
  for(let i=0;i<30&&!prueba.estado.liberar;i++)await Promise.resolve();
  assert.equal(typeof prueba.estado.liberar,'function','la entrega debe estar pendiente');
  await prueba.iniciar();
  assert.equal(prueba.estado.intentos,1,'un segundo toque no debe compartir dos veces');
  prueba.estado.liberar();
  await primero;
  assert.equal(prueba.estado.busy.share,false,'el botón vuelve a estar disponible');
  assert.equal(prueba.estado.accion,null,'no deja reintento tras compartir correctamente');
 });
 await check('compartir fallido permite reintentar; cancelar no deja error',async()=>{
  const prueba=simularDescarga('share','error');
  await prueba.iniciar();
  assert.equal(prueba.estado.accion,'share','se conserva la acción para reintentar');
  assert.match(prueba.estado.error,/Compartir interrumpido/);
  await prueba.iniciar();
  assert.equal(prueba.estado.intentos,2,'la entrega se vuelve a intentar');
  assert.equal(prueba.estado.accion,null,'el reintento correcto limpia la acción');
  assert.equal(prueba.estado.error,'','el error se limpia al reintentar');
  const cancelar=simularDescarga('share','cancelar');
  await cancelar.iniciar();
  assert.equal(cancelar.estado.accion,null,'cancelar compartir no deja un reintento');
  assert.equal(cancelar.estado.error,'','cancelar no muestra error');
  assert.equal(cancelar.estado.busy.share,false,'cancelar vuelve a habilitar el botón');
 });
 await iniciar();await escribir('Texto manual que debe conservarse.');
 await check('no abre confirmación de exportación con cambios de cláusula sin guardar',async()=>{
  await click(boton('Exportar PDF QA'));
  await a.act(async()=>new Promise(r=>setTimeout(r,360)));
  assert.match(document.querySelector('.doc-viewer-tab-content')?.textContent||'',/Guardá o descartá los ajustes manuales/);
  assert.equal(document.body.textContent.includes('Generar documento final'),false);
  assert.equal(document.querySelector('textarea')?.value,'Texto manual que debe conservarse.','no perdió el borrador');
 });
 await check('cancelar cierre conserva el texto manual sin guardar',async()=>{const antes=preguntas;await click(boton('Cerrar visor QA'));assert.equal(preguntas,antes+1);assert.equal(document.querySelector('textarea')?.value,'Texto manual que debe conservarse.');});
 await check('cancelar paso al formulario conserva visor y borrador',async()=>{await click(boton('Editar operación QA'));assert.equal(document.querySelector('#destino').textContent,'visor');assert.ok(document.querySelector('textarea'));});
 await check('cancelar cambio de pestaña conserva el borrador',async()=>{await click(botones().find(b=>b.textContent.includes('Ficha completa')));assert.ok(document.querySelector('textarea'));});
 await check('fallo al guardar conserva texto y muestra error',async()=>{a.modoAjustes('error');await click(boton('Guardar ajuste'));assert.ok(document.querySelector('[role="alert"]').textContent.includes('Error de guardado de prueba'));assert.equal(document.querySelector('textarea').value,'Texto manual que debe conservarse.');});
 await check('respuesta nula no cierra el editor ni informa éxito',async()=>{a.modoAjustes('sin_respuesta');await click(boton('Guardar ajuste'));assert.match(document.querySelector('[role="alert"]').textContent,/no confirmó/);assert.equal(document.querySelector('textarea').value,'Texto manual que debe conservarse.');});
 await check('respuesta vacía conserva los cambios para reintentar',async()=>{a.modoAjustes('vacia');await click(boton('Guardar ajuste'));assert.match(document.querySelector('[role="alert"]').textContent,/no confirmó/);assert.equal(document.querySelector('textarea').value,'Texto manual que debe conservarse.');});
 await check('no permite salir mientras se confirma el guardado',async()=>{a.modoAjustes('demora');await click(boton('Guardar ajuste'));await click(boton('Cerrar visor QA'));assert.ok(document.querySelector('textarea'));assert.equal(document.querySelector('textarea').disabled,true);await a.act(async()=>{a.resolverAjustes();await new Promise(r=>setTimeout(r,30))});assert.equal(document.querySelector('textarea'),null);assert.ok(Object.values(a.estadoAjustes().ultimoGuardado.ajustes_manuales.reserva).includes('Texto manual que debe conservarse.'));});
 await check('archivo PDF y Word contienen el ajuste confirmado y no el texto anterior',async()=>{
  const op=a.estadoAjustes().ultimoGuardado;
  assert.ok(op?.ajustes_manuales?.reserva?.['reserva.qa'],'debe existir el ajuste confirmado');
  const doc=a.buildDocSections(a.opParaDocumento(op),[],'reserva');
  const pdf=await a.generarPDF(doc,null,{}),word=await a.generarDOCX(doc,{});
  const raw=Buffer.from(await pdf.blob.arrayBuffer()).toString('latin1');
  const zip=Buffer.from(await word.blob.arrayBuffer());
  let xml='';
  for(let p=0;p+30<zip.length&&zip.readUInt32LE(p)===0x04034b50;){
    const metodo=zip.readUInt16LE(p+8),len=zip.readUInt32LE(p+18),nombre=zip.readUInt16LE(p+26),extra=zip.readUInt16LE(p+28),start=p+30+nombre+extra;
    let contenido=zip.subarray(start,start+len);
    if(metodo===8)contenido=require('node:zlib').inflateRawSync(contenido);
    xml+=contenido.toString('utf8');p=start+len;
  }
  assert.ok(raw.includes('Texto manual que debe conservarse.'),'el PDF debe tener el último ajuste');
  assert.ok(xml.includes('Texto manual que debe conservarse.'),'el Word debe tener el último ajuste');
  assert.ok(!raw.includes('Texto original de prueba.'),'el PDF no debe incluir la versión anterior');
  assert.ok(!xml.includes('Texto original de prueba.'),'el Word no debe incluir la versión anterior');
 });
 await check('ajuste guardado actualiza la vista previa y permite cerrar sin aviso',async()=>{assert.ok(document.querySelector('.pdf-text').textContent.includes('Texto manual que debe conservarse.'));const antes=preguntas;await click(boton('Cerrar visor QA'));assert.equal(preguntas,antes);assert.equal(document.querySelector('.doc-viewer-shell'),null);});
 a.modoAjustes('ok');await iniciar();await escribir('Otro ajuste sin guardar.');
 await check('confirmar descarte abre formulario sin guardar el borrador',async()=>{confirmar=true;const antes=a.estadoAjustes().llamadas;await click(boton('Editar operación QA'));assert.equal(document.querySelector('#destino').textContent,'formulario');assert.equal(document.querySelector('.doc-viewer-shell'),null);assert.equal(a.estadoAjustes().llamadas,antes);});
 await iniciar(false);
 await check('edición de cláusula desde la propia hoja mantiene los chips protegidos',async()=>{
  const opciones=[...document.querySelectorAll('[data-testid="dw-editar-desde-preview"]')];
  assert.ok(opciones.length>=2,'La vista previa debe ofrecer edición para cláusulas del modelo');
  await click(opciones[1]);
  const panel=document.querySelector('[data-testid="dw-editor-inline"]');
  assert.ok(panel,'La edición debe aparecer directamente en la vista previa');
  assert.ok(panel.querySelector('[data-testid="dw-ajuste-chip"]'),'El chip automático debe seguir protegido');
  assert.equal(document.querySelector('[data-testid="dw-ajustes-manuales"]').open,false,'No se debe abrir el panel superior');
  await escribir('El precio ajustado es ');
  await click(boton('Guardar ajuste'));
  assert.equal(document.querySelector('[data-testid="dw-editor-inline"]'),null,'El editor debe cerrarse tras guardar');
  assert.ok(document.querySelector('.pdf-text').textContent.includes('El precio ajustado es'),'La vista previa debe actualizarse después de guardar');
 });
 await check('restaurar desde la vista previa revierte la cláusula sin conservar el borrador',async()=>{
  const opciones=[...document.querySelectorAll('[data-testid="dw-editar-desde-preview"]')];
  await click(opciones[1]);
  assert.ok(document.querySelector('[data-testid="dw-editor-inline"]'),'se reabre el ajuste vigente en la hoja');
  assert.ok(boton('Restaurar original'),'existe acción para el ajuste guardado');
  confirmar=true;
  await click(boton('Restaurar original'));
  assert.equal(document.querySelector('[data-testid="dw-editor-inline"]'),null);
  assert.ok(!document.querySelector('.pdf-text').textContent.includes('El precio ajustado es'));
  assert.ok(document.querySelector('.pdf-text').textContent.includes('La suma de'));
 });
 await iniciar(false);
 await check('chip histórico sin cambios no crea un ajuste manual ni llama a Supabase',async()=>{
  const detalles=document.querySelector('[data-testid="dw-ajustes-manuales"]');
  assert.ok(detalles);detalles.open=true;
  const fila=document.querySelector('[data-ajuste-id="reserva.legado"]');
  assert.ok(fila,'aparece el bloque histórico');
  await click(fila.querySelector('button'));
  assert.ok(document.querySelector('[data-testid="dw-ajuste-chip"]'),'el chip legado se normalizó en el editor');
  const llamadasAntes=a.estadoAjustes().llamadas;
  await click(boton('Guardar ajuste'));
  assert.equal(a.estadoAjustes().llamadas,llamadasAntes,'no se debe enviar ningún cambio artificial');
  assert.equal(document.querySelector('textarea'),null,'el editor se cierra si no hubo cambios');
  assert.equal(document.querySelector('[data-ajuste-id="reserva.legado"]').textContent.includes('Ajuste guardado'),false);
 });
 await a.act(async()=>root.unmount());dom.window.close();console.log('APROBADAS',checks,'pruebas del visor y ajustes manuales con servicios simulados.');
})().catch(async e=>{console.error(e);process.exitCode=1;if(root)await a.act(async()=>root.unmount());dom.window.close()});
