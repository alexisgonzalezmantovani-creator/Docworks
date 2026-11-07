const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict');
const engine=process.argv.includes('--webkit')?'webkit':'chromium',root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-acceso-mobile-'));
const harness=`
import {createRoot} from 'react-dom/client';
window.DOCWORKS_CAPTCHA={enabled:true,sitekey:'sitekey-ficticia-sin-proveedor'};
window.turnstile={render:(el,opts)=>{const b=document.createElement('button');b.textContent='Resolver prueba simulada';b.onclick=()=>opts.callback('token-ficticio');el.append(b);return 'qa';},remove:()=>{}};
function Prueba(){const [vista,setVista]=useState(location.pathname),[msg,setMsg]=useState('');return <><GStyles/>{vista==='/restablecer'?<AuthPasswordSetupScreen onSave={()=>setMsg('Verificado')} mode="recovery"/>:vista==='/registro'?<RegistroScreen onBack={()=>setVista('/')} onSubmit={async()=>{await solicitarCaptcha();setMsg('Verificado');}}/>:<LoginScreen onRegister={()=>setVista('/registro')} onLogin={async()=>{await solicitarCaptcha();setMsg('Verificado');}} onRecover={async()=>{await solicitarCaptcha();return {ok:true};}}/>}<output>{msg}</output></>;}
createRoot(document.getElementById('root')).render(<Prueba/>);`;
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(root+'/src/App.tsx','utf8')+harness,resolveDir:root+'/src',loader:'tsx'},bundle:true,jsx:'automatic',format:'iife',outfile:tmp+'/app.js'});
const server=http.createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':'text/html');res.end(req.url==='/app.js'?fs.readFileSync(tmp+'/app.js'):'<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script src="/app.js"></script></body></html>');});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser,checks=0;
try{browser=await require('playwright')[engine].launch({headless:true,...(engine==='chromium'?{args:['--no-sandbox','--disable-dev-shm-usage']}: {})});const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')?r.continue():r.abort());
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:820,height:1180}]){
 await page.setViewportSize(viewport);
 for(const route of ['/','/registro','/restablecer']){await page.goto('http://127.0.0.1:'+server.address().port+route);await page.locator('form').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++;
 const submit=page.locator('button[type=submit]');await submit.scrollIntoViewIfNeeded();assert.ok(await submit.isVisible());checks++;
 if(route==='/restablecer'){await page.locator('input[name=new-password]').fill('Clave1234');await page.locator('input[name=confirm-password]').fill('Clave1234');await submit.click();await page.waitForFunction(()=>document.querySelector('output').textContent==='Verificado');checks++;continue;}
 if(route==='/'){await page.getByLabel('Correo electrónico',{exact:true}).fill('qa@example.invalid');await page.getByLabel('Contraseña',{exact:true}).fill('Clave1234');}else{await page.getByLabel('Nombre y apellido').fill('Prueba');await page.getByLabel('Inmobiliaria',{exact:true}).fill('Prueba');await page.getByLabel('Correo electrónico',{exact:true}).fill('qa@example.invalid');await page.getByLabel('Contraseña (8 caracteres, letras y números)').fill('Clave1234');}
 await submit.click();await page.getByRole('dialog',{name:'Verificación de seguridad'}).waitFor();assert.ok(await page.getByRole('button',{name:'Cancelar',exact:true}).isVisible());assert.ok(await page.evaluate(()=>{const r=document.querySelector('dialog').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));checks++;
 await page.getByRole('button',{name:'Resolver prueba simulada'}).click();await page.waitForFunction(()=>document.querySelector('output').textContent==='Verificado');checks++;
 }
 console.log('OK '+engine+' acceso '+viewport.width+'x'+viewport.height+': registro, scroll, CAPTCHA simulado y retorno');
}
console.log('APROBADAS '+checks+' verificaciones de acceso móvil; proveedor y dispositivo simulados.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
