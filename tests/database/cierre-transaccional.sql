-- Comprobación manual de integración usando ÚNICAMENTE las cuentas QA existentes.
-- No ejecutar sin revisar el destino. Toda escritura termina en ROLLBACK.
BEGIN;
SET LOCAL statement_timeout='15s';
SELECT set_config('docworks.qa.opid','qa-cierre-'||gen_random_uuid()::text,true);
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
SET LOCAL ROLE authenticated;
DO $qa$
DECLARE saved record; opid text:=current_setting('docworks.qa.opid'); cid uuid;
BEGIN
 IF public.fn_mi_inmobiliaria()<>'00000000-0000-0000-0000-0000000000a1'::uuid THEN RAISE EXCEPTION 'Contexto QA incorrecto';END IF;
 SELECT * INTO saved FROM public.fn_operacion_guardar(opid,'reserva','borrador',null,'{"comprador_nombre":"PRUEBA TRANSACCIONAL SIN PERSISTIR","broker_id":"00000000-0000-0000-0000-00000000a003","precio":"123456.78"}'::jsonb);
 IF saved.datos->>'precio'<>'123456.78' THEN RAISE EXCEPTION 'Importe no conservado';END IF;
 SELECT * INTO saved FROM public.fn_operacion_guardar(opid,'reserva','borrador',null,saved.datos||'{"clausulas_custom":"VERSION DOS DE PRUEBA"}'::jsonb);
 IF saved.datos->>'clausulas_custom'<>'VERSION DOS DE PRUEBA' THEN RAISE EXCEPTION 'Actualización no conservada';END IF;
 IF (SELECT count(*) FROM public.operaciones o WHERE o.id=opid)<>1 THEN RAISE EXCEPTION 'Guardado duplicado';END IF;
 SELECT public.fn_clausula_crear('QA-CIERRE-NO-PERSISTIR','Contenido ficticio de comprobación transaccional.','prueba','["reserva"]'::jsonb,false,'B'::public.proteccion_t) INTO cid;
 PERFORM set_config('docworks.qa.clausula',cid::text,true);
END;$qa$;
-- Cambiar el usuario y rol de aplicación permite comprobar las políticas reales.
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a003',true);
DO $qa$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.clausulas WHERE id=current_setting('docworks.qa.clausula')::uuid) THEN RAISE EXCEPTION 'El broker no ve la biblioteca común';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.fn_operaciones_listar() WHERE id=current_setting('docworks.qa.opid')) THEN RAISE EXCEPTION 'El broker asignado no ve la operación';END IF;
END;$qa$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a005',true);
DO $qa$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.clausulas WHERE id=current_setting('docworks.qa.clausula')::uuid) THEN RAISE EXCEPTION 'Otro broker de la inmobiliaria no ve la biblioteca';END IF;
END;$qa$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000b001',true);
DO $qa$
DECLARE denied boolean:=false;
BEGIN
 IF EXISTS(SELECT 1 FROM public.clausulas WHERE id=current_setting('docworks.qa.clausula')::uuid) THEN RAISE EXCEPTION 'Fuga de biblioteca entre inmobiliarias';END IF;
 IF EXISTS(SELECT 1 FROM public.fn_operaciones_listar() WHERE id=current_setting('docworks.qa.opid')) THEN RAISE EXCEPTION 'Fuga de operación entre inmobiliarias';END IF;
 BEGIN
  PERFORM public.fn_operacion_guardar(current_setting('docworks.qa.opid'),'reserva','borrador',null,'{"comprador_nombre":"Intento ajeno ficticio"}'::jsonb);
 EXCEPTION WHEN OTHERS THEN denied:=true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Una cuenta ajena pudo sobrescribir la operación';END IF;
END;$qa$;
RESET ROLE;
ROLLBACK;
SELECT jsonb_build_object('operaciones_de_prueba_persistidas',(SELECT count(*) FROM public.operaciones WHERE id LIKE 'qa-cierre-%'),'clausulas_de_prueba_persistidas',(SELECT count(*) FROM public.clausulas WHERE titulo='QA-CIERRE-NO-PERSISTIR'),'estado','prueba transaccional completada y revertida') as verificacion;
