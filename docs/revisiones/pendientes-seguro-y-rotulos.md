# Revisión: seguro y rótulos de partes

Solicitado el 6 de noviembre de 2026. Seguro y rótulos implementados en 6.31; los recordatorios por correo continúan pendientes de proveedor y remitente verificado.

- Revisar qué obligación representa «Incluir una cláusula de seguro» en contrato de alquiler. Sacar esta decisión de la selección inicial del tipo de documento. Evaluar su ubicación en Cláusulas y mantener la configuración relacionada junto a ella, sin duplicar controles. Verificar operaciones históricas y conservar su selección al editarlas. El apartado de garantía requiere analizarse por separado antes de usarlo para esta opción.
- En reserva de alquiler, mostrar «Locatario (inquilino)» como título del paso de la persona.
- Eliminar el recuadro «Locatario: quien alquila el inmueble (el inquilino)», porque repite el título.

## Correo: alcance acordado para evaluar

Avisos personales al broker asignado y/o al responsable de la inmobiliaria para firmas y recordatorios. Todavía no hay servicio de correo automático integrado en el repositorio. Debe definirse una fecha/hora de firma explícita, destinatarios y preferencias, reprogramación/cancelación al cambiar el evento, zona horaria Argentina, deduplicación persistente y registro de estado de los envíos. La implementación necesita un proveedor y remitente verificado. No se habilitaron envíos ni se creó una automatización personal de ChatGPT.

## Ampliación: todas las partes de todos los documentos

Aplicar la misma política al locador y a las demás partes: título único y claro, aclaración breve entre paréntesis cuando aporte contexto y eliminación de la frase «Completá los datos de…» que repite el título. En reserva de compra revisar «Comprador (oferente)» o «Oferente (comprador)»; conservar el rol correcto en cada documento. Revisar comprador/vendedor en boleto, locador/locatario en alquiler y reserva, comodante/comodatario, autorizante e inmobiliaria. Esta limpieza corresponde a los rótulos del formulario y no autoriza a cambiar automáticamente los roles dentro de cláusulas o documentos históricos.

## Implementación 6.31

El seguro de RC e incendio y su plazo están juntos en Cláusulas del contrato de locación; se retiraron de la selección inicial y de Condiciones. Se conserva el valor histórico, incluyendo la compatibilidad de operaciones sin bandera explícita. El seguro de caución permanece en Garantía. Los títulos de las partes se muestran una vez, sin tarjeta de definición ni «Completá los datos de…». Locatario lleva «(inquilino)» y el comprador de una reserva lleva «(oferente)». Los rótulos jurídicos de documentos y snapshots no se renombraron.
