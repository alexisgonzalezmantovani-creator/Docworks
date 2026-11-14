# DocWorks v6.56 — Cierre de interfaz y pruebas de regresión

## Cambios incluidos
1. Tarjetas de Operaciones: impedir que «Última actividad» y «Agente» reaparezcan como celdas ocultas en iPhone tras la distribución compacta de 6.55.
2. Mantener «Progreso» arriba y el conjunto Documento / Abrir / Editar / ⋯ proporcionado en móvil, sin sombras excesivas.
3. Pruebas de navegador actualizadas para columnas responsivas sin depender del antiguo rectángulo `op-card-side`.
4. Cubrir iPhone de 320, 375, 390 y 430 px, una orientación horizontal, tablet y escritorio.
5. Verificar que los botones no se superponen ni salen de la tarjeta y que el menú contextual entra en pantalla.
6. Proteger los cambios sin guardar al editar cláusulas adicionales antes de cambiar de documento o de sección.
7. Impedir cambios de pantalla durante el guardado de una cláusula y limpiar búsquedas/ediciones transitorias al cambiar de documento.
8. Añadir prueba de confirmación/cancelación al abandonar una cláusula adicional editada.
9. Hacer accesibles mediante teclado y lectores de pantalla los filtros de búsqueda, categoría y «Solo personalizadas».
10. Ampliar la comprobación de cláusulas adicionales en PDF y Word a los ocho tipos de documentos.

## Alcance y límites
- No se modificó el texto jurídico de modelos, reservas, boletos ni alquileres.
- No se borraron cláusulas, plantillas ni operaciones anteriores; no se alteró la base de datos.
- El pipeline del repositorio ejecuta TypeScript, compilación, pruebas, Chromium y WebKit con cada actualización de main.
- La emulación no sustituye la comprobación física en Safari/iPhone; esta entrega no certifica la revisión legal ni el flujo comercial de cobros.
