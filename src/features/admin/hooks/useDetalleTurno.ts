import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase';
import type { TurnoAdmin } from '../types/agenda';
import type { Servicio } from '../../servicios/types';
import { fetchServicios } from '../../servicios/api/serviciosApi';
import { useSlotsDisponibles } from '../../turnero/hooks/useSlotsDisponibles';
import { cancelarTurno } from '../../turnero/api/turnoApi';

interface UseDetalleTurnoProps {
  turno: TurnoAdmin | null;
  onCambiarEstado: (id: string, nuevoEstado: TurnoAdmin['estado']) => void;
  serviciosProp?: Servicio[];
}

export function useDetalleTurno({
  turno,
  onCambiarEstado,
  serviciosProp,
}: UseDetalleTurnoProps) {
  const [actualizando, setActualizando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [listaServicios, setListaServicios] = useState<Servicio[]>(
    serviciosProp || []
  );

  // Form inputs state
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editFecha, setEditFecha] = useState('');
  const [editHora, setEditHora] = useState('');
  const [editServiciosIds, setEditServiciosIds] = useState<string[]>([]);
  const [editTiempoDescanso, setEditTiempoDescanso] = useState('0');
  const [errorEdit, setErrorEdit] = useState<string | null>(null);
  const [modoHoraManual, setModoHoraManual] = useState(false);

  useEffect(() => {
    if (turno) {
      setEditNombre(turno.clienteNombre || '');
      setEditTelefono(turno.clienteTelefono || '');
      setEditFecha(turno.fecha || '');
      setEditHora(turno.horaInicio || '');
      setEditTiempoDescanso(String(turno.tiempoDescanso || 0));
      setEditando(false);
    }
  }, [turno]);

  useEffect(() => {
    if (serviciosProp && serviciosProp.length > 0) {
      setListaServicios(serviciosProp);
    } else {
      fetchServicios().then(setListaServicios).catch(console.error);
    }
  }, [serviciosProp]);

  const serviciosEditSeleccionados = listaServicios.filter((s) =>
    editServiciosIds.includes(s.id)
  );
  const duracionServicioEdit =
    serviciosEditSeleccionados.reduce(
      (acc, s) => acc + (s.duracion || 30),
      0
    ) ||
    (turno
      ? Math.max(
          10,
          (turno.duracionMinutos || 30) - (turno.tiempoDescanso || 0)
        )
      : 30);
  const descansoEditNum = Number(editTiempoDescanso) || 0;
  const duracionTotalEditCalculada = duracionServicioEdit + descansoEditNum;

  const { slots: slotsDisponibles, loading: cargandoSlots } =
    useSlotsDisponibles(editFecha, duracionTotalEditCalculada, 15);

  const slotsVisibles = [...slotsDisponibles];
  if (
    turno &&
    editFecha === turno.fecha &&
    turno.horaInicio &&
    !slotsVisibles.includes(turno.horaInicio)
  ) {
    slotsVisibles.push(turno.horaInicio);
    slotsVisibles.sort();
  }

  const horaFinEditCalculada = (() => {
    if (!editHora || !editHora.includes(':')) return '--:--';
    const [h, m] = editHora.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '--:--';
    const total = h * 60 + m + duracionTotalEditCalculada;
    const hh = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const mm = (total % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  })();

  const handleIniciarEdicion = () => {
    if (!turno) return;
    setEditNombre(turno.clienteNombre);
    setEditTelefono(turno.clienteTelefono);
    setEditFecha(turno.fecha);
    setEditHora(turno.horaInicio);
    setEditServiciosIds(
      turno.servicios?.length
        ? turno.servicios.map((s) => s.id)
        : listaServicios.find((s) => s.nombre === turno.servicioNombre)?.id
          ? [listaServicios.find((s) => s.nombre === turno.servicioNombre)!.id]
          : []
    );
    setEditTiempoDescanso(String(turno.tiempoDescanso || 0));
    setErrorEdit(null);
    setEditando(true);
  };

  const handleActualizarEstadoFirestore = async (
    nuevoEstado: TurnoAdmin['estado']
  ): Promise<boolean> => {
    if (!turno) return false;
    setActualizando(true);
    setErrorEdit(null);
    try {
      if (nuevoEstado === 'cancelado') {
        await cancelarTurno(turno.id);
      } else {
        const turnoRef = doc(db, 'turnos', turno.id);
        await updateDoc(turnoRef, {
          estado: nuevoEstado,
        });
      }
      onCambiarEstado(turno.id, nuevoEstado);
      return true;
    } catch (err) {
      console.error('Error al actualizar el estado del turno:', err);
      setErrorEdit('No se pudo actualizar el estado.');
      return false;
    } finally {
      setActualizando(false);
    }
  };

  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turno) return;
    setErrorEdit(null);
    if (!editNombre.trim() || !editTelefono.trim() || !editFecha || !editHora) {
      setErrorEdit('Completá todos los campos requeridos.');
      return;
    }

    setActualizando(true);
    try {
      const turnoRef = doc(db, 'turnos', turno.id);
      const descansoNum = Number(editTiempoDescanso) || 0;

      const updateData: Record<string, any> = {
        clienteNombre: editNombre.trim(),
        clienteTelefono: editTelefono.trim(),
        fecha: editFecha,
        horaInicio: editHora,
        tiempoDescanso: descansoNum,
      };

      if (serviciosEditSeleccionados.length > 0) {
        updateData.servicios = serviciosEditSeleccionados.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          duracion: s.duracion || 30,
          precio: s.precio ?? 0,
        }));

        const precioTotal = serviciosEditSeleccionados.reduce(
          (acc, s) => acc + (s.precio || 0),
          0
        );
        if (precioTotal > 0) {
          updateData.precioTotal = precioTotal;
        }

        const [h, m] = editHora.split(':').map(Number);
        const durTotal =
          serviciosEditSeleccionados.reduce(
            (acc, s) => acc + (s.duracion || 30),
            0
          ) + descansoNum;
        const totalMins = h * 60 + m + durTotal;
        const hh = Math.floor(totalMins / 60)
          .toString()
          .padStart(2, '0');
        const mm = (totalMins % 60).toString().padStart(2, '0');
        updateData.horaFin = `${hh}:${mm}`;
      }

      await updateDoc(turnoRef, updateData);
      setEditando(false);
    } catch (err) {
      console.error('Error al actualizar datos del turno:', err);
      setErrorEdit('No se pudieron guardar los cambios.');
    } finally {
      setActualizando(false);
    }
  };

  const mensajeWhatsApp = turno
    ? encodeURIComponent(
        `Hola ${turno.clienteNombre}! Te escribimos por tu turno del día ${turno.fecha} de ${turno.horaInicio} a ${turno.horaFin || 'fin de servicio'} hs (${turno.servicioNombre}).`
      )
    : '';

  const mensajeWhatsAppCancelacion = turno
    ? encodeURIComponent(
        `Hola ${turno.clienteNombre}! Te escribimos de Chérie Beauty para avisarte que lamentablemente tuvimos que cancelar tu turno del ${turno.fecha} a las ${turno.horaInicio} hs (${turno.servicioNombre || (turno.servicios?.map((s) => s.nombre).join(' + ') || '')}). ¡Disculpá las molestias ocasionadas! Si querés reprogramarlo, avisanos por acá.`
      )
    : '';

  const esBloqueoManual = turno
    ? turno.clienteTelefono === '-' ||
      turno.servicioNombre.toLowerCase().includes('bloqueo')
    : false;
  const descansoMins = turno?.tiempoDescanso || 0;
  const durServicioPura = turno
    ? Math.max(0, (turno.duracionMinutos || 30) - descansoMins)
    : 0;

  return {
    actualizando,
    editando,
    setEditando,
    listaServicios,
    editNombre,
    setEditNombre,
    editTelefono,
    setEditTelefono,
    editFecha,
    setEditFecha,
    editHora,
    setEditHora,
    editServiciosIds,
    setEditServiciosIds,
    editTiempoDescanso,
    setEditTiempoDescanso,
    errorEdit,
    setErrorEdit,
    modoHoraManual,
    setModoHoraManual,
    slotsVisibles,
    cargandoSlots,
    horaFinEditCalculada,
    duracionTotalEditCalculada,
    duracionServicioEdit,
    descansoEditNum,
    serviciosEditSeleccionados,
    handleIniciarEdicion,
    handleActualizarEstadoFirestore,
    handleGuardarCambios,
    mensajeWhatsApp,
    mensajeWhatsAppCancelacion,
    esBloqueoManual,
    descansoMins,
    durServicioPura,
  };
}
