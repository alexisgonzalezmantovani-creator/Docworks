# Permisos de operaciones — propuesta local probada

Fecha: 2/11/2026. Base de código: DocWorks 6.17, commit
`8b1fb66d684bac80e2c23a3114a77d25200b3f29`.
Estado: **no aplicado a producción**, sin pushes, previews ni migraciones reales.
No se consultaron registros de clientes. Se leyeron únicamente definiciones,
columnas, restricciones, políticas, privilegios y avisos de seguridad del catálogo.
La app publicada sigue en 6.17 y la función de IA en su versión 11.

## Corrección preparada

La autenticación por sí sola no garantiza autorización. Las RPC de guardar,
borrar y restaurar comprobaban la inmobiliaria, pero no implementaban los roles
anunciados por `ROLES_DEF`. El caso de un viewer creando una operación se
reprodujo únicamente con datos ficticios en una base local en memoria.

La propuesta aplica esta matriz existente en la interfaz:

| Rol | Lectura | Crear | Editar | Papelera / borrado |
| --- | --- | --- | --- | --- |
| Dueño | Toda su inmobiliaria | Sí | Toda su inmobiliaria | Sí, dentro de su inmobiliaria |
| Administrador | Toda su inmobiliaria | Sí | Toda su inmobiliaria | Sí, dentro de su inmobiliaria |
| Asesor (broker) | Propias | Propias | Propias | No |
| Vendedor | Propias | Propias | No | No |
| Solo lectura (viewer) | Toda su inmobiliaria | No | No | No |
| Inactivo / sin pertenencia | No | No | No | No |

«Propia» significa asignada por `datos.broker_id`; cuando falta ese campo se
utiliza el `creado_por` de la fila del servidor. Si existe asignación, prevalece
sobre quién creó la operación. El alta de broker/vendedor sin asignación queda
asignada al actor por el servidor. No se reescriben asignaciones históricas.
La reasignación corresponde a Dueño/Administrador y se valida el usuario destino
activo y de la misma inmobiliaria. Los campos de rol/inmobiliaria enviados en el
JSON no conceden permisos.

La restauración, vaciado y purga se reservan a Dueño/Administrador, coherente con
la gestión de borrado. La semántica de pertenencia y el acceso de Vendedor deben
revisarse como decisión de producto antes de activar esta matriz. No se presume
que un permiso genérico de «crear» autorice editar o cerrar un documento padre.

### Cobertura del servidor

- Guardar distingue creación y edición; bloquea editar papelera, reasignarse una
  operación ajena, cambiar el asesor siendo broker y referenciar un padre ajeno.
- Se comprueba el actor activo en `usuarios`, no un rol contenido en JWT/JSON.
  El guardado bloquea la fila de usuario y la operación durante la transacción.
- Borrar, restaurar, borrar definitivamente, vaciar y purgar verifican el rol.
- Las RPC de listado y papelera y la política RLS de operaciones implementan el
  mismo alcance. Ocultar tarjetas del navegador no se usa como autorización.
- Historial de versiones y auditoría también limitan acceso a las operaciones
  permitidas. Para broker/vendedor la auditoría no vinculada a una operación
  accesible queda oculta; los registros no se eliminan.
- Se restringen privilegios directos innecesarios sobre versiones (incluido
  TRUNCATE). Las escrituras de los triggers SECURITY DEFINER siguen funcionando.
  No se afirma que TRUNCATE estuviera expuesto por un endpoint HTTP concreto.
- Los helpers no habilitan USAGE del esquema privado a los clientes. Las pruebas
  verifican que las políticas funcionan sin abrir ese esquema.
- No se añaden accesos globales a Superadmin: se mantienen sus RPC específicas
  existentes sin modificar. No se da acceso ordinario a un superadmin que no
  tenga pertenencia a una inmobiliaria.

## Interfaz y flujos añadidos en esta revisión

Se añadieron 70 comprobaciones con DOM y servicios simulados a las 113 SQL.
Los botones de crear/editar/cambiar estado/borrar, la gestión de papelera y la
restauración de versiones acompañan la matriz. El rol procede del contexto de
usuario de la sesión; el perfil institucional no puede elevar un viewer a dueño.
Los permisos de interfaz no reemplazan la autorización de las RPC.

- Borrar, restaurar, eliminar definitivamente y vaciar esperan confirmación antes
  de cambiar las listas. Un rechazo o excepción mantiene los documentos visibles.
- Duplicados y las cinco conversiones esperan confirmación antes de insertar la
  tarjeta o abrir el editor. Los dobles clics simultáneos de una misma conversión
  comparten una solicitud. La respuesta normalizada del servidor conserva la
  asignación del asesor en nuevas operaciones.
- Un Vendedor puede crear documentos pero no iniciar desde esos botones una
  conversión que requiera después editar el nuevo documento o cerrar su padre.
- Los callbacks de edición y negociación se deshabilitan para lectura; siguen
  disponibles abrir, consultar, compartir y descargar los documentos accesibles.
- Se descartan escrituras/respuestas de contextos anteriores al cambiar de
  usuario, rol, inmobiliaria o al desmontar. El formulario y visor no se trasladan
  a la siguiente sesión. Se comprueba la sesión local antes de enviar una RPC;
  esto ayuda a evitar envíos accidentales y no autentica al usuario por sí solo.
- Los nuevos borradores guardan identificadores de usuario e inmobiliaria fuera
  del contenido documental. El reintento automático exige que coincidan con la
  sesión. Los anteriores sin contexto se conservan para recuperación manual;
  no se les inventa un propietario ni se envían automáticamente. Si otro borrador
  aparece mientras una solicitud espera, el reintento no lo elimina.
- No se cambia el texto de cláusulas, snapshots ni documentos históricos. La
  comparación existente de los ocho modelos contra la base sigue pasando.

La prueba DOM extrae por AST los handlers reales y los ejercita con cierres de
estado ficticios. También monta el hook de Supabase y las pantallas/controles con
un cliente simulado. No equivale a una sesión real de Supabase ni mide layout.

## Archivos

- `supabase/propuestas/permisos-operaciones.sql`: propuesta de DDL transaccional;
  todavía no es una migración registrada ni fue aplicada al proyecto real.
- `supabase/propuestas/permisos-operaciones-rollback.sql`: reversión de ese DDL,
  con comprobaciones para no pisar modificaciones posteriores. Devuelve las
  políticas/privilegios anteriores, incluidos los menos restrictivos; no es una
  corrección alternativa ni se debe ejecutar como «mantenimiento» habitual.
- `tests/database/permisos-operaciones.cjs`: fixture y matriz contra PostgreSQL
  WASM en memoria; no contiene conexiones, URLs ni claves del proyecto.
- JSON de catálogo y estructura: evidencia de definiciones sin filas de clientes.
- `src/AccionesOperaciones.ts`: permisos de interfaz, contexto y confirmación.
- `tests/operaciones-roles.cjs`: 70 comprobaciones DOM y flujos simulados.
- `package.json`/lock: PGlite 0.5.14 fijado como dependencia de desarrollo;
  `npm run test:database` incorporado a `npm run check`.

Los preflight comprueban cuerpos, SECURITY DEFINER y search_path de las funciones,
políticas esperadas y ausencia de helpers anteriores. Si hay diferencias deben
revisarse; no forzar ni eliminar la comprobación para continuar. La reversión
comprueba también los helpers y las políticas de la propuesta.

## Pruebas y evidencia

**113 verificaciones SQL** aprobadas en cada uno de dos motores locales:
PostgreSQL 18.6 (PGlite 0.5.14) y PostgreSQL 17.5 (PGlite 0.3.14).
La base real usa PostgreSQL 17.6: no se presenta una prueba en WASM como una
prueba integral de Supabase ni de su gateway de autenticación.

Las comprobaciones SQL cubren dos inmobiliarias, todos los roles, anónimo, usuario
inactivo, usuario sin pertenencia, superadmin sin tenant, falsificación de rol,
reasignaciones, parent ajeno, RLS/REST equivalente por SELECT de tablas, listado,
papelera, versiones, auditoría, inserciones directas y TRUNCATE. Cada rechazo de
escritura compara operaciones, versiones y auditoría antes/después.

Las escrituras autorizadas preservan firmas, cotitulares, snapshot personalizado
y versiones previas mediante los triggers originales. Se conserva el bloqueo de
prueba vencida y la purga posterior a 30 días. Se verifica que instalar y revertir
el DDL no cambien filas y que el preflight rechace modificaciones intermedias.

`npm run check` pasó: typecheck, suites anteriores de IA/documentos/editores/
sesiones/biblioteca/registro/ayuda, nueva matriz SQL y build. El verificador de integración ahora carga la configuración real de tsconfig,
en lugar de opciones incompatibles con los imports de React. El typecheck y
el verificador de integración informan cero diagnósticos. Permanece el aviso
previo de bundle grande de Vite. El texto de los modelos no fue modificado.

### Reproducir en una copia local

1. Aplicar el parche a una copia aislada del commit base, sin conectarla a un
   despliegue. Ejecutar `npm ci --no-audit --no-fund` y `npm run check`.
2. Para repetir con PostgreSQL 17.5, instalar PGlite 0.3.14 en una carpeta de
   validación separada con `npm install --prefix /ruta/pg17 --save-exact
   @electric-sql/pglite@0.3.14 --no-audit --no-fund`.
3. Ejecutar `DOCWORKS_TEST_PGLITE_MODULE=/ruta/pg17/node_modules/@electric-sql/pglite
   npm run test:database` (en una sola línea). La variable selecciona únicamente
   una biblioteca local de prueba; no una URL de base de datos.

## Límites y siguiente paso técnico

- Falta ejecutar esta matriz en un entorno Supabase/PostgreSQL 17.6 de prueba,
  con autenticación real, antes de programar una migración de producción.
  No se creó una rama de Supabase que pudiera generar cargos.
- PGlite usa una conexión; no se probaron carreras simultáneas de usuarios,
  cambio de rol y borrado/asignación entre sesiones. Los bloqueos de filas se
  incluyen, pero no se afirma validación de concurrencia entre procesos.
- Los flujos por rol, conversiones, respuestas tardías y recuperación ante
  rechazos ya se comprobaron en DOM con servicios simulados. Falta repetirlos
  con Supabase real de prueba, incluidos cambios de estado, cierres vinculados,
  red móvil y borradores. Se agregó revisión responsive en Chromium con datos
  ficticios, documentada en `QA-RESPONSIVE-2026-11-02.md`; no acredita iPhone/iPad
  físico ni Safari.
- Se conserva la clave local histórica de borrador por compatibilidad. No se
  presenta el navegador compartido como aislamiento entre cuentas ni se asegura
  cifrado de cachés locales. La vinculación manual de borradores sin contexto
  sigue requiriendo verificar su origen; no se asignaron a una inmobiliaria.
- No se probó exhaustivamente todo el esquema (cobros, invitaciones, cláusulas,
  soporte u otros servicios). No se presenta como auditoría total.
- Permanecen pendientes los datos legales confirmados, política de conservación
  y transferencias, fuentes/licencias, revisión fonética de marca, QA en
  dispositivos reales y generación real de Gemini. No se inventaron datos para cerrar
  esos puntos.

Antes de activar: revisar la matriz, comprobar deriva contra el catálogo actual,
validar en Supabase de prueba, generar una migración versionada mediante CLI y
planificar aplicación y reversión. La autorización previa para publicar 6.17 no
se tomó como autorización para aplicar cambios nuevos a la base real.

## Fuentes técnicas

- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Funciones de base de datos: https://supabase.com/docs/guides/database/functions
- PostgreSQL 17, RLS: https://www.postgresql.org/docs/17/ddl-rowsecurity.html
- PGlite: https://pglite.dev/docs/ y https://pglite.dev/docs/api
