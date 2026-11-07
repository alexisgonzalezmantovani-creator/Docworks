# DocWorks 6.38 · ayuda para completar operaciones

Base: 6.37. Implementa las cuatro mejoras propuestas sin modificar los permisos del servidor ni la validación de exportación.

## Comportamiento

- Cada paso muestra cuántos campos críticos requieren revisión. El cálculo funciona desde la creación; los números de la barra usan el mismo listado de campos e inconsistencias del formulario, con deduplicación por campo. Los errores rojos siguen apareciendo al editar/revisar, conservando una señal discreta al comenzar.
- Al avanzar con faltantes, mediante Siguiente o la barra, aparece un aviso dentro del formulario. Completar datos enfoca el primero; Seguir igual permite avanzar. Volver no pide confirmación. Guardar y el autoguardado de borradores permanecen disponibles. Editar un dato descarta una decisión de avance anterior.
- El indicador PDF/Word genera el documento en memoria con perfil, cláusulas, cuerpo del modelo y snapshot según la lógica existente. Usa la misma validación de exportación. Errores o avisos mantienen la señal de revisión; el verde requiere ambas listas vacías. Abrir el indicador muestra los puntos pendientes. Informa completitud técnica y conserva la revisión del contenido antes de emitir.
- Reutilizar datos de otra operación es una herramienta desplegable. Usa el listado ya accesible en la cuenta, excluye la propia operación y descarta inmobiliarias distintas cuando el identificador está disponible. No consulta otro endpoint ni amplía permisos.
- Permite seleccionar inmueble o una parte y sus cotitulares. La parte de origen y su rol de destino se eligen explícitamente, con roles adecuados al documento. La inmobiliaria autorizada de una exclusividad no se trata como una persona reutilizable.
- Revisar copia no cambia datos. Reemplazar datos seleccionados requiere una segunda acción explícita y advierte qué se sustituirá. Cancelar conserva el formulario. Se copian sólo campos permitidos y se independizan los cotitulares; se conservan el ID actual, precio, fechas, estado, cláusulas, snapshot y relaciones.

## Verificación

- Diecinueve pruebas específicas de cálculo, avisos, guardado con faltantes, origen/destino, aislamiento por inmobiliaria conocida, copia independiente, cancelación, metadatos excluidos y validación de plantilla/texto sin resolver.
- Recorrido específico en Chromium y WebKit a 320×740, 390×844, 844×390 y 1440×1000: contador, aviso, botón de guardado habilitado, Seguir igual, copia confirmada, conservación de precio/ID, foco y ausencia de desborde horizontal.
- Los recorridos anteriores aceptan explícitamente el nuevo aviso cuando sus fixtures están incompletos. Se conservan las comprobaciones de los ocho documentos, conversiones, salida, guardado y reapertura.
- `npm run check` y `npm run audit:rpc`; compilación y pruebas completas en CI antes de publicar.

No se guardan operaciones de clientes, se envían correos ni se efectúan cobros como parte de estas pruebas. La emulación de navegador no certifica dispositivos físicos. Los bloqueos externos de correo, CAPTCHA y Mercado Pago conservan el estado documentado en 6.37.
