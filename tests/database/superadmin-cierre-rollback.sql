-- Cuentas QA reservadas; nunca modificar clientes. Ejecutar dentro de BEGIN/ROLLBACK.
select set_config('docworks.qa.super',(select user_id::text from public.super_admins limit 1),true);
update public.membresias set estado='activa',fecha_vencimiento=now()+interval '10 days',mercadopago_status=null where inmobiliaria_id='00000000-0000-0000-0000-0000000000a1';
select set_config('request.jwt.claim.sub',current_setting('docworks.qa.super'),true);
set local role authenticated;
do $$declare a uuid:='00000000-0000-0000-0000-0000000000a1'; result jsonb; firstpay jsonb; actor uuid; denied boolean; previous timestamptz;begin
 perform public.fn_super_nota_inmobiliaria(a,'QA-632-NO-PERSISTIR');
 result:=public.fn_super_detalle_inmobiliaria(a);
 if result->>'nota_interna'<>'QA-632-NO-PERSISTIR' then raise exception 'Nota no persistida'; end if;
 previous:=(result->'membresia'->>'fecha_vencimiento')::timestamptz;
 result:=public.fn_super_extender_membresia(a,30,'extension',null);
 if (result->>'fecha_vencimiento')::timestamptz<>previous+interval '30 days' then raise exception 'Extensión incorrecta'; end if;
 perform public.fn_super_set_limites(a,100);
 if public.fn_limite_usuarios(a)<>100 then raise exception 'Límite no aplicado'; end if;
 perform public.fn_super_set_limites(a,null);
 denied:=false;begin perform public.fn_super_transferir_dueno(a,'00000000-0000-0000-0000-00000000b001');exception when others then denied:=true;end;
 if not denied then raise exception 'Se permitió titular ajeno';end if;
 perform public.fn_super_transferir_dueno(a,'00000000-0000-0000-0000-00000000a003');
 result:=public.fn_super_detalle_inmobiliaria(a);
 if not exists(select 1 from jsonb_array_elements(result->'usuarios') u where u->>'id'='00000000-0000-0000-0000-00000000a003' and u->>'rol_base'='dueno') then raise exception 'Transferencia no aplicada';end if;
 perform public.fn_super_archivar_inmobiliaria(a,true);
 if public.fn_super_detalle_inmobiliaria(a)->'membresia'->>'estado'<>'archivada' then raise exception 'Archivo no aplicado';end if;
 perform public.fn_super_archivar_inmobiliaria(a,false);
 if public.fn_super_detalle_inmobiliaria(a)->'membresia'->>'estado'<>'activa' then raise exception 'Reactivación no aplicada';end if;
 firstpay:=public.fn_super_registrar_pago(a,123.45,'ARS','Transferencia',(now() at time zone 'America/Argentina/Buenos_Aires')::date,null,null,'QA-632-NO-PERSISTIR','00000000-0000-0000-0000-000000000632');
 result:=public.fn_super_registrar_pago(a,123.45,'ARS','Transferencia',(now() at time zone 'America/Argentina/Buenos_Aires')::date,null,null,'QA-632-NO-PERSISTIR','00000000-0000-0000-0000-000000000632');
 if firstpay->>'id'<>result->>'id' or not (result->>'reutilizado')::boolean then raise exception 'Pago duplicado'; end if;
 perform public.fn_super_set_anuncio('QA-632-NO-PERSISTIR',now()+interval '1 day');
 if public.fn_super_get_anuncio_global()->>'mensaje'<>'QA-632-NO-PERSISTIR' then raise exception 'Anuncio no guardado'; end if;
 if not exists(select 1 from public.fn_super_auditoria(a,2000) where accion='pago_manual' and valor_nuevo->>'id'=firstpay->>'id') then raise exception 'Falta auditoría';end if;
end;$$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
do $qa$declare denied boolean; cmd text;begin
 foreach cmd in array array[
  $$select public.fn_super_nota_inmobiliaria('00000000-0000-0000-0000-0000000000a1','x')$$,
  $$select public.fn_super_extender_membresia('00000000-0000-0000-0000-0000000000a1',30)$$,
  $$select public.fn_super_set_limites('00000000-0000-0000-0000-0000000000a1',100)$$,
  $$select public.fn_super_set_anuncio('x',null)$$,
  $$select * from public.fn_super_auditoria()$$,
  $$select * from docworks_private.seguimiento$$
 ] loop
  denied:=false;begin execute cmd;exception when insufficient_privilege then denied:=true;end;
  if not denied then raise exception 'Fallo de permisos: %',cmd;end if;
 end loop;
 if public.fn_super_get_anuncio_global()->>'mensaje'<>'QA-632-NO-PERSISTIR' then raise exception 'Anuncio no visible para usuario';end if;
end;$qa$;
reset role;
