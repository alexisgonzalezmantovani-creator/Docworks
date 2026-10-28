# DocWorks 6.00 PRO — sesiones y persistencia

Revisión del 28 de octubre de 2026 sobre la candidata de PR #4. Los cambios evitan que callbacks o respuestas tardías de otra cuenta afecten al perfil actual. La lectura se invalida por usuario, inmobiliaria y rol; guardar requiere lectura remota previa y una sesión del SDK que coincida con el usuario del contexto. La RPC sigue determinando los permisos en el servidor. Los componentes de Modelos se reinician cuando cambia ese contexto.

Si cambia la cuenta mientras se espera una sesión o una respuesta, el resultado se marca como obsoleto y las pantallas de Modelos, Configuración y vista del documento no restauran un perfil anterior sobre la cuenta nueva. Si no existe configuración remota, se conserva el rol que devuelve el servidor en lugar de mostrar el rol predeterminado de Dueño.

## Pruebas ejecutadas

`tests/sesiones-perfil.cjs`: 14 verificaciones de React/SDK simulado. Cubren carga inicial, guardado antes de cargar, cambio de usuario en la misma inmobiliaria, lectura tardía, callback anterior, cambio durante recuperación de sesión, discrepancia SDK/contexto, guardado vigente, respuesta tardía, error de lectura, perfil remoto ausente, cambio de rol y cuenta ausente.

`tests/database/perfil-rollback.sql`: ejecutado en la base real con las ocho identidades activas de cuatro inmobiliarias, mediante el rol SQL `authenticated` y claims de prueba. Pasaron 17 verificaciones agrupadas: ocho de lectura/aislamiento, cinco de guardado/relectura y rol determinado por servidor, tres de rechazo a Asesores, y una comprobación final de reversión. Se probó la RPC real, no una imitación.

Las escrituras se realizaron dentro de un subbloque que se revierte deliberadamente. Se compararon huellas de todas las filas completas de configuración y usuarios antes y después: iguales. No se crearon usuarios, no se alteraron esquemas, no se enviaron mensajes y no quedaron modificaciones persistentes de la prueba. El script no contiene identificadores de personas ni datos de operaciones.

Esta prueba SQL no inicia sesión en Supabase Auth, no obtiene tokens y no equivale a dos navegadores autenticados. Sigue pendiente probar renovación de sesión, guardado y recarga con dos sesiones Auth reales.

La compilación, los ocho documentos y la interacción se vuelven a comprobar con `npm run check`. Resultados en `pruebas-check-sesiones-6.00.log`; resultados de navegador en los archivos `pruebas-chromium-sesiones-6.00.log` y `pruebas-webkit-6.00.log`. Ambos motores aprobaron 123 verificaciones cada uno, con los ocho modelos y tres tamaños. Se revisaron las capturas de WebKit de celular y tablet.

WebKit se ejecutó en Linux con dependencias extraídas en un directorio temporal porque el entorno no permite instalar paquetes del sistema. Se omitió el chequeo automático de ubicación de dependencias una vez resueltas sus bibliotecas; las pruebas se ejecutaron efectivamente contra WebKit y terminaron con éxito.

## Ejecutar

```sh
npm ci
npm run check
npx playwright install --with-deps chromium webkit
npm run test:browser
npm run test:webkit
```

La prueba SQL requiere acceso de mantenimiento autorizado al proyecto y se ejecuta de forma independiente; no se agrega al CI público ni necesita credenciales en el repositorio. Cualquier error aborta la operación y revierte las escrituras. La suite SQL usa las identidades activas disponibles, de modo que su cantidad de casos depende del proyecto.

## Límites restantes

WebKit de Playwright, cuando está disponible, ejecuta el motor en Linux: no certifica Safari de iOS, impresión, hoja de compartir ni hardware iPhone/iPad. La revisión visual de DOCX de la entrega previa se hizo con LibreOffice; Microsoft Word real continúa pendiente. Mantener la entrega como candidata sin fusionar a producción hasta cerrar esos límites y las sesiones Auth reales.
