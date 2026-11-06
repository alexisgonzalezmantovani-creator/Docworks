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
