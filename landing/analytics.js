(function(){
 'use strict';
 var config=window.DOCWORKS_ANALYTICS||{};
 if(!config.enabled||!/^\/(?!\/)[a-zA-Z0-9_./-]+\/script\.js$/.test(config.scriptPath||''))return;
 window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
 // Eliminar query/hash antes de transmitir una visita. No medir formularios.
 window.va('beforeSend',function(event){if(event.type!=='pageview')return null;try{var url=new URL(event.url);return Object.assign({},event,{url:url.origin+url.pathname});}catch(e){return null;}});
 var script=document.createElement('script');script.defer=true;script.src=config.scriptPath;document.head.appendChild(script);
 var eventos=['cta_prueba','pedir_demo','registro_intentado','registro_enviado'];
 window.dwTrack=function(nombre){if(config.customEvents&&eventos.indexOf(nombre)!==-1)window.va('event',{name:nombre});};
 document.addEventListener('click',function(event){var link=event.target.closest&&event.target.closest('a');if(!link)return;if(link.getAttribute('href')==='#registro')window.dwTrack('cta_prueba');if(link.dataset.event==='pedir_demo')window.dwTrack('pedir_demo');});
})();
