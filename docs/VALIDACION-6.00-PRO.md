# DocWorks 6.00 PRO — entrega y verificación

Actualización: 28 de octubre de 2026. Base oficial `main` 5.98; candidata en `work/docworks-6-pro`, PR #4. No se modificó producción. Las pruebas SQL de la revisión de sesiones revierten todas sus escrituras y verifican que no queden cambios persistentes.

## Revisión de sesiones

Se corrigieron la invalidación por cuenta/rol, los guardados con sesión SDK distinta, el rollback tardío y el rol de un Asesor sin perfil remoto. Se agregaron 14 pruebas de transición y 17 comprobaciones en la base real con reversión completa. Chromium y WebKit aprobaron 123 verificaciones cada uno. Detalle y límites en `PRUEBAS-SESIONES-6.00.md`.

## Prueba desde la cuenta autenticada

Se completó el acceso normal a Vercel y DocWorks. Se comprobaron la recarga de sesión, el descarte de un borrador y las ocho vistas previas de modelos guardados. Se corrigieron tres etiquetas ambiguas de chips manteniendo sus identificadores. Ver `PRUEBA-REAL-CUENTA-6.00.md`. Esta prueba no incluye escritura entre dos cuentas.

## Implementación

Los ocho modelos (Reserva, Boleto, Reserva de alquiler, Alquiler, Comodato, Exclusividad, Refuerzo y Devolución) usan el editor compartido. Se mantienen textos históricos de Reserva, snapshots, precio protegido, roles y datos existentes. Agregar e insertar chips modifica el borrador; guardar valida título y contenido. Los errores conservan la edición. Historial y restauración mantienen metadatos; los chips no se duplican y las cláusulas conservan numeración consecutiva.

Esta revisión completa la confirmación de descarte al navegar por el menú principal, además de Cancelar, cambiar documento, salir de Modelos y recargar. Cancelar la confirmación conserva el borrador; confirmarla lo descarta sin persistir. Durante un guardado se impide salir por el menú principal.

Se corrige la firma de inmobiliaria heredada sin `usarPerfil`, que provocaba una firma adicional en Exclusividad al exportar. Cada cotitular conserva su firma. Word mantiene el rótulo Firmas con la primera fila y cada firma de conformidad con su nombre e identificación, evitando rótulos y datos partidos por paginación. El número de páginas puede variar entre PDF y Word.

## Verificaciones de esta revisión

- `npm run check`: TypeScript sin errores, sintaxis/importaciones e integración aprobadas, 78 verificaciones documentales y 83 de interacción aprobadas, Vite compiló correctamente.
- Se generaron los ocho PDF y ocho DOCX con datos ficticios. Se renderizaron los ocho Word con LibreOffice y los ocho PDF con Poppler; se revisaron todas las páginas renderizadas, incluidas firmas y conformidad. No equivale a Microsoft Word.
- Pruebas de navegador y resultados: `docs/pruebas-browser-6.00.log`. Incluyen tres tamaños (390×844, 820×1180 y 1440×1000), ocho modelos, vista previa, guardado, ausencia de desbordamiento, errores JavaScript y descarte mediante el modal real.
- Los resultados completos de compilación e interacción están en `docs/pruebas-check-6.00.log`.
- `git diff --check`: aprobado.

Las pruebas de datos detectan campos faltantes y tokens sin resolver; los ejemplos no completan todos los campos de una operación real. No constituyen garantía de que una exportación autorizada con faltantes carezca de marcadores. Se conservaron los controles existentes de validación de documentos.

## Pendientes que requieren otro entorno

- Safari real y hardware iPhone/iPad, impresión y compartir de iOS. WebKit de Playwright en Linux ya pasó la suite de 123 verificaciones, sin sustituir estas pruebas de hardware.
- Persistencia y aislamiento de permisos con dos sesiones autenticadas y recarga entre dispositivos. Las pruebas de interfaz usan callbacks simulados; la suite SQL ejecutó las RPC reales con claims de prueba y revirtió todas las escrituras. No se iniciaron sesiones Auth reales.
- Microsoft Word real; la revisión visual realizada usa LibreOffice.

Por estos límites, la entrega es una candidata verificada localmente, no una certificación completa de producción. No fusionar/publicar sin cerrar las pruebas autenticadas y de Safari ya exigidas para esta entrega. El aviso de Vite por bundle mayor a 500 kB persiste y no impide compilar.

## Ejecutar

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:browser
```

Puede usarse `DOCWORKS_BROWSER_EXECUTABLE=/ruta/al/chromium npm run test:browser` con un navegador instalado. El ZIP incluye código fuente, lockfile, pruebas e informe. No incluye dependencias, datos de usuarios ni ejemplos que puedan confundirse con documentos de una operación real.
