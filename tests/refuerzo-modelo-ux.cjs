const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-refuerzo-'));
esbuild.buildSync({stdin:{contents:fs.readFileSync(root+'/src/App.tsx','utf8')+'\nexport {getDefaultBodyBlocks,buildDocSections,opParaDocumento,EMPTY_OP,SAMPLE_OP_PREVIEW,modoPlazoRefuerzoReserva,textoPlazoRefuerzoReserva,getInconsistenciasCamposOperacion,StepEconomicoCompra};',resolveDir:root+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
global.document={querySelector:()=>({}),title:''};
const a=require(tmp+'/app.cjs');delete global.document;
let count=0;const check=(name,fn)=>{fn();console.log('OK',name);count++};
const op={...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo:'reserva',reserva_incluye_refuerzo:true,reserva_refuerzo_modo:'dias',reserva_refuerzo_dias:'7',reserva_fecha_refuerzo:''};
const render=(data,blocks)=>a.buildDocSections(a.opParaDocumento(data),[],'reserva',blocks);
const refuerzo=doc=>doc.secciones.find(x=>/REFUERZO/i.test(x.titulo)&&x.items.some(v=>/Oferente podrá ofrecer/i.test(v)))?.items.join(' ')||'';
check('sin refuerzo la cláusula queda fuera',()=>{
 const d=render({...op,reserva_incluye_refuerzo:false},a.getDefaultBodyBlocks('reserva'));
 assert.ok(!refuerzo(d));
});
for(const [dias,expected] of [['7','7 días corridos'],['12','12 días corridos'],['1','1 día corrido']]){
 check('días corridos '+dias+' aparecen en documento estándar y modelo editable',()=>{
  const d={...op,reserva_refuerzo_dias:dias};
  assert.match(refuerzo(render(d)),new RegExp(expected));
  assert.match(refuerzo(render(d,a.getDefaultBodyBlocks('reserva'))),new RegExp(expected));
  assert.doesNotMatch(refuerzo(render(d,a.getDefaultBodyBlocks('reserva'))),/\{\{|\[.*\]/);
 });
}
check('fecha exacta se imprime y no se arrastra plazo de siete días',()=>{
 const d={...op,reserva_refuerzo_modo:'fecha',reserva_fecha_refuerzo:'2026-12-22'};
 for(const doc of [render(d),render(d,a.getDefaultBodyBlocks('reserva'))]){
  assert.match(refuerzo(doc),/hasta el 22\/12\/2026/);
  assert.doesNotMatch(refuerzo(doc),/7 días corridos/);
 }
});
check('sin fecha exacta no se inventa una fecha',()=>{
 const d={...op,reserva_refuerzo_modo:'fecha',reserva_fecha_refuerzo:''};
 assert.match(refuerzo(render(d)),/hasta el ___/);
});
check('fecha de operación histórica conserva su modalidad sin cambio de datos',()=>{
 const d={...op,reserva_refuerzo_modo:undefined,reserva_fecha_refuerzo:'2026-12-23'};
 assert.equal(a.modoPlazoRefuerzoReserva(d),'fecha');
 assert.match(a.textoPlazoRefuerzoReserva(d),/23\/12\/2026/);
});
check('modelo guardado original se transforma sin cambiar el dato persistido',()=>{
 const old='El Oferente podrá ofrecer, de así convenirlo con el Vendedor, un Refuerzo de la presente Reserva dentro de los 7 días corridos a partir de su conformidad, cuyo monto y demás condiciones se consignarán en el instrumento de Refuerzo de Reserva correspondiente.-';
 const saved={id:'reserva.refuerzo',titulo:'REFUERZO',contenido:old,activo:true,orden:1,obligatoria:false,condicion:'op_refuerzo'};
 const d={...op,reserva_refuerzo_dias:'25'};
 assert.match(refuerzo(render(d,[saved])),/25 días corridos/);
 assert.equal(saved.contenido,old);
 const personalized={...saved,contenido:'Plazo acordado exclusivamente por las partes: 99 días corridos.'};
 const userDoc=render(d,[personalized]);
 assert.ok(userDoc.secciones.some(x=>x.items.some(v=>v.includes('99 días corridos'))));
});
check('nuevo modelo de fábrica contiene chip modificable de refuerzo',()=>{
 const b=a.getDefaultBodyBlocks('reserva').find(x=>x.id==='reserva.refuerzo');
 assert.ok(b);
 assert.match(b.contenido,/\{\{reserva_refuerzo_plazo\}\}/);
 assert.doesNotMatch(b.contenido,/7 días corridos/);
});
check('fecha exacta faltante se advierte y una fecha cargada es válida',()=>{
 const faltantes=a.getInconsistenciasCamposOperacion({...op,reserva_refuerzo_modo:'fecha',reserva_fecha_refuerzo:''});
 assert.ok(faltantes.some(x=>x.campo==='reserva_fecha_refuerzo'));
 const completos=a.getInconsistenciasCamposOperacion({...op,reserva_refuerzo_modo:'fecha',reserva_fecha_refuerzo:'2026-12-22'});
 assert.ok(!completos.some(x=>x.campo==='reserva_fecha_refuerzo'));
});
check('un plazo de días vacío o inválido no pasa la revisión final',()=>{
 for(const dias of ['', '0','99999','dos']){
  const errors=a.getInconsistenciasCamposOperacion({...op,reserva_refuerzo_dias:dias});
  assert.ok(errors.some(x=>x.campo==='reserva_refuerzo_dias'),'debe advertir '+dias);
 }
});
check('selector de días/fecha está en el paso económico',()=>{
 const src=fs.readFileSync(root+'/src/App.tsx','utf8');
 assert.match(src,/aria-label="Cómo definir el plazo del refuerzo"/);
 assert.match(src,/dw-field-reserva_refuerzo_dias/);
 assert.match(src,/dw-field-reserva_fecha_refuerzo/);
});
check('agregar cláusula está al final de la lista y no arriba',()=>{
 const src=fs.readFileSync(root+'/src/App.tsx','utf8');
 const a=src.indexOf('draft.map(function(b,idx)'),b=src.indexOf('data-testid="dw-add-model-clause-end"');
 assert.ok(a>=0&&b>a);
 assert.equal(src.split('＋ Escribir cláusula del modelo').length-1,1);
});
check('aspecto se mueve al final de documentos, no aparece junto al título del modelo',()=>{
 const src=fs.readFileSync(root+'/src/Clausulas.tsx','utf8');
 const title=src.indexOf('data-testid="dw-model-source"'),advance=src.indexOf('id="dw-model-source-switch"'),aspect=src.indexOf('data-testid="dw-aspecto-al-final"');
 assert.ok(title>=0&&advance>title&&aspect>advance);
 assert.equal(src.split('title="Configurar aspecto del documento"').length-1,1);
});
console.log('APROBADAS',count,'pruebas de refuerzo y organización del modelo.');
