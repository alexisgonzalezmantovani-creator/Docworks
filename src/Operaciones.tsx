// Módulo extraído sin modificar las declaraciones originales.
export const EMPTY_OP = {
  tipo:"reserva", estado:"borrador", proceso_estado:"pendiente_aceptacion", reserva_aceptacion_dias:"5", reserva_aceptacion_vencimiento:"", negociacion_historial:[],
  comprador_nombre:"", comprador_dni:"", comprador_domicilio:"", comprador_email:"", comprador_telefono:"", comprador_email_en_doc:false,
  vendedor_nombre:"", vendedor_dni:"", vendedor_domicilio:"", vendedor_email:"", vendedor_telefono:"", vendedor_email_en_doc:false,
  locador_nombre:"", locador_dni:"", locador_domicilio:"", locador_email:"", locador_telefono:"", locador_email_en_doc:false,
  locatario_nombre:"", locatario_dni:"", locatario_domicilio:"", locatario_email:"", locatario_telefono:"", locatario_email_en_doc:false,
  comprador_cotitulares:[], vendedor_cotitulares:[], locador_cotitulares:[], locatario_cotitulares:[],
  inmueble_direccion:"", inmueble_partido:"", inmueble_provincia:"Buenos Aires", nomenclatura_catastral:"", descripcion_inmueble:"",
  exclusividad_vigencia:"90",
  precio:"", moneda:"USD", anticipo:"", saldo:"", fecha_posesion:"", comision_porcentaje:"", escribania:"", escribania_observaciones:"",
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
  reserva_vigencia_dias:"30",
  tareas_done:{},
  tareas_custom:[],
};

export var CAMPOS_CRITICOS_POR_TIPO = {
  reserva: [["comprador_nombre","Nombre del comprador"],["comprador_dni","DNI del comprador"],["comprador_domicilio","Domicilio del comprador"],["vendedor_nombre","Nombre del vendedor"],["vendedor_dni","DNI del vendedor"],["vendedor_domicilio","Domicilio del vendedor"],["inmueble_direccion","Dirección del inmueble"],["precio","Precio de la operación"],["anticipo","Seña / anticipo (debe ser mayor a 0)"],["reserva_aceptacion_dias","Plazo de aceptación de la reserva"]],
  boleto: [["comprador_nombre","Nombre del comprador"],["comprador_dni","DNI del comprador"],["comprador_domicilio","Domicilio del comprador"],["vendedor_nombre","Nombre del vendedor"],["vendedor_dni","DNI del vendedor"],["vendedor_domicilio","Domicilio del vendedor"],["inmueble_direccion","Dirección del inmueble"],["precio","Precio de la operación"],["fecha_posesion","Fecha de posesión"]],
  reserva_alquiler: [["locador_nombre","Nombre del locador"],["locador_dni","DNI del locador"],["locador_domicilio","Domicilio del locador"],["locatario_nombre","Nombre del locatario"],["locatario_dni","DNI del locatario"],["locatario_domicilio","Domicilio del locatario"],["inmueble_direccion","Dirección del inmueble"],["res_alq_monto_reserva","Seña / anticipo (debe ser mayor a 0)"],["res_alq_vigencia_dias","Vigencia de la reserva"],["res_alq_monto_mensual","Monto mensual"],["res_alq_inicio_estimado","Inicio estimado del contrato"]],
  alquiler: [["locador_nombre","Nombre del locador"],["locador_dni","DNI del locador"],["locador_domicilio","Domicilio del locador"],["locatario_nombre","Nombre del locatario"],["locatario_dni","DNI del locatario"],["locatario_domicilio","Domicilio del locatario"],["inmueble_direccion","Dirección del inmueble"],["alquiler_monto_inicial","Monto inicial"],["alquiler_plazo_meses","Plazo del contrato"],["alquiler_inicio","Fecha de inicio"],["alquiler_fin","Fecha de fin"]],
  comodato: [["vendedor_nombre","Nombre del comodante"],["vendedor_dni","DNI del comodante"],["vendedor_domicilio","Domicilio del comodante"],["comprador_nombre","Nombre del comodatario"],["comprador_dni","DNI del comodatario"],["comprador_domicilio","Domicilio del comodatario"],["inmueble_direccion","Dirección del inmueble"],["comodato_plazo","Plazo del comodato"],["comodato_uso","Uso / destino del bien"]],
  exclusividad: [["vendedor_nombre","Nombre del autorizante"],["vendedor_dni","DNI del autorizante"],["vendedor_domicilio","Domicilio del autorizante"],["comprador_nombre","Nombre de la inmobiliaria"],["comprador_dni","Matrícula de la inmobiliaria"],["inmueble_direccion","Dirección del inmueble"],["precio","Precio"],["exclusividad_vigencia","Vigencia"],["comision_vendedor","Honorarios"]],
  refuerzo_reserva: [["comprador_nombre","Nombre del comprador"],["comprador_dni","DNI del comprador"],["comprador_domicilio","Domicilio del comprador"],["vendedor_nombre","Nombre del vendedor"],["vendedor_dni","DNI del vendedor"],["vendedor_domicilio","Domicilio del vendedor"],["inmueble_direccion","Dirección del inmueble"],["precio","Monto del refuerzo (debe ser mayor a 0)"]],
  devolucion_reserva: [["comprador_nombre","Nombre del comprador"],["comprador_dni","DNI del comprador"],["comprador_domicilio","Domicilio del comprador"],["vendedor_nombre","Nombre del vendedor"],["vendedor_dni","DNI del vendedor"],["vendedor_domicilio","Domicilio del vendedor"],["inmueble_direccion","Dirección del inmueble"],["precio","Monto de la devolución (debe ser mayor a 0)"]]
};

export function dwNormTexto(t){var x=String(t||"");try{x=x.normalize("NFD").replace(/[\u0300-\u036f]/g,"");}catch(e){}return x.toLowerCase();}

export function normalizarTextoComparacion(valor){
  return String(valor==null?"":valor).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es-AR").replace(/\s+/g," ").trim();
}

export function normalizarModoComision(modo){ return modo === "fijo" ? "fijo" : "porcentaje"; }

export function fechaPagoValida(fecha){
  var v=String(fecha||"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  var d=new Date(v+"T00:00:00");
  return !isNaN(d.getTime())&&d.getFullYear()===Number(v.slice(0,4))&&d.getMonth()+1===Number(v.slice(5,7))&&d.getDate()===Number(v.slice(8,10));
}

export function fechaHoyISO(){ return new Date().toISOString().slice(0,10); }

export function normalizarBusqueda(value){
  return String(value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}


// Estilos globales y estabilidad móvil, extraídos sin cambiar su contenido.
export const GS = `
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
  .topbar-logo{display:flex;align-items:center;gap:10px;width:246px;height:100%;flex-shrink:0;overflow:hidden;}
  .topbar-logo img{height:50px;max-width:176px;width:auto;object-fit:contain;object-position:left center;display:block;filter:drop-shadow(0 0 10px rgba(212,168,83,0.28));}
  .topbar-logo-text{font-family:var(--font-serif);font-size:19px;color:#f8fafc;line-height:1;letter-spacing:-0.02em;}
  .topbar-search{flex:1;max-width:520px;position:relative;}
  .topbar-search input{width:100%;padding:10px 14px 10px 40px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:999px;color:#f8fafc;font-family:var(--font-sans);font-size:var(--fs-sm);outline:none;transition:all var(--ease);backdrop-filter:blur(10px);}
  .topbar-search input::placeholder{color:rgba(241,245,249,0.42);}
  .topbar-search input:focus{border-color:rgba(212,168,83,0.5);background:rgba(212,168,83,0.09);box-shadow:0 0 0 3px rgba(212,168,83,0.12);}
  .topbar-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:rgba(241,245,249,0.62);font-size:14px;pointer-events:auto;background:transparent;border:0;padding:0;cursor:pointer;z-index:2;}
  .topbar-right{display:flex;align-items:center;gap:12px;margin-left:auto;}
  .topbar-inmob{display:flex;align-items:center;gap:8px;padding:5px 9px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:10px;min-width:0;}
  .topbar-inmob img{height:34px;max-width:118px;width:auto;object-fit:contain;object-position:center;display:block;}
  .topbar-inmob .demo-badge{font-size:9px;font-weight:800;letter-spacing:.08em;color:var(--gold);padding:3px 6px;border:1px solid rgba(212,168,83,.35);border-radius:999px;background:rgba(212,168,83,.08);}
  .sesion-badge .logout-btn{color:#64748b !important;background:transparent !important;}
  .sesion-badge .logout-btn:hover{color:#475569 !important;background:var(--hover-bg) !important;}
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
  .sidebar-bottom-icon{position:relative;width:44px;height:44px;border:1px solid var(--border2);border-radius:13px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--dim);background:linear-gradient(145deg,var(--surface2),transparent);transition:all .18s ease;box-shadow:0 4px 14px rgba(15,23,42,.06);}
  .sidebar-bottom-icon::after{content:"";position:absolute;inset:4px;border-radius:10px;border:1px solid transparent;pointer-events:none;transition:border-color .18s ease,background .18s ease;}
  .sidebar-bottom-icon:hover{background:var(--gold-soft);border-color:var(--gold-line);color:var(--gold);transform:translateY(-1px);box-shadow:0 7px 18px rgba(15,23,42,.10);}
  .sidebar-bottom-icon:hover::after{border-color:rgba(212,168,83,.18);}
  .sidebar-bottom-icon:active{transform:translateY(0);}
  .sidebar-bottom-icon svg{position:relative;z-index:1;}


  /* Brand header 5.45: centered vertically with comfortable breathing room. */
  .topbar-logo{width:clamp(255px,29vw,405px);gap:10px;overflow:visible;margin-left:-15px;align-items:center;}
  .topbar-logo .dw-header-brand-img{height:auto;max-height:47px;max-width:min(295px,calc(100% - 55px));width:auto;object-fit:contain;display:block;filter:none;flex-shrink:1;min-width:0;}
  .dw-header-version{font:600 12px 'DM Sans',sans-serif;white-space:nowrap;color:#e7c57e;letter-spacing:.02em;flex-shrink:0;}
  .mobile-topbar-logo{min-width:0;gap:7px;margin-left:-7px;}
  .mobile-topbar-logo .dw-header-brand-img{display:block;height:auto;max-height:39px;max-width:min(56vw,205px);width:auto;object-fit:contain;min-width:0;}
  .mobile-topbar-logo .dw-header-version{font-size:11px;}

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

  /* DocWorks 5.11 PRO — Navegación premium compacta de aspecto documental */
  .dw-aspecto-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-bottom:14px;}
  .dw-aspecto-nav-item{display:flex;align-items:center;gap:9px;min-width:0;padding:10px;border:1px solid var(--border);border-radius:11px;background:var(--surface);color:var(--text);text-align:left;cursor:pointer;transition:background .16s,border-color .16s,box-shadow .16s;}
  .dw-aspecto-nav-item:hover{border-color:var(--gold);background:rgba(212,168,83,.045);}
  .dw-aspecto-nav-item.is-active{border-color:rgba(212,168,83,.65);background:rgba(212,168,83,.09);box-shadow:inset 3px 0 0 var(--gold);}
  .dw-aspecto-nav-icon{font-size:19px;color:var(--gold);line-height:1;width:20px;flex-shrink:0;text-align:center;}
  .dw-aspecto-nav-copy{display:flex;flex-direction:column;gap:2px;min-width:0;}
  .dw-aspecto-nav-copy strong{font-size:12px;font-weight:600;line-height:1.2;}
  .dw-aspecto-nav-copy small{font-size:10px;color:var(--muted);line-height:1.3;}
  .dw-aspecto-nav-arrow{margin-left:auto;color:var(--dim);font-size:20px;font-weight:300;}
  .dw-aspecto-pie-card{border:1px solid var(--border);border-radius:12px;padding:14px!important;background:var(--surface);}
  @media(max-width:420px){.dw-aspecto-nav{grid-template-columns:1fr 1fr;gap:6px}.dw-aspecto-nav-item{padding:9px 7px;gap:6px}.dw-aspecto-nav-copy small{font-size:9px}.dw-aspecto-nav-arrow{display:none}}
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
    .main{min-height:calc(100dvh - 52px);min-height:calc(100svh - 52px);overflow:hidden;display:flex;flex-direction:column;}
    .content{padding:12px 12px calc(var(--mobile-nav-h) + 28px + env(safe-area-inset-bottom,0px)) 12px;max-height:none;min-height:0;flex:1 1 auto;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-y:auto;touch-action:pan-y;}

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
    .modal-box,.modal-box.wide,.modal-box.narrow{max-width:100%;width:100%;min-height:0;height:auto;border-radius:20px 20px 0 0;max-height:calc(100dvh - env(safe-area-inset-top,0px));max-height:calc(100svh - env(safe-area-inset-top,0px));}
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
    .step-dot span:last-child{display:inline;}
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

  /* ═══════════════════════════════════════════
     DOCWORKS 4.08 — MOBILE / TABLET HARDENING
  ═══════════════════════════════════════════ */
  @media (max-width: 1100px){
    .content{min-width:0!important;overflow-x:hidden!important;}
    .card,.op-card,.modal-box,.cuenta-profile-card{max-width:100%;box-sizing:border-box;}
    .cuenta-dashboard-head,.cuenta-main-grid,.cuenta-info-grid,.cuenta-config-grid{min-width:0!important;}
    .cuenta-dashboard-stats{min-width:0!important;}
    .cuenta-dashboard-stat{min-width:0!important;}
    table{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;}
    .btn,.inp,select,textarea,input{min-height:38px;box-sizing:border-box;}
  }
  @media (max-width: 760px){
    .content{padding:14px 12px calc(82px + env(safe-area-inset-bottom,0px))!important;max-height:none!important;}
    .main{overflow:visible!important;}
    .mobile-topbar{height:56px;padding:0 10px;gap:8px;}
    .mobile-topbar-logo{min-width:0;}
    .mobile-logo-text{font-size:16px;white-space:nowrap;}
    .cuenta-dashboard-head{display:block!important;}
    .cuenta-dashboard-stats{grid-template-columns:repeat(3,minmax(0,1fr))!important;margin-top:12px;}
    .cuenta-dashboard-stat{padding:8px 7px!important;}
    .cuenta-dashboard-stat-label{font-size:7.5px!important;}
    .cuenta-dashboard-stat-value{font-size:15px!important;}
    .cuenta-info-grid{grid-template-columns:1fr!important;}
    .cuenta-profile-card > div{padding-left:13px!important;padding-right:13px!important;}
    .cuenta-save-panel{flex-direction:column!important;align-items:stretch!important;}
    .cuenta-save-panel>div:last-child{width:100%!important;display:flex!important;justify-content:stretch!important;}
    .cuenta-save-panel button{flex:1!important;width:100%!important;}
    .op-card{padding:12px!important;}
    .op-card-side{min-width:0!important;max-width:none!important;border-left:0!important;border-top:1px solid var(--border);padding:10px 0 0!important;margin-top:10px;}
    .modal-overlay{padding:10px!important;align-items:flex-end!important;}
    .modal-box,.modal-box.wide,.modal-box.narrow{width:100%!important;max-width:100%!important;max-height:calc(100dvh - 10px)!important;border-radius:18px 18px 0 0!important;}
    .plantilla-appearance-grid,.cuenta-main-grid{grid-template-columns:1fr!important;}
    .preview-control-section{width:100%!important;}
    .sa-detail-row{flex-wrap:wrap!important;}
    .mobile-nav{padding-bottom:env(safe-area-inset-bottom,0px)!important;}
  }
  /* ═══════════════════════════════════════════
     DOCWORKS 4.08 — TABLET / PAGE SCROLL
     En tablet el documento completo vuelve a ser
     el scroll principal. Evita que el gesto táctil
     quede atrapado en .main/.content y permite
     desplazar la web desde cualquier zona.
  ═══════════════════════════════════════════ */
  @media (min-width: 761px) and (max-width: 1100px){
    html,body{overflow-y:auto!important;overflow-x:hidden!important;min-height:100%!important;height:auto!important;touch-action:pan-y!important;}
    body{-webkit-overflow-scrolling:touch!important;}
    .app-wrap{min-height:100dvh!important;height:auto!important;overflow:visible!important;}
    .app-body{min-height:0!important;overflow:visible!important;}
    .main{min-height:0!important;height:auto!important;overflow:visible!important;}
    .content{padding:18px 16px 36px!important;max-height:none!important;height:auto!important;min-height:0!important;overflow:visible!important;touch-action:pan-y!important;-webkit-overflow-scrolling:auto!important;overscroll-behavior-y:auto!important;}
    .content > *{touch-action:auto;}

    .cuenta-main-grid{grid-template-columns:1fr!important;}
    .cuenta-info-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
    .cuenta-dashboard-head{grid-template-columns:1fr!important;}
    .modal-box.wide{width:min(94vw,900px)!important;}
  }

  /* DocWorks visual refresh: operations dashboard only. */
  .dw-dashboard-root{width:100%;min-width:0;}
  .dw-dashboard-root>.section-header{padding:6px 2px 19px;border-bottom:1px solid var(--border2);margin-bottom:22px!important;align-items:flex-end;}
  .dw-dashboard-root>.section-header .section-title{font-size:clamp(25px,2.5vw,34px);letter-spacing:-.035em;line-height:1.1;}
  .dw-dashboard-root>.section-header .section-sub{font-size:13px;line-height:1.55;margin-top:8px;max-width:580px;}
  .dw-dashboard-root .op-card-premium{border:1px solid var(--border2);border-radius:16px;box-shadow:0 3px 14px rgba(15,23,42,.045);transition:box-shadow .18s ease,border-color .18s ease,transform .18s ease;}
  @media(hover:hover) and (pointer:fine){.dw-dashboard-root .op-card-premium:hover{border-color:var(--gold-line);box-shadow:0 9px 28px rgba(15,23,42,.085);transform:translateY(-1px);}}
  .dw-dashboard-root button:focus-visible,.dw-dashboard-root a:focus-visible{outline:2px solid var(--gold);outline-offset:3px;}
  @media(max-width:640px){
    .dw-dashboard-root>.section-header{padding:2px 0 15px;margin-bottom:15px!important;align-items:flex-start;}
    .dw-dashboard-root>.section-header .section-title{font-size:27px;}
    .dw-dashboard-root>.section-header .section-sub{font-size:12px;line-height:1.45;margin-top:5px;}
    .dw-dashboard-root .op-card-premium{border-radius:14px;transform:none!important;padding:12px 12px 11px 15px;box-shadow:0 2px 10px rgba(15,23,42,.04);}
    .dw-dashboard-root .op-card-premium .op-type-badge{font-size:10.5px;font-weight:650;padding:4px 7px;}
    .dw-dashboard-root .op-card-premium .op-status-hero{font-size:10.5px;font-weight:700;padding:4px 8px;}
    .dw-dashboard-root .op-card-premium .op-card-actions{gap:6px;flex-wrap:nowrap;min-width:0;}
    .dw-dashboard-root .op-card-premium .op-card-actions .btn{min-width:0;}
    .dw-dashboard-root .op-card-premium .op-state-rail{width:4px;}
  }

  .dw-dashboard-overview{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:0 0 22px;}
  .dw-overview-stat{appearance:none;text-align:left;min-width:0;display:flex;flex-direction:column;gap:13px;padding:17px 18px;border:1px solid var(--border2);border-radius:16px;background:var(--card);color:var(--text);cursor:pointer;box-shadow:0 3px 13px rgba(15,23,42,.035);transition:border-color .18s ease,box-shadow .18s ease;}
  .dw-overview-stat:hover,.dw-overview-stat.is-selected{border-color:var(--gold-line);box-shadow:0 5px 18px rgba(15,23,42,.07);}
  .dw-overview-stat.is-selected{background:linear-gradient(135deg,var(--card),var(--gold-soft));}
  .dw-overview-label{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:12px;font-weight:600;line-height:1.35;}
  .dw-overview-label svg{flex-shrink:0;color:var(--gold);}
  .dw-overview-value{font-size:clamp(25px,2.8vw,34px);font-weight:650;line-height:1;letter-spacing:-.05em;font-variant-numeric:tabular-nums;}
  @media(min-width:701px) and (max-width:1050px){.dw-dashboard-overview{grid-template-columns:repeat(3,minmax(0,1fr));}}
  @media(max-width:700px){
    .dw-dashboard-overview{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-bottom:14px;}
    .dw-overview-stat{padding:10px 9px;gap:7px;border-radius:11px;min-height:74px;box-shadow:0 2px 8px rgba(15,23,42,.025);}
    .dw-overview-label{font-size:10px;gap:5px;line-height:1.2;font-weight:550;letter-spacing:-.01em;overflow-wrap:anywhere;}
    .dw-overview-label svg{width:13px;height:13px;}
    .dw-overview-value{font-size:23px;font-weight:650;}
  }
  @media(max-width:360px){.dw-dashboard-overview{gap:5px;}.dw-overview-stat{padding:9px 7px;min-height:70px;}.dw-overview-label{font-size:9px;}.dw-overview-value{font-size:21px;}}

  /* Compact search and filter toolbar — dashboard only. */
  .dw-dashboard-root .dw-dashboard-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:17px;flex-wrap:wrap;padding:9px;border:1px solid var(--border2);border-radius:15px;background:var(--card);box-shadow:0 2px 12px rgba(15,23,42,.025);}
  .dw-dashboard-root .dw-dashboard-toolbar .search-wrap{flex:1;min-width:180px;}
  .dw-dashboard-root .dw-dashboard-toolbar .search-inp{border-radius:10px;}
  .dw-dashboard-root .dw-dashboard-toolbar .filter-tipo{border-radius:10px;}
  .dw-dashboard-root .dw-dashboard-toolbar .op-view-switch{border-radius:10px;}
  @media(max-width:700px){
    /* Search and actions share one line: no orphaned controls or empty second row. */
    .dw-dashboard-root .filter-row.dw-dashboard-toolbar{display:flex!important;flex-direction:row!important;align-items:center;flex-wrap:nowrap!important;gap:6px;padding:6px;border-radius:12px;margin-bottom:13px;}
    .dw-dashboard-root .dw-dashboard-toolbar .search-wrap{flex:1 1 0!important;min-width:0!important;width:auto!important;}
    .dw-dashboard-root .dw-dashboard-toolbar .search-inp{width:100%;min-width:0;font-size:16px;padding-right:8px;text-overflow:ellipsis;}
    .dw-dashboard-root .dw-dashboard-toolbar select.filter-tipo{display:none!important;}
    .dw-dashboard-root .dw-dashboard-toolbar .filtros-btn{flex:0 0 auto;white-space:nowrap;min-width:36px;min-height:36px;padding:7px!important;}
    .dw-dashboard-root .dw-dashboard-toolbar .filtros-btn .filtros-label{display:none!important;}
    .dw-dashboard-root .dw-dashboard-toolbar .op-view-switch{flex:0 0 auto;white-space:nowrap;padding:2px;}
    .dw-dashboard-root .dw-dashboard-toolbar .op-view-switch button{width:28px;height:32px;}
  }
  /* Calendar overview: compact, readable three-column cards on phones. */
  .calendar-summary-card{padding:14px 16px;display:flex;align-items:center;gap:12px;border-radius:14px;min-width:0;}
  .calendar-summary-icon{width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.04);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0;}
  .calendar-summary-body{min-width:0;}
  .calendar-summary-number{font-size:20px;font-weight:750;color:var(--text);line-height:1;}
  .calendar-summary-title{font-size:12px;font-weight:700;color:var(--text);margin-top:4px;}
  .calendar-summary-description{font-size:12px;color:var(--dim);margin-top:2px;}
  @media(max-width:700px){
    .calendar-summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;margin-bottom:12px!important;}
    .calendar-summary-card{padding:10px 7px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;border-radius:11px;min-width:0;}
    .calendar-summary-icon{width:24px;height:24px;border-radius:7px;font-size:10px;}
    .calendar-summary-number{font-size:22px;font-weight:650;letter-spacing:-.04em;}
    .calendar-summary-title{font-size:10px;font-weight:650;line-height:1.2;overflow-wrap:normal;word-break:normal;hyphens:none;}
    .calendar-summary-card{overflow:hidden;box-sizing:border-box;}
    .calendar-summary-body{width:100%;min-width:0;}
    .calendar-summary-title{white-space:normal;}
    .calendar-summary-description{display:none;}
  }
`;

export var MOBILE_STABILITY_CSS = `
  /* Tablet/web stability: keep the whole shell scrollable and never clip
     controls when the viewport is between phone and desktop widths. */
  html,body,#root{max-width:100%;min-height:100%;}
  body{overflow-x:hidden;}
  .app-body,.main,.content{min-width:0;}
  @media (min-width:641px) and (max-width:1100px){
    .content{padding:18px 18px 28px !important;overflow-x:hidden;}
    .sidebar{width:64px;}
    .sidebar-bottom-icon{display:flex !important;align-items:center;justify-content:center;visibility:visible !important;opacity:1 !important;}
    .topbar{min-width:0;}
    .topbar button,.topbar .btn{flex-shrink:0;}
    .grid2{grid-template-columns:repeat(2,minmax(0,1fr));}
    .two-col-layout{grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);}
  }
  @media (orientation:landscape) and (max-width:1100px){
    .content{padding-left:18px !important;padding-right:18px !important;}
    .mobile-nav{display:none !important;}
    .main{min-height:100dvh;}
  }
@media (max-width: 700px){
  html,body,#root{min-height:100%;width:100%;overflow-x:hidden;}
  body{overscroll-behavior-y:none;-webkit-text-size-adjust:100%;}
  input,textarea,select,button{font:inherit;}
  input,textarea,select{font-size:16px;}
  .dw-mobile-scroll{overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .dw-mobile-scroll::-webkit-scrollbar{display:none;}
}

:root{--mobile-safe-top:env(safe-area-inset-top,0px);--mobile-safe-bottom:env(safe-area-inset-bottom,0px);--dw-control-min:44px;--dw-radius-lg:16px;}
/* 4.11 PRO — pasos con nombre visible y desplazables en móvil. */
.steps{scroll-snap-type:x proximity;scrollbar-width:none;-ms-overflow-style:none;}
.steps::-webkit-scrollbar{display:none;}
.step-item{scroll-snap-align:center;}
.step-dot{white-space:nowrap;}
.step-dot span{display:inline;}
/* 4.08 — estilos de componentes nuevos de la serie 3.8x (botones de ícono, errores de campo). */
.field-error{font-size:12px!important;}
.app-wrap :where(.icon-btn){width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;}
.app-wrap :where(.field-error){display:block;color:var(--red);font-weight:650;line-height:1.4;margin-top:2px;}
.app-wrap :where(.field:has(.field-error) .inp){border-color:rgba(248,113,113,.72);box-shadow:0 0 0 3px rgba(248,113,113,.10);}
.app-wrap :where(.field:has(.field-error) .inp:focus){border-color:var(--red);}
@media (max-width:640px){
  .field-error{font-size:13px !important;line-height:1.4;}
  .icon-btn, .tab{min-width:44px;
    min-height:44px;}
  .tab{font-weight:500 !important;
    letter-spacing:0 !important;}
}
@media(max-width:640px){
  .field-error{font-size:13px!important;}
}
@media (max-width: 640px){
  .stats-money-row{grid-template-columns: 1fr !important;
    gap: 8px !important;}
  .stats-money-row > .card{padding: 12px !important;}
}
/* 4.11 PRO — "Nueva operación" y demás paneles: hoja inferior (como la 3.67), nunca a pantalla completa. */
@media (max-width:640px){
  .modal-overlay:not(.modal-overlay-viewer){align-items:flex-end!important;justify-content:center!important;padding:0!important;}
  .modal-overlay:not(.modal-overlay-viewer) .modal-box,
  .modal-overlay:not(.modal-overlay-viewer) .modal-box.wide,
  .modal-overlay:not(.modal-overlay-viewer) .modal-box.narrow{height:auto!important;min-height:0!important;max-height:calc(100dvh - 56px)!important;width:100%!important;max-width:100%!important;border-radius:20px 20px 0 0!important;}
}

/* ═══ DOCWORKS 4.08 — estética, interacción y táctil ═══ */
/* Scroll con un dedo en tablets (vertical y horizontal): la página completa es el scroller. */
html,body{touch-action:manipulation;}
@supports (overflow:clip){html,body{overflow-x:clip;}}
@media (hover:none) and (pointer:coarse) and (min-width:761px){
  html,body{overflow-y:visible!important;overflow-x:clip!important;height:auto!important;min-height:100%!important;touch-action:manipulation!important;}
  body{-webkit-overflow-scrolling:auto!important;}
  .app-wrap{min-height:100dvh!important;height:auto!important;overflow:visible!important;}
  .app-body,.main{min-height:0!important;height:auto!important;overflow:visible!important;}
  .content{max-height:none!important;height:auto!important;min-height:0!important;overflow:visible!important;overscroll-behavior-y:auto!important;touch-action:manipulation!important;-webkit-overflow-scrolling:auto!important;}
  .content > *{touch-action:auto;}
}
/* Barra superior móvil azul (como la barra de escritorio), integrada con la barra de estado del iPhone. */
.mobile-topbar{background:linear-gradient(120deg,#091222 0%,#122a58 48%,#0c1c3d 100%)!important;border-bottom:1px solid rgba(255,255,255,.08)!important;color:#fff!important;padding-top:env(safe-area-inset-top,0px)!important;height:calc(56px + env(safe-area-inset-top,0px))!important;box-shadow:0 6px 20px rgba(0,0,0,.22);}
.mobile-topbar .mobile-logo-text{color:#fff!important;}
.mobile-topbar .mobile-logo-text span{color:#e8c06a!important;opacity:.95!important;}
/* 4.26 PRO — encabezado persistente en todas las plataformas y safe-area azul. */
:root{color-scheme:light dark;}
@media(max-width:640px){
  .mobile-topbar{position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:500!important;background:#102653!important;background:linear-gradient(120deg,#091222 0%,#122a58 48%,#0c1c3d 100%)!important;}
  .app-wrap{padding-top:calc(56px + env(safe-area-inset-top,0px))!important;}
  /* Calendario: tres indicadores compactos en una fila también en iPhone. */
  .calendar-summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;}
  .calendar-summary-grid>.card{min-width:0!important;padding:10px 7px!important;}
  .calendar-summary-grid>.card>div:last-child{min-width:0!important;overflow-wrap:anywhere;}
  .content,.main,.app-body,.app-wrap{max-width:100vw!important;min-width:0!important;}
  .content,.main{overflow-x:clip!important;}
}
@media(min-width:641px){
  .topbar{position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:500!important;}
  .app-wrap{padding-top:64px!important;}
}
/* Evita desplazamiento horizontal accidental en vistas de gestión y económicos. */
.economico-view,.economico-view *{box-sizing:border-box;min-width:0;}
@media(max-width:1100px){.content{overflow-x:clip!important;}.stats-money-row,.stats-money-row>*{min-width:0!important;max-width:100%;}.card,.op-card{overflow-wrap:anywhere;}}

/* Botones flotantes: "+" principal y asistente IA apilados, sin pisarse. */
.fab{display:none;transition:transform .25s cubic-bezier(.2,.8,.2,1),opacity .2s,box-shadow .2s!important;}
.fab svg{pointer-events:none;}
.ia-fab{transition:transform .25s cubic-bezier(.2,.8,.2,1),opacity .2s,box-shadow .2s!important;}
.fab:active,.ia-fab:active{transform:scale(.92)!important;}
@media (max-width:640px),(orientation:landscape) and (max-height:500px){body.dw-fab-hide .fab,body.dw-fab-hide .ia-fab{transform:translateY(170px)!important;opacity:0;pointer-events:none;}}
@media (max-width:640px){
  .fab{display:flex!important;bottom:calc(var(--mobile-nav-h) + 14px)!important;right:16px!important;width:56px!important;height:56px!important;}
  .ia-fab{bottom:calc(var(--mobile-nav-h) + 82px)!important;right:20px!important;width:46px!important;height:46px!important;}
  .section-header .btn-nueva{display:none!important;}
}
@media (orientation:landscape) and (max-height:500px) and (hover:none){
  .fab{display:flex!important;bottom:16px!important;right:16px!important;width:52px!important;height:52px!important;}
  .ia-fab{bottom:78px!important;right:20px!important;width:44px!important;height:44px!important;}
  .section-header .btn-nueva{display:none!important;}
}
/* Buscador y filtros: una sola fila prolija. */
.filtros-btn{position:relative;gap:7px;min-height:40px;}
.filtros-btn.is-active{border-color:var(--gold-line);color:var(--gold);}
.filtros-badge{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--gold);color:#0a0f1a;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;}
.op-filter-tipo-mobile{display:none;}
@media (max-width:640px){
  .filter-row{flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;padding:8px!important;margin-bottom:10px!important;}
  .filter-row .search-wrap{flex:1 1 auto!important;min-width:0!important;width:auto!important;}
  .filter-row .search-inp{height:40px;padding:9px 10px 9px 34px;}
  .filter-row .filter-tipo{display:none!important;}
  .filter-row .filtros-btn{width:40px;min-width:40px;flex:0 0 40px;padding:0!important;border-radius:10px;}
  .filter-row .filtros-label{display:none;}
  .filter-row .filtros-badge{position:absolute;top:-6px;right:-6px;}
  .filter-row .op-view-switch{order:0!important;flex:0 0 auto;}
  .op-filter-panel{margin-top:0;}
  .op-filter-tipo-mobile{display:flex;}
}
/* Interacción: elevación al pasar, respuesta al tocar y entrada escalonada de tarjetas. */
@media (hover:hover){
  .op-card{transition:box-shadow .2s,border-color .2s,background .2s;}
  .op-card:hover{box-shadow:0 12px 30px rgba(15,23,42,.10);border-color:var(--gold-line);}
  .grupo-card:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(15,23,42,.12);}
}
.grupo-card:active{transform:scale(.985);}
.btn:active:not(:disabled){transform:scale(.96);}
.mobile-nav-item span:first-child{transition:transform .2s;}
.mobile-nav-item:active{transform:scale(.92);}
.mobile-nav-item.active span:first-child{transform:translateY(-1px) scale(1.12);}
.op-list > *{animation:fadeUp .38s cubic-bezier(.2,.8,.2,1) backwards;}
.op-list > *:nth-child(2){animation-delay:.04s;}
.op-list > *:nth-child(3){animation-delay:.08s;}
.op-list > *:nth-child(4){animation-delay:.12s;}
.op-list > *:nth-child(5){animation-delay:.16s;}
.op-list > *:nth-child(n+6){animation-delay:.2s;}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important;}}
/* DOCWORKS 4.11 PRO — ajustes finales de interacción y adaptación. */
:root{--dw-motion:cubic-bezier(.2,.75,.25,1);}
button,.btn,.tab,.op-card,.card,.modal-box,.mobile-nav-item{transition:background-color .18s var(--dw-motion),border-color .18s var(--dw-motion),box-shadow .18s var(--dw-motion),opacity .18s var(--dw-motion),transform .18s var(--dw-motion);}
button:active,.btn:active,.tab:active,.mobile-nav-item:active{transform:scale(.98);}
@media (hover:hover) and (pointer:fine){.op-card:hover,.card:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.16);}button:hover,.btn:hover{filter:brightness(1.035);}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important;}}
html,body,#root{max-width:100%;overscroll-behavior-x:none;}
body{touch-action:pan-y;}
.app-wrap,.app-body,.main,.content{min-width:0;}
@media (hover:none) and (pointer:coarse){
  html,body{overflow-x:hidden!important;touch-action:pan-y!important;}
  .app-wrap{height:auto!important;min-height:100dvh!important;overflow:visible!important;}
  .app-body,.main{height:auto!important;min-height:0!important;overflow:visible!important;}
  .content{height:auto!important;max-height:none!important;overflow:visible!important;touch-action:pan-y!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:auto!important;}
}
.modal-overlay{padding-top:max(12px,env(safe-area-inset-top,0px));padding-bottom:max(12px,env(safe-area-inset-bottom,0px));}
 .doc-reading-scroll{padding-bottom:calc(24px + env(safe-area-inset-bottom,0px));}
 .doc-viewer-actions,.document-viewer-actions{padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));}
.modal-box{max-height:calc(100dvh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 24px);}
.modal-body{overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch;}
.dropdown-menu{max-width:calc(100vw - 16px);overscroll-behavior:contain;}
@media (max-width:640px){input,textarea,select{font-size:16px!important;} .mobile-topbar{padding-top:env(safe-area-inset-top,0px)!important;} .fab,.ia-fab{touch-action:manipulation;}}

/* DOCWORKS 4.08 — estabilización responsive final iPhone/iPad/PWA.
   Estas reglas van al final para evitar que los bloques históricos se contradigan. */
html,body,#root{width:100%;max-width:100%;min-width:0;}
body{margin:0;}
.app-wrap{width:100%;max-width:100%;min-width:0;}
img,video,canvas,svg{max-width:100%;}
@media (hover:none) and (pointer:coarse){
  html,body{overscroll-behavior-x:none;}
  .app-wrap,.app-body,.main,.content{box-sizing:border-box;min-width:0;}
  .content{width:100%;max-width:100%;}
  .modal-overlay{box-sizing:border-box;}
  .modal-box,.modal-box.wide,.modal-box.narrow{box-sizing:border-box;min-width:0;}
  .modal-body{min-height:0;max-width:100%;}
  .modal-body>*{min-width:0;max-width:100%;}
  .mobile-nav{padding-bottom:env(safe-area-inset-bottom,0px);}
}
/* En horizontal la altura disponible es escasa: no sumar márgenes verticales grandes. */
@media (orientation:landscape) and (max-height:600px) and (hover:none) and (pointer:coarse){
  .mobile-topbar{height:calc(44px + env(safe-area-inset-top,0px))!important;min-height:44px!important;}
  .content{padding-top:8px!important;padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))!important;}
  .modal-overlay{align-items:flex-start!important;padding-top:max(4px,env(safe-area-inset-top,0px))!important;padding-bottom:max(4px,env(safe-area-inset-bottom,0px))!important;overflow-y:auto!important;}
  .modal-box,.modal-box.wide,.modal-box.narrow{max-height:calc(100dvh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 8px)!important;}
  .modal-body{overflow-y:auto!important;overscroll-behavior:contain;}
  .mobile-nav{min-height:48px;height:calc(48px + env(safe-area-inset-bottom,0px));}
}
/* Tablets: mantener ancho flexible en ambas orientaciones, sin forzar orientación desde la web. */
@media (min-width:641px) and (hover:none) and (pointer:coarse){
  .app-wrap{width:100%;max-width:100vw;}
  .app-body{min-width:0;width:100%;}
  .main,.content{min-width:0;max-width:100%;}
  .content{box-sizing:border-box;padding-left:clamp(12px,2.4vw,28px);padding-right:clamp(12px,2.4vw,28px);}
  .modal-overlay{padding:clamp(8px,1.5vw,20px);}
  .modal-box,.modal-box.wide,.modal-box.narrow{max-width:calc(100vw - 2 * clamp(8px,1.5vw,20px));max-height:calc(100dvh - 2 * clamp(8px,1.5vw,20px));}
}

/* DOCWORKS 4.08 — modales suaves (vinculados, historial): fondo claro y centrados también en tablet. */
.modal-overlay{background:rgba(15,23,42,0.5);backdrop-filter:blur(4px);}
.modal-overlay.modal-overlay-soft{background:rgba(15,23,42,0.16)!important;backdrop-filter:none!important;}
@media (min-width:600px){
  .modal-overlay.modal-overlay-soft{align-items:center!important;justify-content:center!important;padding:20px!important;}
  .modal-overlay.modal-overlay-soft .modal-box,.modal-overlay.modal-overlay-soft .modal-box.wide{border-radius:18px!important;max-height:calc(100dvh - 40px)!important;height:auto!important;width:min(720px,100%)!important;box-shadow:0 18px 50px rgba(15,23,42,.22);}
}
/* DOCWORKS 4.08 — tarjetas de Operaciones: acciones a la derecha, bajo el progreso. */
.op-card-side .op-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px;}
.op-card-side .op-actions .btn{flex:1 1 auto;min-width:0;justify-content:center;white-space:nowrap;}
.op-card-side .op-actions .op-more{flex:0 0 auto;min-width:44px;}
.op-progress-row{display:flex;align-items:center;gap:8px;margin-top:5px;}
.op-progress-row .op-progress{flex:1;margin-top:0!important;}
.op-progress-pct{font-size:12px;font-weight:800;color:var(--text);min-width:36px;text-align:right;}
.op-card-side{min-width:196px;max-width:230px;}
.op-doc-card{border-left:4px solid var(--teal)!important;}
.op-folder-wrap{border:1px solid rgba(212,168,83,.35);border-radius:18px;padding:10px;background:linear-gradient(180deg,rgba(212,168,83,0.06),rgba(255,255,255,0.012));box-shadow:0 4px 18px rgba(0,0,0,.05);}
.op-folder-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:20px;border:1px solid rgba(212,168,83,.4);background:rgba(212,168,83,.12);color:var(--gold);font-size:12px;font-weight:800;cursor:pointer;}
.op-folder-docs{display:flex;flex-direction:column;gap:9px;margin-top:9px;padding-left:14px;border-left:2px dashed rgba(212,168,83,.4);}
@media (max-width:760px){ .op-card-side{min-width:0!important;max-width:none!important;} .op-folder-docs{padding-left:8px;} }
/* DOCWORKS 4.08 — centro de tareas. */
.tarea-custom-add{display:flex;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border);}
.tarea-custom-add input{flex:1;min-width:0;}
/* DOCWORKS 4.08 — correcciones de pantalla: línea de tiempo, menú inferior, barra de estado, scroll, panel de operaciones. */
.reserva-mini-event{flex:0 0 auto!important;min-width:150px;max-width:240px;box-sizing:border-box;}
.reserva-mini-event>div{min-width:0;}
.reserva-mini-title{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.25;overflow-wrap:anywhere;}
/* Menú inferior: la altura incluye el área segura del iPhone (antes el padding se comía los botones y se superponían). */
.mobile-nav{--mobile-nav-h:54px;--mobile-nav-pad:max(3px,calc(env(safe-area-inset-bottom,0px) - 20px));box-sizing:border-box!important;height:calc(var(--mobile-nav-h) + var(--mobile-nav-pad))!important;min-height:0!important;padding-bottom:var(--mobile-nav-pad)!important;padding-left:max(2px,env(safe-area-inset-left,0px))!important;padding-right:max(2px,env(safe-area-inset-right,0px))!important;background:var(--surface)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:0 -6px 18px rgba(15,23,42,.08);}
.mobile-nav-inner{height:var(--mobile-nav-h)!important;}
.mobile-nav-item{min-height:44px;}
@media (max-width:640px){
  .fab{bottom:calc(54px + max(3px,calc(env(safe-area-inset-bottom,0px) - 20px)) + 14px)!important;}
  .ia-fab{bottom:calc(54px + max(3px,calc(env(safe-area-inset-bottom,0px) - 20px)) + 82px)!important;}
}
@media (max-width:640px) and (orientation:portrait){ .content{padding-bottom:calc(54px + max(3px,calc(env(safe-area-inset-bottom,0px) - 20px)) + 24px)!important;} }
@media (orientation:landscape) and (max-height:600px) and (hover:none) and (pointer:coarse){
  .mobile-nav{height:calc(48px + env(safe-area-inset-bottom,0px))!important;}
  .mobile-nav-inner{height:48px!important;}
}
/* Barra de estado del iPhone: franja azul fija arriba (hora, notch, batería) para que no quede blanca al subir/bajar. */
body::before{content:"";position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top,0px);background:#0b1730;z-index:9999;pointer-events:none;}
html{background-color:#0b1730;}
body{background:var(--bg);min-height:100dvh;}
/* Scroll: con un modal abierto sólo se mueve el contenido del modal. */
html.dw-modal-open,html.dw-modal-open body{overflow:hidden!important;overscroll-behavior:none;}
html.dw-modal-open .content,html.dw-modal-open .app-wrap{overflow:hidden!important;}
.modal-overlay{overscroll-behavior:contain;}
.modal-box{overscroll-behavior:contain;}
.modal-body,.doc-reading-scroll,.doc-viewer-tab-content{overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;}
/* Título del documento al abrirlo: en celular pasa a una fila propia debajo de los botones. */
.viewer-modal .modal-title{max-width:min(460px,52vw);}
@media (max-width:640px){
  .viewer-modal .modal-head{flex-wrap:wrap!important;row-gap:6px!important;}
  .viewer-modal .modal-head>div:last-child{order:1;flex:1 1 100%!important;justify-content:flex-end!important;margin-left:0!important;}
  .viewer-modal .modal-head>div:first-child{order:2;flex:1 1 100%!important;}
  .viewer-modal .modal-title{max-width:100%!important;font-size:15px!important;-webkit-line-clamp:2!important;}
}
/* Operaciones: panel derecho compacto en tablet y celular, para que la información principal (izquierda) se lea mejor. */
@media (max-width:1100px){
  .op-card .op-card-side{min-width:132px!important;max-width:150px!important;padding-left:10px!important;gap:6px!important;}
  .op-card .op-side-extra{display:none!important;}
  .op-card .op-card-side .op-actions{gap:4px;}
  .op-card .op-card-side .op-actions .btn{padding:5px 8px!important;font-size:12px!important;min-height:32px;}
  .op-card .op-card-side .op-actions .op-more{min-width:34px!important;}
}
@media (max-width:760px){
  .op-card .op-card-inner{flex-direction:column!important;gap:0!important;}
  .op-card .op-card-inner>div:first-child{width:100%;flex:0 0 auto!important;}
  .op-folder-wrap{padding:6px!important;border-radius:14px!important;}
  .op-folder-docs{padding-left:6px!important;margin-top:7px!important;gap:7px!important;}
  .op-card .op-card-side{min-width:0!important;max-width:none!important;width:100%;flex-direction:row!important;flex-wrap:wrap;align-items:center!important;gap:8px 12px!important;padding:8px 0 0!important;margin-top:8px!important;}
  .op-card .op-card-side>div{min-width:0;}
  .op-card .op-card-side>div:has(.op-progress-row){flex:1 1 120px;}
  .op-card .op-card-side .op-side-label{display:none;}
  .op-card .op-card-side .op-actions{margin-top:0;flex:0 0 auto;flex-wrap:nowrap;}
}
/* DOCWORKS 5.16 — refinamiento visual del listado de operaciones, sin cambios de lógica. */
.op-card-premium{border:1px solid var(--border);box-shadow:0 2px 12px rgba(10,20,40,.045);transition:box-shadow .18s ease,border-color .18s ease,transform .18s ease;}
@media (hover:hover){.op-card-premium:hover{border-color:rgba(212,168,83,.32);box-shadow:0 9px 25px rgba(10,20,40,.085);transform:translateY(-1px);}}
.op-card-premium .op-address-strong{font-size:14px;line-height:1.4;font-weight:700;letter-spacing:-.015em;}
.op-card-premium .op-type-badge{letter-spacing:.01em;}
.op-card-premium .op-side-label{font-size:10px;letter-spacing:.065em;text-transform:uppercase;font-weight:650;}
.op-card-premium .op-card-side{gap:9px;}
.op-card-premium .op-progress{height:6px;border-radius:99px;overflow:hidden;}
.op-card-premium .op-progress>span{border-radius:99px;transition:width .25s ease,background-color .2s ease;}
.op-card-premium .op-actions .btn{border-radius:9px!important;min-height:34px;}
.op-card-premium .op-actions .op-more{border-radius:9px!important;}
.op-card-premium .op-folder-chip{border-radius:8px;}
@media (max-width:760px){
  .op-card-premium{box-shadow:0 2px 9px rgba(10,20,40,.035);}
  .op-card-premium .op-address-strong{font-size:13px;}
  .op-card-premium .op-card-side{gap:7px;}
  .op-card-premium .op-actions .btn{min-height:36px;}
}
@media (prefers-reduced-motion:reduce){.op-card-premium,.op-card-premium .op-progress>span{transition:none!important;}}

/* 5.17: progreso siempre visible, incluso en iPhone y en operaciones individuales. */
.op-card-premium .op-side-progress{display:block!important;min-width:110px;}
.op-card-premium .op-progress-row{min-width:110px;}
.op-card-premium .op-progress{min-width:54px;height:7px;}
.op-card-premium .op-progress>span{transition:width .22s ease,background-color .22s ease;}
@media (max-width:760px){.op-card-premium .op-side-progress{flex:1 1 125px;max-width:none;}}
/* DOCWORKS 5.15 — Operaciones: Abrir, Editar y más acciones siempre en una fila. */
.op-card .op-card-side .op-actions{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:5px!important;width:100%;}
.op-card .op-card-side .op-actions>.btn{flex:1 1 0!important;min-width:0!important;padding-left:7px!important;padding-right:7px!important;white-space:nowrap;}
.op-card .op-card-side .op-actions .op-more{flex:0 0 34px!important;min-width:34px!important;max-width:34px!important;}
@media (max-width:760px){.op-card .op-card-side .op-actions{width:auto;max-width:100%;margin-left:auto;}.op-card .op-card-side .op-actions>.btn{flex:0 1 auto!important;}}
/* DOCWORKS 4.08 — pulido responsive de facturación, soporte y acciones de Operaciones. */
.dw-payment-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
.dw-payment-row:last-child{border-bottom:0;}
@media (max-width:760px){
  .dw-billing-layout{grid-template-columns:minmax(0,1fr)!important;}
  .dw-payment-row{align-items:flex-start;flex-direction:column;gap:8px;}
  .dw-payment-row>div:last-child{width:100%;justify-content:space-between!important;}
  .config-support-grid .card{min-width:0;}
}
@media (max-width:640px){
  .op-card .op-card-side .op-actions{margin-left:auto;justify-content:flex-end;width:100%;}
  .op-card .op-card-side .op-actions .btn{flex:0 0 auto!important;}
  .op-card .op-card-side .op-actions .op-more{flex:0 0 36px!important;}
}
/* Compatibilidad general (iPhone, Android, tablets): notch en horizontal, pantallas angostas y contenido que no se desborda. */
@media (hover:none) and (pointer:coarse){
  .app-wrap{padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px);box-sizing:border-box;}
  button,.btn,select,input,textarea{touch-action:manipulation;}
}
img,video,canvas,svg{max-width:100%;}
.op-card,.card,.modal-body{overflow-wrap:break-word;}
@media (max-width:360px){
  .mobile-nav-item span:last-child{font-size:8.5px!important;}
  .op-folder-docs{padding-left:6px;}
  .modal-body{padding-left:12px!important;padding-right:12px!important;}
}
/* DOCWORKS 4.08 — conteo de documentos discreto y comprensible en móvil. */
.op-docs-count{font-size:12px;font-weight:600;color:var(--dim);letter-spacing:.01em;}
.op-docs-short{display:none;}
@media (max-width:760px){
  .op-card .op-side-progress{display:block!important;min-width:110px;}
  .op-card .op-docs-full{display:none!important;}
  .op-card .op-docs-short{display:inline!important;font-weight:600;font-size:11px;color:var(--dim);}
}
/* Botón sutil de revisión con IA. */
.dw-chip-btn{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;border:1px solid var(--border2);background:var(--surface2);color:var(--muted);font-size:11.5px;font-weight:700;cursor:pointer;line-height:1.2;white-space:nowrap;transition:all .15s ease;}
.dw-chip-btn:hover{border-color:var(--gold-line);color:var(--gold);}
.dw-chip-btn:disabled{opacity:.55;cursor:default;}
.dw-chip-ia span{color:var(--gold);font-size:12px;}
/* Iconos formales (4.16): una sola tinta, heredan el color del tema claro/oscuro. */
.dw-ico{display:inline-block;vertical-align:-0.22em;flex:0 0 auto;transition:color .15s ease,stroke-width .15s ease;}
.sidebar .nav-item{height:46px;}
.sidebar .nav-item .dw-ico,.mobile-nav-item .dw-ico{display:block;}
.sidebar .nav-item.active .dw-ico,.mobile-nav-item.active .dw-ico{stroke-width:2;}
.sidebar-bottom-icon:focus-visible,.sidebar .nav-item:focus-visible,.mobile-nav-item:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
.mobile-nav-item{position:relative;}
.mobile-nav-item.active::after{content:"";position:absolute;top:0;left:32%;right:32%;height:2px;border-radius:0 0 2px 2px;background:var(--gold);}
/* DOCWORKS 4.08 — facturación legible en tablet y móvil. */
@media (max-width:760px){
  .configuracion-view [style*="minmax(280px,.85fr)"]{grid-template-columns:minmax(0,1fr)!important;}
  .sa-detail-row{gap:8px!important;flex-wrap:wrap!important;align-items:flex-start!important;}
  .sa-detail-row>div:last-child{flex-wrap:wrap!important;justify-content:flex-start!important;}
}
/* DOCWORKS 4.11 PRO — encabezado de documentos consistente en móvil para todos los tipos. */
@media (max-width:640px){
  .viewer-modal .modal-head{align-items:flex-start!important;gap:7px!important;padding:calc(env(safe-area-inset-top,0px) + 7px) 10px 9px!important;}
  .viewer-modal .modal-head > div:first-child{flex:1 1 0!important;min-width:0!important;gap:4px!important;align-items:center!important;}
  .viewer-modal .modal-title{flex:0 1 auto!important;min-width:0!important;max-width:38vw!important;font-size:15px!important;line-height:1.15!important;white-space:normal!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;text-overflow:ellipsis!important;}
  .viewer-modal .modal-head > div:last-child{gap:4px!important;margin-left:0!important;align-items:flex-start!important;}
  .viewer-modal .modal-close{width:36px!important;height:36px!important;min-width:36px!important;margin-top:-2px!important;border-radius:10px!important;}
  .viewer-modal .doc-header-actions{gap:4px!important;}
  .viewer-modal .doc-header-actions .doc-action{min-width:36px!important;min-height:36px!important;padding:6px 8px!important;gap:0!important;}
  .viewer-modal .doc-header-actions .doc-action-share span{display:none!important;}
  .viewer-modal .doc-header-actions .doc-action-share{width:36px!important;padding:0!important;}
  .viewer-modal .doc-header-actions .doc-action svg{width:15px!important;height:15px!important;}
  .viewer-modal .doc-header-actions .doc-action-edit span{font-size:10px!important;}
  .viewer-modal .doc-header-actions .doc-action-download{min-width:36px!important;height:36px!important;padding:0 7px!important;}
  .viewer-modal .doc-header-actions .doc-action-download > span:not(.doc-download-chevron){font-size:10px!important;}
  .viewer-modal .doc-summary-panel .op-detail-title{font-size:clamp(16px,4.5vw,19px)!important;line-height:1.22!important;overflow-wrap:anywhere;word-break:normal;}
  .viewer-modal .doc-ai-review-card{border-radius:12px!important;padding:12px!important;}
}
@media (max-width:390px){
  .viewer-modal .modal-title{max-width:31vw!important;font-size:14px!important;}
  .viewer-modal .doc-header-actions .doc-action-edit span{display:none!important;}
  .viewer-modal .doc-header-actions .doc-action-edit{width:36px!important;padding:0!important;}
  .viewer-modal .doc-header-actions .doc-action-download > span:not(.doc-download-chevron){display:none!important;}
  .viewer-modal .doc-header-actions .doc-action-download .doc-download-chevron{display:none!important;}
}

/* DOCWORKS 4.11 PRO — correcciones puntuales de legibilidad móvil, tema y giro. */
/* El título vuelve a una jerarquía sobria: una línea, sin saltos forzados ni competir con acciones. */
.viewer-modal .modal-head{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;}
.viewer-modal .modal-head>div:first-child{flex:1 1 auto!important;min-width:0!important;order:0!important;flex-wrap:nowrap!important;}
.viewer-modal .modal-head>div:last-child{flex:0 0 auto!important;order:0!important;margin-left:auto!important;}
.viewer-modal .modal-title{display:block!important;min-width:0!important;max-width:min(430px,45vw)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:16px!important;line-height:1.25!important;letter-spacing:-.015em!important;}
@media(max-width:640px){
 .viewer-modal .modal-head{padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 9px!important;align-items:center!important;}
 .viewer-modal .modal-head>div:first-child{flex:1 1 0!important;gap:5px!important;}
 .viewer-modal .modal-title{max-width:calc(100vw - 176px)!important;font-size:14px!important;line-height:1.2!important;white-space:nowrap!important;display:block!important;-webkit-line-clamp:unset!important;}
 .viewer-modal .modal-head>div:last-child{flex:0 0 auto!important;justify-content:flex-end!important;}
 .viewer-modal .modal-head .modal-close{margin-top:0!important;}
 .viewer-modal .doc-summary-panel{overflow:visible!important;}
 .viewer-modal .doc-viewer-tab-content.doc-tab-static{overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;}
 .viewer-modal .doc-ai-review-card{max-height:none!important;overflow:visible!important;margin-top:12px!important;}
 .viewer-modal .doc-ai-review-card [style*="maxHeight"]{max-height:none!important;overflow:visible!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;word-break:normal!important;}
 .viewer-modal .doc-summary-hero,.viewer-modal .op-detail-hero{min-width:0!important;}
 .viewer-modal .op-detail-title{font-size:17px!important;line-height:1.25!important;letter-spacing:-.01em!important;overflow-wrap:break-word!important;word-break:normal!important;}
 .dw-chip-ia{white-space:normal!important;text-align:center!important;max-width:100%!important;min-height:36px!important;}
}
/* Controles que no heredaban las variables del tema: el modo oscuro debe afectar su superficie y texto. */
[data-theme="dark"] .dw-chip-btn,
[data-theme="dark"] .filtros-btn,
[data-theme="dark"] .sa-tab,
[data-theme="dark"] .doc-viewer-tab,
[data-theme="dark"] .doc-viewer-tabs button:not(.active){background:var(--surface2)!important;color:var(--text)!important;border-color:var(--border2)!important;}
[data-theme="dark"] .dw-chip-btn:hover,
[data-theme="dark"] .filtros-btn:hover,
[data-theme="dark"] .sa-tab:hover{background:var(--hover-bg)!important;color:var(--gold)!important;}
[data-theme="dark"] .btn-secondary,
[data-theme="dark"] .btn-ghost{background:var(--surface2);color:var(--text);border-color:var(--border2);}
[data-theme="dark"] .dw-chip-ia span{color:var(--gold)!important;}
/* En tablets no fijar dimensiones que puedan impedir el reflujo al girar. La orientación any la permite el manifest; el layout se adapta. */
@media (orientation:landscape) and (min-width:641px) and (max-width:1180px){
 .app-wrap,.app-body,.main,.content{width:100%!important;max-width:100%!important;min-width:0!important;}
 .content{overflow-x:hidden!important;}
 .grid2{grid-template-columns:repeat(2,minmax(0,1fr));}
 .viewer-modal{width:min(96vw,1100px)!important;max-width:96vw!important;height:calc(100dvh - 24px)!important;max-height:calc(100dvh - 24px)!important;}
}

/* ═══ DOCWORKS 4.16 — panel lateral y barra superior fijos; tablet vertical con navegación inferior ═══ */
/* En tablet y pantallas medianas el scroll es el de la página (html/body con overflow-x oculto),
   donde position:sticky no se "pega". Se usa position:fixed para que el panel no se mueva al scrollear. */
@media (min-width:641px) and (max-width:1100px), (hover:none) and (pointer:coarse) and (min-width:641px){
  :root{--dw-sidebar-w:68px;--dw-topbar-h:calc(64px + env(safe-area-inset-top,0px));}
  .app-wrap{box-sizing:border-box;padding-top:var(--dw-topbar-h)!important;}
  .topbar{position:fixed!important;top:0;left:0;right:0;z-index:60;box-sizing:border-box;height:var(--dw-topbar-h);padding-top:env(safe-area-inset-top,0px);padding-left:max(22px,env(safe-area-inset-left,0px));padding-right:max(22px,env(safe-area-inset-right,0px));}
  .sidebar{position:fixed!important;left:env(safe-area-inset-left,0px);top:var(--dw-topbar-h);bottom:0;height:auto!important;width:var(--dw-sidebar-w)!important;box-sizing:border-box;z-index:45;padding-bottom:calc(14px + env(safe-area-inset-bottom,0px));}
  .app-body{padding-left:var(--dw-sidebar-w);box-sizing:border-box;}
}
/* Dedo en pantalla: sin tooltips y con scroll propio si la altura no alcanza (teléfono horizontal). */
@media (hover:none) and (pointer:coarse){
  .sidebar{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:none;overscroll-behavior:contain;}
  .sidebar::-webkit-scrollbar{display:none;}
  .nav-item .tooltip{display:none!important;}
}
/* Tablet en vertical (la clase la pone la app al detectar tablet + orientación vertical):
   las secciones pasan a la barra inferior, igual que en un celular. Al rotar vuelve el panel a la izquierda. */
html.dw-tablet-portrait .sidebar{display:none!important;}
html.dw-tablet-portrait .app-body{padding-left:0!important;}
html.dw-tablet-portrait .mobile-nav{display:block!important;}
html.dw-tablet-portrait .mobile-nav-inner{max-width:760px;margin:0 auto;}
html.dw-tablet-portrait .mobile-nav-item span:last-child{font-size:11px;}
html.dw-tablet-portrait .content{padding-bottom:calc(54px + max(3px,calc(env(safe-area-inset-bottom,0px) - 20px)) + 32px)!important;}
html.dw-tablet-portrait .ia-fab{bottom:calc(54px + max(3px,calc(env(safe-area-inset-bottom,0px) - 20px)) + 20px)!important;}
/* Teléfono de las partes: campo + interruptor "mostrar en el documento". */
.dw-tel-row{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;}
.dw-tel-field{flex:1 1 220px;min-width:0;}
.dw-tel-switch{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 14px 0 10px;border-radius:12px;border:1px solid var(--border2);background:var(--surface2,transparent);color:var(--muted);font-weight:600;font-size:12.5px;line-height:1.2;font-family:inherit;cursor:pointer;margin-bottom:2px;text-align:left;}
.dw-tel-switch .dw-tel-knob{position:relative;flex:0 0 auto;width:38px;height:22px;border-radius:999px;background:var(--border2);transition:background .18s ease;}
.dw-tel-switch .dw-tel-knob::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .18s ease;}
.dw-tel-switch.on{border-color:var(--gold-line);background:var(--gold-soft);color:var(--text);}
.dw-tel-switch.on .dw-tel-knob{background:var(--gold);}
.dw-tel-switch.on .dw-tel-knob::after{transform:translateX(16px);}
.dw-tel-switch:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
/* Botón "Instalar" de las barras superiores. */
.dw-install-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.34);background:rgba(255,255,255,.08);color:#fff;font-weight:600;font-size:12px;line-height:1;font-family:inherit;cursor:pointer;white-space:nowrap;flex-shrink:0;}
.dw-install-btn:hover{background:rgba(255,255,255,.16);}


/* DOCWORKS 4.27 PRO — todas las casillas son interruptores estilo iPhone. */
input[type="checkbox"]{appearance:none!important;-webkit-appearance:none!important;position:relative!important;display:inline-block!important;flex:0 0 auto!important;width:46px!important;height:28px!important;min-width:46px!important;min-height:28px!important;margin:0 8px 0 0!important;padding:0!important;border:0!important;border-radius:999px!important;background:rgba(120,130,150,.38)!important;background-image:none!important;cursor:pointer!important;vertical-align:middle!important;transition:background-color .22s ease!important;-webkit-tap-highlight-color:transparent;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)!important;}
input[type="checkbox"]::before{content:""!important;position:absolute!important;top:2px!important;left:2px!important;width:24px!important;height:24px!important;border-radius:50%!important;background:#fff!important;box-shadow:0 2px 5px rgba(0,0,0,.32),0 0 0 .5px rgba(0,0,0,.08)!important;transition:transform .22s cubic-bezier(.3,.9,.3,1.1)!important;}
input[type="checkbox"]:checked{background-color:var(--gold)!important;}
input[type="checkbox"]:checked::before{transform:translateX(18px)!important;}
input[type="checkbox"]:active::before{width:28px!important;}
input[type="checkbox"]:checked:active::before{transform:translateX(14px)!important;}
input[type="checkbox"]:focus-visible{outline:2px solid var(--gold)!important;outline-offset:2px!important;}
input[type="checkbox"]:disabled{opacity:.4!important;cursor:not-allowed!important;}
label:has(>input[type="checkbox"]){line-height:1.3;}
.dw-ios-sw{position:relative;display:inline-block;flex:0 0 auto;width:46px;height:28px;border-radius:999px;background:rgba(120,130,150,.38);transition:background-color .22s ease;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}
.dw-ios-sw::before{content:"";position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.32);transition:transform .22s cubic-bezier(.3,.9,.3,1.1);}
.dw-ios-sw.on{background:var(--gold);}
.dw-ios-sw.on::before{transform:translateX(18px);}
.dw-ios-sw.locked{opacity:.55;}
.dw-ios-round{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:24px;height:24px;border-radius:50%;border:2px solid var(--border2);background:transparent;transition:background-color .2s ease,border-color .2s ease;}
.dw-ios-round.on{background:var(--gold);border-color:var(--gold);}
/* Interruptor "mostrar teléfono": misma perilla iPhone. */
.dw-tel-switch .dw-tel-knob{width:46px!important;height:28px!important;background:rgba(120,130,150,.38)!important;}
.dw-tel-switch .dw-tel-knob::after{top:2px!important;left:2px!important;width:24px!important;height:24px!important;transition:transform .22s cubic-bezier(.3,.9,.3,1.1)!important;}
.dw-tel-switch.on .dw-tel-knob{background:var(--gold)!important;}
.dw-tel-switch.on .dw-tel-knob::after{transform:translateX(18px)!important;}
/* Video de inicio: nunca mostrar el botón Play nativo de iPhone. */
.dw-splash-video::-webkit-media-controls,.dw-splash-video::-webkit-media-controls-start-playback-button,.dw-splash-video::-webkit-media-controls-panel,.dw-splash-video::-webkit-media-controls-overlay-play-button{display:none!important;-webkit-appearance:none!important;opacity:0!important;pointer-events:none!important;}
.dw-splash-video{pointer-events:none;}
/* 4.29 — campos faltantes en rojo, pantalla de carga, visor a pantalla completa en iPhone, sin doble scroll y campos más cortos. */
[data-falta="1"]{border-color:#ef4444!important;background:rgba(239,68,68,.07)!important;box-shadow:0 0 0 3px rgba(239,68,68,.18)!important;}
.dw-spin{width:26px;height:26px;border-radius:50%;border:3px solid rgba(212,168,83,.25);border-top-color:var(--gold);animation:dwspin .8s linear infinite;}
@keyframes dwspin{to{transform:rotate(360deg);}}
.dw-doc-toggles{display:flex;flex-direction:column;gap:10px;margin-top:2px;}
html.dw-modal-open,html.dw-modal-open body{overflow:hidden!important;overscroll-behavior:none;}
@media (max-width:640px){
  .modal-overlay-viewer{padding:0!important;align-items:stretch!important;background:#070d19!important;}
  .modal-overlay-viewer .viewer-modal{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;min-height:100dvh!important;border-radius:0!important;margin:0!important;}
  .viewer-modal .modal-body{padding-bottom:calc(14px + env(safe-area-inset-bottom,0px))!important;}
}
@media (min-width:641px){
  .modal-body .grid2>.field.col2:not(:has(textarea)):not(:has(select)){max-width:460px;}
  .modal-body .grid2>.field:not(.col2){max-width:320px;}
  .modal-body .grid2>.field.col2:has(textarea){max-width:none;}
}
/* La operación (visor, formularios, paneles) queda POR ENCIMA de la barra superior azul. */
.modal-overlay{z-index:3000!important;}
/* Tablet: "Nueva operación" y demás paneles como tarjeta centrada y proporcionada (no estirada). */
@media (min-width:641px) and (min-height:601px){
  .modal-overlay:not(.modal-overlay-viewer):not(.modal-overlay-soft){align-items:center!important;justify-content:center!important;padding:28px!important;}
  .modal-overlay:not(.modal-overlay-viewer):not(.modal-overlay-soft) .modal-box,
  .modal-overlay:not(.modal-overlay-viewer):not(.modal-overlay-soft) .modal-box.wide{width:min(640px,calc(100vw - 56px))!important;max-width:640px!important;height:auto!important;min-height:0!important;max-height:min(84dvh,780px)!important;border-radius:22px!important;box-shadow:0 24px 70px rgba(0,0,0,.45)!important;}
  .modal-overlay:not(.modal-overlay-viewer):not(.modal-overlay-soft) .modal-box.narrow{width:min(460px,calc(100vw - 56px))!important;max-width:460px!important;}
  .modal-overlay:not(.modal-overlay-viewer):not(.modal-overlay-soft) .modal-head{border-radius:22px 22px 0 0!important;}
}
/* 5.14 PRO — Panel Nueva/Editar operación: prioridad sobre el límite de 640px de tablet. */
@media (min-width:641px){
  .modal-overlay.modal-overlay-operation-form:not(.modal-overlay-viewer):not(.modal-overlay-soft) .modal-box.wide{
    width:min(96vw,1100px)!important;max-width:1100px!important;
    height:calc(100dvh - 24px)!important;max-height:calc(100dvh - 24px)!important;
    border-radius:20px!important;
  }
}
/* 5.12 PRO — El formulario Nueva/Editar operación tiene el mismo cuadrante amplio
   que el visor de operaciones. El resto de los diálogos conserva su tamaño. */
@media (min-width:641px){
  .modal-overlay.modal-overlay-operation-form{padding:12px!important;align-items:center!important;justify-content:center!important;}
  .modal-overlay.modal-overlay-operation-form .modal-box.wide{
    width:min(96vw,1100px)!important;max-width:1100px!important;
    height:calc(100dvh - 24px)!important;max-height:calc(100dvh - 24px)!important;
    min-height:0!important;border-radius:20px!important;
  }
  .modal-overlay.modal-overlay-operation-form .modal-body{min-height:0!important;overflow-y:auto!important;}
}
@media (max-width:640px){
  .modal-overlay.modal-overlay-operation-form .modal-box.wide{
    max-height:calc(100dvh - 20px)!important;max-height:calc(100svh - 20px)!important;
    border-radius:20px 20px 0 0!important;
  }
  @supports (height:100dvh){
    .modal-overlay.modal-overlay-operation-form .modal-box.wide{max-height:calc(100dvh - 20px)!important;}
  }
}
.dw-viewer-heading{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0;max-width:100%;line-height:1.15;}
.dw-viewer-heading-type{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
.dw-viewer-heading-operation{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;line-height:1.25;color:rgba(255,255,255,.78);white-space:normal;overflow-wrap:anywhere;max-width:100%;}
@media(max-width:640px){.dw-viewer-heading-type{font-size:14px}.dw-viewer-heading-operation{font-size:10.5px;max-width:calc(100vw - 190px)}}

/* 4.40 — confirmaciones legibles en iPhone: el texto puede desplazarse y los botones permanecen accesibles. */
@media(max-width:640px){
  .dw-confirm-overlay{align-items:flex-end!important;justify-content:center!important;padding:0 0 env(safe-area-inset-bottom,0px)!important;overflow-y:auto!important;}
  .dw-confirm-overlay .dw-confirm-box{width:100%!important;max-width:100%!important;max-height:calc(100dvh - env(safe-area-inset-top,0px) - 8px)!important;border-radius:20px 20px 0 0!important;flex:0 1 auto!important;}
  .dw-confirm-overlay .dw-confirm-box .modal-head{flex:0 0 auto!important;}
  .dw-confirm-overlay .dw-confirm-box .modal-body{min-height:0!important;overflow-y:auto!important;padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))!important;}
  .dw-confirm-overlay .dw-confirm-box .modal-body>div:last-child{position:sticky;bottom:0;background:var(--card);padding-top:8px;}
}


`;

// Panel Superadmin: extracción funcional con dependencias explícitas.
import {useState,useEffect} from "react";
export function crearSuperAdminDashboard(deps){
  const { AUTH_RED, AUTH_MUTED, descargarCSV, loadSupabaseJs, traducirError, Field, dwNotify, requestDwConfirm, fmt$, Modal, DWIcon } = deps;
var ESTADOS_MEMBRESIA = ["activa","pendiente","vencida","suspendida","cancelada","archivada"];
var ESTADO_MEMBRESIA_COLOR = { activa:"var(--green,#4ade80)", pendiente:"var(--amber,#fbbf24)", vencida:AUTH_RED, suspendida:AUTH_RED, cancelada:AUTH_MUTED, archivada:AUTH_MUTED };


function saDiasHasta(fecha){
  if(!fecha) return null;
  var d=new Date(fecha); if(isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime()-Date.now())/86400000);
}
function saFechaCorta(fecha){
  if(!fecha) return "—";
  var d=new Date(fecha); return isNaN(d.getTime())?String(fecha):d.toLocaleDateString("es-AR");
}
function saEstadoVencimiento(fecha,estado){
  var dias=saDiasHasta(fecha);
  if(dias===null) return {dias:null,tone:ESTADO_MEMBRESIA_TONE[estado]||"dim",label:"Sin vencimiento"};
  if(dias<0) return {dias:dias,tone:"red",label:"Vencida hace "+Math.abs(dias)+" días"};
  if(dias===0) return {dias:dias,tone:"red",label:"Vence hoy"};
  return {dias:dias,tone:dias<=7?"red":dias<=30?"amber":"green",label:"Vence en "+dias+" días"};
}
function saDescargarCSVConFiltros(filas,nombre){ return descargarCSV(filas,nombre); }

function useSuperAdmin(activo){
  var [dashboard,setDashboard]=useState(null);
  var [inmobiliarias,setInmobiliarias]=useState([]);
  var [planes,setPlanes]=useState([]);
  var [loading,setLoading]=useState(false);
  var [error,setError]=useState(null);
  var [registroSolicitudes,setRegistroSolicitudes]=useState([]);
  var [registroSolicitudesLoading,setRegistroSolicitudesLoading]=useState(false);
  var [metricasUso,setMetricasUso]=useState(null);
  var [anuncioGlobal,setAnuncioGlobal]=useState(null);
  var [metricasLoading,setMetricasLoading]=useState(false);

  function rpc(nombre, params={}){
    return loadSupabaseJs().then(function(sb){
      if (!sb) return { error:{ message:"No se pudo conectar con Supabase." } };
      return sb.rpc(nombre, params);
    });
  }

  function recargar(){
    setLoading(true); setError(null);
    Promise.all([ rpc("fn_super_dashboard"), rpc("fn_super_listar_inmobiliarias"), rpc("fn_super_listar_planes"), rpc("fn_super_metricas_uso", {}) ]).then(function(res){
      setLoading(false);
      if (res[0].error) { setError(traducirError(res[0].error.message)); return; }
      setDashboard(res[0].data);
      setInmobiliarias(res[1].error ? [] : (res[1].data||[]));
      setPlanes(res[2].error ? [] : (res[2].data||[]));
      setMetricasUso(res[3].error ? null : (res[3].data||null));
    }).catch(function(err){ setLoading(false); setError(traducirError(err && err.message ? err.message : "No se pudieron cargar el panel.")); });
  }

  useEffect(function(){ if (activo) { recargar(); cargarRegistroSolicitudes(); cargarAnuncio(); } }, [activo]);

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


  function registrarPago(params){
    return rpc("fn_super_registrar_pago", params).then(function(res){ if(!res.error){ if(params&&params.p_inmobiliaria_id) cargarDetalle(params.p_inmobiliaria_id); cargarPagos(params&&params.p_inmobiliaria_id||null); recargar(); } return res; });
  }
  function extenderMembresia(id,dias,modo,nota){
    return rpc("fn_super_extender_membresia", {p_inmobiliaria_id:id,p_dias:dias,p_modo:modo||"extension",p_nota:nota||null}).then(function(res){ if(!res.error){cargarDetalle(id);recargar();} return res; });
  }
  function reenviarInvitacion(usuarioId,detalleId){ return rpc("fn_super_reenviar_invitacion", {p_usuario_id:usuarioId}).then(function(res){ if(!res.error&&detalleId) cargarDetalle(detalleId); return res; }); }
  function resetPassword(usuarioId,detalleId){ return rpc("fn_super_reset_password", {p_usuario_id:usuarioId}).then(function(res){ if(!res.error&&detalleId) cargarDetalle(detalleId); return res; }); }
  function transferirDueno(inmobiliariaId,usuarioId){ return rpc("fn_super_transferir_dueno", {p_inmobiliaria_id:inmobiliariaId,p_nuevo_dueno_usuario_id:usuarioId}).then(function(res){ if(!res.error) cargarDetalle(inmobiliariaId); return res; }); }
  function guardarNotaInmobiliaria(id,nota){ return rpc("fn_super_nota_inmobiliaria", {p_inmobiliaria_id:id,p_nota:nota||null}).then(function(res){ if(!res.error) cargarDetalle(id); return res; }); }
  function archivarInmobiliaria(id,archivar){ return rpc("fn_super_archivar_inmobiliaria", {p_inmobiliaria_id:id,p_archivar:!!archivar}).then(function(res){ if(!res.error){cargarDetalle(id);recargar();} return res; }); }
  function setLimites(id,limite){ return rpc("fn_super_set_limites", {p_inmobiliaria_id:id,p_limite_usuarios:limite===null||limite===""?null:parseInt(limite,10)}).then(function(res){ if(!res.error){cargarDetalle(id);recargar();} return res; }); }
  function setAnuncio(params){ return rpc("fn_super_set_anuncio", params).then(function(res){ if(!res.error){setAnuncioGlobal(res.data||params);recargar();} return res; }); }
  function cargarAnuncio(){ return rpc("fn_super_get_anuncio_global", {}).then(function(res){ if(!res.error) setAnuncioGlobal(res.data||null); return res; }); }

  return { dashboard:dashboard, inmobiliarias:inmobiliarias, planes:planes, loading:loading, error:error, recargar:recargar,
    crearInmobiliaria:crearInmobiliaria, editarInmobiliaria:editarInmobiliaria, asignarPlan:asignarPlan,
    setEstadoMembresia:setEstadoMembresia, crearPlan:crearPlan, editarPlan:editarPlan,
    detalle:detalle, detalleLoading:detalleLoading, detalleError:detalleError, cargarDetalle:cargarDetalle, limpiarDetalle:limpiarDetalle,
    detalleClausulas:detalleClausulas, detallePlantillas:detallePlantillas, detalleClausulasLoading:detalleClausulasLoading,
    setEstadoUsuario:setEstadoUsuario, setRolUsuario:setRolUsuario,
    auditoria:auditoria, auditoriaLoading:auditoriaLoading, cargarAuditoria:cargarAuditoria,
    pagos:pagos, pagosLoading:pagosLoading, cargarPagos:cargarPagos, registroSolicitudes:registroSolicitudes, registroSolicitudesLoading:registroSolicitudesLoading, cargarRegistroSolicitudes:cargarRegistroSolicitudes, resolverRegistroSolicitud:resolverRegistroSolicitud, enviarRegistroSolicitud:enviarRegistroSolicitud, metricasUso:metricasUso, anuncioGlobal:anuncioGlobal, registrarPago:registrarPago, extenderMembresia:extenderMembresia, reenviarInvitacion:reenviarInvitacion, resetPassword:resetPassword, transferirDueno:transferirDueno, guardarNotaInmobiliaria:guardarNotaInmobiliaria, archivarInmobiliaria:archivarInmobiliaria, setLimites:setLimites, setAnuncio:setAnuncio, cargarAnuncio:cargarAnuncio };
}


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
var ESTADO_MEMBRESIA_TONE = { activa:"green", pendiente:"amber", vencida:"red", suspendida:"red", cancelada:"dim", archivada:"dim" };
var ROL_TONE  = { dueno:"gold", admin:"teal", broker:"green", vendedor:"purple", viewer:"dim" };
var ROLES_BASE = ["dueno","admin","broker","vendedor","viewer"];

function SABadge({children=undefined,tone="dim"}){
  var t = SA_TONE[tone]||SA_TONE.dim;
  return <span className="badge" style={{background:t.bg,color:t.fg,border:"1px solid "+t.bd}}>{children}</span>;
}
function SAEmpty({children=undefined}){
  return <div className="op-card" style={{textAlign:"center",padding:"28px 16px",color:"var(--dim)",fontSize:12.5,cursor:"default"}}>{children}</div>;
}
function SASection({title,children=undefined,right=null}){
  return (
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,gap:10}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",letterSpacing:0.3}}>{title}</div>
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
  var [filtroPlan,setFiltroPlan] = useState("todos");
  var [ordenInmob,setOrdenInmob] = useState("alta_desc");
  var [anuncioForm,setAnuncioForm] = useState({mensaje:"",fecha_fin:""});
  var [limiteCustom,setLimiteCustom] = useState("");
  var [notaInmob,setNotaInmob] = useState("");
  var [showPagoManual,setShowPagoManual] = useState(false);
  var [pagoForm,setPagoForm] = useState({monto:"",moneda:"ARS",metodo:"Transferencia bancaria",fecha:new Date().toISOString().slice(0,10),periodo_desde:"",periodo_hasta:"",nota:""});

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
    if (filtroPlan!=="todos" && String(i.plan_codigo||i.plan_nombre||"")!==String(filtroPlan)) return false;
    var q=busqueda.toLowerCase().trim();
    if(q){ var hay=[i.inmobiliaria_nombre,i.dueno_nombre,i.dueno_email,i.owner_nombre,i.owner_email,i.email_dueno].map(function(v){return String(v||"").toLowerCase();}).join(" "); if(hay.indexOf(q)===-1) return false; }
    return true;
  }).sort(function(a,b){
    var av=ordenInmob==="actividad_desc"?(a.ultima_actividad||a.ultimo_acceso||a.updated_at||a.created_at):(a.created_at||a.fecha_alta||"");
    var bv=ordenInmob==="actividad_desc"?(b.ultima_actividad||b.ultimo_acceso||b.updated_at||b.created_at):(b.created_at||b.fecha_alta||"");
    return new Date(bv||0).getTime()-new Date(av||0).getTime();
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

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:18}}>
                <div className="stat-card" style={{padding:13,textAlign:"left"}}><div style={{fontSize:12,color:"var(--dim)",fontWeight:700}}>INACTIVAS · 30 DÍAS</div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,marginTop:4}}>{sa.metricasUso&&sa.metricasUso.inmobiliarias_inactivas_30_dias!=null?sa.metricasUso.inmobiliarias_inactivas_30_dias:"—"}</div></div>
                <div className="stat-card" style={{padding:13,textAlign:"left"}}><div style={{fontSize:12,color:"var(--dim)",fontWeight:700}}>OPERACIONES · MES</div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,marginTop:4}}>{sa.metricasUso&&sa.metricasUso.operaciones_mes!=null?sa.metricasUso.operaciones_mes:"—"}</div></div>
                <div className="stat-card" style={{padding:13,textAlign:"left"}}><div style={{fontSize:12,color:"var(--dim)",fontWeight:700}}>USUARIOS ACTIVOS</div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,marginTop:4}}>{sa.metricasUso&&sa.metricasUso.usuarios_activos!=null?sa.metricasUso.usuarios_activos:"—"}</div></div>
                <div className="stat-card" style={{padding:13,textAlign:"left"}}><div style={{fontSize:12,color:"var(--dim)",fontWeight:700}}>INGRESOS · MES</div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,marginTop:6}}>{sa.metricasUso&&sa.metricasUso.ingresos_mes_por_plan?Object.keys(sa.metricasUso.ingresos_mes_por_plan).map(function(k){return <div key={k}>{k}: {sa.metricasUso.ingresos_mes_por_plan[k]}</div>;}):"—"}</div></div>
              </div>
              <SASection title="Anuncio global" right={<SABadge tone="gold">VISIBLE PARA TODOS</SABadge>}>
                <div className="op-card" style={{padding:14}}>
                  <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 170px auto",gap:9,alignItems:"end"}}>
                    <Field label="Mensaje"><input className="inp" value={anuncioForm.mensaje} onChange={function(e){setAnuncioForm(function(f){return Object.assign({},f,{mensaje:e.target.value});});}} placeholder="Mensaje que verán los usuarios al entrar"/></Field>
                    <Field label="Fecha de fin"><input className="inp" type="date" value={anuncioForm.fecha_fin} onChange={function(e){setAnuncioForm(function(f){return Object.assign({},f,{fecha_fin:e.target.value});});}}/></Field>
                    <button className="btn btn-primary" onClick={function(){sa.setAnuncio({p_mensaje:anuncioForm.mensaje||null,p_fecha_fin:anuncioForm.fecha_fin||null}).then(function(res){if(!res.error)dwNotify("success","Anuncio global actualizado.");});}}>Publicar</button>
                  </div>
                  {sa.anuncioGlobal&&sa.anuncioGlobal.mensaje&&<div style={{marginTop:10,fontSize:12,color:"var(--dim)"}}>Actual: <b style={{color:"var(--text)"}}>{sa.anuncioGlobal.mensaje}</b> · hasta {saFechaCorta(sa.anuncioGlobal.fecha_fin)}</div>}
                </div>
              </SASection>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:24}}>
                <div className="stat-card" style={{padding:16,textAlign:"left",background:"linear-gradient(135deg,var(--surface),rgba(212,168,83,0.08))"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"var(--gold)",letterSpacing:".08em",textTransform:"uppercase"}}>Suscripciones</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:27,marginTop:5}}>{sa.dashboard.membresias_activas || 0}</div>
                  <div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>membresías activas</div>
                </div>
                <div className="stat-card" style={{padding:16,textAlign:"left"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"var(--dim)",letterSpacing:".08em",textTransform:"uppercase"}}>Cobros</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:27,marginTop:5}}>{sa.pagos.length}</div>
                  <div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>movimientos registrados</div>
                </div>
                <div className="stat-card" style={{padding:16,textAlign:"left"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"var(--dim)",letterSpacing:".08em",textTransform:"uppercase"}}>Medios</div>
                  <div style={{fontSize:14,fontWeight:700,marginTop:9}}>💳 Tarjetas · 🏦 Transferencia</div>
                  <div style={{fontSize:12,color:"var(--dim)",marginTop:5}}>listo para integrar pasarela</div>
                </div>
              </div>

              <SASection title="Facturación mensual" right={<SABadge tone="gold">PRECIOS VIGENTES</SABadge>}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:14}}>
                  {Object.keys(facturacionMensual).length===0 ? (
                    <div className="op-card" style={{padding:14,color:"var(--dim)",fontSize:12}}>No hay inmobiliarias activas con un precio mensual asignado.</div>
                  ) : Object.keys(facturacionMensual).map(function(moneda){
                    return (
                      <div key={moneda} className="stat-card" style={{padding:14,textAlign:"left"}}>
                        <div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>Facturación mensual · {moneda}</div>
                        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:25,color:"var(--gold)",marginTop:5}}>
                          {moneda+" "+facturacionMensual[moneda].toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2})}
                        </div>
                        <div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>Estimado según planes activos</div>
                      </div>
                    );
                  })}
                  <div className="stat-card" style={{padding:14,textAlign:"left"}}>
                    <div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>Usuarios activos</div>
                    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:25,color:"var(--text)",marginTop:5}}>{usuariosActivosFacturacion}</div>
                    <div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>En inmobiliarias activas</div>
                  </div>
                </div>

                {facturacionPorPlanLista.length>0 && (
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {facturacionPorPlanLista.map(function(p){
                      return (
                        <div key={p.nombre} className="op-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",padding:"11px 13px"}}>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700}}>{p.nombre}</div>
                            <div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>{p.inmobiliarias} inmobiliaria{p.inmobiliarias===1?"":"s"} · {p.usuarios} usuario{p.usuarios===1?"":"s"} activos · {p.moneda} {p.precio.toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2})} /mes</div>
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
                <input className="search-inp" value={busqueda} onChange={function(e){setBusqueda(e.target.value);}} placeholder="Buscar por nombre o email del dueño..."/>
              </div>
              <div style={{width:170}}>
                <select className="inp" value={filtroEstado} onChange={function(e){setFiltroEstado(e.target.value);}}>
                  <option value="todas">Todos los estados</option>
                  {ESTADOS_MEMBRESIA.map(function(e){return <option key={e} value={e}>{e}</option>;})}
                </select>
              </div>
              <div style={{width:160}}><select className="inp" value={filtroPlan} onChange={function(e){setFiltroPlan(e.target.value);}}><option value="todos">Todos los planes</option>{sa.planes.map(function(p){return <option key={p.id||p.codigo} value={p.codigo||p.nombre}>{p.nombre}</option>;})}</select></div>
              <div style={{width:170}}><select className="inp" value={ordenInmob} onChange={function(e){setOrdenInmob(e.target.value);}}><option value="alta_desc">Alta: más recientes</option><option value="actividad_desc">Actividad: más recientes</option></select></div>
              <button className="btn btn-primary" style={{marginLeft:"auto"}} onClick={function(){setShowNueva(true);}}>+ Nueva inmobiliaria</button><button className="btn btn-ghost btn-sm" onClick={function(){saDescargarCSVConFiltros(inmobiliariasFiltradas.map(function(i){return {nombre:i.inmobiliaria_nombre,email_dueno:i.dueno_email||i.owner_email||i.email_dueno||"",plan:i.plan_nombre,estado:i.estado,fecha_alta:i.created_at||i.fecha_alta,fecha_vencimiento:i.fecha_vencimiento||i.fecha_renovacion,usuarios_activos:i.usuarios_activos,limite_usuarios:i.limite_usuarios};}),"docworks-inmobiliarias.csv");}}>CSV</button>
            </div>
            <div style={{fontSize:12,color:"var(--dim)",marginBottom:12}}>
              {inmobiliariasFiltradas.length} de {sa.inmobiliarias.length} inmobiliarias
            </div>
            <div className="sa-list">
              {inmobiliariasFiltradas.length===0 && !sa.loading && <SAEmpty>No hay inmobiliarias que coincidan con la búsqueda.</SAEmpty>}
              {inmobiliariasFiltradas.map(function(i){
                var vencePronto = i.fecha_renovacion && (new Date(i.fecha_renovacion).getTime() - Date.now()) < 1000*60*60*24*7 && (new Date(i.fecha_renovacion).getTime() - Date.now()) > 0;
                return (
                  <div key={i.inmobiliaria_id} className="op-card" style={{padding:"16px 18px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
                        <SAAvatar nombre={i.inmobiliaria_nombre}/>
                        <div style={{minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:14}}>{i.inmobiliaria_nombre}</div>
                          <div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>
                            Plan {i.plan_nombre} · {i.usuarios_activos}/{i.limite_usuarios} usuarios · Vence {saFechaCorta(i.fecha_vencimiento||i.fecha_renovacion)}
                          </div>
                          <SABar value={i.usuarios_activos} max={i.limite_usuarios}/>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                        <SABadge tone={ESTADO_MEMBRESIA_TONE[i.estado]}>{i.estado}</SABadge>
                        {i.fecha_vencimiento&&<SABadge tone={saEstadoVencimiento(i.fecha_vencimiento,i.estado).tone}>{saEstadoVencimiento(i.fecha_vencimiento,i.estado).label}</SABadge>}
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
                  <div style={{minWidth:0,flex:1}}><div style={{fontWeight:700,color:"var(--text)",fontSize:14}}>{r.nombre}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:4}}>{r.email} · {r.inmobiliaria}</div>{r.telefono&&<div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{r.telefono}</div>}<div style={{fontSize:12,color:"var(--dim)",marginTop:7}}>{r.creada_en?new Date(r.creada_en).toLocaleString("es-AR"):""}</div></div>
                  <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}><SABadge tone={pendiente?"amber":(r.estado==="aprobada"?"green":"red")}>{r.estado||"pendiente"}</SABadge>{pendiente&&<><button className="btn-primary" onClick={function(){requestDwConfirm("¿Aprobar esta solicitud y crear la inmobiliaria con su invitación?",function(){sa.resolverRegistroSolicitud(r.id,true);});}}>Aprobar</button><button className="btn-secondary" onClick={function(){requestDwConfirm("¿Rechazar esta solicitud?",function(){sa.resolverRegistroSolicitud(r.id,false);});}}>Rechazar</button></>}</div>
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
                        <div style={{fontSize:12,color:"var(--dim)",marginTop:1}}>{p.codigo}</div>
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
              <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5}}>Registro global de las modificaciones de todas las inmobiliarias. Podés filtrar por inmobiliaria, acción o entidad y abrir cada registro para ver qué había antes y qué quedó después.</div>
            </div>
            <div className="filter-row" style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{flex:"1 1 220px",minWidth:190}}><select className="inp" value={auditFiltro} onChange={function(e){setAuditFiltro(e.target.value);setAuditExpandida(null);}}><option value="">Todas las inmobiliarias</option>{sa.inmobiliarias.map(function(i){return <option key={i.inmobiliaria_id} value={i.inmobiliaria_id}>{i.inmobiliaria_nombre}</option>;})}</select></div>
              <div style={{width:190}}><select className="inp" value={auditAccionFiltro} onChange={function(e){setAuditAccionFiltro(e.target.value);}}><option value="">Todas las acciones</option><option value="crear">Crear</option><option value="editar">Editar / actualizar</option><option value="eliminar">Eliminar / desactivar</option><option value="rol">Cambios de rol</option><option value="estado">Cambios de estado</option><option value="invitar">Invitaciones</option><option value="aprobar">Aprobaciones</option><option value="rechazar">Rechazos</option></select></div>
              <div style={{width:190}}><input className="inp" value={auditEntidadFiltro} onChange={function(e){setAuditEntidadFiltro(e.target.value);}} placeholder="Filtrar entidad…"/></div>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--dim)",whiteSpace:"nowrap"}}><input type="checkbox" checked={auditAccionFiltro==="super_admin"} onChange={function(e){setAuditAccionFiltro(e.target.checked?"super_admin":"");}}/> Acciones de super admin</label>
              {sa.auditoriaLoading && <div style={{fontSize:12,color:"var(--dim)"}}>Cargando…</div>}<button className="btn btn-ghost btn-sm" onClick={function(){saDescargarCSVConFiltros(sa.auditoria,"docworks-auditoria.csv");}}>CSV</button><div style={{marginLeft:"auto",fontSize:12,color:"var(--dim)"}}>{sa.auditoria.length} registros cargados</div>
            </div>
            <div className="sa-list">
              {!sa.auditoriaLoading && sa.auditoria.length===0 && <SAEmpty>Sin actividad registrada.</SAEmpty>}
              {sa.auditoria.map(function(a){
                var accion=(a.accion||"").toLowerCase();
                if(auditAccionFiltro){
                  if(auditAccionFiltro==="super_admin"){
                    var esSA = a.es_super_admin===true || String(a.origen||"").toLowerCase().indexOf("super")>-1 || String(a.rol_usuario||"").toLowerCase()==="super_admin" || String(a.rol||"").toLowerCase()==="super_admin";
                    if(!esSA) return null;
                  }
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
                  if(auditAccionFiltro!=="super_admin" && !coincideAccion) return null;
                }
                if(auditEntidadFiltro && String(a.entidad_tipo||"").toLowerCase().indexOf(auditEntidadFiltro.toLowerCase())===-1) return null;
                var expandida=auditExpandida===a.id; var cambios=saResumenCambios(a);
                return <div key={a.id} className="op-card" style={{padding:0,overflow:"hidden"}}>
                  <button type="button" onClick={function(){setAuditExpandida(expandida?null:a.id);}} style={{width:"100%",border:0,background:"transparent",color:"inherit",padding:"13px 16px",cursor:"pointer",textAlign:"left"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}><div className="sa-row-icon">{auditIcon(a.accion)}</div><div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:650}}>{a.accion||"Actividad"} <span style={{fontWeight:400,color:"var(--dim)"}}>· {a.entidad_tipo||"entidad"}</span></div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{a.inmobiliaria_nombre||"—"} · {a.usuario_nombre||a.usuario_email||"sistema"}{a.usuario_email&&a.usuario_nombre?" · "+a.usuario_email:""}</div></div></div><div style={{display:"flex",alignItems:"center",gap:10,whiteSpace:"nowrap"}}><span style={{fontSize:12,color:"var(--dim)"}}>{a.creada_en?new Date(a.creada_en).toLocaleString("es-AR"):""}</span><span style={{fontSize:13,color:"var(--dim)"}}>{expandida?"⌃":"⌄"}</span></div></div>
                  </button>
                  {expandida&&<div style={{padding:"0 16px 16px 60px",borderTop:"1px solid var(--border)",background:"rgba(255,255,255,0.015)"}}><div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:12,color:"var(--dim)",padding:"10px 0"}}><span>ID: {a.entidad_id||"—"}</span><span>Origen: {a.origen||"—"}</span>{a.solicitud_id&&<span>Solicitud: {a.solicitud_id}</span>}</div>{cambios&&Array.isArray(cambios)?<div style={{display:"flex",flexDirection:"column",gap:7}}>{cambios.map(function(c){return <div key={c.campo} style={{padding:"9px 10px",borderRadius:8,border:"1px solid var(--border)",background:"rgba(0,0,0,0.08)"}}><div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:5}}>{c.campo}</div><div style={{fontSize:12,color:"var(--dim)",lineHeight:1.45}}><div><b style={{color:"var(--red)"}}>Antes:</b> {c.antes}</div><div style={{marginTop:3}}><b style={{color:"var(--green)"}}>Después:</b> {c.despues}</div></div></div>;})}</div>:cambios?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><div style={{fontSize:12,fontWeight:700,color:"var(--red)",marginBottom:4}}>ANTES</div><pre style={{whiteSpace:"pre-wrap",fontSize:12,lineHeight:1.4,color:"var(--dim)",margin:0}}>{cambios.antes}</pre></div><div><div style={{fontSize:12,fontWeight:700,color:"var(--green)",marginBottom:4}}>DESPUÉS</div><pre style={{whiteSpace:"pre-wrap",fontSize:12,lineHeight:1.4,color:"var(--dim)",margin:0}}>{cambios.despues}</pre></div></div>:<div style={{fontSize:12,color:"var(--dim)"}}>Este registro no contiene valores anteriores/nuevos.</div>}</div>}
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
              {sa.pagosLoading && <div style={{fontSize:12,color:"var(--dim)"}}>Cargando…</div>}
              <button className="btn btn-ghost btn-sm" onClick={function(){saDescargarCSVConFiltros(pagosFiltrados,"docworks-pagos.csv");}}>CSV</button>
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
                        <div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>{p.inmobiliaria_nombre||"—"}{p.referencia_externa?" · ref "+p.referencia_externa:""}</div>
                        <div style={{fontSize:12,color:"var(--gold)",marginTop:4}}>💳 {p.metodo_pago || p.proveedor || "Medio no informado"}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <SABadge tone={p.estado==="aprobado"||p.estado==="pagado"?"green":(p.estado==="rechazado"?"red":"amber")}>{p.estado}</SABadge>
                      <div style={{fontSize:12,color:"var(--dim)",whiteSpace:"nowrap"}}>{new Date(p.creado_en).toLocaleDateString("es-AR")}</div>
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
            <div style={{fontSize:12,color:"var(--dim)",marginTop:4}}>Vista preparada para conectar una pasarela de pago. DocWorks no almacena números completos de tarjeta.</div>
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
                      <div>Cláusulas: <b>{det.bloques_count}</b></div>
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
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
                      <button className="btn btn-primary btn-sm" onClick={function(){sa.extenderMembresia(detalleId,30,"extension","").then(function(res){if(res.error)dwNotify("error",traducirError(res.error.message));});}}>Extender 30 días</button>
                      <button className="btn btn-secondary btn-sm" onClick={function(){sa.extenderMembresia(detalleId,30,"prueba_gratis","Prueba gratis").then(function(res){if(res.error)dwNotify("error",traducirError(res.error.message));});}}>Dar prueba gratis</button>
                      {det.membresia&&det.membresia.estado==="archivada"?<button className="btn btn-secondary btn-sm" onClick={function(){requestDwConfirm("¿Reactivar esta inmobiliaria?",function(){sa.archivarInmobiliaria(detalleId,false);});}}>Reactivar</button>:<button className="btn btn-ghost btn-sm" onClick={function(){requestDwConfirm("¿Archivar esta inmobiliaria? Se aplicará soft delete y no se borrará físicamente.",function(){requestDwConfirm("Confirmación final: ¿querés archivar la inmobiliaria?",function(){sa.archivarInmobiliaria(detalleId,true);});});}}>Archivar</button>}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 140px auto",gap:8,alignItems:"end",marginTop:12}}>
                      <Field label="Límite personalizado de usuarios"><input className="inp" type="number" min="0" value={limiteCustom} onChange={function(e){setLimiteCustom(e.target.value);}} placeholder={det.limite_usuarios!=null?String(det.limite_usuarios):"Usar límite del plan"}/></Field>
                      <button className="btn btn-secondary btn-sm" onClick={function(){sa.setLimites(detalleId,limiteCustom).then(function(res){if(res.error)dwNotify("error",traducirError(res.error.message));});}}>Guardar límite</button>
                      <button className="btn btn-ghost btn-sm" onClick={function(){sa.setLimites(detalleId,null);setLimiteCustom("");}}>Quitar override</button>
                    </div>
                    <div style={{marginTop:12}}><Field label="Nota interna · solo Super Admin"><textarea className="inp" rows="3" value={notaInmob} onChange={function(e){setNotaInmob(e.target.value);}} placeholder="Información privada de seguimiento…"/></Field><div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}><button className="btn btn-secondary btn-sm" onClick={function(){sa.guardarNotaInmobiliaria(detalleId,notaInmob).then(function(res){if(!res.error)dwNotify("success","Nota interna guardada.");});}}>Guardar nota</button></div></div>
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
                            <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.nombre||u.email}</div><div style={{fontSize:12,color:"var(--dim)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div></div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                            <SABadge tone={u.activo?"green":"red"}>{u.activo?"activo":"inactivo"}</SABadge>
                            <div style={{width:130,maxWidth:"100%"}}><select className="inp" value={u.rol_base} onChange={function(e){cambiarRol(u.id, e.target.value);}}>{ROLES_BASE.map(function(r){return <option key={r} value={r}>{r}</option>;})}</select></div>
                            <button className="btn btn-ghost btn-sm" disabled={rolBusy===u.id} onClick={function(){toggleActivo(u.id, u.activo);}}>{u.activo?"Desactivar":"Activar"}</button>
                            <button className="btn btn-ghost btn-sm" onClick={function(){sa.reenviarInvitacion(u.id,detalleId).then(function(res){dwNotify(res.error?"error":"success",res.error?traducirError(res.error.message):"Invitación reenviada.");});}}>Reenviar</button>
                            <button className="btn btn-ghost btn-sm" onClick={function(){sa.resetPassword(u.id,detalleId).then(function(res){dwNotify(res.error?"error":"success",res.error?traducirError(res.error.message):"Mail de recuperación enviado.");});}}>Reset contraseña</button>
                            {u.rol_base!=="dueno"&&<button className="btn btn-ghost btn-sm" onClick={function(){requestDwConfirm("¿Transferir el rol de dueño a "+(u.nombre||u.email)+"?",function(){sa.transferirDueno(detalleId,u.id);});}}>Hacer dueño</button>}
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
                        <div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{c.categoria}</div>
                        <div style={{fontSize:12,color:"var(--dim)",marginTop:4,lineHeight:1.5,overflowWrap:"anywhere"}}>{(c.contenido||"").slice(0,500)}{(c.contenido||"").length>500?"…":""}</div>
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
                      return <div key={p.id} className="op-card sa-detail-row"><div style={{minWidth:0,flex:"1 1 260px"}}><div style={{fontSize:12.5,fontWeight:600,overflowWrap:"anywhere"}}>{p.nombre} <span style={{color:"var(--dim)",fontWeight:400}}>· {p.tipo_documento}</span></div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>v{p.version} · {p.bloques_count} cláusula{p.bloques_count===1?"":"s"}</div></div><SABadge tone={p.activa?"green":"dim"}>{p.activa?"activa":"inactiva"}</SABadge></div>;
                    })}
                  </div>
                </SASection>
              )}

              {detalleTab==="pagos" && (
                <SASection title="Últimos pagos" right={<button className="btn btn-primary btn-sm" onClick={function(){setPagoForm({monto:"",moneda:"ARS",metodo:"Transferencia bancaria",fecha:new Date().toISOString().slice(0,10),periodo_desde:"",periodo_hasta:"",nota:""});setShowPagoManual(true);}}>+ Registrar pago manual</button>}>
                  {(!det.ultimos_pagos || det.ultimos_pagos.length===0) && <SAEmpty>Sin pagos registrados.</SAEmpty>}
                  <div className="sa-detail-list">
                    {(det.ultimos_pagos||[]).map(function(p){
                      return <div key={p.id} className="sa-detail-row sa-payment-row"><div>{fmt$(p.monto,p.moneda)} <span style={{color:"var(--dim)"}}>· {p.proveedor||"—"}</span></div><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}><SABadge tone={p.estado==="aprobado"||p.estado==="pagado"?"green":(p.estado==="rechazado"?"red":"amber")}>{p.estado}</SABadge><span style={{color:"var(--dim)",fontSize:12,whiteSpace:"nowrap"}}>{new Date(p.creado_en).toLocaleDateString("es-AR")}</span></div></div>;
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
                      {metodosPago.map(function(m){return <div key={m} className="op-card" style={{padding:14}}><div style={{fontSize:18}}>{m.indexOf("Tarjeta")===0?"💳":"🏦"}</div><div style={{fontWeight:700,fontSize:13,marginTop:7}}>{m}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:4}}>Disponible como opción de suscripción</div></div>;})}
                    </div>
                  </SASection>
                  <SASection title="Historial de pagos">
                    <div className="sa-list">{(det.ultimos_pagos||[]).length===0?<SAEmpty>Sin pagos registrados.</SAEmpty>:(det.ultimos_pagos||[]).map(function(p){return <div key={p.id} className="op-card sa-detail-row"><div><b>{fmt$(p.monto,p.moneda)}</b><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{p.metodo_pago||p.proveedor||"Medio no informado"}</div></div><SABadge tone={p.estado==="aprobado"||p.estado==="pagado"?"green":"amber"}>{p.estado}</SABadge></div>;})}</div>
                  </SASection>
                </div>
              )}

              {detalleTab==="actividad" && (
                <SASection title="Actividad reciente">
                  {(!det.ultima_auditoria || det.ultima_auditoria.length===0) && <SAEmpty>Sin actividad registrada.</SAEmpty>}
                  <div className="sa-detail-list">
                    {(det.ultima_auditoria||[]).map(function(a,idx){
                      return <div key={idx} className="sa-detail-row sa-activity-row"><div style={{minWidth:0,overflowWrap:"anywhere"}}>{auditIcon(a.accion)} {a.accion} <span style={{color:"var(--dim)"}}>· {a.entidad_tipo} · {a.usuario_email||"sistema"}</span></div><span style={{color:"var(--dim)",fontSize:12,whiteSpace:"nowrap"}}>{new Date(a.creada_en).toLocaleString("es-AR")}</span></div>;
                    })}
                  </div>
                </SASection>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showPagoManual} onClose={function(){setShowPagoManual(false);}} title="Registrar pago manual">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div className="grid2"><Field label="Monto"><input className="inp" type="number" value={pagoForm.monto} onChange={function(e){setPagoForm(function(f){return Object.assign({},f,{monto:e.target.value});});}}/></Field><Field label="Moneda"><select className="inp" value={pagoForm.moneda} onChange={function(e){setPagoForm(function(f){return Object.assign({},f,{moneda:e.target.value});});}}><option>ARS</option><option>USD</option></select></Field></div>
          <div className="grid2"><Field label="Método"><select className="inp" value={pagoForm.metodo} onChange={function(e){setPagoForm(function(f){return Object.assign({},f,{metodo:e.target.value});});}}>{metodosPago.map(function(m){return <option key={m}>{m}</option>;})}</select></Field><Field label="Fecha"><input className="inp" type="date" value={pagoForm.fecha} onChange={function(e){setPagoForm(function(f){return Object.assign({},f,{fecha:e.target.value});});}}/></Field></div>
          <div className="grid2"><Field label="Período desde"><input className="inp" type="date" value={pagoForm.periodo_desde} onChange={function(e){setPagoForm(function(f){return Object.assign({},f,{periodo_desde:e.target.value});});}}/></Field><Field label="Período hasta"><input className="inp" type="date" value={pagoForm.periodo_hasta} onChange={function(e){setPagoForm(function(f){return Object.assign({},f,{periodo_hasta:e.target.value});});}}/></Field></div>
          <Field label="Nota"><textarea className="inp" rows="3" value={pagoForm.nota} onChange={function(e){setPagoForm(function(f){return Object.assign({},f,{nota:e.target.value});});}}/></Field>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}><button className="btn btn-ghost" onClick={function(){setShowPagoManual(false);}}>Cancelar</button><button className="btn btn-primary" onClick={function(){sa.registrarPago({p_inmobiliaria_id:detalleId,p_monto:parseFloat(pagoForm.monto),p_moneda:pagoForm.moneda,p_metodo:pagoForm.metodo,p_fecha:pagoForm.fecha,p_periodo_desde:pagoForm.periodo_desde||null,p_periodo_hasta:pagoForm.periodo_hasta||null,p_nota:pagoForm.nota||null}).then(function(res){if(res.error)dwNotify("error",traducirError(res.error.message));else{setShowPagoManual(false);dwNotify("success","Pago manual registrado.");}});}}>Registrar pago</button></div>
        </div>
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



SuperAdminDashboard.SABadge = SABadge;
return SuperAdminDashboard;
}

export function crearConfiguracionView(deps){
 const {Btn, CLAUSULAS_DEFAULT, ClausulaFormBody, ClausulaIAComposer, ConfirmModal, CuerpoPlantillaPanel, DEFAULT_BLOQUES_RESERVA, DEFAULT_ENCABEZADOS, DWIcon, ESTADOS, EncabezadoEditor, Field, Inp, Modal, NIVEL_LABELS, PERMS_LABELS, PLANTILLA_ESTILOS, PLANTILLA_TIPOS, ROLES_DEF, ReservaBloquesPanel, SAMPLE_OP_PREVIEW, Slt, TIPOS, TIPO_ICON, TIPO_ICON_DEFAULT, Txa, clausulaAplicaTipo, contarBloquesCuerpo, docworksMercadoPago, dwIrPasoModelo, dwNotify, SABadge, formatearNombreUsuarioVisible, genId, getEncabezadoTemplate, obtenerPlantillaConfig, obtenerVersionPlantilla, sustituirTokens, traducirError, useEffect, useRef, useState} = deps;
function ConfiguracionView({ onOpenBot, perfil, onChange, currentUserId, currentUserRole, darkMode, onToggleDark, equipo, equipoSupabase, operaciones, clausulas, onAddClausula, onEditClausula, onDeleteClausula, onMoveClausula, onDuplicateClausula, bloquesReserva, onUpdateBloqueReserva, onMoveBloqueReserva, bloquesError, bloquesLoading, onRetryBloques, clausulasError, onRetryClausulas, papelera, auditLog, auditoriaSupabase, onExportarRespaldo, onImportarRespaldo, onVaciarAuditoria, puedeInstalar, onInstalar, onStartTour, ctx }) {
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
  const [plantillaSubtab,setPlantillaSubtab] = useState("cuerpo");
  const [modeloPaso,setModeloPaso] = useState(1);
  const [plantillaVista,setPlantillaVista] = useState("aspecto");
  const [clausulaOpenId,setClausulaOpenId] = useState(null);
  const [confirmLockDefaults,setConfirmLockDefaults] = useState(false);
  const [configuracionPlantillaAbierta,setConfiguracionPlantillaAbierta] = useState(false);
  const [mostrarPreviewConfiguracion,setMostrarPreviewConfiguracion] = useState(false);
  const [mostrarBloquesConfiguracion,setMostrarBloquesConfiguracion] = useState(false);
  const [configUnsavedTarget,setConfigUnsavedTarget] = useState(null);
  const [configUnsavedView,setConfigUnsavedView] = useState(null);
  const [showConfigUnsaved,setShowConfigUnsaved] = useState(false);
  const [showSupport,setShowSupport] = useState(false);
  const [supportSubject,setSupportSubject] = useState("Consulta / problema en DocWorks");
  const [supportMessage,setSupportMessage] = useState("");
  const [supportPhoto,setSupportPhoto] = useState(null);

  useEffect(function(){ setLocalPerfil(perfil); }, [perfil]);

  async function enviarSoporte(){
    var email=(perfil&&perfil.soporte_email)||(perfil&&perfil.super_admin_email)||"";
    var asunto=(supportSubject||"Soporte DocWorks").trim();
    var cuerpo=["Usuario: "+(currentUserId||""),"Rol: "+(currentUserRole||perfil.rol||""),"","Mensaje:",supportMessage||""].join("\n");
    try{
      // En móviles compatibles, compartir el archivo adjunto directamente permite incluir la captura.
      if(supportPhoto&&typeof navigator!=="undefined"&&navigator.share&&navigator.canShare){
        var file=new File([supportPhoto],supportPhoto.name||"captura-soporte.png",{type:supportPhoto.type||"image/png"});
        var shareData={title:asunto,text:cuerpo,files:[file]};
        if(navigator.canShare({files:[file]})){await navigator.share(shareData);setShowSupport(false);setSupportPhoto(null);return;}
      }
      var cuerpoFallback=cuerpo+(supportPhoto?"\n\nAdjunto pendiente: "+supportPhoto.name+". Este correo no puede adjuntar archivos automáticamente desde el navegador; adjuntá la imagen manualmente.":"");
      var url="mailto:"+encodeURIComponent(email)+"?subject="+encodeURIComponent(asunto)+"&body="+encodeURIComponent(cuerpoFallback);
      window.location.href=url;setShowSupport(false);
      if(supportPhoto)dwNotify("info","El correo se abrió. Adjuntá la captura manualmente si tu aplicación de correo no la agregó.");
    }catch(e){if(e&&e.name==="AbortError")return;dwNotify("error","No se pudo abrir el canal para enviar la consulta.");}
  }

  function handleLogo(e){var file=e.target.files[0];if(!file)return;var r=new FileReader();r.onload=function(ev){setLocalPerfil(function(p){return Object.assign({},p,{logoDataUrl:ev.target.result});});};r.readAsDataURL(file);}
  async function handleMiFotoPerfil(e){
    var file=e.target.files&&e.target.files[0]; if(!file) return;
    if(file.size>5*1024*1024){dwNotify("error","La foto es demasiado grande. Elegí una imagen de hasta 5 MB.");e.target.value="";return;}
    try{
      var r=new FileReader();
      r.onload=function(ev){
        var img=new Image();
        img.onload=async function(){
          var max=420, scale=Math.min(1,max/Math.max(img.width,img.height));
          var canvas=document.createElement("canvas"); canvas.width=Math.max(1,Math.round(img.width*scale)); canvas.height=Math.max(1,Math.round(img.height*scale));
          var c=canvas.getContext("2d"); c.drawImage(img,0,0,canvas.width,canvas.height);
          var data=canvas.toDataURL("image/jpeg",0.82);
          var next=Object.assign({},localPerfil,{broker_fotos:Object.assign({},localPerfil.broker_fotos||{},currentUserId?{[currentUserId]:data}: {})});
          setLocalPerfil(next);
          try{
            await persistirPerfil(next);
            dwNotify("success","Foto de perfil actualizada. El equipo podrá verla en operaciones compartidas.");
          }catch(err){
            dwNotify("error","No se pudo sincronizar la foto con el equipo. Verificá tu conexión.");
          }
        };
        img.onerror=function(){dwNotify("error","No se pudo procesar la imagen.");};
        img.src=String(ev.target?.result||"");
      };
      r.readAsDataURL(file);
    }catch(err){dwNotify("error","No se pudo cargar la foto.");}
    e.target.value="";
  }
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
      img.src=String(ev.target?.result||"");
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

  var rolActual = currentUserRole || perfil.rol || "dueno";
  var esBroker = rolActual==="broker" || rolActual==="vendedor" || rolActual==="viewer";
  var puedeEditarInstitucional = !esBroker;
  var puedeVerFacturacion = !esBroker && !!perfil && (perfil.rol==="dueno" || perfil.rol==="admin" || rolActual==="dueno" || rolActual==="admin");
  var TABS_CFG = esBroker ? [
    {id:"cuenta", label:"Mi perfil", icon:"👤"}
  ] : [
    {id:"cuenta",    label:"Mi cuenta",           icon:"👤"},
    {id:"equipo",    label:"Equipo",               icon:"👥"},
    {id:"historial", label:"Historial del equipo", icon:"📊"},
    {id:"aspecto",  label:"Aspecto del documento", icon:"✦"},
    {id:"auditoria", label:"Auditoría",            icon:"🕵️"},
    ...(puedeVerFacturacion ? [{id:"facturacion", label:"Facturación", icon:"💳"}] : []),
    {id:"backup",    label:"Respaldo",             icon:"☁️"},
    {id:"soporte",   label:"Soporte",               icon:"🛟"},
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
    if (res.ok) setRespaldoMsg({ok:true,text: (importModo==="reemplazar" ? "Respaldo importado: se reemplazaron los datos actuales." : "Respaldo importado: se agregó lo nuevo sin borrar lo existente.")+" Los datos están solo en este dispositivo hasta confirmar su sincronización con Supabase."});
    else setRespaldoMsg({ok:false,text: res.error||"No se pudo importar el archivo."});
  }

  // Datos compartidos entre la vista de Aspecto y el subtab de Plantillas.
  // Las variables compartidas se declaran en este nivel para que Aspecto del documento
  // y Plantillas utilicen la misma fuente sin referencias fuera de alcance.
  var puedeEditarPlantillas = !!perfil && (perfil.rol==="dueno" || perfil.rol==="admin");
  var customMapPreview = (localPerfil&&localPerfil.encabezados_custom)||{};
  var customTextoPreview = customMapPreview[tipoDocSel]||"";

  const [aspectoPanel,setAspectoPanel]=useState("encabezado");
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
          {showWeb&&localPerfil.web&&<div style={{fontSize:12,color:estilo==="corporativo"?"#ffffffaa":"#64748b",marginTop:3,textAlign:estilo==="clasico"?"center":"left",overflowWrap:"anywhere"}}>{localPerfil.web}</div>}
          {locationInHeader&&<div style={{fontSize:12,color:estilo==="corporativo"?"#ffffffcc":"#64748b",marginTop:3,textAlign:estilo==="clasico"?"center":"left",overflowWrap:"anywhere"}}>Ubicación: {localPerfil.direccion}</div>}
        </div>
        <div className="cuenta-doc-body">
          <div style={{width:"58%",height:2,background:estilo==="clasico"?"#1a1a1a":sec,marginBottom:16}}/>
          <div style={{fontSize:14,fontWeight:700,color:estilo==="clasico"?"#1a1a1a":prim,textAlign:"center",marginBottom:14}}>RESERVA DE COMPRA</div>
          {customText&&<div style={{padding:"9px 10px",marginBottom:14,borderRadius:6,background:"#f7f8fa",border:"1px solid #e1e5ea",fontSize:12,color:"#475569",lineHeight:1.55,whiteSpace:"pre-wrap"}}>{customText}</div>}
          <div style={{fontSize:12,color:"#334155",lineHeight:1.65}}><b style={{color:estilo==="clasico"?"#1a1a1a":prim}}>CLÁUSULA PRIMERA — OBJETO:</b> La parte compradora formula una reserva de compra sobre el inmueble ubicado en Av. del Libertador 1250, localidad de Pilar, provincia de Buenos Aires, sujeto a las condiciones y plazos acordados.</div>
          <div style={{marginTop:18,fontSize:12,color:"#334155",lineHeight:1.65}}><b>CLÁUSULA SEGUNDA — PRECIO Y RESERVA:</b> El precio de compra ofrecido es de USD 120.000. La parte compradora entrega en concepto de reserva la suma de USD 3.000, sujeta a la aceptación expresa de la parte vendedora.</div>
          <div style={{marginTop:12,fontSize:12,color:"#334155",lineHeight:1.65}}><b style={{color:estilo==="clasico"?"#1a1a1a":prim}}>CLÁUSULA TERCERA — VIGENCIA:</b> La presente reserva tendrá una vigencia de cinco días hábiles desde su suscripción. La aceptación será comunicada a la parte compradora por los medios acordados.</div>
          <div style={{marginTop:12,fontSize:12,color:"#334155",lineHeight:1.65}}><b style={{color:estilo==="clasico"?"#1a1a1a":prim}}>CLÁUSULA CUARTA — HONORARIOS:</b> Los honorarios profesionales serán abonados según lo pactado por las partes y la normativa aplicable.</div>
          <div style={{marginTop:12,fontSize:11,color:"#64748b",lineHeight:1.5}}>Modelo ilustrativo con datos ficticios para comprobar la identidad visual. No constituye un documento legal ni sustituye el PDF definitivo.</div>
        </div>
        <div className="cuenta-doc-footer">
          <div className="cuenta-doc-footer-line"/>
          <div style={{position:"relative",minHeight:62,marginTop:5}}>
            {locationInFooter&&<div style={{position:"absolute",top:0,left:0,right:0,textAlign:"center",fontSize:12,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Ubicación: {localPerfil.direccion}</div>}
            {localPerfil.pie_pagina_logo_debajo&&localPerfil.logoDataUrl&&<div style={{position:"absolute",top:locationInFooter?18:0,left:localPerfil.pie_pagina_logo_posicion==="izquierda"?0:localPerfil.pie_pagina_logo_posicion==="derecha"?"auto":"50%",right:localPerfil.pie_pagina_logo_posicion==="derecha"?0:"auto",transform:localPerfil.pie_pagina_logo_posicion==="centro"?"translateX(-50%)":"none"}}><img src={localPerfil.logoDataUrl} style={{height:Math.max(18,Math.min(44,28*(localPerfil.pie_pagina_logo_scale||100)/100)),width:"auto",objectFit:"contain"}} alt="Logo pie"/></div>}
            {localPerfil.pie_pagina_leyenda_activa!==false&&localPerfil.pie_pagina_texto&&<div style={{position:"absolute",top:(localPerfil.pie_pagina_logo_debajo&&localPerfil.logoDataUrl)?(locationInFooter?42:22):(locationInFooter?20:4),left:"50%",transform:"translateX(-50%)",width:"76%",textAlign:"center",fontSize:12,color:"var(--dim)",fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{localPerfil.pie_pagina_texto}</div>}
            {localPerfil.pie_pagina_numero_activo!==false&&<div style={{position:"absolute",top:localPerfil.pie_pagina_logo_debajo&&localPerfil.logoDataUrl?42:(locationInFooter?20:4),left:localPerfil.pie_pagina_numero_posicion==="izquierda"?0:localPerfil.pie_pagina_numero_posicion==="derecha"?"auto":"50%",right:localPerfil.pie_pagina_numero_posicion==="derecha"?0:"auto",transform:localPerfil.pie_pagina_numero_posicion==="centro"?"translateX(-50%)":"none",fontSize:12,color:"var(--dim)"}}>Página 1</div>}
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
          var active=t.id==="aspecto" ? tab==="plantillas" : tab===t.id;
          return(
            <button key={t.id} onClick={function(){if(t.id==="aspecto"){if(tab==="plantillas"){pedirCambioVista("aspecto");}else{setTab("plantillas");setPlantillaVista("aspecto");}}else{pedirCambioTab(t.id);}}} style={{
              padding:"8px 12px",borderRadius:"8px 8px 0 0",border:"none",background:active?"var(--card)":"transparent",
              color:active?"var(--gold)":"var(--muted)",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:active?600:400,
              cursor:"pointer",borderBottom:active?"2px solid var(--gold)":"2px solid transparent",marginBottom:-1,
              display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",flexShrink:0,whiteSpace:"nowrap",
            }}>{t.icon} {t.label}</button>
          );
        })}
      </div>

      {/* ── TAB: MI CUENTA (DUEÑO) ── */}
      {tab==="cuenta"&&esBroker&&(
        <div style={{width:"100%",maxWidth:720,margin:"0 auto"}}>
          <div className="card cuenta-profile-card" style={{padding:0,overflow:"hidden",borderRadius:18}}>
            <div style={{padding:"18px 20px",borderBottom:"1px solid var(--border)",background:"linear-gradient(180deg,rgba(212,168,83,.075),rgba(212,168,83,.015))"}}>
              <div style={{fontSize:12,fontWeight:750,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".10em"}}>Mi perfil de broker</div>
              <div style={{fontFamily:"DM Serif Display,serif",fontSize:22,color:"var(--text)",marginTop:4}}>Tu información personal</div>
              <div style={{fontSize:12,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Podés completar únicamente tus datos personales. La información de la inmobiliaria es administrada por el dueño o administrador.</div>
            </div>
            <div style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <div style={{position:"relative",width:78,height:78,flexShrink:0}}>
                  <div style={{width:78,height:78,borderRadius:"50%",background:"linear-gradient(145deg,var(--gold),var(--gold2))",border:"2px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",fontSize:25,fontWeight:800,color:"#0a0f1a"}}>{(localPerfil.broker_fotos&&currentUserId&&localPerfil.broker_fotos[currentUserId])?<img src={localPerfil.broker_fotos[currentUserId]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="Foto de perfil"/>:(localPerfil.broker_perfiles&&currentUserId&&localPerfil.broker_perfiles[currentUserId]&&localPerfil.broker_perfiles[currentUserId].nombre||formatearNombreUsuarioVisible({usuario:{nombre:localPerfil.nombre||"Broker"}}).charAt(0).toUpperCase())}</div>
                  <label title="Cambiar foto de perfil" style={{position:"absolute",right:-3,bottom:-3,width:25,height:25,borderRadius:"50%",background:"var(--gold)",color:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,fontWeight:900,border:"2px solid var(--card)"}}>+
                    <input type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={handleMiFotoPerfil}/>
                  </label>
                </div>
                <div style={{minWidth:0,flex:1}}><div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{(localPerfil.broker_perfiles&&currentUserId&&localPerfil.broker_perfiles[currentUserId]&&localPerfil.broker_perfiles[currentUserId].nombre)||formatearNombreUsuarioVisible({usuario:{nombre:localPerfil.nombre||"Broker"}})}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:4}}>Broker · {currentUserId?"Perfil sincronizado con el equipo":"Perfil local"}</div></div>
              </div>
              {function(){var bp=(localPerfil.broker_perfiles&&currentUserId&&localPerfil.broker_perfiles[currentUserId])||{}; function setBP(ch){var all=Object.assign({},localPerfil.broker_perfiles||{});all[currentUserId]=Object.assign({},bp,ch);setLocalPerfil(Object.assign({},localPerfil,{broker_perfiles:all}));} return <div className="cuenta-info-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"12px 14px"}}>
                <Inp label="Nombre y apellido" value={bp.nombre||""} onChange={function(e){setBP({nombre:e.target.value});}} placeholder="Nombre y apellido"/>
                <Inp label="Teléfono personal" value={bp.telefono||""} onChange={function(e){setBP({telefono:e.target.value});}} placeholder="+54 9 11 1234-5678"/>
                <Inp label="Correo" value={(typeof ctx!=="undefined"&&ctx&&ctx.usuario&&ctx.usuario.email)||bp.email||""} readOnly onChange={function(){}} />
                <Inp label="Rol" value={ROLES_DEF[rolActual]&&ROLES_DEF[rolActual].label||rolActual} readOnly onChange={function(){}} />
              </div>; }()}
              <div className="cuenta-save-panel"><div><div className="cuenta-save-title">Perfil personal</div><div className="cuenta-save-copy">Estos datos no modifican la cuenta ni la identidad de la inmobiliaria.</div></div><div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>{perfilSaveStatus==="saved"&&<span className="cuenta-save-state saved"><span>✓</span> Guardado</span>}<Btn v="success" onClick={savePerfil} disabled={perfilSaveStatus==="saving"}>{perfilSaveStatus==="saving"?"Guardando…":"Guardar perfil"}</Btn></div></div>
            </div>
          </div>
        </div>
      )}

      {tab==="cuenta"&&!esBroker&&(
        <div style={{width:"100%",maxWidth:"none",margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:10,flexWrap:"wrap"}}><div><div style={{fontSize:12,fontWeight:750,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".10em"}}>Panel de la inmobiliaria</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>Identidad, actividad y equipo en una sola vista.</div></div></div>
          <div className="card cuenta-profile-card" style={{padding:0,overflow:"hidden",borderRadius:18}}>
            <div style={{padding:"18px 22px 16px",borderBottom:"1px solid var(--border)",background:"linear-gradient(180deg,rgba(212,168,83,.075),rgba(212,168,83,.015))"}}>
              <div className="cuenta-dashboard-head">
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>
                    <div style={{fontSize:18,fontFamily:"DM Serif Display,serif",color:"var(--text)",lineHeight:1.15}}>Información de la inmobiliaria</div>
                    {perfilSaveStatus==="saved"&&<span className="cuenta-save-pill"><span>✓</span> Guardado</span>}
                  </div>
                  <div style={{fontSize:12,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Completá acá la identidad y los datos institucionales que DocWorks utilizará en la aplicación y en todos los documentos.</div>
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
                <div style={{display:"flex",flexDirection:"column",gap:12,minWidth:0}}>
                  <div style={{padding:"16px",borderRadius:14,border:"1px solid rgba(212,168,83,.24)",background:"linear-gradient(180deg,rgba(212,168,83,.08),rgba(255,255,255,.018))",minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:750,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".10em",marginBottom:11}}>Mi perfil</div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
                        <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(145deg,var(--gold),var(--gold2))",border:"2px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",fontSize:22,fontWeight:800,color:"#0a0f1a"}}>
                          {(localPerfil.broker_fotos&&currentUserId&&localPerfil.broker_fotos[currentUserId])
                            ? <img src={localPerfil.broker_fotos[currentUserId]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="Foto de perfil"/>
                            : ((localPerfil.nombre||"Usuario").charAt(0).toUpperCase())}
                        </div>
                        <label title="Cambiar foto de perfil" style={{position:"absolute",right:-3,bottom:-3,width:24,height:24,borderRadius:"50%",background:"var(--gold)",color:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,fontWeight:900,border:"2px solid var(--card)",boxSizing:"border-box"}}>
                          +
                          <input type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={handleMiFotoPerfil}/>
                        </label>
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>Tu foto de perfil</div>
                        <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.45,marginTop:4}}>Se sincroniza con tu usuario para que los integrantes del equipo puedan verla cuando compartan o gestionen una operación.</div>
                      </div>
                    </div>
                  </div>
                  <div style={{padding:"16px",borderRadius:14,border:"1px solid rgba(212,168,83,.24)",background:"linear-gradient(180deg,rgba(212,168,83,.08),rgba(255,255,255,.018))",minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:750,color:"var(--gold)",textTransform:"uppercase",letterSpacing:".10em",marginBottom:11}}>Logo de la inmobiliaria</div>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:92,height:92,borderRadius:15,background:"rgba(255,255,255,.90)",border:"1px solid rgba(212,168,83,.32)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:"0 8px 20px rgba(0,0,0,.10)",flexShrink:0}}>
                        {localPerfil.logoDataUrl
                          ? <div style={{position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <img src={localPerfil.logoDataUrl} style={{width:"88%",height:"88%",objectFit:"contain",borderRadius:10}} alt="Logo de la inmobiliaria"/>
                              <button type="button" title="Quitar logo" aria-label="Quitar logo" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{logoDataUrl:"",pie_pagina_logo_debajo:false});});}} style={{position:"absolute",top:4,right:4,width:21,height:21,padding:0,borderRadius:"50%",background:"#b42318",border:"2px solid #fff",color:"#fff",cursor:"pointer",fontSize:13,lineHeight:"17px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 10px rgba(0,0,0,.28)",zIndex:10,boxSizing:"border-box"}}>×</button>
                            </div>
                          : <button type="button" onClick={function(){fileRef.current&&fileRef.current.click();}} style={{width:"100%",height:"100%",border:0,background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,color:"var(--dim)"}}>
                              <span style={{fontSize:24}}>＋</span><span style={{fontSize:12,fontWeight:650,color:"var(--text)"}}>Subir logo</span><span style={{fontSize:12}}>PNG, JPG o SVG</span>
                            </button>}
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{fontFamily:"DM Serif Display,serif",fontSize:18,color:"var(--text)",lineHeight:1.15,overflowWrap:"anywhere"}}>{localPerfil.nombre||"Tu inmobiliaria"}</div>
                        {localPerfil.matricula&&<div style={{fontSize:12,color:"var(--gold)",fontWeight:650,marginTop:5}}>Mat. {localPerfil.matricula}</div>}
                        <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.45,marginTop:7}}>Este logo se utiliza en encabezados y pies de documentos según la configuración visual.</div>
                      </div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogo}/>
                  </div>
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
          <div style={{fontSize:12.5,color:"var(--dim)",marginBottom:16,lineHeight:1.6}}>Exportá o importá un respaldo completo en JSON. La importación modifica los datos locales de esta instalación; no los carga directamente a Supabase. Si la sincronización está habilitada, comprobá su estado después de importar: no cierres sesión ni borres el respaldo hasta verificarlo.</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <Btn v="secondary" onClick={onExportarRespaldo}>⬇ Exportar todo (JSON)</Btn>
            <Btn v="secondary" onClick={function(){backupFileRef.current.click();}} title="Importa localmente; no sube automáticamente a Supabase">⬆ Importar respaldo</Btn>
            <input ref={backupFileRef} type="file" accept="application/json,.json" style={{display:"none"}} onChange={handleRespaldoFile}/>
          </div>
          {backupMsg&&(
            <div style={{marginTop:12,fontSize:12.5,padding:"8px 12px",borderRadius:8,color:backupMsg.ok?"var(--green)":"var(--red)",background:backupMsg.ok?"rgba(16,185,129,0.10)":"rgba(239,68,68,0.10)"}}>
              <div>{backupMsg.text}</div>
              {backupMsg.ok&&<div style={{marginTop:8,color:"var(--text)",lineHeight:1.5}}>Verificá la conexión y abrí Operaciones para confirmar que los cambios se hayan sincronizado antes de borrar este dispositivo o cerrar sesión.</div>}
            </div>
          )}
        </div>
      )}

      {tab==="soporte"&&(
        <div className="config-support-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:16}}>
          <div className="card" style={{padding:18}}>
            <div style={{fontSize:22,marginBottom:8}}>✉️</div><div style={{fontSize:15,fontWeight:700,color:"var(--text)"}}>Contactar con soporte</div>
            <div style={{fontSize:12.5,color:"var(--dim)",lineHeight:1.55,margin:"6px 0 14px"}}>Contanos qué pasó y en qué pantalla. Podés indicar un asunto y describir el problema.</div>
            <Btn v="primary" onClick={function(){setSupportSubject("");setSupportMessage("");setSupportPhoto(null);setShowSupport(true);}}>Crear consulta</Btn>
          </div>
          <div className="card" style={{padding:18}}>
            <div style={{fontSize:22,marginBottom:8}}>🧭</div><div style={{fontSize:15,fontWeight:700,color:"var(--text)"}}>Primeros pasos</div>
            <div style={{fontSize:12.5,color:"var(--dim)",lineHeight:1.55,margin:"6px 0 14px"}}>Volvé a recorrer la guía inicial de DocWorks.</div>
            <Btn v="secondary" onClick={function(){if(typeof onStartTour==="function")onStartTour();else dwNotify("info","El recorrido inicial no está disponible desde esta pantalla.");}}>Iniciar recorrido</Btn>
          </div>
          <div className="card" style={{padding:18}}>
            <div style={{fontSize:22,marginBottom:8}}>✦</div><div style={{fontSize:15,fontWeight:700,color:"var(--text)"}}>Ayuda de IA</div>
            <div style={{fontSize:12.5,color:"var(--dim)",lineHeight:1.55,margin:"6px 0 14px"}}>Encontrá orientación para usar las funciones y preparar documentos.</div>
            <Btn v="secondary" onClick={function(){if(typeof onOpenBot==="function")onOpenBot();else dwNotify("info","Abrí el asistente IA desde el botón flotante.");}}>Abrir asistente IA</Btn>
          </div>
        </div>
      )}

      {showSupport&&<Modal open={true} onClose={function(){setShowSupport(false);}} title="Contactar soporte">
        <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.55,marginBottom:12}}>Completá el motivo y el detalle. Se abrirá tu correo con el mensaje listo para enviar al canal de soporte configurado por el Super Admin.</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Inp label="Asunto" value={supportSubject} onChange={function(e){setSupportSubject(e.target.value);}}/>
          <Field label="Mensaje"><textarea className="inp" rows={7} value={supportMessage} onChange={function(e){setSupportMessage(e.target.value);}} placeholder="Contanos qué ocurrió, en qué pantalla y qué estabas haciendo…" style={{resize:"vertical",minHeight:140}}/></Field>
          <label style={{display:"flex",flexDirection:"column",gap:7,fontSize:12,color:"var(--dim)"}}>Adjuntar captura o foto (opcional)
            <input type="file" accept="image/*" capture="environment" onChange={function(e){var f=e.target.files&&e.target.files[0];if(!f)return;if(f.size>8*1024*1024){dwNotify("error","La imagen supera los 8 MB. Elegí una más liviana.");e.target.value="";return;}setSupportPhoto(f);}} style={{width:"100%",fontSize:12}}/>
            {supportPhoto&&<span style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"8px 10px",border:"1px solid var(--border)",borderRadius:8,overflowWrap:"anywhere"}}><span>📎 {supportPhoto.name}</span><button type="button" className="btn btn-ghost" onClick={function(){setSupportPhoto(null);}}>Quitar</button></span>}
          </label>
        </div>
        {!(perfil&&perfil.soporte_email)&&<div style={{marginTop:10,padding:"9px 11px",borderRadius:9,background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.22)",color:"var(--amber)",fontSize:12}}>Si el Super Admin todavía no configuró un correo de soporte, se abrirá el correo sin destinatario para que pueda completarse.</div>}
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14,flexWrap:"wrap"}}><Btn v="ghost" onClick={function(){setShowSupport(false);}}>Cancelar</Btn><Btn v="success" onClick={enviarSoporte}>Abrir correo para enviar →</Btn></div>
      </Modal>}

      {/* ── MODAL: confirmar importación de respaldo ── */}
      {confirmImport&&(
        <Modal open={true} onClose={function(){setConfirmImport(null);}} title="Importar respaldo">
          <div style={{fontSize:13,color:"var(--muted)",marginBottom:14,lineHeight:1.6}}>Elegí cómo aplicar los datos del archivo importado:</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            <label style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",borderRadius:10,border:"1px solid "+(importModo==="fusionar"?"var(--gold)":"var(--border2)"),background:importModo==="fusionar"?"rgba(212,168,83,0.08)":"transparent",cursor:"pointer"}}>
              <input type="radio" checked={importModo==="fusionar"} onChange={function(){setImportModo("fusionar");}} style={{marginTop:3}}/>
              <div><div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Fusionar (recomendado)</div><div style={{fontSize:12,color:"var(--dim)"}}>Agrega lo que falte, sin borrar nada de lo que ya tenés cargado.</div></div>
            </label>
            <label style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",borderRadius:10,border:"1px solid "+(importModo==="reemplazar"?"var(--red)":"var(--border2)"),background:importModo==="reemplazar"?"rgba(239,68,68,0.08)":"transparent",cursor:"pointer"}}>
              <input type="radio" checked={importModo==="reemplazar"} onChange={function(){setImportModo("reemplazar");}} style={{marginTop:3}}/>
              <div><div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Reemplazar todo</div><div style={{fontSize:12,color:"var(--dim)"}}>Pisa los datos actuales de este dispositivo con los del archivo. No se puede deshacer.</div></div>
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
        <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.55,marginBottom:16}}>¿Querés guardarlos antes de salir de esta sección?</div>
        {perfilSaveStatus==="error"&&<div style={{marginBottom:12,padding:"8px 10px",borderRadius:8,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.20)",color:"var(--red)",fontSize:12}}>No se pudieron guardar los cambios. Revisá la conexión e intentá nuevamente.</div>}
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
                <div style={{minWidth:0}}><div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)"}}>Esquema de comisiones</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>Participación uniforme o personalizada por asesor</div></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span style={{padding:"5px 9px",borderRadius:20,fontSize:12,fontWeight:700,color:"var(--gold)",background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.22)"}}>COMISIONES</span>
                <span style={{fontSize:13,color:"var(--dim)"}}>⌄</span>
              </div>
            </summary>
            <div style={{padding:"0 18px 16px",borderTop:"1px solid rgba(212,168,83,.10)"}}>
              <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,paddingTop:12,marginBottom:13}}>Definí si todos cobran la misma participación o si cada asesor tiene su propio porcentaje. La participación se aplica a los honorarios de las operaciones que tenga asignadas.</div>
              <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr)",gap:12}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>
                  {[{v:"uniforme",l:"Todos con la misma participación",d:"Una regla para todo el equipo"},{v:"individual",l:"Participación por asesor",d:"Cada persona puede tener el suyo"}].map(function(o){var sel=splitMode===o.v;return <button key={o.v} type="button" onClick={function(){var next=Object.assign({},localPerfil,{broker_split_mode:o.v});setLocalPerfil(next);onChange(next);}} style={{textAlign:"left",padding:"10px 11px",borderRadius:10,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.10)":"rgba(255,255,255,.015)",color:sel?"var(--text)":"var(--muted)"}}><div style={{fontSize:12,fontWeight:700}}>{o.l}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{o.d}</div></button>;})}
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
              <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><div style={{width:32,height:32,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.18)",fontSize:15}}>🏆</div><div><div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)"}}>Ranking interno</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>Competencia interna por operaciones y facturación</div></div></div>
              <span style={{padding:"5px 9px",borderRadius:20,fontSize:12,fontWeight:700,color:localPerfil.ranking_interno_activo?"var(--green)":"var(--muted)",background:localPerfil.ranking_interno_activo?"rgba(74,222,128,.08)":"rgba(255,255,255,.04)",border:"1px solid "+(localPerfil.ranking_interno_activo?"rgba(74,222,128,.20)":"var(--border)" )}}>{localPerfil.ranking_interno_activo?"ACTIVO":"DESACTIVADO"}</span>
            </summary>
            <div style={{padding:"0 18px 16px",borderTop:"1px solid rgba(212,168,83,.10)"}}>
              <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,paddingTop:12,marginBottom:12}}>Si lo activás, el equipo podrá ver un ranking interno. Se ordena por cantidad de operaciones y facturación, pero nunca se muestran los importes de facturación.</div>
              <button type="button" onClick={function(){var next=Object.assign({},localPerfil,{ranking_interno_activo:!localPerfil.ranking_interno_activo});setLocalPerfil(next);}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"11px 12px",borderRadius:10,border:"1px solid "+(localPerfil.ranking_interno_activo?"rgba(74,222,128,.25)":"var(--border2)"),background:localPerfil.ranking_interno_activo?"rgba(74,222,128,.07)":"rgba(255,255,255,.015)",color:"var(--text)",cursor:"pointer",textAlign:"left"}}>
                <span><span style={{display:"block",fontSize:12,fontWeight:700}}>{localPerfil.ranking_interno_activo?"Ranking habilitado":"Ranking deshabilitado"}</span><span style={{display:"block",fontSize:12,color:"var(--dim)",marginTop:2}}>{localPerfil.ranking_interno_activo?"Los brokers podrán consultar su posición.":"Nadie verá el ranking hasta que lo habilites."}</span></span>
                <span style={{width:42,height:24,borderRadius:20,background:localPerfil.ranking_interno_activo?"var(--gold)":"var(--border2)",padding:3,boxSizing:"border-box",display:"flex",justifyContent:localPerfil.ranking_interno_activo?"flex-end":"flex-start",alignItems:"center",flexShrink:0}}><span style={{width:18,height:18,borderRadius:"50%",background:"#fff",display:"block"}}/></span>
              </button>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}><Btn v="success" s="sm" onClick={function(){var next=Object.assign({},localPerfil,{ranking_interno_activo:!!localPerfil.ranking_interno_activo});setLocalPerfil(next);setPerfilSaveStatus("saving");Promise.resolve(onChange(next)).then(function(res){if(res&&res.error){setPerfilSaveStatus("error");return;}setPerfilSaveStatus("saved");setTimeout(function(){setPerfilSaveStatus(null);},3000);}).catch(function(){setPerfilSaveStatus("error");});}}>Guardar ranking ✓</Btn></div>
            </div>
          </details>}

          {/* Tabla de roles */}
          <div style={{background:"linear-gradient(135deg,rgba(212,168,83,0.05),transparent)",border:"1px solid rgba(212,168,83,0.15)",borderRadius:14,padding:16,marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Permisos por rol</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr>
                    <th style={{textAlign:"left",padding:"6px 10px",color:"var(--dim)",fontWeight:600}}>Permiso</th>
                    {Object.entries(ROLES_DEF as Record<string,{color:string;label:string;perms:string[]}>).map(function(e){return <th key={e[0]} style={{padding:"6px 10px",color:e[1].color,fontWeight:600,textAlign:"center",whiteSpace:"nowrap"}}>{e[1].label}</th>;})}
                  </tr>
                </thead>
                <tbody>
                  {["todo","crear","editar","eliminar","ver_todos","ver_propios","configurar"].map(function(p,i){
                    return(
                      <tr key={p} style={{borderTop:"1px solid var(--border)",background:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
                        <td style={{padding:"7px 10px",color:"var(--muted)",fontSize:12}}>{PERMS_LABELS[p]}</td>
                        {Object.entries(ROLES_DEF as Record<string,{color:string;label:string;perms:string[]}>).map(function(e){
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
                        {esPendiente?"✉":((localPerfil.broker_fotos&&localPerfil.broker_fotos[m.id]||m.fotoDataUrl)?<img src={(localPerfil.broker_fotos&&localPerfil.broker_fotos[m.id])||m.fotoDataUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="Foto del asesor"/>:(m.nombre[0]?.toUpperCase()||"?"))}
                      </div>
                      {!esPendiente&&<label title="Cargar foto del asesor" style={{position:"absolute",right:-5,bottom:-5,width:20,height:20,borderRadius:"50%",background:"var(--gold)",color:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,fontWeight:900,border:"2px solid var(--card)",boxSizing:"border-box"}}>+<input type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={function(e){handleFotoBroker(m,e);}}/></label>}
                    </div>
                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontWeight:600,fontSize:13.5,color:"var(--text)"}}>{esPendiente?m.email:m.nombre}</span>
                        <span style={{padding:"2px 9px",borderRadius:20,fontSize:12,fontWeight:600,background:rd.bg,color:rd.color,border:"1px solid "+rd.color+"33"}}>{rd.label}</span>
                        {nivelLabel && <span style={{padding:"2px 9px",borderRadius:20,fontSize:12,background:"rgba(255,255,255,0.04)",color:"var(--muted)",border:"1px solid var(--border2)"}}>{nivelLabel}</span>}
                        {esPendiente
                          ? <span style={{padding:"2px 8px",borderRadius:20,fontSize:12,background:"rgba(251,191,36,0.1)",color:"var(--amber)",border:"1px solid rgba(251,191,36,0.25)"}}>✉ Invitación pendiente</span>
                          : <span style={{padding:"2px 8px",borderRadius:20,fontSize:12,background:m.estado==="activo"?"rgba(74,222,128,0.08)":"rgba(248,113,113,0.08)",color:m.estado==="activo"?"var(--green)":"var(--red)",border:"1px solid "+(m.estado==="activo"?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.2)")}}>{m.estado==="activo"?"✓ Activo":"⊘ Inactivo"}</span>
                        }
                      </div>
                      <div style={{fontSize:12,color:"var(--dim)"}}>{esPendiente?"Todavía no inició sesión":m.email}</div>
                    </div>
                    {/* Ops count */}
                    {!esPendiente && (
                      <div style={{textAlign:"center",padding:"6px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",flexShrink:0}}>
                        <div style={{fontFamily:"DM Serif Display,serif",fontSize:18,color:"var(--gold)"}}>{opsM}</div>
                        <div style={{fontSize:12,color:"var(--dim)"}}>Operaciones</div>
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
                      <div><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>Participación personal</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>{puedeEditarSplit(m)?(m.id===currentUserId?"Podés modificar tu porcentaje directamente.":"Dueño / Administrador puede modificarlo."):"Solo Dueño / Administrador o el propio asesor pueden modificarlo."}</div></div>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <input type="number" min="0" max="100" value={splitDeMiembro(m)} disabled={!puedeEditarSplit(m)} onChange={function(e){var v=e.target.value;var nextSplits=Object.assign({},brokerSplits);nextSplits[m.id]=Math.max(0,Math.min(100,parseFloat(v)||0));setLocalPerfil(function(p){return Object.assign({},p,{broker_splits:nextSplits});});}} style={{width:74,height:34,boxSizing:"border-box",borderRadius:8,border:"1px solid "+(puedeEditarSplit(m)?"var(--border2)":"var(--border)"),background:"var(--input)",color:"var(--text)",padding:"0 9px",fontSize:12,fontWeight:700,textAlign:"right",opacity:puedeEditarSplit(m)?1:.55}}/>
                        <span style={{fontSize:12,color:"var(--gold)",fontWeight:700}}>%</span>
                        {puedeEditarSplit(m)&&<button type="button" onClick={function(){guardarSplitMiembro(m,splitDeMiembro(m));}} style={{height:34,padding:"0 10px",borderRadius:8,border:"1px solid rgba(212,168,83,.28)",background:"rgba(212,168,83,.08)",color:"var(--gold)",fontSize:12,fontWeight:700,cursor:"pointer"}}>Guardar</button>}
                      </div>
                    </div>
                  )}
                  {/* Permisos badges */}
                  {!esPendiente && (
                    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)",display:"flex",gap:5,flexWrap:"wrap"}}>
                      {(rd.perms.includes("todo")?Object.keys(PERMS_LABELS):rd.perms).map(function(p){
                        return <span key={p} style={{padding:"2px 8px",borderRadius:20,fontSize:12,background:"rgba(74,222,128,0.07)",color:"var(--green)",border:"1px solid rgba(74,222,128,0.18)"}}>✓ {PERMS_LABELS[p]}</span>;
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
                {Object.entries(ROLES_DEF as Record<string,{color:string;label:string;perms:string[]}>).filter(function(e){return e[0]!=="dueno";}).map(function(e){
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
                <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:7}}>Permisos del rol</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {(ROLES_DEF[form.rol]?.perms.includes("todo")?Object.keys(PERMS_LABELS):ROLES_DEF[form.rol]?.perms||[]).map(function(p){
                    return <span key={p} style={{padding:"2px 8px",borderRadius:20,fontSize:12,background:"rgba(74,222,128,0.08)",color:"var(--green)",border:"1px solid rgba(74,222,128,0.2)"}}>✓ {PERMS_LABELS[p]}</span>;
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
        var listaPlantilla = idsPlantilla.filter(function(id){return ["c1","c2","c3","c4","c5"].indexOf(id)===-1;}).map(function(id){return (clausulas||[]).find(function(c){return c.id===id;});}).filter(Boolean);
        var disponibles = (clausulas||[]).filter(function(c){ return c.id!=="c4" && ["c1","c2","c3","c4","c5"].indexOf(c.id)===-1 && clausulaAplicaTipo(c,tipoDocSel) && idsPlantilla.indexOf(c.id)===-1; });
        var defaultsLocked = !!plantillaActual.locked;
        var puedeAgregar = puedeEditarPlantillas && !defaultsLocked;

        function guardarPerfil(next){
          try { return onChange(next); } catch(e) { return Promise.resolve({error:e}); }
        }
        function actualizarPlantilla(changes){
          if(!puedeEditarPlantillas)return;
          var mapa=Object.assign({},perfil.plantillas||{});
          var actual=Object.assign({},mapa[tipoDocSel]||{}, {clausulas_ids:idsPlantilla.slice(), locked:defaultsLocked, version:obtenerVersionPlantilla(perfil,tipoDocSel)});
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
          var versionAnterior=obtenerVersionPlantilla(perfil,tipoDocSel);
          var cfg={clausulas_ids:idsPlantilla.slice(),locked:true,version:versionAnterior+1,version_updated_at:new Date().toISOString()};
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
        async function guardarNuevaClausula(){
          if(!plantillaForm||!String(plantillaForm.titulo||"").trim()||!String(plantillaForm.contenido||"").trim()||!puedeEditarPlantillas)return;
          var payload={titulo:String(plantillaForm.titulo).trim(),categoria:plantillaForm.categoria,contenido:String(plantillaForm.contenido).trim(),tipos:plantillaForm.tipos&&plantillaForm.tipos.length?plantillaForm.tipos:[tipoDocSel],obligatoria:!!plantillaForm.obligatoria};
          try{
            var res=plantillaForm.editId?await onEditClausula(plantillaForm.editId,payload):await onAddClausula(Object.assign({},payload,{id:genId()}));
            if(res&&res.error)throw res.error;
            if(!plantillaForm.editId&&clausulasError)throw new Error(clausulasError);
            setPlantillaForm(null);
            dwNotify("success",plantillaForm.editId?"Cláusula actualizada.":"Cláusula creada.");
          }catch(err){
            setPlantillaForm(Object.assign({},plantillaForm,{error:traducirError(err&&err.message||"No se pudo guardar la cláusula. Revisá los permisos de Supabase.")}));
          }
        }
        function ClauseCard({c,index}){
          var draggable=puedeAgregar;
          return <div key={c.id}
            draggable={draggable}
            onDragStart={function(e){if(!draggable)return;setDragClausulaId(c.id);try{e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",c.id);}catch(_){ console.debug("DocWorks: operación drag/drop no soportada por el navegador."); }}}
            onDragOver={function(e){if(draggable){e.preventDefault();try{e.dataTransfer.dropEffect="move";}catch(_){ console.debug("DocWorks: operación drag/drop no soportada por el navegador."); }}}}
            onDragEnter={function(e){if(draggable)e.preventDefault();}}
            onDrop={function(e){if(!draggable)return;e.preventDefault();var from=dragClausulaId||((e.dataTransfer&&e.dataTransfer.getData("text/plain"))||"");if(from&&from!==c.id)moverPlantilla(from,c.id);setDragClausulaId(null);}}
            onDragEnd={function(){setDragClausulaId(null);}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",border:"1px solid var(--border)",borderRadius:11,background:"rgba(255,255,255,.012)",opacity:dragClausulaId===c.id?.55:1}}>
            <div title={draggable?"Arrastrá esta cláusula para cambiar el orden":"Modelo protegido"} style={{width:30,height:30,borderRadius:9,background:"rgba(212,168,83,.09)",border:"1px solid rgba(212,168,83,.16)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"var(--gold)",flexShrink:0,cursor:draggable?"grab":"default"}}>⠿</div><div style={{minWidth:22,textAlign:"center",fontSize:12,color:"var(--dim)",flexShrink:0}}>{index+1}</div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:12.7,fontWeight:650,color:"var(--text)"}}>{(c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título"}</span>
                <SmallPill tone={CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;})?"gold":"green"}>{CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;})?"Estándar":"Propia"}</SmallPill>
                {c.obligatoria&&<SmallPill tone="muted">Obligatoria</SmallPill>}
              </div>
              <div style={{fontSize:12,color:"var(--dim)",marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{(c.contenido||"Sin texto.").replace(/\s+/g," ")}</div>
            </div>
            {puedeAgregar&&<div style={{display:"flex",gap:4,flexShrink:0}}><button title="Subir" onClick={function(){if(index>0)moverPlantilla(c.id,listaPlantilla[index-1].id);}} disabled={index===0} style={{height:29,width:29,borderRadius:7,border:"1px solid var(--border)",background:"rgba(255,255,255,.03)",color:index===0?"var(--border2)":"var(--muted)",cursor:index===0?"default":"pointer"}}>↑</button><button title="Bajar" onClick={function(){if(index<listaPlantilla.length-1)moverPlantilla(c.id,listaPlantilla[index+1].id);}} disabled={index===listaPlantilla.length-1} style={{height:29,width:29,borderRadius:7,border:"1px solid var(--border)",background:"rgba(255,255,255,.03)",color:index===listaPlantilla.length-1?"var(--border2)":"var(--muted)",cursor:index===listaPlantilla.length-1?"default":"pointer"}}>↓</button><button onClick={function(){quitarClausula(c.id);}} style={{height:29,padding:"0 9px",borderRadius:7,border:"1px solid rgba(248,113,113,.16)",background:"rgba(248,113,113,.05)",color:"var(--red)",cursor:"pointer",fontSize:12}}>Quitar</button></div>}
            <span style={{fontSize:12,color:puedeAgregar?"var(--dim)":"var(--gold)"}}>{puedeAgregar?"↕":"🔒"}</span>
          </div>;
        }
        function SmallPill({children=undefined,tone}){
          var map={gold:["rgba(212,168,83,.10)","var(--gold)"],teal:["rgba(45,212,191,.10)","var(--teal)"],green:["rgba(74,222,128,.09)","var(--green)"],muted:["rgba(255,255,255,.04)","var(--muted)"]};
          var x=map[tone||"muted"]||map.muted;
          return <span style={{fontSize:12,padding:"3px 7px",borderRadius:20,background:x[0],color:x[1],border:"1px solid rgba(255,255,255,.06)",whiteSpace:"nowrap"}}>{children}</span>;
        }
        function renderForm(){
          if(!plantillaForm||!puedeEditarPlantillas)return null;
          return <div style={{border:"1px solid rgba(212,168,83,.22)",borderRadius:11,padding:12,marginBottom:12,background:"rgba(212,168,83,.035)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}><div style={{fontSize:12.5,fontWeight:650,color:"var(--text)"}}>Nueva cláusula para la biblioteca</div><button onClick={function(){setPlantillaForm(null);}} style={{border:0,background:"transparent",color:"var(--dim)",fontSize:18,cursor:"pointer"}}>×</button></div>
            {plantillaForm.error&&<div role="alert" style={{fontSize:12,color:"var(--red)",marginBottom:8}}>{plantillaForm.error}</div>}<ClausulaFormBody form={plantillaForm} setForm={function(updater){setPlantillaForm(function(f){return typeof updater==="function"?updater(f):updater;});}} editId={plantillaForm.editId} onSubmit={guardarNuevaClausula} onCancel={function(){setPlantillaForm(null);}}/>
            <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)"}}><ClausulaIAComposer onDraft={function(draft){setPlantillaForm(function(f){return Object.assign({},f,{titulo:draft.titulo,categoria:draft.categoria||"general",contenido:draft.contenido,tipos:[tipoDocSel]});});}}/></div>
          </div>;
        }
        return <div>
          {plantillaVista==="aspecto"&&<div className="card" style={{padding:18}}>
            <div style={{maxWidth:760,margin:"0 auto 18px",textAlign:"center"}}><div style={{fontFamily:"DM Serif Display,serif",fontSize:19,color:"var(--text)"}}>Aspecto del documento</div><div style={{fontSize:12,color:"var(--dim)",lineHeight:1.55,marginTop:4}}>Configurá una sola vez la identidad visual de DocWorks. Estos cambios se aplican a todos los documentos.</div></div>
            <div style={{display:"block"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Identidad y diseño</div>
                <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>El editor visual que ya tenés sigue acá, pero ahora está separado de los modelos para que quede claro que es una configuración global.</div>
              </div>
            </div>
            <div style={{marginTop:14}}>
                  {!puedeEditarPlantillas&&<div style={{padding:"8px 10px",borderRadius:9,background:"rgba(251,191,36,.07)",border:"1px solid rgba(251,191,36,.17)",color:"var(--amber)",fontSize:12,marginBottom:10}}>🔒 Solo Dueño y Administrador pueden modificar esta configuración.</div>}
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {/* APARIENCIA + VISTA PREVIA EN VIVO */}
                    <div className="plantilla-appearance-grid" style={{display:"grid",gridTemplateColumns:"minmax(250px,.9fr) minmax(320px,1.1fr)",gap:12,alignItems:"start",marginBottom:10}}>
                      <div style={{border:"1px solid var(--border)",borderRadius:10,padding:12,background:"rgba(255,255,255,.012)"}}>
                        <div style={{fontSize:12,fontWeight:650,color:"var(--text)",marginBottom:3}}>Apariencia del documento</div>
                        <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.45,marginBottom:10}}>Elegí una sección para ajustar la identidad visual. La vista previa se actualiza mientras editás.</div>
                        <div role="tablist" aria-label="Secciones del aspecto del documento" className="dw-aspecto-nav">{[{id:"encabezado",label:"Encabezado",desc:"Logo e identidad",icon:"▤"},{id:"diseno",label:"Diseño",desc:"Estilo y colores",icon:"◈"},{id:"ubicacion",label:"Ubicación",desc:"Dirección institucional",icon:"⌖"},{id:"pie",label:"Pie de página",desc:"Leyenda y numeración",icon:"▱"}].map(function(o){var active=aspectoPanel===o.id;return <button key={o.id} type="button" role="tab" aria-selected={active} className={"dw-aspecto-nav-item"+(active?" is-active":"")} onClick={function(){setAspectoPanel(o.id);}}><span className="dw-aspecto-nav-icon" aria-hidden="true">{o.icon}</span><span className="dw-aspecto-nav-copy"><strong>{o.label}</strong><small>{o.desc}</small></span><span className="dw-aspecto-nav-arrow" aria-hidden="true">›</span></button>;})}</div>{aspectoPanel==="encabezado"&&<div className="preview-control-section" style={{paddingTop:0}}><div className="preview-control-title">Logo de la inmobiliaria</div><div style={{display:"flex",alignItems:"center",gap:10}}>{localPerfil.logoDataUrl?<div style={{position:"relative"}}><img src={localPerfil.logoDataUrl} style={{height:54,width:88,borderRadius:8,objectFit:"contain",background:"rgba(255,255,255,.04)",border:"1px solid var(--border2)",padding:4}} alt="logo"/><button type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{logoDataUrl:"",pie_pagina_logo_debajo:false});});}} style={{position:"absolute",top:-7,right:-7,width:20,height:20,borderRadius:"50%",background:"var(--red)",border:"none",color:"white",cursor:"pointer",fontSize:12}}>✕</button></div>:<div className="logo-upload" onClick={function(){fileRef.current.click();}} style={{height:54,width:88}}><span style={{fontSize:18}}>🖼</span><span style={{fontSize:12,color:"var(--dim)"}}>Subir logo</span></div>}<input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogo}/></div>{localPerfil.logoDataUrl&&<><div style={{fontSize:12,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:12,marginBottom:7}}>Posición</div><div style={{display:"flex",gap:5}}>{[{v:"izquierda",l:"Izquierda"},{v:"centro",l:"Centro"},{v:"derecha",l:"Derecha"}].map(function(o){var sel=(localPerfil.logoPosicion||"derecha")===o.v;return <button key={o.v} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{logoPosicion:o.v});});}} style={{flex:1,padding:"6px 4px",fontSize:12,borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.12)":"transparent",color:sel?"var(--gold)":"var(--dim)"}}>{o.l}</button>;})}</div><div style={{fontSize:12,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:12,marginBottom:6,display:"flex",justifyContent:"space-between"}}><span>Tamaño logo</span><span style={{color:"var(--gold)"}}>{localPerfil.logoScale||100}%</span></div><input type="range" min="50" max="200" step="5" value={localPerfil.logoScale||100} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{logoScale:parseInt(e.target.value,10)});});}} style={{width:"100%",accentColor:"var(--gold)"}}/></>}</div>
                        }{aspectoPanel==="diseno"&&<div className="preview-control-section"><div className="preview-control-title">Diseño del documento</div><div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,marginBottom:9}}>Elegí entre un documento moderno o uno tradicional. Cambia la presentación, no las cláusulas ni los datos legales.</div><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>{PLANTILLA_ESTILOS.map(function(pe){var sel=(localPerfil.plantillaEstilo||"corporativo")===pe.id;return <button key={pe.id} type="button" aria-pressed={sel} onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{plantillaEstilo:pe.id});});}} style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:5,padding:"12px 10px",minHeight:78,borderRadius:10,cursor:"pointer",textAlign:"left",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.1)":"transparent",color:sel?"var(--gold)":"var(--text)"}}><span style={{fontSize:13,fontWeight:700}}>{pe.label} {sel?"✓":""}</span><span style={{fontSize:11,lineHeight:1.4,color:"var(--dim)"}}>{pe.desc}</span></button>;})}</div>{(localPerfil.plantillaEstilo||"corporativo")==="minimalista"&&<div style={{fontSize:11,color:"var(--dim)",marginTop:8}}>Tu perfil usa el estilo Minimalista anterior. Se mantiene hasta que elijas Moderno o Tradicional y guardes.</div>}<div style={{display:"flex",gap:10,marginTop:9}}>{[{k:"colorPrimario",l:"Primario",d:"#142a4d"},{k:"colorSecundario",l:"Secundario",d:"#c9a227"}].map(function(f){return <label key={f.k} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"var(--text)"}}><input type="color" value={localPerfil[f.k]||f.d} onChange={function(e){setLocalPerfil(function(p){var o={};o[f.k]=e.target.value;return Object.assign({},p,o);});}} style={{width:27,height:27,padding:0,border:"1px solid var(--border2)",borderRadius:6}}/>{f.l}</label>;})}</div></div>
                        }{aspectoPanel==="encabezado"&&<div className="preview-control-section"><div className="preview-control-title">Datos del encabezado</div>
                          <label style={{display:"flex",alignItems:"center",gap:7,padding:"8px 9px",marginBottom:8,borderRadius:8,border:"1px solid var(--border)",background:localPerfil.logo_encabezado_activo!==false?"rgba(212,168,83,.08)":"transparent",cursor:localPerfil.logoDataUrl?"pointer":"not-allowed",opacity:localPerfil.logoDataUrl?1:.55,fontSize:12,color:"var(--text)"}}><input type="checkbox" disabled={!localPerfil.logoDataUrl} checked={localPerfil.logo_encabezado_activo!==false} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{logo_encabezado_activo:e.target.checked});});}}/> Mostrar logo en el encabezado</label>
                          <div style={{display:"flex",flexDirection:"column",gap:6}}>{[{k:"encabezado_nombre",l:"Nombre de la inmobiliaria"},{k:"encabezado_matricula",l:"Matrícula / CMCPSI"},{k:"encabezado_web",l:"Sitio web"}].map(function(f){var checked=localPerfil[f.k]!==false;return <label key={f.k} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:"var(--text)",cursor:"pointer"}}><input type="checkbox" checked={checked} onChange={function(e){var o={};o[f.k]=e.target.checked;setLocalPerfil(function(p){return Object.assign({},p,o);});}}/>{f.l}</label>;})}</div></div>
                        }{aspectoPanel==="ubicacion"&&<div className="preview-control-section"><div className="preview-control-title">Ubicación de la inmobiliaria</div>
                          <label style={{display:"flex",alignItems:"center",gap:7,padding:"8px 9px",borderRadius:8,border:"1px solid var(--border)",background:localPerfil.ubicacion_inmobiliaria_activa&&localPerfil.direccion?"rgba(212,168,83,.08)":"transparent",cursor:localPerfil.direccion?"pointer":"not-allowed",opacity:localPerfil.direccion?1:.55,fontSize:12,color:"var(--text)"}}><input type="checkbox" disabled={!localPerfil.direccion} checked={!!localPerfil.ubicacion_inmobiliaria_activa} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{ubicacion_inmobiliaria_activa:e.target.checked});});}}/> Mostrar ubicación</label>
                          <div style={{fontSize:12,color:"var(--dim)",marginTop:6,lineHeight:1.45}}>Usa la dirección ya cargada en <b style={{color:"var(--text)"}}>Mi cuenta</b>. No modifica ese dato.</div>
                          {localPerfil.ubicacion_inmobiliaria_activa&&localPerfil.direccion&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>{[{v:"encabezado",l:"Encabezado"},{v:"pie",l:"Pie de página"}].map(function(o){var sel=(localPerfil.ubicacion_inmobiliaria_posicion||"pie")===o.v;return <button key={o.v} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{ubicacion_inmobiliaria_posicion:o.v});});}} style={{padding:"7px 8px",borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.10)":"transparent",color:sel?"var(--gold)":"var(--dim)",fontSize:12,fontWeight:sel?700:500}}>{o.v==="encabezado"?"↥ ":"↓ "}{o.l}</button>;})}</div>}
                        </div>
                        }{aspectoPanel==="pie"&&<div className="preview-control-section dw-aspecto-pie-card"><div className="preview-control-title">Pie de página</div>
                          <label style={{display:"flex",alignItems:"center",gap:7,padding:"8px 9px",borderRadius:8,border:"1px solid var(--border)",background:localPerfil.pie_pagina_leyenda_activa!==false?"rgba(212,168,83,.08)":"transparent",cursor:"pointer",fontSize:12,color:"var(--text)"}}><input type="checkbox" checked={localPerfil.pie_pagina_leyenda_activa!==false} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_leyenda_activa:e.target.checked});});}}/> Mostrar leyenda</label>
                          {localPerfil.pie_pagina_leyenda_activa!==false&&<Txa label="Leyenda" value={localPerfil.pie_pagina_texto||""} onChange={fP("pie_pagina_texto")} placeholder="Ej: Documento emitido por..." rows={2}/>} 
                          <label style={{display:"flex",alignItems:"center",gap:7,marginTop:8,padding:"8px 9px",borderRadius:8,border:"1px solid var(--border)",background:localPerfil.pie_pagina_logo_debajo?"rgba(212,168,83,.08)":"transparent",cursor:localPerfil.logoDataUrl?"pointer":"not-allowed",opacity:localPerfil.logoDataUrl?1:.5,fontSize:12,color:"var(--text)"}}><input type="checkbox" disabled={!localPerfil.logoDataUrl} checked={!!localPerfil.pie_pagina_logo_debajo} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_logo_debajo:e.target.checked});});}}/> Mostrar logo en el pie</label>
                          {localPerfil.logoDataUrl&&localPerfil.pie_pagina_logo_debajo&&<><div style={{fontSize:12,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:10,marginBottom:6}}>Posición del logo</div><div style={{display:"flex",gap:5}}>{[{v:"izquierda",l:"Izquierda"},{v:"centro",l:"Centro"},{v:"derecha",l:"Derecha"}].map(function(o){var sel=(localPerfil.pie_pagina_logo_posicion||"centro")===o.v;return <button key={o.v} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_logo_posicion:o.v});});}} style={{flex:1,padding:"6px 4px",fontSize:12,borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.12)":"transparent",color:sel?"var(--gold)":"var(--dim)"}}>{o.l}</button>;})}</div><div style={{fontSize:12,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:10,marginBottom:6,display:"flex",justifyContent:"space-between"}}><span>Tamaño logo del pie</span><span style={{color:"var(--gold)"}}>{localPerfil.pie_pagina_logo_scale||100}%</span></div><input type="range" min="50" max="200" step="5" value={localPerfil.pie_pagina_logo_scale||100} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_logo_scale:parseInt(e.target.value,10)});});}} style={{width:"100%",accentColor:"var(--gold)"}}/></>}
                          <label style={{display:"flex",alignItems:"center",gap:7,marginTop:8,padding:"8px 9px",borderRadius:8,border:"1px solid var(--border)",background:localPerfil.pie_pagina_numero_activo!==false?"rgba(255,255,255,.025)":"transparent",cursor:"pointer",fontSize:12,color:"var(--text)"}}><input type="checkbox" checked={localPerfil.pie_pagina_numero_activo!==false} onChange={function(e){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_numero_activo:e.target.checked});});}}/> Mostrar número de página</label>
                          {localPerfil.pie_pagina_numero_activo!==false&&<><div style={{fontSize:12,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginTop:10,marginBottom:6}}>Posición del número</div><div style={{display:"flex",gap:5}}>{[{v:"izquierda",l:"Izquierda"},{v:"centro",l:"Centro"},{v:"derecha",l:"Derecha"}].map(function(o){var sel=(localPerfil.pie_pagina_numero_posicion||"derecha")===o.v;return <button key={o.v} type="button" onClick={function(){setLocalPerfil(function(p){return Object.assign({},p,{pie_pagina_numero_posicion:o.v});});}} style={{flex:1,padding:"6px 4px",fontSize:12,borderRadius:8,cursor:"pointer",border:sel?"1px solid var(--gold)":"1px solid var(--border2)",background:sel?"rgba(212,168,83,.12)":"transparent",color:sel?"var(--gold)":"var(--dim)"}}>{o.l}</button>;})}</div></>}
                        </div>
                        }<div style={{display:"flex",alignItems:"center",gap:9,paddingTop:2}}><Btn v="success" s="sm" onClick={savePerfil} disabled={perfilSaveStatus==="saving"}>{perfilSaveStatus==="saving"?"Guardando…":"Guardar apariencia ✓"}</Btn>{perfilSaveStatus==="saved"&&<span style={{fontSize:12,color:"var(--green)",fontWeight:600}}>✓ Guardado</span>}</div>
                      </div>
                      <div className="card" style={{padding:14,position:"sticky",top:10}}><div style={{fontSize:13.5,fontFamily:"DM Serif Display,serif",color:"var(--text)",marginBottom:3}}>Vista previa · primera hoja</div><div style={{fontSize:12,color:"var(--dim)",marginBottom:10}}>Reserva de compra de muestra para visualizar logo, encabezado, diseño y pie de página. El documento definitivo se genera por separado.</div><CuentaDocumentoPreview/></div>
                    </div>

                  </div>
                </div>
          </div>}
          {false&&plantillaVista==="modelos"&&<>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
<div id="dw-modelo-pasos" style={{display:"flex",gap:6}}>{[["Documento",1],["Modelo",2],["Introducción",3],["Cláusulas",4]].map(function(p){var n=p[1],act=modeloPaso===n,done=modeloPaso>n;return <button key={n} type="button" onClick={function(){dwIrPasoModelo(setModeloPaso,n);}} style={{flex:"1 1 0",minWidth:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 2px",border:"1px solid "+(act?"rgba(212,168,83,.55)":"var(--border)"),borderRadius:10,background:act?"rgba(212,168,83,.10)":"transparent",cursor:"pointer"}}><span style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:750,background:act?"var(--gold)":done?"rgba(74,222,128,.15)":"rgba(148,163,184,.12)",color:act?"#111":done?"var(--green)":"var(--muted)"}}>{done?"✓":n}</span><span style={{fontSize:11.5,fontWeight:act?700:500,color:act?"var(--text)":"var(--muted)",whiteSpace:"nowrap"}}>{p[0]}</span></button>;})}</div>
<div style={{display:"flex",flexDirection:"column",gap:12,maxHeight:"calc(100vh - 360px)",minHeight:240,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
{modeloPaso===1&&<div className="card" style={{padding:14}}>
              <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12,marginBottom:10,flexWrap:"wrap"}}>
                <div><div style={{fontSize:12,color:"var(--dim)",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>Modelo de documento</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>Elegí qué tipo de documento querés configurar.</div></div>
                <SmallPill tone="gold">{TIPOS[tipoDocSel]}</SmallPill>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:7}}>
                {PLANTILLA_TIPOS.map(function(tipo){
                  var cfg=obtenerPlantillaConfig(perfil,tipo,clausulas);
                  var active=tipo===tipoDocSel;
                  var count=cfg.clausulas_ids.length;
                  return <button key={tipo} onClick={function(){setTipoDocSel(tipo);setPlantillaSubtab("cuerpo");setPlantillaForm(null);setDragClausulaId(null);setEncabezadoEditing(false);setConfiguracionPlantillaAbierta(false);setMostrarPreviewConfiguracion(false);setMostrarBloquesConfiguracion(false);}} style={{display:"flex",alignItems:"center",gap:9,width:"100%",minHeight:54,border:active?"1px solid rgba(212,168,83,.42)":"1px solid var(--border)",borderRadius:10,padding:"8px 10px",background:active?"rgba(212,168,83,.10)":"rgba(255,255,255,.012)",color:active?"var(--text)":"var(--muted)",cursor:"pointer",textAlign:"left",boxShadow:active?"0 4px 14px rgba(0,0,0,.08)":"none"}}>
                    <span style={{width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:active?"rgba(212,168,83,.14)":"rgba(148,163,184,.07)",fontSize:16,flexShrink:0}}>{TIPO_ICON[tipo]||TIPO_ICON_DEFAULT}</span>
                    <span style={{minWidth:0,flex:1}}><span style={{display:"block",fontSize:12,fontWeight:active?650:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{TIPOS[tipo]}</span><span style={{display:"block",fontSize:12,color:cfg.locked?"var(--green)":"var(--dim)",marginTop:2}}>{cfg.locked?"Fijado":""}{cfg.locked?" · ":""}{count} cláusulas</span></span>
                  </button>;
                })}
              </div>
</div>}
            {/* Introducción del modelo seleccionado */}
{modeloPaso===3&&<div className="card" style={{padding:14}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:8}}>
                <div>
                  <div style={{fontSize:12,color:"var(--dim)",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>Introducción del documento</div>
                  <div style={{fontSize:12,color:"var(--dim)",marginTop:3,lineHeight:1.45}}>Preámbulo legal de <strong style={{color:"var(--text)"}}>{TIPOS[tipoDocSel]||tipoDocSel}</strong> (ej. “Recibimos de…”). Editable por tipo · tokens clicables · IA.</div>
                </div>
                <span className="badge" style={{background:customTextoPreview?"rgba(212,168,83,.10)":"rgba(74,222,128,.08)",color:customTextoPreview?"var(--gold)":"var(--green)"}}>{customTextoPreview?"Personalizado":"Predeterminado"}</span>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:12,color:"var(--text)",cursor:"pointer"}}>
                <input type="checkbox" checked={localPerfil.mostrar_introduccion!==false} onChange={function(e){var next=Object.assign({},localPerfil,{mostrar_introduccion:e.target.checked});setLocalPerfil(next);persistirPerfil(next);}}/>
                <span><strong>Incluir apertura</strong> en los documentos generados</span>
              </label>
              {puedeEditarPlantillas&&!encabezadoEditing&&(
                <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginBottom:8}}>
                  <button type="button" onClick={function(){setEncabezadoDraft(getEncabezadoTemplate(tipoDocSel, localPerfil));setEncabezadoEditing(true);}} style={{height:30,padding:"0 10px",borderRadius:8,border:"1px solid rgba(212,168,83,.25)",background:"rgba(212,168,83,.07)",color:"var(--gold)",cursor:"pointer",fontSize:12}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:6}}><DWIcon name="edit" size={13}/>Editar apertura</span>
                  </button>
                  {customTextoPreview&&(
                    <button type="button" onClick={function(){var mapa=Object.assign({},customMapPreview);delete mapa[tipoDocSel];var next=Object.assign({},localPerfil,{encabezados_custom:mapa});setLocalPerfil(next);persistirPerfil(next).then(function(res){if(!(res&&res.error)){setEncabezadoDraft("");setEncabezadoEditing(false);}});}} style={{height:30,padding:"0 10px",borderRadius:8,border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",cursor:"pointer",fontSize:12}}>Restablecer</button>
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
                <div style={{marginTop:4,padding:"9px 10px",borderRadius:8,background:"rgba(255,255,255,.025)",border:"1px solid var(--border2)",fontSize:12,color:"var(--muted)",lineHeight:1.5,whiteSpace:"pre-wrap"}}>
                  {sustituirTokens(customTextoPreview||DEFAULT_ENCABEZADOS[tipoDocSel]||"Sin introducción predeterminada para este tipo.", SAMPLE_OP_PREVIEW, localPerfil, tipoDocSel).slice(0,480)}
                  {(customTextoPreview||DEFAULT_ENCABEZADOS[tipoDocSel]||"").length>480?"…":""}
                </div>
              )}
</div>}

{modeloPaso===4&&renderForm()}
{(modeloPaso===2||modeloPaso===4)&&<div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:13}}>
                {modeloPaso===4&&<div>{clausulasError&&<div style={{marginBottom:10,padding:"8px 10px",borderRadius:8,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.25)",color:"var(--red)",fontSize:12}}>{clausulasError} {onRetryClausulas&&<button type="button" onClick={onRetryClausulas} style={{marginLeft:8,border:"1px solid currentColor",background:"transparent",color:"inherit",borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:12}}>Reintentar</button>}</div>}
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                    <div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{TIPOS[tipoDocSel]} · {contarBloquesCuerpo(perfil,tipoDocSel,bloquesReserva)} cláusulas del modelo · {listaPlantilla.length} cláusula{listaPlantilla.length===1?"":"s"}</div></div>
                    {defaultsLocked&&<SmallPill tone="green">🔒 Fijada</SmallPill>}
                  </div>
                  <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,margin:"9px 0 11px"}}>La plantilla define el documento completo: qué cláusulas tiene y en qué orden.</div>
                  {listaPlantilla.length===0?<div style={{padding:24,textAlign:"center",border:"1px dashed var(--border)",borderRadius:10,color:"var(--dim)",fontSize:12}}>Esta plantilla todavía no tiene cláusulas.</div>:<div style={{display:"flex",flexDirection:"column",gap:7}}>{listaPlantilla.map(function(c,i){return <ClauseCard key={c.id} c={c} index={i}/>;})}</div>}
                  {puedeAgregar&&<div style={{marginTop:12,paddingTop:11,borderTop:"1px solid var(--border)"}}>
                    <div style={{fontSize:12,color:"var(--dim)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Agregar cláusula existente</div>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}><select className="inp" style={{flex:1,minWidth:0}} defaultValue="" onChange={function(e){if(e.target.value){agregarClausula(e.target.value);e.target.value="";}}}><option value="">Seleccioná una cláusula de la Biblioteca…</option>{disponibles.map(function(c){return <option key={c.id} value={c.id}>{(c.titulo&&String(c.titulo).trim())?String(c.titulo).trim():"Cláusula sin título"}{CLAUSULAS_DEFAULT.find(function(d){return d.id===c.id;})?" · Estándar":" · Propia"}</option>;})}</select><Btn s="sm" onClick={nuevaClausula}>＋ Nueva</Btn></div>
                  </div>}
                </div>}

                {modeloPaso===2&&<div className="card" style={{padding:14,marginTop:10}}>
                  <div style={{fontSize:14,fontFamily:"DM Serif Display,serif",color:"var(--text)",marginBottom:4}}>Modelo del documento</div>
                  <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,marginBottom:12}}>Modificá el contenido del documento sin alterar los datos que se completan automáticamente desde Operaciones.</div>
                  {bloquesError&&tipoDocSel==="reserva"&&<div style={{marginBottom:10,padding:"8px 10px",borderRadius:8,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.25)",color:"var(--red)",fontSize:12}}>{bloquesError} {onRetryBloques&&<button type="button" onClick={onRetryBloques} style={{marginLeft:8,border:"1px solid currentColor",background:"transparent",color:"inherit",borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:12}}>Reintentar</button>}</div>}
                  {tipoDocSel==="reserva"&&bloquesLoading&&bloquesReserva.length===0&&<div style={{fontSize:12,color:"var(--dim)",marginBottom:8}}>Cargando tus cláusulas de Reserva… mientras tanto se muestra la versión de fábrica en solo lectura.</div>}
                  {tipoDocSel==="reserva"&&!bloquesLoading&&bloquesReserva.length===0&&<div style={{fontSize:12,color:"var(--amber)",marginBottom:8}}>No hay cláusulas de Reserva activas guardadas en Supabase. Se muestra la versión de fábrica solo como vista previa; la API actual no permite reactivar cláusulas inactivas. Aplicá la migración SQL incluida para habilitarlo.</div>}
                  {tipoDocSel==="reserva" ? (<ReservaBloquesPanel bloques={Array.isArray(bloquesReserva)&&bloquesReserva.length?bloquesReserva:DEFAULT_BLOQUES_RESERVA} onUpdate={onUpdateBloqueReserva} onMove={onMoveBloqueReserva} clausulasLib={Array.isArray(clausulas)?clausulas:[]} operaciones={Array.isArray(operaciones)?operaciones:[]} puedeEditar={puedeEditarPlantillas&&!defaultsLocked&&Array.isArray(bloquesReserva)&&bloquesReserva.length>0} perfil={perfil} puedeVerHistorial={puedeEditarPlantillas}/> ) : <CuerpoPlantillaPanel perfil={perfil} tipo={tipoDocSel} puedeEditar={puedeEditarPlantillas&&!defaultsLocked} puedeVerHistorial={puedeEditarPlantillas} usuarioActual={{id:currentUserId,nombre:(equipo||[]).find(function(m){return m&&m.id===currentUserId;})?.nombre||currentUserId||"Usuario actual"}} onChange={guardarPerfil} clausulas={Array.isArray(clausulas)?clausulas:[]} />}
                </div>}
              </div>
              {puedeEditarPlantillas&&<div style={{display:"flex",justifyContent:"flex-end",gap:7,marginTop:10}}>{defaultsLocked?<button onClick={desbloquearPlantilla} style={{height:32,padding:"0 12px",borderRadius:8,border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",cursor:"pointer",fontSize:12}}>Desbloquear para modificar</button>:<button onClick={finalizarPlantilla} disabled={!idsPlantilla.length} style={{height:32,padding:"0 12px",borderRadius:8,border:"1px solid rgba(74,222,128,.22)",background:idsPlantilla.length?"rgba(74,222,128,.08)":"rgba(255,255,255,.02)",color:idsPlantilla.length?"var(--green)":"var(--dim)",cursor:idsPlantilla.length?"pointer":"not-allowed",fontSize:12,fontWeight:650}}>🔒 Fijar modelo</button>}</div>}
</div>}
</div>
<div style={{display:"flex",justifyContent:"space-between",gap:8}}>{modeloPaso>1?<Btn v="ghost" s="sm" onClick={function(){dwIrPasoModelo(setModeloPaso,modeloPaso-1);}}>← Anterior</Btn>:<span/>}{modeloPaso<4?<Btn s="sm" onClick={function(){dwIrPasoModelo(setModeloPaso,modeloPaso+1);}}>Siguiente →</Btn>:<span/>}</div>
</div>
          </>}
          {confirmLockDefaults&&<Modal open={true} onClose={function(){setConfirmLockDefaults(false);}} title="Fijar modelo">
            <div style={{fontSize:12.5,color:"var(--muted)",lineHeight:1.55,marginBottom:15}}>Vas a fijar <b style={{color:"var(--text)"}}>{listaPlantilla.length}</b> cláusulas para <b style={{color:"var(--text)"}}>{TIPOS[tipoDocSel]}</b>. El asesor seguirá pudiendo usar la plantilla al crear operaciones, pero las cláusulas obligatorias del modelo se identificarán en «Obligatoria en» y no se mezclarán con las adicionales de la biblioteca.</div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:7}}><Btn v="ghost" onClick={function(){setConfirmLockDefaults(false);}}>Cancelar</Btn><Btn v="success" onClick={confirmarBloqueo}>Fijar modelo</Btn></div>
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
        return <div>
          <div className="card" style={{padding:"16px 18px",marginBottom:10,borderRadius:14,background:"linear-gradient(180deg,rgba(212,168,83,.055),rgba(212,168,83,.018))"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
              <div>
                <div style={{fontFamily:"DM Serif Display,serif",fontSize:17,color:"var(--text)"}}>Auditoría</div>
                <div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>Acá ves únicamente qué cambió, quién lo cambió y cuándo.</div>
              </div>
              <span className="badge" style={{background:"rgba(74,222,128,.08)",color:"var(--green)"}}>● Registro de cambios</span>
            </div>
          </div>
          {auditoriaSupabase&&auditoriaSupabase.error&&<div style={{marginBottom:10,padding:"9px 12px",borderRadius:9,background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.25)",color:"var(--red)",fontSize:12}}>{auditoriaSupabase.error}</div>}
          <div className="card" style={{display:"flex",gap:7,marginBottom:12,padding:10,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{flex:"1 1 180px",minWidth:160}}><input className="inp" value={auditQuery} onChange={function(e){setAuditQuery(e.target.value);}} placeholder="Buscar…" style={{height:38,boxSizing:"border-box",padding:"7px 10px",fontSize:13}}/></div>
            <Slt value={auditEntidad} onChange={function(e){setAuditEntidad(e.target.value);}} style={{minWidth:125}}><option value="todas">Todos los módulos</option><option value="clausula">Cláusulas</option><option value="bloque">Cláusulas de Reserva</option><option value="operacion">Operaciones</option><option value="plantilla">Plantillas</option><option value="configuracion">Configuración</option><option value="usuario">Usuarios</option></Slt>
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
                    <span style={{fontSize:12,fontWeight:700,padding:"3px 7px",borderRadius:15,color:ACCION_COLOR[en.accion]||"var(--muted)",background:"rgba(148,163,184,.08)"}}>{ACCION_LABEL[en.accion]||en.accion}</span>
                    <span style={{fontSize:12,fontWeight:650,color:"var(--text)"}}>{en.clausulaTitulo||en.entidadLabel||"Registro"}</span>
                    <span style={{fontSize:12,color:"var(--dim)"}}>· {en.entidadLabel}</span>
                    <span style={{fontSize:12,color:"var(--dim)",marginLeft:"auto"}}>{new Date(en.ts).toLocaleString("es-AR")}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,color:"var(--muted)"}}>Por <b style={{color:"var(--text)"}}>{en.actorNombre}</b></span>
                    <span style={{fontSize:12,color:"var(--gold)"}}>· Ver detalle</span>
                    <span style={{fontSize:12,color:"var(--dim)"}}>{abierta?"▲":"▼"}</span>
                  </div>
                </button>
                {abierta&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:7}}>Qué se hizo</div>
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
                <div><div style={{fontSize:12,color:"var(--gold)",fontWeight:750,textTransform:"uppercase",letterSpacing:".1em"}}>Cuenta profesional</div><div style={{fontFamily:"DM Serif Display,serif",fontSize:21,color:"var(--text)",marginTop:4}}>Facturación y suscripción</div><div style={{fontSize:12,color:"var(--dim)",marginTop:4}}>Administrá el plan de tu inmobiliaria, medios de pago, comprobantes y estado de la suscripción.</div></div>
                <div style={{padding:"7px 10px",borderRadius:10,border:"1px solid rgba(212,168,83,.25)",background:"rgba(212,168,83,.07)",color:"var(--gold)",fontSize:12,fontWeight:700}}>🔒 Acceso Dueño / Administrador</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:9}}>
              {[{l:"Plan",v:plan,i:"✦"},{l:"Estado",v:estado,i:"✓"},{l:"Próximo cobro",v:venc,i:"📅"},{l:"Importe mensual",v:monto,i:"$"}].map(function(k){return <div key={k.l} className="op-card" style={{padding:14}}><div style={{fontSize:16,color:"var(--gold)"}}>{k.i}</div><div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".07em",marginTop:7}}>{k.l}</div><div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginTop:3}}>{k.v}</div></div>;})}
            </div>

            <div className="dw-billing-layout" style={{display:"grid",gridTemplateColumns:"minmax(0,1.15fr) minmax(280px,.85fr)",gap:12,alignItems:"start"}}>
              <div className="card" style={{padding:16}}>
                <div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)",marginBottom:4}}>💳 Medio de pago</div>
                <div style={{fontSize:12,color:"var(--dim)",marginBottom:12}}>El medio elegido se guarda como referencia. DocWorks no debe almacenar números completos de tarjeta.</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:7}}>
                  {["Tarjeta de crédito","Tarjeta de débito","Transferencia bancaria"].map(function(m){var sel=metodo===m;return <button key={m} type="button" onClick={function(){guardarFact({metodo_pago:m});}} style={{textAlign:"left",padding:11,borderRadius:10,border:sel?"1px solid rgba(212,168,83,.5)":"1px solid var(--border)",background:sel?"rgba(212,168,83,.09)":"rgba(255,255,255,.015)",color:sel?"var(--gold)":"var(--text)",cursor:"pointer"}}><div style={{fontSize:17}}>{m.indexOf("Tarjeta")===0?"💳":"🏦"}</div><div style={{fontSize:12,fontWeight:650,marginTop:5}}>{m}</div>{sel&&<div style={{fontSize:12,color:"var(--green)",marginTop:4}}>✓ Seleccionado</div>}</button>;})}
                </div>
                <div style={{marginTop:12,padding:12,borderRadius:10,background:"rgba(74,222,128,.045)",border:"1px solid rgba(74,222,128,.15)"}}><div style={{fontSize:12,fontWeight:700,color:"var(--green)"}}>🔐 Mercado Pago conectado</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3,lineHeight:1.45}}>El pago se procesa en Mercado Pago. DocWorks guarda únicamente identificadores, estados y referencias; nunca números completos de tarjeta.</div><button type="button" className="btn btn-primary" style={{marginTop:10,width:"100%"}} onClick={async function(){try{var code=fact.plan_codigo||localPerfil.plan_codigo||localPerfil.plan||"profesional";var r=await docworksMercadoPago("create_checkout",{plan_codigo:code,payer_email:fact.email||localPerfil.email||"" ,back_url:window.location.href});if(r.init_point){window.location.href=r.init_point;}else{throw new Error("Mercado Pago no devolvió el enlace para continuar con el pago.");}}catch(e){dwNotify("error",traducirError(e&&e.message?e.message:String(e)));}}}>Continuar con Mercado Pago →</button><button type="button" className="btn btn-secondary" style={{marginTop:7,width:"100%"}} onClick={async function(){try{var r=await docworksMercadoPago("sync",{});if(r.subscription){var s=r.subscription;var next=Object.assign({},localPerfil,{facturacion:Object.assign({},fact,{estado_pago:s.status||fact.estado_pago,proximo_vencimiento:s.next_payment_date||fact.proximo_vencimiento,metodo_pago:s.payment_method_id||fact.metodo_pago})});setLocalPerfil(next);onChange(next);dwNotify("success","Estado de Mercado Pago actualizado.");}else{dwNotify("info","Todavía no hay una suscripción de Mercado Pago asociada.");}}catch(e){dwNotify("error",traducirError(e&&e.message?e.message:String(e)));}}}>↻ Actualizar estado</button></div>
              </div>

              <div className="card" style={{padding:16}}>
                <div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)",marginBottom:8}}>🧾 Datos de facturación</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <label style={{fontSize:12,color:"var(--dim)"}}>Razón social / nombre comercial<input className="inp" style={{marginTop:4}} value={fact.razon_social||localPerfil.nombre||""} onChange={function(e){guardarFact({razon_social:e.target.value});}} /></label>
                  <label style={{fontSize:12,color:"var(--dim)"}}>CUIT<input className="inp" style={{marginTop:4}} value={fact.cuit||""} onChange={function(e){guardarFact({cuit:e.target.value});}} placeholder="20-12345678-3" /></label>
                  <label style={{fontSize:12,color:"var(--dim)"}}>Correo electrónico de facturación<input className="inp" style={{marginTop:4}} value={fact.email||localPerfil.email||""} onChange={function(e){guardarFact({email:e.target.value});}} placeholder="administracion@inmobiliaria.com" /></label>
                  <label style={{fontSize:12,color:"var(--dim)"}}>Tipo de comprobante<select className="inp" style={{marginTop:4}} value={fact.comprobante||"Factura"} onChange={function(e){guardarFact({comprobante:e.target.value});}}><option>Factura</option><option>Factura A</option><option>Factura B</option><option>Factura C</option></select></label>
                </div>
              </div>
            </div>

            <div className="card" style={{padding:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10,flexWrap:"wrap"}}><div><div style={{fontFamily:"DM Serif Display,serif",fontSize:16,color:"var(--text)"}}>📋 Historial de cobros</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>Comprobantes y estados de cada período.</div></div><SABadge tone={estadoTone}>{estado}</SABadge></div>
              {historial.length===0?<div style={{padding:"22px 12px",textAlign:"center",border:"1px dashed var(--border)",borderRadius:10,color:"var(--dim)",fontSize:12}}>Todavía no hay cobros registrados en esta cuenta.<div style={{fontSize:12,marginTop:5}}>Cuando se conecte el sistema de pagos, cada cobro aparecerá automáticamente acá.</div></div>:<div style={{display:"flex",flexDirection:"column",gap:6}}>{historial.map(function(h,i){return <div key={h.id||i} className="sa-detail-row dw-payment-row"><div style={{minWidth:0,flex:"1 1 180px"}}><b>{h.periodo||"Período"}</b><div style={{fontSize:12,color:"var(--dim)",marginTop:3,overflowWrap:"anywhere"}}>{h.metodo_pago||"Medio no informado"} · {h.comprobante||"Comprobante no informado"}</div>{h.comprobante_url&&<a href={h.comprobante_url} target="_blank" rel="noreferrer" style={{fontSize:12,color:"var(--gold)",display:"inline-block",marginTop:4}}>Ver comprobante ↗</a>}</div><div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,flexWrap:"wrap"}}><b>{h.monto||"—"}</b><SABadge tone={h.estado==="pagado"||h.estado==="aprobado"?"green":h.estado==="rechazado"?"red":"amber"}>{h.estado||"pendiente"}</SABadge></div></div>;})}</div>}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:9}}>
              <div className="op-card" style={{padding:14}}><div style={{fontSize:15}}>📄</div><div style={{fontWeight:700,fontSize:12,marginTop:6}}>Comprobantes</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>Los cobros confirmados por Mercado Pago quedan registrados automáticamente en el historial.</div><button type="button" className="btn btn-secondary" style={{marginTop:9}} onClick={function(){dwNotify("info","Los comprobantes se habilitan a medida que Mercado Pago confirma los cobros.");}}>Ver historial</button></div>
              <div className="op-card" style={{padding:14}}><div style={{fontSize:15}}>🔔</div><div style={{fontWeight:700,fontSize:12,marginTop:6}}>Alertas de facturación</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>Avisos por vencimiento, pago rechazado o renovación.</div><label style={{display:"flex",alignItems:"center",gap:7,fontSize:12,marginTop:9}}><input type="checkbox" checked={fact.alertas!==false} onChange={function(e){guardarFact({alertas:e.target.checked});}}/> Recibir alertas</label></div>
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
                        <div style={{fontSize:12,color:"var(--dim)"}}>{ROLES_DEF[s.miembro.rol]?.label||s.miembro.rol}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)",marginBottom:4}}>
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
              <div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Filtrar:</div>
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
                {filteredOps.slice().sort(function(a,b){return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();}).map(function(o,i,arr){
                  var miembro=equipo.find(function(m){return m.id===o.broker_id;});
                  return(
                    <div key={o.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid var(--border)":"none"}}>
                    <span style={{padding:"2px 8px",borderRadius:20,fontSize:12,fontWeight:600,background:"rgba(212,168,83,0.12)",color:"var(--gold)"}}>{TIPOS[o.tipo]||o.tipo}</span>
                    <span style={{padding:"2px 8px",borderRadius:20,fontSize:12,fontWeight:600,background:o.estado==="activo"?"rgba(74,222,128,0.12)":o.estado==="cerrado"?"rgba(100,116,139,0.15)":"rgba(251,191,36,0.12)",color:o.estado==="activo"?"var(--green)":o.estado==="cerrado"?"var(--muted)":"var(--gold)"}}>{ESTADOS[o.estado]||o.estado}</span>
                      <div style={{flex:1,minWidth:0,fontSize:12.5,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {o.inmueble_direccion||"Sin dirección"}
                      </div>
                      <div style={{fontSize:12,color:"var(--muted)",flexShrink:0}}>{miembro?miembro.nombre:"—"}</div>
                      <div style={{fontSize:12,color:"var(--dim)",flexShrink:0,width:80,textAlign:"right"}}>{new Date(o.created_at).toLocaleDateString("es-AR")}</div>
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
 return ConfiguracionView;
}

export function crearDashboardView(deps){
 const {Btn, CAMPOS_CRITICOS_POR_TIPO, ConfirmModal, DWIcon, Dropdown, ESTADOS, Modal, PapeleraView, TIPOS, TIPO_ICON, aplicarEncabezadoPersonalizado, buildDocSections, campoPrincipalErrorExport, dwNotify, entregarArchivo, fmt$, generarPDF, getCamposFaltantesDetalle, getProximoPasoOperacion, loadSupabaseJs, lsGet, lsSet, nombreConSufijo, opParaDocumento, operacionCoincideBusqueda, requestDwConfirm, traducirError, useEffect, useState, validarDocumentoParaExport} = deps;



function DashboardView({operaciones,clausulas,perfil,bloquesReserva,onAuditExport,onNew,onEdit,onEditField,onDelete,onChangeEstado,onConvertir,onConvertirComodato,onConvertirRefuerzo,onConvertirBoleto,onConvertirDevolucion,onDuplicar,onViewDoc,onPerfil,onExportarCSV,onRestoreVersion,searchOverride,papelera,onRestore,onDeletePermanente,onVaciarPapelera,confirmVaciarPapelera,setConfirmVaciarPapelera,papeleraJump,error,papeleraError,onRetry,loading}){

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
  function getName(op){
      if(op.tipo==="alquiler"||op.tipo==="reserva_alquiler") return nombreConSufijo(op,"locatario","Locatario")+" (locatario) ← "+nombreConSufijo(op,"locador","Locador")+" (Locador)";
      return nombreConSufijo(op,"comprador","Comprador")+" (comprador) ← "+nombreConSufijo(op,"vendedor","Vendedor")+" (Vendedor)";
    }
  function getMonto(op){if(op.tipo==="alquiler")return op.alquiler_monto_inicial?fmt$(op.alquiler_monto_inicial,op.alquiler_moneda)+"/mes":null;if(op.tipo==="reserva_alquiler")return op.res_alq_monto_mensual?fmt$(op.res_alq_monto_mensual,op.res_alq_monto_mensual_moneda||op.res_alq_moneda||"ARS")+"/mes est.":null;return op.precio?fmt$(op.precio,op.moneda):null;}

  const [sharingId,setSharingId]=useState(null);
  const [historialOp,setHistorialOp]=useState(null);
  const [versionesOp,setVersionesOp]=useState([]);
  const [versionesLoading,setVersionesLoading]=useState(false);
  useEffect(function(){
    if(!historialOp||!historialOp.id){setVersionesOp([]);return;}
    var cancelado=false;setVersionesLoading(true);
    loadSupabaseJs().then(function(sb){if(!sb||cancelado)return null;return sb.from("documento_versiones").select("id,operacion_id,version,tipo_documento,documento,creado_por,creado_en").eq("operacion_id",historialOp.id).order("version",{ascending:false});}).then(function(res){if(cancelado)return;if(res&&res.error){console.warn("DocWorks: no se pudo cargar el historial de versiones.",res.error);setVersionesOp([]);}else setVersionesOp((res&&res.data)||[]);setVersionesLoading(false);}).catch(function(err){if(cancelado)return;console.warn("DocWorks: error cargando versiones.",err);setVersionesOp([]);setVersionesLoading(false);});
    return function(){cancelado=true;};
  },[historialOp&&historialOp.id]);
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
  const [confirmEliminarId,setConfirmEliminarId]=useState(null);
  function eliminarConEfecto(id){
    setConfirmEliminarId(id);
  }
  function confirmarEliminacion(){
    var id=confirmEliminarId;
    if(!id) return;
    setConfirmEliminarId(null);
    setRemovingIds(function(r){return Object.assign({},r,{[id]:true});});
    setTimeout(function(){ onDelete(id); setRemovingIds(function(r){var n=Object.assign({},r);delete n[id];return n;}); },260);
  }

  function defaultTabFor(op){
    if(op.tipo==="alquiler")return "alquiler";
    if(op.tipo==="reserva_alquiler")return "reserva_alquiler";
    return "boleto";
  }

  async function shareWhatsApp(op,forzar=false){
    var docValid=aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(Object.assign({},op,{inmobiliaria_nombre:perfil&&perfil.nombre,inmobiliaria_matricula:perfil&&perfil.matricula,inmobiliaria_domicilio:perfil&&perfil.direccion,inmobiliaria_email:perfil&&perfil.email,inmobiliaria_telefono:perfil&&perfil.telefono})), clausulas, defaultTabFor(op), bloquesReserva), op, defaultTabFor(op), perfil);
    var validacion=validarDocumentoParaExport(op,docValid,perfil);
    if(forzar&&validacion.errores.length&&typeof onAuditExport==="function"){
      var auditEntry={accion:"exportar_con_faltantes",operacion_id:op&&op.id||null,tipo:op&&op.tipo||null,formato:"WhatsApp",origen:"listado_operaciones",datos_faltantes:Array.from(new Set((validacion.errores||[]).concat((validacion.datosFaltantesDetalle||[]).map(function(x){return x.mensaje||x.label||x.token||String(x);})))),errores:(validacion.errores||[]).slice()};
      try{Promise.resolve(onAuditExport(auditEntry)).catch(function(err){console.warn("DocWorks: falló la auditoría al compartir",err);});}catch(_auditErr){console.warn("DocWorks: no se pudo iniciar la auditoría al compartir",_auditErr);}
    }
    if(validacion.errores.length&&!forzar){
      var campo=campoPrincipalErrorExport(op,perfil,validacion.errores);
      var detalle=<div><div style={{fontWeight:700,color:"var(--red)",marginBottom:6}}>Al documento le faltan estos datos:</div><ul style={{margin:"0 0 8px",paddingLeft:18,display:"flex",flexDirection:"column",gap:4}}>{validacion.errores.map(function(e,i){return <li key={i} style={{fontSize:13}}>{e}</li>;})}</ul><div style={{fontSize:12,color:"var(--dim)"}}>Podés completarlos ahora o compartirlo igual (puede salir incompleto).</div></div>;
      requestDwConfirm(detalle,function(){shareWhatsApp(op,true);},"Compartir borrador",{label:"Completar datos",onClick:function(){if(onEditField)onEditField(op,campo);else onEdit(op);}});
      return;
    }
    setSharingId(op.id);
    var popup=null;
    try{ popup=window.open("about:blank","docworks-share"); }catch(_e){ console.warn("DocWorks: error abriendo ventana de compartir.",_e); }
    if(!popup){ dwNotify("error","El navegador bloqueó la ventana para compartir. Activá los pop-ups para DocWorks e intentá nuevamente."); setSharingId(null); return; }
    try{
      var doc = docValid;
      var result = await generarPDF(doc, perfil.logoDataUrl||null, perfil);
      var txt = TIPOS[op.tipo]+" — "+getName(op)+(op.inmueble_direccion?" — "+op.inmueble_direccion:"");
      var entrega = await entregarArchivo(result.blob, result.filename, "application/pdf", {title:TIPOS[op.tipo], text:txt});
      if(entrega==="downloaded-whatsapp"){
        if(popup && !popup.closed) popup.location.href="https://web.whatsapp.com/send?text="+encodeURIComponent(txt);
        dwNotify("success","Abrimos WhatsApp Web y descargamos el PDF para adjuntarlo al chat.");
      } else if(popup && !popup.closed){ popup.close(); }
    } catch(e){
      if(popup && !popup.closed) popup.close();
      if(!(e && e.name==="AbortError")) dwNotify("error",traducirError(e&&e.message?e.message:"No se pudo compartir el documento."));
    }
    setSharingId(null);
  }

  const enPapelera = estadoTab==="papelera";

  function renderOpRow(op,nested,folder=undefined){
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
      <div className="op-actions" style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,flexWrap:"nowrap"}}>
        <Btn v="primary" s="md" onClick={function(){onViewDoc(op);}} style={{minWidth:94,justifyContent:"center",fontWeight:800,padding:"9px 14px"}}><DWIcon name="open" size={13} strokeWidth={2}/> Abrir</Btn>
        <Btn v="secondary" s="md" onClick={function(){onEdit(op);}} style={{minWidth:88,justifyContent:"center",fontWeight:700,padding:"9px 13px"}}><DWIcon name="edit" size={13}/> Editar</Btn>
        <Dropdown items={menuItems}/>
      </div>
    );

    // Fila condensada para documentos dentro de una carpeta: la operación
    // raíz ya muestra nombre y dirección, así que acá no se repite — solo
    // lo que distingue a ESTE documento (tipo, estado, monto, fecha).
    if (nested) {
      var ultN=op.actualizado_en||op.updated_at||op.created_at;
      var dirN=op.inmueble_direccion||"";
      return(
        <div key={op.id} className="op-card op-card-premium op-doc-card fade-up" style={Object.assign({position:"relative"},removiendo?{opacity:0,transform:"translateX(24px) scale(0.97)",pointerEvents:"none",transition:"opacity .22s ease,transform .22s ease"}:{})}>
          <div className="op-card-inner" style={{display:"flex",gap:15,alignItems:"stretch"}}>
            <div style={{flex:1,minWidth:0,paddingLeft:2}}>
              <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:8}}>
                <span className="op-type-badge">{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]||op.tipo}</span>
                <span className={"op-status-hero "+(op.estado||"borrador")}>{ESTADOS[op.estado]||"Borrador"}</span>
                <span style={{fontSize:11.5,fontWeight:800,color:"var(--teal)",letterSpacing:".04em",textTransform:"uppercase"}}>↳ Documento vinculado</span>
              </div>
              <div className={"op-address-strong "+(!dirN?"op-address-missing":"")} style={{display:"flex",alignItems:"flex-start",gap:6}}>
                <span style={{color:dirN?"var(--gold)":"#f59e0b",display:"inline-flex",marginTop:2}}><DWIcon name="pin" size={14}/></span>
                <span>{dirN||"⚠ Sin dirección cargada"}{op.inmueble_partido?" — "+op.inmueble_partido:""}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginTop:8}}>
                <div style={{fontSize:13,color:"var(--text)",fontWeight:650}}>{getName(op)}</div>
                {monto&&<span className="monto-tag">{monto}</span>}
              </div>
              <div style={{fontSize:12,color:"var(--dim)",marginTop:6}}>Creado el {new Date(op.created_at).toLocaleDateString("es-AR")}</div>
            </div>
            <div className="op-card-side">
              <div className="op-side-extra"><div className="op-side-label">Última actividad</div><div style={{fontSize:12,fontWeight:750,color:"var(--text)",marginTop:2}}>{ultN?new Date(ultN).toLocaleDateString("es-AR"):"Sin actividad"}</div></div>
              <div className="op-side-extra"><div className="op-side-label">Documento</div><div style={{fontSize:12,fontWeight:750,color:"var(--text)",marginTop:2}}>{TIPOS[op.tipo]||op.tipo}</div></div>
              <div>{acciones}</div>
            </div>
          </div>
        </div>
      );
    }

    var estadoClase=op.estado||"borrador";
    var hijosCount=hijosOp.length;
    var docsTotal=(esReserva||esResAlq)?(opcionesDoc(op)||[]).length:(hijosCount>0?hijosCount+1:1);
    var docsHechos=(esReserva||esResAlq)?Math.min(docsTotal,1+hijosCount):(hijosCount>0?hijosCount+1:1);
    // Para operaciones individuales, el progreso refleja los campos críticos cargados.
    // En carpetas con varios documentos, mantiene el progreso de documentos vinculados.
    var camposCriticos=CAMPOS_CRITICOS_POR_TIPO[op.tipo]||[];
    var camposPendientes=getCamposFaltantesDetalle(op,perfil).length;
    var progreso=docsTotal>1
      ? Math.max(0,Math.min(100,Math.round((docsHechos/Math.max(1,docsTotal))*100)))
      : (camposCriticos.length>0?Math.max(0,Math.min(100,Math.round((1-camposPendientes/camposCriticos.length)*100))):0);
    var etiquetaProgreso=docsTotal>1?"Documentos vinculados":"Datos de la operación";
    var ultima=op.actualizado_en||op.updated_at||op.created_at;
    function haceFecha(v){if(!v)return "Sin actividad";var d=new Date(v),ms=Math.max(0,Date.now()-d.getTime()),min=Math.floor(ms/60000),hor=Math.floor(min/60),dias=Math.floor(hor/24);if(min<1)return "Ahora";if(min<60)return "Hace "+min+" min";if(hor<24)return "Hace "+hor+" h";if(dias<30)return "Hace "+dias+" día"+(dias===1?"":"s");return d.toLocaleDateString("es-AR");}
    var direccion=op.inmueble_direccion||"";
    return(
      <div key={op.id} className="op-card op-card-premium fade-up" style={Object.assign({position:"relative",marginTop:0},removiendo?{opacity:0,transform:"translateX(24px) scale(0.97)",pointerEvents:"none",transition:"opacity .22s ease,transform .22s ease"}:{})}>
        <div className={"op-state-rail "+estadoClase}/><div className="op-card-inner" style={{display:"flex",gap:15,alignItems:"stretch"}}>
          <div style={{flex:1,minWidth:0,paddingLeft:2}}>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:8}}>
              <span className="op-type-badge">{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]||op.tipo}</span>
              <span className={"op-status-hero "+estadoClase}>{ESTADOS[op.estado]||"Borrador"}</span>
              {op.compartida&&<span className="badge" style={{background:"rgba(96,165,250,0.14)",color:"#60a5fa"}}>Compartida</span>}
              {folder&&<button type="button" className="op-folder-chip" onClick={folder.toggle} aria-expanded={!!folder.isOpen}><DWIcon name="folder" size={13}/> Carpeta · {folder.n} docs <span style={{display:"inline-flex",transition:"transform .15s",transform:folder.isOpen?"rotate(90deg)":"none"}}><DWIcon name="chevronRight" size={11} strokeWidth={2.2}/></span></button>}
            </div>
            <div className={"op-address-strong "+(!direccion?"op-address-missing":"")} style={{display:"flex",alignItems:"flex-start",gap:6}}>
              <span style={{color:direccion?"var(--gold)":"#f59e0b",display:"inline-flex",marginTop:2}}><DWIcon name="pin" size={14}/></span>
              <span>{direccion||"⚠ Sin dirección cargada"}{op.inmueble_partido?" — "+op.inmueble_partido:""}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginTop:8}}>
              <div style={{fontSize:13,color:"var(--text)",fontWeight:650}}>{getName(op)}</div>
              {monto&&<span className="monto-tag">{monto}</span>}
            </div>
            <div style={{fontSize:12,color:"var(--dim)",marginTop:6,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontWeight:700,color:"var(--muted)"}}>{esResAlq?"Locador → Locatario":esReserva?"Vendedor → Comprador":"Partes de la operación"}</span>
              <span>·</span><span>{new Date(op.created_at).toLocaleDateString("es-AR")}</span>
            </div>
            {(()=>{var pp=getProximoPasoOperacion(op,operaciones);return <div style={{marginTop:9,padding:"7px 9px",borderRadius:8,background:"rgba(212,168,83,.045)",border:"1px solid rgba(212,168,83,.12)",fontSize:12,color:pp.tone,fontWeight:750,display:"inline-flex",alignItems:"center",gap:5}}><span>{pp.icon}</span>{pp.texto}</div>;})()}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginTop:10}}>
              {(esReserva||esResAlq)?(function(){var opts=opcionesDoc(op);var faltan=opts.filter(function(o){return !hijosOp.some(function(h){return h.tipo===o.tipo;});}).length;return <Btn v={faltan>0?"orange":"secondary"} s="sm" onClick={function(){setAddDocFor(op);}}><DWIcon name="link" size={12} strokeWidth={2}/> {hijosOp.length>0?"Vinculados ("+hijosOp.length+")":"Agregar documento"}</Btn>;})():<span/>}
            </div>
          </div>
          <div className="op-card-side">
            <div className="op-side-extra"><div className="op-side-label">Última actividad</div><div style={{fontSize:12,fontWeight:750,color:"var(--text)",marginTop:2}}>{haceFecha(ultima)}</div></div>
            <div><div className="op-docs-count">{docsHechos} {docsHechos===1?"documento":"documentos"}</div></div>
            <div className="op-side-progress"><div className="op-side-label">{etiquetaProgreso}</div><div className="op-progress-row"><div className="op-progress"><span style={{width:(progreso+"%"),background:progreso===100?"#16a34a":undefined}} /></div><span className="op-progress-pct" style={progreso===100?{color:"#16a34a"}:undefined}>{progreso}%</span></div></div>
            <div>{acciones}</div>
            {op.broker_nombre||op.broker?<div className="op-side-extra"><div className="op-side-label">Agente</div><div style={{fontSize:12,fontWeight:650,color:"var(--text)",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{op.broker_nombre||op.broker}</div></div>:null}
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="dw-dashboard-root">
      <div className="section-header" style={{marginBottom:18}}>
        <div><div className="section-title">Operaciones</div><div className="section-sub">Tus carpetas de trabajo, con todos sus documentos vinculados en un solo lugar.</div></div>
        {!enPapelera&&<Btn onClick={onNew} className="btn-nueva">+ Nueva operación</Btn>}
      </div>
      <div className="dw-dashboard-overview" aria-label="Resumen de operaciones">
        {[{label:"Todas",value:total,icon:"folder",tab:"todas"},{label:"Activas",value:activas,icon:"clock",tab:"activo"},{label:"Borradores",value:nuevasCount,icon:"edit",tab:"borrador"},{label:"Cerradas",value:cerradasCount,icon:"check",tab:"cerrado"},{label:"Papelera",value:papelera.length,icon:"trash",tab:"papelera"}].map(function(item){return <button key={item.tab} type="button" className={"dw-overview-stat"+(estadoTab===item.tab?" is-selected":"")} onClick={function(){setEstadoTab(item.tab);}} aria-pressed={estadoTab===item.tab}><span className="dw-overview-label"><DWIcon name={item.icon} size={15}/>{item.label}</span><span className="dw-overview-value">{item.value}</span></button>;})}
      </div>
      {error && <div role="alert" style={{marginBottom:16,padding:"10px 14px",borderRadius:10,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",color:"var(--red)",fontSize:12.5}}>{error} {onRetry&&<button type="button" className="btn btn-secondary btn-sm" onClick={onRetry} style={{marginLeft:8}}>Reintentar</button>}</div>}
      {papeleraError && <div role="alert" style={{marginBottom:16,padding:"10px 14px",borderRadius:10,background:"rgba(212,168,83,0.08)",border:"1px solid rgba(212,168,83,0.35)",color:"var(--text)",fontSize:12.5}}>{papeleraError} {onRetry&&<button type="button" className="btn btn-secondary btn-sm" onClick={onRetry} style={{marginLeft:8}}>Reintentar</button>}</div>}
      {loading && operaciones.length===0 && <div style={{marginBottom:16,fontSize:12.5,color:"var(--muted)"}}>Cargando tus operaciones…</div>}

      {enPapelera ? (
        <PapeleraView embedded={true} papelera={papelera} onRestore={onRestore} onDeletePermanente={onDeletePermanente} onVaciar={onVaciarPapelera} confirmVaciar={confirmVaciarPapelera} setConfirmVaciar={setConfirmVaciarPapelera}/>
      ) : (
      <>
      <div className="filter-row dw-dashboard-toolbar">
        <div className="search-wrap" style={{flex:1,minWidth:180}}>
          <span className="search-icon"><DWIcon name="search" size={16} strokeWidth={2}/></span>
          <input className="search-inp" value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Buscar nombre, DNI, CUIT, dirección..."/>
        </div>
        <select className="inp filter-tipo" style={{width:"auto"}} value={filtroTipo} onChange={function(e){setFiltroTipo(e.target.value);}}>
          <option value="todos">Todos los tipos</option>
          {Object.entries(TIPOS).map(function(e){return <option key={e[0]} value={e[0]}>{e[1]}</option>;})}
        </select>
        {(function(){
          var nFiltros=Object.values(filtros).filter(function(v){return v!==""&&v!=="todos";}).length+(filtroTipo&&filtroTipo!=="todos"?1:0);
          return <button type="button" className={"btn btn-secondary btn-sm filtros-btn"+(filtrosAbiertos||nFiltros>0?" is-active":"")} aria-label="Filtros" aria-expanded={!!filtrosAbiertos} onClick={function(){setFiltrosAbiertos(function(v){return !v;});}}><DWIcon name="sliders" size={16} strokeWidth={1.9}/><span className="filtros-label">Filtros</span>{nFiltros>0&&<span className="filtros-badge">{nFiltros}</span>}</button>;
        })()}
        <div className="op-view-switch" title="Cambiar vista">
          <button type="button" className={modoVista==="tarjetas"?"active":""} onClick={function(){setModoVista("tarjetas");}} aria-label="Vista de tarjetas">▦</button>
          <button type="button" className={modoVista==="tabla"?"active":""} onClick={function(){setModoVista("tabla");}} aria-label="Vista de tabla">☷</button>
        </div>
      </div>
      {filtrosAbiertos&&<div className="op-filter-panel">
        <div className="op-filter-field op-filter-tipo-mobile"><label>Tipo de operación</label><select className="inp" value={filtroTipo} onChange={function(e){setFiltroTipo(e.target.value);}}><option value="todos">Todos los tipos</option>{Object.entries(TIPOS).map(function(e){return <option key={e[0]} value={e[0]}>{e[1]}</option>;})}</select></div>
        <div className="op-filter-field"><label>Desde</label><input className="inp" type="date" value={filtros.desde} onChange={function(e){setFiltros(Object.assign({},filtros,{desde:e.target.value}));}}/></div>
        <div className="op-filter-field"><label>Hasta</label><input className="inp" type="date" value={filtros.hasta} onChange={function(e){setFiltros(Object.assign({},filtros,{hasta:e.target.value}));}}/></div>
        <div className="op-filter-field"><label>Agente a cargo</label><select className="inp" value={filtros.agente} onChange={function(e){setFiltros(Object.assign({},filtros,{agente:e.target.value}));}}><option value="todos">Todos</option>{Array.from(new Map(operaciones.filter(function(o){return o.broker_id;}).map(function(o){return [String(o.broker_id),o.broker_nombre||o.broker||o.broker_id];})).entries()).map(function(e){return <option key={e[0]} value={e[0]}>{e[1]}</option>;})}</select></div>
        <div className="op-filter-field"><label>Sucursal</label><select className="inp" value={filtros.sucursal} onChange={function(e){setFiltros(Object.assign({},filtros,{sucursal:e.target.value}));}}><option value="todos">Todas</option>{Array.from(new Set(operaciones.map(function(o){return o.sucursal||o.sucursal_nombre;}).filter(Boolean))).map(function(v){return <option key={v} value={v}>{v}</option>;})}</select></div>
        <div className="op-filter-field"><label>Monto mínimo</label><input className="inp" type="number" min="0" placeholder="Sin mínimo" value={filtros.montoMin} onChange={function(e){setFiltros(Object.assign({},filtros,{montoMin:e.target.value}));}}/></div>
        <div className="op-filter-field"><label>Monto máximo</label><input className="inp" type="number" min="0" placeholder="Sin máximo" value={filtros.montoMax} onChange={function(e){setFiltros(Object.assign({},filtros,{montoMax:e.target.value}));}}/></div>
        <div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end"}}><Btn v="ghost" s="sm" onClick={function(){setFiltros({desde:"",hasta:"",agente:"todos",montoMin:"",montoMax:"",sucursal:"todos"});setFiltroTipo("todos");}}>Limpiar filtros</Btn></div>
      </div>}
      {!perfil.nombre&&<div className="notice notice-gold" style={{marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}><span>Configurá el perfil de tu inmobiliaria para agregar logo en los PDFs.</span><Btn v="ghost" s="sm" onClick={onPerfil} style={{color:"var(--gold)",flexShrink:0}}>⚙ Configurar</Btn></div>}
      {modoVista==="tabla" ? (
        <div className="op-table-wrap">
          {filtered.length===0?<div style={{padding:44,textAlign:"center",color:"var(--dim)",fontSize:13}}>No hay operaciones en esta vista.</div>:<table className="op-table"><thead><tr><th>Estado</th><th>Operación</th><th>Partes</th><th>Monto</th><th>Fecha</th><th>Agente</th><th></th></tr></thead><tbody>{filtered.map(function(op){return <tr key={op.id}><td><span className={"op-status-badge "+(op.estado||"borrador")}>{ESTADOS[op.estado]||"Borrador"}</span></td><td><div style={{fontWeight:700}}>{TIPO_ICON[op.tipo]} {TIPOS[op.tipo]||op.tipo}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>{op.inmueble_direccion||"Sin dirección"}</div></td><td>{getName(op)}</td><td style={{fontWeight:700,color:"var(--gold)"}}>{getMonto(op)||"—"}</td><td>{new Date(op.created_at).toLocaleDateString("es-AR")}</td><td>{op.broker_nombre||op.broker||"—"}</td><td><Btn v="secondary" s="sm" onClick={function(){onViewDoc(op);}}>Abrir</Btn></td></tr>;})}</tbody></table>}
        </div>
      ) : (
      <div className="op-list" style={{display:"flex",flexDirection:"column",gap:9}}>
        {filtered.length===0&&<div style={{padding:44,textAlign:"center",background:"var(--card)",border:"1px solid var(--border)",borderRadius:14}}><div style={{fontSize:38,marginBottom:10}}>📂</div><p style={{color:"var(--dim)",fontSize:13}}>{effectiveSearch?"Sin resultados para esa búsqueda.":"No hay operaciones en esta vista."}</p></div>}
        {filtered.map(function(op){
          const hijos=childrenMap[op.id]||[];
          if(hijos.length===0) return renderOpRow(op,false);
          const isOpen=!!openFolders[op.id];
          return (
            <div key={op.id} className="op-folder-wrap">
              {renderOpRow(op,false,{n:hijos.length+1,isOpen:isOpen,toggle:function(e){if(e&&e.stopPropagation)e.stopPropagation();setOpenFolders(function(st){return Object.assign({},st,{[op.id]:!st[op.id]});});}})}
              {isOpen&&<div className="op-folder-docs">{hijos.map(function(h){return renderOpRow(h,true);})}</div>}
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
      <Modal open={!!addDocFor} onClose={function(){setAddDocFor(null);}} title="Documentos de esta operación" wide={true} soft={true}>
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
                            {creado&&<span className="badge badge-activo" style={{fontSize:12}}>✓ Ya creado</span>}
                          </div>
                          <div style={{fontSize:12,color:"var(--dim)",marginBottom:6}}>{o.desc}</div>
                          {!creado&&(
                            <div style={{fontSize:12,lineHeight:1.6}}>
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
      <Modal open={!!historialOp} onClose={function(){setHistorialOp(null);}} title="Historial de acciones" wide={true} soft={true}>
        {historialOp&&(()=>{
          var hs=Array.isArray(historialOp.historial_operacion)?historialOp.historial_operacion.slice().reverse():[];
          return <div>
            <div style={{fontSize:12.5,color:"var(--dim)",marginBottom:14,lineHeight:1.5}}>Registro de cambios de esta operación. Se guarda automáticamente cuando se crea, edita o cambia su estado.</div>
            {hs.length===0?<div className="card" style={{padding:24,textAlign:"center",color:"var(--dim)",fontSize:12}}>Todavía no hay movimientos registrados.</div>:<div style={{display:"flex",flexDirection:"column",gap:7}}>{hs.map(function(h,i){return <div key={h.id||i} style={{display:"grid",gridTemplateColumns:"145px 1fr",gap:10,padding:"10px 11px",border:"1px solid var(--border)",borderRadius:10,background:"rgba(255,255,255,.015)"}}><div><div style={{fontSize:12,color:"var(--dim)"}}>{h.ts?new Date(h.ts).toLocaleString("es-AR"):"—"}</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{h.actorNombre||"Usuario"}{h.actorRol?" · "+h.actorRol:""}</div></div><div><div style={{fontSize:12.5,fontWeight:700,color:"var(--text)"}}>{h.accion||"Actualización"}</div>{h.detalle&&<div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{h.detalle}</div>}</div></div>;})}</div>}
          </div>;
        })()}
        <div style={{marginTop:18,paddingTop:16,borderTop:"1px solid var(--border)"}}>
          <div style={{fontSize:13,fontWeight:800,color:"var(--text)",marginBottom:4}}>Versiones recuperables del documento</div>
          <div style={{fontSize:12,color:"var(--dim)",lineHeight:1.5,marginBottom:10}}>Cada edición real guarda automáticamente la versión anterior en Supabase. Podés restaurarla; la versión actual también quedará conservada como una nueva versión.</div>
          {versionesLoading?<div style={{fontSize:12,color:"var(--dim)",padding:"10px 0"}}>Cargando versiones…</div>:versionesOp.length===0?<div style={{fontSize:12,color:"var(--dim)",padding:"10px 0"}}>Todavía no hay versiones anteriores guardadas.</div>:<div style={{display:"flex",flexDirection:"column",gap:7}}>{versionesOp.map(function(v){var snap=v.documento||{},sd=snap.datos||{};return <div key={v.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 11px",border:"1px solid var(--border)",borderRadius:10}}><div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>Versión {v.version} · {TIPOS[v.tipo_documento]||v.tipo_documento||"Documento"}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>{v.creado_en?new Date(v.creado_en).toLocaleString("es-AR"):"—"}{sd.inmueble_direccion?" · "+sd.inmueble_direccion:""}</div></div><Btn v="secondary" s="sm" onClick={function(){requestDwConfirm("¿Restaurar la versión "+v.version+"? La versión actual quedará guardada en el historial.",function(){onRestoreVersion(v);});}}>Restaurar</Btn></div>;})}</div>}
        </div>
      </Modal>
      <ConfirmModal
        open={!!confirmEliminarId}
        title="Eliminar operación"
        message="¿Deseás eliminar esta operación? Va a quedar en la papelera durante 30 días y podrás restaurarla antes de que se elimine definitivamente."
        confirmLabel="Eliminar y enviar a papelera"
        danger={true}
        onCancel={function(){setConfirmEliminarId(null);}}
        onConfirm={confirmarEliminacion}
      />
    </div>
  );

}
 return DashboardView;
}

export function crearEstadisticasView(deps){
 const {Btn, getComisionComponents, loadRecharts, useEffect, useState} = deps;

function EstadisticasView({operaciones,equipo,perfil,currentUserId,currentUserRole,onExportarCSV}){
  const [rechReady,setRechReady]=useState(typeof window !== "undefined" && !!window.Recharts);
  const [rechFailed,setRechFailed]=useState(false);
  const [periodoTab,setPeriodoTab]=useState("mensual");
  const [anioSel,setAnioSel]=useState(new Date().getFullYear());
  useEffect(function(){
    var cancelado=false;
    if(!rechReady){
      loadRecharts().then(function(){
        if(cancelado)return;
        if(typeof window !== "undefined" && window.Recharts){setRechReady(true);setRechFailed(false);}
        else setRechFailed(true);
      }).catch(function(){if(!cancelado)setRechFailed(true);});
    }
    return function(){cancelado=true;};
  },[rechReady]);

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
        <Btn v="secondary" s="sm" onClick={onExportarCSV}>⇩ Exportar operaciones + comisiones</Btn>
      </div>

      {/* Resumen global */}
      <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        {[{l:"Total operaciones",v:total,i:"📁"},{l:"Activas",v:operacionesVisibles.filter(function(o){return grupoRaiz(o).some(function(x){return x.estado==="activo";});}).length,i:"🟢"},{l:"Alquileres",v:operacionesVisibles.filter(function(o){return grupoRaiz(o).some(function(x){return x.tipo==="alquiler"||x.tipo==="reserva_alquiler";});}).length,i:"🏠"},{l:"Compraventas",v:operacionesVisibles.filter(function(o){return grupoRaiz(o).some(function(x){return x.tipo==="boleto"||x.tipo==="reserva";});}).length,i:"📄"}].map(function(s){
          return <div key={s.l} className="stat-card"><div className="stat-icon">{s.i}</div><div className="stat-val">{s.v}</div><div className="stat-lbl">{s.l}</div></div>;
        })}
      </div>

      {!esBroker && <div className="stats-money-row" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {[{l:"Total USD",v:"U$D "+usd.toLocaleString("es-AR"),i:"💵"},{l:"Total ARS",v:"$ "+ars.toLocaleString("es-AR"),i:"💴"},{l:"Canon/mes",v:"$ "+canon.toLocaleString("es-AR"),i:"🏘"}].map(function(s){
          return <div key={s.l} className="card" style={{padding:18}}><div style={{fontSize:18,marginBottom:6}}>{s.i}</div><div style={{fontFamily:"DM Serif Display,serif",fontSize:18,color:"var(--teal)",lineHeight:1.2,marginBottom:3}}>{s.v}</div><div style={{fontSize:12,color:"var(--dim)"}}>{s.l}</div></div>;
        })}
      </div>}

      <div className="card" style={{padding:18,marginBottom:20,borderRadius:16,borderColor:"rgba(212,168,83,.20)",background:"linear-gradient(135deg,rgba(212,168,83,.06),transparent)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:14}}>
          <div><div style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>💰 {esBroker?"Mis comisiones":"Comisiones y participación"}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>{esBroker?"Este mes · únicamente las operaciones asignadas a vos.":"Este mes · resumen de honorarios y distribución."}</div></div>
          <div style={{fontSize:12,color:"var(--gold)",fontWeight:700,padding:"6px 9px",borderRadius:20,background:"rgba(212,168,83,.10)"}}>{esBroker?"Mi participación "+splitBrokerPersonal+"%":"Asesor "+splitBroker+"% · Inmobiliaria "+(100-splitBroker)+"%"}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>
          {[{l:"Mis honorarios · USD",v:"U$D "+(esBroker?totalBrokerUsd:(totalBrokerUsd+totalInmoUsd)).toLocaleString("es-AR")},{l:"Mi participación · USD",v:"U$D "+totalBrokerUsd.toLocaleString("es-AR")},{l:"Mis honorarios · ARS",v:"$ "+(esBroker?totalBrokerArs:(totalBrokerArs+totalInmoArs)).toLocaleString("es-AR")},{l:"Mi participación · ARS",v:"$ "+totalBrokerArs.toLocaleString("es-AR")}].map(function(k){return <div key={k.l} style={{padding:"11px 12px",borderRadius:11,background:"rgba(255,255,255,.025)",border:"1px solid var(--border)"}}><div style={{fontSize:12,color:"var(--dim)",marginBottom:4}}>{k.l}</div><div style={{fontSize:16,fontWeight:800,color:"var(--text)"}}>{k.v}</div></div>})}
        </div>
      </div>

      {rankingActivo&&rankingInterno.length>0&&(!esBroker || currentUserId)&&(<div className="card" style={{padding:18,marginBottom:20,borderRadius:16,borderColor:"rgba(212,168,83,.22)",background:"linear-gradient(135deg,rgba(212,168,83,.07),transparent)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:14}}>
          <div><div style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>🏆 Ranking interno</div><div style={{fontSize:12,color:"var(--dim)",marginTop:3}}>Competencia interna de la inmobiliaria · año {now.getFullYear()}</div></div>
          <span style={{fontSize:12,fontWeight:700,color:"var(--gold)",padding:"5px 8px",borderRadius:20,background:"rgba(212,168,83,.10)",border:"1px solid rgba(212,168,83,.18)"}}>OPERACIONES + FACTURACIÓN</span>
        </div>
        <div style={{fontSize:12,color:"var(--dim)",marginBottom:10}}>El puesto se calcula con cantidad de operaciones y facturación. Los importes de facturación no se muestran.</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {rankingInterno.map(function(r){
            var soyYo=esBroker&&currentUserId===r.id;
            return <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,border:soyYo?"1px solid rgba(212,168,83,.35)":"1px solid var(--border)",background:soyYo?"rgba(212,168,83,.08)":"rgba(255,255,255,.02)"}}>
              <div style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:r.puesto<=3?"var(--gold)":"var(--muted)",background:"rgba(255,255,255,.04)",flexShrink:0}}>{r.puesto}</div>
              <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",background:"linear-gradient(135deg,var(--gold),var(--gold2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#0a0f1a",flexShrink:0}}>{r.foto?<img src={r.foto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(r.nombre[0]||"?").toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:750,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nombre}{soyYo?" · Vos":""}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>Facturación considerada en el ranking · importe oculto</div></div>
              <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>{r.operaciones}</div><div style={{fontSize:12,color:"var(--dim)"}}>operaciones</div></div>
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
      {rechFailed&&<div role="status" style={{padding:"10px 12px",marginBottom:14,border:"1px solid var(--border)",borderRadius:10,background:"var(--surface)",color:"var(--muted)",fontSize:12,lineHeight:1.5}}>No se pudieron cargar los gráficos. El resto de DocWorks sigue disponible; probá recargar esta pantalla cuando tengas conexión.</div>}
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
                    <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:12}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#94a3b8",fontSize:12}} axisLine={false} tickLine={false} allowDecimals={false}/>
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
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:12,color:"#94a3b8"}}/>
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
                        <div style={{fontSize:12,color:"var(--dim)"}}>{s.l}</div>
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
 return EstadisticasView;
}

export function crearCalendarioView(deps){
 const {finAlquilerISO, useState} = deps;


// ── CALENDARIO VIEW ───────────────────────────────────────────────────────────
function CalendarioView({operaciones,onViewOp}){
  var now=new Date();
  var [mesOffset,setMesOffset]=useState(0);
  var [filtro,setFiltro]=useState("todos");
  var [diaSeleccionado,setDiaSeleccionado]=useState("");

  var eventos=[];
  operaciones.forEach(function(op){
    var nombre=op.tipo==="alquiler"||op.tipo==="reserva_alquiler"
      ?(op.locatario_nombre||"Locatario")+" ← "+(op.locador_nombre||"Locador")
      :(op.comprador_nombre||"Comprador")+" ← "+(op.vendedor_nombre||"Vendedor");
    var base={nombre:nombre,direccion:op.inmueble_direccion||"",op:op};
    if(op.tipo==="alquiler"&&(op.alquiler_fin||op.alquiler_inicio)){
      var finFecha=finAlquilerISO(op);
      if(finFecha){
        var fin=new Date(finFecha+"T00:00:00"), diasRestantes=Math.ceil((fin.getTime()-now.getTime())/(86400000));
        eventos.push(Object.assign({},base,{id:op.id+"_fin",tipo:"vencimiento",fecha:finFecha,titulo:"Vencimiento de contrato",diasRestantes:diasRestantes,urgente:diasRestantes<=60&&diasRestantes>=0,color:diasRestantes<0?"#64748b":diasRestantes<=30?"#ef4444":diasRestantes<=60?"#f97316":"#2dd4bf"}));
        var alertaFecha=new Date(fin);alertaFecha.setDate(alertaFecha.getDate()-90);
        if(alertaFecha>=now){eventos.push(Object.assign({},base,{id:op.id+"_alerta",tipo:"renovacion",fecha:alertaFecha.toISOString().slice(0,10),titulo:"Renovación próxima",diasRestantes:diasRestantes,urgente:false,color:"#a78bfa"}));}
      }
    }
    if(op.tipo==="reserva"&&op.reserva_aceptacion_vencimiento){
      var vencA=new Date(op.reserva_aceptacion_vencimiento+"T23:59:59");
      var diasA=Math.ceil((vencA.getTime()-now.getTime())/86400000);
      eventos.push(Object.assign({},base,{id:op.id+"_aceptacion",tipo:"aceptacion",fecha:op.reserva_aceptacion_vencimiento,titulo:"Vencimiento de aceptación de reserva",diasRestantes:diasA,urgente:diasA<=2&&diasA>=0,color:diasA<0?"#64748b":diasA<=2?"#ef4444":"#d4a853"}));
    }
    if(op.tipo==="reserva"&&op.reserva_fecha_refuerzo){
      var diasRef=Math.ceil((new Date(op.reserva_fecha_refuerzo).getTime()-now.getTime())/86400000);
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
          var diasVR=Math.ceil((vencReserva.getTime()-now.getTime())/86400000);
          eventos.push(Object.assign({},base,{id:op.id+"_vencres",tipo:"vencimiento",fecha:vencReserva.toISOString().slice(0,10),titulo:"Vencimiento de reserva",diasRestantes:diasVR,urgente:diasVR<=5&&diasVR>=0,color:diasVR<0?"#64748b":diasVR<=5?"#ef4444":diasVR<=10?"#f97316":"#fb923c"}));
        }
      }
      if(op.res_alq_inicio_estimado){
        var dias2=Math.ceil((new Date(op.res_alq_inicio_estimado).getTime()-now.getTime())/86400000);
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

    <div className="calendar-summary-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,marginBottom:16}}>
      {[{n:urgentes.length,t:"Alertas",s:"Requieren atención",c:"#ef4444",i:"!"},{n:proximos.length,t:"Próximos 30 días",s:"Fechas a tener presentes",c:"var(--gold)",i:"30"},{n:eventosFiltrados.length,t:"Eventos",s:"Según el filtro actual",c:"var(--teal)",i:"✓"}].map(function(k){return <div key={k.t} className="card calendar-summary-card"><div className="calendar-summary-icon" style={{color:k.c}}>{k.i}</div><div className="calendar-summary-body"><div className="calendar-summary-number">{k.n}</div><div className="calendar-summary-title">{k.t}</div><div className="calendar-summary-description">{k.s}</div></div></div>})}
    </div>

    {(urgentes.length>0||proximos.length>0)&&<div style={{display:"grid",gridTemplateColumns:urgentes.length>0&&proximos.length>0?"1fr 1fr":"1fr",gap:12,marginBottom:16}}>
      {urgentes.length>0&&<div className="card" style={{padding:0,overflow:"hidden",borderColor:"rgba(239,68,68,.22)"}}><div style={{padding:"12px 14px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:800,color:"#ef4444",letterSpacing:".04em"}}>ALERTAS</span><span style={{fontSize:12,color:"var(--dim)"}}>{urgentes.length}</span></div>{urgentes.slice(0,4).map(function(e){return <div key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid var(--border)",cursor:"pointer"}}><div style={{width:7,height:7,borderRadius:"50%",background:e.color,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{e.titulo}</div><div style={{fontSize:12,color:"var(--muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.nombre}</div></div><strong style={{fontSize:12,color:e.color}}>{e.diasRestantes===0?"HOY":e.diasRestantes<0?"VENCIDO":e.diasRestantes+"d"}</strong></div>})}</div>}
      {proximos.length>0&&<div className="card" style={{padding:0,overflow:"hidden",borderColor:"rgba(212,168,83,.22)"}}><div style={{padding:"12px 14px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:800,color:"var(--gold)",letterSpacing:".04em"}}>PRÓXIMOS 30 DÍAS</span><span style={{fontSize:12,color:"var(--dim)"}}>Agenda</span></div>{proximos.slice(0,4).map(function(e){return <div key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid var(--border)",cursor:"pointer"}}><div style={{width:7,height:7,borderRadius:"50%",background:e.color,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{e.titulo}</div><div style={{fontSize:12,color:"var(--muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.nombre}</div></div><strong style={{fontSize:12,color:e.color}}>{e.diasRestantes===0?"Hoy":"En "+e.diasRestantes+"d"}</strong></div>})}</div>}
    </div>}

    <div className="card" style={{padding:14,marginBottom:14,borderRadius:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:12}}>
        <div><div style={{fontSize:15,fontWeight:800,color:"var(--text)"}}>{mesVer.toLocaleString("es-AR",{month:"long",year:"numeric"}).replace(/^./,function(c){return c.toUpperCase();})}</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>Seleccioná un evento para abrir la operación.</div></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><button onClick={function(){setMesOffset(function(m){return m-1;});}} className="btn btn-ghost" style={{width:32,height:32,padding:0}}>‹</button><button onClick={function(){setMesOffset(0);}} className="btn btn-ghost" style={{height:32,padding:"0 10px",fontSize:12}}>Hoy</button><button onClick={function(){setMesOffset(function(m){return m+1;});}} className="btn btn-ghost" style={{width:32,height:32,padding:0}}>›</button></div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{filtros.map(function(f){return <button key={f.v} onClick={function(){setFiltro(f.v);}} style={{padding:"6px 11px",borderRadius:20,border:"1px solid "+(filtro===f.v?"rgba(212,168,83,.5)":"var(--border)"),cursor:"pointer",fontSize:12,fontWeight:700,background:filtro===f.v?"rgba(212,168,83,.12)":"transparent",color:filtro===f.v?"var(--gold)":"var(--muted)"}}>{f.l}</button>})}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:5}}>{["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"].map(function(d){return <div key={d} style={{textAlign:"center",fontSize:12,fontWeight:800,color:"var(--dim)",padding:"5px 0",letterSpacing:".08em"}}>{d}</div>})}</div>
      <div className="dw-calendar-days" style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:5}}>{celdas.map(function(dia,i){if(!dia)return <div key={"e"+i} style={{minHeight:58}}/>;var evs=getEventosDia(dia),f=mesVer.getFullYear()+"-"+String(mesVer.getMonth()+1).padStart(2,"0")+"-"+String(dia).padStart(2,"0"),isHoy=f===hoyStr,selected=diaSeleccionado===f;return <button type="button" key={dia} onClick={function(){setDiaSeleccionado(f);}} aria-label={dia+" de "+mesVer.toLocaleString("es-AR",{month:"long"})+(evs.length?", "+evs.length+" eventos":""} aria-pressed={selected} style={{minWidth:0,minHeight:58,padding:"7px 3px",borderRadius:11,background:selected?"rgba(212,168,83,.17)":isHoy?"rgba(212,168,83,.08)":"var(--surface)",border:selected||isHoy?"1px solid var(--gold)":"1px solid var(--border)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,color:isHoy?"var(--gold)":"var(--muted)"}}><span style={{fontSize:12,fontWeight:800}}>{dia}</span>{evs.length>0&&<span style={{display:"flex",alignItems:"center",gap:3,justifyContent:"center",maxWidth:"100%"}}>{evs.slice(0,3).map(function(e){return <span key={e.id} style={{width:6,height:6,flexShrink:0,borderRadius:"50%",background:e.color}}/>)}{evs.length>3&&<span style={{fontSize:9}}>+{evs.length-3}</span>}</span>}</button>})}</div>
      {diaSeleccionado.startsWith(mesVer.getFullYear()+"-"+String(mesVer.getMonth()+1).padStart(2,"0")+"-")&&<div style={{marginTop:12,padding:"12px",border:"1px solid var(--border)",borderRadius:12,background:"var(--surface)"}}><div style={{fontWeight:800,fontSize:13,marginBottom:8,color:"var(--text)"}}>Eventos del {Number(diaSeleccionado.slice(-2))} de {mesVer.toLocaleString("es-AR",{month:"long"})}</div>{getEventosDia(Number(diaSeleccionado.slice(-2))).length===0?<div style={{fontSize:12,color:"var(--dim)"}}>No hay eventos para esta fecha.</div>:getEventosDia(Number(diaSeleccionado.slice(-2))).map(function(e){return <button type="button" key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 8px",marginTop:5,background:"transparent",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",cursor:"pointer"}}><span style={{fontWeight:750,fontSize:13,color:e.color}}>{e.titulo}</span><span style={{display:"block",fontSize:12,marginTop:4,color:"var(--muted)",overflowWrap:"anywhere"}}>{e.nombre}{e.direccion?" · "+e.direccion:""}</span></button>})}</div>}
    </div>

    <div className="card" style={{padding:0,overflow:"hidden",borderRadius:16}}>
      <div style={{padding:"13px 15px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:800,color:"var(--text)"}}>Agenda</div><div style={{fontSize:12,color:"var(--dim)",marginTop:2}}>Eventos ordenados por fecha</div></div><span style={{fontSize:12,fontWeight:700,color:"var(--muted)"}}>{eventosFiltrados.length} eventos</span></div>
      <div style={{maxHeight:360,overflowY:"auto"}}>{eventosFiltrados.length===0?<div style={{padding:30,textAlign:"center",color:"var(--dim)",fontSize:12}}>No hay eventos que coincidan con el filtro.</div>:eventosFiltrados.map(function(e){var esPasado=e.diasRestantes<0;return <div key={e.id} onClick={function(){if(e.op)onViewOp(e.op);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 15px",borderBottom:"1px solid var(--border)",cursor:"pointer"}}><div style={{width:9,height:9,borderRadius:"50%",background:colorEvento[e.tipo]||e.color,flexShrink:0}}/><div style={{width:78,flexShrink:0}}><div style={{fontSize:12,fontWeight:800,color:"var(--text)"}}>{new Date(e.fecha+"T12:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short"})}</div><div style={{fontSize:12,color:"var(--dim)"}}>{new Date(e.fecha+"T12:00:00").getFullYear()}</div></div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{e.titulo}</div><div style={{fontSize:12,color:"var(--muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.nombre}{e.direccion?" · "+e.direccion:""}</div></div><div style={{fontSize:12,fontWeight:800,color:esPasado?"var(--dim)":e.color,whiteSpace:"nowrap"}}>{esPasado?"Vencido":e.diasRestantes===0?"Hoy":"En "+e.diasRestantes+"d"}</div></div>})}</div>
    </div>
  </div>);
}
 return CalendarioView;
}

export function crearDocumentViewer(deps){
 const {ALIASES_TOKEN_OBLIGATORIO, BODY_TEMPLATE_PRESETS, ConfirmModal, DocSummaryPanel, DocTabsBar, FichaOperacionPanel, NegociacionPanel, ReservaCompactSummary, ReservaDecisionPanel, TIPOS, TareasPanel, aplicarEncabezadoPersonalizado, buildDocSections, buildReciboSections, campoDesdeTextoFaltante, campoPrincipalErrorExport, capRol, contactosDocumento, copiarAlPortapapeles, cuerpoTrasRotulo, descargarArchivo, dwNotify, entregarArchivo, fmt$, generarDOCX, generarPDF, getBodyBlocksConfig, getBodyBlocksForDocument, getComisionComponents, getDocTabs, labelTokenObligatorio, normalizarBodyBlock, normalizarTextoDocumento, opParaDocumento, prefijoClausulaDesdeNumTitulo, prefijoClausulaFormal, resaltarFaltantes, resolveVars, revisarDocumentoIA, rolParte, tipoIdentificacion, traducirError, useEffect, useRef, useState, validarDocumentoParaExport} = deps;


function DocumentViewer({op,clausulas,perfil,operaciones,bloquesReserva,onToggleTarea,onUpdateOperation,onActionWorkflow,onCompleteData,onSavePerfil,onAuditExport,onUpdateBloqueReserva,tab,onChangeTab,autoAction,onAutoActionDone}){
  var docTabs=getDocTabs(op);
  var TABS=docTabs.TABS, TAB_RESUMEN=docTabs.TAB_RESUMEN, TABS_ALL=docTabs.TABS_ALL;

  function setTab(id){ onChangeTab(id); }
  const [busy,setBusy]=useState({pdf:false,docx:false,share:false});
  const [err,setErr]=useState("");
  const [lastAction,setLastAction]=useState(null); // "pdf" | "docx" | "share"
  const [lastPdf,setLastPdf]=useState(null); // {blob, filename}
  const [lastDocx,setLastDocx]=useState(null); // {blob, filename}
  // Las referencias de caché se descartan cuando cambia el documento, la operación
  // o el perfil de salida; compartir además regenera siempre el PDF.
  const cacheKeyRef=useRef("");
  useEffect(function(){
    var key=String(op&&op.id||"")+"|"+String(tab&&tab.id||tab||"")+"|"+
      JSON.stringify(op||{})+"|"+String(perfil&&perfil.logoDataUrl||"")+"|"+
      String(perfil&&perfil.plantillaEstilo||"")+"|"+String(perfil&&perfil.colorPrimario||"");
    if(cacheKeyRef.current && cacheKeyRef.current!==key){setLastPdf(null);setLastDocx(null);}
    cacheKeyRef.current=key;
  },[op,tab,perfil&&perfil.logoDataUrl,perfil&&perfil.plantillaEstilo,perfil&&perfil.colorPrimario]);
  const [pendingWarnings,setPendingWarnings]=useState(null); // {errors, avisos, fn, doc} | null
  const [pendingFinalConfirm,setPendingFinalConfirm]=useState(null); // {fn,doc} | null
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
      return aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(Object.assign({},op,{inmobiliaria_nombre:(perfil&&perfil.nombre)||op.inmobiliaria_nombre,inmobiliaria_matricula:(perfil&&perfil.matricula)||op.inmobiliaria_matricula,inmobiliaria_domicilio:(perfil&&perfil.direccion)||op.inmobiliaria_domicilio,inmobiliaria_email:(perfil&&perfil.email)||op.inmobiliaria_email,inmobiliaria_telefono:(perfil&&perfil.telefono)||op.inmobiliaria_telefono})), clausulas, resumenTipo, cuerpoResumen), op, resumenTipo, perfil);
    }
    if(tabActual.esRecibo) return buildReciboSections(opParaDocumento(Object.assign({},op,{inmobiliaria_nombre:(perfil&&perfil.nombre)||op.inmobiliaria_nombre,inmobiliaria_matricula:(perfil&&perfil.matricula)||op.inmobiliaria_matricula,inmobiliaria_domicilio:(perfil&&perfil.direccion)||op.inmobiliaria_domicilio,inmobiliaria_email:(perfil&&perfil.email)||op.inmobiliaria_email,inmobiliaria_telefono:(perfil&&perfil.telefono)||op.inmobiliaria_telefono})), perfil, tabActual.dest);
    var cuerpo = getBodyBlocksForDocument(perfil, tab, bloquesReserva);
    return aplicarEncabezadoPersonalizado(buildDocSections(opParaDocumento(Object.assign({},op,{inmobiliaria_nombre:(perfil&&perfil.nombre)||op.inmobiliaria_nombre,inmobiliaria_matricula:(perfil&&perfil.matricula)||op.inmobiliaria_matricula,inmobiliaria_domicilio:(perfil&&perfil.direccion)||op.inmobiliaria_domicilio,inmobiliaria_email:(perfil&&perfil.email)||op.inmobiliaria_email,inmobiliaria_telefono:(perfil&&perfil.telefono)||op.inmobiliaria_telefono})), clausulas, tab, cuerpo), op, tab, perfil);
  }

  useEffect(function(){ setAiReview(null); }, [op&&op.id]);

  // Reutilizar la misma generación entre precarga y descarga: antes cada toque
  // regeneraba ambos archivos aunque ya estuvieran listos. La clave incluye el
  // contenido y el perfil para no servir un documento desactualizado.
  const exportPromisesRef=useRef({key:"",pdf:null,docx:null});
  const colaExportacionRef=useRef(Promise.resolve());
  function exportacionCompartida(formato,doc){
    // La clave debe contemplar TODO el perfil: estilos, márgenes, encabezados,
    // firmas y futuras opciones de exportación. Si solo se enumeran algunas
    // propiedades, un cambio visual puede devolver un PDF/Word anterior.
    var key=JSON.stringify([doc,perfil]);
    var cache=exportPromisesRef.current;
    if(cache.key!==key){cache={key:key,pdf:null,docx:null};exportPromisesRef.current=cache;}
    if(!cache[formato]){
      // Serializar los trabajos pesados: si se solicitan PDF y Word casi al
      // mismo tiempo, no deben competir por el hilo principal del navegador.
      var tarea=colaExportacionRef.current.catch(function(){ /* liberar cola tras error */ }).then(function(){
        return formato==="pdf"?generarPDF(doc,perfil.logoDataUrl||null,perfil):generarDOCX(doc,perfil);
      });
      colaExportacionRef.current=tarea.then(function(){},function(){});
      var promesa=tarea.catch(function(err){
        if(cache[formato]===promesa)cache[formato]=null;
        throw err;
      });
      cache[formato]=promesa;
    }
    return cache[formato];
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
    if(tabActual.esResumen || tabActual.esFicha || tabActual.esTareas || tabActual.esNegociacion) return;
    var cancelado=false,docActual=getDoc();
    // Si cambió el documento, el archivo anterior ya no sirve: se descarta para no entregar el de otro.
    setLastPdf(null); setLastDocx(null);
    exportacionCompartida("pdf",docActual).then(function(r){ if(!cancelado) setLastPdf(r); }).catch(function(err){ if(!cancelado) setErr(err&&err.message?err.message:"No se pudo preparar el PDF."); });
    // No generar Word y PDF en paralelo al abrir el visor: ambos son trabajos
    // intensivos en el hilo principal y pueden congelar Safari/iPhone.
    // Word se genera a demanda y se reutiliza si el usuario vuelve a descargarlo.
    return function(){ cancelado=true; };
    // eslint-disable-next-line
  }, [tab, op, perfil, clausulas, bloquesReserva]);

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
  // ilógicas, tokens {{...}} sin resolver). Los errores bloquean la exportación;
  // las advertencias no críticas requieren revisión explícita antes de continuar.
  function registrarAuditoriaFaltantes(pw,formato){
    if(!pw||!pw.errors||!pw.errors.length||typeof onAuditExport!=="function") return;
    var entrada={accion:"exportar_con_faltantes",operacion_id:op&&op.id||null,tipo:op&&op.tipo||null,formato:formato||"PDF",datos_faltantes:Array.from(new Set((pw.errors||[]).concat((pw.datosFaltantesDetalle||[]).map(function(x){return x.mensaje||x.label||x.token||String(x);})))),errores:(pw.errors||[]).slice(),usuario_id:null};
    try{Promise.resolve(onAuditExport(entrada)).catch(function(err){console.warn("DocWorks: falló el registro de auditoría de exportación",err);});}catch(_e){console.warn("DocWorks: no se pudo iniciar la auditoría de exportación",_e);}
  }
  function formatoDeFuncion(fn){if(fn===handleDOCX)return "Word";if(fn===handleShareWhatsApp)return "WhatsApp";if(fn===handlePDF)return "PDF";return "TXT";}
  function conValidacion(fn){var doc=getDoc(),validacion=validarDocumentoParaExport(op,doc,perfil);
    if(validacion.errores.length){setPendingWarnings({errors:validacion.errores,avisos:validacion.avisos,datosFaltantes:validacion.datosFaltantes||[],datosSinCargar:validacion.datosSinCargar||[],datosFaltantesDetalle:validacion.datosFaltantesDetalle||[],tokensObligatoriosNoResueltos:validacion.tokensObligatoriosNoResueltos||[],fn:fn,doc:doc,action:fn===handleShareWhatsApp?"share":"export",formato:formatoDeFuncion(fn)});return;}
    if(validacion.avisos.length){setPendingWarnings({errors:[],avisos:validacion.avisos,fn:fn,doc:doc,action:fn===handleShareWhatsApp?"share":"export",formato:formatoDeFuncion(fn)});return;}
    setPendingFinalConfirm({fn:fn,doc:doc});}
  function resumenFinal(){var partes=[];if(op.tipo==="alquiler"||op.tipo==="reserva_alquiler"){if(op.locador_nombre)partes.push(capRol(rolParte(op.tipo,0))+": "+op.locador_nombre);if(op.locatario_nombre)partes.push(capRol(rolParte(op.tipo,1))+": "+op.locatario_nombre);}else{if(op.comprador_nombre)partes.push(capRol(rolParte(op.tipo,1))+": "+op.comprador_nombre);if(op.vendedor_nombre)partes.push(capRol(rolParte(op.tipo,0))+": "+op.vendedor_nombre);}var precio=op.tipo==="alquiler"?fmt$(op.alquiler_monto_inicial,op.alquiler_moneda)+" / mes":op.tipo==="reserva_alquiler"?fmt$(op.res_alq_monto_mensual,op.res_alq_monto_mensual_moneda||op.res_alq_moneda||"ARS")+" / mes":fmt$(op.precio,op.moneda);var items=getComisionComponents(op)||[],com=[];["USD","ARS"].forEach(function(mon){var total=items.filter(function(i){return (i.moneda||"ARS")==mon;}).reduce(function(a,i){return a+(parseFloat(i.monto)||0);},0);if(total)com.push(fmt$(total,mon));});return {precio:precio,partes:partes,comision:com.length?com.join(" · "):"Sin comisión cargada"};}

  const descargaEnCursoRef=useRef({pdf:false,docx:false});
  async function handlePDF(docOverride=undefined){
    if(descargaEnCursoRef.current.pdf)return;
    descargaEnCursoRef.current.pdf=true;
    setBusy(function(b){return Object.assign({},b,{pdf:true});});setErr("");setLastAction("pdf");
    try{
      var result = await exportacionCompartida("pdf",docOverride || getDoc());
      setLastPdf(result);
      await descargarArchivo(result.blob, result.filename, "application/pdf", {title:tabActual.label, text:tabActual.label+" — "+(op.inmueble_direccion||"Operación inmobiliaria")});
    }catch(e){
      if(!(e&&e.name==="AbortError"))setErr(e&&e.message?e.message:"Error al generar el PDF.");
    }finally{
      descargaEnCursoRef.current.pdf=false;
      setLastAction(null);
      setBusy(function(b){return Object.assign({},b,{pdf:false});});
    }
  }

  async function handleDOCX(docOverride=undefined){
    if(descargaEnCursoRef.current.docx)return;
    descargaEnCursoRef.current.docx=true;
    setBusy(function(b){return Object.assign({},b,{docx:true});});setErr("");setLastAction("docx");
    try{
      var result = await exportacionCompartida("docx",docOverride || getDoc());
      setLastDocx(result);
      await descargarArchivo(result.blob, result.filename, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", {title:tabActual.label, text:tabActual.label+" — "+(op.inmueble_direccion||"Operación inmobiliaria")});
    }catch(e){
      if(!(e&&e.name==="AbortError"))setErr(e&&e.message?e.message:"Error al generar el documento Word.");
    }finally{
      descargaEnCursoRef.current.docx=false;
      setLastAction(null);
      setBusy(function(b){return Object.assign({},b,{docx:false});});
    }
  }

  async function handleShareWhatsApp(docOverride=undefined){
    setErr("");setLastAction("share");
    setBusy(function(b){return Object.assign({},b,{share:true});});
    try{
      // Reutilizar la exportación vigente. La clave de caché incluye documento
      // y perfil, por lo que cualquier cambio invalida el archivo anterior.
      var pdfData = await exportacionCompartida("pdf",docOverride || getDoc());
      setLastPdf(pdfData);
      var txt = tabActual.label+" — "+(op.inmueble_direccion||"Operación inmobiliaria");
      var entrega = await entregarArchivo(pdfData.blob, pdfData.filename, "application/pdf", {title:tabActual.label, text:txt});
      if(entrega==="downloaded-whatsapp"){
        dwNotify("success","WhatsApp Web quedó abierto para continuar el envío.");
      }
      setLastAction(null);
    } catch(e){
      if(e && e.name==="AbortError"){ /* usuario canceló el share, no es error */ }
      else { setErr((e&&e.message?e.message:"No se pudo compartir el documento.")+" En iPhone, probá Compartir y luego Guardar en Archivos; después podés adjuntarlo desde WhatsApp."); }
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
    if(doc.encabezado){ doc.encabezado.split("\n\n").forEach(function(p){ if(String(p||"").trim()){ b.push({t:p,justify:true}); b.push({blank:true}); } }); }
    if(!doc.ocultarPartesEnCuerpo && doc.partes && doc.partes.length){
      b.push({t:"PARTES INTERVINIENTES",bold:true,label:true});
      var rolesContactosImpresos={};
      doc.partes.forEach(function(p){
        b.push({t:normalizarTextoDocumento((p.rol||"").toUpperCase()+": "+(p.nombre||"—")),bold:true});
        if(p.dni) b.push({t:normalizarTextoDocumento(tipoIdentificacion(p.dni,p)+": "+p.dni),dim:true,indent:true});
        if(p.domicilio) b.push({t:normalizarTextoDocumento("Domicilio: "+p.domicilio),dim:true,indent:true});
        if(p.telefono) b.push({t:normalizarTextoDocumento("Teléfono: "+p.telefono),dim:true,indent:true});
        if(p.email) b.push({t:normalizarTextoDocumento("Correo: "+p.email),dim:true,indent:true});
        var rolContacto=String(p.rol||"").toUpperCase();
        if(!rolesContactosImpresos[rolContacto]){
          rolesContactosImpresos[rolContacto]=true;
          (doc.contactosIndividuales||[]).filter(function(c){return c.rol===rolContacto;}).forEach(function(c){
            b.push({t:normalizarTextoDocumento(c.nombre+(c.telefono?" — Tel.: "+c.telefono:"")+(c.email?" — Correo: "+c.email:"")),dim:true,indent:true});
          });
        }
        b.push({blank:true});
      });
      b.push({sep:true});
    } else if(contactosDocumento(doc).length){
      b.push({t:"DATOS DE CONTACTO",bold:true,label:true});
      contactosDocumento(doc).forEach(function(l){ b.push({t:normalizarTextoDocumento(l),dim:true,indent:true}); });
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
      b.push({t:(doc.conformidad.rol||"VENDEDOR"),bold:true,center:true});
      b.push({t:(doc.conformidad.firmante||"")+(doc.conformidad.dni?" — "+doc.conformidad.dni:""),bold:true,center:true});
    }
    return b;
  }

  return(
    <div className="doc-viewer-shell">
      <div className="doc-viewer-tabs"><DocTabsBar op={op} tab={tab} onChange={setTab}/></div>
      <div className={(tabActual.esResumen||tabActual.esFicha||tabActual.esTareas||tabActual.esNegociacion)?"doc-viewer-tab-content doc-tab-static":"doc-viewer-tab-content"}>
      {tabActual.esTareas ? (
        <TareasPanel op={op} onToggleTarea={onToggleTarea} onUpdateOperation={onUpdateOperation}/>
      ) : tabActual.esFicha ? (
        <FichaOperacionPanel op={op} operaciones={operaciones||[]} embedded={true}/>
      ) : tabActual.esNegociacion ? (
        <><ReservaDecisionPanel op={op} onUpdate={onUpdateOperation} onAction={onActionWorkflow}/><NegociacionPanel op={op} onUpdate={onUpdateOperation}/></>
      ) : tabActual.esResumen ? (
        <DocSummaryPanel op={op} perfil={perfil} tabsDocs={TABS} onLeer={changeTab} operaciones={operaciones} onToggleTarea={onToggleTarea} onUpdateOperation={onUpdateOperation} onActionWorkflow={onActionWorkflow} onRevisionIA={ejecutarRevisionIA} aiReview={aiReview} onCopiarRevisionIA={copiarRevisionIA}/>
      ) : (
      <>
        {tabActual.id==="reserva"&&<ReservaCompactSummary op={op} operaciones={operaciones}/>}
        {err&&<div style={{padding:"9px 12px",borderRadius:8,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",color:"var(--red)",fontSize:12.5,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flex:"0 0 auto"}}>
          <span>{err}</span>
          {lastAction&&<button onClick={function(){
            if(lastAction==="pdf")handlePDF();
            else if(lastAction==="docx")handleDOCX();
            else if(lastAction==="share")handleShareWhatsApp();
          }} style={{flexShrink:0,padding:"4px 10px",borderRadius:6,border:"1px solid rgba(248,113,113,0.35)",background:"rgba(248,113,113,0.12)",color:"var(--red)",fontSize:12,fontWeight:600,cursor:"pointer"}}>↻ Reintentar</button>}
        </div>}
        {!perfil.nombre&&<div className="notice notice-amber" style={{marginBottom:12,flex:"0 0 auto"}}>Tip: configurá el perfil para agregar logo y nombre en los documentos.</div>}
        <div className="doc-reading-scroll">
          <div className="pdf-preview" style={{marginBottom:14}}>
            <div className="pdf-chrome">
              <div className="pdf-dot" style={{background:"#ff5f57"}}/><div className="pdf-dot" style={{background:"#ffbd2e"}}/><div className="pdf-dot" style={{background:"#28c840"}}/>
              <span style={{fontSize:12,color:"var(--dim)",marginLeft:7,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tabActual.icon} {tabActual.label}{tabActual.id&&TIPOS[tabActual.id]?" — "+TIPOS[tabActual.id]:""}</span>
              {tabActual.esRecibo&&<span style={{marginLeft:"auto",fontSize:12,padding:"2px 8px",borderRadius:10,background:"rgba(74,222,128,0.1)",color:"var(--green)",border:"1px solid rgba(74,222,128,0.2)"}}>Recibo de honorarios</span>}
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
                        <span>{resaltarFaltantes(normalizarTextoDocumento(bl.t),function(){var campo=campoDesdeTextoFaltante(bl.t,op);if(onCompleteData)onCompleteData(op,campo);})}</span>
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
                    }}>{resaltarFaltantes(normalizarTextoDocumento(bl.t||""),function(){var campo=campoDesdeTextoFaltante(bl.t,op);if(onCompleteData)onCompleteData(op,campo);})}</div>
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
        title={pendingWarnings&&pendingWarnings.errors&&pendingWarnings.errors.length ? "Borrador: faltan datos en el documento" : "Revisá las advertencias"}
        message={pendingWarnings&&<span>
          {pendingWarnings.errors&&pendingWarnings.errors.length>0&&<><div style={{fontSize:12.5,color:"var(--red)",marginBottom:4,fontWeight:700}}>Al documento le faltan estos datos:</div><div style={{fontSize:12,color:"var(--dim)",marginBottom:8}}>Podés completarlos ahora o continuar igual: en ese caso el documento puede salir con campos vacíos o información legal incompleta.</div><ul style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:5}}>{pendingWarnings.errors.map(function(w,i){return <li key={i} style={{fontSize:13}}>{w}</li>;})}</ul></>}
          {pendingWarnings.avisos&&pendingWarnings.avisos.length>0&&<><div style={{fontSize:12.5,color:"var(--gold)",margin:"12px 0 8px",fontWeight:700}}>Avisos:</div><ul style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:5}}>{pendingWarnings.avisos.map(function(w,i){return <li key={i} style={{fontSize:13}}>{w}</li>;})}</ul></>}
          {pendingWarnings.datosFaltantes&&pendingWarnings.datosFaltantes.length>0&&<div style={{marginTop:12}}>
            <button type="button" className="btn btn-primary" onClick={function(){
              var pw=pendingWarnings, tipo=op.tipo, faltantes=pw.datosFaltantes||[], presets=BODY_TEMPLATE_PRESETS[tipo]||[], aliases=ALIASES_TOKEN_OBLIGATORIO||{};
              if(tipo==="reserva"){
                // Restaurar el contenido de cláusulas de Reserva existentes cuando el RPC
                // disponible lo permite. No hay API de alta ni parámetro persistente activo.
                var docReserva=Object.assign({},pw.doc||{}), extraReserva=[], updatesReserva=[];
                presets.forEach(function(plant){
                  var tokensPlantilla=faltantes.filter(function(token){return [token].concat(aliases[token]||[]).some(function(t){return new RegExp("\\{\\{\\s*"+t+"\\s*\\}\\}").test(String(plant.contenido||""));});});
                  if(!tokensPlantilla.length)return;
                  var textoPlantilla=resolveVars(plant.contenido,op);if(!textoPlantilla||textoPlantilla.indexOf("{{")>=0)return;
                  extraReserva.push({titulo:plant.titulo||labelTokenObligatorio(tokensPlantilla[0]),items:[textoPlantilla]});
                  var existenteReserva=(bloquesReserva||[]).find(function(b){return b.id===plant.id;});
                  var tieneToken=existenteReserva&&tokensPlantilla.some(function(token){return [token].concat(aliases[token]||[]).some(function(t){return new RegExp("\\{\\{\\s*"+t+"\\s*\\}\\}").test(String(existenteReserva.contenido||""));});});
                  if(existenteReserva&&(!tieneToken||existenteReserva.activo===false)&&typeof onUpdateBloqueReserva==="function"){
                    updatesReserva.push(Promise.resolve(onUpdateBloqueReserva(existenteReserva.id,{titulo:plant.titulo||existenteReserva.titulo,contenido:plant.contenido,activo:true})).catch(function(){return {error:true};}));
                  }
                });
                if(!extraReserva.length){dwNotify("warning","No se encontraron cláusulas de fábrica compatibles con los datos faltantes de Reserva.");return;}
                Promise.all(updatesReserva).then(function(resultados){
                  docReserva.secciones=(docReserva.secciones||[]).concat(extraReserva);setPendingWarnings(null);
                  var fallaron=resultados.some(function(r){return r&&r.error;});
                  dwNotify(fallaron?"warning":"info",fallaron?"Las cláusulas se agregaron a esta exportación, pero no se pudo guardar todo el contenido de Reserva.":"Las cláusulas se agregaron a esta exportación y se restauró el contenido de las cláusulas existentes cuando fue posible. El API de Reserva no permite crear cláusulas nuevas ni persistir el estado activo.");
                  if(pw.fn)pw.fn(docReserva);
                });return;
              }
              var clausulasActuales=getBodyBlocksConfig(perfil,tipo).map(function(b){return Object.assign({},b);}), agregadas=[], reactivadas=[], presetsProcesados={};
              faltantes.forEach(function(token){
                var candidatos=[token].concat(aliases[token]||[]);
                var plantilla=presets.find(function(c){return candidatos.some(function(t){return new RegExp("\\{\\{\\s*"+t+"\\s*\\}\\}").test(String(c.contenido||""));});});
                if(!plantilla||presetsProcesados[plantilla.id])return;
                var existente=clausulasActuales.find(function(b){return b.id===plantilla.id;});
                if(existente&&existente.activo===false&&candidatos.some(function(t){return new RegExp("\\{\\{\\s*"+t+"\\s*\\}\\}").test(String(existente.contenido||""));})){existente.activo=true;reactivadas.push(existente);presetsProcesados[plantilla.id]=true;return;}
                var nuevo=normalizarBodyBlock(Object.assign({},plantilla,{id:existente?String(plantilla.id)+".auto."+String(token):plantilla.id,activo:true,orden:clausulasActuales.length+1}),clausulasActuales.length);
                var posPreset=presets.findIndex(function(x){return x.id===plantilla.id;}), posInsercion=-1;
                for(var pi=posPreset+1;pi<presets.length;pi++){var siguiente= clausulasActuales.findIndex(function(b){return b.id===presets[pi].id;});if(siguiente>=0){posInsercion=siguiente;break;}}
                if(posInsercion<0){for(var pj=posPreset-1;pj>=0;pj--){var anteriorPreset=clausulasActuales.findIndex(function(b){return b.id===presets[pj].id;});if(anteriorPreset>=0){posInsercion=anteriorPreset+1;break;}}}
                if(posInsercion<0)posInsercion=clausulasActuales.length;
                clausulasActuales.splice(posInsercion,0,nuevo);agregadas.push(nuevo);presetsProcesados[plantilla.id]=true;
              });
              if(!agregadas.length&&!reactivadas.length){dwNotify("warning","No se encontraron cláusulas de fábrica que puedan cubrir los datos faltantes. Revisá los tokens señalados.");return;}
              var mapa=Object.assign({},perfil.plantillas||{}),actual=Object.assign({},mapa[tipo]||{},{body_blocks:clausulasActuales.map(function(b,i){return normalizarBodyBlock(Object.assign({},b,{orden:i+1}),i);})});
              var perfilNuevo=Object.assign({},perfil,{plantillas:Object.assign({},mapa,(function(){var x={};x[tipo]=actual;return x;})())});
              if(typeof onSavePerfil!=="function"){dwNotify("error","No está disponible el guardado de la plantilla. No se exportó una versión temporal como si estuviera guardada.");return;}
              Promise.resolve(onSavePerfil(perfilNuevo)).then(function(res){if(res&&res.error){dwNotify("error","No se pudo guardar la plantilla; no se ejecutó la exportación automática.");return;}
                var opDoc=opParaDocumento(Object.assign({},op,{inmobiliaria_nombre:(perfilNuevo&&perfilNuevo.nombre)||op.inmobiliaria_nombre,inmobiliaria_matricula:(perfilNuevo&&perfilNuevo.matricula)||op.inmobiliaria_matricula,inmobiliaria_domicilio:(perfilNuevo&&perfilNuevo.direccion)||op.inmobiliaria_domicilio,inmobiliaria_email:(perfilNuevo&&perfilNuevo.email)||op.inmobiliaria_email,inmobiliaria_telefono:(perfilNuevo&&perfilNuevo.telefono)||op.inmobiliaria_telefono}));
                var docNuevo=aplicarEncabezadoPersonalizado(buildDocSections(opDoc,clausulas,tipo,actual.body_blocks),op,tipo,perfilNuevo);
                setPendingWarnings(null);dwNotify("success","La plantilla se guardó y el documento se regeneró con las cláusulas correspondientes.");if(pw.fn)pw.fn(docNuevo);
              }).catch(function(){dwNotify("error","No se pudo guardar la plantilla; no se ejecutó la exportación automática.");});
            }} style={{marginTop:4}}>Agregar cláusulas automáticamente</button>
            <div style={{fontSize:11,color:"var(--dim)",marginTop:5}}>En los documentos con plantilla de perfil, se guardan las cláusulas y se regenera el documento. Reserva depende de una API de Supabase que hoy no permite crear ni reactivar cláusulas.</div>
          </div>}
        </span>}
        confirmLabel={pendingWarnings&&pendingWarnings.errors&&pendingWarnings.errors.length ? "Exportar borrador" : "Continuar"}
        secondaryLabel={pendingWarnings&&pendingWarnings.errors&&pendingWarnings.errors.length ? "Completar datos" : null}
        secondaryDisabled={false}
        onSecondary={function(){
          var pw=pendingWarnings;setPendingWarnings(null);
          if(pw){
            var campo2=campoPrincipalErrorExport(op,perfil,pw.errors||[]);
            if(onCompleteData) onCompleteData(op,campo2);
            else dwNotify("info","Abrí la edición del documento para completar los datos.");
          }
        }}
        danger={false}
        onCancel={function(){setPendingWarnings(null);}}
        onConfirm={function(){
          var pw=pendingWarnings;setPendingWarnings(null);
          if(pw&&pw.errors&&pw.errors.length){
            if(pw.fn){ registrarAuditoriaFaltantes(pw,pw.formato||formatoDeFuncion(pw.fn)); dwNotify("info",pw.action==="share"?"Se comparte como borrador: los datos faltantes quedan en blanco (___).":"Se genera como borrador: los datos faltantes quedan en blanco (___). Podés completarlos y volver a exportar."); pw.fn(pw.doc); }
            return;
          }
          if(pw&&pw.fn)setPendingFinalConfirm({fn:pw.fn,doc:pw.doc});
        }}
      />      <ConfirmModal open={!!pendingFinalConfirm} title="Revisá los datos críticos antes de generar" message={pendingFinalConfirm?(function(){var r=resumenFinal();return <div><div style={{padding:"10px 11px",borderRadius:10,background:"var(--surface2)",border:"1px solid var(--border)",marginBottom:8}}><div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Precio / canon</div><div style={{fontSize:15,fontWeight:800,color:"var(--text)"}}>{r.precio}</div></div><div style={{padding:"10px 11px",borderRadius:10,background:"var(--surface2)",border:"1px solid var(--border)",marginBottom:8}}><div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Partes</div>{r.partes.length?r.partes.map(function(x,i){return <div key={i} style={{fontSize:12.5,fontWeight:650,color:"var(--text)"}}>{x}</div>}):<div style={{fontSize:12,color:"var(--red)"}}>Sin partes cargadas</div>}</div><div style={{padding:"10px 11px",borderRadius:10,background:"var(--surface2)",border:"1px solid var(--border)"}}><div style={{fontSize:12,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Comisión</div><div style={{fontSize:13,fontWeight:750,color:"var(--text)"}}>{r.comision}</div></div></div>})():""} confirmLabel="Generar documento final" danger={false} onCancel={function(){setPendingFinalConfirm(null);}} onConfirm={function(){var fn=pendingFinalConfirm&&pendingFinalConfirm.fn,docConfirm=pendingFinalConfirm&&pendingFinalConfirm.doc;setPendingFinalConfirm(null);if(fn)fn(docConfirm);}}
      />
    </div>
  );
}
 return DocumentViewer;
}

export function crearOperacionForm(deps){
 const {AutosaveIndicator, Btn, EMPTY_OP, PasoResumenFinal, StepBar, StepClausulas, StepCondicionesAlquiler, StepCondicionesReservaAlq, StepDocSimple, StepEconomicoCompra, StepGarantia, StepGrupo, StepInmobiliariaAutorizada, StepInmueble, StepPersona, StepTipo, TIPO_GRUPOS, clausulaAplicaTipo, draftTieneContenido, fmt$, getCamposFaltantesDetalle, getPasoDeCampo, limpiarComisionesIncompatibles, lsSet, obtenerPlantillaConfig, rolParte, useAutosave, useCallback, useEffect, useMemo, useRef, useState} = deps;


function OperacionForm({initial,clausulas,perfil,equipo,operaciones,onSave,onCancel,onTipoChange,saveStatus,reportSave,onAddClausula,focusCampo}){
  const [grupo,setGrupo]=useState(initial ? (
    ["reserva","boleto"].includes(initial.tipo)?"compra":
    ["alquiler","reserva_alquiler"].includes(initial.tipo)?"alquiler":
    ["refuerzo_reserva","devolucion_reserva","comodato","exclusividad"].includes(initial.tipo)?"otros":null
  ) : null);
  const [step,setStep]=useState(1);
  const [data,setData]=useState(initial ? limpiarComisionesIncompatibles(initial) : EMPTY_OP);
  useEffect(function(){
    if(initial&&focusCampo) setStep(getPasoDeCampo(focusCampo,initial.tipo));
  },[initial,focusCampo]);

  // Cada vez que se entra a editar un documento, arrancamos siempre en
  // la sección de TIPO (2. TIPO), aunque el formulario haya quedado
  // anteriormente en otro paso.
  useEffect(function(){
    if(initial){
      setStep(focusCampo ? getPasoDeCampo(focusCampo,initial.tipo) : 2);
      setGrupo(
        ["reserva","boleto"].includes(initial.tipo)?"compra":
        ["alquiler","reserva_alquiler"].includes(initial.tipo)?"alquiler":
        ["refuerzo_reserva","devolucion_reserva","comodato","exclusividad"].includes(initial.tipo)?"otros":null
      );
    }
  },[initial,focusCampo]);
  // Al editar una operación ya guardada, se resaltan en rojo (en la barra de
  // pasos y en el campo puntual) los datos críticos que todavía faltan. En
  // una operación nueva no se muestra nada en rojo hasta que se guarde.
  const modoEdicion = !!initial;
  const [revisando,setRevisando]=useState(false);
  // 4.30: comisión sugerida (3%) al crear una operación de venta o autorización: queda prellenada y se puede editar o borrar.
  useEffect(function(){
    if(initial) return;
    if(["reserva","boleto","exclusividad"].indexOf(data.tipo)<0) return;
    setData(function(d){
      if(String(d.comision_vendedor_valor||"").trim()||String(d.comision_vendedor_texto||"").trim()||d.comision_vendedor) return d;
      return Object.assign({},d,{comision_vendedor_modo:"porcentaje",comision_vendedor_valor:"3"});
    });
  },[data.tipo]);
  const faltantesDetalle = (modoEdicion||revisando) ? getCamposFaltantesDetalle(data,perfil) : [];
  const camposFaltantes = faltantesDetalle.map(function(f){return f.campo;});
  const pasosFaltantes = faltantesDetalle.reduce(function(acc,f){acc[f.paso]=true;return acc;},{});
  // 4.29: marca en rojo el campo puntual que falta (por DOM, así vale para todos los pasos y tipos de documento).
  useEffect(function(){
    if(typeof document==="undefined") return;
    var t=setTimeout(function(){
      document.querySelectorAll("[data-falta]").forEach(function(el){el.removeAttribute("data-falta");});
      faltantesDetalle.forEach(function(f){ var el=document.getElementById("dw-field-"+f.campo); if(el) el.setAttribute("data-falta","1"); });
    },60);
    return function(){clearTimeout(t);};
  },[step,data,grupo,modoEdicion,revisando]);
  function irACampo(campo){
    if(!campo){ setStep(total); return; }
    setRevisando(true);
    setStep(getPasoDeCampo(campo,data.tipo));
    var intentos=0;
    var iv=window.setInterval(function(){
      intentos++;
      var el=document.getElementById("dw-field-"+campo);
      if(el){ window.clearInterval(iv); try{el.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){} try{el.focus({preventScroll:true});}catch(e){} }
      else if(intentos>15) window.clearInterval(iv);
    },100);
  }
  useEffect(function(){
    if(!focusCampo||typeof document==="undefined") return;
    var n=0, iv=window.setInterval(function(){
      n++;
      var el=document.getElementById("dw-field-"+focusCampo);
      if(el){ window.clearInterval(iv); try{el.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){} try{el.focus({preventScroll:true});}catch(e){} }
      else if(n>15) window.clearInterval(iv);
    },100);
    return function(){window.clearInterval(iv);};
  },[focusCampo,step]);

  // Borrador local de máxima seguridad: cada cambio queda persistido en localStorage
  // inmediatamente, y además se hace un flush síncrono al salir/ocultar la
  // pestaña. Importante: NO se elimina al desmontar el componente, porque una recarga
  // del navegador también desmonta React; borrarlo ahí anulaba toda la red de seguridad.
  const initialIdRef = useRef(initial ? initial.id || null : null);
  const guardandoFormRef = useRef(false);
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
      // El borrador queda guardado en el dispositivo y se ofrece recuperarlo al volver:
      // solo se interrumpe la salida si el guardado local falló.
      if(guardarDraftLocalAhora()!==false) return;
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
        // Compatibilidad histórica: comprador_* representa a la inmobiliaria autorizada; aquí corresponde MATRÍCULA, nunca CUIT.
        next.comprador_dni = perfil && perfil.matricula ? perfil.matricula : (d.comprador_dni||"");
        next.comprador_domicilio = perfil && perfil.direccion ? perfil.direccion : (d.comprador_domicilio||"");
        next.comprador_email = perfil && perfil.email ? perfil.email : (d.comprador_email||"");
        next.comprador_telefono = perfil && perfil.telefono ? perfil.telefono : (d.comprador_telefono||"");
        next.exclusividad_inmobiliaria_autofill = true;
      }
      if(!initial && (!d.clausulas_ids||!d.clausulas_ids.length)){
        // En operaciones nuevas se agregan automáticamente las cláusulas obligatorias
        // del modelo. Las opcionales quedan disponibles para que el asesor las elija.
        var plantillaCfg=obtenerPlantillaConfig(perfil,v,clausulas);
        var defaultsIds=plantillaCfg.obligatorias_ids||[];
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
      // Exclusividad usa campos propios para la inmobiliaria; se mantienen también
      // los campos comprador_* por compatibilidad con formularios y operaciones históricas.
      fill("inmobiliaria_nombre",perfil.nombre);
      fill("inmobiliaria_matricula",perfil.matricula);
      fill("inmobiliaria_domicilio",perfil.direccion);
      fill("inmobiliaria_email",perfil.email);
      fill("inmobiliaria_telefono",perfil.telefono);
      fill("comprador_nombre",perfil.nombre);
      fill("comprador_dni",perfil.matricula);
      fill("comprador_domicilio",perfil.direccion);
      fill("comprador_email",perfil.email);
      fill("comprador_telefono",perfil.telefono);
      if(!d.exclusividad_inmobiliaria_autofill){ next.exclusividad_inmobiliaria_autofill=true; changed=true; }
      return changed?next:d;
    });
  },[data.tipo,perfil&&perfil.nombre,perfil&&perfil.matricula,perfil&&perfil.direccion,perfil&&perfil.email,perfil&&perfil.telefono]);

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
        <div style={{minHeight:260,paddingTop:4}}>
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
      if(step===2)return <StepPersona data={data} onChange={set} prefix="locador" titulo={rolParte(data.tipo,0).charAt(0)+rolParte(data.tipo,0).slice(1).toLowerCase()} faltantes={camposFaltantes}/>;
      if(step===3)return <StepPersona data={data} onChange={set} prefix="locatario" titulo="Locatario (inquilino)" faltantes={camposFaltantes}/>;
      if(step===4)return <StepInmueble data={data} onChange={set} faltantes={camposFaltantes}/>;
      if(step===5)return <StepCondicionesAlquiler data={data} onChange={set} equipo={equipo} faltantes={camposFaltantes}/>;
      if(step===6)return <StepGarantia data={data} onChange={set}/>;
      if(step===7)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={true} onAddClausula={onAddClausula} perfil={perfil}/>;
    }
    if(esResAlq){
      if(step===1)return <StepTipo data={data} onChange={set} grupo="alquiler"/>;
      if(step===2)return <StepPersona data={data} onChange={set} prefix="locatario" titulo="Locatario (inquilino)" faltantes={camposFaltantes}/>;
      if(step===3)return <StepPersona data={data} onChange={set} prefix="locador" titulo="Locador" faltantes={camposFaltantes}/>;
      if(step===4)return <StepInmueble data={data} onChange={set} faltantes={camposFaltantes}/>;
      if(step===5)return <StepCondicionesReservaAlq data={data} onChange={set} equipo={equipo} faltantes={camposFaltantes}/>;
      if(step===6)return <StepClausulas data={data} onChange={set} clausulas={clausulas} esAlquiler={true} onAddClausula={onAddClausula} perfil={perfil}/>;
    }
    if(esDocSimple){
      var grupoReal=grupo||"otros";
      if(step===1)return <StepTipo data={data} onChange={set} grupo={grupoReal} operaciones={operaciones} onSelectReservaRefuerzo={elegirReservaParaRefuerzo} onSelectReservaDevolucion={elegirReservaParaDevolucion}/>;
      if(step===2)return data.tipo==="exclusividad" ? <StepInmobiliariaAutorizada data={data} perfil={perfil}/> : <StepPersona data={data} onChange={set} prefix="comprador" titulo={data.tipo==="comodato"?"Comodatario (recibe el bien)":data.tipo==="refuerzo_reserva"||data.tipo==="devolucion_reserva"?"Comprador":"Parte solicitante"} faltantes={camposFaltantes}/>;
      if(step===3)return <StepPersona data={data} onChange={set} prefix="vendedor" titulo={rolParte(data.tipo,0).charAt(0)+rolParte(data.tipo,0).slice(1).toLowerCase()} faltantes={camposFaltantes}/>;
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
  async function handleFinalizarAccion(accion,estadoFinal=undefined){
    // Evita que un doble toque cree dos documentos (cada guardado de una operación nueva genera un id propio).
    if(guardandoFormRef.current) return;
    guardandoFormRef.current = true;
    try{
      var toGuardar = Object.assign({},limpiarComisionesIncompatibles(data),{estado:estadoFinal||data.estado||"borrador"});
      await onSave(toGuardar, accion, estadoFinal||toGuardar.estado);
    } finally {
      guardandoFormRef.current = false;
    }
  }
  return(
    <div style={{paddingBottom:4}}>
      {modoEdicion&&faltantesDetalle.length>0&&(
        <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",marginBottom:10,fontSize:12.5,color:"var(--red)"}}>
          <span>⚠</span>
          <span>Faltan {faltantesDetalle.length} dato{faltantesDetalle.length===1?"":"s"} clave: {faltantesDetalle.map(function(f){return f.label;}).join(", ")}.</span>
        </div>
      )}
      <div style={{marginBottom:10}}><StepBar current={step} tipo={data.tipo} pasosFaltantes={pasosFaltantes} onGoTo={function(id){setStep(id);}}/></div>
      <div style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:12,fontWeight:600,color:"var(--dim)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Progreso</span>
          <span style={{fontSize:12,fontWeight:700,color:pct===100?"var(--green)":"var(--gold)"}}>{pct}%</span>
        </div>
        <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"}}>
          <div style={{height:"100%",width:pct+"%",background:pct===100?"linear-gradient(90deg,#22c55e,#4ade80)":"linear-gradient(90deg,#c9962a,var(--gold),var(--gold2))",borderRadius:10,transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)"}}/>
        </div>
      </div>
      <div style={{minHeight:260}}>{step<=total?renderStep():<PasoResumenFinal data={data} clausulas={clausulas} onVolver={irACampo} onFinalizarAccion={handleFinalizarAccion}/>}</div>
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
 return OperacionForm;
}

export function crearPapeleraView(deps){
 const {Btn, ConfirmModal, PAPELERA_DIAS, TIPOS, TIPO_ICON, nombreConSufijo, useState} = deps;


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
  function getName(op){if(op.tipo==="alquiler"||op.tipo==="reserva_alquiler")return nombreConSufijo(op,"locatario","Locatario")+" (locatario) ← "+nombreConSufijo(op,"locador","Locador")+" (Locador)";return nombreConSufijo(op,"comprador","Comprador")+" (comprador) ← "+nombreConSufijo(op,"vendedor","Vendedor")+" (Vendedor)";}
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
                    <span style={{fontSize:12,color:"var(--dim)"}}>Eliminada el {new Date(op.deleted_at).toLocaleDateString("es-AR")}</span>
                    <span style={{fontSize:12,padding:"1px 8px",borderRadius:20,background:dias<=5?"rgba(248,113,113,0.12)":"rgba(255,255,255,0.06)",color:dias<=5?"var(--red)":"var(--dim)"}}>{dias>0?dias+" días restantes":"Se elimina hoy"}</span>
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
 return PapeleraView;
}

export function crearTareasPanel(deps){
 const {Btn, genId, getTareasDeOp, useState} = deps;


function TareasPanel({op,onToggleTarea,onUpdateOperation}){
  var base=getTareasDeOp(op);
  var custom=(Array.isArray(op.tareas_custom)?op.tareas_custom:[]).filter(function(t){return t&&t.id&&t.texto;});
  var tareas=base.concat(custom.map(function(t){return [t.id,t.texto,true];}));
  var tareasDone=op.tareas_done||{};
  var tareasHechas=tareas.filter(function(t){return tareasDone[t[0]];}).length;
  var [nueva,setNueva]=useState("");
  function agregar(){
    var txt=String(nueva||"").trim();
    if(!txt||!onUpdateOperation) return;
    var item={id:"custom_"+genId(),texto:txt.slice(0,140)};
    onUpdateOperation(Object.assign({},op,{tareas_custom:custom.concat([item])}));
    setNueva("");
  }
  function quitar(id){
    if(!onUpdateOperation) return;
    var td=Object.assign({},op.tareas_done||{}); delete td[id];
    onUpdateOperation(Object.assign({},op,{tareas_custom:custom.filter(function(t){return t.id!==id;}),tareas_done:td}));
  }
  return <div className="card" style={{padding:18}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>Centro de tareas</div>
      <span style={{fontSize:12,color:tareasHechas===tareas.length?"var(--green)":"var(--dim)",fontWeight:600}}>{tareasHechas}/{tareas.length} completadas</span>
    </div>
    <div style={{height:5,borderRadius:3,background:"var(--border)",overflow:"hidden",marginBottom:14}}>
      <div style={{height:"100%",width:(tareas.length?(tareasHechas/tareas.length*100):0)+"%",background:tareasHechas===tareas.length?"var(--green)":"var(--gold)",transition:"width 0.2s"}}/>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      {tareas.map(function(t){var hecha=!!tareasDone[t[0]];return <div key={t[0]} onClick={function(){onToggleTarea&&onToggleTarea(op.id,t[0]);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 6px",cursor:onToggleTarea?"pointer":"default",borderRadius:8}}>
        <span className={"dw-ios-round"+(hecha?" on":"")} role="checkbox" aria-checked={hecha}>{hecha&&<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M3.2 8.6l3.1 3L12.8 4.9" fill="none" stroke="#0a0f1a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}</span>
        <span style={{flex:1,minWidth:0,fontSize:13,color:hecha?"var(--dim)":"var(--text)",textDecoration:hecha?"line-through":"none",overflowWrap:"anywhere"}}>{t[1]}</span>
        {t[2]&&<span style={{fontSize:11,padding:"1px 8px",borderRadius:20,background:"rgba(212,168,83,.12)",color:"var(--gold)",fontWeight:700,flexShrink:0}}>Propia</span>}
        {t[2]&&onUpdateOperation&&<button type="button" aria-label="Quitar tarea" title="Quitar tarea" onClick={function(e){e.stopPropagation();quitar(t[0]);}} style={{border:"none",background:"transparent",color:"var(--dim)",cursor:"pointer",fontSize:15,padding:"2px 6px",flexShrink:0}}>✕</button>}
      </div>;})}
    </div>
    {onUpdateOperation&&<div className="tarea-custom-add">
      <input className="inp" value={nueva} maxLength={140} onChange={function(e){setNueva(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"){e.preventDefault();agregar();}}} placeholder="Agregar tarea propia (ej.: pedir plano de mensura)" aria-label="Nueva tarea personalizada"/>
      <Btn v="primary" s="md" onClick={agregar} disabled={!String(nueva||"").trim()}>+ Agregar</Btn>
    </div>}
  </div>;
}
 return TareasPanel;
}

export function crearNegociacionPanel(deps){
 const {Btn, Inp, Slt, Txa, fechaHoyISO, fmt$, fmtD, genId, useState} = deps;

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
      <div><div style={{fontSize:12,fontWeight:700,color:"var(--dim)",textTransform:"uppercase",letterSpacing:".08em"}}>Negociación</div><div style={{fontSize:12,color:"#cbd5e1",marginTop:3}}>Registrá cada propuesta sin crear otra operación.</div></div>
      {ultimo&&<span style={{fontSize:12,fontWeight:700,color:"var(--gold)"}}>Último valor: {ultimo.moneda||"USD"} {ultimo.monto||"—"}</span>}
    </div>
    {historial.length>0&&<div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>{historial.map(function(h,i){return <div key={h.id||i} style={{display:"grid",gridTemplateColumns:"92px 1fr auto",gap:8,alignItems:"center",padding:"7px 8px",border:"1px solid var(--border)",borderRadius:8,background:"rgba(255,255,255,.018)",fontSize:12}}><span style={{color:"var(--dim)"}}>{fmtD(h.fecha)}</span><span style={{color:"var(--text)"}}><b>{h.parte==="vendedor"?"Vendedor":"Comprador"}</b>{h.observacion?" · "+h.observacion:""}</span><span style={{color:"var(--gold)",fontWeight:700,whiteSpace:"nowrap"}}>{fmt$(h.monto,h.moneda||"USD")}{h.vencimiento?" · vence "+fmtD(h.vencimiento):""}</span></div>;})}</div>}
    {op.estado!=="cerrado"&&<div style={{paddingTop:11,borderTop:"1px dashed var(--border2)"}}><div className="grid2">
      <Slt label="Propuesta de" value={parte} onChange={function(e){setParte(e.target.value);}}><option value="comprador">Comprador</option><option value="vendedor">Vendedor</option></Slt>
      <div className="grid2" style={{gap:8}}><Inp label="Monto" type="number" value={monto} onChange={function(e){setMonto(e.target.value);}}/><Slt label="Moneda" value={moneda} onChange={function(e){setMoneda(e.target.value);}}><option value="USD">USD</option><option value="ARS">ARS</option></Slt></div>
      <Inp label="Nuevo vencimiento de aceptación" type="date" value={venc} onChange={function(e){setVenc(e.target.value);}} className="col2"/>
      <Txa label="Observación" rows={2} value={obs} onChange={function(e){setObs(e.target.value);}} placeholder="Ej. El Vendedor acepta este valor y solicita 3 días más…" className="col2"/>
    </div><div style={{display:"flex",justifyContent:"flex-end",marginTop:9}}><Btn v="primary" s="sm" onClick={agregar}>+ Registrar contraoferta</Btn></div></div>}
  </div>;
}
 return NegociacionPanel;
}

export function crearReservaDecisionPanel(deps){
 const {Btn, useState} = deps;


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
 return ReservaDecisionPanel;
}
