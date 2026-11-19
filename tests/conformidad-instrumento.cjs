const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-conformidad-chip-'));
esbuild.buildSync({stdin:{contents:fs.readFileSync(root+'/src/App.tsx','utf8')+'\nexport {crearSnapshotPlantillaOperacion,construirDocumentoConformidadReserva,modoConformidadReserva,buildDocSections,opParaDocumento,docToPlainText,canonizarMarcadoresAjuste,derivedTokensGenerales,resolveVars,EMPTY_OP,SAMPLE_OP_PREVIEW,generarPDF,generarDOCX};',resolveDir:root+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
global.document={querySelector:()=>({}),title:''};const a=require(tmp+'/app.cjs');delete global.document;
(async()=>{
 let count=0;const check=(name,fn)=>{fn();console.log('OK',name);count++;};
 const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',comprador_nombre:'Ofertante QA',vendedor_nombre:'Propietario QA',inmueble_direccion:'Calle 123',inmueble_partido:'Pilar',inmueble_provincia:'Buenos Aires'};
 for(const mode of ['unificada','separada']){
  const perfil={plantillas:{reserva:{conformidad_modo:mode}}};
  const snap=a.crearSnapshotPlantillaOperacion(op,perfil,[],[]);
  check(mode+' se conserva en snapshot y configuración',()=>{assert.equal(snap.conformidad_modo,mode);assert.equal(a.modoConformidadReserva(perfil,op),mode);assert.equal(a.modoConformidadReserva(perfil,{...op,plantilla_snapshot:snap}),mode);});
 }
 check('sin configurar, mantiene documentos unificados',()=>assert.equal(a.modoConformidadReserva({},op),'unificada'));
 check('la conformidad toma honorarios del vendedor y respeta su visibilidad',()=>{
  const importes={...op,comision_comprador_valor:'4',comision_vendedor_valor:'2'};
  function generar(datos){
   return a.buildDocSections(a.opParaDocumento(datos),[],'reserva');
  }
  const unido=generar(importes);
  assert.match(a.docToPlainText(unido),/El Oferente abonará el 4%/);
  assert.match(unido.conformidad.items.join(' '),/me obligo a abonar a la inmobiliaria interviniente el 2%/);
  const fijo={...importes,comision_vendedor_modo:'fijo',comision_vendedor_valor:'1250',comision_vendedor_moneda:'ARS'};
  const acta=a.construirDocumentoConformidadReserva(generar(fijo),fijo);
  assert.match(a.docToPlainText(acta),/ARS 1\.250/);
  const oculto=generar({...importes,comision_vendedor_ocultar_doc:true});
  assert.match(a.docToPlainText(oculto),/El Oferente abonará el 4%/);
  assert.equal(oculto.conformidad.items.length,2);
  assert.doesNotMatch(oculto.conformidad.items.join(' '),/me obligo a abonar/);
  const historico=generar({...op,comision_vendedor:'',comision_comprador:'',
   comision_comprador_valor:'',comision_comprador_valor_editado:false,
   comision_vendedor_valor:'',comision_vendedor_valor_editado:false,comision_porcentaje:'3'});
  assert.match(historico.conformidad.items.join(' '),/me obligo a abonar a la inmobiliaria interviniente el 3%/);
 });
 for(const [tipo,expected] of [['escritura','la Escritura Traslativa de Dominio'],['boleto','el Boleto de Compraventa'],['cesion_boleto','la Cesión de Derechos Emergentes de Boleto de Compraventa']]){
  const actual={...op,compra_instrumento:tipo,compra_boleto_origen:'Boleto antecedente'};
  const d=a.buildDocSections(a.opParaDocumento(actual),[],'reserva');
  const texto=a.docToPlainText(d);
  check(tipo+' resuelve todas las frases de instrumento y chips',()=>{
   assert.ok(texto.includes(expected),expected);
   assert.doesNotMatch(texto,/Escritura Traslativa de Dominio y\/o|Boleto de Compraventa y\/o/);
   assert.doesNotMatch(texto,/\{\{compra_instrumento_/);
   assert.doesNotMatch(texto,/\[precio en letras\]/i);
  });
  const acta=a.construirDocumentoConformidadReserva(d,actual);
  const reserva=Object.assign({},d,{conformidad:null});
  check(tipo+' separa un acta y no duplica firmas',()=>{
   assert.equal(acta.titulo,'CONFORMIDAD DEL VENDEDOR');
   assert.equal(acta.firmas.length,1);
   assert.match(a.docToPlainText(acta),/Presto plena conformidad/);
   assert.doesNotMatch(a.docToPlainText(reserva),/PRESTA CONFORMIDAD/);
   assert.equal(reserva.firmas.filter(f=>f.rol==='OFERENTE').length,1);
  });
 }
 check('modelo histórico con boleto y/o escritura conserva la gramática al convertir',()=>{
  for(const [tipo,esperado] of [['escritura','deberá suscribirse la Escritura Traslativa de Dominio'],['boleto','deberá suscribirse el Boleto de Compraventa'],['cesion_boleto','deberá suscribirse la Cesión de Derechos Emergentes de Boleto de Compraventa']]){
    const heredado='Dentro del plazo deberá suscribirse el Boleto de Compraventa y/o la Escritura Traslativa de Dominio.';
    const canon=a.canonizarMarcadoresAjuste(heredado);
    const res=a.resolveVars(canon,{...op,compra_instrumento:tipo});
    assert.ok(res.includes(esperado),res);
    assert.doesNotMatch(res,/y\/o|deberá suscribirse de /i);
  }
 });
 check('editor convierte marcadores entre corchetes a chips',()=>{
  const normal=a.canonizarMarcadoresAjuste('Precio [precio en letras]. Reserva [importe de la reserva]. Firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa.');
  assert.match(normal,/\{\{precio_letras\}\}/);
  assert.match(normal,/\{\{anticipo_letras\}\}/);
  assert.match(normal,/\{\{compra_instrumento_de_firma\}\}/);
 });
 check('los datos se sustituyen según el tipo de instrumentación',()=>{
  const canon=a.canonizarMarcadoresAjuste('La firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa.');
  for(const t of ['escritura','boleto','cesion_boleto'])assert.doesNotMatch(a.resolveVars(canon,{...op,compra_instrumento:t}),/y\/o|\{\{/);
 });
 const d=a.buildDocSections(a.opParaDocumento(op),[],'reserva');
 const conf=a.construirDocumentoConformidadReserva(d,op);
 const p=await a.generarPDF(conf,null,{}),w=await a.generarDOCX(conf,{});
 check('acta separada exporta PDF y DOCX nativos',()=>{assert.ok(p?.blob?.size>1000);assert.ok(w?.blob?.size>1000);assert.notEqual(p.filename,'');assert.notEqual(w.filename,'');});
 console.log('APROBADAS',count,'pruebas de conformidad e instrumentación.');
})().catch(e=>{console.error(e);process.exitCode=1;});
