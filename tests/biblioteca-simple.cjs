const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-biblioteca-'));
const dom=new JSDOM('<html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(dir+'/src/App.tsx','utf8')+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,ClausulasWorkspace,obtenerPlantillaConfig,clausulaAplicaTipo,TIPOS,PLANTILLA_TIPOS,EMPTY_OP,SAMPLE_OP_PREVIEW,buildDocSections,docToPlainText,crearSnapshotPlantillaOperacion,navegarConProteccionModelo};export {buscarTitulosParecidos,guardarClausulaConDisponibilidad} from "./Clausulas";',resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
const a=require(tmp+'/app.cjs');let checks=0,pendingConfirm=null;
window.addEventListener('dw:confirm',e=>{pendingConfirm=e.detail;});
function check(label,fn){fn();checks++;console.log('OK',label)}
const existente={id:'anterior',titulo:'Crédito hipotecario',contenido:'La condición de aprobación del crédito hipotecario tendrá una vigencia de 90 días.',tipos:['reserva'],obligatoria:false};
const nueva={titulo:'Crédito hipotecario',contenido:'La condición de aprobación del crédito hipotecario se pacta sin plazo determinado.',tipos:['reserva'],obligatoria:false};
const original=JSON.stringify(existente);
let perfil={rol:'dueno',nombre:'Inmobiliaria',plantillas:{reserva:{clausulas_ids:['anterior'],version:7,body_blocks:[{id:'modelo',contenido:'Texto conservado'}]},alquiler:{clausulas_ids:[],version:4}}};
let catalogo=[existente],altas=0,guardados=0,fallar=false,altaPendiente=null;
let papelera=[{id:'eliminada',titulo:'Condición anterior eliminada',contenido:'Texto histórico para recuperar.',eliminado_en:'2026-10-28T12:00:00Z'}],recargas=0,restauraciones=0,fallarRestauracion=false;
const deps={crear:async c=>{altas++;catalogo.push({...c,id:'nuevo'});return {data:'nuevo'}},getPerfil:()=>perfil,guardarPerfil:async p=>{guardados++;if(fallar)return {error:{message:'Fallo simulado'}};perfil=p;return {}},tipos:a.PLANTILLA_TIPOS,aplicaTipo:a.clausulaAplicaTipo,obtenerConfig:a.obtenerPlantillaConfig,catalogo};
(async()=>{
 check('título igual con otro plazo solo genera aviso',()=>{assert.equal(a.buscarTitulosParecidos(nueva.titulo,catalogo).length,1);assert.equal(JSON.stringify(existente),original)});
 check('títulos parecidos con acentos y plazo generan aviso',()=>assert.equal(a.buscarTitulosParecidos('Credito hipotecario 90 días',catalogo).length,1));
 check('títulos distintos no generan aviso genérico',()=>assert.equal(a.buscarTitulosParecidos('Entrega con aires incluidos',catalogo).length,0));
 check('editar una cláusula no avisa contra sí misma',()=>assert.equal(a.buscarTitulosParecidos(existente.titulo,catalogo,'anterior').length,0));
 let r=await a.guardarClausulaConDisponibilidad(nueva,{habilitar:true},deps);
 check('una acción crea y habilita el UUID real',()=>{assert.equal(r.data,'nuevo');assert.equal(altas,1);assert.equal(guardados,1);assert.deepEqual(perfil.plantillas.reserva.clausulas_ids,['anterior','nuevo']);assert.equal(perfil.plantillas.reserva.obligatorias_ids,undefined);});
 check('respeta otros documentos y contenido del modelo',()=>{assert.equal(perfil.plantillas.alquiler.version,4);assert.deepEqual(perfil.plantillas.alquiler.clausulas_ids,[]);assert.equal(perfil.plantillas.reserva.version,7);assert.equal(perfil.plantillas.reserva.body_blocks[0].contenido,'Texto conservado');});
 check('no fusiona ni cambia condiciones de 90 días y sin plazo',()=>{assert.equal(JSON.stringify(existente),original);assert.equal(catalogo[1].contenido,nueva.contenido);});
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',clausulas_ids:['anterior','nuevo']};
 const doc=a.buildDocSections(op,catalogo,'reserva');
 check('ambas redacciones se conservan al final del documento',()=>{assert.equal(doc.clausulas.length,2);assert.equal(doc.clausulas[0].texto,existente.contenido);assert.equal(doc.clausulas[1].texto,nueva.contenido);assert.equal(doc.clausulas[0].num,doc.secciones.length+1);});
 const copiaPerfil=JSON.stringify(perfil);guardados=0;
 r=await a.guardarClausulaConDisponibilidad({...nueva,titulo:'Solo biblioteca'},{habilitar:false},deps);
 check('guardar solo en biblioteca no modifica plantillas',()=>{assert.equal(guardados,0);assert.equal(JSON.stringify(perfil),copiaPerfil)});
 fallar=true;altas=0;
 r=await a.guardarClausulaConDisponibilidad(nueva,{habilitar:true},deps);
 check('fallo de perfil conserva ID para reintentar',()=>{assert.ok(r.error);assert.equal(r.clausulaCreadaId,'nuevo');assert.equal(altas,1)});
 fallar=false;r=await a.guardarClausulaConDisponibilidad(nueva,{habilitar:true,creadaId:r.clausulaCreadaId},deps);
 check('reintentar habilitación no crea otra cláusula',()=>{assert.ok(!r.error);assert.equal(altas,1);assert.equal(perfil.plantillas.reserva.clausulas_ids.filter(x=>x==='nuevo').length,1)});
 const rechazada=await a.guardarClausulaConDisponibilidad(nueva,{habilitar:true},{...deps,crear:async()=>({error:{message:'Sin permisos'}})});
 check('error de alta no habilita ni informa éxito',()=>assert.equal(rechazada.error.message,'Sin permisos'));
 const incierta=await a.guardarClausulaConDisponibilidad(nueva,{habilitar:true},{...deps,crear:async()=>{throw new Error('Conexión interrumpida')}});
 check('respuesta incierta pide revisar antes de volver a crear',()=>assert.equal(incierta.creacionSinConfirmar,true));
 const root=a.createRoot(document.getElementById('test'));
 const button=t=>{const el=[...document.querySelectorAll('button')].find(b=>b.textContent.replace('✓ ','').trim()===t);assert.ok(el,t);return el};
 async function click(el){await a.act(async()=>el.click())}
 async function fill(el,value){assert.ok(el);await a.act(async()=>{const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));})}
 perfil={rol:'dueno',plantillas:{}};catalogo=[existente];altas=0;guardados=0;fallar=true;
 function render(){root.render(a.createElement(a.ClausulasWorkspace,{perfil,clausulas:catalogo,operaciones:[],papeleraClausulas:papelera,onRecargarPapeleraClausulas:()=>{recargas++},onRestaurarClausula:async id=>{restauraciones++;if(fallarRestauracion)return {error:{message:"No se pudo restaurar la condición"}};catalogo=[...catalogo,...papelera.filter(c=>c.id===id)];papelera=papelera.filter(c=>c.id!==id);render();return {}},onAddClausula:async c=>{altas++;const id=altas===1?'uuid-real':'uuid-real-'+altas;catalogo=[...catalogo,{...c,id}];render();return altaPendiente?altaPendiente.promise:{data:id}},onEditClausula:async()=>({}),onSavePerfil:async p=>{guardados++;if(fallar)return {error:{message:'Fallo de red'}};perfil=p;render();return {};} }));}
 await a.act(async()=>render());await click(button('Biblioteca de cláusulas'));await click(button('＋ Crear cláusula para biblioteca'));
 check('documentos y disponibilidad se ven sin abrir opciones',()=>{assert.ok(document.querySelector('fieldset').textContent.includes('Aplica a los documentos'));assert.ok([...document.querySelectorAll('input[type=checkbox]')].some(e=>e.checked));assert.ok(!document.body.textContent.includes('Obligatoria en la biblioteca'));});
 await fill(document.querySelector('fieldset input.inp'),nueva.titulo);await fill(document.getElementById('dw-clausula-texto'),nueva.contenido);
 await click(button(a.TIPOS.reserva));
 check('aviso permite comparar el texto original',()=>{assert.ok(document.querySelector('[role=status]').textContent.includes('Podrían tener condiciones o plazos diferentes'));assert.ok(document.querySelector('[role=status] details').textContent.includes('90 días'));});
 await click(button('Guardar y habilitar'));
 check('fallo de habilitación conserva formulario y ofrece reintento',()=>{assert.ok(document.querySelector('fieldset').disabled);assert.equal(document.getElementById('dw-clausula-texto').value,nueva.contenido);assert.ok(document.body.textContent.includes('La cláusula ya está guardada'));assert.ok(button('Reintentar habilitación'));assert.equal(altas,1)});
 await click(button('Documentos'));
 check('salir con habilitación pendiente informa que el texto ya está guardado',()=>{assert.ok(pendingConfirm.message.includes('está guardada en la biblioteca'));assert.ok(pendingConfirm.message.includes('habilitación pendiente'));assert.equal(altas,1);});
 pendingConfirm=null;
 fallar=false;await click(button('Reintentar habilitación'));
 check('reintento desde editor habilita sin duplicar alta',()=>{assert.equal(altas,1);assert.equal(guardados,2);assert.deepEqual(perfil.plantillas.reserva.clausulas_ids,['uuid-real']);assert.equal(perfil.plantillas.alquiler,undefined);assert.equal(document.getElementById('dw-clausula-texto'),null)});
 await click(button('＋ Crear cláusula para biblioteca'));
 await fill(document.querySelector('fieldset input.inp'),'Texto solo de biblioteca');await fill(document.getElementById('dw-clausula-texto'),'Condición particular sin habilitar.');
 await click([...document.querySelectorAll('fieldset input[type=checkbox]')][0]);
 const savesBefore=guardados;await click(button('Guardar cláusula'));
 check('opción biblioteca sola funciona desde el mismo editor',()=>{assert.equal(guardados,savesBefore);assert.equal(altas,2)});
 await click(button('Usar esta idea'));
 check('idea de fábrica abre el mismo editor sin guardar todavía',()=>{assert.equal(altas,2);assert.ok(document.getElementById('dw-clausula-texto'));assert.ok(button('Guardar y habilitar'));});
 const borrador=document.getElementById('dw-clausula-texto').value;
 await click(button('Documentos'));
 check('cambiar de biblioteca a documentos protege el borrador',()=>{assert.ok(pendingConfirm);assert.ok(document.getElementById('dw-clausula-texto'));assert.equal(document.getElementById('dw-clausula-texto').value,borrador);});
 pendingConfirm=null;
 check('cancelar la salida conserva texto sin guardarlo',()=>{assert.equal(altas,2);assert.equal(document.getElementById('dw-clausula-texto').value,borrador);});
 await click(button('Documentos'));await a.act(async()=>pendingConfirm.onConfirm());pendingConfirm=null;
 check('confirmar salida descarta borrador sin crear cláusula',()=>{assert.equal(altas,2);assert.ok(document.getElementById('dw-modelo-documento'));});
 await click(button('Biblioteca de cláusulas'));await click(button('＋ Crear cláusula para biblioteca'));
 await fill(document.querySelector('fieldset input.inp'),'Borrador protegido');await fill(document.getElementById('dw-clausula-texto'),'Texto a conservar si cancelo.');
 const unload=new Event('beforeunload',{cancelable:true});window.dispatchEvent(unload);
 check('recargar la página advierte por borrador pendiente',()=>assert.ok(unload.defaultPrevented));
 let salidas=0;await a.act(async()=>a.navegarConProteccionModelo(()=>salidas++));
 check('salir por navegación principal espera confirmación',()=>{assert.equal(salidas,0);assert.ok(pendingConfirm);});
 pendingConfirm=null;
 await click(button('Cancelar'));
 check('cancelar editor con texto pide confirmar',()=>{assert.ok(pendingConfirm);assert.equal(document.getElementById('dw-clausula-texto').value,'Texto a conservar si cancelo.');});
 await a.act(async()=>pendingConfirm.onConfirm());pendingConfirm=null;
 check('descartar desde editor cierra sin guardar',()=>{assert.equal(document.getElementById('dw-clausula-texto'),null);assert.equal(altas,2);});
 await click(button('＋ Crear cláusula para biblioteca'));await click(button('Cancelar'));
 check('editor nuevo vacío se cierra sin confirmación',()=>{assert.equal(pendingConfirm,null);assert.equal(document.getElementById('dw-clausula-texto'),null);});
 const recargaLimpia=new Event('beforeunload',{cancelable:true});window.dispatchEvent(recargaLimpia);
 check('editor cerrado no deja avisos de recarga activos',()=>assert.equal(recargaLimpia.defaultPrevented,false));
 await click(button('＋ Crear cláusula para biblioteca'));
 await fill(document.querySelector('fieldset input.inp'),'Guardado pendiente');await fill(document.getElementById('dw-clausula-texto'),'Texto mientras se espera respuesta.');
 let resolverAlta;altaPendiente={promise:new Promise(resolve=>{resolverAlta=resolve;})};
 await click(button('Guardar y habilitar'));
 let fueraDuranteGuardado=0;await a.act(async()=>a.navegarConProteccionModelo(()=>fueraDuranteGuardado++));
 check('guardar pendiente bloquea la salida sin ofrecer descartar',()=>{assert.equal(fueraDuranteGuardado,0);assert.equal(pendingConfirm,null);assert.equal(document.getElementById('dw-clausula-texto').value,'Texto mientras se espera respuesta.');});
 await a.act(async()=>resolverAlta({data:'uuid-real-3'}));altaPendiente=null;
 check('completar guardado libera el editor normalmente',()=>{assert.equal(document.getElementById('dw-clausula-texto'),null);assert.equal(altas,3);});
 await click(button('Biblioteca de cláusulas'));
 check('biblioteca activa no mezcla cláusulas eliminadas',()=>{assert.ok(!document.body.textContent.includes('Condición anterior eliminada'));assert.equal(document.getElementById('dw-papelera-titulo'),null);assert.ok(button('Papelera').querySelector('svg'));assert.ok(!button('Papelera').textContent.includes('♻'));});
 await click(button('Papelera'));
 check('papelera abre una sección independiente y recarga',()=>{assert.equal(recargas,1);assert.ok(document.getElementById('dw-papelera-titulo'));assert.equal(document.getElementById('dw-biblioteca-documento'),null);assert.ok(document.body.textContent.includes('Condición anterior eliminada'));assert.ok(document.querySelector('section details').textContent.includes('Texto histórico para recuperar.'));assert.equal(button('Papelera').getAttribute('aria-pressed'),'true');});
 fallarRestauracion=true;await click(button('Restaurar'));
 check('restauración fallida conserva el registro y muestra el error',()=>{assert.equal(restauraciones,1);assert.ok(document.querySelector('[role=alert]').textContent.includes('No se pudo restaurar'));assert.equal(papelera.length,1);assert.equal(button('Restaurar').disabled,false);});
 fallarRestauracion=false;await click(button('Restaurar'));
 check('restauración correcta deja papelera vacía',()=>{assert.equal(restauraciones,2);assert.ok(document.body.textContent.includes('La papelera está vacía'));assert.ok(!document.querySelector('[role=alert]'));});
 await click(button('Volver a biblioteca'));
 check('volver muestra la cláusula restaurada en biblioteca',()=>{assert.ok(document.getElementById('dw-biblioteca-documento'));assert.ok(document.body.textContent.includes('Condición anterior eliminada'));assert.equal(document.getElementById('dw-papelera-titulo'),null);});
 await click(button('＋ Crear cláusula para biblioteca'));await fill(document.querySelector('fieldset input.inp'),'Borrador antes de papelera');
 await click(button('Papelera'));
 check('ir a papelera respeta borradores pendientes',()=>{assert.ok(pendingConfirm);assert.ok(document.querySelector('fieldset'));assert.equal(recargas,1);assert.equal(document.getElementById('dw-papelera-titulo'),null);});
 await a.act(async()=>pendingConfirm.onConfirm());pendingConfirm=null;
 check('confirmar salida abre papelera una sola vez',()=>{assert.equal(recargas,2);assert.ok(document.getElementById('dw-papelera-titulo'));});
 perfil={rol:'dueno',plantillas:{reserva:{locked:true,clausulas_ids:['protegida']}}};
 catalogo=[
  {id:'uuid-vieja',titulo:'Multa por incumplimiento',contenido:'Texto antiguo.',tipos:['todos'],obligatoria:false},
  {id:'eliminada-vieja',titulo:'Eliminada del catálogo',contenido:'No debe ofrecerse.',tipos:['todos'],activo:false},
  {id:'protegida',titulo:'Incluida en modelo fijado',contenido:'Texto protegido.',tipos:['todos']},
  {id:'credito-90',titulo:'Crédito hipotecario 90 días',contenido:'Válido por 90 días.',tipos:['todos']},
  {id:'credito-sin-plazo',titulo:'Crédito hipotecario sin plazo',contenido:'Válido sin plazo.',tipos:['todos']},
  {id:'solo-boleto',titulo:'Acuerdo especial del boleto',contenido:'Texto de boleto.',tipos:['boleto']}
 ];await a.act(async()=>render());
 const visibles=()=>[...document.querySelectorAll('[data-clausula-id]')].map(e=>e.dataset.clausulaId);
 async function elegir(id,tipo){await a.act(async()=>{const el=document.getElementById(id);el.value=tipo;el.dispatchEvent(new Event('change',{bubbles:true}));});}
 for(const tipo of a.PLANTILLA_TIPOS){
  await click(button('Biblioteca de cláusulas'));await elegir('dw-biblioteca-documento',tipo);const idsBiblioteca=visibles();
  await click(button('Documentos'));await elegir('dw-modelo-documento',tipo);const idsDocumento=visibles();
  check(tipo+' muestra el mismo catálogo en Biblioteca y Documentos',()=>{assert.deepEqual(idsDocumento,idsBiblioteca);assert.ok(!idsDocumento.includes('uuid-vieja'));assert.ok(!idsDocumento.includes('eliminada-vieja'));assert.ok(!idsDocumento.includes('protegida'));assert.ok(idsDocumento.includes('credito-90'));assert.ok(idsDocumento.includes('credito-sin-plazo'));assert.equal(idsDocumento.includes('solo-boleto'),tipo==='boleto');});
 }
 catalogo=catalogo.filter(c=>c.id!=='credito-90').map(c=>c.id==='credito-sin-plazo'?{...c,titulo:'Crédito hipotecario actualizado'}:c);await a.act(async()=>render());
 check('recargar catálogo actualiza Documentos sin revivir textos anteriores',()=>{assert.ok(!visibles().includes('credito-90'));assert.ok(document.getElementById('dw-model-extra-clauses').textContent.includes('Crédito hipotecario actualizado'));});
 await click(button('Biblioteca de cláusulas'));await elegir('dw-biblioteca-documento','todas');
 check('Biblioteca refleja la misma eliminación y el mismo nombre actualizado',()=>{assert.ok(!visibles().includes('credito-90'));assert.ok(document.body.textContent.includes('Crédito hipotecario actualizado'));});
 perfil={...perfil,rol:'asesor'};await a.act(async()=>render());
 check('asesor no accede a papelera ni a restauración',()=>{assert.ok(![...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Papelera'));assert.equal(document.getElementById('dw-papelera-titulo'),null);});
 await a.act(async()=>root.unmount());dom.window.close();console.log('APROBADAS',checks,'verificaciones de biblioteca simple.');
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
