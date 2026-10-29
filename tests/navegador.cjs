const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict');
const engine=process.argv.includes('--webkit')?'webkit':'chromium';
const browserType=require('playwright')[engine];
const root=path.resolve(__dirname,'..'),out=process.env.DOCWORKS_BROWSER_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'docworks-browser-'));
fs.mkdirSync(out,{recursive:true});
const harness=`
import {createRoot} from 'react-dom/client';
function Harness(){
 const [perfil,setPerfil]=useState({rol:'dueno',plantillas:{}}),[tipo,setTipo]=useState('reserva'),[abierto,setAbierto]=useState(true),[confirmacion,setConfirmacion]=useState(null);
 const [preview,setPreview]=useState(false);
 useEffect(()=>{const listener=e=>setConfirmacion(e.detail);window.addEventListener('dw:confirm',listener);return ()=>window.removeEventListener('dw:confirm',listener);},[]);
 return <><GStyles/><main style={{maxWidth:1000,margin:'0 auto',padding:14,boxSizing:'border-box'}}><select aria-label="Documento de prueba" value={tipo} onChange={e=>setTipo(e.target.value)}>{PLANTILLA_TIPOS.map(t=><option key={t} value={t}>{t}</option>)}</select><button onClick={()=>navegarConProteccionModelo(()=>setAbierto(false))}>Salir del modelo</button><button onClick={()=>setAbierto(true)}>Abrir modelo</button><button onClick={()=>setPreview(true)}>Abrir vista previa de prueba</button>{abierto&&<CuerpoPlantillaPanel key={tipo} perfil={perfil} tipo={tipo} puedeEditar={true} previewOpen={preview} onPreviewChange={setPreview} clausulas={[]} onChange={async p=>{setPerfil(p);return {};}}/>}<ConfirmModal open={!!confirmacion} message={confirmacion?.message} onConfirm={()=>{const next=confirmacion;setConfirmacion(null);next.onConfirm();}} onCancel={()=>setConfirmacion(null)}/></main></>;
}
function WorkspaceHarness(){
 const [perfil,setPerfil]=useState({rol:'dueno',plantillas:{}}),[confirmacion,setConfirmacion]=useState(null),[guardados,setGuardados]=useState(0);
 const [catalogo,setCatalogo]=useState([{id:'ejemplo-opcional',titulo:'Texto reutilizable de ejemplo',contenido:'Texto ficticio para comprobar la biblioteca.',tipos:['todos']},{id:'vieja-uuid',titulo:'Multa por incumplimiento',contenido:'Vieja cláusula copiada con UUID.',tipos:['todos'],obligatoria:false},{id:'inactiva',titulo:'Cláusula eliminada',contenido:'Texto eliminado.',tipos:['todos'],activo:false}]);
 const [altas,setAltas]=useState(0),[fallar,setFallar]=useState(false);
 useEffect(()=>{const listener=e=>setConfirmacion(e.detail);window.addEventListener('dw:confirm',listener);return ()=>window.removeEventListener('dw:confirm',listener);},[]);
 return <><GStyles/><main style={{maxWidth:1000,margin:'0 auto',padding:14,boxSizing:'border-box'}}><output data-testid="guardados">{guardados}</output><output data-testid="altas">{altas}</output><output data-testid="perfil" hidden>{JSON.stringify(perfil)}</output><button onClick={()=>setFallar(v=>!v)}>{fallar?'Restablecer guardado':'Simular fallo de habilitación'}</button><ClausulasWorkspace perfil={perfil} onSavePerfil={async p=>{if(fallar)return {error:{message:'Fallo simulado'}};setPerfil(p);setGuardados(n=>n+1);return {};}} clausulas={catalogo} operaciones={[]} bloquesReserva={[]} onAddClausula={async c=>{const id='catalogo-'+(altas+1);setAltas(n=>n+1);setCatalogo(xs=>xs.concat([{...c,id}]));return {data:id};}} onEditClausula={()=>({})} onDeleteClausula={()=>{}}/><ConfirmModal open={!!confirmacion} message={confirmacion?.message} onConfirm={()=>{const next=confirmacion;setConfirmacion(null);next.onConfirm();}} onCancel={()=>setConfirmacion(null)}/></main></>;
}
function EstadisticasHarness(){return <><GStyles/><main style={{maxWidth:1000,margin:'0 auto',padding:14}}><EstadisticasView operaciones={[]} equipo={[]} perfil={{rol:'dueno'}} currentUserRole="dueno"/></main></>;}
createRoot(document.getElementById('root')).render(location.pathname==='/workspace'?<WorkspaceHarness/>:location.pathname==='/estadisticas'?<EstadisticasHarness/>:<Harness/>);
`;
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(path.join(root,'src/App.tsx'),'utf8')+harness,resolveDir:path.join(root,'src'),loader:'tsx'},bundle:true,jsx:'automatic',format:'iife',outfile:path.join(out,'harness.js')});
const server=http.createServer((req,res)=>{if(req.url==='/harness.js'){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(path.join(out,'harness.js')));}else{res.setHeader('Content-Type','text/html');res.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script src="/harness.js"></script></body></html>');}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await browserType.launchPersistentContext(path.join(out,'profile'),{headless:true,...(engine==='chromium'?{executablePath:process.env.DOCWORKS_BROWSER_EXECUTABLE||undefined,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader']}:{})});
 let checks=0;
 try{
 for(const [name,width,height] of [['iphone',390,844],['ipad',820,1180],['desktop',1440,1000]]){
  const page=await browser.newPage(),errors=[];await page.setViewportSize({width,height});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().includes('same key'))errors.push(m.text());});
  await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1')?r.continue():r.abort());
  await page.goto('http://127.0.0.1:'+server.address().port);
  for(const tipo of ['reserva','boleto','reserva_alquiler','alquiler','comodato','exclusividad','refuerzo_reserva','devolucion_reserva']){
   await page.getByLabel('Documento de prueba').selectOption(tipo);
   await page.getByRole('button',{name:'Abrir vista previa de prueba'}).click();
   await page.getByTestId('dw-fullpage-preview').waitFor();
   await page.getByRole('button',{name:'Cerrar vista previa'}).click();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' '+tipo+' overflow');checks++;
   await page.getByRole('button',{name:'＋ Agregar cláusula',exact:true}).click();
   await page.locator('textarea').fill('Texto de prueba móvil.');
   const chips=await page.getByRole('button',{name:/^\+/}).allTextContents();
   assert.equal(new Set(chips).size,chips.length,name+' '+tipo+' etiquetas de chips');checks++;
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' '+tipo+' chips overflow');checks++;

   await page.getByRole('button',{name:'Guardar cláusula',exact:true}).click();
   await page.locator('textarea').waitFor({state:'detached'});checks++;
   await page.getByRole('button',{name:'＋ Agregar cláusula',exact:true}).click();
   await page.locator('textarea').fill('Borrador que debe sobrevivir al cancelar la salida.');
   await page.getByRole('button',{name:'Salir del modelo',exact:true}).click();
   await page.getByRole('button',{name:'Cancelar',exact:true}).last().click();
   assert.ok((await page.locator('textarea').inputValue()).includes('sobrevivir'));checks++;
   await page.getByRole('button',{name:'Salir del modelo',exact:true}).click();
   await page.getByRole('button',{name:'Confirmar',exact:true}).click();
   await page.locator('textarea').waitFor({state:'detached'});checks++;
   await page.getByRole('button',{name:'Abrir modelo',exact:true}).click();
   assert.equal(await page.locator('textarea').count(),0);checks++;
   if(tipo==='boleto')await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
  }
  await page.goto('http://127.0.0.1:'+server.address().port+'/workspace');
  for(const label of ['Reserva de Compra','Boleto de Compraventa','Reserva de Alquiler','Contrato de Alquiler','Comodato','Autorización de Venta','Refuerzo de Reserva','Devolución de Reserva']){
   await page.locator('#dw-modelo-documento').selectOption({label});
   assert.equal(await page.locator('#dw-config-modelo').count(),1);checks++;
   assert.ok((await page.locator('#dw-config-modelo').textContent()).startsWith(label),name+' cambio a '+label);checks++;
   const tipoActual=await page.locator('#dw-modelo-documento').inputValue();
   const idsDocumento=await page.locator('#dw-model-extra-clauses [data-clausula-id]').evaluateAll(xs=>xs.map(x=>x.dataset.clausulaId));
   await page.getByRole('navigation',{name:'Cláusulas y documentos'}).getByRole('button',{name:'Biblioteca de cláusulas',exact:true}).click();
   await page.locator('#dw-biblioteca-documento').selectOption(tipoActual);
   const idsBiblioteca=await page.locator('[data-clausula-id]').evaluateAll(xs=>xs.map(x=>x.dataset.clausulaId));
   assert.deepEqual(idsDocumento,idsBiblioteca,name+' mismo catálogo '+label);checks++;
   assert.deepEqual(idsDocumento,['ejemplo-opcional'],name+' sin cláusulas viejas/eliminadas '+label);checks++;
   await page.getByRole('navigation',{name:'Cláusulas y documentos'}).getByRole('button',{name:'Documentos',exact:true}).click();

  }
  await page.locator('#dw-modelo-documento').selectOption({label:'Reserva de Compra'});
  const nav=page.getByRole('navigation',{name:'Cláusulas y documentos'});
  assert.equal(await nav.getByRole('button').count(),3);checks++;
  await page.getByRole('button',{name:'Editar introducción',exact:true}).waitFor();
  assert.equal(await page.locator('#dw-model-preview-area').count(),1);checks++;
  const acciones=page.getByTestId('dw-model-actions');
  assert.equal(await acciones.getByRole('button',{name:'Guardar cambios',exact:true}).count(),1);checks++;
  assert.equal(await acciones.getByRole('button',{name:'Vista previa',exact:true}).count(),1);checks++;
  assert.equal(await page.getByRole('group',{name:'Elegir vista de cláusulas'}).count(),0);checks++;
  assert.ok(await page.locator('.dw-clause-compact').count()>0,name+' cláusulas compactas');checks++;
  assert.equal(await page.locator('.dw-clause-compact:not(.dw-clause-open) .dw-clause-actions:visible').count(),0);checks++;
  await page.getByTestId('dw-open-fullpage-preview').click();
  await page.getByTestId('dw-fullpage-preview').waitFor();checks++;
  const cierreFijo=page.getByTestId('dw-preview-fixed-close');
  assert.equal(await cierreFijo.count(),1);checks++;
  assert.equal(await cierreFijo.evaluate(el=>getComputedStyle(el).position),'fixed');checks++;
  await page.getByTestId('dw-fullpage-preview').evaluate(el=>el.scrollTop=el.scrollHeight);
  assert.ok(await cierreFijo.isVisible());checks++;
  await page.getByRole('button',{name:'Cerrar vista previa'}).click();
  await page.getByTestId('dw-fullpage-preview').waitFor({state:'detached'});checks++;
  assert.equal(await page.getByRole('button',{name:'Publicar para asesores'}).count(),0);checks++;
  assert.ok(await page.evaluate(()=>{const a=document.querySelector('[data-testid="dw-model-actions"]');const b=document.querySelector('#dw-model-extra-clauses');return a&&b&&a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_PRECEDING;}),name+' acciones al final');checks++;
  await acciones.getByRole('button',{name:'Guardar cambios',exact:true}).click();
  await page.getByTestId('guardados').getByText('1').waitFor();checks++;

  assert.equal(await page.getByRole('tablist',{name:'Contenido del modelo'}).count(),0);checks++;
  const extras=page.locator('#dw-model-extra-clauses');
  assert.equal(await extras.getAttribute('open'),null);checks++;
  await extras.locator('summary').click();
  await page.getByLabel('Estado de Texto reutilizable de ejemplo',{exact:true}).selectOption('asesor');
  assert.equal(await extras.locator('summary').textContent(),'Cláusulas opcionales');checks++;
  assert.equal(await page.getByTestId('guardados').textContent(),'2');checks++;
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' workspace overflow');checks++;
  await page.screenshot({path:path.join(out,'documentos-'+name+'.png'),fullPage:true});
  await nav.getByRole('button',{name:'Biblioteca de cláusulas',exact:true}).click();
  await page.locator('#dw-biblioteca-documento').selectOption('todas');
  assert.equal(await page.locator('#dw-config-tipo').count(),0);checks++;
  await nav.getByRole('button',{name:'Documentos',exact:true}).click();
  await page.getByRole('button',{name:'＋ Agregar cláusula',exact:true}).click();
  await page.locator('textarea').fill('Borrador conservado al cambiar de sección.');
  await nav.getByRole('button',{name:'Biblioteca de cláusulas',exact:true}).click();
  await page.getByRole('button',{name:'Cancelar',exact:true}).last().click();
  assert.ok((await page.locator('textarea').inputValue()).includes('Borrador conservado'));checks++;
  await nav.getByRole('button',{name:'Biblioteca de cláusulas',exact:true}).click();
  await page.getByRole('button',{name:'Confirmar',exact:true}).click();
  assert.equal(await page.locator('#dw-config-tipo').count(),0);checks++;
  await nav.getByRole('button',{name:'Documentos',exact:true}).click();
  await page.getByRole('button',{name:'Editar introducción',exact:true}).click();
  await page.locator('[contenteditable="true"]').fill('Introducción sin guardar.');
  await nav.getByRole('button',{name:'Biblioteca de cláusulas',exact:true}).click();
  await page.getByRole('button',{name:'Cancelar',exact:true}).last().click();
  assert.equal(await page.locator('[contenteditable="true"]').textContent(),'Introducción sin guardar.');checks++;
  await nav.getByRole('button',{name:'Biblioteca de cláusulas',exact:true}).click();
  await page.getByRole('button',{name:'Confirmar',exact:true}).click();
  assert.equal(await page.locator('#dw-config-tipo').count(),0);checks++;
  assert.equal(await page.getByTestId('guardados').textContent(),'2');checks++;
  await page.getByRole('button',{name:'＋ Crear cláusula para biblioteca',exact:true}).click();
  await page.locator('fieldset input.inp').fill('Texto reutilizable de ejemplo');
  await page.locator('#dw-clausula-texto').fill('Condición especial válida durante 90 días.');
  await page.locator('fieldset').getByRole('button',{name:'Reserva de Compra',exact:true}).click();
  assert.ok(await page.getByText('Hay títulos parecidos en la biblioteca',{exact:true}).isVisible());checks++;
  await nav.getByRole('button',{name:'Documentos',exact:true}).click();
  await page.getByRole('button',{name:'Cancelar',exact:true}).last().click();
  assert.equal(await page.locator('#dw-clausula-texto').inputValue(),'Condición especial válida durante 90 días.');checks++;
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' editor biblioteca overflow');checks++;
  await page.screenshot({path:path.join(out,'biblioteca-editor-'+name+'.png'),fullPage:true});
  await page.getByRole('button',{name:'Guardar y habilitar',exact:true}).click();
  await page.locator('#dw-clausula-texto').waitFor({state:'detached'});
  assert.equal(await page.getByTestId('altas').textContent(),'1');checks++;
  const perfilGuardado=JSON.parse(await page.getByTestId('perfil').textContent());
  assert.ok(perfilGuardado.plantillas.reserva.clausulas_ids.includes('catalogo-1'));checks++;
  assert.ok(!perfilGuardado.plantillas.alquiler?.clausulas_ids?.includes('catalogo-1'));checks++;
  assert.ok(await page.getByText('Texto ficticio para comprobar la biblioteca.',{exact:true}).isVisible());checks++;
  await page.getByRole('button',{name:'＋ Crear cláusula para biblioteca',exact:true}).click();
  await page.locator('fieldset input.inp').fill('Crédito hipotecario sin plazo');
  await page.locator('#dw-clausula-texto').fill('Condición de crédito sin plazo determinado.');
  await page.getByRole('button',{name:'Simular fallo de habilitación',exact:true}).click();
  await page.getByRole('button',{name:'Guardar y habilitar',exact:true}).click();
  await page.getByRole('button',{name:'Reintentar habilitación',exact:true}).waitFor();
  assert.equal(await page.getByTestId('altas').textContent(),'2');checks++;
  await nav.getByRole('button',{name:'Documentos',exact:true}).click();
  assert.ok(await page.getByText('La cláusula está guardada en la biblioteca, pero falta habilitarla para los asesores. ¿Salir y dejar la habilitación pendiente?',{exact:true}).isVisible());checks++;
  await page.getByRole('button',{name:'Cancelar',exact:true}).last().click();
  await page.getByRole('button',{name:'Restablecer guardado',exact:true}).click();
  await page.getByRole('button',{name:'Reintentar habilitación',exact:true}).click();
  await page.locator('#dw-clausula-texto').waitFor({state:'detached'});
  assert.equal(await page.getByTestId('altas').textContent(),'2');checks++;
  await nav.getByRole('button',{name:'Papelera',exact:true}).click();
  await page.getByRole('heading',{name:'Papelera de cláusulas',exact:true}).waitFor();checks++;
  assert.equal(await page.locator('#dw-biblioteca-documento').count(),0);checks++;
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' papelera overflow');checks++;
  await page.screenshot({path:path.join(out,name+'-papelera.png'),fullPage:true});
  await page.getByRole('button',{name:'Volver a biblioteca',exact:true}).click();
  await page.locator('#dw-biblioteca-documento').waitFor();checks++;
  await page.goto('http://127.0.0.1:'+server.address().port+'/estadisticas');
  await page.locator('.recharts-wrapper').first().waitFor();
  assert.ok(await page.locator('.recharts-wrapper svg').count()>=2);checks++;
  assert.equal(await page.getByText('No se pudieron cargar los gráficos.',{exact:false}).count(),0);checks++;
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' estadísticas overflow');checks++;
  await page.screenshot({path:path.join(out,'estadisticas-'+name+'.png'),fullPage:true});
  assert.deepEqual(errors,[]);checks++;await page.close();
 }
 console.log('APROBADAS',checks,'verificaciones '+engine+' en iPhone/iPad/escritorio emulados. Capturas:',out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
