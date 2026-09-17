import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../core/firebase';
import type { Promo } from '../types';

export function usePromosAdmin() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'promos'));
      const list: Promo[] = [];
      let foundDefault = false;

      snap.forEach((doc) => {
        if (doc.id === 'default-hero') {
          foundDefault = true;
          let data = doc.data();
          // Clean up previously saved generic names to restore the true design
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

      list.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
      setPromos(list);
    } catch (err: any) {
      console.error('Error fetching promos:', err);
      setError('No se pudieron cargar las promos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const savePromo = async (
    promoData: Partial<Promo> & { imagenUrl: string }
  ) => {
    try {
      const isNew = !promoData.id;
      const id = isNew ? doc(collection(db, 'promos')).id : promoData.id!;
      const now = new Date().toISOString();

      const payload: Promo = {
        id,
        imagenUrl: promoData.imagenUrl,
        titulo: promoData.titulo || '',
        subtitulo: promoData.subtitulo || '',
        activa: promoData.activa ?? true,
        orden: promoData.orden ?? promos.length,
        actualizadoEn: now,
        creadoEn: isNew ? now : promoData.creadoEn || now,
        esSistema: promoData.esSistema || id === 'default-hero' ? true : false,
      };

      await setDoc(doc(db, 'promos', id), payload);
      await fetchPromos();
      return { success: true, id };
    } catch (err: any) {
      console.error('Error guardando promo:', err);
      return { success: false, error: err.message };
    }
  };

  const deletePromo = async (id: string) => {
    if (id === 'default-hero') {
      return {
        success: false,
        error:
          'No se puede eliminar el hero por defecto, pero puedes desactivarlo.',
      };
    }
    try {
      await deleteDoc(doc(db, 'promos', id));
      await fetchPromos();
      return { success: true };
    } catch (err: any) {
      console.error('Error eliminando promo:', err);
      return { success: false, error: err.message };
    }
  };

  const togglePromo = async (id: string, newStatus: boolean) => {
    const promo = promos.find((p) => p.id === id);
    if (!promo) return { success: false };
    return await savePromo({ ...promo, activa: newStatus });
  };

  const reorderPromos = async (orderedList: Promo[]) => {
    try {
      setPromos(orderedList);
      const batch = writeBatch(db);
      orderedList.forEach((promo, index) => {
        const ref = doc(db, 'promos', promo.id);
        batch.update(ref, { orden: index });
      });
      await batch.commit();
      return { success: true };
    } catch (err: any) {
      console.error('Error reordenando promos:', err);
      await fetchPromos();
      return { success: false, error: err.message };
    }
  };

  return {
    promos,
    loading,
    error,
    fetchPromos,
    savePromo,
    deletePromo,
    togglePromo,
    reorderPromos,
  };
}
