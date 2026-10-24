// Módulo extraído sin modificar las declaraciones originales.
export var SUPABASE_URL = "https://xpjiydwjawjizubyldtk.supabase.co";

export var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwaml5ZHdqYXdqaXp1YnlsZHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDYzMzcsImV4cCI6MjEwMzc4MjMzN30.Mi5DilpMg_EGkNZX_ht6jtrmXX9_9Q-Xyo4hnWDEIvI";

var supabaseClient = null;
var supabasePromise = null;
// 4.27 — Sesión guardada por Supabase en este dispositivo (clave sb-<ref>-auth-token).
export function dwHaySesionGuardada(){
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i)||"";
      if(k.indexOf("sb-")===0 && k.slice(-11)==="-auth-token" && localStorage.getItem(k)) return true;
    }
  }catch(e){}
  return false;
}
// 4.29 — Cliente sin navigator.locks (en iPad/iPhone un lock colgado hacía fallar getSession y mandaba al login).
export function dwCrearCliente(){
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,lock:function(name,acquireTimeout,fn){return fn();}}});
}
// 4.29 — Recupera la sesión guardada con reintentos: refrescar la página nunca debe cerrar la sesión por lentitud.
export async function dwObtenerSesionRobusta(sb){
  var hay=dwHaySesionGuardada(), ultimo=null;
  for(var i=0;i<5;i++){
    try{
      var r=await sb.auth.getSession();
      if(r && r.data && r.data.session) return r;
      ultimo=r;
      if(!hay) return r;
      try{
        var rf=await sb.auth.refreshSession();
        if(rf && rf.data && rf.data.session) return {data:{session:rf.data.session},error:null};
        if(rf && rf.error && /invalid|expired|not found|revoked|already used/i.test(String(rf.error.message||""))) return r;
      }catch(e2){}
    }catch(e){ ultimo={data:{session:null},error:e}; if(!hay) throw e; }
    await new Promise(function(ok){ setTimeout(ok,700*(i+1)); });
  }
  return {data:{session:null},error:(ultimo&&ultimo.error)||null,transitorio:true};
}
// 4.27 — Conexiones tempranas: el cliente de Supabase y el backend se resuelven mientras corre el video de inicio.
if(typeof document!=="undefined"){
  try{
    ["https://cdn.jsdelivr.net",SUPABASE_URL].forEach(function(h){
      if(document.querySelector('link[rel="preconnect"][href="'+h+'"]')) return;
      var l=document.createElement("link"); l.rel="preconnect"; l.href=h; l.crossOrigin="anonymous"; document.head.appendChild(l);
    });
  }catch(e){}
}


export function loadSupabaseJs(): Promise<any> {
  if (supabasePromise) return supabasePromise;
  supabasePromise = new Promise(function(resolve) {
    if (supabaseClient) { resolve(supabaseClient); return; }
    if (window.supabase && window.supabase.createClient) {
      supabaseClient = dwCrearCliente();
      resolve(supabaseClient);
      return;
    }
    // 4.27: si jsDelivr falla o tarda, se prueba un CDN de respaldo antes de rendirse.
    var fuentes = ["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0", "https://unpkg.com/@supabase/supabase-js@2.45.0/dist/umd/supabase.js"];
    function cargar(i){
      var s = document.createElement("script");
      s.src = fuentes[i];
      s.async = true;
      s.onload = function() {
        if(window.supabase && window.supabase.createClient){
          supabaseClient = dwCrearCliente();
          resolve(supabaseClient);
        } else if(i+1<fuentes.length){ cargar(i+1); }
        else { supabasePromise = null; resolve(null); }
      };
      s.onerror = function() {
        try{ s.remove(); }catch(e){}
        if(i+1<fuentes.length) cargar(i+1);
        else { supabasePromise = null; resolve(null); }
      };
      document.head.appendChild(s);
    }
    cargar(0);
  });
  return supabasePromise;
}
// 4.27 — Se inicia la descarga del cliente apenas carga el archivo (antes esperaba al primer render).
if(typeof window!=="undefined"){ try{ setTimeout(function(){ loadSupabaseJs(); },0); }catch(e){} }

