# DocWorks 6.59 — rendimiento de permisos RLS

Fecha: 14 de noviembre de 2026.

## Cambio en Supabase

Se optimizaron las cinco políticas que Supabase identificaba en la categoría `auth_rls_initplan`: `permisos_broker_select`, `dw_clausulas_personales_select`, `dw_clausulas_personales_insert`, `dw_clausulas_personales_update_owner` y `auditoria_select`.

Solo se sustituyó la evaluación directa `auth.uid()` por `(select auth.uid())` en los mismos predicados. No se alteraron los roles, las reglas de visibilidad, los nombres de las políticas, las tablas ni los datos. La migración valida que existan las cinco políticas previstas y aborta la transacción si faltan.

Migración aplicada en Supabase: `20261114190122_optimizar_rls_auth_initplan_659`.

## Verificación tras aplicar la migración

- Se verificaron las cinco políticas en `pg_policies` y la existencia de las llamadas cacheadas.
- El asesor de rendimiento redujo `auth_rls_initplan` de 5 advertencias a 0.
- Permanecen 18 avisos informativos de claves foráneas sin índice y 6 de índices sin uso. No se modificaron, para no introducir cambios innecesarios.
- Quedan pendientes los avisos independientes de seguridad de funciones `SECURITY DEFINER` y protección frente a contraseñas comprometidas.

La mejora de RLS no requiere modificar las operaciones o cláusulas de las inmobiliarias. La versión 6.59 únicamente documenta el cambio del backend en el indicador de versión visible.
