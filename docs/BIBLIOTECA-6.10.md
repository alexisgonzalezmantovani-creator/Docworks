# DocWorks 6.10 — Catálogo coherente y nombres visibles

Biblioteca y Documentos usan un catálogo activo compartido. Ambos excluyen las cláusulas antiguas que ya pertenecen al texto base, los registros inactivos y las cláusulas protegidas por modelos fijados. La lista de Documentos se filtra además por su tipo. Las variantes con condiciones o plazos diferentes se conservan como registros independientes; no hay fusión por similitud.

La corrección elimina la diferencia entre los dos filtros anteriores: Documentos solo consultaba `clausulaYaEnTextoBase`, mientras Biblioteca también excluía títulos antiguos y referencias protegidas. Las copias antiguas con UUID y `obligatoria:false` podían reaparecer en Documentos.

Los nombres de las cláusulas ahora se muestran también en plantillas que usaban `sinTitulo`. Si falta un nombre estándar se recupera por ID estable. Los títulos personalizados se conservan; una cláusula propia sin título se identifica como CONDICIÓN PARTICULAR. No se modifica la redacción, los importes ni las condiciones pactadas. No se ejecutan migraciones ni escrituras sobre operaciones existentes.

El inicio de la app/web utiliza el logo transparente ya usado en la barra superior. Se conserva el tiempo breve de carga.

Validación: npm run check; pruebas DOM comparan Biblioteca y Documentos para los ocho tipos, registros inactivos, copias antiguas con UUID, variantes con distintos plazos, referencias protegidas y actualización del catálogo. Las pruebas documentales cubren nombres visibles y recuperación de títulos sin mutar los datos originales. La suite de navegador compara ambos catálogos en móvil, tableta y escritorio.
