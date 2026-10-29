# DocWorks 6.08 PRO

Crear una cláusula desde Biblioteca permite elegir sus documentos y dejarla disponible
para asesores con una sola acción: **Guardar y habilitar**. La disponibilidad viene
marcada; al desmarcarla, **Guardar cláusula** guarda únicamente el texto en la biblioteca.
Las ideas de fábrica abren este mismo editor para revisar el texto antes de guardar.

Las condiciones especiales siguen en el último paso de la operación y se imprimen
después del cuerpo del documento. Habilitar una opción permite elegirla; no la selecciona
automáticamente en una operación. Las operaciones con instantánea conservan su modelo.

El aviso compara títulos de la biblioteca. Muestra hasta tres coincidencias con textos
desplegables y permite guardar igualmente. Cada cláusula mantiene su identidad, texto y
plazo: una condición de crédito de 90 días y otra sin plazo pueden coexistir.

Si la cláusula se creó y falla la actualización de disponibilidad, el editor conserva el
identificador confirmado y ofrece **Reintentar habilitación**. Este reintento no vuelve a
crear la cláusula. Ante una respuesta de creación incierta, se pide revisar la biblioteca
antes de otra alta.

## Validación

- `npm run check`: aprobado; TypeScript e integración con cero diagnósticos.
- 86 verificaciones documentales, 92 de interacción, 25 de sesiones con SDK simulado,
  ocho editores, 26 de condiciones especiales y 19 de biblioteca simple.
- Las pruebas nuevas cubren variantes de plazo, documentos elegidos, guardado solo en
  biblioteca, fallos y reintentos de habilitación, y conservación de datos existentes.
- Se verificó por consulta de solo lectura que la RPC actual de creación devuelve UUID.
- Compilación Vite aprobada; se mantiene su advertencia por tamaño del paquete.
- Prueba autenticada del nuevo flujo y comprobación de diseño en navegadores pendientes.

## Estado de entrega

Versión local basada en 6.07, que incorpora los cambios anteriores sobre main 6.06.
No enviada a GitHub ni publicada. El control automático del turno anterior rechazó
el envío de código al repositorio y solicitó autorización explícita en este chat.
