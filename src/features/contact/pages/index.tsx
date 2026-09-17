import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import Map from './components/Map';
import { SocialLinks } from '../../../components/social/SocialLinks';
import logoText from '../../../assets/logo-text.svg';

export default function Contact() {
  return (
    <section className="w-full relative min-h-screen">
      {/* Fondo animado y unificado para toda la vista */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-surface-low">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -left-[10%] -top-[10%] h-[50vh] w-[50vw] rounded-full bg-secondary/10 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 30, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute right-[5%] bottom-[10%] h-[40vh] w-[40vw] rounded-full bg-[#fca5a5]/10 blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 pt-8 pb-12 lg:pt-4 lg:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          {/* Panel Izquierdo: Sticky Header Editorial */}
          <div className="lg:sticky lg:top-[100px] flex flex-col gap-8">
            <h1 className="flex flex-col items-start gap-3 font-serif text-5xl font-bold leading-[1.1] sm:text-6xl lg:text-7xl">
              <span className="text-primary/90">Conectá con</span>
              <img
                src={logoText}
                alt="Chérie Beauty"
                className="h-14 sm:h-20 lg:h-24 w-auto -ml-2"
              />
            </h1>

            <div className="h-px bg-secondary/40 w-16" />

            <p className="max-w-md font-serif text-xl sm:text-2xl italic leading-relaxed text-primary/70">
              “Servicios de belleza pensados para vos, con dedicación en cada
              detalle.”
            </p>
          </div>

          {/* Panel Derecho: Tarjetas Glassmorphism */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Tarjeta de WhatsApp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="group relative flex flex-col items-start gap-5 overflow-hidden rounded-[2rem] border border-surface-lowest/40 bg-surface-lowest/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:bg-surface-lowest/80"
            >
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-secondary mb-2 relative z-10">
                  ¿Tenés alguna duda?
                </p>
                <p className="text-sm font-medium text-primary/70 max-w-sm relative z-10 leading-relaxed">
                  Escribinos directamente y te ayudamos a coordinar tu próxima
                  sesión de belleza.
                </p>
              </div>

              <a
                href="https://wa.me/5491112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 mt-2 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] px-7 py-3.5 text-sm font-bold text-white shadow-md hover:-translate-y-1 hover:shadow-lg hover:bg-[#20bd5a] transition-all duration-300"
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                </svg>
                Chateá con nosotros
              </a>
            </motion.div>

            {/* Tarjeta de Ubicación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col rounded-[2rem] border border-surface-lowest/40 bg-surface-lowest/60 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl"
            >
              <div className="flex flex-col gap-1 p-6 sm:px-6 sm:py-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>Ubicación</span>
                </div>
                <span className="text-sm font-semibold text-primary/80 mt-1">
                  Av. Sourigues 123, Berazategui
                </span>
              </div>

              <div className="h-[280px] w-full overflow-hidden rounded-[1.5rem] shadow-inner bg-surface">
                <Map />
              </div>
            </motion.div>

            {/* Tarjeta de Redes Sociales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-5 rounded-[2rem] border border-surface-lowest/40 bg-surface-lowest/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Nuestras Redes
              </p>
              <SocialLinks
                containerClassName="flex flex-col gap-2 w-full"
                linkClassName="group flex w-full items-center gap-4 text-primary bg-transparent hover:bg-surface-lowest/40 rounded-2xl p-4 transition-all duration-300"
                iconClassName="text-2xl text-secondary transition-transform duration-300 group-hover:scale-110"
                showHandle
                handleClassName="font-sans font-semibold text-base text-primary/90"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
