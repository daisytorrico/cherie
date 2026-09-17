import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { TurnoAdmin } from '../types/agenda';
import {
  formatearFechaLegible,
  esSlotEnPasado,
  obtenerEstiloEstado,
} from '../utils/agendaFormato';
import {
  fechaADiaSemana,
  type DisponibilidadSemanal,
} from '../../turnero/types';
import { AgendaGridSkeleton } from './AdminSkeletons';
import { Lock, XCircle } from 'lucide-react';

interface AgendaGridProps {
  diasVisibles: string[];
  HORARIOS: string[];
  turnos: TurnoAdmin[];
  disponibilidad?: DisponibilidadSemanal | null;
  loading: boolean;
  onSeleccionarTurno: (turno: TurnoAdmin) => void;
  onSlotVacio: (dia: string, hora: string) => void;
}

function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function esSlotOcupado(turnosDelDia: TurnoAdmin[], hora: string): boolean {
  const slotMin = horaAMinutos(hora);
  return turnosDelDia.some((t) => {
    if (t.estado === 'cancelado') return false;
    const inicioMin = horaAMinutos(t.horaInicio);
    const finMin = inicioMin + (t.duracionMinutos || 30);
    return slotMin >= inicioMin && slotMin < finMin;
  });
}

function esSlotFueraDeHorario(
  diaStr: string,
  hora: string,
  disponibilidad?: DisponibilidadSemanal | null
): boolean {
  if (!disponibilidad) return false;
  const diaSemana = fechaADiaSemana(diaStr);
  const franjas = disponibilidad[diaSemana] || [];
  if (franjas.length === 0) return true;

  const slotMin = horaAMinutos(hora);
  const dentroDeAlguna = franjas.some((f) => {
    const inicioMin = horaAMinutos(f.inicio);
    const finMin = horaAMinutos(f.fin);
    return slotMin >= inicioMin && slotMin < finMin;
  });

  return !dentroDeAlguna;
}

export function AgendaGrid({
  diasVisibles,
  HORARIOS,
  turnos,
  disponibilidad,
  loading,
  onSeleccionarTurno,
  onSlotVacio,
}: AgendaGridProps) {
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const checkMobile = () => setMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ALTURA_HORA_PX = mobile ? 120 : 72;
  const horaMinimaMinutos =
    HORARIOS.length > 0 ? horaAMinutos(HORARIOS[0]) : 540;

  if (loading) {
    return <AgendaGridSkeleton diasCount={diasVisibles.length} />;
  }

  const containerAnchoClase = (() => {
    if (diasVisibles.length === 1) return 'w-full';
    if (diasVisibles.length === 3) return 'w-full min-w-[550px]';
    return 'w-full min-w-[800px]';
  })();

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-camel/45 bg-surface-lowest shadow-xs">
      <div className={containerAnchoClase}>
        {/* Grilla principal */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `72px repeat(${diasVisibles.length}, minmax(0, 1fr))`,
          }}
        >
          {/* Celda superior izquierda vacía */}
          <div className="border-b border-r border-camel/40 bg-surface-low" />

          {/* Encabezados de días */}
          {diasVisibles.map((dia) => (
            <div
              key={dia}
              className="border-b border-r border-camel/40 bg-surface-lowest p-3 text-center text-xs font-bold text-primary capitalize select-none"
            >
              {formatearFechaLegible(dia, true)}
            </div>
          ))}

          {/* Columna Izquierda: Eje de Horas */}
          <div className="flex flex-col border-r border-camel/40 bg-surface-lowest sticky left-0 z-20">
            {HORARIOS.map((hora) => {
              const [h] = hora.split(':');
              return (
                <div
                  key={hora}
                  style={{ height: `${ALTURA_HORA_PX}px` }}
                  className="border-b border-camel/35 relative select-none w-full bg-surface-low"
                >
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[11px] font-bold text-primary/75 tracking-tight leading-none text-center whitespace-nowrap">
                    {hora}
                  </span>
                  <span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary/50 tracking-tight leading-none text-center whitespace-nowrap">
                    {h}:30
                  </span>
                </div>
              );
            })}
          </div>

          {/* Columnas de cada día con slots y superposición de turnos */}
          {diasVisibles.map((dia) => {
            const turnosDelDia = turnos.filter((t) => t.fecha === dia);

            return (
              <div
                key={dia}
                className="relative border-r border-camel/40 bg-surface-lowest"
                style={{ height: `${HORARIOS.length * ALTURA_HORA_PX}px` }}
              >
                {/* Celdas vacías de fondo */}
                {HORARIOS.map((hora, idx) => {
                  const [hh] = hora.split(':');
                  const hora00 = hora;
                  const hora15 = `${hh}:15`;
                  const hora30 = `${hh}:30`;
                  const hora45 = `${hh}:45`;
                  const subSlots = [hora00, hora15, hora30, hora45];

                  return (
                    <div
                      key={hora}
                      style={{
                        top: `${idx * ALTURA_HORA_PX}px`,
                        height: `${ALTURA_HORA_PX}px`,
                      }}
                      className="absolute inset-x-0 border-b border-camel/35 flex flex-col"
                    >
                      {/* Guía punteada a los 30 min */}
                      <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-camel/30 pointer-events-none" />

                      {subSlots.map((subHora) => {
                        const esPasado = esSlotEnPasado(dia, subHora);
                        const esOcupado = esSlotOcupado(turnosDelDia, subHora);
                        const esFueraHorario = esSlotFueraDeHorario(
                          dia,
                          subHora,
                          disponibilidad
                        );
                        const estaBloqueado =
                          esPasado || esOcupado || esFueraHorario;

                        if (estaBloqueado) {
                          return (
                            <div
                              key={subHora}
                              className={`h-1/4 w-full ${
                                esPasado
                                  ? 'bg-surface-low/20 opacity-30 select-none cursor-not-allowed'
                                  : esFueraHorario
                                    ? 'bg-surface-low/40 opacity-20 select-none cursor-not-allowed'
                                    : 'select-none'
                              }`}
                              title={
                                esPasado
                                  ? 'Horario ya transcurrido'
                                  : esFueraHorario
                                    ? 'Horario no laboral'
                                    : undefined
                              }
                            />
                          );
                        }

                        return (
                          <motion.button
                            key={subHora}
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onSlotVacio(dia, subHora)}
                            title={`Agendar turno manual el ${formatearFechaLegible(dia)} a las ${subHora} hs`}
                            className="w-full h-1/4 rounded-md transition-all duration-150 cursor-pointer flex items-center justify-center hover:bg-secondary/15 group relative z-1"
                          >
                            <span className="text-xl sm:text-[11px] font-extrabold text-secondary opacity-40 sm:opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all leading-none">
                              +{' '}
                              <span className="hidden sm:inline">
                                {subHora}
                              </span>
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Turnos renderizados con diseño Limpio y Sobrio */}
                {turnosDelDia.map((turno) => {
                  const minutosInicio = horaAMinutos(turno.horaInicio);
                  const offsetMinutos = minutosInicio - horaMinimaMinutos;
                  const topPx = (offsetMinutos / 60) * ALTURA_HORA_PX;
                  const alturaPx = Math.max(
                    (turno.duracionMinutos / 60) * ALTURA_HORA_PX,
                    36
                  );

                  const esBloqueo =
                    turno.clienteTelefono === '-' ||
                    turno.servicioNombre.toLowerCase().includes('bloqueo') ||
                    turno.servicioNombre.toLowerCase().includes('ocupado');

                  const estiloEstado = obtenerEstiloEstado(
                    turno.estado,
                    esBloqueo
                  );

                  if (turno.estado === 'cancelado') {
                    return (
                      <motion.button
                        key={turno.id}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => onSeleccionarTurno(turno)}
                        style={{
                          top: `${topPx + 2}px`,
                          height: `${alturaPx - 4}px`,
                        }}
                        title={`Turno Cancelado: ${turno.clienteNombre} (${turno.servicioNombre})`}
                        className="absolute inset-x-1 z-10 text-left p-1.5 px-2 rounded-xl bg-rose-100/80 dark:bg-rose-950/50 text-rose-800/80 dark:text-rose-300/80 transition-all duration-200 flex flex-col justify-start overflow-hidden cursor-pointer hover:bg-rose-200/80 dark:hover:bg-rose-900/60 shadow-xs border border-rose-200 dark:border-rose-800/50"
                      >
                        <div className="flex items-center gap-1.5 min-w-0 mb-0.5 opacity-70 line-through">
                          <XCircle className="h-2.5 w-2.5 shrink-0 text-rose-600 dark:text-rose-400" />
                          <span className="text-[10px] sm:text-xs font-bold truncate text-rose-900 dark:text-rose-200">
                            {turno.clienteNombre}
                          </span>
                        </div>
                        <div className="text-[9px] sm:text-[10px] leading-tight font-medium opacity-60 truncate pl-4 text-rose-800 dark:text-rose-300 line-through">
                          {turno.servicioNombre}
                        </div>
                      </motion.button>
                    );
                  }

                  return (
                    <motion.button
                      key={turno.id}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => onSeleccionarTurno(turno)}
                      style={{
                        top: `${topPx + 2}px`,
                        height: `${alturaPx - 4}px`,
                      }}
                      className={`absolute inset-x-1 z-10 text-left p-1.5 px-2 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-start overflow-hidden cursor-pointer ${estiloEstado.card}`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 mb-0.5">
                        {esBloqueo ? (
                          <Lock className="h-2.5 w-2.5 shrink-0 opacity-70" />
                        ) : (
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${estiloEstado.dot}`}
                          />
                        )}
                        <span className="text-[10px] sm:text-xs font-bold truncate">
                          {esBloqueo ? 'Ocupado' : turno.clienteNombre}
                        </span>
                      </div>

                      {!esBloqueo && (
                        <div className="text-[9px] sm:text-[10px] leading-tight font-medium opacity-85 truncate pl-3.5 flex items-center justify-between gap-1 w-full">
                          <span className="truncate">
                            {turno.servicioNombre}
                          </span>
                          {turno.tiempoDescanso
                            ? turno.tiempoDescanso > 0 && (
                                <span className="shrink-0 text-[8px] sm:text-[9px] bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded-sm font-bold opacity-90">
                                  +{turno.tiempoDescanso}m
                                </span>
                              )
                            : null}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
