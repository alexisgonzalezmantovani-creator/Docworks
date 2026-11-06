import {useEffect, useRef, useState} from 'react';

export function FacturacionMercadoPago({perfil,facturacion,onRequest,onPersist,onUpdated,onNotify,onRedirect=undefined}){
  const [busy,setBusy]=useState(''),[error,setError]=useState('');
  const lock=useRef(false),mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;};},[]);
  async function ejecutar(action){
    if(lock.current)return;
    lock.current=true;setBusy(action);setError('');
    try{
      if(action==='create_checkout'){
        const code=facturacion.plan_codigo||perfil.plan_codigo||perfil.plan||'profesional';
        const result=await onRequest(action,{plan_codigo:code,payer_email:facturacion.email||perfil.email||'',back_url:window.location.href});
        if(!mounted.current)return;
        let url;try{url=new URL(result.init_point);}catch{throw new Error('No se recibió un enlace de Mercado Pago válido.');}
        if(url.protocol!=='https:'||!/(^|\.)mercadopago\.(com|com\.ar|com\.br|com\.mx|cl|com\.co|com\.uy|com\.pe)$/.test(url.hostname))throw new Error('El enlace recibido no corresponde a Mercado Pago.');
        if(onRedirect)onRedirect(url.href);else window.location.assign(url.href);
      }else{
        const result=await onRequest('sync',{});
        if(!mounted.current)return;
        if(!result.subscription){onNotify('info','Todavía no hay una suscripción de Mercado Pago asociada.');return;}
        const s=result.subscription,next={...perfil,facturacion:{...facturacion,estado_pago:s.status||facturacion.estado_pago,proximo_vencimiento:s.next_payment_date||facturacion.proximo_vencimiento,metodo_pago:s.payment_method_id||facturacion.metodo_pago}};
        const saved=await onPersist(next);if(saved?.contextoObsoleto)return;if(saved?.error)throw new Error('Se consultó Mercado Pago, pero no se pudo guardar el estado. Intentá actualizar nuevamente.');
        if(mounted.current){onUpdated(next);onNotify('success','Estado de Mercado Pago actualizado.');}
      }
    }catch(e){const message=e instanceof Error?e.message:'No se pudo completar la operación de pagos.';if(mounted.current){setError(message);onNotify('error',message);}}
    finally{lock.current=false;if(mounted.current)setBusy('');}
  }
  return <div className="dw-mercadopago-panel" style={{marginTop:12,padding:12,borderRadius:10,background:'rgba(74,222,128,.045)',border:'1px solid rgba(74,222,128,.15)'}}>
    <div style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>Pago de la suscripción</div>
    <div style={{fontSize:12,color:'var(--muted)',marginTop:3,lineHeight:1.45}}>El pago se procesa en Mercado Pago. DocWorks guarda estados y referencias; no solicita números de tarjeta ni códigos de seguridad.</div>
    {error&&<p role="alert" style={{fontSize:12,color:'var(--red)',lineHeight:1.45}}>{error}</p>}
    <button type="button" className="btn btn-primary" disabled={!!busy} aria-busy={busy==='create_checkout'} style={{marginTop:10,width:'100%'}} onClick={()=>ejecutar('create_checkout')}>{busy==='create_checkout'?'Abriendo pago…':'Continuar con Mercado Pago →'}</button>
    <button type="button" className="btn btn-secondary" disabled={!!busy} aria-busy={busy==='sync'} style={{marginTop:7,width:'100%'}} onClick={()=>ejecutar('sync')}>{busy==='sync'?'Actualizando…':'↻ Actualizar estado'}</button>
  </div>;
}
