import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  previewUrl: string | null;
  onFileSelected: (file: File | null) => void;
}

export function ImageUploadField({
  label,
  previewUrl,
  onFileSelected,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelected(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setArrastrando(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    if (file) onFileSelected(file);
  };

  const handleQuitarImagen = (event: React.MouseEvent) => {
    event.stopPropagation();
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={handleDrop}
        className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed p-3 text-left transition-colors ${arrastrando ? 'border-secondary bg-secondary/5' : 'border-camel/50 hover:border-secondary/60 hover:bg-surface-low'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vista previa"
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-low text-primary/40">
            <ImagePlus className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">
            {previewUrl ? 'Cambiar foto' : 'Seleccionar imagen'}
          </p>
          <p className="truncate text-xs text-primary/50">
            Hacé click o arrastrá una imagen acá
          </p>
        </div>

        {previewUrl && (
          <span
            role="button"
            onClick={handleQuitarImagen}
            aria-label="Quitar foto"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-lowest text-primary/50 shadow-sm hover:text-error-main"
          >
            <X className="h-4 w-4" />
          </span>
        )}
      </button>
    </div>
  );
}
