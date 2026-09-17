import { motion } from 'motion/react';

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Cambiar a modo oscuro/claro"
      title="Cambiar a modo oscuro/claro"
      className="relative flex h-6 w-11 shrink-0 items-center rounded-full border-0 bg-transparent p-0 px-0.5 outline-none transition-colors duration-300"
      style={{ background: isDark ? 'var(--primary)' : 'var(--camel)' }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="relative flex h-5 w-5 items-center justify-center rounded-full bg-surface-lowest shadow-sm"
        style={{ marginLeft: isDark ? 'auto' : 0 }}
      >
        {isDark ? (
          // Lunita: círculo con una mordida (creciente), dibujada a mano
          <svg viewBox="0 0 20 20" className="h-3 w-3">
            <path
              d="M13 3a7 7 0 1 0 4 12.7A8 8 0 0 1 13 3Z"
              fill="var(--primary)"
            />
          </svg>
        ) : (
          // Solcito: círculo central + rayitos
          <svg viewBox="0 0 20 20" className="h-3 w-3">
            <circle cx="10" cy="10" r="4" fill="var(--secondary)" />
            <g
              stroke="var(--secondary)"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <line x1="10" y1="1.5" x2="10" y2="3.5" />
              <line x1="10" y1="16.5" x2="10" y2="18.5" />
              <line x1="1.5" y1="10" x2="3.5" y2="10" />
              <line x1="16.5" y1="10" x2="18.5" y2="10" />
              <line x1="4" y1="4" x2="5.4" y2="5.4" />
              <line x1="14.6" y1="14.6" x2="16" y2="16" />
              <line x1="4" y1="16" x2="5.4" y2="14.6" />
              <line x1="14.6" y1="5.4" x2="16" y2="4" />
            </g>
          </svg>
        )}
      </motion.span>
    </button>
  );
}
