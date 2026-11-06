# Revisión integral · 6.27

Base publicada: `990467b` (6.26). Incluye también el pulido preparado en `f5610ca`.

## Correspondencia entre carga y documento

Se probaron los ocho tipos: reserva de compra, boleto, reserva de alquiler, contrato de locación, comodato, autorización de venta, refuerzo y devolución. Cada caso se genera con modelo base y con snapshot. Se comparan partes, inmueble, importes con centavos y fechas contra el documento estructurado, el texto extraído del PDF y el contenido XML de Word. Son 16 casos de documento y 32 archivos exportados, además de las pruebas de calendario y carga.

- No queda un vencimiento anterior al borrar inicio o plazo del alquiler.
- Plazos negativos, fraccionarios o fuera del rango del calendario no se truncan para inventar una fecha ni rompen el editor.
- Una cantidad borrada en reserva de alquiler se solicita completar: no se convierte silenciosamente en 24 meses.
- En comodato, las fechas cargadas determinan el texto efectivo del plazo cuando hay vencimiento; se conserva compatibilidad con operaciones históricas que sólo tienen un plazo escrito.
- La fecha del encabezado derivada de `created_at` se fija al calendario argentino. Una fecha explícita del documento sigue teniendo prioridad. Las fechas de calendario sin hora no se convierten mediante UTC.
- El saldo de compra usa centavos enteros para la resta; al borrar el precio se limpia el saldo anterior.
- Los antecedentes adicionales de un refuerzo no eliminan la identificación del inmueble. Se incorporan a la plantilla estándar; sólo se adapta automáticamente el bloque histórico que coincide exactamente con el estándar, sin sustituir bloques redactados por las inmobiliarias.

### Criterio de vencimiento conservado

Para alquiler/reserva de alquiler se mantiene el cálculo de la aplicación: sumar meses limitando el día al último del mes, sumar días adicionales y restar un día para el vencimiento inclusive. Por ejemplo, 01/04/2026 + 24 meses = 31/03/2028; con 10 días adicionales = 10/04/2028. Con esta convención, 31/01/2026 + un mes resulta 27/02/2026. Las pruebas verifican esa convención existente; no establecen una regla jurídica nueva.

## Cláusulas

44 comprobaciones técnicas de biblioteca/tipo de documento y generación. Se detectó una instrucción editorial dentro de una cláusula base activa. Se retiró exclusivamente la última frase instructiva cuando coincidía exactamente con el texto estándar original, conservando sus condiciones. La consulta previa encontró una coincidencia y la posterior confirmó cero coincidencias del texto antiguo. Las redacciones personalizadas no se actualizan por título.

La revisión previa a exportar avisa si una cláusula impresa conserva una instrucción editorial o si una autorización de venta arrastra una cláusula referida a la fecha de entrega del inmueble. No se certifica vigencia jurídica de textos personalizados.

## Scroll y guardado

El formulario no reserva el espacio de una barra inferior que está oculta. El indicador de disco está dentro de la fila de Siguiente, en un espacio estable, y sólo aparece en estado `saving`. No usa un portal ni posición fija. Los errores de guardado conservan un aviso visible. Se verificó la posición respecto al botón y el espacio restante de ambos recorridos de scroll. Pruebas específicas también a 844×390 en horizontal.

## Estadísticas con datos reales

Se agregó y aplicó `fn_super_metricas_uso()`, con autorización real mediante `fn_es_super_admin(auth.uid())`, sin ejecución anónima. Se verificaron la llamada de superadmin, el rechazo del usuario QA común y los conteos contra tablas reales, sin escribir operaciones de clientes.

El panel muestra por inmobiliaria operaciones nuevas de los últimos 30 días, borradores, cerradas, usuarios habilitados, ranking por tipo y última creación/edición. No cuenta papelera ni los dos IDs QA reservados. Los ingresos son pagos con estado `pagado`, separados por moneda. Usuario habilitado no significa usuario que inició sesión; los indicadores no miden descargas, visitas ni IA. Las tarjetas explican este alcance.

11 pruebas SQL locales de permisos, meses, monedas y aislamiento de agregados; 8 pruebas del componente y comprobaciones responsive. El asesor de seguridad mantiene las advertencias previas y agrega la advertencia genérica por una función SECURITY DEFINER ejecutable por authenticated. La función exige superadmin internamente; no se abrió acceso a usuarios comunes.

## Cobros con Mercado Pago

Se preparó el checkout alojado con suscripción `pending` sin plan de Mercado Pago asociado, incluyendo importe, moneda y recurrencia mensual desde el plan comercial guardado en la base. El flujo anterior mezclaba `pending` con un plan asociado; la documentación exige tarjeta/token para ese recorrido. DocWorks conserva su plan interno y no solicita datos de tarjeta.

Referencia: https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/subscription-no-associated-plan/pending-payments

Antes de crear una suscripción se exige también la configuración de la firma del webhook. Se retiraron selectores que sólo guardaban una preferencia local como si ya fuera el medio efectivo. El cliente elige el medio al confirmar en Mercado Pago.

Pendiente para cobros reales: configurar la firma en servidor/proveedor y verificar cuenta receptora, precios y recorrido completo con las cuentas de prueba del proveedor. No se hicieron cobros ni envíos de correo reales. La reutilización del pendiente y el bloqueo del navegador no resuelven la carrera entre dos primeras creaciones simultáneas en distintas instancias; la reserva/idempotencia de ese caso sigue pendiente. No anunciar facturación comercial como habilitada.

## Controles y límites

- Verificación general, TypeScript, SQL local y compilación aprobados; tras los ajustes finales se repitieron las pruebas afectadas y la compilación.
- Chromium: interfaz, salida/recuperación de operaciones, importes, arranque y pulido responsive; horizontal con comprobación del disco y fin del scroll.
- PDF inspeccionado también con renderizador MuPDF; el render Poppler de este entorno presenta sustitución de fuente distinta, sin alterar el contenido del archivo.
- La emulación no reemplaza una comprobación en Safari/iPhone instalado ni compartir/selector de archivos nativos.
- Quedan ocho contratos auxiliares del superadministrador ausentes del catálogo (pagos manuales, extensiones, titularidad, nota, archivo, límites y anuncios). `npm run audit:rpc` sigue señalándolos; esta entrega agrega estadísticas, no completa esas otras acciones.
