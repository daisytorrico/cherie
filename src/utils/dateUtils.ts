/**
 * Retorna la fecha en formato YYYY-MM-DD usando la zona horaria local del dispositivo.
 * Usar esto en lugar de `new Date().toISOString().split('T')[0]` previene errores
 * de desfase horario donde a la noche puede figurar el día siguiente por usar UTC.
 */
export function getLocalISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
