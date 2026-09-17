import { useCallback, useEffect, useState } from 'react';
import type { Servicio } from '../types';
import { fetchServiciosAdmin } from '../api/serviciosApi';

export function useServiciosAdmin() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const data = await fetchServiciosAdmin();
    setServicios(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { servicios, loading, refetch };
}
