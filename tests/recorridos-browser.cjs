const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'dw-recorridos-browser-'));
const fixturePath=process.env.DOCWORKS_RECORRIDOS_DB||process.env.DOCWORKS_RECORRIDOS_FIXTURES||out+'/fixtures.json';
if(!fs.existsSync(fixturePath))require('node:child_process').execFileSync(process.execPath,[dir+'/tests/recorridos-conversion.cjs'],{env:{...process.env,DOCWORKS_RECORRIDOS_FIXTURES:fixturePath},stdio:'pipe'});
const fixtures=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
const harness=`
import {createRoot} from 'react-dom/client';
const fixtures=${JSON.stringify(fixtures)};
function RecorridosHarness(){
 const [indice,setIndice]=useState(0),[initial,setInitial]=useState(()=>JSON.parse(localStorage.getItem('qa-'+fixtures[0].tipo)||'null')||fixtures[0]),[abierto,setAbierto]=useState(true),[guardado,setGuardado]=useState(null);
 const perfil={rol:'dueno',nombre:'Inmobiliaria Prueba',matricula:'1234',plantillas:crearPlantillasIniciales()};
 function elegir(i){setIndice(i);setInitial(JSON.parse(localStorage.getItem('qa-'+fixtures[i].tipo)||'null')||fixtures[i]);setAbierto(true);setGuardado(null);}
 return <><GStyles/><style>{MOBILE_STABILITY_CSS}</style><div className="app-wrap"><main className="dw-operation-page" style={{maxWidth:1050,width:'100%',padding:16,boxSizing:'border-box',margin:'auto'}}><h1>Recorridos de prueba</h1><select aria-label="Documento a revisar" value={indice} onChange={e=>elegir(Number(e.target.value))}>{fixtures.map((x,i)=><option value={i} key={x.tipo}>{x.tipo}</option>)}</select><button onClick={()=>elegir(indice)}>Reabrir operación guardada</button><output data-testid="guardado" hidden>{JSON.stringify(guardado)}</output>{abierto?<OperacionForm key={initial.id+'-'+indice} initial={initial} perfil={perfil} clausulas={[]} equipo={[]} operaciones={fixtures} saveStatus={{state:'saved'}} reportSave={()=>{}} onAddClausula={()=>{}} onCancel={()=>setAbierto(false)} onSave={async data=>{const x=JSON.parse(JSON.stringify(data));localStorage.setItem('qa-'+x.tipo,JSON.stringify(x));setGuardado(x);setAbierto(false);return {operacion:x};}}/>:<p>Operación guardada para volver a abrir.</p>}</main></div></>;
}
createRoot(document.getElementById('root')).render(<RecorridosHarness/>);`;
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(dir+'/src/App.tsx','utf8')+'\n'+harness,resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',format:'iife',outfile:out+'/harness.js'});
const server=http.createServer((req,res)=>{if(req.url==='/harness.js'){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(out+'/harness.js'));}else if(req.url==='/fonts/dm-sans-latin.woff2'){res.setHeader('Content-Type','font/woff2');res.end(fs.readFileSync(dir+'/public/fonts/dm-sans-latin.woff2'));}else{res.setHeader('Content-Type','text/html');res.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script src="/harness.js"></script></body></html>');}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await require('playwright').chromium.launchPersistentContext(out+'/profile',{headless:true,executablePath:process.env.DOCWORKS_BROWSER_EXECUTABLE,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader']});let checks=0;
try{for(const [width,height]of [[320,740],[390,844],[844,390],[1440,1000]]){const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height});await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1')?r.continue():r.abort());await page.goto('http://127.0.0.1:'+server.address().port);
for(let i=0;i<fixtures.length;i++){const tipo=fixtures[i].tipo;await page.getByLabel('Documento a revisar').selectOption(String(i));await page.locator('.step-dot').first().waitFor();const total=await page.locator('.step-dot').count();
for(let paso=0;paso<total;paso++){await page.locator('.step-dot').nth(paso).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),tipo+' paso '+(paso+1)+' desborda en '+width);checks++;
assert.equal(await page.locator('.dw-rol-ayuda').count(),0);checks++;
if(tipo==='alquiler'&&(paso===0||paso===4)){assert.equal(await page.locator('#dw-field-alquiler_seguro_dias').count(),0);assert.equal(await page.getByRole('checkbox',{name:/Incluir seguro/}).count(),0);checks+=2;}
if(tipo==='alquiler'&&paso===6){const seguro=page.getByRole('checkbox',{name:/Incluir seguro/});await seguro.uncheck();assert.equal(await page.locator('#dw-field-alquiler_seguro_dias').count(),0);await seguro.check();await page.locator('#dw-field-alquiler_seguro_dias').fill('12');assert.equal(await page.locator('#dw-field-alquiler_seguro_dias').inputValue(),'12');checks+=2;}
if(paso<total-1){await page.getByRole('button',{name:'Continuar →',exact:true}).click();assert.equal(await page.locator('.step-dot[aria-current="step"]').getAttribute('title'),await page.locator('.step-dot').nth(paso+1).getAttribute('title'));checks++;}}
await page.getByRole('button',{name:'Revisar →',exact:true}).click();await page.getByText('Revisión final',{exact:true}).waitFor();checks++;
if(i===0){
 await page.getByRole('button',{name:'Guardar o emitir →',exact:true}).click();
 const menu=page.getByRole('dialog',{name:'Guardar o emitir'});
 await menu.waitFor();
 for(const action of ['Guardar y abrir PDF / Word','Guardar y enviar por WhatsApp','Guardar y terminar']){
  assert.equal(await menu.getByRole('button',{name:action,exact:false}).count(),1,'Acción inmediata '+action);checks++;
 }
 const estado=menu.getByRole('button',{name:'Estado: Cerrado'});
 await estado.click();
 assert.equal(await estado.getAttribute('aria-pressed'),'true');checks++;
 await menu.getByRole('button',{name:'Cerrar',exact:true}).click();
}
await page.locator('.step-dot').nth(3).click();const address='DOMICILIO REVISADO '+width+' '+tipo;await page.locator('#dw-field-inmueble_direccion').fill(address);await page.getByRole('button',{name:'💾 Guardar cambios',exact:true}).click();await page.getByText('Operación guardada para volver a abrir.',{exact:true}).waitFor();const saved=JSON.parse(await page.getByTestId('guardado').textContent());assert.equal(saved.inmueble_direccion,address);assert.equal(saved.clausulas_custom,fixtures[i].clausulas_custom);assert.deepEqual(saved.plantilla_snapshot,fixtures[i].plantilla_snapshot);checks+=3;
await page.getByRole('button',{name:'Reabrir operación guardada',exact:true}).click();await page.locator('.step-dot').nth(3).click();assert.equal(await page.locator('#dw-field-inmueble_direccion').inputValue(),address);checks++;await page.screenshot({path:out+'/'+tipo+'-'+width+'.png',fullPage:true});console.log('OK '+tipo+' '+width+'×'+height+': todos los pasos, edición, guardado y reapertura');}
assert.deepEqual(errors,[]);checks++;await page.close();}console.log('APROBADAS '+checks+' comprobaciones de recorridos Chromium. Capturas: '+out);}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
