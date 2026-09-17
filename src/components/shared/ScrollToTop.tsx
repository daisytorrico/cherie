import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // En cada cambio de ruta, scrollea al tope de la ventana
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
