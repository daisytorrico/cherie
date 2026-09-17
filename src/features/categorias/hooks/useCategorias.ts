import { useEffect, useState } from 'react';
import type { Categoria } from '../../servicios/types';
import { fetchCategorias } from '../api/categoriasApi';
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void fetchCategorias()
      .then((data) => {
        if (isMounted) {
          setCategorias(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching categorias:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { categorias, loading };
}
