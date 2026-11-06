# Recorridos completos 1, 2 y 3 · 6.28

Base: producción 6.27 (`af69a76`). Revisión del 6 de noviembre de 2026.

## Alcance y correcciones

1. **Reserva de compra → boleto.** Se conservan modo, monto, moneda, cero explícito, texto y preferencia de impresión de cada comisión. Partes, cotitulares, datos de contacto, barrio/UF y cláusula particular continúan en el documento vinculado. La fecha de posesión del boleto sigue pendiente de confirmación; la escribanía asignada se conserva.
2. **Reserva de alquiler → contrato de locación.** Se conservan plazo convertido de años a meses, fecha inicial, moneda del canon, contactos, cotitulares, equipamiento e inventario. Los honorarios por parte se importan como importes fijos en su moneda original: la reserva calcula porcentajes sobre un canon mensual y el contrato sobre todo el plazo. Copiar simplemente el porcentaje alteraba el importe. El formulario explica la importación y permite revisar el acuerdo. Un honorario incompleto sigue incompleto; sólo un cero explícito representa un honorario gratuito.
3. **Comodato, autorización, refuerzo y devolución.** El refuerzo conserva la moneda de la reserva y deja vacío el importe nuevo. Su antecedente toma la fecha del documento de origen, no inventa una firma ni muestra `Invalid Date`. La devolución sólo toma la seña recibida; nunca usa el precio total como reemplazo si la seña falta o vale cero. Conserva también el texto particular de la operación. Se corrigieron tanto las conversiones del listado como la selección de una reserva desde el formulario nuevo.

Los documentos vinculados capturan el modelo vigente antes de su primer guardado, no recién al editarlos posteriormente. Una duplicación del mismo tipo conserva su modelo histórico.

La revisión visual detectó que ocultar una comisión dejaba una promesa de pago sin importe. Los apartados de honorarios identificados del modelo se omiten al ocultarlos. La ficha interna conserva el monto. No se eliminan las cláusulas generales de incumplimiento ni se reescriben textos libres de las inmobiliarias.

## Evidencia

- `tests/recorridos-conversion.cjs`: 50 comprobaciones. Conversiones reales extraídas por AST, ambos selectores de reserva, dinero con centavos, monedas diferentes, cero, vacío, dato inválido, independencia de cotitulares y cláusulas, y exportación de los ocho tipos.
- Se guardaron ocho documentos ficticios mediante `fn_operacion_guardar`, se reabrieron mediante `fn_operaciones_listar`, se modificó el domicilio y se reabrieron otra vez, con el rol autenticado de la cuenta QA existente. Se verificó que el JSON completo esperado quedara conservado y que los documentos hijos conservaran la relación con sus reservas.
- Toda la prueba anterior terminó en `ROLLBACK`. La consulta posterior confirmó **cero** operaciones persistidas con el prefijo único de la prueba. No se modificaron operaciones de clientes.
- A partir de los ocho JSON devueltos por la base se generaron **8 PDF y 8 Word**. Se compararon domicilio editado y cláusula particular contra el texto extraído de PDF y el XML de Word. Se inspeccionaron visualmente las primeras y últimas páginas de los PDF con MuPDF.
- `tests/recorridos-browser.cjs`: **492 comprobaciones Chromium** a 320×740, 390×844, 844×390 y 1440×1000. Se recorren todos los pasos de los ocho formularios, se navega con Siguiente, se abre el resumen, se edita el domicilio, se guarda y se reabre. Sin desborde horizontal ni errores JavaScript. El guardado de esta prueba de interfaz se simula en almacenamiento local; el contrato real de persistencia se verifica por separado con las RPC anteriores.
- Las pruebas de acciones incluyen captura del modelo antes de la primera escritura, conservación posterior a cambios de biblioteca, doble clic de conversión, permisos y fallos de guardado: 72 comprobaciones.
- `npm run check`: TypeScript, pruebas de lógica/componentes, SQL en memoria y compilación aprobados.
- `npm run test:browser`: aprobado completo. Incluye 471 verificaciones de modelos/interfaz, 388 de salida y reserva de alquiler (incluido horizontal), 47 de importes, 12 de inicio/PWA, 60 de pulido y las 492 de recorridos; también landing y ayuda en sus diferentes tamaños.

## Reproducción y límites

`npm test` incluye la regresión de conversiones y exportaciones. `npm run test:browser` incluye los ocho recorridos; requiere Chromium configurado mediante `DOCWORKS_BROWSER_EXECUTABLE` cuando no está instalado por Playwright. La prueba genera sus fixtures automáticamente si no se proporciona `DOCWORKS_RECORRIDOS_DB` o `DOCWORKS_RECORRIDOS_FIXTURES`.

Los tamaños móviles se probaron en Chromium emulado. No equivalen a Safari real ni a la PWA instalada en un iPhone. Word se contrastó por contenido, sin inspección visual en Microsoft Word. No se efectuaron cobros ni envíos de mensajes. Las pruebas técnicas no certifican el contenido jurídico de los acuerdos.
