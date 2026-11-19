import type { ReactNode } from 'react';

export function EncabezadoVistaPrevia({ titulo, children }: { titulo: ReactNode; children?: ReactNode }) {
  return (
    <div className="pdf-chrome dw-preview-heading">
      <strong className="dw-preview-title">{titulo}</strong>
      {children && <div className="dw-preview-actions">{children}</div>}
    </div>
  );
}
