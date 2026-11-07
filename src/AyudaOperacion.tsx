import {useEffect,useState} from 'react';

export function rolesReutilizables(tipo){
  if(['alquiler','reserva_alquiler'].includes(tipo))return [{prefijo:'locador',label:'Locador'},{prefijo:'locatario',label:'Locatario'}];
  if(tipo==='comodato')return [{prefijo:'vendedor',label:'Comodante'},{prefijo:'comprador',label:'Comodatario'}];
  if(tipo==='exclusividad')return [{prefijo:'vendedor',label:'Autorizante'}];
  return [{prefijo:'vendedor',label:'Vendedor'},{prefijo:'comprador',label:'Comprador'}];
}
const PERSONA=['nombre','dni','domicilio','telefono','email','telefono_en_doc','email_en_doc'];
const INMUEBLE=['inmueble_direccion','inmueble_partido','inmueble_provincia','inmueble_tipo','inmueble_tipo_otro','inmueble_en_barrio_complejo','inmueble_barrio','inmueble_unidad_funcional','nomenclatura_catastral'];
export function prepararReutilizacion(origen,modo,desde,hacia,tipoDestino){
  if(!origen)throw Error('Elegí una operación de origen.');
  const patch:any={};
  if(modo==='inmueble'){for(const key of INMUEBLE)patch[key]=origen[key]??(key==='inmueble_en_barrio_complejo'?false:'');return patch;}
  if(modo!=='persona'||!rolesReutilizables(origen.tipo).some(r=>r.prefijo===desde)||!rolesReutilizables(tipoDestino).some(r=>r.prefijo===hacia))throw Error('Revisá las partes seleccionadas.');
  for(const key of PERSONA)patch[hacia+'_'+key]=origen[desde+'_'+key]??(key.endsWith('_en_doc')?false:'');
  patch[hacia+'_cotitulares']=(Array.isArray(origen[desde+'_cotitulares'])?origen[desde+'_cotitulares']:[]).filter(p=>p&&typeof p==='object'&&!Array.isArray(p)).map(p=>Object.fromEntries(PERSONA.map(key=>[key,p[key]??(key.endsWith('_en_doc')?false:'')])));
  return patch;
}
export function PreparacionDocumento({resultado}){
  const errores=Array.from(new Set<string>(resultado?.errores||[])),avisos=Array.from(new Set<string>(resultado?.avisos||[]));
  const listo=!errores.length&&!avisos.length;
  return <details data-testid="preparacion-documento" style={{border:'1px solid '+(listo?'rgba(34,197,94,.35)':'rgba(217,158,36,.4)'),background:listo?'rgba(34,197,94,.07)':'rgba(217,158,36,.07)',borderRadius:10,padding:'10px 12px',marginBottom:12,fontSize:12.5,overflowWrap:'anywhere'}}>
    <summary style={{cursor:'pointer',fontWeight:700,color:listo?'var(--green)':'var(--gold)'}}>{listo?'✓ Datos completos para PDF/Word':errores.length?'Revisar '+errores.length+' punto'+(errores.length===1?'':'s')+' para PDF/Word':'Revisar '+avisos.length+' aviso'+(avisos.length===1?'':'s')+' antes de emitir'}</summary>
    <p style={{margin:'8px 0',color:'var(--muted)'}}>Comprobación de datos y plantilla. Podés guardar el borrador en cualquier momento.</p>
    {errores.concat(avisos).map((texto,i)=><p key={i} style={{margin:'6px 0',color:'var(--text)'}}>{texto}</p>)}
    {listo&&<p style={{margin:'6px 0',color:'var(--muted)'}}>Los controles técnicos están completos. Revisá el contenido antes de emitir.</p>}
  </details>;
}
export function ReutilizarOperacion({data,operaciones,contexto,onAplicar}){
  const [abierto,setAbierto]=useState(false),[id,setId]=useState(''),[modo,setModo]=useState('inmueble'),[desde,setDesde]=useState(''),[hacia,setHacia]=useState(''),[preview,setPreview]=useState(false),[mensaje,setMensaje]=useState('');
  const tenant=contexto?.inmobiliariaId;
  const candidatas=(operaciones||[]).filter(o=>o.id!==data.id&&!o.deleted_at&&!o.eliminado_en&&(!tenant||!o.inmobiliaria_id||o.inmobiliaria_id===tenant));
  const origen=candidatas.find(o=>o.id===id),fuentes=origen?rolesReutilizables(origen.tipo):[],destinos=rolesReutilizables(data.tipo);
  useEffect(()=>{setPreview(false);setMensaje('');},[id,modo,desde,hacia,data.tipo,tenant]);
  useEffect(()=>{setId('');setDesde('');setHacia('');setPreview(false);},[data.tipo,tenant]);
  if(!candidatas.length)return null;
  const style={display:'flex',flexDirection:'column' as const,gap:6,minWidth:0,fontSize:12.5};
  return <div style={{marginBottom:12}}>
    <button type="button" className="btn btn-secondary btn-sm" aria-expanded={abierto} onClick={()=>{setAbierto(v=>!v);setPreview(false);}}>Reutilizar datos de otra operación</button>
    {abierto&&<div style={{border:'1px solid var(--border2)',borderRadius:10,padding:12,marginTop:8,display:'grid',gap:10}}>
      <label style={style}>Operación de origen<select className="inp" value={id} onChange={e=>{setId(e.target.value);setDesde('');}}><option value="">Elegí una operación accesible</option>{candidatas.map(o=><option key={o.id} value={o.id}>{o.inmueble_direccion||'Sin dirección'} · {o.comprador_nombre||o.locatario_nombre||o.vendedor_nombre||'Sin partes'}{o.created_at&&Number.isFinite(new Date(o.created_at).getTime())?' · '+new Date(o.created_at).toLocaleDateString('es-AR'):''}</option>)}</select></label>
      <label style={style}>Qué querés reutilizar<select className="inp" value={modo} onChange={e=>setModo(e.target.value)}><option value="inmueble">Datos del inmueble</option><option value="persona">Una parte y sus cotitulares</option></select></label>
      {modo==='persona'&&<><label style={style}>Parte de origen<select className="inp" value={desde} onChange={e=>setDesde(e.target.value)}><option value="">Elegí la parte</option>{fuentes.map(r=><option key={r.prefijo} value={r.prefijo}>{r.label}: {origen?.[r.prefijo+'_nombre']||'Sin nombre'}</option>)}</select></label><label style={style}>Copiar como<select className="inp" value={hacia} onChange={e=>setHacia(e.target.value)}><option value="">Elegí el rol en esta operación</option>{destinos.map(r=><option key={r.prefijo} value={r.prefijo}>{r.label}</option>)}</select></label></>}
      <p style={{fontSize:12,color:'var(--muted)',margin:0}}>Se reutilizan los datos seleccionados. Completá las fechas, importes y condiciones de esta operación.</p>
      {!preview?<button type="button" className="btn btn-secondary btn-sm" disabled={!origen||(modo==='persona'&&(!desde||!hacia))} onClick={()=>setPreview(true)}>Revisar copia</button>:<div style={{fontSize:13,display:'grid',gap:8}}><strong>{modo==='inmueble'?(origen?.inmueble_direccion||'Inmueble sin dirección'):origen?.[desde+'_nombre']||'Parte sin nombre'}</strong><span>{modo==='inmueble'?'Se reemplazarán los datos actuales del inmueble.':'Se reemplazarán los datos de '+(destinos.find(r=>r.prefijo===hacia)?.label||'la parte')+', incluidos contactos, cotitulares y su visibilidad en el documento.'}</span><div style={{display:'flex',flexWrap:'wrap',gap:8}}><button type="button" className="btn btn-ghost btn-sm" onClick={()=>setPreview(false)}>Cancelar copia</button><button type="button" className="btn btn-primary btn-sm" onClick={()=>{const actual=candidatas.find(o=>o.id===id);if(!actual){setPreview(false);return;}try{onAplicar(prepararReutilizacion(actual,modo,desde,hacia,data.tipo));setPreview(false);setAbierto(false);setMensaje('Datos reutilizados. Revisá los campos antes de guardar.');}catch{setPreview(false);setMensaje('Revisá la operación y las partes elegidas.');}}}>Reemplazar datos seleccionados</button></div></div>}
    </div>}
    {mensaje&&<p role="status" style={{fontSize:12,color:'var(--muted)',margin:'8px 0'}}>{mensaje}</p>}
  </div>;
}
