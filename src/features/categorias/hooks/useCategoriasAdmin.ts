import { useCallback, useEffect, useState } from 'react';
import type { Categoria } from '../../servicios/types';
import { fetchCategoriasAdmin } from '../api/categoriasApi';

export function useCategoriasAdmin() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const data = await fetchCategoriasAdmin();
    setCategorias(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { categorias, loading, refetch };
}
