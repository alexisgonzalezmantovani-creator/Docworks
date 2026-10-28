# DocWorks 6.00 PRO — versión candidata verificada

Base: `main`, commit `a8d0d2f362578122368825ef54de6e4f39d3b078` (5.98). Rama: `work/docworks-6-pro`. Fecha: 27 de octubre de 2026 (Argentina). Sin publicación en producción ni cambios en la base de datos.

## Cambios

- Editor de modelos compartido para Reserva, Boleto, Reserva de alquiler, Alquiler, Comodato, Exclusividad, Refuerzo y Devolución de reserva. Reserva toma el texto histórico de sus bloques si aún no tiene modelo JSON; los modelos guardados pasan a usarse en documentos y snapshots. Se conserva el editor protegido del precio y los snapshots existentes.
- Alta y chips modifican solo el borrador. Guardar cláusula valida título y contenido. Cancelar solicita descarte. Cambiar de documento o salir de Modelos solicita descarte; al recargar la página hay protección de salida durante una edición.
- Los errores de guardado conservan el borrador abierto; se bloquean acciones simultáneas del modelo mientras se edita o guarda. El historial compara contra la versión guardada y conserva estado, condición y orden. Restaurar modelos conserva los metadatos opcionales.
- `obligatoria` ausente, null o undefined se normaliza como obligatoria salvo condición; se conserva false explícito. Chips de precio y cuerpo evitan inserciones repetidas. Los snapshots respetan los IDs obligatorios del modelo.
- Firmas individuales de conformidad por cada vendedor cotitular en PDF, DOCX y vista previa. Un garante heredado no se agrega a documentos que no sean alquiler. Texto de revisión incluye contactos autorizados, firmas y conformidad.
- En hoja compacta, títulos completos con salto de línea; acciones al desplegar, sin comprimir el nombre en iPhone/iPad. Botones de cláusulas con mayor área táctil.
- Errores de TypeScript corregidos (refs DOM, estilos, tipos de filtros, rows numérico y atributo de video); comprobaciones reproducibles, lockfile y CI para la rama y PRs.

## Verificación ejecutada

| Comprobación | Resultado |
| --- | --- |
| `npm run typecheck` | Sin errores |
| Sintaxis e importaciones | Aprobadas |
| Diagnósticos de integración TypeScript | 0; diagnósticos totales 0 |
| `node tests/documentos.cjs` | 70 verificaciones aprobadas |
| `node tests/editores.cjs` | 59 verificaciones aprobadas, DOM simulado |
| `npm run test:browser` | 51 verificaciones aprobadas, Chromium 131; viewports 390×844, 820×1180 y 1440×1000 |
| `npm run build` | Vite: 34 módulos, compilación exitosa |
| `git diff --check` | Sin errores |

Documentos: generación de los ocho tipos, tokens resueltos, numeración continua, faltantes detectados, operación original intacta, contactos privados ocultos, firmas idempotentes, conformidad individual y cláusula obligatoria de snapshot. Se generaron ocho PDF y ocho DOCX reales. Se revisaron sus firmas de archivo, extracción de texto PDF, estructura ZIP/XML de Word y ausencia de tokens/correo privado; se inspeccionaron visualmente páginas de Reserva y capturas de editores.

Interacciones: agregar, insertar chip, cancelar, guardar, fallo de persistencia simulado, reintentar, historial y modo de solo lectura, en los ocho modelos. Navegador: vista previa, guardado y ausencia de desbordamiento horizontal en los ocho tipos y tres tamaños.

Supabase: proyecto activo y saludable. Se inspeccionaron exclusivamente las definiciones de `fn_bloque_editar`, `fn_perfil_inmobiliaria_obtener` y `fn_perfil_inmobiliaria_guardar`. La primera solo persiste título y texto; la última guarda JSON y comprueba usuario, inmobiliaria y rol Dueño/Administrador. No se alteraron funciones, tablas, usuarios ni operaciones reales.

## Límites y pendientes reales

- No se probó Safari/WebKit ni hardware iPhone/iPad. Chromium con esos tamaños no certifica el comportamiento de Safari, la impresión de iOS ni la hoja de compartir.
- No se ejecutó una sesión autenticada completa con dos cuentas, escritura real de modelos, recarga entre dispositivos ni aislamiento de permisos de extremo a extremo. Los callbacks de persistencia de las pruebas UI son simulados; la revisión SQL no sustituye esa prueba.
- DOCX: estructura y contenido comprobados, sin renderizado de Microsoft Word/LibreOffice; la paginación visual de Word queda pendiente.
- Las cláusulas de cuerpo solo ofrecen elección del asesor cuando existe una condición de operación soportada (refuerzo y seguro). Las adicionales opcionales se seleccionan desde la biblioteca; no se inventó un control de operación para otras condiciones.
- Vite mantiene el aviso por un bundle mayor a 500 kB (aprox. 1.112 kB, 293 kB gzip). Compila correctamente; no se emprendió un refactor general de carga.
- La protección de descarte cubre Cancelar, cambio de documento, salida de la sección Modelos y recarga. La navegación principal de la aplicación desde otras pantallas no tiene una prueba completa de descarte en esta entrega.

Esta entrega es una candidata 6.00 PRO con las verificaciones indicadas, no una certificación completa para producción. Mantener `main` y producción en 5.98 hasta cerrar los pendientes anteriores.

## Reproducir

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:browser
```

También puede indicarse un navegador instalado con `DOCWORKS_BROWSER_EXECUTABLE=/ruta/a/chromium npm run test:browser`. Las pruebas de navegador usan una pantalla local con datos ficticios y callbacks simulados; no inician sesión ni escriben en Supabase. Los ejemplos PDF/DOCX se crean en un directorio temporal informado por el test.
