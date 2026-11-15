# DocWorks v6.72 — protección de chips en ajustes manuales

La prueba de regresión v6.71 detectó que la validación de chips usaba una expresión regular incorrecta (barras invertidas duplicadas). Por ese motivo, la comprobación de no eliminar/reordenar tokens devolvía listas vacías.

## Corrección
- Se definió una única comprobación compartida: `conservaChipsAjuste`. Valida la secuencia de campos protegidos, incluidas cantidades y orden.
- El editor de ajustes la aplica antes de guardar. También rechaza escribir manualmente aperturas/cierres de tokens (`{{` y `}}`) dentro de los fragmentos.
- El generador de documentos vuelve a aplicar la misma validación antes de incluir un ajuste. Incluso una operación alterada no puede quitar un dato protegido del texto.
- Los tokens legacy del precio `[precio en letras]` se convierten a su forma canónica antes de comparar, sin modificar el snapshot original.

## Pruebas agregadas
`tests/documentos.cjs` verifica el chip conservado, eliminado, cambiado, adicional, reordenado y el marcador legacy. También prueba la generación real de la reserva con ajuste válido e inválido.

No hay cambios al layout de v6.70, contratos guardados ni otros datos de operación.
