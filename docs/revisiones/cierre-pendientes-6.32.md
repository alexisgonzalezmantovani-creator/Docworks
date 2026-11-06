# DocWorks 6.32 · cierre del backend de superadministración

Base: 6.31, `4bbcffb`. Revisión del 6 de noviembre de 2026.

## Completado en esta entrega

- Se implementaron las ocho RPC que la interfaz llamaba y la base no tenía: pago manual, extensión/prueba, transferencia de dueño, nota privada, archivo/reactivación, límite personalizado, anuncio y lectura del anuncio. La auditoría de contratos RPC ya no tiene referencias ausentes.
- Las mutaciones validan superadministrador dentro del servidor. La API nueva es SECURITY INVOKER y delega en funciones privadas con autorización interna. No hay acceso directo de clientes a notas/eventos. No se alteraron las concesiones de ejecución de funciones privadas anteriores.
- El pago manual valida monto, moneda, fecha y período, conserva una clave durante los reintentos y no duplica el registro. Registrar un pago no cobra una tarjeta ni extiende automáticamente la membresía. La extensión se realiza con su acción explícita.
- La extensión parte del vencimiento futuro o de hoy si ya venció; admite 1–366 días y rechaza cuentas archivadas/suspendidas/canceladas. Una prueba gratis no se aplica sobre una suscripción MP activa.
- El cambio de dueño sólo acepta un usuario activo de la misma inmobiliaria, conserva al anterior como administrador y se registra. La baja o cambio genérico del dueño exige transferir antes.
- Archivar conserva datos y estado anterior. Reactivar respeta vencimientos. No se permite archivar una suscripción MP pendiente/activa/pausada: archivar no cancela cobros en el proveedor.
- Los límites personalizados se usan en contexto, dashboard, detalle, listado y función de límite utilizada al invitar. No se permite un límite menor que usuarios e invitaciones existentes.
- Nota y límite se recuperan al abrir la ficha y se limpian al cambiar de inmobiliaria. Errores de nota/anuncio/plan/archivo se muestran; el detalle se actualiza después de cambios de plan y estado.
- El vencimiento de un anuncio con fecha se interpreta hasta las 23:59:59 de Argentina. La lectura requiere usuario activo o superadministrador.
- Se corrigió la consulta de onboarding que usaba una columna `id` inexistente en `super_admins`: la identificación correcta es `user_id` a través del helper autorizado.
- Se corrigieron las acciones anteriores de plan/estado/rol que intentaban guardar el ID del superadministrador en una FK de usuarios de inmobiliarias. Los nuevos eventos conservan el ID Auth en auditoría privada, visible en la auditoría global sólo para superadministración.

## Verificación

- `npm run check`: TypeScript, suite de aplicación, SQL local y build aprobados.
- 34 comprobaciones SQL nuevas: autorización de usuarios comunes/anónimos, nota, límite efectivo, extensión, transferencia entre inmobiliarias, archivo/reactivación, pago/reintento y auditoría.
- 17 verificaciones DOM del panel, incluida recuperación de nota y límite.
- Prueba transaccional contra Supabase real usando exclusivamente los IDs QA reservados: ocho acciones y lectura de auditoría, con ROLLBACK. Segunda prueba real de plan/estado/activación/rol anteriores, también revertida.
- Posterior a la migración: cero pagos/notas/anuncios QA persistidos y ocho API nuevas sin SECURITY DEFINER público.
- Asesor de seguridad: 71 avisos anteriores de funciones públicas SECURITY DEFINER; protección de contraseñas filtradas sigue deshabilitada. Las tres tablas privadas nuevas tienen RLS sin políticas y sin concesión de acceso directo, intencionalmente.
- No se certifica navegador autenticado ni iPhone/Safari físico en esta entrega. Las pruebas responsive de 6.31 no sustituyen esa comprobación.

## Pendientes que impiden afirmar cierre total

1. Mercado Pago: comprobar/configurar secreto de firma y cuenta receptora, validar precios y realizar recorrido con cuentas de prueba (aprobación, rechazo, renovación, cancelación y sincronización). Sigue pendiente la reserva de primera creación de checkout entre instancias y recuperación si el proveedor creó la suscripción pero falló su persistencia local. No se habilitaron ni ensayaron cobros reales.
2. Correo: configurar proveedor/remitente/dominio y verificar recepción real de confirmación y recuperación. Recordatorios a brokers todavía sin implementar; faltan servicio de envío y configuración de destinatarios/fecha de firma, cancelación y deduplicación persistente.
3. CAPTCHA y protección contra contraseñas filtradas del servidor: pendientes de configuración/verificación.
4. Analítica de la landing preparada pero desactivada; no afirmar medición de visitas o del embudo.
5. Términos y privacidad siguen como borrador pendiente de identidad legal completa y revisión.
6. Prueba física de la PWA en iPhone/Safari y Android: arranque, rotación/scroll, retorno del correo y compartir archivos.

Las correcciones previas de scroll/disco, documentos y cláusulas, seguro y rótulos permanecen en 6.27–6.31. Esta entrega cierra el backend del panel; no convierte los pendientes externos en funcionalidades habilitadas.
