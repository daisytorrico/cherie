import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Promo } from '../../promos/types';
import { subirImagenACloudinary } from '../../../utils/cloudinary';
import { ImageUploadField } from '../../../components/shared/ImageUploadField';
import heroThumb from '../../../assets/hero1.opt.webp';

interface PromoFormModalProps {
  open: boolean;
  promoEditando: Promo | null;
  siguienteOrden: number;
  onClose: () => void;
  onGuardado: (
    promoData: Partial<Promo> & { imagenUrl: string }
  ) => Promise<{ success: boolean; error?: string }>;
}

export function PromoFormModal({
  open,
  promoEditando,
  siguienteOrden,
  onClose,
  onGuardado,
}: PromoFormModalProps) {
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    if (promoEditando) {
      setTitulo(promoEditando.titulo || '');
      setSubtitulo(promoEditando.subtitulo || '');
      setImagenPreview(promoEditando.imagenUrl || null);
    } else {
      setTitulo('');
      setSubtitulo('');
      setImagenPreview(null);
    }
    setImagenFile(null);
    setError('');
  }, [open, promoEditando]);

  const handleFileSelected = (file: File | null) => {
    setImagenFile(file);
    if (file) {
      setImagenPreview(URL.createObjectURL(file));
    } else {
      if (promoEditando?.id === 'default-hero') {
        setImagenPreview('default');
      } else {
        setImagenPreview(null);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let imagenUrl = promoEditando?.imagenUrl ?? '';

    if (!imagenFile) {
      if (promoEditando?.id === 'default-hero') {
        imagenUrl = imagenPreview === 'default' ? 'default' : imagenUrl;
      } else if (!imagenUrl) {
        setError('Debes seleccionar una imagen para la promoción del Hero.');
        return;
      }
    }

    setGuardando(true);
    setError('');

    try {
      if (imagenFile) {
        imagenUrl = await subirImagenACloudinary(imagenFile, 'cherie/promos');
      }

      const payload: Partial<Promo> & { imagenUrl: string } = {
        ...(promoEditando?.id ? { id: promoEditando.id } : {}),
        titulo,
        subtitulo,
        imagenUrl,
        ...(promoEditando ? {} : { orden: siguienteOrden, activa: true }),
      };

      const result = await onGuardado(payload);

      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Error desconocido al guardar.');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo guardar la promo.';
      setError(message);
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-surface-lowest sm:bg-black/50 sm:backdrop-blur-sm sm:p-4 md:p-6 overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-md flex flex-col bg-surface-lowest sm:rounded-3xl border-0 sm:border sm:border-camel p-4 sm:p-8 shadow-2xl overflow-y-auto"
        style={{
          paddingTop: '1.5rem',
          paddingBottom: 'calc(var(--navbar-h) + 1.5rem)',
        }}
      >
        <div className="flex items-center justify-between border-b border-camel/20 pb-4 mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
            {promoEditando ? 'Editar Promoción' : 'Nueva Promoción'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-primary/60 hover:bg-black/5 hover:text-primary transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <ImageUploadField
            label="Foto para el Hero"
            previewUrl={imagenPreview === 'default' ? heroThumb : imagenPreview}
            onFileSelected={handleFileSelected}
          />
          <p className="text-[10px] text-primary/50 text-center -mt-2">
            Recomendado: formato horizontal (Landscape) de alta calidad.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
              Título (Opcional)
            </label>
            <input
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ej: Promo Día de la Madre"
              className="rounded-2xl border-none bg-surface-low/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
              Subtítulo (Opcional)
            </label>
            <textarea
              value={subtitulo}
              onChange={(event) => setSubtitulo(event.target.value)}
              placeholder="Ej: 20% off en todos los servicios de uñas"
              className="rounded-2xl border-none bg-surface-low/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/40 transition-all resize-none"
              rows={2}
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-error-main font-medium">{error}</p>
        ) : null}

        <div className="mt-8 pt-6 border-t border-camel/20 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-full border border-camel/40 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary transition-opacity hover:opacity-80 text-center cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="w-full sm:w-auto rounded-full bg-secondary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-surface-lowest transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md text-center cursor-pointer"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
