import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../core/firebase';
import type { TurnoAdmin } from '../types/agenda';
import { calcularHoraFin } from '../utils/agendaFormato';

export function useAgendaTurnos(fechaDesde: string, fechaHasta: string) {
  const [turnos, setTurnos] = useState<TurnoAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'turnos'),
      where('fecha', '>=', fechaDesde),
      where('fecha', '<=', fechaHasta)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const turnosMapeados: TurnoAdmin[] = snap.docs.map((d) => {
          const data = d.data();
          const servicioNombre = Array.isArray(data.servicios)
            ? data.servicios.map((s: any) => s.nombre).join(' + ')
            : 'Servicio';
          const duracionServicios = Array.isArray(data.servicios)
            ? data.servicios.reduce(
                (acc: number, s: any) => acc + (s.duracion || 0),
                0
              )
            : 30;
          const tiempoDescanso = Number(data.tiempoDescanso) || 0;
          const duracionTotal = duracionServicios + tiempoDescanso;

          const estadoManual = data.estado as TurnoAdmin['estado'];
          let estadoCalculado: TurnoAdmin['estado'] =
            estadoManual || 'confirmado';

          if (estadoManual !== 'cancelado' && data.fecha && data.horaInicio) {
            const now = new Date();
            const [year, month, day] = data.fecha.split('-').map(Number);
            const [hours, minutes] = data.horaInicio.split(':').map(Number);
            const inicio = new Date(year, month - 1, day, hours, minutes);
            const fin = new Date(
              inicio.getTime() + (duracionTotal || 30) * 60 * 1000
            );

            if (now > fin) {
              estadoCalculado = 'completado';
            } else if (now >= inicio && now <= fin) {
              estadoCalculado = 'en_proceso';
            }
          }

          const horaFinCalculada =
            data.horaFin ||
            calcularHoraFin(data.horaInicio, duracionTotal || 30);

          return {
            id: d.id,
            clienteNombre: data.clienteNombre || 'Sin nombre',
            clienteTelefono: data.clienteTelefono || '',
            servicioNombre,
            servicios: data.servicios || [],
            fecha: data.fecha,
            horaInicio: data.horaInicio,
            horaFin: horaFinCalculada,
            duracionMinutos: duracionTotal || 30,
            tiempoDescanso,
            precioTotal: data.precioTotal || 0,
            estado: estadoCalculado,
          };
        });

        setTurnos(turnosMapeados);
        setLoading(false);
      },
      (err) => {
        console.error('Error escuchando turnos en agenda:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [fechaDesde, fechaHasta]);

  return { turnos, loading, setTurnos };
}
