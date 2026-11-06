const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os'),fs=require('node:fs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-acceso-'));
require('esbuild').buildSync({entryPoints:[path.resolve(__dirname,'../src/AccesoCuenta.ts')],bundle:true,platform:'node',format:'cjs',outfile:tmp+'/acceso.cjs'});
const {crearAccesoCuenta}=require(tmp+'/acceso.cjs');let n=0;
const check=(name,fn)=>{fn();n++;console.log('OK',name);};
(async()=>{
let copied='',calls=[],release;
const access=crearAccesoCuenta({origin:'https://docworks.example.test/admin',clipboard:{writeText:async t=>{copied=t}},loadClient:async()=>({auth:{resetPasswordForEmail:(...args)=>{calls.push(args);return new Promise(r=>release=r)}}})});
const copy=await access.copiarAcceso('broker@example.test');check('copiar acceso no promete enviar una invitación',()=>{assert.ok(copy.data.copiado);assert.match(copied,/broker@example.test/);assert.match(copied,/https:\/\/docworks.example.test\/$/);assert.equal(calls.length,0);});
const pending=access.recuperar(' Broker@Example.test ');await new Promise(r=>setImmediate(r));const duplicate=await access.recuperar('broker@example.test');check('doble clic solicita una sola recuperación',()=>{assert.equal(calls.length,1);assert.ok(duplicate.error);assert.deepEqual(calls[0],['broker@example.test',{redirectTo:'https://docworks.example.test/'}]);});release({});const accepted=await pending;check('confirma solicitud aceptada sin afirmar entrega',()=>assert.deepEqual(accepted,{data:{solicitado:true}}));
const invalid=await access.recuperar('sin-email');check('email inválido no solicita recuperación',()=>{assert.ok(invalid.error);assert.equal(calls.length,1);});
for(const [label,loadClient] of [['sin servicio',async()=>null],['error proveedor',async()=>({auth:{resetPasswordForEmail:async()=>({error:{message:'secreto del proveedor'}})}})],['error de red',async()=>{throw Error('secreto de red')} ]]){const result=await crearAccesoCuenta({origin:'https://example.test',loadClient,clipboard:null}).recuperar('a@example.test');check(label+' es visible sin filtrar detalles',()=>{assert.ok(result.error);assert.ok(!result.error.message.includes('secreto'));});}
const badClipboard=crearAccesoCuenta({origin:'https://example.test',loadClient:async()=>null,clipboard:null});const denied=await badClipboard.copiarAcceso('a@example.test');check('portapapeles sin permiso no informa éxito',()=>assert.ok(denied.error));
console.log('APROBADAS '+n+' pruebas de acceso y recuperación sin envíos reales.');
})().catch(e=>{console.error(e);process.exitCode=1});
