import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/cherie/sw.js', {
        scope: '/cherie/',
      })
      .then((reg) => console.log('SW registrado:', reg.scope))
      .catch((err) => console.error('SW error:', err));
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
