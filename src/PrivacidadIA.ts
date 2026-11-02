// Las consultas generales no toman datos de operaciones ni admiten adjuntos.
export const IA_HABILITADA = true;
export const IA_DOCUMENTOS_HABILITADA = false;
export const AVISO_IA_GENERICA = "Usá consultas e ideas genéricas, sin datos personales ni información confidencial. Las respuestas son orientativas.";
export const MENSAJE_IA_PAUSADA = "La revisión de operaciones y archivos con IA no está disponible. Podés hacer consultas generales o redactar cláusulas sin datos reales.";

export function asegurarIAHabilitada(tipo="general") {
  if (!IA_HABILITADA || (tipo==="documento" && !IA_DOCUMENTOS_HABILITADA)) throw new Error(MENSAJE_IA_PAUSADA);
}

// Filtro básico de identificadores frecuentes; no identifica toda información
// personal o confidencial. El usuario debe limitarse a casos genéricos.
export function validarConsultaGenerica(texto: unknown) {
  if (typeof texto!=="string" || !texto.trim() || texto.length>6000) throw new Error("Escribí una consulta general de hasta 6000 caracteres.");
  const email=/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i;
  const identificador=/\b\d{2}[- .]?\d{8}[- .]?\d\b|\b\d{1,3}(?:\.\d{3}){2}\b|\b\d{7,}\b/;
  const telefono=/\+\d[\d\s().-]{6,}\d|\b(?:tel[eé]fono|celular|whatsapp)\s*:?\s*\d[\d\s().-]{5,}\d/i;
  const datoRotulado=/\b(?:dni|cuit|cuil)\s*(?:n[°ºo.]?\s*)?:?\s*\d/i;
  const domicilio=/\b(?:calle|avenida|av\.|domicilio|direcci[oó]n)\s*:?\s*[^\n,;]{1,60}\b\d{1,5}\b/i;
  const documento=/DOCUMENTO A REVISAR:|TEXTO DEL DOCUMENTO GENERADO:|DNI\/CUIT RELEVANTES:|\[Archivo adjunto:/i;
  if ([email,identificador,telefono,datoRotulado,domicilio,documento].some(p=>p.test(texto))) throw new Error("Quitá los datos personales y usá marcadores como [NOMBRE], [DNI] o [DOMICILIO]. No pegues contratos ni información confidencial.");
  return texto.trim();
}
