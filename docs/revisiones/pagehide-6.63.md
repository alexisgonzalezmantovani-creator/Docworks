# DocWorks 6.63 — protección del último cambio en iPhone

El autoguardado de operaciones ya utilizaba un borrador local y eventos pagehide / visibilitychange. Sin embargo, el valor de dataRef se actualizaba únicamente durante el render de React. Si el usuario escribía y el iPhone suspendía la PWA en el mismo instante, el evento de página podía copiar al almacenamiento una versión anterior.

Ahora los cambios simples de campos actualizan el snapshot local antes de esperar el render; también se sincronizan las cargas agrupadas. El mismo manejador existente de guardado escribe el borrador en localStorage, con su ID original y el contexto de inmobiliaria/usuario. Se mantiene el autoguardado y el envío al servidor sin modificar los roles ni la API.

Se incorporó una regresión a `tests/guardado-resiliente.cjs` que escribe un nombre y dispara pagehide en la misma interacción, antes de cerrar el ciclo React. Verifica última letra, datos y ID de recuperación.

Esta protección no equivale a probar físicamente el cierre forzado de Safari, y localStorage conserva sus limitaciones si el dispositivo borra el almacenamiento o entra en modo privado. No se modificaron documentos, cláusulas legales, operaciones reales ni Supabase.