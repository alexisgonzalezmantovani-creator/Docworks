// Módulo extraído sin modificar las declaraciones originales.
export const CLAUSULAS_DEFAULT = [
  { id:"c1", titulo:"Multa por incumplimiento", categoria:"rescisión", tipos:["reserva","boleto","refuerzo_reserva"], obligatoria:true, contenido:"En caso de incumplimiento imputable a alguna de las partes, se aplicarán las consecuencias expresamente pactadas en la reserva o boleto, según la naturaleza de las sumas entregadas y la normativa aplicable. Antes de utilizar esta cláusula, las partes deberán definir si el importe constituye seña, anticipo o arras y sus efectos." },
  { id:"c2", titulo:"Libre de ocupantes", categoria:"posesión", tipos:["reserva","boleto","alquiler","comodato","exclusividad"], obligatoria:true, contenido:"En la fecha de entrega pactada, el inmueble deberá encontrarse libre de ocupantes ajenos al acuerdo, salvo los expresamente informados y aceptados por escrito. Las deudas, cargas y gravámenes se regirán por las declaraciones y obligaciones específicas de este instrumento; esta cláusula no sustituye la verificación documental correspondiente." },
  { id:"c3", titulo:"Expensas y servicios", categoria:"posesión", tipos:["reserva","boleto"], obligatoria:true, contenido:"Los gastos de expensas, impuestos y servicios serán abonados por el VENDEDOR hasta la fecha de posesión, y a partir de dicha fecha quedarán a cargo del COMPRADOR." },
  { id:"c10", titulo:"Expensas y servicios del alquiler", categoria:"posesión", tipos:["alquiler","reserva_alquiler"], obligatoria:true, contenido:"El LOCATARIO abonará los consumos de servicios individualizables originados por su uso y las expensas que legalmente correspondan a su cargo. El LOCADOR asumirá los conceptos que por su naturaleza o por norma imperativa le correspondan. Las partes deberán individualizar cualquier distribución adicional en el contrato, respetando la normativa aplicable." },
  { id:"c11", titulo:"Gastos de uso en comodato", categoria:"posesión", tipos:["comodato"], obligatoria:true, contenido:"El COMODATARIO asumirá los gastos ordinarios derivados del uso del inmueble y los consumos de servicios durante el comodato. Los gastos extraordinarios y las reparaciones no imputables al uso indebido se resolverán conforme a la normativa aplicable y los acuerdos expresos de las partes." },
  { id:"c5", titulo:"Jurisdicción", categoria:"general", tipos:["todos"], obligatoria:true, contenido:"Para cualquier controversia derivada del presente instrumento serán competentes los tribunales que correspondan conforme a la normativa aplicable, sin perjuicio de los fueros o derechos que no puedan ser válidamente prorrogados. Si las partes acuerdan una jurisdicción territorial permitida, deberán identificarla expresamente." },
  { id:"c6", titulo:"Estado del inmueble", categoria:"alquiler", tipos:["alquiler"], contenido:"El LOCATARIO recibe el inmueble en el estado que se describe en el acta de entrega e inventario, si los hubiere, y se obliga a restituirlo en condiciones equivalentes, salvo el desgaste normal por el uso regular y el transcurso del tiempo." },
  { id:"c7", titulo:"Prohibición de subalquilar", categoria:"alquiler", tipos:["alquiler"], contenido:"El LOCATARIO no podrá subalquilar, ceder ni transferir total o parcialmente el uso del inmueble sin el consentimiento expreso y por escrito del LOCADOR." },
  { id:"c9", titulo:"Obras y mejoras", categoria:"alquiler", tipos:["alquiler"], contenido:"El LOCATARIO deberá solicitar autorización escrita al LOCADOR antes de realizar modificaciones u obras no urgentes. El tratamiento de mejoras, reparaciones necesarias y eventuales compensaciones se ajustará a lo pactado válidamente y a la normativa aplicable." },
];

export var DEFAULT_BLOQUES_RESERVA = [
  { id:"reserva.precio", titulo:"PRECIO", sinTitulo:false,
    contenido:"El Oferente ofrece la suma de {{precio_letras}} para la compra del Inmueble, en adelante el Precio.-",
    variables:["moneda_txt","precio_letras"], condicion:null, orden:1, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.valor_reserva", titulo:"VALOR DE LA RESERVA", sinTitulo:false,
    contenido:"La suma entregada en este acto en concepto de Reserva Ad Referéndum es de {{anticipo_letras}}.-",
    variables:["moneda_txt","anticipo_letras"], condicion:null, orden:2, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.forma_pago", titulo:"FORMA DE PAGO", sinTitulo:false,
    contenido:"{{reserva_pago_acordado}}",
    variables:["saldo_letras"], condicion:null, orden:3, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.honorarios", titulo:"HONORARIOS", sinTitulo:false,
    contenido:"{{comision_reserva_texto}}",
    variables:["comision_reserva_texto"], condicion:null, orden:4, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.vencimiento_aceptacion", titulo:"VENCIMIENTO DE ACEPTACIÓN DE LA RESERVA", sinTitulo:false,
    contenido:"El vencimiento de la aceptación de la presente Reserva caducará irrevocablemente {{reserva_aceptacion_plazo_texto}}, salvo prórroga expresa acordada por escrito entre las partes.-",
    variables:["reserva_aceptacion_plazo_texto","reserva_aceptacion_vencimiento"], condicion:null, orden:5, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.vencimiento_reserva", titulo:"VIGENCIA DE LA RESERVA", sinTitulo:false,
    contenido:"La presente Reserva, y su conversión a Seña una vez conformada la misma, tendrá una vigencia de {{reserva_vigencia_texto}}, plazo dentro del cual deberá suscribirse el Boleto de Compraventa y/o la Escritura Traslativa de Dominio. Vencido dicho plazo sin que se hubiera concretado, la Reserva caducará de pleno derecho, salvo prórroga expresa acordada por escrito entre las partes.-",
    variables:["reserva_vigencia_texto","reserva_vigencia_dias"], condicion:null, orden:6, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.incumplimiento", titulo:"SEÑA Y CONSECUENCIAS DEL INCUMPLIMIENTO", sinTitulo:false,
    contenido:"Conformada esta Reserva por el Vendedor, la presente tendrá carácter de SEÑA con los efectos y alcances del art. 1059 del Código Civil y Comercial de la Nación. Si el Oferente no se presentara a la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, perderá automáticamente y de pleno derecho la suma entregada en este acto, sin necesidad de que se practique interpelación judicial o extrajudicial alguna, quedando constituido en mora por el mero vencimiento del plazo; mientras que si no se presentara el Vendedor a la firma en el plazo establecido, quedará obligado a reintegrar al Oferente, dentro de las 48 horas de producido el incumplimiento, la suma recibida como Reserva, más otro tanto igual en concepto de única y total indemnización.-\n\nEn caso de que el incumplimiento aludido en el párrafo anterior se deba a Caso Fortuito o Fuerza Mayor según arts. 955 y 1730 del Código Civil y Comercial de la Nación, ajeno a la voluntad de las partes, los plazos se suspenden automáticamente, sin consecuencias para éstas, hasta tanto lo determine el Escribano Interviniente.-",
    variables:[], condicion:null, orden:7, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.escribano", titulo:"ESCRIBANO INTERVINIENTE", sinTitulo:false,
    contenido:"{{escribania_clausula}} debiendo ser notificado formalmente al Vendedor con todos los datos de contacto correspondientes dentro de la semana de haber sido conformada la presente Reserva Ad Referéndum. La notificación del Escribano Interviniente respecto de la fecha y hora para la firma de la Escritura Traslativa de Dominio tendrá carácter constitutivo.-",
    variables:["escribania_clausula"], condicion:null, orden:8, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.honorarios_impuestos", titulo:"GASTOS, IMPUESTOS Y ESCRITURACIÓN", sinTitulo:false,
    contenido:"Los gastos notariales, registrales, impuestos, tasas y sellos vinculados a la firma e inscripción de la Escritura Traslativa de Dominio y/o al Boleto de Compraventa se distribuirán conforme a lo expresamente acordado por las partes y a la normativa aplicable. Los honorarios de intermediación inmobiliaria se regulan exclusivamente por la cláusula específica de HONORARIOS de este instrumento.-",
    variables:[], condicion:null, orden:9, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.moneda_condicion_esencial", titulo:"MONEDA DE PAGO Y CONDICIÓN ESENCIAL", sinTitulo:false,
    contenido:"Queda expresamente establecido que la moneda de pago ofrecida y acordada en los puntos 1, 2 y 3 precedentes constituye condición y elemento esencial de la presente. El Oferente declara poseer los Dólares Billete Estadounidenses y se compromete a entregarlos por el precio estipulado en caso de aceptación, así como para cancelar los honorarios convenidos, renunciando a invocar imprevisión, caso fortuito, fuerza mayor, enriquecimiento sin causa o cualquier otra defensa relacionada a una eventual imposibilidad de pago en la moneda pactada o a variaciones en su cotización, resultando condición esencial que el pago sea efectuado única y exclusivamente en Dólares Billete Estadounidenses.-",
    variables:[], condicion:"moneda_usd", orden:10, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.devolucion_no_conforme", titulo:"DEVOLUCIÓN DE LA RESERVA NO CONFORMADA", sinTitulo:false,
    contenido:"Si el Vendedor del Inmueble no conformase esta Reserva, la suma entregada en este acto por el Oferente le será devuelta sin indemnización de ninguna naturaleza, quedando la presente Reserva sin efecto ni valor legal alguno. En este caso, el Oferente deberá notificar con un mínimo de 48 horas su intención de retirar los fondos en guarda, acordando con la inmobiliaria interviniente la logística correspondiente.-",
    variables:[], condicion:null, orden:11, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.notificacion_valida", titulo:"NOTIFICACIÓN VÁLIDA", sinTitulo:false,
    contenido:"Significa toda notificación realizada por correo electrónico o carta documento a los domicilios constituidos por Las Partes en la presente, con su correspondiente constancia de recibo. Las notificaciones por correo electrónico tendrán plena validez y vigencia, constituyendo Las Partes los domicilios electrónicos que correspondan para los efectos de la presente Reserva.-",
    variables:["notificacion_emails_clausula"], condicion:null, orden:12, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.incumplimiento_honorarios", titulo:"HONORARIOS POR INCUMPLIMIENTO", sinTitulo:false,
    contenido:"En caso de incumplimiento o arrepentimiento de alguna de Las Partes, una vez cumplidos todos los Ad Referéndum de la presente Reserva, la parte incumplidora deberá abonar los honorarios pactados en concepto de labor de intermediación realizada hasta el momento, sin necesidad de formalidad judicial alguna.-",
    variables:[], condicion:null, orden:13, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.asesoramiento", titulo:"ASESORAMIENTO LEGAL E IMPOSITIVO", sinTitulo:false,
    contenido:"El Oferente manifiesta expresamente que para realizar la presente oferta se ha asesorado en forma individual con sus propios asesores legales e impositivos, declarando conocer en todos sus términos los riesgos e implicancias de la presente oferta.-",
    variables:[], condicion:null, orden:14, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.refuerzo", titulo:"REFUERZO", sinTitulo:false,
    contenido:"El Oferente podrá ofrecer, de así convenirlo con el Vendedor, un Refuerzo de la presente Reserva dentro de los 7 días corridos a partir de su conformidad, cuyo monto y demás condiciones se consignarán en el instrumento de Refuerzo de Reserva correspondiente.-",
    variables:[], condicion:null, orden:15, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
];

// Editor de biblioteca de cláusulas separado de App.tsx.
export function crearClausulasView(deps) {
  const { useState, CLAUSULAS_DEFAULT, CLAUSULA_CATS, ClausulaFormBody, DWIcon, FORM_CLAUSULA_EMPTY, HistorialClausulaModal, TIPOS, genId, dwNotify, traducirError, narrarClausulaIA, clausulaYaEnTextoBase, clausulaAplicaTipo } = deps;
function ClausulasView({clausulas,onAdd,onEdit,onDelete,puedeEditar,rolLabel,error,loading,ocultarProtegidasIds,modoIntegrado,onRetry,tipoFiltro,puedeVerHistorial}){
  const [form,setForm]=useState(FORM_CLAUSULA_EMPTY);
  const [editId,setEditId]=useState(null);
  const [guardandoClausula,setGuardandoClausula]=useState(false);
  const [errorGuardadoClausula,setErrorGuardadoClausula]=useState("");
  const [filtroTexto,setFiltroTexto]=useState("");
  const [filtroCategoria,setFiltroCategoria]=useState("todas");
  const [soloPersonalizadas,setSoloPersonalizadas]=useState(false);
  const [soloObligatorias,setSoloObligatorias]=useState(false);
  const [clausulaTab,setClausulaTab]=useState("biblioteca");
  const [historialSeleccionado,setHistorialSeleccionado]=useState(null);
  const [ideaInicial,setIdeaInicial]=useState("");
  const [generandoIdea,setGenerandoIdea]=useState(false);
  const [errorIdea,setErrorIdea]=useState("");
  const [opcionesAbiertas,setOpcionesAbiertas]=useState(false);
  var editable = puedeEditar!==false;
  async function submit(){
    if(!editable||guardandoClausula)return;
    if(!String(form.titulo||"").trim()||!String(form.contenido||"").trim()){
      setErrorGuardadoClausula("Completá el título y el texto antes de guardar.");return;
    }
    setGuardandoClausula(true);setErrorGuardadoClausula("");
    try{
      var resultado=editId?await onEdit(editId,form):await onAdd(Object.assign({},form,{id:genId()}));
      if(resultado&&resultado.error)throw resultado.error;
      setForm(FORM_CLAUSULA_EMPTY);setEditId(null);setClausulaTab("biblioteca");
    }catch(err){
      setErrorGuardadoClausula(traducirError(err&&err.message?err.message:"No se pudo guardar la cláusula. Reintentá sin perder los datos ingresados."));
    }finally{setGuardandoClausula(false);}
  }
  function abrirNueva(){if(!editable||guardandoClausula)return;setErrorGuardadoClausula("");setEditId(null);setForm(Object.assign({},FORM_CLAUSULA_EMPTY,{tipos:tipoFiltro?[tipoFiltro]:["todos"]}));setIdeaInicial("");setErrorIdea("");setOpcionesAbiertas(false);setClausulaTab("editor");}
  function abrirEdicion(c){if(!editable||guardandoClausula)return;setErrorGuardadoClausula("");setEditId(c.id);setForm({titulo:c.titulo,categoria:c.categoria,contenido:c.contenido,tipos:c.tipos||["todos"],obligatoria:!!c.obligatoria});setOpcionesAbiertas(true);setClausulaTab("editor");}
  function aplicarBorrador(draft){
    setEditId(null);
    setForm({titulo:draft.titulo||"",categoria:draft.categoria||"general",contenido:draft.contenido||"",tipos:tipoFiltro?[tipoFiltro]:["todos"],obligatoria:false});
    setErrorIdea("");
  }
  async function redactarIdea(){
    if(!ideaInicial.trim()||generandoIdea)return;
    setGenerandoIdea(true);setErrorIdea("");
    try{var draft=await narrarClausulaIA(ideaInicial.trim());if(draft){aplicarBorrador(draft);}else{setErrorIdea("No pude interpretar la respuesta. Probá reformular la idea.");}}
    catch(e){setErrorIdea("No se pudo conectar con el asistente. Podés escribir la cláusula manualmente.");}
    finally{setGenerandoIdea(false);}
  }
  var esPersonalizada=function(c){return !CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;});};
  var idsProtegidos=Array.isArray(ocultarProtegidasIds)?ocultarProtegidasIds:[];
  var bibliotecaVisible=clausulas.filter(function(c){
    if(c.id==="c4")return false; // legado: Comisión inmobiliaria se migra al modelo, no queda como extra.
    if(clausulaYaEnTextoBase(c))return false; // 4.62: ya vive en el texto base de cada documento.
    if(idsProtegidos.indexOf(c.id)!==-1)return false;
    if(tipoFiltro && !clausulaAplicaTipo(c,tipoFiltro))return false;
    return true;
  });
  var filtradas=bibliotecaVisible.filter(function(c){
    if(soloPersonalizadas&&!esPersonalizada(c))return false;
    if(soloObligatorias&&!c.obligatoria)return false;
    if(filtroCategoria!=="todas"&&c.categoria!==filtroCategoria)return false;
    if(filtroTexto.trim()){
      var q=filtroTexto.trim().toLowerCase();
      if(((c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título").toLowerCase().indexOf(q)===-1&&(c.contenido||"").toLowerCase().indexOf(q)===-1)return false;
    }
    return true;
  });
  return(
    <div>
      <div className="section-header">
        <div><div className="section-title">Cláusulas opcionales</div><div className="section-sub">Cláusulas reutilizables para cada tipo de documento.</div></div>
      </div>
      {error && <div style={{marginBottom:16,padding:"10px 14px",borderRadius:10,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",color:"var(--red)",fontSize:12.5}}>{error} {onRetry&&<button type="button" onClick={onRetry} className="btn btn-secondary btn-sm" style={{marginLeft:8}}>Reintentar</button>}</div>}
      {loading && <div style={{marginBottom:16,fontSize:12.5,color:"var(--muted)"}}>Cargando cláusulas…</div>}
      {!editable&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",marginBottom:16,fontSize:12.5,color:"var(--amber)"}}>
          <span>🔒</span>
          <span>La biblioteca es de solo lectura para tu rol. El Dueño o Administrador puede crear, modificar o eliminar cláusulas reutilizables. Tu rol actual es «{rolLabel||"—"}».</span>
        </div>
      )}
      {!modoIntegrado&&<div className="card" style={{padding:8,marginBottom:10}}>
        <div style={{display:"flex",gap:5,borderBottom:"1px solid var(--border)"}}>
          <button type="button" onClick={function(){setClausulaTab("biblioteca");}} style={{flex:1,border:0,borderBottom:clausulaTab==="biblioteca"?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:clausulaTab==="biblioteca"?"var(--text)":"var(--muted)",padding:"10px 12px",cursor:"pointer",fontSize:12,fontWeight:clausulaTab==="biblioteca"?700:500}}>Cláusulas opcionales</button>
          {editable&&<button type="button" onClick={abrirNueva} style={{flex:1,border:0,borderBottom:clausulaTab==="editor"?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:clausulaTab==="editor"?"var(--text)":"var(--muted)",padding:"10px 12px",cursor:"pointer",fontSize:12,fontWeight:clausulaTab==="editor"?700:500}}>{editId?"Modificar cláusula":"Crear cláusula"}</button>}
        </div>
      </div>}
      {modoIntegrado&&editable&&clausulaTab!=="editor"&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><button type="button" className="btn btn-primary btn-sm" onClick={abrirNueva}>＋ Crear cláusula</button></div>}
      {clausulaTab==="editor"&&editable&&<div className="card" style={{padding:18,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14}}>
          <div><p style={{fontFamily:"DM Serif Display,serif",fontSize:15,color:"var(--text)",margin:0}}>{editId?"Modificar cláusula":"Agregar cláusula"}</p><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{editId?"Editá el título y el texto; después guardá los cambios.":"Partí de una idea, redactala con IA o escribila directamente. Revisá el texto antes de guardarlo."}</div></div>
          <button type="button" onClick={function(){setClausulaTab("biblioteca");setEditId(null);}} style={{border:"1px solid var(--border)",background:"rgba(255,255,255,.03)",color:"var(--muted)",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:12}}>Cancelar</button>
        </div>
        {!editId&&<div style={{padding:12,border:"1px solid var(--border)",borderRadius:10,marginBottom:14,background:"var(--card2, var(--card))"}}>
          <label className="field-label" style={{display:"block",marginBottom:7}}>Contá en una frase qué querés que diga</label>
          <textarea className="inp" rows={2} value={ideaInicial} onChange={function(e){setIdeaInicial(e.target.value);setErrorIdea("");}} placeholder="Ej.: establecer cómo se distribuyen los gastos de reparación." style={{width:"100%",resize:"vertical",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:9}}>
            <button type="button" className="btn btn-primary" disabled={!ideaInicial.trim()||generandoIdea} onClick={redactarIdea}>{generandoIdea?"Redactando…":"Redactar con IA"}</button>
            <button type="button" className="btn btn-secondary" onClick={function(){setErrorIdea("");setForm(function(f){return Object.assign({},f,{contenido:f.contenido||ideaInicial.trim()});});setTimeout(function(){var el=document.getElementById("dw-clausula-texto");if(el)el.focus();},0);}}>Escribirla yo</button>
          </div>
          {errorIdea&&<div style={{fontSize:12,color:"var(--red)",marginTop:7}}>{errorIdea}</div>}
        </div>}
        {errorGuardadoClausula&&<div role="alert" style={{color:"var(--red)",fontSize:12.5,marginBottom:9}}>{errorGuardadoClausula}</div>}
        <ClausulaFormBody form={form} setForm={setForm} editId={editId} onSubmit={submit} guardando={guardandoClausula} onCancel={function(){if(guardandoClausula)return;setEditId(null);setForm(FORM_CLAUSULA_EMPTY);setClausulaTab("biblioteca");}}/>
      </div>}
      {clausulaTab==="biblioteca"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
            <input className="inp" style={{flex:"1 1 180px",minWidth:0}} value={filtroTexto} onChange={function(e){setFiltroTexto(e.target.value);}} placeholder="🔎 Buscar por título o texto..."/>
            <select className="inp" style={{flex:"0 0 auto",width:"auto",minWidth:130}} value={filtroCategoria} onChange={function(e){setFiltroCategoria(e.target.value);}}>
              <option value="todas">Todas las categorías</option>
              {CLAUSULA_CATS.map(function(c){return <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>;})}
            </select>
            <div onClick={function(){setSoloPersonalizadas(function(v){return !v;});}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,border:"1px solid "+(soloPersonalizadas?"var(--gold)":"var(--border2)"),background:soloPersonalizadas?"rgba(212,175,55,0.1)":"rgba(255,255,255,0.03)",color:soloPersonalizadas?"var(--gold)":"var(--muted)",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",userSelect:"none"}}>
              {soloPersonalizadas?"✓ ":""}Solo personalizadas
            </div>
            {editable&&<button type="button" onClick={function(){setSoloObligatorias(function(v){return !v;});}} aria-pressed={soloObligatorias} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,border:"1px solid "+(soloObligatorias?"var(--gold)":"var(--border2)"),background:soloObligatorias?"rgba(212,175,55,0.1)":"rgba(255,255,255,0.03)",color:soloObligatorias?"var(--gold)":"var(--muted)",fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>{soloObligatorias?"✓ ":""}Obligatorias</button>}
          </div>
          {editable&&(()=>{var idsActuales=bibliotecaVisible.map(function(c){return c.id;});var ideas=CLAUSULAS_DEFAULT.filter(function(c){return idsActuales.indexOf(c.id)===-1&&(!tipoFiltro||clausulaAplicaTipo(c,tipoFiltro));});return ideas.length>0?<div style={{border:"1px solid var(--border)",borderRadius:10,padding:10,background:"var(--card2, var(--card))"}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)",marginBottom:7}}>Ideas de cláusulas de fábrica</div><div style={{fontSize:11.5,color:"var(--dim)",marginBottom:9}}>Agregá una cláusula existente al catálogo. Revisá el texto antes de usarla.</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{ideas.map(function(idea){return <div key={idea.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 9px",border:"1px solid var(--border)",borderRadius:8}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{idea.titulo}</div><div style={{fontSize:11,color:"var(--dim)",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{idea.contenido}</div></div><button type="button" className="btn btn-secondary btn-sm" onClick={function(){Promise.resolve(onAdd(Object.assign({},idea,{tipos:idea.tipos||["todos"],obligatoria:idea.obligatoria===true}))).then(function(r){if(r&&r.error)throw r.error;dwNotify("success","Cláusula agregada. Revisá su texto antes de usarla.");}).catch(function(){dwNotify("error","No se pudo agregar la cláusula.");});}}>Agregar</button></div>;})}</div></div>:null;})()}
          <div style={{fontSize:12,color:"var(--dim)"}}>{filtradas.length} de {bibliotecaVisible.length} cláusula{bibliotecaVisible.length===1?"":"s"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {bibliotecaVisible.length===0&&<div style={{padding:28,textAlign:"center",color:"var(--dim)",fontSize:13}}>No hay cláusulas visibles para este rol.</div>}
            {bibliotecaVisible.length>0&&filtradas.length===0&&<div style={{padding:28,textAlign:"center",color:"var(--dim)",fontSize:13}}>Ninguna cláusula coincide con el filtro.</div>}
            {filtradas.map(function(c){
              var esTodos=!c.tipos||!c.tipos.length||c.tipos.indexOf("todos")!==-1;
              return(
                <div key={c.id} className="op-card">
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{(c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título"}</span>
                        <span className={"badge "+(c.categoria==="alquiler"?"badge-tipo":"badge-gold")} style={{textTransform:"capitalize"}}>{c.categoria}</span>
                        {esPersonalizada(c)&&<span className="badge badge-activo">Personalizada</span>}
                      </div>
                      <div style={{fontSize:12,color:"var(--dim)",marginBottom:4}}>{esTodos?"Todos los documentos":c.tipos.map(function(t){return TIPOS[t]||t;}).join(", ")}</div>
                      <p style={{fontSize:12,color:"var(--dim)",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.contenido}</p>
                    </div>
                    <div style={{display:"flex",gap:3,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                      {puedeVerHistorial&&<button type="button" onClick={function(){setHistorialSeleccionado(c);}} className="btn btn-ghost btn-sm" style={{padding:"4px 6px",fontSize:10.5,whiteSpace:"nowrap"}}>Historial</button>}
                    {editable&&(
                      <div style={{display:"flex",gap:3,flexShrink:0}}> 
                        <button onClick={function(){abrirEdicion(c);}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:12,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><DWIcon name="edit" size={14}/></button>
                        <button onClick={function(){onDelete(c.id);}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(248,113,113,0.05)",border:"1px solid rgba(248,113,113,0.15)",color:"var(--red)",cursor:"pointer",fontSize:12}}>✕</button>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>}
      {historialSeleccionado&&<HistorialClausulaModal titulo={historialSeleccionado.titulo} source="auditoria" entidadTipo="clausula" entidadId={historialSeleccionado.id} actual={historialSeleccionado} onClose={function(){setHistorialSeleccionado(null);}} onRestore={function(v){return onEdit(historialSeleccionado.id,{titulo:v.titulo,contenido:v.contenido,categoria:historialSeleccionado.categoria,tipos:historialSeleccionado.tipos,obligatoria:historialSeleccionado.obligatoria});}}/>}
    </div>
  );
}
  return ClausulasView;
}

export function crearClausulasWorkspace(deps){
 const {ClausulasView, CuerpoPlantillaPanel, DEFAULT_BLOQUES_RESERVA, EncabezadoFijadoPanel, PLANTILLA_TIPOS, ROLES_DEF, ReservaBloquesPanel, TIPOS, clausulaAplicaTipo, clausulaYaEnTextoBase, contarBloquesCuerpo, mostrarTokensDocWorks, obtenerIdsProtegidosDePlantillas, obtenerPlantillaConfig, useEffect, useState} = deps;


/* Componente legado de cláusulas personales eliminado: ya no forma parte del producto. */

function ClausulasWorkspace({perfil,onSavePerfil,operaciones,clausulas,onAddClausula,onEditClausula,onDeleteClausula,papeleraClausulas,papeleraClausulasLoading,papeleraClausulasError,onRecargarPapeleraClausulas,onRestaurarClausula,bloquesReserva,onUpdateBloqueReserva,onMoveBloqueReserva,bloquesError,bloquesLoading,onRetryBloques,clausulasError,clausulasLoading,onRetryClausulas,usuarioActual}) {
  const [mostrarPapeleraClausulas,setMostrarPapeleraClausulas]=useState(false);
  const [restaurandoClausula,setRestaurandoClausula]=useState(null);
  const [errorPapeleraClausulas,setErrorPapeleraClausulas]=useState("");
  const [seccion,setSeccion]=useState("adicionales");
  const [documentoAbierto,setDocumentoAbierto]=useState(false);
  const [tipoDocSel,setTipoDocSel]=useState("reserva");
  const [filtroAdicional,setFiltroAdicional]=useState("todas");
  const [previewModeloAbierta,setPreviewModeloAbierta]=useState(false);
  const [pasoModelo,setPasoModelo]=useState(1);
  const [subseccionModelo,setSubseccionModelo]=useState("obligatorias");
  const puedeEditar=!!perfil&&(perfil.rol==="dueno"||perfil.rol==="admin");
  // La navegación de Biblioteca y Modelos es independiente: no forzar el cambio de pestaña.
  useEffect(function(){if(!puedeEditar&&seccion!=="adicionales")setSeccion("adicionales");},[puedeEditar]);
  const rolLabel=(ROLES_DEF[perfil&&perfil.rol]&&ROLES_DEF[perfil.rol].label)||(perfil&&perfil.rol)||"usuario";
  function guardarPerfil(next){return onSavePerfil(next);}
  function cambiarEstadoClausulaBiblioteca(clausula,estado){
    if(!puedeEditar||!clausula)return Promise.resolve({error:new Error("Sin permisos")});
    if(clausula.obligatoria===true&&estado!=="obligatoria")return Promise.resolve({error:new Error("Esta cláusula es esencial y no se puede desactivar desde este modelo.")});
    var mapa=Object.assign({},perfil&&perfil.plantillas||{}),cfg=Object.assign({},mapa[tipoDocSel]||{});
    var opcionales=obtenerPlantillaConfig(perfil,tipoDocSel,clausulas).clausulas_ids.slice();
    var obligatorias=Array.isArray(cfg.obligatorias_ids)?cfg.obligatorias_ids.slice():[];
    if(estado==="apagada"){opcionales=opcionales.filter(function(id){return id!==clausula.id;});obligatorias=obligatorias.filter(function(id){return id!==clausula.id;});}
    else if(estado==="obligatoria"){opcionales=opcionales.filter(function(id){return id!==clausula.id;});if(obligatorias.indexOf(clausula.id)<0)obligatorias.push(clausula.id);}
    else {obligatorias=obligatorias.filter(function(id){return id!==clausula.id;});if(opcionales.indexOf(clausula.id)<0)opcionales.push(clausula.id);}
    cfg.clausulas_ids=opcionales;cfg.obligatorias_ids=obligatorias;
    return guardarPerfil(Object.assign({},perfil,{plantillas:Object.assign({},mapa,{[tipoDocSel]:cfg})}));
  }
  function alternarFrecuente(clausulaId){
    if(!puedeEditar)return;
    var mapa=Object.assign({},perfil&&perfil.plantillas||{});
    var anterior=Object.assign({},mapa[tipoDocSel]||{});
    var ids=Array.isArray(anterior.frecuentes_ids)?anterior.frecuentes_ids.slice():[];
    anterior.frecuentes_ids=ids.includes(clausulaId)?ids.filter(function(id){return id!==clausulaId;}):ids.concat([clausulaId]);
    mapa[tipoDocSel]=anterior;
    return guardarPerfil(Object.assign({},perfil,{plantillas:mapa}));
  }
  function contarModelo(tipo){return contarBloquesCuerpo(perfil,tipo,bloquesReserva);}
  var protegidas=obtenerIdsProtegidosDePlantillas(perfil);
  var protegidasConTipos=protegidas.map(function(id){var c=(clausulas||[]).find(function(x){return x.id===id;})||null;var tiposFijos=PLANTILLA_TIPOS.filter(function(tipo){var cfg=obtenerPlantillaConfig(perfil,tipo,clausulas);return !!cfg.locked&&(cfg.clausulas_ids||[]).indexOf(id)!==-1;});return {id:id,clausula:c,tipos:tiposFijos};});
  var adicionalesVisibles=(clausulas||[]).filter(function(c){if(protegidas.indexOf(c.id)!==-1)return false;return filtroAdicional==="todas"||clausulaAplicaTipo(c,filtroAdicional);});
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div className="section-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
      <div><div className="section-title">{puedeEditar?"Cláusulas":"Mi biblioteca"}</div><div className="section-sub">{seccion==="adicionales"?"Guardá y reutilizá tus cláusulas.": "Configuración de documentos de la inmobiliaria."}</div></div>
      {puedeEditar&&<button type="button" className={seccion==="adicionales"?"btn btn-primary":"btn btn-secondary"} style={{minHeight:44,padding:"10px 18px",fontSize:14,fontWeight:750,borderRadius:11,boxShadow:seccion==="adicionales"?"0 4px 14px rgba(212,168,83,.18)":"none"}} onClick={function(){setSeccion(seccion==="adicionales"?"modelos":"adicionales");setDocumentoAbierto(false);}}>{seccion==="adicionales"?"▤ Configurar documentos":"← Volver a cláusulas"}</button>}
    </div>
    {puedeEditar&&seccion!=="adicionales"&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <button type="button" className={"btn btn-sm "+(seccion==="modelos"?"btn-primary":"btn-secondary")} onClick={function(){setSeccion("modelos");setDocumentoAbierto(false);}}>Modelos de documentos</button>
      <button type="button" className={"btn btn-sm "+(seccion==="frecuentes"?"btn-primary":"btn-secondary")} onClick={function(){setSeccion("frecuentes");}}>Cláusulas recomendadas</button>
    </div>}
    {seccion==="adicionales"&&<div className="card" style={{padding:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:6}}><div style={{fontSize:14,fontFamily:"DM Serif Display,serif",color:"var(--text)"}}>Biblioteca de cláusulas</div>{puedeEditar&&<button type="button" title="Papelera de cláusulas" aria-label="Abrir papelera de cláusulas" onClick={function(){var abrir=!mostrarPapeleraClausulas;setMostrarPapeleraClausulas(abrir);setErrorPapeleraClausulas("");if(abrir&&onRecargarPapeleraClausulas)onRecargarPapeleraClausulas();}} style={{border:"1px solid var(--border)",background:"var(--card)",color:"var(--muted)",borderRadius:9,padding:"7px 10px",cursor:"pointer"}}>♻ Papelera</button>}</div>
      {puedeEditar&&mostrarPapeleraClausulas&&<div style={{padding:12,marginBottom:12,border:"1px solid var(--border)",borderRadius:12,background:"var(--card2,var(--card))"}}><div style={{fontWeight:700,fontSize:13,marginBottom:5}}>Papelera de cláusulas</div><div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>Podés restaurar cláusulas durante 30 días desde su eliminación. Las anteriores a esta función no tienen fecha verificable.</div>{(errorPapeleraClausulas||papeleraClausulasError)&&<div role="alert" style={{color:"var(--danger,#c94a4a)",fontSize:12,marginBottom:8}}>{errorPapeleraClausulas||papeleraClausulasError} <button type="button" onClick={onRecargarPapeleraClausulas}>Reintentar</button></div>}{papeleraClausulasLoading?<div style={{fontSize:12,color:"var(--muted)"}}>Cargando papelera…</div>:!(papeleraClausulas||[]).length?<div style={{fontSize:12,color:"var(--muted)"}}>No hay cláusulas recuperables.</div>:(papeleraClausulas||[]).map(function(c){return <div key={c.id} style={{display:"flex",gap:10,alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)"}}><div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:650}}>{c.titulo||"Cláusula sin título"}</div><div style={{fontSize:11,color:"var(--muted)"}}>Eliminada: {c.eliminado_en?new Date(c.eliminado_en).toLocaleDateString("es-AR"):"sin fecha"}</div></div><button type="button" disabled={restaurandoClausula!==null} onClick={async function(){setRestaurandoClausula(c.id);setErrorPapeleraClausulas("");try{var r=await onRestaurarClausula(c.id);if(r&&r.error)throw r.error;}catch(e){setErrorPapeleraClausulas(e&&e.message?e.message:"No se pudo restaurar.");}finally{setRestaurandoClausula(null);}}} style={{padding:"7px 10px",borderRadius:8,border:"1px solid var(--border)",background:"var(--card)",color:"var(--text)",cursor:"pointer"}}>{restaurandoClausula===c.id?"Restaurando…":"Restaurar"}</button></div>;})}</div>}

      <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,marginBottom:11}}>Elegí las cláusulas que el asesor podrá sumar en cada operación. {puedeEditar?"Las cláusulas obligatorias se incorporan siempre; las adicionales quedan a elección del asesor.":"Las cláusulas obligatorias del modelo no aparecen en esta biblioteca."}</div>
      <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:5,marginBottom:12,WebkitOverflowScrolling:"touch"}}>
        {[{id:"todas",label:"Todas"}].concat(PLANTILLA_TIPOS.map(function(tipo){return {id:tipo,label:TIPOS[tipo]||tipo};})).map(function(item){var active=filtroAdicional===item.id;return <button key={item.id} type="button" onClick={function(){setFiltroAdicional(item.id);}} style={{flex:"0 0 auto",border:"1px solid "+(active?"var(--gold)":"var(--border2)"),borderRadius:999,padding:"7px 11px",background:active?"rgba(212,168,83,.12)":"transparent",color:active?"var(--gold)":"var(--muted)",fontSize:12,fontWeight:active?750:500,cursor:"pointer",whiteSpace:"nowrap"}}>{item.label}{item.id==="todas"?"":" · "+(clausulas||[]).filter(function(c){return clausulaAplicaTipo(c,item.id)&&protegidas.indexOf(c.id)===-1;}).length}</button>;})}
      </div>
      <ClausulasView clausulas={adicionalesVisibles} onAdd={onAddClausula} onEdit={onEditClausula} onDelete={onDeleteClausula} puedeEditar={puedeEditar} rolLabel={rolLabel} error={clausulasError} loading={!!clausulasLoading} onRetry={onRetryClausulas} modoIntegrado={true} ocultarProtegidasIds={protegidas} puedeVerHistorial={puedeEditar}/> 
      {puedeEditar&&<div style={{marginTop:10,padding:"10px 12px",border:"1px solid var(--border)",borderRadius:10,background:"var(--card2, var(--card))"}}><div style={{fontSize:12.5,fontWeight:700,color:"var(--text)"}}>Obligatoria en: {protegidasConTipos.length} cláusulas</div><div style={{fontSize:11.5,color:"var(--dim)",marginTop:3}}>{protegidasConTipos.length?protegidasConTipos.map(function(item){return (item.clausula?(item.clausula.titulo||"Cláusula sin título"):"Cláusula no disponible en la biblioteca")+" · "+(item.tipos.length?item.tipos.map(function(tipo){return TIPOS[tipo]||tipo;}).join(", "):"modelo fijado");}).join("; "):"Todavía no hay cláusulas obligatorias en modelos fijados."}</div></div>}
    </div>}
    {seccion==="frecuentes"&&puedeEditar&&<div className="card" style={{padding:14}}>
      <div style={{fontSize:15,fontWeight:700,marginBottom:5}}>Cláusulas recomendadas</div>
      <div style={{fontSize:12.5,color:"var(--muted)",lineHeight:1.55,marginBottom:12}}>Elegí las cláusulas que el broker podrá incorporar voluntariamente al preparar una operación. No modifican el documento base.</div>
      <label style={{display:"block",fontSize:12,marginBottom:6}}>Tipo de documento</label>
      <select value={tipoDocSel} onChange={function(e){setTipoDocSel(e.target.value);}} style={{width:"100%",maxWidth:380,padding:10,borderRadius:9,border:"1px solid var(--border)",background:"var(--card)",color:"var(--text)",marginBottom:12}}>{PLANTILLA_TIPOS.map(function(tipo){return <option key={tipo} value={tipo}>{TIPOS[tipo]||tipo}</option>;})}</select>
      {(clausulas||[]).filter(function(c){return c&&clausulaAplicaTipo(c,tipoDocSel)&&protegidas.indexOf(c.id)===-1&&!clausulaYaEnTextoBase(c);}).map(function(c){var ids=obtenerPlantillaConfig(perfil,tipoDocSel,clausulas).frecuentes_ids||[];return <label key={c.id} style={{display:"flex",alignItems:"center",gap:11,padding:"12px 2px",borderBottom:"1px solid var(--border)",cursor:"pointer"}}><input type="checkbox" checked={ids.indexOf(c.id)!==-1} onChange={function(){alternarFrecuente(c.id);}}/><span style={{flex:1,minWidth:0,fontSize:13}}>{c.titulo||"Cláusula sin título"}</span></label>;})}
      <div style={{fontSize:12,color:"var(--muted)",marginTop:12}}>Las cláusulas de precio, honorarios y otras partes estructurales permanecen exclusivamente en el modelo de la inmobiliaria.</div>
    </div>}
    {seccion==="modelos"&&puedeEditar&&<div style={{display:"flex",flexDirection:"column",gap:12}}>\n      {documentoAbierto&&<button type="button" className="btn btn-secondary btn-sm" style={{alignSelf:"flex-start"}} onClick={function(){setDocumentoAbierto(false);setPreviewModeloAbierta(false);}}>← Todos los documentos</button>}
      <style>{".dw-model-type-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.dw-model-type-chip{min-width:0;text-align:left}@media(max-width:640px){.dw-model-type-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.dw-model-type-chip{width:100%;min-width:0;max-width:none}}@media(max-width:380px){.dw-model-type-grid{grid-template-columns:minmax(0,1fr)}}"}</style>
      {!documentoAbierto&&<div id="dw-config-tipo" className="card" style={{padding:12,scrollMarginTop:90}}>
        <div style={{fontSize:12,fontWeight:750,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Elegí un documento</div><div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5,marginBottom:10}}>Seleccioná el documento para personalizar sus cláusulas y su contenido.</div>
        <div className="dw-model-type-grid">{PLANTILLA_TIPOS.map(function(tipo){var cfg=obtenerPlantillaConfig(perfil,tipo,clausulas);var active=tipoDocSel===tipo;return <button key={tipo} type="button" className="dw-model-type-chip" onClick={function(){setTipoDocSel(tipo);setDocumentoAbierto(true);setPreviewModeloAbierta(false);}} style={{display:"flex",flexDirection:"column",gap:5,border:"1px solid "+(active?"rgba(212,168,83,.65)":"var(--border)"),borderRadius:10,padding:"10px 11px",background:active?"rgba(212,168,83,.10)":"var(--card)",color:active?"var(--text)":"var(--muted)",cursor:"pointer"}}><span style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:5,fontSize:12,fontWeight:750}}><span>{TIPOS[tipo]||tipo}</span>{cfg.locked&&<span title="Modelo fijado" aria-label="Modelo fijado">🔒</span>}</span><span style={{fontSize:11,color:"var(--dim)"}}>{contarModelo(tipo)} cláusulas</span></button>;})}</div>
      </div>}
      {documentoAbierto&&<div role="tablist" aria-label="Contenido del modelo" style={{display:"flex",gap:6,flexWrap:"wrap"}}><button type="button" role="tab" aria-selected={subseccionModelo==="obligatorias"} onClick={function(){setSubseccionModelo("obligatorias");}} className="btn btn-sm" style={{flex:"1 1 150px",minHeight:42,background:subseccionModelo==="obligatorias"?"var(--card)":"transparent",border:"1px solid var(--border)",color:"var(--text)"}}><span aria-hidden="true">🔒 </span>Obligatorias</button><button type="button" role="tab" aria-selected={subseccionModelo==="introduccion"} onClick={function(){setSubseccionModelo("introduccion");}} className="btn btn-sm" style={{flex:"1 1 150px",minHeight:42,background:subseccionModelo==="introduccion"?"var(--card)":"transparent",border:"1px solid var(--border)",color:"var(--text)"}}>Introducción y texto base</button></div>}
      {documentoAbierto&&<EncabezadoFijadoPanel pasoModelo={subseccionModelo==="introduccion"?3:2} perfil={perfil} onSavePerfil={guardarPerfil} clausulas={Array.isArray(clausulas)?clausulas:[]} tipoDocExterno={tipoDocSel} onTipoDocChange={setTipoDocSel} ocultarSelector={true} barraSuperior={true} previewOpen={previewModeloAbierta} onPreviewChange={function(open){if(open)setSubseccionModelo("obligatorias");setPreviewModeloAbierta(open);}}>
        <div className="card" style={{padding:14}}>
          <div style={{fontSize:15,fontFamily:"DM Serif Display,serif",color:"var(--text)"}}><span aria-hidden="true">🔒 </span>Cláusulas obligatorias</div>
          <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,margin:"5px 0 12px"}}>Son el esqueleto del documento: salen siempre, en este orden. Editá el texto y reordená las cláusulas. Las esenciales del sistema no se pueden eliminar.</div>
          <div id="dw-model-preview-area">
            {bloquesError&&tipoDocSel==="reserva"&&<div className="notice notice-amber" style={{fontSize:12,marginBottom:10}}>{bloquesError} {onRetryBloques&&<button type="button" onClick={onRetryBloques} className="btn btn-secondary btn-sm">Reintentar</button>}</div>}
            {bloquesLoading&&tipoDocSel==="reserva"&&(!bloquesReserva||bloquesReserva.length===0)&&<div style={{fontSize:12,color:"var(--dim)",marginBottom:9}}>Cargando las cláusulas del modelo de Reserva…</div>}
            {tipoDocSel==="reserva" ? <ReservaBloquesPanel bloques={Array.isArray(bloquesReserva)&&bloquesReserva.length?bloquesReserva:DEFAULT_BLOQUES_RESERVA} onUpdate={onUpdateBloqueReserva} onMove={onMoveBloqueReserva} clausulasLib={Array.isArray(clausulas)?clausulas:[]} operaciones={Array.isArray(operaciones)?operaciones:[]} puedeEditar={puedeEditar&&Array.isArray(bloquesReserva)&&bloquesReserva.length>0&&!obtenerPlantillaConfig(perfil,tipoDocSel,clausulas).locked} perfil={perfil} onSavePerfil={guardarPerfil} previewOpen={previewModeloAbierta} onPreviewChange={setPreviewModeloAbierta} puedeVerHistorial={puedeEditar} onAgregarClausula={function(){setSeccion("frecuentes");}}/> : <CuerpoPlantillaPanel perfil={perfil} tipo={tipoDocSel} puedeEditar={puedeEditar&&!obtenerPlantillaConfig(perfil,tipoDocSel,clausulas).locked} puedeVerHistorial={puedeEditar} usuarioActual={usuarioActual} onChange={guardarPerfil} clausulas={Array.isArray(clausulas)?clausulas:[]} previewOpen={previewModeloAbierta} onPreviewChange={setPreviewModeloAbierta}/> }
          </div>
        </div>
      </EncabezadoFijadoPanel>}
    </div>}
    {seccion==="modelos"&&!puedeEditar&&<div className="notice" style={{fontSize:12}}>Los modelos de los documentos están disponibles únicamente para Dueño y Administrador.</div>}
  </div>;
}
 return ClausulasWorkspace;
}
