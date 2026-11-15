# DocWorks v6.69 — Visor de documentos en iPhone (corrección visual)

Se corrigieron dos fallos reproducidos en una captura de un iPhone:

1. La barra de simulación tipo Mac `pdf-chrome` (tres círculos y el texto "Vista previa") permanecía con `position:sticky` y se superponía a las cláusulas. En teléfonos se elimina esa barra redundante, manteniendo las pestañas y las acciones principales.
2. Había doble reserva inferior de área segura: `.viewer-modal .modal-body` y `.doc-reading-scroll` añadían espacio fijo. La zona inferior del modal deja de tener padding fijo y el espacio de seguridad queda dentro de la única zona desplazable.

En teléfonos la previsualización se ve como una hoja blanca continua y se desplaza dentro de `.doc-reading-scroll`. No tiene una segunda barra interna, ni marco oscuro que recorte el texto. Conserva separación superior de 18 px y margen inferior dentro del scroll.

Se agregó una prueba automatizada con un documento simulado de 120 cláusulas, tarjetas superiores y ajustes manuales, comprobando la barra oculta, la ausencia del pie fijo, un solo scroll y la visibilidad de la última cláusula. No se modificaron documentos, modelos, datos, backend ni tablet/desktop.

Pendiente de validación manual: Safari en dispositivo físico, incluido gesto de scroll y zona segura inferior.
