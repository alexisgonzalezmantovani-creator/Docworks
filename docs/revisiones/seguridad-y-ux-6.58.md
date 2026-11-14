# DocWorks 6.58 — cierre de funciones heredadas y rótulos

Fecha: 2026-11-14

## Cambios
- Se inspeccionaron las 67 RPC SECURITY DEFINER ejecutables por usuarios autenticados.
- Se revoca únicamente el EXECUTE público de `fn_clausula_personal_resolver(uuid,text,text)`, heredada de la biblioteca personal ya retirada del cliente. No se elimina la función ni ningún dato.
- `fn_tipos_documento_validos()`, que devuelve un listado fijo de ocho identificadores, pasa a SECURITY INVOKER conservando su firma y su acceso legítimo.
- En Operaciones, si las dos partes están vacías se muestra un solo guion en lugar de `— · —`. Con una sola parte cargada se conservan el rol y el guion faltante.
- La prueba de navegador incluye un borrador sin nombres, además de las comprobaciones de iPhone, tablet y PC.

## Verificación
- Los grants de la función heredada deben impedir ejecución a `anon` y `authenticated`, sin retirar permisos de `service_role`.
- El helper de tipos debe seguir devolviendo los ocho tipos y figurar como SECURITY INVOKER.
- El asesor de seguridad debería pasar de 67 a 65 advertencias por funciones privilegiadas ejecutables; las demás siguen pendientes de revisión por separado.
- Probar TypeScript, compilación, suite de aplicación, Chromium y WebKit.

No se modifican cláusulas jurídicas, operaciones de clientes, membresías, SMTP, CAPTCHA ni cobros.
