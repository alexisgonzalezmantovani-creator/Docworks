// Información sobre el alcance de los modelos. No se inserta en documentos históricos.
export const RECOMENDACION_ASESORAMIENTO = "Se recomienda a las partes obtener asesoramiento jurídico e impositivo independiente antes de suscribir el presente documento.";

export function AvisoModelos({compacto=false}) {
  return <aside aria-label="Uso de modelos y revisión profesional" style={{padding:"10px 12px",marginBottom:12,border:"1px solid var(--border)",borderRadius:10,fontSize:12,lineHeight:1.55,color:"var(--muted)",overflowWrap:"anywhere"}}>
    <strong style={{display:"block",color:"var(--text)",marginBottom:4}}>Modelos orientativos · Revisión profesional</strong>
    <p style={{margin:0}}>Cada inmobiliaria debe revisar los modelos y sus cláusulas con su abogado antes de utilizarlos, adaptarlos a la normativa y jurisdicción aplicables y verificar los datos y condiciones de cada operación.</p>
    {!compacto&&<p style={{margin:"7px 0 0"}}>DocWorks proporciona herramientas de edición y modelos orientativos. Su provisión no constituye asesoramiento jurídico, notarial ni impositivo, ni garantiza por sí sola la validez o suficiencia jurídica del documento resultante.</p>}
    <p style={{margin:"7px 0 0"}}>{RECOMENDACION_ASESORAMIENTO}</p>
  </aside>;
}
