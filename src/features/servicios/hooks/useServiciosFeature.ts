import { useEffect, useState } from 'react';
import type { Servicio } from '../types';
import { fetchServicios } from '../api/serviciosApi';

// Este hook ahora solo trae los datos crudos. El filtrado por categoría
// vive en ServiciosScreen, derivado directamente de la URL (una sola fuente de verdad).
export function useServiciosFeature() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void fetchServicios()
      .then((data) => {
        if (isMounted) {
          setServicios(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching servicios:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { servicios, loading };
}
