import React, { useEffect, useRef, useState } from "react";

// Los chips representan datos de una operación, no texto reutilizable:
// detectar duplicados también cuando el contrato llega pegado desde Word.
export function analizarChipsDocumentoPropio(texto:string, permitidos:Set<string>) {
  const apariciones=Array.from(String(texto||"").matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g),m=>m[1]);
  const capturados=Array.from(new Set(apariciones));
  const repetidos=capturados.filter(key=>apariciones.filter(item=>item===key).length>1);
  const invalidos=capturados.filter(key=>!permitidos.has(key));
  const llavesMal=/\{\{|\}\}/.test(String(texto||"").replace(/\{\{[a-zA-Z0-9_]+\}\}/g,""));
  return {capturados,repetidos,invalidos,llavesMal};
}

// Mantener la inserción dentro del texto seleccionado sin mover párrafos.
export function insertarDatoAutomatico(texto:string,key:string,inicio:number,fin:number){
  const base=String(texto||"");
  let desde=Math.max(0,Math.min(base.length,Number.isFinite(inicio)?Math.trunc(inicio):base.length));
  let hasta=Math.max(desde,Math.min(base.length,Number.isFinite(fin)?Math.trunc(fin):desde));
  // Nunca cortar una variable existente por la mitad: si el cursor cae dentro
  // de un chip, insertamos después; si una selección lo toca, lo incluye entero.
  const tokens=Array.from(base.matchAll(/\{\{[a-zA-Z0-9_]+\}\}/g),m=>({
    inicio:m.index,fin:m.index+m[0].length
  }));
  if(desde===hasta){
    const interior=tokens.find(t=>desde>t.inicio&&desde<t.fin);
    if(interior){desde=interior.fin;hasta=interior.fin;}
  }else{
    for(const token of tokens){
      if(token.inicio<hasta&&token.fin>desde){
        desde=Math.min(desde,token.inicio);
        hasta=Math.max(hasta,token.fin);
      }
    }
  }
  const chip="{{"+key+"}}";
  // Los importes y nombres no deben quedar pegados a palabras del Word.
  // No tocar puntuación ni espacios existentes.
  const previo=base.slice(0,desde),posterior=base.slice(hasta);
  const separadorAntes=/[\p{L}\p{N}]/u.test(previo.slice(-1))?" ":"";
  const separadorDespues=/^[\p{L}\p{N}]/u.test(posterior)?" ":"";
  const cursor=previo.length+separadorAntes.length+chip.length;
  return {texto:previo+separadorAntes+chip+separadorDespues+posterior,cursor};
}

// Quitar el chip elegido sin modificar ningún otro dato ni el texto restante.
export function quitarDatoAutomatico(texto:string,key:string){
  const base=String(texto||"");
  const chip="{{"+key+"}}";
  const inicio=base.indexOf(chip);
  if(inicio<0)return {texto:base,cursor:null};
  const fin=inicio+chip.length;
  const previo=base.slice(0,inicio),posterior=base.slice(fin);
  // Entre dos palabras, retirar solo uno de los dos espacios si sobran.
  const dobleEspacio=previo.endsWith(" ")&&posterior.startsWith(" ");
  return {texto:previo+(dobleEspacio?posterior.slice(1):posterior),cursor:inicio};
}

// Un editor de texto plano: el contenido pertenece íntegramente a la inmobiliaria.
// Los datos variables se eligen de un catálogo cerrado y se resuelven al generar la operación.
const CHIPS = [
  ["comprador_nombre","Nombre del comprador"],["comprador_tratamiento","Tratamiento del comprador (Sr./Sra.)"],["comprador_articulo","Artículo del comprador (el/la)"],["comprador_dni","DNI del comprador"],
  ["comprador_domicilio","Domicilio del comprador"],["vendedor_nombre","Nombre del vendedor"],
  ["vendedor_dni","DNI del vendedor"],["vendedor_tratamiento","Tratamiento del vendedor (Sr./Sra.)"],["vendedor_articulo","Artículo del vendedor (el/la)"],["vendedor_domicilio","Domicilio del vendedor"],
  ["locador_nombre","Nombre del locador"],["locador_tratamiento","Tratamiento del locador (Sr./Sra.)"],["locador_articulo","Artículo del locador (el/la)"],["locador_dni","DNI del locador"],["locador_domicilio","Domicilio del locador"],
  ["locatario_nombre","Nombre del locatario"],["locatario_tratamiento","Tratamiento del locatario (Sr./Sra.)"],["locatario_articulo","Artículo del locatario (el/la)"],["locatario_dni","DNI del locatario"],["locatario_domicilio","Domicilio del locatario"],
  ["comodante_nombre","Nombre del comodante"],["comodante_tratamiento","Tratamiento del comodante (Sr./Sra.)"],["comodante_articulo","Artículo del comodante (el/la)"],["comodante_dni","DNI del comodante"],["comodante_domicilio","Domicilio del comodante"],
  ["comodatario_nombre","Nombre del comodatario"],["comodatario_tratamiento","Tratamiento del comodatario (Sr./Sra.)"],["comodatario_articulo","Artículo del comodatario (el/la)"],["comodatario_dni","DNI del comodatario"],["comodatario_domicilio","Domicilio del comodatario"],
  ["autorizante_nombre","Nombre del autorizante"],["autorizante_tratamiento","Tratamiento del autorizante (Sr./Sra.)"],["autorizante_articulo","Artículo del autorizante (el/la)"],["autorizante_dni","DNI del autorizante"],["autorizante_domicilio","Domicilio del autorizante"],
  ["inmueble_direccion","Dirección completa del inmueble"],["inmueble_partido","Partido / municipio"],
  ["inmueble_provincia","Provincia"],["precio_letras","Precio"],
  ["anticipo_letras","Reserva / anticipo"],["saldo_letras","Saldo"],
  ["alquiler_monto_letras","Alquiler mensual"],
  ["reserva_alquiler_reserva","Reserva de alquiler"],
  ["reserva_alquiler_canon","Alquiler estimado"],
  ["fecha_operacion_larga","Fecha"],
  ["inmobiliaria_nombre","Inmobiliaria"],["inmobiliaria_matricula","Matrícula"],
  ["reserva_pago_acordado","Condiciones de pago de reserva"],
  ["boleto_pago_acordado","Condiciones de pago de boleto"],
  ["compra_condiciones_pago","Detalle de pago"],
  ["compra_instrumento_nombre","Instrumentación prevista"],
  ["compra_boleto_origen","Datos del boleto antecedente"],
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
  const espejoRef=useRef<HTMLDivElement|null>(null);
  const [editandoTexto,setEditandoTexto]=useState(false);
  const [ultimaAccionChip,setUltimaAccionChip]=useState<{textoAnterior:string;textoPosterior:string;cursorAnterior:number;scrollAnterior:number}|null>(null);
  // Recordar la selección del texto antes de que el selector de chips tome el foco (iPhone/Safari).
  const seleccionRef=useRef({inicio:textoActual.length,fin:textoActual.length});
  const guardandoRef=useRef(false);
  const [textoGuardadoLocal,setTextoGuardadoLocal]=useState<string|null>(null);
  const baseGuardada=textoGuardadoLocal===null?textoActual:textoGuardadoLocal;
  const dirty=texto!==baseGuardada;
  const necesitaGuardar=dirty||config.modo_documento!=="propio";
  // Mantener el texto recién guardado mientras vuelve la confirmación del perfil.
  // Una actualización externa del modelo solo reemplaza un editor sin modificaciones.
  useEffect(()=>{
    if(textoGuardadoLocal!==null){
      if(textoActual===textoGuardadoLocal)setTextoGuardadoLocal(null);
    }else if(!dirty&&texto!==textoActual){
      setTexto(textoActual);
      seleccionRef.current={inicio:textoActual.length,fin:textoActual.length};
      setEstado("idle");
    }
  },[textoActual,textoGuardadoLocal,dirty,texto]);
  const grupo=tipo==="alquiler"||tipo==="reserva_alquiler"?"locacion":tipo==="comodato"?"comodato":tipo==="exclusividad"?"exclusividad":"compra";
  const rolesPorGrupo:Record<string,string[]>={
    locacion:["locador","locatario"], comodato:["comodante","comodatario"],
    exclusividad:["autorizante"], compra:["comprador","vendedor"]
  };
  const todos=CHIPS.filter(([k])=>{
    const rol=k.match(/^(comprador|vendedor|locador|locatario|comodante|comodatario|autorizante)_/);
    if(rol)return rolesPorGrupo[grupo].includes(rol[1]);
    if(k==="reserva_pago_acordado")return tipo==="reserva";
    if(k==="boleto_pago_acordado")return tipo==="boleto";
    if(k==="compra_condiciones_pago"||k==="compra_instrumento_nombre"||k==="compra_boleto_origen")return tipo==="reserva"||tipo==="boleto";
    if(k==="exclusividad_vigencia")return tipo==="exclusividad";
    if(k==="alquiler_inicio"||k==="alquiler_fin"||k==="alquiler_monto_letras")return tipo==="alquiler";
    if(k==="reserva_alquiler_reserva"||k==="reserva_alquiler_canon")return tipo==="reserva_alquiler";
    if(k==="precio_letras")return grupo==="compra"||grupo==="exclusividad";
    if(k==="anticipo_letras"||k==="saldo_letras")return tipo==="reserva"||tipo==="boleto";
    return true;
  });
  const permitidos=new Set<string>(todos.map(([key])=>key));
  const {capturados,repetidos,invalidos,llavesMal}=analizarChipsDocumentoPropio(texto,permitidos);
  // Cada dato automático se ofrece una sola vez dentro del contrato completo.
  // La lista se recalcula al escribir o borrar, sin perder la posición del cursor.
  const disponibles=todos.filter(([key])=>!capturados.includes(key)&&key!=="inmueble_partido"&&key!=="inmueble_provincia");
  // Ubicación agrupada solo en este editor. Los chips antiguos de partido y
  // provincia siguen siendo válidos en los contratos ya guardados.
  const gruposInsercion=[
    {titulo:"Personas",items:disponibles.filter(([key])=>/^(comprador|vendedor|locador|locatario|comodante|comodatario|autorizante)_/.test(key))},
    {titulo:"Inmueble",items:disponibles.filter(([key])=>/^inmueble_/.test(key))},
    {titulo:"Importes y fechas",items:disponibles.filter(([key])=>/^(precio_|anticipo_|saldo_|alquiler_|reserva_alquiler_|fecha_)/.test(key))},
    {titulo:"Condiciones de pago",items:disponibles.filter(([key])=>/^(reserva_pago_|boleto_pago_|compra_)/.test(key))},
    {titulo:"Inmobiliaria y otros",items:disponibles.filter(([key])=>/^(inmobiliaria_|exclusividad_)/.test(key))}
  ];
  const nombres=grupo==="locacion"?["locador_nombre","locatario_nombre"]
    :grupo==="comodato"?["comodante_nombre","comodatario_nombre"]
    :grupo==="exclusividad"?["autorizante_nombre","inmobiliaria_nombre"]
    :["comprador_nombre","vendedor_nombre"];
  const faltantes=[...nombres,"inmueble_direccion"].filter(t=>!capturados.includes(t));
  const valido=texto.trim().length>40&&texto.length<=80000&&!invalidos.length&&!repetidos.length&&!llavesMal&&!faltantes.length;
  const chipsImportesRecomendados=tipo==="reserva_alquiler"?["reserva_alquiler_reserva","reserva_alquiler_canon"]
    :tipo==="alquiler"?["alquiler_monto_letras"]
    :(tipo==="reserva"||tipo==="boleto"||tipo==="exclusividad"||tipo==="refuerzo_reserva"||tipo==="devolucion_reserva")?["precio_letras"]:[];
  const importesSinChip=chipsImportesRecomendados.filter(k=>!capturados.includes(k));
  // Accesos rápidos cortos: lo insertado desaparece y queda en el documento.
  const ordenSugeridos=[...nombres,"inmueble_direccion",...chipsImportesRecomendados,...rolesPorGrupo[grupo].map(rol=>rol+"_dni"),"fecha_operacion_larga","inmobiliaria_nombre"];
  const chipsSugeridos=disponibles.filter(([key])=>
    nombres.includes(key)||rolesPorGrupo[grupo].some(rol=>key===rol+"_dni")||
    key==="inmueble_direccion"||chipsImportesRecomendados.includes(key)||
    key==="fecha_operacion_larga"||key==="inmobiliaria_nombre"
  ).sort((a,b)=>ordenSugeridos.indexOf(a[0])-ordenSugeridos.indexOf(b[0])).slice(0,8);
  // Un DNI fijo del Word original puede filtrar datos de otra operación.
  // Es orientativo: nunca reemplazamos ni alteramos el texto del usuario.
  const textoSinChips=texto.replace(/\{\{[a-zA-Z0-9_]+\}\}/g,"");
  const dniFijo=/\b(?:DNI|D\.N\.I\.)\s*(?:N[°ºo.]?\s*)?\d[\d.\s-]{6,13}/i.test(textoSinChips);
  // Estas advertencias NO incorporan cláusulas ni impiden guardar: solo ayudan a revisar el Word.
  const advertenciasContenido=[
    !/(firma|firmantes|suscriben|rúbrica|rubrica)/i.test(texto)?"No encontramos una referencia clara a las firmas":null,
    !/(honorarios|comisi[oó]n|intermediaci[oó]n|retribuci[oó]n)/i.test(texto)?"Revisá si el texto contempla los honorarios":null,
    !/(jurisdicci[oó]n|tribunales|juzgados|competencia judicial)/i.test(texto)?"Revisá si corresponde especificar la jurisdicción":null
  ].filter(Boolean);
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
  function cambiarTexto(v:string,mantenerRevision=false){setTexto(v);if(!mantenerRevision)setRevisar(false);setMostrarVista(false);setError("");setEstado("idle");}
  function deshacerUltimoChip(){
    const accion=ultimaAccionChip;
    if(!accion||texto!==accion.textoPosterior)return;
    cambiarTexto(accion.textoAnterior);
    setUltimaAccionChip(null);
    seleccionRef.current={inicio:accion.cursorAnterior,fin:accion.cursorAnterior};
    requestAnimationFrame(()=>{
      const input=inputRef.current;
      if(input)input.scrollTop=accion.scrollAnterior;
    });
  }
  function recordarSeleccion(el:HTMLTextAreaElement){
    seleccionRef.current={inicio:el.selectionStart,fin:el.selectionEnd};
  }
  // Tocar un dato insertado permite encontrarlo en el contrato sin modificarlo.
  // La selección se mantiene en el textarea nativo, también en Safari/iPhone.
  function irAlDato(key:string){
    const pos=texto.indexOf("{{"+key+"}}");
    if(pos<0)return;
    setEditandoTexto(true);
    seleccionRef.current={inicio:pos,fin:pos+key.length+4};
    requestAnimationFrame(()=>{
      const input=inputRef.current;
      if(!input)return;
      input.focus();
      input.setSelectionRange(pos,pos+key.length+4);
      const linea=texto.slice(0,pos).split("\n").length-1;
      input.scrollTop=Math.max(0,linea*26-70);
    });
  }
  function quitar(key:string){
    const nuevo=quitarDatoAutomatico(texto,key);
    if(nuevo.cursor===null)return;
    const input=inputRef.current;
    const scrollPrevio=input?.scrollTop??0;
    setUltimaAccionChip({textoAnterior:texto,textoPosterior:nuevo.texto,cursorAnterior:seleccionRef.current.inicio,scrollAnterior:scrollPrevio});
    cambiarTexto(nuevo.texto);
    seleccionRef.current={inicio:nuevo.cursor,fin:nuevo.cursor};
    requestAnimationFrame(()=>{
      if(!inputRef.current)return;
      inputRef.current.scrollTop=scrollPrevio;
    });
  }
  function insertar(key:string,mantenerRevision=false){
    if(!permitidos.has(key)||capturados.includes(key))return;
    // El select nativo suele mover la selección a 0 o al final; usamos la última del textarea.
    const nuevo=insertarDatoAutomatico(texto,key,seleccionRef.current.inicio,seleccionRef.current.fin);
    const scrollPrevio=inputRef.current?.scrollTop??0;
    setUltimaAccionChip({textoAnterior:texto,textoPosterior:nuevo.texto,cursorAnterior:seleccionRef.current.inicio,scrollAnterior:scrollPrevio});
    cambiarTexto(nuevo.texto,mantenerRevision);
    seleccionRef.current={inicio:nuevo.cursor,fin:nuevo.cursor};
    // No robar el foco al selector en iPhone (evita abrir el teclado de golpe).
    // Si el editor ya estaba activo, conservar el cursor y el desplazamiento.
    requestAnimationFrame(()=>{
      const input=inputRef.current;
      if(!input)return;
      input.scrollTop=scrollPrevio;
      if(document.activeElement===input)input.setSelectionRange(nuevo.cursor,nuevo.cursor);
    });
  }
  async function guardar(){
    if(guardandoRef.current||!necesitaGuardar)return;
    setRevisar(true);setError("");
    if(!valido){setError("Antes de guardar, corregí los campos señalados en Revisar.");return;}
    guardandoRef.current=true;
    setUltimaAccionChip(null);
    setEstado("saving");
    const perfilPrev=perfil;
    const mapa={...(perfilPrev.plantillas||{})};
    const anterior={...(mapa[tipo]||{})};
    const textoFinal=texto.replace(/\r\n?/g,"\n");
    const anteriorTexto=String(anterior.documento_propio||"");
    const esEdicionPrevista=anterior.modo_documento==="propio"&&anteriorTexto!==textoFinal;
    const historialAnterior=Array.isArray(anterior.historial_documento_propio)?anterior.historial_documento_propio:[];
    const candidatosHistorial=esEdicionPrevista&&anteriorTexto.trim()
      ?[{version:Math.max(1,parseInt(String(anterior.version||1),10)||1),texto:anteriorTexto,fecha:anterior.version_updated_at||null},...historialAnterior]
      :historialAnterior;
    // Límite de memoria por inmobiliaria: hasta 5 versiones y 200.000 caracteres
    // entre todas las copias. El último texto siempre se puede recuperar.
    let acumulados=0;
    const historialNuevo=candidatosHistorial.filter((item:any)=>{
      const largo=String(item&&item.texto||"").length;
      if(!largo||acumulados+largo>200000)return false;
      acumulados+=largo;
      return true;
    }).slice(0,5);
    mapa[tipo]={...anterior,modo_documento:"propio",documento_propio:textoFinal,
      documento_propio_anterior:esEdicionPrevista?anteriorTexto:(anterior.documento_propio_anterior||null),
      historial_documento_propio:historialNuevo,
      version:Math.max(1,parseInt(String(anterior.version||1),10)||1)+1,
      version_updated_at:new Date().toISOString()};
    try{
      const res=await onSavePerfil({...perfilPrev,plantillas:mapa});
      if(res&&res.error)throw res.error;
      setTextoGuardadoLocal(textoFinal);
      setEstado("saved");
    }catch(err:any){setEstado("error");setError(err?.message||"No se pudo guardar. El contrato sigue en pantalla.");}
    finally{guardandoRef.current=false;}
  }
  const historial=Array.isArray(config.historial_documento_propio)?config.historial_documento_propio:[];
  const versionActual=Math.max(1,parseInt(String(config.version||1),10)||1);
  const candidatas=[
    {version:Math.max(1,versionActual-1),texto:String(config.documento_propio_anterior||"")},
    ...historial.map((item:any)=>({version:item?.version||"anterior",texto:String(item?.texto||"")}))
  ];
  const versionesDisponibles=candidatas.filter((item,i,items)=>
    item.texto.trim()&&item.texto!==textoActual&&items.findIndex(otro=>otro.texto===item.texto)===i
  ).slice(0,5);
  function recuperarVersion(item:{version:string|number;texto:string}){
    confirmar("¿Recuperar la versión "+item.version+"? Se abrirá como borrador, sin sobrescribir el modelo publicado hasta que guardes.",()=>{
      setUltimaAccionChip(null);
      cambiarTexto(item.texto);
      seleccionRef.current={inicio:item.texto.length,fin:item.texto.length};
      inputRef.current?.focus();
    });
  }
  return <section className="card" aria-label="Editor de contrato propio" style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{fontSize:17,fontWeight:750,color:"var(--text)"}}>Tu contrato completo</div>
    <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>
      Copiá desde Word y pegá acá la introducción, las cláusulas y las firmas. El texto mantiene los párrafos; el formato de Word, sus tablas e imágenes no se importan. DocWorks no añadirá cláusulas.
    </div>
    {/* El textarea conserva edición nativa, teclado iOS, selección y texto original.
        El espejo visual colorea las variables sin alterar las llaves internas que
        necesita el generador de documentos. No se agrega zoom ni editor externo. */}
    <div style={{position:"relative",minHeight:360}}>
      <div ref={espejoRef} aria-hidden="true" style={{
        position:"absolute",inset:0,zIndex:0,pointerEvents:"none",overflow:"auto",visibility:editandoTexto?"hidden":"visible",
        border:"1px solid transparent",borderRadius:8,padding:"12px",
        boxSizing:"border-box",fontFamily:"inherit",fontSize:16,lineHeight:1.65,
        whiteSpace:"pre-wrap",overflowWrap:"break-word",wordBreak:"normal",
        color:"var(--text)"
      }}>{texto.split(/(\{\{[a-zA-Z0-9_]+\}\})/g).map((fragmento,i)=>{
        const match=/^\{\{([a-zA-Z0-9_]+)\}\}$/.exec(fragmento);
        if(!match)return <React.Fragment key={i}>{fragmento}</React.Fragment>;
        const etiqueta=CHIPS.find(([key])=>key===match[1])?.[1]||match[1].replace(/_/g," ");
        const invalido=!permitidos.has(match[1])||repetidos.includes(match[1]);
        return <span key={i} style={{background:invalido?"#fee2e2":"#dff3ff",color:invalido?"#991b1b":"#0369a1",borderRadius:4,fontWeight:650,boxDecorationBreak:"clone",WebkitBoxDecorationBreak:"clone"}}>{etiqueta}</span>;
      })}{texto.endsWith("\n")?"\u200b":null}</div>
      <textarea ref={inputRef} className="inp" aria-label="Texto del contrato propio" value={texto} disabled={estado==="saving"}
        style={{position:"relative",zIndex:1,width:"100%",height:360,minHeight:360,resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",padding:12,fontSize:16,lineHeight:1.65,whiteSpace:"pre-wrap",overflowWrap:"break-word",color:editandoTexto||!texto?"var(--text)":"transparent",caretColor:"var(--text)",background:"transparent"}}
        placeholder="Pegá acá todo tu contrato…" onFocus={()=>setEditandoTexto(true)} onBlur={()=>setEditandoTexto(false)} onChange={ev=>{setUltimaAccionChip(null);cambiarTexto(ev.target.value);recordarSeleccion(ev.currentTarget);}}
        onScroll={ev=>{if(espejoRef.current){espejoRef.current.scrollTop=ev.currentTarget.scrollTop;espejoRef.current.scrollLeft=ev.currentTarget.scrollLeft;}}}
        onSelect={ev=>recordarSeleccion(ev.currentTarget)}
        onClick={ev=>recordarSeleccion(ev.currentTarget)}
        onKeyUp={ev=>recordarSeleccion(ev.currentTarget)}
        onKeyDown={ev=>{if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="s"){ev.preventDefault();guardar();}}} />
    </div>
    {capturados.length>0&&<div aria-label="Datos automáticos ya insertados" style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:6}}>
      <span style={{fontSize:11,color:"var(--muted)",marginRight:3}}>En tu contrato:</span>
      {capturados.map(key=>{
        const etiqueta=CHIPS.find(([k])=>k===key)?.[1]||key.replace(/_/g," ");
        const errorChip=invalidos.includes(key)||repetidos.includes(key);
        return <span key={key} style={{display:"inline-flex",alignItems:"stretch",maxWidth:"100%",
            border:"1px solid "+(errorChip?"#fca5a5":"rgba(56,189,248,.35)"),
            color:errorChip?"#991b1b":"#0369a1",background:errorChip?"#fee2e2":"#dff3ff",
            borderRadius:7,overflow:"hidden",fontSize:11,fontWeight:650}}>
          <button type="button" title={"Buscar "+etiqueta+" en el texto"} aria-label={"Buscar "+etiqueta+" en el contrato"}
            disabled={estado==="saving"} onClick={()=>irAlDato(key)}
            style={{padding:"5px 7px",border:0,background:"transparent",color:"inherit",font:"inherit",cursor:"pointer",textAlign:"left",overflowWrap:"anywhere"}}>{etiqueta}</button>
          <button type="button" title={"Quitar "+etiqueta+" del contrato"} aria-label={"Quitar "+etiqueta+" del contrato"}
            disabled={estado==="saving"} onClick={()=>quitar(key)}
            style={{minWidth:26,padding:"4px 6px",border:0,borderLeft:"1px solid rgba(3,105,161,.16)",background:"transparent",color:"inherit",fontSize:15,cursor:"pointer"}}>×</button>
        </span>;
      })}
    </div>}
    <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      <label style={{fontSize:12,fontWeight:650,color:"var(--text)"}}>Insertar dato automático
        <select className="inp" style={{display:"block",width:"min(100%,320px)",marginTop:5,fontSize:16}} defaultValue=""
          aria-label="Agregar chip en la posición del cursor" disabled={disponibles.length===0||estado==="saving"} onChange={ev=>{insertar(ev.target.value);ev.target.value="";}}>
          <option value="">{disponibles.length?"Elegir un dato…":"✓ Todos los datos disponibles están insertados"}</option>
          {gruposInsercion.filter(g=>g.items.length>0).map(g=><optgroup key={g.titulo} label={g.titulo}>{g.items.map(([key,label])=><option key={key} value={key}>{label}</option>)}</optgroup>)}
        </select>
      </label>
      <span role="status" style={{fontSize:11,color:"var(--muted)"}}>{capturados.length} datos insertados · {disponibles.length} disponibles · {texto.length.toLocaleString("es-AR")} / 80.000 caracteres</span>
    </div>
    {chipsSugeridos.length>0&&!revisar&&<div role="group" aria-label="Datos recomendados para insertar" style={{display:"flex",flexDirection:"column",gap:7}}>
      <div style={{fontSize:12,color:"var(--muted)"}}>Datos frecuentes · tocá para insertar</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
        {chipsSugeridos.map(([key,label])=><button key={key} type="button" className="btn btn-secondary btn-sm dw-auto-data-chip" aria-label={"Insertar "+label} title={"Insertar "+label} disabled={estado==="saving"} style={{minHeight:40,maxWidth:"100%",whiteSpace:"normal",textAlign:"left"}} onClick={()=>insertar(key)}>+ {label}</button>)}
      </div>
    </div>}
    {!chipsSugeridos.length&&capturados.length>0&&!revisar&&<div role="status" style={{fontSize:12,color:"var(--muted)"}}>Datos principales insertados.</div>}
    {revisar&&<div role={valido?"status":"alert"} style={{padding:11,borderRadius:8,border:"1px solid var(--border)",fontSize:12,lineHeight:1.6,color:valido?"var(--green)":"var(--amber)"}}>
      {valido?"✓ Los datos principales están vinculados. Revisá también la redacción y los importes antes de usarlo.":[
        texto.trim().length<=40?"Pegá el texto completo del contrato":null,
        texto.length>80000?"El texto supera los 80.000 caracteres":null,
        faltantes.length?"Faltan "+faltantes.length+" datos obligatorios. Podés agregarlos abajo":null,
        invalidos.length?"Hay "+invalidos.length+" datos automáticos que este documento no reconoce; revisá las etiquetas rojas":null,
        repetidos.length?"Cada dato automático se usa una sola vez. Repetidos: "+repetidos.map(t=>CHIPS.find(([k])=>k===t)?.[1]||t).join(", "):null,
        llavesMal?"Hay datos automáticos incompletos. Revisá los corchetes del texto":null
      ].filter(Boolean).join(". ")}
    </div>}
    {revisar&&faltantes.length>0&&<div role="group" aria-label="Datos obligatorios pendientes" style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:6}}>
      <span style={{fontSize:12,color:"var(--muted)"}}>Faltan estos datos (tocá para insertarlos):</span>
      {faltantes.map(key=><button key={key} type="button" className="btn btn-secondary btn-sm dw-auto-data-chip"
        disabled={estado==="saving"} onClick={()=>insertar(key,true)}
        style={{minHeight:38,maxWidth:"100%",whiteSpace:"normal",textAlign:"left"}}>+ {CHIPS.find(([k])=>k===key)?.[1]||key}</button>)}
    </div>}
    {revisar&&texto.trim().length>40&&advertenciasContenido.length>0&&
      <div style={{padding:11,borderRadius:8,border:"1px solid var(--border)",fontSize:12,lineHeight:1.6,color:"var(--muted)"}}>
        <strong style={{color:"var(--text)"}}>Para revisar en tu contrato (orientativo)</strong>
        <ul style={{margin:"6px 0 0",paddingLeft:19}}>
          {advertenciasContenido.map((mensaje,i)=><li key={i}>{mensaje}</li>)}
        </ul>
        <span>No se agregó ningún texto y estas sugerencias no impiden guardar.</span>
      </div>}
    {revisar&&texto.trim().length>40&&dniFijo&&
      <div role="note" style={{padding:11,borderRadius:8,border:"1px solid var(--border)",fontSize:12,lineHeight:1.6,color:"var(--muted)"}}>
        <strong style={{color:"var(--text)"}}>Posible DNI fijo del Word:</strong> encontramos un número de documento escrito directamente. Verificá que no pertenezca a otra operación y, si corresponde, usá el chip de DNI. Esta advertencia no impide guardar.
      </div>}
    {revisar&&valido&&importesSinChip.length>0&&
      <div role="note" style={{padding:11,borderRadius:8,border:"1px solid var(--border)",fontSize:12,lineHeight:1.6,color:"var(--muted)"}}>
        <strong style={{color:"var(--text)"}}>Revisá los importes del Word:</strong> no encontramos {importesSinChip.map(k=>CHIPS.find(([key])=>key===k)?.[1]||k).join(" ni ")} como dato automático. Si copiaste un importe fijo de otro contrato, reemplazalo por el chip correspondiente. No se modifica ni agrega ninguna cláusula.
      </div>}
    {error&&<div role="alert" style={{fontSize:12,color:"var(--red)"}}>{error}</div>}
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {ultimaAccionChip&&texto===ultimaAccionChip.textoPosterior&&<button type="button" className="btn btn-secondary" disabled={estado==="saving"} onClick={deshacerUltimoChip}>↶ Deshacer</button>}
      <button type="button" className="btn btn-secondary" onClick={()=>{setRevisar(true);setMostrarVista(false);}}>Revisar</button>
      <button type="button" className="btn btn-secondary" onClick={()=>setMostrarVista(v=>!v)}>{mostrarVista?"Cerrar vista previa":"Vista previa"}</button>
      <button type="button" className="btn btn-primary" disabled={estado==="saving"||!necesitaGuardar} onClick={guardar}>{estado==="saving"?"Guardando…":"Guardar cambios"}</button>
      {estado==="saved"&&<span role="status" style={{fontSize:12,color:"var(--green)",alignSelf:"center"}}>✓ Guardado para próximas operaciones</span>}
    </div>
    {mostrarVista&&<div style={{background:"#fff",color:"#243447",border:"1px solid #d1d5db",borderRadius:8,padding:"clamp(18px,4vw,36px)",lineHeight:1.65,fontSize:13,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>
      <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>VISTA DEL TEXTO · los chips se completarán con los datos reales</div>
      {texto.split(/(\{\{[a-zA-Z0-9_]+\}\})/g).map((trozo,i)=>/^\{\{[a-zA-Z0-9_]+\}\}$/.test(trozo)
        ? <span key={i} style={{background:repetidos.includes(trozo.slice(2,-2))?"#fee2e2":"#e0f2fe",color:repetidos.includes(trozo.slice(2,-2))?"#991b1b":"#075985",borderRadius:4}}>{CHIPS.find(([key])=>key===trozo.slice(2,-2))?.[1]||trozo}</span>
        : <span key={i}>{trozo}</span>)}
    </div>}
    {config.modo_documento==="propio"&&versionesDisponibles.length>0&&
      <details style={{fontSize:12,alignSelf:"flex-start",width:"100%"}}>
        <summary style={{cursor:"pointer",fontWeight:650,padding:"9px 0"}}>↶ Recuperar versión anterior ({versionesDisponibles.length})</summary>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",padding:"5px 0 9px"}}>
          {versionesDisponibles.map((item,i)=><button key={i} type="button" className="btn btn-secondary btn-sm" disabled={estado==="saving"} onClick={()=>recuperarVersion(item)}>Versión {item.version}</button>)}
        </div>
        <p style={{fontSize:11,color:"var(--muted)",margin:"0 0 8px"}}>La recuperación no guarda ni publica nada automáticamente.</p>
      </details>}
    <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.5}}>
      Este modelo no modifica operaciones anteriores. El contrato propio debe ser revisado por la inmobiliaria; DocWorks no verifica automáticamente su validez jurídica.
    </div>
    {config.modo_documento!=="propio"&&<button type="button" className="btn btn-ghost btn-sm" style={{alignSelf:"flex-start"}} onClick={()=>{if(dirty)confirmar("¿Descartar los cambios sin guardar?",onCancelar);else onCancelar();}}>← Volver al modelo DocWorks</button>}
  </section>;
}
