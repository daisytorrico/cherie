import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  titulo: string;
  mensaje: string;
  confirmarTexto?: string;
  cancelarTexto?: string;
  destructivo?: boolean;
  palabraConfirmacion?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  titulo,
  mensaje,
  confirmarTexto = 'Confirmar',
  cancelarTexto = 'Cancelar',
  destructivo = false,
  palabraConfirmacion,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (open) {
      setInputValue('');
    }
  }, [open]);

  if (!open) return null;

  const puedeConfirmar =
    !palabraConfirmacion ||
    inputValue.trim().toLowerCase() === palabraConfirmacion.toLowerCase();

  return createPortal(
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl border border-camel/30 bg-surface-lowest p-5 sm:p-6 shadow-2xl space-y-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
              destructivo
                ? 'bg-rose-100 text-rose-700'
                : 'bg-secondary/15 text-secondary'
            }`}
          >
            {destructivo ? (
              <AlertCircle className="h-4.5 w-4.5" />
            ) : (
              <HelpCircle className="h-4.5 w-4.5" />
            )}
          </div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-secondary leading-tight">
            {titulo}
          </h3>
        </div>

        <p className="text-xs text-primary/80 leading-relaxed">{mensaje}</p>

        {palabraConfirmacion && (
          <div className="pt-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
              Escribe{' '}
              <span className="font-bold text-rose-600">
                "{palabraConfirmacion}"
              </span>{' '}
              para confirmar
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={palabraConfirmacion}
              className="w-full rounded-xl border border-camel/40 bg-surface-lowest px-3 py-2 text-sm text-primary focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all placeholder:text-primary/30"
              autoComplete="off"
            />
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-camel/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary/70 hover:bg-surface-low transition-colors cursor-pointer"
          >
            {cancelarTexto}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!puedeConfirmar}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all cursor-pointer ${
              !puedeConfirmar
                ? 'bg-primary/20 text-primary/40 cursor-not-allowed shadow-none'
                : destructivo
                  ? 'bg-rose-700 hover:bg-rose-800 hover:opacity-90'
                  : 'bg-secondary hover:bg-secondary/90 hover:opacity-90'
            }`}
          >
            {confirmarTexto}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
