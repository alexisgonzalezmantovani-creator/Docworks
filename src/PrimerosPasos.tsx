import React, {useEffect, useRef, useState} from 'react';

const DOCS=[['reserva','Reserva de compraventa'],['boleto','Boleto de compraventa'],['reserva_alquiler','Reserva de alquiler'],['alquiler','Contrato de alquiler'],['comodato','Comodato'],['exclusividad','Autorización de venta'],['refuerzo_reserva','Refuerzo de reserva'],['devolucion_reserva','Devolución de reserva']];
const FIELDS=[['nombre','Nombre de la inmobiliaria'],['direccion','Dirección'],['corredor_responsable','Corredor responsable'],['matricula','Matrícula del corredor'],['cuit','CUIT de la inmobiliaria'],['email','Email de contacto'],['telefono','Teléfono']];
function readDraft(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}

export function InicioInmobiliaria({open,perfil,contexto,onSave,onClose,onCreate}:any){
 const key='dw_inicio_empresa_'+contexto.inmobiliaria.id+'_'+contexto.usuario.id;
 const [draft,setDraft]=useState<{key:string;datos:Record<string,string>;step:number}|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[tipo,setTipo]=useState('reserva');
 const fileInput=useRef<HTMLInputElement>(null),dialog=useRef<HTMLDivElement>(null);
 const focusPending=useRef(false);
 const cargado=open&&draft?.key===key;
 const datos=cargado?draft.datos:{};
 const step=cargado?draft.step:0;

 useEffect(()=>{
  if(!open){setDraft(null);return;}
  const previous=document.activeElement as HTMLElement|null;
  const saved=readDraft(key);
  const defaults=Object.fromEntries(FIELDS.map(([field])=>[field,perfil[field]||(field==='nombre'?contexto.inmobiliaria.nombre:'')]));
  // Las versiones anteriores guardaban 1 para Equipo y 2 para Documento.
  const savedStep=saved?.step??(perfil.inicio_inmobiliaria?.completado?0:perfil.inicio_inmobiliaria?.paso??0);
  setDraft({key,datos:{...defaults,...saved?.datos,logoDataUrl:saved?.datos?.logoDataUrl??perfil.logoDataUrl??''},step:savedStep>0?1:0});
  setTipo('reserva');
  setError('');
  focusPending.current=true;
  return ()=>previous?.focus();
 },[open,key]);

 useEffect(()=>{
  if(!cargado)return;
  try{localStorage.setItem(key,JSON.stringify({datos:draft.datos,step:draft.step}));}catch{}
 },[cargado,draft,key]);

 useEffect(()=>{
  if(cargado&&focusPending.current){focusPending.current=false;dialog.current?.focus();}
 },[cargado,step]);

 if(!cargado)return null;

 function cambiarPaso(next:number){
  focusPending.current=true;
  setDraft(current=>current&&({...current,step:next}));
 }
 function actualizar(campo:string,valor:string){
  setDraft(current=>current?.key===key?{...current,datos:{...current.datos,[campo]:valor}}:current);
 }
 async function guardar(next:number,finished=false){
  setBusy(true);
  setError('');
  try{
   const p={...perfil,...datos,inicio_inmobiliaria:{paso:next===1?2:0,completado:finished||!!perfil.inicio_inmobiliaria?.completado,version:1}};
   const r=await onSave(p);
   if(r?.error)throw r.error;
   return true;
  }catch(e:any){
   setError(e.message||'No se pudo guardar. Revisá tu conexión e intentá de nuevo.');
   return false;
  }finally{setBusy(false);}
 }
 function logo(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];
  if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){setError('Elegí un PNG, JPG o WebP de hasta 2 MB.');return;}
  const reader=new FileReader();
  reader.onload=()=>actualizar('logoDataUrl',String(reader.result||''));
  reader.onerror=()=>setError('No se pudo leer el logo.');
  reader.readAsDataURL(file);
 }
 async function cerrarDespues(){if(!busy&&await guardar(step))onClose(false);}
 async function terminar(create:boolean){
  if(!await guardar(1,true))return;
  try{localStorage.removeItem(key);}catch{}
  onClose(true);
  if(create)onCreate(tipo);
 }

 function campo([k,label]:string[]){
  return <label key={k} htmlFor={'inicio-'+k}>{label}{k==='nombre'?' *':' (opcional)'}
   <input id={'inicio-'+k} className="inp" required={k==='nombre'} type={k==='email'?'email':k==='telefono'?'tel':'text'} maxLength={k==='direccion'?250:160} value={datos[k]||''} disabled={busy} onChange={e=>actualizar(k,e.target.value)}/>
  </label>;
 }

 return <div className="dw-start-overlay"><div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Prepará tu inmobiliaria" className="dw-start-card"
  onKeyDown={e=>{
   if(e.key==='Escape'){e.preventDefault();void cerrarDespues();}
   if(e.key!=='Tab')return;
   const els=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),summary')||[]).filter(el=>{
    const collapsed=el.closest('details:not([open])');
    return !el.hidden&&(!collapsed||el.tagName==='SUMMARY');
   });
   if(!els.length)return;
   const first=els[0],last=els[els.length-1];
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }}>
  <div className="dw-start-head"><div><p className="dw-help-kicker">Paso {step+1} de 2</p><h2>{step===0?'Tu inmobiliaria':'Tu primer documento'}</h2></div><button type="button" className="btn btn-ghost" disabled={busy} aria-label="Continuar después" onClick={cerrarDespues}>×</button></div>
  <div aria-label="Progreso" className="dw-start-progress">{[0,1].map(n=><span key={n} style={{background:n<=step?'var(--gold)':'var(--border)'}}/>)}</div>
  {error&&<p role="alert" className="notice notice-red">{error}</p>}
  {step===0?<form onInvalid={e=>{if(e.target instanceof HTMLElement){const group=e.target.closest('details');if(group)group.open=true;}}} onSubmit={async e=>{
   e.preventDefault();
   if(!datos.nombre?.trim()){setError('Completá el nombre de tu inmobiliaria.');return;}
   if(await guardar(1))cambiarPaso(1);
  }}>
   <p className="dw-help-desc">Estos datos se reutilizan en tus documentos.</p>
   <div className="dw-start-fields">{[FIELDS[0],FIELDS[2],FIELDS[3]].map(campo)}</div>
   <details style={{marginTop:12}}>
    <summary style={{cursor:'pointer',padding:'8px 0'}}>Dirección, contacto y logo</summary>
    <div className="dw-start-fields">{[FIELDS[1],...FIELDS.slice(4)].map(campo)}</div>
    <div className="dw-start-logo">
     {datos.logoDataUrl&&<img src={datos.logoDataUrl} alt="Logo de tu inmobiliaria"/>}
     <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={logo} hidden/>
     <button type="button" className="btn btn-secondary" disabled={busy} onClick={()=>fileInput.current?.click()}>Elegir logo (opcional)</button>
     {datos.logoDataUrl&&<button type="button" className="btn btn-ghost" disabled={busy} onClick={()=>actualizar('logoDataUrl','')}>Quitar</button>}
    </div>
   </details>
   <div className="dw-start-actions"><button className="btn btn-primary" disabled={busy}>{busy?'Guardando…':'Guardar y continuar'}</button></div>
  </form>:<>
   <p className="dw-help-desc">Elegí un documento para cargar los datos de la operación. El modelo ya está listo para usar.</p>
   <label htmlFor="inicio-documento">¿Con qué documento querés empezar?
    <select id="inicio-documento" className="inp" value={tipo} disabled={busy} onChange={e=>setTipo(e.target.value)}>{DOCS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>
   </label>
   <div className="dw-start-actions"><button className="btn btn-ghost" disabled={busy} onClick={()=>cambiarPaso(0)}>Anterior</button><button className="btn btn-secondary" disabled={busy} onClick={()=>terminar(false)}>Ir al panel</button><button className="btn btn-primary" disabled={busy} onClick={()=>terminar(true)}>{busy?'Guardando…':'Crear mi primer documento'}</button></div>
  </>}
 </div><style>{HELP_CSS}</style></div>;
}
export const GUIAS_AYUDA=[
 {id:'primeros',title:'Primeros pasos',view:'configuracion',tab:'cuenta',action:'Completar datos',items:[['¿Dónde cargo los datos de la inmobiliaria?','En Configuración → Mi cuenta podés cargar nombre, logo, dirección, CUIT, matrícula y contactos. Guardá los cambios antes de salir. El recorrido inicial te guía por los datos principales.'],['¿Cómo invito a un asesor?','Desde Configuración → Equipo, elegí agregar un integrante, ingresá su email y seleccioná rol y nivel. Compartí el enlace de registro con el asesor: debe crear una cuenta con ese mismo email y verificarlo para quedar vinculado al equipo. Solo dueño o administrador pueden gestionar el equipo.'],['¿Puedo continuar la configuración después?','Sí. Usá Continuar después en el recorrido. El paso se guarda con la inmobiliaria y el borrador de los campos queda en este dispositivo. Retomalo desde Ayuda o Soporte.']]},
 {id:'documentos',title:'Documentos y cláusulas',view:'clausulas',action:'Abrir cláusulas',items:[['¿Cómo creo un documento?','En Operaciones, tocá Nueva operación y elegí el tipo de documento. Completá las partes, inmueble y condiciones. Podés guardar un borrador y retomarlo desde Abrir o Editar.'],['¿Qué diferencia hay entre obligatorias y opcionales?','En Modelos de documentos elegí primero el tipo y abrí Introducción, Cláusulas, Cláusulas adicionales o Firmas. Cada sección se guarda al editarla y Registrar nueva versión conserva el historial. El dueño o administrador define el modelo; las cláusulas opcionales quedan disponibles para que el asesor decida cuáles agregar. El cambio a un contrato propio es opcional y no borra el modelo DocWorks.'],['¿Publicar un modelo cambia documentos anteriores?','La publicación aplica la nueva versión a las operaciones nuevas. Las existentes conservan su versión. Revisá la vista previa antes de publicar o exportar.']]},
 {id:'exportar',title:'Descargar y compartir',view:'dashboard',action:'Ver operaciones',items:[['¿Cómo descargo PDF o Word?','Abrí una operación y su documento. Revisá la vista previa y elegí PDF o Word. Si el teléfono abre una previsualización, usá su menú de compartir para guardarlo en Archivos o enviarlo.'],['¿Qué hago si faltan datos?','Los avisos de datos faltantes indican qué completar. Tocá el aviso para ir al campo correspondiente. Los datos críticos pueden bloquear la exportación; corregilos y volvé a revisar el documento.'],['¿Por qué no aparece Compartir en mi dispositivo?','El menú de compartir depende del navegador y del sistema. Podés descargar el archivo y compartirlo desde Archivos o desde tu aplicación de correo.']]},
 {id:'cuenta',title:'Cuenta, prueba y planes',view:'configuracion',tab:'facturacion',action:'Ver facturación',items:[['¿Cuánto dura la prueba?','Un mes calendario desde la verificación del email. No pide tarjeta ni genera cobros automáticos. La fecha de vencimiento se muestra dentro de la app.'],['¿Qué pasa cuando termina?','Los datos se conservan. Elegí un plan para continuar trabajando. El registro de prueba no crea una suscripción de Mercado Pago. Si luego contratás una, revisá sus condiciones antes de confirmar.'],['¿Cómo recupero mi contraseña?','En la pantalla de ingreso elegí recuperar contraseña e ingresá el email de tu cuenta. Revisá también correo no deseado. Usá el enlace más reciente; si venció, pedí uno nuevo.']]},
 {id:'problemas',title:'Problemas frecuentes',view:'configuracion',tab:'backup',action:'Ver respaldo',items:[['No veo un cambio guardado','Comprobá la conexión y que el guardado haya terminado. Si aparece un error, conservá la pantalla y reintentá. Evitá cerrar sesión o borrar datos del navegador antes de recuperar lo que estabas editando.'],['¿Cómo instalo DocWorks en iPhone o iPad?','Abrí la app en Safari, tocá Compartir y elegí Agregar a pantalla de inicio. Ingresá con tu cuenta. En Android usá Instalar app o Agregar a pantalla de inicio desde el navegador compatible.'],['¿Cómo recupero una operación borrada?','Buscala en la Papelera de operaciones y elegí restaurar, si sigue disponible. La eliminación permanente no se puede deshacer desde la papelera. El respaldo se gestiona desde Configuración → Respaldo.']]}
];
export function CentroAyuda({onContact,onTour,onNavigate,onOpenBot,role}:any){
 const [query,setQuery]=useState('');const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const q=norm(query.trim());const admin=['dueno','admin'].includes(role);
 const groups=GUIAS_AYUDA.map(g=>({...g,items:q?g.items.filter(([title,body])=>norm(g.title+' '+title+' '+body).includes(q)):g.items})).filter(g=>g.items.length);
 return <section aria-label="Centro de ayuda" style={{minWidth:0}}><style>{HELP_CSS}</style><p className="dw-help-kicker">Ayuda y soporte</p><h2 style={{fontSize:24,margin:'6px 0'}}>¿En qué te ayudamos?</h2><p className="dw-help-desc">Guías cortas para configurar tu cuenta, preparar documentos y resolver dudas.</p><label htmlFor="dw-help-search">Buscar en la ayuda<input id="dw-help-search" className="inp" type="search" placeholder="Ej.: invitar, PDF, contraseña…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  <div className="dw-help-cards"><article className="card"><h3>{admin?'Prepará tu inmobiliaria':'Empezá a trabajar'}</h3><p>{admin?'Completá los datos y creá tu primer documento.':'Las bases de tu inmobiliaria ya están definidas. Empezá por una operación.'}</p><button className="btn btn-primary" onClick={admin?onTour:()=>onNavigate('dashboard')}>{admin?'Retomar primeros pasos':'Ver operaciones'}</button></article><article className="card"><h3>Contactar soporte</h3><p>Describí el problema y adjuntá una captura. Revisá que no incluya información privada de tus clientes.</p><button className="btn btn-secondary" onClick={onContact}>Crear consulta</button><a className="btn btn-ghost" href="https://wa.me/5491144795880?text=Hola%2C%20necesito%20ayuda%20con%20DocWorks" target="_blank" rel="noopener noreferrer">WhatsApp</a></article><article className="card"><h3>Asistente IA</h3><p>Consultas y cláusulas genéricas, sin datos personales ni confidenciales. Las respuestas son orientativas.</p><button className="btn btn-secondary" onClick={onOpenBot}>Abrir asistente IA</button></article></div>
  <div aria-live="polite" style={{fontSize:13,margin:'18px 0'}}>{q?groups.reduce((n,g)=>n+g.items.length,0)+' respuestas encontradas':''}</div>{groups.length===0&&<p role="status">No encontramos una respuesta. Probá otra palabra o creá una consulta de soporte.</p>}
  {groups.map(g=><section key={g.id} className="dw-help-topic"><h3>{g.title}</h3>{g.items.map(([title,body])=><details key={title} open={q?true:undefined}><summary>{title}</summary><p>{body}</p></details>)}{(!['primeros','documentos','cuenta','problemas'].includes(g.id)||admin||g.id==='documentos')&&<button className="btn btn-ghost" onClick={()=>onNavigate(g.view,g.tab)}>{g.action}</button>}</section>)}
 <p style={{fontSize:12,marginTop:24}}><a href="https://docworks-landing.vercel.app/terminos.html" target="_blank" rel="noopener noreferrer" style={{color:"var(--muted)"}}>Términos y condiciones</a></p>
 </section>;
}
export const HELP_CSS=`.dw-start-overlay{position:fixed;inset:0;z-index:5000;background:rgba(3,8,18,.78);padding:16px;display:flex;overflow-y:auto}.dw-start-card{background:var(--card,#10192b);color:var(--text,#f8fafc);border:1px solid var(--border,#334155);border-radius:20px;padding:24px;width:100%;max-width:700px;margin:auto;box-sizing:border-box;min-width:0;outline:none;max-height:calc(100dvh - 32px);overflow:auto}.dw-start-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.dw-start-head h2{font-size:25px;margin:6px 0 10px}.dw-help-kicker{font-size:12px;color:var(--gold,#d4a853);font-weight:700;margin:0}.dw-help-desc{font-size:14px;line-height:1.7;color:var(--muted,#cbd5e1);margin:10px 0 20px}.dw-start-progress{display:flex;gap:6px;margin:8px 0 20px}.dw-start-progress span{height:4px;border-radius:4px;flex:1}.dw-start-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.dw-start-card label{font-size:13px;display:block}.dw-start-card .inp{display:block;width:100%;min-width:0;box-sizing:border-box;font-size:16px;margin-top:6px}.dw-start-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:22px}.dw-start-logo{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}.dw-start-logo img{width:80px;height:64px;object-fit:contain}.dw-help-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px;margin-top:22px}.dw-help-cards article{padding:18px;min-width:0}.dw-help-cards h3,.dw-help-topic h3{font-size:17px;margin:0 0 10px}.dw-help-cards p,.dw-help-topic p{font-size:13px;line-height:1.7;color:var(--muted);overflow-wrap:anywhere;margin:8px 0 14px}.dw-help-cards .btn{margin:4px 6px 0 0}.dw-help-topic{border:1px solid var(--border);border-radius:12px;padding:18px;margin-top:16px;min-width:0}.dw-help-topic details{border-top:1px solid var(--border);padding:12px 0}.dw-help-topic summary{font-size:14px;font-weight:600;cursor:pointer;overflow-wrap:anywhere}.dw-start-card .notice{overflow-wrap:anywhere}@media(max-width:540px){.dw-start-card{padding:18px}.dw-start-fields{grid-template-columns:minmax(0,1fr)}.dw-start-actions>.btn{flex:1 1 auto;min-height:44px}.dw-help-topic{padding:14px}}`;
