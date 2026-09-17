import type { ReactNode } from 'react';
import { useSistemaConfig } from '../../hooks/useSistemaConfig';
import Mantenimiento from './Mantenimiento';

export function MantenimientoGuard({ children }: { children: ReactNode }) {
  const { mantenimientoActivo } = useSistemaConfig();

  if (mantenimientoActivo) {
    return <Mantenimiento />;
  }

  return <>{children}</>;
}
