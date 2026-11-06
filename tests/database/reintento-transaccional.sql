-- Integración de reintento: sólo cuenta QA existente; todas las escrituras se revierten.
BEGIN;
SET LOCAL statement_timeout='15s';
SELECT set_config('docworks.qa.opid','qa-reintento-'||gen_random_uuid()::text,true);
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
SET LOCAL ROLE authenticated;
DO $qa$
DECLARE saved record; opid text:=current_setting('docworks.qa.opid');
BEGIN
 IF public.fn_mi_inmobiliaria()<>'00000000-0000-0000-0000-0000000000a1'::uuid THEN RAISE EXCEPTION 'Contexto QA incorrecto';END IF;
 -- El primer guardado se efectúa aunque la interfaz no reciba su confirmación.
 PERFORM public.fn_operacion_guardar(opid,'reserva','borrador',null,'{"comprador_nombre":"QA PRIMER INTENTO","broker_id":"00000000-0000-0000-0000-00000000a003","precio":"1000.25","plantilla_snapshot":{"tipo":"reserva","version":1}}'::jsonb);
 -- El reintento conserva el ID y puede incluir una corrección del formulario.
 SELECT * INTO saved FROM public.fn_operacion_guardar(opid,'reserva','borrador',null,'{"comprador_nombre":"QA NOMBRE CORREGIDO","broker_id":"00000000-0000-0000-0000-00000000a003","precio":"1000.25","plantilla_snapshot":{"tipo":"reserva","version":1}}'::jsonb);
 IF (SELECT count(*) FROM public.fn_operaciones_listar() WHERE id=opid)<>1 THEN RAISE EXCEPTION 'El reintento duplicó la operación';END IF;
 IF saved.datos->>'comprador_nombre'<>'QA NOMBRE CORREGIDO' OR saved.datos->>'precio'<>'1000.25' THEN RAISE EXCEPTION 'No conservó la última edición';END IF;
 IF saved.datos->'plantilla_snapshot'->>'tipo'<>'reserva' THEN RAISE EXCEPTION 'No conservó el modelo';END IF;
END;$qa$;
RESET ROLE;
ROLLBACK;
SELECT jsonb_build_object('estado','reintento comprobado y revertido','pruebas_persistidas',(SELECT count(*) FROM public.operaciones WHERE id LIKE 'qa-reintento-%')) AS verificacion;
