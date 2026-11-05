# DocWorks 6.22: checklist de 12 mejoras

Estado: los 12 puntos están implementados y verificados para distribuir juntos en la versión 6.22.
Base publicada: 6.21, commit 924d15a5e02a71076d9170ff5ab45308500e4269.

1. [x] Salir de una operación y regresar a Operaciones: unificar navegación, proteger el borrador y permitir conservarlo localmente aunque la red no responda. Evitar dobles guardados y respuestas tardías que cierren otra carga.
2. [x] Período de pago mensual del 1 al 10 o del 1 al 5, conservando días puntuales; disponible en reserva de alquiler y contrato, con traslado al documento y a la conversión.
3. [x] Ocultar el botón flotante + durante la creación o edición.
4. [x] Permitir borrar el cero de Días adicionales, escribir 10 y conservar el cálculo de 24 meses y 10 días. Normalizar 010 al abandonar el campo.
5. [x] Ocultar la barra inferior durante la carga, manteniendo Volver a operaciones accesible y recuperando la navegación al salir.
6. [x] Acceso al asistente IA dentro de Ayuda en escritorio y teléfonos, retirando el botón flotante de IA.
7. [x] Indicador de guardado junto a Siguiente/Revisar, más visible y en la misma fila.
8. [x] Tipografía elegida: opción 2, DM Sans con un punto más. Texto general de 14 a 15 px y etiquetas con +1 px. Conservar diseño, tamaños y colores de los botones de la app; los del ejemplo no se aplican. Fuente DM Sans local para su carga sin depender de Google Fonts.
9. [x] Agregar documento en iPhone: montar el diálogo fuera de la lista desplazada y por encima de la barra superior, con cierre y creación accesibles.
10. [x] Editar al abrir un documento en iPhone: separar el título y las acciones del visor en dos filas, mostrar las etiquetas completas y mantener los controles accesibles sin comprimirlos.

11. [x] Corregir la cláusula Precio abierta en móvil: reservar ancho para el título, pasar las acciones a otra fila y evitar que Subir/Bajar se compriman.

12. [x] Aviso visible de responsabilidad de la inmobiliaria por las cláusulas que redacte o modifique, tanto en la biblioteca como en la edición de modelos y cláusulas propias de una operación. Reflejar el alcance en los términos, conservando las responsabilidades legales exigibles. No insertar este aviso en los contratos de las partes.

Los cambios de interfaz y los términos se distribuyen desde el mismo commit de entrega.
Verificación realizada: TypeScript, compilación, suite de pruebas, pagos en modelos históricos y snapshots con PDF/DOCX, 120 comprobaciones del flujo de salida/documentos y acciones del visor y 471 comprobaciones generales en Chromium con tamaños de teléfono, tablet y escritorio. Queda pendiente validar Safari o PWA en un iPhone real.
