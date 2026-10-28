# DocWorks 6.00 — cierre de componentes y controles automáticos

Revisión del 28 de octubre de 2026 sobre la candidata de PR #4.

## Corrección

Una referencia a `guardarAhora` conservada después de desmontar `usePerfilSupabase` podía iniciar otra RPC, porque tomaba el contador de solicitud vigente al invocarse. Se agregó un indicador de montaje que bloquea tanto las llamadas nuevas como las continuaciones de guardados pendientes cuando el componente ya no está activo. No cambia el esquema ni los permisos de servidor.

## Pruebas

La suite de sesiones pasa de 14 a 21 controles con SDK simulado: sesión ausente/vencida, error de renovación, rechazo de conexión, reintento, rechazo de RPC, cierre de sesión durante guardado y callback tras desmontar. Este último reprodujo el fallo antes de la corrección y pasa con el bloqueo. Un temporizador de 30 segundos y la comprobación de terminación impiden que una promesa pendiente termine la suite sin informar error.

`npm run check` pasó: TypeScript, sintaxis/integración, 78 controles documentales, 92 de interacción, 21 de sesiones y compilación Vite. Ver `pruebas-continuacion-6.00.log`. Persiste el aviso de bundle superior a 500 kB.

## Integración continua

Se agregan trabajos separados Chromium y WebKit a GitHub Actions. Cada motor ejecuta los ocho editores en tres tamaños, con instalación de sus bibliotecas, límite de 15 minutos y conservación por 14 días de logs y capturas de datos ficticios. No se sube el perfil del navegador. La matriz continúa con el otro motor si uno falla.

El YAML se validó localmente. No fue posible repetir los motores en este entorno: la descarga oficial de Chromium terminó con error de archivo ZIP inválido. Los resultados de la matriz remota deben verificarse antes de considerarla aprobada; los resultados previos de navegador no certifican esta revisión.

## Pendientes conservados

Escritura/recarga entre dos sesiones Auth reales en una inmobiliaria de prueba, Safari e iPhone/iPad físicos para impresión/compartir y Microsoft Word real. En este entorno el navegador está sin pestañas ni sesiones abiertas. No se escribieron modelos activos ni datos de la base. No fusionar ni publicar a producción hasta cerrar estos puntos.
