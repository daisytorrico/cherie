export interface FranjaHoraria {
  inicio: string; // "09:00"
  fin: string; // "13:00"
}

export interface TurnoOcupado {
  horaInicio: string; // "10:00"
  horaFin: string; // "10:30"
}

function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutos % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function calcularHuecosLibres(
  franjas: FranjaHoraria[],
  turnosOcupados: TurnoOcupado[]
): Array<{ inicio: number; fin: number }> {
  const ocupados = turnosOcupados
    .map((t) => ({
      inicio: horaAMinutos(t.horaInicio),
      fin: horaAMinutos(t.horaFin),
    }))
    .sort((a, b) => a.inicio - b.inicio);

  const huecos: Array<{ inicio: number; fin: number }> = [];

  for (const franja of franjas) {
    let cursor = horaAMinutos(franja.inicio);
    const finFranja = horaAMinutos(franja.fin);
    const ocupadosEnFranja = ocupados.filter(
      (o) => o.fin > cursor && o.inicio < finFranja
    );

    for (const ocupado of ocupadosEnFranja) {
      if (ocupado.inicio > cursor) {
        huecos.push({
          inicio: cursor,
          fin: Math.min(ocupado.inicio, finFranja),
        });
      }
      cursor = Math.max(cursor, ocupado.fin);
    }
    if (cursor < finFranja) {
      huecos.push({ inicio: cursor, fin: finFranja });
    }
  }
  return huecos;
}

export function calcularSlots(
  franjas: FranjaHoraria[],
  turnosOcupados: TurnoOcupado[],
  duracionMinutos: number,
  intervaloMinutos: number = 30,
  fechaSeleccionada?: string
): string[] {
  if (duracionMinutos <= 0) return [];

  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hoyStr = `${year}-${month}-${day}`;

  if (fechaSeleccionada && fechaSeleccionada < hoyStr) {
    return [];
  }

  const huecos = calcularHuecosLibres(franjas, turnosOcupados);
  const slots: string[] = [];

  const esHoy = fechaSeleccionada === hoyStr;
  const ahoraMinutos = esHoy ? d.getHours() * 60 + d.getMinutes() : 0;

  for (const hueco of huecos) {
    let inicioPosible = hueco.inicio;
    while (inicioPosible + duracionMinutos <= hueco.fin) {
      if (!esHoy || inicioPosible > ahoraMinutos + 15) {
        slots.push(minutosAHora(inicioPosible));
      }
      inicioPosible += intervaloMinutos;
    }
  }
  return slots;
}
