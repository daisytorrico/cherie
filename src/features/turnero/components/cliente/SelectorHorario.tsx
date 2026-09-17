import { useState } from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { HorarioSlotsSkeleton } from './HorarioSlotsSkeleton';

interface SelectorDeHorarioProps {
  fecha: string;
  onFechaChange: (fecha: string) => void;
  slots: string[];
  loadingSlots: boolean;
  horaSeleccionada: string | null;
  // Acepta string | null para poder resetear la hora al cambiar fecha
  onHoraChange: (hora: string | null) => void;
  duracionTotal: number;
}

export function SelectorDeHorario({
  fecha,
  onFechaChange,
  slots,
  loadingSlots,
  horaSeleccionada,
  onHoraChange,
  duracionTotal,
}: SelectorDeHorarioProps) {
  const [editandoHorario, setEditandoHorario] = useState(false);

  // Si ya eligió una hora y NO está editando, mostramos la tarjeta de "Turno Seleccionado"
  if (horaSeleccionada && !editandoHorario) {
    return (
      <div className="rounded-2xl border border-secondary/40 bg-secondary/10 p-3.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-surface-lowest">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Calendar className="h-3.5 w-3.5 text-secondary" />
              <span>{fecha}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary/80 pt-0.5">
              <Clock className="h-3.5 w-3.5 text-secondary" />
              <span>
                <strong>{horaSeleccionada} hs</strong>
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditandoHorario(true)}
          className="shrink-0 rounded-full border border-secondary/50 bg-surface-lowest px-3 py-1.5 text-[11px] font-semibold text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer"
        >
          Cambiar
        </button>
      </div>
    );
  }

  // Si aún no eligió o hizo clic en "Cambiar", muestra la grilla
  const horasStr = Math.floor(duracionTotal / 60);
  const minStr = duracionTotal % 60;
  const duracionFormateada =
    horasStr > 0
      ? `${horasStr}h ${minStr > 0 ? `${minStr}m` : ''}`.trim()
      : `${minStr}m`;

  return (
    <div className="space-y-3">
      {/* Input de Fecha */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-primary/70 block">
          Fecha
        </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => {
            onFechaChange(e.target.value);
            onHoraChange(null); // Resetea la hora en null al cambiar de fecha
          }}
          className="w-full rounded-xl border border-camel/40 bg-surface-lowest px-3 py-2 text-xs font-medium text-primary outline-none focus:border-secondary"
        />
      </div>

      {/* Grilla de Horarios */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-primary/70 block">
            Horarios Disponibles
          </label>
          {horaSeleccionada && (
            <button
              type="button"
              onClick={() => setEditandoHorario(false)}
              className="text-[11px] font-semibold text-secondary hover:underline cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>

        {loadingSlots ? (
          <HorarioSlotsSkeleton />
        ) : !fecha ? (
          <div className="py-4 text-center text-xs text-primary/70">
            <p>Elegí una fecha para ver los horarios disponibles.</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="py-4 text-center text-xs text-primary/70 bg-secondary/5 rounded-xl border border-secondary/10">
            <p className="font-bold text-secondary">Sin espacio suficiente</p>
            <p className="mt-0.5">(Duración total: {duracionFormateada})</p>
            <p className="mt-2 opacity-80">
              Probá otra fecha o dividí tu reserva.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  onHoraChange(slot);
                  setEditandoHorario(false);
                }}
                className={`rounded-xl py-2 text-xs font-semibold transition-all border cursor-pointer ${
                  horaSeleccionada === slot
                    ? 'border-secondary bg-secondary text-surface-lowest shadow-xs'
                    : 'border-camel/30 bg-surface-lowest text-primary hover:border-secondary/60'
                }`}
              >
                {slot} hs
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
