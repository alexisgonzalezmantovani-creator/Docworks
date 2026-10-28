# Corrección al cambiar de documento

El usuario informó que Comodato y otros documentos no se actualizaban en la web publicada. Se reprodujo desde ClausulasWorkspace: tras Reserva, al seleccionar Boleto el encabezado y las cláusulas podían seguir mostrando Reserva.

Causa: EncabezadoFijadoPanel y el apartado details de biblioteca compartían key={tipoDocSel} como hermanos. React informó claves duplicadas y su reconciliación conservó elementos del documento anterior. Se asignan espacios de nombres distintos: documento- y biblioteca-.

La regresión falló antes de corregir: después de guardar Reserva y seleccionar Boleto se observaron las cláusulas de Reserva. Con la corrección pasan selección, edición, guardado simulado y relectura de los ocho modelos. La prueba forma parte de npm test en tests/workspace.cjs. La suite de navegador también recorre los ocho documentos desde el espacio completo y rechaza avisos de claves duplicadas, en los tres tamaños y ambos motores. No equivale a escribir en una base real ni a probar hardware físico.

No se modificaron modelos activos ni datos de la base. La corrección cambia únicamente las claves de dos elementos de interfaz; se conservan los identificadores persistidos de los modelos y cláusulas.
