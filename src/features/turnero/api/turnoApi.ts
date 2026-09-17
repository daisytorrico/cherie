import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../../core/firebase';
import { calcularSlots } from '../calcularSlots';
import type { Turno, ServicioEnTurno } from '../types';

const COLECCION = 'turnos';
const AGENDA_PUBLICA = 'agenda_publica';

const cacheTurnosDia = new Map<string, { data: Turno[]; timestamp: number }>();
const CACHE_TURNOS_TTL_MS = 10 * 1000; // 10 segundos de caché por fecha

export function invalidarCacheTurnosDia(fecha?: string) {
  if (fecha) {
    cacheTurnosDia.delete(fecha);
  } else {
    cacheTurnosDia.clear();
  }
}

/** 
 * Trae solo los horarios ocupados desde la colección pública.
 * Esto evita leer 'turnos' directamente y protege los datos personales (PII).
 */
export async function fetchAgendaPublicaDelDia(fecha: string): Promise<{ horaInicio: string; horaFin: string }[]> {
  const q = query(
    collection(db, AGENDA_PUBLICA),
    where('fecha', '==', fecha)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return { horaInicio: data.horaInicio, horaFin: data.horaFin };
  });
}

/** Trae turnos (confirmados y pendientes) de una fecha puntual para calcular los slots ocupados. */
export async function fetchTurnosDelDia(
  fecha: string,
  forceRefresh = false
): Promise<Turno[]> {
  const cached = cacheTurnosDia.get(fecha);
  const ahora = Date.now();
  if (
    !forceRefresh &&
    cached &&
    ahora - cached.timestamp < CACHE_TURNOS_TTL_MS
  ) {
    return cached.data;
  }

  const q = query(
    collection(db, COLECCION),
    where('fecha', '==', fecha),
    where('estado', '==', 'confirmado')
  );
  const snap = await getDocs(q);
  const resultado = snap.docs.map((d) => ({
    ...(d.data() as Turno),
    id: d.id,
  }));
  cacheTurnosDia.set(fecha, { data: resultado, timestamp: ahora });
  return resultado;
}

/** Trae turnos en un rango de fechas para la agenda del administrador. */
export async function fetchTurnosEnRango(
  fechaDesde: string,
  fechaHasta: string
): Promise<Turno[]> {
  const q = query(
    collection(db, COLECCION),
    where('fecha', '>=', fechaDesde),
    where('fecha', '<=', fechaHasta),
    orderBy('fecha', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as Turno), id: d.id }));
}

export async function fetchTurnosPorTelefono(
  telefono: string
): Promise<Turno[]> {
  const q = query(
    collection(db, COLECCION),
    where('clienteTelefono', '==', telefono)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as Turno), id: d.id }));
}

export async function fetchTurnosPorAuthUid(uid: string): Promise<Turno[]> {
  const q = query(
    collection(db, COLECCION),
    where('clienteAuthUid', '==', uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as Turno), id: d.id }));
}

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

interface CrearTurnoParams {
  fecha: string;
  horaInicio: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteAuthUid?: string;
  servicios: ServicioEnTurno[];
  tiempoDescanso?: number;
  franjasDelDia: { inicio: string; fin: string }[];
  isAdminManual?: boolean;
}

/**
 * Crea la solicitud de turno en Firestore con estado inicial 'confirmado'
 * verificando de forma atómica que el horario siga libre.
 */
export async function crearTurno(params: CrearTurnoParams): Promise<string> {
  const duracionServicios = params.servicios.reduce(
    (acc, s) => acc + s.duracion,
    0
  );
  const tiempoDescanso = params.tiempoDescanso || 0;
  const duracionTotal = duracionServicios + tiempoDescanso;
  const horaFin = sumarMinutos(params.horaInicio, duracionTotal);

  return runTransaction(db, async (transaction) => {
    // Bloqueo atómico: Leemos un documento específico para esta fecha
    const lockRef = doc(db, 'locks', params.fecha);
    await transaction.get(lockRef);

    const q = query(
      collection(db, AGENDA_PUBLICA),
      where('fecha', '==', params.fecha)
    );
    const snap = await getDocs(q);
    const ocupados = snap.docs.map((d) => {
      const data = d.data();
      return { horaInicio: data.horaInicio, horaFin: data.horaFin };
    });

    // Para reservas de administrador, usar intervalo de 15 min y permitir flexibilidad
    if (!params.isAdminManual) {
      const slotsLibres = calcularSlots(
        params.franjasDelDia,
        ocupados,
        duracionTotal,
        15,
        params.fecha
      );
      if (!slotsLibres.includes(params.horaInicio)) {
        throw new Error('SLOT_NO_DISPONIBLE');
      }
    }

    const nuevoTurno: Turno = {
      fecha: params.fecha,
      horaInicio: params.horaInicio,
      horaFin,
      clienteNombre: params.clienteNombre,
      clienteTelefono: params.clienteTelefono,
      clienteAuthUid: params.clienteAuthUid || null,
      servicios: params.servicios,
      duracionTotal,
      estado: 'confirmado',
      tiempoDescanso,
      creadoEn: new Date().toISOString(),
    } as any;

    // Registrar/actualizar al cliente en la libreta SIEMPRE (incluso manuales)
    const clientId = params.clienteAuthUid || params.clienteTelefono.replace(/[^0-9]/g, '');
    if (clientId) {
      const clienteRef = doc(db, 'clientes', clientId);
      // Usamos set con merge para no pisar notas viejas, solo actualizar datos básicos si faltan
      transaction.set(clienteRef, {
        nombre: params.clienteNombre,
        telefono: params.clienteTelefono,
        ultimoTurno: params.fecha
      }, { merge: true });
    }

    const nuevoRef = doc(collection(db, COLECCION));

    transaction.set(nuevoRef, nuevoTurno);
    
    // Escribimos en agenda_publica para ocupar el slot sin exponer PII
    const agendaRef = doc(db, AGENDA_PUBLICA, nuevoRef.id);
    transaction.set(agendaRef, {
      fecha: params.fecha,
      horaInicio: params.horaInicio,
      horaFin,
      turnoId: nuevoRef.id
    });

    // Escribimos en el candado para que cualquier otra transacción concurrente aborte y reintente
    transaction.set(
      lockRef,
      { ultimaActualizacion: new Date().toISOString() },
      { merge: true }
    );

    invalidarCacheTurnosDia(params.fecha);
    return nuevoRef.id;
  });
}

/** Cambia el estado de un turno a 'confirmado' (Usado por el Administrador). */
export async function confirmarTurnoAdmin(id: string): Promise<void> {
  const ref = doc(db, COLECCION, id);
  await updateDoc(ref, { estado: 'confirmado' });
}

export async function cancelarTurno(id: string): Promise<void> {
  const ref = doc(db, COLECCION, id);
  const agendaRef = doc(db, AGENDA_PUBLICA, id);
  await runTransaction(db, async (transaction) => {
    transaction.update(ref, {
      estado: 'cancelado',
      canceladoEn: new Date().toISOString(),
    });
    // Liberamos el slot público
    transaction.delete(agendaRef);
  });
}

export async function reactivarTurno(
  id: string,
  franjasDelDia: { inicio: string; fin: string }[]
): Promise<void> {
  const ref = doc(db, COLECCION, id);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error('TURNO_NO_ENCONTRADO');
    const turno = snap.data() as Turno;
    const q = query(
      collection(db, AGENDA_PUBLICA),
      where('fecha', '==', turno.fecha)
    );
    const otrosSnap = await getDocs(q);
    const ocupados = otrosSnap.docs
      .filter((d) => d.id !== id)
      .map((d) => {
        const data = d.data();
        return { horaInicio: data.horaInicio, horaFin: data.horaFin };
      });

    const duracionTotal = turno.servicios.reduce(
      (acc, s) => acc + s.duracion,
      0
    );
    const slotsLibres = calcularSlots(
      franjasDelDia,
      ocupados,
      duracionTotal,
      30,
      turno.fecha
    );
    if (!slotsLibres.includes(turno.horaInicio)) {
      throw new Error('SLOT_YA_OCUPADO');
    }

    transaction.update(ref, { estado: 'confirmado', canceladoEn: null });
    
    // Ocupar slot público nuevamente
    const agendaRef = doc(db, AGENDA_PUBLICA, id);
    transaction.set(agendaRef, {
      fecha: turno.fecha,
      horaInicio: turno.horaInicio,
      horaFin: turno.horaFin,
      turnoId: id
    });
  });
}
