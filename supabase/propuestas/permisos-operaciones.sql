-- PROPUESTA LOCAL NO APLICADA. Base de catálogo: 2026-11-02.
BEGIN;
do $preflight$
begin
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operacion_guardar(text,text,text,text,jsonb)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'd32c0bb00c786e3d5c2176646f1352e3' then
    raise exception 'Preflight: cambió public.fn_operacion_guardar; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operacion_eliminar(text)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'e399188502a474d60fee722f26b44a90' then
    raise exception 'Preflight: cambió public.fn_operacion_eliminar; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operacion_restaurar(text)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from '1057db690d1fe96653c2189082a70044' then
    raise exception 'Preflight: cambió public.fn_operacion_restaurar; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operacion_eliminar_permanente(text)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'fdcada47216093305c1bac789f081b0c' then
    raise exception 'Preflight: cambió public.fn_operacion_eliminar_permanente; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operaciones_purgar_vencidas()') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from '8fc89013830fd3cc03dd69566d0c1bb7' then
    raise exception 'Preflight: cambió public.fn_operaciones_purgar_vencidas; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operaciones_vaciar_papelera()') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from '19ffa2801a408537a1d6104066fefc68' then
    raise exception 'Preflight: cambió public.fn_operaciones_vaciar_papelera; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operaciones_listar()') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from '340d1c4809e6742b6f83ec2ebf5bf6dd' then
    raise exception 'Preflight: cambió public.fn_operaciones_listar; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operaciones_papelera()') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from '0e50ddceed086b9469d796801ab32cdf' then
    raise exception 'Preflight: cambió public.fn_operaciones_papelera; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_auditoria_registrar(text,text,jsonb)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from '1309d924922495a9a80ee184862231f7' then
    raise exception 'Preflight: cambió public.fn_auditoria_registrar; revisar antes de continuar.';
  end if;
end;
$preflight$;

do $policy_preflight$
begin
  if to_regprocedure('docworks_private.puede_leer_operacion(uuid,jsonb,uuid)') is not null or
     to_regprocedure('docworks_private.exigir_escritura_operacion(text,text,jsonb)') is not null then
    raise exception 'Ya existen helpers de permisos: revisar antes de continuar.';
  end if;
  if (select count(*) from pg_policies where schemaname='public' and tablename in ('operaciones','documento_versiones','auditoria')) <> 3 or
     exists(select 1 from pg_policies where schemaname='public' and tablename in ('operaciones','documento_versiones','auditoria') and cmd<>'SELECT') then
    raise exception 'Cambió el conjunto de políticas de operaciones.';
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='auditoria' and policyname='auditoria_select' and cmd='SELECT' and permissive='PERMISSIVE' and qual='(inmobiliaria_id = fn_mi_inmobiliaria())' and roles::text='{public}') then raise exception 'Cambió una política de lectura; revisar antes de continuar.'; end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='documento_versiones' and policyname='documento_versiones_select' and cmd='SELECT' and permissive='PERMISSIVE' and qual='(inmobiliaria_id = ( SELECT fn_mi_inmobiliaria() AS fn_mi_inmobiliaria))' and roles::text='{authenticated}') then raise exception 'Cambió una política de lectura; revisar antes de continuar.'; end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='operaciones' and policyname='operaciones_select' and cmd='SELECT' and permissive='PERMISSIVE' and qual='(inmobiliaria_id = fn_mi_inmobiliaria())' and roles::text='{public}') then raise exception 'Cambió una política de lectura; revisar antes de continuar.'; end if;
end;
$policy_preflight$;

-- Propuesta local: no ejecutar en producción sin revisión de la matriz y del preflight.
-- No actualiza datos ni modifica triggers, snapshots o textos históricos.
create or replace function docworks_private.puede_leer_operacion(
  p_inmobiliaria uuid, p_datos jsonb, p_creado_por uuid
) returns boolean language sql stable security definer set search_path = '' as $func$
  select exists (
    select 1 from public.usuarios u
    where u.id = auth.uid() and u.activo and u.inmobiliaria_id = p_inmobiliaria
      and (u.rol_base::text in ('dueno','admin','viewer')
        or (u.rol_base::text in ('broker','vendedor') and
          case when nullif(p_datos->>'broker_id','') is not null
            then p_datos->>'broker_id' = u.id::text
            else p_creado_por = u.id end))
  );
$func$;

create or replace function docworks_private.exigir_escritura_operacion(
  p_accion text, p_id text, p_datos jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $func$
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
  if not existe and exists(select 1 from public.operaciones o where o.id=p_id) then
    raise exception 'Operación no disponible para esta acción.' using errcode='42501';
  end if;
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
$func$;

revoke all on function docworks_private.puede_leer_operacion(uuid,jsonb,uuid) from public, anon;
revoke all on function docworks_private.exigir_escritura_operacion(text,text,jsonb) from public, anon;
grant execute on function docworks_private.puede_leer_operacion(uuid,jsonb,uuid) to authenticated;
-- El helper de escritura se usa únicamente dentro de las RPC SECURITY DEFINER.
revoke all on function docworks_private.exigir_escritura_operacion(text,text,jsonb) from authenticated;

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

  select exists(select 1 from operaciones o where o.id=p_id) into v_existe;
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
  return query select o.id,o.tipo,o.estado,o.parent_id,o.datos,o.creado_en,o.actualizado_en from operaciones o where o.id=p_id;
end;
$function$

;
CREATE OR REPLACE FUNCTION public.fn_operacion_eliminar(p_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_inmob uuid;
begin
  perform docworks_private.exigir_escritura_operacion('eliminar',p_id,'{}'::jsonb);
  v_inmob := fn_mi_inmobiliaria();
  update operaciones set eliminado_en = now(), eliminado_por = auth.uid()
  where id = p_id and inmobiliaria_id = v_inmob and eliminado_en is null;
  if not found then raise exception 'La operación no existe, no pertenece a tu inmobiliaria o ya estaba eliminada'; end if;
  insert into auditoria(inmobiliaria_id, usuario_id, entidad_tipo, accion, valor_nuevo, origen)
  values (v_inmob, auth.uid(), 'operacion', 'eliminar', jsonb_build_object('id',p_id), 'directa');
end;
$function$

;
CREATE OR REPLACE FUNCTION public.fn_operacion_restaurar(p_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_inmob uuid;
begin
  perform docworks_private.exigir_escritura_operacion('restaurar',p_id,'{}'::jsonb);
  v_inmob := fn_mi_inmobiliaria();
  update operaciones set eliminado_en = null, eliminado_por = null
  where id = p_id and inmobiliaria_id = v_inmob and eliminado_en is not null;
  if not found then raise exception 'La operación no existe, no pertenece a tu inmobiliaria o no está en la papelera'; end if;
  insert into auditoria(inmobiliaria_id, usuario_id, entidad_tipo, accion, valor_nuevo, origen)
  values (v_inmob, auth.uid(), 'operacion', 'restaurar', jsonb_build_object('id',p_id), 'directa');
end;
$function$

;
CREATE OR REPLACE FUNCTION public.fn_operacion_eliminar_permanente(p_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_inmob uuid;
begin
  perform docworks_private.exigir_escritura_operacion('eliminar_permanente',p_id,'{}'::jsonb);
  if not fn_es_admin(auth.uid()) then
    raise exception 'Solo Admin/Dueño puede eliminar operaciones permanentemente';
  end if;

  v_inmob := fn_mi_inmobiliaria();
  if v_inmob is null then
    raise exception 'No se pudo resolver tu inmobiliaria';
  end if;

  delete from operaciones
   where id = p_id
     and inmobiliaria_id = v_inmob
     and eliminado_en is not null;

  if not found then
    raise exception 'La operación no existe, no pertenece a tu inmobiliaria o no está en la papelera';
  end if;
end;
$function$

;
CREATE OR REPLACE FUNCTION public.fn_operaciones_purgar_vencidas()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_inmob uuid;
begin
  perform docworks_private.exigir_escritura_operacion('purgar',null,'{}'::jsonb);
  if not fn_es_admin(auth.uid()) then
    raise exception 'Solo Admin/Dueño puede purgar operaciones';
  end if;

  v_inmob := fn_mi_inmobiliaria();
  if v_inmob is null then
    raise exception 'No se pudo resolver tu inmobiliaria';
  end if;

  delete from operaciones
   where inmobiliaria_id = v_inmob
     and eliminado_en is not null
     and eliminado_en < now() - interval '30 days';
end;
$function$

;
CREATE OR REPLACE FUNCTION public.fn_operaciones_vaciar_papelera()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_inmob uuid;
begin
  perform docworks_private.exigir_escritura_operacion('vaciar',null,'{}'::jsonb);
  if not fn_es_admin(auth.uid()) then
    raise exception 'Solo Admin/Dueño puede vaciar la papelera';
  end if;

  v_inmob := fn_mi_inmobiliaria();
  if v_inmob is null then
    raise exception 'No se pudo resolver tu inmobiliaria';
  end if;

  delete from operaciones
   where inmobiliaria_id = v_inmob
     and eliminado_en is not null;
end;
$function$

;
CREATE OR REPLACE FUNCTION public.fn_operaciones_listar()
 RETURNS TABLE(id text, tipo text, estado text, parent_id text, datos jsonb, creado_en timestamp with time zone, actualizado_en timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select o.id, o.tipo, o.estado, o.parent_id, o.datos, o.creado_en, o.actualizado_en
  from operaciones o
  where o.inmobiliaria_id = fn_mi_inmobiliaria() and docworks_private.puede_leer_operacion(o.inmobiliaria_id,o.datos,o.creado_por) and o.eliminado_en is null
  order by o.creado_en desc;
$function$

;
CREATE OR REPLACE FUNCTION public.fn_operaciones_papelera()
 RETURNS TABLE(id text, tipo text, estado text, parent_id text, datos jsonb, creado_en timestamp with time zone, eliminado_en timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select o.id, o.tipo, o.estado, o.parent_id, o.datos, o.creado_en, o.eliminado_en
  from operaciones o
  where o.inmobiliaria_id = fn_mi_inmobiliaria() and docworks_private.puede_leer_operacion(o.inmobiliaria_id,o.datos,o.creado_por) and o.eliminado_en is not null
  order by o.eliminado_en desc;
$function$

;
CREATE OR REPLACE FUNCTION public.fn_auditoria_registrar(p_accion text, p_operacion_id text, p_valor_nuevo jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_usuario_id uuid;
  v_inmobiliaria_id uuid;
  v_inmobiliaria_operacion uuid;
  v_valor_nuevo jsonb;
begin
  v_usuario_id := auth.uid();
  if v_usuario_id is null then
    raise exception 'Se requiere una sesión autenticada.' using errcode = '42501';
  end if;

  select u.inmobiliaria_id into v_inmobiliaria_id
    from public.usuarios u
   where u.id = v_usuario_id and u.activo = true;

  if v_inmobiliaria_id is null then
    raise exception 'El usuario no está activo o no tiene inmobiliaria.' using errcode = '42501';
  end if;

  if coalesce(btrim(p_accion), '') <> 'exportar_con_faltantes' then
    raise exception 'Acción de auditoría no permitida.' using errcode = '42501';
  end if;

  if nullif(btrim(p_operacion_id), '') is null then
    raise exception 'Falta el identificador de la operación.' using errcode = '22023';
  end if;

  if pg_column_size(coalesce(p_valor_nuevo, '{}'::jsonb)) > 20000 then
    raise exception 'El detalle de auditoría es demasiado grande.' using errcode = '22023';
  end if;

  select o.inmobiliaria_id into v_inmobiliaria_operacion
    from public.operaciones o
   where o.id = p_operacion_id and o.eliminado_en is null
     and docworks_private.puede_leer_operacion(o.inmobiliaria_id,o.datos,o.creado_por);

  if not found or v_inmobiliaria_operacion is distinct from v_inmobiliaria_id then
    raise exception 'La operación no pertenece a la inmobiliaria de la sesión.' using errcode = '42501';
  end if;

  v_valor_nuevo := (coalesce(p_valor_nuevo, '{}'::jsonb)
                    - 'usuario_id' - 'usuario_email' - 'usuario_nombre' - 'inmobiliaria_id')
                   || jsonb_build_object('operacion_id', p_operacion_id);

  insert into public.auditoria (inmobiliaria_id, usuario_id, entidad_tipo, entidad_id,
                                accion, valor_nuevo, origen)
  values (v_inmobiliaria_id, v_usuario_id, 'operacion', null,
          p_accion, v_valor_nuevo, 'directa');
end;
$function$
;

drop policy operaciones_select on public.operaciones;
create policy operaciones_select on public.operaciones for select to authenticated
using (docworks_private.puede_leer_operacion(inmobiliaria_id,datos,creado_por));
drop policy documento_versiones_select on public.documento_versiones;
create policy documento_versiones_select on public.documento_versiones for select to authenticated
using (inmobiliaria_id=public.fn_mi_inmobiliaria() and exists (
  select 1 from public.operaciones o where o.id=operacion_id and o.inmobiliaria_id=documento_versiones.inmobiliaria_id
    and docworks_private.puede_leer_operacion(o.inmobiliaria_id,o.datos,o.creado_por)
));
drop policy auditoria_select on public.auditoria;
create policy auditoria_select on public.auditoria for select to authenticated
using (inmobiliaria_id=public.fn_mi_inmobiliaria() and (
  exists(select 1 from public.usuarios u where u.id=auth.uid() and u.activo and u.rol_base::text in ('dueno','admin','viewer'))
  or (entidad_tipo in ('operacion','operaciones') and exists (
    select 1 from public.operaciones o where o.inmobiliaria_id=auditoria.inmobiliaria_id
      and o.id=coalesce(valor_nuevo->>'operacion_id',valor_nuevo->>'id',valor_anterior->>'operacion_id',valor_anterior->>'id',entidad_id::text)
      and docworks_private.puede_leer_operacion(o.inmobiliaria_id,o.datos,o.creado_por)
  ))
));

revoke all on function public.fn_operacion_guardar(text,text,text,text,jsonb) from public, anon;
grant execute on function public.fn_operacion_guardar(text,text,text,text,jsonb) to authenticated;
revoke all on function public.fn_operacion_eliminar(text) from public, anon;
grant execute on function public.fn_operacion_eliminar(text) to authenticated;
revoke all on function public.fn_operacion_restaurar(text) from public, anon;
grant execute on function public.fn_operacion_restaurar(text) to authenticated;
revoke all on function public.fn_operacion_eliminar_permanente(text) from public, anon;
grant execute on function public.fn_operacion_eliminar_permanente(text) to authenticated;
revoke all on function public.fn_operaciones_purgar_vencidas() from public, anon;
grant execute on function public.fn_operaciones_purgar_vencidas() to authenticated;
revoke all on function public.fn_operaciones_vaciar_papelera() from public, anon;
grant execute on function public.fn_operaciones_vaciar_papelera() to authenticated;
revoke all on function public.fn_operaciones_listar() from public, anon;
grant execute on function public.fn_operaciones_listar() to authenticated;
revoke all on function public.fn_operaciones_papelera() from public, anon;
grant execute on function public.fn_operaciones_papelera() to authenticated;
revoke all on function public.fn_auditoria_registrar(text,text,jsonb) from public, anon;
grant execute on function public.fn_auditoria_registrar(text,text,jsonb) to authenticated;
revoke all on public.documento_versiones from anon;
revoke insert,update,delete,truncate,references,trigger on public.documento_versiones from authenticated;
grant select on public.documento_versiones to authenticated;

COMMIT;
