import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import logoIcon from '../../../../../assets/logo-icon.svg';

interface CarritoHeaderProps {
  cantidadTotal: number;
  onClose: () => void;
}

export function CarritoHeader({ cantidadTotal, onClose }: CarritoHeaderProps) {
  const navigate = useNavigate();

  const handleIrAServicios = () => {
    onClose();
    navigate('/servicios');
  };

  return (
    <div className="relative shrink-0 px-6 pb-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="" aria-hidden="true" className="h-7 w-7" />
          <div>
            <h3 className="font-serif text-xl font-semibold leading-tight text-secondary">
              Tu Reserva
            </h3>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-(--on-surface-variant)">
              {cantidadTotal} servicio{cantidadTotal !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleIrAServicios}
            className="text-xs font-semibold text-secondary hover:underline cursor-pointer transition-colors"
          >
            Ver servicios
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-low cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-(--gold-accent)/25" />
          <div className="h-1.5 w-1.5 rotate-45 border border-(--gold-accent)/60" />
          <div className="h-px flex-1 bg-(--gold-accent)/25" />
        </div>
      </div>
    </div>
  );
}
