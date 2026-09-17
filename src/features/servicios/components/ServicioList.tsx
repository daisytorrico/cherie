import { useScrollReveal } from '../../../hooks/useScrollReveal';
import type { Servicio } from '../types';
import { ServicioCard } from './ServicioCard';

interface ServicioItemProps {
  servicio: Servicio;
  index: number;
  onAgregar: (servicio: Servicio) => void;
  onVerDetalle?: (servicio: Servicio) => void;
}

function ServicioItem({
  servicio,
  index,
  onAgregar,
  onVerDetalle,
}: ServicioItemProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${index * 60}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <ServicioCard
        servicio={servicio}
        onAgregar={onAgregar}
        onVerDetalle={onVerDetalle}
      />
    </div>
  );
}

interface ServicioListProps {
  servicios: Servicio[];
  onAgregar: (servicio: Servicio) => void;
  onVerDetalle?: (servicio: Servicio) => void;
}

export function ServicioList({
  servicios,
  onAgregar,
  onVerDetalle,
}: ServicioListProps) {
  return (
    <div
      className="grid gap-6 w-full justify-center"
      style={{
        gridTemplateColumns:
          'repeat(auto-fill, minmax(min(var(--card-w), 100%), var(--card-w)))',
      }}
    >
      {servicios.map((servicio, index) => (
        <ServicioItem
          key={servicio.id}
          servicio={servicio}
          index={index}
          onAgregar={onAgregar}
          onVerDetalle={onVerDetalle}
        />
      ))}
    </div>
  );
}
