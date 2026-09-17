/**
 * Formatea una duración en minutos a un texto legible.
 * Si es menor a 60 min, muestra minutos (ej: "45 min").
 * Si es igual o mayor a 60 min, muestra horas y minutos (ej: "1 h", "1 h 30 min", "2 h").
 */
export function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const horas = Math.floor(minutes / 60);
  const minsRestantes = minutes % 60;
  if (minsRestantes === 0) {
    return `${horas} h`;
  }
  return `${horas} h ${minsRestantes} min`;
}
