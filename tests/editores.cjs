const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class {constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage&&this.port1.onmessage({data:undefined}),0)};}};
let confirmations=0,autoConfirm=true,pendingConfirm=null;window.addEventListener('dw:confirm',e=>{confirmations++;if(autoConfirm)e.detail.onConfirm();else pendingConfirm=e.detail.onConfirm;});
const rootDir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-ui-'));
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(path.join(rootDir,'src/App.tsx'),'utf8')+'\nimport {act} from "react"; import {createRoot} from "react-dom/client"; export {act,createRoot,CuerpoPlantillaPanel,getDefaultBodyBlocks,PLANTILLA_TIPOS,getBodyBlocksConfig,getBodyBlocksForDocument,crearSnapshotPlantillaOperacion,navegarConProteccionModelo};',resolveDir:path.join(rootDir,'src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'ui.cjs')});
const app=require(path.join(tmp,'ui.cjs'));
let count=0;function check(label,fn){fn();count++;console.log('OK',label);}
const buttons=()=>Array.from(document.querySelectorAll('button'));
function button(text){const b=buttons().find(b=>b.textContent.trim()===text);assert.ok(b,'botón '+text);return b;}
async function click(el){await app.act(async()=>{el.click();});}
async function fill(el,value){assert.ok(el);await app.act(async()=>{const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));});}
(async()=>{
 for(const tipo of app.PLANTILLA_TIPOS){
  let profile={rol:'dueno',plantillas:{}},saves=0,fail=false;
  const root=app.createRoot(document.getElementById('test'));
  function render(){root.render(require(path.join(tmp,'ui.cjs')).defaultUI||require('react').createElement(app.CuerpoPlantillaPanel,{perfil:profile,tipo,puedeEditar:true,clausulas:[],onChange:async next=>{saves++;if(fail)return {error:new Error('fallo simulado')};profile=next;render();return {};}}));}
  // Bundle and harness must share React for hooks; createElement only creates data.
  await app.act(async()=>render());
  await click(button('＋ Agregar cláusula'));
  check(tipo+' alta no persiste',()=>assert.equal(saves,0));
  check(tipo+' chips tienen etiquetas inequívocas',()=>{const labels=buttons().map(b=>b.textContent.trim()).filter(t=>t.startsWith('+'));assert.equal(new Set(labels).size,labels.length);});
  if(tipo==='reserva'){
   await click(button('+Reserva alquiler · importe numérico'));
   await click(button('+Reserva alquiler · importe en letras'));
   check('chips distinguen monto y redacción legal',()=>{const texto=document.querySelector('textarea').value;assert.ok(texto.includes('{{res_alq_monto_reserva}}'));assert.ok(texto.includes('{{reserva_alquiler_reserva}}'));assert.ok(!buttons().some(b=>b.textContent.trim()==='+Reserva alquiler · importe en letras'));});
  }

  await fill(document.querySelector('textarea'),'Texto de prueba con redacción propia.');
  const chip=buttons().find(b=>b.textContent.trim()==='+Comprador');
  assert.ok(chip,'chip de comprador disponible');await click(chip);
  check(tipo+' chip no persiste',()=>assert.equal(saves,0));
  let navigated=0;autoConfirm=false;
  await app.act(async()=>app.navegarConProteccionModelo(()=>navigated++));
  check(tipo+' navegación espera confirmación',()=>{assert.equal(navigated,0);assert.ok(pendingConfirm);});
  // Cancelar el modal conserva el editor y el borrador.
  pendingConfirm=null;
  check(tipo+' cancelar navegación conserva borrador',()=>assert.ok(document.querySelector('textarea').value.includes('Texto de prueba')));
  await app.act(async()=>app.navegarConProteccionModelo(()=>navigated++));
  await app.act(async()=>pendingConfirm());
  check(tipo+' confirmar navegación descarta sin persistir',()=>{assert.equal(navigated,1);assert.equal(saves,0);assert.equal(document.querySelector('textarea'),null);});
  autoConfirm=true;await click(button('＋ Agregar cláusula'));

  await click(button('Cancelar'));
  check(tipo+' cancelar confirma y descarta',()=>{assert.equal(document.querySelector('textarea'),null);assert.equal(saves,0);});
  await click(button('＋ Agregar cláusula'));
  await fill(document.querySelector('input.inp'),'Cláusula personalizada');
  await fill(document.querySelector('textarea'),'Texto guardado de prueba.');
  fail=true;await click(button('Guardar cláusula'));
  check(tipo+' error conserva editor',()=>assert.ok(document.querySelector('textarea')));
  fail=false;await click(button('Guardar cláusula'));
  check(tipo+' guarda solo explícitamente',()=>{assert.equal(saves,2);assert.ok(profile.plantillas[tipo].body_blocks.some(b=>b.contenido==='Texto guardado de prueba.'));});
  const edits=buttons().filter(b=>b.textContent.trim()==='Editar');await click(edits[edits.length-1]);
  await fill(document.querySelector('textarea'),'Segunda versión.');await click(button('Guardar cláusula'));
  check(tipo+' historial conserva versión anterior',()=>{const hist=profile.plantillas[tipo].historial_clausulas;assert.ok(Object.values(hist).flat().some(v=>v.contenido==='Texto guardado de prueba.'));});
  await app.act(async()=>root.unmount());
  const readOnly=app.createRoot(document.getElementById('test'));
  await app.act(async()=>readOnly.render(require('react').createElement(app.CuerpoPlantillaPanel,{perfil:profile,tipo,puedeEditar:false,clausulas:[],onChange:()=>{throw new Error('Solo lectura');}})));
  check(tipo+' edición protegida',()=>assert.ok(!buttons().some(b=>['Editar','＋ Agregar cláusula'].includes(b.textContent.trim()))));
  await app.act(async()=>readOnly.unmount());
 }
 check('confirmación de descarte en ocho documentos',()=>assert.equal(confirmations,24));
 const legacy=[{id:'reserva.precio',titulo:'Precio propio',contenido:'Texto propio de la inmobiliaria',orden:1}];
 check('Reserva hereda texto de tabla histórica',()=>assert.equal(app.getBodyBlocksConfig({},'reserva',legacy)[0].contenido,legacy[0].contenido));
 const profile={plantillas:{reserva:{body_blocks:[{...legacy[0],contenido:'Modelo nuevo'}]}}};
 check('Documento y snapshot usan Reserva editada',()=>{assert.equal(app.getBodyBlocksForDocument(profile,'reserva',legacy)[0].contenido,'Modelo nuevo');assert.equal(app.crearSnapshotPlantillaOperacion({tipo:'reserva'},profile,[],legacy).body_blocks[0].contenido,'Modelo nuevo');});
 dom.window.close();
 console.log('APROBADAS',count,'verificaciones de interacción (DOM simulado; sin motor de layout).');
})().catch(e=>{console.error(e);process.exitCode=1;});
