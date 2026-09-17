import { useEffect, useState } from 'react';
import type { Servicio } from '../types';
import { fetchServiciosPorCategoria } from '../api/serviciosApi';

export function useServiciosPorCategoria(categoriaId?: string) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoriaId) {
      setServicios([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    void fetchServiciosPorCategoria(categoriaId).then((data) => {
      if (isMounted) {
        setServicios(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [categoriaId]);

  return { servicios, loading };
}
