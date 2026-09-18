import { getLocalISO } from '../../../utils/dateUtils';
import { useMemo } from 'react';
import type { TurnoAdmin } from '../types/agenda';
import {
  obtenerEstiloEstado,
  esTurnoActual,
  esTurnoPasado,
} from '../utils/agendaFormato';

interface AgendaMonthGridProps {
  fechaBase: string; // Fecha dentro del mes objetivo (YYYY-MM-DD)
  turnos: TurnoAdmin[];
  onDayNumberClick: (fecha: string) => void;
  onSeleccionarTurno: (turno: TurnoAdmin) => void;
}

export function AgendaMonthGrid({
  fechaBase,
  turnos,
  onDayNumberClick,
  onSeleccionarTurno,
}: AgendaMonthGridProps) {
  // Función para acortar la hora (ej: "09:00" -> "9h", "14:30" -> "14:30")
  const formatearHoraCorta = (horaStr: string) => {
    if (!horaStr) return '';
    const [h, m] = horaStr.split(':');
    if (m === '00') return `${parseInt(h, 10)}h`;
    return `${parseInt(h, 10)}:${m}`;
  };
  const calendar = useMemo(() => {
    const base = new Date(`${fechaBase}T00:00:00`);
    const year = base.getFullYear();
    const month = base.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay();
    if (startDayOfWeek === 0) startDayOfWeek = 7;
    const daysFromPrevMonth = startDayOfWeek - 1;

    const startDate = new Date(year, month, 1 - daysFromPrevMonth);
    const weeks: { fecha: string; esMesActual: boolean }[][] = [];

    let current = startDate;
    // 6 semanas siempre cubren cualquier mes
    for (let row = 0; row < 6; row++) {
      const week = [];
      let allNextMonth = true;
      for (let col = 0; col < 7; col++) {
        const isCurrentMonth = current.getMonth() === month;
        if (isCurrentMonth || current.getTime() <= lastDayOfMonth.getTime()) {
          allNextMonth = false;
        }
        week.push({
          fecha: getLocalISO(current),
          esMesActual: isCurrentMonth,
        });
        current.setDate(current.getDate() + 1);
      }
      if (row >= 4 && allNextMonth) {
        break; // Skip week 6 if it entirely belongs to the next month
      }
      weeks.push(week);
    }
    return weeks;
  }, [fechaBase]);

  const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Agrupar turnos por fecha
  const turnosPorFecha = useMemo(() => {
    const map: Record<string, TurnoAdmin[]> = {};
    turnos.forEach((t) => {
      if (!map[t.fecha]) map[t.fecha] = [];
      map[t.fecha].push(t);
    });
    // Ordenar por hora de inicio
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    });
    return map;
  }, [turnos]);

  const esHoy = (fechaStr: string) => {
    const hoy = getLocalISO();
    return hoy === fechaStr;
  };

  return (
    <div className="w-full flex flex-col bg-surface-lowest rounded-2xl border border-camel/45 overflow-hidden shadow-sm">
      {/* Header Días de la Semana */}
      <div className="grid grid-cols-7 border-b border-camel/40 bg-surface-low/60">
        {DIAS_SEMANA.map((dia) => (
          <div
            key={dia}
            className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-primary/75"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grilla */}
      <div className="flex flex-col flex-1 bg-camel/30 gap-[1px]">
        {calendar.map((week, weekIdx) => (
          <div
            key={weekIdx}
            className="grid grid-cols-7 flex-1 min-h-[120px] sm:min-h-[140px] bg-surface-lowest gap-[1px]"
          >
            {week.map((dia) => {
              const diaTurnos = turnosPorFecha[dia.fecha] || [];
              const hoy = esHoy(dia.fecha);

              return (
                <div
                  key={dia.fecha}
                  onClick={() => {
                    onDayNumberClick(dia.fecha);
                  }}
                  className={`relative flex flex-col p-1.5 sm:p-2 bg-surface-lowest hover:bg-surface-low/30 transition-colors cursor-pointer ${
                    !dia.esMesActual ? 'opacity-50 bg-surface-low/40' : ''
                  }`}
                >
                  {/* Número del día centrado */}
                  <div className="flex justify-center items-start mb-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDayNumberClick(dia.fecha);
                      }}
                      className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[11px] sm:text-[12px] font-semibold transition-all hover:scale-110 cursor-pointer ${
                        hoy
                          ? 'bg-secondary text-white shadow-md'
                          : 'text-primary/80 hover:bg-camel/30 hover:text-primary'
                      }`}
                    >
                      {parseInt(dia.fecha.split('-')[2], 10)}
                    </button>
                  </div>

                  {/* Turnos del día: Puntos minimalistas en mobile, texto en desktop */}
                  <div className="flex flex-row flex-wrap sm:flex-col gap-[3px] sm:gap-1 overflow-hidden sm:overflow-y-auto max-h-[90px] sm:max-h-[120px] no-scrollbar px-1 sm:px-0 mt-1 sm:mt-0 justify-center sm:justify-start">
                    {diaTurnos.map((turno) => {
                      const esBloqueo =
                        turno.clienteTelefono === '-' ||
                        turno.servicioNombre.toLowerCase().includes('bloqueo');
                      const estilos = obtenerEstiloEstado(
                        turno.estado,
                        esBloqueo
                      );

                      const turnoEsActual =
                        !esBloqueo &&
                        turno.estado !== 'cancelado' &&
                        esTurnoActual(
                          turno.fecha,
                          turno.horaInicio,
                          turno.duracionMinutos
                        );

                      const turnoEsPasado =
                        !turnoEsActual &&
                        esTurnoPasado(
                          turno.fecha,
                          turno.horaInicio,
                          turno.duracionMinutos
                        );

                      return (
                        <div
                          key={turno.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSeleccionarTurno(turno);
                          }}
                          className={`flex items-center sm:items-start gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-[1.5px] text-[7px] sm:text-[9px] leading-[1.1] cursor-pointer hover:bg-camel/15 rounded transition-all ${
                            turno.estado === 'cancelado'
                              ? 'opacity-40 line-through'
                              : turnoEsActual
                                ? 'font-bold ring-1 ring-secondary bg-secondary/15 rounded shadow-xs'
                                : turnoEsPasado
                                  ? 'opacity-55 saturate-[0.70] hover:opacity-100 hover:saturate-100'
                                  : ''
                          }`}
                          title={`${turno.horaInicio} - ${turno.clienteNombre} (${turno.servicioNombre})${turnoEsActual ? ' (En curso)' : ''}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 rounded-full shrink-0 sm:mt-[4px] ${estilos.dot} ${
                              turnoEsActual ? 'ring-2 ring-secondary ring-offset-1 animate-pulse' : ''
                            }`}
                          />
                          <div className="hidden sm:block line-clamp-2 sm:truncate break-words w-full text-left">
                            <span className="font-bold text-primary/80 tracking-tighter mr-0.5">
                              {formatearHoraCorta(turno.horaInicio)}
                            </span>
                            <span className="font-medium text-primary tracking-tighter">
                              {turno.servicioNombre}
                            </span>
                          </div>
                          {turnoEsActual && (
                            <span className="hidden sm:inline-block text-[7px] font-black uppercase text-secondary bg-secondary/20 px-1 rounded-sm ml-auto shrink-0">
                              Ahora
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
