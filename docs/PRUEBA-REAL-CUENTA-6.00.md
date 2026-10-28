# DocWorks 6.00 PRO — prueba de la cuenta desde la vista previa

El 28 de octubre de 2026 se completó el inicio de sesión normal de Vercel y luego el de DocWorks mediante el formulario seguro del navegador. Se observó la aplicación v6.00 con la cuenta autenticada y sus operaciones existentes. No se recopilaron contraseñas, cookies ni tokens en el repositorio o en este informe.

## Resultados observados

- La candidata carga el panel de operaciones y los modelos guardados de la inmobiliaria.
- Se abrió un borrador nuevo de Reserva sin guardar. Al insertar el chip Comprador se incorporó una sola variable y el chip dejó de ofrecerse.
- Salir hacia Operaciones mostró la confirmación de descarte. Cancelar mantuvo el texto del borrador y la variable insertada.
- Repetir la salida y confirmar descartó el borrador y permitió volver a Operaciones.
- Tras recargar la aplicación se conservó la sesión. Al volver a configurar documentos, Reserva mantuvo sus 18 cláusulas guardadas y no reapareció la cláusula 19 del borrador descartado.
- Se abrieron las vistas previas con datos ficticios de los ocho modelos guardados: Reserva (18 cláusulas), Boleto (10), Reserva de alquiler (8), Alquiler (15), Comodato (10), Exclusividad (7), Refuerzo (5) y Devolución (6). Todas mostraron la vista previa y no dejaron un editor abierto.

No se pulsaron Guardar cláusula, Publicar para asesores, Restaurar ni Eliminar. No se editaron operaciones. Se descartó el único borrador de prueba.

## Corrección encontrada al probar la cuenta

Había tres etiquetas repetidas de chips: Reserva alquiler, Valor del alquiler mensual y Motivo devolución. Los identificadores subyacentes eran distintos, por lo que ocultar duplicados por identificador no resolvía la ambigüedad visual. Ahora los rótulos diferencian importe numérico e importe en letras, y motivo cargado frente a motivo con texto de respaldo. Se conservan todos los identificadores para compatibilidad con modelos guardados.

Las pruebas de interacción comprueban que las etiquetas sean únicas y que ambos chips de reserva inserten sus variables correspondientes. La suite de navegador verifica también las etiquetas y la ausencia de desbordamiento mientras se muestran los chips en los ocho modelos y tres tamaños.

La revisión pasó TypeScript, integración y compilación Vite; 78 controles documentales, 92 de interacción y 14 de transición de sesión; 171 verificaciones en Chromium y 171 en WebKit. Resultados en los logs de esta revisión, con sufijo `cuenta-real-6.00.log`. Las pruebas automatizadas de editores siguen usando datos ficticios y callbacks simulados: los resultados observados en la cuenta real son los descritos arriba.

## Qué sigue pendiente

Esto confirma lectura, recarga y descarte con una cuenta Auth real; no prueba escritura entre dos cuentas. Para probar ese caso se necesita una inmobiliaria de prueba y dos cuentas de prueba con los roles que se quieran verificar. La vista previa usa la misma base de datos configurada para la aplicación: una escritura sobre modelos de una inmobiliaria activa no queda aislada por tratarse de una URL de preview.

También permanecen pendientes hardware iPhone/iPad con impresión/compartir y Microsoft Word real. Mantener la candidata sin pasar a producción hasta cerrar estos puntos.
