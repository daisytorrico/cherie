import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTurnoFeature } from '../../turnero/hooks/useTurnoFeature';
import { useServiciosFeature } from '../hooks/useServiciosFeature';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { CategoriaHeader } from '../components/CategoriaHeader';
import { ServicioCarrusel } from '../components/ServicioCarrusel';
import { ServicioList } from '../components/ServicioList';
import { ServicioDetalleView } from '../components/ServicioDetalleView';
import {
  CategoriaConServiciosSkeleton,
  ServicioGridSkeleton,
} from '../components/ServicioSkeleton';
import type { Servicio } from '../types';

export function ServiciosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaId = searchParams.get('cat') ?? undefined;
  const { servicios: todosLosServicios, loading: loadingServicios } =
    useServiciosFeature();
  const { categorias, loading: loadingCategorias } = useCategorias();
  const { agregarServicio } = useTurnoFeature();
  const [detalleServicio, setDetalleServicio] = useState<Servicio | null>(null);

  const categoriaActual = categorias.find((c) => c.id === categoriaId);
  const isLoading = loadingServicios || loadingCategorias;

  if (isLoading) {
    return (
      <section
        className="bg-puntitos py-8 text-primary min-h-screen"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="space-y-8 w-full px-4 sm:px-8 lg:px-12 pt-[calc(var(--header-h)+2rem)]">
          {categoriaId ? (
            <ServicioGridSkeleton />
          ) : (
            [1, 2].map((i) => <CategoriaConServiciosSkeleton key={i} />)
          )}
        </div>
      </section>
    );
  }

  const categoriasOrdenadas = [...categorias].sort(
    (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
  );

  const renderChips = () => (
    <div className="relative flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
      {/* "Todos" chip */}
      <button
        type="button"
        onClick={() => setSearchParams({})}
        className="relative shrink-0 rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-widest transition-colors duration-200 focus-visible:outline-none"
        style={{ color: !categoriaId ? 'white' : undefined }}
      >
        {!categoriaId && (
          <motion.span
            layoutId="categoriaActivaIndicator"
            className="absolute inset-0 rounded-full bg-secondary shadow-[0_2px_14px_rgba(181,83,122,0.4)]"
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          />
        )}
        <span className={`relative z-10 ${!categoriaId ? 'text-white' : 'text-primary/60'}`}>
          Todos
        </span>
      </button>

      {categoriasOrdenadas.map((cat) => {
        const isActive = categoriaId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSearchParams({ cat: cat.id })}
            className="relative shrink-0 rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-widest transition-colors duration-200 focus-visible:outline-none"
          >
            {isActive && (
              <motion.span
                layoutId="categoriaActivaIndicator"
                className="absolute inset-0 rounded-full bg-secondary shadow-[0_2px_14px_rgba(181,83,122,0.4)]"
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              />
            )}
            <span className={`relative z-10 transition-colors ${isActive ? 'text-white' : 'text-primary/60 hover:text-primary'}`}>
              {cat.nombre}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="bg-puntitos text-primary min-h-screen w-full flex flex-col"
    >
      {/* CABECERA EDITORIAL UNIFICADA (Permanente, sin saltos de layout) */}
      <div
        className="w-full pb-4 sm:pb-6"
        style={{
          paddingTop: 'calc(var(--header-h) + 1.25rem)',
          marginTop: 'calc(var(--header-h) * -1)',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--surface-low) 80%, transparent) 0%, color-mix(in srgb, var(--secondary) 8%, transparent) 60%, color-mix(in srgb, var(--camel) 12%, transparent) 100%)',
          boxShadow: '0 8px 30px rgba(181,83,122,0.08)',
        }}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 mb-1">
          <AnimatePresence mode="wait">
            {categoriaActual ? (
              <motion.div
                key={categoriaActual.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {(() => {
                  const words = categoriaActual.nombre.trim().split(/\s+/);
                  const lastWord = words.pop();
                  return (
                    <h1
                      className="font-serif font-bold tracking-tight text-primary capitalize"
                      style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}
                    >
                      {words.length > 0 ? `${words.join(' ')} ` : ''}
                      <span className="italic text-secondary">{lastWord}</span>
                    </h1>
                  );
                })()}
                {categoriaActual.descripcion ? (
                  <p className="mt-1 text-xs sm:text-sm text-primary/60 max-w-xl line-clamp-2 font-sans">
                    {categoriaActual.descripcion}
                  </p>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="nuestros-servicios"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h1
                  className="font-serif font-bold tracking-tight text-primary"
                  style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}
                >
                  Nuestros <span className="italic text-secondary">Servicios</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="w-full px-4 sm:px-8 lg:px-12 mt-3">
          {renderChips()}
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="w-full space-y-10 px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {categoriaId && categoriaActual ? (
            <motion.section
              key={categoriaActual.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              <ServicioList
                servicios={todosLosServicios.filter(
                  (s) => s.categoria === categoriaActual.id
                )}
                onAgregar={agregarServicio}
                onVerDetalle={setDetalleServicio}
              />
            </motion.section>
          ) : (
            <motion.div
              key="todos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-10"
            >
              {categoriasOrdenadas.map((cat, index) => {
                const serviciosDeCat = todosLosServicios.filter(
                  (s) => s.categoria === cat.id
                );
                if (serviciosDeCat.length === 0) return null;
                return (
                  <motion.section
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: [0.25, 1, 0.5, 1],
                    }}
                    className="space-y-4"
                  >
                    <CategoriaHeader
                      categoria={cat}
                      cantidadServicios={serviciosDeCat.length}
                      onSelectCategory={(id) =>
                        id && setSearchParams({ cat: id })
                      }
                    />
                    <ServicioCarrusel
                      servicios={serviciosDeCat}
                      categoria={cat}
                      onVerMas={(id) => setSearchParams({ cat: id })}
                      onAgregar={agregarServicio}
                      onVerDetalle={setDetalleServicio}
                    />
                  </motion.section>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ServicioDetalleView
        servicio={detalleServicio}
        categoriaNombre={
          categorias.find((c) => c.id === detalleServicio?.categoria)?.nombre
        }
        onClose={() => setDetalleServicio(null)}
        onAgregar={(servicio) => {
          agregarServicio(servicio);
          setDetalleServicio(null);
        }}
      />
    </motion.div>
  );
}
