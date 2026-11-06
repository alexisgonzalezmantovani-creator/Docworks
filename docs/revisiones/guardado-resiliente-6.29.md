# Guardado y cambio de documento · 6.29

Base publicada: 6.28 (`a588f96`). Revisión del 6 de noviembre de 2026.

## Problemas reproducidos y correcciones

- **Respuesta perdida después del guardado:** el reintento de una operación nueva podía generar otro ID y duplicarla. El formulario ahora recibe ID y fecha de creación al iniciarse; ambos acompañan al borrador y a su recuperación. Guardar y sincronizar reutilizan la identidad. Un reintento también reemplaza la fila local con ese ID en lugar de duplicarla.
- **Sincronización de un borrador antiguo:** si aún no tenía ID, se le asigna y se conserva localmente antes de enviarlo. Si se pierde la confirmación, la siguiente sesión vuelve a usar ese ID. Un documento confirmado se incorpora al listado aunque la lista inicial todavía no lo contuviera. La respuesta de una sesión anterior no afecta al listado ni elimina el borrador de otra sesión.
- **Cambio entre autorización de venta y otros documentos:** la inmobiliaria ya no arrastra cotitulares ni permisos de impresión de un comprador anterior. Al volver al otro tipo dentro del mismo formulario, se recuperan los datos de esa persona. Si se abre una autorización guardada y se cambia a comodato, se solicita la nueva parte; no se usa la inmobiliaria como comodatario. El respaldo temporal de la parte anterior vive en el formulario y no se exporta ni se guarda como un cliente adicional.
- **Formulario vacío:** los datos institucionales autocompletados no bastan para considerar que se cargó una autorización. El ID y la fecha internos tampoco cuentan como contenido.
- **Modelo histórico:** guardar un borrador desde la salida o desde la sincronización fija su modelo. Si se cambia el tipo de un documento al editarlo, se captura el modelo del tipo elegido; editar el mismo tipo conserva su modelo histórico.
- **Devolución fallida:** una excepción antes de confirmar el guardado del documento no marca la reserva como pendiente de cierre. Si la devolución sí se confirmó y sólo falló el cierre del padre, el reintento actualiza exclusivamente la reserva y no crea otra devolución.
- **Reemplazo de formulario:** desmontar el formulario anterior no borra la referencia al formulario nuevo durante su montaje.

## Verificación

`tests/guardado-resiliente.cjs`: 12 comprobaciones aprobadas; prueba los handlers reales extraídos del código y los componentes React. Incluye respuesta perdida después de efectuar la escritura, recuperación en otra instancia, cambios de sesión, identidad estable, protección del cierre, formularios vacíos, cambio de partes y captura del modelo correcto.

`tests/guardado-resiliente-browser.cjs`: 68 comprobaciones Chromium en 320×740, 390×844, 844×390 y 1440×1000. El servidor HTTP local de la prueba registra la primera escritura pero devuelve un error 504 de confirmación. Se recarga la página, se recupera lo escrito, se cambia a autorización y se vuelve a comodato, y se reintenta guardar. Se comprueba un solo registro con el mismo ID, fecha y nombre, sin cotitulares mezclados, sin desborde horizontal y sin errores JavaScript.

`tests/database/reintento-transaccional.sql` se ejecutó contra las RPC reales con la cuenta QA existente: dos escrituras del mismo ID dejan una operación con la última corrección, los centavos y el snapshot conservados. Toda la prueba terminó en `ROLLBACK`; la consulta final confirmó cero registros de prueba persistidos.

Aprobados `npm run check` (TypeScript, lógica, SQL en memoria y compilación), 492 comprobaciones Chromium de los ocho recorridos y 388 de salida/recuperación del formulario. Las pruebas de componentes y HTTP simulan fallos concretos; no reproducen todas las condiciones de una red móvil. Los tamaños móviles son emulados en Chromium; no son una prueba en Safari de un iPhone físico.
