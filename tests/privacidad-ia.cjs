const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os');
const esbuild=require('esbuild'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
let handler,requests=[];
const activeContext={habilitado:true,usuario:{id:'usuario-de-prueba'},inmobiliaria:{id:'inmobiliaria-ficticia'}};
let context=activeContext,providerError=false,invalidClause=false,contextFailure=false;
const code=esbuild.buildSync({entryPoints:[path.join(root,'supabase/functions/ia-docworks/index.ts')],bundle:true,write:false,format:'iife',platform:'neutral',target:'es2020'}).outputFiles[0].text;
vm.runInNewContext(code,{
 Deno:{serve(fn){handler=fn},env:{get(name){return ({SUPABASE_URL:'https://auth.example.invalid',SUPABASE_ANON_KEY:'test',GEMINI_API_KEY:'test'})[name]}}},Response,console,
 async fetch(url,options){requests.push({url:String(url),options});if(String(url).endsWith('/auth/v1/user'))return Response.json({id:'usuario-de-prueba'});if(String(url).endsWith('/rest/v1/rpc/fn_mi_contexto'))return Response.json(context,{status:contextFailure?503:200});if(String(url).startsWith('https://generativelanguage.googleapis.com/')){if(providerError)return Response.json({error:{message:'CONTENIDO_CONFIDENCIAL_SIMULADO'}},{status:400});const body=JSON.parse(options.body);const clause=body.systemInstruction.parts[0].text.includes('EXCLUSIVAMENTE con JSON');return Response.json({candidates:[{content:{parts:[{text:invalidClause?'[]':clause?JSON.stringify({titulo:'Entrega amoblada',categoria:'general',contenido:'Se adjunta inventario de los bienes.'}):'Una consulta general de prueba.'}]}}]});}throw new Error('Solicitud no esperada');}
});
const config={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/PrivacidadIA.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,config);
const privacy=config.exports;
async function post(payload){requests=[];return (await handler(new Request('https://example.invalid',{method:'POST',headers:{Authorization:'Bearer prueba-sin-datos-reales','Content-Type':'application/json'},body:JSON.stringify(payload)}))).json();}
function noProvider(){assert.equal(requests.filter(r=>r.url.includes('generativelanguage')).length,0);}
(async()=>{
 assert.equal(privacy.IA_HABILITADA,true);assert.equal(privacy.IA_DOCUMENTOS_HABILITADA,false);
 assert.throws(()=>privacy.asegurarIAHabilitada('documento'));privacy.asegurarIAHabilitada();
 assert.ok(privacy.validarConsultaGenerica('Redactá una cláusula de entrega amoblada con [NOMBRE] y [DOMICILIO].'));
 for(const mode of ['chat','clause','review','archivo']){const result=await post({mode,messages:[{role:'user',content:'TEXTO DEL DOCUMENTO GENERADO: SENTINELA'}]});assert.equal(result.ok,false);assert.equal(result.code,'IA_SOLO_GENERICA');noProvider();}
 for(const content of ['Contacto: persona@example.invalid','DNI: 12.345.678','CUIT 20-12345678-6','Teléfono: 1122334455','Domicilio: Calle de Prueba 123','DOCUMENTO A REVISAR: SENTINELA']){const result=await post({mode:'generic_chat',messages:[{role:'user',content}]});assert.equal(result.ok,false,content);assert.equal(result.code,'IA_DATOS_NO_ADMITIDOS');noProvider();}
 for(const part of [{type:'document',source:{type:'base64',data:'PRUEBA'}},{type:'image',source:{type:'base64',data:'PRUEBA'}},{type:'text',text:'PRUEBA'}]){const result=await post({mode:'generic_chat',messages:[{role:'user',content:[part]}]});assert.equal(result.ok,false);noProvider();}
 assert.equal((await post({mode:'generic_chat',messages:[{role:'user',content:'Consulta general.'}],operacion:{id:'SENTINELA'}})).ok,false);noProvider();
 assert.equal((await post({mode:'generic_chat',messages:[{role:'user',content:'x'.repeat(60001)}]})).ok,false);noProvider();
 for(const mode of ['generic_chat','generic_clause']){const result=await post({mode,messages:[{role:'user',content:'Redactá una cláusula genérica sobre entrega amoblada.'}]});assert.equal(result.ok,true);assert.equal(result.mode,mode);assert.equal(requests.filter(r=>r.url.includes('generativelanguage')).length,1);assert.ok(requests.some(r=>r.url.endsWith('/auth/v1/user')));const sent=JSON.stringify(requests.find(r=>r.url.includes('generativelanguage')).options.body);assert.ok(!sent.includes('SENTINELA'));}

 const generic={mode:'generic_chat',messages:[{role:'user',content:'Consulta general.'}]};
 for(const denied of [{habilitado:false}, {habilitado:true,usuario:{id:'otro'},inmobiliaria:{id:'ficticia'}}, {habilitado:true,usuario:{id:'usuario-de-prueba'}}, null]){context=denied;assert.equal((await post(generic)).ok,false);noProvider();}
 context=activeContext;contextFailure=true;assert.equal((await post(generic)).ok,false);noProvider();contextFailure=false;
 context={habilitado:true,es_super_admin:true};assert.equal((await post(generic)).ok,true);context=activeContext;
 assert.equal((await post({mode:'generic_chat',messages:[{role:'assistant',content:'Consulta general.'}]})).ok,false);noProvider();
 providerError=true;const failure=await post(generic);assert.equal(failure.ok,false);assert.ok(!JSON.stringify(failure).includes('CONTENIDO_CONFIDENCIAL_SIMULADO'));providerError=false;
 invalidClause=true;assert.equal((await post({...generic,mode:'generic_clause'})).ok,false);invalidClause=false;
 requests=[];assert.equal(await (await handler({method:'OPTIONS'})).text(),'ok');noProvider();
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-ia-generica-'));
 esbuild.buildSync({stdin:{contents:fs.readFileSync(path.join(root,'src/App.tsx'),'utf8')+'\nimport {renderToStaticMarkup} from "react-dom/server"; export {BotIA,mejorarEncabezadoIA,revisarDocumentoIA,renderToStaticMarkup};',resolveDir:path.join(root,'src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'app.cjs')});
 global.document={querySelector:()=>({}),title:''};const a=require(path.join(tmp,'app.cjs'));delete global.document;
 await assert.rejects(a.mejorarEncabezadoIA('SENTINELA','reserva'),/revisión de operaciones/);
 await assert.rejects(a.revisarDocumentoIA({comprador_nombre:'SENTINELA'},{}),/revisión de operaciones/);
 const {JSDOM}=require('jsdom');const html=a.renderToStaticMarkup(a.BotIA({onClose(){},onAddClausula(){},operaciones:[{comprador_nombre:'SENTINELA'}]}));const d=new JSDOM(html).window.document;
 assert.ok(d.body.textContent.includes('Nueva consulta'));assert.ok(d.querySelector('textarea'));assert.equal(d.querySelector('input[type=file]'),null);assert.ok(!d.body.textContent.includes('SENTINELA'));assert.ok(!d.body.textContent.includes('Revisar operación'));assert.ok(d.body.textContent.includes('sin datos personales'));
 console.log('OK IA genérica: consultas y cláusulas admitidas; documentos, adjuntos e identificadores frecuentes rechazados sin envío; interfaz sin acceso a operaciones.');
})().catch(error=>{console.error(error);process.exitCode=1});
