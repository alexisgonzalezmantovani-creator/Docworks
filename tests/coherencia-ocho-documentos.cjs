// Revisión editorial de los ocho documentos; casos ficticios y sin tocar Supabase.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),esbuild=require('esbuild');
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-ocho-documentos-'));
esbuild.buildSync({stdin:{contents:fs.readFileSync(path.join(dir,'src/App.tsx'),'utf8')+
 '\nexport {EMPTY_OP,SAMPLE_OP_PREVIEW,getDefaultBodyBlocks,buildDocSections,opParaDocumento,aplicarEncabezadoPersonalizado,docToPlainText,getTokensSinReemplazar,resolveVars};',
 resolveDir:path.join(dir,'src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'app.cjs')});
global.document={querySelector:()=>({}),title:''};const a=require(path.join(tmp,'app.cjs'));delete global.document;
const perfil={nombre:'Inmobiliaria de Prueba',matricula:'CMCPSI 0000',plantillas:{}};
const base={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,
 comprador_nombre:'Comprador Ejemplo',comprador_dni:'20300111223',comprador_domicilio:'Calle Comprador 10',
 vendedor_nombre:'Vendedor Ejemplo',vendedor_dni:'20222999111',vendedor_domicilio:'Calle Vendedor 20',
 locador_nombre:'Locador Ejemplo',locador_dni:'20333444555',locador_domicilio:'Calle Locador 30',
 locatario_nombre:'Locatario Ejemplo',locatario_dni:'20444666777',locatario_domicilio:'Calle Locatario 40',
 inmueble_direccion:'Calle Inmueble 123',inmueble_partido:'Pilar',inmueble_provincia:'Buenos Aires',
 inmueble_en_barrio_complejo:true,inmueble_barrio:'Barrio Prueba',inmueble_unidad_funcional:'UF 15',
 inmobiliaria_nombre:'Inmobiliaria de Prueba',inmobiliaria_matricula:'CMCPSI 0000',
 precio:'150000',anticipo:'15000',saldo:'135000',moneda:'USD',fecha_posesion:'2026-12-22',
 reserva_aceptacion_dias:'5',reserva_vigencia_modo:'fecha',reserva_vigencia_fecha:'2027-01-20',
 res_alq_monto_reserva:'85000',res_alq_moneda:'ARS',res_alq_monto_mensual:'700000',res_alq_monto_mensual_moneda:'ARS',
 res_alq_inicio_estimado:'2026-12-01',res_alq_plazo_cantidad:'24',res_alq_plazo_unidad:'meses',
 alquiler_monto_inicial:'700000',alquiler_moneda:'ARS',alquiler_inicio:'2026-12-01',alquiler_fin:'2028-11-30',alquiler_plazo_meses:'24',
 alquiler_garantia_tipo:'propietario',alquiler_garantia_titular:'Garante Ejemplo',alquiler_garantia_dni:'20333222111',alquiler_garantia_inmueble:'Calle Garantía 17',
 comodato_plazo:'12',comodato_uso:'vivienda',comodato_inicio:'2026-12-01',comodato_fin:'2027-12-01',
 exclusividad_tipo:'sin',exclusividad_vigencia:'90',refuerzo_trayectoria:'Reserva de prueba entregada el 15/11/2026',
 devolucion_motivo:'Las partes acordaron la devolución de la reserva.',created_at:'2026-11-16T15:00:00.000Z'};
function render(tipo,extra={}){
 const op={...base,tipo,...extra};
 const doc=a.aplicarEncabezadoPersonalizado(a.buildDocSections(a.opParaDocumento(op),[],tipo,a.getDefaultBodyBlocks(tipo)),op,tipo,perfil);
 return {op,doc,texto:a.docToPlainText(doc)};
}
let n=0;function check(name,fn){fn();n++;console.log('OK',name)}
const tipos=['reserva','boleto','reserva_alquiler','alquiler','comodato','exclusividad','refuerzo_reserva','devolucion_reserva'];
for(const tipo of tipos){
 const {doc,texto}=render(tipo,['refuerzo_reserva','devolucion_reserva'].includes(tipo)?{precio:'5000'}:{});
 check(tipo+': documento final sin chips, instrucciones ni huecos',()=>{
  assert.match(texto,/Calle Inmueble 123/);
  assert.deepEqual(a.getTokensSinReemplazar(doc),[]);
  assert.doesNotMatch(texto,/_{3,}|\{\{|\}\}|Antes de firmar, deberá completarse|Escribí acá|Antes de utilizar esta cláusula/i);
 });
}
check('reserva instrumentada por boleto elimina escritura de cláusula notarial',()=>{
 const {texto}=render('reserva',{compra_instrumento:'boleto'});
 assert.match(texto,/firma del Boleto de Compraventa tendrá carácter constitutivo/);
 assert.doesNotMatch(texto,/El vencimiento de la aceptación de la presente Reserva caducará irrevocablemente/);
});
check('vigencia de reserva con fecha exacta no duplica preposición',()=>{
 const {texto}=render('reserva');
 assert.match(texto,/vigencia hasta el 20\/01\/2027/);
 assert.doesNotMatch(texto,/vigencia de hasta el/);
});
check('boleto obliga a vender, sin declarar transmisión de dominio por su firma',()=>{
 const {texto}=render('boleto');
 assert.match(texto,/se obliga a vender/);
 assert.doesNotMatch(texto,/vende, cede y transfiere/);
});
check('reserva de alquiler imprime pesos de reserva y no anticipo de venta',()=>{
 const {texto}=render('reserva_alquiler',{anticipo:'999',moneda:'USD'});
 assert.match(texto,/ARS 85\.000/);
 assert.doesNotMatch(texto,/USD 999/);
});
check('alquiler incluye roles, canon y fechas consistentes',()=>{
 const {texto}=render('alquiler');
 for(const x of ['Locador Ejemplo','Locatario Ejemplo','ARS 700.000','01/12/2026','30/11/2028'])assert.ok(texto.includes(x),x);
});
check('comodato gratuito con fechas de inicio y vencimiento',()=>{
 const {texto}=render('comodato');
 assert.match(texto,/01\/12\/2026/);assert.match(texto,/01\/12\/2027/);assert.match(texto,/gratuitamente/);
});
check('autorización sin exclusividad coincide con la modalidad',()=>{
 const {texto}=render('exclusividad');
 assert.match(texto,/comercialización sin exclusividad/i);
 assert.match(texto,/MODALIDAD:.*SIN EXCLUSIVIDAD/i);
 assert.match(texto,/Inmobiliaria de Prueba, matrícula CMCPSI 0000/);
});
check('refuerzo refleja importe adicional y antecedentes',()=>{
 const {texto}=render('refuerzo_reserva',{precio:'5000'});
 assert.match(texto,/OBJETO DEL REFUERZO:.*USD 5\.000/s);
 assert.match(texto,/Reserva de prueba entregada el 15\/11\/2026/);
});
check('devolución no presupone quién conservaba el dinero',()=>{
 const {texto}=render('devolucion_reserva',{precio:'5000'});
 assert.match(texto,/declara recibir el importe indicado/);
 assert.doesNotMatch(texto,/El VENDEDOR devuelve en este acto|recibiendo el COMPRADOR plena conformidad/);
});
check('modelos estándar anteriores se normalizan sin modificar datos',()=>{
 const op={...base,tipo:'boleto'};
 const anterior='El VENDEDOR {{vendedor_nombre}} vende, cede y transfiere al COMPRADOR {{comprador_nombre}}, quien compra y acepta, el inmueble ubicado en {{inmueble_direccion}}.';
 assert.match(a.resolveVars(anterior,op),/se obliga a vender/);
 assert.doesNotMatch(a.resolveVars('Antes de firmar, deberá completarse cualquier condición particular de devolución, retención o penalidad acordada.',{...base,tipo:'reserva_alquiler'}),/Antes de firmar/);
 assert.doesNotMatch(a.resolveVars('El VENDEDOR devuelve en este acto al COMPRADOR / OFERENTE la suma de {{precio_letras}}, recibiendo el COMPRADOR plena conformidad respecto de la devolución.-',{...base,tipo:'devolucion_reserva'}),/El VENDEDOR devuelve/);
});
console.log('APROBADAS '+n+' verificaciones de coherencia de ocho documentos.');
