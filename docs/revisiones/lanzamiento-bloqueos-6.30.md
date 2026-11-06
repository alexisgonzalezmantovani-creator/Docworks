# Antes de mandar tráfico · estado de revisión 6.30

## Comprobado en producción, con rollback

El formulario actual usa Supabase Auth signup con `docworks_registro=trial_month_v1`. El trigger privado `confirmar_prueba` llama a `provisionar_prueba` cuando el email queda confirmado. Las RPC antiguas de solicitudes no intervienen en ese camino. La prueba real de base confirma creación de dueño e inmobiliaria, mes desde confirmación, idempotencia, aislamiento, respeto a invitaciones, imposibilidad del cliente de extender su membresía y bloqueo de escritura al vencer con conservación de datos. No se enviaron correos en esta prueba: se simularon la creación y confirmación dentro de una transacción de la base. No equivale a una entrega real en una bandeja de entrada.

## Corregido o preparado en código

- Retirada nota editorial de Planes y frase «sin esperar una aprobación»; se explica confirmación del correo.
- FAQ con tono concreto. Se ajustó seguridad a roles y aislamiento y se acotó el historial: no todas las exportaciones tienen auditoría; sí se registran las confirmadas con faltantes. No se promete una certificación de seguridad.
- Íconos SVG en lugar de peón y símbolos de texto. Ejemplo con vendedor identificado y DNI pendiente resaltado en rojo.
- Botón visible Pedir una demo con enlace de WhatsApp a soporte.
- Imagen social PNG y etiquetas OG/Twitter, canonical, robots, sitemap y 404.
- Campo trampa complementario en ambos formularios. Mensajes de contraseña y red en español. La validación frontal de letras/números no sustituye la política de Auth del servidor.
- Cierre de prueba descrito sin prometer cobro ni contacto automático: vencimiento, bloqueo de escritura, conservación actual y consulta de plan.

## Bloqueos o comprobaciones pendientes

1. **Identidad legal, privacidad y abogado.** Borrador en `docs/legal/terminos-y-privacidad-borrador.md`. No se publica una política final con datos del responsable inventados ni se considera el aviso actual sobre modelos una política de privacidad completa.
2. **Correo de verificación.** Configurar/verificar SMTP propio, dominio y plantilla de marca; observar entrega y spam en una bandeja real, duplicados, demora y destino del link. No se verificó la entrega de correo real ni el SMTP configurado en el dashboard. La infraestructura de correos programados a brokers todavía no está conectada.
3. **CAPTCHA.** Configurar Turnstile y su secreto en Supabase Auth y sitekey en la interfaz. Un campo trampa no protege el endpoint público contra un bot que lo llame directamente.
4. **Contraseñas del servidor.** El asesor de Supabase informa protección contra contraseñas filtradas deshabilitada. La validación frontal no reemplaza este control.
5. **Analítica.** Activar/verificar Web Analytics en el proyecto y definir el embudo. Los eventos personalizados de Vercel requieren plan Pro o Enterprise según documentación consultada. No afirmar medición activa si no se verificó recepción de eventos. No se cambió el plan ni se contrató un servicio pago.
6. **Dispositivos reales.** La emulación Chromium no es una prueba física de iPhone/Safari o Android. Se requiere comprobar registro, correo, regreso a la app y primer documento en ambos.
7. **Revisión de seguridad adicional.** El asesor mantiene advertencias por funciones SECURITY DEFINER accesibles a authenticated; su mera existencia no demuestra una fuga, pero requieren autorización interna y pruebas por rol. No se revocan en bloque porque son las API de la app. La tabla super_admins tiene RLS sin políticas (no da acceso directo).

## Otros pedidos agendados

Seguro fuera de la selección inicial, títulos de las partes sin redundancia y recordatorios personales por correo: `pendientes-seguro-y-rotulos.md`.

La integración de medición queda preparada en `landing/analytics-config.js` y `landing/analytics.js`, deshabilitada hasta configurar el proyecto y revisar privacidad. `scriptPath` debe ser la ruta real provista por Vercel. Los eventos contemplados son CTA de prueba, demo, intento de registro y registro enviado; este último no significa correo verificado. La confirmación real se contrasta con la auditoría de provisión en la base. Los eventos no incluyen datos del formulario.
