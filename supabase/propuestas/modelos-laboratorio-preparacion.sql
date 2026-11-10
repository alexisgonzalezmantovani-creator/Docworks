-- PROPUESTA NO APLICADA — DocWorks / creador de modelos experimental.
-- Guardado separado de plantillas, bloques y operaciones reales.
-- Revisar permisos y probar contra base de QA ANTES de ejecutar en producción.
begin;

create table if not exists public.dw_modelos_laboratorio (
  inmobiliaria_id uuid not null references public.inmobiliarias(id) on delete cascade,
  tipo_documento text not null check (tipo_documento in ('reserva','boleto','reserva_alquiler','alquiler','comodato','exclusividad','refuerzo_reserva','devolucion_reserva')),
  estado jsonb not null default '{"schema":1,"borrador":null,"versiones":[],"publicada":null}'::jsonb,
  revision bigint not null default 0,
  actualizado_por uuid,
  actualizado_en timestamptz not null default now(),
  primary key (inmobiliaria_id,tipo_documento),
  constraint dw_laboratorio_estado_objeto check(jsonb_typeof(estado)='object'),
  constraint dw_laboratorio_estado_tamano check (octet_length(estado::text) <= 250000)
);

create table if not exists public.dw_modelos_laboratorio_publicados (
  inmobiliaria_id uuid not null references public.inmobiliarias(id) on delete cascade,
  tipo_documento text not null check (tipo_documento in ('reserva','boleto','reserva_alquiler','alquiler','comodato','exclusividad','refuerzo_reserva','devolucion_reserva')),
  version integer not null check (version >= 1),
  snapshot jsonb not null check (jsonb_typeof(snapshot)='object' and octet_length(snapshot::text) <= 100000),
  publicado_por uuid not null,
  publicado_en timestamptz not null default now(),
  primary key (inmobiliaria_id,tipo_documento),
  foreign key (inmobiliaria_id,tipo_documento) references public.dw_modelos_laboratorio(inmobiliaria_id,tipo_documento) on delete cascade
);

alter table public.dw_modelos_laboratorio enable row level security;
alter table public.dw_modelos_laboratorio_publicados enable row level security;
revoke all on public.dw_modelos_laboratorio from public, anon;
revoke all on public.dw_modelos_laboratorio_publicados from public, anon;
grant select,insert,update on public.dw_modelos_laboratorio to authenticated;
grant select,insert,update on public.dw_modelos_laboratorio_publicados to authenticated;

-- Solo dueños y administradores activos ven borradores y versiones.
create policy dw_modelo_lab_admin_lectura on public.dw_modelos_laboratorio
  for select to authenticated
  using (inmobiliaria_id = (select public.fn_mi_inmobiliaria())
    and exists (select 1 from public.usuarios u where u.id=(select auth.uid())
      and u.inmobiliaria_id=(select public.fn_mi_inmobiliaria()) and u.activo and u.rol_base in ('dueno','admin')));
create policy dw_modelo_lab_admin_alta on public.dw_modelos_laboratorio
  for insert to authenticated
  with check (inmobiliaria_id = (select public.fn_mi_inmobiliaria())
    and exists (select 1 from public.usuarios u where u.id=(select auth.uid())
      and u.inmobiliaria_id=(select public.fn_mi_inmobiliaria()) and u.activo and u.rol_base in ('dueno','admin')));
create policy dw_modelo_lab_admin_edicion on public.dw_modelos_laboratorio
  for update to authenticated
  using (inmobiliaria_id = (select public.fn_mi_inmobiliaria())
    and exists (select 1 from public.usuarios u where u.id=(select auth.uid())
      and u.inmobiliaria_id=(select public.fn_mi_inmobiliaria()) and u.activo and u.rol_base in ('dueno','admin')))
  with check (inmobiliaria_id = (select public.fn_mi_inmobiliaria())
    and exists (select 1 from public.usuarios u where u.id=(select auth.uid())
      and u.inmobiliaria_id=(select public.fn_mi_inmobiliaria()) and u.activo and u.rol_base in ('dueno','admin')));

-- Asesores activos ven exclusivamente la publicación, nunca el borrador.
create policy dw_modelo_lab_publicado_lectura on public.dw_modelos_laboratorio_publicados
  for select to authenticated
  using (inmobiliaria_id=(select public.fn_mi_inmobiliaria())
    and exists (select 1 from public.usuarios u where u.id=(select auth.uid()) and u.inmobiliaria_id=(select public.fn_mi_inmobiliaria()) and u.activo));
create policy dw_modelo_lab_publicado_alta on public.dw_modelos_laboratorio_publicados
  for insert to authenticated
  with check (inmobiliaria_id=(select public.fn_mi_inmobiliaria()) and publicado_por=(select auth.uid())
    and exists (select 1 from public.usuarios u where u.id=(select auth.uid())
      and u.inmobiliaria_id=(select public.fn_mi_inmobiliaria()) and u.activo and u.rol_base in ('dueno','admin')));
create policy dw_modelo_lab_publicado_edicion on public.dw_modelos_laboratorio_publicados
  for update to authenticated
  using (inmobiliaria_id=(select public.fn_mi_inmobiliaria())
    and exists (select 1 from public.usuarios u where u.id=(select auth.uid())
      and u.inmobiliaria_id=(select public.fn_mi_inmobiliaria()) and u.activo and u.rol_base in ('dueno','admin')))
  with check (inmobiliaria_id=(select public.fn_mi_inmobiliaria())
    and exists (select 1 from public.usuarios u where u.id=(select auth.uid())
      and u.inmobiliaria_id=(select public.fn_mi_inmobiliaria()) and u.activo and u.rol_base in ('dueno','admin')));

-- Escritura atómica: una revisión CAS y una publicación que jamás expone borradores.
create or replace function public.fn_dw_modelo_lab_guardar(
  p_tipo text, p_estado jsonb, p_expected_revision bigint, p_publicar boolean default false)
returns bigint
language plpgsql security invoker
set search_path = ''
as $$
declare
  v_inmo uuid := public.fn_mi_inmobiliaria();
  v_usuario uuid := auth.uid();
  v_revision bigint;
  v_publicada integer;
  v_snapshot jsonb;
begin
  if v_inmo is null or v_usuario is null
    or not exists(select 1 from public.usuarios u where u.id=v_usuario and u.inmobiliaria_id=v_inmo
      and u.activo and u.rol_base in ('dueno','admin')) then
    raise exception 'Sin permiso para editar modelos' using errcode='42501';
  end if;
  if p_tipo not in ('reserva','boleto','reserva_alquiler','alquiler','comodato','exclusividad','refuerzo_reserva','devolucion_reserva')
    or p_estado is null or jsonb_typeof(p_estado)<>'object'
    or coalesce((p_estado->>'schema')::integer,0)<>1
    or jsonb_typeof(p_estado->'versiones')<>'array'
    or jsonb_array_length(p_estado->'versiones')>25
    or octet_length(p_estado::text)>250000 then
    raise exception 'Modelo inválido' using errcode='22023';
  end if;
  insert into public.dw_modelos_laboratorio(inmobiliaria_id,tipo_documento)
    values(v_inmo,p_tipo) on conflict do nothing;
  select revision into v_revision from public.dw_modelos_laboratorio
    where inmobiliaria_id=v_inmo and tipo_documento=p_tipo for update;
  if v_revision is distinct from coalesce(p_expected_revision,0) then
    raise exception 'El modelo se modificó en otro dispositivo. Recargá antes de guardar.' using errcode='40001';
  end if;
  update public.dw_modelos_laboratorio
    set estado=p_estado, revision=revision+1, actualizado_por=v_usuario, actualizado_en=now()
    where inmobiliaria_id=v_inmo and tipo_documento=p_tipo
    returning revision into v_revision;
  if p_publicar then
    v_publicada=(p_estado->>'publicada')::integer;
    select x->'snapshot' into v_snapshot from jsonb_array_elements(p_estado->'versiones') x
      where (x->>'version')::integer=v_publicada limit 1;
    if v_snapshot is null then raise exception 'La versión publicada no existe' using errcode='22023'; end if;
    insert into public.dw_modelos_laboratorio_publicados
      (inmobiliaria_id,tipo_documento,version,snapshot,publicado_por,publicado_en)
      values(v_inmo,p_tipo,v_publicada,v_snapshot,v_usuario,now())
      on conflict(inmobiliaria_id,tipo_documento) do update
      set version=excluded.version, snapshot=excluded.snapshot,
          publicado_por=excluded.publicado_por, publicado_en=now();
  end if;
  return v_revision;
end;
$$;
revoke all on function public.fn_dw_modelo_lab_guardar(text,jsonb,bigint,boolean) from public,anon;
grant execute on function public.fn_dw_modelo_lab_guardar(text,jsonb,bigint,boolean) to authenticated;

commit;
