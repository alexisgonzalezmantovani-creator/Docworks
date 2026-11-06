-- Backend del panel existente. Las tablas privadas no se exponen por REST.
create schema if not exists docworks_private;
revoke all on schema docworks_private from public, anon;
grant usage on schema docworks_private to authenticated;
create table if not exists docworks_private.seguimiento (
 inmobiliaria_id uuid primary key references public.inmobiliarias(id) on delete cascade,
 nota text, limite_usuarios integer check(limite_usuarios>=0),
 estado_pre_archivo public.membresia_estado_t,
 actualizado_en timestamptz not null default now()
);
create table if not exists docworks_private.anuncio (
 id boolean primary key default true check(id), mensaje text, fecha_fin timestamptz,
 actualizado_por uuid, actualizado_en timestamptz not null default now()
);
create table if not exists docworks_private.eventos (
 id uuid primary key default gen_random_uuid(), actor uuid not null,
 inmobiliaria_id uuid references public.inmobiliarias(id), accion text not null,
 anterior jsonb, nuevo jsonb, creado_en timestamptz not null default now()
);
alter table docworks_private.seguimiento enable row level security;
alter table docworks_private.anuncio enable row level security;
alter table docworks_private.eventos enable row level security;
revoke all on all tables in schema docworks_private from public, anon, authenticated;

create or replace function docworks_private.exigir_super() returns void
language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or not public.fn_es_super_admin(auth.uid()) then
  raise exception 'Acceso restringido a superadministración' using errcode='42501';
 end if;
end;$$;

create or replace function docworks_private.nota(p_inmobiliaria_id uuid,p_nota text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare anterior text;
begin
 perform docworks_private.exigir_super();
 if length(p_nota)>10000 then raise exception 'La nota admite hasta 10000 caracteres'; end if;
 perform 1 from public.inmobiliarias where id=p_inmobiliaria_id for update;
 if not found then raise exception 'Inmobiliaria inexistente'; end if;
 select nota into anterior from docworks_private.seguimiento where inmobiliaria_id=p_inmobiliaria_id;
 insert into docworks_private.seguimiento(inmobiliaria_id,nota) values(p_inmobiliaria_id,nullif(btrim(p_nota),''))
 on conflict(inmobiliaria_id) do update set nota=excluded.nota,actualizado_en=now();
 insert into docworks_private.eventos(actor,inmobiliaria_id,accion,anterior,nuevo)
 values(auth.uid(),p_inmobiliaria_id,'nota_interna',to_jsonb(anterior),to_jsonb(p_nota));
 return jsonb_build_object('ok',true);
end;$$;

create or replace function docworks_private.limites(p_inmobiliaria_id uuid,p_limite_usuarios integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare anterior integer; usados integer;
begin
 perform docworks_private.exigir_super();
 if p_limite_usuarios<0 or p_limite_usuarios>10000 then raise exception 'Límite inválido'; end if;
 perform 1 from public.inmobiliarias where id=p_inmobiliaria_id for update;
 if not found then raise exception 'Inmobiliaria inexistente'; end if;
 usados:=public.fn_usuarios_activos_count(p_inmobiliaria_id)+public.fn_invitaciones_pendientes_count(p_inmobiliaria_id);
 if coalesce(p_limite_usuarios,(select pl.limite_usuarios from public.membresias m join public.planes pl on pl.id=m.plan_id where m.inmobiliaria_id=p_inmobiliaria_id))<usados then
  raise exception 'El límite no puede ser menor que los usuarios activos e invitaciones pendientes';
 end if;
 select limite_usuarios into anterior from docworks_private.seguimiento where inmobiliaria_id=p_inmobiliaria_id;
 insert into docworks_private.seguimiento(inmobiliaria_id,limite_usuarios) values(p_inmobiliaria_id,p_limite_usuarios)
 on conflict(inmobiliaria_id) do update set limite_usuarios=excluded.limite_usuarios,actualizado_en=now();
 insert into docworks_private.eventos(actor,inmobiliaria_id,accion,anterior,nuevo)
 values(auth.uid(),p_inmobiliaria_id,'limite_usuarios',to_jsonb(anterior),to_jsonb(p_limite_usuarios));
 return jsonb_build_object('ok',true);
end;$$;

create or replace function docworks_private.extender(p_inmobiliaria_id uuid,p_dias integer,p_modo text,p_nota text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m public.membresias; fin timestamptz;
begin
 perform docworks_private.exigir_super();
 if p_dias is null or p_dias not between 1 and 366 or p_modo is null or p_modo not in ('extension','prueba_gratis') then raise exception 'Extensión inválida'; end if;
 select * into m from public.membresias where inmobiliaria_id=p_inmobiliaria_id for update;
 if not found then raise exception 'Membresía inexistente'; end if;
 if m.estado in ('suspendida','cancelada','archivada') then raise exception 'Reactivá la cuenta antes de extenderla'; end if;
 if p_modo='prueba_gratis' and m.mercadopago_status in ('authorized','active') then raise exception 'La cuenta tiene una suscripción de pago activa'; end if;
 fin:=greatest(now(),coalesce(m.fecha_vencimiento,now()))+make_interval(days=>p_dias);
 update public.membresias set fecha_vencimiento=fin,fecha_renovacion=fin,estado='activa',
 es_prueba=case when p_modo='prueba_gratis' then true else es_prueba end,actualizado_en=now() where id=m.id;
 insert into docworks_private.eventos(actor,inmobiliaria_id,accion,anterior,nuevo)
 values(auth.uid(),p_inmobiliaria_id,p_modo,jsonb_build_object('vencimiento',m.fecha_vencimiento,'estado',m.estado),jsonb_build_object('vencimiento',fin,'dias',p_dias,'nota',left(p_nota,10000)));
 return jsonb_build_object('ok',true,'fecha_vencimiento',fin);
end;$$;

create or replace function docworks_private.transferir(p_inmobiliaria_id uuid,p_nuevo_dueno_usuario_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare nuevo public.usuarios; anteriores jsonb;
begin
 perform docworks_private.exigir_super();
 perform 1 from public.inmobiliarias where id=p_inmobiliaria_id for update;
 if not found then raise exception 'Inmobiliaria inexistente'; end if;
 perform 1 from public.usuarios where inmobiliaria_id=p_inmobiliaria_id order by id for update;
 select * into nuevo from public.usuarios where id=p_nuevo_dueno_usuario_id and inmobiliaria_id=p_inmobiliaria_id and activo;
 if not found then raise exception 'El nuevo dueño debe ser un usuario activo de esta inmobiliaria'; end if;
 if nuevo.rol_base='dueno' then return jsonb_build_object('ok',true,'sin_cambios',true); end if;
 select jsonb_agg(id) into anteriores from public.usuarios where inmobiliaria_id=p_inmobiliaria_id and rol_base='dueno';
 update public.usuarios set rol_base='admin' where inmobiliaria_id=p_inmobiliaria_id and rol_base='dueno';
 update public.usuarios set rol_base='dueno',perfil_permisos='senior' where id=nuevo.id;
 insert into docworks_private.eventos(actor,inmobiliaria_id,accion,anterior,nuevo)
 values(auth.uid(),p_inmobiliaria_id,'transferir_dueno',anteriores,jsonb_build_object('usuario_id',nuevo.id));
 return jsonb_build_object('ok',true);
end;$$;

create or replace function docworks_private.archivar(p_inmobiliaria_id uuid,p_archivar boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m public.membresias; previo public.membresia_estado_t;
begin
 perform docworks_private.exigir_super();
 if p_archivar is null then raise exception 'Indicá archivar o reactivar'; end if;
 select * into m from public.membresias where inmobiliaria_id=p_inmobiliaria_id for update;
 if not found then raise exception 'Membresía inexistente'; end if;
 if (p_archivar and m.estado='archivada') or (not p_archivar and m.estado<>'archivada') then return jsonb_build_object('ok',true,'sin_cambios',true); end if;
 if p_archivar then
  if m.mercadopago_status in ('authorized','active','pending','paused') then raise exception 'Resolvé primero la suscripción en Mercado Pago; archivar no cancela cobros'; end if;
  insert into docworks_private.seguimiento(inmobiliaria_id,estado_pre_archivo) values(p_inmobiliaria_id,m.estado)
  on conflict(inmobiliaria_id) do update set estado_pre_archivo=excluded.estado_pre_archivo,actualizado_en=now();
  previo:='archivada';
 else
  select estado_pre_archivo into previo from docworks_private.seguimiento where inmobiliaria_id=p_inmobiliaria_id;
  previo:=coalesce(previo,'pendiente');
  if previo in ('activa','pendiente') and m.fecha_vencimiento<=now() then previo:='vencida'; end if;
 end if;
 update public.membresias set estado=previo,actualizado_en=now() where id=m.id;
 insert into docworks_private.eventos(actor,inmobiliaria_id,accion,anterior,nuevo)
 values(auth.uid(),p_inmobiliaria_id,'archivar',to_jsonb(m.estado),to_jsonb(previo));
 return jsonb_build_object('ok',true,'estado',previo);
end;$$;

create or replace function docworks_private.anunciar(p_mensaje text,p_fecha_fin timestamptz) returns jsonb
language plpgsql security definer set search_path='' as $$
declare anterior jsonb; nuevo jsonb;
begin
 perform docworks_private.exigir_super();
 if length(p_mensaje)>2000 then raise exception 'El anuncio admite hasta 2000 caracteres'; end if;
 if nullif(btrim(p_mensaje),'') is not null and p_fecha_fin<=now() then raise exception 'El vencimiento debe ser futuro'; end if;
 perform pg_advisory_xact_lock(632,1);
 select to_jsonb(a) into anterior from docworks_private.anuncio a where id;
 insert into docworks_private.anuncio(id,mensaje,fecha_fin,actualizado_por) values(true,nullif(btrim(p_mensaje),''),p_fecha_fin,auth.uid())
 on conflict(id) do update set mensaje=excluded.mensaje,fecha_fin=excluded.fecha_fin,actualizado_por=excluded.actualizado_por,actualizado_en=now()
 returning jsonb_build_object('mensaje',mensaje,'fecha_fin',fecha_fin) into nuevo;
 insert into docworks_private.eventos(actor,accion,anterior,nuevo) values(auth.uid(),'anuncio_global',anterior,nuevo);
 return nuevo;
end;$$;

create or replace function docworks_private.leer_anuncio() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or (not public.fn_es_super_admin(auth.uid()) and not exists(select 1 from public.usuarios where id=auth.uid() and activo)) then raise exception 'Iniciá sesión' using errcode='42501'; end if;
 return (select jsonb_build_object('mensaje',a.mensaje,'fecha_fin',a.fecha_fin) from docworks_private.anuncio a where a.id and nullif(a.mensaje,'') is not null and (public.fn_es_super_admin(auth.uid()) or a.fecha_fin is null or a.fecha_fin>now()));
end;$$;

create or replace function docworks_private.registrar_pago(p_inmobiliaria_id uuid,p_monto numeric,p_moneda text,p_metodo text,p_fecha date,p_periodo_desde date,p_periodo_hasta date,p_nota text,p_clave uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m public.membresias; pid uuid; anterior public.pagos;
begin
 perform docworks_private.exigir_super();
 if p_monto is null or p_monto::text in ('NaN','Infinity','-Infinity') or p_monto<=0 or p_monto>999999999999 or round(p_monto,2)<>p_monto then raise exception 'Importe inválido'; end if;
 if p_moneda is null or p_moneda not in ('ARS','USD') or nullif(btrim(p_metodo),'') is null or length(p_metodo)>100 then raise exception 'Moneda o medio inválido'; end if;
 if p_fecha is null or p_fecha>(now() at time zone 'America/Argentina/Buenos_Aires')::date then raise exception 'Fecha de pago inválida'; end if;
 if (p_periodo_desde is null)<>(p_periodo_hasta is null) or p_periodo_hasta<p_periodo_desde then raise exception 'Período inválido'; end if;
 if p_clave is null then raise exception 'Falta identificador del registro'; end if;
 select * into m from public.membresias where inmobiliaria_id=p_inmobiliaria_id for update;
 if not found then raise exception 'Membresía inexistente'; end if;
 select * into anterior from public.pagos where membresia_id=m.id and proveedor='Manual' and referencia_externa=p_clave::text;
 if found then
  if anterior.monto<>p_monto or anterior.moneda<>p_moneda or anterior.metodo_pago<>p_metodo or anterior.metadata->>'fecha'<>p_fecha::text or anterior.metadata->>'desde' is distinct from p_periodo_desde::text or anterior.metadata->>'hasta' is distinct from p_periodo_hasta::text then raise exception 'El registro ya existe con otros datos'; end if;
  return jsonb_build_object('ok',true,'id',anterior.id,'reutilizado',true);
 end if;
 insert into public.pagos(membresia_id,monto,moneda,estado,proveedor,referencia_externa,metodo_pago,fecha_pago,periodo,metadata)
 values(m.id,p_monto,p_moneda,'pagado','Manual',p_clave::text,p_metodo,p_fecha::timestamp at time zone 'America/Argentina/Buenos_Aires',case when p_periodo_desde is not null then p_periodo_desde::text||' / '||p_periodo_hasta::text end,jsonb_build_object('actor',auth.uid(),'nota',left(p_nota,10000),'fecha',p_fecha,'desde',p_periodo_desde,'hasta',p_periodo_hasta)) returning id into pid;
 -- Registrar un pago no cambia automáticamente el acceso ni cobra a una tarjeta.
 insert into docworks_private.eventos(actor,inmobiliaria_id,accion,nuevo)
 values(auth.uid(),p_inmobiliaria_id,'pago_manual',jsonb_build_object('id',pid,'monto',p_monto,'moneda',p_moneda));
 return jsonb_build_object('ok',true,'id',pid);
end;$$;

-- API pública sin SECURITY DEFINER; la autorización se valida en cada función privada.
create or replace function public.fn_super_nota_inmobiliaria(p_inmobiliaria_id uuid,p_nota text default null) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.nota(p_inmobiliaria_id,p_nota)$$;
create or replace function public.fn_super_set_limites(p_inmobiliaria_id uuid,p_limite_usuarios integer default null) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.limites(p_inmobiliaria_id,p_limite_usuarios)$$;
create or replace function public.fn_super_extender_membresia(p_inmobiliaria_id uuid,p_dias integer,p_modo text default 'extension',p_nota text default null) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.extender(p_inmobiliaria_id,p_dias,p_modo,p_nota)$$;
create or replace function public.fn_super_transferir_dueno(p_inmobiliaria_id uuid,p_nuevo_dueno_usuario_id uuid) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.transferir(p_inmobiliaria_id,p_nuevo_dueno_usuario_id)$$;
create or replace function public.fn_super_archivar_inmobiliaria(p_inmobiliaria_id uuid,p_archivar boolean) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.archivar(p_inmobiliaria_id,p_archivar)$$;
create or replace function public.fn_super_set_anuncio(p_mensaje text default null,p_fecha_fin timestamptz default null) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.anunciar(p_mensaje,p_fecha_fin)$$;
create or replace function public.fn_super_get_anuncio_global() returns jsonb language sql stable security invoker set search_path='' as $$select docworks_private.leer_anuncio()$$;
create or replace function public.fn_super_registrar_pago(p_inmobiliaria_id uuid,p_monto numeric,p_moneda text,p_metodo text,p_fecha date,p_periodo_desde date default null,p_periodo_hasta date default null,p_nota text default null,p_clave uuid default null) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.registrar_pago(p_inmobiliaria_id,p_monto,p_moneda,p_metodo,p_fecha,p_periodo_desde,p_periodo_hasta,p_nota,p_clave)$$;

do $$declare r record;begin
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='docworks_private' and p.proname in ('exigir_super','nota','limites','extender','transferir','archivar','anunciar','leer_anuncio','registrar_pago') loop
 execute format('revoke all on function %s from public, anon',r.signature);
 execute format('grant execute on function %s to authenticated',r.signature);
 end loop;
end;$$;
do $$declare r record;begin
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('fn_super_nota_inmobiliaria','fn_super_set_limites','fn_super_extender_membresia','fn_super_transferir_dueno','fn_super_archivar_inmobiliaria','fn_super_set_anuncio','fn_super_get_anuncio_global','fn_super_registrar_pago') loop
 execute format('revoke all on function %s from public, anon',r.signature);
 execute format('grant execute on function %s to authenticated',r.signature);
 end loop;
end;$$;

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

create or replace function docworks_private.auditoria_super(p_inmobiliaria_id uuid default null,p_limit integer default 500)
returns table(id uuid,inmobiliaria_id uuid,inmobiliaria_nombre text,usuario_id uuid,usuario_nombre text,usuario_email text,entidad_tipo text,entidad_id uuid,accion text,valor_anterior jsonb,valor_nuevo jsonb,origen text,solicitud_id uuid,autorizado_por uuid,creada_en timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
 perform docworks_private.exigir_super();
 return query select e.id,e.inmobiliaria_id,i.nombre,e.actor,coalesce(s.nombre,u.nombre,'Superadministrador'),u.email,'superadministracion'::text,e.inmobiliaria_id,e.accion,e.anterior,e.nuevo,'directa'::text,null::uuid,null::uuid,e.creado_en
 from docworks_private.eventos e left join public.inmobiliarias i on i.id=e.inmobiliaria_id left join public.usuarios u on u.id=e.actor left join public.super_admins s on s.user_id=e.actor
 where p_inmobiliaria_id is null or e.inmobiliaria_id=p_inmobiliaria_id
 union all
 select a.id,a.inmobiliaria_id,i.nombre,a.usuario_id,u.nombre,u.email,a.entidad_tipo,a.entidad_id,a.accion,a.valor_anterior,a.valor_nuevo,a.origen::text,a.solicitud_id,a.autorizado_por,a.creada_en
 from public.auditoria a left join public.inmobiliarias i on i.id=a.inmobiliaria_id left join public.usuarios u on u.id=a.usuario_id
 where p_inmobiliaria_id is null or a.inmobiliaria_id=p_inmobiliaria_id
 order by 15 desc,1 limit greatest(1,least(coalesce(p_limit,500),2000));
end;$$;
create or replace function public.fn_super_auditoria(p_inmobiliaria_id uuid default null,p_limit integer default 500)
returns table(id uuid,inmobiliaria_id uuid,inmobiliaria_nombre text,usuario_id uuid,usuario_nombre text,usuario_email text,entidad_tipo text,entidad_id uuid,accion text,valor_anterior jsonb,valor_nuevo jsonb,origen text,solicitud_id uuid,autorizado_por uuid,creada_en timestamptz)
language sql stable security invoker set search_path='' as $$select * from docworks_private.auditoria_super(p_inmobiliaria_id,p_limit)$$;
revoke all on function docworks_private.auditoria_super(uuid,integer),public.fn_super_auditoria(uuid,integer) from public,anon;
grant execute on function docworks_private.auditoria_super(uuid,integer),public.fn_super_auditoria(uuid,integer) to authenticated;
