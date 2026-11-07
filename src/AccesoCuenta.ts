import { solicitarCaptcha } from './Captcha';
// Las invitaciones se preparan en la base; el acceso se comparte por enlace.
export function crearAccesoCuenta({loadClient,origin,clipboard}){
  const pendientes=new Set<string>();
  return {
    async copiarAcceso(email){
      if(!String(email||'').trim())return {error:{message:'La cuenta no tiene un email válido.'}};
      try{
        const url=new URL('/',origin);
        await clipboard.writeText('Ingresá a DocWorks con '+String(email).trim()+' en '+url.href);
        return {data:{copiado:true}};
      }catch{return {error:{message:'No se pudo copiar el acceso. Intentá nuevamente desde un navegador con permiso de portapapeles.'}};}
    },
    async recuperar(email){
      const correo=String(email||'').trim().toLowerCase();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))return {error:{message:'La cuenta no tiene un email válido.'}};
      if(pendientes.has(correo))return {error:{message:'La solicitud de recuperación ya se está enviando.'}};
      pendientes.add(correo);
      try{
        const captchaToken=await solicitarCaptcha();
        const sb=await loadClient();
        if(!sb?.auth?.resetPasswordForEmail)return {error:{message:'No se pudo conectar con el servicio de recuperación.'}};
        const res=await sb.auth.resetPasswordForEmail(correo,{redirectTo:new URL('/',origin).href,...(captchaToken?{captchaToken}:{})});
        return res?.error?{error:{message:'No se pudo solicitar la recuperación. Intentá nuevamente más tarde.'}}:{data:{solicitado:true}};
      }catch{return {error:{message:'No se pudo solicitar la recuperación. Revisá la conexión e intentá nuevamente.'}};}
      finally{pendientes.delete(correo);}
    }
  };
}
