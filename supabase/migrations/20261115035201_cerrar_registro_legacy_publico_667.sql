-- v6.67: la inscripción vigente usa Supabase Auth y email verificado.
-- La ruta legacy (tabla + RPC) no participa del alta nueva.
-- Esta misma migración ya se aplicó en Supabase: 20261115035201.
-- La tabla y su historial se conservan; service_role mantiene permisos.
revoke all privileges on table public.solicitudes_registro from anon, authenticated;
revoke all privileges on table public.solicitudes_registro from public;
revoke execute on function public.fn_solicitar_registro_publico(text,text,text,text) from public, anon, authenticated;
