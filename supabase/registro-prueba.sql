-- Alta automática: conservar cuentas existentes e invitaciones.
create schema if not exists docworks_private;
revoke all on schema docworks_private from public, anon, authenticated;
alter table public.membresias add column if not exists es_prueba boolean not null default false;

create or replace function docworks_private.provisionar_prueba(p_user_id uuid)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare u auth.users; v_id uuid; v_plan uuid; v_nombre text; v_inmobiliaria text;
begin
  select * into u from auth.users where id=p_user_id for update;
  if u.id is null or u.email_confirmed_at is null then return null; end if;
  select inmobiliaria_id into v_id from public.usuarios where id=u.id;
  if found then return v_id; end if;
  if public.fn_es_super_admin(u.id) then return null; end if;
  -- Las invitaciones conservan su inmobiliaria y rol, aunque el alta venga de la landing.
  perform public.fn_provisionar_usuario_por_email(u.email);
  select inmobiliaria_id into v_id from public.usuarios where id=u.id;
  if found then return v_id; end if;
  if u.raw_user_meta_data->>'docworks_registro' is distinct from 'trial_14_v1'
     or u.raw_user_meta_data->>'consentimiento_prueba' is distinct from 'true' then return null; end if;
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
  values(v_id,v_plan,'activa',u.email_confirmed_at,u.email_confirmed_at+interval '14 days',u.email_confirmed_at+interval '14 days',true);
  insert into public.auditoria(inmobiliaria_id,usuario_id,entidad_tipo,entidad_id,accion,valor_nuevo,origen)
  values(v_id,u.id,'inmobiliaria',v_id,'crear',jsonb_build_object('nombre',v_inmobiliaria,'prueba_dias',14,'consentimiento','trial_14_v1'),'directa');
  return v_id;
end; $$;
revoke all on function docworks_private.provisionar_prueba(uuid) from public,anon,authenticated;

create or replace function docworks_private.confirmar_prueba()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if new.email_confirmed_at is not null and new.raw_user_meta_data->>'docworks_registro'='trial_14_v1' then
    perform docworks_private.provisionar_prueba(new.id);
  end if;
  return new;
end; $$;
revoke all on function docworks_private.confirmar_prueba() from public,anon,authenticated;
create trigger dw_confirmar_prueba after update of email_confirmed_at on auth.users
for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
execute function docworks_private.confirmar_prueba();
-- También cubre Auth con autoconfirmación; el servidor sigue siendo dueño del plazo/rol.
create trigger dw_insertar_prueba after insert on auth.users
for each row when (new.email_confirmed_at is not null)
execute function docworks_private.confirmar_prueba();

create or replace function public.fn_registrar_inmobiliaria(p_nombre_inmobiliaria text,p_nombre_usuario text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Iniciá sesión para continuar'; end if;
  -- No se aceptan roles, fechas ni plazos del cliente. La metadata solo aporta nombres/consentimiento.
  v_id=docworks_private.provisionar_prueba(auth.uid());
  if v_id is null then raise exception 'Verificá tu email y completá el registro de prueba'; end if;
  return v_id;
end; $$;
revoke all on function public.fn_registrar_inmobiliaria(text,text) from public,anon;
grant execute on function public.fn_registrar_inmobiliaria(text,text) to authenticated;

-- Reparación idempotente tras entrar: primero invitaciones, luego prueba pública.
create or replace function public.fn_autoprovisionar_usuario_actual()
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_email text; v_id uuid;
begin
  if auth.uid() is null then return null; end if;
  select lower(trim(email)) into v_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
  if v_email is null then return null; end if;
  v_id=public.fn_provisionar_usuario_por_email(v_email);
  if v_id is null then
    perform docworks_private.provisionar_prueba(auth.uid());
    select id into v_id from public.usuarios where id=auth.uid();
  end if;
  return v_id;
end; $$;
revoke all on function public.fn_autoprovisionar_usuario_actual() from public,anon;
grant execute on function public.fn_autoprovisionar_usuario_actual() to authenticated;

-- No permitir que un cliente amplíe su prueba modificando directamente la membresía.
create or replace function docworks_private.proteger_prueba()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if old.es_prueba and auth.uid() is not null and not public.fn_es_super_admin(auth.uid()) then
    raise exception 'Solo DocWorks puede modificar la membresía de prueba';
  end if;
  return new;
end; $$;
revoke all on function docworks_private.proteger_prueba() from public,anon,authenticated;
create trigger dw_proteger_prueba before update on public.membresias for each row execute function docworks_private.proteger_prueba();

-- El vencimiento se controla también en el servidor, sin borrar información.
create or replace function docworks_private.validar_escritura_prueba()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare v_id uuid;
begin
  if auth.uid() is not null and not public.fn_es_super_admin(auth.uid()) then
    select inmobiliaria_id into v_id from public.usuarios where id=auth.uid();
    if exists(select 1 from public.membresias where inmobiliaria_id=v_id and es_prueba and
      (estado not in ('activa','pendiente') or fecha_vencimiento is null or fecha_vencimiento<=statement_timestamp())) then
      raise exception 'Tu prueba terminó. Elegí un plan para seguir trabajando.';
    end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end; $$;
revoke all on function docworks_private.validar_escritura_prueba() from public,anon,authenticated;
do $$ declare t text; begin
  foreach t in array array['operaciones','configuracion_inmobiliaria','clausulas','plantillas','bloques','invitaciones','documento_versiones','clausulas_personales'] loop
    execute format('create trigger dw_validar_prueba before insert or update or delete on public.%I for each row execute function docworks_private.validar_escritura_prueba()',t);
  end loop;
end; $$;

-- Mantener el contrato JSON del contexto y agregar solo la señal de prueba.
do $$ declare d text; begin
 select pg_get_functiondef('public.fn_mi_contexto()'::regprocedure) into d;
 d=replace(d,'''estado'', m.estado,', '''estado'', case when m.es_prueba and m.fecha_vencimiento<=now() and m.estado in (''activa'',''pendiente'') then ''vencida'' else m.estado::text end, ''es_prueba'', m.es_prueba,');
 d=replace(d,'m.estado = ''activa'' or m.estado = ''pendiente''','(m.estado = ''activa'' or m.estado = ''pendiente'') and (not m.es_prueba or m.fecha_vencimiento > now())');
 execute d;
end; $$;
