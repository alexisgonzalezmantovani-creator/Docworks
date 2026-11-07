type Dependencias = {env:(name:string)=>string|undefined;fetch?:typeof fetch};

export function crearManejadorRecordatorios({env,fetch:request=fetch}:Dependencias){
  const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  return async (req:Request)=>{
    if(req.method!=='POST')return json({error:'Método no permitido'},405);
    const secreto=env('DOCWORKS_REMINDERS_SECRET')||'';
    const recibido=req.headers.get('authorization')||'';
    // Un secreto dedicado; nunca aceptar una sesión de usuario ni la clave pública.
    if(secreto.length<32||recibido!=='Bearer '+secreto)return json({error:'No autorizado'},401);
    const apiKey=env('RESEND_API_KEY'),from=env('DOCWORKS_EMAIL_FROM');
    const url=env('SUPABASE_URL'),service=env('SUPABASE_SERVICE_ROLE_KEY');
    if(env('DOCWORKS_REMINDERS_ENABLED')!=='true'||!apiKey||!from||!url||!service)return json({error:'Correo no habilitado'},503);
    async function rpc(nombre:string,body:unknown){
      const response=await request(url+'/rest/v1/rpc/'+nombre,{method:'POST',headers:{apikey:service,authorization:'Bearer '+service,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw Error('base_no_disponible');
      return response.status===204?null:response.json();
    }
    try{
      const items=await rpc('fn_recordatorios_tomar',{});
      if(!Array.isArray(items))throw Error('respuesta_no_valida');
      let aceptados=0,porVerificar=0,errores=0;
      for(const item of items){
        let estado='verificar',proveedorId:null|string=null;
        try{
          const fecha=new Intl.DateTimeFormat('es-AR',{dateStyle:'full',timeStyle:'short',timeZone:'America/Argentina/Buenos_Aires'}).format(new Date(item.firma));
          const response=await request('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+apiKey,'content-type':'application/json','Idempotency-Key':'docworks-firma-'+item.id},body:JSON.stringify({from,to:[item.email],subject:'DocWorks · Recordatorio de firma',text:'Tenés una firma programada para el '+fecha+' (hora de Argentina).\n\nIngresá a DocWorks para consultar la operación: https://docworks-eight.vercel.app/\n\nEste aviso fue programado desde tu inmobiliaria. Podés gestionar los próximos avisos en el Centro de tareas de la operación.'}),signal:AbortSignal.timeout(10000)});
          if(response.ok){const result=await response.json();if(typeof result?.id==='string'&&result.id){proveedorId=result.id;estado='aceptado';}}
          else if(response.status>=400&&response.status<500&&response.status!==408&&response.status!==409)estado='error';
        }catch{/* Una respuesta ambigua nunca se vuelve a enviar automáticamente. */}
        await rpc('fn_recordatorio_resultado',{p_id:item.id,p_estado:estado,p_proveedor_id:proveedorId});
        if(estado==='aceptado')aceptados++;else if(estado==='error')errores++;else porVerificar++;
      }
      // No devolver correos, contenido, respuestas del proveedor ni credenciales.
      return json({procesados:items.length,aceptados,por_verificar:porVerificar,errores});
    }catch{return json({error:'No se pudo completar el procesamiento'},502);}
  };
}
