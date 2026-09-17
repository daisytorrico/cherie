import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CalendarCheck,
  Flower2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Heart,
  X,
} from 'lucide-react';
import type { Servicio } from '../types';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDuration } from '../../../utils/formatDuration';
import useFavoritosServicios from '../../wishlist/hooks/useFavoritosServicios';

interface Props {
  servicio: Servicio | null;
  categoriaNombre?: string;
  onClose: () => void;
  onAgregar: (servicio: Servicio) => void;
}

export function ServicioDetalleView({
  servicio,
  categoriaNombre,
  onClose,
  onAgregar,
}: Props) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [agregado, setAgregado] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { esFavorito, toggleFavorito } = useFavoritosServicios();

  useEffect(() => {
    if (!servicio) {
      setCurrentImageIdx(0);
      setAgregado(false);
      return;
    }
    document.body.style.overflow = 'hidden';
    window.history.pushState({ detalleServicio: true }, '');
    const handlePop = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('popstate', handlePop);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [servicio, onClose]);

  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const [failedMap, setFailedMap] = useState<Record<number, boolean>>({});

  const rawImagenes = servicio?.galeria?.length
    ? servicio.galeria
    : servicio?.imagenUrl
    ? [servicio.imagenUrl]
    : [];

  const imagenes = rawImagenes.filter(
    (url): url is string => typeof url === 'string' && url.trim().length > 0
  );

  useEffect(() => {
    setCurrentImageIdx(0);
    setLoadedMap({});
    setFailedMap({});
  }, [servicio?.id]);

  useEffect(() => {
    if (imagenes.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => {
        const next = (prev + 1) % imagenes.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: scrollRef.current.clientWidth * next,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [imagenes.length]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    if (idx !== currentImageIdx && idx >= 0 && idx < imagenes.length) {
      setCurrentImageIdx(idx);
    }
  };

  const scrollToIdx = (idx: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.clientWidth * idx, behavior: 'smooth' });
    }
    setCurrentImageIdx(idx);
  };

  const handleAgregar = () => {
    if (!servicio) return;
    setAgregado(true);
    setTimeout(() => { onAgregar(servicio); setAgregado(false); }, 700);
  };

  const favorito = servicio ? esFavorito(servicio.id) : false;

  return (
    <AnimatePresence>
      {servicio && (
        <motion.div
          key="detalle-page"
          className="fixed inset-0 z-[1100] overflow-y-auto bg-surface-lowest"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        >
          {/*
           * ══════════════════════════════════════════
           * BARRA NAV SUPERIOR — sticky dentro del scroll
           * Desktop: Volver a la izq, Favorito y X a la der
           * Mobile: X y Favorito a la derecha al alcance cómodo del pulgar
           * ══════════════════════════════════════════
           */}
          <div className="sticky top-0 z-20 flex items-center justify-between bg-surface-lowest/90 px-4 py-3 backdrop-blur-md sm:px-8 lg:px-12">
            {/* Botón Volver */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Volver"
              className="inline-flex group items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-[0.8rem] font-medium text-primary/70 transition hover:text-primary cursor-pointer"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-low transition group-hover:bg-surface-low/80">
                <ArrowLeft className="h-4 w-4" />
              </span>
              <span className="hidden sm:inline">Volver</span>
            </button>

            {/* Acciones a la derecha — Favorito y Botón X accesible cómodamente con una mano */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => servicio && toggleFavorito(servicio)}
                aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary/20 bg-surface-low transition hover:bg-secondary/10"
              >
                <Heart
                  className={`h-4.5 w-4.5 transition-colors ${favorito ? 'fill-secondary text-secondary' : 'text-secondary/60'}`}
                  strokeWidth={1.8}
                />
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={onClose}
                aria-label="Cerrar detalle"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-low text-primary/80 transition hover:bg-surface-low/80 hover:text-primary active:scale-95"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </motion.button>
            </div>
          </div>

          {/*
           * ══════════════════════════════════════════
           * CUERPO DE LA PÁGINA
           * Mobile  : ancho completo (px-0) para imagen edge-to-edge
           * Desktop : dos columnas — imagen izq (sticky), info der
           * ══════════════════════════════════════════
           */}
          <div className="mx-auto w-full max-w-6xl px-0 pb-32 sm:px-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-12 lg:pb-20 lg:pt-8">

            {/* ─── COLUMNA IMAGEN ─── */}
            <div className="lg:sticky lg:top-[calc(3.5rem)]">

              {/* Galería — proporción vertical 4:5 para aprovechar el alto y no cortar fotos */}
              <div className="relative w-full overflow-hidden rounded-none sm:rounded-3xl aspect-[4/5] max-h-[72vh] sm:max-h-[620px] bg-surface-low shadow-sm">
                {imagenes.length > 0 ? (
                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="absolute inset-0 flex h-full w-full snap-x snap-mandatory overflow-x-auto no-scrollbar"
                  >
                    {imagenes.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative h-full w-full shrink-0 snap-center overflow-hidden bg-surface-low"
                      >
                        {/* Shimmer / Skeleton de carga */}
                        {!loadedMap[idx] && !failedMap[idx] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-surface-low animate-pulse">
                            <Flower2 className="h-10 w-10 text-secondary/25 animate-spin-slow" strokeWidth={1.5} />
                          </div>
                        )}

                        {/* Fallback en caso de error de red o URL rota */}
                        {failedMap[idx] ? (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary/15 via-surface-low to-camel/15 p-6 text-center">
                            <Flower2 className="h-14 w-14 text-secondary/40" strokeWidth={1.2} />
                            <span className="text-xs font-medium text-primary/60">{servicio.nombre}</span>
                          </div>
                        ) : (
                          <motion.img
                            src={url}
                            alt={`${servicio.nombre} ${idx + 1}`}
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            onLoad={() => setLoadedMap((prev) => ({ ...prev, [idx]: true }))}
                            onError={() => setFailedMap((prev) => ({ ...prev, [idx]: true }))}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: loadedMap[idx] ? 1 : 0 }}
                            transition={{ duration: 0.35 }}
                            className="h-full w-full object-cover object-center"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary/15 via-surface-low to-camel/15">
                    <Flower2 className="h-16 w-16 text-secondary/30" strokeWidth={1} />
                    <span className="text-xs font-medium text-primary/50">{servicio.nombre}</span>
                  </div>
                )}


                {/* Flechas galería */}
                {imagenes.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => scrollToIdx((currentImageIdx - 1 + imagenes.length) % imagenes.length)}
                      aria-label="Anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md hover:bg-black/45 active:scale-95 transition"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToIdx((currentImageIdx + 1) % imagenes.length)}
                      aria-label="Siguiente"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md hover:bg-black/45 active:scale-95 transition"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Miniaturas si hay galería */}
              {imagenes.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-0 pb-1">
                  {imagenes.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToIdx(idx)}
                      className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-low transition-all sm:h-14 sm:w-18 ${
                        idx === currentImageIdx
                          ? 'ring-2 ring-secondary ring-offset-2 ring-offset-surface-lowest scale-[1.03]'
                          : 'opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── COLUMNA INFORMACIÓN ─── */}
            <div className="px-4 pt-6 sm:px-0 lg:pt-0">

              {/* Accent top — línea de color alegre */}
              <div className="mb-6 h-0.5 w-16 rounded-full bg-gradient-to-r from-secondary to-flower" />

              {/* Eyebrow */}
              {categoriaNombre && (
                <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-secondary/70">
                  {categoriaNombre}
                </p>
              )}

              {/* Nombre */}
              <h1
                className="font-serif font-bold leading-[1.08] text-primary"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
              >
                {servicio.nombre}
              </h1>

              {/* Precio */}
              {servicio.precio ? (
                <p
                  className="mt-3 font-serif font-bold text-secondary"
                  style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)' }}
                >
                  ${formatCurrency(servicio.precio)}
                </p>
              ) : null}

              {/* Badges */}
              {(servicio.duracion || categoriaNombre) && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {servicio.duracion && (
                    <span className="flex items-center gap-1.5 rounded-full border border-camel/25 bg-camel/10 px-4 py-2 text-[0.78rem] font-medium text-primary/70">
                      <Clock className="h-3.5 w-3.5 text-camel" />
                      {formatDuration(servicio.duracion)}
                    </span>
                  )}
                  {categoriaNombre && (
                    <span className="flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-[0.78rem] font-medium text-secondary">
                      <Sparkles className="h-3.5 w-3.5" />
                      {categoriaNombre}
                    </span>
                  )}
                </div>
              )}

              {/* Separador */}
              <div className="my-7 border-t border-primary/8" />

              {/* Descripción */}
              {servicio.descripcion ? (
                <div>
                  <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary/35">
                    Acerca de este servicio
                  </p>
                  <p className="font-sans text-[0.92rem] leading-[1.85] text-primary/60">
                    {servicio.descripcion}
                  </p>
                </div>
              ) : null}

              {/* Botón reservar — inline en la columna de info (desktop) */}
              <div className="mt-10 hidden lg:block">
                <motion.button
                  type="button"
                  onClick={handleAgregar}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-secondary to-flower py-4 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_4px_24px_rgba(181,83,122,0.38)] transition-shadow hover:shadow-[0_6px_30px_rgba(181,83,122,0.52)]"
                >
                  <AnimatePresence mode="wait">
                    {agregado ? (
                      <motion.span key="ok" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        ¡Agregado!
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4" />
                        Reservar este servicio
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

            </div>
          </div>

          {/*
           * BARRA DE ACCIÓN FIJA — solo mobile/tablet
           * En desktop el botón está dentro de la columna de info
           */}
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-primary/8 bg-surface-lowest/95 px-4 pb-7 pt-4 backdrop-blur-xl sm:px-8 lg:hidden">
            <motion.button
              type="button"
              onClick={handleAgregar}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-secondary to-flower py-4 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_4px_24px_rgba(181,83,122,0.38)] transition-shadow hover:shadow-[0_6px_30px_rgba(181,83,122,0.52)]"
            >
              <AnimatePresence mode="wait">
                {agregado ? (
                  <motion.span key="ok" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> ¡Agregado!
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4" /> Reservar este servicio
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
