const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom'),esbuild=require('esbuild');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-lote-'));
const dom=new JSDOM('<div id="test"></div>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};
let pending=null,returned='',sent=[];
window.addEventListener('dw:confirm',e=>pending=e.detail);
global.__loteClient={functions:{invoke:async(name,options)=>{sent.push(options.body);return {data:{text:returned}};}}};
let source=fs.readFileSync(dir+'/src/App.tsx','utf8').replace('dwObtenerSesionRobusta, loadSupabaseJs }','dwObtenerSesionRobusta }');
source+='\nconst loadSupabaseJs=async()=>globalThis.__loteClient;import {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,EncabezadoFijadoPanel,EncabezadoEditor,ClausulasWorkspace,StepClausulas,DEFAULT_ENCABEZADOS,PLANTILLA_TIPOS,TIPOS,mejorarEncabezadoIA,validarChipsIntroduccionIA,htmlEncabezadoDesdeTpl,textoEncabezadoDesdeDom,sustituirTokens,SAMPLE_OP_PREVIEW,tokensDeTextoDocWorks};';
esbuild.buildSync({stdin:{contents:source,resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
const a=require(tmp+'/app.cjs'),root=a.createRoot(document.getElementById('test'));
const button=t=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);assert.ok(b,t);return b};
async function click(b){await a.act(async()=>b.click());}
let checks=0;function check(label,fn){fn();checks++;console.log('OK',label);}
(async()=>{
 for(const tipo of a.PLANTILLA_TIPOS){
  const original=a.DEFAULT_ENCABEZADOS[tipo];returned=original;
  const out=await a.mejorarEncabezadoIA(original,tipo);
  check(tipo+' IA conserva chips reales',()=>{assert.equal(out,original);const node=document.createElement('div');node.innerHTML=a.htmlEncabezadoDesdeTpl(out,tipo);assert.equal(node.querySelectorAll('[data-dw-token]').length,a.tokensDeTextoDocWorks(out).length);assert.equal(a.textoEncabezadoDesdeDom(node).replace(/\s/g,''),original.replace(/\s/g,''));const resolved=a.sustituirTokens(out,a.SAMPLE_OP_PREVIEW,{nombre:'Inmobiliaria de prueba',matricula:'000'},tipo);assert.ok(!resolved.includes('{{'));});
  check(tipo+' rechazo de pérdida y chips inventados',()=>{assert.throws(()=>a.validarChipsIntroduccionIA('Texto sin chips.',original,tipo),/omitió/);assert.throws(()=>a.validarChipsIntroduccionIA(original+' {{dato_inventado}}',original,tipo),/válidos/);assert.throws(()=>a.validarChipsIntroduccionIA(original+' {{campo con espacios}}',original,tipo),/inválido/);});
 }
 check('usa endpoint genérico sin activar revisión de operaciones',()=>{assert.equal(sent.length,8);assert.ok(sent.every(p=>p.mode==='generic_chat'));});
 await assert.rejects(a.mejorarEncabezadoIA('DNI: 12345678 {{comprador_nombre}}','reserva'),/Quitá los datos/);
 check('identificadores reales bloqueados antes del envío',()=>assert.equal(sent.length,8));
 let profile={rol:'dueno',encabezados_custom:{reserva:'Personalizado {{comprador_nombre}}'},plantillas:{}},saves=0,fail=false;
 function renderIntro(){root.render(a.createElement(a.EncabezadoFijadoPanel,{perfil:profile,tipoDocExterno:'reserva',ocultarSelector:true,barraSuperior:true,pasoModelo:3,clausulas:[],onSavePerfil:async p=>{saves++;if(fail)return {error:{message:'Sin conexión'}};profile=p;renderIntro();return {};}}));}
 await a.act(async()=>renderIntro());
 check('sin título duplicado ni tarjeta blanca en acciones',()=>{assert.equal(document.getElementById('dw-config-modelo'),null);assert.ok(!document.querySelector('[data-testid=dw-model-actions]').classList.contains('card'));assert.equal(document.querySelector('[aria-label="Desplegar introducción"]')?.getAttribute('aria-expanded'),'false');});
 await click(document.querySelector('[aria-label="Desplegar introducción"]'));await click(button('Editar introducción'));
 check('selector de datos disponible y sin controles obsoletos',()=>{
  const toggle=document.querySelector('[aria-label="Insertar dato"]');
  assert.ok(toggle);assert.equal(toggle.getAttribute('aria-expanded'),'false');
  assert.ok(!document.querySelector('.dw-intro-token'));
  assert.equal(button('Mejorar con IA').disabled,false);
 });
 await click(document.querySelector('[aria-label="Insertar dato"]'));
 check('selector tiene categorías, personas y campos disponibles',()=>{
  assert.ok(document.querySelector('[aria-label="Categorías de datos"]'));
  assert.ok(document.querySelector('[aria-label="Elegir persona"]'));
  assert.ok(document.querySelector('[aria-label^="Insertar "]:not([aria-label="Insertar dato"])'));
  const toggle=document.querySelector('[aria-label="Insertar dato"]');
  assert.equal(toggle.getAttribute('aria-expanded'),'true');
  assert.ok(document.getElementById(toggle.getAttribute('aria-controls')));
 });
 async function buscarDato(value){
  const input=document.querySelector('[aria-label="Buscar dato"]');assert.ok(input);
  await a.act(async()=>{
   Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(input,value);
   input.dispatchEvent(new Event('input',{bubbles:true}));
  });
 }
 await buscarDato('inmueble');
 check('buscar encuentra datos de otras categorías sin cambiar de pestaña',()=>{
  assert.ok(document.querySelector('[aria-label="Insertar Dirección del inmueble"]'));
  assert.ok(!document.querySelector('[aria-label="Insertar DNI oferente/comprador"]'));
 });
 await buscarDato('');
 await click(document.querySelector('[aria-label="Insertar dato"]'));
 check('cerrar selector no altera la introducción',()=>assert.equal(document.querySelector('[aria-label="Insertar dato"]').getAttribute('aria-expanded'),'false'));
 await click(document.querySelector('[aria-label="Ocultar introducción"]'));
 check('cerrar sin cambios no pide confirmación ni guarda',()=>{assert.equal(pending,null);assert.equal(saves,0);assert.equal(document.querySelector('[contenteditable]'),null);});
 await click(document.querySelector('[aria-label="Desplegar introducción"]'));await click(button('Editar introducción'));
 await a.act(async()=>{const e=document.querySelector('[contenteditable]');e.append(' Cambio');e.dispatchEvent(new Event('input',{bubbles:true}));});
 await click(document.querySelector('[aria-label="Insertar dato"]'));
 const primerChip=document.querySelector('[aria-label^="Insertar "]:not([aria-label="Insertar dato"])');
 assert.ok(primerChip,'Tiene que haber al menos un chip disponible');
 const chipElegido=primerChip.getAttribute('aria-label');
 const totalAntes=document.querySelectorAll('[data-dw-token]').length;
 await click(primerChip);
 check('insertar agrega chip al texto y lo retira del selector',()=>{
  assert.equal(document.querySelectorAll('[data-dw-token]').length,totalAntes+1);
  assert.equal(document.querySelector('[aria-label="'+chipElegido+'"]'),null);
 });
 await click(document.querySelector('[aria-label="Ocultar introducción"]'));
 check('cerrar con cambios pide confirmación y conserva el borrador',()=>{assert.ok(pending.message.includes('Descartar'));assert.ok(document.querySelector('[contenteditable]').textContent.includes('Cambio'));assert.equal(saves,0);});pending=null;
 await click(button('Restablecer valor predeterminado'));
 check('restablecer espera confirmación',()=>{assert.ok(pending.message.includes('predeterminado'));assert.equal(saves,0);assert.ok(document.querySelector('[contenteditable]'));});pending=null;
 check('cancelar confirmación conserva edición',()=>{assert.ok(document.body.textContent.includes('Personalizado'));assert.equal(saves,0);});
 fail=true;await click(button('Restablecer valor predeterminado'));await a.act(async()=>pending.onConfirm());pending=null;
 check('error al restaurar conserva texto y permite reintento',()=>{assert.ok(document.querySelector('[contenteditable]').textContent.includes('Personalizado'));assert.ok(document.body.textContent.includes('No se pudo restablecer'));assert.equal(saves,1);});
 fail=false;await click(button('Restablecer valor predeterminado'));await a.act(async()=>pending.onConfirm());pending=null;
 check('confirmar persiste valor de fábrica y cierra editor',()=>{assert.equal(saves,2);assert.equal(profile.encabezados_custom.reserva,undefined);assert.equal(document.querySelector('[contenteditable]'),null);assert.ok(!document.body.textContent.includes('Guardar introducción'));});
 const clauses=[{id:'uuid-credito',titulo:'Crédito hipotecario (por Alexis)',contenido:'Condición genérica.',tipos:['reserva'],obligatoria:false},{id:'legacy-exp',titulo:'Expensas y servicios',contenido:'Vieja.',tipos:['reserva'],obligatoria:false},{id:'legacy-ocup',titulo:'Libre de ocupantes',contenido:'Vieja.',tipos:['reserva'],obligatoria:false}];
 profile={rol:'dueno',plantillas:{reserva:{clausulas_ids:clauses.map(c=>c.id)}}};
 await a.act(async()=>root.render(a.createElement(a.StepClausulas,{perfil:profile,data:{tipo:'reserva',clausulas_ids:[]},clausulas:clauses,onChange(){}})));
 check('opcionales usa catálogo actual y filtra legado',()=>{assert.ok(document.body.textContent.includes('Crédito hipotecario (por Alexis)'));assert.ok(!document.body.textContent.includes('Expensas y servicios'));assert.ok(!document.body.textContent.includes('Libre de ocupantes'));});
 await a.act(async()=>root.render(a.createElement(a.ClausulasWorkspace,{perfil:profile,clausulas:clauses,bloquesReserva:[],onSavePerfil:async()=>({})})));
 check('selector con ocho documentos y selección explícita',()=>{assert.equal(document.querySelectorAll('#dw-modelo-documento button').length,8);assert.equal(document.querySelectorAll('#dw-modelo-documento button[aria-pressed=true]').length,1);});
 await click([...document.querySelectorAll('#dw-modelo-documento button')].find(b=>b.textContent===a.TIPOS.reserva_alquiler));
 check('botón cambia el documento',()=>assert.equal(document.querySelector('#dw-modelo-documento [aria-pressed=true]').textContent,a.TIPOS.reserva_alquiler));
 await click(button('Cláusulas'));
 check('biblioteca tiene Todos los documentos y creación alineada en el mismo selector',()=>{assert.equal(document.querySelectorAll('#dw-biblioteca-documento .dw-document-choice').length,9);assert.equal(document.querySelectorAll('#dw-biblioteca-documento .dw-document-grid button').length,8);assert.ok(document.querySelector('#dw-biblioteca-documento .dw-document-selector-head [data-document-type=todas]'));assert.ok(document.querySelector('#dw-biblioteca-documento .dw-document-selector-head').textContent.includes('Crear cláusula'));assert.ok(!document.body.textContent.includes('Ideas de cláusulas de fábrica'));});
 await a.act(async()=>root.unmount());dom.window.close();console.log('APROBADAS',checks,'verificaciones de la tanda.');
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close();});
