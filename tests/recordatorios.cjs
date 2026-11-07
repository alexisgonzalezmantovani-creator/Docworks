const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-recordatorios-'));let n=0;const check=(s,f)=>{f();n++;console.log('OK',s)};
require('esbuild').buildSync({entryPoints:[path.resolve(__dirname,'../supabase/functions/_shared/recordatorios.ts')],bundle:true,platform:'node',format:'cjs',outfile:tmp+'/worker.cjs'});
require('esbuild').buildSync({entryPoints:[path.resolve(__dirname,'../src/Recordatorios.tsx')],bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/ui.cjs'});
const {crearManejadorRecordatorios}=require(tmp+'/worker.cjs'),{fechaFirmaISO}=require(tmp+'/ui.cjs');
(async()=>{
 check('firma se interpreta en Argentina',()=>assert.equal(fechaFirmaISO('2026-11-08T08:00'),'2026-11-08T11:00:00.000Z'));
 check('fecha imposible se rechaza',()=>{assert.equal(fechaFirmaISO('2026-02-30T08:00'),null);assert.equal(fechaFirmaISO(''),null)});
 const config={DOCWORKS_REMINDERS_SECRET:'x'.repeat(40),RESEND_API_KEY:'secreto-qa',DOCWORKS_EMAIL_FROM:'DocWorks <qa@example.invalid>',SUPABASE_URL:'https://qa.invalid',SUPABASE_SERVICE_ROLE_KEY:'service-qa',DOCWORKS_REMINDERS_ENABLED:'true'};
 const req=()=>new Request('https://worker.invalid',{method:'POST',headers:{authorization:'Bearer '+config.DOCWORKS_REMINDERS_SECRET}});
 let calls=[],provider='ok',dbFail=false,batch=[{id:'recordatorio-qa',email:'broker@example.invalid',firma:'2026-11-08T11:00:00Z'}];
 const fetch=async(url,opts)=>{calls.push({url,opts});if(url.endsWith('fn_recordatorios_tomar'))return Response.json(batch);if(url.endsWith('fn_recordatorio_resultado')){if(dbFail)throw Error('privado');return new Response(null,{status:204});}if(provider==='timeout')throw Error('secreto timeout');if(provider==='rechazo')return Response.json({message:'privado'},{status:422});if(provider==='indefinido')return Response.json({message:'privado'},{status:500});return Response.json({id:'provider-qa'});};
 const handler=crearManejadorRecordatorios({env:k=>config[k],fetch});
 let res=await handler(new Request('https://worker.invalid',{method:'POST'}));check('sesión pública no puede ejecutar envíos',()=>{assert.equal(res.status,401);assert.equal(calls.length,0)});
 config.DOCWORKS_REMINDERS_ENABLED='false';res=await handler(req());check('configuración incompleta no toma cola',()=>{assert.equal(res.status,503);assert.equal(calls.length,0)});config.DOCWORKS_REMINDERS_ENABLED='true';
 res=await handler(req());let body=await res.json();check('aceptación no se confunde con recepción',()=>{assert.equal(body.aceptados,1);assert.ok(!JSON.stringify(body).includes('broker@'));});
 let mail=calls.find(c=>c.url==='https://api.resend.com/emails');check('correo sin datos de las partes y clave persistente',()=>{const m=JSON.parse(mail.opts.body);assert.match(m.text,/8:00/);assert.equal(m.to[0],'broker@example.invalid');assert.equal(mail.opts.headers['Idempotency-Key'],'docworks-firma-recordatorio-qa');assert.ok(!m.html);});
 for(const [mode,expected] of [['timeout','verificar'],['rechazo','error'],['indefinido','verificar']]){calls=[];provider=mode;await handler(req());const report=calls.find(c=>c.url.endsWith('fn_recordatorio_resultado'));check(mode+' conserva estado correcto',()=>assert.equal(JSON.parse(report.opts.body).p_estado,expected));}
 calls=[];provider='ok';dbFail=true;res=await handler(req());check('persistencia fallida no informa éxito',()=>assert.equal(res.status,502));
 console.log('APROBADAS '+n+' pruebas de recordatorios. Proveedor simulado; cero correos enviados.');
})().catch(e=>{console.error(e);process.exitCode=1});
