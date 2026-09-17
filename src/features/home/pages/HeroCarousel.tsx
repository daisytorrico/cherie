import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Promo } from '../../promos/types';
import { usePromos } from '../../promos/hooks/usePromos';
import heroWebp from '../../../assets/hero1.opt.webp';

// Componente interno para renderizar el Hero por defecto
const DefaultHeroSlide = ({ promo }: { promo?: Promo }) => {
  const hasCustomImg = Boolean(
    promo &&
    promo.imagenUrl &&
    promo.imagenUrl.trim() !== '' &&
    promo.imagenUrl !== 'default'
  );

  const renderTitulo = () => {
    if (!promo?.titulo && !promo?.subtitulo) {
      return (
        <>
          Tu belleza,{' '}
          <motion.span
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="italic text-secondary inline-block"
          >
            nuestra pasión
          </motion.span>
        </>
      );
    }

    return (
      <>
        {promo?.titulo}{' '}
        {promo?.subtitulo && (
          <motion.span
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="italic text-secondary inline-block"
          >
            {promo?.subtitulo}
          </motion.span>
        )}
      </>
    );
  };

  return (
    <div className="relative h-[35vh] min-h-[260px] w-full overflow-hidden sm:h-[45vh] md:h-[55vh] lg:h-[65vh] bg-surface-low group">
      {hasCustomImg ? (
        <img
          src={promo?.imagenUrl}
          alt={promo?.titulo || 'Chérie Beauty Hero'}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 z-0 h-full w-full object-cover object-[5%_75%] md:object-[50%_50%] lg:object-[50%_45%] animate-fade-in"
        />
      ) : (
        <picture>
          <source type="image/webp" srcSet={heroWebp} />
          <img
            src={heroWebp}
            alt="Chérie Beauty Hero"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 z-0 h-full w-full object-cover object-[5%_75%] md:object-[50%_50%] lg:object-[50%_45%] animate-fade-in"
          />
        </picture>
      )}

      {/* Overlay gradiente opcional para legibilidad del texto si hay custom img */}
      {hasCustomImg && (
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      )}

      {/* Mobile Hero Content + Botón */}
      <div className="absolute inset-x-0 top-24 flex flex-col items-end px-4 text-right sm:hidden z-10">
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-[220px] px-2 py-1 font-serif text-2xl font-bold leading-[1.05] text-white drop-shadow-md"
        >
          {renderTitulo()}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-4 mr-2"
        >
          <Link
            to="/servicios"
            className="rounded-full bg-secondary px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-surface-lowest shadow-md transition-all hover:scale-105"
          >
            Ver servicios
          </Link>
        </motion.div>
      </div>

      {/* Desktop Hero Content + Botón */}
      <div className="absolute inset-0 hidden flex-col items-end justify-center px-12 text-right sm:flex lg:px-20 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-md translate-y-6 px-6 py-3 font-serif text-5xl font-bold leading-[1.05] text-white drop-shadow-md"
        >
          {renderTitulo()}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-6 mr-6 translate-y-6"
        >
          <Link
            to="/servicios"
            className="rounded-full bg-secondary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-surface-lowest shadow-lg transition-all hover:scale-105 hover:opacity-90"
          >
            Ver todos los servicios
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export function HeroCarousel() {
  const { promos, loading } = usePromos();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!promos || promos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [promos]);

  const goTo = (idx: number) => {
    if (!promos) return;
    setCurrentIndex((idx + promos.length) % promos.length);
  };

  // Si está cargando, mostramos el default como skeleton visual
  if (loading) {
    return (
      <header className="relative w-full opacity-60 animate-pulse">
        <DefaultHeroSlide />
      </header>
    );
  }

  // Si no hay promos activas (incluso si desactivaron la por defecto y no hay otra),
  // el usuario quiere que SIEMPRE haya un hero por defecto como fallback visual.
  if (!promos || promos.length === 0) {
    return (
      <header className="relative w-full">
        <DefaultHeroSlide />
      </header>
    );
  }

  // Carrusel de Promos Dinámico
  const promoActual = promos[currentIndex];

  return (
    <header className="group relative h-[35vh] min-h-[260px] w-full overflow-hidden sm:h-[45vh] md:h-[55vh] lg:h-[65vh] bg-surface-low">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={promoActual.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0 h-full w-full"
        >
          {promoActual.esSistema ? (
            <DefaultHeroSlide promo={promoActual} />
          ) : (
            <>
              <img
                src={promoActual.imagenUrl}
                alt={promoActual.titulo || 'Promo'}
                className="h-full w-full object-cover object-center"
              />
              {/* Overlay gradiente opcional para legibilidad del texto */}
              {(promoActual.titulo || promoActual.subtitulo) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              )}

              {(promoActual.titulo || promoActual.subtitulo) && (
                <div className="absolute inset-x-0 bottom-8 flex flex-col items-center px-4 text-center sm:bottom-16 lg:bottom-24">
                  {promoActual.titulo && (
                    <motion.h2
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg max-w-4xl"
                    >
                      {promoActual.titulo}
                    </motion.h2>
                  )}
                  {promoActual.subtitulo && (
                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="mt-2 text-sm sm:text-lg lg:text-xl text-white/90 font-medium drop-shadow-md max-w-2xl"
                    >
                      {promoActual.subtitulo}
                    </motion.p>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Flechas — solo desktop, aparecen al hacer hover sobre el hero */}
      {promos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            aria-label="Anterior"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md opacity-0 transition-all duration-300 hover:bg-black/40 group-hover:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            aria-label="Siguiente"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md opacity-0 transition-all duration-300 hover:bg-black/40 group-hover:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </header>
  );
}
