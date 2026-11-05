const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-auditoria-'));
const dom=new JSDOM('<html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};
const source=fs.readFileSync(dir+'/src/App.tsx','utf8');
require('esbuild').buildSync({stdin:{contents:source+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,OperacionForm,StepPersona,StepInmueble,StepEconomicoCompra,StepCondicionesAlquiler,StepCondicionesReservaAlq,StepDocSimple,StepGarantia,StepClausulas,EMPTY_OP,SAMPLE_OP_PREVIEW,ComisionEditor,plazoComodatoDesdeFechas,parseISOLocal,getCamposFaltantesDetalle,getInconsistenciasCamposOperacion,getComisionConfig,comisionAutorizanteInformada,validarDocumentoParaExport,buildDocSections};',resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
require('esbuild').buildSync({entryPoints:[dir+'/src/Operaciones.tsx'],bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/operaciones.cjs'});
const a=require(tmp+'/app.cjs'),root=a.createRoot(document.getElementById('test'));let state,checks=0,botones=0;
function render(Component,extra={}){root.render(a.createElement(Component,{data:state,onChange:(k,v)=>{state={...state,[k]:v};render(Component,extra)},equipo:[],faltantes:[],clausulas:[],perfil:{plantillas:{}},...extra}));}
async function change(el,v){await a.act(async()=>{const proto=el.tagName==='SELECT'?window.HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));});}
(async()=>{
 for(const tipo of ['reserva','boleto','reserva_alquiler','alquiler','comodato','exclusividad','refuerzo_reserva','devolucion_reserva']){
  const components=['comodato','exclusividad','refuerzo_reserva','devolucion_reserva'].includes(tipo)?[a.StepDocSimple]:[a.StepInmueble,tipo==='alquiler'?a.StepCondicionesAlquiler:tipo==='reserva_alquiler'?a.StepCondicionesReservaAlq:a.StepEconomicoCompra];
  for(const Component of components){state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo};await a.act(async()=>render(Component));for(const button of document.querySelectorAll('button')){const props=button[Object.keys(button).find(x=>x.startsWith('__reactProps$'))];assert.ok(button.disabled||typeof props.onClick==='function'||button.type==='submit'&&button.closest('form'),'Botón sin acción: '+button.textContent);botones++;}
for(const select of document.querySelectorAll('select')){const props=select[Object.keys(select).find(x=>x.startsWith('__reactProps$'))];if(props.value!==undefined){assert.ok([...select.options].some(x=>x.value===String(props.value)),tipo+' '+Component.name+' selección sin opción: '+select.id+' = '+props.value);checks++;}}}
 }
 state={...a.EMPTY_OP,tipo:'reserva',comision_vendedor:undefined,precio:'100000'};delete state.comision_vendedor_valor;await a.act(async()=>render(a.ComisionEditor,{prefix:'comision_vendedor',label:'Vendedor',base:100000,monedaBase:'USD',defaultPct:'3'}));
 await change(document.querySelector('select'),'fijo');assert.equal(state.comision_vendedor_valor,'3000','cambiar el 3% mostrado a monto fijo debe conservar USD 3000');checks++;
 await change(document.querySelector('input[aria-label="Valor de comisión: Vendedor"]'),'5000');await change(document.querySelector('select'),'porcentaje');assert.equal(state.comision_vendedor_valor,'5','cambiar USD 5000 a porcentaje debe conservar el honorario');checks++;
 state={tipo:'reserva',comision_vendedor_modo:'porcentaje',comision_vendedor_valor:'0'};await a.act(async()=>render(a.ComisionEditor,{prefix:'comision_vendedor',label:'Vendedor',base:100000,monedaBase:'USD',defaultPct:'3'}));await change(document.querySelector('select'),'fijo');assert.equal(state.comision_vendedor_valor,'0');await change(document.querySelector('select'),'porcentaje');assert.equal(state.comision_vendedor_valor,'0');checks++;
 state={tipo:'reserva',comision_vendedor_modo:'fijo',comision_vendedor_valor:'5000',comision_vendedor_moneda:'ARS'};await a.act(async()=>render(a.ComisionEditor,{prefix:'comision_vendedor',label:'Vendedor',base:100000,monedaBase:'USD',defaultPct:'3'}));await change(document.querySelector('select'),'porcentaje');assert.equal(state.comision_vendedor_valor,'','no inferir conversión entre ARS y USD');checks++;
 for(const [patch,campo] of [
  [{tipo:'reserva',precio:'100000',anticipo:'120000'},'anticipo'],
  [{tipo:'boleto',precio:'100000',anticipo:'-1'},'anticipo'],
  [{tipo:'alquiler',alquiler_inicio:'2026-02-30'},'alquiler_inicio'],
  [{tipo:'alquiler',alquiler_plazo_dias:'-10'},'alquiler_plazo_dias'],
  [{tipo:'alquiler',alquiler_plazo_meses:'1.5'},'alquiler_plazo_meses'],
  [{tipo:'reserva_alquiler',res_alq_plazo_cantidad:'-24'},'res_alq_plazo_cantidad'],
  [{tipo:'reserva',reserva_vigencia_dias:'0'},'reserva_vigencia_dias'],
  [{tipo:'reserva',comprador_email:'correo incompleto'},'comprador_email'],
  [{tipo:'alquiler',locatario_cotitulares:[{nombre:'Otra persona',dni:''}]},'locatario_cotitular_0_dni'],
  [{tipo:'boleto',vendedor_cotitulares:[{nombre:'',dni:'30123456'}]},'vendedor_cotitular_0_nombre'],
  [{tipo:'reserva',comision_vendedor_valor:'',comision_vendedor_valor_editado:true},'comision_vendedor'],
  [{tipo:'reserva',comision_vendedor_valor:'-2'},'comision_vendedor'],
  [{tipo:'comodato',comodato_inicio:'2026-05-10',comodato_fin:'2026-05-01'},'comodato_plazo']
 ]){const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,...patch};assert.ok(a.getInconsistenciasCamposOperacion(op).some(f=>f.campo===campo),'debe detectar '+campo);assert.ok(a.getCamposFaltantesDetalle(op).some(f=>f.campo===campo),'debe permitir ir al campo '+campo);checks+=2;}
 for(const fecha of ['2026-02-30','2025-02-29','2026-13-01','2026-01-32','2026-01-01 basura']){assert.equal(a.parseISOLocal(fecha),null,fecha+' no puede normalizarse silenciosamente');checks++;}
 assert.ok(a.parseISOLocal('2028-02-29'));checks++;
 for(const v of ['0','0.5','3']){assert.ok(!a.getInconsistenciasCamposOperacion({...a.EMPTY_OP,tipo:'reserva',comision_vendedor_valor:v}).some(f=>f.campo==='comision_vendedor'));checks++;}
 assert.equal(a.comisionAutorizanteInformada({comision_vendedor_valor:'-1',comision_vendedor:'3'}),false);checks++;
 assert.equal(a.getComisionConfig({comision_vendedor_valor:'',comision_vendedor:'3',comision_vendedor_valor_editado:true},'comision_vendedor',100000,'USD','comision_vendedor','3').valor,'');checks++;
 assert.equal(a.getComisionConfig({comision_vendedor:'3'},'comision_vendedor',100000,'USD','comision_vendedor','3').valor,'3');checks++;
 assert.equal(a.getComisionConfig({comision_vendedor_valor:'',comision_vendedor:'3'},'comision_vendedor',100000,'USD','comision_vendedor','3').monto,3000,'preservar cálculo de operaciones históricas');checks++;
 state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_dia_pago:'20'};await a.act(async()=>render(a.StepCondicionesAlquiler));assert.equal(document.getElementById('dw-field-alquiler_dia_pago').value,'20');checks++;
 state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva_alquiler',res_alq_vigencia_dias:'45'};await a.act(async()=>render(a.StepCondicionesReservaAlq));assert.equal(document.getElementById('dw-field-res_alq_vigencia_dias').value,'45');checks++;
 for(const tipo of ['reserva','boleto','reserva_alquiler','alquiler','comodato','exclusividad','refuerzo_reserva','devolucion_reserva']){
  const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo,id:'prueba-'+tipo};let enviados=[],cancelados=0;
  await a.act(async()=>root.render(a.createElement(a.OperacionForm,{key:tipo,initial:op,clausulas:[],perfil:{nombre:'Prueba',matricula:'1234',rol:'dueno',plantillas:{}},equipo:[],operaciones:[],onSave:async(...args)=>{enviados.push(args);return {data:args[0]}},onCancel:()=>cancelados++,onTipoChange:()=>{},reportSave:()=>{}})));
  for(const btn of [...document.querySelectorAll('.step-dot')]){await a.act(async()=>btn.click());assert.ok(document.querySelectorAll('input,select,textarea').length||document.body.textContent.includes('Cláusulas'));checks++;}
  const guardar=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Guardar cambios'));assert.ok(guardar,'Guardar en '+tipo);await a.act(async()=>guardar.click());assert.equal(enviados.length,1);assert.equal(enviados[0][0].tipo,tipo);assert.equal(enviados[0][0].id,op.id);checks++;
 }
 for(const tipo of ['refuerzo_reserva','devolucion_reserva']){
  const original={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',id:'padre',estado:'activo',created_at:'2026-11-01T12:00:00Z',comprador_nombre:'Comprador de auditoría',comprador_telefono:'111234',comprador_telefono_en_doc:true,comprador_cotitulares:[{nombre:'Cotitular de prueba',dni:'30123456'}],vendedor_email:'titular@example.test',vendedor_email_en_doc:true};const snapshotRef={current:null};
  await a.act(async()=>root.render(a.createElement(a.OperacionForm,{key:'atajo-'+tipo,snapshotRef,initial:{...a.EMPTY_OP,tipo,id:'hijo'},clausulas:[],perfil:{rol:'dueno',plantillas:{}},equipo:[],operaciones:[original],onSave:async()=>({}),onCancel:()=>{},onTipoChange:()=>{},reportSave:()=>{}})));
  await a.act(async()=>document.querySelector('.step-dot').click());const atajo=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Comprador de auditoría'));assert.ok(atajo);await a.act(async()=>atajo.click());const d=snapshotRef.current.data;assert.equal(d.parent_id,'padre');assert.equal(d.comprador_telefono_en_doc,true);assert.equal(d.vendedor_email,'titular@example.test');assert.deepEqual(d.comprador_cotitulares,original.comprador_cotitulares);checks++;
 }
 state={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',reserva_aceptacion_modo:'dias',reserva_aceptacion_dias:'10'};await a.act(async()=>render(a.StepEconomicoCompra));const acceptance=document.querySelector('.dw-economic-acceptance');assert.ok(acceptance.open);await change(document.getElementById('dw-field-reserva_aceptacion_dias'),'5');assert.ok(acceptance.open,'reemplazar el plazo no cierra el desplegable ni corta la edición');checks++;
 const comodato={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'comodato',comodato_inicio:'2026-05-01',comodato_fin:'2027-05-01'};comodato.comodato_plazo=a.plazoComodatoDesdeFechas(comodato.comodato_inicio,comodato.comodato_fin);
 assert.ok(!a.getCamposFaltantesDetalle(comodato).some(f=>f.campo==='comodato_plazo'),'el plazo narrado por el editor de comodato debe ser válido');checks++;
 for(const patch of [{inmueble_tipo:'otro',inmueble_tipo_otro:''},{tipo:'alquiler',alquiler_actualizacion:'otro',alquiler_actualizacion_otro:''},{tipo:'alquiler',alquiler_periodo_actualizacion:'otro',alquiler_periodo_otro:''}]){assert.ok(a.getCamposFaltantesDetalle({...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,...patch}).some(f=>f.campo.endsWith('_otro')));checks++;}
 const garante=a.getCamposFaltantesDetalle({...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_garantia_tipo:'propietario',alquiler_garantia_titular:'',alquiler_garantia_dni:'',alquiler_garantia_inmueble:''}).filter(f=>f.campo.startsWith('alquiler_garantia_'));assert.equal(garante.length,3);assert.ok(garante.every(f=>f.paso===6));checks++;
 const {enfocarCampoOperacion}=require(tmp+'/operaciones.cjs');
 await a.act(async()=>root.unmount());document.getElementById('test').innerHTML='<details><summary>Opciones</summary><input id="dw-field-ejemplo"></details>';
 assert.equal(enfocarCampoOperacion('ejemplo'),true);assert.ok(document.querySelector('details').open);assert.equal(document.activeElement.id,'dw-field-ejemplo');checks++;
 console.log('APROBADAS '+checks+' comprobaciones de consistencia de formularios; '+botones+' botones de pasos con acción asignada.');
 dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1});
