import React from 'react';

// Información sobre el alcance de los modelos. No se inserta en documentos históricos.
export const RECOMENDACION_ASESORAMIENTO = "Se recomienda a las partes obtener asesoramiento jurídico e impositivo independiente antes de suscribir el presente documento.";

export const AVISO_CLAUSULAS_PERSONALIZADAS = "Las cláusulas redactadas o modificadas por la inmobiliaria y sus usuarios son responsabilidad de la inmobiliaria, que debe revisar su contenido y adecuación a cada operación antes de utilizarlas. DocWorks no realiza una revisión jurídica ni garantiza la validez de esas cláusulas.";

// Aviso de interfaz: no integra el texto de los contratos ni los exportadores.
export function AvisoClausulasPersonalizadas(){
  return <aside aria-label="Responsabilidad sobre cláusulas personalizadas" style={{fontSize:12.5,lineHeight:1.55,color:"var(--muted)",borderLeft:"3px solid var(--border2)",paddingLeft:10,margin:"9px 0"}}>{AVISO_CLAUSULAS_PERSONALIZADAS}</aside>;
}
