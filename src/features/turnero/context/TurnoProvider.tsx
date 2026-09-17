import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase';
import type { Servicio } from '../../servicios/types';
import { crearTurno } from '../api/turnoApi';
import { fetchDisponibilidad } from '../../turnero/api/disponibilidadApi';
import { fechaADiaSemana } from '../../turnero/types';
import useCarritoStorage from '../hooks/useCarritoStorage';
import { useClienteStorage } from '../hooks/useClienteStorage';
import { useAuth } from '../../auth/context/AuthProvider';
import { useServiciosFeature } from '../../servicios/hooks/useServiciosFeature';
import { useSlotsDisponibles } from '../../turnero/hooks/useSlotsDisponibles';
import {
  TurnoContext,
  type TurnoContextValue,
  type ServicioSeleccionado,
  type TurnoConfirmadoInfo,
  useTurnoContext,
} from './TurnoContext';

export { useTurnoContext };
export type { ServicioSeleccionado, TurnoContextValue, TurnoConfirmadoInfo };

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60).toString().padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

interface Props {
  children: ReactNode;
}

export function TurnoProvider({ children }: Props) {
  const { items, agregarItem, quitarItem, limpiarCarrito } =
    useCarritoStorage();
  const {
    clienteNombreGuardado,
    clienteTelefonoGuardado,
    guardarDatosCliente,
  } = useClienteStorage();
  const { servicios } = useServiciosFeature();
  const { user, loadingAuth, iniciarSesionConGoogle, cerrarSesion, clienteData } = useAuth();

  const clienteAuthUid = user?.uid ?? null;
  const clienteEmail = user?.email ?? null;
  const clienteFotoUrl = user?.photoURL ?? null;

  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimoTurnoConfirmado, setUltimoTurnoConfirmado] =
    useState<TurnoConfirmadoInfo | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [toastTexto, setToastTexto] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const [clienteNombre, setClienteNombre] = useState(clienteNombreGuardado);
  const [clienteTelefono, setClienteTelefono] = useState(
    clienteTelefonoGuardado
  );

  useEffect(() => {
    if (clienteNombreGuardado && !clienteNombre)
      setClienteNombre(clienteNombreGuardado);
    else if (clienteData?.nombre && !clienteNombre)
      setClienteNombre(clienteData.nombre);

    if (clienteTelefonoGuardado && !clienteTelefono)
      setClienteTelefono(clienteTelefonoGuardado);
    else if (clienteData?.telefono && !clienteTelefono)
      setClienteTelefono(clienteData.telefono);
  }, [clienteNombreGuardado, clienteTelefonoGuardado, clienteData?.nombre, clienteData?.telefono]);

  useEffect(() => {
    // Si se cierra sesión, borramos la memoria interna para que no se mezcle con otra cuenta
    if (!user) {
      setClienteNombre('');
      setClienteTelefono('');
      guardarDatosCliente('', '');
    }
  }, [user]);

  const [fecha, setFechaState] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

  const setFecha = (nuevaFecha: string) => {
    setFechaState(nuevaFecha);
    setHoraSeleccionada(null);
  };

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarToast = (texto: string) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    setToastTexto(texto);
    setToastVisible(true);
    hideTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
      clearTimeoutRef.current = setTimeout(() => setToastTexto(null), 300);
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    };
  }, []);

  const seleccionados = useMemo<ServicioSeleccionado[]>(() => {
    return items
      .map((item) => {
        const servicio = servicios.find((s) => s.id === item.servicioId);
        return servicio ? { servicio, cantidad: item.cantidad } : null;
      })
      .filter((item): item is ServicioSeleccionado => item !== null);
  }, [items, servicios]);

  const duracionTotal = useMemo(
    () =>
      seleccionados.reduce(
        (acc, { servicio, cantidad }) =>
          acc + (servicio.duracion ?? 0) * cantidad,
        0
      ),
    [seleccionados]
  );

  const { slots, loading: loadingSlots } = useSlotsDisponibles(
    fecha,
    duracionTotal
  );

  const maxShiftRef = useRef<number>(1440);

  useEffect(() => {
    fetchDisponibilidad().then((disp) => {
      let max = 0;
      Object.values(disp).forEach((franjas: any) => {
        franjas.forEach((f: any) => {
          const [hInicio, mInicio] = f.inicio.split(':').map(Number);
          const [hFin, mFin] = f.fin.split(':').map(Number);
          const diff = hFin * 60 + mFin - (hInicio * 60 + mInicio);
          if (diff > max) max = diff;
        });
      });
      if (max > 0) maxShiftRef.current = max;
    });
  }, []);

  // Validación: Si la duración cambia y el horario seleccionado ya no entra, lo deseleccionamos silenciosamente.
  useEffect(() => {
    if (enviado) return;
    if (
      horaSeleccionada &&
      !loadingSlots &&
      !slots.includes(horaSeleccionada)
    ) {
      setHoraSeleccionada(null);
    }
  }, [slots, horaSeleccionada, loadingSlots, enviado]);

  const agregarServicio = (servicio: Servicio) => {
    if (duracionTotal + (servicio.duracion ?? 0) > maxShiftRef.current) {
      mostrarToast(
        'El tiempo excede nuestro mayor bloque de atención continua.'
      );
      return;
    }
    agregarItem(servicio.id);
    mostrarToast(`${servicio.nombre} agregado`);
  };

  const quitarServicio = (id: string) => {
    quitarItem(id);
  };

  const abrirCarrito = () => {
    setEnviado(false);
    setError(null);
    setUltimoTurnoConfirmado(null);
    setCarritoAbierto(true);
  };

  const cerrarCarrito = () => setCarritoAbierto(false);

  const reiniciarProceso = () => {
    setEnviado(false);
    setError(null);
    setFechaState('');
    setHoraSeleccionada(null);
    setUltimoTurnoConfirmado(null);
    limpiarCarrito();
  };

  const enviarSolicitud = async () => {
    if (seleccionados.length === 0 || !fecha || !horaSeleccionada) return;

    // Garantizamos que el usuario esté logueado
    if (!clienteAuthUid) {
      setError('Tenés que iniciar sesión para solicitar un turno.');
      return;
    }

    const nombreFinal =
      clienteNombre.trim() || user?.displayName || user?.email || 'Cliente';

    const telefonoFinal =
      clienteTelefono.trim() || clienteData?.telefono?.trim() || '';

    if (!telefonoFinal) {
      setError('Completá tu número de WhatsApp para reservar.');
      return;
    }

    setError(null);
    setEnviando(true);
    guardarDatosCliente(nombreFinal, telefonoFinal);

    try {
      const disponibilidad = await fetchDisponibilidad();
      const dia = fechaADiaSemana(fecha);
      const franjasDelDia = disponibilidad[dia];

      const horaFin = sumarMinutos(horaSeleccionada, duracionTotal);
      const serviciosConfirmados = seleccionados.map(({ servicio, cantidad }) => ({
        id: servicio.id,
        nombre:
          cantidad > 1 ? `${servicio.nombre} x${cantidad}` : servicio.nombre,
        duracion: (servicio.duracion ?? 0) * cantidad,
        precio: (servicio.precio ?? 0) * cantidad,
      }));

      await crearTurno({
        fecha,
        horaInicio: horaSeleccionada,
        clienteNombre: nombreFinal,
        clienteTelefono: telefonoFinal,
        clienteAuthUid, // Siempre existirá al llegar a este punto
        servicios: serviciosConfirmados,
        franjasDelDia,
      });

      setUltimoTurnoConfirmado({
        fecha,
        horaInicio: horaSeleccionada,
        horaFin,
        servicios: serviciosConfirmados,
      });
      setEnviado(true);
      limpiarCarrito();

      if (clienteAuthUid) {
        setDoc(
          doc(db, 'clientes', clienteAuthUid),
          {
            nombre: nombreFinal,
            telefono: telefonoFinal,
          },
          { merge: true }
        ).catch((err) => console.error('Error guardando perfil cliente en Firestore:', err));
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'SLOT_NO_DISPONIBLE') {
        setError('Ese horario se acaba de ocupar. Elegí otro, por favor.');
        setHoraSeleccionada(null);
      } else {
        setError('No pudimos guardar tu turno. Probá de nuevo en un momento.');
        console.error('Error creando turno:', err);
      }
    } finally {
      setEnviando(false);
    }
  };

  const value = useMemo<TurnoContextValue>(
    () => ({
      seleccionados,
      agregarServicio,
      quitarServicio,
      clienteNombre,
      setClienteNombre,
      clienteTelefono,
      setClienteTelefono,
      fecha,
      setFecha,
      horaSeleccionada,
      setHoraSeleccionada,
      duracionTotal,
      slots,
      loadingSlots,
      enviado,
      enviando,
      error,
      ultimoTurnoConfirmado,
      enviarSolicitud,
      reiniciarProceso,
      carritoAbierto,
      abrirCarrito,
      cerrarCarrito,
      clienteAuthUid,
      clienteEmail,
      clienteFotoUrl,
      loadingAuth,
      iniciarSesionConGoogle,
      cerrarSesion,
    }),
    [
      seleccionados,
      clienteNombre,
      clienteTelefono,
      fecha,
      horaSeleccionada,
      duracionTotal,
      slots,
      loadingSlots,
      enviado,
      enviando,
      error,
      ultimoTurnoConfirmado,
      carritoAbierto,
      clienteAuthUid,
      clienteEmail,
      clienteFotoUrl,
      loadingAuth,
    ]
  );

  return (
    <TurnoContext.Provider value={value}>
      {children}
      {toastTexto ? (
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 z-[1200] flex justify-center px-4 bottom-[calc(var(--navbar-h)+16px)] lg:bottom-6"
        >
          <span
            className={`rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-surface-lowest shadow-lg transition-all duration-300 ease-out ${
              toastVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-2 opacity-0'
            }`}
          >
            {toastTexto}
          </span>
        </div>
      ) : null}
    </TurnoContext.Provider>
  );
}
