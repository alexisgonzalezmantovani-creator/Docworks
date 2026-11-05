-- Propuesta 6.24: NO ejecutar en producción hasta el OK de publicación.
-- Reemplaza el inicializador existente. Conserva bajas y cláusulas personalizadas.
CREATE OR REPLACE FUNCTION public.fn_clausulas_sembrar()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $fn$
DECLARE
  v_inmob uuid; v_datos jsonb; v_base jsonb := '[{"id": "especial.credito_hipotecario", "titulo": "Operación supeditada a crédito hipotecario", "categoria": "financiación", "tipos": ["reserva", "boleto"], "obligatoria": false, "contenido": "La presente operación queda supeditada a la aprobación del crédito hipotecario solicitado por la parte compradora."}, {"id": "especial.aires_incluidos", "titulo": "Aires acondicionados incluidos", "categoria": "entrega", "tipos": ["reserva", "boleto", "reserva_alquiler", "alquiler"], "obligatoria": false, "contenido": "La parte obligada a entregar el inmueble se compromete a entregarlo con los equipos de aire acondicionado identificados por las partes en el detalle o inventario de entrega, en el estado de funcionamiento expresamente acordado."}, {"id": "especial.entrega_amoblada", "titulo": "Entrega amoblada con inventario", "categoria": "entrega", "tipos": ["reserva", "boleto", "reserva_alquiler", "alquiler"], "obligatoria": false, "contenido": "El inmueble se entregará amoblado con los muebles, artefactos y elementos individualizados en el inventario de entrega firmado por las partes, que se incorpora como anexo. El inventario deberá detallar cantidades, descripción y estado de los bienes."}, {"id": "especial.interior_pintado", "titulo": "Entrega con interiores pintados", "categoria": "entrega", "tipos": ["reserva", "boleto", "reserva_alquiler", "alquiler"], "obligatoria": false, "contenido": "La parte obligada a entregar el inmueble se compromete a entregarlo con la totalidad de sus ambientes interiores pintados, en las condiciones de terminación acordadas por las partes."}]'::jsonb;
  p jsonb; c public.clausulas%rowtype; t text; v_nueva boolean; v_tipos_anteriores jsonb;
  v_cfg jsonb; v_ids jsonb; v_habilitar boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Se requiere sesión autenticada'; END IF;
  v_inmob := public.fn_mi_inmobiliaria();
  IF v_inmob IS NULL THEN RAISE EXCEPTION 'No se pudo resolver tu inmobiliaria'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_inmob::text||':clausulas',0));
  SELECT datos INTO v_datos FROM public.configuracion_inmobiliaria WHERE inmobiliaria_id=v_inmob FOR UPDATE;
  v_datos:=coalesce(v_datos,'{}'::jsonb);
  IF v_datos->>'biblioteca_base_624'='true' THEN RETURN; END IF;
  FOR p IN SELECT value FROM jsonb_array_elements(v_base) LOOP
    SELECT * INTO c FROM public.clausulas x WHERE x.inmobiliaria_id=v_inmob AND
      (regexp_replace(translate(lower(trim(x.titulo)),'áéíóúüñ','aeiouun'),'\s+',' ','g')=translate(lower(p->>'titulo'),'áéíóúüñ','aeiouun')
       OR regexp_replace(x.contenido,'\s+',' ','g')=regexp_replace(p->>'contenido','\s+',' ','g')
       OR (p->>'id'='especial.credito_hipotecario' AND translate(lower(x.titulo),'áéíóúüñ','aeiouun') LIKE '%credito hipotecario%'))
      ORDER BY x.activo DESC,x.orden,x.id LIMIT 1;
    v_nueva:=NOT FOUND;
    IF v_nueva THEN
      INSERT INTO public.clausulas(inmobiliaria_id,titulo,categoria,contenido,tipos,obligatoria,proteccion,orden)
      VALUES(v_inmob,p->>'titulo',p->>'categoria',p->>'contenido',p->'tipos',false,'B'::public.proteccion_t,
        coalesce((SELECT max(orden) FROM public.clausulas WHERE inmobiliaria_id=v_inmob),0)+1)
      RETURNING * INTO c;
      v_tipos_anteriores:='[]'::jsonb;
    ELSE
      v_tipos_anteriores:=coalesce(c.tipos,'[]'::jsonb);
      -- Solo ampliar los tipos del texto exacto de fábrica; jamás textos propios ni bajas.
      IF c.activo AND regexp_replace(c.contenido,'\s+',' ','g')=regexp_replace(p->>'contenido','\s+',' ','g') AND (p->'tipos') ? 'reserva_alquiler'
         AND v_tipos_anteriores ? 'alquiler' AND NOT v_tipos_anteriores ? 'reserva_alquiler'
         AND NOT v_tipos_anteriores ? 'todos' THEN
        UPDATE public.clausulas SET tipos=tipos||'"reserva_alquiler"'::jsonb WHERE id=c.id RETURNING * INTO c;
      END IF;
    END IF;
    IF NOT c.activo THEN CONTINUE; END IF;
    FOR t IN SELECT value FROM jsonb_array_elements_text(c.tipos) LOOP
      IF t='todos' THEN CONTINUE; END IF;
      v_cfg:=coalesce(v_datos->'plantillas'->t,'{}'::jsonb);
      -- Agregar las nuevas y el tipo que faltaba. No reactivar opciones quitadas de una plantilla existente.
      v_habilitar:=v_nueva OR NOT v_tipos_anteriores ? t OR NOT coalesce(v_datos->'plantillas','{}'::jsonb) ? t;
      IF NOT v_habilitar THEN CONTINUE; END IF;
      v_ids:=coalesce(v_cfg->'clausulas_ids','[]'::jsonb);
      IF NOT v_ids ? c.id::text THEN
        v_cfg:=v_cfg||jsonb_build_object('clausulas_ids',v_ids||jsonb_build_array(c.id::text));
        v_datos:=jsonb_set(v_datos,'{plantillas}',coalesce(v_datos->'plantillas','{}'::jsonb)||jsonb_build_object(t,v_cfg),true);
      END IF;
    END LOOP;
  END LOOP;
  v_datos:=v_datos||'{"biblioteca_base_624":true}'::jsonb;
  INSERT INTO public.configuracion_inmobiliaria(inmobiliaria_id,datos,actualizada_en) VALUES(v_inmob,v_datos,now())
  ON CONFLICT(inmobiliaria_id) DO UPDATE SET datos=excluded.datos,actualizada_en=excluded.actualizada_en;
END;
$fn$;
REVOKE ALL ON FUNCTION public.fn_clausulas_sembrar() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fn_clausulas_sembrar() TO authenticated;
-- Actualiza las cuentas existentes en el contexto de un miembro activo de cada inmobiliaria.
-- Dentro de una única transacción al publicar, sin IDs de cuentas codificados.
DO $backfill$
DECLARE u record; anterior text:=current_setting('request.jwt.claim.sub',true);
BEGIN
 FOR u IN SELECT DISTINCT ON (inmobiliaria_id) id FROM public.usuarios WHERE activo AND inmobiliaria_id IS NOT NULL ORDER BY inmobiliaria_id,creado_en,id LOOP
   PERFORM set_config('request.jwt.claim.sub',u.id::text,true);
   PERFORM public.fn_clausulas_sembrar();
 END LOOP;
 PERFORM set_config('request.jwt.claim.sub',coalesce(anterior,''),true);
END;
$backfill$;
