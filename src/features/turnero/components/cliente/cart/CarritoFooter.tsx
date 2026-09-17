import { Clock } from 'lucide-react';
import { formatCurrency } from '../../../../../utils/formatCurrency';

interface CarritoFooterProps {
  duracionTotal: number;
  total: number;
  formularioValido: boolean;
  enviando: boolean;
  onEnviarSolicitud: () => Promise<void> | void;
}

function formatearMinutosAHoras(minutosTotales: number): string {
  if (minutosTotales < 60) return `${minutosTotales} min`;
  const horas = Math.floor(minutosTotales / 60);
  const mins = minutosTotales % 60;
  return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
}

export function CarritoFooter({
  duracionTotal,
  total,
  formularioValido,
  enviando,
  onEnviarSolicitud,
}: CarritoFooterProps) {
  return (
    <div
      className="mt-auto shrink-0 border-t border-(--card-border) px-6 py-4 bg-surface-lowest space-y-2"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-between text-xs text-primary/80">
        <span className="font-medium flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-secondary" />
          Duración total de la cita:
        </span>
        <span className="font-bold text-secondary text-xs">
          {formatearMinutosAHoras(duracionTotal)}
        </span>
      </div>

      {total > 0 ? (
        <div className="flex items-center justify-between border-t border-camel/20 pt-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-(--on-surface-variant)">
            Total estimado:
          </span>
          <span className="flex items-baseline gap-1 font-sans text-(--on-surface-variant)">
            <span className="text-xs font-medium">$</span>
            <span className="text-base font-bold">{formatCurrency(total)}</span>
          </span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onEnviarSolicitud}
        disabled={!formularioValido || enviando}
        className="shadow-glow-rose mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-secondary to-primary px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-surface-lowest transition-transform hover:scale-[1.01] disabled:opacity-40 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed"
      >
        {enviando ? 'Enviando...' : 'Solicitar Turno'}
      </button>
    </div>
  );
}
