-- Evitar que una cuenta cliente cambie el estado, plan o vencimiento
-- de su propia membresía a través de PostgREST.
-- La lectura por inmobiliaria y las funciones privilegiadas de facturación
-- se conservan sin cambios.
revoke update on table public.membresias from anon, authenticated;
drop policy if exists membresias_update_self on public.membresias;
