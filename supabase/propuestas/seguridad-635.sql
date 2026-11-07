-- Revisión 6.35. Preflight de definiciones; no borra auditoría ni datos de clientes.

do $preflight$ begin

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('docworks_private.exigir_escritura_operacion(text,text,jsonb)')) is distinct from '36c7c10e2a4e29824ff5a2ffd76a8ad3' then raise exception 'Cambió docworks_private.exigir_escritura_operacion(text,text,jsonb); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('docworks_private.provisionar_prueba(uuid)')) is distinct from '582d7e16754663912d0682efa51ce86b' then raise exception 'Cambió docworks_private.provisionar_prueba(uuid); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.dw_clausula_personal_touch()')) is distinct from 'fb141529b466a842d266ba52f4d1d845' then raise exception 'Cambió public.dw_clausula_personal_touch(); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_auditoria_vaciar()')) is distinct from '160bd12d0de26fe69bb7f7847e8db88e' then raise exception 'Cambió public.fn_auditoria_vaciar(); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_clausula_mover(uuid,integer)')) is distinct from 'a6bb16bc1baf33413d5c37e2d8ec3148' then raise exception 'Cambió public.fn_clausula_mover(uuid,integer); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_docworks_auditoria_trigger()')) is distinct from '1b0b274e0b9eeb903644e5dfd174508d' then raise exception 'Cambió public.fn_docworks_auditoria_trigger(); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_es_admin(uuid)')) is distinct from 'b430a0062f79970edbcea19518223d9a' then raise exception 'Cambió public.fn_es_admin(uuid); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_es_super_admin(uuid)')) is distinct from '82d8b7085aed2dca88b21846a9531052' then raise exception 'Cambió public.fn_es_super_admin(uuid); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_invitaciones_pendientes_count(uuid)')) is distinct from '88b1f1c2d5127be92f76bfe6219a1782' then raise exception 'Cambió public.fn_invitaciones_pendientes_count(uuid); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_limite_usuarios(uuid)')) is distinct from '9653f9ce29bf285d2b438f0ea268c804' then raise exception 'Cambió public.fn_limite_usuarios(uuid); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operacion_guardar(text,text,text,text,jsonb)')) is distinct from 'd514c71a69865df2ca6556c46af532ee' then raise exception 'Cambió public.fn_operacion_guardar(text,text,text,text,jsonb); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_provisionar_usuario_por_email(text)')) is distinct from '5388e0c0f96aa18f56a7c6c9291fe84c' then raise exception 'Cambió public.fn_provisionar_usuario_por_email(text); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_usuarios_activos_count(uuid)')) is distinct from '5a112c5c8510dfec42fd1abcc21eaa03' then raise exception 'Cambió public.fn_usuarios_activos_count(uuid); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.trg_invitacion_onboarding()')) is distinct from '3045e0b02e38a7772aba9e13265eb099' then raise exception 'Cambió public.trg_invitacion_onboarding(); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.trg_validar_permiso_broker()')) is distinct from '126696995d31a72bda7b022567dbad2a' then raise exception 'Cambió public.trg_validar_permiso_broker(); revisar antes de aplicar';end if;

 if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_permiso_efectivo(uuid,entidad_t,uuid,accion_permiso_t)')) is distinct from 'c97525e1fea09aae34632f9b3ccfb5e7' then raise exception 'Cambió el permiso efectivo; revisar antes de aplicar';end if;
end;$preflight$;

revoke all on function public.fn_provisionar_usuario_por_email(text) from public,anon,authenticated;

-- La auditoría queda sin operación de borrado para clientes, incluido superadmin.

revoke all on function public.fn_auditoria_vaciar() from public,anon,authenticated,service_role;

revoke all on function public.fn_docworks_auditoria_trigger() from public,anon,authenticated;

revoke all on function public.trg_invitacion_onboarding() from public,anon,authenticated;

revoke all on function public.dw_clausula_personal_touch() from public,anon,authenticated;


create function docworks_private.es_admin_interno(p_usuario_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.usuarios where id=p_usuario_id and activo and rol_base::text in ('dueno','admin'));
$$;
create function docworks_private.es_super_interno(p_usuario_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.super_admins where user_id=p_usuario_id);
$$;
revoke all on function docworks_private.es_admin_interno(uuid),docworks_private.es_super_interno(uuid) from public,anon,authenticated,service_role;

create or replace function public.fn_es_admin(p_usuario_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce(p_usuario_id=auth.uid(),false) and docworks_private.es_admin_interno(p_usuario_id);
$$;
create or replace function public.fn_es_super_admin(p_usuario_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce(p_usuario_id=auth.uid(),false) and docworks_private.es_super_interno(p_usuario_id);
$$;

create function docworks_private.exigir_consulta_inmobiliaria(p_inmobiliaria_id uuid) returns void
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or (not docworks_private.es_super_interno(auth.uid()) and not exists(
  select 1 from public.usuarios u where u.id=auth.uid() and u.activo and u.inmobiliaria_id=p_inmobiliaria_id)) then
  raise exception 'Consulta no autorizada' using errcode='42501';
 end if;
end;$$;
revoke all on function docworks_private.exigir_consulta_inmobiliaria(uuid) from public,anon,authenticated,service_role;


create or replace function public.fn_limite_usuarios(p_inmobiliaria_id uuid) returns integer
language plpgsql stable security definer set search_path='' as $$
declare resultado integer;
begin
 perform docworks_private.exigir_consulta_inmobiliaria(p_inmobiliaria_id);
select coalesce((select s.limite_usuarios from docworks_private.seguimiento s where s.inmobiliaria_id=p_inmobiliaria_id),pl.limite_usuarios) into resultado from public.membresias m join public.planes pl on pl.id = m.plan_id
   where m.inmobiliaria_id = p_inmobiliaria_id;
 return resultado;
end;$$;

create or replace function public.fn_usuarios_activos_count(p_inmobiliaria_id uuid) returns integer
language plpgsql stable security definer set search_path='' as $$
declare resultado integer;
begin
 perform docworks_private.exigir_consulta_inmobiliaria(p_inmobiliaria_id);
select count(*)::int into resultado from public.usuarios where inmobiliaria_id = p_inmobiliaria_id and activo;
 return resultado;
end;$$;

create or replace function public.fn_invitaciones_pendientes_count(p_inmobiliaria_id uuid) returns integer
language plpgsql stable security definer set search_path='' as $$
declare resultado integer;
begin
 perform docworks_private.exigir_consulta_inmobiliaria(p_inmobiliaria_id);
select count(*)::int into resultado from public.invitaciones
   where inmobiliaria_id = p_inmobiliaria_id and not usada and expira_en > now();
 return resultado;
end;$$;

CREATE OR REPLACE FUNCTION public.trg_validar_permiso_broker()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_inmob_usuario uuid; v_inmob_entidad uuid; v_rol rol_base_t;
begin
  select inmobiliaria_id, rol_base into v_inmob_usuario, v_rol from usuarios where id = new.usuario_id and activo;
  if v_inmob_usuario is null then raise exception 'usuario_id inexistente o inactivo'; end if;
  if v_rol <> 'broker' then raise exception 'permisos_broker es exclusivo para usuarios con rol_base=broker'; end if;

  v_inmob_entidad := fn_entidad_inmobiliaria(new.entidad_tipo, new.entidad_id);
  if v_inmob_entidad is null then raise exception 'entidad_id inexistente'; end if;
  if v_inmob_entidad <> v_inmob_usuario then raise exception 'La entidad no pertenece a la inmobiliaria del usuario'; end if;
  if not docworks_private.es_admin_interno(new.otorgado_por) then raise exception 'otorgado_por debe ser Admin/Dueño'; end if;
  if (select inmobiliaria_id from usuarios where id = new.otorgado_por) <> v_inmob_usuario then
    raise exception 'otorgado_por debe pertenecer a la misma inmobiliaria que el broker';
  end if;

  return new;
end;
$function$;


CREATE OR REPLACE FUNCTION docworks_private.provisionar_prueba(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare u auth.users; v_id uuid; v_plan uuid; v_nombre text; v_inmobiliaria text;
begin
  select * into u from auth.users where id=p_user_id for update;
  if u.id is null or u.email_confirmed_at is null then return null; end if;
  select inmobiliaria_id into v_id from public.usuarios where id=u.id;
  if found then return v_id; end if;
  if docworks_private.es_super_interno(u.id) then return null; end if;
  -- Las invitaciones conservan su inmobiliaria y rol, aunque el alta venga de la landing.
  perform public.fn_provisionar_usuario_por_email(u.email);
  select inmobiliaria_id into v_id from public.usuarios where id=u.id;
  if found then return v_id; end if;
  if coalesce(u.raw_user_meta_data->>'docworks_registro','') not in ('trial_14_v1','trial_month_v1') then return null; end if;
  v_nombre=trim(coalesce(u.raw_user_meta_data->>'nombre',''));
  v_inmobiliaria=trim(coalesce(u.raw_user_meta_data->>'inmobiliaria',''));
  if length(v_nombre) not between 1 and 120 or length(v_inmobiliaria) not between 1 and 160 then
    raise exception 'Completá tu nombre y el nombre de la inmobiliaria';
  end if;
  select id into v_plan from public.planes where codigo='inicial' and activo;
  if v_plan is null then raise exception 'Plan de prueba no disponible'; end if;
  insert into public.inmobiliarias(nombre) values(v_inmobiliaria) returning id into v_id;
  insert into public.usuarios(id,inmobiliaria_id,email,nombre,rol_base,perfil_permisos)
  values(u.id,v_id,lower(trim(u.email)),v_nombre,'dueno','senior');
  insert into public.membresias(inmobiliaria_id,plan_id,estado,fecha_inicio,fecha_renovacion,fecha_vencimiento,es_prueba)
  values(v_id,v_plan,'activa',u.email_confirmed_at,u.email_confirmed_at+interval '1 month',u.email_confirmed_at+interval '1 month',true);
  insert into public.auditoria(inmobiliaria_id,usuario_id,entidad_tipo,entidad_id,accion,valor_nuevo,origen)
  values(v_id,u.id,'inmobiliaria',v_id,'crear',jsonb_build_object('nombre',v_inmobiliaria,'prueba_meses',1,'registro_origen',u.raw_user_meta_data->>'docworks_registro'),'directa');
  return v_id;
end; $function$;


CREATE OR REPLACE FUNCTION docworks_private.exigir_escritura_operacion(p_accion text, p_id text, p_datos jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  actor public.usuarios;
  actual public.operaciones;
  existe boolean;
  responsable text;
  datos jsonb := p_datos;
begin
  -- La autorización proviene del usuario activo del servidor, nunca del JSON.
  -- El bloqueo comparte la transacción con la escritura y serializa cambios de rol/baja.
  select * into actor from public.usuarios u where u.id=auth.uid() and u.activo for share;
  if actor.id is null or actor.rol_base::text not in ('dueno','admin','broker','vendedor') then
    raise exception 'No tenés permiso para modificar operaciones.' using errcode='42501';
  end if;
  if p_accion not in ('guardar','eliminar','restaurar','eliminar_permanente','purgar','vaciar') then
    raise exception 'Acción no permitida.' using errcode='42501';
  end if;
  if p_accion in ('purgar','vaciar') then
    if actor.rol_base::text not in ('dueno','admin') then
      raise exception 'Solo Dueño o Administrador puede gestionar la papelera.' using errcode='42501';
    end if;
    return datos;
  end if;
  if nullif(btrim(p_id),'') is null then
    raise exception 'Falta el identificador de la operación.' using errcode='22023';
  end if;
  select * into actual from public.operaciones o
    where o.id=p_id and o.inmobiliaria_id=actor.inmobiliaria_id for update;
  existe := found;
  if p_accion <> 'guardar' then
    if actor.rol_base::text not in ('dueno','admin') or not existe then
      raise exception 'Operación no disponible para esta acción.' using errcode='42501';
    end if;
    return datos;
  end if;
  if datos is null or jsonb_typeof(datos) <> 'object' then
    raise exception 'Los datos de la operación deben ser un objeto.' using errcode='22023';
  end if;
  if existe then
    if actual.eliminado_en is not null then
      raise exception 'Restaurá la operación antes de editarla.' using errcode='42501';
    end if;
    if actor.rol_base::text='vendedor' or
       (actor.rol_base::text='broker' and not docworks_private.puede_leer_operacion(actual.inmobiliaria_id,actual.datos,actual.creado_por)) then
      raise exception 'No tenés permiso para editar esta operación.' using errcode='42501';
    end if;
    if actor.rol_base::text='broker' and
       nullif(datos->>'broker_id','') is distinct from nullif(actual.datos->>'broker_id','') then
      raise exception 'Solo Dueño o Administrador puede cambiar el asesor.' using errcode='42501';
    end if;
  elsif actor.rol_base::text in ('broker','vendedor') then
    if nullif(datos->>'broker_id','') is not null and datos->>'broker_id'<>actor.id::text then
      raise exception 'Solo podés crear operaciones propias.' using errcode='42501';
    end if;
    datos := jsonb_set(datos,'{broker_id}',to_jsonb(actor.id::text));
  end if;
  responsable := nullif(datos->>'broker_id','');
  -- No invalidar asignaciones históricas que no se cambiaron; validar altas/reasignaciones.
  if responsable is not null and (not existe or responsable is distinct from nullif(actual.datos->>'broker_id','')) and
     not exists(select 1 from public.usuarios u where u.id::text=responsable and u.activo and u.inmobiliaria_id=actor.inmobiliaria_id) then
    raise exception 'El asesor debe ser un usuario activo de esta inmobiliaria.' using errcode='42501';
  end if;
  return datos;
end;
$function$;


CREATE OR REPLACE FUNCTION public.fn_operacion_guardar(p_id text, p_tipo text, p_estado text, p_parent_id text, p_datos jsonb)
 RETURNS TABLE(id text, tipo text, estado text, parent_id text, datos jsonb, creado_en timestamp with time zone, actualizado_en timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_inmob uuid;
  v_existe boolean;
begin
  p_datos := docworks_private.exigir_escritura_operacion('guardar',p_id,p_datos);
  v_inmob := fn_mi_inmobiliaria();
  if v_inmob is null then raise exception 'No se pudo resolver tu inmobiliaria'; end if;
  if p_id is null or trim(p_id)='' then raise exception 'id requerido'; end if;
  if p_parent_id is not null then
    if p_parent_id = p_id then raise exception 'Una operación no puede ser su propia operación padre'; end if;
    if not exists(select 1 from operaciones o where o.id=p_parent_id and o.inmobiliaria_id=v_inmob and o.eliminado_en is null and docworks_private.puede_leer_operacion(o.inmobiliaria_id,o.datos,o.creado_por)) then
      raise exception 'La operación padre no existe o no pertenece a tu inmobiliaria';
    end if;
  end if;

  select exists(select 1 from operaciones o where o.id=p_id and o.inmobiliaria_id=v_inmob) into v_existe;
  if v_existe then
    update operaciones o set tipo=p_tipo,estado=coalesce(p_estado,'borrador'),parent_id=p_parent_id,datos=p_datos,actualizado_por=auth.uid(),actualizado_en=now()
    where o.id=p_id and o.inmobiliaria_id=v_inmob;
    if not found then raise exception 'La operación no existe o no pertenece a tu inmobiliaria'; end if;
  else
    insert into operaciones(id,inmobiliaria_id,tipo,estado,parent_id,datos,creado_por,actualizado_por)
    values(p_id,v_inmob,p_tipo,coalesce(p_estado,'borrador'),p_parent_id,p_datos,auth.uid(),auth.uid());
    insert into auditoria(inmobiliaria_id,usuario_id,entidad_tipo,accion,valor_nuevo,origen)
    values(v_inmob,auth.uid(),'operacion','crear',jsonb_build_object('id',p_id,'tipo',p_tipo),'directa');
  end if;
  return query select o.id,o.tipo,o.estado,o.parent_id,o.datos,o.creado_en,o.actualizado_en from operaciones o where o.id=p_id and o.inmobiliaria_id=v_inmob;
exception when unique_violation then
  raise exception 'No se pudo confirmar el identificador de la operación. Conservá el borrador y contactá soporte.' using errcode='40001';
end;
$function$;


create or replace function public.fn_clausula_mover(p_clausula_id uuid,p_nuevo_orden integer)
returns void language plpgsql security definer set search_path='' as $$
declare actual public.clausulas; tenant uuid;
begin
 tenant:=public.fn_mi_inmobiliaria();
 select * into actual from public.clausulas c where c.id=p_clausula_id and c.inmobiliaria_id=tenant and c.activo and c.eliminado_en is null for update;
 if auth.uid() is null or actual.id is null then raise exception 'Cláusula no disponible para esta acción' using errcode='42501';end if;
 if public.fn_permiso_efectivo(auth.uid(),'clausula',p_clausula_id,'editar') is distinct from 'permitido' then
  raise exception 'No tenés permiso para reordenar esta cláusula' using errcode='42501';
 end if;
 if p_nuevo_orden is null then raise exception 'Falta el orden de la cláusula' using errcode='22023';end if;
 if actual.orden=p_nuevo_orden then return;end if;
 update public.clausulas set orden=p_nuevo_orden,actualizada_en=now() where id=actual.id and inmobiliaria_id=tenant;
 insert into public.auditoria(inmobiliaria_id,usuario_id,entidad_tipo,entidad_id,accion,valor_anterior,valor_nuevo,origen)
 values(tenant,auth.uid(),'clausula',actual.id,'mover',jsonb_build_object('orden',actual.orden),jsonb_build_object('orden',p_nuevo_orden),'directa');
end;$$;

-- Impedir que un administrador consulte permisos de otra inmobiliaria.
CREATE OR REPLACE FUNCTION public.fn_permiso_efectivo(p_usuario_id uuid, p_entidad_tipo entidad_t, p_entidad_id uuid, p_accion accion_permiso_t)
 RETURNS resultado_t
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_inmob_usuario uuid;
  v_inmob_entidad uuid;
  v_rol           rol_base_t;
  v_excepcion     resultado_t;
  v_proteccion    proteccion_t;
  v_perfil        perfil_permisos_t;
begin
  if p_usuario_id <> auth.uid() and not fn_es_admin(auth.uid()) then
    return 'denegado';
  end if;

  select inmobiliaria_id, rol_base into v_inmob_usuario, v_rol from usuarios where id = p_usuario_id and activo;
  if v_inmob_usuario is null or v_inmob_usuario is distinct from public.fn_mi_inmobiliaria() then
    return 'denegado';
  end if;

  v_inmob_entidad := fn_entidad_inmobiliaria(p_entidad_tipo, p_entidad_id);
  if v_inmob_entidad is null or v_inmob_entidad <> v_inmob_usuario then
    return 'denegado';
  end if;

  if v_rol in ('dueno','admin') then
    return 'permitido';
  end if;

  if v_rol <> 'broker' then
    return 'denegado';
  end if;

  if p_entidad_tipo = 'bloque' then
    select proteccion into v_proteccion from bloques where id = p_entidad_id;
  else
    select proteccion into v_proteccion from clausulas where id = p_entidad_id;
  end if;

  select resultado into v_excepcion
    from permisos_broker
   where usuario_id = p_usuario_id and entidad_tipo = p_entidad_tipo
     and entidad_id = p_entidad_id and accion = p_accion;
  if v_excepcion is not null then
    return v_excepcion;
  end if;

  if v_proteccion = 'C' then
    return 'denegado';
  elsif v_proteccion = 'B' then
    return 'permitido';
  elsif v_proteccion = 'A' then
    select perfil_permisos into v_perfil from usuarios where id = p_usuario_id;
    return case when v_perfil = 'senior' then 'permitido' else 'requiere_autorizacion' end;
  end if;

  return 'permitido';
end;
$function$
;
alter policy permisos_broker_select on public.permisos_broker using ((usuario_id=auth.uid() or public.fn_es_admin(auth.uid())) and exists(select 1 from public.usuarios u where u.id=permisos_broker.usuario_id and u.inmobiliaria_id=public.fn_mi_inmobiliaria()));
