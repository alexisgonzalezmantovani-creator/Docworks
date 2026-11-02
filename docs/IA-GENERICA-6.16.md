# DocWorks 6.16 — Consultas y cláusulas genéricas

Se habilitan consultas generales y redacción de cláusulas a partir de ideas
genéricas. El asistente no recibe operaciones cargadas ni ofrece adjuntos.
El usuario ve una indicación breve de no incluir datos personales o confidenciales.

## Controles

- El servidor admite solo `generic_chat` y `generic_clause`, con mensajes de texto.
- Rechaza los modos anteriores, estructuras de adjuntos y campos adicionales de
  operaciones/documentos. Conserva verificación de sesión y JWT.
- Cliente y servidor comparten un filtro básico de correos, identificadores,
  teléfonos y ciertos domicilios rotulados, así como límites de tamaño.
- Este filtro es orientativo: no identifica todos los nombres, domicilios ni
  información confidencial. No equivale a anonimización ni garantiza ausencia de
  datos personales. El servicio debe utilizarse solo con planteos genéricos.
- La revisión de documentos y mejora de encabezados existentes siguen bloqueadas
  antes de preparar o transmitir su contenido. Clientes anteriores no pueden
  utilizar los modos de envío anteriores para contactar al proveedor.
- Se elimina el registro de respuestas de error completas del proveedor.

## Verificación

La prueba `tests/privacidad-ia.cjs` ejecuta el manejador real con autenticación y
proveedor simulados: comprueba consultas y cláusulas permitidas, rechazos sin
transmisión de los casos bloqueados, ausencia de adjuntos y operaciones en el
asistente y el bloqueo de constructores documentales. Se ejecuta además la suite
de documentos, interacción y compilación existente.

En producción se comprueban los rechazos con solicitudes sintéticas y sin datos
personales. No se utiliza una sesión de cliente ni se envían documentos reales
para probar el proveedor. Sigue pendiente una comprobación de generación dentro
de una sesión de usuario real.
