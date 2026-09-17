import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';

interface RowActionsMenuProps {
  activo: boolean;
  esVistaDesactivados?: boolean;
  onEditar?: () => void;
  onDesactivar: () => void;
  onReactivar: () => void;
  onEliminarDefinitivo: () => void;
}

export function RowActionsMenu({
  activo,
  esVistaDesactivados = false,
  onEditar,
  onDesactivar,
  onReactivar,
  onEliminarDefinitivo,
}: RowActionsMenuProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const handleClickFuera = (e: MouseEvent | TouchEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('touchstart', handleClickFuera);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('touchstart', handleClickFuera);
    };
  }, [abierto]);

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Más acciones"
        className="flex items-center justify-center h-8 w-8 rounded-full text-primary/60 hover:bg-surface-low hover:text-primary transition-colors cursor-pointer"
      >
        <MoreVertical className="h-4.5 w-4.5" />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-1 z-[100] w-44 overflow-hidden rounded-xl border border-camel/30 bg-surface-lowest shadow-lg">
          {onEditar && (
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                onEditar();
              }}
              className="block w-full px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-primary hover:bg-surface-low transition-colors cursor-pointer"
            >
              Editar
            </button>
          )}
          {activo ? (
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                onDesactivar();
              }}
              className="block w-full px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-low/50 transition-colors cursor-pointer"
            >
              Desactivar
            </button>
          ) : esVistaDesactivados ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setAbierto(false);
                  onReactivar();
                }}
                className="block w-full px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Reactivar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAbierto(false);
                  onEliminarDefinitivo();
                }}
                className="w-full flex items-center gap-1.5 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer border-t border-camel/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Borrar def.</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                onReactivar();
              }}
              className="block w-full px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              Reactivar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
