import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useGlobalFocus() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const id = location.state?.focusTo;
    if (!id) return;

    const interval = setInterval(() => {
      const el = document.getElementById('art-card-' + id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        el.focus?.();

        const { focusTo, ...newState } = location.state;
        navigate(`${location.pathname}${location.search}`, {
          replace: true,
          state: newState,
        });
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [location, navigate]);
}
