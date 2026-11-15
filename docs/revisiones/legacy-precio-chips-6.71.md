# DocWorks 6.71 — Corrección de chips de precio en modelos antiguos

El editor de ajustes de la v6.70 ya muestra como chip protegido el marcador legacy `[precio en letras]`; sin embargo, al exportar, la validación comparaba el chip nuevo con el texto original del snapshot y descartaba el ajuste silenciosamente.

- Se centralizó `canonizarMarcadoresAjuste` y se reutiliza en el editor de cláusulas y en el generador real del documento.
- Antes de generar, se normalizan exclusivamente los marcadores legacy conocidos de precio, anticipo/seña y saldo. Se trabaja con copias: **no** se sobrescribe el snapshot ni la plantilla maestra de la inmobiliaria.
- La validación previa a PDF/DOCX sigue exigiendo conservar la secuencia exacta de chips automáticos. No permite que un ajuste elimine o modifique el precio.
- Se agregaron pruebas para documento antiguo sin ajuste, edición guardada que debe verse en el PDF/documento y tentativa de edición que elimina el chip.
- Se preserva el visor 6.70, con recuadro scrollable y ajustes manuales en iPhone.
