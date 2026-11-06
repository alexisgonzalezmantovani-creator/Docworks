-- Preparado para publicación. Sólo agregados de actividad: nunca datos del documento ni contactos.
create or replace function public.fn_super_metricas_uso()
returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare resultado jsonb;
begin
 if auth.uid() is null or not public.fn_es_super_admin(auth.uid()) then raise exception 'Acceso restringido a superadministración' using errcode='42501'; end if;
 with limites as (
  select now() as hasta,now()-interval '30 days' as desde,
   date_trunc('month',now() at time zone 'America/Argentina/Buenos_Aires') at time zone 'America/Argentina/Buenos_Aires' as mes
 ), organizaciones as (
  -- IDs reservados para pruebas de integración; no representan clientes.
  select id,nombre from public.inmobiliarias where id not in ('00000000-0000-0000-0000-0000000000a1'::uuid,'00000000-0000-0000-0000-0000000000b1'::uuid)
 ), ops as (
  select o.id,o.inmobiliaria_id,o.tipo,o.estado,o.creado_en,o.actualizado_en,o.creado_por,o.actualizado_por
  from public.operaciones o join organizaciones i on i.id=o.inmobiliaria_id
  where o.eliminado_en is null and o.creado_en<=(select hasta from limites)
 ), tipos as (
  select inmobiliaria_id,tipo,count(*) as cantidad from ops where creado_en>=(select desde from limites) group by inmobiliaria_id,tipo
 ), por_org as (
  select i.id,i.nombre,count(o.id) as operaciones_total,
   count(o.id) filter(where o.creado_en>=(select mes from limites)) as operaciones_mes,
   count(o.id) filter(where o.creado_en>=(select desde from limites)) as operaciones_30_dias,
   count(o.id) filter(where o.estado='borrador') as borradores,
   count(o.id) filter(where o.estado='cerrado') as cerradas,
   max(greatest(o.creado_en,o.actualizado_en)) as ultima_actividad,
   (select count(*) from public.usuarios u where u.inmobiliaria_id=i.id and u.activo) as usuarios_habilitados,
   coalesce((select jsonb_object_agg(t.tipo,t.cantidad) from tipos t where t.inmobiliaria_id=i.id),'{}'::jsonb) as documentos_30_dias
  from organizaciones i left join ops o on o.inmobiliaria_id=i.id group by i.id,i.nombre
 ), ingresos as (
  select coalesce(nullif(p.moneda,''),'Sin moneda') as moneda,sum(p.monto) as importe
  from public.pagos p join public.membresias m on m.id=p.membresia_id join organizaciones i on i.id=m.inmobiliaria_id
  where p.estado='pagado' and p.fecha_pago>=(select mes from limites) and p.fecha_pago<=(select hasta from limites)
  group by coalesce(nullif(p.moneda,''),'Sin moneda')
 )
 select jsonb_build_object(
  'emitido_en',now(),'periodo_desde',(select desde from limites),'mes_desde',(select mes from limites),
  'operaciones_mes',coalesce(sum(operaciones_mes),0),
  'usuarios_activos',coalesce(sum(usuarios_habilitados),0),
  'inmobiliarias_inactivas_30_dias',count(*) filter(where ultima_actividad is null or ultima_actividad<(select desde from limites)),
  'ingresos_mes_por_moneda',coalesce((select jsonb_object_agg(moneda,importe) from ingresos),'{}'::jsonb),
  'por_inmobiliaria',coalesce(jsonb_agg(to_jsonb(p) order by operaciones_30_dias desc,nombre),'[]'::jsonb),
  'alcance','Operaciones sin papelera; actividad por creación/edición. No mide visitas, descargas ni IA.'
 ) into resultado from por_org p;
 return resultado;
end;$$;
revoke all on function public.fn_super_metricas_uso() from public,anon;
grant execute on function public.fn_super_metricas_uso() to authenticated;
