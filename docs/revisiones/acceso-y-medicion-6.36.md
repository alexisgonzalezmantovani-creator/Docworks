# DocWorks 6.36 · acceso y medición

Alcance pedido: correo, CAPTCHA, pruebas móviles y analítica. Mercado Pago conserva la implementación y las pruebas previas; cuenta receptora y validación comercial quedan para después. No se habilitan cobros ni se compran servicios.

## Implementación

- Turnstile preparado en registro de app y landing, login, recuperación, reset del panel supremo y verificación de contraseña actual al cambiarla desde el perfil. Se solicita un token nuevo inmediatamente antes de cada petición a Auth; no se guarda ni se reutiliza. Cancelación, error, expiración o configuración inválida impiden la petición. El servidor debe validar el token: la interfaz sola no constituye protección.
- La landing usa el mismo código de CAPTCHA compilado desde `src/Captcha.ts`; `scripts/preparar-acceso.cjs` actualiza los archivos estáticos y copia su configuración pública. El secreto jamás se coloca allí. CAPTCHA permanece apagado hasta disponer de claves reales y activar Auth en orden.
- Login y restablecimiento de contraseña accesibles con scroll en horizontal y pantallas chicas, logo contenido y campo email a 16px para evitar zoom de foco de iOS.
- Web Analytics Hobby habilitado en ambos proyectos Vercel, incluido en el plan, sin eventos personalizados pagos. App con paquete oficial fijado; landing con script oficial. Se eliminan query/hash de visitas y en la app sólo se manda `/`, sin IDs de operaciones. No se instrumentan datos de formularios ni documentos. Los registros confirmados y el uso por inmobiliaria se obtienen de los datos reales del panel supremo, no se confunden con intentos de registro de la web.

## Activación pendiente: CAPTCHA

1. En Cloudflare Turnstile crear un widget para `docworks-eight.vercel.app` y `docworks-landing.vercel.app` (más el dominio propio cuando exista). No autorizar todos los previews ni usar claves de prueba en producción.
2. Publicar `public/captcha-config.js` con `enabled:true` y la **sitekey pública** real. El prebuild sincroniza la landing; si se publica la landing estática por separado, incluir los dos archivos `captcha*.js` actualizados.
3. Comprobar que ambos sitios muestran el widget. Después configurar el **secreto** en Supabase Auth → Bot and Abuse Protection, elegir Turnstile y habilitar la validación. Así no se bloquean todos los accesos antes de publicar la interfaz.
4. Probar alta, login, recuperación, reset administrativo y cambio de contraseña con un destinatario de prueba autorizado. Verificar que solicitudes sin token o con token consumido sean rechazadas por Auth. Las pruebas simuladas del repositorio no certifican este paso.
5. Si se retira la protección, deshabilitar primero la exigencia en Auth antes de retirar el widget. No quitarla como solución a un fallo de red.

## Activación pendiente: correo

La cola y el procesador seguro de recordatorios de 6.34 siguen disponibles, apagados. Las plantillas de confirmación y recuperación ya están preparadas. No se configuró un proveedor ni un remitente inventado.

1. Elegir un dominio/remitente de DocWorks y verificarlo con SPF/DKIM en el proveedor. El adaptador de recordatorios actual usa Resend; SMTP de Auth se configura aparte, aunque puede usar el mismo proveedor.
2. Supabase Auth → SMTP: remitente verificado, nombre DocWorks y credenciales SMTP del proveedor, sólo en el panel. Site URL `https://docworks-eight.vercel.app/`; permitir esa URL de retorno. Aplicar `supabase/email-templates/confirm-signup.html` y `recover-password.html`, conservando `{{ .ConfirmationURL }}`. No imprimir credenciales ni guardarlas en git.
3. Edge Functions: configurar `RESEND_API_KEY`, `DOCWORKS_EMAIL_FROM`, `DOCWORKS_REMINDERS_SECRET` aleatorio de al menos 32 caracteres y `DOCWORKS_REMINDERS_ENABLED=true`. Configurar el programador autenticado descrito en `entrega-6.34.md`; mantener apagada `docworks_private.correo_config.habilitado` hasta comprobar entrega real.
4. Con email de prueba autorizado: comprobar bandeja y spam, nombre/remitente, enlace de un solo uso, vencimiento, retorno a la app, cancelación de recordatorio y ausencia de duplicados. Registrar aceptación por el proveedor y recepción como estados distintos. Habilitar la cola sólo después de completar esa prueba.

El dashboard de Supabase requirió iniciar sesión; el conector disponible no expone configuración SMTP/Auth ni secretos. No se simuló configuración exitosa ni se enviaron correos reales.

## Verificación física pendiente

Las pruebas de Chromium/WebKit usan datos ficticios y proveedor de CAPTCHA simulado. No equivalen a iPhone/Android físicos ni a recepción de correo.

| Recorrido | iPhone/Safari + instalada | Android/Chrome + instalada |
|---|---|---|
| Alta → recibir email → verificar → primer ingreso | Pendiente | Pendiente |
| Recuperar contraseña → email → retorno a app | Pendiente | Pendiente |
| CAPTCHA real, cancelar, reintentar y expiración | Pendiente | Pendiente |
| Nueva operación pasos 1/2/3 → guardar → reabrir | Pendiente | Pendiente |
| Rotar en cada paso, scroll y teclado con botones visibles | Pendiente | Pendiente |
| Vista previa, compartir PDF y DOCX con nombres correctos | Pendiente | Pendiente |
| Inicio instalado, offline/reconexión sin perder borrador | Pendiente | Pendiente |

No se debe marcar una fila como aprobada hasta observar ese resultado en el dispositivo indicado.

## Fuentes técnicas

- https://supabase.com/docs/guides/auth/auth-captcha
- https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- https://vercel.com/docs/analytics/quickstart
- https://vercel.com/docs/analytics/using-web-analytics

Los datos legales, la migración de IDs y la protección de contraseñas filtradas del plan Pro quedan fuera de este lote, según lo pedido.
