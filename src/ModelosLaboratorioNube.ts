// Preparación de sincronización remota del laboratorio.
// NO se invoca desde la aplicación hasta probar y aplicar el esquema aislado
// de supabase/propuestas/modelos-laboratorio-preparacion.sql en un proyecto QA.
// No toca tablas reales de plantillas, bloques ni operaciones.
export const TIPOS_MODELO_LAB=[
 "reserva","boleto","reserva_alquiler","alquiler","comodato",
 "exclusividad","refuerzo_reserva","devolucion_reserva"
];
export function tipoModeloLabValido(tipo){
 return TIPOS_MODELO_LAB.includes(tipo);
}
export async function cargarModeloLabNube(supabase,tipo){
 if(!tipoModeloLabValido(tipo))return {error:{message:"Tipo de documento inválido."}};
 if(!supabase||typeof supabase.from!=="function")return {error:{message:"No hay conexión válida."}};
 const r=await supabase.from("dw_modelos_laboratorio")
  .select("estado,revision,actualizado_en").eq("tipo_documento",tipo).maybeSingle();
 if(r.error)return {error:r.error};
 const fila=r.data||null;
 return {estado:fila&&fila.estado||null,revision:Number(fila&&fila.revision||0),actualizadoEn:fila&&fila.actualizado_en||null};
}
export async function cargarModeloPublicadoNube(supabase,tipo){
 if(!tipoModeloLabValido(tipo))return {error:{message:"Tipo de documento inválido."}};
 if(!supabase||typeof supabase.from!=="function")return {error:{message:"No hay conexión válida."}};
 const r=await supabase.from("dw_modelos_laboratorio_publicados")
  .select("version,snapshot,publicado_en").eq("tipo_documento",tipo).maybeSingle();
 if(r.error)return {error:r.error};
 const fila=r.data||null;
 return {version:fila&&fila.version||null,snapshot:fila&&fila.snapshot||null,publicadoEn:fila&&fila.publicado_en||null};
}
export async function guardarModeloLabNube(supabase,tipo,estado,expectedRevision,publicar){
 if(!tipoModeloLabValido(tipo))return {error:{message:"Tipo de documento inválido."}};
 if(!supabase||typeof supabase.rpc!=="function")return {error:{message:"No hay conexión válida."}};
 if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)return {error:{message:"Revisión anterior inválida."}};
 if(!estado||estado.schema!==1||!Array.isArray(estado.versiones))return {error:{message:"Contenido de modelo inválido."}};
 const r=await supabase.rpc("fn_dw_modelo_lab_guardar",{
  p_tipo:tipo,p_estado:estado,p_expected_revision:expectedRevision,p_publicar:!!publicar
 });
 if(r.error)return {error:r.error};
 return {revision:Number(r.data),guardado:true};
}
