-- DocWorks 6.58: mantener funciones heredadas pero reducir RPC accesibles.
-- La biblioteca personal anterior ya no forma parte del cliente actual.
REVOKE EXECUTE ON FUNCTION public.fn_clausula_personal_resolver(uuid,text,text)
  FROM PUBLIC, anon, authenticated;
-- Helper de tipos: devuelve una constante, no requiere privilegios elevados.
ALTER FUNCTION public.fn_tipos_documento_validos() SECURITY INVOKER;
