import React, { useEffect, useRef, useState } from "react";

// Un editor de texto plano: el contenido pertenece íntegramente a la inmobiliaria.
// Los datos variables se eligen de un catálogo cerrado y se resuelven al generar la operación.
const CHIPS = [
  ["comprador_nombre","Nombre del comprador"],["comprador_dni","DNI del comprador"],
  ["comprador_domicilio","Domicilio del comprador"],["vendedor_nombre","Nombre del vendedor"],
  ["vendedor_dni","DNI del vendedor"],["vendedor_domicilio","Domicilio del vendedor"],
  ["locador_nombre","Nombre del locador"],["locador_dni","DNI del locador"],["locador_domicilio","Domicilio del locador"],
  ["locatario_nombre","Nombre del locatario"],["locatario_dni","DNI del locatario"],["locatario_domicilio","Domicilio del locatario"],
  ["inmueble_direccion","Dirección del inmueble"],["inmueble_partido","Partido / municipio"],
  ["inmueble_provincia","Provincia"],["precio_letras","Precio en letras"],
  ["anticipo_letras","Reserva / anticipo en letras"],["saldo_letras","Saldo en letras"],
  ["alquiler_monto_letras","Alquiler en letras"],["fecha_operacion_larga","Fecha"],
  ["inmobiliaria_nombre","Inmobiliaria"],["inmobiliaria_matricula","Matrícula"],
  ["reserva_pago_acordado","Condiciones de pago de reserva"],
  ["boleto_pago_acordado","Condiciones de pago de boleto"],
  ["compra_condiciones_pago","Detalle de pago"],
  ["alquiler_inicio","Fecha de inicio del alquiler"],["alquiler_fin","Fecha de finalización"],
  ["exclusividad_vigencia","Vigencia de la autorización"]
] as const;

export default function DocumentoPropioEditor({
  tipo, perfil, onSavePerfil, confirmar, onCancelar
}: {
  tipo:string; perfil:any; onSavePerfil:(next:any)=>Promise<any>;
  confirmar:(mensaje:string,accion:()=>void)=>void; onCancelar:()=>void;
}) {
  const config=(perfil?.plantillas||{})[tipo]||{};
  const textoActual=String(config.documento_propio||"");
  const [texto,setTexto]=useState(textoActual);
  const [estado,setEstado]=useState<"idle"|"saving"|"saved"|"error">("idle");
  const [error,setError]=useState("");
  const [revisar,setRevisar]=useState(false);
  const [mostrarVista,setMostrarVista]=useState(false);
  const inputRef=useRef<HTMLTextAreaElement|null>(null);
  const dirty=texto!==textoActual;
  const todos=CHIPS.filter(([k])=> tipo==="alquiler"||tipo==="reserva_alquiler"
    ? !k.startsWith("comprador_")&&!k.startsWith("vendedor_")&&!k.startsWith("boleto_")
    : !k.startsWith("locador_")&&!k.startsWith("locatario_")&&!k.startsWith("alquiler_"));
  const permitidos=new Set<string>(todos.map(([key])=>key));
  const capturados=Array.from(new Set((texto.match(/\{\{[a-zA-Z0-9_]+\}\}/g)||[]).map(t=>t.slice(2,-2))));
  const invalidos=capturados.filter(t=>!permitidos.has(t));
  const llavesMal=/\{\{|\}\}/.test(texto.replace(/\{\{[a-zA-Z0-9_]+\}\}/g,""));
  const nombres=tipo==="alquiler"||tipo==="reserva_alquiler"?["locador_nombre","locatario_nombre"]:tipo==="exclusividad"?["vendedor_nombre"]:["comprador_nombre","vendedor_nombre"];
  const faltantes=[...nombres,"inmueble_direccion"].filter(t=>!capturados.includes(t));
  const valido=texto.trim().length>40&&texto.length<=80000&&!invalidos.length&&!llavesMal&&!faltantes.length;
  useEffect(()=>{
    if(!dirty||estado==="saving")return;
    function beforeUnload(ev:BeforeUnloadEvent){ev.preventDefault();ev.returnValue="";}
    function proteger(ev:Event){
      const evento=ev as CustomEvent<{continuar:()=>void}>;
      if(ev.defaultPrevented)return;
      ev.preventDefault();
      confirmar("¿Descartar los cambios sin guardar de tu contrato?",()=>{
        if(evento.detail&&typeof evento.detail.continuar==="function")evento.detail.continuar();
      });
    }
    window.addEventListener("beforeunload",beforeUnload);
    window.addEventListener("dw:model-navigation",proteger);
    return ()=>{
      window.removeEventListener("beforeunload",beforeUnload);
      window.removeEventListener("dw:model-navigation",proteger);
    };
  },[dirty,estado,confirmar]);
  function cambiarTexto(v:string){setTexto(v);setRevisar(false);setMostrarVista(false);setError("");setEstado("idle");}
  function insertar(key:string){
    if(!permitidos.has(key))return;
    const el=inputRef.current;
    const from=el&&typeof el.selectionStart==="number"?el.selectionStart:texto.length;
    const to=el&&typeof el.selectionEnd==="number"?el.selectionEnd:from;
    const chip="{{"+key+"}}";
    cambiarTexto(texto.slice(0,from)+chip+texto.slice(to));
    setTimeout(()=>{if(inputRef.current){inputRef.current.focus();inputRef.current.setSelectionRange(from+chip.length,from+chip.length);}},0);
  }
  async function guardar(){
    setRevisar(true);setError("");
    if(!valido){setError("Antes de guardar, corregí los campos señalados en Revisar.");return;}
    setEstado("saving");
    const perfilPrev=perfil;
    const mapa={...(perfilPrev.plantillas||{})};
    const anterior={...(mapa[tipo]||{})};
    mapa[tipo]={...anterior,modo_documento:"propio",documento_propio:texto.replace(/\r\n?/g,"\n"),
      documento_propio_anterior:anterior.modo_documento==="propio"?String(anterior.documento_propio||""):null,
      version:Math.max(1,parseInt(String(anterior.version||1),10)||1)+1,version_updated_at:new Date().toISOString()};
    try{
      const res=await onSavePerfil({...perfilPrev,plantillas:mapa});
      if(res&&res.error)throw res.error;
      setEstado("saved");
    }catch(err:any){setEstado("error");setError(err?.message||"No se pudo guardar. El contrato sigue en pantalla.");}
  }
  return <section className="card" aria-label="Editor de contrato propio" style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{fontSize:17,fontWeight:750,color:"var(--text)"}}>Tu contrato completo</div>
    <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>
      Copiá desde Word y pegá acá la introducción, las cláusulas y las firmas. El texto mantiene los párrafos; el formato de Word, sus tablas e imágenes no se importan. DocWorks no añadirá cláusulas.
    </div>
    <textarea ref={inputRef} className="inp" aria-label="Texto del contrato propio" value={texto} disabled={estado==="saving"}
      style={{width:"100%",minHeight:360,resize:"vertical",boxSizing:"border-box",fontSize:14,lineHeight:1.65,whiteSpace:"pre-wrap"}}
      placeholder="Pegá acá todo tu contrato…" onChange={ev=>cambiarTexto(ev.target.value)} />
    <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      <label style={{fontSize:12,fontWeight:650,color:"var(--text)"}}>Insertar dato automático
        <select className="inp" style={{display:"block",width:"min(100%,320px)",marginTop:5}} defaultValue=""
          aria-label="Agregar chip en la posición del cursor" onChange={ev=>{insertar(ev.target.value);ev.target.value="";}}>
          <option value="">Elegir un dato…</option>
          {todos.map(([key,label])=><option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <span style={{fontSize:11,color:"var(--muted)"}}>{texto.length.toLocaleString("es-AR")} / 80.000 caracteres</span>
    </div>
    {revisar&&<div role={valido?"status":"alert"} style={{padding:11,borderRadius:8,border:"1px solid var(--border)",fontSize:12,lineHeight:1.6,color:valido?"var(--green)":"var(--amber)"}}>
      {valido?"✓ Los datos principales están vinculados. Revisá también la redacción y los importes antes de usarlo.":[
        texto.trim().length<=40?"Pegá el texto completo del contrato":null,
        texto.length>80000?"El texto supera los 80.000 caracteres":null,
        faltantes.length?"Faltan chips: "+faltantes.map(t=>CHIPS.find(([k])=>k===t)?.[1]||t).join(", "):null,
        invalidos.length?"Chips desconocidos: "+invalidos.join(", "):null,
        llavesMal?"Hay chips con llaves incompletas":null
      ].filter(Boolean).join(". ")}
    </div>}
    {error&&<div role="alert" style={{fontSize:12,color:"var(--red)"}}>{error}</div>}
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <button type="button" className="btn btn-secondary" onClick={()=>{setRevisar(true);setMostrarVista(false);}}>Revisar</button>
      <button type="button" className="btn btn-secondary" onClick={()=>setMostrarVista(v=>!v)}>{mostrarVista?"Cerrar vista previa":"Vista previa"}</button>
      <button type="button" className="btn btn-primary" disabled={estado==="saving"} onClick={guardar}>{estado==="saving"?"Guardando…":"Guardar cambios"}</button>
      {estado==="saved"&&<span role="status" style={{fontSize:12,color:"var(--green)",alignSelf:"center"}}>✓ Guardado para próximas operaciones</span>}
    </div>
    {mostrarVista&&<div style={{background:"#fff",color:"#243447",border:"1px solid #d1d5db",borderRadius:8,padding:"clamp(18px,4vw,36px)",lineHeight:1.65,fontSize:13,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>
      <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>VISTA DEL TEXTO · los chips se completarán con los datos reales</div>
      {texto.split(/(\{\{[a-zA-Z0-9_]+\}\})/g).map((trozo,i)=>/^\{\{[a-zA-Z0-9_]+\}\}$/.test(trozo)
        ? <span key={i} style={{background:"#e0f2fe",color:"#075985",borderRadius:4}}>{CHIPS.find(([key])=>key===trozo.slice(2,-2))?.[1]||trozo}</span>
        : <span key={i}>{trozo}</span>)}
    </div>}
    <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.5}}>
      Este modelo no modifica operaciones anteriores. El contrato propio debe ser revisado por la inmobiliaria; DocWorks no verifica automáticamente su validez jurídica.
    </div>
    {config.modo_documento!=="propio"&&<button type="button" className="btn btn-ghost btn-sm" style={{alignSelf:"flex-start"}} onClick={()=>{if(dirty)confirmar("¿Descartar los cambios sin guardar?",onCancelar);else onCancelar();}}>← Volver al modelo DocWorks</button>}
  </section>;
}
