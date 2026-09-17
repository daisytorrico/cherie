import { useState } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import logo from '../../../assets/logo.svg';

export function PwaInstallPrompt() {
  const { canInstall, showIosPrompt, promptInstall, isInstalled } =
    usePwaInstall();
  const [isVisible, setIsVisible] = useState(true);

  if (isInstalled || !isVisible) return null;
  if (!canInstall && !showIosPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1200] animate-slideUp bg-surface-lowest px-6 py-6 pb-safe shadow-[0_-12px_24px_rgba(0,0,0,0.06)] rounded-t-3xl border-t-[3px] border-t-secondary md:bottom-6 md:left-auto md:right-6 md:w-[380px] md:rounded-2xl md:border md:border-neutral-100">
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative mx-auto flex max-w-sm flex-col gap-5">
        <div className="flex items-center gap-4 pr-6">
          <img
            src={logo}
            alt="Logo"
            className="h-16 w-16 rounded-2xl border border-neutral-100 object-cover shadow-sm bg-white shrink-0"
          />
          <div className="flex-1">
            <h3 className="font-serif text-lg font-bold text-neutral-800 leading-tight">
              Aplicación Móvil
            </h3>
            <p className="mt-1 text-[13px] text-neutral-600 leading-snug">
              Instalá la app para gestionar tus reservas más rápido.
            </p>
          </div>
        </div>

        {canInstall && (
          <button
            type="button"
            onClick={promptInstall}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-[13px] font-bold uppercase tracking-widest text-white shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Descargar
          </button>
        )}

        {showIosPrompt && (
          <div className="flex flex-col gap-3 rounded-xl bg-neutral-50/80 p-4 border border-neutral-100">
            <p className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
              Instalación en iOS
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-white shadow-sm shrink-0 border border-neutral-100">
                  <Share className="h-3.5 w-3.5 text-secondary" />
                </div>
                <p className="text-[13px] font-medium text-neutral-700">
                  1. Tocá <strong>Compartir</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-white shadow-sm shrink-0 border border-neutral-100">
                  <PlusSquare className="h-3.5 w-3.5 text-secondary" />
                </div>
                <p className="text-[13px] font-medium text-neutral-700">
                  2. <strong>Agregar a inicio</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
