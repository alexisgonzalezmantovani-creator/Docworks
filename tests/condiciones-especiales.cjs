const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-especiales-'));
const dom=new JSDOM('<html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(dir+'/src/App.tsx','utf8')+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,StepClausulas,ClausulasWorkspace,CLAUSULAS_DEFAULT,EMPTY_OP,SAMPLE_OP_PREVIEW,crearPlantillasIniciales,crearSnapshotPlantillaOperacion,getCamposFaltantesDetalle,getSteps,buildDocSections,docToPlainText,opParaDocumento,generarPDF,generarDOCX};',resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
const a=require(tmp+'/app.cjs');
let count=0;function check(label,fn){fn();count++;console.log('OK',label)}
const especiales=a.CLAUSULAS_DEFAULT.filter(c=>c.id.startsWith('especial.'));
const perfil={rol:'dueno',plantillas:a.crearPlantillasIniciales()};
const root=a.createRoot(document.getElementById('test'));
async function click(el){assert.ok(el);await a.act(async()=>el.click())}
async function fill(el,value){assert.ok(el);await a.act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));})}
(async()=>{
 for(const tipo of ['reserva','boleto','alquiler']){
  const cfg=perfil.plantillas[tipo];
  check(tipo+' extras habilitados y nunca obligatorios',()=>{for(const c of especiales.filter(c=>c.tipos.includes(tipo))){assert.ok(cfg.clausulas_ids.includes(c.id));assert.ok(!cfg.obligatorias_ids.includes(c.id));}});
  const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo,clausulas_ids:[]};
  check(tipo+' documento inicial sin condiciones especiales',()=>{const doc=a.buildDocSections(a.opParaDocumento(op),a.CLAUSULAS_DEFAULT,tipo);assert.ok(!doc.clausulas.some(c=>especiales.some(e=>e.titulo===c.titulo)));});
  op.clausulas_ids=especiales.filter(c=>c.tipos.includes(tipo)).map(c=>c.id);
  check(tipo+' detalle faltante lleva al paso de cláusulas',()=>{for(const campo of ['entrega_aires_detalle','entrega_muebles_detalle']){const f=a.getCamposFaltantesDetalle(op).find(f=>f.campo===campo);assert.ok(f);assert.equal(f.paso,a.getSteps(tipo).at(-1).id);}});
  op.entrega_aires_detalle='2 equipos FríoMarca, dormitorios, funcionando.';
  op.entrega_muebles_detalle='1 mesa de madera y 6 sillas, buen estado.';
  op.plantilla_snapshot=a.crearSnapshotPlantillaOperacion(op,perfil,a.CLAUSULAS_DEFAULT,[]);
  const antes=JSON.stringify(op),doc=a.buildDocSections(a.opParaDocumento(op),[],tipo),texto=a.docToPlainText(doc);
  check(tipo+' detalles llegan al documento desde snapshot',()=>{assert.ok(texto.includes(op.entrega_aires_detalle));assert.ok(texto.includes(op.entrega_muebles_detalle));assert.equal(JSON.stringify(op),antes);assert.ok(!a.getCamposFaltantesDetalle(op).some(f=>f.campo.startsWith('entrega_')));});
  check(tipo+' cuerpo editable no repite jurisdicción como extra',()=>assert.ok(!doc.clausulas.some(c=>c.titulo==='Jurisdicción')));
  const pdf=await a.generarPDF(doc,null,{}),word=await a.generarDOCX(doc,{});
  check(tipo+' exportaciones con detalles válidas',()=>{assert.ok(pdf.blob.size>1000);assert.ok(word.blob.size>1000);});
  fs.writeFileSync(tmp+'/'+tipo+'.pdf',Buffer.from(await pdf.blob.arrayBuffer()));
  fs.writeFileSync(tmp+'/'+tipo+'.docx',Buffer.from(await word.blob.arrayBuffer()));
 }
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'boleto'};
 const base=a.buildDocSections(a.opParaDocumento(op),[],'boleto');
 const iguales=[{id:'a',titulo:'Extra A',contenido:'Condición particular idéntica.',tipos:['boleto']},{id:'b',titulo:'Otro título',contenido:'Condición  particular\nidéntica.',tipos:['boleto']},{id:'c',titulo:'Texto distinto',contenido:'Condición particular diferente.',tipos:['boleto']},{id:'d',titulo:'Mismo texto que cuerpo',contenido:base.secciones[0].items[0],tipos:['boleto']}];
 const completo=a.buildDocSections(a.opParaDocumento({...op,clausulas_ids:iguales.map(c=>c.id),clausulas_custom_titulo:'Copia propia',clausulas_custom:'Condición particular idéntica.'}),iguales,'boleto');
 check('duplicados de biblioteca, cuerpo y texto propio se imprimen una vez',()=>{assert.equal(completo.clausulas.length,2);assert.ok(completo.clausulas.some(c=>c.texto==='Condición particular diferente.'));assert.equal(completo.clausulas[1].num,completo.clausulas[0].num+1);});
 const editable={...op,clausulas_ids:['repetida']};editable.plantilla_snapshot=a.crearSnapshotPlantillaOperacion(editable,perfil,[],[]);
 const cuerpo=editable.plantilla_snapshot.body_blocks.find(b=>b.id==='boleto.incumplimiento').contenido;
 check('deduplicación usa el cuerpo editable final',()=>{const doc=a.buildDocSections(editable,[{id:'repetida',titulo:'Otro título personalizado',contenido:cuerpo,tipos:['boleto']}],'boleto');assert.ok(!doc.clausulas.some(c=>c.titulo==='Otro título personalizado'));});
 let data={...op,clausulas_ids:[]};
 function render(){root.render(a.createElement(a.StepClausulas,{data,perfil,clausulas:a.CLAUSULAS_DEFAULT,onChange:(k,v)=>{data={...data,[k]:v};render();}}));}
 await a.act(async()=>render());
 await click(document.querySelector('[aria-label="Agregar Aires acondicionados incluidos"]'));
 await fill(document.getElementById('dw-field-entrega_aires_detalle'),'1 equipo en living, funcionando.');
 check('seleccionar aires abre el campo y conserva el dato',()=>assert.equal(data.entrega_aires_detalle,'1 equipo en living, funcionando.'));
 await click(document.querySelector('[aria-label="Quitar Aires acondicionados incluidos"]'));
 check('quitar condición oculta detalle y deja de exigirlo',()=>{assert.equal(document.getElementById('dw-field-entrega_aires_detalle'),null);assert.ok(!a.getCamposFaltantesDetalle(data).some(f=>f.campo==='entrega_aires_detalle'));assert.ok(!a.docToPlainText(a.buildDocSections(data,a.CLAUSULAS_DEFAULT,'boleto')).includes('1 equipo en living'));});
 await click(document.querySelector('[aria-label="Agregar Aires acondicionados incluidos"]'));
 check('volver a seleccionar recupera el detalle',()=>assert.equal(document.getElementById('dw-field-entrega_aires_detalle').value,'1 equipo en living, funcionando.'));
 const uuid='6b0e9c1f-7014-4d21-8248-f914727dfbc1';
 const copia={...especiales.find(c=>c.id==='especial.aires_incluidos'),id:uuid};
 data={...op,clausulas_ids:[]};
 const perfilUuid={...perfil,plantillas:{boleto:{clausulas_ids:[uuid]}}};
 function renderUuid(){root.render(a.createElement(a.StepClausulas,{data,perfil:perfilUuid,clausulas:[copia],onChange:(k,v)=>{data={...data,[k]:v};renderUuid();}}));}
 await a.act(async()=>renderUuid());
 await click(document.querySelector('[aria-label="Agregar Aires acondicionados incluidos"]'));
 check('copia con UUID exige detalle y abre el campo',()=>{assert.ok(document.getElementById('dw-field-entrega_aires_detalle'));assert.ok(a.getCamposFaltantesDetalle(data).some(f=>f.campo==='entrega_aires_detalle'));});
 await fill(document.getElementById('dw-field-entrega_aires_detalle'),'Equipo copiado con UUID en cocina.');
 check('copia con UUID exporta el detalle y no cambia biblioteca',()=>{assert.ok(a.docToPlainText(a.buildDocSections(data,[copia],'boleto')).includes('Equipo copiado con UUID en cocina.'));assert.equal(copia.contenido,especiales.find(c=>c.id==='especial.aires_incluidos').contenido);});
 await a.act(async()=>root.render(a.createElement(a.ClausulasWorkspace,{perfil,clausulas:a.CLAUSULAS_DEFAULT,operaciones:[],onSavePerfil:async()=>({})})));
 await click([...document.querySelectorAll('button')].find(b=>b.textContent==='Biblioteca de cláusulas'));
 check('biblioteca tiene un título y oculta esenciales',()=>{assert.equal([...document.querySelectorAll('h2')].filter(e=>e.textContent==='Biblioteca de cláusulas').length,1);for(const t of ['Multa por incumplimiento','Libre de ocupantes','Expensas y servicios'])assert.ok(!document.body.textContent.includes(t));assert.ok(document.body.textContent.includes('Crear cláusula para biblioteca'));assert.ok(document.body.textContent.includes('Cada asesor decide'));});
 await a.act(async()=>root.unmount());dom.window.close();
 console.log('APROBADAS',count,'verificaciones especiales. Exportaciones:',tmp);
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
