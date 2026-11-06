import {useState} from 'react';
const tipos={reserva:'Reserva de compra',boleto:'Boleto de compraventa',reserva_alquiler:'Reserva de alquiler',alquiler:'Contrato de locación',comodato:'Comodato',exclusividad:'Autorización de venta',refuerzo_reserva:'Refuerzo de reserva',devolucion_reserva:'Devolución de reserva'};
const normalizar=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function UsoInmobiliarias({metricas,loading,error,onRetry}){
 const [busqueda,setBusqueda]=useState('');
 const filas=(metricas?.por_inmobiliaria||[]).filter(i=>normalizar(i.nombre).includes(normalizar(busqueda)));
 return <section aria-label="Uso por inmobiliaria" style={{marginBottom:20}}>
  <h2 style={{fontSize:18,marginBottom:6}}>Uso por inmobiliaria</h2>
  <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>Documentos más usados y operaciones creadas en los últimos 30 días. La última actividad corresponde a la creación o edición de una operación. No incluye papelera ni cuentas de prueba reservadas.</p>
  {loading?<p role="status">Actualizando estadísticas…</p>:error?<div role="alert">No se pudieron cargar las estadísticas. <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>Reintentar estadísticas</button></div>:!metricas?<p>Estadísticas todavía no disponibles.</p>:<>
   <label style={{display:'block',fontSize:12,marginBottom:12}}>Buscar inmobiliaria<input className="inp" value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Nombre de la inmobiliaria"/></label>
   {filas.length===0?<p>No hay inmobiliarias para mostrar con esta búsqueda.</p>:<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,320px),1fr))',gap:12}}>{filas.map(i=>{
    const ranking=Object.entries(i.documentos_30_dias||{}).sort((a,b)=>Number(b[1])-Number(a[1])||a[0].localeCompare(b[0])).slice(0,3);
    return <article key={i.id} className="op-card" style={{padding:14,minWidth:0}}><h3 style={{fontSize:15,margin:'0 0 10px',overflowWrap:'anywhere'}}>{i.nombre}</h3>
     <dl style={{display:'grid',gridTemplateColumns:'1fr auto',gap:6,fontSize:12,margin:'0 0 12px'}}><dt>Operaciones · últimos 30 días</dt><dd style={{margin:0}}>{i.operaciones_30_dias}</dd><dt>Borradores actuales</dt><dd style={{margin:0}}>{i.borradores}</dd><dt>Operaciones cerradas</dt><dd style={{margin:0}}>{i.cerradas}</dd><dt>Usuarios habilitados</dt><dd style={{margin:0}}>{i.usuarios_habilitados}</dd></dl>
     <div style={{fontSize:12,fontWeight:700}}>Documentos más usados · 30 días</div>{ranking.length?<ol style={{fontSize:12,lineHeight:1.6,paddingLeft:20}}>{ranking.map(([tipo,total])=><li key={tipo}>{tipos[tipo]||tipo}: <b>{String(total)}</b></li>)}</ol>:<p style={{fontSize:12,color:'var(--muted)'}}>Sin operaciones nuevas en ese período.</p>}
     <div style={{fontSize:11,color:'var(--muted)'}}>Última actividad en operaciones: {i.ultima_actividad?new Date(i.ultima_actividad).toLocaleString('es-AR'):'Sin operaciones registradas'}</div>
    </article>;
   })}</div>}
   <p style={{fontSize:11,color:'var(--muted)'}}>Las descargas y el uso de IA todavía no tienen una medición completa. Estos indicadores no incluyen esos eventos.</p>
  </>}
 </section>;
}
