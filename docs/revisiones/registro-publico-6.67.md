# DocWorks 6.67 — registro legacy cerrado

## Objetivo
Evitar escrituras públicas no necesarias en la antigua tabla de solicitudes `public.solicitudes_registro`.

## Comprobaciones antes del cambio
- Producción: `anon` y `authenticated` tenían INSERT directo (y privilegios adicionales de tabla), con una política INSERT `WITH CHECK (true)`.
- `fn_solicitar_registro_publico` era ejecutable también por `anon`; su validación era básica.
- Ningún archivo de la app o landing actuales llama a esa RPC.
- El alta actual usa `auth.signUp` con `docworks_registro=trial_month_v1`, verificación de email y aprovisionamiento privado; las pruebas de `tests/registro.cjs` cubren dicho circuito.

## Corrección en producción
- Migración de Supabase aplicada: **20261115035201** `cerrar_registro_legacy_publico_667`.
- Se retiraron todos los privilegios sobre `solicitudes_registro` para `anon` y `authenticated`.
- Se revocó EXECUTE de `fn_solicitar_registro_publico` para `PUBLIC`, `anon` y `authenticated`.
- Se conservaron tabla, registros, funciones de superadministración y permisos del rol `service_role`.
- Chequeo posterior confirmado: `anon_insert=false`, `authenticated_insert=false`, `anon_rpc=false`, `authenticated_rpc=false`; `service_insert=true`.

## Otros hallazgos, sin cambios automáticos
- CAPTCHA real sigue desactivado en `/captcha-config.js`; requiere sitekeys/restricción de dominios de Turnstile y configuración de Supabase Auth.
- Security Advisor: advertencia de protección contra contraseñas filtradas, dependiente de configuración/plan de Auth.
- Security Advisor: 65 avisos sobre `SECURITY DEFINER` ejecutables por usuarios autenticados. Son advertencias para auditar individualmente: no revocar en bloque, pues hay funciones protegidas internamente y otras necesarias para la app.
- El acceso verdaderamente anónimo a la URL se debe comprobar con navegador externo no autenticado; las peticiones del conector de Vercel están autenticadas.
- No hay prueba en iPhone físico ni de correo real.

## Despliegue
Un commit a `main` para dejar la migración versionada, la regresión y el número de versión sincronizados; cero cambios de contratos, cláusulas, datos históricos o lógica del formulario.
