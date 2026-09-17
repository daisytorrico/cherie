import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';

interface AdminFilterBarProps<T extends string> {
  filtroActual: T;
  onFiltroChange: (filtro: T) => void;
  layoutId: string;
  cantidadActivos?: number;
  cantidadDesactivados: number;
  onVaciarDesactivados: () => void;
  tituloVaciar?: string;
  etiquetaActivos?: string;
  etiquetaDesactivados?: string;
  valorActivos?: T;
  valorDesactivados?: T;
  children?: ReactNode;
}

export function AdminFilterBar<T extends string>({
  filtroActual,
  onFiltroChange,
  layoutId,
  cantidadActivos,
  cantidadDesactivados,
  onVaciarDesactivados,
  tituloVaciar = 'Eliminar permanentemente todos los elementos desactivados',
  etiquetaActivos = 'Activos',
  etiquetaDesactivados = 'Desactivados',
  valorActivos = 'activos' as unknown as T,
  valorDesactivados = 'desactivados' as unknown as T,
  children,
}: AdminFilterBarProps<T>) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-lowest p-2.5 rounded-2xl border border-camel/30 shadow-xs mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <SegmentedControl
          options={[
            {
              value: valorActivos,
              label: etiquetaActivos,
              badge: cantidadActivos,
            },
            {
              value: valorDesactivados,
              label: etiquetaDesactivados,
              badge: cantidadDesactivados,
            },
          ]}
          value={filtroActual}
          onChange={(val) => onFiltroChange(val)}
          layoutId={layoutId}
        />
        {children}
      </div>

      {filtroActual === valorDesactivados && cantidadDesactivados > 0 && (
        <button
          type="button"
          onClick={onVaciarDesactivados}
          className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
          title={tituloVaciar}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Vaciar desactivados ({cantidadDesactivados})</span>
        </button>
      )}
    </div>
  );
}
