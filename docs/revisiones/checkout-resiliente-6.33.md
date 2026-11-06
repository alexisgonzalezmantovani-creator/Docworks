# DocWorks 6.33 · checkout exclusivo y recuperable

Continúa el cierre 6.32. No se hicieron cobros ni llamadas reales a Mercado Pago.

- El servidor reserva el checkout en Postgres antes de llamar al proveedor. El bloqueo de la membresía y una reserva persistente permiten que sólo una instancia reciba autorización de creación.
- Si se pierde la respuesta de creación o falla el guardado, el reintento busca por correo y compara la referencia exacta, ID, importe y moneda. Consulta el detalle de la suscripción encontrada antes de asociarla. Nunca repite el POST ambiguo automáticamente.
- Si no hay una coincidencia única, la operación queda en verificación y solicita sincronizar/soporte; no caduca la reserva para arriesgar un segundo débito. Un checkout que nunca llegó a crearse puede necesitar revisión y liberación administrativa después de comprobarlo en el proveedor. No existe liberación pública automática.
- La finalización comprueba que membresía, plan y reserva no cambiaron. Persiste el identificador antes de devolver éxito. Una solicitud con una lectura vieja de la membresía se rechaza.
- Las dos RPC son sólo para `service_role`; ni usuarios autenticados ni anónimos pueden ejecutarlas. La tabla es privada, con RLS y sin concesiones directas a clientes.
- La sincronización y el webhook retiran `es_prueba` al confirmar una suscripción activa. Un cliente que ya pagó no sigue sujeto al vencimiento de la prueba.

Verificación: 38 pruebas anteriores de pagos/firmas, 13 comprobaciones nuevas de concurrencia y recuperación con proveedores simulados, 10 comprobaciones SQL locales. Prueba transaccional en Supabase real exclusivamente con la membresía QA reservada: reservar dos veces, comprobar exclusividad y finalizar dos veces; todo revertido. Verificación posterior: cero intentos QA persistidos, ejecución permitida sólo a service_role. TypeScript y batería general/build antes del despliegue.

Referencia API: https://www.mercadopago.com.ar/developers/es/reference/online-payments/subscriptions/search-preapproval/get

## Pendientes de lanzamiento actualizados

La carrera de creación y la recuperación tras guardado fallido de 6.32 quedan resueltas en código y pruebas. Siguen pendientes la firma/configuración de Mercado Pago y el ensayo integral con cuentas de prueba del proveedor; correo propio y recordatorios; CAPTCHA/protección de contraseñas; activación de analítica; términos/privacidad completos y prueba física de iPhone/Android. No anunciar cobros comerciales o recordatorios por correo como habilitados.
