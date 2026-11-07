const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-captcha-'));
require('esbuild').buildSync({entryPoints:[root+'/src/Captcha.ts',root+'/src/AccesoCuenta.ts',root+'/src/Analitica.tsx'],bundle:true,platform:'node',format:'cjs',outdir:tmp,jsx:'automatic'});
const dom=new JSDOM('<button id="before">Antes</button>',{url:'https://example.test/',runScripts:'outside-only'});global.window=dom.window;global.document=window.document;
window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
const {solicitarCaptcha}=require(tmp+'/Captcha.js'),{crearAccesoCuenta}=require(tmp+'/AccesoCuenta.js'),{limpiarEventoVisita}=require(tmp+'/Analitica.js');
let count=0;const check=(name,fn)=>{fn();count++;console.log('OK',name);};
(async()=>{
 check('analítica descarta tokens, IDs y eventos arbitrarios',()=>{assert.deepEqual(limpiarEventoVisita({type:'pageview',url:'https://example.test/operacion/privada?email=privado#access_token=secreto'}),{type:'pageview',url:'https://example.test/'});assert.equal(limpiarEventoVisita({type:'event',url:'https://example.test/'}),null);assert.equal(limpiarEventoVisita({type:'pageview',url:'invalida'}),null);});
 assert.equal(await solicitarCaptcha(),undefined);check('apagado no carga proveedor',()=>assert.equal(document.querySelectorAll('script').length,0));
 window.DOCWORKS_CAPTCHA={enabled:true,sitekey:''};await assert.rejects(solicitarCaptcha(),/No se pudo iniciar/);check('configuración incompleta falla cerrada',()=>assert.equal(document.querySelectorAll('dialog').length,0));
 window.DOCWORKS_CAPTCHA.sitekey='sitekey-real-de-prueba';let opts,removed=0;
 window.turnstile={render:(el,options)=>{opts=options;return 'widget';},remove:()=>removed++};
 const tick=()=>new Promise(r=>setImmediate(r));document.querySelector('#before').focus();
 let promise=solicitarCaptcha();await tick();await assert.rejects(solicitarCaptcha(),/ya está en curso/);
 check('se bloquea desafío simultáneo',()=>assert.equal(document.querySelectorAll('dialog').length,1));
 opts.callback('token-uno');assert.equal(await promise,'token-uno');check('token único limpia widget y restaura foco',()=>{assert.equal(removed,1);assert.equal(document.querySelector('dialog'),null);assert.equal(document.activeElement.id,'before');assert.equal(window.localStorage.length,0);});
 promise=solicitarCaptcha();await tick();opts.callback('token-dos');assert.equal(await promise,'token-dos');check('cada solicitud obtiene otro token',()=>assert.equal(removed,2));
 for(const action of ['cancel','error-callback','expired-callback','timeout-callback']){
  promise=solicitarCaptcha();await tick();const rejected=assert.rejects(promise,/verificación/);
  if(action==='cancel')document.querySelector('dialog button').click();else opts[action]();await rejected;
  check(action+' cancela y permite reintentar',()=>assert.equal(document.querySelector('dialog'),null));
 }
 let requests=0,args;
 const access=crearAccesoCuenta({origin:'https://example.test',clipboard:null,loadClient:async()=>({auth:{resetPasswordForEmail:async(...a)=>{requests++;args=a;return {};}}})});
 promise=access.recuperar('qa@example.invalid');await tick();check('reset administrativo espera verificación',()=>assert.equal(requests,0));document.querySelector('dialog button').click();assert.ok((await promise).error);assert.equal(requests,0);
 promise=access.recuperar('qa@example.invalid');await tick();opts.callback('token-reset');assert.ok((await promise).data);check('reset administrativo transmite token al servidor',()=>{assert.equal(requests,1);assert.equal(args[1].captchaToken,'token-reset');});
 dom.window.eval(fs.readFileSync(root+'/landing/analytics.js','utf8'));dom.window.close();fs.rmSync(tmp,{recursive:true,force:true});console.log('APROBADAS '+count+' pruebas de CAPTCHA y privacidad sin solicitudes externas.');
})().catch(e=>{console.error(e);process.exitCode=1;});
