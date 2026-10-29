const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict');
const engine=process.argv.includes('--webkit')?'webkit':'chromium';
const browserType=require('playwright')[engine];
const root=path.resolve(__dirname,'..'),out=process.env.DOCWORKS_BROWSER_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'docworks-browser-'));
fs.mkdirSync(out,{recursive:true});
const harness=`
import {createRoot} from 'react-dom/client';
function Harness(){
 const [perfil,setPerfil]=useState({rol:'dueno',plantillas:{}}),[tipo,setTipo]=useState('reserva'),[abierto,setAbierto]=useState(true),[confirmacion,setConfirmacion]=useState(null);
 useEffect(()=>{const listener=e=>setConfirmacion(e.detail);window.addEventListener('dw:confirm',listener);return ()=>window.removeEventListener('dw:confirm',listener);},[]);
 return <><GStyles/><main style={{maxWidth:1000,margin:'0 auto',padding:14,boxSizing:'border-box'}}><select aria-label="Documento de prueba" value={tipo} onChange={e=>setTipo(e.target.value)}>{PLANTILLA_TIPOS.map(t=><option key={t} value={t}>{t}</option>)}</select><button onClick={()=>navegarConProteccionModelo(()=>setAbierto(false))}>Salir del modelo</button><button onClick={()=>setAbierto(true)}>Abrir modelo</button>{abierto&&<CuerpoPlantillaPanel key={tipo} perfil={perfil} tipo={tipo} puedeEditar={true} clausulas={[]} onChange={async p=>{setPerfil(p);return {};}}/>}<ConfirmModal open={!!confirmacion} message={confirmacion?.message} onConfirm={()=>{const next=confirmacion;setConfirmacion(null);next.onConfirm();}} onCancel={()=>setConfirmacion(null)}/></main></>;
}
function WorkspaceHarness(){
 const [perfil,setPerfil]=useState({rol:'dueno',plantillas:{}}),[confirmacion,setConfirmacion]=useState(null),[guardados,setGuardados]=useState(0);
 useEffect(()=>{const listener=e=>setConfirmacion(e.detail);window.addEventListener('dw:confirm',listener);return ()=>window.removeEventListener('dw:confirm',listener);},[]);
 return <><GStyles/><main style={{maxWidth:1000,margin:'0 auto',padding:14,boxSizing:'border-box'}}><output data-testid="guardados">{guardados}</output><ClausulasWorkspace perfil={perfil} onSavePerfil={async p=>{setPerfil(p);setGuardados(n=>n+1);return {};}} clausulas={[{id:'ejemplo-opcional',titulo:'Texto reutilizable de ejemplo',contenido:'Texto ficticio para comprobar la biblioteca.',tipos:['todos']}]} operaciones={[]} bloquesReserva={[]} onAddClausula={()=>{}} onEditClausula={()=>{}} onDeleteClausula={()=>{}}/><ConfirmModal open={!!confirmacion} message={confirmacion?.message} onConfirm={()=>{const next=confirmacion;setConfirmacion(null);next.onConfirm();}} onCancel={()=>setConfirmacion(null)}/></main></>;
}
createRoot(document.getElementById('root')).render(location.pathname==='/workspace'?<WorkspaceHarness/>:<Harness/>);
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
   await page.getByRole('button',{name:'Vista previa con datos de ejemplo',exact:true}).click();
   await page.getByText('EJEMPLO FICTICIO',{exact:false}).waitFor();
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
   await page.locator('.dw-model-type-chip').filter({hasText:label}).click();
   assert.equal(await page.locator('#dw-config-modelo').count(),1);checks++;
   assert.ok((await page.locator('#dw-config-modelo').textContent()).startsWith(label),name+' cambio a '+label);checks++;
  }
  await page.locator('.dw-model-type-chip').filter({hasText:'Reserva de Compra'}).click();
  const nav=page.getByRole('navigation',{name:'Cláusulas y documentos'});
  assert.equal(await nav.getByRole('button').count(),2);checks++;
  await page.getByRole('button',{name:'Editar introducción',exact:true}).waitFor();
  assert.equal(await page.locator('#dw-model-preview-area').count(),1);checks++;
  const acciones=page.getByTestId('dw-model-actions');
  assert.equal(await acciones.getByRole('button',{name:'Guardar cambios',exact:true}).count(),1);checks++;
  assert.equal(await acciones.getByRole('button',{name:'Vista previa',exact:true}).count(),0);checks++;
  await page.getByTestId('dw-open-fullpage-preview').click();
  await page.getByTestId('dw-fullpage-preview').waitFor();checks++;
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
  assert.deepEqual(errors,[]);checks++;await page.close();
 }
 console.log('APROBADAS',checks,'verificaciones '+engine+' en iPhone/iPad/escritorio emulados. Capturas:',out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
