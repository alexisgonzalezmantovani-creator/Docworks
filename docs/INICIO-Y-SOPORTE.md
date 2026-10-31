# Primeros pasos y centro de ayuda

El primer ingreso de dueños y administradores nuevos presenta tres pasos: datos institucionales y logo opcional, invitación opcional de un broker, selección del primer documento. El nombre se precarga desde el registro. El guardado utiliza la RPC existente del perfil, conserva los modelos y solo avanza si la nube confirma éxito. No cambia permisos ni requiere migraciones.

El avance se guarda por inmobiliaria en `inicio_inmobiliaria`; el borrador de campos se guarda en el dispositivo con clave de inmobiliaria y usuario. Continuar después permite retomarlo desde Ayuda o Configuración → Soporte. Los usuarios que ya cerraron el recorrido anterior no reciben una nueva interrupción automática. Los brokers tienen acceso a Soporte y operaciones, sin configuración institucional.

La invitación existente prepara una fila de acceso; no envía un correo automáticamente. El paso ofrece copiar el enlace de registro para compartirlo. Al registrarse con el email invitado se conserva el rol/inmobiliaria del equipo.

Soporte incluye búsqueda sin acentos, guías por tarea, preguntas desplegables, acceso al asistente y consultas por WhatsApp o correo configurado. Las capturas usan Compartir en dispositivos compatibles y el texto explica el adjunto manual cuando corresponde. No se abre un correo sin destinatario. No se envía ninguna consulta sin acción del usuario.

Validación: `npm run check`, `tests/inicio-soporte.cjs` (precarga, fallos, progreso, invitación, reanudación, documento, búsqueda y rol), `tests/inicio-soporte-browser.cjs` en Chromium/WebKit (320–1440 px). Guardado y relectura del avance verificados con la RPC real dentro de una transacción revertida.
