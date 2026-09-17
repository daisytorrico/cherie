export function TurnoSkeleton() {
  return (
    <div className="rounded-3xl border border-camel/20 bg-surface-lowest p-5 shadow-xs flex flex-col gap-4 animate-pulse w-full">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-camel/20 pb-3">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <div className="h-5 w-3/4 max-w-xs rounded-md bg-surface-low" />
          <div className="h-3 w-1/2 max-w-[160px] rounded-md bg-surface-low/70" />
        </div>
        <div className="h-6 w-24 rounded-full bg-surface-low shrink-0" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 rounded-md bg-surface-low" />
          <div className="h-4 w-28 rounded-md bg-surface-low" />
        </div>
        <div className="h-7 w-32 rounded-full bg-surface-low shrink-0" />
      </div>
    </div>
  );
}

export function TurnoGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div
      className="flex flex-col gap-4 w-full"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, i) => (
        <TurnoSkeleton key={i} />
      ))}
    </div>
  );
}
