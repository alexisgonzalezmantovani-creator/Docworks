# DocWorks 6.37 · cierre de interfaz y retorno de cuenta

Continúa 6.36. Se repasaron los pedidos de pasos 1/2/3, cláusulas, guardado junto a Siguiente, scroll, panel supremo, correo, CAPTCHA y web pública. Se conservan las exclusiones del usuario: conectar la cuenta de Mercado Pago más adelante; identidad legal, migración completa de IDs y mejoras que requieren otro plan quedan pendientes.

## Correcciones de este lote

- El contexto de cuenta y el resumen supremo se invalidan al cambiar usuario, cerrar sesión, reintentar la inicialización o desmontar. Una respuesta anterior no puede restablecer datos o permisos de interfaz de otra sesión. También se evita la consulta de respaldo si el error pertenece a una sesión anterior.
- La recuperación inicial de sesión no puede sobrescribir un inicio de sesión más reciente. Se valida el usuario del contexto cacheado antes de mostrarlo.
- Los enlaces de correo vencidos/ya usados reciben un mensaje genérico en español, sin imprimir mensajes o parámetros arbitrarios del proveedor. Tras procesar el enlace se retiran tokens, códigos y errores del historial/URL; se conservan los parámetros propios de navegación. No se añade un flujo de verificación alternativo: Supabase Auth valida el enlace.
- El cierre de sesión limpia el modo de invitación/recuperación. Una respuesta tardía de cambio de contraseña no abre el contexto de otra cuenta.
- Galería de la web: capturas de los componentes actuales DashboardView, OperacionForm y DocumentViewer con datos ficticios. Sin usar datos de clientes ni crear operaciones. Se retiran instrucciones de carga de fotos e imágenes ilustrativas anteriores; los pies explican el carácter ficticio de los datos. Las capturas se regeneran con `npm run capture:gallery`.

## Pedidos anteriores contrastados

| Pedido | Implementación conservada y verificación |
|---|---|
| Scroll y disco junto a Siguiente | 6.27, pruebas de salida/formulario y orientación horizontal |
| Cargar, guardar, reabrir, editar y exportar los ocho tipos | 6.28–6.31, recorridos y contenido PDF/DOCX |
| Cláusulas y bibliotecas | Base compartida, textos personalizados/versiones conservados; 44 controles técnicos de consistencia |
| Panel supremo con datos reales | Métricas de uso y ocho acciones administrativas implementadas en backend; permisos y auditoría |
| Seguridad RPC | 6.35 aplicada, permisos y aislamiento por inmobiliaria, auditoría sin vaciado por roles de app |
| Móviles y acceso | 6.36, login/restablecimiento con scroll, 44 controles adicionales por motor |
| Analítica | Vercel Hobby habilitado, recepción de visitas reales comprobada en app y landing; no se anuncian eventos pagos |

Los informes 6.24–6.32 describen estados históricos; no se debe interpretar un pendiente allí como actual cuando una entrega posterior lo resuelve.

## Límites concretos que siguen abiertos

1. **Correo real:** elegir/verificar dominio y remitente, conectar SMTP de Auth y proveedor de recordatorios, configurar secretos/programador y comprobar recepción. Las plantillas, la cola y el procesador están preparados. No se enviaron mensajes reales en este lote.
2. **CAPTCHA real:** claves Turnstile del titular y activación en Supabase Auth después de publicar la configuración pública en ambos sitios. Se conserva apagado; una prueba con proveedor simulado no prueba la validación real.
3. **Dispositivo físico:** Safari/PWA instalada en iPhone, Android y hoja nativa de compartir PDF/Word. Chromium y WebKit en Linux son emulación.
4. **Mercado Pago:** cuenta receptora, secretos y circuito del proveedor. La preparación técnica no habilita cobros ni garantiza el circuito comercial.
5. **Datos legales y plan:** identidad/CUIT/contacto de privacidad, revisión jurídica y protección de contraseñas filtradas que requiere Pro. No se inventan datos ni se contrata un plan.
6. **IDs globales:** se conserva la limitación residual explicada en `seguridad-6.35.md`; su eliminación total requiere migrar relaciones/creación y queda fuera de este lote.

La búsqueda de conexiones adicionales para Cloudflare/Resend no encontró una integración disponible. El conector Supabase expone base y funciones, pero no SMTP/Auth ni gestión de secretos. No se sustituyen claves por valores de prueba en producción.

## Verificación

`npm run check`, `npm run audit:rpc`, Chromium y WebKit. Pruebas específicas en `tests/retorno-cuenta.cjs`: cambio de usuario, datos supremos tardíos, cierre de sesión, recuperación inicial tardía, suscripción anterior, enlaces vencidos y limpieza de URL. No requieren credenciales ni envían datos a servicios externos.

Las capturas de la galería proceden del navegador sobre componentes reales del repositorio; son material demostrativo con datos ficticios, no prueba de alta/correo/cobro ni un dispositivo físico.
