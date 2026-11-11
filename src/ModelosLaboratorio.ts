// Laboratorio aislado: estas funciones solo utilizan el almacenamiento que recibe el llamador.
// Ninguna escribe en Supabase ni en los modelos reales.
export const MODELOS_LAB_SCHEMA=1;
export function modeloLabVacio(){
 return {schema:MODELOS_LAB_SCHEMA,borrador:null,versiones:[],publicada:null};
}
export function claveModeloLab(inmobiliariaId,usuarioId){
 if(!inmobiliariaId||!usuarioId)return null;
 return "docworks:lab-modelos:v1:"+String(inmobiliariaId)+":"+String(usuarioId);
}
export function leerModeloLab(almacenamiento,clave){
 if(!almacenamiento||!clave)return modeloLabVacio();
 try{
  const raw=almacenamiento.getItem(clave);if(!raw)return modeloLabVacio();
  const value=JSON.parse(raw);
  if(!value||value.schema!==MODELOS_LAB_SCHEMA||!Array.isArray(value.versiones))return modeloLabVacio();
  const validas=value.versiones.filter(v=>v&&Number.isInteger(v.version)&&v.snapshot&&typeof v.snapshot==="object");
 const publicada=Number.isInteger(value.publicada)?value.publicada:null;
 let versiones=validas.slice(-25);
 if(publicada!=null&&!versiones.some(v=>v.version===publicada)){
  const elegida=validas.find(v=>v.version===publicada);
  if(elegida)versiones=[elegida].concat(validas.slice(-24));
 }
  return {schema:MODELOS_LAB_SCHEMA,borrador:value.borrador&&typeof value.borrador==="object"?value.borrador:null,
   versiones,publicada:publicada};
 }catch(_e){return modeloLabVacio();}
}
export function validarModeloLab(snapshot){
 const errores=[];
 if(!snapshot||!["adaptar","propio"].includes(snapshot.modo))errores.push("Elegí Adaptar modelo o Modelo propio.");
 if(!snapshot||!String(snapshot.titulo||"").trim())errores.push("Falta el título del documento.");
 else if(String(snapshot.titulo).length>160)errores.push("El título es demasiado largo.");
 const bloques=snapshot&&Array.isArray(snapshot.partes)?snapshot.partes:[];
 const activos=bloques.filter(b=>b&&b.activo!==false);
 if(!activos.length||bloques.length>40)errores.push("El modelo necesita entre 1 y 40 apartados y al menos uno activo.");
 if(activos.some(b=>!String(b.titulo||"").trim()||!String(b.contenido||"").trim()))errores.push("Completá el título y el texto de las partes incluidas.");
 if(bloques.some(b=>String(b.titulo||"").length>180||String(b.contenido||"").length>20000))errores.push("Un apartado supera el tamaño permitido.");
 if(snapshot&&snapshot.conformidadSeparada&&(!String(snapshot.tituloActa||"").trim()||!String(snapshot.textoActa||"").trim()))errores.push("Completá el título y el texto del acta independiente.");
 if(JSON.stringify(snapshot||{}).length>100000)errores.push("El modelo supera el tamaño disponible para esta prueba.");
 return errores;
}
export function guardarRevisionModeloLab(estado,snapshot,publicar,fechaISO){
 const errores=validarModeloLab(snapshot);if(errores.length)return {ok:false,errores};
 const s=estado&&estado.schema===MODELOS_LAB_SCHEMA?estado:modeloLabVacio();
 const copiar=x=>JSON.parse(JSON.stringify(x));
 const copia=copiar(snapshot),prev=s.versiones[s.versiones.length-1];
 const esMisma=!!prev&&JSON.stringify(prev.snapshot)===JSON.stringify(copia);
 const version=esMisma?prev.version:((prev&&prev.version||0)+1);
 const todas=esMisma?s.versiones.slice():s.versiones.concat([{version,fecha:fechaISO||new Date().toISOString(),snapshot:copia}]);
 const publicadaAnterior=s.publicada;
 let versiones=todas.slice(-25);
 if(publicadaAnterior!=null&&publicadaAnterior!==version&&!versiones.some(v=>v.version===publicadaAnterior)){
  const elegida=todas.find(v=>v.version===publicadaAnterior);
  if(elegida)versiones=[elegida].concat(todas.slice(-24));
 }
 const nuevo={schema:MODELOS_LAB_SCHEMA,borrador:copia,versiones,publicada:publicar?version:s.publicada};
 return {ok:true,estado:nuevo,version,nuevaVersion:!esMisma};
}
export function recuperarVersionModeloLab(estado,version){
 const v=estado&&Array.isArray(estado.versiones)?estado.versiones.find(x=>x.version===version):null;
 return v?JSON.parse(JSON.stringify(v.snapshot)):null;
}
export function escribirModeloLab(almacenamiento,clave,estado){
 if(!almacenamiento||!clave)return false;
 try{almacenamiento.setItem(clave,JSON.stringify(estado));return true;}catch(_e){return false;}
}
