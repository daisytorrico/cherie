import { useState } from 'react';
import { motion } from 'motion/react';
import type { Categoria } from '../../servicios/types';
import placeholderImg from '../../../assets/placeholder.png';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  categoria: Categoria;
  cantidadServicios?: number;
  variant?: 'compact' | 'hero';
  onSelectCategory?: (id?: string) => void;
}

export function CategoriaHeader({
  categoria,
  cantidadServicios,
  variant = 'compact',
  onSelectCategory,
}: Props) {
  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        onClick={() => onSelectCategory?.(categoria.id)}
        className={`relative w-full overflow-hidden sm:rounded-3xl aspect-[21/9] mb-4 bg-surface-low -mx-4 sm:mx-0 sm:w-full ${
          onSelectCategory ? 'cursor-pointer' : ''
        }`}
      >
        <img
          src={categoria.imagenUrl || placeholderImg}
          alt={categoria.nombre}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-6 sm:px-10 sm:pb-10">
          <h2 className="font-serif italic font-bold text-white leading-tight drop-shadow-sm" style={{ fontSize: 'var(--font-hero-title)' }}>
            {categoria.nombre}
          </h2>
          {categoria.descripcion ? (
            <p className="mt-1.5 font-sans text-sm text-white/70 max-w-lg line-clamp-1">
              {categoria.descripcion}
            </p>
          ) : null}
        </div>
      </motion.div>
    );
  }

  // ——— COMPACT (modo catálogo) ———
  const [imgSrc, setImgSrc] = useState(categoria.imagenUrl || placeholderImg);
  const palabras = categoria.nombre.trim().split(/\s+/);
  const ultima = palabras.pop();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="flex items-center justify-between py-2 px-0"
    >
      {/* Izquierda: imagen + texto */}
      <div
        className={`flex items-center gap-4 min-w-0 ${onSelectCategory ? 'cursor-pointer group' : ''}`}
        onClick={() => onSelectCategory?.(categoria.id)}
      >
        {/* Foto de categoría */}
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl shadow-sm border border-white/30 transition-transform duration-500 group-hover:scale-[1.04]">
          <img
            src={imgSrc}
            alt={categoria.nombre}
            onError={() => setImgSrc(placeholderImg)}
            className="h-full w-full object-cover"
          />
          {/* Lustre sutil encima de la foto */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
        </div>

        {/* Texto */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <h2
            className="font-serif font-bold capitalize leading-tight text-secondary break-words line-clamp-2"
            style={{ fontSize: 'var(--font-section-title)' }}
          >
            {palabras.length > 0 ? `${palabras.join(' ')} ` : ''}
            <span className="italic">{ultima}</span>
          </h2>
          {cantidadServicios !== undefined && cantidadServicios > 0 ? (
            <p className="text-[0.72rem] font-medium uppercase tracking-widest text-primary/40">
              {cantidadServicios} {cantidadServicios === 1 ? 'tratamiento' : 'tratamientos'}
            </p>
          ) : categoria.descripcion ? (
            <p className="text-[0.8rem] text-primary/50 line-clamp-1">
              {categoria.descripcion}
            </p>
          ) : null}
        </div>
      </div>

      {/* Derecha: botón "Ver colección" */}
      {onSelectCategory && (
        <button
          type="button"
          onClick={() => onSelectCategory(categoria.id)}
          className="ml-3 shrink-0 flex items-center gap-1.5 rounded-full border border-secondary/25 px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-widest text-secondary transition-all hover:bg-secondary hover:text-white hover:border-secondary hover:shadow-[0_2px_14px_rgba(181,83,122,0.35)]"
        >
          Ver todo
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
