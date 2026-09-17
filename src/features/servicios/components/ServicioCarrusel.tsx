import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import type { Servicio, Categoria } from '../types';
import { ServicioCard } from './ServicioCard';

interface ServicioCarruselProps {
  servicios: Servicio[];
  categoria?: Categoria;
  onVerMas?: (categoriaId: string) => void;
  onAgregar: (servicio: Servicio) => void;
  onVerDetalle?: (servicio: Servicio) => void;
}

export function ServicioCarrusel({
  servicios,
  categoria,
  onVerMas,
  onAgregar,
  onVerDetalle,
}: ServicioCarruselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const limite = 5;
  const mostrarVerMas = servicios.length > limite && categoria && onVerMas;
  const serviciosAMostrar = mostrarVerMas ? servicios.slice(0, limite) : servicios;

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 12);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 12);
  };

  useEffect(() => {
    checkScroll();
  }, [serviciosAMostrar.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({
      left: direction === 'left'
        ? -containerRef.current.clientWidth * 0.75
        : containerRef.current.clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group/carrusel">
      {/* Botón Izquierda */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Desplazar a la izquierda"
          className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/85 dark:bg-surface-lowest/85 text-primary shadow-[0_2px_16px_rgba(0,0,0,0.12)] backdrop-blur-md opacity-0 transition-all duration-300 group-hover/carrusel:opacity-100 hover:scale-110 hover:shadow-[0_4px_22px_rgba(181,83,122,0.25)] active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Track */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-0 py-2 scroll-smooth"
      >
        {serviciosAMostrar.map((servicio) => (
          <div
            key={servicio.id}
            style={{ width: 'min(var(--card-w), 100%)' }}
            className="shrink-0 snap-start"
          >
            <ServicioCard
              servicio={servicio}
              onAgregar={onAgregar}
              onVerDetalle={onVerDetalle}
            />
          </div>
        ))}

        {/* Tarjeta "Ver más" */}
        {mostrarVerMas && (
          <div
            style={{ width: 'min(var(--card-w), 100%)' }}
            className="shrink-0 snap-start flex items-stretch py-1"
          >
            <button
              type="button"
              onClick={() => onVerMas(categoria.id)}
              className="group/btn w-full min-h-[200px] flex flex-col items-center justify-center gap-3 rounded-3xl border border-secondary/20 bg-gradient-to-br from-surface-lowest to-secondary/5 text-secondary transition-all duration-300 hover:border-secondary/40 hover:shadow-[0_8px_32px_rgba(181,83,122,0.15)] hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 transition-all duration-300 group-hover/btn:bg-secondary/20 group-hover/btn:scale-110">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-serif text-base font-bold italic">Ver colección</p>
                <p className="mt-0.5 text-[0.7rem] font-medium uppercase tracking-widest text-secondary/60">
                  {servicios.length} tratamientos
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Botón Derecha */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Desplazar a la derecha"
          className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/85 dark:bg-surface-lowest/85 text-primary shadow-[0_2px_16px_rgba(0,0,0,0.12)] backdrop-blur-md opacity-0 transition-all duration-300 group-hover/carrusel:opacity-100 hover:scale-110 hover:shadow-[0_4px_22px_rgba(181,83,122,0.25)] active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
