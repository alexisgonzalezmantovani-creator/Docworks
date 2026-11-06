const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {fixture,req}=require('./pagos-seguridad.cjs'),dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-checkout-'));
require('esbuild').buildSync({entryPoints:[dir+'/supabase/functions/_shared/mercadopago.ts'],bundle:true,platform:'node',format:'cjs',outfile:tmp+'/mp.cjs'});
const {crearManejadorSuscripciones}=require(tmp+'/mp.cjs');
const response=(d,status=200)=>new Response(JSON.stringify(d),{status});
function backend(opts={}){
 const f=fixture(),base=f.fetch;let reservation=null,remote=null,posts=0,failSave=!!opts.failSave,loseReply=!!opts.loseReply,release;
 const gate=new Promise(r=>release=r);
 f.fetch=async(url,init={})=>{
  const body=init.body?JSON.parse(init.body):null;
  if(url.endsWith('/rpc/fn_mp_reservar_checkout')){
   const nuevo=!reservation;reservation=reservation||{clave:'key',referencia:'DOCWORKS-reference',correo:body.p_correo,monto:body.p_monto,moneda:body.p_moneda};return response({...reservation,nuevo});
  }
  if(url.endsWith('/rpc/fn_mp_finalizar_checkout')){if(failSave){failSave=false;return response({},500);}assert.equal(body.p_clave,reservation.clave);return response({ok:true});}
  if(url==='https://api.mercadopago.com/preapproval'){
   posts++;if(opts.gate)await gate;
   remote={id:'sub1',status:'pending',init_point:'https://www.mercadopago.com.ar/checkout',external_reference:body.external_reference,auto_recurring:body.auto_recurring};
   if(loseReply){loseReply=false;throw new Error('timeout después de crear');}return response(remote);
  }
  if(url.includes('/preapproval/search?'))return response({paging:{total:remote?1:0},results:remote?[{...remote,external_reference:opts.wrongReference?'ajena':remote.external_reference}]:[]});
  if(url==='https://api.mercadopago.com/preapproval/sub1')return response({...remote,auto_recurring:opts.wrongAmount?{...remote.auto_recurring,transaction_amount:1}:remote.auto_recurring});
  return base(url,init);
 };
 return {f,release,posts:()=>posts};
}
(async()=>{
 let b=backend({gate:true}),h=crearManejadorSuscripciones(b.f);const first=h(req('create_checkout'));
 // Dejar que la primera instancia reserve antes de ejecutar la segunda.
 await new Promise(r=>setImmediate(r));assert.equal((await h(req('create_checkout'))).status,409);b.release();assert.equal((await first).status,200);assert.equal(b.posts(),1);
 for(const opts of [{failSave:true},{loseReply:true}]){b=backend(opts);h=crearManejadorSuscripciones(b.f);assert.equal((await h(req('create_checkout'))).status,502);assert.equal((await h(req('create_checkout'))).status,200);assert.equal(b.posts(),1);}
 b=backend({failSave:true,wrongReference:true});h=crearManejadorSuscripciones(b.f);await h(req('create_checkout'));assert.equal((await h(req('create_checkout'))).status,409);assert.equal(b.posts(),1);
 b=backend({failSave:true,wrongAmount:true});h=crearManejadorSuscripciones(b.f);await h(req('create_checkout'));assert.equal((await h(req('create_checkout'))).status,409);assert.equal(b.posts(),1);
 console.log('APROBADAS 13 comprobaciones de concurrencia y recuperación de checkout. Sin llamadas externas.');
})().catch(e=>{console.error(e);process.exitCode=1});
