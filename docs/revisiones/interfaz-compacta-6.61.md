# DocWorks 6.61 — navegación compacta de Cláusulas y Documentos

- En iPhone las dos pestañas ahora dicen «Cláusulas» y «Documentos», en una única fila, sin convertirse en dos tarjetas enormes.
- Se conserva el nombre accesible completo de ambas acciones para lectores de pantalla y pruebas existentes.
- Se eliminó el segundo título «Biblioteca de cláusulas» dentro de la tarjeta. El título principal es un encabezado semántico.
- Se acortaron las introducciones de Biblioteca, Documentos y Papelera, sin cambiar el funcionamiento ni los textos legales.
- Se agregaron regresiones en anchos de 320, 375 y 430 px, además de tablet y escritorio: alineación, tamaño y ausencia de scroll lateral.
- No se modifican operaciones, cláusulas, configuración de cada inmobiliaria ni contratos exportados.
- Quedan pendientes activaciones reales de proveedor de correo, CAPTCHA Turnstile y Mercado Pago, más validaciones físicas de Safari.

## Ajuste de regresión

Se mantiene el nombre accesible completo de las pestañas, mientras el texto visible es breve. El título interno de la Papelera pasa a «Cláusulas eliminadas» para que no duplique «Papelera de cláusulas». Las comprobaciones DOM y de navegador se adaptan a esos textos, sin relajar las validaciones de navegación.
