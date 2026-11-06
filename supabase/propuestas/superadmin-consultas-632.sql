-- Consultas existentes: respetar el límite efectivo y cargar la nota privada sólo en detalle superadmin.
CREATE OR REPLACE FUNCTION public.fn_admin_dashboard()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_inmob uuid;
begin
  if not fn_es_admin(auth.uid()) then raise exception 'Solo Admin/Dueño'; end if;
  v_inmob := fn_mi_inmobiliaria();
  return (select jsonb_build_object(
    'inmobiliaria_nombre', i.nombre,
    'plan_nombre', pl.nombre, 'limite_usuarios', public.fn_limite_usuarios(m.inmobiliaria_id),
    'usuarios_activos', fn_usuarios_activos_count(v_inmob),
    'estado_membresia', m.estado, 'fecha_renovacion', m.fecha_renovacion, 'fecha_vencimiento', m.fecha_vencimiento
  ) from inmobiliarias i join membresias m on m.inmobiliaria_id = i.id join planes pl on pl.id = m.plan_id
  where i.id = v_inmob);
end;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_limite_usuarios(p_inmobiliaria_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select coalesce((select s.limite_usuarios from docworks_private.seguimiento s where s.inmobiliaria_id=p_inmobiliaria_id),pl.limite_usuarios) from membresias m join planes pl on pl.id = m.plan_id
   where m.inmobiliaria_id = p_inmobiliaria_id;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_mi_contexto()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_es_super boolean;
  v_usuario  usuarios;
  v_inmob    inmobiliarias;
  v_mem      jsonb;
  v_habilitado boolean;
begin
  v_es_super := fn_es_super_admin(auth.uid());
  if v_es_super then
    return jsonb_build_object('es_super_admin', true, 'usuario', null, 'inmobiliaria', null, 'membresia', null, 'habilitado', true);
  end if;

  select * into v_usuario from usuarios where id = auth.uid() and activo;
  if v_usuario.id is null then
    return jsonb_build_object('es_super_admin', false, 'usuario', null, 'inmobiliaria', null, 'membresia', null, 'habilitado', false);
  end if;

  select * into v_inmob from inmobiliarias where id = v_usuario.inmobiliaria_id;

  select jsonb_build_object(
    'plan_codigo', pl.codigo, 'plan_nombre', pl.nombre,
    'limite_usuarios', public.fn_limite_usuarios(m.inmobiliaria_id),
    'usuarios_activos', fn_usuarios_activos_count(v_usuario.inmobiliaria_id),
    'estado', case when m.es_prueba and m.fecha_vencimiento<=now() and m.estado in ('activa','pendiente') then 'vencida' else m.estado::text end, 'es_prueba', m.es_prueba, 'fecha_inicio', m.fecha_inicio,
    'fecha_renovacion', m.fecha_renovacion, 'fecha_vencimiento', m.fecha_vencimiento
  ), (m.estado = 'activa' or m.estado = 'pendiente') and (not m.es_prueba or m.fecha_vencimiento > now())
  into v_mem, v_habilitado
  from membresias m join planes pl on pl.id = m.plan_id
  where m.inmobiliaria_id = v_usuario.inmobiliaria_id;

  return jsonb_build_object(
    'es_super_admin', false,
    'usuario', jsonb_build_object('id', v_usuario.id, 'nombre', v_usuario.nombre, 'email', v_usuario.email, 'rol_base', v_usuario.rol_base, 'perfil_permisos', v_usuario.perfil_permisos),
    'inmobiliaria', jsonb_build_object('id', v_inmob.id, 'nombre', v_inmob.nombre),
    'membresia', v_mem,
    'habilitado', coalesce(v_habilitado, false)
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_super_detalle_inmobiliaria(p_inmobiliaria_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_result jsonb;
begin
  if not fn_es_super_admin(auth.uid()) then raise exception 'Solo Super Admin'; end if;
  select jsonb_build_object(
    'nota_interna', (select s.nota from docworks_private.seguimiento s where s.inmobiliaria_id=p_inmobiliaria_id),
 'limite_usuarios_override', (select s.limite_usuarios from docworks_private.seguimiento s where s.inmobiliaria_id=p_inmobiliaria_id),
 'limite_usuarios', public.fn_limite_usuarios(p_inmobiliaria_id),
 'inmobiliaria', (select jsonb_build_object('id', i.id, 'nombre', i.nombre, 'creada_en', i.creada_en) from inmobiliarias i where i.id = p_inmobiliaria_id),
    'membresia', (select jsonb_build_object('estado', m.estado, 'plan_nombre', pl.nombre, 'plan_codigo', pl.codigo, 'limite_usuarios', public.fn_limite_usuarios(m.inmobiliaria_id),
                    'fecha_inicio', m.fecha_inicio, 'fecha_renovacion', m.fecha_renovacion, 'fecha_vencimiento', m.fecha_vencimiento)
                  from membresias m join planes pl on pl.id = m.plan_id where m.inmobiliaria_id = p_inmobiliaria_id),
    'usuarios', (select coalesce(jsonb_agg(jsonb_build_object('id', u.id, 'email', u.email, 'nombre', u.nombre, 'rol_base', u.rol_base, 'activo', u.activo, 'creado_en', u.creado_en) order by u.creado_en asc), '[]'::jsonb)
                 from usuarios u where u.inmobiliaria_id = p_inmobiliaria_id),
    'ultimos_pagos', (select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'monto', p.monto, 'moneda', p.moneda, 'estado', p.estado, 'proveedor', p.proveedor, 'creado_en', p.creado_en) order by p.creado_en desc), '[]'::jsonb)
                       from (select p.* from pagos p join membresias m on m.id = p.membresia_id where m.inmobiliaria_id = p_inmobiliaria_id order by p.creado_en desc limit 10) p),
    'ultima_auditoria', (select coalesce(jsonb_agg(jsonb_build_object('accion', a.accion, 'entidad_tipo', a.entidad_tipo, 'usuario_email', u.email, 'creada_en', a.creada_en) order by a.creada_en desc), '[]'::jsonb)
                          from (select * from auditoria where inmobiliaria_id = p_inmobiliaria_id order by creada_en desc limit 15) a
                          left join usuarios u on u.id = a.usuario_id),
    'clausulas_count', (select count(*) from clausulas where inmobiliaria_id = p_inmobiliaria_id and activo = true),
    'bloques_count', (select count(*) from bloques b join plantillas pt on pt.id = b.plantilla_id where pt.inmobiliaria_id = p_inmobiliaria_id and b.activo = true)
  ) into v_result;
  return v_result;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_super_listar_inmobiliarias()
 RETURNS TABLE(inmobiliaria_id uuid, inmobiliaria_nombre text, plan_nombre text, usuarios_activos integer, limite_usuarios integer, estado membresia_estado_t, fecha_renovacion timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if not fn_es_super_admin(auth.uid()) then raise exception 'Solo Super Admin'; end if;
  return query
    select i.id, i.nombre, pl.nombre, fn_usuarios_activos_count(i.id), public.fn_limite_usuarios(i.id), m.estado, m.fecha_renovacion
    from inmobiliarias i
    join membresias m on m.inmobiliaria_id = i.id
    join planes pl on pl.id = m.plan_id
    order by i.creada_en desc;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_super_preparar_dueno(p_inmobiliaria_id uuid, p_email text, p_nombre text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_email text := lower(trim(coalesce(p_email,'')));
  v_auth_id uuid;
  v_nombre text := nullif(trim(coalesce(p_nombre,'')),'');
  v_inv_id uuid;
  v_existing uuid;
begin
  if auth.uid() is null or not public.fn_es_super_admin(auth.uid()) then
    raise exception 'Solo Super Admin puede preparar el onboarding del dueño';
  end if;

  if p_inmobiliaria_id is null then raise exception 'Falta inmobiliaria_id'; end if;
  if v_email='' or position('@' in v_email)=0 then raise exception 'Email inválido'; end if;

  if not exists (select 1 from public.inmobiliarias where id=p_inmobiliaria_id) then
    raise exception 'La inmobiliaria no existe';
  end if;

  -- Si ya está vinculado, no tocarlo.
  select id into v_existing
    from public.usuarios
   where inmobiliaria_id=p_inmobiliaria_id
     and lower(trim(email))=v_email
   limit 1;
  if v_existing is not null then
    return jsonb_build_object('ok',true,'estado','ya_vinculado','usuario_id',v_existing);
  end if;

  select id into v_auth_id
    from auth.users
   where lower(trim(email))=v_email
   order by created_at desc
   limit 1;

  if v_auth_id is not null then
    -- Nunca reasignar silenciosamente un Auth que ya pertenece a otra inmobiliaria.
    if exists (select 1 from public.usuarios where id=v_auth_id and inmobiliaria_id<>p_inmobiliaria_id) then
      raise exception 'El usuario Auth ya pertenece a otra inmobiliaria';
    end if;

    insert into public.usuarios(id,inmobiliaria_id,email,nombre,rol_base,perfil_permisos,activo)
    values (
      v_auth_id,p_inmobiliaria_id,v_email,
      coalesce(v_nombre,split_part(v_email,'@',1)),
      'dueno','senior',true
    )
    on conflict (id) do nothing;

    insert into public.auditoria(inmobiliaria_id,usuario_id,entidad_tipo,entidad_id,accion,valor_nuevo,origen)
    values (
      p_inmobiliaria_id,v_auth_id,'usuario',v_auth_id,
      'onboarding_super_admin',
      jsonb_build_object('email',v_email,'rol','dueno'),
      'directa'
    );

    return jsonb_build_object('ok',true,'estado','usuario_creado','usuario_id',v_auth_id);
  end if;

  -- No existe Auth todavía: invitación de sistema.
  select id into v_inv_id
    from public.invitaciones
   where inmobiliaria_id=p_inmobiliaria_id
     and lower(trim(email))=v_email
     and not usada
     and expira_en > now()
   order by creada_en desc
   limit 1;

  if v_inv_id is null then
    insert into public.invitaciones(inmobiliaria_id,email,rol_base,perfil_permisos,invitado_por)
    values (p_inmobiliaria_id,v_email,'dueno','senior',null)
    returning id into v_inv_id;
  end if;

  return jsonb_build_object('ok',true,'estado','invitacion_preparada','invitacion_id',v_inv_id);
end;
$function$
;
