import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Categoria, Servicio } from '../types';
import { crearServicio, actualizarServicio } from '../api/serviciosApi';
import { subirImagenACloudinary } from '../../../utils/cloudinary';
import {
  MultipleImageUploadField,
  type GaleriaItem,
} from '../../../components/shared/MultipleImageUploadField';

interface ServicioFormModalProps {
  open: boolean;
  servicioEditando: Servicio | null;
  /** Solo categorías activas: no se puede asignar un servicio a una categoría oculta. */
  categorias: Categoria[];
  categoriaPorDefecto?: string;
  siguienteOrden: number;
  onClose: () => void;
  onGuardado: () => void;
}

export function ServicioFormModal({
  open,
  servicioEditando,
  categorias,
  categoriaPorDefecto,
  siguienteOrden,
  onClose,
  onGuardado,
}: ServicioFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState('');
  const [galeriaItems, setGaleriaItems] = useState<GaleriaItem[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    if (servicioEditando) {
      setNombre(servicioEditando.nombre);
      setCategoria(servicioEditando.categoria);
      setDescripcion(servicioEditando.descripcion ?? '');
      setPrecio(
        servicioEditando.precio != null ? String(servicioEditando.precio) : ''
      );
      setDuracion(
        servicioEditando.duracion != null
          ? String(servicioEditando.duracion)
          : ''
      );

      const items: GaleriaItem[] = [];
      if (servicioEditando.galeria && servicioEditando.galeria.length > 0) {
        servicioEditando.galeria.forEach((url, i) =>
          items.push({ id: `ext-${i}`, url })
        );
      } else if (servicioEditando.imagenUrl) {
        items.push({ id: 'ext-0', url: servicioEditando.imagenUrl });
      }
      setGaleriaItems(items);
    } else {
      setNombre('');
      // Asigna la categoría seleccionada por defecto (o la primera activa si no viene ninguna)
      setCategoria(categoriaPorDefecto ?? categorias[0]?.id ?? '');
      setDescripcion('');
      setPrecio('');
      setDuracion('');
      setGaleriaItems([]);
    }
    setError('');
  }, [open, servicioEditando, categoriaPorDefecto, categorias]);

  const handleFilesAdded = (files: File[]) => {
    const newItems = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }));
    setGaleriaItems((prev) => [...prev, ...newItems]);
  };

  const handleRemoveItem = (id: string) => {
    setGaleriaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setGuardando(true);
    setError('');

    try {
      const uploadPromises = galeriaItems.map(async (item) => {
        if (item.file) {
          return await subirImagenACloudinary(item.file, 'cherie/servicios');
        }
        return item.url;
      });

      const urlsCompletas = await Promise.all(uploadPromises);

      const datosBase = {
        nombre,
        categoria,
        descripcion,
        precio: precio ? Number(precio) : undefined,
        duracion: duracion ? Number(duracion) : undefined,
        imagenUrl: urlsCompletas.length > 0 ? urlsCompletas[0] : '', // Portada por retrocompatibilidad
        galeria: urlsCompletas,
      };

      if (servicioEditando) {
        await actualizarServicio(servicioEditando.id, datosBase);
      } else {
        await crearServicio({
          ...datosBase,
          activo: true,
          orden: siguienteOrden,
        });
      }

      onGuardado();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo guardar el servicio.';
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
        className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl flex flex-col bg-surface-lowest sm:rounded-3xl border-0 sm:border sm:border-camel p-4 sm:p-8 shadow-2xl overflow-y-auto"
        style={{
          paddingTop: '1.5rem',
          paddingBottom: 'calc(var(--navbar-h) + 1.5rem)',
        }}
      >
        <div className="flex items-center justify-between border-b border-camel/20 pb-4 mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
            {servicioEditando ? 'Editar servicio' : 'Nuevo servicio'}
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

        {categorias.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-camel/40 p-4 text-sm text-primary/60">
            Todavía no hay categorías activas. Cargá una categoría primero.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <MultipleImageUploadField
              label="Fotos del servicio"
              items={galeriaItems}
              onAddFiles={handleFilesAdded}
              onRemoveItem={handleRemoveItem}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                  Nombre
                </label>
                <input
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Ej: Esculpidas con diseño"
                  className="rounded-2xl border-none bg-surface-low/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(event) => setCategoria(event.target.value)}
                  className="rounded-2xl border-none bg-surface-low/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/40 transition-all appearance-none cursor-pointer"
                  required
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Breve descripción del servicio"
                rows={3}
                className="rounded-2xl border-none bg-surface-low/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/40 transition-all resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                  Precio ($)
                </label>
                <input
                  type="number"
                  value={precio}
                  onChange={(event) => setPrecio(event.target.value)}
                  placeholder="Ej: 5000"
                  className="rounded-2xl border-none bg-surface-low/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                  Duración Aprox. (min)
                </label>
                <input
                  type="number"
                  value={duracion}
                  onChange={(event) => setDuracion(event.target.value)}
                  placeholder="Ej: 60"
                  className="rounded-2xl border-none bg-surface-low/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
                />
              </div>
            </div>
          </div>
        )}

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
            disabled={guardando || categorias.length === 0}
            className="w-full sm:w-auto rounded-full bg-secondary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-surface-lowest transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md text-center"
          >
            {guardando ? 'Guardando...' : 'Guardar servicio'}
          </button>
        </div>
      </form>
    </div>
  );
}
