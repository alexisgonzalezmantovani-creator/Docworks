const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-riesgos-'));
esbuild.buildSync({stdin:{contents:fs.readFileSync(path.join(root,'src/App.tsx'),'utf8')+
 '\nexport {revisarRiesgosContractuales,validarDocumentoParaExport,getDefaultBodyBlocks,EMPTY_OP,SAMPLE_OP_PREVIEW,buildDocSections,opParaDocumento};',
 resolveDir:path.join(root,'src'),loader:'tsx'},bundle:true,platform:'node',format:'cjs',jsx:'automatic',outfile:path.join(tmp,'app.cjs')});
global.document={querySelector:()=>({}),title:''};const a=require(path.join(tmp,'app.cjs'));delete global.document;
let checks=0;function check(label,fn){fn();checks++;console.log('OK',label);}
function doc(text){return {encabezado:'',secciones:[{titulo:'DOCUMENTO',items:[text]}],clausulas:[]};}
const base={...a.EMPTY_OP,created_at:'2026-11-17T12:00:00.000Z'};
check('vencimiento de reserva anterior al documento: error verificable',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'reserva',reserva_vigencia_modo:'fecha',reserva_vigencia_fecha:'2026-11-16'},doc('Texto.'));
 assert.match(v.errores.join(' '),/fecha de vigencia/i);
});
check('fecha de vigencia futura: sin falso positivo',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'reserva',reserva_vigencia_modo:'fecha',reserva_vigencia_fecha:'2026-12-15'},doc('Texto.'));
 assert.equal(v.errores.length,0);
});
check('aceptación con fecha anterior: alerta comprobable',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'reserva',reserva_aceptacion_modo:'fecha',reserva_aceptacion_vencimiento:'2026-11-10'},doc('Texto.'));
 assert.match(v.errores.join(' '),/aceptación/i);
});
check('la vigencia de la reserva no puede vencer antes del plazo para aceptarla',()=>{
 const baseFechas={...base,tipo:'reserva',reserva_aceptacion_modo:'fecha',
  reserva_aceptacion_vencimiento:'2026-12-01',reserva_vigencia_modo:'fecha'};
 const errores=fecha=>a.revisarRiesgosContractuales({...baseFechas,reserva_vigencia_fecha:fecha},doc('Texto.')).errores;
 assert.match(errores('2026-11-28').join(' '),/aceptación.*posterior.*vigencia/i);
 assert.deepEqual(errores('2026-12-01'),[]);
 assert.deepEqual(errores('2026-12-03'),[]);
 assert.deepEqual(a.revisarRiesgosContractuales({...baseFechas,reserva_vigencia_modo:'dias',
  reserva_vigencia_fecha:'2026-11-28'},doc('Texto.')).errores,[]);
});
check('seña informativa no interrumpe exportación, renuncia amplia sí se advierte',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'reserva'},
 doc('Con efectos del art. 1059: el oferente perderá la reserva. Renunciando a invocar imprevisión o fuerza mayor.'));
 assert.ok(!v.avisos.some(x=>/arrepentimiento|seña|art. 1059/i.test(x)));
 assert.ok(v.avisos.some(x=>/renuncia amplia/i.test(x)));
});
check('reserva de alquiler advierte guarda y devolución faltante',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'reserva_alquiler'},doc('El LOCATARIO entrega en este acto la reserva.'));
 assert.ok(v.avisos.some(x=>/recepción efectiva/i.test(x)));
 assert.ok(v.avisos.some(x=>/rechaza/i.test(x)));
});
check('modelo nuevo de reserva de alquiler incorpora constancia de no aceptación',()=>{
 const b=a.getDefaultBodyBlocks('reserva_alquiler');
 assert.ok(b.some(x=>x.id==='reserva_alquiler.no_aceptacion'&&/guarda/.test(x.contenido)));
});
check('refuerzo ya no presume prórroga de plazos vencidos',()=>{
 const b=a.getDefaultBodyBlocks('refuerzo_reserva'),c=b.find(x=>x.id==='refuerzo.condiciones');
 assert.ok(c);
 assert.match(c.contenido,/no prorroga por sí sola plazos vencidos/);
 assert.doesNotMatch(c.contenido,/manteniendo plena vigencia todas sus condiciones, plazos/);
});
check('refuerzo anterior sí genera aviso si afirma plazos vigentes',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'refuerzo_reserva'},doc('En este acto el comprador entrega 100. Manteniendo plena vigencia todas sus condiciones, plazos y cláusulas.'));
 assert.ok(v.avisos.some(x=>/recepción efectiva/i.test(x)));
 assert.ok(v.avisos.some(x=>/vencimientos/i.test(x)));
});
check('devolución exige comprobar recepción efectiva de los fondos',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'devolucion_reserva'},doc('Se deja constancia de la entrega al COMPRADOR. El COMPRADOR declara recibir el importe.'));
 assert.ok(v.avisos.some(x=>/recepción efectiva/i.test(x)));
});
check('comodato nuevo no certifica entrega material anticipada',()=>{
 const b=a.getDefaultBodyBlocks('comodato').find(x=>x.id==='comodato.objeto');
 assert.ok(b);assert.match(b.contenido,/entrega material/);
 assert.doesNotMatch(b.contenido,/quien lo recibe de plena conformidad/);
});
check('alquiler revisa preaviso, intereses y comisiones importadas',()=>{
 const op={...base,tipo:'alquiler',alquiler_comisiones_importadas:true,alquiler_comision_locador_modo:'porcentaje',alquiler_comision_locatario_modo:'fijo'};
 const v=a.revisarRiesgosContractuales(op,doc('El LOCATARIO podrá rescindir anticipadamente debiendo notificar con 1 mes de antelación. Interés punitorio del 5% mensual.'));
 assert.ok(v.avisos.some(x=>/preaviso mínimo/i.test(x)));
 assert.ok(v.avisos.some(x=>/proporcionalidad/i.test(x)));
 assert.ok(v.avisos.some(x=>/honorarios importados/i.test(x)));
});
check('honorarios de reserva convertidos a importes fijos no generan falso aviso',()=>{
 const op={...base,tipo:'alquiler',alquiler_comisiones_importadas:true,alquiler_comision_locador_modo:'fijo',alquiler_comision_locatario_modo:'fijo'};
 assert.ok(!a.revisarRiesgosContractuales(op,doc('Texto sin honorarios.')).avisos.some(x=>/honorarios importados/i.test(x)));
});
check('autorización sin exclusividad advierte momento del honorario',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'exclusividad',exclusividad_tipo:'sin'},doc('Autorización de venta.'));
 assert.ok(v.avisos.some(x=>/se devengan/i.test(x)));
});
check('boleto con entrega inicial prevista no se trata como recibo',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'boleto'},doc('Se prevé una entrega inicial de 100.'));
 assert.ok(v.avisos.some(x=>/ya se recibió/i.test(x)));
});
check('integración: el validador final incorpora las advertencias y fechas',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',created_at:'2026-11-17T12:00:00.000Z',reserva_vigencia_modo:'fecha',reserva_vigencia_fecha:'2026-11-16'};
 const documento=a.buildDocSections(a.opParaDocumento(op),[],'reserva',a.getDefaultBodyBlocks('reserva'));
 const r=a.validarDocumentoParaExport(op,documento,{nombre:'Inmobiliaria QA'});
 assert.ok(r.errores.some(x=>/fecha de vigencia/i.test(x)));
 assert.ok(!r.avisos.some(x=>/arrepentimiento|seña|art. 1059/i.test(x)));
});
check('reserva nueva conserva moneda esencial sin renuncias generales',()=>{
 const bloque=a.getDefaultBodyBlocks('reserva').find(x=>x.id==='reserva.moneda_condicion_esencial');
 assert.ok(bloque);
 assert.match(bloque.contenido,/moneda pactada/i);
 assert.doesNotMatch(bloque.contenido,/renunciando a invocar imprevisión/);
});
check('modelo de alquiler aplica 1221 sin preaviso obligatorio y cálculo 10%',()=>{
 const b=a.getDefaultBodyBlocks('alquiler').find(x=>x.id==='alquiler.rescision');
 assert.ok(b);assert.match(b.contenido,/artículo 1221/);
 assert.match(b.contenido,/diez por ciento \(10%\) del saldo del canon locativo futuro/);
 assert.doesNotMatch(b.contenido,/\{\{alquiler_aviso_plazo\}\}/);
});
check('estado locativo no presume entrega previa a la firma',()=>{
 const b=a.getDefaultBodyBlocks('alquiler').find(x=>x.id==='alquiler.estado');
 assert.ok(b);assert.match(b.contenido,/entrega material/);
 assert.doesNotMatch(b.contenido,/El LOCATARIO recibe el inmueble/);
});
check('depósito pactado no se afirma ya percibido por el locador',()=>{
 const b=a.getDefaultBodyBlocks('alquiler').find(x=>x.id==='alquiler.deposito');
 assert.ok(b);assert.match(b.contenido,/Su entrega efectiva se acreditará/);
 assert.doesNotMatch(b.contenido,/El LOCATARIO entrega en depósito/);
});
check('documentos históricos con recibos anticipados conservan alerta',()=>{
 const v=a.revisarRiesgosContractuales({...base,tipo:'alquiler'},doc('El LOCATARIO entrega en depósito ARS 1.000 y declara recibir el inmueble en perfecto estado de conservación.'));
 assert.ok(v.avisos.some(x=>/depósito de garantía/i.test(x)));
 assert.ok(v.avisos.some(x=>/estado de entrega/i.test(x)));
});
check('modelo de alquiler nuevo no produce falsos avisos de depósito o entrega',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const v=a.revisarRiesgosContractuales(op,d);
 assert.ok(!v.avisos.some(x=>/depósito de garantía: verificá/i.test(x)));
 assert.ok(!v.avisos.some(x=>/certifica el estado de entrega/i.test(x)));
 assert.ok(!v.avisos.some(x=>/preaviso mínimo/i.test(x)));
});
check('rescision legal predeterminada conserva texto del modelo',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_rescision_modo:'legal',alquiler_rescision_texto:'TEXTO NO DEBE IMPRIMIRSE'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const x=d.secciones.find(z=>z._bloqueId==='alquiler.rescision'||/RESOLUCI[ÓO]N ANTICIPADA/.test(z.titulo));
 assert.ok(x);assert.match(x.items.join(' '),/artículo 1221/);
 assert.ok(!x.items.join(' ').includes('TEXTO NO DEBE IMPRIMIRSE'));
});
check('rescision personalizada reemplaza solo esa clausula',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_rescision_modo:'personalizada',alquiler_rescision_texto:'Las partes acuerdan una notificación por escrito de veinte días, sujeta a la normativa vigente.'};
 const b=a.getDefaultBodyBlocks('alquiler'),before=a.buildDocSections(a.opParaDocumento({...op,alquiler_rescision_modo:'legal'}),[],'alquiler',b);
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',b);
 const key=x=>x._bloqueId==='alquiler.rescision'||/RESOLUCI[ÓO]N ANTICIPADA/.test(x.titulo);
 const original=before.secciones.find(key),chosen=d.secciones.find(key);
 assert.ok(chosen);assert.equal(chosen.items.join(' '),op.alquiler_rescision_texto);
 assert.match(original.items.join(' '),/artículo 1221/);
 assert.deepEqual(d.secciones.filter(x=>!key(x)),before.secciones.filter(x=>!key(x)));
 assert.match(b.find(x=>x.id==='alquiler.rescision').contenido,/artículo 1221/);
});
check('rescision personalizada vacia avisa y exige completar',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_rescision_modo:'personalizada',alquiler_rescision_texto:''};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const res=a.validarDocumentoParaExport(op,d,{nombre:'Inmobiliaria QA'});
 assert.ok(res.errores.some(x=>/rescis/i.test(x)));
});
check('rescision personalizada no impresa bloquea exportacion de contrato propio',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_rescision_modo:'personalizada',alquiler_rescision_texto:'Redacción acordada de rescisión'};
 const d={documentoPropio:true,encabezado:'Un contrato propio que no contiene la clausula elegida',secciones:[],clausulas:[]};
 const res=a.validarDocumentoParaExport(op,d,{nombre:'Inmobiliaria QA'});
 assert.ok(res.errores.some(x=>/no figura en el documento generado/i.test(x)));
});
check('no altera contratos historicos sin modalidad configurada',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler'};
 delete op.alquiler_rescision_modo;
 op.alquiler_rescision_texto='Texto que no debe reemplazar nada';
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const x=d.secciones.find(z=>z._bloqueId==='alquiler.rescision'||/RESOLUCI[ÓO]N ANTICIPADA/.test(z.titulo));
 assert.match(x.items.join(' '),/artículo 1221/);
});
check('garantía propietaria estándar identifica consentimiento expreso y artículo 1225',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_garantia_tipo:'propietario',alquiler_garantia_titular:'Garante Prueba',alquiler_garantia_dni:'12345678',alquiler_garantia_inmueble:'Casa Ejemplo'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const g=d.secciones.find(x=>x._bloqueId==='alquiler.garantia');
 assert.ok(g);const t=g.items.join(' ');
 assert.match(t,/Garante Prueba/);assert.match(t,/nuevo consentimiento expreso/);assert.match(t,/1225/);
});
check('seguro de caucion no se declara contratado antes de ver póliza',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_garantia_tipo:'seguro_caucion'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const g=d.secciones.find(x=>x._bloqueId==='alquiler.garantia');
 assert.ok(g);assert.match(g.items.join(' '),/no se presume/);assert.match(g.items.join(' '),/póliza/);
});
check('texto personalizado de garantía no se altera automáticamente',()=>{
 const texto='Garantía personalizada de la inmobiliaria. El fiador firma el acuerdo individual.';
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_garantia_tipo:'propietario',alquiler_garantia_texto_personalizado:texto};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const g=d.secciones.find(x=>x._bloqueId==='alquiler.garantia');assert.ok(g);
 assert.equal(g.items.join(' '),texto);
});
check('mora contractual no elimina intimación previa al desalojo de vivienda',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const m=d.secciones.find(x=>x._bloqueId==='alquiler.mora');assert.ok(m);
 assert.match(m.items.join(' '),/1222/);
 assert.match(m.items.join(' '),/5% mensual/);
 assert.match(m.items.join(' '),/2 veces el canon/);
});
check('reserva de alquiler bonaerense advierte base de honorarios sobre canon mensual',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva_alquiler',inmueble_provincia:'Buenos Aires'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'reserva_alquiler',a.getDefaultBodyBlocks('reserva_alquiler'));
 const v=a.revisarRiesgosContractuales(op,d);
 assert.ok(v.avisos.some(x=>/Honorarios de reserva de alquiler en Provincia de Buenos Aires/i.test(x)));
});
check('honorarios fuera de Buenos Aires no infieren norma provincial',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva_alquiler',inmueble_provincia:'Córdoba'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'reserva_alquiler',a.getDefaultBodyBlocks('reserva_alquiler'));
 const v=a.revisarRiesgosContractuales(op,d);
 assert.ok(!v.avisos.some(x=>/Honorarios de reserva de alquiler en Provincia de Buenos Aires/i.test(x)));
});
check('mora estándar usa porcentajes editables y no importa texto avanzado',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_interes_punitorio:'3',alquiler_penalidad_meses:'1',alquiler_mora_modo:'estandar',alquiler_mora_texto:'TEXTO EXCLUSIVO PERSONALIZADO'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const m=d.secciones.find(x=>x._bloqueId==='alquiler.mora'||/MORA Y PENALIDADES/i.test(x.titulo));assert.ok(m);
 assert.match(m.items.join(' '),/3% mensual/);
 assert.match(m.items.join(' '),/1 vez el canon/);
 assert.ok(!m.items.join(' ').includes('TEXTO EXCLUSIVO PERSONALIZADO'));
});
check('cláusula penal plural conserva veces para dos o más cánones',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_penalidad_meses:'2'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const m=d.secciones.find(x=>x._bloqueId==='alquiler.mora');
 assert.match(m.items.join(' '),/2 veces el canon/);
});
check('modo avanzado reemplaza solamente mora, sin afectar rescisión ni honorarios',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_mora_modo:'personalizada',alquiler_mora_texto:'Las partes pactan penalidad especial de prueba, sujeta a la normativa aplicable.'};
 const baseBlocks=a.getDefaultBodyBlocks('alquiler');
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',baseBlocks);
 const normal=a.buildDocSections(a.opParaDocumento({...op,alquiler_mora_modo:'estandar'}),[],'alquiler',baseBlocks);
 const isMora=x=>x._bloqueId==='alquiler.mora'||/MORA Y PENALIDADES/i.test(x.titulo);
 assert.equal(d.secciones.find(isMora).items.join(' '),op.alquiler_mora_texto);
 assert.deepEqual(d.secciones.filter(x=>!isMora(x)),normal.secciones.filter(x=>!isMora(x)));
 assert.match(baseBlocks.find(x=>x.id==='alquiler.mora').contenido,/alquiler_interes_punitorio/);
});
check('texto de mora avanzada vacío se detecta antes de exportar',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_mora_modo:'personalizada',alquiler_mora_texto:''};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const v=a.validarDocumentoParaExport(op,d,{nombre:'Inmobiliaria QA'});
 assert.ok(v.errores.some(x=>/mora y penalidades personalizada/i.test(x)));
});
check('cláusula avanzada no impresa bloquea exportación con modelo propio',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_mora_modo:'personalizada',alquiler_mora_texto:'Texto avanzado acordado'};
 const d={documentoPropio:true,encabezado:'Contrato propio que no incorpora mora',secciones:[],clausulas:[]};
 const v=a.validarDocumentoParaExport(op,d,{nombre:'QA'});
 assert.ok(v.errores.some(x=>/cláusula de mora personalizada no figura/i.test(x)));
});
check('contratos históricos sin selector de mora mantienen cláusula estándar',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'alquiler',alquiler_mora_texto:'Texto que no debería imprimirse'};
 delete op.alquiler_mora_modo;
 const d=a.buildDocSections(a.opParaDocumento(op),[],'alquiler',a.getDefaultBodyBlocks('alquiler'));
 const m=d.secciones.find(x=>x._bloqueId==='alquiler.mora'||/MORA Y PENALIDADES/i.test(x.titulo));
 assert.match(m.items.join(' '),/artículo 1222/);
 assert.ok(!m.items.join(' ').includes('Texto que no debería imprimirse'));
});
check('reserva de compra no hereda las tres advertencias de reserva de alquiler',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',inmueble_provincia:'Buenos Aires'};
 const d={tipoDocumento:'reserva',encabezado:'Reserva de compraventa',secciones:[{titulo:'HONORARIOS',items:['3% del canon mensual. Entrega en este acto.']}],clausulas:[]};
 const v=a.validarDocumentoParaExport(op,d,{nombre:'QA'});
 assert.ok(!v.avisos.some(x=>/Honorarios de reserva de alquiler|recepci[oó]n efectiva de la reserva de alquiler|fondos si el locador rechaza/i.test(x)));
});
check('reserva de alquiler conserva sus propias advertencias',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva_alquiler',inmueble_provincia:'Buenos Aires'};
 const d={tipoDocumento:'reserva_alquiler',encabezado:'Reserva de locación',secciones:[{titulo:'HONORARIOS',items:['3% del canon mensual. Entrega en este acto.']}],clausulas:[]};
 const v=a.validarDocumentoParaExport(op,d,{nombre:'QA'});
 assert.ok(v.avisos.some(x=>/Honorarios de reserva de alquiler/i.test(x)));
 assert.ok(v.avisos.some(x=>/recepci[oó]n efectiva de la reserva de alquiler/i.test(x)));
 assert.ok(v.avisos.some(x=>/fondos si el locador rechaza/i.test(x)));
});
check('tipo documental cruzado entre compra y alquiler impide exportar',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva'};
 const d={tipoDocumento:'reserva_alquiler',encabezado:'Reserva de alquiler',secciones:[],clausulas:[]};
 const v=a.validarDocumentoParaExport(op,d,{nombre:'QA'});
 assert.ok(v.errores.some(x=>/tipo del documento no coincide/i.test(x)));
});
check('texto estándar de seña no produce aviso modal de exportación',()=>{
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva'};
 const d=a.buildDocSections(a.opParaDocumento(op),[],'reserva',a.getDefaultBodyBlocks('reserva'));
 const v=a.validarDocumentoParaExport(op,d,{nombre:'QA'});
 assert.ok(!v.avisos.some(x=>/seña|arrepentimiento|art. 1059/i.test(x)));
});
console.log('APROBADAS '+checks+' comprobaciones preventivas de riesgo contractual.');

