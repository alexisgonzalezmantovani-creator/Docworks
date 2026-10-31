# Registro directo con prueba de 14 días

La landing y el registro de la app crean una cuenta Supabase Auth con contraseña y requieren confirmar el email. La confirmación provisiona una inmobiliaria, dueño con permisos senior y membresía Inicial para hasta 3 usuarios. El plazo se calcula en el servidor desde `email_confirmed_at`; las fechas y roles enviados por el cliente no se aceptan.

Las invitaciones tienen prioridad y conservan la inmobiliaria y el rol previstos. El alta es idempotente y conserva las cuentas existentes. La nueva columna `membresias.es_prueba` es falsa para las membresías anteriores.

Al vencer, el contexto bloquea la app y los triggers rechazan escrituras de la prueba vencida en operaciones, configuración, cláusulas, modelos, invitaciones y versiones. Se conserva la información; el usuario puede consultar planes. Una sesión abierta vuelve a consultar el contexto al vencer. La prueba no solicita tarjeta ni crea una suscripción de Mercado Pago.

## Base de datos

`supabase/registro-prueba.sql` corresponde a la migración remota `registro_publico_prueba_14_dias`, sobre el esquema existente de DocWorks. No ejecutar otra vez: contiene triggers de creación única. Las funciones internas viven en un esquema sin acceso para anon/authenticated. Las RPC públicas comprueban la identidad autenticada.

## Validación

- `npm run check`: TypeScript, suites existentes, registro en React/JSDOM y formulario de landing, compilación.
- `tests/database/registro-prueba-rollback.sql`: ejecutar entre BEGIN y ROLLBACK; prueba confirmación, dueño, plazo, idempotencia, aislamiento, intento de extensión desde cliente, vencimiento, datos conservados e invitación de broker. No envía correos ni conserva usuarios de prueba.
- Auth: registro email habilitado y autoconfirmación desactivada, comprobados con la configuración pública del proyecto.

La entrega real del correo y la apertura de su enlace desde un dispositivo necesitan una prueba con un buzón real. Las pruebas de base de datos simulan la confirmación dentro de una transacción revertida; no demuestran entregabilidad SMTP. No se realizó inspección visual en un navegador real en este entorno.
