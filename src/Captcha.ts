// La sitekey es pública. El secreto se configura únicamente en Supabase Auth.
// Un token se obtiene inmediatamente antes de cada solicitud; nunca se almacena.
declare global { interface Window { DOCWORKS_CAPTCHA?: {enabled:boolean;sitekey:string}; turnstile?: any; } }
let pendiente=false;
let carga:Promise<any>|null=null;
function cargarTurnstile(){
  if(window.turnstile)return Promise.resolve(window.turnstile);
  if(carga)return carga;
  carga=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    const timer=setTimeout(()=>terminar(new Error('No se pudo cargar la verificación. Revisá la conexión y reintentá.')),15000);
    function terminar(error?:Error){clearTimeout(timer);script.onload=null;script.onerror=null;if(error){script.remove();carga=null;reject(error);}else resolve(window.turnstile);}
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;
    script.onload=()=>terminar(window.turnstile?undefined:new Error('No se pudo cargar la verificación.'));
    script.onerror=()=>terminar(new Error('No se pudo cargar la verificación. Revisá la conexión y reintentá.'));
    document.head.appendChild(script);
  });
  return carga;
}
export async function solicitarCaptcha():Promise<string|undefined>{
  const config=typeof window==='undefined'?null:window.DOCWORKS_CAPTCHA;
  if(!config?.enabled)return undefined;
  if(!config.sitekey||!/^[A-Za-z0-9_-]{10,100}$/.test(config.sitekey))throw new Error('No se pudo iniciar la verificación. Contactá soporte.');
  if(pendiente)throw new Error('La verificación ya está en curso.');
  pendiente=true;
  try{
    const api=await cargarTurnstile();
    return await new Promise<string>((resolve,reject)=>{
      const previo=document.activeElement as HTMLElement;
      const dialog=document.createElement('dialog'),titulo=document.createElement('h2'),aviso=document.createElement('p'),widget=document.createElement('div'),cancel=document.createElement('button');
      let id:string|undefined,terminado=false;
      dialog.setAttribute('aria-label','Verificación de seguridad');
      dialog.style.cssText='box-sizing:border-box;width:calc(100% - 24px);max-width:370px;max-height:calc(100dvh - 24px);overflow:auto;border:1px solid #40516d;border-radius:16px;padding:20px;background:#0b1424;color:#f3f6fc;font:16px system-ui;';
      titulo.textContent='Verificá tu acceso';titulo.style.cssText='font-size:19px;margin:0 0 10px';
      aviso.textContent='Completá la verificación para continuar.';aviso.style.cssText='font-size:14px;line-height:1.5';
      widget.style.cssText='display:flex;justify-content:center';
      cancel.type='button';cancel.textContent='Cancelar';cancel.style.cssText='min-height:44px;padding:10px 18px;margin-top:14px;background:#243753;border:1px solid #60718c;border-radius:9px;color:white;font:inherit;cursor:pointer;';
      function cerrar(error?:Error,token?:string){if(terminado)return;terminado=true;clearTimeout(timer);if(id!==undefined)try{api.remove(id);}catch{}dialog.remove();previo?.focus?.();if(error)reject(error);else resolve(token!);}
      const timer=setTimeout(()=>cerrar(new Error('La verificación venció. Volvé a intentarlo.')),180000);
      dialog.addEventListener('cancel',e=>{e.preventDefault();cerrar(new Error('No se completó la verificación.'));});
      cancel.onclick=()=>cerrar(new Error('No se completó la verificación.'));
      dialog.append(titulo,aviso,widget,cancel);document.body.appendChild(dialog);
      try{
        dialog.showModal();cancel.focus();
        id=api.render(widget,{sitekey:config.sitekey,theme:'dark',size:'compact',language:'es',callback:(token:string)=>token?cerrar(undefined,token):cerrar(new Error('No se pudo validar la verificación.')),'error-callback':()=>{cerrar(new Error('No se pudo validar la verificación. Reintentá.'));return true;},'expired-callback':()=>cerrar(new Error('La verificación venció. Volvé a intentarlo.')),'timeout-callback':()=>cerrar(new Error('La verificación venció. Volvé a intentarlo.'))});
      }catch{cerrar(new Error('No se pudo iniciar la verificación. Revisá la conexión y reintentá.'));}
    });
  }finally{pendiente=false;}
}
