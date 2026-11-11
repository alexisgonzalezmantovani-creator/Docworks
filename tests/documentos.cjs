const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-test-'));
const exportsList=['PLANTILLA_TIPOS','SAMPLE_OP_PREVIEW','EMPTY_OP','getDefaultBodyBlocks','normalizarBodyBlock','buildDocSections','opParaDocumento','docToPlainText','getTokensSinReemplazar','asegurarFirmasDocumento','generarPDF','generarDOCX','aplicarEncabezadoPersonalizado','CuerpoPlantillaPanel','ReservaBloquesPanel','getCamposFaltantesDetalle','validarDocumentoParaExport','crearSnapshotPlantillaOperacion'];
esbuild.buildSync({stdin:{contents:fs.readFileSync(path.join(root,'src/App.tsx'),'utf8')+'\nexport { '+exportsList.join(',')+' };',resolveDir:path.join(root,'src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'app.cjs')});
global.document={querySelector:()=>({}),title:''};
const app=require(path.join(tmp,'app.cjs'));
delete global.document;
(async()=>{
 let count=0;function check(label,fn){fn();count++;console.log('OK',label);}
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
