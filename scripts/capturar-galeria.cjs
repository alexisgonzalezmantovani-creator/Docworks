// Captura componentes reales con datos ficticios, sin cuentas ni backend.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-galeria-')),out=path.resolve(process.env.DOCWORKS_GALLERY_OUTPUT||'gallery-results');fs.mkdirSync(out,{recursive:true});
const harness=`
import {createRoot} from 'react-dom/client';
window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}})},rpc:async()=>({data:null})})};
const perfil={rol:'dueno',nombre:'Inmobiliaria de ejemplo',matricula:'Matrícula de ejemplo',plantillas:crearPlantillasIniciales()};
const base={...EMPTY_OP,...SAMPLE_OP_PREVIEW,id:'ejemplo-reserva',tipo:'reserva',estado:'activo',created_at:'2026-11-07T12:00:00Z',comprador_nombre:'Comprador de ejemplo',vendedor_nombre:'Vendedor de ejemplo',inmueble_direccion:'Calle de Ejemplo 123',reserva_vigencia_dias:'30',reserva_aceptacion_dias:'5',reserva_aceptacion_modo:'dias',clausulas_custom:'',comprador_email:'comprador@example.invalid',vendedor_email:'vendedor@example.invalid'};
const ops=[base,{...base,id:'ejemplo-alquiler',tipo:'alquiler',inmueble_direccion:'Departamento de ejemplo · Pilar',locador_nombre:'Locador de ejemplo',locatario_nombre:'Locatario de ejemplo'},{...base,id:'ejemplo-exclusividad',tipo:'exclusividad',inmueble_direccion:'Casa de ejemplo · Manzanares'}];
function Galeria(){const [tab,setTab]=useState('reserva');const screen=location.pathname;
return <><GStyles/><style>{MOBILE_STABILITY_CSS}</style><div className="app-wrap"><header style={{position:'fixed',top:0,left:0,right:0,zIndex:400,height:68,background:'#142a4d',padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',color:'white'}}><strong style={{fontSize:24,fontFamily:'DM Serif Display,serif'}}>DocWorks<span style={{color:'#d4a853'}}>.</span></strong><span style={{fontSize:13}}>Inmobiliaria de ejemplo</span></header><main className={screen==='/formulario'?'dw-operation-page':undefined} style={{padding:28,maxWidth:1320,margin:'auto',width:'100%',boxSizing:'border-box'}}>{screen==='/operaciones'?<><DashboardView usuarioActual={{id:'ejemplo',rol_base:'dueno'}} operaciones={ops} clausulas={[]} perfil={perfil} bloquesReserva={[]} papelera={[]} onNew={()=>{}} onEdit={()=>{}} onViewDoc={()=>{}} onDelete={()=>{}}/></>:screen==='/formulario'?<><h1 style={{fontSize:28,margin:'0 0 20px'}}>Reserva de compra</h1><OperacionForm initial={base} perfil={perfil} clausulas={CLAUSULAS_DEFAULT} bloquesReserva={DEFAULT_BLOQUES_RESERVA} equipo={[]} operaciones={ops} saveStatus={{state:'saved'}} reportSave={()=>{}} onCancel={()=>{}} onSave={async()=>({})}/></>:<Modal open wide viewerMode onClose={()=>{}} title={<OperationViewerHeading op={base}/>} headerRight={<DocumentHeaderActions onEdit={()=>{}} onShare={()=>{}} onPDF={()=>{}} onDOCX={()=>{}}/>}><DocumentViewer op={base} operaciones={ops} perfil={perfil} clausulas={CLAUSULAS_DEFAULT} bloquesReserva={DEFAULT_BLOQUES_RESERVA} tab={tab} onChangeTab={setTab}/></Modal>}</main></div></>;
}
createRoot(document.getElementById('root')).render(<Galeria/>);`;
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(root+'/src/App.tsx','utf8')+harness,resolveDir:root+'/src',loader:'tsx'},bundle:true,jsx:'automatic',format:'iife',outfile:tmp+'/app.js'});
const server=http.createServer((req,res)=>{if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(tmp+'/app.js'));}else if(req.url.startsWith('/fonts/')){const target=path.join(root,'public',req.url);if(fs.existsSync(target)){res.setHeader('Content-Type','font/woff2');res.end(fs.readFileSync(target));}else{res.statusCode=404;res.end();}}else{res.setHeader('Content-Type','text/html');res.end('<html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script src="/app.js"></script></body></html>');}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{browser=await require('playwright').chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:1360,height:920},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')?r.continue():r.abort());
for(const screen of ['operaciones','formulario','documento']){await page.goto('http://127.0.0.1:'+server.address().port+'/'+screen);await page.getByText('Inmobiliaria de ejemplo',{exact:true}).first().waitFor();if(screen==='operaciones')await page.getByText(/Calle de Ejemplo 123/).first().waitFor();if(screen==='formulario'){await page.locator('.step-dot').nth(1).click();await page.getByText('Comprador',{exact:true}).first().waitFor();}if(screen==='documento')await page.locator('.pdf-text').waitFor();await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:out+'/'+screen+'.png',animations:'disabled'});console.log('OK captura real de '+screen+' con datos ficticios');}
// Visor REAL de DocWorks a tamaño iPhone: comprobar el documento, no un div de prueba.
await page.setViewportSize({width:390,height:844});
await page.goto('http://127.0.0.1:'+server.address().port+'/documento');
await page.locator('.viewer-modal .doc-reading-scroll .pdf-text').waitFor();
await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:out+'/documento-iphone-inicio.png',animations:'disabled'});
const mobileReading=await page.evaluate(()=>{
 const modal=document.querySelector('.viewer-modal'),lector=modal?.querySelector('.doc-reading-scroll'),contenido=lector?.querySelector('.pdf-content'),barra=lector?.querySelector('.pdf-chrome'),last=contenido?.querySelector('.pdf-text')?.lastElementChild,cuerpo=modal?.querySelector('.modal-body');
 if(!modal||!lector||!contenido||!barra||!last||!cuerpo)return {error:'No se encontró la estructura real completa del documento'};
 const puedeScroll=lector.scrollHeight>lector.clientHeight+20;
 lector.scrollTop=lector.scrollHeight;
 const rectL=lector.getBoundingClientRect(),rectLast=last.getBoundingClientRect();
 return {
  barra:getComputedStyle(barra).display,
  paddingPie:parseFloat(getComputedStyle(cuerpo).paddingBottom),
  overflowLector:getComputedStyle(lector).overflowY,
  segundoScroll:contenido.scrollHeight>contenido.clientHeight+2,
  puedeScroll,
  ultimaVisible:rectLast.top>=rectL.top-2&&rectLast.bottom<=rectL.bottom-2,
  distanciaFinal:Math.round(rectL.bottom-rectLast.bottom),
  scrollTop:lector.scrollTop,
  total:lector.scrollHeight,visible:lector.clientHeight
 };
});
assert.ok(!mobileReading.error,'Visor iPhone real: '+JSON.stringify(mobileReading));
assert.equal(mobileReading.barra,'none','Visor iPhone real: barra con puntos no superpuesta');
assert.equal(mobileReading.paddingPie,0,'Visor iPhone real: sin franja blanca fija en el pie');
assert.equal(mobileReading.overflowLector,'auto','Visor iPhone real: desplazamiento exterior');
assert.equal(mobileReading.segundoScroll,false,'Visor iPhone real: hoja sin scroll anidado');
assert.ok(mobileReading.puedeScroll,'Visor iPhone real: documento largo desplaza');
assert.equal(mobileReading.ultimaVisible,true,'Visor iPhone real: última cláusula completamente visible al final, '+JSON.stringify(mobileReading));
assert.ok(mobileReading.distanciaFinal>=8,'Visor iPhone real: margen inferior para leer');
await page.screenshot({path:out+'/documento-iphone-final.png',animations:'disabled'});
console.log('OK visor REAL iPhone 390x844, sin barra superpuesta y última cláusula visible',mobileReading);
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/origen.json',JSON.stringify({version:'6.37',commit:process.env.GITHUB_SHA||null,datos:'Ficticios, sin backend',componentes:['DashboardView','OperacionForm','DocumentViewer']},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
