export function TabServiciosSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 w-full animate-pulse py-2"
      aria-busy="true"
      aria-live="polite"
    >
      {[1, 2].map((catIndex) => (
        <div key={catIndex} className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-camel/20 pb-2">
            <div className="h-6 w-40 rounded-md bg-surface-low" />
            <div className="h-7 w-28 rounded-full bg-surface-low" />
          </div>
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-camel/20 bg-surface-lowest shadow-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-48 rounded bg-surface-low" />
                  <div className="h-3 w-32 rounded bg-surface-low/70" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-16 rounded-md bg-surface-low" />
                  <div className="h-8 w-8 rounded-full bg-surface-low shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TabCategoriasSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 w-full animate-pulse py-2"
      aria-busy="true"
      aria-live="polite"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-2xl border border-camel/20 bg-surface-lowest shadow-xs"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="h-5 w-5 rounded bg-surface-low shrink-0" />
            <div className="space-y-1.5 flex-1 max-w-xs">
              <div className="h-4 w-36 rounded bg-surface-low" />
              <div className="h-3 w-24 rounded bg-surface-low/70" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-16 rounded-full bg-surface-low" />
            <div className="h-7 w-7 rounded-full bg-surface-low" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConfiguracionHorariosSkeleton() {
  return (
    <div
      className="space-y-6 w-full animate-pulse py-2"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 rounded-3xl border border-camel/30 bg-surface-lowest p-6 shadow-xs">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="flex flex-wrap items-center justify-between gap-4 border-b border-camel/15 pb-4 last:border-0 last:pb-0"
          >
            <div className="h-5 w-24 rounded-md bg-surface-low" />
            <div className="flex items-center gap-3">
              <div className="h-9 w-24 rounded-xl bg-surface-low" />
              <div className="h-4 w-3 rounded bg-surface-low" />
              <div className="h-9 w-24 rounded-xl bg-surface-low" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgendaGridSkeleton({ diasCount = 3 }: { diasCount?: number }) {
  const HORARIOS_SKELETON = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];
  const ALTURA_HORA = 80;

  return (
    <div
      className="w-full overflow-x-auto rounded-3xl border border-camel/30 bg-surface-lowest shadow-xs animate-pulse select-none"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full min-w-[550px]">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `72px repeat(${diasCount}, minmax(0, 1fr))`,
          }}
        >
          {/* Celda superior izquierda */}
          <div className="border-b border-r border-camel/20 bg-surface-low/40 h-10" />

          {/* Header de días en esqueleto */}
          {Array.from({ length: diasCount }).map((_, i) => (
            <div
              key={i}
              className="border-b border-r border-camel/20 bg-surface-low/40 p-2.5 flex items-center justify-center"
            >
              <div className="h-4 w-20 rounded-md bg-surface-low/80" />
            </div>
          ))}

          {/* Columna Eje de Horas */}
          <div className="flex flex-col border-r border-camel/20 bg-surface-low/20">
            {HORARIOS_SKELETON.map((hora) => (
              <div
                key={hora}
                style={{ height: `${ALTURA_HORA}px` }}
                className="border-b border-camel/15 p-2 flex flex-col justify-between items-center"
              >
                <div className="h-3 w-8 rounded bg-surface-low/80" />
                <div className="h-2.5 w-6 rounded bg-surface-low/50" />
              </div>
            ))}
          </div>

          {/* Columnas de los Días */}
          {Array.from({ length: diasCount }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="relative border-r border-camel/20 bg-surface-lowest"
            >
              {/* Guías de horas */}
              {HORARIOS_SKELETON.map((_, hIdx) => (
                <div
                  key={hIdx}
                  style={{ height: `${ALTURA_HORA}px` }}
                  className="border-b border-camel/15 relative"
                >
                  <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-camel/10" />
                </div>
              ))}

              {/* Tarjetas esqueleto posicionadas como turnos reales */}
              <div
                className="absolute inset-x-1.5 rounded-2xl border border-camel/30 bg-surface-low/50 p-2.5 space-y-1.5 shadow-xs"
                style={{
                  top: `${ALTURA_HORA * 0.5 + 2}px`,
                  height: `${ALTURA_HORA * 1.5 - 4}px`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-surface-low" />
                  <div className="h-3 w-10 rounded bg-surface-low/70" />
                </div>
                <div className="h-3.5 w-24 rounded bg-surface-low" />
              </div>

              <div
                className="absolute inset-x-1.5 rounded-2xl border border-camel/30 bg-surface-low/50 p-2.5 space-y-1.5 shadow-xs"
                style={{
                  top: `${ALTURA_HORA * 3.0 + 2}px`,
                  height: `${ALTURA_HORA * 1.0 - 4}px`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-14 rounded bg-surface-low" />
                  <div className="h-3 w-10 rounded bg-surface-low/70" />
                </div>
                <div className="h-3.5 w-20 rounded bg-surface-low" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
