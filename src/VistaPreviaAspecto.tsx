import React, {useCallback, useEffect, useRef, useState} from 'react';

const PDF_ASSETS='/pdfjs-6.5.438/';

function HojaPDF({documento,pagina,ampliada=false,onRendered=undefined}){
  const caja=useRef(null),canvas=useRef(null);
  const [error,setError]=useState('');
  useEffect(function(){
    if(!documento||!caja.current)return;
    let vigente=true,render=null,secuencia=Promise.resolve(),frame=0,ultimaCaja='';
    function dibujar(){
      if(render)render.cancel();
      secuencia=secuencia.catch(function(){}).then(async function(){
        if(!vigente)return;
        const hoja=await documento.getPage(pagina);
        if(!vigente||!canvas.current)return;
        const original=hoja.getViewport({scale:1});
        const ancho=Math.max(100,caja.current.clientWidth-24);
        const alto=Math.max(180,ampliada?window.innerHeight-170:window.innerHeight-Math.max(12,caja.current.getBoundingClientRect().top)-48);
        const escala=Math.min(ancho/original.width,alto/original.height,ampliada?2:1);
        const viewport=hoja.getViewport({scale:escala});
        const pixelRatio=Math.min(window.devicePixelRatio||1,2);
        const elemento=canvas.current;
        elemento.width=Math.ceil(viewport.width*pixelRatio);elemento.height=Math.ceil(viewport.height*pixelRatio);
        elemento.style.width=viewport.width+'px';elemento.style.height=viewport.height+'px';
        render=hoja.render({canvas:elemento,canvasContext:elemento.getContext('2d'),viewport,transform:pixelRatio===1?null:[pixelRatio,0,0,pixelRatio,0,0]});
        try{await render.promise;if(vigente){setError('');onRendered?.(documento);}}catch(e){if(vigente&&e.name!=='RenderingCancelledException'){setError('No se pudo dibujar la hoja. Intentá nuevamente.');onRendered?.(documento);}}
      }).catch(function(e){if(vigente&&e.name!=='RenderingCancelledException'){setError('No se pudo dibujar la hoja. Intentá nuevamente.');onRendered?.(documento);}});
    }
    // El canvas cambia la altura observada. Dibujar dentro de la notificación
    // dispara un ciclo de ResizeObserver en WebKit; medir una vez por frame y
    // descartar notificaciones con las mismas dimensiones evita ese ciclo.
    function solicitarDibujo(){
      if(frame||!vigente)return;
      frame=requestAnimationFrame(function(){
        frame=0;if(!vigente||!caja.current)return;
        const medida=[caja.current.clientWidth,caja.current.getBoundingClientRect().top,window.innerHeight,window.devicePixelRatio||1].join('|');
        if(medida===ultimaCaja)return;
        ultimaCaja=medida;dibujar();
      });
    }
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(solicitarDibujo):null;
    observer?.observe(caja.current);window.addEventListener('resize',solicitarDibujo);solicitarDibujo();
    return function(){vigente=false;if(frame)cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('resize',solicitarDibujo);if(render)render.cancel();};
  },[documento,pagina,ampliada,onRendered]);
  return <div ref={caja} className="dw-pdf-sheet">{error&&<p role="alert">{error}</p>}<canvas ref={canvas} aria-label={'Vista previa del PDF, página '+pagina} role="img"/></div>;
}

export function VistaPreviaAspecto({perfil,generarPDF}){
  const [documento,setDocumento]=useState(null),[pagina,setPagina]=useState(1),[error,setError]=useState(''),[cargando,setCargando]=useState(true),[ampliada,setAmpliada]=useState(false),[intento,setIntento]=useState(0);
  const cerrarRef=useRef(null),workerRef=useRef(null),tareasRef=useRef<Set<{destroy:()=>Promise<void>}>>(new Set()),mostradaRef=useRef(null),retiradasRef=useRef([]),solicitudRef=useRef(0);
  // Los cambios de sesión, permisos u otros metadatos no alteran la apariencia.
  const visual={};
  Object.keys(perfil||{}).sort().forEach(function(key){
    if(/^(nombre|matricula|direccion|web|telefono|email|plantillaEstilo|mostrar_introduccion)$/.test(key)||/^(logo|color|encabezado|pie_pagina|ubicacion)/.test(key))visual[key]=perfil[key];
  });
  const perfilJSON=JSON.stringify(visual);
  const alDibujar=useCallback(function(pdf){
    if(mostradaRef.current?.pdf!==pdf||mostradaRef.current?.solicitud!==solicitudRef.current)return;
    setCargando(false);
    retiradasRef.current.splice(0).forEach(function(tarea){tareasRef.current.delete(tarea);tarea.destroy().catch(function(){});});
  },[]);
  useEffect(function(){return function(){
    tareasRef.current.forEach(function(tarea){tarea.destroy().catch(function(){});});
    tareasRef.current.clear();retiradasRef.current=[];mostradaRef.current=null;
    workerRef.current?.destroy();workerRef.current=null;
  };},[]);
  useEffect(function(){
    let vigente=true,tarea=null;
    const solicitud=++solicitudRef.current;
    setCargando(true);setError('');
    const timer=setTimeout(async function(){
      try{
        const resultado=await generarPDF(JSON.parse(perfilJSON));
        if(!vigente)return;
        if(!resultado?.blob)throw new Error('PDF no disponible');
        const ruta=PDF_ASSETS+'pdf.min.mjs';
        const pdfjs=await import(/* @vite-ignore */ ruta);
        if(!vigente)return;
        pdfjs.GlobalWorkerOptions.workerSrc=PDF_ASSETS+'pdf.worker.min.mjs';
        const datos=new Uint8Array(await resultado.blob.arrayBuffer());if(!vigente)return;
        // Reutilizar el worker evita arrancarlo otra vez con cada ajuste.
        if(!workerRef.current)workerRef.current=new pdfjs.PDFWorker();
        tarea=pdfjs.getDocument({data:datos,worker:workerRef.current,standardFontDataUrl:PDF_ASSETS+'standard_fonts/',wasmUrl:PDF_ASSETS+'wasm/'});
        tareasRef.current.add(tarea);
        const pdf=await tarea.promise;
        if(!vigente){tareasRef.current.delete(tarea);await tarea.destroy();return;}
        if(mostradaRef.current)retiradasRef.current.push(mostradaRef.current.tarea);
        mostradaRef.current={pdf:pdf,tarea:tarea,solicitud:solicitud};
        setDocumento(pdf);setPagina(function(p){return Math.min(p,pdf.numPages);});
      }catch(e){if(vigente){setError('No se pudo generar la vista previa. Volvé a intentar.');setCargando(false);}}
    },mostradaRef.current?160:0);
    return function(){
      vigente=false;clearTimeout(timer);
      // La hoja anterior sigue visible hasta que la nueva termina de dibujarse.
      if(tarea&&mostradaRef.current?.tarea!==tarea){tareasRef.current.delete(tarea);tarea.destroy().catch(function(){});}
    };
  },[perfilJSON,generarPDF,intento]);
  useEffect(function(){
    if(!ampliada)return;
    const anterior=document.activeElement;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';cerrarRef.current?.focus();
    function teclado(e){if(e.key==='Escape')setAmpliada(false);if(e.key==='Tab'){e.preventDefault();cerrarRef.current?.focus();}}
    window.addEventListener('keydown',teclado);
    return function(){document.body.style.overflow=overflow;window.removeEventListener('keydown',teclado);if(anterior instanceof HTMLElement)anterior.focus();};
  },[ampliada]);
  return <section className="dw-pdf-preview" aria-label="Vista previa del documento" aria-busy={cargando}>
    <div className="dw-pdf-toolbar"><strong>Vista previa {documento&&cargando&&<span role="status" aria-label="Actualizando vista previa" className="dw-pdf-updating"/>}</strong><button type="button" className="btn btn-secondary btn-sm" disabled={!documento} onClick={function(){setAmpliada(true);}}>Ampliar ↗</button></div>
    {cargando&&!documento&&<div role="status" className="dw-pdf-status">Preparando vista previa…</div>}
    {error&&<div role="alert" className="dw-pdf-status">{error}<button type="button" className="btn btn-secondary btn-sm" onClick={function(){setIntento(intento+1);}}>Reintentar</button></div>}
    {documento&&<><HojaPDF documento={documento} pagina={pagina} onRendered={alDibujar}/><div className="dw-pdf-pagination"><button type="button" className="btn btn-ghost btn-sm" aria-label="Página anterior" disabled={pagina<=1} onClick={function(){setPagina(pagina-1);}}>‹</button><span>Página {pagina} de {documento.numPages}</span><button type="button" className="btn btn-ghost btn-sm" aria-label="Página siguiente" disabled={pagina>=documento.numPages} onClick={function(){setPagina(pagina+1);}}>›</button></div></>}
    {ampliada&&<div className="dw-pdf-overlay" role="dialog" aria-modal="true" aria-label="Documento ampliado"><div className="dw-pdf-expanded"><div className="dw-pdf-toolbar"><strong>Vista previa · página {pagina}</strong><button ref={cerrarRef} type="button" className="btn btn-secondary btn-sm" onClick={function(){setAmpliada(false);}}>Cerrar ✕</button></div>{documento?<HojaPDF documento={documento} pagina={pagina} ampliada/>:<p role="status">Actualizando vista previa…</p>}</div></div>}
  </section>;
}
