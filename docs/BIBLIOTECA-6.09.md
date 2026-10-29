# DocWorks 6.09 PRO

## Corrección comprobada

En 6.08, cambiar desde Biblioteca a Documentos cerraba el editor y perdía una cláusula
en redacción. La prueba nueva reprodujo el fallo antes de la corrección.

El editor ahora protege el borrador al cambiar de sección, usar la navegación principal,
cerrar la edición o recargar la página. Cancelar la salida conserva el texto. Confirmar
el descarte cierra el editor sin crear ni modificar cláusulas. Un editor nuevo vacío se
cierra directamente. La advertencia de recarga depende del soporte del navegador.

Durante un guardado o una generación de texto, la navegación espera a que termine la
acción. Si la cláusula ya fue creada pero falta habilitarla, la confirmación de salida
explica ese estado; el reintento conserva el UUID confirmado y no repite el alta.

## Validación

- `npm run check`: aprobado; TypeScript y comprobación de integración con cero diagnósticos.
- 86 verificaciones documentales, 92 de editores, 25 de sesiones con SDK simulado,
  ocho editores del workspace, 26 de condiciones especiales y 31 de biblioteca.
- Chromium 153: 327 verificaciones en tamaños de iPhone, iPad y escritorio, con
  servicios de guardado simulados y red externa bloqueada por el harness.
- WebKit 26.5: otras 327 verificaciones en los mismos tres tamaños.
- Capturas internas del formulario móvil inspeccionadas en ambos motores: sin desbordes horizontales.
- Incluye crear y habilitar, comparación orientativa de títulos, alcance por documento,
  cancelación de salida con borrador y fallo/reintento de habilitación sin duplicar altas.
- Vite compila; mantiene la advertencia previa por tamaño del bundle.
- WebKit se ejecutó con bibliotecas temporales. Se omitió la comprobación del registro
  de paquetes del sistema porque las bibliotecas no se instalaron globalmente; se
  ejecutaron las mismas pruebas de navegador sin omitir sus aserciones.
- Quedan pendientes la prueba autenticada del nuevo flujo y los dispositivos físicos;
  la emulación de tamaño y WebKit Linux no equivalen a Safari en un iPhone real.

## Corrección detectada al verificar el despliegue

El archivo externo de Recharts esperaba React, ReactDOM y PropTypes globales y fallaba
con `forwardRef` al iniciar la app. Recharts 2.12.7 queda fijado en package-lock y se
carga como módulo del mismo paquete de la app al abrir Estadísticas. Las pruebas de
navegador ahora verifican que se dibujen los gráficos con la red externa bloqueada.

## Estado

Incluye las mejoras de 6.07 y 6.08. Las condiciones especiales conservan su lugar al
final de la operación y del documento; el aviso por títulos parecidos permite guardar
textos con condiciones y plazos distintos.

Publicación autorizada por el usuario. Respaldo previo en
`backup/docworks-6-06-before-6-09-2026-10-29`. La rama de entrega es
`release/docworks-6-09-pro` y pasa por la matriz CI antes de actualizar producción.
