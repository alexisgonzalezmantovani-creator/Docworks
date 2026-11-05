# Auditoría previa al lanzamiento — 5 de noviembre de 2026

Base: DocWorks 6.24 publicada, commit `7dae667`. Cambios preparados en `work/auditoria-lanzamiento`. Esta revisión no publica cambios ni modifica datos de producción.

## Correcciones confirmadas

| Área | Problema reproducido | Resultado preparado |
| --- | --- | --- |
| Comisiones | El porcentaje sugerido podía perderse al cambiar a monto fijo; al volver se recuperaba un porcentaje anterior, distinto del importe editado. | Mantener el equivalente dentro de la misma moneda, conservar el cero y exigir ingresar un porcentaje si las monedas son distintas. No se inventa un tipo de cambio. |
| Comisión visible y documento | Un campo borrado podía volver a usar un porcentaje histórico al generar el documento. Los valores sugeridos del formulario tampoco quedaban siempre visibles. | Sugerencias visibles para operaciones nuevas, indicador de edición para distinguir un borrado intencional y conservación del cálculo histórico en registros anteriores sin ese indicador. |
| Precio y seña | La revisión general no detectaba una entrega mayor al precio cuando no se habían usado opciones avanzadas. | Señalar la inconsistencia en la seña, también fuera de las opciones avanzadas. Detectar anticipos negativos. |
| Fechas y plazos | Una fecha imposible podía normalizarse a otro día. Algunos plazos admitían negativos/fracciones que después se truncaban. | Fecha ISO estricta, años bisiestos correctos y revisión de cantidades enteras positivas/no negativas según el campo. |
| Comodato | El editor genera un plazo narrado, pero la validación esperaba un número y lo marcaba como faltante aun con fechas completas. | Aceptar el plazo generado y la compatibilidad de plazos anteriores; señalar vencimiento anterior o igual al inicio. |
| Cotitulares y contactos | Se podían omitir nombre/identificación de un cotitular y guardar correos con formato incorrecto sin que aparecieran en la revisión general. | Señalar cada dato en su parte/paso, con identificadores de campo para enfocarlo. El domicilio alternativo del cotitular sigue siendo opcional. |
| Campos condicionales | Elegir otro tipo de inmueble/índice/período podía dejar un detalle vacío; los datos de garantía no aparecían entre los faltantes específicos. | Exigir el detalle seleccionado. Para garantía estándar, señalar los datos que necesita su redacción. El texto personalizado de garantía conserva su alternativa. |
| Botones de revisión | Un campo dentro de un desplegable cerrado no se veía al pulsar el faltante. Garantía podía llevar al paso económico. | Abrir los desplegables padres antes de enfocar; garantía va a su propio paso. Agregar IDs faltantes para comisión, garante, aceptación y depósito. |
| Panel de aceptación | Reemplazar un plazo personalizado por 5 días podía cerrar el desplegable mientras se estaba editando. | Mantener el estado abierto/cerrado durante la edición; editar el vencimiento manual cambia a fecha fija para evitar una contradicción con el plazo en días. |
| Selecciones históricas | Día de pago 20 o vigencia 45 días podían quedar sin opción visible aunque el dato siguiera guardado. | Mantener visibles los valores históricos válidos. |
| Atajos de refuerzo/devolución | Al elegir una reserva desde el formulario no se conservaban todos los cotitulares y controles de contacto. | Reutilizar la copia compartida de datos y conservar contactos, cotitulares y visibilidad. |
| Filtros y estadísticas | Algunas sumas/filtros usaban parseFloat/Number con montos anteriores que incluían puntos de miles. | Usar el parser monetario común. Los filtros distinguen el canon de alquiler del precio de compra. |
| Accesibilidad | Etiquetas genéricas sin asociación al campo. | Asociar etiquetas e IDs de los controles que ya tienen identificador. |

## Cobertura y evidencia

- `tests/auditoria-formularios.cjs`: 141 comprobaciones nuevas; selección consistente en los ocho tipos, validaciones, cálculo histórico, cambio de modalidad, cero, monedas distintas, foco en desplegables, guardar desde los ocho formularios y atajos de documentos vinculados. Inspección adicional de 16 botones renderizados en los pasos.
- `tests/campos-operacion.cjs`: 84 comprobaciones de campos, contactos, monedas, conversiones y exportaciones PDF/DOCX.
- `tests/navegador.cjs`: 471 comprobaciones de editores/modelos, biblioteca, vista previa, configuración y sus controles en tamaños de iPhone/iPad/escritorio.
- `tests/salida-operacion-browser.cjs`: 310 comprobaciones de navegación, recuperación de borrador, errores/demoras de guardado, operaciones, visores, alquiler e inventario.
- `tests/importes-browser.cjs`: 47 comprobaciones de escritura, edición, pegado, separadores y comisiones.
- Inicio/ayuda: completar onboarding, crear primer documento, búsqueda y consulta en siete anchos. Landing: formulario y límites de pantalla en doce anchos y dos orientaciones.
- Revisión estática: 338 declaraciones de botones en App/Operaciones/Cláusulas/Primeros pasos. Las acciones están enlazadas; el botón sin onClick directo es un submit dentro de un formulario con onSubmit. Esto no sustituye probar cada efecto externo.
- Se ajustó la infraestructura de navegador para usar el ejecutable disponible y servir la fuente real; un fallo de instalación/lanzamiento de Chromium no se contabiliza como fallo del producto.

## Alcance de las pruebas y revisión pendiente

Motor de navegador usado: Chromium. WebKit no está instalado en este entorno; no se certifica compatibilidad con Safari a partir de estas pruebas.

Los formularios, componentes y generadores son reales. Para no crear documentos, usuarios ni cobros en producción, los guardados de estas pruebas usan transporte simulado y las pruebas de permisos/base de datos usan PostgreSQL local en memoria. No constituyen una comprobación completa de los servicios externos.

| Recorrido | Estado |
| --- | --- |
| Campos y guardar de los ocho tipos; PDF/DOCX; navegación y recuperación | Verificados en entorno de prueba |
| Errores/demoras y doble acción de guardado; roles y aislamiento | Pruebas automatizadas locales |
| Persistencia real y visibilidad entre dueño/broker tras cerrar sesión y entrar | Pendiente de prueba con cuentas separadas en entorno de prueba |
| iPhone físico, app desde ícono instalado, arranque en frío, rotación, teclado, volver del segundo plano | Pendiente; los tamaños emulados no reproducen completamente estos casos |
| Compartir/descargar/seleccionar archivos con interfaces nativas de iOS | Pendiente en dispositivo físico |
| Mercado Pago, confirmación de pago/webhook y activación del plan | Pendiente de recorrido de prueba del proveedor; no se hicieron cobros |
| Invitaciones y recuperación de contraseña recibidas por correo | Pendiente de entrega real en cuentas de prueba |

No se certifica que todos los botones funcionen sin excepción por haber comprobado sus enlaces o por pasar pruebas locales. Los casos externos y los reportes de arranque/fondo en PWA de iPhone siguen abiertos hasta verificarlos en su entorno.

## Cierre de esta entrega

Aprobados `npm run check` (TypeScript, toda la suite funcional, 113 verificaciones SQL más pruebas de biblioteca base/compartida y compilación) y `npm run test:browser` completo. El bloque nuevo de auditoría aporta 141 comprobaciones. Navegador: 471 + 310 + 47 comprobaciones en los tres bloques principales, además de las pruebas de landing e inicio/soporte indicadas arriba.

La compilación mantiene el aviso existente de chunks JavaScript de más de 500 kB; no es un error de compilación ni una medición del arranque real en iOS. El arranque y las interfaces nativas del iPhone siguen en la lista de verificación física.

Cambios guardados para el siguiente lote. No se publicó esta auditoría ni se modificaron cuentas/documentos/cobros de producción.

## Publicación 6.25

El usuario autorizó publicar todo el lote. Se publica conjuntamente la auditoría y sus correcciones como versión 6.25. Los pendientes de iPhone físico y servicios externos conservan su estado. No se aplican migraciones ni se modifican datos de producción.
