const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
(async()=>{
 const html=fs.readFileSync(path.resolve(__dirname,'../landing/index.html'),'utf8');
 assert.ok(!html.includes('14 días'));assert.ok(html.includes('Probá gratis 1 mes'));assert.ok(html.includes('Un mes gratis. Sin tarjeta. Sin cobro automático.'));
 const dom=new JSDOM(html,{url:'https://docworks.ia',runScripts:'outside-only'});
 let calls=[],resolveRequest;
 dom.window.fetch=(url,options)=>{calls.push({url,options});return new Promise(resolve=>resolveRequest=resolve);};
 for(const script of dom.window.document.querySelectorAll('script')){if(script.textContent.includes("getElementById('signup-form')"))dom.window.eval(script.textContent);}
 const form=dom.window.document.getElementById('signup-form'),button=form.querySelector('button'),status=dom.window.document.getElementById('signup-status');
 const fill=()=>{form.elements.nombre.value=' Ale ';form.elements.inmobiliaria.value=' Prueba ';form.elements.email.value='ALE@example.invalid';form.elements.password.value='Password123';};
 const submit=()=>form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
 fill();submit();submit();assert.equal(calls.length,1);assert.equal(button.disabled,true);
 let body=JSON.parse(calls[0].options.body);assert.equal(body.email,'ale@example.invalid');assert.equal(body.data.inmobiliaria,'Prueba');assert.equal(body.data.docworks_registro,'trial_month_v1');assert.ok(!('consentimiento_prueba' in body.data));assert.equal(form.querySelectorAll('input[type=checkbox]').length,0);assert.ok(!('rol_base' in body.data));assert.ok(calls[0].url.includes('redirect_to='));
 resolveRequest({ok:false,status:429,json:async()=>({})});await new Promise(r=>setTimeout(r,0));assert.match(status.textContent,/Esperá/);assert.equal(button.disabled,false);
 submit();resolveRequest({ok:true,status:200,json:async()=>({id:'test'})});await new Promise(r=>setTimeout(r,0));assert.match(status.textContent,/verificá tu email/);assert.equal(button.hidden,true);assert.equal(form.elements.password.value,'');assert.equal(dom.window.localStorage.length,0);
 console.log('OK landing: formulario, validación, envío único, plazo, errores, confirmación y contraseña descartada');dom.window.close();
 const appDom=new JSDOM('<html><head></head><body><div id="root"></div></body></html>',{url:'https://docworks-eight.vercel.app/?registro=1'});
 for(const k of ['window','document','HTMLElement','CustomEvent','Event','Node','localStorage'])global[k]=appDom.window[k];global.IS_REACT_ACT_ENVIRONMENT=true;
 let signup=[];
 const sb={auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signUp:async args=>{signup.push(args);return {data:{user:{id:'new'},session:null},error:null};}},rpc:async()=>({data:null})};window.supabase={createClient:()=>sb};
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-registro-'));
 require('esbuild').buildSync({stdin:{contents:fs.readFileSync(path.resolve(__dirname,'../src/App.tsx'),'utf8')+'\nexport {RegistroScreen,useDocWorksSession,LoginGate};',resolveDir:path.resolve(__dirname,'../src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'app.cjs'),external:['react','react-dom','react/jsx-runtime']});
 // Resolve shared React from the project rather than the temporary bundle directory.
 const Module=require('node:module');const original=Module._resolveFilename;const reactPaths=Object.fromEntries(['react','react/jsx-runtime','react-dom'].map(x=>[x,require.resolve(x)]));Module._resolveFilename=function(request,parent,...rest){if(reactPaths[request])return reactPaths[request];return original.call(this,request,parent,...rest);};
 const app=require(path.join(tmp,'app.cjs')),React=require('react'),{createRoot}=require('react-dom/client');let api;
 function Harness(){api=app.useDocWorksSession();return React.createElement(app.LoginGate,{docworksAuth:api});}
 const root=createRoot(document.getElementById('root'));
 await React.act(async()=>root.render(React.createElement(Harness)));
 assert.match(document.body.textContent,/Probá DocWorks gratis/);assert.equal(document.querySelectorAll('input[type=checkbox]').length,0);
 await React.act(async()=>api.solicitarRegistro({nombre:'Ale',inmobiliaria:'Prueba',email:'ale@example.invalid',password:'Password123'}));
 assert.equal(signup.length,1);assert.ok(!('consentimiento_prueba' in signup[0].options.data));assert.equal(signup[0].options.emailRedirectTo,'https://docworks-eight.vercel.app/');assert.equal(signup[0].options.data.docworks_registro,'trial_month_v1');assert.match(api.registroSuccess,/verificá tu email/);
 await React.act(async()=>api.solicitarRegistro({nombre:'',password:'x'}));assert.equal(signup.length,1);assert.ok(api.registroError);
 await React.act(async()=>root.unmount());fs.rmSync(tmp,{recursive:true,force:true});appDom.window.close();console.log('OK app: acceso directo, signup, confirmación y validación sin RPC manual');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
