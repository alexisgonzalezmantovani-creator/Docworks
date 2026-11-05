# Próximo lote de mejoras

Estado: publicación del lote completo autorizada por el usuario el 5/11/2026. Preparación de la versión 6.24: respaldo guardado y migración biblioteca_base_compartida_6_24 aplicada (20261105135537). Se conservan los textos, las bajas y las 57 operaciones existentes. Las notas SIN PUBLICAR que siguen registran la validación previa a esta autorización.

- [x] **Confirmación al salir de un formulario de operación.** Quitar la opción «Volver a operaciones y continuar después». Conservar «Seguir editando», «Salir sin guardar» y «Guardar borrador», en una misma fila también en iPhone. Revisar el ancho y el espaciado para mantener los textos legibles y evitar superposiciones. Conservar la confirmación antes de descartar datos y el manejo de errores de guardado.
- [x] **Encabezado al abrir una operación.** Aumentar ligeramente el tamaño del título del documento (por ejemplo, Reserva de alquiler), acompañarlo con el ícono del tipo de documento y ubicar el estado real, como Borrador, al lado en la parte superior. Eliminar la repetición inferior del nombre y del estado, manteniendo legibilidad y espacio para las acciones en iPhone.
- [x] **Unificar resumen y ficha completa.** Evitar títulos Resumen y botones Ver ficha completa repetidos. Propuesta: un único panel Ficha completa, con Resumen como primera vista y un solo selector para acceder al detalle; no duplicar llamadas a abrir la ficha. Conservar el acceso a todos los datos y al seguimiento sin perder funciones.
- [x] **Quitar leyenda general sobre datos de contacto.** Retirar «Centro de seguimiento, teléfonos y mails son internos y no se imprimen en el contrato» (o la leyenda equivalente). La inclusión de teléfono/email depende de las opciones seleccionadas por persona; este ajuste es de texto en pantalla y no debe cambiar esa lógica de exportación.
- [x] **Autoguardado: recuperar el disquito anterior y hacerlo discreto.** Reemplazar el ícono SVG introducido en 6.23 por el disquito anterior 💾. Mostrar solamente el ícono, pequeño y flotante, sin tarjeta, recuadro, sombra grande ni texto permanente alrededor. Debe permanecer presente sin llamar demasiado la atención ni interferir con los campos. Mantener el autoguardado y la comunicación de fallos; este pedido corrige la estética, no elimina el guardado automático.
- [x] **Listado inicial de documentos: acciones a la derecha en iPhone.** En las tarjetas del menú inicial de Operaciones, alinear el grupo de botones Abrir, Editar y menú de tres puntos al lado derecho, en lugar de centrarlo. Conservar el orden Abrir → Editar → tres puntos y los permisos y funciones de cada acción.
- [x] **Operaciones: vista de un renglón cortada en iPhone.** El usuario observa que la vista compacta no ocupa toda la pantalla disponible y se ve cortada, como por la mitad. Revisar dimensiones y recortes del contenedor y de las filas, incluido el alto disponible, sin asumir una causa hasta reproducirlo. Debe aprovechar el espacio de pantalla y permitir ver cada fila y sus acciones completas sin desplazamiento horizontal. Evaluar incluir las partes en formato resumido, priorizando que el contenido entre y sea legible. No se requiere una foto para iniciar la revisión.

- [x] **Retirar Descripción / Detalles adicionales.** Decisión final del usuario: quitar el campo genérico del formulario y dejar muebles, inventario y aires en Cláusulas adicionales. También se oculta su chip en el selector para nuevas inserciones. Se conservan la clave y los valores de operaciones/plantillas históricas para no perder datos ni alterar contratos existentes.


## Validación

- TypeScript: cero diagnósticos. Suite funcional completa y compilación de producción aprobadas.
- 250 comprobaciones de navegador en anchos de 320, 390, 430, 820 y 1440 px: tres acciones de salida en una fila; guardado, recuperación y errores; tabla y filas con el mismo ancho; partes resumidas; acciones de tarjetas alineadas a la derecha; estado en el encabezado; ficha unificada con una sola vista Resumen y sin leyendas de contactos incorrectas.
- Reserva y boleto: pruebas específicas confirman que Detalles adicionales no se imprime en modelos base y sí se incorpora cuando el modelo utiliza el chip existente.
- Causa encontrada para el listado incompleto: regla móvil genérica `table{display:block}`. La vista de operaciones ahora usa `display:table` y ocupa todo el ancho del contenedor.
- Sin publicación ni modificaciones a la base de datos. La comprobación en Safari/iPhone real continúa pendiente; el navegador utilizado es emulado.

- [x] **Título al editar una operación.** Conservar el breadcrumb Operaciones / Editar operación y usar como título principal el tipo de documento editado: Contrato de locación para alquiler, Reserva de alquiler u otro tipo correspondiente. Actualizarlo si cambia el tipo durante la edición; conservar Nueva operación al crear. Validado en cinco tamaños emulados.

- [x] **Revisión de amoblado, aires e inventario.** Comprobar su disponibilidad en compra, boleto, reserva de alquiler y contrato, y que los detalles lleguen a los documentos. Revisar si el campo genérico Detalles adicionales aporta algo antes de decidir quitarlo.


## Revisión adicional de equipamiento y título

- El contrato de alquiler conserva la opción Se alquila amoblado dentro de Condiciones y su campo Inventario de bienes muebles. Compra y boleto utilizan las cláusulas adicionales Entrega amoblada con inventario y Aires acondicionados incluidos, según la biblioteca y las opciones habilitadas por la inmobiliaria.
- Corregida la exclusión de reserva_alquiler en el catálogo base de esas dos cláusulas y en la comprobación de sus detalles. Las bibliotecas y plantillas ya personalizadas conservan su configuración; no se realizaron cambios en datos de producción.
- Corregida la pérdida de alquiler_inventario al reemplazar las secciones estándar por el modelo editable. Se preserva una única copia cuando el inventario ya aparece en el modelo.
- Confirmado el texto del inventario en los archivos PDF y DOCX generados con modelo estándar y editable. Aprobadas 35 comprobaciones de condiciones especiales y 265 de navegador, incluyendo el título Contrato de locación y el breadcrumb Operaciones / Editar operación.
- Suite funcional completa, TypeScript y build aprobados después de estas correcciones.
- Decisión posterior del usuario implementada: retirado el campo genérico. Se reutilizan los editores de inventario que ya existían dentro de Cláusulas adicionales, sin crear un inventario paralelo.
- No publicado. Esperar el OK explícito para subir todo el lote junto.


## Biblioteca e inventario compartidos

- [x] **Reutilizar inventario.** Las operaciones nuevas usan Entrega amoblada con inventario → Inventario de muebles y artefactos. Los contratos que ya usaron alquiler_amoblado/alquiler_inventario conservan ese mismo editor dentro del paso Cláusulas adicionales, sin duplicarlo en Condiciones. Se conservan los datos; si está marcado amoblado, el inventario vacío se señala en el paso correcto.
- [x] **Base operativa para las inmobiliarias.** Preparada `supabase/propuestas/biblioteca-base-624.sql`: actualiza el inicializador para cuentas futuras y completa las existentes una sola vez, con transacción y bloqueo por inmobiliaria. La base de alquiler/reserva de alquiler incluye aires, entrega amoblada con inventario e interiores pintados; crédito hipotecario se limita a compra/boleto. No se reactivan bajas ni se reemplazan textos personalizados; tampoco se reactivan opciones deshabilitadas en tipos ya configurados.
- [x] **Compartir con brokers actuales y nuevos.** Confirmado en producción mediante consultas de solo lectura: cláusulas y configuración tienen alcance por inmobiliaria, no por creador. Las cláusulas creadas y habilitadas por la inmobiliaria se guardan en esa biblioteca/configuración común. Agregada actualización del catálogo y perfil al volver a la app para asesores, sin recargar mientras editan una operación o leen un documento.
- [x] **Reserva de alquiler → contrato.** Se conservan muebles, aires y sus identificadores, inventario previo, teléfonos/checks de inclusión, cotitulares, UF y título de la cláusula propia. Antes se copiaban IDs de cláusulas sin sus detalles de equipamiento.

Validaciones: 275 comprobaciones de navegador emulado (incluido inventario en iPhone), 46 pruebas de condiciones especiales, suite funcional completa, TypeScript sin diagnósticos y build aprobados. La suite SQL conserva sus 113 comprobaciones previas y agrega inicialización futura, actualización de cuentas existentes, idempotencia, conservación de bajas/textos/versiones, igualdad entre brokers existentes y nuevos, rechazo sin sesión y aislamiento entre inmobiliarias. Verificado inventario en PDF y DOCX.

La propuesta SQL se probó en PostgreSQL local en memoria. NO fue aplicada a producción. Las consultas sobre la cuenta de Alexis fueron de solo lectura. Antes de publicar: respaldo vigente, aplicación transaccional de la propuesta SQL y publicación conjunta del frontend; revisar permisos y verificar el resultado. Requiere el OK explícito del usuario.


## Última revisión de campos y comodidad en computadora

- [x] **Monedas e importes.** El resumen de reserva de alquiler usa su canon y moneda, en lugar del valor por defecto de los campos de contrato. Los campos automáticos de moneda respetan el tipo de operación. Comisiones y conversión a contrato conservan la moneda del canon; los importes se interpretan con el parser monetario común. Abrir las condiciones no sobrescribe una moneda mensual ya guardada. Se conserva la opción actual de moneda unificada para operaciones nuevas; los casos históricos con monedas distintas muestran una aclaración y no se modifican al abrirlos.
- [x] **Reemplazo de números sugeridos.** Meses, interés, penalidad, seguro, preaviso y aceptación en días/horas permiten borrar el contenido mientras se ingresa otro número. Los valores sugeridos se normalizan al salir del campo. Los ceros explícitos no se reemplazan por otro porcentaje/plazo al generar el documento.
- [x] **Reserva de compra → boleto/comodato.** Conservar cotitulares, selección de teléfono/email en el documento, UF/lote, subtipo de inmueble y título de cláusula propia. El boleto también conserva la modalidad, valor y moneda de las comisiones de la reserva.
- [x] **Mostrar contacto junto al campo.** Teléfono y correo tienen al lado su propio texto Mostrar en el documento y switch en computadora, también para cotitulares. Retirado el bloque separado y repetido. En celular el control se acomoda debajo del campo, sin superponerse. Nombre y DNI/CUIT quedan alineados en computadora/tablet.
- [x] **Botones de navegación más cómodos en computadora.** Volver a operaciones, Siguiente/Revisar y Volver a opciones/Anterior tienen 44 px de alto mínimo y letra de 13,5 px en pantallas mayores a 760 px. Se mantienen colores y estilo; no se agrandan los botones de toda la aplicación.

Comprobaciones de esta ampliación: 32 pruebas de campos/contactos/monedas/conversiones; suite funcional completa; TypeScript sin diagnósticos; build aprobado; 295 comprobaciones de navegador en cinco anchos, incluyendo alineación de controles y botones grandes. Revisión visual de computadora y celular emulados. Continúa SIN PUBLICAR.

## Inmueble, escribanía y encabezado

- [x] Barrio cerrado o complejo: switch que despliega nombre y UF/lote; exige el nombre solo al activarlo. Conserva datos al desactivar, sin imprimirlos. Respeta UF de operaciones anteriores. Conserva estos datos al convertir operaciones y los incluye en los documentos sin modificar la dirección original.
- [x] Escribanía diferida: no se solicita al iniciar reserva/boleto. Se puede completar opcionalmente al editar una operación guardada; los datos anteriores siguen accesibles y se conservan al convertir a boleto.
- [x] Encabezado de nueva/editar operación: fondo opaco sin desenfoque y cobertura de márgenes para que el contenido que pasa por debajo no se mezcle con el título al desplazarse. Se conserva la posición del encabezado para evitar interferencias con los pasos.
- [x] Comisiones compactas: reemplazada la propuesta anterior según la corrección del usuario. Modalidad y valor están en una misma fila, sin renglón permanente de equivalencia. Mostrar en el documento está al lado cuando entra y se acomoda debajo en celular. Se conserva el indicador de ocultar comisión y su funcionamiento en exportaciones.

Validación de campos ampliada a 52 comprobaciones, incluidas exportaciones PDF/DOCX de barrio/UF, desactivación sin pérdida de datos, campos históricos y escribanía opcional. Suite funcional y build aprobados. Preview de comisiones verificado en 320 y 736 px, incluyendo switches, cambio de porcentaje y modalidad de monto fijo. Las pruebas de navegador son emuladas; no se probó en un iPhone físico. Continúa SIN PUBLICAR.

Cierre de esta revisión: 310 comprobaciones de navegador emulado en cinco anchos aprobadas; TypeScript y compilación final aprobados. Sin publicación ni cambios en producción.

## Separadores de miles y comisiones en línea

- [x] Formato monetario automático en todos los tipos de documento que tienen importes: precio, seña/anticipo, canon, reserva de alquiler, cuotas, depósito con monto personalizado, refuerzo, devolución, exclusividad y honorarios fijos. También en la carga de monto del seguimiento.
- [x] Se muestran puntos de miles y coma decimal (100.000,50); se guardan valores sin separadores de miles para conservar cálculos y exportaciones. Los valores históricos con separadores se leen correctamente. Plazos, DNI, fechas y porcentajes siguen con su formato propio.
- [x] Comprobados escritura continua, centavos, reemplazo completo, borrado junto al separador, edición en el medio y pegado de importes con convención argentina o estadounidense. Corrección del cursor con actualización de selección al renderizar, sin callbacks demorados.
- [x] Comisiones: modalidad y número juntos, campo de porcentaje compacto, visibilidad por parte junto al control cuando entra; no se agrega un tercer renglón de equivalencia.

Validaciones: 84 comprobaciones funcionales de campos y exportaciones; suite funcional completa aprobada; 47 comprobaciones de navegador emulado en 320/390/1440 px, incluidas las modalidades, los switches y ocho combinaciones de tipo/campo monetario. TypeScript y build aprobados. No probado en iPhone físico. Continúa SIN PUBLICAR.

Publicación autorizada: pruebas completas de npm run check aprobadas (funcionales, permisos/base compartida en PostgreSQL, TypeScript y build). Migración verificada en producción: cuentas con miembros activos inicializadas, acceso anónimo rechazado y textos personalizados/bajas conservados.
