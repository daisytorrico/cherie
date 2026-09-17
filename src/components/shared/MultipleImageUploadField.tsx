import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

export type GaleriaItem = {
  id: string; // Identificador único (puede ser la URL original o un ID temporal)
  url: string; // URL para previsualizar
  file?: File; // Si tiene archivo, es una imagen nueva a subir
};

interface MultipleImageUploadFieldProps {
  label: string;
  items: GaleriaItem[];
  onAddFiles: (files: File[]) => void;
  onRemoveItem: (id: string) => void;
}

export function MultipleImageUploadField({
  label,
  items,
  onAddFiles,
  onRemoveItem,
}: MultipleImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      onAddFiles(files);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setArrastrando(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      onAddFiles(imageFiles);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
          {label}
        </label>
        <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
          {items.length} {items.length === 1 ? 'FOTO' : 'FOTOS'}
        </span>
      </div>

      <div
        className={`relative flex w-full flex-col gap-4 rounded-2xl border-2 border-dashed p-4 transition-colors ${arrastrando ? 'border-secondary bg-secondary/5' : 'border-camel/50 bg-surface-lowest'}`}
        onDragOver={(event) => {
          event.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />

        {/* Grid de imágenes */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-surface-low border border-camel/20 shadow-sm"
              >
                <img
                  src={item.url}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    className="rounded-full bg-error-main p-1.5 text-white hover:scale-110 transition-transform shadow-sm cursor-pointer"
                    title="Eliminar foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-secondary text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                    Portada
                  </span>
                )}
              </div>
            ))}

            {/* Botón de agregar más (al final del grid) */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-camel/60 bg-surface-low/30 text-primary/50 hover:bg-surface-low hover:text-primary hover:border-secondary/50 transition-colors cursor-pointer"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-[9px] font-semibold uppercase tracking-wider">
                Agregar
              </span>
            </button>
          </div>
        )}

        {/* Estado vacío */}
        {items.length === 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 py-6 group cursor-pointer"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-low text-primary/40 group-hover:text-secondary group-hover:scale-110 transition-all">
              <ImagePlus className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-primary">
                Seleccionar imágenes
              </p>
              <p className="text-xs text-primary/50 mt-1">
                Hacé click o arrastrá las fotos acá
              </p>
            </div>
          </button>
        )}
      </div>

      <p className="text-[11px] text-primary/50 italic ml-1">
        La primera foto de la lista se usará como portada del servicio. Podés
        subir varias para armar una galería.
      </p>
    </div>
  );
}
