# DocWorks v6.68 — Visor de documentos en iPhone

## Cambios
- El documento al abrir una operación en iPhone comienza 18 px más abajo dentro de la zona de lectura, sin desplazar las pestañas ni los botones de la cabecera.
- La lectura usa un único desplazamiento vertical, de `.doc-reading-scroll`, en lugar de dos zonas desplazables anidadas.
- El fondo del espacio inferior se iguala al del visor; deja de quedar una franja blanca de la página sobrepuesta mientras se desplaza.
- Se reserva margen inferior de lectura, incluido el área segura del iPhone, para alcanzar las últimas líneas sin recortes.
- En desktop y tablet con más de 640 px no cambia la disposición ni el flujo de scroll.

## Comprobación
`tests/navegador.cjs` agrega aserciones de CSS real del visor en viewport de iPhone: único scroll, separación superior, fondo oscuro y margen inferior. El resto de la suite comprueba los ocho documentos y exportaciones en los navegadores compatibles.

## Sin cambios
No se tocaron cláusulas, modelos, funciones de Supabase ni datos históricos. No se cambió la barra de acciones global.
