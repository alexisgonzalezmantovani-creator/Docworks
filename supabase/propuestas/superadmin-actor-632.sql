-- Los superadministradores no son usuarios de una inmobiliaria: auditar su ID Auth sin violar la FK de usuarios.
CREATE OR REPLACE FUNCTION public.fn_super_asignar_plan(p_inmobiliaria_id uuid, p_plan_codigo text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_plan_id uuid;
begin
  if not fn_es_super_admin(auth.uid()) then raise exception 'Solo Super Admin'; end if;
  select id into v_plan_id from planes where codigo = p_plan_codigo and activo;
  if v_plan_id is null then raise exception 'Plan inválido: %', p_plan_codigo; end if;
  if exists(select 1 from public.membresias where inmobiliaria_id=p_inmobiliaria_id and mercadopago_status in ('active','authorized','pending','paused') and plan_id<>v_plan_id) then raise exception 'Resolvé la suscripción de Mercado Pago antes de cambiar el plan';end if;
  update membresias set plan_id = v_plan_id, actualizado_en = now() where inmobiliaria_id = p_inmobiliaria_id;
  insert into docworks_private.eventos(actor,inmobiliaria_id,accion,nuevo) values(auth.uid(),p_inmobiliaria_id,'cambiar_plan',jsonb_build_object('plan',p_plan_codigo));
end;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_super_set_estado_membresia(p_inmobiliaria_id uuid, p_estado membresia_estado_t)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if not fn_es_super_admin(auth.uid()) then raise exception 'Solo Super Admin'; end if;
  if p_estado='archivada' then perform docworks_private.archivar(p_inmobiliaria_id,true);return;end if;
 if exists(select 1 from public.membresias where inmobiliaria_id=p_inmobiliaria_id and estado='archivada') then raise exception 'Reactivá la inmobiliaria antes de cambiar su estado';end if;
 update membresias set estado = p_estado, actualizado_en = now() where inmobiliaria_id = p_inmobiliaria_id;
  insert into docworks_private.eventos(actor,inmobiliaria_id,accion,nuevo) values(auth.uid(),p_inmobiliaria_id,'set_estado',jsonb_build_object('estado',p_estado));
end;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_super_set_estado_usuario(p_usuario_id uuid, p_activo boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_inmob uuid;
  v_anterior boolean;
begin
  if not fn_es_super_admin(auth.uid()) then raise exception 'Solo Super Admin'; end if;
  select inmobiliaria_id, activo into v_inmob, v_anterior from usuarios where id = p_usuario_id;
  if v_inmob is null then raise exception 'Usuario no encontrado'; end if;
  if not p_activo and exists(select 1 from usuarios where id=p_usuario_id and rol_base='dueno') then raise exception 'Transferí la titularidad antes de desactivar al dueño';end if;
 update usuarios set activo = p_activo where id = p_usuario_id;
  insert into docworks_private.eventos(actor,inmobiliaria_id,accion,anterior,nuevo) values(auth.uid(),v_inmob,'super_set_estado',jsonb_build_object('usuario_id',p_usuario_id,'activo',v_anterior),jsonb_build_object('usuario_id',p_usuario_id,'activo',p_activo));
end;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_super_set_rol_usuario(p_usuario_id uuid, p_rol rol_base_t)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_inmob uuid;
  v_anterior rol_base_t;
begin
  if not fn_es_super_admin(auth.uid()) then raise exception 'Solo Super Admin'; end if;
  select inmobiliaria_id, rol_base into v_inmob, v_anterior from usuarios where id = p_usuario_id;
  if v_inmob is null then raise exception 'Usuario no encontrado'; end if;
  if p_rol='dueno' then perform docworks_private.transferir(v_inmob,p_usuario_id);return;end if;
 if v_anterior='dueno' then raise exception 'Usá transferir titularidad para cambiar al dueño';end if;
 update usuarios set rol_base = p_rol where id = p_usuario_id;
  insert into docworks_private.eventos(actor,inmobiliaria_id,accion,anterior,nuevo) values(auth.uid(),v_inmob,'super_set_rol',jsonb_build_object('usuario_id',p_usuario_id,'rol',v_anterior),jsonb_build_object('usuario_id',p_usuario_id,'rol',p_rol));
end;
$function$
;
