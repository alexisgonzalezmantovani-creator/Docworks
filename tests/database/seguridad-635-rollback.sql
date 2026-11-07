-- El llamador abre la transacción. Sólo cuentas QA reservadas y datos ficticios.
select set_config('request.jwt.claim.sub','',true);
update public.membresias set estado='activa',es_prueba=false,fecha_vencimiento=now()+interval '10 days'
where inmobiliaria_id='00000000-0000-0000-0000-0000000000a1';
update auth.users set email_confirmed_at=now() where id in ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000a004');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
set local role authenticated;
do $$declare c uuid; ctx jsonb;begin
 if public.fn_autoprovisionar_usuario_actual()<>'00000000-0000-0000-0000-00000000a001'::uuid then raise exception 'Autoprovisión falló';end if;
 ctx:=public.fn_mi_contexto();if not (ctx->>'habilitado')::boolean then raise exception 'Se rompió contexto';end if;
 perform public.fn_admin_dashboard();
 c:=public.fn_clausula_crear('QA-635-NO-PERSISTIR','Texto ficticio','prueba','["reserva"]',false,'A');
 perform set_config('docworks.qa.clausula635',c::text,true);
 perform public.fn_clausula_mover(c,15);
 if not exists(select 1 from public.auditoria where entidad_id=c and accion='mover' and valor_nuevo->>'orden'='15') then raise exception 'Reordenamiento sin auditoría';end if;
 if has_function_privilege('authenticated','public.fn_provisionar_usuario_por_email(text)','EXECUTE') or
    has_function_privilege('authenticated','public.fn_auditoria_vaciar()','EXECUTE') or
    has_function_privilege('authenticated','public.fn_docworks_auditoria_trigger()','EXECUTE') then raise exception 'Persisten privilegios indebidos';end if;
end;$$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a004',true);
do $$declare denegado boolean:=false;begin
 begin perform public.fn_clausula_mover(current_setting('docworks.qa.clausula635')::uuid,16);exception when insufficient_privilege then denegado:=true;end;
 if not denegado then raise exception 'Junior pudo reordenar sin permiso';end if;
 if public.fn_es_admin('00000000-0000-0000-0000-00000000b001') then raise exception 'Se filtró rol ajeno';end if;
 denegado:=false;
 begin perform public.fn_usuarios_activos_count('00000000-0000-0000-0000-0000000000b1');exception when insufficient_privilege then denegado:=true;end;
 if not denegado then raise exception 'Se filtró cantidad ajena';end if;
 perform public.fn_usuarios_activos_count('00000000-0000-0000-0000-0000000000a1');
end;$$;
reset role;
-- Se valida una excepción vigente con otorgante distinto del administrador actual.
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
set local role authenticated;
do $$begin
 perform public.fn_configurar_excepcion_broker('00000000-0000-0000-0000-00000000a004','clausula',current_setting('docworks.qa.clausula635')::uuid,'editar','permitido','QA 635');
end;$$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a004',true);
do $$begin
 perform public.fn_clausula_mover(current_setting('docworks.qa.clausula635')::uuid,17);
end;$$;
reset role;
select set_config('request.jwt.claim.sub',(select user_id::text from public.super_admins limit 1),true);
set local role authenticated;
do $$declare ctx jsonb;begin
 ctx:=public.fn_mi_contexto();if not (ctx->>'es_super_admin')::boolean then raise exception 'Se rompió contexto superadmin';end if;
 perform public.fn_super_dashboard();perform public.fn_super_listar_inmobiliarias();
 perform public.fn_limite_usuarios('00000000-0000-0000-0000-0000000000a1');
end;$$;
reset role;
select set_config('request.jwt.claim.sub','',true);
