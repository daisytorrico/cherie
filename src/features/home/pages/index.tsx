import { motion } from 'motion/react';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { CategoriaPreview } from '../../categorias/components/CategoriaPreview';
import { HeroCarousel } from './HeroCarousel';
import logoFlor from '../../../assets/logo-icon.svg';

function CategoriaTile({
  categoria,
  imagenUrl,
  to,
  index,
}: {
  categoria: string;
  imagenUrl?: string;
  to: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.12,
        ease: [0.25, 1, 0.5, 1],
      }}
    >
      <CategoriaPreview
        categoria={categoria}
        image={imagenUrl}
        to={to}
        rotate={index % 2 === 0 ? 'left' : 'right'}
      />
    </motion.div>
  );
}

export default function Home() {
  const { categorias, loading: loadingCategorias } = useCategorias();
  const isLoading = loadingCategorias;

  if (isLoading) {
    return (
      <section className="w-full" aria-busy="true" aria-live="polite">
        <div className="relative h-[32vh] min-h-[240px] w-full animate-pulse bg-surface-low sm:h-[45vh] md:h-[55vh] lg:h-[65vh]" />
        <div className="bg-puntitos mx-auto w-full max-w-6xl py-3 pb-14 sm:pt-4 sm:pb-16 lg:pt-6 lg:pb-20">
          <div className="mb-4 flex flex-col items-center sm:mb-6">
            <div className="mb-1 h-6 w-6 animate-pulse rounded-full bg-surface-low" />
            <div className="h-7 w-48 animate-pulse rounded bg-surface-low sm:h-8" />
            <div className="mt-2 h-px w-16 bg-camel" />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square w-full animate-pulse rounded-sm bg-surface-low shadow-sm ${
                  i % 2 === 0 ? '-rotate-2' : 'rotate-2'
                }`}
              />
            ))}
          </div>
        </div>
        <span className="sr-only">Cargando contenido...</span>
      </section>
    );
  }

  const categoriasOrdenadas = [...categorias].sort(
    (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
  );

  const numCats = categoriasOrdenadas.length;
  const esImpar = numCats % 2 !== 0;

  let gridClasses = 'grid gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14 mx-auto ';
  if (numCats === 1) {
    gridClasses += 'grid-cols-1 max-w-md';
  } else if (numCats === 2) {
    gridClasses += 'grid-cols-2 max-w-3xl';
  } else if (numCats === 3) {
    gridClasses += 'grid-cols-2 lg:grid-cols-3 max-w-5xl';
  } else if (numCats === 4) {
    gridClasses += 'grid-cols-2 lg:grid-cols-4 max-w-7xl';
  } else {
    gridClasses += 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 max-w-7xl';
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full overflow-hidden"
    >
      {/* Hero */}
      <HeroCarousel />

      {/* Grid de Servicios / Contenido principal */}
      <div
        id="servicios"
        className="bg-puntitos w-full scroll-mt-[var(--header-h)] px-4 pt-6 pb-16 sm:px-8 sm:pt-6 sm:pb-20 lg:px-12 lg:pt-8 lg:pb-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex flex-col items-center text-center sm:mb-8"
        >
          <img
            src={logoFlor}
            alt=""
            className="mb-1 h-6 w-6 opacity-90 animate-spin-slow"
          />
          <h2 className="font-serif text-2xl font-bold text-secondary sm:text-3xl">
            Nuestros servicios
          </h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '4rem' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-2 h-px bg-camel"
          />
        </motion.div>

        <div className={gridClasses}>
          {categoriasOrdenadas.map((categoria, index) => {
            const esLaUltima = index === categoriasOrdenadas.length - 1;
            const centrarEnMobile = esImpar && esLaUltima && numCats !== 4;
            return (
              <div
                key={categoria.id}
                className={
                  centrarEnMobile
                    ? 'col-span-2 flex justify-center lg:col-span-1 lg:block'
                    : undefined
                }
              >
                <div
                  className={centrarEnMobile ? 'w-1/2 lg:w-full' : undefined}
                >
                  <CategoriaTile
                    index={index}
                    categoria={categoria.nombre}
                    imagenUrl={categoria.imagenUrl}
                    to={`/servicios?cat=${categoria.id}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
