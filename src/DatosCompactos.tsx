import React,{useState} from "react";
type Dato={key:string;label:string};
type Props={items:Dato[];usados?:string[];onInsert:(key:string)=>void;disabled?:boolean};
const categorias=["Personas","Inmueble","Importes","Fechas","Otros"];
const roles=[["comprador","Comprador"],["vendedor","Vendedor"],["locador","Locador"],["locatario","Locatario"],["comodante","Comodante"],["comodatario","Comodatario"],["autorizante","Autorizante"]];
function categoria(k:string){
 if(roles.some(([p])=>k.startsWith(p+"_")))return "Personas";
 if(/^(inmueble_|nomenclatura_)/.test(k))return "Inmueble";
 if(/^(fecha_|.*_fecha|.*_inicio|.*_fin|.*_vencimiento|.*_posesion)/.test(k))return "Fechas";
 if(/^(precio|anticipo|saldo|moneda|reserva_|res_alq_|alquiler_monto|alquiler_deposito|alquiler_comision|comision_|boleto_pago|compra_pago)/.test(k))return "Importes";
 return "Otros";
}
function Icon({cat}:{cat:string}){
 return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
 {cat==="Personas"?<><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></>:
 cat==="Inmueble"?<><path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7"/></>:
 cat==="Importes"?<><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M16 15h2"/></>:
 cat==="Fechas"?<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3"/></>:
 <><path d="M6 2h9l4 4v16H6zM15 2v5h4M9 12h7M9 16h7"/></>}</svg>;
}
export default function DatosCompactos({items,usados=[],onInsert,disabled=false}:Props){
 const [abierto,setAbierto]=useState(false),[categoriaActiva,setCategoriaActiva]=useState("Personas"),[rol,setRol]=useState(""),[busqueda,setBusqueda]=useState("");
 const usadosSet=new Set(usados),pendientes=items.filter(d=>!usadosSet.has(d.key));
 const grupos=categorias.filter(c=>items.some(d=>categoria(d.key)===c));
 const activa=grupos.includes(categoriaActiva)?categoriaActiva:grupos[0]||"Otros";
 const personas=roles.filter(([p])=>items.some(d=>categoria(d.key)==="Personas"&&d.key.startsWith(p+"_")));
 const rolActivo=personas.some(([p])=>p===rol)?rol:personas[0]?.[0]||"";
 const normalizar=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 const visibles=pendientes.filter(d=>categoria(d.key)===activa&&(activa!=="Personas"||d.key.startsWith(rolActivo+"_"))&&(!busqueda||normalizar(d.label+" "+d.key).includes(normalizar(busqueda))));
 const boton:React.CSSProperties={display:"inline-flex",alignItems:"center",gap:8,minHeight:42,padding:"8px 11px",border:"1px solid var(--border)",borderRadius:10,background:"var(--card2,var(--card))",color:"var(--text)",fontSize:13,fontWeight:600,cursor:"pointer",maxWidth:"100%",textAlign:"left"};
 return <div style={{minWidth:0}}>
   <button type="button" aria-expanded={abierto} aria-label="Insertar dato" disabled={disabled||!pendientes.length} onMouseDown={e=>e.preventDefault()} onClick={()=>setAbierto(x=>!x)} style={{...boton,background:"var(--card)",borderColor:"var(--border2,var(--border))"}}>
     <span aria-hidden="true" style={{fontSize:19}}>＋</span> Insertar dato <span aria-hidden="true" style={{marginLeft:8,color:"var(--muted)"}}>{abierto?"⌃":"⌄"}</span>
   </button>
   {abierto&&<div aria-label="Elegir dato automático" style={{display:"flex",flexDirection:"column",gap:12,marginTop:9,padding:12,border:"1px solid var(--border)",borderRadius:12,background:"var(--card)",minWidth:0}}>
     <div aria-label="Categorías de datos" style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4}}>
       {grupos.map(c=><button type="button" key={c} aria-pressed={activa===c} onMouseDown={e=>e.preventDefault()} onClick={()=>{setCategoriaActiva(c);setBusqueda("");}} style={{...boton,flexShrink:0,background:activa===c?"var(--surface2,var(--card))":"var(--card)",borderColor:activa===c?"var(--text)":"var(--border)"}}><Icon cat={c}/>{c}{items.filter(d=>categoria(d.key)===c).every(d=>usadosSet.has(d.key))?" ✓":""}</button>)}
     </div>
     {activa==="Personas"&&personas.length>1&&<div aria-label="Elegir persona" style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4}}>
       {personas.map(([key,nombre])=><button type="button" key={key} aria-pressed={rolActivo===key} onMouseDown={e=>e.preventDefault()} onClick={()=>{setRol(key);setBusqueda("");}} style={{...boton,flexShrink:0,background:rolActivo===key?"var(--surface2,var(--card))":"var(--card)",borderColor:rolActivo===key?"var(--text)":"var(--border)"}}>{nombre}{items.filter(d=>d.key.startsWith(key+"_")).every(d=>usadosSet.has(d.key))?" ✓":""}</button>)}
     </div>}
     {items.length>14&&<input type="search" className="inp" aria-label="Buscar dato" placeholder="Buscar dato…" value={busqueda} onChange={e=>setBusqueda(e.target.value)} style={{fontSize:16,width:"100%",minWidth:0,maxWidth:340}}/>}
     <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
       {visibles.map(d=><button type="button" key={d.key} aria-label={"Insertar "+d.label} onMouseDown={e=>e.preventDefault()} onClick={()=>onInsert(d.key)} style={boton}><Icon cat={activa}/><span>{d.label}</span><span aria-hidden="true" style={{fontSize:17,opacity:.7}}>+</span></button>)}
       {!visibles.length&&<span role="status" style={{fontSize:12,color:"var(--muted)"}}>{busqueda?"No se encontraron datos.":"✓ No quedan datos pendientes en esta sección."}</span>}
     </div>
   </div>}
 </div>;
}
