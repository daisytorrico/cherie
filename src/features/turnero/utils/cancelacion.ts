export function puedeCancelarEnApp(
  fechaTurnoStr: string,
  horaInicioStr: string,
  ahora = new Date()
): boolean {
  // Construye la fecha/hora del turno
  const fechaHoraTurno = new Date(`${fechaTurnoStr}T${horaInicioStr}:00`);
  const difMilisegundos = fechaHoraTurno.getTime() - ahora.getTime();
  const difHoras = difMilisegundos / (1000 * 60 * 60);

  return difHoras >= 48;
}
