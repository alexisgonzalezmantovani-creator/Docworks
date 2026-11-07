# DocWorks 6.34 · entrega del 7 de noviembre de 2026

Continúa producción 6.33 (`3727396`). El código de esta entrega no certifica el cierre comercial: pagos y correo necesitan configuración del titular. Objetivo solicitado: 7/11 a las 08:00 de Argentina.

## Implementado

- Visor PDF: las pruebas remotas de WebKit detectaron un ciclo de ResizeObserver. Se agrupan las medidas por frame y se evita redibujar por cambios de altura del propio canvas. Se cancela el frame al desmontar. Se agregaron seis comprobaciones específicas.
- Verificación remota: se corrige el checkout sin historial, se preparan los recursos de PDF.js y se instalan Poppler/Python en los dos entornos de prueba; sin esos recursos la batería no podía completarse.

- Recuperación de acceso: bloqueo inmediato de doble solicitud, botón y cambio de modo deshabilitados durante el envío, validación y normalización del correo. El mensaje no afirma entrega ni confirma que exista una cuenta.
- Recordatorios de firma en el Centro de tareas: fecha y hora explícitas de Argentina, aviso un día/una hora antes o a la hora de firma. El dueño/administrador puede elegir al broker asignado o a un responsable activo de su inmobiliaria. Un broker sólo puede programar avisos para sí mismo en su operación.
- Cola persistente privada, límite de veinte avisos pendientes por operación, deduplicación por evento/destinatario y exclusión entre trabajadores. Cancelación y nueva programación conservan el historial. Papelera, cierre, baja, cambio de rol o reasignación invalidan avisos pendientes antes del procesamiento.
- El correo usa sólo fecha y acceso a DocWorks; no incluye datos de partes, montos ni documentos. El destinatario se obtiene del correo confirmado en Auth, no de un email arbitrario del navegador.
- Procesador `recordatorios` con secreto dedicado, credenciales únicamente de servidor y adaptador Resend preparado. Una respuesta perdida queda por verificar, sin reenvío automático. “Aceptado” significa aceptación del proveedor, no recepción en bandeja de entrada.
- La interfaz informa que el correo está pendiente de habilitación. La configuración inicial es apagada. No se contrató proveedor, verificó dominio, programó un cron ni envió correo real.

## Verificación

- `npm run check`: tipos, suite de aplicación, SQL local y build.
- 23 comprobaciones SQL específicas de recordatorios; 10 pruebas del procesador y fecha con proveedor simulado; 5 comprobaciones DOM de recuperación y contexto de recordatorios.
- Prueba transaccional en Supabase real con cuentas QA reservadas: creación, reintento, lectura, aislamiento entre inmobiliarias, toma exclusiva y persistencia del resultado; ROLLBACK. El correo del usuario QA se confirmó sólo dentro de la transacción para comprobar el caso habilitado. Cero correos enviados.
- Verificación posterior real: correo deshabilitado, cero avisos y cero operaciones QA de esta prueba persistidos.
- No se certifica prueba física de iPhone o Android. El navegador local automatizado no arrancó por restricciones del entorno; no se presenta como una regresión de la aplicación.
- La revisión automática bloqueó la invocación HTTP productiva del procesador por posible disparo de correos. No se repitió ni se sustituyó por otra ruta de invocación.

## Activación del correo

1. Elegir/verificar dominio y remitente en un proveedor. El adaptador de recordatorios preparado usa Resend; cambiarlo no requiere modificar la API de usuario. SMTP de Supabase Auth se configura separadamente para confirmación/recuperación.
2. Configurar en secretos de Edge Functions `RESEND_API_KEY`, `DOCWORKS_EMAIL_FROM`, `DOCWORKS_REMINDERS_SECRET` (aleatorio, al menos 32 caracteres) y `DOCWORKS_REMINDERS_ENABLED=true`. `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` permanecen en el servidor. Nunca pegar secretos en código, repositorio o navegador.
3. Programar una invocación POST por minuto a `/functions/v1/recordatorios`, con `Authorization: Bearer <secreto dedicado>` guardado en Vault o en el programador, no en SQL público. Procesa un aviso por invocación para limitar el tráfico al proveedor. Aumentar capacidad sólo después de confirmar las cuotas del servicio.
4. Mantener apagada la bandera de base durante configuración. Con destinatarios de prueba autorizados, verificar el circuito proveedor → bandeja/spam, cambio/cancelación y observabilidad. Activar `docworks_private.correo_config.habilitado` sólo cuando proveedor y programador estén comprobados. Revisar avisos en `verificar` contra el proveedor; no restablecerlos a pendiente sin reconciliación.
5. Aplicar `supabase/email-templates/confirm-signup.html` y `recover-password.html` en Auth, revisar remitente, Site URL y redirects. Comprobar recepción y retorno real antes de dar por cerrado el correo.

## Pendientes que no se pueden certificar desde el código

| Punto | Falta real |
|---|---|
| Mercado Pago | Access Token y Webhook Secret en servidor, cuenta receptora/precios verificados y circuito con cuentas de prueba del proveedor. No habilitado comercialmente. |
| Correo | Proveedor y dominio/remitente verificados, secretos, SMTP, programador y recepción real. |
| CAPTCHA | Sitekey y secreto Turnstile del titular, integración de login/registro/recuperación y activación del control en Auth. No basta activar el servidor sin preparar todos los formularios. |
| Contraseñas filtradas | Sigue deshabilitada la protección del servidor; revisar disponibilidad y activar en Auth. |
| Analítica | Habilitar y comprobar recepción de Web Analytics; revisar privacidad. Preparada pero apagada. |
| Legales | Identidad legal/CUIT/domicilio, contacto de privacidad, retención y revisión del borrador. No se inventaron datos. |
| Teléfonos físicos | Arranque instalado, rotación/scroll, registro/correo/retorno y compartir PDF/DOCX en iPhone y Android. |

La implementación y las pruebas simuladas no habilitan cobros ni garantizan entrega de emails. Estado anterior detallado en `checkout-resiliente-6.33.md` y `cierre-pendientes-6.32.md`.

## Referencias de implementación

- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://supabase.com/docs/guides/functions/schedule-functions
