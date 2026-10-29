const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-test-'));
const exportsList=['PLANTILLA_TIPOS','SAMPLE_OP_PREVIEW','EMPTY_OP','getDefaultBodyBlocks','normalizarBodyBlock','buildDocSections','opParaDocumento','docToPlainText','getTokensSinReemplazar','asegurarFirmasDocumento','generarPDF','generarDOCX','aplicarEncabezadoPersonalizado','CuerpoPlantillaPanel','ReservaBloquesPanel','getCamposFaltantesDetalle','validarDocumentoParaExport'];
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
 console.log('APROBADAS',count,'verificaciones. Exportaciones:',tmp);
})().catch(e=>{console.error(e);process.exitCode=1;});
