# Creador de modelos — avance aislado en preview-creador-modelos

## Entregado
- Laboratorio actual (Reserva): usar base, adaptar cláusulas y crear texto propio.
- Guardado y versiones **locales**, aislados por inmobiliaria y usuario en el navegador.
- Publicación **simulada**: no afecta las plantillas ni está disponible para asesores reales.
- Reserva y acta de conformidad: previsualización editable y separada; aún no exporta archivos independientes.
- Operaciones: corrección del espacio para Documento, Abrir, Editar y menú ⋯ en escritorio/tablet.

## Preparado para la siguiente fase, aún desactivado
- `supabase/propuestas/modelos-laboratorio-preparacion.sql`: tablas exclusivas para borradores y modelos publicados, RLS por inmobiliaria y rol, RPC atómica con control de revisión.
- `src/ModelosLaboratorioNube.ts`: contrato cliente para leer borradores, leer modelos publicados y guardar revisiones; el módulo **no está conectado al flujo de usuario**.
- La base de producción no se modificó. No correr el SQL sobre la base compartida antes de pruebas de RLS con dueños, administradores, brokers, usuarios ajenos y usuarios desactivados.

## Pruebas necesarias para habilitar sincronización
1. Aplicar esquema a una **base QA** y realizar pruebas SQL de aislamiento de inmobiliarias, roles y actualizaciones concurrentes.
2. Asegurar que un broker solamente lea el snapshot publicado, nunca borradores o versiones en edición.
3. Probar conflicto de guardado cuando dos administradores editan la misma reserva.
4. Conectar mediante feature flag **solo después** de la validación; migrar borrador local con consentimiento y sin sobrescribir versiones nuevas.
5. Habilitar publicación real y exportación independiente de acta una vez validado el motor PDF/DOCX.
6. Probar tarjetas Operaciones a 1440, 1100, 900, 768 px e iPhone horizontal/vertical, especialmente con menú `⋯`.

Ningún cambio de esta propuesta modifica las operaciones históricas ni se fusiona con `main`.
