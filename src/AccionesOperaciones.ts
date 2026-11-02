// Ayuda de interfaz. La autorización efectiva siempre corresponde al servidor.
export function permisosOperacion(usuario: any, op: any = null) {
  const rol = usuario && (usuario.rol_base || usuario.rol);
  const activo = !!usuario && usuario.activo !== false;
  const administra = activo && (rol === 'dueno' || rol === 'admin');
  const crea = activo && ['dueno', 'admin', 'broker', 'vendedor'].includes(rol);
  // Las RPC filtran las operaciones históricas sin broker_id por creado_por.
  // Si el cliente antiguo no recibe ese metadato, el servidor vuelve a verificarlo al guardar.
  const propia = !!op && !!usuario?.id && (op.broker_id
    ? op.broker_id === usuario.id
    : op.creado_por ? op.creado_por === usuario.id : true);
  const edita = administra || (activo && rol === 'broker' && propia && !op?.deleted_at);
  return { crear: crea, editar: !!op && edita && !op.deleted_at,
    convertir: !!op && crea && edita && !op.deleted_at,
    papelera: administra };
}

export function prepararAltaOperacion(usuario: any, op: any) {
  const nueva = Object.assign({}, op);
  if (usuario && ['broker','vendedor'].includes(usuario.rol_base || usuario.rol) && !nueva.broker_id) {
    nueva.broker_id = usuario.id;
  }
  return nueva;
}

export function claveContextoOperaciones(ctx: any) {
  return [ctx?.inmobiliaria?.id || '', ctx?.usuario?.id || '', ctx?.usuario?.rol_base || '', ctx?.habilitado === false ? 'no' : 'si'].join('|');
}

export function crearControlContextoOperaciones(clave: string) {
  let actual = clave, revision = 0, activo = true;
  return {
    actualizar(nueva: string) { if (nueva !== actual) { actual = nueva; revision++; } },
    activar() { activo = true; },
    invalidar() { activo = false; revision++; },
    capturar() { const r = revision; return () => activo && r === revision; },
  };
}

export async function ejecutarCambioConfirmado({solicitar, vigente, confirmar, fallar}: any) {
  if (!vigente()) return { contextoObsoleto: true };
  let resultado;
  try { resultado = await solicitar(); } catch (error) { resultado = { error }; }
  if (!vigente()) return Object.assign({}, resultado, { contextoObsoleto: true });
  if (resultado && resultado.contextoObsoleto) return resultado;
  if (!resultado || resultado.error) {
    resultado = resultado || { error: { message: 'El servidor no confirmó la acción.' } };
    if (fallar) fallar(resultado.error);
  } else if (confirmar) confirmar(resultado);
  return resultado;
}

// Solo los borradores con origen conocido pueden sincronizarse automáticamente.
// Los anteriores sin contexto se conservan para recuperación manual.
export function contextoBorradorOperacion(ctx: any) {
  return { inmobiliariaId: ctx?.inmobiliaria?.id || '', usuarioId: ctx?.usuario?.id || '' };
}
export function borradorDelContexto(draft: any, ctx: any) {
  const actual=contextoBorradorOperacion(ctx), origen=draft&&draft.contexto;
  return !!actual.inmobiliariaId && !!actual.usuarioId && !!origen &&
    origen.inmobiliariaId===actual.inmobiliariaId && origen.usuarioId===actual.usuarioId;
}

export function mismoBorrador(original: any, actual: any) {
  return !!original && !!actual && JSON.stringify(original)===JSON.stringify(actual);
}
