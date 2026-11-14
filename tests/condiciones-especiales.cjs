const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-especiales-'));
const dom=new JSDOM('<html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(dir+'/src/App.tsx','utf8')+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,StepInmueble,StepCondicionesAlquiler,StepClausulas,ClausulasWorkspace,CLAUSULAS_DEFAULT,EMPTY_OP,SAMPLE_OP_PREVIEW,crearPlantillasIniciales,crearSnapshotPlantillaOperacion,getCamposFaltantesDetalle,getSteps,plazoReservaAlquiler,valorComisionPredeterminado,comisionesContratoDesdeReserva,getDefaultBodyBlocks,buildDocSections,docToPlainText,opParaDocumento,generarPDF,generarDOCX};',resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
const a=require(tmp+'/app.cjs');
let count=0;function check(label,fn){fn();count++;console.log('OK',label)}
const especiales=a.CLAUSULAS_DEFAULT.filter(c=>c.id.startsWith('especial.'));
const perfil={rol:'dueno',plantillas:a.crearPlantillasIniciales()};
const root=a.createRoot(document.getElementById('test'));
async function click(el){assert.ok(el);await a.act(async()=>el.click())}
async function fill(el,value){assert.ok(el);await a.act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));})}
(async()=>{
 for(const tipo of ['reserva','boleto','reserva_alquiler','alquiler']){
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
 const ts=require('typescript'),source=fs.readFileSync(dir+'/src/App.tsx','utf8'),parsed=ts.createSourceFile('App.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let convertir;
 function find(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='convertirAContrato')convertir=n.getText(parsed);ts.forEachChild(n,find);}find(parsed);
 let conversion;
 const ejecutar=new Function('EMPTY_OP','yaConvertido','plazoReservaAlquiler','valorComisionPredeterminado','comisionesContratoDesdeReserva','crearDocumentoConfirmado','return ('+convertir+');')(a.EMPTY_OP,()=>false,a.plazoReservaAlquiler,a.valorComisionPredeterminado,a.comisionesContratoDesdeReserva,(data)=>{conversion=data;});
 const reservaEquipamiento={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,id:'reserva-con-inventario',tipo:'reserva_alquiler',clausulas_ids:['especial.aires_incluidos','especial.entrega_amoblada'],entrega_aires_detalle:'Aire de prueba en living.',entrega_muebles_detalle:'Mesa y cuatro sillas de la reserva.',locatario_telefono:'111111',locatario_telefono_en_doc:true,locador_email_en_doc:true,locatario_cotitulares:[{nombre:'Cotitular de prueba',dni:'30000001',telefono:'222222',telefono_en_doc:true}],inmueble_en_barrio_complejo:true,inmueble_barrio:'Complejo Los Álamos',inmueble_unidad_funcional:'UF 9',clausulas_custom_titulo:'Acuerdo particular',clausulas_custom:'Texto particular de la reserva.'};
 const sinMutar=JSON.stringify(reservaEquipamiento);ejecutar(reservaEquipamiento);
 check('conversión de reserva conserva inventario y aires',()=>{assert.equal(conversion.entrega_aires_detalle,reservaEquipamiento.entrega_aires_detalle);assert.equal(conversion.entrega_muebles_detalle,reservaEquipamiento.entrega_muebles_detalle);assert.equal(JSON.stringify(reservaEquipamiento),sinMutar);});
 check('conversión conserva contactos, checks y cotitulares',()=>{assert.equal(conversion.locatario_telefono,'111111');assert.equal(conversion.locatario_telefono_en_doc,true);assert.equal(conversion.locador_email_en_doc,true);assert.deepEqual(conversion.locatario_cotitulares,reservaEquipamiento.locatario_cotitulares);assert.notEqual(conversion.locatario_cotitulares,reservaEquipamiento.locatario_cotitulares);assert.equal(conversion.inmueble_unidad_funcional,'UF 9');assert.equal(conversion.inmueble_barrio,'Complejo Los Álamos');assert.equal(conversion.inmueble_en_barrio_complejo,true);assert.equal(conversion.clausulas_custom_titulo,'Acuerdo particular');});
 check('contrato convertido imprime los bienes que venían de la reserva',()=>{const text=a.docToPlainText(a.buildDocSections(a.opParaDocumento(conversion),a.CLAUSULAS_DEFAULT,'alquiler',a.getDefaultBodyBlocks('alquiler')));assert.ok(text.includes(reservaEquipamiento.entrega_aires_detalle));assert.ok(text.includes(reservaEquipamiento.entrega_muebles_detalle));});
 const amoblado={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_amoblado:true,alquiler_inventario:'1 heladera de prueba; mesa y 4 sillas de prueba.'};
 for(const editable of [false,true]){
   const bloques=editable?a.getDefaultBodyBlocks('alquiler'):undefined;
   const doc=a.buildDocSections(a.opParaDocumento(amoblado),[],'alquiler',bloques);
   check('inventario de alquiler presente '+(editable?'editable':'estándar'),()=>{const text=a.docToPlainText(doc);assert.equal(text.split(amoblado.alquiler_inventario).length-1,1);});
   const pdf=await a.generarPDF(doc,null,{}),word=await a.generarDOCX(doc,{});
   fs.writeFileSync(tmp+'/inventario-'+editable+'.pdf',Buffer.from(await pdf.blob.arrayBuffer()));
   fs.writeFileSync(tmp+'/inventario-'+editable+'.docx',Buffer.from(await word.blob.arrayBuffer()));
 }
 const personalizado=a.getDefaultBodyBlocks('alquiler').map((b,i)=>i===0?{...b,contenido:b.contenido+'\n\n{{alquiler_inventario}}'}:b);
 check('inventario ya incorporado por la plantilla no se duplica',()=>assert.equal(a.docToPlainText(a.buildDocSections(a.opParaDocumento(amoblado),[],'alquiler',personalizado)).split(amoblado.alquiler_inventario).length-1,1));
 for(const tipo of ['reserva','boleto','reserva_alquiler','alquiler']){
   let estado={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo,clausulas_ids:[]};
   function renderEquipamiento(){root.render(a.createElement(a.StepClausulas,{data:estado,perfil,clausulas:a.CLAUSULAS_DEFAULT,onChange:(k,v)=>{estado={...estado,[k]:v};renderEquipamiento();}}));}
   await a.act(async()=>renderEquipamiento());
   await click(document.querySelector('[aria-label="Incluir Entrega amoblada con inventario"]'));
   await fill(document.getElementById('dw-field-entrega_muebles_detalle'),'Mesa y cuatro sillas para '+tipo);
   check(tipo+' reutiliza inventario de cláusulas adicionales',()=>{assert.equal(document.querySelectorAll('#dw-field-entrega_muebles_detalle').length,1);assert.ok(a.docToPlainText(a.buildDocSections(estado,a.CLAUSULAS_DEFAULT,tipo)).includes('Mesa y cuatro sillas para '+tipo));});
 }
 const legado={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_amoblado:true,alquiler_inventario:'Inventario previo conservado',clausulas_ids:[]};
 await a.act(async()=>root.render(a.createElement(a.StepClausulas,{data:legado,perfil,clausulas:a.CLAUSULAS_DEFAULT,onChange:()=>{}})));
 check('inventario previo conserva su único editor en cláusulas',()=>{assert.equal(document.querySelectorAll('#dw-field-alquiler_inventario').length,1);assert.equal(document.getElementById('dw-field-alquiler_inventario').value,legado.alquiler_inventario);assert.equal(document.getElementById('dw-field-entrega_muebles_detalle'),null);});
 check('inventario previo vacío señala el paso de cláusulas',()=>assert.equal(a.getCamposFaltantesDetalle({...legado,alquiler_inventario:''}).find(x=>x.campo==='alquiler_inventario').paso,7));
 await a.act(async()=>root.render(a.createElement(a.StepCondicionesAlquiler,{data:legado,onChange:()=>{},equipo:[]})));
 check('condiciones no duplica editor de inventario',()=>assert.equal(document.getElementById('dw-field-alquiler_inventario'),null));
 await a.act(async()=>root.render(a.createElement(a.StepInmueble,{data:{...legado,descripcion_inmueble:'Dato anterior conservado'},onChange:()=>{},faltantes:[]})));
 check('inmueble no muestra descripción ni detalles genéricos',()=>{assert.equal(document.getElementById('dw-field-descripcion_inmueble'),null);assert.ok(!document.body.textContent.includes('Detalles adicionales'));});
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
 await click(document.querySelector('[aria-label="Incluir Aires acondicionados incluidos"]'));
 await fill(document.getElementById('dw-field-entrega_aires_detalle'),'1 equipo en living, funcionando.');
 check('seleccionar aires abre el campo y conserva el dato',()=>assert.equal(data.entrega_aires_detalle,'1 equipo en living, funcionando.'));
 await click(document.querySelector('[aria-label="Quitar Aires acondicionados incluidos"]'));
 check('quitar condición oculta detalle y deja de exigirlo',()=>{assert.equal(document.getElementById('dw-field-entrega_aires_detalle'),null);assert.ok(!a.getCamposFaltantesDetalle(data).some(f=>f.campo==='entrega_aires_detalle'));assert.ok(!a.docToPlainText(a.buildDocSections(data,a.CLAUSULAS_DEFAULT,'boleto')).includes('1 equipo en living'));});
 await click(document.querySelector('[aria-label="Incluir Aires acondicionados incluidos"]'));
 check('volver a seleccionar recupera el detalle',()=>assert.equal(document.getElementById('dw-field-entrega_aires_detalle').value,'1 equipo en living, funcionando.'));
 const uuid='6b0e9c1f-7014-4d21-8248-f914727dfbc1';
 const copia={...especiales.find(c=>c.id==='especial.aires_incluidos'),id:uuid};
 data={...op,clausulas_ids:[]};
 const perfilUuid={...perfil,plantillas:{boleto:{clausulas_ids:[uuid]}}};
 function renderUuid(){root.render(a.createElement(a.StepClausulas,{data,perfil:perfilUuid,clausulas:[copia],onChange:(k,v)=>{data={...data,[k]:v};renderUuid();}}));}
 await a.act(async()=>renderUuid());
 await click(document.querySelector('[aria-label="Incluir Aires acondicionados incluidos"]'));
 check('copia con UUID exige detalle y abre el campo',()=>{assert.ok(document.getElementById('dw-field-entrega_aires_detalle'));assert.ok(a.getCamposFaltantesDetalle(data).some(f=>f.campo==='entrega_aires_detalle'));});
 await fill(document.getElementById('dw-field-entrega_aires_detalle'),'Equipo copiado con UUID en cocina.');
 check('copia con UUID exporta el detalle y no cambia biblioteca',()=>{assert.ok(a.docToPlainText(a.buildDocSections(data,[copia],'boleto')).includes('Equipo copiado con UUID en cocina.'));assert.equal(copia.contenido,especiales.find(c=>c.id==='especial.aires_incluidos').contenido);});
 await a.act(async()=>root.render(a.createElement(a.ClausulasWorkspace,{perfil,clausulas:a.CLAUSULAS_DEFAULT,operaciones:[],onSavePerfil:async()=>({})})));
 await click([...document.querySelectorAll('button')].find(b=>b.textContent==='Cláusulas'));
 check('biblioteca tiene un título y oculta esenciales',()=>{assert.equal([...document.querySelectorAll('h1')].filter(e=>e.textContent==='Biblioteca de cláusulas').length,1);for(const t of ['Multa por incumplimiento','Libre de ocupantes','Expensas y servicios'])assert.ok(!document.body.textContent.includes(t));assert.ok(document.body.textContent.includes('Crear cláusula para biblioteca'));assert.ok(document.body.textContent.includes('asesores podrán agregarlas'));});
 await a.act(async()=>root.unmount());dom.window.close();
 console.log('APROBADAS',count,'verificaciones especiales. Exportaciones:',tmp);
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
