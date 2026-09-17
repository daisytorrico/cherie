// features/turnero/hooks/useSlotsDisponibles.ts
import { useEffect, useState } from 'react';
import { fetchDisponibilidad } from '../api/disponibilidadApi';
import { fetchAgendaPublicaDelDia } from '../api/turnoApi';
import { calcularSlots } from '../calcularSlots';
import { fechaADiaSemana } from '../types';

export function useSlotsDisponibles(
  fecha: string,
  duracionMinutos: number,
  intervaloMinutos: number = 15
) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fecha || duracionMinutos <= 0) {
      setSlots([]);
      return;
    }
    let activo = true;
    setLoading(true);

    Promise.all([fetchDisponibilidad(), fetchAgendaPublicaDelDia(fecha)])
      .then(([disponibilidad, turnosOcupados]) => {
        if (!activo) return;
        const dia = fechaADiaSemana(fecha);
        const franjas = disponibilidad[dia];
        // ocupados ya viene en el formato correcto desde la agenda pública
        const ocupados = turnosOcupados.map((t) => ({
          horaInicio: t.horaInicio,
          horaFin: t.horaFin,
        }));
        setSlots(
          calcularSlots(
            franjas,
            ocupados,
            duracionMinutos,
            intervaloMinutos,
            fecha
          )
        );
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [fecha, duracionMinutos, intervaloMinutos]);

  return { slots, loading };
}
