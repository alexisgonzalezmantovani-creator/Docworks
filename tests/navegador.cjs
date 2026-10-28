const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.DOCWORKS_BROWSER_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'docworks-browser-'));
fs.mkdirSync(out,{recursive:true});
const harness=`
import {createRoot} from 'react-dom/client';
function Harness(){
 const [perfil,setPerfil]=useState({rol:'dueno',plantillas:{}}),[tipo,setTipo]=useState('reserva');
 return <><GStyles/><main style={{maxWidth:1000,margin:'0 auto',padding:14,boxSizing:'border-box'}}><select aria-label="Documento de prueba" value={tipo} onChange={e=>setTipo(e.target.value)}>{PLANTILLA_TIPOS.map(t=><option key={t} value={t}>{t}</option>)}</select><CuerpoPlantillaPanel key={tipo} perfil={perfil} tipo={tipo} puedeEditar={true} clausulas={[]} onChange={async p=>{setPerfil(p);return {};}}/></main></>;
}
window.addEventListener('dw:confirm',e=>e.detail.onConfirm());
createRoot(document.getElementById('root')).render(<Harness/>);
`;
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(path.join(root,'src/App.tsx'),'utf8')+harness,resolveDir:path.join(root,'src'),loader:'tsx'},bundle:true,jsx:'automatic',format:'iife',outfile:path.join(out,'harness.js')});
const server=http.createServer((req,res)=>{if(req.url==='/harness.js'){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(path.join(out,'harness.js')));}else{res.setHeader('Content-Type','text/html');res.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script src="/harness.js"></script></body></html>');}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launchPersistentContext(path.join(out,'profile'),{headless:true,executablePath:process.env.DOCWORKS_BROWSER_EXECUTABLE||undefined,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader']});
 let checks=0;
 try{
 for(const [name,width,height] of [['iphone',390,844],['ipad',820,1180],['desktop',1440,1000]]){
  const page=await browser.newPage(),errors=[];await page.setViewportSize({width,height});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1')?r.continue():r.abort());
  await page.goto('http://127.0.0.1:'+server.address().port);
  for(const tipo of ['reserva','boleto','reserva_alquiler','alquiler','comodato','exclusividad','refuerzo_reserva','devolucion_reserva']){
   await page.getByLabel('Documento de prueba').selectOption(tipo);
   await page.getByRole('button',{name:'Vista previa con datos de ejemplo',exact:true}).click();
   await page.getByText('EJEMPLO FICTICIO',{exact:false}).waitFor();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' '+tipo+' overflow');checks++;
   await page.getByRole('button',{name:'＋ Agregar cláusula',exact:true}).click();
   await page.locator('textarea').fill('Texto de prueba móvil.');
   await page.getByRole('button',{name:'Guardar cláusula',exact:true}).click();
   await page.locator('textarea').waitFor({state:'detached'});checks++;
   if(tipo==='boleto')await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
  }
  assert.deepEqual(errors,[]);checks++;await page.close();
 }
 console.log('APROBADAS',checks,'verificaciones Chromium en iPhone/iPad/escritorio emulados. Capturas:',out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
