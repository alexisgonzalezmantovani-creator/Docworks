// Función compartida por PDF, DOCX y vista previa.
export function contactosDocumento(doc){
  return (doc&&doc.contactosIndividuales||[]).map(function(p){
    return String(p.rol||"")+": "+String(p.nombre||"—")+
      (p.telefono?" — Tel.: "+p.telefono:"")+(p.email?" — Correo: "+p.email:"");
  });
}

// Parámetros compartidos de exportación PDF/DOCX. Las medidas se expresan en puntos
// reales; cada generador convierte a su unidad nativa (PDF points / Word twips).
export const DOC_EXPORT_LAYOUT = {
  bodySize:10.5, lineHeight:13.5, paragraphAfter:8, paragraphBefore:0,
  marginTop:62, marginBottom:66, marginSide:54,
  titleSize:15, subtitleSize:10, signatureSize:8, signatureRoleSize:8,
  signatureGap:62, signatureLabelGap:36
};
export function docxTwipsFromPt(pt){ return Math.round(pt*20); }


export function pdfStr(s){ return s.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)"); }

// Generadores originales trasladados sin alterar su cuerpo.

export async function generarPDFModulo(doc, logoDataUrl, perfil, deps) {
  const { cuerpoTrasRotulo, hexToRgb01, latin1Safe, nombreArchivoExportacion, normalizarTextoDocumento, normalizeLogoImage, prefijoClausulaDesdeNumTitulo, prefijoClausulaFormal, rgbPdfStr, strToLatin1Bytes, textWidthPt, tintRgb, tipoIdentificacion } = deps;
  return (async function (doc, logoDataUrl, perfil) {
  try {
    // Page dimensions: A4 in points (1pt = 1/72 inch)
    var W=595, H=842, ML=DOC_EXPORT_LAYOUT.marginSide, MR=DOC_EXPORT_LAYOUT.marginSide, MT=DOC_EXPORT_LAYOUT.marginTop, MB=DOC_EXPORT_LAYOUT.marginBottom;
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
    // Times-Roman tiene métricas más estrechas que Helvetica; adaptar medición
    // solo en el estilo clásico para evitar cortes y saltos de línea erróneos.
    var FONT_WSCALE = esClasico ? 0.94 : 1;
    var FONT_REG = esClasico?"Times-Roman":"Helvetica";
    var FONT_BOLD = esClasico?"Times-Bold":"Helvetica-Bold";
    function mw(str,size,bold){ return textWidthPt(str,size,bold)*FONT_WSCALE; }
    function fitPdfTextSize(str,initial,minSize,maxW,bold){
      var size=initial;
      while(size>minSize && mw(str,size,bold)>maxW) size=Math.max(minSize,size-0.5);
      return size;
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

    function text(x,yy,txt,size,bold,wordSpacing=undefined,colorRgb=undefined){
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
    function hline(yy,grayVal=undefined,colorRgb=undefined,thickness=undefined){
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
        var txt=latin1Safe(value), fs=fitPdfTextSize(txt,size,8,maxWidth||W-ML-MR,!!bold), tw=mw(txt,fs,!!bold), x=alignX(pos,tw);
        text(x,yy,txt,fs,!!bold);
      }
      if(ubicacionPie){
        drawFooterText("Ubicación: "+safeHeaderValue(perfil.direccion),"centro",43,6.8,false,W-ML-MR);
      }
      var logoMiniY=3;
      if(pieLogoActivo){
        var miniScale=(perfil&&perfil.pie_pagina_logo_scale)||100;
        var miniMaxH=Math.max(10,Math.min(22,15*(miniScale/100)));
        var logoAr2=logoInfo.width/logoInfo.height, miniW=miniMaxH*logoAr2;
        var miniX=alignX(perfil.pie_pagina_logo_posicion||"centro",miniW);
        lines.push("q "+miniW.toFixed(2)+" 0 0 "+miniMaxH.toFixed(2)+" "+miniX.toFixed(2)+" "+logoMiniY.toFixed(2)+" cm /Im1 Do Q");
      }
      if(leyendaActiva){
        drawFooterText(perfil.pie_pagina_texto,"centro",29,7,false,W-ML-MR);
      }
      if(numeroActivo){
        drawFooterText("Página "+pageNum,perfil.pie_pagina_numero_posicion||"derecha",15,7,false,W-ML-MR);
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
          var fs=fitPdfTextSize(v,metaSize,8,maxHeaderW,false);
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
          var fs=fitPdfTextSize(v,metaSize,8,maxHeaderW,false);
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
    var tituloTxt=String(doc.titulo||"").toUpperCase();
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
    text(ML,y,"Lugar: "+(doc.ciudad||"")+"   |   Fecha: "+(doc.fecha||""),DOC_EXPORT_LAYOUT.subtitleSize,false); y-=18;
    hline(y); y-=22;
    if(esClasico){ hline(y+3,0.3,null,0.75); y-=4; } // doble filete clásico bajo la línea de lugar/fecha

    // Dibuja un párrafo justificado con ajuste real de ancho (Helvetica),
    // con salto de línea con sangría francesa para los renglones siguientes.
    // prefixRuns: array de {txt, bold} que abre el párrafo en negrita (rótulo/número).
    function textCentered(cx,yy,txt,size,bold,wordSpacing=undefined,colorRgb=undefined){
      var safe=latin1Safe(txt);
      if(!safe) return;
      var w=textWidthPt(safe,size,bold);
      text(cx-w/2,yy,safe,size,bold,wordSpacing,colorRgb);
    }

    function drawParagraph(prefixRuns, bodyText, opts:{size?:number;gap?:number;indent?:number;spaceAfter?:number}={}){
      opts=opts||{};
      var size=opts.size||DOC_EXPORT_LAYOUT.bodySize, gap=opts.gap||DOC_EXPORT_LAYOUT.lineHeight, indent=opts.indent||16;
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
      var rolesContactosImpresos={};
      doc.partes.forEach(function(parte){
        ensureSpace(56);
        text(ML,y,String(parte.rol||"").toUpperCase()+": "+(parte.nombre||"\u2014"),DOC_EXPORT_LAYOUT.bodySize,true); y-=14;
        if(parte.dni){text(ML+10,y,tipoIdentificacion(parte.dni,parte)+": "+parte.dni,9,false);y-=12;}
        if(parte.domicilio){text(ML+10,y,"Domicilio: "+parte.domicilio,9,false);y-=12;}
        if(parte.telefono){text(ML+10,y,"Teléfono: "+parte.telefono,9,false);y-=12;}
        if(parte.email){text(ML+10,y,"Correo: "+parte.email,9,false);y-=12;}
        var rolContacto=String(parte.rol||"").toUpperCase();
        if(!rolesContactosImpresos[rolContacto]){
          rolesContactosImpresos[rolContacto]=true;
          (doc.contactosIndividuales||[]).filter(function(c){return c.rol===rolContacto;}).forEach(function(c){
            ensureSpace(18);text(ML+10,y,c.nombre+(c.telefono?" — Tel.: "+c.telefono:"")+(c.email?" — Correo: "+c.email:""),9,false);y-=14;
          });
        }
        y-=10;
      });
      hline(y); y-=20;
    } else if(contactosDocumento(doc).length){
      ensureSpace(28);
      text(ML,y,"DATOS DE CONTACTO",10,true,0,labelColor); y-=18;
      contactosDocumento(doc).forEach(function(l){ ensureSpace(18); text(ML,y,l,9,false); y-=14; });
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
    var firmaBlank = DOC_EXPORT_LAYOUT.signatureGap;
    var firmaLabels = DOC_EXPORT_LAYOUT.signatureLabelGap;
    var huboInmobEnFirmas=false;
    // Igual que Word: máximo tres firmantes por fila. Con cuatro o más,
    // el cálculo anterior comprimía todas las firmas en una única línea.
    var firmasPorFilaPdf=3;
    if(nFirm){
      var colW=(W-ML-MR)/firmasPorFilaPdf;
      var sigW=Math.min(160,Math.max(100,colW-16));
      for(var inicioFirmaPdf=0;inicioFirmaPdf<nFirm;inicioFirmaPdf+=firmasPorFilaPdf){
        ensureSpace(firmaBlank+firmaLabels+24);
        hline(y); y-=14;
        y-=firmaBlank;
        firmantesPpales.slice(inicioFirmaPdf,inicioFirmaPdf+firmasPorFilaPdf).forEach(function(p,i){
          var cx=ML+i*colW+colW/2;
          var nombreFirma=p.usarPerfil?((perfil&&perfil.nombre)||"Inmobiliaria interviniente"):p.nombre;
          var rolFirma=p.usarPerfil?(p.rol+((perfil&&perfil.matricula)?" — Mat. "+perfil.matricula:"")):p.rol;
          if(p.usarPerfil) huboInmobEnFirmas=true;
          lines.push("0.5 G 0.6 w "+(cx-sigW/2)+" "+y+" m "+(cx+sigW/2)+" "+y+" l S 0 G");
          textCentered(cx,y-12,rolFirma||"",8,false);
          textCentered(cx,y-24,nombreFirma||"",8,true);
          if(p.dni) textCentered(cx,y-35,tipoIdentificacion(p.dni,p)+": "+p.dni,8,false);
        });
        y-=firmaLabels;
      }
    }
    if(!huboInmobEnFirmas){
      ensureSpace(firmaBlank + 28);
      y -= Math.min(firmaBlank, 40);
      textCentered(ML+(W-ML-MR)/2,y,"________________________",9,false);
      textCentered(ML+(W-ML-MR)/2,y-14,"INMOBILIARIA INTERVINIENTE"+(perfil&&perfil.nombre?" — "+perfil.nombre:""),8,false);
      y -= 28;
    }

    // Presta Conformidad + firma de la parte correspondiente con el mismo aire para
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
      textCentered(cxConformidad,y-12,doc.conformidad.rol||"VENDEDOR",8,false);
      textCentered(cxConformidad,y-24,doc.conformidad.firmante||"",8,true);
      if(doc.conformidad.dni) textCentered(cxConformidad,y-35,tipoIdentificacion(doc.conformidad.dni,doc.conformidad)+": "+doc.conformidad.dni,8,false);
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
      }catch(ex){ console.warn("DocWorks: no se pudo incrustar el logo en el PDF.",ex); }
    }
    var imgResourceStr = imgRealNum ? " /XObject << /Im1 "+imgRealNum+" 0 R >>" : "";

    var kidsRefs=[];
    var totalPages=pagesContent.length;
    pagesContent.forEach(function(content){
      var pageObjNum = addObj("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+H+"] /Contents "+(objects.length+2)+" 0 R /Resources << /Font << /F1 "+font1+" 0 R /F2 "+font2+" 0 R >>"+imgResourceStr+" >> >>");
      var contentLatin1=latin1Safe(content);
      var contentBytes=strToLatin1Bytes(contentLatin1);
      var contentObjNum = addObj("<< /Length "+contentBytes.length+" >>\nstream\n"+contentLatin1+"\nendstream");
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
    var filename=nombreArchivoExportacion(doc,"pdf");
    return {blob:blob, filename:filename};
  } catch(e) {
    throw new Error("Error generando el PDF: "+(e&&e.message?e.message:"error desconocido"));
  }
})(...[doc, logoDataUrl, perfil]);
}

export async function generarDOCXModulo(doc, perfil, deps) {
  const { base64ToU8, buildZip, cuerpoTrasRotulo, docxHeaderBox, hexToDocx, lightenHex, nombreArchivoExportacion, normalizarTextoDocumento, normalizeLogoImage, prefijoClausulaDesdeNumTitulo, prefijoClausulaFormal, pxBase, pxRunsBase, tipoIdentificacion, u8 } = deps;
  return (async function (doc, perfil) {
  try {
    // Build document body XML
    var body = "";

    // Estilo de plantilla y colores de marca (personalización por inmobiliaria):
    // clásico usa tipografía serif y se mantiene en negro (sin color de marca);
    // minimalista y corporativo usan el color primario para rótulos y una
    // sans-serif contemporánea.
    var estiloD = (perfil&&perfil.plantillaEstilo)||"corporativo";
    var esClasicoD = estiloD==="clasico";
    var DOCX_DEFAULT_FONT = esClasicoD ? "Times New Roman" : "Arial";
    var DOCX_COLOR_PRIM = esClasicoD ? "1A1A1A" : hexToDocx((perfil&&perfil.colorPrimario)||"#142a4d");
    var DOCX_COLOR_SEC = hexToDocx((perfil&&perfil.colorSecundario)||"#c9a227");
    var DOCX_BORDER_COLOR = esClasicoD ? "999999" : lightenHex(DOCX_COLOR_SEC, 0.35);
    var docxStyle = {font:DOCX_DEFAULT_FONT,colorPrim:DOCX_COLOR_PRIM,colorSec:DOCX_COLOR_SEC,borderColor:DOCX_BORDER_COLOR};
    // Wrappers locales: cada párrafo captura el estilo de esta exportación.
    // El contexto nunca se guarda en variables globales mutables.
    var px = function(value, opts) { return pxBase(value, Object.assign({}, opts||{}, {_docxStyle:docxStyle})); };
    var pxRuns = function(runs, opts) {
      return pxRunsBase(runs, Object.assign({}, opts||{}, {_docxStyle:docxStyle}));
    };

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
        body += '<w:p><w:pPr><w:jc w:val="'+jcVal+'"/><w:spacing w:before="0" w:after="80" w:line="' + Math.max(300,Math.round(dispH*15)) + '" w:lineRule="atLeast"/></w:pPr><w:r><w:drawing>'
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
      var perfilNombreSeguro=String((perfil&&perfil.nombre)||"").trim();
      var perfilMatriculaSegura=String((perfil&&perfil.matricula)||"").trim();
      var cabeceraDocx=encNombreD?(perfilNombreSeguro.toUpperCase()+(encMatriculaD&&perfilMatriculaSegura?" — Matrícula: "+perfilMatriculaSegura:"")):(encMatriculaD&&perfilMatriculaSegura?"Matrícula: "+perfilMatriculaSegura:"");
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
    body += px(String(doc.titulo||"").toUpperCase(), {bold:true, size:DOC_EXPORT_LAYOUT.titleSize, center:true, spacing:{before:160,after:60}});
    if (doc.subtitulo) body += px(doc.subtitulo, {size:DOC_EXPORT_LAYOUT.subtitleSize, center:true, color:"555555", spacing:{before:0,after:60}});
    if (doc.nroRecibo) body += px("N° "+doc.nroRecibo, {bold:true, size:12, center:true, spacing:{before:40,after:80}});
    body += px("", {border:true, spacing:{before:60,after:60}});
    body += px("Lugar: "+(doc.ciudad||"")+"  —  Fecha: "+(doc.fecha||""), {size:DOC_EXPORT_LAYOUT.subtitleSize, spacing:{before:80,after:80}});
    body += px("", {border:true, spacing:{before:60,after:120}});

    // Introducción / preámbulo (todos los tipos). Toggle: perfil.mostrar_introduccion
    if (doc.encabezado) {
      doc.encabezado.split("\n\n").forEach(function(par) {
        if (par.trim()) body += px(par.trim(), {size:10.5, spacing:{before:80,after:80}, justify:true});
      });
      body += px("", {spacing:{before:40,after:40}});
    }

    // Partes
    if (doc.partes && doc.partes.length && !doc.ocultarPartesEnCuerpo) {
      body += px("PARTES INTERVINIENTES", {bold:true, size:11, spacing:{before:120,after:100}});
      var rolesContactosImpresos={};
      doc.partes.forEach(function(parte) {
        body += px(String(parte.rol||"").toUpperCase()+": "+(parte.nombre||"—"), {bold:true, size:DOC_EXPORT_LAYOUT.bodySize, spacing:{before:100,after:30}});
        if (parte.dni) body += px(tipoIdentificacion(parte.dni,parte)+": "+parte.dni, {size:9, color:"444444", spacing:{before:0,after:20}});
        if (parte.domicilio) body += px("Domicilio: "+parte.domicilio, {size:9, color:"444444", spacing:{before:0,after:20}});
        if (parte.telefono) body += px("Teléfono: "+parte.telefono, {size:9, color:"444444", spacing:{before:0,after:20}});
        if (parte.email) body += px("Correo: "+parte.email, {size:9, color:"444444", spacing:{before:0,after:20}});
        var rolContacto=String(parte.rol||"").toUpperCase();
        if(!rolesContactosImpresos[rolContacto]){
          rolesContactosImpresos[rolContacto]=true;
          (doc.contactosIndividuales||[]).filter(function(c){return c.rol===rolContacto;}).forEach(function(c){
            body += px(c.nombre+(c.telefono?" — Tel.: "+c.telefono:"")+(c.email?" — Correo: "+c.email:""), {size:9,color:"444444",spacing:{before:0,after:20}});
          });
        }
      });
      body += px("", {border:true, spacing:{before:120,after:120}});
    } else if (contactosDocumento(doc).length) {
      body += px("DATOS DE CONTACTO", {bold:true, size:11, spacing:{before:120,after:100}});
      contactosDocumento(doc).forEach(function(l){ body += px(l, {size:9, color:"444444", spacing:{before:0,after:20}}); });
      body += px("", {border:true, spacing:{before:120,after:120}});
    }

    // Secciones — rótulo en negrita + texto corrido en el mismo párrafo, justificado.
    // Todos los tipos de documento. El espacio tras ":" va al inicio de la base
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

    // Firmas: grilla horizontal de tres columnas, como en el PDF.
    // Cada fila se mantiene junta para evitar firmas partidas entre páginas.
    body += px("", {border:true, spacing:{before:140,after:100}});
    body += px("FIRMAS", {bold:true, size:DOC_EXPORT_LAYOUT.signatureSize+3, center:true, spacing:{before:100,after:90}});
    var firmantesPpalesDocx = (doc.firmas && doc.firmas.length) ? doc.firmas.slice() : (doc.partes||[]).slice();
    var huboInmobEnFirmasDocx = firmantesPpalesDocx.some(function(f){return !!f.usarPerfil;});
    if (!huboInmobEnFirmasDocx) firmantesPpalesDocx.push({rol:"INMOBILIARIA INTERVINIENTE",usarPerfil:true});
    var firmasPorFilaDocx = 3;
    var anchoCeldaFirmaDocx = 3240;
    function celdaFirmaDocx(parte){
      var nombreFirma = parte.usarPerfil ? ((perfil&&perfil.nombre)||"Inmobiliaria interviniente") : (parte.nombre||"");
      var rolFirma = parte.usarPerfil ? ((parte.rol||"INMOBILIARIA INTERVINIENTE")+((perfil&&perfil.matricula)?" — Mat. "+perfil.matricula:"")) : (parte.rol||"");
      var contenido = px("________________________", {size:DOC_EXPORT_LAYOUT.signatureSize,center:true,spacing:{before:docxTwipsFromPt(Math.min(DOC_EXPORT_LAYOUT.signatureGap,58)),after:35}})
        + px(rolFirma,{size:DOC_EXPORT_LAYOUT.signatureRoleSize,color:"555555",center:true,spacing:{before:0,after:12}})
        + px(nombreFirma,{size:DOC_EXPORT_LAYOUT.signatureSize,bold:true,center:true,spacing:{before:0,after:12}});
      if(parte.dni) contenido += px(tipoIdentificacion(parte.dni,parte)+": "+parte.dni,{size:8.5,color:"666666",center:true,spacing:{before:0,after:20}});
      return '<w:tc><w:tcPr><w:tcW w:w="'+anchoCeldaFirmaDocx+'" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>'+contenido+'</w:tc>';
    }
    body += '<w:tbl><w:tblPr><w:tblW w:w="9720" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="3240"/><w:gridCol w:w="3240"/><w:gridCol w:w="3240"/></w:tblGrid>';
    for (var firmaInicioDocx=0; firmaInicioDocx<firmantesPpalesDocx.length; firmaInicioDocx+=firmasPorFilaDocx){
      body += '<w:tr><w:trPr><w:cantSplit/></w:trPr>';
      for (var firmaColDocx=0;firmaColDocx<firmasPorFilaDocx;firmaColDocx++){
        var firmaActualDocx=firmantesPpalesDocx[firmaInicioDocx+firmaColDocx];
        body += firmaActualDocx ? celdaFirmaDocx(firmaActualDocx) : '<w:tc><w:tcPr><w:tcW w:w="3240" w:type="dxa"/></w:tcPr><w:p/></w:tc>';
      }
      body += '</w:tr>';
    }
    body += '</w:tbl>';

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
      body += px("________________________", {size:DOC_EXPORT_LAYOUT.signatureSize, center:true, spacing:{before:docxTwipsFromPt(DOC_EXPORT_LAYOUT.signatureGap),after:35}});
      body += px(doc.conformidad.rol||"VENDEDOR", {size:9, color:"555555", center:true, spacing:{before:0,after:12}});
      body += px(doc.conformidad.firmante||"", {size:10, bold:true, center:true, spacing:{before:0,after:14}});
      if (doc.conformidad.dni) body += px(tipoIdentificacion(doc.conformidad.dni,doc.conformidad)+": "+doc.conformidad.dni, {size:9, color:"444444", center:true, spacing:{before:0,after:90}});
    }

    // El pie se genera como footer real de Word (por página), no como contenido
    // al final de la base. Así el número de página, la ubicación, la leyenda y el
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
        var miniMaxHpx=Math.max(22,Math.min(46,32*(miniScalePct/100)));
        var miniFitScale=miniMaxHpx/logoInfo.height;
        var miniDispW=Math.max(1,Math.round(logoInfo.width*miniFitScale));
        var miniDispH=Math.max(1,Math.round(logoInfo.height*miniFitScale));
        var miniCx=miniDispW*9525, miniCy=miniDispH*9525;
        var miniJc=perfil.pie_pagina_logo_posicion==="izquierda"?"left":perfil.pie_pagina_logo_posicion==="derecha"?"right":"center";
        footerBody += '<w:p><w:pPr><w:jc w:val="'+miniJc+'"/><w:spacing w:before="20" w:after="10" w:line="' + Math.max(300,Math.round(miniDispH*15)) + '" w:lineRule="atLeast"/></w:pPr><w:r><w:drawing>'
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
      + '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
      + (footerHasAnything ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' : '')
      + '</Types>';

    var RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';

    var DOC_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
      + (logoInfo ? '<Relationship Id="rIdLogo1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo1.jpeg"/>' : '')
      + (footerHasAnything ? '<Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' : '')
      + '</Relationships>';

    var FOOTER_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + ((footerHasAnything && perfil.pie_pagina_logo_debajo && logoInfo) ? '<Relationship Id="rIdFooterLogo1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo1.jpeg"/>' : '')
      + '</Relationships>';

    var sectPr = '<w:sectPr>'
      + (footerHasAnything ? '<w:footerReference w:type="default" r:id="rIdFooter1"/>' : '')
      + '<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1240" w:right="1080" w:bottom="1520" w:left="1080" w:header="600" w:footer="420"/>'
      + '</w:sectPr>';

    var STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="'+DOCX_DEFAULT_FONT+'" w:hAnsi="'+DOCX_DEFAULT_FONT+'" w:cs="'+DOCX_DEFAULT_FONT+'"/><w:sz w:val="'+(DOC_EXPORT_LAYOUT.bodySize*2)+'"/><w:szCs w:val="'+(DOC_EXPORT_LAYOUT.bodySize*2)+'"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.paragraphAfter)+'" w:line="'+docxTwipsFromPt(DOC_EXPORT_LAYOUT.lineHeight)+'" w:lineRule="exact"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>';

var DOC = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>'+body+sectPr+'</w:body></w:document>';

    var FOOTER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'+footerBody+'</w:ftr>';

    var files = [
      {name:"[Content_Types].xml", data:u8(CT)},
      {name:"_rels/.rels",         data:u8(RELS)},
      {name:"word/document.xml",   data:u8(DOC)},
      {name:"word/styles.xml",      data:u8(STYLES)},
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
    var filename = nombreArchivoExportacion(doc,"docx");
    return {blob:blob, filename:filename};
  } catch(e) {
    throw new Error("Error generando el documento Word: "+(e&&e.message?e.message:"error desconocido"));
  }
})(...[doc, perfil]);
}

export function hexToRgb01(hex){
  var h=(hex||"").replace("#","");
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length!==6) h="14213d";
  var r=parseInt(h.substr(0,2),16)/255, g=parseInt(h.substr(2,2),16)/255, b=parseInt(h.substr(4,2),16)/255;
  return {r:r,g:g,b:b};
}

export function rgbPdfStr(c){ return c.r.toFixed(3)+" "+c.g.toFixed(3)+" "+c.b.toFixed(3); }

export function tintRgb(c,amount){ return {r:c.r+(1-c.r)*amount, g:c.g+(1-c.g)*amount, b:c.b+(1-c.b)*amount}; }

export function hexToDocx(hex){
  var h=(hex||"").replace("#","");
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length!==6) h="14213D";
  return h.toUpperCase();
}

export function normalizarNombreArchivoParte(v){
  return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60);
}

export function numeroALetras(num) {
  num = Math.floor(Math.abs(Number(num) || 0));
  if (num === 0) return "CERO";
  if (num > 999999999) return String(num);
  var UNI = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  function unidades(n) { return UNI[n] || ""; }
  function decenas(n) {
    if (n < 10) return unidades(n);
    var d = Math.floor(n / 10), u = n % 10;
    if (d === 1) {
      var esp = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
      return esp[u];
    }
    if (d === 2) {
      var vei = ["VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
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
  function apocope(s) { return s.replace(/UNO$/, "UN").replace(/VEINTIUN$/, "VEINTIÚN"); }
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
    if (c > 0) out += (c === 1 ? "UN MILLÓN" : apocope(miles(c)) + " MILLONES");
    if (r > 0) out += (out ? " " : "") + miles(r);
    return out;
  }
  return millones(num).trim();
}

export function codigoMonedaLegal(moneda) {
  return moneda === "USD" ? "USD" : "ARS";
}

export function prefijoMonedaLegal(moneda) {
  return moneda === "USD" ? "DÓLARES ESTADOUNIDENSES BILLETE" : "PESOS ARGENTINOS";
}
