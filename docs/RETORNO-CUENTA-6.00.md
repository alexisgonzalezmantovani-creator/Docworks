# DocWorks 6.00 — retorno a la misma cuenta

28 de octubre de 2026. Continuación de PR #4.

## Fallo reproducido y corrección

Una función `guardarAhora` conservada de la primera entrada de A podía iniciar una RPC después de cambiar a B y volver a A. La clave de usuario/inmobiliaria/rol volvía a coincidir y el contador de solicitud se tomaba al llamar, por lo que no diferenciaba las dos entradas.

Ahora cada cambio de contexto recibe una identidad independiente. El guardado exige que la identidad capturada y la actual coincidan, además del montaje, la lectura remota previa, el contador de solicitudes y la coincidencia de sesión SDK. Las renderizaciones de la misma cuenta y contexto conservan su identidad. No se cambian llamadas ni permisos de Supabase; la autorización continúa en el servidor.

## Evidencia

La regresión A → B → A falló antes de la corrección: se esperaba cero escrituras, pero se observó una RPC simulada. Pasa después: la llamada antigua devuelve `contextoObsoleto` sin iniciar escritura.

La suite ahora tiene 25 controles de sesiones, con SDK simulado. Agrega rechazo del callback de la primera entrada al regresar a A, resultado obsoleto, conservación del callback vigente tras renderizar el mismo contexto y desmontaje durante `getSession` sin iniciar RPC.

`npm run check` aprobado: TypeScript, sintaxis/integración, 78 controles documentales, 92 de interacción, 25 de sesiones y Vite. El aviso de bundle >500 kB continúa. Log: `pruebas-retorno-cuenta-6.00.log`.

Los controles de navegador de esta revisión se ejecutan en la matriz de GitHub Actions y deben comprobarse en la PR. Los resultados de revisiones anteriores no sustituyen ese control.

## Límites

Esto no equivale a dos sesiones Auth reales. Siguen pendientes escritura/recarga entre dos cuentas de prueba, Safari/iPhone/iPad físicos y Microsoft Word real. No se escribieron datos ni modelos de la base. La candidata permanece sin fusionar a producción.
