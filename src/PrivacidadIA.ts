// Rehabilitar solo después de revisar proveedor, modalidad y tratamiento de datos.
export const IA_HABILITADA = false;
export const MENSAJE_IA_PAUSADA = "La asistencia con IA está temporalmente pausada. Podés seguir editando y exportando tus documentos.";

export function asegurarIAHabilitada() {
  if (!IA_HABILITADA) throw new Error(MENSAJE_IA_PAUSADA);
}
