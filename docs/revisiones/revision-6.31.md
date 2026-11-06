# Revisión 6.31 · seguro y rótulos de las partes

## Comportamiento

- «Incluir cláusula de seguro» se ubica en Cláusulas del contrato de locación, junto al plazo para contratarlo. La pantalla inicial se limita a elegir documento; Condiciones conserva mora y rescisión.
- La opción corresponde al seguro de responsabilidad civil e incendio que ya figuraba en el modelo. El seguro de caución continúa como alternativa de garantía. No se cambió la redacción jurídica del seguro.
- Las operaciones históricas conservan verdadero/falso y su plazo. Cuando una operación antigua carece de bandera explícita, se mantiene su comportamiento anterior (incluida). Desmarcar conserva el plazo para recuperarlo si se vuelve a incluir.
- Se corrigió un fallo del generador estándar: podía imprimir SEGURO aunque se hubiese desmarcado. Se comprueba el resultado con cuerpo estándar y editable, tanto en PDF como en Word.
- Los avisos sobre un plazo inválido del seguro llevan al paso 7, Cláusulas, donde se muestra el campo.
- Cada persona tiene un solo título. Se retiran «Completá los datos de…», la tarjeta que define el rol y su tooltip repetido. Los títulos son Comprador (oferente) en reserva, Locatario (inquilino) en locación/reserva de alquiler, Comodante (entrega el inmueble), Comodatario (recibe el inmueble), y los restantes roles sin definición repetida. Locador no se convierte automáticamente en «propietario»: no se afirma una titularidad que el formulario no verificó.
- La información de inmobiliaria autorizada se resume como datos del perfil. No se modifican roles jurídicos dentro de contratos, cláusulas o snapshots.

## Comprobaciones

`tests/seguro-rotulos.cjs`: 35 comprobaciones de rótulos en los ocho tipos, ausencia de seguro en selección inicial, recuperación de la opción histórica en Cláusulas, paso de navegación correcto y 6 casos de exportación (activado, desactivado y sin bandera, con cuerpo estándar y editable): 6 PDF y 6 Word.

`tests/recorridos-browser.cjs` añade la ausencia del control en selección/condiciones, su presencia y alternancia en Cláusulas, el plazo editable y la ausencia de las tarjetas de definición durante todos los pasos. Se repiten los ocho recorridos en 320×740, 390×844, 844×390 y 1440×1000, con guardado y reapertura.

Resultado: 696 comprobaciones de recorridos y 60 de pulido responsive aprobadas. `npm run check` aprobado (tipos, pruebas de lógica y componentes, SQL local y build). Los dispositivos móviles se emulan en Chromium; no se certifican pruebas en teléfonos físicos.

Los bloqueos previos de correo propio, CAPTCHA, medición, legales y pruebas físicas siguen documentados en `lanzamiento-bloqueos-6.30.md`; esta entrega no los marca como resueltos.
