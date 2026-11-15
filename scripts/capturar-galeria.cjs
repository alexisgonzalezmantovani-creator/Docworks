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
return <><GStyles/><style>{MOBILE_STABILITY_CSS}</style><div className="app-wrap"><header style={{position:'fixed',top:0,left:0,right:0,zIndex:400,height:68,background:'#142a4d',padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',color:'white'}}><strong style={{fontSize:24,fontFamily:'DM Serif Display,serif'}}>DocWorks<span style={{color:'#d4a853'}}>.</span></strong><span style={{fontSize:13}}>Inmobiliaria de ejemplo</span></header><main className={screen==='/formulario'?'dw-operation-page':undefined} style={{padding:28,maxWidth:1320,margin:'auto',width:'100%',boxSizing:'border-box'}}>{screen==='/operaciones'?<><DashboardView usuarioActual={{id:'ejemplo',rol_base:'dueno'}} operaciones={ops} clausulas={[]} perfil={perfil} bloquesReserva={[]} papelera={[]} onNew={()=>{}} onEdit={()=>{}} onViewDoc={()=>{}} onDelete={()=>{}}/></>:screen==='/formulario'?<><h1 style={{fontSize:28,margin:'0 0 20px'}}>Reserva de compra</h1><OperacionForm initial={base} perfil={perfil} clausulas={CLAUSULAS_DEFAULT} bloquesReserva={DEFAULT_BLOQUES_RESERVA} equipo={[]} operaciones={ops} saveStatus={{state:'saved'}} reportSave={()=>{}} onCancel={()=>{}} onSave={async()=>({})}/></>:<Modal open wide viewerMode onClose={()=>{}} title={<OperationViewerHeading op={base}/>} headerRight={<DocumentHeaderActions onEdit={()=>{}} onShare={()=>{}} onPDF={()=>{}} onDOCX={()=>{}}/>}><DocumentViewer op={base} operaciones={ops} perfil={perfil} clausulas={CLAUSULAS_DEFAULT} bloquesReserva={DEFAULT_BLOQUES_RESERVA} onUpdateOperation={async()=>({})} tab={tab} onChangeTab={setTab}/></Modal>}</main></div></>;
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
 const modal=document.querySelector('.viewer-modal'),marco=modal?.querySelector('.doc-reading-scroll'),hoja=marco?.querySelector('.pdf-content'),barra=marco?.querySelector('.pdf-chrome'),last=hoja?.querySelector('.pdf-text')?.lastElementChild;
 if(!modal||!marco||!hoja||!barra||!last)return {error:'Falta estructura real del visor'};
 const puedeScroll=hoja.scrollHeight>hoja.clientHeight+20;
 hoja.scrollTop=hoja.scrollHeight;
 const rc=hoja.getBoundingClientRect(),rf=last.getBoundingClientRect();
 return {barra:getComputedStyle(barra).display,borde:getComputedStyle(marco).borderBottomWidth,redondeo:parseFloat(getComputedStyle(marco).borderBottomLeftRadius),overflowMarco:getComputedStyle(marco).overflowY,overflowHoja:getComputedStyle(hoja).overflowY,puedeScroll,ultimoVisible:rf.top>=rc.top-2&&rf.bottom<=rc.bottom+2,margenFinal:Math.round(rc.bottom-rf.bottom),scrollTop:hoja.scrollTop};
});
assert.ok(!mobileReading.error,'Estructura iPhone: '+JSON.stringify(mobileReading));
assert.equal(mobileReading.barra,'none','No debe aparecer la barra Mac');
assert.ok(mobileReading.redondeo>=12,'La ventanita debe terminar redondeada abajo');
assert.equal(mobileReading.overflowMarco,'hidden','El marco no debe ser un scroll adicional');
assert.equal(mobileReading.overflowHoja,'auto','Scroll sólo dentro de la hoja');
assert.ok(mobileReading.puedeScroll&&mobileReading.scrollTop>0,'Se puede leer el documento hacia abajo');
assert.equal(mobileReading.ultimoVisible,true,'La última línea debe ser legible: '+JSON.stringify(mobileReading));
assert.ok(mobileReading.margenFinal>=12,'Margen inferior antes del borde');
await page.screenshot({path:out+'/documento-iphone-final.png',animations:'disabled'});
const ajustes=page.getByTestId('dw-ajustes-manuales');
assert.equal(await ajustes.count(),1,'Ajustes manuales visibles en un documento con modelo');
await ajustes.locator('summary').click();
const cantidad=await ajustes.getByRole('button',{name:'Editar',exact:true}).count();
assert.ok(cantidad>=2,'Ajustes deben mostrar las cláusulas del modelo, no sólo la primera');
const listado=await ajustes.evaluate(el=>{const antes=el.scrollTop;el.scrollTop=el.scrollHeight;return {puede:el.scrollHeight>el.clientHeight+10,despues:el.scrollTop,antes};});
assert.ok(listado.puede&&listado.despues>listado.antes,'La lista de ajustes tiene scroll al abrirla');
await ajustes.getByRole('button',{name:'Editar',exact:true}).first().click();
const chips=await ajustes.locator('[data-testid="dw-ajuste-chip"]').allTextContents();
assert.ok(chips.length>0,'Los campos insertados tienen chips protegidos');
assert.ok(chips.some(s=>/Precio en letras|Moneda/i.test(s)),'El precio se muestra como chip con nombre legible: '+chips.join(', '));
const textos=await ajustes.locator('textarea').evaluateAll(elements=>elements.map(el=>el.value));
assert.ok(textos.every(s=>!s.includes('{{precio_letras}}')&&!/\[\s*precio en letras\s*\]/i.test(s)),'El precio automático no aparece como texto editable entre corchetes');
await page.screenshot({path:out+'/documento-iphone-ajustes.png',animations:'disabled'});
console.log('OK iPhone real: recuadro con scroll propio, margen inferior, '+cantidad+' cláusulas y chips de precio',mobileReading);
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/origen.json',JSON.stringify({version:'6.37',commit:process.env.GITHUB_SHA||null,datos:'Ficticios, sin backend',componentes:['DashboardView','OperacionForm','DocumentViewer']},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
