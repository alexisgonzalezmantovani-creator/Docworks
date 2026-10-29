# DocWorks 6.12 — Interfaz de superadministración

La navegación global ahora está en una barra lateral azul con iconos de línea en escritorio. En móvil se convierte en una navegación horizontal desplazable. Las secciones siguen siendo Resumen, Inmobiliarias, Solicitudes, Planes, Auditoría y Pagos.

El resumen prioriza cuatro indicadores y una bandeja «Para revisar hoy», con solicitudes pendientes, cuentas pendientes/vencidas/suspendidas y renovaciones de membresías activas en los próximos siete días. Los atajos abren sus filtros correspondientes; las filas permiten abrir el detalle de una inmobiliaria. Los indicadores secundarios y el anuncio global quedan en apartados desplegables.

Las fichas muestran contacto, plan, estado, uso de usuarios y vencimiento. Se mantienen búsqueda por nombre/email, filtros por estado y plan, orden, CSV y todas las acciones existentes. Se agrega restablecer filtros y actualizar el panel. Se retira del resumen el contador de pagos inicialmente vacío que podía parecer un cero real y las tarjetas duplicadas de suscripciones/medios.

Las llamadas RPC, permisos y operaciones de negocio existentes se conservan. No se ejecutan migraciones, cambios de membresías ni escrituras en cuentas reales para validar la interfaz. La facturación estimada conserva las monedas separadas.

Validación: 16 pruebas DOM de navegación, filtros, detalle, recuperación de errores y acciones de acceso; harness de superadmin con RPC de solo lectura y datos ficticios. La suite de navegador recorre las seis secciones, búsqueda, filtros y detalle en móvil, tableta y escritorio. Inspección visual de capturas de escritorio y móvil, sin desbordamiento horizontal. npm run check y pruebas de navegador antes de publicar.
