const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-test-'));
const exportsList=['camposTratamientoActivos','textoTratamientoPersona','sustituirTokens','resolveVars','tokensEncabezadoParaTipo','PLANTILLA_TIPOS','SAMPLE_OP_PREVIEW','EMPTY_OP','getDefaultBodyBlocks','normalizarBodyBlock','buildDocSections','opParaDocumento','docToPlainText','getTokensSinReemplazar','asegurarFirmasDocumento','generarPDF','generarDOCX','aplicarEncabezadoPersonalizado','CuerpoPlantillaPanel','ReservaBloquesPanel','getCamposFaltantesDetalle','validarDocumentoParaExport','crearSnapshotPlantillaOperacion','datosCompraCompartidos','getResumenPartes'];
esbuild.buildSync({stdin:{contents:fs.readFileSync(path.join(root,'src/App.tsx'),'utf8')+'\nexport { '+exportsList.join(',')+' };',resolveDir:path.join(root,'src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'app.cjs')});
global.document={querySelector:()=>({}),title:''};
const app=require(path.join(tmp,'app.cjs'));
delete global.document;
(async()=>{
 let count=0;function check(label,fn){fn();count++;console.log('OK',label);}
 check('la introducción nueva ofrece instrumento y no documentación actual',()=>{
  assert.ok(app.tokensEncabezadoParaTipo('reserva').includes('compra_instrumento_nombre'));
  assert.ok(app.tokensEncabezadoParaTipo('boleto').includes('compra_instrumento_nombre'));
  assert.equal(app.tokensEncabezadoParaTipo('reserva').includes('inmueble_documentacion_actual_texto'),false);
  assert.equal(app.tokensEncabezadoParaTipo('boleto').includes('inmueble_documentacion_actual_texto'),false);
 });
 check('sin chips el tratamiento no aparece como un dato adicional',()=>{
  assert.equal(app.camposTratamientoActivos({tipo:'reserva'},{plantillas:{}}).comprador,false);
  assert.equal(app.getCamposFaltantesDetalle({...app.EMPTY_OP,tipo:'reserva'}).some(f=>f.campo==='comprador_tratamiento'),false);
 });
 check('un chip en introducción habilita solo el selector de la persona mencionada',()=>{
  const perfil={encabezados_custom:{reserva:'Interviene {{comprador_tratamiento}} {{comprador_nombre}}'}};
  const campos=app.camposTratamientoActivos({tipo:'reserva'},perfil);
  assert.equal(campos.comprador,true);assert.equal(campos.vendedor,false);
  assert.ok(app.getCamposFaltantesDetalle({...app.EMPTY_OP,tipo:'reserva'},perfil).some(f=>f.campo==='comprador_tratamiento'));
 });
 check('Sr. y Sra. resuelven el artículo correspondiente en la introducción',()=>{
  const txt='Comparece {{comprador_articulo}} {{comprador_tratamiento}} {{comprador_nombre}}.';
  assert.equal(app.sustituirTokens(txt,{comprador_tratamiento:'sr',comprador_nombre:'Juan'},null,'reserva'),'Comparece el Sr. Juan.');
  assert.equal(app.sustituirTokens(txt,{comprador_tratamiento:'sra',comprador_nombre:'María'},null,'reserva'),'Comparece la Sra. María.');
 });
 check('sin selección queda marcado para revisar, sin adivinar por nombre',()=>{
  assert.equal(app.textoTratamientoPersona({comprador_nombre:'María'},'comprador_tratamiento'),'___');
  assert.equal(app.textoTratamientoPersona({comprador_nombre:'Juan'},'comprador_articulo'),'___');
 });
 check('chips resueltos en las cláusulas',()=>{
  assert.equal(app.resolveVars('{{locador_articulo}} {{locador_tratamiento}} {{locador_nombre}}',{tipo:'alquiler',locador_tratamiento:'sra',locador_nombre:'María'}),'la Sra. María');
 });
 check('aliases de comodato y autorización se completan desde sus partes reales',()=>{
  const op={tipo:'comodato',comprador_tratamiento:'sr',vendedor_tratamiento:'sra'};
  assert.equal(app.textoTratamientoPersona(op,'comodatario_tratamiento'),'Sr.');
  assert.equal(app.textoTratamientoPersona(op,'comodante_articulo'),'la');
  assert.equal(app.textoTratamientoPersona({...op,tipo:'exclusividad'},'autorizante_tratamiento'),'Sra.');
 });
 check('los chips del contrato propio se detectan y los ocultos no aparecen',()=>{
  const op={tipo:'comodato'},perfil={plantillas:{comodato:{modo_documento:'propio',documento_propio:'{{comodante_tratamiento}} firma el comodato'}}};
  assert.equal(app.camposTratamientoActivos(op,perfil).vendedor,true);
  assert.equal(app.camposTratamientoActivos(op,perfil).comprador,false);
 });
 check('contrato propio reúne dirección, partido y provincia sin confundir la calle',()=>{
   const op={...app.EMPTY_OP,tipo:'reserva',inmueble_direccion:'Av. San Martín 1200',inmueble_partido:'San Martín',inmueble_provincia:'Buenos Aires',
     plantilla_snapshot:{tipo:'reserva',documento_propio:'Inmueble {{inmueble_direccion}}. Comprador {{comprador_nombre}}.',inmobiliaria_nombre:'Prueba'}};
   const doc=app.buildDocSections(app.opParaDocumento(op),[],'reserva');
   assert.match(doc.textoOriginal,/Av\. San Martín 1200, San Martín, Buenos Aires/);
 });
 check('contrato propio antiguo conserva municipio y provincia separados',()=>{
   const op={...app.EMPTY_OP,tipo:'reserva',inmueble_direccion:'Calle 1',inmueble_partido:'Pilar',inmueble_provincia:'Buenos Aires',
     plantilla_snapshot:{tipo:'reserva',documento_propio:'{{inmueble_direccion}}, {{inmueble_partido}}, {{inmueble_provincia}}',inmobiliaria_nombre:'Prueba'}};
   const doc=app.buildDocSections(app.opParaDocumento(op),[],'reserva');
   assert.match(doc.textoOriginal,/Calle 1, Pilar, Buenos Aires/);
   assert.ok(!doc.textoOriginal.includes('Pilar, Buenos Aires, Pilar'));
 });
 check('legacy obligatoria por defecto',()=>assert.equal(app.normalizarBodyBlock({id:'x'},0).obligatoria,true));
 check('legacy condicional opcional',()=>assert.equal(app.normalizarBodyBlock({id:'alquiler.seguro'},0).obligatoria,false));
 check('undefined de Supabase usa valor por defecto',()=>assert.equal(app.normalizarBodyBlock({id:'x',obligatoria:undefined},0).obligatoria,true));
 check('false explícito preservado',()=>assert.equal(app.normalizarBodyBlock({id:'x',obligatoria:false},0).obligatoria,false));
 for(const tipo of app.PLANTILLA_TIPOS){
  const original={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo,created_at:'2026-10-27T12:00:00Z',res_alq_monto_reserva:'100000',res_alq_monto_mensual:'350000',res_alq_inicio_estimado:'2026-11-01',comodato_plazo:'24',comodato_uso:'vivienda',devolucion_motivo:'Mutuo acuerdo',refuerzo_trayectoria:'Reserva de ejemplo',refuerzo_monto:'5000',reserva_vigencia_dias:'30',comprador_cotitulares:[{nombre:'Ana Cotitular',dni:'30123456',domicilio:'Pilar',email:'cotitular@example.test',email_en_doc:true}],vendedor_cotitulares:[{nombre:'Pedro Vendedor',dni:'30222333'}],comprador_email:'privado@example.test',comprador_email_en_doc:false};
  const before=JSON.stringify(original),op=app.opParaDocumento(original),blocks=app.getDefaultBodyBlocks(tipo);
  let doc=app.buildDocSections(op,[],tipo,blocks);
  doc=app.aplicarEncabezadoPersonalizado(doc,op,tipo,{});
  const text=app.docToPlainText(doc);
  if(tipo==='reserva'||tipo==='boleto'){
    const probe={...op,descripcion_inmueble:'DETALLE_ADICIONAL_PRUEBA'};
    check(tipo+' detalles no se imprimen por defecto',()=>assert.ok(!app.docToPlainText(app.buildDocSections(probe,[],tipo,blocks)).includes(probe.descripcion_inmueble)));
    const custom=blocks.map((b,i)=>i===0?{...b,contenido:b.contenido+' Detalles: {{descripcion_inmueble}}'}:b);
    check(tipo+' detalles se imprimen si la plantilla usa el campo',()=>assert.ok(app.docToPlainText(app.buildDocSections(probe,[],tipo,custom)).includes(probe.descripcion_inmueble)));
  }

  check(tipo+' construye sin mutar operación',()=>{assert.equal(JSON.stringify(original),before);assert.ok(text.length>100);});
  check(tipo+' faltantes detectados',()=>assert.ok(app.getCamposFaltantesDetalle({...app.EMPTY_OP,tipo}).length>0));
  check(tipo+' tokens resueltos',()=>assert.deepEqual(app.getTokensSinReemplazar(doc),[]));
  check(tipo+' numeración continua',()=>assert.deepEqual(doc.secciones.map(x=>Number(x.titulo.match(/^\d+/)?.[0])),doc.secciones.map((_,i)=>i+1)));
  check(tipo+' preview usa rótulos formales como PDF',()=>{if(doc.secciones.length)assert.ok(text.includes('CLÁUSULA PRIMERA'));assert.ok(!text.includes('\n1. '+String(doc.secciones[0]?.titulo||'').replace(/^1\.\s*/,'')));});
  check(tipo+' todas las cláusulas tienen nombre visible',()=>{assert.ok(doc.secciones.every(s=>/^\d+\.\s*\S/.test(s.titulo)));assert.ok(blocks.every(b=>b.titulo.trim()&&!b.sinTitulo));});
  const bloqueViejo={...blocks[0],titulo:'',sinTitulo:true},bloqueAntes=JSON.stringify(bloqueViejo);
  const docViejo=app.buildDocSections(op,[],tipo,[bloqueViejo]);
  check(tipo+' recupera nombre del modelo anterior sin tocar su texto',()=>{assert.ok(docViejo.secciones[0].titulo.endsWith(blocks[0].titulo));assert.ok(app.docToPlainText(docViejo).includes(blocks[0].titulo));assert.equal(JSON.stringify(bloqueViejo),bloqueAntes);});
  check(tipo+' contactos privados ocultos',()=>assert.ok(!text.includes('privado@example.test')));
  check(tipo+' firmas idempotentes',()=>{const once=JSON.stringify(doc.firmas);app.asegurarFirmasDocumento(doc,op,{});assert.equal(JSON.stringify(doc.firmas),once);});
  check(tipo+' inmobiliaria única usa perfil',()=>{const firmas=doc.firmas.filter(f=>f.usarPerfil||String(f.rol||'').includes('INMOBILIARIA'));assert.equal(firmas.length,1);assert.equal(firmas[0].usarPerfil,true);});
  if(tipo==='reserva')check('Reserva conformidad individual por vendedor',()=>assert.equal(doc.conformidad.firmantes.length,2));
  const pdf=await app.generarPDF(doc,null,{}),word=await app.generarDOCX(doc,{});
  check(tipo+' PDF válido',()=>{assert.ok(pdf?.blob?.size>1000);});
  check(tipo+' DOCX válido',()=>{assert.ok(word?.blob?.size>1000);});
  assert.equal(Buffer.from(await pdf.blob.arrayBuffer()).subarray(0,5).toString(),'%PDF-');
  assert.equal(Buffer.from(await word.blob.arrayBuffer()).subarray(0,2).toString(),'PK');
  fs.writeFileSync(path.join(tmp,tipo+'.pdf'),Buffer.from(await pdf.blob.arrayBuffer()));
  fs.writeFileSync(path.join(tmp,tipo+'.docx'),Buffer.from(await word.blob.arrayBuffer()));
 }
 check('título personalizado se conserva y se muestra',()=>{const b=app.normalizarBodyBlock({id:'boleto.precio',titulo:'PRECIO ESPECIAL PACTADO',contenido:'Texto personalizado.',sinTitulo:true},0);assert.equal(b.titulo,'PRECIO ESPECIAL PACTADO');assert.equal(b.sinTitulo,false);assert.equal(b.contenido,'Texto personalizado.');});
 check('cláusula propia sin título recibe nombre neutral',()=>{assert.equal(app.normalizarBodyBlock({id:'propia',titulo:'   ',contenido:'Acuerdo particular.'},0).titulo,'CONDICIÓN PARTICULAR');});
 check('Snapshot respeta obligatorias del modelo',()=>{const op={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo:'boleto',plantilla_snapshot:{tipo:'boleto',body_blocks:app.getDefaultBodyBlocks('boleto'),clausulas:[{id:'extra',titulo:'EXTRA PARTICULAR',contenido:'Texto adicional único',tipos:['boleto'],obligatoria:false}],obligatorias_ids:['extra']}};assert.ok(app.docToPlainText(app.buildDocSections(op,[],'boleto')).includes('Texto adicional único'));});


 // Regresión: el modelo esencial debe dejar las cláusulas elegidas al final, una sola vez.
 // Verificar también las exportaciones reales de una reserva y de una locación.
 for(const tipo of app.PLANTILLA_TIPOS){
   const marca="EXTRAUNICATEST"+tipo.replace(/_/g,"").toUpperCase();
   const extra={id:"qa.adicional."+tipo,titulo:"ACUERDO ADICIONAL",contenido:marca,tipos:[tipo],obligatoria:false};
   const base={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo,clausulas_ids:[extra.id],alquiler_incluye_seguro:false};
   const bloques=app.getDefaultBodyBlocks(tipo,true);
   const documento=app.buildDocSections(app.opParaDocumento(base),[extra],tipo,bloques);
   check(tipo+" adicional al final y sin duplicar",()=>{
     assert.equal(documento.clausulas.length,1);
     assert.equal(documento.clausulas[0].texto,marca);
     assert.equal(documento.clausulas[0].num,documento.secciones.length+1);
     assert.equal(app.docToPlainText(documento).split(marca).length-1,1);
   });
   const sinSeleccion=app.buildDocSections(app.opParaDocumento({...base,clausulas_ids:[]}),[extra],tipo,bloques);
   check(tipo+" extra no seleccionado queda fuera",()=>assert.ok(!app.docToPlainText(sinSeleccion).includes(marca)));
   if(tipo==="reserva"||tipo==="alquiler"){
     const pdf=await app.generarPDF(documento,null,{}),word=await app.generarDOCX(documento,{});
     const bytesPdf=Buffer.from(await pdf.blob.arrayBuffer()),bytesWord=Buffer.from(await word.blob.arrayBuffer());
     let xml="";
     for(let at=0;at+30<bytesWord.length&&bytesWord.readUInt32LE(at)===0x04034b50;){
       const method=bytesWord.readUInt16LE(at+8),size=bytesWord.readUInt32LE(at+18),len=bytesWord.readUInt16LE(at+26),extraLen=bytesWord.readUInt16LE(at+28),start=at+30+len+extraLen;
       let entry=bytesWord.subarray(start,start+size);
       if(method===8)entry=require("node:zlib").inflateRawSync(entry);
       xml+=entry.toString("utf8");
       at=start+size;
     }
     check(tipo+" adicional figura en PDF y DOCX",()=>{
       assert.ok(bytesPdf.toString("latin1").includes(marca),"PDF sin adicional");
       assert.ok(xml.includes(marca),"DOCX sin adicional");
     });
   }
 }
 const marcaPlazo="EXTRARESERVAALQUILER";
 const extraPlazo={id:"qa.periodo",titulo:"PACTO EXTRA",contenido:marcaPlazo,tipos:["reserva_alquiler"],obligatoria:false};
 const opPlazo={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo:"reserva_alquiler",res_alq_dia_pago:"10",clausulas_ids:[extraPlazo.id]};
 const cuerpoSinCondiciones=app.getDefaultBodyBlocks("reserva_alquiler").filter(b=>b.id!=="reserva_alquiler.condiciones");
 const docPlazo=app.buildDocSections(app.opParaDocumento(opPlazo),[extraPlazo],"reserva_alquiler",cuerpoSinCondiciones);
 check("período de pago insertado antes de extra sin repetir número",()=>{
   const ultimo=docPlazo.secciones.at(-1);
   assert.ok(ultimo.titulo.includes("PERÍODO DE PAGO MENSUAL"));
   assert.equal(docPlazo.clausulas.length,1);
   assert.equal(docPlazo.clausulas[0].num,Number(ultimo.titulo.match(/^[0-9]+/)[0])+1);
   assert.equal(docPlazo.clausulas[0].texto,marcaPlazo);
 });
 const extraHistorico={id:"qa.historico",titulo:"ACUERDO HISTÓRICO",contenido:"TEXTOANTERIOR",tipos:["reserva"],obligatoria:false};
 const opHistorico={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo:"reserva",clausulas_ids:[extraHistorico.id]};
 const snapHistorico=app.crearSnapshotPlantillaOperacion(opHistorico,{
   modelo_inicial_esencial:true,plantillas:{reserva:{clausulas_ids:[extraHistorico.id],obligatorias_ids:[],version:3}}
 },[extraHistorico],[]);
 extraHistorico.contenido="TEXTONUEVO";
 check("snapshot conserva el ámbito y el texto original de una cláusula",()=>{
   assert.deepEqual(snapHistorico.clausulas[0].tipos,["reserva"]);
   assert.equal(snapHistorico.clausulas[0].contenido,"TEXTOANTERIOR");
   const viejo=app.buildDocSections(app.opParaDocumento({...opHistorico,plantilla_snapshot:snapHistorico}),[extraHistorico],"reserva");
   assert.equal(viejo.clausulas.length,1);
   assert.equal(viejo.clausulas[0].texto,"TEXTOANTERIOR");
   assert.ok(!app.docToPlainText(viejo).includes("TEXTONUEVO"));
 });

 const contratoComodato="CONTRATO DE COMODATO\n\nEl COMODANTE {{comodante_nombre}}, DNI {{comodante_dni}}, entrega en uso gratuito a {{comodatario_nombre}}, DNI {{comodatario_dni}}, el inmueble {{inmueble_direccion}}.\n\nFirmas de las partes. Interviene {{inmobiliaria_nombre}}.";
 const perfilPropio={nombre:'Inmobiliaria Prueba',matricula:'CMCPSI 0000',plantillas:{comodato:{
   modo_documento:'propio',documento_propio:contratoComodato,clausulas_ids:['extra-no-debe-verse'],obligatorias_ids:['obligatoria-no-debe-verse'],version:4
 }}};
 const opComodato={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo:'comodato'};
 const snapComodato=app.crearSnapshotPlantillaOperacion(opComodato,perfilPropio,[{id:'extra-no-debe-verse',titulo:'Extra',contenido:'TEXTO QUE NO DEBE APARECER'}],app.getDefaultBodyBlocks('comodato'));
 check('contrato propio conserva versión y no incorpora cláusulas del modelo',()=>{
   assert.equal(snapComodato.documento_propio,contratoComodato);
   assert.equal(snapComodato.version,4);
   assert.deepEqual(snapComodato.clausulas_ids,[]);
   assert.deepEqual(snapComodato.body_blocks,[]);
   assert.deepEqual(snapComodato.clausulas,[]);
 });
 const perfilPropioNuevo={...perfilPropio,plantillas:{...perfilPropio.plantillas,comodato:{
   ...perfilPropio.plantillas.comodato,
   version:5,
   documento_propio:contratoComodato.replace('CONTRATO DE COMODATO','COMODATO ACTUALIZADO')
 }}};
 const snapComodatoNuevo=app.crearSnapshotPlantillaOperacion(opComodato,perfilPropioNuevo,[],app.getDefaultBodyBlocks('comodato'));
 check('cambiar un modelo no altera el contrato histórico de la operación',()=>{
   assert.equal(snapComodato.version,4);
   assert.equal(snapComodatoNuevo.version,5);
   assert.ok(snapComodato.documento_propio.startsWith('CONTRATO DE COMODATO'));
   assert.ok(snapComodatoNuevo.documento_propio.startsWith('COMODATO ACTUALIZADO'));
   const viejo=app.docToPlainText(app.buildDocSections({...opComodato,plantilla_snapshot:snapComodato},[],'comodato'));
   const nuevo=app.docToPlainText(app.buildDocSections({...opComodato,plantilla_snapshot:snapComodatoNuevo},[],'comodato'));
   assert.ok(viejo.startsWith('CONTRATO DE COMODATO'));
   assert.ok(nuevo.startsWith('COMODATO ACTUALIZADO'));
   assert.ok(!viejo.includes('COMODATO ACTUALIZADO'));
 });
 const opComodatoPropio={...opComodato,plantilla_snapshot:snapComodato};
 const docComodatoPropio=app.aplicarEncabezadoPersonalizado(app.buildDocSections(opComodatoPropio,[],'comodato'),opComodatoPropio,'comodato',perfilPropio);
 const textoComodatoPropio=app.docToPlainText(docComodatoPropio);
 check('chips de comodato y inmobiliaria se reemplazan sin texto agregado',()=>{
   assert.equal(docComodatoPropio.documentoPropio,true);
   assert.ok(textoComodatoPropio.includes('María López'));
   assert.ok(textoComodatoPropio.includes('Juan Pérez'));
   assert.ok(textoComodatoPropio.includes('Inmobiliaria Prueba'));
   assert.ok(!textoComodatoPropio.includes('TEXTO QUE NO DEBE APARECER'));
   assert.ok(!textoComodatoPropio.includes('OBLIGACIONES DEL COMODATARIO'));
   assert.deepEqual(app.getTokensSinReemplazar(docComodatoPropio),[]);
 });
 const pdfPropio=await app.generarPDF(docComodatoPropio,null,perfilPropio);
 const wordPropio=await app.generarDOCX(docComodatoPropio,perfilPropio);
 const pdfBytesPropio=Buffer.from(await pdfPropio.blob.arrayBuffer());
 const wordBytesPropio=Buffer.from(await wordPropio.blob.arrayBuffer());
 check('contrato propio exporta PDF y DOCX completos',()=>{
   assert.ok(pdfBytesPropio.length>1000&&wordBytesPropio.length>1000);
   assert.equal(pdfBytesPropio.subarray(0,5).toString(),'%PDF-');
   assert.equal(wordBytesPropio.subarray(0,2).toString(),'PK');
   assert.ok(pdfPropio.filename.endsWith('.pdf')&&wordPropio.filename.endsWith('.docx'));
   assert.ok(docComodatoPropio.encabezado.includes('Firmas de las partes.'));
   assert.ok(docComodatoPropio.encabezado.includes('\n\n'));
 });
 const propioConSaltos="DOCUMENTO DE PRUEBA\n\nCLÁUSULA PRIMERA\nTexto en renglón separado.\n\n\nFIRMAS:\nComprobante de las partes.";
 const opSaltos={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo:'comodato',plantilla_snapshot:{
   tipo:'comodato',version:9,documento_propio:propioConSaltos,clausulas_ids:[],body_blocks:[]
 }};
 const docSaltos=app.buildDocSections(opSaltos,[],'comodato');
 check('contrato propio conserva renglones vacíos y saltos exactos',()=>{
   assert.equal(docSaltos.textoOriginal,propioConSaltos);
   assert.equal(app.docToPlainText(docSaltos),propioConSaltos);
   assert.ok(docSaltos.documentoPropio);
   assert.deepEqual(docSaltos.secciones,[]);
   assert.deepEqual(docSaltos.firmas,[]);
 });
 const pdfSaltos=await app.generarPDF(docSaltos,null,{}),docxSaltos=await app.generarDOCX(docSaltos,{});
 check('contrato con renglones separados genera ambos formatos',()=>{
   assert.ok(pdfSaltos?.blob?.size>1000);
   assert.ok(docxSaltos?.blob?.size>1000);
 });
 const textoReservaAlquilerPropia='RESERVA DE ALQUILER. El LOCATARIO {{locatario_nombre}} entrega una reserva de {{reserva_alquiler_reserva}} para el inmueble {{inmueble_direccion}} ofrecido por {{locador_nombre}}. Alquiler estimado: {{reserva_alquiler_canon}}. Firmas de las partes.';
 const perfilReservaAlquilerPropia={nombre:'Inmobiliaria Prueba',plantillas:{reserva_alquiler:{modo_documento:'propio',documento_propio:textoReservaAlquilerPropia}}};
 const opReservaAlquilerPropia={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo:'reserva_alquiler',res_alq_moneda:'USD',res_alq_monto_reserva:'350',res_alq_monto_mensual_moneda:'ARS',res_alq_monto_mensual:'650000'};
 const snapshotReservaAlquiler=app.crearSnapshotPlantillaOperacion(opReservaAlquilerPropia,perfilReservaAlquilerPropia,[]);
 const propioReservaAlquiler=app.buildDocSections({...opReservaAlquilerPropia,plantilla_snapshot:snapshotReservaAlquiler},[],'reserva_alquiler');
 const txtReservaAlquiler=app.docToPlainText(propioReservaAlquiler);
 check('reserva de alquiler propia usa ambos montos y monedas de origen sin añadir cláusulas',()=>{
   assert.equal(propioReservaAlquiler.documentoPropio,true);
   assert.ok(txtReservaAlquiler.includes('350'));
   assert.ok(txtReservaAlquiler.includes('650.000'));
   assert.ok(!txtReservaAlquiler.includes('{{reserva_alquiler_reserva}}'));
   assert.ok(!txtReservaAlquiler.includes('{{reserva_alquiler_canon}}'));
   assert.deepEqual(propioReservaAlquiler.secciones,[]);
   assert.deepEqual(propioReservaAlquiler.firmas,[]);
 });
 const perfilExclusividad={nombre:'Inmobiliaria de prueba',plantillas:{exclusividad:{modo_documento:'propio',documento_propio:'AUTORIZACIÓN. El AUTORIZANTE {{autorizante_nombre}}, DNI {{autorizante_dni}}, autoriza a {{inmobiliaria_nombre}} sobre {{inmueble_direccion}}. Las firmas serán manuscritas.'}}};
 const opExclusividad={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo:'exclusividad'};
 const sinCompradorExclusividad={...opExclusividad,comprador_nombre:'',comprador_dni:'',inmobiliaria_nombre:'',inmobiliaria_matricula:''};
 check('exclusividad usa nombre y matrícula del perfil sin exigir comprador inexistente',()=>{
   const campos=app.getCamposFaltantesDetalle(sinCompradorExclusividad,{nombre:'Inmobiliaria de prueba',matricula:'CMCPSI 0000'}).map(f=>f.campo);
   assert.ok(!campos.includes('comprador_nombre')&&!campos.includes('comprador_dni'));
 });
 const snapExclusividad=app.crearSnapshotPlantillaOperacion(opExclusividad,perfilExclusividad,[]);
 const docExclusividad=app.buildDocSections({...opExclusividad,plantilla_snapshot:snapExclusividad},[],'exclusividad');
 check('autorizante vinculado sin agregar cláusulas ni firmas automáticas',()=>{
   assert.ok(app.docToPlainText(docExclusividad).includes('María López'));
   assert.ok(app.docToPlainText(docExclusividad).includes('Inmobiliaria de prueba'));
   assert.deepEqual(docExclusividad.secciones,[]);
   assert.deepEqual(docExclusividad.firmas,[]);
   assert.deepEqual(app.getTokensSinReemplazar(docExclusividad),[]);
 });
 const opReservaBoleto={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo:'reserva',compra_instrumento:'boleto',precio:'150000',anticipo:'15000',saldo:'135000'};
 const docReservaBoleto=app.buildDocSections(app.opParaDocumento(opReservaBoleto),[],'reserva',app.getDefaultBodyBlocks('reserva'));
 check('reserva por boleto incluye la instrumentación elegida y cambia pago',()=>{
   const txt=app.docToPlainText(docReservaBoleto);
   assert.ok(txt.includes('Instrumentación prevista: Boleto de Compraventa.'));
   assert.ok(txt.includes('al momento de firmar el Boleto de Compraventa'));
   assert.deepEqual(app.getTokensSinReemplazar(docReservaBoleto),[]);
 });
 const boletoPosesion={...opReservaBoleto,tipo:'boleto',fecha_posesion:'2026-12-01'};
 const docBoleto=app.buildDocSections(app.opParaDocumento(boletoPosesion),[],'boleto',app.getDefaultBodyBlocks('boleto'));
 check('boleto respeta fecha de posesión distinta de escritura',()=>{
   const txt=app.docToPlainText(docBoleto);
   assert.ok(txt.includes('sin presumir simultaneidad con la posesión'));
   assert.ok(!txt.includes('fecha en la que asimismo deberá suscribirse la Escritura'));
   assert.deepEqual(app.getTokensSinReemplazar(docBoleto),[]);
 });
 const opCesion={...opReservaBoleto,compra_instrumento:'cesion_boleto',compra_boleto_origen:''};
 check('cesión exige identificar boleto original y no inventa fecha de posesión',()=>{
   const faltan=app.getCamposFaltantesDetalle({...opCesion,tipo:'boleto'}).map(x=>x.campo);
   assert.ok(faltan.includes('compra_boleto_origen'));
   assert.ok(!faltan.includes('fecha_posesion'));
 });
 check('la conversión reserva a boleto conserva la instrumentación elegida',()=>{
   const heredados=app.datosCompraCompartidos({...opCesion,compra_boleto_origen:'Boleto del 10/10/2025'});
   assert.equal(heredados.compra_instrumento,'cesion_boleto');
   assert.equal(heredados.compra_boleto_origen,'Boleto del 10/10/2025');
 });
 check('el resumen muestra cedente y cesionario sin modificar datos guardados',()=>{
   const partes=app.getResumenPartes(opCesion);
   assert.equal(partes[0].label,'Cedente');
   assert.equal(partes[1].label,'Cesionario');
 });
 const cesionConOrigen={...opCesion,compra_boleto_origen:'Boleto original 10/10/2025 entre partes identificadas'};
 const cesionGenerica=app.buildDocSections(app.opParaDocumento(cesionConOrigen),[],'reserva',app.getDefaultBodyBlocks('reserva'));
 check('cesión no se exporta con modelo estándar de compraventa',()=>{
   const v=app.validarDocumentoParaExport(cesionConOrigen,cesionGenerica,{});
   assert.ok(v.errores.some(e=>e.includes('contrato específico')));
   assert.equal(v.puedeExportar,false);
 });
 const cesionPropia={...cesionGenerica,documentoPropio:true,encabezado:'Contrato de cesión entre CEDENTE y CESIONARIO, según boleto antecedente 10/10/2025.',secciones:[],clausulas:[],firmas:[]};
 check('cesión con modelo propio no se bloquea por instrumentación',()=>{
   const v=app.validarDocumentoParaExport(cesionConOrigen,cesionPropia,{});
   assert.ok(!v.errores.some(e=>e.includes('contrato específico')));
   assert.equal(v.puedeExportar,true);
 });
 check('compartir una reserva desde listado conserva su tipo y no genera un boleto',()=>{
   const dashboardSrc=fs.readFileSync(path.join(root,'src/Operaciones.tsx'),'utf8');
   assert.ok(/function defaultTabFor\(op\)\s*\{[\s\S]{0,300}?return op&&op\.tipo&&TIPOS\[op\.tipo\]\?op\.tipo:"reserva";/.test(dashboardSrc));
 });
 const pdfBoleto=await app.generarPDF(docBoleto,null,{}),wordBoleto=await app.generarDOCX(docBoleto,{});
 check('boleto con instrumentación elegida exporta PDF/DOCX',()=>{
   assert.ok(pdfBoleto?.blob?.size>1000&&wordBoleto?.blob?.size>1000);
 });
 const opUbicacion={...app.EMPTY_OP,...app.SAMPLE_OP_PREVIEW,tipo:'reserva'};
 const docUbicacion=app.buildDocSections(app.opParaDocumento(opUbicacion),[],'reserva');docUbicacion.secciones=[];docUbicacion.firmas=[];docUbicacion.conformidad=null;
 for(const [nombre,config,esperado] of [
  ['sin ubicación',{ubicacion_encabezado:false,ubicacion_pie:false},0],
  ['solo encabezado',{ubicacion_encabezado:true,ubicacion_pie:false},1],
  ['solo pie',{ubicacion_encabezado:false,ubicacion_pie:true},1],
  ['ambos',{ubicacion_encabezado:true,ubicacion_pie:true},2],
  ['legacy encabezado',{ubicacion_inmobiliaria_activa:true,ubicacion_inmobiliaria_posicion:'encabezado'},1],
  ['legacy pie',{ubicacion_inmobiliaria_activa:true,ubicacion_inmobiliaria_posicion:'pie'},1],
  ['desactivar legacy',{ubicacion_inmobiliaria_activa:true,ubicacion_inmobiliaria_posicion:'pie',ubicacion_encabezado:false,ubicacion_pie:false},0]
 ]){
  const perfil={nombre:'Inmobiliaria de ejemplo',direccion:'CallePrueba 123',...config};
  const pdf=await app.generarPDF(docUbicacion,null,perfil),word=await app.generarDOCX(docUbicacion,perfil);
  const pdfTexto=Buffer.from(await pdf.blob.arrayBuffer()).toString('latin1');
  const wordBytes=Buffer.from(await word.blob.arrayBuffer());let xml='';
  for(let at=0;at+30<wordBytes.length&&wordBytes.readUInt32LE(at)===0x04034b50;){const method=wordBytes.readUInt16LE(at+8),size=wordBytes.readUInt32LE(at+18),len=wordBytes.readUInt16LE(at+26),extra=wordBytes.readUInt16LE(at+28),start=at+30+len+extra;let data=wordBytes.subarray(start,start+size);if(method===8)data=require('node:zlib').inflateRawSync(data);xml+=data.toString('utf8');at=start+size;}
  check(nombre+' coincide en PDF y Word',()=>{assert.equal((pdfTexto.match(/CallePrueba 123/g)||[]).length,esperado);assert.equal((xml.match(/CallePrueba 123/g)||[]).length,esperado);});
 }
 console.log('APROBADAS',count,'verificaciones. Exportaciones:',tmp);
})().catch(e=>{console.error(e);process.exitCode=1;});
