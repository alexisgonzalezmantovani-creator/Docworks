-- Sólo IDs QA reservados. Todo termina en ROLLBACK; no invoca proveedores.
BEGIN;
SET LOCAL statement_timeout='15s';
SELECT set_config('docworks.qa.opid','qa-recordatorios-634-'||gen_random_uuid()::text,true);
UPDATE docworks_private.correo_config SET habilitado=true WHERE id;
-- Confirma sólo el usuario ficticio dentro de esta transacción; no envía correo.
UPDATE auth.users SET email_confirmed_at=now() WHERE id='00000000-0000-0000-0000-00000000a003';
INSERT INTO public.operaciones(id,inmobiliaria_id,tipo,estado,datos,creado_por)
VALUES(current_setting('docworks.qa.opid'),'00000000-0000-0000-0000-0000000000a1','reserva','activo',
 '{"broker_id":"00000000-0000-0000-0000-00000000a003"}','00000000-0000-0000-0000-00000000a001');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
SET LOCAL ROLE authenticated;
DO $$DECLARE a jsonb;b jsonb;f timestamptz:=now()+interval '3 days';BEGIN
 a:=public.fn_recordatorio_guardar(current_setting('docworks.qa.opid'),'00000000-0000-0000-0000-00000000a003',f,60);
 b:=public.fn_recordatorio_guardar(current_setting('docworks.qa.opid'),'00000000-0000-0000-0000-00000000a003',f,60);
 IF a->>'id'<>b->>'id' THEN RAISE EXCEPTION 'Se duplicó el aviso';END IF;
 PERFORM set_config('docworks.qa.rid',a->>'id',true);
 a:=public.fn_recordatorios_contexto(current_setting('docworks.qa.opid'));
 IF jsonb_array_length(a->'recordatorios')<>1 THEN RAISE EXCEPTION 'Contexto incorrecto';END IF;
END;$$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000b001',true);
DO $$DECLARE denegado boolean:=false;BEGIN
 BEGIN PERFORM public.fn_recordatorios_contexto(current_setting('docworks.qa.opid'));EXCEPTION WHEN insufficient_privilege THEN denegado:=true;END;
 IF NOT denegado THEN RAISE EXCEPTION 'Se permitió acceso entre inmobiliarias';END IF;
END;$$;
RESET ROLE;
UPDATE docworks_private.recordatorios SET enviar_en=now()-interval '1 minute' WHERE id=current_setting('docworks.qa.rid')::uuid;
SET LOCAL ROLE service_role;
DO $$DECLARE a jsonb;b jsonb;BEGIN
 a:=public.fn_recordatorios_tomar();b:=public.fn_recordatorios_tomar();
 IF jsonb_array_length(a)<>1 OR jsonb_array_length(b)<>0 THEN RAISE EXCEPTION 'Toma no exclusiva o correo QA sin confirmar';END IF;
 PERFORM public.fn_recordatorio_resultado(current_setting('docworks.qa.rid')::uuid,'aceptado','qa-sin-envio');
END;$$;
RESET ROLE;
DO $$BEGIN
 IF NOT EXISTS(SELECT 1 FROM docworks_private.recordatorios WHERE id=current_setting('docworks.qa.rid')::uuid AND estado='aceptado') THEN RAISE EXCEPTION 'No se guardó resultado';END IF;
 IF has_function_privilege('authenticated','public.fn_recordatorios_tomar()','EXECUTE') OR has_function_privilege('anon','public.fn_recordatorio_guardar(text,uuid,timestamptz,integer)','EXECUTE') THEN RAISE EXCEPTION 'Permisos incorrectos';END IF;
END;$$;
ROLLBACK;
