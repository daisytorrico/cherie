import { Link } from 'react-router-dom';
import { forwardRef } from 'react';

interface Props {
  categoria: string;
  image?: string;
  to: string;
  rotate?: 'left' | 'right';
}

export const CategoriaPreview = forwardRef<HTMLAnchorElement, Props>(
  function CategoriaPreview({ categoria, image, to, rotate = 'left' }, ref) {
    const tilt = rotate === 'left' ? '-rotate-2' : 'rotate-2';
    const tagTilt = rotate === 'left' ? 'rotate-3' : '-rotate-3';

    return (
      <Link
        ref={ref}
        to={to}
        className="group block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <div
          className={`relative w-full bg-surface-lowest p-4 pb-7 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-500 motion-reduce:transition-none ${tilt} group-hover:-translate-y-1 group-hover:rotate-0 group-hover:shadow-[0_22px_40px_-18px_rgba(163,50,95,0.45)]`}
        >
          {/* Cinta washi */}
          <span className="absolute left-1/2 top-0 h-6 w-16 -translate-x-1/2 -translate-y-1/2 rotate-1 bg-flower/70" />

          <div className="aspect-square w-full overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={categoria}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-low text-xs uppercase tracking-wide text-secondary/70">
                {categoria}
              </div>
            )}
          </div>

          {/* Cartelito escrito a mano, prendido al borde de la foto */}
          <span
            aria-hidden="true"
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${tagTilt} rounded-sm bg-flower px-3 py-0.5 text-xl font-semibold capitalize leading-none text-surface-lowest shadow-[0_4px_10px_-4px_rgba(0,0,0,0.35)] transition-transform duration-500 motion-reduce:transition-none group-hover:rotate-0 [font-family:var(--font-hand)]`}
          >
            {categoria}
          </span>
        </div>
      </Link>
    );
  }
);
