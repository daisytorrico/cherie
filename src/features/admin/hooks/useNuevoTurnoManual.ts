import { useState, useEffect } from 'react';
import { crearTurno } from '../../turnero/api/turnoApi';
import { fetchDisponibilidad } from '../../turnero/api/disponibilidadApi';
import { fechaADiaSemana } from '../../turnero/types';
import type { Servicio } from '../../servicios/types';
import { esSlotEnPasado, calcularHoraFin } from '../utils/agendaFormato';
import { useSlotsDisponibles } from '../../turnero/hooks/useSlotsDisponibles';

interface UseNuevoTurnoManualProps {
  open: boolean;
  onClose: () => void;
  fechaInicial: string;
  horaInicial: string;
  serviciosDisponibles: Servicio[];
}

export function useNuevoTurnoManual({
  open,
  onClose,
  fechaInicial,
  horaInicial,
  serviciosDisponibles,
}: UseNuevoTurnoManualProps) {
  const [tipoRegistro, setTipoRegistro] = useState<'turno' | 'bloqueo'>(
    'turno'
  );
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteAuthUid, setClienteAuthUid] = useState<string | undefined>(
    undefined
  );
  const [serviciosIds, setServiciosIds] = useState<string[]>([]);
  const [tiempoDescanso, setTiempoDescanso] = useState('0');

  // Estados de UX para la selección de cliente
  const [modoIngresoCliente, setModoIngresoCliente] = useState<'buscar' | 'seleccionado' | 'nuevo'>('buscar');
  const [busquedaCliente, setBusquedaCliente] = useState('');

  // Autocompletado
  const [clientesDisponibles, setClientesDisponibles] = useState<any[]>([]);

  useEffect(() => {
    if (open && busquedaCliente.trim().length >= 2 && modoIngresoCliente === 'buscar') {
      const timeoutId = setTimeout(() => {
        import('../../turnero/api/clienteApi').then(
          ({ buscarClientesPorNombre }) => {
            buscarClientesPorNombre(busquedaCliente.trim()).then(
              setClientesDisponibles
            );
          }
        );
      }, 300); // debounce de 300ms
      return () => clearTimeout(timeoutId);
    } else {
      setClientesDisponibles([]);
    }
  }, [open, busquedaCliente, modoIngresoCliente]);

  // Para bloqueos de horario
  const [motivoBloqueo, setMotivoBloqueo] = useState(
    'Almuerzo / Asunto Personal'
  );
  const [duracionBloqueo, setDuracionBloqueo] = useState('60');

  const [fechaManual, setFechaManual] = useState(fechaInicial);
  const [horaManual, setHoraManual] = useState(horaInicial);
  const [guardandoManual, setGuardandoManual] = useState(false);
  const [errorManual, setErrorManual] = useState<string | null>(null);
  const [turnoCreadoExito, setTurnoCreadoExito] = useState(false);
  const [modoHoraManual, setModoHoraManual] = useState(false);

  const serviciosSeleccionados = serviciosDisponibles.filter((s) =>
    serviciosIds.includes(s.id)
  );

  const duracionServicioPura =
    serviciosSeleccionados.reduce((acc, s) => acc + (s.duracion || 30), 0) ||
    30;
  const descansoMins = Number(tiempoDescanso) || 0;
  const duracionTotalCalculada =
    tipoRegistro === 'turno'
      ? duracionServicioPura + descansoMins
      : Number(duracionBloqueo) || 60;

  const hoyISO = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  const mananaISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  const { slots: slotsDisponibles, loading: cargandoSlots } =
    useSlotsDisponibles(fechaManual, duracionTotalCalculada, 15);

  useEffect(() => {
    if (open) {
      setFechaManual(fechaInicial);
      setHoraManual(horaInicial);
      setErrorManual(null);
      setTurnoCreadoExito(false);
      setTipoRegistro('turno');
      setTiempoDescanso('0');
      setDuracionBloqueo('60');
      setModoIngresoCliente('buscar');
      setBusquedaCliente('');
      if (serviciosDisponibles.length > 0 && serviciosIds.length === 0) {
        setServiciosIds([serviciosDisponibles[0].id]);
      }
    }
  }, [open, fechaInicial, horaInicial, serviciosDisponibles]);

  useEffect(() => {
    if (!open || cargandoSlots) return;

    if (slotsDisponibles.length > 0) {
      if (!horaManual) {
        setHoraManual(slotsDisponibles[0]);
      } else if (!slotsDisponibles.includes(horaManual) && !modoHoraManual) {
        setModoHoraManual(true);
      }
    }
  }, [open, slotsDisponibles, cargandoSlots, modoHoraManual, horaManual]);

  const horaFinCalculada = horaManual
    ? calcularHoraFin(horaManual, duracionTotalCalculada)
    : '...';

  const handleCrearTurnoManual = async (e: React.FormEvent) => {
    e.preventDefault();

    if (esSlotEnPasado(fechaManual, horaManual)) {
      setErrorManual('No podés agendar en fechas u horarios que ya pasaron.');
      return;
    }

    setGuardandoManual(true);
    setErrorManual(null);

    try {
      const disponibilidad = await fetchDisponibilidad();
      const diaSemana = fechaADiaSemana(fechaManual);
      const franjasDelDia = disponibilidad[diaSemana] || [];

      if (tipoRegistro === 'turno') {
        if (
          !clienteNombre.trim() ||
          !clienteTelefono.trim() ||
          serviciosIds.length === 0
        ) {
          setErrorManual(
            'Completá todos los campos requeridos y seleccioná al menos un servicio.'
          );
          setGuardandoManual(false);
          return;
        }

        if (serviciosSeleccionados.length === 0) {
          setGuardandoManual(false);
          return;
        }

        let finalClienteAuthUid = clienteAuthUid;

        await crearTurno({
          fecha: fechaManual,
          horaInicio: horaManual,
          clienteNombre: clienteNombre.trim(),
          clienteTelefono: clienteTelefono.trim(),
          clienteAuthUid: finalClienteAuthUid || undefined,
          servicios: serviciosSeleccionados.map((s) => ({
            id: s.id,
            nombre: s.nombre,
            duracion: s.duracion || 30,
            precio: s.precio ?? 0,
          })),
          tiempoDescanso: Number(tiempoDescanso) || 0,
          franjasDelDia,
          isAdminManual: true,
        });
      } else {
        const nombreMotivo =
          motivoBloqueo.trim() || 'Horario Ocupado / Bloqueado';
        await crearTurno({
          fecha: fechaManual,
          horaInicio: horaManual,
          clienteNombre: nombreMotivo,
          clienteTelefono: '-',
          servicios: [
            {
              id: 'bloqueo_admin',
              nombre: nombreMotivo,
              duracion: Number(duracionBloqueo) || 60,
            },
          ],
          franjasDelDia,
          isAdminManual: true,
        });
      }

      setTurnoCreadoExito(true);
    } catch (err: any) {
      console.error('Error creando registro manual:', err);
      if (err?.message === 'SLOT_NO_DISPONIBLE') {
        setErrorManual(
          'Ese horario no está disponible o se superpone con otro turno.'
        );
      } else {
        setErrorManual(
          'No se pudo guardar el registro. Verificá la conexión e intentá nuevamente.'
        );
      }
    } finally {
      setGuardandoManual(false);
    }
  };

  const handleCerrarYLimpiar = () => {
    setClienteNombre('');
    setClienteTelefono('');
    setBusquedaCliente('');
    setModoIngresoCliente('buscar');
    setClienteAuthUid(undefined);
    setServiciosIds([]);
    setTurnoCreadoExito(false);
    setErrorManual(null);
    onClose();
  };

  const msgWhatsApp = encodeURIComponent(
    `¡Hola ${clienteNombre}! Te confirmamos tu turno de ${serviciosSeleccionados.map((s) => s.nombre).join(' + ') || 'tu servicio'} para el día ${fechaManual} a las ${horaManual} hs. ¡Te esperamos!`
  );

  const esHoraInvalida = esSlotEnPasado(fechaManual, horaManual);
  const sinSlotsEnFecha = !cargandoSlots && slotsDisponibles.length === 0;

  return {
    tipoRegistro,
    setTipoRegistro,
    clienteNombre,
    setClienteNombre,
    clienteTelefono,
    setClienteTelefono,
    clienteAuthUid,
    setClienteAuthUid,
    clientesDisponibles,
    modoIngresoCliente,
    setModoIngresoCliente,
    busquedaCliente,
    setBusquedaCliente,
    serviciosIds,
    setServiciosIds,
    tiempoDescanso,
    setTiempoDescanso,
    motivoBloqueo,
    setMotivoBloqueo,
    duracionBloqueo,
    setDuracionBloqueo,
    fechaManual,
    setFechaManual,
    horaManual,
    setHoraManual,
    guardandoManual,
    errorManual,
    turnoCreadoExito,
    modoHoraManual,
    setModoHoraManual,
    serviciosSeleccionados,
    duracionServicioPura,
    descansoMins,
    duracionTotalCalculada,
    slotsDisponibles,
    cargandoSlots,
    horaFinCalculada,
    handleCrearTurnoManual,
    handleCerrarYLimpiar,
    msgWhatsApp,
    esHoraInvalida,
    sinSlotsEnFecha,
    mananaISO,
    hoyISO,
  };
}
