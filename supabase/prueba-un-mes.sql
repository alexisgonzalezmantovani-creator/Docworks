-- Un mes calendario. Aceptar también registros anteriores aún sin confirmar.
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
  if coalesce(u.raw_user_meta_data->>'docworks_registro','') not in ('trial_14_v1','trial_month_v1')
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
  values(v_id,v_plan,'activa',u.email_confirmed_at,u.email_confirmed_at+interval '1 month',u.email_confirmed_at+interval '1 month',true);
  insert into public.auditoria(inmobiliaria_id,usuario_id,entidad_tipo,entidad_id,accion,valor_nuevo,origen)
  values(v_id,u.id,'inmobiliaria',v_id,'crear',jsonb_build_object('nombre',v_inmobiliaria,'prueba_meses',1,'consentimiento',u.raw_user_meta_data->>'docworks_registro'),'directa');
  return v_id;
end; $$;
revoke all on function docworks_private.provisionar_prueba(uuid) from public,anon,authenticated;

create or replace function docworks_private.confirmar_prueba()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if new.email_confirmed_at is not null and new.raw_user_meta_data->>'docworks_registro' in ('trial_14_v1','trial_month_v1') then
    perform docworks_private.provisionar_prueba(new.id);
  end if;
  return new;
end; $$;
revoke all on function docworks_private.confirmar_prueba() from public,anon,authenticated;
