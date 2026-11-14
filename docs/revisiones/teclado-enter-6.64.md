# DocWorks 6.64 — tecla Enter para cargar operaciones

En **Nueva operación** y **Editar operación**, los campos de una sola línea muestran «Siguiente» en el teclado móvil cuando corresponde. Al pulsar Enter/Retorno se enfoca el campo visible y habilitado que sigue, sin enviar el formulario.

- Se conservan los espacios al escribir nombres y direcciones.
- Los campos multilínea (`textarea`) de inventario, observaciones y cláusulas mantienen Enter para crear renglones.
- Los selectores nativos y fechas conservan Enter para sus propias acciones; no se altera la selección de opciones.
- Se saltan campos ocultos, deshabilitados o de sólo lectura y se evita cerrar o guardar automáticamente la operación.
- En el último campo de una sola línea se indica «Listo» y Enter cierra el teclado, sin guardar ni cambiar de paso.
- Los campos de identificación, correos y teléfonos mantienen sus teclados correspondientes.
- El cambio sólo afecta a los campos visibles del paso actual. No afecta otros formularios, textos jurídicos ni datos guardados.

## Regresión
Se añade `tests/teclado-operaciones.cjs` con diez comprobaciones de enfoque, multilinea, teclas especiales, controles nativos y casos vacíos.

## Validación adicional pendiente
Confirmar en Safari físico que el teclado muestre «Siguiente» en los campos soportados. La etiqueta exacta del botón depende del teclado de iOS y de los tipos de entrada. Se conservan pruebas automáticas y el resto de la experiencia aun cuando el teclado nativo ignore `enterkeyhint`.