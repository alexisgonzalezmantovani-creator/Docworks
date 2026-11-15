# DocWorks 6.66 — continuidad del teclado en operaciones

Ajuste puntual sobre la navegación por campos iniciada en 6.64, sin añadir pasos ni botones nuevos.

- **Siguiente** no enfoca campos dentro de un grupo deshabilitado (por ejemplo, un `fieldset disabled`).
- Se ignoran los controles de secciones marcadas `aria-disabled`, además de los campos ocultos, bloqueados o de solo lectura.
- Los campos que tienen sugerencias nativas con `datalist` mantienen el comportamiento de Enter para aceptar una sugerencia; no se fuerza el salto al campo siguiente.
- Los espacios, fechas y campos de texto largo conservan el comportamiento actual.
- Se agregaron cuatro pruebas de regresión a `tests/teclado-operaciones.cjs`.

Sin cambios en operaciones guardadas, cláusulas, permisos, exportaciones PDF/DOCX, base de datos ni diseño de botones de iPhone.

La verificación real de la etiqueta del teclado en Safari físico sigue siendo necesaria porque iOS controla la presentación de `enterkeyhint`.
