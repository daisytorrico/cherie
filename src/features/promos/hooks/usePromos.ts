import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../core/firebase';
import type { Promo } from '../types';

export function usePromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      // No usamos query(where(activa)) para poder saber si el default-hero existe en la BD
      const snap = await getDocs(collection(db, 'promos'));
      let list: Promo[] = [];
      let foundDefault = false;

      snap.forEach((doc) => {
        if (doc.id === 'default-hero') {
          foundDefault = true;
          let data = doc.data();
          if (
            data.titulo === 'Hero Principal (Original)' ||
            data.titulo === 'Hero Principal'
          ) {
            data.titulo = '';
            data.subtitulo = '';
          }
          list.push({
            id: doc.id,
            ...data,
            esSistema: true,
            orden: -1,
          } as Promo);
        } else {
          list.push({ id: doc.id, ...doc.data() } as Promo);
        }
      });

      // Si no existe en la BD, significa que nunca lo editaron ni desactivaron.
      // Por defecto lo mostramos activo.
      if (!foundDefault) {
        list.push({
          id: 'default-hero',
          imagenUrl: 'default',
          titulo: '',
          subtitulo: '',
          activa: true,
          orden: -1,
          esSistema: true,
        });
      }

      // Filtramos solo las activas para el frontend público
      list = list.filter((p) => p.activa);

      list.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
      setPromos(list);
    } catch (err: any) {
      console.error('Error fetching public promos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  return { promos, loading, refetch: fetchPromos };
}
