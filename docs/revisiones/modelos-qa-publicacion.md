# Creador de modelos — modo remoto QA (desactivado por defecto)

La rama `preview-creador-modelos` contiene la integración preparada, **pero no ejecuta escrituras remotas** mientras `VITE_DOCWORKS_MODELOS_NUBE_QA` no tenga el valor literal `true`. El laboratorio continúa guardando en el navegador en su configuración actual.

## Qué hace el modo QA
1. Administrador o dueño: al elegir uno de los ocho documentos se carga su borrador y versiones compartidas.
2. Al guardar se envía `estado` con `revision` previa a `fn_dw_modelo_lab_guardar`. Una revisión obsoleta devuelve error, sin pisar los cambios de otro administrador.
3. Publicar escribe un snapshot inmutable para la vista del asesor en una **tabla separada**. No toca plantillas ni operaciones existentes.
4. Broker/asesor: puede consultar en Documentos el modelo publicado, en modo solo lectura. No puede leer el borrador ni versiones internas.
5. Si falla la conexión, el guardado remoto se bloquea; **no se sustituye silenciosamente por guardado local**.

## Requisitos para activarlo
- Supabase requiere aprobación del costo para crear una rama de desarrollo. **No se creó ninguna** y no se aplicó SQL en producción.
- Crear una base QA aislada autorizada, aplicar `supabase/propuestas/modelos-laboratorio-preparacion.sql` **solamente allí** y revisar `get_advisors`.
- Probar con un dueño, un administrador, dos brokers, un usuario inactivo y usuarios de otra inmobiliaria; verificar las respuestas RLS ante intentos directos de SELECT / INSERT / UPDATE.
- Simular dos administradores guardando a la vez; solo uno debe avanzar la revisión.
- Configurar `VITE_DOCWORKS_MODELOS_NUBE_QA=true` **exclusivamente en el despliegue conectado a esa base QA**, no en producción.
- Validar el modelo publicado frente al generador PDF/DOCX y la compatibilidad de snapshots históricos antes de integrarlo en Nueva operación.

## Limitación importante
Esta fase aporta guardado compartido y una vista de publicación **en un entorno preparado**. Aún no conecta el modelo publicado al documento exportado de una operación real. Para liberar la función se requiere revisar legalmente los textos y hacer pruebas de regresión.

Última revisión: noviembre 2026.
