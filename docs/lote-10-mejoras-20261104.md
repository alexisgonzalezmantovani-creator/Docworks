# DocWorks 6.20 — tanda de diez mejoras

Una sola publicación a producción desde main, después de validar localmente.

1. Tooltip de Estadísticas con texto y fondo del tema; color explícito de ítems y etiqueta.
2. Nueva operación usa el mismo filtro de catálogo que Biblioteca; no ofrece extras históricos que pertenecen al modelo.
3. Vista previa y Guardar cambios quedan compactos sobre el fondo, sin tarjeta blanca.
4. Crear cláusula gana espacio y se alinea con la cabecera del selector en Biblioteca.
5. Las condiciones base están en Biblioteca, sin el paso de importar ideas. La provisión agrega solo temas ausentes, respeta bajas y conserva personalizaciones.
6. Se elimina el nombre del documento repetido debajo del selector.
7. Introducción separa campos obligatorios del texto base (azul) y opcionales (gris); ambos insertan chips reales.
8. Mejorar con IA funciona sobre plantillas genéricas con tokens. Valida respuesta, conserva chips existentes y exige los necesarios. Los fallos mantienen el texto original. La revisión de operaciones reales sigue deshabilitada.
9. Restablecer pide confirmación, persiste el texto predeterminado y cierra el editor solo si el guardado fue correcto.
10. Selector visual aprobado en Documentos y Biblioteca, con ocho documentos y Todas en Biblioteca, adaptable a móvil.

Se conserva la tipografía actual por decisión del usuario.

## Validación

- TypeScript: cero diagnósticos; suite general y compilación Vite aprobadas.
- 28 verificaciones específicas de la tanda, incluidas respuestas de IA simuladas en los ocho documentos y su resolución al generar texto.
- 435 comprobaciones en Chromium con tamaños de iPhone, iPad y escritorio; revisión de capturas de Documentos.
- 113 verificaciones de permisos en PostgreSQL en memoria y prueba adicional de provisión, deduplicación, bajas e idempotencia.
- Respaldo de código verificado y respaldo de datos guardado antes de las escrituras.
- Tras la provisión se compararon todos los registros originales de cláusulas y perfiles. Las 54 operaciones conservaron la misma huella; no se modificaron.

La simulación de tamaños no sustituye una prueba en Safari/iOS real. El proveedor de IA se verifica por separado en producción cuando hay una sesión disponible.
