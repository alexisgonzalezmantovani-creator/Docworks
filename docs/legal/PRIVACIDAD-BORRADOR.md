# Política de privacidad de DocWorks — borrador para completar

Estado: no publicar hasta confirmar los puntos pendientes de este documento.
Preparado el 2 de noviembre de 2026. No sustituye una revisión jurídica.

## Información que falta confirmar

- Titular que presta el servicio: persona humana o sociedad, nombre legal completo,
  CUIT y domicilio para notificaciones.
- Correo para consultas y ejercicio de derechos sobre datos personales.
- Modalidad de Gemini API: proyecto con facturación activa o servicio gratuito.
- Garantías para transferencias internacionales y acuerdos con proveedores.
- Plazos y procedimiento de conservación y eliminación al cerrar una cuenta,
  incluyendo auditoría, versiones históricas, respaldos y cachés locales.
- Obligaciones de inscripción de bases de datos que correspondan ante la AAIP.

## 1. Responsable y contacto

El servicio DocWorks es prestado por [TITULAR LEGAL], CUIT [CUIT], con domicilio
en [DOMICILIO]. Las consultas relativas a datos personales y solicitudes de
ejercicio de derechos podrán dirigirse a [CORREO DE PRIVACIDAD].

## 2. Datos y finalidades

Para crear y administrar cuentas se tratan el nombre y apellido del usuario,
correo electrónico, datos de su inmobiliaria, credenciales de autenticación y
datos necesarios para administrar accesos, soporte y contratación del servicio.
Los campos obligatorios se identifican en los formularios; sin los datos
necesarios no es posible completar el registro o prestar la función solicitada.

Las inmobiliarias pueden incorporar a sus operaciones datos de las partes y
cotitulares, tales como nombres, DNI/CUIT, domicilios, teléfonos, correos,
información del inmueble y condiciones económicas y contractuales. Estos datos
se utilizan para gestionar operaciones, preparar documentos y prestar las
funciones solicitadas por la inmobiliaria.

También se generan registros de actividad y cambios para administrar el servicio,
controlar accesos y mantener trazabilidad de las operaciones realizadas.

## 3. Tratamiento por cuenta de las inmobiliarias

Cada inmobiliaria determina las finalidades del tratamiento de los datos que
incorpora sobre sus clientes y otras partes. Debe contar con una base legítima
para tratarlos, proporcionar la información correspondiente y gestionar los
accesos de su equipo. En ese contexto, DocWorks presta servicios de tratamiento
por cuenta de la inmobiliaria y conforme a sus instrucciones, sin perjuicio de
las obligaciones que le correspondan por sus propios tratamientos.

## 4. Proveedores y funciones de inteligencia artificial

La infraestructura del servicio utiliza Supabase para base de datos y
autenticación y Vercel para el alojamiento de la aplicación y de la web.
Las funciones de cobro integradas utilizan Mercado Pago cuando se activan.
Los enlaces de soporte o para compartir pueden abrir servicios de terceros,
como WhatsApp o el correo seleccionado por el usuario.

Las funciones de inteligencia artificial utilizan Google Gemini. Cuando el
usuario solicita una revisión, el contenido del documento o de la operación
seleccionada puede enviarse a ese proveedor, incluyendo los datos personales
que contenga. Los textos, imágenes o archivos adjuntos al asistente también
pueden transmitirse para procesar la solicitud.

[COMPLETAR antes de publicar: modalidad contractual efectiva de Google,
condiciones aplicables al uso y conservación de entradas y respuestas,
información al usuario previa al envío y garantías del tratamiento. No afirmar
que Google nunca usa los datos para mejorar modelos sin verificar la modalidad.]

## 5. Almacenamiento y transferencias internacionales

La base de datos principal de DocWorks se encuentra configurada en la región
us-east-2 de Supabase, en Estados Unidos. Los proveedores de infraestructura y
de inteligencia artificial pueden tratar información fuera de Argentina.

[COMPLETAR antes de publicar: mecanismo jurídico aplicable a cada transferencia
conforme al artículo 12 de la Ley 25.326 y las normas de la AAIP. La mera
publicación de esta política no instrumenta por sí sola esas garantías.]

## 6. Conservación y eliminación

[COMPLETAR con la política operativa aprobada de conservación, baja y eliminación.
No prometer eliminación automática de todas las copias a los 30 días: la purga
de operaciones de la papelera no acredita ese tratamiento para auditorías,
versiones, respaldos ni datos de cuenta.]

## 7. Seguridad y almacenamiento en el dispositivo

La plataforma utiliza autenticación y controles de acceso. El usuario debe
proteger sus credenciales y revisar los permisos otorgados a su equipo.
El navegador puede conservar información de sesión y cachés o borradores locales
para el funcionamiento del servicio. El uso de equipos compartidos exige tomar
precauciones para evitar accesos de otras personas.

No se promete seguridad absoluta ni se afirma una certificación no acreditada.

## 8. Derechos de las personas

Las personas pueden solicitar información, acceso, rectificación, actualización
y, cuando corresponda, supresión o confidencialidad de sus datos. Para ello
deberán acreditar razonablemente su identidad y dirigirse al contacto indicado.

Para datos tratados por cuenta de una inmobiliaria, se coordinará la solicitud
con la inmobiliaria responsable. Se observarán los plazos legales: diez días
corridos para acceso y cinco días hábiles para rectificación, actualización o
supresión, según corresponda, con las excepciones legales de conservación.

La Agencia de Acceso a la Información Pública, autoridad de aplicación de la
Ley 25.326, recibe reclamos sobre el incumplimiento de esa normativa.

## Verificación técnica realizada

- Se revisó código de la aplicación y metadatos del proyecto activo, sin leer
  documentos ni registros de clientes y sin modificar la base de datos.
- Las 18 tablas públicas tienen RLS activada. Las políticas SELECT examinadas
  para operaciones, usuarios, versiones y auditoría filtran por inmobiliaria.
  Esto no sustituye pruebas de aislamiento de todos los roles y funciones.
- La función activa de IA utiliza Google Gemini y valida al usuario autenticado.
  El cliente transmite texto documental y puede transmitir archivos adjuntos.
- Existe una función de purga de operaciones eliminadas hace más de 30 días,
  invocada al recargar operaciones. No se verificó una purga global programada.
- Google Analytics conserva un identificador de ejemplo y no se activa en la
  landing revisada. No se debe afirmar que ya hay analítica publicitaria activa.
- Los avisos del asesor de Supabase sobre funciones SECURITY DEFINER requieren
  revisar autorización interna; no prueban por sí solos una vulnerabilidad.
  La protección adicional de contraseñas filtradas está desactivada.

## Fuentes para revisión

- Ley 25.326, especialmente artículos 4, 6, 9, 12, 14, 16 y 25:
  https://www.argentina.gob.ar/normativa/nacional/64790/texto
- Transferencias internacionales, AAIP:
  https://www.argentina.gob.ar/transferencias-internacionales
- Condiciones de Gemini API:
  https://ai.google.dev/gemini-api/terms
- Acuerdo de tratamiento de Supabase:
  https://supabase.com/legal/customer-resources/data-processing-addendum
- Revisión de funciones privilegiadas:
  https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- Protección de contraseñas filtradas:
  https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
