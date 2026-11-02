# DocWorks: revisión responsive aislada

Fecha: 2/11/2026. Base: 6.17 / `8b1fb66d684bac80e2c23a3114a77d25200b3f29`.
Se revisó la propuesta local de permisos; esta revisión no la publica ni aplica SQL.

## Entorno y alcance

Chromium real, con los componentes del proyecto y sus estilos móviles dentro
de un iframe de dimensiones controladas. Datos ficticios, usuario y servicios
simulados, sin conexión a la base real. La página de QA tiene CSP que limita
`connect-src` al origen local; las fuentes tipográficas pueden descargarse de Google.
No se enviaron documentos ni consultas a Gemini. No hubo cargos ni despliegues.

El constructor reproducible es `tests/preparar-qa-responsive.cjs`. Ejecutar
`node tests/preparar-qa-responsive.cjs /ruta/qa-local` genera un paquete estático
para servir únicamente en un entorno local aislado. No forma parte de la app
publicada ni debe conectarse a despliegues automáticos.

## Resultados observados

- Se abrieron las vistas previas de los ocho modelos a 390×844, 820×1180 y
  1180×820: 24 combinaciones. Los controles de cierre estuvieron visibles y
  ninguna medición registró ancho de contenido superior al contenedor de la
  vista previa. Se comprobó apertura/cierre mediante los controles de prueba.
- Los ocho modelos fueron Reserva de Compra, Boleto de Compraventa, Reserva de
  Alquiler, Contrato de Alquiler, Comodato, Autorización de Venta, Refuerzo de
  Reserva y Devolución de Reserva. No se modificaron sus textos.
- El listado a 390 px permitió contrastar los cinco roles: Dueño, Administrador
  y Asesor ofrecían edición; Vendedor y Solo lectura no la ofrecían. El menú
  de Solo lectura mostraba Compartir e Historial de acciones.
- Se inspeccionó visualmente el listado de tablet a 820 px. Se confirmó el rol
  Asesor con ocho acciones Editar en un listado de ocho operaciones ficticias.
  En la papelera de Solo lectura no aparecieron Restaurar, Eliminar ni Vaciar.
- El listado también se midió a 430 y 1440 px: contenido de 424 y 1434 px,
  respectivamente, sin desbordamiento horizontal global. Los resultados
  consolidados están en el JSON adjunto.
- El constructor pasó `node --check` y produjo el bundle local con esbuild.

Durante el armado inicial faltaba incluir `MOBILE_STABILITY_CSS` en el entorno
de prueba; se corrigió el constructor para usar los mismos estilos de la app.
Eso no fue una modificación del producto. Algunas mediciones tomadas durante
el cambio de rol no habían terminado de renderizar: no se usan esos conteos
transitorios como evidencia de permisos. Las 70 comprobaciones DOM anteriores
siguen siendo la matriz automatizada de comportamiento, con servicios simulados.

## Límites pendientes

Un iframe con ancho de teléfono no reproduce Safari/iOS, teclado táctil,
dispositivo físico, red móvil ni toda la navegación de la aplicación. El
constructor monta componentes concretos, no la sesión completa de producción.
No acredita guardados reales, conversiones con backend, Gemini, enlaces externos
de compartir ni validación jurídica del contenido de los modelos.

La consulta de entornos disponibles no encontró una rama aislada de Supabase
de Docworks. El otro proyecto de la cuenta no se usó. No se creó un entorno
con cargos. Siguen pendientes autenticación real y concurrencia entre sesiones
en Supabase/PostgreSQL 17.6 de prueba; PGlite de una conexión no las sustituye.
No se utilizaron cuentas o documentos reales para sortear esta limitación.

La base real continúa sin el parche propuesto de permisos. Antes de activarlo
se mantienen el control de deriva, validación aislada, migración versionada y
plan de reversión descritos en el informe principal.
