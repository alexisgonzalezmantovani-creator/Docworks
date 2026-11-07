import React, {useEffect, useRef, useState} from 'react';

export function fechaFirmaISO(valor:string){
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor))return null;
  const fecha=new Date(valor+':00-03:00');
  if(!Number.isFinite(fecha.getTime()))return null;
  // Rechazar fechas imposibles normalizadas silenciosamente por Date.
  if(new Date(fecha.getTime()-3*3600000).toISOString().slice(0,16)!==valor)return null;
  return fecha.toISOString();
}

const ESTADOS={pendiente:'Programado',enviando:'Procesando',aceptado:'Aceptado por el servicio de correo',cancelado:'Cancelado',error:'No se pudo enviar',verificar:'Entrega por verificar'};

export function RecordatoriosPanel({op,loadClient}){
  const [contexto,setContexto]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [fecha,setFecha]=useState(''),[anticipacion,setAnticipacion]=useState('1440'),[destinatario,setDestinatario]=useState('');
  const vigencia=useRef(0),pendiente=useRef(false);
  const operacionId=String(op?.id||'');
  async function rpc(nombre,params){const sb=await loadClient();if(!sb)throw Error();const res=await sb.rpc(nombre,params);if(res?.error)throw Error();return res?.data;}
  useEffect(()=>{
    const actual=++vigencia.current;setContexto(null);setError('');setFecha('');setDestinatario('');setBusy(false);pendiente.current=false;
    rpc('fn_recordatorios_contexto',{p_operacion_id:operacionId}).then(data=>{if(actual===vigencia.current){setContexto(data);setDestinatario(data?.destinatarios?.[0]?.id||'');}}).catch(()=>{if(actual===vigencia.current)setError('No se pudieron consultar los recordatorios. Volvé a abrir la operación para reintentar.');});
    return ()=>{vigencia.current++;};
  },[operacionId]);
  async function ejecutar(nombre,params){
    if(pendiente.current)return;pendiente.current=true;setBusy(true);setError('');const actual=vigencia.current;
    try{await rpc(nombre,params);const data=await rpc('fn_recordatorios_contexto',{p_operacion_id:operacionId});if(actual===vigencia.current){setContexto(data);setFecha('');}}
    catch{if(actual===vigencia.current)setError('No se pudo confirmar el cambio. Volvé a consultar antes de reintentar.');}
    finally{if(actual===vigencia.current){pendiente.current=false;setBusy(false);}}
  }
  function guardar(e){e.preventDefault();const iso=fechaFirmaISO(fecha);if(!iso||new Date(iso).getTime()-Number(anticipacion)*60000<=Date.now()){setError('Elegí una firma y un aviso posteriores a este momento, en horario de Argentina.');return;}ejecutar('fn_recordatorio_guardar',{p_operacion_id:operacionId,p_destinatario:destinatario,p_firma:iso,p_anticipacion:Number(anticipacion)});}
  return <section className="card" aria-label="Recordatorios de firma" style={{padding:18,marginTop:12}}>
    <h3 style={{fontSize:14,margin:'0 0 8px'}}>Recordatorios de firma</h3>
    {error&&<p role="alert" style={{fontSize:13,color:'var(--red)'}}>{error}</p>}
    {!contexto&&!error&&<p role="status">Consultando recordatorios…</p>}
    {contexto&&!contexto.habilitado&&<p style={{fontSize:13,color:'var(--muted)',lineHeight:1.5}}>Los avisos por correo todavía no están habilitados. Cuando estén disponibles podrás elegir la fecha de firma y quién recibe el aviso.</p>}
    {contexto?.habilitado&&contexto?.puede_programar&&<form onSubmit={guardar} style={{display:'grid',gap:10}}>
      <label style={{fontSize:13}}>Firma · horario de Argentina<input className="inp" type="datetime-local" required value={fecha} onChange={e=>setFecha(e.target.value)} disabled={busy} style={{display:'block',width:'100%',boxSizing:'border-box',marginTop:5}}/></label>
      <label style={{fontSize:13}}>Avisar<select className="inp" value={anticipacion} onChange={e=>setAnticipacion(e.target.value)} disabled={busy} style={{display:'block',width:'100%',marginTop:5}}><option value="1440">Un día antes</option><option value="60">Una hora antes</option><option value="0">A la hora de la firma</option></select></label>
      <label style={{fontSize:13}}>Destinatario<select className="inp" value={destinatario} onChange={e=>setDestinatario(e.target.value)} disabled={busy} required style={{display:'block',width:'100%',marginTop:5}}><option value="">Elegir destinatario</option>{(contexto.destinatarios||[]).map(u=><option key={u.id} value={u.id}>{u.nombre}</option>)}</select></label>
      <button className="btn btn-primary" disabled={busy||!destinatario} type="submit">{busy?'Guardando…':'Programar aviso'}</button>
      <p style={{fontSize:12,color:'var(--muted)',margin:0}}>Para cambiar una firma, cancelá su aviso y programá uno nuevo. El correo incluye la fecha y el acceso a DocWorks.</p>
    </form>}
    {(contexto?.recordatorios||[]).map(r=><div key={r.id} style={{padding:'12px 0',borderBottom:'1px solid var(--border)',fontSize:13,overflowWrap:'anywhere'}}><div>{new Intl.DateTimeFormat('es-AR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Argentina/Buenos_Aires'}).format(new Date(r.firma))} · {r.destinatario_nombre}</div><div style={{color:'var(--muted)',marginTop:4}}>{ESTADOS[r.estado]||'Por verificar'} · {r.anticipacion===1440?'un día antes':r.anticipacion===60?'una hora antes':'a la hora de la firma'}</div>{contexto.puede_programar&&['pendiente','error'].includes(r.estado)&&<button className="btn btn-ghost" type="button" disabled={busy} onClick={()=>ejecutar('fn_recordatorio_cancelar',{p_id:r.id})}>Cancelar aviso</button>}</div>)}
  </section>;
}
