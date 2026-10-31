-- Ejecutar dentro de una transacción y revertir. No se envían correos.
do $qa$
declare invited_uid uuid=gen_random_uuid(); uid uuid=gen_random_uuid(); tenant uuid; tenant2 uuid; ctx jsonb; start_at timestamptz=now(); blocked boolean; prev_count bigint;
begin
 select count(*) into prev_count from public.inmobiliarias;
 insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data,aud,role)
 values(uid,'qa-'||uid||'@example.invalid',jsonb_build_object('nombre','Prueba QA','inmobiliaria','Inmobiliaria QA','docworks_registro','trial_month_v1','rol_base','super_admin','dias_prueba',999), '{}','authenticated','authenticated');
 if exists(select 1 from public.usuarios where id=uid) then raise exception 'Alta antes de verificar email'; end if;
 update auth.users set email_confirmed_at=start_at where id=uid;
 select inmobiliaria_id into tenant from public.usuarios where id=uid and rol_base='dueno';
 if tenant is null then raise exception 'No se creó el dueño'; end if;
 if not exists(select 1 from public.membresias where inmobiliaria_id=tenant and es_prueba and estado='activa' and fecha_vencimiento=start_at+interval '1 month') then raise exception 'Plazo incorrecto'; end if;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 perform public.fn_autoprovisionar_usuario_actual();
 tenant2=public.fn_registrar_inmobiliaria('Otro nombre','Otro usuario');
 if tenant2 is distinct from tenant then raise exception 'Alta repetida no idempotente'; end if;
 ctx=public.fn_mi_contexto();
 if not (ctx->>'habilitado')::boolean or not (ctx->'membresia'->>'es_prueba')::boolean then raise exception 'Contexto incorrecto'; end if;
 if exists(select 1 from public.inmobiliarias where id<>tenant) then raise exception 'Aislamiento incorrecto'; end if;
 blocked=false;
 begin
  update public.membresias set fecha_vencimiento=now()+interval '100 years',es_prueba=false where inmobiliaria_id=tenant;
 exception when others then
  if sqlerrm like 'Solo DocWorks%' then blocked=true; else raise; end if;
 end;
 if not blocked then raise exception 'Cliente pudo extender su prueba'; end if;
 perform public.fn_operacion_guardar('qa-'||uid,'reserva','borrador',null,'{}');
 execute 'reset role';
 perform set_config('request.jwt.claim.sub','',true);perform set_config('request.jwt.claims','{}',true);
 update public.membresias set fecha_vencimiento=now()-interval '1 second' where inmobiliaria_id=tenant;
 perform set_config('request.jwt.claim.sub',uid::text,true);perform set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 ctx=public.fn_mi_contexto();
 if (ctx->>'habilitado')::boolean or ctx->'membresia'->>'estado'<>'vencida' then raise exception 'No venció'; end if;
 blocked=false;
 begin
  perform public.fn_operacion_guardar('qa-'||uid,'reserva','borrador',null,'{"cambio":true}');
 exception when others then
  if sqlerrm like 'Tu prueba terminó%' then blocked=true; else raise; end if;
 end;
 if not blocked then raise exception 'Prueba vencida pudo escribir'; end if;
 if not exists(select 1 from public.operaciones where id='qa-'||uid) then raise exception 'Se perdieron datos'; end if;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub','',true);perform set_config('request.jwt.claims','{}',true);
 insert into public.invitaciones(inmobiliaria_id,email,rol_base,perfil_permisos) values(tenant,'qa-'||invited_uid||'@example.invalid','broker','junior');
 insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data,aud,role)
 values(invited_uid,'qa-'||invited_uid||'@example.invalid',jsonb_build_object('nombre','Invitado','inmobiliaria','No crear','docworks_registro','trial_month_v1'),'{}','authenticated','authenticated');
 update auth.users set email_confirmed_at=now() where id=invited_uid;
 if not exists(select 1 from public.usuarios where id=invited_uid and inmobiliaria_id=tenant and rol_base='broker') then raise exception 'Invitación perdió inmobiliaria o rol'; end if;
 if has_function_privilege('anon','public.fn_registrar_inmobiliaria(text,text)','execute') or has_function_privilege('authenticated','docworks_private.provisionar_prueba(uuid)','execute') then raise exception 'Función privada expuesta'; end if;
 if (select count(*) from public.inmobiliarias)<>prev_count+1 then raise exception 'Alta duplicada'; end if;
end $qa$;
select 'OK: confirmación, dueño, plazo fijo, idempotencia, RLS, protección, vencimiento y conservación de datos' as resultado;
