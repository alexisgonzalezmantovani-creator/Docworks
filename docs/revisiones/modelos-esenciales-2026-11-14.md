# DocWorks — Modelo esencial y biblioteca ampliable
Fecha: 2026-11-14
Estado: propuesta técnica y jurídica para revisión; NO es un contrato publicado.

## Principios aprobados
- Conservar diseño, navegación y estructura de formularios actuales.
- El modelo por defecto debe ser breve, comprensible y funcional.
- No borrar ni sobrescribir cláusulas existentes ni documentos/operaciones históricos.
- Las inmobiliarias conservan modelos propios y textos personalizados.
- Cambios futuros en defaults: versión nueva, nunca migración destructiva.
- Revisar contenido jurídicamente antes de habilitarlo para operaciones reales.
- Evitar textos de interfaz que describan lo que ya resulta obvio de un campo.

## Reserva de compraventa — contenido mínimo propuesto
1. Identificación de oferente y destinatario de la oferta y descripción precisa del inmueble.
2. Precio, moneda, suma entregada, quién la recibe, carácter de esa entrega y modalidad de pago.
3. Plazo y mecanismo de aceptación o rechazo del vendedor.
4. Vigencia de la oferta y fecha/condiciones de boleto o escritura según lo pactado.
5. Consecuencias expresas de aceptación, rechazo e incumplimiento, aclarando el régimen de señal/arras pactado.
6. Honorarios de intermediación (porcentaje, sujeto obligado y exigibilidad) sin duplicar sanciones.
7. Notificaciones/domicilios de las partes y firmas.
8. Condiciones documentales, posesión y gastos solo en cuanto sean relevantes al acuerdo concreto.

## Reserva — clasificación preliminar de bloques existentes
Mantener en el núcleo, con redacción revisada: reserva.precio, reserva.valor_reserva,
reserva.forma_pago, reserva.honorarios, reserva.vencimiento_aceptacion,
reserva.vencimiento_reserva, reserva.incumplimiento, reserva.devolucion_no_conforme,
reserva.notificacion_valida.
Revisar para consolidar, sin eliminar: reserva.honorarios_impuestos,
reserva.incumplimiento_honorarios, reserva.escribano.
Candidatos a opcionales/condicionales, preservando su texto original en biblioteca:
reserva.refuerzo, reserva.asesoramiento, reserva.moneda_condicion_esencial.
El tratamiento de moneda no puede dar por supuesto USD cuando la operación está en ARS.
La ausencia de un bloque opcional nunca debe borrar un pacto previamente guardado.

## Boleto — estructura esencial objetivo
- Partes y legitimación; descripción del inmueble y documentación.
- Precio, moneda, entregas y saldo; vencimientos y medios de pago.
- Escritura, escribanía, plazos y obligaciones documentales.
- Entrega de posesión, estado y gastos/deudas según acuerdo.
- Consecuencias de incumplimiento, honorarios cuando correspondan, domicilios y firmas.
- Condiciones especiales (crédito, cesión, refuerzos, inventario, etc.) fuera del núcleo salvo que la operación las requiera.

## Biblioteca / experiencia
- Mantener todos los textos y versiones previos, sin resembrar por encima de personalizaciones.
- Extras sugeridos por tipo: crédito hipotecario, refuerzo, inventario/mobiliario,
  interiores pintados, aires incluidos y situaciones particulares que correspondan.
- El asesor ve únicamente extras habilitados por su inmobiliaria.
- Mantener orden estable en la lista al activar una cláusula.
- Mostrar en el documento final solo las cláusulas efectivamente incorporadas.
- No alterar diseño de tarjetas, selectores, colores ni navegación.
- Antes de activar nuevos defaults, probar exportaciones PDF/DOCX, los ocho tipos,
  documentos enlazados, snapshots de operaciones anteriores y aislamiento multi-tenant.

## Precauciones jurídicas
Fuente oficial: https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975/actualizacion
Artículo 1059: señal confirmatoria por defecto; pérdida/doble devolución si se pacta
facultad de arrepentimiento. No equiparar cualquier incumplimiento a arrepentimiento.
Artículos 1170-1171: condiciones de prioridad/oponibilidad del boleto; la mera
existencia del boleto no garantiza esos efectos.
Arts. 984-989: contratos por adhesión y cláusulas legibles/no abusivas.
El DNU 70/2023 modificó reglas de locación: revisar separately cada modelo de alquiler.
Revisión profesional argentina requerida antes de publicación comercial de los nuevos textos.

## Estado de ejecución
Auditoría y clasificación realizadas. No se cambió el contenido jurídico de los
modelos de producción en esta etapa. El modelo de Susana Aravena mencionado por
el usuario no estuvo recuperable de manera verificable; no se atribuye texto a él.
