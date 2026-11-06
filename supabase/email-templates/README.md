# Configuración pendiente del correo de Auth

La plantilla `confirm-signup.html` está preparada en español y con la marca. No se activó ni se modificó SMTP desde el repositorio.

Antes de enviar tráfico:

1. Verificar un dominio/remitente de DocWorks en el proveedor elegido y configurar SPF/DKIM según las instrucciones vigentes de ese proveedor. Configurar SMTP en Supabase Auth desde el dashboard. Ingresar credenciales únicamente en el proveedor o dashboard, nunca en el código del navegador ni por chat.
2. Configurar nombre del remitente DocWorks y la dirección verificada. Aplicar la plantilla a confirmación de registro. Conservar el token oficial `{{ .ConfirmationURL }}`.
3. Verificar Site URL y redirects permitidos de Auth: la app productiva es `https://docworks-eight.vercel.app/`. Evitar destinos de desarrollo en correos productivos. El formulario público ya solicita explícitamente esa redirección.
4. Registrar una cuenta con un correo nuevo que pueda revisarse; observar llegada, spam, remitente, demora y URL final. Repetir en iPhone/Safari y Android. Registrar el resultado real: el test SQL de confirmación no verifica entrega de email.
5. Configurar límites de envío según el proveedor. Probar duplicado y reenvío sin revelar información privada y sin exceder cuotas.

La configuración de Turnstile requiere, por separado, el secreto en Supabase Auth y la sitekey de la interfaz. El campo trampa de los formularios es complementario; no reemplaza CAPTCHA validado por Auth. La protección de contraseñas filtradas figura deshabilitada en el asesor del proyecto y requiere revisar la configuración y disponibilidad en el plan contratado.
