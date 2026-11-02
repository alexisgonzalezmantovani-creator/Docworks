# DocWorks 6.15 — Pausa de IA por modalidad gratuita

El titular confirmó que utiliza Gemini API en modalidad gratuita. Sus condiciones
indican que no deben enviarse datos personales o confidenciales en esa modalidad.
La integración revisada permitía enviar contratos, operaciones y archivos reales.

## Protección aplicada

- La función `ia-docworks` responde `IA_PRIVACIDAD_PAUSADA` a solicitudes POST
  antes de leer el cuerpo o realizar solicitudes externas. Conserva CORS y
  `verify_jwt=true`.
- El cliente comprueba la pausa antes de las cuatro rutas que invocan IA:
  encabezados, cláusulas, revisión documental y chat.
- El panel del asistente muestra su estado sin permitir adjuntos ni texto libre.
- Edición manual, cláusulas, operaciones y exportaciones PDF/DOCX se conservan.
- No se modificaron datos de clientes ni se contrató un servicio de pago.

## Verificación

`tests/privacidad-ia.cjs` ejecuta el manejador real y comprueba que no se lee el
cuerpo ni se realiza ninguna solicitud de red durante la pausa. También cubre
CORS y métodos no admitidos. La prueba forma parte de `npm test`.

Se ejecutaron los controles existentes de TypeScript, construcción, interacción
y generación documental. La publicación de la función se comprueba mediante
una solicitud sintética sin datos personales y la lectura de su versión activa.

## Reactivación

Revisar primero modalidad del proveedor, acuerdos de tratamiento, garantías para
transferencias y minimización de datos. Cambiar conjuntamente la configuración
del cliente y del servidor después de esa revisión. Activar facturación no
sustituye por sí solo el cumplimiento de las obligaciones de privacidad.

Fuentes:
https://ai.google.dev/gemini-api/terms
https://www.argentina.gob.ar/transferencias-internacionales
