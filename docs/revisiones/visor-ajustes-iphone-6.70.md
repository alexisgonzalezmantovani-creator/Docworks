# DocWorks v6.70 — visor iPhone y ajustes manuales

Cambios en el visor de documentos de una operación:

- En iPhone la vista previa tiene marco completo redondeado, sombra discreta, terminación inferior y scroll **sólo dentro de la hoja blanca**. La cabecera duplicada con círculos sigue oculta.
- La lista **Hacer ajustes manuales** ya no se recorta al desplegarse: tiene desplazamiento vertical propio cuando supera su altura y el panel general también puede desplazarse para acceder a todo el contenido, especialmente en iPhones pequeños.
- El editor muestra los tokens automáticos en forma de **chips azules protegidos**, con nombres legibles (ejemplo: `Precio en letras`). Se conserva el token real `{{precio_letras}}` en el documento y en los archivos PDF/DOCX; no se vuelve texto libre.
- Los marcadores heredados conocidos `[precio en letras]`, `[anticipo en letras]`, `[seña en letras]` y `[saldo en letras]` se reconocen al editar como su token canónico, sin cambiar otro texto ni el modelo.
- La lista indica cuántas cláusulas del documento están disponibles para ajustar (sólo las realmente impresas).
- No se modifica el resto de la app, ni tablet/PC, ni el modelo de datos.

Pruebas: `scripts/capturar-galeria.cjs` usa `DocumentViewer` real, con datos ficticios, en viewport iPhone 390×844. Verifica marco redondeado, scroll interno, última cláusula, despliegue y scroll de ajustes y chips del precio. `tests/navegador.cjs` cubre el CSS mobile con documento largo.
