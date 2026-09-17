import { useState } from 'react';
import type { Servicio } from '../types';
import placeholderImg from '../../../assets/placeholder.png';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDuration } from '../../../utils/formatDuration';
import { Heart, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useFavoritosServicios from '../../wishlist/hooks/useFavoritosServicios';
import { useAuth } from '../../auth/context/AuthProvider';

interface ServicioCardProps {
  servicio: Servicio;
  onAgregar: (servicio: Servicio) => void;
  onVerDetalle?: (servicio: Servicio) => void;
}

export function ServicioCard({
  servicio,
  onAgregar,
  onVerDetalle,
}: ServicioCardProps) {
  const { toggleFavorito, esFavorito } = useFavoritosServicios();
  const { esAdmin } = useAuth();
  const favorito = esFavorito(servicio.id);
  const [agregadoReciente, setAgregadoReciente] = useState(false);
  const [imgSrc, setImgSrc] = useState(servicio.imagenUrl || placeholderImg);

  const handleAgregarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (esAdmin) return;
    onAgregar(servicio);
    setAgregadoReciente(true);
    setTimeout(() => setAgregadoReciente(false), 1200);
  };

  return (
    <article
      onClick={() => onVerDetalle?.(servicio)}
      className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-3xl bg-surface-low shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(181,83,122,0.38)] sm:aspect-square"
    >
      {/* Imagen con fallback seguro */}
      <img
        src={imgSrc}
        alt={servicio.nombre}
        loading="lazy"
        onError={() => setImgSrc(placeholderImg)}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />

      {/* Gradiente editorial balanceado: legibilidad impecable en fotos claras */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      {/* Brillo perimetral sutil al hover */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 transition-all duration-500 group-hover:ring-secondary/30" />

      {/* Badge de duración — glassmorphism */}
      {servicio.duracion ? (
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/40 text-white px-2.5 py-1 text-[0.7rem] font-semibold backdrop-blur-md shadow-sm border border-white/10">
          <Clock className="h-3 w-3 opacity-80" />
          {formatDuration(servicio.duracion)}
        </span>
      ) : null}

      {/* Botón favorito */}
      {!esAdmin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorito(servicio);
          }}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md shadow-sm border border-white/10 transition-transform hover:scale-110 active:scale-95"
          aria-label="Marcar como favorito"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={favorito ? 'fav' : 'no-fav'}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  favorito
                    ? 'fill-secondary text-secondary'
                    : 'text-white/80'
                }`}
                strokeWidth={favorito ? 0 : 2}
              />
            </motion.div>
          </AnimatePresence>
        </button>
      )}

      {/* Contenido inferior */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 px-4 pb-5 pt-6">
        <h3
          className="font-serif font-bold leading-snug text-white drop-shadow-sm line-clamp-2"
          style={{ fontSize: 'var(--font-card-title)' }}
        >
          {servicio.nombre}
        </h3>

        <div className="flex items-center justify-between gap-2">
          {servicio.precio ? (
            <span className="text-base sm:text-lg font-bold tracking-tight text-white/95 truncate">
              ${formatCurrency(servicio.precio)}
            </span>
          ) : (
            <span />
          )}

          <motion.button
            type="button"
            disabled={esAdmin}
            onClick={handleAgregarClick}
            whileTap={{ scale: 0.93 }}
            title={esAdmin ? 'Modo administrador' : 'Agregar a la reserva'}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-widest text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
              agregadoReciente
                ? 'bg-emerald-600 shadow-[0_2px_14px_rgba(16,185,129,0.55)] scale-105'
                : 'bg-secondary shadow-[0_2px_12px_rgba(181,83,122,0.5)] hover:bg-flower hover:shadow-[0_4px_18px_rgba(181,83,122,0.6)]'
            }`}
          >
            <AnimatePresence mode="wait">
              {agregadoReciente ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, y: 3, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -3 }}
                  className="flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ¡Listo!
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                >
                  Agregar
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </article>
  );
}
