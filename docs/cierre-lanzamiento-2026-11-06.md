# Cierre de lanzamiento · DocWorks

Base: producción 6.25, commit `8f4733ba211a44086d04c2b56ef35a7f81cc02fa`.
Esta tanda está preparada en `work/cierre-lanzamiento`; no publicada. No certifica que la app completa esté lista para lanzamiento.

## Correcciones preparadas

- Pagos: se corrige el Bearer mal interpretado y la validación del administrador con ID nulo. El usuario se verifica con Auth antes de consultar permisos. Importe y membresía vienen de la base, no del navegador.
- Notificaciones: firma HMAC obligatoria, ID firmado coherente con el recurso consultado, referencia de inmobiliaria verificada. La firma faltante deja de aceptarse; sin secreto configurado el endpoint falla de forma cerrada.
- Cobros: `payment.status` determina si está aprobado; `scheduled` por sí solo no es un pago. Upsert sobre el identificador único evita filas duplicadas por reintentos. Las respuestas no exponen cuerpos privados de proveedores.
- Checkout: bloqueo de doble clic, reutilización del pendiente conocido, rechazo si ya existe una suscripción activa y restricción a dominios de Mercado Pago. Abrir un checkout no cambia el plan de la membresía. Un cambio de plan requiere un recorrido independiente.
- Facturación: la sincronización debe persistir antes de anunciar éxito; una respuesta tardía al salir o cambiar de contexto no actualiza ni redirige. Se retira la simulación de tarjeta del superadministrador.
- Cuentas: recuperación con Supabase Auth, validación de email y bloqueo de solicitudes simultáneas. El acceso se copia para compartir; no se anuncia una invitación enviada automáticamente.
- Inicio: fondo inicial oscuro incluso sin CSS externo; opción de reintentar si el módulo falla o sigue sin arrancar tras 20 segundos. Se añade el service worker que antes devolvía 404 y una pantalla de desconexión. Sólo se cachea esa pantalla; no documentos, API, sesiones ni la aplicación. No se borran borradores ni se recarga un formulario activo automáticamente.

## Verificación ejecutada

- 38 pruebas de manejadores de pagos con proveedores simulados, sin tráfico externo ni cobros.
- 11 pruebas de facturación y 8 de acceso, sin envíos reales.
- Batería Chromium aprobada: 471 comprobaciones de interfaz, 310 de salida de operaciones y reserva de alquiler, 47 de importes/comisiones, más los recorridos responsive de landing e inicio. Emulación de dispositivos, sin certificar iOS físico.
- 12 pruebas Chromium del arranque real, service worker, reintento, desconexión y recuperación. Anchos 390×844, 844×390 y 1440×1000, sin desborde. Se conserva el borrador local ficticio al volver a conectar.
- Base real: prueba transaccional con cuentas QA existentes. Dueño crea y actualiza operación conservando importe; broker asignado la consulta; brokers de la misma inmobiliaria ven la cláusula compartida; otra inmobiliaria no puede verla ni sobrescribir la operación. `ROLLBACK` final confirmado con cero operaciones/cláusulas de esa prueba persistidas. No prueba el recorrido completo de login del navegador.
- Verificación general: `npm run check` aprobado (TypeScript, pruebas de aplicación, SQL en memoria y compilación). La auditoría del catálogo tiene un comando separado: `npm run audit:rpc`; debe seguir fallando mientras existan funciones referenciadas ausentes.

## Bloqueos detectados

### Backend de superadministración

El catálogo real de `public.pg_proc` no incluye nueve funciones referenciadas por la aplicación:

| Función | Funcionalidad pendiente |
|---|---|
| `fn_super_metricas_uso` | Métricas de uso |
| `fn_super_registrar_pago` | Registro manual de pagos |
| `fn_super_extender_membresia` | Extensiones y prueba gratis |
| `fn_super_transferir_dueno` | Transferencia de titularidad |
| `fn_super_nota_inmobiliaria` | Nota privada |
| `fn_super_archivar_inmobiliaria` | Archivo/reactivación |
| `fn_super_set_limites` | Excepción de límite de usuarios |
| `fn_super_set_anuncio` | Publicación de anuncio |
| `fn_super_get_anuncio_global` | Lectura del anuncio |

No basta con que las pruebas visuales usen respuestas simuladas: estos controles requieren implementación del backend, permisos y pruebas transaccionales antes de habilitar su uso comercial. El JSON de catálogo es una captura fechada, sólo valida nombres: no garantiza firmas ni permisos. Refrescarlo antes de publicar. No se modificó el esquema real para ocultar este faltante.

### Pagos de extremo a extremo

- Desplegar ambos manejadores conservando `verify_jwt=true` para suscripciones y `false` para webhook, que autentica mediante HMAC.
- Configurar en servidor `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `DOCWORKS_APP_URL`. No colocar secretos en el cliente.
- Probar el flujo real con cuentas de prueba de Mercado Pago: checkout, aprobación, rechazo, renovación, cancelación, reintento y actualización de la membresía. No se hicieron cobros reales.
- La activación se procesa por evento de suscripción o sincronización; el evento de factura registra el pago. Verificar orden y recuperación de eventos perdidos en el ensayo real.
- El bloqueo del navegador y la reutilización del pendiente no resuelven dos primeras creaciones simultáneas en distintas instancias. Falta reserva/idempotencia del lado del servidor y recuperación si el proveedor crea una suscripción pero falla su persistencia local.

### Correo y dispositivo

- Probar entrega real de recuperación, redirección y cambio de contraseña. Se verificó el código con SDK simulado; no se enviaron mensajes ni se certificó la configuración SMTP.
- Validar en iPhone instalado: arranque en frío, rotación/scroll, salida del formulario, picker de archivos y compartir PDF/DOCX. Las pruebas Chromium no reemplazan Safari/iOS real.
- WebKit descargado, pero no ejecutable en este entorno por bibliotecas del sistema faltantes; no reportar Safari como aprobado.

## Orden de cierre

1. Completar y probar los nueve contratos del superadministrador con permisos y datos reales revertidos.
2. Resolver la reserva de checkout entre instancias, desplegar el backend y ensayar Mercado Pago en modo prueba.
3. Validar correo y recorridos nativos de iPhone.
4. Publicación conjunta, comprobación de versión y regresión breve en producción.
