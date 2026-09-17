import { motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { SITE_CONFIG } from '../../core/config';

export default function Mantenimiento() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-lowest px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        className="flex max-w-md flex-col items-center rounded-3xl bg-surface-low p-8 shadow-sm border border-secondary/10"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="mb-6 rounded-full bg-secondary/10 p-4 text-secondary"
        >
          <Settings className="h-12 w-12" />
        </motion.div>

        <h1 className="mb-4 font-serif text-3xl font-bold text-secondary">
          Estamos mejorando
        </h1>

        <p className="text-primary/70 mb-2 leading-relaxed">
          {SITE_CONFIG.name} se encuentra momentáneamente en mantenimiento para
          ofrecerte una mejor experiencia.
        </p>
        <p className="text-sm font-semibold text-camel">
          Volvemos en unos instantes.
        </p>
      </motion.div>
    </div>
  );
}
