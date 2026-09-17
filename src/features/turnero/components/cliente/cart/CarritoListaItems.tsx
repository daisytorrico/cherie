import type { Servicio } from '../../../../servicios/types';
import { ItemCarrito } from '../ItemCarrito';

interface CarritoListaItemsProps {
  servicios: Array<{ servicio: Servicio; cantidad: number }>;
  onQuitar: (id: string) => void;
  onAgregar: (servicio: Servicio) => void;
}

export function CarritoListaItems({
  servicios,
  onQuitar,
  onAgregar,
}: CarritoListaItemsProps) {
  return (
    <div>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-(--on-surface-variant)">
        Servicios seleccionados
      </span>
      <ul className="space-y-2">
        {servicios.map(({ servicio, cantidad }) => (
          <li key={servicio.id}>
            <ItemCarrito
              servicio={servicio}
              cantidad={cantidad}
              onQuitar={onQuitar}
              onAgregar={onAgregar}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
