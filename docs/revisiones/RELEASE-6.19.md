# DocWorks 6.19 — inicio unificado

El inicio alternaba un splash con temporizador y una pantalla de conexión
distinta. Se conserva una sola presentación: logo e indicador «Cargando…»
debajo, desde el HTML inicial hasta la resolución de la sesión. Se elimina
la espera visual fija y las variantes de splash que ya estaban inactivas.

La vista de error conserva el logo y el botón Reintentar. El indicador de
carga tiene role=status y no es un botón interactivo. Se respeta la preferencia
de movimiento reducido y se reserva el tamaño de imagen para evitar saltos.
La lógica de autenticación, la base de datos y los documentos no cambian.

Validación: npm run check aprobado, cero diagnósticos TypeScript y build final
aprobado. Revisión en Chromium con pantalla de carga, error/reintento y paso
al formulario mediante estados simulados, sin introducir credenciales reales.
El HTML inicial a 390×844 mostró logo e indicador, sin desbordamiento horizontal.
No equivale a una prueba en Safari o en un iPhone físico.
