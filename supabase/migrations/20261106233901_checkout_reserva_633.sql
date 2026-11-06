-- Sólo el servidor de pagos puede reservar/finalizar un checkout.
create table docworks_private.checkout_intentos (
 membresia_id uuid primary key references public.membresias(id),
 clave uuid not null unique default gen_random_uuid(), referencia text not null unique,
 plan_id uuid not null references public.planes(id), monto numeric not null, moneda text not null,
 correo text not null, previo_id text, finalizado boolean not null default false,
 creado_en timestamptz not null default now()
);
alter table docworks_private.checkout_intentos enable row level security;
revoke all on docworks_private.checkout_intentos from public,anon,authenticated;
grant usage on schema docworks_private to service_role;
create function docworks_private.reservar_checkout(p_membresia_id uuid,p_plan_id uuid,p_monto numeric,p_moneda text,p_correo text,p_previo_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m public.membresias; intento docworks_private.checkout_intentos; nuevo boolean:=false; k uuid:=gen_random_uuid();
begin
 select * into m from public.membresias where id=p_membresia_id for update;
 if not found or m.plan_id<>p_plan_id or m.mercadopago_preapproval_id is distinct from p_previo_id then raise exception 'La membresía cambió. Volvé a sincronizar.';end if;
 select * into intento from docworks_private.checkout_intentos where membresia_id=m.id for update;
 if not found or (intento.finalizado and p_previo_id is not null) then
  insert into docworks_private.checkout_intentos(membresia_id,clave,referencia,plan_id,monto,moneda,correo,previo_id)
  values(m.id,k,'DOCWORKS-'||m.inmobiliaria_id||'-'||k,p_plan_id,p_monto,p_moneda,lower(btrim(p_correo)),p_previo_id)
  on conflict(membresia_id) do update set clave=excluded.clave,referencia=excluded.referencia,plan_id=excluded.plan_id,monto=excluded.monto,moneda=excluded.moneda,correo=excluded.correo,previo_id=excluded.previo_id,finalizado=false,creado_en=now()
  returning * into intento;
  nuevo:=true;
 else
  if intento.plan_id<>p_plan_id or intento.monto<>p_monto or intento.moneda<>p_moneda or intento.correo<>lower(btrim(p_correo)) then raise exception 'Hay un checkout sin resolver con otros datos. Sincronizá antes de cambiarlo.';end if;
 end if;
 return jsonb_build_object('nuevo',nuevo,'clave',intento.clave,'referencia',intento.referencia,'correo',intento.correo,'monto',intento.monto,'moneda',intento.moneda);
end;$$;
create function docworks_private.finalizar_checkout(p_membresia_id uuid,p_clave uuid,p_id text,p_enlace text,p_estado text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m public.membresias; intento docworks_private.checkout_intentos;
begin
 select * into m from public.membresias where id=p_membresia_id for update;
 select * into intento from docworks_private.checkout_intentos where membresia_id=m.id and clave=p_clave for update;
 if not found then raise exception 'Reserva de checkout inexistente';end if;
 if intento.finalizado then
  if m.mercadopago_preapproval_id<>p_id then raise exception 'La suscripción no coincide con la reserva';end if;
  return jsonb_build_object('ok',true);
 end if;
 if m.mercadopago_preapproval_id is distinct from intento.previo_id or m.plan_id<>intento.plan_id then raise exception 'La membresía cambió durante el checkout';end if;
 if p_id is null or p_id !~ '^[A-Za-z0-9_-]{1,180}$' or p_enlace is null or length(p_enlace)>3000 or p_estado not in ('pending','authorized','active','paused','cancelled') then raise exception 'Respuesta de proveedor inválida';end if;
 update public.membresias set mercadopago_preapproval_id=p_id,mercadopago_init_point=p_enlace,mercadopago_status=p_estado,mercadopago_last_sync_at=now(),
 estado=case when p_estado in ('authorized','active') then 'activa'::public.membresia_estado_t else estado end,
 es_prueba=case when p_estado in ('authorized','active') then false else es_prueba end,actualizado_en=now() where id=m.id;
 update docworks_private.checkout_intentos set finalizado=true where membresia_id=m.id;
 return jsonb_build_object('ok',true);
end;$$;
create function public.fn_mp_reservar_checkout(p_membresia_id uuid,p_plan_id uuid,p_monto numeric,p_moneda text,p_correo text,p_previo_id text default null) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.reservar_checkout(p_membresia_id,p_plan_id,p_monto,p_moneda,p_correo,p_previo_id)$$;
create function public.fn_mp_finalizar_checkout(p_membresia_id uuid,p_clave uuid,p_id text,p_enlace text,p_estado text) returns jsonb language sql security invoker set search_path='' as $$select docworks_private.finalizar_checkout(p_membresia_id,p_clave,p_id,p_enlace,p_estado)$$;
revoke all on function public.fn_mp_reservar_checkout(uuid,uuid,numeric,text,text,text),public.fn_mp_finalizar_checkout(uuid,uuid,text,text,text),docworks_private.reservar_checkout(uuid,uuid,numeric,text,text,text),docworks_private.finalizar_checkout(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.fn_mp_reservar_checkout(uuid,uuid,numeric,text,text,text),public.fn_mp_finalizar_checkout(uuid,uuid,text,text,text),docworks_private.reservar_checkout(uuid,uuid,numeric,text,text,text),docworks_private.finalizar_checkout(uuid,uuid,text,text,text) to service_role;
