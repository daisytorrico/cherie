import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

import { registerSW } from 'virtual:pwa-register';

// Manejo oficial de Vite para chunks obsoletos tras un nuevo despliegue
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detectado (nueva versión desplegada):', event);
  const retryKey = 'cherie_preload_retry';
  if (!sessionStorage.getItem(retryKey)) {
    sessionStorage.setItem(retryKey, 'true');
    window.location.reload();
  }
});

// Limpieza de reintentos cuando la app inicia con éxito
window.addEventListener('load', () => {
  sessionStorage.removeItem('cherie_preload_retry');
  sessionStorage.removeItem('cherie_chunk_retry');
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Chequeo periódico de nuevas versiones cada hora
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW error:', error);
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </StrictMode>
);
