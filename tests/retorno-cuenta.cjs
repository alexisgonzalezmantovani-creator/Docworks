const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const rootDir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-retorno-'));
const dom=new JSDOM('<div id="root"></div>',{url:'https://docworks-eight.vercel.app/'});
for(const k of ['window','document','HTMLElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];global.IS_REACT_ACT_ENVIRONMENT=true;
let listener,initial,contexts=[],dashboards=[],rpcCalls=0;
const session=id=>id?{user:{id}}:null;
const sb={auth:{getSession:()=>initial?initial.promise:Promise.resolve({data:{session:session('a')}}),onAuthStateChange:fn=>{listener=fn;return {data:{subscription:{unsubscribe(){}}}};},signOut:async()=>({})},rpc:name=>{rpcCalls++;if(name==='fn_autoprovisionar_usuario_actual')return Promise.resolve({});return new Promise((resolve,reject)=>(name==='fn_super_dashboard'?dashboards:contexts).push({resolve,reject}));}};
window.supabase={createClient:()=>sb};
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(rootDir+'/src/App.tsx','utf8')+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,useDocWorksSession,accionEnlaceCuenta,errorEnlaceCuenta,urlSinCredenciales};',resolveDir:rootDir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/app.cjs'});
const app=require(tmp+'/app.cjs');let api,n=0;const check=(label,fn)=>{fn();n++;console.log('OK',label);};let root;
function Harness(){api=app.useDocWorksSession();return null;}
const ctx=(id,extra={})=>({usuario:{id},inmobiliaria:{id:'tenant-'+id},...extra});
const act=app.act;
const emit=(event,id)=>act(async()=>listener(event,session(id)));
const resolveContext=(index,id,extra={})=>act(async()=>contexts[index].resolve({data:ctx(id,extra)}));
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
async function mount(){root=app.createRoot(document.getElementById('root'));await act(async()=>root.render(app.createElement(Harness)));}
(async()=>{
 check('acciones de correo se detectan sin aceptar errores',()=>{assert.equal(app.accionEnlaceCuenta('https://example.test/#access_token=a&type=recovery'),'recovery');assert.equal(app.accionEnlaceCuenta('https://example.test/?type=invite'),'invite');assert.equal(app.accionEnlaceCuenta('https://example.test/?type=recovery&error=access_denied'),null);assert.equal(app.accionEnlaceCuenta('https://example.test/#type=otro'),null);});
 check('limpieza conserva navegación y elimina todas las credenciales',()=>{assert.equal(app.urlSinCredenciales('https://example.test/?registro=1&code=secreto&type=recovery#access_token=uno&refresh_token=dos&provider_token=tres&expires_in=3600&type=recovery'),'/?registro=1');assert.equal(app.urlSinCredenciales('https://example.test/?registro=1#planes'),'/?registro=1#planes');assert.ok(!app.errorEnlaceCuenta('https://example.test/#error_description=%3Cscript%3Esecreto').includes('script'));});
 await mount();assert.equal(contexts.length,1);await resolveContext(0,'a',{es_super_admin:true});assert.equal(dashboards.length,1);
 await emit('SIGNED_IN','b');check('cambio de usuario retira inmediatamente datos anteriores',()=>{assert.equal(api.session.user.id,'b');assert.equal(api.contexto,null);assert.equal(api.superDashboard,null);assert.equal(api.contextoLoading,true);});
 await resolveContext(1,'b');await act(async()=>dashboards[0].resolve({data:{secreto:'cuenta-a'}}));check('resumen supremo tardío de A no aparece en B',()=>{assert.equal(api.contexto.usuario.id,'b');assert.equal(api.superDashboard,null);});
 await emit('TOKEN_REFRESHED','b');await emit('SIGNED_IN','c');await resolveContext(3,'c');await resolveContext(2,'b');check('contexto tardío de B no reemplaza a C',()=>assert.equal(api.contexto.usuario.id,'c'));
 await emit('TOKEN_REFRESHED','c');const calls=rpcCalls;await emit('SIGNED_OUT',null);await act(async()=>contexts[4].reject(Error('fallo antiguo')));check('error tardío tras salir no inicia consultas de otra sesión',()=>{assert.equal(api.contexto,null);assert.equal(api.session,null);assert.equal(api.authAction,null);assert.equal(rpcCalls,calls);});
 await act(async()=>root.unmount());
 initial=deferred();await mount();await emit('SIGNED_IN','d');const current=contexts.length-1;await resolveContext(current,'d');await act(async()=>initial.resolve({data:{session:session('a')}}));check('getSession inicial tardío no restaura cuenta anterior',()=>{assert.equal(api.session.user.id,'d');assert.equal(api.contexto.usuario.id,'d');assert.equal(api.ready,true);});await act(async()=>root.unmount());
 initial=null;contexts=[];window.history.replaceState({},'', '/?registro=1#error=access_denied&error_code=otp_expired&error_description=secreto');await mount();check('enlace vencido informa un mensaje y limpia URL',()=>{assert.match(api.loginError,/enlace nuevo/);assert.ok(!api.loginError.includes('secreto'));assert.equal(window.location.href,'https://docworks-eight.vercel.app/?registro=1');assert.equal(api.authAction,null);});
 const oldListener=listener;await act(async()=>api.retry());const afterRetry=rpcCalls;await act(async()=>oldListener('SIGNED_IN',session('antiguo')));check('suscripción cerrada no vuelve a cambiar identidad',()=>{assert.equal(api.session.user.id,'a');assert.equal(rpcCalls,afterRetry);});
 await act(async()=>root.unmount());dom.window.close();fs.rmSync(tmp,{recursive:true,force:true});console.log('APROBADAS '+n+' pruebas de retorno, URLs y sesiones sin llamadas reales.');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
