# Próximo lote: ajustes de iPhone

Estado: implementado y validado localmente. Publicación conjunta de la versión 6.23 autorizada; comprobación en un iPhone real pendiente.

- [x] **Operaciones: botón + visible al desplazarse.** Mantenerlo visible al bajar por la lista. Dentro del formulario de una operación debe continuar oculto.
- [x] **Volver a operaciones: encabezado.** Revisar el problema por el que la parte superior donde dice DocWorks queda colgada con la operación al regresar al listado.
- [x] **Guardado flotante.** En nueva operación, mostrar el disquito de guardado flotante y visible, sin tapar campos ni controles. Este pedido reemplaza la ubicación anterior al lado de Siguiente.
- [x] **Reserva: DNI/CUIT y textos auxiliares.** Corregir la superposición del campo de la parte derecha con el ejemplo inferior «20-1234…». Quitar las leyendas «Se detecta automáticamente» y «Dato interno de la operación».
- [x] **Cláusulas y documentos: botones.** El título Precio ya se lee bien; revisar la distribución y las dimensiones de los botones, incluidos subir y bajar, conservando el diseño de botones de la aplicación.
- [x] **Operaciones: vista de una sola fila sin desplazamiento horizontal.** En iPhone, la vista a lo largo (alternativa a la de renglón doble) debe entrar en el ancho de la pantalla. Priorizar menos información visible antes que obligar a desplazarse hacia los costados; mantener acceso al detalle al abrir la operación.

La revisión final debe cubrir el regreso al listado, el desplazamiento y los campos con teclado abierto. La comprobación en un iPhone real queda pendiente; las pruebas emuladas no la sustituyen.


## Implementación y validación

- Eliminada la ocultación del botón + por dirección del desplazamiento; se conserva la ocultación dentro del formulario.
- Al alternar entre formulario y listado se desenfoca el campo activo y se reinicia el desplazamiento después de liberar el diálogo. La restauración de scroll de los diálogos es inmediata, evitando una animación de desplazamiento que compita con la navegación.
- Indicador de guardado persistente, con icono SVG, montado en un portal fijo fuera de los contenedores del formulario. Ajusta su posición con Visual Viewport y no intercepta los toques. Incluye espacio inferior para alcanzar las últimas acciones del formulario.
- DNI/CUIT deja de usar chips con posición absoluta. Se retiraron los textos auxiliares pedidos también en los cotitulares.
- Las acciones de cláusulas abiertas se distribuyen en una grilla móvil, con botones de 36 px de altura y flechas sin compresión.
- La tabla móvil conserva Estado, Operación y Abrir. Partes, monto, fecha y agente quedan disponibles al abrir la operación; la tabla de escritorio conserva sus columnas.

Comprobaciones aprobadas: TypeScript sin diagnósticos, suite funcional `npm test`, compilación de producción, 194 comprobaciones de navegación/formulario/listado en navegador emulado (320, 390, 430, 820 y 1440 px) y 471 comprobaciones existentes de cláusulas/documentos en iPhone, iPad y escritorio emulados. No hubo cambios en la base de datos. La publicación reúne los seis cambios en la versión 6.23.
