export function HorarioSlotsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full animate-pulse py-1"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-9 rounded-xl bg-surface-low border border-camel/20 shadow-xs"
        />
      ))}
    </div>
  );
}
