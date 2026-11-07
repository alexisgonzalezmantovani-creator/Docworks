-- Infraestructura apagada hasta configurar proveedor, remitente y programador.
create table if not exists docworks_private.correo_config (
 id boolean primary key default true check(id), habilitado boolean not null default false
);
insert into docworks_private.correo_config(id) values(true) on conflict do nothing;
create table if not exists docworks_private.recordatorios (
 id uuid primary key default gen_random_uuid(),
 operacion_id text not null references public.operaciones(id) on delete cascade,
 inmobiliaria_id uuid not null references public.inmobiliarias(id) on delete cascade,
 destinatario uuid not null references public.usuarios(id) on delete cascade,
 creado_por uuid not null, firma timestamptz not null,
 anticipacion integer not null check(anticipacion in (0,60,1440)),
 enviar_en timestamptz not null,
 estado text not null default 'pendiente' check(estado in ('pendiente','enviando','aceptado','cancelado','error','verificar')),
 broker_original text, creado_en timestamptz not null default now(),
 tomado_en timestamptz, proveedor_id text, codigo_error text
);
create unique index if not exists recordatorios_evento on docworks_private.recordatorios(operacion_id,destinatario,firma,anticipacion) where estado not in ('cancelado','error');
create index if not exists recordatorios_pendientes on docworks_private.recordatorios(enviar_en) where estado='pendiente';
alter table docworks_private.correo_config enable row level security;
alter table docworks_private.recordatorios enable row level security;
revoke all on docworks_private.correo_config,docworks_private.recordatorios from public,anon,authenticated;

create or replace function docworks_private.recordatorio_operacion(p_id text,p_escritura boolean) returns public.operaciones
language plpgsql security definer set search_path='' as $$
declare o public.operaciones; u public.usuarios;
begin
 select * into u from public.usuarios where id=auth.uid() and activo;
 select * into o from public.operaciones where id=p_id and eliminado_en is null;
 if u.id is null or o.id is null or not docworks_private.puede_leer_operacion(o.inmobiliaria_id,o.datos,o.creado_por)
   or (p_escritura and (u.rol_base::text not in ('dueno','admin','broker','vendedor') or o.estado<>'activo')) then
  raise exception 'Operación no disponible para esta acción' using errcode='42501';
 end if;
 return o;
end;$$;

create or replace function docworks_private.recordatorios_contexto(p_operacion_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.operaciones; u public.usuarios; es_admin boolean; destinatarios jsonb; items jsonb;
begin
 o:=docworks_private.recordatorio_operacion(p_operacion_id,false);
 select * into u from public.usuarios where id=auth.uid();es_admin:=u.rol_base::text in ('dueno','admin');
 select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'nombre',d.nombre) order by d.nombre),'[]'::jsonb) into destinatarios
 from public.usuarios d where d.activo and d.inmobiliaria_id=o.inmobiliaria_id
 and d.rol_base::text in ('dueno','admin','broker','vendedor')
 and (d.rol_base::text in ('dueno','admin') or d.id::text=coalesce(nullif(o.datos->>'broker_id',''),o.creado_por::text))
 and (es_admin or d.id=u.id);
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'firma',r.firma,'anticipacion',r.anticipacion,'estado',r.estado,'destinatario_nombre',d.nombre) order by r.firma desc),'[]'::jsonb) into items
 from docworks_private.recordatorios r join public.usuarios d on d.id=r.destinatario
 where r.operacion_id=o.id and (es_admin or r.destinatario=u.id);
 return jsonb_build_object('habilitado',(select habilitado from docworks_private.correo_config where id),
 'puede_programar',u.rol_base::text in ('dueno','admin','broker','vendedor') and o.estado='activo',
 'destinatarios',destinatarios,'recordatorios',items);
end;$$;

create or replace function docworks_private.recordatorio_guardar(p_operacion_id text,p_destinatario uuid,p_firma timestamptz,p_anticipacion integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.operaciones; u public.usuarios; d public.usuarios; resultado uuid; enviar timestamptz;
begin
 o:=docworks_private.recordatorio_operacion(p_operacion_id,true);
 perform 1 from public.operaciones where id=o.id for update;
 o:=docworks_private.recordatorio_operacion(p_operacion_id,true);
 if not coalesce((select habilitado from docworks_private.correo_config where id),false) then raise exception 'Los avisos por correo todavía no están habilitados';end if;
 select * into u from public.usuarios where id=auth.uid();
 select * into d from public.usuarios where id=p_destinatario and activo and inmobiliaria_id=o.inmobiliaria_id;
 if d.id is null or d.rol_base::text not in ('dueno','admin','broker','vendedor')
 or (u.rol_base::text not in ('dueno','admin') and d.id<>u.id)
 or (d.rol_base::text not in ('dueno','admin') and d.id::text<>coalesce(nullif(o.datos->>'broker_id',''),o.creado_por::text)) then
  raise exception 'Destinatario no permitido' using errcode='42501';
 end if;
 if p_anticipacion is null or p_anticipacion not in (0,60,1440) or p_firma is null or not isfinite(p_firma) or p_firma>now()+interval '2 years' then raise exception 'Fecha o anticipación no válidas';end if;
 enviar:=p_firma-make_interval(mins=>p_anticipacion);
 if enviar<=now() then raise exception 'El aviso debe programarse en el futuro';end if;
 if (select count(*) from docworks_private.recordatorios where operacion_id=o.id and estado in ('pendiente','enviando','verificar'))>=20
 and not exists(select 1 from docworks_private.recordatorios where operacion_id=o.id and destinatario=d.id and firma=p_firma and anticipacion=p_anticipacion and estado not in ('cancelado','error')) then
  raise exception 'La operación ya tiene veinte avisos pendientes';
 end if;
 insert into docworks_private.recordatorios(operacion_id,inmobiliaria_id,destinatario,creado_por,firma,anticipacion,enviar_en,broker_original)
 values(o.id,o.inmobiliaria_id,d.id,u.id,p_firma,p_anticipacion,enviar,nullif(o.datos->>'broker_id',''))
 on conflict(operacion_id,destinatario,firma,anticipacion) where estado not in ('cancelado','error') do nothing returning id into resultado;
 if resultado is null then select id into resultado from docworks_private.recordatorios where operacion_id=o.id and destinatario=d.id and firma=p_firma and anticipacion=p_anticipacion and estado not in ('cancelado','error');end if;
 return jsonb_build_object('id',resultado);
end;$$;

create or replace function docworks_private.recordatorio_cancelar(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r docworks_private.recordatorios; u public.usuarios;
begin
 select * into r from docworks_private.recordatorios where id=p_id for update;
 if r.id is null then raise exception 'Aviso no disponible' using errcode='42501';end if;
 perform docworks_private.recordatorio_operacion(r.operacion_id,false);
 select * into u from public.usuarios where id=auth.uid();
 if u.rol_base::text not in ('dueno','admin') and r.destinatario<>u.id then raise exception 'Aviso no disponible' using errcode='42501';end if;
 if r.estado='cancelado' then return jsonb_build_object('ok',true);end if;
 if r.estado not in ('pendiente','error') then raise exception 'El aviso ya se está procesando o fue enviado';end if;
 update docworks_private.recordatorios set estado='cancelado' where id=r.id;
 return jsonb_build_object('ok',true);
end;$$;

-- Sólo el servicio puede tomar envíos. SKIP LOCKED evita dos trabajadores.
create or replace function public.fn_recordatorios_tomar() returns jsonb
language plpgsql security definer set search_path='' as $$
declare items jsonb;
begin
 if not coalesce((select habilitado from docworks_private.correo_config where id),false) then return '[]'::jsonb;end if;
 -- No reenviar una respuesta ambigua: requiere reconciliación del proveedor.
 update docworks_private.recordatorios set estado='verificar',codigo_error='resultado_desconocido'
 where estado='enviando' and tomado_en<now()-interval '10 minutes';
 update docworks_private.recordatorios r set estado='cancelado',codigo_error='operacion_o_destinatario_no_vigente'
 from public.operaciones o,public.usuarios d
 where r.estado='pendiente' and o.id=r.operacion_id and d.id=r.destinatario
 and (o.eliminado_en is not null or o.estado<>'activo' or not d.activo or d.inmobiliaria_id<>r.inmobiliaria_id
 or d.rol_base::text not in ('dueno','admin','broker','vendedor')
 or nullif(o.datos->>'broker_id','') is distinct from r.broker_original
 or r.firma<now()-interval '1 hour'
 or (d.rol_base::text not in ('dueno','admin') and d.id::text<>coalesce(nullif(o.datos->>'broker_id',''),o.creado_por::text)));
 with lote as (select id from docworks_private.recordatorios where estado='pendiente' and enviar_en<=now() order by enviar_en limit 1 for update skip locked),
 tomados as (update docworks_private.recordatorios r set estado='enviando',tomado_en=now() from lote where lote.id=r.id returning r.*)
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'firma',r.firma,'email',a.email)),'[]'::jsonb) into items
 from tomados r join auth.users a on a.id=r.destinatario and a.email_confirmed_at is not null;
 -- Sin correo confirmado no se anuncia un envío ni se deja trabajo pendiente.
 update docworks_private.recordatorios r set estado='error',codigo_error='correo_no_confirmado'
 where estado='enviando' and not exists(select 1 from auth.users a where a.id=r.destinatario and a.email_confirmed_at is not null);
 return items;
end;$$;

create or replace function public.fn_recordatorio_resultado(p_id uuid,p_estado text,p_proveedor_id text default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_estado not in ('aceptado','error','verificar') then raise exception 'Estado no válido';end if;
 if p_estado='aceptado' and nullif(btrim(p_proveedor_id),'') is null then raise exception 'Falta referencia del servicio';end if;
 update docworks_private.recordatorios set estado=p_estado,proveedor_id=left(p_proveedor_id,200),codigo_error=case when p_estado='aceptado' then null else 'proveedor_no_confirmado' end
 where id=p_id and estado='enviando';
 if not found then raise exception 'Aviso no disponible para confirmar';end if;
end;$$;

create or replace function public.fn_recordatorios_contexto(p_operacion_id text) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.recordatorios_contexto(p_operacion_id)$$;
create or replace function public.fn_recordatorio_guardar(p_operacion_id text,p_destinatario uuid,p_firma timestamptz,p_anticipacion integer) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.recordatorio_guardar(p_operacion_id,p_destinatario,p_firma,p_anticipacion)$$;
create or replace function public.fn_recordatorio_cancelar(p_id uuid) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.recordatorio_cancelar(p_id)$$;
revoke all on function docworks_private.recordatorio_operacion(text,boolean) from public,anon,authenticated;
revoke all on function docworks_private.recordatorios_contexto(text),docworks_private.recordatorio_guardar(text,uuid,timestamptz,integer),docworks_private.recordatorio_cancelar(uuid) from public,anon;
grant execute on function docworks_private.recordatorios_contexto(text),docworks_private.recordatorio_guardar(text,uuid,timestamptz,integer),docworks_private.recordatorio_cancelar(uuid) to authenticated;
revoke all on function public.fn_recordatorios_contexto(text),public.fn_recordatorio_guardar(text,uuid,timestamptz,integer),public.fn_recordatorio_cancelar(uuid) from public,anon;
grant execute on function public.fn_recordatorios_contexto(text),public.fn_recordatorio_guardar(text,uuid,timestamptz,integer),public.fn_recordatorio_cancelar(uuid) to authenticated;
revoke all on function public.fn_recordatorios_tomar(),public.fn_recordatorio_resultado(uuid,text,text) from public,anon,authenticated;
grant execute on function public.fn_recordatorios_tomar(),public.fn_recordatorio_resultado(uuid,text,text) to service_role;
