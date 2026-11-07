# DocWorks 6.35 · revisión de seguridad solicitada

Base publicada: 6.34, `5d3618f`. Revisión del 7 de noviembre de 2026. Se inspeccionaron definiciones, privilegios, usos del cliente, disparadores y políticas reales antes de cambiar la base.

| Punto | Resultado |
|---|---|
| Provisión por email | El cliente no llama a `fn_provisionar_usuario_por_email`. Se revocó su ejecución a PUBLIC, anon y authenticated. La autoprovisión propia y los disparadores conservan la llamada interna con privilegios de servidor. |
| Helpers de roles | `fn_es_admin` y `fn_es_super_admin` sólo responden sobre el usuario autenticado. Otro ID devuelve falso independientemente de su rol. Se mantienen las firmas/OID usados por las políticas. Dos usos internos que necesitan revisar otro usuario pasan a helpers privados sin permiso de ejecución para clientes: validación de otorgantes y provisión de pruebas. |
| Límites y cantidades | Las tres funciones permiten consultar la inmobiliaria del usuario activo o el alcance global del superadministrador. Una inmobiliaria ajena o desconocida da el mismo rechazo. Se verificaron contexto, invitación, dashboard y límite personalizado. |
| Reordenar cláusulas | Exige inmobiliaria propia, cláusula vigente y permiso efectivo de edición. Respeta excepciones autorizadas; bloquea al viewer, a un broker sin permiso y a una cláusula protegida. Guarda orden anterior y nuevo en auditoría. No altera el texto de los documentos. |
| Vaciar auditoría | Se retira la ejecución desde la aplicación, incluido el superadministrador autenticado y service_role por esa RPC. No se borró historial. La administración directa de PostgreSQL sigue teniendo sus facultades inherentes. |
| IDs de operaciones | El camino principal ya usaba UUID. Se eliminó el respaldo con `Math.random`, usando `getRandomValues` y UUID v4 cuando no exista `randomUUID`. El guardado consulta sólo el ID de su inmobiliaria, conserva IDs históricos y sanea las colisiones sin exponer la restricción interna o el titular. La respuesta se limita a la inmobiliaria actual. |
| Funciones de disparador | Se revocó la llamada directa a `fn_docworks_auditoria_trigger`, `trg_invitacion_onboarding` y `dw_clausula_personal_touch` para PUBLIC, anon y authenticated. Los disparadores siguen funcionando dentro de las escrituras autorizadas. |
| Contraseñas filtradas | Continúa desactivada: la organización está en Free y Supabase ofrece este control desde Pro. No se contrató ni cambió el plan. No se presenta una validación del navegador como sustituto del control del servidor. |

## Hallazgo adicional corregido

La política `permisos_broker_select` permitía al administrador consultar filas de otros equipos. Ahora exige que el usuario de la excepción pertenezca a su propia inmobiliaria. `fn_permiso_efectivo` también rechaza consultas sobre usuarios de otra inmobiliaria. Se comprobó la lectura propia y el rechazo entre equipos.

## Límite del cambio de IDs

La clave primaria de operaciones continúa siendo global y hay referencias históricas que dependen de ella. No se migraron IDs ni relaciones. El error explícito de búsqueda global se retiró y las colisiones no filtran el nombre de la restricción ni datos del otro tenant; sin embargo, un cliente que envíe deliberadamente un ID ya ocupado todavía puede inferir que el guardado no fue aceptado. Eliminar por completo esa señal requiere claves por inmobiliaria o una RPC de creación con IDs exclusivamente asignados por servidor, junto con adaptación de relaciones, reintentos y borradores. Esta entrega mitiga el problema y evita romper clientes/documentos existentes; no declara eliminado ese riesgo residual.

## Validación

- 28 comprobaciones SQL locales sobre las definiciones reales: privilegios, aislamiento, roles propios, cantidades propias/globales, reordenamiento y auditoría, excepciones, invitación/autoprovisión y registro de prueba.
- Prueba de UUID nativo, UUID v4 compatible, fallo sin fuente segura y 10.000 identificadores diferentes.
- `npm run check`: TypeScript, regresiones de documentos y aplicación, SQL local y build.
- Antes de aplicar: transacción en Supabase real con el parche y las cuentas QA reservadas. Se probó contexto normal/superadmin, dashboard, reordenamiento denegado/permitido, auditoría y registro confirmado de una prueba nueva. ROLLBACK completo; cero cláusulas QA persistidas.
- Migración registrada: `seguridad_rpc_y_aislamiento_635`. Después de aplicar se repitió el recorrido de permisos/contexto sobre la base real en una transacción revertida.
- El asesor pasó de 71 a 67 avisos de funciones públicas SECURITY DEFINER ejecutables por authenticated. Los avisos restantes no se eliminan con una revocación masiva: varias funciones son API de la aplicación y requieren autorización interna. No se certifica una auditoría exhaustiva de todas ellas.
- No se enviaron correos, ejecutaron cobros ni borró auditoría de clientes.

## Fuentes y evidencias

- Capturas de catálogo y dependencias: `tests/database/seguridad-635-*.json`.
- Parche y comprobaciones: `supabase/propuestas/seguridad-635.sql`, `tests/database/seguridad-635.cjs` y `tests/database/seguridad-635-rollback.sql`.
- Supabase, privilegios de funciones: https://supabase.com/docs/guides/database/functions
- Supabase, protección de contraseñas y disponibilidad por plan: https://supabase.com/docs/guides/auth/password-security

Los pendientes de pagos, correo, CAPTCHA, analítica, identidad legal y dispositivos físicos del lanzamiento continúan documentados en `entrega-6.34.md`; esta revisión cierra los cambios de seguridad descritos, con las dos limitaciones expresas de IDs y plan Free.
