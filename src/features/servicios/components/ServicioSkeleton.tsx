export function ServicioSkeleton() {
  return (
    <div className="w-full shrink-0 animate-pulse rounded-2xl bg-surface-low p-4 border border-camel/10 shadow-sm">
      <div className="aspect-[16/10] sm:aspect-square w-full rounded-xl bg-surface-lowest" />
      <div className="mt-4 space-y-3">
        <div className="h-5 w-4/5 rounded-md bg-surface-lowest" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-1/3 rounded-md bg-surface-lowest" />
          <div className="h-7 w-20 rounded-full bg-surface-lowest" />
        </div>
      </div>
    </div>
  );
}

export function CategoriaConServiciosSkeleton() {
  return (
    <div className="space-y-6 py-4 w-full">
      {/* Header de categoría skeleton responsive */}
      <div className="flex items-center gap-4 px-4 sm:px-0">
        <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl bg-surface-low animate-pulse border border-camel/10 shadow-sm" />
        <div className="space-y-2.5 flex-1">
          <div className="h-6 w-48 sm:w-64 rounded-md bg-surface-low animate-pulse" />
          <div className="h-4 w-full max-w-md rounded-md bg-surface-low/70 animate-pulse" />
        </div>
      </div>

      {/* Carrusel de skeletons: mismo ancho (var(--card-w)) que ServicioCarrusel real, sin "peek" */}
      <div className="flex gap-4 overflow-hidden px-4 sm:px-6 lg:px-0 py-2 w-full">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{ width: 'min(var(--card-w), 100%)' }}
            className="shrink-0"
          >
            <ServicioSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServicioGridSkeleton() {
  return (
    <div
      className="grid gap-6 w-full justify-center"
      style={{
        gridTemplateColumns:
          'repeat(auto-fill, minmax(min(var(--card-w), 100%), var(--card-w)))',
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <ServicioSkeleton key={i} />
      ))}
    </div>
  );
}
