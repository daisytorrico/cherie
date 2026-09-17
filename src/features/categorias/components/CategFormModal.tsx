import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Categoria } from '../../servicios/types';
import { crearCategoria, actualizarCategoria } from '../api/categoriasApi';
import { subirImagenACloudinary } from '../../../utils/cloudinary';
import { ImageUploadField } from '../../../components/shared/ImageUploadField';

interface CategoriaFormModalProps {
  open: boolean;
  categoriaEditando: Categoria | null;
  siguienteOrden: number;
  onClose: () => void;
  onGuardado: () => void;
}

export function CategoriaFormModal({
  open,
  categoriaEditando,
  siguienteOrden,
  onClose,
  onGuardado,
}: CategoriaFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    if (categoriaEditando) {
      setNombre(categoriaEditando.nombre);
      setDescripcion(categoriaEditando.descripcion ?? '');
      setImagenPreview(categoriaEditando.imagenUrl ?? null);
    } else {
      setNombre('');
      setDescripcion('');
      setImagenPreview(null);
    }
    setImagenFile(null);
    setError('');
  }, [open, categoriaEditando]);

  const handleFileSelected = (file: File | null) => {
    setImagenFile(file);
    setImagenPreview(
      file ? URL.createObjectURL(file) : (categoriaEditando?.imagenUrl ?? null)
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setGuardando(true);
    setError('');

    try {
      let imagenUrl = categoriaEditando?.imagenUrl ?? '';

      if (imagenFile) {
        imagenUrl = await subirImagenACloudinary(
          imagenFile,
          'cherie/categorias'
        );
      }

      if (categoriaEditando) {
        await actualizarCategoria(categoriaEditando.id, {
          nombre,
          descripcion,
          imagenUrl,
        });
      } else {
        await crearCategoria({
          nombre,
          descripcion,
          imagenUrl,
          orden: siguienteOrden,
          activa: true,
        });
      }

      onGuardado();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo guardar la categoría.';
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
            {categoriaEditando ? 'Editar categoría' : 'Nueva categoría'}
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
            label="Foto de la categoría"
            previewUrl={imagenPreview}
            onFileSelected={handleFileSelected}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
              Nombre
            </label>
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej: Uñas"
              className="rounded-2xl border-none bg-surface-low/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              placeholder="Una frase corta que describa la categoría"
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
            className="w-full sm:w-auto rounded-full border border-camel/40 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary transition-opacity hover:opacity-80 text-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="w-full sm:w-auto rounded-full bg-secondary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-surface-lowest transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md text-center"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
