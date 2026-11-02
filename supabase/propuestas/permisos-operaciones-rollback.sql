-- ROLLBACK de DDL: no restaura ni altera filas o documentos. Solo para la propuesta exacta.
BEGIN;
do $preflight$
begin
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operacion_guardar(text,text,text,text,jsonb)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'd514c71a69865df2ca6556c46af532ee' then
    raise exception 'Preflight: cambió public.fn_operacion_guardar; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operacion_eliminar(text)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from '9b8aa8f49e97098147206b46c07af55e' then
    raise exception 'Preflight: cambió public.fn_operacion_eliminar; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operacion_restaurar(text)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'c9674a9a16fabe481b962936bc1c574e' then
    raise exception 'Preflight: cambió public.fn_operacion_restaurar; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operacion_eliminar_permanente(text)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from '77b805fad3bfa049f5408698a2dace70' then
    raise exception 'Preflight: cambió public.fn_operacion_eliminar_permanente; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operaciones_purgar_vencidas()') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'ff0deb0157ac9b2e03e7549d79c113b0' then
    raise exception 'Preflight: cambió public.fn_operaciones_purgar_vencidas; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operaciones_vaciar_papelera()') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'f80a870f0ebc26b84ae546bf22c249b4' then
    raise exception 'Preflight: cambió public.fn_operaciones_vaciar_papelera; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operaciones_listar()') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'd32184f5d04cd1354ea662f35df3a39a' then
    raise exception 'Preflight: cambió public.fn_operaciones_listar; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_operaciones_papelera()') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'd027584d3f25e4addd8136236d0dfef7' then
    raise exception 'Preflight: cambió public.fn_operaciones_papelera; revisar antes de continuar.';
  end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('public.fn_auditoria_registrar(text,text,jsonb)') and prosecdef and proconfig=ARRAY['search_path=public, pg_temp']) is distinct from 'a7cbc0d406e01340f8363c65581717a2' then
    raise exception 'Preflight: cambió public.fn_auditoria_registrar; revisar antes de continuar.';
  end if;
end;
$preflight$;
do $rollback_policy$ begin
  if (select count(*) from pg_policies where schemaname='public' and tablename in ('operaciones','documento_versiones','auditoria')) <> 3 then raise exception 'Cambió una política; no revertir automáticamente.'; end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='auditoria' and policyname='auditoria_select' and md5(qual)='df8f3cab611ace93d0cd968a243fe0dd' and cmd='SELECT' and permissive='PERMISSIVE' and roles::text='{authenticated}') then raise exception 'Cambió una política; no revertir automáticamente.'; end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='documento_versiones' and policyname='documento_versiones_select' and md5(qual)='6c68d5654b4c6f3f2d16eb82633d5f3a' and cmd='SELECT' and permissive='PERMISSIVE' and roles::text='{authenticated}') then raise exception 'Cambió una política; no revertir automáticamente.'; end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='operaciones' and policyname='operaciones_select' and md5(qual)='ed23dd28046f96b4168e365be0db4a08' and cmd='SELECT' and permissive='PERMISSIVE' and roles::text='{authenticated}') then raise exception 'Cambió una política; no revertir automáticamente.'; end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('docworks_private.puede_leer_operacion(uuid,jsonb,uuid)') and prosecdef and proconfig=ARRAY['search_path=""']) is distinct from '2289da35778e2c6f50ed1d3365780d9b' then raise exception 'Cambió un helper; no revertir automáticamente.'; end if;
  if (select md5(prosrc) from pg_proc where oid=to_regprocedure('docworks_private.exigir_escritura_operacion(text,text,jsonb)') and prosecdef and proconfig=ARRAY['search_path=""']) is distinct from '36c7c10e2a4e29824ff5a2ffd76a8ad3' then raise exception 'Cambió un helper; no revertir automáticamente.'; end if;
end; $rollback_policy$;
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
  v_inmob := fn_mi_inmobiliaria();
  if v_inmob is null then raise exception 'No se pudo resolver tu inmobiliaria'; end if;
  if p_id is null or trim(p_id)='' then raise exception 'id requerido'; end if;
  if p_parent_id is not null then
    if p_parent_id = p_id then raise exception 'Una operación no puede ser su propia operación padre'; end if;
    if not exists(select 1 from operaciones o where o.id=p_parent_id and o.inmobiliaria_id=v_inmob and o.eliminado_en is null) then
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
  where o.inmobiliaria_id = fn_mi_inmobiliaria() and o.eliminado_en is null
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
  where o.inmobiliaria_id = fn_mi_inmobiliaria() and o.eliminado_en is not null
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
   where o.id = p_operacion_id and o.eliminado_en is null;

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
drop policy if exists auditoria_select on public.auditoria;
create policy auditoria_select on public.auditoria for select to public using ((inmobiliaria_id = fn_mi_inmobiliaria()));
drop policy if exists documento_versiones_select on public.documento_versiones;
create policy documento_versiones_select on public.documento_versiones for select to authenticated using ((inmobiliaria_id = ( SELECT fn_mi_inmobiliaria() AS fn_mi_inmobiliaria)));
drop policy if exists operaciones_select on public.operaciones;
create policy operaciones_select on public.operaciones for select to public using ((inmobiliaria_id = fn_mi_inmobiliaria()));
grant INSERT on public.documento_versiones to anon;
grant SELECT on public.documento_versiones to anon;
grant UPDATE on public.documento_versiones to anon;
grant DELETE on public.documento_versiones to anon;
grant TRUNCATE on public.documento_versiones to anon;
grant REFERENCES on public.documento_versiones to anon;
grant TRIGGER on public.documento_versiones to anon;
grant INSERT on public.documento_versiones to authenticated;
grant SELECT on public.documento_versiones to authenticated;
grant UPDATE on public.documento_versiones to authenticated;
grant DELETE on public.documento_versiones to authenticated;
grant TRUNCATE on public.documento_versiones to authenticated;
grant REFERENCES on public.documento_versiones to authenticated;
grant TRIGGER on public.documento_versiones to authenticated;
drop function docworks_private.exigir_escritura_operacion(text,text,jsonb);
drop function docworks_private.puede_leer_operacion(uuid,jsonb,uuid);
COMMIT;
