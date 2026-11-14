-- DocWorks 6.60: índices sobre relaciones usadas por historial, operaciones y auditoría.
-- No se modifican filas, permisos, políticas ni claves existentes.
CREATE INDEX IF NOT EXISTS idx_dw_660_operaciones_creado_por
  ON public.operaciones (creado_por);
CREATE INDEX IF NOT EXISTS idx_dw_660_operaciones_actualizado_por
  ON public.operaciones (actualizado_por);
CREATE INDEX IF NOT EXISTS idx_dw_660_operaciones_eliminado_por
  ON public.operaciones (eliminado_por);
CREATE INDEX IF NOT EXISTS idx_dw_660_auditoria_usuario_id
  ON public.auditoria (usuario_id);
CREATE INDEX IF NOT EXISTS idx_dw_660_documento_versiones_creado_por
  ON public.documento_versiones (creado_por);
CREATE INDEX IF NOT EXISTS idx_dw_660_invitaciones_invitado_por
  ON public.invitaciones (invitado_por);
CREATE INDEX IF NOT EXISTS idx_dw_660_solicitudes_autorizacion_usuario_id
  ON public.solicitudes_autorizacion (usuario_id);