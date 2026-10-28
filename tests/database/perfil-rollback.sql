-- Prueba de las RPC existentes con identidades activas y claims de prueba.
-- No inicia sesiones Auth. Todas las escrituras se revierten en un subbloque.
-- Ejecutar con el rol de mantenimiento autorizado; no requiere migraciones.
DO $qa$
DECLARE
 r record;
 respuesta jsonb;
 datos_prueba jsonb;
 resultados jsonb := '[]'::jsonb;
 config_antes text;
 usuarios_antes text;
 rechazado boolean;
BEGIN
 PERFORM set_config('statement_timeout','15000',true);
 SELECT md5(coalesce(jsonb_agg(to_jsonb(c) ORDER BY inmobiliaria_id)::text,'')) INTO config_antes FROM public.configuracion_inmobiliaria c;
 SELECT md5(coalesce(jsonb_agg(to_jsonb(u) ORDER BY id)::text,'')) INTO usuarios_antes FROM public.usuarios u;
 BEGIN
  FOR r IN SELECT u.id,u.inmobiliaria_id,u.rol_base::text AS rol,c.datos FROM public.usuarios u LEFT JOIN public.configuracion_inmobiliaria c ON c.inmobiliaria_id=u.inmobiliaria_id WHERE u.activo AND u.inmobiliaria_id IS NOT NULL ORDER BY u.id LOOP
   PERFORM set_config('request.jwt.claim.sub',r.id::text,true);
   PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',r.id,'role','authenticated')::text,true);
   EXECUTE 'SET LOCAL ROLE authenticated';
   respuesta := public.fn_perfil_inmobiliaria_obtener();
   IF respuesta->>'rol' IS DISTINCT FROM r.rol THEN RAISE EXCEPTION 'Rol de lectura incorrecto'; END IF;
   IF EXISTS(SELECT 1 FROM public.configuracion_inmobiliaria WHERE inmobiliaria_id<>r.inmobiliaria_id) THEN RAISE EXCEPTION 'RLS permite leer otra inmobiliaria'; END IF;
   resultados:=resultados||jsonb_build_array(jsonb_build_object('rol',r.rol,'lectura_y_aislamiento',true));
   datos_prueba:=jsonb_set(coalesce(r.datos,'{}'::jsonb)-'nombre_usuario','{__docworks_qa_rollback}','"marca temporal"'::jsonb)||jsonb_build_object('rol','viewer');
   IF r.rol IN ('dueno','admin') THEN
    respuesta:=public.fn_perfil_inmobiliaria_guardar(datos_prueba);
    IF respuesta->>'rol' IS DISTINCT FROM r.rol THEN RAISE EXCEPTION 'Rol falsificado aceptado'; END IF;
    respuesta:=public.fn_perfil_inmobiliaria_obtener();
    IF respuesta->>'__docworks_qa_rollback' IS DISTINCT FROM 'marca temporal' THEN RAISE EXCEPTION 'Guardado y relectura fallaron'; END IF;
    resultados:=resultados||jsonb_build_array(jsonb_build_object('rol',r.rol,'guardar_releer_y_rol_servidor',true));
   ELSE
    rechazado:=false;
    BEGIN
     PERFORM public.fn_perfil_inmobiliaria_guardar(datos_prueba);
    EXCEPTION WHEN OTHERS THEN
     IF SQLERRM LIKE 'Solo Dueño o Administrador%' THEN rechazado:=true; ELSE RAISE; END IF;
    END;
    IF NOT rechazado THEN RAISE EXCEPTION 'Usuario sin permiso pudo guardar'; END IF;
    resultados:=resultados||jsonb_build_array(jsonb_build_object('rol',r.rol,'guardado_rechazado',true));
   END IF;
   EXECUTE 'RESET ROLE';
  END LOOP;
  RAISE EXCEPTION USING ERRCODE='ZX001',MESSAGE='Reversión deliberada de escrituras QA';
 EXCEPTION WHEN SQLSTATE 'ZX001' THEN NULL;
 END;
 IF config_antes IS DISTINCT FROM (SELECT md5(coalesce(jsonb_agg(to_jsonb(c) ORDER BY inmobiliaria_id)::text,'')) FROM public.configuracion_inmobiliaria c) THEN RAISE EXCEPTION 'La configuración cambió fuera del rollback'; END IF;
 IF usuarios_antes IS DISTINCT FROM (SELECT md5(coalesce(jsonb_agg(to_jsonb(u) ORDER BY id)::text,'')) FROM public.usuarios u) THEN RAISE EXCEPTION 'Los usuarios cambiaron fuera del rollback'; END IF;
 resultados:=resultados||jsonb_build_array(jsonb_build_object('rollback_configuracion_y_usuarios',true));
 PERFORM set_config('docworks.qa_resultados',resultados::text,true);
END
$qa$;
SELECT current_setting('docworks.qa_resultados')::jsonb AS verificaciones;
