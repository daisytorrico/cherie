import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import useFavoritosServicios from '../hooks/useFavoritosServicios';
import { useServiciosFeature } from '../../servicios/hooks/useServiciosFeature';
import { ServicioList } from '../../servicios/components/ServicioList';
import { ServicioDetalleView } from '../../servicios/components/ServicioDetalleView';
import { ServicioGridSkeleton } from '../../servicios/components/ServicioSkeleton';
import { useTurnoFeature } from '../../turnero/hooks/useTurnoFeature';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { Link } from 'react-router-dom';
import type { Servicio } from '../../servicios/types';

export default function Wishlist() {
  const { favoritosIds } = useFavoritosServicios();
  const { servicios, loading: loadingServicios } = useServiciosFeature();
  const { agregarServicio } = useTurnoFeature();
  const { categorias } = useCategorias();

  const [initialFavoritosIds] = useState(favoritosIds);

  const favoritos = servicios.filter((s) => initialFavoritosIds.includes(s.id));

  const [detalleServicio, setDetalleServicio] = useState<Servicio | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="bg-puntitos text-primary min-h-screen w-full flex flex-col"
    >
      {/* ——— HERO EDITORIAL ——— */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        className="relative w-full overflow-hidden pb-8 sm:pb-10"
        style={{
          paddingTop: 'calc(var(--header-h) + 1.5rem)',
          marginTop: 'calc(var(--header-h) * -1)',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--surface-low) 75%, transparent) 0%, color-mix(in srgb, var(--secondary) 10%, transparent) 55%, color-mix(in srgb, var(--camel) 15%, transparent) 100%)',
          boxShadow: '0 12px 45px rgba(181,83,122,0.10)',
        }}
      >
        {/* Halo decorativo derecho */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--secondary), transparent)' }}
        />
        {/* Halo decorativo izquierdo */}
        <div
          className="pointer-events-none absolute left-0 bottom-0 h-36 w-36 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--camel), transparent)' }}
        />

        <div className="relative w-full px-4 sm:px-8 lg:px-12">

          {/* Título principal */}
          <h1
            className="font-serif font-bold leading-tight text-primary"
            style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}
          >
            Mis{' '}
            <span className="italic text-secondary">Favoritos</span>
          </h1>

          {/* Línea decorativa y contador */}
          {!loadingServicios && favoritos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="mt-3 flex items-center gap-3"
            >
              <div className="h-px w-8 bg-secondary/40" />
              <p className="text-[0.78rem] font-medium text-primary/50">
                {favoritos.length}{' '}
                {favoritos.length === 1 ? 'servicio guardado' : 'servicios guardados'}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ——— CONTENIDO ——— */}
      <div className="w-full space-y-12 py-8 px-4 sm:px-8 lg:px-12">
        {loadingServicios ? (
          <ServicioGridSkeleton />
        ) : favoritos.length === 0 ? (
          // ——— EMPTY STATE EDITORIAL ———
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto flex max-w-sm flex-col items-center gap-6 py-16 text-center"
          >
            {/* Ícono con halo */}
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full bg-secondary/10 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary/20 to-camel/10 shadow-[0_4px_24px_rgba(181,83,122,0.18)]">
                <Heart
                  className="h-9 w-9 text-secondary"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Texto */}
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold italic text-secondary">
                Tu colección está vacía
              </h2>
              <p className="font-sans text-sm leading-relaxed text-primary/55">
                Guardá tus servicios favoritos para encontrarlos fácilmente cuando quieras reservar.
              </p>
            </div>

            {/* Botón */}
            <Link
              to="/servicios"
              className="group flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-[0.78rem] font-semibold uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(181,83,122,0.38)] transition-all hover:bg-flower hover:shadow-[0_6px_28px_rgba(181,83,122,0.5)] hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              Explorar el catálogo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence>
              <ServicioList
                servicios={favoritos}
                onAgregar={agregarServicio}
                onVerDetalle={setDetalleServicio}
              />
            </AnimatePresence>
          </motion.div>
        )}
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
