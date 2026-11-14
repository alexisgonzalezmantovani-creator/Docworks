# DocWorks 6.62 — cláusulas propias guardadas sin demora

Se revisó el paso final **Cláusulas adicionales** de una operación. El título y el texto de una cláusula escrita por el asesor estaban duplicados en estados internos y se copiaban a `data` mediante un efecto de React, creando una pequeña ventana de pérdida de cambios al guardar o abandonar inmediatamente la pantalla.

Ahora título, texto, dictado y el resultado aceptado de IA se escriben directamente en el borrador de la operación. El editor plegado no borra contenido; al reabrir presenta los valores actuales del borrador. El borrado sigue requiriendo confirmación.

El cambio se limita al cliente. No se modificaron contratos base, cláusulas de biblioteca, operaciones existentes, esquemas, permisos ni datos de Supabase.

Prueba incorporada: `tests/clausula-propia-borrador.cjs`, integrada en la suite de aplicación, con comprobaciones de cambios inmediatos, persistencia serializada, actualización del formulario al recuperar un borrador, plegado sin borrado y eliminación confirmada.

Siguen pendientes la verificación física de Safari/PWA y la activación con credenciales reales de email, CAPTCHA y Mercado Pago.
