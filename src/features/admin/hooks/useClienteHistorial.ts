import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../core/firebase';
import {
  obtenerClientePorUid,
  guardarNotasCliente,
} from '../../turnero/api/clienteApi';
import type { ClienteRecord } from '../../turnero/api/clienteApi';
import type { TurnoAdmin } from '../types/agenda';
import { normalizarTelefono } from '../../../utils/formatPhone';

export function useClienteHistorial(uid?: string, telefono?: string) {
  const [cliente, setCliente] = useState<ClienteRecord | null>(null);
  const [historialTurnos, setHistorialTurnos] = useState<TurnoAdmin[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardandoNotas, setGuardandoNotas] = useState(false);

  useEffect(() => {
    const fetchDatos = async () => {
      const telefonoNormalizado = normalizarTelefono(telefono || '');

      // Si no hay uid y tampoco telefono, no podemos buscar historial
      if (!uid && !telefonoNormalizado) {
        setCliente(null);
        setHistorialTurnos([]);
        return;
      }

      setCargando(true);
      try {
        const idCliente = uid || telefonoNormalizado;

        // Traer datos del cliente (notas internas)
        if (idCliente) {
          const datosCliente = await obtenerClientePorUid(idCliente);
          setCliente(datosCliente);
        } else {
          setCliente(null);
        }

        // Traer turnos históricos
        let q;
        const turnosRef = collection(db, 'turnos');

        if (uid) {
          q = query(turnosRef, where('clienteAuthUid', '==', uid)); // no podemos usar orderBy si no hay indice compuesto, evitamos orderBy aca y ordenamos local
        } else {
          q = query(turnosRef, where('clienteTelefono', '==', telefonoNormalizado));
        }

        const querySnapshot = await getDocs(q);
        const turnos = querySnapshot.docs.map(
          (doc) => ({ ...(doc.data() as Record<string, any>), id: doc.id } as TurnoAdmin)
        );

        // Ordenar descendente por fecha y hora
        turnos.sort((a, b) => {
          const dateA = new Date(`${a.fecha}T${a.horaInicio}`);
          const dateB = new Date(`${b.fecha}T${b.horaInicio}`);
          return dateB.getTime() - dateA.getTime();
        });

        setHistorialTurnos(turnos);
      } catch (error) {
        console.error('Error trayendo historial:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchDatos();
  }, [uid, telefono]);

  const guardarNotas = async (notas: string, nombre?: string) => {
    const telefonoNormalizado = normalizarTelefono(telefono || '');
    const idCliente = uid || telefonoNormalizado;
    if (!idCliente) return;

    setGuardandoNotas(true);
    try {
      await guardarNotasCliente(idCliente, notas, {
        telefono: telefonoNormalizado,
        nombre,
      });
      setCliente((prev) =>
        prev
          ? { ...prev, notasInternas: notas }
          : {
              uid: idCliente,
              notasInternas: notas,
              telefono: telefonoNormalizado,
              nombre,
            }
      );
    } catch (error) {
      console.error('Error al guardar notas', error);
    } finally {
      setGuardandoNotas(false);
    }
  };

  return {
    cliente,
    historialTurnos,
    cargando,
    guardandoNotas,
    guardarNotas,
  };
}
