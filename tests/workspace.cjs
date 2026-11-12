const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(require('os').tmpdir(),'docworks-workspace-'));const {JSDOM}=require(dir+'/node_modules/jsdom');const dom=new JSDOM('<div id="test"></div>',{url:'http://localhost'});for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];global.IS_REACT_ACT_ENVIRONMENT=true;global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};window.addEventListener('dw:confirm',e=>e.detail.onConfirm());
require(dir+'/node_modules/esbuild').buildSync({stdin:{contents:fs.readFileSync(dir+'/src/App.tsx','utf8')+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createRoot,createElement,ClausulasWorkspace,PLANTILLA_TIPOS,TIPOS,getBodyBlocksConfig};',resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'app.cjs')});const a=require(path.join(tmp,'app.cjs'));const root=a.createRoot(document.getElementById('test'));let perfil={rol:'dueno',plantillas:{}},saves=0;const btn=t=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);assert.ok(b,t);return b};async function click(b){await a.act(async()=>b.click())}function render(){root.render(a.createElement(a.ClausulasWorkspace,{perfil,clausulas:[],bloquesReserva:[],onSavePerfil:async p=>{perfil=p;saves++;render();return {};}}))}async function selectDoc(tipo){await click([...document.querySelectorAll('#dw-modelo-documento button')].find(b=>b.textContent.trim()===a.TIPOS[tipo]));}async function fill(e,v){await a.act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));});}
(async()=>{await a.act(async()=>render());for(const tipo of a.PLANTILLA_TIPOS){await selectDoc(tipo);console.log('DOC',tipo,document.querySelector('#dw-modelo-documento [aria-pressed=true]').textContent);const expected=a.getBodyBlocksConfig(perfil,tipo).map(b=>b.titulo);const actual=[...document.querySelectorAll('.dw-clause-name')].map(e=>e.textContent);assert.deepEqual(actual,expected);await click([...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Editar')[1]);await fill(document.querySelector('textarea'),'CAMBIO '+tipo);await click(btn('Guardar cláusula'));assert.equal(perfil.plantillas[tipo].body_blocks[1].contenido,'CAMBIO '+tipo);console.log('GUARDADO',tipo);}for(const tipo of a.PLANTILLA_TIPOS.slice().reverse()){await selectDoc(tipo);assert.equal(document.querySelectorAll('#dw-config-modelo').length,0);assert.equal(a.getBodyBlocksConfig(perfil,tipo)[1].contenido,'CAMBIO '+tipo);await click([...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Editar')[1]);assert.equal(document.querySelector('textarea').value,'CAMBIO '+tipo);await click(btn('Cancelar'));}// Una alternativa de contrato no debe desarmar las ocho plantillas DocWorks.
await selectDoc('reserva');
const modeloAntes=perfil.plantillas.reserva.body_blocks[1].contenido;
const otraAntes=perfil.plantillas.boleto.body_blocks[1].contenido;
assert.equal(document.querySelector('#dw-model-clauses').open,false,'Cláusulas inicialmente plegadas');
assert.equal(document.querySelector('[aria-label="Desplegar introducción"]').getAttribute('aria-expanded'),'false','Introducción inicialmente plegada');
assert.equal(document.querySelector('#dw-model-source-switch').open,false,'Cambiar de modalidad es opcional y está plegado');
await click(document.querySelector('#dw-model-source-switch summary'));
await click(btn('Preparar mi contrato completo'));
assert.ok(document.querySelector('[aria-label="Editor de contrato propio"]'),'El editor propio se abre tras confirmar');
assert.equal(perfil.plantillas.reserva.body_blocks[1].contenido,modeloAntes,'Abrir la alternativa no modifica el modelo');
assert.equal(perfil.plantillas.reserva.modo_documento||'docworks','docworks','Abrir el editor no cambia el origen activo');
const textoPropio='CONTRATO DE PRUEBA. El cedente {{vendedor_nombre}} y el cesionario {{comprador_nombre}} acuerdan sobre el inmueble {{inmueble_direccion}}. Firmas y jurisdicción a completar.';
await fill(document.querySelector('textarea[aria-label="Texto del contrato propio"]'),textoPropio);
await click(btn('Guardar cambios'));
assert.equal(perfil.plantillas.reserva.modo_documento,'propio','Solo guardar activa contrato propio');
assert.equal(perfil.plantillas.reserva.body_blocks[1].contenido,modeloAntes,'El modelo original continúa almacenado');
assert.equal(perfil.plantillas.boleto.body_blocks[1].contenido,otraAntes,'No cambian los otros documentos');
await click(document.querySelector('#dw-model-source-switch summary'));
await click(btn('Volver al modelo DocWorks'));
await a.act(async()=>await Promise.resolve());
assert.equal(perfil.plantillas.reserva.modo_documento,'docworks','Se puede volver al modelo original');
assert.equal(perfil.plantillas.reserva.body_blocks[1].contenido,modeloAntes,'Volver restaura el texto previo');
assert.equal(perfil.plantillas.reserva.documento_propio,textoPropio,'El texto propio también se conserva para otra vez');
await a.act(async()=>root.unmount());dom.window.close();console.log('TODOS OK',saves);})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
