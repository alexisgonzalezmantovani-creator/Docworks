-- DocWorks 6.59 — optimización conservadora de RLS.
-- Mantener roles y condiciones; materializar auth.uid() una sola vez
-- por consulta con (select auth.uid()) en 5 políticas existentes.
DO $dw$
DECLARE
  r record;
  v_qual text;
  v_check text;
  v_sql text;
  v_count integer := 0;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public' AND (
      (tablename = 'permisos_broker' AND policyname = 'permisos_broker_select')
      OR (tablename = 'clausulas_personales' AND policyname IN
        ('dw_clausulas_personales_select','dw_clausulas_personales_insert','dw_clausulas_personales_update_owner'))
      OR (tablename = 'auditoria' AND policyname = 'auditoria_select')
    )
  LOOP
    IF position('auth.uid()' IN coalesce(r.qual,'') || coalesce(r.with_check,'')) = 0 THEN
      RAISE EXCEPTION 'Política % sin llamada auth.uid() esperada; abortando', r.policyname;
    END IF;
    v_qual := replace(r.qual, 'auth.uid()', '(select auth.uid())');
    v_check := replace(r.with_check, 'auth.uid()', '(select auth.uid())');
    v_sql := format('ALTER POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    IF v_qual IS NOT NULL THEN
      v_sql := v_sql || ' USING (' || v_qual || ')';
    END IF;
    IF v_check IS NOT NULL THEN
      v_sql := v_sql || ' WITH CHECK (' || v_check || ')';
    END IF;
    EXECUTE v_sql;
    v_count := v_count + 1;
  END LOOP;
  IF v_count <> 5 THEN
    RAISE EXCEPTION 'Se encontraron % de 5 políticas previstas; abortando', v_count;
  END IF;
END
$dw$;