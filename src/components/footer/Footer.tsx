// components/footer/Footer.tsx
import logoText from '../../assets/logo-text.svg';
import { MapPin, CalendarClock } from 'lucide-react';
import { SocialLinks } from '../social/SocialLinks';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../core/config';

export function Footer() {
  return (
    <footer className="w-full bg-(--surface-low) text-primary pt-10 px-6 sm:px-12 pb-[calc(var(--navbar-h)+2rem)] lg:pb-10 border-t border-primary/10 transition-colors">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-10 lg:gap-6">
        {/* Bloque marca: en mobile va al final (menos urgente), en desktop a la izquierda */}
        <div className="order-3 md:order-1 flex flex-col items-center md:items-start md:justify-self-start text-center md:text-left gap-3.5">
          <img src={logoText} alt={SITE_CONFIG.name} className="h-8 w-auto" />

          <p className="font-sans text-sm font-medium text-primary">
            Producido por{' '}
            <span className="font-sans font-bold text-secondary">
              Codes with Style
            </span>
          </p>

          <SocialLinks />

          <p className="font-sans text-xs font-medium text-primary/70 pt-1">
            © {new Date().getFullYear()} {SITE_CONFIG.name}
          </p>
        </div>

        {/* Columna: Horarios/Atención, en mobile va segunda, en desktop al centro */}
        <div className="order-2 md:order-2 flex flex-col items-center md:items-start md:justify-self-center text-center md:text-left gap-2">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-primary">
            <CalendarClock className="h-4 w-4 shrink-0 text-secondary" />
            <span>Atención</span>
          </div>
          <p className="text-sm font-semibold text-primary/90">
            Lunes a Sábados
          </p>
        </div>

        {/* Columna: Ubicación + Botón, en mobile va primera (lo más importante), en desktop a la derecha */}
        <div className="order-1 md:order-3 flex flex-col items-center md:items-start md:justify-self-end text-center md:text-left gap-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-primary">
            <MapPin className="h-4 w-4 shrink-0 text-secondary" />
            <span>Ubicación</span>
          </div>
          <span className="text-sm font-medium text-primary/90 -mt-1">
            {SITE_CONFIG.address}
          </span>

          <Link
            to="/contact"
            className="rounded-full bg-secondary px-6 py-3 text-xs font-semibold uppercase tracking-wide text-surface-lowest shadow-sm hover:opacity-90 transition-all hover:scale-105 whitespace-nowrap"
          >
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}
