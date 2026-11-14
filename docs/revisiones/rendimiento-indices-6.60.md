# DocWorks 6.60 — índices selectivos y validación

Fecha: 14/11/2026.

Se crearon siete índices de claves foráneas: tres sobre autoría y eliminación de operaciones, uno sobre auditoría, otro sobre historial de documentos, y dos sobre invitaciones y solicitudes de autorización.

Objetivo: mantener el rendimiento de consultas y verificaciones de integridad al crecer la aplicación. Sólo se ejecuta CREATE INDEX IF NOT EXISTS; no se alteran datos, políticas RLS, permisos ni contenido de documentos.

Migración aplicada en Supabase: 20261114190936_indices_fk_operaciones_auditoria_660.

Verificación: los siete índices aparecen en pg_indexes. Los avisos informativos de claves foráneas sin índice bajaron de 18 a 11.

El aviso de índices sin uso subió de 6 a 13 porque los siete índices acaban de crearse y todavía no acumulan estadísticas de uso. Se evaluará su utilidad cuando haya datos y consultas suficientes.

Se añade una prueba con PGlite que aplica dos veces la migración, comprueba idempotencia y verifica las siete columnas sin afectar la base real.