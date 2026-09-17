import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../core/firebase';

export interface SistemaConfig {
  mantenimientoActivo: boolean;
}

export function useSistemaConfig() {
  const [config, setConfig] = useState<SistemaConfig>(() => {
    try {
      const cached = localStorage.getItem('cherie_mantenimiento');
      return { mantenimientoActivo: cached === 'true' };
    } catch {
      return { mantenimientoActivo: false };
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const configRef = doc(db, 'configuracion', 'sistema');

    const unsubscribe = onSnapshot(
      configRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SistemaConfig;
          setConfig(data);
          try {
            localStorage.setItem(
              'cherie_mantenimiento',
              String(Boolean(data.mantenimientoActivo))
            );
          } catch {}
        } else {
          // Inicializar si no existe
          setConfig({ mantenimientoActivo: false });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando configuración del sistema:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleMantenimiento = async (activo: boolean) => {
    try {
      const configRef = doc(db, 'configuracion', 'sistema');
      await setDoc(configRef, { mantenimientoActivo: activo }, { merge: true });
    } catch (error) {
      console.error('Error al cambiar el estado de mantenimiento:', error);
      throw error;
    }
  };

  return {
    ...config,
    loading,
    toggleMantenimiento,
  };
}
