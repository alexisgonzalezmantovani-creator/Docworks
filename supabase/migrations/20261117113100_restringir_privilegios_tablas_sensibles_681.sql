-- Seguridad de permisos API: RLS no restringe TRUNCATE.
-- Las cuentas anon y authenticated no necesitan privilegios DDL sobre
-- tablas administrativas, de facturación ni de personalización.
revoke truncate, trigger, references
on table public.clausulas_personales,
         public.configuracion_inmobiliaria,
         public.membresias,
         public.pagos,
         public.planes,
         public.super_admins
from anon, authenticated;
