import type { TurnoAdmin } from '../types/agenda';

export function formatearFechaLegible(
  fechaISO: string,
  corta = false
): string {
  if (!fechaISO) return '';

  const [year, month, day] = fechaISO.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);

  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];

  const nombreDia = dias[fecha.getDay()];
  const nombreMes = meses[fecha.getMonth()];

  if (corta) {
    return `${nombreDia} ${day}/${fecha.getMonth() + 1}`;
  }

  return `${nombreDia}, ${day} de ${nombreMes} ${year}`;
}

// Helper para texto comprensible de estado
export function obtenerEtiquetaEstado(
  estado: TurnoAdmin['estado']
): string {
  switch (estado) {
    case 'confirmado':
      return 'Confirmado';

    case 'en_proceso':
      return 'En Atención';

    case 'completado':
      return 'Atendido';

    case 'cancelado':
      return 'Cancelado';

    default:
      return 'Turno';
  }
}

export interface EstiloEstadoTurno {
  dot: string;
  card: string;
  tag: string;
  badge: string;
}

/** Fuente única de verdad para los colores de estado en Modo Claro y Oscuro */
export function obtenerEstiloEstado(
  estado: TurnoAdmin['estado'],
  esBloqueo = false
): EstiloEstadoTurno {
  if (esBloqueo) {
    return {
      dot: 'bg-slate-400 dark:bg-slate-500',
      card:
        'bg-slate-700 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 shadow-sm transition-colors border border-slate-900/20 dark:border-slate-600/30 rounded-xl',
      tag:
        'text-slate-700 dark:text-slate-200 bg-slate-200/70 dark:bg-slate-700/70',
      badge: 'bg-slate-200 text-slate-800 border-slate-400',
    };
  }

  switch (estado) {
    case 'confirmado':
      return {
        dot: 'bg-emerald-500 dark:bg-emerald-400',
        card:
          'bg-[#10b981] dark:bg-emerald-600 text-white hover:bg-[#059669] dark:hover:bg-emerald-700 shadow-sm transition-colors border border-emerald-600/20 dark:border-emerald-400/20 rounded-xl',
        tag:
          'text-emerald-900 dark:text-emerald-200 bg-emerald-200/80 dark:bg-emerald-900/70',
        badge:
          'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
      };

    case 'en_proceso':
      return {
        dot: 'bg-sky-500 dark:bg-sky-400',
        card:
          'bg-[#0ea5e9] dark:bg-sky-600 text-white hover:bg-[#0284c7] dark:hover:bg-sky-700 shadow-sm transition-colors border border-sky-600/20 dark:border-sky-400/20 rounded-xl',
        tag:
          'text-sky-900 dark:text-sky-200 bg-sky-200/80 dark:bg-sky-900/70',
        badge:
          'bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-200 border-sky-300 dark:border-sky-800',
      };

    case 'completado':
      return {
        dot: 'bg-slate-400 dark:bg-slate-400',
        card:
          'bg-slate-500 dark:bg-slate-700 text-white opacity-95 hover:bg-slate-600 dark:hover:bg-slate-600 shadow-sm transition-colors border border-slate-600/20 dark:border-slate-500/20 rounded-xl',
        tag:
          'text-slate-700 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-800/60',
        badge:
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      };

    case 'cancelado':
      return {
        dot: 'bg-rose-500 dark:bg-rose-400',
        card:
          'bg-[#f43f5e] dark:bg-rose-700 text-white hover:bg-[#e11d48] dark:hover:bg-rose-800 shadow-sm transition-colors opacity-95 border border-rose-600/20 dark:border-rose-500/20 rounded-xl',
        tag:
          'text-rose-900 dark:text-rose-200 bg-rose-200/80 dark:bg-rose-900/70',
        badge:
          'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800',
      };

    default:
      return {
        dot: 'bg-slate-400 dark:bg-slate-500',
        card:
          'bg-slate-700 dark:bg-slate-800 text-white shadow-sm transition-colors rounded-xl',
        tag:
          'text-slate-700 dark:text-slate-200 bg-slate-200/70 dark:bg-slate-700/70',
        badge: 'bg-slate-200 text-slate-800 border-slate-400',
      };
  }
}

/** Verifica si un slot de fecha (YYYY-MM-DD) y hora (HH:mm) ya transcurrió en el tiempo local */
export function esSlotEnPasado(
  fecha: string,
  hora: string
): boolean {
  if (!fecha || !hora) return false;

  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  const hoyStr = `${year}-${month}-${day}`;

  if (fecha < hoyStr) return true;
  if (fecha > hoyStr) return false;

  // Si es la misma fecha de hoy, comparar minutos transcurridos
  const [h, m] = hora.split(':').map(Number);

  if (isNaN(h) || isNaN(m)) return false;

  const ahoraMinutos = d.getHours() * 60 + d.getMinutes();
  const slotMinutos = h * 60 + m;

  return slotMinutos <= ahoraMinutos;
}

/** Sugiere el próximo horario disponible (redondeado a los próximos 30 min) para una fecha dada */
export function obtenerProximaHoraSugerida(
  fecha: string
): string {
  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  const hoyStr = `${year}-${month}-${day}`;

  if (fecha !== hoyStr) return '09:00';

  const horas = d.getHours();
  const mins = d.getMinutes();

  let proximaHora = horas;
  let proximaMin = 0;

  if (mins < 30) {
    proximaMin = 30;
  } else {
    proximaHora = horas + 1;
    proximaMin = 0;
  }

  if (proximaHora < 9) return '09:00';
  if (proximaHora > 20) return '19:00';

  const hh = String(proximaHora).padStart(2, '0');
  const mm = String(proximaMin).padStart(2, '0');

  return `${hh}:${mm}`;
}

/** Calcula la hora de finalización en formato HH:mm basándose en la hora de inicio y duración */
export function calcularHoraFin(
  horaInicio: string,
  duracionMinutos: number
): string {
  if (!horaInicio || !horaInicio.includes(':')) return '';

  const [h, m] = horaInicio.split(':').map(Number);

  if (isNaN(h) || isNaN(m)) return '';

  const totalMinutes =
    h * 60 + m + (duracionMinutos || 30);

  const hh = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');

  const mm = (totalMinutes % 60)
    .toString()
    .padStart(2, '0');

  return `${hh}:${mm}`;
}

/**
 * Formatea una duración en minutos a un texto legible en horas y minutos.
 * Ej: 45 -> '45 min', 140 -> '2 h 20 min'
 */
export function formatearDuracion(
  minutosTotales: number
): string {
  if (!minutosTotales || minutosTotales <= 0) {
    return '0 min';
  }

  if (minutosTotales < 60) {
    return `${minutosTotales} min`;
  }

  const horas = Math.floor(minutosTotales / 60);
  const mins = minutosTotales % 60;

  if (mins === 0) {
    return `${horas} hs`;
  }

  return `${horas} h ${mins} min`;
}