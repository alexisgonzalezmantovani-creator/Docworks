# DocWorks 6.18 — permisos de operaciones

Publicación autorizada expresamente por Alexis el 2/11/2026.
Base anterior: `8b1fb66d684bac80e2c23a3114a77d25200b3f29` (6.17).

La versión aplica controles de lectura/escritura por rol en operaciones,
versiones y auditoría. Dueño/Administrador gestionan su inmobiliaria; Asesor
crea y edita operaciones propias; Vendedor crea y consulta propias; Solo lectura
consulta sin modificar. La papelera se gestiona con Dueño/Administrador.
La autorización se comprueba en el servidor, además de la interfaz.

Las listas cambian después de una escritura confirmada. Se evita aplicar
respuestas de una sesión anterior al cambiar usuario, rol o inmobiliaria;
se protegen los reintentos y borradores vinculados al contexto original.
No se alteran textos de los ocho modelos, firmas, cotitulares ni snapshots
históricos. La migración modifica funciones, políticas y permisos, sin ejecutar
altas, bajas, reasignaciones ni purgas de datos existentes.

Migración: `20261102153121_permisos_operaciones_roles_6_18.sql`, creada con
Supabase CLI 3.0.0. Incluye preflight contra deriva y límites de espera de locks.
Reversión de DDL preparada en `supabase/propuestas/permisos-operaciones-rollback.sql`;
revisar su preflight antes de utilizarla. Nunca ejecutar una reversión a ciegas.

Los informes anteriores describen la etapa local previa: sus indicaciones
«sin aplicar» son históricas y no sustituyen el resultado de esta publicación.

Validación previa: suites del proyecto, 70 controles DOM/servicios simulados,
113 verificaciones SQL por motor (PostgreSQL 17.5 y 18.6 en PGlite), y revisión
responsive en Chromium con datos ficticios. No acreditan autenticación real,
concurrencia entre conexiones, Safari/dispositivos físicos ni generación real
de Gemini. Esos controles siguen pendientes y se informan como tales.

La publicación no completa los datos legales del responsable, decisiones de
conservación/transferencias, licencias de modelos ni revisión fonética de marca.
No se publica una política legal incompleta ni se despliega una nueva función IA.

Verificación posterior de base: migración aplicada; RLS activo en las tres tablas,
helpers privados con acceso restringido y rechazo de escrituras sin sesión comprobado.
