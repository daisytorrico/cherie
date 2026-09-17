import type { Servicio } from '../../../servicios/types';
import placeholderImg from '../../../../assets/placeholder.png';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { formatDuration } from '../../../../utils/formatDuration';
import { Clock } from 'lucide-react';

interface Props {
  servicio: Servicio;
  cantidad: number;
  onQuitar: (id: string) => void;
  onAgregar: (servicio: Servicio) => void;
}

export function ItemCarrito({
  servicio,
  cantidad,
  onQuitar,
  onAgregar,
}: Props) {
  // Si el servicio no tiene duración definida en Firestore, asigna 30 min por defecto
  const duracionBase =
    servicio.duracion && servicio.duracion > 0 ? servicio.duracion : 30;
  const duracionSubtotal = duracionBase * cantidad;

  return (
    <div className="shadow-item flex items-center gap-3 sm:gap-4 rounded-3xl border border-(--card-border) bg-surface-lowest p-3 sm:p-4 min-h-[96px] transition-shadow hover:shadow-[0_6px_18px_-6px_rgba(58,30,41,0.18)]">
      <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-(--gold-accent)/40">
        <img
          src={servicio.imagenUrl || placeholderImg}
          alt={servicio.nombre}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-center min-w-0">
        <span className="font-serif text-sm sm:text-base font-semibold text-secondary leading-snug line-clamp-2">
          {servicio.nombre}
        </span>

        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs sm:text-sm font-medium text-(--on-surface-variant)">
          {servicio.precio ? (
            <span className="text-primary font-semibold">
              ${formatCurrency(servicio.precio * cantidad)}
            </span>
          ) : null}

          {/* Duración individual multiplicada por la cantidad */}
          <span className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-secondary bg-surface-low/80 px-2.5 py-1 rounded-md">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {formatDuration(duracionSubtotal)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-stretch overflow-hidden rounded-full border-2 border-(--card-border) bg-surface-lowest">
        <button
          type="button"
          onClick={() => onQuitar(servicio.id)}
          aria-label={`Quitar una unidad de ${servicio.nombre}`}
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-base sm:text-lg font-semibold text-secondary transition-colors hover:bg-surface-low cursor-pointer"
        >
          -
        </button>
        <span className="flex w-8 sm:w-10 items-center justify-center border-x-2 border-(--card-border) bg-surface-low/50 font-serif text-xs sm:text-sm font-bold text-secondary">
          {cantidad}
        </span>
        <button
          type="button"
          onClick={() => onAgregar(servicio)}
          aria-label={`Agregar una unidad más de ${servicio.nombre}`}
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-base sm:text-lg font-semibold text-secondary transition-colors hover:bg-surface-low cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
