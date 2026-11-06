# Revisión 6.30 · títulos, contactos y aspecto del documento

## Implementado

- El encabezado inferior de una operación nueva identifica el documento seleccionado: nueva reserva de compra/alquiler, nuevo boleto, contrato de locación, comodato, autorización, refuerzo o devolución. Antes de elegir un documento conserva el título genérico. La ruta superior sigue indicando Operaciones / Nueva operación.
- Teléfono y correo tienen recuadros discretos independientes. Cada recuadro contiene su campo y su propio control de impresión. Incluye a los cotitulares y conserva los permisos independientes de cada contacto. En móvil el control queda debajo del campo y alineado a la izquierda dentro de su recuadro.
- Se eliminó la altura máxima y el scroll interno de Ajustes en aspecto del documento. La página conserva su desplazamiento general.
- La vista previa tiene mayor espacio horizontal y vertical, conservando el formato A4 y las proporciones del PDF. Se quitó la leyenda «Hoja A4 completa · proporciones reales. Datos de ejemplo». Se mantienen Vista previa y Ampliar.
- La hoja anterior permanece visible mientras se genera la siguiente. El visor reutiliza un worker PDF, omite regeneraciones por metadatos ajenos al aspecto y agrupa cambios rápidos. Una solicitud anterior no puede reemplazar la versión más reciente. Conserva la página seleccionada si todavía existe en el PDF nuevo.
- El indicador de actualización es pequeño y no reemplaza toda la hoja. El error de generación conserva la hoja previa y permite reintentar. Se liberan documentos retirados después de dibujar su reemplazo y todos los recursos al cerrar el visor.

## Verificación

- 84 comprobaciones de campos, monedas, conversiones y contactos.
- 60 comprobaciones Chromium de pulido en celular, horizontal y computadora, con inspección visual de los recuadros.
- 388 comprobaciones Chromium de salida y reserva de alquiler. Se inspeccionó el título «Nuevo contrato de locación» en la pantalla real del formulario de prueba.
- 471 comprobaciones Chromium de modelos, interfaz y aspecto del documento; incluye proporción A4, Ampliar, cerrar y ubicación en encabezado/pie.
- 48 comprobaciones específicas de vista previa fluida en 390×844, 844×390 y 1440×1000. Verifican que el canvas permanezca, que se reutilice el worker, que modificar metadatos no regenere el PDF, que un fallo permita reintentar y que una generación lenta obsoleta no reemplace la última hoja. También verifican ausencia de scroll interno en Ajustes y de desborde horizontal.
- Comprobación general mediante `npm run check`: TypeScript, pruebas de lógica/componentes, SQL local y compilación.

Los tamaños móviles se emulan en Chromium; no certifican Safari en un dispositivo físico. No se establece una mejora porcentual de tiempo: se verificaron las causas de trabajo repetido y la continuidad visual.

## Agendado, todavía sin aplicar

La reorganización de la cláusula de seguro, los rótulos de todas las partes y la eliminación de indicaciones repetidas se registran en `pendientes-seguro-y-rotulos.md`, según los pedidos posteriores de agendar. El envío automático de recordatorios por correo sigue pendiente de integración y configuración del remitente; no se activaron envíos.
