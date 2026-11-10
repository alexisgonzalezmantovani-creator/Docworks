import { IA_HABILITADA, MENSAJE_IA_PAUSADA } from './PrivacidadIA';
import { RECOMENDACION_ASESORAMIENTO } from './AvisoModelos';
import { SelectorDocumento } from './SelectorDocumento';
// Módulo extraído sin modificar las declaraciones originales.
export const CLAUSULAS_DEFAULT = [
  { id:"especial.credito_hipotecario", titulo:"Operación supeditada a crédito hipotecario", categoria:"financiación", tipos:["reserva","boleto"], obligatoria:false, contenido:"La presente operación queda supeditada a la aprobación del crédito hipotecario solicitado por la parte compradora." },
  { id:"especial.aires_incluidos", titulo:"Aires acondicionados incluidos", categoria:"entrega", tipos:["reserva","boleto","reserva_alquiler","alquiler"], obligatoria:false, contenido:"La parte obligada a entregar el inmueble se compromete a entregarlo con los equipos de aire acondicionado identificados por las partes en el detalle o inventario de entrega, en el estado de funcionamiento expresamente acordado." },
  { id:"especial.entrega_amoblada", titulo:"Entrega amoblada con inventario", categoria:"entrega", tipos:["reserva","boleto","reserva_alquiler","alquiler"], obligatoria:false, contenido:"El inmueble se entregará amoblado con los muebles, artefactos y elementos individualizados en el inventario de entrega firmado por las partes, que se incorpora como anexo. El inventario deberá detallar cantidades, descripción y estado de los bienes." },
  { id:"especial.interior_pintado", titulo:"Entrega con interiores pintados", categoria:"entrega", tipos:["reserva","boleto","reserva_alquiler","alquiler"], obligatoria:false, contenido:"La parte obligada a entregar el inmueble se compromete a entregarlo con la totalidad de sus ambientes interiores pintados, en las condiciones de terminación acordadas por las partes." },
  { id:"c1", titulo:"Multa por incumplimiento", categoria:"rescisión", tipos:["reserva","boleto","refuerzo_reserva"], obligatoria:true, contenido:"En caso de incumplimiento imputable a alguna de las partes, se aplicarán las consecuencias expresamente pactadas en la reserva o boleto, según la naturaleza de las sumas entregadas y la normativa aplicable." },
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
    contenido:RECOMENDACION_ASESORAMIENTO,
    variables:[], condicion:null, orden:14, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.refuerzo", titulo:"REFUERZO", sinTitulo:false,
    contenido:"El Oferente podrá ofrecer, de así convenirlo con el Vendedor, un Refuerzo de la presente Reserva dentro de los 7 días corridos a partir de su conformidad, cuyo monto y demás condiciones se consignarán en el instrumento de Refuerzo de Reserva correspondiente.-",
    variables:[], condicion:null, orden:15, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
];

// Catálogo activo único para Biblioteca y las opciones de cada documento.
// La coincidencia de títulos es exacta: variantes con otros plazos se conservan.
export function filtrarCatalogoClausulas(clausulas,opciones){
  var o=opciones||{},protegidas=o.idsProtegidos||[];
  var esenciales=["multa por incumplimiento","libre de ocupantes","expensas y servicios","comisión inmobiliaria","jurisdicción","estado del inmueble","prohibición de subalquilar","servicios a cargo del locatario","obras y mejoras"];
  function clave(t){return String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/\s+/g," ");}
  var titulosBase=esenciales.map(clave);
  return (clausulas||[]).filter(function(c){
    if(!c||c.activo===false||c.id==="c4"||protegidas.indexOf(c.id)!==-1)return false;
    if(titulosBase.indexOf(clave(c.titulo))!==-1||o.esTextoBase(c))return false;
    return !o.tipo||o.aplicaTipo(c,o.tipo);
  });
}

// Comparación orientativa de títulos; nunca decide equivalencia del texto legal.
export function buscarTitulosParecidos(titulo,clausulas,excluirId){
  function palabras(t){return Array.from(new Set(String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().split(/[^a-z0-9]+/).filter(function(p){return p&&!/^(de|del|la|el|los|las|por|para|con|sin|y|en|a|un|una|clausula)$/.test(p);})));}
  var buscadas=palabras(titulo);
  if(!buscadas.length)return [];
  return (clausulas||[]).filter(function(c){
    if(!c||c.id===excluirId||c.activo===false)return false;
    var otras=palabras(c.titulo),comunes=buscadas.filter(function(p){return otras.indexOf(p)!==-1;}).length;
    var exactas=buscadas.slice().sort().join(" ")===otras.slice().sort().join(" ");
    return exactas||(comunes>=2&&(comunes/Math.min(buscadas.length,otras.length)>=0.8||comunes/(buscadas.length+otras.length-comunes)>=0.6));
  }).slice(0,3);
}

// Conservar el UUID creado permite reintentar solo la habilitación si falla el perfil.
export async function guardarClausulaConDisponibilidad(clausula,opciones,deps){
  var id=opciones.creadaId||null;
  try{
    if(!id){var creada=await deps.crear(clausula);if(creada&&creada.error)return creada;id=creada&&creada.data;}
    if(typeof id!=="string"||!id)return {error:{message:"No se pudo confirmar la cláusula guardada. Actualizá la biblioteca antes de volver a crearla."},creacionSinConfirmar:true};
    if(!opciones.habilitar)return {data:id};
    var perfil=deps.getPerfil(),mapa=Object.assign({},perfil.plantillas||{});
    deps.tipos.forEach(function(tipo){
      if(!deps.aplicaTipo(clausula,tipo))return;
      var config=deps.obtenerConfig(perfil,tipo,deps.catalogo||[]),actual=Object.assign({},mapa[tipo]||{});
      actual.clausulas_ids=Array.from(new Set((config.clausulas_ids||[]).concat([id])));
      mapa[tipo]=actual;
    });
    var resultado=await deps.guardarPerfil(Object.assign({},perfil,{plantillas:mapa}));
    if(resultado&&resultado.error)return {error:{message:"La cláusula ya está guardada en la biblioteca. No se pudo habilitar para los asesores. Reintentá la habilitación."},clausulaCreadaId:id};
    return {data:id};
  }catch(e){return {error:{message:id?"La cláusula ya está guardada. Reintentá habilitarla para los asesores.":"No se pudo confirmar el guardado. Actualizá la biblioteca antes de volver a crearla."},clausulaCreadaId:id||undefined,creacionSinConfirmar:!id};}
}

// Editor de biblioteca de cláusulas separado de App.tsx.
export function crearClausulasView(deps) {
  const { useState, useRef, useEffect, requestDwConfirm, CLAUSULAS_DEFAULT, CLAUSULA_CATS, ClausulaFormBody, DWIcon, FORM_CLAUSULA_EMPTY, HistorialClausulaModal, TIPOS, genId, dwNotify, traducirError, narrarClausulaIA, clausulaYaEnTextoBase, clausulaAplicaTipo } = deps;
function ClausulasView({clausulas,onAdd,onEdit,onDelete,puedeEditar,rolLabel,error,loading,ocultarProtegidasIds,modoIntegrado,onRetry,tipoFiltro,puedeVerHistorial,clausulasParaComparar,selectorDocumento,onAbrirPapelera}){
  const [form,setForm]=useState(FORM_CLAUSULA_EMPTY);
  const [editId,setEditId]=useState(null);
  const [guardandoClausula,setGuardandoClausula]=useState(false);
  const [errorGuardadoClausula,setErrorGuardadoClausula]=useState("");
  const [filtroTexto,setFiltroTexto]=useState("");
  const [filtroCategoria,setFiltroCategoria]=useState("todas");
  const [soloPersonalizadas,setSoloPersonalizadas]=useState(false);
  const [clausulaTab,setClausulaTab]=useState("biblioteca");
  const [clausulaExpandida,setClausulaExpandida]=useState(null);
  const [historialSeleccionado,setHistorialSeleccionado]=useState(null);
  const [ideaInicial,setIdeaInicial]=useState("");
  const [generandoIdea,setGenerandoIdea]=useState(false);
  const [errorIdea,setErrorIdea]=useState("");
  const [opcionesAbiertas,setOpcionesAbiertas]=useState(false);
  const [habilitarParaAsesores,setHabilitarParaAsesores]=useState(true);
  const [clausulaCreadaId,setClausulaCreadaId]=useState(null);
  const [creacionSinConfirmar,setCreacionSinConfirmar]=useState(false);
  var editable = puedeEditar!==false;
  const salvandoRef=useRef(false);
  const salidaBibliotecaRef=useRef(null);
  var hayBorrador=clausulaTab==="editor"&&!!(editId||String(form.titulo||"").trim()||String(form.contenido||"").trim()||ideaInicial.trim());
  function cerrarEditor(){
    setEditId(null);setClausulaCreadaId(null);setCreacionSinConfirmar(false);
    setForm(FORM_CLAUSULA_EMPTY);setIdeaInicial("");setClausulaTab("biblioteca");
  }
  function solicitarSalida(continuar){
    if(salvandoRef.current||generandoIdea){dwNotify("info","Esperá a que termine la acción en curso antes de salir de la cláusula.");return;}
    if(!hayBorrador){continuar();return;}
    var mensaje=clausulaCreadaId?"La cláusula está guardada en la biblioteca, pero falta habilitarla para los asesores. ¿Salir y dejar la habilitación pendiente?":creacionSinConfirmar?"El guardado no pudo confirmarse. Revisá la biblioteca antes de crear otra copia. ¿Salir del editor?":"¿Descartar los cambios sin guardar antes de salir de la cláusula?";
    requestDwConfirm(mensaje,continuar);
  }
  salidaBibliotecaRef.current={pendiente:hayBorrador||guardandoClausula||generandoIdea,salir:function(continuar){solicitarSalida(function(){cerrarEditor();continuar();});}};
  useEffect(function(){
    function protegerNavegacion(e){
      if(e.defaultPrevented||!salidaBibliotecaRef.current.pendiente)return;
      e.preventDefault();salidaBibliotecaRef.current.salir(e.detail.continuar);
    }
    function advertirRecarga(e){if(salidaBibliotecaRef.current.pendiente){e.preventDefault();e.returnValue="";}}
    window.addEventListener("dw:model-navigation",protegerNavegacion);
    window.addEventListener("beforeunload",advertirRecarga);
    return function(){window.removeEventListener("dw:model-navigation",protegerNavegacion);window.removeEventListener("beforeunload",advertirRecarga);};
  },[]);
  var similares=buscarTitulosParecidos(form.titulo,clausulasParaComparar||clausulas,editId||clausulaCreadaId);
  async function submit(){
    if(!editable||guardandoClausula||salvandoRef.current||creacionSinConfirmar)return;
    if(!String(form.titulo||"").trim()||!String(form.contenido||"").trim()){
      setErrorGuardadoClausula("Completá el título y el texto antes de guardar.");return;
    }
    salvandoRef.current=true;setGuardandoClausula(true);setErrorGuardadoClausula("");
    try{
      var resultado=editId?await onEdit(editId,form):await onAdd(Object.assign({},form,{id:genId(),obligatoria:modoIntegrado?false:!!form.obligatoria}),{habilitar:!!modoIntegrado&&habilitarParaAsesores,creadaId:clausulaCreadaId});
      if(resultado&&resultado.error){if(resultado.clausulaCreadaId)setClausulaCreadaId(resultado.clausulaCreadaId);if(resultado.creacionSinConfirmar)setCreacionSinConfirmar(true);throw resultado.error;}
      if(!editId)dwNotify("success",modoIntegrado&&habilitarParaAsesores?"Cláusula guardada y disponible para los asesores en los documentos elegidos.":"Cláusula guardada en la biblioteca.");
      setClausulaCreadaId(null);
      setForm(FORM_CLAUSULA_EMPTY);setEditId(null);setClausulaTab("biblioteca");
    }catch(err){
      setErrorGuardadoClausula(traducirError(err&&err.message?err.message:"No se pudo guardar la cláusula. Reintentá sin perder los datos ingresados."));
    }finally{salvandoRef.current=false;setGuardandoClausula(false);}
  }
  function abrirNueva(idea=null){if(!editable||guardandoClausula)return;setErrorGuardadoClausula("");setClausulaCreadaId(null);setCreacionSinConfirmar(false);setHabilitarParaAsesores(true);setEditId(null);setForm(Object.assign({},FORM_CLAUSULA_EMPTY,idea&&idea.contenido?idea:{},{tipos:tipoFiltro?[tipoFiltro]:idea&&idea.tipos||["todos"],obligatoria:false}));setIdeaInicial("");setErrorIdea("");setOpcionesAbiertas(false);setClausulaTab("editor");}
  function abrirEdicion(c){if(!editable||guardandoClausula)return;setClausulaCreadaId(null);setCreacionSinConfirmar(false);setErrorGuardadoClausula("");setEditId(c.id);setForm({titulo:c.titulo,categoria:c.categoria,contenido:c.contenido,tipos:c.tipos||["todos"],obligatoria:!!c.obligatoria});setOpcionesAbiertas(true);setClausulaTab("editor");}
  function aplicarBorrador(draft){
    setEditId(null);
    setForm({titulo:draft.titulo||"",categoria:draft.categoria||"general",contenido:draft.contenido||"",tipos:tipoFiltro?[tipoFiltro]:["todos"],obligatoria:false});
    setErrorIdea("");
  }
  async function redactarIdea(){
    if(!ideaInicial.trim()||generandoIdea)return;
    setGenerandoIdea(true);setErrorIdea("");
    try{var draft=await narrarClausulaIA(ideaInicial.trim());if(draft){aplicarBorrador(draft);}else{setErrorIdea("No pude interpretar la respuesta. Probá reformular la idea.");}}
    catch(e){setErrorIdea(e&&e.message?e.message:"No se pudo usar el asistente. Podés escribir la cláusula manualmente.");}
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
        {!modoIntegrado&&<div><div className="section-title">Biblioteca de cláusulas</div><div className="section-sub">Condiciones especiales reutilizables para cada documento.</div></div>}
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
          <button type="button" onClick={function(){solicitarSalida(cerrarEditor);}} style={{flex:1,border:0,borderBottom:clausulaTab==="biblioteca"?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:clausulaTab==="biblioteca"?"var(--text)":"var(--muted)",padding:"10px 12px",cursor:"pointer",fontSize:12,fontWeight:clausulaTab==="biblioteca"?700:500}}>Biblioteca de cláusulas</button>
          {editable&&<button type="button" onClick={function(){abrirNueva();}} style={{flex:1,border:0,borderBottom:clausulaTab==="editor"?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:clausulaTab==="editor"?"var(--text)":"var(--muted)",padding:"10px 12px",cursor:"pointer",fontSize:12,fontWeight:clausulaTab==="editor"?700:500}}>{editId?"Modificar cláusula":"Crear cláusula"}</button>}
        </div>
      </div>}
      {modoIntegrado&&clausulaTab!=="editor"&&<div style={{marginBottom:16}}>{selectorDocumento?selectorDocumento(editable?<button type="button" className="btn btn-primary" style={{minHeight:42,fontSize:13,flexShrink:0}} onClick={function(){abrirNueva();}}>＋ Crear cláusula para biblioteca</button>:null):editable?<div style={{display:"flex",justifyContent:"flex-end"}}><button type="button" className="btn btn-primary" onClick={function(){abrirNueva();}}>＋ Crear cláusula para biblioteca</button></div>:null}</div>}
      {clausulaTab==="editor"&&editable&&onAbrirPapelera&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}><button type="button" className="btn btn-secondary btn-sm" onClick={function(){onAbrirPapelera();}}><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"/></svg> Papelera</button></div>}
      {clausulaTab==="editor"&&editable&&<div className="card" style={{padding:18,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14}}>
          <div><p style={{fontFamily:"DM Serif Display,serif",fontSize:15,color:"var(--text)",margin:0}}>{editId?"Modificar cláusula":"Crear cláusula para la biblioteca"}</p><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{editId?"Editá el título y el texto; después guardá los cambios.":"Partí de una idea, redactala con IA o escribila directamente. Revisá el texto antes de guardarlo."}</div></div>
          <button type="button" disabled={guardandoClausula||generandoIdea} onClick={function(){solicitarSalida(cerrarEditor);}} style={{border:"1px solid var(--border)",background:"rgba(255,255,255,.03)",color:"var(--muted)",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:12}}>Cancelar</button>
        </div>
        {!editId&&!clausulaCreadaId&&!creacionSinConfirmar&&<div style={{padding:12,border:"1px solid var(--border)",borderRadius:10,marginBottom:14,background:"var(--card2, var(--card))"}}>
          <label className="field-label" style={{display:"block",marginBottom:7}}>Contá en una frase qué querés que diga</label>
          <textarea className="inp" rows={2} value={ideaInicial} onChange={function(e){setIdeaInicial(e.target.value);setErrorIdea("");}} placeholder="Idea genérica, sin datos personales. Ej.: distribución de gastos de reparación." style={{width:"100%",resize:"vertical",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:9}}>
            <button type="button" className="btn btn-primary" disabled={!IA_HABILITADA||!ideaInicial.trim()||generandoIdea} title={!IA_HABILITADA?MENSAJE_IA_PAUSADA:undefined} onClick={redactarIdea}>{!IA_HABILITADA?"IA en pausa":generandoIdea?"Redactando…":"Redactar con IA"}</button>
            <button type="button" className="btn btn-secondary" onClick={function(){setErrorIdea("");setForm(function(f){return Object.assign({},f,{contenido:f.contenido||ideaInicial.trim()});});setTimeout(function(){var el=document.getElementById("dw-clausula-texto");if(el)el.focus();},0);}}>Escribirla yo</button>
          </div>
          {errorIdea&&<div style={{fontSize:12,color:"var(--red)",marginTop:7}}>{errorIdea}</div>}
        </div>}
        {errorGuardadoClausula&&<div role="alert" style={{color:"var(--red)",fontSize:12.5,marginBottom:9}}>{errorGuardadoClausula}</div>}
        <ClausulaFormBody form={form} setForm={setForm} editId={editId} onSubmit={submit} guardando={guardandoClausula} habilitarParaAsesores={modoIntegrado&&!editId?habilitarParaAsesores:undefined} onHabilitarChange={setHabilitarParaAsesores} soloHabilitar={!!clausulaCreadaId||creacionSinConfirmar} bloquearGuardado={creacionSinConfirmar} guardarLabel={clausulaCreadaId?"Reintentar habilitación":modoIntegrado&&!editId&&habilitarParaAsesores?"Guardar y habilitar":undefined} advertencia={similares.length>0&&!clausulaCreadaId?<div role="status" style={{padding:12,border:"1px solid var(--gold)",borderRadius:10,fontSize:12.5,lineHeight:1.5}}><b>Hay títulos parecidos en la biblioteca</b><p style={{margin:"5px 0"}}>Podrían tener condiciones o plazos diferentes. Revisá el texto; podés guardar esta cláusula igualmente.</p>{similares.map(function(c){return <details key={c.id} style={{marginTop:6}}><summary style={{cursor:"pointer",fontWeight:650}}>{c.titulo}</summary><div style={{whiteSpace:"pre-wrap",marginTop:5}}>{c.contenido}</div></details>;})}</div>:null} onCancel={function(){solicitarSalida(cerrarEditor);}}/>
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
            
          </div>

          <div style={{fontSize:12,color:"var(--dim)"}}>{filtradas.length} de {bibliotecaVisible.length} cláusula{bibliotecaVisible.length===1?"":"s"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {bibliotecaVisible.length===0&&<div style={{padding:28,textAlign:"center",color:"var(--dim)",fontSize:13}}>No hay cláusulas visibles para este rol.</div>}
            {bibliotecaVisible.length>0&&filtradas.length===0&&<div style={{padding:28,textAlign:"center",color:"var(--dim)",fontSize:13}}>Ninguna cláusula coincide con el filtro.</div>}
            {filtradas.map(function(c){
              var esTodos=!c.tipos||!c.tipos.length||c.tipos.indexOf("todos")!==-1;
              var expandida=clausulaExpandida===c.id;
              return(
                <div key={c.id} data-clausula-id={c.id} className="op-card">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{(c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título"}</span>
                        <span className={"badge "+(c.categoria==="alquiler"?"badge-tipo":"badge-gold")} style={{textTransform:"capitalize"}}>{c.categoria}</span>
                        {esPersonalizada(c)&&<span className="badge badge-activo">Personalizada</span>}
                      </div>
                      <div style={{fontSize:12,color:"var(--dim)",marginBottom:4}}>{esTodos?"Todos los documentos":c.tipos.map(function(t){return TIPOS[t]||t;}).join(", ")}</div>

                    </div>
                    <button type="button" aria-expanded={expandida} aria-label={(expandida?"Contraer":"Ver")+" cláusula: "+c.titulo} onClick={function(){setClausulaExpandida(expandida?null:c.id);}} style={{width:40,height:40,flexShrink:0,border:"1px solid var(--border)",borderRadius:9,background:"transparent",color:"var(--text)",fontSize:22,cursor:"pointer"}}>{expandida?"−":"+"}</button>
                  </div>
                  {expandida&&<div style={{paddingTop:10,marginTop:8,borderTop:"1px solid var(--border)"}}><p style={{fontSize:13,color:"var(--text)",whiteSpace:"pre-wrap",overflowWrap:"anywhere",lineHeight:1.6}}>{c.contenido}</p><div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end",marginTop:10}}>
                      {puedeVerHistorial&&<button type="button" onClick={function(){setHistorialSeleccionado(c);}} className="btn btn-ghost btn-sm" style={{padding:"2px 6px",fontSize:10,lineHeight:1.2,minHeight:24,height:24,whiteSpace:"nowrap",flexShrink:0}}>Historial</button>}
                    {editable&&(
                      <div style={{display:"flex",gap:3,flexShrink:0}}>
                        <button onClick={function(){abrirEdicion(c);}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:12,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><DWIcon name="edit" size={14}/></button>
                        <button type="button" title="Mover a papelera" aria-label={"Mover a papelera: "+c.titulo} onClick={function(){onDelete(c.id);}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(248,113,113,0.05)",border:"1px solid rgba(248,113,113,0.15)",color:"var(--red)",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:36,minHeight:36}}><svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6"/></svg></button>
                      </div>
                    )}
                    </div></div>}
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
 const {ClausulasView, CuerpoPlantillaPanel, DEFAULT_BLOQUES_RESERVA, EncabezadoFijadoPanel, PLANTILLA_TIPOS, ROLES_DEF, ReservaBloquesPanel, TIPOS, TIPO_ICON={}, clausulaAplicaTipo, clausulaYaEnTextoBase, contarBloquesCuerpo, mostrarTokensDocWorks, obtenerIdsProtegidosDePlantillas, obtenerPlantillaConfig, navegarConProteccionModelo, requestDwConfirm, useEffect, useRef, useState} = deps;


/* Componente legado de cláusulas personales eliminado: ya no forma parte del producto. */

function ClausulasWorkspace({perfil,onSavePerfil,operaciones,clausulas,onAddClausula,onEditClausula,onDeleteClausula,papeleraClausulas,papeleraClausulasLoading,papeleraClausulasError,onRecargarPapeleraClausulas,onRestaurarClausula,bloquesReserva,onUpdateBloqueReserva,onMoveBloqueReserva,bloquesError,bloquesLoading,onRetryBloques,clausulasError,clausulasLoading,onRetryClausulas,usuarioActual}) {
  const [restaurandoClausula,setRestaurandoClausula]=useState(null);
  const [errorPapeleraClausulas,setErrorPapeleraClausulas]=useState("");
  const [seccion,setSeccionDirecto]=useState(perfil&&(perfil.rol==="dueno"||perfil.rol==="admin")?"modelos":"adicionales");
  function setSeccion(next){
    if(next===seccion)return;
    function cambiar(){setModeloEditando(false);setIntroduccionEditando(false);setSeccionDirecto(next);if(next==="papelera"){setErrorPapeleraClausulas("");if(onRecargarPapeleraClausulas)onRecargarPapeleraClausulas();}}
    if(seccion==="adicionales"){navegarConProteccionModelo(cambiar);return;}
    if(modeloEditando&&next!==seccion)requestDwConfirm("¿Descartar los cambios sin guardar antes de salir del modelo?",cambiar);else cambiar();
  }
  const [tipoDocSel,setTipoDocSel]=useState("reserva");
  const [clausulaEditando,setModeloEditando]=useState(false);
  const [introduccionEditando,setIntroduccionEditando]=useState(false);
  const modeloEditando=clausulaEditando||introduccionEditando;
  function cambiarDocumento(tipo){
    if(tipo===tipoDocSel)return;
    function cambiar(){setModeloEditando(false);setIntroduccionEditando(false);setTipoDocSel(tipo);}
    if(modeloEditando)requestDwConfirm("¿Descartar los cambios sin guardar antes de cambiar de documento?",cambiar);else cambiar();
  }
  const [filtroAdicional,setFiltroAdicional]=useState("todas");
  const [previewModeloAbierta,setPreviewModeloAbierta]=useState(false);
  const [opcionalEditando,setOpcionalEditando]=useState(null);
  const [opcionalBorrador,setOpcionalBorrador]=useState(null);
  const [opcionalGuardando,setOpcionalGuardando]=useState(false);
  const [opcionalError,setOpcionalError]=useState("");
  const [estadoClausulaError,setEstadoClausulaError]=useState("");
  const [estadoClausulaGuardando,setEstadoClausulaGuardando]=useState(null);
  const estadoClausulaGuardandoRef=useRef(false);
  function abrirEdicionOpcional(c){
    if(!puedeEditar||!c)return;
    setOpcionalEditando(c.id);
    setOpcionalBorrador({titulo:c.titulo||"",contenido:c.contenido||"",categoria:c.categoria||"general",tipos:c.tipos||["todos"],obligatoria:!!c.obligatoria});
    setOpcionalError("");
  }
  async function guardarEdicionOpcional(){
    if(!opcionalBorrador||!opcionalEditando||opcionalGuardando)return;
    if(!opcionalBorrador.titulo.trim()||!opcionalBorrador.contenido.trim()){setOpcionalError("Completá título y contenido.");return;}
    setOpcionalGuardando(true);setOpcionalError("");
    try{
      var resultado=await onEditClausula(opcionalEditando,opcionalBorrador);
      if(resultado&&resultado.error)throw resultado.error;
      setOpcionalEditando(null);setOpcionalBorrador(null);
    }catch(e){setOpcionalError(e&&e.message?e.message:"No se pudo guardar la cláusula.");}
    finally{setOpcionalGuardando(false);}
  }

  const puedeEditar=!!perfil&&(perfil.rol==="dueno"||perfil.rol==="admin");
  // La navegación de Biblioteca y Modelos es independiente: no forzar el cambio de pestaña.
  useEffect(function(){if(!puedeEditar&&seccion!=="adicionales")setSeccion("adicionales");},[puedeEditar]);
  const rolLabel=(ROLES_DEF[perfil&&perfil.rol]&&ROLES_DEF[perfil.rol].label)||(perfil&&perfil.rol)||"usuario";
  function guardarPerfil(next){return onSavePerfil(next);}
  const perfilActualRef=useRef(perfil);perfilActualRef.current=perfil;
  function crearYHabilitar(clausula,opciones){
    if(!puedeEditar)return Promise.resolve({error:{message:"Sin permisos para crear cláusulas."}});
    return guardarClausulaConDisponibilidad(clausula,opciones||{habilitar:true},{crear:onAddClausula,getPerfil:function(){return perfilActualRef.current;},guardarPerfil:guardarPerfil,tipos:PLANTILLA_TIPOS,aplicaTipo:clausulaAplicaTipo,obtenerConfig:obtenerPlantillaConfig,catalogo:clausulas});
  }
  async function cambiarEstadoClausulaBiblioteca(clausula,estado){
    if(!puedeEditar||!clausula)return;
    if(clausula.obligatoria===true){setEstadoClausulaError("Esta cláusula es obligatoria en el modelo anterior y no se puede cambiar desde las adicionales.");return;}
    if(estadoClausulaGuardandoRef.current)return;
    setEstadoClausulaError("");
    if(estado!=="asesor"&&estado!=="apagada"){setEstadoClausulaError("Elegí si esta cláusula adicional estará disponible para el asesor.");return;}
    var perfilVigente=perfilActualRef.current;
    var mapa=Object.assign({},perfilVigente&&perfilVigente.plantillas||{}),cfg=Object.assign({},mapa[tipoDocSel]||{});
    var opcionales=obtenerPlantillaConfig(perfilVigente,tipoDocSel,clausulas).clausulas_ids.slice();
    var tipoAlGuardar=tipoDocSel;
    var obligatorias=Array.isArray(cfg.obligatorias_ids)?cfg.obligatorias_ids.slice():[];
    if(estado==="apagada"){opcionales=opcionales.filter(function(id){return id!==clausula.id;});obligatorias=obligatorias.filter(function(id){return id!==clausula.id;});}
    else {obligatorias=obligatorias.filter(function(id){return id!==clausula.id;});if(opcionales.indexOf(clausula.id)<0)opcionales.push(clausula.id);}
    cfg.clausulas_ids=opcionales;cfg.obligatorias_ids=obligatorias;
    estadoClausulaGuardandoRef.current=true;
    setEstadoClausulaGuardando(clausula.id);
    try {var resultado=await guardarPerfil(Object.assign({},perfilVigente,{plantillas:Object.assign({},perfilVigente&&perfilVigente.plantillas||{},{[tipoAlGuardar]:cfg})}));if(resultado&&resultado.error)throw resultado.error;}
    catch(e){setEstadoClausulaError(e&&e.message?e.message:"No se pudo actualizar la cláusula. Reintentá.");}
    finally{estadoClausulaGuardandoRef.current=false;setEstadoClausulaGuardando(null);}
  }
  function contarModelo(tipo){return contarBloquesCuerpo(perfil,tipo,bloquesReserva);}
  var protegidas=obtenerIdsProtegidosDePlantillas(perfil);
  var catalogoBiblioteca=filtrarCatalogoClausulas(clausulas,{idsProtegidos:protegidas,esTextoBase:clausulaYaEnTextoBase,aplicaTipo:clausulaAplicaTipo});
  var adicionalesVisibles=catalogoBiblioteca.filter(function(c){return filtroAdicional==="todas"||clausulaAplicaTipo(c,filtroAdicional);});
  var opcionalesDocumento=catalogoBiblioteca.filter(function(c){return clausulaAplicaTipo(c,tipoDocSel);});
  var configAdicionalesDocumento=obtenerPlantillaConfig(perfil,tipoDocSel,clausulas);
  var cantidadAdicionalesDisponibles=opcionalesDocumento.filter(function(c){return c.obligatoria===true||(configAdicionalesDocumento.clausulas_ids||[]).includes(c.id)||(configAdicionalesDocumento.obligatorias_ids||[]).includes(c.id);}).length;
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div className="section-header"><div><div className="section-title">{puedeEditar?"Cláusulas y documentos":"Mi biblioteca"}</div><div className="section-sub">{seccion==="papelera"?"Consultá y recuperá las cláusulas eliminadas.":seccion==="adicionales"?"Guardá textos para reutilizarlos en tus documentos.":"Elegí un documento y editá su contenido."}</div></div></div>
    {puedeEditar&&<nav aria-label="Cláusulas y documentos" style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <button type="button" aria-pressed={seccion==="modelos"} className={seccion==="modelos"?"btn btn-primary":"btn btn-secondary"} style={{minHeight:44,flex:"1 1 180px"}} onClick={function(){setSeccion("modelos");}}>Documentos</button>
      <button type="button" aria-pressed={seccion==="adicionales"} className={seccion==="adicionales"?"btn btn-primary":"btn btn-secondary"} style={{minHeight:44,flex:"1 1 180px"}} onClick={function(){setSeccion("adicionales");}}>Biblioteca de cláusulas</button>
      
    </nav>}
    {seccion==="adicionales"&&<div className="card" style={{padding:14}}>
      <h2 style={{fontSize:23,fontWeight:750,fontFamily:"DM Serif Display,serif",color:"var(--text)",margin:"0 0 6px"}}>Biblioteca de cláusulas</h2>

      <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,marginBottom:11}}>Acá guardás condiciones especiales para reutilizar. Al guardarlas podés dejarlas disponibles para los asesores en los documentos elegidos. Cada asesor decide cuáles sumar al final de su operación; las condiciones esenciales ya están en el modelo.</div>
      <ClausulasView selectorDocumento={function(accion){return <SelectorDocumento id="dw-biblioteca-documento" tipos={PLANTILLA_TIPOS} nombres={TIPOS} iconos={TIPO_ICON} value={filtroAdicional} onChange={function(tipo){navegarConProteccionModelo(function(){setFiltroAdicional(tipo);});}} todas={true} accion={<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>{accion}{puedeEditar&&<button type="button" className="btn btn-secondary btn-sm" style={{minHeight:32,padding:"5px 9px",fontSize:11,display:"inline-flex",alignItems:"center",gap:5}} onClick={function(){setSeccion("papelera");}}><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"/></svg> Papelera</button>}</div>}/>;}} clausulas={adicionalesVisibles} clausulasParaComparar={clausulas} onAbrirPapelera={puedeEditar?function(){setSeccion("papelera");}:null} tipoFiltro={filtroAdicional==="todas"?null:filtroAdicional} onAdd={crearYHabilitar} onEdit={onEditClausula} onDelete={onDeleteClausula} puedeEditar={puedeEditar} rolLabel={rolLabel} error={clausulasError} loading={!!clausulasLoading} onRetry={onRetryClausulas} modoIntegrado={true} ocultarProtegidasIds={protegidas} puedeVerHistorial={puedeEditar}/>
    </div>}
      {puedeEditar&&seccion==="papelera"&&<section className="card" aria-labelledby="dw-papelera-titulo" style={{padding:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:12}}><h2 id="dw-papelera-titulo" style={{fontSize:23,fontWeight:750,fontFamily:"DM Serif Display,serif",margin:0}}>Papelera de cláusulas</h2><button type="button" className="btn btn-secondary btn-sm" onClick={function(){setSeccion("adicionales");}}>Volver a biblioteca</button></div><div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>Podés restaurar cláusulas durante 30 días desde su eliminación. Las anteriores a esta función no tienen fecha verificable.</div>{(errorPapeleraClausulas||papeleraClausulasError)&&<div role="alert" style={{color:"var(--danger,#c94a4a)",fontSize:12,marginBottom:8}}>{errorPapeleraClausulas||papeleraClausulasError} <button type="button" onClick={onRecargarPapeleraClausulas}>Reintentar</button></div>}{papeleraClausulasLoading?<div style={{fontSize:12,color:"var(--muted)"}}>Cargando papelera…</div>:!(papeleraClausulas||[]).length?<div style={{fontSize:12,color:"var(--muted)"}}>La papelera está vacía. No hay cláusulas recuperables.</div>:(papeleraClausulas||[]).map(function(c){return <div key={c.id} style={{display:"flex",gap:10,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",padding:"12px 0",borderBottom:"1px solid var(--border)"}}><div style={{minWidth:0,flex:"1 1 200px",overflowWrap:"anywhere"}}><div style={{fontSize:13,fontWeight:650}}>{c.titulo||"Cláusula sin título"}</div><div style={{fontSize:11,color:"var(--muted)"}}>Eliminada: {c.eliminado_en?new Date(c.eliminado_en).toLocaleDateString("es-AR"):"sin fecha"}</div>{c.contenido&&<details style={{fontSize:12,marginTop:8}}><summary style={{cursor:"pointer"}}>Ver texto de la cláusula</summary><div style={{whiteSpace:"pre-wrap",lineHeight:1.6,marginTop:8}}>{c.contenido}</div></details>}</div><button type="button" disabled={restaurandoClausula!==null} onClick={async function(){setRestaurandoClausula(c.id);setErrorPapeleraClausulas("");try{var r=await onRestaurarClausula(c.id);if(r&&r.error)throw r.error;}catch(e){setErrorPapeleraClausulas(e&&e.message?e.message:"No se pudo restaurar.");}finally{setRestaurandoClausula(null);}}} style={{padding:"7px 10px",borderRadius:8,border:"1px solid var(--border)",background:"var(--card)",color:"var(--text)",cursor:"pointer"}}>{restaurandoClausula===c.id?"Restaurando…":"Restaurar"}</button></div>;})}</section>}
    {seccion==="modelos"&&puedeEditar&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <style>{".dw-model-type-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.dw-model-type-chip{min-width:0;text-align:left}@media(max-width:640px){.dw-model-type-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.dw-model-type-chip{width:100%;min-width:0;max-width:none}}@media(max-width:380px){.dw-model-type-grid{grid-template-columns:minmax(0,1fr)}}"}</style>
      {<div id="dw-config-tipo" className="card" style={{padding:12,scrollMarginTop:90}}>
        <SelectorDocumento id="dw-modelo-documento" tipos={PLANTILLA_TIPOS} nombres={TIPOS} iconos={TIPO_ICON} value={tipoDocSel} onChange={cambiarDocumento}/>
        <div style={{fontSize:11,color:"var(--dim)",marginTop:7}}>{contarModelo(tipoDocSel)} cláusulas en el modelo</div>
      </div>}
      <EncabezadoFijadoPanel key={"documento-"+tipoDocSel} onEditingChange={setIntroduccionEditando} modeloEnEdicion={modeloEditando} pasoModelo={3} perfil={perfil} onSavePerfil={guardarPerfil} clausulas={Array.isArray(clausulas)?clausulas:[]} tipoDocExterno={tipoDocSel} onTipoDocChange={cambiarDocumento} ocultarSelector={true} barraSuperior={true} previewOpen={previewModeloAbierta} onPreviewChange={setPreviewModeloAbierta}>
        <div className="card" style={{padding:14}}>
          <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,marginBottom:10}}>Tocá una cláusula para leerla y después elegí Editar. Las esenciales están protegidas.</div>
          <div id="dw-model-preview-area">
            {bloquesError&&tipoDocSel==="reserva"&&<div className="notice notice-amber" style={{fontSize:12,marginBottom:10}}>{bloquesError} {onRetryBloques&&<button type="button" onClick={onRetryBloques} className="btn btn-secondary btn-sm">Reintentar</button>}</div>}
            {bloquesLoading&&tipoDocSel==="reserva"&&(!bloquesReserva||bloquesReserva.length===0)&&<div style={{fontSize:12,color:"var(--dim)",marginBottom:9}}>Cargando las cláusulas del modelo de Reserva…</div>}
            {<CuerpoPlantillaPanel perfil={perfil} tipo={tipoDocSel} bloquesReserva={bloquesReserva} onEditingChange={setModeloEditando} puedeEditar={puedeEditar} puedeVerHistorial={puedeEditar} usuarioActual={usuarioActual} onChange={guardarPerfil} clausulas={Array.isArray(clausulas)?clausulas:[]} previewOpen={previewModeloAbierta} onPreviewChange={setPreviewModeloAbierta}/>}
          </div>
        </div>
      {<details key={"biblioteca-"+tipoDocSel} id="dw-model-extra-clauses" className="card" style={{padding:14,scrollMarginTop:90}} data-step="clausulas">
        <summary style={{fontSize:14,fontWeight:700,color:"var(--text)",cursor:"pointer",minHeight:44,padding:"10px 0",boxSizing:"border-box"}}>Cláusulas adicionales para el asesor ({cantidadAdicionalesDisponibles} disponibles)</summary>
        <div style={{fontSize:13,color:"var(--dim)",lineHeight:1.55,marginTop:5}}>Elegí qué cláusulas de la biblioteca estarán disponibles para {TIPOS[tipoDocSel]||tipoDocSel}. El asesor podrá incorporarlas cuando correspondan a la operación.</div>
        <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,margin:"5px 0 12px"}}>Las cláusulas disponibles se agregan únicamente si el asesor las selecciona. Las que figuran como «Siempre (modelo anterior)» conservan su configuración original.</div>
        {estadoClausulaGuardando!==null&&<div role="status" style={{fontSize:12,color:"var(--muted)",marginBottom:8}}>Guardando disponibilidad de la cláusula…</div>}
        {estadoClausulaError&&<div role="alert" style={{fontSize:12,color:"var(--red)",marginBottom:10}}>{estadoClausulaError}</div>}
        {clausulasLoading&&<div role="status" style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>Cargando biblioteca…</div>}
        {clausulasError&&<div role="alert" style={{fontSize:12,color:"var(--red)",marginBottom:10}}>{clausulasError} <button type="button" className="btn btn-secondary btn-sm" onClick={onRetryClausulas}>Reintentar</button></div>}
        {!clausulasLoading&&!clausulasError&&opcionalesDocumento.length===0&&<div style={{fontSize:13,color:"var(--muted)",padding:"12px 0"}}>Todavía no hay cláusulas adicionales para este tipo de documento. Podés crearlas desde Biblioteca de cláusulas.</div>}
        {opcionalesDocumento.map(function(c){var cfg=configAdicionalesDocumento;var elegida=(cfg.clausulas_ids||[]).indexOf(c.id)!==-1;var obligatoriaModelo=c.obligatoria===true||(cfg.obligatorias_ids||[]).indexOf(c.id)!==-1;var estado=obligatoriaModelo?"obligatoria":elegida?"asesor":"apagada";return <div key={c.id} data-clausula-id={c.id} style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",padding:"10px 0",borderBottom:"1px solid var(--border)",minWidth:0}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:13.5,fontWeight:650,color:"var(--text)",overflowWrap:"anywhere"}}>{c.titulo||"Cláusula sin título"}</div><div style={{fontSize:12.5,color:"var(--dim)",marginTop:4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{mostrarTokensDocWorks(c.contenido||"")}</div></div><select aria-label={"Estado de "+(c.titulo||"cláusula")} value={estado} disabled={!puedeEditar||c.obligatoria===true||estadoClausulaGuardando!==null} onChange={function(e){cambiarEstadoClausulaBiblioteca(c,e.target.value);}} style={{width:150,maxWidth:"44%",minWidth:0,fontSize:12.5,padding:"9px 6px",borderRadius:7,border:"1px solid var(--border2)",background:"var(--card)",color:"var(--text)"}}>{estado==="obligatoria"&&<option value="obligatoria" disabled>Siempre (modelo anterior)</option>}<option value="asesor">Disponible para agregar</option><option value="apagada">No disponible</option></select>{puedeEditar&&estado!=="obligatoria"&&<button type="button" className="btn btn-secondary btn-sm" disabled={opcionalGuardando} onClick={function(){abrirEdicionOpcional(c);}}>Editar</button>}
        {opcionalEditando===c.id&&opcionalBorrador&&<div style={{flex:"1 0 100%",minWidth:0,padding:12,border:"1px solid var(--border)",borderRadius:10,display:"flex",flexDirection:"column",gap:9}}>
          <div style={{fontSize:12,color:"var(--muted)"}}>Editás el texto compartido de la biblioteca. Si se utiliza en otros documentos, el cambio también puede afectarlos.</div>
          <label style={{fontSize:12}}>Título<input className="inp" style={{width:"100%",boxSizing:"border-box"}} value={opcionalBorrador.titulo} onChange={function(e){setOpcionalBorrador(Object.assign({},opcionalBorrador,{titulo:e.target.value}));}}/></label>
          <label style={{fontSize:12}}>Contenido<textarea className="inp" rows={6} style={{width:"100%",boxSizing:"border-box"}} value={opcionalBorrador.contenido} onChange={function(e){setOpcionalBorrador(Object.assign({},opcionalBorrador,{contenido:e.target.value}));}}/></label>
          {opcionalError&&<div role="alert" style={{color:"var(--red)",fontSize:12}}>{opcionalError}</div>}
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,flexWrap:"wrap"}}>
            <button type="button" className="btn btn-secondary btn-sm" disabled={opcionalGuardando} onClick={function(){setOpcionalEditando(null);setOpcionalBorrador(null);}}>Cancelar</button>
            <button type="button" className="btn btn-primary btn-sm" disabled={opcionalGuardando} onClick={function(){requestDwConfirm("¿Guardar los cambios de esta cláusula compartida?",guardarEdicionOpcional);}}>{opcionalGuardando?"Guardando…":"Guardar cláusula"}</button>
          </div>
        </div>}</div>;})}
        {!clausulasLoading&&!clausulasError&&opcionalesDocumento.length===0&&<div style={{fontSize:12,color:"var(--dim)",padding:"10px 0"}}>Todavía no hay textos de biblioteca para este documento. Podés crearlos en Biblioteca de cláusulas.</div>}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><button type="button" className="btn btn-secondary btn-sm" onClick={function(){setSeccion("adicionales");}}>Ir a Biblioteca de cláusulas</button></div>

      </details>}
      </EncabezadoFijadoPanel>
    </div>}
    {seccion==="modelos"&&!puedeEditar&&<div className="notice" style={{fontSize:12}}>Los modelos de los documentos están disponibles únicamente para Dueño y Administrador.</div>}
  </div>;
}
 return ClausulasWorkspace;
}
