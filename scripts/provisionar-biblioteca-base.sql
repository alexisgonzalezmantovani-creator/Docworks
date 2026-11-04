-- Biblioteca base: solo agrega condiciones ausentes. No reemplaza textos ni revive eliminadas.
-- Idempotente. Ejecutar únicamente después de verificar el respaldo.
-- Las bibliotecas vacías se inicializan con fn_clausulas_sembrar al primer ingreso.
WITH presets(titulo,categoria,contenido,tipos,tema,orden) AS (VALUES
('Operación supeditada a crédito hipotecario','financiación','La presente operación queda supeditada a la aprobación del crédito hipotecario solicitado por la parte compradora.','["reserva","boleto"]'::jsonb,'credito hipotecario',1),
('Aires acondicionados incluidos','entrega','La parte obligada a entregar el inmueble se compromete a entregarlo con los equipos de aire acondicionado identificados por las partes en el detalle o inventario de entrega, en el estado de funcionamiento expresamente acordado.','["reserva","boleto","alquiler"]'::jsonb,'aires acondicionados',2),
('Entrega amoblada con inventario','entrega','El inmueble se entregará amoblado con los muebles, artefactos y elementos individualizados en el inventario de entrega firmado por las partes, que se incorpora como anexo. El inventario deberá detallar cantidades, descripción y estado de los bienes.','["reserva","boleto","alquiler"]'::jsonb,'amoblad',3),
('Entrega con interiores pintados','entrega','La parte obligada a entregar el inmueble se compromete a entregarlo con la totalidad de sus ambientes interiores pintados, en las condiciones de terminación acordadas por las partes.','["reserva","boleto","alquiler"]'::jsonb,'pintad',4)
), nuevas AS (
 INSERT INTO public.clausulas(inmobiliaria_id,titulo,categoria,contenido,tipos,obligatoria,proteccion,orden)
 SELECT i.id,p.titulo,p.categoria,p.contenido,p.tipos,false,'B'::public.proteccion_t,
 coalesce((SELECT max(c.orden) FROM public.clausulas c WHERE c.inmobiliaria_id=i.id),0)+p.orden
 FROM public.inmobiliarias i CROSS JOIN presets p
 WHERE EXISTS (SELECT 1 FROM public.clausulas previa WHERE previa.inmobiliaria_id=i.id)
 AND NOT EXISTS (SELECT 1 FROM public.clausulas c WHERE c.inmobiliaria_id=i.id AND
 (regexp_replace(lower(translate(c.titulo,'áéíóúüñ','aeiouun')),'[^a-z0-9]+',' ','g') LIKE '%'||p.tema||'%'
 OR regexp_replace(c.contenido,'\s+',' ','g')=regexp_replace(p.contenido,'\s+',' ','g')))
 RETURNING id,inmobiliaria_id,titulo,tipos
), por_tipo AS (
 SELECT n.inmobiliaria_id,t.tipo,jsonb_agg(n.id::text ORDER BY n.titulo) AS ids
 FROM nuevas n CROSS JOIN LATERAL jsonb_array_elements_text(n.tipos) t(tipo)
 GROUP BY n.inmobiliaria_id,t.tipo
), mapas AS (
 SELECT c.inmobiliaria_id,jsonb_object_agg(p.tipo,
 coalesce(c.datos->'plantillas'->p.tipo,'{}'::jsonb)||jsonb_build_object('clausulas_ids',coalesce(c.datos->'plantillas'->p.tipo->'clausulas_ids','[]'::jsonb)||p.ids)) AS mapa
 FROM public.configuracion_inmobiliaria c JOIN por_tipo p USING(inmobiliaria_id)
 GROUP BY c.inmobiliaria_id
), configuradas AS (
 UPDATE public.configuracion_inmobiliaria c SET datos=jsonb_set(c.datos,'{plantillas}',coalesce(c.datos->'plantillas','{}'::jsonb)||m.mapa,true),actualizada_en=now()
 FROM mapas m WHERE c.inmobiliaria_id=m.inmobiliaria_id RETURNING c.inmobiliaria_id
)
SELECT (SELECT count(*) FROM nuevas) AS clausulas_agregadas,(SELECT count(*) FROM configuradas) AS inmobiliarias_configuradas;
