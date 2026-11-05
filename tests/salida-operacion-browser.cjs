const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),ts=require('typescript'),os=require('node:os');
const dir=path.resolve(__dirname,'..'),out=process.env.DOCWORKS_BROWSER_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'dw-salida-'));fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(dir+'/src/App.tsx','utf8');assert.ok(!source.includes('className="ia-fab"'));const parsed=ts.createSourceFile('App.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),fns={};
function walk(n){if(ts.isFunctionDeclaration(n)&&n.name)fns[n.name.text]=n.getText(parsed);ts.forEachChild(n,walk)}walk(parsed);
const handlers=['borradorFormularioActual','cancelarSalidaFormulario','continuarOperacionDespues','abrirNuevaOperacion','navegarPrincipal','cerrarFormularioSeguro','guardarBorradorYSalir','salirSinGuardarFormulario'];
const section=source.slice(source.indexOf('<section className="dw-operation-page"'),source.indexOf('</section>',source.indexOf('<section className="dw-operation-page"'))+10);
const nav=source.slice(source.indexOf('<nav className="mobile-nav">'),source.indexOf('</nav>',source.indexOf('<nav className="mobile-nav">'))+6);
const fab=source.split('\n').find(l=>l.includes('<button type="button" className="fab"')).trim();
const confirm=source.slice(source.indexOf('<ConfirmModal open={confirmCloseForm}'),source.indexOf('</ConfirmModal>',source.indexOf('<ConfirmModal open={confirmCloseForm}'))+15);
const recovery=source.slice(source.indexOf('<ConfirmModal\n        open={!!draftPrompt}'),source.indexOf('\n      />',source.indexOf('<ConfirmModal\n        open={!!draftPrompt}'))+9);
const harness=`
import {createRoot} from 'react-dom/client';
function SalidaHarness(){
 const docworksAuth={contexto:{usuario:{id:'qa',rol_base:'dueno'},inmobiliaria:{id:'qa'},habilitado:true}};
 const [ayuda,setAyuda]=useState(false),[bot,setBot]=useState(false);
 const [showForm,setShowForm]=useState(false),[view,setView]=useState('dashboard'),[editOp,setEditOp]=useState(null),[formInitialOverride,setFormInitialOverride]=useState(null),[formTipo,setFormTipo]=useState(null),[formFocusCampo,setFormFocusCampo]=useState(null),[confirmCloseForm,setConfirmCloseForm]=useState(false),[navPendiente,setNavPendiente]=useState(null),[operaciones,setOperaciones]=useState([]),[guardandoSalida,setGuardandoSalida]=useState(false),[errorSalida,setErrorSalida]=useState(''),[draftPrompt,setDraftPrompt]=useState(null),[mode,setMode]=useState('ok'),[calls,setCalls]=useState(0);
 const formSnapshotRef=useRef(null),formSaveIdRef=useRef(null),salidaEnCursoRef=useRef(false),salidaRevisionRef=useRef(0),accionesContextoRef=useRef(crearControlContextoOperaciones(claveContextoOperaciones(docworksAuth.contexto))),resolver=useRef(null);
 useEffect(()=>{if(!showForm)formSaveIdRef.current=null;},[showForm]);
 useOperationPageScroll(showForm);
 const perfil={rol:'dueno',nombre:'Ejemplo',plantillas:{}},clausulas=[],equipo=[],saveStatus={state:"saved",ts:1},reportSave=()=>{},addClausula=()=>{},saveOp=()=>{},viewDoc=null,dwConfirm=null,ctx=docworksAuth.contexto;
 const marcarOperacionPendiente=()=>{},desmarcarOperacionPendiente=()=>{};
 const opsSupabase={guardar:async op=>{setCalls(n=>n+1);if(mode==='error')return {error:{message:'Sin conexión de prueba'}};if(mode==='lento')return new Promise(r=>resolver.current=()=>r({data:op}));return {data:op};}};
 const mobileNavItems=[{id:'dashboard',label:'Operaciones'},{id:'calendario',label:'Calendario'}];
 ${handlers.map(n=>fns[n]).join('\n')}
 return <><GStyles/><style>{MOBILE_STABILITY_CSS}</style><div className="app-wrap"><header className="mobile-topbar">DocWorks</header><MenuAyudaDocWorks abierto={ayuda} onToggle={()=>setAyuda(v=>!v)} onCerrar={()=>setAyuda(false)} onPreparar={()=>{}} onClausulas={()=>navegarPrincipal('clausulas')} onCentro={()=>{}} onIA={()=>setBot(true)} movil/>{bot&&<BotIA onClose={()=>setBot(false)}/>}<aside><button onClick={abrirNuevaOperacion}>Crear operación de prueba</button><button onClick={()=>setMode('error')}>Simular error</button><button onClick={()=>setMode('lento')}>Simular demora</button><button onClick={()=>resolver.current?.()}>Resolver demora</button><output data-testid="calls">{calls}</output></aside><main className="main"><div className="content dw-operation-page-content">{showForm?${section}:<div style={{minHeight:1800}}><h1>{view==='dashboard'?'Operaciones de prueba':'Calendario de prueba'}</h1></div>}</div></main>${fab}{!showForm&&${nav}}${confirm}${recovery}</div></>;
}
function DocumentosVinculadosHarness(){
 const [resultado,setResultado]=useState('');
 const ops=['reserva','reserva_alquiler'].map((tipo,i)=>({...EMPTY_OP,...SAMPLE_OP_PREVIEW,id:'ejemplo-'+i,tipo,estado:'activo',inmueble_direccion:'Inmueble ficticio '+i,created_at:'2026-11-04T12:00:00Z'}));
 return <><GStyles/><style>{MOBILE_STABILITY_CSS}</style><header style={{position:'fixed',top:0,left:0,right:0,zIndex:500,height:56,background:'#142a4d',color:'white'}}>Barra superior de prueba</header><output data-testid="conversion">{resultado}</output><div style={{transform:'translateZ(0)',padding:12}}><div style={{height:900}}>Contenido de prueba antes de las operaciones</div><DashboardView usuarioActual={{id:'qa',rol_base:'dueno'}} operaciones={ops} clausulas={[]} perfil={{rol:'dueno'}} bloquesReserva={[]} papelera={[]} onNew={()=>{}} onEdit={()=>setResultado('abrir')} onViewDoc={()=>setResultado('ver')} onDelete={()=>{}} onConvertir={()=>setResultado('alquiler')} onConvertirBoleto={()=>setResultado('boleto')} onConvertirComodato={()=>setResultado('comodato')} onConvertirRefuerzo={()=>setResultado('refuerzo')} onConvertirDevolucion={()=>setResultado('devolucion')}/></div></>;
}
function ViewerHeaderHarness(){
 const [abierto,setAbierto]=useState(true),[accion,setAccion]=useState('');
 return <><GStyles/><style>{MOBILE_STABILITY_CSS}</style><output data-testid="accion-visormovil">{accion}</output><Modal open={abierto} onClose={()=>setAbierto(false)} title={<span className="dw-viewer-heading"><span className="dw-viewer-heading-type">Reserva de Alquiler</span><span className="dw-viewer-heading-operation">Operación ficticia · Departamento de ejemplo en Pilar</span></span>} wide viewerMode headerRight={<DocumentHeaderActions onEdit={()=>{setAccion('editar');setAbierto(false);}} onShare={()=>setAccion('compartir')} onPDF={()=>setAccion('pdf')} onDOCX={()=>setAccion('docx')}/>}><div style={{padding:20}}>Documento ficticio para revisar los controles del encabezado.</div></Modal></>;
}
createRoot(document.getElementById('root')).render(new URLSearchParams(location.search).has('viewer')?<ViewerHeaderHarness/>:new URLSearchParams(location.search).has('docs')?<DocumentosVinculadosHarness/>:<SalidaHarness/>);
`;
require('esbuild').buildSync({stdin:{contents:source+harness,resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',format:'iife',outfile:out+'/qa.js'});
const server=http.createServer((req,res)=>{if(req.url==='/fonts/dm-sans-latin.woff2'){res.setHeader('Content-Type','font/woff2');res.end(fs.readFileSync(path.join(dir,'public/fonts/dm-sans-latin.woff2')));}else if(req.url==='/qa.js'){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(out+'/qa.js'));}else{res.setHeader('Content-Type','text/html');res.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script src="/qa.js"></script></body></html>')}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const engine=process.argv.includes('--webkit')?'webkit':'chromium';const browser=await require('playwright')[engine].launchPersistentContext(path.join(out,'profile'),{headless:true,hasTouch:true,...(engine==='chromium'?{executablePath:process.env.DOCWORKS_BROWSER_EXECUTABLE,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader']}: {})});let checks=0;
try{for(const [width,height] of [[320,694],[390,844],[430,932],[820,1180],[1440,1000]]){const page=await browser.newPage(),errors=[];await page.setViewportSize({width,height});page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')?r.continue():r.abort());page.setDefaultTimeout(8000);const url='http://127.0.0.1:'+server.address().port;
const fresh=async()=>{await page.goto(url);await page.evaluate(()=>localStorage.clear());};const add=()=>width<760?page.locator('.fab').click():page.getByRole('button',{name:'Crear operación de prueba',exact:true}).click();const navOp=()=>page.locator('.mobile-nav').getByRole('button',{name:'Operaciones',exact:true}).click();
const open=async()=>{await add();await page.locator('.dw-grupo-alquiler').click();};
const selectStep=n=>page.locator('.step-dot').nth(n-1).click();
await fresh();assert.ok(await page.evaluate(async()=>{await document.fonts.load('15px "DM Sans"');return document.fonts.check('15px "DM Sans"')&&getComputedStyle(document.body).fontSize==='15px';}));checks++;await page.getByRole('button',{name:'Ayuda',exact:true}).click();await page.getByRole('menuitem',{name:'Asistente IA',exact:true}).click();await page.getByRole('button',{name:'Cerrar asistente',exact:true}).click();assert.equal(await page.getByRole('menu',{name:'Ayuda',exact:true}).count(),0);checks++;if(width<640){await page.evaluate(()=>window.scrollTo({top:400,behavior:'instant'}));assert.ok(await page.locator('.fab').evaluate(el=>{const r=el.getBoundingClientRect();return getComputedStyle(el).opacity!=='0'&&r.bottom<=innerHeight&&r.top>=0;}));checks++;}
await add();assert.equal(await page.locator('.fab').count(),0);checks++;await page.getByRole('button',{name:'Volver a operaciones',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Operaciones de prueba'}).isVisible());checks++;
await open();await selectStep(2);await page.locator('#dw-field-locatario_nombre').fill('Nombre de prueba');
assert.equal(await page.locator('.mobile-nav').count(),0);checks++;
assert.equal(await page.getByText('Se detecta automáticamente',{exact:false}).count(),0);assert.equal(await page.getByText('Dato interno de la operación.',{exact:true}).count(),0);checks++;
assert.ok(await page.locator('.dw-identificacion-heading').evaluate(el=>el.getBoundingClientRect().bottom<=el.parentElement.querySelector('input').getBoundingClientRect().top));checks++;
await page.screenshot({path:out+'/identificacion-'+width+'.png',fullPage:true});
await page.evaluate(()=>window.scrollTo({top:300,behavior:'instant'}));
assert.ok(await page.locator('.dw-operation-save-floating').evaluate(el=>el.parentElement===document.body&&getComputedStyle(el).position==='fixed'&&el.getBoundingClientRect().bottom<=innerHeight));checks++;
await page.getByRole('button',{name:'Volver a operaciones',exact:true}).click();
await page.getByRole('dialog',{name:'Salir de la operación'}).waitFor();assert.equal(await page.locator('.fab').count(),0);checks++;
await page.getByRole('button',{name:'Seguir editando',exact:true}).click();assert.equal((await page.locator('#dw-field-locatario_nombre').inputValue()).toLowerCase(),'nombre de prueba');checks++;
await selectStep(5);await page.locator('#dw-field-res_alq_dia_pago').selectOption('1-10');await page.getByRole('button',{name:'Volver a operaciones',exact:true}).click();
await page.getByRole('button',{name:'Volver a Operaciones y continuar después',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Operaciones de prueba'}).isVisible());checks++;
await page.waitForFunction(()=>window.scrollY===0&&!document.documentElement.classList.contains('dw-modal-open'));assert.equal(await page.locator('.dw-operation-save-floating').count(),0);checks++;
if(width<640){assert.ok(await page.locator('.mobile-topbar').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<1&&el.getBoundingClientRect().bottom<100));checks++;}

await add();await page.getByRole('button',{name:'Continuar editando',exact:true}).click();await selectStep(5);assert.equal(await page.locator('#dw-field-res_alq_dia_pago').inputValue(),'1-10');checks++;
await page.getByRole('button',{name:'Volver a operaciones',exact:true}).click();await page.getByRole('button',{name:'Salir sin guardar',exact:true}).click();assert.equal(await page.locator('.fab').count(),1);checks++;
await open();await selectStep(2);await page.locator('#dw-field-locatario_nombre').fill('Borrador con fallo de prueba');await page.getByRole('button',{name:'Simular error',exact:true}).click();await page.getByRole('button',{name:'Volver a operaciones',exact:true}).click();await page.getByRole('button',{name:'Guardar borrador',exact:true}).click();await page.getByRole('alert').waitFor();await page.getByRole('button',{name:'Volver a Operaciones y continuar después',exact:true}).click();checks++;
await fresh();await page.getByRole('button',{name:'Simular demora',exact:true}).click();await open();await selectStep(2);await page.locator('#dw-field-locatario_nombre').fill('Borrador con demora de prueba');await page.getByRole('button',{name:'Volver a operaciones',exact:true}).click();await page.getByRole('button',{name:'Guardar borrador',exact:true}).dblclick();assert.equal(await page.getByTestId('calls').textContent(),'1');checks++;
await page.getByRole('button',{name:'Volver a Operaciones y continuar después',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Operaciones de prueba'}).isVisible());checks++;
await add();await page.getByRole('button',{name:'Continuar editando',exact:true}).click();await page.getByRole('button',{name:'Resolver demora',exact:true}).click();assert.equal(await page.locator('.dw-operation-page').count(),1);checks++;
await fresh();await open();await page.locator('.dw-grupo-tipo-card').filter({hasText:'Contrato de Alquiler'}).click();await selectStep(5);
assert.equal(await page.locator('.dw-operation-next-action .btn').evaluate(el=>getComputedStyle(el).fontSize),'12.5px');checks++;const dias=page.locator('#dw-field-alquiler_plazo_dias');await dias.fill('');assert.equal(await dias.inputValue(),'');checks++;await dias.pressSequentially('10');assert.equal(await dias.inputValue(),'10');checks++;await dias.fill('010');await page.locator('#dw-field-alquiler_plazo_meses').click();assert.equal(await dias.inputValue(),'10');checks++;
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++;
await page.screenshot({path:out+'/formulario-'+width+'.png',fullPage:true});await page.locator('.dw-operation-form-footer').screenshot({path:out+'/guardado-'+width+'.png'});assert.deepEqual(errors,[]);checks++;console.log('OK '+engine+' '+width+'px: menú, cierre, recuperación, error, espera y botón +');await page.goto(url+'/?docs=1');await page.evaluate(()=>localStorage.clear());
await page.getByRole('button',{name:'Vista de tabla',exact:true}).click();
assert.ok(await page.locator('.op-table-wrap').evaluate(el=>el.scrollWidth<=el.clientWidth+1||innerWidth>640));checks++;
assert.equal(await page.locator('.op-table tbody tr').count(),2);checks++;
await page.locator('.op-table-wrap').screenshot({path:out+'/tabla-'+width+'.png'});
if(width<640){assert.ok(await page.locator('.op-table td:nth-child(3)').first().evaluate(el=>getComputedStyle(el).display==='none'));checks++;}
await page.locator('.op-table').getByRole('button',{name:'Abrir',exact:true}).first().click();assert.equal(await page.getByTestId('conversion').textContent(),'ver');checks++;
await page.getByRole('button',{name:'Vista de tarjetas',exact:true}).click();
await page.locator('.dw-dashboard-root').getByRole('button',{name:'Agregar documento',exact:true}).first().click();
const dialog=page.getByRole('dialog',{name:'Documentos de esta operación',exact:true});await dialog.waitFor();
assert.ok(await dialog.evaluate(el=>el.parentElement===document.body));checks++;
const cierre=dialog.getByRole('button',{name:'Cerrar',exact:true});assert.ok(await cierre.isVisible());assert.ok(await cierre.evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));}));checks++;
await dialog.locator('.modal-body').evaluate(el=>el.scrollTop=el.scrollHeight);await cierre.click();await dialog.waitFor({state:'detached'});checks++;
await page.locator('.dw-dashboard-root').getByRole('button',{name:'Agregar documento',exact:true}).last().click();await dialog.getByRole('button',{name:'Crear',exact:true}).click();assert.equal(await page.getByTestId('conversion').textContent(),'alquiler');checks++;
await page.goto(url+'/?viewer=1');const editar=page.getByRole('button',{name:'Editar',exact:true});await editar.waitFor();assert.ok(await editar.locator('span').isVisible());checks++;
assert.ok(await editar.evaluate(el=>{const r=el.getBoundingClientRect();return r.width>=60&&r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));}));checks++;
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++;
await page.getByRole('button',{name:'Compartir',exact:true}).click();assert.equal(await page.getByTestId('accion-visormovil').textContent(),'compartir');checks++;
await page.getByRole('button',{name:/Descargar/}).click();await page.getByRole('menuitem',{name:/PDF/}).click();assert.equal(await page.getByTestId('accion-visormovil').textContent(),'pdf');checks++;
await page.locator('.modal-head').screenshot({path:out+'/editar-'+width+'.png'});await editar.click();assert.equal(await page.getByTestId('accion-visormovil').textContent(),'editar');assert.equal(await page.getByRole('dialog').count(),0);checks++;

await page.close();}
console.log('APROBADAS '+checks+' verificaciones de salida y reserva de alquiler.');}finally{await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
