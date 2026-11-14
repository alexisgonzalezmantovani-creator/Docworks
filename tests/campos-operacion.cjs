const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),ts=require('typescript'),{JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-campos-'));
const dom=new JSDOM('<html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};
const source=fs.readFileSync(dir+'/src/App.tsx','utf8');
require('esbuild').buildSync({stdin:{contents:source+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,StepInmueble,StepDocSimple,StepPersona,StepClausulas,PasoResumenFinal,CompartidaBlock,StepEconomicoCompra,StepCondicionesAlquiler,StepCondicionesReservaAlq,SeguroOperacion,EMPTY_OP,SAMPLE_OP_PREVIEW,derivedTokensGenerales,getResumenMonto,getCamposFaltantes,getCamposFaltantesDetalle,draftTieneContenido,getComisionComponents,datosCompraCompartidos,valorComisionPredeterminado,buildDocSections,opParaDocumento,docToPlainText,generarPDF,generarDOCX,getDefaultBodyBlocks};',resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
const a=require(tmp+'/app.cjs'),root=a.createRoot(document.getElementById('test'));let count=0;
function check(label,fn){fn();count++;console.log('OK',label)}
async function fill(el,v){assert.ok(el);await a.act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));});}
async function click(el){assert.ok(el);await a.act(async()=>el.click());}
(async()=>{
 let state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler'};
 function render(Component,extra={}){root.render(a.createElement(Component,{data:state,onChange:(k,v)=>{if(Object.is(state[k],v))return;state={...state,[k]:v};render(Component,extra)},equipo:[],faltantes:[],...extra}));}
 let campoRevision=null;
 state={...a.EMPTY_OP,tipo:'reserva'};
 await a.act(async()=>render(a.PasoResumenFinal,{clausulas:[],perfil:{},onVolver:campo=>{campoRevision=campo;},onFinalizarAccion:()=>{},puedeGuardar:false}));
 const pendientesRevision=a.getCamposFaltantesDetalle(state,{});
 check('el resumen muestra una única lista de datos pendientes',()=>{
  assert.ok(pendientesRevision.length>0);
  assert.equal(document.querySelectorAll('[aria-label="Datos para completar"] button').length,pendientesRevision.length);
  assert.equal([...document.querySelectorAll('button')].filter(b=>b.textContent.includes('Revisar faltantes')).length,0);
  assert.ok(!document.body.textContent.includes('Ficha técnica de todo lo cargado'));
  assert.ok(!document.body.textContent.includes('No agregaste cláusulas adicionales'));
 });
 check('sin datos, guardar o emitir queda deshabilitado',()=>assert.equal([...document.querySelectorAll('button')].find(b=>b.textContent.includes('Guardar o emitir')).disabled,true));
 await click(document.querySelector('[aria-label="Datos para completar"] button'));
 check('tocar dato pendiente regresa a su campo sin pérdida de navegación',()=>assert.equal(campoRevision,pendientesRevision[0].campo));
 let finalizacion=null;
 state={...a.EMPTY_OP,tipo:'reserva',comprador_nombre:'Comprador de prueba'};
 await a.act(async()=>render(a.PasoResumenFinal,{clausulas:[],perfil:{},onVolver:()=>{},onFinalizarAccion:(accion,estado)=>{finalizacion={accion,estado};}}));
 await click([...document.querySelectorAll('button')].find(b=>b.textContent.includes('Guardar o emitir')));
 check('estado y acciones se ven en el mismo diálogo',()=>{
  const dialog=document.querySelector('[role="dialog"][aria-label="Guardar o emitir"]');
  assert.ok(dialog);
  assert.equal(dialog.querySelectorAll('[role="group"][aria-label="Estado de la operación"] button').length,3);
  for(const txt of ['Guardar y abrir PDF / Word','Guardar y enviar por WhatsApp','Guardar y terminar'])assert.ok([...dialog.querySelectorAll('button')].some(b=>b.textContent.includes(txt)));
 });
 await click(document.querySelector('[aria-label="Estado: Cerrado"]'));
 check('estado Cerrado marcado por accesibilidad',()=>assert.equal(document.querySelector('[aria-label="Estado: Cerrado"]').getAttribute('aria-pressed'),'true'));
 await click([...document.querySelectorAll('[role="dialog"] button')].find(b=>b.textContent.includes('Guardar y terminar')));
 check('guardar conserva el estado elegido sin segunda pantalla',()=>assert.deepEqual(finalizacion,{accion:'guardar',estado:'cerrado'}));
 state={...a.EMPTY_OP,tipo:'reserva',compra_instrumento:'cesion_boleto'};
 await a.act(async()=>render(a.PasoResumenFinal,{clausulas:[],perfil:{},onVolver:()=>{},onFinalizarAccion:()=>{}}));
 await click([...document.querySelectorAll('button')].find(b=>b.textContent.includes('Guardar o emitir')));
 check('cesión sin contrato propio no puede emitir ni enviar',()=>{
  const dialog=document.querySelector('[role="dialog"][aria-label="Guardar o emitir"]');
  for(const txt of ['Guardar y abrir PDF / Word','Guardar y enviar por WhatsApp'])assert.equal([...dialog.querySelectorAll('button')].find(b=>b.textContent.includes(txt)).disabled,true);
  assert.equal([...dialog.querySelectorAll('button')].find(b=>b.textContent.includes('Guardar y terminar')).disabled,false);
 });
 await click(document.querySelector('[role="dialog"] button[aria-label="Cerrar"]'));
 state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler'};
 for(const [tipo,Component,fields] of [
  ['reserva',a.StepEconomicoCompra,['precio','anticipo']],['boleto',a.StepEconomicoCompra,['precio','anticipo']],
  ['exclusividad',a.StepDocSimple,['precio']],['refuerzo_reserva',a.StepDocSimple,['precio']],['devolucion_reserva',a.StepDocSimple,['precio']],
  ['alquiler',a.StepCondicionesAlquiler,['alquiler_monto_inicial']],['reserva_alquiler',a.StepCondicionesReservaAlq,['res_alq_monto_reserva','res_alq_monto_mensual']]]){
   state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo};await a.act(async()=>render(Component));
   for(const field of fields){const el=document.getElementById('dw-field-'+field);await fill(el,'100000');check(tipo+' '+field+' agrega puntos sin alterar el valor',()=>{assert.equal(el.value,'100.000');assert.equal(state[field],'100000');});await fill(el,'1.234.567,89');check(tipo+' '+field+' conserva centavos',()=>{assert.equal(el.value,'1.234.567,89');assert.equal(state[field],'1234567.89');});await fill(el,'');check(tipo+' '+field+' permite borrar',()=>assert.equal(state[field],''));}
 }
 state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',precio:'100000',anticipo:'10000'};await a.act(async()=>render(a.StepEconomicoCompra));
 const visibleComision=document.querySelector('[aria-label="Mostrar comisión: Vendedor"]');await click(visibleComision);check('ocultar comisión se guarda con el indicador existente',()=>assert.equal(state.comision_vendedor_ocultar_doc,true));await click(visibleComision);check('mostrar comisión revierte sólo la visibilidad',()=>{assert.equal(state.comision_vendedor_ocultar_doc,false);assert.equal(state.precio,'100000');});
 state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler'};
 await a.act(async()=>render(a.StepCondicionesAlquiler));
 const meses=document.getElementById('dw-field-alquiler_plazo_meses');await fill(meses,'');check('meses puede quedar vacío mientras se reemplaza',()=>assert.equal(meses.value,''));await fill(meses,'12');check('meses acepta reemplazo sin prefijo',()=>assert.equal(state.alquiler_plazo_meses,'12'));
 for(const campo of ['alquiler_interes_punitorio','alquiler_penalidad_meses','alquiler_aviso_meses']){const el=document.getElementById('dw-field-'+campo);await fill(el,'');check(campo+' permite borrar',()=>assert.equal(el.value,''));await fill(el,'10');check(campo+' toma valor nuevo',()=>assert.equal(state[campo],'10'));await fill(el,'0');check(campo+' conserva cero explícito',()=>assert.equal(el.value,'0'));}
 state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',reserva_aceptacion_modo:'dias'};await a.act(async()=>render(a.StepEconomicoCompra));let dias=document.querySelector('input[max="90"]');await fill(dias,'');check('días de aceptación permite borrar',()=>assert.equal(dias.value,''));await fill(dias,'12');check('aceptación conserva 12 y calcula vencimiento',()=>{assert.equal(state.reserva_aceptacion_dias,'12');assert.ok(state.reserva_aceptacion_vencimiento);});
 state={...state,reserva_aceptacion_modo:'horas'};await a.act(async()=>render(a.StepEconomicoCompra));const horas=document.querySelector('input[max="720"]');await fill(horas,'');check('horas permite borrar',()=>assert.equal(horas.value,''));await fill(horas,'72');check('horas permite reemplazar',()=>assert.equal(state.reserva_aceptacion_horas,'72'));
 state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva_alquiler',res_alq_moneda:'ARS',res_alq_monto_mensual_moneda:'USD',res_alq_monto_mensual:'1.900',alquiler_monto_inicial:'999',alquiler_moneda:'ARS',res_alq_comision_locador_valor:'1',res_alq_comision_locatario_valor:'2'};
 await a.act(async()=>render(a.StepCondicionesReservaAlq));check('abrir condiciones no pisa la moneda mensual guardada',()=>assert.equal(state.res_alq_monto_mensual_moneda,'USD'));
 check('resumen usa importe y moneda de reserva de alquiler',()=>{const resumen=a.getResumenMonto(state);assert.ok(resumen.includes('USD'));assert.ok(resumen.includes('1.900'));assert.ok(!resumen.includes('999'));});
 check('campo automático Moneda respeta el tipo de operación',()=>{assert.ok(a.derivedTokensGenerales({...a.EMPTY_OP,tipo:'alquiler',moneda:'USD',alquiler_moneda:'ARS'}).moneda_txt.includes('PESOS'));assert.ok(a.derivedTokensGenerales({...a.EMPTY_OP,tipo:'reserva_alquiler',moneda:'USD',res_alq_moneda:'ARS'}).moneda_txt.includes('PESOS'));});
 check('comisiones de reserva usan canon y moneda propios',()=>{const cs=a.getComisionComponents(state);assert.equal(cs.find(x=>x.rol==='locador').monto,19);assert.equal(cs.find(x=>x.rol==='locatario').monto,38);assert.ok(cs.every(x=>x.moneda==='USD'));});
 const parsed=ts.createSourceFile('App.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),fns={};function walk(n){if(ts.isFunctionDeclaration(n)&&n.name)fns[n.name.text]=n.getText(parsed);ts.forEachChild(n,walk)}walk(parsed);
 const compra={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',id:'reserva-prueba',comprador_cotitulares:[{nombre:'Otra persona',dni:'30123456',telefono:'111111',telefono_en_doc:true}],vendedor_cotitulares:[{nombre:'Otra titular',dni:'30123457',email:'otra@example.test',email_en_doc:true}],comprador_telefono_en_doc:true,vendedor_email_en_doc:true,inmueble_en_barrio_complejo:true,inmueble_barrio:'Complejo de prueba',inmueble_unidad_funcional:'UF 8',escribania:'Escribanía ya asignada',inmueble_tipo:'otro',inmueble_tipo_otro:'Depósito',clausulas_custom_titulo:'Acuerdo especial',comision_vendedor_modo:'fijo',comision_vendedor_valor:'1234',comision_vendedor_moneda:'USD'};
 const previo=JSON.stringify(compra);
 for(const [nombre,tipo] of [['convertirABoleto','boleto'],['convertirAComodato','comodato']]){let nuevo;const fn=new Function('EMPTY_OP','yaConvertido','valorComisionPredeterminado','datosCompraCompartidos','crearDocumentoConfirmado','return ('+fns[nombre]+');')(a.EMPTY_OP,()=>false,a.valorComisionPredeterminado,a.datosCompraCompartidos,x=>{nuevo=x;});fn(compra);check(tipo+' conserva cotitulares, contacto, UF y cláusulas según instrumento',()=>{assert.deepEqual(nuevo.comprador_cotitulares,compra.comprador_cotitulares);assert.deepEqual(nuevo.vendedor_cotitulares,compra.vendedor_cotitulares);assert.notEqual(nuevo.comprador_cotitulares,compra.comprador_cotitulares);assert.equal(nuevo.comprador_telefono_en_doc,true);assert.equal(nuevo.vendedor_email_en_doc,true);assert.equal(nuevo.inmueble_unidad_funcional,'UF 8');assert.equal(nuevo.inmueble_barrio,'Complejo de prueba');assert.equal(nuevo.inmueble_en_barrio_complejo,true);assert.equal(nuevo.inmueble_tipo_otro,'Depósito');if(tipo==='boleto')assert.equal(nuevo.clausulas_custom_titulo,'Acuerdo especial');else {assert.equal(nuevo.clausulas_custom_titulo,'');assert.equal(nuevo.clausulas_custom,'');assert.deepEqual(nuevo.clausulas_ids,[]);}assert.equal(JSON.stringify(compra),previo);});if(tipo==='boleto')check('boleto conserva comisión fija y escribanía asignada',()=>{assert.equal(nuevo.escribania,'Escribanía ya asignada');assert.equal(nuevo.comision_vendedor_modo,'fijo');assert.equal(nuevo.comision_vendedor_valor,'1234');assert.equal(nuevo.comision_vendedor_moneda,'USD');});}
 for(const tipo of ['reserva','boleto']){
  state={...a.EMPTY_OP,tipo};await a.act(async()=>render(a.StepInmueble));
  check(tipo+' solo ofrece las tres formas de instrumentación',()=>{
    const selector=document.getElementById('dw-field-compra_instrumento');
    assert.ok(selector,'Debe estar presente el campo de instrumento');
    assert.deepEqual(Array.from(selector.options).map(o=>o.value),['escritura','boleto','cesion_boleto']);
    assert.equal(document.getElementById('dw-field-inmueble_documentacion_actual'),null);
    assert.equal(document.body.textContent.includes('Documentación actual'),false);
    assert.equal(selector.value,'escritura');
  });
 }
 state={...a.EMPTY_OP,tipo:'reserva',inmueble_documentacion_actual:'boleto',inmueble_documentacion_detalle:'Antecedente histórico'};
 await a.act(async()=>render(a.StepInmueble));
 check('operación histórica conserva el dato sin ofrecer el campo anterior',()=>{
   assert.equal(document.getElementById('dw-field-inmueble_documentacion_actual'),null);
   assert.equal(document.body.textContent.includes('Documentación actual'),false);
   assert.equal(state.inmueble_documentacion_actual,'boleto');
 });
 const adicionales=[
  {id:'qa-pintura',titulo:'Entrega con interiores pintados',contenido:'El inmueble se entregará con los interiores pintados.',tipos:['reserva'],activo:true,obligatoria:false},
  {id:'qa-llaves',titulo:'Entrega de llaves organizada',contenido:'Las llaves se entregarán según el acuerdo.',tipos:['reserva'],activo:true,obligatoria:false},
  {id:'qa-revision',titulo:'Revisión de instalaciones',contenido:'Las partes revisarán las instalaciones.',tipos:['reserva'],activo:true,obligatoria:false}
 ];
 const perfilAdicionales={plantillas:{reserva:{clausulas_ids:adicionales.map(x=>x.id),obligatorias_ids:[],frecuentes_ids:[]}}};
 state={...a.EMPTY_OP,tipo:'reserva',clausulas_ids:[]};
 await a.act(async()=>render(a.StepClausulas,{clausulas:adicionales,perfil:perfilAdicionales,esAlquiler:false}));
 const ordenExtras=()=>Array.from(document.querySelectorAll('.dw-op-clause-name')).map(x=>x.textContent.trim());
 const antesExtras=ordenExtras();
 check('cláusulas adicionales parten en el orden del catálogo',()=>assert.deepEqual(antesExtras,adicionales.map(x=>x.titulo)));
 await click(document.querySelector('[aria-label="Incluir Entrega con interiores pintados"]'));
 check('marcar cláusula no la mueve arriba ni reordena las demás',()=>{
   assert.deepEqual(ordenExtras(),antesExtras);
   assert.deepEqual(state.clausulas_ids,['qa-pintura']);
   assert.equal(document.querySelector('[aria-label="Quitar Entrega con interiores pintados"]').getAttribute('aria-checked'),'true');
 });
 await click(document.querySelector('[aria-label="Quitar Entrega con interiores pintados"]'));
 check('desmarcar cláusula tampoco reordena las tarjetas',()=>{assert.deepEqual(ordenExtras(),antesExtras);assert.deepEqual(state.clausulas_ids,[]);});
 state={...a.EMPTY_OP,tipo:'reserva',compartida:false,compartida_colega_activo:false};
 const colegaQA=[{id:'qa-broker',nombre:'Lucía de prueba',email:'lucia@example.test',rol:'broker'}];
 await a.act(async()=>render(a.CompartidaBlock,{equipo:colegaQA}));
 check('operaciones compartidas usan dos botones idénticos, sin checkbox suelto',()=>{
   assert.equal(document.querySelectorAll('.dw-share-toggle').length,2);
   assert.equal(document.querySelectorAll('.dw-share-options input[type="checkbox"]').length,0);
   assert.ok(Array.from(document.querySelectorAll('.dw-share-toggle')).every(x=>x.getAttribute('aria-expanded')==='false'));
 });
 await click(document.querySelectorAll('.dw-share-toggle')[0]);
 check('botón externo abre únicamente la colaboración con otra inmobiliaria',()=>{
   assert.equal(state.compartida,true);assert.equal(state.compartida_colega_activo,false);
   assert.ok(document.querySelector('#dw-share-external-panel'));
 });
 await click(document.querySelectorAll('.dw-share-toggle')[1]);
 check('botón del colega abre su propio panel sin cambiar colaboración externa',()=>{
   assert.equal(state.compartida,true);assert.equal(state.compartida_colega_activo,true);
   assert.ok(document.querySelector('#dw-share-colleague-panel'));
   assert.ok(document.querySelector('.dw-colleague-info').textContent.includes('corredor asociado'));
 });
 state={...a.EMPTY_OP,tipo:'reserva',reserva_incluye_refuerzo:false};
 await a.act(async()=>render(a.StepEconomicoCompra));
 check('refuerzo usa el mismo botón accesible que las operaciones compartidas',()=>{
   const boton=document.getElementById('dw-field-reserva_incluye_refuerzo');
   assert.ok(boton);assert.equal(boton.tagName,'BUTTON');
   assert.ok(boton.classList.contains('dw-share-toggle'));
   assert.equal(boton.getAttribute('aria-expanded'),'false');
   assert.equal(document.getElementById('dw-refuerzo-reserva-panel'),null);
 });
 await click(document.getElementById('dw-field-reserva_incluye_refuerzo'));
 check('refuerzo abre campos sin salir de Económico',()=>{
   assert.equal(state.reserva_incluye_refuerzo,true);
   assert.equal(document.getElementById('dw-field-reserva_incluye_refuerzo').getAttribute('aria-expanded'),'true');
   assert.ok(document.getElementById('dw-field-reserva_fecha_refuerzo'));
 });
 await click(document.getElementById('dw-field-reserva_incluye_refuerzo'));
 check('refuerzo se cierra sin borrar el resto de la operación',()=>{
   assert.equal(state.reserva_incluye_refuerzo,false);
   assert.equal(document.getElementById('dw-refuerzo-reserva-panel'),null);
 });
 state={...a.EMPTY_OP,tipo:'reserva'};await a.act(async()=>render(a.StepInmueble));
 check('barrio y UF no ocupan campos en una operación nueva sin seleccionar',()=>{assert.equal(document.getElementById('dw-field-inmueble_barrio'),null);assert.equal(document.getElementById('dw-field-inmueble_unidad_funcional'),null);});
 await click(document.querySelector('[aria-label="Barrio cerrado o complejo"]'));
 check('activar barrio despliega nombre y UF/lote',()=>{assert.ok(document.getElementById('dw-field-inmueble_barrio'));assert.ok(document.getElementById('dw-field-inmueble_unidad_funcional'));assert.ok(a.getCamposFaltantesDetalle(state).some(f=>f.campo==='inmueble_barrio'));assert.ok(a.getCamposFaltantes(state).includes('Nombre del barrio o complejo'));});
 await fill(document.getElementById('dw-field-inmueble_barrio'),'Santa Elena');await fill(document.getElementById('dw-field-inmueble_unidad_funcional'),'Lote 12');state={...state,inmueble_direccion:'Calle de prueba 123'};
 const inmuebleOriginal=JSON.stringify(state),paraDoc=a.opParaDocumento(state),segunda=a.opParaDocumento(paraDoc);
 check('dirección del documento incluye barrio y lote una sola vez sin mutar datos',()=>{assert.ok(paraDoc.inmueble_direccion.includes('Santa Elena'));assert.ok(paraDoc.inmueble_direccion.includes('Lote 12'));assert.equal(segunda.inmueble_direccion,paraDoc.inmueble_direccion);assert.equal(JSON.stringify(state),inmuebleOriginal);assert.equal(state.inmueble_direccion,'Calle de prueba 123');});
 check('nombre de barrio constituye contenido real de borrador',()=>assert.equal(a.draftTieneContenido({...a.EMPTY_OP,inmueble_en_barrio_complejo:true,inmueble_barrio:'Santa Elena'}),true));
 for(const tipo of ['reserva','boleto','reserva_alquiler','alquiler'])check(tipo+' imprime barrio y lote',()=>{const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,...state,tipo};const texto=a.docToPlainText(a.buildDocSections(a.opParaDocumento(op),[],tipo,a.getDefaultBodyBlocks(tipo)));assert.ok(texto.includes('Santa Elena'));assert.ok(texto.includes('Lote 12'));});
 for(const tipo of ['reserva','boleto','reserva_alquiler','alquiler']){
   const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,...state,tipo},doc=a.buildDocSections(a.opParaDocumento(op),[],tipo,a.getDefaultBodyBlocks(tipo));
   const pdf=await a.generarPDF(doc,null,{}),word=await a.generarDOCX(doc,{}),cp=require('node:child_process');
   const pdfFile=tmp+'/barrio-'+tipo+'.pdf',wordFile=tmp+'/barrio-'+tipo+'.docx';fs.writeFileSync(pdfFile,Buffer.from(await pdf.blob.arrayBuffer()));fs.writeFileSync(wordFile,Buffer.from(await word.blob.arrayBuffer()));
   const pdfText=cp.execFileSync('pdftotext',[pdfFile,'-'],{encoding:'utf8'}),wordXml=cp.execFileSync('python',['-c','import sys,zipfile; print(zipfile.ZipFile(sys.argv[1]).read("word/document.xml").decode())',wordFile],{encoding:'utf8'});
   check(tipo+' conserva barrio y lote en PDF y Word',()=>{assert.ok(pdfText.replace(/\s+/g,' ').includes('Santa Elena')&&pdfText.replace(/\s+/g,' ').includes('Lote 12'));assert.ok(wordXml.includes('Santa Elena')&&wordXml.includes('Lote 12'));});
 }
 await click(document.querySelector('[aria-label="Barrio cerrado o complejo"]'));check('desactivar barrio conserva los datos sin imprimirlos',()=>{assert.equal(document.getElementById('dw-field-inmueble_barrio'),null);assert.equal(state.inmueble_barrio,'Santa Elena');assert.equal(a.opParaDocumento(state).inmueble_direccion,'Calle de prueba 123');});
 state={...a.EMPTY_OP,tipo:'reserva',inmueble_unidad_funcional:'UF anterior'};delete state.inmueble_en_barrio_complejo;await a.act(async()=>render(a.StepInmueble));check('operación anterior conserva UF accesible',()=>assert.equal(document.getElementById('dw-field-inmueble_unidad_funcional').value,'UF anterior'));
 for(const tipo of ['reserva','boleto']){
  console.log('INICIO prueba escribanía '+tipo);
  state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo,escribania:''};await a.act(async()=>render(a.StepEconomicoCompra));
  console.log('RENDER escribanía '+tipo);check(tipo+' no pide escribanía en creación',()=>assert.equal(!!document.getElementById('dw-field-escribania'),false));
  state={...state,id:'guardada-qa'};console.log('ANTES render guardada '+tipo);await a.act(async()=>render(a.StepEconomicoCompra,{mostrarEscribania:true}));console.log('DESPUÉS render guardada '+tipo);const panel=[...document.querySelectorAll('details')].find(x=>x.querySelector('#dw-field-escribania'));assert.ok(panel);await click(panel.querySelector('summary'));await fill(document.getElementById('dw-field-escribania'),'');check(tipo+' permite reemplazar escribanía sin cerrar el panel',()=>assert.equal(panel.open,true));await fill(document.getElementById('dw-field-escribania'),'Escribanía asignada después');check(tipo+' permite cargar escribanía más adelante',()=>{assert.equal(state.escribania,'Escribanía asignada después');assert.ok(!a.getCamposFaltantesDetalle(state).some(f=>f.campo==='escribania'));});
 }
 state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',comprador_telefono:'1122223333',comprador_email:'contacto@example.test',comprador_telefono_en_doc:false,comprador_email_en_doc:false};await a.act(async()=>render(a.StepPersona,{prefix:'comprador',titulo:'Comprador'}));
 check('contactos no tienen bloque separado de switches',()=>assert.equal(document.querySelector('.dw-doc-toggles'),null));
 await click(document.querySelector('[aria-label="Incluir teléfono en el documento"]'));check('switch de teléfono cambia solo teléfono',()=>{assert.equal(state.comprador_telefono_en_doc,true);assert.equal(state.comprador_email_en_doc,false);});
 await click(document.querySelector('[aria-label="Incluir correo electrónico en el documento"]'));check('switch de email conserva check del teléfono',()=>{assert.equal(state.comprador_email_en_doc,true);assert.equal(state.comprador_telefono_en_doc,true);});
 check('los controles son parte de sus propios campos',()=>{for(const el of document.querySelectorAll('.dw-contact-field')){assert.ok(el.querySelector('input'));assert.ok(el.querySelector('[role="switch"]'));}});
 await click([...document.querySelectorAll('button')].find(x=>x.textContent.includes('Agregar otro comprador')));
 const flags=document.querySelectorAll('[aria-label="Incluir correo electrónico en el documento"]');await click(flags[1]);check('cotitular cambia su switch sin modificar al principal',()=>{assert.equal(state.comprador_email_en_doc,true);assert.equal(state.comprador_cotitulares[0].email_en_doc,false);});
 for(const [modo,campo,valor] of [
  ['horas','reserva_aceptacion_horas','0'],
  ['horas','reserva_aceptacion_horas','abc'],
  ['fecha','reserva_aceptacion_vencimiento','2026-02-30'],
  ['fecha','reserva_aceptacion_vencimiento','mal-fecha']
 ]){
  const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',reserva_aceptacion_modo:modo,[campo]:valor};
  check('aceptación '+modo+' inválida '+valor+' se informa en el campo correcto',()=>{
   const faltantes=a.getCamposFaltantesDetalle(op);
   assert.ok(faltantes.some(f=>f.campo===campo));
   assert.ok(!faltantes.some(f=>f.campo==='reserva_aceptacion_dias'));
  });
 }
 for(const valor of ['0','-2','abc','1.5']){
  const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',reserva_aceptacion_modo:'dias',reserva_aceptacion_dias:valor};
  check('aceptación en días inválida '+valor+' no se omite de los pendientes',()=>{
   const faltantes=a.getCamposFaltantesDetalle(op);
   assert.ok(faltantes.some(f=>f.campo==='reserva_aceptacion_dias'));
  });
 }
 for(const modo of ['horas','fecha']){
  const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',reserva_aceptacion_modo:modo,reserva_aceptacion_dias:'0'};
  check('plazo en días inactivo no bloquea modalidad '+modo,()=>{
   assert.ok(!a.getCamposFaltantesDetalle(op).some(f=>f.campo==='reserva_aceptacion_dias'));
  });
 }
 for(const modo of ['dias','horas']){
  const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',reserva_aceptacion_modo:modo,reserva_aceptacion_vencimiento:'2026-02-30'};
  check('fecha inactiva no bloquea aceptación por '+modo,()=>assert.ok(!a.getCamposFaltantesDetalle(op).some(f=>f.campo==='reserva_aceptacion_vencimiento')));
 }
 check('ceros numéricos no se reemplazan por porcentajes o plazos sugeridos',()=>{const tokens=a.derivedTokensGenerales({...a.EMPTY_OP,tipo:'alquiler',alquiler_interes_punitorio:0,alquiler_penalidad_meses:0,alquiler_seguro_dias:0,alquiler_aviso_meses:0});for(const key of ['alquiler_interes_punitorio','alquiler_penalidad_meses','alquiler_seguro_dias','alquiler_aviso_meses'])assert.equal(Number(tokens[key]),0);});
 const text=a.docToPlainText(a.buildDocSections(a.opParaDocumento(state),[],'reserva',a.getDefaultBodyBlocks('reserva')));check('contactos seleccionados llegan al documento',()=>{assert.ok(text.includes('1122223333'));assert.ok(text.includes('contacto@example.test'));});
 await a.act(async()=>root.unmount());dom.window.close();console.log('APROBADAS '+count+' verificaciones de campos, monedas, conversiones y contactos.');
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
