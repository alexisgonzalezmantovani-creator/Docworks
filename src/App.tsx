// Tipos de extensiones de navegador utilizadas por DocWorks.
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    __dwLastNotify?: any;
    __dwScrollLocks?: number;
    Recharts?: any;
  }
  interface Navigator { standalone?: boolean; }
}
import { InicioInmobiliaria } from './PrimerosPasos';
import { crearClausulasView, crearClausulasWorkspace } from './Clausulas';
import { crearDocumentViewer, crearOperacionForm, crearPapeleraView, crearTareasPanel, crearNegociacionPanel, crearReservaDecisionPanel } from './Operaciones';
import { crearSuperAdminDashboard, crearConfiguracionView, crearDashboardView , crearEstadisticasView , crearCalendarioView } from './Operaciones';
import { GS, MOBILE_STABILITY_CSS } from './Operaciones';
import { normalizarTextoComparacion, normalizarModoComision, fechaPagoValida, fechaHoyISO, normalizarBusqueda } from './Operaciones';
import { normalizarNombreArchivoParte, numeroALetras, codigoMonedaLegal, prefijoMonedaLegal } from './Exportaciones';
import { hexToRgb01, rgbPdfStr, tintRgb, hexToDocx } from './Exportaciones';
import { dwNormTexto } from './Operaciones';
import { generarPDFModulo, generarDOCXModulo } from './Exportaciones';
import { EMPTY_OP, CAMPOS_CRITICOS_POR_TIPO } from './Operaciones';
import { CLAUSULAS_DEFAULT, DEFAULT_BLOQUES_RESERVA } from './Clausulas';
import { SUPABASE_URL, SUPABASE_ANON_KEY, dwHaySesionGuardada, dwCrearCliente, dwObtenerSesionRobusta, loadSupabaseJs } from './Servicios';
import { contactosDocumento, DOC_EXPORT_LAYOUT, docxTwipsFromPt, pdfStr } from './Exportaciones';
// DocWorks 5.37 — Descargas con liberación segura del estado y cola de exportación.
// Conserva los controles documentales y de interfaz de la versión anterior.
import { useState, useEffect, useCallback, useMemo, useRef, Component } from "react";
import { createPortal } from "react-dom";

// Iconos DocWorks (navegación y tipos de documento): trazo fino de una sola tinta.
// Usan currentColor: toman el color del tema (claro/oscuro) y del estado activo.
function FormalIcon({name,size=22,strokeWidth=1.75}){
  var paths={
    ops:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></>,
    stats:<><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></>,
    calendar:<><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></>,
    clauses:<><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></>,
    settings:<><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
    help:<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></>,
    moon:<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>,
    lock:<><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    key:<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>,
    home:<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></>,
    users:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    pen:<><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></>,
    plusCircle:<><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></>,
    undo:<><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></>
  };
  return <svg className="dw-ico" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]||paths.ops}</svg>;
}

function DWIcon({name,size=15,strokeWidth=1.8}){
  var paths={
    edit:<><path d="M12.9 2.7a1.8 1.8 0 0 1 2.5 2.5L6 14.6 2.8 15.2l.6-3.2L12.9 2.7Z"/><path d="m11.5 4.1 2.5 2.5"/></>,
    plus:<><path d="M8 3v10M3 8h10"/></>,
    sliders:<><path d="M2.5 5h6M11.5 5h2M2.5 11h2M7.5 11h6"/><circle cx="10" cy="5" r="1.5"/><circle cx="6" cy="11" r="1.5"/></>,
    trash:<><path d="M3.5 5.5h9M6 5.5V3.8h4v1.7M5 7v6.5h6V7"/><path d="M7 8.5v3M9 8.5v3"/></>,
    chevronUp:<path d="m4 10 4-4 4 4"/>,
    chevronDown:<path d="m4 6 4 4 4-4"/>,
    download:<><path d="M8 2.5v7.2"/><path d="m5 7.2 3 3 3-3"/><path d="M3 13.5h10"/></>,
    share:<><path d="M8 10.5V3.5"/><path d="m5.5 6 2.5-2.5L10.5 6"/><path d="M3.5 8.5v4A1.5 1.5 0 0 0 5 14h6a1.5 1.5 0 0 0 1.5-1.5v-4"/></>,
    file:<><path d="M4 2.5h5l3 3v8H4z"/><path d="M9 2.5v3h3"/><path d="M6 9h4M6 11h4"/></>,
    help:<><path d="M8 14.2a6.2 6.2 0 1 0 0-12.4 6.2 6.2 0 0 0 0 12.4Z"/><path d="M6.1 6.3a1.9 1.9 0 0 1 3.7.6c0 1.3-1.8 1.5-1.8 2.7"/><path d="M8 11.6v.05"/></>,
    close:<path d="M4 4l8 8M12 4l-8 8"/>,
    open:<><path d="M6.3 9.7 13 3"/><path d="M9 3h4v4"/><path d="M12 8.5V12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3.5"/></>,
    pin:<><path d="M8 14.3S12.8 9.9 12.8 6.4a4.8 4.8 0 1 0-9.6 0c0 3.5 4.8 7.9 4.8 7.9Z"/><circle cx="8" cy="6.3" r="1.7"/></>,
    link:<><path d="M6.3 9.7l3.4-3.4"/><path d="M5 6.2 3.6 7.6a2.3 2.3 0 0 0 3.3 3.3L8.3 9.5"/><path d="M11 9.8l1.4-1.4a2.3 2.3 0 0 0-3.3-3.3L7.7 6.5"/></>,
    duplicate:<><path d="M6 6h6.5v6.5H6z"/><path d="M3.5 3.5h6.5v2M3.5 3.5v6.5h2"/></>,
    check:<path d="M3.3 8.3l3 3 6.4-6.6"/>,
    ban:<><circle cx="8" cy="8" r="6"/><path d="M4.2 4.2l7.6 7.6"/></>,
    folder:<path d="M2 4.6a1 1 0 0 1 1-1h3.3l1.3 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>,
    users:<><circle cx="6" cy="6" r="2.2"/><path d="M2.5 13a3.5 3.5 0 0 1 7 0"/><path d="M10.2 4.2a2.1 2.1 0 0 1 0 3.7M11 9.4a3.2 3.2 0 0 1 2.5 3"/></>,
    chevronRight:<path d="m6 4 4 4-4 4"/>,
    search:<><circle cx="7" cy="7" r="4.2"/><path d="m10.2 10.2 3.3 3.3"/></>,
    clock:<><circle cx="8" cy="8" r="5.7"/><path d="M8 4.8v3.6l2.4 1.5"/></>,
    mic:<><rect x="5.5" y="2.4" width="5" height="7.3" rx="2.5"/><path d="M4 8.2a4 4 0 0 0 8 0M8 12.2v2M6 14.2h4"/></>,
    stop:<><rect x="4.2" y="4.2" width="7.6" height="7.6" rx="1.2"/></>,
    eye:<><path d="M1.2 8s2.6-4.4 6.8-4.4 6.8 4.4 6.8 4.4-2.6 4.4-6.8 4.4S1.2 8 1.2 8Z"/><circle cx="8" cy="8" r="2.1"/></>,
    "eye-off":<><path d="M2 2l12 12"/><path d="M6 3.8A7.9 7.9 0 0 1 8 3.6c4.2 0 6.8 4.4 6.8 4.4a9.5 9.5 0 0 1-2.2 2.5M10.1 12.1A7.8 7.8 0 0 1 8 12.4C3.8 12.4 1.2 8 1.2 8a9.7 9.7 0 0 1 2.2-2.6"/><path d="M6.6 6.6a2.1 2.1 0 0 0 2.8 2.8"/></>,
    moon:<><path d="M13.1 10.5A5.8 5.8 0 0 1 5.5 2.9 5.8 5.8 0 1 0 13.1 10.5Z"/></>,
    sun:<><circle cx="8" cy="8" r="2.7"/><path d="M8 1.6v1.2M8 13.2v1.2M1.6 8h1.2M13.2 8h1.2M3.5 3.5l.9.9M11.6 11.6l.9.9M12.5 3.5l-.9.9M4.4 11.6l-.9.9"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.edit}</svg>;
}

// Dictado por voz reutilizable para campos de IA y redacción libre.
// Usa Web Speech API cuando el navegador la expone.
function VozATextoButton({onText,disabled=false,title="Dictar por voz"}){
  const [escuchando,setEscuchando]=useState(false);
  const [error,setError]=useState("");
  const recRef=useRef(null);
  function iniciar(){
    if(escuchando){ try{if(recRef.current)recRef.current.stop();}catch(e){ console.debug("DocWorks: no se pudo detener el reconocimiento de voz.",e); } return; }
    setError("");
    var Ctor=(typeof window!=="undefined") ? (window.SpeechRecognition||window.webkitSpeechRecognition) : null;
    if(!Ctor){ setError("Tu navegador no admite dictado por voz."); return; }
    try{
      var rec=new Ctor();
      rec.lang="es-AR";
      rec.continuous=false;
      rec.interimResults=false;
      rec.onstart=function(){setEscuchando(true);};
      rec.onresult=function(e){
        var texto="";
        for(var i=e.resultIndex||0;i<e.results.length;i++){
          if(e.results[i]&&e.results[i].isFinal){ texto+=(e.results[i][0]&&e.results[i][0].transcript?e.results[i][0].transcript:" "); }
        }
        texto=String(texto||"").replace(/\s+/g," ").trim();
        if(texto&&onText)onText(texto);
      };
      rec.onerror=function(e){
        var code=String((e&&e.error)||"");
        if(code!=="aborted") setError(code==="not-allowed"?"El navegador no tiene permiso para usar el micrófono.":code==="no-speech"?"No se detectó ninguna voz. Probá nuevamente.":code==="audio-capture"?"No se encontró un micrófono disponible.":code==="service-not-allowed"?"El servicio de dictado no está disponible.":code==="network"?"No se pudo conectar con el servicio de dictado.":"No se pudo usar el dictado.");
        setEscuchando(false);
      };
      rec.onend=function(){setEscuchando(false);recRef.current=null;};
      recRef.current=rec;
      rec.start();
    }catch(e){ setEscuchando(false); setError("No se pudo iniciar el dictado por voz."); }
  }
  useEffect(function(){ return function(){ try{if(recRef.current)recRef.current.stop();}catch(e){ console.debug("DocWorks: no se pudo detener el reconocimiento de voz.",e); } }; },[]);
  return(
    <div style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
      <button type="button" onClick={iniciar} disabled={disabled} title={escuchando?"Detener dictado":title} aria-label={escuchando?"Detener dictado":"Dictar por voz"}
        className="icon-btn icon-btn-voice"
        style={{width:44,height:44,borderRadius:10,border:escuchando?"1px solid rgba(248,113,113,.5)":"1px solid var(--border2)",background:escuchando?"rgba(248,113,113,.10)":"var(--surface2)",color:escuchando?"var(--red)":"var(--muted)",cursor:disabled?"default":"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
        <DWIcon name={escuchando?"stop":"mic"} size={15} strokeWidth={2}/>
      </button>
      {error&&<span className="inline-error-popover" style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:80,whiteSpace:"nowrap",padding:"6px 9px",borderRadius:8,background:"var(--card)",border:"1px solid var(--border2)",boxShadow:"0 8px 20px rgba(0,0,0,.12)",color:"var(--red)",fontSize:12}}>{error}</span>}
    </div>
  );
}

// DocWorks 4.11 PRO — Super Admin SaaS: membresías, pagos, usuarios, métricas, anuncios y auditoría avanzada.
// DocWorks 4.11 PRO — Look clásico 3.67 completo (visor de documentos y paneles como hoja inferior en iPhone, igual que la 3.67) con las mejoras de la serie 3.8x, pasos con nombre en móvil y correcciones de borradores, doble guardado y exportación. IA asistida con dictado por voz, revisión inteligente, búsqueda ampliada, cláusulas obligatorias y experiencia 100% en español.


// ── SUPABASE (Fase 1 SaaS) ────────────────────────────────────────────────────
// Se carga por CDN, igual que Recharts más abajo, porque este archivo se
// compila solo con esbuild sin node_modules (no hay "npm install" en el
// pipeline). El anon key es público por diseño: toda la seguridad real vive
// en las RLS policies y en las funciones SECURITY DEFINER del lado de la base.


// Notificación transversal: cualquier módulo/hook puede informar un fallo real
// sin depender de props ni de un estado React local. La UI de App escucha este
// evento y lo muestra como aviso visible. Se deduplican mensajes idénticos para
// no inundar la pantalla cuando hay varios reintentos automáticos.
function dwNotify(kind,message){
  try{
    if(!message) return;
    var key=String(kind||"error")+"|"+String(message);
    var now=Date.now();
    var last=window.__dwLastNotify;
    if(last&&last.key===key&&now-last.ts<2500) return;
    window.__dwLastNotify={key:key,ts:now};
    window.dispatchEvent(new CustomEvent("dw:notify",{detail:{kind:kind||"error",message:String(message)}}));
  }catch(ex){
    console.warn("DocWorks: no se pudo mostrar la notificación",ex);
  }
}
async function docworksMercadoPago(action, payload) {
  var sb = await loadSupabaseJs();
  if (!sb) throw new Error("No se pudo cargar Supabase.");
  var res = await sb.functions.invoke("mp-subscriptions", { body: Object.assign({action: action}, payload || {}) });
  if (res.error) throw new Error(traducirError(res.error.message || "No se pudo conectar con Mercado Pago."));
  if (res.data && res.data.error) throw new Error(res.data.error);
  return res.data || {};
}

var rechartsCarga: Promise<void>|null=null;
function loadRecharts(): Promise<void> {
  if(window.Recharts)return Promise.resolve();
  if(!rechartsCarga){
    rechartsCarga=import("recharts").then(function(modulo){window.Recharts=modulo;}).catch(function(error){rechartsCarga=null;throw error;});
  }
  return rechartsCarga;
}

// ── PDF NATIVO — sin dependencias externas ───────────────────────────────────
// Genera PDF 1.4 real desde cero usando solo JS nativo.
// Compatible con todos los visores (Adobe, Chrome, iOS, etc.)



function latin1Safe(s){
  // El PDF usa la fuente base-14 con /Encoding /WinAnsiEncoding, que coincide
  // con Latin-1/CP1252 para las letras acentuadas del español (á,é,í,ó,ú,ñ,ü,
  // signos ¿ ¡, etc), así que esos caracteres pasan tal cual. Pero hay signos
  // de puntuación tipográfica (guion largo/corto, comillas curvas, puntos
  // suspensivos) cuyo código Unicode (p.ej. U+2014 para "—") es distinto de
  // su byte en WinAnsiEncoding (0x97) — sin este mapeo, esos signos se
  // pierden y se ven como "?" en el PDF aunque la fuente sí los soporte.
  if(!s) return "";
  var WINANSI_MAP = {
    "\u2018":"\x91","\u2019":"\x92","\u201A":"\x82","\u201C":"\x93","\u201D":"\x94","\u201E":"\x84",
    "\u2013":"\x96","\u2014":"\x97","\u2026":"\x85","\u2022":"\x95","\u20AC":"\x80",
    "\u2039":"\x8B","\u203A":"\x9B","\u02C6":"\x88","\u2030":"\x89",
  };
  var mapped = String(s).replace(/[\u2018\u2019\u201A\u201C\u201D\u201E\u2013\u2014\u2026\u2022\u20AC\u2039\u203A\u02C6\u2030]/g, function(ch){ return WINANSI_MAP[ch]; });
  return mapped.replace(/[^\x00-\xFF]/g, function(ch){ var n=ch.normalize("NFD").replace(/[\u0300-\u036f]/g,""); return n && /^[\x00-\xFF]+$/.test(n) ? n : " "; });
}

// Anchos de caracteres Helvetica / Helvetica-Bold (unidades por 1000, AFM estándar).
// Permite medir texto con precisión real en vez de cortar por cantidad de caracteres.
var HELV_W = {" ":278,"!":278,"\"":355,"#":556,"$":556,"%":889,"&":667,"'":191,"(":333,")":333,"*":389,"+":584,",":278,"-":333,".":278,"/":278,"0":556,"1":556,"2":556,"3":556,"4":556,"5":556,"6":556,"7":556,"8":556,"9":556,":":278,";":278,"<":584,"=":584,">":584,"?":556,"@":1015,"A":667,"B":667,"C":722,"D":722,"E":667,"F":611,"G":778,"H":722,"I":278,"J":500,"K":667,"L":556,"M":833,"N":722,"O":778,"P":667,"Q":778,"R":722,"S":667,"T":611,"U":722,"V":667,"W":944,"X":667,"Y":667,"Z":611,"[":278,"\\":278,"]":278,"^":469,"_":556,"`":333,"a":556,"b":556,"c":500,"d":556,"e":556,"f":278,"g":556,"h":556,"i":222,"j":222,"k":500,"l":222,"m":833,"n":556,"o":556,"p":556,"q":556,"r":333,"s":500,"t":278,"u":556,"v":500,"w":722,"x":500,"y":500,"z":500,"{":334,"|":260,"}":334,"~":584,"°":400,
  "á":556,"é":556,"í":222,"ó":556,"ú":556,"Á":667,"É":667,"Í":278,"Ó":778,"Ú":722,"ñ":556,"Ñ":722,"ü":556,"Ü":722,"¿":556,"¡":278,"ª":370,"º":365,
  "\x96":556,"\x97":1000,"\x91":222,"\x92":222,"\x93":333,"\x94":333,"\x85":1000,"\x95":350};
var HELV_B_W = {" ":278,"!":333,"\"":474,"#":556,"$":556,"%":889,"&":722,"'":238,"(":333,")":333,"*":389,"+":584,",":278,"-":333,".":278,"/":278,"0":556,"1":556,"2":556,"3":556,"4":556,"5":556,"6":556,"7":556,"8":556,"9":556,":":333,";":333,"<":584,"=":584,">":584,"?":611,"@":975,"A":722,"B":722,"C":722,"D":722,"E":667,"F":611,"G":778,"H":722,"I":278,"J":556,"K":722,"L":611,"M":833,"N":722,"O":778,"P":667,"Q":778,"R":722,"S":667,"T":611,"U":722,"V":667,"W":944,"X":667,"Y":667,"Z":611,"[":333,"\\":278,"]":333,"^":584,"_":556,"`":333,"a":556,"b":611,"c":556,"d":611,"e":556,"f":333,"g":611,"h":611,"i":278,"j":278,"k":556,"l":278,"m":889,"n":611,"o":611,"p":611,"q":611,"r":389,"s":556,"t":333,"u":611,"v":556,"w":778,"x":556,"y":556,"z":500,"{":389,"|":280,"}":389,"~":584,"°":400,
  "á":556,"é":556,"í":278,"ó":611,"ú":611,"Á":722,"É":667,"Í":278,"Ó":778,"Ú":722,"ñ":611,"Ñ":722,"ü":611,"Ü":722,"¿":611,"¡":333,"ª":370,"º":365,
  "\x96":611,"\x97":1000,"\x91":278,"\x92":278,"\x93":389,"\x94":389,"\x85":1000,"\x95":350};
function textWidthPt(str,size,bold){
  // Medir exactamente lo que se dibuja: latin1Safe mapea "—"→\x97, comillas
  // curvas, etc. Sin esto el ancho del rótulo se subestima ~3–4pt y el cuerpo
  // arranca encima del ":" (se ve "PRECIO:El" aunque haya un espacio en el PDF).
  str = latin1Safe(String(str||""));
  var table = bold?HELV_B_W:HELV_W, w=0;
  for(var i=0;i<str.length;i++){ w += (table[str[i]]!==undefined?table[str[i]]:(bold?611:556)); }
  return w*size/1000;
}

// ── NUMERACIÓN FORMAL DE CLÁUSULAS ────────────────────────────────────────────
// Convierte "1", "2", "3"... en el ordinal femenino que corresponde a la
// palabra "CLÁUSULA" (PRIMERA, SEGUNDA...), como en los contratos profesionales
// de estudios jurídicos/escribanías, en vez del frío "1." "2." "3.".
var ORDINALES_FEM = ["PRIMERA","SEGUNDA","TERCERA","CUARTA","QUINTA","SEXTA","SÉPTIMA","OCTAVA","NOVENA","DÉCIMA",
  "DECIMOPRIMERA","DECIMOSEGUNDA","DECIMOTERCERA","DECIMOCUARTA","DECIMOQUINTA","DECIMOSEXTA","DECIMOSÉPTIMA","DECIMOCTAVA","DECIMONOVENA","VIGÉSIMA"];
var ORDINALES_DECENAS_FEM = {20:"VIGÉSIMA",30:"TRIGÉSIMA",40:"CUADRAGÉSIMA",50:"QUINCUAGÉSIMA",60:"SEXAGÉSIMA",70:"SEPTUAGÉSIMA",80:"OCTOGÉSIMA",90:"NONAGÉSIMA"};
function ordinalFem(n){
  n=parseInt(n,10);
  if(!n||n<1||n>99) return "";
  if(n<=20) return ORDINALES_FEM[n-1];
  var decena=Math.floor(n/10)*10;
  var unidad=n%10;
  if(unidad===0) return ORDINALES_DECENAS_FEM[decena];
  var base=ORDINALES_DECENAS_FEM[decena];
  var unidadOrdinal=ORDINALES_FEM[unidad-1];
  return (base + " " + unidadOrdinal).toUpperCase();
}

// ── LOGO: normalización a JPEG con dimensiones reales ────────────────────────
// Acepta cualquier formato de imagen (PNG, JPG, WEBP, etc.), la dibuja sobre
// un canvas con fondo blanco (el JPEG no soporta transparencia) y devuelve
// un data URL JPEG junto con el ancho/alto reales en píxeles. Esto evita el
// bug de dimensiones hardcodeadas y permite soportar PNG en el PDF nativo.
function loadImageEl(dataUrl): Promise<HTMLImageElement> {
  return new Promise(function(resolve, reject) {
    var img = new Image();
    img.onload = function() { resolve(img); };
    img.onerror = function() { reject(new Error("No se pudo cargar el logo")); };
    img.src = dataUrl;
  });
}
async function normalizeLogoImage(dataUrl, maxDim) {
  maxDim = maxDim || 500;
  var img = await loadImageEl(dataUrl);
  var w = img.naturalWidth || img.width || 1;
  var h = img.naturalHeight || img.height || 1;
  var scale = Math.min(1, maxDim / Math.max(w, h));
  var outW = Math.max(1, Math.round(w * scale));
  var outH = Math.max(1, Math.round(h * scale));
  var canvas = document.createElement("canvas");
  canvas.width = outW; canvas.height = outH;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(img, 0, 0, outW, outH);
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.92), width: outW, height: outH };
}
// Convierte un string binario (p.ej. salida de atob) a bytes reales 1:1,
// evitando que el constructor de Blob lo re-codifique como UTF-8 y corrompa
// los bytes >=128 (esto corrompía cualquier imagen JPEG embebida).
function strToLatin1Bytes(str) {
  var out = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xFF;
  return out;
}

// Entrega un archivo (PDF/DOCX) al usuario. En celular, el <a download> con
// blob URL suele fallar en silencio (no abre nada, no se ve ningún error):
// por eso se prioriza el panel nativo "compartir" del sistema, que sí
// funciona de forma confiable y además permite "Guardar en Archivos" /
// abrir directo en un lector de PDF. En desktop, o si el share no está
// disponible, abre WhatsApp Web como alternativa y descarga el archivo para adjuntarlo.
async function entregarArchivo(blob, filename, mime, shareOpts) {
  var opts=shareOpts||{};
  // Abrimos el popup de fallback antes de cualquier await para que Safari no lo bloquee.
  var fallbackWindow=null;
  if(opts.fallbackWhatsApp!==false){ try { fallbackWindow=window.open("about:blank","_blank"); } catch(e0) { fallbackWindow=null; } }
  try {
    var file = new File([blob], filename, { type: mime });
    if (navigator.canShare && navigator.canShare({ files:[file] }) && navigator.share) {
      await navigator.share(Object.assign({files:[file]},opts));
      if(fallbackWindow&&!fallbackWindow.closed) fallbackWindow.close();
      return "shared";
    }
  } catch(e) {
    if(e&&e.name==="AbortError"){if(fallbackWindow&&!fallbackWindow.closed)fallbackWindow.close();return "cancelled";}
  }
  var text=String(opts.text||filename);
  try {
    if(fallbackWindow&&!fallbackWindow.closed){ fallbackWindow.location.href="https://web.whatsapp.com/send?text="+encodeURIComponent(text); }
  } catch(e2) {}
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click();
  setTimeout(function(){try{document.body.removeChild(a);}catch(e){} URL.revokeObjectURL(url);},45000);
  return "downloaded-whatsapp";
}
function esPWAInstalada(){
  return !!(typeof window!=="undefined" && ((window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone===true));
}
function descargarArchivo(blob,filename,mime="application/octet-stream",shareOpts={}){
  if(esDispositivoIOS()||esPWAInstalada()) return entregarArchivo(blob,filename,mime,Object.assign({},shareOpts||{},{fallbackWhatsApp:false}));
  var url=URL.createObjectURL(blob); var a=document.createElement("a"); a.href=url; a.download=filename;
  document.body.appendChild(a); a.click();
  setTimeout(function(){try{document.body.removeChild(a);}catch(e){} URL.revokeObjectURL(url);},45000);
  return Promise.resolve("downloaded");
}

function escaparCSV(valor){
  var x=valor===null||valor===undefined?"":String(valor);
  return /[";,\n\r]/.test(x)?"\""+x.replace(/"/g,'\"\"')+"\"":x;
}
function descargarCSV(filas,filename){
  if(!filas||!filas.length){dwNotify("info","No hay datos para exportar.");return false;}
  var ks=Object.keys(filas[0]),lines=[ks.map(escaparCSV).join(";")];
  filas.forEach(function(f){lines.push(ks.map(function(k){return escaparCSV(f[k]);}).join(";"));});
  descargarArchivo(new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8;"}),filename);
  return true;
}

function normalizarTextoDocumento(text) {
  var out = String(text || "");
  var urls = [];
  var times = [];
  out = out.replace(/https?:\/\/[^\s]+/gi, function(m){
    var token = "__DW_URL_" + urls.length + "__";
    urls.push(m);
    return token;
  });
  out = out.replace(/\b\d{1,2}:\d{2}\b/g, function(m){
    var token = "__DW_TIME_" + times.length + "__";
    times.push(m);
    return token;
  });
  // Regla GLOBAL de documentos (todos los tipos): después de cada ":" debe
  // haber exactamente un espacio cuando sigue contenido. Cubre "PRECIO:El",
  // "OBJETO:El", "DNI:123", etc. No modifica horas ni URLs.
  out = out.replace(/:\s*(?=\S)/g, ": ");
  // Evita "DÓLARES… BILLETE DÓLARES… BILLETE" cuando el bloque tiene
  // {{moneda_txt}} + {{precio_letras}} (y precio_letras ya incluye la moneda).
  out = out.replace(/(D[ÓO]LARES ESTADOUNIDENSES BILLETE\s*){2,}/gi, "DÓLARES ESTADOUNIDENSES BILLETE ");
  out = out.replace(/(PESOS ARGENTINOS\s*){2,}/gi, "PESOS ARGENTINOS ");
  // Identificación: si el número tiene 7/8 dígitos es DNI; si tiene 11,
  // es CUIT. Así los documentos descargados no muestran "DNI/CUIT" cuando
  // el dato cargado permite identificar el tipo con certeza.
  out = out.replace(/\bDNI\s*\/\s*CUIT\s*:?\s*([0-9][0-9.\-\s]{5,18}[0-9])\b/gi, function(_,raw){
    var digs=String(raw||"").replace(/\D/g,"");
    if(digs.length===7||digs.length===8) return "DNI: "+raw;
    if(digs.length===11) return "CUIT: "+raw;
    return "DNI/CUIT: "+raw;
  });
  // Limpia guiones bajos sobrantes al final de frase (artefacto de plantilla).
  out = out.replace(/\.{1}\s*_{2,}\s*$/g, ".");
  out = out.replace(/__DW_TIME_(\d+)__/g, function(_,i){ return times[Number(i)]; });
  out = out.replace(/__DW_URL_(\d+)__/g, function(_,i){ return urls[Number(i)]; });
  return out;
}

// Rótulos formales unificados (PDF + DOCX + preview). Garantizan
// "CLÁUSULA PRIMERA — TÍTULO: " con espacio final tras los dos puntos.
function parseTituloClausula(titulo){
  var m=/^(\d+)\.\s*(.*)$/.exec(String(titulo||""));
  if(!m) return {num:0,ord:String(titulo||"").trim(),label:""};
  var n=parseInt(m[1],10);
  var label=String(m[2]||"").replace(/\s+/g," ").trim();
  return {num:n,ord:"CLÁUSULA "+(ordinalFem(n)||m[1]),label:label};
}
function prefijoClausulaFormal(titulo){
  var pc=parseTituloClausula(titulo);
  var base = pc.label ? (pc.ord+" — "+pc.label.toUpperCase()) : pc.ord;
  base = String(base||"").replace(/\s*:\s*$/,"");
  return normalizarTextoDocumento(base+": ");
}
function prefijoClausulaDesdeNumTitulo(num, titulo){
  var ord="CLÁUSULA "+(ordinalFem(num)||("N° "+num));
  var lab=String(titulo||"").replace(/\s+/g," ").trim();
  var base = lab ? (ord+" — "+lab.toUpperCase()) : ord;
  base = String(base||"").replace(/\s*:\s*$/,"");
  return normalizarTextoDocumento(base+": ");
}
function cuerpoTrasRotulo(texto){
  return String(texto||"").replace(/^\s+/, "").replace(/^:\s*/, "");
}


function nombreArchivoExportacion(doc,ext){
  var tipo=normalizarNombreArchivoParte(TIPOS[doc.tipoDocumento]||doc.tipoDocumento||doc.titulo||"DOCUMENTO").toUpperCase();
  var p1=normalizarNombreArchivoParte(doc.partes&&doc.partes[0]&&doc.partes[0].nombre)||"Parte1";
  var p2=normalizarNombreArchivoParte(doc.partes&&doc.partes[1]&&doc.partes[1].nombre)||"Parte2";
  var rawDate=String(doc.fechaArchivo||doc.fecha||"").match(/\d{4}[-/]\d{2}[-/]\d{2}/);
  var fecha=rawDate?rawDate[0].replace(/\//g,"-"):new Date().toISOString().slice(0,10);
  return tipo+"_"+p1+"-"+p2+"_"+fecha+"."+ext;
}

async function generarPDF(doc, logoDataUrl, perfil) {
  return generarPDFModulo(doc, logoDataUrl, perfil, { cuerpoTrasRotulo, hexToRgb01, latin1Safe, nombreArchivoExportacion, normalizarTextoDocumento, normalizeLogoImage, prefijoClausulaDesdeNumTitulo, prefijoClausulaFormal, rgbPdfStr, strToLatin1Bytes, textWidthPt, tintRgb, tipoIdentificacion });
}

function esDispositivoIOS(){
  var ua=(typeof navigator!=="undefined"&&navigator.userAgent)||"";
  return /iPhone|iPad|iPod/i.test(ua) || (typeof navigator!=="undefined" && navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
}
function esDispositivoMovilOTablet(){
  var ua=(typeof navigator!=="undefined"&&navigator.userAgent)||"";
  var touch=typeof navigator!=="undefined" && navigator.maxTouchPoints>0;
  return /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua) || (touch && Math.min(window.innerWidth,window.innerHeight)>=600 && Math.min(window.innerWidth,window.innerHeight)<=1200);
}
function injectFonts() {
  // Viewport meta — crítico para que los breakpoints mobile funcionen
  var vm = document.querySelector<HTMLMetaElement>("meta[name=viewport]");
  if (!vm) {
    vm = document.createElement("meta");
    vm.name = "viewport";
    document.head.insertBefore(vm, document.head.firstChild);
  }
  // En PWA iOS, viewport-fit=cover permite usar el área disponible respetando safe areas.
  vm.content = "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content";
  if (document.getElementById("docinmob-fonts")) return;
  var l = document.createElement("link");
  l.id = "docinmob-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap";
  document.head.appendChild(l);
}

// ── PWA / OFFLINE-FIRST ───────────────────────────────────────────────────────
// Todo el estado de la app ya vive en localStorage (ver useAutosave), por lo
// que una vez cargada, la app puede seguir funcionando sin conexión: al
// corredor no le hace falta internet para redactar un contrato durante una
// visita a la propiedad. Lo que falta para que sea instalable/offline-first
// de verdad es (a) un manifest.json y (b) un Service Worker que cachee el
// "app shell" (HTML/JS/CSS) para que la página abra sin red.
//
// Este archivo es un único .tsx sin backend ni servidor propio, así que el
// manifest se inyecta dinámicamente (funciona igual). El Service Worker, en
// cambio, DEBE servirse como archivo estático en la raíz del sitio (por
// requisito del navegador, su "scope" depende de dónde vive el archivo) —
// no se puede registrar un SW embebido en el bundle. Para completar el PWA
// en el deploy real hay que agregar estos dos archivos en /public:
//
//   /public/manifest.webmanifest  (mismo contenido que PWA_MANIFEST más abajo)
//   /public/sw.js           (cachea el shell con estrategia cache-first)
//   /public/icon-192.png y /public/icon-512.png (iconos PWA requeridos)
//
// y enlazar el manifest en index.html con:
//   <link rel="manifest" href="/manifest.webmanifest">
//   <meta name="theme-color" content="#0b1730">
// Si esos archivos no existen todavía, initPWA() no rompe nada: el registro
// del Service Worker falla en silencio y la app sigue funcionando online.
const DOCWORKS_HEADER_LOGO = "/docworks-header-logo.png";
var DOCWORKS_VERSION = "6.12";
// 5.05 PRO — elimina IDs duplicados del formulario Inmueble; registra fallos de auditoría de exportación.
// PDF WinAnsi: latin1Safe ya convierte signos tipográficos compatibles; validar caracteres no representables por separado.
// DocWorks 4.69PRO — Alquiler: Estado del inmueble, Prohibición de subalquilar y Obras y mejoras pasan al texto base (ya no son opcionales); se retira "Servicios a cargo del locatario" por repetir Gastos y mantenimiento.
// DocWorks 4.62 PRO — sin duplicados entre texto base y opcionales: multa, jurisdicción, expensas, libre de ocupantes y honorarios/comisión ya viven en el texto base; el documento final no repite cláusulas de la biblioteca que el texto base ya cubre; honorarios forzados solo en documentos con intermediación.
// DocWorks 4.61 PRO — armado de plantilla inicial más claro: guía en 3 pasos simples, "Texto base" y "Cláusulas obligatorias" con nombres directos, sin "Paso X de N".
// DocWorks 4.40 PRO — inicio con logo visible, correcciones de viewport/modal iPhone y flujo simplificado de modelos y cláusulas.
// DocWorks 4.49 PRO — modelos en 4 pasos (Documento, Modelo, Introducción, Cláusulas) y tarjetas de cláusulas corregidas para iPhone.
// DocWorks 4.38 PRO — se restaura el acceso a Aspecto del documento sin volver a exponer la pestaña general de Plantillas.
// DocWorks 4.29 PRO — comodato con calendario, faltantes que llevan al campo (en rojo), cuerpo estándar con bloques opcionales y restauración por bloque, sin video de inicio, sesión robusta al refrescar, interruptores dorados, visor a pantalla completa en iPhone, panel/campos proporcionados en tablet.
// DocWorks 4.28 PRO — correo y teléfono de cada co-titular con su propio interruptor «Mostrar en el documento».
// DocWorks 4.27 PRO — sesión estable (no vuelve a pedir login por lentitud), arranque más rápido, video de inicio sin botón Play en iPhone, operación por encima de la barra superior, casillas estilo iPhone, e-mail en co-titulares y panel centrado en tablet.
// 4.26 PRO — restaura el logo original del login y refuerza autoplay silenciado del video de inicio.
// 4.15 PRO — bloquea exportaciones con datos críticos faltantes y conserva el cierre idempotente de devoluciones.
// 3.13: estabilización — errores de auth, cleanup de suscripción, rollback de operaciones y estados de devolución.

// Logo público usado por la app y por el favicon.
const LOGO_B64 = "/docworks-startup-logo.png";

// Título visible de la web: siempre refleja la versión del documento.
if (typeof document !== "undefined") document.title = "DocWorks v" + DOCWORKS_VERSION;
function dwIrPasoModelo(setPaso,n){setPaso(n);}
if(typeof document!=="undefined"){var dwThemeMeta=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');if(!dwThemeMeta){dwThemeMeta=document.createElement("meta");dwThemeMeta.name="theme-color";document.head.appendChild(dwThemeMeta);}dwThemeMeta.content="#102653";}
  // Favicon de DocWorks: se muestra en la pestaña del navegador.
  try {
    var fav = document.querySelector<HTMLLinkElement>("#docworks-favicon");
    if (!fav) {
      fav = document.createElement("link");
      fav.id = "docworks-favicon";
      fav.rel = "icon";
      fav.type = "image/png";
      document.head.appendChild(fav);
    }
    // El logo existe en /public/logo.png. Lo apuntamos directamente como favicon
    // y agregamos la versión para evitar que Chrome reutilice un icono cacheado.
    fav.href = LOGO_B64 + "?v=" + DOCWORKS_VERSION;
  } catch(e) { console.warn("DocWorks: no se pudo actualizar el favicon",e); }

var PWA_MANIFEST = {
  name: "DocWorks — Gestión inmobiliaria",
  short_name: "DocWorks",
  description: "Generación de documentos legales para inmobiliarias argentinas",
  version: DOCWORKS_VERSION,
  id: "/?v=" + encodeURIComponent(DOCWORKS_VERSION),
  start_url: "/?v=" + encodeURIComponent(DOCWORKS_VERSION),
  scope: "/",
  display: "standalone",
  background_color: "#0b1730",
  theme_color: "#0b1730",
  orientation: "any",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
};
function initPWA() {
  try {
    // Manifest estático: los instaladores de iOS/Android lo detectan mejor que un Blob URL.
    var manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement("link");
      manifestLink.id = "docworks-manifest";
      manifestLink.rel = "manifest";
      manifestLink.href = "/manifest.webmanifest";
      document.head.appendChild(manifestLink);
    } else if (!manifestLink.getAttribute("href") || manifestLink.getAttribute("href").indexOf("manifest.webmanifest") === -1) {
      manifestLink.setAttribute("href", "/manifest.webmanifest");
    }
    var existingThemeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (existingThemeMeta) existingThemeMeta.setAttribute("content", PWA_MANIFEST.theme_color);
    if (!existingThemeMeta) {
      var meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = PWA_MANIFEST.theme_color;
      document.head.appendChild(meta);
    }
    // 4.08 — Modo app: barra de estado azul integrada (iPhone) y rotación libre de pantalla.
    [["apple-mobile-web-app-capable","yes"],["mobile-web-app-capable","yes"],["apple-mobile-web-app-status-bar-style","black-translucent"],["apple-mobile-web-app-title","DocWorks"]].forEach(function(par){
      var mm=document.querySelector('meta[name="'+par[0]+'"]');
      if(!mm){ mm=document.createElement("meta"); mm.setAttribute("name",par[0]); document.head.appendChild(mm); }
      mm.setAttribute("content",par[1]);
    });
    try{ if(typeof screen!=="undefined"&&screen.orientation&&typeof screen.orientation.unlock==="function") screen.orientation.unlock(); }catch(_o){ console.debug("DocWorks: no se pudo liberar la orientación",_o); }
    // Service Worker: requiere HTTPS (o localhost) y el archivo /sw.js servido
    // por el propio dominio. Si no existe todavía (por ejemplo en este entorno
    // de desarrollo/preview), el .catch() evita que rompa la carga de la app.
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator &&
        typeof location !== "undefined" && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register("/sw.js").catch(function(err){
        // El service worker es opcional: su ausencia no debe impedir usar DocWorks.
        console.info("DocWorks: modo sin conexión ampliado no disponible; la app sigue funcionando.", err);
      });
    }
  } catch (e) { console.warn("DocWorks: no se pudo inicializar el PWA.",e); }
}

const ESTADOS = { borrador:"Borrador", activo:"Activo", cerrado:"Cerrado" };
const ROLES_POR_TIPO = {
  comodato:["COMODANTE","COMODATARIO"],
  alquiler:["LOCADOR","LOCATARIO"],
  reserva_alquiler:["LOCADOR","LOCATARIO"],
  reserva:["VENDEDOR","COMPRADOR"],
  boleto:["VENDEDOR","COMPRADOR"],
  refuerzo_reserva:["VENDEDOR","COMPRADOR"],
  devolucion_reserva:["VENDEDOR","COMPRADOR"],
  exclusividad:["AUTORIZANTE","INMOBILIARIA"]
};
function rolesPorTipo(tipo){ return ROLES_POR_TIPO[tipo] || ["VENDEDOR","COMPRADOR"]; }
function rolParte(tipo,indice){ var r=rolesPorTipo(tipo); return r[indice] || r[0]; }
// 4.30: ROLES_POR_TIPO es la única fuente de los rótulos jurídicos de las partes. [0] = parte que transmite/cede/autoriza
// (prefijos vendedor_* o locador_*), [1] = parte que recibe/compra/alquila (prefijos comprador_* o locatario_*).
// En la Reserva de Compra, el COMPRADOR se identifica también como OFERENTE.
function capRol(r){ r=String(r||""); return r.charAt(0)+r.slice(1).toLowerCase(); }
// Ayudas SOLO para formularios de carga. Nunca se imprimen en PDF, Word, TXT ni vistas de impresión.
var ROL_AYUDA={
  COMODANTE:"Comodante: quien entrega el inmueble en préstamo gratuito.",
  COMODATARIO:"Comodatario: quien recibe el inmueble en préstamo gratuito, sin pagar alquiler.",
  LOCADOR:"Locador: quien da el inmueble en alquiler (el dueño o titular).",
  LOCATARIO:"Locatario: quien alquila el inmueble (el inquilino).",
  VENDEDOR:"Vendedor: quien vende el inmueble (el titular).",
  COMPRADOR:"Comprador: quien compra el inmueble.",
  OFERENTE:"Comprador / Oferente: quien hace la oferta de compra y entrega la reserva.",
  AUTORIZANTE:"Autorizante: quien autoriza a la inmobiliaria a comercializar su inmueble.",
  INMOBILIARIA:"Inmobiliaria: queda autorizada a comercializar el inmueble; sus datos salen de tu perfil."
};
function rolDePrefix(tipo,prefix){ var r=rolesPorTipo(tipo); return (prefix==="locador"||prefix==="vendedor") ? r[0] : (r[1]||r[0]); }
function tituloRolForm(tipo,prefix){ if(tipo==="reserva"&&prefix==="comprador") return "Comprador / Oferente"; return capRol(rolDePrefix(tipo,prefix)); }
function ayudaRolForm(tipo,prefix){ if(tipo==="reserva"&&prefix==="comprador") return ROL_AYUDA.OFERENTE; return ROL_AYUDA[rolDePrefix(tipo,prefix)]||""; }
function reemplazarRolesDocumento(texto,tipo){
  if(!texto) return texto;
  var r=rolesPorTipo(tipo), out=String(texto);
  // Solo reemplazar rótulos jurídicos explícitos en mayúscula; nunca texto corrido
  // ni palabras como COPROPIETARIO. Se contemplan singular y plural.
  out=out.replace(/\bPROPIETARIO(?:S)?\b/g,r[0]);
  // 4.30: "Propietario" ya no se usa como rótulo de parte (tampoco en bloques guardados con el texto anterior).
  out=out.replace(/\bPropietario(?:s)?\b/g,capRol(r[0]));
  out=out.replace(/\bLOCADOR\s*\(PROPIETARIO(?:S)?\)/g,r[0]);
  out=out.replace(/\bCOMODANTE\s*\(PROPIETARIO(?:S)?\)/g,r[0]);
  out=out.replace(/\bLOCADOR\s*\/\s*PROPIETARIO(?:S)?\b/g,r[0]);
  out=out.replace(/\bCOMODANTE\s*\/\s*PROPIETARIO(?:S)?\b/g,r[0]);
  return out;
}
const TIPOS = {
  reserva:"Reserva de Compra", boleto:"Boleto de Compraventa",
  reserva_alquiler:"Reserva de Alquiler", alquiler:"Contrato de Alquiler",
  comodato:"Comodato", exclusividad:"Autorización de Venta",
  refuerzo_reserva:"Refuerzo de Reserva", devolucion_reserva:"Devolución de Reserva",
};
const TIPO_ICON = {
  reserva:<FormalIcon name="lock" size={14} strokeWidth={2}/>,
  boleto:<FormalIcon name="ops" size={14} strokeWidth={2}/>,
  reserva_alquiler:<FormalIcon name="key" size={14} strokeWidth={2}/>,
  alquiler:<FormalIcon name="home" size={14} strokeWidth={2}/>,
  comodato:<FormalIcon name="users" size={14} strokeWidth={2}/>,
  exclusividad:<FormalIcon name="pen" size={14} strokeWidth={2}/>,
  refuerzo_reserva:<FormalIcon name="plusCircle" size={14} strokeWidth={2}/>,
  devolucion_reserva:<FormalIcon name="undo" size={14} strokeWidth={2}/>
};
const TIPO_ICON_DEFAULT = <FormalIcon name="ops" size={14} strokeWidth={2}/>;



// ── Cláusulas a medida: catálogo de variables insertables por menú desplegable ──
// Cada cláusula (predeterminada o creada por la inmobiliaria) puede llevar tokens
// {{campo}} en su texto, que se resuelven con los datos reales de cada operación
// al momento de generar el documento (ver resolveVars / finalizeDoc).
function tipoIdentificacion(valor,parte=null) {
  if(parte&&parte.dniLabel) return parte.dniLabel;
  var limpio = String(valor || "").replace(/\D/g, "");
  if (limpio.length === 7 || limpio.length === 8) return "DNI";
  if (limpio.length === 11) return "CUIT";
  return "DNI/CUIT";
}

function personaVars(prefix, label) {
  return [
    { key: prefix+"_nombre",    label: label+" — Nombre completo" },
    { key: prefix+"_dni",       label: label+" — DNI / CUIT" },
    { key: prefix+"_domicilio", label: label+" — Domicilio" },
    { key: prefix+"_email",     label: label+" — Correo electrónico" },
    { key: prefix+"_telefono",  label: label+" — Teléfono" },
  ];
}
const VAR_GROUPS = [
  { group:"Comprador / Oferente",     fields: personaVars("comprador","Comprador") },
  { group:"Vendedor / Titular",   fields: personaVars("vendedor","Vendedor/Titular") },
  { group:"Locador / Titular",    fields: personaVars("locador","Locador/Titular") },
  { group:"Locatario / Inquilino",    fields: personaVars("locatario","Locatario") },
  { group:"Inmueble", fields:[
    { key:"inmueble_direccion",      label:"Dirección" },
    { key:"inmueble_partido",        label:"Partido / Localidad" },
    { key:"inmueble_provincia",      label:"Provincia" },
    { key:"nomenclatura_catastral",  label:"Nomenclatura catastral" },
    { key:"descripcion_inmueble",    label:"Descripción" },
  ]},
  { group:"Económico — Compraventa", fields:[
    { key:"precio",              label:"Precio total" },
    { key:"anticipo",            label:"Seña / Anticipo" },
    { key:"saldo",                label:"Saldo" },
    { key:"comision_porcentaje", label:"Comisión (%) (compatibilidad)" },
    { key:"comision_reserva_texto", label:"Comisión reserva — texto completo" },
    { key:"comision_vendedor_texto", label:"Comisión vendedor — texto completo" },
    { key:"comision_comprador_texto", label:"Comisión comprador — texto completo" },
    { key:"escribania",          label:"Escribanía" },
    { key:"fecha_posesion",      label:"Fecha de posesión" },
  ]},
  { group:"Económico — Alquiler", fields:[
    { key:"alquiler_monto_inicial", label:"Canon mensual inicial" },
    { key:"alquiler_deposito",      label:"Depósito (meses)" },
    { key:"alquiler_comision",      label:"Comisión (%)" },
    { key:"alquiler_comision_locador_texto", label:"Comisión locador — texto completo" },
    { key:"alquiler_comision_locatario_texto", label:"Comisión locatario — texto completo" },
    { key:"alquiler_dia_pago",      label:"Día de pago" },
    { key:"alquiler_inicio",        label:"Inicio del contrato" },
    { key:"alquiler_fin",           label:"Vencimiento del contrato" },
  ]},
  { group:"Económico — Reserva de Alquiler", fields:[
    { key:"res_alq_monto_reserva",     label:"Monto de la reserva" },
    { key:"res_alq_monto_mensual",     label:"Valor del alquiler mensual" },
    { key:"res_alq_plazo_cantidad",    label:"Plazo estimado" },
    { key:"res_alq_inicio_estimado",   label:"Inicio estimado" },
    { key:"reserva_alquiler_comision_locador_texto", label:"Comisión locador — texto completo" },
    { key:"reserva_alquiler_comision_locatario_texto", label:"Comisión locatario — texto completo" },
  ]},
];
const VAR_MONEY_FIELDS = { precio:"moneda", anticipo:"moneda", saldo:"moneda", alquiler_monto_inicial:"alquiler_moneda", res_alq_monto_reserva:"res_alq_moneda", res_alq_monto_mensual:"res_alq_monto_mensual_moneda" };
const VAR_DATE_FIELDS = ["fecha_posesion","alquiler_inicio","alquiler_fin","res_alq_inicio_estimado"];
function fmtVarValue(key, op) {
  var v = op[key];
  if (v===undefined||v===null||String(v).trim()==="") return "___";
  if (VAR_MONEY_FIELDS[key]) return fmt$(v, op[VAR_MONEY_FIELDS[key]]);
  if (VAR_DATE_FIELDS.indexOf(key)!==-1) return fmtD(v);
  return String(v);
}
function derivedTokensGenerales(op) {
  op = op || {};
  var moneda = op.moneda || op.alquiler_moneda || op.res_alq_moneda || "ARS";
  var monedaTxt = moneda === "USD" ? "DÓLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS";
  var destino = op.alquiler_destino === "vivienda" ? "uso habitacional / vivienda familiar" : op.alquiler_destino === "comercial" ? "uso comercial" : "uso profesional";
  var amoblado = op.alquiler_amoblado ? ", el cual se entrega AMOBLADO conforme al inventario de bienes muebles que como Anexo I forma parte integrante del presente contrato" : "";
  var plazo = plazoAlquilerTexto(op.alquiler_plazo_meses || "24", op.alquiler_plazo_dias || "0");
  var fin = fmtD(finAlquilerISO(op));
  var indiceKey = op.alquiler_actualizacion || "ICL";
  var indiceEsFijo = indiceKey === "fijo";
  var indiceNombre = indiceKey === "otro" ? (op.alquiler_actualizacion_otro || "a definir") : indiceKey;
  var periodoKey = op.alquiler_periodo_actualizacion || "cuatrimestral";
  var periodoTxt = periodoKey === "otro" ? (op.alquiler_periodo_otro || "a definir") : periodoKey;
  var diaPagoTxt = op.alquiler_dia_pago === "otro" ? (op.alquiler_dia_pago_otro || "___") : (op.alquiler_dia_pago || "1");
  var canonClause = indiceEsFijo
    ? "El canon locativo mensual se pacta en "+fmt$L(op.alquiler_monto_inicial,op.alquiler_moneda)+", con carácter FIJO, sin actualización durante toda la vigencia del contrato. El pago se efectuará el día "+diaPagoTxt+" de cada mes, mediante "+formaPagoTexto(op.alquiler_forma_pago)+".-"
    : "El canon locativo mensual inicial se pacta en "+fmt$L(op.alquiler_monto_inicial,op.alquiler_moneda)+", con actualización "+periodoTxt+" conforme al índice "+indiceNombre+(indiceKey==="ICL"?" que publica el BCRA":"")+". El pago se efectuará el día "+diaPagoTxt+" de cada mes, mediante "+formaPagoTexto(op.alquiler_forma_pago)+".-";
  var depositoMontoNum = op.alquiler_deposito === "otro" ? parseFloat(op.alquiler_deposito_otro_monto||0) : parseFloat(op.alquiler_monto_inicial||0)*parseFloat(valorComisionPredeterminado(op.alquiler_deposito,"1"));
  var depositoMoneda = op.alquiler_deposito === "otro" ? (op.alquiler_deposito_otro_moneda||"USD") : op.alquiler_moneda;
  var depositoMeses = String(valorComisionPredeterminado(op.alquiler_deposito,"1"));
  var depositoUnidad = Number(depositoMeses)===1 ? "mes" : "meses";
  var depositoDesc = op.alquiler_deposito === "otro" ? "un monto fijo de "+fmt$L(depositoMontoNum,depositoMoneda) : "el equivalente a "+depositoMeses+" "+depositoUnidad+" de alquiler, es decir "+fmt$L(depositoMontoNum,depositoMoneda);
  var avisoMesesToken = String(op.alquiler_aviso_meses||"1");
  var avisoPlazoToken = Number(avisoMesesToken)===1 ? "1 mes" : avisoMesesToken+" meses";
  var garantiaDetalle = (op.alquiler_garantia_texto_personalizado && op.alquiler_garantia_texto_personalizado.trim())
    ? op.alquiler_garantia_texto_personalizado.trim()
    : op.alquiler_garantia_tipo === "propietario"
    ? "Se constituye garantía propietaria a cargo de "+(op.alquiler_garantia_titular||"___")+", "+tipoIdentificacion(op.alquiler_garantia_dni)+": "+(op.alquiler_garantia_dni||"___")+", titular del inmueble sito en "+(op.alquiler_garantia_inmueble||"___")+".-"
    : op.alquiler_garantia_tipo === "seguro_caucion" ? "Se constituye como garantía un Seguro de Caución a contratar por el LOCATARIO en forma previa a la firma del presente.-"
    : op.alquiler_garantia_tipo === "aval_bancario" ? "Se constituye como garantía un Aval Bancario otorgado a favor del LOCADOR.-"
    : "Se constituye como garantía el Recibo de Sueldo de "+(op.alquiler_garantia_titular||"___")+".-";
  var exclCon = (op.exclusividad_tipo||"con")==="con";
  var exclModalidad = exclCon ? "La presente autorización es EXCLUSIVA. Durante su vigencia, el AUTORIZANTE no podrá comercializar el inmueble por otro medio o intermediario.-" : "La presente autorización es SIN EXCLUSIVIDAD. El AUTORIZANTE podrá comercializar el inmueble simultáneamente por otros medios o intermediarios.-";
  var __tg = {
    nomenclatura_catastral_texto: op.nomenclatura_catastral ? (", Nomenclatura Catastral "+op.nomenclatura_catastral) : "",
    comision_autorizante_texto: textoComision(op,"comision_vendedor","AUTORIZANTE","precio de venta",parseMontoAR(op.precio||0),op.moneda||"USD","comision_vendedor",""),
    moneda_txt: monedaTxt,
    precio_letras: fmt$L(op.precio, op.moneda || moneda),
    anticipo_letras: fmt$L(op.anticipo, op.moneda || moneda),
    saldo_letras: fmt$L(op.saldo, op.moneda || moneda),
    escribania_clausula: op.escribania ? ("Escribanía designada: " + op.escribania + ",") : "El Escribano será designado por el Oferente,",
    escribania_boleto: op.escribania ? " ante " + op.escribania : "",
    alquiler_destino_texto: destino,
    alquiler_amoblado_texto: amoblado,
    alquiler_plazo_texto: plazo,
    alquiler_fin_formateado: fin,
    alquiler_canon_clause: canonClause,
    alquiler_deposito_desc: depositoDesc,
    alquiler_garantia_detalle: garantiaDetalle,
    alquiler_interes_punitorio: op.alquiler_interes_punitorio || "5",
    alquiler_penalidad_meses: op.alquiler_penalidad_meses || "2",
    alquiler_seguro_dias: op.alquiler_seguro_dias || "10",
    alquiler_aviso_meses: op.alquiler_aviso_meses || "1",
    alquiler_aviso_plazo: avisoPlazoToken,
    res_alq_aceptacion_plazo: (Number(op.res_alq_aceptacion_dias||"2")===1 ? "1 día" : String(op.res_alq_aceptacion_dias||"2")+" días"),
    res_alq_vigencia_plazo: (Number(op.res_alq_vigencia_dias||"10")===1 ? "1 día" : String(op.res_alq_vigencia_dias||"10")+" días"),
    alquiler_comision_locador_final: (op.alquiler_comision_locador!==undefined && op.alquiler_comision_locador!==null && String(op.alquiler_comision_locador)!=="") ? op.alquiler_comision_locador : ((op.alquiler_comision!==undefined && op.alquiler_comision!==null && String(op.alquiler_comision)!=="") ? op.alquiler_comision : "___"),
    alquiler_comision_locatario_final: (op.alquiler_comision_locatario!==undefined && op.alquiler_comision_locatario!==null && String(op.alquiler_comision_locatario)!=="") ? op.alquiler_comision_locatario : ((op.alquiler_comision!==undefined && op.alquiler_comision!==null && String(op.alquiler_comision)!=="") ? op.alquiler_comision : "___"),
    alquiler_comision_locador_texto: textoComision(op,"alquiler_comision_locador","LOCADOR","total del contrato",totalContratoAlquiler(op),op.alquiler_moneda||"ARS","alquiler_comision_locador",valorComisionPredeterminado(op.alquiler_comision,"1")),
    alquiler_comision_locatario_texto: textoComision(op,"alquiler_comision_locatario","LOCATARIO","total del contrato",totalContratoAlquiler(op),op.alquiler_moneda||"ARS","alquiler_comision_locatario",valorComisionPredeterminado(op.alquiler_comision,"1")),
    reserva_alquiler_moneda_txt: op.res_alq_moneda === "USD" ? "DÓLARES ESTADOUNIDENSES" : "PESOS ARGENTINOS",
    reserva_alquiler_reserva: fmt$L(op.res_alq_monto_reserva,op.res_alq_moneda),
    reserva_alquiler_canon: fmt$L(op.res_alq_monto_mensual,op.res_alq_monto_mensual_moneda || op.res_alq_moneda || "ARS"),
    reserva_alquiler_plazo: op.res_alq_plazo_cantidad || "24",
    reserva_alquiler_unidad: op.res_alq_plazo_unidad || "meses",
    res_alq_plazo_cantidad: op.res_alq_plazo_cantidad || "24",
    res_alq_plazo_unidad: op.res_alq_plazo_unidad || "meses",
    reserva_alquiler_plazo_texto: plazoReservaAlquiler(op).texto,
    reserva_alquiler_fin_estimado: fmtD(finReservaAlquilerISO(op)),
    reserva_alquiler_inicio: fmtD(op.res_alq_inicio_estimado),
    reserva_alquiler_plazo_cantidad: op.res_alq_plazo_cantidad || "24",
    reserva_alquiler_plazo_unidad: op.res_alq_plazo_unidad || "meses",
    reserva_alquiler_inicio_estimado: fmtD(op.res_alq_inicio_estimado),
    reserva_alquiler_monto_reserva: fmt$L(op.res_alq_monto_reserva,op.res_alq_moneda||"ARS"),
    reserva_alquiler_monto_mensual: fmt$L(op.res_alq_monto_mensual,op.res_alq_monto_mensual_moneda||op.res_alq_moneda||"ARS"),
    reserva_alquiler_aceptacion_dias: op.res_alq_aceptacion_dias || "2",
    reserva_alquiler_vigencia_dias: op.res_alq_vigencia_dias || "10",
    reserva_alquiler_comision_locador: (op.res_alq_comision_locador!==undefined && op.res_alq_comision_locador!==null && String(op.res_alq_comision_locador)!=="") ? op.res_alq_comision_locador : ((op.res_alq_comision!==undefined && op.res_alq_comision!==null && String(op.res_alq_comision)!=="") ? op.res_alq_comision : "___"),
    reserva_alquiler_comision_locatario: (op.res_alq_comision_locatario!==undefined && op.res_alq_comision_locatario!==null && String(op.res_alq_comision_locatario)!=="") ? op.res_alq_comision_locatario : ((op.res_alq_comision!==undefined && op.res_alq_comision!==null && String(op.res_alq_comision)!=="") ? op.res_alq_comision : "___"),
    reserva_alquiler_comision_locador_texto: textoComision(op,"res_alq_comision_locador","LOCADOR","canon mensual",parseFloat(op.res_alq_monto_mensual||0),op.res_alq_moneda||"ARS","res_alq_comision_locador",valorComisionPredeterminado(op.res_alq_comision,"1")),
    reserva_alquiler_comision_locatario_texto: textoComision(op,"res_alq_comision_locatario","LOCATARIO","canon mensual",parseFloat(op.res_alq_monto_mensual||0),op.res_alq_moneda||"ARS","res_alq_comision_locatario",valorComisionPredeterminado(op.res_alq_comision,"1")),
    exclusividad_modalidad_texto: exclModalidad,
    refuerzo_trayectoria: op.refuerzo_trayectoria || ("Las partes han suscripto con anterioridad una Reserva de Compra para el inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+".-"),
    devolucion_motivo_texto: op.devolucion_motivo || "Por mutuo acuerdo entre las partes, y ante la no concreción de la operación, se procede a la devolución íntegra del monto de reserva oportunamente entregado.-"
  };
  // Tokens propios de la Reserva de Compra (plazo de aceptación, vigencia, honorarios): sin esto los
  // bloques editables de la reserva los resolvían como "___" y el documento figuraba con datos sin resolver.
  var __rv = derivedTokensReserva(op);
  Object.keys(__rv).forEach(function(k){ if(!Object.prototype.hasOwnProperty.call(__tg,k)) __tg[k]=__rv[k]; });
  return __tg;
}
var TOKENS_CONTACTO_PARTES_PRIVADOS = {
  comprador_email:true, comprador_telefono:true, vendedor_email:true, vendedor_telefono:true,
  locador_email:true, locador_telefono:true, locatario_email:true, locatario_telefono:true
};
// Un porcentaje 0 cargado expresamente es válido; solo los valores ausentes usan el default.
function valorComisionPredeterminado(valor, defecto) {
  return valor === undefined || valor === null || String(valor).trim() === "" ? defecto : valor;
}
function resolveVars(text, op, extra=undefined) {
  if (!text) return text;
  var derived = derivedTokensGenerales(op || {});
  var commissionKeys = {
    comision_vendedor:true, comision_comprador:true,
    alquiler_comision_locador:true, alquiler_comision_locatario:true,
    res_alq_comision_locador:true, res_alq_comision_locatario:true
  };
  var fixedLegacyKeys={};
  var out=String(text).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}\s*%(?:\s+del\s+(?:(?:primer)\s+)?canon\s+mensual)?/g, function(_, key) {
    if(!commissionKeys[key]) return "{{"+key+"}}%";
    var base=0,moneda="ARS",legacy=key,def="1";
    if(key.indexOf("comision_vendedor")==0 || key.indexOf("comision_comprador")==0){
      base=parseFloat((op||{}).precio||0); moneda=(op||{}).moneda||"USD"; def="3";
    } else if(key.indexOf("alquiler_comision_")==0){
      base=totalContratoAlquiler(op||{}); moneda=(op||{}).alquiler_moneda||"ARS"; def=valorComisionPredeterminado((op||{}).alquiler_comision,"1");
    } else {
      base=parseFloat((op||{}).res_alq_monto_mensual||0); moneda=(op||{}).res_alq_moneda||(op||{}).res_alq_monto_mensual_moneda||"ARS"; def=valorComisionPredeterminado((op||{}).res_alq_comision,"1");
    }
    var c=getComisionConfig(op,key,base,moneda,legacy,def);
    if(c.modo==="fijo"){ fixedLegacyKeys[key]=true; return fmt$L(c.valor,c.moneda); }
    if(key.indexOf("alquiler_comision_")===0) return (c.valor!=="" && c.valor!==undefined && c.valor!==null ? c.valor : "___")+"% del total del contrato";
    if(key.indexOf("res_alq_comision_")===0) return (c.valor!=="" && c.valor!==undefined && c.valor!==null ? c.valor : "___")+"% del canon mensual";
    return c.valor!=="" && c.valor!==null && c.valor!==undefined ? c.valor : "___";
  });
  Object.keys(fixedLegacyKeys).forEach(function(key){
    if(key.indexOf("comision_")===0) out=out.replace(/\s+del (?:Precio total|precio de venta)\b/gi,"");
    if(key.indexOf("alquiler_comision_")===0) out=out.replace(/\s+del (?:primer )?canon mensual\b/gi,"");
    if(key.indexOf("res_alq_comision_")===0) out=out.replace(/\s+del canon mensual\b/gi,"");
  });
  out = reemplazarRolesDocumento(out,(op||{}).tipo);
  out = out.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, function(_, key) {
    if (TOKENS_CONTACTO_PARTES_PRIVADOS[key]) {
      var pref=key.replace(/_(email|telefono)$/,""),tipoContacto=key.slice(pref.length+1);
      return tipoContacto==="email" ? emailParaDocumento(op||{},pref) : telefonoParaDocumento(op||{},pref);
    }
    // Una reserva/contrato de alquiler no puede resolver tokens de
    // comprador/vendedor. Evita que una cláusula vieja muestre 3%/4%
    // aunque la operación haya heredado esos campos históricos.
    if ((op||{}).tipo==="alquiler" || (op||{}).tipo==="reserva_alquiler") {
      if (key==="comision_vendedor" || key==="comision_comprador" || key==="comision_porcentaje" ||
          key==="comision_vendedor_texto" || key==="comision_comprador_texto" || key==="comision_reserva_texto") return "";
    }
    if (extra && Object.prototype.hasOwnProperty.call(extra, key)) return extra[key];
    if (Object.prototype.hasOwnProperty.call(derived, key)) return derived[key];
    return fmtVarValue(key, op || {});
  });
  // Los tokens privados pueden resolver a vacío: limpia solo los separadores
  // que quedan alrededor de esos datos, sin alterar puntuación legal legítima.
  out = out.replace(/[ \t]{2,}/g, " ");
  out = out.replace(/\s+([,.;:])/g, "$1");
  out = out.replace(/([(:])\s*([,.;])/g, "$1");
  out = out.replace(/,\s*([.])/g, "$1");
  return out.trim();
}
// Tokens derivados exclusivos de la base de Reserva (Fase 1 — sistema de
// bloques). No tocan fmtVarValue/VAR_GROUPS (que siguen siendo los tokens
// "genéricos" de la biblioteca de cláusulas); estos son específicos porque
// reproducen fragmentos condicionales que en el texto legal original están
// escritos como concatenación de strings en JS, no como texto simple.
function derivedTokensReserva(op) {
  var esUSD = op.moneda === "USD";
  return {
    moneda_txt: esUSD ? "DÓLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS",
    precio_letras: fmt$L(op.precio, op.moneda),
    anticipo_letras: fmt$L(op.anticipo, op.moneda),
    saldo_letras: fmt$L(op.saldo, op.moneda),
    // Mismo default "3" que usa hoy buildDocSections — a propósito distinto
    // del fallback genérico "___" de fmtVarValue.
    comision_porcentaje: valorComisionPredeterminado(op.comision_porcentaje,"3"),
    comision_reserva_texto: (function(){
      var c=getComisionConfig(op,"comision_comprador",parseMontoAR(op.precio||0),op.moneda||"USD","comision_comprador",valorComisionPredeterminado(op.comision_porcentaje,""));
      if(c.modo==="fijo") return "El Oferente abonará la suma de "+fmt$L(c.valor,c.moneda)+" en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente, al momento de la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-";
      return "El Oferente abonará el "+(c.valor!=="" && c.valor!==null && c.valor!==undefined ? c.valor : "___")+"% del Precio en el momento de la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente.-";
    })(),
    comision_vendedor_texto: textoComision(op,"comision_vendedor","VENDEDOR","Precio total",parseMontoAR(op.precio||0),op.moneda||"USD","comision_vendedor",""),
    comision_comprador_texto: textoComision(op,"comision_comprador","COMPRADOR","Precio total",parseMontoAR(op.precio||0),op.moneda||"USD","comision_comprador",""),
    comodato_plazo_texto: textoPlazoComodato(op.comodato_plazo),
    reserva_vigencia_dias: String(parseInt(op.reserva_vigencia_dias,10)>0?parseInt(op.reserva_vigencia_dias,10):30),
    reserva_vigencia_texto: (function(){
      var n=parseInt(op.reserva_vigencia_dias,10); if(!(n>0)) n=30;
      var letras=palabrasDias(n); if(letras===String(n)) letras=numeroALetras(n).toLowerCase();
      return n+" ("+letras+") días corridos contados desde su conformación por el Vendedor";
    })(),
    reserva_aceptacion_vencimiento: op.reserva_aceptacion_vencimiento ? fmtD(op.reserva_aceptacion_vencimiento) : (op.reserva_aceptacion_dias ? ("dentro de "+op.reserva_aceptacion_dias+" días") : "___"),
    // Texto listo para insertar en la cláusula 5 (elige el broker: horas / días / fecha).
    reserva_aceptacion_plazo_texto: (function(){
      var modo = String(op.reserva_aceptacion_modo||"").toLowerCase();
      if(modo==="horas" || (!modo && op.reserva_aceptacion_horas && !op.reserva_aceptacion_vencimiento)){
        var h = parseInt(op.reserva_aceptacion_horas,10);
        if(!h || h<1) h = 48;
        return "a las "+h+" horas de suscripta la misma";
      }
      if(op.reserva_aceptacion_vencimiento){
        return "el "+fmtD(op.reserva_aceptacion_vencimiento);
      }
      var d = parseInt(op.reserva_aceptacion_dias,10);
      if(d && d>0){
        return d===1 ? "al día de suscripta la misma" : ("a los "+d+" días de suscripta la misma");
      }
      return "el ___";
    })(),
    escribania_clausula: op.escribania ? ("Escribanía designada: " + op.escribania + ",") : "El Escribano será designado por el Oferente,",
    notificacion_emails_clausula: "",
  };
}

var DW_TEMAS_BASE=[/jurisdicci/,/expensas/,/ocupantes/,/multa|incumplimiento|penalidad|\bmora\b/,/estado del inmueble/,/subalquil/,/obras/];
var DW_TEMA_HONORARIOS=/honorarios|comision inmobiliaria/;
function clausulaYaEnTextoBase(c){
  if(!c)return false;
  var t=dwNormTexto(c.titulo);
  if(DW_TEMA_HONORARIOS.test(t)||c.id==="c4")return true;
  var legacy=/^c[1-9]$/.test(String(c.id||""));
  if(["c6","c7","c8","c9"].indexOf(String(c.id))!==-1)return true; // "Servicios a cargo del locatario" repite Gastos y mantenimiento del texto base.
  return DW_TEMAS_BASE.some(function(re){return re.test(t);})&&(legacy||c.obligatoria===true);
}
function clausulaRepiteSeccionDoc(c,doc){
  if(!clausulaYaEnTextoBase(c))return false;
  var t=dwNormTexto(c.titulo);
  var secs=(doc&&doc.secciones)||[];
  var temas=DW_TEMAS_BASE.concat([DW_TEMA_HONORARIOS]);
  return temas.some(function(re){return re.test(t)&&secs.some(function(sc){return re.test(dwNormTexto(sc.titulo))||(/expensas/.test(t)&&/expensas/.test(dwNormTexto((sc.items||[]).join(" "))));});});
}
function clausulaAplicaTipo(c, tipo) {
  if ((tipo==="alquiler" || tipo==="reserva_alquiler") && c) {
    var metaCompraventa=(String(c.titulo||"")+" "+String(c.contenido||"")).toLowerCase();
    if (c.id==="c4" || /\b(vendedor|comprador)\b/.test(metaCompraventa) || /precio total de venta|comision pactada sobre el precio/.test(metaCompraventa)) return false;
  }
  if (c.tipos && c.tipos.length) {
    return c.tipos.indexOf("todos") !== -1 || c.tipos.indexOf(tipo) !== -1;
  }
  var esAlquilerTipo = (tipo==="alquiler"||tipo==="reserva_alquiler");
  return esAlquilerTipo ? true : c.categoria !== "alquiler";
}

// Los detalles pertenecen a la operación; nunca modifican el texto de la biblioteca.
var DETALLES_CLAUSULAS = {
  "especial.aires_incluidos":{campo:"entrega_aires_detalle",label:"Detalle de aires acondicionados",placeholder:"Cantidad, marca/modelo, ambiente y estado de cada equipo",encabezado:"EQUIPOS INCLUIDOS"},
  "especial.entrega_amoblada":{campo:"entrega_muebles_detalle",label:"Inventario de muebles y artefactos",placeholder:"Un bien por línea: cantidad, descripción y estado",encabezado:"INVENTARIO DE ENTREGA"}
};
function detalleClausulaOperacion(c,op){
  var cfg=configDetalleClausula(c);
  var detalle=cfg&&String(op[cfg.campo]||"").trim();
  return detalle?"\n\n"+cfg.encabezado+":\n"+detalle:"";
}
function configDetalleClausula(c){
  if(!c)return null;
  if(Object.prototype.hasOwnProperty.call(DETALLES_CLAUSULAS,c.id))return DETALLES_CLAUSULAS[c.id];
  // Al copiar una idea a Supabase recibe un UUID propio. Reconocer la redacción
  // de fábrica conserva los campos sin depender del identificador local.
  var original=CLAUSULAS_DEFAULT.find(function(base){return Object.prototype.hasOwnProperty.call(DETALLES_CLAUSULAS,base.id)&&claveContenidoClausula(base.contenido)===claveContenidoClausula(c.contenido);});
  return original?DETALLES_CLAUSULAS[original.id]:null;
}
function claveContenidoClausula(texto){
  // Comparación exacta salvo espacios: no equiparar redacciones legales distintas.
  return String(texto||"").replace(/\s+/g," ").trim();
}

// Plantillas: cada tipo de documento mantiene su propia selección y orden de cláusulas.
// Se conserva compatibilidad con la configuración anterior (`clausulas_default_ids`).
const PLANTILLA_TIPOS = [
  "reserva", "boleto", "reserva_alquiler", "alquiler", "comodato", "exclusividad", "refuerzo_reserva", "devolucion_reserva"
];
function crearPlantillasIniciales(catalogo=CLAUSULAS_DEFAULT){
  var mapa={};
  PLANTILLA_TIPOS.forEach(function(tipo){
    var aplicables=catalogo.filter(function(c){return clausulaAplicaTipo(c,tipo);});
    mapa[tipo]={clausulas_ids:aplicables.filter(function(c){return c.obligatoria===false;}).map(function(c){return c.id;}),obligatorias_ids:aplicables.filter(function(c){return c.obligatoria===true;}).map(function(c){return c.id;}),locked:false,version:1};
  });
  return mapa;
}
function obtenerPlantillaConfig(perfil, tipo, clausulas){
  var mapa = perfil && perfil.plantillas ? perfil.plantillas : {};
  var actual = mapa && mapa[tipo];
  if(actual && (Array.isArray(actual.clausulas_ids)||Array.isArray(actual.frecuentes_ids)||Array.isArray(actual.obligatorias_ids))){
    var av=parseInt(actual.version,10);
    var idsActuales=Array.isArray(actual.clausulas_ids)?actual.clausulas_ids.slice():[];
    var obligatoriasActuales=Array.isArray(actual.obligatorias_ids)?actual.obligatorias_ids.slice():[];
    // Las frecuentes son sugerencias para el broker, nunca cláusulas del modelo.
    // No mezclar ni borrar los IDs existentes al leer configuraciones históricas.
    var frecuentesActuales=Array.isArray(actual.frecuentes_ids)?actual.frecuentes_ids.slice():[];
    obligatoriasActuales.forEach(function(id){idsActuales=idsActuales.filter(function(x){return x!==id;});});
    return {clausulas_ids:idsActuales, obligatorias_ids:obligatoriasActuales, frecuentes_ids:frecuentesActuales, locked:!!actual.locked, version:(isFinite(av)&&av>0?av:1)};
  }
  var legacy = (perfil && Array.isArray(perfil.clausulas_default_ids)) ? perfil.clausulas_default_ids.slice() : [];
  var ids = (clausulas||[]).filter(function(c){ return legacy.indexOf(c.id)!==-1 && clausulaAplicaTipo(c,tipo); }).map(function(c){return c.id;});
  return {clausulas_ids:ids, obligatorias_ids:[], frecuentes_ids:[], locked:!!(perfil && perfil.clausulas_default_locked), version:1};
}
function obtenerIdsProtegidosDePlantillas(perfil){
  var out=[];
  var mapa=perfil&&perfil.plantillas?perfil.plantillas:{};
  PLANTILLA_TIPOS.forEach(function(tipo){
    var cfg=obtenerPlantillaConfig(perfil,tipo,[]);
    if(cfg.locked){ out=out.concat(cfg.clausulas_ids||[],cfg.obligatorias_ids||[]); }
  });
  if(perfil&&perfil.clausulas_default_locked){ out=out.concat(perfil.clausulas_default_ids||[]); }
  return out.filter(function(id,i,a){return a.indexOf(id)===i;});
}

// Cada plantilla maestra tiene una versión propia. La versión solo avanza
// cuando el Dueño/Administrador vuelve a fijar una plantilla bloqueada.
// Los contratos guardan la versión vigente al momento de su creación.
function obtenerVersionPlantilla(perfil,tipo){
  var cfg=obtenerPlantillaConfig(perfil,tipo,[]);
  var n=parseInt(String(cfg.version ?? ""),10);
  return isFinite(n)&&n>0?n:1;
}
function obtenerIdsObligatoriosDePlantilla(perfil,tipo){
  var cfg=obtenerPlantillaConfig(perfil,tipo,[]);
  return (cfg.obligatorias_ids||[]).slice();
}
function crearSnapshotPlantillaOperacion(op,perfil,clausulas,bloquesReserva){
  var tipo=op&&op.tipo;
  var cfg=perfil&&perfil.plantillas&&perfil.plantillas[tipo]?perfil.plantillas[tipo]:{};
  var ids=Array.isArray(cfg.clausulas_ids)?cfg.clausulas_ids.slice():[];
  var obligatoriasIds=Array.isArray(cfg.obligatorias_ids)?cfg.obligatorias_ids.slice():[];
  var idsSnapshot=ids.concat(obligatoriasIds).filter(function(id,i,a){return a.indexOf(id)===i;});
  var intro=(perfil&&perfil.encabezados_custom&&perfil.encabezados_custom[tipo])||DEFAULT_ENCABEZADOS[tipo]||"";
  var body=getBodyBlocksConfig(perfil,tipo,bloquesReserva);
  return {tipo:tipo,version:obtenerVersionPlantilla(perfil,tipo),capturado_en:new Date().toISOString(),introduccion:intro,clausulas_ids:ids,obligatorias_ids:obligatoriasIds,clausulas:(clausulas||[]).filter(function(c){return idsSnapshot.indexOf(c.id)!==-1;}).map(function(c){return {id:c.id,titulo:c.titulo,contenido:c.contenido,obligatoria:!!c.obligatoria,categoria:c.categoria,orden:c.orden,aplica_a:c.aplica_a};}),body_blocks:JSON.parse(JSON.stringify(body)),mostrar_introduccion:!(perfil&&perfil.mostrar_introduccion===false)};
}
function sellarVersionPlantillaOperacion(op,perfil,forzar,clausulas,bloquesReserva){
  if(!op)return op;
  var out=Object.assign({},op);
  if(forzar || !out.plantilla_version){
    out.plantilla_version=obtenerVersionPlantilla(perfil,out.tipo);
  }
  // Las operaciones nuevas conservan el texto exacto de la plantilla al crearse.
  // No se sobrescribe una instantánea histórica al editar una operación existente.
  if(forzar || !out.plantilla_snapshot){
    out.plantilla_snapshot=crearSnapshotPlantillaOperacion(out,perfil,clausulas,bloquesReserva);
  }
  out.plantilla_version_label="v"+out.plantilla_version;
  out.plantilla_tipo=out.tipo||null;
  return out;
}


// Operación de ejemplo con datos ficticios realistas, usada exclusivamente
// para la vista previa en vivo de Configuración → Plantillas (para que los
// tokens {{...}} del encabezado y de las cláusulas se vean resueltos con
// texto legible en vez de guiones bajos "___").
const SAMPLE_OP_PREVIEW = {
  tipo:"reserva",
  comprador_nombre:"Juan Pérez", comprador_dni:"20-12345678-9", comprador_domicilio:"Av. Corrientes 1234, CABA", comprador_email:"juan.perez@email.com", comprador_telefono:"11-2345-6789",
  vendedor_nombre:"María López", vendedor_dni:"27-98765432-1", vendedor_domicilio:"Av. Santa Fe 4321, CABA", vendedor_email:"maria.lopez@email.com", vendedor_telefono:"11-9876-5432",
  locador_nombre:"María López", locador_dni:"27-98765432-1", locador_domicilio:"Av. Santa Fe 4321, CABA", locador_email:"maria.lopez@email.com", locador_telefono:"11-9876-5432",
  locatario_nombre:"Juan Pérez", locatario_dni:"20-12345678-9", locatario_domicilio:"Av. Corrientes 1234, CABA", locatario_email:"juan.perez@email.com", locatario_telefono:"11-2345-6789",
  inmueble_direccion:"Av. del Libertador 5678, Piso 4° B", inmueble_partido:"Pilar", inmueble_provincia:"Buenos Aires",
  nomenclatura_catastral:"Circ. I, Secc. B, Manz. 12, Parc. 5", descripcion_inmueble:"Departamento de 3 ambientes con balcón",
  precio:"150000", moneda:"USD", anticipo:"15000", saldo:"135000", comision_porcentaje:"3", escribania:"Escribanía Fernández", fecha_posesion:"2026-12-15",
  alquiler_monto_inicial:"350000", alquiler_moneda:"ARS", alquiler_deposito:"1", alquiler_comision:"4", alquiler_dia_pago:"10", alquiler_inicio:"2026-09-01", alquiler_fin:"2028-09-01",
  res_alq_monto_reserva:"100000", res_alq_monto_mensual:"350000", res_alq_monto_mensual_moneda:"ARS", res_alq_plazo_cantidad:"24", res_alq_inicio_estimado:"2026-09-01",
};
// Vista previa en vivo (Configuración → Plantillas): muestra el encabezado,
// el cuerpo editable y las cláusulas con datos de ejemplo, en el mismo orden
// general en que aparecerán en el documento real.

// Editor de introducción: tokens clicables (como bloques) + mejora con IA.
function textoEncabezadoDesdeDom(root){
  if(!root) return "";
  function walk(node){
    if(node.nodeType===3) return node.textContent||"";
    if(node.nodeType!==1) return "";
    var tok=node.getAttribute&&node.getAttribute("data-dw-token");
    if(tok) return "{{"+tok+"}}";
    var out="";
    for(var i=0;i<node.childNodes.length;i++) out+=walk(node.childNodes[i]);
    return out;
  }
  return walk(root).replace(/\u00a0/g," ").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
}
function htmlEncabezadoDesdeTpl(tpl, tipo){
  var t=escaparHtmlDocWorks(String(tpl||"")); // escapamos ANTES de inyectar los spans de token
  return t.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, function(_,k){
    var lab=labelTokenEncabezado(k, tipo);
    return '<span data-dw-token="'+k+'" contenteditable="false" style="display:inline-block;padding:1px 6px;border-radius:6px;background:rgba(70,180,230,.14);color:#59c7f3;font-weight:700;cursor:pointer;user-select:none;margin:0 1px">'+lab+'</span>';
  }).replace(/\n/g,"<br/>");
}
function EncabezadoEditor({tipo, value, onChange=undefined, onCancel, onSave, onRestablecer}){
  const editorRef=useRef(null);
  const [tokensUsados,setTokensUsados]=useState(function(){return tokensDeTextoDocWorks(value||"");});
  const [status,setStatus]=useState(null); // saving | saved | error | ia | ia-error
  const [msg,setMsg]=useState("");
  useEffect(function(){
    if(editorRef.current) editorRef.current.innerHTML=htmlEncabezadoDesdeTpl(value||"", tipo);
    setTokensUsados(tokensDeTextoDocWorks(value||""));
  }, [tipo]); // solo al montar / cambiar tipo; no en cada tecla
  function insertarToken(k){
    if(tokensDeTextoDocWorks(textoNarrativaPrecioDocWorks(editorRef.current)).indexOf(k)!==-1)return;
    var root=editorRef.current; if(!root) return;
    root.focus();
    var sel=window.getSelection&&window.getSelection();
    var range=sel&&sel.rangeCount?sel.getRangeAt(0):null;
    if(!range||!root.contains(range.commonAncestorContainer)){
      range=document.createRange(); range.selectNodeContents(root); range.collapse(false);
    }
    var span=document.createElement("span");
    span.setAttribute("data-dw-token",k); span.setAttribute("contenteditable","false");
    span.style.cssText="display:inline-block;padding:1px 6px;border-radius:6px;background:rgba(70,180,230,.14);color:#59c7f3;font-weight:700;cursor:pointer;user-select:none;margin:0 1px";
    span.textContent=labelTokenEncabezado(k, tipo);
    range.deleteContents(); range.insertNode(span);
    var space=document.createTextNode(" "); span.parentNode.insertBefore(space,span.nextSibling);
    range.setStartAfter(space); range.collapse(true);
    if(sel){ sel.removeAllRanges(); sel.addRange(range); }
    setTokensUsados(tokensDeTextoDocWorks(textoEncabezadoDesdeDom(root)));
  }
  function leer(){ return textoEncabezadoDesdeDom(editorRef.current); }
  function guardar(){
    var t=leer(); setStatus("saving");
    Promise.resolve(onSave(t)).then(function(res){
      if(res&&res.error){ setStatus("error"); setMsg("No se pudo guardar"); return; }
      setStatus("saved"); setMsg("Guardado");
      setTimeout(function(){ if(onChange) onChange(t); }, 200);
    }).catch(function(){ setStatus("error"); setMsg("Error al guardar"); });
  }
  async function conIA(){
    setStatus("ia"); setMsg("Mejorando con IA…");
    try{
      var mejor=await mejorarEncabezadoIA(leer(), tipo);
      if(editorRef.current) editorRef.current.innerHTML=htmlEncabezadoDesdeTpl(mejor, tipo);
      setTokensUsados(tokensDeTextoDocWorks(mejor));
      setStatus(null); setMsg("Revisá el texto y guardá si te convence.");
    }catch(e){
      setStatus("ia-error"); setMsg(traducirError(e&&e.message?e.message:"No se pudo usar la IA."));
    }
  }
  var tokens=tokensEncabezadoParaTipo(tipo);
  return (
    <div style={{marginTop:8}}>
      <div style={{fontSize:12,color:"var(--dim)",marginBottom:8,lineHeight:1.45}}>
        Hacé clic en los chips para insertar datos dinámicos (nombre del oferente, inmueble, montos, etc.). Se completan solos al generar el documento.
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="inp"
        style={{minHeight:120,lineHeight:1.55,padding:"10px 12px",whiteSpace:"pre-wrap",fontSize:12.5}}
        onKeyDown={function(e){ /* permitir Enter normal */ }}
        onInput={function(){setTokensUsados(tokensDeTextoDocWorks(textoEncabezadoDesdeDom(editorRef.current)));}}
      />
      <div style={{marginTop:12,padding:11,borderRadius:12,border:"1px solid var(--border)",background:"var(--card2, rgba(127,127,127,.035))"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8,flexWrap:"wrap"}}>
          <div style={{fontSize:12.5,fontWeight:750,color:"var(--text)"}}>Campos disponibles</div>
          <span style={{fontSize:11,color:"var(--dim)",padding:"3px 7px",borderRadius:999,background:"var(--surface2, rgba(127,127,127,.08))"}}>{tokens.filter(function(k){return tokensUsados.indexOf(k)===-1;}).length} para insertar</span>
        </div>
        <div style={{fontSize:11.5,color:"var(--dim)",lineHeight:1.45,marginBottom:9}}>Tocá un campo para agregarlo donde está el cursor. Los que ya usaste se ocultan para evitar repeticiones.</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {tokens.filter(function(k){return tokensUsados.indexOf(k)===-1;}).map(function(k){
            return <button key={k} type="button" title={"Insertar "+labelTokenEncabezado(k,tipo)} onMouseDown={function(e){e.preventDefault();}} onClick={function(){insertarToken(k);}}
              style={{display:"inline-flex",alignItems:"center",gap:5,minHeight:31,padding:"6px 9px",borderRadius:999,border:"1px solid var(--border2, rgba(89,199,243,.28))",background:"var(--card, rgba(89,199,243,.055))",color:"var(--text)",fontWeight:600,cursor:"pointer",fontSize:11.5,boxShadow:"0 1px 2px rgba(0,0,0,.025)"}}>
              <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:17,height:17,borderRadius:999,background:"rgba(89,199,243,.13)",color:"#59c7f3",fontSize:14,lineHeight:1}}>+</span>{labelTokenEncabezado(k, tipo)}
            </button>;
          })}
          {tokens.every(function(k){return tokensUsados.indexOf(k)!==-1;})&&<div style={{fontSize:12,color:"var(--green)",padding:"5px 0"}}>Ya insertaste todos los campos disponibles. Si borrás uno del texto, volverá a aparecer acá.</div>}
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12,alignItems:"center"}}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={function(){
          if(onRestablecer){
            var defTpl=DEFAULT_ENCABEZADOS[tipo]||"";
            if(editorRef.current) editorRef.current.innerHTML=htmlEncabezadoDesdeTpl(defTpl, tipo);
            setTokensUsados(tokensDeTextoDocWorks(defTpl));
            onRestablecer();
          }
        }}>Restablecer valor predeterminado</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={conIA} disabled={status==="ia"}>
          {status==="ia"?"IA…":"Mejorar con IA"}
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={guardar} disabled={status==="saving"}>
          {status==="saving"?"Guardando…":"Guardar introducción"}
        </button>
        {msg && <span style={{fontSize:12,color:status==="ia-error"||status==="error"?"var(--red)":"var(--muted)"}}>{msg}</span>}
      </div>
    </div>
  );
}
// ── Panel de bloques de la base editable ─────────────────────────────────────
// Editor de bloques (referenciados por id estable, no por posición) +
// comparación generador actual vs. por bloques + vista previa completa.

var TOKEN_LABELS_DOCWORKS = {
  moneda_txt:"Moneda", precio_letras:"Precio en letras", anticipo_letras:"Anticipo / seña en letras", saldo_letras:"Saldo en letras",
  comprador_nombre:"Nombre del comprador / oferente", comprador_dni:"DNI / CUIT del comprador", comprador_domicilio:"Domicilio del comprador", comprador_email:"Correo electrónico del comprador", comprador_telefono:"Teléfono del comprador",
  vendedor_nombre:"Nombre del vendedor / titular", vendedor_dni:"DNI / CUIT del vendedor", vendedor_domicilio:"Domicilio del vendedor", vendedor_email:"Correo electrónico del vendedor", vendedor_telefono:"Teléfono del vendedor",
  locador_nombre:"Nombre del locador", locador_dni:"DNI / CUIT del locador", locador_domicilio:"Domicilio del locador", locatario_nombre:"Nombre del locatario", locatario_dni:"DNI / CUIT del locatario", locatario_domicilio:"Domicilio del locatario",
  inmueble_direccion:"Dirección del inmueble", inmueble_partido:"Partido / Municipio", inmueble_provincia:"Provincia", nomenclatura_catastral:"Nomenclatura catastral", descripcion_inmueble:"Descripción del inmueble",
  fecha_operacion_larga:"Fecha de la operación", inmobiliaria_nombre:"Nombre de la inmobiliaria", inmobiliaria_matricula:"Matrícula de la inmobiliaria", alquiler_monto_letras:"Canon mensual en letras", comision_porcentaje:"Porcentaje de comisión"
};
function tokensDeTextoDocWorks(texto){
  var out=[]; var seen={};
  String(texto||"").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,function(_,k){ if(!seen[k]){seen[k]=true;out.push(k);} return _; });
  return out;
}
function tokenLabelDocWorks(k){ return TOKEN_LABELS_DOCWORKS[k] || k.replace(/_/g," ").replace(/\b\w/g,function(c){return c.toUpperCase();}); }
function mostrarTokensDocWorks(texto){ return String(texto||"").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,function(_,k){ return tokenLabelDocWorks(k); }); }
function TokensProtegidosDocWorks({tokens, compact}){
  var lista=Array.isArray(tokens)?tokens:[];
  if(!lista.length) return null;
  return <div style={{marginTop:7,padding:"8px 9px",borderRadius:8,border:"1px solid var(--border)",background:"rgba(255,255,255,.018)"}}>
    <div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Campos automáticos protegidos</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{lista.map(function(k){return <span key={k} title="Este campo se completa automáticamente y no se puede eliminar" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 7px",borderRadius:999,border:"1px solid rgba(212,168,83,.22)",background:"rgba(212,168,83,.07)",color:"var(--gold)",fontSize:compact?9.5:10}}><b style={{fontWeight:650}}>{tokenLabelDocWorks(k)}</b><span style={{opacity:.7}}>🔒</span></span>;})}</div>
  </div>;
}

function normalizarNarrativaPrecio(texto){
  var t=String(texto||"").trim();
  if(!t) return "El Oferente ofrece la suma de {{precio_letras}} para la compra del Inmueble, en adelante el Precio.-";
  return t;
}

function escaparHtmlDocWorks(texto){
  return String(texto||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
}
function htmlNarrativaPrecioDocWorks(texto){
  var t=escaparHtmlDocWorks(texto||"");
  t=t.replace(/\{\{\s*moneda_txt\s*\}\}/g,'<span data-dw-token="moneda_txt" contenteditable="false" style="display:inline-block;padding:1px 5px;border-radius:5px;background:rgba(70,180,230,.13);color:#59c7f3;font-weight:800;cursor:pointer;user-select:none">Moneda</span>');
  t=t.replace(/\{\{\s*precio_letras\s*\}\}/g,'<span data-dw-token="precio_letras" contenteditable="false" style="display:inline-block;padding:1px 5px;border-radius:5px;background:rgba(70,180,230,.13);color:#59c7f3;font-weight:800;cursor:pointer;user-select:none">Precio en letras</span>');
  return t;
}
function textoNarrativaPrecioDocWorks(root){
  if(!root) return "";
  var out="";
  function recorrer(n){
    if(n.nodeType===3){out+=n.nodeValue||"";return;}
    if(n.nodeType!==1) return;
    var token=n.getAttribute&&n.getAttribute("data-dw-token");
    if(token){out+="{{"+token+"}}";return;}
    for(var i=0;i<n.childNodes.length;i++) recorrer(n.childNodes[i]);
  }
  for(var i=0;i<root.childNodes.length;i++) recorrer(root.childNodes[i]);
  return out;
}
function PrecioNarrativaEditor({bloque, onSave, onCancel, onSaved=onCancel}){
  const [texto,setTexto]=useState(bloque&&bloque.contenido||"");
  const [titulo,setTitulo]=useState(bloque&&bloque.titulo||"PRECIO");
  const [status,setStatus]=useState(null);
  const [faltantes,setFaltantes]=useState([]);
  const editorRef=useRef(null);
  useEffect(function(){
    if(editorRef.current) editorRef.current.innerHTML=htmlNarrativaPrecioDocWorks(texto);
  },[]);
  function syncTexto(){
    if(editorRef.current) setTexto(textoNarrativaPrecioDocWorks(editorRef.current));
  }
  function insertarToken(k){
    if(tokensDeTextoDocWorks(textoNarrativaPrecioDocWorks(editorRef.current)).indexOf(k)!==-1)return;
    var root=editorRef.current;
    if(!root) return;
    root.focus();
    var sel=window.getSelection&&window.getSelection();
    var range=sel&&sel.rangeCount?sel.getRangeAt(0):null;
    if(!range || !root.contains(range.commonAncestorContainer)){
      range=document.createRange(); range.selectNodeContents(root); range.collapse(false);
    }
    var span=document.createElement("span");
    span.setAttribute("data-dw-token",k); span.setAttribute("contenteditable","false");
    span.style.cssText="display:inline-block;padding:1px 5px;border-radius:5px;background:rgba(70,180,230,.13);color:#59c7f3;font-weight:800;cursor:pointer;user-select:none";
    span.textContent=k==="moneda_txt"?"Moneda":"Precio en letras";
    range.deleteContents(); range.insertNode(span);
    var space=document.createTextNode(" "); span.parentNode.insertBefore(space,span.nextSibling);
    range.setStartAfter(space); range.collapse(true);
    sel.removeAllRanges(); sel.addRange(range);
    syncTexto(); setFaltantes(function(xs){return xs.filter(function(x){return x!==k;});}); setStatus(null);
  }
  function guardar(){
    var contenido=normalizarNarrativaPrecio(editorRef.current?textoNarrativaPrecioDocWorks(editorRef.current):texto);
    var falt=[];
    if(contenido.indexOf("{{moneda_txt}}")===-1) falt.push("moneda_txt");
    if(contenido.indexOf("{{precio_letras}}")===-1) falt.push("precio_letras");
    if(falt.length){setFaltantes(falt);setStatus("missing");return;}
    setStatus("saving");
    try{
      Promise.resolve(onSave({titulo:titulo,contenido:contenido})).then(function(res){
        if(res&&res.error){setStatus("error");return;}
        setStatus("saved"); setTimeout(function(){onSaved();},350);
      }).catch(function(){setStatus("error");});
    }catch(e){setStatus("error");}
  }
  return (
    <div style={{marginTop:8,padding:12,borderRadius:10,background:"rgba(212,168,83,0.055)",border:"1px solid rgba(212,168,83,0.22)"}}>
      <div style={{fontSize:12.5,fontWeight:700,color:"var(--text)",marginBottom:4}}>Cómo querés que aparezca el precio</div>
      <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.45,marginBottom:9}}>Podés modificar libremente la redacción. <b style={{color:"#59c7f3"}}>Moneda</b> y <b style={{color:"#59c7f3"}}>Precio en letras</b> son campos automáticos protegidos.</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
        {PRECIO_NARRATIVAS_PRESET.map(function(preset){return <button key={preset.label} type="button" onClick={function(){if(editorRef.current) editorRef.current.innerHTML=htmlNarrativaPrecioDocWorks(preset.texto);setTexto(preset.texto);setFaltantes([]);setStatus(null);}} style={{padding:"6px 9px",borderRadius:8,border:"1px solid var(--border2)",background:"var(--card)",color:"var(--muted)",cursor:"pointer",fontSize:12}}>{preset.label}</button>;})}
      </div>
      <label className="field-label" style={{display:"block",marginBottom:5}}>Redacción del precio</label>
      <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={syncTexto} style={{width:"100%",minHeight:86,padding:"9px 10px",boxSizing:"border-box",resize:"vertical",overflowY:"auto",border:"1px solid var(--border2)",borderRadius:8,background:"var(--input)",color:"var(--text)",lineHeight:1.5,outline:"none"}} />
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
        <button type="button" onMouseDown={function(e){e.preventDefault();}} onClick={function(){insertarToken("moneda_txt");}} style={{padding:"6px 9px",borderRadius:8,border:"1px solid rgba(89,199,243,.4)",background:"rgba(89,199,243,.1)",color:"#59c7f3",fontWeight:800,cursor:"pointer",fontSize:12}}>Moneda</button>
        <button type="button" onMouseDown={function(e){e.preventDefault();}} onClick={function(){insertarToken("precio_letras");}} style={{padding:"6px 9px",borderRadius:8,border:"1px solid rgba(89,199,243,.4)",background:"rgba(89,199,243,.1)",color:"#59c7f3",fontWeight:800,cursor:"pointer",fontSize:12}}>Precio en letras</button>
      </div>
      <TokensProtegidosDocWorks tokens={["moneda_txt","precio_letras"]} compact={true}/>
      <div style={{fontSize:12,color:"var(--dim)",marginTop:5}}>Los campos celestes son automáticos. Si eliminás uno, el texto queda intacto y DocWorks te va a pedir que lo vuelvas a insertar.</div>
      {status==="missing"&&<div style={{marginTop:8,padding:"8px 9px",borderRadius:8,border:"1px solid rgba(240,170,60,.35)",background:"rgba(240,170,60,.08)",color:"var(--text)",fontSize:12}}>
        <b>Falta completar este documento:</b> {faltantes.map(function(k){return <button key={k} type="button" onClick={function(){insertarToken(k);}} style={{marginLeft:6,marginTop:4,padding:"5px 8px",borderRadius:7,border:"1px solid rgba(89,199,243,.4)",background:"rgba(89,199,243,.1)",color:"#59c7f3",fontWeight:800,cursor:"pointer"}}>Insertar {k==="moneda_txt"?"Moneda":"Precio en letras"}</button>;})}
      </div>}
      <label className="field-label" style={{display:"block",marginTop:9,marginBottom:5}}>Título de la cláusula</label>
      <input className="inp" value={titulo} onChange={function(e){setTitulo(e.target.value);}} />
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginTop:10}}>
        <div style={{fontSize:12,color:status==="error"?"var(--red)":"var(--dim)"}}>{status==="saving"?"Guardando…":status==="saved"?"Guardado ✓":status==="error"?"No se pudo guardar. Intentá de nuevo.":status==="missing"?"Antes de guardar, insertá los campos que faltan.":""}</div>
        <div style={{display:"flex",gap:7}}><Btn s="sm" v="ghost" onClick={onCancel}>Cancelar</Btn><Btn s="sm" onClick={guardar} disabled={status==="saving"}>Guardar</Btn></div>
      </div>
    </div>
  );
}

var PRECIO_NARRATIVAS_PRESET = [
  {label:"Estándar", texto:"El Oferente ofrece la suma de {{precio_letras}} para la compra del Inmueble, en adelante el Precio.-"},
  {label:"Precio total", texto:"El precio total de la operación se fija en {{precio_letras}}, que las partes reconocen como justo y conveniente.-"},
  {label:"Oferta", texto:"El Oferente formula oferta por {{precio_letras}} para la adquisición del Inmueble.-"},
  {label:"Más breve", texto:"Precio ofrecido: {{precio_letras}}.-"}
];

function HistorialClausulaModal({titulo,source,entidadTipo=undefined,entidadId=undefined,historial=undefined,actual,onRestore,onClose}){
  const [loading,setLoading]=useState(source==="auditoria");
  const [error,setError]=useState(null);
  const [entries,setEntries]=useState([]);
  const [restoring,setRestoring]=useState(false);
  function firma(v){return String(v&&v.titulo||"")+"\u0000"+String(v&&v.contenido||"");}
  useEffect(function(){
    if(source!=="auditoria") {var local=Array.isArray(historial)?historial.slice().sort(function(a,b){return String(b.fecha||"").localeCompare(String(a.fecha||""));}):[];if(local.length&&actual)local.unshift({id:"actual",fecha:null,usuario:"Estado actual",titulo:String(actual.titulo||""),contenido:String(actual.contenido||""),activo:actual.activo!==false,orden:actual.orden,tipoVersion:"actual",restaurable:false});setEntries(local);setLoading(false);return;}
    var vivo=true;setLoading(true);setError(null);
    loadSupabaseJs().then(function(sb){
      if(!sb)throw new Error("No se pudo conectar con Supabase para leer el historial.");
      return sb.from("auditoria").select("id,accion,entidad_tipo,entidad_id,valor_anterior,valor_nuevo,creada_en,usuarios!auditoria_usuario_id_fkey(nombre,email,rol_base)").eq("entidad_tipo",entidadTipo).eq("entidad_id",String(entidadId)).eq("accion","editar").order("creada_en",{ascending:false}).limit(100);
    }).then(function(res){if(!vivo)return;if(res&&res.error)throw res.error;var rows=(res&&res.data)||[];var out=[];rows.forEach(function(r){var u=r.usuarios||{};var nuevo=r.valor_nuevo&&typeof r.valor_nuevo==="object"?r.valor_nuevo:{};var anterior=r.valor_anterior&&typeof r.valor_anterior==="object"?r.valor_anterior:{};if(nuevo.titulo!==undefined||nuevo.contenido!==undefined)out.push({id:String(r.id)+"-nuevo",fecha:r.creada_en,usuario:u.nombre||u.email||"Usuario sin nombre",titulo:String(nuevo.titulo||""),contenido:String(nuevo.contenido||""),tipoVersion:"nuevo",restaurable:true});if(anterior.titulo!==undefined||anterior.contenido!==undefined)out.push({id:String(r.id)+"-anterior",fecha:r.creada_en,usuario:u.nombre||u.email||"Usuario sin nombre",titulo:String(anterior.titulo||""),contenido:String(anterior.contenido||""),tipoVersion:"anterior",restaurable:true});});out.sort(function(a,b){var d=String(b.fecha||"").localeCompare(String(a.fecha||""));if(d)return d;return a.tipoVersion==="nuevo"?-1:1;});var vistos={};out=out.filter(function(v){var k=String(v.fecha||"")+"|"+firma(v);if(vistos[k])return false;vistos[k]=true;return true;});if(actual&&out.length&&!out.some(function(v){return firma(v)===firma(actual)&&v.tipoVersion==="actual";}))out.unshift({id:"actual",fecha:null,usuario:"Estado actual",titulo:String(actual.titulo||""),contenido:String(actual.contenido||""),tipoVersion:"actual",restaurable:false});setEntries(out);setLoading(false);}).catch(function(e){if(!vivo)return;setLoading(false);setError("No se pudo leer el historial de auditoría. Es posible que tu rol no tenga permiso para consultar esta información. Detalle: "+String(e&&e.message||"error de acceso"));});
    return function(){vivo=false;};
  },[source,entidadTipo,entidadId,JSON.stringify(historial||[]),JSON.stringify(actual||{})]);
  async function restaurar(v){if(!v||!v.restaurable||typeof onRestore!=="function")return;setRestoring(true);try{var r=await onRestore(v);if(r&&r.error)throw r.error;dwNotify("success","Se solicitó restaurar la versión. El cambio queda registrado mediante el guardado habitual.");onClose();}catch(e){setError("No se pudo restaurar esta versión. "+String(e&&e.message||"Revisá los permisos y la conexión."));}finally{setRestoring(false);}}
  return <div role="dialog" aria-modal="true" aria-label={"Historial de cláusula: "+(titulo||"")} style={{position:"fixed",inset:0,zIndex:10050,background:"rgba(4,10,20,.72)",display:"flex",alignItems:"center",justifyContent:"center",padding:12}} onMouseDown={function(e){if(e.target===e.currentTarget)onClose();}}><div style={{width:"min(680px,100%)",maxHeight:"88dvh",overflowY:"auto",background:"var(--card)",color:"var(--text)",border:"1px solid var(--border)",borderRadius:16,padding:16,boxShadow:"0 18px 60px rgba(0,0,0,.35)",boxSizing:"border-box"}}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:12}}><div style={{minWidth:0}}><div style={{fontFamily:"DM Serif Display,serif",fontSize:18}}>Historial de cláusula</div><div style={{fontSize:12,color:"var(--dim)",marginTop:4,overflowWrap:"anywhere"}}>{titulo||"Cláusula sin título"}</div></div><button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Cerrar historial">✕</button></div>{loading&&<div style={{fontSize:12,color:"var(--dim)",padding:12}}>Cargando historial…</div>}{error&&<div role="alert" style={{padding:10,borderRadius:8,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.25)",color:"var(--red)",fontSize:12,marginBottom:10}}>{error}</div>}{!loading&&!error&&entries.length===0&&<div style={{padding:18,textAlign:"center",border:"1px dashed var(--border)",borderRadius:10,fontSize:12,color:"var(--dim)"}}>Sin cambios registrados.{source==="auditoria"?" Si esperabas ver versiones, revisá los permisos de lectura de auditoría para este rol.":""}</div>}{!loading&&entries.map(function(v){var esActual=v.tipoVersion==="actual";return <div key={v.id} style={{border:"1px solid "+(esActual?"rgba(212,168,83,.55)":"var(--border)"),borderRadius:10,padding:11,marginBottom:8,background:esActual?"rgba(212,168,83,.06)":"transparent"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginBottom:6}}><div style={{fontSize:12,fontWeight:750}}>{v.fecha?new Date(v.fecha).toLocaleString("es-AR",{dateStyle:"medium",timeStyle:"short"}):"Estado actual"} · {v.usuario||"—"}</div>{esActual&&<span className="badge badge-gold">Versión actual</span>}</div><div style={{fontSize:12.5,fontWeight:700,marginBottom:4,overflowWrap:"anywhere"}}>{v.titulo||"Cláusula sin título"}</div><div style={{fontSize:12,lineHeight:1.55,color:"var(--muted)",whiteSpace:"pre-wrap",overflowWrap:"anywhere",maxHeight:150,overflowY:"auto"}}>{v.contenido||"(Sin contenido)"}</div>{!esActual&&v.restaurable&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:9}}><button type="button" className="btn btn-secondary btn-sm" disabled={restoring} onClick={function(){requestDwConfirm("¿Restaurar esta versión de la cláusula? Se guardará mediante el mecanismo habitual y quedará registrada como un nuevo cambio.",function(){restaurar(v);});}}>Restaurar esta versión</button></div>}</div>;})}<div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}><button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cerrar</button></div></div></div>;
}

function ReservaBloquesPanel({bloques, onUpdate, onMove, clausulasLib, operaciones, puedeEditar, perfil, onSavePerfil, previewOpen, onPreviewChange, puedeVerHistorial, onAgregarClausula}){
  const [editId,setEditId]=useState(null);
  const [precioEditando,setPrecioEditando]=useState(false);
  const [historialSeleccionado,setHistorialSeleccionado]=useState(null);
  const [probarAbierto,setProbarAbierto]=useState(false);
  const [modoVistaClausulas,setModoVistaClausulas]=useState("simple");
  const [clausulasAbiertas,setClausulasAbiertas]=useState({});
  var previewVisible=typeof previewOpen==="boolean"?previewOpen:probarAbierto;
  function togglePreview(){if(typeof onPreviewChange==="function")onPreviewChange(!previewVisible);else setProbarAbierto(!previewVisible);}
  const [draft,setDraft]=useState({titulo:"",contenido:""});
  var bloquesSeguros=Array.isArray(bloques)?bloques:[];
  var ordenados=bloquesSeguros.filter(function(b){return b&&typeof b==="object";}).map(function(b){
    var base=normalizarBodyBlock(b,0);
    var def=(typeof DEFAULT_BLOQUES_RESERVA!=="undefined"&&Array.isArray(DEFAULT_BLOQUES_RESERVA))?DEFAULT_BLOQUES_RESERVA.find(function(x){return x.id===base.id;}):null;
    if(!String(base.titulo||"").trim()&&def&&String(def.titulo||"").trim()) base.titulo=def.titulo;
    return base;
  }).sort(function(a,b){return (Number(a.orden)||0)-(Number(b.orden)||0);});
  var opEjemploReserva=Object.assign({},SAMPLE_OP_PREVIEW,{id:"EJEMPLO-NO-GUARDAR",tipo:"reserva",created_at:"2026-10-17T12:00:00.000Z",inmueble_direccion:"EJEMPLO · Av. del Libertador 5678",reserva_vigencia_dias:"30",reserva_aceptacion_dias:"5",reserva_aceptacion_modo:"dias",reserva_incluye_refuerzo:false});
  var clausulasPruebaReserva=ordenados.map(function(b){return editId===b.id?Object.assign({},b,{titulo:draft.titulo,contenido:draft.contenido}):b;});
  var docEjemploReserva=previewVisible?aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(opEjemploReserva),clausulasLib||[],"reserva",clausulasPruebaReserva),opEjemploReserva,"reserva",perfil||{}):null;
  var analisisEjemploReserva=docEjemploReserva?analizarDatosObligatorios(docEjemploReserva,"reserva",opEjemploReserva):null;
  var textoEjemploReserva=docEjemploReserva?docToPlainText(docEjemploReserva):"";
  if(textoEjemploReserva){textoEjemploReserva=textoEjemploReserva.replace(/(^|\n)\s*1\.\s*PRECIO\b/m,"$1 1. CLÁUSULA PRECIO").replace(/(^|\n)\s*7\.\s*SEÑA Y CONSECUENCIAS DEL INCUMPLIMIENTO\b/m,"$1 7. SEÑA Y CONSECUENCIAS DEL INCUMPLIMIENTO");}
  var tokensEjemploReserva=docEjemploReserva?getTokensSinReemplazar(docEjemploReserva):[];

  function abrirEditor(b){
    if(!b||!puedeEditar||editId) return;
    var esPrecio = b.id === "reserva.precio";
    setPrecioEditando(esPrecio);
    setEditId(b.id);
    setDraft({titulo:String(b.titulo||""),contenido:String(b.contenido||"")});
  }
  function cancelarEdicion(){setEditId(null);setDraft({titulo:"",contenido:""});}
  function defDeBloque(id){ return DEFAULT_BLOQUES_RESERVA.find(function(x){return x.id===id;}); }
  function restaurarBloqueReserva(b){
    var def=defDeBloque(b.id);
    if(!def){ dwNotify("info","Esta cláusula es propia: no tiene una versión de fábrica para restaurar."); return; }
    requestDwConfirm("¿Restaurar solo la cláusula «"+def.titulo+"» a la versión de fábrica?",function(){ onUpdate(b.id,{titulo:def.titulo,contenido:def.contenido}); cancelarEdicion(); });
  }
  async function restaurarTodosReserva(){
    requestDwConfirm("¿Restaurar TODAS las cláusulas de la Reserva a la versión de fábrica? Se guardará una copia del modelo actual para poder deshacer esta acción.",async function(){
      var snapshot={fecha:new Date().toISOString(),clausulas:ordenados.map(function(b,i){return {id:b.id,titulo:String(b.titulo||""),contenido:String(b.contenido||""),activo:b.activo!==false,orden:Number(b.orden)||i+1};})};
      try{
        if(typeof onSavePerfil==="function"){
          var mapa=Object.assign({},perfil&&perfil.plantillas||{}),actual=Object.assign({},mapa.reserva||{});actual.restauracionAnterior=snapshot;
          var guardado=await onSavePerfil(Object.assign({},perfil,{plantillas:Object.assign({},mapa,{reserva:actual})}));
          if(guardado&&guardado.error)throw guardado.error;
        }
        for(var i=0;i<ordenados.length;i++){var b=ordenados[i],def=defDeBloque(b.id);if(def){var r=await onUpdate(b.id,{titulo:def.titulo,contenido:def.contenido});if(r&&r.error)throw r.error;}}
        // Las cláusulas de Reserva se ordenan con la API existente; no se altera su esquema.
        var restaurados=ordenados.slice().sort(function(a,b){return (Number(a.orden)||0)-(Number(b.orden)||0);});
        for(var j=0;j<restaurados.length;j++){var objetivo=j;var actualOrden=restaurados.findIndex(function(x){return x.id===ordenados[j].id;});if(actualOrden!==j&&onMove)await onMove(ordenados[j].id,actualOrden>j?"up":"down");}
        cancelarEdicion();
      }catch(e){dwNotify("error","No se pudo guardar la copia o restaurar todas las cláusulas. No se pudo completar la acción.");}
    });
  }
  async function deshacerRestauracionReserva(){
    var snap=perfil&&perfil.plantillas&&perfil.plantillas.reserva&&perfil.plantillas.reserva.restauracionAnterior;
    if(!snap||!Array.isArray(snap.clausulas))return;
    requestDwConfirm("¿Deshacer la restauración y recuperar el modelo anterior de Reserva?",async function(){
      try{
        for(var i=0;i<snap.clausulas.length;i++){var old=snap.clausulas[i],r=await onUpdate(old.id,{titulo:old.titulo,contenido:old.contenido});if(r&&r.error)throw r.error;}
        var ordenActual=(bloques||[]).slice().sort(function(a,b){return (Number(a.orden)||0)-(Number(b.orden)||0);});
        for(var j=0;j<snap.clausulas.length;j++){var target=snap.clausulas[j],idx=ordenActual.findIndex(function(x){return x.id===target.id;});if(idx>=0&&idx!==j&&onMove){await onMove(target.id,idx>j?"up":"down");var item=ordenActual.splice(idx,1)[0];ordenActual.splice(j,0,item);}}
        if(typeof onSavePerfil==="function"){var mapa=Object.assign({},perfil.plantillas||{}),actual=Object.assign({},mapa.reserva||{});delete actual.restauracionAnterior;var r2=await onSavePerfil(Object.assign({},perfil,{plantillas:Object.assign({},mapa,{reserva:actual})}));if(r2&&r2.error)throw r2.error;}
        cancelarEdicion();
      }catch(e){dwNotify("error","No se pudo recuperar el modelo anterior de Reserva. Revisá la conexión e intentá nuevamente.");}
    });
  }
  function guardarEdicion(){
    if(!puedeEditar||editId===null||editId===undefined||editId==="") return;
    try{
      var original=ordenados.find(function(x){return x.id===editId;});
      var requeridos=tokensDeTextoDocWorks((original&&original.contenido)||"");
      var contenido=String(draft.contenido||"");
      requeridos.forEach(function(k){
        var token="{{"+k+"}}";
        if(!new RegExp("\\{\\{\\s*"+k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\s*\\}\\}").test(contenido)){
          contenido += (/\s$/.test(contenido)?"":" ")+token;
        }
      });
      Promise.resolve(onUpdate(editId,{titulo:String(draft.titulo||""),contenido:contenido})).then(function(res){
        if(res&&res.error){dwNotify("error","No se guardó la cláusula en Supabase. Revisá tus permisos o la conexión.");return;}
        cancelarEdicion();
      }).catch(function(){dwNotify("error","No se guardó la cláusula en Supabase. Revisá la conexión e intentá nuevamente.");});
    }catch(e){ dwNotify("error","No se pudo preparar la cláusula para guardar. Revisá el contenido e intentá nuevamente."); }
  }

  return (
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
        <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",margin:0}}>Modelo del documento · Reserva</p>
      </div>
      <div style={{fontSize:12,color:"var(--dim)",marginBottom:12,lineHeight:1.5}}>
        {puedeEditar?"Editá el texto de cada cláusula.":"Consultá el modelo del documento en modo de solo lectura."} Las variables entre llaves siguen conectadas a Operaciones y el PDF/Word utilizan estas cláusulas. · {ordenados.length} cláusula{ordenados.length===1?"":"s"}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:6,flexWrap:"wrap",marginBottom:8}}>{puedeEditar&&<><button type="button" onClick={restaurarTodosReserva} className="btn btn-ghost btn-sm">↺ Restaurar todas las cláusulas</button>{perfil&&perfil.plantillas&&perfil.plantillas.reserva&&perfil.plantillas.reserva.restauracionAnterior&&<button type="button" onClick={deshacerRestauracionReserva} className="btn btn-secondary btn-sm">Deshacer restauración</button>}</>}</div>
      {puedeEditar&&<div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",padding:"10px 12px",border:"1px solid var(--border)",borderRadius:10,background:"var(--card)",marginBottom:12}}><button type="button" className="btn btn-primary btn-sm" onClick={onAgregarClausula}>＋ Agregar cláusula</button><span style={{fontSize:12,color:"var(--dim)",lineHeight:1.45}}>Agregá una cláusula opcional desde la biblioteca. Las cláusulas obligatorias existentes se editan acá.</span></div>}
      {previewVisible&&createPortal(<div role="dialog" aria-modal="true" aria-label="Vista previa del modelo" data-testid="dw-fullpage-preview" style={{position:"fixed",inset:0,zIndex:10050,background:"rgba(8,16,30,.88)",overflowY:"auto",overscrollBehavior:"contain",padding:"max(64px,calc(env(safe-area-inset-top) + 52px)) 12px max(20px,env(safe-area-inset-bottom))"}}><button type="button" data-testid="dw-preview-fixed-close" onClick={togglePreview} aria-label="Cerrar vista previa" style={{position:"fixed",top:"max(10px,env(safe-area-inset-top))",right:"max(12px,env(safe-area-inset-right))",zIndex:10052,width:44,height:44,borderRadius:14,border:"1px solid rgba(255,255,255,.28)",background:"#fff",color:"#142a4d",fontSize:25,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 18px rgba(0,0,0,.3)"}}>×</button><div style={{maxWidth:820,margin:"0 auto",background:"#fff",color:"#1f2937",borderRadius:8,boxShadow:"0 18px 65px rgba(0,0,0,.35)",padding:"clamp(18px,5vw,52px)",minHeight:"min(100vh,1050px)",boxSizing:"border-box"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:22,borderBottom:"1px solid #e5e7eb",paddingBottom:12}}><strong style={{fontSize:14}}>Vista previa · Datos de ejemplo</strong><button type="button" className="btn btn-secondary btn-sm" onClick={togglePreview} aria-label="Cerrar desde el documento">✕ Cerrar</button></div><div style={{fontSize:12,fontWeight:800,color:"#59c7f3",marginBottom:5}}>VISTA PREVIA CON DATOS DE EJEMPLO · EJEMPLO FICTICIO</div><div style={{fontSize:11.5,color:"var(--dim)",marginBottom:9}}>Solo lectura: usa el constructor del documento con las cláusulas visibles en memoria. No guarda, no modifica operaciones y no exporta el ejemplo.</div>{analisisEjemploReserva&&(analisisEjemploReserva.faltaFormulario.length||analisisEjemploReserva.faltaPlantilla.length||analisisEjemploReserva.tokensNoResueltos.length)?<div style={{marginBottom:9,padding:9,borderRadius:8,background:"rgba(248,113,113,.07)",border:"1px solid rgba(248,113,113,.2)"}}><div style={{fontSize:12,fontWeight:800,color:"var(--red)",marginBottom:4}}>Datos faltantes / avisos</div>{analisisEjemploReserva.faltaFormulario.concat(analisisEjemploReserva.faltaPlantilla).map(function(x,i){return <div key={x.token+"-"+i} style={{fontSize:12,marginTop:3}}>• {x.mensaje}</div>;})}{analisisEjemploReserva.tokensNoResueltos.map(function(x,i){return <div key={x.token+"-r-"+i} style={{fontSize:12,color:"var(--red)",marginTop:3}}>• {x.mensaje}</div>;})}</div>:<div style={{fontSize:12,color:"var(--green)",marginBottom:9}}>✓ Los datos obligatorios configurados aparecen en el documento de ejemplo.</div>}{tokensEjemploReserva.length>0&&<div style={{fontSize:12,color:"var(--red)",marginBottom:8}}>Tokens sin resolver: {tokensEjemploReserva.join(", ")}</div>}<div style={{padding:11,background:"#fff",color:"#1f2937",borderRadius:8,border:"1px solid #d1d5db",fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{textoEjemploReserva.split(/(\{\{[^}]+\}\})/g).map(function(part,i){return /\{\{[^}]+\}\}/.test(part)?<span key={i} style={{background:"#fee2e2",color:"#b91c1c",fontWeight:800,borderRadius:3,padding:"0 2px"}}>{part}</span>:<span key={i}>{part}</span>;})}</div></div></div>,document.body)}

      {ordenados.length===0&&(
        <div style={{padding:"12px",borderRadius:9,border:"1px solid var(--border)",color:"var(--dim)",fontSize:12}}>
          Todavía no hay cláusulas de Reserva disponibles. La API actual permite listar, editar y reordenar cláusulas activas, pero no crear ni reactivar las inactivas. Para habilitarlo hace falta aplicar la migración SQL incluida con esta versión.
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",margin:"8px 0 10px"}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>Cláusulas del modelo</div><div role="group" aria-label="Elegir vista de cláusulas" style={{display:"inline-flex",gap:3,padding:3,border:"1px solid var(--border)",borderRadius:9,background:"var(--card2, var(--card))"}}><button type="button" aria-pressed={modoVistaClausulas==="simple"} onClick={function(){setModoVistaClausulas("simple");setClausulasAbiertas({});}} style={{border:0,borderRadius:6,padding:"6px 9px",fontSize:11.5,fontWeight:modoVistaClausulas==="simple"?750:500,background:modoVistaClausulas==="simple"?"var(--surface2)":"transparent",color:"var(--text)",cursor:"pointer"}}>Hoja compacta</button><button type="button" aria-pressed={modoVistaClausulas==="abierta"} onClick={function(){setModoVistaClausulas("abierta");}} style={{border:0,borderRadius:6,padding:"6px 9px",fontSize:11.5,fontWeight:modoVistaClausulas==="abierta"?750:500,background:modoVistaClausulas==="abierta"?"var(--surface2)":"transparent",color:"var(--text)",cursor:"pointer"}}>Vista detallada</button></div></div>
      {ordenados.map(function(b,idx){
        var esPrimera=idx===0, esUltima=idx===ordenados.length-1;
        var numeroClausulaActiva=(b.activo===false||b.obligatoria!==true)?null:ordenados.slice(0,idx+1).filter(function(x){return x.activo!==false&&x.obligatoria===true;}).length;
        var editando=editId===b.id;
        var filaAbierta=modoVistaClausulas==="abierta"?clausulasAbiertas[b.id]!==false:!!clausulasAbiertas[b.id];
        return (
          <div key={String(b.id||idx)} className={"dw-reserva-clause "+(modoVistaClausulas==="simple"?"dw-reserva-compact":"dw-reserva-detail")+(filaAbierta?" dw-reserva-open":"")} style={{padding:modoVistaClausulas==="simple"?"6px 8px":"10px 12px",borderRadius:9,border:"1px solid var(--border2)",marginBottom:4,background:"var(--card)"}}>
            <div style={{display:"flex",alignItems:"center",flexWrap:modoVistaClausulas==="simple"?"nowrap":"wrap",gap:8,minWidth:0}}>
              <div style={{flex:"1 1 220px",minWidth:0,display:"flex",flexDirection:"column",alignItems:"stretch",gap:6}}>
                <button type="button" onClick={function(){setClausulasAbiertas(function(prev){var next=Object.assign({},prev);next[b.id]=!filaAbierta;return next;});}} aria-expanded={filaAbierta} style={{display:"flex",alignItems:"center",gap:6,flexWrap:"nowrap",padding:0,border:0,background:"transparent",color:"inherit",textAlign:"left",cursor:"pointer",minWidth:0,maxWidth:"100%",overflow:"hidden"}}>
                  <span style={{display:"inline-flex",alignItems:"center",flexWrap:"nowrap",gap:6,minWidth:0,overflow:"hidden"}}><span style={{fontSize:10.5,fontWeight:750,color:b.activo===false?"var(--dim)":"var(--gold)",border:"1px solid "+(b.activo===false?"var(--border)":"rgba(212,168,83,.35)"),borderRadius:6,padding:"2px 5px",whiteSpace:"nowrap",flexShrink:0}}>{numeroClausulaActiva===null?"—":"Cláusula "+numeroClausulaActiva}</span><span style={{fontSize:12.5,fontWeight:600,color:"var(--text)",whiteSpace:modoVistaClausulas==="simple"?"nowrap":"normal",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,display:"block",maxWidth:"100%"}}>{String(b.titulo||"").trim()||"Cláusula sin título"}</span></span>
                  {b.obligatoria&&<span className="dw-essential-label dw-essential-label-soft"><span aria-hidden="true">🔒</span><span>Obligatoria</span></span>}
                  {!!b.condicion&&modoVistaClausulas!=="simple"&&<span className="badge badge-tipo">Condicional</span>}
                  {b.condicion==="moneda_usd"&&<span className="badge badge-tipo">Solo si USD</span>}
                  {(b.id==="reserva.refuerzo"||b.id==="alquiler.seguro")&&modoVistaClausulas!=="simple"&&<span className="badge badge-tipo">Opcional · se activa en la operación</span>}
                  <span style={{fontSize:11,color:"var(--dim)"}}><span className={"dw-clause-chevron "+(filaAbierta?"is-open":"")} aria-hidden="true"><span>⌄</span></span></span>
                </button>
                {!editando&&filaAbierta&&<div style={{fontSize:12,color:"var(--muted)",marginTop:6,lineHeight:1.5,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{mostrarTokensDocWorks(String(b.contenido||""))}</div>}
              </div>
              {!editando&&(puedeEditar||puedeVerHistorial)&&(
                <div className="dw-reserva-clause-actions" style={{display:modoVistaClausulas==="simple"&&!filaAbierta?"none":"flex",gap:3,flex:"0 1 auto",flexWrap:"wrap",justifyContent:"flex-start",maxWidth:"100%"}}>
                  {puedeVerHistorial&&<button type="button" onClick={function(){setHistorialSeleccionado(b);}} title="Historial de la cláusula" style={{padding:"4px 6px",borderRadius:6,background:"transparent",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:10.5,whiteSpace:"nowrap"}}>Historial</button>}
                  {puedeEditar&&<><button type="button" onClick={function(){restaurarBloqueReserva(b);}} title="Restaurar esta cláusula a la versión de fábrica" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:12}}>↺</button>
                  {esClausulaEsencialModelo(b)?<span title="Este apartado forma parte de la estructura esencial del documento y solo se puede editar, no desactivar." style={{fontSize:10.5,padding:"5px 7px",borderRadius:6,border:"1px solid var(--border)",color:"var(--muted)",whiteSpace:"nowrap"}}>🔒 Esencial</span>:<select aria-label={"Estado de la cláusula "+(b.titulo||"")} value={b.activo===false?"apagada":(b.id==="reserva.refuerzo"||b.id==="alquiler.seguro")&&b.obligatoria!==true?"asesor":b.obligatoria===true?"obligatoria":"apagada"} onChange={function(e){var estado=e.target.value;var cambios=estado==="apagada"?{activo:false}:estado==="asesor"?{activo:true,obligatoria:false}:{activo:true,obligatoria:true};Promise.resolve(onUpdate(b.id,cambios)).then(function(r){if(r&&r.error)dwNotify("error","No se pudo actualizar el estado de la cláusula.");}).catch(function(){dwNotify("error","No se pudo actualizar el estado de la cláusula.");});}} style={{maxWidth:145,minWidth:0,width:"100%",fontSize:10.5,padding:"4px 3px",borderRadius:6,border:"1px solid var(--border2)",background:"var(--card)",color:"var(--text)"}}><option value="obligatoria">Obligatoria</option><option value="asesor" disabled={b.id!=="reserva.refuerzo"&&b.id!=="alquiler.seguro"}>Opcional</option><option value="apagada">Apagada</option></select>}<button type="button" onClick={function(){if(!esPrimera&&onMove)onMove(b.id,"up");}} disabled={esPrimera} title="Subir" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:esPrimera?"var(--border2)":"var(--muted)",cursor:esPrimera?"default":"pointer",fontSize:12}}>↑</button>
                  <button type="button" onClick={function(){if(!esUltima&&onMove)onMove(b.id,"down");}} disabled={esUltima} title="Bajar" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:esUltima?"var(--border2)":"var(--muted)",cursor:esUltima?"default":"pointer",fontSize:12}}>↓</button>
                  <button type="button" onClick={function(){abrirEditor(b);}} title="Editar" style={{border:"1px solid var(--border)",background:"rgba(255,255,255,0.04)",color:"var(--muted)",borderRadius:6,padding:"4px 7px",cursor:"pointer",fontSize:12,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><DWIcon name="edit" size={14}/></button></>}
                </div>
              )}
            </div>

            {editando&&(b.id==="reserva.precio"&&precioEditando ? (
              <PrecioNarrativaEditor bloque={b} onSave={function(cambios){return onUpdate(editId,cambios);}} onCancel={cancelarEdicion} />
            ) : (
              <div style={{marginTop:8,paddingTop:8,borderTop:"1px dashed var(--border2)"}}>
                <label className="field" style={{display:"block",marginBottom:8}}><span className="field-label">Título de la cláusula</span><input className="inp" value={draft.titulo} onChange={function(e){setDraft(function(d){return Object.assign({},d,{titulo:e.target.value});});}} /></label>
                <label className="field" style={{display:"block",marginBottom:8}}><span className="field-label">Contenido</span><textarea className="inp" rows={7} value={draft.contenido} onChange={function(e){setDraft(function(d){return Object.assign({},d,{contenido:e.target.value});});}} style={{width:"100%",boxSizing:"border-box",resize:"vertical"}} /></label>
                <TokensProtegidosDocWorks tokens={tokensDeTextoDocWorks((b.contenido||""))} compact={true} />
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button type="button" onClick={cancelarEdicion} className="btn btn-ghost btn-sm">Cancelar</button>
                  <button type="button" onClick={guardarEdicion} className="btn btn-primary btn-sm">Guardar</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
      {ordenados.some(function(b){return !!b.condicion;})&&<div style={{fontSize:11.5,color:"var(--dim)",padding:"8px 10px",borderRadius:8,background:"rgba(212,168,83,.06)",border:"1px solid rgba(212,168,83,.18)",marginTop:6}}>El número en el documento final puede cambiar si una cláusula condicional no aplica.</div>}
      {historialSeleccionado&&<HistorialClausulaModal titulo={historialSeleccionado.titulo} source="auditoria" entidadTipo="bloque" entidadId={historialSeleccionado._dbId||historialSeleccionado.id} actual={historialSeleccionado} onClose={function(){setHistorialSeleccionado(null);}} onRestore={function(v){return onUpdate(historialSeleccionado.id,{titulo:v.titulo,contenido:v.contenido});}}/>}
    </div>
  );
}
const ESTADO_BADGE_CLS={borrador:"badge-borrador",activo:"badge-activo",cerrado:"badge-cerrado"};



// Un borrador "significativo" es aquel donde el usuario ya cargó al menos un
// dato real (más allá de los valores por defecto de EMPTY_OP). Sirve para no
// ofrecer recuperar un formulario que se abrió y cerró sin tocar nada.
function draftTieneContenido(d) {
  if (!d) return false;
  // Cambiar solo el tipo o abrir un formulario no constituye contenido real.
  // Se comparan los valores con EMPTY_OP para ignorar defaults heredados (p. ej. comisiones/plazos).
  var campos = [
    "comprador_nombre","vendedor_nombre","locador_nombre","locatario_nombre",
    "comodatario_nombre","comodante_nombre","autorizante_nombre","inmobiliaria_nombre",
    "inmueble_direccion","inmueble_partido","inmueble_provincia","precio",
    "anticipo","fecha_posesion","alquiler_monto_inicial","alquiler_inicio",
    "entrega_aires_detalle","entrega_muebles_detalle",
    "res_alq_monto_reserva","res_alq_monto_mensual","res_alq_inicio_estimado",
    "comodato_plazo","comodato_uso","devolucion_motivo","refuerzo_trayectoria",
    "comprador_dni","vendedor_dni","locador_dni","locatario_dni",
    "comodatario_dni","comodante_dni","autorizante_dni","dni","cuit",
    "comprador_email","vendedor_email","locador_email","locatario_email",
    "comprador_telefono","vendedor_telefono","locador_telefono","locatario_telefono",
  ];
  function tieneValor(v) {
    if(v===undefined || v===null) return false;
    if(typeof v==="string") {
      var t=v.trim();
      return t!=="" && !/^(?:seleccionar|seleccione|—|--|___|n\/?a)$/i.test(t);
    }
    if(typeof v==="number") return Number.isFinite(v) && v!==0;
    if(typeof v==="boolean") return v;
    if(Array.isArray(v)) return v.length>0;
    return false;
  }
  if(campos.some(function(c){
    if(!tieneValor(d[c])) return false;
    var def=EMPTY_OP && EMPTY_OP[c];
    return String(d[c])!==String(def==null?"":def);
  })) return true;
  // Campos de usuario fuera de la lista explícita: solo cuentan si difieren del default.
  var metadatosIgnorados={tipo:true,estado:true,id:true,parent_id:true,created_at:true,updated_at:true,plantilla_version:true,clausulas_ids:true,tareas_done:true,tareas_custom:true};
  if(Object.keys(d).some(function(k){
    if(metadatosIgnorados[k] || !( /nombre|dni|cuit|cuil|email|e_mail|correo|telefono|teléfono|celular|mobile|phone|direccion|domicilio|precio|monto|fecha|plazo|uso|motivo|partido|provincia/i.test(k))) return false;
    if(!tieneValor(d[k])) return false;
    var def=EMPTY_OP && EMPTY_OP[k];
    return String(d[k])!==String(def==null?"":def);
  })) return true;
  // Los formularios no comparten exactamente los mismos nombres para datos
  // personales. Detectamos también DNI/CUIT, email y teléfono aunque el resto
  // del borrador esté vacío, sin considerar valores de configuración genéricos.
  if(Object.keys(d).some(function(k){
    return /(?:dni|cuit|cuil|email|e_mail|correo|telefono|teléfono|celular|mobile|phone|contacto)/i.test(k) && tieneValor(d[k]);
  })) return true;
  // Las cláusulas precargadas por el modelo no son datos ingresados por el broker.
  // Elegir un tipo y recorrer el asistente nunca crea un borrador por sí solo.
  return false;
}

// ── CENTRO DE TAREAS ──────────────────────────────────────────────────────────
// Checklist operativo por operación (no legal, solo gestión interna del
// broker). op.tareas_done guarda {tareaId:true} — sparse, así que agregar o
// reordenar tareas acá no rompe operaciones ya creadas.
var TAREAS_DEFAULT = {
  alquiler: [
    ["dni_prop","Pedir DNI del titular"],
    ["dni_inq","Pedir DNI inquilino"],
    ["garantia","Verificar garantía"],
    ["informe_dominio","Solicitar informe de dominio"],
    ["prep_contrato","Preparar contrato"],
    ["enviar_contrato","Enviar contrato"],
    ["coordinar_firma","Coordinar firma"],
    ["entregar_llaves","Entregar llaves"],
  ],
  compra: [
    ["dni_comp","Pedir DNI comprador"],
    ["dni_vend","Pedir DNI vendedor"],
    ["informe_dominio","Solicitar informe de dominio"],
    ["deudas","Verificar deudas y expensas"],
    ["prep_doc","Preparar documento"],
    ["enviar_doc","Enviar documento"],
    ["coordinar_firma","Coordinar firma"],
    ["entrega_posesion","Coordinar entrega de posesión"],
  ],
  otros: [
    ["dni_partes","Pedir DNI de las partes"],
    ["prep_doc","Preparar documento"],
    ["enviar_doc","Enviar documento"],
    ["coordinar_firma","Coordinar firma"],
  ],
};
function getGrupoTareas(tipo){
  if(tipo==="alquiler"||tipo==="reserva_alquiler") return "alquiler";
  if(tipo==="reserva"||tipo==="boleto"||tipo==="refuerzo_reserva") return "compra";
  return "otros";
}
function getTareasDeOp(op){ return TAREAS_DEFAULT[getGrupoTareas(op.tipo)] || TAREAS_DEFAULT.otros; }

// ── LÍNEA DE TIEMPO ────────────────────────────────────────────────────────────
// Se arma con datos que ya existen (sin agregar un log de auditoría nuevo):
// creación, de qué operación se originó, qué documentos generó, y su fecha
// clave (posesión / inicio / vencimiento) según el tipo.
function getLineaDeTiempo(op, operaciones){
  var eventos = [];
  var padre = op.parent_id ? (operaciones||[]).find(function(o){return o.id===op.parent_id;}) : null;
  eventos.push({
    fecha: op.created_at, icon: TIPO_ICON[op.tipo]||TIPO_ICON_DEFAULT,
    titulo: TIPOS[op.tipo]+" creada",
    detalle: padre ? "A partir de "+TIPOS[padre.tipo]+" del "+new Date(padre.created_at).toLocaleDateString("es-AR")+"." : null,
  });
  var hijos = (operaciones||[]).filter(function(o){return o.parent_id===op.id;});
  hijos.forEach(function(h){
    eventos.push({fecha:h.created_at, icon:TIPO_ICON[h.tipo]||TIPO_ICON_DEFAULT, titulo:TIPOS[h.tipo]+" generado", detalle:null});
  });
  var fechaClave=null, labelClave=null;
  if(op.tipo==="alquiler"){
    fechaClave=op.alquiler_inicio; labelClave="Inicio del contrato";
    var venc = finAlquilerISO(op);
    if(venc) eventos.push({fecha:venc, icon:"⏳", titulo:"Vencimiento del contrato", detalle:null});
  } else if(op.tipo==="reserva"||op.tipo==="boleto"){
    fechaClave=op.fecha_posesion; labelClave="Posesión / Escritura";
  } else if(op.tipo==="reserva_alquiler"){
    fechaClave=op.res_alq_inicio_estimado; labelClave="Inicio estimado del contrato";
  }
  if(fechaClave) eventos.push({fecha:fechaClave, icon:"📅", titulo:labelClave, detalle:null});
  return eventos.filter(function(e){return e.fecha;}).sort(function(a,b){return new Date(a.fecha).getTime()-new Date(b.fecha).getTime();});
}

// ── VALIDACIÓN PREVIA A EXPORTAR (PDF / Word) ─────────────────────────────────
// Validación centralizada: errores bloquean por defecto y solo permiten continuar
// con confirmación explícita; las inconsistencias de fechas son avisos no bloqueantes.
var DATOS_OBLIGATORIOS_POR_TIPO = {
  reserva: ["comprador_nombre","vendedor_nombre","inmueble_direccion","precio_letras","anticipo_letras"],
  boleto: ["comprador_nombre","vendedor_nombre","inmueble_direccion","precio_letras","saldo_letras","fecha_posesion"],
  alquiler: ["locador_nombre","locatario_nombre","inmueble_direccion","alquiler_monto_inicial","alquiler_inicio","alquiler_fin"],
  reserva_alquiler: ["locador_nombre","locatario_nombre","inmueble_direccion","reserva_alquiler_reserva","reserva_alquiler_canon"],
  comodato: ["vendedor_nombre","comprador_nombre","inmueble_direccion","comodato_plazo_texto"],
  exclusividad: ["vendedor_nombre","inmueble_direccion","precio_letras","exclusividad_modalidad_texto"],
  refuerzo_reserva: ["comprador_nombre","vendedor_nombre","inmueble_direccion","precio_letras"],
  devolucion_reserva: ["comprador_nombre","vendedor_nombre","inmueble_direccion","precio_letras"]
};
var LABEL_TOKEN_OBLIGATORIO = {
  comprador_nombre:"nombre del comprador", vendedor_nombre:"nombre del vendedor",
  locador_nombre:"nombre del locador", locatario_nombre:"nombre del locatario",
  inmueble_direccion:"dirección del inmueble", precio_letras:"precio total",
  anticipo_letras:"seña / anticipo", saldo_letras:"saldo", fecha_posesion:"fecha de posesión",
  alquiler_monto_inicial:"canon mensual inicial", alquiler_inicio:"fecha de inicio del contrato",
  alquiler_fin:"fecha de fin del contrato", comodato_plazo_texto:"plazo del comodato",
  reserva_alquiler_reserva:"monto de la reserva", reserva_alquiler_canon:"valor del alquiler mensual",
  exclusividad_modalidad_texto:"modalidad de la autorización"
};
function labelTokenObligatorio(token){ return LABEL_TOKEN_OBLIGATORIO[token] || String(token||"").replace(/_/g," "); }
// Alias verificados contra los tokens que realmente emite el generador. No se
// inventan variables: cada alternativa existe en derivedTokensGenerales,
// derivedTokensReserva o fmtVarValue.
var ALIASES_TOKEN_OBLIGATORIO = {
  alquiler_fin:["alquiler_fin_formateado"],
  reserva_alquiler_reserva:["reserva_alquiler_monto_reserva","res_alq_monto_reserva"],
  reserva_alquiler_canon:["reserva_alquiler_monto_mensual","res_alq_monto_mensual"],
  comodato_plazo_texto:["comodato_plazo_texto","comodato_plazo"],
  exclusividad_modalidad_texto:["exclusividad_modalidad_texto"]
};
var FUENTE_TOKEN_OBLIGATORIO = {
  comprador_nombre:["comprador_nombre"], vendedor_nombre:["vendedor_nombre"],
  locador_nombre:["locador_nombre"], locatario_nombre:["locatario_nombre"],
  inmueble_direccion:["inmueble_direccion"], precio_letras:["precio"],
  anticipo_letras:["anticipo"], saldo_letras:["saldo"], fecha_posesion:["fecha_posesion"],
  alquiler_monto_inicial:["alquiler_monto_inicial"], alquiler_inicio:["alquiler_inicio"],
  alquiler_fin:["alquiler_inicio","alquiler_fin","alquiler_plazo_meses"],
  reserva_alquiler_reserva:["res_alq_monto_reserva"], reserva_alquiler_canon:["res_alq_monto_mensual"],
  comodato_plazo_texto:["comodato_plazo"], exclusividad_modalidad_texto:["exclusividad_vigencia"]
};

function tokenResueltoObligatorio(token,op){
  var candidatos=[token].concat(ALIASES_TOKEN_OBLIGATORIO[token]||[]), ultimo="", elegido="";
  for(var i=0;i<candidatos.length;i++){
    var candidato=candidatos[i], valor="";
    try { valor=String(resolveVars("{{"+candidato+"}}",op||{})||"").trim(); } catch(_e) { valor=""; }
    if(valor && valor!=="___" && valor.indexOf("{{")<0){ elegido=candidato; ultimo=valor; break; }
    if(!ultimo) ultimo=valor;
  }
  return {token:elegido||token,valor:elegido?ultimo:(ultimo||""),resuelto:!!elegido};
}
function tokenExisteEnResolver(token,op){
  var conocido=false;
  try{
    conocido=(Array.isArray(VAR_GROUPS)&&VAR_GROUPS.some(function(grupo){return (grupo.fields||[]).some(function(f){return f.key===token;});})) ||
      Object.prototype.hasOwnProperty.call(derivedTokensGenerales(op||{}),token) ||
      Object.prototype.hasOwnProperty.call(derivedTokensReserva(op||{}),token);
  }catch(_e){conocido=false;}
  return conocido;
}
function tokenTieneFuenteCargada(token,op){
  var campos=FUENTE_TOKEN_OBLIGATORIO[token];
  if(!campos) return true;
  // Para el vencimiento del alquiler alcanza con fecha de inicio y plazo: el
  // generador calcula el vencimiento mediante finAlquilerISO.
  if(token==="alquiler_fin") return !!(op&&(String(op.alquiler_fin||"").trim() || (String(op.alquiler_inicio||"").trim() && Number(op.alquiler_plazo_meses||0)>0)));
  return campos.every(function(campo){
    if(op&&op[campo]!==undefined&&op[campo]!==null&&String(op[campo]).trim()!=="") return true;
    var m=String(campo).match(/^(comprador|vendedor|locador|locatario)_nombre$/);
    if(m&&typeof personasDe==="function"){
      try{return personasDe(op,m[1]).some(function(persona){return !!String(persona&&persona.nombre||"").trim();});}catch(_e){}
    }
    return false;
  });
}
// Variantes aceptadas por token: importes en letras o en cifra (con/sin código de moneda);
// fechas ISO, dd/mm/aaaa o la fecha larga que imprime fmtDLarga().
var CAMPOS_MONTO_TOKEN_OBLIGATORIO = {
  precio_letras:{campo:"precio",moneda:"moneda"}, anticipo_letras:{campo:"anticipo",moneda:"moneda"},
  saldo_letras:{campo:"saldo",moneda:"moneda"}, alquiler_monto_inicial:{campo:"alquiler_monto_inicial",moneda:"alquiler_moneda"},
  reserva_alquiler_reserva:{campo:"res_alq_monto_reserva",moneda:"res_alq_moneda"},
  reserva_alquiler_canon:{campo:"res_alq_monto_mensual",moneda:"res_alq_monto_mensual_moneda"}
};
var CAMPOS_FECHA_TOKEN_OBLIGATORIO = {
  fecha_posesion:"fecha_posesion", alquiler_inicio:"alquiler_inicio", alquiler_fin:"alquiler_fin",
  reserva_alquiler_reserva_fecha:"res_alq_inicio_estimado"
};
function variantesCoberturaObligatoria(token,valor,op){
  var out=[valor], m=CAMPOS_MONTO_TOKEN_OBLIGATORIO[token];
  if(m){
    var raw=op&&op[m.campo], moneda=(op&&op[m.moneda])||((m.campo==="res_alq_monto_reserva")?(op&&op.res_alq_moneda):"")||"ARS";
    if(raw!==undefined&&raw!==null&&String(raw).trim()!==""){
      try{var n=parseMontoAR(raw); if(!isNaN(n)){out.push(numeroMontoLegal(n),fmt$(raw,moneda),String(raw));
        if(moneda==="USD"){out.push("U$S "+numeroMontoLegal(n),"US$ "+numeroMontoLegal(n),"USD "+numeroMontoLegal(n));}
        else out.push("$ "+numeroMontoLegal(n),"ARS "+numeroMontoLegal(n));
      }}catch(_e){}
    }
  }
  var campoFecha=CAMPOS_FECHA_TOKEN_OBLIGATORIO[token];
  if(campoFecha&&op&&op[campoFecha]){
    var iso=String(op[campoFecha]).trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(iso)){
      out.push(iso,fmtD(iso),fmtDLarga(iso));
    }
  }
  return Array.from(new Set(out.map(function(x){return normalizarTextoComparacion(x);}).filter(Boolean)));
}
function analizarDatosObligatorios(doc,tipo,op){
  var obligatorios=DATOS_OBLIGATORIOS_POR_TIPO[tipo]||[], texto=normalizarTextoComparacion(docToPlainText(doc||{}));
  var faltaFormulario=[],faltaPlantilla=[],tokensNoResueltos=[],opResolver=op||{};
  // Usar la misma sanitización y unión de cotitulares que usa el generador real.
  try{if(typeof opParaDocumento==="function") opResolver=opParaDocumento(opResolver);}catch(_e){}
  obligatorios.forEach(function(token){
    var res=tokenResueltoObligatorio(token,opResolver), fuenteCargada=tokenTieneFuenteCargada(token,op||{});
    if(!fuenteCargada || !res.resuelto || !res.valor || res.valor==="___"){
      faltaFormulario.push({token:token,label:labelTokenObligatorio(token),mensaje:"Falta cargar "+labelTokenObligatorio(token)+" en el formulario."});
      return;
    }
    var variantes=variantesCoberturaObligatoria(token,res.valor,opResolver);
    var cubierto=variantes.some(function(v){return v&&texto.indexOf(v)>=0;});
    if(!cubierto){
      faltaPlantilla.push({token:token,label:labelTokenObligatorio(token),mensaje:"La plantilla no menciona "+labelTokenObligatorio(token)+" (se acepta el importe en letras o en cifras, y la fecha en formato impreso)."});
    }
  });
  // Detecta tokens obligatorios que el resolver no reconoce. Se informa por
  // separado para que un error de configuración del token no parezca ausencia
  // de una cláusula redactada por la inmobiliaria.
  obligatorios.forEach(function(token){
    if(!tokenExisteEnResolver(token,opResolver)){
      var aliases=ALIASES_TOKEN_OBLIGATORIO[token]||[];
      var alternativa=aliases.find(function(a){return tokenExisteEnResolver(a,opResolver);});
      tokensNoResueltos.push({token:token,alternativa:alternativa||null,mensaje:"El token obligatorio {{"+token+"}} no está registrado en las funciones de resolución."+(alternativa?" Alternativa existente: {{"+alternativa+"}}.":" No se encontró una alternativa comprobada en el generador.")});
    }
  });
  return {faltaFormulario:faltaFormulario,faltaPlantilla:faltaPlantilla,tokensNoResueltos:tokensNoResueltos};
}
// Compatibilidad con el consumidor existente: solo devuelve tokens cuya
// información sí está cargada pero la plantilla no imprime.
function validarDatosCubiertos(doc,tipo,op){
  return analizarDatosObligatorios(doc,tipo,op).faltaPlantilla.map(function(x){return x.token;});
}

// Partido y provincia salen impresos en el encabezado de todos los documentos: si faltan, quedaba un "___".
Object.keys(CAMPOS_CRITICOS_POR_TIPO).forEach(function(t){
  var l=CAMPOS_CRITICOS_POR_TIPO[t];
  var i=l.findIndex(function(f){return f[0]==="inmueble_direccion";});
  if(i>=0&&!l.some(function(f){return f[0]==="inmueble_partido";})) l.splice(i+1,0,["inmueble_partido","Partido / municipio del inmueble"],["inmueble_provincia","Provincia del inmueble"]);
});
// Ubica cada "___" que quedó en el documento final y devuelve dónde está y qué texto lo rodea.
function getMarcadoresSinResolver(doc){
  var out=[];
  function revisar(donde,texto){
    var t=String(texto||""),re=/_{3,}/g,m;
    while((m=re.exec(t))){
      var a=Math.max(0,m.index-42),b=Math.min(t.length,m.index+m[0].length+30);
      out.push({donde:donde,contexto:(a>0?"…":"")+t.slice(a,b).replace(/\s+/g," ").trim()+(b<t.length?"…":"")});
    }
  }
  revisar("el encabezado",doc.encabezado);
  (doc.partes||[]).forEach(function(p){ revisar("las partes",[p.rol,p.nombre,p.dni,p.domicilio].join(" ")); });
  (doc.secciones||[]).forEach(function(sec){ revisar("«"+String(sec.titulo||"Sección")+"»",(sec.items||[]).join(" ")); });
  (doc.clausulas||[]).forEach(function(c){ revisar("«"+String(c.titulo||("Cláusula "+(c.num||"")))+"»",c.texto); });
  if(doc.conformidad&&doc.conformidad.items) revisar("la conformidad",doc.conformidad.items.join(" "));
  (doc.firmas||[]).forEach(function(f,i){revisar("la firma "+(f.rol||i+1),[f.nombre,f.dni].join(" "));});
  return out;
}
function getTokensSinReemplazar(doc) {
  doc=doc||{};
  var textoCompleto = [
    doc.titulo||"", doc.subtitulo||"", doc.ciudad||"", doc.fecha||"", doc.encabezado||"",
    (doc.partes||[]).map(function(p){return [p.rol,p.nombre,p.dni,p.domicilio].join(" ");}).join(" "),
    (doc.secciones||[]).map(function(s){return [s.titulo,(s.items||[]).join(" ")].join(" ");}).join(" "),
    (doc.clausulas||[]).map(function(c){return [c.titulo,c.texto].join(" ");}).join(" "),
    (doc.conformidad&&doc.conformidad.items||[]).join(" "),
    (doc.firmas||[]).map(function(f){return [f.rol,f.nombre,f.dni].join(" ");}).join(" ")
  ].join(" ");
  // Captura tokens completos y llaves residuales/mal formadas, sin truncar el listado.
  var m=textoCompleto.match(/\{\{[^}]*\}?|\}\}|\{(?!\{)|(?<!\})\}/g);
  return m ? Array.from(new Set(m)) : [];
}
// Interpreta montos ingresados con convenciones habituales de Argentina y EE. UU.
// Acepta 1500, 1.500, 1.500,50, 1500.50 y 1,500.50 sin confundir miles con decimales.
function parseMontoAR(valor){
  if(typeof valor==="number") return isFinite(valor)?valor:NaN;
  var s=String(valor==null?"":valor).trim().replace(/[^0-9,.-]/g,"");
  if(!s || s==="-" || s==="," || s===".") return NaN;
  var coma=s.lastIndexOf(","), punto=s.lastIndexOf("."), dec=-1;
  if(coma>=0&&punto>=0) dec=Math.max(coma,punto);
  else if(coma>=0){ var tail=s.length-coma-1; dec=(tail>0&&tail<=2)?coma:-1; }
  else if(punto>=0){ var tail2=s.length-punto-1; dec=(tail2>0&&tail2<=2)?punto:-1; }
  if(dec>=0){ var entero=s.slice(0,dec).replace(/[.,]/g,""); var fr=s.slice(dec+1).replace(/[.,]/g,""); s=entero+(fr?"."+fr:""); }
  else s=s.replace(/[.,]/g,"");
  var n=Number(s); return isFinite(n)?n:NaN;
}
function esMontoMayorACero(valor){ var n=parseMontoAR(valor); return isFinite(n) && n>0; }
// 4.29: el paso depende del tipo de documento (en Reserva de alquiler el locatario va primero; en documentos simples todo lo demás está en el paso 4).
function getPasoDeCampo(campo,tipo){
  if(campo==="entrega_aires_detalle"||campo==="entrega_muebles_detalle"){var pasos=getSteps(tipo);return pasos[pasos.length-1].id;}
  var simple=["comodato","exclusividad","refuerzo_reserva","devolucion_reserva"].indexOf(tipo)>=0;
  var m=String(campo||"").match(/^(comprador|vendedor|locador|locatario)_/);
  if(m){
    var pre=m[1];
    if(tipo==="reserva_alquiler") return pre==="locatario"?2:3;
    if(tipo==="alquiler") return pre==="locador"?2:3;
    return pre==="comprador"?2:3;
  }
  if(simple) return 4;
  if(/^inmueble_/.test(campo)) return 4;
  return 5;
}
// Valores que el formulario MUESTRA por defecto (y que el documento usa) aunque nunca se hayan guardado en la operación.
// Antes se los marcaba como "faltantes" y el usuario, al revisar, los veía completos.
var DEFAULTS_UI_CRITICOS={reserva_aceptacion_dias:"5",res_alq_vigencia_dias:"10",alquiler_plazo_meses:"24"};
function valorCriticoOp(op,campo){
  if(campo==="alquiler_fin") return finAlquilerISO(op); // el vencimiento se calcula a partir de inicio + plazo
  var v=op[campo];
  if((v===undefined||v===null||String(v).trim()==="")&&DEFAULTS_UI_CRITICOS[campo]) return DEFAULTS_UI_CRITICOS[campo];
  return v;
}
// La comisión puede ser 0% por acuerdo expreso; un valor negativo, vacío
// o no numérico no debe aprobarse como honorario válido.
function comisionAutorizanteInformada(op){
  var campos=[op&&op.comision_vendedor_valor,op&&op.comision_vendedor];
  if(campos.some(function(v){return v!==undefined&&v!==null&&String(v).trim()!==""&&isFinite(parseMontoAR(v))&&parseMontoAR(v)>=0;})) return true;
  return !!String(op&&op.comision_vendedor_texto||"").trim();
}
function getCamposFaltantes(op,perfil=null) { perfil=perfil||null;
  var lista=CAMPOS_CRITICOS_POR_TIPO[op.tipo]||[];
  if(op.tipo==="exclusividad"&&perfil){
    op=Object.assign({},op,{comprador_nombre:op.inmobiliaria_nombre||perfil.inmobiliaria_nombre||op.comprador_nombre,comprador_dni:op.inmobiliaria_matricula||perfil.matricula||op.comprador_dni});
  }
  return lista.filter(function(f){
    var v=valorCriticoOp(op,f[0]);
    if(["precio","anticipo","res_alq_monto_reserva","res_alq_monto_mensual","alquiler_monto_inicial"].indexOf(f[0])>=0) return !esMontoMayorACero(v);
    if(f[0]==="comision_vendedor") return !comisionAutorizanteInformada(op);
    if(f[0]==="exclusividad_vigencia") return !/^\s*[1-9]\d*\s*(?:d[ií]as?)?\s*$/i.test(String(v||""));
    if(["res_alq_vigencia_dias","alquiler_plazo_meses","comodato_plazo"].indexOf(f[0])>=0) return !v || !Number.isFinite(Number(v)) || Number(v)<=0;
    return !v || String(v).trim()==="";
  }).map(function(f){return f[1];});
}
function getCamposFaltantesDetalle(op,perfil=null) { perfil=perfil||null;
  var lista=(CAMPOS_CRITICOS_POR_TIPO[op.tipo] || []).slice();
  if(["reserva","boleto","alquiler"].indexOf(op.tipo)!==-1)Object.keys(DETALLES_CLAUSULAS).forEach(function(id){
    var cfg=DETALLES_CLAUSULAS[id];
    if((op.clausulas_ids||[]).indexOf(op[cfg.campo+"_id"]||id)!==-1)lista.push([cfg.campo,cfg.label]);
  });
  if(op.tipo==="exclusividad"&&perfil){
    op=Object.assign({},op,{comprador_nombre:op.inmobiliaria_nombre||perfil.inmobiliaria_nombre||op.comprador_nombre,comprador_dni:op.inmobiliaria_matricula||perfil.matricula||op.comprador_dni});
  }
  return lista.filter(function(f){
    var v=valorCriticoOp(op,f[0]);
    if(["precio","anticipo","res_alq_monto_reserva","res_alq_monto_mensual","alquiler_monto_inicial"].indexOf(f[0])>=0) return !esMontoMayorACero(v);
    if(f[0]==="comision_vendedor") return !comisionAutorizanteInformada(op);
    if(f[0]==="exclusividad_vigencia") return !/^\s*[1-9]\d*\s*(?:d[ií]as?)?\s*$/i.test(String(v||""));
    if(["res_alq_vigencia_dias","alquiler_plazo_meses","comodato_plazo"].indexOf(f[0])>=0) return !v || !Number.isFinite(Number(v)) || Number(v)<=0;
    return !v || String(v).trim()==="";
  }).map(function(f){return {campo:f[0],label:f[1],paso:getPasoDeCampo(f[0],op.tipo)};});
}
function getProblemasFechas(op) {
  var problemas = [];
  var creado = op.created_at ? new Date(op.created_at) : null;
  if ((op.tipo==="boleto"||op.tipo==="reserva") && op.fecha_posesion && creado) {
    var fp = new Date(op.fecha_posesion+"T00:00:00");
    var creadoSoloFecha = new Date(creado.getFullYear(),creado.getMonth(),creado.getDate());
    if (fp < creadoSoloFecha) problemas.push("La fecha de posesión ("+fmtD(op.fecha_posesion)+") es anterior a la fecha en que se creó la operación. Revisá si corresponde.");
  }
  if (op.tipo==="alquiler" && op.alquiler_inicio && finAlquilerISO(op)) {
    if (new Date(finAlquilerISO(op)+"T00:00:00") <= new Date(op.alquiler_inicio+"T00:00:00")) {
      problemas.push("El vencimiento del contrato ("+fmtD(finAlquilerISO(op))+") debe ser posterior a la fecha de inicio ("+fmtD(op.alquiler_inicio)+").");
    }
  }
  if (op.tipo==="reserva_alquiler" && op.res_alq_inicio_estimado && creado) {
    var ri = new Date(op.res_alq_inicio_estimado+"T00:00:00");
    var creadoSoloFecha2 = new Date(creado.getFullYear(),creado.getMonth(),creado.getDate());
    if (ri < creadoSoloFecha2) problemas.push("El inicio estimado del contrato ("+fmtD(op.res_alq_inicio_estimado)+") es anterior a la fecha en que se creó la reserva. Revisá si corresponde.");
  }
  return problemas;
}
// Validación única previa a exportar. Los errores críticos bloquean la exportación.
// 5.18: control preventivo de textos de prueba y ordinales duplicados.
// Solo informa errores de revisión: nunca reescribe cláusulas de la inmobiliaria.
function detectarProblemasEditorialesDocumento(doc,tipoOperacion){
  var problemas=[];
  var clausulas=(doc&&doc.clausulas)||[];
  var ordinalesVistos={};
  var numerosVistos={};
  // Los números de las secciones y de las cláusulas adicionales comparten
  // una única secuencia en PDF, DOCX y vista previa.
  (doc&&doc.secciones||[]).forEach(function(sec){
    var tituloSeccion=String(sec&&sec.titulo||"").trim();
    var textoSeccion=(sec&&sec.items||[]).map(function(item){return String(item||"");}).join(" ");
    // Los modelos editables suelen guardar las cláusulas en secciones.
    // Controlar allí también los textos de ejemplo, no solo doc.clausulas.
    if(/^(?:nueva\s+cl[aá]usula|cl[aá]usula\s+(?:nueva|sin t[ií]tulo))$/i.test(tituloSeccion)||
       /escrib[ií]\s+ac[aá]\s+la\s+redacci[oó]n\s+de\s+esta\s+cl[aá]usula/i.test(textoSeccion)){
      problemas.push("El documento contiene texto de ejemplo en la sección «"+(tituloSeccion||"sin título")+"». Revisá el modelo antes de exportar.");
    }
    var parsed=parseTituloClausula(sec&&sec.titulo);
    // Los modelos antiguos pueden traer "CLÁUSULA SEXTA" en lugar de "6. ...".
    // Convertir ambos rótulos al mismo número para detectar repeticiones reales.
    var numeroSeccion=parsed.num;
    if(!numeroSeccion){
      var rotulo=/^CL[AÁ]USULA\s+([A-ZÁÉÍÓÚÜÑ ]+?)(?:\s*[—:–-]|$)/i.exec(tituloSeccion);
      if(rotulo){
        var ordinalNormalizado=rotulo[1].normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();
        for(var idxOrd=1;idxOrd<=99;idxOrd++){
          var nombreOrdinal=ordinalFem(idxOrd);
          if(nombreOrdinal&&nombreOrdinal.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase()===ordinalNormalizado){numeroSeccion=idxOrd;break;}
        }
      }
    }
    if(numeroSeccion){
      var key=String(numeroSeccion);
      if(numerosVistos[key]) problemas.push("La numeración de secciones está repetida: número "+key+".");
      numerosVistos[key]=true;
    }
  });
  clausulas.forEach(function(c,i){
    var titulo=String(c.titulo||"").trim();
    var texto=String(c.texto||"").trim();
    var contexto=titulo||("cláusula "+(i+1));
    // PDF y DOCX imprimen el ordinal desde c.num, no desde c.titulo.
    // Controlar ese número detecta duplicados que el control del título omitía.
    var numero=String(c.num==null?"":c.num).trim();
    if(numero){
      var numeroClave=/^\d+$/.test(numero)?String(Number(numero)):numero.toUpperCase();
      if(numerosVistos[numeroClave]) problemas.push("La numeración de cláusulas está repetida: número "+numero+" («"+contexto+"»). Revisá el modelo.");
      numerosVistos[numeroClave]=true;
    }
    if(/^(?:nueva\s+cl[aá]usula|cl[aá]usula\s+(?:nueva|sin t[ií]tulo))$/i.test(titulo)||
       /escrib[ií]\s+ac[aá]\s+la\s+redacci[oó]n\s+de\s+esta\s+cl[aá]usula/i.test(texto)){
      problemas.push("El documento contiene texto de ejemplo en «"+contexto+"». Revisá la cláusula antes de exportar.");
    }
    var ordinal=/^CL[AÁ]USULA\s+(PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|S[EÉ]PTIMA|OCTAVA|NOVENA|D[EÉ]CIMA|UND[EÉ]CIMA|DUOD[EÉ]CIMA)\b/i.exec(titulo);
    if(ordinal){
      var clave=ordinal[1].normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
      if(ordinalesVistos[clave]) problemas.push("La numeración de cláusulas está repetida: «"+titulo+"». Revisá el orden del modelo.");
      ordinalesVistos[clave]=true;
    }
  });
  // La conformidad también se imprime en PDF y DOCX: no debe escapar
  // al control editorial por estar fuera de secciones y cláusulas.
  var conformidad=doc&&doc.conformidad;
  if(conformidad){
    var tituloConformidad=String(conformidad.titulo||"").trim();
    var textoConformidad=(conformidad.items||[]).map(function(item){return String(item||"");}).join(" ");
    if(/^(?:nueva\s+cl[aá]usula|cl[aá]usula\s+(?:nueva|sin t[ií]tulo))$/i.test(tituloConformidad)||
       /escrib[ií]\s+ac[aá]\s+la\s+redacci[oó]n\s+de\s+esta\s+cl[aá]usula/i.test(textoConformidad)){
      problemas.push("La conformidad contiene texto de ejemplo. Revisá el modelo antes de exportar.");
    }
  }
  // El modelo puede tener un título limpio pero texto heredado de otro contrato.
  // No modificar redacciones legales automáticamente: advertir y exigir revisión.
  var tipo=String(tipoOperacion||(doc&&doc.tipo)||"").toLowerCase();
  // Revisar también el cuerpo de las secciones: muchos modelos editables
  // guardan allí las cláusulas, sin utilizar doc.clausulas.
  var textosSecciones=(doc&&doc.secciones||[]).reduce(function(acc,sec){
    return acc.concat((sec&&sec.items||[]).map(function(item){return String(item||"");}));
  },[]);
  var cuerpo=[String(doc&&doc.encabezado||"")].concat(textosSecciones,clausulas.map(function(c){return String(c.texto||"");}), (conformidad&&conformidad.items||[]).map(function(item){return String(item||"");})).join(" ");
  if(tipo==="comodato"&&/PARTE\s+VENDEDORA\s*\(\s*o\s+LOCADORA\s*\)/i.test(cuerpo)){
    problemas.push("El comodato contiene «PARTE VENDEDORA (o LOCADORA)», un rótulo de otro tipo de contrato. Revisá el modelo antes de exportar.");
  }
  return problemas;
}
function validarDocumentoParaExport(op, doc, perfil){
  op=op||{}; doc=doc||{}; perfil=perfil||null;
  var errores=[],avisos=[];
  var opValid=op;
  if(op.tipo==="exclusividad"&&doc){
    var p2=doc.partes&&doc.partes[1]||{};
    opValid=Object.assign({},op,{comprador_nombre:p2.nombre||op.comprador_nombre,comprador_dni:p2.dni||op.comprador_dni});
  }
  var faltantes=getCamposFaltantesDetalle(opValid,perfil);
  faltantes.forEach(function(c){
    if(op.tipo==="reserva"&&c.campo==="reserva_aceptacion_dias") return;
    errores.push("Falta completar: "+c.label+(c.paso?" (paso "+c.paso+")":"")+".");
  });
  if(op.tipo==="reserva"){
    var modo=String(op.reserva_aceptacion_modo||"dias").toLowerCase();
    if(modo==="horas"){
      // 4.16: el formulario y el documento usan 48 h si no se guardó nada; se valida lo mismo que se ve.
      var hEf=op.reserva_aceptacion_horas; if(hEf===undefined||hEf===null||String(hEf).trim()==="") hEf="48";
      if(!esMontoMayorACero(hEf)) errores.push("Indicá un plazo de aceptación en horas mayor a cero.");
    } else if(modo==="fecha"){
      var vf=String(op.reserva_aceptacion_vencimiento||"");
      var fechaAceptacion=/^\d{4}-\d{2}-\d{2}$/.test(vf)?new Date(vf+"T00:00:00"):null;
      if(!fechaAceptacion||isNaN(fechaAceptacion.getTime())||fechaAceptacion.toISOString().slice(0,10)!==vf) errores.push("Indicá una fecha válida de vencimiento para la aceptación de la reserva.");
    } else if(!esMontoMayorACero(valorCriticoOp(op,"reserva_aceptacion_dias"))) errores.push("Indicá un plazo de aceptación en días mayor a cero."); // 4.16: usa el valor por defecto (5) que muestra el formulario
  }
  if(op.tipo==="alquiler"){
    var depositoModo=String(op.alquiler_deposito==null?"1":op.alquiler_deposito);
    if(["1","2","otro"].indexOf(depositoModo)<0) errores.push("El depósito no es válido: elegí 1 mes, 2 meses o monto personalizado.");
    else if(depositoModo==="otro"&&!esMontoMayorACero(op.alquiler_deposito_otro_monto)) errores.push("Falta completar un monto personalizado de depósito mayor a cero.");
  }
  if(op.tipo==="boleto"&&esMontoMayorACero(op.precio)&&esMontoMayorACero(op.anticipo)){
    var saldoEsperado=Math.round((parseMontoAR(op.precio)-parseMontoAR(op.anticipo))*100)/100;
    if(op.saldo===undefined||op.saldo===null||String(op.saldo).trim()==="") errores.push("Falta el saldo. El saldo calculado es "+fmt$(saldoEsperado,op.moneda)+" (precio menos seña/anticipo).");
    else { var saldoIngresado=Math.round(parseMontoAR(op.saldo)*100)/100;
      if(!isFinite(saldoIngresado)||Math.abs(saldoEsperado-saldoIngresado)>0.01) errores.push("El saldo no coincide con el precio menos la seña/anticipo. El saldo calculado es "+fmt$(saldoEsperado,op.moneda)+". Revisá los importes antes de exportar.");
    }
  }
  // Una reserva sin importe entregado no puede documentar recepción de fondos
  // ni aplicar pérdida/devolución duplicada de una seña inexistente.
  // No se reescriben cláusulas publicadas: se solicita corregir la operación
  // o el modelo antes de exportar.
  if(op.tipo==="reserva" && !(parseMontoAR(op.anticipo)>0)){
    var textoReservaSinEntrega=String(doc.encabezado||"")+" "+(doc.secciones||[]).map(function(sec){
      return (sec.items||[]).join(" ");
    }).join(" ")+" "+(doc.clausulas||[]).map(function(c){return String(c.texto||"");}).join(" ");
    if(/(?:recibimos|entregada? en este acto|suma entregada|perder[aá] (?:autom[aá]ticamente )?(?:la |el )?(?:suma|importe|monto) entregad[oa]|devolver el doble)/i.test(textoReservaSinEntrega)){
      errores.push("La reserva afirma que se entregó dinero o aplica consecuencias sobre una seña, pero no hay importe de reserva registrado. Completá el importe o revisá el modelo antes de exportar.");
    }
  }
  // Un boleto sin anticipo no puede afirmar que existe una seña entregada.
  // Protege también modelos personalizados antiguos, sin alterar su contenido.
  if(op.tipo==="boleto" && !(parseMontoAR(op.anticipo)>0)){
    var textoClausulasBoleto=(doc.secciones||[]).map(function(sec){return (sec.items||[]).join(" ");}).join(" ")+" "+(doc.clausulas||[]).map(function(c){return String(c.texto||"");}).join(" ");
    if(/perder[aá]\s+(?:en concepto de multa\s+)?la suma entregada como seña/i.test(textoClausulasBoleto)){
      errores.push("La cláusula de incumplimiento menciona la pérdida de una seña, pero no hay anticipo registrado. Revisá la cláusula del modelo antes de exportar.");
    }
  }
  // Condiciones económicas adicionales: validar los datos antes de exportar.
  // Solo se aplica a operaciones nuevas que optaron explícitamente por esta función.
  if((op.tipo==="reserva"||op.tipo==="boleto")&&op.compra_modalidad_pago&&op.compra_modalidad_pago!=="habitual"){
    var modalidadPago=String(op.compra_modalidad_pago);
    var medioPago=String(op.compra_medio_pago||"sin_definir");
    var detallePago=String(op.compra_condiciones_pago||"").trim();
    var cantidadCuotas=Number(op.compra_cuotas_cantidad);
    if(!esMontoMayorACero(op.precio)) errores.push("Completá el precio total para definir las condiciones de pago.");
    if(parseMontoAR(op.anticipo)>parseMontoAR(op.precio)) errores.push("La entrega inicial supera el precio total. Revisá las condiciones económicas.");
    if(medioPago==="sin_definir") errores.push("Seleccioná el medio de pago acordado antes de exportar.");
    if(medioPago==="otro"&&!String(op.compra_medio_otro||"").trim()) errores.push("Especificá el medio de pago acordado.");
    if(modalidadPago==="cuotas"){
      if(!Number.isInteger(cantidadCuotas)||cantidadCuotas<1||cantidadCuotas>36) errores.push("Indicá una cantidad de cuotas entre 1 y 36.");
      var fechaCuota=String((cronogramaCuotasCompra(op)[0]||{}).fecha||op.compra_cuotas_primera_fecha||"");
      var fechaCuotaDate=/^\d{4}-\d{2}-\d{2}$/.test(fechaCuota)?new Date(fechaCuota+"T00:00:00"):null;
      if(!fechaCuotaDate||isNaN(fechaCuotaDate.getTime())||fechaCuotaDate.getFullYear()!==Number(fechaCuota.slice(0,4))||fechaCuotaDate.getMonth()+1!==Number(fechaCuota.slice(5,7))||fechaCuotaDate.getDate()!==Number(fechaCuota.slice(8,10))) errores.push("Indicá una fecha válida para el primer vencimiento de las cuotas.");
      var cronograma=cronogramaCuotasCompra(op);
      if(cronograma.length){
        if(cronograma.length!==cantidadCuotas) errores.push("La cantidad de cuotas no coincide con el cronograma cargado.");
        var sumaCuotas=0,fechaAnterior="";
        cronograma.forEach(function(c,i){
          var importe=parseMontoAR(c.importe);
          if(!isFinite(importe)||importe<=0) errores.push("La cuota "+(i+1)+" necesita un importe mayor a cero.");
          else sumaCuotas+=importe;
          if(!fechaPagoValida(c.fecha)) errores.push("La cuota "+(i+1)+" necesita una fecha válida.");
          if(fechaAnterior&&String(c.fecha)<fechaAnterior) errores.push("Los vencimientos de las cuotas deben estar en orden cronológico.");
          fechaAnterior=String(c.fecha||"");
          if(!["efectivo","transferencia","mixto","otro"].includes(String(c.medio||""))) errores.push("Seleccioná el medio de pago de la cuota "+(i+1)+".");
          if(c.medio==="otro"&&!String(c.medio_otro||"").trim()) errores.push("Especificá el medio de pago de la cuota "+(i+1)+".");
        });
        if(Math.abs(Math.round(sumaCuotas*100)-Math.round((parseMontoAR(op.precio)-parseMontoAR(op.anticipo))*100))>1) errores.push("La suma de las cuotas no coincide con el saldo pendiente.");
        // El vencimiento inicial es el de la cuota 1; no se exige un campo duplicado.
      } else if(Object.prototype.hasOwnProperty.call(op,"compra_cuotas_cronograma") && op.compra_cuotas_cronograma!==undefined && op.compra_cuotas_cronograma!==null) {
        // Un cronograma estructurado presente, incluso vacío, exige completar sus cuotas.
        // Solo los registros anteriores SIN este campo conservan el acuerdo libre.
        errores.push("Completá el cronograma de cuotas: importes, fechas y medios de pago de cada cuota.");
      } else if(!detallePago) errores.push("Cargá los importes, vencimientos y medios de cada cuota antes de exportar.");
      else avisos.push("Esta operación usa un cronograma anterior en texto libre. Revisá cada importe y vencimiento antes de firmar.");
    }
    if(modalidadPago==="especial"&&!detallePago) errores.push("Describí la condición especial de pago antes de exportar.");
    if(modalidadPago==="entrega_saldo"&&!detallePago) errores.push("Indicá cuándo y cómo se abonará el saldo pendiente; no alcanza con cargar los importes.");
    if(modalidadPago==="unico"&&parseMontoAR(op.anticipo)>0) errores.push("Elegiste pago único, pero también cargaste una entrega inicial. Corregí la modalidad o la entrega para evitar contradicciones.");
    if(medioPago==="mixto"&&!detallePago) errores.push("Detallá los importes por medio de pago antes de exportar.");
    // Protección documental: las condiciones especiales guardadas en la operación
    // no deben quedar invisibles en el documento final. Se compara contra el
    // documento YA renderizado, respetando el modelo/snapshot de cada operación.
    // No se altera ninguna cláusula ni se agrega texto legal unilateralmente.
    var textoDocumentoPago=[String(doc.encabezado||""),
      (doc.secciones||[]).map(function(sec){return (sec.items||[]).join(" ");}).join(" "),
      (doc.clausulas||[]).map(function(c){return String(c.texto||"");}).join(" ")
    ].join(" ").replace(/\s+/g," ").toLocaleLowerCase("es-AR");
    // Una operación con pagos especiales no debe exportarse si el acuerdo
    // no está plasmado en el instrumento. Aceptamos tanto el detalle libre
    // como la redacción integral, sin exigir ambos chips a la vez.
    var tokensPago=tokensPagoCompra(op);
    var redaccionPago=tokensPago.compra_pago_redaccion||"";
    var normalizarPagoDoc=function(v){return String(v||"").replace(/\s+/g," ").trim().toLocaleLowerCase("es-AR");};
    var contieneDetalle=!!detallePago && textoDocumentoPago.indexOf(normalizarPagoDoc(detallePago))>=0;
    // Los modelos base nuevos usan los tokens específicos de boleto/reserva.
    // Validarlos igual que el token genérico evita bloquear un documento correcto.
    var pagoSegunTipo=op.tipo==="boleto"?tokensPago.boleto_pago_acordado:tokensPago.reserva_pago_acordado;
    var contieneRedaccion=!!redaccionPago && textoDocumentoPago.indexOf(normalizarPagoDoc(redaccionPago))>=0;
    var contienePagoModelo=!!pagoSegunTipo && textoDocumentoPago.indexOf(normalizarPagoDoc(pagoSegunTipo))>=0;
    var contienePagoCompleto=contieneRedaccion||contienePagoModelo;
    if(modalidadPago!=="habitual" && !redaccionPago){errores.push("No se pudo redactar el acuerdo de pago especial. Revisá la modalidad, el medio, los importes y el cronograma antes de exportar.");}
    if(modalidadPago==="cuotas"&&cronogramaCuotasCompra(op).length&&textoDocumentoPago.indexOf(normalizarPagoDoc(descripcionCronogramaCompra(op)))<0){
      errores.push("El cronograma de cuotas no figura completo en el documento. Revisá el modelo de pago antes de exportar.");
    }
    if(!contieneDetalle&&!contienePagoCompleto){
      errores.push("El acuerdo de pago no figura en el documento generado. Revisá la cláusula Forma de pago del modelo publicado: debe incluir {{boleto_pago_acordado}}, {{reserva_pago_acordado}}, {{compra_pago_redaccion}} o {{compra_condiciones_pago}}, según el documento, y reflejar íntegramente lo acordado.");
    }
    // Si se usa el detalle libre, la redacción fija del modelo puede seguir
    // contradiciendo el cronograma. Requerimos revisión expresa.
    // Detectar una contradicción contractual frecuente: un modelo que obliga
    // a pagar TODO el saldo al escriturar pese a un cronograma en cuotas.
    // Solo se activa ante modalidades explícitas y no altera modelos históricos.
    if((modalidadPago==="cuotas"||modalidadPago==="especial") &&
       /(?:saldo|restante)[\s\S]{0,120}(?:al momento de|en el acto de|a la firma de)[\s\S]{0,65}(?:escritura|escrituraci[oó]n)/i.test(textoDocumentoPago)){
      errores.push("El documento indica que el saldo se paga al escriturar, pero cargaste cuotas o condiciones especiales. Corregí la cláusula de forma de pago del modelo antes de exportar.");
    }
    if(contieneDetalle&&!contienePagoCompleto){
      avisos.push("Revisá que la cláusula de precio no contradiga el detalle de pagos agregado, especialmente si hay cuotas o saldo a escriturar.");
    }
    if(!detallePago){
      avisos.push("Verificá que la modalidad y el medio de pago estén expresamente incluidos en la cláusula de precio antes de firmar.");
    }
  }
  // Algunos encabezados imprimen explícitamente partido y provincia; no permitirlos vacíos.
  if(doc.encabezado&&/Provincia de|inmueble ubicado|ubicado en/i.test(String(doc.encabezado))){
    if(!String(op.inmueble_partido||"").trim()) errores.push("Falta completar el partido / municipio del inmueble.");
    if(!String(op.inmueble_provincia||"").trim()) errores.push("Falta completar la provincia del inmueble.");
  }
  getProblemasFechas(op).forEach(function(p){avisos.push(p);});
  var tokens=getTokensSinReemplazar(doc);
  if(tokens.length) errores.push("Hay tokens o texto sin resolver en el documento: "+tokens.join(", ")+". Revisá las cláusulas y los datos de la operación.");
  getMarcadoresSinResolver(doc).forEach(function(m){errores.push("Hay un dato sin completar en "+m.donde+": "+m.contexto+" — completalo en la operación.");});
  detectarProblemasEditorialesDocumento(doc,op.tipo).forEach(function(p){errores.push(p);});
  // 4.32: diferencia dato sin cargar de dato cargado que la plantilla no imprime.
  var analisisObligatorios=analizarDatosObligatorios(doc,op.tipo,op);
  var datosFaltantes=analisisObligatorios.faltaPlantilla.map(function(x){return x.token;});
  analisisObligatorios.faltaFormulario.forEach(function(x){
    var etiqueta=normalizarTextoComparacion(x.label||labelTokenObligatorio(x.token)||"");
    var yaInformado=errores.some(function(e){
      if(!/^Falta completar:/i.test(String(e||"")))return false;
      var existente=normalizarTextoComparacion(String(e).replace(/^Falta completar:\s*/i,"").replace(/\s*\(paso [^)]+\)\.?$/i,""));
      return !!etiqueta&&(existente===etiqueta||existente.indexOf(etiqueta)>=0||etiqueta.indexOf(existente)>=0);
    });
    if(!yaInformado&&errores.indexOf(x.mensaje)<0)errores.push(x.mensaje);
  });
  analisisObligatorios.faltaPlantilla.forEach(function(x){if(errores.indexOf(x.mensaje)<0) errores.push(x.mensaje);});
  analisisObligatorios.tokensNoResueltos.forEach(function(x){if(errores.indexOf(x.mensaje)<0) errores.push(x.mensaje);});
  return {errores:errores,avisos:avisos,datosFaltantes:datosFaltantes,datosSinCargar:analisisObligatorios.faltaFormulario,datosFaltantesDetalle:analisisObligatorios.faltaFormulario.concat(analisisObligatorios.faltaPlantilla),tokensObligatoriosNoResueltos:analisisObligatorios.tokensNoResueltos,puedeExportar:true,borrador:errores.length>0};
}
// 4.16: a qué campo llevar al usuario cuando la exportación detecta errores. Antes solo se consideraban los
// "campos críticos" y, si el error era otro (p. ej. el plazo de aceptación), el formulario abría en el paso 2 (Comprador).
function campoPrincipalErrorExport(op,perfil,errores){
  var f=(getCamposFaltantesDetalle(op,perfil)[0]||{}).campo;
  if(f) return f;
  var t=(errores||[]).join(" | ");
  if(/plazo de aceptación en horas/i.test(t)) return "reserva_aceptacion_horas";
  if(/plazo de aceptación|vencimiento para la aceptación/i.test(t)) return "reserva_aceptacion_dias";
  if(/cuotas|primer vencimiento/i.test(t)) return "compra_cuotas_cantidad";
  if(/condición especial|medio de pago|importes por medio|vencimientos y condiciones/i.test(t)) return "compra_condiciones_pago";
  if(/entrega inicial supera/i.test(t)) return "anticipo";
  if(/saldo/i.test(t)) return "saldo";
  if(/partido/i.test(t)) return "inmueble_partido";
  if(/provincia/i.test(t)) return "inmueble_provincia";
  if(/depósito/i.test(t)) return "alquiler_deposito_otro_monto";
  return "";
}
function getAdvertenciasExportacion(op,doc,perfil){ return validarDocumentoParaExport(op,doc,perfil||null); }

function numeroMontoLegal(val) {
  var n = parseMontoAR(val);
  if (isNaN(n)) return null;
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: Math.abs(n-Math.round(n)) < 0.000001 ? 0 : 2,
    maximumFractionDigits: 2
  });
}


// Formato compacto para la interfaz.
function fmt$(val, moneda) {
  if (val === undefined || val === null || String(val).trim() === "") return "—";
  var n = parseMontoAR(val);
  if (isNaN(n)) return "—";
  return codigoMonedaLegal(moneda) + " " + numeroMontoLegal(n) + ".-";
}

// Convierte el monto a letras, SIN repetir la moneda.
function montoEnLetras(val, moneda) {
  var n = parseMontoAR(val);
  if (isNaN(n) || n <= 0) return "";
  var entero = Math.floor(n);
  var centavos = Math.round((n - entero) * 100);
  if (centavos === 100) { entero += 1; centavos = 0; }
  var letras = numeroALetras(entero);
  if (!letras) return "";
  letras = String(letras).trim().toUpperCase();
  return centavos > 0 ? letras + " CON " + String(centavos).padStart(2, "0") + "/100" : letras;
}

// Formato legal completo solicitado:
// USD: DÓLARES ESTADOUNIDENSES BILLETE CINCO MIL (USD 5.000.-)
// ARS: PESOS ARGENTINOS CINCO MIL (ARS 5.000.-)
function fmt$L(val, moneda) {
  var n = parseMontoAR(val);
  if (isNaN(n) || n <= 0) return "—";
  var letras = montoEnLetras(n, moneda);
  var num = numeroMontoLegal(n);
  var code = codigoMonedaLegal(moneda);
  return letras
    ? prefijoMonedaLegal(moneda) + " " + letras + " (" + code + " " + num + ".-)"
    : code + " " + num + ".-";
}

// ── COMISIONES FLEXIBLES ─────────────────────────────────────────────────────
// Cada parte puede pactar la comisión por porcentaje o por monto fijo.
// Los campos nuevos conviven con los anteriores para no romper operaciones ya
// guardadas: si no existe *_modo / *_valor, se usa el valor legado.

// Evita que los datos históricos de compraventa (3% comprador / 4% vendedor)
// contaminen una operación de alquiler. En alquiler solo existen LOCADOR y
// LOCATARIO como partes económicas. Se conservan los campos específicos del
// alquiler para no perder personalización.
function limpiarComisionesIncompatibles(op){
  var next=Object.assign({},op||{});
  var tipo=next.tipo;
  if(tipo==="alquiler" || tipo==="reserva_alquiler"){
    [
      "comision_porcentaje","comision_vendedor","comision_comprador",
      "comision_vendedor_modo","comision_vendedor_valor","comision_vendedor_moneda",
      "comision_comprador_modo","comision_comprador_valor","comision_comprador_moneda"
    ].forEach(function(k){ delete next[k]; });
  }
  return next;
}
function totalContratoAlquiler(op){
  op=op||{};
  // La comisión de alquiler se calcula sobre el VALOR TOTAL DEL CONTRATO:
  // canon mensual × cantidad de meses (+ días prorrateados si existieran).
  var mensual=parseMontoAR(op.alquiler_monto_inicial);
  if(!isFinite(mensual)) mensual=0;
  var meses=parseInt(op.alquiler_plazo_meses,10);
  if(!isFinite(meses)||meses<0) meses=0;
  var dias=parseInt(op.alquiler_plazo_dias,10);
  if(!isFinite(dias)||dias<0) dias=0;
  if(mensual<=0 || (meses<=0 && dias<=0)) return 0;
  return mensual*(meses+(dias/30));
}
function getComisionConfig(op, prefix, base, monedaBase, legacyKey, defaultValue){
  op=op||{};
  var modo=normalizarModoComision(op[prefix+"_modo"]);
  var legacy=op[legacyKey || prefix];
  var valor=op[prefix+"_valor"];
  if(valor===undefined || valor===null || String(valor).trim()==="") valor=legacy;
  if((valor===undefined || valor===null || String(valor).trim()==="") && defaultValue!==undefined) valor=defaultValue;
  var moneda=modo==="fijo" ? (op[prefix+"_moneda"] || monedaBase || "ARS") : (monedaBase || "ARS");
  var n=parseMontoAR(valor);
  var monto=0;
  if(!isNaN(n) && n>=0){ monto=modo==="fijo" ? n : (parseMontoAR(base)||0)*n/100; }
  return {modo:modo,valor:valor===undefined||valor===null?"":String(valor),moneda:moneda,monto:monto,base:parseMontoAR(base)||0,baseMoneda:monedaBase||"ARS"};
}
function textoComision(op, prefix, rol, baseLabel, base, monedaBase, legacyKey, defaultValue){
  var c=getComisionConfig(op,prefix,base,monedaBase,legacyKey,defaultValue);
  var actor=String(rol||"").toUpperCase();
  if(c.modo==="fijo") return "El "+actor+" abonará la suma de "+fmt$L(c.valor,c.moneda)+" en concepto de honorarios por la labor de intermediación inmobiliaria.-";
  var pct=(c.valor!==""?c.valor:"___");
  return "El "+actor+" abonará el "+pct+"% del "+baseLabel+" en concepto de honorarios por la labor de intermediación inmobiliaria.-";
}
function resumenComision(op,prefix,rol,baseLabel,base,monedaBase,legacyKey,defaultValue){
  var c=getComisionConfig(op,prefix,base,monedaBase,legacyKey,defaultValue);
  if(c.modo==="fijo") return (rol||"")+" "+fmt$(c.valor,c.moneda);
  return (rol||"")+" "+(c.valor!==""?c.valor:"___")+"%"+(c.monto>0?" = "+fmt$(c.monto,monedaBase):"");
}
function getComisionComponents(op){
  if(!op) return [];
  var tipo=op.tipo, out=[];
  if(tipo==="reserva" || tipo==="boleto") {
    var base=parseMontoAR(op.precio||0), moneda=op.moneda||"USD";
    var tieneComisionesPartes=!!(op.comision_vendedor||op.comision_comprador||op.comision_vendedor_valor||op.comision_comprador_valor);
    var legacyPctReserva=parseFloat(op.comision_porcentaje||0);
    var defaultV=tipo==="reserva"&&!tieneComisionesPartes?String(legacyPctReserva/2):"";
    var defaultC=tipo==="reserva"&&!tieneComisionesPartes?String(legacyPctReserva/2):"3";
    out.push(Object.assign({rol:"vendedor",prefix:"comision_vendedor"},getComisionConfig(op,"comision_vendedor",base,moneda,"comision_vendedor",defaultV)));
    out.push(Object.assign({rol:"comprador",prefix:"comision_comprador"},getComisionConfig(op,"comision_comprador",base,moneda,"comision_comprador",defaultC)));
  } else if(tipo==="alquiler") {
    var baseA=totalContratoAlquiler(op), monedaA=op.alquiler_moneda||"ARS";
    out.push(Object.assign({rol:"locador",prefix:"alquiler_comision_locador"},getComisionConfig(op,"alquiler_comision_locador",baseA,monedaA,"alquiler_comision_locador",valorComisionPredeterminado(op.alquiler_comision,"1"))));
    out.push(Object.assign({rol:"locatario",prefix:"alquiler_comision_locatario"},getComisionConfig(op,"alquiler_comision_locatario",baseA,monedaA,"alquiler_comision_locatario",valorComisionPredeterminado(op.alquiler_comision,"1"))));
  } else if(tipo==="reserva_alquiler") {
    var baseR=parseFloat(op.res_alq_monto_mensual||0), monedaR=op.res_alq_moneda||op.res_alq_monto_mensual_moneda||"ARS";
    out.push(Object.assign({rol:"locador",prefix:"res_alq_comision_locador"},getComisionConfig(op,"res_alq_comision_locador",baseR,monedaR,"res_alq_comision_locador",valorComisionPredeterminado(op.res_alq_comision,"1"))));
    out.push(Object.assign({rol:"locatario",prefix:"res_alq_comision_locatario"},getComisionConfig(op,"res_alq_comision_locatario",baseR,monedaR,"res_alq_comision_locatario",valorComisionPredeterminado(op.res_alq_comision,"1"))));
  } else if(tipo==="exclusividad") {
    var baseE=parseMontoAR(op.precio||0), monedaE=op.moneda||"USD";
    out.push(Object.assign({rol:"vendedor",prefix:"comision_vendedor"},getComisionConfig(op,"comision_vendedor",baseE,monedaE,"comision_vendedor",valorComisionPredeterminado(op.comision_porcentaje,""))));
  }
  return out.filter(function(c){return c.valor!=="" || c.monto>0;});
}
function totalComisionEnMoneda(entry,moneda,campo){
  var arr=entry&&entry.items?entry.items:[];
  return arr.filter(function(c){return c.moneda===moneda;}).reduce(function(sum,c){return sum+(c.monto||0);},0)*((campo&&entry[campo]!=null)?entry[campo]:1);
}

// Convierte un objeto "doc" (salida de buildDocSections) a texto plano, para
// mandarlo como contexto a la IA o para copiarlo/exportarlo. Misma lógica que
// usa el preview interno del visor de documentos.
function docToPlainText(doc) {
  var lines = [doc.titulo || ""];
  if (doc.nroRecibo) lines.push("N° " + doc.nroRecibo);
  lines.push("Lugar: " + (doc.ciudad || "") + "  |  Fecha: " + (doc.fecha || ""), "");
  if (doc.encabezado) { doc.encabezado.split("\n\n").forEach(function(p){ lines.push(p, ""); }); }
  (doc.partes || []).forEach(function(p){ if(!doc.ocultarPartesEnCuerpo) lines.push(p.rol + ": " + p.nombre + (p.dni ? " — " + p.dni : "")); });
  lines.push("");
  (doc.secciones || []).forEach(function(sec){
    var prefix=prefijoClausulaFormal(sec.titulo);
    (sec.items||[]).forEach(function(item,idx){
      if(!item)return;
      lines.push(idx===0?prefix+cuerpoTrasRotulo(item):normalizarTextoDocumento(item));
    });
    lines.push("");
  });
  if (doc.clausulas && doc.clausulas.length > 0) {
    doc.clausulas.forEach(function(c){ lines.push(prefijoClausulaDesdeNumTitulo(c.num,c.titulo||"")+cuerpoTrasRotulo(c.texto||"")); lines.push(""); });
  }
  contactosDocumento(doc).forEach(function(line){lines.push(line);});
  (doc.firmas||[]).forEach(function(f){lines.push("Firma: "+(f.rol||"")+" — "+(f.nombre||"")+(f.dni?" — "+f.dni:""));});
  if(doc.conformidad){
    lines.push("PRESTA CONFORMIDAD");
    (doc.conformidad.items||[]).forEach(function(t,i){lines.push((i+1)+". "+t);});
    (doc.conformidad.firmantes&&doc.conformidad.firmantes.length?doc.conformidad.firmantes:[{nombre:doc.conformidad.firmante,dni:doc.conformidad.dni}]).forEach(function(f){lines.push("Firma: "+(doc.conformidad.rol||"VENDEDOR")+" — "+(f.nombre||"")+(f.dni?" — "+f.dni:""));});
  }
  return lines.join("\n");
}

// ── Conversor de números a letras (español, uso legal/monetario) ────────────

function fmtD(d) {
  if (!d) return "___";
  const p = d.split("-"); return p[2]+"/"+p[1]+"/"+p[0];
}
var ROL_A_PARTE = { COMPRADOR:"parte compradora", VENDEDOR:"parte vendedora", LOCADOR:"parte locadora", LOCATARIO:"parte locataria" };
var FORMAS_PAGO = [
  {value:"transferencia",label:"Transferencia bancaria"},
  {value:"efectivo",label:"Efectivo"},
  {value:"cheque",label:"Cheque"},
  {value:"deposito",label:"Depósito bancario"},
  {value:"mercadopago",label:"Mercado Pago / billetera virtual"},
];
function formaPagoArr(v){ return Array.isArray(v)?v:(v?[v]:[]); }
function formaPagoTexto(v){
  var arr=formaPagoArr(v).map(function(k){var f=FORMAS_PAGO.find(function(x){return x.value===k;});return f?f.label.toLowerCase():k;});
  if(arr.length===0)return "transferencia bancaria";
  if(arr.length===1)return arr[0];
  return arr.slice(0,-1).join(", ")+" o "+arr[arr.length-1];
}
var DIAS_SEM_LARGO = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
var MESES_LARGO = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
// Fecha en formato escrito completo, ej: "miércoles 13 de agosto de 2026" — usado en el
// encabezado (Lugar/Fecha) de todos los documentos generados.
function fmtDLarga(d) {
  if (!d) d = new Date().toISOString().slice(0,10);
  const p = d.split("-");
  const dt = new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10));
  if (isNaN(dt.getTime())) return "___";
  return DIAS_SEM_LARGO[dt.getDay()]+" "+parseInt(p[2],10)+" de "+MESES_LARGO[parseInt(p[1],10)-1]+" de "+p[0];
}
// Plazo del comodato: si se cargó sólo un número se interpreta como meses ("12" → "12 meses").
function textoDuracionDias(v){
  var t=String(v==null?"":v).trim();
  if(!t) return "___";
  if(/^\d+$/.test(t)) return t+(t==="1"?" día":" días");
  return t;
}
// 4.29: el plazo del comodato se elige con calendario (inicio y vencimiento) y se redacta solo.
function plazoComodatoDesdeFechas(ini,fin){
  if(!fin) return "";
  var f=fmtD(fin);
  if(!ini) return "tiempo determinado, con vencimiento el "+f;
  var i=parseISOLocal(ini), e=parseISOLocal(fin);
  if(!i||!e||e<=i) return "tiempo determinado, con vencimiento el "+f;
  for(var n=1;n<=240;n++){ if(isoLocal(sumarMesesLocal(i,n))===fin){ return n+(n===1?" mes":" meses")+", con inicio el "+fmtD(ini)+" y vencimiento el "+f; } }
  var dias=Math.round((e.getTime()-i.getTime())/86400000);
  return dias+(dias===1?" día":" días")+", con inicio el "+fmtD(ini)+" y vencimiento el "+f;
}
function textoPlazoComodato(v){
  var t=String(v==null?"":v).trim();
  if(!t) return "___";
  if(/^\d+$/.test(t)) return t+(t==="1"?" mes":" meses");
  return t;
}
function parseISOLocal(ds){ var m=String(ds||"").match(/^(\d{4})-(\d{2})-(\d{2})/); if(!m) return null; return new Date(parseInt(m[1],10),parseInt(m[2],10)-1,parseInt(m[3],10)); }
function isoLocal(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function sumarMesesLocal(d,meses){ var tot=d.getFullYear()*12+d.getMonth()+meses; var ny=Math.floor(tot/12),nm=((tot%12)+12)%12; var last=new Date(ny,nm+1,0).getDate(); return new Date(ny,nm,Math.min(d.getDate(),last)); }
// Suma meses (con tope al último día del mes) y días a una fecha ISO, sin pasar por UTC (evita corrimientos de un día).
function addMonthsDias(ds, m, dias) {
  var d=parseISOLocal(ds); if(!d) return "";
  var r=sumarMesesLocal(d,parseInt(m,10)||0);
  r.setDate(r.getDate()+(parseInt(dias,10)||0));
  return isoLocal(r);
}
// Un contrato de N meses que arranca el día D vence el día anterior a D (ej.: 01/02/2025 + 24 meses → 31/01/2027).
function finContratoISO(inicio,meses,dias){
  if(!parseISOLocal(inicio)) return "";
  if(!(parseInt(meses,10)>0)&&!(parseInt(dias,10)>0)) return "";
  var r=parseISOLocal(addMonthsDias(inicio,meses,dias)); r.setDate(r.getDate()-1); return isoLocal(r);
}
function finAlquilerISO(op){
  op=op||{};
  if(op.alquiler_inicio&&((parseInt(op.alquiler_plazo_meses,10)>0)||(parseInt(op.alquiler_plazo_dias,10)>0))) return finContratoISO(op.alquiler_inicio,op.alquiler_plazo_meses,op.alquiler_plazo_dias);
  return op.alquiler_fin||"";
}
// Plazo estimado de la Reserva de Locación (cantidad + unidad) convertido a meses/días reales.
function plazoReservaAlquiler(op){
  op=op||{};
  var c=parseInt(op.res_alq_plazo_cantidad,10); if(!(c>0)) c=24;
  var u=String(op.res_alq_plazo_unidad||"meses").toLowerCase();
  var meses=0,dias=0,texto;
  if(u==="años"||u==="anos"){ meses=c*12; texto=c+(c===1?" año":" años"); }
  else if(u==="semanas"){ dias=c*7; texto=c+(c===1?" semana":" semanas"); }
  else { meses=c; texto=c+(c===1?" mes":" meses"); }
  return {meses:meses,dias:dias,texto:texto};
}
function finReservaAlquilerISO(op){ var pl=plazoReservaAlquiler(op); return finContratoISO(op&&op.res_alq_inicio_estimado,pl.meses,pl.dias); }
// Fecha del documento (lugar y fecha del encabezado): la de creación de la operación, no la de posesión ni la de inicio del contrato.
function fechaDocumentoISO(op){
  op=op||{};
  if(op.fecha_documento&&parseISOLocal(op.fecha_documento)) return op.fecha_documento;
  if(op.created_at){ var d=new Date(op.created_at); if(!isNaN(d.getTime())) return isoLocal(d); }
  return isoLocal(new Date());
}
function plazoAlquilerTexto(meses, dias) {
  var m = parseInt(meses,10)||0, d = parseInt(dias,10)||0;
  var partes=[];
  if (m>0) partes.push(m+(m===1?" mes":" meses"));
  if (d>0) partes.push(d+(d===1?" día":" días"));
  return partes.length ? partes.join(" y ") : "0 meses";
}
function genId() {
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
  return Date.now().toString(36) + Math.random().toString(36).slice(2,10);
}

// ── CACHÉ Y BORRADORES LOCALES (localStorage) ───────────────────────────────
// Conserva borradores y preferencias ante recargas o desconexiones.
// NO constituye un respaldo en la nube: operaciones, cláusulas y perfiles
// deben confirmarse mediante las funciones RPC de Supabase antes de darse
// por sincronizados. Nunca asumir que guardar en este dispositivo equivale
// a guardar para otros dispositivos o integrantes de la inmobiliaria.
var LS_PREFIX = "docworks:v1:";
function lsGet(key, fallback) {
  try {
    var raw = window.localStorage.getItem(LS_PREFIX + key);
    if (raw === null || raw === undefined || raw === "") return fallback;
    var parsed = JSON.parse(raw);
    return parsed === undefined || parsed === null ? fallback : parsed;
  } catch (e) { return fallback; }
}
function lsSet(key, value) {
  try { window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); return true; }
  catch (e) {
    var quota = !!(e && (e.name === "QuotaExceededError" || e.code === 22 || e.code === 1014));
    if (quota) dwNotify("error","No hay espacio suficiente en el almacenamiento de este dispositivo. El dato no se pudo guardar localmente. Si tenés un logo grande, probá usar una imagen más liviana.");
    else console.warn("DocWorks: no se pudo guardar el dato local.",e);
    return false;
  }
}
function lsRemove(key) {
  try { window.localStorage.removeItem(LS_PREFIX + key); } catch (e) { console.debug("DocWorks: no se pudo limpiar el dato local solicitado.",e); }
}
// Hook: guarda `value` en localStorage bajo `key` cada vez que cambia.
// Con delay=0 el guardado es inmediato; con delay>0 usa debounce.
// onStatus(state) opcional, para alimentar el indicador visible de guardado.
function useAutosave(key, value, delay, onStatus) {
  var timerRef = useRef(null);
  var firstRef = useRef(true);
  var savingRef = useRef(false);
  useEffect(function() {
    if (firstRef.current) { firstRef.current = false; return; } // no reescribir el valor recién cargado
    if (timerRef.current) clearTimeout(timerRef.current);
    // Un mismo autosave tiene un único estado "saving" aunque el usuario
    // siga escribiendo y el debounce se reprograme varias veces. Antes se
    // incrementaba el contador en cada tecla y solo se descontaba una vez,
    // dejando el indicador clavado en "Autoguardando…".
    if (!savingRef.current) {
      savingRef.current = true;
      if (onStatus) onStatus("saving");
    }
    function persist(){
      var persistedValue = (key === "draftOperacion" && value && value.data)
        ? Object.assign({}, value, {ts:Date.now()})
        : value;
      var ok = lsSet(key, persistedValue);
      savingRef.current = false;
      if (onStatus) onStatus(ok ? "saved" : "error");
    }
    var wait = delay === undefined || delay === null ? 400 : delay;
    if(wait <= 0) persist();
    else timerRef.current = setTimeout(persist, wait);
    return function(){
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, value]);
  useEffect(function(){
    return function(){
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savingRef.current) {
        savingRef.current = false;
        if (onStatus) onStatus("saved");
      }
    };
  }, []);
}
// ── INDICADOR DE GUARDADO AUTOMÁTICO ─────────────────────────────────────────
// Todo el estado vive en localStorage (sin backend), así que "sin conexión"
// no bloquea el guardado — solo se avisa porque puede ser relevante para el
// broker (ej: no se van a sincronizar cambios con otro dispositivo/colega).
function useOnlineStatus(){
  var [online,setOnline]=useState(typeof navigator!=="undefined"?navigator.onLine:true);
  useEffect(function(){
    function on(){setOnline(true);} function off(){setOnline(false);}
    window.addEventListener("online",on); window.addEventListener("offline",off);
    return function(){window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);
  return online;
}
function relativeTimeCorto(ts){
  var s=Math.max(0,Math.round((Date.now()-ts)/1000));
  if(s<3) return "recién";
  if(s<60) return "hace "+s+"s";
  var m=Math.round(s/60);
  if(m<60) return "hace "+m+"m";
  var h=Math.round(m/60);
  return "hace "+h+"h";
}
function AutosaveIndicator({status, compact}){
  // Se re-renderiza cada pocos segundos solo para refrescar el "hace Ns",
  // sin depender de que cambie algún dato real.
  var [, force] = useState(0);
  useEffect(function(){
    var t=setInterval(function(){ force(function(n){return n+1;}); }, 5000);
    return function(){ clearInterval(t); };
  },[]);
  var online = useOnlineStatus();
  var color, icon, txt, fullTxt;
  if(!online){
    color="var(--gold)"; icon="💾"; fullTxt="Sin conexión — autoguardado local"; txt = compact?"Sin conexión":fullTxt;
  } else if(status.state==="error"){
    color="var(--red)"; icon="💾"; fullTxt="No se pudo autoguardar"; txt = fullTxt;
  } else if(status.state==="saving"){
    color="var(--dim)"; icon="💾"; fullTxt="Autoguardando…"; txt = fullTxt;
  } else {
    fullTxt="Autoguardado "+relativeTimeCorto(status.ts);
    color="var(--green)"; icon="💾"; txt = compact?"Autoguardado "+relativeTimeCorto(status.ts):fullTxt;
  }
  return (
    <span title={compact?fullTxt:undefined} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:compact?10.5:12,color:color,fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap"}}>
      <span style={{display:"inline-block",animation:status.state==="saving"?"diskpulse 0.9s ease-in-out infinite":"none"}}>{icon}</span>
      {txt}
    </span>
  );
}
// Purga de la papelera: elimina definitivamente lo que lleva más de 30 días.
var PAPELERA_DIAS = 30;
function purgePapeleraArr(arr) {
  var limite = Date.now() - PAPELERA_DIAS*24*60*60*1000;
  return (arr||[]).filter(function(o){ return new Date(o.deleted_at||o.created_at).getTime() > limite; });
}

// ── EXPORTAR / IMPORTAR RESPALDO COMPLETO (JSON) ─────────────────────────────
// Todo el estado de la app vive únicamente en localStorage del dispositivo
// (no hay backend). Esto permite bajar un .json con todo (operaciones,
// papelera, cláusulas, perfil, equipo y auditoría) para respaldarlo o
// migrarlo a otra computadora, y volver a cargarlo con "Importar".
var BACKUP_VERSION = 1;
var BACKUP_KEYS = ["operaciones","papelera","clausulas","perfil","equipo","auditLog"];
function buildRespaldoObject(state) {
  return {
    app: "DocWorks",
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      operaciones: state.operaciones || [],
      papelera: state.papelera || [],
      clausulas: state.clausulas || [],
      perfil: state.perfil || {},
      equipo: state.equipo || [],
      auditLog: state.auditLog || [],
    },
  };
}
function descargarRespaldoJSON(state) {
  var payload = buildRespaldoObject(state);
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  var fecha = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = "docworks-respaldo-" + fecha + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
}
// Valida (mínimamente) y normaliza un JSON importado antes de aplicarlo.
// Devuelve { ok:true, data } o { ok:false, error }.
function parseRespaldoJSON(rawText) {
  var parsed;
  try { parsed = JSON.parse(rawText); }
  catch (e) { return { ok:false, error:"El archivo no es un JSON válido." }; }
  var data = parsed && parsed.data ? parsed.data : parsed; // acepta backup con o sin envoltorio
  if (!data || typeof data !== "object") return { ok:false, error:"El archivo no tiene el formato esperado de un respaldo de DocWorks." };
  var tieneAlgo = BACKUP_KEYS.some(function(k){ return data[k] !== undefined; });
  if (!tieneAlgo) return { ok:false, error:"El archivo no contiene datos reconocibles de DocWorks (operaciones, cláusulas, perfil, equipo)." };
  return {
    ok:true,
    data: {
      operaciones: Array.isArray(data.operaciones) ? data.operaciones : undefined,
      papelera: Array.isArray(data.papelera) ? data.papelera : undefined,
      clausulas: Array.isArray(data.clausulas) ? data.clausulas : undefined,
      perfil: (data.perfil && typeof data.perfil==="object") ? data.perfil : undefined,
      equipo: Array.isArray(data.equipo) ? data.equipo : undefined,
      auditLog: Array.isArray(data.auditLog) ? data.auditLog : undefined,
    },
  };
}

// ── AUDITORÍA (registro de cambios en cláusulas) ─────────────────────────────
// Guarda quién (nombre + rol), qué acción y sobre qué cláusula, con el detalle
// de los campos modificados (valor anterior → nuevo) para evitar alteraciones
// no autorizadas de las plantillas sin dejar rastro.
var AUDIT_LOG_MAX = 500;
function nuevoAuditEntry(actor, accion, clausula, cambios) {
  return {
    id: genId(),
    ts: new Date().toISOString(),
    actorNombre: (actor && (actor.nombre_usuario || actor.nombre)) || "Usuario sin nombre",
    actorRol: (actor && actor.rol) || "",
    accion: accion,               // "crear" | "editar" | "eliminar"
    clausulaId: clausula && clausula.id,
    clausulaTitulo: clausula && clausula.titulo,
    cambios: cambios || null,      // array [{campo, antes, despues}] (solo para "editar")
  };
}
// Compara los campos relevantes de una cláusula antes/después de editarla.
function diffClausula(antes, despues) {
  var campos = ["titulo","categoria","contenido","tipos"];
  var out = [];
  campos.forEach(function(k){
    var a = antes ? antes[k] : undefined;
    var d = despues ? despues[k] : undefined;
    var aStr = Array.isArray(a) ? a.join(", ") : (a===undefined||a===null?"":String(a));
    var dStr = Array.isArray(d) ? d.join(", ") : (d===undefined||d===null?"":String(d));
    if (aStr !== dStr) out.push({ campo:k, antes:aStr, despues:dStr });
  });
  return out;
}
// Copia texto al portapapeles con fallback robusto: navigator.clipboard puede fallar
// silenciosamente (o no existir) dentro de iframes/sandboxes sin permiso de "clipboard-write",
// que es el entorno donde suele correr esta app embebida. Si falla, usamos un textarea oculto
// + document.execCommand("copy") como respaldo, y si todo falla mostramos el link para copiar a mano.
function copiarAlPortapapeles(texto, onOk, onFail) {
  function legacyFallback() {
    try {
      var ta = document.createElement("textarea");
      ta.value = texto;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      var ok = document.execCommand && document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) { onOk && onOk(); } else { onFail && onFail(); }
    } catch (e) { onFail && onFail(); }
  }
  if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext !== false) {
    navigator.clipboard.writeText(texto).then(function(){ onOk && onOk(); }).catch(legacyFallback);
  } else {
    legacyFallback();
  }
}
function palabrasDias(d) { const m={"3":"tres","5":"cinco","7":"siete","10":"diez","15":"quince","20":"veinte","30":"treinta"}; return m[String(d)]||String(d); }
var TIPO_INMUEBLE_OPCIONES = [
  {value:"departamento",label:"Departamento"},
  {value:"casa",label:"Casa"},
  {value:"local",label:"Local comercial"},
  {value:"oficina",label:"Oficina"},
  {value:"lote",label:"Lote"},
  {value:"terreno",label:"Terreno"},
  {value:"quinta",label:"Quinta"},
  {value:"campo",label:"Campo"},
  {value:"galpon",label:"Galpón"},
  {value:"otro",label:"Otro"},
];
function tipoInmuebleLabel(t,otro){
  if(t==="otro") return (otro&&otro.trim())?otro.trim():"Inmueble";
  var found=TIPO_INMUEBLE_OPCIONES.find(function(o){return o.value===t;});
  return found?found.label:"Inmueble";
}
// Pone en mayúscula la primera letra de cada palabra de un nombre propio,
// dejando en minúscula los conectores habituales (de, del, la, y, etc.)
// salvo que sean la primera palabra. Se aplica al perder el foco (onBlur),
// no en cada tecla, para no interferir con lo que la persona está tipeando.
var CONECTORES_NOMBRE = ["de","del","la","las","los","y","el","van","von","da","do"];
function capitalizarNombrePropio(s){
  if(!s) return s;
  var partes = String(s).split(/(\s+)/);
  var idxPalabra = 0;
  return partes.map(function(tok){
    if(/^\s*$/.test(tok)) return tok;
    var esPrimera = idxPalabra===0;
    idxPalabra++;
    var lower = tok.toLowerCase();
    if(!esPrimera && CONECTORES_NOMBRE.indexOf(lower)>=0) return lower;
    return lower.charAt(0).toUpperCase()+lower.slice(1);
  }).join("");
}
// Estilo rojo + mensaje para un campo crítico marcado como faltante al editar
// (ver getCamposFaltantesDetalle). faltantes es un array de claves de campo.
function estiloCampoFaltante(faltantes,campo){
  return (faltantes&&faltantes.indexOf(campo)>=0) ? {style:{borderColor:"#ef4444",background:"rgba(239,68,68,0.07)",boxShadow:"0 0 0 3px rgba(239,68,68,0.14)"},error:"Falta completar este dato"} : {};
}

// Fusiona secciones + cláusulas de biblioteca + cláusulas de texto libre en UNA
// numeración corrida y profesional (sin encabezados tipo "CLAUSULAS ADICIONALES").
function normalizarDocumento(doc) {
  if (!doc) return doc;
  var out = Object.assign({}, doc);
  var norm = normalizarTextoDocumento;
  ["titulo","subtitulo","encabezado","ciudad","fecha"].forEach(function(k){
    if (out[k] != null) out[k] = norm(out[k]);
  });
  out.partes = (out.partes || []).map(function(p){
    return Object.assign({}, p, {
      rol:norm(p.rol), nombre:norm(p.nombre), dni:norm(p.dni), domicilio:norm(p.domicilio), telefono:p.telefono?norm(p.telefono):p.telefono, email:p.email?norm(p.email):p.email
    });
  });
  out.secciones = (out.secciones || []).map(function(sec){
    return Object.assign({}, sec, {
      titulo:norm(sec.titulo),
      items:(sec.items || []).map(function(item){ return norm(item); })
    });
  });
  out.clausulas = (out.clausulas || []).map(function(c){
    return Object.assign({}, c, {titulo:norm(c.titulo), texto:norm(c.texto)});
  });
  out.firmas = (out.firmas || []).map(function(f){
    return Object.assign({}, f, {rol:norm(f.rol), nombre:norm(f.nombre), dni:norm(f.dni)});
  });
  if (out.conformidad) {
    out.conformidad = Object.assign({}, out.conformidad, {
      items:(out.conformidad.items || []).map(function(t){ return norm(t); }),
      firmante:norm(out.conformidad.firmante),
      dni:norm(out.conformidad.dni)
    });
  }
  return out;
}

function asegurarFirmasDocumento(doc, op, perfil) {
  if (!doc) return doc;
  var firmas = (doc.firmas && doc.firmas.length) ? doc.firmas.slice() : [];
  // Expandir cada rol con co-titulares a una firma individual por persona.
  // El texto legal conserva los nombres unidos, pero el bloque de firmas no.
  var prefijoPorRol={"VENDEDOR":"vendedor","COMPRADOR":"comprador","OFERENTE":"comprador","LOCADOR":"locador","LOCATARIO":"locatario","COMODANTE":"vendedor","COMODATARIO":"comprador","AUTORIZANTE":"vendedor"};
  var expandidas=[];
  firmas.forEach(function(f){
    if(!f||f.usarPerfil){expandidas.push(f);return;}
    var rol=String(f.rol||"").toUpperCase(), prefix=null;
    Object.keys(prefijoPorRol).some(function(k){if(rol.indexOf(k)>=0){prefix=prefijoPorRol[k];return true;}return false;});
    var personas=prefix&&op?personasDe(op,prefix):[];
    if(personas.length>1 || (personas.length===1 && !String(op[prefix+"_nombre"]||"").trim())){
      // También expandir cuando solo existe un cotitular y el principal está vacío.
      // Si la firma ya identifica a un cotitular, no volver a expandirla.
      // La normalización puede ejecutarse más de una vez (vista previa,
      // PDF y DOCX); expandir de nuevo duplicaba firmas en cada pasada.
      var nombreFirma=String(f.nombre||"").trim().toLocaleLowerCase("es-AR");
      var dniFirma=String(f.dni||"").replace(/\D/g,"");
      var yaIndividual=personas.some(function(persona){
        var nombrePersona=String(persona.nombre||"").trim().toLocaleLowerCase("es-AR");
        var dniPersona=String(persona.dni||"").replace(/\D/g,"");
        return (dniFirma&&dniPersona&&dniFirma===dniPersona)||(nombreFirma&&nombrePersona&&nombreFirma===nombrePersona);
      });
      if(yaIndividual) expandidas.push(f);
      else personas.forEach(function(persona){expandidas.push(Object.assign({},f,{nombre:persona.nombre,dni:persona.dni||"",domicilio:persona.domicilio||f.domicilio}));});
    }
    else expandidas.push(f);
  });
  // Evitar firmas repetidas provenientes de plantillas históricas que
  // incluían más de una vez el mismo rol y titular. No fusionar personas
  // distintas: la clave incluye rol, nombre y DNI.
  var clavesFirmas={};
  firmas=expandidas.filter(function(f){
    if(!f) return true;
    var rol=String(f.rol||"").trim().toLocaleLowerCase("es-AR");
    var nombre=String(f.nombre||"").trim().toLocaleLowerCase("es-AR");
    var dni=String(f.dni||"").replace(/\D/g,"");
    if(!rol || (!nombre && !dni) || f.usarPerfil) return true;
    var clave=rol+"|"+nombre+"|"+dni;
    if(clavesFirmas[clave]) return false;
    clavesFirmas[clave]=true;
    return true;
  });
  // Normalizar duplicados históricos: debe existir una sola firma de inmobiliaria
  // y la fuente de nombre/matrícula es siempre el perfil.
  var indiceInmob=-1;
  firmas=firmas.filter(function(f){
    var esInmob=!!(f&&(f.usarPerfil||String(f.rol||"").toUpperCase().indexOf("INMOBILIARIA")>=0));
    if(!esInmob) return true;
    if(indiceInmob>=0) return false;
    indiceInmob=1;
    return true;
  });
  var tieneInmob=indiceInmob>=0;
  firmas=firmas.map(function(f){
    return f&&String(f.rol||"").toUpperCase().indexOf("INMOBILIARIA")>=0?Object.assign({},f,{usarPerfil:true}):f;
  });
  if (!tieneInmob) firmas.push({rol:"INMOBILIARIA INTERVINIENTE", nombre:"", dni:"", usarPerfil:true});

  var garanteNombre = op && op.alquiler_garantia_titular;
  var garanteDni = op && op.alquiler_garantia_dni;
  var tieneGarante = firmas.some(function(f){ return String(f&&f.rol||"").toUpperCase().indexOf("GARANTE")>=0; });
  if (op&&op.tipo==="alquiler"&&garanteNombre && !tieneGarante) firmas.push({rol:"GARANTE", nombre:garanteNombre, dni:garanteDni||""});

  // En la Reserva, el Vendedor firma específicamente en PRESTA CONFORMIDAD;
  // no se duplica esa firma en el bloque principal.
  doc.firmas = firmas;
  if(doc.conformidad&&op){
    var prefConformidad=op.tipo==="reserva_alquiler"?"locador":"vendedor";
    doc.conformidad.firmantes=personasDe(op,prefConformidad).map(function(p){return {nombre:p.nombre,dni:p.dni||"",rol:doc.conformidad.rol||rolParte(op.tipo,0)};});
  }
  return doc;
}

function finalizeDoc(doc, op, clausulasLib) {
  // Numerar las cláusulas adicionales desde el mayor número REAL de las secciones.
  // La cantidad de secciones no necesariamente coincide con su último ordinal
  // en modelos históricos o personalizados.
  var n = (doc.secciones || []).reduce(function(max,sec){
    var parsed=parseTituloClausula(sec&&sec.titulo);
    return Math.max(max,parsed.num||0);
  },0);
  if(!n) n=(doc.secciones||[]).length;
  var extra = [];
  var contenidosVistos=new Set();
  (doc.secciones||[]).forEach(function(sec){(sec.items||[]).forEach(function(item){var clave=claveContenidoClausula(item);if(clave)contenidosVistos.add(clave);});});
  function agregarExtra(titulo,texto,obligatoria){
    var clave=claveContenidoClausula(texto);
    if(!clave||contenidosVistos.has(clave))return;
    contenidosVistos.add(clave);
    n++;
    extra.push({num:n,titulo:String(titulo||"").trim()||"CONDICIÓN PARTICULAR",texto:texto,obligatoria:!!obligatoria});
  }
  var seleccionadasIds = op.clausulas_ids || [];
  // El orden final sigue el orden de la biblioteca (el que definió el
  // Dueño/Administrador en Configuración → Plantillas con las flechas ↑/↓),
  // no el orden en que el broker las fue tildando. Las obligatorias se
  // incluyen siempre — aunque no figuren en clausulas_ids — como garantía
  // de que nunca falten, incluso en operaciones creadas antes de marcarlas
  // obligatorias.
  clausulasLib
    .filter(function(c) {
      if (!clausulaAplicaTipo(c, op.tipo)) return false;
      // Compatibilidad: si una plantilla histórica arrastró la cláusula
      // genérica de compraventa, nunca debe entrar en alquiler/reserva de alquiler.
      if ((op.tipo==="alquiler" || op.tipo==="reserva_alquiler") && c.id==="c4") return false;
      if (clausulaRepiteSeccionDoc(c, doc)) return false;
      return c.obligatoria || seleccionadasIds.indexOf(c.id) !== -1;
    })
    .forEach(function(c) {
      agregarExtra(resolveVars(c.titulo, op),resolveVars(c.contenido, op)+detalleClausulaOperacion(c,op),c.obligatoria);
    });
  if (op.clausulas_custom && op.clausulas_custom.trim()) {
    if (op.clausulas_custom_titulo && op.clausulas_custom_titulo.trim()) {
      agregarExtra(resolveVars(op.clausulas_custom_titulo.trim(), op),resolveVars(op.clausulas_custom.trim(), op),false);
    } else {
      op.clausulas_custom.split("\n").filter(function(l){ return l.trim(); }).forEach(function(l) {
        agregarExtra(null,resolveVars(l.trim(), op),false);
      });
    }
  }
  doc.clausulas = extra;
  // Adaptación de un rótulo heredado de compraventa/alquiler que aparecía
  // literalmente en comodatos. No altera el resto de la cláusula ni el modelo guardado.
  if(op.tipo==="comodato"){
    var rolHeredado=/PARTE\s+VENDEDORA\s*\(\s*o\s+LOCADORA\s*\)/gi;
    (doc.secciones||[]).forEach(function(sec){
      sec.items=(sec.items||[]).map(function(item){return String(item).replace(rolHeredado,"PARTE COMODANTE");});
    });
    doc.clausulas.forEach(function(c){c.texto=String(c.texto||"").replace(rolHeredado,"PARTE COMODANTE");});
    if(doc.conformidad&&Array.isArray(doc.conformidad.items)) doc.conformidad.items=doc.conformidad.items.map(function(item){return String(item).replace(rolHeredado,"PARTE COMODANTE");});
  }
  doc.tipoDocumento = op.tipo;
  if(op.tipo==="comodato"){
    (doc.partes||[]).forEach(function(p,i){p.rol=i===0?"COMODANTE":"COMODATARIO";});
    (doc.firmas||[]).forEach(function(p){var r=String(p.rol||"").toUpperCase();if(/VENDEDOR|LOCADOR/.test(r))p.rol="COMODANTE";else if(/COMPRADOR|LOCATARIO/.test(r))p.rol="COMODATARIO";});
    if(doc.conformidad&&doc.conformidad.rol) doc.conformidad.rol=String(doc.conformidad.rol).replace(/VENDEDOR|LOCADOR/gi,"COMODANTE").replace(/COMPRADOR|LOCATARIO/gi,"COMODATARIO");
  }
  // El documento exportado conserva la versión de plantilla con la que se generó.
  doc.plantilla_version = op.plantilla_version || 1;
  doc.plantilla_version_label = "v" + doc.plantilla_version;
  doc.fechaArchivo = new Date().toISOString().slice(0,10);
  delete doc.customClausulas;
  doc = asegurarFirmasDocumento(doc, op, null);
  var rolesDoc=rolesPorTipo(op.tipo);
  if(Array.isArray(doc.partes)) doc.partes=doc.partes.map(function(p,i){return Object.assign({},p,{rol:rolesDoc[i]||p.rol});});
  // Contactos por persona: nunca adjudicar a todos los titulares los datos
  // agregados de un rol. El nombre y cada permiso pertenecen a su titular.
  doc.contactosIndividuales = contactosIndividualesDocumento(op, doc.partes||[]);
  if(Array.isArray(doc.partes)) doc.partes=doc.partes.map(function(p){
    // Los contactos se imprimen exclusivamente en el bloque individual.
    return Object.assign({},p,{telefono:"",email:""});
  });
  // Las firmas no deben renombrarse por posición: una Reserva firma como
  // OFERENTE y la inmobiliaria, mientras que la conformidad del propietario
  // se firma en un bloque separado. Sobrescribir por índice hacía que la
  // firma del oferente apareciera como VENDEDOR y la de la inmobiliaria como
  // COMPRADOR, dejando ambas etiquetas incorrectas.
  if(Array.isArray(doc.firmas)) doc.firmas=doc.firmas.map(function(f){return Object.assign({},f,{rol:String(f.rol||"").trim()});});
  if(doc.conformidad) doc.conformidad.rol=rolParte(op.tipo,0);
  return normalizarDocumento(doc);
}

// ── MULTI-TITULARIDAD (co-titulares) ────────────────────────────────────────
// Permite que un rol (comprador, vendedor, locador, locatario) tenga más de
// una persona — ej. un inmueble a nombre de dos hermanos, o dos inquilinos
// que alquilan juntos. El titular "principal" sigue viviendo en los campos
// de siempre ({prefix}_nombre/_dni/_domicilio/_email/_telefono); los demás
// se guardan en {prefix}_cotitulares como un array. Antes de generar
// cualquier documento, opParaDocumento() funde todos los titulares de cada
// rol en un solo texto por campo (ej. "Juan Pérez y María Gómez"), para que
// todo el motor de documentos —que ya referencia op.<prefix>_nombre en
// decenas de lugares repartidos en los 8 tipos— muestre automáticamente a
// todos los titulares sin tener que reescribir cada cláusula una por una.
//
// El cuerpo legal mantiene nombres/DNI unidos para compatibilidad histórica;
// asegurarFirmasDocumento expande el bloque final a una firma por cotitular.
function personasDe(op, prefix) {
  if(op&&op.__personasOriginales&&Array.isArray(op.__personasOriginales[prefix])) return op.__personasOriginales[prefix].map(function(p){return Object.assign({},p);});
  var principal = { nombre:op[prefix+"_nombre"]||"", dni:op[prefix+"_dni"]||"", domicilio:op[prefix+"_domicilio"]||"", email:op[prefix+"_email"]||"", telefono:op[prefix+"_telefono"]||"" };
  var extra = (op[prefix+"_cotitulares"]||[]).filter(function(p){ return p && p.nombre && p.nombre.trim(); });
  return [principal].concat(extra).filter(function(p){ return p.nombre && p.nombre.trim(); });
}
function unirNombres(lista) {
  if (lista.length===0) return "";
  if (lista.length===1) return lista[0];
  if (lista.length===2) return lista[0]+" y "+lista[1];
  return lista.slice(0,-1).join(", ")+" y "+lista[lista.length-1];
}
// Nombre corto + indicador de co-titulares, para tarjetas y listados donde no
// hay lugar para el nombre completo de todos los titulares (ej. "Juan Pérez +1").
function nombreConSufijo(op, prefix, fallback) {
  var n = op[prefix+"_nombre"] || fallback;
  var extra = (op[prefix+"_cotitulares"]||[]).filter(function(p){ return p && p.nombre && p.nombre.trim(); }).length;
  return n + (extra>0 ? " +"+extra : "");
}
// 4.16 — Teléfono de cada parte: se carga siempre en la operación (ficha interna) y solo se imprime en el
// documento si el broker activa el interruptor "Mostrar en el documento" de esa parte ({prefix}_telefono_en_doc).
var PREFIJO_POR_ROL_DOC={"VENDEDOR":"vendedor","COMPRADOR":"comprador","OFERENTE":"comprador","LOCADOR":"locador","LOCATARIO":"locatario","COMODANTE":"vendedor","COMODATARIO":"comprador","AUTORIZANTE":"vendedor"};
// 4.28: el titular principal usa el interruptor del rol; cada co-titular tiene el suyo
// (si un co-titular guardado antes de la 4.28 no lo definió, hereda el del rol).
function contactoParaDocumento(op,prefix,campo){
  if(!op) return "";
  var rolOn=!!op[prefix+"_"+campo+"_en_doc"];
  var extras=(op[prefix+"_cotitulares"]||[]).filter(function(p){return p&&p.nombre&&p.nombre.trim();});
  var vals=[];
  if(rolOn && String(op[prefix+"_nombre"]||"").trim()) vals.push(String(op[prefix+"_"+campo]||"").trim());
  extras.forEach(function(p){
    var flag=p[campo+"_en_doc"];
    var mostrar=(typeof flag==="boolean")?flag:rolOn;
    if(mostrar) vals.push(String(p[campo]||"").trim());
  });
  return Array.from(new Set(vals.filter(Boolean))).join(" / ");
}
function telefonoParaDocumento(op,prefix){ return contactoParaDocumento(op,prefix,"telefono"); }
function emailParaDocumento(op,prefix){ return contactoParaDocumento(op,prefix,"email"); }
// Líneas "ROL: Nombre — Tel.: …" para los documentos que no imprimen el bloque de partes (el dato va en el párrafo inicial).
function contactosIndividualesDocumento(op, partes){
  var resultado=[], vistos={};
  (partes||[]).forEach(function(parte){
    var rol=String(parte&&parte.rol||"").toUpperCase(),pref=null;
    Object.keys(PREFIJO_POR_ROL_DOC).some(function(k){
      if(rol.indexOf(k)>=0){pref=PREFIJO_POR_ROL_DOC[k];return true;}return false;
    });
    if(!pref || vistos[pref]) return;
    vistos[pref]=true;
    var personas=personasDe(op,pref);
    personas.forEach(function(persona,i){
      // Si el titular principal no tiene nombre, la primera persona puede ser
      // un cotitular: sus permisos individuales no deben heredarse del principal.
      var principal=i===0 && !!String(op[pref+"_nombre"]||"").trim();
      var telOn=principal?!!op[pref+"_telefono_en_doc"]:
        (typeof persona.telefono_en_doc==="boolean"?persona.telefono_en_doc:!!op[pref+"_telefono_en_doc"]);
      var mailOn=principal?!!op[pref+"_email_en_doc"]:
        (typeof persona.email_en_doc==="boolean"?persona.email_en_doc:!!op[pref+"_email_en_doc"]);
      var tel=telOn?String(persona.telefono||"").trim():"";
      var email=mailOn?String(persona.email||"").trim():"";
      if(tel||email) resultado.push({rol:rol,nombre:String(persona.nombre||""),telefono:tel,email:email});
    });
  });
  return resultado;
}
function opParaDocumento(op) {
  // El documento siempre trabaja sobre una copia sanitizada. La operación
  // original conserva teléfono/email para la ficha interna y el seguimiento.
  var out=Object.assign({},op);
  var prefixes=["comprador","vendedor","locador","locatario"];
  // Conservar identidades originales para firmas y contactos después de unir los nombres.
  out.__personasOriginales={};
  prefixes.forEach(function(prefix){out.__personasOriginales[prefix]=personasDe(op,prefix);});
  prefixes.forEach(function(prefix){
    var personas=personasDe(op, prefix);
    if (personas.length>1) {
      out[prefix+"_nombre"] = unirNombres(personas.map(function(p){return p.nombre;}));
      out[prefix+"_dni"] = personas.map(function(p){return p.dni||"___";}).join(" y ");
      var domicilios = personas.map(function(p){return p.domicilio;}).filter(Boolean);
      out[prefix+"_domicilio"] = domicilios.length ? Array.from(new Set(domicilios)).join(" / ") : (op[prefix+"_domicilio"]||"");
    }
    // 4.20: teléfono y correo son datos internos. Solo viaja al documento si el broker activó "Mostrar en el documento".
    out[prefix+"_telefono_doc"]=telefonoParaDocumento(op,prefix);
    out[prefix+"_email_doc"]=emailParaDocumento(op,prefix);
    // Los contactos se mantienen en la operación original y solo se exponen al generador
    // mediante tokens separados cuando el broker habilita cada casilla.
    out[prefix+"_email"]=emailParaDocumento(op,prefix);
    out[prefix+"_telefono"]=telefonoParaDocumento(op,prefix);
  });
  // Preferencia por operación: no imprimir el honorario de una parte no altera la ficha interna.
  if(op.comision_vendedor_ocultar_doc){out.comision_vendedor="";out.comision_vendedor_valor="";out.comision_vendedor_texto="";}
  if(op.comision_comprador_ocultar_doc){out.comision_comprador="";out.comision_comprador_valor="";out.comision_comprador_texto="";}
  return out;
}

// ── ENCABEZADO PERSONALIZABLE (plantillas) ──────────────────────────────────
// El Dueño/Admin puede reemplazar el párrafo introductorio de cada tipo de
// documento por un texto propio, usando tokens {{campo}} que se completan
// automáticamente con los datos de la operación. Si no hay texto
// personalizado guardado para un tipo, se usa el texto por defecto del
// sistema (sin cambios). El resto del documento (partes, condiciones,
// cláusulas, firmas) sigue siendo 100% generado a partir de los datos
// cargados, así el broker solo se ocupa de completar el formulario y elegir
// cláusulas — no de redactar texto legal.
var ENCABEZADO_TOKENS_INFO = [
  ["comprador_nombre","Nombre del comprador/oferente"],["comprador_dni","DNI/CUIT del comprador"],["comprador_domicilio","Domicilio del comprador"],
  ["vendedor_nombre","Nombre del vendedor/titular"],["vendedor_dni","DNI/CUIT del vendedor"],["vendedor_domicilio","Domicilio del vendedor"],
  ["locador_nombre","Nombre del locador"],["locador_dni","DNI/CUIT del locador"],["locador_domicilio","Domicilio del locador"],
  ["locatario_nombre","Nombre del locatario"],["locatario_dni","DNI/CUIT del locatario"],["locatario_domicilio","Domicilio del locatario"],
  ["inmueble_direccion","Dirección del inmueble"],["inmueble_partido","Partido/Municipio"],["inmueble_provincia","Provincia"],["nomenclatura_catastral","Nomenclatura catastral (con coma inicial, o vacío)"],
  ["precio_letras","Precio de venta en letras"],["anticipo_letras","Anticipo/seña en letras"],["saldo_letras","Saldo en letras"],["alquiler_monto_letras","Canon mensual en letras"],
  ["fecha_operacion_larga","Fecha de la operación en formato largo"],["inmobiliaria_nombre","Nombre de la inmobiliaria"],["inmobiliaria_matricula","Matrícula de la inmobiliaria"],
];
function sustituirTokens(tpl, op, perfil, tipo) {
  var esAlq = tipo==="alquiler"||tipo==="reserva_alquiler";
  var map = {
    comprador_nombre:op.comprador_nombre||"___", comprador_dni:op.comprador_dni||"___", comprador_domicilio:op.comprador_domicilio||"___",
    vendedor_nombre:op.vendedor_nombre||"___", vendedor_dni:op.vendedor_dni||"___", vendedor_domicilio:op.vendedor_domicilio||"___",
    locador_nombre:op.locador_nombre||"___", locador_dni:op.locador_dni||"___", locador_domicilio:op.locador_domicilio||"___",
    locatario_nombre:op.locatario_nombre||"___", locatario_dni:op.locatario_dni||"___", locatario_domicilio:op.locatario_domicilio||"___",
    inmueble_direccion:op.inmueble_direccion||"___", inmueble_partido:op.inmueble_partido||"___", inmueble_provincia:op.inmueble_provincia||"___",
    nomenclatura_catastral: op.nomenclatura_catastral ? (", Nomenclatura Catastral "+op.nomenclatura_catastral) : "",
    nomenclatura_catastral_texto: op.nomenclatura_catastral ? (", Nomenclatura Catastral "+op.nomenclatura_catastral) : "",
    precio_letras: op.precio ? fmt$L(op.precio, op.moneda) : "___",
    anticipo_letras: op.anticipo ? fmt$L(op.anticipo, op.moneda) : "___",
    saldo_letras: op.saldo ? fmt$L(op.saldo, op.moneda) : "___",
    alquiler_monto_letras: op.alquiler_monto_inicial ? fmt$L(op.alquiler_monto_inicial, op.alquiler_moneda) : "___",
    fecha_operacion_larga: (function(){ var f=(esAlq ? op.alquiler_inicio : ((op.tipo==="reserva"||op.tipo==="refuerzo_reserva"||op.tipo==="devolucion_reserva") ? (op.fecha_instrumento||op.fecha_operacion||op.fecha) : op.fecha_posesion)) || op.fecha_operacion || op.fecha || (op.created_at ? String(op.created_at).slice(0,10) : ""); return f ? fmtDLarga(f) : "___"; })(),
    inmobiliaria_nombre: (perfil&&perfil.nombre)||"",
    inmobiliaria_matricula: (perfil&&perfil.matricula)||"",
  };
  return tpl.replace(/\{\{(\w+)\}\}/g, function(m,k){ if(TOKENS_CONTACTO_PARTES_PRIVADOS[k]) return ""; return (k in map) ? map[k] : m; });
}
// Preámbulos por defecto (con tokens). Se usan si no hay personalización
// y se pueden editar por tipo de documento en Plantillas → Introducción.
var DEFAULT_ENCABEZADOS = {
  reserva:
    "Recibimos de {{comprador_nombre}}, DNI/CUIT {{comprador_dni}}, con domicilio a estos efectos en {{comprador_domicilio}}, en adelante el Oferente, la suma de {{anticipo_letras}} en concepto de \"Reserva Ad Referéndum\" de la aceptación del Vendedor {{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, en adelante el Vendedor, para la compra del inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral_texto}}, en adelante el Inmueble.\n\nEl presente se sujetará en un todo a los siguientes términos y condiciones:",
  boleto:
    "Entre {{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, con domicilio en {{vendedor_domicilio}}, en adelante el VENDEDOR, y {{comprador_nombre}}, DNI/CUIT {{comprador_dni}}, con domicilio en {{comprador_domicilio}}, en adelante el COMPRADOR, se celebra el presente boleto de compraventa respecto del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral_texto}}, por el precio total de {{precio_letras}}.",
  alquiler:
    "Entre {{locador_nombre}}, DNI/CUIT {{locador_dni}}, con domicilio en {{locador_domicilio}}, en adelante el LOCADOR, y {{locatario_nombre}}, DNI/CUIT {{locatario_dni}}, con domicilio en {{locatario_domicilio}}, en adelante el LOCATARIO, se celebra el presente contrato de locación del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral_texto}}.",
  reserva_alquiler:
    "Recibimos de {{locatario_nombre}}, DNI/CUIT {{locatario_dni}}, con domicilio en {{locatario_domicilio}}, en adelante el LOCATARIO / OFERENTE, la suma de {{anticipo_letras}} en concepto de Reserva de Locación sujeta a la conformidad de {{locador_nombre}}, DNI/CUIT {{locador_dni}}, en adelante el LOCADOR, respecto del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral_texto}}.",
  comodato:
    "Entre {{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, en adelante el COMODANTE, y {{comprador_nombre}}, DNI/CUIT {{comprador_dni}}, en adelante el COMODATARIO, se celebra el presente contrato de comodato respecto del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral_texto}}.",
  exclusividad:
    "{{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, en adelante el AUTORIZANTE, otorga a {{inmobiliaria_nombre}}{{inmobiliaria_matricula}}, en adelante la INMOBILIARIA, autorización de comercialización exclusiva del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral_texto}}.",
  refuerzo_reserva:
    "En este acto {{comprador_nombre}}, DNI/CUIT {{comprador_dni}}, entrega a {{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, la suma de {{precio_letras}} en concepto de refuerzo de la reserva oportunamente suscripta respecto del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}.",
  devolucion_reserva:
    "En este acto {{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, restituye a {{comprador_nombre}}, DNI/CUIT {{comprador_dni}}, la suma de {{precio_letras}} en concepto de devolución de la reserva respecto del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}."
};

function getEncabezadoTemplate(tipo, perfil) {
  var custom = perfil && perfil.encabezados_custom && perfil.encabezados_custom[tipo];
  if (custom && String(custom).trim()) return String(custom);
  return DEFAULT_ENCABEZADOS[tipo] || "";
}

function tokensEncabezadoParaTipo(tipo) {
  var compra = ["comprador_nombre","comprador_dni","comprador_domicilio","vendedor_nombre","vendedor_dni","vendedor_domicilio","inmueble_direccion","inmueble_partido","inmueble_provincia","nomenclatura_catastral","precio_letras","anticipo_letras","saldo_letras","fecha_operacion_larga","inmobiliaria_nombre","inmobiliaria_matricula"];
  var alq = ["locador_nombre","locador_dni","locador_domicilio","locatario_nombre","locatario_dni","locatario_domicilio","inmueble_direccion","inmueble_partido","inmueble_provincia","nomenclatura_catastral","alquiler_monto_letras","anticipo_letras","fecha_operacion_larga","inmobiliaria_nombre","inmobiliaria_matricula"];
  if (tipo==="alquiler"||tipo==="reserva_alquiler") return alq;
  return compra;
}

function labelTokenEncabezado(k, tipo) {
  var esAlq = tipo==="alquiler"||tipo==="reserva_alquiler";
  var map = {
    comprador_nombre: esAlq ? "Nombre locatario" : (tipo==="comodato" ? "Nombre comodatario" : "Nombre oferente/comprador"),
    comprador_dni: esAlq ? "DNI locatario" : "DNI oferente/comprador",
    comprador_domicilio: esAlq ? "Domicilio locatario" : "Domicilio oferente/comprador",
    vendedor_nombre: tipo==="comodato" ? "Nombre comodante" : "Nombre titular/vendedor",
    vendedor_dni: tipo==="comodato" ? "DNI comodante" : "DNI titular/vendedor",
    vendedor_domicilio: "Domicilio titular/vendedor",
    locador_nombre: "Nombre locador", locador_dni: "DNI locador", locador_domicilio: "Domicilio locador",
    locatario_nombre: "Nombre locatario/inquilino", locatario_dni: "DNI locatario", locatario_domicilio: "Domicilio locatario",
    inmueble_direccion: "Dirección del inmueble", inmueble_partido: "Partido", inmueble_provincia: "Provincia",
    nomenclatura_catastral: "Nomenclatura catastral",
    precio_letras: "Precio en letras", anticipo_letras: "Seña/anticipo en letras", saldo_letras: "Saldo en letras",
    alquiler_monto_letras: "Canon en letras", fecha_operacion_larga: "Fecha (larga)",
    inmobiliaria_nombre: "Inmobiliaria", inmobiliaria_matricula: "Matrícula"
  };
  return map[k] || k;
}

function aplicarEncabezadoPersonalizado(doc, op, tipo, perfil) {
  var snapshot=op&&op.plantilla_snapshot&&op.plantilla_snapshot.tipo===tipo?op.plantilla_snapshot:null;
  if ((snapshot&&snapshot.mostrar_introduccion===false)||(!snapshot&&perfil && perfil.mostrar_introduccion === false)) {
    return Object.assign({}, doc, { encabezado: "" });
  }
  var tpl = snapshot ? snapshot.introduccion : getEncabezadoTemplate(tipo, perfil);
  if (!tpl) return doc;
  return Object.assign({}, doc, { encabezado: sustituirTokens(tpl, op, perfil, tipo) });
}

async function mejorarEncabezadoIA(textoActual, tipo) {
  var sb = await loadSupabaseJs();
  if (!sb) throw new Error("No se pudo conectar con Supabase.");
  var nombreTipo = (typeof TIPOS !== "undefined" && TIPOS[tipo]) ? TIPOS[tipo] : (tipo || "documento");
  var prompt =
    "Mejorá el siguiente preámbulo de introducción de un documento inmobiliario argentino del tipo \""+nombreTipo+"\".\n"+
    "REGLAS:\n"+
    "1) Respondé SOLO con el texto del preámbulo, sin explicaciones ni comillas envolventes.\n"+
    "2) Conservá EXACTAMENTE todos los tokens {{...}} (no los reemplaces ni borres).\n"+
    "3) Estilo formal jurídico argentino, claro y profesional.\n"+
    "4) No inventes cláusulas nuevas; solo el preámbulo introductorio.\n\n"+
    "Texto actual:\n"+textoActual;
  function normalizarErrorIA(err){
    var m = String((err && err.message) || err || "");
    var low = m.toLowerCase();
    if (low.indexOf("high demand")>=0 || low.indexOf("resource_exhausted")>=0 || low.indexOf("quota")>=0 || low.indexOf("rate limit")>=0 || low.indexOf("temporarily")>=0) {
      return "El asistente está saturado en este momento. Esperá unos segundos y probá de nuevo.";
    }
    if (low.indexOf("timeout")>=0 || low.indexOf("timed out")>=0) {
      return "La IA tardó demasiado. Probá de nuevo en un momento.";
    }
    if (low.indexOf("network")>=0 || low.indexOf("fetch")>=0) {
      return "No hay conexión con el asistente. Revisá internet e intentá otra vez.";
    }
    return traducirError(m) || "No se pudo usar el asistente.";
  }
  var res, lastErr;
  // Un reintento suave ante picos de demanda
  for (var intento=0; intento<2; intento++){
    try {
      res = await sb.functions.invoke("ia-docworks", {
        body: { mode: "chat", messages: [{ role: "user", content: prompt }] }
      });
      if (res.error) throw new Error(traducirError(res.error.message || "No se pudo conectar con el asistente."));
      var data = res.data || {};
      if (data.error) throw new Error(typeof data.error==="string"?data.error:(data.error.message||JSON.stringify(data.error)));
      var out = String(data.text || "").replace(/^```[\s\S]*?\n/, "").replace(/```$/, "").trim();
      if (!out) throw new Error("La IA no devolvió texto.");
      return out;
    } catch (e) {
      lastErr = e;
      var msg = String((e && e.message) || e || "");
      var retryable = /high demand|resource_exhausted|quota|rate limit|temporarily|timeout/i.test(msg);
      if (!retryable || intento===1) break;
      await new Promise(function(r){ setTimeout(r, 1200); });
    }
  }
  throw new Error(normalizarErrorIA(lastErr));
}

// ── SISTEMA DE BLOQUES DEL CUERPO DE DOCUMENTOS ───────────────────────────────
// Modelo de datos preparado también para las fases siguientes (protección
// A/B/C y permisos por asesor — puntos 8-18 del pedido), aunque en esta fase
// esos campos todavía no se usan en ninguna lógica: solo viajan como datos.
//
//   id                  estable, no cambia aunque se edite el título.
//   titulo              sin el número — la numeración es automática (orden).
//   sinTitulo           legado conservado como dato; los títulos ahora se muestran
//                        en todos los documentos para identificar cada cláusula.
//   contenido           texto legal con tokens {{...}}; puede tener varios
//                        párrafos separados por "\n\n" (así es hoy el bloque 7).
//   variables           lista informativa de tokens usados (para mostrar en
//                        el inventario/UI, no se usa para resolver nada).
//   condicion           null | "moneda_usd" — por ahora un único caso
//                        soportado (evalCondicionBloque se ocupa de esto).
//   orden               posición dentro de la plantilla (ordenable ↑ ↓).
//   activo               false = no se incluye en el documento.
//   obligatoria          concepto YA existente, separado de "protección"
//                        (punto 9 del pedido). Para las 15 de Reserva: true,
//                        porque hoy no hay forma de sacarlas del documento.
//   proteccion            "A" | "B" | "C" — todavía no se aplica en ningún
//                        lado (Fase 3). Arranca en "C" para las 15, que es
//                        el equivalente exacto del comportamiento actual
//                        (nadie las puede tocar).
//   permisos_excepcion   [] — reservado para Fase 3 (overrides por asesor).

// Evalúa la condición de aparición de un bloque. Por ahora un único caso
// soportado ("moneda_usd"); se extiende acá el día que haga falta otro.
function evalCondicionBloque(condicion, op) {
  if (!condicion) return true;
  if (condicion === "moneda_usd") return op.moneda === "USD";
  return true;
}
// Token de referencia cruzada: {{NUM_<ID_EN_MAYUSCULAS_CON_GUION_BAJO>}} se
// resuelve al número final (post orden + filtrado) del bloque con ese id.
// Ej.: bloque id "reserva.incumplimiento" → token "NUM_RESERVA_INCUMPLIMIENTO".
function tokenNumeroBloque(id) {
  return "NUM_" + id.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
}
// Motor genérico: toma los bloques de una plantilla + la operación, filtra
// por activo/condición, ordena, numera automáticamente y resuelve tokens
// (incluidas las referencias cruzadas {{NUM_...}} a otros bloques).
// Devuelve { secciones, extraTokens } — extraTokens se puede reusar para
// resolver también textos que viven fuera de los bloques (p.ej. conformidad).
function renderBloques(bloques, op, tokensBase) {
  var activos = (bloques || [])
    .filter(function(b){ return b.activo!==false && evalCondicionBloque(b.condicion, op); })
    .slice()
    .sort(function(a,b){ return (a.orden||0)-(b.orden||0); });
  var extra = Object.assign({}, tokensBase||{});
  activos.forEach(function(b, i){ extra[tokenNumeroBloque(b.id)] = String(i+1); });
  var secciones = activos.map(function(b, i){
    var n = i+1;
    var tituloFinal = n+". "+nombreClausulaModelo(b);
    var parrafos = (b.contenido||"").split("\n\n").map(function(p){ return resolveVars(p, op, extra); });
    return { titulo: tituloFinal, items: parrafos, _bloqueId: b.id, _n: n };
  });
  return { secciones: secciones, extraTokens: extra };
}
// Generador PARALELO por bloques — Fase 1. Reproduce, bloque por bloque, el
// mismo `doc` que hoy arma buildDocSections para "reserva", pero leyendo el
// cuerpo desde `bloques` en vez de tenerlo hardcodeado. NO se usa todavía en
// ningún lado del flujo real (DocumentViewer/PDF/DOCX siguen usando
// buildDocSections sin cambios) — existe solo para poder compararlo.
function buildDocSectionsPorBloques(op, bloques, clausulasLib) {
  var esUSD = op.moneda === "USD";
  var monedaTxt = esUSD ? "DÓLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS";
  var tokensBase = derivedTokensReserva(op);
  var render = renderBloques(bloques, op, tokensBase);
  var numIncumplimiento = render.extraTokens[tokenNumeroBloque("reserva.incumplimiento")] || "?";

  var doc = {
    titulo: 'RESERVA "AD REFERÉNDUM"',
    subtitulo: "Oferta de compra sujeta a la conformidad del Vendedor",
    ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___"),
    fecha: fmtDLarga(fechaDocumentoISO(op)),
    encabezado: "Recibimos de "+(op.comprador_nombre||"___________")+", DNI/CUIT "+(op.comprador_dni||"___________")+", con domicilio a estos efectos en "+(op.comprador_domicilio||"___________")+", en adelante el Oferente, la suma de "+fmt$L(op.anticipo,op.moneda)+" en concepto de \"Reserva Ad Referéndum\" de la aceptación del Vendedor "+(op.vendedor_nombre||"___________")+", DNI/CUIT "+(op.vendedor_dni||"___________")+", en adelante el Vendedor, para la compra del inmueble ubicado en "+(op.inmueble_direccion||"___________")+", "+(op.inmueble_partido||"___________")+", Provincia de "+(op.inmueble_provincia||"___________")+(op.nomenclatura_catastral?", Nomenclatura Catastral "+op.nomenclatura_catastral:"")+", en adelante el Inmueble.\n\nEl presente se sujetará en un todo a los siguientes términos y condiciones:",
    ocultarPartesEnCuerpo: true,
    partes:[
      {rol:"VENDEDOR", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
      {rol:"OFERENTE / COMPRADOR",   nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
    ],
    secciones: render.secciones,
    firmas:[
      {rol:"OFERENTE", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
      {rol:"INMOBILIARIA", nombre:"", dni:"", usarPerfil:true},
    ],
    conformidad: {
      items:[
        "Presto plena conformidad a la oferta efectuada por el Oferente en la presente y demás condiciones pactadas, aceptando todos y cada uno de sus términos, comprometiéndome, en caso de no presentarme a la firma de la Escritura Traslativa de Dominio en la fecha convenida, a reintegrar al Oferente la suma recibida en virtud de la presente, más otro tanto igual en concepto de única y total indemnización, conforme Cláusula "+numIncumplimiento+" de la Reserva Ad Referéndum.-",
        derivedTokensReserva(op).comision_reserva_texto,
        "En caso de incumplimiento o arrepentimiento de alguna de Las Partes, una vez cumplidos todos los Ad Referéndum de la presente Reserva, la parte incumplidora deberá abonar los honorarios pactados en concepto de labor de intermediación realizada hasta el momento, sin necesidad de formalidad judicial alguna.-",
      ],
      firmante: op.vendedor_nombre||"",
      dni: op.vendedor_dni||"",
    },
  };
  return finalizeDoc(doc, op, clausulasLib);
}
// Compara, sección por sección, el documento del generador actual
// (buildDocSections) contra el del generador por bloques, para los mismos
// datos de operación. Devuelve un reporte estructurado, no solo un booleano,
// para poder mostrar exactamente dónde difiere si difiere.
function compararGeneradoresReserva(op, bloques, clausulasLib) {
  var docViejo = buildDocSections(op, clausulasLib, "reserva");
  var docNuevo = buildDocSectionsPorBloques(op, bloques, clausulasLib);
  var filas = [];
  var maxLen = Math.max(docViejo.secciones.length, docNuevo.secciones.length);
  for (var i=0;i<maxLen;i++){
    var a = docViejo.secciones[i];
    var b = docNuevo.secciones[i];
    var tituloOk = a && b && a.titulo===b.titulo;
    var itemsOk = a && b && JSON.stringify(a.items)===JSON.stringify(b.items);
    filas.push({ idx:i, actual:a||null, bloques:b||null, ok: !!(tituloOk&&itemsOk), tituloOk: !!tituloOk, itemsOk: !!itemsOk });
  }
  var conformidadOk = JSON.stringify(docViejo.conformidad.items)===JSON.stringify(docNuevo.conformidad.items);
  var encabezadoOk = docViejo.encabezado === docNuevo.encabezado;
  var todoOk = filas.every(function(f){return f.ok;}) && conformidadOk && encabezadoOk;
  return { filas:filas, conformidadOk:conformidadOk, encabezadoOk:encabezadoOk, todoOk:todoOk, docViejo:docViejo, docNuevo:docNuevo };
}


// ── CUERPOS EDITABLES PARA TODOS LOS MODELOS ────────────────────────────────
// La base estándar vive en el frontend y cada inmobiliaria guarda su copia
// personalizada dentro de perfil.plantillas[tipo].body_blocks. Los tokens
// {{...}} se resuelven contra la operación al generar PDF/Word; no se guardan
// datos reales dentro de la plantilla.
function nombreClausulaModelo(b){
  var titulo=String(b&&b.titulo||"").trim();
  if(titulo&&!/^(cl[aá]usula(?: sin t[ií]tulo| \d+)?|\d+\.?)$/i.test(titulo))return titulo;
  var tipos=Object.keys(BODY_TEMPLATE_PRESETS||{});
  for(var i=0;i<tipos.length;i++){
    var base=BODY_TEMPLATE_PRESETS[tipos[i]].find(function(x){return x.id===(b&&b.id);});
    if(base&&base.titulo)return base.titulo;
  }
  return "CONDICIÓN PARTICULAR";
}
function normalizarBodyBlock(b, idx) {
  var x = Object.assign({id:"",titulo:"",contenido:"",orden:idx+1,activo:true,sinTitulo:false,condicion:null}, b || {});
  x.id = String(x.id || ("bloque_"+(idx+1)));
  x.titulo = nombreClausulaModelo(x);
  x.contenido = String(x.contenido || "");
  x.orden = Number(x.orden)||idx+1;
  x.activo = x.activo !== false;
  // Los nombres son visibles también en modelos que antes ocultaban el título.
  x.sinTitulo = false;
  // Compatibilidad 4.41: migrar primero para detectar también las condiciones
  // inferidas por ID (por ejemplo op_refuerzo y op_seguro) antes de fijar el estado.
  var normalizado = migrarBloqueLegacy(x);
  // Los modelos históricos no guardaban `obligatoria`: por defecto son obligatorias,
  // excepto las cláusulas condicionales, que dependen de la operación.
  if (b && typeof b.obligatoria === "boolean") normalizado.obligatoria = b.obligatoria;
  else normalizado.obligatoria = !normalizado.condicion;
  return normalizado;
}
// Bloques guardados con textos de versiones anteriores: se actualizan al leerlos para que ningún documento
// (ni la plantilla de cada inmobiliaria) siga generando datos sin resolver ni plazos inconsistentes.
function migrarBloqueLegacy(b){
  // 4.29: bloques opcionales de la base estándar (se activan con un check en la operación).
  if(b.id==="reserva.refuerzo") b=Object.assign({},b,{condicion:"op_refuerzo",obligatoria:false});
  if(b.id==="alquiler.seguro") b=Object.assign({},b,{condicion:"op_seguro"});
  var c=String(b.contenido||"");
  if(c.indexOf("{{inmueble_provincia}}{{nomenclatura_catastral}}")>=0){
    b=Object.assign({},b,{contenido:c.split("__none__").join("").split("{{inmueble_provincia}}{{nomenclatura_catastral}}").join("{{inmueble_provincia}}{{nomenclatura_catastral_texto}}")}); c=b.contenido;
  }
  if(b.id==="devolucion.motivo" && c.indexOf("{{devolucion_motivo}}")>=0){
    return Object.assign({},b,{contenido:c.replace("{{devolucion_motivo}}","{{devolucion_motivo_texto}}")});
  }
  if(b.id==="exclusividad.modalidad" && c.indexOf("{{exclusividad_tipo}}")>=0){
    return Object.assign({},b,{contenido:"{{exclusividad_modalidad_texto}}"});
  }
  if(b.id==="exclusividad.honorarios" && c.indexOf("{{comision_vendedor_texto}}")>=0){
    return Object.assign({},b,{contenido:c.replace("{{comision_vendedor_texto}}","{{comision_autorizante_texto}}")});
  }
  if(b.id==="comodato.plazo" && c.indexOf("{{comodato_plazo}}")>=0){
    return Object.assign({},b,{contenido:c.replace("{{comodato_plazo}}","{{comodato_plazo_texto}}")});
  }
  if((b.id==="reserva.vencimiento_reserva"||String(b.titulo||"").toUpperCase()==="VENCIMIENTO DE LA RESERVA") && /\{\{\s*fecha_posesion\s*\}\}/.test(c)){
    return Object.assign({},b,{titulo:"VIGENCIA DE LA RESERVA",contenido:"La presente Reserva, y su conversión a Seña una vez conformada la misma, tendrá una vigencia de {{reserva_vigencia_texto}}, plazo dentro del cual deberá suscribirse el Boleto de Compraventa y/o la Escritura Traslativa de Dominio. Vencido dicho plazo sin que se hubiera concretado, la Reserva caducará de pleno derecho, salvo prórroga expresa acordada por escrito entre las partes.-"});
  }
  if(b.id==="reserva_alquiler.condiciones" && c.indexOf("Plazo estimado: {{res_alq_plazo_cantidad}} {{res_alq_plazo_unidad}}. Inicio estimado: {{res_alq_inicio_estimado}}.-")>=0){
    return Object.assign({},b,{contenido:c.replace("Plazo estimado: {{res_alq_plazo_cantidad}} {{res_alq_plazo_unidad}}. Inicio estimado: {{res_alq_inicio_estimado}}.-","Plazo estimado: {{reserva_alquiler_plazo_texto}}, con inicio estimado el {{res_alq_inicio_estimado}} y vencimiento estimado el {{reserva_alquiler_fin_estimado}}, ambos días inclusive.-")});
  }
  if(b.id==="reserva_alquiler.objeto" && c.indexOf("la suma de {{moneda_txt}} {{res_alq_monto_reserva}}")>=0){
    return Object.assign({},b,{contenido:c.replace("la suma de {{moneda_txt}} {{res_alq_monto_reserva}}","la suma de {{reserva_alquiler_reserva}}")});
  }
  if(b.id==="alquiler.plazo" && c.indexOf("vencimiento el {{alquiler_fin_formateado}}. Al finalizar")>=0){
    return Object.assign({},b,{contenido:c.replace("vencimiento el {{alquiler_fin_formateado}}. Al finalizar","vencimiento el {{alquiler_fin_formateado}}, ambos días inclusive, conforme al plazo pactado por las Partes. Al finalizar")});
  }
  return b;
}

var BODY_TEMPLATE_PRESETS = {
  reserva: (typeof DEFAULT_BLOQUES_RESERVA!=="undefined" ? DEFAULT_BLOQUES_RESERVA : []).map(function(b){ return Object.assign({}, b); }),
  boleto: [
    {id:"boleto.objeto",titulo:"OBJETO",contenido:"El VENDEDOR {{vendedor_nombre}} vende, cede y transfiere al COMPRADOR {{comprador_nombre}}, quien compra y acepta, el inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral_texto}}, en adelante el Inmueble.-"},
    {id:"boleto.precio",titulo:"PRECIO",contenido:"El precio total y definitivo de la presente compraventa se fija en {{precio_letras}}, que las partes declaran justo y conveniente a sus intereses.-"},
    {id:"boleto.forma_pago",titulo:"FORMA DE PAGO",contenido:"{{boleto_pago_acordado}}"},
    {id:"boleto.posesion",titulo:"POSESIÓN Y ESCRITURACIÓN",contenido:"La posesión del inmueble se otorgará el {{fecha_posesion}}, fecha en la que asimismo deberá suscribirse la Escritura Traslativa de Dominio{{escribania_boleto}}.-"},
    {id:"boleto.honorarios_vendedor",titulo:"HONORARIOS DEL VENDEDOR",contenido:"{{comision_vendedor_texto}}"},
    {id:"boleto.honorarios_comprador",titulo:"HONORARIOS DEL COMPRADOR",contenido:"{{comision_comprador_texto}}"},
    {id:"boleto.incumplimiento",titulo:"INCUMPLIMIENTO",contenido:"Ante el incumplimiento de las obligaciones asumidas por cualquiera de las partes, se aplicarán las consecuencias expresamente pactadas en este instrumento y las disposiciones legales pertinentes. La existencia, cuantía y destino de cualquier seña o penalidad dependerán de las entregas efectivamente realizadas y de lo convenido por las partes; no se presumirá la entrega de sumas no percibidas.-"},
    {id:"boleto.libre",titulo:"INMUEBLE LIBRE DE OCUPANTES Y GRAVÁMENES",contenido:"El VENDEDOR entregará el inmueble libre de ocupantes, deudas y gravámenes de cualquier naturaleza a la fecha de posesión pactada, siendo a su cargo los impuestos y expensas devengados hasta dicha fecha, y a cargo del COMPRADOR a partir de entonces.-"},
  ],
  reserva_alquiler: [
    {id:"reserva_alquiler.objeto",titulo:"OBJETO",contenido:"El LOCATARIO / OFERENTE entrega en este acto, en concepto de Reserva de Locación sujeta a la conformidad del LOCADOR, la suma de {{reserva_alquiler_reserva}}, para la locación del inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}.-"},
    {id:"reserva_alquiler.condiciones",titulo:"CONDICIONES ESTIMADAS DE LOCACIÓN",contenido:"Valor del alquiler mensual: {{reserva_alquiler_canon}}. Plazo estimado: {{reserva_alquiler_plazo_texto}}, con inicio estimado el {{res_alq_inicio_estimado}} y vencimiento estimado el {{reserva_alquiler_fin_estimado}}, ambos días inclusive.-"},
    {id:"reserva_alquiler.aceptacion",titulo:"VIGENCIA Y ACEPTACIÓN",contenido:"El LOCADOR deberá conformar la presente dentro de un plazo de {{res_alq_aceptacion_plazo}}. La Reserva mantendrá su vigencia por {{res_alq_vigencia_plazo}} corridos desde su conformación, plazo dentro del cual deberá suscribirse el correspondiente Contrato de Locación.-"},
    {id:"reserva_alquiler.honorarios_locador",titulo:"HONORARIOS DEL LOCADOR",contenido:"{{reserva_alquiler_comision_locador_texto}}"},
    {id:"reserva_alquiler.honorarios_locatario",titulo:"HONORARIOS DEL LOCATARIO",contenido:"{{reserva_alquiler_comision_locatario_texto}}"},
  ],
  alquiler: [
    {id:"alquiler.objeto",titulo:"OBJETO",contenido:"El LOCADOR da en locación al LOCATARIO el {{inmueble_tipo}} ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}, con destino a {{alquiler_destino_texto}}{{alquiler_amoblado_texto}}. La entrega y el estado de conservación del inmueble se regulan en la cláusula ESTADO DEL INMUEBLE.-"},
    {id:"alquiler.plazo",titulo:"PLAZO",contenido:"El presente contrato tendrá una duración de {{alquiler_plazo_texto}}, con inicio el {{alquiler_inicio}} y vencimiento el {{alquiler_fin_formateado}}, ambos días inclusive, conforme al plazo pactado por las Partes. Al finalizar el plazo, el LOCATARIO se obliga a restituir el inmueble totalmente desocupado y en el mismo estado en que lo recibió, salvo el deterioro propio del uso normal y el transcurso del tiempo.-"},
    {id:"alquiler.canon",titulo:"CANON LOCATIVO Y ACTUALIZACIÓN",contenido:"{{alquiler_canon_clause}}"},
    {id:"alquiler.gastos",titulo:"GASTOS Y MANTENIMIENTO",contenido:"El LOCATARIO asumirá los consumos de servicios y gastos de uso que legalmente le correspondan. Los demás conceptos se distribuirán conforme a las cláusulas expresas del contrato y la normativa aplicable.-"},
    {id:"alquiler.estado",titulo:"ESTADO DEL INMUEBLE",contenido:"El LOCATARIO recibe el inmueble en el estado que se describe en el acta de entrega e inventario, si los hubiere, y se obliga a restituirlo en condiciones equivalentes, salvo el desgaste normal por el uso regular y el transcurso del tiempo."},
    {id:"alquiler.subalquiler",titulo:"PROHIBICIÓN DE SUBALQUILAR",contenido:"El LOCATARIO no podrá subalquilar, ceder ni transferir total o parcialmente el uso del inmueble sin el consentimiento expreso y por escrito del LOCADOR."},
    {id:"alquiler.obras",titulo:"OBRAS Y MEJORAS",contenido:"El LOCATARIO deberá solicitar autorización escrita al LOCADOR antes de realizar modificaciones u obras no urgentes. El tratamiento de mejoras, reparaciones necesarias y eventuales compensaciones se ajustará a lo pactado válidamente y a la normativa aplicable."},
    {id:"alquiler.deposito",titulo:"DEPÓSITO EN GARANTÍA",contenido:"El LOCATARIO entrega en depósito {{alquiler_deposito_desc}}, el cual será restituido según lo dispuesto por la legislación aplicable. Este depósito no devengará intereses y no podrá ser imputado al pago de alquileres.-"},
    {id:"alquiler.mora",titulo:"MORA Y PENALIDADES",contenido:"El incumplimiento de cualquier obligación a cargo del LOCATARIO, incluida la falta de pago de un (1) mes de alquiler, lo constituirá en mora en forma automática, sin necesidad de interpelación judicial o extrajudicial alguna.-\n\nLa mora en el pago del canon locativo devengará un interés punitorio del {{alquiler_interes_punitorio}}% mensual hasta su efectivo pago.-\n\nSi el LOCATARIO no restituyera el inmueble al vencimiento del contrato, deberá abonar en concepto de cláusula penal una suma equivalente a {{alquiler_penalidad_meses}} veces el canon locativo mensual vigente, por cada mes o fracción de demora en la restitución.-"},
    {id:"alquiler.seguro",titulo:"SEGURO",contenido:"El LOCATARIO se obliga a contratar, dentro de los {{alquiler_seguro_dias}} días corridos de la firma del presente, un seguro de Responsabilidad Civil e Incendio sobre el inmueble, designando como beneficiario al LOCADOR, debiendo acreditar su vigencia durante toda la duración del contrato.-"},
    {id:"alquiler.rescision",titulo:"RESOLUCIÓN ANTICIPADA",contenido:"El LOCATARIO podrá rescindir el presente contrato en forma anticipada conforme lo establecido por la legislación vigente, debiendo notificar en forma fehaciente al LOCADOR con {{alquiler_aviso_plazo}} de antelación y abonando, en su caso, la indemnización legal correspondiente.-"},
    {id:"alquiler.garantia",titulo:"GARANTÍA",contenido:"{{alquiler_garantia_detalle}}"},
    {id:"alquiler.honorarios_locador",titulo:"HONORARIOS DEL LOCADOR",contenido:"{{alquiler_comision_locador_texto}}"},
    {id:"alquiler.honorarios_locatario",titulo:"HONORARIOS DEL LOCATARIO",contenido:"{{alquiler_comision_locatario_texto}}"},
  ],
  comodato: [
    {id:"comodato.objeto",titulo:"OBJETO",contenido:"El COMODANTE cede gratuitamente al COMODATARIO el uso del inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}, quien lo recibe de plena conformidad.-"},
    {id:"comodato.plazo",titulo:"PLAZO",contenido:"El presente comodato tendrá una duración de {{comodato_plazo_texto}}, vencido el cual el COMODATARIO deberá restituir el bien en las mismas condiciones en que lo recibió.-"},
    {id:"comodato.uso",titulo:"USO Y DESTINO",contenido:"Destino: {{comodato_uso}}. El COMODATARIO no podrá ceder ni subarrendar el bien sin autorización previa y por escrito del COMODANTE.-"},
    {id:"comodato.obligaciones",titulo:"OBLIGACIONES DEL COMODATARIO",contenido:"El COMODATARIO se obliga a conservar el bien en buen estado, abonar los gastos ordinarios de uso y servicios, no introducir modificaciones sin autorización del COMODANTE, y restituir el inmueble a la finalización del plazo pactado.-"},
    {id:"comodato.incumplimiento",titulo:"INCUMPLIMIENTO",contenido:"Ante un incumplimiento relevante del COMODATARIO, el COMODANTE podrá ejercer los derechos de restitución o resolución que correspondan según este instrumento y la normativa aplicable, mediante el procedimiento legal pertinente.-"},
  ],
  exclusividad: [
    {id:"exclusividad.autorizacion",titulo:"AUTORIZACIÓN",contenido:"El AUTORIZANTE autoriza a la INMOBILIARIA a ofrecer, promocionar y gestionar la venta del inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}.-"},
    {id:"exclusividad.precio",titulo:"PRECIO",contenido:"Precio de venta autorizado: {{precio_letras}}. El AUTORIZANTE acepta recibir ofertas a partir de dicho valor.-"},
    {id:"exclusividad.plazo",titulo:"PLAZO Y VIGENCIA",contenido:"La presente autorización tendrá una vigencia de {{exclusividad_vigencia}} días corridos desde su firma, según la modalidad convenida por las partes.-"},
    {id:"exclusividad.modalidad",titulo:"MODALIDAD",contenido:"{{exclusividad_modalidad_texto}}"},
    {id:"exclusividad.honorarios",titulo:"HONORARIOS",contenido:"{{comision_autorizante_texto}}"},
  ],
  refuerzo_reserva: [
    {id:"refuerzo.antecedentes",titulo:"ANTECEDENTES",contenido:"Las partes han suscripto con anterioridad una Reserva de Compra para el inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}.-"},
    {id:"refuerzo.objeto",titulo:"OBJETO DEL REFUERZO",contenido:"En este acto el COMPRADOR entrega, en calidad de REFUERZO de la Reserva oportunamente suscripta, la suma de {{precio_letras}}, en concepto de ampliación del monto originalmente entregado.-"},
    {id:"refuerzo.condiciones",titulo:"CONDICIONES",contenido:"El presente Refuerzo integra y complementa la Reserva original, manteniendo plena vigencia todas sus condiciones, plazos y cláusulas oportunamente pactadas.-"},
    {id:"refuerzo.incumplimiento",titulo:"INCUMPLIMIENTO",contenido:"El refuerzo se incorpora a las sumas entregadas bajo la reserva original. Su tratamiento frente a un incumplimiento será el previsto expresamente en esa reserva y en la normativa aplicable, sin establecer por este documento una penalidad adicional no acordada.-"},
  ],
  devolucion_reserva: [
    {id:"devolucion.antecedentes",titulo:"ANTECEDENTES",contenido:"Las partes habían suscripto una Reserva de Compra para el inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}.-"},
    {id:"devolucion.motivo",titulo:"MOTIVO DE LA DEVOLUCIÓN",contenido:"{{devolucion_motivo_texto}}"},
    {id:"devolucion.devolucion",titulo:"DEVOLUCIÓN",contenido:"El VENDEDOR devuelve en este acto al COMPRADOR / OFERENTE la suma de {{precio_letras}}, recibiendo el COMPRADOR plena conformidad respecto de la devolución.-"},
    {id:"devolucion.finiquito",titulo:"FINIQUITO",contenido:"Las partes dejan constancia de la devolución del importe aquí indicado. El alcance de cualquier liberación o renuncia de reclamos se limita a los conceptos expresamente identificados y aceptados en este instrumento, sin afectar derechos irrenunciables.-"},
  ],
};

// Las condiciones económicas no son extras de biblioteca: son parte del modelo.
// Identificar por ID estable evita que cambiar el título quite la protección.
var DW_IDS_ECONOMICOS_ESENCIALES = {
  reserva:["reserva.precio","reserva.valor_reserva","reserva.forma_pago"],
  boleto:["boleto.precio","boleto.forma_pago"],
  reserva_alquiler:["reserva_alquiler.objeto","reserva_alquiler.condiciones"],
  alquiler:["alquiler.canon"],
  comodato:["comodato.objeto"], // gratuidad; un comodato no tiene precio de venta
  exclusividad:["exclusividad.precio"],
  refuerzo_reserva:["refuerzo.objeto"],
  devolucion_reserva:["devolucion.devolucion"]
};
// Estructura documental irrenunciable por tipo: se puede editar el texto,
// pero no quitar la cláusula del modelo. No se aplica a extras opcionales.
var DW_IDS_ESTRUCTURA_ESENCIAL = {
  reserva:["reserva.precio","reserva.valor_reserva","reserva.forma_pago"],
  boleto:["boleto.precio","boleto.forma_pago"],
  reserva_alquiler:["reserva_alquiler.objeto","reserva_alquiler.condiciones"],
  alquiler:["alquiler.objeto","alquiler.plazo","alquiler.canon","alquiler.estado","alquiler.subalquiler","alquiler.obras"],
  comodato:["comodato.objeto","comodato.plazo","comodato.uso"],
  exclusividad:["exclusividad.autorizacion","exclusividad.precio","exclusividad.plazo"],
  refuerzo_reserva:["refuerzo.antecedentes","refuerzo.objeto"],
  devolucion_reserva:["devolucion.antecedentes","devolucion.devolucion"]
};
function esClausulaEsencialModelo(b){
  var t=String((b&&b.titulo)||"").normalize?String((b&&b.titulo)||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase():String((b&&b.titulo)||"").toLowerCase();
  var id=String((b&&b.id)||"").toLowerCase();
  var esencialEconomica=Object.keys(DW_IDS_ECONOMICOS_ESENCIALES).some(function(tipo){return DW_IDS_ECONOMICOS_ESENCIALES[tipo].indexOf(id)!==-1;});
  var esencialEstructural=Object.keys(DW_IDS_ESTRUCTURA_ESENCIAL).some(function(tipo){return DW_IDS_ESTRUCTURA_ESENCIAL[tipo].indexOf(id)!==-1;});
  return esencialEconomica||esencialEstructural||/honorarios|comision inmobiliaria|jurisdiccion|partes y firmas|firma de las partes|firmas de las partes/.test(t)||/(^|\.)jurisdiccion$/.test(id)||/(^|\.)honorarios(_esenciales)?$/.test(id)||/(^|\.)firmas?$/.test(id);
}
function bloquesBaseObligatoriosPorTipo(tipo) {
  var comunes=[{id:tipo+".jurisdiccion",titulo:"JURISDICCIÓN",contenido:"Para las cuestiones derivadas del presente instrumento, las partes se someten a la jurisdicción de los tribunales ordinarios competentes que correspondan conforme a la normativa aplicable, sin perjuicio de las normas de competencia inderogable."}];
  if(tipo==="reserva"||tipo==="boleto") comunes.push({id:tipo+".expensas_servicios",titulo:"EXPENSAS, IMPUESTOS Y SERVICIOS",contenido:"Los impuestos, tasas, expensas y servicios devengados hasta la fecha de entrega de la posesión estarán a cargo de quien corresponda según lo pactado por las partes y la normativa aplicable. Desde la entrega de la posesión, su pago estará a cargo de quien la recibe, salvo pacto expreso en contrario."});
  if(tipo==="reserva") comunes.push({id:"reserva.libre_ocupantes",titulo:"ENTREGA LIBRE DE OCUPANTES",contenido:"La entrega de la posesión del inmueble, si correspondiera conforme a la operación y al instrumento definitivo, deberá efectuarse libre de ocupantes y con la situación de deudas, expensas y servicios regularizada según lo pactado por las partes y la normativa aplicable."});
  if(tipo==="reserva_alquiler") comunes.push({id:"reserva_alquiler.incumplimiento",titulo:"SEÑA Y CONSECUENCIAS DEL INCUMPLIMIENTO",contenido:"Si la reserva fuera aceptada, las consecuencias de un eventual incumplimiento o desistimiento serán las que las partes hayan pactado expresamente en este instrumento y las que resulten aplicables conforme a la normativa vigente. Antes de firmar, deberá completarse cualquier condición particular de devolución, retención o penalidad acordada."});
  if(tipo==="comodato") comunes.push({id:"comodato.libre_ocupantes",titulo:"ENTREGA Y RESTITUCIÓN DEL INMUEBLE",contenido:"El COMODANTE declara entregar el inmueble en condiciones de uso y el COMODATARIO se obliga a restituirlo al finalizar el comodato, libre de personas y bienes propios, salvo lo expresamente convenido por las partes."});
  if(tipo==="reserva_alquiler") comunes.push({id:"reserva_alquiler.expensas_servicios",titulo:"EXPENSAS Y SERVICIOS",contenido:"Las expensas, impuestos y servicios correspondientes al inmueble serán asumidos por las partes según lo acordado para la futura locación y la normativa aplicable; su distribución definitiva deberá quedar expresamente establecida en el contrato de locación."});
  if(tipo==="exclusividad") comunes.push({id:"exclusividad.incumplimiento",titulo:"INCUMPLIMIENTO",contenido:"El incumplimiento de las obligaciones asumidas en esta autorización dará lugar a los reclamos y consecuencias que correspondan según lo expresamente convenido y la normativa aplicable."});
  if(tipo==="refuerzo_reserva") comunes.push({id:"refuerzo.jurisdiccion",titulo:"JURISDICCIÓN",contenido:"Para las controversias derivadas del presente refuerzo, las partes se someten a los tribunales competentes conforme a la normativa aplicable."});
  if(tipo==="devolucion_reserva") comunes.push({id:"devolucion.incumplimiento",titulo:"INCUMPLIMIENTO",contenido:"Ante el incumplimiento de la devolución aquí pactada, la parte afectada podrá exigir el cumplimiento y ejercer los derechos que le reconozca la normativa aplicable."});
  if(tipo==="comodato") comunes.push({id:"comodato.gastos_servicios",titulo:"GASTOS Y SERVICIOS",contenido:"Durante la vigencia del comodato, el COMODATARIO afrontará los gastos ordinarios de uso y los servicios que consuma, conforme a lo acordado por las partes y a la normativa aplicable. Los tributos y gastos extraordinarios se distribuirán según lo pactado y la legislación vigente."});
  return comunes;
}
function completarClausulasBaseModelo(lista,tipo){
  var out=(Array.isArray(lista)?lista:[]).map(function(b,i){return normalizarBodyBlock(Object.assign({},b,{orden:i+1}),i);});
  var ids=out.map(function(b){return String(b.id||"");});
  // Restaurar solamente la estructura económica ausente usando el modelo base;
  // nunca sobreescribir el contenido personalizado de una cláusula existente.
  var esenciales=Array.from(new Set([].concat(DW_IDS_ECONOMICOS_ESENCIALES[tipo]||[],DW_IDS_ESTRUCTURA_ESENCIAL[tipo]||[])));
  var base=BODY_TEMPLATE_PRESETS[tipo]||[];
  esenciales.forEach(function(id){
    if(ids.indexOf(id)!==-1)return;
    var original=base.find(function(b){return b.id===id;});
    if(original){out.push(normalizarBodyBlock(Object.assign({},original,{orden:out.length+1,activo:true,obligatoria:true}),out.length));ids.push(id);}
  });
  bloquesBaseObligatoriosPorTipo(tipo).forEach(function(b){
    var yaExiste=ids.indexOf(b.id)!==-1 || out.some(function(x){var t=String(x.titulo||"").toLowerCase();return t===String(b.titulo).toLowerCase() || (b.titulo==="JURISDICCIÓN"&&/jurisdicci[oó]n/.test(t)) || ((b.titulo.indexOf("EXPENSAS")===0)&&/expensas|servicios/.test(t));});
    if(!yaExiste){out.push(normalizarBodyBlock(Object.assign({},b,{orden:out.length+1,activo:true,obligatoria:true}),out.length));ids.push(b.id);}
  });
  // HONORARIOS es una sección esencial del modelo, no un extra de la biblioteca.
  // Si un tipo todavía no tiene una cláusula propia, agrega una redacción neutral editable.
  var tieneHonorarios=out.some(function(b){return /honorarios|comision inmobiliaria|comisión inmobiliaria/i.test(String(b.titulo||""))||/honorarios|comision inmobiliaria|comisión inmobiliaria/i.test(String(b.id||""));});
  if(!tieneHonorarios&&["reserva","boleto","reserva_alquiler","alquiler","exclusividad"].indexOf(tipo)!==-1){out.push(normalizarBodyBlock({id:tipo+".honorarios_esenciales",titulo:"HONORARIOS DE INTERMEDIACIÓN",contenido:"Las partes reconocen la intervención de la inmobiliaria. El obligado al pago, el monto o porcentaje, la base de cálculo y la oportunidad de pago de los honorarios por intermediación deberán quedar expresamente pactados por las partes y consignados en este instrumento o en un anexo firmado que forme parte integrante del mismo.",orden:out.length+1,activo:true,obligatoria:true},out.length));}
  // No se permite apagar los apartados esenciales desde el modelo, ni siquiera a un Dueño.
  out=out.map(function(b){return esClausulaEsencialModelo(b)?Object.assign({},b,{activo:true,obligatoria:true}):b;});
  return out.map(function(b,i){return normalizarBodyBlock(Object.assign({},b,{orden:i+1,activo:esClausulaEsencialModelo(b)?true:b.activo!==false,obligatoria:esClausulaEsencialModelo(b)?true:b.obligatoria}),i);});
}
function getDefaultBodyBlocks(tipo) {
  var arr = BODY_TEMPLATE_PRESETS[tipo] || [];
  return completarClausulasBaseModelo(arr,tipo);
}
function getBodyBlocksConfig(perfil,tipo,bloquesReserva=undefined) {
  var cfg = perfil && perfil.plantillas && perfil.plantillas[tipo];
  var arr = cfg && Array.isArray(cfg.body_blocks) ? cfg.body_blocks : null;
  return arr && arr.length ? completarClausulasBaseModelo(arr,tipo) : tipo==="reserva"&&Array.isArray(bloquesReserva)&&bloquesReserva.length ? completarClausulasBaseModelo(bloquesReserva,tipo) : getDefaultBodyBlocks(tipo);
}
function contarBloquesCuerpo(perfil,tipo,bloquesReserva){
  return getBodyBlocksConfig(perfil,tipo,bloquesReserva).length;
}
function getBodyBlocksForDocument(perfil,tipo,bloquesReserva) {
  var cfg=perfil&&perfil.plantillas&&perfil.plantillas[tipo];
  if(cfg&&Array.isArray(cfg.body_blocks)&&cfg.body_blocks.length)return completarClausulasBaseModelo(cfg.body_blocks,tipo);
  if(tipo==="reserva"&&Array.isArray(bloquesReserva)&&bloquesReserva.length)return completarClausulasBaseModelo(bloquesReserva,tipo);
  return null;
}
function evalBodyCondition(condicion,op){
  if(!condicion) return true;
  if(condicion === "op_refuerzo") return !!(op&&op.reserva_incluye_refuerzo);
  if(condicion === "op_seguro") return !(op&&op.alquiler_incluye_seguro===false);
  if(condicion === "moneda_usd") return (op&&op.moneda)==="USD";
  return true;
}
// DocWorks 4.77: texto de pago acordado disponible para los modelos editables.
// La inmobiliaria decide dónde ubicar {{compra_condiciones_pago}} dentro de su
// cláusula de forma de pago. No se reescriben modelos publicados ni snapshots.
// Cronograma estructurado de cuotas: se conserva en un campo JSON de la operación.
// Los datos históricos que solo tienen texto libre continúan siendo legibles.
function cronogramaCuotasCompra(op){
  try {
    var raw=op&&op.compra_cuotas_cronograma;
    var arr=Array.isArray(raw)?raw:JSON.parse(String(raw||"[]"));
    return Array.isArray(arr)?arr.filter(function(x){return x&&typeof x==="object";}):[];
  } catch(_e){return [];}
}

function descripcionCronogramaCompra(op){
  var cuotas=cronogramaCuotasCompra(op);
  return cuotas.map(function(c,i){
    var medio={efectivo:"efectivo",transferencia:"transferencia bancaria",mixto:"efectivo y transferencia"}[c.medio]||(c.medio==="otro"?String(c.medio_otro||"medio no especificado"):"medio a definir");
    return "Cuota "+(i+1)+": "+fmt$L(parseMontoAR(c.importe||0),op.moneda||"USD")+", vencimiento "+fmtD(c.fecha)+", mediante "+medio;
  }).join("; ");
}
function tokensPagoCompra(op){
  if(!op || (op.tipo!=="reserva" && op.tipo!=="boleto")) return {};
  // Redacción orientativa, sin afirmar que una entrega ya fue efectuada.
  // El modelo publicado determina si este texto integra el instrumento.
  var detalle=String(op.compra_condiciones_pago||"").trim();
  var modalidad=String(op.compra_modalidad_pago||"habitual");
  var medio=String(op.compra_medio_pago||"sin_definir");
  var medios={efectivo:"en efectivo",transferencia:"mediante transferencia bancaria",mixto:"combinando efectivo y transferencia bancaria"};
  var medioTexto=medios[medio]||(medio==="otro"?String(op.compra_medio_otro||"").trim():"");
  var moneda=op.moneda||"USD";
  var precio=parseMontoAR(op.precio||0),anticipo=parseMontoAR(op.anticipo||0);
  var saldo=precio-anticipo;
  var texto="";
  if(modalidad!=="habitual" && medioTexto && precio>0 && saldo>=0 && !(modalidad==="unico"&&anticipo>0)){
    if(modalidad==="unico") texto="El precio convenido de "+fmt$L(precio,moneda)+" se abonará en un único pago "+medioTexto+".";
    else if(modalidad==="entrega_saldo") texto="El precio convenido es de "+fmt$L(precio,moneda)+". "+(anticipo>0?"Se prevé una entrega inicial de "+fmt$L(anticipo,moneda)+" y un saldo de "+fmt$L(saldo,moneda):"Se prevé un saldo pendiente de "+fmt$L(saldo,moneda)) +", con pago "+medioTexto+". Las fechas y condiciones son las indicadas en el acuerdo.";
    else if(modalidad==="cuotas"){
      var n=Number(op.compra_cuotas_cantidad);
      var fecha=String((cronogramaCuotasCompra(op)[0]||{}).fecha||op.compra_cuotas_primera_fecha||"");
      var fechaValida=/^\d{4}-\d{2}-\d{2}$/.test(fecha);
      if(fechaValida){var f=new Date(fecha+"T00:00:00");fechaValida=!isNaN(f.getTime())&&f.getFullYear()===Number(fecha.slice(0,4))&&f.getMonth()+1===Number(fecha.slice(5,7))&&f.getDate()===Number(fecha.slice(8,10));}
      if(Number.isInteger(n)&&n>=1&&n<=36&&fechaValida&&(cronogramaCuotasCompra(op).length===n || (!Object.prototype.hasOwnProperty.call(op,"compra_cuotas_cronograma")&&!!detalle))){
        texto="El precio convenido es de "+fmt$L(precio,moneda)+". Se prevé una entrega inicial de "+fmt$L(anticipo,moneda)+" y el saldo de "+fmt$L(saldo,moneda)+" en "+n+" cuotas, con primer vencimiento el "+fmtD(fecha)+", mediante pagos "+medioTexto+". Los importes y vencimientos de cada cuota son los detallados a continuación.";
      }
    } else if(modalidad==="especial"&&detalle) texto="El precio convenido es de "+fmt$L(precio,moneda)+". Las partes acuerdan una modalidad especial de pago "+medioTexto+".";
    if(texto && modalidad==="cuotas" && cronogramaCuotasCompra(op).length) texto+=" Cronograma: "+descripcionCronogramaCompra(op)+".";
    if(texto && detalle) texto+=" Condiciones particulares: "+detalle;
  }
  // Solo los modelos nuevos que incorporan el token boleto_pago_acordado
  // reciben esta redacción. Los modelos publicados y snapshots permanecen intactos.
  // Evitar afirmar una entrega de dinero no acreditada por el formulario.
  var boletoHabitual="El precio convenido es de "+fmt$L(precio,moneda)+". "+(anticipo>0?"Se prevé una entrega inicial de "+fmt$L(anticipo,moneda)+" y un saldo de "+fmt$L(saldo,moneda)+" al momento de la firma de la Escritura Traslativa de Dominio":"Se prevé el pago del precio al momento de la firma de la Escritura Traslativa de Dominio")+", conforme a lo acordado por las partes.";
  var boletoPago=modalidad!=="habitual" ? texto : boletoHabitual;
  var reservaHabitual="El Oferente ofrece abonar el saldo de "+fmt$L(saldo,moneda)+" al momento de firmar la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, conforme a las condiciones de esta oferta.";
  var reservaPago=modalidad!=="habitual" ? texto : reservaHabitual;
  return {compra_condiciones_pago:detalle,compra_pago_redaccion:texto,boleto_pago_acordado:boletoPago,reserva_pago_acordado:reservaPago};
}

function buildDocSectionsFromEditableBody(op, clausulasLib, tipo, bloquesPlantilla) {
  var doc = buildDocSectionsStandard(op, clausulasLib, tipo);
  if(!Array.isArray(bloquesPlantilla) || !bloquesPlantilla.length) return doc;
  var sorted=bloquesPlantilla.map(normalizarBodyBlock).filter(function(b){return b.activo!==false&&evalBodyCondition(b.condicion,op);}).sort(function(a,b){return a.orden-b.orden;});
  var extras=tokensPagoCompra(op);
  sorted.forEach(function(b,i){extras[tokenNumeroBloque(b.id)]=String(i+1);});
  var secciones=sorted.map(function(b,i){
    var txt=String(b.contenido||"");
    var items=txt.split(/\n\n/).map(function(p){return resolveVars(p,op,Object.assign({},extras,derivedTokensGenerales(op)));}).filter(function(p){return String(p||"").trim()!=="";});
    return {titulo:(i+1)+". "+nombreClausulaModelo(b),items:items,_bloqueId:b.id};
  });
  // Los bloques creados con «Agregar cláusula» no forman parte del contrato
  // hasta que tengan contenido real. Evita imprimir el borrador «NUEVA CLÁUSULA».
  secciones=secciones.filter(function(sec){
    var texto=(sec.items||[]).join(" ").trim();
    var titulo=String(sec.titulo||"").replace(/^\d+\.\s*/,"").trim();
    return !(/^NUEVA CL[AÁ]USULA$/i.test(titulo)&&
      (!texto||/^Escrib[ií] ac[aá] la redacci[oó]n de esta cl[aá]usula\./i.test(texto)));
  }).map(function(sec,i){
    return Object.assign({},sec,{titulo:String(sec.titulo||"").replace(/^\d+\./,String(i+1)+".")});
  });
  if(tipo==="comodato") secciones.forEach(function(sec){
    sec.items=(sec.items||[]).map(function(item){return String(item).replace(/PARTE\s+VENDEDORA\s*\(\s*o\s+LOCADORA\s*\)/gi,"PARTE COMODANTE");});
  });
  var out=Object.assign({},doc,{secciones:secciones});
  // El modelo editable sustituye las secciones del modelo estándar: las
  // cláusulas adicionales deben continuar DESPUÉS de las secciones efectivas.
  out.clausulas=(out.clausulas||[]).map(function(c,i){return Object.assign({},c,{num:secciones.length+i+1});});
  if(out.conformidad&&Array.isArray(out.conformidad.items)){
    out.conformidad.items=out.conformidad.items.map(function(t){return resolveVars(t,op,extras);});
  }
  return finalizeDoc(out,op,clausulasLib);
}

function buildDocSectionsStandard(op, clausulasLib, tipo) {
  var M = op.moneda==="USD"; var MA = op.res_alq_moneda==="USD"; var MAL = op.alquiler_moneda==="USD";

  if (tipo==="reserva") {
    var esUSD = op.moneda==="USD";
    var monedaTxt = esUSD ? "DÓLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS";
    var seccionesReserva = [
      // 1. Precio
      {titulo:"1. PRECIO", items:["El Oferente ofrece la suma de "+fmt$L(op.precio,op.moneda)+" para la compra del Inmueble, en adelante el Precio.-"]},
      // 2. Valor de la Reserva
      {titulo:"2. VALOR DE LA RESERVA", items:["La suma entregada en este acto en concepto de Reserva Ad Referéndum es de "+fmt$L(op.anticipo,op.moneda)+".-"]},
      // 3. Forma de Pago
      {titulo:"3. FORMA DE PAGO", items:[tokensPagoCompra(op).reserva_pago_acordado || "Acuerdo de pago pendiente de completar y verificar."]},
      // 4. Honorarios
      {titulo:"4. HONORARIOS", items:[(function(){var c=getComisionConfig(op,"comision_comprador",parseMontoAR(op.precio||0),op.moneda||"USD","comision_comprador",valorComisionPredeterminado(op.comision_porcentaje,""));return c.modo==="fijo"?"El Oferente abonará la suma de "+fmt$L(c.valor,c.moneda)+" en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente.-":"El Oferente abonará el "+(c.valor!=="" && c.valor!==null && c.valor!==undefined ? c.valor : "___")+"% del Precio en el momento de la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente.-";})()]},
      // 5. Vencimiento de Aceptación de la Reserva
      {titulo:"5. VENCIMIENTO DE ACEPTACIÓN DE LA RESERVA", items:[ (function(){
        var modo=String(op.reserva_aceptacion_modo||"").toLowerCase();
        var plazo;
        if(modo==="horas" || (!modo && op.reserva_aceptacion_horas && !op.reserva_aceptacion_vencimiento)){
          var h=parseInt(op.reserva_aceptacion_horas,10)||48;
          plazo="a las "+h+" horas de suscripta la misma";
        } else if(op.reserva_aceptacion_vencimiento){
          plazo="el "+fmtD(op.reserva_aceptacion_vencimiento);
        } else {
          var d=parseInt(op.reserva_aceptacion_dias,10)||5;
          plazo=d===1?"al día de suscripta la misma":("a los "+d+" días de suscripta la misma");
        }
        return "El vencimiento de la aceptación de la presente Reserva caducará irrevocablemente "+plazo+", salvo prórroga expresa acordada por escrito entre las partes.-";
      })() ]},
      // 6. Vencimiento de la Reserva
      {titulo:"6. VIGENCIA DE LA RESERVA", items:["La presente Reserva, y su conversión a Seña una vez conformada la misma, tendrá una vigencia de "+derivedTokensReserva(op).reserva_vigencia_texto+", plazo dentro del cual deberá suscribirse el Boleto de Compraventa y/o la Escritura Traslativa de Dominio. Vencido dicho plazo sin que se hubiera concretado, la Reserva caducará de pleno derecho, salvo prórroga expresa acordada por escrito entre las partes.-"]},
      // 7. Seña y consecuencias del incumplimiento + Caso Fortuito (párrafo aparte)
      {titulo:"7. SEÑA Y CONSECUENCIAS DEL INCUMPLIMIENTO", items:[
        "Conformada esta Reserva por el Vendedor, la presente tendrá carácter de SEÑA con los efectos y alcances del art. 1059 del Código Civil y Comercial de la Nación. Si el Oferente no se presentara a la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, perderá automáticamente y de pleno derecho la suma entregada en este acto, sin necesidad de que se practique interpelación judicial o extrajudicial alguna, quedando constituido en mora por el mero vencimiento del plazo; mientras que si no se presentara el Vendedor a la firma en el plazo establecido, quedará obligado a reintegrar al Oferente, dentro de las 48 horas de producido el incumplimiento, la suma recibida como Reserva, más otro tanto igual en concepto de única y total indemnización.-",
        "En caso de que el incumplimiento aludido en el párrafo anterior se deba a Caso Fortuito o Fuerza Mayor según arts. 955 y 1730 del Código Civil y Comercial de la Nación, ajeno a la voluntad de las partes, los plazos se suspenden automáticamente, sin consecuencias para éstas, hasta tanto lo determine el Escribano Interviniente.-",
      ]},
      // 8. Escribano Interviniente
      {titulo:"8. ESCRIBANO INTERVINIENTE", items:[(op.escribania?"Escribanía designada: "+op.escribania+",":"El Escribano será designado por el Oferente,")+" debiendo ser notificado formalmente al Vendedor con todos los datos de contacto correspondientes dentro de la semana de haber sido conformada la presente Reserva Ad Referéndum. La notificación del Escribano Interviniente respecto de la fecha y hora para la firma de la Escritura Traslativa de Dominio tendrá carácter constitutivo.-"]},
      // 9. Honorarios, impuestos, tasas, sellos y otros
      {titulo:"9. GASTOS, IMPUESTOS Y ESCRITURACIÓN", items:["Los gastos notariales, registrales, impuestos, tasas y sellos vinculados a la firma e inscripción de la Escritura Traslativa de Dominio y/o al Boleto de Compraventa se distribuirán conforme a lo expresamente acordado por las partes y a la normativa aplicable. Los honorarios de intermediación inmobiliaria se regulan exclusivamente por la cláusula específica de HONORARIOS de este instrumento.-"]},
      // 10. Moneda de pago como condición esencial (solo si es en USD)
      esUSD ? {titulo:"10. MONEDA DE PAGO Y CONDICIÓN ESENCIAL", items:["Queda expresamente establecido que la moneda de pago ofrecida y acordada en los puntos 1, 2 y 3 precedentes constituye condición y elemento esencial de la presente. El Oferente declara poseer los Dólares Billete Estadounidenses y se compromete a entregarlos por el precio estipulado en caso de aceptación, así como para cancelar los honorarios convenidos, renunciando a invocar imprevisión, caso fortuito, fuerza mayor, enriquecimiento sin causa o cualquier otra defensa relacionada a una eventual imposibilidad de pago en la moneda pactada o a variaciones en su cotización, resultando condición esencial que el pago sea efectuado única y exclusivamente en Dólares Billete Estadounidenses.-"]} : null,
      // 11. Devolución si no conforma el Vendedor
      {titulo:esUSD?"11. DEVOLUCIÓN DE LA RESERVA NO CONFORMADA":"10. DEVOLUCIÓN DE LA RESERVA NO CONFORMADA", items:["Si el Vendedor del Inmueble no conformase esta Reserva, la suma entregada en este acto por el Oferente le será devuelta sin indemnización de ninguna naturaleza, quedando la presente Reserva sin efecto ni valor legal alguno. En este caso, el Oferente deberá notificar con un mínimo de 48 horas su intención de retirar los fondos en guarda, acordando con la inmobiliaria interviniente la logística correspondiente.-"]},
      // 12. Notificación Válida
      {titulo:esUSD?"12. NOTIFICACIÓN VÁLIDA":"11. NOTIFICACIÓN VÁLIDA", items:["Significa toda notificación realizada por correo electrónico o carta documento a los domicilios constituidos por Las Partes en la presente, con su correspondiente constancia de recibo. Las notificaciones por correo electrónico tendrán plena validez y vigencia, constituyendo Las Partes los domicilios electrónicos que correspondan para los efectos de la presente Reserva.-"]},
      // 13. Incumplimiento / arrepentimiento — honorarios
      {titulo:esUSD?"13. HONORARIOS POR INCUMPLIMIENTO":"12. HONORARIOS POR INCUMPLIMIENTO", items:["En caso de incumplimiento o arrepentimiento de alguna de Las Partes, una vez cumplidos todos los Ad Referéndum de la presente Reserva, la parte incumplidora deberá abonar los honorarios pactados en concepto de labor de intermediación realizada hasta el momento, sin necesidad de formalidad judicial alguna.-"]},
      // 14. Asesoramiento individual
      {titulo:esUSD?"14. ASESORAMIENTO LEGAL E IMPOSITIVO":"13. ASESORAMIENTO LEGAL E IMPOSITIVO", items:["El Oferente manifiesta expresamente que para realizar la presente oferta se ha asesorado en forma individual con sus propios asesores legales e impositivos, declarando conocer en todos sus términos los riesgos e implicancias de la presente oferta.-"]},
      // 15. Refuerzo
      (!op.reserva_incluye_refuerzo?null:{titulo:esUSD?"15. REFUERZO":"14. REFUERZO", items:["El Oferente podrá ofrecer, de así convenirlo con el Vendedor, un Refuerzo de la presente Reserva dentro de los 7 días corridos a partir de su conformidad, cuyo monto y demás condiciones se consignarán en el instrumento de Refuerzo de Reserva correspondiente.-"]}),
    ].filter(Boolean);
    var numIncumplimiento = 7;

    var doc:any = {
      titulo: 'RESERVA "AD REFERÉNDUM"',
      subtitulo: "Oferta de compra sujeta a la conformidad del Vendedor",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___"),
      fecha: fmtDLarga(fechaDocumentoISO(op)),
      encabezado: "Recibimos de "+(op.comprador_nombre||"___________")+", DNI/CUIT "+(op.comprador_dni||"___________")+", con domicilio a estos efectos en "+(op.comprador_domicilio||"___________")+", en adelante el Oferente, la suma de "+fmt$L(op.anticipo,op.moneda)+" en concepto de \"Reserva Ad Referéndum\" de la aceptación del Vendedor "+(op.vendedor_nombre||"___________")+", DNI/CUIT "+(op.vendedor_dni||"___________")+", en adelante el Vendedor, para la compra del inmueble ubicado en "+(op.inmueble_direccion||"___________")+", "+(op.inmueble_partido||"___________")+", Provincia de "+(op.inmueble_provincia||"___________")+(op.nomenclatura_catastral?", Nomenclatura Catastral "+op.nomenclatura_catastral:"")+", en adelante el Inmueble.\n\nEl presente se sujetará en un todo a los siguientes términos y condiciones:",
      // El encabezado ya identifica a Oferente y Vendedor con nombre, DNI y
      // domicilio en el propio párrafo legal — mostrar además el bloque
      // "PARTES INTERVINIENTES" repetiría exactamente los mismos datos dos
      // veces seguidas. Se oculta ese bloque solo para este tipo de
      // documento (doc.partes se sigue usando internamente para otras
      // cosas si hiciera falta, pero no se imprime).
      ocultarPartesEnCuerpo: true,
      partes:[
        {rol:"VENDEDOR", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"OFERENTE / COMPRADOR",   nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones: seccionesReserva,
      firmas:[
        {rol:"OFERENTE", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
        {rol:"INMOBILIARIA", nombre:"", dni:"", usarPerfil:true},
      ],
      conformidad: {
        items:[
          "Presto plena conformidad a la oferta efectuada por el Oferente en la presente y demás condiciones pactadas, aceptando todos y cada uno de sus términos, comprometiéndome, en caso de no presentarme a la firma de la Escritura Traslativa de Dominio en la fecha convenida, a reintegrar al Oferente la suma recibida en virtud de la presente, más otro tanto igual en concepto de única y total indemnización, conforme Cláusula "+numIncumplimiento+" de la Reserva Ad Referéndum.-",
          (function(){var c=getComisionConfig(op,"comision_comprador",parseMontoAR(op.precio||0),op.moneda||"USD","comision_comprador",valorComisionPredeterminado(op.comision_porcentaje,""));return c.modo==="fijo"?"Asimismo, manifiesto expresamente que me obligo a abonar a la inmobiliaria interviniente la suma de "+fmt$L(c.valor,c.moneda)+" en concepto de honorarios por labor de intermediación cumplimentada, al momento de firmarse la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-":"Asimismo, manifiesto expresamente que me obligo a abonar a la inmobiliaria interviniente el "+(c.valor!=="" && c.valor!==null && c.valor!==undefined ? c.valor : "___")+"% del Precio en concepto de honorarios por labor de intermediación cumplimentada, al momento de firmarse la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-";})(),
          "En caso de incumplimiento o arrepentimiento de alguna de Las Partes, una vez cumplidos todos los Ad Referéndum de la presente Reserva, la parte incumplidora deberá abonar los honorarios pactados en concepto de labor de intermediación realizada hasta el momento, sin necesidad de formalidad judicial alguna.-",
        ],
        firmante: op.vendedor_nombre||"",
        dni: op.vendedor_dni||"",
      },
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="boleto") {
    doc = {
      titulo: "BOLETO DE COMPRAVENTA",
      subtitulo: "Contrato privado de compraventa inmobiliaria",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___"),
      fecha: fmtDLarga(fechaDocumentoISO(op)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra el presente Boleto de Compraventa, sujeto a las disposiciones del Código Civil y Comercial de la Nación. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"VENDEDOR", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"COMPRADOR", nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones:[
        {titulo:"1. OBJETO", items:["El VENDEDOR "+(op.vendedor_nombre||"___")+" vende, cede y transfiere al COMPRADOR "+(op.comprador_nombre||"___")+", quien compra y acepta, el inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+(op.nomenclatura_catastral?", Nomenclatura Catastral "+op.nomenclatura_catastral:"")+".-"]},
        {titulo:"2. PRECIO", items:["El precio total y definitivo de la presente compraventa se fija en "+fmt$L(op.precio,op.moneda)+", que las partes declaran justo y conveniente a sus intereses.-"]},
        {titulo:"3. FORMA DE PAGO", items:[tokensPagoCompra(op).boleto_pago_acordado || "Acuerdo de pago pendiente de completar y verificar."]},
        {titulo:"4. POSESIÓN Y ESCRITURACIÓN", items:["La posesión del inmueble se otorgará el "+fmtD(op.fecha_posesion)+", fecha en la que asimismo deberá suscribirse la Escritura Traslativa de Dominio"+(op.escribania?" ante "+op.escribania:"")+".-"]},
        {titulo:"5. HONORARIOS DEL VENDEDOR", items:[textoComision(op,"comision_vendedor","VENDEDOR","Precio total",parseMontoAR(op.precio||0),op.moneda||"USD","comision_vendedor","")]},
        {titulo:"6. HONORARIOS DEL COMPRADOR", items:[textoComision(op,"comision_comprador","COMPRADOR","Precio total",parseMontoAR(op.precio||0),op.moneda||"USD","comision_comprador","")]},
        {titulo:"7. INCUMPLIMIENTO", items:["Ante el incumplimiento de las obligaciones asumidas por cualquiera de las partes, se aplicarán las consecuencias expresamente pactadas en este instrumento y las disposiciones legales pertinentes. La existencia, cuantía y destino de cualquier seña o penalidad dependerán de las entregas efectivamente realizadas y de lo convenido por las partes; no se presumirá la entrega de sumas no percibidas.-"]},
        {titulo:"8. INMUEBLE LIBRE DE OCUPANTES Y GRAVÁMENES", items:["El VENDEDOR entregará el inmueble libre de ocupantes, deudas y gravámenes de cualquier naturaleza a la fecha de posesión pactada, siendo a su cargo los impuestos y expensas devengados hasta dicha fecha, y a cargo del COMPRADOR a partir de entonces.-"]},
      ],
      firmas:[
        {rol:"VENDEDOR", nombre:op.vendedor_nombre||"", dni:op.vendedor_dni||""},
        {rol:"COMPRADOR", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="reserva_alquiler") {
    doc = {
      titulo: "RESERVA DE LOCACIÓN",
      subtitulo: "Oferta de locación sujeta a la conformidad del Locador",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___"),
      fecha: fmtDLarga(fechaDocumentoISO(op)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra la presente Reserva de Locación, sujeta a la conformidad del LOCADOR. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"LOCADOR", nombre:op.locador_nombre||"___", dni:op.locador_dni||"___", domicilio:op.locador_domicilio, email:op.locador_email},
        {rol:"LOCATARIO / OFERENTE", nombre:op.locatario_nombre||"___", dni:op.locatario_dni||"___", domicilio:op.locatario_domicilio, email:op.locatario_email},
      ],
      secciones:[
        {titulo:"1. OBJETO", items:["El LOCATARIO / OFERENTE entrega en este acto, en concepto de Reserva de Locación sujeta a la conformidad del LOCADOR, la suma de "+fmt$L(op.res_alq_monto_reserva,op.res_alq_moneda)+", para la locación del inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+".-"]},
        {titulo:"2. CONDICIONES ESTIMADAS DE LOCACIÓN", items:["Valor del alquiler mensual: "+fmt$L(op.res_alq_monto_mensual,op.res_alq_monto_mensual_moneda || op.res_alq_moneda || "ARS")+". Plazo estimado: "+plazoReservaAlquiler(op).texto+", con inicio estimado el "+fmtD(op.res_alq_inicio_estimado)+" y vencimiento estimado el "+fmtD(finReservaAlquilerISO(op))+", ambos días inclusive.-"]},
        {titulo:"3. VIGENCIA Y ACEPTACIÓN", items:["El LOCADOR deberá conformar la presente dentro de un plazo de "+(Number(op.res_alq_aceptacion_dias||"2")===1?"1 día":(op.res_alq_aceptacion_dias||"2")+" días")+". La Reserva mantendrá su vigencia por "+(Number(op.res_alq_vigencia_dias||"10")===1?"1 día":(op.res_alq_vigencia_dias||"10")+" días")+" corridos desde su conformación, plazo dentro del cual deberá suscribirse el correspondiente Contrato de Locación.-"]},
        {titulo:"4. HONORARIOS DEL LOCADOR", items:[textoComision(op,"res_alq_comision_locador","LOCADOR","canon mensual",parseFloat(op.res_alq_monto_mensual||0),op.res_alq_moneda||"ARS","res_alq_comision_locador",valorComisionPredeterminado(op.res_alq_comision,"1"))]},
        {titulo:"5. HONORARIOS DEL LOCATARIO", items:[textoComision(op,"res_alq_comision_locatario","LOCATARIO","canon mensual",parseFloat(op.res_alq_monto_mensual||0),op.res_alq_moneda||"ARS","res_alq_comision_locatario",valorComisionPredeterminado(op.res_alq_comision,"1"))]},
      ],
      firmas:[
        {rol:"LOCATARIO / OFERENTE", nombre:op.locatario_nombre||"", dni:op.locatario_dni||""},
        {rol:"LOCADOR", nombre:op.locador_nombre||"", dni:op.locador_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="comodato") {
    doc = {
      titulo: "CONTRATO DE COMODATO",
      subtitulo: "Préstamo de uso gratuito — Arts. 1533 y ss. del Código Civil y Comercial de la Nación",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___"),
      fecha: fmtDLarga(fechaDocumentoISO(op)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra el presente Contrato de Comodato, sujeto a las disposiciones del Código Civil y Comercial de la Nación. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"COMODANTE", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"COMODATARIO (recibe el bien)", nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones:[
        {titulo:"1. OBJETO", items:["El COMODANTE cede gratuitamente al COMODATARIO el uso del inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+", quien lo recibe de plena conformidad.-"]},
        {titulo:"2. PLAZO", items:["El presente comodato tendrá una duración de "+textoPlazoComodato(op.comodato_plazo)+", vencido el cual el COMODATARIO deberá restituir el bien en las mismas condiciones en que lo recibió.-"]},
        {titulo:"3. USO Y DESTINO", items:["Destino: "+(op.comodato_uso||"___")+". El COMODATARIO no podrá ceder ni subarrendar el bien sin autorización previa y por escrito del COMODANTE.-"]},
        {titulo:"4. OBLIGACIONES DEL COMODATARIO", items:["El COMODATARIO se obliga a conservar el bien en buen estado, abonar los gastos ordinarios de uso y servicios, no introducir modificaciones sin autorización del COMODANTE, y restituir el inmueble a la finalización del plazo pactado.-"]},
        {titulo:"5. INCUMPLIMIENTO", items:["Ante un incumplimiento relevante del COMODATARIO, el COMODANTE podrá ejercer los derechos de restitución o resolución que correspondan según este instrumento y la normativa aplicable, mediante el procedimiento legal pertinente.-"]},
      ],
      firmas:[
        {rol:"COMODANTE", nombre:op.vendedor_nombre||"", dni:op.vendedor_dni||""},
        {rol:"COMODATARIO", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="exclusividad") {
    var conExcl = (op.exclusividad_tipo||"con")==="con";
    doc = {
      titulo: conExcl?"AUTORIZACIÓN DE VENTA CON EXCLUSIVIDAD":"AUTORIZACIÓN DE VENTA SIN EXCLUSIVIDAD",
      subtitulo: "Autorización para la comercialización del inmueble",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___"),
      fecha: fmtDLarga(fechaDocumentoISO(op)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra la presente Autorización de Venta. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"AUTORIZANTE", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"INMOBILIARIA AUTORIZADA", nombre:op.inmobiliaria_nombre||"___", dni:op.inmobiliaria_matricula||"___", dniLabel:"Matrícula", domicilio:op.inmobiliaria_domicilio||"", email:op.inmobiliaria_email||""},
      ],
      secciones:[
        {titulo:"1. AUTORIZACIÓN", items:["El AUTORIZANTE autoriza a la INMOBILIARIA a ofrecer, promocionar y gestionar la venta del inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+".-"]},
        {titulo:"2. PRECIO", items:["Precio de venta autorizado: "+fmt$L(op.precio,op.moneda)+". El AUTORIZANTE acepta recibir ofertas a partir de dicho valor.-"]},
        {titulo:"3. "+(conExcl?"EXCLUSIVIDAD":"MODALIDAD"), items:[conExcl?("La presente autorización es EXCLUSIVA por el término de "+textoDuracionDias(op.exclusividad_vigencia)+", plazo durante el cual el AUTORIZANTE no podrá comercializar el inmueble por otro medio o intermediario.-"):("La presente autorización es SIN EXCLUSIVIDAD por el término de "+textoDuracionDias(op.exclusividad_vigencia)+". El AUTORIZANTE podrá comercializar el inmueble simultáneamente por otros medios o intermediarios.-")]},
        {titulo:"4. HONORARIOS", items:[textoComision(op,"comision_vendedor","AUTORIZANTE","precio de venta",parseMontoAR(op.precio||0),op.moneda||"USD","comision_vendedor","")]},
      ],
      firmas:[
        {rol:"AUTORIZANTE", nombre:op.vendedor_nombre||"", dni:op.vendedor_dni||""},
        {rol:"INMOBILIARIA", nombre:(op.inmobiliaria_nombre||""), dni:(op.inmobiliaria_matricula||""), dniLabel:"Matrícula"},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="refuerzo_reserva") {
    doc = {
      titulo: "REFUERZO DE RESERVA",
      subtitulo: "Ampliación del monto de reserva en operación en curso",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___"),
      fecha: fmtDLarga(fechaDocumentoISO(op)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra el presente Refuerzo de Reserva, que integra y complementa la Reserva de Compra oportunamente suscripta. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"VENDEDOR", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"COMPRADOR / OFERENTE", nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones:[
        {titulo:"1. ANTECEDENTES", items:[(op.refuerzo_trayectoria||("Las partes han suscripto con anterioridad una Reserva de Compra para el inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+".-"))]},
        {titulo:"2. OBJETO DEL REFUERZO", items:["En este acto el COMPRADOR entrega, en calidad de REFUERZO de la Reserva oportunamente suscripta, la suma de "+fmt$L(op.precio,op.moneda)+", en concepto de ampliación del monto originalmente entregado.-"]},
        {titulo:"3. CONDICIONES", items:["El presente Refuerzo integra y complementa la Reserva original, manteniendo plena vigencia todas sus condiciones, plazos y cláusulas oportunamente pactadas.-"]},
        {titulo:"4. INCUMPLIMIENTO", items:["El refuerzo se incorpora a las sumas entregadas bajo la reserva original. Su tratamiento frente a un incumplimiento será el previsto expresamente en esa reserva y en la normativa aplicable, sin establecer por este documento una penalidad adicional no acordada.-"]},
      ],
      firmas:[
        {rol:"COMPRADOR / OFERENTE", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
        {rol:"VENDEDOR", nombre:op.vendedor_nombre||"", dni:op.vendedor_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="devolucion_reserva") {
    doc = {
      titulo: "DEVOLUCIÓN DE RESERVA",
      subtitulo: "Devolución del monto de reserva por no concreción de la operación",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___"),
      fecha: fmtDLarga(fechaDocumentoISO(op)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra la presente Devolución de Reserva. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"VENDEDOR", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"COMPRADOR / OFERENTE", nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones:[
        {titulo:"1. ANTECEDENTES", items:["Las partes habían suscripto una Reserva de Compra para el inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+".-"]},
        {titulo:"2. MOTIVO DE LA DEVOLUCIÓN", items:[(op.devolucion_motivo||"Por mutuo acuerdo entre las partes, y ante la no concreción de la operación, se procede a la devolución íntegra del monto de reserva oportunamente entregado.-")]},
        {titulo:"3. DEVOLUCIÓN", items:["El VENDEDOR devuelve en este acto al COMPRADOR / OFERENTE la suma de "+fmt$L(op.precio,op.moneda)+", recibiendo el COMPRADOR plena conformidad respecto de la devolución.-"]},
        {titulo:"4. FINIQUITO", items:["Las partes dejan constancia de la devolución del importe aquí indicado. El alcance de cualquier liberación o renuncia de reclamos se limita a los conceptos expresamente identificados y aceptados en este instrumento, sin afectar derechos irrenunciables.-"]},
      ],
      firmas:[
        {rol:"COMPRADOR / OFERENTE", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
        {rol:"VENDEDOR", nombre:op.vendedor_nombre||"", dni:op.vendedor_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  // ── CONTRATO DE LOCACIÓN (tipo por defecto: "alquiler") ────────────────────
  var fin = fmtD(finAlquilerISO(op));
  var plazoTxt = plazoAlquilerTexto(op.alquiler_plazo_meses||"24", op.alquiler_plazo_dias||"0");
  var garantiaDetalle = (op.alquiler_garantia_texto_personalizado && op.alquiler_garantia_texto_personalizado.trim())
    ? op.alquiler_garantia_texto_personalizado.trim()
    : op.alquiler_garantia_tipo==="propietario"
    ? "Se constituye garantía propietaria a cargo de "+(op.alquiler_garantia_titular||"___")+", "+tipoIdentificacion(op.alquiler_garantia_dni)+": "+(op.alquiler_garantia_dni||"___")+", titular del inmueble sito en "+(op.alquiler_garantia_inmueble||"___")+".-"
    : op.alquiler_garantia_tipo==="seguro_caucion" ? "Se constituye como garantía un Seguro de Caución a contratar por el LOCATARIO en forma previa a la firma del presente.-"
    : op.alquiler_garantia_tipo==="aval_bancario" ? "Se constituye como garantía un Aval Bancario otorgado a favor del LOCADOR.-"
    : "Se constituye como garantía el Recibo de Sueldo de "+(op.alquiler_garantia_titular||"___")+".-";

  var indiceKey = op.alquiler_actualizacion||"ICL";
  var indiceEsFijo = indiceKey==="fijo";
  var indiceNombre = indiceKey==="otro" ? (op.alquiler_actualizacion_otro||"a definir") : indiceKey;
  var periodoKey = op.alquiler_periodo_actualizacion||"cuatrimestral";
  var periodoTxt = periodoKey==="otro" ? (op.alquiler_periodo_otro||"a definir") : periodoKey;
  var diaPagoTxt = op.alquiler_dia_pago==="otro" ? (op.alquiler_dia_pago_otro||"___") : (op.alquiler_dia_pago||"1");
  var canonClause = indiceEsFijo
    ? "El canon locativo mensual se pacta en "+fmt$L(op.alquiler_monto_inicial,op.alquiler_moneda)+", con carácter FIJO, sin actualización durante toda la vigencia del contrato. El pago se efectuará el día "+diaPagoTxt+" de cada mes, mediante "+formaPagoTexto(op.alquiler_forma_pago)+".-"
    : "El canon locativo mensual inicial se pacta en "+fmt$L(op.alquiler_monto_inicial,op.alquiler_moneda)+", con actualización "+periodoTxt+" conforme al índice "+indiceNombre+(indiceKey==="ICL"?" que publica el BCRA":"")+". El pago se efectuará el día "+diaPagoTxt+" de cada mes, mediante "+formaPagoTexto(op.alquiler_forma_pago)+".-";
  var depositoMontoNum = op.alquiler_deposito==="otro"
    ? parseFloat(op.alquiler_deposito_otro_monto||0)
    : parseFloat(op.alquiler_monto_inicial||0)*parseFloat(valorComisionPredeterminado(op.alquiler_deposito,"1"));
  var depositoMoneda = op.alquiler_deposito==="otro" ? (op.alquiler_deposito_otro_moneda||"USD") : op.alquiler_moneda;
  var depositoMeses = String(valorComisionPredeterminado(op.alquiler_deposito,"1"));
  var depositoUnidad = Number(depositoMeses)===1 ? "mes" : "meses";
  var depositoDesc = op.alquiler_deposito==="otro"
    ? "un monto fijo de "+fmt$L(depositoMontoNum, depositoMoneda)
    : "el equivalente a "+depositoMeses+" "+depositoUnidad+" de alquiler, es decir "+fmt$L(depositoMontoNum, depositoMoneda);

  var interesPunitorio = op.alquiler_interes_punitorio||"5";
  var penalidadMeses = op.alquiler_penalidad_meses||"2";
  var seguroDias = op.alquiler_seguro_dias||"10";
  var avisoMeses = op.alquiler_aviso_meses||"1";
  var avisoPlazoTexto = Number(avisoMeses)===1 ? "1 mes" : avisoMeses+" meses";

  doc = {
    titulo: "CONTRATO DE LOCACIÓN",
    subtitulo: "Celebrado conforme al Código Civil y Comercial de la Nación y la normativa vigente aplicable",
    ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___"),
    fecha: fmtDLarga(fechaDocumentoISO(op)),
    encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra el presente Contrato de Locación, que se regirá por las cláusulas que a continuación se detallan, sujeto a las disposiciones del Código Civil y Comercial de la Nación y demás normativa vigente aplicable. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
    partes:[
      {rol:"LOCADOR", nombre:op.locador_nombre||"___", dni:op.locador_dni||"___", domicilio:op.locador_domicilio, email:op.locador_email},
      {rol:"LOCATARIO / INQUILINO", nombre:op.locatario_nombre||"___", dni:op.locatario_dni||"___", domicilio:op.locatario_domicilio, email:op.locatario_email},
    ],
    secciones:[
      {titulo:"1. OBJETO", items:[
        "El LOCADOR da en locación al LOCATARIO el "+tipoInmuebleLabel(op.inmueble_tipo||"departamento",op.inmueble_tipo_otro)+" ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+", con destino a "+(op.alquiler_destino==="vivienda"?"uso habitacional / vivienda familiar":op.alquiler_destino==="comercial"?"uso comercial":"uso profesional")+(op.alquiler_amoblado?", el cual se entrega AMOBLADO conforme al inventario de bienes muebles que como Anexo I forma parte integrante del presente contrato":"")+". El LOCATARIO declara recibir el inmueble en perfecto estado de conservación y limpieza, prestando plena conformidad con sus instalaciones.-"
      ].concat(op.alquiler_amoblado&&op.alquiler_inventario?["ANEXO I — INVENTARIO DE BIENES MUEBLES:\n"+op.alquiler_inventario]:[])},
      {titulo:"2. PLAZO", items:["El presente contrato tendrá una duración de "+plazoTxt+", con inicio el "+fmtD(op.alquiler_inicio)+" y vencimiento el "+fin+", ambos días inclusive, conforme al plazo pactado por las Partes. Al finalizar el plazo, el LOCATARIO se obliga a restituir el inmueble totalmente desocupado y en el mismo estado en que lo recibió, salvo el deterioro propio del uso normal y el transcurso del tiempo.-"]},
      {titulo:"3. CANON LOCATIVO Y ACTUALIZACIÓN", items:[canonClause]},
      {titulo:"4. GASTOS Y MANTENIMIENTO", items:["Quedan a cargo del LOCATARIO los gastos de expensas ordinarias, electricidad, gas, agua, internet y demás servicios del inmueble desde la entrega de la posesión. Quedan a cargo del LOCADOR las expensas extraordinarias y los impuestos que graven el inmueble (ARBA / Impuesto Inmobiliario). El LOCATARIO no podrá subalquilar, ceder ni transferir el uso del inmueble, ni realizar obras o mejoras, sin el consentimiento previo y por escrito del LOCADOR.-"]},
      {titulo:"5. DEPÓSITO EN GARANTÍA", items:["El LOCATARIO entrega en depósito "+depositoDesc+", que será restituido al finalizar la locación conforme a las condiciones expresamente pactadas por las partes y a la normativa vigente aplicable. El depósito no devengará intereses salvo pacto expreso o disposición legal aplicable y no podrá imputarse al pago de alquileres, salvo acuerdo expreso entre las partes.-"]},
      {titulo:"6. MORA Y PENALIDADES", items:[
        "El incumplimiento de cualquier obligación a cargo del LOCATARIO, incluida la falta de pago de un (1) mes de alquiler, lo constituirá en mora en forma automática, sin necesidad de interpelación judicial o extrajudicial alguna.-",
        "La mora en el pago del canon locativo devengará un interés punitorio del "+interesPunitorio+"% mensual hasta su efectivo pago.-",
        "Si el LOCATARIO no restituyera el inmueble al vencimiento del contrato, deberá abonar en concepto de cláusula penal una suma equivalente a "+penalidadMeses+" veces el canon locativo mensual vigente, por cada mes o fracción de demora en la restitución.-",
      ]},
      {titulo:"7. SEGURO", items:["El LOCATARIO se obliga a contratar, dentro de los "+seguroDias+" días corridos de la firma del presente, un seguro de Responsabilidad Civil e Incendio sobre el inmueble, designando como beneficiario al LOCADOR, debiendo acreditar su vigencia durante toda la duración del contrato.-"]},
      {titulo:"8. RESOLUCIÓN ANTICIPADA", items:["El LOCATARIO podrá rescindir el presente contrato en forma anticipada conforme lo establecido por la legislación vigente, debiendo notificar en forma fehaciente al LOCADOR con "+avisoPlazoTexto+" de antelación y abonando, en su caso, la indemnización legal correspondiente.-"]},
      {titulo:"9. GARANTÍA", items:[garantiaDetalle]},
      {titulo:"10. HONORARIOS DEL LOCADOR", items:[textoComision(op,"alquiler_comision_locador","LOCADOR","total del contrato",totalContratoAlquiler(op),op.alquiler_moneda||"ARS","alquiler_comision_locador",valorComisionPredeterminado(op.alquiler_comision,"1"))]},
      {titulo:"11. HONORARIOS DEL LOCATARIO", items:[textoComision(op,"alquiler_comision_locatario","LOCATARIO","total del contrato",totalContratoAlquiler(op),op.alquiler_moneda||"ARS","alquiler_comision_locatario",valorComisionPredeterminado(op.alquiler_comision,"1"))]},
    ],
    firmas:[
      {rol:"LOCADOR", nombre:op.locador_nombre||"", dni:op.locador_dni||""},
      {rol:"LOCATARIO", nombre:op.locatario_nombre||"", dni:op.locatario_dni||""},
    ],
  };
  return finalizeDoc(doc, op, clausulasLib);
}


function buildDocSections(op, clausulasLib, tipo, bloquesPlantilla=undefined) {
  // Las operaciones nuevas renderizan desde su snapshot; las históricas sin snapshot
  // conservan exactamente el comportamiento anterior.
  var snap=op&&op.plantilla_snapshot&&op.plantilla_snapshot.tipo===(tipo||op.tipo)?op.plantilla_snapshot:null;
  if(snap){
    var actuales=Array.isArray(clausulasLib)?clausulasLib.slice():[];
    (snap.clausulas||[]).forEach(function(sc){var guardada=Object.assign({},sc,{obligatoria:sc.obligatoria===true||(snap.obligatorias_ids||[]).indexOf(sc.id)!==-1});var i=actuales.findIndex(function(c){return c&&c.id===sc.id;});if(i>=0)actuales[i]=Object.assign({},actuales[i],guardada);else actuales.push(guardada);});
    clausulasLib=actuales;
    if(Array.isArray(snap.body_blocks)&&snap.body_blocks.length)bloquesPlantilla=snap.body_blocks;
  }
  // Última barrera contra datos heredados: cualquier vista, preview, exportación
  // o documento generado para alquiler usa únicamente las comisiones de locador
  // y locatario.
  op = limpiarComisionesIncompatibles(op || {});
  if (Array.isArray(bloquesPlantilla) && bloquesPlantilla.length) {
    return buildDocSectionsFromEditableBody(op, clausulasLib || [], tipo, bloquesPlantilla);
  }
  return buildDocSectionsStandard(op, clausulasLib || [], tipo);
}

// ── RECIBO DE HONORARIOS ───────────────────────────────────────────────────────
function buildReciboSections(op, perfil, destinatario) {
  // destinatario: "parte1" | "parte2"
  var esAlq = op.tipo === "alquiler";
  var esBoleto = op.tipo === "boleto";
  var esReserva = op.tipo === "reserva";
  var esResAlq = op.tipo === "reserva_alquiler";

  var pagador, rolPagador, montoBase, monedaBase, monto, moneda, pct, modoComision, concepto, fecha, comisionPrefix;

  if (esAlq) {
    montoBase = totalContratoAlquiler(op);
    monedaBase = op.alquiler_moneda || "ARS";
    comisionPrefix = destinatario === "parte1" ? "alquiler_comision_locador" : "alquiler_comision_locatario";
    var cfgAlq = getComisionConfig(op,comisionPrefix,montoBase,monedaBase,comisionPrefix,valorComisionPredeterminado(op.alquiler_comision,"1"));
    monto=cfgAlq.monto; moneda=cfgAlq.moneda; pct=cfgAlq.modo==="porcentaje"?parseFloat(String(cfgAlq.valor||0)):null; modoComision=cfgAlq.modo;
    fecha = isoLocal(new Date());
    if (destinatario === "parte1") {
      pagador = op.locador_nombre || "___"; rolPagador = "LOCADOR";
    } else {
      pagador = op.locatario_nombre || "___"; rolPagador = "LOCATARIO";
    }
    concepto = "Locación del inmueble en "+(op.inmueble_direccion||"___");
  } else if (esBoleto || esReserva) {
    montoBase = parseMontoAR(op.precio || 0);
    monedaBase = op.moneda || "USD";
    comisionPrefix = destinatario === "parte1" ? "comision_vendedor" : "comision_comprador";
    var tienePartes = !!(op.comision_vendedor||op.comision_comprador||op.comision_vendedor_valor||op.comision_comprador_valor);
    var legacyPctCompra = parseFloat(op.comision_porcentaje||0);
    var legacyDefaultCompra = !tienePartes && esReserva ? String(legacyPctCompra/2) : "";
    var cfgCompra = getComisionConfig(op,comisionPrefix,montoBase,monedaBase,comisionPrefix,legacyDefaultCompra);
    monto=cfgCompra.monto; moneda=cfgCompra.moneda; pct=cfgCompra.modo==="porcentaje"?parseFloat(String(cfgCompra.valor||0)):null; modoComision=cfgCompra.modo;
    fecha = isoLocal(new Date());
    if (destinatario === "parte1") { pagador = op.vendedor_nombre || "___"; rolPagador = "VENDEDOR"; }
    else { pagador = op.comprador_nombre || "___"; rolPagador = "COMPRADOR"; }
    concepto = (esBoleto ? "Boleto de Compraventa" : "Reserva de Compra") + " — inmueble en " + (op.inmueble_direccion||"___");
  } else if (esResAlq) {
    montoBase = parseFloat(op.res_alq_monto_mensual || 0);
    monedaBase = op.res_alq_moneda || op.res_alq_monto_mensual_moneda || "ARS";
    comisionPrefix = destinatario === "parte1" ? "res_alq_comision_locador" : "res_alq_comision_locatario";
    var cfgResAlq = getComisionConfig(op,comisionPrefix,montoBase,monedaBase,comisionPrefix,valorComisionPredeterminado(op.res_alq_comision,"1"));
    monto=cfgResAlq.monto; moneda=cfgResAlq.moneda; pct=cfgResAlq.modo==="porcentaje"?parseFloat(String(cfgResAlq.valor||0)):null; modoComision=cfgResAlq.modo;
    fecha = isoLocal(new Date());
    if (destinatario === "parte1") { pagador = op.locador_nombre || "___"; rolPagador = "LOCADOR"; }
    else { pagador = op.locatario_nombre || "___"; rolPagador = "LOCATARIO"; }
    concepto = "Reserva de Locación — inmueble en "+(op.inmueble_direccion||"___");
  } else {
    return null;
  }

  // Número estable por operación (no cambia al reabrir) y distinto para cada parte.
  var __seed=String(op.id||op.created_at||op.tipo)+"|"+op.tipo, __h=0;
  for(var __i=0;__i<__seed.length;__i++){ __h=(__h*31+__seed.charCodeAt(__i))>>>0; }
  var nroRecibo = "R-" + String(100000+(__h%900000)) + (destinatario==="parte1"?"-A":"-B");
  var detalleCalculo = modoComision==="fijo"
    ? "Honorario pactado como monto fijo: " + fmt$L(monto,moneda) + "."
    : "Base de cálculo: " + fmt$(montoBase,monedaBase) + " × " + (pct||0).toFixed(2) + "% = " + fmt$(monto,moneda) + ".";

  return {
    tipoDocumento: op.tipo,
    fechaArchivo: new Date().toISOString().slice(0,10),
    titulo: "RECIBO DE HONORARIOS PROFESIONALES",
    subtitulo: "Comprobante de pago — " + (perfil && perfil.nombre ? perfil.nombre : "Inmobiliaria"),
    ciudad: (op.inmueble_partido||"___") + ", Provincia de " + (op.inmueble_provincia||"___"),
    fecha: fmtDLarga(fecha),
    nroRecibo: nroRecibo,
    esRecibo: true,
    partes: [
      { rol: rolPagador, nombre: pagador, dni: (destinatario==="parte1"?(esAlq?op.locador_dni:op.vendedor_dni):(esAlq?op.locatario_dni:op.comprador_dni))||"___", domicilio:"", email:"" },
      { rol: "INMOBILIARIA INTERVINIENTE", nombre: (perfil&&perfil.nombre)||"___", dni: (perfil&&perfil.matricula)?perfil.matricula:"", dniLabel:"Matrícula", domicilio:"", email: (perfil&&perfil.email)||"" },
    ],
    secciones: [
      { titulo: "DETALLE DEL RECIBO", items: [
        ((perfil&&perfil.nombre)||"La inmobiliaria") + (perfil&&perfil.matricula?", Matrícula "+perfil.matricula:"") + " recibió de la " + (ROL_A_PARTE[rolPagador]||rolPagador.toLowerCase()) + " " + pagador + " la suma de " + fmt$(monto, moneda) + " en concepto de honorarios profesionales de intermediación inmobiliaria.",
        "Operación: " + concepto + ".",
        detalleCalculo,
        "N° de recibo: " + nroRecibo + " | Fecha: " + fmtD(fecha) + ".",
      ]},
      { titulo: "FORMA DE PAGO", items: [
        "Importe total abonado: " + fmt$L(monto, moneda) + ".",
        "El presente recibo cancela en forma total y definitiva los honorarios correspondientes a la operación detallada precedentemente.",
      ]},
      { titulo: "DECLARACION", items: [
        ((perfil&&perfil.nombre)||"La inmobiliaria") + " declara haber prestado los servicios de intermediación inmobiliaria que dieron origen a la presente operación, en cumplimiento de las disposiciones vigentes en materia de ejercicio profesional inmobiliario.",
      ]},
    ],
    clausulas: [],
    customClausulas: "",
    firmas: [
      { rol: rolPagador, nombre: pagador, dni: "" },
    ],
    reciboExtra: {
      inmobiliaria: (perfil&&perfil.nombre)||"",
      matricula: (perfil&&perfil.matricula)||"",
      monto: fmt$(monto, moneda),
      pct: pct,
      modo: modoComision,
      montoBase: fmt$(montoBase, monedaBase),
    },
  };
}

// ── DOCX LOADER + GENERATOR ───────────────────────────────────────────────────
// ── DOCX NATIVO — sin dependencias externas ──────────────────────────────────
// Implementación ZIP mínima en JS puro para generar .docx (OOXML) sin CDN.
// Un .docx es simplemente un ZIP con XML dentro.

function u8(str) {
  // UTF-8 encode a string to Uint8Array
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(str);
  var out = [], i = 0, c;
  for (; i < str.length; i++) {
    c = str.charCodeAt(i);
    if (c < 128) { out.push(c); }
    else if (c < 2048) { out.push((c >> 6) | 192, (c & 63) | 128); }
    else { out.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128); }
  }
  return new Uint8Array(out);
}

function base64ToU8(b64) {
  var bin = atob(b64);
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 0xFF;
  return out;
}

var CRC32_TABLE = null;
function crc32(data) {
  var table = CRC32_TABLE;
  if (!table) {
    table = CRC32_TABLE = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
  }
  var crc = 0xFFFFFFFF;
  for (var k = 0; k < data.length; k++) crc = table[(crc ^ data[k]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function le16(n) { return [n & 0xFF, (n >> 8) & 0xFF]; }
function le32(n) { return [n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF]; }

function buildZip(files) {
  // files: [{name: string, data: Uint8Array}]
  var parts = [], central = [], offset = 0;
  var now = new Date();
  var dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  var dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);

  files.forEach(function(f) {
    var nameBytes = u8(f.name);
    var data = f.data;
    var crc = crc32(data);
    var localHeader = [].concat(
      [0x50,0x4B,0x03,0x04], // signature
      le16(20),              // version needed
      le16(0),               // flags
      le16(0),               // compression (stored)
      le16(dosTime), le16(dosDate),
      le32(crc),
      le32(data.length),     // compressed size
      le32(data.length),     // uncompressed size
      le16(nameBytes.length),
      le16(0)                // extra field length
    );
    var localHeaderBytes = new Uint8Array(localHeader.concat(Array.from(nameBytes)));
    var centralEntry = [].concat(
      [0x50,0x4B,0x01,0x02], // central dir signature
      le16(20), le16(20),    // version made by, needed
      le16(0),               // flags
      le16(0),               // compression
      le16(dosTime), le16(dosDate),
      le32(crc),
      le32(data.length), le32(data.length),
      le16(nameBytes.length),
      le16(0), le16(0),      // extra, comment length
      le16(0), le16(0),      // disk start, int attrs
      le32(0),               // ext attrs
      le32(offset)           // local header offset
    );
    central.push(new Uint8Array(centralEntry.concat(Array.from(nameBytes))));
    parts.push(localHeaderBytes, data);
    offset += localHeaderBytes.length + data.length;
  });

  var centralSize = 0, centralOffset = offset;
  central.forEach(function(c) { centralSize += c.length; });

  var eocd = new Uint8Array([].concat(
    [0x50,0x4B,0x05,0x06], // end of central dir signature
    le16(0), le16(0),      // disk number, disk with central dir
    le16(files.length), le16(files.length),
    le32(centralSize), le32(centralOffset),
    le16(0)                // comment length
  ));

  var totalSize = 0;
  parts.forEach(function(p) { totalSize += p.length; });
  central.forEach(function(c) { totalSize += c.length; });
  totalSize += eocd.length;

  var out = new Uint8Array(totalSize);
  var pos = 0;
  function append(arr) { out.set(arr, pos); pos += arr.length; }
  parts.forEach(append);
  central.forEach(append);
  append(eocd);
  return out;
}

function esc(s) {
  if (!s) return "";
  // Escapa las 5 entidades XML reservadas. El orden importa: "&" primero,
  // para no volver a escapar las entidades generadas por los reemplazos
  // siguientes. Sin esto, cualquier texto de usuario con <, >, &, " o '
  // (nombres, domicilios, cláusulas custom, etc.) puede romper el XML del
  // .docx y Word lo marca como corrupto al abrirlo.
  return String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}

// ── ESTILO DE PLANTILLA DOCX (personalización por inmobiliaria) ─────────────
// Valores por defecto inmutables. Cada exportación construye su propio contexto
// de estilo dentro de generarDOCX para evitar contaminación entre exportaciones.
var DOCX_STYLE_DEFAULT = Object.freeze({
  font: "Arial", colorPrim: "14213D", colorSec: "C9A227", borderColor: "CCCCCC"
});
function lightenHex(hex, amount){
  var h=(hex||"").replace("#","");
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length!==6) return "CCCCCC";
  var r=parseInt(h.substr(0,2),16), g=parseInt(h.substr(2,2),16), b=parseInt(h.substr(4,2),16);
  r=Math.round(r+(255-r)*amount); g=Math.round(g+(255-g)*amount); b=Math.round(b+(255-b)*amount);
  return [r,g,b].map(function(v){return v.toString(16).padStart(2,"0");}).join("").toUpperCase();
}

function pxBase(text, opts) {
  opts = opts || {};
  var st = opts._docxStyle || DOCX_STYLE_DEFAULT;
  var pPr = "";
  if (opts.keepNext) pPr += "<w:keepNext/>";
  if (opts.keepLines) pPr += "<w:keepLines/>";
  if (opts.spacing) pPr += '<w:spacing w:before="'+(opts.spacing.before||0)+'" w:after="'+(opts.spacing.after||100)+'" w:line="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.lineHeight)+'" w:lineRule="exact"/>';
  if (opts.center) pPr += '<w:jc w:val="center"/>';
  if (opts.justify) pPr += '<w:jc w:val="both"/>';
  if (!opts.spacing) pPr += '<w:spacing w:before="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.paragraphBefore)+'" w:after="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.paragraphAfter)+'" w:line="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.lineHeight)+'" w:lineRule="exact"/>';
  if (opts.border) pPr += '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="'+(opts.borderColor||st.borderColor)+'"/></w:pBdr>';
  var rPr = '<w:rFonts w:ascii="'+st.font+'" w:hAnsi="'+st.font+'" w:cs="'+st.font+'"/>';
  if (opts.bold) rPr += "<w:b/>";
  if (opts.size) rPr += '<w:sz w:val="'+(opts.size*2)+'"/><w:szCs w:val="'+(opts.size*2)+'"/>';
  if (opts.color) rPr += '<w:color w:val="'+opts.color+'"/>';
  if (opts.italic) rPr += "<w:i/>";
  var lines = (Array.isArray(text) ? text : [text||""]).map(normalizarTextoDocumento);
  var runs = "";
  lines.forEach(function(t, i) {
    if (i > 0) runs += "<w:r><w:br/></w:r>";
    runs += "<w:r>"+(rPr?"<w:rPr>"+rPr+"</w:rPr>":"")+"<w:t xml:space=\"preserve\">"+esc(t)+"</w:t></w:r>";
  });
  return "<w:p>"+(pPr?"<w:pPr>"+pPr+"</w:pPr>":"")+runs+"</w:p>";
}

// Párrafo con múltiples "runs" (negrita + normal combinados), estilo Bayugar:
// rótulo de cláusula en negrita seguido del texto corrido en el mismo párrafo.
function pxRunsBase(runsArr, opts) {
  opts = opts || {};
  var st = opts._docxStyle || DOCX_STYLE_DEFAULT;
  var pPr = "";
  if (opts.keepNext) pPr += "<w:keepNext/>";
  if (opts.keepLines) pPr += "<w:keepLines/>";
  if (opts.spacing) pPr += '<w:spacing w:before="'+(opts.spacing.before||0)+'" w:after="'+(opts.spacing.after||100)+'" w:line="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.lineHeight)+'" w:lineRule="exact"/>';
  if (opts.center) pPr += '<w:jc w:val="center"/>';
  if (opts.justify) pPr += '<w:jc w:val="both"/>';
  if (!opts.spacing) pPr += '<w:spacing w:before="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.paragraphBefore)+'" w:after="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.paragraphAfter)+'" w:line="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.lineHeight)+'" w:lineRule="exact"/>';
  if (opts.border) pPr += '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="'+(opts.borderColor||st.borderColor)+'"/></w:pBdr>';
  var runs = runsArr.map(function(r) {
    var rPr = '<w:rFonts w:ascii="'+st.font+'" w:hAnsi="'+st.font+'" w:cs="'+st.font+'"/>';
    if (r.bold) rPr += "<w:b/>";
    if (r.underline) rPr += '<w:u w:val="single"/>';
    if (r.size) rPr += '<w:sz w:val="'+(r.size*2)+'"/><w:szCs w:val="'+(r.size*2)+'"/>';
    if (r.color) rPr += '<w:color w:val="'+r.color+'"/>';
    if (r.italic) rPr += "<w:i/>";
    return "<w:r>"+(rPr?"<w:rPr>"+rPr+"</w:rPr>":"")+"<w:t xml:space=\"preserve\">"+esc(normalizarTextoDocumento(r.text||""))+"</w:t></w:r>";
  }).join("");
  return "<w:p>"+(pPr?"<w:pPr>"+pPr+"</w:pPr>":"")+runs+"</w:p>";
}

function docxHeaderBox(paragraphs, fill){
  var inner=(paragraphs||[]).join("");
  return '<w:tbl><w:tblPr><w:tblW w:w="10000" w:type="pct"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr>'
    + '<w:tr><w:tc><w:tcPr><w:shd w:val="clear" w:fill="'+fill+'"/><w:tcMar><w:top w:w="90" w:type="dxa"/><w:start w:w="120" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:end w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>'
    + inner + '</w:tc></w:tr></w:tbl>';
}

async function generarDOCX(doc, perfil) {
  return generarDOCXModulo(doc, perfil, { base64ToU8, buildZip, cuerpoTrasRotulo, docxHeaderBox, hexToDocx, lightenHex, nombreArchivoExportacion, normalizarTextoDocumento, normalizeLogoImage, prefijoClausulaDesdeNumTitulo, prefijoClausulaFormal, pxBase, pxRunsBase, tipoIdentificacion, u8 });
}


// Prueba de paridad: usa el mismo documento de ejemplo y devuelve el orden de
// secciones y el conteo de párrafos lógicos esperados por ambos exportadores.
async function pruebaParidadPDFDOCX(doc, perfil){
  var ejemplo=doc||{titulo:"PRUEBA DOCWORKS",secciones:[{titulo:"SECCIÓN 1",items:["Texto de prueba."]},{titulo:"SECCIÓN 2",items:["Segundo texto."]}],clausulas:[]};
  var pdf=await generarPDF(ejemplo,null,perfil||{});
  var docx=await generarDOCX(ejemplo,perfil||{});
  var orden=(ejemplo.secciones||[]).map(function(s){return s.titulo;}).concat((ejemplo.clausulas||[]).map(function(c){return c.titulo||"";}));
  var parrafos=1+(ejemplo.encabezado?ejemplo.encabezado.split(/\n\n/).length:0)+(ejemplo.partes||[]).length+(ejemplo.secciones||[]).reduce(function(n,s){return n+1+(s.items||[]).length;},0)+(ejemplo.clausulas||[]).reduce(function(n){return n+1;},0);
  return {ok:!!(pdf&&pdf.blob&&docx&&docx.blob),paragraphCount:parrafos,sectionOrder:orden,pdfFilename:pdf.filename,docxFilename:docx.filename};
}

// ── SPLASH / CARGA DE INICIO ─────────────────────────────────────────────────
// El video se sirve desde /Loading.MP4 (carpeta public del proyecto). Si todavía
// no existe o el navegador no puede reproducirlo, se conserva una pantalla fallback.
var DOCWORKS_STARTUP_SPLASH_SHOWN = false;
function SplashScreen({onDone}){
  const [fade,setFade]=useState(false);
  const [videoFailed,setVideoFailed]=useState(false);
  const [videoEnded,setVideoEnded]=useState(false);
  const videoRef=useRef(null);
  useEffect(function(){
    if(videoFailed){
      var t1=setTimeout(function(){setFade(true);},1500);
      var t2=setTimeout(function(){DOCWORKS_STARTUP_SPLASH_SHOWN=true;onDone();},2000);
      return function(){clearTimeout(t1);clearTimeout(t2);};
    }
    var video=videoRef.current;
    var safety=setTimeout(function(){setFade(true);setTimeout(function(){DOCWORKS_STARTUP_SPLASH_SHOWN=true;onDone();},500);},9000);
    // 4.27: iPhone/PWA bloquea el autoplay y muestra un botón Play. Si el video no arranca solo
    // en ~1,3 s, no se le pide nada al usuario: se pasa a la pantalla con logo, que no necesita toque.
    var arranque=setTimeout(function(){
      var v=videoRef.current;
      if(v && (v.paused || v.currentTime===0)) setVideoFailed(true);
    },1300);
    // Autoplay compatible con iOS/Android: el video debe estar silenciado
    // desde el atributo HTML y reproducirse inline. No desmontar el video por
    // un rechazo transitorio de play(); onCanPlay vuelve a intentar iniciarlo.
    if(video){
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.muted=true;
      video.defaultMuted=true;
      video.volume=0;
      video.playsInline=true;
      try{
        var playResult=video.play();
        if(playResult&&typeof playResult.catch==="function") playResult.catch(function(err){
          // Si la política del navegador bloquea autoplay, conservar el video
          // visible y reintentar en los eventos de carga; no reemplazarlo por logo.
          if(err&&err.name!=="NotAllowedError") console.warn("DocWorks: no se pudo iniciar Loading.MP4 automáticamente.",err);
        });
      }catch(e){console.warn("DocWorks: autoplay de Loading.MP4 pendiente.",e);}
    }
    return function(){clearTimeout(safety);clearTimeout(arranque);};
  },[videoFailed]);
  function finishVideo(){
    if(videoEnded)return;
    setVideoEnded(true);
    setFade(true);
    setTimeout(function(){DOCWORKS_STARTUP_SPLASH_SHOWN=true;onDone();},500);
  }
  return(
    <div style={{position:"fixed",inset:0,zIndex:99999,background:"radial-gradient(ellipse at 50% 0%, #142747 0%, #070d19 48%, #03060d 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:fade?0:1,transition:"opacity 0.5s ease",overflow:"hidden"}}>
      {!videoFailed ? <>
        <video ref={videoRef} className="dw-splash-video" controls={false} disablePictureInPicture={true} disableRemotePlayback={true} src="/Loading.MP4" autoPlay={true} muted={true} playsInline={true} webkit-playsinline="true" preload="auto" onLoadedMetadata={function(){var v=videoRef.current;if(v){v.muted=true;v.defaultMuted=true;v.volume=0;try{var r=v.play();if(r&&typeof r.catch==="function")r.catch(function(){});}catch(e){}}}} onCanPlay={function(){var v=videoRef.current;if(v&&v.paused){v.muted=true;v.volume=0;try{var r=v.play();if(r&&typeof r.catch==="function")r.catch(function(){});}catch(e){}}}} onPlaying={function(){setVideoFailed(false);}} onEnded={finishVideo} onError={function(){setVideoFailed(true);}} style={{width:"min(72vmin,544px)",height:"min(72vmin,544px)",maxWidth:"88vw",maxHeight:"62vh",objectFit:"contain",borderRadius:18,filter:"drop-shadow(0 14px 44px rgba(0,0,0,.28))"}} />
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"#e8edf6",letterSpacing:"0.04em",marginTop:22}}>Cargando<span style={{color:"#d4a853"}}>…</span></div>
        
      </> : <div style={{animation:"splashPop 0.7s cubic-bezier(0.175,0.885,0.32,1.275) both",display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
        <img src={LOGO_B64} alt="DocWorks" style={{width:"clamp(220px,46vmin,420px)",height:"clamp(220px,46vmin,420px)",objectFit:"contain",filter:"drop-shadow(0 0 38px rgba(212,168,83,0.42))"}}/>
        
        <div style={{fontSize:13,color:"#e8edf6",marginTop:14,fontWeight:600}}>Cargando<span style={{color:"#d4a853"}}>…</span></div>
        <div style={{marginTop:20,display:"flex",gap:8}}>{[0,1,2].map(function(i){return <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"rgba(212,168,83,0.8)",animation:"splashDot 1.2s "+(i*0.2)+"s ease-in-out infinite"}}/>;})}</div>
      </div>}
      <style>{`@keyframes splashPop{from{opacity:0;transform:scale(0.75)}to{opacity:1;transform:scale(1)}}@keyframes splashDot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1.1);opacity:1}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`}</style>
    </div>
  );
}


function GStyles() {
  useEffect(function(){
    var s=document.getElementById("dci-styles");
    if(!s){s=document.createElement("style");s.id="dci-styles";document.head.appendChild(s);}
    s.textContent=GS;
  },[]);
  return null;
}

function Btn({children=null,onClick=undefined,v=undefined,s=undefined,disabled=undefined,className=undefined,type=undefined,title=undefined,style=undefined}){
  return <button type={type||"button"} onClick={onClick} disabled={disabled} title={title} style={style} className={"btn btn-"+(v||"primary")+(s?" btn-"+s:"")+(className?" "+className:"")}>{children}</button>;
}
function Field({label=undefined,hint=undefined,children=undefined,className=undefined}){
  return <div className={"field "+(className||"")}>{label&&<label className="field-label">{label}</label>}{children}{hint&&<span className="field-hint">{hint}</span>}</div>;
}
function Inp({label=undefined,hint=undefined,error=undefined,className=undefined,...props}){
  return <Field label={label} hint={hint} className={className}><input className="inp" {...props}/>{error&&<span className="field-error">{error}</span>}</Field>;
}
function Txa({label=undefined,hint=undefined,rows=undefined,error=undefined,className=undefined,...props}){
  return <Field label={label} hint={hint} className={className}><textarea className="inp" rows={rows||3} {...props}/>{error&&<span className="field-error">{error}</span>}</Field>;
}
function Slt({label=undefined,hint=undefined,error=undefined,className=undefined,children=undefined,...props}){
  return <Field label={label} hint={hint} className={className}><select className="inp" {...props}>{children}</select>{error&&<span className="field-error">{error}</span>}</Field>;
}

const TIPO_BG={reserva:"rgba(59,130,246,0.12)",boleto:"rgba(139,92,246,0.12)",reserva_alquiler:"rgba(251,146,60,0.12)",alquiler:"rgba(45,212,191,0.12)"};
const TIPO_FG={reserva:"#60a5fa",boleto:"#a78bfa",reserva_alquiler:"#fb923c",alquiler:"var(--teal)"};

// Bloquea el scroll de la página de fondo mientras hay un modal abierto (sólo se mueve el contenido del modal).
function useBodyScrollLock(active){
  useEffect(function(){
    if(!active||typeof document==="undefined") return;
    var b=document.body,h=document.documentElement;
    var cnt=(window.__dwScrollLocks||0)+1; window.__dwScrollLocks=cnt;
    if(cnt===1){
      var y=window.pageYOffset||h.scrollTop||0;
      b.setAttribute("data-dw-scroll-y",String(y));
      b.style.position="fixed"; b.style.top="-"+y+"px"; b.style.left="0"; b.style.right="0"; b.style.width="100%";
      h.classList.add("dw-modal-open");
    }
    return function(){
      var c=Math.max(0,(window.__dwScrollLocks||1)-1); window.__dwScrollLocks=c;
      if(c===0){
        var y2=parseInt(b.getAttribute("data-dw-scroll-y")||"0",10)||0;
        b.style.position=""; b.style.top=""; b.style.left=""; b.style.right=""; b.style.width="";
        b.removeAttribute("data-dw-scroll-y"); h.classList.remove("dw-modal-open");
        try{ window.scrollTo(0,y2); }catch(e){}
      }
    };
  },[active]);
}

function Modal({open,onClose,title,children=undefined,wide=undefined,formTipo=undefined,headerExtra=undefined,headerRight=undefined,viewerMode=undefined,soft=undefined,operationForm=false,closeOnBackdrop=true}){
  useBodyScrollLock(!!open);
  if(!open)return null;
  return(
    <div className={"modal-overlay"+(viewerMode?" modal-overlay-viewer":"")+(soft?" modal-overlay-soft":"")+(operationForm?" modal-overlay-operation-form":"")} onClick={function(e){if(closeOnBackdrop && e.target===e.currentTarget)onClose();}}>
      <div className={"modal-box fade-up "+(wide?"wide":"narrow")+(viewerMode?" viewer-modal":"")}>
        <div className="modal-head" style={(headerExtra||headerRight)?{flexWrap:"wrap",rowGap:8}:undefined}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",rowGap:8,minWidth:0,flex:1}}>
            <span className="modal-title">{title}</span>
            {formTipo&&TIPOS[formTipo]&&<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:20,background:TIPO_BG[formTipo]||"rgba(212,168,83,0.1)",color:TIPO_FG[formTipo]||"var(--gold)",fontSize:11,fontWeight:600,border:"1px solid "+(TIPO_FG[formTipo]||"var(--gold)")+"44"}}>{TIPO_ICON[formTipo]} {TIPOS[formTipo]}</span>}
            {headerExtra}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,marginLeft:"auto",flexShrink:0}}>{headerRight}<button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar"><DWIcon name="close" size={13} strokeWidth={2}/></button></div>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Confirmación propia en vez de confirmación nativa: dentro de un WebView/app
// embebida (o de un preview sandboxeado) el diálogo nativo del navegador
// puede no dispararse o devolver siempre "cancelado" sin que se note — eso
// hacía que "Eliminar" pareciera no funcionar. Este modal corre 100% en React
// y no depende de ninguna API nativa del navegador.
function requestDwConfirm(message,onConfirm,confirmLabel=undefined,secondary=undefined){
  try{ window.dispatchEvent(new CustomEvent("dw:confirm",{detail:{message:message,onConfirm:onConfirm,confirmLabel:confirmLabel||"Confirmar",secondaryLabel:secondary&&secondary.label,onSecondary:secondary&&secondary.onClick}})); }
  catch(e){ dwNotify("error",typeof message==="string"?message:"Faltan datos en el documento."); }
}
function navegarConProteccionModelo(continuar){
  var evento=new CustomEvent("dw:model-navigation",{cancelable:true,detail:{continuar:continuar}});
  if(window.dispatchEvent(evento))continuar();
}
function ConfirmModal({open,title,message,confirmLabel,cancelLabel,danger=false,onConfirm,onCancel,secondaryLabel=null,onSecondary=null,secondaryDisabled=false}){
  useBodyScrollLock(!!open);
  if(!open)return null;
  return(
    <div className="modal-overlay dw-confirm-overlay" style={{zIndex:3100}} onClick={function(e){if(e.target===e.currentTarget)onCancel();}}>
      <div className="modal-box narrow fade-up dw-confirm-box" style={{maxWidth:380,maxHeight:"calc(100dvh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 20px)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div className="modal-head">
          <span className="modal-title">{title||"Confirmar"}</span>
          <button className="modal-close" onClick={onCancel} aria-label="Cerrar"><DWIcon name="close" size={13} strokeWidth={2}/></button>
        </div>
        <div className="modal-body" style={{overflowY:"auto",maxHeight:"calc(100dvh - 180px)",WebkitOverflowScrolling:"touch"}}>
          <div style={{fontSize:14,color:"var(--muted)",lineHeight:1.5,marginBottom:18,overflowWrap:"anywhere"}}>{message}</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
            <Btn v="secondary" s="sm" onClick={onCancel}>{cancelLabel||"Cancelar"}</Btn>
            {secondaryLabel&&onSecondary&&<Btn v="secondary" s="sm" disabled={!!secondaryDisabled} onClick={onSecondary}>{secondaryLabel}</Btn>}
            <Btn v={danger?"danger":"primary"} s="sm" onClick={onConfirm}>{confirmLabel||"Confirmar"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS_COMPRA=[{id:1,l:"Tipo"},{id:2,l:"Comprador"},{id:3,l:"Vendedor"},{id:4,l:"Inmueble"},{id:5,l:"Económico"},{id:6,l:"Cláusulas opcionales"}];
const STEPS_ALQUILER=[{id:1,l:"Tipo"},{id:2,l:"Locador"},{id:3,l:"Locatario"},{id:4,l:"Inmueble"},{id:5,l:"Condiciones"},{id:6,l:"Garantía"},{id:7,l:"Cláusulas opcionales"}];
const STEPS_RES_ALQ=[{id:1,l:"Tipo"},{id:2,l:"Locatario"},{id:3,l:"Locador"},{id:4,l:"Inmueble"},{id:5,l:"Condiciones"},{id:6,l:"Cláusulas opcionales"}];
const STEPS_SIMPLE=[{id:1,l:"Tipo"},{id:2,l:"Parte A"},{id:3,l:"Parte B"},{id:4,l:"Datos"},{id:5,l:"Cláusulas opcionales"}];
// Etiquetas de partes según el tipo de documento "simple" (comodato,
// autorización de venta, refuerzo, devolución). La autorización identifica
// automáticamente a la inmobiliaria como parte autorizada, sin pedir un interesado.
function labelsPartesSimples(t){var r=rolesPorTipo(t);return [r[1]||r[0],r[0]];}
function getSteps(t){
  if(t==="alquiler") return STEPS_ALQUILER;
  if(t==="reserva_alquiler") return STEPS_RES_ALQ;
  if(["comodato","exclusividad","refuerzo_reserva","devolucion_reserva"].includes(t)){
    var labels=labelsPartesSimples(t);
    return STEPS_SIMPLE.map(function(s){
      if(s.id===2) return {id:2,l:labels[0]};
      if(s.id===3) return {id:3,l:labels[1]};
      return s;
    });
  }
  return STEPS_COMPRA;
}

function IdentificacionField({value,onChange,placeholder=undefined,className=undefined,labelSuffix=undefined,style=undefined,error=undefined,id=undefined}){
  var limpio=String(value||"").replace(/\D/g,"");
  var tipo=tipoIdentificacion(value);
  var dniActivo=tipo==="DNI";
  var cuitActivo=tipo==="CUIT";
  function Chip({label,active}){
    return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:8,border:"1px solid "+(active?"var(--gold)":"var(--border2)"),background:active?"rgba(212,168,83,0.14)":"transparent",color:active?"var(--gold)":"var(--dim)",fontSize:12,fontWeight:active?700:500}}>{label}</span>;
  }
  return <Field className={className}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:5}}>
      <label className="field-label" style={{marginBottom:0}}>{tipo+(labelSuffix||"")}</label>
      <div style={{display:"flex",gap:5,flexShrink:0}}><Chip label="DNI" active={dniActivo}/><Chip label="CUIT" active={cuitActivo}/></div>
    </div>
    <input id={id} className="inp" value={value||""} onChange={onChange} placeholder={placeholder} style={style}/>
    {error&&<span className="field-error">{error}</span>}
    <span className="field-hint">{limpio.length===0?"Se detecta automáticamente según la cantidad de dígitos.":dniActivo?"Detectado: DNI · 7–8 dígitos.":cuitActivo?"Detectado: CUIT · 11 dígitos.":"Formato pendiente de identificar."}</span>
  </Field>;
}

function sumarDiasISO(fechaISO,dias){
  if(!fechaISO) return "";
  var d=new Date(fechaISO+"T12:00:00");
  if(isNaN(d.getTime())) return "";
  d.setDate(d.getDate()+(parseInt(dias,10)||0));
  return d.toISOString().slice(0,10);
}

function StepPersona({data,onChange,prefix,titulo,faltantes}){
  function f(k){return data[prefix+"_"+k]||"";}
  function s(k){return function(e){onChange(prefix+"_"+k,e.target.value);};}
  function onBlurNombre(){ var v=f("nombre"); var cap=capitalizarNombrePropio(v); if(cap!==v) onChange(prefix+"_nombre",cap); }
  var cotitulares = data[prefix+"_cotitulares"]||[];
  function setCotitulares(next){ onChange(prefix+"_cotitulares", next); }
  function agregarCotitular(){ setCotitulares(cotitulares.concat([{nombre:"",dni:"",domicilio:"",email:"",telefono:""}])); }
  function actualizarCotitular(i,k,v){ setCotitulares(cotitulares.map(function(p,idx){ return idx===i ? Object.assign({},p,{[k]:v}) : p; })); }
  function quitarCotitular(i){ setCotitulares(cotitulares.filter(function(p,idx){return idx!==i;})); }
  function onBlurNombreCotitular(i){ return function(){ var p=cotitulares[i]; if(!p) return; var cap=capitalizarNombrePropio(p.nombre); if(cap!==p.nombre) actualizarCotitular(i,"nombre",cap); }; }
  return(
    <div>
      <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:3}} title={ayudaRolForm(data.tipo,prefix)}>{tituloRolForm(data.tipo,prefix)}</div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:ayudaRolForm(data.tipo,prefix)?6:12}}>Completá los datos de {tituloRolForm(data.tipo,prefix).toLowerCase()}.</p>
      {ayudaRolForm(data.tipo,prefix)&&<div className="dw-rol-ayuda" style={{fontSize:12,color:"var(--gold)",background:"rgba(212,168,83,0.07)",border:"1px solid rgba(212,168,83,0.2)",borderRadius:9,padding:"7px 10px",marginBottom:12}}>ⓘ {ayudaRolForm(data.tipo,prefix)}</div>}
      <div className="grid2">
        <Inp id={"dw-field-"+prefix+"_nombre"} label="Nombre completo / Razón social" value={f("nombre")} onChange={function(e){onChange(prefix+"_nombre",capitalizarNombrePropio(e.target.value));}} onBlur={onBlurNombre} placeholder="Juan Pérez" className="col2" {...estiloCampoFaltante(faltantes,prefix+"_nombre")}/>
        <IdentificacionField id={"dw-field-"+prefix+"_dni"} value={f("dni")} onChange={s("dni")} placeholder="20-12345678-9" {...estiloCampoFaltante(faltantes,prefix+"_dni")}/>
        <Inp id={"dw-field-"+prefix+"_domicilio"} label="Domicilio" value={f("domicilio")} onChange={s("domicilio")} placeholder="Av. Corrientes 1234, CABA" className="col2" {...estiloCampoFaltante(faltantes,prefix+"_domicilio")}/>
        <Inp label="Teléfono" type="tel" inputMode="tel" value={f("telefono")} onChange={s("telefono")} placeholder="+54 9 11 1234-5678" hint="Dato interno de la operación."/>
        <Inp label="Correo electrónico" type="email" inputMode="email" autoComplete="email" value={f("email")} onChange={s("email")} placeholder="persona@correo.com" hint="Dato interno de la operación."/>
        <div className="col2 dw-doc-toggles">
          <label style={{display:"flex",alignItems:"center",fontSize:12.5,color:"var(--text)",cursor:"pointer"}}>
            <input type="checkbox" checked={!!data[prefix+"_telefono_en_doc"]} onChange={function(e){onChange(prefix+"_telefono_en_doc",e.target.checked);}}/>
            Mostrar teléfono en el documento
          </label>
          <label style={{display:"flex",alignItems:"center",fontSize:12.5,color:"var(--text)",cursor:"pointer"}}>
            <input type="checkbox" checked={!!data[prefix+"_email_en_doc"]} onChange={function(e){onChange(prefix+"_email_en_doc",e.target.checked);}}/>
            Mostrar correo en el documento
          </label>
        </div>
      </div>

      <div style={{marginTop:16,paddingTop:14,borderTop:"1px dashed var(--border2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:cotitulares.length?10:4}}>
          <div style={{fontSize:12.5,color:"var(--muted)"}}>¿Hay más de un titular? (ej. el inmueble está a nombre de 2 o más personas)</div>
          <Btn v="ghost" s="sm" onClick={agregarCotitular}>+ Agregar otro titular</Btn>
        </div>
        {cotitulares.map(function(p,i){
          return(
            <div key={i} style={{padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Co-titular {i+2}</div>
                <button onClick={function(){quitarCotitular(i);}} style={{background:"none",border:"none",color:"var(--red)",cursor:"pointer",fontSize:12}}>✕ Quitar</button>
              </div>
              <div className="grid2">
                <Inp label="Nombre completo" value={p.nombre||""} onChange={function(e){actualizarCotitular(i,"nombre",capitalizarNombrePropio(e.target.value));}} onBlur={onBlurNombreCotitular(i)} placeholder="María Gómez" className="col2"/>
                <IdentificacionField value={p.dni||""} onChange={function(e){actualizarCotitular(i,"dni",e.target.value);}} placeholder="27-98765432-1"/>
                <Inp label="Domicilio (si es distinto)" value={p.domicilio||""} onChange={function(e){actualizarCotitular(i,"domicilio",e.target.value);}} placeholder="Dejalo vacío si es el mismo" className="col2"/>
                <Inp label="Teléfono" type="tel" inputMode="tel" value={p.telefono||""} onChange={function(e){actualizarCotitular(i,"telefono",e.target.value);}} placeholder="+54 9 11 1234-5678" hint="Dato interno de la operación."/>
                <Inp label="Correo electrónico" type="email" inputMode="email" autoComplete="off" value={p.email||""} onChange={function(e){actualizarCotitular(i,"email",e.target.value);}} placeholder="persona@correo.com" hint="Dato interno de la operación."/>
                <label className="col2" style={{display:"flex",alignItems:"center",fontSize:12.5,color:"var(--text)",cursor:"pointer"}}>
                  <input type="checkbox" checked={typeof p.telefono_en_doc==="boolean"?p.telefono_en_doc:!!data[prefix+"_telefono_en_doc"]} onChange={function(e){actualizarCotitular(i,"telefono_en_doc",e.target.checked);}}/>
                  Mostrar teléfono en el documento
                </label>
                <label className="col2" style={{display:"flex",alignItems:"center",fontSize:12.5,color:"var(--text)",cursor:"pointer"}}>
                  <input type="checkbox" checked={typeof p.email_en_doc==="boolean"?p.email_en_doc:!!data[prefix+"_email_en_doc"]} onChange={function(e){actualizarCotitular(i,"email_en_doc",e.target.checked);}}/>
                  Mostrar correo en el documento
                </label>
              </div>
            </div>
          );
        })}
        {cotitulares.length>0&&<div style={{fontSize:12,color:"var(--dim)"}}>Los nombres, DNI y domicilios se combinan automáticamente en el documento generado (ej. «Juan Pérez y María Gómez»).</div>}
      </div>
    </div>
  );
}

function StepInmobiliariaAutorizada({data,perfil}){
  // 4.30: la inmobiliaria sale SIEMPRE del perfil corporativo; nunca de los campos de la contraparte (comprador_*).
  var nombre=perfil.nombre||"Sin nombre configurado";
  var cuit=perfil.cuit||"";
  var matricula=perfil.matricula||"";
  var domicilio=perfil.direccion||"";
  var email=perfil.email||"";
  var telefono=perfil.telefono||"";
  return(
    <div>
      <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:3}}>Inmobiliaria autorizada</div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Estos datos se cargan automáticamente desde Configuración → Mi cuenta. No hace falta completar nuevamente los datos de tu inmobiliaria.</p>
      <div style={{padding:"16px 18px",borderRadius:14,border:"1px solid rgba(212,168,83,.22)",background:"linear-gradient(135deg,rgba(212,168,83,.08),transparent)",display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
        <div style={{gridColumn:"1 / -1"}}>
          <div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Razón social / nombre comercial</div>
          <div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{nombre}</div>
        </div>
        {cuit&&<div><div style={{fontSize:12,color:"var(--dim)",marginBottom:4}}>CUIT</div><div style={{fontSize:12.5,color:"var(--text)"}}>{cuit}</div></div>}
        {matricula&&<div><div style={{fontSize:12,color:"var(--dim)",marginBottom:4}}>Matrícula</div><div style={{fontSize:12.5,color:"var(--text)"}}>{matricula}</div></div>}
        {domicilio&&<div style={{gridColumn:"1 / -1"}}><div style={{fontSize:12,color:"var(--dim)",marginBottom:4}}>Domicilio</div><div style={{fontSize:12.5,color:"var(--text)"}}>{domicilio}</div></div>}
        {email&&<div><div style={{fontSize:12,color:"var(--dim)",marginBottom:4}} >Correo electrónico</div><div style={{fontSize:12.5,color:"var(--text)"}}>{email}</div></div>}
        {telefono&&<div><div style={{fontSize:12,color:"var(--dim)",marginBottom:4}}>Teléfono</div><div style={{fontSize:12.5,color:"var(--text)"}}>{telefono}</div></div>}
      </div>
      {!perfil.nombre&&<div className="notice notice-amber" style={{marginTop:10,fontSize:12}}>Completá el nombre de la inmobiliaria en Configuración → Mi cuenta para que aparezca correctamente en la autorización.</div>}
    </div>
  );
}

function StepInmueble({data,onChange,faltantes}){
  return(
    <div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Datos del inmueble.</p>
      <div className="grid2">
        <Slt id="dw-field-inmueble_tipo" label="Tipo de inmueble" value={data.inmueble_tipo||"departamento"} onChange={function(e){onChange("inmueble_tipo",e.target.value);}} className={data.inmueble_tipo==="otro"?"":"col2"}>
          {TIPO_INMUEBLE_OPCIONES.map(function(o){return <option key={o.value} value={o.value}>{o.label}</option>;})}
        </Slt>
        {data.inmueble_tipo==="otro"&&<Inp id="dw-field-inmueble_tipo_otro" label="¿Cuál?" value={data.inmueble_tipo_otro||""} onChange={function(e){onChange("inmueble_tipo_otro",e.target.value);}} placeholder="Ej: Cochera, Depósito..."/>}
        <Inp id="dw-field-inmueble_direccion" label="Dirección" value={data.inmueble_direccion||""} onChange={function(e){onChange("inmueble_direccion",e.target.value);}} placeholder="Calle Falsa 123" className="col2" {...estiloCampoFaltante(faltantes,"inmueble_direccion")}/>
        <Inp id="dw-field-inmueble_unidad_funcional" label="Unidad funcional / Lote (opcional)" value={data.inmueble_unidad_funcional||""} onChange={function(e){onChange("inmueble_unidad_funcional",e.target.value);}} placeholder="Ej: UF 3 — Lote 12"/>
        <Inp id="dw-field-inmueble_partido" label="Partido / Municipio" value={data.inmueble_partido||""} onChange={function(e){onChange("inmueble_partido",e.target.value);}} placeholder="Lomas de Zamora" {...estiloCampoFaltante(faltantes,"inmueble_partido")}/>
        <Inp id="dw-field-inmueble_provincia" label="Provincia" value={data.inmueble_provincia||""} onChange={function(e){onChange("inmueble_provincia",e.target.value);}} placeholder="Buenos Aires" {...estiloCampoFaltante(faltantes,"inmueble_provincia")}/>
        <Txa id="dw-field-descripcion_inmueble" label="Descripción" value={data.descripcion_inmueble||""} onChange={function(e){onChange("descripcion_inmueble",e.target.value);}} placeholder="3 ambientes, 80m², piso 5..." className="col2" rows={2}/>
      </div>
    </div>
  );
}

// Bloque reutilizable "Operación compartida" — se agrega dentro del apartado
// Comisión inmobiliaria de cada tipo de operación (compra, alquiler, reserva de locación).
function CompartidaBlock({data,onChange,equipo}){
  var on = !!data.compartida;
  var conColega = !!data.compartida_colega_activo;
  var miembros = (equipo||[]).filter(function(m){return m.rol!=="viewer";});
  function seleccionarColega(id){
    var m=miembros.find(function(x){return x.id===id;});
    onChange("compartida_colega_id", id);
    onChange("compartida_colega", m?m.nombre:"");
    onChange("compartida_colega_email", m?m.email||"":"");
  }
  return (
    <div style={{marginTop:12,paddingTop:12,borderTop:"1px dashed var(--border)"}}>
      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,color:"var(--text)",cursor:"pointer"}}>
        <input type="checkbox" checked={on} onChange={function(e){onChange("compartida",e.target.checked);}}/>
        Operación compartida con otra inmobiliaria
      </label>
      {on&&<div style={{marginTop:10}}>
        <div className="grid2">
          <Inp id="dw-field-compartida_inmobiliaria" label="Inmobiliaria colega" value={data.compartida_inmobiliaria||""} onChange={function(e){onChange("compartida_inmobiliaria",e.target.value);}} placeholder="Nombre de la inmobiliaria"/>
          <Inp id="dw-field-compartida_matricula" label="N° de matrícula" value={data.compartida_matricula||""} onChange={function(e){onChange("compartida_matricula",e.target.value);}} placeholder="Ej. CUCICBA 1234"/>
        </div>
        <Slt id="dw-field-compartida_alcance" label="Alcance de lo compartido" value={data.compartida_alcance||"completa"} onChange={function(e){onChange("compartida_alcance",e.target.value);}} className="col2" hint="Define qué parte de la comisión se comparte con la otra inmobiliaria">
          <option value="completa">50% de la operación completa (comprador/locatario y vendedor/locador)</option>
          <option value="parte_compradora">Sólo 50% de la parte compradora / locataria</option>
        </Slt>
      </div>}
      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,color:"var(--text)",cursor:"pointer",marginTop:12}}>
        <input type="checkbox" checked={conColega} onChange={function(e){onChange("compartida_colega_activo",e.target.checked);}}/>
        Compartir con un colega de mi inmobiliaria
      </label>
      {conColega&&<div style={{marginTop:10}}>
        {miembros.length===0
          ? <div className="notice" style={{fontSize:12}}>Todavía no cargaste a nadie en Configuración → Equipo. Agregá a tu colega ahí para poder seleccionarlo acá.</div>
          : <Slt label="Colega (miembro del equipo)" value={data.compartida_colega_id||""} onChange={function(e){seleccionarColega(e.target.value);}} className="col2">
              <option value="">Seleccionar colega...</option>
              {miembros.map(function(m){var rd=ROLES_DEF[m.rol]; return <option key={m.id} value={m.id}>{m.nombre}{rd?" — "+rd.label:""}</option>;})}
            </Slt>
        }
        {data.compartida_colega_id&&miembros.some(function(m){return m.id===data.compartida_colega_id;})&&(
          <div style={{display:"flex",alignItems:"center",gap:9,marginTop:8,padding:"8px 10px",borderRadius:10,border:"1px solid var(--border2)",background:"rgba(212,168,83,.055)"}}>
            <div style={{width:34,height:34,borderRadius:"50%",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(145deg,var(--gold),var(--gold2))",color:"#111827",fontWeight:800,flexShrink:0}}>
              {((miembros.find(function(m){return m.id===data.compartida_colega_id;})||{}).fotoDataUrl)
                ? <img src={(miembros.find(function(m){return m.id===data.compartida_colega_id;})||{}).fotoDataUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="Foto del colega"/>
                : (((miembros.find(function(m){return m.id===data.compartida_colega_id;})||{}).nombre||"?").charAt(0).toUpperCase())}
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>Operación compartida con {((miembros.find(function(m){return m.id===data.compartida_colega_id;})||{}).nombre)||"colega"}</div>
              <div style={{fontSize:12,color:"var(--dim)"}}>La foto de perfil se comparte con el equipo.</div>
            </div>
          </div>
        )}
        <div className="notice notice-gold" style={{marginTop:8,fontSize:12}}>El colega elegido queda registrado como corredor asociado a esta operación y va a poder verla y editarla desde su propia sesión (no en simultáneo con vos — el último que guarda es el que queda). Cuando el documento esté terminado, usá "📤 Compartir documento" para enviarle el PDF final por WhatsApp, mail u otra app.</div>
      </div>}
    </div>
  );
}

function ComisionEditor({data,onChange,prefix,label,base,monedaBase,defaultPct,legacyKey}){
  var modo=normalizarModoComision(data[prefix+"_modo"]);
  var legacy=data[legacyKey||prefix];
  // Si el usuario borra todos los dígitos, el input debe quedar vacío.
  // No volver a inyectar el valor legacy/default mientras escribe.
  var hasExplicitValue=Object.prototype.hasOwnProperty.call(data,prefix+"_valor");
  var valor=hasExplicitValue ? data[prefix+"_valor"] : (legacy!==undefined?legacy:defaultPct);
  var monedaFija=data[prefix+"_moneda"]||monedaBase||"ARS";
  var n=parseMontoAR(valor)||0;
  var monto=modo==="fijo"?n:(parseMontoAR(base)||0)*n/100;
  function setModo(next){
    onChange(prefix+"_modo",next);
    if(next==="fijo"){
      var seed=(parseMontoAR(base)||0)*((parseMontoAR(legacy)||0))/100;
      onChange(prefix+"_valor",seed?String(Math.round(seed*100)/100):"");
      if(!data[prefix+"_moneda"]) onChange(prefix+"_moneda",monedaBase||"ARS");
    } else {
      var pctActual=(parseMontoAR(legacy)||0);
      if(!pctActual && n>0 && parseMontoAR(base)>0) pctActual=n*100/parseMontoAR(base);
      onChange(prefix+"_valor",pctActual?String(Math.round(pctActual*10000)/10000):"");
      onChange(legacyKey||prefix,pctActual?String(Math.round(pctActual*10000)/10000):"");
    }
  }
  return <div style={{padding:"11px 12px",borderRadius:11,border:"1px solid var(--border)",background:"rgba(255,255,255,.018)"}}>
    <div style={{fontSize:12,fontWeight:700,color:"var(--text)",marginBottom:8}}>{label}</div>
    <div style={{display:"grid",gridTemplateColumns:modo==="fijo"?"1fr 1.2fr .8fr":"1fr 1.2fr",gap:7}}>
      <select className="inp" value={modo} onChange={function(e){setModo(e.target.value);}}>
        <option value="porcentaje">Porcentaje (%)</option>
        <option value="fijo">Monto fijo</option>
      </select>
      <div style={{position:"relative",minWidth:0}}>
        <input className="inp" type="number" min="0" step="0.01" value={valor===0?"0":(valor||"")} onChange={function(e){onChange(prefix+"_valor",e.target.value);if(modo==="porcentaje")onChange(legacyKey||prefix,e.target.value);}} placeholder={modo==="fijo"?"Ej. 500000":"Ej. 4"} style={{paddingRight:modo==="porcentaje"?30:12}}/>
        {modo==="porcentaje"&&<span style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",color:"var(--dim)",fontWeight:700,pointerEvents:"none"}}>%</span>}
      </div>
      {modo==="fijo"&&<select className="inp" value={monedaFija} onChange={function(e){onChange(prefix+"_moneda",e.target.value);}}>
        <option value="ARS">ARS</option><option value="USD">USD</option>
      </select>}
    </div>
    <div style={{fontSize:12,color:"var(--dim)",marginTop:6}}>
      {modo==="fijo" ? (monto>0?"Honorario: "+fmt$(monto,monedaFija):"Ingresá el monto fijo.") : (monto>0?"Equivale a "+fmt$(monto,monedaBase):"Se calcula sobre la base de la operación.")}
    </div>
  </div>;
}

// Resumen descriptivo del acuerdo. No altera las cláusulas legales publicadas.
function describirAcuerdoPagoCompra(op){
  if(!op || !op.compra_modalidad_pago || op.compra_modalidad_pago==="habitual") return "";
  var modos={unico:"Pago único",entrega_saldo:"Entrega inicial y saldo",cuotas:"Pago en cuotas",especial:"Condición especial"};
  var medios={efectivo:"en efectivo",transferencia:"por transferencia bancaria",mixto:"en efectivo y por transferencia bancaria"};
  var modalidad=modos[op.compra_modalidad_pago]||"";
  if(!modalidad)return "";
  var medio=medios[op.compra_medio_pago]||(op.compra_medio_pago==="otro"?String(op.compra_medio_otro||"").trim():"medio a definir");
  var detalle=String(op.compra_condiciones_pago||"").trim();
  var resultado=modalidad+" · "+medio;
  if(op.compra_modalidad_pago==="cuotas"){
    var n=Number(op.compra_cuotas_cantidad);
    if(Number.isInteger(n)&&n>0) resultado+=" · "+n+" cuotas";
    var primerVencimiento=(cronogramaCuotasCompra(op)[0]||{}).fecha||op.compra_cuotas_primera_fecha;
    if(primerVencimiento) resultado+=" · primer vencimiento: "+primerVencimiento;
  }
  if(detalle) resultado+=" · "+detalle;
  return resultado;
}

function StepEconomicoCompra({data,onChange,equipo,faltantes}){
  var precio=parseFloat(data.precio)||0,anticipo=parseFloat(data.anticipo)||0;
  var pctV=parseFloat(data.comision_vendedor||0),pctC=parseFloat(data.comision_comprador||0);
  useEffect(function(){if(precio>0)onChange("saldo",String(Math.max(0,precio-anticipo)));},[data.precio,data.anticipo]);
  useEffect(function(){if(data.tipo==="reserva"&&!data.reserva_aceptacion_vencimiento){onChange("reserva_aceptacion_vencimiento",sumarDiasISO(data.reserva_fecha_reserva||fechaHoyISO(),data.reserva_aceptacion_dias||5));}},[data.tipo,data.reserva_aceptacion_dias,data.reserva_fecha_reserva]);
  return(
    <div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Condiciones económicas.</p>
      <div className="grid2">
        <Inp id="dw-field-precio" label="Precio total" value={data.precio||""} onChange={function(e){onChange("precio",e.target.value);}} placeholder="100000" type="number" {...estiloCampoFaltante(faltantes,"precio")}/>
        <Slt id="dw-field-moneda" label="Moneda" value={data.moneda||"USD"} onChange={function(e){onChange("moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt>
        <Inp id="dw-field-anticipo" label="Seña / Anticipo" value={data.anticipo||""} onChange={function(e){onChange("anticipo",e.target.value);}} placeholder="10000" type="number" {...estiloCampoFaltante(faltantes,"anticipo")}/>
        <Field label="Saldo restante"><div className="val-box">{fmt$(data.saldo||(precio-anticipo),data.moneda)}</div></Field>
        <div className="col2" style={{padding:"12px 14px",border:"1px solid var(--border)",borderRadius:12,background:"var(--surface2)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:4}}>¿Cómo se realizará el pago?</div>
          <div style={{fontSize:12,color:"var(--dim)",marginBottom:10}}>Elegí la forma de pago. Las condiciones se guardan con la operación. Si agregás un detalle especial, DocWorks comprobará que figure en el documento antes de exportar.</div>
          <div className="grid2">
            <Slt id="dw-field-compra_modalidad_pago" label="Modalidad" value={data.compra_modalidad_pago||"habitual"} onChange={function(e){onChange("compra_modalidad_pago",e.target.value);}}>
              <option value="habitual">Según el modelo habitual</option>
              <option value="unico">Pago único</option>
              <option value="entrega_saldo">Entrega inicial y saldo</option>
              <option value="cuotas">Pago en cuotas</option>
              <option value="especial">Condición especial</option>
            </Slt>
            <Slt id="dw-field-compra_medio_pago" label="Medio de pago" value={data.compra_medio_pago||"sin_definir"} onChange={function(e){onChange("compra_medio_pago",e.target.value);}}>
              <option value="sin_definir">A definir</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia bancaria</option>
              <option value="mixto">Efectivo y transferencia</option>
              <option value="otro">Otro</option>
            </Slt>
          </div>
          {data.compra_medio_pago==="otro"&&<Inp id="dw-field-compra_medio_otro" label="Especificá el medio" value={data.compra_medio_otro||""} onChange={function(e){onChange("compra_medio_otro",e.target.value);}} placeholder="Medio acordado"/>}
          {data.compra_modalidad_pago==="cuotas"&&<div style={{marginTop:9}}>
            <Inp id="dw-field-compra_cuotas_cantidad" label="Cantidad de cuotas" type="number" min="1" max="36" value={data.compra_cuotas_cantidad||""} onChange={function(e){onChange("compra_cuotas_cantidad",e.target.value);}} placeholder="Ej. 4"/>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:5}}>Completá el primer vencimiento dentro de la cuota 1, junto con su importe y medio de pago.</div>
          </div>}
          {data.compra_modalidad_pago==="cuotas"&&Number.isInteger(Number(data.compra_cuotas_cantidad))&&Number(data.compra_cuotas_cantidad)>0&&Number(data.compra_cuotas_cantidad)<=36&&<div style={{marginTop:10}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Cronograma de cuotas</div>
            {Array.from({length:Number(data.compra_cuotas_cantidad)},function(_,i){
              var cuotas=cronogramaCuotasCompra(data);
              var cuota=cuotas[i]||{};
              var actualizar=function(campo,valor){
                var nuevas=Array.from({length:Number(data.compra_cuotas_cantidad)},function(_,j){return Object.assign({},cuotas[j]||{});});
                nuevas[i][campo]=valor;
                onChange("compra_cuotas_cronograma",JSON.stringify(nuevas));
              };
              return <div key={i} className="grid2" style={{padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
                <div style={{gridColumn:"1/-1",fontSize:12,fontWeight:600}}>Cuota {i+1}</div>
                <Inp label="Importe" type="number" min="0" value={cuota.importe||""} onChange={function(e){actualizar("importe",e.target.value);}}/>
                <Inp id={i===0?"dw-field-compra_cuotas_primera_fecha":undefined} label="Vencimiento" type="date" value={cuota.fecha||""} onChange={function(e){actualizar("fecha",e.target.value);}}/>
                <Slt label="Medio de pago" value={cuota.medio||""} onChange={function(e){actualizar("medio",e.target.value);}}>
                  <option value="">Elegir medio</option><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="mixto">Mixto</option><option value="otro">Otro</option>
                </Slt>
                {cuota.medio==="otro"&&<Inp label="Especificá el medio de esta cuota" value={cuota.medio_otro||""} onChange={function(e){actualizar("medio_otro",e.target.value);}} placeholder="Medio acordado"/>}
              </div>;
            })}
          </div>}
          {data.compra_modalidad_pago==="cuotas"&&Number(data.compra_cuotas_cantidad)>0&&<div style={{fontSize:12,color:"var(--muted)",marginTop:8}}>Saldo pendiente: {fmt$(Math.max(0,precio-anticipo),data.moneda)}. La suma de los importes de las cuotas debe coincidir con ese saldo. Podés pactar cuotas de distinto importe.</div>}
          {data.compra_modalidad_pago!=="habitual"&&<div style={{marginTop:10,padding:"11px 12px",border:"1px solid var(--border)",borderRadius:10,background:"var(--surface2)"}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:5}}>Resumen del acuerdo de pago</div>
            <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>
              {data.compra_modalidad_pago==="unico"?"Pago único":data.compra_modalidad_pago==="entrega_saldo"?"Entrega inicial y saldo":data.compra_modalidad_pago==="cuotas"?"Pago en cuotas":"Condición especial"}
              {" · "}{data.compra_medio_pago==="efectivo"?"Efectivo":data.compra_medio_pago==="transferencia"?"Transferencia bancaria":data.compra_medio_pago==="mixto"?"Efectivo y transferencia":data.compra_medio_pago==="otro"?(data.compra_medio_otro||"Medio sin especificar"):"Medio a definir"}
              {data.compra_modalidad_pago==="cuotas"&&Number(data.compra_cuotas_cantidad)>0?" · "+data.compra_cuotas_cantidad+" cuotas":""}
            </div>
            {precio<=0&&<div style={{color:"var(--danger,#c45353)",fontSize:12,marginTop:6}}>Completá el precio total para calcular los pagos.</div>}
            {anticipo>precio&&precio>0&&<div style={{color:"var(--danger,#c45353)",fontSize:12,marginTop:6}}>La entrega inicial supera el precio total.</div>}
            {data.compra_modalidad_pago==="cuotas"&&(!Number.isInteger(Number(data.compra_cuotas_cantidad))||Number(data.compra_cuotas_cantidad)<1||!((cronogramaCuotasCompra(data)[0]||{}).fecha||data.compra_cuotas_primera_fecha))&&<div style={{color:"var(--danger,#c45353)",fontSize:12,marginTop:6}}>Indicá una cantidad válida de cuotas y el vencimiento de la cuota 1.</div>}
            {data.compra_modalidad_pago==="especial"&&!String(data.compra_condiciones_pago||"").trim()&&<div style={{color:"var(--danger,#c45353)",fontSize:12,marginTop:6}}>Describí la condición especial acordada.</div>}
            {data.compra_medio_pago==="mixto"&&!String(data.compra_condiciones_pago||"").trim()&&<div style={{color:"var(--danger,#c45353)",fontSize:12,marginTop:6}}>Detallá cuánto se abona por cada medio de pago.</div>}
            <div style={{fontSize:11,color:"var(--dim)",marginTop:7}}>Resumen interno: {describirAcuerdoPagoCompra(data)}. Las condiciones especiales deben figurar también en el documento final.</div>
          </div>}
          {(data.compra_modalidad_pago!=="habitual"||data.compra_medio_pago==="mixto")&&<Txa id="dw-field-compra_condiciones_pago" label="Detalle de lo acordado" value={data.compra_condiciones_pago||""} onChange={function(e){onChange("compra_condiciones_pago",e.target.value);}} rows={3} placeholder="Ej. Una parte en efectivo al firmar y el resto por transferencia al escriturar."/>}
        </div>
        {data.tipo!=="reserva"&&<Inp id="dw-field-fecha_posesion" label="Fecha de posesión" value={data.fecha_posesion||""} onChange={function(e){onChange("fecha_posesion",e.target.value);}} type="date" className="col2" {...estiloCampoFaltante(faltantes,"fecha_posesion")}/>}
        {data.tipo==="reserva"&&<div className="col2" style={{padding:"12px 14px",border:"1px solid var(--border2)",borderRadius:12,background:"var(--surface2)"}}>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,fontWeight:600,color:"var(--text)"}}>
            <input id="dw-field-reserva_incluye_refuerzo" type="checkbox" checked={!!data.reserva_incluye_refuerzo} onChange={function(e){onChange("reserva_incluye_refuerzo",e.target.checked);}}/>
            ¿Se pactó la posibilidad de un refuerzo de reserva?
          </label>
          <div style={{fontSize:12,color:"var(--muted)",marginTop:6}}>Si lo activás, DocWorks incorpora la cláusula correspondiente al documento. El refuerzo efectivo se documenta en una operación de Refuerzo de reserva.</div>
        </div>}
        {data.tipo==="reserva"&&!!data.reserva_incluye_refuerzo&&<Inp id="dw-field-reserva_fecha_refuerzo" label="Fecha límite para tomar refuerzo" value={data.reserva_fecha_refuerzo||""} onChange={function(e){onChange("reserva_fecha_refuerzo",e.target.value);}} type="date" className="col2" hint="Opcional — si la cargás, la app te avisa en el Calendario cuando se acerca. La fecha de posesión y la escribanía suelen definirse recién en el boleto."/>}
        {data.tipo==="reserva"&&<Slt id="dw-field-reserva_vigencia_dias" label="Vigencia de la reserva" value={data.reserva_vigencia_dias||"30"} onChange={function(e){onChange("reserva_vigencia_dias",e.target.value);}} className="col2" hint="Días corridos, desde que el Vendedor conforma la reserva, para firmar el boleto y/o la escritura. Figura en la cláusula «Vigencia de la reserva».">{["5","7","10","15","20","30","45","60","90"].map(function(d){return <option key={d} value={d}>{d} días corridos</option>;})}</Slt>}
        {data.tipo==="reserva"&&<div className="col2" style={{marginTop:2,padding:"12px 14px",borderRadius:12,border:"1px solid rgba(212,168,83,.22)",background:"rgba(212,168,83,.045)"}}>
          <div style={{fontSize:12.2,fontWeight:700,color:"var(--text)",marginBottom:3}}>Plazo de aceptación</div>
          <div style={{fontSize:12,color:"var(--dim)",marginBottom:9}}>El asesor elige cómo vence la aceptación: por horas desde la firma, por días, o en una fecha fija. Se refleja en la cláusula y en el Calendario.</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
            {[
              {id:"horas",label:"Horas"},
              {id:"dias",label:"Días"},
              {id:"fecha",label:"Fecha fija"},
            ].map(function(opt){
              var activo=(data.reserva_aceptacion_modo||"dias")===opt.id;
              return (
                <button key={opt.id} type="button" onClick={function(){
                  onChange("reserva_aceptacion_modo",opt.id);
                  if(opt.id==="horas" && !data.reserva_aceptacion_horas) onChange("reserva_aceptacion_horas","48");
                  if(opt.id==="dias"){
                    var n=parseInt(data.reserva_aceptacion_dias,10)||5;
                    onChange("reserva_aceptacion_dias",String(n));
                    onChange("reserva_aceptacion_vencimiento",sumarDiasISO(data.reserva_fecha_reserva||fechaHoyISO(),n));
                  }
                }} style={{padding:"6px 12px",borderRadius:999,border:activo?"1px solid rgba(212,168,83,.55)":"1px solid var(--border)",background:activo?"rgba(212,168,83,.18)":"var(--surface2)",color:activo?"var(--gold)":"var(--muted)",fontWeight:700,fontSize:12,cursor:"pointer"}}>{opt.label}</button>
              );
            })}
          </div>
          {(data.reserva_aceptacion_modo||"dias")==="horas" && (
            <Inp label="Horas desde la suscripción" type="number" min="1" max="720" value={data.reserva_aceptacion_horas||48} onChange={function(e){var n=Math.max(1,Math.min(720,parseInt(e.target.value,10)||48));onChange("reserva_aceptacion_horas",String(n));}} hint="Ej: 48 = caduca a las 48 horas de firmada"/>
          )}
          {(data.reserva_aceptacion_modo||"dias")==="dias" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Inp label="Días para aceptar" type="number" min="1" max="90" value={data.reserva_aceptacion_dias||5} onChange={function(e){var n=Math.max(1,Math.min(90,parseInt(e.target.value,10)||1));onChange("reserva_aceptacion_dias",String(n));onChange("reserva_aceptacion_vencimiento",sumarDiasISO(data.reserva_fecha_reserva||fechaHoyISO(),n));}}/>
              <Inp id="dw-field-reserva_aceptacion_vencimiento" label="Vencimiento (auto)" type="date" value={data.reserva_aceptacion_vencimiento||""} onChange={function(e){onChange("reserva_aceptacion_vencimiento",e.target.value);}}/>
            </div>
          )}
          {(data.reserva_aceptacion_modo||"dias")==="fecha" && (
            <Inp id="dw-field-reserva_aceptacion_vencimiento" label="Fecha de vencimiento" type="date" value={data.reserva_aceptacion_vencimiento||""} onChange={function(e){onChange("reserva_aceptacion_vencimiento",e.target.value);}}/>
          )}
        </div>}
        {data.tipo!=="reserva"&&<Inp id="dw-field-escribania" label="Escribanía" value={data.escribania||""} onChange={function(e){onChange("escribania",e.target.value);}} placeholder="Escribanía García" className="col2"/>}
        <div className="col2"><div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Comisión inmobiliaria</div>
          <div style={{fontSize:12,color:"var(--dim)",marginBottom:9}}>Para cada parte podés elegir porcentaje o un monto fijo. La moneda del honorario fijo también se define por separado.</div>
          <div className="grid2">
            <div><ComisionEditor data={data} onChange={onChange} prefix="comision_vendedor" legacyKey="comision_vendedor" label="Vendedor" base={precio} monedaBase={data.moneda||"USD"} defaultPct="3"/>
              <label style={{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:12.5,color:"var(--text)",cursor:"pointer"}}><input type="checkbox" checked={!!data.comision_vendedor_ocultar_doc} onChange={function(e){onChange("comision_vendedor_ocultar_doc",e.target.checked);}}/> No mostrar comisión del vendedor en el documento</label>
            </div>
            <div><ComisionEditor data={data} onChange={onChange} prefix="comision_comprador" legacyKey="comision_comprador" label="Comprador" base={precio} monedaBase={data.moneda||"USD"} defaultPct="3"/>
              <label style={{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:12.5,color:"var(--text)",cursor:"pointer"}}><input type="checkbox" checked={!!data.comision_comprador_ocultar_doc} onChange={function(e){onChange("comision_comprador_ocultar_doc",e.target.checked);}}/> No mostrar comisión del comprador en el documento</label>
            </div>
          </div>
        </div>
        <CompartidaBlock data={data} onChange={onChange} equipo={equipo}/>
      </div>
    </div>
  );
}

function StepCondicionesAlquiler({data,onChange,equipo,faltantes}){
  var monto=parseFloat(data.alquiler_monto_inicial)||0;
  var baseComision=totalContratoAlquiler(data);
  var dep=parseFloat(data.alquiler_deposito)||1;
  var pctL=parseFloat(data.alquiler_comision_locador||0),pctT=parseFloat(data.alquiler_comision_locatario||0);
  useEffect(function(){
    if(data.alquiler_inicio&&(data.alquiler_plazo_meses||data.alquiler_plazo_dias)){
      onChange("alquiler_fin",finContratoISO(data.alquiler_inicio,data.alquiler_plazo_meses,data.alquiler_plazo_dias));
    }
  },[data.alquiler_inicio,data.alquiler_plazo_meses,data.alquiler_plazo_dias]);
  function toggleFormaPago(v){
    var arr=formaPagoArr(data.alquiler_forma_pago).slice();
    var idx=arr.indexOf(v);
    if(idx>=0)arr.splice(idx,1);else arr.push(v);
    onChange("alquiler_forma_pago",arr);
  }
  var totalDeposito = data.alquiler_deposito==="otro"
    ? (data.alquiler_deposito_otro_monto?fmt$(data.alquiler_deposito_otro_monto,data.alquiler_deposito_otro_moneda||"USD"):"—")
    : (monto>0?fmt$(monto*dep,data.alquiler_moneda):"—");
  return(
    <div><div className="grid2">
      <Inp id="dw-field-alquiler_monto_inicial" label="Alquiler mensual inicial" value={data.alquiler_monto_inicial||""} onChange={function(e){onChange("alquiler_monto_inicial",e.target.value);}} placeholder="150000" type="number" {...estiloCampoFaltante(faltantes,"alquiler_monto_inicial")}/>
      <Slt id="dw-field-alquiler_moneda" label="Moneda" value={data.alquiler_moneda||"ARS"} onChange={function(e){onChange("alquiler_moneda",e.target.value);}}><option value="ARS">ARS</option><option value="USD">USD</option></Slt>
      <Slt id="dw-field-alquiler_destino" label="Destino" value={data.alquiler_destino||"vivienda"} onChange={function(e){onChange("alquiler_destino",e.target.value);}}><option value="vivienda">Vivienda</option><option value="comercial">Comercial</option><option value="profesional">Profesional</option></Slt>

      <div className="col2"><div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Plazo del contrato</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Inp id="dw-field-alquiler_plazo_meses" label="Meses" value={data.alquiler_plazo_meses||"24"} onChange={function(e){onChange("alquiler_plazo_meses",e.target.value);}} placeholder="24" type="number" hint="Plazo pactado libremente por las partes" {...estiloCampoFaltante(faltantes,"alquiler_plazo_meses")}/>
          <Inp id="dw-field-alquiler_plazo_dias" label="Días adicionales" value={data.alquiler_plazo_dias||"0"} onChange={function(e){onChange("alquiler_plazo_dias",e.target.value);}} placeholder="0" type="number"/>
        </div>
      </div>

      <Inp id="dw-field-alquiler_inicio" label="Fecha de inicio" value={data.alquiler_inicio||""} onChange={function(e){onChange("alquiler_inicio",e.target.value);}} type="date" {...estiloCampoFaltante(faltantes,"alquiler_inicio")}/>
      <Field label="Vencimiento (inclusive)"><div className="val-box">{finAlquilerISO(data)?fmtD(finAlquilerISO(data)):"—"}</div></Field>

      <div>
        <Slt id="dw-field-alquiler_actualizacion" label="Índice actualización" value={data.alquiler_actualizacion||"ICL"} onChange={function(e){onChange("alquiler_actualizacion",e.target.value);}} hint="Índice pactado por las partes conforme a la normativa vigente">
          <option value="ICL">ICL — BCRA</option>
          <option value="IPC">IPC — INDEC</option>
          <option value="UVA">UVA</option>
          <option value="fijo">Canon fijo (sin actualización)</option>
          <option value="otro">Otro (personalizado)</option>
        </Slt>
        {data.alquiler_actualizacion==="otro"&&<Inp id="dw-field-alquiler_actualizacion_otro" value={data.alquiler_actualizacion_otro||""} onChange={function(e){onChange("alquiler_actualizacion_otro",e.target.value);}} placeholder="Nombre del índice" style={{marginTop:8}}/>}
      </div>
      <div>
        <Slt id="dw-field-alquiler_periodo_actualizacion" label="Período actualización" value={data.alquiler_periodo_actualizacion||"cuatrimestral"} onChange={function(e){onChange("alquiler_periodo_actualizacion",e.target.value);}}>
          <option value="trimestral">Trimestral</option>
          <option value="cuatrimestral">Cuatrimestral</option>
          <option value="semestral">Semestral</option>
          <option value="anual">Anual</option>
          <option value="otro">Otro (personalizado)</option>
        </Slt>
        {data.alquiler_periodo_actualizacion==="otro"&&<Inp id="dw-field-alquiler_periodo_otro" value={data.alquiler_periodo_otro||""} onChange={function(e){onChange("alquiler_periodo_otro",e.target.value);}} placeholder="Ej: cada 2 meses" style={{marginTop:8}}/>}
      </div>

      <div className="col2">
        <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Forma de pago (elegí una o más)</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {FORMAS_PAGO.map(function(f){
            var checked=formaPagoArr(data.alquiler_forma_pago).indexOf(f.value)>=0;
            return (
              <label key={f.value} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:10,border:"1px solid var(--border)",background:checked?"rgba(212,168,83,0.08)":"transparent",cursor:"pointer",fontSize:12.5,color:"var(--text)"}}>
                <input type="checkbox" checked={checked} onChange={function(){toggleFormaPago(f.value);}}/>{f.label}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <Slt id="dw-field-alquiler_dia_pago" label="Día de pago" value={data.alquiler_dia_pago||"1"} onChange={function(e){onChange("alquiler_dia_pago",e.target.value);}}>
          <option value="1">Día 1</option><option value="5">Día 5</option><option value="10">Día 10</option><option value="15">Día 15</option><option value="otro">Otro día</option>
        </Slt>
        {data.alquiler_dia_pago==="otro"&&<Inp id="dw-field-alquiler_dia_pago_otro" value={data.alquiler_dia_pago_otro||""} onChange={function(e){onChange("alquiler_dia_pago_otro",e.target.value);}} placeholder="Ej: 20" type="number" style={{marginTop:8}}/>}
      </div>
      <div>
        <Slt id="dw-field-alquiler_deposito" label="Depósito" value={valorComisionPredeterminado(data.alquiler_deposito,"1")} onChange={function(e){onChange("alquiler_deposito",e.target.value);}} hint="Monto de depósito a pactar según la operación y la normativa aplicable">
          <option value="1">1 mes</option><option value="2">2 meses</option><option value="otro">Monto personalizado</option>
        </Slt>
        {data.alquiler_deposito==="otro"&&<div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8,marginTop:8}}>
          <input className="inp" value={data.alquiler_deposito_otro_monto||""} onChange={function(e){onChange("alquiler_deposito_otro_monto",e.target.value);}} placeholder="500" type="number"/>
          <select className="inp" value={data.alquiler_deposito_otro_moneda||"USD"} onChange={function(e){onChange("alquiler_deposito_otro_moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></select>
        </div>}
      </div>
      <Field label="Total depósito"><div className="val-box">{totalDeposito}</div></Field>

      <div className="col2"><div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Comisión inmobiliaria</div>
        <div style={{fontSize:12,color:"var(--dim)",marginBottom:4}}>El porcentaje se aplica al total del contrato, no al primer canon mensual.</div>
        <div style={{fontSize:12,color:"var(--dim)",marginBottom:9}}>Base estimada para la comisión: {baseComision>0?fmt$(baseComision,data.alquiler_moneda||"ARS"):"completá canon y plazo"}</div>
        <div className="grid2">
          <ComisionEditor data={data} onChange={onChange} prefix="alquiler_comision_locador" legacyKey="alquiler_comision_locador" label="Locador" base={baseComision} monedaBase={data.alquiler_moneda||"ARS"} defaultPct={data.alquiler_comision!==undefined && data.alquiler_comision!==null && String(data.alquiler_comision)!=="" ? data.alquiler_comision : "1"}/>
          <ComisionEditor data={data} onChange={onChange} prefix="alquiler_comision_locatario" legacyKey="alquiler_comision_locatario" label="Locatario" base={baseComision} monedaBase={data.alquiler_moneda||"ARS"} defaultPct={data.alquiler_comision!==undefined && data.alquiler_comision!==null && String(data.alquiler_comision)!=="" ? data.alquiler_comision : "1"}/>
        </div>
        <CompartidaBlock data={data} onChange={onChange} equipo={equipo}/>
      </div>

      <div className="col2">
        <label style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,border:"1px solid var(--border)",background:data.alquiler_amoblado?"rgba(212,168,83,0.08)":"transparent",cursor:"pointer",fontSize:12.5,color:"var(--text)",width:"fit-content"}}>
          <input type="checkbox" checked={!!data.alquiler_amoblado} onChange={function(e){onChange("alquiler_amoblado",e.target.checked);}}/>
          Se alquila amoblado
        </label>
        {data.alquiler_amoblado&&<Txa id="dw-field-alquiler_inventario" label="Inventario de bienes muebles" hint="Detallá los muebles y artefactos que se entregan (uno por línea). Se incorpora como anexo del contrato." value={data.alquiler_inventario||""} onChange={function(e){onChange("alquiler_inventario",e.target.value);}} rows={5} placeholder={"Ej:\nHeladera con freezer\nCocina 4 hornallas\nJuego de living (sofá 3 cuerpos + 2 sillones)\nMesa de comedor + 4 sillas\nCama matrimonial + colchón\n..."} style={{marginTop:8}}/>}
      </div>

      <div className="col2" style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:6,marginBottom:2}}>Mora, seguro y rescisión</div>
      <Inp id="dw-field-alquiler_interes_punitorio" label="Interés punitorio mensual (%)" value={data.alquiler_interes_punitorio||"5"} onChange={function(e){onChange("alquiler_interes_punitorio",e.target.value);}} placeholder="5" type="number" hint="Por mora en el pago del canon"/>
      <Inp id="dw-field-alquiler_penalidad_meses" label="Cláusula penal (meses de alquiler)" value={data.alquiler_penalidad_meses||"2"} onChange={function(e){onChange("alquiler_penalidad_meses",e.target.value);}} placeholder="2" type="number" hint="Por cada mes de demora en restituir"/>
      <Inp id="dw-field-alquiler_seguro_dias" label="Plazo para contratar seguro (días)" value={data.alquiler_seguro_dias||"10"} onChange={function(e){onChange("alquiler_seguro_dias",e.target.value);}} placeholder="10" type="number" hint="Seguro de RC e Incendio"/>
      <Inp id="dw-field-alquiler_aviso_meses" label="Preaviso de rescisión anticipada (meses)" value={data.alquiler_aviso_meses||"1"} onChange={function(e){onChange("alquiler_aviso_meses",e.target.value);}} placeholder="1" type="number"/>
    </div></div>
  );
}

function StepCondicionesReservaAlq({data,onChange,equipo,faltantes}){
  useEffect(function(){
    var m=data.res_alq_moneda||"ARS";
    if(data.res_alq_monto_mensual_moneda!==m) onChange("res_alq_monto_mensual_moneda",m);
  },[data.res_alq_moneda]);
  return(
    <div>
      <div className="notice notice-gold" style={{marginBottom:12}}>Reserva previa — los datos se trasladan al contrato definitivo.</div>
      <div className="grid2">
        <Inp id="dw-field-res_alq_monto_reserva" label="Monto de reserva" value={data.res_alq_monto_reserva||""} onChange={function(e){onChange("res_alq_monto_reserva",e.target.value);}} placeholder="50000" type="number" {...estiloCampoFaltante(faltantes,"res_alq_monto_reserva")}/>
        <Slt label="Moneda de la operación" value={data.res_alq_moneda||"ARS"} onChange={function(e){onChange("res_alq_moneda",e.target.value);onChange("res_alq_monto_mensual_moneda",e.target.value);}}><option value="ARS">ARS — Pesos argentinos</option><option value="USD">USD — Dólares estadounidenses</option></Slt>
        <Inp id="dw-field-res_alq_monto_mensual" label="Valor del alquiler mensual" value={data.res_alq_monto_mensual||""} onChange={function(e){onChange("res_alq_monto_mensual",e.target.value);}} placeholder="180000" type="number" {...estiloCampoFaltante(faltantes,"res_alq_monto_mensual")}/>
        <div className="col2"><div className="notice" style={{fontSize:12}}>La reserva y el alquiler mensual usan la misma moneda. Así la reserva queda vinculada a la moneda real del contrato.</div></div>
        <div className="col2"><div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Plazo estimado del contrato</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Inp id="dw-field-res_alq_plazo_cantidad" label="Cantidad" value={data.res_alq_plazo_cantidad||""} onChange={function(e){onChange("res_alq_plazo_cantidad",e.target.value);}} placeholder="24" type="number"/>
            <Slt id="dw-field-res_alq_plazo_unidad" label="Unidad" value={data.res_alq_plazo_unidad||"meses"} onChange={function(e){onChange("res_alq_plazo_unidad",e.target.value);}}><option value="semanas">Semanas</option><option value="meses">Meses</option><option value="años">Años</option></Slt>
          </div>
        </div>
        <Inp id="dw-field-res_alq_inicio_estimado" label="Inicio estimado" value={data.res_alq_inicio_estimado||""} onChange={function(e){onChange("res_alq_inicio_estimado",e.target.value);}} type="date" hint={data.res_alq_inicio_estimado?("Vencimiento estimado: "+fmtD(finReservaAlquilerISO(data))):undefined} {...estiloCampoFaltante(faltantes,"res_alq_inicio_estimado")}/>
        <Slt id="dw-field-res_alq_destino" label="Destino" value={data.res_alq_destino||"vivienda"} onChange={function(e){onChange("res_alq_destino",e.target.value);}}><option value="vivienda">Vivienda</option><option value="comercial">Comercial</option><option value="profesional">Profesional</option></Slt>
        <Slt id="dw-field-res_alq_vigencia_dias" label="Vigencia de la reserva" value={data.res_alq_vigencia_dias||"10"} onChange={function(e){onChange("res_alq_vigencia_dias",e.target.value);}} {...estiloCampoFaltante(faltantes,"res_alq_vigencia_dias")}>
          {["3","5","7","10","15","30"].map(function(d){return <option key={d} value={d}>{d} días</option>;})}
        </Slt>
        <div className="col2"><div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Comisión inmobiliaria</div>
          <div style={{fontSize:12,color:"var(--dim)",marginBottom:9}}>Cada parte puede tener porcentaje o monto fijo.</div>
          <div className="grid2">
            <ComisionEditor data={data} onChange={onChange} prefix="res_alq_comision_locador" legacyKey="res_alq_comision_locador" label="Locador" base={parseFloat(data.res_alq_monto_mensual)||0} monedaBase={data.res_alq_moneda||"ARS"} defaultPct={data.res_alq_comision!==undefined && data.res_alq_comision!==null && String(data.res_alq_comision)!=="" ? data.res_alq_comision : "1"}/>
            <ComisionEditor data={data} onChange={onChange} prefix="res_alq_comision_locatario" legacyKey="res_alq_comision_locatario" label="Locatario" base={parseFloat(data.res_alq_monto_mensual)||0} monedaBase={data.res_alq_moneda||"ARS"} defaultPct={data.res_alq_comision!==undefined && data.res_alq_comision!==null && String(data.res_alq_comision)!=="" ? data.res_alq_comision : "1"}/>
          </div>
          <CompartidaBlock data={data} onChange={onChange} equipo={equipo}/>
        </div>
      </div>
    </div>
  );
}

function StepDocSimple({data,onChange}){
  var tipo=data.tipo;
  return(
    <div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Datos específicos del documento.</p>
      <div className="grid2">
        <Inp id="dw-field-inmueble_direccion" label="Dirección del inmueble" value={data.inmueble_direccion||""} onChange={function(e){onChange("inmueble_direccion",e.target.value);}} placeholder="Av. Corrientes 1234, CABA" className="col2"/>
        <Inp id="dw-field-inmueble_unidad_funcional" label="Unidad funcional / Lote (opcional)" value={data.inmueble_unidad_funcional||""} onChange={function(e){onChange("inmueble_unidad_funcional",e.target.value);}} placeholder="Ej: UF 3 — Lote 12" className="col2"/>
        <Inp id="dw-field-inmueble_partido" label="Partido / Municipio" value={data.inmueble_partido||""} onChange={function(e){onChange("inmueble_partido",e.target.value);}} placeholder="Buenos Aires"/>
        <Inp id="dw-field-inmueble_provincia" label="Provincia" value={data.inmueble_provincia||""} onChange={function(e){onChange("inmueble_provincia",e.target.value);}} placeholder="Buenos Aires"/>
        {tipo==="comodato"&&<>
          <Inp label="Inicio del comodato" type="date" value={data.comodato_inicio||""} onChange={function(e){onChange("comodato_inicio",e.target.value);onChange("comodato_plazo",plazoComodatoDesdeFechas(e.target.value,data.comodato_fin));}}/>
          <Inp id="dw-field-comodato_plazo" label="Vencimiento del comodato" type="date" min={data.comodato_inicio||undefined} value={data.comodato_fin||""} onChange={function(e){onChange("comodato_fin",e.target.value);onChange("comodato_plazo",plazoComodatoDesdeFechas(data.comodato_inicio,e.target.value));}}/>
          <div className="col2" style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:12,color:"var(--dim)"}}>Atajo desde el inicio:</span>
            {[6,12,24,36].map(function(n){return <button key={n} type="button" disabled={!data.comodato_inicio} onClick={function(){var ini=parseISOLocal(data.comodato_inicio); if(!ini) return; var fin=isoLocal(sumarMesesLocal(ini,n)); onChange("comodato_fin",fin); onChange("comodato_plazo",plazoComodatoDesdeFechas(data.comodato_inicio,fin));}} style={{padding:"5px 10px",borderRadius:8,border:"1px solid var(--border2)",background:"transparent",color:data.comodato_inicio?"var(--text)":"var(--dim)",fontSize:12,cursor:data.comodato_inicio?"pointer":"not-allowed"}}>{n} meses</button>;})}
            {data.comodato_plazo&&!data.comodato_fin&&<span style={{fontSize:12,color:"var(--muted)"}}>Plazo actual: {data.comodato_plazo}. Elegí fechas para reemplazarlo.</span>}
          </div>
          <Txa id="dw-field-comodato_uso" label="Destino / Uso del bien" value={data.comodato_uso||""} onChange={function(e){onChange("comodato_uso",e.target.value);}} placeholder="Uso habitacional exclusivo del comodatario..." rows={2} className="col2"/>
        </>}
        {tipo==="exclusividad"&&<>
          <Slt id="dw-field-exclusividad_tipo" label="Tipo de autorización" value={data.exclusividad_tipo||"con"} onChange={function(e){onChange("exclusividad_tipo",e.target.value);}} className="col2">
            <option value="con">Con exclusividad</option>
            <option value="sin">Sin exclusividad</option>
          </Slt>
          <Inp id="dw-field-precio" label="Precio de venta" value={data.precio||""} onChange={function(e){onChange("precio",e.target.value);}} placeholder="100000" type="number"/>
          <Slt id="dw-field-moneda" label="Moneda" value={data.moneda||"USD"} onChange={function(e){onChange("moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt>
          <Inp id="dw-field-exclusividad_vigencia" label="Vigencia de la autorización" value={data.exclusividad_vigencia||""} onChange={function(e){onChange("exclusividad_vigencia",e.target.value);}} placeholder="90 días" hint="Sugerido: 90 días. Podés cambiarlo." className="col2"/>
          <div className="col2"><ComisionEditor data={data} onChange={onChange} prefix="comision_vendedor" legacyKey="comision_vendedor" label="Comisión del vendedor" base={parseFloat(data.precio)||0} monedaBase={data.moneda||"USD"} defaultPct="3"/>
          <label style={{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:12.5,color:"var(--text)",cursor:"pointer"}}><input type="checkbox" checked={!!data.comision_vendedor_ocultar_doc} onChange={function(e){onChange("comision_vendedor_ocultar_doc",e.target.checked);}}/> No mostrar la comisión del vendedor en el documento</label>
        </div>
        </>}
        {tipo==="refuerzo_reserva"&&<>
          <Inp id="dw-field-precio" label="Monto del refuerzo" value={data.precio||""} onChange={function(e){onChange("precio",e.target.value);}} placeholder="10000" type="number"/>
          <Slt id="dw-field-moneda" label="Moneda" value={data.moneda||"USD"} onChange={function(e){onChange("moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt>
          <Inp id="dw-field-fecha_posesion" label="Fecha del refuerzo" value={data.fecha_posesion||""} onChange={function(e){onChange("fecha_posesion",e.target.value);}} type="date" className="col2"/>
          <Txa id="dw-field-refuerzo_trayectoria" label="Trayectoria de la operación" value={data.refuerzo_trayectoria||""} onChange={function(e){onChange("refuerzo_trayectoria",e.target.value);}} placeholder="Con fecha XX se firmó reserva por $XX..." rows={3} className="col2"/>
        </>}
        {tipo==="devolucion_reserva"&&<>
          <Inp id="dw-field-precio" label="Monto a devolver" value={data.precio||""} onChange={function(e){onChange("precio",e.target.value);}} placeholder="10000" type="number"/>
          <Slt id="dw-field-moneda" label="Moneda" value={data.moneda||"USD"} onChange={function(e){onChange("moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt>
          <Inp id="dw-field-fecha_posesion" label="Fecha de devolución" value={data.fecha_posesion||""} onChange={function(e){onChange("fecha_posesion",e.target.value);}} type="date" className="col2"/>
          <Txa id="dw-field-devolucion_motivo" label="Motivo de la devolución" value={data.devolucion_motivo||""} onChange={function(e){onChange("devolucion_motivo",e.target.value);}} placeholder="Por mutuo acuerdo..." rows={2} className="col2"/>
        </>}
      </div>
    </div>
  );
}

function StepGarantia({data,onChange}){
  var garantias=[
    {value:"propietario",    label:"Garantía propietaria",  desc:"Garante propietario de inmueble", icon:"🏘"},
    {value:"seguro_caucion", label:"Seguro de caución",     desc:"Póliza de seguro como garantía",  icon:"🛡"},
    {value:"aval_bancario",  label:"Aval bancario",         desc:"Garantía de entidad bancaria",    icon:"🏦"},
    {value:"recibo_sueldo",  label:"Recibo de sueldo",      desc:"Garantía mediante recibo haberes",icon:"📋"},
  ];
  return(
    <div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Tipo de garantía que presenta el locatario.</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {garantias.map(function(g){
          var sel=data.alquiler_garantia_tipo===g.value;
          return(
            <button key={g.value} onClick={function(){onChange("alquiler_garantia_tipo",g.value);}}
              style={{padding:"12px",borderRadius:10,border:"2px solid "+(sel?"var(--gold)":"var(--border2)"),background:sel?"rgba(212,168,83,0.08)":"var(--card)",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left",outline:"none"}}>
              <span style={{fontSize:20}}>{g.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{g.label}</div><div style={{fontSize:12,color:"var(--muted)"}}>{g.desc}</div></div>
              <div style={{width:18,height:18,borderRadius:"50%",border:"2px solid "+(sel?"var(--gold)":"var(--border2)"),background:sel?"var(--gold)":"transparent",flexShrink:0}}/>
            </button>
          );
        })}
      </div>
      {data.alquiler_garantia_tipo==="propietario"&&(
        <div className="grid2" style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
          <Inp id="dw-field-alquiler_garantia_titular" label="Nombre del garante" value={data.alquiler_garantia_titular||""} onChange={function(e){onChange("alquiler_garantia_titular",e.target.value);}} placeholder="Roberto Gómez" className="col2"/>
          <IdentificacionField value={data.alquiler_garantia_dni||""} onChange={function(e){onChange("alquiler_garantia_dni",e.target.value);}} placeholder="20-98765432-1" labelSuffix=" del garante"/>
          <Inp id="dw-field-alquiler_garantia_inmueble" label="Inmueble en garantía" value={data.alquiler_garantia_inmueble||""} onChange={function(e){onChange("alquiler_garantia_inmueble",e.target.value);}} placeholder="Mitre 456, Quilmes"/>
        </div>
      )}
      {(data.alquiler_garantia_tipo==="seguro_caucion"||data.alquiler_garantia_tipo==="aval_bancario"||data.alquiler_garantia_tipo==="recibo_sueldo")&&(
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
          <Inp id="dw-field-alquiler_garantia_titular" label="Titular / Entidad" value={data.alquiler_garantia_titular||""} onChange={function(e){onChange("alquiler_garantia_titular",e.target.value);}} placeholder="Nombre o entidad"/>
        </div>
      )}
      <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
        <Txa id="dw-field-alquiler_garantia_texto_personalizado" label="Texto de la cláusula de garantía (opcional)" value={data.alquiler_garantia_texto_personalizado||""} onChange={function(e){onChange("alquiler_garantia_texto_personalizado",e.target.value);}} placeholder="Pegá acá el texto que te envía la aseguradora / entidad de garantía (ej. Garantías Confiar, Fianzas y Créditos, etc.)..." rows={4}/>
        <div style={{fontSize:12,color:"var(--dim)",marginTop:4}}>Si lo completás, reemplaza el texto automático de la cláusula de Garantía en el contrato.</div>
      </div>
    </div>
  );
}

function OpcionalesCuerpo({data,onChange}){
  var items=[];
  // El refuerzo de reserva se configura en Económico, no entre cláusulas opcionales.
  if(data.tipo==="alquiler") items.push({campo:"alquiler_incluye_seguro",label:"Incluir cláusula de seguro",desc:"Cláusula de seguro del inmueble. Destildalo si no corresponde.",def:true});
  if(!items.length) return null;
  return <div style={{marginBottom:14,padding:"10px 12px",borderRadius:10,border:"1px solid var(--border2)",background:"rgba(212,168,83,0.04)"}}>
    <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Condiciones adicionales</div>
    {items.map(function(it){ var v=typeof data[it.campo]==="boolean"?data[it.campo]:it.def; return <label key={it.campo} style={{display:"flex",alignItems:"flex-start",fontSize:12.5,color:"var(--text)",cursor:"pointer",gap:2}}>
      <input type="checkbox" checked={v} onChange={function(e){onChange(it.campo,e.target.checked);}}/>
      <span><b>{it.label}</b><br/><span style={{color:"var(--muted)",fontSize:12}}>{it.desc}</span></span>
    </label>; })}
  </div>;
}
function StepClausulas({data,onChange,clausulas,esAlquiler,perfil}){
  var selected=data.clausulas_ids||[];
  var cfgOpcionales=obtenerPlantillaConfig(perfil,data.tipo,clausulas);
  var idsOpcionales=Array.isArray(cfgOpcionales.clausulas_ids)?cfgOpcionales.clausulas_ids:[];
  var idsObligatorias=Array.isArray(cfgOpcionales.obligatorias_ids)?cfgOpcionales.obligatorias_ids:[];
  // El catálogo que ve el broker contiene solo extras habilitados; los del modelo no se exponen.
  var idsFrecuentes=Array.isArray(cfgOpcionales.frecuentes_ids)?cfgOpcionales.frecuentes_ids:[];
  var lista=(clausulas||[]).filter(function(c){return c.id!=="c4" && !clausulaYaEnTextoBase(c) && !c.obligatoria && idsObligatorias.indexOf(c.id)===-1 && clausulaAplicaTipo(c,data.tipo) && (idsOpcionales.indexOf(c.id)!==-1 || idsFrecuentes.indexOf(c.id)!==-1);});
  lista.sort(function(a,b){return Number(idsFrecuentes.indexOf(b.id)!==-1)-Number(idsFrecuentes.indexOf(a.id)!==-1);});
  var protegidas=obtenerIdsObligatoriosDePlantilla(perfil,data.tipo);
  var nombreInmobiliariaObligatoria=(perfil&&perfil.nombre&&String(perfil.nombre).trim())?String(perfil.nombre).trim():"la inmobiliaria";
  function toggle(id){
    if(protegidas.indexOf(id)!==-1)return;
    var activando=!selected.includes(id);
    onChange("clausulas_ids",activando?selected.concat([id]):selected.filter(function(x){return x!==id;}));
    var cfg=configDetalleClausula((clausulas||[]).find(function(c){return c.id===id;}));
    if(activando&&cfg){onChange(cfg.campo+"_id",id);setClausulaExpandida(id);}
  }
  var [clausulaExpandida,setClausulaExpandida]=useState(null);
  var [showAdd,setShowAdd]=useState(!!(data.clausulas_custom||data.clausulas_custom_titulo));
  var [tituloCustom,setTituloCustom]=useState(data.clausulas_custom_titulo||"");
  var [contenidoCustom,setContenidoCustom]=useState(data.clausulas_custom||"");
  var [ideaIA,setIdeaIA]=useState("");
  var [loadingIA,setLoadingIA]=useState(false);
  var [errorIA,setErrorIA]=useState("");
  useEffect(function(){onChange("clausulas_custom_titulo",showAdd?tituloCustom:"");onChange("clausulas_custom",showAdd?contenidoCustom:"");},[tituloCustom,contenidoCustom,showAdd]);
  async function narrarConIA(){if(!ideaIA.trim()||loadingIA)return;setLoadingIA(true);setErrorIA("");try{var d=await narrarClausulaIA(ideaIA.trim());if(d){setTituloCustom(d.titulo||"");setContenidoCustom(d.contenido||"");setIdeaIA("");setShowAdd(true);}else setErrorIA("No pude interpretar la respuesta. Probá reformular la idea.");}catch(e){setErrorIA("Error al conectar con el asistente. Verificá tu conexión.");}setLoadingIA(false);}
  return <div>
    <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.55,marginBottom:14}}>Tu documento se completa automáticamente con los datos del formulario. Si esta operación necesita una condición adicional, podés elegirla acá.</p>
    <div style={{fontSize:12,fontWeight:750,color:"var(--text)",margin:"2px 0 8px"}}>Cláusulas adicionales</div>
    {lista.length===0&&<div className="notice" style={{fontSize:13,lineHeight:1.5,marginBottom:10}}>No hay cláusulas adicionales disponibles para este documento. Podés agregar una propia para esta operación o pedir al administrador que habilite más opciones.</div>}
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {lista.map(function(c){var obligatoria=!!c.obligatoria;var protegida=protegidas.indexOf(c.id)!==-1;var sel=obligatoria||protegida||selected.includes(c.id);var expandida=clausulaExpandida===c.id;var detalleCfg=configDetalleClausula(c);return <div key={c.id} className="op-card" style={{padding:"0 11px",borderColor:sel?"var(--gold)":"var(--border2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minHeight:43}}><button type="button" aria-expanded={expandida} onClick={function(){setClausulaExpandida(expandida?null:c.id);}} style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:7,padding:"10px 0",border:0,background:"transparent",color:"var(--text)",textAlign:"left",cursor:"pointer"}}><span style={{fontSize:12.5,fontWeight:650,overflowWrap:"anywhere"}}>{c.titulo}</span>{idsFrecuentes.indexOf(c.id)!==-1&&<span style={{fontSize:10,color:"var(--gold)",whiteSpace:"nowrap"}}>Frecuente</span>}{obligatoria&&<span className="badge badge-gold">Obligatoria</span>}{protegida&&!obligatoria&&<span className="badge badge-gold">Obligatoria</span>}<span style={{marginLeft:"auto",fontSize:11,color:"var(--dim)"}}>{expandida?"−":"＋"}</span></button><button type="button" aria-label={(sel?"Quitar ":"Agregar ")+c.titulo} disabled={obligatoria||protegida} onClick={function(){toggle(c.id);}} className={"dw-ios-sw"+(sel?" on":"")+((obligatoria||protegida)?" locked":"")} role="switch" aria-checked={sel} style={{flex:"0 0 auto"}}/></div>
        {expandida&&<div style={{fontSize:12,color:"var(--dim)",lineHeight:1.55,padding:"0 0 11px",whiteSpace:"pre-wrap"}}>{mostrarTokensDocWorks(c.contenido)}</div>}
        {sel&&detalleCfg&&<Txa id={"dw-field-"+detalleCfg.campo} label={detalleCfg.label} hint="Se incorpora al documento de esta operación. Completá el detalle acordado por las partes." value={data[detalleCfg.campo]||""} onChange={function(e){onChange(detalleCfg.campo,e.target.value);onChange(detalleCfg.campo+"_id",c.id);}} rows={4} placeholder={detalleCfg.placeholder}/>}
      </div>;})}
    </div>
    <div style={{marginTop:14,paddingTop:12,borderTop:"1px dashed var(--border2)"}}>
      <button type="button" onClick={function(){setShowAdd(function(v){return !v;});}} style={{width:"100%",padding:"11px 13px",borderRadius:10,border:"1px solid var(--border2)",background:"var(--card)",color:"var(--text)",cursor:"pointer",textAlign:"left",fontWeight:700}}>＋ Agregar cláusula</button>
      {showAdd&&<div style={{marginTop:9,padding:12,borderRadius:12,border:"1px solid var(--border2)",background:"rgba(212,168,83,.035)"}}>
        <Inp label="Título" value={tituloCustom} onChange={function(e){setTituloCustom(e.target.value);}} placeholder="Ej.: Prohibición de mascotas"/>
        <Txa label="Texto" value={contenidoCustom} onChange={function(e){setContenidoCustom(e.target.value);}} placeholder="Escribí la cláusula…" rows={4}/>
        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginTop:5}}><VozATextoButton onText={function(t){setContenidoCustom(function(v){return (v?v+" ":"")+t;});}}/><span style={{fontSize:12,color:"var(--dim)"}}>Dictado opcional</span><Btn s="sm" v="secondary" onClick={narrarConIA} disabled={!ideaIA.trim()||loadingIA}>{loadingIA?"Redactando…":"✦ IA"}</Btn></div>
        <input className="inp" value={ideaIA} onChange={function(e){setIdeaIA(e.target.value);}} placeholder="Idea para IA (opcional)" style={{marginTop:8}}/>
        {errorIA&&<div style={{fontSize:12,color:"var(--red)",marginTop:5}}>{errorIA}</div>}
        <div style={{fontSize:12,color:"var(--dim)",marginTop:8}}>Esta cláusula se guarda únicamente en esta operación; no modifica la biblioteca de la inmobiliaria.</div>
      </div>}
    </div>

  </div>;
}

function StepBar({current,tipo,pasosFaltantes,onGoTo}){
  const steps=getSteps(tipo);
  const barRef=useRef(null);
  // En pantallas angostas la barra se desplaza: dejamos siempre centrado el paso activo.
  useEffect(function(){
    try{
      var el=barRef.current; if(!el) return;
      var act=el.querySelector('[data-active="1"]'); if(!act) return;
      var r=act.getBoundingClientRect(), b=el.getBoundingClientRect();
      el.scrollLeft += (r.left-b.left)-((b.width-r.width)/2);
    }catch(e){ console.debug("DocWorks: no se pudo centrar el paso activo",e); }
  },[current,tipo]);
  return(
    <div className="steps" ref={barRef}>
      {steps.map(function(s,i){
        const done=current>s.id,active=current===s.id;
        const flagged=!!(pasosFaltantes&&pasosFaltantes[s.id]);
        return(
          <div key={s.id} className="step-item">
            <div className={"step-dot "+(flagged?"flag":done?"done":active?"active":"pending")}
              data-active={active?"1":undefined}
              aria-current={active?"step":undefined}
              role={onGoTo?"button":undefined}
              tabIndex={onGoTo?0:undefined}
              onClick={onGoTo?function(){onGoTo(s.id);}:undefined}
              onKeyDown={onGoTo?function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); onGoTo(s.id); } }:undefined}
              style={onGoTo?{cursor:"pointer"}:undefined}
              title={onGoTo?"Ir a "+s.l:undefined}>
              {flagged?"!":done?"✓":s.id} <span>{s.l}</span>
            </div>
            {i<steps.length-1&&<div className={"step-line "+(done?"done":"")}/>}
          </div>
        );
      })}
    </div>
  );
}

const TIPO_GRUPOS = {
  compra: {
    label:"🏡 Compra",
    desc:"Operaciones de compra y venta de inmuebles",
    tipos:[
      {value:"reserva",          label:"Reserva de Compra",    desc:"Reservar con seña ad referéndum",  icon:"🔒"},
      {value:"boleto",           label:"Boleto de Compraventa", desc:"Contrato privado de compraventa",  icon:"📄"},
    ]
  },
  alquiler: {
    label:"🏠 Alquiler",
    desc:"Locaciones habitacionales y comerciales",
    tipos:[
      {value:"reserva_alquiler", label:"Reserva de Alquiler",  desc:"Reserva previa al contrato",        icon:"🗝"},
      {value:"alquiler",         label:"Contrato de Alquiler", desc:"Locación habitacional o comercial",  icon:"📋"},
    ]
  },
  otros: {
    label:"📌 Otros documentos",
    desc:"Comodato, autorización de venta, refuerzo y devolución",
    tipos:[
      {value:"comodato",           label:"Comodato",              desc:"Préstamo de uso gratuito",          icon:"🤝"},
      {value:"exclusividad",       label:"Autorización de Venta", desc:"Con o sin exclusividad",            icon:"✍️"},
      {value:"refuerzo_reserva",   label:"Refuerzo de Reserva",   desc:"Complementa una reserva existente", icon:"📌"},
      {value:"devolucion_reserva", label:"Devolución de Reserva", desc:"Devolución del monto reservado",    icon:"↩"},
    ]
  },
};

function StepTipo({data,onChange,grupo,operaciones,onSelectReservaRefuerzo,onSelectReservaDevolucion}){
  // Only show the group that was selected in StepGrupo
  // TIPO_GRUPOS keys: compra, alquiler, otros
  var gruposToShow = Object.entries(TIPO_GRUPOS).filter(function(e){
    if(!grupo) return true;
    return e[0]===grupo;
  });
  // Reservas de compra abiertas que todavía no tienen datos cargados en el
  // refuerzo/devolución se ofrecen como atajo para no volver a tipear.
  var modoReservaVinculada = (data.tipo==="refuerzo_reserva" || data.tipo==="devolucion_reserva") && !data.parent_id && !data.comprador_nombre;
  var reservasSugeridas = modoReservaVinculada
    ? (operaciones||[]).filter(function(o){
        if(o.tipo!=="reserva" || o.estado==="cerrado") return false;
        if(data.tipo==="devolucion_reserva") return !(operaciones||[]).some(function(h){return h.parent_id===o.id && h.tipo==="devolucion_reserva";});
        return true;
      })
        .sort(function(a,b){return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();})
        .slice(0,6)
    : [];
  var colorMap={compra:"rgba(212,168,83,0.12)",alquiler:"rgba(45,212,191,0.1)",otros:"rgba(148,163,184,0.1)"};
  var borderMap={compra:"rgba(212,168,83,0.35)",alquiler:"rgba(45,212,191,0.3)",otros:"rgba(148,163,184,0.25)"};
  return(
    <div>
      <OpcionalesCuerpo data={data} onChange={onChange}/>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>Seleccioná el tipo de documento a generar.</p>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {gruposToShow.map(function(entry){
          var key=entry[0], g=entry[1];
          var col=colorMap[key]||"rgba(255,255,255,0.05)";
          var brd=borderMap[key]||"var(--border2)";
          return(
            <div key={key}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{g.label}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {g.tipos.map(function(t){
                  var sel=data.tipo===t.value;
                  return(
                    <button type="button" key={t.value} onClick={function(){onChange("tipo",t.value);}}
                      style={{padding:"14px 12px",borderRadius:12,textAlign:"left",cursor:"pointer",transition:"all 0.15s",
                        border:"2px solid "+(sel?brd:"var(--border2)"),
                        background:sel?col:"var(--card)",outline:"none"}}>
                      <div style={{fontSize:22,marginBottom:6}}>{t.icon}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:3}}>{t.label}</div>
                      <div style={{fontSize:12,color:"var(--muted)"}}>{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {reservasSugeridas.length>0&&(
        <div style={{marginTop:18,paddingTop:16,borderTop:"1px dashed var(--border2)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{data.tipo==="devolucion_reserva"?"Reservas en curso — seleccioná la que querés devolver":"Reservas abiertas recientes — seleccioná la reserva sobre la que querés hacer el refuerzo"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {reservasSugeridas.map(function(op){
              return(
                <button type="button" key={op.id} onClick={function(){data.tipo==="devolucion_reserva" ? (onSelectReservaDevolucion&&onSelectReservaDevolucion(op)) : (onSelectReservaRefuerzo&&onSelectReservaRefuerzo(op));}}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 12px",borderRadius:10,border:"1px solid var(--border2)",background:"var(--card)",cursor:"pointer",textAlign:"left",outline:"none"}}>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{op.comprador_nombre||"Comprador sin nombre"} ← {op.vendedor_nombre||"Vendedor sin nombre"}</div>
                    <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{op.inmueble_direccion||"Sin dirección"}{op.precio?" · "+fmt$(op.precio,op.moneda):""}</div>
                  </div>
                  <span style={{fontSize:12,color:"var(--dim)",whiteSpace:"nowrap"}}>{new Date(op.created_at).toLocaleDateString("es-AR")}</span>
                </button>
              );
            })}
          </div>
          <div style={{fontSize:12,color:"var(--dim)",marginTop:6}}>{data.tipo==="devolucion_reserva"?"Si no aparece la reserva, podés seleccionarla más adelante y completar los datos manualmente.":"Si el refuerzo no corresponde a ninguna reserva cargada, seguí normalmente y completá los datos manualmente en el paso siguiente."}</div>
        </div>
      )}
    </div>
  );
}
function StepGrupo({onSelect}){
  return(
    <div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:20}}>¿Qué tipo de operación querés gestionar?</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {Object.entries(TIPO_GRUPOS).map(function([key,g]){
          var colors={compra:"rgba(212,168,83,0.08)",alquiler:"rgba(45,212,191,0.07)",otros:"rgba(148,163,184,0.07)"};
          var borders={compra:"rgba(212,168,83,0.3)",alquiler:"rgba(45,212,191,0.25)",otros:"rgba(148,163,184,0.2)"};
          return(
            <button type="button" key={key} className="grupo-card" onClick={function(){onSelect(key);}}
              style={{padding:"20px 16px",borderRadius:14,textAlign:"left",cursor:"pointer",
                border:"2px solid "+borders[key],background:colors[key],outline:"none",
                transition:"all 0.15s",display:"flex",flexDirection:"column",gap:6,
                gridColumn:key==="otros"?"span 2":"span 1"}}>
              <div style={{fontSize:28}}>{g.label.split(" ")[0]}</div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{g.label.slice(2)}</div>
              <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.4}}>{g.label==="📌 Otros"?g.tipos.map(function(t){return t.label;}).join(" · "):g.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── RESUMEN DE OPERACIÓN (panel previo a leer el documento) ─────────────────
function getResumenPartes(op){
  var prefixes=(op.tipo==="alquiler"||op.tipo==="reserva_alquiler")?["locador","locatario"]:["vendedor","comprador"];
  var roles=rolesPorTipo(op.tipo);
  return prefixes.map(function(prefix,i){return {label:roles[i]||roles[0],nombre:op[prefix+"_nombre"]||"",dni:op[prefix+"_dni"]||""};});
}
function getResumenMonto(op){
  if(op.tipo==="alquiler"||op.tipo==="reserva_alquiler"){
    var monto = op.alquiler_monto_inicial||op.res_alq_monto_mensual;
    var moneda = op.alquiler_moneda||op.res_alq_moneda||op.res_alq_monto_mensual_moneda||"ARS";
    return monto ? fmt$(monto,moneda)+"/mes" : null;
  }
  if(op.precio) return fmt$(op.precio, op.moneda);
  return null;
}

function getProximoPasoOperacion(op, operaciones){
  var hijos=(operaciones||[]).filter(function(x){return x.parent_id===op.id;});
  if(op.estado==="cerrado") return {icon:"✓",texto:"Operación cerrada",tone:"var(--green)"};
  if(op.tipo==="devolucion_reserva") return {icon:"✓",texto:"Devolución finalizada",tone:"var(--green)"};
  if(op.tipo==="reserva") {
    var venc=op.reserva_aceptacion_vencimiento;
    if(op.proceso_estado==="rechazada") return {icon:"↩",texto:"Preparar devolución de la reserva",tone:"var(--red)"};
    if(op.proceso_estado==="en_negociacion") return {icon:"↔",texto:"Continuar negociación",tone:"var(--gold)"};
    if(op.proceso_estado==="aceptada") {
      var tieneBoleto=hijos.some(function(x){return x.tipo==="boleto";});
      var tieneRefuerzo=hijos.some(function(x){return x.tipo==="refuerzo_reserva";});
      return {icon:"→",texto:tieneBoleto?"Completar documentación":tieneRefuerzo?"Continuar con Boleto":"Elegir Refuerzo o Boleto",tone:"var(--teal)"};
    }
    if(venc){
      var dias=Math.ceil((new Date(venc+"T23:59:59").getTime()-Date.now())/86400000);
      if(dias<0) return {icon:"⚠",texto:"Aceptar, negociar o preparar devolución",tone:"var(--red)"};
      if(dias===0) return {icon:"⚠",texto:"Vence hoy la aceptación",tone:"var(--red)"};
      return {icon:"⏳",texto:"Esperando aceptación · vence en "+dias+" día"+(dias===1?"":"s"),tone:"var(--gold)"};
    }
    return {icon:"⏳",texto:"Esperando aceptación",tone:"var(--gold)"};
  }
  if(op.tipo==="reserva_alquiler") {
    var tieneContrato=hijos.some(function(x){return x.tipo==="alquiler";});
    return tieneContrato ? {icon:"✓",texto:"Completar contrato de locación",tone:"var(--teal)"} : {icon:"→",texto:"Continuar con contrato de locación",tone:"var(--teal)"};
  }
  var falt=getCamposFaltantes(op);
  if(falt.length) return {icon:"⚠",texto:"Completar "+falt.length+" dato"+(falt.length===1?"":"s")+" clave",tone:"var(--gold)"};
  if(op.proceso_estado==="en_negociacion") return {icon:"↔",texto:"Continuar negociación",tone:"var(--gold)"};
  return {icon:"→",texto:"Continuar documentación / cierre",tone:"var(--teal)"};
}
function PasoResumenFinal({data,clausulas,onVolver,onFinalizarAccion}){
  var partes=getResumenPartes(data);
  var monto=getResumenMonto(data);
  var faltantes=getCamposFaltantesDetalle(data);
  var clausulasSel=(data.clausulas_ids||[]).map(function(id){return clausulas.find(function(c){return c.id===id;});}).filter(Boolean);
  var [showMenu,setShowMenu]=useState(false);
  var [menuPaso,setMenuPaso]=useState("estado");
  var [estadoFinal,setEstadoFinal]=useState(data.estado&&ESTADOS[data.estado]?data.estado:"activo");
  function Fila(props){return <div style={{display:"flex",justifyContent:"space-between",gap:10,padding:"6px 0",borderBottom:"1px solid var(--border2)",fontSize:12.5}}><span style={{color:"var(--dim)"}}>{props.k}</span><span style={{color:"var(--text)",fontWeight:500,textAlign:"right"}}>{props.v||"—"}</span></div>;}
  function Tarjeta(props){return <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:12,padding:"12px 14px",marginBottom:10}}><div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{props.t}</div>{props.children}</div>;}
  function abrirMenu(){setEstadoFinal(data.estado&&ESTADOS[data.estado]?data.estado:"activo");setMenuPaso("estado");setShowMenu(true);}
  var estados=[
    {id:"borrador",icon:"✎",label:"Borrador",desc:"Queda guardado para seguir editándolo.",tone:"var(--gold)"},
    {id:"activo",icon:"●",label:"Activo",desc:"La operación queda en curso y visible entre las activas.",tone:"var(--green)"},
    {id:"cerrado",icon:"✓",label:"Cerrado",desc:"La operación queda finalizada y pasa al historial.",tone:"var(--muted)"},
  ];
  return(
    <div>
      <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:3}}>Resumen — revisá antes de emitir</div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Ficha técnica de todo lo cargado. Revisá nombres, DNI, montos y fechas para evitar errores tipográficos en el documento definitivo.</p>
      {faltantes.length>0&&(
        <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",marginBottom:12,fontSize:12.5,color:"var(--red)"}}>
          <span>⚠</span>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:750,marginBottom:5}}>Faltan datos por completar:</div><ul style={{listStyle:"none",padding:0,margin:"0 0 5px"}}>{faltantes.map(function(f){return <li key={f.campo} style={{margin:"3px 0"}}><button type="button" onClick={function(){onVolver(f.campo);}} style={{background:"none",border:0,padding:0,color:"inherit",textDecoration:"underline",cursor:"pointer",font:"inherit",textAlign:"left"}}>• {f.label}</button></li>;})}</ul><div style={{fontSize:12,color:"var(--muted)"}}>Podés completarlos más tarde.</div></div>
        </div>
      )}
      <Tarjeta t="Partes">
        {partes.map(function(p,i){return <Fila key={i} k={p.label} v={(p.nombre||"—")+(p.dni?" · DNI "+p.dni:"")}/>;})}
      </Tarjeta>
      <Tarjeta t="Inmueble">
        <Fila k="Tipo" v={tipoInmuebleLabel(data.inmueble_tipo,data.inmueble_tipo_otro)}/>
        <Fila k="Dirección" v={data.inmueble_direccion}/>
        {data.inmueble_unidad_funcional&&<Fila k="Unidad funcional / Lote" v={data.inmueble_unidad_funcional}/>}
        <Fila k="Partido / Provincia" v={[data.inmueble_partido,data.inmueble_provincia].filter(Boolean).join(" — ")}/>
      </Tarjeta>
      <Tarjeta t="Condiciones económicas">
        <Fila k="Monto" v={monto}/>
        {data.tipo!=="reserva"&&data.fecha_posesion&&<Fila k="Fecha de posesión" v={fmtD(data.fecha_posesion)}/>}
        {(data.tipo==="alquiler")&&<Fila k="Inicio / Fin" v={[fmtD(data.alquiler_inicio),fmtD(finAlquilerISO(data))].filter(Boolean).join(" → ")}/>}
        {(data.tipo==="reserva"||data.tipo==="boleto"||data.tipo==="exclusividad")&&<Fila k="Comisión" v={[data.comision_vendedor?resumenComision(data,"comision_vendedor",data.tipo==="exclusividad"?"Autorizante":"Vendedor","Precio total",parseFloat(data.precio||0),data.moneda||"USD","comision_vendedor","3"):null,data.comision_comprador?resumenComision(data,"comision_comprador","Comprador","Precio total",parseFloat(data.precio||0),data.moneda||"USD","comision_comprador",""):null].filter(Boolean).join(" · ")}/>}
        {(data.tipo==="alquiler"||data.tipo==="reserva_alquiler")&&<Fila k="Comisión" v={getComisionComponents(data).map(function(c){return resumenComision(data,c.prefix,c.rol,c.prefix.indexOf("res_alq_")===0?"canon mensual":"total del contrato",c.base,c.baseMoneda,c.prefix,(c.prefix.indexOf("res_alq_")===0?data.res_alq_comision:data.alquiler_comision)||"1");}).join(" · ")}/>}
      </Tarjeta>
      <Tarjeta t={"Cláusulas ("+(clausulasSel.length+(data.clausulas_custom?1:0))+")"}>
        {clausulasSel.length===0&&!data.clausulas_custom&&<div style={{fontSize:12,color:"var(--dim)"}}>Sin cláusulas seleccionadas.</div>}
        {clausulasSel.map(function(c){return <Fila key={c.id} k={c.titulo} v="✓"/>;})}
        {data.clausulas_custom&&<Fila k={data.clausulas_custom_titulo||"Cláusula adicional"} v="✓"/>}
      </Tarjeta>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:16,borderTop:"1px solid var(--border)",marginTop:6}}>
        <Btn v="ghost" onClick={onVolver}>← Volver a editar</Btn>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {faltantes.length>0&&<Btn v="danger" onClick={function(){var f=faltantes[0];onVolver(f.campo);}}>Revisar faltantes ({faltantes.length})</Btn>}
          <Btn v="success" onClick={abrirMenu}>Finalizar ✓</Btn>
        </div>
      </div>
      <Modal open={showMenu} onClose={function(){setShowMenu(false);}} title={menuPaso==="estado"?"¿Cómo querés dejar la operación?":"Documento listo para guardar"}>
        {menuPaso==="estado" ? <div>
          <div style={{fontSize:12.5,color:"var(--muted)",lineHeight:1.5,marginBottom:12}}>Elegí el estado definitivo. Esto se guarda junto con el documento.</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:9}}>
            {estados.map(function(e){var sel=estadoFinal===e.id;return <button type="button" key={e.id} onClick={function(){setEstadoFinal(e.id);setMenuPaso("acciones");}} style={{padding:"14px 12px",borderRadius:12,border:"1px solid "+(sel?e.tone:"var(--border2)"),background:sel?"rgba(212,168,83,.07)":"var(--card)",cursor:"pointer",textAlign:"left",minHeight:118}}>
              <div style={{fontSize:18,color:e.tone,fontWeight:800,marginBottom:7}}>{e.icon}</div><div style={{fontSize:13,fontWeight:800,color:"var(--text)",marginBottom:4}}>{e.label}</div><div style={{fontSize:12,color:"var(--dim)",lineHeight:1.4}}>{e.desc}</div>
            </button>;})}
          </div>
        </div> : <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(212,168,83,.06)",border:"1px solid rgba(212,168,83,.20)",marginBottom:12}}>
            <div><div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em"}}>Estado elegido</div><div style={{fontSize:14,fontWeight:800,color:"var(--text)",marginTop:2}}>{ESTADOS[estadoFinal]}</div></div>
            <button type="button" onClick={function(){setMenuPaso("estado");}} style={{border:"none",background:"transparent",color:"var(--gold)",cursor:"pointer",fontSize:12,fontWeight:700}}>Cambiar</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <Btn onClick={function(){setShowMenu(false);onFinalizarAccion("pdf",estadoFinal);}} className="w-full">📄 Guardar y abrir PDF / Word</Btn>
            <Btn v="secondary" onClick={function(){setShowMenu(false);onFinalizarAccion("whatsapp",estadoFinal);}} className="w-full">💬 Guardar y enviar por WhatsApp</Btn>
            <Btn v="secondary" onClick={function(){setShowMenu(false);onFinalizarAccion("guardar",estadoFinal);}} className="w-full">💾 Guardar y terminar</Btn>
          </div>
          <div style={{fontSize:12,color:"var(--dim)",marginTop:10,lineHeight:1.5}}>La elección Borrador / Activo / Cerrado queda registrada en la operación. El contenido del documento no se modifica.</div>
        </div>}
      </Modal>
    </div>
  );
}
function FichaOperacionPanel({op,operaciones,onClose,embedded}){
  var esAlq=op.tipo==="alquiler"||op.tipo==="reserva_alquiler";
  var roles=esAlq?[
    {prefix:"locatario",label:"Inquilino"},{prefix:"locador",label:"Autorizante"}
  ]:[
    {prefix:"comprador",label:"Comprador"},{prefix:"vendedor",label:"Vendedor"}
  ];
  var historial=Array.isArray(op.negociacion_historial)?op.negociacion_historial:[];
  var hijos=(operaciones||[]).filter(function(x){return x.parent_id===op.id;}).sort(function(a,b){return new Date(a.created_at).getTime()-new Date(b.created_at).getTime();});
  var docs=[op].concat(hijos);
  var timeline=getLineaDeTiempo(op,operaciones||[]);
  var proximo=getProximoPasoOperacion(op,operaciones||[]);
  var venc=op.reserva_aceptacion_vencimiento;
  var [tab,setTab]=useState("resumen");
  var tabs=[
    ["resumen","Resumen"],["personas","Personas"],
    ["negociacion","Negociación"],["documentos","Documentos"],["agenda","Agenda"]
  ];
  function PersonaGrupo({prefix,label}){
    var people=personasDe(op,prefix);
    if(!people.length) return <div className="card" style={{padding:14,color:"var(--dim)",fontSize:12}}><b style={{color:"var(--text)"}}>{label}</b><div style={{marginTop:6}}>Sin datos cargados.</div></div>;
    return <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {people.map(function(persona,i){
        return <div key={i} style={{padding:"12px 14px",borderRadius:12,border:"1px solid var(--border)",background:"rgba(255,255,255,.018)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.18)",color:"var(--gold)",fontWeight:800}}>{(persona.nombre||"?").trim().charAt(0).toUpperCase()}</div>
            <div><div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{label}{i>0?" · Co-titular "+i:""}</div><div style={{fontSize:13.5,fontWeight:700,color:"var(--text)",marginTop:2}}>{persona.nombre||"Sin informar"}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,fontSize:12}}>
            {persona.dni&&<div><div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase"}}>DNI / CUIT</div><div style={{marginTop:2,color:"var(--text)"}}>{persona.dni}</div></div>}
            {persona.domicilio&&<div><div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase"}}>Domicilio</div><div style={{marginTop:2,color:"var(--text)"}}>{persona.domicilio}</div></div>}
            {persona.telefono&&<div><div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase"}}>Teléfono interno</div><div style={{marginTop:2,color:"var(--text)"}}>{persona.telefono}</div></div>}
            {persona.email&&<div><div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase"}}>Correo electrónico interno</div><div style={{marginTop:2,color:"var(--text)",wordBreak:"break-word"}}>{persona.email}</div></div>}
          </div>
        </div>;
      })}
    </div>;
  }
  return <div className="doc-ficha-panel" style={{display:"flex",flexDirection:"column",gap:12,minHeight:0,height:"100%",overflow:"hidden"}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flex: "0 0 auto"}}>
      <div><div style={{fontSize:18,fontFamily:"DM Serif Display,serif",color:"var(--text)"}}>Ficha de la operación</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>Centro de seguimiento. Teléfonos y emails son internos y no se imprimen en el contrato.</div></div>
      {!embedded && onClose&&<Btn v="ghost" s="sm" onClick={onClose}>Cerrar</Btn>}
    </div>
    <div style={{display:"flex",gap:4,overflowX:"auto",borderBottom:"1px solid var(--border)"}}>{tabs.map(function(t){return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{padding:"8px 12px",border:"none",borderBottom:tab===t[0]?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:tab===t[0]?"var(--gold)":"var(--dim)",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t[1]}</button>;})}</div>
    {tab==="resumen"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div className="card" style={{padding:14,border:"1px solid rgba(212,168,83,.22)",background:"linear-gradient(135deg,rgba(212,168,83,.05),transparent)"}}>
        <div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Próximo paso</div>
        <div style={{display:"flex",alignItems:"center",gap:9,marginTop:7}}><span style={{fontSize:18,color:proximo.tone}}>{proximo.icon}</span><div style={{fontSize:13.5,fontWeight:700,color:"var(--text)"}}>{proximo.texto}</div></div>
      </div>
      <div className="grid2">
        <div className="card" style={{padding:14}}><div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Operación</div><div style={{fontSize:12,lineHeight:1.8,color:"var(--text)"}}><div><span style={{color:"var(--dim)"}}>Documento:</span> <b>{TIPOS[op.tipo]||op.tipo}</b></div><div><span style={{color:"var(--dim)"}}>Estado:</span> <b>{ESTADOS[op.estado]||op.estado}</b></div><div><span style={{color:"var(--dim)"}}>Proceso:</span> <b style={{color:"var(--gold)"}}>{String(op.proceso_estado||"pendiente_aceptacion").replace(/_/g," ")}</b></div><div><span style={{color:"var(--dim)"}}>Monto:</span> <b>{getResumenMonto(op)||"—"}</b></div></div></div>
        <div className="card" style={{padding:14}}><div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Inmueble</div><div style={{fontSize:12,lineHeight:1.7,color:"var(--text)"}}>{tipoInmuebleLabel(op.inmueble_tipo,op.inmueble_tipo_otro)}<div style={{marginTop:4}}>{op.inmueble_direccion||"Sin dirección"}</div><div style={{color:"var(--dim)",marginTop:2}}>{[op.inmueble_partido,op.inmueble_provincia].filter(Boolean).join(" — ")}</div></div></div>
      </div>
      {venc&&<div className="card" style={{padding:14}}><div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Vencimiento de aceptación</div><div style={{marginTop:5,fontSize:14,fontWeight:800,color:proximo.tone}}>{fmtD(venc)}</div></div>}
    </div>}
    {tab==="personas"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>{roles.map(function(r){return <PersonaGrupo key={r.prefix} prefix={r.prefix} label={r.label}/>;})}<div style={{fontSize:12,color:"var(--dim)",padding:"3px 2px"}}>🔒 Los teléfonos y emails de esta ficha son internos y no forman parte del documento contractual.</div></div>}
    {tab==="negociacion"&&<div>{historial.length?historial.slice().reverse().map(function(h,i){return <div key={h.id||i} style={{display:"grid",gridTemplateColumns:"86px 1fr auto",gap:8,alignItems:"center",padding:"9px 8px",borderBottom:"1px solid var(--border)",fontSize:12}}><span style={{color:"var(--dim)"}}>{fmtD(h.fecha)}</span><span style={{color:"var(--text)"}}><b>{h.parte==="vendedor"?"Vendedor":"Comprador"}</b>{h.observacion?" · "+h.observacion:""}{h.vencimiento&&<div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>Vence {fmtD(h.vencimiento)}</div>}</span><span style={{color:"var(--gold)",fontWeight:800,whiteSpace:"nowrap"}}>{fmt$(h.monto,h.moneda||"USD")}</span></div>;}):<div className="card" style={{padding:20,textAlign:"center",color:"var(--dim)",fontSize:12}}>Todavía no hay movimientos registrados.</div>}</div>}
    {tab==="documentos"&&<div style={{display:"flex",flexDirection:"column",gap:7}}>{docs.map(function(d){return <div key={d.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 12px",border:"1px solid var(--border)",borderRadius:10}}><div><div style={{fontSize:12.5,fontWeight:700,color:"var(--text)"}}>{TIPO_ICON[d.tipo]||TIPO_ICON_DEFAULT} {TIPOS[d.tipo]||d.tipo}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>{d.id===op.id?"Operación principal":"Documento vinculado"}</div></div><span className={"badge "+(ESTADO_BADGE_CLS[d.estado]||"")}>{ESTADOS[d.estado]||d.estado}</span></div>;})}</div>}
    {tab==="agenda"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{timeline.length?timeline.map(function(e,i){var futura=new Date(e.fecha)>new Date();return <div key={i} style={{display:"flex",gap:9}}><div style={{width:9,height:9,borderRadius:"50%",marginTop:5,background:futura?"var(--gold)":"var(--green)",flexShrink:0}}/><div><div style={{fontSize:12,color:"var(--dim)"}}>{fmtD(e.fecha)}</div><div style={{fontSize:12.5,fontWeight:700,color:"var(--text)",marginTop:2}}>{e.icon} {e.titulo}</div>{e.detalle&&<div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{e.detalle}</div>}</div></div>;}):<div className="card" style={{padding:20,textAlign:"center",color:"var(--dim)",fontSize:12}}>Todavía no hay hitos cargados.</div>}</div>}
  </div>;
}
// Historial de acciones dentro del documento: justo debajo del "Próximo paso", con las últimas acciones a la vista.
function HistorialAccionesCard({op}){
  var hs=Array.isArray(op.historial_operacion)?op.historial_operacion.slice().reverse():[];
  var [todo,setTodo]=useState(false);
  var lista=todo?hs:hs.slice(0,3);
  return <div className="card op-clean-card" style={{padding:16,marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:10}}>
      <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Historial de acciones</div>
      {hs.length>3&&<button type="button" onClick={function(){setTodo(function(v){return !v;});}} style={{border:"none",background:"transparent",color:"var(--gold)",fontWeight:700,fontSize:12,cursor:"pointer"}}>{todo?"Ver menos":"Ver todo ("+hs.length+")"}</button>}
    </div>
    {hs.length===0?<div style={{fontSize:12.5,color:"var(--dim)"}}>Todavía no hay movimientos registrados.</div>:<div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:todo?260:"none",overflowY:todo?"auto":"visible"}}>
      {lista.map(function(h,i){return <div key={h.id||i} style={{display:"flex",flexDirection:"column",gap:2,padding:"8px 10px",border:"1px solid var(--border)",borderRadius:10}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}><span style={{fontSize:12.5,fontWeight:700,color:"var(--text)"}}>{h.accion||"Actualización"}</span><span style={{fontSize:11.5,color:"var(--dim)"}}>{h.ts?new Date(h.ts).toLocaleString("es-AR"):"—"}</span></div>
        <div style={{fontSize:12,color:"var(--muted)"}}>{h.actorNombre||"Usuario"}{h.actorRol?" · "+h.actorRol:""}</div>
        {h.detalle&&<div style={{fontSize:12,color:"var(--dim)",overflowWrap:"anywhere"}}>{h.detalle}</div>}
      </div>;})}
    </div>}
  </div>;
}
function DocSummaryPanel({op, perfil, tabsDocs, onLeer, operaciones, onToggleTarea, onUpdateOperation, onActionWorkflow, onRevisionIA, aiReview, onCopiarRevisionIA}){
  var partes = getResumenPartes(op);
  var monto = getResumenMonto(op);
  var faltantes = getCamposFaltantes(op);
  var completo = faltantes.length===0;
  var estadoBadgeCls={borrador:"badge-borrador",activo:"badge-activo",cerrado:"badge-cerrado"};
  return (
    <div className="doc-summary-panel">
      <div className="op-detail-hero">
        <div style={{minWidth:0}}>
          <div className="op-detail-title">{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]||op.tipo}</div>
          <div className="op-detail-meta">{op.inmueble_direccion||"Sin dirección cargada"}{op.inmueble_partido?[" · "+op.inmueble_partido," "+(op.inmueble_provincia||"")].join(""):""}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <span className={"badge "+(estadoBadgeCls[op.estado]||"badge-activo")}>{ESTADOS[op.estado]||op.estado}</span>
          <button type="button" className="dw-chip-btn dw-chip-ia" onClick={onRevisionIA} disabled={!!(aiReview&&aiReview.loading)} title="Revisar con IA: detecta datos faltantes, diferencias y contradicciones. No modifica el documento."><span aria-hidden="true">✦</span>{aiReview&&aiReview.loading?"Revisando…":"Revisar con IA"}</button>
        </div>
      </div>
      {(()=>{var pp=getProximoPasoOperacion(op,operaciones||[]);return <div className="card" style={{padding:"10px 12px",marginBottom:12,border:"1px solid rgba(212,168,83,.18)",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:15,color:pp.tone}}>{pp.icon}</span><div><div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Próximo paso</div><div style={{fontSize:12.5,color:"var(--text)",fontWeight:700,marginTop:2}}>{pp.texto}</div></div></div>;})()}
      <HistorialAccionesCard op={op}/>
      <div className="card op-clean-card" style={{padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Partes</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {partes.map(function(p,i){
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",gap:10,fontSize:13}}>
                <span style={{color:"var(--dim)"}}>{p.label}</span>
                <span style={{color:"var(--text)",fontWeight:600,textAlign:"right"}}>{p.nombre||"— sin completar —"}{p.dni?" · "+p.dni:""}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card op-clean-card" style={{padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Inmueble y monto</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,fontSize:13}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
            <span style={{color:"var(--dim)"}}>Dirección</span>
            <span style={{color:"var(--text)",fontWeight:600,textAlign:"right"}}>{op.inmueble_direccion||"— sin completar —"}</span>
          </div>
          {monto&&(
            <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
              <span style={{color:"var(--dim)"}}>Monto</span>
              <span style={{color:"var(--gold)",fontWeight:700,textAlign:"right"}}>{monto}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="card op-clean-card" style={{padding:16,marginBottom:12,border:"1px solid "+(completo?"rgba(74,222,128,0.25)":"rgba(239,68,68,0.45)")}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Estado de los datos</div>
        {completo
          ? <div style={{fontSize:13,color:"var(--green)",display:"flex",alignItems:"center",gap:7}}>✓ Todos los datos críticos están completos.</div>
          : (
            <div>
              <div style={{fontSize:12.5,color:"#ef4444",fontWeight:700,marginBottom:6}}>Faltan {faltantes.length} dato{faltantes.length===1?"":"s"} clave:</div>
              <ul style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:3}}>
                {faltantes.map(function(f,i){return <li key={i} style={{fontSize:12.5,color:"#ef4444",fontWeight:600}}>{f}</li>;})}
              </ul>
            </div>
          )
        }
      </div>
      {aiReview&&(aiReview.error||aiReview.text)&&<div className="card op-clean-card doc-ai-review-card" style={{padding:12,marginBottom:12,border:"1px solid rgba(212,168,83,.28)",borderRadius:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}>
          <div style={{fontSize:12.5,fontWeight:800,color:"var(--text)"}}>✦ Revisión con IA</div>
          {aiReview.text&&<button type="button" className="dw-chip-btn" onClick={onCopiarRevisionIA}>Copiar</button>}
        </div>
        {aiReview.error&&<div role="alert" style={{padding:"9px 11px",borderRadius:9,border:"1px solid rgba(248,113,113,.25)",background:"rgba(248,113,113,.07)",color:"var(--red)",fontSize:12,lineHeight:1.5}}>{aiReview.error}</div>}
        {aiReview.text&&<div style={{padding:"12px 13px",borderRadius:10,border:"1px solid var(--border2)",background:"var(--card)",color:"var(--text)",fontSize:12.5,lineHeight:1.65,whiteSpace:"pre-wrap",maxHeight:300,overflowY:"auto"}}>{aiReview.text}</div>}
      </div>}
    </div>
  );
}

// Arma la lista de pestañas disponibles para una operación: Resumen +
// documento principal y, cuando corresponde, los recibos de honorarios.
// Así las acciones principales quedan arriba y el Resumen no necesita botones inferiores. Se usa tanto en el header del modal
// (para dibujar los botones) como dentro de DocumentViewer (para resolver
// qué documento generar).
function getDocTabs(op){
  var tiposDoc=[op.tipo];
  var tieneRecibos=op.tipo==="boleto"||op.tipo==="alquiler";
  var TABS: any[]=tiposDoc.map(function(t){return {id:t,label:"Vista previa",icon:"👁",esRecibo:false};});
  if(op.tipo==="reserva") TABS.push({id:"negociacion",label:"Negociación",icon:"↔",esNegociacion:true});
  TABS.unshift({id:"tareas",label:"Centro de tareas",icon:"✓",esTareas:true});
  if(tieneRecibos){
    var rolP1=capRol(rolParte(op.tipo,0));
    var rolP2=capRol(rolParte(op.tipo,1));
    TABS.push({id:"recibo_p1",label:"Recibo "+rolP1,icon:"🧾",esRecibo:true,dest:"parte1"});
    TABS.push({id:"recibo_p2",label:"Recibo "+rolP2,icon:"🧾",esRecibo:true,dest:"parte2"});
  }
  var TAB_RESUMEN={id:"resumen",label:"Resumen",icon:"📋",esResumen:true};
  var TAB_FICHA={id:"ficha",label:"Ver ficha completa",icon:"👤",esFicha:true};
  var TABS_ALL: any[]=[TAB_RESUMEN,TAB_FICHA].concat(TABS);
  var TABS_BARRA: any[]=[TAB_RESUMEN,TAB_FICHA].concat(TABS);
  return {TABS:TABS,TAB_RESUMEN:TAB_RESUMEN,TAB_FICHA:TAB_FICHA,TABS_ALL:TABS_ALL,TABS_BARRA:TABS_BARRA};
}
// Fila de pestañas (Resumen + documento principal) para el header del modal.
function DocTabsBar({op,tab,onChange}){
  var TABS_BARRA=getDocTabs(op).TABS_BARRA;
  return(
    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
      {TABS_BARRA.map(function(t){
        var active=tab===t.id;
        var isResumen=t.esResumen;
        return(
          <button key={t.id} onClick={function(){onChange(t.id);}}
            style={{padding:"5px 11px",borderRadius:8,fontSize:12,fontFamily:"DM Sans,sans-serif",cursor:"pointer",whiteSpace:"nowrap",
              border:"1px solid "+(active?((isResumen||t.esFicha)?"rgba(96,165,250,0.5)":"var(--gold)"):((isResumen||t.esFicha)?"rgba(96,165,250,0.2)":"var(--border2)")),
              background:active?((isResumen||t.esFicha)?"rgba(96,165,250,0.12)":"rgba(212,168,83,0.1)"):((isResumen||t.esFicha)?"rgba(96,165,250,0.05)":"transparent"),
              color:active?((isResumen||t.esFicha)?"#60a5fa":"var(--gold)"):((isResumen||t.esFicha)?"rgba(96,165,250,0.7)":"var(--muted)"),
              fontWeight:active?600:400,
            }}>
            {t.icon} {t.label}
          </button>
        );
      })}
    </div>
  );
}

function DocumentHeaderActions({onEdit,onPDF,onDOCX,onShare}){
  const [downloadOpen,setDownloadOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(function(){
    if(!downloadOpen) return;
    function onDocClick(e){
      if(menuRef.current && !menuRef.current.contains(e.target)) setDownloadOpen(false);
    }
    function onKey(e){ if(e.key==="Escape") setDownloadOpen(false); }
    document.addEventListener("mousedown",onDocClick);
    document.addEventListener("touchstart",onDocClick);
    document.addEventListener("keydown",onKey);
    return function(){
      document.removeEventListener("mousedown",onDocClick);
      document.removeEventListener("touchstart",onDocClick);
      document.removeEventListener("keydown",onKey);
    };
  },[downloadOpen]);
  function choose(fn){ setDownloadOpen(false); fn&&fn(); }
  return (
    <div className="doc-header-actions">
      <Btn v="secondary" s="sm" className="doc-action doc-action-edit" onClick={onEdit} title="Editar operación"><DWIcon name="edit" size={14}/> <span>Editar</span></Btn>
      <Btn v="secondary" s="sm" className="doc-action doc-action-share" onClick={onShare} title="Compartir documento"><DWIcon name="share" size={14}/> <span>Compartir</span></Btn>
      <div className="doc-download-wrap" ref={menuRef}>
        <button type="button" className="doc-action doc-action-download" onClick={function(){setDownloadOpen(function(v){return !v;});}} aria-expanded={downloadOpen} aria-haspopup="menu" title="Descargar documento">
          <DWIcon name="download" size={14}/> <span>Descargar</span><span className="doc-download-chevron">⌄</span>
        </button>
        {downloadOpen&&<div className="doc-download-menu" role="menu">
          <button type="button" role="menuitem" className="doc-download-item" onClick={function(){choose(onPDF);}}><DWIcon name="file" size={15}/><span><b>PDF</b><small>Documento listo para enviar o imprimir</small></span></button>
          <button type="button" role="menuitem" className="doc-download-item" onClick={function(){choose(onDOCX);}}><DWIcon name="file" size={15}/><span><b>DOCX</b><small>Documento editable en Word</small></span></button>
        </div>}
      </div>
    </div>
  );
}

function ReservaCompactSummary({op,operaciones}){
  var faltantes=getCamposFaltantes(op);
  var completo=faltantes.length===0;
  var timeline=getLineaDeTiempo(op,operaciones||[]);
  return (
    <div className="reserva-compact-summary">
      <div className="reserva-status-strip">
        <div>
          <div className="reserva-status-label">Datos críticos</div>
          <div className={"reserva-status-value "+(completo?"ok":"pending")}>
            {completo ? "✓ Todos los datos están completos" : "⚠ Faltan "+faltantes.length+" dato"+(faltantes.length===1?"":"s")}
          </div>
        </div>
        <div className="reserva-status-next">
          <span>Estado</span>
          <b>{ESTADOS[op.estado]||op.estado}</b>
        </div>
      </div>
      {timeline.length>0 && (
        <div className="reserva-mini-timeline">
          {timeline.map(function(e,i){
            return <div key={i} className="reserva-mini-event">
              <span className="reserva-mini-dot"/>
              <div><div className="reserva-mini-date">{new Date(e.fecha).toLocaleDateString("es-AR")}</div><div className="reserva-mini-title">{e.icon} {e.titulo}</div></div>
            </div>;
          })}
        </div>
      )}
    </div>
  );
}

// En la vista previa, cada espacio en blanco (___) se marca en rojo para ver enseguida qué falta.
function campoDesdeTextoFaltante(texto,op){
  var t=String(texto||"").toLowerCase();
  var rol=(t.indexOf("comprador")>=0||t.indexOf("oferente")>=0)?"comprador":(t.indexOf("vendedor")>=0?"vendedor":(t.indexOf("locador")>=0?"locador":(t.indexOf("locatario")>=0?"locatario":(t.indexOf("comodatario")>=0?"comodatario":(t.indexOf("comodante")>=0?"comodante":"")))));
  var campo=t.indexOf("dni")>=0||t.indexOf("cuit")>=0?"dni":(t.indexOf("domicilio")>=0?"domicilio":(t.indexOf("teléfono")>=0||t.indexOf("telefono")>=0?"telefono":(t.indexOf("correo")>=0||t.indexOf("mail")>=0||t.indexOf("email")>=0?"email":(t.indexOf("nombre")>=0||t.indexOf("razón social")>=0?"nombre":""))));
  if(rol&&campo)return rol+"_"+campo;
  var checks: [RegExp,string][]=[[/direcci[oó]n del inmueble|inmueble sito|inmueble ubicado/,"inmueble_direccion"],[/precio|monto total|valor de venta/,"precio"],[/anticipo|seña/,"anticipo"],[/fecha de inicio|inicio del alquiler/,"alquiler_inicio"],[/alquiler mensual/,"alquiler_monto_inicial"],[/partido|municipio/,"inmueble_partido"],[/provincia/,"inmueble_provincia"]];
  for(var i=0;i<checks.length;i++)if(checks[i][0].test(t))return checks[i][1];
  if(campo&&rol)return rol+"_"+campo;
  return "";
}
function resaltarFaltantes(texto,onMissing){
  var t=String(texto||"");
  if(!/_{3,}/.test(t)) return t;
  return t.split(/(_{3,})/).map(function(parte,i){
    return /^_{3,}$/.test(parte) ? <span key={i} role={onMissing?"button":undefined} tabIndex={onMissing?0:undefined} onClick={onMissing?function(){onMissing();}:undefined} onKeyDown={onMissing?function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();onMissing();}}:undefined} title={onMissing?"Tocá para completar este dato":"Dato faltante"} style={{color:"#dc2626",background:"rgba(220,38,38,0.12)",borderRadius:3,padding:"0 2px",fontWeight:700,cursor:onMissing?"pointer":undefined,textDecoration:onMissing?"underline dotted":"none"}}>{parte}</span> : parte;
  });
}

// ── BOT DE IA ─────────────────────────────────────────────────────────────────
var BOTIA_SYSTEM = "Sos el asistente legal de DocWorks, especializado en documentación inmobiliaria argentina (CABA y provincia de Buenos Aires principalmente). Ayudás a redactar, revisar y corregir contratos de compraventa, reservas, alquileres, comodatos y autorizaciones de venta. Usás lenguaje jurídico formal argentino, con referencias al Código Civil y Comercial de la Nación y a la normativa vigente aplicable; no cites normas derogadas como vigentes. Respondés siempre en español rioplatense, de forma clara y concreta (evitá relleno). Cuando revises una operación o un documento (adjunto o pegado), organizá la respuesta en: 1) Datos faltantes o incompletos, 2) Inconsistencias (fechas, montos, nombres), 3) Cláusulas recomendadas que no están presentes, 4) Observaciones de redacción legal. Si no hay nada para observar en un punto, decilo brevemente y seguí.";

var BOTIA_CLAUSULA_SYSTEM = "Además, cuando el usuario te pida redactar o narrar una cláusula nueva, respondé EXCLUSIVAMENTE con un objeto JSON válido, sin texto antes ni después, sin backticks, con este formato exacto: {\"titulo\":\"...\",\"categoria\":\"general|posesion|pago|rescision|impuestos|alquiler\",\"contenido\":\"...\"}. El campo \"contenido\" debe ser el texto completo de la cláusula, redactado en tercera persona, estilo formal jurídico argentino, listo para insertarse en un contrato. El campo \"titulo\" debe ser corto (3 a 6 palabras). Elegí la categoría más adecuada de la lista dada.";

var CLAUSULA_IA_SYSTEM = "Sos un asistente legal experto en redacción de documentos inmobiliarios argentinos (Código Civil y Comercial de la Nación y normativa vigente aplicable; no cites normas derogadas como vigentes). El usuario te va a dar una idea breve de una cláusula que necesita para un contrato. Respondé EXCLUSIVAMENTE con un objeto JSON válido, sin texto antes ni después, sin backticks, con este formato exacto: {\"titulo\":\"...\",\"categoria\":\"general|posesion|pago|rescision|impuestos|alquiler\",\"contenido\":\"...\"}. El campo \"contenido\" debe ser el texto completo de la cláusula, redactado en tercera persona, estilo formal jurídico argentino, listo para insertarse en un contrato. El campo \"titulo\" debe ser corto (3 a 6 palabras). Elegí la categoría más adecuada de la lista dada.";

function parseClauseResponse(text){
  var raw=String(text||"").replace(/```json|```/g,"").trim();
  var obj=null, note="";
  try{ obj=JSON.parse(raw); }catch(e){
    var ini=raw.indexOf("{");
    var fin=raw.lastIndexOf("}");
    if(ini>=0&&fin>ini){
      try{
        obj=JSON.parse(raw.slice(ini,fin+1));
        note=(raw.slice(0,ini)+" "+raw.slice(fin+1)).replace(/^[\s—–-]+|[\s—–-]+$/g,"").trim();
      }catch(e2){ /* no es una respuesta estructurada */ }
    }
  }
  if(!obj||!obj.titulo||!obj.contenido) return null;
  var cats=["general","posesion","pago","rescision","impuestos","alquiler"];
  if(!cats.includes(obj.categoria)) obj.categoria="general";
  return {obj:obj,note:note};
}
function parseClauseJson(text){
  var parsed=parseClauseResponse(text);
  return parsed ? parsed.obj : null;
}

// Llama a Gemini para narrar una cláusula a partir de una idea breve del usuario.
// Devuelve {titulo, categoria, contenido} o null si no pudo interpretar la respuesta.
async function narrarClausulaIA(ideaBreve){
  var sb=await loadSupabaseJs();
  if(!sb) throw new Error("No se pudo conectar con Supabase.");
  var res=await sb.functions.invoke("ia-docworks",{
    body:{mode:"clause",messages:[{role:"user",content:ideaBreve}]}
  });
  if(res.error) throw new Error(traducirError(res.error.message||"No se pudo conectar con el asistente."));
  var data=res.data||{};
  if(data.error) throw new Error(traducirError(typeof data.error==="string"?data.error:(data.error&&data.error.message?data.error.message:JSON.stringify(data.error))));
  return parseClauseJson(data.text||"");
}

// Revisión final inteligente del documento: analiza lo que DocWorks está a
// punto de exportar y devuelve observaciones, sin modificar automáticamente
// ningún dato ni cláusula. Sirve como segunda revisión antes de PDF/Word.
async function revisarDocumentoIA(op, doc){
  var sb=await loadSupabaseJs();
  if(!sb) throw new Error("No se pudo conectar con Supabase.");
  var tipo=TIPOS[(op||{}).tipo] || (op||{}).tipo || "Documento inmobiliario";
  var texto="";
  try{ texto=docToPlainText(doc||{}); }catch(e){ texto="(No se pudo obtener el texto completo del documento.)"; }
  if(texto.length>26000) texto=texto.slice(0,26000)+"\n\n[Documento recortado por longitud para la revisión IA.]";
  var datos=[
    "TIPO: "+tipo,
    "COMPRADOR/OFERENTE: "+((op||{}).comprador_nombre||"—"),
    "VENDEDOR/AUTORIZANTE: "+((op||{}).vendedor_nombre||"—"),
    "LOCADOR: "+((op||{}).locador_nombre||"—"),
    "LOCATARIO: "+((op||{}).locatario_nombre||"—"),
    "DNI/CUIT RELEVANTES: "+[((op||{}).comprador_dni||""),((op||{}).comprador_cuit||""),((op||{}).vendedor_dni||""),((op||{}).vendedor_cuit||""),((op||{}).locador_dni||""),((op||{}).locador_cuit||""),((op||{}).locatario_dni||""),((op||{}).locatario_cuit||"")].filter(Boolean).join(" | ") ,
    "INMUEBLE: "+((op||{}).inmueble_direccion||"—"),
    "PRECIO/CANON: "+(((op||{}).precio||"")?String((op||{}).precio)+" "+((op||{}).moneda||""):(((op||{}).alquiler_monto_inicial||"")?String((op||{}).alquiler_monto_inicial)+" "+((op||{}).alquiler_moneda||""):"—")),
    "PLAZO ALQUILER: "+(((op||{}).alquiler_plazo_meses||"")?String((op||{}).alquiler_plazo_meses)+" meses":"—")
  ].join("\n");
  var prompt="Actuá como revisor final de documentación inmobiliaria argentina. Revisá el documento REAL que DocWorks está por exportar. NO modifiques, NO reescribas el contrato y NO inventes datos. Tu tarea es detectar errores o riesgos visibles en el contenido y devolver una revisión práctica para que el usuario decida qué corregir.\n\n"
    +"Ordená exactamente así:\n1) ✅ CORRECTO: hasta 3 puntos que estén bien y convenga conservar.\n2) ⚠️ REVISAR: datos faltantes, inconsistencias entre nombres/DNI/CUIT, fechas, monedas, montos, porcentajes, plazos, roles, referencias cruzadas o cláusulas contradictorias. Indicá concretamente qué dato aparece y qué debería verificarse.\n3) ✦ SUGERENCIAS: mejoras de redacción o cláusulas que podrían ser útiles según el caso, aclarando que son sugerencias.\n4) 🔴 BLOQUEADORES: únicamente errores que deberían corregirse antes de firmar/exportar. Si no hay, escribí ‘Ninguno detectado’.\n\n"
    +"No hagas rankings ni des un ‘puntaje’ al documento. No asumas hechos que no figuren en los datos. Cuando una cuestión requiera asesoramiento profesional, indicá que debe verificarse con el profesional interviniente. Respondé en español rioplatense, claro y concreto.\n\n"
    +datos+"\n\nDOCUMENTO A REVISAR:\n"+texto;
  var res=await sb.functions.invoke("ia-docworks",{
    body:{mode:"chat",messages:[{role:"user",content:prompt}]}
  });
  if(res.error) throw new Error(traducirError(res.error.message||"No se pudo conectar con el asistente."));
  var data=res.data||{};
  if(data.error) throw new Error(traducirError(typeof data.error==="string"?data.error:(data.error&&data.error.message?data.error.message:JSON.stringify(data.error))));
  return String(data.text||"").trim() || "La IA no devolvió observaciones.";
}

function botiaOpLabel(op){
  var esAlq = op.tipo==="alquiler"||op.tipo==="reserva_alquiler";
  var nombre = esAlq ? (op.locatario_nombre||op.locador_nombre||"Sin nombre") : (op.comprador_nombre||op.vendedor_nombre||"Sin nombre");
  return (TIPOS[op.tipo]||op.tipo)+" — "+nombre+(op.inmueble_direccion?" ("+op.inmueble_direccion+")":"");
}

function fileToBase64(file){
  return new Promise(function(resolve,reject){
    var r=new FileReader();
    r.onload=function(){ resolve(String(r.result).split(",")[1]||""); };
    r.onerror=function(){ reject(new Error("No se pudo leer el archivo.")); };
    r.readAsDataURL(file);
  });
}
function fileToText(file){
  return new Promise<string>(function(resolve,reject){
    var r=new FileReader();
    r.onload=function(){ resolve(String(r.result||"")); };
    r.onerror=function(){ reject(new Error("No se pudo leer el archivo.")); };
    r.readAsText(file);
  });
}

function BotIA({onClose,operaciones,clausulas,bloquesReserva,onAddClausula}){
  const [msgs,setMsgs]=useState<any[]>([{role:"assistant",content:"¡Hola! Soy tu asistente legal de DocWorks. Puedo revisar una operación cargada y avisarte si falta algo, leer un contrato que adjuntes (PDF, imagen o .txt) y sugerir correcciones, o redactar una cláusula nueva para tu biblioteca. ¿En qué te ayudo?"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [attachment,setAttachment]=useState(null); // {name, kind:"pdf"|"image"|"text", mediaType, data}
  const [attError,setAttError]=useState("");
  const [showOpPicker,setShowOpPicker]=useState(false);
  const [modoClausula,setModoClausula]=useState(false);
  const bottomRef=useRef<HTMLDivElement>(null);
  const fileRef=useRef<HTMLInputElement>(null);

  useEffect(function(){if(bottomRef.current)bottomRef.current.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  async function callGemini(newMsgs, systemExtra){
    var sb=await loadSupabaseJs();
    if(!sb) throw new Error("No se pudo conectar con Supabase.");
    var mode=systemExtra?"clause":"chat";
    var res=await sb.functions.invoke("ia-docworks",{
      body:{mode:mode,messages:newMsgs.map(function(m){return {role:m.role,content:(m.apiContent!==undefined?m.apiContent:m.content)};})}
    });
    if(res.error) throw new Error(traducirError(res.error.message||"No se pudo conectar con el asistente."));
    var data=res.data||{};
    if(data.error) throw new Error(traducirError(typeof data.error==="string"?data.error:(data.error&&data.error.message?data.error.message:JSON.stringify(data.error))));
    return data.text||"No pude procesar la respuesta.";
  }

  async function enviar(display, apiContentOverride, opts){
    if(loading) return;
    var userMsg:any={role:"user",content:display};
    if(apiContentOverride!==undefined) userMsg.apiContent=apiContentOverride;
    var newMsgs=msgs.concat([userMsg]);
    setMsgs(newMsgs);
    setInput("");
    setAttachment(null);
    setAttError("");
    var enModoClausula = !!(opts&&opts.clausula);
    setModoClausula(false);
    setLoading(true);
    try{
      var reply=await callGemini(newMsgs, enModoClausula?BOTIA_CLAUSULA_SYSTEM:"");
      var parsedClauseResponse = parseClauseResponse(reply);
      var draft = parsedClauseResponse && parsedClauseResponse.obj && parsedClauseResponse.obj.titulo && parsedClauseResponse.obj.contenido ? parsedClauseResponse.obj : null;
      setMsgs(function(m){return m.concat([{role:"assistant",content:reply,clauseDraft:draft||undefined,clauseNote:parsedClauseResponse&&parsedClauseResponse.note?parsedClauseResponse.note:undefined}]);});
    }catch(e){
      setMsgs(function(m){return m.concat([{role:"assistant",content:"Error al conectar con el asistente. Verificá tu conexión."}]);});
    }
    setLoading(false);
  }

  function send(){
    if(loading) return;
    if(attachment){
      var blocks=[];
      if(attachment.kind==="pdf") blocks.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:attachment.data}});
      else if(attachment.kind==="image") blocks.push({type:"image",source:{type:"base64",media_type:attachment.mediaType,data:attachment.data}});
      else if(attachment.kind==="text") blocks.push({type:"text",text:"[Archivo adjunto: "+attachment.name+"]\n\n"+attachment.data});
      blocks.push({type:"text",text:input.trim()||"Revisá este documento y avisame si falta algo o hay algo para corregir."});
      var display=(input.trim()?input.trim()+"\n\n":"")+"📎 "+attachment.name;
      enviar(display, blocks, {clausula:modoClausula});
      return;
    }
    if(!input.trim()) return;
    enviar(input.trim(), undefined, {clausula:modoClausula});
  }

  function revisarOperacion(op){
    setShowOpPicker(false);
    var faltantes=getCamposFaltantes(op);
    var fechas=getProblemasFechas(op);
    var doc=null, docTexto="";
    try{ doc=buildDocSections(opParaDocumento(limpiarComisionesIncompatibles(op)), clausulas||[], op.tipo, bloquesReserva||[]); docTexto=docToPlainText(doc); }catch(e){ docTexto="(No se pudo generar el texto del documento.)"; }
    var advertencias=[];
    faltantes.forEach(function(c){advertencias.push("Falta completar: "+c+".");});
    fechas.forEach(function(p){advertencias.push(p);});
    var contexto = "Revisá la siguiente operación (" + (TIPOS[op.tipo]||op.tipo) + ") cargada en DocWorks y decime concretamente qué falta o qué convendría corregir antes de generar el documento final.\n\n"
      + "CHEQUEOS AUTOMÁTICOS DEL SISTEMA:\n" + (advertencias.length?advertencias.join("\n"):"Ninguno detectado.") + "\n\n"
      + "CLÁUSULAS YA INCLUIDAS: " + ((op.clausulas_ids||[]).length ? (op.clausulas_ids||[]).map(function(id){var c=(clausulas||[]).find(function(x){return x.id===id;});return c?c.titulo:id;}).join(", ") : "Ninguna") + "\n\n"
      + "TEXTO DEL DOCUMENTO GENERADO:\n" + docTexto;
    enviar("🔍 Revisar operación: "+botiaOpLabel(op), contexto, {clausula:false});
  }

  async function handleFile(e){
    var file=e.target.files&&e.target.files[0];
    if(fileRef.current) fileRef.current.value="";
    if(!file) return;
    setAttError("");
    if(file.size>10*1024*1024){ setAttError("El archivo es muy grande (máx. 10MB)."); return; }
    try{
      if(file.type==="application/pdf"){
        var b64=await fileToBase64(file);
        setAttachment({name:file.name,kind:"pdf",mediaType:"application/pdf",data:b64});
      }else if(file.type.indexOf("image/")===0){
        var b64i=await fileToBase64(file);
        setAttachment({name:file.name,kind:"image",mediaType:file.type,data:b64i});
      }else if(file.type==="text/plain"||/\.txt$/i.test(file.name)){
        var txt=await fileToText(file);
        if(txt.length>18000) txt=txt.slice(0,18000)+"\n\n[...texto recortado por longitud...]";
        setAttachment({name:file.name,kind:"text",mediaType:"text/plain",data:txt});
      }else{
        setAttError("Formato no soportado. Podés adjuntar PDF, imagen (JPG/PNG) o .txt.");
      }
    }catch(err){
      setAttError(traducirError(err.message||"No se pudo leer el archivo."));
    }
  }

  function addClauseFromDraft(i,obj){
    onAddClausula(Object.assign({},obj,{id:genId(),tipos:["todos"]}));
    setMsgs(function(m){return m.map(function(msg,idx){return idx===i?Object.assign({},msg,{added:true}):msg;});});
  }

  var quickBtnStyle={padding:"5px 9px",borderRadius:8,border:"1px solid var(--border2)",background:"rgba(255,255,255,0.04)",color:"var(--muted)",cursor:"pointer",fontSize:12,whiteSpace:"nowrap"};

  return(
    <div style={{position:"fixed",bottom:80,right:20,width:380,maxWidth:"calc(100vw - 40px)",zIndex:200,display:"flex",flexDirection:"column",borderRadius:16,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.4)",border:"1px solid var(--border2)",background:"var(--surface)"}}>
      {/* Header */}
      <div style={{padding:"12px 16px",background:"linear-gradient(135deg,#1e293b,#0f172a)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,var(--gold),var(--gold2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✦</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>Asistente DocWorks</div>
            <div style={{fontSize:12,color:"var(--green)"}}>● En línea</div>
          </div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"var(--dim)",cursor:"pointer",fontSize:18,padding:4}}>✕</button>
      </div>

      {/* Acciones rápidas */}
      <div style={{padding:"8px 12px 0",display:"flex",gap:6,flexWrap:"wrap",position:"relative"}}>
        <button style={Object.assign({},quickBtnStyle,showOpPicker?{borderColor:"var(--gold)",color:"var(--gold)"}:{})} onClick={function(){setShowOpPicker(function(v){return !v;});}}>🔍 Revisar operación</button>
        <button style={Object.assign({},quickBtnStyle,modoClausula?{borderColor:"var(--gold)",color:"var(--gold)"}:{})} onClick={function(){setModoClausula(function(v){return !v;});}}>✍️ {modoClausula?"Cláusula: escribí el tema ↓":"Redactar cláusula"}</button>
        {showOpPicker&&(
          <div style={{position:"absolute",top:"100%",left:12,right:12,marginTop:4,background:"var(--surface2, #16202f)",border:"1px solid var(--border2)",borderRadius:10,maxHeight:180,overflowY:"auto",zIndex:5,boxShadow:"0 10px 30px rgba(0,0,0,0.4)"}}>
            {(!operaciones||operaciones.length===0)&&<div style={{padding:10,fontSize:12,color:"var(--dim)"}}>No hay operaciones cargadas.</div>}
            {(operaciones||[]).map(function(op){
              return(
                <div key={op.id} onClick={function(){revisarOperacion(op);}} style={{padding:"8px 10px",fontSize:12,color:"var(--text)",cursor:"pointer",borderBottom:"1px solid var(--border)"}}
                  onMouseEnter={function(e){e.currentTarget.style.background="rgba(255,255,255,0.05)";}} onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}>
                  {botiaOpLabel(op)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{height:340,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map(function(m,i){
          var isUser=m.role==="user";
          if(m.clauseDraft){
            var cd=m.clauseDraft;
            return(
              <div key={i} style={{display:"flex",justifyContent:"flex-start"}}>
                <div style={{maxWidth:"92%",padding:"11px 13px",borderRadius:"12px 12px 12px 3px",background:"rgba(255,255,255,0.06)",border:"1px solid var(--border2)",color:"var(--text)",fontSize:12.5,lineHeight:1.55}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",textTransform:"uppercase",letterSpacing:0.4,marginBottom:4}}>Propuesta de cláusula</div>
                  <div style={{fontWeight:700,marginBottom:3}}>{cd.titulo}</div>
                  <div style={{fontSize:12,color:"var(--dim)",textTransform:"capitalize",marginBottom:6}}>{cd.categoria}</div>
                  <div style={{whiteSpace:"pre-wrap",marginBottom:9}}>{cd.contenido}</div>
                  {m.clauseNote&&<div style={{padding:"8px 9px",marginBottom:9,borderRadius:8,background:"rgba(212,168,83,.06)",border:"1px solid rgba(212,168,83,.16)",fontSize:12,color:"var(--muted)",lineHeight:1.45}}><b style={{color:"var(--gold)"}}>Nota:</b> {m.clauseNote}</div>}
                  <button disabled={!!m.added} onClick={function(){addClauseFromDraft(i,cd);}}
                    style={{padding:"6px 11px",borderRadius:8,border:"none",background:m.added?"rgba(255,255,255,0.08)":"var(--gold)",color:m.added?"var(--dim)":"#0a0f1a",fontWeight:700,fontSize:12,cursor:m.added?"default":"pointer"}}>
                    {m.added?"✓ Agregada a la biblioteca":"+ Agregar a la biblioteca"}
                  </button>
                </div>
              </div>
            );
          }
          return(
            <div key={i} style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"85%",padding:"9px 13px",borderRadius:isUser?"12px 12px 3px 12px":"12px 12px 12px 3px",background:isUser?"var(--gold)":"rgba(255,255,255,0.06)",color:isUser?"#0a0f1a":"var(--text)",fontSize:12.5,lineHeight:1.55,whiteSpace:"pre-wrap"}}>
                {m.content}
              </div>
            </div>
          );
        })}
        {loading&&(
          <div style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{padding:"9px 14px",borderRadius:"12px 12px 12px 3px",background:"rgba(255,255,255,0.06)",fontSize:12}}>
              <span style={{animation:"pulse 1s infinite"}}>Escribiendo...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Adjunto pendiente */}
      {attachment&&(
        <div style={{padding:"0 12px 6px",display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:12,color:"var(--muted)",background:"rgba(255,255,255,0.05)",border:"1px solid var(--border2)",borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center",gap:6}}>
            📎 {attachment.name}
            <button onClick={function(){setAttachment(null);}} style={{background:"none",border:"none",color:"var(--dim)",cursor:"pointer",fontSize:12,padding:0}}>✕</button>
          </span>
        </div>
      )}
      {attError&&<div style={{padding:"0 12px 6px",fontSize:12,color:"var(--red)"}}>{attError}</div>}

      {/* Input */}
      <div style={{padding:"10px 12px",borderTop:"1px solid var(--border)",display:"flex",gap:8,alignItems:"flex-end"}}>
        <button onClick={function(){fileRef.current&&fileRef.current.click();}} title="Adjuntar archivo (PDF, imagen o .txt)"
          style={{width:36,height:36,borderRadius:10,border:"1px solid var(--border2)",background:"rgba(255,255,255,0.05)",color:"var(--muted)",cursor:"pointer",fontSize:15,flexShrink:0}}>📎</button>
        <input ref={fileRef} type="file" accept=".pdf,.txt,image/*" style={{display:"none"}} onChange={handleFile}/>
        <textarea value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder={modoClausula?"Ej: Cláusula sobre tenencia de mascotas...":"Preguntá sobre el contrato, pegá texto a revisar..."}
          style={{flex:1,resize:"none",height:52,padding:"8px 10px",borderRadius:10,border:"1px solid var(--border2)",background:"rgba(255,255,255,0.05)",color:"var(--text)",fontSize:12.5,fontFamily:"DM Sans,sans-serif",outline:"none"}} rows={2}/>
        <VozATextoButton onText={function(t){setInput(function(v){return (v?v+" ":"")+t;});}} disabled={loading}/>
        <button onClick={send} disabled={(!input.trim()&&!attachment)||loading}
          style={{padding:"0 14px",height:36,borderRadius:10,border:"none",background:(input.trim()||attachment)&&!loading?"var(--gold)":"rgba(255,255,255,0.1)",color:(input.trim()||attachment)&&!loading?"#0a0f1a":"var(--dim)",cursor:(input.trim()||attachment)&&!loading?"pointer":"default",fontWeight:700,fontSize:18,transition:"all 0.15s",flexShrink:0}}>↑</button>
      </div>
    </div>
  );
}

// Menú desplegable para insertar variables ({{campo}}) en un texto de cláusula.
// Inserta en la posición del cursor del textarea referenciado por taRef.
function VariablePicker({taRef,value,onChange,label=""}){
  const [open,setOpen]=useState(false);
  const [pos,setPos]=useState(null);
  const wrapRef=useRef<HTMLDivElement>(null);
  const btnRef=useRef<HTMLButtonElement>(null);

  function place(){
    var el=btnRef.current;
    if(!el)return;
    var r=el.getBoundingClientRect();
    var menuW=280, margin=8;
    var left=r.left;
    if(left+menuW+margin>window.innerWidth) left=Math.max(margin,window.innerWidth-menuW-margin);
    var maxH=Math.min(340,window.innerHeight-r.bottom-margin);
    var openUp=maxH<160 && r.top>maxH;
    setPos({
      left:left,
      top:openUp?undefined:r.bottom+4,
      bottom:openUp?(window.innerHeight-r.top+4):undefined,
      maxHeight:openUp?Math.min(340,r.top-margin):Math.max(160,maxH),
    });
  }

  useEffect(function(){
    if(!open)return;
    place();
    function handleDown(e){
      if(wrapRef.current&&wrapRef.current.contains(e.target))return;
      setOpen(false);
    }
    function handleReflow(){ place(); }
    document.addEventListener("mousedown",handleDown);
    window.addEventListener("scroll",handleReflow,true);
    window.addEventListener("resize",handleReflow);
    window.addEventListener("orientationchange",handleReflow);
    return function(){
      document.removeEventListener("mousedown",handleDown);
      window.removeEventListener("resize",handleReflow);
      window.removeEventListener("orientationchange",handleReflow);
      window.removeEventListener("scroll",handleReflow,true);
    };
  },[open]);

  // Oculta del menú los tokens que ya están insertados en este texto.
  // Si el usuario borra el token del texto, vuelve a aparecer automáticamente.
  var tokensUsados = tokensDeTextoDocWorks(value);
  function insert(key){
    var token="{{"+key+"}}";
    var el=taRef&&taRef.current;
    var start=el?el.selectionStart:value.length;
    var end=el?el.selectionEnd:value.length;
    var next=value.slice(0,start)+token+value.slice(end);
    onChange(next);
    setOpen(false);
    setTimeout(function(){
      if(el){el.focus();var pos2=start+token.length;el.setSelectionRange(pos2,pos2);}
    },0);
  }
  return(
    <div style={{position:"relative",display:"inline-block"}} ref={wrapRef}>
      <span ref={btnRef} style={{display:"inline-block"}}>
        <Btn v="ghost" s="sm" type="button" onClick={function(){setOpen(function(o){return !o;});}}>🔗 {label||"Vincular dato"}</Btn>
      </span>
      {open&&pos&&(
        <div className="var-picker-menu" style={{position:"fixed",left:pos.left,top:pos.top,bottom:pos.bottom,maxHeight:pos.maxHeight}}>
          {VAR_GROUPS.map(function(g){
            return(
              <div key={g.group}>
                <div className="var-picker-group">{g.group}</div>
                {g.fields.filter(function(f){return tokensUsados.indexOf(f.key)===-1;}).map(function(f){
                  return <button key={f.key} type="button" className="var-picker-item" onClick={function(){insert(f.key);}}>{f.label}</button>;
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Selector múltiple de tipos de documento a los que aplica una cláusula.
function TipoSelector({value,onChange}){
  var v=value&&value.length?value:["todos"];
  var esTodos=v.indexOf("todos")!==-1;
  function toggleTodos(){ onChange(esTodos?[]:["todos"]); }
  function toggleTipo(key){
    if(esTodos){ onChange([key]); return; }
    onChange(v.indexOf(key)!==-1 ? v.filter(function(x){return x!==key;}) : v.concat([key]));
  }
  return(
    <div>
      <div style={{fontSize:12,fontWeight:600,color:"var(--muted)",marginBottom:6}}>Aplica a los documentos:</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        <button type="button" aria-pressed={esTodos} className={"tipo-chip "+(esTodos?"on":"")} onClick={toggleTodos}>{esTodos?"✓ ":""}Todos los documentos</button>
        {Object.keys(TIPOS).map(function(k){
          return <button type="button" key={k} aria-pressed={!esTodos&&v.indexOf(k)!==-1} className={"tipo-chip "+(!esTodos&&v.indexOf(k)!==-1?"on":"")} onClick={function(){toggleTipo(k);}}>{!esTodos&&v.indexOf(k)!==-1?"✓ ":""}{TIPOS[k]}</button>;
        })}
      </div>
    </div>
  );
}

function ClausulaFormBody({form,setForm,onCancel,onSubmit,editId,guardando,habilitarParaAsesores,onHabilitarChange,soloHabilitar,bloquearGuardado,guardarLabel,advertencia}){
  const taRef=useRef();
  const [opcionesAbiertas,setOpcionesAbiertas]=useState(!!editId);
  const CATS=["general","posesion","pago","rescision","impuestos","alquiler"];
  form=form||FORM_CLAUSULA_EMPTY;
  var tiposSeguros=Array.isArray(form.tipos)&&form.tipos.length?form.tipos:["todos"];
  var creacionSimple=typeof habilitarParaAsesores==="boolean"&&!editId;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <fieldset disabled={!!guardando||!!soloHabilitar} style={{border:0,padding:0,margin:0,minWidth:0,display:"flex",flexDirection:"column",gap:10}}>
      <Inp label="Título" value={form.titulo} onChange={function(e){setForm(function(f){return Object.assign({},f,{titulo:e.target.value});});}} placeholder="Ej: Multa por rescisión"/>
      {advertencia}
      {creacionSimple&&<>
        <TipoSelector value={tiposSeguros} onChange={function(t){setForm(function(f){return Object.assign({},f,{tipos:t});});}}/>
        <label style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,cursor:"pointer",lineHeight:1.5}}><input type="checkbox" checked={habilitarParaAsesores} onChange={function(e){onHabilitarChange(e.target.checked);}}/><span><b>Disponible para asesores</b><br/><span style={{color:"var(--muted)",fontSize:12}}>Podrán elegirla al final de los documentos seleccionados. Si lo desmarcás, queda guardada solo en la biblioteca.</span></span></label>
      </>}
      <div style={{border:"1px solid var(--border)",borderRadius:9,overflow:"hidden"}}>
        <button type="button" aria-expanded={opcionesAbiertas} onClick={function(){setOpcionesAbiertas(function(v){return !v;});}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"10px 12px",border:0,background:"var(--card2, transparent)",color:"var(--text)",cursor:"pointer",textAlign:"left",fontSize:12.5,fontWeight:650}}><span>Opciones</span><span>{opcionesAbiertas?"−":"＋"}</span></button>
        {opcionesAbiertas&&<div style={{display:"flex",flexDirection:"column",gap:10,padding:12}}>
          <Slt label="Categoría" value={form.categoria||"general"} onChange={function(e){setForm(function(f){return Object.assign({},f,{categoria:e.target.value});});}}>
            {CATS.map(function(c){return <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>;})}
          </Slt>
          {!creacionSimple&&<TipoSelector value={tiposSeguros} onChange={function(t){setForm(function(f){return Object.assign({},f,{tipos:t});});}}/>}
          {!creacionSimple&&<label style={{display:"flex",alignItems:"flex-start",gap:8,padding:"9px 11px",borderRadius:8,border:"1px solid var(--border)",background:form.obligatoria?"rgba(180,83,9,0.08)":"transparent",cursor:"pointer",fontSize:12.5,color:"var(--text)"}}>
            <input type="checkbox" checked={!!form.obligatoria} onChange={function(e){setForm(function(f){return Object.assign({},f,{obligatoria:e.target.checked});});}} style={{marginTop:2}}/>
            <span><b>Obligatoria en la biblioteca</b> — configuración administrada por Dueño/Administrador.</span>
          </label>}
        </div>}
      </div>
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:4}}>
          <label className="field-label" style={{margin:0}}>Texto</label>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <VozATextoButton onText={function(t){setForm(function(f){return Object.assign({},f,{contenido:(f.contenido?f.contenido+" ":"")+t});});}} title="Dictar cláusula por voz"/>
            <VariablePicker taRef={taRef} value={form.contenido} onChange={function(v){setForm(function(f){return Object.assign({},f,{contenido:v});});}}/>
          </div>
        </div>
        <textarea id="dw-clausula-texto" ref={taRef} className="inp" rows={4} value={form.contenido} onChange={function(e){setForm(function(f){return Object.assign({},f,{contenido:e.target.value});});}} placeholder="Redactá el texto. Usá «Vincular dato» para insertar campos como el nombre del titular, DNI, dirección, etc."/>
        <div style={{fontSize:12,color:"var(--dim)",marginTop:4}}>Los campos vinculados se completan automáticamente con los datos reales de cada operación al generar el documento.</div>
      </div>
      </fieldset>
      <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}>
        {editId&&<Btn v="ghost" s="sm" onClick={onCancel} disabled={!!guardando}>Cancelar</Btn>}
        <Btn s="sm" onClick={onSubmit} disabled={!!guardando||!!bloquearGuardado}>{guardando?"Guardando…":guardarLabel||(editId?"Guardar cambios":"Guardar cláusula")}</Btn>
      </div>
    </div>
  );
}

const FORM_CLAUSULA_EMPTY={titulo:"",categoria:"general",contenido:"",tipos:["todos"],obligatoria:false};

var CLAUSULA_CATS=["general","posesion","pago","rescision","impuestos","alquiler"];

// Composer "Redactar con IA": el usuario escribe una idea breve y la IA
// devuelve título + categoría + texto narrado, que se vuelca al formulario de
// arriba para que el usuario lo revise/edite antes de guardar.
function ClausulaIAComposer({onDraft}){
  const [idea,setIdea]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  async function generar(){
    if(!idea.trim()||loading)return;
    setLoading(true); setError("");
    try{
      var draft=await narrarClausulaIA(idea.trim());
      if(draft){ onDraft(draft); setIdea(""); }
      else setError("No pude interpretar la respuesta. Probá reformular la idea.");
    }catch(e){
      setError("Error al conectar con el asistente. Verificá tu conexión.");
    }
    setLoading(false);
  }
  return(
    <div style={{marginTop:16,paddingTop:16,borderTop:"1px dashed var(--border2)"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
        <span style={{fontSize:15}}>✦</span>
        <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",margin:0}}>Redactar con IA</p>
      </div>
      <div style={{fontSize:12,color:"var(--dim)",marginBottom:9}}>Contá en una frase qué querés que diga. Revisá el título y el texto antes de guardar.</div>
      <div style={{display:"flex",gap:7,alignItems:"flex-start"}}>
        <textarea className="inp" rows={2} value={idea} onChange={function(e){setIdea(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();generar();}}}
          placeholder="Ej: que el inquilino no pueda tener mascotas sin autorización" style={{flex:1,resize:"none"}}/>
        <VozATextoButton onText={function(t){setIdea(function(v){return (v?v+" ":"")+t;});}} disabled={loading}/>
        <Btn s="sm" onClick={generar} disabled={!idea.trim()||loading}>{loading?"Narrando…":"Redactar con IA"}</Btn>
      </div>
      {error&&<div style={{fontSize:12,color:"var(--red)",marginTop:6}}>{error}</div>}
    </div>
  );
}


function Dropdown({items}){
  const [open,setOpen]=useState(false);
  const [pos,setPos]=useState(null);
  const btnRef=useRef<HTMLButtonElement>(null);
  const menuRef=useRef<HTMLDivElement>(null);
  useEffect(function(){
    function handle(e){
      if(btnRef.current&&btnRef.current.contains(e.target))return;
      if(menuRef.current&&menuRef.current.contains(e.target))return;
      setOpen(false);
    }
    document.addEventListener("mousedown",handle);
    document.addEventListener("touchstart",handle);
    function escape(e){if(e.key==="Escape")setOpen(false);}
    document.addEventListener("keydown",escape);
    return function(){document.removeEventListener("mousedown",handle);document.removeEventListener("touchstart",handle);document.removeEventListener("keydown",escape);};
  },[]);
  // Se posiciona con position:fixed (calculando el rect real del botón) en vez de
  // depender del flujo normal, porque la tarjeta contenedora (.op-card) tiene
  // overflow:hidden y recortaba el menú — por eso "Eliminar" quedaba invisible / no
  // se podía llegar a él haciendo scroll. position:fixed no se ve afectado por ese
  // overflow y además se recalcula para abrir hacia arriba si no entra hacia abajo
  // (útil en mobile cuando la tarjeta está cerca del borde inferior de la pantalla).
  function reposition(){
    if(!btnRef.current)return;
    var r=btnRef.current.getBoundingClientRect();
    var menuW=180;
    var visibleCount=items.filter(Boolean).length;
    var menuH=Math.min(visibleCount*42+10,320);
    var left=r.right-menuW; if(left<8)left=8;
    if(left+menuW>window.innerWidth-8)left=window.innerWidth-8-menuW;
    var top=r.bottom+4;
    if(top+menuH>window.innerHeight-8){ top=r.top-menuH-4; if(top<8)top=8; }
    setPos({top:top,left:left,width:menuW,maxHeight:Math.min(menuH,window.innerHeight-16)});
  }
  function toggle(){
    if(!open) reposition();
    setOpen(!open);
  }
  useEffect(function(){
    if(!open)return;
    function onScrollResize(e){
      // Desplazar el propio menú no debe hacerlo saltar ni cerrarse.
      if(e && menuRef.current && menuRef.current.contains(e.target)) return;
      reposition();
    }
    window.addEventListener("scroll",onScrollResize,true);
    window.addEventListener("resize",onScrollResize);
    return function(){window.removeEventListener("scroll",onScrollResize,true);window.removeEventListener("resize",onScrollResize);};
  },[open]);
  return(
    <div style={{position:"relative",display:"inline-block"}}>
      <span ref={btnRef} style={{display:"inline-block"}}><Btn v="secondary" s="md" className="op-more" onClick={toggle} style={{minWidth:44,justifyContent:"center",fontWeight:700,padding:"9px 13px"}}>⋯</Btn></span>
      {open&&pos&&createPortal(
        <div ref={menuRef} role="menu" aria-label="Acciones de operación" className="dropdown-menu" style={{position:"fixed",top:pos.top,left:pos.left,width:pos.width,maxHeight:pos.maxHeight,overflowY:"auto",right:"auto",zIndex:20000,WebkitOverflowScrolling:"touch",overscrollBehavior:"contain"}}>
          {items.map(function(item,i){
            if(!item)return null;
            return <button key={i} className={"dropdown-item "+(item.red?"red":"")} onClick={function(){setOpen(false);item.onClick();}}>{item.icon&&<span style={{display:"inline-flex",alignItems:"center",marginRight:6}}>{item.icon}</span>}{item.label}</button>;
          })}
        </div>, document.body
      )}
    </div>
  );
}

function soloDigitosBusqueda(value){ return String(value||"").replace(/\D/g,""); }
function valoresBusquedaOperacion(op){
  op=op||{};
  return [op.id,op.tipo,op.estado,
    op.comprador_nombre,op.comprador_dni,op.comprador_cuit,op.comprador_email,op.comprador_telefono,
    op.vendedor_nombre,op.vendedor_dni,op.vendedor_cuit,op.vendedor_email,op.vendedor_telefono,
    op.locador_nombre,op.locador_dni,op.locador_cuit,op.locador_email,op.locador_telefono,
    op.locatario_nombre,op.locatario_dni,op.locatario_cuit,op.locatario_email,op.locatario_telefono,
    op.inmueble_direccion,op.inmueble_partido,op.inmueble_provincia,op.nomenclatura_catastral,
    op.precio,op.moneda,op.alquiler_monto_inicial,op.alquiler_moneda
  ].filter(function(v){return v!==null&&v!==undefined&&String(v).trim()!=="";});
}
function operacionCoincideBusqueda(op,query){
  var needle=normalizarBusqueda(query);
  if(!needle) return true;
  var vals=valoresBusquedaOperacion(op);
  if(vals.some(function(v){return normalizarBusqueda(v).includes(needle);})) return true;
  var digs=soloDigitosBusqueda(query);
  return digs.length>=4 && vals.some(function(v){return soloDigitosBusqueda(v).includes(digs);});
}

// ── CONFIGURACION VIEW ─────────────────────────────────────────────────────────

var ROLES_DEF = {
  dueno:   { label:"Dueño",           color:"var(--gold)",   bg:"rgba(212,168,83,0.12)",   perms:["todo"] },
  admin:   { label:"Administrador",   color:"var(--teal)",   bg:"rgba(45,212,191,0.10)",   perms:["crear","editar","eliminar","ver_todos","configurar"] },
  broker:  { label:"Asesor",          color:"#a78bfa",       bg:"rgba(139,92,246,0.10)",   perms:["crear","editar","ver_propios"] },
  vendedor:{ label:"Vendedor",        color:"#60a5fa",       bg:"rgba(59,130,246,0.10)",   perms:["crear","ver_propios"] },
  viewer:  { label:"Solo lectura",    color:"var(--dim)",    bg:"rgba(148,163,184,0.08)",  perms:["ver_todos"] },
};
const PERMS_LABELS = {
  todo:"Acceso total", crear:"Crear operaciones", editar:"Editar operaciones",
  eliminar:"Eliminar operaciones", ver_todos:"Ver todas las ops.", ver_propios:"Ver sus ops.", configurar:"Configurar cuenta",
};
const NIVEL_LABELS = { junior:"Junior", semisenior:"Intermedio", senior:"Senior" };


function CuerpoPlantillaPanel({perfil,tipo,puedeEditar,onChange,clausulas,previewOpen,onPreviewChange,puedeVerHistorial,usuarioActual,bloquesReserva,onEditingChange}) {
  const [draft,setDraft]=useState(function(){return getBodyBlocksConfig(perfil,tipo,bloquesReserva);});
  const contenidoEditorRef=useRef(null);
  const [editId,setEditId]=useState(null);
  const [historialSeleccionado,setHistorialSeleccionado]=useState(null);
  const [status,setStatus]=useState(null);
  const [probarAbierto,setProbarAbierto]=useState(false);
  const [modoVistaClausulas]=useState("simple");
  const [clausulasAbiertas,setClausulasAbiertas]=useState({});
  useEffect(function(){if(onEditingChange)onEditingChange(!!editId);},[editId,onEditingChange]);
  useEffect(function(){
    if(!editId)return;
    function advertirSalida(e){e.preventDefault();e.returnValue="";}
    window.addEventListener("beforeunload",advertirSalida);
    return function(){window.removeEventListener("beforeunload",advertirSalida);};
  },[editId]);
  useEffect(function(){
    if(!editId&&status!=="saving")return;
    function protegerNavegacion(e){
      if(e.defaultPrevented)return;
      e.preventDefault();
      if(status==="saving"){dwNotify("info","Esperá a que termine de guardarse el modelo.");return;}
      requestDwConfirm("¿Descartar los cambios sin guardar antes de salir del modelo?",function(){
        setDraft(getBodyBlocksConfig(perfil,tipo,bloquesReserva));setEditId(null);
        e.detail.continuar();
      });
    }
    window.addEventListener("dw:model-navigation",protegerNavegacion);
    return function(){window.removeEventListener("dw:model-navigation",protegerNavegacion);};
  },[editId,status,perfil,tipo,bloquesReserva]);
  var previewVisible=typeof previewOpen==="boolean"?previewOpen:probarAbierto;
  function togglePreview(){if(typeof onPreviewChange==="function")onPreviewChange(!previewVisible);else setProbarAbierto(!previewVisible);}
  var opEjemploPlantilla=Object.assign({},SAMPLE_OP_PREVIEW,{
    id:"EJEMPLO-NO-GUARDAR",tipo:tipo,created_at:"2026-10-17T12:00:00.000Z",
    comodato_plazo:"24",comodato_uso:"vivienda familiar",exclusividad_vigencia:"90",exclusividad_tipo:"con",
    devolucion_motivo:"Devolución de ejemplo por mutuo acuerdo",refuerzo_trayectoria:"Operación de ejemplo vinculada a una reserva previa",
    alquiler_plazo_meses:"24",alquiler_inicio:"2026-11-01",alquiler_fin:"2028-11-01",
    res_alq_inicio_estimado:"2026-11-01",res_alq_monto_reserva:"100000",res_alq_monto_mensual:"350000",
    inmueble_partido:"Pilar",inmueble_provincia:"Buenos Aires",inmueble_direccion:"EJEMPLO · Av. del Libertador 5678",
    precio:"150000",anticipo:"15000",saldo:"135000",fecha_posesion:"2026-12-15"
  });
  var docPruebaPlantilla=previewVisible?aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(opEjemploPlantilla),clausulas||[],tipo,draft),opEjemploPlantilla,tipo,perfil):null;
  var analisisPruebaPlantilla=docPruebaPlantilla?analizarDatosObligatorios(docPruebaPlantilla,tipo,opEjemploPlantilla):null;
  var textoPruebaPlantilla=docPruebaPlantilla?docToPlainText(docPruebaPlantilla):"";
  var tokensPruebaPlantilla=docPruebaPlantilla?getTokensSinReemplazar(docPruebaPlantilla):[];
  useEffect(function(){setDraft(getBodyBlocksConfig(perfil,tipo,bloquesReserva));setEditId(null);setStatus(null);},[tipo]);
  useEffect(function(){if(!editId)setDraft(getBodyBlocksConfig(perfil,tipo,bloquesReserva));},[editId,perfil&&perfil.plantillas&&perfil.plantillas[tipo]&&perfil.plantillas[tipo].body_blocks,bloquesReserva]);
  function persist(next,extraConfig=undefined){
    if(!puedeEditar||status==="saving")return Promise.resolve({error:new Error("Sin permisos")});
    setDraft(next);setStatus("saving");
    var mapa=Object.assign({},perfil.plantillas||{});
    var configPrevio=Object.assign({},mapa[tipo]||{});
    var historial=Object.assign({},configPrevio.historial_clausulas||{});
    var usuarioNombre=(usuarioActual&&(usuarioActual.nombre||usuarioActual.email))||perfil.usuario_actual_nombre||perfil.nombre||"Usuario actual";
    var usuarioId=(usuarioActual&&usuarioActual.id)||null;
    var previas=getBodyBlocksConfig(perfil,tipo,bloquesReserva);
    function registrarVersionAnterior(anterior){
      var lista=Array.isArray(historial[anterior.id])?historial[anterior.id].slice():[];
      lista.unshift({fecha:new Date().toISOString(),usuario:usuarioNombre,usuarioId:usuarioId,titulo:String(anterior.titulo||""),contenido:String(anterior.contenido||""),activo:anterior.activo!==false,orden:Number(anterior.orden)||previas.indexOf(anterior)+1,obligatoria:anterior.obligatoria,condicion:anterior.condicion,sinTitulo:anterior.sinTitulo});
      historial[anterior.id]=lista.slice(0,10);
    }
    (Array.isArray(next)?next:[]).forEach(function(b){
      var anterior=previas.find(function(x){return x&&x.id===b.id;});
      if(!anterior)return;
      var cambio=String(anterior.titulo||"")!==String(b.titulo||"")||String(anterior.contenido||"")!==String(b.contenido||"")||(anterior.activo!==false)!==(b.activo!==false)||(Number(anterior.orden)||0)!==(Number(b.orden)||0)||anterior.obligatoria!==b.obligatoria||anterior.condicion!==b.condicion||anterior.sinTitulo!==b.sinTitulo;
      if(cambio)registrarVersionAnterior(anterior);
    });
    previas.forEach(function(anterior){if(anterior&&!next.some(function(b){return b&&b.id===anterior.id;}))registrarVersionAnterior(anterior);});
    var actual=Object.assign({},configPrevio,{body_blocks:completarClausulasBaseModelo(next,tipo).map(function(b,i){return normalizarBodyBlock(Object.assign({},b,{orden:i+1}),i);}),historial_clausulas:historial},extraConfig||{});
    var nextPerfil=Object.assign({},perfil,{plantillas:Object.assign({},mapa,{[tipo]:actual})});
    return Promise.resolve().then(function(){return onChange(nextPerfil);}).then(function(res){if(res&&res.error){setStatus("error");return res;}setStatus("saved");setTimeout(function(){setStatus(null);},2500);return res;}).catch(function(err){setStatus("error");return {error:err};});
  }
  function cancelarBorrador(){
    if(status==="saving")return;
    requestDwConfirm("¿Descartar los cambios sin guardar de esta cláusula?",function(){setDraft(getBodyBlocksConfig(perfil,tipo,bloquesReserva));setEditId(null);});
  }
  async function guardarClausula(){
    if(!puedeEditar||status==="saving")return;
    var bloque=draft.find(function(b){return b.id===editId;});
    if(!bloque||!String(bloque.titulo||"").trim()||!String(bloque.contenido||"").trim()){
      dwNotify("warning","Completá el título y el texto antes de guardar la cláusula.");return;
    }
    var res=await persist(draft);
    if(!res||!res.error)setEditId(null);
  }
  function update(id,changes){if(editId||status==="saving")return;var actual=draft.find(function(b){return b.id===id;});var cambio=Object.assign({},changes||{});if(esClausulaEsencialModelo(actual)){cambio.activo=true;cambio.obligatoria=true;}persist(draft.map(function(b){return b.id===id?Object.assign({},b,cambio):b;}));}
  function move(idx,dir){if(editId||status==="saving")return;var to=dir==="up"?idx-1:idx+1;if(to<0||to>=draft.length)return;var arr=draft.slice(),x=arr[idx];arr[idx]=arr[to];arr[to]=x;persist(arr);}
  function addBlock(){if(!puedeEditar||editId||status==="saving")return;var n=draft.length+1;var b=normalizarBodyBlock({id:tipo+".custom."+Date.now(),titulo:"NUEVA CLÁUSULA",contenido:"Escribí acá la redacción de esta cláusula. Podés insertar variables automáticas desde el listado inferior."},n-1);if(editId)return;setDraft(draft.concat([b]));setEditId(b.id);}
  function removeBlock(id){if(editId||status==="saving")return;var b=draft.find(function(x){return x.id===id;});if(!b)return;if(esClausulaEsencialModelo(b)){dwNotify("warning","Este apartado es esencial del modelo. Podés editar su texto, pero no eliminarlo.");return;}requestDwConfirm("¿Eliminar la cláusula “"+(b.titulo||"sin título")+"” de esta plantilla?",function(){persist(draft.filter(function(x){return x.id!==id;}));});}
  function reset(){if(editId||status==="saving")return;requestDwConfirm("¿Restaurar TODAS las cláusulas de "+(TIPOS[tipo]||tipo)+" a la versión de fábrica? Se guardará una copia del modelo actual para poder deshacer esta acción.",function(){var snapshot={fecha:new Date().toISOString(),clausulas:draft.map(function(b,i){return Object.assign({},b,{orden:Number(b.orden)||i+1});})};persist(getDefaultBodyBlocks(tipo),{restauracionAnterior:snapshot});setEditId(null);});}
  function deshacerRestauracion(){if(editId||status==="saving")return;var snap=perfil&&perfil.plantillas&&perfil.plantillas[tipo]&&perfil.plantillas[tipo].restauracionAnterior;if(!snap||!Array.isArray(snap.clausulas))return;requestDwConfirm("¿Deshacer la restauración y recuperar el modelo anterior?",function(){persist(snap.clausulas.map(function(b,i){return normalizarBodyBlock(Object.assign({},b,{orden:i+1}),i);}),{restauracionAnterior:null});setEditId(null);});}
  function restaurarBloque(id){
    var def=getDefaultBodyBlocks(tipo).find(function(x){return x.id===id;});
    if(!def){ dwNotify("info","Esta cláusula es propia: no tiene una versión de fábrica para restaurar."); return; }
    requestDwConfirm("¿Restaurar solo la cláusula «"+def.titulo+"» a la versión de fábrica?",function(){ persist(draft.map(function(b){return b.id===id?Object.assign({},b,{titulo:def.titulo,contenido:def.contenido,activo:true}):b;})); setEditId(null); });
  }
  var tokensBase=[
    ["comprador_nombre","Comprador"],["comprador_dni","DNI/CUIT comprador"],["vendedor_nombre","Vendedor"],["vendedor_dni","DNI/CUIT vendedor"],["locador_nombre","Locador"],["locatario_nombre","Locatario / Inquilino"],
    ["inmueble_direccion","Dirección"],["inmueble_partido","Partido / localidad"],["inmueble_provincia","Provincia"],
    ["precio_letras","Precio en letras"],["moneda_txt","Moneda"],["anticipo_letras","Anticipo en letras"],["saldo_letras","Saldo en letras"],["fecha_posesion","Fecha de posesión"],
    ["comision_porcentaje","Comisión"],["comision_vendedor","Comisión vendedor"],["comision_comprador","Comisión comprador"],["alquiler_monto_inicial","Canon inicial"],["alquiler_inicio","Inicio"],["alquiler_fin","Vencimiento"],
    ["res_alq_monto_reserva","Reserva alquiler · importe numérico"],["res_alq_monto_mensual","Alquiler mensual · importe numérico"],["res_alq_inicio_estimado","Inicio estimado"],["devolucion_motivo","Motivo devolución · texto cargado"],["comodato_plazo","Plazo comodato"],["comodato_uso","Destino comodato"],
    ["escribania_clausula","Escribanía"],["exclusividad_vigencia","Vigencia"],["exclusividad_modalidad_texto","Modalidad"],["alquiler_canon_clause","Canon y actualización"],["alquiler_deposito_desc","Depósito"],["alquiler_garantia_detalle","Garantía"],["alquiler_plazo_texto","Plazo"],["devolucion_motivo_texto","Motivo devolución · con texto de respaldo"],["refuerzo_trayectoria","Antecedentes"],["reserva_alquiler_reserva","Reserva alquiler · importe en letras"],["reserva_alquiler_canon","Alquiler mensual · importe en letras"]
  ];
  var tokens=tokensBase.filter(function(t,i,arr){return arr.findIndex(function(x){return x[0]===t[0];})===i;});
  function insertToken(token){
    if(editId==null)return;
    var actual=draft.find(function(b){return b.id===editId;});
    var texto=String(actual&&actual.contenido||"");
    if(!puedeEditar||tokensDeTextoDocWorks(texto).indexOf(token)!==-1)return;
    var el=contenidoEditorRef.current;
    var inicio=el&&typeof el.selectionStart==="number"?el.selectionStart:texto.length;
    var fin=el&&typeof el.selectionEnd==="number"?el.selectionEnd:inicio;
    var insertar="{{"+token+"}}";
    var nuevoTexto=texto.slice(0,inicio)+insertar+texto.slice(fin);
    var arr=draft.map(function(b){return b.id===editId?Object.assign({},b,{contenido:nuevoTexto}):b;});
    setDraft(arr);
    setTimeout(function(){if(contenidoEditorRef.current){contenidoEditorRef.current.focus();contenidoEditorRef.current.setSelectionRange(inicio+insertar.length,inicio+insertar.length);}},0);
  }
  return <div>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:12}}>
      <div style={{fontFamily:"DM Serif Display,serif",fontSize:15,color:"var(--text)"}}>Cláusulas del documento · {draft.filter(function(b){return b.activo!==false&&b.obligatoria===true;}).length} incluidas</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{puedeEditar&&<><Btn s="sm" v="ghost" onClick={reset}>↺ Restaurar todas las cláusulas</Btn>{perfil&&perfil.plantillas&&perfil.plantillas[tipo]&&perfil.plantillas[tipo].restauracionAnterior&&<Btn s="sm" v="secondary" onClick={deshacerRestauracion}>Deshacer restauración</Btn>}<Btn s="sm" onClick={addBlock}>＋ Agregar cláusula</Btn></>}</div>
    </div>
    {previewVisible&&createPortal(<div role="dialog" aria-modal="true" aria-label="Vista previa del modelo" data-testid="dw-fullpage-preview" style={{position:"fixed",inset:0,zIndex:10050,background:"rgba(8,16,30,.88)",overflowY:"auto",overscrollBehavior:"contain",padding:"max(64px,calc(env(safe-area-inset-top) + 52px)) 12px max(20px,env(safe-area-inset-bottom))"}}><button type="button" data-testid="dw-preview-fixed-close" onClick={togglePreview} aria-label="Cerrar vista previa" style={{position:"fixed",top:"max(10px,env(safe-area-inset-top))",right:"max(12px,env(safe-area-inset-right))",zIndex:10052,width:44,height:44,borderRadius:14,border:"1px solid rgba(255,255,255,.28)",background:"#fff",color:"#142a4d",fontSize:25,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 18px rgba(0,0,0,.3)"}}>×</button><div style={{maxWidth:820,margin:"0 auto",background:"#fff",color:"#1f2937",borderRadius:8,boxShadow:"0 18px 65px rgba(0,0,0,.35)",padding:"clamp(18px,5vw,52px)",minHeight:"min(100vh,1050px)",boxSizing:"border-box"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:22,borderBottom:"1px solid #e5e7eb",paddingBottom:12}}><strong style={{fontSize:14}}>Vista previa · Datos de ejemplo</strong><button type="button" className="btn btn-secondary btn-sm" onClick={togglePreview} aria-label="Cerrar desde el documento">✕ Cerrar</button></div>
      <div style={{fontSize:12,fontWeight:800,letterSpacing:".04em",color:"#59c7f3",marginBottom:5}}>VISTA PREVIA CON DATOS DE EJEMPLO · EJEMPLO FICTICIO</div>
      <div style={{fontSize:11.5,color:"var(--dim)",marginBottom:10}}>Solo lectura. Usa el mismo constructor del documento con el borrador en memoria. No guarda en Supabase, no modifica operaciones reales y no exporta el ejemplo.</div>
      {analisisPruebaPlantilla&&(analisisPruebaPlantilla.faltaFormulario.length||analisisPruebaPlantilla.faltaPlantilla.length||analisisPruebaPlantilla.tokensNoResueltos.length)?<div style={{marginBottom:10,padding:9,borderRadius:8,background:"rgba(248,113,113,.07)",border:"1px solid rgba(248,113,113,.2)"}}><div style={{fontSize:12,fontWeight:800,color:"var(--red)",marginBottom:5}}>Datos faltantes / avisos</div>{analisisPruebaPlantilla.faltaFormulario.concat(analisisPruebaPlantilla.faltaPlantilla).map(function(x,i){return <div key={x.token+"-"+i} style={{fontSize:12,color:"var(--text)",marginTop:3}}>• {x.mensaje}</div>;})}{analisisPruebaPlantilla.tokensNoResueltos.map(function(x,i){return <div key={x.token+"-resolver-"+i} style={{fontSize:12,color:"var(--red)",marginTop:3}}>• {x.mensaje}</div>;})}</div>:<div style={{fontSize:12,color:"var(--green)",marginBottom:10}}>✓ Los datos obligatorios configurados aparecen en el documento de ejemplo.</div>}
      {tokensPruebaPlantilla.length>0&&<div style={{fontSize:12,color:"var(--red)",marginBottom:8}}>Tokens sin resolver: {tokensPruebaPlantilla.join(", ")}</div>}
      <div style={{padding:12,background:"#fff",color:"#1f2937",borderRadius:8,border:"1px solid #d1d5db",fontSize:12,lineHeight:1.65,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{textoPruebaPlantilla.split(/(\{\{[^}]+\}\})/g).map(function(part,i){return /\{\{[^}]+\}\}/.test(part)?<span key={i} style={{background:"#fee2e2",color:"#b91c1c",fontWeight:800,borderRadius:3,padding:"0 2px"}}>{part}</span>:<span key={i}>{part}</span>;})}</div>
    </div></div>,document.body)}
    {status&&<div style={{marginBottom:9,fontSize:12,color:status==="error"?"var(--red)":status==="saved"?"var(--green)":"var(--gold)"}}>{status==="saving"?"Guardando cambios…":status==="saved"?"Cambios guardados ✓":"No se pudo guardar el modelo del documento."}</div>}
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      <style>{DW_MODEL_CLAUSES_UI_CSS + DW_MODEL_CLAUSES_V489_CSS}</style>
            {draft.map(function(b,idx){var editing=editId===b.id;var numeroActivo=draft.slice(0,idx+1).filter(function(x){return x.activo!==false&&x.obligatoria===true;}).length;var esCondicional=!!(b.condicion||b.condicional);var filaAbierta=modoVistaClausulas==="abierta"?clausulasAbiertas[b.id]!==false:!!clausulasAbiertas[b.id];return <div key={b.id} className={"dw-clause-card "+(modoVistaClausulas==="simple"?"dw-clause-compact":"dw-clause-detail")+(filaAbierta?" dw-clause-open":"")} style={{border:"1px solid "+(editing?"rgba(212,168,83,.40)":"var(--border2)"),borderRadius:10,padding:modoVistaClausulas==="simple"?"6px 9px":11,background:editing?"rgba(212,168,83,.035)":"var(--card)"}}>
        <div style={{display:"flex",alignItems:modoVistaClausulas==="simple"?"center":"flex-start",gap:9,minWidth:0}}>
          <div style={{minWidth:28,height:28,borderRadius:8,background:"rgba(212,168,83,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"var(--gold)",flexShrink:0,padding:"0 5px",boxSizing:"border-box"}}><span title={b.obligatoria&&b.activo!==false?"Cláusula "+numeroActivo:""}>{b.activo===false?"—":(b.obligatoria?numeroActivo:"—")}</span></div>
          <div style={{flex:1,minWidth:0}}>
            {editing&&tipo==="reserva"&&b.id==="reserva.precio" ? <PrecioNarrativaEditor bloque={b} onSave={function(cambios){return persist(draft.map(function(x){return x.id===b.id?Object.assign({},x,cambios):x;}));}} onCancel={cancelarBorrador} onSaved={function(){setEditId(null);}}/> : editing ? <div style={{display:"flex",flexDirection:"column",gap:7}}><input className="inp" value={b.titulo} disabled={!puedeEditar} onChange={function(e){setDraft(draft.map(function(x){return x.id===b.id?Object.assign({},x,{titulo:e.target.value}):x;}));}}/><textarea ref={contenidoEditorRef} className="inp" style={{minHeight:120,resize:"vertical",lineHeight:1.6}} value={b.contenido} disabled={!puedeEditar} onChange={function(e){setDraft(draft.map(function(x){return x.id===b.id?Object.assign({},x,{contenido:e.target.value}):x;}));}}/><div style={{padding:10,borderRadius:10,border:"1px solid var(--border)",background:"var(--card2, rgba(127,127,127,.035))"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginBottom:7}}><div style={{fontSize:12,fontWeight:750,color:"var(--text)"}}>Insertar campo automático</div><span style={{fontSize:11,color:"var(--dim)"}}>{tokens.filter(function(t){return tokensDeTextoDocWorks(b.contenido).indexOf(t[0])===-1;}).length} disponibles</span></div><div style={{fontSize:11.5,color:"var(--dim)",lineHeight:1.45,marginBottom:8}}>Elegí un campo para insertarlo donde está el cursor. Los campos ya usados se ocultan; si los borrás del texto, vuelven a aparecer.</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{tokens.filter(function(t){return tokensDeTextoDocWorks(b.contenido).indexOf(t[0])===-1;}).map(function(t){return <button key={t[0]} type="button" onMouseDown={function(e){e.preventDefault();}} onClick={function(){insertToken(t[0]);}} style={{display:"inline-flex",alignItems:"center",gap:5,minHeight:30,padding:"5px 9px",borderRadius:999,border:"1px solid var(--border2, rgba(89,199,243,.28))",background:"var(--card, rgba(89,199,243,.055))",color:"var(--text)",fontSize:11.5,fontWeight:600,cursor:"pointer"}}><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:999,background:"rgba(89,199,243,.13)",color:"#59c7f3",fontSize:13,lineHeight:1}}>+</span>{t[1]}</button>;})}{tokens.every(function(t){return tokensDeTextoDocWorks(b.contenido).indexOf(t[0])!==-1;})&&<div style={{fontSize:11.5,color:"var(--green)"}}>Ya están usados todos los campos disponibles.</div>}</div></div><div style={{fontSize:11.5,color:"var(--dim)",lineHeight:1.45}}>Los campos se completan automáticamente desde la operación al generar el documento.</div><div style={{display:"flex",justifyContent:"flex-end",gap:6,flexWrap:"wrap"}}><Btn s="sm" v="ghost" onClick={function(){restaurarBloque(editId);}}>↺ Restaurar esta cláusula</Btn><Btn s="sm" v="ghost" onClick={cancelarBorrador}>Cancelar</Btn><Btn s="sm" v="success" onClick={function(){guardarClausula();}}>Guardar cláusula</Btn></div></div> : <><div className="dw-model-clause-row" style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:modoVistaClausulas==="simple"?"nowrap":"wrap",gap:7,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"nowrap",flex:"1 1 auto",minWidth:0,overflow:"hidden"}}><button type="button" className="dw-clause-toggle" onClick={function(){setClausulasAbiertas(function(prev){var next=Object.assign({},prev);next[b.id]=!filaAbierta;return next;});}} aria-expanded={filaAbierta} aria-label={(filaAbierta?"Contraer ":"Desplegar ")+(b.titulo||"cláusula")} style={{fontSize:12.2,fontWeight:650,color:"var(--text)",border:0,padding:"6px 0",background:"transparent",textAlign:"left",cursor:"pointer",whiteSpace:modoVistaClausulas==="simple"?"nowrap":"normal",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}><span className="dw-clause-name">{b.titulo||"Cláusula sin título"}</span></button>{esClausulaEsencialModelo(b)&&<span className="dw-essential-label" title="Cláusula esencial del documento: se puede editar, pero no desactivar ni eliminar"><span aria-hidden="true">🔒</span><span>Obligatoria</span></span>}{!esClausulaEsencialModelo(b)&&b.obligatoria===true&&<span className="dw-essential-label dw-essential-label-soft" title="Cláusula obligatoria configurada por la inmobiliaria"><span aria-hidden="true">🔒</span><span>Obligatoria</span></span>}{esCondicional&&modoVistaClausulas!=="simple"&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:999,background:"rgba(89,199,243,.10)",color:"#59c7f3",border:"1px solid rgba(89,199,243,.18)"}}>Condicional</span>}{b.activo===false&&modoVistaClausulas!=="simple"&&<span className="badge">Inactiva</span>}<button type="button" className={"dw-clause-chevron "+(filaAbierta?"is-open":"")} aria-label={(filaAbierta?"Contraer ":"Desplegar ")+(b.titulo||"cláusula")} aria-expanded={filaAbierta} onClick={function(){setClausulasAbiertas(function(prev){return Object.assign({},prev,{[b.id]:!filaAbierta});});}}><span aria-hidden="true">⌄</span></button></div><div className="dw-clause-actions" style={{display:"flex",gap:4,flex:"0 1 auto",flexWrap:"nowrap",alignItems:"center"}}><button type="button" title="Subir" onClick={function(){move(idx,"up");}} disabled={!puedeEditar||idx===0} style={{border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",borderRadius:6,padding:"3px 6px",cursor:"pointer"}}>↑</button><button type="button" title="Bajar" onClick={function(){move(idx,"down");}} disabled={!puedeEditar||idx===draft.length-1} style={{border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",borderRadius:6,padding:"3px 6px",cursor:"pointer"}}>↓</button>{puedeVerHistorial&&<button type="button" title="Historial de la cláusula" onClick={function(){setHistorialSeleccionado(b);}} style={{border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",borderRadius:6,padding:"3px 6px",cursor:"pointer",fontSize:10.5,whiteSpace:"nowrap"}}>Historial</button>}{puedeEditar&&!esClausulaEsencialModelo(b)&&<select aria-label={"Estado de la cláusula "+(b.titulo||"")} value={b.activo===false?"apagada":(b.id==="reserva.refuerzo"||b.id==="alquiler.seguro")&&b.obligatoria!==true?"asesor":b.obligatoria===true?"obligatoria":"apagada"} onChange={function(e){var estado=e.target.value;update(b.id,estado==="apagada"?{activo:false}:estado==="asesor"?{activo:true,obligatoria:false}:{activo:true,obligatoria:true});}} style={{maxWidth:155,minWidth:0,width:"100%",fontSize:11,padding:"5px 4px",borderRadius:7,border:"1px solid var(--border2)",background:"var(--card)",color:"var(--text)"}}><option value="obligatoria">Obligatoria</option><option value="asesor" disabled={b.id!=="reserva.refuerzo"&&b.id!=="alquiler.seguro"}>El asesor elige</option><option value="apagada">Apagada</option></select>}{puedeEditar&&<button type="button" title="Editar" onClick={function(){if(!editId&&status!=="saving")setEditId(b.id);}} style={{border:"1px solid rgba(212,168,83,.25)",background:"rgba(212,168,83,.06)",color:"var(--gold)",borderRadius:6,padding:"3px 7px",cursor:"pointer"}}>Editar</button>}{puedeEditar&&!esClausulaEsencialModelo(b)&&<button type="button" title="Eliminar" onClick={function(){removeBlock(b.id);}} style={{border:"1px solid rgba(248,113,113,.2)",background:"transparent",color:"var(--red)",borderRadius:6,padding:"3px 7px",cursor:"pointer"}}>×</button>}</div></div>{filaAbierta&&<div className="dw-clause-content" style={{fontSize:12,color:"var(--muted)",lineHeight:1.6,marginTop:7,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{mostrarTokensDocWorks(b.contenido)}</div>}</>}
          </div>
        </div>
      </div>;})}
      {draft.length===0&&<div style={{padding:18,textAlign:"center",border:"1px dashed var(--border)",borderRadius:10,color:"var(--dim)",fontSize:12}}>No hay cláusulas. Agregá una para comenzar.</div>}
    </div>
    {draft.some(function(b){return b.condicion||b.condicional;})&&<div style={{fontSize:11.5,color:"var(--dim)",padding:"8px 10px",borderRadius:8,background:"rgba(212,168,83,.06)",border:"1px solid rgba(212,168,83,.18)"}}>El número en el documento final puede cambiar si una cláusula condicional no aplica.</div>}
    <div style={{fontSize:11.5,color:"var(--dim)",padding:"8px 10px",borderRadius:8,border:"1px solid var(--border)",lineHeight:1.5}}>El estado «Opcional» está disponible únicamente para las cláusulas condicionales que ya se activan desde la operación (refuerzo de reserva y seguro de alquiler). En las demás cláusulas del cuerpo, la opción permanece deshabilitada hasta contar con soporte real en la operación.</div>
    <div style={{marginTop:12,padding:10,borderRadius:10,background:"rgba(89,199,243,.035)",border:"1px solid rgba(89,199,243,.14)"}}><div style={{fontSize:12,fontWeight:750,color:"#59c7f3",marginBottom:5}}>VARIABLES AUTOMÁTICAS</div><div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5}}>Usá los botones dentro de cada cláusula para insertar campos que vienen de Operaciones. El usuario edita la redacción; DocWorks completa los datos al generar el documento.</div></div>
    {historialSeleccionado&&<HistorialClausulaModal titulo={historialSeleccionado.titulo} source="perfil" historial={perfil&&perfil.plantillas&&perfil.plantillas[tipo]&&perfil.plantillas[tipo].historial_clausulas&&perfil.plantillas[tipo].historial_clausulas[historialSeleccionado.id]} actual={historialSeleccionado} onClose={function(){setHistorialSeleccionado(null);}} onRestore={function(v){var next=draft.map(function(b){return b.id===historialSeleccionado.id?Object.assign({},b,{titulo:v.titulo,contenido:v.contenido,activo:v.activo!==false,orden:v.orden,obligatoria:typeof v.obligatoria==="boolean"?v.obligatoria:b.obligatoria,condicion:Object.prototype.hasOwnProperty.call(v,"condicion")?v.condicion:b.condicion,sinTitulo:typeof v.sinTitulo==="boolean"?v.sinTitulo:b.sinTitulo}):Object.assign({},b);});var pos=next.findIndex(function(b){return b.id===historialSeleccionado.id;});if(pos>=0){var item=next.splice(pos,1)[0];next.splice(Math.max(0,Math.min(next.length,(Number(v.orden)||1)-1)),0,item);}next=next.map(function(b,i){return Object.assign({},b,{orden:i+1});});return persist(next);}}/>}
  </div>;
}

const DW_MODEL_CLAUSES_UI_CSS = '\n/* DocWorks 4.91 PRO — legibilidad de cláusulas obligatorias en tablet y teléfono */\n.dw-essential-label{display:inline-flex;align-items:center;gap:4px;flex:0 0 auto;padding:3px 7px;border:1px solid rgba(212,168,83,.25);border-radius:999px;background:rgba(212,168,83,.075);color:var(--gold);font-size:10.5px;font-weight:650;line-height:1.2;white-space:nowrap}\n.dw-essential-label-soft{border-color:var(--border2);background:var(--surface2);color:var(--muted)}\n.dw-model-clause-row>div:first-child{min-width:0;flex:1 1 auto}\n.dw-model-clause-row>div:first-child>button{flex:0 1 auto;min-width:0}\n@media (min-width:641px) and (max-width:1100px){\n .dw-model-clause-row{align-items:flex-start!important;flex-wrap:wrap!important;row-gap:8px!important}\n .dw-model-clause-row>div:first-child{flex-basis:100%!important}\n .dw-model-clause-row>div:nth-child(2){display:flex!important;width:100%;justify-content:flex-end;flex-wrap:wrap!important}\n .dw-model-clause-row select{width:auto!important;min-width:128px!important}\n}\n@media(max-width:640px){\n .dw-model-clause-row{flex-wrap:wrap!important;gap:7px!important}\n .dw-model-clause-row>div:first-child{flex-basis:100%!important}\n .dw-model-clause-row>div:nth-child(2){display:flex!important;width:100%;justify-content:flex-end;flex-wrap:wrap!important}\n .dw-essential-label{font-size:10px;padding:3px 6px}\n}\n';

const DW_MODEL_CLAUSES_V489_CSS = `
/* DocWorks 4.91: Reserva uses the same compact/detailed visual language. */
.dw-reserva-clause{min-width:0;transition:border-color .18s ease,background .18s ease}
.dw-reserva-compact:not(.dw-reserva-open) .dw-reserva-clause-actions{display:none!important}
.dw-reserva-compact.dw-reserva-open>.dw-reserva-clause-actions{display:flex!important}
.dw-reserva-clause button:focus-visible,.dw-clause-chevron:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
@media(max-width:640px){.dw-reserva-compact .dw-essential-label{font-size:9px;padding:2px 5px}.dw-reserva-compact .dw-clause-chevron{width:25px;height:25px;flex-basis:25px}}

/* DocWorks 4.91: hoja compacta y tarjetas detalladas, responsive */
.dw-clause-card{transition:border-color .18s ease,background .18s ease;min-width:0}
.dw-clause-compact{box-shadow:none}
.dw-clause-detail{box-shadow:0 1px 3px rgba(0,0,0,.035)}
.dw-clause-toggle{flex:1 1 auto!important;display:block;min-width:0;line-height:1.4}
.dw-clause-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dw-clause-detail .dw-clause-name{white-space:normal;overflow-wrap:anywhere}
.dw-clause-chevron{width:29px;height:29px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border2);background:var(--surface2);border-radius:8px;color:var(--muted);cursor:pointer;flex:0 0 29px;font-size:21px;line-height:1;transition:transform .18s ease,border-color .18s ease}
.dw-clause-chevron span{display:block;transform:translateY(-3px)}
.dw-clause-chevron.is-open{border-color:rgba(212,168,83,.38);transform:rotate(180deg)}
.dw-clause-compact .dw-model-clause-row{flex-wrap:nowrap!important;align-items:center!important}
.dw-clause-compact .dw-model-clause-row>div:first-child{flex-basis:auto!important;width:auto!important;min-width:0}
.dw-clause-compact .dw-model-clause-row>div.dw-clause-actions{display:flex!important;flex:0 0 auto;overflow-x:auto;max-width:48%;scrollbar-width:thin}
.dw-clause-compact.dw-clause-open .dw-model-clause-row{flex-wrap:wrap!important}
.dw-clause-compact.dw-clause-open .dw-model-clause-row>div.dw-clause-actions{display:flex!important;flex-basis:auto;justify-content:flex-end}
.dw-clause-compact .dw-essential-label{font-size:10px;padding:2px 6px}
.dw-clause-content{border-top:1px solid var(--border);padding-top:9px}
@media(min-width:641px) and (max-width:1100px){.dw-clause-compact:not(.dw-clause-open) .dw-model-clause-row{flex-wrap:nowrap!important}.dw-clause-compact:not(.dw-clause-open) .dw-model-clause-row>div:first-child{flex-basis:auto!important}}
@media(max-width:640px){.dw-clause-compact:not(.dw-clause-open) .dw-model-clause-row{flex-wrap:nowrap!important}.dw-clause-compact:not(.dw-clause-open) .dw-model-clause-row>div:first-child{flex-basis:auto!important}.dw-clause-compact .dw-essential-label{font-size:9px}.dw-clause-compact .dw-clause-chevron{width:26px;height:26px;flex-basis:26px}}
/* 6.00: el título tiene prioridad; las acciones aparecen al desplegar. */
.dw-clause-compact:not(.dw-clause-open) .dw-model-clause-row>div.dw-clause-actions{display:none!important}
.dw-clause-compact .dw-clause-name{white-space:normal;overflow-wrap:anywhere;text-overflow:clip}
.dw-clause-compact .dw-clause-toggle{padding:8px 0!important}
.dw-clause-compact.dw-clause-open .dw-model-clause-row{flex-wrap:wrap!important}
.dw-clause-compact.dw-clause-open .dw-model-clause-row>div:first-child{flex-basis:100%!important}
.dw-clause-compact.dw-clause-open .dw-model-clause-row>div.dw-clause-actions{max-width:100%;width:100%;flex-wrap:wrap!important;overflow:visible}
@media(max-width:1100px){.dw-clause-chevron{min-width:36px;min-height:36px}.dw-clause-actions button{min-height:34px}.dw-clause-actions select{min-height:34px}}
@media(prefers-reduced-motion:reduce){.dw-clause-chevron,.dw-clause-card{transition:none}}
`;

function EncabezadoFijadoPanel({perfil,onSavePerfil,clausulas,tipoDocExterno,onTipoDocChange,ocultarSelector,barraSuperior,previewOpen,onPreviewChange,children,pasoModelo,mostrarCuerpo,mostrarIntroduccion,onEditingChange,modeloEnEdicion}) {
  const [tipoDocInterno,setTipoDocInterno]=useState("reserva");
  const tipoDocSel=tipoDocExterno||tipoDocInterno;
  function setTipoDocSel(v){if(typeof onTipoDocChange==="function")onTipoDocChange(v);else setTipoDocInterno(v);}
  const [encabezadoEditing,setEncabezadoEditing]=useState(false);
  const [encabezadoDraft,setEncabezadoDraft]=useState("");
  const [confirmLockDefaults,setConfirmLockDefaults]=useState(false);
  const [confirmPreviewReviewed,setConfirmPreviewReviewed]=useState(false);
  const [saveStatus,setSaveStatus]=useState(null);
  useEffect(function(){if(onEditingChange)onEditingChange(encabezadoEditing||saveStatus==="saving");},[encabezadoEditing,saveStatus,onEditingChange]);
  useEffect(function(){
    if(!encabezadoEditing&&saveStatus!=="saving")return;
    function advertirSalida(e){e.preventDefault();e.returnValue="";}
    function protegerSalida(e){
      if(e.defaultPrevented)return;
      e.preventDefault();
      if(saveStatus==="saving"){dwNotify("info","Esperá a que termine de guardarse el documento.");return;}
      requestDwConfirm("¿Descartar los cambios sin guardar antes de salir del documento?",function(){setEncabezadoEditing(false);setEncabezadoDraft("");e.detail.continuar();});
    }
    window.addEventListener("beforeunload",advertirSalida);
    window.addEventListener("dw:model-navigation",protegerSalida);
    return function(){window.removeEventListener("beforeunload",advertirSalida);window.removeEventListener("dw:model-navigation",protegerSalida);};
  },[encabezadoEditing,saveStatus]);
  const puedeEditar=!!perfil&&(perfil.rol==="dueno"||perfil.rol==="admin");
  const cfg=obtenerPlantillaConfig(perfil,tipoDocSel,clausulas);
  const idsPlantilla=cfg.clausulas_ids||[];
  const listaPlantilla=idsPlantilla.map(function(id){return (clausulas||[]).find(function(c){return c.id===id;});}).filter(Boolean);
  const disponibles=(clausulas||[]).filter(function(c){return clausulaAplicaTipo(c,tipoDocSel)&&idsPlantilla.indexOf(c.id)===-1;});
  const customMap=(perfil&&perfil.encabezados_custom)||{};
  const customTexto=customMap[tipoDocSel]||"";
  function persistir(next){
    setSaveStatus("saving");
    return Promise.resolve().then(function(){return onSavePerfil(next);}).then(function(res){
      if(res&&res.error){setSaveStatus("error");return {error:res.error};}
      setSaveStatus("saved");return {ok:true};
    }).catch(function(err){setSaveStatus("error");return {error:err};});
  }
  function actualizarPlantilla(changes){
    if(!puedeEditar)return Promise.resolve({error:new Error("Sin permisos")});
    var mapa=Object.assign({},perfil.plantillas||{});
    var actual=Object.assign({},mapa[tipoDocSel]||{}, {clausulas_ids:idsPlantilla.slice(),locked:false,version:obtenerVersionPlantilla(perfil,tipoDocSel)});
    actual=Object.assign(actual,changes||{});
    var next=Object.assign({},perfil,{plantillas:Object.assign({},mapa,{[tipoDocSel]:actual}),clausulas_default_ids:actual.clausulas_ids.slice(),clausulas_default_locked:!!actual.locked});
    return persistir(next);
  }
  function agregarClausula(id){if(!puedeEditar||!id||idsPlantilla.indexOf(id)!==-1)return;actualizarPlantilla({clausulas_ids:idsPlantilla.concat([id]),locked:false});}
  function quitarClausula(id){if(!puedeEditar)return;actualizarPlantilla({clausulas_ids:idsPlantilla.filter(function(x){return x!==id;}),locked:false});}
  function moverClausula(id,delta){
    if(!puedeEditar)return;
    var arr=idsPlantilla.slice(),i=arr.indexOf(id),j=i+delta;
    if(i<0||j<0||j>=arr.length)return;
    var tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;actualizarPlantilla({clausulas_ids:arr,locked:false});
  }
  async function guardarModelo(){
    if(!puedeEditar||saveStatus==="saving"||encabezadoEditing||modeloEnEdicion)return;
    var mapa=Object.assign({},perfil.plantillas||{}),versionAnterior=obtenerVersionPlantilla(perfil,tipoDocSel),ahora=new Date().toISOString();
    var anterior=mapa[tipoDocSel]||{};
    var historial=Array.isArray(anterior.historial_versiones)?anterior.historial_versiones.slice():[];
    if(versionAnterior>0&&(anterior.version_publicada_en||anterior.locked)){
      historial.unshift({version:versionAnterior,guardada_en:anterior.version_publicada_en||anterior.version_updated_at||ahora,
        introduccion:(perfil.encabezados_custom||{})[tipoDocSel]||DEFAULT_ENCABEZADOS[tipoDocSel]||"",
        clausulas_ids:(anterior.clausulas_ids||idsPlantilla).slice(),
        obligatorias_ids:(Array.isArray(anterior.obligatorias_ids)?anterior.obligatorias_ids:[]).slice(),
        clausulas:(clausulas||[]).filter(function(c){return (anterior.clausulas_ids||idsPlantilla).indexOf(c.id)!==-1||(Array.isArray(anterior.obligatorias_ids)&&anterior.obligatorias_ids.indexOf(c.id)!==-1);}).map(function(c){return {id:c.id,titulo:c.titulo,contenido:c.contenido,obligatoria:!!c.obligatoria,categoria:c.categoria};}),
        body_blocks:Array.isArray(anterior.body_blocks)?JSON.parse(JSON.stringify(anterior.body_blocks)):[],
        frecuentes_ids:Array.isArray(anterior.frecuentes_ids)?anterior.frecuentes_ids.slice():[]});
    }
    var nueva=Object.assign({},anterior,{clausulas_ids:idsPlantilla.slice(),locked:false,version:versionAnterior+1,version_updated_at:ahora,version_publicada_en:ahora,historial_versiones:historial.slice(0,30)});
    var res=await persistir(Object.assign({},perfil,{plantillas:Object.assign({},mapa,{[tipoDocSel]:nueva}),clausulas_default_ids:idsPlantilla.slice(),clausulas_default_locked:false}));
    if(res&&res.error){dwNotify("error","No se pudo guardar el modelo. Revisá la conexión.");return;}
    dwNotify("success","Modelo guardado. Se utilizará en las nuevas operaciones.");
  }
  function guardarEncabezado(texto){
    var mapa=Object.assign({},customMap);mapa[tipoDocSel]=texto;
    return persistir(Object.assign({},perfil,{encabezados_custom:mapa})).then(function(res){if(!(res&&res.error))setEncabezadoEditing(false);return res;});
  }
  function restablecerEncabezado(){
    var mapa=Object.assign({},customMap);delete mapa[tipoDocSel];
    return persistir(Object.assign({},perfil,{encabezados_custom:mapa})).then(function(res){if(!(res&&res.error)){setEncabezadoDraft("");setEncabezadoEditing(false);}return res;});
  }
  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
    {barraSuperior&&<div id="dw-config-modelo" style={{padding:"8px 2px",fontSize:13,fontWeight:700,color:"var(--text)"}}>{TIPOS[tipoDocSel]||tipoDocSel}</div>}
    {!puedeEditar&&<div className="notice" style={{fontSize:12}}>Esta configuración es de solo lectura. Solo Dueño y Administrador pueden editar encabezados y cláusulas.</div>}
    {pasoModelo===3&&mostrarIntroduccion!==false&&<div id="dw-config-introduccion" className="card" style={{padding:14,scrollMarginTop:90}}>
      <div style={{fontSize:15,fontFamily:"DM Serif Display,serif",color:"var(--text)"}}>Introducción</div>
      <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,margin:"5px 0 12px"}}>Los datos se completan desde la operación.</div>
      {!ocultarSelector&&<label className="field" style={{display:"block",marginBottom:10}}><span className="field-label">Tipo de documento</span><select className="inp" value={tipoDocSel} onChange={function(e){setTipoDocSel(e.target.value);setEncabezadoEditing(false);setEncabezadoDraft("");}} style={{width:"100%"}}>{PLANTILLA_TIPOS.map(function(tipo){return <option key={tipo} value={tipo}>{TIPOS[tipo]||tipo}</option>;})}</select></label>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginBottom:8}}><span className="badge" style={{background:customTexto?"rgba(212,168,83,.10)":"rgba(74,222,128,.08)",color:customTexto?"var(--gold)":"var(--green)"}}>{customTexto?"Personalizado":"Predeterminado"}</span>{puedeEditar&&!encabezadoEditing&&<div style={{display:"flex",gap:6}}><button type="button" className="btn btn-secondary btn-sm" onClick={function(){setEncabezadoDraft(getEncabezadoTemplate(tipoDocSel,perfil));setEncabezadoEditing(true);}}>Editar introducción</button>{customTexto&&<button type="button" className="btn btn-secondary btn-sm" onClick={restablecerEncabezado}>Restablecer</button>}</div>}</div>
      {encabezadoEditing&&puedeEditar?<EncabezadoEditor tipo={tipoDocSel} value={encabezadoDraft||getEncabezadoTemplate(tipoDocSel,perfil)} onCancel={function(){setEncabezadoEditing(false);setEncabezadoDraft("");}} onRestablecer={function(){setEncabezadoDraft(DEFAULT_ENCABEZADOS[tipoDocSel]||"");}} onSave={guardarEncabezado}/>:<div style={{padding:"10px 11px",borderRadius:8,background:"rgba(255,255,255,.025)",border:"1px solid var(--border2)",fontSize:12,color:"var(--muted)",lineHeight:1.55,whiteSpace:"pre-wrap"}}>{sustituirTokens(customTexto||DEFAULT_ENCABEZADOS[tipoDocSel]||"Sin introducción predeterminada para este tipo.",SAMPLE_OP_PREVIEW,perfil,tipoDocSel).slice(0,650)}{(customTexto||DEFAULT_ENCABEZADOS[tipoDocSel]||"").length>650?"…":""}</div>}
      {saveStatus==="saving"&&<div style={{fontSize:12,color:"var(--dim)",marginTop:8}}>Guardando cambios…</div>}{saveStatus==="saved"&&<div style={{fontSize:12,color:"var(--green)",marginTop:8}}>Cambios guardados.</div>}{saveStatus==="error"&&<div style={{fontSize:12,color:"var(--red)",marginTop:8}}>No se pudo guardar. Revisá la conexión e intentá nuevamente.</div>}
    </div>}
    {(pasoModelo===2||pasoModelo===3)&&<div id="dw-config-clausulas" style={{scrollMarginTop:90,border:"1px solid var(--border)",borderRadius:12,padding:12,display:"flex",flexDirection:"column",gap:12}}>
      {children}

    </div>}
    {barraSuperior&&<div className="card" data-testid="dw-model-actions" style={{padding:14,display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
        <button type="button" data-testid="dw-open-fullpage-preview" className="btn btn-secondary" onClick={function(){if(typeof onPreviewChange==="function")onPreviewChange(true);}}>Vista previa</button>
        {puedeEditar&&<button type="button" className="btn btn-primary" disabled={saveStatus==="saving"||encabezadoEditing||!!modeloEnEdicion} onClick={guardarModelo}>{saveStatus==="saving"?"Guardando…":"Guardar cambios"}</button>}
      </div>
      <div style={{fontSize:12,color:"var(--dim)",textAlign:"right"}}>{saveStatus==="saved"?"Modelo guardado correctamente.":saveStatus==="error"?"No se pudo guardar el modelo.":encabezadoEditing||modeloEnEdicion?"Terminá la edición antes de guardar.":"Los cambios se aplicarán a las nuevas operaciones."}</div>
    </div>}
  </div>;
}


const DEFAULT_PERFIL={nombre:"",nombre_usuario:"",matricula:"",telefono:"",email:"",logoDataUrl:"",logoPosicion:"derecha",logoScale:100,cuit:"",direccion:"",web:"",ubicacion_inmobiliaria_activa:false,ubicacion_inmobiliaria_posicion:"pie",rol:"dueno",pie_pagina_texto:"",pie_pagina_leyenda_activa:true,pie_pagina_logo_debajo:false,pie_pagina_logo_posicion:"centro",pie_pagina_logo_scale:100,pie_pagina_numero_activo:true,pie_pagina_numero_posicion:"derecha",broker_split_pct:50,broker_split_mode:"uniforme",broker_splits:{},broker_fotos:{},broker_perfiles:{},soporte_email:"",ranking_interno_activo:false,clausulas_default_ids:[],plantillas:{},colorPrimario:"#142a4d",colorSecundario:"#c9a227",plantillaEstilo:"corporativo",logo_encabezado_activo:true,encabezados_custom:{}};

// ── ESTILOS DE PLANTILLA (personalización por inmobiliaria) ─────────────────
// 3 estilos posibles para PDF/DOCX: minimalista (sobrio, mucho blanco, acento
// fino), corporativo (barra de color de marca, rótulos en color) y clásico
// (tipografía serif, doble filete, sin color — estilo escribanía tradicional).
// Dos opciones claras para nuevas configuraciones. Se conserva el identificador
// «corporativo» para el diseño Moderno y «clasico» para Tradicional: así no se
// alteran los perfiles guardados ni los generadores PDF/DOCX existentes.
// «minimalista» permanece compatible con documentos y perfiles anteriores.
const PLANTILLA_ESTILOS = [
  {id:"corporativo",label:"Moderno",desc:"Diseño editorial, identidad de marca y lectura clara",icon:"◆"},
  {id:"clasico",label:"Tradicional",desc:"Presentación sobria, tipografía clásica y estilo formal",icon:"§"},
];

const DEFAULT_EQUIPO=[
  {id:"m1",nombre:"Romina García",email:"romina@inmobiliaria.com",telefono:"+54 9 11 3333-0002",rol:"broker",estado:"activo",created_at:new Date().toISOString()},
  {id:"m2",nombre:"Lucas Herrera",email:"lucas@inmobiliaria.com",telefono:"+54 9 11 4444-0003",rol:"vendedor",estado:"activo",created_at:new Date().toISOString()},
];
// ── AUTH / SESIÓN (Fase 1 SaaS) ───────────────────────────────────────────────
// Pantallas nuevas, aisladas del resto de la app. No dependen de `perfil`,
// `equipo` ni de ninguna otra pieza existente — solo de la sesión de Supabase.

// Nota: usamos únicamente variables CSS que YA existen en GS (GStyles):
// --bg, --surface, --card, --border, --border2, --text, --muted, --dim,
// --gold, --gold2, --teal, --red, --green, --amber. Nada inventado, y todo
// texto lleva color explícito (nunca heredado) para que funcione igual con
// GStyles montado o no, y en modo claro u oscuro.
var AUTH_BG     = "#050914";
var AUTH_CARD   = "#0b1424";
var AUTH_BORDER = "rgba(157,180,215,0.22)";
var AUTH_TEXT   = "#f3f6fc";
var AUTH_MUTED  = "#a7b5ca";
var AUTH_GOLD   = "var(--gold,#d4a853)";
var AUTH_RED    = "var(--red,#f87171)";

function AuthLoadingScreen({ error, onRetry }){
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 50% 0%, #142747 0%, #070d19 48%, #03060d 100%)",color:AUTH_TEXT,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:"center",fontSize:13,maxWidth:320,padding:16}}>
        {error ? (
          <>
            <div style={{fontSize:26,marginBottom:10}}>⚠️</div>
            <div style={{color:AUTH_RED,fontWeight:600,marginBottom:14}}>{error}</div>
            <button onClick={onRetry} style={{padding:"9px 16px",borderRadius:9,border:"1px solid "+AUTH_BORDER,background:"transparent",color:AUTH_TEXT,fontSize:13,cursor:"pointer"}}>Reintentar</button>
          </>
        ) : (
          <>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:30,color:"#d4a853",letterSpacing:".01em",marginBottom:6}}>DocWorks</div>
            <div className="dw-spin" style={{margin:"10px auto 12px"}}/>
            <div style={{color:AUTH_MUTED}}>Conectando…</div>
            <div style={{color:AUTH_MUTED,opacity:.55,fontSize:11,marginTop:8}}>v{DOCWORKS_VERSION}</div>
          </>
        )}
      </div>
    </div>
  );
}

// Traduce mensajes de error crudos (de Postgres, PostgREST o del navegador,
// que llegan siempre en inglés) a algo legible en español. Los mensajes que
// ya vienen en español (los que arman nuestras propias funciones con
// `raise exception 'Texto...'`) no matchean ningún patrón de acá y se
// devuelven sin tocar.
function traducirError(msg){
  var original = msg || "";
  var m = original.toLowerCase();
  if (!m) return "Ocurrió un error inesperado. Intentá de nuevo.";
  if (m.indexOf("currently experiencing high demand")>-1 || m.indexOf("service unavailable")>-1 || m.indexOf("status: \"unavailable\"")>-1 || m.indexOf("503")>-1) return "El servicio de IA está temporalmente saturado. DocWorks intentó una alternativa; esperá unos segundos y volvé a probar.";
  if (m.indexOf("load failed")>-1 || m.indexOf("failed to fetch")>-1 || m.indexOf("networkerror")>-1 || m.indexOf("network request failed")>-1) {
    return "No se pudo conectar con Supabase (error de red del navegador). Si abriste este archivo con doble clic desde tu disco, tenés que servirlo por http(s):// — los navegadores bloquean estos pedidos desde archivos locales. Si ya lo estás sirviendo por http(s), puede ser una extensión, VPN o firewall bloqueando xpjiydwjawjizubyldtk.supabase.co.";
  }
  if (m.indexOf("invalid login credentials")>-1) return "Correo electrónico o contraseña incorrectos.";
  if (m.indexOf("email not confirmed")>-1) return "Todavía no confirmaste tu correo electrónico.";
  if (m.indexOf("jwt expired")>-1 || m.indexOf("invalid jwt")>-1 || (m.indexOf("jwt")>-1 && m.indexOf("expired")>-1)) return "Tu sesión expiró. Iniciá sesión de nuevo.";
  if (m.indexOf("permission denied")>-1 || m.indexOf("new row violates row-level security")>-1 || m.indexOf("row-level security")>-1 || m.indexOf("pgrst301")>-1) return "No tenés permiso para realizar esta acción.";
  if (m.indexOf("pgrst116")>-1 || m.indexOf("json object requested, multiple (or no) rows returned")>-1) return "No se encontró el registro solicitado o ya no está disponible.";
  if (m.indexOf("pgrst204")>-1 || m.indexOf("could not find the")>-1 && m.indexOf("column")>-1) return "La versión del servidor no coincide con los datos de la aplicación. Contactá soporte.";
  if (m.indexOf("pgrst")>-1 || m.indexOf("postgrest")>-1) return "El servidor rechazó la solicitud. Revisá los datos e intentá nuevamente.";
  if (m.indexOf("duplicate key")>-1 || m.indexOf("already exists")>-1) return "Ya existe un registro con ese valor.";
  if (m.indexOf("violates foreign key constraint")>-1) return "La operación hace referencia a un registro que no existe o fue eliminado.";
  if (m.indexOf("violates not-null constraint")>-1 || m.indexOf("null value in column")>-1) return "Falta completar un campo obligatorio.";
  if (m.indexOf("invalid input syntax")>-1 || m.indexOf("invalid input value")>-1 || m.indexOf("invalid value")>-1) return "Uno de los valores ingresados no tiene el formato correcto.";
  if (m.indexOf("value too long")>-1) return "Uno de los campos ingresados es demasiado largo.";
  if (m.indexOf("function")>-1 && m.indexOf("does not exist")>-1) return "Error de comunicación con el servidor (función no encontrada). Contactá soporte.";
  if (m.indexOf("timeout")>-1 || m.indexOf("timed out")>-1) return "La operación tardó demasiado. Intentá de nuevo.";
  if (m.indexOf("column")>-1 && m.indexOf("does not exist")>-1) return "Error de comunicación con el servidor (columna no encontrada). Contactá soporte.";
  if (m.indexOf("schema cache")>-1 || m.indexOf("could not find the relation")>-1 || m.indexOf("relation")>-1 && m.indexOf("does not exist")>-1) return "Error de comunicación con el servidor (recurso no encontrado). Contactá soporte.";
  if (m.indexOf("user already registered")>-1 || m.indexOf("already registered")>-1) return "Ese correo electrónico ya está registrado.";
  if (m.indexOf("signup is disabled")>-1 || m.indexOf("signups not allowed")>-1) return "El registro de nuevos usuarios está deshabilitado.";
  if (m.indexOf("email rate limit")>-1 || m.indexOf("too many requests")>-1) return "Se alcanzó el límite temporal de solicitudes. Esperá unos segundos y probá de nuevo.";
  if (m.indexOf("password should")>-1 || m.indexOf("password is too short")>-1) return "La contraseña no cumple los requisitos mínimos.";
  if (m.indexOf("auth session missing")>-1 || m.indexOf("session missing")>-1) return "No hay una sesión activa. Iniciá sesión nuevamente.";
  if (m.indexOf("cors")>-1) return "El navegador bloqueó la comunicación con el servicio. Revisá la conexión e intentá nuevamente.";
  var pareceEspanol=/(no se |no pudo|no hay |ocurri|error |revis|intentá|ingres|contraseña|correo|sesión|permiso|operación|invitación|cláusula|configuración|conectar|guardar|cargar|actualizar|crear|eliminar|importar|exportar|respaldo|suscripción|mercado pago|servidor|documento|datos|campo|archivo)/i.test(original);
  var pareceIngles=/(failed|unable|invalid|network|fetch|request|error|forbidden|unauthorized|not found|does not exist|violates|constraint|permission|credential|expired|unexpected|service|function|column|relation|schema|quota|limit|temporarily|high demand|password|email|login|session|token|claim|browser|microphone|speech|voice|loading|saving|saved|cancel|close|open|upload|download|checkout|gateway|duplicate)/i.test(original);
  if (!pareceEspanol) return "Ocurrió un error. Intentá nuevamente. Si el problema continúa, contactá soporte.";
  return original;
}


function AuthPasswordSetupScreen({onSave,mode,error,loading,onLogout}){
  var [password,setPassword]=useState("");
  var [confirm,setConfirm]=useState("");
  var [localError,setLocalError]=useState("");
  function submit(e){
    e.preventDefault();
    setLocalError("");
    if(password.length<8){setLocalError("La contraseña debe tener al menos 8 caracteres.");return;}
    if(password!==confirm){setLocalError("Las contraseñas no coinciden.");return;}
    onSave(password);
  }
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 50% 0%, #142747 0%, #070d19 48%, #03060d 100%)",padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <form onSubmit={submit} style={{width:"100%",maxWidth:390,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,display:"flex",flexDirection:"column",gap:14,boxShadow:"0 18px 55px rgba(0,0,0,0.38),0 0 0 1px rgba(212,168,83,0.035)"}}>
        <div style={{textAlign:"center",marginBottom:4}}>
          <img src={LOGO_B64} alt="DocWorks" style={{height:120,width:"auto",maxWidth:"300px",objectFit:"contain",marginBottom:8}}/>
          <div style={{fontSize:15,fontWeight:700,color:AUTH_TEXT}}>{mode==="invite"?"Activá tu cuenta":"Restablecé tu contraseña"}</div>
          <div style={{fontSize:12,color:AUTH_MUTED,marginTop:5,lineHeight:1.45}}>{mode==="invite"?"Elegí una contraseña para ingresar a DocWorks.":"Ingresá una nueva contraseña para recuperar el acceso."}</div>
        </div>
        {(error||localError)&&<div style={{fontSize:12.5,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600}}>{localError||error}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Nueva contraseña</label>
          <input type="password" name="new-password" autoComplete="new-password" minLength={8} required value={password} onChange={function(e){setPassword(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} />
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Repetir contraseña</label>
          <input type="password" name="confirm-password" autoComplete="new-password" minLength={8} required value={confirm} onChange={function(e){setConfirm(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} />
        </div>
        <button type="submit" disabled={loading} style={{marginTop:3,padding:"11px 14px",borderRadius:10,border:"none",background:AUTH_GOLD,color:"#1a1206",fontWeight:700,fontSize:14,cursor:loading?"default":"pointer",opacity:loading?.6:1}}>{loading?"Guardando…":"Guardar contraseña y continuar"}</button>
        {onLogout&&<button type="button" onClick={onLogout} style={{background:"transparent",border:"none",color:AUTH_MUTED,cursor:"pointer",fontSize:12,textDecoration:"underline",padding:0}}>Cerrar sesión</button>}
      </form>
    </div>
  );
}

function RegistroScreen({ onBack, onSubmit, loading, error, success }){
  var [nombre,setNombre]=useState("");
  var [email,setEmail]=useState("");
  var [inmobiliaria,setInmobiliaria]=useState("");
  var [password,setPassword]=useState("");
  var fields=[{id:"nombre",label:"Nombre y apellido",value:nombre,set:setNombre,type:"text",auto:"name",max:120},{id:"inmobiliaria",label:"Inmobiliaria",value:inmobiliaria,set:setInmobiliaria,type:"text",auto:"organization",max:160},{id:"email",label:"Correo electrónico",value:email,set:setEmail,type:"email",auto:"email",max:254},{id:"password",label:"Contraseña (mínimo 8 caracteres)",value:password,set:setPassword,type:"password",auto:"new-password",max:128}];
  return <div style={{position:"fixed",inset:0,zIndex:400,overflowY:"auto",background:AUTH_BG,padding:16,fontFamily:"'DM Sans',sans-serif",display:"flex"}}>
    <form onSubmit={function(e){e.preventDefault();if(!loading)onSubmit({nombre:nombre.trim(),email:email.trim().toLowerCase(),inmobiliaria:inmobiliaria.trim(),password:password});}} style={{margin:"auto",width:"100%",maxWidth:410,boxSizing:"border-box",background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:24,display:"flex",flexDirection:"column",gap:14,color:AUTH_TEXT}}>
      <img src={LOGO_B64} alt="DocWorks" style={{height:90,width:"100%",objectFit:"contain"}}/>
      <h1 style={{fontSize:22,margin:0}}>Probá DocWorks gratis</h1>
      <p style={{fontSize:14,lineHeight:1.5,margin:0,color:AUTH_MUTED}}>Un mes gratis para tu inmobiliaria. Sin tarjeta y sin cobro automático. La prueba empieza cuando verificás tu email.</p>
      {error&&<div role="alert" style={{color:AUTH_RED}}>{error}</div>}
      {success?<div role="status" style={{lineHeight:1.5}}>{success}</div>:<>
        {fields.map(function(f){return <div key={f.id}><label htmlFor={"dw-reg-"+f.id} style={{display:"block",fontSize:13,marginBottom:6}}>{f.label}</label><input id={"dw-reg-"+f.id} name={f.id} autoComplete={f.auto} required type={f.type} minLength={f.id==="password"?8:1} maxLength={f.max} value={f.value} onChange={function(e){f.set(e.target.value);}} style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:16}}/></div>;})}
        <button type="submit" disabled={loading} style={{padding:13,borderRadius:10,border:0,background:AUTH_GOLD,color:"#1a1206",fontSize:16,fontWeight:700,cursor:"pointer"}}>{loading?"Creando cuenta…":"Crear cuenta gratis"}</button>
        <p style={{fontSize:12,lineHeight:1.5,color:AUTH_MUTED,margin:0}}>Usaremos estos datos para crear y administrar tu cuenta.</p>
      </>}
      <button type="button" onClick={onBack} style={{background:"transparent",border:0,color:AUTH_MUTED,cursor:"pointer",padding:8}}>Ya tengo cuenta · Ingresar</button>
    </form>
  </div>;
}

function LoginScreen({ onLogin, onRecover, onRegister, error, loading, connError }){
  var [email,setEmail]=useState("");
  var [password,setPassword]=useState("");
  var [verPassword,setVerPassword]=useState(false);
  var [recoverMode,setRecoverMode]=useState(false);
  var [recoverMsg,setRecoverMsg]=useState(null);
  var [recoverLoading,setRecoverLoading]=useState(false);
  var esArchivoLocal = (typeof window!=="undefined" && window.location && window.location.protocol==="file:");
  function submit(e){
    e.preventDefault();
    if (recoverMode) {
      setRecoverMsg(null); setRecoverLoading(true);
      Promise.resolve(onRecover(email.trim())).then(function(res){
        setRecoverLoading(false);
        if (res && res.error) setRecoverMsg(res.error);
        else { setRecoverMsg("Te enviamos un enlace para restablecer tu contraseña. Revisá tu correo electrónico."); setRecoverMode(false); }
      }).catch(function(){ setRecoverLoading(false); setRecoverMsg("No se pudo enviar el enlace. Intentá de nuevo."); });
      return;
    }
    onLogin(email.trim(), password);
  }
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 50% 0%, #142747 0%, #070d19 48%, #03060d 100%)",padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <form onSubmit={submit} style={{width:"100%",maxWidth:380,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,display:"flex",flexDirection:"column",gap:14,boxShadow:"0 18px 55px rgba(0,0,0,0.38),0 0 0 1px rgba(212,168,83,0.035)"}}>
        <div style={{textAlign:"center",marginBottom:6}}>
          <img src={LOGO_B64} alt="DocWorks" style={{height:190,width:"auto",maxWidth:"360px",objectFit:"contain",filter:"drop-shadow(0 0 32px rgba(212,168,83,0.6))",marginBottom:10}}/>
          <div style={{fontSize:12.5,color:AUTH_MUTED,marginTop:2}}>{recoverMode ? "Recuperá el acceso a tu cuenta" : "Iniciá sesión para continuar"}</div>
        </div>
        {esArchivoLocal && <div style={{fontSize:12,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600,lineHeight:1.4}}>⚠️ Estás abriendo este archivo directo desde tu disco (file://). El inicio de sesión no va a funcionar así — necesitás servirlo por http(s)://.</div>}
        {connError && <div style={{fontSize:12,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600,lineHeight:1.4}}>{connError}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Correo electrónico</label><input type="email" name="username" id="dw-login-email" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required value={email} onChange={function(e){setEmail(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} /></div>
        {!recoverMode && <div style={{display:"flex",flexDirection:"column",gap:5}}><label htmlFor="dw-login-password" style={{fontSize:12,fontWeight:600,color:AUTH_MUTED,cursor:"text",padding:"4px 0"}}>Contraseña</label><div style={{position:"relative",display:"flex",alignItems:"center"}}><input type={verPassword?"text":"password"} name="password" id="dw-login-password" autoComplete="current-password" required value={password} onChange={function(e){setPassword(e.target.value);}} style={{width:"100%",boxSizing:"border-box",minHeight:48,padding:"12px 56px 12px 14px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:16,touchAction:"manipulation"}} /><button type="button" onClick={function(){setVerPassword(function(v){return !v;});}} aria-label={verPassword?"Ocultar contraseña":"Mostrar contraseña"} aria-pressed={verPassword} title={verPassword?"Ocultar contraseña":"Mostrar contraseña"} style={{position:"absolute",right:2,top:"50%",transform:"translateY(-50%)",border:0,background:"transparent",color:AUTH_MUTED,cursor:"pointer",width:44,height:44,padding:0,display:"flex",alignItems:"center",justifyContent:"center",touchAction:"manipulation"}}><DWIcon name={verPassword?"eye-off":"eye"} size={20} strokeWidth={1.8}/></button></div></div>}
        {error && !recoverMode && <div style={{fontSize:12.5,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600}}>{error}</div>}
        {recoverMsg && <div style={{fontSize:12.5,color:recoverMsg.indexOf("No se pudo")===0?AUTH_RED:"#15803d",background:recoverMsg.indexOf("No se pudo")===0?"rgba(248,113,113,.12)":"rgba(34,197,94,.10)",padding:"8px 10px",borderRadius:8,fontWeight:600,lineHeight:1.4}}>{recoverMsg}</div>}
        <button type="submit" disabled={loading} style={{marginTop:4,padding:"11px 14px",borderRadius:10,border:"none",background:AUTH_GOLD,color:"#1a1206",fontWeight:700,fontSize:14,cursor:loading?"default":"pointer",opacity:loading?.6:1}}>{recoverMode ? (recoverLoading ? "Enviando…" : "Enviar enlace") : (loading ? "Ingresando…" : "Ingresar")}</button>
        {!recoverMode && <button type="button" onClick={onRegister} style={{background:"transparent",border:"none",color:"var(--gold)",cursor:"pointer",fontSize:13,fontWeight:700,padding:"3px 0 0"}}>Registrate</button>}
        <button type="button" onClick={function(){setRecoverMode(function(v){return !v;});setRecoverMsg(null);setPassword("");}} style={{background:"transparent",border:"none",color:AUTH_MUTED,cursor:"pointer",fontSize:12,textDecoration:"underline",padding:0}}>{recoverMode ? "Volver a iniciar sesión" : "¿Olvidaste tu contraseña? Recuperala"}</button>
        <a href="https://docworks-landing.vercel.app" style={{display:"block",textAlign:"center",color:AUTH_MUTED,fontSize:12,textDecoration:"none",padding:"5px 0 0"}}>← Volver al sitio web</a>
      </form>
    </div>
  );
}

function CuentaNoHabilitadaScreen({ onLogout }){
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 50% 0%, #142747 0%, #070d19 48%, #03060d 100%)",padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:380,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,textAlign:"center",color:AUTH_TEXT,boxShadow:"0 18px 55px rgba(0,0,0,0.38),0 0 0 1px rgba(212,168,83,0.035)"}}>
        <div style={{fontSize:28,marginBottom:10}}>🔒</div>
        <div style={{fontWeight:700,marginBottom:8}}>Cuenta autenticada, pero no habilitada</div>
        <div style={{fontSize:13,color:AUTH_MUTED,lineHeight:1.5}}>Tu cuenta está autenticada, pero todavía no está habilitada en DocWorks. Contactá al administrador.</div>
        <button onClick={onLogout} style={{marginTop:18,padding:"9px 16px",borderRadius:9,border:"1px solid "+AUTH_BORDER,background:"transparent",color:AUTH_TEXT,fontSize:13,cursor:"pointer"}}>Cerrar sesión</button>
      </div>
    </div>
  );
}

function MembresiaSuspendidaScreen({ onLogout, estado }){
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 50% 0%, #142747 0%, #070d19 48%, #03060d 100%)",padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:380,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,textAlign:"center",color:AUTH_TEXT,boxShadow:"0 18px 55px rgba(0,0,0,0.38),0 0 0 1px rgba(212,168,83,0.035)"}}>
        <div style={{fontSize:28,marginBottom:10}}>⛔</div>
        <div style={{fontWeight:700,marginBottom:8}}>Membresía {estado === "vencida" ? "vencida" : "suspendida"}</div>
        <div style={{fontSize:13,color:AUTH_MUTED,lineHeight:1.5}}>{estado === "vencida" ? "El período de acceso terminó. Tus datos se conservan. Elegí un plan para seguir trabajando." : "Tu membresía está suspendida. Contactá al administrador de DocWorks."}</div>
        <a href="https://docworks-landing.vercel.app/#planes" style={{display:"block",marginTop:18,color:AUTH_GOLD}}>Ver planes</a><button onClick={onLogout} style={{marginTop:18,padding:"9px 16px",borderRadius:9,border:"1px solid "+AUTH_BORDER,background:"transparent",color:AUTH_TEXT,fontSize:13,cursor:"pointer"}}>Cerrar sesión</button>
      </div>
    </div>
  );
}

function useDocWorksSession(){
  var [ready,setReady]=useState(false);
  var authSubRef=useRef(null);
  var authInitCleanupRef=useRef(null);
  var [session,setSession]=useState(null);
  var [contexto,setContexto]=useState(null);
  var [contextoLoading,setContextoLoading]=useState(false);
  var [loginError,setLoginError]=useState(null);
  var [loginLoading,setLoginLoading]=useState(false);
  var [superDashboard,setSuperDashboard]=useState(null);
  var [connError,setConnError]=useState(null);
  var [authAction,setAuthAction]=useState(null); // null | invite | recovery
  var [passwordSaving,setPasswordSaving]=useState(false);
  var [passwordError,setPasswordError]=useState(null);
  var [registroLoading,setRegistroLoading]=useState(false);
  var [registroError,setRegistroError]=useState(null);
  var [registroSuccess,setRegistroSuccess]=useState(null);

  function detectarAuthAction(){
    try{
      var raw=(window.location.hash||"")+"&"+(window.location.search||"");
      var m=raw.match(/(?:[?#&])type=([^&#]+)/i);
      var type=m?decodeURIComponent(m[1]):"";
      if(type==="invite") return "invite";
      if(type==="recovery") return "recovery";
    }catch(e){ console.warn("DocWorks: no se pudo detectar la acción de autenticación",e); }
    return null;
  }

  function limpiarAuthUrl(){
    try{ window.history.replaceState({},document.title,window.location.pathname+window.location.search.replace(/([?&])type=(?:invite|recovery)(&?)/i,function(_,a,b){return b?a:"";})); }catch(e){ console.warn("DocWorks: no se pudo limpiar la URL de autenticación",e); }
  }

  function cargarContexto(sb,opts=undefined){
    opts=opts||{};
    var silent=!!opts.silent;
    if(!silent) setContextoLoading(true);
    // Autoprovisionamiento defensivo: si Auth existe pero por cualquier motivo
    // la fila de `usuarios` no fue creada (por ejemplo, una invitación creada
    // después del usuario Auth), intentamos reparar el vínculo antes de resolver
    // el contexto. La RPC es idempotente y solo puede asociar por email a una
    // invitación válida/existente.
    sb.rpc("fn_autoprovisionar_usuario_actual", {}).then(function(){
      return sb.rpc("fn_mi_contexto");
    }).then(function(res){
      if(!res.error){
        setContexto(res.data);
        if(res.data && res.data.usuario && res.data.usuario.id) lsSet("auth_context_"+res.data.usuario.id,res.data);
      } else if(!silent){
        setContexto(null);
      }
      setContextoLoading(false);
      if (!res.error && res.data && res.data.es_super_admin) {
        sb.rpc("fn_super_dashboard").then(function(r2){ if (!r2.error) setSuperDashboard(r2.data); else dwNotify("error","No se pudo actualizar el resumen del Superadministración."); }).catch(function(err){ dwNotify("error", "No se pudo actualizar el resumen del Superadministración."); });
      }
    }).catch(function(){
      // Si la RPC de reparación todavía no existe en el proyecto, mantenemos
      // el comportamiento anterior y dejamos que fn_mi_contexto determine el estado.
      sb.rpc("fn_mi_contexto").then(function(res){
        if(!res.error){
          setContexto(res.data);
          if(res.data && res.data.usuario && res.data.usuario.id) lsSet("auth_context_"+res.data.usuario.id,res.data);
        } else if(!silent){
          setContexto(null);
        }
        setContextoLoading(false);
      }).catch(function(){ if(!silent){setContexto(null);setContextoLoading(false);} });
    });
  }

  useEffect(function(){
    var m=contexto&&contexto.membresia;
    if(!m||!m.es_prueba||!m.fecha_vencimiento||!contexto.habilitado)return;
    var remaining=new Date(m.fecha_vencimiento).getTime()-Date.now();
    var timer=setTimeout(function(){loadSupabaseJs().then(function(sb){if(sb)cargarContexto(sb);});},Math.max(0,Math.min(remaining+250,2147483647)));
    return function(){clearTimeout(timer);};
  },[contexto]);

  function iniciar(){
    setConnError(null);
    var cancelado = false;
    // 4.27: si hay una sesión guardada en el dispositivo, una conexión lenta NUNCA manda al login:
    // se avisa, se sigue esperando en segundo plano y se entra solo apenas responde Supabase.
    var tieneSesionGuardada = dwHaySesionGuardada();
    var timeoutId = setTimeout(function(){
      if (cancelado) return;
      if (tieneSesionGuardada) { setConnError("La conexión está tardando más de lo normal. Seguimos intentando entrar…"); return; }
      setConnError("No se pudo conectar con Supabase (tardó demasiado). Revisá tu conexión e intentá de nuevo."); setReady(true);
    }, 12000);

    loadSupabaseJs().then(function(sb){
      if (cancelado) return;
      if (!sb) { clearTimeout(timeoutId); setConnError("No se pudo cargar el cliente de Supabase (¿bloqueado por el navegador o la red?)."); if(!tieneSesionGuardada) setReady(true); return; }
      dwObtenerSesionRobusta(sb).then(function(res){
        if (cancelado) return;
        clearTimeout(timeoutId);
        if (res && res.transitorio) { setConnError("No pudimos recuperar tu sesión por la conexión. Tocá Reintentar (no hace falta volver a loguearse)."); return; }
        setConnError(null);
        setSession(res.data.session);
        var actionInicial=detectarAuthAction();
        if(actionInicial && res.data.session) setAuthAction(actionInicial);
        if (res.data.session) {
          var cachedCtx=lsGet("auth_context_"+res.data.session.user.id,null);
          if(cachedCtx){ setContexto(cachedCtx); setContextoLoading(false); }
          cargarContexto(sb,{silent:!!cachedCtx});
        }
        setReady(true);
      }).catch(function(err){
        if (cancelado) return;
        clearTimeout(timeoutId);
        setConnError("Error conectando con Supabase: " + (traducirError(err && err.message ? err.message : "desconocido")));
        if(!tieneSesionGuardada) setReady(true);
      });
      var listener = sb.auth.onAuthStateChange(function(_evt, sess){
        // 4.27: eventos con sesión vacía que NO son un cierre real (ej. INITIAL_SESSION mientras carga) no deben sacar al usuario.
        if(!sess && _evt!=="SIGNED_OUT") return;
        if(_evt==="PASSWORD_RECOVERY") setAuthAction("recovery");
        else if(_evt==="SIGNED_IN") { var a=detectarAuthAction(); if(a) setAuthAction(a); }
        setSession(sess);
        if (sess) {
          var cachedCtx2=lsGet("auth_context_"+sess.user.id,null);
          if(cachedCtx2){ setContexto(cachedCtx2); setContextoLoading(false); }
          cargarContexto(sb,{silent:!!cachedCtx2});
        } else { setContexto(null); setContextoLoading(false); setSuperDashboard(null); }
      });
      authSubRef.current = listener && listener.data ? listener.data.subscription : null;
    }).catch(function(err){
      if (cancelado) return;
      clearTimeout(timeoutId);
      setConnError("Error inicializando Supabase: " + (traducirError(err && err.message ? err.message : "desconocido")));
      setReady(true);
    });

    return function(){ cancelado = true; clearTimeout(timeoutId); };
  }

  // Centralizar el cierre de la inicialización y de la suscripción evita
  // listeners duplicados cuando se toca Reintentar con una red inestable.
  function cerrarInicioSesion(){
    if(authInitCleanupRef.current){
      try{authInitCleanupRef.current();}catch(e){}
      authInitCleanupRef.current=null;
    }
    if(authSubRef.current){
      try{authSubRef.current.unsubscribe();}catch(e){console.debug("DocWorks: no se pudo cerrar la suscripción de autenticación.",e);}
      authSubRef.current=null;
    }
  }
  useEffect(function(){
    authInitCleanupRef.current=iniciar();
    return function(){ cerrarInicioSesion(); };
  }, []);

  function retry(){
    cerrarInicioSesion();
    setReady(false);
    authInitCleanupRef.current=iniciar();
  }

  function solicitarRegistro(datos){
    if(registroLoading)return Promise.resolve({error:true});
    setRegistroLoading(true); setRegistroError(null); setRegistroSuccess(null);
    if(!datos.nombre||!datos.inmobiliaria||!datos.email||!datos.password||datos.password.length<8){setRegistroLoading(false);setRegistroError("Completá los datos para crear tu cuenta.");return Promise.resolve({error:true});}
    return loadSupabaseJs().then(function(sb){
      if(!sb)throw new Error("No se pudo conectar con DocWorks.");
      return sb.auth.signUp({email:datos.email,password:datos.password,options:{emailRedirectTo:window.location.origin+window.location.pathname,data:{nombre:datos.nombre,inmobiliaria:datos.inmobiliaria,docworks_registro:"trial_month_v1"}}});
    }).then(function(res){
      if(res.error)throw res.error;
      setRegistroSuccess("Revisá tu correo y verificá tu email para empezar. Si ya tenés cuenta, ingresá o recuperá tu contraseña. No hay cobro automático al finalizar la prueba.");
      return {ok:true};
    }).catch(function(err){setRegistroError(traducirError(err&&err.message||"No se pudo crear la cuenta."));return {error:true};}).finally(function(){setRegistroLoading(false);});
  }

  function login(email, password){
    setLoginError(null); setLoginLoading(true);
    loadSupabaseJs().then(function(sb){
      if (!sb) { setLoginLoading(false); setLoginError("No se pudo cargar Supabase. Recargá la página e intentá de nuevo."); return; }
      sb.auth.signInWithPassword({ email: email, password: password }).then(function(res){
        setLoginLoading(false);
        if (res.error) { setLoginError(traducirError(res.error.message)); return; }
      }).catch(function(err){
        setLoginLoading(false);
        setLoginError(traducirError(err && err.message ? err.message : "Error de conexión, intentá de nuevo."));
      });
    }).catch(function(){ setLoginLoading(false); setLoginError("No se pudo cargar Supabase."); });
  }
  function recoverPassword(email){
    return loadSupabaseJs().then(function(sb){
      if (!sb) return {error:"No se pudo cargar Supabase. Recargá la página e intentá de nuevo."};
      if (!email) return {error:"Ingresá tu correo electrónico para recuperar la contraseña."};
      return sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname }).then(function(res){
        if (res.error) return {error:traducirError(res.error.message)};
        return {ok:true};
      });
    }).catch(function(){ return {error:"No se pudo enviar el enlace. Intentá de nuevo."}; });
  }
  function savePassword(password){
    setPasswordError(null); setPasswordSaving(true);
    return loadSupabaseJs().then(function(sb){
      if(!sb) { setPasswordSaving(false); setPasswordError("No se pudo cargar Supabase. Recargá la página e intentá de nuevo."); return {error:true}; }
      return sb.auth.updateUser({password:password}).then(function(res){
        setPasswordSaving(false);
        if(res.error){ setPasswordError(traducirError(res.error.message)); return {error:true}; }
        setAuthAction(null); limpiarAuthUrl();
        if(res.data && res.data.user) cargarContexto(sb);
        return {ok:true};
      });
    }).catch(function(err){ setPasswordSaving(false); setPasswordError(traducirError(err&&err.message?err.message:"No se pudo guardar la contraseña.")); return {error:true}; });
  }
  function logout(){
    lsRemove("draftOperacion");
    setAuthAction(null); setPasswordError(null);
    setSession(null); setContexto(null); setContextoLoading(false); setSuperDashboard(null);
    loadSupabaseJs().then(function(sb){ if (sb) return sb.auth.signOut(); });
  }

  return { ready:ready, session:session, contexto:contexto, contextoLoading:contextoLoading, superDashboard:superDashboard, loginError:loginError, loginLoading:loginLoading, connError:connError, authAction:authAction, passwordSaving:passwordSaving, passwordError:passwordError, registroLoading:registroLoading, registroError:registroError, registroSuccess:registroSuccess, login:login, recoverPassword:recoverPassword, savePassword:savePassword, solicitarRegistro:solicitarRegistro, logout:logout, retry:retry };
}

function formatearNombreUsuarioVisible(contexto){
  if (!contexto || !contexto.usuario) return "Usuario";
  var u = contexto.usuario || {};
  var rawNombre = String(u.nombre || u.nombre_usuario || "").trim();
  var rawEmail = String(u.email || "").trim().toLowerCase();

  // Presentación únicamente visual: no modifica ni guarda ningún dato.
  // El usuario principal puede tener el nombre heredado del email/alta sin
  // espacios; en pantalla lo mostramos con formato legible.
  if (rawEmail === "alexisgonzalezmantovani@gmail.com" || rawNombre.toLowerCase() === "alexisgonzalezmantovani") {
    return "Alexis Gonzalez Mantovani";
  }

  var nombre = rawNombre || rawEmail.split("@")[0] || "Usuario";
  nombre = nombre.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  return nombre.split(" ").filter(Boolean).map(function(p){
    return p.charAt(0).toUpperCase()+p.slice(1).toLowerCase();
  }).join(" ") || "Usuario";
}

function SesionBadge({ contexto, onLogout, foto }){
  var [abierto,setAbierto]=useState(false);
  if (!contexto || !contexto.usuario) return null;
  var usuario = formatearNombreUsuarioVisible(contexto);
  var inicial=(usuario||"U").charAt(0).toUpperCase();
  return (
    <div className="sesion-badge" style={{position:"relative",display:"flex",alignItems:"center"}}>
      <button type="button" onClick={function(){setAbierto(!abierto);}} aria-label="Abrir menú de perfil" style={{display:"flex",alignItems:"center",gap:8,background:"transparent",border:0,cursor:"pointer",padding:"4px 6px",color:"#f1f5f9"}}>
        <span style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,var(--gold),#8f6b23)",color:"#fff",fontWeight:800,fontSize:12,overflow:"hidden",border:"1px solid rgba(255,255,255,.18)"}}>{foto?<img src={foto} alt="Foto de perfil" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:inicial}</span>
        <span style={{fontWeight:650,maxWidth:210,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#f1f5f9"}}>{usuario}</span>
        <span style={{fontSize:12,color:"rgba(241,245,249,.7)"}}>⌄</span>
      </button>
      {abierto&&<div style={{position:"absolute",right:0,top:"calc(100% + 7px)",minWidth:190,zIndex:500,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:12,boxShadow:"var(--shadow-lg)",padding:6}}>
        <div style={{padding:"9px 10px",borderBottom:"1px solid var(--border)",marginBottom:5}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{usuario}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>{contexto.usuario.email||""}</div></div>
        <a href="https://docworks-landing.vercel.app" style={{display:"block",padding:"9px 10px",fontSize:12,fontWeight:650,color:"var(--text)",textDecoration:"none",borderRadius:8}}>← Volver al sitio web</a>
        <button type="button" onClick={function(){setAbierto(false);onLogout();}} className="logout-btn" style={{width:"100%",textAlign:"left",padding:"9px 10px",border:0,borderRadius:8,background:"transparent",cursor:"pointer",fontSize:12,fontWeight:700}}>↪ Salir</button>
      </div>}
    </div>
  );
}

// ── EQUIPO REAL (Fase 2 SaaS) ─────────────────────────────────────────────────
// Trae usuarios + invitaciones pendientes de Supabase y los mapea a la MISMA
// forma que usaba `equipo` local ({id,nombre,email,telefono,rol,estado,
// created_at}) para no tener que tocar CompartidaBlock, EstadisticasView ni
// OperacionForm, que ya consumen esa forma en un montón de lugares.
function mapUsuarioAEquipo(u){
  return { id:u.id, nombre:u.nombre||u.email, email:u.email, telefono:"", rol:u.rol_base,
    perfil_permisos:u.perfil_permisos, estado:u.activo?"activo":"inactivo",
    created_at:u.creado_en, fotoDataUrl:"", _tipo:"usuario" };
}
function mapInvitacionAEquipo(inv){
  return { id:"inv_"+inv.id, _invId:inv.id, nombre:"(pendiente — "+inv.email+")", email:inv.email, telefono:"",
    rol:inv.rol_base, perfil_permisos:inv.perfil_permisos, estado:"pendiente",
    created_at:inv.creada_en, fotoDataUrl:"", _tipo:"invitacion" };
}

function useEquipoSupabase(ctx){
  var [equipo,setEquipo]=useState([]);
  var [loading,setLoading]=useState(false);
  var [error,setError]=useState(null);
  var inmobId = ctx && ctx.inmobiliaria ? ctx.inmobiliaria.id : null;
  var esAdmin = !!(ctx && ctx.usuario && (ctx.usuario.rol_base==="dueno"||ctx.usuario.rol_base==="admin"));

  function recargar(){
    if (!inmobId) { setEquipo([]); return; }
    setLoading(true); setError(null);
    loadSupabaseJs().then(function(sb){
      if (!sb) { setLoading(false); setError("No se pudo conectar con Supabase."); return; }
      Promise.all([
        sb.from("usuarios").select("id,nombre,email,rol_base,perfil_permisos,activo,creado_en").eq("inmobiliaria_id", inmobId),
        esAdmin
          ? sb.from("invitaciones").select("id,email,rol_base,perfil_permisos,creada_en,usada,expira_en").eq("inmobiliaria_id", inmobId).eq("usada", false)
          : Promise.resolve({ data: [], error: null })
      ]).then(function(res){
        setLoading(false);
        var usuariosRes = res[0], invRes = res[1];
        if (usuariosRes.error) { setError(traducirError(usuariosRes.error.message)); return; }
        var ahora = new Date();
        var invPendientes = (invRes.data||[]).filter(function(i){ return new Date(i.expira_en) > ahora; });
        setEquipo((usuariosRes.data||[]).map(mapUsuarioAEquipo).concat(invPendientes.map(mapInvitacionAEquipo)));
      }).catch(function(err){ setLoading(false); setError(traducirError(err && err.message ? err.message : "No se pudieron cargar el equipo.")); });
    });
  }

  useEffect(function(){ recargar(); }, [inmobId]);

  function rpc(nombre, params){
    return loadSupabaseJs().then(function(sb){
      if (!sb) return { error:{ message:"No se pudo conectar con Supabase." } };
      return sb.rpc(nombre, params);
    });
  }

  function invitar(email, rolBase, perfilPermisos){
    return rpc("fn_invitar_usuario", { p_email: email, p_rol_base: rolBase, p_perfil_permisos: perfilPermisos }).then(function(res){
      if (!res.error) {
        recargar();
        // Inicialización idempotente: al crear/invitar el primer usuario de una inmobiliaria
        // también dejamos sembradas las cláusulas estándar y el cuerpo base de Reserva.
        rpc("fn_clausulas_sembrar",{}).catch(function(err){ dwNotify("error","No se pudieron inicializar las cláusulas estándar."); });
        rpc("fn_bloques_reserva_sembrar",{}).catch(function(err){ dwNotify("error","No se pudo inicializar el cuerpo base de Reserva."); });
      }
      return res;
    });
  }
  function setActivo(usuarioId, activo){
    return rpc("fn_usuario_set_activo", { p_usuario_id: usuarioId, p_activo: activo }).then(function(res){
      if (!res.error) recargar();
      return res;
    });
  }
  function editarRolNivel(usuarioId, rolBase, perfilPermisos){
    return rpc("fn_usuario_editar_rol", { p_usuario_id: usuarioId, p_rol_base: rolBase, p_perfil_permisos: perfilPermisos }).then(function(res){
      if (!res.error) recargar();
      return res;
    });
  }
  function cancelarInvitacion(invitacionId){
    return rpc("fn_invitacion_cancelar", { p_invitacion_id: invitacionId }).then(function(res){
      if (!res.error) recargar();
      return res;
    });
  }

  return { equipo:equipo, loading:loading, error:error, esAdmin:esAdmin, recargar:recargar,
    invitar:invitar, setActivo:setActivo, editarRolNivel:editarRolNivel, cancelarInvitacion:cancelarInvitacion };
}

// ── OPERACIONES: sincronización con Supabase ──────────────────────────────────
// Reemplaza el almacenamiento local (localStorage) por la nube: cada
// operación vive en la tabla `operaciones`, con Realtime para reflejar en
// todos los dispositivos conectados (celular, PC, colegas) los cambios que
// haga cualquiera, sin recargar la página.
function useOperacionesSupabase(ctx){
  var [operaciones,setOperaciones]=useState([]);
  var [papelera,setPapelera]=useState([]);
  var [loading,setLoading]=useState(true);
  var [error,setError]=useState(null);
  var [papeleraError,setPapeleraError]=useState(null);
  var inmobId = ctx && ctx.inmobiliaria ? ctx.inmobiliaria.id : null;
  // Descarta respuestas tardías al cambiar de inmobiliaria o cerrar sesión.
  var contextoActivoRef = useRef(inmobId);
  contextoActivoRef.current = inmobId;
  var peticionListaRef = useRef(0);

  function mapRow(r, extra=undefined){
    return Object.assign({}, r.datos, { id:r.id, tipo:r.tipo, estado:r.estado, parent_id:r.parent_id }, extra||{});
  }
  function rpc(nombre, params){
    return loadSupabaseJs().then(function(sb){
      if (!sb) return { error:{ message:"No se pudo conectar con Supabase." } };
      return sb.rpc(nombre, params);
    });
  }

  function recargar(){
    var inmobiliariaSolicitada = inmobId;
    var numeroPeticion = ++peticionListaRef.current;
    if (!inmobiliariaSolicitada) { setOperaciones([]); setPapelera([]); setLoading(false); setError(null); setPapeleraError(null); return; }
    setLoading(true); setError(null); setPapeleraError(null);
    // allSettled permite mostrar cada resultado aunque la otra RPC rechace
    // por una falla de red (Promise.all abortaría el procesamiento de ambas).
    Promise.allSettled([ rpc("fn_operaciones_listar", {}), rpc("fn_operaciones_papelera", {}) ]).then(function(resultados){
      var res=resultados.map(function(r){
        return r.status==="fulfilled" ? r.value : {error:{message:r.reason&&r.reason.message?r.reason.message:"No se pudo conectar con Supabase."}};
      });
      if (contextoActivoRef.current !== inmobiliariaSolicitada || numeroPeticion !== peticionListaRef.current) return;
      setLoading(false);
      // Las dos lecturas son independientes: un error en Operaciones no debe
      // ocultar una respuesta válida de Papelera, ni viceversa.
      if (res[0].error) {
        setError(traducirError(res[0].error.message));
        // Mantener la última lista válida hasta que el usuario reintente.
      } else {
        setError(null);
        setOperaciones((res[0].data||[]).map(function(r){ return mapRow(r); }));
      }
      if (res[1].error) {
        // No presentar una falla de lectura como si la papelera estuviera vacía.
        setPapeleraError("No se pudo actualizar la papelera. Se conserva la última información cargada; reintentá para consultar su estado actual.");
        console.warn("DocWorks: error al consultar la papelera de operaciones.", res[1].error.code || "RPC");
      } else {
        setPapeleraError(null);
        setPapelera((res[1].data||[]).map(function(r){ return mapRow(r, {deleted_at:r.eliminado_en}); }));
      }
    }).catch(function(err){
      if (contextoActivoRef.current !== inmobiliariaSolicitada || numeroPeticion !== peticionListaRef.current) return;
      setLoading(false);
      setError(traducirError(err && err.message ? err.message : "No se pudieron cargar las operaciones."));
      setPapeleraError("No se pudo consultar la papelera. Conservamos la última información cargada; reintentá cuando vuelva la conexión.");
    });
  }

  useEffect(function(){
    // No mostrar datos de la inmobiliaria anterior mientras carga la nueva sesión.
    ++peticionListaRef.current;
    setOperaciones([]); setPapelera([]); setError(null); setPapeleraError(null);
    recargar();
    if (inmobId) rpc("fn_operaciones_purgar_vencidas", {});
  }, [inmobId]);

  // Realtime: si otro dispositivo/usuario de la misma inmobiliaria crea, edita,
  // borra o restaura una operación, acá se entera y refresca solo.
  useEffect(function(){
    if (!inmobId) return;
    var channel=null, cancelado=false;
    loadSupabaseJs().then(function(sb){
      if (!sb || cancelado) return;
      channel = sb.channel("operaciones-"+inmobId)
        .on("postgres_changes", { event:"*", schema:"public", table:"operaciones", filter:"inmobiliaria_id=eq."+inmobId }, function(){ recargar(); })
        .subscribe();
    });
    return function(){ cancelado=true; if (channel) loadSupabaseJs().then(function(sb){ if (sb) sb.removeChannel(channel); }); };
  }, [inmobId]);

  function guardar(op){
    return rpc("fn_operacion_guardar", { p_id:op.id, p_tipo:op.tipo, p_estado:op.estado||"borrador", p_parent_id:op.parent_id||null, p_datos:op }).then(function(res){
      if (res.error) { setError(traducirError(res.error.message)); } else { recargar(); }
      return res;
    });
  }
  function eliminar(id){ return rpc("fn_operacion_eliminar", { p_id:id }).then(function(res){ if(res.error) setError(traducirError(res.error.message)); else recargar(); return res; }); }
  function restaurar(id){ return rpc("fn_operacion_restaurar", { p_id:id }).then(function(res){ if(res.error) setError(traducirError(res.error.message)); else recargar(); return res; }); }
  function eliminarPermanente(id){ return rpc("fn_operacion_eliminar_permanente", { p_id:id }).then(function(res){ if(res.error) setError(traducirError(res.error.message)); else recargar(); return res; }); }
  function vaciarPapelera(){ return rpc("fn_operaciones_vaciar_papelera", {}).then(function(res){ if(res.error) setError(traducirError(res.error.message)); else recargar(); return res; }); }

  return { operaciones:operaciones, papelera:papelera, loading:loading, error:error, papeleraError:papeleraError, recargar:recargar,
    guardar:guardar, eliminar:eliminar, restaurar:restaurar, eliminarPermanente:eliminarPermanente, vaciarPapelera:vaciarPapelera };
}

// ── AUDITORÍA: lectura desde Supabase (tabla compartida con Superadministración) ──────
// Las cláusulas, bloques y operaciones ya escriben acá solos (cada RPC inserta
// su fila). Esta es la vista de solo-lectura para el equipo de la inmobiliaria.
function useAuditoriaSupabase(ctx){
  var [entries,setEntries]=useState([]);
  var [loading,setLoading]=useState(true);
  var [error,setError]=useState(null);
  var inmobId = ctx && ctx.inmobiliaria ? ctx.inmobiliaria.id : null;
  // Evita mostrar auditorías de otra inmobiliaria si cambia la sesión
  // mientras una consulta sigue en curso.
  var contextoAuditoriaRef=useRef(inmobId);
  contextoAuditoriaRef.current=inmobId;
  var peticionAuditoriaRef=useRef(0);
  var ENTIDAD_LABEL = { clausula:"cláusula", bloque:"cláusula de Reserva", operacion:"operación", plantilla:"plantilla", usuario:"usuario", configuracion:"configuración" };
  var IGNORAR = {id:true, creada_en:true, actualizado_en:true, creada_por:true, actualizado_por:true, inmobiliaria_id:true};
  function valorLegible(v){
    if(v===undefined||v===null||v==="") return "";
    if(typeof v==="string") return v;
    if(Array.isArray(v)) return v.join(", ");
    if(typeof v==="object"){
      try{return JSON.stringify(v,null,2);}catch(e){return String(v);}
    }
    return String(v);
  }
  function labelCampo(k){
    var mapa={titulo:"Título",contenido:"Contenido",categoria:"Categoría",tipos:"Tipos",obligatoria:"Obligatoria",proteccion:"Protección",orden:"Orden",activo:"Activo",condicion:"Condición",nombre:"Nombre",email:"Email",rol_base:"Rol",datos:"Datos"};
    return mapa[k] || String(k||"").replace(/_/g," ").replace(/\b\w/g,function(c){return c.toUpperCase();});
  }
  function construirCambios(anterior,nuevo,accion){
    var a=(anterior&&typeof anterior==="object")?anterior:{};
    var n=(nuevo&&typeof nuevo==="object")?nuevo:{};
    var keys={}; Object.keys(a).forEach(function(k){if(!IGNORAR[k])keys[k]=true;}); Object.keys(n).forEach(function(k){if(!IGNORAR[k])keys[k]=true;});
    var out=[];
    Object.keys(keys).forEach(function(k){
      var antes=valorLegible(a[k]), despues=valorLegible(n[k]);
      if(antes!==despues) out.push({campo:k,label:labelCampo(k),antes:antes,despues:despues});
    });
    if(!out.length && accion==="crear"){
      Object.keys(n).forEach(function(k){if(!IGNORAR[k] && valorLegible(n[k])!=="") out.push({campo:k,label:labelCampo(k),antes:"",despues:valorLegible(n[k])});});
    }
    if(!out.length && accion==="eliminar"){
      Object.keys(a).forEach(function(k){if(!IGNORAR[k] && valorLegible(a[k])!=="") out.push({campo:k,label:labelCampo(k),antes:valorLegible(a[k]),despues:""});});
    }
    return out;
  }
  function mapEntry(r){
    var anterior=r.valor_anterior&&typeof r.valor_anterior==="object"?r.valor_anterior:null;
    var nuevo=r.valor_nuevo&&typeof r.valor_nuevo==="object"?r.valor_nuevo:null;
    var val=nuevo||anterior||{};
    var titulo=val.titulo||val.nombre||val.tipo||val.bloque_ref||val.operacion_id||(ENTIDAD_LABEL[r.entidad_tipo]||r.entidad_tipo||"");
    var u=r.usuarios||{};
    return { id:r.id, accion:r.accion, entidadTipo:r.entidad_tipo, entidadLabel:ENTIDAD_LABEL[r.entidad_tipo]||r.entidad_tipo||"registro", clausulaTitulo:titulo, ts:r.creada_en, actorNombre:u.nombre||u.email||"—", actorEmail:u.email||"", actorRol:u.rol_base||"", anterior:anterior, nuevo:nuevo, cambios:construirCambios(anterior,nuevo,r.accion) };
  }
  function recargar(){
    var idSolicitado=inmobId;
    var numeroPeticion=++peticionAuditoriaRef.current;
    if(!idSolicitado){ setEntries([]); setLoading(false); setError(null); return; }
    setLoading(true); setError(null);
    loadSupabaseJs().then(function(sb){
      if(contextoAuditoriaRef.current!==idSolicitado || peticionAuditoriaRef.current!==numeroPeticion) return;
      if(!sb) throw new Error("No se pudo conectar con Supabase.");
      return sb.from("auditoria").select("id,accion,entidad_tipo,valor_anterior,valor_nuevo,creada_en,usuarios!auditoria_usuario_id_fkey(nombre,email,rol_base)").order("creada_en",{ascending:false}).limit(300).then(function(res){
        if(contextoAuditoriaRef.current!==idSolicitado || peticionAuditoriaRef.current!==numeroPeticion) return;
        setLoading(false);
        if(res.error){ setError(traducirError(res.error.message)); return; }
        setEntries((res.data||[]).map(mapEntry));
      });
    }).catch(function(err){
      if(contextoAuditoriaRef.current!==idSolicitado || peticionAuditoriaRef.current!==numeroPeticion) return;
      setLoading(false);
      setError(traducirError(err&&err.message?err.message:"No se pudo cargar la auditoría."));
    });
  }
  useEffect(function(){
    ++peticionAuditoriaRef.current;
    setEntries([]); setError(null);
    recargar();
    return function(){ ++peticionAuditoriaRef.current; };
  }, [inmobId]);
  return {entries:entries,loading:loading,error:error,recargar:recargar};
}

// ── BLOQUES DE RESERVA: cuerpo fijo del documento, sincronizado con Supabase ──
function useBloquesReservaSupabase(ctx){
  var [bloques,setBloques]=useState([]);
  var [loading,setLoading]=useState(true);
  var [error,setError]=useState(null);
  var inmobId = ctx && ctx.inmobiliaria ? ctx.inmobiliaria.id : null;
  function mapRow(r){
    return { id:r.bloque_ref, _dbId:r.id, titulo:r.titulo, sinTitulo:r.sin_titulo, contenido:r.contenido,
      variables:r.variables||[], condicion:r.condicion, orden:r.orden, activo:r.activo, obligatoria:r.obligatoria,
      proteccion:r.proteccion, permisos_excepcion:[] };
  }
  function rpc(nombre,params){
    return loadSupabaseJs().then(function(sb){
      if(!sb) return {error:{message:"No se pudo conectar con Supabase."}};
      return sb.rpc(nombre,params);
    });
  }
  function recargar(){
    if(!inmobId){ setBloques([]); setLoading(false); return; }
    setLoading(true); setError(null);
    rpc("fn_bloques_reserva_listar",{}).then(function(res){
      if(res.error){ setLoading(false); setError(traducirError(res.error.message)); return; }
      if(!res.data || res.data.length===0){
        rpc("fn_bloques_reserva_sembrar",{}).then(function(res2){
          if(res2.error){ setLoading(false); setError(traducirError(res2.error.message)); return; }
          rpc("fn_bloques_reserva_listar",{}).then(function(res3){
            setLoading(false);
            if(res3.error){ setError(traducirError(res3.error.message)); return; }
            setBloques((res3.data||[]).map(mapRow));
          });
        });
      } else {
        setLoading(false);
        setBloques(res.data.map(mapRow));
      }
    }).catch(function(err){ setLoading(false); setError(traducirError(err && err.message ? err.message : "No se pudieron cargar las cláusulas de Reserva.")); });
  }
  useEffect(function(){ recargar(); }, [inmobId]);
  // 4.29: si falla la carga (ej. tablet con red lenta) se reintenta sola hasta 2 veces antes de mostrar el error.
  var intentosRef=useRef(0);
  useEffect(function(){ if(bloques.length>0) intentosRef.current=0; },[bloques]);
  useEffect(function(){ if(!error||intentosRef.current>=2) return; intentosRef.current++; var t=setTimeout(recargar,1800); return function(){clearTimeout(t);}; },[error]);
  function editar(dbId, titulo, contenido){ return rpc("fn_bloque_editar",{p_bloque_id:dbId,p_titulo:titulo,p_contenido:contenido}).then(function(res){ if(res.error) setError(traducirError(res.error.message)); else recargar(); return res; }); }
  function mover(dbId, nuevoOrden){ return rpc("fn_bloque_mover",{p_bloque_id:dbId,p_nuevo_orden:nuevoOrden}).then(function(res){ if(res.error) setError(traducirError(res.error.message)); return res; }); }
  return { bloques:bloques, loading:loading, error:error, recargar:recargar, editar:editar, mover:mover };
}

// ── PERFIL DE INMOBILIARIA EN LA NUBE ────────────────────────────────────────
// Mantiene una copia del perfil/branding asociada a la inmobiliaria. Si la
// instalación de Supabase tiene `inmobiliarias.configuracion` o `metadata`
// como JSON/JSONB, se usa ese campo como fuente de verdad y se conserva
// localStorage como caché para no perder cambios si la red falla.
function usePerfilSupabase(ctx, perfil, setPerfil){
  var inmobId = ctx && ctx.inmobiliaria ? ctx.inmobiliaria.id : null;
  var usuarioId = ctx && ctx.usuario ? ctx.usuario.id : null;
  var rolActual = ctx && ctx.usuario ? ctx.usuario.rol_base : null;
  var claveContexto = [inmobId,usuarioId,rolActual].join(":");
  var perfilCargado = useRef(false);
  // Distinguir cada entrada: A → B → A no reactiva callbacks del primer A.
  var entradaContexto = useMemo(function(){return {};},[claveContexto]);
  var entradaActualRef = useRef(entradaContexto);
  entradaActualRef.current = entradaContexto;
  // La respuesta de una sesión anterior jamás debe sustituir el perfil actual.
  var contextoActualRef = useRef(claveContexto);
  contextoActualRef.current = claveContexto;
  var solicitudPerfilRef = useRef(0);
  var perfilMontadoRef = useRef(false);
  useEffect(function(){
    perfilMontadoRef.current=true;
    return function(){perfilMontadoRef.current=false;};
  },[]);
  var [perfilNubeCargado,setPerfilNubeCargado]=useState(false);
  function leer(sb, idSolicitado, numeroSolicitud){
    if(!idSolicitado) return Promise.resolve();
    return sb.rpc("fn_perfil_inmobiliaria_obtener",{}).then(function(res){
      if(contextoActualRef.current !== claveContexto || solicitudPerfilRef.current !== numeroSolicitud) return;
      if(res.error) throw res.error;
      var data=res.data;
      // La nube es la fuente de verdad. No fusionar datos de localStorage de
      // otra sesión/inmobiliaria: podría arrastrar logo, modelos o identidad ajena.
      // Si todavía no existe perfil remoto, partir de defaults limpios.
      setPerfil(Object.assign({}, DEFAULT_PERFIL,
        data && data._cloud_missing!==true ? data : {nombre_usuario:data&&data.nombre_usuario||""},
        {rol:data&&data.rol||rolActual||"viewer"}));
      perfilCargado.current=true; setPerfilNubeCargado(true);
    }).catch(function(err){
      if(contextoActualRef.current !== claveContexto || solicitudPerfilRef.current !== numeroSolicitud) return;
      // No marcar como cargado si la lectura falló: evitar crear y guardar
      // modelos sobre un perfil remoto que todavía no conocemos.
      perfilCargado.current=false; setPerfilNubeCargado(false);
      dwNotify("error",traducirError(err&&err.message?err.message:"No se pudo sincronizar la configuración con la nube."));
    });
  }
  function guardarAhora(p){
    var numeroSolicitud=solicitudPerfilRef.current;
    function vigente(){return perfilMontadoRef.current&&entradaActualRef.current===entradaContexto&&contextoActualRef.current===claveContexto&&solicitudPerfilRef.current===numeroSolicitud;}
    function obsoleto(){return {contextoObsoleto:true,error:{message:"La cuenta cambió. Volvé a abrir el modelo antes de guardarlo."}};}
    if(!vigente())return Promise.resolve(obsoleto());
    if(!inmobId||!usuarioId)return Promise.resolve({error:{message:"Sin usuario o inmobiliaria activa."}});
    if(!perfilCargado.current)return Promise.resolve({error:{message:"Esperá a que se cargue la configuración de la nube antes de guardar."}});
    return loadSupabaseJs().then(async function(sb){
      if(!vigente())return obsoleto();
      if(!sb)return {error:{message:"No se pudo conectar con Supabase."}};
      // Correlación de sesión, no autorización: el rol siempre lo valida la RPC.
      var sesion=await sb.auth.getSession();
      if(!vigente())return obsoleto();
      if(sesion.error)return {error:sesion.error};
      if(!sesion.data||!sesion.data.session||sesion.data.session.user.id!==usuarioId)return obsoleto();
      var respuesta=await sb.rpc("fn_perfil_inmobiliaria_guardar",{p_datos:p});
      return vigente()?respuesta:obsoleto();
    }).catch(function(e){return vigente()?{error:{message:e&&e.message?e.message:"No se pudo guardar el perfil."}}:obsoleto();});
  }
  useEffect(function(){
    var idSolicitado=inmobId;
    var numeroSolicitud=++solicitudPerfilRef.current;
    perfilCargado.current=false; setPerfilNubeCargado(false);
    // No mostrar datos de otra inmobiliaria mientras se recupera el perfil remoto.
    setPerfil(Object.assign({}, DEFAULT_PERFIL));
    if(!idSolicitado) { setPerfilNubeCargado(true); return; }
    loadSupabaseJs().then(function(sb){
      if(contextoActualRef.current !== claveContexto || solicitudPerfilRef.current !== numeroSolicitud) return;
      if(sb) return leer(sb,idSolicitado,numeroSolicitud);
      throw new Error("No se pudo conectar con Supabase.");
    }).catch(function(err){
      if(contextoActualRef.current !== claveContexto || solicitudPerfilRef.current !== numeroSolicitud) return;
      perfilCargado.current=false; setPerfilNubeCargado(false);
      dwNotify("error",traducirError(err&&err.message?err.message:"No se pudo sincronizar la configuración con la nube."));
    });
    return function(){ ++solicitudPerfilRef.current; };
  },[claveContexto]);
  return {guardarAhora:guardarAhora,cargado:perfilNubeCargado,contexto:claveContexto};
}

function LoginGate({docworksAuth}){
  var [registro,setRegistro]=useState(function(){return new URLSearchParams(window.location.search).get("registro")==="1";});
  var [showStartupSplash,setShowStartupSplash]=useState(false); // 4.27: lo muestra StartupSplashHost.
  return <>
    {registro ? <RegistroScreen onBack={function(){setRegistro(false);}} onSubmit={docworksAuth.solicitarRegistro} loading={docworksAuth.registroLoading} error={docworksAuth.registroError} success={docworksAuth.registroSuccess}/> : <LoginScreen onLogin={docworksAuth.login} onRecover={docworksAuth.recoverPassword} onRegister={function(){setRegistro(true);}} error={docworksAuth.loginError} loading={docworksAuth.loginLoading} connError={docworksAuth.connError}/>}
    {showStartupSplash&&<SplashScreen onDone={function(){DOCWORKS_STARTUP_SPLASH_SHOWN=true;setShowStartupSplash(false);}}/>}
  </>;
}


// ── Onboarding inicial ──────────────────────────────────────────────────────
// Recorrido guiado premium: la primera pantalla presenta DocWorks y, a partir
// del segundo paso, el modal se convierte en un tooltip compacto que ilumina
// exactamente el apartado que se está explicando. No usa blur para no degradar
// la lectura ni desenfocar el contexto de la aplicación.
const PapeleraView = crearPapeleraView({Btn, ConfirmModal, PAPELERA_DIAS, TIPOS, TIPO_ICON, nombreConSufijo, useState});
const TareasPanel = crearTareasPanel({Btn, genId, getTareasDeOp, useState});
const NegociacionPanel = crearNegociacionPanel({Btn, Inp, Slt, Txa, fechaHoyISO, fmt$, fmtD, genId, useState});
const ReservaDecisionPanel = crearReservaDecisionPanel({Btn, useState});
const DocumentViewer = crearDocumentViewer({ALIASES_TOKEN_OBLIGATORIO, BODY_TEMPLATE_PRESETS, ConfirmModal, DocSummaryPanel, DocTabsBar, FichaOperacionPanel, NegociacionPanel, ReservaCompactSummary, ReservaDecisionPanel, TIPOS, TareasPanel, aplicarEncabezadoPersonalizado, buildDocSections, buildReciboSections, campoDesdeTextoFaltante, campoPrincipalErrorExport, capRol, contactosDocumento, copiarAlPortapapeles, cuerpoTrasRotulo, descargarArchivo, dwNotify, entregarArchivo, fmt$, generarDOCX, generarPDF, getBodyBlocksConfig, getBodyBlocksForDocument, getComisionComponents, getDocTabs, labelTokenObligatorio, normalizarBodyBlock, normalizarTextoDocumento, opParaDocumento, prefijoClausulaDesdeNumTitulo, prefijoClausulaFormal, resaltarFaltantes, resolveVars, revisarDocumentoIA, rolParte, tipoIdentificacion, traducirError, useEffect, useRef, useState, validarDocumentoParaExport});
const EstadisticasView = crearEstadisticasView({Btn, getComisionComponents, loadRecharts, useEffect, useState});
const CalendarioView = crearCalendarioView({finAlquilerISO, useState});
const OperacionForm = crearOperacionForm({AutosaveIndicator, Btn, EMPTY_OP, PasoResumenFinal, StepBar, StepClausulas, StepCondicionesAlquiler, StepCondicionesReservaAlq, StepDocSimple, StepEconomicoCompra, StepGarantia, StepGrupo, StepInmobiliariaAutorizada, StepInmueble, StepPersona, StepTipo, TIPO_GRUPOS, clausulaAplicaTipo, draftTieneContenido, fmt$, getCamposFaltantesDetalle, getPasoDeCampo, limpiarComisionesIncompatibles, lsSet, obtenerPlantillaConfig, rolParte, useAutosave, useCallback, useEffect, useMemo, useRef, useState});
const ClausulasView = crearClausulasView({useState, useRef, useEffect, requestDwConfirm, CLAUSULAS_DEFAULT, CLAUSULA_CATS, ClausulaFormBody, DWIcon, FORM_CLAUSULA_EMPTY, HistorialClausulaModal, TIPOS, genId, dwNotify, traducirError, narrarClausulaIA, clausulaYaEnTextoBase, clausulaAplicaTipo});
const ClausulasWorkspace = crearClausulasWorkspace({ClausulasView, CuerpoPlantillaPanel, DEFAULT_BLOQUES_RESERVA, EncabezadoFijadoPanel, PLANTILLA_TIPOS, ROLES_DEF, ReservaBloquesPanel, TIPOS, clausulaAplicaTipo, clausulaYaEnTextoBase, contarBloquesCuerpo, mostrarTokensDocWorks, obtenerIdsProtegidosDePlantillas, obtenerPlantillaConfig, navegarConProteccionModelo, requestDwConfirm, useEffect, useRef, useState});
const DashboardView = crearDashboardView({Btn, CAMPOS_CRITICOS_POR_TIPO, ConfirmModal, DWIcon, Dropdown, ESTADOS, Modal, PapeleraView, TIPOS, TIPO_ICON, aplicarEncabezadoPersonalizado, buildDocSections, campoPrincipalErrorExport, dwNotify, entregarArchivo, fmt$, generarPDF, getCamposFaltantesDetalle, getProximoPasoOperacion, loadSupabaseJs, lsGet, lsSet, nombreConSufijo, opParaDocumento, operacionCoincideBusqueda, requestDwConfirm, traducirError, useEffect, useState, validarDocumentoParaExport});
const SuperAdminDashboard = crearSuperAdminDashboard({AUTH_RED, AUTH_MUTED, descargarCSV, loadSupabaseJs, traducirError, Field, dwNotify, requestDwConfirm, fmt$, Modal, DWIcon});
const ConfiguracionView = crearConfiguracionView({Btn, CLAUSULAS_DEFAULT, ClausulaFormBody, ClausulaIAComposer, ConfirmModal, CuerpoPlantillaPanel, DEFAULT_BLOQUES_RESERVA, DEFAULT_ENCABEZADOS, DWIcon, ESTADOS, EncabezadoEditor, Field, Inp, Modal, NIVEL_LABELS, PERMS_LABELS, PLANTILLA_ESTILOS, PLANTILLA_TIPOS, ROLES_DEF, ReservaBloquesPanel, SAMPLE_OP_PREVIEW, Slt, TIPOS, TIPO_ICON, TIPO_ICON_DEFAULT, Txa, clausulaAplicaTipo, contarBloquesCuerpo, docworksMercadoPago, dwIrPasoModelo, dwNotify, SABadge: SuperAdminDashboard.SABadge, formatearNombreUsuarioVisible, genId, getEncabezadoTemplate, obtenerPlantillaConfig, obtenerVersionPlantilla, sustituirTokens, traducirError, useEffect, useRef, useState});

function DocWorksApp(){
  var docworksAuth = useDocWorksSession();
  var equipoSupabase = useEquipoSupabase(docworksAuth.contexto);
  var opsSupabase = useOperacionesSupabase(docworksAuth.contexto);
  var auditoriaSupabase = useAuditoriaSupabase(docworksAuth.contexto);
  var bloquesSupabase = useBloquesReservaSupabase(docworksAuth.contexto);
  const [darkMode,setDarkMode]=useState(function(){ return lsGet("darkMode", false); });
  const [topSearch,setTopSearch]=useState("");
  const [topSearchFocus,setTopSearchFocus]=useState(false);
  const [recentSearches,setRecentSearches]=useState(function(){return lsGet("recent_searches_v1",[]);});
  const [recentOperationIds,setRecentOperationIds]=useState(function(){return lsGet("recent_operation_ids_v1",[]);});
  useEffect(function(){ lsSet("top_search_v1",topSearch||""); },[topSearch]);
  useEffect(function(){ lsSet("recent_searches_v1",recentSearches||[]); },[recentSearches]);
  useEffect(function(){ lsSet("recent_operation_ids_v1",recentOperationIds||[]); },[recentOperationIds]);
  useEffect(function(){injectFonts();applyTheme(darkMode);initPWA();if(!document.getElementById("dw-mobile-stability-css")){var st=document.createElement("style");st.id="dw-mobile-stability-css";st.textContent=MOBILE_STABILITY_CSS;document.head.appendChild(st);}},[darkMode]);
  // iOS puede restaurar una posición intermedia mientras la barra fija y el contenido terminan de medir su altura.
  // Normalizamos una sola vez al montar la app; navegar entre vistas no vuelve a desplazar al usuario.
  useEffect(function(){
    if(typeof window==="undefined")return;
    var previousRestoration=window.history&&window.history.scrollRestoration;
    try{if(window.history&&"scrollRestoration" in window.history)window.history.scrollRestoration="manual";}catch(_e){}
    var raf=window.requestAnimationFrame(function(){try{window.scrollTo(0,0);}catch(_e){}});
    return function(){try{window.cancelAnimationFrame(raf);}catch(_e){}try{if(window.history&&previousRestoration)window.history.scrollRestoration=previousRestoration;}catch(_e){}};
  },[]);
  // Tras resolver la sesión, el shell autenticado se monta después del login; alineamos también ese primer render en iOS.
  useEffect(function(){
    var usuarioId=docworksAuth.contexto&&docworksAuth.contexto.usuario&&docworksAuth.contexto.usuario.id;
    if(!docworksAuth.session||!usuarioId||typeof window==="undefined")return;
    var raf=window.requestAnimationFrame(function(){window.requestAnimationFrame(function(){try{window.scrollTo(0,0);}catch(_e){}});});
    var timer=setTimeout(function(){try{window.scrollTo(0,0);}catch(_e){}},260);
    return function(){try{window.cancelAnimationFrame(raf);}catch(_e){}clearTimeout(timer);};
  },[docworksAuth.contexto&&docworksAuth.contexto.usuario&&docworksAuth.contexto.usuario.id]);
  const [mobilePerfilMenuOpen,setMobilePerfilMenuOpen]=useState(false);
  const mobilePerfilMenuRef=useRef(null);
  useEffect(function(){
    if(!mobilePerfilMenuOpen)return;
    function onOutside(event){
      if(mobilePerfilMenuRef.current&&!mobilePerfilMenuRef.current.contains(event.target))setMobilePerfilMenuOpen(false);
    }
    function onKey(event){if(event.key==="Escape")setMobilePerfilMenuOpen(false);}
    document.addEventListener("pointerdown",onOutside);
    document.addEventListener("keydown",onKey);
    return function(){
      document.removeEventListener("pointerdown",onOutside);
      document.removeEventListener("keydown",onKey);
    };
  },[mobilePerfilMenuOpen]);
  const [showSplash,setShowSplash]=useState(false); // 4.27: el splash lo muestra StartupSplashHost (en paralelo a la carga).
  const [dwNotice,setDwNotice]=useState(null);
  const [dwConfirm,setDwConfirm]=useState(null);
  useEffect(function(){
    function onConfirm(e){
      var d=e&&e.detail?e.detail:null;
      if(!d||typeof d.onConfirm!=="function") return;
      setDwConfirm({message:(typeof d.message==="string"||typeof d.message==="object")?(d.message||"¿Confirmás esta acción?"):String(d.message),onConfirm:d.onConfirm,confirmLabel:d.confirmLabel||"Confirmar",secondaryLabel:d.secondaryLabel,onSecondary:d.onSecondary});
    }
    window.addEventListener("dw:confirm",onConfirm);
    return function(){window.removeEventListener("dw:confirm",onConfirm);};
  },[]);
  const [showInstallChoice,setShowInstallChoice]=useState(false);
  const [isMobileOrTablet,setIsMobileOrTablet]=useState(false);
  const [isStandalone,setIsStandalone]=useState(false);
  const [isIOSDevice,setIsIOSDevice]=useState(false);
  useEffect(function(){
    function onDwNotify(e){
      var d=e&&e.detail?e.detail:null;
      if(!d||!d.message) return;
      setDwNotice({kind:d.kind||"error",message:String(d.message),ts:Date.now()});
    }
    window.addEventListener("dw:notify",onDwNotify);
    return function(){ window.removeEventListener("dw:notify",onDwNotify); };
  },[]);
  useEffect(function(){
    if(!dwNotice) return;
    var t=setTimeout(function(){setDwNotice(null);},4200);
    return function(){clearTimeout(t);};
  },[dwNotice]);
  // ── Offline-first: estado de conexión + prompt de instalación (PWA) ──
  const [isOnline,setIsOnline]=useState(function(){ return typeof navigator!=="undefined" ? navigator.onLine : true; });
  const [deferredInstallPrompt,setDeferredInstallPrompt]=useState(null);
  const [installedFlag,setInstalledFlag]=useState(function(){ return !!lsGet("dw_installed_v1",false); });
  useEffect(function(){
    function goOnline(){ setIsOnline(true); }
    function goOffline(){ setIsOnline(false); }
    function onBeforeInstall(e){ e.preventDefault(); setDeferredInstallPrompt(e); }
    function onInstalled(){ lsSet("dw_installed_v1",true); setInstalledFlag(true); setDeferredInstallPrompt(null); setShowInstallChoice(false); }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return function(){
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  function instalarApp(){
    if (!deferredInstallPrompt) return;
    var ev=deferredInstallPrompt;
    setShowInstallChoice(false);
    try{ ev.prompt(); }catch(e){ console.warn("DocWorks: no se pudo abrir el instalador.",e); }
    Promise.resolve(ev.userChoice).then(function(r){
      setDeferredInstallPrompt(null);
      if(r&&r.outcome==="accepted"){ lsSet("dw_installed_v1",true); setInstalledFlag(true); }
      else posponerInstalacion();
    }).catch(function(){ setDeferredInstallPrompt(null); });
  }
  useEffect(function(){
    function revisarDispositivo(){
      var ua=navigator.userAgent||"";
      var touch=("ontouchstart" in window)||navigator.maxTouchPoints>0;
      var mobile=esDispositivoMovilOTablet();
      var ios=esDispositivoIOS();
      var tablet=/iPad|Android(?!.*Mobile)|Tablet/i.test(ua) || (touch && Math.min(window.innerWidth,window.innerHeight)>=600 && Math.min(window.innerWidth,window.innerHeight)<=1200);
      setIsMobileOrTablet(mobile||tablet);
      setIsIOSDevice(ios);
      var standalone=!!(navigator.standalone)||!!(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches);
      setIsStandalone(standalone);
    }
    revisarDispositivo();
    window.addEventListener("resize",revisarDispositivo);
    return function(){window.removeEventListener("resize",revisarDispositivo);};
  },[]);
  // 4.16 — Tablet en vertical: navegación inferior (como en celular). En horizontal queda el panel a la izquierda.
  useEffect(function(){
    var root=document.documentElement;
    var timer=null;
    function esVertical(){
      try{ if(window.screen&&screen.orientation&&typeof screen.orientation.type==="string") return screen.orientation.type.indexOf("portrait")===0; }catch(_e){ console.debug("DocWorks: orientación no disponible",_e); }
      if(typeof window.orientation==="number") return Math.abs(window.orientation)!==90;
      return window.innerHeight>=window.innerWidth;
    }
    function revisar(){
      var tactil=!!(window.matchMedia&&window.matchMedia("(hover:none) and (pointer:coarse)").matches);
      var ladoCorto=Math.min((window.screen&&screen.width)||0,(window.screen&&screen.height)||0);
      var esTablet=tactil&&ladoCorto>=600;
      root.classList.toggle("dw-tablet-portrait",!!(esTablet&&esVertical()&&window.innerWidth>=641));
    }
    function revisarLuego(){ revisar(); clearTimeout(timer); timer=setTimeout(revisar,300); }
    revisar();
    window.addEventListener("resize",revisarLuego);
    window.addEventListener("orientationchange",revisarLuego);
    var so=null;
    try{ so=window.screen&&screen.orientation; if(so&&so.addEventListener) so.addEventListener("change",revisarLuego); }catch(_e){ console.debug("DocWorks: sin eventos de orientación",_e); }
    return function(){
      clearTimeout(timer);
      window.removeEventListener("resize",revisarLuego);
      window.removeEventListener("orientationchange",revisarLuego);
      try{ if(so&&so.removeEventListener) so.removeEventListener("change",revisarLuego); }catch(_e){ console.debug("DocWorks: limpieza de orientación",_e); }
      root.classList.remove("dw-tablet-portrait");
    };
  },[]);
  // 4.16 — Invitación a instalar la app (celular o tablet, solo si todavía no está instalada).
  // "Ahora no" la vuelve a ofrecer a los 3 días (hasta 3 veces); "No mostrar más" la apaga.
  // Además queda un botón "Instalar" visible en la barra superior mientras no esté instalada.
  function posponerInstalacion(){
    var prev=lsGet("dw_install_snooze_v2",null);
    lsSet("dw_install_snooze_v2",{n:(prev&&prev.n?prev.n:0)+1,t:Date.now()});
    setShowInstallChoice(false);
  }
  function noMostrarInstalacion(){
    lsSet("dw_install_snooze_v2",{n:99,t:Date.now()});
    setShowInstallChoice(false);
  }
  function abrirInstalacion(){ setShowInstallChoice(true); }
  useEffect(function(){
    if(!isMobileOrTablet||isStandalone||installedFlag) return;
    var s=lsGet("dw_install_snooze_v2",null);
    if(s&&(s.n>=3||(Date.now()-s.t)<3*24*3600*1000)) return;
    var timer=setTimeout(function(){setShowInstallChoice(true);},1500);
    return function(){clearTimeout(timer);};
  },[isMobileOrTablet,isStandalone,installedFlag]);
  function elegirInstalar(){
    if(deferredInstallPrompt) instalarApp();
    else posponerInstalacion();
  }
  var mostrarInstalar=isMobileOrTablet&&!isStandalone&&!installedFlag;
  const [view,setViewDirecto]=useState(function(){return lsGet("last_view_v1","dashboard");});
  function setView(next){
    if(next===view)return;
    navegarConProteccionModelo(function(){setViewDirecto(next);});
  }
  useEffect(function(){lsSet("last_view_v1",view||"dashboard");},[view]);
  // 4.08 — Los botones flotantes ("+" y asistente) se esconden al bajar y vuelven al subir.
  useEffect(function(){
    var ultimo=0;
    function onScroll(e){
      try{
        var t=e.target;
        var esPagina=(t===document||t===document.documentElement||t===document.body);
        var esContenido=!!(t&&t.classList&&t.classList.contains("content"));
        if(!esPagina&&!esContenido) return;
        var y=esPagina?(window.pageYOffset||document.documentElement.scrollTop||0):(t.scrollTop||0);
        var dy=y-ultimo;
        if(Math.abs(dy)<8) return;
        document.body.classList.toggle("dw-fab-hide",dy>0&&y>90);
        ultimo=y;
      }catch(_s){ /* sin efecto visual si falla */ }
    }
    window.addEventListener("scroll",onScroll,{capture:true,passive:true});
    return function(){ window.removeEventListener("scroll",onScroll,true); document.body.classList.remove("dw-fab-hide"); };
  },[]);
  const [showForm,setShowForm]=useState(false);
  const [editOp,setEditOp]=useState(null);
  const [formInitialOverride,setFormInitialOverride]=useState(null); // prefill de un borrador recuperado (operación nueva, sin guardar aún)
  const [draftPrompt,setDraftPrompt]=useState(null); // borrador pendiente detectado al abrir la app
  const [confirmCloseForm,setConfirmCloseForm]=useState(false);
  const [formTipo,setFormTipo]=useState(null);
  const [formFocusCampo,setFormFocusCampo]=useState(null);
  const [viewDoc,setViewDoc]=useState(null);
  const [docTab,setDocTab]=useState("resumen");
  const [docAutoAction,setDocAutoAction]=useState(null); // "pdf"|"docx"|"whatsapp"|null — acción a disparar automáticamente al abrir el visor (menú "Finalizar")
  // En Android, el botón Atrás debe cerrar primero la capa interna abierta.
  // Un único trap por capa activa evita acumular entradas en el historial en
  // cada render y que Atrás parezca no responder.
  const backTrapRef = useRef(false);
  useEffect(function(){
    var activo = !!(dwConfirm || confirmCloseForm || draftPrompt || showForm || viewDoc || view!=="dashboard");
    if(!activo) return;
    if(!backTrapRef.current){
      try { window.history.pushState({docworksBackTrap:true},"",window.location.href); backTrapRef.current=true; } catch(_e) {}
    }
    function onBack(){
      backTrapRef.current=false;
      if(dwConfirm){ setDwConfirm(null); return; }
      if(confirmCloseForm){ setConfirmCloseForm(false); return; }
      if(draftPrompt){ setDraftPrompt(null); return; }
      if(viewDoc){ setViewDoc(null); return; }
      if(showForm){ cerrarFormularioSeguro(); return; }
      if(view!=="dashboard"){ setView("dashboard"); return; }
    }
    window.addEventListener("popstate",onBack);
    return function(){ window.removeEventListener("popstate",onBack); };
  },[dwConfirm,confirmCloseForm,draftPrompt,showForm,viewDoc,view]);
  function abrirDoc(op){ setViewDoc(op); setDocTab(op&&op.tipo==="reserva" ? "reserva" : "resumen"); }
  function cerrarFormularioSeguro(){
    var draft=lsGet("draftOperacion",null);
    if(draft&&draft.data&&draftTieneContenido(draft.data)){setConfirmCloseForm(true);return;}
    lsRemove("draftOperacion");
    setShowForm(false);setEditOp(null);setFormInitialOverride(null);
  }
  async function guardarBorradorYSalir(){
    var draft=lsGet("draftOperacion",null);
    if(draft&&draft.data&&draftTieneContenido(draft.data)){
      var existingId=draft.editId||null;
      var op;
      if(existingId){
        var existente=operaciones.find(function(o){return o.id===existingId;});
        op=Object.assign({},existente||{},draft.data,{id:existingId,created_at:(existente&&existente.created_at)||new Date().toISOString(),estado:(existente&&existente.estado==="activo")?"activo":"borrador"});
      } else {
        op=Object.assign({},draft.data,{id:genId(),created_at:new Date().toISOString(),estado:"borrador"});
      }
      var previoBorrador=existingId?operaciones.find(function(o){return o.id===existingId;}):null;
      marcarOperacionPendiente(op.id);
      setOperaciones(function(ops){return existingId?ops.map(function(o){return o.id===existingId?op:o;}):[op].concat(ops);});
      var saveDraftRes;
      try { saveDraftRes=await opsSupabase.guardar(op); } catch(e) { saveDraftRes={error:e}; }
      desmarcarOperacionPendiente(op.id);
      if(saveDraftRes&&saveDraftRes.error){
        setOperaciones(function(ops){
          if(previoBorrador) return ops.map(function(o){return o.id===existingId?previoBorrador:o;});
          return ops.filter(function(o){return o.id!==op.id;});
        });
        dwNotify("error","No se pudo guardar el borrador. Tus cambios siguen en el formulario.");
        return;
      }
    }
    lsRemove("draftOperacion");setConfirmCloseForm(false);setShowForm(false);setEditOp(null);setFormInitialOverride(null);
  }
  function salirSinGuardarFormulario(){lsRemove("draftOperacion");setConfirmCloseForm(false);setShowForm(false);setEditOp(null);setFormInitialOverride(null);}

  const [clausulas,setClausulas]=useState([]);
  const [papeleraClausulas,setPapeleraClausulas]=useState([]);
  const [papeleraClausulasLoading,setPapeleraClausulasLoading]=useState(false);
  const [papeleraClausulasError,setPapeleraClausulasError]=useState("");
  const papeleraClausulasSolicitudRef=useRef(0);
  function recargarPapeleraClausulas(){
    var inmobId=clausulasInmobiliariaRef.current;
    var solicitud=++papeleraClausulasSolicitudRef.current;
    var vigente=function(){return solicitud===papeleraClausulasSolicitudRef.current&&inmobId===clausulasInmobiliariaRef.current;};
    if(!inmobId){setPapeleraClausulas([]);setPapeleraClausulasError("");setPapeleraClausulasLoading(false);return Promise.resolve({data:[]});}
    setPapeleraClausulasLoading(true);
    setPapeleraClausulasError("");
    return loadSupabaseJs().then(async function(sb){
      if(!vigente())return {cancelled:true};
      if(!sb)throw new Error("No se pudo conectar con Supabase.");
      var limite=new Date(Date.now()-30*86400000).toISOString();
      var r=await sb.from("clausulas").select("id,titulo,eliminado_en").eq("inmobiliaria_id",inmobId).eq("activo",false).gte("eliminado_en",limite).order("eliminado_en",{ascending:false});
      if(!vigente())return {cancelled:true};
      if(r.error)throw r.error;
      setPapeleraClausulas(r.data||[]);
      return {data:r.data||[]};
    }).catch(function(e){
      if(vigente())setPapeleraClausulasError(traducirError(e&&e.message?e.message:"No se pudo cargar la papelera."));
      return {error:e};
    }).finally(function(){if(vigente())setPapeleraClausulasLoading(false);});
  }
  function restaurarClausula(id){
    return clausulaRpc("fn_clausula_restaurar",{p_clausula_id:id}).then(async function(r){
      if(r&&r.error)return r;
      var actualizacion=await Promise.all([recargarClausulas(),recargarPapeleraClausulas()]);
      if(actualizacion[1]&&"error" in actualizacion[1]&&actualizacion[1].error)return {error:new Error("La cláusula fue restaurada, pero no se pudo actualizar la papelera. Volvé a cargarla.")};
      return r;
    });
  }
  const [clausulasLoading,setClausulasLoading]=useState(true);
  const [clausulasError,setClausulasError]=useState(null);
  const clausulasSolicitudRef=useRef(0);
  const clausulasInmobiliariaRef=useRef(null);
  // Una consulta anterior nunca debe publicar cláusulas de otra inmobiliaria.
  clausulasInmobiliariaRef.current=docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null;
  function recargarClausulas(){
    var inmobId=clausulasInmobiliariaRef.current;
    var solicitud=++clausulasSolicitudRef.current;
    var vigente=function(){return solicitud===clausulasSolicitudRef.current && inmobId===clausulasInmobiliariaRef.current;};
    if (!inmobId) { setClausulas([]); setClausulasLoading(false); setClausulasError(null); return Promise.resolve(); }
    setClausulasLoading(true);
    setClausulasError(null);
    return loadSupabaseJs().then(async function(sb){
      if(!vigente()) return;
      if(!sb) throw new Error("No se pudo conectar con Supabase.");
      var res=await sb.from("clausulas").select("*").eq("inmobiliaria_id",inmobId).order("orden");
      if(!vigente()) return;
      if(res.error) throw res.error;
      var registros=res.data||[];
      // No sembrar si hay registros inactivos: el usuario pudo haberlos eliminado
      // deliberadamente. Sembrar solo una biblioteca realmente nueva.
      if(registros.length===0){
        var seed=await sb.rpc("fn_clausulas_sembrar",{});
        if(!vigente()) return;
        if(seed&&seed.error) throw seed.error;
        res=await sb.from("clausulas").select("*").eq("inmobiliaria_id",inmobId).order("orden");
        if(!vigente()) return;
        if(res.error) throw res.error;
        registros=res.data||[];
      }
      setClausulas(registros.filter(function(c){return c.activo!==false;}).map(function(c){return Object.assign({},c,{titulo:(c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título"});}));
      setClausulasError(null);
    }).catch(function(err){
      if(!vigente()) return;
      setClausulasError(traducirError(err&&err.message?err.message:"No se pudieron cargar cláusulas."));
    }).finally(function(){if(vigente()) setClausulasLoading(false);});
  }
  function asegurarDatosInicialesInmobiliaria(){
    var inmobId=docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null;
    if(!inmobId) return Promise.resolve({ok:false,skipped:true});
    return loadSupabaseJs().then(function(sb){
      if(!sb) throw new Error("No se pudo conectar con Supabase.");
      return Promise.all([
        sb.rpc("fn_clausulas_sembrar",{}),
        sb.rpc("fn_bloques_reserva_sembrar",{})
      ]);
    }).then(function(results){
      var errores=results.filter(function(r){return r&&r.error;});
      if(errores.length){
        var msg=traducirError(errores[0].error.message||"No se pudieron inicializar los datos base.");
        dwNotify("error",msg);
        return {ok:false,error:errores[0].error};
      }
      return {ok:true};
    }).catch(function(err){
      var msg=traducirError(err&&err.message?err.message:"No se pudieron inicializar los datos base de la inmobiliaria.");
      dwNotify("error",msg);
      return {ok:false,error:err};
    });
  }

  useEffect(function(){ setClausulas([]); setPapeleraClausulas([]); setPapeleraClausulasError(""); setClausulasError(null); recargarClausulas(); return function(){clausulasSolicitudRef.current++;papeleraClausulasSolicitudRef.current++;}; }, [docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null]);
  useEffect(function(){ asegurarDatosInicialesInmobiliaria(); }, [docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null]);
  // Fase 1 — sistema de bloques (piloto Reserva). Guardado aparte de
  // `clausulas` (biblioteca de cláusulas opcionales) porque son dos
  // conceptos distintos: esto es el CUERPO FIJO del documento.
  const [bloquesReserva,setBloquesReserva]=useState([]);
  useEffect(function(){ if (bloquesSupabase.bloques.length || !bloquesSupabase.loading) setBloquesReserva(bloquesSupabase.bloques); }, [bloquesSupabase.bloques, bloquesSupabase.loading]);
  const [perfil,setPerfil]=useState(function(){ return Object.assign({},DEFAULT_PERFIL,lsGet("perfil", {})); });
  var perfilNube=usePerfilSupabase(docworksAuth.contexto, perfil, setPerfil);
  var perfilInicializadoRef=useRef({});
  var perfilNubeCargado=!!perfilNube.cargado;
  useEffect(function(){
    var inmobId=docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null;
    if(!inmobId || !perfilNubeCargado || clausulasLoading || clausulasError || perfilInicializadoRef.current[inmobId]) return;
    var timer=setTimeout(function(){
      setPerfil(function(cur){
        if(cur.plantillas && Object.keys(cur.plantillas).length>0){ perfilInicializadoRef.current[inmobId]=true; return cur; }
        var mapa=crearPlantillasIniciales(clausulas);
        var next=Object.assign({},cur,{plantillas:mapa,clausulas_default_ids:mapa["reserva"]?mapa["reserva"].clausulas_ids.slice():[],clausulas_default_locked:false});
        perfilInicializadoRef.current[inmobId]=true;
        // La configuración inicial no se considera persistida hasta que Supabase confirme.
        // guardarAhora puede resolver con {error} sin rechazar la promesa.
        Promise.resolve().then(function(){return perfilNube.guardarAhora(next);}).then(function(res){
          if(res && res.error) throw res.error;
        }).catch(function(err){
          perfilInicializadoRef.current[inmobId]=false;
          console.warn("DocWorks: falló la persistencia de los modelos iniciales.", err);
          dwNotify("error","Los modelos iniciales se muestran en este dispositivo, pero no se pudieron sincronizar. Revisá tu conexión antes de editarlos desde otro equipo.");
        });
        return next;
      });
    },1200);
    return function(){clearTimeout(timer);};
  },[docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null, perfilNubeCargado,clausulasLoading,clausulasError]);
  const [equipo,setEquipo]=useState(function(){ return lsGet("equipo", DEFAULT_EQUIPO); });
  useEffect(function(){
    if (equipoSupabase.equipo.length || !equipoSupabase.loading) {
      var fotos=(perfil&&perfil.broker_fotos)||{};
      setEquipo(equipoSupabase.equipo.map(function(m){ return Object.assign({},m,{fotoDataUrl:m.fotoDataUrl||fotos[m.id]||""}); }));
    }
  }, [equipoSupabase.equipo, perfil&&perfil.broker_fotos]);
  // La auditoría de cláusulas ahora la escribe el propio backend (cada
  // fn_clausula_* inserta su fila en la tabla `auditoria` de Supabase). Acá
  // solo se mantiene `auditLog` local para lo que todavía no está migrado.
  const [auditLog,setAuditLog]=useState(function(){ return lsGet("auditLog", []); });
  const perfilRef=useRef(perfil);
  useEffect(function(){ perfilRef.current=perfil; },[perfil]);
  function logAudit(accion, clausula, cambios) {
    setAuditLog(function(log){
      var entry = nuevoAuditEntry(perfilRef.current, accion, clausula, cambios);
      return [entry].concat(log).slice(0, AUDIT_LOG_MAX);
    });
  }
  function clausulaRpc(nombre, params){
    // La sesión puede cambiar mientras se descarga el cliente Supabase.
    // Nunca enviar una mutación que comenzó bajo otra inmobiliaria/cuenta.
    var contextoInicio=docworksAuth.contexto;
    var inmobiliariaInicio=contextoInicio&&contextoInicio.inmobiliaria&&contextoInicio.inmobiliaria.id;
    var usuarioInicio=contextoInicio&&contextoInicio.usuario&&contextoInicio.usuario.id;
    function sesionVigente(){
      var actual=docworksAuth.contexto;
      return !!inmobiliariaInicio && !!usuarioInicio &&
        !!actual && !!actual.inmobiliaria && actual.inmobiliaria.id===inmobiliariaInicio &&
        !!actual.usuario && actual.usuario.id===usuarioInicio;
    }
    if(!sesionVigente()) return Promise.resolve({error:{message:"La sesión cambió. Volvé a iniciar la operación."}});
    return loadSupabaseJs().then(function(sb){
      if (!sb) return { error:{ message:"No se pudo conectar con Supabase." } };
      if (!sesionVigente()) return {error:{message:"Cambió la cuenta activa antes de guardar. No se enviaron cambios."}};
      return sb.rpc(nombre, params).then(function(res){
        if(!sesionVigente()) return {error:{message:"La sesión cambió durante la operación. Actualizá los datos antes de continuar."}};
        return res;
      });
    });
  }
  function addClausula(c){
    return clausulaRpc("fn_clausula_crear", { p_titulo:c.titulo, p_contenido:c.contenido, p_categoria:c.categoria||"general", p_tipos:c.tipos||["todos"], p_obligatoria:!!c.obligatoria, p_proteccion:"B" }).then(function(res){
      if (res.error) { setClausulasError(traducirError(res.error.message)); return res; }
      recargarClausulas(); return res;
    });
  }
  function editClausula(id,d){
    var anterior = clausulas.find(function(c){return c.id===id;});
    var nueva = anterior ? Object.assign({},anterior,d) : d;
    return clausulaRpc("fn_clausula_editar", { p_clausula_id:id, p_titulo:nueva.titulo, p_contenido:nueva.contenido, p_categoria:nueva.categoria||null, p_tipos:nueva.tipos||null, p_obligatoria:typeof nueva.obligatoria==="boolean"?nueva.obligatoria:null }).then(function(res){
      if (res.error) { setClausulasError(traducirError(res.error.message)); return res; }
      recargarClausulas(); return res;
    });
  }
  function deleteClausula(id){
    // Propagar el resultado al editor y manejar también los fallos de red.
    // Sin esto, la interfaz podía interpretar una eliminación fallida como exitosa.
    return clausulaRpc("fn_clausula_eliminar", { p_clausula_id:id }).then(function(res){
      if (res && res.error) {
        var mensaje=traducirError(res.error.message||"No se pudo eliminar la cláusula.");
        setClausulasError(mensaje);
        dwNotify("error",mensaje);
        return res;
      }
      return Promise.all([recargarClausulas(),recargarPapeleraClausulas()]).then(function(){return res;});
    }).catch(function(err){
      var mensaje=traducirError(err&&err.message?err.message:"No se pudo conectar con Supabase para eliminar la cláusula.");
      setClausulasError(mensaje);
      dwNotify("error",mensaje);
      return {error:err};
    });
  }
  // Reordena una cláusula de forma atómica: una sola llamada al RPC mueve la
  // cláusula al orden destino. Esto evita las carreras que ocurrían cuando un
  // arrastre de varias posiciones disparaba varios swaps simultáneos.
  function moveClausula(id, dir, visibleIds){
    var ids=(visibleIds||[]).slice();
    var idx=ids.indexOf(id);
    var targetIdx=dir==="up"?idx-1:idx+1;
    if(idx<0||targetIdx<0||targetIdx>=ids.length) return;
    moveClausulaTo(id,ids[targetIdx],ids);
  }
  function moveClausulaTo(id,targetId,visibleIds){
    var ids=(visibleIds||[]).slice();
    var from=ids.indexOf(id), to=ids.indexOf(targetId);
    if(from<0||to<0||from===to) return Promise.resolve();
    var target=clausulas.find(function(c){return c.id===targetId;});
    if(!target) return Promise.resolve();
    var nextIds=ids.slice();
    nextIds.splice(from,1);
    nextIds.splice(to,0,id);
    setClausulas(function(cs){
      var pos={}; nextIds.forEach(function(x,i){pos[x]=i;});
      return cs.slice().sort(function(a,b){
        var pa=pos[a.id], pb=pos[b.id];
        if(pa===undefined&&pb===undefined) return (a.orden||0)-(b.orden||0);
        if(pa===undefined) return 1;
        if(pb===undefined) return -1;
        return pa-pb;
      });
    });
    return clausulaRpc("fn_clausula_mover",{p_clausula_id:id,p_nuevo_orden:target.orden}).then(function(res){
      if(res.error){ setClausulasError(traducirError(res.error.message)); return res; }
      return recargarClausulas().then(function(){return res;});
    }).catch(function(err){ setClausulasError(traducirError(err&&err.message?err.message:"No se pudo reordenar la cláusula.")); return {error:err}; });
  }
  function duplicateClausula(id){
    var original = clausulas.find(function(c){return c.id===id;});
    if (!original) return;
    clausulaRpc("fn_clausula_crear", { p_titulo:(original.titulo||"Cláusula")+" (copia)", p_contenido:original.contenido, p_categoria:original.categoria||"general", p_tipos:original.tipos||["todos"], p_obligatoria:!!original.obligatoria, p_proteccion:"B" }).then(function(res){
      if (res.error) { setClausulasError(traducirError(res.error.message)); return; }
      recargarClausulas();
    });
  }
  // ── Fase 1: edición de bloques de Reserva ──
  function updateBloqueReserva(id, cambios){
    var actual = bloquesReserva.find(function(b){return b.id===id;});
    if(!actual || !actual._dbId){
      dwNotify("info","Esta cláusula no tiene un registro de Reserva editable en Supabase. No se guardaron cambios.");
      return Promise.resolve({error:{message:"La cláusula no tiene un registro persistido."}});
    }
    var siguiente=Object.assign({},actual,cambios);
    setBloquesReserva(function(bs){return bs.map(function(b){return b.id===id?siguiente:b;});});
    return bloquesSupabase.editar(actual._dbId, cambios.titulo!==undefined?cambios.titulo:actual.titulo, cambios.contenido!==undefined?cambios.contenido:actual.contenido).then(function(res){
      if(res&&res.error){setBloquesReserva(function(bs){return bs.map(function(b){return b.id===id?actual:b;});});dwNotify("error","No se guardó la cláusula de Reserva. Se recuperó el texto anterior.");return res;}
      return res;
    }).catch(function(err){setBloquesReserva(function(bs){return bs.map(function(b){return b.id===id?actual:b;});});dwNotify("error","No se guardó la cláusula de Reserva. Se recuperó el texto anterior.");return {error:err};});
  }
  async function moveBloqueReserva(id, dir){
    var anterior=bloquesReserva.slice();
    var ordenados=anterior.slice().sort(function(a,b){return (a.orden||0)-(b.orden||0);});
    var idx=ordenados.findIndex(function(b){return b.id===id;});
    var swapIdx=dir==="up"?idx-1:idx+1;
    if(idx<0||swapIdx<0||swapIdx>=ordenados.length) return;
    var a=ordenados[idx], b2=ordenados[swapIdx], ordenTmp=a.orden;
    ordenados[idx]=Object.assign({},a,{orden:b2.orden});
    ordenados[swapIdx]=Object.assign({},b2,{orden:ordenTmp});
    var siguiente=anterior.map(function(b){var actualizado=ordenados.find(function(o){return o.id===b.id;});return actualizado||b;});
    setBloquesReserva(siguiente);
    try{
      if(a._dbId) { var r1=await bloquesSupabase.mover(a._dbId,b2.orden); if(r1&&r1.error) throw new Error(r1.error.message||"No se pudo mover la cláusula."); }
      if(b2._dbId) { var r2=await bloquesSupabase.mover(b2._dbId,ordenTmp); if(r2&&r2.error) throw new Error(r2.error.message||"No se pudo mover la cláusula."); }
    }catch(e){
      setBloquesReserva(anterior);
      dwNotify("error","No se pudo reordenar la cláusula. Se restauró el orden anterior.");
    }
  }
  // Papelera: operaciones eliminadas quedan acá con su fecha de borrado y se
  // pueden restaurar hasta 30 días después; pasado ese plazo se purgan solas.
  const [papelera,setPapelera]=useState([]);
  const [papeleraJump,setPapeleraJump]=useState(0);
  const [confirmVaciarPapelera,setConfirmVaciarPapelera]=useState(false);
  const [operaciones,setOperaciones]=useState([]);
  const pendingOperacionIds=useRef({});
  function marcarOperacionPendiente(id){ if(id) pendingOperacionIds.current[id]=Date.now(); }
  function desmarcarOperacionPendiente(id){ if(id) delete pendingOperacionIds.current[id]; }
  const globalSearchIndex=useMemo(function(){var out=[],clientes={};(operaciones||[]).forEach(function(o){out.push({kind:"documento",id:"doc-"+o.id,op:o,title:(TIPOS[o.tipo]||o.tipo||"Documento")+(o.inmueble_direccion?" · "+o.inmueble_direccion:""),text:valoresBusquedaOperacion(o).join(" ")});[["Comprador",o.comprador_nombre,o.comprador_dni,o.comprador_cuit,o.comprador_email],["Vendedor",o.vendedor_nombre,o.vendedor_dni,o.vendedor_cuit,o.vendedor_email],["Locador",o.locador_nombre,o.locador_dni,o.locador_cuit,o.locador_email],["Locatario",o.locatario_nombre,o.locatario_dni,o.locatario_cuit,o.locatario_email]].forEach(function(x){if(!x[1])return;var key=normalizarBusqueda(x.slice(1).filter(Boolean).join("|"));if(!key)return;if(!clientes[key])clientes[key]={kind:"cliente",id:"cli-"+Object.keys(clientes).length,op:o,title:String(x[1]),subtitle:x[0],text:x.slice(1).filter(Boolean).join(" ")};});});Object.keys(clientes).forEach(function(k){out.push(clientes[k]);});return out;},[operaciones]);
  const globalSearchResults=useMemo(function(){var q=normalizarBusqueda(topSearch);if(!q)return [];return globalSearchIndex.filter(function(x){return normalizarBusqueda(x.title+" "+(x.subtitle||"")+" "+x.text).includes(q);}).slice(0,10);},[globalSearchIndex,topSearch]);
  // Fuente de verdad: Supabase. Se sincroniza acá en vez de usar localStorage,
  // así funciona igual en el celular y en la PC (y entre usuarios del equipo).
  useEffect(function(){
    if (!(opsSupabase.operaciones.length || !opsSupabase.loading)) return;
    var server=opsSupabase.operaciones||[];
    var pendientes=pendingOperacionIds.current;
    if(!Object.keys(pendientes).length){ setOperaciones(server); return; }
    setOperaciones(function(local){
      var serverById={}; server.forEach(function(o){serverById[o.id]=o;});
      var localById={}; local.forEach(function(o){localById[o.id]=o;});
      var merged=server.slice();
      Object.keys(pendientes).forEach(function(id){
        if(localById[id]){
          var idx=merged.findIndex(function(o){return o.id===id;});
          if(idx>=0) merged[idx]=localById[id]; else merged.unshift(localById[id]);
        }
      });
      return merged;
    });
  }, [opsSupabase.operaciones, opsSupabase.loading]);
  useEffect(function(){ if (!opsSupabase.papeleraError && (opsSupabase.papelera.length || !opsSupabase.loading)) setPapelera(opsSupabase.papelera); }, [opsSupabase.papelera, opsSupabase.loading, opsSupabase.papeleraError]);
  function registrarBusqueda(valor){
    var q=String(valor||"").trim();
    if(!q) return;
    setRecentSearches(function(prev){
      var normalized=normalizarBusqueda(q);
      return [q].concat((prev||[]).filter(function(x){return normalizarBusqueda(x)!==normalized;})).slice(0,6);
    });
    var ids=operaciones.filter(function(o){return operacionCoincideBusqueda(o,q);}).slice(0,6).map(function(o){return o.id;});
    if(ids.length) setRecentOperationIds(function(prev){return ids.concat((prev||[]).filter(function(id){return ids.indexOf(id)<0;})).slice(0,8);});
  }
  var recentOps=recentOperationIds.map(function(id){return operaciones.find(function(o){return o.id===id;});}).filter(Boolean);
  var searchHasHistory=recentOps.length>0||recentSearches.length>0;


  // Dark/light mode toggle
  function applyTheme(dark){
    var r=document.documentElement;
    // 4.16: sin este atributo las reglas [data-theme="dark"] del CSS nunca se activaban.
    r.setAttribute("data-theme",dark?"dark":"light");
    r.style.colorScheme=dark?"dark":"light";
    try{ var tcm=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]'); if(tcm) tcm.setAttribute("content","#0b1730"); }catch(e){ console.debug("DocWorks: no se pudo actualizar theme-color",e); }
    if(dark){
      r.style.setProperty("--bg","#0a0f1a");
      r.style.setProperty("--surface","#111827");
      r.style.setProperty("--card","#131d2e");
      r.style.setProperty("--border","rgba(255,255,255,0.07)");
      r.style.setProperty("--border2","rgba(255,255,255,0.12)");
      r.style.setProperty("--text","#f1f5f9");
      r.style.setProperty("--muted","#aebbcc");
      r.style.setProperty("--dim","#8695a8");
      r.style.setProperty("--surface2","rgba(255,255,255,0.05)");
      r.style.setProperty("--input-bg","rgba(255,255,255,0.04)");
      r.style.setProperty("--input-border","rgba(255,255,255,0.12)");
      r.style.setProperty("--hover-bg","rgba(255,255,255,0.07)");
      r.style.setProperty("--gold-soft","rgba(212,168,83,0.12)");
      r.style.setProperty("--gold-line","rgba(212,168,83,0.28)");
      r.style.setProperty("--shadow-sm","0 1px 3px rgba(0,0,0,0.25)");
      r.style.setProperty("--shadow-md","0 10px 28px rgba(0,0,0,0.35)");
      r.style.setProperty("--shadow-lg","0 28px 70px rgba(0,0,0,0.45)");
      r.style.setProperty("--shadow-gold","0 4px 18px rgba(212,168,83,0.28)");
    } else {
      r.style.setProperty("--bg","#eef2f7");
      r.style.setProperty("--surface","#ffffff");
      r.style.setProperty("--card","#ffffff");
      r.style.setProperty("--border","rgba(15,23,42,0.07)");
      r.style.setProperty("--border2","rgba(15,23,42,0.12)");
      r.style.setProperty("--text","#0f172a");
      r.style.setProperty("--muted","#3f4c5e");
      r.style.setProperty("--dim","#64748b");
      r.style.setProperty("--surface2","rgba(15,23,42,0.035)");
      r.style.setProperty("--input-bg","rgba(15,23,42,0.03)");
      r.style.setProperty("--input-border","rgba(15,23,42,0.14)");
      r.style.setProperty("--hover-bg","rgba(15,23,42,0.05)");
      r.style.setProperty("--gold-soft","rgba(212,168,83,0.10)");
      r.style.setProperty("--gold-line","rgba(212,168,83,0.22)");
      r.style.setProperty("--shadow-sm","0 1px 3px rgba(15,23,42,0.06),0 1px 2px rgba(15,23,42,0.04)");
      r.style.setProperty("--shadow-md","0 8px 24px rgba(15,23,42,0.10)");
      r.style.setProperty("--shadow-lg","0 24px 64px rgba(15,23,42,0.16)");
      r.style.setProperty("--shadow-gold","0 4px 16px rgba(212,168,83,0.22)");
    }
  }
  function toggleDark(){
    setDarkMode(function(prev){
      var next=!prev;
      applyTheme(next);
      return next;
    });
  }

  // Autoguardado: persiste en localStorage cada vez que cambian estos datos,
  // para no perder nada ante una recarga accidental de la página. Todas las
  // instancias alimentan un único estado visible (saveStatus) — "saving" gana
  // mientras cualquiera esté escribiendo, y el timestamp queda con el último
  // guardado exitoso.
  const [saveStatus,setSaveStatus]=useState({state:"saved",ts:Date.now()});
  const pendingSaves=useRef(0);
  function reportSave(state){
    if(state==="saving"){
      pendingSaves.current+=1;
      setSaveStatus(function(prev){return {state:"saving",ts:prev.ts};});
    } else {
      pendingSaves.current=Math.max(0,pendingSaves.current-1);
      if(pendingSaves.current===0){
        setSaveStatus(function(prev){ return state==="error" ? {state:"error",ts:prev.ts} : {state:"saved",ts:Date.now()}; });
      }
    }
  }
  useAutosave("clausulas", clausulas, 500, reportSave);
  useAutosave("perfil", perfil, 500, reportSave);
  useAutosave("equipo", equipo, 500, reportSave);
  useAutosave("auditLog", auditLog, 500, reportSave);
  useAutosave("darkMode", darkMode, 100, reportSave);

  // Al abrir la app, si quedó un borrador de un documento que no se llegó a
  // guardar (p.ej. se cerró la pestaña mientras se cargaba), se ofrece
  // recuperarlo en vez de perderlo silenciosamente.
  useEffect(function(){
    var d = lsGet("draftOperacion", null);
    if (d && d.data && draftTieneContenido(d.data)) setDraftPrompt(d);
  }, []);

  // ── Exportar / Importar respaldo completo (JSON) ──
  function exportarRespaldo() {
    descargarRespaldoJSON({ operaciones:operaciones, papelera:papelera, clausulas:clausulas, perfil:perfil, equipo:equipo, auditLog:auditLog });
  }
  // Aplica un backup importado. `modo`: "reemplazar" pisa todo lo actual;
  // "fusionar" agrega lo que falte por id sin borrar lo que ya había.
  function importarRespaldo(rawText, modo) {
    var res = parseRespaldoJSON(rawText);
    if (!res.ok) return { ok:false, error:res.error };
    var d = res.data;
    function mergeById(actual, nuevos) {
      if (!nuevos) return actual;
      if (modo === "reemplazar") return nuevos;
      var ids = {}; actual.forEach(function(x){ ids[x.id]=true; });
      return actual.concat(nuevos.filter(function(x){ return !ids[x.id]; }));
    }
    if (d.operaciones) setOperaciones(function(cur){ return mergeById(cur, d.operaciones); });
    if (d.papelera) setPapelera(function(cur){ return purgePapeleraArr(mergeById(cur, d.papelera)); });
    if (d.clausulas) setClausulas(function(cur){ return mergeById(cur, d.clausulas); });
    if (d.equipo) setEquipo(function(cur){ return mergeById(cur, d.equipo); });
    if (d.auditLog) setAuditLog(function(cur){ return mergeById(cur, d.auditLog).slice(0, AUDIT_LOG_MAX); });
    if (d.perfil) setPerfil(function(cur){ return modo==="reemplazar" ? Object.assign({},DEFAULT_PERFIL,d.perfil) : Object.assign({},DEFAULT_PERFIL,d.perfil,cur); });
    logAudit("importar", { id:null, titulo:"Respaldo importado ("+modo+")" }, null);
    dwNotify("warning","El respaldo se importó en este dispositivo; la importación no escribe directamente en Supabase. Verificá el estado de sincronización de las operaciones antes de dar el proceso por terminado.");
    return { ok:true };
  }

  function exportarOperacionesCSV(){
    var periodo=window.prompt("Exportar operaciones y comisiones\n\n1 = Año en curso\n2 = Últimos 3 meses\n3 = Últimos 6 meses\n4 = Últimos 12 meses\n5 = Todo el historial", "1");
    if(periodo===null)return;
    periodo=String(periodo).trim();
    if(["1","2","3","4","5"].indexOf(periodo)<0){dwNotify("warning","Elegí una opción del 1 al 5 para exportar.");return;}
    var fechaCorte=new Date();fechaCorte.setHours(0,0,0,0);
    var u=(docworksAuth.contexto&&docworksAuth.contexto.usuario)||{},esBroker=u.rol_base==="broker";
    var visible=(esBroker&&u.id?operaciones.filter(function(o){return o.broker_id===u.id;}):operaciones.slice()).filter(function(o){
      if(periodo==="5")return true;
      var f=String(o.created_at||"").slice(0,10);if(!f)return false;
      if(periodo==="1")return f.slice(0,4)===String(fechaCorte.getFullYear());
      var meses=parseInt(periodo,10)===2?3:parseInt(periodo,10)===3?6:12;
      var desde=new Date(fechaCorte.getFullYear(),fechaCorte.getMonth()-(meses-1),1);desde.setHours(0,0,0,0);
      return new Date(f+"T00:00:00")>=desde&&new Date(f+"T00:00:00")<=fechaCorte;
    });
    if(!visible.length){dwNotify("warning","No hay operaciones en el período seleccionado.");return;}
    var splitDefault=Math.max(0,Math.min(100,parseFloat((perfil&&perfil.broker_split_pct)!=null?perfil.broker_split_pct:50)||0));
    var splitMode=(perfil&&perfil.broker_split_mode)==="individual"?"individual":"uniforme",splitMap=(perfil&&perfil.broker_splits&&typeof perfil.broker_splits==="object")?perfil.broker_splits:{};
    var filas=visible.map(function(o){var items=getComisionComponents(o)||[],split=splitMode==="individual"&&o.broker_id&&splitMap[o.broker_id]!=null?Math.max(0,Math.min(100,parseFloat(splitMap[o.broker_id])||0)):splitDefault;var usd=items.filter(function(i){return i.moneda==="USD";}).reduce(function(a,i){return a+(parseFloat(i.monto)||0);},0),ars=items.filter(function(i){return i.moneda!=="USD";}).reduce(function(a,i){return a+(parseFloat(i.monto)||0);},0);return {fecha:(o.created_at||"").slice(0,10),tipo:TIPOS[o.tipo]||o.tipo||"",estado:ESTADOS[o.estado]||o.estado||"",direccion:o.inmueble_direccion||"",comprador:o.comprador_nombre||o.locatario_nombre||"",vendedor:o.vendedor_nombre||o.locador_nombre||"",precio:o.precio||o.alquiler_monto_inicial||o.res_alq_monto_mensual||"",moneda:o.moneda||o.alquiler_moneda||o.res_alq_moneda||"",agente:o.broker_nombre||o.broker||"",comision_usd:usd,comision_ars:ars,participacion_agente_pct:split,agente_usd:o.broker_id?usd*split/100:0,agente_ars:o.broker_id?ars*split/100:0};});
    var etiqueta=periodo==="1"?"anio-"+fechaCorte.getFullYear():periodo==="2"?"ultimos-3-meses":periodo==="3"?"ultimos-6-meses":periodo==="4"?"ultimos-12-meses":"historial-completo";
    descargarCSV(filas,"docworks-operaciones-comisiones-"+etiqueta+"-"+new Date().toISOString().slice(0,10)+".csv");
  }

  async function saveOp(data,accion,estadoFinal){
    var esNueva=!editOp;
    if(esNueva && !draftTieneContenido(data)){
      dwNotify("warning","Todavía no cargaste datos de la operación. Completá al menos un dato antes de guardarla.");
      return {error:new Error("Operación vacía")};
    }
    var opGuardada;
    if(editOp){
      opGuardada=Object.assign({},data,{id:editOp.id,created_at:editOp.created_at});
    } else {
      opGuardada=Object.assign({},data,{id:genId(),created_at:new Date().toISOString()});
    }
    var estadoElegido;
    var estadoOriginal=editOp ? (editOp.estado||"borrador") : null;
    if(editOp && estadoOriginal==="activo" && (!estadoFinal || estadoFinal==="borrador")){
      // Editar un documento ACTIVO no lo convierte accidentalmente en borrador.
      estadoElegido="activo";
    } else {
      estadoElegido=(estadoFinal==="activo"||estadoFinal==="cerrado"||estadoFinal==="borrador")?estadoFinal:(accion==="borrador"?"borrador":(opGuardada.estado||"activo"));
    }
    opGuardada.estado=estadoElegido;
    // Una operación nueva queda asociada a la versión de plantilla vigente.
    // Al editar un contrato existente conservamos la versión histórica.
    opGuardada=sellarVersionPlantillaOperacion(opGuardada,perfil,!editOp,clausulas,bloquesReserva);
    var parentParaCerrar=(opGuardada.tipo==="devolucion_reserva" && opGuardada.parent_id && opGuardada.estado!=="borrador") ? operaciones.find(function(o){return o.id===opGuardada.parent_id;}) : null;
    marcarOperacionPendiente(opGuardada.id);
    if(parentParaCerrar) marcarOperacionPendiente(parentParaCerrar.id);
    reportSave("saving");
    try {
      var res=await opsSupabase.guardar(opGuardada);
      if(res&&res.error){
        reportSave("error");
        desmarcarOperacionPendiente(opGuardada.id);
        if(parentParaCerrar) desmarcarOperacionPendiente(parentParaCerrar.id);
        dwNotify("error","No se pudo guardar la operación. "+traducirError(res.error.message||"Error de comunicación con Supabase."));
        return res;
      }
      setOperaciones(function(ops){
        var base = esNueva ? [opGuardada].concat(ops) : ops.map(function(o){return o.id===editOp.id?opGuardada:o;});
        if(opGuardada.tipo==="devolucion_reserva" && opGuardada.parent_id && opGuardada.estado!=="borrador") {
          return base.map(function(o){return o.id===opGuardada.parent_id?Object.assign({},o,{proceso_estado:"rechazada",estado:"cerrado"}):o;});
        }
        return base;
      });
      if(parentParaCerrar) {
        var parentCerrado=Object.assign({},parentParaCerrar,{proceso_estado:"rechazada",estado:"cerrado"});
        // El guardado de la devolución ya fue confirmado. El cierre del padre es
        // una operación secundaria: si falla, no debemos presentar todo el guardado
        // como fallido ni dejar el formulario abierto, porque el usuario podría duplicar
        // la devolución al volver a intentarlo.
        var errorCierrePadre=null;
        try {
          var parentRes=await opsSupabase.guardar(parentCerrado);
          if(parentRes&&parentRes.error) errorCierrePadre=parentRes.error;
        } catch(errCierrePadre) { errorCierrePadre=errCierrePadre; }
        if(errorCierrePadre) {
          var mensajeCierre=traducirError(errorCierrePadre.message||"Error de comunicación con Supabase.");
          try{lsSet("docworks:devolucion:cierre-pendiente:"+parentCerrado.id,{parentId:parentCerrado.id,devolucionId:opGuardada.id,ts:Date.now(),mensaje:mensajeCierre});}catch(_e){}
          setOperaciones(function(ops){return ops.map(function(o){return o.id===parentCerrado.id?Object.assign({},o,{estado:"cerrado",proceso_estado:"pendiente_cierre_devolucion"}):o;});});
          dwNotify("warning","La devolución se guardó correctamente, pero el cierre de la reserva vinculada quedó pendiente. DocWorks lo reintentará al recuperar la conexión. "+mensajeCierre);
        }
        else { try{lsRemove("docworks:devolucion:cierre-pendiente:"+parentCerrado.id);}catch(_e){} setOperaciones(function(ops){return ops.map(function(o){return o.id===parentCerrado.id?parentCerrado:o;});}); }
        desmarcarOperacionPendiente(parentCerrado.id);
      }
      desmarcarOperacionPendiente(opGuardada.id);
      reportSave("saved");
      lsRemove("draftOperacion");
      setShowForm(false);setEditOp(null);setFormInitialOverride(null);
      if(accion==="pdf"||accion==="whatsapp"){
        setDocAutoAction(accion==="whatsapp"?"whatsapp":null);
        abrirDoc(opGuardada);
      }
    } catch(e) {
      // Si la devolución ya se guardó/localizó pero el cierre del padre falla por
      // desconexión o excepción de red, persistimos una marca local para reintentar.
      if(parentParaCerrar) {
        var parentPendiente=Object.assign({},parentParaCerrar,{estado:"cerrado",proceso_estado:"pendiente_cierre_devolucion"});
        try{lsSet("docworks:devolucion:cierre-pendiente:"+parentPendiente.id,{parentId:parentPendiente.id,devolucionId:opGuardada.id,ts:Date.now(),mensaje:traducirError(e&&e.message?e.message:"Error de comunicación con Supabase.")});}catch(_eMark){}
        setOperaciones(function(ops){return ops.map(function(o){return o.id===parentPendiente.id?Object.assign({},o,{proceso_estado:"pendiente_cierre_devolucion"}):o;});});
      }
      reportSave("error");
      desmarcarOperacionPendiente(opGuardada.id);
      if(parentParaCerrar) desmarcarOperacionPendiente(parentParaCerrar.id);
      dwNotify("error",parentParaCerrar
        ? "No se pudo completar el guardado/cierre por un problema de conexión. La reserva quedó marcada para reintentar el cierre cuando vuelva la conexión. "+traducirError(e&&e.message?e.message:"Error de comunicación con Supabase.")
        : "No se pudo guardar la operación. "+traducirError(e&&e.message?e.message:"Error de comunicación con Supabase."));
      return {error:e};
    }
  }
  // Refs para leer el estado actual (el efecto de abajo conserva una versión vieja de la función).
  const showFormRef=useRef(false); showFormRef.current=showForm;
  const draftPromptRef=useRef(null); draftPromptRef.current=draftPrompt;
  async function sincronizarDraftOffline(){
    if(!navigator.onLine||!docworksAuth.session)return;
    // Con el formulario abierto o mientras se pregunta si recuperar el borrador no se sube en silencio:
    // eso duplicaba operaciones y borraba el borrador en uso.
    if(showFormRef.current||draftPromptRef.current)return;
    var draft=lsGet("draftOperacion",null);if(!draft||!draft.data||!draftTieneContenido(draft.data))return;
    var existingId=draft.editId||null,existente=existingId?operaciones.find(function(o){return o.id===existingId;}):null;
    var op=Object.assign({},existente||{},draft.data,{id:existingId||genId(),created_at:(existente&&existente.created_at)||new Date().toISOString(),estado:(existente&&existente.estado)||"borrador"});
    try{var res=await opsSupabase.guardar(op);if(res&&!res.error){setOperaciones(function(ops){return existingId?ops.map(function(o){return o.id===existingId?op:o;}):[op].concat(ops);});lsRemove("draftOperacion");dwNotify("success","La operación cargada sin conexión ya fue sincronizada con DocWorks.");}}catch(e){console.warn("DocWorks: no se pudo sincronizar el borrador offline.",e);}
  }
  // Reintenta cierres de reservas que quedaron pendientes después de guardar
  // una devolución. La devolución ya existe; este proceso solo completa el cierre
  // del padre y nunca crea una segunda devolución.
  async function reintentarCierresDevolucion(){
    if(!navigator.onLine || !docworksAuth.session) return;
    var pendientes=(operaciones||[]).filter(function(o){
      return o && o.id && o.proceso_estado==="pendiente_cierre_devolucion"
        && (operaciones||[]).some(function(h){return h && h.tipo==="devolucion_reserva" && h.parent_id===o.id && h.estado!=="borrador";});
    });
    for(var i=0;i<pendientes.length;i++){
      var padre=pendientes[i],marca=null;
      try{marca=lsGet("docworks:devolucion:cierre-pendiente:"+padre.id,null);}catch(_e){}
      // El estado pendiente en la operación es suficiente para recuperar el reintento
      // si la marca auxiliar de localStorage se perdió; no se crea otra devolución.
      var cerrado=Object.assign({},padre,{estado:"cerrado",proceso_estado:"rechazada"});
      marcarOperacionPendiente(cerrado.id);
      try{
        var resultado=await opsSupabase.guardar(cerrado);
        if(resultado && resultado.error) continue;
        try{lsRemove("docworks:devolucion:cierre-pendiente:"+padre.id);}catch(_e2){}
        setOperaciones(function(prev){return prev.map(function(o){return o.id===cerrado.id?cerrado:o;});});
        dwNotify("success","Se completó el cierre pendiente de la reserva vinculada a la devolución.");
      }catch(_e3){ /* queda marcado para el próximo intento */ }
      finally{desmarcarOperacionPendiente(cerrado.id);}
    }
  }
  useEffect(function(){
    var timer=null;
    function ejecutarReintentos(){sincronizarDraftOffline();reintentarCierresDevolucion();}
    function reintentar(){if(timer)clearTimeout(timer);timer=setTimeout(ejecutarReintentos,350);}
    window.addEventListener("online",reintentar);
    if(navigator.onLine)timer=setTimeout(ejecutarReintentos,500);
    return function(){window.removeEventListener("online",reintentar);if(timer)clearTimeout(timer);};
  },[docworksAuth.session,operaciones]);

  // "Eliminar" mueve la operación a la Papelera y la conserva 30 días.
  // 4.08 — Eliminación directa: la lista de Operaciones ya pide confirmación propia,
  // así que no se vuelve a preguntar (antes aparecía una segunda confirmación y la tarjeta
  // reaparecía a medio animar).
  function eliminarOpDirecto(id){
    setOperaciones(function(ops){
      var op=ops.find(function(o){return o.id===id;});
      if(op)setPapelera(function(p){return [Object.assign({},op,{deleted_at:new Date().toISOString()})].concat(p);});
      return ops.filter(function(o){return o.id!==id;});
    });
    opsSupabase.eliminar(id);
  }
  function restoreOp(id){
    setPapelera(function(p){
      var op=p.find(function(o){return o.id===id;});
      if(op){var restored=Object.assign({},op);delete restored.deleted_at;setOperaciones(function(ops){return [restored].concat(ops);});}
      return p.filter(function(o){return o.id!==id;});
    });
    opsSupabase.restaurar(id);
  }
  function deleteOpPermanente(id){ setPapelera(function(p){return p.filter(function(o){return o.id!==id;});}); opsSupabase.eliminarPermanente(id); }
  function vaciarPapelera(){ setPapelera([]); setConfirmVaciarPapelera(false); opsSupabase.vaciarPapelera(); }
  // Purga automática: al abrir la app, lo que lleva más de 30 días en la
  // papelera se elimina definitivamente sin intervención del usuario.
  // (La purga real ahora la hace fn_operaciones_purgar_vencidas() en el
  // servidor; esto solo limpia la vista local por si quedó algo residual.)
  useEffect(function(){ setPapelera(function(p){return purgePapeleraArr(p);}); },[]);
  async function persistirOperacionConRollback(next){
    if(!next||!next.id) return {error:{message:"Operación inválida."}};
    var previo=operaciones.find(function(o){return o.id===next.id;});
    if(previo){
      var cambios=[];
      ["estado","precio","moneda","inmueble_direccion","comprador_nombre","vendedor_nombre","locador_nombre","locatario_nombre"].forEach(function(k){
        var a=previo[k]==null?"":String(previo[k]), b=next[k]==null?"":String(next[k]);
        if(a!==b) cambios.push(k+": "+(a||"—")+" → "+(b||"—"));
      });
      if(cambios.length) next=Object.assign({},next,{historial_operacion:(Array.isArray(previo.historial_operacion)?previo.historial_operacion:[]).concat([{id:genId(),ts:new Date().toISOString(),actorNombre:(perfilRef.current&&(perfilRef.current.nombre_usuario||perfilRef.current.nombre))||"Usuario",actorRol:(perfilRef.current&&perfilRef.current.rol)||"",accion:"Operación actualizada",detalle:cambios.join(" · ")}]).slice(-100)});
    } else if(!Array.isArray(next.historial_operacion)) next=Object.assign({},next,{historial_operacion:[{id:genId(),ts:new Date().toISOString(),actorNombre:(perfilRef.current&&(perfilRef.current.nombre_usuario||perfilRef.current.nombre))||"Usuario",actorRol:(perfilRef.current&&perfilRef.current.rol)||"",accion:"Operación creada",detalle:"Se creó la operación en DocWorks."}]});
    marcarOperacionPendiente(next.id);
    setOperaciones(function(ops){
      var existe=ops.some(function(o){return o.id===next.id;});
      return existe ? ops.map(function(o){return o.id===next.id?next:o;}) : [next].concat(ops);
    });
    var res;
    try { res=await opsSupabase.guardar(next); } catch(e) { res={error:e}; }
    desmarcarOperacionPendiente(next.id);
    if(res&&res.error){
      dwNotify("error","No se pudo guardar la operación. "+traducirError(res.error.message||"Error de comunicación con Supabase."));
      if(previo){
        setOperaciones(function(ops){return ops.map(function(o){return o.id===next.id?previo:o;});});
      } else {
        setOperaciones(function(ops){return ops.filter(function(o){return o.id!==next.id;});});
      }
    }
    return res;
  }
  async function restaurarVersion(version){
    var snap=version&&version.documento?version.documento:null;
    if(!snap||!snap.id||!snap.datos){dwNotify("error","La versión seleccionada no tiene un respaldo válido.");return;}
    var op=Object.assign({},snap.datos,{id:snap.id,tipo:snap.tipo||version.tipo_documento,estado:snap.estado||"borrador",parent_id:snap.parent_id||null,created_at:snap.creado_en||undefined});
    try{var res=await opsSupabase.guardar(op);if(res&&res.error){dwNotify("error","No se pudo restaurar la versión. "+traducirError(res.error.message));return;}setOperaciones(function(ops){return ops.map(function(o){return o.id===op.id?op:o;});});dwNotify("success","Versión "+version.version+" restaurada. La versión anterior quedó conservada en el historial.");}catch(e){console.warn("DocWorks: error restaurando versión.",e);dwNotify("error","No se pudo restaurar la versión.");}
  }
  function changeEstado(id,estado){
    var previo=operaciones.find(function(o){return o.id===id;});
    if(!previo) return;
    persistirOperacionConRollback(Object.assign({},previo,{estado:estado}));
  }
  // Centro de tareas: togglea una tarea del checklist operativo. Actualiza
  // tanto la lista de operaciones como el viewDoc abierto (que es una copia
  // congelada al momento de abrir el modal), para que el check se refleje
  // al instante sin tener que cerrar y volver a abrir el documento.
  async function toggleTarea(opId,tareaId){
    var previo=operaciones.find(function(o){return o.id===opId;});
    if(!previo) return;
    var td=Object.assign({},previo.tareas_done||{}); td[tareaId]=!td[tareaId];
    var actualizado=Object.assign({},previo,{tareas_done:td});
    setViewDoc(function(v){
      if(!v||v.id!==opId) return v;
      return Object.assign({},v,{tareas_done:td});
    });
    var res=await persistirOperacionConRollback(actualizado);
    if(res&&res.error){
      setViewDoc(function(v){return v&&v.id===opId?Object.assign({},v,{tareas_done:previo.tareas_done||{}}):v;});
    }
  }
  function duplicarOp(op){var copia=Object.assign({},op,{id:genId(),estado:"borrador",created_at:new Date().toISOString()});marcarOperacionPendiente(copia.id);setOperaciones(function(ops){return[copia].concat(ops);});Promise.resolve(opsSupabase.guardar(copia)).finally(function(){desmarcarOperacionPendiente(copia.id);});}
  // Una operación sólo puede dar origen a UN documento derivado de cada tipo (un solo
  // Comodato, un solo Refuerzo, un solo Contrato desde Reserva de Locación). Esto evita
  // duplicados y mantiene la "carpeta" de la operación prolija.
  function yaConvertido(opId, tipoHijo){ return operaciones.some(function(o){return o.parent_id===opId && o.tipo===tipoHijo;}); }
  function convertirAContrato(op){
    if(yaConvertido(op.id,"alquiler")) return;
    var nuevo=Object.assign({},EMPTY_OP,{tipo:"alquiler",estado:"borrador",parent_id:op.id,locador_nombre:op.locador_nombre,locador_dni:op.locador_dni,locador_domicilio:op.locador_domicilio,locador_email:op.locador_email,locatario_nombre:op.locatario_nombre,locatario_dni:op.locatario_dni,locatario_domicilio:op.locatario_domicilio,locatario_email:op.locatario_email,inmueble_direccion:op.inmueble_direccion,inmueble_partido:op.inmueble_partido,inmueble_provincia:op.inmueble_provincia,nomenclatura_catastral:op.nomenclatura_catastral,descripcion_inmueble:op.descripcion_inmueble,inmueble_tipo:op.inmueble_tipo||"departamento",alquiler_monto_inicial:op.res_alq_monto_mensual||"",alquiler_moneda:op.res_alq_moneda||op.res_alq_monto_mensual_moneda||"ARS",alquiler_plazo_meses:String(plazoReservaAlquiler(op).meses),alquiler_plazo_dias:String(plazoReservaAlquiler(op).dias),alquiler_inicio:op.res_alq_inicio_estimado||"",alquiler_destino:op.res_alq_destino||"vivienda",alquiler_comision:valorComisionPredeterminado(op.res_alq_comision,"1"),clausulas_ids:op.clausulas_ids||[],clausulas_custom:op.clausulas_custom||""});
    var conId=Object.assign({},nuevo,{id:genId(),created_at:new Date().toISOString()});
    marcarOperacionPendiente(conId.id);
    setOperaciones(function(ops){return[conId].concat(ops);});
    Promise.resolve(opsSupabase.guardar(conId)).finally(function(){desmarcarOperacionPendiente(conId.id);});
    setEditOp(conId); setFormTipo("alquiler"); setShowForm(true);
  }
  function convertirARefuerzo(op){
    if(yaConvertido(op.id,"refuerzo_reserva")) return;
    var nuevo=Object.assign({},EMPTY_OP,{
      tipo:"refuerzo_reserva", estado:"borrador", parent_id:op.id,
      comprador_nombre:op.comprador_nombre||"", comprador_dni:op.comprador_dni||"",
      comprador_domicilio:op.comprador_domicilio||"", comprador_email:op.comprador_email||"",
      vendedor_nombre:op.vendedor_nombre||"", vendedor_dni:op.vendedor_dni||"",
      vendedor_domicilio:op.vendedor_domicilio||"", vendedor_email:op.vendedor_email||"",
      inmueble_direccion:op.inmueble_direccion||"", inmueble_partido:op.inmueble_partido||"",
      inmueble_provincia:op.inmueble_provincia||"", inmueble_tipo:op.inmueble_tipo||"departamento",
      refuerzo_trayectoria:"Reserva original firmada el "+new Date(op.created_at).toLocaleDateString("es-AR")+" por "+fmt$(op.anticipo,op.moneda)+" de seña sobre precio total "+fmt$(op.precio,op.moneda)+".",
      clausulas_ids:op.clausulas_ids||[], clausulas_custom:op.clausulas_custom||"",
    });
    var conId=Object.assign({},nuevo,{id:genId(),created_at:new Date().toISOString()});
    marcarOperacionPendiente(conId.id);
    setOperaciones(function(ops){return[conId].concat(ops);});
    Promise.resolve(opsSupabase.guardar(conId)).finally(function(){desmarcarOperacionPendiente(conId.id);});
    setEditOp(conId); setFormTipo("refuerzo_reserva"); setShowForm(true);
  }
  async function onUpdateOperationGlobal(next){
    if(!next||!next.id) return;
    var previo=operaciones.find(function(o){return o.id===next.id;});
    setViewDoc(function(v){return v&&v.id===next.id?next:v;});
    var res=await persistirOperacionConRollback(next);
    if(res&&res.error&&previo){
      setViewDoc(function(v){return v&&v.id===next.id?previo:v;});
    }
    return res;
  }
  function onActionWorkflow(op,action){
    if(action==="devolucion") onConvertirDevolucion(op);
    if(action==="continuar") abrirDoc(op);
    if(action==="negociacion"){ abrirDoc(op); setTimeout(function(){ setDocTab("negociacion"); },0); }
  }
  function onConvertirDevolucion(op){
    if(yaConvertido(op.id,"devolucion_reserva")) return;
    var nuevo=Object.assign({},EMPTY_OP,{tipo:"devolucion_reserva",estado:"borrador",parent_id:op.id,proceso_estado:"pendiente_devolucion",comprador_nombre:op.comprador_nombre||"",comprador_dni:op.comprador_dni||"",comprador_domicilio:op.comprador_domicilio||"",vendedor_nombre:op.vendedor_nombre||"",vendedor_dni:op.vendedor_dni||"",vendedor_domicilio:op.vendedor_domicilio||"",inmueble_direccion:op.inmueble_direccion||"",inmueble_partido:op.inmueble_partido||"",inmueble_provincia:op.inmueble_provincia||"",precio:op.anticipo||op.precio||"",moneda:op.moneda||"USD",devolucion_motivo:"La reserva no avanzó y corresponde devolver el monto oportunamente entregado.",negociacion_historial:op.negociacion_historial||[],clausulas_ids:op.clausulas_ids||[]});
    var conId=Object.assign({},nuevo,{id:genId(),created_at:new Date().toISOString()});
    marcarOperacionPendiente(conId.id);
    setOperaciones(function(ops){return[conId].concat(ops);});
    Promise.resolve(opsSupabase.guardar(conId)).finally(function(){desmarcarOperacionPendiente(conId.id);});
    setEditOp(conId);setFormTipo("devolucion_reserva");setShowForm(true);
  }
  function convertirABoleto(op){
    if(yaConvertido(op.id,"boleto")) return;
    // Los datos de partes/inmueble/precio se heredan de la reserva, pero la
    // fecha de posesión y la escribanía casi siempre cambian entre la seña y
    // la firma del boleto — se dejan en blanco a propósito para que se
    // vuelvan a cargar, en vez de arrastrar por error la fecha de la reserva.
    var nuevo=Object.assign({},EMPTY_OP,{
      tipo:"boleto", estado:"borrador", parent_id:op.id,
      comprador_nombre:op.comprador_nombre||"", comprador_dni:op.comprador_dni||"",
      comprador_domicilio:op.comprador_domicilio||"", comprador_email:op.comprador_email||"", comprador_telefono:op.comprador_telefono||"",
      vendedor_nombre:op.vendedor_nombre||"", vendedor_dni:op.vendedor_dni||"",
      vendedor_domicilio:op.vendedor_domicilio||"", vendedor_email:op.vendedor_email||"", vendedor_telefono:op.vendedor_telefono||"",
      inmueble_direccion:op.inmueble_direccion||"", inmueble_partido:op.inmueble_partido||"",
      inmueble_provincia:op.inmueble_provincia||"", nomenclatura_catastral:op.nomenclatura_catastral||"",
      inmueble_tipo:op.inmueble_tipo||"departamento", descripcion_inmueble:op.descripcion_inmueble||"",
      precio:op.precio||"", moneda:op.moneda||"USD", anticipo:op.anticipo||"", comision_porcentaje:valorComisionPredeterminado(op.comision_porcentaje,""),
      // A pedir de nuevo: fecha de posesión/firma y datos de escribanía.
      fecha_posesion:"", escribania:"", escribania_observaciones:"", saldo:"",
      entrega_aires_detalle:op.entrega_aires_detalle||"", entrega_muebles_detalle:op.entrega_muebles_detalle||"",
      entrega_aires_detalle_id:op.entrega_aires_detalle_id||"", entrega_muebles_detalle_id:op.entrega_muebles_detalle_id||"",
      clausulas_ids:op.clausulas_ids||[], clausulas_custom:op.clausulas_custom||"",
    });
    var conId=Object.assign({},nuevo,{id:genId(),created_at:new Date().toISOString()});
    marcarOperacionPendiente(conId.id);
    setOperaciones(function(ops){return[conId].concat(ops);});
    Promise.resolve(opsSupabase.guardar(conId)).finally(function(){desmarcarOperacionPendiente(conId.id);});
    setEditOp(conId); setFormTipo("boleto"); setShowForm(true);
  }
  function convertirAComodato(op){
    if(yaConvertido(op.id,"comodato")) return;
    var nuevo=Object.assign({},EMPTY_OP,{
      tipo:"comodato", estado:"borrador", parent_id:op.id,
      // Comprador de la reserva → Comodatario (quien recibe)
      comprador_nombre:op.comprador_nombre||"", comprador_dni:op.comprador_dni||"",
      comprador_domicilio:op.comprador_domicilio||"", comprador_email:op.comprador_email||"",
      comprador_telefono:op.comprador_telefono||"",
      // Vendedor de la reserva → Comodante
      vendedor_nombre:op.vendedor_nombre||"", vendedor_dni:op.vendedor_dni||"",
      vendedor_domicilio:op.vendedor_domicilio||"", vendedor_email:op.vendedor_email||"",
      vendedor_telefono:op.vendedor_telefono||"",
      // Inmueble
      inmueble_direccion:op.inmueble_direccion||"", inmueble_partido:op.inmueble_partido||"",
      inmueble_provincia:op.inmueble_provincia||"", inmueble_tipo:op.inmueble_tipo||"departamento",
      descripcion_inmueble:op.descripcion_inmueble||"",
      clausulas_ids:op.clausulas_ids||[], clausulas_custom:op.clausulas_custom||"",
    });
    var conId=Object.assign({},nuevo,{id:genId(),created_at:new Date().toISOString()});
    marcarOperacionPendiente(conId.id);
    setOperaciones(function(ops){return[conId].concat(ops);});
    Promise.resolve(opsSupabase.guardar(conId)).finally(function(){desmarcarOperacionPendiente(conId.id);});
    setEditOp(conId); setFormTipo("comodato"); setShowForm(true);
  }

  const navItems=[
    {id:"dashboard",   label:"Operaciones",  icon:"▦", ico:"ops"},
    {id:"estadisticas",label:"Estadísticas",  icon:"◎", ico:"stats"},
    {id:"calendario",  label:"Calendario",    icon:"📅", ico:"calendar"},
    {id:"clausulas",   label:"Cláusulas",     icon:"§", ico:"clauses"},
    {id:"configuracion",label:"Configuración",icon:"⚙", ico:"settings"},
  ];
  const mobileNavItems=[
    {id:"dashboard",    label:"Operaciones",  icon:"▦", ico:"ops"},
    {id:"estadisticas", label:"Panel",        icon:"◎", ico:"stats"},
    {id:"calendario",   label:"Calendario",   icon:"📅", ico:"calendar"},
    {id:"clausulas",    label:"Cláusulas",    icon:"§", ico:"clauses"},
    {id:"configuracion",label:"Configuración",icon:"⚙", ico:"settings"},
  ];

  const [showBot,setShowBot]=useState(false);
  const [anuncioUsuario,setAnuncioUsuario]=useState(null);
  const [anuncioCerrado,setAnuncioCerrado]=useState(false);
  useEffect(function(){
    if(!docworksAuth.session || !docworksAuth.contexto || docworksAuth.contexto.es_super_admin) return;
    loadSupabaseJs().then(function(sb){return sb?sb.rpc("fn_super_get_anuncio_global",{}):null;}).then(function(res){
      if(res&&!res.error&&res.data){var fin=res.data.fecha_fin?new Date(res.data.fecha_fin):null;if(!fin||fin.getTime()>=Date.now())setAnuncioUsuario(res.data);}
    }).catch(function(){});
  },[docworksAuth.session,docworksAuth.contexto&&docworksAuth.contexto.usuario&&docworksAuth.contexto.usuario.id]);
  const onboardingStorageKey = "docworks_onboarding_seen_v1_" + ((docworksAuth.contexto && docworksAuth.contexto.usuario && docworksAuth.contexto.usuario.id) || "local");
  const [showOnboarding,setShowOnboarding]=useState(false);
  const [showHelpMenu,setShowHelpMenu]=useState(false);
  const [configDestino,setConfigDestino]=useState({tab:"cuenta",request:0});
  function irAyuda(v,tab){if(v==="configuracion")setConfigDestino(p=>({tab:tab||"cuenta",request:p.request+1}));setView(v);}
  useEffect(function(){
    var c=docworksAuth.contexto;
    if(!docworksAuth.session||!c||!c.usuario||!perfilNubeCargado||!c.habilitado||!['dueno','admin'].includes(c.usuario.rol_base))return;
    if(!lsGet(onboardingStorageKey,false)&&!perfil.inicio_inmobiliaria?.completado){var timer=setTimeout(function(){setShowOnboarding(true);},650);return function(){clearTimeout(timer);};}
  },[docworksAuth.session,docworksAuth.contexto,perfilNubeCargado,onboardingStorageKey,perfil.inicio_inmobiliaria?.completado]);
  function cerrarOnboarding(){
    lsSet(onboardingStorageKey,true);
    setShowOnboarding(false);
  }
  function abrirOnboarding(){
    var role=docworksAuth.contexto?.usuario?.rol_base;
    if(!["dueno","admin"].includes(role)){setView("dashboard");return;}
    setShowOnboarding(true);
  }

  // ── Gate de sesión (Fase 1 SaaS) ──────────────────────────────────────────
  // A partir de acá la app sigue exactamente igual que antes. Todo lo de
  // abajo (Operaciones, Documentos, Equipo local) queda intacto — este gate
  // solo decide SI se llega a renderizarlo, no CÓMO se renderiza.
  if (!docworksAuth.ready || docworksAuth.contextoLoading) return <><GStyles/><AuthLoadingScreen error={docworksAuth.connError} onRetry={docworksAuth.retry}/></>;
  if (!docworksAuth.session) return <><GStyles/><LoginGate docworksAuth={docworksAuth}/></>;
  if (docworksAuth.authAction) return <><GStyles/><AuthPasswordSetupScreen mode={docworksAuth.authAction} onSave={docworksAuth.savePassword} loading={docworksAuth.passwordSaving} error={docworksAuth.passwordError} onLogout={docworksAuth.logout}/></>;
  var ctx = docworksAuth.contexto;
  if (ctx && ctx.es_super_admin) return <><GStyles/><SuperAdminDashboard contexto={ctx} onLogout={docworksAuth.logout}/></>;
  if (!ctx || !ctx.usuario) return <><GStyles/><CuentaNoHabilitadaScreen onLogout={docworksAuth.logout}/></>;
  if (!ctx.habilitado) return <><GStyles/><MembresiaSuspendidaScreen estado={ctx.membresia ? ctx.membresia.estado : "suspendida"} onLogout={docworksAuth.logout}/></>;

  return(
    <>
      <ConfirmModal
        open={!!dwConfirm}
        title="Confirmar acción"
        message={dwConfirm&&dwConfirm.message}
        confirmLabel={dwConfirm&&dwConfirm.confirmLabel||"Confirmar"}
        cancelLabel="Cancelar"
        danger={false}
        onCancel={function(){setDwConfirm(null);}}
        onConfirm={function(){var fn=dwConfirm&&dwConfirm.onConfirm;setDwConfirm(null);if(fn)fn();}}
        secondaryLabel={dwConfirm&&dwConfirm.secondaryLabel}
        onSecondary={dwConfirm&&dwConfirm.onSecondary?function(){var fn=dwConfirm.onSecondary;setDwConfirm(null);if(fn)fn();}:null}
      />
      <GStyles/>
      {showSplash&&<SplashScreen onDone={function(){DOCWORKS_STARTUP_SPLASH_SHOWN=true;setShowSplash(false);}}/>}
      <div className="app-bg"/>

      {/* ── Banner de estado offline: los datos siguen disponibles y editables
          (todo vive en localStorage), pero avisamos que no hay conexión para
          que se sepa que no se puede compartir/enviar hasta reconectar. ── */}
      {!isOnline&&(
        <div style={{position:"sticky",top:0,zIndex:200,background:"#7a4a0a",color:"#fff",fontSize:12.5,fontWeight:600,textAlign:"center",padding:"6px 12px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span>📡 Sin conexión — seguís pudiendo redactar y guardar, tus datos están a salvo en este dispositivo.</span>
        </div>
      )}
      {anuncioUsuario&&!anuncioCerrado&&anuncioUsuario.mensaje&&<div style={{position:"sticky",top:0,zIndex:190,margin:"8px 12px",padding:"10px 13px",borderRadius:10,border:"1px solid rgba(212,168,83,.35)",background:"rgba(212,168,83,.10)",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:16}}>📣</span><div style={{flex:1,fontSize:12.5,color:"var(--text)"}}>{anuncioUsuario.mensaje}</div><button onClick={function(){setAnuncioCerrado(true);}} style={{border:0,background:"transparent",color:"var(--muted)",cursor:"pointer",fontSize:16}}>×</button></div>}

      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-logo">
          <img src={DOCWORKS_HEADER_LOGO} alt="DocWorks" className="dw-header-brand-img"/>
          <span className="dw-header-version">v{DOCWORKS_VERSION}</span>
        </div>
        <div ref={mobilePerfilMenuRef} style={{display:"flex",alignItems:"center",gap:8,position:"relative"}}>
          {mostrarInstalar&&<button type="button" className="dw-install-btn" onClick={abrirInstalacion} aria-label="Instalar DocWorks como app"><DWIcon name="download" size={14} strokeWidth={2}/>Instalar</button>}
          <button type="button" className="mobile-topbar-avatar topbar-avatar" onClick={function(){setMobilePerfilMenuOpen(function(v){return !v;});}} title="Abrir menú de usuario" aria-label="Abrir menú de usuario" aria-haspopup="menu" aria-expanded={mobilePerfilMenuOpen} style={{display:"flex",alignItems:"center",gap:6,width:"auto",padding:"0 4px",borderRadius:20,background:"transparent",border:0,color:"rgba(241,245,249,.88)"}}>
            <span style={{width:30,height:30,borderRadius:"50%",overflow:"hidden",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{(ctx&&ctx.usuario&&perfil.broker_fotos&&perfil.broker_fotos[ctx.usuario.id])?<img src={perfil.broker_fotos[ctx.usuario.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="Foto de perfil"/>:(ctx&&ctx.usuario&&formatearNombreUsuarioVisible(ctx).charAt(0).toUpperCase()||"U")}</span>
            <span style={{fontSize:12,fontWeight:550,maxWidth:125,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"rgba(241,245,249,.82)"}}>{ctx&&ctx.usuario?formatearNombreUsuarioVisible(ctx):"Salir"}</span>
          </button>
          {mobilePerfilMenuOpen&&<div role="menu" style={{position:"absolute",right:12,top:"calc(100% + 4px)",zIndex:510,minWidth:190,padding:7,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:12,boxShadow:"var(--shadow-lg)"}}>
            <div style={{padding:"8px 10px",fontSize:12,fontWeight:650,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis"}}>{ctx&&ctx.usuario?formatearNombreUsuarioVisible(ctx):"Usuario"}</div>
            <button type="button" role="menuitem" onClick={function(){setMobilePerfilMenuOpen(false);docworksAuth.logout();}} style={{display:"block",width:"100%",padding:"10px",border:0,borderRadius:8,textAlign:"left",background:"transparent",color:"var(--text)",fontSize:13,fontWeight:650,cursor:"pointer"}}>↪ Cerrar sesión</button>
          </div>}
        </div>
      </div>

      <div className="app-wrap">

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="topbar-logo">
            <img src={DOCWORKS_HEADER_LOGO} alt="DocWorks" className="dw-header-brand-img"/>
            <span className="dw-header-version">v{DOCWORKS_VERSION}</span>
          </div>

          <div className="topbar-search" style={{position:"relative"}}>
            <button type="button" className="topbar-search-icon" onClick={function(){registrarBusqueda(topSearch);setTopSearchFocus(false);if(view!=="dashboard")setView("dashboard");}} aria-label="Buscar" title="Buscar"><DWIcon name="search" size={16} strokeWidth={2}/></button>
            <input value={topSearch}
              onFocus={function(){setTopSearchFocus(true);}}
              onBlur={function(){setTimeout(function(){setTopSearchFocus(false);},160);}}
              onKeyDown={function(e){if(e.key==="Enter"){registrarBusqueda(topSearch);setTopSearchFocus(false);}}}
              onChange={function(e){setTopSearch(e.target.value);if(view!=="dashboard")setView("dashboard");}}
              placeholder="Buscar operaciones, DNI, CUIT, domicilios..." aria-label="Buscar operaciones, DNI, CUIT, domicilios"/>
            {topSearchFocus&&topSearch&&<div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,minWidth:340,maxWidth:520,zIndex:190,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:14,boxShadow:"0 18px 50px rgba(0,0,0,.16)",padding:10}}><div style={{fontSize:12,fontWeight:800,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",padding:"3px 6px 7px"}}>Resultados globales</div>{globalSearchResults.length===0?<div style={{padding:"10px 7px",fontSize:12,color:"var(--dim)"}}>No encontramos operaciones, clientes o documentos.</div>:globalSearchResults.map(function(r){return <button key={r.id} type="button" onMouseDown={function(e){e.preventDefault();setTopSearchFocus(false);setTopSearch("");abrirDoc(r.op);}} style={{width:"100%",border:"none",background:"transparent",padding:"8px 7px",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",gap:9,textAlign:"left",color:"var(--text)"}}><span style={{color:r.kind==="cliente"?"var(--teal)":"var(--gold)",display:"inline-flex"}}><DWIcon name={r.kind==="cliente"?"users":"folder"} size={14}/></span><span style={{minWidth:0}}><span style={{display:"block",fontSize:12,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.title}</span><span style={{display:"block",fontSize:12,color:"var(--dim)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.kind==="cliente"?r.subtitle:"Documento"}</span></span></button>;})}</div>}
            {topSearchFocus&&!topSearch&&searchHasHistory&&<div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,minWidth:340,maxWidth:520,zIndex:190,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:14,boxShadow:"0 18px 50px rgba(0,0,0,.16)",padding:10}}>
              {recentOps.length>0&&<div>
                <div style={{fontSize:12,fontWeight:800,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",padding:"3px 6px 7px"}}>Operaciones buscadas recientemente</div>
                {recentOps.slice(0,5).map(function(ro){return <button key={ro.id} type="button" onMouseDown={function(e){e.preventDefault();setTopSearch("");setTopSearchFocus(false);setView("dashboard");abrirDoc(ro);}} style={{width:"100%",border:"none",background:"transparent",padding:"8px 7px",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",gap:8,textAlign:"left",color:"var(--text)"}}><span style={{color:"var(--gold)",display:"inline-flex"}}><DWIcon name="folder" size={14}/></span><span style={{minWidth:0}}><span style={{display:"block",fontSize:12,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tipoInmuebleLabel(ro.inmueble_tipo,ro.inmueble_tipo_otro)+(ro.inmueble_direccion?" — "+ro.inmueble_direccion:"")}</span><span style={{display:"block",fontSize:12,color:"var(--dim)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nombreConSufijo(ro,ro.tipo==="alquiler"||ro.tipo==="reserva_alquiler"?"locatario":"comprador",ro.tipo==="alquiler"||ro.tipo==="reserva_alquiler"?"Locatario":"Comprador")}</span></span></button>;})}
              </div>}
              {recentSearches.length>0&&<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--border2)"}}>
                <div style={{fontSize:12,fontWeight:800,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",padding:"3px 6px 7px"}}>Búsquedas recientes</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"0 6px 3px"}}>{recentSearches.slice(0,6).map(function(q,i){return <button key={q+"-"+i} type="button" onMouseDown={function(e){e.preventDefault();setTopSearch(q);setTopSearchFocus(false);setView("dashboard");registrarBusqueda(q);}} style={{border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--text)",borderRadius:20,padding:"5px 8px",fontSize:12,cursor:"pointer"}}>{q}</button>;})}</div>
              </div>}
            </div>}
          </div>

          <div className="topbar-right">
            {mostrarInstalar&&<button type="button" className="dw-install-btn" onClick={abrirInstalacion} aria-label="Instalar DocWorks como app" style={{marginRight:10}}><DWIcon name="download" size={14} strokeWidth={2}/>Instalar</button>}
            <SesionBadge contexto={ctx} onLogout={docworksAuth.logout} foto={ctx&&ctx.usuario&&perfil&&perfil.broker_fotos&&perfil.broker_fotos[ctx.usuario.id]||""}/>
          </div>
        </div>

        {/* ── BODY: sidebar + main ── */}
        <div className="app-body">

          {/* ── Icon sidebar ── */}
          <aside className="sidebar">
            {navItems.map(function(n){
              return(
                <button key={n.id} className={"nav-item premium-nav-item "+(view===n.id?"active":"")} onClick={function(){setView(n.id);}} aria-label={n.label} aria-current={view===n.id?"page":undefined}>
                  <span>{n.ico?<FormalIcon name={n.ico} size={22}/>:n.icon}</span>
                  <span className="tooltip">{n.label}</span>
                </button>
              );
            })}
            <div className="sidebar-spacer"/>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,paddingBottom:8}}>
              <div style={{position:"relative"}}><button type="button" className="sidebar-bottom-icon" onClick={function(){setShowHelpMenu(function(v){return !v;});}} title="Ayuda" aria-label="Ayuda"><FormalIcon name="help" size={20}/></button>{showHelpMenu&&<div role="menu" style={{position:"absolute",left:42,bottom:0,width:190,zIndex:300,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:10,padding:5,boxShadow:"0 12px 35px rgba(0,0,0,.22)"}}><button type="button" role="menuitem" onClick={function(){setShowHelpMenu(false);abrirOnboarding();}} style={{display:"block",width:"100%",textAlign:"left",padding:"9px 10px",border:0,borderRadius:7,background:"transparent",color:"var(--text)",fontSize:12,cursor:"pointer"}}>Preparar mi inmobiliaria</button><button type="button" role="menuitem" onClick={function(){setShowHelpMenu(false);setView("clausulas");}} style={{display:"block",width:"100%",textAlign:"left",padding:"9px 10px",border:0,borderRadius:7,background:"transparent",color:"var(--text)",fontSize:12,fontWeight:700,cursor:"pointer"}}>Editar cláusulas</button><button type="button" role="menuitem" className="btn btn-ghost" style={{width:"100%",justifyContent:"flex-start"}} onClick={function(){setShowHelpMenu(false);irAyuda("configuracion","soporte");}}>Centro de ayuda y soporte</button></div>}</div>
              <button type="button" className="sidebar-bottom-icon" onClick={function(){toggleDark();}} title={darkMode?"Cambiar a modo claro":"Cambiar a modo oscuro"} aria-label={darkMode?"Cambiar a modo claro":"Cambiar a modo oscuro"}>
                <FormalIcon name={darkMode?"sun":"moon"} size={20}/>
              </button>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="main">
            <div className="content">
              {ctx.membresia&&ctx.membresia.es_prueba&&<div className="notice notice-gold" style={{display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap",marginBottom:16,fontSize:13}}><span>Prueba gratis · Vence el {new Date(ctx.membresia.fecha_vencimiento).toLocaleDateString("es-AR")}. Sin cobro automático.</span><a href="https://docworks-landing.vercel.app/#planes" style={{color:"inherit"}}>Ver planes</a></div>}
              {view!=="configuracion"&&<details style={{marginBottom:14,fontSize:13,border:"1px solid var(--border)",borderRadius:10,padding:"10px 12px"}}><summary style={{cursor:"pointer",color:"var(--dim)"}}>Ayuda para esta pantalla</summary><p style={{lineHeight:1.6,margin:"9px 0"}}>{({dashboard:"Cada operación reúne los datos y documentos del negocio. Usá Nueva operación para empezar; guardá un borrador si todavía te falta información.",clausulas:"Acá se definen los modelos y las cláusulas disponibles. El dueño o administrador prepara la base; cada asesor suma los extras de su operación.",calendario:"Las fechas importantes se toman de las operaciones. Revisá sus datos para corregir un vencimiento o una fecha pendiente.",estadisticas:"Consultá la actividad del equipo según tu rol y permisos. Los resultados dependen de las operaciones cargadas."})[view]||"Encontrá guías y respuestas en el Centro de ayuda."}</p><button type="button" className="btn btn-ghost btn-sm" onClick={function(){irAyuda("configuracion","soporte");}}>Abrir centro de ayuda</button></details>}
              {view==="dashboard"&&<DashboardView operaciones={operaciones} clausulas={clausulas} perfil={perfil} bloquesReserva={bloquesReserva} onAuditExport={function(entry){return loadSupabaseJs().then(function(sb){if(!sb)return {error:{message:"Supabase no disponible"}};var operacionId=String(entry.operacion_id||"");return sb.rpc("fn_auditoria_registrar",{p_accion:String(entry.accion||"exportar_con_faltantes"),p_operacion_id:operacionId,p_valor_nuevo:Object.assign({},entry,{operacion_id:operacionId})});}).catch(function(err){return {error:err};});}} searchOverride={topSearch} onNew={function(){setFormFocusCampo(null);setEditOp(null);setFormTipo(null);setShowForm(true);}} onEdit={function(op){setFormFocusCampo(null);setEditOp(op);setFormTipo(op.tipo||"reserva");setShowForm(true);}} onEditField={function(op,campo){setFormFocusCampo(campo);setEditOp(op);setFormTipo(op.tipo||"reserva");setShowForm(true);}} onDelete={eliminarOpDirecto} onExportarCSV={exportarOperacionesCSV} onRestoreVersion={restaurarVersion} onChangeEstado={changeEstado} onConvertir={convertirAContrato} onConvertirComodato={convertirAComodato} onConvertirRefuerzo={convertirARefuerzo} onConvertirBoleto={convertirABoleto} onConvertirDevolucion={onConvertirDevolucion} onDuplicar={duplicarOp} onViewDoc={function(op){abrirDoc(op);}} onPerfil={function(){setView("configuracion");}} papelera={papelera} onRestore={restoreOp} onDeletePermanente={deleteOpPermanente} onVaciarPapelera={vaciarPapelera} confirmVaciarPapelera={confirmVaciarPapelera} setConfirmVaciarPapelera={setConfirmVaciarPapelera} papeleraJump={papeleraJump} error={opsSupabase.error} papeleraError={opsSupabase.papeleraError} onRetry={opsSupabase.recargar} loading={opsSupabase.loading}/>}
              {view==="calendario"&&<CalendarioView operaciones={operaciones} onViewOp={function(op){abrirDoc(op);}}/>}
              {view==="clausulas"&&<ClausulasWorkspace key={perfilNube.contexto} perfil={perfil} usuarioActual={docworksAuth.contexto&&docworksAuth.contexto.usuario?docworksAuth.contexto.usuario:null} onSavePerfil={function(p){var anterior=perfil;setPerfil(p);return perfilNube.guardarAhora(p).then(function(res){if(res&&res.error&&!res.contextoObsoleto){setPerfil(anterior);dwNotify("error","No se pudo guardar el modelo del documento. "+traducirError(res.error.message||"Error de comunicación con Supabase."));}return res;}).catch(function(err){setPerfil(anterior);dwNotify("error","No se pudo guardar el modelo del documento. "+traducirError(err&&err.message?err.message:"Error de comunicación con Supabase."));return {error:err};});}} operaciones={operaciones} clausulas={clausulas} onAddClausula={addClausula} onEditClausula={editClausula} onDeleteClausula={deleteClausula} papeleraClausulas={papeleraClausulas} papeleraClausulasLoading={papeleraClausulasLoading} papeleraClausulasError={papeleraClausulasError} onRecargarPapeleraClausulas={recargarPapeleraClausulas} onRestaurarClausula={restaurarClausula} bloquesReserva={bloquesReserva} onUpdateBloqueReserva={updateBloqueReserva} onMoveBloqueReserva={moveBloqueReserva} bloquesError={bloquesSupabase.error} bloquesLoading={bloquesSupabase.loading} onRetryBloques={bloquesSupabase.recargar} clausulasError={clausulasError} clausulasLoading={clausulasLoading} onRetryClausulas={recargarClausulas}/>}
              {view==="estadisticas"&&<EstadisticasView onExportarCSV={exportarOperacionesCSV} operaciones={operaciones} equipo={equipo} perfil={perfil} currentUserId={docworksAuth.contexto && docworksAuth.contexto.usuario ? docworksAuth.contexto.usuario.id : null} currentUserRole={docworksAuth.contexto && docworksAuth.contexto.usuario ? docworksAuth.contexto.usuario.rol_base : perfil.rol}/>}
              {view==="configuracion"&&<ConfiguracionView requestedTab={configDestino} onHelpNavigate={irAyuda} onOpenBot={function(){setShowBot(true);}} perfil={perfil} onChange={function(p){ var anterior=perfil; setPerfil(p); return perfilNube.guardarAhora(p).then(function(res){ if(res&&res.error&&!res.contextoObsoleto){ setPerfil(anterior); dwNotify("error","No se pudo guardar el perfil de la inmobiliaria. "+traducirError(res.error.message||"Error de comunicación con Supabase.")); } return res; }).catch(function(err){ setPerfil(anterior); dwNotify("error","No se pudo guardar el perfil de la inmobiliaria. "+traducirError(err&&err.message?err.message:"Error de comunicación con Supabase.")); return {error:err}; }); }} currentUserId={docworksAuth.contexto && docworksAuth.contexto.usuario ? docworksAuth.contexto.usuario.id : null} currentUserRole={docworksAuth.contexto && docworksAuth.contexto.usuario ? docworksAuth.contexto.usuario.rol_base : perfil.rol} darkMode={darkMode} onToggleDark={toggleDark} equipo={equipo} equipoSupabase={equipoSupabase} operaciones={operaciones} clausulas={clausulas} onAddClausula={addClausula} onEditClausula={editClausula} onDeleteClausula={deleteClausula} onMoveClausula={moveClausula} onDuplicateClausula={duplicateClausula} bloquesReserva={bloquesReserva} onUpdateBloqueReserva={updateBloqueReserva} onMoveBloqueReserva={moveBloqueReserva} bloquesError={bloquesSupabase.error} bloquesLoading={bloquesSupabase.loading} onRetryBloques={bloquesSupabase.recargar} clausulasError={clausulasError} onRetryClausulas={recargarClausulas} papelera={papelera} auditLog={auditLog} auditoriaSupabase={auditoriaSupabase} onExportarRespaldo={exportarRespaldo} onImportarRespaldo={importarRespaldo} onVaciarAuditoria={function(){setAuditLog([]);}} puedeInstalar={!!deferredInstallPrompt} onInstalar={instalarApp} onStartTour={abrirOnboarding} ctx={ctx}/>}
            </div>
          </div>
        </div>
      </div>

      {showInstallChoice&&(
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(3,7,18,.58)",backdropFilter:"blur(7px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"18px 14px calc(18px + env(safe-area-inset-bottom,0px))"}} onClick={posponerInstalacion}>
          <div role="dialog" aria-modal="true" aria-label="Instalar DocWorks" onClick={function(e){e.stopPropagation();}} style={{width:"min(460px,100%)",borderRadius:20,border:"1px solid rgba(212,168,83,.32)",background:"var(--card)",boxShadow:"0 24px 80px rgba(0,0,0,.38)",padding:22}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:42,height:42,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"var(--gold-soft)",border:"1px solid var(--gold-line)",color:"var(--gold)",flexShrink:0}}><DWIcon name="download" size={20} strokeWidth={1.9}/></div>
              <div style={{fontFamily:"DM Serif Display,serif",fontSize:22,color:"var(--text)",lineHeight:1.15}}>Instalá DocWorks como app</div>
            </div>
            {deferredInstallPrompt
              ? <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:18}}>Se abre desde el ícono de tu pantalla de inicio, a pantalla completa y más rápido. Tus datos son los mismos que en la web.</div>
              : isIOSDevice
                ? <div><div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:8}}>En iPhone y iPad el acceso directo se agrega desde Safari:</div><ol style={{margin:"0 0 16px",paddingLeft:20,fontSize:13,color:"var(--muted)",lineHeight:1.7}}><li>Tocá <b style={{color:"var(--text)"}}>Compartir</b> (el cuadrado con la flecha hacia arriba).</li><li>Elegí <b style={{color:"var(--text)"}}>Agregar a pantalla de inicio</b>.</li><li>Tocá <b style={{color:"var(--text)"}}>Agregar</b>.</li></ol></div>
                : <div><div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:8}}>Desde el menú de tu navegador:</div><ol style={{margin:"0 0 16px",paddingLeft:20,fontSize:13,color:"var(--muted)",lineHeight:1.7}}><li>Abrí el menú del navegador (<b style={{color:"var(--text)"}}>⋮</b> o <b style={{color:"var(--text)"}}>⋯</b>).</li><li>Elegí <b style={{color:"var(--text)"}}>Instalar app</b> o <b style={{color:"var(--text)"}}>Agregar a pantalla de inicio</b>.</li><li>Confirmá. Después DocWorks se abre como app.</li></ol></div>}
            {deferredInstallPrompt
              ? <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                  <button type="button" onClick={elegirInstalar} style={{height:44,border:0,borderRadius:10,background:"var(--gold)",color:"#111827",fontWeight:800,cursor:"pointer"}}>Instalar app</button>
                  <button type="button" onClick={posponerInstalacion} style={{height:44,border:"1px solid var(--border2)",borderRadius:10,background:"transparent",color:"var(--text)",fontWeight:700,cursor:"pointer"}}>Ahora no</button>
                </div>
              : <button type="button" onClick={posponerInstalacion} style={{width:"100%",height:44,border:0,borderRadius:10,background:"var(--gold)",color:"#111827",fontWeight:800,cursor:"pointer"}}>Entendido</button>}
            <button type="button" onClick={noMostrarInstalacion} style={{display:"block",margin:"12px auto 0",border:0,background:"transparent",color:"var(--dim)",fontSize:12,cursor:"pointer",padding:"4px 8px"}}>No mostrar más</button>
          </div>
        </div>
      )}

      {/* ── Mobile FAB ── */}
      <button className="fab" aria-label="Nueva operación" title="Nueva operación" onClick={function(){setFormFocusCampo(null);setEditOp(null);setFormTipo(null);setShowForm(true);}}><DWIcon name="plus" size={24} strokeWidth={2.4}/></button>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {mobileNavItems.map(function(n){
            return(
              <button key={n.id} className={"mobile-nav-item "+(view===n.id?"active":"")} onClick={function(){setView(n.id);}}>
                <span>{n.ico?<FormalIcon name={n.ico} size={22}/>:n.icon}</span><span>{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bot IA flotante — se esconde mientras hay un modal de carga de
          documento abierto (formulario u operación), para no tapar los
          campos ni los botones del pie del formulario. */}
      {!showForm&&showBot&&<BotIA onClose={function(){setShowBot(false);}} operaciones={operaciones} clausulas={clausulas} bloquesReserva={bloquesReserva} onAddClausula={addClausula}/>}
      {!showForm&&(
        <button className="ia-fab" aria-label="Asistente IA" onClick={function(){setShowBot(function(v){return !v;});}} title="Asistente IA" style={{
          position:"fixed",bottom:80,right:20,zIndex:150,
          width:48,height:48,borderRadius:"50%",border:"none",cursor:"pointer",
          background:"var(--gold)",
          boxShadow:"0 4px 20px rgba(212,168,83,0.4)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:22,transition:"transform 0.2s",
        }}>✦</button>
      )}

      {dwNotice&&<div role="status" aria-live="polite" style={{position:"fixed",right:18,top:18,zIndex:4000,maxWidth:420,padding:"12px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,.12)",background:"rgba(15,23,42,.97)",color:"#f8fafc",boxShadow:"0 14px 40px rgba(0,0,0,.3)",display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:dwNotice.kind==="success"?"#45c486":"#e9a23b",marginTop:5,flex:"0 0 auto"}}/>
        <div style={{fontSize:12,lineHeight:1.45,fontWeight:600}}>{dwNotice.message}</div>
        <button type="button" onClick={function(){setDwNotice(null);}} aria-label="Cerrar aviso" style={{marginLeft:"auto",border:"none",background:"transparent",color:"rgba(255,255,255,.65)",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
      </div>}

      {ctx.usuario&&["dueno","admin"].includes(ctx.usuario.rol_base)&&<InicioInmobiliaria key={perfilNube.contexto} open={showOnboarding} perfil={perfil} contexto={ctx}
        onSave={async function(next){var result=await perfilNube.guardarAhora(next);if(result&&result.error)return result;setPerfil(next);return result;}}
        onInvite={function(email){return equipoSupabase.invitar(email,"broker","junior");}}
        onClose={cerrarOnboarding}
        onCreate={function(tipo){setView("dashboard");setFormFocusCampo(null);setEditOp(null);setFormTipo(tipo);setFormInitialOverride(Object.assign({},EMPTY_OP,{tipo:tipo}));setShowForm(true);}}/>}

      <Modal open={showForm} onClose={cerrarFormularioSeguro} closeOnBackdrop={false} title={editOp?"Editar operación":"Nueva operación"} wide={true} operationForm={true} formTipo={formTipo}>
        <OperacionForm initial={editOp||formInitialOverride} clausulas={clausulas} perfil={perfil} equipo={equipo} operaciones={operaciones} onSave={saveOp} onCancel={cerrarFormularioSeguro} onTipoChange={function(t){setFormTipo(t);}} saveStatus={saveStatus} reportSave={reportSave} onAddClausula={addClausula} focusCampo={formFocusCampo}/>
      </Modal>
      <Modal open={!!viewDoc} onClose={function(){setViewDoc(null);setDocAutoAction(null);}} title={viewDoc?<span className="dw-viewer-heading"><span className="dw-viewer-heading-type">{TIPOS[viewDoc.tipo]||viewDoc.tipo||"Documento"}</span><span className="dw-viewer-heading-operation">{viewDoc.nombre||viewDoc.titulo_operacion||viewDoc.inmueble_direccion||"Operación sin nombre"}</span></span>:"DocWorks"} wide={true} viewerMode={true}
        headerExtra={null}
        headerRight={viewDoc?<DocumentHeaderActions
          onEdit={function(){var op=viewDoc;setViewDoc(null);setDocAutoAction(null);setEditOp(op);setFormTipo(op.tipo||"reserva");setShowForm(true);}}
          onPDF={function(){setDocAutoAction("pdf");}}
          onDOCX={function(){setDocAutoAction("docx");}}
          onShare={function(){setDocAutoAction("whatsapp");}}
        />:null}>
        {viewDoc&&<DocumentViewer op={viewDoc} clausulas={clausulas} perfil={perfil} operaciones={operaciones} bloquesReserva={bloquesReserva} onSavePerfil={function(p){var anterior=perfil;setPerfil(p);return perfilNube.guardarAhora(p).then(function(res){if(res&&res.error&&!res.contextoObsoleto){setPerfil(anterior);return res;}return res;}).catch(function(err){setPerfil(anterior);return {error:err};});}} onAuditExport={function(entry){return loadSupabaseJs().then(function(sb){if(!sb)return {error:{message:"Supabase no disponible"}};var operacionId=String(entry.operacion_id||(viewDoc&&viewDoc.id)||"");return sb.rpc("fn_auditoria_registrar",{p_accion:String(entry.accion||"exportar_con_faltantes"),p_operacion_id:operacionId,p_valor_nuevo:Object.assign({},entry,{operacion_id:operacionId})});}).catch(function(err){return {error:err};});}} onUpdateBloqueReserva={updateBloqueReserva} onToggleTarea={toggleTarea} onUpdateOperation={onUpdateOperationGlobal} onActionWorkflow={function(action){if(viewDoc)onActionWorkflow(viewDoc,action);}} onCompleteData={function(op,campo){setViewDoc(null);setDocAutoAction(null);setFormFocusCampo(campo);setEditOp(op);setFormTipo(op.tipo||"reserva");setShowForm(true);}} tab={docTab} onChangeTab={setDocTab} autoAction={docAutoAction} onAutoActionDone={function(){setDocAutoAction(null);}}/>}
      </Modal>
      <ConfirmModal open={confirmCloseForm} title="Salir de la operación" message="Ya cargaste datos. ¿Querés guardar un borrador antes de salir?" confirmLabel="Guardar borrador" cancelLabel="Salir sin guardar" onCancel={salirSinGuardarFormulario} onConfirm={guardarBorradorYSalir}/>
      <ConfirmModal
        open={!!draftPrompt}
        title="Documento sin guardar"
        message={"Quedó un "+(draftPrompt?(TIPOS[draftPrompt.data.tipo]||"documento"):"documento")+" sin terminar de guardar (probablemente se cerró la pestaña mientras se cargaba). ¿Querés continuar editándolo como borrador?"}
        confirmLabel="Continuar editando"
        cancelLabel="Eliminar borrador"
        onConfirm={function(){
          var d=draftPrompt; if(!d)return;
          var found = d.editId ? operaciones.find(function(o){return o.id===d.editId;}) : null;
          if(found){ setEditOp(Object.assign({},found,d.data)); setFormInitialOverride(null); }
          else { setEditOp(null); setFormInitialOverride(d.data); }
          setFormTipo(d.data.tipo||"reserva");
          setShowForm(true);
          setDraftPrompt(null);
        }}
        onCancel={function(){ lsRemove("draftOperacion"); setDraftPrompt(null); }}
      />
    </>
  );
}

// DocWorks 4.11 — Si algún módulo falla al renderizar, se muestra un aviso claro
// en lugar de una pantalla blanca. Los datos locales no se tocan.
class DWErrorBoundary extends Component<any,any> {
  constructor(props:any){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(error:any){ return {error:error}; }
  componentDidCatch(error:any, info:any){ console.error("DocWorks: error de renderizado", error, info); }
  render(){
    if(!this.state.error) return this.props.children;
    var msg=String((this.state.error&&this.state.error.message)||this.state.error||"Error desconocido");
    return (
      <div role="alert" style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",padding:"max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom))",background:"#0b1730",color:"#f1f5f9",fontFamily:"DM Sans, system-ui, sans-serif"}}>
        <div style={{maxWidth:420,width:"100%",textAlign:"center"}}>
          <div style={{fontFamily:"DM Serif Display, serif",fontSize:30,marginBottom:6}}>DocWorks <span style={{fontSize:13,color:"#d4a853",fontFamily:"DM Sans, sans-serif",fontWeight:600}}>v{DOCWORKS_VERSION}</span></div>
          <div style={{fontSize:17,fontWeight:600,margin:"18px 0 8px"}}>Algo no salió como esperábamos</div>
          <div style={{fontSize:14,lineHeight:1.55,opacity:.8,marginBottom:20}}>Tus operaciones y borradores siguen guardados en este dispositivo. Recargá la pantalla para continuar.</div>
          <button type="button" onClick={function(){ try{ window.location.reload(); }catch(e){} }} style={{minHeight:48,padding:"0 28px",borderRadius:12,border:"none",background:"#d4a853",color:"#0b1730",fontSize:15,fontWeight:700,cursor:"pointer"}}>Recargar</button>
          <div style={{marginTop:18,fontSize:11,opacity:.45,wordBreak:"break-word"}}>{msg}</div>
        </div>
      </div>
    );
  }
}

// 4.40 — Pantalla inicial liviana: muestra el logo principal sin depender del video ni del autoplay de iOS.
// Se mantiene breve para que no retrase el login ni la carga de datos.
function StartupSplashHost(){
  const [visible,setVisible]=useState(true);
  const [fade,setFade]=useState(false);
  useEffect(function(){
    var t1=setTimeout(function(){setFade(true);},1050);
    var t2=setTimeout(function(){setVisible(false);DOCWORKS_STARTUP_SPLASH_SHOWN=true;},1280);
    return function(){clearTimeout(t1);clearTimeout(t2);};
  },[]);
  if(!visible)return null;
  return <div aria-label="Iniciando DocWorks" role="status" style={{position:"fixed",inset:0,zIndex:99999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:15,background:"radial-gradient(ellipse at 50% 0%, #142747 0%, #070d19 52%, #03060d 100%)",opacity:fade?0:1,transition:"opacity .22s ease",pointerEvents:"none"}}>
    <img src={LOGO_B64} alt="DocWorks" style={{display:"block",width:"min(80vw,400px)",height:"auto",maxHeight:"48vh",objectFit:"contain",filter:"drop-shadow(0 8px 28px rgba(212,168,83,.16))"}}/>
    <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:600,color:"#e8edf6"}}>Cargando<span style={{color:"#d4a853"}}>…</span></div>
    <div style={{width:30,height:3,borderRadius:99,background:"rgba(212,168,83,.18)",overflow:"hidden"}}><div style={{width:"55%",height:"100%",borderRadius:99,background:"#d4a853",animation:"dwStartupProgress .85s ease-in-out infinite alternate"}}/></div>
    <style>{"@keyframes dwStartupProgress{from{transform:translateX(-25%)}to{transform:translateX(95%)}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}"}</style>
  </div>;
}

export default function App(){
  return <DWErrorBoundary><DocWorksApp/><StartupSplashHost/></DWErrorBoundary>;
}
