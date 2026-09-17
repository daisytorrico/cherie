import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../core/firebase';
import type { Turno } from '../types';

export function useMisTurnos(clienteAuthUid: string | null) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si no hay UID guardado, no buscamos nada
    if (!clienteAuthUid) {
      setTurnos([]);
      return;
    }

    setLoading(true);

    const qUid = query(
      collection(db, 'turnos'),
      where('clienteAuthUid', '==', clienteAuthUid)
    );
    const unsub = onSnapshot(
      qUid,
      (snap) => {
        const lista = snap.docs.map((d) => ({
          ...(d.data() as Turno),
          id: d.id,
        }));
        lista.sort((a, b) =>
          (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio)
        );
        setTurnos(lista);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching mis turnos:', err);
        setLoading(false);
      }
    );

    return () => {
      unsub();
    };
  }, [clienteAuthUid]);

  return { turnos, loading };
}
