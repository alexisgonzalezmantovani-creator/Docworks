import { useState, useEffect, useCallback, useRef } from "react";

// ── SUPABASE (Fase 1 SaaS) ────────────────────────────────────────────────────
// Se carga por CDN, igual que Recharts más abajo, porque este archivo se
// compila solo con esbuild sin node_modules (no hay "npm install" en el
// pipeline). El anon key es público por diseño: toda la seguridad real vive
// en las RLS policies y en las funciones SECURITY DEFINER del lado de la base.
var SUPABASE_URL = "https://xpjiydwjawjizubyldtk.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwaml5ZHdqYXdqaXp1YnlsZHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDYzMzcsImV4cCI6MjEwMzc4MjMzN30.Mi5DilpMg_EGkNZX_ht6jtrmXX9_9Q-Xyo4hnWDEIvI";
var supabaseClient = null;
function loadSupabaseJs() {
  return new Promise(function(resolve) {
    if (supabaseClient) { resolve(supabaseClient); return; }
    if (window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      resolve(supabaseClient);
      return;
    }
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload = function() {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      resolve(supabaseClient);
    };
    s.onerror = function() { resolve(null); };
    document.head.appendChild(s);
  });
}

function loadRecharts() {
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
function ordinalFem(n){
  n=parseInt(n,10);
  if(!n||n<1) return "";
  if(n<=20) return ORDINALES_FEM[n-1];
  return "N\xb0 "+n;
}

// ── LOGO: normalización a JPEG con dimensiones reales ────────────────────────
// Acepta cualquier formato de imagen (PNG, JPG, WEBP, etc.), la dibuja sobre
// un canvas con fondo blanco (el JPEG no soporta transparencia) y devuelve
// un data URL JPEG junto con el ancho/alto reales en píxeles. Esto evita el
// bug de dimensiones hardcodeadas y permite soportar PNG en el PDF nativo.
function loadImageEl(dataUrl) {
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
// disponible, se cae a la descarga clásica por <a download>.
async function entregarArchivo(blob, filename, mime, shareOpts) {
  try {
    var file = new File([blob], filename, { type: mime });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share(Object.assign({ files: [file] }, shareOpts || {}));
      return "shared";
    }
  } catch (e) {
    if (e && e.name === "AbortError") return "cancelled"; // el usuario cerró el panel de compartir, no es error
    // si el share falla por otro motivo, seguimos con la descarga clásica
  }
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  return "downloaded";
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
      txt=latin1Safe(txt);
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
      // Alto del pie: la línea base sube si hay que lugar para la leyenda
      // configurable y/o una copia chica del logo, para no pisarse con nada.
      var tieneLeyenda = !!(perfil && perfil.pie_pagina_texto);
      var tieneLogoPie = !!(perfil && perfil.pie_pagina_logo_debajo && imgObjNum && logoInfo);
      var footerY = 24 + (tieneLeyenda?10:0) + (tieneLogoPie?16:0);
      lines.push("0.7 G 0.3 w "+ML+" "+footerY+" m "+(W-MR)+" "+footerY+" l S 0 G");
      if(perfil&&perfil.nombre) text(ML,footerY-11,latin1Safe(perfil.nombre),8,false);
      text(W-MR-42,footerY-11,"Pagina "+pageNum,8,false);
      var nextY=footerY-11;
      if(tieneLeyenda){
        nextY-=11;
        text(ML,nextY,latin1Safe(perfil.pie_pagina_texto),7,false);
      }
      if(tieneLogoPie){
        var miniMaxH=12, logoAr2=logoInfo.width/logoInfo.height, miniW=miniMaxH*logoAr2;
        var miniY=Math.max(2,nextY-16);
        var logoPosPie=(perfil.logoPosicion||"derecha");
        var miniX = logoPosPie==="izquierda" ? ML : logoPosPie==="centro" ? (W-miniW)/2 : (W-MR-miniW);
        lines.push("q "+miniW.toFixed(2)+" 0 0 "+miniMaxH.toFixed(2)+" "+miniX.toFixed(2)+" "+miniY.toFixed(2)+" cm /Im1 Do Q");
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
    // El logo va en su propia fila, alineado según perfil.logoPosicion
    // ("izquierda"|"centro"|"derecha"), arriba de la franja con el nombre
    // para que nunca se superponga con el texto.
    if(perfil&&perfil.nombre){
      if(imgObjNum&&logoInfo){
        // Tamaño objetivo del logo: aprox. 4cm x 2cm (1cm = 28.35pt), ajustable
        // por perfil.logoScale (%, 50–200, default 100).
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
      if(encNombre||encMatricula||encWeb){
        if(estilo==="corporativo"){
          // Franja sólida con el color primario de marca; texto en blanco.
          rect(ML,y-6,W-ML-MR,28,rgbPdfStr(colorPrim));
          var blanco={r:1,g:1,b:1}, blancoTenue=tintRgb(colorPrim,0.55);
          if(encNombre) text(ML+8,y+6,perfil.nombre.toUpperCase(),12,true,0,blanco);
          if(encMatricula&&perfil.matricula) text(ML+8,y-5,"Matricula: "+perfil.matricula,8,false,0,blancoTenue);
          if(encWeb&&perfil.web) text(ML+8,y-15,perfil.web,7,false,0,blancoTenue);
        } else if(esClasico){
          // Caja con doble filete, sin color — estilo escribanía tradicional.
          hline(y+8,0.3,null,0.75);
          if(encNombre) text(centeredX(perfil.nombre.toUpperCase(),12,true),y+6,perfil.nombre.toUpperCase(),12,true);
          if(encMatricula&&perfil.matricula) text(centeredX("Matricula: "+perfil.matricula,8,false),y-5,"Matricula: "+perfil.matricula,8,false);
          if(encWeb&&perfil.web) text(centeredX(perfil.web,7,false),y-15,perfil.web,7,false);
          hline(y-22,0.3,null,0.75);
        } else {
          // Minimalista: tinte muy suave del color de marca, sin bloque duro.
          rect(ML,y-6,W-ML-MR,28,rgbPdfStr(tintRgb(colorPrim,0.94)));
          if(encNombre) text(ML+8,y+6,perfil.nombre.toUpperCase(),12,true,0,colorPrim);
          if(encMatricula&&perfil.matricula) text(ML+8,y-5,"Matricula: "+perfil.matricula,8,false);
          if(encWeb&&perfil.web) text(ML+8,y-15,perfil.web,7,false);
        }
        y-=42;
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
    function drawParagraph(prefixRuns, bodyText, opts){
      opts=opts||{};
      var size=opts.size||9.5, gap=opts.gap||14.5, indent=opts.indent||16;
      var maxW=W-ML-MR;
      var prefixW=0;
      (prefixRuns||[]).forEach(function(r){ prefixW+=mw(r.txt,size,r.bold); });
      var firstBudget=maxW-prefixW, restBudget=maxW-indent;

      // Primera pasada: arma las líneas (solo mide ancho, sin dibujar todavía),
      // para poder distinguir la última línea de cada párrafo y no justificarla
      // (regla tipográfica estándar: la última línea va alineada a la izquierda).
      var words=(bodyText||"").split(" ").filter(Boolean);
      var wrapped=[]; var lineWords=[], firstLine=true;
      function budget(){ return firstLine ? firstBudget : restBudget; }
      words.forEach(function(w){
        var ww=mw((lineWords.length?" ":"")+w,size,false);
        var curW=mw(lineWords.join(" "),size,false);
        if(lineWords.length>0 && curW+ww>budget()){ wrapped.push({words:lineWords,first:firstLine}); lineWords=[]; firstLine=false; }
        lineWords.push(w);
      });
      if(lineWords.length) wrapped.push({words:lineWords,first:firstLine});

      if(wrapped.length===0){
        if(prefixRuns&&prefixRuns.length){
          ensureSpace(gap);
          var curX0=ML;
          prefixRuns.forEach(function(r){ text(curX0,y,r.txt,size,r.bold,0,r.bold?labelColor:null); curX0+=mw(r.txt,size,r.bold); });
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
            var curX=ML;
            (prefixRuns||[]).forEach(function(r){ text(curX,y,r.txt,size,r.bold,0,r.bold?labelColor:null); curX+=mw(r.txt,size,r.bold); });
            lx=curX;
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
        if(parte.dni){text(ML+10,y,"DNI/CUIT: "+parte.dni,9,false);y-=12;}
        if(parte.domicilio){text(ML+10,y,"Domicilio: "+parte.domicilio,9,false);y-=12;}
        if(parte.email){text(ML+10,y,"Email: "+parte.email,9,false);y-=12;}
        y-=10;
      });
      hline(y); y-=20;
    }

    // Secciones — rótulo en negrita + texto corrido en el mismo párrafo (estilo Bayugar).
    // Si el título es solo el número ("7."), la cláusula no lleva rótulo (como en el modelo).
    function parseClauseTitulo(titulo){
      var m=/^(\d+)\.\s*(.*)$/.exec(titulo||"");
      if(!m) return {num:0,ord:titulo||"",label:""};
      var n=parseInt(m[1],10);
      return {num:n,ord:"CL\xc1USULA "+(ordinalFem(n)||m[1]),label:m[2]};
    }
    if(doc.secciones){
      doc.secciones.forEach(function(sec){
        var pc=parseClauseTitulo(sec.titulo);
        var prefix = pc.label ? (pc.ord+" \u2014 "+pc.label+": ") : (pc.ord+": ");
        (sec.items||[]).forEach(function(item,idx){
          if(!item) return;
          if(idx===0) drawParagraph([{txt:prefix,bold:true}], item);
          else drawParagraph([], item);
        });
      });
    }

    // Cláusulas (continúan la numeración de las secciones, sin encabezado separado)
    if(doc.clausulas&&doc.clausulas.length){
      doc.clausulas.forEach(function(c){
        var ord="CL\xc1USULA "+(ordinalFem(c.num)||("N\xb0 "+c.num));
        var label=ord+(c.titulo?" \u2014 "+c.titulo.toUpperCase()+": ":": ");
        drawParagraph([{txt:label,bold:true}], c.texto||"");
      });
    }

    // Firmas principales (usa doc.firmas; si no está definido, cae a doc.partes por compatibilidad)
    ensureSpace(110);
    hline(y-14); y-=36;
    var firmantesPpales = (doc.firmas&&doc.firmas.length) ? doc.firmas : doc.partes;
    var huboInmobEnFirmas=false;
    if(firmantesPpales){
      var colW=Math.min(180,(W-ML-MR)/Math.max(firmantesPpales.length,1));
      firmantesPpales.forEach(function(p,i){
        var fx=ML+i*colW;
        var nombreFirma = p.usarPerfil ? ((perfil&&perfil.nombre)||"Inmobiliaria interviniente") : p.nombre;
        var rolFirma = p.usarPerfil ? (p.rol+((perfil&&perfil.matricula)?" — Mat. "+perfil.matricula:"")) : p.rol;
        if(p.usarPerfil) huboInmobEnFirmas=true;
        lines.push("0.5 G 0.5 w "+fx+" "+(y+10)+" m "+(fx+120)+" "+(y+10)+" l S 0 G");
        text(fx,y+2,rolFirma||"",8,false);
        text(fx,y-9,nombreFirma||"",8,true);
      });
    }
    if(!huboInmobEnFirmas){
      y-=40;
      lines.push("0.5 G 0.5 w "+ML+" "+(y+10)+" m "+(ML+160)+" "+(y+10)+" l S 0 G");
      text(ML,y+2,"INMOBILIARIA INTERVINIENTE"+(perfil&&perfil.nombre?" - "+perfil.nombre:""),8,false);
    }

    // Presta Conformidad (reserva): aceptación posterior del propietario, numeración propia
    if(doc.conformidad&&doc.conformidad.items&&doc.conformidad.items.length){
      y-=44;
      ensureSpace(46);
      hline(y); y-=22;
      text(ML,y,"PRESTA CONFORMIDAD",11,true,0,labelColor); y-=20;
      doc.conformidad.items.forEach(function(txt,i){
        drawParagraph([{txt:(i+1)+". ",bold:true}], txt);
      });
      ensureSpace(50);
      y-=14;
      lines.push("0.5 G 0.5 w "+ML+" "+(y+10)+" m "+(ML+180)+" "+(y+10)+" l S 0 G");
      text(ML,y+2,"PROPIETARIO",8,false);
      text(ML,y-9,doc.conformidad.firmante||"",8,true);
      if(doc.conformidad.dni) text(ML,y-20,"DNI/CUIT: "+doc.conformidad.dni,8,false);
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
  { id:"c4", titulo:"Comision inmobiliaria", categoria:"general", tipos:["todos"], contenido:"Ambas partes reconocen la intervencion de la inmobiliaria y se comprometen a abonar la comision pactada sobre el precio total de venta." },
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
function personaVars(prefix, label) {
  return [
    { key: prefix+"_nombre",    label: label+" — Nombre completo" },
    { key: prefix+"_dni",       label: label+" — DNI / CUIT" },
    { key: prefix+"_domicilio", label: label+" — Domicilio" },
    { key: prefix+"_email",     label: label+" — Email" },
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
    { key:"comision_porcentaje", label:"Comisión (%)" },
    { key:"escribania",          label:"Escribanía" },
    { key:"fecha_posesion",      label:"Fecha de posesión" },
  ]},
  { group:"Económico — Alquiler", fields:[
    { key:"alquiler_monto_inicial", label:"Canon mensual inicial" },
    { key:"alquiler_deposito",      label:"Depósito (meses)" },
    { key:"alquiler_comision",      label:"Comisión (%)" },
    { key:"alquiler_dia_pago",      label:"Día de pago" },
    { key:"alquiler_inicio",        label:"Inicio del contrato" },
    { key:"alquiler_fin",           label:"Vencimiento del contrato" },
  ]},
  { group:"Económico — Reserva de Alquiler", fields:[
    { key:"res_alq_monto_reserva",     label:"Monto de la reserva" },
    { key:"res_alq_monto_mensual",     label:"Canon mensual estimado" },
    { key:"res_alq_plazo_cantidad",    label:"Plazo estimado" },
    { key:"res_alq_inicio_estimado",   label:"Inicio estimado" },
  ]},
];
const VAR_MONEY_FIELDS = { precio:"moneda", anticipo:"moneda", saldo:"moneda", alquiler_monto_inicial:"alquiler_moneda", res_alq_monto_reserva:"res_alq_moneda", res_alq_monto_mensual:"res_alq_moneda" };
const VAR_DATE_FIELDS = ["fecha_posesion","alquiler_inicio","alquiler_fin","res_alq_inicio_estimado"];
function fmtVarValue(key, op) {
  var v = op[key];
  if (v===undefined||v===null||String(v).trim()==="") return "___";
  if (VAR_MONEY_FIELDS[key]) return fmt$(v, op[VAR_MONEY_FIELDS[key]]);
  if (VAR_DATE_FIELDS.indexOf(key)!==-1) return fmtD(v);
  return String(v);
}
function resolveVars(text, op, extra) {
  if (!text) return text;
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, function(_, key) {
    if (extra && Object.prototype.hasOwnProperty.call(extra, key)) return extra[key];
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
    moneda_txt: esUSD ? "DÓLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS BILLETE",
    precio_letras: fmt$L(op.precio, op.moneda),
    anticipo_letras: fmt$L(op.anticipo, op.moneda),
    saldo_letras: fmt$L(op.saldo, op.moneda),
    // Mismo default "3" que usa hoy buildDocSections — a propósito distinto
    // del fallback genérico "___" de fmtVarValue.
    comision_porcentaje: (op.comision_porcentaje || "3"),
    escribania_clausula: op.escribania ? ("Escribanía designada: " + op.escribania + ".") : "El Escribano será designado por el Oferente,",
    notificacion_emails_clausula: (op.comprador_email || op.vendedor_email)
      ? (" Correos declarados — Oferente: " + (op.comprador_email || "___") + ". Propietario: " + (op.vendedor_email || "___") + ".")
      : "",
  };
}
// Compatibilidad: cláusulas guardadas antes de existir "tipos" (undefined) siguen
// mostrándose con la heurística anterior según su categoría.
function clausulaAplicaTipo(c, tipo) {
  if (c.tipos && c.tipos.length) {
    return c.tipos.indexOf("todos") !== -1 || c.tipos.indexOf(tipo) !== -1;
  }
  var esAlquilerTipo = (tipo==="alquiler"||tipo==="reserva_alquiler");
  return esAlquilerTipo ? true : c.categoria !== "alquiler";
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
  res_alq_monto_reserva:"100000", res_alq_monto_mensual:"350000", res_alq_plazo_cantidad:"24", res_alq_inicio_estimado:"2026-09-01",
};
// Vista previa en vivo (Configuración → Plantillas): muestra el encabezado y
// las cláusulas adicionales resueltos con datos de ejemplo, en el mismo
// orden en que van a aparecer en el documento real. No incluye el cuerpo
// fijo del documento (precio, forma de pago, posesión, etc. — eso sigue
// siendo el texto estándar del sistema, no editable todavía desde acá).
function PlantillaPreview({tipo, encabezado, clausulas}){
  var op = SAMPLE_OP_PREVIEW;
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
                {(i+1)+". "+(c.titulo||"").toUpperCase()}
                {c.obligatoria && <span style={{marginLeft:6,fontSize:9.5,color:"#b45309"}}>🔒 OBLIGATORIA</span>}
              </div>
              <div style={{color:"#374151",textAlign:"justify"}}>{resolveVars(c.contenido, op)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ── Fase 1: panel de bloques del cuerpo fijo de Reserva (piloto) ──
// Editor de bloques (referenciados por id estable, no por posición) +
// comparación generador actual vs. por bloques + vista previa completa.
function ReservaBloquesPanel({bloques, onUpdate, onMove, clausulasLib, operaciones, puedeEditar}){
  const [editId,setEditId]=useState(null);
  const [draft,setDraft]=useState({titulo:"",contenido:""});
  const [origenComparacion,setOrigenComparacion]=useState("ejemplo"); // "ejemplo" | id de operación real
  var ordenados = bloques.slice().sort(function(a,b){return (a.orden||0)-(b.orden||0);});
  var opsReserva = (operaciones||[]).filter(function(o){return o.tipo==="reserva";});

  function abrirEditor(b){ setEditId(b.id); setDraft({titulo:b.titulo,contenido:b.contenido}); }
  function guardarEdicion(){
    if(!editId) return;
    onUpdate(editId,{titulo:draft.titulo,contenido:draft.contenido});
    setEditId(null);
  }

  var opComparacion = origenComparacion==="ejemplo"
    ? SAMPLE_OP_PREVIEW
    : (opsReserva.find(function(o){return o.id===origenComparacion;}) || SAMPLE_OP_PREVIEW);
  var comparacion = compararGeneradoresReserva(opComparacion, bloques, clausulasLib||[]);

  return (
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
        <span style={{fontSize:14}}>🧱</span>
        <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",margin:0}}>Cuerpo del documento (bloques) — piloto</p>
      </div>
      <div style={{fontSize:11,color:"var(--dim)",marginBottom:12,lineHeight:1.5}}>
        Fase 1: cada cláusula fija de la Reserva es ahora un bloque con ID estable. El texto legal es exactamente el mismo que usa hoy el generador anterior — solo cambió de dónde se lee. Las 15 son obligatorias y protección 🔒 C (no se pueden desactivar); eso se habilita recién en la próxima fase. Este panel todavía NO alimenta el PDF/Word real — eso sigue usando el generador anterior sin cambios.
      </div>

      {ordenados.map(function(b,idx){
        var esPrimera=idx===0, esUltima=idx===ordenados.length-1;
        var editando = editId===b.id;
        return (
          <div key={b.id} style={{padding:"10px 12px",borderRadius:10,border:"1px solid var(--border2)",marginBottom:6,background:"var(--card)"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:12.5,fontWeight:600,color:"var(--text)"}}>{b.sinTitulo?"(sin título)":b.titulo}</span>
                  <span className="badge" style={{background:"rgba(180,83,9,0.12)",color:"#b45309"}}>🔒 C</span>
                  {b.obligatoria&&<span className="badge" style={{background:"rgba(180,83,9,0.08)",color:"#b45309"}}>Obligatoria</span>}
                  {b.condicion==="moneda_usd"&&<span className="badge badge-tipo">Solo si USD</span>}
                  <span style={{fontSize:10,color:"var(--dim)"}}>id: {b.id}</span>
                </div>
                {!editando&&<div style={{fontSize:11,color:"var(--muted)",marginTop:4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{(b.contenido||"").split("\n\n")[0]}</div>}
              </div>
              {puedeEditar&&!editando&&(
                <div style={{display:"flex",gap:3,flexShrink:0}}>
                  <button onClick={function(){if(!esPrimera)onMove(b.id,"up");}} disabled={esPrimera} title="Subir" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:esPrimera?"var(--border2)":"var(--muted)",cursor:esPrimera?"default":"pointer",fontSize:12}}>↑</button>
                  <button onClick={function(){if(!esUltima)onMove(b.id,"down");}} disabled={esUltima} title="Bajar" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:esUltima?"var(--border2)":"var(--muted)",cursor:esUltima?"default":"pointer",fontSize:12}}>↓</button>
                  <button onClick={function(){abrirEditor(b);}} title="Editar" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:12}}>✏</button>
                </div>
              )}
            </div>
            {editando&&(
              <div style={{marginTop:8,paddingTop:8,borderTop:"1px dashed var(--border2)"}}>
                {!b.sinTitulo&&<Inp label="Título (sin número — se agrega solo)" value={draft.titulo} onChange={function(e){setDraft(function(d){return Object.assign({},d,{titulo:e.target.value});});}} className="col2"/>}
                <Txa label="Contenido" value={draft.contenido} onChange={function(e){setDraft(function(d){return Object.assign({},d,{contenido:e.target.value});});}} rows={5} className="col2"/>
                <div style={{fontSize:10.5,color:"var(--dim)",marginTop:4,marginBottom:8}}>Tokens disponibles acá: {"{{moneda_txt}} {{precio_letras}} {{anticipo_letras}} {{saldo_letras}} {{comision_porcentaje}} {{fecha_posesion}} {{escribania_clausula}} {{notificacion_emails_clausula}}"}</div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <Btn s="sm" v="ghost" onClick={function(){setEditId(null);}}>Cancelar</Btn>
                  <Btn s="sm" onClick={guardarEdicion}>Guardar</Btn>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Comparación generador actual vs. por bloques */}
      <div style={{marginTop:18,paddingTop:14,borderTop:"1px dashed var(--border2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
          <span style={{fontSize:14}}>🧪</span>
          <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",margin:0}}>Comparar generador actual vs. por bloques</p>
        </div>
        {opsReserva.length>0&&(
          <select value={origenComparacion} onChange={function(e){setOrigenComparacion(e.target.value);}} style={{marginBottom:10,padding:"7px 10px",borderRadius:8,border:"1px solid var(--border)",background:"var(--card)",color:"var(--text)",fontSize:12}}>
            <option value="ejemplo">Datos de ejemplo</option>
            {opsReserva.map(function(o){return <option key={o.id} value={o.id}>{(o.comprador_nombre||"Reserva")+" ← "+(o.vendedor_nombre||"")}</option>;})}
          </select>
        )}
        <div style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+(comparacion.todoOk?"rgba(34,197,94,0.3)":"rgba(248,113,113,0.3)"),background:comparacion.todoOk?"rgba(34,197,94,0.06)":"rgba(248,113,113,0.06)"}}>
          <div style={{fontSize:12.5,fontWeight:600,color:comparacion.todoOk?"#16a34a":"var(--red)"}}>
            {comparacion.todoOk?"✓ Coincide exactamente con el generador actual":"✕ Hay diferencias — revisar abajo"}
          </div>
          {!comparacion.todoOk&&(
            <div style={{marginTop:8,fontSize:11,color:"var(--muted)"}}>
              {!comparacion.encabezadoOk&&<div style={{marginBottom:4}}>⚠ El encabezado difiere.</div>}
              {!comparacion.conformidadOk&&<div style={{marginBottom:4}}>⚠ El texto de conformidad difiere.</div>}
              {comparacion.filas.filter(function(f){return !f.ok;}).map(function(f){
                return <div key={f.idx} style={{marginBottom:4}}>⚠ Cláusula #{f.idx+1}: {f.actual?("actual: \""+f.actual.titulo+"\""):"no existe en el actual"} — {f.bloques?("bloques: \""+f.bloques.titulo+"\""):"no existe en bloques"}</div>;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Vista previa completa del documento */}
      <div style={{marginTop:18,paddingTop:14,borderTop:"1px dashed var(--border2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
          <span style={{fontSize:14}}>👁</span>
          <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",margin:0}}>Vista previa completa (generador por bloques)</p>
        </div>
        <ReservaDocPreviewCompleta doc={comparacion.docNuevo}/>
      </div>
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
  tipo:"reserva", estado:"borrador",
  comprador_nombre:"", comprador_dni:"", comprador_domicilio:"", comprador_email:"", comprador_telefono:"",
  vendedor_nombre:"", vendedor_dni:"", vendedor_domicilio:"", vendedor_email:"", vendedor_telefono:"",
  locador_nombre:"", locador_dni:"", locador_domicilio:"", locador_email:"", locador_telefono:"",
  locatario_nombre:"", locatario_dni:"", locatario_domicilio:"", locatario_email:"", locatario_telefono:"",
  comprador_cotitulares:[], vendedor_cotitulares:[], locador_cotitulares:[], locatario_cotitulares:[],
  inmueble_direccion:"", inmueble_partido:"", inmueble_provincia:"", nomenclatura_catastral:"", descripcion_inmueble:"",
  precio:"", moneda:"USD", anticipo:"", saldo:"", fecha_posesion:"", comision_porcentaje:"3", escribania:"", escribania_observaciones:"",
  res_alq_monto_reserva:"", res_alq_moneda:"ARS", res_alq_monto_mensual:"", res_alq_plazo_meses:"24",
  res_alq_inicio_estimado:"", res_alq_destino:"vivienda", res_alq_comision:"1", res_alq_vigencia_dias:"10", res_alq_observaciones:"",
  alquiler_monto_inicial:"", alquiler_moneda:"ARS", alquiler_plazo_meses:"24", alquiler_inicio:"", alquiler_fin:"",
  alquiler_actualizacion:"ICL", alquiler_actualizacion_otro:"", alquiler_periodo_actualizacion:"cuatrimestral", alquiler_periodo_otro:"",
  alquiler_deposito:"1", alquiler_deposito_otro_monto:"", alquiler_deposito_otro_moneda:"USD", alquiler_destino:"vivienda",
  alquiler_garantia_tipo:"propietario", alquiler_garantia_titular:"", alquiler_garantia_dni:"", alquiler_garantia_inmueble:"",
  alquiler_garantia_texto_personalizado:"",
  alquiler_comision:"1", alquiler_comision_locador:"", alquiler_comision_locatario:"",
  alquiler_forma_pago:["transferencia"], alquiler_dia_pago:"1", alquiler_dia_pago_otro:"",
  alquiler_interes_punitorio:"5", alquiler_penalidad_meses:"2", alquiler_seguro_dias:"10", alquiler_aviso_meses:"1",
  clausulas_ids:[], clausulas_custom:"", clausulas_custom_titulo:"",
  inmueble_tipo:"departamento", inmueble_tipo_otro:"", inmueble_unidad_funcional:"",
  alquiler_modo_plazo:"preset", alquiler_plazo_dias:"0",
  res_alq_aceptacion_dias:"2",
  comision_vendedor:"4", comision_comprador:"3",
  res_alq_comision_locador:"", res_alq_comision_locatario:"",
  res_alq_plazo_cantidad:"24", res_alq_plazo_unidad:"meses",
  parent_id:null,
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
  var campos = [
    "comprador_nombre","vendedor_nombre","locador_nombre","locatario_nombre",
    "inmueble_direccion","precio","alquiler_monto_inicial","res_alq_monto_reserva",
  ];
  return campos.some(function(c){ return d[c] && String(d[c]).trim() !== ""; });
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
  return eventos.filter(function(e){return e.fecha;}).sort(function(a,b){return new Date(a.fecha)-new Date(b.fecha);});
}

// ── VALIDACIÓN PREVIA A EXPORTAR (PDF / Word) ─────────────────────────────────
// Chequeos rápidos, no bloqueantes: si encuentran algo, se muestra un aviso
// antes de generar el documento, pero el usuario puede continuar igual.
var CAMPOS_CRITICOS_POR_TIPO = {
  reserva:  [["comprador_nombre","Nombre del comprador"],["vendedor_nombre","Nombre del vendedor"],["inmueble_direccion","Dirección del inmueble"],["precio","Precio de la operación"]],
  boleto:   [["comprador_nombre","Nombre del comprador"],["vendedor_nombre","Nombre del vendedor"],["inmueble_direccion","Dirección del inmueble"],["precio","Precio de la operación"],["fecha_posesion","Fecha de posesión"]],
  alquiler: [["locador_nombre","Nombre del locador"],["locatario_nombre","Nombre del locatario"],["inmueble_direccion","Dirección del inmueble"],["alquiler_monto_inicial","Canon mensual"],["alquiler_inicio","Inicio del contrato"]],
  reserva_alquiler: [["locador_nombre","Nombre del locador"],["locatario_nombre","Nombre del locatario"],["inmueble_direccion","Dirección del inmueble"],["res_alq_monto_mensual","Canon mensual estimado"]],
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

function fmt$(val, moneda) {
  if (!val) return "—";
  const n = parseFloat(val); if (isNaN(n)) return "—";
  return (moneda === "USD" ? "U$D " : "$ ") + n.toLocaleString("es-AR", { minimumFractionDigits: 2 });
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
// Devuelve el monto expresado en palabras junto con la moneda, para su uso
// en cláusulas legales (ej: "MIL DOLARES ESTADOUNIDENSES BILLETE").
function montoEnLetras(val, moneda) {
  var n = parseFloat(val);
  if (isNaN(n) || n <= 0) return "";
  var entero = Math.floor(n);
  var centavos = Math.round((n - entero) * 100);
  var letras = numeroALetras(entero);
  var monedaTxt = moneda === "USD" ? "DOLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS";
  var centavosTxt = centavos > 0 ? " CON " + String(centavos).padStart(2, "0") + "/100" : "";
  return letras + " " + monedaTxt + centavosTxt;
}
// fmt$ + su expresión en letras entre paréntesis, para cláusulas de montos clave.
function fmt$L(val, moneda) {
  var base = fmt$(val, moneda);
  var letras = montoEnLetras(val, moneda);
  return letras ? base + " (" + letras + ")" : base;
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
// Hook: guarda `value` en localStorage bajo `key` cada vez que cambia,
// con un pequeño debounce para no escribir en cada tecla mientras se tipea.
// onStatus(state) opcional, para alimentar el indicador visible de guardado
// ("saving" al arrancar el debounce, "saved"/"error" al terminar de escribir).
function useAutosave(key, value, delay, onStatus) {
  var timerRef = useRef(null);
  var firstRef = useRef(true);
  useEffect(function() {
    if (firstRef.current) { firstRef.current = false; return; } // no reescribir el valor recién cargado
    if (timerRef.current) clearTimeout(timerRef.current);
    if (onStatus) onStatus("saving");
    timerRef.current = setTimeout(function(){
      var ok = lsSet(key, value);
      if (onStatus) onStatus(ok ? "saved" : "error");
    }, delay || 400);
    return function(){ if (timerRef.current) clearTimeout(timerRef.current); };
  }, [key, value]);
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
function buildBackupObject(state) {
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
function descargarBackupJSON(state) {
  var payload = buildBackupObject(state);
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
function parseBackupJSON(rawText) {
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
  return doc;
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
  var prefixes=["comprador","vendedor","locador","locatario"];
  var out=op;
  prefixes.forEach(function(prefix){
    var personas=personasDe(op, prefix);
    if (personas.length<=1) return;
    if (out===op) out=Object.assign({}, op);
    out[prefix+"_nombre"] = unirNombres(personas.map(function(p){return p.nombre;}));
    out[prefix+"_dni"] = personas.map(function(p){return p.dni||"___";}).join(" y ");
    var domicilios = personas.map(function(p){return p.domicilio;}).filter(Boolean);
    out[prefix+"_domicilio"] = domicilios.length ? Array.from(new Set(domicilios)).join(" / ") : (op[prefix+"_domicilio"]||"");
    var emails = personas.map(function(p){return p.email;}).filter(Boolean);
    if (emails.length) out[prefix+"_email"] = emails.join(" / ");
    var telefonos = personas.map(function(p){return p.telefono;}).filter(Boolean);
    if (telefonos.length) out[prefix+"_telefono"] = telefonos.join(" / ");
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
  return tpl.replace(/\{\{(\w+)\}\}/g, function(m,k){ return (k in map) ? map[k] : m; });
}
function aplicarEncabezadoPersonalizado(doc, op, tipo, perfil) {
  var custom = perfil && perfil.encabezados_custom && perfil.encabezados_custom[tipo];
  if (custom && custom.trim()) {
    doc = Object.assign({}, doc, { encabezado: sustituirTokens(custom, op, perfil, tipo) });
  }
  return doc;
}

// ── FASE 1: SISTEMA DE BLOQUES (piloto — solo Reserva) ─────────────────────────
// Modelo de datos preparado también para las fases siguientes (protección
// A/B/C y permisos por broker — puntos 8-18 del pedido), aunque en esta fase
// esos campos todavía no se usan en ninguna lógica: solo viajan como datos.
//
//   id                  estable, no cambia aunque se edite el título.
//   titulo              sin el número — la numeración es automática (orden).
//   sinTitulo           true = la cláusula no lleva rótulo de texto, solo el
//                        número (así son hoy los bloques 7, 10, 11, 13 y 14).
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
//   permisos_excepcion   [] — reservado para Fase 3 (overrides por broker).
var DEFAULT_BLOQUES_RESERVA = [
  { id:"reserva.precio", titulo:"PRECIO", sinTitulo:false,
    contenido:"El Oferente ofrece la suma de {{moneda_txt}} {{precio_letras}} para la compra del Inmueble, en adelante el Precio.-",
    variables:["moneda_txt","precio_letras"], condicion:null, orden:1, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.valor_reserva", titulo:"VALOR DE LA RESERVA", sinTitulo:false,
    contenido:"La suma entregada en este acto en concepto de Reserva Ad Referéndum es de {{moneda_txt}} {{anticipo_letras}}.-",
    variables:["moneda_txt","anticipo_letras"], condicion:null, orden:2, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.forma_pago", titulo:"FORMA DE PAGO", sinTitulo:false,
    contenido:"El Oferente ofrece abonar el saldo de {{saldo_letras}} al momento de firmar la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-",
    variables:["saldo_letras"], condicion:null, orden:3, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.honorarios", titulo:"HONORARIOS", sinTitulo:false,
    contenido:"El Oferente abonará el {{comision_porcentaje}}% del Precio en el momento de la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente.-",
    variables:["comision_porcentaje"], condicion:null, orden:4, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.vencimiento_aceptacion", titulo:"VENCIMIENTO DE ACEPTACIÓN DE LA RESERVA", sinTitulo:false,
    contenido:"El vencimiento de la aceptación de la presente Reserva caducará irrevocablemente a las 48 horas de suscripta la misma, salvo prórroga expresa acordada por escrito entre las partes.-",
    variables:[], condicion:null, orden:5, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.vencimiento_reserva", titulo:"VENCIMIENTO DE LA RESERVA", sinTitulo:false,
    contenido:"La Reserva, y su conversión a Seña una vez conformada la misma, estará plenamente vigente hasta el {{fecha_posesion}}, fecha en que deberá firmarse la Escritura Traslativa de Dominio.-",
    variables:["fecha_posesion"], condicion:null, orden:6, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.incumplimiento", titulo:"", sinTitulo:true,
    contenido:"Conformada esta Reserva por el Propietario, la presente tendrá carácter de SEÑA con los efectos y alcances del art. 1059 del Código Civil y Comercial de la Nación. Si el Oferente no se presentara a la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, perderá automáticamente y de pleno derecho la suma entregada en este acto, sin necesidad de que se practique interpelación judicial o extrajudicial alguna, quedando constituido en mora por el mero vencimiento del plazo; mientras que si no se presentara el Propietario a la firma en el plazo establecido, quedará obligado a reintegrar al Oferente, dentro de las 48 horas de producido el incumplimiento, la suma recibida como Reserva, más otro tanto igual en concepto de única y total indemnización.-\n\nEn caso de que el incumplimiento aludido en el párrafo anterior se deba a Caso Fortuito o Fuerza Mayor según arts. 955 y 1730 del Código Civil y Comercial de la Nación, ajeno a la voluntad de las partes, los plazos se suspenden automáticamente, sin consecuencias para éstas, hasta tanto lo determine el Escribano Interviniente.-",
    variables:[], condicion:null, orden:7, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.escribano", titulo:"ESCRIBANO INTERVINIENTE", sinTitulo:false,
    contenido:"{{escribania_clausula}} debiendo ser notificado formalmente al Propietario con todos los datos de contacto correspondientes dentro de la semana de haber sido conformada la presente Reserva Ad Referéndum. La notificación del Escribano Interviniente respecto de la fecha y hora para la firma de la Escritura Traslativa de Dominio tendrá carácter constitutivo.-",
    variables:["escribania_clausula"], condicion:null, orden:8, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.honorarios_impuestos", titulo:"HONORARIOS, IMPUESTOS, TASAS, SELLOS Y OTROS", sinTitulo:false,
    contenido:"Todos los honorarios, impuestos, tasas, sellos y cualquier otro tributo exigible a los efectos de la firma e inscripción de la Escritura Traslativa de Dominio en el Registro de la Propiedad Inmueble y/o el Boleto de Compraventa correspondiente serán afrontados según usos y costumbres.-",
    variables:[], condicion:null, orden:9, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.moneda_condicion_esencial", titulo:"", sinTitulo:true,
    contenido:"Queda expresamente establecido que la moneda de pago ofrecida y acordada en los puntos 1, 2 y 3 precedentes constituye condición y elemento esencial de la presente. El Oferente declara poseer los Dólares Billete Estadounidenses y se compromete a entregarlos por el precio estipulado en caso de aceptación, así como para cancelar los honorarios convenidos, renunciando a invocar imprevisión, caso fortuito, fuerza mayor, enriquecimiento sin causa o cualquier otra defensa relacionada a una eventual imposibilidad de pago en la moneda pactada o a variaciones en su cotización, resultando condición esencial que el pago sea efectuado única y exclusivamente en Dólares Billete Estadounidenses.-",
    variables:[], condicion:"moneda_usd", orden:10, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.devolucion_no_conforme", titulo:"", sinTitulo:true,
    contenido:"Si el Propietario del Inmueble no conformase esta Reserva, la suma entregada en este acto por el Oferente le será devuelta sin indemnización de ninguna naturaleza, quedando la presente Reserva sin efecto ni valor legal alguno. En este caso, el Oferente deberá notificar con un mínimo de 48 horas su intención de retirar los fondos en guarda, acordando con la inmobiliaria interviniente la logística correspondiente.-",
    variables:[], condicion:null, orden:11, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.notificacion_valida", titulo:"NOTIFICACIÓN VÁLIDA", sinTitulo:false,
    contenido:"Significa toda notificación realizada por correo electrónico o carta documento a los domicilios y correos electrónicos declarados por Las Partes en la presente, con su correspondiente constancia de recibo. Las notificaciones por correo electrónico tendrán plena validez y vigencia, constituyendo Las Partes este domicilio electrónico con la misma eficacia que el domicilio real a los fines de la presente Reserva.{{notificacion_emails_clausula}}-",
    variables:["notificacion_emails_clausula"], condicion:null, orden:12, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.incumplimiento_honorarios", titulo:"", sinTitulo:true,
    contenido:"En caso de incumplimiento o arrepentimiento de alguna de Las Partes, una vez cumplidos todos los Ad Referéndum de la presente Reserva, la parte incumplidora deberá abonar los honorarios pactados en concepto de labor de intermediación realizada hasta el momento, sin necesidad de formalidad judicial alguna.-",
    variables:[], condicion:null, orden:13, activo:true, obligatoria:true, proteccion:"C", permisos_excepcion:[] },
  { id:"reserva.asesoramiento", titulo:"", sinTitulo:true,
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
  var monedaTxt = esUSD ? "DÓLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS BILLETE";
  var tokensBase = derivedTokensReserva(op);
  var render = renderBloques(bloques, op, tokensBase);
  var numIncumplimiento = render.extraTokens[tokenNumeroBloque("reserva.incumplimiento")] || "?";

  var doc = {
    titulo: 'RESERVA "AD REFERÉNDUM"',
    subtitulo: "Oferta de compra sujeta a la conformidad del propietario",
    ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
    fecha: fmtDLarga(op.fecha_posesion||new Date().toISOString().slice(0,10)),
    encabezado: "Recibimos de "+(op.comprador_nombre||"___________")+", DNI/CUIT "+(op.comprador_dni||"___________")+", con domicilio a estos efectos en "+(op.comprador_domicilio||"___________")+", en adelante el Oferente, la suma de "+monedaTxt+" "+fmt$L(op.anticipo,op.moneda)+" en concepto de \"Reserva Ad Referéndum\" de la aceptación del propietario "+(op.vendedor_nombre||"___________")+", DNI/CUIT "+(op.vendedor_dni||"___________")+", en adelante el Propietario, para la compra del inmueble ubicado en "+(op.inmueble_direccion||"___________")+", "+(op.inmueble_partido||"___________")+", Provincia de "+(op.inmueble_provincia||"___________")+(op.nomenclatura_catastral?", Nomenclatura Catastral "+op.nomenclatura_catastral:"")+", en adelante el Inmueble.\n\nEn adelante Oferente y Propietario podrán ser denominados conjuntamente como Las Partes.\n\nEl presente se sujetará en un todo a los siguientes términos y condiciones:",
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
        "Asimismo, manifiesto expresamente que me obligo a abonar a la inmobiliaria interviniente el "+(op.comision_porcentaje||"3")+"% del Precio en concepto de honorarios por labor de intermediación cumplimentada, al momento de firmarse la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-",
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

function buildDocSections(op, clausulasLib, tipo) {
  var M = op.moneda==="USD"; var MA = op.res_alq_moneda==="USD"; var MAL = op.alquiler_moneda==="USD";

  if (tipo==="reserva") {
    var esUSD = op.moneda==="USD";
    var monedaTxt = esUSD ? "DÓLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS BILLETE";
    var seccionesReserva = [
      // 1. Precio
      {titulo:"1. PRECIO", items:["El Oferente ofrece la suma de "+monedaTxt+" "+fmt$L(op.precio,op.moneda)+" para la compra del Inmueble, en adelante el Precio.-"]},
      // 2. Valor de la Reserva
      {titulo:"2. VALOR DE LA RESERVA", items:["La suma entregada en este acto en concepto de Reserva Ad Referéndum es de "+monedaTxt+" "+fmt$L(op.anticipo,op.moneda)+".-"]},
      // 3. Forma de Pago
      {titulo:"3. FORMA DE PAGO", items:["El Oferente ofrece abonar el saldo de "+fmt$L(op.saldo,op.moneda)+" al momento de firmar la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-"]},
      // 4. Honorarios
      {titulo:"4. HONORARIOS", items:["El Oferente abonará el "+(op.comision_porcentaje||"3")+"% del Precio en el momento de la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, en concepto de honorarios por labor de intermediación cumplimentada por la inmobiliaria interviniente.-"]},
      // 5. Vencimiento de Aceptación de la Reserva
      {titulo:"5. VENCIMIENTO DE ACEPTACIÓN DE LA RESERVA", items:["El vencimiento de la aceptación de la presente Reserva caducará irrevocablemente a las 48 horas de suscripta la misma, salvo prórroga expresa acordada por escrito entre las partes.-"]},
      // 6. Vencimiento de la Reserva
      {titulo:"6. VENCIMIENTO DE LA RESERVA", items:["La Reserva, y su conversión a Seña una vez conformada la misma, estará plenamente vigente hasta el "+fmtD(op.fecha_posesion)+", fecha en que deberá firmarse la Escritura Traslativa de Dominio.-"]},
      // 7. Incumplimiento (sin rótulo) + Caso Fortuito (párrafo aparte)
      {titulo:"7.", items:[
        "Conformada esta Reserva por el Propietario, la presente tendrá carácter de SEÑA con los efectos y alcances del art. 1059 del Código Civil y Comercial de la Nación. Si el Oferente no se presentara a la firma de la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero, perderá automáticamente y de pleno derecho la suma entregada en este acto, sin necesidad de que se practique interpelación judicial o extrajudicial alguna, quedando constituido en mora por el mero vencimiento del plazo; mientras que si no se presentara el Propietario a la firma en el plazo establecido, quedará obligado a reintegrar al Oferente, dentro de las 48 horas de producido el incumplimiento, la suma recibida como Reserva, más otro tanto igual en concepto de única y total indemnización.-",
        "En caso de que el incumplimiento aludido en el párrafo anterior se deba a Caso Fortuito o Fuerza Mayor según arts. 955 y 1730 del Código Civil y Comercial de la Nación, ajeno a la voluntad de las partes, los plazos se suspenden automáticamente, sin consecuencias para éstas, hasta tanto lo determine el Escribano Interviniente.-",
      ]},
      // 8. Escribano Interviniente
      {titulo:"8. ESCRIBANO INTERVINIENTE", items:[(op.escribania?"Escribanía designada: "+op.escribania+".":"El Escribano será designado por el Oferente,")+" debiendo ser notificado formalmente al Propietario con todos los datos de contacto correspondientes dentro de la semana de haber sido conformada la presente Reserva Ad Referéndum. La notificación del Escribano Interviniente respecto de la fecha y hora para la firma de la Escritura Traslativa de Dominio tendrá carácter constitutivo.-"]},
      // 9. Honorarios, impuestos, tasas, sellos y otros
      {titulo:"9. HONORARIOS, IMPUESTOS, TASAS, SELLOS Y OTROS", items:["Todos los honorarios, impuestos, tasas, sellos y cualquier otro tributo exigible a los efectos de la firma e inscripción de la Escritura Traslativa de Dominio en el Registro de la Propiedad Inmueble y/o el Boleto de Compraventa correspondiente serán afrontados según usos y costumbres.-"]},
      // 10. Moneda de pago como condición esencial (sin rótulo, solo si es en USD)
      esUSD ? {titulo:"10.", items:["Queda expresamente establecido que la moneda de pago ofrecida y acordada en los puntos 1, 2 y 3 precedentes constituye condición y elemento esencial de la presente. El Oferente declara poseer los Dólares Billete Estadounidenses y se compromete a entregarlos por el precio estipulado en caso de aceptación, así como para cancelar los honorarios convenidos, renunciando a invocar imprevisión, caso fortuito, fuerza mayor, enriquecimiento sin causa o cualquier otra defensa relacionada a una eventual imposibilidad de pago en la moneda pactada o a variaciones en su cotización, resultando condición esencial que el pago sea efectuado única y exclusivamente en Dólares Billete Estadounidenses.-"]} : null,
      // 11. Devolución si no conforma el Propietario (sin rótulo)
      {titulo:esUSD?"11.":"10.", items:["Si el Propietario del Inmueble no conformase esta Reserva, la suma entregada en este acto por el Oferente le será devuelta sin indemnización de ninguna naturaleza, quedando la presente Reserva sin efecto ni valor legal alguno. En este caso, el Oferente deberá notificar con un mínimo de 48 horas su intención de retirar los fondos en guarda, acordando con la inmobiliaria interviniente la logística correspondiente.-"]},
      // 12. Notificación Válida
      {titulo:esUSD?"12. NOTIFICACIÓN VÁLIDA":"11. NOTIFICACIÓN VÁLIDA", items:["Significa toda notificación realizada por correo electrónico o carta documento a los domicilios y correos electrónicos declarados por Las Partes en la presente, con su correspondiente constancia de recibo. Las notificaciones por correo electrónico tendrán plena validez y vigencia, constituyendo Las Partes este domicilio electrónico con la misma eficacia que el domicilio real a los fines de la presente Reserva."+(op.comprador_email||op.vendedor_email?" Correos declarados — Oferente: "+(op.comprador_email||"___")+". Propietario: "+(op.vendedor_email||"___")+".":"")+"-"]},
      // 13. Incumplimiento / arrepentimiento — honorarios (sin rótulo)
      {titulo:esUSD?"13.":"12.", items:["En caso de incumplimiento o arrepentimiento de alguna de Las Partes, una vez cumplidos todos los Ad Referéndum de la presente Reserva, la parte incumplidora deberá abonar los honorarios pactados en concepto de labor de intermediación realizada hasta el momento, sin necesidad de formalidad judicial alguna.-"]},
      // 14. Asesoramiento individual (sin rótulo)
      {titulo:esUSD?"14.":"13.", items:["El Oferente manifiesta expresamente que para realizar la presente oferta se ha asesorado en forma individual con sus propios asesores legales e impositivos, declarando conocer en todos sus términos los riesgos e implicancias de la presente oferta.-"]},
      // 15. Refuerzo
      {titulo:esUSD?"15. REFUERZO":"14. REFUERZO", items:["El Oferente podrá ofrecer, de así convenirlo con el Propietario, un Refuerzo de la presente Reserva dentro de los 7 días corridos a partir de su conformidad, cuyo monto y demás condiciones se consignarán en el instrumento de Refuerzo de Reserva correspondiente.-"]},
    ].filter(Boolean);
    var numIncumplimiento = 7;

    var doc = {
      titulo: 'RESERVA "AD REFERÉNDUM"',
      subtitulo: "Oferta de compra sujeta a la conformidad del propietario",
      ciudad: (op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"Buenos Aires"),
      fecha: fmtDLarga(op.fecha_posesion||new Date().toISOString().slice(0,10)),
      encabezado: "Recibimos de "+(op.comprador_nombre||"___________")+", DNI/CUIT "+(op.comprador_dni||"___________")+", con domicilio a estos efectos en "+(op.comprador_domicilio||"___________")+", en adelante el Oferente, la suma de "+monedaTxt+" "+fmt$L(op.anticipo,op.moneda)+" en concepto de \"Reserva Ad Referéndum\" de la aceptación del propietario "+(op.vendedor_nombre||"___________")+", DNI/CUIT "+(op.vendedor_dni||"___________")+", en adelante el Propietario, para la compra del inmueble ubicado en "+(op.inmueble_direccion||"___________")+", "+(op.inmueble_partido||"___________")+", Provincia de "+(op.inmueble_provincia||"___________")+(op.nomenclatura_catastral?", Nomenclatura Catastral "+op.nomenclatura_catastral:"")+", en adelante el Inmueble.\n\nEn adelante Oferente y Propietario podrán ser denominados conjuntamente como Las Partes.\n\nEl presente se sujetará en un todo a los siguientes términos y condiciones:",
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
          "Asimismo, manifiesto expresamente que me obligo a abonar a la inmobiliaria interviniente el "+(op.comision_porcentaje||"3")+"% del Precio en concepto de honorarios por labor de intermediación cumplimentada, al momento de firmarse la Escritura Traslativa de Dominio y/o el Boleto de Compraventa, lo que ocurra primero.-",
          "En caso de incumplimiento o arrepentimiento de alguna de Las Partes, una vez cumplidos todos los Ad Referéndum de la presente Reserva, la parte incumplidora deberá abonar los honorarios pactados en concepto de labor de intermediación realizada hasta el momento, sin necesidad de formalidad judicial alguna.-",
        ],
        firmante: op.vendedor_nombre||"",
        dni: op.vendedor_dni||"",
      },
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="boleto") {
    var doc = {
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
        {titulo:"5. HONORARIOS DEL VENDEDOR", items:["El VENDEDOR abonará el "+(op.comision_vendedor||op.comision_porcentaje||"___")+"% del Precio total en concepto de honorarios por la labor de intermediación inmobiliaria.-"]},
        {titulo:"6. HONORARIOS DEL COMPRADOR", items:["El COMPRADOR abonará el "+(op.comision_comprador||op.comision_porcentaje||"___")+"% del Precio total en concepto de honorarios por la labor de intermediación inmobiliaria.-"]},
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
    var doc = {
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
        {titulo:"1. OBJETO", items:["El LOCATARIO / OFERENTE entrega en este acto, en concepto de Reserva de Locación sujeta a la conformidad del LOCADOR, la suma de "+(MA?"DÓLARES ESTADOUNIDENSES":"PESOS ARGENTINOS")+" "+fmt$L(op.res_alq_monto_reserva,op.res_alq_moneda)+", para la locación del inmueble ubicado en "+(op.inmueble_direccion||"___")+", "+(op.inmueble_partido||"___")+", Provincia de "+(op.inmueble_provincia||"___")+".-"]},
        {titulo:"2. CONDICIONES ESTIMADAS DE LOCACIÓN", items:["Canon mensual estimado: "+fmt$L(op.res_alq_monto_mensual,op.res_alq_moneda)+". Plazo estimado: "+(op.res_alq_plazo_cantidad||"24")+" "+(op.res_alq_plazo_unidad||"meses")+". Inicio estimado: "+fmtD(op.res_alq_inicio_estimado)+".-"]},
        {titulo:"3. VIGENCIA Y ACEPTACIÓN", items:["El LOCADOR deberá conformar la presente dentro de los "+(op.res_alq_aceptacion_dias||"2")+" días. La Reserva mantendrá su vigencia por "+(op.res_alq_vigencia_dias||"10")+" días corridos contados desde su conformación, plazo dentro del cual deberá suscribirse el correspondiente Contrato de Locación.-"]},
        {titulo:"4. HONORARIOS DEL LOCADOR", items:["El LOCADOR abonará el "+(op.res_alq_comision_locador||op.res_alq_comision||"___")+"% del canon mensual en concepto de honorarios por la labor de intermediación inmobiliaria.-"]},
        {titulo:"5. HONORARIOS DEL LOCATARIO", items:["El LOCATARIO abonará el "+(op.res_alq_comision_locatario||op.res_alq_comision||"___")+"% del canon mensual en concepto de honorarios por la labor de intermediación inmobiliaria.-"]},
      ],
      firmas:[
        {rol:"LOCATARIO / OFERENTE", nombre:op.locatario_nombre||"", dni:op.locatario_dni||""},
        {rol:"LOCADOR / PROPIETARIO", nombre:op.locador_nombre||"", dni:op.locador_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="comodato") {
    var doc = {
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
    var doc = {
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
        {titulo:"4. HONORARIOS", items:["El PROPIETARIO abonará a la INMOBILIARIA el "+(op.comision_vendedor||"3")+"% del precio de venta en concepto de honorarios por la labor de intermediación, en caso de concretarse la operación.-"]},
      ],
      firmas:[
        {rol:"PROPIETARIO / AUTORIZANTE", nombre:op.vendedor_nombre||"", dni:op.vendedor_dni||""},
        {rol:"INMOBILIARIA", nombre:op.comprador_nombre||"", dni:op.comprador_dni||""},
      ],
    };
    return finalizeDoc(doc, op, clausulasLib);
  }

  if (tipo==="refuerzo_reserva") {
    var doc = {
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
    var doc = {
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
    ? "Se constituye garantía propietaria a cargo de "+(op.alquiler_garantia_titular||"___")+", DNI/CUIT "+(op.alquiler_garantia_dni||"___")+", titular del inmueble sito en "+(op.alquiler_garantia_inmueble||"___")+".-"
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

  var doc = {
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
      {titulo:"10. HONORARIOS DEL LOCADOR", items:["El LOCADOR abonará el "+(op.alquiler_comision_locador||op.alquiler_comision||"___")+"% del primer canon mensual en concepto de honorarios por la labor de intermediación inmobiliaria.-"]},
      {titulo:"11. HONORARIOS DEL LOCATARIO", items:["El LOCATARIO abonará el "+(op.alquiler_comision_locatario||op.alquiler_comision||"___")+"% del primer canon mensual en concepto de honorarios por la labor de intermediación inmobiliaria.-"]},
    ],
    firmas:[
      {rol:"LOCADOR", nombre:op.locador_nombre||"", dni:op.locador_dni||""},
      {rol:"LOCATARIO", nombre:op.locatario_nombre||"", dni:op.locatario_dni||""},
    ],
  };
  return finalizeDoc(doc, op, clausulasLib);
}


// ── RECIBO DE HONORARIOS ───────────────────────────────────────────────────────
function buildReciboSections(op, perfil, destinatario) {
  // destinatario: "parte1" | "parte2"
  var esAlq = op.tipo === "alquiler";
  var esBoleto = op.tipo === "boleto";
  var esReserva = op.tipo === "reserva";
  var esResAlq = op.tipo === "reserva_alquiler";

  // Datos de quien paga
  var pagador, rolPagador, montoBase, moneda, pct, concepto, fecha;

  if (esAlq) {
    montoBase = parseFloat(op.alquiler_monto_inicial || 0);
    moneda = op.alquiler_moneda || "ARS";
    pct = parseFloat(op.alquiler_comision || 1);
    fecha = op.alquiler_inicio || new Date().toISOString().slice(0,10);
    if (destinatario === "parte1") {
      pagador = op.locador_nombre || "___"; rolPagador = "LOCADOR"; concepto = "Locación del inmueble en "+(op.inmueble_direccion||"___");
    } else {
      pagador = op.locatario_nombre || "___"; rolPagador = "LOCATARIO"; concepto = "Locación del inmueble en "+(op.inmueble_direccion||"___");
    }
  } else if (esBoleto || esReserva) {
    montoBase = parseFloat(op.precio || 0);
    moneda = op.moneda || "USD";
    pct = parseFloat(op.comision_porcentaje || 3);
    fecha = op.fecha_posesion || new Date().toISOString().slice(0,10);
    if (destinatario === "parte1") {
      pagador = op.vendedor_nombre || "___"; rolPagador = "VENDEDOR"; pct = pct / 2;
      concepto = (esBoleto ? "Boleto de Compraventa" : "Reserva de Compra") + " — inmueble en " + (op.inmueble_direccion||"___");
    } else {
      pagador = op.comprador_nombre || "___"; rolPagador = "COMPRADOR"; pct = pct / 2;
      concepto = (esBoleto ? "Boleto de Compraventa" : "Reserva de Compra") + " — inmueble en " + (op.inmueble_direccion||"___");
    }
  } else { // reserva_alquiler
    montoBase = parseFloat(op.res_alq_monto_mensual || 0);
    moneda = op.res_alq_moneda || "ARS";
    pct = parseFloat(op.res_alq_comision || 1);
    fecha = op.res_alq_inicio_estimado || new Date().toISOString().slice(0,10);
    if (destinatario === "parte1") {
      pagador = op.locador_nombre || "___"; rolPagador = "LOCADOR"; concepto = "Reserva de Locación — inmueble en "+(op.inmueble_direccion||"___");
    } else {
      pagador = op.locatario_nombre || "___"; rolPagador = "LOCATARIO"; concepto = "Reserva de Locación — inmueble en "+(op.inmueble_direccion||"___");
    }
  }

  var monto = montoBase * pct / 100;
  var nroRecibo = "R-" + Date.now().toString().slice(-6);

  return {
    titulo: "RECIBO DE HONORARIOS PROFESIONALES",
    subtitulo: "Comprobante de pago — " + (perfil && perfil.nombre ? perfil.nombre : "Inmobiliaria"),
    ciudad: (op.inmueble_partido||"___") + ", Provincia de " + (op.inmueble_provincia||"Buenos Aires"),
    fecha: fmtDLarga(fecha),
    nroRecibo: nroRecibo,
    esRecibo: true,
    partes: [
      { rol: rolPagador, nombre: pagador, dni: (destinatario==="parte1"?(esAlq?op.locador_dni:op.vendedor_dni):(esAlq?op.locatario_dni:op.comprador_dni))||"___", domicilio:"", email:"" },
      { rol: "INMOBILIARIA INTERVINIENTE", nombre: (perfil&&perfil.nombre)||"___", dni: (perfil&&perfil.matricula)?"Mat. "+(perfil.matricula):"", domicilio:"", email: (perfil&&perfil.email)||"" },
    ],
    secciones: [
      { titulo: "DETALLE DEL RECIBO", items: [
        "La " + ((perfil&&perfil.nombre)||"inmobiliaria") + (perfil&&perfil.matricula?", Matrícula "+perfil.matricula:"") + " recibió de la " + (ROL_A_PARTE[rolPagador]||rolPagador.toLowerCase()) + " " + pagador + " la suma de " + fmt$(monto, moneda) + " en concepto de honorarios profesionales de intermediación inmobiliaria.",
        "Operación: " + concepto + ".",
        "Base de cálculo: " + fmt$(montoBase, moneda) + " × " + pct.toFixed(1) + "% = " + fmt$(monto, moneda) + ".",
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
      montoBase: fmt$(montoBase, moneda),
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

function crc32(data) {
  var table = crc32.t;
  if (!table) {
    table = crc32.t = new Uint32Array(256);
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
var DOCX_DEFAULT_FONT = "Calibri";
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
  var lines = Array.isArray(text) ? text : [text||""];
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
    return "<w:r>"+(rPr?"<w:rPr>"+rPr+"</w:rPr>":"")+"<w:t xml:space=\"preserve\">"+esc(r.text||"")+"</w:t></w:r>";
  }).join("");
  return "<w:p>"+(pPr?"<w:pPr>"+pPr+"</w:pPr>":"")+runs+"</w:p>";
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
    DOCX_DEFAULT_FONT = esClasicoD ? "Georgia" : "Calibri";
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
    if (perfil && perfil.nombre) {
      if (logoInfo) {
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
      if (encNombreD) body += px(perfil.nombre.toUpperCase(), {bold:true, size:14, center:true, color:DOCX_COLOR_PRIM, spacing:{before:60,after:30}});
      if (encMatriculaD && perfil.matricula) body += px("Matrícula: "+perfil.matricula, {size:9, center:true, color:"666666", spacing:{before:0,after:30}});
      if (encWebD && perfil.web) body += px(perfil.web, {size:9, center:true, color:"666666", spacing:{before:0,after:30}});
      body += px("", {border:true, spacing:{before:80,after:80}});
    }

    // Título
    body += px(doc.titulo.toUpperCase(), {bold:true, size:15, center:true, spacing:{before:160,after:60}});
    if (doc.subtitulo) body += px(doc.subtitulo, {size:10, center:true, color:"555555", spacing:{before:0,after:60}});
    if (doc.nroRecibo) body += px("N° "+doc.nroRecibo, {bold:true, size:12, center:true, spacing:{before:40,after:80}});
    body += px("", {border:true, spacing:{before:60,after:60}});
    body += px("Lugar: "+(doc.ciudad||"")+"  —  Fecha: "+(doc.fecha||""), {size:10, spacing:{before:80,after:80}});
    body += px("", {border:true, spacing:{before:60,after:120}});

    // Encabezado narrativo (reserva y otros tipos que lo definan)
    if (doc.encabezado) {
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
        if (parte.dni) body += px("DNI/CUIT: "+parte.dni, {size:9, color:"444444", spacing:{before:0,after:20}});
        if (parte.domicilio) body += px("Domicilio: "+parte.domicilio, {size:9, color:"444444", spacing:{before:0,after:20}});
        if (parte.email) body += px("Email: "+parte.email, {size:9, color:"444444", spacing:{before:0,after:20}});
        if (parte.telefono) body += px("Teléfono: "+parte.telefono, {size:9, color:"444444", spacing:{before:0,after:20}});
      });
      body += px("", {border:true, spacing:{before:120,after:120}});
    }

    // Secciones — rótulo en negrita + texto corrido en el mismo párrafo, justificado.
    // Si el título es solo el número ("7."), la cláusula no lleva rótulo (como en el modelo).
    function parseClauseTituloDocx(titulo){
      var m=/^(\d+)\.\s*(.*)$/.exec(titulo||"");
      if(!m) return {num:0,ord:titulo||"",label:""};
      var n=parseInt(m[1],10);
      return {num:n,ord:"CL\xc1USULA "+(ordinalFem(n)||m[1]),label:m[2]};
    }
    if (doc.secciones && doc.secciones.length) {
      doc.secciones.forEach(function(sec) {
        var pc = parseClauseTituloDocx(sec.titulo);
        var prefix = pc.label ? (pc.ord+" \u2014 "+pc.label+": ") : (pc.ord+": ");
        (sec.items||[]).forEach(function(item, idx) {
          if (!item) return;
          if (idx === 0) {
            body += pxRuns([
              {text: prefix, bold:true, size:10.5, color:DOCX_COLOR_PRIM},
              {text: item, size:10.5},
            ], {justify:true, spacing:{before:200, after:80}});
          } else {
            body += px(item, {size:10.5, spacing:{before:40, after:80}, justify:true});
          }
        });
      });
    }

    // Cláusulas (continúan la numeración de las secciones, sin encabezado separado)
    if (doc.clausulas && doc.clausulas.length) {
      doc.clausulas.forEach(function(c) {
        var ord="CL\xc1USULA "+(ordinalFem(c.num)||("N\xb0 "+c.num));
        var label = ord+(c.titulo?" \u2014 "+c.titulo.toUpperCase():"");
        body += pxRuns([
          {text: label+": ", bold:true, size:10.5, color:DOCX_COLOR_PRIM},
          {text: c.texto||"", size:10.5},
        ], {justify:true, spacing:{before:200, after:80}});
      });
    }

    // Firmas principales (usa doc.firmas; si no está definido, cae a doc.partes por compatibilidad)
    body += px("", {border:true, spacing:{before:120,after:120}});
    body += px("FIRMAS", {bold:true, size:11, center:true, spacing:{before:160,after:160}});
    var firmantesPpalesDocx = (doc.firmas && doc.firmas.length) ? doc.firmas : doc.partes;
    var huboInmobEnFirmasDocx = false;
    if (firmantesPpalesDocx) {
      firmantesPpalesDocx.forEach(function(parte) {
        var nombreFirma = parte.usarPerfil ? ((perfil&&perfil.nombre)||"Inmobiliaria interviniente") : parte.nombre;
        var rolFirma = parte.usarPerfil ? (parte.rol+((perfil&&perfil.matricula)?" — Mat. "+perfil.matricula:"")) : parte.rol;
        if (parte.usarPerfil) huboInmobEnFirmasDocx = true;
        body += px("________________________", {size:10, spacing:{before:120,after:20}});
        body += px(rolFirma||"", {size:9, color:"555555", spacing:{before:0,after:10}});
        body += px(nombreFirma||"", {size:10, bold:true, spacing:{before:0,after:80}});
      });
    }
    if (!huboInmobEnFirmasDocx) {
      body += px("________________________", {size:10, spacing:{before:80,after:20}});
      body += px("INMOBILIARIA INTERVINIENTE"+(perfil&&perfil.nombre?" — "+perfil.nombre:""), {size:9, color:"555555"});
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
      body += px("________________________", {size:10, spacing:{before:120,after:20}});
      body += px("PROPIETARIO", {size:9, color:"555555", spacing:{before:0,after:10}});
      body += px(doc.conformidad.firmante||"", {size:10, bold:true, spacing:{before:0,after:10}});
      if (doc.conformidad.dni) body += px("DNI/CUIT: "+doc.conformidad.dni, {size:9, color:"444444", spacing:{before:0,after:80}});
    }

    // Footer con nombre inmobiliaria y número de hoja
    if (perfil && perfil.nombre) {
      body += px("", {border:true, spacing:{before:40,after:30}});
      body += px((perfil.nombre||"")+(perfil.matricula?" — Mat. "+perfil.matricula:""), {size:8, color:"888888", center:true, italic:true, spacing:{before:0,after:20}});
      body += px("Pagina 1", {size:8, color:"aaaaaa", center:true, spacing:{before:0,after:0}});
      if (perfil.pie_pagina_texto) {
        body += px(perfil.pie_pagina_texto, {size:8, color:"999999", center:true, italic:true, spacing:{before:60,after:0}});
      }
      if (perfil.pie_pagina_logo_debajo && logoInfo) {
        // Copia chica del logo (aprox. 1.5cm de alto) debajo de la leyenda del pie.
        var miniMaxHpx = 57, miniFitScale = Math.min(1, miniMaxHpx/logoInfo.height);
        var miniDispW = Math.max(1, Math.round(logoInfo.width*miniFitScale));
        var miniDispH = Math.max(1, Math.round(logoInfo.height*miniFitScale));
        var miniCx = miniDispW*9525, miniCy = miniDispH*9525;
        body += '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="0"/></w:pPr><w:r><w:drawing>'
          + '<wp:inline distT="0" distB="0" distL="0" distR="0">'
          + '<wp:extent cx="'+miniCx+'" cy="'+miniCy+'"/>'
          + '<wp:docPr id="2" name="LogoPie"/>'
          + '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
          + '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          + '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          + '<pic:nvPicPr><pic:cNvPr id="2" name="LogoPie"/><pic:cNvPicPr/></pic:nvPicPr>'
          + '<pic:blipFill><a:blip r:embed="rIdLogo1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
          + '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+miniCx+'" cy="'+miniCy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
          + '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
      }
    }

    // Assemble OOXML files
    var CT = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
      + (logoInfo ? '<Default Extension="jpeg" ContentType="image/jpeg"/>' : '')
      + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';

    var RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';

    var DOC_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + (logoInfo ? '<Relationship Id="rIdLogo1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo1.jpeg"/>' : '')
      + '</Relationships>';

    var DOC = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>'+body+'<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>';

    var files = [
      {name:"[Content_Types].xml", data:u8(CT)},
      {name:"_rels/.rels",         data:u8(RELS)},
      {name:"word/document.xml",   data:u8(DOC)},
      {name:"word/_rels/document.xml.rels", data:u8(DOC_RELS)},
    ];
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


// ── LOGO EMBEBIDO ─────────────────────────────────────────────────────────────
const LOGO_B64 = "data:image/png;base64,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";

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
          style={{width:200,height:200,objectFit:"contain",filter:"drop-shadow(0 0 40px rgba(212,168,83,0.6))"}}/>
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
  html,body{overflow-x:hidden;max-width:100vw;}
  :root{
    --bg:#f1f5f9;--surface:#ffffff;--card:#ffffff;--border:rgba(0,0,0,0.08);--border2:rgba(0,0,0,0.13);
    --gold:#d4a853;--gold2:#f0c878;--text:#0f172a;--muted:#3f4c5e;--dim:#64748b;
    --teal:#2dd4bf;--red:#f87171;--green:#4ade80;--amber:#fbbf24;
    --mobile-nav-h:60px;
  }
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.5;min-height:100vh;}
  ::-webkit-scrollbar{width:6px;height:6px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--dim);border-radius:3px;}

  /* Texto gris (var(--muted) / var(--dim)) suele ir en letra muy fina y cuesta
     de leer en pantallas chicas. Se engrosa por default en todo el texto que
     use esos colores y no tenga ya un font-weight propio más marcado — los
     rótulos que ya son bold (ej. uppercase labels en 700) no se tocan porque
     su font-weight inline tiene prioridad sobre esta regla. */
  [style*="var(--muted)"], [style*="var(--dim)"], .field-hint, .field-label, .stat-lbl{font-weight:600;}

  /* ── Layout TokkoBroker style ── */
  .app-bg{position:fixed;inset:0;z-index:0;background:var(--bg);transition:background 0.3s;}
  .app-wrap{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;}

  /* ── Topbar ── */
  .topbar{height:58px;background:linear-gradient(115deg,#0b1730 0%,#122a58 55%,#0e2049 100%);border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:14px;padding:0 20px;position:sticky;top:0;z-index:50;box-shadow:0 2px 16px rgba(0,0,0,0.25);}
  .topbar-logo{display:flex;align-items:center;gap:10px;width:200px;flex-shrink:0;}
  .topbar-logo img{height:36px;width:auto;object-fit:contain;filter:drop-shadow(0 0 8px rgba(212,168,83,0.35));}
  .topbar-logo-text{font-family:'DM Serif Display',serif;font-size:20px;color:#f1f5f9;line-height:1;}
  .topbar-search{flex:1;max-width:480px;position:relative;}
  .topbar-search input{width:100%;padding:9px 14px 9px 38px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);border-radius:10px;color:#f1f5f9;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:all 0.15s;}
  .topbar-search input::placeholder{color:rgba(241,245,249,0.45);}
  .topbar-search input:focus{border-color:rgba(212,168,83,0.55);background:rgba(212,168,83,0.08);}
  .topbar-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:rgba(241,245,249,0.45);font-size:14px;pointer-events:none;}
  .topbar-right{display:flex;align-items:center;gap:10px;margin-left:auto;}
  .topbar-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold2));display:flex;align-items:center;justify-content:center;font-size:14px;color:#0a0f1a;font-weight:700;cursor:pointer;overflow:hidden;border:2px solid rgba(212,168,83,0.4);}

  /* ── Body below topbar ── */
  .app-body{display:flex;flex:1;min-height:calc(100vh - 58px);}

  /* ── Icon sidebar ── */
  .sidebar{width:64px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:4px;position:sticky;top:58px;height:calc(100vh - 58px);overflow:visible;flex-shrink:0;z-index:40;}
  .nav-item{position:relative;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;color:var(--dim);background:transparent;border:1px solid transparent;transition:all 0.15s;flex-shrink:0;}
  .nav-item:hover{background:rgba(255,255,255,0.06);color:var(--text);}
  .nav-item.active{background:rgba(212,168,83,0.12);color:var(--gold);border-color:rgba(212,168,83,0.3);}
  .nav-item .tooltip{position:absolute;left:54px;top:50%;transform:translateY(-50%);background:#1e293b;color:#f1f5f9;font-size:12px;font-weight:500;padding:5px 10px;border-radius:7px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.15s;border:1px solid rgba(255,255,255,0.12);box-shadow:0 4px 16px rgba(0,0,0,0.4);z-index:200;}
  .nav-item:hover .tooltip{opacity:1;}
  .sidebar-spacer{flex:1;}
  .sidebar-bottom-icon{position:relative;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;color:var(--dim);background:transparent;transition:all 0.15s;}
  .sidebar-bottom-icon:hover{background:rgba(255,255,255,0.06);color:var(--text);}

  /* ── Main content ── */
  .main{flex:1;overflow:hidden;display:flex;flex-direction:column;}
  .content{padding:24px;overflow-y:auto;flex:1;max-height:calc(100vh - 58px);}

  /* ── Mobile top bar ── */
  .mobile-topbar{display:none;position:sticky;top:0;z-index:50;height:52px;background:var(--surface);border-bottom:1px solid var(--border);align-items:center;justify-content:space-between;padding:0 16px;}
  .mobile-topbar-logo{display:flex;align-items:center;gap:8px;}
  .mobile-logo-text{font-family:'DM Serif Display',serif;font-size:17px;color:var(--text);}

  /* ── Mobile bottom nav ── */
  .mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:40;height:var(--mobile-nav-h);background:var(--surface);border-top:1px solid var(--border);padding:0 2px;padding-bottom:env(safe-area-inset-bottom,0px);}
  .mobile-nav-inner{display:flex;align-items:center;height:100%;}
  .mobile-nav-item{display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 2px;border-radius:10px;border:none;background:transparent;cursor:pointer;color:var(--dim);transition:all 0.15s;min-width:0;}
  .mobile-nav-item.active{color:var(--gold);}
  .mobile-nav-item span:first-child{font-size:19px;line-height:1;}
  .mobile-nav-item span:last-child{font-size:9px;font-weight:700;text-align:center;line-height:1.15;word-break:break-word;max-width:100%;}

  /* ── Cards ── */
  .card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:background 0.3s,border-color 0.3s;}
  .op-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px 18px;transition:all 0.22s;position:relative;overflow:hidden;}
  .op-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--border2),transparent);}
  .op-card:hover{border-color:rgba(212,168,83,0.3);box-shadow:0 8px 24px rgba(0,0,0,0.15);}
  .stat-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;position:relative;overflow:hidden;transition:all 0.2s;}
  .stat-card:hover{border-color:rgba(212,168,83,0.2);transform:translateY(-1px);}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2),transparent);}
  .stat-val{font-family:'DM Serif Display',serif;font-size:30px;color:var(--text);line-height:1;}
  .stat-lbl{font-size:11.5px;color:var(--dim);margin-top:3px;}
  .stat-icon{font-size:20px;margin-bottom:8px;opacity:0.8;}

  /* ── Badges ── */
  .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:500;}
  .badge-borrador{background:rgba(251,191,36,0.1);color:var(--amber);border:1px solid rgba(251,191,36,0.2);}
  .badge-activo{background:rgba(74,222,128,0.1);color:var(--green);border:1px solid rgba(74,222,128,0.2);}
  .badge-cerrado{background:rgba(148,163,184,0.08);color:var(--dim);border:1px solid rgba(148,163,184,0.12);}
  .badge-tipo{background:rgba(45,212,191,0.08);color:var(--teal);border:1px solid rgba(45,212,191,0.15);}
  .badge-gold{background:rgba(212,168,83,0.1);color:var(--gold);border:1px solid rgba(212,168,83,0.2);}

  /* ── Buttons ── */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;border-radius:9px;cursor:pointer;transition:all 0.15s;border:none;outline:none;white-space:nowrap;}
  .btn:disabled{opacity:0.4;cursor:not-allowed;}
  .btn-primary{background:linear-gradient(135deg,#c9962a,var(--gold),var(--gold2));color:#0a0f1a;padding:8px 16px;box-shadow:0 2px 16px rgba(212,168,83,0.3);font-weight:600;}
  .btn-primary:hover:not(:disabled){box-shadow:0 6px 24px rgba(212,168,83,0.5);transform:translateY(-1px);}
  .btn-secondary{background:rgba(255,255,255,0.06);color:var(--text);border:1px solid var(--border2);padding:7px 14px;}
  .btn-secondary:hover:not(:disabled){background:rgba(255,255,255,0.1);}
  .btn-ghost{background:transparent;color:var(--muted);padding:7px 12px;}
  .btn-ghost:hover:not(:disabled){background:rgba(255,255,255,0.05);color:var(--text);}
  .btn-success{background:rgba(74,222,128,0.15);color:var(--green);border:1px solid rgba(74,222,128,0.25);padding:8px 16px;}
  .btn-success:hover:not(:disabled){background:rgba(74,222,128,0.25);}
  .btn-orange{background:rgba(251,146,60,0.15);color:#fb923c;border:1px solid rgba(251,146,60,0.25);padding:6px 12px;}
  .btn-orange:hover:not(:disabled){background:rgba(251,146,60,0.25);}
  .btn-danger{background:rgba(248,113,113,0.1);color:var(--red);border:1px solid rgba(248,113,113,0.2);padding:7px 12px;}
  .btn-danger:hover:not(:disabled){background:rgba(248,113,113,0.2);}
  .btn-sm{padding:5px 11px;font-size:12px;}

  /* ── Inputs ── */
  .field{display:flex;flex-direction:column;gap:4px;}
  .field-label{font-size:12px;font-weight:500;color:var(--muted);}
  .field-hint{font-size:10.5px;color:var(--dim);margin-top:1px;}
  .inp{width:100%;padding:10px 12px;background:rgba(255,255,255,0.04);border:1px solid var(--border2);border-radius:9px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:16px;outline:none;transition:all 0.15s;}
  .inp::placeholder{color:var(--dim);}
  .inp:focus{border-color:rgba(212,168,83,0.6);background:rgba(212,168,83,0.05);box-shadow:0 0 0 3px rgba(212,168,83,0.1);}
  .inp:hover:not(:focus){border-color:rgba(255,255,255,0.15);}
  textarea.inp{resize:vertical;min-height:65px;}
  select.inp{cursor:pointer;}
  select.inp option{background:#1e293b;color:#f1f5f9;}

  /* ── Modal ── */
  .modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);}
  .modal-box{background:var(--card);border:1px solid var(--border2);border-radius:20px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 32px 100px rgba(0,0,0,0.35);}
  .modal-box.wide{max-width:700px;}
  .modal-box.narrow{max-width:460px;}
  .modal-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--card);z-index:10;border-radius:20px 20px 0 0;}
  .modal-title{font-family:'DM Serif Display',serif;font-size:17px;color:var(--text);}
  .modal-body{padding:18px 20px 24px;}
  .modal-close{background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);font-size:15px;transition:all 0.15s;flex-shrink:0;}
  .modal-close:hover{background:rgba(255,255,255,0.1);color:var(--text);}

  /* ── Search ── */
  .search-wrap{position:relative;}
  .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--dim);font-size:13px;}
  .search-inp{width:100%;padding:10px 12px 10px 36px;background:rgba(255,255,255,0.04);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:16px;outline:none;transition:all 0.15s;}
  .search-inp::placeholder{color:var(--dim);}
  .search-inp:focus{border-color:rgba(212,168,83,0.5);background:rgba(212,168,83,0.04);}

  /* ── Steps ── */
  .steps{display:flex;align-items:center;gap:3px;overflow-x:auto;padding-bottom:3px;-webkit-overflow-scrolling:touch;}
  .step-item{display:flex;align-items:center;gap:2px;flex-shrink:0;}
  .step-dot{display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:500;transition:all 0.15s;}
  .step-dot.done{background:rgba(74,222,128,0.12);color:var(--green);}
  .step-dot.active{background:linear-gradient(135deg,rgba(212,168,83,0.2),rgba(212,168,83,0.08));color:var(--gold);border:1px solid rgba(212,168,83,0.4);}
  .step-dot.pending{background:rgba(255,255,255,0.04);color:var(--dim);}
  .step-dot.flag{background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(239,68,68,0.45);}
  .step-line{width:8px;height:1px;background:var(--border2);}
  .step-line.done{background:rgba(74,222,128,0.3);}

  /* ── Tipo grid ── */
  .tipo-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .tipo-card{padding:14px;border-radius:12px;border:1.5px solid var(--border2);background:rgba(255,255,255,0.02);cursor:pointer;text-align:left;transition:all 0.15s;outline:none;}
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
  .section-title{font-family:'DM Serif Display',serif;font-size:22px;color:var(--text);}
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

  /* ── PDF preview ── */
  .pdf-preview{background:#1e293b;border-radius:12px;padding:14px;}
  .pdf-chrome{display:flex;align-items:center;gap:5px;margin-bottom:10px;}
  .pdf-dot{width:9px;height:9px;border-radius:50%;}
  .pdf-content{background:white;border-radius:8px;padding:12px;max-height:180px;overflow-y:auto;}
  .pdf-content-lg{max-height:min(62vh,560px);padding:18px 16px;}
  .pdf-text{font-size:9.5px;font-family:monospace;color:#374151;white-space:pre-wrap;line-height:1.5;}
  .pdf-content-lg .pdf-text{font-size:12.5px;line-height:1.65;font-family:'DM Sans',sans-serif;}
  @media (max-width:640px){ .pdf-content-lg{max-height:56vh;padding:14px 12px;} .pdf-content-lg .pdf-text{font-size:12px;} }
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
  .fab{display:none;position:fixed;bottom:calc(var(--mobile-nav-h) + 12px);right:16px;z-index:39;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#c9962a,var(--gold),var(--gold2));border:none;cursor:pointer;font-size:24px;color:#0a0f1a;box-shadow:0 6px 24px rgba(212,168,83,0.5);align-items:center;justify-content:center;transition:all 0.18s;}
  .fab:hover{transform:scale(1.08);}

  @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes diskpulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  .fade-up{animation:fadeUp 0.25s ease backwards;}

  /* ── Two-col layout (Cláusulas, Cuenta) ── */
  .two-col-layout{display:grid;grid-template-columns:1fr 1.4fr;gap:22px;align-items:start;}

  /* ═══════════════════════════════════════════
     RESPONSIVE — tablet ≤ 900px
  ═══════════════════════════════════════════ */
  @media(max-width:900px){
    .sidebar{width:56px;}
    .content{padding:18px;}
    .grid2{grid-template-columns:1fr 1fr;}
  }
  /* ═══════════════════════════════════════════
     RESPONSIVE — mobile ≤ 640px
  ═══════════════════════════════════════════ */
  @media(max-width:640px){
    .topbar{display:none !important;}
    .app-body{flex-direction:column;}
    .sidebar{display:none !important;}
    .mobile-topbar{display:flex !important;}
    .mobile-nav{display:block !important;}
    .fab{display:flex !important;}

    /* Main layout: full width, bottom nav clearance */
    .main{min-height:calc(100vh - 52px);}
    .content{padding:12px 12px calc(var(--mobile-nav-h) + 20px) 12px;}

    /* Hide the "+ Nueva operación" button inside section-header on mobile
       (already in mobile topbar and FAB) */
    .section-header .btn-nueva{display:none !important;}

    /* Grids */
    .grid2{grid-template-columns:1fr;}
    .grid3{grid-template-columns:1fr;}
    .col2{grid-column:span 1;}
    .col3{grid-column:span 1;}

    /* Estado tabs: scroll horizontally instead of wrapping */
    .estado-tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap;padding-bottom:2px;}
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
    .modal-overlay{padding:0;align-items:flex-end;}
    .modal-box,.modal-box.wide,.modal-box.narrow{max-width:100%;width:100%;border-radius:20px 20px 0 0;max-height:94vh;}
    .modal-body{padding:16px 16px 28px;}
    .modal-header{border-radius:20px 20px 0 0;}

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

function Modal({open,onClose,title,children,wide,formTipo,headerExtra}){
  if(!open)return null;
  return(
    <div className="modal-overlay" onClick={function(e){if(e.target===e.currentTarget)onClose();}}>
      <div className={"modal-box fade-up "+(wide?"wide":"narrow")}>
        <div className="modal-head" style={headerExtra?{flexWrap:"wrap",rowGap:8}:undefined}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",rowGap:8}}>
            <span className="modal-title">{title}</span>
            {formTipo&&TIPOS[formTipo]&&<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:20,background:TIPO_BG[formTipo]||"rgba(212,168,83,0.1)",color:TIPO_FG[formTipo]||"var(--gold)",fontSize:11,fontWeight:600,border:"1px solid "+(TIPO_FG[formTipo]||"var(--gold)")+"44"}}>{TIPO_ICON[formTipo]} {TIPOS[formTipo]}</span>}
            {headerExtra}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
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
          <button className="modal-close" onClick={onCancel}>✕</button>
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
const STEPS_RES_ALQ=[{id:1,l:"Tipo"},{id:2,l:"Locador"},{id:3,l:"Locatario"},{id:4,l:"Inmueble"},{id:5,l:"Condiciones"},{id:6,l:"Cláusulas"}];
const STEPS_SIMPLE=[{id:1,l:"Tipo"},{id:2,l:"Parte A"},{id:3,l:"Parte B"},{id:4,l:"Datos"},{id:5,l:"Cláusulas"}];
// Etiquetas de partes según el tipo de documento "simple" (comodato,
// autorización de venta, refuerzo, devolución) — reemplazan el genérico
// "Parte A" / "Parte B" por el rol real (ej. Comodatario / Comodante).
var PARTES_SIMPLE_LABELS = {
  comodato:            ["Comodatario","Comodante"],
  exclusividad:        ["Interesado","Propietario"],
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
        <Inp label="Nombre completo / Razón social" value={f("nombre")} onChange={s("nombre")} onBlur={onBlurNombre} placeholder="Juan Pérez" className="col2" {...estiloCampoFaltante(faltantes,prefix+"_nombre")}/>
        <Inp label="DNI / CUIT" value={f("dni")} onChange={s("dni")} placeholder="20-12345678-9"/>
        <Inp label="Teléfono" value={f("telefono")} onChange={s("telefono")} placeholder="+54 9 11 1234-5678"/>
        <Inp label="Email" value={f("email")} onChange={s("email")} placeholder="email@ejemplo.com" type="email" className="col2"/>
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
                <Inp label="Nombre completo" value={p.nombre||""} onChange={function(e){actualizarCotitular(i,"nombre",e.target.value);}} onBlur={onBlurNombreCotitular(i)} placeholder="María Gómez" className="col2"/>
                <Inp label="DNI / CUIT" value={p.dni||""} onChange={function(e){actualizarCotitular(i,"dni",e.target.value);}} placeholder="27-98765432-1"/>
                <Inp label="Teléfono" value={p.telefono||""} onChange={function(e){actualizarCotitular(i,"telefono",e.target.value);}} placeholder="+54 9 11 ..."/>
                <Inp label="Email" value={p.email||""} onChange={function(e){actualizarCotitular(i,"email",e.target.value);}} placeholder="email@ejemplo.com" className="col2"/>
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

function StepEconomicoCompra({data,onChange,equipo,faltantes}){
  var precio=parseFloat(data.precio)||0,anticipo=parseFloat(data.anticipo)||0;
  var pctV=parseFloat(data.comision_vendedor||0),pctC=parseFloat(data.comision_comprador||0);
  useEffect(function(){if(precio>0)onChange("saldo",String(Math.max(0,precio-anticipo)));},[data.precio,data.anticipo]);
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
        {data.tipo!=="reserva"&&<Inp label="Escribanía" value={data.escribania||""} onChange={function(e){onChange("escribania",e.target.value);}} placeholder="Escribanía García" className="col2"/>}
        <div className="col2"><div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Comisión inmobiliaria (sugerida: 4% vendedor / 3% comprador)</div>
          <div className="grid2">
            <Inp label="% Vendedor" value={data.comision_vendedor||""} onChange={function(e){onChange("comision_vendedor",e.target.value);}} placeholder="4" type="number" hint={precio>0&&pctV>0?"= "+fmt$(precio*pctV/100,data.moneda):""}/>
            <Inp label="% Comprador" value={data.comision_comprador||""} onChange={function(e){onChange("comision_comprador",e.target.value);}} placeholder="3" type="number" hint={precio>0&&pctC>0?"= "+fmt$(precio*pctC/100,data.moneda):""}/>
          </div>
          {(pctV+pctC)>0&&precio>0&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,background:"rgba(212,168,83,0.07)",border:"1px solid rgba(212,168,83,0.2)",fontSize:12,color:"var(--gold)",display:"flex",justifyContent:"space-between"}}><span>Total: {(pctV+pctC).toFixed(2)}%</span><span>{fmt$(precio*(pctV+pctC)/100,data.moneda)}</span></div>}
        </div>
        <CompartidaBlock data={data} onChange={onChange} equipo={equipo}/>
      </div>
    </div>
  );
}

function StepCondicionesAlquiler({data,onChange,equipo,faltantes}){
  var monto=parseFloat(data.alquiler_monto_inicial)||0;
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

      <div className="col2"><div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Comisión (% sobre canon mensual)</div>
        <div className="grid2">
          <Inp label="% Locador" value={data.alquiler_comision_locador||""} onChange={function(e){onChange("alquiler_comision_locador",e.target.value);}} placeholder="0.5" type="number" hint={monto>0&&pctL>0?"= "+fmt$(monto*pctL/100,data.alquiler_moneda):""}/>
          <Inp label="% Locatario" value={data.alquiler_comision_locatario||""} onChange={function(e){onChange("alquiler_comision_locatario",e.target.value);}} placeholder="0.5" type="number" hint={monto>0&&pctT>0?"= "+fmt$(monto*pctT/100,data.alquiler_moneda):""}/>
        </div>
        {(pctL+pctT)>0&&monto>0&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,background:"rgba(212,168,83,0.07)",border:"1px solid rgba(212,168,83,0.2)",fontSize:12,color:"var(--gold)",display:"flex",justifyContent:"space-between"}}><span>Total: {(pctL+pctT).toFixed(2)}%</span><span>{fmt$(monto*(pctL+pctT)/100,data.alquiler_moneda)}</span></div>}
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
  return(
    <div>
      <div className="notice notice-gold" style={{marginBottom:12}}>Reserva previa — los datos se trasladan al contrato definitivo.</div>
      <div className="grid2">
        <Inp label="Monto de reserva" value={data.res_alq_monto_reserva||""} onChange={function(e){onChange("res_alq_monto_reserva",e.target.value);}} placeholder="50000" type="number"/>
        <Slt label="Moneda" value={data.res_alq_moneda||"ARS"} onChange={function(e){onChange("res_alq_moneda",e.target.value);}}><option value="ARS">ARS</option><option value="USD">USD</option></Slt>
        <Inp label="Canon mensual estimado" value={data.res_alq_monto_mensual||""} onChange={function(e){onChange("res_alq_monto_mensual",e.target.value);}} placeholder="180000" type="number" {...estiloCampoFaltante(faltantes,"res_alq_monto_mensual")}/>
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
        <div className="col2"><div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Comisión (% sobre canon mensual)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Inp label="% Locador" value={data.res_alq_comision_locador||""} onChange={function(e){onChange("res_alq_comision_locador",e.target.value);}} placeholder="0.5" type="number"/>
            <Inp label="% Locatario" value={data.res_alq_comision_locatario||""} onChange={function(e){onChange("res_alq_comision_locatario",e.target.value);}} placeholder="0.5" type="number"/>
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
          <Inp label="Comisión (%)" value={data.comision_vendedor||""} onChange={function(e){onChange("comision_vendedor",e.target.value);}} placeholder="3" type="number"/>
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
          <Inp label="DNI / CUIT del garante" value={data.alquiler_garantia_dni||""} onChange={function(e){onChange("alquiler_garantia_dni",e.target.value);}} placeholder="20-98765432-1"/>
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

function StepClausulas({data,onChange,clausulas,esAlquiler,onAddClausula}){
  var selected=data.clausulas_ids||[];
  function toggle(id){onChange("clausulas_ids",selected.includes(id)?selected.filter(function(x){return x!==id;}):selected.concat([id]));}
  var lista=clausulas.filter(function(c){return clausulaAplicaTipo(c,data.tipo);});
  var cats=lista.reduce(function(acc,c){if(!acc.includes(c.categoria))acc.push(c.categoria);return acc;},[]);

  // ── Cláusula adicional: "libre" (texto propio) o "con IA" (narrada) ──
  // Se compone en estado local (título/contenido) y recién se refleja en la
  // operación si "Usar en esta operación" está tildado. Independientemente
  // de eso, "Agregar a mis cláusulas personalizadas" la guarda en la
  // biblioteca para reutilizarla en futuras operaciones.
  const [modoCustom,setModoCustom]=useState("libre"); // "libre" | "ia"
  const [tituloCustom,setTituloCustom]=useState(data.clausulas_custom_titulo||"");
  const [contenidoCustom,setContenidoCustom]=useState(data.clausulas_custom||"");
  const [usarEnOperacion,setUsarEnOperacion]=useState(true);
  const [ideaIA,setIdeaIA]=useState("");
  const [loadingIA,setLoadingIA]=useState(false);
  const [errorIA,setErrorIA]=useState("");
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
        setTituloCustom(draft.titulo||"");
        setContenidoCustom(draft.contenido||"");
        setIdeaIA("");
      } else setErrorIA("No pude interpretar la respuesta. Probá reformular la idea.");
    }catch(e){ setErrorIA("Error al conectar con el asistente. Verificá tu conexión."); }
    setLoadingIA(false);
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
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Seleccioná las cláusulas a incluir. Las marcadas 🔒 <b>OBLIGATORIA</b> las definió el Dueño/Administrador y no se pueden quitar de esta operación.</p>
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

        <div style={{display:"flex",gap:4,marginBottom:12,borderBottom:"1px solid var(--border)"}}>
          <button type="button" onClick={function(){setModoCustom("libre");}} style={{
            padding:"7px 14px",border:"none",background:"transparent",cursor:"pointer",
            fontSize:12.5,fontWeight:600,color:modoCustom==="libre"?"var(--gold)":"var(--dim)",
            borderBottom:modoCustom==="libre"?"2px solid var(--gold)":"2px solid transparent",
            marginBottom:-1,display:"flex",alignItems:"center",gap:6}}>
            ✎ Cláusula libre
          </button>
          <button type="button" onClick={function(){setModoCustom("ia");}} style={{
            padding:"7px 14px",border:"none",background:"transparent",cursor:"pointer",
            fontSize:12.5,fontWeight:600,color:modoCustom==="ia"?"var(--gold)":"var(--dim)",
            borderBottom:modoCustom==="ia"?"2px solid var(--gold)":"2px solid transparent",
            marginBottom:-1,display:"flex",alignItems:"center",gap:6}}>
            ✦ Cláusula con IA
          </button>
        </div>

        {modoCustom==="ia"&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"var(--dim)",marginBottom:9}}>Contale brevemente la idea y la IA te redacta el título y el texto de la cláusula (podés editarlos después).</div>
            <div style={{display:"flex",gap:7,alignItems:"flex-start"}}>
              <textarea className="inp" rows={2} value={ideaIA} onChange={function(e){setIdeaIA(e.target.value);}}
                onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();narrarConIA();}}}
                placeholder="Ej: que el inquilino no pueda tener mascotas sin autorización" style={{flex:1,resize:"none"}}/>
              <Btn s="sm" onClick={narrarConIA} disabled={!ideaIA.trim()||loadingIA}>{loadingIA?"Narrando…":"✦ Narrar"}</Btn>
            </div>
            {errorIA&&<div style={{fontSize:11,color:"var(--red)",marginTop:6}}>{errorIA}</div>}
          </div>
        )}

        <Inp label="Título de la cláusula (opcional)" value={tituloCustom} onChange={function(e){setTituloCustom(e.target.value);}} placeholder="Ej: Prohibición de mascotas" className="col2"/>
        <Txa label="Texto de la cláusula" value={contenidoCustom} onChange={function(e){setContenidoCustom(e.target.value);}} placeholder="Escribí aquí cualquier cláusula específica..." rows={3} className="col2"/>

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

function StepTipo({data,onChange,grupo,operaciones,onSelectReservaRefuerzo}){
  // Only show the group that was selected in StepGrupo
  // TIPO_GRUPOS keys: compra, alquiler, otros
  var gruposToShow = Object.entries(TIPO_GRUPOS).filter(function(e){
    if(!grupo) return true;
    return e[0]===grupo;
  });
  // Reservas de compra abiertas (no cerradas) que todavía no tienen datos
  // cargados en este refuerzo — se ofrecen como atajo para no re-tipear.
  var reservasSugeridas = (data.tipo==="refuerzo_reserva" && !data.parent_id && !data.comprador_nombre)
    ? (operaciones||[]).filter(function(o){return o.tipo==="reserva" && o.estado!=="cerrado";})
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
                    <button key={t.value} onClick={function(){onChange("tipo",t.value);}}
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
          <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Reservas abiertas recientes — tocá una para hacer el refuerzo sobre ella</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {reservasSugeridas.map(function(op){
              return(
                <button key={op.id} onClick={function(){onSelectReservaRefuerzo&&onSelectReservaRefuerzo(op);}}
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
          <div style={{fontSize:10.5,color:"var(--dim)",marginTop:6}}>Si el refuerzo no corresponde a ninguna reserva cargada, seguí normalmente y completá los datos manualmente en el paso siguiente.</div>
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
            <button key={key} onClick={function(){onSelect(key);}}
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
  const [data,setData]=useState(initial||EMPTY_OP);
  // Al editar una operación ya guardada, se resaltan en rojo (en la barra de
  // pasos y en el campo puntual) los datos críticos que todavía faltan. En
  // una operación nueva no se muestra nada en rojo hasta que se guarde.
  const modoEdicion = !!initial;
  const faltantesDetalle = modoEdicion ? getCamposFaltantesDetalle(data) : [];
  const camposFaltantes = faltantesDetalle.map(function(f){return f.campo;});
  const pasosFaltantes = faltantesDetalle.reduce(function(acc,f){acc[f.paso]=true;return acc;},{});

  // Borrador local: mientras se está cargando el documento, cada cambio se
  // guarda (con debounce) en localStorage aparte de la operación "oficial".
  // Así, si se cierra la pestaña sin terminar, no se pierde lo tipeado y al
  // volver a abrir la app se ofrece recuperarlo (ver App → draftPrompt).
  const initialIdRef = useRef(initial ? initial.id || null : null);
  useAutosave("draftOperacion", draftTieneContenido(data) ? { data: data, editId: initialIdRef.current, ts: Date.now() } : null, 600, reportSave);
  useEffect(function(){
    // Al cerrar el formulario (guardado o cancelado) ya no hay borrador pendiente.
    return function(){ lsRemove("draftOperacion"); };
  }, []);

  // Aviso nativo del navegador si se intenta cerrar/recargar la pestaña con
  // el formulario abierto. El borrador ya se autoguarda solo (arriba), así
  // que esto es una advertencia extra, no la única red de seguridad.
  useEffect(function(){
    function handler(e){
      if(!draftTieneContenido(data)) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    }
    window.addEventListener("beforeunload", handler);
    return function(){ window.removeEventListener("beforeunload", handler); };
  }, [data]);
  // Cláusulas por defecto configuradas por el admin/dueño (Configuración → Cláusulas
  // por defecto): al elegir el tipo de documento en una operación NUEVA, se
  // preseleccionan automáticamente (filtradas por las que aplican a ese tipo).
  // Si ya se está editando una operación existente, no se tocan sus cláusulas.
  const set=useCallback(function(k,v){setData(function(d){
    var next=Object.assign({},d,{[k]:v});
    if(k==="tipo"){
      if(onTipoChange)onTipoChange(v);
      if(!initial && (!d.clausulas_ids||!d.clausulas_ids.length)){
        // Unión de: (a) predeterminadas que eligió el admin en Configuración → Plantillas,
        // y (b) obligatorias — estas últimas se incluyen siempre, aunque el admin no las
        // haya marcado también como predeterminadas, porque "obligatoria" es una garantía
        // más fuerte que "predeterminada" (ver StepClausulas: el broker no puede sacarlas).
        var defaultsIds=(perfil&&perfil.clausulas_default_ids)||[];
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
  // Al elegir "Refuerzo de Reserva" desde cero (no viene de convertirARefuerzo,
  // que ya trae parent_id), se ofrece elegir una reserva abierta reciente para
  // no volver a tipear todos los datos de las partes y el inmueble.
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
      if(step===7)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={true} onAddClausula={onAddClausula}/>;
    }
    if(esResAlq){
      if(step===1)return <StepTipo data={data} onChange={set} grupo="alquiler"/>;
      if(step===2)return <StepPersona data={data} onChange={set} prefix="locador" titulo="Locador (propietario)" faltantes={camposFaltantes}/>;
      if(step===3)return <StepPersona data={data} onChange={set} prefix="locatario" titulo="Locatario (inquilino)" faltantes={camposFaltantes}/>;
      if(step===4)return <StepInmueble data={data} onChange={set} faltantes={camposFaltantes}/>;
      if(step===5)return <StepCondicionesReservaAlq data={data} onChange={set} equipo={equipo} faltantes={camposFaltantes}/>;
      if(step===6)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={true} onAddClausula={onAddClausula}/>;
    }
    if(esDocSimple){
      var grupoReal=grupo||"otros";
      if(step===1)return <StepTipo data={data} onChange={set} grupo={grupoReal} operaciones={operaciones} onSelectReservaRefuerzo={elegirReservaParaRefuerzo}/>;
      if(step===2)return <StepPersona data={data} onChange={set} prefix="comprador" titulo={data.tipo==="comodato"?"Comodatario (recibe el bien)":data.tipo==="exclusividad"?"Interesado / Inmobiliaria":data.tipo==="refuerzo_reserva"||data.tipo==="devolucion_reserva"?"Comprador":"Parte solicitante"} faltantes={camposFaltantes}/>;
      if(step===3)return <StepPersona data={data} onChange={set} prefix="vendedor" titulo={data.tipo==="comodato"?"Comodante (propietario)":data.tipo==="exclusividad"?"Propietario":data.tipo==="refuerzo_reserva"||data.tipo==="devolucion_reserva"?"Vendedor":"Propietario / Contraparte"} faltantes={camposFaltantes}/>;
      if(step===4)return <StepDocSimple data={data} onChange={set}/>;
      if(step===5)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={false} onAddClausula={onAddClausula}/>;
      return null;
    }
    // Compra normal (reserva / boleto)
    if(step===1)return <StepTipo data={data} onChange={set} grupo="compra"/>;
    if(step===2)return <StepPersona data={data} onChange={set} prefix="comprador" titulo="Comprador" faltantes={camposFaltantes}/>;
    if(step===3)return <StepPersona data={data} onChange={set} prefix="vendedor" titulo="Vendedor" faltantes={camposFaltantes}/>;
    if(step===4)return <StepInmueble data={data} onChange={set} faltantes={camposFaltantes}/>;
    if(step===5)return <StepEconomicoCompra data={data} onChange={set} equipo={equipo} faltantes={camposFaltantes}/>;
    if(step===6)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={false} onAddClausula={onAddClausula}/>;
    return null;
  }
  var pct=Math.min(100,Math.round((step/total)*100));
  function handleFinalizarAccion(accion){
    var toGuardar = accion==="borrador" ? Object.assign({},data,{estado:"borrador"}) : data;
    onSave(toGuardar, accion);
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
        {step<total?<Btn onClick={function(){setStep(function(s){return s+1;});}}>Siguiente →</Btn>:<Btn v="success" onClick={function(){setStep(total+1);}}>Revisar y finalizar →</Btn>}
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
    var moneda = op.alquiler_moneda||op.res_alq_moneda||"ARS";
    return monto ? fmt$(monto,moneda)+"/mes" : null;
  }
  if(op.precio) return fmt$(op.precio, op.moneda);
  return null;
}
function PasoResumenFinal({data,clausulas,onVolver,onFinalizarAccion}){
  var partes=getResumenPartes(data);
  var monto=getResumenMonto(data);
  var faltantes=getCamposFaltantesDetalle(data);
  var clausulasSel=(data.clausulas_ids||[]).map(function(id){return clausulas.find(function(c){return c.id===id;});}).filter(Boolean);
  var [showMenu,setShowMenu]=useState(false);
  function Fila(props){return <div style={{display:"flex",justifyContent:"space-between",gap:10,padding:"6px 0",borderBottom:"1px solid var(--border2)",fontSize:12.5}}><span style={{color:"var(--dim)"}}>{props.k}</span><span style={{color:"var(--text)",fontWeight:500,textAlign:"right"}}>{props.v||"—"}</span></div>;}
  function Tarjeta(props){return <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:12,padding:"12px 14px",marginBottom:10}}><div style={{fontSize:10.5,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{props.t}</div>{props.children}</div>;}
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
        {(data.comision_vendedor||data.comision_comprador)&&<Fila k="Comisión" v={(data.comision_vendedor?"Vendedor "+data.comision_vendedor+"%":"")+((data.comision_vendedor&&data.comision_comprador)?" · ":"")+(data.comision_comprador?"Comprador "+data.comision_comprador+"%":"")}/>}
      </Tarjeta>
      <Tarjeta t={"Cláusulas ("+(clausulasSel.length+(data.clausulas_custom?1:0))+")"}>
        {clausulasSel.length===0&&!data.clausulas_custom&&<div style={{fontSize:12,color:"var(--dim)"}}>Sin cláusulas seleccionadas.</div>}
        {clausulasSel.map(function(c){return <Fila key={c.id} k={c.titulo} v="✓"/>;})}
        {data.clausulas_custom&&<Fila k={data.clausulas_custom_titulo||"Cláusula adicional"} v="✓"/>}
      </Tarjeta>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:16,borderTop:"1px solid var(--border)",marginTop:6}}>
        <Btn v="ghost" onClick={onVolver}>← Volver a editar</Btn>
        <Btn v="success" onClick={function(){setShowMenu(true);}}>Finalizar ✓</Btn>
      </div>
      <Modal open={showMenu} onClose={function(){setShowMenu(false);}} title="¿Qué querés hacer?">
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <Btn onClick={function(){setShowMenu(false);onFinalizarAccion("pdf");}} className="w-full">📄 Descargar PDF / Word</Btn>
          <Btn v="secondary" onClick={function(){setShowMenu(false);onFinalizarAccion("whatsapp");}} className="w-full">💬 Enviar por WhatsApp</Btn>
          <Btn v="secondary" onClick={function(){setShowMenu(false);onFinalizarAccion("borrador");}} className="w-full">💾 Guardar como borrador</Btn>
          <div style={{fontSize:10.5,color:"var(--dim)",marginTop:2,lineHeight:1.5}}>La operación se guarda en los tres casos. "Descargar" te lleva directo al documento para elegir PDF o Word; "WhatsApp" abre el panel para compartir con el archivo ya adjunto.</div>
        </div>
      </Modal>
    </div>
  );
}
function DocSummaryPanel({op, perfil, tabsDocs, onLeer, operaciones, onToggleTarea}){
  var partes = getResumenPartes(op);
  var monto = getResumenMonto(op);
  var faltantes = getCamposFaltantes(op);
  var completo = faltantes.length===0;
  var estadoBadgeCls={borrador:"badge-borrador",activo:"badge-activo",cerrado:"badge-cerrado"};
  var timeline = getLineaDeTiempo(op, operaciones||[]);
  var tareas = getTareasDeOp(op);
  var tareasDone = op.tareas_done||{};
  var tareasHechas = tareas.filter(function(t){return tareasDone[t[0]];}).length;
  var hoy = new Date().toISOString().slice(0,10);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <span className={"badge "+(estadoBadgeCls[op.estado]||"badge-activo")}>{ESTADOS[op.estado]||op.estado}</span>
        <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]}</span>
      </div>
      <div className="card" style={{padding:16,marginBottom:12}}>
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
      <div className="card" style={{padding:16,marginBottom:12}}>
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
      <div className="card" style={{padding:16,marginBottom:12,border:"1px solid "+(completo?"rgba(74,222,128,0.25)":"rgba(212,168,83,0.3)")}}>
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

      {/* Centro de tareas: checklist operativo de gestión, independiente del
          contenido legal del documento. Se guarda por operación. */}
      <div className="card" style={{padding:16,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Centro de tareas</div>
          <span style={{fontSize:11,color:tareasHechas===tareas.length?"var(--green)":"var(--dim)",fontWeight:600}}>{tareasHechas}/{tareas.length}</span>
        </div>
        <div style={{height:4,borderRadius:2,background:"var(--border)",overflow:"hidden",marginBottom:12}}>
          <div style={{height:"100%",width:(tareas.length?(tareasHechas/tareas.length*100):0)+"%",background:tareasHechas===tareas.length?"var(--green)":"var(--gold)",transition:"width 0.2s"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {tareas.map(function(t){
            var hecha = !!tareasDone[t[0]];
            return (
              <div key={t[0]} onClick={function(){onToggleTarea&&onToggleTarea(op.id,t[0]);}}
                style={{display:"flex",alignItems:"center",gap:10,padding:"7px 4px",cursor:onToggleTarea?"pointer":"default",borderRadius:8}}>
                <div style={{width:18,height:18,borderRadius:5,border:"1.5px solid "+(hecha?"var(--green)":"var(--border2)"),background:hecha?"var(--green)":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {hecha&&<span style={{color:"#0a0a0a",fontSize:11,fontWeight:700,lineHeight:1}}>✓</span>}
                </div>
                <span style={{fontSize:13,color:hecha?"var(--dim)":"var(--text)",textDecoration:hecha?"line-through":"none"}}>{t[1]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Línea de tiempo: hitos derivados de datos que ya existen (sin log
          de auditoría aparte) — creación, documentos vinculados y la fecha
          clave del tipo de documento (posesión / inicio / vencimiento). */}
      {timeline.length>0&&(
        <div className="card" style={{padding:16,marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Línea de tiempo</div>
          <div style={{display:"flex",flexDirection:"column"}}>
            {timeline.map(function(e,i){
              var esFutura = e.fecha>hoy;
              return (
                <div key={i} style={{display:"flex",gap:10}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:esFutura?"var(--gold)":"var(--green)",marginTop:4}}/>
                    {i<timeline.length-1&&<div style={{width:1.5,flex:1,background:"var(--border)",minHeight:24}}/>}
                  </div>
                  <div style={{paddingBottom:i<timeline.length-1?16:0,flex:1,minWidth:0}}>
                    <div style={{fontSize:11,color:"var(--dim)",marginBottom:2}}>{new Date(e.fecha).toLocaleDateString("es-AR")}</div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{e.icon} {e.titulo}</div>
                    {e.detalle&&<div style={{fontSize:11.5,color:"var(--dim)",marginTop:2}}>{e.detalle}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {tabsDocs.filter(function(t){return !t.esRecibo;}).length>0 && (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {tabsDocs.filter(function(t){return !t.esRecibo;}).map(function(t){
              return (
                <Btn key={t.id} v="primary" onClick={function(){onLeer(t.id);}} className="w-full">
                  {t.icon} Leer {t.label} →
                </Btn>
              );
            })}
          </div>
        )}
        {tabsDocs.some(function(t){return t.esRecibo;}) && (
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Recibos de honorarios</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {tabsDocs.filter(function(t){return t.esRecibo;}).map(function(t){
                var rol = t.label.replace(/^Recibo\s+/i,"");
                return (
                  <button key={t.id} onClick={function(){onLeer(t.id);}}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 10px",borderRadius:10,cursor:"pointer",
                      border:"1px solid rgba(74,222,128,0.25)",background:"rgba(74,222,128,0.06)",color:"var(--green)",fontSize:12.5,fontWeight:600,fontFamily:"DM Sans,sans-serif"}}>
                    🧾 {rol}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Arma la lista de pestañas disponibles para una operación: Resumen +
// documento principal (los recibos de honorarios no se muestran en la barra,
// se acceden desde el panel Resumen). Se usa tanto en el header del modal
// (para dibujar los botones) como dentro de DocumentViewer (para resolver
// qué documento generar).
function getDocTabs(op){
  var tiposDoc=[op.tipo];
  var tieneRecibos=op.tipo==="boleto"||op.tipo==="alquiler";
  var TABS=tiposDoc.map(function(t){return {id:t,label:TIPOS[t],icon:TIPO_ICON[t],esRecibo:false};});
  if(tieneRecibos){
    var rolP1=op.tipo==="alquiler"?"Locador":"Vendedor";
    var rolP2=op.tipo==="alquiler"?"Locatario":"Comprador";
    TABS.push({id:"recibo_p1",label:"Recibo "+rolP1,icon:"🧾",esRecibo:true,dest:"parte1"});
    TABS.push({id:"recibo_p2",label:"Recibo "+rolP2,icon:"🧾",esRecibo:true,dest:"parte2"});
  }
  var TAB_RESUMEN={id:"resumen",label:"Resumen",icon:"📋",esResumen:true};
  var TABS_ALL=[TAB_RESUMEN].concat(TABS);
  var TABS_BARRA=[TAB_RESUMEN].concat(TABS.filter(function(t){return !t.esRecibo;}));
  return {TABS:TABS,TAB_RESUMEN:TAB_RESUMEN,TABS_ALL:TABS_ALL,TABS_BARRA:TABS_BARRA};
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
              border:"1px solid "+(active?(isResumen?"rgba(96,165,250,0.5)":"var(--gold)"):(isResumen?"rgba(96,165,250,0.2)":"var(--border2)")),
              background:active?(isResumen?"rgba(96,165,250,0.12)":"rgba(212,168,83,0.1)"):(isResumen?"rgba(96,165,250,0.05)":"transparent"),
              color:active?(isResumen?"#60a5fa":"var(--gold)"):(isResumen?"rgba(96,165,250,0.7)":"var(--muted)"),
              fontWeight:active?600:400,
            }}>
            {t.icon} {t.label}
          </button>
        );
      })}
    </div>
  );
}

function DocumentViewer({op,clausulas,perfil,operaciones,onToggleTarea,tab,onChangeTab,autoAction,onAutoActionDone}){
  var docTabs=getDocTabs(op);
  var TABS=docTabs.TABS, TAB_RESUMEN=docTabs.TAB_RESUMEN, TABS_ALL=docTabs.TABS_ALL;

  function setTab(id){ onChangeTab(id); }
  const [busy,setBusy]=useState({pdf:false,docx:false,share:false});
  const [err,setErr]=useState("");
  const [lastAction,setLastAction]=useState(null); // "pdf" | "docx" | "share"
  const [lastPdf,setLastPdf]=useState(null); // {blob, filename}
  const [lastDocx,setLastDocx]=useState(null); // {blob, filename}
  const [pendingWarnings,setPendingWarnings]=useState(null); // {list, fn} | null
  const autoActionFiredRef=useRef(false);

  function changeTab(id){ setTab(id); setLastPdf(null); setLastDocx(null); setErr(""); }

  var tabActual = TABS_ALL.find(function(t){return t.id===tab;})||TAB_RESUMEN;

  function getDoc(){
    if(tabActual.esRecibo) return buildReciboSections(opParaDocumento(op), perfil, tabActual.dest);
    return aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(op), clausulas, tab), op, tab, perfil);
  }

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
    if(tabActual.esResumen) return;
    var cancelado=false;
    generarPDF(getDoc(), perfil.logoDataUrl||null, perfil).then(function(r){ if(!cancelado) setLastPdf(r); }).catch(function(){});
    generarDOCX(getDoc(), perfil).then(function(r){ if(!cancelado) setLastDocx(r); }).catch(function(){});
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
      if(entrega==="downloaded"){
        alert("Tu navegador no permite compartir archivos directamente. El PDF se descargó — podés adjuntarlo por WhatsApp Web, email, Drive, etc.");
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
    b.push({t:doc.titulo,bold:true,size:13.5});
    if(doc.subtitulo) b.push({t:doc.subtitulo,dim:true,size:10.5});
    if(doc.nroRecibo) b.push({t:"N° "+doc.nroRecibo,bold:true});
    b.push({blank:true});
    b.push({t:"Lugar: "+doc.ciudad+"  |  Fecha: "+doc.fecha,dim:true});
    b.push({blank:true});
    if(doc.encabezado){ doc.encabezado.split("\n\n").forEach(function(p){ b.push({t:p,justify:true}); b.push({blank:true}); }); }
    if(!doc.ocultarPartesEnCuerpo && doc.partes && doc.partes.length){
      b.push({t:"PARTES INTERVINIENTES",bold:true,label:true});
      doc.partes.forEach(function(p){
        b.push({t:(p.rol||"").toUpperCase()+": "+(p.nombre||"—"),bold:true});
        if(p.dni) b.push({t:"DNI/CUIT: "+p.dni,dim:true,indent:true});
        if(p.domicilio) b.push({t:"Domicilio: "+p.domicilio,dim:true,indent:true});
        if(p.email) b.push({t:"Email: "+p.email,dim:true,indent:true});
        b.push({blank:true});
      });
    }
    (doc.secciones||[]).forEach(function(s){
      b.push({t:s.titulo,bold:true});
      (s.items||[]).forEach(function(i){ if(i) b.push({t:i,justify:true,indent:true}); });
      b.push({blank:true});
    });
    if(doc.clausulas&&doc.clausulas.length>0){
      doc.clausulas.forEach(function(c){
        b.push({t:c.num+(c.titulo?". "+c.titulo.toUpperCase():"."),bold:true});
        if(c.texto) b.push({t:c.texto,justify:true,indent:true});
        b.push({blank:true});
      });
    }
    if(doc.conformidad&&doc.conformidad.items&&doc.conformidad.items.length){
      b.push({sep:true});
      b.push({t:"PRESTA CONFORMIDAD",bold:true,label:true});
      doc.conformidad.items.forEach(function(t,i){ b.push({t:(i+1)+". "+t,justify:true}); });
      b.push({blank:true});
      b.push({t:(doc.conformidad.firmante||"")+(doc.conformidad.dni?" — "+doc.conformidad.dni:""),bold:true});
    }
    return b;
  }

  return(
    <div>
      {tabActual.esResumen ? (
        <DocSummaryPanel op={op} perfil={perfil} tabsDocs={TABS} onLeer={changeTab} operaciones={operaciones} onToggleTarea={onToggleTarea}/>
      ) : (
      <>
      {/* Preview */}
      <div className="pdf-preview" style={{marginBottom:14}}>
        <div className="pdf-chrome">
          <div className="pdf-dot" style={{background:"#ff5f57"}}/><div className="pdf-dot" style={{background:"#ffbd2e"}}/><div className="pdf-dot" style={{background:"#28c840"}}/>
          <span style={{fontSize:10.5,color:"var(--dim)",marginLeft:7}}>{tabActual.icon} {tabActual.label}</span>
          {tabActual.esRecibo&&<span style={{marginLeft:"auto",fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(74,222,128,0.1)",color:"var(--green)",border:"1px solid rgba(74,222,128,0.2)"}}>Recibo de honorarios</span>}
        </div>
        <div className="pdf-content pdf-content-lg">
          <div className="pdf-text">
            {previewBlocks().map(function(bl,i){
              if(bl.blank) return <div key={i} style={{height:9}}/>;
              if(bl.sep) return <div key={i} style={{borderTop:"1px solid #d1d5db",margin:"10px 0"}}/>;
              return (
                <div key={i} style={{
                  fontWeight:bl.bold?700:400,
                  fontSize:bl.size||undefined,
                  color:bl.dim?"#6b7280":"#1f2937",
                  textAlign:bl.justify?"justify":"left",
                  marginLeft:bl.indent?14:0,
                  marginBottom:bl.label?6:2,
                  letterSpacing:bl.label?"0.03em":"normal",
                }}>{bl.t}</div>
              );
            })}
          </div>
        </div>
      </div>

      {err&&<div style={{padding:"9px 12px",borderRadius:8,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",color:"var(--red)",fontSize:12.5,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <span>{err}</span>
        {lastAction&&<button onClick={function(){
          if(lastAction==="pdf")handlePDF();
          else if(lastAction==="docx")handleDOCX();
          else if(lastAction==="share")handleShareWhatsApp();
        }} style={{flexShrink:0,padding:"4px 10px",borderRadius:6,border:"1px solid rgba(248,113,113,0.35)",background:"rgba(248,113,113,0.12)",color:"var(--red)",fontSize:11.5,fontWeight:600,cursor:"pointer"}}>↻ Reintentar</button>}
      </div>}
      {!perfil.nombre&&<div className="notice notice-amber" style={{marginBottom:12}}>Tip: configurá el perfil para agregar logo y nombre en los documentos.</div>}

      {/* Export buttons */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Btn onClick={function(){conValidacion(handlePDF);}} disabled={busy.pdf} v="primary">
          {busy.pdf?"Generando...":"📄 Descargar PDF"}
        </Btn>
        <Btn onClick={function(){conValidacion(handleDOCX);}} disabled={busy.docx} v="secondary">
          {busy.docx?"Generando...":"📝 Descargar DOCX"}
        </Btn>
      </div>
      <div style={{fontSize:10.5,color:"var(--dim)",marginTop:7,lineHeight:1.5}}>
        Guarda el archivo directamente en el teléfono o la computadora (carpeta "Descargas"), sin abrir ningún panel para compartir.
      </div>

      {/* Compartir */}
      <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:9}}>Compartir documento</div>
        <Btn v="secondary" onClick={function(){conValidacion(handleShareWhatsApp);}} disabled={busy.share} className="w-full">
          {busy.share?"Preparando...":"📤 Compartir documento (PDF)"}
        </Btn>
        <div style={{fontSize:10.5,color:"var(--dim)",marginTop:7,lineHeight:1.5}}>
          En el celular abre el panel para compartir nativo del teléfono: elegís WhatsApp, Mail, Drive, AirDrop o cualquier app instalada, y se adjunta el PDF ya terminado — sin edición compartida, cada colega recibe su propia copia. En la computadora se descarga el PDF para adjuntarlo donde quieras.
        </div>
      </div>
      </>
      )}

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
        <Inp label="Email" value={local.email||""} onChange={f("email")} placeholder="info@inmobiliaria.com" className="col2"/>
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

function parseClauseJson(text){
  var clean=text.replace(/```json|```/g,"").trim();
  try{
    var obj=JSON.parse(clean);
    if(obj&&obj.titulo&&obj.contenido){
      var cats=["general","posesion","pago","rescision","impuestos","alquiler"];
      if(!cats.includes(obj.categoria)) obj.categoria="general";
      return obj;
    }
  }catch(e){}
  return null;
}

// Llama a Claude para narrar una cláusula a partir de una idea breve del usuario.
// Devuelve {titulo, categoria, contenido} o null si no pudo interpretar la respuesta.
async function narrarClausulaIA(ideaBreve){
  var res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-6",
      max_tokens:700,
      system: CLAUSULA_IA_SYSTEM,
      messages:[{role:"user",content:ideaBreve}],
    }),
  });
  var data=await res.json();
  var text=data.content&&data.content[0]?data.content[0].text:"";
  return parseClauseJson(text);
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

function BotIA({onClose,operaciones,clausulas,onAddClausula}){
  const [msgs,setMsgs]=useState([{role:"assistant",content:"¡Hola! Soy tu asistente legal de DocWorks. Puedo revisar una operación cargada y avisarte si falta algo, leer un contrato que adjuntes (PDF, imagen o .txt) y sugerir correcciones, o redactar una cláusula nueva para tu biblioteca. ¿En qué te ayudo?"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [attachment,setAttachment]=useState(null); // {name, kind:"pdf"|"image"|"text", mediaType, data}
  const [attError,setAttError]=useState("");
  const [showOpPicker,setShowOpPicker]=useState(false);
  const [modoClausula,setModoClausula]=useState(false);
  const bottomRef=useRef();
  const fileRef=useRef();

  useEffect(function(){if(bottomRef.current)bottomRef.current.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  async function callClaude(newMsgs, systemExtra){
    var res=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-6",
        max_tokens:1300,
        system: BOTIA_SYSTEM + (systemExtra||""),
        messages:newMsgs.map(function(m){return {role:m.role,content:(m.apiContent!==undefined?m.apiContent:m.content)};}),
      }),
    });
    var data=await res.json();
    return data.content&&data.content[0]?data.content[0].text:"No pude procesar la respuesta.";
  }

  async function enviar(display, apiContentOverride, opts){
    if(loading) return;
    var userMsg={role:"user",content:display};
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
      var reply=await callClaude(newMsgs, enModoClausula?BOTIA_CLAUSULA_SYSTEM:"");
      var draft = enModoClausula ? parseClauseJson(reply) : null;
      setMsgs(function(m){return m.concat([{role:"assistant",content:reply,clauseDraft:draft||undefined}]);});
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
    try{ doc=buildDocSections(opParaDocumento(op), clausulas||[], op.tipo); docTexto=docToPlainText(doc); }catch(e){ docTexto="(No se pudo generar el texto del documento.)"; }
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
      setAttError(err.message||"No se pudo leer el archivo.");
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
        <span>🔒 Cláusula obligatoria — el broker no podrá quitarla de ninguna operación de este tipo (se incluye siempre, tilde o no la casilla "Incluir por defecto").</span>
      </label>
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <label className="field-label" style={{margin:0}}>Texto</label>
          <VariablePicker taRef={taRef} value={form.contenido} onChange={function(v){setForm(function(f){return Object.assign({},f,{contenido:v});});}}/>
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
        <Btn s="sm" onClick={generar} disabled={!idea.trim()||loading}>{loading?"Narrando…":"✦ Narrar"}</Btn>
      </div>
      {error&&<div style={{fontSize:11,color:"var(--red)",marginTop:6}}>{error}</div>}
    </div>
  );
}

function ClausulasView({clausulas,onAdd,onEdit,onDelete,puedeEditar,rolLabel}){
  const [form,setForm]=useState(FORM_CLAUSULA_EMPTY);
  const [editId,setEditId]=useState(null);
  const [filtroTexto,setFiltroTexto]=useState("");
  const [filtroCategoria,setFiltroCategoria]=useState("todas");
  const [soloPersonalizadas,setSoloPersonalizadas]=useState(false);
  var editable = puedeEditar!==false;
  function submit(){if(!editable)return;if(!form.titulo||!form.contenido)return;if(editId){onEdit(editId,form);}else{onAdd(Object.assign({},form,{id:genId()}));}setForm(FORM_CLAUSULA_EMPTY);setEditId(null);}
  function aplicarBorrador(draft){
    setEditId(null);
    setForm({titulo:draft.titulo,categoria:draft.categoria||"general",contenido:draft.contenido,tipos:["todos"]});
  }
  var esPersonalizada=function(c){return !CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;});};
  var filtradas=clausulas.filter(function(c){
    if(soloPersonalizadas&&!esPersonalizada(c))return false;
    if(filtroCategoria!=="todas"&&c.categoria!==filtroCategoria)return false;
    if(filtroTexto.trim()){
      var q=filtroTexto.trim().toLowerCase();
      if((c.titulo||"").toLowerCase().indexOf(q)===-1&&(c.contenido||"").toLowerCase().indexOf(q)===-1)return false;
    }
    return true;
  });
  return(
    <div>
      <div className="section-header">
        <div><div className="section-title">Biblioteca de Cláusulas</div><div className="section-sub">Creá y reutilizá cláusulas en tus documentos — vinculá datos como el propietario, el inquilino o el inmueble con el menú «Vincular dato»</div></div>
      </div>
      {!editable&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",marginBottom:16,fontSize:12.5,color:"var(--amber)"}}>
          <span>🔒</span>
          <span>Las plantillas solo pueden editarlas el Dueño o un Administrador. Tu rol actual es «{rolLabel||"—"}» — podés consultarlas pero no modificarlas.</span>
        </div>
      )}
      <div className="two-col-layout">
        {editable&&(
          <div className="card" style={{padding:18,alignSelf:"flex-start"}}>
            <p style={{fontFamily:"DM Serif Display,serif",fontSize:15,color:"var(--text)",marginBottom:14}}>{editId?"Editar cláusula":"Nueva cláusula"}</p>
            <ClausulaFormBody form={form} setForm={setForm} editId={editId} onSubmit={submit} onCancel={function(){setEditId(null);setForm(FORM_CLAUSULA_EMPTY);}}/>
            <ClausulaIAComposer onDraft={aplicarBorrador}/>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
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
          <div style={{fontSize:10.5,color:"var(--dim)"}}>{filtradas.length} de {clausulas.length} cláusula{clausulas.length===1?"":"s"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {clausulas.length===0&&<div style={{padding:28,textAlign:"center",color:"var(--dim)",fontSize:13}}>No hay cláusulas guardadas.</div>}
            {clausulas.length>0&&filtradas.length===0&&<div style={{padding:28,textAlign:"center",color:"var(--dim)",fontSize:13}}>Ninguna cláusula coincide con el filtro.</div>}
            {filtradas.map(function(c){
              var esTodos=!c.tipos||!c.tipos.length||c.tipos.indexOf("todos")!==-1;
              return(
                <div key={c.id} className="op-card" style={{cursor:"default"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{c.titulo}</span>
                        <span className={"badge "+(c.categoria==="alquiler"?"badge-tipo":"badge-gold")} style={{textTransform:"capitalize"}}>{c.categoria}</span>
                        {esPersonalizada(c)&&<span className="badge badge-activo">Personalizada</span>}
                      </div>
                      <div style={{fontSize:10.5,color:"var(--dim)",marginBottom:4}}>{esTodos?"Todos los documentos":c.tipos.map(function(t){return TIPOS[t]||t;}).join(", ")}</div>
                      <p style={{fontSize:11.5,color:"var(--dim)",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.contenido}</p>
                    </div>
                    {editable&&(
                      <div style={{display:"flex",gap:3,flexShrink:0}}>
                        <button onClick={function(){setEditId(c.id);setForm({titulo:c.titulo,categoria:c.categoria,contenido:c.contenido,tipos:c.tipos||["todos"]});}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:12}}>✏</button>
                        <button onClick={function(){onDelete(c.id);}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(248,113,113,0.05)",border:"1px solid rgba(248,113,113,0.15)",color:"var(--red)",cursor:"pointer",fontSize:12}}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
            return <button key={i} className={"dropdown-item "+(item.red?"red":"")} onClick={function(){setOpen(false);item.onClick();}}>{item.label}</button>;
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
  var [filtro,setFiltro]=useState("todos"); // todos | vencimiento | renovacion | reserva | refuerzo

  // Construir eventos desde operaciones
  var eventos=[];
  operaciones.forEach(function(op){
    var nombre=op.tipo==="alquiler"||op.tipo==="reserva_alquiler"
      ?(op.locatario_nombre||"Locatario")+" ← "+(op.locador_nombre||"Locador")
      :(op.comprador_nombre||"Comprador")+" ← "+(op.vendedor_nombre||"Vendedor");

    // Vencimiento contrato alquiler
    if(op.tipo==="alquiler"&&op.alquiler_fin){
      var fin=new Date(op.alquiler_fin);
      var diasRestantes=Math.ceil((fin-now)/(1000*60*60*24));
      eventos.push({
        id:op.id+"_fin", tipo:"vencimiento", fecha:op.alquiler_fin,
        titulo:"Vencimiento contrato", nombre:nombre,
        direccion:op.inmueble_direccion||"", diasRestantes:diasRestantes,
        urgente:diasRestantes<=60&&diasRestantes>=0, op:op,
        color:diasRestantes<0?"#64748b":diasRestantes<=30?"#ef4444":diasRestantes<=60?"#f97316":"#2dd4bf",
      });
      // Alerta 90 días antes
      var alertaFecha=new Date(fin);alertaFecha.setDate(alertaFecha.getDate()-90);
      if(alertaFecha>=now){
        eventos.push({
          id:op.id+"_alerta", tipo:"renovacion", fecha:alertaFecha.toISOString().slice(0,10),
          titulo:"⚠ Renovación en 90 días", nombre:nombre,
          direccion:op.inmueble_direccion||"", diasRestantes:diasRestantes,
          urgente:false, op:op, color:"#d4a853",
        });
      }
    }
    // Vencimiento reserva de compra (posesión / escrituración)
    if(op.tipo==="reserva"&&op.fecha_posesion){
      var dias=Math.ceil((new Date(op.fecha_posesion)-now)/(1000*60*60*24));
      eventos.push({
        id:op.id+"_res", tipo:"reserva", fecha:op.fecha_posesion,
        titulo:"Posesión / Escritura", nombre:nombre,
        direccion:op.inmueble_direccion||"", diasRestantes:dias,
        urgente:dias<=15&&dias>=0, op:op,
        color:dias<0?"#64748b":dias<=15?"#ef4444":dias<=30?"#f97316":"#60a5fa",
      });
    }
    // Recordatorio: tomar refuerzo de una reserva (compra) que aún no tiene refuerzo cargado
    if(op.tipo==="reserva"&&op.reserva_fecha_refuerzo){
      var yaTieneRefuerzo=operaciones.some(function(h){return h.parent_id===op.id&&h.tipo==="refuerzo_reserva";});
      if(!yaTieneRefuerzo){
        var diasRef=Math.ceil((new Date(op.reserva_fecha_refuerzo)-now)/(1000*60*60*24));
        eventos.push({
          id:op.id+"_refuerzo", tipo:"refuerzo", fecha:op.reserva_fecha_refuerzo,
          titulo:"📌 Tomar refuerzo de reserva", nombre:nombre,
          direccion:op.inmueble_direccion||"", diasRestantes:diasRef,
          urgente:diasRef<=7&&diasRef>=0, op:op,
          color:diasRef<0?"#64748b":diasRef<=7?"#ef4444":diasRef<=15?"#f97316":"#a78bfa",
        });
      }
    }
    // Vencimiento de una reserva de alquiler (vigencia de la seña / plazo para firmar contrato)
    if(op.tipo==="reserva_alquiler"){
      var baseFecha=op.created_at?new Date(op.created_at):null;
      if(baseFecha){
        var diasAceptVenc=parseInt(op.res_alq_aceptacion_dias,10)||2;
        var diasVigVenc=parseInt(op.res_alq_vigencia_dias,10)||10;
        var vencReserva=new Date(baseFecha);
        vencReserva.setDate(vencReserva.getDate()+diasAceptVenc+diasVigVenc);
        var yaTieneContrato=operaciones.some(function(h){return h.parent_id===op.id&&h.tipo==="alquiler";});
        if(!yaTieneContrato){
          var diasVR=Math.ceil((vencReserva-now)/(1000*60*60*24));
          eventos.push({
            id:op.id+"_vencres", tipo:"vencimiento", fecha:vencReserva.toISOString().slice(0,10),
            titulo:"Vencimiento de la reserva", nombre:nombre,
            direccion:op.inmueble_direccion||"", diasRestantes:diasVR,
            urgente:diasVR<=5&&diasVR>=0, op:op,
            color:diasVR<0?"#64748b":diasVR<=5?"#ef4444":diasVR<=10?"#f97316":"#fb923c",
          });
        }
      }
    }
    // Inicio estimado del contrato de alquiler (a partir de una reserva de alquiler)
    if(op.tipo==="reserva_alquiler"&&op.res_alq_inicio_estimado){
      var dias2=Math.ceil((new Date(op.res_alq_inicio_estimado)-now)/(1000*60*60*24));
      eventos.push({
        id:op.id+"_resalq", tipo:"reserva", fecha:op.res_alq_inicio_estimado,
        titulo:"Inicio estimado alquiler", nombre:nombre,
        direccion:op.inmueble_direccion||"", diasRestantes:dias2,
        urgente:dias2<=7&&dias2>=0, op:op, color:"#fb923c",
      });
    }
  });

  // Filtrar
  var eventosFiltrados=eventos.filter(function(e){
    if(filtro==="todos")return true;
    return e.tipo===filtro;
  }).sort(function(a,b){return new Date(a.fecha)-new Date(b.fecha);});

  // Calendario mensual
  var mesVer=new Date(now.getFullYear(),now.getMonth()+mesOffset,1);
  var diasEnMes=new Date(mesVer.getFullYear(),mesVer.getMonth()+1,0).getDate();
  var primerDia=mesVer.getDay()||7; // Lunes=1
  var celdas=[];
  for(var i=1;i<primerDia;i++)celdas.push(null);
  for(var d=1;d<=diasEnMes;d++)celdas.push(d);

  function getEventosDia(dia){
    var fechaStr=mesVer.getFullYear()+"-"+String(mesVer.getMonth()+1).padStart(2,"0")+"-"+String(dia).padStart(2,"0");
    return eventosFiltrados.filter(function(e){return e.fecha===fechaStr;});
  }

  var urgentes=eventos.filter(function(e){return e.urgente;});
  var proximos=eventosFiltrados.filter(function(e){return e.diasRestantes>=0&&e.diasRestantes<=30;}).slice(0,5);

  return(
    <div>
      <div className="section-header">
        <div><div className="section-title">Calendario</div><div className="section-sub">Vencimientos y renovaciones</div></div>
      </div>

      {/* Alertas urgentes */}
      {urgentes.length>0&&(
        <div style={{marginBottom:16,padding:"12px 16px",borderRadius:12,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#ef4444",marginBottom:8}}>⚠ ALERTAS URGENTES ({urgentes.length})</div>
          {urgentes.map(function(e){
            return(
              <div key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(239,68,68,0.1)",cursor:"pointer"}}>
                <div>
                  <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{e.titulo}</span>
                  <span style={{fontSize:11,color:"var(--muted)",marginLeft:8}}>{e.nombre}</span>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:"#ef4444",flexShrink:0}}>{e.diasRestantes===0?"HOY":e.diasRestantes+"d"}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Próximos 30 días */}
      {proximos.length>0&&(
        <div style={{marginBottom:16,padding:"12px 16px",borderRadius:12,background:"rgba(212,168,83,0.06)",border:"1px solid rgba(212,168,83,0.2)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:8}}>📋 PRÓXIMOS 30 DÍAS</div>
          {proximos.map(function(e){
            return(
              <div key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(212,168,83,0.1)",cursor:"pointer"}}>
                <div style={{minWidth:0}}>
                  <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{e.titulo}</span>
                  <span style={{fontSize:11,color:"var(--muted)",marginLeft:8,overflow:"hidden",textOverflow:"ellipsis"}}>{e.nombre}</span>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:e.color,flexShrink:0,marginLeft:8}}>{e.diasRestantes===0?"Hoy":e.diasRestantes+"d"}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtros */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {[{v:"todos",l:"Todos"},{v:"vencimiento",l:"Vencimientos"},{v:"renovacion",l:"Renovaciones"},{v:"reserva",l:"Reservas"},{v:"refuerzo",l:"Refuerzos"}].map(function(f){
          return(
            <button key={f.v} onClick={function(){setFiltro(f.v);}} style={{padding:"5px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:filtro===f.v?"var(--gold)":"var(--border)",color:filtro===f.v?"#0a0f1a":"var(--muted)",transition:"all 0.15s"}}>{f.l}</button>
          );
        })}
      </div>

      {/* Calendario mensual */}
      <div className="card" style={{padding:18,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <button onClick={function(){setMesOffset(function(m){return m-1;});}} style={{width:32,height:32,borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <div style={{fontSize:15,fontWeight:700,color:"var(--text)",letterSpacing:"0.02em"}}>{mesVer.toLocaleString("es-AR",{month:"long",year:"numeric"}).toUpperCase()}</div>
          <button onClick={function(){setMesOffset(function(m){return m+1;});}} style={{width:32,height:32,borderRadius:9,border:"1px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(function(d){
            return <div key={d} style={{textAlign:"center",fontSize:10.5,fontWeight:700,color:"var(--muted)",padding:"4px 0",letterSpacing:"0.05em"}}>{d}</div>;
          })}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {celdas.map(function(dia,i){
            if(!dia)return <div key={"empty-"+i}/>;
            var evs=getEventosDia(dia);
            var isHoy=new Date().getDate()===dia&&new Date().getMonth()===mesVer.getMonth()&&new Date().getFullYear()===mesVer.getFullYear();
            return(
              <div key={dia} style={{
                minHeight:52,padding:"5px 5px 4px",borderRadius:10,
                background:isHoy?"rgba(212,168,83,0.14)":"var(--surface)",
                border:isHoy?"1.5px solid var(--gold)":evs.length?"1px solid var(--border2)":"1px solid var(--border)",
                boxShadow:evs.length&&!isHoy?"inset 3px 0 0 "+evs[0].color:"none",
                transition:"all 0.12s",
              }}>
                <div style={{fontSize:11.5,fontWeight:isHoy?700:600,color:isHoy?"var(--gold)":"var(--text)",textAlign:"right",marginBottom:3}}>{dia}</div>
                {evs.slice(0,2).map(function(e){
                  return <div key={e.id} style={{fontSize:9,padding:"2px 4px",borderRadius:4,background:e.color,color:"white",fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.titulo}</div>;
                })}
                {evs.length>2&&<div style={{fontSize:9,color:"var(--muted)",fontWeight:600,paddingLeft:2}}>+{evs.length-2} más</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista completa */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",fontSize:13,fontWeight:600,color:"var(--text)"}}>
          Todos los eventos ({eventosFiltrados.length})
        </div>
        <div style={{maxHeight:400,overflowY:"auto"}}>
          {eventosFiltrados.length===0&&<div style={{padding:24,textAlign:"center",fontSize:13,color:"var(--dim)"}}>No hay eventos que coincidan con el filtro.</div>}
          {eventosFiltrados.map(function(e){
            return(
              <div key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid var(--border)",cursor:"pointer",transition:"background 0.1s"}}
                onMouseOver={function(ev){ev.currentTarget.style.background="rgba(255,255,255,0.03)";}}
                onMouseOut={function(ev){ev.currentTarget.style.background="transparent";}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:e.color,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{e.titulo}</div>
                  <div style={{fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.nombre}{e.direccion?" — "+e.direccion:""}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{new Date(e.fecha+"T12:00:00").toLocaleDateString("es-AR")}</div>
                  <div style={{fontSize:11,fontWeight:700,color:e.color}}>{e.diasRestantes<0?"Vencido hace "+Math.abs(e.diasRestantes)+"d":e.diasRestantes===0?"Hoy":"En "+e.diasRestantes+"d"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EstadisticasView({operaciones,equipo}){
  const [rechReady,setRechReady]=useState(!!window.Recharts);
  const [periodoTab,setPeriodoTab]=useState("mensual");
  const [anioSel,setAnioSel]=useState(new Date().getFullYear());
  useEffect(function(){if(!rechReady){loadRecharts().then(function(){setRechReady(true);});}});

  var total=operaciones.length;
  var now=new Date();

  // --- Mensual: últimos 12 meses ---
  var meses12=[];
  for(var i=11;i>=0;i--){
    var d=new Date(now.getFullYear(),now.getMonth()-i,1);
    var key=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
    var mes=d.toLocaleString("es-AR",{month:"short",year:"2-digit"});
    var ops=operaciones.filter(function(o){return (o.created_at||"").slice(0,7)===key;});
    meses12.push({name:mes,ops:ops.length,usd:ops.filter(function(o){return o.moneda==="USD"&&o.precio;}).reduce(function(s,o){return s+parseFloat(o.precio||0);},0)});
  }

  // --- Anual: por año ---
  var anios=[];
  var minAnio=Math.min.apply(null,operaciones.map(function(o){return parseInt((o.created_at||"9999").slice(0,4));}));
  if(!isFinite(minAnio))minAnio=now.getFullYear();
  for(var y=minAnio;y<=now.getFullYear();y++){
    var yops=operaciones.filter(function(o){return (o.created_at||"").slice(0,4)===String(y);});
    anios.push({name:String(y),ops:yops.length,usd:yops.filter(function(o){return o.moneda==="USD"&&o.precio;}).reduce(function(s,o){return s+parseFloat(o.precio||0);},0)});
  }

  // --- Por broker ---
  var brokers=(equipo||[]).map(function(m){
    var mops=operaciones.filter(function(o){return o.broker_id===m.id;});
    var mopsAnio=mops.filter(function(o){return (o.created_at||"").slice(0,4)===String(anioSel);});
    var mesActual=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0");
    var mopsMes=mops.filter(function(o){return (o.created_at||"").slice(0,7)===mesActual;});
    return {nombre:m.nombre,foto:m.fotoDataUrl,total:mops.length,anio:mopsAnio.length,mes:mopsMes.length,activas:mops.filter(function(o){return o.estado==="activo";}).length};
  }).filter(function(b){return b.total>0;}).sort(function(a,b){return b.total-a.total;});

  var usd=operaciones.filter(function(o){return o.moneda==="USD"&&o.precio;}).reduce(function(s,o){return s+parseFloat(o.precio||0);},0);
  var ars=operaciones.filter(function(o){return o.moneda==="ARS"&&o.precio;}).reduce(function(s,o){return s+parseFloat(o.precio||0);},0);
  var canon=operaciones.filter(function(o){return o.tipo==="alquiler"&&o.alquiler_monto_inicial;}).reduce(function(s,o){return s+parseFloat(o.alquiler_monto_inicial||0);},0);
  var porTipo=[
    {name:"Reserva",v:operaciones.filter(function(o){return o.tipo==="reserva";}).length,color:"#60a5fa"},
    {name:"Boleto",v:operaciones.filter(function(o){return o.tipo==="boleto";}).length,color:"#a78bfa"},
    {name:"Res. alq.",v:operaciones.filter(function(o){return o.tipo==="reserva_alquiler";}).length,color:"#fb923c"},
    {name:"Contrato",v:operaciones.filter(function(o){return o.tipo==="alquiler";}).length,color:"#2dd4bf"},
    {name:"Otros",v:operaciones.filter(function(o){return ["comodato","exclusividad","refuerzo_reserva","devolucion_reserva"].includes(o.tipo);}).length,color:"#f472b6"},
  ].filter(function(x){return x.v>0;});

  var chartData=periodoTab==="mensual"?meses12:anios;
  var aniosDisp=[];
  for(var ay=minAnio;ay<=now.getFullYear();ay++) aniosDisp.push(ay);

  return(
    <div>
      <div className="section-header">
        <div><div className="section-title">Estadísticas</div><div className="section-sub">Métricas y rendimiento del equipo</div></div>
      </div>

      {/* Resumen global */}
      <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{l:"Total ops.",v:total,i:"📁"},{l:"Activas",v:operaciones.filter(function(o){return o.estado==="activo";}).length,i:"🟢"},{l:"Alquileres",v:operaciones.filter(function(o){return o.tipo==="alquiler"||o.tipo==="reserva_alquiler";}).length,i:"🏠"},{l:"Compraventas",v:operaciones.filter(function(o){return o.tipo==="boleto"||o.tipo==="reserva";}).length,i:"📄"}].map(function(s){
          return <div key={s.l} className="stat-card"><div className="stat-icon">{s.i}</div><div className="stat-val">{s.v}</div><div className="stat-lbl">{s.l}</div></div>;
        })}
      </div>

      {/* Financiero */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
        {[{l:"Total USD",v:"U$D "+usd.toLocaleString("es-AR"),i:"💵"},{l:"Total ARS",v:"$ "+ars.toLocaleString("es-AR"),i:"💴"},{l:"Canon/mes",v:"$ "+canon.toLocaleString("es-AR"),i:"🏘"}].map(function(s){
          return <div key={s.l} className="card" style={{padding:18}}><div style={{fontSize:18,marginBottom:6}}>{s.i}</div><div style={{fontFamily:"DM Serif Display,serif",fontSize:18,color:"var(--teal)",lineHeight:1.2,marginBottom:3}}>{s.v}</div><div style={{fontSize:11,color:"var(--dim)"}}>{s.l}</div></div>;
        })}
      </div>

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
          <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:14}}>📊 Rendimiento por broker — {anioSel}</div>
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
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,textAlign:"center"}}>
                    {[{l:"Este mes",v:b.mes,c:"var(--gold)"},{l:"Este año",v:b.anio,c:"var(--teal)"},{l:"Total",v:b.total,c:"var(--muted)"}].map(function(s){
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
function DashboardView({operaciones,clausulas,perfil,onNew,onEdit,onDelete,onChangeEstado,onConvertir,onConvertirComodato,onConvertirRefuerzo,onConvertirBoleto,onDuplicar,onViewDoc,onPerfil,searchOverride,papelera,onRestore,onDeletePermanente,onVaciarPapelera,confirmVaciarPapelera,setConfirmVaciarPapelera,papeleraJump}){
  const [search,setSearch]=useState("");
  const [filtroTipo,setFiltroTipo]=useState("todos");
  // Por defecto se muestran solo las operaciones Activas (en vez de todas),
  // para que la pantalla de inicio no arranque saturada de borradores y cerradas.
  const [estadoTab,setEstadoTab]=useState("activo");
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
      var q=effectiveSearch.toLowerCase();
      matchSearch=grupoDe(op).some(function(o){return [o.comprador_nombre,o.vendedor_nombre,o.locador_nombre,o.locatario_nombre,o.inmueble_direccion,o.inmueble_partido].some(function(v){return v&&v.toLowerCase().includes(q);});});
    }
    if(filtroTipo!=="todos")matchTipo=grupoDe(op).some(function(o){return o.tipo===filtroTipo;});
    if(estadoTab!=="todas")matchEstado=grupoDe(op).some(function(o){return o.estado===estadoTab;});
    return matchSearch&&matchTipo&&matchEstado;
  });
  var total=operaciones.length,activas=operaciones.filter(function(o){return o.estado==="activo";}).length,alq=operaciones.filter(function(o){return o.tipo==="alquiler"||o.tipo==="reserva_alquiler";}).length,compras=operaciones.filter(function(o){return o.tipo==="boleto"||o.tipo==="reserva";}).length;
  var nuevasCount=operaciones.filter(function(o){return o.estado==="borrador";}).length;
  var cerradasCount=operaciones.filter(function(o){return o.estado==="cerrado";}).length;
  // Carpetas abiertas/cerradas (colapsadas por defecto para que la lista se
  // vea compacta cuando hay muchas operaciones con documentos vinculados).
  const [openFolders,setOpenFolders]=useState({});
  function getName(op){if(op.tipo==="alquiler"||op.tipo==="reserva_alquiler")return nombreConSufijo(op,"locatario","Locatario")+" ← "+nombreConSufijo(op,"locador","Locador");return nombreConSufijo(op,"comprador","Comprador")+" ← "+nombreConSufijo(op,"vendedor","Vendedor");}
  function getMonto(op){if(op.tipo==="alquiler")return op.alquiler_monto_inicial?fmt$(op.alquiler_monto_inicial,op.alquiler_moneda)+"/mes":null;if(op.tipo==="reserva_alquiler")return op.res_alq_monto_mensual?fmt$(op.res_alq_monto_mensual,op.res_alq_moneda)+"/mes est.":null;return op.precio?fmt$(op.precio,op.moneda):null;}
  function getTituloCarpeta(op){ return tipoInmuebleLabel(op.inmueble_tipo,op.inmueble_tipo_otro)+(op.inmueble_direccion?" — "+op.inmueble_direccion:"")+(op.inmueble_partido?" ("+op.inmueble_partido+")":""); }

  const [sharingId,setSharingId]=useState(null);
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
    try{
      var doc = aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(op), clausulas, defaultTabFor(op)), op, defaultTabFor(op), perfil);
      var result = await generarPDF(doc, perfil.logoDataUrl||null, perfil);
      var txt = TIPOS[op.tipo]+" — "+getName(op)+(op.inmueble_direccion?" — "+op.inmueble_direccion:"");
      var entrega = await entregarArchivo(result.blob, result.filename, "application/pdf", {title:TIPOS[op.tipo], text:txt});
      if(entrega==="downloaded"){
        alert("Tu navegador no permite compartir archivos directamente. El PDF se descargó — podés adjuntarlo por WhatsApp Web, email, Drive, etc.");
      }
    } catch(e){
      if(!(e && e.name==="AbortError")) alert(e.message||"No se pudo compartir el documento.");
    }
    setSharingId(null);
  }

  const ESTADO_TABS=[
    {id:"todas",label:"Todas",count:total},
    {id:"borrador",label:"Nuevas",count:nuevasCount},
    {id:"activo",label:"Activas",count:activas},
    {id:"cerrado",label:"Cerradas",count:cerradasCount},
    {id:"papelera",label:"🗑 Papelera",count:papelera.length},
  ];
  const enPapelera = estadoTab==="papelera";

  return(
    <div>
      <div className="section-header">
        <div><div className="section-title">Operaciones</div><div className="section-sub">Reservas, boletos, alquileres y contratos</div></div>
        {!enPapelera&&<Btn onClick={onNew} className="btn-nueva">+ Nueva operación</Btn>}
      </div>

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
              {t.label}
              <span style={{fontSize:11,padding:"1px 7px",borderRadius:20,background:estadoTab===t.id?"rgba(212,168,83,0.15)":"rgba(255,255,255,0.06)",color:estadoTab===t.id?"var(--gold)":"var(--dim)"}}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {enPapelera ? (
        <PapeleraView embedded={true} papelera={papelera} onRestore={onRestore} onDeletePermanente={onDeletePermanente} onVaciar={onVaciarPapelera} confirmVaciar={confirmVaciarPapelera} setConfirmVaciar={setConfirmVaciarPapelera}/>
      ) : (
      <>
      <div className="filter-row" style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
        <div className="search-wrap" style={{flex:1,minWidth:180}}>
          <span className="search-icon">🔍</span>
          <input className="search-inp" value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Buscar por nombre, dirección..."/>
        </div>
        <select className="inp" style={{width:"auto"}} value={filtroTipo} onChange={function(e){setFiltroTipo(e.target.value);}}>
          <option value="todos">Todos los tipos</option>
          {Object.entries(TIPOS).map(function(e){return <option key={e[0]} value={e[0]}>{e[1]}</option>;})}
        </select>
      </div>
      {!perfil.nombre&&<div className="notice notice-gold" style={{marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}><span>Configurá el perfil de tu inmobiliaria para agregar logo en los PDFs.</span><Btn v="ghost" s="sm" onClick={onPerfil} style={{color:"var(--gold)",flexShrink:0}}>⚙ Configurar</Btn></div>}
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {filtered.length===0&&<div style={{padding:44,textAlign:"center",background:"var(--card)",border:"1px solid var(--border)",borderRadius:14}}><div style={{fontSize:38,marginBottom:10}}>📂</div><p style={{color:"var(--dim)",fontSize:13}}>{effectiveSearch?"Sin resultados para esa búsqueda.":"No hay operaciones en esta vista."}</p></div>}
        {filtered.map(function(op){
          const hijos=childrenMap[op.id]||[];
          if(hijos.length===0) return renderOpRow(op,false);
          const isOpen=!!openFolders[op.id];
          return (
            <div key={op.id} className="op-folder" style={{border:"1px solid var(--border)",borderRadius:14,padding:10,background:"rgba(212,168,83,0.03)"}}>
              <div onClick={function(){setOpenFolders(function(s){return Object.assign({},s,{[op.id]:!s[op.id]});});}}
                style={{display:"flex",flexDirection:"column",gap:6,cursor:"pointer",marginBottom:isOpen?8:0}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:7}}>
                  <span style={{fontSize:11,color:"var(--dim)",display:"inline-block",flexShrink:0,marginTop:2,transition:"transform 0.15s",transform:isOpen?"rotate(90deg)":"none"}}>▸</span>
                  <span style={{fontSize:14,flexShrink:0}}>📁</span>
                  <span style={{fontSize:12.5,fontWeight:700,color:"var(--muted)",lineHeight:1.4,wordBreak:"break-word"}}>{getTituloCarpeta(op)}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",paddingLeft:21}}>
                  <span className={"badge "+(ESTADO_BADGE_CLS[op.estado]||"")}>{ESTADOS[op.estado]}</span>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:"rgba(255,255,255,0.06)",color:"var(--dim)"}}>{hijos.length+1} doc{hijos.length+1===1?"":"s"}</span>
                  {(op.tipo==="reserva"||op.tipo==="reserva_alquiler")&&
                    <Btn v="ghost" s="sm" onClick={function(e){e.stopPropagation();setAddDocFor(op);}} style={{marginLeft:"auto"}}>+ Documento</Btn>}
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
    </div>
  );

  function renderOpRow(op,nested){
    const monto=getMonto(op),esResAlq=op.tipo==="reserva_alquiler",esReserva=op.tipo==="reserva";
    const hijosOp=childrenMap[op.id]||[];
    const menuItems=[
      {label:"✏ Editar",onClick:function(){onEdit(op);}},
      {label:"⧉ Duplicar",onClick:function(){onDuplicar(op);}},
      {label:"📤 Compartir documento",onClick:function(){shareWhatsApp(op);}},
      op.estado!=="activo"?{label:"✓ Marcar activo",onClick:function(){onChangeEstado(op.id,"activo");}}:null,
      op.estado!=="cerrado"?{label:"⊘ Marcar cerrado",onClick:function(){onChangeEstado(op.id,"cerrado");}}:null,
      {label:"🗑 Eliminar",red:true,onClick:function(){eliminarConEfecto(op.id);}},
    ].filter(Boolean);
    var removiendo = !!removingIds[op.id];

    // Fila condensada para documentos dentro de una carpeta: la operación
    // raíz ya muestra nombre, dirección, etc., así que acá no se repite —
    // solo el tipo de documento, el estado, el monto (si aplica) y acciones.
    if (nested) {
      return(
        <div key={op.id} className="op-card fade-up" style={Object.assign({marginTop:8,marginLeft:18,padding:"9px 12px",borderStyle:"dashed"},removiendo?{opacity:0,transform:"translateX(28px) scale(0.96)",pointerEvents:"none"}:{})}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",rowGap:6}}>
              <span style={{fontSize:12,color:"var(--dim)",flexShrink:0}}>↳</span>
              <span className={"badge "+(ESTADO_BADGE_CLS[op.estado]||"")} style={{flexShrink:0}}>{ESTADOS[op.estado]}</span>
              <span style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]}</span>
              {monto&&<span className="monto-tag">{monto}</span>}
              <span style={{fontSize:11,color:"var(--dim)",flexShrink:0}}>{new Date(op.created_at).toLocaleDateString("es-AR")}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
              <Btn v="secondary" s="sm" onClick={function(){onViewDoc(op);}}>📂 Abrir</Btn>
              <Btn v="ghost" s="sm" onClick={function(){shareWhatsApp(op);}} disabled={sharingId===op.id} title="Compartir documento (PDF)">{sharingId===op.id?"⏳":"📤"}</Btn>
              <Dropdown items={menuItems}/>
            </div>
          </div>
        </div>
      );
    }

    return(
      <div key={op.id} className="op-card fade-up" style={Object.assign({},{marginTop:hijosOp.length?8:0},removiendo?{opacity:0,transform:"translateX(28px) scale(0.96)",pointerEvents:"none"}:{})}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:5}}>
              <span className={"badge "+(ESTADO_BADGE_CLS[op.estado]||"")}>{ESTADOS[op.estado]}</span>
              <span className="badge badge-tipo">{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]}</span>
              <span style={{fontSize:11,color:"var(--dim)"}}>{new Date(op.created_at).toLocaleDateString("es-AR")}</span>
              {op.compartida&&<span className="badge" title={"Compartida con "+(op.compartida_inmobiliaria||"otra inmobiliaria")} style={{background:"rgba(96,165,250,0.14)",color:"#60a5fa"}}>🤝 Compartida</span>}
              {op.compartida_colega_activo&&op.compartida_colega&&<span className="badge" style={{background:"rgba(167,139,250,0.14)",color:"#a78bfa"}} title={"Colega: "+op.compartida_colega}>👥 {op.compartida_colega}</span>}
            </div>
            <div style={{fontSize:14,fontWeight:500,color:"var(--text)",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{getName(op)}</div>
            <div style={{fontSize:12,color:"var(--dim)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{op.inmueble_direccion?"📍 "+op.inmueble_direccion:"Sin dirección"}{op.inmueble_partido?" — "+op.inmueble_partido:""}</div>
            {monto&&<div className="monto-tag" style={{marginTop:5}}>{monto}</div>}
            {(esReserva||esResAlq)&&(function(){
              var opts=opcionesDoc(op);
              var faltan=opts.filter(function(o){return !hijosOp.some(function(h){return h.tipo===o.tipo;});}).length;
              return (
                <div style={{marginTop:8}}>
                  <Btn v={faltan>0?"orange":"secondary"} s="sm" onClick={function(){setAddDocFor(op);}}>
                    📎 {hijosOp.length>0?"Documentos vinculados ("+hijosOp.length+")":"Agregar documento"}
                  </Btn>
                </div>
              );
            })()}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            <Btn v="secondary" s="sm" onClick={function(){onViewDoc(op);}}>📂 Abrir</Btn>
            <Btn v="ghost" s="sm" onClick={function(){shareWhatsApp(op);}} disabled={sharingId===op.id} title="Compartir documento (PDF)">{sharingId===op.id?"⏳":"📤"}</Btn>
            <Dropdown items={menuItems}/>
          </div>
        </div>
      </div>
    );
  }
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
  broker:  { label:"Broker",          color:"#a78bfa",       bg:"rgba(139,92,246,0.10)",   perms:["crear","editar","ver_propios"] },
  vendedor:{ label:"Vendedor",        color:"#60a5fa",       bg:"rgba(59,130,246,0.10)",   perms:["crear","ver_propios"] },
  viewer:  { label:"Solo lectura",    color:"var(--dim)",    bg:"rgba(148,163,184,0.08)",  perms:["ver_todos"] },
};
const PERMS_LABELS = {
  todo:"Acceso total", crear:"Crear operaciones", editar:"Editar operaciones",
  eliminar:"Eliminar operaciones", ver_todos:"Ver todas las ops.", ver_propios:"Ver sus ops.", configurar:"Configurar cuenta",
};
const NIVEL_LABELS = { junior:"Junior", semisenior:"Semi Senior", senior:"Senior" };

function ConfiguracionView({ perfil, onChange, darkMode, onToggleDark, equipo, equipoSupabase, operaciones, clausulas, onAddClausula, onEditClausula, onDeleteClausula, onMoveClausula, onDuplicateClausula, bloquesReserva, onUpdateBloqueReserva, onMoveBloqueReserva, papelera, auditLog, onExportarRespaldo, onImportarRespaldo, onVaciarAuditoria, puedeInstalar, onInstalar }) {
  const [tab, setTab] = useState("cuenta");
  const [showInvite, setShowInvite] = useState(false);
  const [editM, setEditM] = useState(null);
  const [form, setForm] = useState({ email:"", rol:"broker", nivel:"junior" });
  const [inviteError, setInviteError] = useState(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const fileRef = useRef();
  const [localPerfil, setLocalPerfil] = useState(perfil);
  const [histBroker, setHistBroker] = useState("todos");
  const [confirmDelMiembro, setConfirmDelMiembro] = useState(null);
  const [histEstado, setHistEstado] = useState("todos");
  const [tipoDocSel, setTipoDocSel] = useState("reserva");
  const [plantillaForm, setPlantillaForm] = useState(null); // null | {editId, titulo, categoria, contenido, tipos}
  const [encabezadoEditing, setEncabezadoEditing] = useState(false);
  const [encabezadoDraft, setEncabezadoDraft] = useState("");

  useEffect(function(){ setLocalPerfil(perfil); }, [perfil]);

  function handleLogo(e){var file=e.target.files[0];if(!file)return;var r=new FileReader();r.onload=function(ev){setLocalPerfil(function(p){return Object.assign({},p,{logoDataUrl:ev.target.result});});};r.readAsDataURL(file);}
  function fP(k){return function(e){setLocalPerfil(function(p){return Object.assign({},p,{[k]:e.target.value});});};}
  function savePerfil(){ onChange(localPerfil); }

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
      if (res.error) { setInviteError(res.error.message||"No se pudo completar la operación."); return; }
      setShowInvite(false);
    });
  }

  var dueno = equipo.find(function(m){return m.rol==="dueno";});
  var opsTotal = operaciones.length;
  var opsActivas = operaciones.filter(function(o){return o.estado==="activo";}).length;

  var TABS_CFG = [
    {id:"cuenta",    label:"Mi cuenta",           icon:"👤"},
    {id:"equipo",    label:"Equipo",               icon:"👥"},
    {id:"historial", label:"Historial del equipo", icon:"📊"},
    {id:"plantillas",label:"Plantillas",           icon:"📝"},
    {id:"auditoria", label:"Auditoría",            icon:"🕵️"},
    {id:"apariencia",label:"Apariencia",           icon:"🎨"},
  ];

  // ── Respaldo (exportar/importar JSON) ──
  var backupFileRef = useRef();
  const [backupMsg,setBackupMsg] = useState(null); // {ok,text}
  const [importModo,setImportModo] = useState("fusionar"); // "fusionar" | "reemplazar"
  const [confirmImport,setConfirmImport] = useState(null); // texto del archivo pendiente de confirmar
  function handleBackupFile(e){
    var file=e.target.files[0]; if(!file) return;
    var reader=new FileReader();
    reader.onload=function(ev){ setConfirmImport(ev.target.result); };
    reader.onerror=function(){ setBackupMsg({ok:false,text:"No se pudo leer el archivo."}); };
    reader.readAsText(file);
    e.target.value = "";
  }
  function confirmarImportacion(){
    var res = onImportarRespaldo(confirmImport, importModo);
    setConfirmImport(null);
    if (res.ok) setBackupMsg({ok:true,text: importModo==="reemplazar" ? "Respaldo importado: se reemplazaron los datos actuales." : "Respaldo importado: se agregó lo nuevo sin borrar lo existente."});
    else setBackupMsg({ok:false,text: res.error||"No se pudo importar el archivo."});
  }

  // ── Auditoría: filtros ──
  const [auditQuery,setAuditQuery] = useState("");
  const [auditAccion,setAuditAccion] = useState("todas");

  return (
    <div>
      <div className="section-header">
        <div><div className="section-title">Configuración</div><div className="section-sub">Preferencias, perfil y equipo de trabajo</div></div>
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",gap:6,marginBottom:24,borderBottom:"1px solid var(--border)",paddingBottom:0,overflowX:"auto",WebkitOverflowScrolling:"touch",flexWrap:"nowrap",minWidth:0}}>
        {TABS_CFG.map(function(t){
          var active=tab===t.id;
          return(
            <button key={t.id} onClick={function(){setTab(t.id);}} style={{
              padding:"8px 12px",borderRadius:"8px 8px 0 0",border:"none",background:active?"var(--card)":"transparent",
              color:active?"var(--gold)":"var(--muted)",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:active?600:400,
              cursor:"pointer",borderBottom:active?"2px solid var(--gold)":"2px solid transparent",marginBottom:-1,
              display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",flexShrink:0,whiteSpace:"nowrap",
            }}>{t.icon} {t.label}</button>
          );
        })}
      </div>

      {/* ── TAB: APARIENCIA ── */}
      {tab==="apariencia"&&(
        <div style={{maxWidth:480}}>
          <div className="op-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,padding:"20px 22px"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{
                width:44,height:44,borderRadius:12,
                background:darkMode?"rgba(212,168,83,0.12)":"rgba(255,193,7,0.15)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                border:"1px solid "+(darkMode?"rgba(212,168,83,0.25)":"rgba(255,193,7,0.3)"),
              }}>
                {darkMode?"🌙":"☀️"}
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:2}}>
                  {darkMode?"Modo oscuro activo":"Modo claro activo"}
                </div>
                <div style={{fontSize:12.5,color:"var(--dim)"}}>
                  {darkMode?"Interfaz con fondo oscuro — ideal para trabajar de noche":"Interfaz con fondo claro — ideal para ambientes iluminados"}
                </div>
              </div>
            </div>
            {/* Toggle */}
            <div onClick={onToggleDark} style={{
              width:52,height:30,borderRadius:15,padding:4,cursor:"pointer",
              flexShrink:0,transition:"background 0.3s",
              background:darkMode?"var(--gold)":"rgba(148,163,184,0.35)",
              display:"flex",alignItems:"center",
            }}>
              <div style={{
                width:22,height:22,borderRadius:"50%",
                background:"white",
                transition:"transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                transform:darkMode?"translateX(22px)":"translateX(0)",
                boxShadow:"0 2px 6px rgba(0,0,0,0.35)",
              }}/>
            </div>
          </div>

          {puedeInstalar&&(
            <div className="op-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,padding:"20px 22px",marginTop:14}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:"rgba(45,212,191,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:"1px solid rgba(45,212,191,0.25)"}}>📲</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:2}}>Instalar DocWorks</div>
                  <div style={{fontSize:12.5,color:"var(--dim)"}}>Usalo como app, con ícono propio, y seguí trabajando sin conexión durante una visita a la propiedad.</div>
                </div>
              </div>
              <Btn v="success" s="sm" onClick={onInstalar}>Instalar</Btn>
            </div>
          )}

          {/* Estilo de los documentos (PDF y Word) — personalización por inmobiliaria */}
          <div className="card" style={{padding:20,marginTop:14}}>
            <div style={{fontSize:15,fontFamily:"DM Serif Display,serif",color:"var(--text)",marginBottom:2}}>Estilo de los documentos</div>
            <div style={{fontSize:12.5,color:"var(--dim)",marginBottom:16,lineHeight:1.5}}>Elegí cómo se ven los PDF y Word que genera tu inmobiliaria: plantilla, tipografía y colores de marca.</div>

            <div style={{fontSize:11,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Plantilla</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:18}}>
              {PLANTILLA_ESTILOS.map(function(pe){
                var sel=(localPerfil.plantillaEstilo||"corporativo")===pe.id;
                return (
                  <button key={pe.id} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{plantillaEstilo:pe.id});});}}
                    style={{textAlign:"left",padding:"12px 14px",borderRadius:12,cursor:"pointer",
                      border:sel?"1.5px solid var(--gold)":"1px solid var(--border2)",
                      background:sel?"rgba(212,168,83,0.08)":"transparent"}}>
                    <div style={{fontSize:16,marginBottom:4,color:sel?"var(--gold)":"var(--muted)"}}>{pe.icon}</div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{pe.label}</div>
                    <div style={{fontSize:11,color:"var(--dim)",marginTop:2,lineHeight:1.4}}>{pe.desc}</div>
                  </button>
                );
              })}
            </div>

            <div style={{fontSize:11,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Colores de marca</div>
            <div style={{display:"flex",gap:16,marginBottom:18,flexWrap:"wrap"}}>
              {[{k:"colorPrimario",l:"Color primario",hint:"Encabezado y rótulos"},{k:"colorSecundario",l:"Color secundario",hint:"Líneas y acentos"}].map(function(f){
                return (
                  <label key={f.k} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                    <input type="color" value={localPerfil[f.k]||(f.k==="colorPrimario"?"#142a4d":"#c9a227")}
                      onChange={function(e){setLocalPerfil(function(p){var o={};o[f.k]=e.target.value;return Object.assign({},p,o);});}}
                      style={{width:38,height:38,borderRadius:8,border:"1px solid var(--border2)",padding:0,cursor:"pointer",background:"none"}}/>
                    <div>
                      <div style={{fontSize:12.5,fontWeight:600,color:"var(--text)"}}>{f.l}</div>
                      <div style={{fontSize:10.5,color:"var(--dim)"}}>{f.hint}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Preview en vivo del encabezado */}
            <div style={{fontSize:11,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Vista previa</div>
            {(function(){
              var est=localPerfil.plantillaEstilo||"corporativo";
              var cPrim=localPerfil.colorPrimario||"#142a4d", cSec=localPerfil.colorSecundario||"#c9a227";
              var fam=est==="clasico"?"Georgia,serif":"Arial,Helvetica,sans-serif";
              var headerBg = est==="corporativo"?cPrim:est==="minimalista"?cPrim+"18":"transparent";
              var headerColor = est==="corporativo"?"#ffffff":cPrim;
              return (
                <div style={{border:"1px solid var(--border2)",borderRadius:10,overflow:"hidden",background:"#ffffff"}}>
                  <div style={{padding:"14px 16px",background:headerBg,borderBottom:est==="clasico"?"2px solid #1a1a1a":"none",fontFamily:fam}}>
                    <div style={{fontSize:13,fontWeight:700,color:headerColor,letterSpacing:"0.02em",textAlign:est==="clasico"?"center":"left"}}>{(localPerfil.nombre||"TU INMOBILIARIA").toUpperCase()}</div>
                    <div style={{fontSize:10,color:est==="corporativo"?"#ffffffaa":"#64748b",marginTop:2,textAlign:est==="clasico"?"center":"left"}}>Matrícula: 1234</div>
                  </div>
                  <div style={{padding:"14px 16px",fontFamily:fam}}>
                    <div style={{width:"60%",height:2,background:est==="clasico"?"#1a1a1a":cSec,marginBottom:10}}/>
                    <div style={{fontSize:12,fontWeight:700,color:est==="clasico"?"#1a1a1a":cPrim,textAlign:"center",marginBottom:8}}>BOLETO DE COMPRAVENTA</div>
                    <div style={{fontSize:10.5,color:"#334155",lineHeight:1.6}}>
                      <b style={{color:est==="clasico"?"#1a1a1a":cPrim}}>CLÁUSULA PRIMERA — OBJETO:</b> El vendedor transfiere al comprador el inmueble sito en...
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{paddingTop:16}}>
              <Btn v="success" onClick={savePerfil}>Guardar cambios ✓</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: MI CUENTA (DUEÑO) ── */}
      {tab==="cuenta"&&(
        <div className="two-col-layout">
          {/* Panel dueño */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Avatar + stats */}
            <div style={{background:"linear-gradient(135deg,rgba(212,168,83,0.08),rgba(212,168,83,0.02))",border:"1px solid rgba(212,168,83,0.2)",borderRadius:16,padding:20,textAlign:"center"}}>
              <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#b8811f,var(--gold),var(--gold2))",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"#0a0f1a",fontWeight:700,boxShadow:"0 4px 20px rgba(212,168,83,0.4)"}}>
                {localPerfil.logoDataUrl?<img src={localPerfil.logoDataUrl} style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:14}} alt=""/>:(localPerfil.nombre?localPerfil.nombre[0].toUpperCase():"D")}
              </div>
              <div style={{fontFamily:"DM Serif Display,serif",fontSize:18,color:"var(--text)",marginBottom:2}}>{localPerfil.nombre||"Tu inmobiliaria"}</div>
              <div style={{fontSize:12,color:"var(--gold)"}}>{localPerfil.matricula?"Mat. "+localPerfil.matricula:"Dueño / Administrador"}</div>
              <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                <div style={{textAlign:"center"}}><div style={{fontFamily:"DM Serif Display,serif",fontSize:22,color:"var(--text)"}}>{opsTotal}</div><div style={{fontSize:10,color:"var(--dim)"}}>Operaciones</div></div>
                <div style={{textAlign:"center"}}><div style={{fontFamily:"DM Serif Display,serif",fontSize:22,color:"var(--green)"}}>{opsActivas}</div><div style={{fontSize:10,color:"var(--dim)"}}>Activas</div></div>
                <div style={{textAlign:"center"}}><div style={{fontFamily:"DM Serif Display,serif",fontSize:22,color:"var(--teal)"}}>{equipo.length}</div><div style={{fontSize:10,color:"var(--dim)"}}>En equipo</div></div>
              </div>
            </div>

            {/* Logo upload */}
            <div className="card" style={{padding:16}}>
              <div style={{fontSize:12,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Logo</div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {localPerfil.logoDataUrl
                  ? <div style={{position:"relative"}}>
                      <img src={localPerfil.logoDataUrl} style={{height:56,width:90,borderRadius:8,objectFit:"contain",background:"rgba(255,255,255,0.04)",border:"1px solid var(--border2)",padding:4}} alt="logo"/>
                      <button onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{logoDataUrl:""});});}} style={{position:"absolute",top:-7,right:-7,width:18,height:18,borderRadius:"50%",background:"var(--red)",border:"none",color:"white",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    </div>
                  : <div className="logo-upload" onClick={function(){fileRef.current.click();}} style={{height:56,width:90}}>
                      <span style={{fontSize:18}}>🖼</span><span style={{fontSize:9,color:"var(--dim)"}}>Subir logo</span>
                    </div>
                }
                <div style={{fontSize:11,color:"var(--dim)",lineHeight:1.8}}>PNG, JPG o SVG<br/>Aparece en PDFs y sidebar</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogo}/>
              {localPerfil.logoDataUrl && (
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                  <div style={{fontSize:11,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Posición del logo (PDF y Word)</div>
                  <div style={{display:"flex",gap:6}}>
                    {[{v:"izquierda",l:"Izquierda"},{v:"centro",l:"Centro"},{v:"derecha",l:"Derecha"}].map(function(opt){
                      var sel=(localPerfil.logoPosicion||"derecha")===opt.v;
                      return (
                        <button key={opt.v} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{logoPosicion:opt.v});});}}
                          style={{flex:1,padding:"6px 8px",fontSize:11.5,borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,0.12)":"transparent",color:sel?"var(--gold)":"var(--dim)",fontWeight:sel?600:400}}>
                          {opt.l}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {localPerfil.logoDataUrl && (
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                  <div style={{fontSize:11,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,display:"flex",justifyContent:"space-between"}}>
                    <span>Tamaño del logo (PDF y Word)</span>
                    <span style={{color:"var(--gold)",fontWeight:700}}>{localPerfil.logoScale||100}%</span>
                  </div>
                  <input type="range" min="50" max="200" step="5" value={localPerfil.logoScale||100}
                    onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{logoScale:parseInt(e.target.value,10)});});}}
                    style={{width:"100%",accentColor:"var(--gold)"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--dim)",marginTop:2}}><span>Chico</span><span>Normal</span><span>Grande</span></div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="card" style={{padding:20}}>
            <div style={{fontSize:15,fontFamily:"DM Serif Display,serif",color:"var(--text)",marginBottom:16}}>Datos de la inmobiliaria</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <Inp label="Nombre de la inmobiliaria" value={localPerfil.nombre||""} onChange={fP("nombre")} placeholder="Inmobiliaria XYZ"/>
              <Inp label="Matrícula / CMCPSI" value={localPerfil.matricula||""} onChange={fP("matricula")} placeholder="Mat. 1234"/>
              <Inp label="CUIT de la inmobiliaria" value={localPerfil.cuit||""} onChange={fP("cuit")} placeholder="30-12345678-9"/>
              <Inp label="Teléfono" value={localPerfil.telefono||""} onChange={fP("telefono")} placeholder="+54 11 1234-5678"/>
              <Inp label="Email" value={localPerfil.email||""} onChange={fP("email")} placeholder="info@inmobiliaria.com" type="email"/>
              <Inp label="Dirección" value={localPerfil.direccion||""} onChange={fP("direccion")} placeholder="Av. Corrientes 1234, CABA"/>
              <Inp label="Sitio web" value={localPerfil.web||""} onChange={fP("web")} placeholder="www.inmobiliaria.com"/>
              <Txa label="Descripción / Slogan" value={localPerfil.descripcion||""} onChange={fP("descripcion")} placeholder="Breve descripción que aparece en documentos..." rows={2}/>
              <div style={{paddingTop:4,paddingBottom:4}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Encabezado de los documentos (PDF y Word)</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {[{k:"encabezado_nombre",l:"Nombre de la inmobiliaria"},{k:"encabezado_matricula",l:"Matrícula"},{k:"encabezado_web",l:"Sitio web"}].map(function(f){
                    var checked=localPerfil[f.k]!==false;
                    return (
                      <label key={f.k} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:10,border:"1px solid var(--border)",background:checked?"rgba(212,168,83,0.08)":"transparent",cursor:"pointer",fontSize:12.5,color:"var(--text)"}}>
                        <input type="checkbox" checked={checked} onChange={function(e){var v=e.target.checked;setLocalPerfil(function(p){var o={};o[f.k]=v;return Object.assign({},p,o);});}}/>{f.l}
                      </label>
                    );
                  })}
                </div>
                <div style={{fontSize:10.5,color:"var(--dim)",marginTop:6}}>Elegí qué datos se muestran en el encabezado de los documentos generados.</div>
              </div>
              <div style={{paddingTop:4,paddingBottom:4}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Pie de página de los documentos (PDF y Word)</div>
                <Txa label="Leyenda del pie de página" value={localPerfil.pie_pagina_texto||""} onChange={fP("pie_pagina_texto")} placeholder="Ej: Este documento no reemplaza al original firmado. Consultas: info@inmobiliaria.com" rows={2} hint="Aparece al final de cada documento generado, debajo del nombre de la inmobiliaria."/>
                <label style={{display:"flex",alignItems:"center",gap:8,marginTop:10,padding:"8px 12px",borderRadius:10,border:"1px solid var(--border)",background:localPerfil.pie_pagina_logo_debajo?"rgba(212,168,83,0.08)":"transparent",cursor:localPerfil.logoDataUrl?"pointer":"not-allowed",opacity:localPerfil.logoDataUrl?1:0.5,fontSize:12.5,color:"var(--text)"}}>
                  <input type="checkbox" disabled={!localPerfil.logoDataUrl} checked={!!localPerfil.pie_pagina_logo_debajo} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_logo_debajo:e.target.checked});});}}/>
                  Repetir el logo de la inmobiliaria, chico, debajo del pie de página
                </label>
                {!localPerfil.logoDataUrl&&<div style={{fontSize:10.5,color:"var(--dim)",marginTop:4}}>Subí un logo arriba para poder activar esta opción.</div>}
              </div>
              <Inp label="Tu nombre" value={localPerfil.nombre_usuario||""} onChange={fP("nombre_usuario")} placeholder="Ej: Alexis Fernández" hint="Se usa para identificarte en el registro de auditoría de cláusulas."/>
              <Slt label="Tu rol" value={localPerfil.rol||"dueno"} onChange={fP("rol")} hint="Determina qué secciones podés editar — por ejemplo, las plantillas solo las pueden modificar Dueño o Administrador.">
                {Object.entries(ROLES_DEF).map(function(e){return <option key={e[0]} value={e[0]}>{e[1].label}</option>;})}
              </Slt>
              <div style={{paddingTop:8}}>
                <Btn v="success" onClick={savePerfil} style={{width:"100%"}}>Guardar cambios ✓</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Respaldo y migración (fuera de la grilla de dos columnas, ancho completo) */}
      {tab==="cuenta"&&(
        <div className="card" style={{padding:20,marginTop:16}}>
          <div style={{fontSize:15,fontFamily:"DM Serif Display,serif",color:"var(--text)",marginBottom:4}}>Respaldo y migración</div>
          <div style={{fontSize:12.5,color:"var(--dim)",marginBottom:16,lineHeight:1.6}}>Todos los datos se guardan solo en este dispositivo/navegador. Exportá un respaldo en JSON para no perder tus operaciones y cláusulas, o para migrarlas a otra computadora.</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <Btn v="secondary" onClick={onExportarRespaldo}>⬇ Exportar todo (JSON)</Btn>
            <Btn v="secondary" onClick={function(){backupFileRef.current.click();}}>⬆ Importar respaldo</Btn>
            <input ref={backupFileRef} type="file" accept="application/json,.json" style={{display:"none"}} onChange={handleBackupFile}/>
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
                    <div style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg,#1e2d42,#162032)",border:"1px solid var(--border2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:600,color:"var(--text)",flexShrink:0,overflow:"hidden"}}>
                      {esPendiente?"✉":(m.nombre[0]?.toUpperCase()||"?")}
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
                        <div style={{fontSize:10,color:"var(--dim)"}}>Ops.</div>
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
                            <Btn v="secondary" s="sm" onClick={function(){openInvite(m);}}>✏ Rol/Nivel</Btn>
                          </>
                        )}
                      </div>
                    )}
                  </div>
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
                : <Inp label="Email" value={form.email} onChange={function(e){setForm(function(f){return Object.assign({},f,{email:e.target.value});});}} placeholder="juan@inmobiliaria.com" type="email"/>
              }
              <Slt label="Rol y permisos" value={form.rol} onChange={function(e){setForm(function(f){return Object.assign({},f,{rol:e.target.value});});}}>
                {Object.entries(ROLES_DEF).filter(function(e){return e[0]!=="dueno";}).map(function(e){
                  return <option key={e[0]} value={e[0]}>{e[1].label} — {e[0]==="admin"?"acceso total sin ser dueño":e[0]==="broker"?"crear y editar":e[0]==="vendedor"?"solo crear":e[0]==="viewer"?"solo ver":" "}</option>;
                })}
              </Slt>
              <Slt label="Nivel" value={form.nivel} onChange={function(e){setForm(function(f){return Object.assign({},f,{nivel:e.target.value});});}}>
                <option value="junior">Junior</option>
                <option value="semisenior">Semi Senior</option>
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

      {/* ── TAB: PLANTILLAS DE CLÁUSULAS POR TIPO DE DOCUMENTO ── */}
      {tab==="plantillas"&&(function(){
        var lista=(clausulas||[]).filter(function(c){return clausulaAplicaTipo(c,tipoDocSel);});
        var listaIds=lista.map(function(c){return c.id;});
        var puedeEditarPlantillas = perfil.rol==="dueno" || perfil.rol==="admin";
        var customMapPreview = perfil.encabezados_custom||{};
        var customTextoPreview = customMapPreview[tipoDocSel]||"";
        function nuevaClausula(){ if(!puedeEditarPlantillas)return; setPlantillaForm({editId:null,titulo:"",categoria:"general",contenido:"",tipos:[tipoDocSel],obligatoria:false}); }
        function editarClausula(c){ if(!puedeEditarPlantillas)return; setPlantillaForm({editId:c.id,titulo:c.titulo,categoria:c.categoria,contenido:c.contenido,tipos:c.tipos||["todos"],obligatoria:!!c.obligatoria}); }
        function guardar(){
          if(!puedeEditarPlantillas)return;
          if(!plantillaForm.titulo||!plantillaForm.contenido)return;
          var payload={titulo:plantillaForm.titulo,categoria:plantillaForm.categoria,contenido:plantillaForm.contenido,tipos:plantillaForm.tipos&&plantillaForm.tipos.length?plantillaForm.tipos:["todos"],obligatoria:!!plantillaForm.obligatoria};
          if(plantillaForm.editId){ onEditClausula(plantillaForm.editId,payload); }
          else { onAddClausula(Object.assign({},payload,{id:genId()})); }
          setPlantillaForm(null);
        }
        return(
          <div>
            <div style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>Personalizá, agregá o modificá las cláusulas que se incluyen en cada tipo de documento. Las predeterminadas del sistema siguen disponibles; podés sumar las que necesite tu inmobiliaria y vincular datos de la operación (propietario, inquilino, inmueble, etc.) con el botón «Vincular dato».</div>
            {!puedeEditarPlantillas&&(
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",marginBottom:16,fontSize:12.5,color:"var(--amber)"}}>
                <span>🔒</span>
                <span>Las plantillas solo pueden editarlas el Dueño o un Administrador. Tu rol actual es «{ROLES_DEF[perfil.rol]?.label||perfil.rol}» — podés consultarlas pero no modificarlas.</span>
              </div>
            )}
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
              {Object.keys(TIPOS).map(function(k){
                return <div key={k} className={"tipo-chip "+(tipoDocSel===k?"on":"")} onClick={function(){setTipoDocSel(k);setPlantillaForm(null);setEncabezadoEditing(false);}}>{tipoDocSel===k?"✓ ":""}{TIPOS[k]}</div>;
              })}
            </div>

            {/* Vista previa en vivo — se actualiza sola al tipear el encabezado,
                reordenar/editar cláusulas o cambiar de tipo de documento. */}
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                <span style={{fontSize:14}}>👁</span>
                <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",margin:0}}>Vista previa</p>
                <span style={{fontSize:10.5,color:"var(--dim)"}}>(con datos de ejemplo)</span>
              </div>
              <PlantillaPreview tipo={tipoDocSel} encabezado={encabezadoEditing?encabezadoDraft:customTextoPreview} clausulas={lista}/>
              <div style={{fontSize:10.5,color:"var(--dim)",marginTop:6,lineHeight:1.5}}>{tipoDocSel==="reserva"
                ? "Se muestra el encabezado y las cláusulas adicionales. Para ver el documento completo (incluido el cuerpo fijo), mirá el panel «Cuerpo del documento (bloques)» debajo."
                : "Se muestra el encabezado y las cláusulas adicionales, en el mismo orden en que van a salir en el documento. El cuerpo fijo (precio, forma de pago, posesión, firmas, etc.) sigue siendo el estándar del sistema y no se ve reflejado acá."}</div>
            </div>

            {tipoDocSel==="reserva" && (
              <ReservaBloquesPanel bloques={bloquesReserva} onUpdate={onUpdateBloqueReserva} onMove={onMoveBloqueReserva} clausulasLib={clausulas} operaciones={operaciones} puedeEditar={puedeEditarPlantillas}/>
            )}

            {/* Encabezado (párrafo introductorio) personalizable por tipo de documento */}
            {(function(){
              var customMap = perfil.encabezados_custom||{};
              var customTexto = customMap[tipoDocSel]||"";
              function empezarEdicion(){ setEncabezadoDraft(customTexto); setEncabezadoEditing(true); }
              function guardarEncabezado(){
                var updated=Object.assign({},perfil,{encabezados_custom:Object.assign({},customMap,{[tipoDocSel]:encabezadoDraft})});
                onChange(updated); setLocalPerfil(function(p){return Object.assign({},p,{encabezados_custom:updated.encabezados_custom});});
                setEncabezadoEditing(false);
              }
              function restablecerEncabezado(){
                var nextMap=Object.assign({},customMap); delete nextMap[tipoDocSel];
                var updated=Object.assign({},perfil,{encabezados_custom:nextMap});
                onChange(updated); setLocalPerfil(function(p){return Object.assign({},p,{encabezados_custom:nextMap});});
                setEncabezadoEditing(false);
              }
              return(
                <div className="card" style={{padding:14,marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,gap:8,flexWrap:"wrap"}}>
                    <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",margin:0}}>Encabezado de «{TIPOS[tipoDocSel]}»</p>
                    <span className={"badge "+(customTexto?"badge-gold":"badge-activo")}>{customTexto?"Personalizado":"Predeterminado del sistema"}</span>
                  </div>
                  <div style={{fontSize:11,color:"var(--dim)",marginBottom:10}}>Es el párrafo introductorio con el que arranca el documento. El resto (partes, condiciones económicas, cláusulas, firmas) se sigue generando automáticamente a partir de los datos de la operación — el broker solo completa el formulario y elige cláusulas, no redacta texto legal.</div>
                  {!puedeEditarPlantillas ? (
                    customTexto
                      ? <div style={{padding:"9px 11px",borderRadius:8,background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",fontSize:11.5,color:"var(--muted)",whiteSpace:"pre-wrap"}}>{customTexto}</div>
                      : <div style={{fontSize:11.5,color:"var(--dim)"}}>Se usa el texto predeterminado del sistema.</div>
                  ) : encabezadoEditing ? (
                    <div>
                      <textarea className="inp" rows={6} value={encabezadoDraft} onChange={function(e){setEncabezadoDraft(e.target.value);}}
                        placeholder="Escribí el párrafo introductorio usando tokens {{...}} — se completan solos con los datos de cada operación." style={{width:"100%",resize:"vertical",fontFamily:"DM Sans,sans-serif"}}/>
                      <details style={{marginTop:8}}>
                        <summary style={{fontSize:11,color:"var(--gold)",cursor:"pointer"}}>Ver tokens disponibles</summary>
                        <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:5}}>
                          {ENCABEZADO_TOKENS_INFO.map(function(t){
                            return <span key={t[0]} title={t[1]} style={{fontSize:10.5,padding:"2px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"help"}}>{"{{"+t[0]+"}}"}</span>;
                          })}
                        </div>
                      </details>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:10}}>
                        <Btn v="ghost" s="sm" onClick={function(){setEncabezadoEditing(false);}}>Cancelar</Btn>
                        <Btn v="success" s="sm" onClick={guardarEncabezado} disabled={!encabezadoDraft.trim()}>Guardar encabezado ✓</Btn>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {customTexto && <div style={{padding:"9px 11px",borderRadius:8,background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",fontSize:11.5,color:"var(--muted)",whiteSpace:"pre-wrap",marginBottom:10}}>{customTexto}</div>}
                      <div style={{display:"flex",gap:8}}>
                        <Btn v="secondary" s="sm" onClick={empezarEdicion}>{customTexto?"✏ Editar":"✎ Personalizar encabezado"}</Btn>
                        {customTexto&&<Btn v="ghost" s="sm" onClick={restablecerEncabezado}>Restablecer al predeterminado</Btn>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Cláusulas de «{TIPOS[tipoDocSel]}»</div>
              {!plantillaForm&&puedeEditarPlantillas&&<Btn s="sm" onClick={nuevaClausula}>+ Nueva cláusula</Btn>}
            </div>

            {puedeEditarPlantillas && !plantillaForm && (
              <div className="card" style={{padding:14,marginBottom:14}}>
                <ClausulaIAComposer onDraft={function(draft){ setPlantillaForm({editId:null,titulo:draft.titulo,categoria:draft.categoria||"general",contenido:draft.contenido,tipos:[tipoDocSel]}); }}/>
              </div>
            )}

            {puedeEditarPlantillas && lista.length>0 && (
              <div style={{fontSize:11,color:"var(--dim)",marginBottom:10,display:"flex",alignItems:"flex-start",gap:6}}>
                <span>☑</span>
                <span>Tildá «Incluir por defecto» en las cláusulas que querés que ya vengan marcadas al crear una operación nueva de este tipo. Marcá 🔒 «Obligatoria» en el formulario si el broker nunca debe poder sacarla. Usá ↑ ↓ para ordenarlas — el orden acá define el orden en el documento final.</span>
              </div>
            )}

            {plantillaForm&&puedeEditarPlantillas&&(
              <div className="card" style={{padding:14,marginBottom:14}}>
                <p style={{fontFamily:"DM Serif Display,serif",fontSize:14,color:"var(--text)",marginBottom:10}}>{plantillaForm.editId?"Editar cláusula":"Nueva cláusula para «"+TIPOS[tipoDocSel]+"»"}</p>
                <ClausulaFormBody
                  form={plantillaForm}
                  setForm={function(updater){ setPlantillaForm(function(f){ return typeof updater==="function"?updater(f):updater; }); }}
                  editId={plantillaForm.editId}
                  onSubmit={guardar}
                  onCancel={function(){setPlantillaForm(null);}}
                />
                <ClausulaIAComposer onDraft={function(draft){ setPlantillaForm(function(f){ return Object.assign({},f,{titulo:draft.titulo,categoria:draft.categoria||"general",contenido:draft.contenido}); }); }}/>
              </div>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {lista.length===0&&<div style={{padding:24,textAlign:"center",color:"var(--dim)",fontSize:13}}>No hay cláusulas para este tipo de documento todavía.</div>}
              {lista.map(function(c,idxLista){
                var esDefault=!!CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;});
                var esTodos=!c.tipos||!c.tipos.length||c.tipos.indexOf("todos")!==-1;
                var esDefaultSeleccion=(perfil.clausulas_default_ids||[]).indexOf(c.id)!==-1;
                var esPrimera=idxLista===0, esUltima=idxLista===listaIds.length-1;
                function toggleDefaultClausula(){
                  var actuales=perfil.clausulas_default_ids||[];
                  var next=esDefaultSeleccion?actuales.filter(function(x){return x!==c.id;}):actuales.concat([c.id]);
                  var updated=Object.assign({},perfil,{clausulas_default_ids:next});
                  onChange(updated);
                  // Mantenemos también el estado local del formulario de "Mi cuenta"
                  // sincronizado, para que un "Guardar cambios" posterior en esa
                  // pestaña no pise esta selección con datos desactualizados.
                  setLocalPerfil(function(p){return Object.assign({},p,{clausulas_default_ids:next});});
                }
                return(
                  <div key={c.id} className="op-card" style={{cursor:"default"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{c.titulo}</span>
                          <span className={"badge "+(esDefault?"badge-gold":"badge-activo")}>{esDefault?"Predeterminada":"Personalizada"}</span>
                          {esTodos&&<span className="badge badge-tipo">Todos los documentos</span>}
                          {esDefaultSeleccion&&<span className="badge" style={{background:"rgba(45,212,191,0.12)",color:"var(--teal)"}}>✓ Por defecto</span>}
                          {c.obligatoria&&<span className="badge" style={{background:"rgba(180,83,9,0.12)",color:"#b45309"}}>🔒 Obligatoria</span>}
                        </div>
                        <p style={{fontSize:11.5,color:"var(--dim)",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.contenido}</p>
                        {puedeEditarPlantillas&&(
                          <label style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:8,fontSize:11.5,color:"var(--muted)",cursor:"pointer"}}>
                            <input type="checkbox" checked={esDefaultSeleccion} onChange={toggleDefaultClausula}/>
                            Incluir por defecto en operaciones nuevas de «{TIPOS[tipoDocSel]}»
                          </label>
                        )}
                      </div>
                      {puedeEditarPlantillas&&(
                        <div style={{display:"flex",gap:3,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                          <button onClick={function(){if(!esPrimera)onMoveClausula(c.id,"up",listaIds);}} disabled={esPrimera} style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:esPrimera?"var(--border2)":"var(--muted)",cursor:esPrimera?"default":"pointer",fontSize:12}}>↑</button>
                          <button onClick={function(){if(!esUltima)onMoveClausula(c.id,"down",listaIds);}} disabled={esUltima} style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:esUltima?"var(--border2)":"var(--muted)",cursor:esUltima?"default":"pointer",fontSize:12}}>↓</button>
                          <button onClick={function(){onDuplicateClausula(c.id);}} title="Duplicar" style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:12}}>⧉</button>
                          <button onClick={function(){editarClausula(c);}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:12}}>✏</button>
                          <button onClick={function(){onDeleteClausula(c.id);}} style={{padding:"4px 7px",borderRadius:6,background:"rgba(248,113,113,0.05)",border:"1px solid rgba(248,113,113,0.15)",color:"var(--red)",cursor:"pointer",fontSize:12}}>✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── TAB: AUDITORÍA (registro de cambios en cláusulas) ── */}
      {tab==="auditoria"&&(function(){
        var puedeVaciar = perfil.rol==="dueno";
        var entries = (auditLog||[]).filter(function(en){
          if (auditAccion!=="todas" && en.accion!==auditAccion) return false;
          if (!auditQuery.trim()) return true;
          var q = auditQuery.toLowerCase();
          return [en.actorNombre, en.clausulaTitulo].some(function(v){ return v && v.toLowerCase().includes(q); });
        });
        var ACCION_LABEL = { crear:"Creó", editar:"Editó", eliminar:"Eliminó", importar:"Importó respaldo" };
        var ACCION_COLOR = { crear:"var(--green)", editar:"var(--gold)", eliminar:"var(--red)", importar:"var(--teal)" };
        return (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{fontSize:15,fontWeight:600,color:"var(--text)"}}>Registro de auditoría de cláusulas</div>
                <div style={{fontSize:12,color:"var(--dim)"}}>Quién creó, editó o eliminó cada cláusula, y cuándo — para detectar cambios no autorizados en las plantillas.</div>
              </div>
              {puedeVaciar && auditLog.length>0 && <Btn v="ghost" s="sm" onClick={onVaciarAuditoria}>Vaciar registro</Btn>}
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <Inp value={auditQuery} onChange={function(e){setAuditQuery(e.target.value);}} placeholder="Buscar por persona o cláusula..." style={{flex:1,minWidth:200}}/>
              <Slt value={auditAccion} onChange={function(e){setAuditAccion(e.target.value);}} style={{minWidth:160}}>
                <option value="todas">Todas las acciones</option>
                <option value="crear">Creaciones</option>
                <option value="editar">Ediciones</option>
                <option value="eliminar">Eliminaciones</option>
                <option value="importar">Importaciones</option>
              </Slt>
            </div>
            {entries.length===0&&(
              <div className="card" style={{padding:30,textAlign:"center"}}>
                <p style={{color:"var(--dim)",fontSize:13}}>{auditLog.length===0?"Todavía no hay movimientos registrados.":"No hay resultados para ese filtro."}</p>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {entries.map(function(en){
                return (
                  <div key={en.id} className="card" style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,color:ACCION_COLOR[en.accion]||"var(--dim)",background:"rgba(148,163,184,0.10)"}}>{ACCION_LABEL[en.accion]||en.accion}</span>
                        <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{en.clausulaTitulo||"(sin título)"}</span>
                      </div>
                      <div style={{fontSize:11,color:"var(--dim)"}}>{new Date(en.ts).toLocaleString("es-AR")}</div>
                    </div>
                    <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>Por {en.actorNombre}{en.actorRol?" — "+(ROLES_DEF[en.actorRol]?.label||en.actorRol):""}</div>
                    {en.cambios && en.cambios.length>0 && (
                      <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:4}}>
                        {en.cambios.map(function(c,i){
                          return (
                            <div key={i} style={{fontSize:11.5,color:"var(--dim)"}}>
                              <span style={{fontWeight:600,color:"var(--text)",textTransform:"capitalize"}}>{c.campo}</span>: <span style={{textDecoration:"line-through",opacity:0.7}}>{c.antes||"(vacío)"}</span> → <span style={{color:"var(--text)"}}>{c.despues||"(vacío)"}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

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
                {filteredOps.length===0&&<div style={{padding:24,textAlign:"center",fontSize:13,color:"var(--dim)"}}>No hay operaciones que coincidan con el filtro.</div>}
                {filteredOps.slice().sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);}).map(function(o,i,arr){
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

const DEFAULT_PERFIL={nombre:"",nombre_usuario:"",matricula:"",telefono:"",email:"",logoDataUrl:"",logoPosicion:"derecha",cuit:"",direccion:"",web:"",descripcion:"",rol:"dueno",pie_pagina_texto:"",pie_pagina_logo_debajo:false,clausulas_default_ids:[],colorPrimario:"#142a4d",colorSecundario:"#c9a227",plantillaEstilo:"corporativo",encabezados_custom:{}};

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

function explicarErrorRed(msg){
  var m = (msg||"").toLowerCase();
  if (m.indexOf("load failed")>-1 || m.indexOf("failed to fetch")>-1 || m.indexOf("networkerror")>-1 || m.indexOf("network request failed")>-1) {
    return "No se pudo conectar con Supabase (error de red del navegador). Si abriste este archivo con doble clic desde tu disco, tenés que servirlo por http(s):// — los navegadores bloquean estos pedidos desde archivos locales. Si ya lo estás sirviendo por http(s), puede ser una extensión, VPN o firewall bloqueando xpjiydwjawjizubyldtk.supabase.co.";
  }
  return msg;
}

function LoginScreen({ onLogin, error, loading, connError }){
  var [email,setEmail]=useState("");
  var [password,setPassword]=useState("");
  var esArchivoLocal = (typeof window!=="undefined" && window.location && window.location.protocol==="file:");
  function submit(e){ e.preventDefault(); onLogin(email.trim(), password); }
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",background:AUTH_BG,padding:16,fontFamily:"'DM Sans',sans-serif"}}>
      <form onSubmit={submit} style={{width:"100%",maxWidth:340,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:28,display:"flex",flexDirection:"column",gap:14,boxShadow:"0 8px 30px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:6}}>
          <div style={{fontSize:22,fontWeight:800,color:AUTH_TEXT}}>DocWorks</div>
          <div style={{fontSize:12.5,color:AUTH_MUTED,marginTop:2}}>Iniciá sesión para continuar</div>
        </div>
        {esArchivoLocal && (
          <div style={{fontSize:12,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600,lineHeight:1.4}}>
            ⚠️ Estás abriendo este archivo directo desde tu disco (file://). El login no va a funcionar así — necesitás servirlo por http(s):// (un servidor local, hosting, etc.).
          </div>
        )}
        {connError && <div style={{fontSize:12,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600,lineHeight:1.4}}>{connError}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Email</label>
          <input type="email" required value={email} onChange={function(e){setEmail(e.target.value);}}
            style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} />
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <label style={{fontSize:12,fontWeight:600,color:AUTH_MUTED}}>Contraseña</label>
          <input type="password" required value={password} onChange={function(e){setPassword(e.target.value);}}
            style={{padding:"10px 12px",borderRadius:10,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:14}} />
        </div>
        {error && <div style={{fontSize:12.5,color:AUTH_RED,background:"rgba(248,113,113,.12)",padding:"8px 10px",borderRadius:8,fontWeight:600}}>{error}</div>}
        <button type="submit" disabled={loading} style={{marginTop:4,padding:"11px 14px",borderRadius:10,border:"none",background:AUTH_GOLD,color:"#1a1206",fontWeight:700,fontSize:14,cursor:loading?"default":"pointer",opacity:loading?.6:1}}>
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
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
      if (res[0].error) { setError(res[0].error.message); return; }
      setDashboard(res[0].data);
      setInmobiliarias(res[1].error ? [] : (res[1].data||[]));
      setPlanes(res[2].error ? [] : (res[2].data||[]));
    }).catch(function(err){ setLoading(false); setError(err && err.message ? err.message : "Error cargando el panel."); });
  }

  useEffect(function(){ if (activo) recargar(); }, [activo]);

  function crearInmobiliaria(nombre, planCodigo, adminEmail){
    return rpc("fn_super_crear_inmobiliaria", { p_nombre:nombre, p_plan_codigo:planCodigo, p_admin_email:adminEmail, p_admin_nombre:"" }).then(function(res){ if(!res.error) recargar(); return res; });
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

  return { dashboard:dashboard, inmobiliarias:inmobiliarias, planes:planes, loading:loading, error:error, recargar:recargar,
    crearInmobiliaria:crearInmobiliaria, editarInmobiliaria:editarInmobiliaria, asignarPlan:asignarPlan,
    setEstadoMembresia:setEstadoMembresia, crearPlan:crearPlan, editarPlan:editarPlan };
}

function SANumberInput(props){
  return <input type="number" value={props.value} onChange={props.onChange} placeholder={props.placeholder}
    style={{padding:"8px 10px",borderRadius:8,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:13,width:"100%"}} />;
}
function SATextInput(props){
  return <input type={props.type||"text"} value={props.value} onChange={props.onChange} placeholder={props.placeholder}
    style={{padding:"8px 10px",borderRadius:8,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:13,width:"100%"}} />;
}
function SASelect(props){
  return <select value={props.value} onChange={props.onChange}
    style={{padding:"8px 10px",borderRadius:8,border:"1px solid "+AUTH_BORDER,background:AUTH_BG,color:AUTH_TEXT,fontSize:13,width:"100%"}}>{props.children}</select>;
}
function SALabel({children}){ return <label style={{fontSize:11.5,fontWeight:600,color:AUTH_MUTED,display:"block",marginBottom:4}}>{children}</label>; }
function SAButton({children,onClick,danger,ghost,disabled}){
  return <button onClick={onClick} disabled={disabled} style={{padding:"8px 14px",borderRadius:9,border:ghost?"1px solid "+AUTH_BORDER:"none",
    background:ghost?"transparent":(danger?AUTH_RED:AUTH_GOLD),color:ghost?AUTH_TEXT:(danger?"#fff":"#1a1206"),fontWeight:700,fontSize:12.5,
    cursor:disabled?"default":"pointer",opacity:disabled?.6:1}}>{children}</button>;
}
function SACard({children}){ return <div style={{background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:14,padding:16}}>{children}</div>; }

function SAModal({open,onClose,title,children}){
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.45)",padding:16}} onClick={onClose}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:420,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:16,padding:22,maxHeight:"85vh",overflow:"auto"}}>
        <div style={{fontSize:15,fontWeight:700,color:AUTH_TEXT,marginBottom:14}}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function SuperAdminDashboard({ contexto, onLogout }){
  var sa = useSuperAdmin(true);
  var [tab,setTab] = useState("resumen");
  var [showNueva,setShowNueva] = useState(false);
  var [nuevaForm,setNuevaForm] = useState({nombre:"",plan:"inicial",email:""});
  var [nuevaError,setNuevaError] = useState(null);
  var [nuevaBusy,setNuevaBusy] = useState(false);
  var [editInmob,setEditInmob] = useState(null); // inmobiliaria seleccionada para cambiar plan/estado
  var [showNuevoPlan,setShowNuevoPlan] = useState(false);
  var [editPlan,setEditPlan] = useState(null);
  var [planForm,setPlanForm] = useState({codigo:"",nombre:"",descripcion:"",precio:"",moneda:"ARS",limite:""});

  function crearInmobiliaria(){
    if (!nuevaForm.nombre || !nuevaForm.email) return;
    setNuevaBusy(true); setNuevaError(null);
    sa.crearInmobiliaria(nuevaForm.nombre.trim(), nuevaForm.plan, nuevaForm.email.trim().toLowerCase()).then(function(res){
      setNuevaBusy(false);
      if (res.error) { setNuevaError(res.error.message||"No se pudo crear la inmobiliaria."); return; }
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

  var TABS_SA = [ ["resumen","Resumen"], ["inmobiliarias","Inmobiliarias"], ["planes","Planes"] ];

  return (
    <div style={{position:"fixed",inset:0,zIndex:400,overflow:"auto",background:AUTH_BG,color:AUTH_TEXT,padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{maxWidth:920,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:20,fontWeight:800}}>Panel Super Admin</div>
            <div style={{fontSize:12.5,color:AUTH_MUTED}}>Gestión global de DocWorks</div>
          </div>
          <button onClick={onLogout} style={{padding:"8px 14px",borderRadius:9,border:"1px solid "+AUTH_BORDER,background:"transparent",color:AUTH_TEXT,fontSize:13,cursor:"pointer"}}>Cerrar sesión</button>
        </div>

        <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
          {TABS_SA.map(function(t){
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{padding:"7px 14px",borderRadius:20,border:"1px solid "+(tab===t[0]?AUTH_GOLD:AUTH_BORDER),background:tab===t[0]?"rgba(212,168,83,0.12)":"transparent",color:tab===t[0]?AUTH_GOLD:AUTH_MUTED,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>{t[1]}</button>;
          })}
        </div>

        {sa.error && <div style={{marginBottom:16,padding:"10px 14px",borderRadius:10,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:AUTH_RED,fontSize:12.5}}>{sa.error}</div>}

        {tab==="resumen" && (
          sa.dashboard ? (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
              {[
                ["Inmobiliarias",sa.dashboard.total_inmobiliarias],
                ["Activas",sa.dashboard.inmobiliarias_activas],
                ["Susp./Vencidas",sa.dashboard.inmobiliarias_suspendidas],
                ["Usuarios totales",sa.dashboard.total_usuarios],
                ["Brokers",sa.dashboard.total_brokers],
                ["Planes activos",sa.dashboard.planes_activos],
                ["Membresías activas",sa.dashboard.membresias_activas],
                ["Membresías vencidas",sa.dashboard.membresias_vencidas],
              ].map(function(row){
                return (
                  <SACard key={row[0]}>
                    <div style={{fontSize:24,fontWeight:800,color:AUTH_TEXT}}>{row[1]}</div>
                    <div style={{fontSize:11.5,color:AUTH_MUTED,marginTop:2}}>{row[0]}</div>
                  </SACard>
                );
              })}
            </div>
          ) : <div style={{fontSize:13,color:AUTH_MUTED}}>Cargando estadísticas…</div>
        )}

        {tab==="inmobiliarias" && (
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <SAButton onClick={function(){setShowNueva(true);}}>+ Nueva inmobiliaria</SAButton>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sa.inmobiliarias.length===0 && !sa.loading && <div style={{fontSize:13,color:AUTH_MUTED}}>No hay inmobiliarias todavía.</div>}
              {sa.inmobiliarias.map(function(i){
                return (
                  <SACard key={i.inmobiliaria_id}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{i.inmobiliaria_nombre}</div>
                        <div style={{fontSize:12,color:AUTH_MUTED,marginTop:2}}>
                          Plan {i.plan_nombre} · {i.usuarios_activos}/{i.limite_usuarios} usuarios
                          {i.fecha_renovacion ? " · renueva " + new Date(i.fecha_renovacion).toLocaleDateString("es-AR") : ""}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,color:ESTADO_MEMBRESIA_COLOR[i.estado]||AUTH_MUTED,border:"1px solid "+(ESTADO_MEMBRESIA_COLOR[i.estado]||AUTH_MUTED)+"55"}}>{i.estado}</span>
                        <SAButton ghost onClick={function(){setEditInmob(i);}}>Gestionar</SAButton>
                      </div>
                    </div>
                  </SACard>
                );
              })}
            </div>
          </div>
        )}

        {tab==="planes" && (
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <SAButton onClick={function(){abrirEditPlan(null);}}>+ Nuevo plan</SAButton>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sa.planes.map(function(p){
                return (
                  <SACard key={p.id}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{p.nombre} <span style={{fontSize:11,color:AUTH_MUTED,fontWeight:400}}>({p.codigo})</span></div>
                        <div style={{fontSize:12,color:AUTH_MUTED,marginTop:2}}>
                          Hasta {p.limite_usuarios} usuarios · {p.precio_mensual?p.moneda+" "+p.precio_mensual+"/mes":"precio sin definir"} · {p.activo?"activo":"inactivo"}
                        </div>
                      </div>
                      <SAButton ghost onClick={function(){abrirEditPlan(p);}}>Editar</SAButton>
                    </div>
                  </SACard>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Nueva inmobiliaria */}
      <SAModal open={showNueva} onClose={function(){setShowNueva(false);}} title="Nueva inmobiliaria">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><SALabel>Nombre de la inmobiliaria</SALabel><SATextInput value={nuevaForm.nombre} onChange={function(e){setNuevaForm(function(f){return Object.assign({},f,{nombre:e.target.value});});}} placeholder="Inmobiliaria Ejemplo"/></div>
          <div><SALabel>Plan</SALabel>
            <SASelect value={nuevaForm.plan} onChange={function(e){setNuevaForm(function(f){return Object.assign({},f,{plan:e.target.value});});}}>
              {sa.planes.filter(function(p){return p.activo;}).map(function(p){return <option key={p.codigo} value={p.codigo}>{p.nombre} (hasta {p.limite_usuarios} usuarios)</option>;})}
            </SASelect>
          </div>
          <div><SALabel>Email del dueño/admin (recibe la invitación)</SALabel><SATextInput type="email" value={nuevaForm.email} onChange={function(e){setNuevaForm(function(f){return Object.assign({},f,{email:e.target.value});});}} placeholder="dueno@inmobiliaria.com"/></div>
          {nuevaError && <div style={{fontSize:12.5,color:AUTH_RED,background:"rgba(248,113,113,0.1)",padding:"8px 10px",borderRadius:8,fontWeight:600}}>{nuevaError}</div>}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
            <SAButton ghost onClick={function(){setShowNueva(false);}}>Cancelar</SAButton>
            <SAButton onClick={crearInmobiliaria} disabled={nuevaBusy}>{nuevaBusy?"Creando…":"Crear e invitar"}</SAButton>
          </div>
        </div>
      </SAModal>

      {/* Gestionar inmobiliaria (plan + estado membresía) */}
      <SAModal open={!!editInmob} onClose={function(){setEditInmob(null);}} title={editInmob?editInmob.inmobiliaria_nombre:""}>
        {editInmob && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <SALabel>Cambiar plan</SALabel>
              <div style={{display:"flex",gap:8}}>
                <SASelect value={editInmob._nuevoPlan||""} onChange={function(e){setEditInmob(function(i){return Object.assign({},i,{_nuevoPlan:e.target.value});});}}>
                  <option value="">— elegir —</option>
                  {sa.planes.filter(function(p){return p.activo;}).map(function(p){return <option key={p.codigo} value={p.codigo}>{p.nombre}</option>;})}
                </SASelect>
                <SAButton disabled={!editInmob._nuevoPlan} onClick={function(){sa.asignarPlan(editInmob.inmobiliaria_id, editInmob._nuevoPlan).then(function(){setEditInmob(null);});}}>Aplicar</SAButton>
              </div>
            </div>
            <div>
              <SALabel>Cambiar estado de membresía</SALabel>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {ESTADOS_MEMBRESIA.map(function(e){
                  return <button key={e} onClick={function(){sa.setEstadoMembresia(editInmob.inmobiliaria_id, e).then(function(){setEditInmob(null);});}}
                    style={{padding:"6px 12px",borderRadius:20,border:"1px solid "+(ESTADO_MEMBRESIA_COLOR[e]||AUTH_MUTED)+"55",background:editInmob.estado===e?(ESTADO_MEMBRESIA_COLOR[e]||AUTH_MUTED)+"22":"transparent",color:ESTADO_MEMBRESIA_COLOR[e]||AUTH_MUTED,fontSize:12,fontWeight:600,cursor:"pointer"}}>{e}</button>;
                })}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <SAButton ghost onClick={function(){setEditInmob(null);}}>Cerrar</SAButton>
            </div>
          </div>
        )}
      </SAModal>

      {/* Nuevo / editar plan */}
      <SAModal open={showNuevoPlan} onClose={function(){setShowNuevoPlan(false);}} title={editPlan?"Editar plan":"Nuevo plan"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {!editPlan && <div><SALabel>Código (interno, sin espacios)</SALabel><SATextInput value={planForm.codigo} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{codigo:e.target.value.toLowerCase().replace(/\s+/g,"_")});});}} placeholder="ej: profesional_plus"/></div>}
          <div><SALabel>Nombre</SALabel><SATextInput value={planForm.nombre} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{nombre:e.target.value});});}} placeholder="Plan Profesional Plus"/></div>
          <div><SALabel>Descripción</SALabel><SATextInput value={planForm.descripcion} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{descripcion:e.target.value});});}} placeholder="Opcional"/></div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><SALabel>Precio mensual</SALabel><SANumberInput value={planForm.precio} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{precio:e.target.value});});}} placeholder="Sin definir"/></div>
            <div style={{flex:1}}><SALabel>Límite de usuarios</SALabel><SANumberInput value={planForm.limite} onChange={function(e){setPlanForm(function(f){return Object.assign({},f,{limite:e.target.value});});}} placeholder="10"/></div>
          </div>
          {editPlan && (
            <div>
              <SALabel>Estado</SALabel>
              <SAButton ghost onClick={function(){sa.editarPlan(editPlan.id, planForm.nombre, planForm.descripcion, planForm.precio?parseFloat(planForm.precio):null, parseInt(planForm.limite), !editPlan.activo).then(function(){setShowNuevoPlan(false);});}}>{editPlan.activo?"Desactivar plan":"Activar plan"}</SAButton>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
            <SAButton ghost onClick={function(){setShowNuevoPlan(false);}}>Cancelar</SAButton>
            <SAButton onClick={guardarPlan}>{editPlan?"Guardar":"Crear plan"}</SAButton>
          </div>
        </div>
      </SAModal>
    </div>
  );
}

function useDocWorksSession(){
  var [ready,setReady]=useState(false);
  var [session,setSession]=useState(null);
  var [contexto,setContexto]=useState(null);
  var [contextoLoading,setContextoLoading]=useState(false);
  var [loginError,setLoginError]=useState(null);
  var [loginLoading,setLoginLoading]=useState(false);
  var [superDashboard,setSuperDashboard]=useState(null);
  var [connError,setConnError]=useState(null);

  function cargarContexto(sb){
    setContextoLoading(true);
    sb.rpc("fn_mi_contexto").then(function(res){
      setContexto(res.error ? null : res.data);
      setContextoLoading(false);
      if (!res.error && res.data && res.data.es_super_admin) {
        sb.rpc("fn_super_dashboard").then(function(r2){ if (!r2.error) setSuperDashboard(r2.data); }).catch(function(){});
      }
    }).catch(function(){ setContexto(null); setContextoLoading(false); });
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
        if (res.data.session) cargarContexto(sb);
        setReady(true);
      }).catch(function(err){
        if (cancelado) return;
        clearTimeout(timeoutId);
        setConnError("Error conectando con Supabase: " + (err && err.message ? err.message : "desconocido"));
        setReady(true);
      });
      var listener = sb.auth.onAuthStateChange(function(_evt, sess){
        setSession(sess);
        if (sess) cargarContexto(sb); else { setContexto(null); setSuperDashboard(null); }
      });
      docworksAuthSub = listener && listener.data ? listener.data.subscription : null;
    }).catch(function(err){
      if (cancelado) return;
      clearTimeout(timeoutId);
      setConnError("Error inicializando Supabase: " + (err && err.message ? err.message : "desconocido"));
      setReady(true);
    });

    return function(){ cancelado = true; clearTimeout(timeoutId); };
  }

  var docworksAuthSub = null;
  useEffect(function(){
    var cancelar = iniciar();
    return function(){ cancelar(); if (docworksAuthSub) docworksAuthSub.unsubscribe(); };
  }, []);

  function retry(){ setReady(false); iniciar(); }

  function login(email, password){
    setLoginError(null); setLoginLoading(true);
    loadSupabaseJs().then(function(sb){
      if (!sb) { setLoginLoading(false); setLoginError("No se pudo cargar Supabase. Recargá la página e intentá de nuevo."); return; }
      sb.auth.signInWithPassword({ email: email, password: password }).then(function(res){
        setLoginLoading(false);
        if (res.error) { setLoginError(res.error.message === "Invalid login credentials" ? "Email o contraseña incorrectos." : res.error.message); return; }
      }).catch(function(err){
        setLoginLoading(false);
        setLoginError(explicarErrorRed(err && err.message ? err.message : "Error de conexión, intentá de nuevo."));
      });
    }).catch(function(){ setLoginLoading(false); setLoginError("No se pudo cargar Supabase."); });
  }
  function logout(){
    loadSupabaseJs().then(function(sb){ if (sb) sb.auth.signOut(); });
  }

  return { ready:ready, session:session, contexto:contexto, contextoLoading:contextoLoading, superDashboard:superDashboard, loginError:loginError, loginLoading:loginLoading, connError:connError, login:login, logout:logout, retry:retry };
}

function SesionBadge({ contexto, onLogout }){
  if (!contexto || !contexto.usuario) return null;
  return (
    <div style={{position:"fixed",bottom:10,left:10,zIndex:250,display:"flex",alignItems:"center",gap:8,background:AUTH_CARD,border:"1px solid "+AUTH_BORDER,borderRadius:20,padding:"6px 10px",fontSize:11.5,color:AUTH_TEXT,boxShadow:"0 2px 10px rgba(0,0,0,0.08)"}}>
      <span>{contexto.usuario.nombre || contexto.usuario.email} · {contexto.usuario.rol_base}</span>
      <button onClick={onLogout} style={{background:"transparent",border:"none",color:AUTH_MUTED,cursor:"pointer",fontSize:11.5,textDecoration:"underline",padding:0}}>Salir</button>
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
        if (usuariosRes.error) { setError(usuariosRes.error.message); return; }
        var ahora = new Date();
        var invPendientes = (invRes.data||[]).filter(function(i){ return new Date(i.expira_en) > ahora; });
        setEquipo((usuariosRes.data||[]).map(mapUsuarioAEquipo).concat(invPendientes.map(mapInvitacionAEquipo)));
      }).catch(function(err){ setLoading(false); setError(err && err.message ? err.message : "Error cargando el equipo."); });
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
      if (!res.error) recargar();
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

export default function App(){
  var docworksAuth = useDocWorksSession();
  var equipoSupabase = useEquipoSupabase(docworksAuth.contexto);
  useEffect(function(){injectFonts();loadRecharts();applyTheme(darkMode);initPWA();},[]);
  const [showSplash,setShowSplash]=useState(true);
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
  const [view,setView]=useState("dashboard");
  const [darkMode,setDarkMode]=useState(function(){ return lsGet("darkMode", false); });
  const [showForm,setShowForm]=useState(false);
  const [editOp,setEditOp]=useState(null);
  const [formInitialOverride,setFormInitialOverride]=useState(null); // prefill de un borrador recuperado (operación nueva, sin guardar aún)
  const [draftPrompt,setDraftPrompt]=useState(null); // borrador pendiente detectado al abrir la app
  const [formTipo,setFormTipo]=useState("reserva");
  const [viewDoc,setViewDoc]=useState(null);
  const [docTab,setDocTab]=useState("resumen");
  const [docAutoAction,setDocAutoAction]=useState(null); // "pdf"|"docx"|"whatsapp"|null — acción a disparar automáticamente al abrir el visor (menú "Finalizar")
  function abrirDoc(op){ setViewDoc(op); setDocTab("resumen"); }
  const [clausulas,setClausulas]=useState(function(){ return lsGet("clausulas", CLAUSULAS_DEFAULT); });
  // Fase 1 — sistema de bloques (piloto Reserva). Guardado aparte de
  // `clausulas` (biblioteca de cláusulas adicionales) porque son dos
  // conceptos distintos: esto es el CUERPO FIJO del documento.
  const [bloquesReserva,setBloquesReserva]=useState(function(){ return lsGet("bloquesReserva", DEFAULT_BLOQUES_RESERVA); });
  const [perfil,setPerfil]=useState(function(){ return Object.assign({},DEFAULT_PERFIL,lsGet("perfil", {})); });
  const [equipo,setEquipo]=useState(function(){ return lsGet("equipo", DEFAULT_EQUIPO); });
  useEffect(function(){ if (equipoSupabase.equipo.length || !equipoSupabase.loading) setEquipo(equipoSupabase.equipo); }, [equipoSupabase.equipo]);
  // Auditoría: quién modificó qué cláusula y cuándo. `perfilRef` evita que
  // logAudit quede atado a un `perfil` obsoleto por closures viejas.
  const [auditLog,setAuditLog]=useState(function(){ return lsGet("auditLog", []); });
  const perfilRef=useRef(perfil);
  useEffect(function(){ perfilRef.current=perfil; },[perfil]);
  function logAudit(accion, clausula, cambios) {
    setAuditLog(function(log){
      var entry = nuevoAuditEntry(perfilRef.current, accion, clausula, cambios);
      return [entry].concat(log).slice(0, AUDIT_LOG_MAX);
    });
  }
  function addClausula(c){ setClausulas(function(cs){return cs.concat([c]);}); logAudit("crear", c, null); }
  function editClausula(id,d){
    setClausulas(function(cs){
      var anterior = cs.find(function(c){return c.id===id;});
      var nueva = anterior ? Object.assign({},anterior,d) : d;
      logAudit("editar", nueva, diffClausula(anterior, nueva));
      return cs.map(function(c){return c.id===id?Object.assign({},c,d):c;});
    });
  }
  function deleteClausula(id){
    setClausulas(function(cs){
      var borrada = cs.find(function(c){return c.id===id;});
      if (borrada) logAudit("eliminar", borrada, null);
      return cs.filter(function(c){return c.id!==id;});
    });
  }
  // Reordena una cláusula dentro de la biblioteca. visibleIds es el orden
  // actualmente mostrado en pantalla (ya filtrado por tipo de documento);
  // el swap se aplica sobre el array completo para no desordenar cláusulas
  // de otros tipos que están intercaladas.
  function moveClausula(id, dir, visibleIds){
    setClausulas(function(cs){
      var idx = visibleIds.indexOf(id);
      var swapIdx = dir==="up" ? idx-1 : idx+1;
      if(idx<0||swapIdx<0||swapIdx>=visibleIds.length) return cs;
      var otherId = visibleIds[swapIdx];
      var i1 = cs.findIndex(function(c){return c.id===id;});
      var i2 = cs.findIndex(function(c){return c.id===otherId;});
      if(i1<0||i2<0) return cs;
      var next = cs.slice();
      var tmp = next[i1]; next[i1]=next[i2]; next[i2]=tmp;
      return next;
    });
  }
  function duplicateClausula(id){
    setClausulas(function(cs){
      var idx = cs.findIndex(function(c){return c.id===id;});
      if(idx<0) return cs;
      var copia = Object.assign({}, cs[idx], { id: genId(), titulo: (cs[idx].titulo||"Cláusula")+" (copia)" });
      var next = cs.slice();
      next.splice(idx+1, 0, copia);
      logAudit("crear", copia, null);
      return next;
    });
  }
  // ── Fase 1: edición de bloques de Reserva ──
  function updateBloqueReserva(id, cambios){
    setBloquesReserva(function(bs){
      return bs.map(function(b){ return b.id===id ? Object.assign({},b,cambios) : b; });
    });
  }
  function moveBloqueReserva(id, dir){
    setBloquesReserva(function(bs){
      var ordenados = bs.slice().sort(function(a,b){return (a.orden||0)-(b.orden||0);});
      var idx = ordenados.findIndex(function(b){return b.id===id;});
      var swapIdx = dir==="up" ? idx-1 : idx+1;
      if(idx<0||swapIdx<0||swapIdx>=ordenados.length) return bs;
      var ordenTmp = ordenados[idx].orden;
      ordenados[idx] = Object.assign({}, ordenados[idx], { orden: ordenados[swapIdx].orden });
      ordenados[swapIdx] = Object.assign({}, ordenados[swapIdx], { orden: ordenTmp });
      return bs.map(function(b){
        var actualizado = ordenados.find(function(o){return o.id===b.id;});
        return actualizado || b;
      });
    });
  }
  // Papelera: operaciones eliminadas quedan acá con su fecha de borrado y se
  // pueden restaurar hasta 30 días después; pasado ese plazo se purgan solas.
  const [papelera,setPapelera]=useState(function(){ return purgePapeleraArr(lsGet("papelera", [])); });
  const [papeleraJump,setPapeleraJump]=useState(0);
  const [confirmVaciarPapelera,setConfirmVaciarPapelera]=useState(false);
  const [operaciones,setOperaciones]=useState(function(){
    var stored=lsGet("operaciones", null);
    if(stored) return stored;
    return [
    {
      id:"op_ex1", tipo:"boleto", estado:"activo",
      comprador_nombre:"Lucia Fernandez", comprador_dni:"27-45678901-3", comprador_domicilio:"Thames 1234, Palermo", comprador_email:"lucia@email.com", comprador_telefono:"+54 9 11 3333-1111",
      vendedor_nombre:"Miguel Torres", vendedor_dni:"20-23456789-0", vendedor_domicilio:"Corrientes 4567, CABA", vendedor_email:"miguel@email.com", vendedor_telefono:"+54 9 11 4444-2222",
      inmueble_direccion:"Av. Santa Fe 3456, Piso 7A", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"Departamento 2 ambientes 55m2 luminoso con balcon",
      precio:"95000", moneda:"USD", anticipo:"15000", saldo:"80000", fecha_posesion:"2026-09-01", comision_vendedor:"2", comision_comprador:"2",
      escribania:"Escribania Perez Marti", clausulas_ids:["c1","c2"], clausulas_custom:"",
      created_at:new Date(Date.now()-5*24*60*60*1000).toISOString(),
    },
    {
      id:"op_ex2", tipo:"alquiler", estado:"activo",
      locador_nombre:"Patricia Gomez", locador_dni:"23-56789012-4", locador_domicilio:"Belgrano 890, CABA", locador_email:"patricia@email.com", locador_telefono:"+54 9 11 5555-3333",
      locatario_nombre:"Andres Ramirez", locatario_dni:"20-67890123-5", locatario_domicilio:"Lavalle 1234, CABA", locatario_email:"andres@email.com", locatario_telefono:"+54 9 11 6666-4444",
      inmueble_direccion:"Charcas 2345, Piso 2B", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"Monoambiente 32m2 reformado, luminoso",
      alquiler_monto_inicial:"280000", alquiler_moneda:"ARS", alquiler_plazo_meses:"24",
      alquiler_inicio:"2026-03-01", alquiler_fin:"2028-03-01",
      alquiler_actualizacion:"ICL", alquiler_periodo_actualizacion:"cuatrimestral",
      alquiler_deposito:"1", alquiler_destino:"vivienda",
      alquiler_garantia_tipo:"seguro_caucion", alquiler_garantia_titular:"Garantizar SA",
      alquiler_comision_locador:"0.5", alquiler_comision_locatario:"0.5",
      alquiler_forma_pago:"transferencia", alquiler_dia_pago:"1",
      clausulas_ids:["c6","c7"], clausulas_custom:"",
      created_at:new Date(Date.now()-10*24*60*60*1000).toISOString(),
    },
    {
      id:"op_ex3", tipo:"reserva", estado:"borrador",
      comprador_nombre:"Camila Benitez", comprador_dni:"27-78901234-6", comprador_domicilio:"", comprador_email:"camila@email.com", comprador_telefono:"+54 9 11 7777-5555",
      vendedor_nombre:"Hugo Pereyra", vendedor_dni:"20-89012345-7", vendedor_domicilio:"Monroe 3456, Belgrano", vendedor_email:"hugo@email.com", vendedor_telefono:"+54 9 11 8888-6666",
      inmueble_direccion:"Av. Cabildo 1234, Piso 5C", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"3 ambientes 75m2 con cochera",
      precio:"145000", moneda:"USD", anticipo:"18000", saldo:"127000", fecha_posesion:"2026-10-15", comision_vendedor:"3", comision_comprador:"3",
      escribania:"", clausulas_ids:["c1"], clausulas_custom:"",
      created_at:new Date(Date.now()-2*24*60*60*1000).toISOString(),
    },
    {
      id:"op_ex4", tipo:"reserva_alquiler", estado:"activo",
      locador_nombre:"Carmen Vazquez", locador_dni:"23-90123456-8", locador_domicilio:"Serrano 567, Palermo", locador_email:"carmen@email.com", locador_telefono:"+54 9 11 9999-7777",
      locatario_nombre:"Federico Silva", locatario_dni:"20-01234567-9", locatario_domicilio:"", locatario_email:"fede@email.com", locatario_telefono:"+54 9 11 1111-8888",
      inmueble_direccion:"Nicaragua 4567, Palermo Soho", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"PH 3 ambientes con terraza",
      res_alq_monto_reserva:"150000", res_alq_moneda:"ARS", res_alq_monto_mensual:"320000",
      res_alq_plazo_cantidad:"24", res_alq_plazo_unidad:"meses",
      res_alq_inicio_estimado:"2026-08-01", res_alq_destino:"vivienda",
      res_alq_vigencia_dias:"10", res_alq_comision_locador:"0.5", res_alq_comision_locatario:"0.5",
      clausulas_ids:[], clausulas_custom:"",
      created_at:new Date(Date.now()-1*24*60*60*1000).toISOString(),
    },
    {
      id:"op_ex5", tipo:"boleto", estado:"cerrado",
      comprador_nombre:"Daniel Herrera", comprador_dni:"20-12309876-1", comprador_domicilio:"Av. Rivadavia 5678, CABA", comprador_email:"daniel@email.com", comprador_telefono:"+54 9 11 2222-9999",
      vendedor_nombre:"Graciela Mendez", vendedor_dni:"27-98765432-0", vendedor_domicilio:"Medrano 890, Almagro", vendedor_email:"graciela@email.com", vendedor_telefono:"+54 9 11 3333-0000",
      inmueble_direccion:"Acoyte 123, Piso 1A", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"Departamento 2 ambientes 48m2",
      precio:"72000", moneda:"USD", anticipo:"10000", saldo:"62000", fecha_posesion:"2025-12-01", comision_vendedor:"2.5", comision_comprador:"2.5",
      escribania:"Escribania Rodriguez", clausulas_ids:["c1","c2","c3"], clausulas_custom:"",
      created_at:new Date(Date.now()-45*24*60*60*1000).toISOString(),
    },
    {id:"op1",tipo:"boleto",estado:"activo",comprador_nombre:"María García",comprador_dni:"27-34567890-1",comprador_domicilio:"Av. Santa Fe 2345, CABA",comprador_email:"maria@email.com",comprador_telefono:"",vendedor_nombre:"Carlos Rodríguez",vendedor_dni:"20-20304050-9",vendedor_domicilio:"Belgrano 890, CABA",vendedor_email:"carlos@email.com",vendedor_telefono:"",inmueble_direccion:"Soler 4156, Piso 3B",inmueble_partido:"Buenos Aires",inmueble_provincia:"Buenos Aires",nomenclatura_catastral:"Circ. VIII — Secc. B — Manz. 23",descripcion_inmueble:"Departamento 3 ambientes 68m2 con balcón",precio:"120000",moneda:"USD",anticipo:"20000",saldo:"100000",fecha_posesion:"2025-03-15",comision_porcentaje:"3",escribania:"Escribanía Fernández",clausulas_ids:["c1","c2"],clausulas_custom:"",inmueble_tipo:"departamento",created_at:new Date().toISOString()},
    {id:"op2",tipo:"reserva_alquiler",estado:"activo",locador_nombre:"Roberto Díaz",locador_dni:"20-11223344-5",locador_domicilio:"Corrientes 500, CABA",locador_email:"rdiaz@email.com",locador_telefono:"",locatario_nombre:"Sofía Peralta",locatario_dni:"27-55667788-9",locatario_domicilio:"Tucumán 800, CABA",locatario_email:"sofia@email.com",locatario_telefono:"",inmueble_direccion:"Gurruchaga 2340, Piso 2A",inmueble_partido:"Buenos Aires",inmueble_provincia:"Buenos Aires",descripcion_inmueble:"Departamento 2 ambientes 45m2 luminoso",res_alq_monto_reserva:"50000",res_alq_moneda:"ARS",res_alq_monto_mensual:"185000",res_alq_plazo_meses:"24",res_alq_inicio_estimado:"2025-03-01",res_alq_destino:"vivienda",res_alq_comision:"1",res_alq_vigencia_dias:"10",res_alq_observaciones:"",clausulas_ids:[],clausulas_custom:"",inmueble_tipo:"departamento",created_at:new Date().toISOString()},
    {id:"op3",tipo:"alquiler",estado:"activo",locador_nombre:"Roberto Díaz",locador_dni:"20-11223344-5",locador_domicilio:"Corrientes 500, CABA",locador_email:"rdiaz@email.com",locador_telefono:"",locatario_nombre:"Sofía Peralta",locatario_dni:"27-55667788-9",locatario_domicilio:"Tucumán 800, CABA",locatario_email:"sofia@email.com",locatario_telefono:"",inmueble_direccion:"Gurruchaga 2340, Piso 2A",inmueble_partido:"Buenos Aires",inmueble_provincia:"Buenos Aires",descripcion_inmueble:"Departamento 2 ambientes 45m2",alquiler_monto_inicial:"185000",alquiler_moneda:"ARS",alquiler_plazo_meses:"24",alquiler_inicio:"2025-03-01",alquiler_fin:"2027-03-01",alquiler_actualizacion:"ICL",alquiler_periodo_actualizacion:"cuatrimestral",alquiler_deposito:"1",alquiler_destino:"vivienda",alquiler_garantia_tipo:"propietario",alquiler_garantia_titular:"Jorge Peralta",alquiler_garantia_dni:"20-44556677-8",alquiler_garantia_inmueble:"Lavalle 1234, CABA",alquiler_comision:"1",alquiler_forma_pago:"transferencia",alquiler_dia_pago:"1",clausulas_ids:["c6","c7","c8"],clausulas_custom:"",inmueble_tipo:"departamento",created_at:new Date().toISOString()},
    {
      id:"op_ex6", tipo:"comodato", estado:"activo",
      comprador_nombre:"Valentina Ríos", comprador_dni:"29-11122233-4", comprador_domicilio:"Uriarte 456, Palermo", comprador_email:"valentina@email.com", comprador_telefono:"+54 9 11 2020-1010",
      vendedor_nombre:"Osvaldo Bianchi", vendedor_dni:"18-22334455-6", vendedor_domicilio:"Malabia 789, CABA", vendedor_email:"osvaldo@email.com", vendedor_telefono:"+54 9 11 3030-2020",
      inmueble_direccion:"Guatemala 3210, PB", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"Local comercial 40m2, sin uso actualmente",
      comodato_plazo:"12 meses", comodato_uso:"Depósito de mercadería del comodatario, sin destino comercial al público.",
      clausulas_ids:[], clausulas_custom:"",
      created_at:new Date(Date.now()-3*24*60*60*1000).toISOString(),
    },
    {
      id:"op_ex7", tipo:"exclusividad", estado:"activo",
      comprador_nombre:"Inmobiliaria Del Sur (interesado)", comprador_dni:"", comprador_domicilio:"", comprador_email:"", comprador_telefono:"",
      vendedor_nombre:"Elena Castro", vendedor_dni:"16-33445566-7", vendedor_domicilio:"Warnes 2100, Chacarita", vendedor_email:"elena@email.com", vendedor_telefono:"+54 9 11 4040-3030",
      inmueble_direccion:"Warnes 2100, PB", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"Casa 3 ambientes con patio, 120m2",
      exclusividad_tipo:"con", precio:"165000", moneda:"USD", exclusividad_vigencia:"90 días", comision_vendedor:"3",
      clausulas_ids:[], clausulas_custom:"",
      created_at:new Date(Date.now()-20*24*60*60*1000).toISOString(),
    },
    {
      id:"op_ex8", tipo:"refuerzo_reserva", estado:"activo", parent_id:"op_ex3",
      comprador_nombre:"Camila Benitez", comprador_dni:"27-78901234-6", comprador_domicilio:"", comprador_email:"camila@email.com", comprador_telefono:"+54 9 11 7777-5555",
      vendedor_nombre:"Hugo Pereyra", vendedor_dni:"20-89012345-7", vendedor_domicilio:"Monroe 3456, Belgrano", vendedor_email:"hugo@email.com", vendedor_telefono:"+54 9 11 8888-6666",
      inmueble_direccion:"Av. Cabildo 1234, Piso 5C", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"3 ambientes 75m2 con cochera",
      precio:"7000", moneda:"USD", fecha_posesion:"2026-08-20",
      refuerzo_trayectoria:"Con fecha 13/08/2026 se firmó reserva por U$D 18.000. El presente refuerzo complementa la seña original a cuenta del precio total pactado.",
      clausulas_ids:["c1"], clausulas_custom:"",
      created_at:new Date(Date.now()-1*24*60*60*1000).toISOString(),
    },
    {
      id:"op_ex9", tipo:"devolucion_reserva", estado:"cerrado",
      comprador_nombre:"Nicolás Aguirre", comprador_dni:"25-44556677-8", comprador_domicilio:"Scalabrini Ortiz 1200, CABA", comprador_email:"nico@email.com", comprador_telefono:"+54 9 11 5050-4040",
      vendedor_nombre:"Silvia Molina", vendedor_dni:"17-55667788-9", vendedor_domicilio:"Gorriti 890, Palermo", vendedor_email:"silvia@email.com", vendedor_telefono:"+54 9 11 6060-5050",
      inmueble_direccion:"Gorriti 890, Piso 4A", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"Departamento 1 ambiente 30m2",
      precio:"5000", moneda:"USD", fecha_posesion:"2026-07-10",
      devolucion_motivo:"El comprador no obtuvo la aprobación crediticia dentro del plazo pactado; se resuelve por mutuo acuerdo sin penalidad.",
      clausulas_ids:[], clausulas_custom:"",
      created_at:new Date(Date.now()-40*24*60*60*1000).toISOString(),
    },
    {
      id:"op_ex10", tipo:"reserva_alquiler", estado:"borrador",
      locador_nombre:"Marcelo Ibáñez", locador_dni:"22-66778899-0", locador_domicilio:"Honduras 3400, Palermo", locador_email:"marcelo@email.com", locador_telefono:"+54 9 11 7070-6060",
      locatario_nombre:"Julieta Correa", locatario_dni:"31-77889900-1", locatario_domicilio:"", locatario_email:"julieta@email.com", locatario_telefono:"+54 9 11 8080-7070",
      inmueble_direccion:"Honduras 3400, Piso 6A", inmueble_partido:"Buenos Aires", inmueble_provincia:"Buenos Aires",
      descripcion_inmueble:"Departamento 2 ambientes con balcón, 50m2",
      res_alq_monto_reserva:"90000", res_alq_moneda:"ARS", res_alq_monto_mensual:"350000",
      res_alq_plazo_cantidad:"24", res_alq_plazo_unidad:"meses",
      res_alq_inicio_estimado:"2026-09-15", res_alq_destino:"vivienda",
      res_alq_vigencia_dias:"7", res_alq_comision_locador:"1", res_alq_comision_locatario:"1",
      clausulas_ids:[], clausulas_custom:"",
      created_at:new Date().toISOString(),
    },
    ];
  });

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
    } else {
      r.style.setProperty("--bg","#f1f5f9");
      r.style.setProperty("--surface","#ffffff");
      r.style.setProperty("--card","#ffffff");
      r.style.setProperty("--border","rgba(0,0,0,0.08)");
      r.style.setProperty("--border2","rgba(0,0,0,0.13)");
      r.style.setProperty("--text","#0f172a");
      r.style.setProperty("--muted","#3f4c5e");
      r.style.setProperty("--dim","#64748b");
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
  useAutosave("operaciones", operaciones, 500, reportSave);
  useAutosave("papelera", papelera, 500, reportSave);
  useAutosave("clausulas", clausulas, 500, reportSave);
  useAutosave("bloquesReserva", bloquesReserva, 500, reportSave);
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
    descargarBackupJSON({ operaciones:operaciones, papelera:papelera, clausulas:clausulas, perfil:perfil, equipo:equipo, auditLog:auditLog });
  }
  // Aplica un backup importado. `modo`: "reemplazar" pisa todo lo actual;
  // "fusionar" agrega lo que falte por id sin borrar lo que ya había.
  function importarRespaldo(rawText, modo) {
    var res = parseBackupJSON(rawText);
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

  function saveOp(data,accion){
    var esNueva=!editOp;
    var opGuardada;
    if(editOp){
      opGuardada=Object.assign({},data,{id:editOp.id,created_at:editOp.created_at});
      setOperaciones(function(ops){return ops.map(function(o){return o.id===editOp.id?opGuardada:o;});});
    } else {
      opGuardada=Object.assign({},data,{id:genId(),created_at:new Date().toISOString()});
      setOperaciones(function(ops){return[opGuardada].concat(ops);});
    }
    setShowForm(false);setEditOp(null);setFormInitialOverride(null);
    if(accion==="pdf"||accion==="whatsapp"){
      setDocAutoAction(accion==="whatsapp"?"whatsapp":null);
      abrirDoc(opGuardada);
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
  }
  function restoreOp(id){
    setPapelera(function(p){
      var op=p.find(function(o){return o.id===id;});
      if(op){var restored=Object.assign({},op);delete restored.deleted_at;setOperaciones(function(ops){return [restored].concat(ops);});}
      return p.filter(function(o){return o.id!==id;});
    });
  }
  function deleteOpPermanente(id){ setPapelera(function(p){return p.filter(function(o){return o.id!==id;});}); }
  function vaciarPapelera(){ setPapelera([]); setConfirmVaciarPapelera(false); }
  // Purga automática: al abrir la app, lo que lleva más de 30 días en la
  // papelera se elimina definitivamente sin intervención del usuario.
  useEffect(function(){ setPapelera(function(p){return purgePapeleraArr(p);}); },[]);
  function changeEstado(id,estado){setOperaciones(function(ops){return ops.map(function(o){return o.id===id?Object.assign({},o,{estado:estado}):o;});});}
  // Centro de tareas: togglea una tarea del checklist operativo. Actualiza
  // tanto la lista de operaciones como el viewDoc abierto (que es una copia
  // congelada al momento de abrir el modal), para que el check se refleje
  // al instante sin tener que cerrar y volver a abrir el documento.
  function toggleTarea(opId,tareaId){
    setOperaciones(function(ops){return ops.map(function(o){
      if(o.id!==opId) return o;
      var td=Object.assign({},o.tareas_done||{}); td[tareaId]=!td[tareaId];
      return Object.assign({},o,{tareas_done:td});
    });});
    setViewDoc(function(v){
      if(!v||v.id!==opId) return v;
      var td=Object.assign({},v.tareas_done||{}); td[tareaId]=!td[tareaId];
      return Object.assign({},v,{tareas_done:td});
    });
  }
  function duplicarOp(op){var copia=Object.assign({},op,{id:genId(),estado:"borrador",created_at:new Date().toISOString()});setOperaciones(function(ops){return[copia].concat(ops);});}
  // Una operación sólo puede dar origen a UN documento derivado de cada tipo (un solo
  // Comodato, un solo Refuerzo, un solo Contrato desde Reserva de Locación). Esto evita
  // duplicados y mantiene la "carpeta" de la operación prolija.
  function yaConvertido(opId, tipoHijo){ return operaciones.some(function(o){return o.parent_id===opId && o.tipo===tipoHijo;}); }
  function convertirAContrato(op){
    if(yaConvertido(op.id,"alquiler")) return;
    var nuevo=Object.assign({},EMPTY_OP,{tipo:"alquiler",estado:"borrador",parent_id:op.id,locador_nombre:op.locador_nombre,locador_dni:op.locador_dni,locador_domicilio:op.locador_domicilio,locador_email:op.locador_email,locatario_nombre:op.locatario_nombre,locatario_dni:op.locatario_dni,locatario_domicilio:op.locatario_domicilio,locatario_email:op.locatario_email,inmueble_direccion:op.inmueble_direccion,inmueble_partido:op.inmueble_partido,inmueble_provincia:op.inmueble_provincia,nomenclatura_catastral:op.nomenclatura_catastral,descripcion_inmueble:op.descripcion_inmueble,inmueble_tipo:op.inmueble_tipo||"departamento",alquiler_monto_inicial:op.res_alq_monto_mensual||"",alquiler_moneda:op.res_alq_moneda||"ARS",alquiler_plazo_meses:op.res_alq_plazo_meses||"24",alquiler_inicio:"",alquiler_destino:op.res_alq_destino||"vivienda",alquiler_comision:op.res_alq_comision||"1",clausulas_ids:op.clausulas_ids||[],clausulas_custom:op.clausulas_custom||""});
    var conId=Object.assign({},nuevo,{id:genId(),created_at:new Date().toISOString()});
    setOperaciones(function(ops){return[conId].concat(ops);});
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
    setEditOp(conId); setFormTipo("refuerzo_reserva"); setShowForm(true);
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

  const [topSearch,setTopSearch]=useState("");
  const [showBot,setShowBot]=useState(false);

  // ── Gate de sesión (Fase 1 SaaS) ──────────────────────────────────────────
  // A partir de acá la app sigue exactamente igual que antes. Todo lo de
  // abajo (Operaciones, Documentos, Equipo local) queda intacto — este gate
  // solo decide SI se llega a renderizarlo, no CÓMO se renderiza.
  if (!docworksAuth.ready || docworksAuth.contextoLoading) return <><GStyles/><AuthLoadingScreen error={docworksAuth.connError} onRetry={docworksAuth.retry}/></>;
  if (!docworksAuth.session) return <><GStyles/><LoginScreen onLogin={docworksAuth.login} error={docworksAuth.loginError} loading={docworksAuth.loginLoading} connError={docworksAuth.connError}/></>;
  var ctx = docworksAuth.contexto;
  if (ctx && ctx.es_super_admin) return <><GStyles/><SuperAdminDashboard contexto={ctx} onLogout={docworksAuth.logout}/></>;
  if (!ctx || !ctx.usuario) return <><GStyles/><CuentaNoHabilitadaScreen onLogout={docworksAuth.logout}/></>;
  if (!ctx.habilitado) return <><GStyles/><MembresiaSuspendidaScreen estado={ctx.membresia ? ctx.membresia.estado : "suspendida"} onLogout={docworksAuth.logout}/></>;

  return(
    <>
      <GStyles/>
      {showSplash&&<SplashScreen onDone={function(){setShowSplash(false);}}/>}
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
          <span className="mobile-logo-text">DocWorks</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={function(){setView("dashboard");setPapeleraJump(function(n){return n+1;});}} title="Papelera" style={{position:"relative",width:34,height:34,borderRadius:10,border:"1px solid var(--border2)",background:"transparent",color:"var(--muted)",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            🗑
            {papelera.length>0&&<span style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,borderRadius:20,background:"var(--red)",color:"#fff",fontSize:9.5,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{papelera.length}</span>}
          </button>
          <Btn onClick={function(){setEditOp(null);setFormTipo("reserva");setShowForm(true);}} s="sm">+ Nueva</Btn>
        </div>
      </div>

      <div className="app-wrap">

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="topbar-logo">
            <img src={LOGO_B64} alt="DocWorks" style={{height:36,width:"auto",objectFit:"contain",filter:"drop-shadow(0 0 10px rgba(212,168,83,0.45))"}}/>
            <div className="topbar-logo-text">DocWorks</div>
          </div>

          <div className="topbar-search">
            <span className="topbar-search-icon">🔍</span>
            <input
              value={topSearch}
              onChange={function(e){setTopSearch(e.target.value);if(view!=="dashboard")setView("dashboard");}}
              placeholder="Buscar operaciones, partes, domicilios..."
            />
          </div>

          <div className="topbar-right">
            <div className="topbar-avatar" onClick={function(){setView("configuracion");}}>
              {perfil.logoDataUrl
                ? <img src={perfil.logoDataUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                : (perfil.nombre?perfil.nombre[0].toUpperCase():"👤")
              }
            </div>
          </div>
        </div>

        {/* ── BODY: sidebar + main ── */}
        <div className="app-body">

          {/* ── Icon sidebar ── */}
          <aside className="sidebar">
            {navItems.map(function(n){
              return(
                <button key={n.id} className={"nav-item "+(view===n.id?"active":"")} onClick={function(){setView(n.id);}}>
                  <span>{n.icon}</span>
                  <span className="tooltip">{n.label}</span>
                </button>
              );
            })}
            <div className="sidebar-spacer"/>
            <div className="sidebar-bottom-icon" onClick={function(){setView("configuracion");}} title="Configuración">
              ⚙
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="main">
            <div className="content">
              {view==="dashboard"&&<DashboardView operaciones={operaciones} clausulas={clausulas} perfil={perfil} searchOverride={topSearch} onNew={function(){setEditOp(null);setFormTipo("reserva");setShowForm(true);}} onEdit={function(op){setEditOp(op);setFormTipo(op.tipo||"reserva");setShowForm(true);}} onDelete={deleteOp} onChangeEstado={changeEstado} onConvertir={convertirAContrato} onConvertirComodato={convertirAComodato} onConvertirRefuerzo={convertirARefuerzo} onConvertirBoleto={convertirABoleto} onDuplicar={duplicarOp} onViewDoc={function(op){abrirDoc(op);}} onPerfil={function(){setView("configuracion");}} papelera={papelera} onRestore={restoreOp} onDeletePermanente={deleteOpPermanente} onVaciarPapelera={vaciarPapelera} confirmVaciarPapelera={confirmVaciarPapelera} setConfirmVaciarPapelera={setConfirmVaciarPapelera} papeleraJump={papeleraJump}/>}
              {view==="calendario"&&<CalendarioView operaciones={operaciones} onViewOp={function(op){abrirDoc(op);}}/>}
              {view==="clausulas"&&<ClausulasView clausulas={clausulas} onAdd={addClausula} onEdit={editClausula} onDelete={deleteClausula} puedeEditar={perfil.rol==="dueno"||perfil.rol==="admin"} rolLabel={ROLES_DEF[perfil.rol]?.label||perfil.rol}/>}
              {view==="estadisticas"&&<EstadisticasView operaciones={operaciones} equipo={equipo}/>}
              {view==="configuracion"&&<ConfiguracionView perfil={perfil} onChange={setPerfil} darkMode={darkMode} onToggleDark={toggleDark} equipo={equipo} equipoSupabase={equipoSupabase} operaciones={operaciones} clausulas={clausulas} onAddClausula={addClausula} onEditClausula={editClausula} onDeleteClausula={deleteClausula} onMoveClausula={moveClausula} onDuplicateClausula={duplicateClausula} bloquesReserva={bloquesReserva} onUpdateBloqueReserva={updateBloqueReserva} onMoveBloqueReserva={moveBloqueReserva} papelera={papelera} auditLog={auditLog} onExportarRespaldo={exportarRespaldo} onImportarRespaldo={importarRespaldo} onVaciarAuditoria={function(){setAuditLog([]);}} puedeInstalar={!!deferredInstallPrompt} onInstalar={instalarApp}/>}
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
      {!showForm&&showBot&&<BotIA onClose={function(){setShowBot(false);}} operaciones={operaciones} clausulas={clausulas} onAddClausula={addClausula}/>}
      {!showForm&&(
        <button onClick={function(){setShowBot(function(v){return !v;});}} title="Asistente IA" style={{
          position:"fixed",bottom:80,right:20,zIndex:150,
          width:48,height:48,borderRadius:"50%",border:"none",cursor:"pointer",
          background:"linear-gradient(135deg,var(--gold),var(--gold2))",
          boxShadow:"0 4px 20px rgba(212,168,83,0.5)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:22,transition:"transform 0.2s",
        }}>✦</button>
      )}

      <Modal open={showForm} onClose={function(){setShowForm(false);setEditOp(null);setFormInitialOverride(null);}} title={editOp?"Editar operación":"Nueva operación"} wide={true} formTipo={formTipo}>
        <OperacionForm initial={editOp||formInitialOverride} clausulas={clausulas} perfil={perfil} equipo={equipo} operaciones={operaciones} onSave={saveOp} onCancel={function(){setShowForm(false);setEditOp(null);setFormInitialOverride(null);}} onTipoChange={function(t){setFormTipo(t);}} saveStatus={saveStatus} reportSave={reportSave} onAddClausula={addClausula}/>
      </Modal>
      <Modal open={!!viewDoc} onClose={function(){setViewDoc(null);setDocAutoAction(null);}} title="DocWorks" wide={true}
        headerExtra={viewDoc?<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <DocTabsBar op={viewDoc} tab={docTab} onChange={setDocTab}/>
          <Btn v="secondary" s="sm" onClick={function(){var op=viewDoc;setViewDoc(null);setDocAutoAction(null);setEditOp(op);setFormTipo(op.tipo||"reserva");setShowForm(true);}}>✏ Editar</Btn>
        </div>:null}>
        {viewDoc&&<DocumentViewer op={viewDoc} clausulas={clausulas} perfil={perfil} operaciones={operaciones} onToggleTarea={toggleTarea} tab={docTab} onChangeTab={setDocTab} autoAction={docAutoAction} onAutoActionDone={function(){setDocAutoAction(null);}}/>}
      </Modal>
      <ConfirmModal
        open={!!draftPrompt}
        title="Documento sin guardar"
        message={"Quedó un "+(draftPrompt?(TIPOS[draftPrompt.data.tipo]||"documento"):"documento")+" sin terminar de guardar (probablemente se cerró la pestaña mientras se cargaba). ¿Querés continuar editándolo como borrador?"}
        confirmLabel="Continuar editando"
        cancelLabel="Descartar"
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
      <SesionBadge contexto={ctx} onLogout={docworksAuth.logout}/>
    </>
  );
}
