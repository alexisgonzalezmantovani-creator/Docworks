# Pulido de formularios sobre 6.26

Preparado en `work/pulido-formularios-626`, a partir de la versión publicada `990467b`. No publicado.

## Cambios

- Canon fijo: oculta el período de actualización y deja de pedir su detalle. Al volver a un índice se recuperan los valores anteriores.
- Seguro: si la cláusula está excluida, el plazo no se muestra ni se valida. Al incluirla vuelve a mostrarse y validarse, conservando el valor cargado.
- Depósito personalizado: la revisión del formulario identifica importes vacíos, cero y negativos ya almacenados en el campo correcto de Condiciones. Se conserva el criterio positivo que ya aplicaba la exportación, con un solo aviso en lugar de duplicarlo.
- Contactos, cotitulares y garantía: avisos junto al campo; asociación de errores mediante `aria-invalid` y `aria-describedby`; la etiqueta DNI/CUIT permite enfocar el campo. Los errores numéricos tienen una explicación junto al control.
- Los cambios de opción conservan los datos previamente cargados. Los switches de impresión de teléfono y correo mantienen su estado.

## Comprobaciones

- 25 pruebas de recorridos y validación con DOM simulado.
- 56 pruebas Chromium de los avisos y su disposición a 320, 390, 844 y 1440 píxeles de ancho, con los estilos de operación de la aplicación. Se comprueban desbordes, superposición entre contactos y switches, foco por etiqueta y eliminación de avisos después de corregir.
- Regresión general Chromium aprobada: 471 comprobaciones de interfaz, 310 de salida de operaciones, 47 de importes y 12 de arranque, además de los recorridos responsive y las 56 específicas.
- `npm run check`: TypeScript, pruebas de aplicación, SQL local y compilación aprobados. Tras el último ajuste de validación se repitieron las pruebas específicas y la compilación.
- No se modificó producción ni se usaron datos de clientes para esta tanda. La emulación Chromium no certifica Safari ni la app instalada en iPhone.
