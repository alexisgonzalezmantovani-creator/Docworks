import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// Iconos premium DocWorks: SVG inline, sin dependencias externas.
function DWIcon({name,size=15,strokeWidth=1.8}){
  var paths={
    edit:<><path d="M12.9 2.7a1.8 1.8 0 0 1 2.5 2.5L6 14.6 2.8 15.2l.6-3.2L12.9 2.7Z"/><path d="m11.5 4.1 2.5 2.5"/></>,
    plus:<><path d="M8 3v10M3 8h10"/></>,
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
    chevronRight:<path d="m6 4 4 4-4 4"/>,
    search:<><circle cx="7" cy="7" r="4.2"/><path d="m10.2 10.2 3.3 3.3"/></>,
    clock:<><circle cx="8" cy="8" r="5.7"/><path d="M8 4.8v3.6l2.4 1.5"/></>,
    mic:<><rect x="5.5" y="2.4" width="5" height="7.3" rx="2.5"/><path d="M4 8.2a4 4 0 0 0 8 0M8 12.2v2M6 14.2h4"/></>,
    stop:<><rect x="4.2" y="4.2" width="7.6" height="7.6" rx="1.2"/></>
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
    if(escuchando){ try{if(recRef.current)recRef.current.stop();}catch(e){} return; }
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
  useEffect(function(){ return function(){ try{if(recRef.current)recRef.current.stop();}catch(e){} }; },[]);
  return(
    <div style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
      <button type="button" onClick={iniciar} disabled={disabled} title={escuchando?"Detener dictado":title} aria-label={escuchando?"Detener dictado":"Dictar por voz"}
        style={{width:34,height:34,borderRadius:9,border:escuchando?"1px solid rgba(248,113,113,.5)":"1px solid var(--border2)",background:escuchando?"rgba(248,113,113,.10)":"var(--surface2)",color:escuchando?"var(--red)":"var(--muted)",cursor:disabled?"default":"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
        <DWIcon name={escuchando?"stop":"mic"} size={15} strokeWidth={2}/>
      </button>
      {error&&<span style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:80,whiteSpace:"nowrap",padding:"5px 8px",borderRadius:7,background:"var(--card)",border:"1px solid var(--border2)",boxShadow:"0 8px 20px rgba(0,0,0,.12)",color:"var(--red)",fontSize:9.5}}>{error}</span>}
    </div>
  );
}

// DocWorks 3.56 PRO — edición profesional, visor unificado, IA asistida, dictado por voz, revisión inteligente y lenguaje 100% en español.
// DocWorks 3.56 PRO — IA asistida con dictado por voz, revisión inteligente, búsqueda ampliada, cláusulas obligatorias y experiencia 100% en español.


// ── SUPABASE (Fase 1 SaaS) ────────────────────────────────────────────────────
// Se carga por CDN, igual que Recharts más abajo, porque este archivo se
// compila solo con esbuild sin node_modules (no hay "npm install" en el
// pipeline). El anon key es público por diseño: toda la seguridad real vive
// en las RLS policies y en las funciones SECURITY DEFINER del lado de la base.
var SUPABASE_URL = "https://xpjiydwjawjizubyldtk.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwaml5ZHdqYXdqaXp1YnlsZHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDYzMzcsImV4cCI6MjEwMzc4MjMzN30.Mi5DilpMg_EGkNZX_ht6jtrmXX9_9Q-Xyo4hnWDEIvI";
var supabaseClient = null;

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
function loadSupabaseJs(): Promise<any> {
  return new Promise(function(resolve) {
    if (supabaseClient) { resolve(supabaseClient); return; }
    if (window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      resolve(supabaseClient);
      return;
    }
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0";
    s.onload = function() {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      resolve(supabaseClient);
    };
    s.onerror = function() { resolve(null); };
    document.head.appendChild(s);
  });
}

async function docworksMercadoPago(action, payload) {
  var sb = await loadSupabaseJs();
  if (!sb) throw new Error("No se pudo cargar Supabase.");
  var res = await sb.functions.invoke("mp-subscriptions", { body: Object.assign({action: action}, payload || {}) });
  if (res.error) throw new Error(traducirError(res.error.message || "No se pudo conectar con Mercado Pago."));
  if (res.data && res.data.error) throw new Error(res.data.error);
  return res.data || {};
}

function loadRecharts(): Promise<void> {
  return new Promise(function(resolve) {
    if (window.Recharts) { resolve(); return; }
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/recharts/2.12.7/Recharts.js";
    s.onload = function() { resolve(); };
    s.onerror = function() { resolve(); };
    document.head.appendChild(s);
  });
}

// ── PDF NATIVO — sin dependencias externas ───────────────────────────────────
// Genera PDF 1.4 real desde cero usando solo JS nativo.
// Compatible con todos los visores (Adobe, Chrome, iOS, etc.)

function pdfStr(s){ return s.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)"); }

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
  return mapped.replace(/[^\x00-\xFF]/g,"?");
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
  return (base.replace(/ÉSIMA$/, "ÉSIMO")+unidadOrdinal.toLowerCase()).toUpperCase();
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
  var file=null;
  try {
    file = new File([blob], filename, { type: mime });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      await navigator.share(Object.assign({ files: [file] }, opts));
      return "shared";
    }
  } catch (e) {
    if (e && e.name === "AbortError") return "cancelled";
  }

  // Segundo nivel: algunos navegadores permiten compartir texto pero no archivos.
  // Compartimos el nombre/operación de inmediato y dejamos el PDF descargado.
  try {
    if (navigator.share) {
      await navigator.share({title:opts.title||filename,text:opts.text||filename});
      return "shared-text";
    }
  } catch (e2) {
    if (e2 && e2.name === "AbortError") return "cancelled";
  }

  // Escritorio: WhatsApp Web es un fallback práctico y consistente. El PDF se
  // descarga en paralelo para que quede listo para adjuntarlo al chat abierto.
  var text=String(opts.text||filename);
  try {
    var waUrl="https://web.whatsapp.com/send?text="+encodeURIComponent(text);
    window.open(waUrl,"_blank","noopener,noreferrer");
  } catch (e3) { /* si el navegador bloquea popup, igual continuamos con la descarga */ }

  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  return "downloaded-whatsapp";
}
// Descarga forzada (sin pasar por el panel nativo de compartir): se usa en los
// botones "Descargar PDF" / "Descargar DOCX" para que sean una acción distinta
// de "Compartir documento" — antes ambos llamaban a entregarArchivo() y, en
// cualquier teléfono con navigator.share() disponible, terminaban abriendo el
// mismo panel de compartir, por lo que "Descargar" y "Compartir" parecían
// hacer exactamente lo mismo.
function descargarArchivo(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  return "downloaded";
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
  // Limpia guiones bajos sobrantes al final de frase (artefacto de plantilla).
  out = out.replace(/\.{1}\s*_{2,}\s*$/g, ".");
  out = out.replace(/_{4,}/g, "");
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
/** Une rótulo + cuerpo garantizando un solo espacio después de ":". */
function unirRotuloYCuerpo(prefix, body){
  var p = String(prefix||"").replace(/\s+$/,"");
  if(!/:$/.test(p)) p = p.replace(/:?$/,":");
  var b = cuerpoTrasRotulo(body);
  return normalizarTextoDocumento(p + " " + b);
}

async function generarPDF(doc, logoDataUrl, perfil) {
  try {
    // Page dimensions: A4 in points (1pt = 1/72 inch)
    var W=595, H=842, ML=54, MR=54, MT=62, MB=66;
    var objects=[], xrefs=[];
    var pagesContent=[];
    var lines=[];
    var y=H-MT;
    var pageNum=1;
    var imgObjNum=null;

    // Estilo de plantilla y colores de marca (personalización por inmobiliaria).
    var estilo=(perfil&&perfil.plantillaEstilo)||"corporativo";
    var colorPrim=hexToRgb01((perfil&&perfil.colorPrimario)||"#142a4d");
    var colorSec=hexToRgb01((perfil&&perfil.colorSecundario)||"#c9a227");
    var esClasico=estilo==="clasico";
    // El estilo clásico usa serif (Times), sin tabla de anchos propia: se
    // aproxima el ancho real con un factor de compresión típico de Times
    // frente a Helvetica, suficiente para un ajuste de línea correcto.
    var FONT_WSCALE = esClasico?0.92:1;
    var FONT_REG = esClasico?"Times-Roman":"Helvetica";
    var FONT_BOLD = esClasico?"Times-Bold":"Helvetica-Bold";
    function mw(str,size,bold){ return textWidthPt(str,size,bold)*FONT_WSCALE; }
    function fitPdfTextSize(str,initial,minSize,maxW,bold){
      var size=initial;
      while(size>minSize && mw(str,size,bold)>maxW) size=Math.max(minSize,size-0.5);
      return size;
    }
    function drawFitText(x,yy,txt,size,minSize,maxW,bold,colorRgb){
      var fs=fitPdfTextSize(txt,size,minSize,maxW,bold);
      text(x,yy,txt,fs,bold,0,colorRgb);
      return fs;
    }
    function safeHeaderValue(value){
      return String(value||"").replace(/\s+/g," ").trim();
    }
    // Color de rótulo de cláusulas/párrafos: en corporativo y minimalista se
    // usa el color primario de marca; en clásico se mantiene todo en negro,
    // como en un contrato tradicional de escribanía.
    var labelColor = (estilo==="clasico") ? null : colorPrim;
    var accentColor = (estilo==="minimalista") ? tintRgb(colorPrim,0.35) : colorSec;

    function addObj(content){
      var n=objects.length+1;
      objects.push(content);
      return n;
    }

    function text(x,yy,txt,size,bold,wordSpacing,colorRgb){
      // Normalización global: cualquier "Campo:Texto" pasa a "Campo: Texto".
      txt=latin1Safe(normalizarTextoDocumento(txt));
      if(!txt) return;
      lines.push("BT");
      if(colorRgb) lines.push(rgbPdfStr(colorRgb)+" rg");
      lines.push("/"+(bold?"F2":"F1")+" "+size+" Tf");
      if(wordSpacing) lines.push(wordSpacing.toFixed(3)+" Tw");
      lines.push(x+" "+yy+" Td");
      lines.push("("+pdfStr(txt)+") Tj");
      if(wordSpacing) lines.push("0 Tw");
      lines.push("ET");
      if(colorRgb) lines.push("0 0 0 rg");
    }
    function hline(yy,grayVal,colorRgb,thickness){
      lines.push((thickness||0.5)+" w");
      if(colorRgb){ lines.push(rgbPdfStr(colorRgb)+" RG"); }
      else { lines.push((grayVal||0.8)+" G"); }
      lines.push(ML+" "+yy+" m "+(W-MR)+" "+yy+" l S");
      lines.push("0 G");
    }
    function rect(x,yy,w,h,fill){
      if(fill) lines.push(fill+" rg");
      lines.push(x+" "+yy+" "+w+" "+h+" re "+(fill?"f":"S"));
      if(fill) lines.push("0 0 0 rg");
    }

    function addFooter(){
      // Pie configurable por elemento: ubicación, leyenda, logo y número de página
      // tienen posiciones independientes y nunca se dibujan en la misma coordenada.
      var ubicacionActiva=!!(perfil&&perfil.ubicacion_inmobiliaria_activa===true&&perfil.direccion);
      var ubicacionPie=ubicacionActiva&&(perfil.ubicacion_inmobiliaria_posicion||"pie")==="pie";
      var pieLogoActivo = !!(perfil && perfil.pie_pagina_logo_debajo && imgObjNum && logoInfo);
      var leyendaActiva = perfil && perfil.pie_pagina_leyenda_activa !== false && !!perfil.pie_pagina_texto;
      var numeroActivo = !perfil || perfil.pie_pagina_numero_activo !== false;
      var footerLineY = 50;
      lines.push("0.7 G 0.3 w "+ML+" "+footerLineY+" m "+(W-MR)+" "+footerLineY+" l S 0 G");
      function alignX(pos, width){
        pos=pos||"centro";
        if(pos==="izquierda") return ML;
        if(pos==="derecha") return W-MR-width;
        return (W-width)/2;
      }
      function drawFooterText(value,pos,yy,size,bold,maxWidth){
        if(!value)return;
        var txt=latin1Safe(value), fs=fitPdfTextSize(txt,size,6,maxWidth||W-ML-MR,!!bold), tw=mw(txt,fs,!!bold), x=alignX(pos,tw);
        text(x,yy,txt,fs,!!bold);
      }
      if(ubicacionPie){
        drawFooterText("Ubicación: "+safeHeaderValue(perfil.direccion),"centro",39,7.1,false,W-ML-MR);
      }
      var logoMiniY=3;
      if(pieLogoActivo){
        var miniScale=(perfil&&perfil.pie_pagina_logo_scale)||100;
        var miniMaxH=Math.max(7,Math.min(18,14*(miniScale/100)));
        var logoAr2=logoInfo.width/logoInfo.height, miniW=miniMaxH*logoAr2;
        var miniX=alignX(perfil.pie_pagina_logo_posicion||"centro",miniW);
        lines.push("q "+miniW.toFixed(2)+" 0 0 "+miniMaxH.toFixed(2)+" "+miniX.toFixed(2)+" "+logoMiniY.toFixed(2)+" cm /Im1 Do Q");
      }
      if(leyendaActiva){
        drawFooterText(perfil.pie_pagina_texto,"centro",20,7,false,W-ML-MR);
      }
      if(numeroActivo){
        drawFooterText("Página "+pageNum,perfil.pie_pagina_numero_posicion||"derecha",20,7.5,false,W-ML-MR);
      }
    }
    // Cierra la página actual (con su pie) y la deja lista para el PDF final.
    function finishPage(){
      addFooter();
      pagesContent.push(lines.join("\n"));
    }
    // Abre una página nueva: cierra la anterior, resetea posición y cuenta de página.
    function newPage(){
      finishPage();
      lines=[];
      y=H-MT;
      pageNum++;
    }
    // Garantiza que quede lugar suficiente antes de escribir; si no, pagina.
    function ensureSpace(neededH){
      if(y-neededH<MB) newPage();
    }

    // Pre-process logo if available: normaliza a JPEG (soporta PNG, WEBP, etc.)
    // y obtiene las dimensiones reales para el XObject.
    var logoInfo=null;
    if(logoDataUrl&&logoDataUrl.startsWith("data:image")){
      try{
        logoInfo=await normalizeLogoImage(logoDataUrl,500);
        imgObjNum=true;
      }catch(ex){ logoInfo=null; imgObjNum=null; }
    }

    // Header inmobiliaria con logo (solo primera página).
    // El logo ocupa su propia fila. El bloque azul/fino calcula el ancho real del
    // nombre y de los metadatos para que nada salga de la línea.
    if(perfil&&perfil.nombre){
      if(perfil.logo_encabezado_activo!==false&&imgObjNum&&logoInfo){
        var logoScalePct=perfil.logoScale||100;
        var logoMaxW=113*(logoScalePct/100), logoMaxH=57*(logoScalePct/100);
        var logoAr=logoInfo.width/logoInfo.height;
        var boxW=logoMaxW, boxH=logoMaxW/logoAr;
        if(boxH>logoMaxH){ boxH=logoMaxH; boxW=logoMaxH*logoAr; }
        var logoPos=(perfil.logoPosicion||"derecha");
        var logoX = logoPos==="izquierda" ? ML : logoPos==="centro" ? (W-boxW)/2 : (W-MR-boxW);
        lines.push("q "+boxW.toFixed(2)+" 0 0 "+boxH.toFixed(2)+" "+logoX.toFixed(2)+" "+(y-boxH+2).toFixed(2)+" cm /Im1 Do Q");
        y-=(boxH+14);
      }
      var encNombre=perfil.encabezado_nombre!==false, encMatricula=perfil.encabezado_matricula!==false, encWeb=perfil.encabezado_web!==false;
      var ubicacionHeader=perfil.ubicacion_inmobiliaria_activa===true && perfil.direccion && (perfil.ubicacion_inmobiliaria_posicion||"pie")==="encabezado";
      var metaHeader=[];
      if(encWeb&&perfil.web) metaHeader.push(safeHeaderValue(perfil.web));
      if(ubicacionHeader&&perfil.direccion) metaHeader.push("Ubicación: "+safeHeaderValue(perfil.direccion));
      var maxHeaderW=W-ML-MR-16;
      var cabeceraBase="";
      if(encNombre||encMatricula){
        cabeceraBase=encNombre?(safeHeaderValue(perfil.nombre).toUpperCase()+(encMatricula&&perfil.matricula?" — Matrícula: "+safeHeaderValue(perfil.matricula):"")):("Matrícula: "+safeHeaderValue(perfil.matricula));
      }
      var mainSize=fitPdfTextSize(cabeceraBase,12,7.5,maxHeaderW,true);
      var metaSize=7.0;
      var headerH=38;
      var topTextY=y+9;
      var metaY=y-5;
      var rectTop=y+20;
      var rectBottom=y-18;
      if(esClasico){
        hline(y+13,0.3,null,0.75);
        if(cabeceraBase) text(centeredX(cabeceraBase,mainSize,true),topTextY,cabeceraBase,mainSize,true);
        metaHeader.slice(0,2).forEach(function(v,i){
          var fs=fitPdfTextSize(v,metaSize,5.9,maxHeaderW,false);
          text(centeredX(v,fs,false),metaY-(i*9),v,fs,false);
        });
        hline(y-18-(metaHeader.length>1?2:0),0.3,null,0.75);
        y-=48;
      } else {
        rect(ML,rectBottom,W-ML-MR,rectTop-rectBottom,estilo==="corporativo"?rgbPdfStr(colorPrim):rgbPdfStr(tintRgb(colorPrim,0.94)));
        var mainColor=estilo==="corporativo"?{r:1,g:1,b:1}:colorPrim;
        var metaColor=estilo==="corporativo"?tintRgb(colorPrim,0.45):{r:0.36,g:0.41,b:0.46};
        if(cabeceraBase){
          var mainX=estilo==="corporativo"?ML+8:centeredX(cabeceraBase,mainSize,true);
          text(mainX,topTextY,cabeceraBase,mainSize,true,0,mainColor);
        }
        metaHeader.slice(0,2).forEach(function(v,i){
          var fs=fitPdfTextSize(v,metaSize,5.9,maxHeaderW,false);
          var mx=estilo==="corporativo"?ML+8:centeredX(v,fs,false);
          text(mx,metaY-(i*9),v,fs,false,0,metaColor);
        });
        y-=(headerH+4);
      }
    }

    // Título — bloque corporativo centrado, con más aire alrededor
    function lineOf(h){return h;}
    function centeredX(txt,size,bold){
      var w=mw(txt,size,bold);
      return Math.max(ML,(W-w)/2);
    }
    hline(y,esClasico?0.3:null,esClasico?null:accentColor,esClasico?0.75:1); y-=26;
    var tituloTxt=doc.titulo.toUpperCase();
    text(centeredX(tituloTxt,15,true),y,tituloTxt,15,true); y-=22;
    if(doc.subtitulo){
      var subTxt=doc.subtitulo;
      text(centeredX(subTxt,10,false),y,subTxt,10,false); y-=lineOf(18);
    }
    if(doc.nroRecibo){
      var nroTxt="N\xb0 "+doc.nroRecibo;
      text(centeredX(nroTxt,11,true),y,nroTxt,11,true); y-=18;
    }
    hline(y,0.75); y-=18;
    text(ML,y,"Lugar: "+(doc.ciudad||"")+"   |   Fecha: "+(doc.fecha||""),10,false); y-=18;
    hline(y); y-=22;
    if(esClasico){ hline(y+3,0.3,null,0.75); y-=4; } // doble filete clásico bajo la línea de lugar/fecha

    // Dibuja un párrafo justificado con ajuste real de ancho (Helvetica),
    // con salto de línea con sangría francesa para los renglones siguientes.
    // prefixRuns: array de {txt, bold} que abre el párrafo en negrita (rótulo/número).
    function textCentered(cx,yy,txt,size,bold,wordSpacing,colorRgb){
      var safe=latin1Safe(txt);
      if(!safe) return;
      var w=textWidthPt(safe,size,bold);
      text(cx-w/2,yy,safe,size,bold,wordSpacing,colorRgb);
    }

    function drawParagraph(prefixRuns, bodyText, opts){
      opts=opts||{};
      var size=opts.size||9.5, gap=opts.gap||14.5, indent=opts.indent||16;
      var maxW=W-ML-MR;
      // Rótulo en negrita: las cláusulas terminan en ":" SIN espacio final.
      // El espacio se dibuja aparte. NO se agrega ":" a numeraciones tipo
      // "1." / "2." (PRESTA CONFORMIDAD y listas similares).
      var runs=(prefixRuns||[]).map(function(r,i,arr){
        var t=String(r&&r.txt||"");
        if(i===arr.length-1){
          t=t.replace(/\s+$/,"");
          // Solo rótulos de cláusula (tienen letras). Ej: "CLÁUSULA PRIMERA — PRECIO"
          // No tocar "1." "2." "3." de conformidad / listas numeradas.
          if(t && !/:$/.test(t) && !/^\d+\.?$/.test(t)) t=t+":";
        }
        return {txt:t, bold:!!(r&&r.bold)};
      });
      var spaceW = runs.length ? mw(" ", size, false) : 0;
      var prefixW=0;
      runs.forEach(function(r){ prefixW+=mw(r.txt,size,r.bold); });
      prefixW += spaceW;
      var firstBudget=maxW-prefixW, restBudget=maxW-indent;

      // Primera pasada: arma las líneas (solo mide ancho, sin dibujar todavía),
      // para poder distinguir la última línea de cada párrafo y no justificarla
      // (regla tipográfica estándar: la última línea va alineada a la izquierda).
      bodyText=cuerpoTrasRotulo(normalizarTextoDocumento(bodyText));
      var words=(bodyText||"").split(/\s+/).filter(Boolean);
      var wrapped=[]; var lineWords=[], firstLine=true;
      function budget(){ return firstLine ? firstBudget : restBudget; }
      words.forEach(function(w){
        var ww=mw((lineWords.length?" ":"")+w,size,false);
        var curW=mw(lineWords.join(" "),size,false);
        if(lineWords.length>0 && curW+ww>budget()){ wrapped.push({words:lineWords,first:firstLine}); lineWords=[]; firstLine=false; }
        lineWords.push(w);
      });
      if(lineWords.length) wrapped.push({words:lineWords,first:firstLine});

      function drawPrefixAt(startX){
        var curX=startX;
        runs.forEach(function(r){ text(curX,y,r.txt,size,r.bold,0,r.bold?labelColor:null); curX+=mw(r.txt,size,r.bold); });
        if(runs.length && spaceW>0){
          // Espacio real entre rótulo y cuerpo (no depende del trailing space del run bold).
          text(curX,y," ",size,false);
          curX+=spaceW;
        }
        return curX;
      }

      if(wrapped.length===0){
        if(runs&&runs.length){
          ensureSpace(gap);
          drawPrefixAt(ML);
          y-=gap;
        }
      } else {
        wrapped.forEach(function(ln,li){
          ensureSpace(gap);
          var isLast=(li===wrapped.length-1);
          var lineStr=ln.words.join(" ");
          var lx, avail;
          if(ln.first){
            lx=ML; avail=firstBudget;
            lx=drawPrefixAt(ML);
          } else {
            lx=ML+indent; avail=restBudget;
          }
          if(!isLast && ln.words.length>1){
            var naturalW=mw(lineStr,size,false);
            var extra=avail-naturalW;
            var tw=extra/(ln.words.length-1);
            text(lx,y,lineStr,size,false,(tw>0&&tw<9)?tw:0);
          } else {
            text(lx,y,lineStr,size,false);
          }
          y-=gap;
        });
      }
      // Espacio extra entre cláusulas/párrafos, para que el documento respire.
      y-=(opts.spaceAfter!=null?opts.spaceAfter:11);
    }

    // Encabezado narrativo (reserva y otros tipos que lo definan)
    if(doc.encabezado){
      doc.encabezado.split("\n\n").forEach(function(par){
        if(par.trim()) drawParagraph([], par.trim());
      });
      y-=8;
    }

    // Partes
    if(doc.partes&&doc.partes.length&&!doc.ocultarPartesEnCuerpo){
      ensureSpace(28);
      text(ML,y,"PARTES INTERVINIENTES",10,true,0,labelColor); y-=20;
      doc.partes.forEach(function(parte){
        ensureSpace(56);
        text(ML,y,parte.rol.toUpperCase()+": "+(parte.nombre||"\u2014"),10,true); y-=14;
        if(parte.dni){text(ML+10,y,tipoIdentificacion(parte.dni)+": "+parte.dni,9,false);y-=12;}
        if(parte.domicilio){text(ML+10,y,"Domicilio: "+parte.domicilio,9,false);y-=12;}
        y-=10;
      });
      hline(y); y-=20;
    }

    // Secciones — rótulo en negrita + texto corrido en el mismo párrafo (estilo Bayugar).
    // Si el título es solo el número ("7."), la cláusula no lleva rótulo (como en el modelo).
    // Aplica a TODOS los tipos de documento (reserva, boleto, alquiler, etc.).
    if(doc.secciones){
      doc.secciones.forEach(function(sec){
        var prefix = prefijoClausulaFormal(sec.titulo);
        (sec.items||[]).forEach(function(item,idx){
          if(!item) return;
          if(idx===0) drawParagraph([{txt:prefix,bold:true}], cuerpoTrasRotulo(item));
          else drawParagraph([], normalizarTextoDocumento(item));
        });
      });
    }

    // Cláusulas (continúan la numeración de las secciones, sin encabezado separado)
    if(doc.clausulas&&doc.clausulas.length){
      doc.clausulas.forEach(function(c){
        var label=prefijoClausulaDesdeNumTitulo(c.num, c.titulo||"");
        drawParagraph([{txt:label,bold:true}], cuerpoTrasRotulo(c.texto||""), {gap:14.5, spaceAfter:17, indent:16});
      });
    }

    // Firmas principales: espacio generoso ARRIBA de la línea para firma
    // manuscrita al imprimir (~55–65 pt). Si no entra el bloque completo,
    // salta de página entero (no deja la línea sin aire).
    var firmantesPpales = (doc.firmas&&doc.firmas.length) ? doc.firmas : doc.partes;
    var nFirm = (firmantesPpales && firmantesPpales.length) ? firmantesPpales.length : 0;
    var firmaBlank = 62;   // aire para la firma a mano
    var firmaLabels = 36;  // rol + nombre + dni bajo la línea
    ensureSpace(firmaBlank + firmaLabels + 24);
    hline(y); y -= 14;
    y -= firmaBlank; // zona en blanco donde se firma
    var huboInmobEnFirmas=false;
    if(nFirm){
      var colW=(W-ML-MR)/Math.max(nFirm,1);
      var sigW=Math.min(160,Math.max(100,colW-16));
      firmantesPpales.forEach(function(p,i){
        var cx=ML+i*colW+colW/2;
        var nombreFirma = p.usarPerfil ? ((perfil&&perfil.nombre)||"Inmobiliaria interviniente") : p.nombre;
        var rolFirma = p.usarPerfil ? (p.rol+((perfil&&perfil.matricula)?" — Mat. "+perfil.matricula:"")) : p.rol;
        if(p.usarPerfil) huboInmobEnFirmas=true;
        // Línea de firma
        lines.push("0.5 G 0.6 w "+(cx-sigW/2)+" "+y+" m "+(cx+sigW/2)+" "+y+" l S 0 G");
        textCentered(cx,y-12,rolFirma||"",8,false);
        textCentered(cx,y-24,nombreFirma||"",8,true);
        if(p.dni) textCentered(cx,y-35,tipoIdentificacion(p.dni)+": "+p.dni,8,false);
      });
      y -= firmaLabels;
    }
    if(!huboInmobEnFirmas){
      ensureSpace(firmaBlank + 28);
      y -= Math.min(firmaBlank, 40);
      textCentered(ML+(W-ML-MR)/2,y,"________________________",9,false);
      textCentered(ML+(W-ML-MR)/2,y-14,"INMOBILIARIA INTERVINIENTE"+(perfil&&perfil.nombre?" — "+perfil.nombre:""),8,false);
      y -= 28;
    }

    // Presta Conformidad + firma del PROPIETARIO con el mismo aire para
    // firmar a mano. Si el bloque no entra, ensureSpace mueve todo junto.
    if(doc.conformidad&&doc.conformidad.items&&doc.conformidad.items.length){
      y -= 18;
      ensureSpace(36);
      hline(y); y -= 16;
      text(ML,y,"PRESTA CONFORMIDAD",11,true,0,labelColor); y -= 16;
      var confItems=doc.conformidad.items;
      confItems.forEach(function(txt,i){
        drawParagraph([{txt:(i+1)+". ",bold:true}], txt, {spaceAfter:10});
      });
      // Reserva aire de firma + rótulos del propietario en un solo bloque
      ensureSpace(firmaBlank + firmaLabels + 10);
      y -= 8;
      y -= firmaBlank;
      var cxConformidad=ML+(W-ML-MR)/2;
      var sigWConformidad=Math.min(200,Math.max(140,W-ML-MR-40));
      lines.push("0.5 G 0.6 w "+(cxConformidad-sigWConformidad/2)+" "+y+" m "+(cxConformidad+sigWConformidad/2)+" "+y+" l S 0 G");
      textCentered(cxConformidad,y-12,"PROPIETARIO",8,false);
      textCentered(cxConformidad,y-24,doc.conformidad.firmante||"",8,true);
      if(doc.conformidad.dni) textCentered(cxConformidad,y-35,tipoIdentificacion(doc.conformidad.dni)+": "+doc.conformidad.dni,8,false);
      y -= firmaLabels;
    }

    // Cierra la última página pendiente
    finishPage();

    // Assemble PDF (multi-página)
    var catalog=addObj("<< /Type /Catalog /Pages 2 0 R >>"); // objeto 1
    objects.push(null); // placeholder objeto 2 (Pages, se completa después de conocer los Kids)

    // Fuentes e imagen se agregan ANTES que las páginas para conocer sus
    // números de objeto reales al momento de referenciarlos en /Resources.
    // /Encoding /WinAnsiEncoding es imprescindible: sin declararlo, los visores
    // asumen StandardEncoding y los bytes de letras acentuadas (á,é,í,ó,ú,ñ,ü)
    // no coinciden con esos glifos, mostrando caracteres rotos o vacíos.
    var font1=addObj("<< /Type /Font /Subtype /Type1 /BaseFont /"+FONT_REG+" /Encoding /WinAnsiEncoding >>");
    var font2=addObj("<< /Type /Font /Subtype /Type1 /BaseFont /"+FONT_BOLD+" /Encoding /WinAnsiEncoding >>");

    var imgRealNum=null;
    if(imgObjNum&&logoInfo){
      try{
        var imgMatch=logoInfo.dataUrl.match(/^data:image\/jpeg;base64,(.+)$/);
        if(imgMatch){
          var imgBytes=atob(imgMatch[1]);
          var imgLen=imgBytes.length;
          var imgObj="<< /Type /XObject /Subtype /Image /Width "+logoInfo.width+" /Height "+logoInfo.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+imgLen+" >>\nstream\n"+imgBytes+"\nendstream";
          imgRealNum=addObj(imgObj);
        }
      }catch(ex){}
    }
    var imgResourceStr = imgRealNum ? " /XObject << /Im1 "+imgRealNum+" 0 R >>" : "";

    var kidsRefs=[];
    var totalPages=pagesContent.length;
    pagesContent.forEach(function(content){
      var pageObjNum = addObj("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+H+"] /Contents "+(objects.length+2)+" 0 R /Resources << /Font << /F1 "+font1+" 0 R /F2 "+font2+" 0 R >>"+imgResourceStr+" >> >>");
      var contentObjNum = addObj("<< /Length "+content.length+" >>\nstream\n"+content+"\nendstream");
      kidsRefs.push(pageObjNum+" 0 R");
    });
    objects[1] = "<< /Type /Pages /Kids ["+kidsRefs.join(" ")+"] /Count "+totalPages+" >>";

    var pdf="%PDF-1.4\n";
    objects.forEach(function(obj,i){
      xrefs.push(pdf.length);
      pdf+=(i+1)+" 0 obj\n"+obj+"\nendobj\n";
    });
    var xrefOffset=pdf.length;
    pdf+="xref\n0 "+(objects.length+1)+"\n";
    pdf+="0000000000 65535 f \n";
    xrefs.forEach(function(x){pdf+=(x+"").padStart(10,"0")+" 00000 n \n";});
    pdf+="trailer\n<< /Size "+(objects.length+1)+" /Root 1 0 R >>\n";
    pdf+="startxref\n"+xrefOffset+"\n%%EOF";
    var blob=new Blob([strToLatin1Bytes(pdf)],{type:"application/pdf"});
    var _p1=(doc.partes&&doc.partes[0]&&doc.partes[0].nombre)?doc.partes[0].nombre.split(" ").slice(0,2).join("_"):"";
    var _p2=(doc.partes&&doc.partes[1]&&doc.partes[1].nombre)?doc.partes[1].nombre.split(" ").slice(0,2).join("_"):"";
    var _partes=(_p1&&_p2)?("_"+_p1+"-"+_p2):(_p1?"_"+_p1:"");
    var filename=(doc.titulo||"documento").replace(/[^\w\s-]/g,"").replace(/\s+/g,"_")+_partes+".pdf";
    return {blob:blob, filename:filename};
  } catch(e) {
    throw new Error("Error generando el PDF: "+(e&&e.message?e.message:"error desconocido"));
  }
}

function injectFonts() {
  // Viewport meta — crítico para que los breakpoints mobile funcionen
  if (!document.querySelector("meta[name=viewport]")) {
    var vm = document.createElement("meta");
    vm.name = "viewport";
    vm.content = "width=device-width, initial-scale=1, maximum-scale=1";
    document.head.insertBefore(vm, document.head.firstChild);
  }
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
//   /public/manifest.json  (mismo contenido que PWA_MANIFEST más abajo)
//   /public/sw.js           (cachea el shell con estrategia cache-first)
//
// y enlazar el manifest en index.html con:
//   <link rel="manifest" href="/manifest.json">
//   <meta name="theme-color" content="#0b1730">
// Si esos archivos no existen todavía, initPWA() no rompe nada: el registro
// del Service Worker falla en silencio y la app sigue funcionando online.
var DOCWORKS_VERSION = "3.56 PRO";
// 3.13: estabilización — errores de auth, cleanup de suscripción, rollback de operaciones y estados de devolución.

// Logo público usado por la app y por el favicon.
const LOGO_B64 = "/logo.png";

// Título visible de la web: siempre refleja la versión del documento.
if (typeof document !== "undefined") document.title = "DocWorks v" + DOCWORKS_VERSION;
  // Favicon de DocWorks: se muestra en la pestaña del navegador.
  try {
    var fav = document.getElementById("docworks-favicon");
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
  start_url: "/",
  display: "standalone",
  background_color: "#0b1730",
  theme_color: "#0b1730",
  orientation: "portrait-primary",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
};
function initPWA() {
  try {
    // Manifest: se inyecta como Blob URL para no depender de un archivo estático.
    if (!document.getElementById("docworks-manifest")) {
      var blob = new Blob([JSON.stringify(PWA_MANIFEST)], { type: "application/json" });
      var link = document.createElement("link");
      link.id = "docworks-manifest";
      link.rel = "manifest";
      link.href = URL.createObjectURL(blob);
      document.head.appendChild(link);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      var meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = PWA_MANIFEST.theme_color;
      document.head.appendChild(meta);
    }
    // Service Worker: requiere HTTPS (o localhost) y el archivo /sw.js servido
    // por el propio dominio. Si no existe todavía (por ejemplo en este entorno
    // de desarrollo/preview), el .catch() evita que rompa la carga de la app.
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register("/sw.js").catch(function(){ /* sw.js aún no desplegado: no offline, pero la app funciona igual online */ });
    }
  } catch (e) { /* nunca romper la carga de la app por esto */ }
}

const ESTADOS = { borrador:"Borrador", activo:"Activo", cerrado:"Cerrado" };
const TIPOS = {
  reserva:"Reserva de Compra", boleto:"Boleto de Compraventa",
  reserva_alquiler:"Reserva de Alquiler", alquiler:"Contrato de Alquiler",
  comodato:"Comodato", exclusividad:"Autorización de Venta",
  refuerzo_reserva:"Refuerzo de Reserva", devolucion_reserva:"Devolución de Reserva",
};
const TIPO_ICON = { reserva:"🔒", boleto:"📄", reserva_alquiler:"🗝", alquiler:"🏠", comodato:"🤝", exclusividad:"✍️", refuerzo_reserva:"📌", devolucion_reserva:"↩" };

const CLAUSULAS_DEFAULT = [
  { id:"c1", titulo:"Multa por incumplimiento", categoria:"rescision", tipos:["reserva","boleto","refuerzo_reserva"], contenido:"En caso de incumplimiento por parte del COMPRADOR, perdera en concepto de multa el importe entregado como sena. En caso de incumplimiento por parte del VENDEDOR, debera devolver el doble del importe recibido." },
  { id:"c2", titulo:"Libre de ocupantes", categoria:"posesion", tipos:["reserva","boleto"], contenido:"El inmueble se entregara libre de ocupantes, deudas y gravamenes de cualquier naturaleza a la fecha de posesion pactada." },
  { id:"c3", titulo:"Expensas y servicios", categoria:"posesion", tipos:["reserva","boleto"], contenido:"Los gastos de expensas, impuestos y servicios seran abonados por el VENDEDOR hasta la fecha de posesion, y a partir de dicha fecha quedaran a cargo del COMPRADOR." },
  { id:"c4", titulo:"Comision inmobiliaria", categoria:"general", tipos:["reserva","boleto","exclusividad"], contenido:"Ambas partes reconocen la intervencion de la inmobiliaria y se comprometen a abonar la comision pactada sobre el precio total de venta." },
  { id:"c5", titulo:"Jurisdiccion", categoria:"general", tipos:["todos"], contenido:"Para cualquier diferendo que pudiera surgir del presente, las partes se someten a la jurisdiccion de los tribunales ordinarios de la ciudad indicada en el presente instrumento." },
  { id:"c6", titulo:"Estado del inmueble", categoria:"alquiler", tipos:["alquiler"], contenido:"El LOCATARIO declara recibir el inmueble en perfecto estado de conservacion y uso, comprometiendose a restituirlo en iguales condiciones al vencimiento del contrato, salvo el deterioro del uso normal." },
  { id:"c7", titulo:"Prohibicion de subalquilar", categoria:"alquiler", tipos:["alquiler"], contenido:"El LOCATARIO no podra subalquilar, ceder ni transferir total o parcialmente el uso del inmueble sin el consentimiento expreso y por escrito del LOCADOR." },
  { id:"c8", titulo:"Servicios a cargo del locatario", categoria:"alquiler", tipos:["alquiler"], contenido:"Los gastos de electricidad, gas, agua, internet y demas servicios del inmueble quedaran a cargo exclusivo del LOCATARIO desde la entrega de la posesion." },
  { id:"c9", titulo:"Obras y mejoras", categoria:"alquiler", tipos:["alquiler"], contenido:"El LOCATARIO no podra realizar obras o mejoras sin la autorizacion escrita del LOCADOR. Las mejoras que se realicen quedaran en beneficio del inmueble sin compensacion alguna." },
];

// ── Cláusulas a medida: catálogo de variables insertables por menú desplegable ──
// Cada cláusula (predeterminada o creada por la inmobiliaria) puede llevar tokens
// {{campo}} en su texto, que se resuelven con los datos reales de cada operación
// al momento de generar el documento (ver resolveVars / finalizeDoc).
function tipoIdentificacion(valor) {
  var limpio = String(valor || "").replace(/\D/g, "");
  if (limpio.length === 7 || limpio.length === 8) return "DNI";
  if (limpio.length === 11) return "CUIT";
  return "DNI/CUIT";
}
function etiquetaIdentificacion(valor) {
  return tipoIdentificacion(valor) + ":";
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
  { group:"Vendedor / Propietario",   fields: personaVars("vendedor","Vendedor/Propietario") },
  { group:"Locador / Propietario",    fields: personaVars("locador","Locador/Propietario") },
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
  var fin = op.alquiler_fin ? fmtD(op.alquiler_fin) : fmtD(addMonthsDias(op.alquiler_inicio,op.alquiler_plazo_meses,op.alquiler_plazo_dias));
  var indiceKey = op.alquiler_actualizacion || "ICL";
  var indiceEsFijo = indiceKey === "fijo";
  var indiceNombre = indiceKey === "otro" ? (op.alquiler_actualizacion_otro || "a definir") : indiceKey;
  var periodoKey = op.alquiler_periodo_actualizacion || "cuatrimestral";
  var periodoTxt = periodoKey === "otro" ? (op.alquiler_periodo_otro || "a definir") : periodoKey;
  var diaPagoTxt = op.alquiler_dia_pago === "otro" ? (op.alquiler_dia_pago_otro || "___") : (op.alquiler_dia_pago || "1");
  var canonClause = indiceEsFijo
    ? "El canon locativo mensual se pacta en "+fmt$L(op.alquiler_monto_inicial,op.alquiler_moneda)+", con carácter FIJO, sin actualización durante toda la vigencia del contrato. El pago se efectuará el día "+diaPagoTxt+" de cada mes, mediante "+formaPagoTexto(op.alquiler_forma_pago)+".-"
    : "El canon locativo mensual inicial se pacta en "+fmt$L(op.alquiler_monto_inicial,op.alquiler_moneda)+", con actualización "+periodoTxt+" conforme al índice "+indiceNombre+(indiceKey==="ICL"?" que publica el BCRA":"")+". El pago se efectuará el día "+diaPagoTxt+" de cada mes, mediante "+formaPagoTexto(op.alquiler_forma_pago)+".-";
  var depositoMontoNum = op.alquiler_deposito === "otro" ? parseFloat(op.alquiler_deposito_otro_monto||0) : parseFloat(op.alquiler_monto_inicial||0)*parseFloat(op.alquiler_deposito||1);
  var depositoMoneda = op.alquiler_deposito === "otro" ? (op.alquiler_deposito_otro_moneda||"USD") : op.alquiler_moneda;
  var depositoDesc = op.alquiler_deposito === "otro" ? "un monto fijo de "+fmt$L(depositoMontoNum,depositoMoneda) : "el equivalente a "+(op.alquiler_deposito||"1")+" mes de alquiler, es decir "+fmt$L(depositoMontoNum,depositoMoneda);
  var garantiaDetalle = (op.alquiler_garantia_texto_personalizado && op.alquiler_garantia_texto_personalizado.trim())
    ? op.alquiler_garantia_texto_personalizado.trim()
    : op.alquiler_garantia_tipo === "propietario"
    ? "Se constituye garantía propietaria a cargo de "+(op.alquiler_garantia_titular||"___")+", "+tipoIdentificacion(op.alquiler_garantia_dni)+": "+(op.alquiler_garantia_dni||"___")+", titular del inmueble sito en "+(op.alquiler_garantia_inmueble||"___")+".-"
    : op.alquiler_garantia_tipo === "seguro_caucion" ? "Se constituye como garantía un Seguro de Caución a contratar por el LOCATARIO en forma previa a la firma del presente.-"
    : op.alquiler_garantia_tipo === "aval_bancario" ? "Se constituye como garantía un Aval Bancario otorgado a favor del LOCATARIO.-"
    : "Se constituye como garantía el Recibo de Sueldo de "+(op.alquiler_garantia_titular||"___")+".-";
  var exclCon = (op.exclusividad_tipo||"con")==="con";
  var exclModalidad = exclCon ? "La presente autorización es EXCLUSIVA por el término de "+(op.exclusividad_vigencia||"90 días")+", plazo durante el cual el PROPIETARIO no podrá comercializar el inmueble por otro medio o intermediario.-" : "La presente autorización es SIN EXCLUSIVIDAD por el término de "+(op.exclusividad_vigencia||"90 días")+". El PROPIETARIO podrá comercializar el inmueble simultáneamente por otros medios o intermediarios.-";
  return {
    moneda_txt: monedaTxt,
    precio_letras: fmt$L(op.precio, op.moneda || moneda),
    anticipo_letras: fmt$L(op.anticipo, op.moneda || moneda),
    saldo_letras: fmt$L(op.saldo, op.moneda || moneda),
    escribania_clausula: op.escribania ? ("Escribanía designada: " + op.escribania + ".") : "El Escribano será designado por el Oferente,",
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
    alquiler_comision_locador_final: op.alquiler_comision_locador || op.alquiler_comision || "___",
    alquiler_comision_locatario_final: op.alquiler_comision_locatario || op.alquiler_comision || "___",
    alquiler_comision_locador_texto: textoComision(op,"alquiler_comision_locador","LOCADOR","total del contrato",totalContratoAlquiler(op),op.alquiler_moneda||"ARS","alquiler_comision_locador",op.alquiler_comision||"1"),
    alquiler_comision_locatario_texto: textoComision(op,"alquiler_comision_locatario","LOCATARIO","total del contrato",totalContratoAlquiler(op),op.alquiler_moneda||"ARS","alquiler_comision_locatario",op.alquiler_comision||"1"),
    reserva_alquiler_moneda_txt: op.res_alq_moneda === "USD" ? "DÓLARES ESTADOUNIDENSES" : "PESOS ARGENTINOS",
    reserva_alquiler_reserva: fmt$L(op.res_alq_monto_reserva,op.res_alq_moneda),
    reserva_alquiler_canon: fmt$L(op.res_alq_monto_mensual,op.res_alq_monto_mensual_moneda || op.res_alq_moneda || "ARS"),
    reserva_alquiler_plazo: op.res_alq_plazo_cantidad || "24",
    reserva_alquiler_unidad: op.res_alq_plazo_unidad || "meses",
    reserva_alquiler_inicio: fmtD(op.res_alq_inicio_estimado),
    reserva_alquiler_aceptacion_dias: op.res_alq_aceptacion_dias || "2",
    reserva_alquiler_vigencia_dias: op.res_alq_vigencia_dias || "10",
    reserva_alquiler_comision_locador: op.res_alq_comision_locador || op.res_alq_comision || "___",
    reserva_alquiler_comision_locatario: op.res_alq_comision_locatario || op.res_alq_comision || "___",
    reserva_alquiler_comision_locador_texto: textoComision(op,"res_alq_comision_locador","LOCADOR","canon mensual",parseFloat(op.res_alq_monto_mensual||0),op.res_alq_moneda||"ARS","res_alq_comision_locador",op.res_alq_comision||"1"),
    reserva_alquiler_comision_locatario_texto: textoComision(op,"res_alq_comision_locatario","LOCATARIO","canon mensual",parseFloat(op.res_alq_monto_mensual||0),op.res_alq_moneda||"ARS","res_alq_comision_locatario",op.res_alq_comision||"1"),
    exclusividad_modalidad_texto: exclModalidad,
    refuerzo_trayectoria: op.refuerzo_trayectoria || ("Las partes han suscripto con anterioridad una Reserva de Compra para el inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+".-"),
    devolucion_motivo_texto: op.devolucion_motivo || "Por mutuo acuerdo entre las partes, y ante la no concreción de la operación, se procede a la devolución íntegra del monto de reserva oportunamente entregado.-"
  };
}
var TOKENS_CONTACTO_PARTES_PRIVADOS = {
  comprador_email:true, comprador_telefono:true, vendedor_email:true, vendedor_telefono:true,
  locador_email:true, locador_telefono:true, locatario_email:true, locatario_telefono:true
};
function resolveVars(text, op, extra) {
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
      base=parseFloat((op||{}).precio||0); moneda=(op||{}).moneda||"USD"; def=key.indexOf("vendedor")>=0?"4":"3";
    } else if(key.indexOf("alquiler_comision_")==0){
      base=totalContratoAlquiler(op||{}); moneda=(op||{}).alquiler_moneda||"ARS"; def=(op||{}).alquiler_comision||"1";
    } else {
      base=parseFloat((op||{}).res_alq_monto_mensual||0); moneda=(op||{}).res_alq_moneda||(op||{}).res_alq_monto_mensual_moneda||"ARS"; def=(op||{}).res_alq_comision||"1";
    }
    var c=getComisionConfig(op,key,base,moneda,legacy,def);
    if(c.modo==="fijo"){ fixedLegacyKeys[key]=true; return fmt$L(c.valor,c.moneda); }
    if(key.indexOf("alquiler_comision_")===0) return (c.valor||"___")+"% del total del contrato";
    if(key.indexOf("res_alq_comision_")===0) return (c.valor||"___")+"% del canon mensual";
    return c.valor||"___";
  });
  Object.keys(fixedLegacyKeys).forEach(function(key){
    if(key.indexOf("comision_")===0) out=out.replace(/\s+del (?:Precio total|precio de venta)\b/gi,"");
    if(key.indexOf("alquiler_comision_")===0) out=out.replace(/\s+del (?:primer )?canon mensual\b/gi,"");
    if(key.indexOf("res_alq_comision_")===0) out=out.replace(/\s+del canon mensual\b/gi,"");
  });
  return out.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, function(_, key) {
    if (TOKENS_CONTACTO_PARTES_PRIVADOS[key]) return "";
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
}
// Tokens derivados exclusivos del cuerpo de Reserva (Fase 1 — sistema de
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
    comision_porcentaje: (op.comision_porcentaje || "3"),
    comision_reserva_texto: (function(){
      var c=getComisionConfig(op,"comision_comprador",parseFloat(op.precio||0),op.moneda||"USD","comision_comprador",op.comision_porcentaje||"3");
      if(c.modo==="fijo") return "El Oferente abonará la suma de "+fmt$L(c.valor,c.moneda)+" en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente, al momento de la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-";
      return "El Oferente abonará el "+(c.valor||"___")+"% del Precio en el momento de la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente.-";
    })(),
    comision_vendedor_texto: textoComision(op,"comision_vendedor","VENDEDOR","Precio total",parseFloat(op.precio||0),op.moneda||"USD","comision_vendedor","4"),
    comision_comprador_texto: textoComision(op,"comision_comprador","COMPRADOR","Precio total",parseFloat(op.precio||0),op.moneda||"USD","comision_comprador","3"),
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
    escribania_clausula: op.escribania ? ("Escribanía designada: " + op.escribania + ".") : "El Escribano será designado por el Oferente,",
    notificacion_emails_clausula: "",
  };
}
// Compatibilidad: cláusulas guardadas antes de existir "tipos" (undefined) siguen
// mostrándose con la heurística anterior según su categoría.
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

// Plantillas: cada tipo de documento mantiene su propia selección y orden de cláusulas.
// Se conserva compatibilidad con la configuración anterior (`clausulas_default_ids`).
const PLANTILLA_TIPOS = [
  "reserva", "boleto", "reserva_alquiler", "alquiler", "comodato", "exclusividad", "refuerzo_reserva", "devolucion_reserva"
];
function obtenerPlantillaConfig(perfil, tipo, clausulas){
  var mapa = perfil && perfil.plantillas ? perfil.plantillas : {};
  var actual = mapa && mapa[tipo];
  if(actual && Array.isArray(actual.clausulas_ids)){
    return {clausulas_ids:actual.clausulas_ids.slice(), locked:!!actual.locked};
  }
  var legacy = (perfil && Array.isArray(perfil.clausulas_default_ids)) ? perfil.clausulas_default_ids.slice() : [];
  var ids = (clausulas||[]).filter(function(c){ return legacy.indexOf(c.id)!==-1 && clausulaAplicaTipo(c,tipo); }).map(function(c){return c.id;});
  return {clausulas_ids:ids, locked:!!(perfil && perfil.clausulas_default_locked)};
}
function obtenerIdsProtegidosDePlantillas(perfil){
  var out=[];
  var mapa=perfil&&perfil.plantillas?perfil.plantillas:{};
  PLANTILLA_TIPOS.forEach(function(tipo){
    var cfg=obtenerPlantillaConfig(perfil,tipo,[]);
    if(cfg.locked){ out=out.concat(cfg.clausulas_ids||[]); }
  });
  if(perfil&&perfil.clausulas_default_locked){ out=out.concat(perfil.clausulas_default_ids||[]); }
  return out.filter(function(id,i,a){return a.indexOf(id)===i;});
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
  var t=String(tpl||"");
  return t.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, function(_,k){
    var lab=labelTokenEncabezado(k, tipo);
    return '<span data-dw-token="'+k+'" contenteditable="false" style="display:inline-block;padding:1px 6px;border-radius:6px;background:rgba(70,180,230,.14);color:#59c7f3;font-weight:700;cursor:pointer;user-select:none;margin:0 1px">'+lab+'</span>';
  }).replace(/\n/g,"<br/>");
}
function EncabezadoEditor({tipo, value, onChange, onCancel, onSave, onRestablecer}){
  const editorRef=useRef(null);
  const [status,setStatus]=useState(null); // saving | saved | error | ia | ia-error
  const [msg,setMsg]=useState("");
  useEffect(function(){
    if(editorRef.current) editorRef.current.innerHTML=htmlEncabezadoDesdeTpl(value||"", tipo);
  }, [tipo]); // solo al montar / cambiar tipo; no en cada tecla
  function insertarToken(k){
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
      setStatus(null); setMsg("Revisá el texto y guardá si te convence.");
    }catch(e){
      setStatus("ia-error"); setMsg(traducirError(e&&e.message?e.message:"No se pudo usar la IA."));
    }
  }
  var tokens=tokensEncabezadoParaTipo(tipo);
  return (
    <div style={{marginTop:8}}>
      <div style={{fontSize:10.5,color:"var(--dim)",marginBottom:8,lineHeight:1.45}}>
        Hacé clic en los chips para insertar datos dinámicos (nombre del oferente, inmueble, montos, etc.). Se completan solos al generar el documento.
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="inp"
        style={{minHeight:120,lineHeight:1.55,padding:"10px 12px",whiteSpace:"pre-wrap",fontSize:12.5}}
        onKeyDown={function(e){ /* permitir Enter normal */ }}
      />
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
        {tokens.map(function(k){
          return (
            <button key={k} type="button" onMouseDown={function(e){e.preventDefault();}} onClick={function(){insertarToken(k);}}
              style={{padding:"5px 9px",borderRadius:8,border:"1px solid rgba(89,199,243,.35)",background:"rgba(89,199,243,.08)",color:"#59c7f3",fontWeight:700,cursor:"pointer",fontSize:10.5}}>
              {labelTokenEncabezado(k, tipo)}
            </button>
          );
        })}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12,alignItems:"center"}}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={function(){
          if(onRestablecer){
            var defTpl=DEFAULT_ENCABEZADOS[tipo]||"";
            if(editorRef.current) editorRef.current.innerHTML=htmlEncabezadoDesdeTpl(defTpl, tipo);
            onRestablecer();
          }
        }}>Restablecer valor predeterminado</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={conIA} disabled={status==="ia"}>
          {status==="ia"?"IA…":"Mejorar con IA"}
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={guardar} disabled={status==="saving"}>
          {status==="saving"?"Guardando…":"Guardar introducción"}
        </button>
        {msg && <span style={{fontSize:11,color:status==="ia-error"||status==="error"?"var(--red)":"var(--muted)"}}>{msg}</span>}
      </div>
    </div>
  );
}

function PlantillaPreview({tipo, encabezado, clausulas, nombreInmobiliaria}){
  var op = SAMPLE_OP_PREVIEW;
  var nombreInmobiliariaObligatoria=(nombreInmobiliaria&&String(nombreInmobiliaria).trim())?String(nombreInmobiliaria).trim():"la inmobiliaria";
  var textoEncabezado = encabezado && encabezado.trim() ? resolveVars(encabezado, op) : null;
  var aplicables = clausulas.filter(function(c){ return clausulaAplicaTipo(c, tipo); });
  return(
    <div className="pdf-content" style={{maxHeight:340,overflowY:"auto"}}>
      <div className="pdf-text">
        <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#1f2937"}}>{TIPOS[tipo]}</div>
        {textoEncabezado ? (
          textoEncabezado.split("\n\n").map(function(p,i){return <div key={i} style={{marginBottom:8,textAlign:"justify",color:"#1f2937"}}>{p}</div>;})
        ) : (
          <div style={{marginBottom:8,color:"#6b7280",fontStyle:"italic"}}>Se usará el encabezado predeterminado del sistema para «{TIPOS[tipo]}».</div>
        )}
        <div style={{borderTop:"1px solid #d1d5db",margin:"10px 0"}}/>
        <div style={{fontWeight:700,fontSize:11,color:"#6b7280",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Cláusulas adicionales de este documento</div>
        {aplicables.length===0 && <div style={{color:"#9ca3af",fontStyle:"italic"}}>No hay cláusulas cargadas para este tipo todavía.</div>}
        {aplicables.map(function(c,i){
          return (
            <div key={c.id} style={{marginBottom:8}}>
              <div style={{fontWeight:600,color:"#1f2937"}}>
                {(i+1)+". "+((c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título").toUpperCase()}
                {c.obligatoria && <span style={{marginLeft:6,fontSize:9.5,color:"#b45309"}}>🔒 OBLIGATORIA · La definió el Dueño/Administrador de {nombreInmobiliariaObligatoria}</span>}
              </div>
              <div style={{color:"#374151",textAlign:"justify"}}>{resolveVars(c.contenido, op)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ── Panel de bloques del cuerpo editable ─────────────────────────────────────
// Editor de bloques (referenciados por id estable, no por posición) +
// comparación generador actual vs. por bloques + vista previa completa.

var TOKEN_LABELS_DOCWORKS = {
  moneda_txt:"Moneda", precio_letras:"Precio en letras", anticipo_letras:"Anticipo / seña en letras", saldo_letras:"Saldo en letras",
  comprador_nombre:"Nombre del comprador / oferente", comprador_dni:"DNI / CUIT del comprador", comprador_domicilio:"Domicilio del comprador", comprador_email:"Correo electrónico del comprador", comprador_telefono:"Teléfono del comprador",
  vendedor_nombre:"Nombre del vendedor / propietario", vendedor_dni:"DNI / CUIT del vendedor", vendedor_domicilio:"Domicilio del vendedor", vendedor_email:"Correo electrónico del vendedor", vendedor_telefono:"Teléfono del vendedor",
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
    <div style={{fontSize:9.8,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>Campos automáticos protegidos</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{lista.map(function(k){return <span key={k} title="Este campo se completa automáticamente y no se puede eliminar" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 7px",borderRadius:999,border:"1px solid rgba(212,168,83,.22)",background:"rgba(212,168,83,.07)",color:"var(--gold)",fontSize:compact?9.5:10}}><b style={{fontWeight:650}}>{tokenLabelDocWorks(k)}</b><span style={{opacity:.65,fontSize:8.5}}>{"{{"+k+"}}"}</span><span style={{opacity:.7}}>🔒</span></span>;})}</div>
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
function PrecioNarrativaEditor({bloque, onSave, onCancel}){
  const [texto,setTexto]=useState(bloque&&bloque.contenido||"");
  const [titulo,setTitulo]=useState(bloque&&bloque.titulo||"PRECIO");
  const [status,setStatus]=useState(null);
  const [faltantes,setFaltantes]=useState([]);
  const editorRef=useRef(null);
  function syncTexto(){
    // No actualizamos el estado React en cada tecla: hacerlo vuelve a renderizar
    // el contentEditable y mueve el cursor al inicio, haciendo que el texto
    // aparezca escrito al revés. El contenido real se lee del DOM al guardar.
    return;
  }
  function insertarToken(k){
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
        setStatus("saved"); setTimeout(function(){onCancel();},350);
      }).catch(function(){setStatus("error");});
    }catch(e){setStatus("error");}
  }
  return (
    <div style={{marginTop:8,padding:12,borderRadius:10,background:"rgba(212,168,83,0.055)",border:"1px solid rgba(212,168,83,0.22)"}}>
      <div style={{fontSize:12.5,fontWeight:700,color:"var(--text)",marginBottom:4}}>Cómo querés que aparezca el precio</div>
      <div style={{fontSize:10.8,color:"var(--dim)",lineHeight:1.45,marginBottom:9}}>Podés modificar libremente la redacción. <b style={{color:"#59c7f3"}}>Moneda</b> y <b style={{color:"#59c7f3"}}>Precio en letras</b> son campos automáticos protegidos.</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
        {PRECIO_NARRATIVAS_PRESET.map(function(preset){return <button key={preset.label} type="button" onClick={function(){if(editorRef.current) editorRef.current.innerHTML=htmlNarrativaPrecioDocWorks(preset.texto);setTexto(preset.texto);setFaltantes([]);setStatus(null);}} style={{padding:"6px 9px",borderRadius:8,border:"1px solid var(--border2)",background:"var(--card)",color:"var(--muted)",cursor:"pointer",fontSize:10.5}}>{preset.label}</button>;})}
      </div>
      <label className="field-label" style={{display:"block",marginBottom:5}}>Redacción del precio</label>
      <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={syncTexto} dangerouslySetInnerHTML={{__html:htmlNarrativaPrecioDocWorks(texto)}} style={{width:"100%",minHeight:86,padding:"9px 10px",boxSizing:"border-box",resize:"vertical",overflowY:"auto",border:"1px solid var(--border2)",borderRadius:8,background:"var(--input)",color:"var(--text)",lineHeight:1.5,outline:"none"}} />
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
        <button type="button" onMouseDown={function(e){e.preventDefault();}} onClick={function(){insertarToken("moneda_txt");}} style={{padding:"6px 9px",borderRadius:8,border:"1px solid rgba(89,199,243,.4)",background:"rgba(89,199,243,.1)",color:"#59c7f3",fontWeight:800,cursor:"pointer",fontSize:10.5}}>Moneda</button>
        <button type="button" onMouseDown={function(e){e.preventDefault();}} onClick={function(){insertarToken("precio_letras");}} style={{padding:"6px 9px",borderRadius:8,border:"1px solid rgba(89,199,243,.4)",background:"rgba(89,199,243,.1)",color:"#59c7f3",fontWeight:800,cursor:"pointer",fontSize:10.5}}>Precio en letras</button>
      </div>
      <TokensProtegidosDocWorks tokens={["moneda_txt","precio_letras"]} compact={true}/>
      <div style={{fontSize:10,color:"var(--dim)",marginTop:5}}>Los campos celestes son automáticos. Si eliminás uno, el texto queda intacto y DocWorks te va a pedir que lo vuelvas a insertar.</div>
      {status==="missing"&&<div style={{marginTop:8,padding:"8px 9px",borderRadius:8,border:"1px solid rgba(240,170,60,.35)",background:"rgba(240,170,60,.08)",color:"var(--text)",fontSize:10.5}}>
        <b>Falta completar este documento:</b> {faltantes.map(function(k){return <button key={k} type="button" onClick={function(){insertarToken(k);}} style={{marginLeft:6,marginTop:4,padding:"5px 8px",borderRadius:7,border:"1px solid rgba(89,199,243,.4)",background:"rgba(89,199,243,.1)",color:"#59c7f3",fontWeight:800,cursor:"pointer"}}>Insertar {k==="moneda_txt"?"Moneda":"Precio en letras"}</button>;})}
      </div>}
      <label className="field-label" style={{display:"block",marginTop:9,marginBottom:5}}>Título del bloque</label>
      <input className="inp" value={titulo} onChange={function(e){setTitulo(e.target.value);}} />
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginTop:10}}>
        <div style={{fontSize:10.5,color:status==="error"?"var(--red)":"var(--dim)"}}>{status==="saving"?"Guardando…":status==="saved"?"Guardado ✓":status==="error"?"No se pudo guardar. Intentá de nuevo.":status==="missing"?"Antes de guardar, insertá los campos que faltan.":""}</div>
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

function ReservaBloquesPanel({bloques, onUpdate, onMove, clausulasLib, operaciones, puedeEditar}){
  const [editId,setEditId]=useState(null);
  const [precioEditando,setPrecioEditando]=useState(false);
  const [draft,setDraft]=useState({titulo:"",contenido:""});
  var bloquesSeguros=Array.isArray(bloques)?bloques:[];
  var ordenados=bloquesSeguros.filter(function(b){return b&&typeof b==="object";}).map(function(b){
    var base=Object.assign({id:"",titulo:"",contenido:"",orden:0,sinTitulo:false,obligatoria:false,condicion:""},b);
    var def=(typeof DEFAULT_BLOQUES_RESERVA!=="undefined"&&Array.isArray(DEFAULT_BLOQUES_RESERVA))?DEFAULT_BLOQUES_RESERVA.find(function(x){return x.id===base.id;}):null;
    if(!String(base.titulo||"").trim()&&def&&String(def.titulo||"").trim()) base.titulo=def.titulo;
    return base;
  }).sort(function(a,b){return (Number(a.orden)||0)-(Number(b.orden)||0);});

  function abrirEditor(b){
    if(!b) return;
    var esPrecio = b.id === "reserva.precio";
    setPrecioEditando(esPrecio);
    setEditId(b.id);
    setDraft({titulo:String(b.titulo||""),contenido:String(b.contenido||"")});
  }
  function cancelarEdicion(){setEditId(null);setDraft({titulo:"",contenido:""});}
  function guardarEdicion(){
    if(editId===null||editId===undefined||editId==="") return;
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
      onUpdate(editId,{titulo:String(draft.titulo||""),contenido:contenido});
    }catch(e){ dwNotify("error","No se pudo preparar el bloque para guardar. Revisá el contenido e intentá nuevamente."); }
    cancelarEdicion();
  }

  return (
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
        <span style={{fontSize:14}}>🧱</span>
        <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",margin:0}}>Cuerpo editable del documento</p>
      </div>
      <div style={{fontSize:11,color:"var(--dim)",marginBottom:12,lineHeight:1.5}}>
        Modificá el texto de cada bloque. Las variables entre llaves siguen conectadas a Operaciones y el PDF/Word utilizan estos bloques.
      </div>

      {ordenados.length===0&&(
        <div style={{padding:"12px",borderRadius:9,border:"1px solid var(--border)",color:"var(--dim)",fontSize:11.5}}>
          No hay bloques de Reserva cargados todavía.
        </div>
      )}

      {ordenados.map(function(b,idx){
        var esPrimera=idx===0, esUltima=idx===ordenados.length-1;
        var editando=editId===b.id;
        return (
          <div key={String(b.id||idx)} style={{padding:"10px 12px",borderRadius:10,border:"1px solid var(--border2)",marginBottom:6,background:"var(--card)"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:12.5,fontWeight:600,color:"var(--text)"}}>{String(b.titulo||"").trim()||"Bloque sin título"}</span>
                  {b.obligatoria&&<span className="badge" style={{background:"rgba(180,83,9,0.08)",color:"#b45309"}}>Obligatoria</span>}
                  {b.condicion==="moneda_usd"&&<span className="badge badge-tipo">Solo si USD</span>}
                </div>
                {!editando&&<div style={{fontSize:11,color:"var(--muted)",marginTop:4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{mostrarTokensDocWorks(String(b.contenido||"").split("\n\n")[0])}</div>}
              </div>
              {puedeEditar&&!editando&&(
                <div style={{display:"flex",gap:3,flexShrink:0}}>
                  <button type="button" onClick={function(){if(!esPrimera&&onMove)onMove(b.id,"up");}} disabled={esPrimera} title="Subir" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:esPrimera?"var(--border2)":"var(--muted)",cursor:esPrimera?"default":"pointer",fontSize:12}}>↑</button>
                  <button type="button" onClick={function(){if(!esUltima&&onMove)onMove(b.id,"down");}} disabled={esUltima} title="Bajar" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:esUltima?"var(--border2)":"var(--muted)",cursor:esUltima?"default":"pointer",fontSize:12}}>↓</button>
                  <button type="button" onClick={function(){abrirEditor(b);}} title="Editar" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:12,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><DWIcon name="edit" size={14}/></button>
                </div>
              )}
            </div>

            {editando&&(b.id==="reserva.precio"&&precioEditando ? (
              <PrecioNarrativaEditor bloque={b} onSave={function(cambios){return onUpdate(editId,cambios);}} onCancel={cancelarEdicion} />
            ) : (
              <div style={{marginTop:8,paddingTop:8,borderTop:"1px dashed var(--border2)"}}>
                <label className="field" style={{display:"block",marginBottom:8}}><span className="field-label">Título del bloque</span><input className="inp" value={draft.titulo} onChange={function(e){setDraft(function(d){return Object.assign({},d,{titulo:e.target.value});});}} /></label>
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
    </div>
  );
}
function ReservaDocPreviewCompleta({doc}){
  return(
    <div className="pdf-content pdf-content-lg" style={{maxHeight:420}}>
      <div className="pdf-text">
        <div style={{textAlign:"center",fontWeight:700,fontSize:13,marginBottom:2}}>{doc.titulo}</div>
        <div style={{textAlign:"center",fontSize:10.5,color:"#6b7280",marginBottom:10}}>{doc.subtitulo}</div>
        <div style={{fontSize:10.5,color:"#6b7280",marginBottom:8}}>{doc.ciudad} — {doc.fecha}</div>
        {(doc.encabezado||"").split("\n\n").map(function(p,i){return <div key={i} style={{marginBottom:8,textAlign:"justify",color:"#1f2937"}}>{p}</div>;})}
        <div style={{borderTop:"1px solid #d1d5db",margin:"10px 0"}}/>
        {doc.secciones.map(function(s,i){
          return (
            <div key={i} style={{marginBottom:8}}>
              <div style={{fontWeight:600,color:"#1f2937"}}>{s.titulo}</div>
              {s.items.map(function(it,j){return <div key={j} style={{color:"#374151",textAlign:"justify",marginTop:j>0?4:0}}>{it}</div>;})}
            </div>
          );
        })}
        <div style={{borderTop:"1px solid #d1d5db",margin:"10px 0"}}/>
        <div style={{fontWeight:700,fontSize:11,color:"#6b7280",marginBottom:6,textTransform:"uppercase"}}>Conformidad</div>
        {doc.conformidad.items.map(function(t,i){return <div key={i} style={{color:"#374151",textAlign:"justify",marginBottom:6}}>{t}</div>;})}
      </div>
    </div>
  );
}
const ESTADO_BADGE_CLS={borrador:"badge-borrador",activo:"badge-activo",cerrado:"badge-cerrado"};

const EMPTY_OP = {
  tipo:"reserva", estado:"borrador", proceso_estado:"pendiente_aceptacion", reserva_aceptacion_dias:"5", reserva_aceptacion_vencimiento:"", negociacion_historial:[],
  comprador_nombre:"", comprador_dni:"", comprador_domicilio:"", comprador_email:"", comprador_telefono:"",
  vendedor_nombre:"", vendedor_dni:"", vendedor_domicilio:"", vendedor_email:"", vendedor_telefono:"",
  locador_nombre:"", locador_dni:"", locador_domicilio:"", locador_email:"", locador_telefono:"",
  locatario_nombre:"", locatario_dni:"", locatario_domicilio:"", locatario_email:"", locatario_telefono:"",
  comprador_cotitulares:[], vendedor_cotitulares:[], locador_cotitulares:[], locatario_cotitulares:[],
  inmueble_direccion:"", inmueble_partido:"", inmueble_provincia:"", nomenclatura_catastral:"", descripcion_inmueble:"",
  precio:"", moneda:"USD", anticipo:"", saldo:"", fecha_posesion:"", comision_porcentaje:"3", escribania:"", escribania_observaciones:"",
  res_alq_monto_reserva:"", res_alq_moneda:"ARS", res_alq_monto_mensual:"", res_alq_monto_mensual_moneda:"ARS", res_alq_plazo_meses:"24",
  res_alq_inicio_estimado:"", res_alq_destino:"vivienda", res_alq_comision:"1", res_alq_vigencia_dias:"10", res_alq_observaciones:"",
  alquiler_monto_inicial:"", alquiler_moneda:"ARS", alquiler_plazo_meses:"24", alquiler_inicio:"", alquiler_fin:"",
  alquiler_actualizacion:"ICL", alquiler_actualizacion_otro:"", alquiler_periodo_actualizacion:"cuatrimestral", alquiler_periodo_otro:"",
  alquiler_deposito:"1", alquiler_deposito_otro_monto:"", alquiler_deposito_otro_moneda:"USD", alquiler_destino:"vivienda",
  alquiler_garantia_tipo:"propietario", alquiler_garantia_titular:"", alquiler_garantia_dni:"", alquiler_garantia_inmueble:"",
  alquiler_garantia_texto_personalizado:"",
  alquiler_comision:"1", alquiler_comision_locador:"", alquiler_comision_locatario:"",
  alquiler_comision_locador_modo:"porcentaje", alquiler_comision_locador_valor:"", alquiler_comision_locador_moneda:"ARS",
  alquiler_comision_locatario_modo:"porcentaje", alquiler_comision_locatario_valor:"", alquiler_comision_locatario_moneda:"ARS",
  alquiler_forma_pago:["transferencia"], alquiler_dia_pago:"1", alquiler_dia_pago_otro:"",
  alquiler_interes_punitorio:"5", alquiler_penalidad_meses:"2", alquiler_seguro_dias:"10", alquiler_aviso_meses:"1",
  clausulas_ids:[], clausulas_custom:"", clausulas_custom_titulo:"",
  inmueble_tipo:"departamento", inmueble_tipo_otro:"", inmueble_unidad_funcional:"",
  alquiler_modo_plazo:"preset", alquiler_plazo_dias:"0",
  res_alq_aceptacion_dias:"2",
  comision_vendedor:"4", comision_comprador:"3",
  comision_vendedor_modo:"porcentaje", comision_vendedor_valor:"", comision_vendedor_moneda:"USD",
  comision_comprador_modo:"porcentaje", comision_comprador_valor:"", comision_comprador_moneda:"USD",
  res_alq_comision_locador:"", res_alq_comision_locatario:"",
  res_alq_comision_locador_modo:"porcentaje", res_alq_comision_locador_valor:"", res_alq_comision_locador_moneda:"ARS",
  res_alq_comision_locatario_modo:"porcentaje", res_alq_comision_locatario_valor:"", res_alq_comision_locatario_moneda:"ARS",
  res_alq_plazo_cantidad:"24", res_alq_plazo_unidad:"meses",
  parent_id:null,
  exclusividad_inmobiliaria_autofill:false,
  compartida:false, compartida_inmobiliaria:"", compartida_matricula:"", compartida_alcance:"completa",
  compartida_colega_activo:false, compartida_colega:"",
  alquiler_amoblado:false, alquiler_inventario:"",
  reserva_fecha_refuerzo:"",
  tareas_done:{},
};

// Un borrador "significativo" es aquel donde el usuario ya cargó al menos un
// dato real (más allá de los valores por defecto de EMPTY_OP). Sirve para no
// ofrecer recuperar un formulario que se abrió y cerró sin tocar nada.
function draftTieneContenido(d) {
  if (!d) return false;
  // También consideramos contenido real cuando el usuario cambió de tipo de
  // documento aunque todavía no haya completado un campo de texto. Así una
  // recarga no devuelve silenciosamente un alquiler/reserva a cero.
  if (d.tipo && d.tipo !== "reserva") return true;
  var campos = [
    "comprador_nombre","vendedor_nombre","locador_nombre","locatario_nombre",
    "inmueble_direccion","inmueble_partido","inmueble_provincia","precio",
    "anticipo","fecha_posesion","alquiler_monto_inicial","alquiler_inicio",
    "res_alq_monto_reserva","res_alq_monto_mensual","res_alq_inicio_estimado",
    "comodato_plazo","comodato_uso","devolucion_motivo","refuerzo_trayectoria",
  ];
  if(campos.some(function(c){ return d[c]!==undefined && d[c]!==null && String(d[c]).trim() !== ""; })) return true;
  if(Array.isArray(d.clausulas_ids) && d.clausulas_ids.length>0) return true;
  return false;
}

// ── CENTRO DE TAREAS ──────────────────────────────────────────────────────────
// Checklist operativo por operación (no legal, solo gestión interna del
// broker). op.tareas_done guarda {tareaId:true} — sparse, así que agregar o
// reordenar tareas acá no rompe operaciones ya creadas.
var TAREAS_DEFAULT = {
  alquiler: [
    ["dni_prop","Pedir DNI propietario"],
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
    fecha: op.created_at, icon: TIPO_ICON[op.tipo]||"📄",
    titulo: TIPOS[op.tipo]+" creada",
    detalle: padre ? "A partir de "+TIPOS[padre.tipo]+" del "+new Date(padre.created_at).toLocaleDateString("es-AR")+"." : null,
  });
  var hijos = (operaciones||[]).filter(function(o){return o.parent_id===op.id;});
  hijos.forEach(function(h){
    eventos.push({fecha:h.created_at, icon:TIPO_ICON[h.tipo]||"📄", titulo:TIPOS[h.tipo]+" generado", detalle:null});
  });
  var fechaClave=null, labelClave=null;
  if(op.tipo==="alquiler"){
    fechaClave=op.alquiler_inicio; labelClave="Inicio del contrato";
    var venc = op.alquiler_fin || (op.alquiler_inicio?addMonthsDias(op.alquiler_inicio,op.alquiler_plazo_meses,op.alquiler_plazo_dias):"");
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
// Chequeos rápidos, no bloqueantes: si encuentran algo, se muestra un aviso
// antes de generar el documento, pero el usuario puede continuar igual.
var CAMPOS_CRITICOS_POR_TIPO = {
  reserva:  [["comprador_nombre","Nombre del comprador"],["vendedor_nombre","Nombre del vendedor"],["inmueble_direccion","Dirección del inmueble"],["precio","Precio de la operación"]],
  boleto:   [["comprador_nombre","Nombre del comprador"],["vendedor_nombre","Nombre del vendedor"],["inmueble_direccion","Dirección del inmueble"],["precio","Precio de la operación"],["fecha_posesion","Fecha de posesión"]],
  alquiler: [["locador_nombre","Nombre del locador"],["locatario_nombre","Nombre del locatario"],["inmueble_direccion","Dirección del inmueble"],["alquiler_monto_inicial","Canon mensual"],["alquiler_inicio","Inicio del contrato"]],
  reserva_alquiler: [["locador_nombre","Nombre del locador"],["locatario_nombre","Nombre del locatario"],["inmueble_direccion","Dirección del inmueble"],["res_alq_monto_mensual","Valor del alquiler mensual"]],
  comodato: [["comprador_nombre","Nombre del comodatario"],["vendedor_nombre","Nombre del comodante"],["inmueble_direccion","Dirección del inmueble"]],
  exclusividad: [["vendedor_nombre","Nombre del propietario"],["inmueble_direccion","Dirección del inmueble"]],
  refuerzo_reserva: [["comprador_nombre","Nombre del comprador"],["vendedor_nombre","Nombre del vendedor"]],
  devolucion_reserva: [["comprador_nombre","Nombre del comprador"],["vendedor_nombre","Nombre del vendedor"]],
};
function getCamposFaltantes(op) {
  var lista = CAMPOS_CRITICOS_POR_TIPO[op.tipo] || [];
  return lista.filter(function(f){ return !op[f[0]] || String(op[f[0]]).trim()===""; }).map(function(f){ return f[1]; });
}
// Igual que getCamposFaltantes, pero devuelve también la clave del campo y el
// paso del formulario donde vive, para poder resaltarlo en rojo al editar.
// La regla es la misma en todos los tipos de documento: los *_nombre de
// comprador/locador van en el paso 2, los de vendedor/locatario en el 3, la
// dirección del inmueble en el 4, y el resto (precio, fechas, montos) en el 5.
function getPasoDeCampo(campo){
  if(campo==="comprador_nombre"||campo==="locador_nombre") return 2;
  if(campo==="vendedor_nombre"||campo==="locatario_nombre") return 3;
  if(campo==="inmueble_direccion") return 4;
  return 5;
}
function getCamposFaltantesDetalle(op) {
  var lista = CAMPOS_CRITICOS_POR_TIPO[op.tipo] || [];
  return lista.filter(function(f){ return !op[f[0]] || String(op[f[0]]).trim()===""; })
    .map(function(f){ return { campo:f[0], label:f[1], paso:getPasoDeCampo(f[0]) }; });
}

// Detecta tokens {{...}} mal formados (typos, llaves sin cerrar, caracteres no
// soportados) que NO llegaron a reemplazarse por resolveVars — esos sí quedan
// literalmente en el texto final y hay que avisar antes de imprimir/enviar.
function getTokensSinReemplazar(doc) {
  var textoCompleto = [
    doc.encabezado||"", doc.subtitulo||"",
    (doc.secciones||[]).map(function(s){return (s.items||[]).join(" ");}).join(" "),
    (doc.clausulas||[]).map(function(c){return c.texto||"";}).join(" "),
  ].join(" ");
  var m = textoCompleto.match(/\{\{[^}]{0,40}\}?|\}\}/g);
  // Filtramos falsos positivos: llaves dobles ya bien formadas no deberían llegar
  // acá porque resolveVars las reemplaza antes; lo que sobrevive es justamente
  // lo mal formado.
  return m ? Array.from(new Set(m)).slice(0,6) : [];
}
// Validaciones de fechas (punto 7): coherencia entre fechas cargadas para
// evitar boletos/contratos con fechas ilógicas.
function getProblemasFechas(op) {
  var problemas = [];
  var creado = op.created_at ? new Date(op.created_at) : null;
  if ((op.tipo==="boleto"||op.tipo==="reserva") && op.fecha_posesion && creado) {
    var fp = new Date(op.fecha_posesion+"T00:00:00");
    var creadoSoloFecha = new Date(creado.getFullYear(),creado.getMonth(),creado.getDate());
    if (fp < creadoSoloFecha) problemas.push("La fecha de posesión ("+fmtD(op.fecha_posesion)+") es anterior a la fecha en que se creó la operación. Revisá si corresponde.");
  }
  if (op.tipo==="alquiler" && op.alquiler_inicio && op.alquiler_fin) {
    if (new Date(op.alquiler_fin+"T00:00:00") <= new Date(op.alquiler_inicio+"T00:00:00")) {
      problemas.push("El vencimiento del contrato ("+fmtD(op.alquiler_fin)+") debe ser posterior a la fecha de inicio ("+fmtD(op.alquiler_inicio)+").");
    }
  }
  if (op.tipo==="reserva_alquiler" && op.res_alq_inicio_estimado && creado) {
    var ri = new Date(op.res_alq_inicio_estimado+"T00:00:00");
    var creadoSoloFecha2 = new Date(creado.getFullYear(),creado.getMonth(),creado.getDate());
    if (ri < creadoSoloFecha2) problemas.push("El inicio estimado del contrato ("+fmtD(op.res_alq_inicio_estimado)+") es anterior a la fecha en que se creó la reserva. Revisá si corresponde.");
  }
  return problemas;
}
// Junta todo en una sola lista de advertencias para mostrar antes de exportar.
function getAdvertenciasExportacion(op, doc) {
  var out = [];
  getCamposFaltantes(op).forEach(function(c){ out.push("Falta completar: "+c+"."); });
  getProblemasFechas(op).forEach(function(p){ out.push(p); });
  var tokens = getTokensSinReemplazar(doc);
  if (tokens.length) out.push("Hay texto entre llaves sin resolver en el documento ("+tokens.join(", ")+"). Puede ser un dato mal escrito en una cláusula personalizada.");
  return out;
}

function numeroMontoLegal(val) {
  var n = parseFloat(val);
  if (isNaN(n)) return null;
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: Math.abs(n-Math.round(n)) < 0.000001 ? 0 : 2,
    maximumFractionDigits: 2
  });
}
function codigoMonedaLegal(moneda) {
  return moneda === "USD" ? "USD" : "ARS";
}
function prefijoMonedaLegal(moneda) {
  return moneda === "USD" ? "DÓLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS";
}
// Formato compacto para la interfaz.
function fmt$(val, moneda) {
  if (val === undefined || val === null || String(val).trim() === "") return "—";
  var n = parseFloat(val);
  if (isNaN(n)) return "—";
  return codigoMonedaLegal(moneda) + " " + numeroMontoLegal(n) + ".-";
}

// Convierte el monto a letras, SIN repetir la moneda.
function montoEnLetras(val, moneda) {
  var n = parseFloat(val);
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
  var n = parseFloat(val);
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
function normalizarModoComision(modo){ return modo === "fijo" ? "fijo" : "porcentaje"; }
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
  var mensual=parseFloat(op.alquiler_monto_inicial||0);
  var meses=Math.max(0,parseInt(op.alquiler_plazo_meses,10)||0);
  var dias=Math.max(0,parseInt(op.alquiler_plazo_dias,10)||0);
  if(!mensual || (!meses && !dias)) return 0;
  // Base estimada: canon inicial × plazo. Los días adicionales se prorratean sobre 30 días.
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
  var n=parseFloat(valor);
  var monto=0;
  if(!isNaN(n) && n>=0){ monto=modo==="fijo" ? n : (parseFloat(base)||0)*n/100; }
  return {modo:modo,valor:valor===undefined||valor===null?"":String(valor),moneda:moneda,monto:monto,base:parseFloat(base)||0,baseMoneda:monedaBase||"ARS"};
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
  return (rol||"")+" "+(c.valor||"___")+"%"+(c.monto>0?" = "+fmt$(c.monto,monedaBase):"");
}
function getComisionComponents(op){
  if(!op) return [];
  var tipo=op.tipo, out=[];
  if(tipo==="reserva" || tipo==="boleto") {
    var base=parseFloat(op.precio||0), moneda=op.moneda||"USD";
    var tieneComisionesPartes=!!(op.comision_vendedor||op.comision_comprador||op.comision_vendedor_valor||op.comision_comprador_valor);
    var legacyPctReserva=parseFloat(op.comision_porcentaje||3);
    var defaultV=tipo==="reserva"&&!tieneComisionesPartes?String(legacyPctReserva/2):"4";
    var defaultC=tipo==="reserva"&&!tieneComisionesPartes?String(legacyPctReserva/2):"3";
    out.push(Object.assign({rol:"vendedor",prefix:"comision_vendedor"},getComisionConfig(op,"comision_vendedor",base,moneda,"comision_vendedor",defaultV)));
    out.push(Object.assign({rol:"comprador",prefix:"comision_comprador"},getComisionConfig(op,"comision_comprador",base,moneda,"comision_comprador",defaultC)));
  } else if(tipo==="alquiler") {
    var baseA=totalContratoAlquiler(op), monedaA=op.alquiler_moneda||"ARS";
    out.push(Object.assign({rol:"locador",prefix:"alquiler_comision_locador"},getComisionConfig(op,"alquiler_comision_locador",baseA,monedaA,"alquiler_comision_locador",op.alquiler_comision||"1")));
    out.push(Object.assign({rol:"locatario",prefix:"alquiler_comision_locatario"},getComisionConfig(op,"alquiler_comision_locatario",baseA,monedaA,"alquiler_comision_locatario",op.alquiler_comision||"1")));
  } else if(tipo==="reserva_alquiler") {
    var baseR=parseFloat(op.res_alq_monto_mensual||0), monedaR=op.res_alq_moneda||op.res_alq_monto_mensual_moneda||"ARS";
    out.push(Object.assign({rol:"locador",prefix:"res_alq_comision_locador"},getComisionConfig(op,"res_alq_comision_locador",baseR,monedaR,"res_alq_comision_locador",op.res_alq_comision||"1")));
    out.push(Object.assign({rol:"locatario",prefix:"res_alq_comision_locatario"},getComisionConfig(op,"res_alq_comision_locatario",baseR,monedaR,"res_alq_comision_locatario",op.res_alq_comision||"1")));
  } else if(tipo==="exclusividad") {
    var baseE=parseFloat(op.precio||0), monedaE=op.moneda||"USD";
    out.push(Object.assign({rol:"vendedor",prefix:"comision_vendedor"},getComisionConfig(op,"comision_vendedor",baseE,monedaE,"comision_vendedor",op.comision_porcentaje||"3")));
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
  (doc.secciones || []).forEach(function(s){ lines.push(s.titulo); (s.items||[]).forEach(function(i){ if(i) lines.push("  " + i); }); lines.push(""); });
  if (doc.clausulas && doc.clausulas.length > 0) {
    doc.clausulas.forEach(function(c){ lines.push(c.num + (c.titulo ? ". " + c.titulo.toUpperCase() : ".")); if (c.texto) lines.push("  " + c.texto); lines.push(""); });
  }
  return lines.join("\n");
}

// ── Conversor de números a letras (español, uso legal/monetario) ────────────
function numeroALetras(num) {
  num = Math.floor(Math.abs(Number(num) || 0));
  if (num === 0) return "CERO";
  if (num > 999999999) return String(num);
  var UNI = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  function unidades(n) { return UNI[n] || ""; }
  function decenas(n) {
    if (n < 10) return unidades(n);
    var d = Math.floor(n / 10), u = n % 10;
    if (d === 1) {
      var esp = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
      return esp[u];
    }
    if (d === 2) {
      var vei = ["VEINTE", "VEINTIUNO", "VEINTIDOS", "VEINTITRES", "VEINTICUATRO", "VEINTICINCO", "VEINTISEIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
      return vei[u];
    }
    var dec = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    if (u === 0) return dec[d];
    return dec[d] + " Y " + unidades(u);
  }
  function centenas(n) {
    if (n === 100) return "CIEN";
    var c = Math.floor(n / 100), r = n % 100;
    var CEN = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
    var out = "";
    if (c > 0) out += CEN[c];
    if (r > 0) out += (out ? " " : "") + decenas(r);
    return out;
  }
  // (nota: apocope de UNO->UN antes de MIL/MILLONES se aplica en miles()/millones())
  function apocope(s) { return s.replace(/UNO$/, "UN"); }
  function miles(n) {
    var c = Math.floor(n / 1000), r = n % 1000;
    var out = "";
    if (c > 0) out += (c === 1 ? "MIL" : apocope(centenas(c)) + " MIL");
    if (r > 0) out += (out ? " " : "") + centenas(r);
    return out;
  }
  function millones(n) {
    var c = Math.floor(n / 1000000), r = n % 1000000;
    var out = "";
    if (c > 0) out += (c === 1 ? "UN MILLON" : apocope(miles(c)) + " MILLONES");
    if (r > 0) out += (out ? " " : "") + miles(r);
    return out;
  }
  return millones(num).trim();
}
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
function addMonths(ds, m) {
  if (!ds) return "";
  const d = new Date(ds); d.setMonth(d.getMonth()+parseInt(m||0));
  return d.toISOString().slice(0,10);
}
function addMonthsDias(ds, m, dias) {
  if (!ds) return "";
  const d = new Date(ds);
  d.setMonth(d.getMonth()+(parseInt(m,10)||0));
  d.setDate(d.getDate()+(parseInt(dias,10)||0));
  return d.toISOString().slice(0,10);
}
function plazoAlquilerTexto(meses, dias) {
  var m = parseInt(meses,10)||0, d = parseInt(dias,10)||0;
  var partes=[];
  if (m>0) partes.push(m+(m===1?" mes":" meses"));
  if (d>0) partes.push(d+(d===1?" día":" días"));
  return partes.length ? partes.join(" y ") : "0 meses";
}
function genId() { return Math.random().toString(36).slice(2,10); }

// ── AUTOGUARDADO (localStorage) ───────────────────────────────────────────────
// Persiste el estado principal de la app para que una recarga accidental de
// la página (F5, cierre del navegador, refresh del WebView) no borre datos
// cargados. Todo queda en el dispositivo/navegador del usuario (no hay backend).
var LS_PREFIX = "docworks:v1:";
function lsGet(key, fallback) {
  try {
    var raw = window.localStorage.getItem(LS_PREFIX + key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (e) { return fallback; }
}
function lsSet(key, value) {
  try { window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}
function lsRemove(key) {
  try { window.localStorage.removeItem(LS_PREFIX + key); } catch (e) {}
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
  return (faltantes&&faltantes.indexOf(campo)>=0) ? {style:{borderColor:"var(--red)",background:"rgba(239,68,68,0.05)"},error:"Dato obligatorio para generar el documento"} : {};
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
      rol:norm(p.rol), nombre:norm(p.nombre), dni:norm(p.dni), domicilio:norm(p.domicilio)
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
  var tieneInmob = firmas.some(function(f){ return f && (f.usarPerfil || String(f.rol||"").toUpperCase().indexOf("INMOBILIARIA")>=0); });
  if (!tieneInmob) firmas.push({rol:"INMOBILIARIA", nombre:"", dni:"", usarPerfil:true});

  var garanteNombre = op && op.alquiler_garantia_titular;
  var garanteDni = op && op.alquiler_garantia_dni;
  var tieneGarante = firmas.some(function(f){ return String(f&&f.rol||"").toUpperCase().indexOf("GARANTE")>=0; });
  if (garanteNombre && !tieneGarante) firmas.push({rol:"GARANTE", nombre:garanteNombre, dni:garanteDni||""});

  // En la Reserva, el Propietario firma específicamente en PRESTA CONFORMIDAD;
  // no se duplica esa firma en el bloque principal.
  doc.firmas = firmas;
  return doc;
}

function finalizeDoc(doc, op, clausulasLib) {
  var n = (doc.secciones || []).length;
  var extra = [];
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
      return c.obligatoria || seleccionadasIds.indexOf(c.id) !== -1;
    })
    .forEach(function(c) {
      n++;
      extra.push({ num: n, titulo: resolveVars(c.titulo, op), texto: resolveVars(c.contenido, op), obligatoria: !!c.obligatoria });
    });
  if (op.clausulas_custom && op.clausulas_custom.trim()) {
    if (op.clausulas_custom_titulo && op.clausulas_custom_titulo.trim()) {
      n++;
      extra.push({ num: n, titulo: resolveVars(op.clausulas_custom_titulo.trim(), op), texto: resolveVars(op.clausulas_custom.trim(), op) });
    } else {
      op.clausulas_custom.split("\n").filter(function(l){ return l.trim(); }).forEach(function(l) {
        n++;
        extra.push({ num: n, titulo: null, texto: resolveVars(l.trim(), op) });
      });
    }
  }
  doc.clausulas = extra;
  delete doc.customClausulas;
  doc = asegurarFirmasDocumento(doc, op, null);
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
// Nota: el bloque de firmas se muestra con una sola línea por rol (con los
// nombres unidos). Si en algún momento hace falta una línea de firma
// independiente por cada co-titular (para que cada uno firme físicamente
// por separado), es un cambio más profundo en los 8 generadores de
// documento — avisame y lo encaramos aparte.
function personasDe(op, prefix) {
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
function opParaDocumento(op) {
  // El documento siempre trabaja sobre una copia sanitizada. La operación
  // original conserva teléfono/email para la ficha interna y el seguimiento.
  var out=Object.assign({},op);
  var prefixes=["comprador","vendedor","locador","locatario"];
  prefixes.forEach(function(prefix){
    var personas=personasDe(op, prefix);
    if (personas.length>1) {
      out[prefix+"_nombre"] = unirNombres(personas.map(function(p){return p.nombre;}));
      out[prefix+"_dni"] = personas.map(function(p){return p.dni||"___";}).join(" y ");
      var domicilios = personas.map(function(p){return p.domicilio;}).filter(Boolean);
      out[prefix+"_domicilio"] = domicilios.length ? Array.from(new Set(domicilios)).join(" / ") : (op[prefix+"_domicilio"]||"");
    }
    // Nunca se pasan datos de contacto internos al objeto que consume PDF/Word.
    delete out[prefix+"_email"];
    delete out[prefix+"_telefono"];
  });
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
  ["vendedor_nombre","Nombre del vendedor/propietario"],["vendedor_dni","DNI/CUIT del vendedor"],["vendedor_domicilio","Domicilio del vendedor"],
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
    inmueble_direccion:op.inmueble_direccion||"___", inmueble_partido:op.inmueble_partido||"___", inmueble_provincia:op.inmueble_provincia||"Buenos Aires",
    nomenclatura_catastral: op.nomenclatura_catastral ? (", Nomenclatura Catastral "+op.nomenclatura_catastral) : "",
    precio_letras: op.precio ? fmt$L(op.precio, op.moneda) : "___",
    anticipo_letras: op.anticipo ? fmt$L(op.anticipo, op.moneda) : "___",
    saldo_letras: op.saldo ? fmt$L(op.saldo, op.moneda) : "___",
    alquiler_monto_letras: op.alquiler_monto_inicial ? fmt$L(op.alquiler_monto_inicial, op.alquiler_moneda) : "___",
    fecha_operacion_larga: fmtDLarga((esAlq ? op.alquiler_inicio : op.fecha_posesion) || new Date().toISOString().slice(0,10)),
    inmobiliaria_nombre: (perfil&&perfil.nombre)||"",
    inmobiliaria_matricula: (perfil&&perfil.matricula)||"",
  };
  return tpl.replace(/\{\{(\w+)\}\}/g, function(m,k){ if(TOKENS_CONTACTO_PARTES_PRIVADOS[k]) return ""; return (k in map) ? map[k] : m; });
}
// Preámbulos por defecto (con tokens). Se usan si no hay personalización
// y se pueden editar por tipo de documento en Plantillas → Introducción.
var DEFAULT_ENCABEZADOS = {
  reserva:
    "Recibimos de {{comprador_nombre}}, DNI/CUIT {{comprador_dni}}, con domicilio a estos efectos en {{comprador_domicilio}}, en adelante el Oferente, la suma de {{anticipo_letras}} en concepto de \"Reserva Ad Referéndum\" de la aceptación del propietario {{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, en adelante el Propietario, para la compra del inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral}}, en adelante el Inmueble.\n\nEl presente se sujetará en un todo a los siguientes términos y condiciones:",
  boleto:
    "Entre {{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, con domicilio en {{vendedor_domicilio}}, en adelante el VENDEDOR, y {{comprador_nombre}}, DNI/CUIT {{comprador_dni}}, con domicilio en {{comprador_domicilio}}, en adelante el COMPRADOR, se celebra el presente boleto de compraventa respecto del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral}}, por el precio total de {{precio_letras}}.",
  alquiler:
    "Entre {{locador_nombre}}, DNI/CUIT {{locador_dni}}, con domicilio en {{locador_domicilio}}, en adelante el LOCADOR, y {{locatario_nombre}}, DNI/CUIT {{locatario_dni}}, con domicilio en {{locatario_domicilio}}, en adelante el LOCATARIO, se celebra el presente contrato de locación del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral}}.",
  reserva_alquiler:
    "Recibimos de {{locatario_nombre}}, DNI/CUIT {{locatario_dni}}, con domicilio en {{locatario_domicilio}}, en adelante el LOCATARIO / OFERENTE, la suma de {{anticipo_letras}} en concepto de Reserva de Locación sujeta a la conformidad de {{locador_nombre}}, DNI/CUIT {{locador_dni}}, en adelante el LOCADOR, respecto del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral}}.",
  comodato:
    "Entre {{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, en adelante el COMODANTE, y {{comprador_nombre}}, DNI/CUIT {{comprador_dni}}, en adelante el COMODATARIO, se celebra el presente contrato de comodato respecto del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral}}.",
  exclusividad:
    "El/la propietario/a {{vendedor_nombre}}, DNI/CUIT {{vendedor_dni}}, otorga a {{inmobiliaria_nombre}}{{inmobiliaria_matricula}} autorización de comercialización exclusiva del inmueble sito en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral}}.",
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
    vendedor_nombre: tipo==="comodato" ? "Nombre comodante" : "Nombre propietario/vendedor",
    vendedor_dni: tipo==="comodato" ? "DNI comodante" : "DNI propietario/vendedor",
    vendedor_domicilio: "Domicilio propietario/vendedor",
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
  if (perfil && perfil.mostrar_introduccion === false) {
    return Object.assign({}, doc, { encabezado: "" });
  }
  var tpl = getEncabezadoTemplate(tipo, perfil);
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
//   sinTitulo           true = la cláusula no lleva rótulo de texto, solo el
//                        número. En la configuración actual todas las cláusulas base
//                        de Reserva llevan título visible para facilitar su edición.
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
var DEFAULT_BLOQUES_RESERVA = [
  { id:"reserva.precio", titulo:"PRECIO", sinTitulo:false,
    contenido:"El Oferente ofrece la suma de {{precio_letras}} para la compra del Inmueble, en adelante el Precio.-",
    variables:["moneda_txt","precio_letras"], condicion:null, orden:1, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.valor_reserva", titulo:"VALOR DE LA RESERVA", sinTitulo:false,
    contenido:"La suma entregada en este acto en concepto de Reserva Ad Referéndum es de {{anticipo_letras}}.-",
    variables:["moneda_txt","anticipo_letras"], condicion:null, orden:2, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.forma_pago", titulo:"FORMA DE PAGO", sinTitulo:false,
    contenido:"El Oferente ofrece abonar el saldo de {{saldo_letras}} al momento de firmar la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-",
    variables:["saldo_letras"], condicion:null, orden:3, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.honorarios", titulo:"HONORARIOS", sinTitulo:false,
    contenido:"{{comision_reserva_texto}}",
    variables:["comision_reserva_texto"], condicion:null, orden:4, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.vencimiento_aceptacion", titulo:"VENCIMIENTO DE ACEPTACIÓN DE LA RESERVA", sinTitulo:false,
    contenido:"El vencimiento de la aceptación de la presente Reserva caducará irrevocablemente {{reserva_aceptacion_plazo_texto}}, salvo prórroga expresa acordada por escrito entre las partes.-",
    variables:["reserva_aceptacion_plazo_texto","reserva_aceptacion_vencimiento"], condicion:null, orden:5, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.vencimiento_reserva", titulo:"VENCIMIENTO DE LA RESERVA", sinTitulo:false,
    contenido:"La Reserva, y su conversión a Seña una vez conformada la misma, estará plenamente vigente hasta el {{fecha_posesion}}, fecha en que deberá firmarse la Escritura Traslativa de Dominio.-",
    variables:["fecha_posesion"], condicion:null, orden:6, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.incumplimiento", titulo:"SEÑA Y CONSECUENCIAS DEL INCUMPLIMIENTO", sinTitulo:false,
    contenido:"Conformada esta Reserva por el Propietario, la presente tendrá carácter de SEÑA con los efectos y alcances del art. 1059 del Código Civil y Comercial de la Nación. Si el Oferente no se presentara a la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, perderá automáticamente y de pleno derecho la suma entregada en este acto, sin necesidad de que se practique interpelación judicial o extrajudicial alguna, quedando constituido en mora por el mero vencimiento del plazo; mientras que si no se presentara el Propietario a la firma en el plazo establecido, quedará obligado a reintegrar al Oferente, dentro de las 48 horas de producido el incumplimiento, la suma recibida como Reserva, más otro tanto igual en concepto de única y total indemnización.-\n\nEn caso de que el incumplimiento aludido en el párrafo anterior se deba a Caso Fortuito o Fuerza Mayor según arts. 955 y 1730 del Código Civil y Comercial de la Nación, ajeno a la voluntad de las partes, los plazos se suspenden automáticamente, sin consecuencias para éstas, hasta tanto lo determine el Escribano Interviniente.-",
    variables:[], condicion:null, orden:7, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.escribano", titulo:"ESCRIBANO INTERVINIENTE", sinTitulo:false,
    contenido:"{{escribania_clausula}} debiendo ser notificado formalmente al Propietario con todos los datos de contacto correspondientes dentro de la semana de haber sido conformada la presente Reserva Ad Referéndum. La notificación del Escribano Interviniente respecto de la fecha y hora para la firma de la Escritura Traslativa de Dominio tendrá carácter constitutivo.-",
    variables:["escribania_clausula"], condicion:null, orden:8, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.honorarios_impuestos", titulo:"HONORARIOS, IMPUESTOS, TASAS, SELLOS Y OTROS", sinTitulo:false,
    contenido:"Todos los honorarios, impuestos, tasas, sellos y cualquier otro tributo exigible a los efectos de la firma e inscripción de la Escritura Traslativa de Dominio en el Registro de la Propiedad Inmueble y/o el Boleto de Compraventa correspondiente serán afrontados según usos y costumbres.-",
    variables:[], condicion:null, orden:9, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.moneda_condicion_esencial", titulo:"MONEDA DE PAGO Y CONDICIÓN ESENCIAL", sinTitulo:false,
    contenido:"Queda expresamente establecido que la moneda de pago ofrecida y acordada en los puntos 1, 2 y 3 precedentes constituye condición y elemento esencial de la presente. El Oferente declara poseer los Dólares Billete Estadounidenses y se compromete a entregarlos por el precio estipulado en caso de aceptación, así como para cancelar los honorarios convenidos, renunciando a invocar imprevisión, caso fortuito, fuerza mayor, enriquecimiento sin causa o cualquier otra defensa relacionada a una eventual imposibilidad de pago en la moneda pactada o a variaciones en su cotización, resultando condición esencial que el pago sea efectuado única y exclusivamente en Dólares Billete Estadounidenses.-",
    variables:[], condicion:"moneda_usd", orden:10, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.devolucion_no_conforme", titulo:"DEVOLUCIÓN DE LA RESERVA NO CONFORMADA", sinTitulo:false,
    contenido:"Si el Propietario del Inmueble no conformase esta Reserva, la suma entregada en este acto por el Oferente le será devuelta sin indemnización de ninguna naturaleza, quedando la presente Reserva sin efecto ni valor legal alguno. En este caso, el Oferente deberá notificar con un mínimo de 48 horas su intención de retirar los fondos en guarda, acordando con la inmobiliaria interviniente la logística correspondiente.-",
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
    contenido:"El Oferente podrá ofrecer, de así convenirlo con el Propietario, un Refuerzo de la presente Reserva dentro de los 7 días corridos a partir de su conformidad, cuyo monto y demás condiciones se consignarán en el instrumento de Refuerzo de Reserva correspondiente.-",
    variables:[], condicion:null, orden:15, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
];
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
    var tituloFinal = b.sinTitulo ? (n+".") : (n+". "+b.titulo);
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
    subtitulo: "Oferta de compra sujeta a la conformidad del propietario",
    ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
    fecha: fmtDLarga(op.fecha_posesion||new Date().toISOString().slice(0,10)),
    encabezado: "Recibimos de "+(op.comprador_nombre||"___________")+", DNI/CUIT "+(op.comprador_dni||"___________")+", con domicilio a estos efectos en "+(op.comprador_domicilio||"___________")+", en adelante el Oferente, la suma de "+fmt$L(op.anticipo,op.moneda)+" en concepto de \"Reserva Ad Referéndum\" de la aceptación del propietario "+(op.vendedor_nombre||"___________")+", DNI/CUIT "+(op.vendedor_dni||"___________")+", en adelante el Propietario, para la compra del inmueble ubicado en "+(op.inmueble_direccion||"___________")+", "+(op.inmueble_partido||"___________")+", Provincia de "+(op.inmueble_provincia||"___________")+(op.nomenclatura_catastral?", Nomenclatura Catastral "+op.nomenclatura_catastral:"")+", en adelante el Inmueble.\n\nEl presente se sujetará en un todo a los siguientes términos y condiciones:",
    ocultarPartesEnCuerpo: true,
    partes:[
      {rol:"PROPIETARIO / VENDEDOR", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
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
function normalizarBodyBlock(b, idx) {
  var x = Object.assign({id:"",titulo:"",contenido:"",orden:idx+1,activo:true,sinTitulo:false,condicion:null}, b || {});
  x.id = String(x.id || ("bloque_"+(idx+1)));
  x.titulo = String(x.titulo || "");
  x.contenido = String(x.contenido || "");
  x.orden = Number(x.orden)||idx+1;
  x.activo = x.activo !== false;
  x.sinTitulo = !!x.sinTitulo;
  return x;
}

var BODY_TEMPLATE_PRESETS = {
  reserva: (typeof DEFAULT_BLOQUES_RESERVA!=="undefined" ? DEFAULT_BLOQUES_RESERVA : []).map(function(b){ return Object.assign({}, b); }),
  boleto: [
    {id:"boleto.objeto",titulo:"OBJETO",contenido:"El VENDEDOR {{vendedor_nombre}} vende, cede y transfiere al COMPRADOR {{comprador_nombre}}, quien compra y acepta, el inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}{{nomenclatura_catastral}}, en adelante el Inmueble.-"},
    {id:"boleto.precio",titulo:"PRECIO",contenido:"El precio total y definitivo de la presente compraventa se fija en {{precio_letras}}, que las partes declaran justo y conveniente a sus intereses.-"},
    {id:"boleto.forma_pago",titulo:"FORMA DE PAGO",contenido:"El COMPRADOR ha entregado en este acto, en concepto de seña y a cuenta de precio, la suma de {{anticipo_letras}}, obligándose a abonar el saldo de {{saldo_letras}} al momento de la firma de la Escritura Traslativa de Dominio.-"},
    {id:"boleto.posesion",titulo:"POSESIÓN Y ESCRITURACIÓN",contenido:"La posesión del inmueble se otorgará el {{fecha_posesion}}, fecha en la que asimismo deberá suscribirse la Escritura Traslativa de Dominio{{escribania_clausula}}.-"},
    {id:"boleto.honorarios_vendedor",titulo:"HONORARIOS DEL VENDEDOR",contenido:"{{comision_vendedor_texto}}"},
    {id:"boleto.honorarios_comprador",titulo:"HONORARIOS DEL COMPRADOR",contenido:"{{comision_comprador_texto}}"},
    {id:"boleto.incumplimiento",titulo:"INCUMPLIMIENTO",contenido:"Si el COMPRADOR no se presentara a la firma de la Escritura Traslativa de Dominio en la fecha convenida, perderá en concepto de multa la suma entregada como seña. Si no se presentara el VENDEDOR, deberá restituir al COMPRADOR dicha suma dentro de las 48 horas, más otro tanto igual en concepto de única y total indemnización.-"},
    {id:"boleto.libre",titulo:"INMUEBLE LIBRE DE OCUPANTES Y GRAVÁMENES",contenido:"El VENDEDOR entregará el inmueble libre de ocupantes, deudas y gravámenes de cualquier naturaleza a la fecha de posesión pactada, siendo a su cargo los impuestos y expensas devengados hasta dicha fecha, y a cargo del COMPRADOR a partir de entonces.-"},
  ],
  reserva_alquiler: [
    {id:"reserva_alquiler.objeto",titulo:"OBJETO",contenido:"El LOCATARIO / OFERENTE entrega en este acto, en concepto de Reserva de Locación sujeta a la conformidad del LOCADOR, la suma de {{moneda_txt}} {{res_alq_monto_reserva}}, para la locación del inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}.-"},
    {id:"reserva_alquiler.condiciones",titulo:"CONDICIONES ESTIMADAS DE LOCACIÓN",contenido:"Valor del alquiler mensual: {{reserva_alquiler_canon}}. Plazo estimado: {{res_alq_plazo_cantidad}} {{res_alq_plazo_unidad}}. Inicio estimado: {{res_alq_inicio_estimado}}.-"},
    {id:"reserva_alquiler.aceptacion",titulo:"VIGENCIA Y ACEPTACIÓN",contenido:"El LOCADOR deberá conformar la presente dentro de los {{res_alq_aceptacion_dias}} días. La Reserva mantendrá su vigencia por {{res_alq_vigencia_dias}} días corridos contados desde su conformación, plazo dentro del cual deberá suscribirse el correspondiente Contrato de Locación.-"},
    {id:"reserva_alquiler.honorarios_locador",titulo:"HONORARIOS DEL LOCADOR",contenido:"{{reserva_alquiler_comision_locador_texto}}"},
    {id:"reserva_alquiler.honorarios_locatario",titulo:"HONORARIOS DEL LOCATARIO",contenido:"{{reserva_alquiler_comision_locatario_texto}}"},
  ],
  alquiler: [
    {id:"alquiler.objeto",titulo:"OBJETO",contenido:"El LOCADOR da en locación al LOCATARIO el {{inmueble_tipo}} ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}, con destino a {{alquiler_destino_texto}}{{alquiler_amoblado_texto}}. El LOCATARIO declara recibir el inmueble en perfecto estado de conservación y limpieza, prestando plena conformidad con sus instalaciones.-"},
    {id:"alquiler.plazo",titulo:"PLAZO",contenido:"El presente contrato tendrá una duración de {{alquiler_plazo_texto}}, con inicio el {{alquiler_inicio}} y vencimiento el {{alquiler_fin_formateado}}. Al finalizar el plazo, el LOCATARIO se obliga a restituir el inmueble totalmente desocupado y en el mismo estado en que lo recibió, salvo el deterioro propio del uso normal y el transcurso del tiempo.-"},
    {id:"alquiler.canon",titulo:"CANON LOCATIVO Y ACTUALIZACIÓN",contenido:"{{alquiler_canon_clause}}"},
    {id:"alquiler.gastos",titulo:"GASTOS Y MANTENIMIENTO",contenido:"Quedan a cargo del LOCATARIO los gastos y servicios que correspondan conforme lo pactado entre Las Partes. El LOCATARIO no podrá subalquilar, ceder ni transferir el uso del inmueble, ni realizar obras o mejoras, sin el consentimiento previo y por escrito del LOCADOR.-"},
    {id:"alquiler.deposito",titulo:"DEPÓSITO EN GARANTÍA",contenido:"El LOCATARIO entrega en depósito {{alquiler_deposito_desc}}, el cual será restituido según lo dispuesto por la legislación aplicable. Este depósito no devengará intereses y no podrá ser imputado al pago de alquileres.-"},
    {id:"alquiler.mora",titulo:"MORA Y PENALIDADES",contenido:"El incumplimiento de cualquier obligación a cargo del LOCATARIO, incluida la falta de pago de un (1) mes de alquiler, lo constituirá en mora en forma automática, sin necesidad de interpelación judicial o extrajudicial alguna.-\n\nLa mora en el pago del canon locativo devengará un interés punitorio del {{alquiler_interes_punitorio}}% mensual hasta su efectivo pago.-\n\nSi el LOCATARIO no restituyera el inmueble al vencimiento del contrato, deberá abonar en concepto de cláusula penal una suma equivalente a {{alquiler_penalidad_meses}} veces el canon locativo mensual vigente, por cada mes o fracción de demora en la restitución.-"},
    {id:"alquiler.seguro",titulo:"SEGURO",contenido:"El LOCATARIO se obliga a contratar, dentro de los {{alquiler_seguro_dias}} días corridos de la firma del presente, un seguro de Responsabilidad Civil e Incendio sobre el inmueble, designando como beneficiario al LOCADOR, debiendo acreditar su vigencia durante toda la duración del contrato.-"},
    {id:"alquiler.rescision",titulo:"RESOLUCIÓN ANTICIPADA",contenido:"El LOCATARIO podrá rescindir el presente contrato en forma anticipada conforme lo establecido por la legislación vigente, debiendo notificar en forma fehaciente al LOCADOR con {{alquiler_aviso_meses}} mes/es de antelación y abonando, en su caso, la indemnización legal correspondiente.-"},
    {id:"alquiler.garantia",titulo:"GARANTÍA",contenido:"{{alquiler_garantia_detalle}}"},
    {id:"alquiler.honorarios_locador",titulo:"HONORARIOS DEL LOCADOR",contenido:"{{alquiler_comision_locador_texto}}"},
    {id:"alquiler.honorarios_locatario",titulo:"HONORARIOS DEL LOCATARIO",contenido:"{{alquiler_comision_locatario_texto}}"},
  ],
  comodato: [
    {id:"comodato.objeto",titulo:"OBJETO",contenido:"El COMODANTE cede gratuitamente al COMODATARIO el uso del inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}, quien lo recibe de plena conformidad.-"},
    {id:"comodato.plazo",titulo:"PLAZO",contenido:"El presente comodato tendrá una duración de {{comodato_plazo}}, vencido el cual el COMODATARIO deberá restituir el bien en las mismas condiciones en que lo recibió.-"},
    {id:"comodato.uso",titulo:"USO Y DESTINO",contenido:"Destino: {{comodato_uso}}. El COMODATARIO no podrá ceder ni subarrendar el bien sin autorización previa y por escrito del COMODANTE.-"},
    {id:"comodato.obligaciones",titulo:"OBLIGACIONES DEL COMODATARIO",contenido:"El COMODATARIO se obliga a conservar el bien en buen estado, abonar los gastos ordinarios de uso y servicios, no introducir modificaciones sin autorización del COMODANTE, y restituir el inmueble a la finalización del plazo pactado.-"},
    {id:"comodato.incumplimiento",titulo:"INCUMPLIMIENTO",contenido:"El incumplimiento de cualquiera de las obligaciones asumidas dará derecho al COMODANTE a exigir la restitución inmediata del bien por la vía legal que corresponda.-"},
  ],
  exclusividad: [
    {id:"exclusividad.autorizacion",titulo:"AUTORIZACIÓN",contenido:"El PROPIETARIO autoriza a la INMOBILIARIA a ofrecer, promocionar y gestionar la venta del inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}, Provincia de {{inmueble_provincia}}.-"},
    {id:"exclusividad.precio",titulo:"PRECIO",contenido:"Precio de venta autorizado: {{precio_letras}}. El PROPIETARIO acepta recibir ofertas a partir de dicho valor.-"},
    {id:"exclusividad.modalidad",titulo:"MODALIDAD",contenido:"La presente autorización se otorga bajo la modalidad y por el término pactados en la operación: {{exclusividad_tipo}} — {{exclusividad_vigencia}}.-"},
    {id:"exclusividad.honorarios",titulo:"HONORARIOS",contenido:"{{comision_vendedor_texto}}"},
  ],
  refuerzo_reserva: [
    {id:"refuerzo.antecedentes",titulo:"ANTECEDENTES",contenido:"Las partes han suscripto con anterioridad una Reserva de Compra para el inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}.-"},
    {id:"refuerzo.objeto",titulo:"OBJETO DEL REFUERZO",contenido:"En este acto el COMPRADOR entrega, en calidad de REFUERZO de la Reserva oportunamente suscripta, la suma de {{precio_letras}}, en concepto de ampliación del monto originalmente entregado.-"},
    {id:"refuerzo.condiciones",titulo:"CONDICIONES",contenido:"El presente Refuerzo integra y complementa la Reserva original, manteniendo plena vigencia todas sus condiciones, plazos y cláusulas oportunamente pactadas.-"},
    {id:"refuerzo.incumplimiento",titulo:"INCUMPLIMIENTO",contenido:"En caso de incumplimiento del COMPRADOR, perderá el monto total entregado. En caso de incumplimiento del VENDEDOR, deberá restituir el doble de dicho monto dentro de las 48 horas.-"},
  ],
  devolucion_reserva: [
    {id:"devolucion.antecedentes",titulo:"ANTECEDENTES",contenido:"Las partes habían suscripto una Reserva de Compra para el inmueble ubicado en {{inmueble_direccion}}, {{inmueble_partido}}.-"},
    {id:"devolucion.motivo",titulo:"MOTIVO DE LA DEVOLUCIÓN",contenido:"{{devolucion_motivo}}"},
    {id:"devolucion.devolucion",titulo:"DEVOLUCIÓN",contenido:"El VENDEDOR / PROPIETARIO devuelve en este acto al COMPRADOR / OFERENTE la suma de {{precio_letras}}, recibiendo el COMPRADOR plena conformidad respecto de la devolución.-"},
    {id:"devolucion.finiquito",titulo:"FINIQUITO",contenido:"Con la presente devolución, ambas partes se otorgan mutuo y recíproco finiquito, sin que ninguna de ellas tenga derecho a reclamo posterior alguno en relación a la operación descripta.-"},
  ],
};

function getDefaultBodyBlocks(tipo) {
  var arr = BODY_TEMPLATE_PRESETS[tipo] || [];
  return arr.map(function(b,i){ return normalizarBodyBlock(Object.assign({},b,{orden:i+1}),i); });
}
function getBodyBlocksConfig(perfil,tipo) {
  var cfg = perfil && perfil.plantillas && perfil.plantillas[tipo];
  var arr = cfg && Array.isArray(cfg.body_blocks) ? cfg.body_blocks : null;
  return arr && arr.length ? arr.map(normalizarBodyBlock) : getDefaultBodyBlocks(tipo);
}
function getBodyBlocksForDocument(perfil,tipo,bloquesReserva) {
  if (tipo === "reserva" && Array.isArray(bloquesReserva) && bloquesReserva.length) return bloquesReserva;
  var cfg = perfil && perfil.plantillas && perfil.plantillas[tipo];
  var arr = cfg && Array.isArray(cfg.body_blocks) ? cfg.body_blocks : null;
  return arr && arr.length ? arr : null;
}
function evalBodyCondition(condicion,op){
  if(!condicion) return true;
  if(condicion === "moneda_usd") return (op&&op.moneda)==="USD";
  return true;
}
function buildDocSectionsFromEditableBody(op, clausulasLib, tipo, bloquesPlantilla) {
  var doc = buildDocSectionsStandard(op, clausulasLib, tipo);
  if(!Array.isArray(bloquesPlantilla) || !bloquesPlantilla.length) return doc;
  var sorted=bloquesPlantilla.map(normalizarBodyBlock).filter(function(b){return b.activo!==false&&evalBodyCondition(b.condicion,op);}).sort(function(a,b){return a.orden-b.orden;});
  var extras={};
  sorted.forEach(function(b,i){extras[tokenNumeroBloque(b.id)]=String(i+1);});
  var secciones=sorted.map(function(b,i){
    var txt=String(b.contenido||"");
    var items=txt.split(/\n\n/).map(function(p){return resolveVars(p,op,Object.assign({},extras,derivedTokensGenerales(op)));}).filter(function(p){return String(p||"").trim()!=="";});
    return {titulo:b.sinTitulo?(i+1)+".":(i+1)+". "+String(b.titulo||"Bloque"),items:items,_bloqueId:b.id};
  });
  var out=Object.assign({},doc,{secciones:secciones});
  if(out.conformidad&&Array.isArray(out.conformidad.items)){
    out.conformidad.items=out.conformidad.items.map(function(t){return resolveVars(t,op,extras);});
  }
  return out;
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
      {titulo:"3. FORMA DE PAGO", items:["El Oferente ofrece abonar el saldo de "+fmt$L(op.saldo,op.moneda)+" al momento de firmar la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-"]},
      // 4. Honorarios
      {titulo:"4. HONORARIOS", items:[(function(){var c=getComisionConfig(op,"comision_comprador",parseFloat(op.precio||0),op.moneda||"USD","comision_comprador",op.comision_porcentaje||"3");return c.modo==="fijo"?"El Oferente abonará la suma de "+fmt$L(c.valor,c.moneda)+" en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente.-":"El Oferente abonará el "+(c.valor||"___")+"% del Precio en el momento de la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente.-";})()]},
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
      {titulo:"6. VENCIMIENTO DE LA RESERVA", items:["La Reserva, y su conversión a Seña una vez conformada la misma, estará plenamente vigente hasta el "+fmtD(op.fecha_posesion)+", fecha en que deberá firmarse la Escritura Traslativa de Dominio.-"]},
      // 7. Seña y consecuencias del incumplimiento + Caso Fortuito (párrafo aparte)
      {titulo:"7. SEÑA Y CONSECUENCIAS DEL INCUMPLIMIENTO", items:[
        "Conformada esta Reserva por el Propietario, la presente tendrá carácter de SEÑA con los efectos y alcances del art. 1059 del Código Civil y Comercial de la Nación. Si el Oferente no se presentara a la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, perderá automáticamente y de pleno derecho la suma entregada en este acto, sin necesidad de que se practique interpelación judicial o extrajudicial alguna, quedando constituido en mora por el mero vencimiento del plazo; mientras que si no se presentara el Propietario a la firma en el plazo establecido, quedará obligado a reintegrar al Oferente, dentro de las 48 horas de producido el incumplimiento, la suma recibida como Reserva, más otro tanto igual en concepto de única y total indemnización.-",
        "En caso de que el incumplimiento aludido en el párrafo anterior se deba a Caso Fortuito o Fuerza Mayor según arts. 955 y 1730 del Código Civil y Comercial de la Nación, ajeno a la voluntad de las partes, los plazos se suspenden automáticamente, sin consecuencias para éstas, hasta tanto lo determine el Escribano Interviniente.-",
      ]},
      // 8. Escribano Interviniente
      {titulo:"8. ESCRIBANO INTERVINIENTE", items:[(op.escribania?"Escribanía designada: "+op.escribania+".":"El Escribano será designado por el Oferente,")+" debiendo ser notificado formalmente al Propietario con todos los datos de contacto correspondientes dentro de la semana de haber sido conformada la presente Reserva Ad Referéndum. La notificación del Escribano Interviniente respecto de la fecha y hora para la firma de la Escritura Traslativa de Dominio tendrá carácter constitutivo.-"]},
      // 9. Honorarios, impuestos, tasas, sellos y otros
      {titulo:"9. HONORARIOS, IMPUESTOS, TASAS, SELLOS Y OTROS", items:["Todos los honorarios, impuestos, tasas, sellos y cualquier otro tributo exigible a los efectos de la firma e inscripción de la Escritura Traslativa de Dominio en el Registro de la Propiedad Inmueble y/o el Boleto de Compraventa correspondiente serán afrontados según usos y costumbres.-"]},
      // 10. Moneda de pago como condición esencial (solo si es en USD)
      esUSD ? {titulo:"10. MONEDA DE PAGO Y CONDICIÓN ESENCIAL", items:["Queda expresamente establecido que la moneda de pago ofrecida y acordada en los puntos 1, 2 y 3 precedentes constituye condición y elemento esencial de la presente. El Oferente declara poseer los Dólares Billete Estadounidenses y se compromete a entregarlos por el precio estipulado en caso de aceptación, así como para cancelar los honorarios convenidos, renunciando a invocar imprevisión, caso fortuito, fuerza mayor, enriquecimiento sin causa o cualquier otra defensa relacionada a una eventual imposibilidad de pago en la moneda pactada o a variaciones en su cotización, resultando condición esencial que el pago sea efectuado única y exclusivamente en Dólares Billete Estadounidenses.-"]} : null,
      // 11. Devolución si no conforma el Propietario
      {titulo:esUSD?"11. DEVOLUCIÓN DE LA RESERVA NO CONFORMADA":"10. DEVOLUCIÓN DE LA RESERVA NO CONFORMADA", items:["Si el Propietario del Inmueble no conformase esta Reserva, la suma entregada en este acto por el Oferente le será devuelta sin indemnización de ninguna naturaleza, quedando la presente Reserva sin efecto ni valor legal alguno. En este caso, el Oferente deberá notificar con un mínimo de 48 horas su intención de retirar los fondos en guarda, acordando con la inmobiliaria interviniente la logística correspondiente.-"]},
      // 12. Notificación Válida
      {titulo:esUSD?"12. NOTIFICACIÓN VÁLIDA":"11. NOTIFICACIÓN VÁLIDA", items:["Significa toda notificación realizada por correo electrónico o carta documento a los domicilios constituidos por Las Partes en la presente, con su correspondiente constancia de recibo. Las notificaciones por correo electrónico tendrán plena validez y vigencia, constituyendo Las Partes los domicilios electrónicos que correspondan para los efectos de la presente Reserva.-"]},
      // 13. Incumplimiento / arrepentimiento — honorarios
      {titulo:esUSD?"13. HONORARIOS POR INCUMPLIMIENTO":"12. HONORARIOS POR INCUMPLIMIENTO", items:["En caso de incumplimiento o arrepentimiento de alguna de Las Partes, una vez cumplidos todos los Ad Referéndum de la presente Reserva, la parte incumplidora deberá abonar los honorarios pactados en concepto de labor de intermediación realizada hasta el momento, sin necesidad de formalidad judicial alguna.-"]},
      // 14. Asesoramiento individual
      {titulo:esUSD?"14. ASESORAMIENTO LEGAL E IMPOSITIVO":"13. ASESORAMIENTO LEGAL E IMPOSITIVO", items:["El Oferente manifiesta expresamente que para realizar la presente oferta se ha asesorado en forma individual con sus propios asesores legales e impositivos, declarando conocer en todos sus términos los riesgos e implicancias de la presente oferta.-"]},
      // 15. Refuerzo
      {titulo:esUSD?"15. REFUERZO":"14. REFUERZO", items:["El Oferente podrá ofrecer, de así convenirlo con el Propietario, un Refuerzo de la presente Reserva dentro de los 7 días corridos a partir de su conformidad, cuyo monto y demás condiciones se consignarán en el instrumento de Refuerzo de Reserva correspondiente.-"]},
    ].filter(Boolean);
    var numIncumplimiento = 7;

    var doc:any = {
      titulo: 'RESERVA "AD REFERÉNDUM"',
      subtitulo: "Oferta de compra sujeta a la conformidad del propietario",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
      fecha: fmtDLarga(op.fecha_posesion||new Date().toISOString().slice(0,10)),
      encabezado: "Recibimos de "+(op.comprador_nombre||"___________")+", DNI/CUIT "+(op.comprador_dni||"___________")+", con domicilio a estos efectos en "+(op.comprador_domicilio||"___________")+", en adelante el Oferente, la suma de "+fmt$L(op.anticipo,op.moneda)+" en concepto de \"Reserva Ad Referéndum\" de la aceptación del propietario "+(op.vendedor_nombre||"___________")+", DNI/CUIT "+(op.vendedor_dni||"___________")+", en adelante el Propietario, para la compra del inmueble ubicado en "+(op.inmueble_direccion||"___________")+", "+(op.inmueble_partido||"___________")+", Provincia de "+(op.inmueble_provincia||"___________")+(op.nomenclatura_catastral?", Nomenclatura Catastral "+op.nomenclatura_catastral:"")+", en adelante el Inmueble.\n\nEl presente se sujetará en un todo a los siguientes términos y condiciones:",
      // El encabezado ya identifica a Oferente y Propietario con nombre, DNI y
      // domicilio en el propio párrafo legal — mostrar además el bloque
      // "PARTES INTERVINIENTES" repetiría exactamente los mismos datos dos
      // veces seguidas. Se oculta ese bloque solo para este tipo de
      // documento (doc.partes se sigue usando internamente para otras
      // cosas si hiciera falta, pero no se imprime).
      ocultarPartesEnCuerpo: true,
      partes:[
        {rol:"PROPIETARIO / VENDEDOR", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
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
          (function(){var c=getComisionConfig(op,"comision_comprador",parseFloat(op.precio||0),op.moneda||"USD","comision_comprador",op.comision_porcentaje||"3");return c.modo==="fijo"?"Asimismo, manifiesto expresamente que me obligo a abonar a la inmobiliaria interviniente la suma de "+fmt$L(c.valor,c.moneda)+" en concepto de honorarios por labor de intermediación cumplimentada, al momento de firmarse la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-":"Asimismo, manifiesto expresamente que me obligo a abonar a la inmobiliaria interviniente el "+(c.valor||"___")+"% del Precio en concepto de honorarios por labor de intermediación cumplimentada, al momento de firmarse la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-";})(),
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
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
      fecha: fmtDLarga(op.fecha_posesion||new Date().toISOString().slice(0,10)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra el presente Boleto de Compraventa, sujeto a las disposiciones del Código Civil y Comercial de la Nación. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"VENDEDOR", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"COMPRADOR", nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones:[
        {titulo:"1. OBJETO", items:["El VENDEDOR "+(op.vendedor_nombre||"___")+" vende, cede y transfiere al COMPRADOR "+(op.comprador_nombre||"___")+", quien compra y acepta, el inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+(op.nomenclatura_catastral?", Nomenclatura Catastral "+op.nomenclatura_catastral:"")+".-"]},
        {titulo:"2. PRECIO", items:["El precio total y definitivo de la presente compraventa se fija en "+fmt$L(op.precio,op.moneda)+", que las partes declaran justo y conveniente a sus intereses.-"]},
        {titulo:"3. FORMA DE PAGO", items:["El COMPRADOR ha entregado en este acto, en concepto de seña y a cuenta de precio, la suma de "+fmt$L(op.anticipo,op.moneda)+", obligándose a abonar el saldo de "+fmt$L(op.saldo,op.moneda)+" al momento de la firma de la Escritura Traslativa de Dominio.-"]},
        {titulo:"4. POSESIÓN Y ESCRITURACIÓN", items:["La posesión del inmueble se otorgará el "+fmtD(op.fecha_posesion)+", fecha en la que asimismo deberá suscribirse la Escritura Traslativa de Dominio"+(op.escribania?" ante "+op.escribania:"")+".-"]},
        {titulo:"5. HONORARIOS DEL VENDEDOR", items:[textoComision(op,"comision_vendedor","VENDEDOR","Precio total",parseFloat(op.precio||0),op.moneda||"USD","comision_vendedor","4")]},
        {titulo:"6. HONORARIOS DEL COMPRADOR", items:[textoComision(op,"comision_comprador","COMPRADOR","Precio total",parseFloat(op.precio||0),op.moneda||"USD","comision_comprador","3")]},
        {titulo:"7. INCUMPLIMIENTO", items:["Si el COMPRADOR no se presentara a la firma de la Escritura Traslativa de Dominio en la fecha convenida, perderá en concepto de multa la suma entregada como seña. Si no se presentara el VENDEDOR, deberá restituir al COMPRADOR dicha suma dentro de las 48 horas, más otro tanto igual en concepto de única y total indemnización.-"]},
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
      subtitulo: "Oferta de locación sujeta a la conformidad del propietario",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
      fecha: fmtDLarga(op.res_alq_inicio_estimado||new Date().toISOString().slice(0,10)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra la presente Reserva de Locación, sujeta a la conformidad del LOCADOR. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"LOCADOR / PROPIETARIO", nombre:op.locador_nombre||"___", dni:op.locador_dni||"___", domicilio:op.locador_domicilio, email:op.locador_email},
        {rol:"LOCATARIO / OFERENTE", nombre:op.locatario_nombre||"___", dni:op.locatario_dni||"___", domicilio:op.locatario_domicilio, email:op.locatario_email},
      ],
      secciones:[
        {titulo:"1. OBJETO", items:["El LOCATARIO / OFERENTE entrega en este acto, en concepto de Reserva de Locación sujeta a la conformidad del LOCADOR, la suma de "+fmt$L(op.res_alq_monto_reserva,op.res_alq_moneda)+", para la locación del inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+".-"]},
        {titulo:"2. CONDICIONES ESTIMADAS DE LOCACIÓN", items:["Valor del alquiler mensual: "+fmt$L(op.res_alq_monto_mensual,op.res_alq_monto_mensual_moneda || op.res_alq_moneda || "ARS")+". Plazo estimado: "+(op.res_alq_plazo_cantidad||"24")+" "+(op.res_alq_plazo_unidad||"meses")+". Inicio estimado: "+fmtD(op.res_alq_inicio_estimado)+".-"]},
        {titulo:"3. VIGENCIA Y ACEPTACIÓN", items:["El LOCADOR deberá conformar la presente dentro de los "+(op.res_alq_aceptacion_dias||"2")+" días. La Reserva mantendrá su vigencia por "+(op.res_alq_vigencia_dias||"10")+" días corridos contados desde su conformación, plazo dentro del cual deberá suscribirse el correspondiente Contrato de Locación.-"]},
        {titulo:"4. HONORARIOS DEL LOCADOR", items:[textoComision(op,"res_alq_comision_locador","LOCADOR","canon mensual",parseFloat(op.res_alq_monto_mensual||0),op.res_alq_moneda||"ARS","res_alq_comision_locador",op.res_alq_comision||"1")]},
        {titulo:"5. HONORARIOS DEL LOCATARIO", items:[textoComision(op,"res_alq_comision_locatario","LOCATARIO","canon mensual",parseFloat(op.res_alq_monto_mensual||0),op.res_alq_moneda||"ARS","res_alq_comision_locatario",op.res_alq_comision||"1")]},
      ],
      firmas:[
        {rol:"LOCATARIO / OFERENTE", nombre:op.locatario_nombre||"", dni:op.locatario_dni||""},
        {rol:"LOCADOR / PROPIETARIO", nombre:op.locador_nombre||"", dni:op.locador_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="comodato") {
    doc = {
      titulo: "CONTRATO DE COMODATO",
      subtitulo: "Préstamo de uso gratuito — Arts. 1533 y ss. del Código Civil y Comercial de la Nación",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
      fecha: fmtDLarga(new Date().toISOString().slice(0,10)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra el presente Contrato de Comodato, sujeto a las disposiciones del Código Civil y Comercial de la Nación. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"COMODANTE (propietario)", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"COMODATARIO (recibe el bien)", nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones:[
        {titulo:"1. OBJETO", items:["El COMODANTE cede gratuitamente al COMODATARIO el uso del inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+", quien lo recibe de plena conformidad.-"]},
        {titulo:"2. PLAZO", items:["El presente comodato tendrá una duración de "+(op.comodato_plazo||"___")+", vencido el cual el COMODATARIO deberá restituir el bien en las mismas condiciones en que lo recibió.-"]},
        {titulo:"3. USO Y DESTINO", items:["Destino: "+(op.comodato_uso||"uso habitacional exclusivo del COMODATARIO")+". El COMODATARIO no podrá ceder ni subarrendar el bien sin autorización previa y por escrito del COMODANTE.-"]},
        {titulo:"4. OBLIGACIONES DEL COMODATARIO", items:["El COMODATARIO se obliga a conservar el bien en buen estado, abonar los gastos ordinarios de uso y servicios, no introducir modificaciones sin autorización del COMODANTE, y restituir el inmueble a la finalización del plazo pactado.-"]},
        {titulo:"5. INCUMPLIMIENTO", items:["El incumplimiento de cualquiera de las obligaciones asumidas dará derecho al COMODANTE a exigir la restitución inmediata del bien por la vía legal que corresponda.-"]},
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
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
      fecha: fmtDLarga(new Date().toISOString().slice(0,10)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra la presente Autorización de Venta. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"PROPIETARIO / AUTORIZANTE", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"INMOBILIARIA AUTORIZADA", nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones:[
        {titulo:"1. AUTORIZACIÓN", items:["El PROPIETARIO autoriza a la INMOBILIARIA a ofrecer, promocionar y gestionar la venta del inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+".-"]},
        {titulo:"2. PRECIO", items:["Precio de venta autorizado: "+fmt$L(op.precio,op.moneda)+". El PROPIETARIO acepta recibir ofertas a partir de dicho valor.-"]},
        {titulo:"3. "+(conExcl?"EXCLUSIVIDAD":"MODALIDAD"), items:[conExcl?("La presente autorización es EXCLUSIVA por el término de "+(op.exclusividad_vigencia||"90 días")+", plazo durante el cual el PROPIETARIO no podrá comercializar el inmueble por otro medio o intermediario.-"):("La presente autorización es SIN EXCLUSIVIDAD por el término de "+(op.exclusividad_vigencia||"90 días")+". El PROPIETARIO podrá comercializar el inmueble simultáneamente por otros medios o intermediarios.-")]},
        {titulo:"4. HONORARIOS", items:[textoComision(op,"comision_vendedor","PROPIETARIO","precio de venta",parseFloat(op.precio||0),op.moneda||"USD","comision_vendedor","3")]},
      ],
      firmas:[
        {rol:"PROPIETARIO / AUTORIZANTE", nombre:op.vendedor_nombre||"", dni:op.vendedor_dni||""},
        {rol:"INMOBILIARIA", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="refuerzo_reserva") {
    doc = {
      titulo: "REFUERZO DE RESERVA",
      subtitulo: "Ampliación del monto de reserva en operación en curso",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
      fecha: fmtDLarga(op.fecha_posesion||new Date().toISOString().slice(0,10)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra el presente Refuerzo de Reserva, que integra y complementa la Reserva de Compra oportunamente suscripta. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"VENDEDOR / PROPIETARIO", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"COMPRADOR / OFERENTE", nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones:[
        {titulo:"1. ANTECEDENTES", items:[(op.refuerzo_trayectoria||("Las partes han suscripto con anterioridad una Reserva de Compra para el inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+".-"))]},
        {titulo:"2. OBJETO DEL REFUERZO", items:["En este acto el COMPRADOR entrega, en calidad de REFUERZO de la Reserva oportunamente suscripta, la suma de "+fmt$L(op.precio,op.moneda)+", en concepto de ampliación del monto originalmente entregado.-"]},
        {titulo:"3. CONDICIONES", items:["El presente Refuerzo integra y complementa la Reserva original, manteniendo plena vigencia todas sus condiciones, plazos y cláusulas oportunamente pactadas.-"]},
        {titulo:"4. INCUMPLIMIENTO", items:["En caso de incumplimiento del COMPRADOR, perderá el monto total entregado. En caso de incumplimiento del VENDEDOR, deberá restituir el doble de dicho monto dentro de las 48 horas.-"]},
      ],
      firmas:[
        {rol:"COMPRADOR / OFERENTE", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
        {rol:"VENDEDOR / PROPIETARIO", nombre:op.vendedor_nombre||"", dni:op.vendedor_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="devolucion_reserva") {
    doc = {
      titulo: "DEVOLUCIÓN DE RESERVA",
      subtitulo: "Devolución del monto de reserva por no concreción de la operación",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
      fecha: fmtDLarga(op.fecha_posesion||new Date().toISOString().slice(0,10)),
      encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra la presente Devolución de Reserva. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
      partes:[
        {rol:"VENDEDOR / PROPIETARIO", nombre:op.vendedor_nombre||"___", dni:op.vendedor_dni||"___", domicilio:op.vendedor_domicilio, email:op.vendedor_email},
        {rol:"COMPRADOR / OFERENTE", nombre:op.comprador_nombre||"___", dni:op.comprador_dni||"___", domicilio:op.comprador_domicilio, email:op.comprador_email},
      ],
      secciones:[
        {titulo:"1. ANTECEDENTES", items:["Las partes habían suscripto una Reserva de Compra para el inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+".-"]},
        {titulo:"2. MOTIVO DE LA DEVOLUCIÓN", items:[(op.devolucion_motivo||"Por mutuo acuerdo entre las partes, y ante la no concreción de la operación, se procede a la devolución íntegra del monto de reserva oportunamente entregado.-")]},
        {titulo:"3. DEVOLUCIÓN", items:["El VENDEDOR / PROPIETARIO devuelve en este acto al COMPRADOR / OFERENTE la suma de "+fmt$L(op.precio,op.moneda)+", recibiendo el COMPRADOR plena conformidad respecto de la devolución.-"]},
        {titulo:"4. FINIQUITO", items:["Con la presente devolución, ambas partes se otorgan mutuo y recíproco finiquito, sin que ninguna de ellas tenga derecho a reclamo posterior alguno en relación a la operación descripta.-"]},
      ],
      firmas:[
        {rol:"COMPRADOR / OFERENTE", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
        {rol:"VENDEDOR / PROPIETARIO", nombre:op.vendedor_nombre||"", dni:op.vendedor_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  // ── CONTRATO DE LOCACIÓN (tipo por defecto: "alquiler") ────────────────────
  var fin = op.alquiler_fin?fmtD(op.alquiler_fin):fmtD(addMonthsDias(op.alquiler_inicio,op.alquiler_plazo_meses,op.alquiler_plazo_dias));
  var plazoTxt = plazoAlquilerTexto(op.alquiler_plazo_meses||"24", op.alquiler_plazo_dias||"0");
  var garantiaDetalle = (op.alquiler_garantia_texto_personalizado && op.alquiler_garantia_texto_personalizado.trim())
    ? op.alquiler_garantia_texto_personalizado.trim()
    : op.alquiler_garantia_tipo==="propietario"
    ? "Se constituye garantía propietaria a cargo de "+(op.alquiler_garantia_titular||"___")+", "+tipoIdentificacion(op.alquiler_garantia_dni)+": "+(op.alquiler_garantia_dni||"___")+", titular del inmueble sito en "+(op.alquiler_garantia_inmueble||"___")+".-"
    : op.alquiler_garantia_tipo==="seguro_caucion" ? "Se constituye como garantía un Seguro de Caución a contratar por el LOCATARIO en forma previa a la firma del presente.-"
    : op.alquiler_garantia_tipo==="aval_bancario" ? "Se constituye como garantía un Aval Bancario otorgado a favor del LOCATARIO.-"
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
    : parseFloat(op.alquiler_monto_inicial||0)*parseFloat(op.alquiler_deposito||1);
  var depositoMoneda = op.alquiler_deposito==="otro" ? (op.alquiler_deposito_otro_moneda||"USD") : op.alquiler_moneda;
  var depositoDesc = op.alquiler_deposito==="otro"
    ? "un monto fijo de "+fmt$L(depositoMontoNum, depositoMoneda)
    : "el equivalente a "+(op.alquiler_deposito||"1")+" mes de alquiler, es decir "+fmt$L(depositoMontoNum, depositoMoneda);

  var interesPunitorio = op.alquiler_interes_punitorio||"5";
  var penalidadMeses = op.alquiler_penalidad_meses||"2";
  var seguroDias = op.alquiler_seguro_dias||"10";
  var avisoMeses = op.alquiler_aviso_meses||"1";

  doc = {
    titulo: "CONTRATO DE LOCACIÓN",
    subtitulo: "Celebrado conforme la Ley 27.551 y el Código Civil y Comercial de la Nación",
    ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
    fecha: fmtDLarga(op.alquiler_inicio),
    encabezado: "Entre las partes individualizadas en el presente instrumento, en adelante denominadas conjuntamente \"Las Partes\", se celebra el presente Contrato de Locación, que se regirá por las cláusulas que a continuación se detallan, sujeto a las disposiciones del Código Civil y Comercial de la Nación y de la Ley 27.551. Las Partes aceptan la validez de los domicilios electrónicos declarados en el presente y de la firma electrónica como manifestación válida de su voluntad.",
    partes:[
      {rol:"LOCADOR / PROPIETARIO", nombre:op.locador_nombre||"___", dni:op.locador_dni||"___", domicilio:op.locador_domicilio, email:op.locador_email},
      {rol:"LOCATARIO / INQUILINO", nombre:op.locatario_nombre||"___", dni:op.locatario_dni||"___", domicilio:op.locatario_domicilio, email:op.locatario_email},
    ],
    secciones:[
      {titulo:"1. OBJETO", items:[
        "El LOCADOR da en locación al LOCATARIO el "+tipoInmuebleLabel(op.inmueble_tipo||"departamento",op.inmueble_tipo_otro)+" ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+", con destino a "+(op.alquiler_destino==="vivienda"?"uso habitacional / vivienda familiar":op.alquiler_destino==="comercial"?"uso comercial":"uso profesional")+(op.alquiler_amoblado?", el cual se entrega AMOBLADO conforme al inventario de bienes muebles que como Anexo I forma parte integrante del presente contrato":"")+". El LOCATARIO declara recibir el inmueble en perfecto estado de conservación y limpieza, prestando plena conformidad con sus instalaciones.-"
      ].concat(op.alquiler_amoblado&&op.alquiler_inventario?["ANEXO I — INVENTARIO DE BIENES MUEBLES:\n"+op.alquiler_inventario]:[])},
      {titulo:"2. PLAZO", items:["El presente contrato tendrá una duración de "+plazoTxt+", con inicio el "+fmtD(op.alquiler_inicio)+" y vencimiento el "+fin+", conforme al plazo mínimo legal establecido por la Ley 27.551 para locaciones habitacionales. Al finalizar el plazo, el LOCATARIO se obliga a restituir el inmueble totalmente desocupado y en el mismo estado en que lo recibió, salvo el deterioro propio del uso normal y el transcurso del tiempo.-"]},
      {titulo:"3. CANON LOCATIVO Y ACTUALIZACIÓN", items:[canonClause]},
      {titulo:"4. GASTOS Y MANTENIMIENTO", items:["Quedan a cargo del LOCATARIO los gastos de expensas ordinarias, electricidad, gas, agua, internet y demás servicios del inmueble desde la entrega de la posesión. Quedan a cargo del LOCADOR las expensas extraordinarias y los impuestos que graven el inmueble (ARBA / Impuesto Inmobiliario). El LOCATARIO no podrá subalquilar, ceder ni transferir el uso del inmueble, ni realizar obras o mejoras, sin el consentimiento previo y por escrito del LOCADOR.-"]},
      {titulo:"5. DEPÓSITO EN GARANTÍA", items:["El LOCATARIO entrega en depósito "+depositoDesc+", el cual será restituido "+(op.alquiler_deposito==="otro"?"":"actualizado conforme al índice pactado, ")+"según lo dispuesto por la Ley 27.551. Este depósito no devengará intereses y no podrá ser imputado al pago de alquileres.-"]},
      {titulo:"6. MORA Y PENALIDADES", items:[
        "El incumplimiento de cualquier obligación a cargo del LOCATARIO, incluida la falta de pago de un (1) mes de alquiler, lo constituirá en mora en forma automática, sin necesidad de interpelación judicial o extrajudicial alguna.-",
        "La mora en el pago del canon locativo devengará un interés punitorio del "+interesPunitorio+"% mensual hasta su efectivo pago.-",
        "Si el LOCATARIO no restituyera el inmueble al vencimiento del contrato, deberá abonar en concepto de cláusula penal una suma equivalente a "+penalidadMeses+" veces el canon locativo mensual vigente, por cada mes o fracción de demora en la restitución.-",
      ]},
      {titulo:"7. SEGURO", items:["El LOCATARIO se obliga a contratar, dentro de los "+seguroDias+" días corridos de la firma del presente, un seguro de Responsabilidad Civil e Incendio sobre el inmueble, designando como beneficiario al LOCADOR, debiendo acreditar su vigencia durante toda la duración del contrato.-"]},
      {titulo:"8. RESOLUCIÓN ANTICIPADA", items:["El LOCATARIO podrá rescindir el presente contrato en forma anticipada conforme lo establecido por la legislación vigente, debiendo notificar en forma fehaciente al LOCADOR con "+avisoMeses+" mes/es de antelación y abonando, en su caso, la indemnización legal correspondiente.-"]},
      {titulo:"9. GARANTÍA", items:[garantiaDetalle]},
      {titulo:"10. HONORARIOS DEL LOCADOR", items:[textoComision(op,"alquiler_comision_locador","LOCADOR","total del contrato",totalContratoAlquiler(op),op.alquiler_moneda||"ARS","alquiler_comision_locador",op.alquiler_comision||"1")]},
      {titulo:"11. HONORARIOS DEL LOCATARIO", items:[textoComision(op,"alquiler_comision_locatario","LOCATARIO","total del contrato",totalContratoAlquiler(op),op.alquiler_moneda||"ARS","alquiler_comision_locatario",op.alquiler_comision||"1")]},
    ],
    firmas:[
      {rol:"LOCADOR", nombre:op.locador_nombre||"", dni:op.locador_dni||""},
      {rol:"LOCATARIO", nombre:op.locatario_nombre||"", dni:op.locatario_dni||""},
    ],
  };
  return finalizeDoc(doc, op, clausulasLib);
}


function buildDocSections(op, clausulasLib, tipo, bloquesPlantilla) {
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
    montoBase = parseFloat(op.alquiler_monto_inicial || 0);
    monedaBase = op.alquiler_moneda || "ARS";
    comisionPrefix = destinatario === "parte1" ? "alquiler_comision_locador" : "alquiler_comision_locatario";
    var cfgAlq = getComisionConfig(op,comisionPrefix,montoBase,monedaBase,comisionPrefix,op.alquiler_comision||"1");
    monto=cfgAlq.monto; moneda=cfgAlq.moneda; pct=cfgAlq.modo==="porcentaje"?parseFloat(cfgAlq.valor||0):null; modoComision=cfgAlq.modo;
    fecha = op.alquiler_inicio || new Date().toISOString().slice(0,10);
    if (destinatario === "parte1") {
      pagador = op.locador_nombre || "___"; rolPagador = "LOCADOR";
    } else {
      pagador = op.locatario_nombre || "___"; rolPagador = "LOCATARIO";
    }
    concepto = "Locación del inmueble en "+(op.inmueble_direccion||"___");
  } else if (esBoleto || esReserva) {
    montoBase = parseFloat(op.precio || 0);
    monedaBase = op.moneda || "USD";
    comisionPrefix = destinatario === "parte1" ? "comision_vendedor" : "comision_comprador";
    var tienePartes = !!(op.comision_vendedor||op.comision_comprador||op.comision_vendedor_valor||op.comision_comprador_valor);
    var legacyPctCompra = parseFloat(op.comision_porcentaje||3);
    var legacyDefaultCompra = !tienePartes && esReserva ? String(legacyPctCompra/2) : (destinatario === "parte1" ? "4" : "3");
    var cfgCompra = getComisionConfig(op,comisionPrefix,montoBase,monedaBase,comisionPrefix,legacyDefaultCompra);
    monto=cfgCompra.monto; moneda=cfgCompra.moneda; pct=cfgCompra.modo==="porcentaje"?parseFloat(cfgCompra.valor||0):null; modoComision=cfgCompra.modo;
    fecha = op.fecha_posesion || new Date().toISOString().slice(0,10);
    if (destinatario === "parte1") { pagador = op.vendedor_nombre || "___"; rolPagador = "VENDEDOR"; }
    else { pagador = op.comprador_nombre || "___"; rolPagador = "COMPRADOR"; }
    concepto = (esBoleto ? "Boleto de Compraventa" : "Reserva de Compra") + " — inmueble en " + (op.inmueble_direccion||"___");
  } else if (esResAlq) {
    montoBase = parseFloat(op.res_alq_monto_mensual || 0);
    monedaBase = op.res_alq_moneda || op.res_alq_monto_mensual_moneda || "ARS";
    comisionPrefix = destinatario === "parte1" ? "res_alq_comision_locador" : "res_alq_comision_locatario";
    var cfgResAlq = getComisionConfig(op,comisionPrefix,montoBase,monedaBase,comisionPrefix,op.res_alq_comision||"1");
    monto=cfgResAlq.monto; moneda=cfgResAlq.moneda; pct=cfgResAlq.modo==="porcentaje"?parseFloat(cfgResAlq.valor||0):null; modoComision=cfgResAlq.modo;
    fecha = op.res_alq_inicio_estimado || new Date().toISOString().slice(0,10);
    if (destinatario === "parte1") { pagador = op.locador_nombre || "___"; rolPagador = "LOCADOR"; }
    else { pagador = op.locatario_nombre || "___"; rolPagador = "LOCATARIO"; }
    concepto = "Reserva de Locación — inmueble en "+(op.inmueble_direccion||"___");
  } else {
    return null;
  }

  var nroRecibo = "R-" + Date.now().toString().slice(-6);
  var detalleCalculo = modoComision==="fijo"
    ? "Honorario pactado como monto fijo: " + fmt$L(monto,moneda) + "."
    : "Base de cálculo: " + fmt$(montoBase,monedaBase) + " × " + (pct||0).toFixed(2) + "% = " + fmt$(monto,moneda) + ".";

  return {
    titulo: "RECIBO DE HONORARIOS PROFESIONALES",
    subtitulo: "Comprobante de pago — " + (perfil && perfil.nombre ? perfil.nombre : "Inmobiliaria"),
    ciudad: (op.inmueble_partido||"___") + ", Provincia de " + (op.inmueble_provincia||"Buenos Aires"),
    fecha: fmtDLarga(fecha),
    nroRecibo: nroRecibo,
    esRecibo: true,
    partes: [
      { rol: rolPagador, nombre: pagador, dni: (destinatario==="parte1"?(esAlq?op.locador_dni:op.vendedor_dni):(esAlq?op.locatario_dni:op.comprador_dni))||"___", domicilio:"", email:"" },
      { rol: "INMOBILIARIA INTERVINIENTE", nombre: (perfil&&perfil.nombre)||"___", dni: (perfil&&perfil.matricula)?"Mat. "+perfil.matricula:"", domicilio:"", email: (perfil&&perfil.email)||"" },
    ],
    secciones: [
      { titulo: "DETALLE DEL RECIBO", items: [
        "La " + ((perfil&&perfil.nombre)||"inmobiliaria") + (perfil&&perfil.matricula?", Matrícula "+perfil.matricula:"") + " recibió de la " + (ROL_A_PARTE[rolPagador]||rolPagador.toLowerCase()) + " " + pagador + " la suma de " + fmt$(monto, moneda) + " en concepto de honorarios profesionales de intermediación inmobiliaria.",
        "Operación: " + concepto + ".",
        detalleCalculo,
        "N° de recibo: " + nroRecibo + " | Fecha: " + fmtD(fecha) + ".",
      ]},
      { titulo: "FORMA DE PAGO", items: [
        "Importe total abonado: " + fmt$L(monto, moneda) + ".",
        "El presente recibo cancela en forma total y definitiva los honorarios correspondientes a la operación detallada precedentemente.",
      ]},
      { titulo: "DECLARACION", items: [
        "La " + ((perfil&&perfil.nombre)||"inmobiliaria") + " declara haber prestado los servicios de intermediación inmobiliaria que dieron origen a la presente operación, en cumplimiento de las disposiciones vigentes en materia de ejercicio profesional inmobiliario.",
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
// generarDOCX() actualiza estas variables al comienzo según perfil.plantillaEstilo,
// perfil.colorPrimario y perfil.colorSecundario. px()/pxRuns() las usan como
// valores por defecto para que todo el documento comparta tipografía y color
// de marca sin tener que pasar esas opciones en cada llamado.
var DOCX_DEFAULT_FONT = "Arial";
var DOCX_COLOR_PRIM = "14213D";
var DOCX_COLOR_SEC = "C9A227";
var DOCX_BORDER_COLOR = "CCCCCC";
function lightenHex(hex, amount){
  var h=(hex||"").replace("#","");
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length!==6) return "CCCCCC";
  var r=parseInt(h.substr(0,2),16), g=parseInt(h.substr(2,2),16), b=parseInt(h.substr(4,2),16);
  r=Math.round(r+(255-r)*amount); g=Math.round(g+(255-g)*amount); b=Math.round(b+(255-b)*amount);
  return [r,g,b].map(function(v){return v.toString(16).padStart(2,"0");}).join("").toUpperCase();
}

function px(text, opts) {
  opts = opts || {};
  var pPr = "";
  if (opts.spacing) pPr += '<w:spacing w:before="'+(opts.spacing.before||0)+'" w:after="'+(opts.spacing.after||100)+'"/>';
  if (opts.center) pPr += '<w:jc w:val="center"/>';
  if (opts.justify) pPr += '<w:jc w:val="both"/>';
  if (opts.border) pPr += '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="'+(opts.borderColor||DOCX_BORDER_COLOR)+'"/></w:pBdr>';
  var rPr = '<w:rFonts w:ascii="'+DOCX_DEFAULT_FONT+'" w:hAnsi="'+DOCX_DEFAULT_FONT+'" w:cs="'+DOCX_DEFAULT_FONT+'"/>';
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
function pxRuns(runsArr, opts) {
  opts = opts || {};
  var pPr = "";
  if (opts.spacing) pPr += '<w:spacing w:before="'+(opts.spacing.before||0)+'" w:after="'+(opts.spacing.after||100)+'"/>';
  if (opts.center) pPr += '<w:jc w:val="center"/>';
  if (opts.justify) pPr += '<w:jc w:val="both"/>';
  if (opts.border) pPr += '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="'+(opts.borderColor||DOCX_BORDER_COLOR)+'"/></w:pBdr>';
  var runs = runsArr.map(function(r) {
    var rPr = '<w:rFonts w:ascii="'+DOCX_DEFAULT_FONT+'" w:hAnsi="'+DOCX_DEFAULT_FONT+'" w:cs="'+DOCX_DEFAULT_FONT+'"/>';
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
  try {
    // Build document body XML
    var body = "";

    // Estilo de plantilla y colores de marca (personalización por inmobiliaria):
    // clásico usa tipografía serif y se mantiene en negro (sin color de marca);
    // minimalista y corporativo usan el color primario para rótulos y una
    // sans-serif contemporánea.
    var estiloD = (perfil&&perfil.plantillaEstilo)||"corporativo";
    var esClasicoD = estiloD==="clasico";
    DOCX_DEFAULT_FONT = esClasicoD ? "Times New Roman" : "Arial";
    DOCX_COLOR_PRIM = esClasicoD ? "1A1A1A" : hexToDocx((perfil&&perfil.colorPrimario)||"#142a4d");
    DOCX_COLOR_SEC = hexToDocx((perfil&&perfil.colorSecundario)||"#c9a227");
    DOCX_BORDER_COLOR = esClasicoD ? "999999" : lightenHex(DOCX_COLOR_SEC, 0.35);

    // Logo: se normaliza a JPEG (misma rutina que el PDF) para poder
    // embeberlo como imagen real en el header del documento Word.
    var logoInfo = null;
    if (perfil && perfil.logoDataUrl && perfil.logoDataUrl.startsWith("data:image")) {
      try { logoInfo = await normalizeLogoImage(perfil.logoDataUrl, 400); } catch(ex) { logoInfo = null; }
    }

    // Header inmobiliaria con logo
    if (perfil && (perfil.nombre || perfil.matricula || perfil.web || (perfil.ubicacion_inmobiliaria_activa===true && perfil.direccion) || (perfil.logo_encabezado_activo !== false && logoInfo))) {
      if (perfil.logo_encabezado_activo !== false && logoInfo) {
        // Tamaño objetivo del logo: aprox. 4cm x 2cm (a 96dpi, 1cm ≈ 37.8px),
        // ajustable por perfil.logoScale (%, 50–200, default 100).
        var logoScalePct = perfil.logoScale||100;
        var maxWpx = 151*(logoScalePct/100), maxHpx = 76*(logoScalePct/100);
        var logoFitScale = Math.min(1, maxWpx/logoInfo.width, maxHpx/logoInfo.height);
        var dispW = Math.max(1, Math.round(logoInfo.width*logoFitScale));
        var dispH = Math.max(1, Math.round(logoInfo.height*logoFitScale));
        var cx = dispW*9525, cy = dispH*9525; // EMU a 96dpi
        var jcVal = perfil.logoPosicion==="izquierda" ? "left" : perfil.logoPosicion==="centro" ? "center" : "right";
        body += '<w:p><w:pPr><w:jc w:val="'+jcVal+'"/><w:spacing w:before="0" w:after="80"/></w:pPr><w:r><w:drawing>'
          + '<wp:inline distT="0" distB="0" distL="0" distR="0">'
          + '<wp:extent cx="'+cx+'" cy="'+cy+'"/>'
          + '<wp:docPr id="1" name="Logo"/>'
          + '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
          + '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          + '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          + '<pic:nvPicPr><pic:cNvPr id="1" name="Logo"/><pic:cNvPicPr/></pic:nvPicPr>'
          + '<pic:blipFill><a:blip r:embed="rIdLogo1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
          + '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
          + '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
      }
      var encNombreD=perfil.encabezado_nombre!==false, encMatriculaD=perfil.encabezado_matricula!==false, encWebD=perfil.encabezado_web!==false;
      var ubicacionHeaderD = perfil.ubicacion_inmobiliaria_activa===true && perfil.direccion && (perfil.ubicacion_inmobiliaria_posicion||"pie")==="encabezado";
      var cabeceraDocx=encNombreD?(perfil.nombre.toUpperCase()+(encMatriculaD&&perfil.matricula?" — Matrícula: "+perfil.matricula:"")):("Matrícula: "+perfil.matricula);
      if (esClasicoD) {
        if (encNombreD || encMatriculaD) body += px(cabeceraDocx, {bold:true, size:14, center:true, color:DOCX_COLOR_PRIM, spacing:{before:40,after:20}});
        if (encWebD && perfil.web) body += px(perfil.web, {size:9, center:true, color:"666666", spacing:{before:0,after:20}});
        if (ubicacionHeaderD) body += px("Ubicación: "+perfil.direccion, {size:9, center:true, color:DOCX_COLOR_PRIM, spacing:{before:0,after:20}});
        body += px("", {border:true, spacing:{before:60,after:60}});
      } else {
        var headerFill=estiloD==="corporativo"?DOCX_COLOR_PRIM:lightenHex(DOCX_COLOR_PRIM,0.94);
        var headerMainColor=estiloD==="corporativo"?"FFFFFF":DOCX_COLOR_PRIM;
        var headerMetaColor=estiloD==="corporativo"?"E5E7EB":"64748B";
        var headerParas=[];
        if (encNombreD || encMatriculaD) headerParas.push(px(cabeceraDocx, {bold:true, size:12, color:headerMainColor, spacing:{before:0,after:20}}));
        if (encWebD && perfil.web) headerParas.push(px(perfil.web, {size:8.5, color:headerMetaColor, spacing:{before:0,after:15}}));
        if (ubicacionHeaderD) headerParas.push(px("Ubicación: "+perfil.direccion, {size:8.5, color:headerMetaColor, spacing:{before:0,after:0}}));
        if(headerParas.length) body += docxHeaderBox(headerParas, headerFill);
        body += px("", {border:true, spacing:{before:70,after:70}});
      }
    }

    // Título
    body += px(doc.titulo.toUpperCase(), {bold:true, size:15, center:true, spacing:{before:160,after:60}});
    if (doc.subtitulo) body += px(doc.subtitulo, {size:10, center:true, color:"555555", spacing:{before:0,after:60}});
    if (doc.nroRecibo) body += px("N° "+doc.nroRecibo, {bold:true, size:12, center:true, spacing:{before:40,after:80}});
    body += px("", {border:true, spacing:{before:60,after:60}});
    body += px("Lugar: "+(doc.ciudad||"")+"  —  Fecha: "+(doc.fecha||""), {size:10, spacing:{before:80,after:80}});
    body += px("", {border:true, spacing:{before:60,after:120}});

    // Introducción / preámbulo (todos los tipos). Toggle: perfil.mostrar_introduccion
    if (doc.encabezado && (perfil?perfil.mostrar_introduccion!==false:true)) {
      doc.encabezado.split("\n\n").forEach(function(par) {
        if (par.trim()) body += px(par.trim(), {size:10.5, spacing:{before:80,after:80}, justify:true});
      });
      body += px("", {spacing:{before:40,after:40}});
    }

    // Partes
    if (doc.partes && doc.partes.length && !doc.ocultarPartesEnCuerpo) {
      body += px("PARTES INTERVINIENTES", {bold:true, size:11, spacing:{before:120,after:100}});
      doc.partes.forEach(function(parte) {
        body += px(parte.rol.toUpperCase()+": "+(parte.nombre||"—"), {bold:true, size:10, spacing:{before:100,after:30}});
        if (parte.dni) body += px(tipoIdentificacion(parte.dni)+": "+parte.dni, {size:9, color:"444444", spacing:{before:0,after:20}});
        if (parte.domicilio) body += px("Domicilio: "+parte.domicilio, {size:9, color:"444444", spacing:{before:0,after:20}});
      });
      body += px("", {border:true, spacing:{before:120,after:120}});
    }

    // Secciones — rótulo en negrita + texto corrido en el mismo párrafo, justificado.
    // Todos los tipos de documento. El espacio tras ":" va al inicio del cuerpo
    // (más confiable en Word que un espacio al final del run en negrita).
    if (doc.secciones && doc.secciones.length) {
      doc.secciones.forEach(function(sec) {
        var prefix = String(prefijoClausulaFormal(sec.titulo)||"").replace(/\s+$/,"");
        (sec.items||[]).forEach(function(item, idx) {
          if (!item) return;
          if (idx === 0) {
            body += pxRuns([
              {text: prefix, bold:true, size:10.5, color:DOCX_COLOR_PRIM},
              {text: " "+cuerpoTrasRotulo(item), size:10.5},
            ], {justify:true, spacing:{before:200, after:80}});
          } else {
            body += px(normalizarTextoDocumento(item), {size:10.5, spacing:{before:40, after:80}, justify:true});
          }
        });
      });
    }

    // Cláusulas (continúan la numeración de las secciones, sin encabezado separado)
    if (doc.clausulas && doc.clausulas.length) {
      doc.clausulas.forEach(function(c) {
        var label = String(prefijoClausulaDesdeNumTitulo(c.num, c.titulo||"")||"").replace(/\s+$/,"");
        body += pxRuns([
          {text: label, bold:true, size:10.5, color:DOCX_COLOR_PRIM},
          {text: " "+cuerpoTrasRotulo(c.texto||""), size:10.5},
        ], {justify:true, spacing:{before:200, after:80}});
      });
    }

    // Firmas principales: centradas, con espacio vertical para firma manuscrita.
    body += px("", {border:true, spacing:{before:140,after:140}});
    body += px("FIRMAS", {bold:true, size:11, center:true, spacing:{before:180,after:180}});
    var firmantesPpalesDocx = (doc.firmas && doc.firmas.length) ? doc.firmas : doc.partes;
    var huboInmobEnFirmasDocx = false;
    if (firmantesPpalesDocx) {
      firmantesPpalesDocx.forEach(function(parte) {
        var nombreFirma = parte.usarPerfil ? ((perfil&&perfil.nombre)||"Inmobiliaria interviniente") : parte.nombre;
        var rolFirma = parte.usarPerfil ? (parte.rol+((perfil&&perfil.matricula)?" — Mat. "+perfil.matricula:"")) : parte.rol;
        if (parte.usarPerfil) huboInmobEnFirmasDocx = true;
        body += px("________________________", {size:10, center:true, spacing:{before:170,after:35}});
        body += px(rolFirma||"", {size:9, color:"555555", center:true, spacing:{before:0,after:12}});
        body += px(nombreFirma||"", {size:10, bold:true, center:true, spacing:{before:0,after:100}});
        if(parte.dni) body += px(tipoIdentificacion(parte.dni)+": "+parte.dni, {size:8.5, color:"666666", center:true, spacing:{before:0,after:20}});
      });
    }
    if (!huboInmobEnFirmasDocx) {
      body += px("________________________", {size:10, center:true, spacing:{before:110,after:35}});
      body += px("INMOBILIARIA INTERVINIENTE"+(perfil&&perfil.nombre?" — "+perfil.nombre:""), {size:9, color:"555555", center:true, spacing:{before:0,after:100}});
    }

    // Presta Conformidad (reserva): aceptación posterior del propietario, numeración propia
    if (doc.conformidad && doc.conformidad.items && doc.conformidad.items.length) {
      body += px("", {border:true, spacing:{before:140,after:100}});
      body += px("PRESTA CONFORMIDAD", {bold:true, size:11, spacing:{before:80,after:120}});
      doc.conformidad.items.forEach(function(txt, i) {
        body += pxRuns([
          {text: (i+1)+". ", bold:true, size:10.5, color:DOCX_COLOR_PRIM},
          {text: txt, size:10.5},
        ], {justify:true, spacing:{before:140, after:80}});
      });
      body += px("________________________", {size:10, center:true, spacing:{before:170,after:35}});
      body += px("PROPIETARIO", {size:9, color:"555555", center:true, spacing:{before:0,after:12}});
      body += px(doc.conformidad.firmante||"", {size:10, bold:true, center:true, spacing:{before:0,after:14}});
      if (doc.conformidad.dni) body += px(tipoIdentificacion(doc.conformidad.dni)+": "+doc.conformidad.dni, {size:9, color:"444444", center:true, spacing:{before:0,after:90}});
    }

    // El pie se genera como footer real de Word (por página), no como contenido
    // al final del cuerpo. Así el número de página, la ubicación, la leyenda y el
    // logo respetan la misma lógica visual página por página.
    // Assemble OOXML files
    var ubicacionPieD = perfil && perfil.ubicacion_inmobiliaria_activa===true && perfil.direccion && (perfil.ubicacion_inmobiliaria_posicion||"pie")==="pie";
    var footerHasAnything = !!(perfil && (ubicacionPieD || perfil.pie_pagina_texto || (perfil.pie_pagina_logo_debajo && logoInfo) || perfil.pie_pagina_numero_activo!==false));

    var footerBody = "";
    if (footerHasAnything) {
      footerBody += '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="'+DOCX_BORDER_COLOR+'"/></w:pBdr><w:spacing w:before="0" w:after="20"/></w:pPr></w:p>';
      if (ubicacionPieD) footerBody += px("Ubicación: "+perfil.direccion, {size:8, color:"777777", center:true, spacing:{before:20,after:10}});
      if (perfil.pie_pagina_logo_debajo && logoInfo) {
        var miniScalePct=(perfil&&perfil.pie_pagina_logo_scale)||100;
        var miniMaxHpx=Math.max(18,Math.min(42,24*(miniScalePct/100)));
        var miniFitScale=Math.min(1,miniMaxHpx/logoInfo.height);
        var miniDispW=Math.max(1,Math.round(logoInfo.width*miniFitScale));
        var miniDispH=Math.max(1,Math.round(logoInfo.height*miniFitScale));
        var miniCx=miniDispW*9525, miniCy=miniDispH*9525;
        var miniJc=perfil.pie_pagina_logo_posicion==="izquierda"?"left":perfil.pie_pagina_logo_posicion==="derecha"?"right":"center";
        footerBody += '<w:p><w:pPr><w:jc w:val="'+miniJc+'"/><w:spacing w:before="20" w:after="10"/></w:pPr><w:r><w:drawing>'
          + '<wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+miniCx+'" cy="'+miniCy+'"/><wp:docPr id="20" name="LogoPie"/>'
          + '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          + '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="20" name="LogoPie"/><pic:cNvPicPr/></pic:nvPicPr>'
          + '<pic:blipFill><a:blip r:embed="rIdFooterLogo1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+miniCx+'" cy="'+miniCy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
          + '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
      }
      if (perfil.pie_pagina_leyenda_activa!==false && perfil.pie_pagina_texto) footerBody += px(perfil.pie_pagina_texto, {size:8, color:"999999", center:true, italic:true, spacing:{before:20,after:10}});
      if (perfil.pie_pagina_numero_activo!==false) {
        var pageJc=perfil.pie_pagina_numero_posicion==="izquierda"?"left":perfil.pie_pagina_numero_posicion==="derecha"?"right":"center";
        footerBody += '<w:p><w:pPr><w:jc w:val="'+pageJc+'"/><w:spacing w:before="15" w:after="0"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="'+DOCX_DEFAULT_FONT+'" w:hAnsi="'+DOCX_DEFAULT_FONT+'"/></w:rPr><w:t>Página </w:t></w:r><w:fldSimple w:instr="PAGE"><w:r><w:rPr><w:rFonts w:ascii="'+DOCX_DEFAULT_FONT+'" w:hAnsi="'+DOCX_DEFAULT_FONT+'"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple></w:p>';
      }
    }

    var CT = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
      + (logoInfo ? '<Default Extension="jpeg" ContentType="image/jpeg"/>' : '')
      + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
      + (footerHasAnything ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' : '')
      + '</Types>';

    var RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';

    var DOC_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + (logoInfo ? '<Relationship Id="rIdLogo1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo1.jpeg"/>' : '')
      + (footerHasAnything ? '<Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' : '')
      + '</Relationships>';

    var FOOTER_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + ((footerHasAnything && perfil.pie_pagina_logo_debajo && logoInfo) ? '<Relationship Id="rIdFooterLogo1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo1.jpeg"/>' : '')
      + '</Relationships>';

    var sectPr = '<w:sectPr>'
      + (footerHasAnything ? '<w:footerReference w:type="default" r:id="rIdFooter1"/>' : '')
      + '<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/>'
      + '</w:sectPr>';

    var DOC = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>'+body+sectPr+'</w:body></w:document>';

    var FOOTER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">'+footerBody+'</w:ftr>';

    var files = [
      {name:"[Content_Types].xml", data:u8(CT)},
      {name:"_rels/.rels",         data:u8(RELS)},
      {name:"word/document.xml",   data:u8(DOC)},
      {name:"word/_rels/document.xml.rels", data:u8(DOC_RELS)},
    ];
    if (footerHasAnything) {
      files.push({name:"word/footer1.xml", data:u8(FOOTER)});
      files.push({name:"word/_rels/footer1.xml.rels", data:u8(FOOTER_RELS)});
    }
    if (logoInfo) {
      files.push({name:"word/media/logo1.jpeg", data: base64ToU8(logoInfo.dataUrl.split(",")[1])});
    }

    var zipBytes = buildZip(files);
    var blob = new Blob([zipBytes], {type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
    var _dp1=(doc.partes&&doc.partes[0]&&doc.partes[0].nombre)?doc.partes[0].nombre.split(" ").slice(0,2).join("_"):"";
    var _dp2=(doc.partes&&doc.partes[1]&&doc.partes[1].nombre)?doc.partes[1].nombre.split(" ").slice(0,2).join("_"):"";
    var _dpartes=(_dp1&&_dp2)?("_"+_dp1+"-"+_dp2):(_dp1?"_"+_dp1:"");
    var filename = (doc.titulo||"documento").replace(/[^\w\s-]/g,"").replace(/\s+/g,"_")+_dpartes+".docx";
    return {blob:blob, filename:filename};
  } catch(e) {
    throw new Error("Error generando el documento Word: "+(e&&e.message?e.message:"error desconocido"));
  }
}


// ── SPLASH SCREEN ────────────────────────────────────────────────────────────
function SplashScreen({onDone}){
  const [fade,setFade]=useState(false);
  useEffect(function(){
    var t1=setTimeout(function(){setFade(true);},2000);
    var t2=setTimeout(function(){onDone();},2600);
    return function(){clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return(
    <div style={{
      position:"fixed",inset:0,zIndex:9999,
      background:"#0a0f1a",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      opacity:fade?0:1,transition:"opacity 0.6s ease",
    }}>
      <div style={{animation:"splashPop 0.7s cubic-bezier(0.175,0.885,0.32,1.275) both",display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
        <img src={LOGO_B64} alt="DocWorks"
          style={{width:290,height:290,objectFit:"contain",filter:"drop-shadow(0 0 46px rgba(212,168,83,0.65))"}}/>
        <div style={{fontFamily:"DM Serif Display,serif",fontSize:36,color:"#f1f5f9",marginTop:-4,letterSpacing:"-0.5px"}}>DocWorks</div>
        <div style={{fontSize:13,color:"#d4a853",letterSpacing:"0.16em",textTransform:"uppercase",marginTop:6,opacity:0.9}}>Automatizá tus documentos</div>
        <div style={{marginTop:28,display:"flex",gap:8}}>
          {[0,1,2].map(function(i){return <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"rgba(212,168,83,0.8)",animation:"splashDot 1.2s "+(i*0.2)+"s ease-in-out infinite"}}/>;  })}
        </div>
      </div>
      <style>{`
        @keyframes splashPop{from{opacity:0;transform:scale(0.75)}to{opacity:1;transform:scale(1)}}
        @keyframes splashDot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1.1);opacity:1}}
      `}</style>
    </div>
  );
}

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{overflow-x:hidden;max-width:100vw;min-height:100%;}
  html{scroll-behavior:smooth;}
  body{overscroll-behavior-x:none;}
  :root{
    /* ── Color surfaces ── */
    --bg:#eef2f7;--surface:#ffffff;--card:#ffffff;--border:rgba(15,23,42,0.07);--border2:rgba(15,23,42,0.12);
    --gold:#d4a853;--gold2:#e8c06a;--gold-soft:rgba(212,168,83,0.10);--gold-line:rgba(212,168,83,0.22);
    --text:#0f172a;--muted:#3f4c5e;--dim:#64748b;
    --teal:#2dd4bf;--red:#f87171;--green:#4ade80;--amber:#fbbf24;
    --mobile-nav-h:60px;
    /* Superficies neutras (inputs, secundarios, hovers) — se recalculan en applyTheme(). */
    --surface2:rgba(15,23,42,0.035);
    --input-bg:rgba(15,23,42,0.03);
    --input-border:rgba(15,23,42,0.14);
    --hover-bg:rgba(15,23,42,0.05);
    /* ── Radios unificados (3 niveles) ── */
    --radius-sm:8px;
    --radius-md:12px;
    --radius-lg:18px;
    /* ── Tipografía (escala fija) ── */
    --font-sans:'DM Sans',sans-serif;
    --font-serif:'DM Serif Display',serif;
    --fs-xs:11px;
    --fs-sm:12.5px;
    --fs-md:14px;
    --fs-lg:16px;
    --fs-xl:20px;
    --fs-2xl:28px;
    --lh:1.5;
    /* ── Elevación ── */
    --shadow-sm:0 1px 3px rgba(15,23,42,0.06),0 1px 2px rgba(15,23,42,0.04);
    --shadow-md:0 8px 24px rgba(15,23,42,0.10);
    --shadow-lg:0 24px 64px rgba(15,23,42,0.16);
    --shadow-gold:0 4px 16px rgba(212,168,83,0.22);
    /* ── Transiciones ── */
    --ease:150ms ease;
    --ease-med:200ms ease;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font-sans);font-size:var(--fs-md);line-height:var(--lh);min-height:100vh;-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:6px;height:6px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--dim);border-radius:var(--radius-sm);}

  /* Texto gris (var(--muted) / var(--dim)) suele ir en letra muy fina y cuesta
     de leer en pantallas chicas. Se engrosa por default en todo el texto que
     use esos colores y no tenga ya un font-weight propio más marcado — los
     rótulos que ya son bold (ej. uppercase labels en 700) no se tocan porque
     su font-weight inline tiene prioridad sobre esta regla. */
  [style*="var(--muted)"], [style*="var(--dim)"], .field-hint, .field-label, .stat-lbl{font-weight:600;}

  /* ── Premium base ── */
  ::selection{background:rgba(212,168,83,0.28);color:inherit;}
  :focus-visible{outline:2px solid rgba(212,168,83,0.55);outline-offset:2px;}
  button:focus:not(:focus-visible),input:focus:not(:focus-visible),select:focus:not(:focus-visible),textarea:focus:not(:focus-visible){outline:none;}
  .eyebrow{font-size:var(--fs-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--dim);}
  .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:48px 24px;border:1px dashed var(--border2);border-radius:var(--radius-md);background:var(--surface2);}
  .empty-state-icon{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:var(--gold-soft);border:1px solid var(--gold-line);color:var(--gold);font-size:22px;margin-bottom:14px;}
  .empty-state-title{font-family:var(--font-serif);font-size:var(--fs-xl);color:var(--text);margin-bottom:6px;letter-spacing:-0.02em;}
  .empty-state-text{font-size:var(--fs-sm);color:var(--muted);max-width:360px;line-height:1.55;}

  /* ── Layout TokkoBroker style ── */
  .app-bg{position:fixed;inset:0;z-index:0;background:
    radial-gradient(1200px 600px at 10% -10%, rgba(212,168,83,0.07), transparent 55%),
    radial-gradient(900px 500px at 100% 0%, rgba(37,99,235,0.05), transparent 50%),
    var(--bg);
    transition:background 0.3s;}
  .app-wrap{position:relative;z-index:1;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;min-width:0;overflow-x:clip;}

  /* ── Topbar (navy + glass search) ── */
  .topbar{height:64px;background:linear-gradient(120deg,#091222 0%,#122a58 48%,#0c1c3d 100%);border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:16px;padding:0 22px;position:sticky;top:0;z-index:50;box-shadow:0 8px 28px rgba(0,0,0,0.28);}
  .topbar::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:linear-gradient(90deg,transparent,rgba(212,168,83,0.35),transparent);pointer-events:none;}
  .topbar-logo{display:flex;align-items:center;gap:10px;width:220px;height:100%;flex-shrink:0;overflow:hidden;}
  .topbar-logo img{height:40px;max-width:148px;width:auto;object-fit:contain;object-position:left center;display:block;filter:drop-shadow(0 0 10px rgba(212,168,83,0.28));}
  .topbar-logo-text{font-family:var(--font-serif);font-size:19px;color:#f8fafc;line-height:1;letter-spacing:-0.02em;}
  .topbar-search{flex:1;max-width:520px;position:relative;}
  .topbar-search input{width:100%;padding:10px 14px 10px 40px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:999px;color:#f8fafc;font-family:var(--font-sans);font-size:var(--fs-sm);outline:none;transition:all var(--ease);backdrop-filter:blur(10px);}
  .topbar-search input::placeholder{color:rgba(241,245,249,0.42);}
  .topbar-search input:focus{border-color:rgba(212,168,83,0.5);background:rgba(212,168,83,0.09);box-shadow:0 0 0 3px rgba(212,168,83,0.12);}
  .topbar-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:rgba(241,245,249,0.62);font-size:14px;pointer-events:auto;background:transparent;border:0;padding:0;cursor:pointer;z-index:2;}
  .topbar-right{display:flex;align-items:center;gap:12px;margin-left:auto;}
  .sesion-badge span:first-child{color:#f8fafc !important;font-size:var(--fs-sm);}
  .sesion-badge button{color:rgba(241,245,249,0.7) !important;}
  .topbar-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(145deg,var(--gold),var(--gold2));display:flex;align-items:center;justify-content:center;font-size:13px;color:#0a0f1a;font-weight:700;cursor:pointer;overflow:hidden;border:2px solid rgba(255,255,255,0.18);box-shadow:0 0 0 1px rgba(212,168,83,0.25);transition:transform var(--ease),box-shadow var(--ease);}
  .topbar-avatar:hover{transform:scale(1.04);box-shadow:0 0 0 2px rgba(212,168,83,0.35);}

  /* ── Body below topbar ── */
  .app-body{display:flex;flex:1;min-height:0;min-width:0;}

  /* ── Icon sidebar ── */
  /* ── Navegación Premium ── */
   .sidebar .nav-item{position:relative;border:1px solid transparent;border-radius:12px;margin:2px 8px;width:calc(100% - 16px);transition:all .18s ease;}
   .sidebar .nav-item:hover{background:rgba(212,168,83,.07);border-color:rgba(212,168,83,.18);transform:translateY(-1px);box-shadow:0 5px 16px rgba(15,23,42,.08);}
   .sidebar .nav-item.active{background:var(--gold-soft);border-color:var(--gold-line);box-shadow:none;}
   .sidebar .nav-item.active:before{content:"";position:absolute;left:-1px;top:8px;bottom:8px;width:3px;border-radius:0 3px 3px 0;background:linear-gradient(180deg,var(--gold2),var(--gold));}
   .sidebar .nav-item>span:first-child{position:relative;z-index:1;}
   .sidebar .nav-item .tooltip{font-weight:600;}

   .sidebar{width:68px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;align-items:center;padding:14px 0;gap:6px;position:sticky;top:64px;height:calc(100vh - 64px);overflow:visible;flex-shrink:0;z-index:40;box-shadow:1px 0 0 rgba(15,23,42,0.02);}
  .nav-item{position:relative;width:44px;height:44px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;color:var(--dim);background:transparent;border:1px solid transparent;transition:all var(--ease);flex-shrink:0;}
  .nav-item:hover{background:var(--hover-bg);color:var(--text);}
  .nav-item.active{background:var(--gold-soft);color:var(--gold);border-color:transparent;}
  .nav-item .tooltip{position:absolute;left:54px;top:50%;transform:translateY(-50%);background:#1e293b;color:#f1f5f9;font-size:12px;font-weight:500;padding:5px 10px;border-radius:7px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.15s;border:1px solid rgba(255,255,255,0.12);box-shadow:0 4px 16px rgba(0,0,0,0.4);z-index:200;}
  .nav-item:hover .tooltip{opacity:1;}
  .sidebar-spacer{flex:1;}
  .sidebar-bottom-icon{position:relative;width:44px;height:44px;border:1px solid transparent;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;color:var(--dim);background:transparent;transition:all 0.15s;}
  .sidebar-bottom-icon:hover{background:var(--hover-bg);color:var(--text);}

  /* ── Main content ── */
  .main{flex:1;min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;}
  .content{padding:28px 28px 36px;overflow-y:auto;overflow-x:hidden;flex:1;min-width:0;min-height:0;max-height:calc(100vh - 64px);-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;}
  .content > *:first-child{animation:dwFadeIn 0.28s ease both;}
  @keyframes dwFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

  /* ── Mobile top bar ── */
  .mobile-topbar{display:none;position:sticky;top:0;z-index:50;height:52px;background:var(--surface);border-bottom:1px solid var(--border);align-items:center;justify-content:space-between;padding:0 16px;}
  .mobile-topbar-logo{display:flex;align-items:center;gap:8px;}
  .mobile-logo-text{font-family:'DM Serif Display',serif;font-size:17px;color:var(--text);}
  .mobile-topbar-avatar{border:0;padding:0;flex-shrink:0;}

  /* ── Mobile bottom nav ── */
  .mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:40;height:var(--mobile-nav-h);background:var(--surface);border-top:1px solid var(--border);padding:0 2px;padding-bottom:env(safe-area-inset-bottom,0px);}
  .mobile-nav-inner{display:flex;align-items:center;height:100%;}
  .mobile-nav-item{display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 2px;border-radius:10px;border:none;background:transparent;cursor:pointer;color:var(--dim);transition:all 0.15s;min-width:0;}
  .mobile-nav-item.active{color:var(--gold);}
  .mobile-nav-item span:first-child{font-size:19px;line-height:1;}
  .mobile-nav-item span:last-child{font-size:9px;font-weight:700;text-align:center;line-height:1.15;word-break:break-word;max-width:100%;}

  /* ── Cards (tokens: radius-md/lg, shadow-sm/md, gold solo en acento) ── */
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;box-shadow:var(--shadow-sm);transition:background var(--ease-med),border-color var(--ease-med),box-shadow var(--ease-med);}
  .op-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 18px;transition:all var(--ease-med);position:relative;overflow:hidden;box-shadow:var(--shadow-sm);}
  .op-card-premium{padding:13px 15px 12px 17px;border-radius:14px;box-shadow:0 5px 18px rgba(15,23,42,.055);}
  .op-state-rail{position:absolute;left:0;top:0;bottom:0;width:5px;border-radius:14px 0 0 14px;}
  .op-state-rail.borrador{background:#f59e0b;box-shadow:0 0 14px rgba(245,158,11,.18);}
  .op-state-rail.activo{background:#22c55e;box-shadow:0 0 14px rgba(34,197,94,.16);}
  .op-state-rail.cerrado{background:#94a3b8;}
  .op-state-rail.papelera{background:#f87171;}
  .op-type-badge{font-size:11.5px;font-weight:800;padding:5px 9px;border-radius:8px;background:rgba(212,168,83,.10);color:var(--gold);border:1px solid rgba(212,168,83,.25);}
  .op-status-hero{font-size:11.5px;font-weight:850;padding:5px 10px;border-radius:8px;border:1px solid transparent;letter-spacing:.01em;}
  .op-status-hero.borrador{color:#fbbf24;background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.28);}
  .op-status-hero.activo{color:#4ade80;background:rgba(34,197,94,.10);border-color:rgba(34,197,94,.25);}
  .op-status-hero.cerrado{color:#cbd5e1;background:rgba(148,163,184,.10);border-color:rgba(148,163,184,.22);}
  .op-address-strong{font-size:15.5px;font-weight:800;line-height:1.3;color:var(--text);}
  .op-address-missing{color:#f59e0b;font-weight:800;}
  .op-card-side{min-width:148px;max-width:185px;padding-left:14px;border-left:1px solid var(--border);display:flex;flex-direction:column;gap:7px;justify-content:center;}
  .op-side-label{font-size:9.5px;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;font-weight:750;}
  .op-progress{height:5px;border-radius:20px;background:var(--surface2);overflow:hidden;border:1px solid var(--border);}
  .op-progress>span{display:block;height:100%;border-radius:20px;background:var(--gold);}

  .op-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--border2),transparent);}
  .op-card:hover{border-color:var(--gold-line);box-shadow:var(--shadow-md);}
  .stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-md);padding:18px;position:relative;overflow:hidden;transition:all var(--ease-med);box-shadow:var(--shadow-sm);}
  .stat-card:hover{border-color:var(--gold-line);transform:translateY(-1px);box-shadow:var(--shadow-md);}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2),transparent);}
  .stat-val{font-family:'DM Serif Display',serif;font-size:30px;color:var(--text);line-height:1;}
  .stat-lbl{font-size:11.5px;color:var(--dim);margin-top:3px;}
  .stat-icon{font-size:20px;margin-bottom:8px;opacity:0.8;}

  /* ── Badges ── */
  .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:var(--fs-xs);font-weight:600;}
  .badge-borrador{background:rgba(251,191,36,0.1);color:var(--amber);border:1px solid rgba(251,191,36,0.2);}
  .badge-activo{background:rgba(74,222,128,0.1);color:var(--green);border:1px solid rgba(74,222,128,0.2);}
  .badge-cerrado{background:rgba(148,163,184,0.08);color:var(--dim);border:1px solid rgba(148,163,184,0.12);}
  .badge-tipo{background:rgba(45,212,191,0.08);color:var(--teal);border:1px solid rgba(45,212,191,0.15);}
  .badge-gold{background:var(--gold-soft);color:var(--gold);border:1px solid var(--gold-line);}

  /* ── Buttons (familia clara: primary / secondary / ghost / danger) ── */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:var(--font-sans);font-size:var(--fs-sm);font-weight:600;border-radius:var(--radius-sm);cursor:pointer;transition:all var(--ease);border:none;outline:none;white-space:nowrap;}
  .btn:disabled{opacity:0.45;cursor:not-allowed;}
  .btn-primary{background:linear-gradient(135deg,#c9962a,var(--gold));color:#0a0f1a;padding:9px 16px;box-shadow:var(--shadow-gold);font-weight:700;}
  .btn-primary:hover:not(:disabled){filter:brightness(1.05);box-shadow:0 6px 20px rgba(212,168,83,0.35);transform:translateY(-1px);}
  .btn-secondary{background:var(--surface2);color:var(--text);border:1px solid var(--border2);padding:8px 14px;}
  .btn-secondary:hover:not(:disabled){background:var(--hover-bg);}
  .btn-ghost{background:transparent;color:var(--muted);padding:8px 12px;}
  .btn-ghost:hover:not(:disabled){background:var(--hover-bg);color:var(--text);}
  .btn-success{background:rgba(74,222,128,0.15);color:var(--green);border:1px solid rgba(74,222,128,0.25);padding:9px 16px;}
  .btn-success:hover:not(:disabled){background:rgba(74,222,128,0.25);}
  .btn-orange{background:rgba(251,146,60,0.15);color:#fb923c;border:1px solid rgba(251,146,60,0.25);padding:6px 12px;}
  .btn-orange:hover:not(:disabled){background:rgba(251,146,60,0.25);}
  .btn-danger{background:rgba(248,113,113,0.1);color:var(--red);border:1px solid rgba(248,113,113,0.2);padding:8px 12px;}
  .btn-danger:hover:not(:disabled){background:rgba(248,113,113,0.2);}
  .btn-sm{padding:5px 11px;font-size:var(--fs-xs);}

  /* ── Inputs ── */
  .field{display:flex;flex-direction:column;gap:5px;}
  .field-label{font-size:var(--fs-sm);font-weight:600;color:var(--muted);}
  .field-hint{font-size:var(--fs-xs);color:var(--dim);margin-top:1px;}
  .inp{width:100%;min-height:42px;padding:10px 12px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-sans);font-size:16px;outline:none;transition:all var(--ease);}
  .inp::placeholder{color:var(--dim);}
  .inp:focus{border-color:var(--gold);background:var(--gold-soft);box-shadow:0 0 0 3px rgba(212,168,83,0.12);}
  .inp:hover:not(:focus){border-color:var(--border2);}
  textarea.inp{resize:vertical;min-height:65px;}
  select.inp{cursor:pointer;}
  select.inp option{background:#1e293b;color:#f1f5f9;}

  /* ── Modal ── */
  .modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);height:100vh;height:100dvh;overflow:hidden;overscroll-behavior:contain;}
  .modal-box{background:var(--card);border:1px solid var(--border2);border-radius:var(--radius-lg);width:100%;max-height:92vh;max-height:92dvh;min-height:0;overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow-lg);}
  .modal-box.wide{max-width:700px;}
  .modal-box.narrow{max-width:460px;}
  .modal-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--card);z-index:10;border-radius:var(--radius-lg) var(--radius-lg) 0 0;}
  .modal-head > div:last-child{display:flex;align-items:center;gap:7px;flex-shrink:0;}
  .modal-title{font-family:var(--font-serif);font-size:var(--fs-lg);color:var(--text);letter-spacing:-0.02em;}
  .modal-body{padding:18px 20px 24px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;min-height:0;scroll-padding-top:18px;scroll-padding-bottom:28px;}
  .modal-body input,.modal-body textarea,.modal-body select{scroll-margin-top:18px;scroll-margin-bottom:120px;}
  .modal-close{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);font-size:15px;transition:all var(--ease);flex-shrink:0;}
  .modal-close:hover{background:var(--hover-bg);color:var(--text);}

  /* ── Operaciones: vistas, badges y filtros avanzados ── */
  .op-view-switch{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--border);border-radius:10px;background:var(--surface2);}
  .op-view-switch button{width:34px;height:30px;border:0;border-radius:7px;background:transparent;color:var(--dim);cursor:pointer;display:flex;align-items:center;justify-content:center;}
  .op-view-switch button.active{background:var(--card);color:var(--gold);box-shadow:var(--shadow-sm);}
  .op-filter-panel{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr));gap:9px;padding:11px;border:1px solid var(--border);border-radius:12px;background:var(--card);margin-top:8px;}
  .op-filter-field{display:flex;flex-direction:column;gap:4px;}
  .op-filter-field label{font-size:9.5px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;}
  .op-count-pill{display:inline-flex;align-items:center;justify-content:center;min-width:23px;padding:2px 7px;border-radius:999px;background:var(--surface2);color:var(--dim);font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace;}
  .op-status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;border:1px solid transparent;font-size:10.5px;font-weight:750;line-height:1;}
  .op-status-badge.borrador{background:rgba(245,158,11,.14);border-color:rgba(245,158,11,.28);color:#a16207;}
  .op-status-badge.activo{background:rgba(34,197,94,.14);border-color:rgba(34,197,94,.28);color:#166534;}
  .op-status-badge.cerrado{background:rgba(100,116,139,.14);border-color:rgba(100,116,139,.28);color:#475569;}
  [data-theme="dark"] .op-status-badge.borrador{color:#fbbf24;}
  [data-theme="dark"] .op-status-badge.activo{color:#86efac;}
  [data-theme="dark"] .op-status-badge.cerrado{color:#cbd5e1;}
  .op-table-wrap{border:1px solid var(--border);border-radius:14px;overflow:auto;background:var(--card);}
  .op-table{width:100%;border-collapse:collapse;min-width:760px;}
  .op-table th{padding:9px 12px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--dim);background:var(--surface2);border-bottom:1px solid var(--border);white-space:nowrap;}
  .op-table td{padding:10px 12px;border-bottom:1px solid var(--border);font-size:11.5px;color:var(--text);vertical-align:middle;}
  .op-table tr:last-child td{border-bottom:0;}
  .op-table tr:hover td{background:var(--hover-bg);}
  @media(max-width:850px){.op-filter-panel{grid-template-columns:1fr 1fr;}}
  @media(max-width:560px){.op-filter-panel{grid-template-columns:1fr;}.op-view-switch{order:2;}.op-filter-row-top{width:100%;}}

  /* ── Search ── */
  .search-wrap{position:relative;}
  .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--dim);font-size:13px;}
  .search-inp{width:100%;padding:10px 12px 10px 36px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:16px;outline:none;transition:all 0.15s;}
  .search-inp::placeholder{color:var(--dim);}
  .search-inp:focus{border-color:rgba(212,168,83,0.5);background:rgba(212,168,83,0.04);}

  /* ── Steps ── */
  .steps{display:flex;align-items:center;gap:3px;overflow-x:auto;padding-bottom:3px;-webkit-overflow-scrolling:touch;}
  .step-item{display:flex;align-items:center;gap:2px;flex-shrink:0;}
  .step-dot{display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:500;transition:all 0.15s;}
  .step-dot.done{background:rgba(74,222,128,0.12);color:var(--green);}
  .step-dot.active{background:linear-gradient(135deg,rgba(212,168,83,0.2),rgba(212,168,83,0.08));color:var(--gold);border:1px solid rgba(212,168,83,0.4);}
  .step-dot.pending{background:var(--input-bg);color:var(--dim);}
  .step-dot.flag{background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(239,68,68,0.45);}
  .step-line{width:8px;height:1px;background:var(--border2);}
  .step-line.done{background:rgba(74,222,128,0.3);}

  /* ── Tipo grid ── */
  .tipo-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .tipo-card{padding:14px;border-radius:12px;border:1.5px solid var(--border2);background:var(--input-bg);cursor:pointer;text-align:left;transition:all 0.15s;outline:none;}
  .tipo-card:hover{border-color:rgba(212,168,83,0.3);background:rgba(212,168,83,0.04);}
  .tipo-card.selected{border-color:var(--gold);background:linear-gradient(135deg,rgba(212,168,83,0.1),rgba(212,168,83,0.04));box-shadow:0 0 0 3px rgba(212,168,83,0.12);}
  .tipo-card-icon{font-size:22px;margin-bottom:6px;}
  .tipo-card-title{font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px;}
  .tipo-card-desc{font-size:11px;color:var(--dim);}

  /* ── Clausulas ── */
  .clausula-item{padding:10px 12px;border-radius:10px;border:1.5px solid var(--border);background:rgba(255,255,255,0.02);cursor:pointer;transition:all 0.15s;}
  .clausula-item:hover{border-color:var(--border2);}
  .clausula-item.selected{border-color:rgba(212,168,83,0.4);background:rgba(212,168,83,0.06);}

  /* ── Section header ── */
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;gap:12px;}
  .section-title{font-family:var(--font-serif);font-size:var(--fs-2xl);color:var(--text);letter-spacing:-0.03em;line-height:1.15;font-weight:400;}
  .section-sub{font-size:var(--fs-sm);color:var(--muted);margin-top:4px;line-height:1.45;}
  .section-sub{font-size:12.5px;color:var(--dim);margin-top:2px;}

  /* ── Grid helpers ── */
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
  .col2{grid-column:span 2;}
  .col3{grid-column:span 3;}

  /* ── Notice ── */
  .notice{padding:10px 12px;border-radius:10px;font-size:12.5px;}
  .notice-gold{background:rgba(212,168,83,0.08);border:1px solid rgba(212,168,83,0.2);color:#d4a853;}
  .notice-amber{background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.18);color:var(--amber);}
  .val-box{padding:8px 12px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:9px;font-size:13px;color:var(--gold);font-weight:500;}

  /* ── Garantía ── */
  .gar-card{padding:11px 12px;border-radius:10px;border:1.5px solid var(--border2);background:rgba(255,255,255,0.02);cursor:pointer;display:flex;align-items:center;gap:10px;transition:all 0.15s;width:100%;text-align:left;}
  .gar-card:hover{border-color:rgba(212,168,83,0.25);}
  .gar-card.selected{border-color:var(--gold);background:rgba(212,168,83,0.07);}
  .gar-check{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--dim);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
  .gar-check.on{background:var(--gold);border-color:var(--gold);}

  /* ── Document viewer: jerarquía limpia y menos ruido visual ── */
  .doc-viewer-shell{min-width:0;min-height:0;}
  .doc-viewer-tabs{display:flex;align-items:center;gap:8px;margin:0 0 14px;padding-bottom:8px;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none;}
  .doc-viewer-tabs::-webkit-scrollbar{display:none;}
  .modal-overlay-viewer{overflow:hidden!important;align-items:center!important;padding:14px!important;}
  .viewer-modal{max-width:920px!important;width:min(920px,calc(100vw - 28px));height:min(88dvh,820px);min-height:0;max-height:min(88dvh,820px);}
  .viewer-modal .modal-head{background:linear-gradient(135deg,#0f2a52,#123b72);border-bottom-color:rgba(96,165,250,.28);flex:0 0 auto;flex-wrap:nowrap!important;gap:10px;}
  .viewer-modal .modal-title{color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:min(340px,42vw);}
  .viewer-modal .modal-body{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;overflow:hidden!important;overflow-x:hidden;padding:14px 18px 16px;}
  .viewer-modal .doc-viewer-shell{height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;}
  .viewer-modal .doc-viewer-tabs{flex:0 0 auto;position:relative;z-index:4;background:var(--card);padding-bottom:8px;}
  .viewer-modal .doc-viewer-tab-content{flex:1 1 auto;min-height:0;overflow:hidden;display:flex;flex-direction:column;}
  .viewer-modal .doc-reading-scroll{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable;padding-right:3px;}
  .viewer-modal .doc-reading-scroll>.pdf-preview{margin-bottom:6px;}
  .viewer-modal .doc-summary-panel{min-height:0;overflow:visible;}
  .viewer-modal .doc-ficha-panel{min-height:0;overflow:hidden;}
  .viewer-modal .doc-ficha-panel > div:nth-child(2){flex:0 0 auto;}
  .viewer-modal .doc-viewer-tab-content.doc-tab-static{overflow:visible;min-height:0;}
  .viewer-modal .doc-viewer-tab-content.doc-tab-static>*{flex:0 0 auto;min-height:0;}
  .viewer-modal .doc-viewer-shell>*{max-width:100%;}
  .doc-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:nowrap;min-width:0;}
  .doc-header-actions .btn{min-height:34px;}
  .viewer-modal .doc-header-actions .doc-action{display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:9px;font-weight:700;letter-spacing:.01em;}
  .viewer-modal .doc-header-actions .doc-action svg{flex:0 0 auto;color:currentColor;stroke:currentColor;}
  .viewer-modal .doc-header-actions .doc-action-edit,
  .viewer-modal .doc-header-actions .doc-action-share{background:rgba(255,255,255,.10)!important;border:1px solid rgba(255,255,255,.24)!important;color:#fff!important;}
  .viewer-modal .doc-header-actions .doc-action-edit:hover:not(:disabled),
  .viewer-modal .doc-header-actions .doc-action-share:hover:not(:disabled){background:rgba(255,255,255,.17)!important;color:#fff!important;}
  .viewer-modal .doc-header-actions .doc-action-download{height:34px;padding:0 10px;background:linear-gradient(135deg,#c9962a,var(--gold),var(--gold2));border:1px solid rgba(255,255,255,.18);color:#08111f;box-shadow:0 2px 12px rgba(212,168,83,.24);font:700 11.5px 'DM Sans',sans-serif;cursor:pointer;}
  .viewer-modal .doc-header-actions .doc-action-download:hover{filter:brightness(1.05);}
  .doc-download-wrap{position:relative;flex:0 0 auto;}
  .doc-download-chevron{font-size:12px;line-height:1;margin-left:1px;transform:translateY(-1px);}
  .doc-download-menu{position:absolute;right:0;top:calc(100% + 6px);width:255px;padding:6px;background:#13233b;border:1px solid rgba(255,255,255,.14);border-radius:12px;box-shadow:0 16px 44px rgba(0,0,0,.42);z-index:500;}
  .doc-download-item{width:100%;display:flex;align-items:flex-start;gap:9px;padding:10px 11px;border:0;border-radius:9px;background:transparent;color:#fff;text-align:left;cursor:pointer;font-family:'DM Sans',sans-serif;}
  .doc-download-item:hover{background:rgba(255,255,255,.08);}
  .doc-download-item svg{color:var(--gold)!important;stroke:var(--gold)!important;margin-top:1px;flex:0 0 auto;}
  .doc-download-item span{display:flex;flex-direction:column;min-width:0;}
  .doc-download-item b{font-size:12px;line-height:1.2;color:#fff;}
  .doc-download-item small{font-size:9.8px;line-height:1.35;color:#9fb1c8;margin-top:2px;}
  .viewer-modal .modal-close{background:rgba(255,255,255,.10)!important;border-color:rgba(255,255,255,.28)!important;color:#fff!important;}
  .viewer-modal .modal-close:hover{background:rgba(255,255,255,.18)!important;color:#fff!important;}
  .doc-viewer-export-block{display:none!important;}
  .doc-bottom-tabs{display:none;}
  .doc-bottom-tab{display:none;}
  .doc-bottom-tab.active{border-color:rgba(96,165,250,.45);background:rgba(96,165,250,.11);color:#60a5fa;}
  .doc-bottom-tab-icon{font-size:12px;}
  .reserva-compact-summary{margin-bottom:12px;}
  .reserva-status-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid rgba(74,222,128,.22);background:rgba(74,222,128,.045);border-radius:10px;}
  .reserva-status-label{font-size:9.5px;color:var(--dim);font-weight:700;text-transform:uppercase;letter-spacing:.08em;}
  .reserva-status-value{font-size:12.5px;font-weight:700;margin-top:2px;}
  .reserva-status-value.ok{color:var(--green);}
  .reserva-status-value.pending{color:var(--gold);}
  .reserva-status-next{text-align:right;font-size:10.5px;color:var(--dim);} .reserva-status-next b{display:block;color:var(--text);font-size:11.5px;margin-top:2px;}
  .reserva-mini-timeline{display:flex;gap:8px;overflow-x:auto;padding:8px 1px 1px;scrollbar-width:none;}
  .reserva-mini-timeline::-webkit-scrollbar{display:none;}
  .reserva-mini-event{display:flex;align-items:flex-start;gap:6px;min-width:145px;padding:7px 9px;border:1px solid var(--border);border-radius:9px;background:rgba(255,255,255,.018);}
  .reserva-mini-dot{width:7px;height:7px;border-radius:50%;background:var(--green);margin-top:5px;flex-shrink:0;}
  .reserva-mini-date{font-size:9.5px;color:var(--dim);}
  .reserva-mini-title{font-size:10.5px;font-weight:700;color:var(--text);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .reserva-decision-panel{padding:14px;margin-bottom:12px;border:1px solid rgba(96,165,250,.20);background:linear-gradient(135deg,rgba(37,99,235,.06),transparent);}
  .reserva-decision-title{font-size:12px;font-weight:700;color:var(--text);}
  .reserva-decision-sub{font-size:10.5px;color:var(--dim);margin-top:3px;margin-bottom:10px;}
  .reserva-decision-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;}
  .reserva-rechazo-confirm{padding:11px;border-radius:9px;background:rgba(239,68,68,.055);border:1px solid rgba(239,68,68,.18);}
  .reserva-rechazo-question{font-size:12.5px;font-weight:700;color:var(--text);margin-bottom:4px;}
  .reserva-rechazo-help{font-size:10.5px;color:var(--dim);line-height:1.45;margin-bottom:9px;}
  .reserva-decision-message{margin-top:8px;font-size:10.5px;color:var(--green);}

  .doc-summary-panel{min-width:0;}
  .doc-summary-panel .op-clean-card{background:transparent !important;border:0 !important;border-bottom:1px solid var(--border) !important;border-radius:0 !important;box-shadow:none !important;padding:0 0 18px !important;margin-bottom:18px !important;}
  .doc-summary-panel .op-clean-card:last-of-type{border-bottom:0 !important;}
  .op-detail-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--border);}
  .op-detail-title{font-family:'DM Serif Display',serif;font-size:22px;line-height:1.15;color:var(--text);}
  .op-detail-meta{font-size:11px;color:var(--dim);margin-top:4px;line-height:1.45;}
  @media(max-width:780px){.cuenta-config-grid{grid-template-columns:1fr!important;}}
  .negociacion-panel{overflow:visible!important;max-height:none!important;height:auto!important;}
  .negociacion-panel .reserva-decision-actions,.negociacion-panel .grid2{overflow:visible!important;max-height:none!important;height:auto!important;}
  @media(max-width:640px){.op-detail-hero{align-items:stretch;flex-direction:column;}.op-detail-title{font-size:19px;}.doc-viewer-tabs{margin-left:-2px;margin-right:-2px;}
    .viewer-modal{width:100%!important;max-width:100%!important;height:calc(100dvh - 24px)!important;min-height:0!important;max-height:calc(100dvh - 24px)!important;}
    .viewer-modal .modal-head{padding:12px 14px;}
    .viewer-modal .modal-body{padding:12px 12px 14px;}
    .viewer-modal .doc-reading-scroll{padding-right:0;}
    .viewer-modal .modal-title{max-width:34vw;}
    .doc-header-actions{width:auto;justify-content:flex-end;flex-wrap:nowrap;min-width:0;}
    .doc-header-actions .btn,.doc-header-actions .doc-action-download{min-height:36px;}
    .doc-header-actions .doc-action{padding:6px 8px;}
    .doc-header-actions .doc-action span{font-size:10.5px;}
    .doc-header-actions .doc-action svg{width:13px;height:13px;}
    .doc-download-menu{left:0;right:auto;width:min(255px,calc(100vw - 42px));}
    .reserva-decision-actions{grid-template-columns:1fr;}
  }

  /* ── PDF preview: ventana Mac dentro del área de lectura ── */
   .pdf-preview{background:#1e293b;border:1px solid rgba(96,165,250,.45);border-radius:14px;padding:10px;box-shadow:0 10px 34px rgba(15,42,82,.16);display:flex;flex-direction:column;min-height:0;}
   .pdf-chrome{display:flex;align-items:center;gap:5px;margin:0;padding:4px 5px 9px;flex:0 0 auto;position:sticky;top:0;z-index:3;background:#1e293b;border-radius:9px;}
   .pdf-dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto;}
   .pdf-content{background:white;border-radius:9px;padding:12px;max-height:none;overflow:auto;min-height:0;flex:1 1 auto;box-shadow:0 1px 0 rgba(255,255,255,.5) inset;}
   .pdf-content-lg{max-height:none;padding:18px 16px;}
   .doc-reading-scroll{display:flex;flex-direction:column;min-height:0;overflow:hidden;}
   .doc-reading-scroll>.pdf-preview{height:100%;min-height:0;}
   .doc-reading-scroll>.pdf-preview>.pdf-content{min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable;}
   @media (max-width:640px){ .pdf-content-lg{max-height:none;padding:14px 12px;} .pdf-content-lg .pdf-text{font-size:12px;} }
   .monto-tag{font-family:'DM Serif Display',serif;font-size:16px;color:var(--gold);}

   /* ── Dropdown ── */
  .dropdown-menu{position:absolute;right:0;top:calc(100% + 4px);width:168px;background:#1e293b;border:1px solid var(--border2);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.5);z-index:50;overflow:hidden;}
  .dropdown-item{display:block;width:100%;text-align:left;padding:11px 14px;font-size:13px;color:#cbd5e1;background:transparent;border:none;cursor:pointer;transition:all 0.1s;font-family:'DM Sans',sans-serif;}
  .dropdown-item:hover{background:rgba(255,255,255,0.08);color:#f1f5f9;}
  .dropdown-item.red{color:#f87171;}
  .dropdown-item.red:hover{background:rgba(248,113,113,0.12);}
  .var-picker-menu{width:280px;overflow-y:auto;background:#1e293b;border:1px solid var(--border2);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.5);z-index:200;padding:6px;}
  .var-picker-group{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;padding:8px 8px 4px;}
  .var-picker-item{display:block;width:100%;text-align:left;padding:8px 9px;border-radius:8px;font-size:12.5px;color:#cbd5e1;background:transparent;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
  .var-picker-item:hover{background:rgba(212,168,83,0.15);color:var(--gold);}
  .tipo-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:8px;font-size:11.5px;cursor:pointer;border:1px solid var(--border2);background:var(--card);color:var(--muted);user-select:none;transition:all 0.12s;}
  .tipo-chip.on{border-color:var(--gold);background:rgba(212,168,83,0.1);color:var(--gold);}

  /* ── Logo upload ── */
  .logo-upload{height:68px;width:112px;border:2px dashed var(--border2);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;}
  .logo-upload:hover{border-color:var(--gold);background:rgba(212,168,83,0.04);}
  .logo-preview{height:68px;width:112px;border-radius:10px;border:1px solid var(--border2);object-fit:contain;padding:5px;background:rgba(255,255,255,0.03);}

  /* ── FAB (mobile new op button) ── */
  .fab{display:none;position:fixed;bottom:calc(var(--mobile-nav-h) + 14px);right:16px;z-index:39;width:54px;height:54px;border-radius:50%;background:linear-gradient(145deg,#c9962a,var(--gold));border:1px solid rgba(255,255,255,0.2);cursor:pointer;font-size:24px;color:#0a0f1a;box-shadow:var(--shadow-gold),0 10px 28px rgba(15,23,42,0.18);align-items:center;justify-content:center;transition:all var(--ease-med);}
  .fab:hover{transform:translateY(-2px) scale(1.03);filter:brightness(1.04);}
  .fab:active{transform:scale(0.98);}
  .fab:hover{transform:scale(1.08);}

  @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes diskpulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  .fade-up{animation:fadeUp 0.25s ease backwards;}

  /* ── Cuenta: sub-tabs + preview ── */
  .cuenta-subtabs{display:flex;gap:6px;margin-bottom:18px;border-bottom:1px solid var(--border);overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .cuenta-subtabs::-webkit-scrollbar{display:none;}
  .cuenta-subtab{flex:0 0 auto;padding:9px 13px;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--muted);font:500 12px 'DM Sans',sans-serif;cursor:pointer;white-space:nowrap;}
  .cuenta-subtab.active{color:var(--gold);border-bottom-color:var(--gold);background:var(--card);border-radius:8px 8px 0 0;}
  .cuenta-doc-preview-wrap{margin-top:4px;}
  .cuenta-doc-preview-label{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:10.5px;color:var(--dim);margin-bottom:8px;}
  .cuenta-doc-page{width:min(100%,620px);aspect-ratio:210/297;margin:0 auto;background:#fff;color:#334155;border:1px solid #d7dce3;border-radius:5px;box-shadow:0 10px 30px rgba(0,0,0,.20);position:relative;overflow:hidden;display:flex;flex-direction:column;}
  .cuenta-doc-logo-row{padding:18px 28px 8px;flex:0 0 auto;min-height:24px;}
  .cuenta-doc-header{padding:22px 28px 16px;flex:0 0 auto;}
  .cuenta-doc-body{padding:24px 28px;flex:1;overflow:hidden;}
  .cuenta-doc-footer{padding:0 28px 15px;flex:0 0 auto;color:#7b8490;font-size:8px;}
  .cuenta-doc-footer-line{height:1px;background:#cbd0d6;margin-bottom:7px;}
  .cuenta-doc-footer-row{display:flex;justify-content:space-between;gap:10px;}
  .cuenta-doc-footer-note{margin-top:5px;line-height:1.35;text-align:left;}
  .cuenta-preview-editor{display:grid;grid-template-columns:minmax(300px,390px) minmax(0,1fr);gap:20px;align-items:start;}
  .cuenta-preview-controls{position:sticky;top:12px;max-height:calc(100vh - 36px);overflow:auto;}
  .preview-control-section{padding:14px 0;border-top:1px solid var(--border);}
  .preview-control-section:first-of-type{border-top:0;padding-top:0;}
  .preview-control-title{font-size:11px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;}
  .cuenta-preview-paper-card{min-width:0;}
  .cuenta-config-grid{min-width:0;}
  .cuenta-dashboard-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:20px;}
  .cuenta-dashboard-stats{display:flex;align-items:stretch;gap:8px;flex-wrap:wrap;justify-content:flex-end;}
  .cuenta-dashboard-stat{min-width:126px;padding:9px 11px;border:1px solid rgba(212,168,83,.18);border-radius:12px;background:rgba(255,255,255,.024);display:flex;align-items:center;gap:9px;}
  .cuenta-dashboard-stat-active{border-color:rgba(16,185,129,.18);background:rgba(16,185,129,.035);}
  .cuenta-dashboard-stat-team{border-color:rgba(89,199,243,.18);background:rgba(89,199,243,.035);}
  .cuenta-dashboard-stat-icon{width:27px;height:27px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(212,168,83,.08);color:var(--gold);font-size:13px;flex-shrink:0;}
  .cuenta-dashboard-stat-active .cuenta-dashboard-stat-icon{background:rgba(16,185,129,.10);color:var(--green);}
  .cuenta-dashboard-stat-team .cuenta-dashboard-stat-icon{background:rgba(89,199,243,.10);color:var(--teal);}
  .cuenta-dashboard-stat-label{font-size:8.8px;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;line-height:1.1;}
  .cuenta-dashboard-stat-value{font:700 18px 'DM Serif Display',serif;color:var(--text);line-height:1;margin-top:3px;}
  .cuenta-save-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border:1px solid rgba(16,185,129,.18);border-radius:999px;background:rgba(16,185,129,.06);color:var(--green);font:650 9.5px 'DM Sans',sans-serif;white-space:nowrap;}
  .cuenta-save-panel{margin-top:18px;padding:13px 14px;border:1px solid rgba(212,168,83,.18);border-radius:13px;background:linear-gradient(90deg,rgba(212,168,83,.065),rgba(255,255,255,.018));display:flex;align-items:center;justify-content:space-between;gap:16px;}
  .cuenta-save-title{font-size:11px;font-weight:750;color:var(--text);margin-bottom:2px;}
  .cuenta-save-copy{font-size:9.8px;color:var(--dim);line-height:1.45;max-width:620px;}
  .cuenta-save-state{display:inline-flex;align-items:center;gap:5px;color:var(--gold);font-size:10.4px;font-weight:650;white-space:nowrap;}
  .cuenta-save-state.saved{color:var(--green);}
  .cuenta-save-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:diskpulse 1s ease-in-out infinite;}
  .cuenta-save-error{margin-top:5px;color:var(--red);font-size:9.7px;line-height:1.35;}
  @media(max-width:900px){.cuenta-config-grid{grid-template-columns:1fr !important;}}
  @media(max-width:1100px){.cuenta-info-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important;}}
  @media(max-width:640px){.cuenta-info-grid{grid-template-columns:1fr !important;}}
  @media(max-width:640px){.cuenta-config-grid{gap:10px;}.cuenta-config-grid .card{padding:14px !important;}.cuenta-config-grid input,.cuenta-config-grid select,.cuenta-config-grid textarea{max-width:100%;}}
  @media(max-width:900px){.cuenta-main-grid{grid-template-columns:1fr !important;}.cuenta-dashboard-head{grid-template-columns:1fr !important;}.cuenta-dashboard-stats{justify-content:flex-start;}}
  @media(max-width:640px){.cuenta-profile-card{border-radius:14px !important;}.cuenta-profile-card > div{padding-left:14px !important;padding-right:14px !important;}.cuenta-profile-card .cuenta-info-grid{grid-template-columns:1fr !important;}.cuenta-profile-card .cuenta-info-grid > div[style*="grid-column"]{grid-column:span 1 !important;justify-content:stretch !important;}.cuenta-profile-card .cuenta-info-grid button{width:100% !important;}.cuenta-dashboard-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;}.cuenta-dashboard-stat{min-width:0;padding:8px 8px;}.cuenta-dashboard-stat-label{font-size:8px;}.cuenta-dashboard-stat-value{font-size:16px;}.cuenta-save-panel{align-items:stretch;flex-direction:column;}.cuenta-save-panel > div:last-child{width:100%;justify-content:space-between;}.cuenta-save-panel > div:last-child button{flex:1;}}


  /* ── Two-col layout (Cláusulas, Cuenta) ── */
  .two-col-layout{display:grid;grid-template-columns:1fr 1.4fr;gap:22px;align-items:start;}

  /* ═══════════════════════════════════════════
     RESPONSIVE — tablet ≤ 900px
  ═══════════════════════════════════════════ */
  .plantilla-appearance-grid{min-width:0;}
  .plantilla-appearance-grid .cuenta-doc-preview-wrap{max-width:100%;}
  @media(max-width:900px){.plantilla-appearance-grid{grid-template-columns:1fr !important;}.plantilla-appearance-grid .card{position:static !important;}}
  @media(max-width:900px){.plantilla-appearance-grid{grid-template-columns:1fr !important;}.cuenta-preview-controls{position:static;max-height:none;}}
  @media(max-width:900px){
    .sidebar{width:56px;}
    .content{padding:18px;}
    .grid2{grid-template-columns:1fr 1fr;}
  }
  /* ═══════════════════════════════════════════
     RESPONSIVE — mobile ≤ 640px
  ═══════════════════════════════════════════ */
  @media(max-width:640px){
    .cuenta-doc-page{width:100%;border-radius:4px;box-shadow:0 6px 20px rgba(0,0,0,.18);}
    .cuenta-doc-logo-row{padding:12px 16px 6px;}
    .cuenta-doc-header{padding:14px 16px 12px;}
    .cuenta-doc-body{padding:16px;}
    .cuenta-doc-footer{padding:0 16px 10px;}
    .cuenta-doc-preview-label{font-size:9.5px;}
    .cuenta-subtab{font-size:11px;padding:8px 10px;}
    .cuenta-preview-editor{grid-template-columns:1fr;}
    .cuenta-preview-controls{position:static;max-height:none;overflow:visible;}
    .topbar{display:none !important;}
    .app-body{flex-direction:column;min-height:0;flex:1 0 auto;}
    .sidebar{display:none !important;}
    .mobile-topbar{display:flex !important;}
    .sesion-badge{display:none !important;}
    .mobile-nav{display:block !important;}
    .fab{display:flex !important;}

    /* Main layout: full width, bottom nav clearance */
    .main{min-height:calc(100dvh - 52px);min-height:calc(100svh - 52px);overflow:visible;}
    .content{padding:12px 12px calc(var(--mobile-nav-h) + 28px + env(safe-area-inset-bottom,0px)) 12px;max-height:none;min-height:calc(100dvh - 52px);min-height:calc(100svh - 52px);overflow:visible;-webkit-overflow-scrolling:touch;overscroll-behavior-y:auto;}

    /* Hide the "+ Nueva operación" button inside section-header on mobile
       (already in mobile topbar and FAB) */
    .section-header .btn-nueva{display:none !important;}

    /* Grids */
    .grid2{grid-template-columns:1fr;}
    .grid3{grid-template-columns:1fr;}
    .col2{grid-column:span 1;}
    .col3{grid-column:span 1;}

    /* Estado tabs: scroll horizontally instead of wrapping */
    .estado-tabs{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;white-space:nowrap;padding-bottom:2px;overscroll-behavior-x:contain;touch-action:pan-x;}
    .estado-tabs button{display:inline-flex;flex-shrink:0;}

    /* Filter row: search full width, dropdown full width */
    .filter-row{flex-direction:column;gap:8px;}
    .filter-row .search-wrap{width:100%;}
    .filter-row select{width:100%;}

    /* Op cards: actions always visible, no overflow */
    .op-card{padding:12px;}
    .op-card-actions{flex-wrap:wrap;gap:6px;}
    .op-card-actions .btn-pdf-text{display:none;}

    /* Section header */
    .section-header{flex-wrap:wrap;gap:8px;}
    .section-title{font-size:19px;}
    .section-sub{font-size:12px;}

    /* Modal full-screen bottom sheet */
    .modal-overlay{padding:0;align-items:flex-end;height:100dvh;min-height:100dvh;height:100svh;min-height:100svh;}
    @supports (height: 100dvh){.modal-overlay{height:100dvh;min-height:100dvh;}}
    .modal-box,.modal-box.wide,.modal-box.narrow{max-width:100%;width:100%;min-height:0;border-radius:20px 20px 0 0;max-height:calc(100dvh - env(safe-area-inset-top,0px));max-height:calc(100svh - env(safe-area-inset-top,0px));}
    @supports (height: 100dvh){.modal-box,.modal-box.wide,.modal-box.narrow{max-height:calc(100dvh - env(safe-area-inset-top,0px));}}
    .modal-body{padding:16px 16px calc(32px + env(safe-area-inset-bottom,0px));overscroll-behavior-y:contain;touch-action:pan-y;}
    .modal-head{border-radius:20px 20px 0 0;}

    /* Pie de formularios: siempre visible y usable sobre pantallas angostas. */
    .modal-body .btn{min-height:38px;}
    .modal-body > form{min-width:0;}
    .modal-body [style*="justify-content:space-between"]{min-width:0;}

    /* Las pestañas de Configuración se recorren lateralmente sin arrastrar
       toda la página hacia arriba o abajo en pantallas táctiles. */
    .settings-tabs{overflow-y:hidden !important;overscroll-behavior-x:contain;touch-action:pan-x;}

    /* Steps: hide labels */
    .step-dot span:last-child{display:none;}
    .step-dot{padding:4px 7px;}

    /* Stat cards: 2 col */
    .stats-grid{grid-template-columns:1fr 1fr !important;}
    .stat-val{font-size:24px;}
    .stat-card{padding:14px;}

    /* Two-col layouts */
    .two-col-layout{grid-template-columns:1fr !important;}

    /* Tipo grid 2 col */
    .tipo-grid{grid-template-columns:1fr 1fr;}

    /* Evita que elementos internos generen una segunda página horizontal. */
    img,video,canvas,svg{max-width:100%;}
    textarea,.inp,input,select{max-width:100%;}
  }
`;

function GStyles() {
  useEffect(function(){
    var s=document.getElementById("dci-styles");
    if(!s){s=document.createElement("style");s.id="dci-styles";document.head.appendChild(s);}
    s.textContent=GS;
  },[]);
  return null;
}

function Btn({children,onClick,v,s,disabled,className,type}){
  return <button type={type||"button"} onClick={onClick} disabled={disabled} className={"btn btn-"+(v||"primary")+(s?" btn-"+s:"")+(className?" "+className:"")}>{children}</button>;
}
function Field({label,hint,children,className}){
  return <div className={"field "+(className||"")}>{label&&<label className="field-label">{label}</label>}{children}{hint&&<span className="field-hint">{hint}</span>}</div>;
}
function Inp({label,hint,error,className,...props}){
  return <Field label={label} hint={hint} className={className}><input className="inp" {...props}/>{error&&<span style={{fontSize:11,color:"var(--red)"}}>{error}</span>}</Field>;
}
function Txa({label,hint,rows,className,...props}){
  return <Field label={label} hint={hint} className={className}><textarea className="inp" rows={rows||3} {...props}/></Field>;
}
function Slt({label,hint,className,children,...props}){
  return <Field label={label} hint={hint} className={className}><select className="inp" {...props}>{children}</select></Field>;
}

const TIPO_BG={reserva:"rgba(59,130,246,0.12)",boleto:"rgba(139,92,246,0.12)",reserva_alquiler:"rgba(251,146,60,0.12)",alquiler:"rgba(45,212,191,0.12)"};
const TIPO_FG={reserva:"#60a5fa",boleto:"#a78bfa",reserva_alquiler:"#fb923c",alquiler:"var(--teal)"};

function Modal({open,onClose,title,children,wide,formTipo,headerExtra,headerRight,viewerMode,closeOnBackdrop=true}){
  if(!open)return null;
  return(
    <div className={"modal-overlay"+(viewerMode?" modal-overlay-viewer":"")} onClick={function(e){if(closeOnBackdrop && e.target===e.currentTarget)onClose();}}>
      <div className={"modal-box fade-up "+(wide?"wide":"narrow")+(viewerMode?" viewer-modal":"")}>
        <div className="modal-head" style={(headerExtra||headerRight)?{flexWrap:"wrap",rowGap:8}:undefined}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",rowGap:8,minWidth:0,flex:1}}>
            <span className="modal-title">{title}</span>
            {formTipo&&TIPOS[formTipo]&&<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:20,background:TIPO_BG[formTipo]||"rgba(212,168,83,0.1)",color:TIPO_FG[formTipo]||"var(--gold)",fontSize:11,fontWeight:600,border:"1px solid "+(TIPO_FG[formTipo]||"var(--gold)")+"44"}}>{TIPO_ICON[formTipo]} {TIPOS[formTipo]}</span>}
            {headerExtra}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,marginLeft:"auto",flexShrink:0}}>{headerRight}<button className="modal-close" onClick={onClose} aria-label="Cerrar"><DWIcon name="close" size={13} strokeWidth={2}/></button></div>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Confirmación propia en vez de window.confirm(): dentro de un WebView/app
// embebida (o de un preview sandboxeado) el diálogo nativo del navegador
// puede no dispararse o devolver siempre "cancelado" sin que se note — eso
// hacía que "Eliminar" pareciera no funcionar. Este modal corre 100% en React
// y no depende de ninguna API nativa del navegador.
function ConfirmModal({open,title,message,confirmLabel,cancelLabel,danger,onConfirm,onCancel}){
  if(!open)return null;
  return(
    <div className="modal-overlay" style={{zIndex:400}} onClick={function(e){if(e.target===e.currentTarget)onCancel();}}>
      <div className="modal-box narrow fade-up" style={{maxWidth:380}}>
        <div className="modal-head">
          <span className="modal-title">{title||"Confirmar"}</span>
          <button className="modal-close" onClick={onCancel} aria-label="Cerrar"><DWIcon name="close" size={13} strokeWidth={2}/></button>
        </div>
        <div className="modal-body">
          <div style={{fontSize:14,color:"var(--muted)",lineHeight:1.5,marginBottom:18}}>{message}</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn v="secondary" s="sm" onClick={onCancel}>{cancelLabel||"Cancelar"}</Btn>
            <Btn v={danger?"danger":"primary"} s="sm" onClick={onConfirm}>{confirmLabel||"Confirmar"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS_COMPRA=[{id:1,l:"Tipo"},{id:2,l:"Comprador"},{id:3,l:"Vendedor"},{id:4,l:"Inmueble"},{id:5,l:"Económico"},{id:6,l:"Cláusulas"}];
const STEPS_ALQUILER=[{id:1,l:"Tipo"},{id:2,l:"Locador"},{id:3,l:"Locatario"},{id:4,l:"Inmueble"},{id:5,l:"Condiciones"},{id:6,l:"Garantía"},{id:7,l:"Cláusulas"}];
const STEPS_RES_ALQ=[{id:1,l:"Tipo"},{id:2,l:"Locatario"},{id:3,l:"Locador"},{id:4,l:"Inmueble"},{id:5,l:"Condiciones"},{id:6,l:"Cláusulas"}];
const STEPS_SIMPLE=[{id:1,l:"Tipo"},{id:2,l:"Parte A"},{id:3,l:"Parte B"},{id:4,l:"Datos"},{id:5,l:"Cláusulas"}];
// Etiquetas de partes según el tipo de documento "simple" (comodato,
// autorización de venta, refuerzo, devolución). La autorización identifica
// automáticamente a la inmobiliaria como parte autorizada, sin pedir un interesado.
var PARTES_SIMPLE_LABELS = {
  comodato:            ["Comodatario","Comodante"],
  exclusividad:        ["Inmobiliaria","Propietario"],
  refuerzo_reserva:    ["Comprador","Vendedor"],
  devolucion_reserva:  ["Comprador","Vendedor"],
};
function getSteps(t){
  if(t==="alquiler") return STEPS_ALQUILER;
  if(t==="reserva_alquiler") return STEPS_RES_ALQ;
  if(["comodato","exclusividad","refuerzo_reserva","devolucion_reserva"].includes(t)){
    var labels=PARTES_SIMPLE_LABELS[t]||["Parte A","Parte B"];
    return STEPS_SIMPLE.map(function(s){
      if(s.id===2) return {id:2,l:labels[0]};
      if(s.id===3) return {id:3,l:labels[1]};
      return s;
    });
  }
  return STEPS_COMPRA;
}

function IdentificacionField({value,onChange,placeholder,className,labelSuffix}){
  var limpio=String(value||"").replace(/\D/g,"");
  var tipo=tipoIdentificacion(value);
  var dniActivo=tipo==="DNI";
  var cuitActivo=tipo==="CUIT";
  function Chip({label,active}){
    return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:8,border:"1px solid "+(active?"var(--gold)":"var(--border2)"),background:active?"rgba(212,168,83,0.14)":"transparent",color:active?"var(--gold)":"var(--dim)",fontSize:10.5,fontWeight:active?700:500}}>{label}</span>;
  }
  return <Field className={className}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:5}}>
      <label className="field-label" style={{marginBottom:0}}>{tipo+(labelSuffix||"")}</label>
      <div style={{display:"flex",gap:5,flexShrink:0}}><Chip label="DNI" active={dniActivo}/><Chip label="CUIT" active={cuitActivo}/></div>
    </div>
    <input className="inp" value={value||""} onChange={onChange} placeholder={placeholder}/>
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
function fechaHoyISO(){ return new Date().toISOString().slice(0,10); }
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
      <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:3}}>{titulo}</div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Completá los datos de {titulo.toLowerCase()}.</p>
      <div className="grid2">
        <Inp label="Nombre completo / Razón social" value={f("nombre")} onChange={function(e){onChange(prefix+"_nombre",capitalizarNombrePropio(e.target.value));}} onBlur={onBlurNombre} placeholder="Juan Pérez" className="col2" {...estiloCampoFaltante(faltantes,prefix+"_nombre")}/>
        <IdentificacionField value={f("dni")} onChange={s("dni")} placeholder="20-12345678-9"/>
        <Inp label="Domicilio" value={f("domicilio")} onChange={s("domicilio")} placeholder="Av. Corrientes 1234, CABA" className="col2"/>
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
                <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Co-titular {i+2}</div>
                <button onClick={function(){quitarCotitular(i);}} style={{background:"none",border:"none",color:"var(--red)",cursor:"pointer",fontSize:12}}>✕ Quitar</button>
              </div>
              <div className="grid2">
                <Inp label="Nombre completo" value={p.nombre||""} onChange={function(e){actualizarCotitular(i,"nombre",capitalizarNombrePropio(e.target.value));}} onBlur={onBlurNombreCotitular(i)} placeholder="María Gómez" className="col2"/>
                <IdentificacionField value={p.dni||""} onChange={function(e){actualizarCotitular(i,"dni",e.target.value);}} placeholder="27-98765432-1"/>
                <Inp label="Domicilio (si es distinto)" value={p.domicilio||""} onChange={function(e){actualizarCotitular(i,"domicilio",e.target.value);}} placeholder="Dejalo vacío si es el mismo" className="col2"/>
              </div>
            </div>
          );
        })}
        {cotitulares.length>0&&<div style={{fontSize:10.5,color:"var(--dim)"}}>Los nombres, DNI y domicilios se combinan automáticamente en el documento generado (ej. «Juan Pérez y María Gómez»).</div>}
      </div>
    </div>
  );
}

function StepInmobiliariaAutorizada({data,perfil}){
  var nombre=data.comprador_nombre||perfil.nombre||"Sin nombre configurado";
  var cuit=data.comprador_dni||perfil.cuit||"";
  var matricula=perfil.matricula||"";
  var domicilio=data.comprador_domicilio||perfil.direccion||"";
  var email=data.comprador_email||perfil.email||"";
  var telefono=data.comprador_telefono||perfil.telefono||"";
  return(
    <div>
      <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:3}}>Inmobiliaria autorizada</div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Estos datos se cargan automáticamente desde Configuración → Mi cuenta. No hace falta completar nuevamente los datos de tu inmobiliaria.</p>
      <div style={{padding:"16px 18px",borderRadius:14,border:"1px solid rgba(212,168,83,.22)",background:"linear-gradient(135deg,rgba(212,168,83,.08),transparent)",display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
        <div style={{gridColumn:"1 / -1"}}>
          <div style={{fontSize:10.5,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Razón social / nombre comercial</div>
          <div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{nombre}</div>
        </div>
        {cuit&&<div><div style={{fontSize:10.5,color:"var(--dim)",marginBottom:4}}>CUIT</div><div style={{fontSize:12.5,color:"var(--text)"}}>{cuit}</div></div>}
        {matricula&&<div><div style={{fontSize:10.5,color:"var(--dim)",marginBottom:4}}>Matrícula</div><div style={{fontSize:12.5,color:"var(--text)"}}>{matricula}</div></div>}
        {domicilio&&<div style={{gridColumn:"1 / -1"}}><div style={{fontSize:10.5,color:"var(--dim)",marginBottom:4}}>Domicilio</div><div style={{fontSize:12.5,color:"var(--text)"}}>{domicilio}</div></div>}
        {email&&<div><div style={{fontSize:10.5,color:"var(--dim)",marginBottom:4}} >Correo electrónico</div><div style={{fontSize:12.5,color:"var(--text)"}}>{email}</div></div>}
        {telefono&&<div><div style={{fontSize:10.5,color:"var(--dim)",marginBottom:4}}>Teléfono</div><div style={{fontSize:12.5,color:"var(--text)"}}>{telefono}</div></div>}
      </div>
      {!perfil.nombre&&<div className="notice notice-amber" style={{marginTop:10,fontSize:11.5}}>Completá el nombre de la inmobiliaria en Configuración → Mi cuenta para que aparezca correctamente en la autorización.</div>}
    </div>
  );
}

function StepInmueble({data,onChange,faltantes}){
  return(
    <div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Datos del inmueble.</p>
      <div className="grid2">
        <Slt label="Tipo de inmueble" value={data.inmueble_tipo||"departamento"} onChange={function(e){onChange("inmueble_tipo",e.target.value);}} className={data.inmueble_tipo==="otro"?"":"col2"}>
          {TIPO_INMUEBLE_OPCIONES.map(function(o){return <option key={o.value} value={o.value}>{o.label}</option>;})}
        </Slt>
        {data.inmueble_tipo==="otro"&&<Inp label="¿Cuál?" value={data.inmueble_tipo_otro||""} onChange={function(e){onChange("inmueble_tipo_otro",e.target.value);}} placeholder="Ej: Cochera, Depósito..."/>}
        <Inp label="Dirección" value={data.inmueble_direccion||""} onChange={function(e){onChange("inmueble_direccion",e.target.value);}} placeholder="Calle Falsa 123" className="col2" {...estiloCampoFaltante(faltantes,"inmueble_direccion")}/>
        <Inp label="Unidad funcional / Lote (opcional)" value={data.inmueble_unidad_funcional||""} onChange={function(e){onChange("inmueble_unidad_funcional",e.target.value);}} placeholder="Ej: UF 3 — Lote 12"/>
        <Inp label="Partido / Municipio" value={data.inmueble_partido||""} onChange={function(e){onChange("inmueble_partido",e.target.value);}} placeholder="Lomas de Zamora"/>
        <Inp label="Provincia" value={data.inmueble_provincia||""} onChange={function(e){onChange("inmueble_provincia",e.target.value);}} placeholder="Buenos Aires"/>
        <Txa label="Descripción" value={data.descripcion_inmueble||""} onChange={function(e){onChange("descripcion_inmueble",e.target.value);}} placeholder="3 ambientes, 80m², piso 5..." className="col2" rows={2}/>
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
          <Inp label="Inmobiliaria colega" value={data.compartida_inmobiliaria||""} onChange={function(e){onChange("compartida_inmobiliaria",e.target.value);}} placeholder="Nombre de la inmobiliaria"/>
          <Inp label="N° de matrícula" value={data.compartida_matricula||""} onChange={function(e){onChange("compartida_matricula",e.target.value);}} placeholder="Ej. CUCICBA 1234"/>
        </div>
        <Slt label="Alcance de lo compartido" value={data.compartida_alcance||"completa"} onChange={function(e){onChange("compartida_alcance",e.target.value);}} className="col2" hint="Define qué parte de la comisión se comparte con la otra inmobiliaria">
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
          ? <div className="notice" style={{fontSize:11.5}}>Todavía no cargaste a nadie en Configuración → Equipo. Agregá a tu colega ahí para poder seleccionarlo acá.</div>
          : <Slt label="Colega (miembro del equipo)" value={data.compartida_colega_id||""} onChange={function(e){seleccionarColega(e.target.value);}} className="col2">
              <option value="">Seleccionar colega...</option>
              {miembros.map(function(m){var rd=ROLES_DEF[m.rol]; return <option key={m.id} value={m.id}>{m.nombre}{rd?" — "+rd.label:""}</option>;})}
            </Slt>
        }
        <div className="notice notice-gold" style={{marginTop:8,fontSize:11.5}}>El colega elegido queda registrado como corredor asociado a esta operación y va a poder verla y editarla desde su propia sesión (no en simultáneo con vos — el último que guarda es el que queda). Cuando el documento esté terminado, usá "📤 Compartir documento" para enviarle el PDF final por WhatsApp, mail u otra app.</div>
      </div>}
    </div>
  );
}

function ComisionEditor({data,onChange,prefix,label,base,monedaBase,defaultPct,legacyKey}){
  var modo=normalizarModoComision(data[prefix+"_modo"]);
  var legacy=data[legacyKey||prefix];
  var valor=(data[prefix+"_valor"]!==undefined && String(data[prefix+"_valor"]).trim()!=="")?data[prefix+"_valor"]:(legacy!==undefined?legacy:defaultPct);
  var monedaFija=data[prefix+"_moneda"]||monedaBase||"ARS";
  var n=parseFloat(valor)||0;
  var monto=modo==="fijo"?n:(parseFloat(base)||0)*n/100;
  function setModo(next){
    onChange(prefix+"_modo",next);
    if(next==="fijo"){
      var seed=(parseFloat(base)||0)*((parseFloat(legacy)||0))/100;
      onChange(prefix+"_valor",seed?String(Math.round(seed*100)/100):"");
      if(!data[prefix+"_moneda"]) onChange(prefix+"_moneda",monedaBase||"ARS");
    } else {
      var pctActual=(parseFloat(legacy)||0);
      if(!pctActual && n>0 && parseFloat(base)>0) pctActual=n*100/parseFloat(base);
      onChange(prefix+"_valor",pctActual?String(Math.round(pctActual*10000)/10000):"");
      onChange(legacyKey||prefix,pctActual?String(Math.round(pctActual*10000)/10000):"");
    }
  }
  return <div style={{padding:"11px 12px",borderRadius:11,border:"1px solid var(--border)",background:"rgba(255,255,255,.018)"}}>
    <div style={{fontSize:11,fontWeight:700,color:"var(--text)",marginBottom:8}}>{label}</div>
    <div style={{display:"grid",gridTemplateColumns:modo==="fijo"?"1fr 1.2fr .8fr":"1fr 1.2fr",gap:7}}>
      <select className="inp" value={modo} onChange={function(e){setModo(e.target.value);}}>
        <option value="porcentaje">Porcentaje (%)</option>
        <option value="fijo">Monto fijo</option>
      </select>
      <input className="inp" type="number" min="0" step="0.01" value={valor||""} onChange={function(e){onChange(prefix+"_valor",e.target.value);if(modo==="porcentaje")onChange(legacyKey||prefix,e.target.value);}} placeholder={modo==="fijo"?"Ej. 500000":"Ej. 4"}/>
      {modo==="fijo"&&<select className="inp" value={monedaFija} onChange={function(e){onChange(prefix+"_moneda",e.target.value);}}>
        <option value="ARS">ARS</option><option value="USD">USD</option>
      </select>}
    </div>
    <div style={{fontSize:10.5,color:"var(--dim)",marginTop:6}}>
      {modo==="fijo" ? (monto>0?"Honorario: "+fmt$(monto,monedaFija):"Ingresá el monto fijo.") : (monto>0?"Equivale a "+fmt$(monto,monedaBase):"Se calcula sobre la base de la operación.")}
    </div>
  </div>;
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
        <Inp label="Precio total" value={data.precio||""} onChange={function(e){onChange("precio",e.target.value);}} placeholder="100000" type="number" {...estiloCampoFaltante(faltantes,"precio")}/>
        <Slt label="Moneda" value={data.moneda||"USD"} onChange={function(e){onChange("moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt>
        <Inp label="Seña / Anticipo" value={data.anticipo||""} onChange={function(e){onChange("anticipo",e.target.value);}} placeholder="10000" type="number"/>
        <Field label="Saldo restante"><div className="val-box">{fmt$(data.saldo||(precio-anticipo),data.moneda)}</div></Field>
        {data.tipo!=="reserva"&&<Inp label="Fecha de posesión" value={data.fecha_posesion||""} onChange={function(e){onChange("fecha_posesion",e.target.value);}} type="date" className="col2" {...estiloCampoFaltante(faltantes,"fecha_posesion")}/>}
        {data.tipo==="reserva"&&<Inp label="Fecha límite para tomar refuerzo" value={data.reserva_fecha_refuerzo||""} onChange={function(e){onChange("reserva_fecha_refuerzo",e.target.value);}} type="date" className="col2" hint="Opcional — si la cargás, la app te avisa en el Calendario cuando se acerca. La fecha de posesión y la escribanía suelen definirse recién en el boleto."/>}
        {data.tipo==="reserva"&&<div className="col2" style={{marginTop:2,padding:"12px 14px",borderRadius:12,border:"1px solid rgba(212,168,83,.22)",background:"rgba(212,168,83,.045)"}}>
          <div style={{fontSize:12.2,fontWeight:700,color:"var(--text)",marginBottom:3}}>Plazo de aceptación</div>
          <div style={{fontSize:10.5,color:"var(--dim)",marginBottom:9}}>El asesor elige cómo vence la aceptación: por horas desde la firma, por días, o en una fecha fija. Se refleja en la cláusula y en el Calendario.</div>
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
                }} style={{padding:"6px 12px",borderRadius:999,border:activo?"1px solid rgba(212,168,83,.55)":"1px solid var(--border)",background:activo?"rgba(212,168,83,.18)":"var(--surface2)",color:activo?"var(--gold)":"var(--muted)",fontWeight:700,fontSize:11.5,cursor:"pointer"}}>{opt.label}</button>
              );
            })}
          </div>
          {(data.reserva_aceptacion_modo||"dias")==="horas" && (
            <Inp label="Horas desde la suscripción" type="number" min="1" max="720" value={data.reserva_aceptacion_horas||48} onChange={function(e){var n=Math.max(1,Math.min(720,parseInt(e.target.value,10)||48));onChange("reserva_aceptacion_horas",String(n));}} hint="Ej: 48 = caduca a las 48 horas de firmada"/>
          )}
          {(data.reserva_aceptacion_modo||"dias")==="dias" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Inp label="Días para aceptar" type="number" min="1" max="90" value={data.reserva_aceptacion_dias||5} onChange={function(e){var n=Math.max(1,Math.min(90,parseInt(e.target.value,10)||1));onChange("reserva_aceptacion_dias",String(n));onChange("reserva_aceptacion_vencimiento",sumarDiasISO(data.reserva_fecha_reserva||fechaHoyISO(),n));}}/>
              <Inp label="Vencimiento (auto)" type="date" value={data.reserva_aceptacion_vencimiento||""} onChange={function(e){onChange("reserva_aceptacion_vencimiento",e.target.value);}}/>
            </div>
          )}
          {(data.reserva_aceptacion_modo||"dias")==="fecha" && (
            <Inp label="Fecha de vencimiento" type="date" value={data.reserva_aceptacion_vencimiento||""} onChange={function(e){onChange("reserva_aceptacion_vencimiento",e.target.value);}}/>
          )}
        </div>}
        {data.tipo!=="reserva"&&<Inp label="Escribanía" value={data.escribania||""} onChange={function(e){onChange("escribania",e.target.value);}} placeholder="Escribanía García" className="col2"/>}
        <div className="col2"><div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Comisión inmobiliaria</div>
          <div style={{fontSize:10.8,color:"var(--dim)",marginBottom:9}}>Para cada parte podés elegir porcentaje o un monto fijo. La moneda del honorario fijo también se define por separado.</div>
          <div className="grid2">
            <ComisionEditor data={data} onChange={onChange} prefix="comision_vendedor" legacyKey="comision_vendedor" label="Vendedor" base={precio} monedaBase={data.moneda||"USD"} defaultPct="4"/>
            <ComisionEditor data={data} onChange={onChange} prefix="comision_comprador" legacyKey="comision_comprador" label="Comprador" base={precio} monedaBase={data.moneda||"USD"} defaultPct="3"/>
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
      var d=new Date(data.alquiler_inicio);
      d.setMonth(d.getMonth()+(parseInt(data.alquiler_plazo_meses,10)||0));
      d.setDate(d.getDate()+(parseInt(data.alquiler_plazo_dias,10)||0));
      onChange("alquiler_fin",d.toISOString().slice(0,10));
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
      <Inp label="Alquiler mensual inicial" value={data.alquiler_monto_inicial||""} onChange={function(e){onChange("alquiler_monto_inicial",e.target.value);}} placeholder="150000" type="number" {...estiloCampoFaltante(faltantes,"alquiler_monto_inicial")}/>
      <Slt label="Moneda" value={data.alquiler_moneda||"ARS"} onChange={function(e){onChange("alquiler_moneda",e.target.value);}}><option value="ARS">ARS</option><option value="USD">USD</option></Slt>
      <Slt label="Destino" value={data.alquiler_destino||"vivienda"} onChange={function(e){onChange("alquiler_destino",e.target.value);}}><option value="vivienda">Vivienda</option><option value="comercial">Comercial</option><option value="profesional">Profesional</option></Slt>

      <div className="col2"><div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Plazo del contrato</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Inp label="Meses" value={data.alquiler_plazo_meses||"24"} onChange={function(e){onChange("alquiler_plazo_meses",e.target.value);}} placeholder="24" type="number" hint="Mín. legal: 24 meses (habitacional)"/>
          <Inp label="Días adicionales" value={data.alquiler_plazo_dias||"0"} onChange={function(e){onChange("alquiler_plazo_dias",e.target.value);}} placeholder="0" type="number"/>
        </div>
      </div>

      <Inp label="Fecha de inicio" value={data.alquiler_inicio||""} onChange={function(e){onChange("alquiler_inicio",e.target.value);}} type="date" {...estiloCampoFaltante(faltantes,"alquiler_inicio")}/>
      <Field label="Vencimiento"><div className="val-box">{data.alquiler_fin?fmtD(data.alquiler_fin):"—"}</div></Field>

      <div>
        <Slt label="Índice actualización" value={data.alquiler_actualizacion||"ICL"} onChange={function(e){onChange("alquiler_actualizacion",e.target.value);}} hint="Ley 27.551: ICL BCRA">
          <option value="ICL">ICL — BCRA</option>
          <option value="IPC">IPC — INDEC</option>
          <option value="UVA">UVA</option>
          <option value="fijo">Canon fijo (sin actualización)</option>
          <option value="otro">Otro (personalizado)</option>
        </Slt>
        {data.alquiler_actualizacion==="otro"&&<Inp value={data.alquiler_actualizacion_otro||""} onChange={function(e){onChange("alquiler_actualizacion_otro",e.target.value);}} placeholder="Nombre del índice" style={{marginTop:8}}/>}
      </div>
      <div>
        <Slt label="Período actualización" value={data.alquiler_periodo_actualizacion||"cuatrimestral"} onChange={function(e){onChange("alquiler_periodo_actualizacion",e.target.value);}}>
          <option value="trimestral">Trimestral</option>
          <option value="cuatrimestral">Cuatrimestral</option>
          <option value="semestral">Semestral</option>
          <option value="anual">Anual</option>
          <option value="otro">Otro (personalizado)</option>
        </Slt>
        {data.alquiler_periodo_actualizacion==="otro"&&<Inp value={data.alquiler_periodo_otro||""} onChange={function(e){onChange("alquiler_periodo_otro",e.target.value);}} placeholder="Ej: cada 2 meses" style={{marginTop:8}}/>}
      </div>

      <div className="col2">
        <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Forma de pago (elegí una o más)</div>
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
        <Slt label="Día de pago" value={data.alquiler_dia_pago||"1"} onChange={function(e){onChange("alquiler_dia_pago",e.target.value);}}>
          <option value="1">Día 1</option><option value="5">Día 5</option><option value="10">Día 10</option><option value="15">Día 15</option><option value="otro">Otro día</option>
        </Slt>
        {data.alquiler_dia_pago==="otro"&&<Inp value={data.alquiler_dia_pago_otro||""} onChange={function(e){onChange("alquiler_dia_pago_otro",e.target.value);}} placeholder="Ej: 20" type="number" style={{marginTop:8}}/>}
      </div>
      <div>
        <Slt label="Depósito" value={data.alquiler_deposito||"1"} onChange={function(e){onChange("alquiler_deposito",e.target.value);}} hint="Ley 27.551: máx. 1 mes">
          <option value="1">1 mes</option><option value="2">2 meses</option><option value="otro">Monto personalizado</option>
        </Slt>
        {data.alquiler_deposito==="otro"&&<div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8,marginTop:8}}>
          <input className="inp" value={data.alquiler_deposito_otro_monto||""} onChange={function(e){onChange("alquiler_deposito_otro_monto",e.target.value);}} placeholder="500" type="number"/>
          <select className="inp" value={data.alquiler_deposito_otro_moneda||"USD"} onChange={function(e){onChange("alquiler_deposito_otro_moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></select>
        </div>}
      </div>
      <Field label="Total depósito"><div className="val-box">{totalDeposito}</div></Field>

      <div className="col2"><div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Comisión inmobiliaria</div>
        <div style={{fontSize:10.8,color:"var(--dim)",marginBottom:4}}>El porcentaje se aplica al total del contrato, no al primer canon mensual.</div>
        <div style={{fontSize:10.5,color:"var(--dim)",marginBottom:9}}>Base estimada para la comisión: {baseComision>0?fmt$(baseComision,data.alquiler_moneda||"ARS"):"completá canon y plazo"}</div>
        <div className="grid2">
          <ComisionEditor data={data} onChange={onChange} prefix="alquiler_comision_locador" legacyKey="alquiler_comision_locador" label="Locador" base={baseComision} monedaBase={data.alquiler_moneda||"ARS"} defaultPct={data.alquiler_comision||"1"}/>
          <ComisionEditor data={data} onChange={onChange} prefix="alquiler_comision_locatario" legacyKey="alquiler_comision_locatario" label="Locatario" base={baseComision} monedaBase={data.alquiler_moneda||"ARS"} defaultPct={data.alquiler_comision||"1"}/>
        </div>
        <CompartidaBlock data={data} onChange={onChange} equipo={equipo}/>
      </div>

      <div className="col2">
        <label style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,border:"1px solid var(--border)",background:data.alquiler_amoblado?"rgba(212,168,83,0.08)":"transparent",cursor:"pointer",fontSize:12.5,color:"var(--text)",width:"fit-content"}}>
          <input type="checkbox" checked={!!data.alquiler_amoblado} onChange={function(e){onChange("alquiler_amoblado",e.target.checked);}}/>
          Se alquila amoblado
        </label>
        {data.alquiler_amoblado&&<Txa label="Inventario de bienes muebles" hint="Detallá los muebles y artefactos que se entregan (uno por línea). Se incorpora como anexo del contrato." value={data.alquiler_inventario||""} onChange={function(e){onChange("alquiler_inventario",e.target.value);}} rows={5} placeholder={"Ej:\nHeladera con freezer\nCocina 4 hornallas\nJuego de living (sofá 3 cuerpos + 2 sillones)\nMesa de comedor + 4 sillas\nCama matrimonial + colchón\n..."} style={{marginTop:8}}/>}
      </div>

      <div className="col2" style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:6,marginBottom:2}}>Mora, seguro y rescisión</div>
      <Inp label="Interés punitorio mensual (%)" value={data.alquiler_interes_punitorio||"5"} onChange={function(e){onChange("alquiler_interes_punitorio",e.target.value);}} placeholder="5" type="number" hint="Por mora en el pago del canon"/>
      <Inp label="Cláusula penal (meses de alquiler)" value={data.alquiler_penalidad_meses||"2"} onChange={function(e){onChange("alquiler_penalidad_meses",e.target.value);}} placeholder="2" type="number" hint="Por cada mes de demora en restituir"/>
      <Inp label="Plazo para contratar seguro (días)" value={data.alquiler_seguro_dias||"10"} onChange={function(e){onChange("alquiler_seguro_dias",e.target.value);}} placeholder="10" type="number" hint="Seguro de RC e Incendio"/>
      <Inp label="Preaviso de rescisión anticipada (meses)" value={data.alquiler_aviso_meses||"1"} onChange={function(e){onChange("alquiler_aviso_meses",e.target.value);}} placeholder="1" type="number"/>
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
        <Inp label="Monto de reserva" value={data.res_alq_monto_reserva||""} onChange={function(e){onChange("res_alq_monto_reserva",e.target.value);}} placeholder="50000" type="number"/>
        <Slt label="Moneda de la operación" value={data.res_alq_moneda||"ARS"} onChange={function(e){onChange("res_alq_moneda",e.target.value);onChange("res_alq_monto_mensual_moneda",e.target.value);}}><option value="ARS">ARS — Pesos argentinos</option><option value="USD">USD — Dólares estadounidenses</option></Slt>
        <Inp label="Valor del alquiler mensual" value={data.res_alq_monto_mensual||""} onChange={function(e){onChange("res_alq_monto_mensual",e.target.value);}} placeholder="180000" type="number" {...estiloCampoFaltante(faltantes,"res_alq_monto_mensual")}/>
        <div className="col2"><div className="notice" style={{fontSize:11.5}}>La reserva y el alquiler mensual usan la misma moneda. Así la reserva queda vinculada a la moneda real del contrato.</div></div>
        <div className="col2"><div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Plazo estimado del contrato</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Inp label="Cantidad" value={data.res_alq_plazo_cantidad||""} onChange={function(e){onChange("res_alq_plazo_cantidad",e.target.value);}} placeholder="24" type="number"/>
            <Slt label="Unidad" value={data.res_alq_plazo_unidad||"meses"} onChange={function(e){onChange("res_alq_plazo_unidad",e.target.value);}}><option value="semanas">Semanas</option><option value="meses">Meses</option><option value="años">Años</option></Slt>
          </div>
        </div>
        <Inp label="Inicio estimado" value={data.res_alq_inicio_estimado||""} onChange={function(e){onChange("res_alq_inicio_estimado",e.target.value);}} type="date"/>
        <Slt label="Destino" value={data.res_alq_destino||"vivienda"} onChange={function(e){onChange("res_alq_destino",e.target.value);}}><option value="vivienda">Vivienda</option><option value="comercial">Comercial</option><option value="profesional">Profesional</option></Slt>
        <Slt label="Vigencia de la reserva" value={data.res_alq_vigencia_dias||"10"} onChange={function(e){onChange("res_alq_vigencia_dias",e.target.value);}}>
          {["3","5","7","10","15","30"].map(function(d){return <option key={d} value={d}>{d} días</option>;})}
        </Slt>
        <div className="col2"><div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Comisión inmobiliaria</div>
          <div style={{fontSize:10.8,color:"var(--dim)",marginBottom:9}}>Cada parte puede tener porcentaje o monto fijo.</div>
          <div className="grid2">
            <ComisionEditor data={data} onChange={onChange} prefix="res_alq_comision_locador" legacyKey="res_alq_comision_locador" label="Locador" base={parseFloat(data.res_alq_monto_mensual)||0} monedaBase={data.res_alq_moneda||"ARS"} defaultPct={data.res_alq_comision||"1"}/>
            <ComisionEditor data={data} onChange={onChange} prefix="res_alq_comision_locatario" legacyKey="res_alq_comision_locatario" label="Locatario" base={parseFloat(data.res_alq_monto_mensual)||0} monedaBase={data.res_alq_moneda||"ARS"} defaultPct={data.res_alq_comision||"1"}/>
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
        <Inp label="Dirección del inmueble" value={data.inmueble_direccion||""} onChange={function(e){onChange("inmueble_direccion",e.target.value);}} placeholder="Av. Corrientes 1234, CABA" className="col2"/>
        <Inp label="Unidad funcional / Lote (opcional)" value={data.inmueble_unidad_funcional||""} onChange={function(e){onChange("inmueble_unidad_funcional",e.target.value);}} placeholder="Ej: UF 3 — Lote 12" className="col2"/>
        <Inp label="Partido / Municipio" value={data.inmueble_partido||""} onChange={function(e){onChange("inmueble_partido",e.target.value);}} placeholder="Buenos Aires"/>
        <Inp label="Provincia" value={data.inmueble_provincia||""} onChange={function(e){onChange("inmueble_provincia",e.target.value);}} placeholder="Buenos Aires"/>
        {tipo==="comodato"&&<>
          <Inp label="Plazo del comodato" value={data.comodato_plazo||""} onChange={function(e){onChange("comodato_plazo",e.target.value);}} placeholder="6 meses" className="col2"/>
          <Txa label="Destino / Uso del bien" value={data.comodato_uso||""} onChange={function(e){onChange("comodato_uso",e.target.value);}} placeholder="Uso habitacional exclusivo del comodatario..." rows={2} className="col2"/>
        </>}
        {tipo==="exclusividad"&&<>
          <Slt label="Tipo de autorización" value={data.exclusividad_tipo||"con"} onChange={function(e){onChange("exclusividad_tipo",e.target.value);}} className="col2">
            <option value="con">Con exclusividad</option>
            <option value="sin">Sin exclusividad</option>
          </Slt>
          <Inp label="Precio de venta" value={data.precio||""} onChange={function(e){onChange("precio",e.target.value);}} placeholder="100000" type="number"/>
          <Slt label="Moneda" value={data.moneda||"USD"} onChange={function(e){onChange("moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt>
          <Inp label="Vigencia de la autorización" value={data.exclusividad_vigencia||""} onChange={function(e){onChange("exclusividad_vigencia",e.target.value);}} placeholder="90 días" className="col2"/>
          <div className="col2"><ComisionEditor data={data} onChange={onChange} prefix="comision_vendedor" legacyKey="comision_vendedor" label="Comisión del propietario" base={parseFloat(data.precio)||0} monedaBase={data.moneda||"USD"} defaultPct="3"/></div>
        </>}
        {tipo==="refuerzo_reserva"&&<>
          <Inp label="Monto del refuerzo" value={data.precio||""} onChange={function(e){onChange("precio",e.target.value);}} placeholder="10000" type="number"/>
          <Slt label="Moneda" value={data.moneda||"USD"} onChange={function(e){onChange("moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt>
          <Inp label="Fecha del refuerzo" value={data.fecha_posesion||""} onChange={function(e){onChange("fecha_posesion",e.target.value);}} type="date" className="col2"/>
          <Txa label="Trayectoria de la operación" value={data.refuerzo_trayectoria||""} onChange={function(e){onChange("refuerzo_trayectoria",e.target.value);}} placeholder="Con fecha XX se firmó reserva por $XX..." rows={3} className="col2"/>
        </>}
        {tipo==="devolucion_reserva"&&<>
          <Inp label="Monto a devolver" value={data.precio||""} onChange={function(e){onChange("precio",e.target.value);}} placeholder="10000" type="number"/>
          <Slt label="Moneda" value={data.moneda||"USD"} onChange={function(e){onChange("moneda",e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt>
          <Inp label="Fecha de devolución" value={data.fecha_posesion||""} onChange={function(e){onChange("fecha_posesion",e.target.value);}} type="date" className="col2"/>
          <Txa label="Motivo de la devolución" value={data.devolucion_motivo||""} onChange={function(e){onChange("devolucion_motivo",e.target.value);}} placeholder="Por mutuo acuerdo..." rows={2} className="col2"/>
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
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{g.label}</div><div style={{fontSize:11,color:"var(--muted)"}}>{g.desc}</div></div>
              <div style={{width:18,height:18,borderRadius:"50%",border:"2px solid "+(sel?"var(--gold)":"var(--border2)"),background:sel?"var(--gold)":"transparent",flexShrink:0}}/>
            </button>
          );
        })}
      </div>
      {data.alquiler_garantia_tipo==="propietario"&&(
        <div className="grid2" style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
          <Inp label="Nombre del garante" value={data.alquiler_garantia_titular||""} onChange={function(e){onChange("alquiler_garantia_titular",e.target.value);}} placeholder="Roberto Gómez" className="col2"/>
          <IdentificacionField value={data.alquiler_garantia_dni||""} onChange={function(e){onChange("alquiler_garantia_dni",e.target.value);}} placeholder="20-98765432-1" labelSuffix=" del garante"/>
          <Inp label="Inmueble en garantía" value={data.alquiler_garantia_inmueble||""} onChange={function(e){onChange("alquiler_garantia_inmueble",e.target.value);}} placeholder="Mitre 456, Quilmes"/>
        </div>
      )}
      {(data.alquiler_garantia_tipo==="seguro_caucion"||data.alquiler_garantia_tipo==="aval_bancario"||data.alquiler_garantia_tipo==="recibo_sueldo")&&(
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
          <Inp label="Titular / Entidad" value={data.alquiler_garantia_titular||""} onChange={function(e){onChange("alquiler_garantia_titular",e.target.value);}} placeholder="Nombre o entidad"/>
        </div>
      )}
      <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
        <Txa label="Texto de la cláusula de garantía (opcional)" value={data.alquiler_garantia_texto_personalizado||""} onChange={function(e){onChange("alquiler_garantia_texto_personalizado",e.target.value);}} placeholder="Pegá acá el texto que te envía la aseguradora / entidad de garantía (ej. Garantías Confiar, Fianzas y Créditos, etc.)..." rows={4}/>
        <div style={{fontSize:11,color:"var(--dim)",marginTop:4}}>Si lo completás, reemplaza el texto automático de la cláusula de Garantía en el contrato.</div>
      </div>
    </div>
  );
}

function StepClausulas({data,onChange,clausulas,esAlquiler,onAddClausula,perfil}){
  var selected=data.clausulas_ids||[];
  var nombreInmobiliariaObligatoria=(perfil&&perfil.nombre&&String(perfil.nombre).trim())?String(perfil.nombre).trim():"la inmobiliaria";
  function toggle(id){onChange("clausulas_ids",selected.includes(id)?selected.filter(function(x){return x!==id;}):selected.concat([id]));}
  var lista=clausulas.filter(function(c){return clausulaAplicaTipo(c,data.tipo);});
  var cats=lista.reduce(function(acc,c){if(!acc.includes(c.categoria))acc.push(c.categoria);return acc;},[]);

  // ── Cláusula adicional: "libre" (texto propio) o "con IA" (narrada) ──
  // Se compone en estado local (título/contenido) y recién se refleja en la
  // operación si "Usar en esta operación" está tildado. Independientemente
  // de eso, "Agregar a mis cláusulas personalizadas" la guarda en la
  // biblioteca para reutilizarla en futuras operaciones.
  const [tituloCustom,setTituloCustom]=useState(data.clausulas_custom_titulo||"");
  const [contenidoCustom,setContenidoCustom]=useState(data.clausulas_custom||"");
  const [usarEnOperacion,setUsarEnOperacion]=useState(true);
  const [ideaIA,setIdeaIA]=useState("");
  const [loadingIA,setLoadingIA]=useState(false);
  const [errorIA,setErrorIA]=useState("");
  const [versionLibreIA,setVersionLibreIA]=useState(null);
  const [guardadoOk,setGuardadoOk]=useState(false);

  useEffect(function(){
    if(usarEnOperacion){
      onChange("clausulas_custom_titulo",tituloCustom);
      onChange("clausulas_custom",contenidoCustom);
    } else {
      onChange("clausulas_custom_titulo","");
      onChange("clausulas_custom","");
    }
    // eslint-disable-next-line
  }, [tituloCustom, contenidoCustom, usarEnOperacion]);

  async function narrarConIA(){
    if(!ideaIA.trim()||loadingIA) return;
    setLoadingIA(true); setErrorIA("");
    try{
      var draft=await narrarClausulaIA(ideaIA.trim());
      if(draft){
        if(!versionLibreIA) setVersionLibreIA({titulo:tituloCustom,contenido:contenidoCustom});
        setTituloCustom(draft.titulo||"");
        setContenidoCustom(draft.contenido||"");
        setIdeaIA("");
      } else setErrorIA("No pude interpretar la respuesta. Probá reformular la idea.");
    }catch(e){ setErrorIA("Error al conectar con el asistente. Verificá tu conexión."); }
    setLoadingIA(false);
  }

  function volverVersionLibre(){
    if(!versionLibreIA) return;
    setTituloCustom(versionLibreIA.titulo||"");
    setContenidoCustom(versionLibreIA.contenido||"");
    setVersionLibreIA(null);
    setErrorIA("");
  }

  function guardarEnBiblioteca(){
    if(!contenidoCustom.trim()||!onAddClausula) return;
    onAddClausula({
      id:genId(),
      titulo:(tituloCustom&&tituloCustom.trim())||"Cláusula personalizada",
      categoria: esAlquiler?"alquiler":"general",
      tipos:["todos"],
      contenido:contenidoCustom.trim(),
    });
    setGuardadoOk(true);
    setTimeout(function(){setGuardadoOk(false);},2500);
  }

  return(
    <div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Seleccioná las cláusulas a incluir. Las marcadas 🔒 <b>OBLIGATORIAS</b> las definió el <b>Dueño/Administrador</b> de <b style={{color:"var(--text)"}}>{nombreInmobiliariaObligatoria}</b> y no se pueden quitar de esta operación.</p>
      {cats.map(function(cat){
        return(
          <div key={cat} style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{cat}</div>
            {lista.filter(function(c){return c.categoria===cat;}).map(function(c){
              var obligatoria=!!c.obligatoria;
              var sel=obligatoria||selected.includes(c.id);
              return(
                <div key={c.id} onClick={function(){if(!obligatoria)toggle(c.id);}}
                  style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+(sel?"var(--gold)":"var(--border2)"),background:sel?"rgba(212,168,83,0.06)":"var(--card)",cursor:obligatoria?"default":"pointer",marginBottom:6,display:"flex",alignItems:"flex-start",gap:10,maxWidth:"100%",boxSizing:"border-box",opacity:obligatoria?0.9:1}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,color:"var(--text)",wordBreak:"break-word",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      {c.titulo}
                      {obligatoria&&<span style={{fontSize:9.5,fontWeight:700,color:"#b45309",background:"rgba(180,83,9,0.1)",padding:"1px 6px",borderRadius:6}}>🔒 OBLIGATORIA</span>}
                    </div>
                    <div style={{fontSize:11,color:"var(--muted)",marginTop:2,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden",wordBreak:"break-word",whiteSpace:"normal",lineHeight:1.4}}>{c.contenido}</div>
                  </div>
                  <div style={{width:18,height:18,borderRadius:"50%",border:"2px solid "+(sel?"var(--gold)":"var(--border2)"),background:sel?"var(--gold)":"transparent",flexShrink:0,marginTop:1}}/>
                </div>
              );
            })}
          </div>
        );
      })}
      <div style={{paddingTop:10,borderTop:"1px dashed var(--border2)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Cláusula adicional</div>

        <div style={{marginBottom:12,padding:"12px 13px",borderRadius:12,border:"1px solid var(--border2)",background:"linear-gradient(180deg,rgba(212,168,83,.055),rgba(255,255,255,.012))"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:5}}>
            <div style={{fontSize:12.5,fontWeight:800,color:"var(--text)",display:"flex",alignItems:"center",gap:7}}><span style={{color:"var(--gold)"}}>✦</span> Narrar con IA <span style={{fontSize:10.5,fontWeight:500,color:"var(--dim)"}}>La IA propone; vos decidís.</span></div>
            {versionLibreIA&&<button type="button" onClick={volverVersionLibre} style={{border:"none",background:"transparent",color:"var(--gold)",cursor:"pointer",fontSize:10.5,fontWeight:700,whiteSpace:"nowrap"}}>↶ Volver a mi versión libre</button>}
          </div>
          <div style={{fontSize:11,color:"var(--dim)",marginBottom:9}}>Escribí la idea en lenguaje natural y DocWorks redacta sobre este mismo editor. Después podés corregir el título y el texto libremente.</div>
          <div style={{display:"flex",gap:7,alignItems:"flex-start"}}>
            <textarea className="inp" rows={2} value={ideaIA} onChange={function(e){setIdeaIA(e.target.value);}}
              onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();narrarConIA();}}}
              placeholder="Ej: que el inquilino no pueda tener mascotas sin autorización" style={{flex:1,resize:"none"}}/>
            <VozATextoButton onText={function(t){setIdeaIA(function(v){return (v?v+" ":"")+t;});}} disabled={loadingIA}/>
            <Btn s="sm" onClick={narrarConIA} disabled={!ideaIA.trim()||loadingIA}>{loadingIA?"Narrando…":"✦ Narrar con IA"}</Btn>
          </div>
          {errorIA&&<div style={{fontSize:11,color:"var(--red)",marginTop:6}}>{errorIA}</div>}
        </div>

        <Inp label="Título de la cláusula (opcional)" value={tituloCustom} onChange={function(e){setTituloCustom(e.target.value);}} placeholder="Ej: Prohibición de mascotas" className="col2"/>
        <Txa label="Texto de la cláusula" value={contenidoCustom} onChange={function(e){setContenidoCustom(e.target.value);}} placeholder="Escribí aquí cualquier cláusula específica..." rows={3} className="col2"/>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:-2,fontSize:10.5,color:"var(--dim)"}}>
          <VozATextoButton onText={function(t){setContenidoCustom(function(v){return (v?v+" ":"")+t;});}}/>
          <span>También podés dictar tu versión libre y después editarla manualmente.</span>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12,paddingTop:12,borderTop:"1px dashed var(--border2)"}}>
          <label style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,border:"1px solid var(--border)",background:usarEnOperacion?"rgba(212,168,83,0.08)":"transparent",cursor:"pointer",fontSize:12.5,color:"var(--text)"}}>
            <input type="checkbox" checked={usarEnOperacion} onChange={function(e){setUsarEnOperacion(e.target.checked);}}/>
            Usar solo en esta operación
          </label>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <Btn s="sm" v="secondary" onClick={guardarEnBiblioteca} disabled={!contenidoCustom.trim()}>+ Agregar a mis cláusulas personalizadas</Btn>
            {guardadoOk&&<span style={{fontSize:11.5,color:"var(--green,#2e9e5b)"}}>✓ Guardada en tu biblioteca de cláusulas.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}


function StepBar({current,tipo,pasosFaltantes,onGoTo}){
  const steps=getSteps(tipo);
  return(
    <div className="steps">
      {steps.map(function(s,i){
        const done=current>s.id,active=current===s.id;
        const flagged=!!(pasosFaltantes&&pasosFaltantes[s.id]);
        return(
          <div key={s.id} className="step-item">
            <div className={"step-dot "+(flagged?"flag":done?"done":active?"active":"pending")}
              onClick={onGoTo?function(){onGoTo(s.id);}:undefined}
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
        .sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);})
        .slice(0,6)
    : [];
  var colorMap={compra:"rgba(212,168,83,0.12)",alquiler:"rgba(45,212,191,0.1)",otros:"rgba(148,163,184,0.1)"};
  var borderMap={compra:"rgba(212,168,83,0.35)",alquiler:"rgba(45,212,191,0.3)",otros:"rgba(148,163,184,0.25)"};
  return(
    <div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>Seleccioná el tipo de documento a generar.</p>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {gruposToShow.map(function(entry){
          var key=entry[0], g=entry[1];
          var col=colorMap[key]||"rgba(255,255,255,0.05)";
          var brd=borderMap[key]||"var(--border2)";
          return(
            <div key={key}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{g.label}</div>
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
                      <div style={{fontSize:11,color:"var(--muted)"}}>{t.desc}</div>
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
          <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{data.tipo==="devolucion_reserva"?"Reservas en curso — seleccioná la que querés devolver":"Reservas abiertas recientes — seleccioná la reserva sobre la que querés hacer el refuerzo"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {reservasSugeridas.map(function(op){
              return(
                <button type="button" key={op.id} onClick={function(){data.tipo==="devolucion_reserva" ? (onSelectReservaDevolucion&&onSelectReservaDevolucion(op)) : (onSelectReservaRefuerzo&&onSelectReservaRefuerzo(op));}}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 12px",borderRadius:10,border:"1px solid var(--border2)",background:"var(--card)",cursor:"pointer",textAlign:"left",outline:"none"}}>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{op.comprador_nombre||"Comprador sin nombre"} ← {op.vendedor_nombre||"Vendedor sin nombre"}</div>
                    <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{op.inmueble_direccion||"Sin dirección"}{op.precio?" · "+fmt$(op.precio,op.moneda):""}</div>
                  </div>
                  <span style={{fontSize:11,color:"var(--dim)",whiteSpace:"nowrap"}}>{new Date(op.created_at).toLocaleDateString("es-AR")}</span>
                </button>
              );
            })}
          </div>
          <div style={{fontSize:10.5,color:"var(--dim)",marginTop:6}}>{data.tipo==="devolucion_reserva"?"Si no aparece la reserva, podés seleccionarla más adelante y completar los datos manualmente.":"Si el refuerzo no corresponde a ninguna reserva cargada, seguí normalmente y completá los datos manualmente en el paso siguiente."}</div>
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
            <button type="button" key={key} onClick={function(){onSelect(key);}}
              style={{padding:"20px 16px",borderRadius:14,textAlign:"left",cursor:"pointer",
                border:"2px solid "+borders[key],background:colors[key],outline:"none",
                transition:"all 0.15s",display:"flex",flexDirection:"column",gap:6,
                gridColumn:key==="otros"?"span 2":"span 1"}}>
              <div style={{fontSize:28}}>{g.label.split(" ")[0]}</div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{g.label.slice(2)}</div>
              <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.4}}>{g.label==="📌 Otros"?g.tipos.map(function(t){return t.label;}).join(" · "):g.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OperacionForm({initial,clausulas,perfil,equipo,operaciones,onSave,onCancel,onTipoChange,saveStatus,reportSave,onAddClausula}){
  const [grupo,setGrupo]=useState(initial ? (
    ["reserva","boleto"].includes(initial.tipo)?"compra":
    ["alquiler","reserva_alquiler"].includes(initial.tipo)?"alquiler":
    ["refuerzo_reserva","devolucion_reserva","comodato","exclusividad"].includes(initial.tipo)?"otros":null
  ) : null);
  const [step,setStep]=useState(1);
  const [data,setData]=useState(initial ? limpiarComisionesIncompatibles(initial) : EMPTY_OP);

  // Cada vez que se entra a editar un documento, arrancamos siempre en
  // la sección de TIPO (2. TIPO), aunque el formulario haya quedado
  // anteriormente en otro paso.
  useEffect(function(){
    if(initial){
      setStep(2);
      setGrupo(
        ["reserva","boleto"].includes(initial.tipo)?"compra":
        ["alquiler","reserva_alquiler"].includes(initial.tipo)?"alquiler":
        ["refuerzo_reserva","devolucion_reserva","comodato","exclusividad"].includes(initial.tipo)?"otros":null
      );
    }
  },[initial]);
  // Al editar una operación ya guardada, se resaltan en rojo (en la barra de
  // pasos y en el campo puntual) los datos críticos que todavía faltan. En
  // una operación nueva no se muestra nada en rojo hasta que se guarde.
  const modoEdicion = !!initial;
  const faltantesDetalle = modoEdicion ? getCamposFaltantesDetalle(data) : [];
  const camposFaltantes = faltantesDetalle.map(function(f){return f.campo;});
  const pasosFaltantes = faltantesDetalle.reduce(function(acc,f){acc[f.paso]=true;return acc;},{});

  // Borrador local de máxima seguridad: cada cambio queda persistido en localStorage
  // inmediatamente, y además se hace un flush síncrono al salir/ocultar la
  // pestaña. Importante: NO se elimina al desmontar el componente, porque una recarga
  // del navegador también desmonta React; borrarlo ahí anulaba toda la red de seguridad.
  const initialIdRef = useRef(initial ? initial.id || null : null);
  const dataRef = useRef(data);
  useEffect(function(){ dataRef.current=data; }, [data]);
  const draftPayload = useMemo(function(){
    return draftTieneContenido(data) ? { data:data, editId:initialIdRef.current } : null;
  }, [data]);
  function guardarDraftLocalAhora(){
    var actual=dataRef.current;
    if(!draftTieneContenido(actual)) return true;
    return lsSet("draftOperacion", {data:actual, editId:initialIdRef.current, ts:Date.now()});
  }
  // En el formulario el guardado es inmediato (sin debounce): cada cambio de un
  // campo se escribe en el navegador antes de seguir con el siguiente paso.
  useAutosave("draftOperacion", draftPayload, 0, reportSave);

  // Salvaguarda para cierres/reloads rápidos y para móviles donde beforeunload
  // no siempre se dispara. pagehide + visibilitychange usan el mismo snapshot.
  useEffect(function(){
    function flushDraft(){ guardarDraftLocalAhora(); }
    function beforeUnload(e){
      if(!draftTieneContenido(dataRef.current)) return;
      flushDraft();
      e.preventDefault();
      e.returnValue = "";
    }
    function onVisibility(){ if(document.visibilityState==="hidden") flushDraft(); }
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("pagehide", flushDraft);
    document.addEventListener("visibilitychange", onVisibility);
    return function(){
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("pagehide", flushDraft);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  // Cláusulas por defecto configuradas por el admin/dueño (Configuración → Cláusulas
  // por defecto): al elegir el tipo de documento en una operación NUEVA, se
  // preseleccionan automáticamente (filtradas por las que aplican a ese tipo).
  // Si ya se está editando una operación existente, no se tocan sus cláusulas.
  const set=useCallback(function(k,v){setData(function(d){
    var next=Object.assign({},d,{[k]:v});
    if(k==="tipo"){
      if(onTipoChange)onTipoChange(v);
      if(v==="alquiler" || v==="reserva_alquiler") next=limpiarComisionesIncompatibles(next);
      if(v==="exclusividad"){
        // La Autorización de Venta no tiene un "Interesado": la segunda parte es
        // la propia inmobiliaria que firma como autorizada. Se guarda usando los
        // campos comprador_* por compatibilidad con el generador existente, pero
        // sus datos provienen automáticamente del perfil de la inmobiliaria.
        next.comprador_nombre = perfil && perfil.nombre ? perfil.nombre : (d.comprador_nombre||"");
        next.comprador_dni = perfil && perfil.cuit ? perfil.cuit : (d.comprador_dni||"");
        next.comprador_domicilio = perfil && perfil.direccion ? perfil.direccion : (d.comprador_domicilio||"");
        next.comprador_email = perfil && perfil.email ? perfil.email : (d.comprador_email||"");
        next.comprador_telefono = perfil && perfil.telefono ? perfil.telefono : (d.comprador_telefono||"");
        next.exclusividad_inmobiliaria_autofill = true;
      }
      if(!initial && (!d.clausulas_ids||!d.clausulas_ids.length)){
        // Unión de: (a) predeterminadas que eligió el admin en Configuración → Plantillas,
        // y (b) obligatorias — estas últimas se incluyen siempre, aunque el admin no las
        // haya marcado también como predeterminadas, porque "obligatoria" es una garantía
        // más fuerte que "predeterminada" (ver StepClausulas: el broker no puede sacarlas).
        var plantillaCfg=obtenerPlantillaConfig(perfil,v,clausulas);
        var defaultsIds=plantillaCfg.clausulas_ids||[];
        var obligatoriasIds=clausulas.filter(function(c){return c.obligatoria&&clausulaAplicaTipo(c,v);}).map(function(c){return c.id;});
        var unionIds=defaultsIds.concat(obligatoriasIds).filter(function(cid,idx,arr){return arr.indexOf(cid)===idx;});
        next.clausulas_ids=unionIds.filter(function(cid){
          var c=clausulas.find(function(x){return x.id===cid;});
          return c&&clausulaAplicaTipo(c,v);
        });
      }
    }
    return next;
  });},[onTipoChange,perfil,clausulas,initial]);
  const setBulk=useCallback(function(patch){setData(function(d){return Object.assign({},d,patch);});},[]);

  // Si el perfil de la inmobiliaria termina de cargar después de abrir el formulario,
  // completamos la parte "Inmobiliaria autorizada" sin pedirle al usuario que vuelva
  // a escribir los datos. Solo reemplazamos valores vacíos o previamente marcados
  // como autocompletados por DocWorks.
  useEffect(function(){
    if(data.tipo!=="exclusividad" || !perfil) return;
    setData(function(d){
      var next=Object.assign({},d);
      var changed=false;
      function fill(k,v){ if(!v) return; if(!d[k] || d.exclusividad_inmobiliaria_autofill){ next[k]=v; if(next[k]!==d[k]) changed=true; } }
      fill("comprador_nombre",perfil.nombre);
      fill("comprador_dni",perfil.cuit);
      fill("comprador_domicilio",perfil.direccion);
      fill("comprador_email",perfil.email);
      fill("comprador_telefono",perfil.telefono);
      if(!d.exclusividad_inmobiliaria_autofill){ next.exclusividad_inmobiliaria_autofill=true; changed=true; }
      return changed?next:d;
    });
  },[data.tipo,perfil&&perfil.nombre,perfil&&perfil.cuit,perfil&&perfil.direccion,perfil&&perfil.email,perfil&&perfil.telefono]);

  // Al elegir "Refuerzo de Reserva" desde cero (no viene de convertirARefuerzo,
  // que ya trae parent_id), se ofrece elegir una reserva abierta reciente para
  // no volver a tipear todos los datos de las partes y el inmueble.
  function elegirReservaParaDevolucion(op){
    setBulk({
      parent_id: op.id,
      comprador_nombre:op.comprador_nombre||"", comprador_dni:op.comprador_dni||"", comprador_domicilio:op.comprador_domicilio||"",
      vendedor_nombre:op.vendedor_nombre||"", vendedor_dni:op.vendedor_dni||"", vendedor_domicilio:op.vendedor_domicilio||"",
      inmueble_direccion:op.inmueble_direccion||"", inmueble_partido:op.inmueble_partido||"", inmueble_provincia:op.inmueble_provincia||"",
      inmueble_tipo:op.inmueble_tipo||"departamento", inmueble_tipo_otro:op.inmueble_tipo_otro||"", inmueble_unidad_funcional:op.inmueble_unidad_funcional||"",
      precio:op.anticipo||op.precio||"", moneda:op.moneda||"USD",
      devolucion_motivo:"La reserva no avanzó y corresponde devolver el monto oportunamente entregado.",
      clausulas_ids:op.clausulas_ids||[]
    });
  }
  function elegirReservaParaRefuerzo(op){
    setBulk({
      parent_id: op.id,
      comprador_nombre:op.comprador_nombre||"", comprador_dni:op.comprador_dni||"",
      comprador_domicilio:op.comprador_domicilio||"", comprador_email:op.comprador_email||"", comprador_telefono:op.comprador_telefono||"",
      vendedor_nombre:op.vendedor_nombre||"", vendedor_dni:op.vendedor_dni||"",
      vendedor_domicilio:op.vendedor_domicilio||"", vendedor_email:op.vendedor_email||"", vendedor_telefono:op.vendedor_telefono||"",
      inmueble_direccion:op.inmueble_direccion||"", inmueble_partido:op.inmueble_partido||"",
      inmueble_provincia:op.inmueble_provincia||"", inmueble_tipo:op.inmueble_tipo||"departamento", inmueble_tipo_otro:op.inmueble_tipo_otro||"",
      inmueble_unidad_funcional:op.inmueble_unidad_funcional||"",
      refuerzo_trayectoria:"Reserva original firmada el "+new Date(op.created_at).toLocaleDateString("es-AR")+" por "+fmt$(op.anticipo,op.moneda)+" de seña sobre precio total "+fmt$(op.precio,op.moneda)+".",
      clausulas_ids:op.clausulas_ids||[], clausulas_custom:op.clausulas_custom||"", clausulas_custom_titulo:op.clausulas_custom_titulo||"",
    });
  }
  const esAlq=data.tipo==="alquiler",esResAlq=data.tipo==="reserva_alquiler";
  const esComodato=data.tipo==="comodato",esExclusividad=data.tipo==="exclusividad";
  const esRefuerzo=data.tipo==="refuerzo_reserva",esDevolucion=data.tipo==="devolucion_reserva";
  const esDocSimple=esComodato||esExclusividad||esRefuerzo||esDevolucion;
  const total=esAlq?7:esResAlq?6:esDocSimple?5:6;
  // If no group selected yet (new op), show group picker
  if(!grupo){
    return(
      <div>
        <StepBar current={0} tipo={data.tipo}/>
        <div style={{minHeight:260,paddingTop:10}}>
          <StepGrupo onSelect={function(g){setGrupo(g);setStep(1);set("tipo",TIPO_GRUPOS[g].tipos[0].value);}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-start",paddingTop:16,borderTop:"1px solid var(--border)",marginTop:14}}>
          <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>
        </div>
        {saveStatus&&<div style={{display:"flex",justifyContent:"flex-end",paddingTop:8}}><AutosaveIndicator status={saveStatus} compact={true}/></div>}
      </div>
    );
  }

  function renderStep(){
    if(esAlq){
      if(step===1)return <StepTipo data={data} onChange={set} grupo="alquiler"/>;
      if(step===2)return <StepPersona data={data} onChange={set} prefix="locador" titulo="Locador (propietario)" faltantes={camposFaltantes}/>;
      if(step===3)return <StepPersona data={data} onChange={set} prefix="locatario" titulo="Locatario (inquilino)" faltantes={camposFaltantes}/>;
      if(step===4)return <StepInmueble data={data} onChange={set} faltantes={camposFaltantes}/>;
      if(step===5)return <StepCondicionesAlquiler data={data} onChange={set} equipo={equipo} faltantes={camposFaltantes}/>;
      if(step===6)return <StepGarantia data={data} onChange={set}/>;
      if(step===7)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={true} onAddClausula={onAddClausula} perfil={perfil}/>;
    }
    if(esResAlq){
      if(step===1)return <StepTipo data={data} onChange={set} grupo="alquiler"/>;
      if(step===2)return <StepPersona data={data} onChange={set} prefix="locatario" titulo="Locatario (inquilino)" faltantes={camposFaltantes}/>;
      if(step===3)return <StepPersona data={data} onChange={set} prefix="locador" titulo="Locador (propietario)" faltantes={camposFaltantes}/>;
      if(step===4)return <StepInmueble data={data} onChange={set} faltantes={camposFaltantes}/>;
      if(step===5)return <StepCondicionesReservaAlq data={data} onChange={set} equipo={equipo} faltantes={camposFaltantes}/>;
      if(step===6)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={true} onAddClausula={onAddClausula} perfil={perfil}/>;
    }
    if(esDocSimple){
      var grupoReal=grupo||"otros";
      if(step===1)return <StepTipo data={data} onChange={set} grupo={grupoReal} operaciones={operaciones} onSelectReservaRefuerzo={elegirReservaParaRefuerzo} onSelectReservaDevolucion={elegirReservaParaDevolucion}/>;
      if(step===2)return data.tipo==="exclusividad" ? <StepInmobiliariaAutorizada data={data} perfil={perfil}/> : <StepPersona data={data} onChange={set} prefix="comprador" titulo={data.tipo==="comodato"?"Comodatario (recibe el bien)":data.tipo==="refuerzo_reserva"||data.tipo==="devolucion_reserva"?"Comprador":"Parte solicitante"} faltantes={camposFaltantes}/>;
      if(step===3)return <StepPersona data={data} onChange={set} prefix="vendedor" titulo={data.tipo==="comodato"?"Comodante (propietario)":data.tipo==="exclusividad"?"Propietario":data.tipo==="refuerzo_reserva"||data.tipo==="devolucion_reserva"?"Vendedor":"Propietario / Contraparte"} faltantes={camposFaltantes}/>;
      if(step===4)return <StepDocSimple data={data} onChange={set}/>;
      if(step===5)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={false} onAddClausula={onAddClausula} perfil={perfil}/>;
      return null;
    }
    // Compra normal (reserva / boleto)
    if(step===1)return <StepTipo data={data} onChange={set} grupo="compra"/>;
    if(step===2)return <StepPersona data={data} onChange={set} prefix="comprador" titulo="Comprador" faltantes={camposFaltantes}/>;
    if(step===3)return <StepPersona data={data} onChange={set} prefix="vendedor" titulo="Vendedor" faltantes={camposFaltantes}/>;
    if(step===4)return <StepInmueble data={data} onChange={set} faltantes={camposFaltantes}/>;
    if(step===5)return <StepEconomicoCompra data={data} onChange={set} equipo={equipo} faltantes={camposFaltantes}/>;
    if(step===6)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={false} onAddClausula={onAddClausula} perfil={perfil}/>;
    return null;
  }
  var pct=Math.min(100,Math.round((step/total)*100));
  function handleFinalizarAccion(accion,estadoFinal){
    var toGuardar = Object.assign({},limpiarComisionesIncompatibles(data),{estado:estadoFinal||data.estado||"borrador"});
    onSave(toGuardar, accion, estadoFinal||toGuardar.estado);
  }
  return(
    <div>
      {modoEdicion&&faltantesDetalle.length>0&&(
        <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",marginBottom:10,fontSize:12.5,color:"var(--red)"}}>
          <span>⚠</span>
          <span>Faltan {faltantesDetalle.length} dato{faltantesDetalle.length===1?"":"s"} clave: {faltantesDetalle.map(function(f){return f.label;}).join(", ")}.</span>
        </div>
      )}
      <div style={{marginBottom:10}}><StepBar current={step} tipo={data.tipo} pasosFaltantes={pasosFaltantes} onGoTo={function(id){setStep(id);}}/></div>
      <div style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:10.5,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Progreso</span>
          <span style={{fontSize:12,fontWeight:700,color:pct===100?"var(--green)":"var(--gold)"}}>{pct}%</span>
        </div>
        <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"}}>
          <div style={{height:"100%",width:pct+"%",background:pct===100?"linear-gradient(90deg,#22c55e,#4ade80)":"linear-gradient(90deg,#c9962a,var(--gold),var(--gold2))",borderRadius:10,transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)"}}/>
        </div>
      </div>
      <div style={{minHeight:260}}>{step<=total?renderStep():<PasoResumenFinal data={data} clausulas={clausulas} onVolver={function(){setStep(total);}} onFinalizarAccion={handleFinalizarAccion}/>}</div>
      {step<=total&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:16,borderTop:"1px solid var(--border)",marginTop:14}}>
        <Btn v="ghost" onClick={step===1?function(){setGrupo(null);}:function(){setStep(function(s){return s-1;});}}>{step===1?"← Cambiar grupo":"← Anterior"}</Btn>
        {modoEdicion ? (
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Btn v="success" onClick={function(){handleFinalizarAccion("guardar");}}>💾 Guardar cambios</Btn>
            {step<total&&<Btn onClick={function(){setStep(function(s){return s+1;});}}>Siguiente →</Btn>}
            {step===total&&<Btn onClick={function(){setStep(total+1);}}>Revisar →</Btn>}
          </div>
        ) : (step<total?<Btn onClick={function(){setStep(function(s){return s+1;});}}>Siguiente →</Btn>:<Btn v="success" onClick={function(){setStep(total+1);}}>Revisar y finalizar →</Btn>)}
      </div>}
      {saveStatus&&<div style={{display:"flex",justifyContent:"flex-end",paddingTop:8}}><AutosaveIndicator status={saveStatus} compact={true}/></div>}
    </div>
  );
}

// ── RESUMEN DE OPERACIÓN (panel previo a leer el documento) ─────────────────
var RESUMEN_ROLES_POR_TIPO = {
  alquiler:            [["locador","Locador"],["locatario","Locatario"]],
  reserva_alquiler:    [["locador","Locador"],["locatario","Locatario"]],
  comodato:            [["vendedor","Comodante"],["comprador","Comodatario"]],
  exclusividad:        [["vendedor","Propietario"]],
  refuerzo_reserva:    [["comprador","Comprador"],["vendedor","Vendedor"]],
  devolucion_reserva:  [["comprador","Comprador"],["vendedor","Vendedor"]],
};
function getResumenPartes(op){
  var roles = RESUMEN_ROLES_POR_TIPO[op.tipo] || [["comprador","Comprador"],["vendedor","Vendedor"]];
  return roles.map(function(r){
    return {label:r[1], nombre:op[r[0]+"_nombre"]||"", dni:op[r[0]+"_dni"]||""};
  });
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
  function Tarjeta(props){return <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:12,padding:"12px 14px",marginBottom:10}}><div style={{fontSize:10.5,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{props.t}</div>{props.children}</div>;}
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
          <span>Faltan {faltantes.length} dato{faltantes.length===1?"":"s"} clave: {faltantes.map(function(f){return f.label;}).join(", ")}. Podés volver a completarlos o emitir igual.</span>
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
        {(data.tipo==="alquiler")&&<Fila k="Inicio / Fin" v={[fmtD(data.alquiler_inicio),fmtD(data.alquiler_fin)].filter(Boolean).join(" → ")}/>}
        {(data.tipo==="reserva"||data.tipo==="boleto"||data.tipo==="exclusividad")&&<Fila k="Comisión" v={[data.comision_vendedor?resumenComision(data,"comision_vendedor",data.tipo==="exclusividad"?"Propietario":"Vendedor","Precio total",parseFloat(data.precio||0),data.moneda||"USD","comision_vendedor",data.tipo==="exclusividad"?"3":"4"):null,data.comision_comprador?resumenComision(data,"comision_comprador","Comprador","Precio total",parseFloat(data.precio||0),data.moneda||"USD","comision_comprador","3"):null].filter(Boolean).join(" · ")}/>}
        {(data.tipo==="alquiler"||data.tipo==="reserva_alquiler")&&<Fila k="Comisión" v={getComisionComponents(data).map(function(c){return resumenComision(data,c.prefix,c.rol,c.prefix.indexOf("res_alq_")===0?"canon mensual":"total del contrato",c.base,c.baseMoneda,c.prefix,(c.prefix.indexOf("res_alq_")===0?data.res_alq_comision:data.alquiler_comision)||"1");}).join(" · ")}/>}
      </Tarjeta>
      <Tarjeta t={"Cláusulas ("+(clausulasSel.length+(data.clausulas_custom?1:0))+")"}>
        {clausulasSel.length===0&&!data.clausulas_custom&&<div style={{fontSize:12,color:"var(--dim)"}}>Sin cláusulas seleccionadas.</div>}
        {clausulasSel.map(function(c){return <Fila key={c.id} k={c.titulo} v="✓"/>;})}
        {data.clausulas_custom&&<Fila k={data.clausulas_custom_titulo||"Cláusula adicional"} v="✓"/>}
      </Tarjeta>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:16,borderTop:"1px solid var(--border)",marginTop:6}}>
        <Btn v="ghost" onClick={onVolver}>← Volver a editar</Btn>
        <Btn v="success" onClick={abrirMenu}>Finalizar ✓</Btn>
      </div>
      <Modal open={showMenu} onClose={function(){setShowMenu(false);}} title={menuPaso==="estado"?"¿Cómo querés dejar la operación?":"Documento listo para guardar"}>
        {menuPaso==="estado" ? <div>
          <div style={{fontSize:12.5,color:"var(--muted)",lineHeight:1.5,marginBottom:12}}>Elegí el estado definitivo. Esto se guarda junto con el documento.</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:9}}>
            {estados.map(function(e){var sel=estadoFinal===e.id;return <button type="button" key={e.id} onClick={function(){setEstadoFinal(e.id);setMenuPaso("acciones");}} style={{padding:"14px 12px",borderRadius:12,border:"1px solid "+(sel?e.tone:"var(--border2)"),background:sel?"rgba(212,168,83,.07)":"var(--card)",cursor:"pointer",textAlign:"left",minHeight:118}}>
              <div style={{fontSize:18,color:e.tone,fontWeight:800,marginBottom:7}}>{e.icon}</div><div style={{fontSize:13,fontWeight:800,color:"var(--text)",marginBottom:4}}>{e.label}</div><div style={{fontSize:10.5,color:"var(--dim)",lineHeight:1.4}}>{e.desc}</div>
            </button>;})}
          </div>
        </div> : <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(212,168,83,.06)",border:"1px solid rgba(212,168,83,.20)",marginBottom:12}}>
            <div><div style={{fontSize:10,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em"}}>Estado elegido</div><div style={{fontSize:14,fontWeight:800,color:"var(--text)",marginTop:2}}>{ESTADOS[estadoFinal]}</div></div>
            <button type="button" onClick={function(){setMenuPaso("estado");}} style={{border:"none",background:"transparent",color:"var(--gold)",cursor:"pointer",fontSize:11,fontWeight:700}}>Cambiar</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <Btn onClick={function(){setShowMenu(false);onFinalizarAccion("pdf",estadoFinal);}} className="w-full">📄 Guardar y abrir PDF / Word</Btn>
            <Btn v="secondary" onClick={function(){setShowMenu(false);onFinalizarAccion("whatsapp",estadoFinal);}} className="w-full">💬 Guardar y enviar por WhatsApp</Btn>
            <Btn v="secondary" onClick={function(){setShowMenu(false);onFinalizarAccion("guardar",estadoFinal);}} className="w-full">💾 Guardar y terminar</Btn>
          </div>
          <div style={{fontSize:10.5,color:"var(--dim)",marginTop:10,lineHeight:1.5}}>La elección Borrador / Activo / Cerrado queda registrada en la operación. El contenido del documento no se modifica.</div>
        </div>}
      </Modal>
    </div>
  );
}
function NegociacionPanel({op,onUpdate}){
  var historial=Array.isArray(op.negociacion_historial)?op.negociacion_historial:[];
  var ultimo=historial.length?historial[historial.length-1]:null;
  const [parte,setParte]=useState(ultimo&&ultimo.parte||"comprador");
  const [monto,setMonto]=useState(ultimo&&ultimo.monto||op.precio||"");
  const [moneda,setMoneda]=useState(ultimo&&ultimo.moneda||op.moneda||"USD");
  const [venc,setVenc]=useState(ultimo&&ultimo.vencimiento||op.reserva_aceptacion_vencimiento||"");
  const [obs,setObs]=useState("");
  function agregar(){
    if(!String(monto).trim() && !String(obs).trim() && !venc) return;
    var item={id:genId(),fecha:fechaHoyISO(),parte:parte,monto:String(monto||""),moneda:moneda,vencimiento:venc,observacion:String(obs||"").trim()};
    var next=Object.assign({},op,{negociacion_historial:historial.concat([item]),reserva_aceptacion_vencimiento:venc||op.reserva_aceptacion_vencimiento,proceso_estado:"en_negociacion"});
    onUpdate(next); setObs("");
  }
  return <div className="card negociacion-panel" style={{padding:16,marginBottom:12,border:"1px solid rgba(96,165,250,.20)",background:"rgba(96,165,250,.035)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10,flexWrap:"wrap"}}>
      <div><div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em"}}>Negociación</div><div style={{fontSize:12,color:"#cbd5e1",marginTop:3}}>Registrá cada propuesta sin crear otra operación.</div></div>
      {ultimo&&<span style={{fontSize:11,fontWeight:700,color:"var(--gold)"}}>Último valor: {ultimo.moneda||"USD"} {ultimo.monto||"—"}</span>}
    </div>
    {historial.length>0&&<div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>{historial.map(function(h,i){return <div key={h.id||i} style={{display:"grid",gridTemplateColumns:"92px 1fr auto",gap:8,alignItems:"center",padding:"7px 8px",border:"1px solid var(--border)",borderRadius:8,background:"rgba(255,255,255,.018)",fontSize:11.5}}><span style={{color:"var(--dim)"}}>{fmtD(h.fecha)}</span><span style={{color:"var(--text)"}}><b>{h.parte==="vendedor"?"Vendedor":"Comprador"}</b>{h.observacion?" · "+h.observacion:""}</span><span style={{color:"var(--gold)",fontWeight:700,whiteSpace:"nowrap"}}>{fmt$(h.monto,h.moneda||"USD")}{h.vencimiento?" · vence "+fmtD(h.vencimiento):""}</span></div>;})}</div>}
    {op.estado!=="cerrado"&&<div style={{paddingTop:11,borderTop:"1px dashed var(--border2)"}}><div className="grid2">
      <Slt label="Propuesta de" value={parte} onChange={function(e){setParte(e.target.value);}}><option value="comprador">Comprador</option><option value="vendedor">Vendedor</option></Slt>
      <div className="grid2" style={{gap:8}}><Inp label="Monto" type="number" value={monto} onChange={function(e){setMonto(e.target.value);}}/><Slt label="Moneda" value={moneda} onChange={function(e){setMoneda(e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt></div>
      <Inp label="Nuevo vencimiento de aceptación" type="date" value={venc} onChange={function(e){setVenc(e.target.value);}} className="col2"/>
      <Txa label="Observación" rows={2} value={obs} onChange={function(e){setObs(e.target.value);}} placeholder="Ej. El propietario acepta este valor y solicita 3 días más…" className="col2"/>
    </div><div style={{display:"flex",justifyContent:"flex-end",marginTop:9}}><Btn v="primary" s="sm" onClick={agregar}>+ Registrar contraoferta</Btn></div></div>}
  </div>;
}

function ReservaDecisionPanel({op,onUpdate,onAction}){
  if(!op||op.tipo!=="reserva") return null;
  const [confirmarRechazo,setConfirmarRechazo]=useState(false);
  const [mensaje,setMensaje]=useState("");
  const [guardando,setGuardando]=useState(false);

  async function aceptar(){
    setGuardando(true); setMensaje("");
    var res=await onUpdate(Object.assign({},op,{proceso_estado:"aceptada"}));
    setGuardando(false);
    if(!res || !res.error) setMensaje("Reserva aceptada. La aceptación queda asentada en esta misma Reserva de Compra.");
  }
  async function rechazar(){
    setGuardando(true); setMensaje("");
    var res=await onUpdate(Object.assign({},op,{proceso_estado:"rechazada"}));
    setGuardando(false);
    if(!res || !res.error) setConfirmarRechazo(true);
  }
  async function seguirNegociando(){
    setGuardando(true); setMensaje("");
    var res=await onUpdate(Object.assign({},op,{proceso_estado:"en_negociacion"}));
    setGuardando(false);
    if(!res || !res.error) setMensaje("La reserva quedó en negociación. Registrá las nuevas propuestas debajo.");
  }
  return <div className="card reserva-decision-panel">
    <div className="reserva-decision-title">Estado de la reserva</div>
    <div className="reserva-decision-sub">Elegí el próximo paso sin crear otro documento para la aceptación.</div>
    {!confirmarRechazo ? (
      <div className="reserva-decision-actions">
        <Btn v="success" s="sm" onClick={aceptar} disabled={guardando}>Aceptar reserva</Btn>
        <Btn v="danger" s="sm" onClick={rechazar} disabled={guardando}>Reserva rechazada</Btn>
        <Btn v="secondary" s="sm" onClick={seguirNegociando} disabled={guardando}>Seguir negociando</Btn>
      </div>
    ) : (
      <div className="reserva-rechazo-confirm">
        <div className="reserva-rechazo-question">¿Querés que preparemos la devolución de la reserva?</div>
        <div className="reserva-rechazo-help">Se abrirá la Devolución de Reserva con los datos de esta operación ya completados.</div>
        <div className="reserva-decision-actions">
          <Btn v="danger" s="sm" onClick={function(){if(onAction)onAction("devolucion");}}>Sí, preparar devolución</Btn>
          <Btn v="ghost" s="sm" onClick={function(){setConfirmarRechazo(false);}}>No, dejarla rechazada</Btn>
        </div>
      </div>
    )}
    {mensaje&&<div className="reserva-decision-message">✓ {mensaje}</div>}
  </div>;
}

function FichaPersonaInterna({label,persona}){
  if(!persona) return null;
  var nombre=persona.nombre||"Sin informar";
  var inicial=(nombre.trim().charAt(0)||"?").toUpperCase();
  return <div style={{padding:"12px 14px",borderRadius:12,border:"1px solid var(--border)",background:"rgba(255,255,255,.018)"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
      <div style={{width:38,height:38,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.18)",color:"var(--gold)",fontWeight:800}}>{inicial}</div>
      <div style={{minWidth:0,flex:1}}>
        <div style={{fontSize:10,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>{label}</div>
        <div style={{fontSize:14,color:"var(--text)",fontWeight:700,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nombre}</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:7,fontSize:11.5}}>
      {persona.dni&&<div><div style={{color:"var(--dim)",fontSize:9.5,textTransform:"uppercase"}}>DNI / CUIT</div><div style={{color:"var(--text)",marginTop:2}}>{persona.dni}</div></div>}
      {persona.domicilio&&<div><div style={{color:"var(--dim)",fontSize:9.5,textTransform:"uppercase"}}>Domicilio</div><div style={{color:"var(--text)",marginTop:2}}>{persona.domicilio}</div></div>}
      {persona.telefono&&<div><div style={{color:"var(--dim)",fontSize:9.5,textTransform:"uppercase"}}>Teléfono interno</div><div style={{color:"var(--text)",marginTop:2}}>{persona.telefono}</div></div>}
      {persona.email&&<div><div style={{color:"var(--dim)",fontSize:9.5,textTransform:"uppercase"}}>Correo electrónico interno</div><div style={{color:"var(--text)",marginTop:2,wordBreak:"break-word"}}>{persona.email}</div></div>}
    </div>
  </div>;
}
function FichaOperacionPanel({op,operaciones,onClose,embedded}){
  var esAlq=op.tipo==="alquiler"||op.tipo==="reserva_alquiler";
  var roles=esAlq?[
    {prefix:"locatario",label:"Inquilino"},{prefix:"locador",label:"Propietario"}
  ]:[
    {prefix:"comprador",label:"Comprador"},{prefix:"vendedor",label:"Vendedor"}
  ];
  var historial=Array.isArray(op.negociacion_historial)?op.negociacion_historial:[];
  var hijos=(operaciones||[]).filter(function(x){return x.parent_id===op.id;}).sort(function(a,b){return new Date(a.created_at)-new Date(b.created_at);});
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
            <div><div style={{fontSize:9.5,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{label}{i>0?" · Co-titular "+i:""}</div><div style={{fontSize:13.5,fontWeight:700,color:"var(--text)",marginTop:2}}>{persona.nombre||"Sin informar"}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,fontSize:11.2}}>
            {persona.dni&&<div><div style={{fontSize:9,color:"var(--dim)",textTransform:"uppercase"}}>DNI / CUIT</div><div style={{marginTop:2,color:"var(--text)"}}>{persona.dni}</div></div>}
            {persona.domicilio&&<div><div style={{fontSize:9,color:"var(--dim)",textTransform:"uppercase"}}>Domicilio</div><div style={{marginTop:2,color:"var(--text)"}}>{persona.domicilio}</div></div>}
            {persona.telefono&&<div><div style={{fontSize:9,color:"var(--dim)",textTransform:"uppercase"}}>Teléfono interno</div><div style={{marginTop:2,color:"var(--text)"}}>{persona.telefono}</div></div>}
            {persona.email&&<div><div style={{fontSize:9,color:"var(--dim)",textTransform:"uppercase"}}>Correo electrónico interno</div><div style={{marginTop:2,color:"var(--text)",wordBreak:"break-word"}}>{persona.email}</div></div>}
          </div>
        </div>;
      })}
    </div>;
  }
  return <div className="doc-ficha-panel" style={{display:"flex",flexDirection:"column",gap:12,minHeight:0,height:"100%",overflow:"hidden"}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flex: "0 0 auto"}}>
      <div><div style={{fontSize:18,fontFamily:"DM Serif Display,serif",color:"var(--text)"}}>Ficha de la operación</div><div style={{fontSize:11,color:"var(--dim)",marginTop:3}}>Centro de seguimiento. Teléfonos y emails son internos y no se imprimen en el contrato.</div></div>
      {!embedded && onClose&&<Btn v="ghost" s="sm" onClick={onClose}>Cerrar</Btn>}
    </div>
    <div style={{display:"flex",gap:4,overflowX:"auto",borderBottom:"1px solid var(--border)"}}>{tabs.map(function(t){return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{padding:"8px 12px",border:"none",borderBottom:tab===t[0]?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:tab===t[0]?"var(--gold)":"var(--dim)",fontSize:11.5,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t[1]}</button>;})}</div>
    {tab==="resumen"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div className="card" style={{padding:14,border:"1px solid rgba(212,168,83,.22)",background:"linear-gradient(135deg,rgba(212,168,83,.05),transparent)"}}>
        <div style={{fontSize:10,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Próximo paso</div>
        <div style={{display:"flex",alignItems:"center",gap:9,marginTop:7}}><span style={{fontSize:18,color:proximo.tone}}>{proximo.icon}</span><div style={{fontSize:13.5,fontWeight:700,color:"var(--text)"}}>{proximo.texto}</div></div>
      </div>
      <div className="grid2">
        <div className="card" style={{padding:14}}><div style={{fontSize:10,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Operación</div><div style={{fontSize:12,lineHeight:1.8,color:"var(--text)"}}><div><span style={{color:"var(--dim)"}}>Documento:</span> <b>{TIPOS[op.tipo]||op.tipo}</b></div><div><span style={{color:"var(--dim)"}}>Estado:</span> <b>{ESTADOS[op.estado]||op.estado}</b></div><div><span style={{color:"var(--dim)"}}>Proceso:</span> <b style={{color:"var(--gold)"}}>{String(op.proceso_estado||"pendiente_aceptacion").replace(/_/g," ")}</b></div><div><span style={{color:"var(--dim)"}}>Monto:</span> <b>{getResumenMonto(op)||"—"}</b></div></div></div>
        <div className="card" style={{padding:14}}><div style={{fontSize:10,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Inmueble</div><div style={{fontSize:12,lineHeight:1.7,color:"var(--text)"}}>{tipoInmuebleLabel(op.inmueble_tipo,op.inmueble_tipo_otro)}<div style={{marginTop:4}}>{op.inmueble_direccion||"Sin dirección"}</div><div style={{color:"var(--dim)",marginTop:2}}>{[op.inmueble_partido,op.inmueble_provincia].filter(Boolean).join(" — ")}</div></div></div>
      </div>
      {venc&&<div className="card" style={{padding:14}}><div style={{fontSize:10,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Vencimiento de aceptación</div><div style={{marginTop:5,fontSize:14,fontWeight:800,color:proximo.tone}}>{fmtD(venc)}</div></div>}
    </div>}
    {tab==="personas"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>{roles.map(function(r){return <PersonaGrupo key={r.prefix} prefix={r.prefix} label={r.label}/>;})}<div style={{fontSize:10.5,color:"var(--dim)",padding:"3px 2px"}}>🔒 Los teléfonos y emails de esta ficha son internos y no forman parte del documento contractual.</div></div>}
    {tab==="negociacion"&&<div>{historial.length?historial.slice().reverse().map(function(h,i){return <div key={h.id||i} style={{display:"grid",gridTemplateColumns:"86px 1fr auto",gap:8,alignItems:"center",padding:"9px 8px",borderBottom:"1px solid var(--border)",fontSize:11.5}}><span style={{color:"var(--dim)"}}>{fmtD(h.fecha)}</span><span style={{color:"var(--text)"}}><b>{h.parte==="vendedor"?"Vendedor":"Comprador"}</b>{h.observacion?" · "+h.observacion:""}{h.vencimiento&&<div style={{fontSize:10,color:"var(--dim)",marginTop:2}}>Vence {fmtD(h.vencimiento)}</div>}</span><span style={{color:"var(--gold)",fontWeight:800,whiteSpace:"nowrap"}}>{fmt$(h.monto,h.moneda||"USD")}</span></div>;}):<div className="card" style={{padding:20,textAlign:"center",color:"var(--dim)",fontSize:12}}>Todavía no hay movimientos registrados.</div>}</div>}
    {tab==="documentos"&&<div style={{display:"flex",flexDirection:"column",gap:7}}>{docs.map(function(d){return <div key={d.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 12px",border:"1px solid var(--border)",borderRadius:10}}><div><div style={{fontSize:12.5,fontWeight:700,color:"var(--text)"}}>{TIPO_ICON[d.tipo]||"📄"} {TIPOS[d.tipo]||d.tipo}</div><div style={{fontSize:10.5,color:"var(--dim)",marginTop:2}}>{d.id===op.id?"Operación principal":"Documento vinculado"}</div></div><span className={"badge "+(ESTADO_BADGE_CLS[d.estado]||"")}>{ESTADOS[d.estado]||d.estado}</span></div>;})}</div>}
    {tab==="agenda"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{timeline.length?timeline.map(function(e,i){var futura=new Date(e.fecha)>new Date();return <div key={i} style={{display:"flex",gap:9}}><div style={{width:9,height:9,borderRadius:"50%",marginTop:5,background:futura?"var(--gold)":"var(--green)",flexShrink:0}}/><div><div style={{fontSize:10,color:"var(--dim)"}}>{fmtD(e.fecha)}</div><div style={{fontSize:12.5,fontWeight:700,color:"var(--text)",marginTop:2}}>{e.icon} {e.titulo}</div>{e.detalle&&<div style={{fontSize:10.5,color:"var(--muted)",marginTop:2}}>{e.detalle}</div>}</div></div>;}):<div className="card" style={{padding:20,textAlign:"center",color:"var(--dim)",fontSize:12}}>Todavía no hay hitos cargados.</div>}</div>}
  </div>;
}
function DocSummaryPanel({op, perfil, tabsDocs, onLeer, operaciones, onToggleTarea, onUpdateOperation, onActionWorkflow}){
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
        </div>
      </div>
      {(()=>{var pp=getProximoPasoOperacion(op,operaciones||[]);return <div className="card" style={{padding:"10px 12px",marginBottom:12,border:"1px solid rgba(212,168,83,.18)",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:15,color:pp.tone}}>{pp.icon}</span><div><div style={{fontSize:9.5,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Próximo paso</div><div style={{fontSize:12.5,color:"var(--text)",fontWeight:700,marginTop:2}}>{pp.texto}</div></div></div>;})()}
      <div className="card op-clean-card" style={{padding:16,marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Partes</div>
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
        <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Inmueble y monto</div>
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
      
      <div className="card op-clean-card" style={{padding:16,marginBottom:12,border:"1px solid "+(completo?"rgba(74,222,128,0.25)":"rgba(212,168,83,0.3)")}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Estado de los datos</div>
        {completo
          ? <div style={{fontSize:13,color:"var(--green)",display:"flex",alignItems:"center",gap:7}}>✓ Todos los datos críticos están completos.</div>
          : (
            <div>
              <div style={{fontSize:12.5,color:"var(--gold)",marginBottom:6}}>Faltan {faltantes.length} dato{faltantes.length===1?"":"s"} clave:</div>
              <ul style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:3}}>
                {faltantes.map(function(f,i){return <li key={i} style={{fontSize:12.5,color:"var(--muted)"}}>{f}</li>;})}
              </ul>
            </div>
          )
        }
      </div>

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
  var TABS=tiposDoc.map(function(t){return {id:t,label:TIPOS[t],icon:TIPO_ICON[t],esRecibo:false};});
  if(op.tipo==="reserva") TABS.push({id:"negociacion",label:"Negociación",icon:"↔",esNegociacion:true});
  TABS.unshift({id:"tareas",label:"Centro de tareas",icon:"✓",esTareas:true});
  if(tieneRecibos){
    var rolP1=op.tipo==="alquiler"?"Locador":"Vendedor";
    var rolP2=op.tipo==="alquiler"?"Locatario":"Comprador";
    TABS.push({id:"recibo_p1",label:"Recibo "+rolP1,icon:"🧾",esRecibo:true,dest:"parte1"});
    TABS.push({id:"recibo_p2",label:"Recibo "+rolP2,icon:"🧾",esRecibo:true,dest:"parte2"});
  }
  var TAB_RESUMEN={id:"resumen",label:"Resumen",icon:"📋",esResumen:true};
  var TAB_FICHA={id:"ficha",label:"Ver ficha completa",icon:"👤",esFicha:true};
  var TABS_ALL=[TAB_RESUMEN,TAB_FICHA].concat(TABS);
  var TABS_BARRA=[TAB_RESUMEN,TAB_FICHA].concat(TABS);
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
            style={{padding:"5px 11px",borderRadius:8,fontSize:11.5,fontFamily:"DM Sans,sans-serif",cursor:"pointer",whiteSpace:"nowrap",
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

function TareasPanel({op,onToggleTarea}){
  var tareas=getTareasDeOp(op);
  var tareasDone=op.tareas_done||{};
  var tareasHechas=tareas.filter(function(t){return tareasDone[t[0]];}).length;
  return <div className="card" style={{padding:18}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>Centro de tareas</div>
      <span style={{fontSize:11,color:tareasHechas===tareas.length?"var(--green)":"var(--dim)",fontWeight:600}}>{tareasHechas}/{tareas.length} completadas</span>
    </div>
    <div style={{height:5,borderRadius:3,background:"var(--border)",overflow:"hidden",marginBottom:14}}>
      <div style={{height:"100%",width:(tareas.length?(tareasHechas/tareas.length*100):0)+"%",background:tareasHechas===tareas.length?"var(--green)":"var(--gold)",transition:"width 0.2s"}}/>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      {tareas.map(function(t){var hecha=!!tareasDone[t[0]];return <div key={t[0]} onClick={function(){onToggleTarea&&onToggleTarea(op.id,t[0]);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 6px",cursor:onToggleTarea?"pointer":"default",borderRadius:8}}>
        <div style={{width:19,height:19,borderRadius:5,border:"1.5px solid "+(hecha?"var(--green)":"var(--border2)"),background:hecha?"var(--green)":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{hecha&&<span style={{color:"#0a0a0a",fontSize:11,fontWeight:700}}>✓</span>}</div>
        <span style={{fontSize:13,color:hecha?"var(--dim)":"var(--text)",textDecoration:hecha?"line-through":"none"}}>{t[1]}</span>
      </div>;})}
    </div>
  </div>;
}

function tituloDocumentoCorto(text,max){
  var value=String(text||"").trim();
  if(!value) return "Documento";
  var limite=max||32;
  return value.length>limite ? value.slice(0,limite-1).trimEnd()+"…" : value;
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

function DocumentBottomTabs({op,tab,onChange}){
  var items=[
    {id:"tareas",label:"Centro de tareas",icon:"✓"},
    {id:"reserva",label:"Reserva de Compra",icon:TIPO_ICON.reserva},
    {id:"negociacion",label:"Negociación",icon:"↔"}
  ];
  return (
    <div className="doc-bottom-tabs">
      {items.map(function(t){
        var active=tab===t.id;
        return <button type="button" key={t.id} className={"doc-bottom-tab"+(active?" active":"")} onClick={function(){onChange(t.id);}}>
          <span className="doc-bottom-tab-icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>;
      })}
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

function DocumentViewer({op,clausulas,perfil,operaciones,bloquesReserva,onToggleTarea,onUpdateOperation,onActionWorkflow,tab,onChangeTab,autoAction,onAutoActionDone}){
  var docTabs=getDocTabs(op);
  var TABS=docTabs.TABS, TAB_RESUMEN=docTabs.TAB_RESUMEN, TABS_ALL=docTabs.TABS_ALL;

  function setTab(id){ onChangeTab(id); }
  const [busy,setBusy]=useState({pdf:false,docx:false,share:false});
  const [err,setErr]=useState("");
  const [lastAction,setLastAction]=useState(null); // "pdf" | "docx" | "share"
  const [lastPdf,setLastPdf]=useState(null); // {blob, filename}
  const [lastDocx,setLastDocx]=useState(null); // {blob, filename}
  const [pendingWarnings,setPendingWarnings]=useState(null); // {list, fn} | null
  const [aiReview,setAiReview]=useState(null); // {loading,text,error}
  const autoActionFiredRef=useRef(false);

  function changeTab(id){ setTab(id); setLastPdf(null); setLastDocx(null); setErr(""); setAiReview(null); }

  async function ejecutarRevisionIA(){
    if(aiReview&&aiReview.loading) return;
    setAiReview({loading:true,text:"",error:""});
    try{
      var resultado=await revisarDocumentoIA(op,getDoc());
      setAiReview({loading:false,text:resultado,error:""});
    }catch(e){
      setAiReview({loading:false,text:"",error:traducirError(e&&e.message?e.message:"No se pudo ejecutar la revisión con IA.")});
    }
  }
  function copiarRevisionIA(){
    if(!aiReview||!aiReview.text)return;
    copiarAlPortapapeles(aiReview.text,function(){dwNotify("success","Revisión de IA copiada al portapapeles.");},function(){dwNotify("error","No se pudo copiar la revisión.");});
  }

  var tabActual = TABS_ALL.find(function(t){return t.id===tab;})||TAB_RESUMEN;

  function getDoc(){
    if(tabActual.esTareas || tabActual.esNegociacion) return {titulo:tabActual.esNegociacion?"Negociación":"Centro de tareas",secciones:[]};
    if(tabActual.esResumen || tabActual.esFicha){
      var resumenTipo=op.tipo||"reserva";
      var cuerpoResumen=getBodyBlocksForDocument(perfil, resumenTipo, bloquesReserva);
      return aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(op), clausulas, resumenTipo, cuerpoResumen), op, resumenTipo, perfil);
    }
    if(tabActual.esRecibo) return buildReciboSections(opParaDocumento(op), perfil, tabActual.dest);
    var cuerpo = getBodyBlocksForDocument(perfil, tab, bloquesReserva);
    return aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(op), clausulas, tab, cuerpo), op, tab, perfil);
  }

  useEffect(function(){ setAiReview(null); }, [op&&op.id]);

  // Prefetch en segundo plano: se genera el PDF/DOCX apenas se entra a la
  // pestaña, ANTES de que el usuario toque ningún botón. Esto es clave en
  // iPhone: Safari solo deja abrir el panel nativo de compartir si
  // navigator.share() se llama de forma prácticamente inmediata al toque del
  // usuario (sin await de por medio) — si el archivo recién se generaba
  // después del click, ese pequeño delay (por ejemplo al insertar el logo)
  // ya invalidaba el gesto y el share fallaba en silencio, mostrando el PDF
  // suelto en el navegador sin forma de compartirlo. Con el archivo ya listo
  // de antemano, el click solo dispara el share, sin async en el medio.
  useEffect(function(){
    if(tabActual.esResumen || tabActual.esFicha || tabActual.esTareas || tabActual.esNegociacion) return;
    var cancelado=false;
    generarPDF(getDoc(), perfil.logoDataUrl||null, perfil).then(function(r){ if(!cancelado) setLastPdf(r); }).catch(function(err){ if(!cancelado) setErr(err&&err.message?err.message:"No se pudo preparar el PDF."); });
    generarDOCX(getDoc(), perfil).then(function(r){ if(!cancelado) setLastDocx(r); }).catch(function(err){ if(!cancelado) setErr(err&&err.message?err.message:"No se pudo preparar el documento Word."); });
    return function(){ cancelado=true; };
    // eslint-disable-next-line
  }, [tab, op, clausulas]);

  // Dispara automáticamente la acción pedida desde el menú "Finalizar" del
  // formulario (por ahora solo "whatsapp": el envío por PDF necesita que el
  // toque del usuario dispare navigator.share() cuanto antes, por eso el
  // pequeño delay es mínimo). Se ejecuta una sola vez.
  useEffect(function(){
    if(!autoAction || autoActionFiredRef.current) return;
    autoActionFiredRef.current=true;
    var t=setTimeout(function(){
      if(autoAction==="whatsapp") conValidacion(handleShareWhatsApp);
      else if(autoAction==="pdf") conValidacion(handlePDF);
      else if(autoAction==="docx") conValidacion(handleDOCX);
      if(onAutoActionDone) onAutoActionDone();
    }, 300);
    return function(){ clearTimeout(t); };
    // eslint-disable-next-line
  }, [autoAction]);

  // Antes de generar/compartir se valida (datos críticos faltantes, fechas
  // ilógicas, tokens {{...}} sin resolver). Si hay algo para avisar, se
  // muestra el detalle y el usuario decide si corrige o genera igual.
  function conValidacion(fn){
    if(tabActual.esRecibo){ fn(); return; } // los recibos no llevan cláusulas/plantilla, no hace falta validar
    var advertencias = getAdvertenciasExportacion(op, getDoc());
    if(advertencias.length){ setPendingWarnings({list:advertencias, fn:fn}); }
    else { fn(); }
  }

  async function handlePDF(){
    setBusy(function(b){return Object.assign({},b,{pdf:true});});setErr("");setLastAction("pdf");
    try{
      var result = lastPdf || await generarPDF(getDoc(), perfil.logoDataUrl||null, perfil);
      setLastPdf(result);
      // "Descargar" es siempre una descarga clásica de archivo (no abre el panel
      // de compartir) — así se distingue claramente del botón "Compartir".
      descargarArchivo(result.blob, result.filename);
      if(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent||"")){
        alert("El PDF se descargó. Si no lo ves, revisá la carpeta \"Descargas\" del teléfono o el gestor de archivos.");
      }
      setLastAction(null);
    }
    catch(e){ if(!(e&&e.name==="AbortError")) setErr(e.message||"Error al generar el PDF."); }
    setBusy(function(b){return Object.assign({},b,{pdf:false});});
  }

  async function handleDOCX(){
    setBusy(function(b){return Object.assign({},b,{docx:true});});setErr("");setLastAction("docx");
    try{
      var result = lastDocx || await generarDOCX(getDoc(), perfil);
      setLastDocx(result);
      descargarArchivo(result.blob, result.filename);
      if(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent||"")){
        alert("El documento se descargó. Si no lo ves, revisá la carpeta \"Descargas\" del teléfono o el gestor de archivos.");
      }
      setLastAction(null);
    }
    catch(e){ if(!(e&&e.name==="AbortError")) setErr(e.message||"Error al generar el documento Word."); }
    setBusy(function(b){return Object.assign({},b,{docx:false});});
  }

  async function handleShareWhatsApp(){
    setErr("");setLastAction("share");
    setBusy(function(b){return Object.assign({},b,{share:true});});
    try{
      // Generar el PDF en el momento si no existe uno reciente
      var pdfData = lastPdf;
      if(!pdfData){
        pdfData = await generarPDF(getDoc(), perfil.logoDataUrl||null, perfil);
        setLastPdf(pdfData);
      }
      var txt = tabActual.label+" — "+(op.inmueble_direccion||"Operación inmobiliaria");
      var entrega = await entregarArchivo(pdfData.blob, pdfData.filename, "application/pdf", {title:tabActual.label, text:txt});
      if(entrega==="downloaded-whatsapp"){
        alert("Abrimos WhatsApp Web y descargamos el PDF para adjuntarlo al chat.");
      }
      setLastAction(null);
    } catch(e){
      if(e && e.name==="AbortError"){ /* usuario canceló el share, no es error */ }
      else { setErr(e.message||"No se pudo compartir el documento."); }
    }
    setBusy(function(b){return Object.assign({},b,{share:false});});
  }

  function previewBlocks(){
    var doc=getDoc();
    var b=[];
    b.push({t:doc.titulo,bold:true,size:13.5,center:true});
    if(doc.subtitulo) b.push({t:doc.subtitulo,dim:true,size:10.5,center:true});
    if(doc.nroRecibo) b.push({t:"N° "+doc.nroRecibo,bold:true,center:true});
    b.push({blank:true});
    b.push({t:"Lugar: "+(doc.ciudad||"")+"  |  Fecha: "+(doc.fecha||""),dim:true});
    b.push({sep:true});
    if(doc.encabezado && (perfil?perfil.mostrar_introduccion!==false:true)){ doc.encabezado.split("\n\n").forEach(function(p){ if(String(p||"").trim()){ b.push({t:p,justify:true}); b.push({blank:true}); } }); }
    if(!doc.ocultarPartesEnCuerpo && doc.partes && doc.partes.length){
      b.push({t:"PARTES INTERVINIENTES",bold:true,label:true});
      doc.partes.forEach(function(p){
        b.push({t:normalizarTextoDocumento((p.rol||"").toUpperCase()+": "+(p.nombre||"—")),bold:true});
        if(p.dni) b.push({t:normalizarTextoDocumento(tipoIdentificacion(p.dni)+": "+p.dni),dim:true,indent:true});
        if(p.domicilio) b.push({t:normalizarTextoDocumento("Domicilio: "+p.domicilio),dim:true,indent:true});
        b.push({blank:true});
      });
      b.push({sep:true});
    }
    // Mismo formato que PDF/DOCX exportados (todos los tipos de documento)
    (doc.secciones||[]).forEach(function(s){
      var prefix=String(prefijoClausulaFormal(s.titulo)||"");
      (s.items||[]).forEach(function(i,idx){
        if(!i) return;
        if(idx===0) b.push({prefix:prefix, t:cuerpoTrasRotulo(i), justify:true, clause:true});
        else b.push({t:normalizarTextoDocumento(i), justify:true, indent:true});
      });
      b.push({blank:true});
    });
    if(doc.clausulas&&doc.clausulas.length>0){
      doc.clausulas.forEach(function(c){
        var prefix=String(prefijoClausulaDesdeNumTitulo(c.num, c.titulo||"")||"");
        b.push({prefix:prefix, t:cuerpoTrasRotulo(c.texto||""), justify:true, clause:true});
        b.push({blank:true});
      });
    }
    if(doc.conformidad&&doc.conformidad.items&&doc.conformidad.items.length){
      b.push({sep:true});
      b.push({t:"PRESTA CONFORMIDAD",bold:true,label:true});
      doc.conformidad.items.forEach(function(t,i){ b.push({t:(i+1)+". "+t,justify:true}); });
      b.push({blank:true});
      b.push({t:"PROPIETARIO",bold:true,center:true});
      b.push({t:(doc.conformidad.firmante||"")+(doc.conformidad.dni?" — "+doc.conformidad.dni:""),bold:true,center:true});
    }
    return b;
  }

  return(
    <div className="doc-viewer-shell">
      <div className="doc-viewer-tabs"><DocTabsBar op={op} tab={tab} onChange={setTab}/></div>
      <div className={(tabActual.esResumen||tabActual.esFicha||tabActual.esTareas||tabActual.esNegociacion)?"doc-viewer-tab-content doc-tab-static":"doc-viewer-tab-content"}>
      {tabActual.esTareas ? (
        <TareasPanel op={op} onToggleTarea={onToggleTarea}/>
      ) : tabActual.esFicha ? (
        <FichaOperacionPanel op={op} operaciones={operaciones||[]} embedded={true}/>
      ) : tabActual.esNegociacion ? (
        <><ReservaDecisionPanel op={op} onUpdate={onUpdateOperation} onAction={onActionWorkflow}/><NegociacionPanel op={op} onUpdate={onUpdateOperation}/></>
      ) : tabActual.esResumen ? (
        <DocSummaryPanel op={op} perfil={perfil} tabsDocs={TABS} onLeer={changeTab} operaciones={operaciones} onToggleTarea={onToggleTarea} onUpdateOperation={onUpdateOperation} onActionWorkflow={onActionWorkflow}/>
      ) : (
      <>
        {tabActual.id==="reserva"&&<ReservaCompactSummary op={op} operaciones={operaciones}/>}
        {err&&<div style={{padding:"9px 12px",borderRadius:8,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",color:"var(--red)",fontSize:12.5,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flex:"0 0 auto"}}>
          <span>{err}</span>
          {lastAction&&<button onClick={function(){
            if(lastAction==="pdf")handlePDF();
            else if(lastAction==="docx")handleDOCX();
            else if(lastAction==="share")handleShareWhatsApp();
          }} style={{flexShrink:0,padding:"4px 10px",borderRadius:6,border:"1px solid rgba(248,113,113,0.35)",background:"rgba(248,113,113,0.12)",color:"var(--red)",fontSize:11.5,fontWeight:600,cursor:"pointer"}}>↻ Reintentar</button>}
        </div>}
        {!perfil.nombre&&<div className="notice notice-amber" style={{marginBottom:12,flex:"0 0 auto"}}>Tip: configurá el perfil para agregar logo y nombre en los documentos.</div>}
        <div style={{marginBottom:10,padding:"10px 12px",borderRadius:11,border:"1px solid rgba(212,168,83,.24)",background:"linear-gradient(180deg,rgba(212,168,83,.075),rgba(255,255,255,.02))",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",flex:"0 0 auto"}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:11.8,fontWeight:800,color:"var(--text)"}}>✦ Revisión inteligente antes de firmar</div>
            <div style={{fontSize:10.5,color:"var(--dim)",marginTop:2}}>La IA revisa faltantes, nombres, DNI/CUIT, fechas, montos, monedas y posibles contradicciones. No modifica el documento.</div>
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0}}>
            {aiReview&&aiReview.text&&<Btn s="sm" v="ghost" onClick={copiarRevisionIA}>Copiar revisión</Btn>}
            <Btn s="sm" v="secondary" onClick={ejecutarRevisionIA} disabled={!!(aiReview&&aiReview.loading)}>{aiReview&&aiReview.loading?"Revisando…":"✦ Revisar con IA"}</Btn>
          </div>
        </div>
        {aiReview&&aiReview.error&&<div style={{marginBottom:10,padding:"9px 11px",borderRadius:9,border:"1px solid rgba(248,113,113,.22)",background:"rgba(248,113,113,.07)",color:"var(--red)",fontSize:11.5}}>{aiReview.error}</div>}
        {aiReview&&aiReview.text&&<div style={{marginBottom:10,padding:"12px 13px",borderRadius:11,border:"1px solid var(--border2)",background:"var(--card)",color:"var(--text)",fontSize:11.5,lineHeight:1.6,whiteSpace:"pre-wrap",maxHeight:270,overflowY:"auto"}}>{aiReview.text}</div>}
        <div className="doc-reading-scroll">
          <div className="pdf-preview" style={{marginBottom:14}}>
            <div className="pdf-chrome">
              <div className="pdf-dot" style={{background:"#ff5f57"}}/><div className="pdf-dot" style={{background:"#ffbd2e"}}/><div className="pdf-dot" style={{background:"#28c840"}}/>
              <span style={{fontSize:10.5,color:"var(--dim)",marginLeft:7}}>{tabActual.icon} {tabActual.label}</span>
              {tabActual.esRecibo&&<span style={{marginLeft:"auto",fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(74,222,128,0.1)",color:"var(--green)",border:"1px solid rgba(74,222,128,0.2)"}}>Recibo de honorarios</span>}
            </div>
            <div className="pdf-content pdf-content-lg">
              <div className="pdf-text">
                {previewBlocks().map(function(bl,i){
                  if(bl.blank) return <div key={i} style={{height:13}}/>;
                  if(bl.sep) return <div key={i} style={{borderTop:"1px solid #d1d5db",margin:"10px 0"}}/>;
                  if(bl.clause && bl.prefix){
                    return (
                      <div key={i} style={{textAlign:"justify",marginBottom:10,color:"#1f2937",lineHeight:1.55}}>
                        <strong style={{color:(perfil&&perfil.plantillaEstilo==="clasico")?"#1a1a1a":((perfil&&perfil.colorPrimario)||"#142a4d")}}>{bl.prefix}</strong>
                        <span>{normalizarTextoDocumento(bl.t)}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{
                      fontWeight:bl.bold?700:400,
                      fontSize:bl.size||undefined,
                      color:bl.dim?"#6b7280":"#1f2937",
                      textAlign:bl.center?"center":(bl.justify?"justify":"left"),
                      marginLeft:bl.center?0:(bl.indent?14:0),
                      marginBottom:bl.label?6:2,
                      letterSpacing:bl.label?"0.03em":"normal",
                    }}>{normalizarTextoDocumento(bl.t||"")}</div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </>
      )}
      </div>

      {/* Aviso de validación previa a exportar */}
      <ConfirmModal
        open={!!pendingWarnings}
        title="Antes de generar el documento..."
        message={pendingWarnings ? (
          <span>
            <span style={{display:"block",marginBottom:8}}>Encontramos lo siguiente:</span>
            <ul style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:5}}>
              {pendingWarnings.list.map(function(w,i){return <li key={i} style={{fontSize:13}}>{w}</li>;})}
            </ul>
          </span>
        ) : ""}
        confirmLabel="Generar de todos modos"
        danger={false}
        onCancel={function(){setPendingWarnings(null);}}
        onConfirm={function(){var fn=pendingWarnings&&pendingWarnings.fn;setPendingWarnings(null);if(fn)fn();}}
      />
    </div>
  );
}

function PerfilForm({perfil,onChange,onClose}){
  const [local,setLocal]=useState(perfil);
  const fileRef=useRef();
  function handleLogo(e){var file=e.target.files[0];if(!file)return;var r=new FileReader();r.onload=function(ev){setLocal(function(p){return Object.assign({},p,{logoDataUrl:ev.target.result});});};r.readAsDataURL(file);}
  function f(k){return function(e){setLocal(function(p){return Object.assign({},p,{[k]:e.target.value});});};}
  return(
    <div>
      <div style={{marginBottom:18}}>
        <p style={{fontSize:11.5,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Logo de la inmobiliaria</p>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {local.logoDataUrl
            ? <div style={{position:"relative"}}>
                <img src={local.logoDataUrl} className="logo-preview" alt="logo"/>
                <button onClick={function(){setLocal(function(p){return Object.assign({},p,{logoDataUrl:""});});}} style={{position:"absolute",top:-8,right:-8,width:20,height:20,borderRadius:"50%",background:"var(--red)",border:"none",color:"white",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
            : <div className="logo-upload" onClick={function(){fileRef.current.click();}}>
                <span style={{fontSize:22}}>🖼</span>
                <span style={{fontSize:10.5,color:"var(--dim)",marginTop:3}}>Subir logo</span>
              </div>
          }
          <div style={{fontSize:11.5,color:"var(--dim)",lineHeight:1.7}}>PNG, JPG o SVG<br/>Se mostrará en el PDF<br/>Fondo blanco o transparente</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogo}/>
      </div>
      <div className="grid2">
        <Inp label="Nombre de la inmobiliaria" value={local.nombre||""} onChange={f("nombre")} placeholder="Inmobiliaria XYZ" className="col2"/>
        <Inp label="Matrícula / CMCPSI" value={local.matricula||""} onChange={f("matricula")} placeholder="Mat. 1234"/>
        <Inp label="Teléfono" value={local.telefono||""} onChange={f("telefono")} placeholder="+54 11 1234-5678"/>
        <Inp label="Correo electrónico" value={local.email||""} onChange={f("email")} placeholder="info@inmobiliaria.com" className="col2"/>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:16,borderTop:"1px solid var(--border)",marginTop:14}}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn v="success" onClick={function(){onChange(local);onClose();}}>Guardar perfil ✓</Btn>
      </div>
    </div>
  );
}

// ── BOT DE IA ─────────────────────────────────────────────────────────────────
var BOTIA_SYSTEM = "Sos el asistente legal de DocWorks, especializado en documentación inmobiliaria argentina (CABA y provincia de Buenos Aires principalmente). Ayudás a redactar, revisar y corregir contratos de compraventa, reservas, alquileres, comodatos y autorizaciones de venta. Usás lenguaje jurídico formal argentino, con referencias al CCyC y a la Ley 27.551 cuando corresponda. Respondés siempre en español rioplatense, de forma clara y concreta (evitá relleno). Cuando revises una operación o un documento (adjunto o pegado), organizá la respuesta en: 1) Datos faltantes o incompletos, 2) Inconsistencias (fechas, montos, nombres), 3) Cláusulas recomendadas que no están presentes, 4) Observaciones de redacción legal. Si no hay nada para observar en un punto, decilo brevemente y seguí.";

var BOTIA_CLAUSULA_SYSTEM = "Además, cuando el usuario te pida redactar o narrar una cláusula nueva, respondé EXCLUSIVAMENTE con un objeto JSON válido, sin texto antes ni después, sin backticks, con este formato exacto: {\"titulo\":\"...\",\"categoria\":\"general|posesion|pago|rescision|impuestos|alquiler\",\"contenido\":\"...\"}. El campo \"contenido\" debe ser el texto completo de la cláusula, redactado en tercera persona, estilo formal jurídico argentino, listo para insertarse en un contrato. El campo \"titulo\" debe ser corto (3 a 6 palabras). Elegí la categoría más adecuada de la lista dada.";

var CLAUSULA_IA_SYSTEM = "Sos un asistente legal experto en redacción de documentos inmobiliarios argentinos (CCyC, Ley 27.551). El usuario te va a dar una idea breve de una cláusula que necesita para un contrato. Respondé EXCLUSIVAMENTE con un objeto JSON válido, sin texto antes ni después, sin backticks, con este formato exacto: {\"titulo\":\"...\",\"categoria\":\"general|posesion|pago|rescision|impuestos|alquiler\",\"contenido\":\"...\"}. El campo \"contenido\" debe ser el texto completo de la cláusula, redactado en tercera persona, estilo formal jurídico argentino, listo para insertarse en un contrato. El campo \"titulo\" debe ser corto (3 a 6 palabras). Elegí la categoría más adecuada de la lista dada.";

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
    "VENDEDOR/PROPIETARIO: "+((op||{}).vendedor_nombre||"—"),
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
  return new Promise(function(resolve,reject){
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
  const bottomRef=useRef();
  const fileRef=useRef();

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

  var quickBtnStyle={padding:"5px 9px",borderRadius:8,border:"1px solid var(--border2)",background:"rgba(255,255,255,0.04)",color:"var(--muted)",cursor:"pointer",fontSize:11,whiteSpace:"nowrap"};

  return(
    <div style={{position:"fixed",bottom:80,right:20,width:380,maxWidth:"calc(100vw - 40px)",zIndex:200,display:"flex",flexDirection:"column",borderRadius:16,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.4)",border:"1px solid var(--border2)",background:"var(--surface)"}}>
      {/* Header */}
      <div style={{padding:"12px 16px",background:"linear-gradient(135deg,#1e293b,#0f172a)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,var(--gold),var(--gold2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✦</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>Asistente DocWorks</div>
            <div style={{fontSize:10,color:"var(--green)"}}>● En línea</div>
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
                  <div style={{fontSize:10,fontWeight:700,color:"var(--gold)",textTransform:"uppercase",letterSpacing:0.4,marginBottom:4}}>Propuesta de cláusula</div>
                  <div style={{fontWeight:700,marginBottom:3}}>{cd.titulo}</div>
                  <div style={{fontSize:10,color:"var(--dim)",textTransform:"capitalize",marginBottom:6}}>{cd.categoria}</div>
                  <div style={{whiteSpace:"pre-wrap",marginBottom:9}}>{cd.contenido}</div>
                  {m.clauseNote&&<div style={{padding:"8px 9px",marginBottom:9,borderRadius:8,background:"rgba(212,168,83,.06)",border:"1px solid rgba(212,168,83,.16)",fontSize:10.7,color:"var(--muted)",lineHeight:1.45}}><b style={{color:"var(--gold)"}}>Nota:</b> {m.clauseNote}</div>}
                  <button disabled={!!m.added} onClick={function(){addClauseFromDraft(i,cd);}}
                    style={{padding:"6px 11px",borderRadius:8,border:"none",background:m.added?"rgba(255,255,255,0.08)":"var(--gold)",color:m.added?"var(--dim)":"#0a0f1a",fontWeight:700,fontSize:11.5,cursor:m.added?"default":"pointer"}}>
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
          <span style={{fontSize:11,color:"var(--muted)",background:"rgba(255,255,255,0.05)",border:"1px solid var(--border2)",borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center",gap:6}}>
            📎 {attachment.name}
            <button onClick={function(){setAttachment(null);}} style={{background:"none",border:"none",color:"var(--dim)",cursor:"pointer",fontSize:12,padding:0}}>✕</button>
          </span>
        </div>
      )}
      {attError&&<div style={{padding:"0 12px 6px",fontSize:11,color:"var(--red)"}}>{attError}</div>}

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
function VariablePicker({taRef,value,onChange,label}){
  const [open,setOpen]=useState(false);
  const [pos,setPos]=useState(null);
  const wrapRef=useRef();
  const btnRef=useRef();

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
    return function(){
      document.removeEventListener("mousedown",handleDown);
      window.removeEventListener("scroll",handleReflow,true);
      window.removeEventListener("resize",handleReflow);
    };
  },[open]);

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
                {g.fields.map(function(f){
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
      <div style={{fontSize:11,fontWeight:600,color:"var(--muted)",marginBottom:6}}>Aplica a los documentos:</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        <div className={"tipo-chip "+(esTodos?"on":"")} onClick={toggleTodos}>{esTodos?"✓ ":""}Todos los documentos</div>
        {Object.keys(TIPOS).map(function(k){
          return <div key={k} className={"tipo-chip "+(!esTodos&&v.indexOf(k)!==-1?"on":"")} onClick={function(){toggleTipo(k);}}>{!esTodos&&v.indexOf(k)!==-1?"✓ ":""}{TIPOS[k]}</div>;
        })}
      </div>
    </div>
  );
}

function ClausulaFormBody({form,setForm,onCancel,onSubmit,editId}){
  const taRef=useRef();
  const CATS=["general","posesion","pago","rescision","impuestos","alquiler"];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Inp label="Título" value={form.titulo} onChange={function(e){setForm(function(f){return Object.assign({},f,{titulo:e.target.value});});}} placeholder="Ej: Multa por rescisión"/>
      <Slt label="Categoría" value={form.categoria} onChange={function(e){setForm(function(f){return Object.assign({},f,{categoria:e.target.value});});}}>
        {CATS.map(function(c){return <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>;})}
      </Slt>
      <TipoSelector value={form.tipos} onChange={function(t){setForm(function(f){return Object.assign({},f,{tipos:t});});}}/>
      <label style={{display:"flex",alignItems:"flex-start",gap:8,padding:"9px 11px",borderRadius:8,border:"1px solid var(--border)",background:form.obligatoria?"rgba(180,83,9,0.08)":"transparent",cursor:"pointer",fontSize:12.5,color:"var(--text)"}}>
        <input type="checkbox" checked={!!form.obligatoria} onChange={function(e){setForm(function(f){return Object.assign({},f,{obligatoria:e.target.checked});});}} style={{marginTop:2}}/>
        <span>🔒 <b>OBLIGATORIA</b> — La definió el Dueño/Administrador de {nombreInmobiliariaObligatoria} y no se puede quitar de esta operación.</span>
      </label>
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:4}}>
          <label className="field-label" style={{margin:0}}>Texto</label>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <VozATextoButton onText={function(t){setForm(function(f){return Object.assign({},f,{contenido:(f.contenido?f.contenido+" ":"")+t});});}} title="Dictar cláusula por voz"/>
            <VariablePicker taRef={taRef} value={form.contenido} onChange={function(v){setForm(function(f){return Object.assign({},f,{contenido:v});});}}/>
          </div>
        </div>
        <textarea ref={taRef} className="inp" rows={4} value={form.contenido} onChange={function(e){setForm(function(f){return Object.assign({},f,{contenido:e.target.value});});}} placeholder="Redactá el texto. Usá «Vincular dato» para insertar campos como el nombre del propietario, DNI, dirección, etc."/>
        <div style={{fontSize:10.5,color:"var(--dim)",marginTop:4}}>Los campos vinculados se completan automáticamente con los datos reales de cada operación al generar el documento.</div>
      </div>
      <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}>
        {editId&&<Btn v="ghost" s="sm" onClick={onCancel}>Cancelar</Btn>}
        <Btn s="sm" onClick={onSubmit}>{editId?"Actualizar":"Agregar"}</Btn>
      </div>
    </div>
  );
}

const FORM_CLAUSULA_EMPTY={titulo:"",categoria:"general",contenido:"",tipos:["todos"],obligatoria:false};

var CLAUSULA_CATS=["general","posesion","pago","rescision","impuestos","alquiler"];

// Composer "Agregar con DocWorks IA": el usuario escribe una idea breve y la IA
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
        <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",margin:0}}>Agregar con DocWorks IA</p>
      </div>
      <div style={{fontSize:11,color:"var(--dim)",marginBottom:9}}>Escribí brevemente la cláusula y nosotros te ayudamos a narrarla.</div>
      <div style={{display:"flex",gap:7,alignItems:"flex-start"}}>
        <textarea className="inp" rows={2} value={idea} onChange={function(e){setIdea(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();generar();}}}
          placeholder="Ej: que el inquilino no pueda tener mascotas sin autorización" style={{flex:1,resize:"none"}}/>
        <VozATextoButton onText={function(t){setIdea(function(v){return (v?v+" ":"")+t;});}} disabled={loading}/>
        <Btn s="sm" onClick={generar} disabled={!idea.trim()||loading}>{loading?"Narrando…":"✦ Narrar"}</Btn>
      </div>
      {error&&<div style={{fontSize:11,color:"var(--red)",marginTop:6}}>{error}</div>}
    </div>
  );
}

function ClausulasView({clausulas,onAdd,onEdit,onDelete,puedeEditar,rolLabel,error,loading,ocultarProtegidasIds}){
  const [form,setForm]=useState(FORM_CLAUSULA_EMPTY);
  const [editId,setEditId]=useState(null);
  const [filtroTexto,setFiltroTexto]=useState("");
  const [filtroCategoria,setFiltroCategoria]=useState("todas");
  const [soloPersonalizadas,setSoloPersonalizadas]=useState(false);
  const [clausulaTab,setClausulaTab]=useState("biblioteca");
  var editable = puedeEditar!==false;
  function submit(){if(!editable)return;if(!form.titulo||!form.contenido)return;if(editId){onEdit(editId,form);}else{onAdd(Object.assign({},form,{id:genId()}));}setForm(FORM_CLAUSULA_EMPTY);setEditId(null);setClausulaTab("biblioteca");}
  function abrirNueva(){if(!editable)return;setEditId(null);setForm(FORM_CLAUSULA_EMPTY);setClausulaTab("editor");}
  function abrirEdicion(c){if(!editable)return;setEditId(c.id);setForm({titulo:c.titulo,categoria:c.categoria,contenido:c.contenido,tipos:c.tipos||["todos"]});setClausulaTab("editor");}
  function aplicarBorrador(draft){
    setEditId(null);
    setForm({titulo:draft.titulo,categoria:draft.categoria||"general",contenido:draft.contenido,tipos:["todos"]});
  }
  var esPersonalizada=function(c){return !CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;});};
  var idsProtegidos=Array.isArray(ocultarProtegidasIds)?ocultarProtegidasIds:[];
  var bibliotecaVisible=clausulas.filter(function(c){
    if(idsProtegidos.indexOf(c.id)!==-1)return false;
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
        <div><div className="section-title">Biblioteca de Cláusulas</div><div className="section-sub">Creá y reutilizá cláusulas en tus documentos — vinculá datos como el propietario, el inquilino o el inmueble con el menú «Vincular dato»</div></div>
      </div>
      {error && <div style={{marginBottom:16,padding:"10px 14px",borderRadius:10,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",color:"var(--red)",fontSize:12.5}}>{error}</div>}
      {loading && <div style={{marginBottom:16,fontSize:12.5,color:"var(--muted)"}}>Cargando cláusulas…</div>}
      {!editable&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",marginBottom:16,fontSize:12.5,color:"var(--amber)"}}>
          <span>🔒</span>
          <span>Las plantillas solo pueden editarlas el Dueño o un Administrador. Tu rol actual es «{rolLabel||"—"}» — podés consultarlas pero no modificarlas.</span>
        </div>
      )}
      <div className="card" style={{padding:8,marginBottom:10}}>
        <div style={{display:"flex",gap:5,borderBottom:"1px solid var(--border)"}}>
          <button type="button" onClick={function(){setClausulaTab("biblioteca");}} style={{flex:1,border:0,borderBottom:clausulaTab==="biblioteca"?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:clausulaTab==="biblioteca"?"var(--text)":"var(--muted)",padding:"10px 12px",cursor:"pointer",fontSize:11.8,fontWeight:clausulaTab==="biblioteca"?700:500}}>Biblioteca de cláusulas</button>
          {editable&&<button type="button" onClick={abrirNueva} style={{flex:1,border:0,borderBottom:clausulaTab==="editor"?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:clausulaTab==="editor"?"var(--text)":"var(--muted)",padding:"10px 12px",cursor:"pointer",fontSize:11.8,fontWeight:clausulaTab==="editor"?700:500}}>{editId?"Modificar cláusula":"Crear cláusula"}</button>}
        </div>
      </div>
      {clausulaTab==="editor"&&editable&&<div className="card" style={{padding:18,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14}}>
          <div><p style={{fontFamily:"DM Serif Display,serif",fontSize:15,color:"var(--text)",margin:0}}>{editId?"Modificar cláusula":"Crear cláusula"}</p><div style={{fontSize:10.8,color:"var(--dim)",marginTop:3}}>{editId?"Editá la cláusula y guardá los cambios en la biblioteca.":"Creá una nueva cláusula reutilizable para tus documentos."}</div></div>
          <button type="button" onClick={function(){setClausulaTab("biblioteca");}} style={{border:"1px solid var(--border)",background:"rgba(255,255,255,.03)",color:"var(--muted)",borderRadius:8,padding:"6px 9px",cursor:"pointer",fontSize:10.5}}>Volver a biblioteca</button>
        </div>
        <ClausulaFormBody form={form} setForm={setForm} editId={editId} onSubmit={submit} onCancel={function(){setEditId(null);setForm(FORM_CLAUSULA_EMPTY);setClausulaTab("biblioteca");}}/>
        <ClausulaIAComposer onDraft={aplicarBorrador}/>
      </div>}
      {clausulaTab==="biblioteca"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
            <input className="inp" style={{flex:"1 1 180px",minWidth:0}} value={filtroTexto} onChange={function(e){setFiltroTexto(e.target.value);}} placeholder="🔎 Buscar por título o texto..."/>
            <select className="inp" style={{flex:"0 0 auto",width:"auto",minWidth:130}} value={filtroCategoria} onChange={function(e){setFiltroCategoria(e.target.value);}}>
              <option value="todas">Todas las categorías</option>
              {CLAUSULA_CATS.map(function(c){return <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>;})}
            </select>
            <div onClick={function(){setSoloPersonalizadas(function(v){return !v;});}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,border:"1px solid "+(soloPersonalizadas?"var(--gold)":"var(--border2)"),background:soloPersonalizadas?"rgba(212,175,55,0.1)":"rgba(255,255,255,0.03)",color:soloPersonalizadas?"var(--gold)":"var(--muted)",fontSize:11.5,cursor:"pointer",whiteSpace:"nowrap",userSelect:"none"}}>
              {soloPersonalizadas?"✓ ":""}Solo personalizadas
            </div>
          </div>
          <div style={{fontSize:10.5,color:"var(--dim)"}}>{filtradas.length} de {bibliotecaVisible.length} cláusula{bibliotecaVisible.length===1?"":"s"}</div>
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
                      <div style={{fontSize:10.5,color:"var(--dim)",marginBottom:4}}>{esTodos?"Todos los documentos":c.tipos.map(function(t){return TIPOS[t]||t;}).join(", ")}</div>
                      <p style={{fontSize:11.5,color:"var(--dim)",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.contenido}</p>
                    </div>
                    {editable&&(
                      <div style={{display:"flex",gap:3,flexShrink:0}}>
                        <button onClick={function(){abrirEdicion(c);}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:12,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><DWIcon name="edit" size={14}/></button>
                        <button onClick={function(){onDelete(c.id);}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(248,113,113,0.05)",border:"1px solid rgba(248,113,113,0.15)",color:"var(--red)",cursor:"pointer",fontSize:12}}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>}
    </div>
  );
}

function Dropdown({items}){
  const [open,setOpen]=useState(false);
  const [pos,setPos]=useState(null);
  const btnRef=useRef();
  const menuRef=useRef();
  useEffect(function(){
    function handle(e){
      if(btnRef.current&&btnRef.current.contains(e.target))return;
      if(menuRef.current&&menuRef.current.contains(e.target))return;
      setOpen(false);
    }
    document.addEventListener("mousedown",handle);
    document.addEventListener("touchstart",handle);
    return function(){document.removeEventListener("mousedown",handle);document.removeEventListener("touchstart",handle);};
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
    setOpen(function(o){
      var next=!o;
      if(next)requestAnimationFrame(reposition);
      return next;
    });
  }
  useEffect(function(){
    if(!open)return;
    function onScrollResize(){reposition();}
    window.addEventListener("scroll",onScrollResize,true);
    window.addEventListener("resize",onScrollResize);
    return function(){window.removeEventListener("scroll",onScrollResize,true);window.removeEventListener("resize",onScrollResize);};
  },[open]);
  return(
    <div style={{position:"relative",display:"inline-block"}}>
      <span ref={btnRef} style={{display:"inline-block"}}><Btn v="ghost" s="sm" onClick={toggle}>⋯</Btn></span>
      {open&&pos&&(
        <div ref={menuRef} className="dropdown-menu" style={{position:"fixed",top:pos.top,left:pos.left,width:pos.width,maxHeight:pos.maxHeight,overflowY:"auto",right:"auto",zIndex:200,WebkitOverflowScrolling:"touch"}}>
          {items.map(function(item,i){
            if(!item)return null;
            return <button key={i} className={"dropdown-item "+(item.red?"red":"")} onClick={function(){setOpen(false);item.onClick();}}>{item.icon&&<span style={{display:"inline-flex",alignItems:"center",marginRight:6}}>{item.icon}</span>}{item.label}</button>;
          })}
        </div>
      )}
    </div>
  );
}

// ── CALENDARIO VIEW ───────────────────────────────────────────────────────────
function CalendarioView({operaciones,onViewOp}){
  var now=new Date();
  var [mesOffset,setMesOffset]=useState(0);
  var [filtro,setFiltro]=useState("todos");

  var eventos=[];
  operaciones.forEach(function(op){
    var nombre=op.tipo==="alquiler"||op.tipo==="reserva_alquiler"
      ?(op.locatario_nombre||"Locatario")+" ← "+(op.locador_nombre||"Locador")
      :(op.comprador_nombre||"Comprador")+" ← "+(op.vendedor_nombre||"Vendedor");
    var base={nombre:nombre,direccion:op.inmueble_direccion||"",op:op};
    if(op.tipo==="alquiler"&&op.alquiler_fin){
      var fin=new Date(op.alquiler_fin), diasRestantes=Math.ceil((fin-now)/(86400000));
      eventos.push(Object.assign({},base,{id:op.id+"_fin",tipo:"vencimiento",fecha:op.alquiler_fin,titulo:"Vencimiento de contrato",diasRestantes:diasRestantes,urgente:diasRestantes<=60&&diasRestantes>=0,color:diasRestantes<0?"#64748b":diasRestantes<=30?"#ef4444":diasRestantes<=60?"#f97316":"#2dd4bf"}));
      var alertaFecha=new Date(fin);alertaFecha.setDate(alertaFecha.getDate()-90);
      if(alertaFecha>=now){eventos.push(Object.assign({},base,{id:op.id+"_alerta",tipo:"renovacion",fecha:alertaFecha.toISOString().slice(0,10),titulo:"Renovación próxima",diasRestantes:diasRestantes,urgente:false,color:"#a78bfa"}));}
    }
    if(op.tipo==="reserva"&&op.reserva_aceptacion_vencimiento){
      var vencA=new Date(op.reserva_aceptacion_vencimiento+"T23:59:59");
      var diasA=Math.ceil((vencA-now)/86400000);
      eventos.push(Object.assign({},base,{id:op.id+"_aceptacion",tipo:"aceptacion",fecha:op.reserva_aceptacion_vencimiento,titulo:"Vencimiento de aceptación de reserva",diasRestantes:diasA,urgente:diasA<=2&&diasA>=0,color:diasA<0?"#64748b":diasA<=2?"#ef4444":"#d4a853"}));
    }
    if(op.tipo==="reserva"&&op.reserva_fecha_refuerzo){
      var diasRef=Math.ceil((new Date(op.reserva_fecha_refuerzo)-now)/86400000);
      eventos.push(Object.assign({},base,{id:op.id+"_refuerzo",tipo:"refuerzo",fecha:op.reserva_fecha_refuerzo,titulo:"Tomar refuerzo de reserva",diasRestantes:diasRef,urgente:diasRef<=7&&diasRef>=0,color:diasRef<0?"#64748b":diasRef<=7?"#ef4444":diasRef<=15?"#f97316":"#a78bfa"}));
    }
    if(op.tipo==="reserva_alquiler"){
      var baseFecha=op.created_at?new Date(op.created_at):null;
      if(baseFecha){
        var diasAceptVenc=parseInt(op.res_alq_aceptacion_dias,10)||2;
        var diasVigVenc=parseInt(op.res_alq_vigencia_dias,10)||10;
        var vencReserva=new Date(baseFecha);vencReserva.setDate(vencReserva.getDate()+diasAceptVenc+diasVigVenc);
        var yaTieneContrato=operaciones.some(function(h){return h.parent_id===op.id&&h.tipo==="alquiler";});
        if(!yaTieneContrato){
          var diasVR=Math.ceil((vencReserva-now)/86400000);
          eventos.push(Object.assign({},base,{id:op.id+"_vencres",tipo:"vencimiento",fecha:vencReserva.toISOString().slice(0,10),titulo:"Vencimiento de reserva",diasRestantes:diasVR,urgente:diasVR<=5&&diasVR>=0,color:diasVR<0?"#64748b":diasVR<=5?"#ef4444":diasVR<=10?"#f97316":"#fb923c"}));
        }
      }
      if(op.res_alq_inicio_estimado){
        var dias2=Math.ceil((new Date(op.res_alq_inicio_estimado)-now)/86400000);
        eventos.push(Object.assign({},base,{id:op.id+"_resalq",tipo:"reserva",fecha:op.res_alq_inicio_estimado,titulo:"Inicio estimado de alquiler",diasRestantes:dias2,urgente:dias2<=7&&dias2>=0,color:"#fb923c"}));
      }
    }
  });

  var eventosFiltrados=eventos.filter(function(e){return filtro==="todos"||e.tipo===filtro;}).sort(function(a,b){return new Date(a.fecha).getTime()-new Date(b.fecha).getTime();});
  var mesVer=new Date(now.getFullYear(),now.getMonth()+mesOffset,1);
  var diasEnMes=new Date(mesVer.getFullYear(),mesVer.getMonth()+1,0).getDate();
  var primerDia=mesVer.getDay()||7;
  var celdas=[];for(var i=1;i<primerDia;i++)celdas.push(null);for(var d=1;d<=diasEnMes;d++)celdas.push(d);
  function getEventosDia(dia){var f=mesVer.getFullYear()+"-"+String(mesVer.getMonth()+1).padStart(2,"0")+"-"+String(dia).padStart(2,"0");return eventosFiltrados.filter(function(e){return e.fecha===f;});}
  var urgentes=eventos.filter(function(e){return e.urgente;});
  var proximos=eventosFiltrados.filter(function(e){return e.diasRestantes>=0&&e.diasRestantes<=30;}).slice(0,6);
  var hoyStr=now.toISOString().slice(0,10);
  var filtros=[{v:"todos",l:"Todos"},{v:"vencimiento",l:"Vencimientos"},{v:"renovacion",l:"Renovaciones"},{v:"reserva",l:"Reservas"},{v:"refuerzo",l:"Refuerzos"}];
  var colorEvento={vencimiento:"#ef4444",renovacion:"#a78bfa",reserva:"#fb923c",refuerzo:"#60a5fa"};

  return(<div>
    <div className="section-header" style={{marginBottom:20}}>
      <div><div className="section-title">Calendario</div><div className="section-sub">Todo lo importante de tus operaciones, en un solo lugar.</div></div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,marginBottom:16}}>
      {[{n:urgentes.length,t:"Alertas",s:"Requieren atención",c:"#ef4444",i:"!"},{n:proximos.length,t:"Próximos 30 días",s:"Fechas a tener presentes",c:"var(--gold)",i:"30"},{n:eventosFiltrados.length,t:"Eventos",s:"Según el filtro actual",c:"var(--teal)",i:"✓"}].map(function(k){return <div key={k.t} className="card" style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderRadius:14}}><div style={{width:38,height:38,borderRadius:11,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:k.c,fontSize:14,flexShrink:0}}>{k.i}</div><div><div style={{fontSize:20,fontWeight:800,color:"var(--text)",lineHeight:1}}>{k.n}</div><div style={{fontSize:11,fontWeight:700,color:"var(--text)",marginTop:4}}>{k.t}</div><div style={{fontSize:10,color:"var(--dim)",marginTop:2}}>{k.s}</div></div></div>})}
    </div>

    {(urgentes.length>0||proximos.length>0)&&<div style={{display:"grid",gridTemplateColumns:urgentes.length>0&&proximos.length>0?"1fr 1fr":"1fr",gap:12,marginBottom:16}}>
      {urgentes.length>0&&<div className="card" style={{padding:0,overflow:"hidden",borderColor:"rgba(239,68,68,.22)"}}><div style={{padding:"12px 14px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:800,color:"#ef4444",letterSpacing:".04em"}}>ALERTAS</span><span style={{fontSize:10,color:"var(--dim)"}}>{urgentes.length}</span></div>{urgentes.slice(0,4).map(function(e){return <div key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid var(--border)",cursor:"pointer"}}><div style={{width:7,height:7,borderRadius:"50%",background:e.color,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{e.titulo}</div><div style={{fontSize:10.5,color:"var(--muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.nombre}</div></div><strong style={{fontSize:11,color:e.color}}>{e.diasRestantes===0?"HOY":e.diasRestantes<0?"VENCIDO":e.diasRestantes+"d"}</strong></div>})}</div>}
      {proximos.length>0&&<div className="card" style={{padding:0,overflow:"hidden",borderColor:"rgba(212,168,83,.22)"}}><div style={{padding:"12px 14px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:800,color:"var(--gold)",letterSpacing:".04em"}}>PRÓXIMOS 30 DÍAS</span><span style={{fontSize:10,color:"var(--dim)"}}>Agenda</span></div>{proximos.slice(0,4).map(function(e){return <div key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid var(--border)",cursor:"pointer"}}><div style={{width:7,height:7,borderRadius:"50%",background:e.color,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{e.titulo}</div><div style={{fontSize:10.5,color:"var(--muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.nombre}</div></div><strong style={{fontSize:11,color:e.color}}>{e.diasRestantes===0?"Hoy":"En "+e.diasRestantes+"d"}</strong></div>})}</div>}
    </div>}

    <div className="card" style={{padding:14,marginBottom:14,borderRadius:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:12}}>
        <div><div style={{fontSize:15,fontWeight:800,color:"var(--text)"}}>{mesVer.toLocaleString("es-AR",{month:"long",year:"numeric"}).replace(/^./,function(c){return c.toUpperCase();})}</div><div style={{fontSize:10.5,color:"var(--dim)",marginTop:2}}>Seleccioná un evento para abrir la operación.</div></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><button onClick={function(){setMesOffset(function(m){return m-1;});}} className="btn btn-ghost" style={{width:32,height:32,padding:0}}>‹</button><button onClick={function(){setMesOffset(0);}} className="btn btn-ghost" style={{height:32,padding:"0 10px",fontSize:11}}>Hoy</button><button onClick={function(){setMesOffset(function(m){return m+1;});}} className="btn btn-ghost" style={{width:32,height:32,padding:0}}>›</button></div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{filtros.map(function(f){return <button key={f.v} onClick={function(){setFiltro(f.v);}} style={{padding:"6px 11px",borderRadius:20,border:"1px solid "+(filtro===f.v?"rgba(212,168,83,.5)":"var(--border)"),cursor:"pointer",fontSize:10.5,fontWeight:700,background:filtro===f.v?"rgba(212,168,83,.12)":"transparent",color:filtro===f.v?"var(--gold)":"var(--muted)"}}>{f.l}</button>})}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:5}}>{["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"].map(function(d){return <div key={d} style={{textAlign:"center",fontSize:9.5,fontWeight:800,color:"var(--dim)",padding:"5px 0",letterSpacing:".08em"}}>{d}</div>})}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:5}}>{celdas.map(function(dia,i){if(!dia)return <div key={"e"+i} style={{minHeight:72}}/>;var evs=getEventosDia(dia),f=mesVer.getFullYear()+"-"+String(mesVer.getMonth()+1).padStart(2,"0")+"-"+String(dia).padStart(2,"0"),isHoy=f===hoyStr;return <div key={dia} style={{minHeight:72,padding:"7px",borderRadius:11,background:isHoy?"rgba(212,168,83,.08)":"var(--surface)",border:isHoy?"1px solid var(--gold)":"1px solid var(--border)",boxShadow:isHoy?"0 0 0 1px rgba(212,168,83,.08)":"none"}}><div style={{fontSize:10.5,fontWeight:800,color:isHoy?"var(--gold)":"var(--muted)",marginBottom:5}}>{dia}</div>{evs.slice(0,2).map(function(e){return <div key={e.id} title={e.titulo+" — "+e.nombre} onClick={function(){if(e.op)onViewOp(e.op);}} style={{fontSize:8.5,padding:"3px 5px",borderRadius:5,background:e.color+"22",border:"1px solid "+e.color+"55",color:e.color,fontWeight:700,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer"}}>{e.titulo}</div>})}{evs.length>2&&<div style={{fontSize:8.5,color:"var(--dim)",fontWeight:700}}>+{evs.length-2} más</div>}</div>})}</div>
    </div>

    <div className="card" style={{padding:0,overflow:"hidden",borderRadius:16}}>
      <div style={{padding:"13px 15px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:800,color:"var(--text)"}}>Agenda</div><div style={{fontSize:10.5,color:"var(--dim)",marginTop:2}}>Eventos ordenados por fecha</div></div><span style={{fontSize:10,fontWeight:700,color:"var(--muted)"}}>{eventosFiltrados.length} eventos</span></div>
      <div style={{maxHeight:360,overflowY:"auto"}}>{eventosFiltrados.length===0?<div style={{padding:30,textAlign:"center",color:"var(--dim)",fontSize:12}}>No hay eventos que coincidan con el filtro.</div>:eventosFiltrados.map(function(e){var esPasado=e.diasRestantes<0;return <div key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 15px",borderBottom:"1px solid var(--border)",cursor:"pointer"}}><div style={{width:9,height:9,borderRadius:"50%",background:colorEvento[e.tipo]||e.color,flexShrink:0}}/><div style={{width:78,flexShrink:0}}><div style={{fontSize:11,fontWeight:800,color:"var(--text)"}}>{new Date(e.fecha+"T12:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short"})}</div><div style={{fontSize:9.5,color:"var(--dim)"}}>{new Date(e.fecha+"T12:00:00").getFullYear()}</div></div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{e.titulo}</div><div style={{fontSize:10.5,color:"var(--muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.nombre}{e.direccion?" · "+e.direccion:""}</div></div><div style={{fontSize:10.5,fontWeight:800,color:esPasado?"var(--dim)":e.color,whiteSpace:"nowrap"}}>{esPasado?"Vencido":e.diasRestantes===0?"Hoy":"En "+e.diasRestantes+"d"}</div></div>})}</div>
    </div>
  </div>);
}
function EstadisticasView({operaciones,equipo,perfil,currentUserId,currentUserRole}){
  const [rechReady,setRechReady]=useState(!!window.Recharts);
  const [periodoTab,setPeriodoTab]=useState("mensual");
  const [anioSel,setAnioSel]=useState(new Date().getFullYear());
  useEffect(function(){if(!rechReady){loadRecharts().then(function(){setRechReady(true);});}});

  // Una carpeta de operación (Reserva + Refuerzo + Boleto/Comodato/etc.) cuenta
  // como UNA sola operación en estadísticas. Los documentos hijos no se cuentan
  // por separado.
  var idsExistentes={};
  operaciones.forEach(function(o){ idsExistentes[o.id]=true; });
  var operacionesRaiz=operaciones.filter(function(o){ return !o.parent_id || !idsExistentes[o.parent_id]; });
  var now=new Date();
  var esBroker = currentUserRole === "broker";
  var operacionesVisibles = esBroker && currentUserId ? operacionesRaiz.filter(function(o){ return o.broker_id===currentUserId; }) : operacionesRaiz;
  var total=operacionesVisibles.length;

  // --- Mensual: últimos 12 meses, contando carpetas como una operación ---
  var meses12=[];
  for(var i=11;i>=0;i--){
    var d=new Date(now.getFullYear(),now.getMonth()-i,1);
    var key=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
    var mes=d.toLocaleString("es-AR",{month:"short",year:"2-digit"});
    var ops=operacionesVisibles.filter(function(o){return (o.created_at||"").slice(0,7)===key;});
    meses12.push({name:mes,ops:ops.length,usd:ops.filter(function(o){return o.moneda==="USD"&&o.precio;}).reduce(function(s,o){return s+parseFloat(o.precio||0);},0)});
  }

  // --- Anual: por año, contando cada carpeta una sola vez ---
  var anios=[];
  var minAnio=Math.min.apply(null,operacionesRaiz.map(function(o){return parseInt((o.created_at||"9999").slice(0,4));}));
  if(!isFinite(minAnio))minAnio=now.getFullYear();
  for(var y=minAnio;y<=now.getFullYear();y++){
    var yops=operacionesVisibles.filter(function(o){return (o.created_at||"").slice(0,4)===String(y);});
    anios.push({name:String(y),ops:yops.length,usd:yops.filter(function(o){return o.moneda==="USD"&&o.precio;}).reduce(function(s,o){return s+parseFloat(o.precio||0);},0)});
  }

  // --- Por broker: cada carpeta cuenta una sola vez ---
  var mesActual=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0");
  var brokers=(equipo||[]).map(function(m){
    var mops=operacionesVisibles.filter(function(o){return o.broker_id===m.id;});
    var mopsAnio=mops.filter(function(o){return (o.created_at||"").slice(0,4)===String(anioSel);});
    var mopsMes=mops.filter(function(o){return (o.created_at||"").slice(0,7)===mesActual;});
    return {id:m.id,nombre:m.nombre,foto:m.fotoDataUrl,total:mops.length,anio:mopsAnio.length,mes:mopsMes.length,activas:mops.filter(function(o){return o.estado==="activo";}).length};
  }).filter(function(b){return b.total>0;}).sort(function(a,b){return b.total-a.total;});

  // Todo lo estadístico parte de la carpeta raíz. Los documentos vinculados
  // (reserva → boleto, refuerzo, comodato, etc.) nunca vuelven a sumar.
  var usd=operacionesVisibles.filter(function(o){return o.moneda==="USD"&&o.precio;}).reduce(function(s,o){return s+parseFloat(o.precio||0);},0);
  var ars=operacionesVisibles.filter(function(o){return o.moneda==="ARS"&&o.precio;}).reduce(function(s,o){return s+parseFloat(o.precio||0);},0);
  var canon=operacionesVisibles.filter(function(o){return o.tipo==="alquiler"&&o.alquiler_monto_inicial;}).reduce(function(s,o){return s+parseFloat(o.alquiler_monto_inicial||0);},0);
  function grupoRaiz(o){return [o].concat(operaciones.filter(function(h){return h.parent_id===o.id;}));}
  function comisionOperacion(o){
    var items=getComisionComponents(o);
    var monedas=[]; items.forEach(function(c){if(monedas.indexOf(c.moneda)===-1)monedas.push(c.moneda);});
    var moneda=monedas[0]||((o&&o.tipo==="alquiler")?"ARS":"USD");
    var monto=monedas.length===1?items.reduce(function(s,c){return s+c.monto;},0):0;
    var pct=items.filter(function(c){return c.modo==="porcentaje";}).reduce(function(s,c){return s+(parseFloat(c.valor)||0);},0);
    return {monto:monto,moneda:moneda,pct:pct,items:items,monedas:monedas,mixedCurrency:monedas.length>1};
  }
  var splitBroker=Math.max(0,Math.min(100,parseFloat((perfil&&perfil.broker_split_pct)!=null?perfil.broker_split_pct:50)||0));
  var splitMode=(perfil&&perfil.broker_split_mode)==="individual"?"individual":"uniforme";
  var splitMap=(perfil&&perfil.broker_splits&&typeof perfil.broker_splits==="object")?perfil.broker_splits:{};
  var splitBrokerPersonal=esBroker&&currentUserId&&splitMap[currentUserId]!=null?Math.max(0,Math.min(100,parseFloat(splitMap[currentUserId])||0)):splitBroker;
  var comisiones=operacionesVisibles.map(function(o){var c=comisionOperacion(o);var split=splitMode==="individual"&&o.broker_id&&splitMap[o.broker_id]!=null?Math.max(0,Math.min(100,parseFloat(splitMap[o.broker_id])||0)):splitBroker;var brokerShare=0,inmoShare=0;var items=(c.items||[]).map(function(i){var b=o.broker_id?i.monto*split/100:0;var im=i.monto-b;brokerShare+=b;inmoShare+=im;return Object.assign({},i,{brokerShare:b,inmobiliariaShare:im});});return Object.assign({op:o,brokerShare:brokerShare,inmobiliariaShare:inmoShare,brokerSplit:split,items:items},c);});
  function sumaComisionesMoneda(lista,moneda,campo){return lista.reduce(function(total,x){return total+(x.items||[]).filter(function(i){return i.moneda===moneda;}).reduce(function(s,i){return s+(i[campo]||0);},0);},0);}

  // Ranking interno: solo se calcula cuando el Dueño/Administrador lo habilita.
  // Combina 50% cantidad de operaciones y 50% facturación generada por cada broker.
  // Los importes nunca se muestran en pantalla.
  var rankingActivo=!!(perfil&&perfil.ranking_interno_activo);
  var rankingBase=(equipo||[]).filter(function(m){return m.rol==="broker";}).map(function(m){
    var mops=operacionesRaiz.filter(function(o){return o.broker_id===m.id && (o.created_at||"").slice(0,4)===String(now.getFullYear());});
    var mcom=comisiones.filter(function(x){return x.op&&x.op.broker_id===m.id && (x.op.created_at||"").slice(0,4)===String(now.getFullYear());});
    var fact=mcom.reduce(function(total,x){return total+(x.items||[]).reduce(function(st,i){return st+(parseFloat(i.monto)||0);},0);},0);
    return {id:m.id,nombre:m.nombre||"Asesor",foto:m.fotoDataUrl||"",operaciones:mops.length,facturacion:fact};
  }).filter(function(x){return x.operaciones>0 || x.facturacion>0;});
  var maxOps=rankingBase.reduce(function(mx,x){return Math.max(mx,x.operaciones);},0);
  var maxFact=rankingBase.reduce(function(mx,x){return Math.max(mx,x.facturacion);},0);
  var rankingInterno=rankingBase.map(function(x){
    var score=(maxOps?x.operaciones/maxOps:0)*50+(maxFact?x.facturacion/maxFact:0)*50;
    return Object.assign({},x,{score:score});
  }).sort(function(a,b){return b.score-a.score || b.operaciones-a.operaciones || b.facturacion-a.facturacion || a.nombre.localeCompare(b.nombre,"es");}).map(function(x,i){return Object.assign({},x,{puesto:i+1});});
  var comUsdMes=comisiones.filter(function(x){return (x.op.created_at||"").slice(0,7)===mesActual && (x.items||[]).some(function(i){return i.moneda==="USD";});});
  var comArsMes=comisiones.filter(function(x){return (x.op.created_at||"").slice(0,7)===mesActual && (x.items||[]).some(function(i){return i.moneda!=="USD";});});
  var totalBrokerUsd=sumaComisionesMoneda(comUsdMes,"USD","brokerShare");
  var totalBrokerArs=sumaComisionesMoneda(comArsMes,"ARS","brokerShare");
  var totalInmoUsd=sumaComisionesMoneda(comUsdMes,"USD","inmobiliariaShare");
  var totalInmoArs=sumaComisionesMoneda(comArsMes,"ARS","inmobiliariaShare");
  var porTipo=[
    {name:"Compraventas",v:operacionesVisibles.filter(function(o){return grupoRaiz(o).some(function(x){return x.tipo==="reserva"||x.tipo==="boleto";});}).length,color:"#60a5fa"},
    {name:"Alquileres",v:operacionesVisibles.filter(function(o){return grupoRaiz(o).some(function(x){return x.tipo==="reserva_alquiler"||x.tipo==="alquiler";});}).length,color:"#2dd4bf"},
    {name:"Otros",v:operacionesVisibles.filter(function(o){return grupoRaiz(o).every(function(x){return !["reserva","boleto","reserva_alquiler","alquiler"].includes(x.tipo);});}).length,color:"#a78bfa"},
  ].filter(function(x){return x.v>0;});

  var chartData=periodoTab==="mensual"?meses12:anios;
  var aniosDisp=[];
  for(var ay=minAnio;ay<=now.getFullYear();ay++) aniosDisp.push(ay);

  return(
    <div>
      <div className="section-header">
        <div><div className="section-title">Estadísticas</div><div className="section-sub">{esBroker ? "Tus operaciones y tus honorarios, sin mostrar información financiera de la inmobiliaria." : "Una lectura clara de tus operaciones, sin contar documentos vinculados dos veces."}</div></div>
      </div>

      {/* Resumen global */}
      <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{l:"Total operaciones",v:total,i:"📁"},{l:"Activas",v:operacionesVisibles.filter(function(o){return grupoRaiz(o).some(function(x){return x.estado==="activo";});}).length,i:"🟢"},{l:"Alquileres",v:operacionesVisibles.filter(function(o){return grupoRaiz(o).some(function(x){return x.tipo==="alquiler"||x.tipo==="reserva_alquiler";});}).length,i:"🏠"},{l:"Compraventas",v:operacionesVisibles.filter(function(o){return grupoRaiz(o).some(function(x){return x.tipo==="boleto"||x.tipo==="reserva";});}).length,i:"📄"}].map(function(s){
          return <div key={s.l} className="stat-card"><div className="stat-icon">{s.i}</div><div className="stat-val">{s.v}</div><div className="stat-lbl">{s.l}</div></div>;
        })}
      </div>

      {!esBroker && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
        {[{l:"Total USD",v:"U$D "+usd.toLocaleString("es-AR"),i:"💵"},{l:"Total ARS",v:"$ "+ars.toLocaleString("es-AR"),i:"💴"},{l:"Canon/mes",v:"$ "+canon.toLocaleString("es-AR"),i:"🏘"}].map(function(s){
          return <div key={s.l} className="card" style={{padding:18}}><div style={{fontSize:18,marginBottom:6}}>{s.i}</div><div style={{fontFamily:"DM Serif Display,serif",fontSize:18,color:"var(--teal)",lineHeight:1.2,marginBottom:3}}>{s.v}</div><div style={{fontSize:11,color:"var(--dim)"}}>{s.l}</div></div>;
        })}
      </div>}

      <div className="card" style={{padding:18,marginBottom:20,borderRadius:16,borderColor:"rgba(212,168,83,.20)",background:"linear-gradient(135deg,rgba(212,168,83,.06),transparent)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:14}}>
          <div><div style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>💰 {esBroker?"Mis comisiones":"Comisiones y participación"}</div><div style={{fontSize:10.5,color:"var(--dim)",marginTop:3}}>{esBroker?"Este mes · únicamente las operaciones asignadas a vos.":"Este mes · resumen de honorarios y distribución."}</div></div>
          <div style={{fontSize:10.5,color:"var(--gold)",fontWeight:700,padding:"6px 9px",borderRadius:20,background:"rgba(212,168,83,.10)"}}>{esBroker?"Mi participación "+splitBrokerPersonal+"%":"Asesor "+splitBroker+"% · Inmobiliaria "+(100-splitBroker)+"%"}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>
          {[{l:"Mis honorarios · USD",v:"U$D "+(esBroker?totalBrokerUsd:(totalBrokerUsd+totalInmoUsd)).toLocaleString("es-AR")},{l:"Mi participación · USD",v:"U$D "+totalBrokerUsd.toLocaleString("es-AR")},{l:"Mis honorarios · ARS",v:"$ "+(esBroker?totalBrokerArs:(totalBrokerArs+totalInmoArs)).toLocaleString("es-AR")},{l:"Mi participación · ARS",v:"$ "+totalBrokerArs.toLocaleString("es-AR")}].map(function(k){return <div key={k.l} style={{padding:"11px 12px",borderRadius:11,background:"rgba(255,255,255,.025)",border:"1px solid var(--border)"}}><div style={{fontSize:9.5,color:"var(--dim)",marginBottom:4}}>{k.l}</div><div style={{fontSize:16,fontWeight:800,color:"var(--text)"}}>{k.v}</div></div>})}
        </div>
      </div>

      {rankingActivo&&rankingInterno.length>0&&(!esBroker || currentUserId)&&(<div className="card" style={{padding:18,marginBottom:20,borderRadius:16,borderColor:"rgba(212,168,83,.22)",background:"linear-gradient(135deg,rgba(212,168,83,.07),transparent)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:14}}>
          <div><div style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>🏆 Ranking interno</div><div style={{fontSize:10.5,color:"var(--dim)",marginTop:3}}>Competencia interna de la inmobiliaria · año {now.getFullYear()}</div></div>
          <span style={{fontSize:9.5,fontWeight:700,color:"var(--gold)",padding:"5px 8px",borderRadius:20,background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.18)"}}>OPERACIONES + FACTURACIÓN</span>
        </div>
        <div style={{fontSize:10.5,color:"var(--dim)",marginBottom:10}}>El puesto se calcula con cantidad de operaciones y facturación. Los importes de facturación no se muestran.</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {rankingInterno.map(function(r){
            var soyYo=esBroker&&currentUserId===r.id;
            return <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,border:soyYo?"1px solid rgba(212,168,83,.35)":"1px solid var(--border)",background:soyYo?"rgba(212,168,83,.08)":"rgba(255,255,255,.02)"}}>
              <div style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:r.puesto<=3?"var(--gold)":"var(--muted)",background:"rgba(255,255,255,.04)",flexShrink:0}}>{r.puesto}</div>
              <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",background:"linear-gradient(135deg,var(--gold),var(--gold2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#0a0f1a",flexShrink:0}}>{r.foto?<img src={r.foto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(r.nombre[0]||"?").toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:750,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nombre}{soyYo?" · Vos":""}</div><div style={{fontSize:9.5,color:"var(--dim)",marginTop:2}}>Facturación considerada en el ranking · importe oculto</div></div>
              <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>{r.operaciones}</div><div style={{fontSize:8.5,color:"var(--dim)"}}>operaciones</div></div>
            </div>;
          })}
        </div>
      </div>)}

      {/* Tabs mensual/anual */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        {["mensual","anual"].map(function(t){
          return <button key={t} onClick={function(){setPeriodoTab(t);}} style={{padding:"6px 16px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:periodoTab===t?"var(--gold)":"var(--border)",color:periodoTab===t?"#0a0f1a":"var(--muted)",transition:"all 0.15s",textTransform:"capitalize"}}>{t==="mensual"?"📅 Últimos 12 meses":"📆 Por año"}</button>;
        })}
        {periodoTab==="anual"&&<select value={anioSel} onChange={function(e){setAnioSel(parseInt(e.target.value));}} className="inp" style={{width:"auto",padding:"5px 10px",fontSize:12}}>
          {aniosDisp.map(function(y){return <option key={y} value={y}>{y}</option>;})}
        </select>}
      </div>

      {/* Gráfico ops */}
      {rechReady&&window.Recharts&&(function(){
        var {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,Legend}=window.Recharts;
        return(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
            <div className="card" style={{padding:18}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:14}}>Operaciones {periodoTab==="mensual"?"por mes":"por año"}</div>
              <div style={{height:180}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#f1f5f9",fontSize:12}}/>
                    <Bar dataKey="ops" fill="var(--gold)" radius={[4,4,0,0]} name="Operaciones"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card" style={{padding:18}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:14}}>Por tipo de documento</div>
              <div style={{height:180}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={porTipo.length?porTipo:[{name:"Sin datos",v:1,color:"#1e293b"}]} dataKey="v" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={30}>
                      {(porTipo.length?porTipo:[{color:"#1e293b"}]).map(function(e,i){return <Cell key={i} fill={e.color}/>;})}</Pie>
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#f1f5f9",fontSize:12}}/>
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10,color:"#94a3b8"}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Por broker */}
      {brokers.length>0&&(
        <div className="card" style={{padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:14}}>📊 Rendimiento por asesor — {anioSel}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {brokers.map(function(b){
              return(
                <div key={b.nombre} style={{padding:"14px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,var(--gold),var(--gold2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#0a0f1a",flexShrink:0,overflow:"hidden"}}>
                      {b.foto?<img src={b.foto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:b.nombre[0]}
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.nombre}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,textAlign:"center"}}>
                    {(function(){var bcMesOps=comisiones.filter(function(x){return x.op.broker_id===b.id&&(x.op.created_at||"").slice(0,7)===mesActual;});var bcUsd=sumaComisionesMoneda(bcMesOps,"USD","brokerShare");var bcArs=sumaComisionesMoneda(bcMesOps,"ARS","brokerShare");return [{l:"Este mes",v:b.mes,c:"var(--gold)"},{l:"Comisión mes",v:(bcUsd||bcArs)?(bcUsd?"U$D "+bcUsd.toLocaleString("es-AR"):"")+(bcUsd&&bcArs?" · ":"")+(bcArs?"$ "+bcArs.toLocaleString("es-AR"):""):"—",c:"var(--green)"},{l:"Este año",v:b.anio,c:"var(--teal)"},{l:"Total",v:b.total,c:"var(--muted)"}];})().map(function(s){
                      return <div key={s.l} style={{padding:"6px 4px",borderRadius:8,background:"rgba(255,255,255,0.03)"}}>
                        <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:9,color:"var(--dim)"}}>{s.l}</div>
                      </div>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
function normalizarBusqueda(value){
  return String(value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
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


function DashboardView({operaciones,clausulas,perfil,bloquesReserva,onNew,onEdit,onDelete,onChangeEstado,onConvertir,onConvertirComodato,onConvertirRefuerzo,onConvertirBoleto,onConvertirDevolucion,onDuplicar,onViewDoc,onPerfil,searchOverride,papelera,onRestore,onDeletePermanente,onVaciarPapelera,confirmVaciarPapelera,setConfirmVaciarPapelera,papeleraJump,error,loading}){

  const [search,setSearch]=useState("");
  const [filtroTipo,setFiltroTipo]=useState(function(){return lsGet("dashboard_filtro_tipo_v1","todos");});
  useEffect(function(){lsSet("dashboard_filtro_tipo_v1",filtroTipo||"todos");},[filtroTipo]);
  // Por defecto se muestran solo las operaciones Activas (en vez de todas),
  // para que la pantalla de inicio no arranque saturada de borradores y cerradas.
  // También persistimos la pestaña para que al volver la app abra exactamente en
  // el estado que estaba consultando el usuario.
  const [estadoTab,setEstadoTab]=useState(function(){return lsGet("dashboard_estado_tab_v1","activo");});
  useEffect(function(){lsSet("dashboard_estado_tab_v1",estadoTab||"activo");},[estadoTab]);
  const [modoVista,setModoVista]=useState(function(){return lsGet("dashboard_modo_vista_v1","tarjetas");});
  useEffect(function(){lsSet("dashboard_modo_vista_v1",modoVista);},[modoVista]);
  const [filtrosAbiertos,setFiltrosAbiertos]=useState(function(){return lsGet("dashboard_filtros_abiertos_v1",false);});
  const [filtros,setFiltros]=useState(function(){return lsGet("dashboard_filtros_v1",{desde:"",hasta:"",agente:"todos",montoMin:"",montoMax:"",sucursal:"todos"});});
  useEffect(function(){lsSet("dashboard_filtros_v1",filtros);},[filtros]);
  useEffect(function(){lsSet("dashboard_filtros_abiertos_v1",filtrosAbiertos);},[filtrosAbiertos]);

  // Permite que el ícono de papelera del topbar mobile salte directo a la
  // pestaña "Papelera" sin depender de una vista/ruta aparte.
  useEffect(function(){ if(papeleraJump){ setEstadoTab("papelera"); } },[papeleraJump]);
  const effectiveSearch=searchOverride!==undefined&&searchOverride!==""?searchOverride:search;
  // Agrupamos documentos derivados (Comodato / Refuerzo / Contrato desde Reserva de Locación)
  // bajo la operación que les dio origen, para que aparezcan juntos en una "carpeta".
  const childrenMap={};
  operaciones.forEach(function(o){ if(o.parent_id){ (childrenMap[o.parent_id]=childrenMap[o.parent_id]||[]).push(o); } });
  const idsExistentes={}; operaciones.forEach(function(o){idsExistentes[o.id]=true;});
  // Raíz = operación sin padre, o cuyo padre ya no existe (huérfana). El resto
  // cuelga de su padre y se filtra/busca como parte del grupo de la carpeta,
  // no como fila suelta — así una carpeta aparece en "Activas" si CUALQUIERA
  // de sus documentos (la reserva original o un refuerzo, por ejemplo) está
  // activo, aunque el resto siga en otro estado.
  const raices=operaciones.filter(function(o){ return !o.parent_id || !idsExistentes[o.parent_id]; });
  function grupoDe(op){ return [op].concat(childrenMap[op.id]||[]); }
  const filtered=raices.filter(function(op){
    var matchSearch=true,matchTipo=true,matchEstado=true;
    if(effectiveSearch){
      matchSearch=grupoDe(op).some(function(o){return operacionCoincideBusqueda(o,effectiveSearch);});
    }
    if(filtroTipo!=="todos")matchTipo=grupoDe(op).some(function(o){return o.tipo===filtroTipo;});
    if(estadoTab!=="todas")matchEstado=grupoDe(op).some(function(o){return o.estado===estadoTab;});
    var matchAvanzado=true;
    if(filtros.agente!=="todos") matchAvanzado=grupoDe(op).some(function(o){return String(o.broker_id||"")===String(filtros.agente);});
    if(filtros.sucursal!=="todos") matchAvanzado=matchAvanzado&&grupoDe(op).some(function(o){return String(o.sucursal||o.sucursal_nombre||"")===String(filtros.sucursal);});
    var minM=filtros.montoMin!==""?parseFloat(filtros.montoMin):null, maxM=filtros.montoMax!==""?parseFloat(filtros.montoMax):null;
    if(minM!==null||maxM!==null) matchAvanzado=matchAvanzado&&grupoDe(op).some(function(o){var m=Number(o.precio||o.alquiler_monto_inicial||o.res_alq_monto_mensual||0);return (minM===null||m>=minM)&&(maxM===null||m<=maxM);});
    if(filtros.desde) matchAvanzado=matchAvanzado&&grupoDe(op).some(function(o){return new Date(o.created_at||0)>=new Date(filtros.desde+"T00:00:00");});
    if(filtros.hasta) matchAvanzado=matchAvanzado&&grupoDe(op).some(function(o){return new Date(o.created_at||0)<=new Date(filtros.hasta+"T23:59:59");});
    return matchSearch&&matchTipo&&matchEstado&&matchAvanzado;
  });
  var total=raices.length;
  var activas=raices.filter(function(o){return grupoDe(o).some(function(x){return x.estado==="activo";});}).length;
  var alq=raices.filter(function(o){return grupoDe(o).some(function(x){return x.tipo==="alquiler"||x.tipo==="reserva_alquiler";});}).length;
  var compras=raices.filter(function(o){return grupoDe(o).some(function(x){return x.tipo==="boleto"||x.tipo==="reserva";});}).length;
  var nuevasCount=raices.filter(function(o){return grupoDe(o).some(function(x){return x.estado==="borrador";});}).length;
  var cerradasCount=raices.filter(function(o){return grupoDe(o).some(function(x){return x.estado==="cerrado";});}).length;
  // Carpetas abiertas/cerradas (colapsadas por defecto para que la lista se
  // vea compacta cuando hay muchas operaciones con documentos vinculados).
  const [openFolders,setOpenFolders]=useState({});
  function getName(op){if(op.tipo==="alquiler"||op.tipo==="reserva_alquiler")return nombreConSufijo(op,"locatario","Locatario")+" ← "+nombreConSufijo(op,"locador","Locador");return nombreConSufijo(op,"comprador","Comprador")+" ← "+nombreConSufijo(op,"vendedor","Vendedor");}
  function getMonto(op){if(op.tipo==="alquiler")return op.alquiler_monto_inicial?fmt$(op.alquiler_monto_inicial,op.alquiler_moneda)+"/mes":null;if(op.tipo==="reserva_alquiler")return op.res_alq_monto_mensual?fmt$(op.res_alq_monto_mensual,op.res_alq_monto_mensual_moneda||op.res_alq_moneda||"ARS")+"/mes est.":null;return op.precio?fmt$(op.precio,op.moneda):null;}
  function getTituloCarpeta(op){ return tipoInmuebleLabel(op.inmueble_tipo,op.inmueble_tipo_otro)+(op.inmueble_direccion?" — "+op.inmueble_direccion:"")+(op.inmueble_partido?" ("+op.inmueble_partido+")":""); }

  const [sharingId,setSharingId]=useState(null);
  const [historialOp,setHistorialOp]=useState(null);
  // Modal único "Documentos vinculados": reemplaza los botones sueltos de
  // conversión (Boleto/Comodato/Refuerzo/Contrato) por un solo punto de
  // entrada claro, que además muestra qué se hereda y qué hay que recargar.
  const [addDocFor,setAddDocFor]=useState(null); // op | null
  function opcionesDoc(op){
    if(op.tipo==="reserva") return [
      {tipo:"boleto", icon:"📄", label:"Boleto de Compraventa", desc:"Firma formal de la compraventa.",
        hereda:"Comprador, vendedor, inmueble, precio y comisión.", pide:"Fecha de posesión, saldo y escribanía.", accion:onConvertirBoleto},
      {tipo:"comodato", icon:"🤝", label:"Comodato", desc:"Préstamo de uso gratuito del inmueble.",
        hereda:"Comprador, vendedor e inmueble.", pide:"Plazo y destino del comodato.", accion:onConvertirComodato},
      {tipo:"refuerzo_reserva", icon:"📌", label:"Refuerzo de Reserva", desc:"Pago adicional sobre la seña ya entregada.",
        hereda:"Partes, inmueble y seña original.", pide:"Monto y fecha del refuerzo.", accion:onConvertirRefuerzo},
      {tipo:"devolucion_reserva", icon:"↩", label:"Devolución de Reserva", desc:"Cierra la operación cuando la reserva no avanza.",
        hereda:"Partes, inmueble y monto reservado.", pide:"Motivo y confirmación final.", accion:onConvertirDevolucion},
    ];
    if(op.tipo==="reserva_alquiler") return [
      {tipo:"alquiler", icon:"🔑", label:"Contrato de Locación", desc:"Contrato definitivo de alquiler.",
        hereda:"Locador, locatario e inmueble.", pide:"Garantía y fecha de inicio.", accion:onConvertir},
    ];
    return [];
  }
  // Pequeño efecto de transición: al eliminar, la tarjeta se desvanece y se
  // desliza hacia la papelera antes de desaparecer de la lista, en vez de
  // saltar de golpe (usa la transición ya definida en .op-card).
  const [removingIds,setRemovingIds]=useState({});
  function eliminarConEfecto(id){
    setRemovingIds(function(r){return Object.assign({},r,{[id]:true});});
    setTimeout(function(){ onDelete(id); setRemovingIds(function(r){var n=Object.assign({},r);delete n[id];return n;}); },260);
  }

  function defaultTabFor(op){
    if(op.tipo==="alquiler")return "alquiler";
    if(op.tipo==="reserva_alquiler")return "reserva_alquiler";
    return "boleto";
  }

  async function shareWhatsApp(op){
    setSharingId(op.id);
    var popup=null;
    try{ popup=window.open("about:blank","docworks-share","noopener,noreferrer"); }catch(_e){}
    try{
      var doc = aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(op), clausulas, defaultTabFor(op), bloquesReserva), op, defaultTabFor(op), perfil);
      var result = await generarPDF(doc, perfil.logoDataUrl||null, perfil);
      var txt = TIPOS[op.tipo]+" — "+getName(op)+(op.inmueble_direccion?" — "+op.inmueble_direccion:"");
      var entrega = await entregarArchivo(result.blob, result.filename, "application/pdf", {title:TIPOS[op.tipo], text:txt});
      if(entrega==="downloaded-whatsapp"){
        if(popup && !popup.closed) popup.location.href="https://web.whatsapp.com/send?text="+encodeURIComponent(txt);
        alert("Abrimos WhatsApp Web y descargamos el PDF para adjuntarlo al chat.");
      } else if(popup && !popup.closed){ popup.close(); }
    } catch(e){
      if(popup && !popup.closed) popup.close();
      if(!(e && e.name==="AbortError")) alert(traducirError(e&&e.message?e.message:"No se pudo compartir el documento."));
    }
    setSharingId(null);
  }

  const ESTADO_TABS=[
    {id:"todas",label:"Todas",count:total,icon:"folder"},
    {id:"borrador",label:"Borrador",count:nuevasCount,icon:"edit"},
    {id:"activo",label:"Activas",count:activas,icon:"clock"},
    {id:"cerrado",label:"Cerradas",count:cerradasCount,icon:"check"},
    {id:"papelera",label:"Papelera",count:papelera.length,icon:"trash"},
  ];
  const enPapelera = estadoTab==="papelera";

  function renderOpRow(op,nested){
    const monto=getMonto(op),esResAlq=op.tipo==="reserva_alquiler",esReserva=op.tipo==="reserva";
    const hijosOp=childrenMap[op.id]||[];
    const compartiendo=sharingId===op.id;
    // El menú "⋯" concentra las acciones secundarias de la fila.
    // "Abrir" y "Editar" quedan visibles; "Compartir" vive dentro de este menú.
    const menuItems=[
      {label:"Compartir",icon:<DWIcon name="share" size={13}/>,onClick:function(){shareWhatsApp(op);}},
      {label:"Historial de acciones",icon:<DWIcon name="clock" size={13}/>,onClick:function(){setHistorialOp(op);}},
      {label:"Duplicar",icon:<DWIcon name="duplicate" size={13}/>,onClick:function(){onDuplicar(op);}},
      op.estado!=="activo"?{label:"Marcar activo",icon:<DWIcon name="check" size={13}/>,onClick:function(){onChangeEstado(op.id,"activo");}}:null,
      op.estado!=="cerrado"?{label:"Marcar cerrado",icon:<DWIcon name="ban" size={13}/>,onClick:function(){onChangeEstado(op.id,"cerrado");}}:null,
      {label:"Eliminar",icon:<DWIcon name="trash" size={13}/>,red:true,onClick:function(){eliminarConEfecto(op.id);}},
    ].filter(Boolean);
    var removiendo = !!removingIds[op.id];

    const acciones=(
      <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
        <Btn v="primary" s="md" onClick={function(){onViewDoc(op);}} style={{minWidth:94,justifyContent:"center",fontWeight:800,padding:"9px 14px"}}><DWIcon name="open" size={13} strokeWidth={2}/> Abrir</Btn>
        <Btn v="secondary" s="md" onClick={function(){onEdit(op);}} style={{minWidth:88,justifyContent:"center",fontWeight:700,padding:"9px 13px"}}><DWIcon name="edit" size={13}/> Editar</Btn>
        <Dropdown items={menuItems}/>
      </div>
    );

    // Fila condensada para documentos dentro de una carpeta: la operación
    // raíz ya muestra nombre y dirección, así que acá no se repite — solo
    // lo que distingue a ESTE documento (tipo, estado, monto, fecha).
    if (nested) {
      return(
        <div key={op.id} className="op-card fade-up" style={Object.assign({marginTop:8,marginLeft:18,padding:"10px 12px",borderStyle:"dashed"},removiendo?{opacity:0,transform:"translateX(28px) scale(0.96)",pointerEvents:"none"}:{})}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",rowGap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",minWidth:0}}>
              <span style={{color:"var(--dim)",fontSize:12,flexShrink:0}}>↳</span>
              <span className={"op-status-badge "+(op.estado||"borrador")} style={{flexShrink:0}}>{ESTADOS[op.estado]||"Borrador"}</span>
              <span style={{fontSize:12.5,fontWeight:600,color:"var(--text)"}}>{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]}</span>
              {monto&&<span className="monto-tag">{monto}</span>}
              <span style={{fontSize:11,color:"var(--dim)",flexShrink:0}}>{new Date(op.created_at).toLocaleDateString("es-AR")}</span>
            </div>
            {acciones}
          </div>
        </div>
      );
    }

    var estadoClase=op.estado||"borrador";
    var hijosCount=hijosOp.length;
    var docsTotal=(esReserva||esResAlq)?(opcionesDoc(op)||[]).length:(hijosCount>0?hijosCount+1:1);
    var docsHechos=(esReserva||esResAlq)?Math.min(docsTotal,1+hijosCount):(hijosCount>0?hijosCount+1:1);
    var progreso=Math.max(8,Math.min(100,Math.round((docsHechos/Math.max(1,docsTotal))*100)));
    var ultima=op.actualizado_en||op.updated_at||op.created_at;
    function haceFecha(v){if(!v)return "Sin actividad";var d=new Date(v),ms=Math.max(0,Date.now()-d.getTime()),min=Math.floor(ms/60000),hor=Math.floor(min/60),dias=Math.floor(hor/24);if(min<1)return "Ahora";if(min<60)return "Hace "+min+" min";if(hor<24)return "Hace "+hor+" h";if(dias<30)return "Hace "+dias+" día"+(dias===1?"":"s");return d.toLocaleDateString("es-AR");}
    var direccion=op.inmueble_direccion||"";
    return(
      <div key={op.id} className="op-card op-card-premium fade-up" style={Object.assign({position:"relative",marginTop:hijosOp.length?8:0},removiendo?{opacity:0,transform:"translateX(28px) scale(0.96)",pointerEvents:"none"}:{})}>
        <div className={"op-state-rail "+estadoClase}/><div style={{display:"flex",gap:15,alignItems:"stretch"}}>
          <div style={{flex:1,minWidth:0,paddingLeft:2}}>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:8}}>
              <span className="op-type-badge">{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]||op.tipo}</span>
              <span className={"op-status-hero "+estadoClase}>{ESTADOS[op.estado]||"Borrador"}</span>
              {op.compartida&&<span className="badge" style={{background:"rgba(96,165,250,0.14)",color:"#60a5fa"}}>Compartida</span>}
            </div>
            <div className={"op-address-strong "+(!direccion?"op-address-missing":"")} style={{display:"flex",alignItems:"flex-start",gap:6}}>
              <span style={{color:direccion?"var(--gold)":"#f59e0b",display:"inline-flex",marginTop:2}}><DWIcon name="pin" size={14}/></span>
              <span>{direccion||"⚠ Sin dirección cargada"}{op.inmueble_partido?" — "+op.inmueble_partido:""}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginTop:8}}>
              <div style={{fontSize:13,color:"var(--text)",fontWeight:650}}>{getName(op)}</div>
              {monto&&<span className="monto-tag">{monto}</span>}
            </div>
            <div style={{fontSize:11.5,color:"var(--dim)",marginTop:6,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontWeight:700,color:"var(--muted)"}}>{esResAlq?"Locador → Locatario":esReserva?"Vendedor → Comprador":"Partes de la operación"}</span>
              <span>·</span><span>{new Date(op.created_at).toLocaleDateString("es-AR")}</span>
            </div>
            {(()=>{var pp=getProximoPasoOperacion(op,operaciones);return <div style={{marginTop:9,padding:"7px 9px",borderRadius:8,background:"rgba(212,168,83,.045)",border:"1px solid rgba(212,168,83,.12)",fontSize:11,color:pp.tone,fontWeight:750,display:"inline-flex",alignItems:"center",gap:5}}><span>{pp.icon}</span>{pp.texto}</div>;})()}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginTop:10}}>
              {(esReserva||esResAlq)?(function(){var opts=opcionesDoc(op);var faltan=opts.filter(function(o){return !hijosOp.some(function(h){return h.tipo===o.tipo;});}).length;return <Btn v={faltan>0?"orange":"secondary"} s="sm" onClick={function(){setAddDocFor(op);}}><DWIcon name="link" size={12} strokeWidth={2}/> {hijosOp.length>0?"Vinculados ("+hijosOp.length+")":"Agregar documento"}</Btn>;})():<span/>}
              {acciones}
            </div>
          </div>
          <div className="op-card-side">
            <div><div className="op-side-label">Última actividad</div><div style={{fontSize:12,fontWeight:750,color:"var(--text)",marginTop:2}}>{haceFecha(ultima)}</div></div>
            <div><div className="op-side-label">Documentos</div><div style={{fontSize:12,fontWeight:750,color:"var(--text)",marginTop:2}}>{docsHechos}/{docsTotal} docs</div></div>
            {(docsTotal>1||esReserva||esResAlq) ? <div><div className="op-side-label">Progreso</div><div className="op-progress" style={{marginTop:5}}><span style={{width:(progreso+"%")}} /></div></div> : null}
            {op.broker_nombre||op.broker?<div><div className="op-side-label">Agente</div><div style={{fontSize:11.5,fontWeight:650,color:"var(--text)",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{op.broker_nombre||op.broker}</div></div>:null}
          </div>
        </div>
      </div>
    );
  }

  return(
    <div>
      <div className="section-header" style={{marginBottom:18}}>
        <div><div className="section-title">Operaciones</div><div className="section-sub">Tus carpetas de trabajo, con todos sus documentos vinculados en un solo lugar.</div></div>
        {!enPapelera&&<Btn onClick={onNew} className="btn-nueva">+ Nueva operación</Btn>}
      </div>
      {error && <div style={{marginBottom:16,padding:"10px 14px",borderRadius:10,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",color:"var(--red)",fontSize:12.5}}>{error} — el cambio puede no haberse guardado en la nube. Revisá tu conexión.</div>}
      {loading && operaciones.length===0 && <div style={{marginBottom:16,fontSize:12.5,color:"var(--muted)"}}>Cargando tus operaciones…</div>}

      {/* Tabs de estado: Todas / Nuevas / Activas / Cerradas / Papelera.
          overflow-x:auto + flex-shrink:0 + white-space:nowrap en cada botón
          evita que la barra se corra o que el texto se corte en pantallas
          angostas: si no entran todas, se scrollea horizontal en vez de
          apretar/cortar las pestañas. */}
      <div className="estado-tabs" style={{display:"flex",gap:6,marginBottom:16,borderBottom:"1px solid var(--border)",paddingBottom:0,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        {ESTADO_TABS.map(function(t){
          return(
            <button key={t.id} onClick={function(){setEstadoTab(t.id);}} style={{
              padding:"9px 16px",border:"none",background:"transparent",cursor:"pointer",
              fontSize:13,fontWeight:600,color:estadoTab===t.id?"var(--gold)":"var(--dim)",
              borderBottom:estadoTab===t.id?"2px solid var(--gold)":"2px solid transparent",
              transition:"border-color 0.15s,color 0.15s",display:"flex",alignItems:"center",gap:6,
              flexShrink:0,whiteSpace:"nowrap",
            }}>
              <span style={{display:"inline-flex",alignItems:"center",color:estadoTab===t.id?"var(--gold)":"var(--dim)"}}><DWIcon name={t.icon} size={14} strokeWidth={1.9}/></span>
              {t.label}
              <span className="op-count-pill">{t.count}</span>
            </button>
          );
        })}
      </div>

      {enPapelera ? (
        <PapeleraView embedded={true} papelera={papelera} onRestore={onRestore} onDeletePermanente={onDeletePermanente} onVaciar={onVaciarPapelera} confirmVaciar={confirmVaciarPapelera} setConfirmVaciar={setConfirmVaciarPapelera}/>
      ) : (
      <>
      <div className="filter-row" style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",padding:"10px",border:"1px solid var(--border)",borderRadius:14,background:"var(--surface2)"}}>
        <div className="search-wrap" style={{flex:1,minWidth:180}}>
          <span className="search-icon"><DWIcon name="search" size={16} strokeWidth={2}/></span>
          <input className="search-inp" value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Buscar nombre, DNI, CUIT, dirección..."/>
        </div>
        <select className="inp" style={{width:"auto"}} value={filtroTipo} onChange={function(e){setFiltroTipo(e.target.value);}}>
          <option value="todos">Todos los tipos</option>
          {Object.entries(TIPOS).map(function(e){return <option key={e[0]} value={e[0]}>{e[1]}</option>;})}
        </select>
        <button type="button" className="btn btn-secondary btn-sm" onClick={function(){setFiltrosAbiertos(function(v){return !v;});}}>⚙ Filtros{Object.values(filtros).some(function(v){return v!==""&&v!=="todos";})?" · activos":""}</button>
        <div className="op-view-switch" title="Cambiar vista">
          <button type="button" className={modoVista==="tarjetas"?"active":""} onClick={function(){setModoVista("tarjetas");}} aria-label="Vista de tarjetas">▦</button>
          <button type="button" className={modoVista==="tabla"?"active":""} onClick={function(){setModoVista("tabla");}} aria-label="Vista de tabla">☷</button>
        </div>
      </div>
      {filtrosAbiertos&&<div className="op-filter-panel">
        <div className="op-filter-field"><label>Desde</label><input className="inp" type="date" value={filtros.desde} onChange={function(e){setFiltros(Object.assign({},filtros,{desde:e.target.value}));}}/></div>
        <div className="op-filter-field"><label>Hasta</label><input className="inp" type="date" value={filtros.hasta} onChange={function(e){setFiltros(Object.assign({},filtros,{hasta:e.target.value}));}}/></div>
        <div className="op-filter-field"><label>Agente a cargo</label><select className="inp" value={filtros.agente} onChange={function(e){setFiltros(Object.assign({},filtros,{agente:e.target.value}));}}><option value="todos">Todos</option>{Array.from(new Map(operaciones.filter(function(o){return o.broker_id;}).map(function(o){return [String(o.broker_id),o.broker_nombre||o.broker||o.broker_id];})).entries()).map(function(e){return <option key={e[0]} value={e[0]}>{e[1]}</option>;})}</select></div>
        <div className="op-filter-field"><label>Sucursal</label><select className="inp" value={filtros.sucursal} onChange={function(e){setFiltros(Object.assign({},filtros,{sucursal:e.target.value}));}}><option value="todos">Todas</option>{Array.from(new Set(operaciones.map(function(o){return o.sucursal||o.sucursal_nombre;}).filter(Boolean))).map(function(v){return <option key={v} value={v}>{v}</option>;})}</select></div>
        <div className="op-filter-field"><label>Monto mínimo</label><input className="inp" type="number" min="0" placeholder="Sin mínimo" value={filtros.montoMin} onChange={function(e){setFiltros(Object.assign({},filtros,{montoMin:e.target.value}));}}/></div>
        <div className="op-filter-field"><label>Monto máximo</label><input className="inp" type="number" min="0" placeholder="Sin máximo" value={filtros.montoMax} onChange={function(e){setFiltros(Object.assign({},filtros,{montoMax:e.target.value}));}}/></div>
        <div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end"}}><Btn v="ghost" s="sm" onClick={function(){setFiltros({desde:"",hasta:"",agente:"todos",montoMin:"",montoMax:"",sucursal:"todos"});}}>Limpiar filtros</Btn></div>
      </div>}
      {!perfil.nombre&&<div className="notice notice-gold" style={{marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}><span>Configurá el perfil de tu inmobiliaria para agregar logo en los PDFs.</span><Btn v="ghost" s="sm" onClick={onPerfil} style={{color:"var(--gold)",flexShrink:0}}>⚙ Configurar</Btn></div>}
      {modoVista==="tabla" ? (
        <div className="op-table-wrap">
          {filtered.length===0?<div style={{padding:44,textAlign:"center",color:"var(--dim)",fontSize:13}}>No hay operaciones en esta vista.</div>:<table className="op-table"><thead><tr><th>Estado</th><th>Operación</th><th>Partes</th><th>Monto</th><th>Fecha</th><th>Agente</th><th></th></tr></thead><tbody>{filtered.map(function(op){return <tr key={op.id}><td><span className={"op-status-badge "+(op.estado||"borrador")}>{ESTADOS[op.estado]||"Borrador"}</span></td><td><div style={{fontWeight:700}}>{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]||op.tipo}</div><div style={{fontSize:10,color:"var(--dim)",marginTop:2}}>{op.inmueble_direccion||"Sin dirección"}</div></td><td>{getName(op)}</td><td style={{fontWeight:700,color:"var(--gold)"}}>{getMonto(op)||"—"}</td><td>{new Date(op.created_at).toLocaleDateString("es-AR")}</td><td>{op.broker_nombre||op.broker||"—"}</td><td><Btn v="secondary" s="sm" onClick={function(){onViewDoc(op);}}>Abrir</Btn></td></tr>;})}</tbody></table>}
        </div>
      ) : (
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {filtered.length===0&&<div style={{padding:44,textAlign:"center",background:"var(--card)",border:"1px solid var(--border)",borderRadius:14}}><div style={{fontSize:38,marginBottom:10}}>📂</div><p style={{color:"var(--dim)",fontSize:13}}>{effectiveSearch?"Sin resultados para esa búsqueda.":"No hay operaciones en esta vista."}</p></div>}
        {filtered.map(function(op){
          const hijos=childrenMap[op.id]||[];
          if(hijos.length===0) return renderOpRow(op,false);
          const isOpen=!!openFolders[op.id];
          return (
            <div key={op.id} className="op-folder" style={{border:"1px solid var(--border)",borderRadius:16,padding:10,background:"linear-gradient(180deg,rgba(212,168,83,0.045),rgba(255,255,255,0.012))",boxShadow:"0 4px 18px rgba(0,0,0,.04)"}}>
              <div onClick={function(){setOpenFolders(function(s){return Object.assign({},s,{[op.id]:!s[op.id]});});}}
                style={{display:"flex",flexDirection:"column",gap:6,cursor:"pointer",marginBottom:isOpen?8:0}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                  <span style={{color:"var(--dim)",display:"inline-flex",flexShrink:0,marginTop:3,transition:"transform 0.15s",transform:isOpen?"rotate(90deg)":"none"}}><DWIcon name="chevronRight" size={11} strokeWidth={2}/></span>
                  <span style={{color:"var(--gold)",flexShrink:0,marginTop:1}}><DWIcon name="folder" size={14}/></span>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--text)",lineHeight:1.4,wordBreak:"break-word"}}>{getTituloCarpeta(op)}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",paddingLeft:22,marginTop:6}}>
                  <span className={"op-status-badge "+(op.estado||"borrador")}>{ESTADOS[op.estado]||"Borrador"}</span>
                  <span style={{fontSize:10.5,padding:"1px 7px",borderRadius:20,background:"var(--surface2)",color:"var(--dim)"}}>{hijos.length+1} doc{hijos.length+1===1?"":"s"}</span>
                  {(()=>{var pp=getProximoPasoOperacion(op,operaciones);return <span style={{fontSize:10.5,color:pp.tone,fontWeight:700}}>{pp.icon} {pp.texto}</span>;})()}
                  <Btn v="ghost" s="sm" onClick={function(e){e.stopPropagation();onViewDoc(op);}} style={{marginLeft:"auto"}}>Ficha</Btn>
                  {(op.tipo==="reserva"||op.tipo==="reserva_alquiler")&&
                    <Btn v="ghost" s="sm" onClick={function(e){e.stopPropagation();setAddDocFor(op);}}><DWIcon name="plus" size={11} strokeWidth={2.2}/> Documento</Btn>}
                </div>
              </div>
              {isOpen&&(<>
                {renderOpRow(op,false)}
                {hijos.map(function(h){return renderOpRow(h,true);})}
              </>)}
            </div>
          );
        })}
      </div>
      )}
      </>
      )}
      {/* Modal "Documentos vinculados": único punto de entrada para agregar
          Boleto/Comodato/Refuerzo (desde Reserva) o Contrato (desde Reserva
          de Locación), mostrando qué se hereda y qué falta completar antes
          de crear el documento. */}
      <Modal open={!!addDocFor} onClose={function(){setAddDocFor(null);}} title="Documentos de esta operación" wide={true}>
        {addDocFor&&(function(){
          var opts=opcionesDoc(addDocFor);
          var hijosAdd=operaciones.filter(function(o){return o.parent_id===addDocFor.id;});
          return (
            <div>
              <div style={{fontSize:12.5,color:"var(--dim)",marginBottom:16,lineHeight:1.5}}>
                Todos los documentos que generes acá quedan agrupados en la <b>carpeta de esta operación</b>, junto a {getName(addDocFor)}.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {opts.map(function(o){
                  var creado=hijosAdd.find(function(h){return h.tipo===o.tipo;});
                  return (
                    <div key={o.tipo} style={{border:"1px solid "+(creado?"var(--border)":"rgba(212,168,83,0.25)"),borderRadius:12,padding:14,background:creado?"transparent":"rgba(212,168,83,0.04)"}}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                            <span style={{fontSize:16}}>{o.icon}</span>
                            <span style={{fontSize:13.5,fontWeight:600,color:"var(--text)"}}>{o.label}</span>
                            {creado&&<span className="badge badge-activo" style={{fontSize:10}}>✓ Ya creado</span>}
                          </div>
                          <div style={{fontSize:12,color:"var(--dim)",marginBottom:6}}>{o.desc}</div>
                          {!creado&&(
                            <div style={{fontSize:11.5,lineHeight:1.6}}>
                              <div style={{color:"var(--muted)"}}><b style={{color:"var(--green)"}}>Se copia:</b> {o.hereda}</div>
                              <div style={{color:"var(--muted)"}}><b style={{color:"var(--gold)"}}>A completar:</b> {o.pide}</div>
                            </div>
                          )}
                        </div>
                        <Btn v={creado?"secondary":"primary"} s="sm" onClick={function(){
                          if(creado){ setAddDocFor(null); onEdit(creado); }
                          else { setAddDocFor(null); o.accion(addDocFor); }
                        }}>
                          {creado?"Abrir":"Crear"}
                        </Btn>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </Modal>
      <Modal open={!!historialOp} onClose={function(){setHistorialOp(null);}} title="Historial de acciones" wide={true}>
        {historialOp&&(()=>{
          var hs=Array.isArray(historialOp.historial_operacion)?historialOp.historial_operacion.slice().reverse():[];
          return <div>
            <div style={{fontSize:12.5,color:"var(--dim)",marginBottom:14,lineHeight:1.5}}>Registro de cambios de esta operación. Se guarda automáticamente cuando se crea, edita o cambia su estado.</div>
            {hs.length===0?<div className="card" style={{padding:24,textAlign:"center",color:"var(--dim)",fontSize:12}}>Todavía no hay movimientos registrados.</div>:<div style={{display:"flex",flexDirection:"column",gap:7}}>{hs.map(function(h,i){return <div key={h.id||i} style={{display:"grid",gridTemplateColumns:"145px 1fr",gap:10,padding:"10px 11px",border:"1px solid var(--border)",borderRadius:10,background:"rgba(255,255,255,.015)"}}><div><div style={{fontSize:10.5,color:"var(--dim)"}}>{h.ts?new Date(h.ts).toLocaleString("es-AR"):"—"}</div><div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>{h.actorNombre||"Usuario"}{h.actorRol?" · "+h.actorRol:""}</div></div><div><div style={{fontSize:12.5,fontWeight:700,color:"var(--text)"}}>{h.accion||"Actualización"}</div>{h.detalle&&<div style={{fontSize:11.5,color:"var(--dim)",marginTop:3}}>{h.detalle}</div>}</div></div>;})}</div>}
          </div>;
        })()}
      </Modal>
    </div>
  );

}

// ── PAPELERA VIEW ──────────────────────────────────────────────────────────────
// Operaciones eliminadas: quedan acá 30 días (recuperables) antes de purgarse
// automáticamente. También se pueden restaurar o eliminar en forma definitiva.
function PapeleraView({papelera,onRestore,onDeletePermanente,onVaciar,confirmVaciar,setConfirmVaciar,embedded}){
  const [confirmDelId,setConfirmDelId]=useState(null);
  function diasRestantes(deletedAt){
    var venc=new Date(deletedAt).getTime()+PAPELERA_DIAS*24*60*60*1000;
    var dias=Math.ceil((venc-Date.now())/(24*60*60*1000));
    return Math.max(0,dias);
  }
  function getName(op){if(op.tipo==="alquiler"||op.tipo==="reserva_alquiler")return nombreConSufijo(op,"locatario","Locatario")+" ← "+nombreConSufijo(op,"locador","Locador");return nombreConSufijo(op,"comprador","Comprador")+" ← "+nombreConSufijo(op,"vendedor","Vendedor");}
  return(
    <div>
      {!embedded&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontFamily:"DM Serif Display,serif",fontSize:24,color:"var(--text)",margin:0}}>🗑 Papelera</h2>
          <p style={{fontSize:12.5,color:"var(--muted)",marginTop:4}}>Las operaciones eliminadas se conservan 30 días y después se borran solas. Podés restaurarlas antes de eso.</p>
        </div>
        {papelera.length>0&&<Btn v="danger" s="sm" onClick={function(){setConfirmVaciar(true);}}>Vaciar papelera</Btn>}
      </div>}
      {embedded&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <p style={{fontSize:12.5,color:"var(--muted)",margin:0}}>Las operaciones eliminadas se conservan 30 días y después se borran solas. Podés restaurarlas antes de eso.</p>
        {papelera.length>0&&<Btn v="danger" s="sm" onClick={function(){setConfirmVaciar(true);}}>Vaciar papelera</Btn>}
      </div>}
      {papelera.length===0&&(
        <div className="op-card" style={{textAlign:"center",padding:"40px 20px",color:"var(--dim)"}}>
          <div style={{fontSize:32,marginBottom:8}}>🗑</div>
          La papelera está vacía.
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {papelera.map(function(op){
          var dias=diasRestantes(op.deleted_at);
          return(
            <div key={op.id} className="op-card fade-up">
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:5}}>
                    <span className="badge badge-tipo">{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]}</span>
                    <span style={{fontSize:11,color:"var(--dim)"}}>Eliminada el {new Date(op.deleted_at).toLocaleDateString("es-AR")}</span>
                    <span style={{fontSize:11,padding:"1px 8px",borderRadius:20,background:dias<=5?"rgba(248,113,113,0.12)":"rgba(255,255,255,0.06)",color:dias<=5?"var(--red)":"var(--dim)"}}>{dias>0?dias+" días restantes":"Se elimina hoy"}</span>
                  </div>
                  <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>{getName(op)}</div>
                  <div style={{fontSize:12,color:"var(--dim)"}}>{op.inmueble_direccion?"📍 "+op.inmueble_direccion:"Sin dirección"}</div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <Btn v="secondary" s="sm" onClick={function(){onRestore(op.id);}}>↩ Restaurar</Btn>
                  <Btn v="danger" s="sm" onClick={function(){setConfirmDelId(op.id);}}>Eliminar def.</Btn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ConfirmModal
        open={!!confirmDelId}
        title="Eliminar definitivamente"
        message="Esta operación se borrará para siempre y no se podrá recuperar. ¿Confirmás?"
        confirmLabel="Eliminar para siempre"
        danger={true}
        onCancel={function(){setConfirmDelId(null);}}
        onConfirm={function(){onDeletePermanente(confirmDelId);setConfirmDelId(null);}}
      />
      <ConfirmModal
        open={!!confirmVaciar}
        title="Vaciar papelera"
        message={"Se eliminarán definitivamente las "+papelera.length+" operaciones de la papelera. Esta acción no se puede deshacer."}
        confirmLabel="Vaciar papelera"
        danger={true}
        onCancel={function(){setConfirmVaciar(false);}}
        onConfirm={onVaciar}
      />
    </div>
  );
}

// ── CONFIGURACION VIEW ─────────────────────────────────────────────────────────
const ROLES_DEF = {
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


function CuerpoPlantillaPanel({perfil,tipo,puedeEditar,onChange}) {
  const [draft,setDraft]=useState(function(){return getBodyBlocksConfig(perfil,tipo);});
  const [editId,setEditId]=useState(null);
  const [status,setStatus]=useState(null);
  useEffect(function(){setDraft(getBodyBlocksConfig(perfil,tipo));setEditId(null);setStatus(null);},[tipo,perfil&&perfil.plantillas&&perfil.plantillas[tipo]&&perfil.plantillas[tipo].body_blocks]);
  function persist(next){
    if(!puedeEditar)return;
    setDraft(next);setStatus("saving");
    var mapa=Object.assign({},perfil.plantillas||{});
    var actual=Object.assign({},mapa[tipo]||{}, {body_blocks:next.map(function(b,i){return normalizarBodyBlock(Object.assign({},b,{orden:i+1}),i);})});
    var nextPerfil=Object.assign({},perfil,{plantillas:Object.assign({},mapa,{[tipo]:actual})});
    Promise.resolve(onChange(nextPerfil)).then(function(res){if(res&&res.error){setStatus("error");return;}setStatus("saved");setTimeout(function(){setStatus(null);},2500);}).catch(function(){setStatus("error");});
  }
  function update(id,changes){persist(draft.map(function(b){return b.id===id?Object.assign({},b,changes):b;}));}
  function move(idx,dir){var to=dir==="up"?idx-1:idx+1;if(to<0||to>=draft.length)return;var arr=draft.slice(),x=arr[idx];arr[idx]=arr[to];arr[to]=x;persist(arr);}
  function addBlock(){var n=draft.length+1;var b=normalizarBodyBlock({id:tipo+".custom."+Date.now(),titulo:"NUEVO BLOQUE",contenido:"Escribí acá la redacción de este bloque. Podés insertar variables automáticas desde el listado inferior."},n-1);persist(draft.concat([b]));setEditId(b.id);}
  function removeBlock(id){var b=draft.find(function(x){return x.id===id;});if(!b)return;if(!window.confirm("¿Eliminar el bloque “"+(b.titulo||"sin título")+"” de esta plantilla?"))return;persist(draft.filter(function(x){return x.id!==id;}));}
  function reset(){if(!window.confirm("¿Restaurar la base estándar de "+(TIPOS[tipo]||tipo)+"? Se reemplazarán los bloques personalizados de este modelo."))return;persist(getDefaultBodyBlocks(tipo));}
  var tokens=[
    ["comprador_nombre","Comprador"],["comprador_dni","DNI/CUIT comprador"],["vendedor_nombre","Vendedor"],["vendedor_dni","DNI/CUIT vendedor"],["locador_nombre","Locador"],["locatario_nombre","Locatario / Inquilino"],
    ["locador_nombre","Locador"],["locatario_nombre","Locatario / Inquilino"],["inmueble_direccion","Dirección"],["inmueble_partido","Partido / localidad"],["inmueble_provincia","Provincia"],
    ["precio_letras","Precio en letras"],["moneda_txt","Moneda"],["anticipo_letras","Anticipo en letras"],["saldo_letras","Saldo en letras"],["fecha_posesion","Fecha de posesión"],
    ["comision_porcentaje","Comisión"],["comision_vendedor","Comisión vendedor"],["comision_comprador","Comisión comprador"],["alquiler_monto_inicial","Canon inicial"],["alquiler_inicio","Inicio"],["alquiler_fin","Vencimiento"],
    ["res_alq_monto_reserva","Reserva alquiler"],["res_alq_monto_mensual","Valor del alquiler mensual"],["res_alq_inicio_estimado","Inicio estimado"],["devolucion_motivo","Motivo devolución"],["comodato_plazo","Plazo comodato"],["comodato_uso","Destino comodato"],
    ["escribania_clausula","Escribanía"],["exclusividad_vigencia","Vigencia"],["exclusividad_modalidad_texto","Modalidad"],["alquiler_canon_clause","Canon y actualización"],["alquiler_deposito_desc","Depósito"],["alquiler_garantia_detalle","Garantía"],["alquiler_plazo_texto","Plazo"],["devolucion_motivo_texto","Motivo devolución"],["refuerzo_trayectoria","Antecedentes"],["reserva_alquiler_reserva","Reserva alquiler"],["reserva_alquiler_canon","Valor del alquiler mensual"]
  ];
  function insertToken(token){
    if(editId==null)return;
    var arr=draft.map(function(b){if(b.id!==editId)return b;return Object.assign({},b,{contenido:String(b.contenido||"")+(b.contenido?" ":"")+"{{"+token+"}}"});});
    persist(arr);
  }
  return <div>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:12}}>
      <div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>✍️</span><div style={{fontFamily:"DM Serif Display,serif",fontSize:15,color:"var(--text)"}}>Cuerpo editable · {TIPOS[tipo]||tipo}</div></div><div style={{fontSize:10.7,color:"var(--dim)",lineHeight:1.5,marginTop:3}}>Esta es la base estándar. Podés adaptarla, mover bloques, agregar otros y reutilizar los datos de Operaciones mediante variables. El documento conserva el modelo oficial hasta que guardes una versión personalizada.</div></div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{puedeEditar&&<><Btn s="sm" v="ghost" onClick={reset}>Restaurar base</Btn><Btn s="sm" onClick={addBlock}>＋ Agregar bloque</Btn></>}</div>
    </div>
    {status&&<div style={{marginBottom:9,fontSize:10.5,color:status==="error"?"var(--red)":status==="saved"?"var(--green)":"var(--gold)"}}>{status==="saving"?"Guardando cambios…":status==="saved"?"Cambios guardados ✓":"No se pudo guardar el cuerpo."}</div>}
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {draft.map(function(b,idx){var editing=editId===b.id;return <div key={b.id} style={{border:"1px solid "+(editing?"rgba(212,168,83,.40)":"var(--border2)"),borderRadius:12,padding:11,background:editing?"rgba(212,168,83,.035)":"var(--card)"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:9}}>
          <div style={{width:28,height:28,borderRadius:8,background:"rgba(212,168,83,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"var(--gold)",flexShrink:0}}>{idx+1}</div>
          <div style={{flex:1,minWidth:0}}>
            {editing ? <div style={{display:"flex",flexDirection:"column",gap:7}}><input className="inp" value={b.titulo} disabled={!puedeEditar} onChange={function(e){setDraft(draft.map(function(x){return x.id===b.id?Object.assign({},x,{titulo:e.target.value}):x;}));}}/><textarea className="inp" style={{minHeight:120,resize:"vertical",lineHeight:1.5}} value={b.contenido} disabled={!puedeEditar} onChange={function(e){setDraft(draft.map(function(x){return x.id===b.id?Object.assign({},x,{contenido:e.target.value}):x;}));}}/><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{tokens.map(function(t){return <button key={t[0]} type="button" onClick={function(){insertToken(t[0]);}} style={{padding:"4px 7px",borderRadius:7,border:"1px solid rgba(89,199,243,.28)",background:"rgba(89,199,243,.06)",color:"#59c7f3",fontSize:9.5,cursor:"pointer"}}>{t[1]}</button>;})}</div><div style={{fontSize:9.8,color:"var(--dim)"}}>Las variables entre {{ }} se completan automáticamente desde la operación. La redacción queda guardada como plantilla.</div><div style={{display:"flex",justifyContent:"flex-end",gap:6}}><Btn s="sm" v="ghost" onClick={function(){setDraft(getBodyBlocksConfig(perfil,tipo));setEditId(null);}}>Cancelar</Btn><Btn s="sm" v="success" onClick={function(){persist(draft);setEditId(null);}}>Guardar bloque</Btn></div></div> : <><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:7}}><div style={{fontSize:12.2,fontWeight:700,color:"var(--text)"}}>{b.titulo||"Bloque sin título"}</div><div style={{display:"flex",gap:4,flexShrink:0}}><button type="button" title="Subir" onClick={function(){move(idx,"up");}} disabled={!puedeEditar||idx===0} style={{border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",borderRadius:6,padding:"3px 6px",cursor:"pointer"}}>↑</button><button type="button" title="Bajar" onClick={function(){move(idx,"down");}} disabled={!puedeEditar||idx===draft.length-1} style={{border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",borderRadius:6,padding:"3px 6px",cursor:"pointer"}}>↓</button>{puedeEditar&&<button type="button" title="Editar" onClick={function(){setEditId(b.id);}} style={{border:"1px solid rgba(212,168,83,.25)",background:"rgba(212,168,83,.06)",color:"var(--gold)",borderRadius:6,padding:"3px 7px",cursor:"pointer"}}>Editar</button>}{puedeEditar&&<button type="button" title="Eliminar" onClick={function(){removeBlock(b.id);}} style={{border:"1px solid rgba(248,113,113,.2)",background:"transparent",color:"var(--red)",borderRadius:6,padding:"3px 7px",cursor:"pointer"}}>×</button>}</div></div><div style={{fontSize:10.8,color:"var(--muted)",lineHeight:1.5,marginTop:4,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{mostrarTokensDocWorks(b.contenido)}</div></>}
          </div>
        </div>
      </div>;})}
      {draft.length===0&&<div style={{padding:18,textAlign:"center",border:"1px dashed var(--border)",borderRadius:10,color:"var(--dim)",fontSize:11}}>No hay bloques. Agregá uno para comenzar.</div>}
    </div>
    <div style={{marginTop:12,padding:10,borderRadius:10,background:"rgba(89,199,243,.035)",border:"1px solid rgba(89,199,243,.14)"}}><div style={{fontSize:10.2,fontWeight:750,color:"#59c7f3",marginBottom:5}}>VARIABLES AUTOMÁTICAS</div><div style={{fontSize:9.8,color:"var(--dim)",lineHeight:1.5}}>Usá los botones dentro de cada bloque para insertar campos que vienen de Operaciones. El usuario edita la redacción; DocWorks completa los datos al generar el documento.</div></div>
  </div>;
}

function ConfiguracionView({ perfil, onChange, currentUserId, darkMode, onToggleDark, equipo, equipoSupabase, operaciones, clausulas, onAddClausula, onEditClausula, onDeleteClausula, onMoveClausula, onDuplicateClausula, bloquesReserva, onUpdateBloqueReserva, onMoveBloqueReserva, bloquesError, bloquesLoading, papelera, auditLog, auditoriaSupabase, onExportarRespaldo, onImportarRespaldo, onVaciarAuditoria, puedeInstalar, onInstalar }) {
  const [tab, setTab] = useState("cuenta");
  const [showInvite, setShowInvite] = useState(false);
  const [editM, setEditM] = useState(null);
  const [form, setForm] = useState({ email:"", rol:"broker", nivel:"junior" });
  const [inviteError, setInviteError] = useState(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const fileRef = useRef();
  const [localPerfil, setLocalPerfil] = useState(perfil);
  const [cuentaSubtab, setCuentaSubtab] = useState("resumen");
  const [histBroker, setHistBroker] = useState("todos");
  const [confirmDelMiembro, setConfirmDelMiembro] = useState(null);
  const [histEstado, setHistEstado] = useState("todos");
  const [tipoDocSel, setTipoDocSel] = useState("reserva");
  const [plantillaForm, setPlantillaForm] = useState(null); // null | {editId, titulo, categoria, contenido, tipos}
  const [encabezadoEditing, setEncabezadoEditing] = useState(false);
  const [encabezadoDraft, setEncabezadoDraft] = useState("");
  const [perfilSaveStatus,setPerfilSaveStatus] = useState(null);
  const [dragClausulaId,setDragClausulaId] = useState(null);
  const [plantillaSubtab,setPlantillaSubtab] = useState("clausulas");
  const [plantillaVista,setPlantillaVista] = useState("modelos");
  const [clausulaOpenId,setClausulaOpenId] = useState(null);
  const [confirmLockDefaults,setConfirmLockDefaults] = useState(false);
  const [configuracionPlantillaAbierta,setConfiguracionPlantillaAbierta] = useState(false);
  const [mostrarPreviewConfiguracion,setMostrarPreviewConfiguracion] = useState(false);
  const [mostrarBloquesConfiguracion,setMostrarBloquesConfiguracion] = useState(false);
  const [configUnsavedTarget,setConfigUnsavedTarget] = useState(null);
  const [configUnsavedView,setConfigUnsavedView] = useState(null);
  const [showConfigUnsaved,setShowConfigUnsaved] = useState(false);

  useEffect(function(){ setLocalPerfil(perfil); }, [perfil]);

  function handleLogo(e){var file=e.target.files[0];if(!file)return;var r=new FileReader();r.onload=function(ev){setLocalPerfil(function(p){return Object.assign({},p,{logoDataUrl:ev.target.result});});};r.readAsDataURL(file);}
  function handleFotoBroker(miembro,e){
    var file=e.target.files&&e.target.files[0]; if(!file) return;
    if(file.size>5*1024*1024){dwNotify("error","La foto es demasiado grande. Elegí una imagen de hasta 5 MB.");return;}
    var r=new FileReader();
    r.onload=function(ev){
      var img=new Image();
      img.onload=function(){
        var max=420, scale=Math.min(1,max/Math.max(img.width,img.height));
        var canvas=document.createElement("canvas"); canvas.width=Math.max(1,Math.round(img.width*scale)); canvas.height=Math.max(1,Math.round(img.height*scale));
        var c=canvas.getContext("2d"); c.drawImage(img,0,0,canvas.width,canvas.height);
        var data=canvas.toDataURL("image/jpeg",0.82);
        setLocalPerfil(function(p){var fotos=Object.assign({},p.broker_fotos||{});fotos[miembro.id]=data;var next=Object.assign({},p,{broker_fotos:fotos});persistirPerfil(next);return next;});
      };
      img.src=ev.target.result;
    };
    r.readAsDataURL(file);
    e.target.value="";
  }
  function quitarFotoBroker(miembro){
    setLocalPerfil(function(p){var fotos=Object.assign({},p.broker_fotos||{});delete fotos[miembro.id];return Object.assign({},p,{broker_fotos:fotos});});
  }
  function fP(k){return function(e){setLocalPerfil(function(p){return Object.assign({},p,{[k]:e.target.value});});};}
  function persistirPerfil(next){
    setPerfilSaveStatus("saving");
    var resultado;
    try { resultado=onChange(next); } catch(e) { resultado={error:e}; }
    return Promise.resolve(resultado).then(function(res){
      if(res&&res.error){
        setPerfilSaveStatus("error");
        return {error:res.error};
      }
      setPerfilSaveStatus("saved");
      setTimeout(function(){ setPerfilSaveStatus(null); },3000);
      return {ok:true};
    }).catch(function(err){
      setPerfilSaveStatus("error");
      return {error:err};
    });
  }
  function savePerfil(){ return persistirPerfil(localPerfil); }
  function aspectoTieneCambios(){
    try { return JSON.stringify(localPerfil||{})!==JSON.stringify(perfil||{}); }
    catch(e) { return true; }
  }
  function cancelarEdicionEncabezado(){
    setEncabezadoDraft("");
    setEncabezadoEditing(false);
  }
  function descartarCambiosAspecto(){
    setLocalPerfil(perfil);
    cancelarEdicionEncabezado();
    setConfigUnsavedTarget(null);
    setConfigUnsavedView(null);
    setShowConfigUnsaved(false);
    setPerfilSaveStatus(null);
  }
  function continuarConfiguracionSinCambios(){
    var nextTab=configUnsavedTarget;
    var nextView=configUnsavedView;
    setConfigUnsavedTarget(null);
    setConfigUnsavedView(null);
    setShowConfigUnsaved(false);
    if(nextTab){ setTab(nextTab); }
    if(nextView){ setPlantillaVista(nextView); }
  }
  function guardarCambiosYContinuar(){
    savePerfil().then(function(res){
      if(res&&res.error) return;
      continuarConfiguracionSinCambios();
    });
  }
  function pedirCambioTab(nextTab){
    if(nextTab===tab) return;
    if(plantillaVista==="aspecto" && aspectoTieneCambios()){
      setConfigUnsavedTarget(nextTab);
      setConfigUnsavedView(null);
      setShowConfigUnsaved(true);
      return;
    }
    setTab(nextTab);
  }
  function pedirCambioVista(nextView){
    if(nextView===plantillaVista) return;
    if(plantillaVista==="aspecto" && aspectoTieneCambios()){
      setConfigUnsavedTarget(null);
      setConfigUnsavedView(nextView);
      setShowConfigUnsaved(true);
      return;
    }
    setPlantillaVista(nextView);
  }

  function openInvite(m){
    setInviteError(null);
    if(m){ setEditM(m); setForm({email:m.email,rol:m.rol,nivel:m.perfil_permisos&&m.perfil_permisos!=="custom"?m.perfil_permisos:"junior"}); }
    else { setEditM(null); setForm({email:"",rol:"broker",nivel:"junior"}); }
    setShowInvite(true);
  }
  function handleSaveM(){
    if(!form.email)return;
    setInviteError(null); setInviteBusy(true);
    var accion = editM
      ? equipoSupabase.editarRolNivel(editM.id, form.rol, form.nivel)
      : equipoSupabase.invitar(form.email.trim().toLowerCase(), form.rol, form.nivel);
    accion.then(function(res){
      setInviteBusy(false);
      if (res.error) { setInviteError(traducirError(res.error.message)||"No se pudo completar la operación."); return; }
      setShowInvite(false);
    });
  }

  var dueno = equipo.find(function(m){return m.rol==="dueno";});
  var opsRoots = operaciones.filter(function(o){return !o.parent_id || !operaciones.some(function(x){return x.id===o.parent_id;});});
  var opsTotal = opsRoots.length;
  var opsActivas = opsRoots.filter(function(o){return operaciones.some(function(x){return (x.id===o.id || x.parent_id===o.id) && x.estado==="activo";});}).length;
  var splitMode = localPerfil.broker_split_mode === "individual" ? "individual" : "uniforme";
  var splitDefault = Math.max(0,Math.min(100,parseFloat(localPerfil.broker_split_pct==null?50:localPerfil.broker_split_pct)||0));
  var brokerSplits = localPerfil.broker_splits && typeof localPerfil.broker_splits === "object" ? localPerfil.broker_splits : {};
  function splitDeMiembro(m){
    var v=brokerSplits[m.id];
    return Math.max(0,Math.min(100,parseFloat(v==null?splitDefault:v)||0));
  }
  function puedeEditarSplit(m){ return !!equipoSupabase.esAdmin || (currentUserId && m.id===currentUserId); }
  function guardarSplitMiembro(m,valor){
    var n=Math.max(0,Math.min(100,parseFloat(valor)||0));
    var nextSplits=Object.assign({},brokerSplits); nextSplits[m.id]=n;
    var next=Object.assign({},localPerfil,{broker_splits:nextSplits});
    setLocalPerfil(next);
    return onChange(next);
  }

  var puedeVerFacturacion = !!perfil && (perfil.rol==="dueno" || perfil.rol==="admin");
  var TABS_CFG = [
    {id:"cuenta",    label:"Mi cuenta",           icon:"👤"},
    {id:"equipo",    label:"Equipo",               icon:"👥"},
    ...(puedeVerFacturacion ? [{id:"facturacion", label:"Facturación", icon:"💳"}] : []),
    {id:"historial", label:"Historial del equipo", icon:"📊"},
    {id:"plantillas",label:"Plantillas",           icon:"📝"},
    {id:"auditoria", label:"Auditoría",            icon:"🕵️"},
    {id:"backup",    label:"Respaldo",               icon:"☁️"},
  ];

  // ── Respaldo (exportar/importar JSON) ──
  var backupFileRef = useRef();
  const [backupMsg,setRespaldoMsg] = useState(null); // {ok,text}
  const [importModo,setImportModo] = useState("fusionar"); // "fusionar" | "reemplazar"
  const [confirmImport,setConfirmImport] = useState(null); // texto del archivo pendiente de confirmar
  function handleRespaldoFile(e){
    var file=e.target.files[0]; if(!file) return;
    var reader=new FileReader();
    reader.onload=function(ev){ setConfirmImport(ev.target.result); };
    reader.onerror=function(){ setRespaldoMsg({ok:false,text:"No se pudo leer el archivo."}); };
    reader.readAsText(file);
    e.target.value = "";
  }
  function confirmarImportacion(){
    var res = onImportarRespaldo(confirmImport, importModo);
    setConfirmImport(null);
    if (res.ok) setRespaldoMsg({ok:true,text: importModo==="reemplazar" ? "Respaldo importado: se reemplazaron los datos actuales." : "Respaldo importado: se agregó lo nuevo sin borrar lo existente."});
    else setRespaldoMsg({ok:false,text: res.error||"No se pudo importar el archivo."});
  }

  // Datos compartidos entre la vista de Aspecto y el subtab de Plantillas.
  // Las variables compartidas se declaran en este nivel para que Aspecto del documento
  // y Plantillas utilicen la misma fuente sin referencias fuera de alcance.
  var puedeEditarPlantillas = !!perfil && (perfil.rol==="dueno" || perfil.rol==="admin");
  var customMapPreview = (localPerfil&&localPerfil.encabezados_custom)||{};
  var customTextoPreview = customMapPreview[tipoDocSel]||"";

  function CuentaDocumentoPreview(){
    var estilo=localPerfil.plantillaEstilo||"corporativo";
    var prim=localPerfil.colorPrimario||"#142a4d";
    var sec=localPerfil.colorSecundario||"#c9a227";
    var logoScale=localPerfil.logoScale||100;
    var logoWidth=Math.max(54,Math.min(190,113*(logoScale/100)));
    var logoMaxH=Math.max(28,Math.min(96,57*(logoScale/100)));
    var headerBg=estilo==="corporativo"?prim:estilo==="minimalista"?prim+"18":"#ffffff";
    var headerColor=estilo==="corporativo"?"#ffffff":prim;
    var serif=estilo==="clasico"?"Georgia,serif":"Arial,Helvetica,sans-serif";
    var logoAlign=localPerfil.logoPosicion||"derecha";
    var showName=localPerfil.encabezado_nombre!==false;
    var showMat=localPerfil.encabezado_matricula!==false;
    var showWeb=localPerfil.encabezado_web!==false;
    var showLocation=localPerfil.ubicacion_inmobiliaria_activa===true && !!localPerfil.direccion;
    var locationInHeader=showLocation && (localPerfil.ubicacion_inmobiliaria_posicion||"pie")==="encabezado";
    var locationInFooter=showLocation && !locationInHeader;
    var customText=customTextoPreview;
    return <div className="cuenta-doc-preview-wrap">
      <div className="cuenta-doc-preview-label"><span>Vista previa · primera hoja</span><span style={{color:"var(--gold)"}}>Los cambios se reflejan en tiempo real</span></div>
      <div className="cuenta-doc-page" style={{fontFamily:serif}}>
        {localPerfil.logo_encabezado_activo!==false&&localPerfil.logoDataUrl&&<div className="cuenta-doc-logo-row" style={{display:"flex",justifyContent:logoAlign==="izquierda"?"flex-start":logoAlign==="centro"?"center":"flex-end"}}><img src={localPerfil.logoDataUrl} style={{display:"block",maxWidth:logoWidth,maxHeight:logoMaxH,width:"auto",height:"auto",objectFit:"contain"}} alt="Logo"/></div>}
        <div className="cuenta-doc-header" style={{background:headerBg,borderBottom:estilo==="clasico"?"2px solid #1a1a1a":"none"}}>
          {showName&&<div style={{fontSize:14,fontWeight:700,color:headerColor,letterSpacing:".02em",textAlign:estilo==="clasico"?"center":"left",overflowWrap:"anywhere"}}>{(localPerfil.nombre||"TU INMOBILIARIA").toUpperCase()}{showMat&&localPerfil.matricula?" — Matrícula: "+localPerfil.matricula:""}</div>}
          {!showName&&showMat&&localPerfil.matricula&&<div style={{fontSize:12,fontWeight:700,color:headerColor,textAlign:estilo==="clasico"?"center":"left"}}>Matrícula: {localPerfil.matricula}</div>}
          {showWeb&&localPerfil.web&&<div style={{fontSize:9.5,color:estilo==="corporativo"?"#ffffffaa":"#64748b",marginTop:3,textAlign:estilo==="clasico"?"center":"left",overflowWrap:"anywhere"}}>{localPerfil.web}</div>}
          {locationInHeader&&<div style={{fontSize:9.2,color:estilo==="corporativo"?"#ffffffcc":"#64748b",marginTop:3,textAlign:estilo==="clasico"?"center":"left",overflowWrap:"anywhere"}}>Ubicación: {localPerfil.direccion}</div>}
        </div>
        <div className="cuenta-doc-body">
          <div style={{width:"58%",height:2,background:estilo==="clasico"?"#1a1a1a":sec,marginBottom:16}}/>
          <div style={{fontSize:14,fontWeight:700,color:estilo==="clasico"?"#1a1a1a":prim,textAlign:"center",marginBottom:14}}>BOLETO DE COMPRAVENTA</div>
          {customText&&<div style={{padding:"9px 10px",marginBottom:14,borderRadius:6,background:"#f7f8fa",border:"1px solid #e1e5ea",fontSize:9.4,color:"#475569",lineHeight:1.55,whiteSpace:"pre-wrap"}}>{customText}</div>}
          <div style={{fontSize:10.5,color:"#334155",lineHeight:1.65}}><b style={{color:estilo==="clasico"?"#1a1a1a":prim}}>CLÁUSULA PRIMERA — OBJETO:</b> El vendedor transfiere al comprador el inmueble sito en... Este texto representa visualmente el comienzo del documento real.</div>
          <div style={{marginTop:18,fontSize:10.5,color:"#334155",lineHeight:1.65}}>Esta primera hoja es una referencia visual. El PDF y Word definitivos utilizarán las mismas preferencias de identidad, encabezado, logo y pie de página guardadas por la inmobiliaria.</div>
        </div>
        <div className="cuenta-doc-footer">
          <div className="cuenta-doc-footer-line"/>
          <div style={{position:"relative",minHeight:62,marginTop:5}}>
            {locationInFooter&&<div style={{position:"absolute",top:0,left:0,right:0,textAlign:"center",fontSize:8.7,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Ubicación: {localPerfil.direccion}</div>}
            {localPerfil.pie_pagina_logo_debajo&&localPerfil.logoDataUrl&&<div style={{position:"absolute",top:locationInFooter?18:0,left:localPerfil.pie_pagina_logo_posicion==="izquierda"?0:localPerfil.pie_pagina_logo_posicion==="derecha"?"auto":"50%",right:localPerfil.pie_pagina_logo_posicion==="derecha"?0:"auto",transform:localPerfil.pie_pagina_logo_posicion==="centro"?"translateX(-50%)":"none"}}><img src={localPerfil.logoDataUrl} style={{height:Math.max(12,Math.min(24,14*(localPerfil.pie_pagina_logo_scale||100)/100)),width:"auto",objectFit:"contain"}} alt="Logo pie"/></div>}
            {localPerfil.pie_pagina_leyenda_activa!==false&&localPerfil.pie_pagina_texto&&<div style={{position:"absolute",top:(localPerfil.pie_pagina_logo_debajo&&localPerfil.logoDataUrl)?(locationInFooter?42:22):(locationInFooter?20:4),left:"50%",transform:"translateX(-50%)",width:"76%",textAlign:"center",fontSize:8.5,color:"var(--dim)",fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{localPerfil.pie_pagina_texto}</div>}
            {localPerfil.pie_pagina_numero_activo!==false&&<div style={{position:"absolute",top:localPerfil.pie_pagina_logo_debajo&&localPerfil.logoDataUrl?42:(locationInFooter?20:4),left:localPerfil.pie_pagina_numero_posicion==="izquierda"?0:localPerfil.pie_pagina_numero_posicion==="derecha"?"auto":"50%",right:localPerfil.pie_pagina_numero_posicion==="derecha"?0:"auto",transform:localPerfil.pie_pagina_numero_posicion==="centro"?"translateX(-50%)":"none",fontSize:9,color:"var(--dim)"}}>Página 1</div>}
          </div>
        </div>
      </div>
    </div>;
  }

  // ── Auditoría: filtros ──
  const [auditQuery,setAuditQuery] = useState("");
  const [auditAccion,setAuditAccion] = useState("todas");
  const [auditEntidad,setAuditEntidad] = useState("todas");
  const [auditExpandida,setAuditExpandida] = useState(null);

  return (
    <div>
      <div className="section-header">
        <div><div className="section-title">Configuración</div><div className="section-sub">Preferencias, perfil y equipo de trabajo</div></div>
      </div>

      {/* Tab bar */}
      <div className="settings-tabs" style={{display:"flex",gap:6,marginBottom:24,borderBottom:"1px solid var(--border)",paddingBottom:0,overflowX:"auto",overflowY:"hidden",WebkitOverflowScrolling:"touch",flexWrap:"nowrap",minWidth:0,touchAction:"pan-x"}}>
        {TABS_CFG.map(function(t){
          var active=tab===t.id;
          return(
            <button key={t.id} onClick={function(){pedirCambioTab(t.id);}} style={{
              padding:"8px 12px",borderRadius:"8px 8px 0 0",border:"none",background:active?"var(--card)":"transparent",
              color:active?"var(--gold)":"var(--muted)",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:active?600:400,
              cursor:"pointer",borderBottom:active?"2px solid var(--gold)":"2px solid transparent",marginBottom:-1,
              display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",flexShrink:0,whiteSpace:"nowrap",
            }}>{t.icon} {t.label}</button>
          );
        })}
      </div>

      {/* ── TAB: MI CUENTA (DUEÑO) ── */}
      {tab==="cuenta"&&(
        <div style={{width:"100%",maxWidth:"none",margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:10,flexWrap:"wrap"}}><div><div style={{fontSize:11,fontWeight:750,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".10em"}}>Panel de la inmobiliaria</div><div style={{fontSize:10.5,color:"var(--dim)",marginTop:3}}>Identidad, actividad y equipo en una sola vista.</div></div></div>
          <div className="card cuenta-profile-card" style={{padding:0,overflow:"hidden",borderRadius:18}}>
            <div style={{padding:"18px 22px 16px",borderBottom:"1px solid var(--border)",background:"linear-gradient(180deg,rgba(212,168,83,.075),rgba(212,168,83,.015))"}}>
              <div className="cuenta-dashboard-head">
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>
                    <div style={{fontSize:18,fontFamily:"DM Serif Display,serif",color:"var(--text)",lineHeight:1.15}}>Información de la inmobiliaria</div>
                    {perfilSaveStatus==="saved"&&<span className="cuenta-save-pill"><span>✓</span> Guardado</span>}
                  </div>
                  <div style={{fontSize:11,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Completá acá la identidad y los datos institucionales que DocWorks utilizará en la aplicación y en todos los documentos.</div>
                </div>

                <div className="cuenta-dashboard-stats" aria-label="Resumen de la inmobiliaria">
                  <div className="cuenta-dashboard-stat">
                    <div className="cuenta-dashboard-stat-icon">▦</div>
                    <div><div className="cuenta-dashboard-stat-label">Operaciones</div><div className="cuenta-dashboard-stat-value">{opsTotal}</div></div>
                  </div>
                  <div className="cuenta-dashboard-stat cuenta-dashboard-stat-active">
                    <div className="cuenta-dashboard-stat-icon">●</div>
                    <div><div className="cuenta-dashboard-stat-label">En operación</div><div className="cuenta-dashboard-stat-value">{opsActivas}</div></div>
                  </div>
                  <div className="cuenta-dashboard-stat cuenta-dashboard-stat-team">
                    <div className="cuenta-dashboard-stat-icon">♙</div>
                    <div><div className="cuenta-dashboard-stat-label">Equipo</div><div className="cuenta-dashboard-stat-value">{equipo.length}</div></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{padding:"20px 22px 18px"}}>
              <div className="cuenta-main-grid" style={{display:"grid",gridTemplateColumns:"minmax(250px,300px) minmax(0,1fr)",gap:22,alignItems:"start"}}>
                <div style={{padding:"16px",borderRadius:14,border:"1px solid rgba(212,168,83,.24)",background:"linear-gradient(180deg,rgba(212,168,83,.08),rgba(255,255,255,.018))",minWidth:0}}>
                  <div style={{fontSize:10.5,fontWeight:750,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".10em",marginBottom:11}}>Identidad de la inmobiliaria</div>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:92,height:92,borderRadius:15,background:"rgba(255,255,255,.90)",border:"1px solid rgba(212,168,83,.32)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:"0 8px 20px rgba(0,0,0,.10)",flexShrink:0}}>
                      {localPerfil.logoDataUrl
                        ? <div style={{position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <img src={localPerfil.logoDataUrl} style={{width:"88%",height:"88%",objectFit:"contain",borderRadius:10}} alt="Logo de la inmobiliaria"/>
                            <button type="button" title="Quitar logo" aria-label="Quitar logo" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{logoDataUrl:"",pie_pagina_logo_debajo:false});});}} style={{position:"absolute",top:4,right:4,width:21,height:21,padding:0,borderRadius:"50%",background:"#b42318",border:"2px solid #fff",color:"#fff",cursor:"pointer",fontSize:13,lineHeight:"17px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 10px rgba(0,0,0,.28)",zIndex:10,boxSizing:"border-box"}}>×</button>
                          </div>
                        : <button type="button" onClick={function(){fileRef.current&&fileRef.current.click();}} style={{width:"100%",height:"100%",border:0,background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,color:"var(--dim)"}}>
                            <span style={{fontSize:24}}>＋</span><span style={{fontSize:10.5,fontWeight:650,color:"var(--text)"}}>Subir logo</span><span style={{fontSize:8.8}}>PNG, JPG o SVG</span>
                          </button>
                      }
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontFamily:"DM Serif Display,serif",fontSize:18,color:"var(--text)",lineHeight:1.15,overflowWrap:"anywhere"}}>{localPerfil.nombre||"Tu inmobiliaria"}</div>
                      {localPerfil.matricula&&<div style={{fontSize:10.8,color:"var(--gold)",fontWeight:650,marginTop:5}}>Mat. {localPerfil.matricula}</div>}
                      <div style={{fontSize:9.8,color:"var(--dim)",lineHeight:1.45,marginTop:7}}>Este logo se guarda junto con la información de la inmobiliaria y puede aparecer en encabezados y pies de documentos según la configuración visual.</div>
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogo}/>
                </div>

                <div className="cuenta-info-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"12px 14px",alignItems:"start"}}>
                  <Inp label="Nombre de la inmobiliaria" value={localPerfil.nombre||""} onChange={fP("nombre")} placeholder="Inmobiliaria XYZ"/>
                  <Inp label="Matrícula / CMCPSI" value={localPerfil.matricula||""} onChange={fP("matricula")} placeholder="Mat. 1234"/>
                  <Inp label="CUIT de la inmobiliaria" value={localPerfil.cuit||""} onChange={fP("cuit")} placeholder="30-12345678-9"/>
                  <Inp label="Teléfono" value={localPerfil.telefono||""} onChange={fP("telefono")} placeholder="+54 11 1234-5678"/>
                  <Inp label="Correo electrónico" value={localPerfil.email||""} onChange={fP("email")} placeholder="info@inmobiliaria.com" type="email"/>
                  <Inp label="Dirección" value={localPerfil.direccion||""} onChange={fP("direccion")} placeholder="Av. Corrientes 1234, CABA"/>
                  <Inp label="Sitio web" value={localPerfil.web||""} onChange={fP("web")} placeholder="www.inmobiliaria.com"/>
                </div>
              </div>

              <div className="cuenta-save-panel">
                <div style={{minWidth:0}}>
                  <div className="cuenta-save-title">Datos de la cuenta</div>
                  <div className="cuenta-save-copy">Los cambios quedan asociados a la inmobiliaria y se usan automáticamente en documentos y configuraciones.</div>
                  {perfilSaveStatus==="error"&&<div className="cuenta-save-error">No se pudieron guardar los cambios. Revisá la conexión e intentá nuevamente.</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                  {perfilSaveStatus==="saving"&&<span className="cuenta-save-state"><span className="cuenta-save-dot"/>Guardando…</span>}
                  {perfilSaveStatus==="saved"&&<span className="cuenta-save-state saved"><span>✓</span> Guardado</span>}
                  <Btn v="success" onClick={savePerfil} style={{minWidth:170,height:40,padding:"0 18px",boxShadow:"0 7px 18px rgba(16,185,129,.14)"}} disabled={perfilSaveStatus==="saving"}>{perfilSaveStatus==="saving"?"Guardando…":"Guardar cambios"}</Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Respaldo / Respaldo y migración */}
      {tab==="backup"&&(
        <div className="card" style={{padding:20,marginTop:16}}>
          <div style={{fontSize:15,fontFamily:"DM Serif Display,serif",color:"var(--text)",marginBottom:4}}>Respaldo y migración</div>
          <div style={{fontSize:12.5,color:"var(--dim)",marginBottom:16,lineHeight:1.6}}>Exportá o importá un respaldo completo en JSON. Los datos de la inmobiliaria y las operaciones se sincronizan con la nube cuando están disponibles.</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <Btn v="secondary" onClick={onExportarRespaldo}>⬇ Exportar todo (JSON)</Btn>
            <Btn v="secondary" onClick={function(){backupFileRef.current.click();}}>⬆ Importar respaldo</Btn>
            <input ref={backupFileRef} type="file" accept="application/json,.json" style={{display:"none"}} onChange={handleRespaldoFile}/>
          </div>
          {backupMsg&&(
            <div style={{marginTop:12,fontSize:12.5,padding:"8px 12px",borderRadius:8,color:backupMsg.ok?"var(--green)":"var(--red)",background:backupMsg.ok?"rgba(16,185,129,0.10)":"rgba(239,68,68,0.10)"}}>{backupMsg.text}</div>
          )}
        </div>
      )}

      {/* ── MODAL: confirmar importación de respaldo ── */}
      {confirmImport&&(
        <Modal open={true} onClose={function(){setConfirmImport(null);}} title="Importar respaldo">
          <div style={{fontSize:13,color:"var(--muted)",marginBottom:14,lineHeight:1.6}}>Elegí cómo aplicar los datos del archivo importado:</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            <label style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",borderRadius:10,border:"1px solid "+(importModo==="fusionar"?"var(--gold)":"var(--border2)"),background:importModo==="fusionar"?"rgba(212,168,83,0.08)":"transparent",cursor:"pointer"}}>
              <input type="radio" checked={importModo==="fusionar"} onChange={function(){setImportModo("fusionar");}} style={{marginTop:3}}/>
              <div><div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Fusionar (recomendado)</div><div style={{fontSize:11.5,color:"var(--dim)"}}>Agrega lo que falte, sin borrar nada de lo que ya tenés cargado.</div></div>
            </label>
            <label style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",borderRadius:10,border:"1px solid "+(importModo==="reemplazar"?"var(--red)":"var(--border2)"),background:importModo==="reemplazar"?"rgba(239,68,68,0.08)":"transparent",cursor:"pointer"}}>
              <input type="radio" checked={importModo==="reemplazar"} onChange={function(){setImportModo("reemplazar");}} style={{marginTop:3}}/>
              <div><div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Reemplazar todo</div><div style={{fontSize:11.5,color:"var(--dim)"}}>Pisa los datos actuales de este dispositivo con los del archivo. No se puede deshacer.</div></div>
            </label>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn v="ghost" onClick={function(){setConfirmImport(null);}}>Cancelar</Btn>
            <Btn v={importModo==="reemplazar"?"danger":"success"} onClick={confirmarImportacion}>{importModo==="reemplazar"?"Reemplazar todo":"Importar"}</Btn>
          </div>
        </Modal>
      )}

      {showConfigUnsaved&&<Modal open={true} onClose={function(){setShowConfigUnsaved(false);setConfigUnsavedTarget(null);setConfigUnsavedView(null);}} title="Cambios sin guardar">
        <div style={{fontSize:13,color:"var(--text)",fontWeight:650,marginBottom:7}}>Tenés cambios en el aspecto del documento.</div>
        <div style={{fontSize:11.8,color:"var(--muted)",lineHeight:1.55,marginBottom:16}}>¿Querés guardarlos antes de salir de esta sección?</div>
        {perfilSaveStatus==="error"&&<div style={{marginBottom:12,padding:"8px 10px",borderRadius:8,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.20)",color:"var(--red)",fontSize:11.2}}>No se pudieron guardar los cambios. Revisá la conexión e intentá nuevamente.</div>}
        <div style={{display:"flex",justifyContent:"flex-end",gap:7,flexWrap:"wrap"}}>
          <Btn v="ghost" onClick={function(){setShowConfigUnsaved(false);setConfigUnsavedTarget(null);setConfigUnsavedView(null);}}>Seguir editando</Btn>
          <Btn v="danger" onClick={descartarCambiosAspecto}>Descartar</Btn>
          <Btn v="success" onClick={guardarCambiosYContinuar} disabled={perfilSaveStatus==="saving"}>{perfilSaveStatus==="saving"?"Guardando…":"Guardar cambios"}</Btn>
        </div>
      </Modal>}

      {/* ── TAB: EQUIPO ── */}
      {tab==="equipo"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:"var(--text)"}}>Miembros del equipo</div>
              <div style={{fontSize:12.5,color:"var(--dim)",marginTop:2}}>Autorizá a vendedores y brokers a operar en la plataforma</div>
            </div>
            {equipoSupabase.esAdmin && <Btn onClick={function(){openInvite(null);}}>+ Invitar miembro</Btn>}
          </div>

          {equipoSupabase.error && (
            <div style={{marginBottom:16,padding:"10px 14px",borderRadius:10,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",color:"var(--red)",fontSize:12.5}}>{equipoSupabase.error}</div>
          )}

          {/* ── ESQUEMA DE COMISIONES ── */}
          <details style={{background:"linear-gradient(135deg,rgba(212,168,83,.07),transparent)",border:"1px solid rgba(212,168,83,.18)",borderRadius:16,marginBottom:20,overflow:"hidden"}}>
            <summary style={{listStyle:"none",cursor:"pointer",padding:"15px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                <div style={{width:32,height:32,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.18)",color:"var(--gold)",fontSize:15,flexShrink:0}}>%</div>
                <div style={{minWidth:0}}><div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)"}}>Esquema de comisiones</div><div style={{fontSize:10.7,color:"var(--dim)",marginTop:2}}>Participación uniforme o personalizada por asesor</div></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span style={{padding:"5px 9px",borderRadius:20,fontSize:10.5,fontWeight:700,color:"var(--gold)",background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.22)"}}>COMISIONES</span>
                <span style={{fontSize:13,color:"var(--dim)"}}>⌄</span>
              </div>
            </summary>
            <div style={{padding:"0 18px 16px",borderTop:"1px solid rgba(212,168,83,.10)"}}>
              <div style={{fontSize:11,color:"var(--dim)",lineHeight:1.5,paddingTop:12,marginBottom:13}}>Definí si todos cobran la misma participación o si cada asesor tiene su propio porcentaje. La participación se aplica a los honorarios de las operaciones que tenga asignadas.</div>
              <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr)",gap:12}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>
                  {[{v:"uniforme",l:"Todos con la misma participación",d:"Una regla para todo el equipo"},{v:"individual",l:"Participación por asesor",d:"Cada persona puede tener el suyo"}].map(function(o){var sel=splitMode===o.v;return <button key={o.v} type="button" onClick={function(){var next=Object.assign({},localPerfil,{broker_split_mode:o.v});setLocalPerfil(next);onChange(next);}} style={{textAlign:"left",padding:"10px 11px",borderRadius:10,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.10)":"rgba(255,255,255,.015)",color:sel?"var(--text)":"var(--muted)"}}><div style={{fontSize:11.5,fontWeight:700}}>{o.l}</div><div style={{fontSize:9.8,color:"var(--dim)",marginTop:3}}>{o.d}</div></button>;})}
                </div>
                <div style={{maxWidth:260}}>
                  <Inp label="Participación base del asesor (%)" type="number" min="0" max="100" value={splitDefault} onChange={function(e){var n=Math.max(0,Math.min(100,parseFloat(e.target.value)||0));var next=Object.assign({},localPerfil,{broker_split_pct:n});setLocalPerfil(next);}} hint="Se usa como valor general y como base para nuevos asesores."/>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}><Btn v="success" s="sm" onClick={function(){var next=Object.assign({},localPerfil,{broker_split_mode:splitMode,broker_split_pct:splitDefault});setLocalPerfil(next);setPerfilSaveStatus("saving");Promise.resolve(onChange(next)).then(function(res){if(res&&res.error){setPerfilSaveStatus("error");return;}setPerfilSaveStatus("saved");setTimeout(function(){setPerfilSaveStatus(null);},3000);}).catch(function(){setPerfilSaveStatus("error");});}}>Guardar esquema de comisiones ✓</Btn></div>
            </div>
          </details>

          {/* ── RANKING INTERNO ── */}
          {equipoSupabase.esAdmin&&<details style={{background:"linear-gradient(135deg,rgba(212,168,83,.055),transparent)",border:"1px solid rgba(212,168,83,.15)",borderRadius:16,marginBottom:20,overflow:"hidden"}}>
            <summary style={{listStyle:"none",cursor:"pointer",padding:"15px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><div style={{width:32,height:32,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.18)",fontSize:15}}>🏆</div><div><div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)"}}>Ranking interno</div><div style={{fontSize:10.7,color:"var(--dim)",marginTop:2}}>Competencia interna por operaciones y facturación</div></div></div>
              <span style={{padding:"5px 9px",borderRadius:20,fontSize:10.5,fontWeight:700,color:localPerfil.ranking_interno_activo?"var(--green)":"var(--muted)",background:localPerfil.ranking_interno_activo?"rgba(74,222,128,.08)":"rgba(255,255,255,.04)",border:"1px solid "+(localPerfil.ranking_interno_activo?"rgba(74,222,128,.20)":"var(--border)" )}}>{localPerfil.ranking_interno_activo?"ACTIVO":"DESACTIVADO"}</span>
            </summary>
            <div style={{padding:"0 18px 16px",borderTop:"1px solid rgba(212,168,83,.10)"}}>
              <div style={{fontSize:11,color:"var(--dim)",lineHeight:1.5,paddingTop:12,marginBottom:12}}>Si lo activás, el equipo podrá ver un ranking interno. Se ordena por cantidad de operaciones y facturación, pero nunca se muestran los importes de facturación.</div>
              <button type="button" onClick={function(){var next=Object.assign({},localPerfil,{ranking_interno_activo:!localPerfil.ranking_interno_activo});setLocalPerfil(next);}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"11px 12px",borderRadius:10,border:"1px solid "+(localPerfil.ranking_interno_activo?"rgba(74,222,128,.25)":"var(--border2)"),background:localPerfil.ranking_interno_activo?"rgba(74,222,128,.07)":"rgba(255,255,255,.015)",color:"var(--text)",cursor:"pointer",textAlign:"left"}}>
                <span><span style={{display:"block",fontSize:11.5,fontWeight:700}}>{localPerfil.ranking_interno_activo?"Ranking habilitado":"Ranking deshabilitado"}</span><span style={{display:"block",fontSize:9.8,color:"var(--dim)",marginTop:2}}>{localPerfil.ranking_interno_activo?"Los brokers podrán consultar su posición.":"Nadie verá el ranking hasta que lo habilites."}</span></span>
                <span style={{width:42,height:24,borderRadius:20,background:localPerfil.ranking_interno_activo?"var(--gold)":"var(--border2)",padding:3,boxSizing:"border-box",display:"flex",justifyContent:localPerfil.ranking_interno_activo?"flex-end":"flex-start",alignItems:"center",flexShrink:0}}><span style={{width:18,height:18,borderRadius:"50%",background:"#fff",display:"block"}}/></span>
              </button>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}><Btn v="success" s="sm" onClick={function(){var next=Object.assign({},localPerfil,{ranking_interno_activo:!!localPerfil.ranking_interno_activo});setLocalPerfil(next);setPerfilSaveStatus("saving");Promise.resolve(onChange(next)).then(function(res){if(res&&res.error){setPerfilSaveStatus("error");return;}setPerfilSaveStatus("saved");setTimeout(function(){setPerfilSaveStatus(null);},3000);}).catch(function(){setPerfilSaveStatus("error");});}}>Guardar ranking ✓</Btn></div>
            </div>
          </details>}

          {/* Tabla de roles */}
          <div style={{background:"linear-gradient(135deg,rgba(212,168,83,0.05),transparent)",border:"1px solid rgba(212,168,83,0.15)",borderRadius:14,padding:16,marginBottom:20}}>
            <div style={{fontSize:11.5,fontWeight:700,color:"var(--gold)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Permisos por rol</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr>
                    <th style={{textAlign:"left",padding:"6px 10px",color:"var(--dim)",fontWeight:600}}>Permiso</th>
                    {Object.entries(ROLES_DEF).map(function(e){return <th key={e[0]} style={{padding:"6px 10px",color:e[1].color,fontWeight:600,textAlign:"center",whiteSpace:"nowrap"}}>{e[1].label}</th>;})}
                  </tr>
                </thead>
                <tbody>
                  {["todo","crear","editar","eliminar","ver_todos","ver_propios","configurar"].map(function(p,i){
                    return(
                      <tr key={p} style={{borderTop:"1px solid var(--border)",background:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
                        <td style={{padding:"7px 10px",color:"var(--muted)",fontSize:12}}>{PERMS_LABELS[p]}</td>
                        {Object.entries(ROLES_DEF).map(function(e){
                          var has = e[1].perms.includes("todo")||e[1].perms.includes(p);
                          return <td key={e[0]} style={{padding:"7px 10px",textAlign:"center"}}><span style={{color:has?"var(--green)":"rgba(255,255,255,0.08)",fontSize:14}}>{has?"✓":"—"}</span></td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lista de miembros */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {equipoSupabase.loading && equipo.length===0 && (
              <div style={{padding:40,textAlign:"center",background:"var(--card)",border:"1px solid var(--border)",borderRadius:14}}>
                <p style={{color:"var(--dim)",fontSize:13}}>Cargando equipo…</p>
              </div>
            )}
            {!equipoSupabase.loading && equipo.length===0&&(
              <div style={{padding:40,textAlign:"center",background:"var(--card)",border:"1px solid var(--border)",borderRadius:14}}>
                <div style={{fontSize:36,marginBottom:10}}>👥</div>
                <p style={{color:"var(--dim)",fontSize:13}}>No hay miembros en el equipo. Invitá al primero.</p>
              </div>
            )}
            {equipo.map(function(m){
              var rd = ROLES_DEF[m.rol]||ROLES_DEF.viewer;
              var opsM = operaciones.filter(function(o){return o.broker_id===m.id;}).length;
              var esPendiente = m._tipo==="invitacion";
              var nivelLabel = NIVEL_LABELS[m.perfil_permisos]||null;
              return(
                <div key={m.id} className="op-card">
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    {/* Avatar */}
                    <div style={{position:"relative",width:48,height:48,flexShrink:0}}>
                      <div style={{width:48,height:48,borderRadius:13,background:"linear-gradient(135deg,#1e2d42,#162032)",border:"1px solid var(--border2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:"var(--text)",overflow:"hidden"}}>
                        {esPendiente?"✉":((localPerfil.broker_fotos&&localPerfil.broker_fotos[m.id])?<img src={localPerfil.broker_fotos[m.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="Foto del asesor"/>:(m.nombre[0]?.toUpperCase()||"?"))}
                      </div>
                      {!esPendiente&&<label title="Cargar foto del asesor" style={{position:"absolute",right:-5,bottom:-5,width:20,height:20,borderRadius:"50%",background:"var(--gold)",color:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,fontWeight:900,border:"2px solid var(--card)",boxSizing:"border-box"}}>+<input type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={function(e){handleFotoBroker(m,e);}}/></label>}
                    </div>
                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontWeight:600,fontSize:13.5,color:"var(--text)"}}>{esPendiente?m.email:m.nombre}</span>
                        <span style={{padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:rd.bg,color:rd.color,border:"1px solid "+rd.color+"33"}}>{rd.label}</span>
                        {nivelLabel && <span style={{padding:"2px 9px",borderRadius:20,fontSize:10.5,background:"rgba(255,255,255,0.04)",color:"var(--muted)",border:"1px solid var(--border2)"}}>{nivelLabel}</span>}
                        {esPendiente
                          ? <span style={{padding:"2px 8px",borderRadius:20,fontSize:10.5,background:"rgba(251,191,36,0.1)",color:"var(--amber)",border:"1px solid rgba(251,191,36,0.25)"}}>✉ Invitación pendiente</span>
                          : <span style={{padding:"2px 8px",borderRadius:20,fontSize:10.5,background:m.estado==="activo"?"rgba(74,222,128,0.08)":"rgba(248,113,113,0.08)",color:m.estado==="activo"?"var(--green)":"var(--red)",border:"1px solid "+(m.estado==="activo"?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.2)")}}>{m.estado==="activo"?"✓ Activo":"⊘ Inactivo"}</span>
                        }
                      </div>
                      <div style={{fontSize:12,color:"var(--dim)"}}>{esPendiente?"Todavía no inició sesión":m.email}</div>
                    </div>
                    {/* Ops count */}
                    {!esPendiente && (
                      <div style={{textAlign:"center",padding:"6px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",flexShrink:0}}>
                        <div style={{fontFamily:"DM Serif Display,serif",fontSize:18,color:"var(--gold)"}}>{opsM}</div>
                        <div style={{fontSize:10,color:"var(--dim)"}}>Operaciones</div>
                      </div>
                    )}
                    {/* Actions */}
                    {equipoSupabase.esAdmin && (
                      <div style={{display:"flex",gap:6,flexShrink:0}}>
                        {esPendiente ? (
                          <Btn v="danger" s="sm" onClick={function(){setConfirmDelMiembro(m);}}>Cancelar invitación</Btn>
                        ) : m.rol==="dueno" ? null : (
                          <>
                            <Btn v="secondary" s="sm" onClick={function(){equipoSupabase.setActivo(m.id, m.estado!=="activo");}}>{m.estado==="activo"?"⊘ Suspender":"✓ Activar"}</Btn>
                            <Btn v="secondary" s="sm" onClick={function(){openInvite(m);}}><span style={{display:"inline-flex",alignItems:"center",gap:6}}><DWIcon name="edit" size={13}/>Rol/Nivel</span></Btn>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {!esPendiente && m.rol==="broker" && (splitMode==="individual" || puedeEditarSplit(m)) && (
                    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                      <div><div style={{fontSize:11.5,fontWeight:700,color:"var(--text)"}}>Participación personal</div><div style={{fontSize:10,color:"var(--dim)",marginTop:2}}>{puedeEditarSplit(m)?(m.id===currentUserId?"Podés modificar tu porcentaje directamente.":"Dueño / Administrador puede modificarlo."):"Solo Dueño / Administrador o el propio asesor pueden modificarlo."}</div></div>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <input type="number" min="0" max="100" value={splitDeMiembro(m)} disabled={!puedeEditarSplit(m)} onChange={function(e){var v=e.target.value;var nextSplits=Object.assign({},brokerSplits);nextSplits[m.id]=Math.max(0,Math.min(100,parseFloat(v)||0));setLocalPerfil(function(p){return Object.assign({},p,{broker_splits:nextSplits});});}} style={{width:74,height:34,boxSizing:"border-box",borderRadius:8,border:"1px solid "+(puedeEditarSplit(m)?"var(--border2)":"var(--border)"),background:"var(--input)",color:"var(--text)",padding:"0 9px",fontSize:12,fontWeight:700,textAlign:"right",opacity:puedeEditarSplit(m)?1:.55}}/>
                        <span style={{fontSize:12,color:"var(--gold)",fontWeight:700}}>%</span>
                        {puedeEditarSplit(m)&&<button type="button" onClick={function(){guardarSplitMiembro(m,splitDeMiembro(m));}} style={{height:34,padding:"0 10px",borderRadius:8,border:"1px solid rgba(212,168,83,.28)",background:"rgba(212,168,83,.08)",color:"var(--gold)",fontSize:10.5,fontWeight:700,cursor:"pointer"}}>Guardar</button>}
                      </div>
                    </div>
                  )}
                  {/* Permisos badges */}
                  {!esPendiente && (
                    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)",display:"flex",gap:5,flexWrap:"wrap"}}>
                      {(rd.perms.includes("todo")?Object.keys(PERMS_LABELS):rd.perms).map(function(p){
                        return <span key={p} style={{padding:"2px 8px",borderRadius:20,fontSize:10.5,background:"rgba(74,222,128,0.07)",color:"var(--green)",border:"1px solid rgba(74,222,128,0.18)"}}>✓ {PERMS_LABELS[p]}</span>;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Invite / editar rol modal */}
          <Modal open={showInvite} onClose={function(){setShowInvite(false);}  } title={editM?"Editar rol y nivel":"Invitar miembro al equipo"}>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              {editM
                ? <div style={{fontSize:13,color:"var(--muted)"}}>{editM.nombre} · {editM.email}</div>
                : <Inp label="Correo electrónico" value={form.email} onChange={function(e){setForm(function(f){return Object.assign({},f,{email:e.target.value});});}} placeholder="juan@inmobiliaria.com" type="email"/>
              }
              <Slt label="Rol y permisos" value={form.rol} onChange={function(e){setForm(function(f){return Object.assign({},f,{rol:e.target.value});});}}>
                {Object.entries(ROLES_DEF).filter(function(e){return e[0]!=="dueno";}).map(function(e){
                  return <option key={e[0]} value={e[0]}>{e[1].label} — {e[0]==="admin"?"acceso total sin ser dueño":e[0]==="broker"?"crear y editar":e[0]==="vendedor"?"solo crear":e[0]==="viewer"?"solo ver":" "}</option>;
                })}
              </Slt>
              <Slt label="Nivel" value={form.nivel} onChange={function(e){setForm(function(f){return Object.assign({},f,{nivel:e.target.value});});}}>
                <option value="junior">Junior</option>
                <option value="semisenior">Intermedio</option>
                <option value="senior">Senior</option>
              </Slt>
              {/* Preview permisos del rol */}
              <div style={{padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)"}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:7}}>Permisos del rol</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {(ROLES_DEF[form.rol]?.perms.includes("todo")?Object.keys(PERMS_LABELS):ROLES_DEF[form.rol]?.perms||[]).map(function(p){
                    return <span key={p} style={{padding:"2px 8px",borderRadius:20,fontSize:10.5,background:"rgba(74,222,128,0.08)",color:"var(--green)",border:"1px solid rgba(74,222,128,0.2)"}}>✓ {PERMS_LABELS[p]}</span>;
                  })}
                </div>
              </div>
              {inviteError && <div style={{fontSize:12.5,color:"var(--red)",background:"rgba(248,113,113,0.1)",padding:"8px 10px",borderRadius:8,fontWeight:600}}>{inviteError}</div>}
              <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:6}}>
                <Btn v="ghost" onClick={function(){setShowInvite(false);}}>Cancelar</Btn>
                <Btn v="success" onClick={handleSaveM} disabled={inviteBusy}>{inviteBusy?"Guardando…":(editM?"Actualizar ✓":"Enviar invitación ✓")}</Btn>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ── TAB: PLANTILLAS ── */}
      {tab==="plantillas"&&(function(){
        var plantillaActual = obtenerPlantillaConfig(perfil,tipoDocSel,clausulas);
        var idsPlantilla = plantillaActual.clausulas_ids||[];
        var listaPlantilla = idsPlantilla.map(function(id){return (clausulas||[]).find(function(c){return c.id===id;});}).filter(Boolean);
        var disponibles = (clausulas||[]).filter(function(c){ return clausulaAplicaTipo(c,tipoDocSel) && idsPlantilla.indexOf(c.id)===-1; });
        var defaultsLocked = !!plantillaActual.locked;
        var puedeAgregar = puedeEditarPlantillas && !defaultsLocked;

        function guardarPerfil(next){
          try { return onChange(next); } catch(e) { return Promise.resolve({error:e}); }
        }
        function actualizarPlantilla(changes){
          if(!puedeEditarPlantillas)return;
          var mapa=Object.assign({},perfil.plantillas||{});
          var actual=Object.assign({},mapa[tipoDocSel]||{}, {clausulas_ids:idsPlantilla.slice(), locked:defaultsLocked});
          actual=Object.assign(actual,changes||{});
          var next=Object.assign({},perfil,{plantillas:Object.assign({},mapa,{[tipoDocSel]:actual})});
          // Compatibilidad: mantenemos también el esquema anterior con la selección del documento actual.
          next.clausulas_default_ids=actual.clausulas_ids.slice();
          next.clausulas_default_locked=!!actual.locked;
          return guardarPerfil(next);
        }
        function agregarClausula(id){
          if(!puedeAgregar||!id)return;
          if(idsPlantilla.indexOf(id)!==-1)return;
          actualizarPlantilla({clausulas_ids:idsPlantilla.concat([id]),locked:false});
        }
        function quitarClausula(id){
          if(!puedeAgregar)return;
          actualizarPlantilla({clausulas_ids:idsPlantilla.filter(function(x){return x!==id;}),locked:false});
        }
        function moverPlantilla(id,targetId){
          if(!puedeAgregar)return;
          var arr=idsPlantilla.slice(), from=arr.indexOf(id), to=arr.indexOf(targetId);
          if(from<0||to<0||from===to)return;
          arr.splice(from,1); arr.splice(to,0,id);
          actualizarPlantilla({clausulas_ids:arr,locked:false});
        }
        function finalizarPlantilla(){
          if(!puedeEditarPlantillas||defaultsLocked||idsPlantilla.length===0)return;
          setConfirmLockDefaults(true);
        }
        function confirmarBloqueo(){
          var mapa=Object.assign({},perfil.plantillas||{});
          var cfg={clausulas_ids:idsPlantilla.slice(),locked:true};
          var next=Object.assign({},perfil,{plantillas:Object.assign({},mapa,{[tipoDocSel]:cfg}),clausulas_default_ids:idsPlantilla.slice(),clausulas_default_locked:true});
          guardarPerfil(next);
          setConfirmLockDefaults(false);
        }
        function desbloquearPlantilla(){
          if(!puedeEditarPlantillas)return;
          actualizarPlantilla({locked:false});
        }
        function nuevaClausula(){
          if(!puedeEditarPlantillas)return;
          setPlantillaForm({editId:null,titulo:"",categoria:"general",contenido:"",tipos:[tipoDocSel],obligatoria:false});
        }
        function guardarNuevaClausula(){
          if(!plantillaForm||!plantillaForm.titulo||!plantillaForm.contenido||!puedeEditarPlantillas)return;
          var payload={titulo:plantillaForm.titulo,categoria:plantillaForm.categoria,contenido:plantillaForm.contenido,tipos:plantillaForm.tipos&&plantillaForm.tipos.length?plantillaForm.tipos:[tipoDocSel],obligatoria:!!plantillaForm.obligatoria};
          if(plantillaForm.editId) onEditClausula(plantillaForm.editId,payload); else onAddClausula(Object.assign({},payload,{id:genId()}));
          setPlantillaForm(null);
        }
        function ClauseCard({c,index}){
          var draggable=puedeAgregar;
          return <div key={c.id}
            draggable={draggable}
            onDragStart={function(e){if(!draggable)return;setDragClausulaId(c.id);try{e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",c.id);}catch(_){}}}
            onDragOver={function(e){if(draggable){e.preventDefault();try{e.dataTransfer.dropEffect="move";}catch(_){}}}}
            onDragEnter={function(e){if(draggable)e.preventDefault();}}
            onDrop={function(e){if(!draggable)return;e.preventDefault();var from=dragClausulaId||((e.dataTransfer&&e.dataTransfer.getData("text/plain"))||"");if(from&&from!==c.id)moverPlantilla(from,c.id);setDragClausulaId(null);}}
            onDragEnd={function(){setDragClausulaId(null);}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",border:"1px solid var(--border)",borderRadius:11,background:"rgba(255,255,255,.012)",opacity:dragClausulaId===c.id?.55:1}}>
            <div title={draggable?"Arrastrá esta cláusula para cambiar el orden":"Plantilla bloqueada"} style={{width:30,height:30,borderRadius:9,background:"rgba(212,168,83,.09)",border:"1px solid rgba(212,168,83,.16)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10.5,fontWeight:700,color:"var(--gold)",flexShrink:0,cursor:draggable?"grab":"default"}}>⠿</div><div style={{minWidth:22,textAlign:"center",fontSize:10.5,color:"var(--dim)",flexShrink:0}}>{index+1}</div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:12.7,fontWeight:650,color:"var(--text)"}}>{(c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título"}</span>
                <SmallPill tone={CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;})?"gold":"green"}>{CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;})?"Estándar":"Propia"}</SmallPill>
                {c.obligatoria&&<SmallPill tone="muted">Obligatoria</SmallPill>}
              </div>
              <div style={{fontSize:10.5,color:"var(--dim)",marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{(c.contenido||"Sin texto.").replace(/\s+/g," ")}</div>
            </div>
            {puedeAgregar&&<div style={{display:"flex",gap:4,flexShrink:0}}><button title="Subir" onClick={function(){if(index>0)moverPlantilla(c.id,listaPlantilla[index-1].id);}} disabled={index===0} style={{height:29,width:29,borderRadius:7,border:"1px solid var(--border)",background:"rgba(255,255,255,.03)",color:index===0?"var(--border2)":"var(--muted)",cursor:index===0?"default":"pointer"}}>↑</button><button title="Bajar" onClick={function(){if(index<listaPlantilla.length-1)moverPlantilla(c.id,listaPlantilla[index+1].id);}} disabled={index===listaPlantilla.length-1} style={{height:29,width:29,borderRadius:7,border:"1px solid var(--border)",background:"rgba(255,255,255,.03)",color:index===listaPlantilla.length-1?"var(--border2)":"var(--muted)",cursor:index===listaPlantilla.length-1?"default":"pointer"}}>↓</button><button onClick={function(){quitarClausula(c.id);}} style={{height:29,padding:"0 9px",borderRadius:7,border:"1px solid rgba(248,113,113,.16)",background:"rgba(248,113,113,.05)",color:"var(--red)",cursor:"pointer",fontSize:10.2}}>Quitar</button></div>}
            <span style={{fontSize:12,color:puedeAgregar?"var(--dim)":"var(--gold)"}}>{puedeAgregar?"↕":"🔒"}</span>
          </div>;
        }
        function SmallPill({children,tone}){
          var map={gold:["rgba(212,168,83,.10)","var(--gold)"],teal:["rgba(45,212,191,.10)","var(--teal)"],green:["rgba(74,222,128,.09)","var(--green)"],muted:["rgba(255,255,255,.04)","var(--muted)"]};
          var x=map[tone||"muted"]||map.muted;
          return <span style={{fontSize:9.7,padding:"3px 7px",borderRadius:20,background:x[0],color:x[1],border:"1px solid rgba(255,255,255,.06)",whiteSpace:"nowrap"}}>{children}</span>;
        }
        function renderForm(){
          if(!plantillaForm||!puedeEditarPlantillas)return null;
          return <div style={{border:"1px solid rgba(212,168,83,.22)",borderRadius:11,padding:12,marginBottom:12,background:"rgba(212,168,83,.035)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}><div style={{fontSize:12.5,fontWeight:650,color:"var(--text)"}}>Nueva cláusula para la biblioteca</div><button onClick={function(){setPlantillaForm(null);}} style={{border:0,background:"transparent",color:"var(--dim)",fontSize:18,cursor:"pointer"}}>×</button></div>
            <ClausulaFormBody form={plantillaForm} setForm={function(updater){setPlantillaForm(function(f){return typeof updater==="function"?updater(f):updater;});}} editId={plantillaForm.editId} onSubmit={guardarNuevaClausula} onCancel={function(){setPlantillaForm(null);}}/>
            <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)"}}><ClausulaIAComposer onDraft={function(draft){setPlantillaForm(function(f){return Object.assign({},f,{titulo:draft.titulo,categoria:draft.categoria||"general",contenido:draft.contenido,tipos:[tipoDocSel]});});}}/></div>
          </div>;
        }
        return <div>
          <div className="card" style={{padding:0,marginBottom:12,overflow:"hidden"}}>
            <div style={{padding:"18px 20px 14px",display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <div><div style={{fontFamily:"DM Serif Display,serif",fontSize:20,color:"var(--text)"}}>Plantillas</div><div style={{fontSize:10.9,color:"var(--dim)",marginTop:3}}>Configurá qué dicen tus documentos y, por separado, cómo se ven.</div></div>
            </div>
            <div style={{display:"flex",gap:4,padding:"0 8px",borderTop:"1px solid var(--border)",background:"rgba(148,163,184,.025)"}}>
              <button type="button" onClick={function(){pedirCambioVista("modelos");setPlantillaSubtab("clausulas");}} style={{border:0,borderBottom:plantillaVista==="modelos"?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:plantillaVista==="modelos"?"var(--text)":"var(--muted)",padding:"12px 15px",cursor:"pointer",fontSize:11.5,fontWeight:plantillaVista==="modelos"?700:500}}>▦ Modelos de documentos</button>
              <button type="button" onClick={function(){pedirCambioVista("aspecto");}} style={{border:0,borderBottom:plantillaVista==="aspecto"?"2px solid var(--gold)":"2px solid transparent",background:"transparent",color:plantillaVista==="aspecto"?"var(--text)":"var(--muted)",padding:"12px 15px",cursor:"pointer",fontSize:11.5,fontWeight:plantillaVista==="aspecto"?700:500}}>✦ Aspecto del documento</button>
            </div>
          </div>
          {plantillaVista==="aspecto"&&<div className="card" style={{padding:18}}>
            <div style={{maxWidth:760,margin:"0 auto 18px",textAlign:"center"}}><div style={{fontFamily:"DM Serif Display,serif",fontSize:19,color:"var(--text)"}}>Aspecto del documento</div><div style={{fontSize:11,color:"var(--dim)",lineHeight:1.55,marginTop:4}}>Configurá una sola vez la identidad visual de DocWorks. Estos cambios se aplican a todos los documentos.</div></div>
            <div style={{display:"block"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Identidad y diseño</div>
                <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.5}}>El editor visual que ya tenés sigue acá, pero ahora está separado de los modelos para que quede claro que es una configuración global.</div>
              </div>
            </div>
            <div style={{marginTop:14}}>
                  {!puedeEditarPlantillas&&<div style={{padding:"8px 10px",borderRadius:9,background:"rgba(251,191,36,.07)",border:"1px solid rgba(251,191,36,.17)",color:"var(--amber)",fontSize:10.8,marginBottom:10}}>🔒 Solo Dueño y Administrador pueden modificar esta configuración.</div>}
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {/* APARIENCIA + VISTA PREVIA EN VIVO */}
                    <div className="plantilla-appearance-grid" style={{display:"grid",gridTemplateColumns:"minmax(250px,.9fr) minmax(320px,1.1fr)",gap:12,alignItems:"start",marginBottom:10}}>
                      <div style={{border:"1px solid var(--border)",borderRadius:10,padding:12,background:"rgba(255,255,255,.012)"}}>
                        <div style={{fontSize:11.8,fontWeight:650,color:"var(--text)",marginBottom:3}}>🎨 Apariencia del documento</div>
                        <div style={{fontSize:10.4,color:"var(--dim)",lineHeight:1.45,marginBottom:10}}>Acá modificás la identidad visual que usan el PDF y Word. Todo se refleja en tiempo real en la vista previa.</div>
                        <div className="preview-control-section" style={{paddingTop:0}}><div className="preview-control-title">🖼 Logo</div><div style={{display:"flex",alignItems:"center",gap:10}}>{localPerfil.logoDataUrl?<div style={{position:"relative"}}><img src={localPerfil.logoDataUrl} style={{height:54,width:88,borderRadius:8,objectFit:"contain",background:"rgba(255,255,255,.04)",border:"1px solid var(--border2)",padding:4}} alt="logo"/><button type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{logoDataUrl:"",pie_pagina_logo_debajo:false});});}} style={{position:"absolute",top:-7,right:-7,width:20,height:20,borderRadius:"50%",background:"var(--red)",border:"none",color:"white",cursor:"pointer",fontSize:10}}>✕</button></div>:<div className="logo-upload" onClick={function(){fileRef.current.click();}} style={{height:54,width:88}}><span style={{fontSize:18}}>🖼</span><span style={{fontSize:9,color:"var(--dim)"}}>Subir logo</span></div>}<input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogo}/></div>{localPerfil.logoDataUrl&&<><div style={{fontSize:10.5,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:12,marginBottom:7}}>Posición</div><div style={{display:"flex",gap:5}}>{[{v:"izquierda",l:"Izquierda"},{v:"centro",l:"Centro"},{v:"derecha",l:"Derecha"}].map(function(o){var sel=(localPerfil.logoPosicion||"derecha")===o.v;return <button key={o.v} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{logoPosicion:o.v});});}} style={{flex:1,padding:"6px 4px",fontSize:10.5,borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.12)":"transparent",color:sel?"var(--gold)":"var(--dim)"}}>{o.l}</button>;})}</div><div style={{fontSize:10.5,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:12,marginBottom:6,display:"flex",justifyContent:"space-between"}}><span>Tamaño logo</span><span style={{color:"var(--gold)"}}>{localPerfil.logoScale||100}%</span></div><input type="range" min="50" max="200" step="5" value={localPerfil.logoScale||100} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{logoScale:parseInt(e.target.value,10)});});}} style={{width:"100%",accentColor:"var(--gold)"}}/></>}</div>
                        <div className="preview-control-section"><div className="preview-control-title">🎨 Diseño</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>{PLANTILLA_ESTILOS.map(function(pe){var sel=(localPerfil.plantillaEstilo||"corporativo")===pe.id;return <button key={pe.id} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{plantillaEstilo:pe.id});});}} style={{padding:"7px 4px",borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.1)":"transparent",color:sel?"var(--gold)":"var(--dim)",fontSize:9.8}}>{pe.icon} {pe.label}</button>;})}</div><div style={{display:"flex",gap:10,marginTop:9}}>{[{k:"colorPrimario",l:"Primario",d:"#142a4d"},{k:"colorSecundario",l:"Secundario",d:"#c9a227"}].map(function(f){return <label key={f.k} style={{display:"flex",alignItems:"center",gap:5,fontSize:10.5,color:"var(--text)"}}><input type="color" value={localPerfil[f.k]||f.d} onChange={function(e){setLocalPerfil(function(p){var o={};o[f.k]=e.target.value;return Object.assign({},p,o);});}} style={{width:27,height:27,padding:0,border:"1px solid var(--border2)",borderRadius:6}}/>{f.l}</label>;})}</div></div>
                        <div className="preview-control-section"><div className="preview-control-title">📌 Encabezado</div>
                          <label style={{display:"flex",alignItems:"center",gap:7,padding:"8px 9px",marginBottom:8,borderRadius:8,border:"1px solid var(--border)",background:localPerfil.logo_encabezado_activo!==false?"rgba(212,168,83,.08)":"transparent",cursor:localPerfil.logoDataUrl?"pointer":"not-allowed",opacity:localPerfil.logoDataUrl?1:.55,fontSize:10.8,color:"var(--text)"}}><input type="checkbox" disabled={!localPerfil.logoDataUrl} checked={localPerfil.logo_encabezado_activo!==false} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{logo_encabezado_activo:e.target.checked});});}}/> Mostrar logo en el encabezado</label>
                          <div style={{display:"flex",flexDirection:"column",gap:6}}>{[{k:"encabezado_nombre",l:"Nombre de la inmobiliaria"},{k:"encabezado_matricula",l:"Matrícula / CMCPSI"},{k:"encabezado_web",l:"Sitio web"}].map(function(f){var checked=localPerfil[f.k]!==false;return <label key={f.k} style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:"var(--text)",cursor:"pointer"}}><input type="checkbox" checked={checked} onChange={function(e){var o={};o[f.k]=e.target.checked;setLocalPerfil(function(p){return Object.assign({},p,o);});}}/>{f.l}</label>;})}</div></div>
                        <div className="preview-control-section"><div className="preview-control-title">📍 Ubicación de la inmobiliaria</div>
                          <label style={{display:"flex",alignItems:"center",gap:7,padding:"8px 9px",borderRadius:8,border:"1px solid var(--border)",background:localPerfil.ubicacion_inmobiliaria_activa&&localPerfil.direccion?"rgba(212,168,83,.08)":"transparent",cursor:localPerfil.direccion?"pointer":"not-allowed",opacity:localPerfil.direccion?1:.55,fontSize:10.8,color:"var(--text)"}}><input type="checkbox" disabled={!localPerfil.direccion} checked={!!localPerfil.ubicacion_inmobiliaria_activa} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{ubicacion_inmobiliaria_activa:e.target.checked});});}}/> Mostrar ubicación</label>
                          <div style={{fontSize:10.2,color:"var(--dim)",marginTop:6,lineHeight:1.45}}>Usa la dirección ya cargada en <b style={{color:"var(--text)"}}>Mi cuenta</b>. No modifica ese dato.</div>
                          {localPerfil.ubicacion_inmobiliaria_activa&&localPerfil.direccion&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>{[{v:"encabezado",l:"Encabezado"},{v:"pie",l:"Pie de página"}].map(function(o){var sel=(localPerfil.ubicacion_inmobiliaria_posicion||"pie")===o.v;return <button key={o.v} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{ubicacion_inmobiliaria_posicion:o.v});});}} style={{padding:"7px 8px",borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.10)":"transparent",color:sel?"var(--gold)":"var(--dim)",fontSize:10.5,fontWeight:sel?700:500}}>{o.v==="encabezado"?"↥ ":"↓ "}{o.l}</button>;})}</div>}
                        </div>
                        <div className="preview-control-section"><div className="preview-control-title">📄 Pie de página</div>
                          <label style={{display:"flex",alignItems:"center",gap:7,padding:"8px 9px",borderRadius:8,border:"1px solid var(--border)",background:localPerfil.pie_pagina_leyenda_activa!==false?"rgba(212,168,83,.08)":"transparent",cursor:"pointer",fontSize:10.8,color:"var(--text)"}}><input type="checkbox" checked={localPerfil.pie_pagina_leyenda_activa!==false} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_leyenda_activa:e.target.checked});});}}/> Mostrar leyenda</label>
                          {localPerfil.pie_pagina_leyenda_activa!==false&&<Txa label="Leyenda" value={localPerfil.pie_pagina_texto||""} onChange={fP("pie_pagina_texto")} placeholder="Ej: Documento emitido por..." rows={2}/>} 
                          <label style={{display:"flex",alignItems:"center",gap:7,marginTop:8,padding:"8px 9px",borderRadius:8,border:"1px solid var(--border)",background:localPerfil.pie_pagina_logo_debajo?"rgba(212,168,83,.08)":"transparent",cursor:localPerfil.logoDataUrl?"pointer":"not-allowed",opacity:localPerfil.logoDataUrl?1:.5,fontSize:10.8,color:"var(--text)"}}><input type="checkbox" disabled={!localPerfil.logoDataUrl} checked={!!localPerfil.pie_pagina_logo_debajo} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_logo_debajo:e.target.checked});});}}/> Mostrar logo en el pie</label>
                          {localPerfil.logoDataUrl&&localPerfil.pie_pagina_logo_debajo&&<><div style={{fontSize:10.5,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:10,marginBottom:6}}>Posición del logo</div><div style={{display:"flex",gap:5}}>{[{v:"izquierda",l:"Izquierda"},{v:"centro",l:"Centro"},{v:"derecha",l:"Derecha"}].map(function(o){var sel=(localPerfil.pie_pagina_logo_posicion||"centro")===o.v;return <button key={o.v} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_logo_posicion:o.v});});}} style={{flex:1,padding:"6px 4px",fontSize:10.5,borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.12)":"transparent",color:sel?"var(--gold)":"var(--dim)"}}>{o.l}</button>;})}</div><div style={{fontSize:10.5,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:10,marginBottom:6,display:"flex",justifyContent:"space-between"}}><span>Tamaño logo del pie</span><span style={{color:"var(--gold)"}}>{localPerfil.pie_pagina_logo_scale||100}%</span></div><input type="range" min="50" max="200" step="5" value={localPerfil.pie_pagina_logo_scale||100} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_logo_scale:parseInt(e.target.value,10)});});}} style={{width:"100%",accentColor:"var(--gold)"}}/></>}
                          <label style={{display:"flex",alignItems:"center",gap:7,marginTop:8,padding:"8px 9px",borderRadius:8,border:"1px solid var(--border)",background:localPerfil.pie_pagina_numero_activo!==false?"rgba(255,255,255,.025)":"transparent",cursor:"pointer",fontSize:10.8,color:"var(--text)"}}><input type="checkbox" checked={localPerfil.pie_pagina_numero_activo!==false} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_numero_activo:e.target.checked});});}}/> Mostrar número de página</label>
                          {localPerfil.pie_pagina_numero_activo!==false&&<><div style={{fontSize:10.5,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:10,marginBottom:6}}>Posición del número</div><div style={{display:"flex",gap:5}}>{[{v:"izquierda",l:"Izquierda"},{v:"centro",l:"Centro"},{v:"derecha",l:"Derecha"}].map(function(o){var sel=(localPerfil.pie_pagina_numero_posicion||"derecha")===o.v;return <button key={o.v} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_numero_posicion:o.v});});}} style={{flex:1,padding:"6px 4px",fontSize:10.5,borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.12)":"transparent",color:sel?"var(--gold)":"var(--dim)"}}>{o.l}</button>;})}</div></>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:9,paddingTop:2}}><Btn v="success" s="sm" onClick={savePerfil} disabled={perfilSaveStatus==="saving"}>{perfilSaveStatus==="saving"?"Guardando…":"Guardar apariencia ✓"}</Btn>{perfilSaveStatus==="saved"&&<span style={{fontSize:10.5,color:"var(--green)",fontWeight:600}}>✓ Guardado</span>}</div>
                      </div>
                      <div className="card" style={{padding:14,position:"sticky",top:10}}><div style={{fontSize:13.5,fontFamily:"DM Serif Display,serif",color:"var(--text)",marginBottom:3}}>Vista previa en tiempo real</div><div style={{fontSize:10.5,color:"var(--dim)",marginBottom:10}}>Primera hoja · {TIPOS[tipoDocSel]||tipoDocSel}. Todo lo que cambies a la izquierda se refleja acá.</div><CuentaDocumentoPreview/></div>
                    </div>

                  </div>
                </div>
          </div>}
          {plantillaVista==="modelos"&&<>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="card" style={{padding:14}}>
              <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12,marginBottom:10,flexWrap:"wrap"}}>
                <div><div style={{fontSize:10.2,color:"var(--dim)",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>Modelo de documento</div><div style={{fontSize:11,color:"var(--dim)",marginTop:3}}>Elegí qué tipo de documento querés configurar.</div></div>
                <SmallPill tone="gold">{TIPOS[tipoDocSel]}</SmallPill>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:7}}>
                {PLANTILLA_TIPOS.map(function(tipo){
                  var cfg=obtenerPlantillaConfig(perfil,tipo,clausulas);
                  var active=tipo===tipoDocSel;
                  var count=cfg.clausulas_ids.length;
                  return <button key={tipo} onClick={function(){setTipoDocSel(tipo);setPlantillaSubtab("clausulas");setPlantillaForm(null);setDragClausulaId(null);setEncabezadoEditing(false);setConfiguracionPlantillaAbierta(false);setMostrarPreviewConfiguracion(false);setMostrarBloquesConfiguracion(false);}} style={{display:"flex",alignItems:"center",gap:9,width:"100%",minHeight:54,border:active?"1px solid rgba(212,168,83,.42)":"1px solid var(--border)",borderRadius:10,padding:"8px 10px",background:active?"rgba(212,168,83,.10)":"rgba(255,255,255,.012)",color:active?"var(--text)":"var(--muted)",cursor:"pointer",textAlign:"left",boxShadow:active?"0 4px 14px rgba(0,0,0,.08)":"none"}}>
                    <span style={{width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:active?"rgba(212,168,83,.14)":"rgba(148,163,184,.07)",fontSize:16,flexShrink:0}}>{TIPO_ICON[tipo]||"📄"}</span>
                    <span style={{minWidth:0,flex:1}}><span style={{display:"block",fontSize:11.2,fontWeight:active?650:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{TIPOS[tipo]}</span><span style={{display:"block",fontSize:9.5,color:cfg.locked?"var(--green)":"var(--dim)",marginTop:2}}>{cfg.locked?"🔒 Protegida":""}{cfg.locked?" · ":""}{count} cláusulas</span></span>
                  </button>;
                })}
              </div>
            </div>
            {/* Introducción del modelo seleccionado */}
            <div className="card" style={{padding:14}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:8}}>
                <div>
                  <div style={{fontSize:10.2,color:"var(--dim)",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>Introducción del documento</div>
                  <div style={{fontSize:11,color:"var(--dim)",marginTop:3,lineHeight:1.45}}>Preámbulo legal de <strong style={{color:"var(--text)"}}>{TIPOS[tipoDocSel]||tipoDocSel}</strong> (ej. “Recibimos de…”). Editable por tipo · tokens clicables · IA.</div>
                </div>
                <span className="badge" style={{background:customTextoPreview?"rgba(212,168,83,.10)":"rgba(74,222,128,.08)",color:customTextoPreview?"var(--gold)":"var(--green)"}}>{customTextoPreview?"Personalizado":"Predeterminado"}</span>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:12,color:"var(--text)",cursor:"pointer"}}>
                <input type="checkbox" checked={localPerfil.mostrar_introduccion!==false} onChange={function(e){var next=Object.assign({},localPerfil,{mostrar_introduccion:e.target.checked});setLocalPerfil(next);persistirPerfil(next);}}/>
                <span><strong>Mostrar introducción</strong> en los documentos generados</span>
              </label>
              {puedeEditarPlantillas&&!encabezadoEditing&&(
                <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginBottom:8}}>
                  <button type="button" onClick={function(){setEncabezadoDraft(getEncabezadoTemplate(tipoDocSel, localPerfil));setEncabezadoEditing(true);}} style={{height:30,padding:"0 10px",borderRadius:8,border:"1px solid rgba(212,168,83,.25)",background:"rgba(212,168,83,.07)",color:"var(--gold)",cursor:"pointer",fontSize:10.5}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:6}}><DWIcon name="edit" size={13}/>Editar introducción</span>
                  </button>
                  {customTextoPreview&&(
                    <button type="button" onClick={function(){var mapa=Object.assign({},customMapPreview);delete mapa[tipoDocSel];var next=Object.assign({},localPerfil,{encabezados_custom:mapa});setLocalPerfil(next);persistirPerfil(next).then(function(res){if(!(res&&res.error)){setEncabezadoDraft("");setEncabezadoEditing(false);}});}} style={{height:30,padding:"0 10px",borderRadius:8,border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",cursor:"pointer",fontSize:10.5}}>Restablecer</button>
                  )}
                </div>
              )}
              {encabezadoEditing&&(
                <EncabezadoEditor
                  tipo={tipoDocSel}
                  value={encabezadoDraft||getEncabezadoTemplate(tipoDocSel, localPerfil)}
                  onCancel={function(){setEncabezadoEditing(false);}}
                  onRestablecer={function(){
                    var mapa=Object.assign({},customMapPreview); delete mapa[tipoDocSel];
                    var next=Object.assign({},localPerfil,{encabezados_custom:mapa});
                    setLocalPerfil(next); persistirPerfil(next);
                    setEncabezadoDraft(DEFAULT_ENCABEZADOS[tipoDocSel]||"");
                  }}
                  onSave={function(texto){
                    var mapa=Object.assign({},customMapPreview,{[tipoDocSel]:texto});
                    var next=Object.assign({},localPerfil,{encabezados_custom:mapa});
                    setLocalPerfil(next);
                    return persistirPerfil(next).then(function(res){
                      if(!(res&&res.error)) setEncabezadoEditing(false);
                      return res;
                    });
                  }}
                />
              )}
              {!encabezadoEditing&&(
                <div style={{marginTop:4,padding:"9px 10px",borderRadius:8,background:"rgba(255,255,255,.025)",border:"1px solid var(--border2)",fontSize:10.8,color:"var(--muted)",lineHeight:1.5,whiteSpace:"pre-wrap"}}>
                  {sustituirTokens(customTextoPreview||DEFAULT_ENCABEZADOS[tipoDocSel]||"Sin introducción predeterminada para este tipo.", SAMPLE_OP_PREVIEW, localPerfil, tipoDocSel).slice(0,480)}
                  {(customTextoPreview||DEFAULT_ENCABEZADOS[tipoDocSel]||"").length>480?"…":""}
                </div>
              )}
            </div>

            {renderForm()}
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"5px 7px",borderBottom:"1px solid var(--border)",background:"rgba(148,163,184,.025)"}}>
                <div style={{display:"flex",gap:4,alignItems:"stretch",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                  <button type="button" onClick={function(){setPlantillaSubtab("clausulas");}} style={{flex:"0 0 auto",border:0,borderRadius:8,background:plantillaSubtab==="clausulas"?"var(--card)":"transparent",boxShadow:plantillaSubtab==="clausulas"?"0 1px 4px rgba(0,0,0,.10)":"none",color:plantillaSubtab==="clausulas"?"var(--text)":"var(--muted)",padding:"9px 13px",cursor:"pointer",fontSize:11.2,fontWeight:plantillaSubtab==="clausulas"?700:500,whiteSpace:"nowrap"}}>📑 Cláusulas</button>
                  <button type="button" onClick={function(){setPlantillaSubtab("cuerpo");}} style={{flex:"0 0 auto",border:0,borderRadius:8,background:plantillaSubtab==="cuerpo"?"var(--card)":"transparent",boxShadow:plantillaSubtab==="cuerpo"?"0 1px 4px rgba(0,0,0,.10)":"none",color:plantillaSubtab==="cuerpo"?"var(--text)":"var(--muted)",padding:"9px 13px",cursor:"pointer",fontSize:11.2,fontWeight:plantillaSubtab==="cuerpo"?700:500,whiteSpace:"nowrap"}}>✍️ Cuerpo del documento</button>
                </div>
              </div>
              <div style={{padding:13}}>
                {plantillaSubtab==="clausulas"&&<div>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                    <div><div style={{fontSize:10.7,color:"var(--dim)",marginTop:3}}>{TIPOS[tipoDocSel]} · {listaPlantilla.length} cláusula{listaPlantilla.length===1?"":"s"}</div></div>
                    {defaultsLocked&&<SmallPill tone="green">🔒 Fijada</SmallPill>}
                  </div>
                  <div style={{fontSize:10.5,color:"var(--dim)",lineHeight:1.5,margin:"9px 0 11px"}}>La plantilla define el documento completo: qué cláusulas tiene y en qué orden.</div>
                  {listaPlantilla.length===0?<div style={{padding:24,textAlign:"center",border:"1px dashed var(--border)",borderRadius:10,color:"var(--dim)",fontSize:11}}>Esta plantilla todavía no tiene cláusulas.</div>:<div style={{display:"flex",flexDirection:"column",gap:7}}>{listaPlantilla.map(function(c,i){return <ClauseCard key={c.id} c={c} index={i}/>;})}</div>}
                  {puedeAgregar&&<div style={{marginTop:12,paddingTop:11,borderTop:"1px solid var(--border)"}}>
                    <div style={{fontSize:10.2,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Agregar cláusula existente</div>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}><select className="inp" style={{flex:1,minWidth:0}} defaultValue="" onChange={function(e){if(e.target.value){agregarClausula(e.target.value);e.target.value="";}}}><option value="">Seleccioná una cláusula de la Biblioteca…</option>{disponibles.map(function(c){return <option key={c.id} value={c.id}>{(c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título"}{CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;})?" · Estándar":" · Propia"}</option>;})}</select><Btn s="sm" onClick={nuevaClausula}>＋ Nueva</Btn></div>
                  </div>}
                </div>}

                {plantillaSubtab==="cuerpo"&&<div className="card" style={{padding:14,marginTop:10}}>
                  <div style={{fontSize:14,fontFamily:"DM Serif Display,serif",color:"var(--text)",marginBottom:4}}>Cuerpo del documento</div>
                  <div style={{fontSize:10.8,color:"var(--dim)",lineHeight:1.5,marginBottom:12}}>Modificá el contenido del documento sin alterar los datos que se completan automáticamente desde Operaciones.</div>
                  {bloquesError&&<div style={{marginBottom:10,padding:"8px 10px",borderRadius:8,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.25)",color:"var(--red)",fontSize:11.2}}>{bloquesError}</div>}
                  {bloquesLoading&&bloquesReserva.length===0&&<div style={{fontSize:11.5,color:"var(--dim)"}}>Cargando bloques…</div>}
                  {tipoDocSel==="reserva" ? ((!bloquesLoading||bloquesReserva.length>0)&&<ReservaBloquesPanel bloques={Array.isArray(bloquesReserva)?bloquesReserva:[]} onUpdate={onUpdateBloqueReserva} onMove={onMoveBloqueReserva} clausulasLib={Array.isArray(clausulas)?clausulas:[]} operaciones={Array.isArray(operaciones)?operaciones:[]} puedeEditar={puedeEditarPlantillas}/>) : <CuerpoPlantillaPanel perfil={perfil} tipo={tipoDocSel} puedeEditar={puedeEditarPlantillas} onChange={guardarPerfil} />}
                </div>}
              </div>
              {puedeEditarPlantillas&&<div style={{display:"flex",justifyContent:"flex-end",gap:7,marginTop:10}}>{defaultsLocked?<button onClick={desbloquearPlantilla} style={{height:32,padding:"0 12px",borderRadius:8,border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",cursor:"pointer",fontSize:10.7}}>Desbloquear para modificar</button>:<button onClick={finalizarPlantilla} disabled={!idsPlantilla.length} style={{height:32,padding:"0 12px",borderRadius:8,border:"1px solid rgba(74,222,128,.22)",background:idsPlantilla.length?"rgba(74,222,128,.08)":"rgba(255,255,255,.02)",color:idsPlantilla.length?"var(--green)":"var(--dim)",cursor:idsPlantilla.length?"pointer":"not-allowed",fontSize:10.7,fontWeight:650}}>🔒 Finalizar y bloquear plantilla</button>}</div>}
            </div>
          </div>
          </>}
          {confirmLockDefaults&&<Modal open={true} onClose={function(){setConfirmLockDefaults(false);}} title="Fijar plantilla">
            <div style={{fontSize:12.5,color:"var(--muted)",lineHeight:1.55,marginBottom:15}}>Vas a fijar <b style={{color:"var(--text)"}}>{listaPlantilla.length}</b> cláusulas para <b style={{color:"var(--text)"}}>{TIPOS[tipoDocSel]}</b>. El asesor seguirá pudiendo usar la plantilla al crear operaciones, pero la configuración protegida no aparecerá mezclada en su Biblioteca de Cláusulas.</div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:7}}><Btn v="ghost" onClick={function(){setConfirmLockDefaults(false);}}>Cancelar</Btn><Btn v="success" onClick={confirmarBloqueo}>Fijar plantilla</Btn></div>
          </Modal>}
        </div>;
      })()}

      {/* ── TAB: AUDITORÍA (registro detallado e inmutable) ── */}
      {tab==="auditoria"&&(function(){
        var auditLog=(auditoriaSupabase&&auditoriaSupabase.entries)||[];
        var entries=auditLog.filter(function(en){
          if(auditAccion!=="todas"&&en.accion!==auditAccion)return false;
          if(auditEntidad!=="todas"&&en.entidadTipo!==auditEntidad)return false;
          if(!auditQuery.trim())return true;
          var q=auditQuery.toLowerCase();
          return [en.actorNombre,en.actorEmail,en.clausulaTitulo,en.entidadLabel].some(function(v){return v&&String(v).toLowerCase().includes(q);});
        });
        var ACCION_LABEL={crear:"Creó",editar:"Editó",eliminar:"Eliminó",restaurar:"Restauró",importar:"Importó respaldo"};
        var ACCION_COLOR={crear:"var(--green)",editar:"var(--gold)",eliminar:"var(--red)",restaurar:"var(--teal)",importar:"var(--teal)"};
        function resumenCambio(en){
          if(!en.cambios||!en.cambios.length)return "Sin detalle de campos.";
          if(en.cambios.length===1)return en.cambios[0].label+" modificado";
          return en.cambios.length+" campos modificados";
        }
        function cajaValor(v,vacio){
          return <div style={{padding:"9px 10px",borderRadius:8,border:"1px solid var(--border2)",background:vacio?"rgba(255,255,255,.018)":"var(--input)",color:vacio?"var(--dim)":"var(--text)",fontSize:11.2,lineHeight:1.5,whiteSpace:"pre-wrap",wordBreak:"break-word",maxHeight:220,overflowY:"auto"}}>{v||"(vacío)"}</div>;
        }
        return <div>
          <div className="card" style={{padding:"16px 18px",marginBottom:10,borderRadius:14,background:"linear-gradient(180deg,rgba(212,168,83,.055),rgba(212,168,83,.018))"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
              <div>
                <div style={{fontFamily:"DM Serif Display,serif",fontSize:17,color:"var(--text)"}}>Auditoría</div>
                <div style={{fontSize:10.8,color:"var(--dim)",marginTop:3}}>Acá ves únicamente qué cambió, quién lo cambió y cuándo.</div>
              </div>
              <span className="badge" style={{background:"rgba(74,222,128,.08)",color:"var(--green)"}}>● Registro de cambios</span>
            </div>
          </div>
          {auditoriaSupabase&&auditoriaSupabase.error&&<div style={{marginBottom:10,padding:"9px 12px",borderRadius:9,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.25)",color:"var(--red)",fontSize:12}}>{auditoriaSupabase.error}</div>}
          <div className="card" style={{display:"flex",gap:7,marginBottom:12,padding:10,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{flex:"1 1 180px",minWidth:160}}><input className="inp" value={auditQuery} onChange={function(e){setAuditQuery(e.target.value);}} placeholder="Buscar…" style={{height:38,boxSizing:"border-box",padding:"7px 10px",fontSize:13}}/></div>
            <Slt value={auditEntidad} onChange={function(e){setAuditEntidad(e.target.value);}} style={{minWidth:125}}><option value="todas">Todos los módulos</option><option value="clausula">Cláusulas</option><option value="bloque">Bloques</option><option value="operacion">Operaciones</option><option value="plantilla">Plantillas</option><option value="configuracion">Configuración</option><option value="usuario">Usuarios</option></Slt>
            <Slt value={auditAccion} onChange={function(e){setAuditAccion(e.target.value);}} style={{minWidth:125}}><option value="todas">Todas las acciones</option><option value="crear">Creaciones</option><option value="editar">Ediciones</option><option value="eliminar">Eliminaciones</option><option value="restaurar">Restauraciones</option><option value="importar">Importaciones</option></Slt>
          </div>
          {entries.length===0&&<div className="card" style={{padding:28,textAlign:"center"}}><p style={{color:"var(--dim)",fontSize:12.5,margin:0}}>{auditoriaSupabase&&auditoriaSupabase.loading?"Cargando…":(auditLog.length===0?"Todavía no hay movimientos registrados.":"No hay resultados para ese filtro.")}</p></div>}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {entries.map(function(en){
              var abierta=auditExpandida===en.id;
              var cambios=en.cambios||[];
              var etiquetas=cambios.map(function(c){return c.label;});
              var resumen=etiquetas.length?etiquetas.join(" · "):"Sin detalle";
              return <div key={en.id} className="card" style={{padding:"10px 12px",borderColor:abierta?"rgba(212,168,83,.30)":"var(--border)"}}>
                <button type="button" onClick={function(){setAuditExpandida(abierta?null:en.id);}} style={{width:"100%",border:0,background:"transparent",padding:0,color:"inherit",cursor:cambios.length?"pointer":"default",textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 7px",borderRadius:15,color:ACCION_COLOR[en.accion]||"var(--muted)",background:"rgba(148,163,184,.08)"}}>{ACCION_LABEL[en.accion]||en.accion}</span>
                    <span style={{fontSize:11.8,fontWeight:650,color:"var(--text)"}}>{en.clausulaTitulo||en.entidadLabel||"Registro"}</span>
                    <span style={{fontSize:10.5,color:"var(--dim)"}}>· {en.entidadLabel}</span>
                    <span style={{fontSize:10.5,color:"var(--dim)",marginLeft:"auto"}}>{new Date(en.ts).toLocaleString("es-AR")}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5,flexWrap:"wrap"}}>
                    <span style={{fontSize:10.8,color:"var(--muted)"}}>Por <b style={{color:"var(--text)"}}>{en.actorNombre}</b></span>
                    <span style={{fontSize:10.5,color:"var(--gold)"}}>· Ver detalle</span>
                    <span style={{fontSize:10,color:"var(--dim)"}}>{abierta?"▲":"▼"}</span>
                  </div>
                </button>
                {abierta&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)"}}>
                  <div style={{fontSize:9.5,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:7}}>Qué se hizo</div>
                  <div style={{padding:"10px 12px",borderRadius:9,border:"1px solid var(--border2)",background:"rgba(255,255,255,.018)",fontSize:12.5,color:"var(--text)",lineHeight:1.5}}>
                    {ACCION_LABEL[en.accion]||en.accion} {en.entidadTipo==="clausula"?"la cláusula":"el registro"} <b style={{color:"var(--gold)"}}>«{en.clausulaTitulo||en.entidadLabel||"Sin nombre"}»</b>.
                  </div>
                </div>}
              </div>;
            })}
          </div>
        </div>;
      })()}

      {/* ── TAB: FACTURACIÓN ── */}
      {tab==="facturacion"&&puedeVerFacturacion&&<div>
        {function(){
          var fact=localPerfil.facturacion||{};
          var historial=Array.isArray(fact.historial)?fact.historial:[];
          var metodo=fact.metodo_pago||"No configurado";
          var estado=fact.estado_pago||"al día";
          var plan=fact.plan_nombre||"Plan actual";
          var venc=fact.proximo_vencimiento||"—";
          var monto=fact.monto_mensual||"—";
          function guardarFact(changes){
            var next=Object.assign({},localPerfil,{facturacion:Object.assign({},fact,changes)});
            setLocalPerfil(next); return onChange(next);
          }
          var estadoTone=estado==="al día"||estado==="pagado"?"green":estado==="pendiente"?"amber":"red";
          return <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="card" style={{padding:18,borderRadius:16,background:"linear-gradient(135deg,rgba(212,168,83,.09),rgba(255,255,255,.015))"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div><div style={{fontSize:10.5,color:"var(--gold)",fontWeight:750,textTransform:"uppercase",letterSpacing:".1em"}}>Cuenta profesional</div><div style={{fontFamily:"DM Serif Display,serif",fontSize:21,color:"var(--text)",marginTop:4}}>Facturación y suscripción</div><div style={{fontSize:11,color:"var(--dim)",marginTop:4}}>Administrá el plan de tu inmobiliaria, medios de pago, comprobantes y estado de la suscripción.</div></div>
                <div style={{padding:"7px 10px",borderRadius:10,border:"1px solid rgba(212,168,83,.25)",background:"rgba(212,168,83,.07)",color:"var(--gold)",fontSize:11,fontWeight:700}}>🔒 Acceso Dueño / Administrador</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:9}}>
              {[{l:"Plan",v:plan,i:"✦"},{l:"Estado",v:estado,i:"✓"},{l:"Próximo cobro",v:venc,i:"📅"},{l:"Importe mensual",v:monto,i:"$"}].map(function(k){return <div key={k.l} className="op-card" style={{padding:14}}><div style={{fontSize:16,color:"var(--gold)"}}>{k.i}</div><div style={{fontSize:9.8,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".07em",marginTop:7}}>{k.l}</div><div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginTop:3}}>{k.v}</div></div>;})}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.15fr) minmax(280px,.85fr)",gap:12,alignItems:"start"}}>
              <div className="card" style={{padding:16}}>
                <div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)",marginBottom:4}}>💳 Medio de pago</div>
                <div style={{fontSize:10.8,color:"var(--dim)",marginBottom:12}}>El medio elegido se guarda como referencia. DocWorks no debe almacenar números completos de tarjeta.</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:7}}>
                  {["Tarjeta de crédito","Tarjeta de débito","Transferencia bancaria"].map(function(m){var sel=metodo===m;return <button key={m} type="button" onClick={function(){guardarFact({metodo_pago:m});}} style={{textAlign:"left",padding:11,borderRadius:10,border:sel?"1px solid rgba(212,168,83,.5)":"1px solid var(--border)",background:sel?"rgba(212,168,83,.09)":"rgba(255,255,255,.015)",color:sel?"var(--gold)":"var(--text)",cursor:"pointer"}}><div style={{fontSize:17}}>{m.indexOf("Tarjeta")===0?"💳":"🏦"}</div><div style={{fontSize:10.8,fontWeight:650,marginTop:5}}>{m}</div>{sel&&<div style={{fontSize:9.5,color:"var(--green)",marginTop:4}}>✓ Seleccionado</div>}</button>;})}
                </div>
                <div style={{marginTop:12,padding:12,borderRadius:10,background:"rgba(74,222,128,.045)",border:"1px solid rgba(74,222,128,.15)"}}><div style={{fontSize:10.5,fontWeight:700,color:"var(--green)"}}>🔐 Mercado Pago conectado</div><div style={{fontSize:10,color:"var(--dim)",marginTop:3,lineHeight:1.45}}>El pago se procesa en Mercado Pago. DocWorks guarda únicamente identificadores, estados y referencias; nunca números completos de tarjeta.</div><button type="button" className="btn btn-primary" style={{marginTop:10,width:"100%"}} onClick={async function(){try{var code=fact.plan_codigo||localPerfil.plan_codigo||localPerfil.plan||"profesional";var r=await docworksMercadoPago("create_checkout",{plan_codigo:code,payer_email:fact.email||localPerfil.email||"" ,back_url:window.location.href});if(r.init_point){window.location.href=r.init_point;}else{throw new Error("Mercado Pago no devolvió el enlace para continuar con el pago.");}}catch(e){dwNotify("error",traducirError(e&&e.message?e.message:String(e)));}}}>Continuar con Mercado Pago →</button><button type="button" className="btn btn-secondary" style={{marginTop:7,width:"100%"}} onClick={async function(){try{var r=await docworksMercadoPago("sync",{});if(r.subscription){var s=r.subscription;var next=Object.assign({},localPerfil,{facturacion:Object.assign({},fact,{estado_pago:s.status||fact.estado_pago,proximo_vencimiento:s.next_payment_date||fact.proximo_vencimiento,metodo_pago:s.payment_method_id||fact.metodo_pago})});setLocalPerfil(next);onChange(next);dwNotify("success","Estado de Mercado Pago actualizado.");}else{dwNotify("info","Todavía no hay una suscripción de Mercado Pago asociada.");}}catch(e){dwNotify("error",traducirError(e&&e.message?e.message:String(e)));}}}>↻ Actualizar estado</button></div>
              </div>

              <div className="card" style={{padding:16}}>
                <div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)",marginBottom:8}}>🧾 Datos de facturación</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <label style={{fontSize:10.5,color:"var(--dim)"}}>Razón social / nombre comercial<input className="inp" style={{marginTop:4}} value={fact.razon_social||localPerfil.nombre||""} onChange={function(e){guardarFact({razon_social:e.target.value});}} /></label>
                  <label style={{fontSize:10.5,color:"var(--dim)"}}>CUIT<input className="inp" style={{marginTop:4}} value={fact.cuit||""} onChange={function(e){guardarFact({cuit:e.target.value});}} placeholder="20-12345678-3" /></label>
                  <label style={{fontSize:10.5,color:"var(--dim)"}}>Correo electrónico de facturación<input className="inp" style={{marginTop:4}} value={fact.email||localPerfil.email||""} onChange={function(e){guardarFact({email:e.target.value});}} placeholder="administracion@inmobiliaria.com" /></label>
                  <label style={{fontSize:10.5,color:"var(--dim)"}}>Tipo de comprobante<select className="inp" style={{marginTop:4}} value={fact.comprobante||"Factura"} onChange={function(e){guardarFact({comprobante:e.target.value});}}><option>Factura</option><option>Factura A</option><option>Factura B</option><option>Factura C</option></select></label>
                </div>
              </div>
            </div>

            <div className="card" style={{padding:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10,flexWrap:"wrap"}}><div><div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)"}}>📋 Historial de cobros</div><div style={{fontSize:10.5,color:"var(--dim)",marginTop:3}}>Comprobantes y estados de cada período.</div></div><SABadge tone={estadoTone}>{estado}</SABadge></div>
              {historial.length===0?<div style={{padding:"22px 12px",textAlign:"center",border:"1px dashed var(--border)",borderRadius:10,color:"var(--dim)",fontSize:11}}>Todavía no hay cobros registrados en esta cuenta.<div style={{fontSize:9.8,marginTop:5}}>Cuando se conecte el sistema de pagos, cada cobro aparecerá automáticamente acá.</div></div>:<div style={{display:"flex",flexDirection:"column",gap:6}}>{historial.map(function(h,i){return <div key={h.id||i} className="sa-detail-row"><div><b>{h.periodo||"Período"}</b><div style={{fontSize:10.5,color:"var(--dim)",marginTop:2}}>{h.metodo_pago||"—"} · {h.comprobante||"Comprobante"}</div></div><div style={{display:"flex",alignItems:"center",gap:8}}><b>{h.monto||"—"}</b><SABadge tone={h.estado==="pagado"||h.estado==="aprobado"?"green":h.estado==="rechazado"?"red":"amber"}>{h.estado||"pendiente"}</SABadge></div></div>;})}</div>}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:9}}>
              <div className="op-card" style={{padding:14}}><div style={{fontSize:15}}>📄</div><div style={{fontWeight:700,fontSize:12,marginTop:6}}>Comprobantes</div><div style={{fontSize:10,color:"var(--dim)",marginTop:3}}>Los cobros confirmados por Mercado Pago quedan registrados automáticamente en el historial.</div><button type="button" className="btn btn-secondary" style={{marginTop:9}} onClick={function(){dwNotify("info","Los comprobantes se habilitan a medida que Mercado Pago confirma los cobros.");}}>Ver historial</button></div>
              <div className="op-card" style={{padding:14}}><div style={{fontSize:15}}>🔔</div><div style={{fontWeight:700,fontSize:12,marginTop:6}}>Alertas de facturación</div><div style={{fontSize:10,color:"var(--dim)",marginTop:3}}>Avisos por vencimiento, pago rechazado o renovación.</div><label style={{display:"flex",alignItems:"center",gap:7,fontSize:10.5,marginTop:9}}><input type="checkbox" checked={fact.alertas!==false} onChange={function(e){guardarFact({alertas:e.target.checked});}}/> Recibir alertas</label></div>
              <div className="op-card" style={{padding:14}}><div style={{fontSize:15}}>🛟</div><div style={{fontWeight:700,fontSize:12,marginTop:6}}>Soporte de facturación</div><div style={{fontSize:10,color:"var(--dim)",marginTop:3}}>Ayuda con pagos, comprobantes o cambios de plan.</div><button type="button" className="btn btn-secondary" style={{marginTop:9}} onClick={function(){alert("Soporte de facturación: configurá aquí el canal de atención de DocWorks.");}}>Contactar soporte</button></div>
            </div>
          </div>;
        }()}
      </div>}

      {/* ── TAB: HISTORIAL DEL EQUIPO ── */}
      {tab==="historial"&&(function(){
        var filteredOps=operaciones.filter(function(o){
          if(histBroker!=="todos"&&o.broker_id!==histBroker)return false;
          if(histEstado!=="todos"&&o.estado!==histEstado)return false;
          return true;
        });
        var statsPorMiembro=equipo.map(function(m){
          var misOps=operaciones.filter(function(o){return o.broker_id===m.id;});
          return {
            miembro:m,
            total:misOps.length,
            activas:misOps.filter(function(o){return o.estado==="activo";}).length,
            cerradas:misOps.filter(function(o){return o.estado==="cerrado";}).length,
            borrador:misOps.filter(function(o){return o.estado==="borrador";}).length,
            volumen:misOps.reduce(function(s,o){
              var v=o.tipo==="alquiler"?parseFloat(o.alquiler_monto_inicial||0):parseFloat(o.precio||0);
              return s+(isNaN(v)?0:v);
            },0),
          };
        }).sort(function(a,b){return b.total-a.total;});

        return(
          <div>
            <div style={{fontSize:13,color:"var(--muted)",marginBottom:18}}>Vista general de la gestión y desempeño de cada miembro del equipo.</div>

            {/* Resumen por miembro */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12,marginBottom:24}}>
              {statsPorMiembro.map(function(s){
                return(
                  <div key={s.miembro.id} className="card" style={{padding:16,cursor:"pointer",border:histBroker===s.miembro.id?"1px solid var(--gold)":undefined}}
                    onClick={function(){setHistBroker(histBroker===s.miembro.id?"todos":s.miembro.id);}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#1e2d42,#162032)",border:"1px solid var(--border2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:600,color:"var(--text)",overflow:"hidden",flexShrink:0}}>
                        {s.miembro.fotoDataUrl?<img src={s.miembro.fotoDataUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:(s.miembro.nombre[0]?.toUpperCase()||"?")}
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.miembro.nombre}</div>
                        <div style={{fontSize:10.5,color:"var(--dim)"}}>{ROLES_DEF[s.miembro.rol]?.label||s.miembro.rol}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:4}}>
                      <span>{s.total} operaciones</span>
                      <span style={{color:"var(--green)"}}>{s.activas} activas</span>
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:"var(--gold)",fontFamily:"DM Serif Display,serif"}}>
                      {s.volumen>0?("U$D "+s.volumen.toLocaleString("es-AR")):"—"}
                    </div>
                  </div>
                );
              })}
              {statsPorMiembro.length===0&&<div style={{fontSize:13,color:"var(--dim)"}}>Aún no hay miembros en el equipo.</div>}
            </div>

            {/* Filtros */}
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Filtrar:</div>
              <Slt value={histBroker} onChange={function(e){setHistBroker(e.target.value);}} style={{minWidth:160}}>
                <option value="todos">Todos los miembros</option>
                {equipo.map(function(m){return <option key={m.id} value={m.id}>{m.nombre}</option>;})}
              </Slt>
              <Slt value={histEstado} onChange={function(e){setHistEstado(e.target.value);}} style={{minWidth:140}}>
                <option value="todos">Todos los estados</option>
                <option value="borrador">Nuevas / Borrador</option>
                <option value="activo">Activas</option>
                <option value="cerrado">Cerradas</option>
              </Slt>
              {(histBroker!=="todos"||histEstado!=="todos")&&<Btn v="ghost" s="sm" onClick={function(){setHistBroker("todos");setHistEstado("todos");}}>✕ Limpiar</Btn>}
            </div>

            {/* Tabla de operaciones */}
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{maxHeight:420,overflowY:"auto"}}>
                {filteredOperacioneslength===0&&<div style={{padding:24,textAlign:"center",fontSize:13,color:"var(--dim)"}}>No hay operaciones que coincidan con el filtro.</div>}
                {filteredOperacionesslice().sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);}).map(function(o,i,arr){
                  var miembro=equipo.find(function(m){return m.id===o.broker_id;});
                  return(
                    <div key={o.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid var(--border)":"none"}}>
                    <span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:"rgba(212,168,83,0.12)",color:"var(--gold)"}}>{TIPOS[o.tipo]||o.tipo}</span>
                    <span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:o.estado==="activo"?"rgba(74,222,128,0.12)":o.estado==="cerrado"?"rgba(100,116,139,0.15)":"rgba(251,191,36,0.12)",color:o.estado==="activo"?"var(--green)":o.estado==="cerrado"?"var(--muted)":"var(--gold)"}}>{ESTADOS[o.estado]||o.estado}</span>
                      <div style={{flex:1,minWidth:0,fontSize:12.5,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {o.inmueble_direccion||"Sin dirección"}
                      </div>
                      <div style={{fontSize:11.5,color:"var(--muted)",flexShrink:0}}>{miembro?miembro.nombre:"—"}</div>
                      <div style={{fontSize:11,color:"var(--dim)",flexShrink:0,width:80,textAlign:"right"}}>{new Date(o.created_at).toLocaleDateString("es-AR")}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
      <ConfirmModal
        open={!!confirmDelMiembro}
        title="Cancelar invitación"
        message={confirmDelMiembro?"¿Cancelar la invitación a "+confirmDelMiembro.email+"? Esta acción no se puede deshacer.":""}
        confirmLabel="Cancelar invitación"
        danger={true}
        onCancel={function(){setConfirmDelMiembro(null);}}
        onConfirm={function(){equipoSupabase.cancelarInvitacion(confirmDelMiembro._invId);setConfirmDelMiembro(null);}}
      />
    </div>
  );
}

const DEFAULT_PERFIL={nombre:"",nombre_usuario:"",matricula:"",telefono:"",email:"",logoDataUrl:"",logoPosicion:"derecha",logoScale:100,cuit:"",direccion:"",web:"",ubicacion_inmobiliaria_activa:false,ubicacion_inmobiliaria_posicion:"pie",rol:"dueno",pie_pagina_texto:"",pie_pagina_leyenda_activa:true,pie_pagina_logo_debajo:false,pie_pagina_logo_posicion:"centro",pie_pagina_logo_scale:100,pie_pagina_numero_activo:true,pie_pagina_numero_posicion:"derecha",broker_split_pct:50,broker_split_mode:"uniforme",broker_splits:{},ranking_interno_activo:false,clausulas_default_ids:[],plantillas:{},colorPrimario:"#142a4d",colorSecundario:"#c9a227",plantillaEstilo:"corporativo",logo_encabezado_activo:true,encabezados_custom:{}};

// ── ESTILOS DE PLANTILLA (personalización por inmobiliaria) ─────────────────
// 3 estilos posibles para PDF/DOCX: minimalista (sobrio, mucho blanco, acento
// fino), corporativo (barra de color de marca, rótulos en color) y clásico
// (tipografía serif, doble filete, sin color — estilo escribanía tradicional).
const PLANTILLA_ESTILOS = [
  {id:"minimalista",label:"Minimalista",desc:"Sobrio, mucho blanco, detalles finos",icon:"◽"},
  {id:"corporativo",label:"Corporativo",desc:"Con el color de marca de tu inmobiliaria",icon:"◆"},
  {id:"clasico",     label:"Clásico",    desc:"Tipografía serif, estilo escribanía",icon:"§"},
];
function hexToRgb01(hex){
  var h=(hex||"").replace("#","");
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length!==6) h="14213d";
  var r=parseInt(h.substr(0,2),16)/255, g=parseInt(h.substr(2,2),16)/255, b=parseInt(h.substr(4,2),16)/255;
  return {r:r,g:g,b:b};
}
function rgbPdfStr(c){ return c.r.toFixed(3)+" "+c.g.toFixed(3)+" "+c.b.toFixed(3); }
// Mezcla un color con blanco para obtener un tinte suave (fondos, líneas leves).
function tintRgb(c,amount){ return {r:c.r+(1-c.r)*amount, g:c.g+(1-c.g)*amount, b:c.b+(1-c.b)*amount}; }
function hexToDocx(hex){
  var h=(hex||"").replace("#","");
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length!==6) h="14213D";
  return h.toUpperCase();
}
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
var AUTH_BG     = "var(--bg,#f1f5f9)";
var AUTH_CARD   = "var(--surface,#ffffff)";
var AUTH_BORDER = "var(--border2,rgba(0,0,0,0.13))";
var AUTH_TEXT   = "var(--text,#0f172a)";
var AUTH_MUTED  = "var(--muted,#3f4c5e)";
var AUTH_GOLD   = "var(--gold,#d4a853)";
var AUTH_RED    = "var(--red,#f87171)";

function AuthLoadingScreen({ error, onRetry }){
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:AUTH_BG,color:AUTH_TEXT,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:"center",fontSize:13,maxWidth:320,padding:16}}>
        {error ? (
          <>
            <div style={{fontSize:26,marginBottom:10}}>⚠️</div>
            <div style={{color:AUTH_RED,fontWeight:600,marginBottom:14}}>{error}</div>
            <button onClick={onRetry} style={{padding:"9px 16px",borderRadius:9,border:"1px solid "+AUTH_BORDER,background:"transparent",color:AUTH_TEXT,fontSize:13,cursor:"pointer"}}>Reintentar</button>
          </>
        ) : (
          <>
            <div style={{fontSize:26,marginBottom:10}}>⏳</div>
            <div style={{color:AUTH_MUTED}}>Conectando con DocWorks…</div>
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
  if (m.indexOf("load failed")>-1 || m.indexOf("failed to fetch")>-1 || m.indexOf("networkerror")>-1 || m.indexOf("network request failed")>-1) {
    return "No se pudo conectar con Supabase (error de red del navegador). Si abriste este archivo con doble clic desde tu disco, tenés que servirlo por http(s):// — los navegadores bloquean estos pedidos desde archivos locales. Si ya lo estás sirviendo por http(s), puede ser una extensión, VPN o firewall bloqueando xpjiydwjawjizubyldtk.supabase.co.";
  }
  if (m.indexOf("invalid login credentials")>-1) return "Correo electrónico o contraseña incorrectos.";
  if (m.indexOf("email not confirmed")>-1) return "Todavía no confirmaste tu correo electrónico.";
  if (m.indexOf("jwt expired")>-1 || m.indexOf("invalid jwt")>-1 || (m.indexOf("jwt")>-1 && m.indexOf("expired")>-1)) return "Tu sesión expiró. Iniciá sesión de nuevo.";
  if (m.indexOf("permission denied")>-1 || m.indexOf("new row violates row-level security")>-1 || m.indexOf("row-level security")>-1) return "No tenés permiso para realizar esta acción.";
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
// Alias histórico — mantiene compatibilidad con el nombre anterior.
function explicarErrorRed(msg){ return traducirError(msg); }


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
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:AUTH_BG,padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <form onSubmit={submit} style={{width:"100%",maxWidth:390,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,display:"flex",flexDirection:"column",gap:14,boxShadow:"0 8px 30px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:4}}>
          <img src={LOGO_B64} alt="DocWorks" style={{height:120,width:"auto",maxWidth:"300px",objectFit:"contain",marginBottom:8}}/>
          <div style={{fontSize:15,fontWeight:700,color:AUTH_TEXT}}>{mode==="invite"?"Activá tu cuenta":"Restablecé tu contraseña"}</div>
          <div style={{fontSize:12,color:AUTH_MUTED,marginTop:5,lineHeight:1.45}}>{mode==="invite"?"Elegí una contraseña para ingresar a DocWorks.":"Ingresá una nueva contraseña para recuperar el acceso."}</div>
        </div>
        {(error||localError)&&<div style={{fontSize:12.5,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600}}>{localError||error}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Nueva contraseña</label>
          <input type="password" minLength={8} required value={password} onChange={function(e){setPassword(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} />
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Repetir contraseña</label>
          <input type="password" minLength={8} required value={confirm} onChange={function(e){setConfirm(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} />
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
  var [telefono,setTelefono]=useState("");
  function submit(e){
    e.preventDefault();
    onSubmit({nombre:nombre.trim(),email:email.trim().toLowerCase(),inmobiliaria:inmobiliaria.trim(),telefono:telefono.trim()});
  }
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:AUTH_BG,padding:16,fontFamily:"'DM Sans',sans-serif",overflow:"auto"}}>
      <form onSubmit={submit} style={{width:"100%",maxWidth:410,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,display:"flex",flexDirection:"column",gap:13,boxShadow:"0 8px 30px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:5}}>
          <img src={LOGO_B64} alt="DocWorks" style={{height:130,width:"auto",maxWidth:"300px",objectFit:"contain",marginBottom:8}}/>
          <div style={{fontSize:16,fontWeight:700,color:AUTH_TEXT}}>Solicitá tu acceso</div>
          <div style={{fontSize:12.5,color:AUTH_MUTED,marginTop:5,lineHeight:1.45}}>Completá tus datos. Un administrador de DocWorks revisará la solicitud y, si la aprueba, te enviará la invitación para activar tu cuenta.</div>
        </div>
        {error&&<div style={{fontSize:12.5,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600,lineHeight:1.4}}>{error}</div>}
        {success&&<div style={{fontSize:12.5,color:"#15803d",background:"rgba(34,197,94,.10)",padding:"10px 12px",borderRadius:8,fontWeight:600,lineHeight:1.45}}>{success}</div>}
        {!success&&<>
          <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Nombre y apellido</label><input required value={nombre} onChange={function(e){setNombre(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} /></div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Correo electrónico</label><input type="email" required value={email} onChange={function(e){setEmail(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} /></div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Inmobiliaria</label><input required value={inmobiliaria} onChange={function(e){setInmobiliaria(e.target.value);}} placeholder="Nombre de la inmobiliaria" style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} /></div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Teléfono <span style={{fontWeight:400}}>(opcional)</span></label><input value={telefono} onChange={function(e){setTelefono(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} /></div>
          <button type="submit" disabled={loading} style={{marginTop:4,padding:"11px 14px",borderRadius:10,border:"none",background:AUTH_GOLD,color:"#1a1206",fontWeight:700,fontSize:14,cursor:loading?"default":"pointer",opacity:loading?.6:1}}>{loading?"Enviando solicitud…":"Enviar solicitud"}</button>
        </>}
        <button type="button" onClick={onBack} style={{background:"transparent",border:"none",color:AUTH_MUTED,cursor:"pointer",fontSize:12,textDecoration:"underline",padding:0}}>{success?"Volver al inicio de sesión":"Volver a iniciar sesión"}</button>
      </form>
    </div>
  );
}

function LoginScreen({ onLogin, onRecover, onRegister, error, loading, connError }){
  var [email,setEmail]=useState("");
  var [password,setPassword]=useState("");
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
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:AUTH_BG,padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <form onSubmit={submit} style={{width:"100%",maxWidth:380,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,display:"flex",flexDirection:"column",gap:14,boxShadow:"0 8px 30px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:6}}>
          <img src={LOGO_B64} alt="DocWorks" style={{height:190,width:"auto",maxWidth:"360px",objectFit:"contain",filter:"drop-shadow(0 0 32px rgba(212,168,83,0.6))",marginBottom:10}}/>
          <div style={{fontSize:12.5,color:AUTH_MUTED,marginTop:2}}>{recoverMode ? "Recuperá el acceso a tu cuenta" : "Iniciá sesión para continuar"}</div>
        </div>
        {esArchivoLocal && <div style={{fontSize:12,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600,lineHeight:1.4}}>⚠️ Estás abriendo este archivo directo desde tu disco (file://). El inicio de sesión no va a funcionar así — necesitás servirlo por http(s)://.</div>}
        {connError && <div style={{fontSize:12,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600,lineHeight:1.4}}>{connError}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Correo electrónico</label><input type="email" required value={email} onChange={function(e){setEmail(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} /></div>
        {!recoverMode && <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Contraseña</label><input type="password" required value={password} onChange={function(e){setPassword(e.target.value);}} style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} /></div>}
        {error && !recoverMode && <div style={{fontSize:12.5,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600}}>{error}</div>}
        {recoverMsg && <div style={{fontSize:12.5,color:recoverMsg.indexOf("No se pudo")===0?AUTH_RED:"#15803d",background:recoverMsg.indexOf("No se pudo")===0?"rgba(248,113,113,.12)":"rgba(34,197,94,.10)",padding:"8px 10px",borderRadius:8,fontWeight:600,lineHeight:1.4}}>{recoverMsg}</div>}
        <button type="submit" disabled={loading} style={{marginTop:4,padding:"11px 14px",borderRadius:10,border:"none",background:AUTH_GOLD,color:"#1a1206",fontWeight:700,fontSize:14,cursor:loading?"default":"pointer",opacity:loading?.6:1}}>{recoverMode ? (recoverLoading ? "Enviando…" : "Enviar enlace") : (loading ? "Ingresando…" : "Ingresar")}</button>
        {!recoverMode && <button type="button" onClick={onRegister} style={{background:"transparent",border:"none",color:"var(--gold)",cursor:"pointer",fontSize:13,fontWeight:700,padding:"3px 0 0"}}>Registrate</button>}
        <button type="button" onClick={function(){setRecoverMode(function(v){return !v;});setRecoverMsg(null);setPassword("");}} style={{background:"transparent",border:"none",color:AUTH_MUTED,cursor:"pointer",fontSize:12,textDecoration:"underline",padding:0}}>{recoverMode ? "Volver a iniciar sesión" : "¿Olvidaste tu contraseña? Recuperala"}</button>
      </form>
    </div>
  );
}

function CuentaNoHabilitadaScreen({ onLogout }){
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:AUTH_BG,padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:380,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,textAlign:"center",color:AUTH_TEXT,boxShadow:"0 8px 30px rgba(0,0,0,0.08)"}}>
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
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:AUTH_BG,padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:380,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,textAlign:"center",color:AUTH_TEXT,boxShadow:"0 8px 30px rgba(0,0,0,0.08)"}}>
        <div style={{fontSize:28,marginBottom:10}}>⛔</div>
        <div style={{fontWeight:700,marginBottom:8}}>Membresía {estado === "vencida" ? "vencida" : "suspendida"}</div>
        <div style={{fontSize:13,color:AUTH_MUTED,lineHeight:1.5}}>Tu inmobiliaria tiene la membresía {estado === "vencida" ? "vencida" : "suspendida"}. Contactá al administrador de DocWorks.</div>
        <button onClick={onLogout} style={{marginTop:18,padding:"9px 16px",borderRadius:9,border:"1px solid "+AUTH_BORDER,background:"transparent",color:AUTH_TEXT,fontSize:13,cursor:"pointer"}}>Cerrar sesión</button>
      </div>
    </div>
  );
}

var ESTADOS_MEMBRESIA = ["activa","pendiente","vencida","suspendida","cancelada"];
var ESTADO_MEMBRESIA_COLOR = { activa:"var(--green,#4ade80)", pendiente:"var(--amber,#fbbf24)", vencida:AUTH_RED, suspendida:AUTH_RED, cancelada:AUTH_MUTED };

function useSuperAdmin(activo){
  var [dashboard,setDashboard]=useState(null);
  var [inmobiliarias,setInmobiliarias]=useState([]);
  var [planes,setPlanes]=useState([]);
  var [loading,setLoading]=useState(false);
  var [error,setError]=useState(null);
  var [registroSolicitudes,setRegistroSolicitudes]=useState([]);
  var [registroSolicitudesLoading,setRegistroSolicitudesLoading]=useState(false);

  function rpc(nombre, params){
    return loadSupabaseJs().then(function(sb){
      if (!sb) return { error:{ message:"No se pudo conectar con Supabase." } };
      return sb.rpc(nombre, params);
    });
  }

  function recargar(){
    setLoading(true); setError(null);
    Promise.all([ rpc("fn_super_dashboard"), rpc("fn_super_listar_inmobiliarias"), rpc("fn_super_listar_planes") ]).then(function(res){
      setLoading(false);
      if (res[0].error) { setError(traducirError(res[0].error.message)); return; }
      setDashboard(res[0].data);
      setInmobiliarias(res[1].error ? [] : (res[1].data||[]));
      setPlanes(res[2].error ? [] : (res[2].data||[]));
    }).catch(function(err){ setLoading(false); setError(traducirError(err && err.message ? err.message : "No se pudieron cargar el panel.")); });
  }

  useEffect(function(){ if (activo) { recargar(); cargarRegistroSolicitudes(); } }, [activo]);

  function cargarRegistroSolicitudes(){
    setRegistroSolicitudesLoading(true);
    return rpc("fn_super_listar_solicitudes_registro", {}).then(function(res){
      setRegistroSolicitudesLoading(false);
      setRegistroSolicitudes(res.error ? [] : (res.data||[]));
      return res;
    }).catch(function(){ setRegistroSolicitudesLoading(false); setRegistroSolicitudes([]); });
  }
  function resolverRegistroSolicitud(id, aprobar){
    return rpc("fn_super_resolver_solicitud_registro", { p_solicitud_id:id, p_aprobar:!!aprobar }).then(function(res){
      if(!res.error){ cargarRegistroSolicitudes(); recargar(); }
      return res;
    });
  }
  function enviarRegistroSolicitud(datos){
    return rpc("fn_solicitar_registro_publico", { p_nombre:datos.nombre, p_email:datos.email, p_inmobiliaria:datos.inmobiliaria, p_telefono:datos.telefono||null });
  }

  function crearInmobiliaria(nombre, planCodigo, adminEmail){
    return rpc("fn_super_crear_inmobiliaria", { p_nombre:nombre, p_plan_codigo:planCodigo, p_admin_email:adminEmail, p_admin_nombre:"" }).then(function(res){
      if(res.error) return res;
      var inmobId = (res.data && typeof res.data === "object" && res.data.inmobiliaria_id) ? res.data.inmobiliaria_id : res.data;
      if(!inmobId) return { error:{ message:"La inmobiliaria se creó, pero no se recibió su identificador para completar el onboarding." }, data:res.data };
      return rpc("fn_super_preparar_dueno", { p_inmobiliaria_id:inmobId, p_email:adminEmail, p_nombre:"" }).then(function(onb){
        if(onb.error) return onb;
        recargar();
        return res;
      });
    });
  }
  function editarInmobiliaria(id, nombre){
    return rpc("fn_super_editar_inmobiliaria", { p_inmobiliaria_id:id, p_nombre:nombre }).then(function(res){ if(!res.error) recargar(); return res; });
  }
  function asignarPlan(id, planCodigo){
    return rpc("fn_super_asignar_plan", { p_inmobiliaria_id:id, p_plan_codigo:planCodigo }).then(function(res){ if(!res.error) recargar(); return res; });
  }
  function setEstadoMembresia(id, estado){
    return rpc("fn_super_set_estado_membresia", { p_inmobiliaria_id:id, p_estado:estado }).then(function(res){ if(!res.error) recargar(); return res; });
  }
  function crearPlan(codigo, nombre, descripcion, precio, moneda, limite){
    return rpc("fn_super_crear_plan", { p_codigo:codigo, p_nombre:nombre, p_descripcion:descripcion, p_precio:precio, p_moneda:moneda, p_limite_usuarios:limite }).then(function(res){ if(!res.error) recargar(); return res; });
  }
  function editarPlan(id, nombre, descripcion, precio, limite, activo){
    return rpc("fn_super_editar_plan", { p_plan_id:id, p_nombre:nombre, p_descripcion:descripcion, p_precio:precio, p_limite_usuarios:limite, p_activo:activo }).then(function(res){ if(!res.error) recargar(); return res; });
  }

  // ── Detalle de una inmobiliaria (usuarios + pagos + auditoría + contadores) ──
  var [detalle,setDetalle] = useState(null);
  var [detalleLoading,setDetalleLoading] = useState(false);
  var [detalleError,setDetalleError] = useState(null);
  var [detalleClausulas,setDetalleClausulas] = useState([]);
  var [detallePlantillas,setDetallePlantillas] = useState([]);
  var [detalleClausulasLoading,setDetalleClausulasLoading] = useState(false);
  function cargarDetalle(inmobiliariaId){
    if (!inmobiliariaId) { setDetalle(null); return; }
    setDetalleLoading(true); setDetalleError(null); setDetalleClausulasLoading(true);
    rpc("fn_super_detalle_inmobiliaria", { p_inmobiliaria_id: inmobiliariaId }).then(function(res){
      setDetalleLoading(false);
      if (res.error) { setDetalleError(traducirError(res.error.message)); setDetalle(null); return; }
      setDetalle(res.data);
    }).catch(function(err){ setDetalleLoading(false); setDetalleError(traducirError(err && err.message ? err.message : "No se pudieron cargar el detalle.")); });
    Promise.all([ rpc("fn_super_clausulas_inmobiliaria", { p_inmobiliaria_id: inmobiliariaId }), rpc("fn_super_plantillas_inmobiliaria", { p_inmobiliaria_id: inmobiliariaId }) ]).then(function(res){
      setDetalleClausulasLoading(false);
      setDetalleClausulas(res[0].error ? [] : (res[0].data||[]));
      setDetallePlantillas(res[1].error ? [] : (res[1].data||[]));
    }).catch(function(){ setDetalleClausulasLoading(false); setDetalleClausulas([]); setDetallePlantillas([]); });
  }
  function limpiarDetalle(){ setDetalle(null); setDetalleError(null); setDetalleClausulas([]); setDetallePlantillas([]); }

  function setEstadoUsuario(usuarioId, activo, inmobiliariaId){
    return rpc("fn_super_set_estado_usuario", { p_usuario_id:usuarioId, p_activo:activo }).then(function(res){ if(!res.error && inmobiliariaId) cargarDetalle(inmobiliariaId); return res; });
  }
  function setRolUsuario(usuarioId, rol, inmobiliariaId){
    return rpc("fn_super_set_rol_usuario", { p_usuario_id:usuarioId, p_rol:rol }).then(function(res){ if(!res.error && inmobiliariaId) cargarDetalle(inmobiliariaId); return res; });
  }

  // ── Auditoría global ──────────────────────────────────────────────────────
  var [auditoria,setAuditoria] = useState([]);
  var [auditoriaLoading,setAuditoriaLoading] = useState(false);
  function cargarAuditoria(inmobiliariaId){
    setAuditoriaLoading(true);
    rpc("fn_super_auditoria", { p_inmobiliaria_id: inmobiliariaId||null, p_limit: 200 }).then(function(res){
      setAuditoriaLoading(false);
      setAuditoria(res.error ? [] : (res.data||[]));
    }).catch(function(){ setAuditoriaLoading(false); setAuditoria([]); });
  }

  // ── Pagos globales ────────────────────────────────────────────────────────
  var [pagos,setPagos] = useState([]);
  var [pagosLoading,setPagosLoading] = useState(false);
  function cargarPagos(inmobiliariaId){
    setPagosLoading(true);
    rpc("fn_super_pagos", { p_inmobiliaria_id: inmobiliariaId||null }).then(function(res){
      setPagosLoading(false);
      setPagos(res.error ? [] : (res.data||[]));
    }).catch(function(){ setPagosLoading(false); setPagos([]); });
  }

  return { dashboard:dashboard, inmobiliarias:inmobiliarias, planes:planes, loading:loading, error:error, recargar:recargar,
    crearInmobiliaria:crearInmobiliaria, editarInmobiliaria:editarInmobiliaria, asignarPlan:asignarPlan,
    setEstadoMembresia:setEstadoMembresia, crearPlan:crearPlan, editarPlan:editarPlan,
    detalle:detalle, detalleLoading:detalleLoading, detalleError:detalleError, cargarDetalle:cargarDetalle, limpiarDetalle:limpiarDetalle,
    detalleClausulas:detalleClausulas, detallePlantillas:detallePlantillas, detalleClausulasLoading:detalleClausulasLoading,
    setEstadoUsuario:setEstadoUsuario, setRolUsuario:setRolUsuario,
    auditoria:auditoria, auditoriaLoading:auditoriaLoading, cargarAuditoria:cargarAuditoria,
    pagos:pagos, pagosLoading:pagosLoading, cargarPagos:cargarPagos, registroSolicitudes:registroSolicitudes, registroSolicitudesLoading:registroSolicitudesLoading, cargarRegistroSolicitudes:cargarRegistroSolicitudes, resolverRegistroSolicitud:resolverRegistroSolicitud, enviarRegistroSolicitud:enviarRegistroSolicitud };
}

// ── SUPER ADMIN — sistema visual propio (coherente con el resto de DocWorks) ──
var MOBILE_STABILITY_CSS = `
@media (max-width: 700px){
  html,body,#root{min-height:100%;width:100%;overflow-x:hidden;}
  body{overscroll-behavior-y:none;-webkit-text-size-adjust:100%;}
  input,textarea,select,button{font:inherit;}
  input,textarea,select{font-size:16px;}
  .dw-mobile-scroll{overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .dw-mobile-scroll::-webkit-scrollbar{display:none;}
}
`;

var SA_CSS = `
.sa-tabs{display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;}
.sa-tab{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:20px;border:1px solid var(--border2);background:transparent;color:var(--dim);font-size:12.5px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.sa-tab:hover{background:rgba(212,168,83,0.06);color:var(--text);}
.sa-tab.active{background:rgba(212,168,83,0.12);border-color:var(--gold);color:var(--gold);}
.sa-avatar{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--gold),var(--gold2));display:flex;align-items:center;justify-content:center;font-size:15px;color:#0a0f1a;font-weight:700;flex-shrink:0;}
.sa-bar{height:5px;border-radius:3px;background:rgba(212,168,83,0.1);overflow:hidden;margin-top:7px;max-width:200px;}
.sa-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width 0.3s;}
.sa-row-icon{width:32px;height:32px;border-radius:9px;background:rgba(212,168,83,0.08);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
.sa-kv{display:flex;flex-wrap:wrap;gap:18px;font-size:12.5px;color:var(--dim);}
.sa-kv b{color:var(--text);font-weight:600;}
.sa-headbar{display:flex;align-items:center;gap:12px;margin-bottom:4px;}
.sa-list{display:flex;flex-direction:column;gap:10px;}
.sa-detail-shell{display:flex;flex-direction:column;min-height:0;}
.sa-detail-tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 2px 10px;margin-bottom:4px;border-bottom:1px solid var(--border);scrollbar-width:thin;}
.sa-detail-tab{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;padding:8px 12px;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--dim);font:600 12px 'DM Sans',sans-serif;cursor:pointer;white-space:nowrap;}
.sa-detail-tab:hover{background:rgba(212,168,83,0.06);color:var(--text);}
.sa-detail-tab.active{background:rgba(212,168,83,0.11);border-color:rgba(212,168,83,0.35);color:var(--gold);}
.sa-detail-content{min-width:0;padding-top:16px;}
.sa-detail-list{display:flex;flex-direction:column;gap:8px;max-height:52vh;overflow-y:auto;padding-right:2px;}
.sa-detail-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:10px 12px;cursor:default;}
.sa-clause-card{padding:11px 12px;cursor:default;overflow:hidden;}
.sa-clause-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;min-width:0;}
.sa-clause-badges{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;flex-shrink:0;}
.sa-payment-row,.sa-activity-row{font-size:12.5px;background:rgba(212,168,83,0.04);border-radius:9px;}
@media(max-width:640px){.sa-detail-tabs{margin-left:-4px;margin-right:-4px;padding-left:4px;padding-right:4px;}.sa-detail-content{padding-top:14px;}.sa-clause-head{flex-direction:column;}.sa-clause-badges{justify-content:flex-start;}.sa-detail-row{align-items:flex-start;}.sa-payment-row,.sa-activity-row{flex-direction:column;align-items:flex-start;}.sa-detail-list{max-height:55vh;}}
@media(max-width:640px){ .sa-tabs{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;} .sa-tab{flex-shrink:0;} .sa-kv{gap:12px;} }
`;
function SAStyles(){
  useEffect(function(){
    var s=document.getElementById("sa-styles");
    if(!s){s=document.createElement("style");s.id="sa-styles";document.head.appendChild(s);}
    s.textContent=SA_CSS;
  },[]);
  return null;
}

var SA_TONE = {
  green:  { fg:"var(--green)",  bg:"rgba(74,222,128,0.1)",  bd:"rgba(74,222,128,0.25)" },
  amber:  { fg:"var(--amber)",  bg:"rgba(251,191,36,0.1)",  bd:"rgba(251,191,36,0.22)" },
  red:    { fg:"var(--red)",    bg:"rgba(248,113,113,0.1)", bd:"rgba(248,113,113,0.22)" },
  gold:   { fg:"var(--gold)",   bg:"rgba(212,168,83,0.1)",  bd:"rgba(212,168,83,0.22)" },
  teal:   { fg:"var(--teal)",   bg:"rgba(45,212,191,0.1)",  bd:"rgba(45,212,191,0.2)" },
  purple: { fg:"#a78bfa",       bg:"rgba(167,139,250,0.1)", bd:"rgba(167,139,250,0.22)" },
  dim:    { fg:"var(--dim)",    bg:"rgba(148,163,184,0.08)",bd:"rgba(148,163,184,0.15)" },
};
var ESTADO_MEMBRESIA_TONE = { activa:"green", pendiente:"amber", vencida:"red", suspendida:"red", cancelada:"dim" };
var ROL_TONE  = { dueno:"gold", admin:"teal", broker:"green", vendedor:"purple", viewer:"dim" };
var ROLES_BASE = ["dueno","admin","broker","vendedor","viewer"];

function SABadge({children,tone}){
  var t = SA_TONE[tone]||SA_TONE.dim;
  return <span className="badge" style={{background:t.bg,color:t.fg,border:"1px solid "+t.bd}}>{children}</span>;
}
function SAEmpty({children}){
  return <div className="op-card" style={{textAlign:"center",padding:"28px 16px",color:"var(--dim)",fontSize:12.5,cursor:"default"}}>{children}</div>;
}
function SASection({title,children,right}){
  return (
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,gap:10}}>
        <div style={{fontSize:11.5,fontWeight:700,color:"var(--dim)",letterSpacing:0.3}}>{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}
function SAAvatar({nombre}){
  var letra = (nombre||"?").trim().charAt(0).toUpperCase()||"?";
  return <div className="sa-avatar">{letra}</div>;
}
function SABar({value,max}){
  var pct = max>0 ? Math.min(100,Math.round((value/max)*100)) : 0;
  return <div className="sa-bar"><div className="sa-bar-fill" style={{width:pct+"%"}}/></div>;
}
function auditIcon(accion){
  var a = (accion||"").toLowerCase();
  if (a.indexOf("crear")>-1) return "➕";
  if (a.indexOf("elimin")>-1 || a.indexOf("borrar")>-1) return "🗑️";
  if (a.indexOf("editar")>-1 || a.indexOf("actualiz")>-1) return "✏️";
  if (a.indexOf("plan")>-1) return "📦";
  if (a.indexOf("estado")>-1 || a.indexOf("suspend")>-1 || a.indexOf("activ")>-1) return "🔄";
  if (a.indexOf("invit")>-1) return "✉️";
  if (a.indexOf("rol")>-1) return "🔑";
  if (a.indexOf("login")>-1 || a.indexOf("sesion")>-1) return "🔓";
  return "📝";
}

function saValorAudit(v:any): string {
  if(v===null||v===undefined) return "—";
  if(typeof v === "string") return v;
  try{return JSON.stringify(v,null,2);}catch(e){return String(v);}
}
function saResumenCambios(a): any {
  var ant=a&&a.valor_anterior, nue=a&&a.valor_nuevo;
  if(!ant&&!nue) return null;
  if(typeof ant!=="object"||typeof nue!=="object"||ant===null||nue===null) return {antes:saValorAudit(ant),despues:saValorAudit(nue)};
  var keys={}; Object.keys(ant||{}).forEach(function(k){keys[k]=true;}); Object.keys(nue||{}).forEach(function(k){keys[k]=true;});
  var out=[]; Object.keys(keys).forEach(function(k){var av=saValorAudit(ant[k]),nv=saValorAudit(nue[k]);if(av!==nv)out.push({campo:k,antes:av,despues:nv});});
  return out.length?out:null;
}

function SuperAdminDashboard({ contexto, onLogout }){
  var sa = useSuperAdmin(true);
  var [tab,setTab] = useState("resumen");
  var [showNueva,setShowNueva] = useState(false);
  var [nuevaForm,setNuevaForm] = useState({nombre:"",plan:"inicial",email:""});
  var [nuevaError,setNuevaError] = useState(null);
  var [nuevaBusy,setNuevaBusy] = useState(false);
  var [showNuevoPlan,setShowNuevoPlan] = useState(false);
  var [editPlan,setEditPlan] = useState(null);
  var [planForm,setPlanForm] = useState({codigo:"",nombre:"",descripcion:"",precio:"",moneda:"ARS",limite:""});

  // Inmobiliarias: búsqueda, filtro por estado y detalle expandido
  var [busqueda,setBusqueda] = useState("");
  var [filtroEstado,setFiltroEstado] = useState("todas");
  var [detalleId,setDetalleId] = useState(null);
  var [detalleTab,setDetalleTab] = useState("resumen");
  var [nuevoPlanDetalle,setNuevoPlanDetalle] = useState("");
  var [rolBusy,setRolBusy] = useState(null);
  var [renombrando,setRenombrando] = useState(false);
  var [nombreDetalle,setNombreDetalle] = useState("");
  var [renombreBusy,setRenombreBusy] = useState(false);

  // Auditoría y pagos globales
  var [auditFiltro,setAuditFiltro] = useState("");
  var [auditAccionFiltro,setAuditAccionFiltro] = useState("");
  var [auditEntidadFiltro,setAuditEntidadFiltro] = useState("");
  var [auditExpandida,setAuditExpandida] = useState(null);
  var [pagosFiltro,setPagosFiltro] = useState("");
  var [metodoPagoFiltro,setMetodoPagoFiltro] = useState("todos");
  var [showCheckout,setShowCheckout] = useState(false);
  var [checkoutPlan,setCheckoutPlan] = useState(null);
  var [checkoutMetodo,setCheckoutMetodo] = useState("Tarjeta de crédito");

  useEffect(function(){ if (tab==="auditoria") sa.cargarAuditoria(auditFiltro||null); }, [tab, auditFiltro]);
  useEffect(function(){ if (tab==="pagos") sa.cargarPagos(pagosFiltro||null); }, [tab, pagosFiltro]);

  function abrirDetalle(id, nombreActual){ setDetalleId(id); setDetalleTab("resumen"); setNuevoPlanDetalle(""); setRenombrando(false); setNombreDetalle(nombreActual||""); sa.cargarDetalle(id); }
  function cerrarDetalle(){ setDetalleId(null); setNuevoPlanDetalle(""); setRenombrando(false); sa.limpiarDetalle(); }

  function crearInmobiliaria(){
    if (!nuevaForm.nombre || !nuevaForm.email) return;
    setNuevaBusy(true); setNuevaError(null);
    sa.crearInmobiliaria(nuevaForm.nombre.trim(), nuevaForm.plan, nuevaForm.email.trim().toLowerCase()).then(function(res){
      setNuevaBusy(false);
      if (res.error) { setNuevaError(traducirError(res.error.message)||"No se pudo crear la inmobiliaria."); return; }
      setShowNueva(false); setNuevaForm({nombre:"",plan:"inicial",email:""});
    });
  }
  function abrirEditPlan(p){
    if (p) { setEditPlan(p); setPlanForm({codigo:p.codigo,nombre:p.nombre,descripcion:p.descripcion||"",precio:p.precio_mensual||"",moneda:p.moneda,limite:p.limite_usuarios}); }
    else { setEditPlan(null); setPlanForm({codigo:"",nombre:"",descripcion:"",precio:"",moneda:"ARS",limite:""}); }
    setShowNuevoPlan(true);
  }
  function guardarPlan(){
    if (editPlan) {
      sa.editarPlan(editPlan.id, planForm.nombre, planForm.descripcion, planForm.precio?parseFloat(planForm.precio):null, parseInt(planForm.limite), editPlan.activo).then(function(){ setShowNuevoPlan(false); });
    } else {
      if (!planForm.codigo || !planForm.nombre || !planForm.limite) return;
      sa.crearPlan(planForm.codigo.trim(), planForm.nombre.trim(), planForm.descripcion, planForm.precio?parseFloat(planForm.precio):null, planForm.moneda, parseInt(planForm.limite)).then(function(){ setShowNuevoPlan(false); });
    }
  }
  function cambiarRol(usuarioId, rol){
    setRolBusy(usuarioId);
    sa.setRolUsuario(usuarioId, rol, detalleId).then(function(){ setRolBusy(null); });
  }
  function toggleActivo(usuarioId, activoActual){
    setRolBusy(usuarioId);
    sa.setEstadoUsuario(usuarioId, !activoActual, detalleId).then(function(){ setRolBusy(null); });
  }
  function guardarNombre(){
    if (!nombreDetalle.trim()) return;
    setRenombreBusy(true);
    sa.editarInmobiliaria(detalleId, nombreDetalle.trim()).then(function(){ setRenombreBusy(false); setRenombrando(false); });
  }

  var TABS_SA = [ ["resumen","Resumen","📊"], ["inmobiliarias","Inmobiliarias","🏢"], ["solicitudes","Solicitudes","📨"], ["planes","Planes","📦"], ["auditoria","Auditoría","🕓"], ["pagos","Pagos","💳"] ];

  var metodosPago = ["Tarjeta de crédito","Tarjeta de débito","Transferencia bancaria"];
  var pagosFiltrados = sa.pagos.filter(function(p){
    if (!metodoPagoFiltro || metodoPagoFiltro === "todos") return true;
    var m = String(p.metodo_pago || p.proveedor || "").toLowerCase();
    return m.indexOf(metodoPagoFiltro.toLowerCase()) > -1;
  });

  var inmobiliariasFiltradas = sa.inmobiliarias.filter(function(i){
    if (filtroEstado!=="todas" && i.estado!==filtroEstado) return false;
    if (busqueda && i.inmobiliaria_nombre.toLowerCase().indexOf(busqueda.toLowerCase())===-1) return false;
    return true;
  });

  var inmobiliariaDetalleResumen = detalleId ? sa.inmobiliarias.find(function(i){return i.inmobiliaria_id===detalleId;}) : null;
  var det = sa.detalle;

  var pagosTotales = {};
  sa.pagos.forEach(function(p){
    if (p.estado!=="aprobado" && p.estado!=="pagado") return;
    var key = p.moneda||"ARS";
    pagosTotales[key] = (pagosTotales[key]||0) + (parseFloat(p.monto)||0);
  });

  var statsItems = sa.dashboard ? [
    { i:"🏢", v:sa.dashboard.total_inmobiliarias, l:"Inmobiliarias" },
    { i:"🟢", v:sa.dashboard.inmobiliarias_activas, l:"Activas" },
    { i:"⚠️", v:sa.dashboard.inmobiliarias_suspendidas, l:"Susp. / vencidas" },
    { i:"👥", v:sa.dashboard.total_usuarios, l:"Usuarios totales" },
    { i:"🧑‍💼", v:sa.dashboard.total_brokers, l:"Asesores" },
    { i:"📦", v:sa.dashboard.planes_activos, l:"Planes activos" },
    { i:"✅", v:sa.dashboard.membresias_activas, l:"Membresías activas" },
    { i:"⏳", v:sa.dashboard.membresias_vencidas, l:"Membresías vencidas" },
  ] : [];

  // Facturación mensual estimada: toma el precio vigente del plan de cada
  // inmobiliaria activa y conserva las monedas separadas (no convierte ARS/USD).
  var facturacionMensual = {};
  var facturacionPorPlan = {};
  var usuariosActivosFacturacion = 0;
  sa.inmobiliarias.forEach(function(i){
    if (i.estado !== "activa") return;
    usuariosActivosFacturacion += Number(i.usuarios_activos)||0;
    var plan = sa.planes.find(function(p){ return p.nombre===i.plan_nombre || p.codigo===i.plan_nombre; });
    if (!plan || !plan.precio_mensual) return;
    var moneda = plan.moneda || "ARS";
    var precio = Number(plan.precio_mensual)||0;
    facturacionMensual[moneda] = (facturacionMensual[moneda]||0) + precio;
    var planKey = String(plan.id || plan.codigo || plan.nombre);
    if (!facturacionPorPlan[planKey]) {
      facturacionPorPlan[planKey] = { nombre:plan.nombre, moneda:moneda, precio:precio, inmobiliarias:0, usuarios:0, subtotal:0 };
    }
    facturacionPorPlan[planKey].inmobiliarias += 1;
    facturacionPorPlan[planKey].usuarios += Number(i.usuarios_activos)||0;
    facturacionPorPlan[planKey].subtotal += precio;
  });
  var facturacionPorPlanLista = Object.keys(facturacionPorPlan).map(function(k){return facturacionPorPlan[k];}).sort(function(a,b){return b.subtotal-a.subtotal;});

  return (
    <div style={{position:"fixed",inset:0,zIndex:400,overflow:"auto",background:"var(--bg)",color:"var(--text)",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <SAStyles/>
      <div style={{maxWidth:1040,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div className="sa-headbar">
            <div className="sa-avatar" style={{fontSize:18}}>D</div>
            <div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:21,color:"var(--text)"}}>Panel de Superadministración</div>
              <div style={{fontSize:12.5,color:"var(--dim)"}}>Gestión global de DocWorks</div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onLogout}>Cerrar sesión</button>
        </div>

        <div className="sa-tabs">
          {TABS_SA.map(function(t){
            return <button key={t[0]} className={"sa-tab"+(tab===t[0]?" active":"")} onClick={function(){setTab(t[0]);}}><span>{t[2]}</span>{t[1]}</button>;
          })}
        </div>

        {sa.error && <div className="notice notice-amber" style={{marginBottom:16,borderColor:"rgba(248,113,113,0.3)",color:"var(--red)",background:"rgba(248,113,113,0.08)"}}>{sa.error}</div>}

        {tab==="resumen" && (
          sa.dashboard ? (
            <div>
              <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
                {statsItems.map(function(row){
                  return (
                    <div key={row.l} className="stat-card">
                      <div className="stat-icon">{row.i}</div>
                      <div className="stat-val">{row.v}</div>
                      <div className="stat-lbl">{row.l}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:24}}>
                <div className="stat-card" style={{padding:16,textAlign:"left",background:"linear-gradient(135deg,var(--surface),rgba(212,168,83,0.08))"}}>
                  <div style={{fontSize:11,fontWeight:800,color:"var(--gold)",letterSpacing:".08em",textTransform:"uppercase"}}>Suscripciones</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:27,marginTop:5}}>{sa.dashboard.membresias_activas || 0}</div>
                  <div style={{fontSize:11.5,color:"var(--dim)",marginTop:2}}>membresías activas</div>
                </div>
                <div className="stat-card" style={{padding:16,textAlign:"left"}}>
                  <div style={{fontSize:11,fontWeight:800,color:"var(--dim)",letterSpacing:".08em",textTransform:"uppercase"}}>Cobros</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:27,marginTop:5}}>{sa.pagos.length}</div>
                  <div style={{fontSize:11.5,color:"var(--dim)",marginTop:2}}>movimientos registrados</div>
                </div>
                <div className="stat-card" style={{padding:16,textAlign:"left"}}>
                  <div style={{fontSize:11,fontWeight:800,color:"var(--dim)",letterSpacing:".08em",textTransform:"uppercase"}}>Medios</div>
                  <div style={{fontSize:14,fontWeight:700,marginTop:9}}>💳 Tarjetas · 🏦 Transferencia</div>
                  <div style={{fontSize:11.5,color:"var(--dim)",marginTop:5}}>listo para integrar pasarela</div>
                </div>
              </div>

              <SASection title="Facturación mensual" right={<SABadge tone="gold">PRECIOS VIGENTES</SABadge>}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:14}}>
                  {Object.keys(facturacionMensual).length===0 ? (
                    <div className="op-card" style={{padding:14,color:"var(--dim)",fontSize:12}}>No hay inmobiliarias activas con un precio mensual asignado.</div>
                  ) : Object.keys(facturacionMensual).map(function(moneda){
                    return (
                      <div key={moneda} className="stat-card" style={{padding:14,textAlign:"left"}}>
                        <div style={{fontSize:11,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>Facturación mensual · {moneda}</div>
                        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:25,color:"var(--gold)",marginTop:5}}>
                          {moneda+" "+facturacionMensual[moneda].toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2})}
                        </div>
                        <div style={{fontSize:11.5,color:"var(--dim)",marginTop:3}}>Estimado según planes activos</div>
                      </div>
                    );
                  })}
                  <div className="stat-card" style={{padding:14,textAlign:"left"}}>
                    <div style={{fontSize:11,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>Usuarios activos</div>
                    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:25,color:"var(--text)",marginTop:5}}>{usuariosActivosFacturacion}</div>
                    <div style={{fontSize:11.5,color:"var(--dim)",marginTop:3}}>En inmobiliarias activas</div>
                  </div>
                </div>

                {facturacionPorPlanLista.length>0 && (
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {facturacionPorPlanLista.map(function(p){
                      return (
                        <div key={p.nombre} className="op-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",padding:"11px 13px"}}>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700}}>{p.nombre}</div>
                            <div style={{fontSize:11.5,color:"var(--dim)",marginTop:2}}>{p.inmobiliarias} inmobiliaria{p.inmobiliarias===1?"":"s"} · {p.usuarios} usuario{p.usuarios===1?"":"s"} activos · {p.moneda} {p.precio.toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2})} /mes</div>
                          </div>
                          <div style={{fontWeight:700,color:"var(--gold)",fontSize:13,whiteSpace:"nowrap"}}>{p.moneda} {p.subtotal.toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2})} /mes</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SASection>

              {sa.dashboard.inmobiliarias_suspendidas>0 && (
                <SASection title={"Requieren atención (" + sa.inmobiliarias.filter(function(i){return i.estado==="suspendida"||i.estado==="vencida";}).length + ")"}>
                  <div className="sa-list">
                    {sa.inmobiliarias.filter(function(i){return i.estado==="suspendida"||i.estado==="vencida";}).map(function(i){
                      return (
                        <div key={i.inmobiliaria_id} className="op-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,padding:"14px 16px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:12}}>
                            <SAAvatar nombre={i.inmobiliaria_nombre}/>
                            <div style={{fontWeight:700,fontSize:13.5}}>{i.inmobiliaria_nombre}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <SABadge tone={ESTADO_MEMBRESIA_TONE[i.estado]}>{i.estado}</SABadge>
                            <button className="btn btn-ghost btn-sm" onClick={function(){setTab("inmobiliarias"); abrirDetalle(i.inmobiliaria_id, i.inmobiliaria_nombre);}}>Revisar</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SASection>
              )}
            </div>
          ) : <div style={{fontSize:13,color:"var(--dim)"}}>Cargando estadísticas…</div>
        )}

        {tab==="inmobiliarias" && (
          <div>
            <div className="filter-row" style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <div className="search-wrap" style={{flex:"1 1 220px",minWidth:180}}>
                <span className="search-icon">🔍</span>
                <input className="search-inp" value={busqueda} onChange={function(e){setBusqueda(e.target.value);}} placeholder="Buscar por nombre..."/>
              </div>
              <div style={{width:170}}>
                <select className="inp" value={filtroEstado} onChange={function(e){setFiltroEstado(e.target.value);}}>
                  <option value="todas">Todos los estados</option>
                  {ESTADOS_MEMBRESIA.map(function(e){return <option key={e} value={e}>{e}</option>;})}
                </select>
              </div>
              <button className="btn btn-primary" style={{marginLeft:"auto"}} onClick={function(){setShowNueva(true);}}>+ Nueva inmobiliaria</button>
            </div>
            <div style={{fontSize:11.5,color:"var(--dim)",marginBottom:12}}>
              {inmobiliariasFiltradas.length} de {sa.inmobiliarias.length} inmobiliarias
            </div>
            <div className="sa-list">
              {inmobiliariasFiltradas.length===0 && !sa.loading && <SAEmpty>No hay inmobiliarias que coincidan con la búsqueda.</SAEmpty>}
              {inmobiliariasFiltradas.map(function(i){
                var vencePronto = i.fecha_renovacion && (new Date(i.fecha_renovacion) - new Date()) < 1000*60*60*24*7 && (new Date(i.fecha_renovacion) - new Date()) > 0;
                return (
                  <div key={i.inmobiliaria_id} className="op-card" style={{padding:"16px 18px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
                        <SAAvatar nombre={i.inmobiliaria_nombre}/>
                        <div style={{minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:14}}>{i.inmobiliaria_nombre}</div>
                          <div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>
                            Plan {i.plan_nombre} · {i.usuarios_activos}/{i.limite_usuarios} usuarios
                            {i.fecha_renovacion ? " · renueva " + new Date(i.fecha_renovacion).toLocaleDateString("es-AR") : ""}
                            {vencePronto ? " ⚠️" : ""}
                          </div>
                          <SABar value={i.usuarios_activos} max={i.limite_usuarios}/>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                        <SABadge tone={ESTADO_MEMBRESIA_TONE[i.estado]}>{i.estado}</SABadge>
                        <button className="btn btn-secondary btn-sm" onClick={function(){abrirDetalle(i.inmobiliaria_id, i.inmobiliaria_nombre);}}>Ver detalle</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="solicitudes" && (
        <SASection title="Solicitudes de registro" right={<SABadge tone="gold">{sa.registroSolicitudes.length} pendientes / recientes</SABadge>}>
          {sa.registroSolicitudesLoading ? <SAEmpty>Cargando solicitudes…</SAEmpty> : !sa.registroSolicitudes.length ? <SAEmpty>No hay solicitudes de registro.</SAEmpty> :
            <div className="sa-list">{sa.registroSolicitudes.map(function(r){
              var pendiente=(r.estado||"pendiente")==="pendiente";
              return <div key={r.id} className="op-card" style={{padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
                  <div style={{minWidth:0,flex:1}}><div style={{fontWeight:700,color:"var(--text)",fontSize:14}}>{r.nombre}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:4}}>{r.email} · {r.inmobiliaria}</div>{r.telefono&&<div style={{fontSize:11.5,color:"var(--dim)",marginTop:3}}>{r.telefono}</div>}<div style={{fontSize:11,color:"var(--dim)",marginTop:7}}>{r.creada_en?new Date(r.creada_en).toLocaleString("es-AR"):""}</div></div>
                  <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}><SABadge tone={pendiente?"amber":(r.estado==="aprobada"?"green":"red")}>{r.estado||"pendiente"}</SABadge>{pendiente&&<><button className="btn-primary" onClick={function(){if(window.confirm("¿Aprobar esta solicitud y crear la inmobiliaria con su invitación?")) sa.resolverRegistroSolicitud(r.id,true);}}>Aprobar</button><button className="btn-secondary" onClick={function(){if(window.confirm("¿Rechazar esta solicitud?")) sa.resolverRegistroSolicitud(r.id,false);}}>Rechazar</button></>}</div>
                </div>
              </div>;
            })}</div>}
        </SASection>
      )}

      {tab==="planes" && (
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <button className="btn btn-primary" onClick={function(){abrirEditPlan(null);}}>+ Nuevo plan</button>
            </div>
            <div className="grid2">
              {sa.planes.map(function(p){
                var inmobsEnPlan = sa.inmobiliarias.filter(function(i){return i.plan_nombre===p.nombre;}).length;
                return (
                  <div key={p.id} className="card" style={{padding:18,opacity:p.activo?1:0.55}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14.5}}>{p.nombre}</div>
                        <div style={{fontSize:11,color:"var(--dim)",marginTop:1}}>{p.codigo}</div>
                      </div>
                      <SABadge tone={p.activo?"green":"dim"}>{p.activo?"activo":"inactivo"}</SABadge>
                    </div>
                    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"var(--gold)",marginTop:14}}>
                      {p.precio_mensual ? p.moneda+" "+Number(p.precio_mensual).toLocaleString("es-AR") : "Sin precio"}
                      {p.precio_mensual && <span style={{fontSize:12,color:"var(--dim)",fontFamily:"'DM Sans',sans-serif"}}> /mes</span>}
                    </div>
                    {p.descripcion && <div style={{fontSize:12,color:"var(--dim)",marginTop:8,lineHeight:1.4}}>{p.descripcion}</div>}
                    <div className="sa-kv" style={{marginTop:14}}>
                      <div>Hasta <b>{p.limite_usuarios}</b> usuarios</div>
                      <div><b>{inmobsEnPlan}</b> inmobiliaria{inmobsEnPlan===1?"":"s"}</div>
                    </div>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
                      <button className="btn btn-ghost btn-sm" onClick={function(){abrirEditPlan(p);}}>Editar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="auditoria" && (
          <div>
            <div style={{padding:"14px 16px",marginBottom:16,borderRadius:12,border:"1px solid rgba(212,168,83,0.22)",background:"rgba(212,168,83,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}><span style={{fontSize:17}}>🛡️</span><div style={{fontWeight:700,fontSize:14}}>Auditoría global de DocWorks</div><SABadge tone="gold">SUPERADMIN</SABadge></div>
              <div style={{fontSize:11.5,color:"var(--dim)",lineHeight:1.5}}>Registro global de las modificaciones de todas las inmobiliarias. Podés filtrar por inmobiliaria, acción o entidad y abrir cada registro para ver qué había antes y qué quedó después.</div>
            </div>
            <div className="filter-row" style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{flex:"1 1 220px",minWidth:190}}><select className="inp" value={auditFiltro} onChange={function(e){setAuditFiltro(e.target.value);setAuditExpandida(null);}}><option value="">Todas las inmobiliarias</option>{sa.inmobiliarias.map(function(i){return <option key={i.inmobiliaria_id} value={i.inmobiliaria_id}>{i.inmobiliaria_nombre}</option>;})}</select></div>
              <div style={{width:190}}><select className="inp" value={auditAccionFiltro} onChange={function(e){setAuditAccionFiltro(e.target.value);}}><option value="">Todas las acciones</option><option value="crear">Crear</option><option value="editar">Editar / actualizar</option><option value="eliminar">Eliminar / desactivar</option><option value="rol">Cambios de rol</option><option value="estado">Cambios de estado</option><option value="invitar">Invitaciones</option><option value="aprobar">Aprobaciones</option><option value="rechazar">Rechazos</option></select></div>
              <div style={{width:190}}><input className="inp" value={auditEntidadFiltro} onChange={function(e){setAuditEntidadFiltro(e.target.value);}} placeholder="Filtrar entidad…"/></div>
              {sa.auditoriaLoading && <div style={{fontSize:11.5,color:"var(--dim)"}}>Cargando…</div>}<div style={{marginLeft:"auto",fontSize:11,color:"var(--dim)"}}>{sa.auditoria.length} registros cargados</div>
            </div>
            <div className="sa-list">
              {!sa.auditoriaLoading && sa.auditoria.length===0 && <SAEmpty>Sin actividad registrada.</SAEmpty>}
              {sa.auditoria.map(function(a){
                var accion=(a.accion||"").toLowerCase();
                if(auditAccionFiltro){
                  var coincideAccion = auditAccionFiltro === "editar"
                    ? (accion.indexOf("editar")>-1 || accion.indexOf("actualizar")>-1 || accion.indexOf("modific")>-1)
                    : auditAccionFiltro === "eliminar"
                      ? (accion.indexOf("eliminar")>-1 || accion.indexOf("borrar")>-1 || accion.indexOf("desactiv")>-1)
                      : auditAccionFiltro === "rol"
                        ? accion.indexOf("rol")>-1
                        : auditAccionFiltro === "estado"
                          ? (accion.indexOf("estado")>-1 || accion.indexOf("activ")>-1 || accion.indexOf("suspend")>-1)
                          : auditAccionFiltro === "invitar"
                            ? accion.indexOf("invit")>-1
                            : auditAccionFiltro === "aprobar"
                              ? accion.indexOf("aprobar")>-1
                              : auditAccionFiltro === "rechazar"
                                ? accion.indexOf("rechaz")>-1
                                : accion.indexOf(auditAccionFiltro)>-1;
                  if(!coincideAccion) return null;
                }
                if(auditEntidadFiltro && String(a.entidad_tipo||"").toLowerCase().indexOf(auditEntidadFiltro.toLowerCase())===-1) return null;
                var expandida=auditExpandida===a.id; var cambios=saResumenCambios(a);
                return <div key={a.id} className="op-card" style={{padding:0,overflow:"hidden"}}>
                  <button type="button" onClick={function(){setAuditExpandida(expandida?null:a.id);}} style={{width:"100%",border:0,background:"transparent",color:"inherit",padding:"13px 16px",cursor:"pointer",textAlign:"left"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}><div className="sa-row-icon">{auditIcon(a.accion)}</div><div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:650}}>{a.accion||"Actividad"} <span style={{fontWeight:400,color:"var(--dim)"}}>· {a.entidad_tipo||"entidad"}</span></div><div style={{fontSize:11.5,color:"var(--dim)",marginTop:3}}>{a.inmobiliaria_nombre||"—"} · {a.usuario_nombre||a.usuario_email||"sistema"}{a.usuario_email&&a.usuario_nombre?" · "+a.usuario_email:""}</div></div></div><div style={{display:"flex",alignItems:"center",gap:10,whiteSpace:"nowrap"}}><span style={{fontSize:10.8,color:"var(--dim)"}}>{a.creada_en?new Date(a.creada_en).toLocaleString("es-AR"):""}</span><span style={{fontSize:13,color:"var(--dim)"}}>{expandida?"⌃":"⌄"}</span></div></div>
                  </button>
                  {expandida&&<div style={{padding:"0 16px 16px 60px",borderTop:"1px solid var(--border)",background:"rgba(255,255,255,0.015)"}}><div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:"var(--dim)",padding:"10px 0"}}><span>ID: {a.entidad_id||"—"}</span><span>Origen: {a.origen||"—"}</span>{a.solicitud_id&&<span>Solicitud: {a.solicitud_id}</span>}</div>{cambios&&Array.isArray(cambios)?<div style={{display:"flex",flexDirection:"column",gap:7}}>{cambios.map(function(c){return <div key={c.campo} style={{padding:"9px 10px",borderRadius:8,border:"1px solid var(--border)",background:"rgba(0,0,0,0.08)"}}><div style={{fontSize:11,fontWeight:700,color:"var(--gold)",marginBottom:5}}>{c.campo}</div><div style={{fontSize:10.8,color:"var(--dim)",lineHeight:1.45}}><div><b style={{color:"var(--red)"}}>Antes:</b> {c.antes}</div><div style={{marginTop:3}}><b style={{color:"var(--green)"}}>Después:</b> {c.despues}</div></div></div>;})}</div>:cambios?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><div style={{fontSize:10,fontWeight:700,color:"var(--red)",marginBottom:4}}>ANTES</div><pre style={{whiteSpace:"pre-wrap",fontSize:10.5,lineHeight:1.4,color:"var(--dim)",margin:0}}>{cambios.antes}</pre></div><div><div style={{fontSize:10,fontWeight:700,color:"var(--green)",marginBottom:4}}>DESPUÉS</div><pre style={{whiteSpace:"pre-wrap",fontSize:10.5,lineHeight:1.4,color:"var(--dim)",margin:0}}>{cambios.despues}</pre></div></div>:<div style={{fontSize:11,color:"var(--dim)"}}>Este registro no contiene valores anteriores/nuevos.</div>}</div>}
                </div>;
              })}
            </div>
          </div>
        )}

        {tab==="pagos" && (
          <div>
            <div className="filter-row" style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{width:260}}>
                <select className="inp" value={pagosFiltro} onChange={function(e){setPagosFiltro(e.target.value);}}>
                  <option value="">Todas las inmobiliarias</option>
                  {sa.inmobiliarias.map(function(i){return <option key={i.inmobiliaria_id} value={i.inmobiliaria_id}>{i.inmobiliaria_nombre}</option>;})}
                </select>
              </div>
              <div style={{width:210}}>
                <select className="inp" value={metodoPagoFiltro} onChange={function(e){setMetodoPagoFiltro(e.target.value);}}>
                  <option value="todos">Todos los medios</option>
                  {metodosPago.map(function(m){return <option key={m} value={m}>{m}</option>;})}
                </select>
              </div>
              <button className="btn btn-primary btn-sm" onClick={function(){setCheckoutPlan(sa.planes.find(function(p){return p.activo;})||null);setShowCheckout(true);}}>+ Simular alta de suscripción</button>
              {sa.pagosLoading && <div style={{fontSize:11.5,color:"var(--dim)"}}>Cargando…</div>}
              <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
                {Object.keys(pagosTotales).map(function(k){
                  return <SABadge key={k} tone="green">Cobrado {k} {pagosTotales[k].toLocaleString("es-AR",{minimumFractionDigits:2})}</SABadge>;
                })}
              </div>
            </div>
            <div className="sa-list">
              {!sa.pagosLoading && sa.pagos.length===0 && <SAEmpty>Sin pagos registrados.</SAEmpty>}
              {pagosFiltrados.map(function(p){
                return (
                  <div key={p.id} className="op-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,padding:"12px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
                      <div className="sa-row-icon">💳</div>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600}}>{fmt$(p.monto,p.moneda)} <span style={{fontWeight:400,color:"var(--dim)"}}>· {p.proveedor||"—"}</span></div>
                        <div style={{fontSize:11.5,color:"var(--dim)",marginTop:2}}>{p.inmobiliaria_nombre||"—"}{p.referencia_externa?" · ref "+p.referencia_externa:""}</div>
                        <div style={{fontSize:10.5,color:"var(--gold)",marginTop:4}}>💳 {p.metodo_pago || p.proveedor || "Medio no informado"}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <SABadge tone={p.estado==="aprobado"||p.estado==="pagado"?"green":(p.estado==="rechazado"?"red":"amber")}>{p.estado}</SABadge>
                      <div style={{fontSize:11,color:"var(--dim)",whiteSpace:"nowrap"}}>{new Date(p.creado_en).toLocaleDateString("es-AR")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Modal open={showCheckout} onClose={function(){setShowCheckout(false);}} title="Nueva suscripción · PRO">
        <div style={{display:"flex",flexDirection:"column",gap:15}}>
          <div style={{padding:14,borderRadius:12,border:"1px solid rgba(212,168,83,.25)",background:"rgba(212,168,83,.06)"}}>
            <div style={{fontWeight:800,fontSize:14}}>Pago de DocWorks</div>
            <div style={{fontSize:11.5,color:"var(--dim)",marginTop:4}}>Vista preparada para conectar una pasarela de pago. DocWorks no almacena números completos de tarjeta.</div>
          </div>
          <Field label="Plan"><select className="inp" value={checkoutPlan?checkoutPlan.codigo:""} onChange={function(e){setCheckoutPlan(sa.planes.find(function(p){return p.codigo===e.target.value;})||null);}}>{sa.planes.filter(function(p){return p.activo;}).map(function(p){return <option key={p.codigo} value={p.codigo}>{p.nombre} · {fmt$(p.precio_mensual,p.moneda)}</option>;})}</select></Field>
          <Field label="Medio de pago"><select className="inp" value={checkoutMetodo} onChange={function(e){setCheckoutMetodo(e.target.value);}}>{metodosPago.map(function(m){return <option key={m}>{m}</option>;})}</select></Field>
          {checkoutMetodo.indexOf("Tarjeta")===0 && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><input className="inp" placeholder="Número de tarjeta (demo)"/><input className="inp" placeholder="MM/AA · CVV (demo)"/></div>}
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}><button className="btn btn-ghost" onClick={function(){setShowCheckout(false);}}>Cancelar</button><button className="btn btn-primary" onClick={function(){setShowCheckout(false);dwNotify("success","Pago preparado. Falta conectar la pasarela de pago para procesar el cobro real.");}}>Continuar al pago</button></div>
        </div>
      </Modal>

      {/* Nueva inmobiliaria */}
      <Modal open={showNueva} onClose={function(){setShowNueva(false);}} title="Nueva inmobiliaria">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Field label="Nombre de la inmobiliaria"><input className="inp" value={nuevaForm.nombre} onChange={function(e){setNuevaForm(function(f){return Object.assign({},f,{nombre:e.target.value});});}} placeholder="Inmobiliaria Ejemplo"/></Field>
          <Field label="Plan">
            <select className="inp" value={nuevaForm.plan} onChange={function(e){setNuevaForm(function(f){return Object.assign({},f,{plan:e.target.value});});}}>
              {sa.planes.filter(function(p){return p.activo;}).map(function(p){return <option key={p.codigo} value={p.codigo}>{p.nombre} (hasta {p.limite_usuarios} usuarios)</option>;})}
            </select>
          </Field>
          <Field label="Correo del dueño/administrador (recibe la invitación)"><input className="inp" type="email" value={nuevaForm.email} onChange={function(e){setNuevaForm(function(f){return Object.assign({},f,{email:e.target.value});});}} placeholder="usuario@inmobiliaria.com"/></Field>
          {nuevaError && <div className="notice" style={{background:"rgba(248,113,113,0.1)",color:"var(--red)",fontWeight:600}}>{nuevaError}</div>}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
            <button className="btn btn-ghost" onClick={function(){setShowNueva(false);}}>Cancelar</button>
            <button className="btn btn-primary" disabled={nuevaBusy} onClick={crearInmobiliaria}>{nuevaBusy?"Creando…":"Crear e invitar"}</button>
          </div>
        </div>
      </Modal>

      {/* Detalle completo de inmobiliaria — organizado por pestañas para evitar superposición */}
      <Modal open={!!detalleId} onClose={cerrarDetalle} wide
        title={
          renombrando ? (
            <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flexWrap:"wrap"}}>
              <input className="inp" style={{fontSize:15,padding:"6px 10px",maxWidth:320}} value={nombreDetalle} onChange={function(e){setNombreDetalle(e.target.value);}} autoFocus/>
              <button className="btn btn-primary btn-sm" disabled={renombreBusy} onClick={guardarNombre}>{renombreBusy?"…":"Guardar"}</button>
              <button className="btn btn-ghost btn-sm" onClick={function(){setRenombrando(false); setNombreDetalle(inmobiliariaDetalleResumen?inmobiliariaDetalleResumen.inmobiliaria_nombre:"");}}>Cancelar</button>
            </div>
          ) : (
            <span style={{display:"inline-flex",alignItems:"center",gap:8,minWidth:0,maxWidth:"100%"}}>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inmobiliariaDetalleResumen?inmobiliariaDetalleResumen.inmobiliaria_nombre:"Detalle"}</span>
              <button title="Renombrar" onClick={function(){setRenombrando(true);}} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:13,opacity:0.6,padding:2,flexShrink:0}}><DWIcon name="edit" size={14}/></button>
            </span>
          )
        }>
        {sa.detalleLoading && <div style={{fontSize:13,color:"var(--dim)"}}>Cargando…</div>}
        {sa.detalleError && <div className="notice" style={{background:"rgba(248,113,113,0.1)",color:"var(--red)"}}>{sa.detalleError}</div>}
        {det && !sa.detalleLoading && (
          <div className="sa-detail-shell">
            <div className="sa-detail-tabs" role="tablist" aria-label="Detalle de la inmobiliaria">
              {[ ["resumen","Resumen","▣"],["usuarios","Usuarios","♙"],["clausulas","Cláusulas","§"],["plantillas","Plantillas","▤"],["pagos","Pagos","$"], ["facturacion","Facturación","◈"],["actividad","Actividad","◷"] ].map(function(t){
                var activo=detalleTab===t[0];
                return <button key={t[0]} type="button" className={"sa-detail-tab "+(activo?"active":"")} onClick={function(){setDetalleTab(t[0]);}} role="tab" aria-selected={activo}>
                  <span>{t[2]}</span>{t[1]}
                </button>;
              })}
            </div>

            <div className="sa-detail-content">
              {detalleTab==="resumen" && (
                <div>
                  <SASection title="Plan y membresía">
                    <div className="sa-kv" style={{marginBottom:12}}>
                      <div>Plan: <b>{det.membresia?det.membresia.plan_nombre:"—"}</b></div>
                      <div>Alta: <b>{det.inmobiliaria&&det.inmobiliaria.creada_en?new Date(det.inmobiliaria.creada_en).toLocaleDateString("es-AR"):"—"}</b></div>
                      <div>Vence: <b>{det.membresia&&det.membresia.fecha_vencimiento?new Date(det.membresia.fecha_vencimiento).toLocaleDateString("es-AR"):"—"}</b></div>
                      <div>Cláusulas: <b>{det.clausulas_count}</b></div>
                      <div>Bloques: <b>{det.bloques_count}</b></div>
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                      <div style={{width:220,maxWidth:"100%"}}>
                        <select className="inp" value={nuevoPlanDetalle} onChange={function(e){setNuevoPlanDetalle(e.target.value);}}>
                          <option value="">— cambiar plan —</option>
                          {sa.planes.filter(function(p){return p.activo;}).map(function(p){return <option key={p.codigo} value={p.codigo}>{p.nombre}</option>;})}
                        </select>
                      </div>
                      <button className="btn btn-secondary btn-sm" disabled={!nuevoPlanDetalle} onClick={function(){sa.asignarPlan(detalleId, nuevoPlanDetalle).then(function(){setNuevoPlanDetalle("");});}}>Aplicar plan</button>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:12}}>
                      {ESTADOS_MEMBRESIA.map(function(e){
                        var activo = det.membresia && det.membresia.estado===e;
                        var t = SA_TONE[ESTADO_MEMBRESIA_TONE[e]]||SA_TONE.dim;
                        return <button key={e} onClick={function(){sa.setEstadoMembresia(detalleId, e);}}
                          style={{padding:"6px 13px",borderRadius:20,border:"1px solid "+t.bd,background:activo?t.bg:"transparent",color:t.fg,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{e}</button>;
                      })}
                    </div>
                  </SASection>
                  <SASection title="Resumen de actividad">
                    <div className="sa-kv">
                      <div>Usuarios: <b>{det.usuarios?det.usuarios.length:0}</b></div>
                      <div>Cláusulas: <b>{sa.detalleClausulas.length}</b></div>
                      <div>Plantillas: <b>{sa.detallePlantillas.length}</b></div>
                      <div>Pagos recientes: <b>{det.ultimos_pagos?det.ultimos_pagos.length:0}</b></div>
                    </div>
                  </SASection>
                </div>
              )}

              {detalleTab==="usuarios" && (
                <SASection title={"Usuarios (" + (det.usuarios?det.usuarios.length:0) + ")"}>
                  {(!det.usuarios || det.usuarios.length===0) && <SAEmpty>Sin usuarios.</SAEmpty>}
                  <div className="sa-list">
                    {(det.usuarios||[]).map(function(u){
                      return (
                        <div key={u.id} className="op-card sa-detail-row">
                          <div style={{minWidth:0,display:"flex",alignItems:"center",gap:10,flex:"1 1 220px"}}>
                            <div className="sa-row-icon" style={{background:(SA_TONE[ROL_TONE[u.rol_base]]||SA_TONE.dim).bg,color:(SA_TONE[ROL_TONE[u.rol_base]]||SA_TONE.dim).fg}}>{(u.nombre||u.email||"?").charAt(0).toUpperCase()}</div>
                            <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.nombre||u.email}</div><div style={{fontSize:11,color:"var(--dim)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div></div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                            <SABadge tone={u.activo?"green":"red"}>{u.activo?"activo":"inactivo"}</SABadge>
                            <div style={{width:130,maxWidth:"100%"}}><select className="inp" value={u.rol_base} onChange={function(e){cambiarRol(u.id, e.target.value);}}>{ROLES_BASE.map(function(r){return <option key={r} value={r}>{r}</option>;})}</select></div>
                            <button className="btn btn-ghost btn-sm" disabled={rolBusy===u.id} onClick={function(){toggleActivo(u.id, u.activo);}}>{u.activo?"Desactivar":"Activar"}</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SASection>
              )}

              {detalleTab==="clausulas" && (
                <SASection title={"Cláusulas (" + sa.detalleClausulas.length + ")"}>
                  {sa.detalleClausulasLoading && <div style={{fontSize:12,color:"var(--dim)",padding:"10px 0"}}>Cargando…</div>}
                  {!sa.detalleClausulasLoading && sa.detalleClausulas.length===0 && <SAEmpty>Esta inmobiliaria todavía no cargó cláusulas propias.</SAEmpty>}
                  <div className="sa-detail-list">
                    {sa.detalleClausulas.map(function(c){
                      return <div key={c.id} className="op-card sa-clause-card">
                        <div className="sa-clause-head"><div style={{fontSize:12.5,fontWeight:600,minWidth:0,overflow:"hidden",textOverflow:"ellipsis"}}>{c.titulo}</div><div className="sa-clause-badges">{c.obligatoria&&<SABadge tone="gold">obligatoria</SABadge>}<SABadge tone={c.activo?"green":"dim"}>{c.activo?"activa":"inactiva"}</SABadge></div></div>
                        <div style={{fontSize:11,color:"var(--dim)",marginTop:3}}>{c.categoria}</div>
                        <div style={{fontSize:11.5,color:"var(--dim)",marginTop:4,lineHeight:1.5,overflowWrap:"anywhere"}}>{(c.contenido||"").slice(0,500)}{(c.contenido||"").length>500?"…":""}</div>
                      </div>;
                    })}
                  </div>
                </SASection>
              )}

              {detalleTab==="plantillas" && (
                <SASection title={"Plantillas de documentos (" + sa.detallePlantillas.length + ")"}>
                  {sa.detalleClausulasLoading && <div style={{fontSize:12,color:"var(--dim)",padding:"10px 0"}}>Cargando…</div>}
                  {!sa.detalleClausulasLoading && sa.detallePlantillas.length===0 && <SAEmpty>Sin plantillas personalizadas — usa los encabezados por defecto.</SAEmpty>}
                  <div className="sa-detail-list">
                    {sa.detallePlantillas.map(function(p){
                      return <div key={p.id} className="op-card sa-detail-row"><div style={{minWidth:0,flex:"1 1 260px"}}><div style={{fontSize:12.5,fontWeight:600,overflowWrap:"anywhere"}}>{p.nombre} <span style={{color:"var(--dim)",fontWeight:400}}>· {p.tipo_documento}</span></div><div style={{fontSize:11,color:"var(--dim)",marginTop:2}}>v{p.version} · {p.bloques_count} bloque{p.bloques_count===1?"":"s"}</div></div><SABadge tone={p.activa?"green":"dim"}>{p.activa?"activa":"inactiva"}</SABadge></div>;
                    })}
                  </div>
                </SASection>
              )}

              {detalleTab==="pagos" && (
                <SASection title="Últimos pagos">
                  {(!det.ultimos_pagos || det.ultimos_pagos.length===0) && <SAEmpty>Sin pagos registrados.</SAEmpty>}
                  <div className="sa-detail-list">
                    {(det.ultimos_pagos||[]).map(function(p){
                      return <div key={p.id} className="sa-detail-row sa-payment-row"><div>{fmt$(p.monto,p.moneda)} <span style={{color:"var(--dim)"}}>· {p.proveedor||"—"}</span></div><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}><SABadge tone={p.estado==="aprobado"||p.estado==="pagado"?"green":(p.estado==="rechazado"?"red":"amber")}>{p.estado}</SABadge><span style={{color:"var(--dim)",fontSize:11,whiteSpace:"nowrap"}}>{new Date(p.creado_en).toLocaleDateString("es-AR")}</span></div></div>;
                    })}
                  </div>
                </SASection>
              )}

              {detalleTab==="facturacion" && (
                <div>
                  <SASection title="Suscripción y facturación" right={<SABadge tone="gold">PRO</SABadge>}>
                    <div className="sa-kv">
                      <div>Plan: <b>{det.membresia?det.membresia.plan_nombre:"—"}</b></div>
                      <div>Estado: <b>{det.membresia?det.membresia.estado:"—"}</b></div>
                      <div>Próximo vencimiento: <b>{det.membresia&&det.membresia.fecha_vencimiento?new Date(det.membresia.fecha_vencimiento).toLocaleDateString("es-AR"):"—"}</b></div>
                      <div>Medio de pago: <b>Tarjeta / Transferencia</b></div>
                    </div>
                  </SASection>
                  <SASection title="Medios de pago">
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10}}>
                      {metodosPago.map(function(m){return <div key={m} className="op-card" style={{padding:14}}><div style={{fontSize:18}}>{m.indexOf("Tarjeta")===0?"💳":"🏦"}</div><div style={{fontWeight:700,fontSize:13,marginTop:7}}>{m}</div><div style={{fontSize:11,color:"var(--dim)",marginTop:4}}>Disponible como opción de suscripción</div></div>;})}
                    </div>
                  </SASection>
                  <SASection title="Historial de pagos">
                    <div className="sa-list">{(det.ultimos_pagos||[]).length===0?<SAEmpty>Sin pagos registrados.</SAEmpty>:(det.ultimos_pagos||[]).map(function(p){return <div key={p.id} className="op-card sa-detail-row"><div><b>{fmt$(p.monto,p.moneda)}</b><div style={{fontSize:11,color:"var(--dim)",marginTop:3}}>{p.metodo_pago||p.proveedor||"Medio no informado"}</div></div><SABadge tone={p.estado==="aprobado"||p.estado==="pagado"?"green":"amber"}>{p.estado}</SABadge></div>;})}</div>
                  </SASection>
                </div>
              )}

              {detalleTab==="actividad" && (
                <SASection title="Actividad reciente">
                  {(!det.ultima_auditoria || det.ultima_auditoria.length===0) && <SAEmpty>Sin actividad registrada.</SAEmpty>}
                  <div className="sa-detail-list">
                    {(det.ultima_auditoria||[]).map(function(a,idx){
                      return <div key={idx} className="sa-detail-row sa-activity-row"><div style={{minWidth:0,overflowWrap:"anywhere"}}>{auditIcon(a.accion)} {a.accion} <span style={{color:"var(--dim)"}}>· {a.entidad_tipo} · {a.usuario_email||"sistema"}</span></div><span style={{color:"var(--dim)",fontSize:11,whiteSpace:"nowrap"}}>{new Date(a.creada_en).toLocaleString("es-AR")}</span></div>;
                    })}
                  </div>
                </SASection>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Nuevo / editar plan */}
      <Modal open={showNuevoPlan} onClose={function(){setShowNuevoPlan(false);}} title={editPlan?"Editar plan":"Nuevo plan"}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {!editPlan && <Field label="Código (interno, sin espacios)"><input className="inp" value={planForm.codigo} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{codigo:e.target.value.toLowerCase().replace(/\s+/g,"_")});});}} placeholder="ej: profesional_plus"/></Field>}
          <Field label="Nombre"><input className="inp" value={planForm.nombre} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{nombre:e.target.value});});}} placeholder="Plan Profesional Plus"/></Field>
          <Field label="Descripción"><input className="inp" value={planForm.descripcion} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{descripcion:e.target.value});});}} placeholder="Opcional"/></Field>
          <div className="grid2">
            <Field label="Precio mensual"><input className="inp" type="number" value={planForm.precio} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{precio:e.target.value});});}} placeholder="Sin definir"/></Field>
            <Field label="Límite de usuarios"><input className="inp" type="number" value={planForm.limite} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{limite:e.target.value});});}} placeholder="10"/></Field>
          </div>
          {editPlan && (
            <div>
              <div className="field-label" style={{marginBottom:6}}>Estado</div>
              <button className="btn btn-ghost btn-sm" onClick={function(){sa.editarPlan(editPlan.id, planForm.nombre, planForm.descripcion, planForm.precio?parseFloat(planForm.precio):null, parseInt(planForm.limite), !editPlan.activo).then(function(){setShowNuevoPlan(false);});}}>{editPlan.activo?"Desactivar plan":"Activar plan"}</button>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
            <button className="btn btn-ghost" onClick={function(){setShowNuevoPlan(false);}}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardarPlan}>{editPlan?"Guardar":"Crear plan"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


function useDocWorksSession(){
  var [ready,setReady]=useState(false);
  var authSubRef=useRef(null);
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

  function cargarContexto(sb,opts){
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

  function iniciar(){
    setConnError(null);
    var cancelado = false;
    var timeoutId = setTimeout(function(){
      if (!cancelado) { setConnError("No se pudo conectar con Supabase (tardó demasiado). Revisá tu conexión e intentá de nuevo."); setReady(true); }
    }, 12000);

    loadSupabaseJs().then(function(sb){
      if (cancelado) return;
      if (!sb) { clearTimeout(timeoutId); setConnError("No se pudo cargar el cliente de Supabase (¿bloqueado por el navegador o la red?)."); setReady(true); return; }
      sb.auth.getSession().then(function(res){
        if (cancelado) return;
        clearTimeout(timeoutId);
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
        setReady(true);
      });
      var listener = sb.auth.onAuthStateChange(function(_evt, sess){
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

  useEffect(function(){
    var cancelar = iniciar();
    return function(){
      cancelar();
      if (authSubRef.current) {
        try { authSubRef.current.unsubscribe(); } catch(e) {}
        authSubRef.current = null;
      }
    };
  }, []);

  function retry(){ setReady(false); iniciar(); }

  function solicitarRegistro(datos){
    setRegistroLoading(true); setRegistroError(null); setRegistroSuccess(null);
    return loadSupabaseJs().then(function(sb){
      if(!sb){ setRegistroLoading(false); setRegistroError("No se pudo conectar con DocWorks."); return {error:true}; }
      return sb.rpc("fn_solicitar_registro_publico", { p_nombre:datos.nombre, p_email:datos.email, p_inmobiliaria:datos.inmobiliaria, p_telefono:datos.telefono||null }).then(function(res){
        setRegistroLoading(false);
        if(res.error){ setRegistroError(traducirError(res.error.message)); return {error:true}; }
        setRegistroSuccess("Solicitud enviada correctamente. Un administrador de DocWorks la revisará y, si la aprueba, recibirás la invitación por correo electrónico.");
        return {ok:true};
      });
    }).catch(function(err){ setRegistroLoading(false); setRegistroError(traducirError(err&&err.message?err.message:"No se pudo enviar la solicitud.")); return {error:true}; });
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
    setAuthAction(null); setPasswordError(null);
    loadSupabaseJs().then(function(sb){ if (sb) sb.auth.signOut(); });
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
        <span style={{fontSize:10,color:"rgba(241,245,249,.7)"}}>⌄</span>
      </button>
      {abierto&&<div style={{position:"absolute",right:0,top:"calc(100% + 7px)",minWidth:190,zIndex:500,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:12,boxShadow:"var(--shadow-lg)",padding:6}}>
        <div style={{padding:"9px 10px",borderBottom:"1px solid var(--border)",marginBottom:5}}><div style={{fontSize:11,fontWeight:700,color:"var(--text)"}}>{usuario}</div><div style={{fontSize:9.5,color:"var(--dim)",marginTop:2}}>{contexto.usuario.email||""}</div></div>
        <button type="button" onClick={function(){setAbierto(false);onLogout();}} style={{width:"100%",textAlign:"left",padding:"9px 10px",border:0,borderRadius:8,background:"transparent",color:"var(--red)",cursor:"pointer",fontSize:12,fontWeight:700}}>↪ Salir</button>
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
    created_at:u.creado_en, fotoDataUrl:u.foto_url||"", _tipo:"usuario" };
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
  var inmobId = ctx && ctx.inmobiliaria ? ctx.inmobiliaria.id : null;

  function mapRow(r, extra){
    return Object.assign({}, r.datos, { id:r.id, tipo:r.tipo, estado:r.estado, parent_id:r.parent_id }, extra||{});
  }
  function rpc(nombre, params){
    return loadSupabaseJs().then(function(sb){
      if (!sb) return { error:{ message:"No se pudo conectar con Supabase." } };
      return sb.rpc(nombre, params);
    });
  }

  function recargar(){
    if (!inmobId) { setOperaciones([]); setPapelera([]); setLoading(false); return; }
    setLoading(true); setError(null);
    Promise.all([ rpc("fn_operaciones_listar", {}), rpc("fn_operaciones_papelera", {}) ]).then(function(res){
      setLoading(false);
      if (res[0].error) { setError(traducirError(res[0].error.message)); return; }
      setOperaciones((res[0].data||[]).map(function(r){ return mapRow(r); }));
      setPapelera((res[1].error?[]:(res[1].data||[])).map(function(r){ return mapRow(r, {deleted_at:r.eliminado_en}); }));
    }).catch(function(err){ setLoading(false); setError(traducirError(err && err.message ? err.message : "No se pudieron cargar las operaciones.")); });
  }

  useEffect(function(){ recargar(); if (inmobId) rpc("fn_operaciones_purgar_vencidas", {}); }, [inmobId]);

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

  return { operaciones:operaciones, papelera:papelera, loading:loading, error:error, recargar:recargar,
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
  var ENTIDAD_LABEL = { clausula:"cláusula", bloque:"bloque", operacion:"operación", plantilla:"plantilla", usuario:"usuario", configuracion:"configuración" };
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
    if(!inmobId){ setEntries([]); setLoading(false); return; }
    setLoading(true); setError(null);
    loadSupabaseJs().then(function(sb){
      if(!sb){ setLoading(false); setError("No se pudo conectar con Supabase."); return; }
      return sb.from("auditoria").select("id,accion,entidad_tipo,valor_anterior,valor_nuevo,creada_en,usuarios!auditoria_usuario_id_fkey(nombre,email,rol_base)").order("creada_en",{ascending:false}).limit(300).then(function(res){
        setLoading(false);
        if(res.error){ setError(traducirError(res.error.message)); return; }
        setEntries((res.data||[]).map(mapEntry));
      });
    }).catch(function(err){ setLoading(false); setError(traducirError(err&&err.message?err.message:"No se pudieron cargar la auditoría.")); });
  }
  useEffect(function(){ recargar(); }, [inmobId]);
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
    }).catch(function(err){ setLoading(false); setError(traducirError(err && err.message ? err.message : "No se pudieron cargar los bloques.")); });
  }
  useEffect(function(){ recargar(); }, [inmobId]);
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
  var perfilCargado = useRef(false);
  var [perfilNubeCargado,setPerfilNubeCargado]=useState(false);
  function leer(sb){
    if(!inmobId) return Promise.resolve();
    return sb.rpc("fn_perfil_inmobiliaria_obtener",{}).then(function(res){
      if(res.error) throw res.error;
      var data=res.data;
      if(data && data._cloud_missing!==true){
        setPerfil(function(cur){ return Object.assign({},DEFAULT_PERFIL,cur,data); });
      }
      perfilCargado.current=true; setPerfilNubeCargado(true);
    }).catch(function(err){
      perfilCargado.current=true; setPerfilNubeCargado(true);
      dwNotify("error",traducirError(err&&err.message?err.message:"No se pudo sincronizar la configuración con la nube."));
    });
  }
  function guardar(sb, p){
    if(!inmobId) return Promise.resolve({error:{message:"Sin inmobiliaria activa."}});
    return sb.rpc("fn_perfil_inmobiliaria_guardar",{p_datos:p});
  }
  function guardarAhora(p){
    if(!inmobId) return Promise.resolve({error:{message:"Sin inmobiliaria activa."}});
    return loadSupabaseJs().then(function(sb){
      if(!sb) return {error:{message:"No se pudo conectar con Supabase."}};
      return guardar(sb,p);
    }).catch(function(e){ return {error:{message:e&&e.message?e.message:"No se pudo guardar el perfil."}}; });
  }
  useEffect(function(){
    perfilCargado.current=false; setPerfilNubeCargado(false);
    if(!inmobId) { setPerfilNubeCargado(true); return; }
    loadSupabaseJs().then(function(sb){ if(sb) return leer(sb); throw new Error("No se pudo conectar con Supabase."); }).catch(function(err){ perfilCargado.current=true; setPerfilNubeCargado(true); dwNotify("error",traducirError(err&&err.message?err.message:"No se pudo sincronizar la configuración con la nube.")); });
  },[inmobId]);
  return {guardarAhora:guardarAhora,cargado:perfilNubeCargado};
}

function LoginGate({docworksAuth}){
  var [registro,setRegistro]=useState(false);
  if(registro) return <RegistroScreen onBack={function(){setRegistro(false);}} onSubmit={docworksAuth.solicitarRegistro} loading={docworksAuth.registroLoading} error={docworksAuth.registroError} success={docworksAuth.registroSuccess}/>;
  return <LoginScreen onLogin={docworksAuth.login} onRecover={docworksAuth.recoverPassword} onRegister={function(){setRegistro(true);}} error={docworksAuth.loginError} loading={docworksAuth.loginLoading} connError={docworksAuth.connError}/>;
}


// ── Onboarding inicial ──────────────────────────────────────────────────────
// Recorrido guiado premium: la primera pantalla presenta DocWorks y, a partir
// del segundo paso, el modal se convierte en un tooltip compacto que ilumina
// exactamente el apartado que se está explicando. No usa blur para no degradar
// la lectura ni desenfocar el contexto de la aplicación.
function DocWorksOnboarding({ open, step, onStep, onClose, onNavigate, role }) {
  var steps = [
    { key:"inicio", title:"Bienvenido a DocWorks", text:"Te vamos a acompañar con un recorrido práctico: primero dónde empieza una operación, después cómo crear documentos, trabajar con cláusulas y usar DocWorks IA.", icon:"✦" },
    { key:"operaciones", title:"1. Operaciones", text:"Acá empieza el trabajo. Cada operación funciona como una carpeta inteligente donde quedan reunidos los datos, documentos, estados y movimientos del negocio.", icon:"▦", view:"dashboard", targetText:"Operaciones", targetKind:"nav" },
    { key:"nueva_operacion", title:"2. Crear una operación", text:"Desde «+ Nueva operación» elegís qué tipo de documento querés iniciar y cargás los datos una sola vez. DocWorks reutiliza esa información en las etapas siguientes.", icon:"＋", view:"dashboard", targetText:"+ Nueva operación", targetKind:"content" },
    { key:"documentacion", title:"3. Documentación sin repetir datos", text:"Una vez creada la operación, los documentos derivados pueden reutilizar la información ya cargada. La idea es avanzar, no volver a copiar datos entre formularios.", icon:"▤", view:"dashboard", targetText:"Operaciones", targetKind:"nav" },
    { key:"clausulas", title:"4. Cláusulas y plantillas", text:"La biblioteca guarda tu redacción profesional y permite reutilizarla por tipo de documento. Las cláusulas protegidas pueden quedar definidas por Dueño o Administrador.", icon:"§", view:"clausulas", targetText:"Cláusulas", targetKind:"nav" },
    { key:"clausulas_ia", title:"5. Cláusulas con DocWorks IA", text:"Dentro de «Crear cláusula» podés describir brevemente la idea y DocWorks IA propone el título y la redacción jurídica. Después la revisás, la editás y decidís si querés reutilizarla.", icon:"✦", view:"clausulas", targetText:"Cláusulas", targetKind:"nav" },
    { key:"calendario", title:"6. Calendario", text:"Aceptaciones, vencimientos y fechas clave quedan centralizados para que el seguimiento de cada operación tenga un lugar visible.", icon:"📅", view:"calendario", targetText:"Calendario", targetKind:"nav" },
    { key:"estadisticas", title:"7. Estadísticas", text:"Consultá actividad y métricas según el rol y los permisos del usuario. El panel te ayuda a entender qué está pasando en la inmobiliaria.", icon:"◎", view:"estadisticas", targetText:"Panel", targetKind:"nav" },
    { key:"configuracion", title:"8. Configuración y equipo", text:"Desde acá administrás equipo, permisos, apariencia, plantillas, respaldo y personalización de la inmobiliaria.", icon:"⚙", view:"configuracion", targetText:"Configuración", targetKind:"nav" },
    { key:"listo", title:"Listo para trabajar", text:"Ya conocés el recorrido principal. La ayuda queda siempre disponible abajo a la izquierda, justo encima de la lunita, para volver a ver esta guía cuando quieras.", icon:"✓" }
  ];
  if (!open) return null;
  var safeStep=Math.max(0,Math.min(step,steps.length-1));
  var current=steps[safeStep];
  var last=safeStep===steps.length-1;
  var compact=safeStep>0 && !last;
  var [targetRect,setTargetRect]=useState(null);

  function getText(el){ return ((el.innerText || el.textContent || "").replace(/\s+/g," ").trim()); }
  function findTarget(){
    if(!current.targetText) return null;
    var candidates=[];
    var nodes=document.querySelectorAll('button,a,[role="button"],input,label,h1,h2,h3,h4');
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i];
      var txt=getText(el);
      if(!txt || txt.toLowerCase()!==current.targetText.toLowerCase()) continue;
      var r=el.getBoundingClientRect();
      if(r.width<8||r.height<8) continue;
      var cs=window.getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity||'1')<0.1) continue;
      if(r.bottom<0||r.top>window.innerHeight||r.right<0||r.left>window.innerWidth) continue;
      candidates.push({el:el,rect:r});
    }
    if(!candidates.length) return null;
    if(current.targetKind==='nav'){
      candidates.sort(function(a,b){
        var aNav=a.el.closest('nav')?1:0, bNav=b.el.closest('nav')?1:0;
        if(aNav!==bNav) return bNav-aNav;
        return a.rect.top-b.rect.top;
      });
    }else{
      candidates.sort(function(a,b){ return (a.rect.top+b.rect.top)/2 - (b.rect.top+a.rect.top)/2; });
    }
    var best=candidates[0].rect;
    return {left:Math.max(8,best.left-8),top:Math.max(8,best.top-8),width:Math.min(window.innerWidth-16,best.width+16),height:Math.min(window.innerHeight-16,best.height+16)};
  }

  useEffect(function(){
    if(!compact){ setTargetRect(null); return; }
    var cancelled=false;
    var attempts=0;
    function locate(){
      if(cancelled) return;
      var r=findTarget();
      if(r){
        setTargetRect(r);
        return;
      }
      attempts+=1;
      if(attempts<12) window.setTimeout(locate,80);
      else setTargetRect(null);
    }
    var t=window.setTimeout(locate,50);
    function refresh(){
      var r=findTarget();
      if(r) setTargetRect(r);
    }
    window.addEventListener('resize',refresh);
    window.addEventListener('scroll',refresh,true);
    return function(){ cancelled=true; clearTimeout(t); window.removeEventListener('resize',refresh); window.removeEventListener('scroll',refresh,true); };
  },[safeStep,compact,current.targetText,current.targetKind]);

  function avanzar(){
    if(last){ onClose(true); return; }
    var next=steps[safeStep+1];
    if(next&&next.view&&onNavigate) onNavigate(next.view);
    onStep(safeStep+1);
  }
  function retroceder(){
    if(safeStep<=0) return;
    var prev=steps[safeStep-1];
    if(prev&&prev.view&&onNavigate) onNavigate(prev.view);
    onStep(safeStep-1);
  }

  var spotlight = targetRect ? (
    <>
      <div style={{position:"fixed",left:targetRect.left,top:targetRect.top,width:targetRect.width,height:targetRect.height,zIndex:5001,borderRadius:14,boxShadow:"0 0 0 9999px rgba(3,8,18,0.70),0 0 0 1px rgba(212,168,83,0.78),0 10px 32px rgba(0,0,0,0.22)",pointerEvents:"none",transition:"left .22s ease,top .22s ease,width .22s ease,height .22s ease"}}/>
    </>
  ) : null;

  var tooltipStyle={
    position:"fixed",zIndex:5002,width:"min(350px,calc(100vw - 28px))",padding:"17px 18px 16px",
    border:"1px solid rgba(212,168,83,.34)",borderRadius:16,
    background:"linear-gradient(145deg,rgba(16,25,43,.985),rgba(8,14,26,.995))",
    boxShadow:"0 22px 60px rgba(0,0,0,.48),0 0 30px rgba(212,168,83,.08)",color:"#f8fafc"
  };

  function tooltipPosition(){
    if(!targetRect) return {left:14,bottom:18};
    var top=targetRect.top+targetRect.height+14;
    var left=targetRect.left;
    if(top+230>window.innerHeight) top=Math.max(14,targetRect.top-244);
    left=Math.min(Math.max(14,left),Math.max(14,window.innerWidth-364));
    return {left:left,top:top};
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:5000,background:compact?"rgba(3,8,18,.06)":"rgba(3,8,18,.78)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",pointerEvents:compact?"none":"auto"}}>
      {compact&&spotlight}
      {!compact ? (
        <div role="dialog" aria-modal="true" aria-label="Introducción a DocWorks" style={{width:"min(620px,100%)",border:"1px solid rgba(212,168,83,.35)",borderRadius:24,background:"linear-gradient(145deg,rgba(16,25,43,.99),rgba(8,14,26,1))",boxShadow:"0 30px 90px rgba(0,0,0,.55),0 0 40px rgba(212,168,83,.08)",overflow:"hidden",pointerEvents:"auto"}}>
          <div style={{height:4,background:"linear-gradient(90deg,var(--gold),var(--gold2),transparent)"}}/>
          <div style={{padding:"26px 28px 24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:22}}>
              <div style={{display:"flex",alignItems:"center",gap:11}}>
                <div style={{width:42,height:42,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.25)",color:"var(--gold)",fontSize:21}}>{current.icon}</div>
                <div>
                  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1.3,color:"var(--gold)",fontWeight:700}}>DocWorks · Introducción</div>
                  <div style={{fontSize:12,color:"#cbd5e1",marginTop:3}}>Paso 1 de {steps.length}</div>
                </div>
              </div>
              <button type="button" onClick={function(){onClose(false);}} aria-label="Cerrar recorrido" style={{width:34,height:34,borderRadius:10,border:"1px solid rgba(255,255,255,.20)",background:"rgba(255,255,255,.04)",color:"#dbe5f1",cursor:"pointer",fontSize:18}}>×</button>
            </div>
            <div style={{display:"flex",gap:5,marginBottom:24}}>{steps.map(function(_,i){return <div key={i} style={{height:4,flex:1,borderRadius:10,background:i===0?"var(--gold)":"rgba(255,255,255,.09)"}}/>;})}</div>
            <h2 style={{margin:"0 0 12px",fontSize:28,lineHeight:1.14,color:"#f8fafc",letterSpacing:-.5}}>{current.title}</h2>
            <p style={{margin:0,fontSize:15,lineHeight:1.75,color:"#dbe5f1",maxWidth:540}}>{current.text}</p>
            <div style={{marginTop:20,padding:"12px 14px",borderRadius:12,background:"rgba(212,168,83,.07)",border:"1px solid rgba(212,168,83,.16)",fontSize:12.5,color:"#dbe5f1"}}>No necesitás memorizar nada. La idea es que DocWorks te acompañe y te muestre qué hacer en cada etapa.</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginTop:20}}>
              <button type="button" onClick={function(){onClose(false);}} style={{border:0,background:"transparent",color:"#cbd5e1",cursor:"pointer",fontSize:12.5,padding:"10px 0"}}>Omitir recorrido</button>
              <button type="button" onClick={avanzar} style={{height:42,padding:"0 21px",borderRadius:11,border:"1px solid rgba(212,168,83,.65)",background:"linear-gradient(135deg,var(--gold),var(--gold2))",color:"#101010",fontWeight:800,cursor:"pointer",boxShadow:"0 5px 18px rgba(212,168,83,.18)"}}>Comenzar recorrido</button>
            </div>
          </div>
        </div>
      ) : (
        <div role="dialog" aria-modal="true" aria-label={current.title} style={Object.assign({},tooltipStyle,tooltipPosition(),{pointerEvents:"auto"})}>
          <div style={{display:"flex",alignItems:"flex-start",gap:11}}>
            <div style={{width:32,height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.22)",color:"var(--gold)",fontSize:16,flex:"0 0 auto"}}>{current.icon}</div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:10.5,textTransform:"uppercase",letterSpacing:1.1,color:"var(--gold)",fontWeight:800}}>DocWorks · Guía</div>
              <div style={{fontSize:16,fontWeight:800,lineHeight:1.25,marginTop:2,color:"#f8fafc"}}>{current.title}</div>
            </div>
            <button type="button" onClick={function(){onClose(false);}} aria-label="Cerrar recorrido" style={{border:0,background:"transparent",color:"#cbd5e1",cursor:"pointer",fontSize:17,lineHeight:1,padding:2}}>×</button>
          </div>
          <p style={{margin:"11px 0 0",fontSize:12.5,lineHeight:1.58,color:"#dbe5f1"}}>{current.text}</p>
          {!targetRect&&<div style={{marginTop:10,fontSize:11,color:"#cbd5e1"}}>Estoy ubicando este apartado…</div>}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginTop:13}}>
            <div style={{fontSize:10.5,color:"#94a3b8"}}>Paso {safeStep} de {steps.length-1}</div>
            <div style={{display:"flex",gap:7}}>
              <button type="button" onClick={retroceder} style={{height:34,padding:"0 11px",borderRadius:9,border:"1px solid rgba(255,255,255,.16)",background:"rgba(255,255,255,.04)",color:"#f8fafc",fontSize:11.5,fontWeight:700,cursor:"pointer"}}>Anterior</button>
              <button type="button" onClick={avanzar} style={{height:34,padding:"0 13px",borderRadius:9,border:"1px solid rgba(212,168,83,.62)",background:"linear-gradient(135deg,var(--gold),var(--gold2))",color:"#101010",fontSize:11.5,fontWeight:800,cursor:"pointer"}}>Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App(){
  var docworksAuth = useDocWorksSession();
  var equipoSupabase = useEquipoSupabase(docworksAuth.contexto);
  var opsSupabase = useOperacionesSupabase(docworksAuth.contexto);
  var auditoriaSupabase = useAuditoriaSupabase(docworksAuth.contexto);
  var bloquesSupabase = useBloquesReservaSupabase(docworksAuth.contexto);
  const [darkMode,setDarkMode]=useState(function(){ return lsGet("darkMode", false); });
  const [topSearch,setTopSearch]=useState(function(){return lsGet("top_search_v1","");});
  const [topSearchFocus,setTopSearchFocus]=useState(false);
  const [recentSearches,setRecentSearches]=useState(function(){return lsGet("recent_searches_v1",[]);});
  const [recentOperationIds,setRecentOperationIds]=useState(function(){return lsGet("recent_operation_ids_v1",[]);});
  useEffect(function(){ lsSet("top_search_v1",topSearch||""); },[topSearch]);
  useEffect(function(){ lsSet("recent_searches_v1",recentSearches||[]); },[recentSearches]);
  useEffect(function(){ lsSet("recent_operation_ids_v1",recentOperationIds||[]); },[recentOperationIds]);
  useEffect(function(){injectFonts();loadRecharts();applyTheme(darkMode);initPWA();if(!document.getElementById("dw-mobile-stability-css")){var st=document.createElement("style");st.id="dw-mobile-stability-css";st.textContent=MOBILE_STABILITY_CSS;document.head.appendChild(st);}},[darkMode]);
  const [showSplash,setShowSplash]=useState(function(){return !lsGet("splash_seen_v1",false);});
  const [dwNotice,setDwNotice]=useState(null);
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
  useEffect(function(){
    function goOnline(){ setIsOnline(true); }
    function goOffline(){ setIsOnline(false); }
    function onBeforeInstall(e){ e.preventDefault(); setDeferredInstallPrompt(e); }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return function(){
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);
  function instalarApp(){
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(function(){ setDeferredInstallPrompt(null); });
  }
  const [view,setView]=useState(function(){return lsGet("last_view_v1","dashboard");});
  useEffect(function(){lsSet("last_view_v1",view||"dashboard");},[view]);
  const [showForm,setShowForm]=useState(false);
  const [editOp,setEditOp]=useState(null);
  const [formInitialOverride,setFormInitialOverride]=useState(null); // prefill de un borrador recuperado (operación nueva, sin guardar aún)
  const [draftPrompt,setDraftPrompt]=useState(null); // borrador pendiente detectado al abrir la app
  const [confirmCloseForm,setConfirmCloseForm]=useState(false);
  const [formTipo,setFormTipo]=useState("reserva");
  const [viewDoc,setViewDoc]=useState(null);
  const [docTab,setDocTab]=useState("resumen");
  const [docAutoAction,setDocAutoAction]=useState(null); // "pdf"|"docx"|"whatsapp"|null — acción a disparar automáticamente al abrir el visor (menú "Finalizar")
  function abrirDoc(op){ setViewDoc(op); setDocTab(op&&op.tipo==="reserva" ? "reserva" : "resumen"); }
  function cerrarFormularioSeguro(){
    var draft=lsGet("draftOperacion",null);
    if(draft&&draft.data&&draftTieneContenido(draft.data)){setConfirmCloseForm(true);return;}
    setShowForm(false);setEditOp(null);setFormInitialOverride(null);
  }
  async function guardarBorradorYSalir(){
    var draft=lsGet("draftOperacion",null);
    if(draft&&draft.data&&draftTieneContenido(draft.data)){
      var existingId=draft.editId||null;
      var op;
      if(existingId){
        var existente=operaciones.find(function(o){return o.id===existingId;});
        op=Object.assign({},existente||{},draft.data,{id:existingId,created_at:(existente&&existente.created_at)||new Date().toISOString(),estado:"borrador"});
      } else {
        op=Object.assign({},draft.data,{id:genId(),created_at:new Date().toISOString(),estado:"borrador"});
      }
      var previoBorrador=existingId?operaciones.find(function(o){return o.id===existingId;}):null;
      setOperaciones(function(ops){return existingId?ops.map(function(o){return o.id===existingId?op:o;}):[op].concat(ops);});
      var saveDraftRes;
      try { saveDraftRes=await opsSupabase.guardar(op); } catch(e) { saveDraftRes={error:e}; }
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
  const [clausulasLoading,setClausulasLoading]=useState(true);
  const [clausulasError,setClausulasError]=useState(null);
  function recargarClausulas(){
    var inmobId = docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null;
    if (!inmobId) { setClausulas([]); setClausulasLoading(false); return; }
    setClausulasLoading(true);
    loadSupabaseJs().then(function(sb){
      if (!sb) { setClausulasLoading(false); setClausulasError("No se pudo conectar con Supabase."); return; }
      return sb.from("clausulas").select("*").order("orden").then(function(res){
        if (res.error) { setClausulasLoading(false); setClausulasError(traducirError(res.error.message)); return; }
        var activas = (res.data||[]).filter(function(c){return c.activo!==false;}).map(function(c){ return Object.assign({},c,{titulo:(c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título"}); });
        if (activas.length===0) {
          sb.rpc("fn_clausulas_sembrar",{}).then(function(seedRes){
            if(seedRes&&seedRes.error){ setClausulasLoading(false); setClausulasError(traducirError(seedRes.error.message)); return; }
            return sb.from("clausulas").select("*").order("orden").then(function(res2){
              setClausulasLoading(false);
              if (res2.error) { setClausulasError(traducirError(res2.error.message)); return; }
              setClausulas((res2.data||[]).filter(function(c){return c.activo!==false;}).map(function(c){ return Object.assign({},c,{titulo:(c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título"}); }));
            });
          }).catch(function(err){ setClausulasLoading(false); setClausulasError(traducirError(err&&err.message?err.message:"No se pudieron inicializar las cláusulas.")); });
        } else {
          setClausulasLoading(false);
          setClausulas(activas);
        }
      });
    }).catch(function(err){ setClausulasLoading(false); setClausulasError(traducirError(err && err.message ? err.message : "No se pudieron cargar cláusulas.")); });
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

  useEffect(function(){ recargarClausulas(); }, [docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null]);
  useEffect(function(){ asegurarDatosInicialesInmobiliaria(); }, [docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null]);
  // Fase 1 — sistema de bloques (piloto Reserva). Guardado aparte de
  // `clausulas` (biblioteca de cláusulas adicionales) porque son dos
  // conceptos distintos: esto es el CUERPO FIJO del documento.
  const [bloquesReserva,setBloquesReserva]=useState([]);
  useEffect(function(){ if (bloquesSupabase.bloques.length || !bloquesSupabase.loading) setBloquesReserva(bloquesSupabase.bloques); }, [bloquesSupabase.bloques, bloquesSupabase.loading]);
  const [perfil,setPerfil]=useState(function(){ return Object.assign({},DEFAULT_PERFIL,lsGet("perfil", {})); });
  var perfilNube=usePerfilSupabase(docworksAuth.contexto, perfil, setPerfil);
  var perfilInicializadoRef=useRef({});
  var perfilNubeCargado=!!perfilNube.cargado;
  useEffect(function(){
    var inmobId=docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null;
    if(!inmobId || !perfilNubeCargado || perfilInicializadoRef.current[inmobId]) return;
    var timer=setTimeout(function(){
      setPerfil(function(cur){
        if(cur.plantillas && Object.keys(cur.plantillas).length>0){ perfilInicializadoRef.current[inmobId]=true; return cur; }
        var mapa={};
        PLANTILLA_TIPOS.forEach(function(tipo){
          var ids=CLAUSULAS_DEFAULT.filter(function(c){return clausulaAplicaTipo(c,tipo);}).map(function(c){return c.id;});
          mapa[tipo]={clausulas_ids:ids,locked:false};
        });
        var next=Object.assign({},cur,{plantillas:mapa,clausulas_default_ids:mapa.reserva?mapa.reserva.clausulas_ids.slice():[],clausulas_default_locked:false});
        perfilInicializadoRef.current[inmobId]=true;
        perfilNube.guardarAhora(next).catch(function(err){ dwNotify("error","No se pudo guardar la configuración inicial de plantillas."); });
        return next;
      });
    },1200);
    return function(){clearTimeout(timer);};
  },[docworksAuth.contexto && docworksAuth.contexto.inmobiliaria ? docworksAuth.contexto.inmobiliaria.id : null, perfilNubeCargado]);
  const [equipo,setEquipo]=useState(function(){ return lsGet("equipo", DEFAULT_EQUIPO); });
  useEffect(function(){ if (equipoSupabase.equipo.length || !equipoSupabase.loading) setEquipo(equipoSupabase.equipo); }, [equipoSupabase.equipo]);
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
    return loadSupabaseJs().then(function(sb){
      if (!sb) return { error:{ message:"No se pudo conectar con Supabase." } };
      return sb.rpc(nombre, params);
    });
  }
  function addClausula(c){
    clausulaRpc("fn_clausula_crear", { p_titulo:c.titulo, p_contenido:c.contenido, p_categoria:c.categoria||"general", p_tipos:c.tipos||["todos"], p_obligatoria:!!c.obligatoria, p_proteccion:"B" }).then(function(res){
      if (res.error) { setClausulasError(traducirError(res.error.message)); return; }
      recargarClausulas();
    });
  }
  function editClausula(id,d){
    var anterior = clausulas.find(function(c){return c.id===id;});
    var nueva = anterior ? Object.assign({},anterior,d) : d;
    clausulaRpc("fn_clausula_editar", { p_clausula_id:id, p_titulo:nueva.titulo, p_contenido:nueva.contenido, p_categoria:nueva.categoria||null, p_tipos:nueva.tipos||null, p_obligatoria:typeof nueva.obligatoria==="boolean"?nueva.obligatoria:null }).then(function(res){
      if (res.error) { setClausulasError(traducirError(res.error.message)); return; }
      recargarClausulas();
    });
  }
  function deleteClausula(id){
    clausulaRpc("fn_clausula_eliminar", { p_clausula_id:id }).then(function(res){
      if (res.error) { setClausulasError(traducirError(res.error.message)); return; }
      recargarClausulas();
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
    setBloquesReserva(function(bs){
      return bs.map(function(b){ return b.id===id ? Object.assign({},b,cambios) : b; });
    });
    if (actual && actual._dbId) {
      return bloquesSupabase.editar(actual._dbId, cambios.titulo!==undefined?cambios.titulo:actual.titulo, cambios.contenido!==undefined?cambios.contenido:actual.contenido);
    }
    return Promise.resolve({});
  }
  function moveBloqueReserva(id, dir){
    setBloquesReserva(function(bs){
      var ordenados = bs.slice().sort(function(a,b){return (a.orden||0)-(b.orden||0);});
      var idx = ordenados.findIndex(function(b){return b.id===id;});
      var swapIdx = dir==="up" ? idx-1 : idx+1;
      if(idx<0||swapIdx<0||swapIdx>=ordenados.length) return bs;
      var a=ordenados[idx], b2=ordenados[swapIdx];
      var ordenTmp = a.orden;
      if (a._dbId) bloquesSupabase.mover(a._dbId, b2.orden);
      if (b2._dbId) bloquesSupabase.mover(b2._dbId, ordenTmp);
      ordenados[idx] = Object.assign({}, a, { orden: b2.orden });
      ordenados[swapIdx] = Object.assign({}, b2, { orden: ordenTmp });
      return bs.map(function(b){
        var actualizado = ordenados.find(function(o){return o.id===b.id;});
        return actualizado || b;
      });
    });
  }
  // Papelera: operaciones eliminadas quedan acá con su fecha de borrado y se
  // pueden restaurar hasta 30 días después; pasado ese plazo se purgan solas.
  const [papelera,setPapelera]=useState([]);
  const [papeleraJump,setPapeleraJump]=useState(0);
  const [confirmVaciarPapelera,setConfirmVaciarPapelera]=useState(false);
  const [operaciones,setOperaciones]=useState([]);
  // Fuente de verdad: Supabase. Se sincroniza acá en vez de usar localStorage,
  // así funciona igual en el celular y en la PC (y entre usuarios del equipo).
  useEffect(function(){ if (opsSupabase.operaciones.length || !opsSupabase.loading) setOperaciones(opsSupabase.operaciones); }, [opsSupabase.operaciones, opsSupabase.loading]);
  useEffect(function(){ if (opsSupabase.papelera.length || !opsSupabase.loading) setPapelera(opsSupabase.papelera); }, [opsSupabase.papelera, opsSupabase.loading]);
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
    return { ok:true };
  }

  async function saveOp(data,accion,estadoFinal){
    var esNueva=!editOp;
    var opGuardada;
    if(editOp){
      opGuardada=Object.assign({},data,{id:editOp.id,created_at:editOp.created_at});
    } else {
      opGuardada=Object.assign({},data,{id:genId(),created_at:new Date().toISOString()});
    }
    var estadoElegido=(estadoFinal==="activo"||estadoFinal==="cerrado"||estadoFinal==="borrador")?estadoFinal:(accion==="borrador"?"borrador":(opGuardada.estado||"activo"));
    opGuardada.estado=estadoElegido;
    reportSave("saving");
    try {
      var res=await opsSupabase.guardar(opGuardada);
      if(res&&res.error){
        reportSave("error");
        return;
      }
      setOperaciones(function(ops){
        var base = esNueva ? [opGuardada].concat(ops) : ops.map(function(o){return o.id===editOp.id?opGuardada:o;});
        if(opGuardada.tipo==="devolucion_reserva" && opGuardada.parent_id && opGuardada.estado!=="borrador") {
          return base.map(function(o){return o.id===opGuardada.parent_id?Object.assign({},o,{proceso_estado:"rechazada",estado:"cerrado"}):o;});
        }
        return base;
      });
      if(opGuardada.tipo==="devolucion_reserva" && opGuardada.parent_id && opGuardada.estado!=="borrador") {
        var parent=operaciones.find(function(o){return o.id===opGuardada.parent_id;});
        if(parent) opsSupabase.guardar(Object.assign({},parent,{proceso_estado:"rechazada",estado:"cerrado"}));
      }
      reportSave("saved");
      lsRemove("draftOperacion");
      setShowForm(false);setEditOp(null);setFormInitialOverride(null);
      if(accion==="pdf"||accion==="whatsapp"){
        setDocAutoAction(accion==="whatsapp"?"whatsapp":null);
        abrirDoc(opGuardada);
      }
    } catch(e) {
      reportSave("error");
    }
  }
  // "Eliminar" mueve la operación a la Papelera en vez de borrarla en el momento:
  // queda recuperable ahí durante 30 días. Ya no depende de window.confirm()
  // (que podía fallar silenciosamente dentro de un WebView), porque al ser
  // recuperable no hace falta pedir confirmación previa.
  function deleteOp(id){
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
    setOperaciones(function(ops){
      var existe=ops.some(function(o){return o.id===next.id;});
      return existe ? ops.map(function(o){return o.id===next.id?next:o;}) : [next].concat(ops);
    });
    var res;
    try { res=await opsSupabase.guardar(next); } catch(e) { res={error:e}; }
    if(res&&res.error){
      if(previo){
        setOperaciones(function(ops){return ops.map(function(o){return o.id===next.id?previo:o;});});
      } else {
        setOperaciones(function(ops){return ops.filter(function(o){return o.id!==next.id;});});
      }
    }
    return res;
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
  function duplicarOp(op){var copia=Object.assign({},op,{id:genId(),estado:"borrador",created_at:new Date().toISOString()});setOperaciones(function(ops){return[copia].concat(ops);});opsSupabase.guardar(copia);}
  // Una operación sólo puede dar origen a UN documento derivado de cada tipo (un solo
  // Comodato, un solo Refuerzo, un solo Contrato desde Reserva de Locación). Esto evita
  // duplicados y mantiene la "carpeta" de la operación prolija.
  function yaConvertido(opId, tipoHijo){ return operaciones.some(function(o){return o.parent_id===opId && o.tipo===tipoHijo;}); }
  function convertirAContrato(op){
    if(yaConvertido(op.id,"alquiler")) return;
    var nuevo=Object.assign({},EMPTY_OP,{tipo:"alquiler",estado:"borrador",parent_id:op.id,locador_nombre:op.locador_nombre,locador_dni:op.locador_dni,locador_domicilio:op.locador_domicilio,locador_email:op.locador_email,locatario_nombre:op.locatario_nombre,locatario_dni:op.locatario_dni,locatario_domicilio:op.locatario_domicilio,locatario_email:op.locatario_email,inmueble_direccion:op.inmueble_direccion,inmueble_partido:op.inmueble_partido,inmueble_provincia:op.inmueble_provincia,nomenclatura_catastral:op.nomenclatura_catastral,descripcion_inmueble:op.descripcion_inmueble,inmueble_tipo:op.inmueble_tipo||"departamento",alquiler_monto_inicial:op.res_alq_monto_mensual||"",alquiler_moneda:op.res_alq_moneda||op.res_alq_monto_mensual_moneda||"ARS",alquiler_plazo_meses:op.res_alq_plazo_meses||"24",alquiler_inicio:"",alquiler_destino:op.res_alq_destino||"vivienda",alquiler_comision:op.res_alq_comision||"1",clausulas_ids:op.clausulas_ids||[],clausulas_custom:op.clausulas_custom||""});
    var conId=Object.assign({},nuevo,{id:genId(),created_at:new Date().toISOString()});
    setOperaciones(function(ops){return[conId].concat(ops);});
    opsSupabase.guardar(conId);
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
    setOperaciones(function(ops){return[conId].concat(ops);});
    opsSupabase.guardar(conId);
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
    setOperaciones(function(ops){return[conId].concat(ops);});
    opsSupabase.guardar(conId);
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
      precio:op.precio||"", moneda:op.moneda||"USD", anticipo:op.anticipo||"", comision_porcentaje:op.comision_porcentaje||"3",
      // A pedir de nuevo: fecha de posesión/firma y datos de escribanía.
      fecha_posesion:"", escribania:"", escribania_observaciones:"", saldo:"",
      clausulas_ids:op.clausulas_ids||[], clausulas_custom:op.clausulas_custom||"",
    });
    var conId=Object.assign({},nuevo,{id:genId(),created_at:new Date().toISOString()});
    setOperaciones(function(ops){return[conId].concat(ops);});
    opsSupabase.guardar(conId);
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
      // Vendedor de la reserva → Comodante (propietario)
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
    setOperaciones(function(ops){return[conId].concat(ops);});
    opsSupabase.guardar(conId);
    setEditOp(conId); setFormTipo("comodato"); setShowForm(true);
  }

  const navItems=[
    {id:"dashboard",   label:"Operaciones",  icon:"▦"},
    {id:"estadisticas",label:"Estadísticas",  icon:"◎"},
    {id:"calendario",  label:"Calendario",    icon:"📅"},
    {id:"clausulas",   label:"Cláusulas",     icon:"§"},
    {id:"configuracion",label:"Configuración",icon:"⚙"},
  ];
  const mobileNavItems=[
    {id:"dashboard",    label:"Operaciones",  icon:"▦"},
    {id:"estadisticas", label:"Panel",        icon:"◎"},
    {id:"calendario",   label:"Calendario",   icon:"📅"},
    {id:"clausulas",    label:"Cláusulas",    icon:"§"},
    {id:"configuracion",label:"Configuración", icon:"⚙"},
  ];

  const [showBot,setShowBot]=useState(false);
  const onboardingStorageKey = "docworks_onboarding_seen_v1_" + ((docworksAuth.contexto && docworksAuth.contexto.usuario && docworksAuth.contexto.usuario.id) || "local");
  const [showOnboarding,setShowOnboarding]=useState(false);
  const [onboardingStep,setOnboardingStep]=useState(0);
  useEffect(function(){
    if (!docworksAuth.session || !docworksAuth.contexto || !docworksAuth.contexto.usuario) return;
    var seen=lsGet(onboardingStorageKey,false);
    if(!seen){
      var t=setTimeout(function(){setShowOnboarding(true);setOnboardingStep(0);},650);
      return function(){clearTimeout(t);};
    }
  },[docworksAuth.session,docworksAuth.contexto,onboardingStorageKey]);
  function cerrarOnboarding(){
    lsSet(onboardingStorageKey,true);
    setShowOnboarding(false);
  }
  function abrirOnboarding(){
    setOnboardingStep(0);
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
      <GStyles/>
      {showSplash&&<SplashScreen onDone={function(){lsSet("splash_seen_v1",true);setShowSplash(false);}}/>}
      <div className="app-bg"/>

      {/* ── Banner de estado offline: los datos siguen disponibles y editables
          (todo vive en localStorage), pero avisamos que no hay conexión para
          que se sepa que no se puede compartir/enviar hasta reconectar. ── */}
      {!isOnline&&(
        <div style={{position:"sticky",top:0,zIndex:200,background:"#7a4a0a",color:"#fff",fontSize:12.5,fontWeight:600,textAlign:"center",padding:"6px 12px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span>📡 Sin conexión — seguís pudiendo redactar y guardar, tus datos están a salvo en este dispositivo.</span>
        </div>
      )}

      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-logo">
          <img src={LOGO_B64} alt="DocWorks" style={{height:30,width:"auto",objectFit:"contain"}}/>
          <span className="mobile-logo-text">DocWorks <span style={{fontSize:10,opacity:0.7}}>v{DOCWORKS_VERSION}</span></span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={function(){setView("dashboard");setPapeleraJump(function(n){return n+1;});}} title="Papelera" style={{position:"relative",width:34,height:34,borderRadius:10,border:"1px solid var(--border2)",background:"transparent",color:"var(--muted)",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            🗑
            {papelera.length>0&&<span style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,borderRadius:20,background:"var(--red)",color:"#fff",fontSize:9.5,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{papelera.length}</span>}
          </button>
          <Btn onClick={function(){setEditOp(null);setFormTipo("reserva");setShowForm(true);}} s="sm">+ Nueva</Btn>
          <button className="mobile-topbar-avatar topbar-avatar" onClick={function(){setView("configuracion");}} title="Perfil y configuración" aria-label="Perfil y configuración">
            {(ctx&&ctx.usuario&&perfil.broker_fotos&&perfil.broker_fotos[ctx.usuario.id])
              ? <img src={perfil.broker_fotos[ctx.usuario.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="Foto de perfil"/>
              : (ctx&&ctx.usuario&&formatearNombreUsuarioVisible(ctx).charAt(0).toUpperCase()||"👤")
            }
          </button>
        </div>
      </div>

      <div className="app-wrap">

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="topbar-logo">
            <img src={LOGO_B64} alt="DocWorks" style={{height:42,maxWidth:152,width:"auto",objectFit:"contain",objectPosition:"left center",display:"block",filter:"drop-shadow(0 0 12px rgba(212,168,83,0.5))"}}/>
            <div className="topbar-logo-text">DocWorks <span style={{fontSize:10,opacity:0.65,fontFamily:"DM Sans,sans-serif",fontWeight:500}}>v{DOCWORKS_VERSION}</span></div>
          </div>

          <div className="topbar-search" style={{position:"relative"}}>
            <button type="button" className="topbar-search-icon" onClick={function(){registrarBusqueda(topSearch);setTopSearchFocus(false);if(view!=="dashboard")setView("dashboard");}} aria-label="Buscar" title="Buscar"><DWIcon name="search" size={16} strokeWidth={2}/></button>
            <input value={topSearch}
              onFocus={function(){setTopSearchFocus(true);}}
              onBlur={function(){setTimeout(function(){setTopSearchFocus(false);},160);}}
              onKeyDown={function(e){if(e.key==="Enter"){registrarBusqueda(topSearch);setTopSearchFocus(false);}}}
              onChange={function(e){setTopSearch(e.target.value);if(view!=="dashboard")setView("dashboard");}}
              placeholder="Buscar operaciones, DNI, CUIT, domicilios..." aria-label="Buscar operaciones, DNI, CUIT, domicilios"/>
            {topSearchFocus&&!topSearch&&searchHasHistory&&<div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,minWidth:340,maxWidth:520,zIndex:190,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:14,boxShadow:"0 18px 50px rgba(0,0,0,.16)",padding:10}}>
              {recentOps.length>0&&<div>
                <div style={{fontSize:10,fontWeight:800,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",padding:"3px 6px 7px"}}>Operaciones buscadas recientemente</div>
                {recentOps.slice(0,5).map(function(ro){return <button key={ro.id} type="button" onMouseDown={function(e){e.preventDefault();setTopSearch("");setTopSearchFocus(false);setView("dashboard");abrirDoc(ro);}} style={{width:"100%",border:"none",background:"transparent",padding:"8px 7px",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",gap:8,textAlign:"left",color:"var(--text)"}}><span style={{color:"var(--gold)",display:"inline-flex"}}><DWIcon name="folder" size={14}/></span><span style={{minWidth:0}}><span style={{display:"block",fontSize:11.5,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tipoInmuebleLabel(ro.inmueble_tipo,ro.inmueble_tipo_otro)+(ro.inmueble_direccion?" — "+ro.inmueble_direccion:"")}</span><span style={{display:"block",fontSize:10,color:"var(--dim)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nombreConSufijo(ro,ro.tipo==="alquiler"||ro.tipo==="reserva_alquiler"?"locatario":"comprador",ro.tipo==="alquiler"||ro.tipo==="reserva_alquiler"?"Locatario":"Comprador")}</span></span></button>;})}
              </div>}
              {recentSearches.length>0&&<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--border2)"}}>
                <div style={{fontSize:10,fontWeight:800,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",padding:"3px 6px 7px"}}>Búsquedas recientes</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"0 6px 3px"}}>{recentSearches.slice(0,6).map(function(q,i){return <button key={q+"-"+i} type="button" onMouseDown={function(e){e.preventDefault();setTopSearch(q);setTopSearchFocus(false);setView("dashboard");registrarBusqueda(q);}} style={{border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--text)",borderRadius:20,padding:"5px 8px",fontSize:10.5,cursor:"pointer"}}>{q}</button>;})}</div>
              </div>}
            </div>}
          </div>

          <div className="topbar-right">
            <SesionBadge contexto={ctx} onLogout={docworksAuth.logout} foto={ctx&&ctx.usuario&&perfil&&perfil.broker_fotos&&perfil.broker_fotos[ctx.usuario.id]||""}/>
          </div>
        </div>

        {/* ── BODY: sidebar + main ── */}
        <div className="app-body">

          {/* ── Icon sidebar ── */}
          <aside className="sidebar">
            {navItems.map(function(n){
              return(
                <button key={n.id} className={"nav-item premium-nav-item "+(view===n.id?"active":"")} onClick={function(){setView(n.id);}}>
                  <span>{n.icon}</span>
                  <span className="tooltip">{n.label}</span>
                </button>
              );
            })}
            <div className="sidebar-spacer"/>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,paddingBottom:8}}>
              <button type="button" onClick={abrirOnboarding} title="Ayuda y recorrido de DocWorks" aria-label="Ayuda y recorrido de DocWorks" style={{width:34,height:34,borderRadius:10,border:"1px solid var(--border2)",background:"var(--surface2)",color:"var(--muted)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(0,0,0,.08)"}}><DWIcon name="help" size={16} strokeWidth={1.8}/></button>
              <button type="button" className="sidebar-bottom-icon" onClick={function(){toggleDark();}} title={darkMode?"Cambiar a modo claro":"Cambiar a modo oscuro"} aria-label={darkMode?"Cambiar a modo claro":"Cambiar a modo oscuro"}>
                {darkMode?"☀":"☾"}
              </button>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="main">
            <div className="content">
              {view==="dashboard"&&<DashboardView operaciones={operaciones} clausulas={clausulas} perfil={perfil} bloquesReserva={bloquesReserva} searchOverride={topSearch} onNew={function(){setEditOp(null);setFormTipo("reserva");setShowForm(true);}} onEdit={function(op){setEditOp(op);setFormTipo(op.tipo||"reserva");setShowForm(true);}} onDelete={deleteOp} onChangeEstado={changeEstado} onConvertir={convertirAContrato} onConvertirComodato={convertirAComodato} onConvertirRefuerzo={convertirARefuerzo} onConvertirBoleto={convertirABoleto} onConvertirDevolucion={onConvertirDevolucion} onDuplicar={duplicarOp} onViewDoc={function(op){abrirDoc(op);}} onPerfil={function(){setView("configuracion");}} papelera={papelera} onRestore={restoreOp} onDeletePermanente={deleteOpPermanente} onVaciarPapelera={vaciarPapelera} confirmVaciarPapelera={confirmVaciarPapelera} setConfirmVaciarPapelera={setConfirmVaciarPapelera} papeleraJump={papeleraJump} error={opsSupabase.error} loading={opsSupabase.loading}/>}
              {view==="calendario"&&<CalendarioView operaciones={operaciones} onViewOp={function(op){abrirDoc(op);}}/>}
              {view==="clausulas"&&<ClausulasView clausulas={clausulas} onAdd={addClausula} onEdit={editClausula} onDelete={deleteClausula} puedeEditar={perfil.rol==="dueno"||perfil.rol==="admin"} rolLabel={ROLES_DEF[perfil.rol]?.label||perfil.rol} error={clausulasError} loading={clausulasLoading} ocultarProtegidasIds={(perfil.rol==="broker"||perfil.rol==="vendedor"||perfil.rol==="viewer")?obtenerIdsProtegidosDePlantillas(perfil):[]}/>}
              {view==="estadisticas"&&<EstadisticasView operaciones={operaciones} equipo={equipo} perfil={perfil} currentUserId={docworksAuth.contexto && docworksAuth.contexto.usuario ? docworksAuth.contexto.usuario.id : null} currentUserRole={docworksAuth.contexto && docworksAuth.contexto.usuario ? docworksAuth.contexto.usuario.rol_base : perfil.rol}/>}
              {view==="configuracion"&&<ConfiguracionView perfil={perfil} onChange={function(p){ setPerfil(p); return perfilNube.guardarAhora(p); }} currentUserId={docworksAuth.contexto && docworksAuth.contexto.usuario ? docworksAuth.contexto.usuario.id : null} darkMode={darkMode} onToggleDark={toggleDark} equipo={equipo} equipoSupabase={equipoSupabase} operaciones={operaciones} clausulas={clausulas} onAddClausula={addClausula} onEditClausula={editClausula} onDeleteClausula={deleteClausula} onMoveClausula={moveClausula} onDuplicateClausula={duplicateClausula} bloquesReserva={bloquesReserva} onUpdateBloqueReserva={updateBloqueReserva} onMoveBloqueReserva={moveBloqueReserva} bloquesError={bloquesSupabase.error} bloquesLoading={bloquesSupabase.loading} papelera={papelera} auditLog={auditLog} auditoriaSupabase={auditoriaSupabase} onExportarRespaldo={exportarRespaldo} onImportarRespaldo={importarRespaldo} onVaciarAuditoria={function(){setAuditLog([]);}} puedeInstalar={!!deferredInstallPrompt} onInstalar={instalarApp}/>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile FAB ── */}
      <button className="fab" onClick={function(){setEditOp(null);setFormTipo("reserva");setShowForm(true);}}>+</button>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {mobileNavItems.map(function(n){
            return(
              <button key={n.id} className={"mobile-nav-item "+(view===n.id?"active":"")} onClick={function(){setView(n.id);}}>
                <span>{n.icon}</span><span>{n.label}</span>
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
        <button onClick={function(){setShowBot(function(v){return !v;});}} title="Asistente IA" style={{
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

      <DocWorksOnboarding
        open={showOnboarding}
        step={onboardingStep}
        onStep={setOnboardingStep}
        onClose={cerrarOnboarding}
        onNavigate={function(v){setView(v);}}
        role={ctx.usuario ? ctx.usuario.rol_base : perfil.rol}
      />

      <Modal open={showForm} onClose={cerrarFormularioSeguro} closeOnBackdrop={false} title={editOp?"Editar operación":"Nueva operación"} wide={true} formTipo={formTipo}>
        <OperacionForm initial={editOp||formInitialOverride} clausulas={clausulas} perfil={perfil} equipo={equipo} operaciones={operaciones} onSave={saveOp} onCancel={cerrarFormularioSeguro} onTipoChange={function(t){setFormTipo(t);}} saveStatus={saveStatus} reportSave={reportSave} onAddClausula={addClausula}/>
      </Modal>
      <Modal open={!!viewDoc} onClose={function(){setViewDoc(null);setDocAutoAction(null);}} title={viewDoc?tituloDocumentoCorto(viewDoc.inmueble_direccion||TIPOS[viewDoc.tipo]||"Documento",32):"DocWorks"} wide={true} viewerMode={true}
        headerExtra={viewDoc?<span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:"rgba(96,165,250,.14)",color:"#bfdbfe",border:"1px solid rgba(96,165,250,.28)",fontSize:11,fontWeight:700}}>{TIPO_ICON[viewDoc.tipo]||"📄"} {TIPOS[viewDoc.tipo]||"Documento"}{viewDoc.precio?<span style={{marginLeft:5,opacity:.9}}>{fmt$(viewDoc.precio,viewDoc.moneda||"ARS")}</span>:null}</span>:null}
        headerRight={viewDoc?<DocumentHeaderActions
          onEdit={function(){var op=viewDoc;setViewDoc(null);setDocAutoAction(null);setEditOp(op);setFormTipo(op.tipo||"reserva");setShowForm(true);}}
          onPDF={function(){setDocAutoAction("pdf");}}
          onDOCX={function(){setDocAutoAction("docx");}}
          onShare={function(){setDocAutoAction("whatsapp");}}
        />:null}>
        {viewDoc&&<DocumentViewer op={viewDoc} clausulas={clausulas} perfil={perfil} operaciones={operaciones} bloquesReserva={bloquesReserva} onToggleTarea={toggleTarea} onUpdateOperation={onUpdateOperationGlobal} onActionWorkflow={function(action){if(viewDoc)onActionWorkflow(viewDoc,action);}} tab={docTab} onChangeTab={setDocTab} autoAction={docAutoAction} onAutoActionDone={function(){setDocAutoAction(null);}}/>}
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
