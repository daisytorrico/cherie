import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './features/home/pages';
import Contact from './features/contact/pages';
import Layout from './layout/MainLayout';
import { AuthProvider } from './features/auth/context/AuthProvider';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { ClientProtectedRoute } from './features/auth/components/ClientProtectedRoute';
import WishlistPage from './features/wishlist/pages/WishlistPage';
import { ServiciosPage } from './features/servicios/pages/ServiciosPage';
import { PedirTurnoPage } from './features/turnero/pages/PedirTurnoPage';
import { MisTurnosPage } from './features/turnero/pages/MisTurnosPage';
import { PerfilPage } from './features/turnero/pages/PerfilPage';
import { TurnoProvider } from './features/turnero/context/TurnoProvider';

import { lazy, Suspense } from 'react';

// Módulos de Administración (carga diferida)
const AdminLayout = lazy(() =>
  import('./features/admin/components/AdminLayout').then((m) => ({
    default: m.AdminLayout,
  }))
);
const AdminLogin = lazy(() =>
  import('./features/admin/pages/AdminLogin').then((m) => ({
    default: m.AdminLogin,
  }))
);
const AgendaAdminPage = lazy(() =>
  import('./features/admin/pages/AgendaAdminPage').then((m) => ({
    default: m.AgendaAdminPage,
  }))
);
const AdminPanel = lazy(() =>
  import('./features/admin/components/AdminPanel').then((m) => ({
    default: m.AdminPanel,
  }))
);
const ConfiguracionHorarios = lazy(() =>
  import('./features/turnero/components/admin').then((m) => ({
    default: m.ConfiguracionHorarios,
  }))
);

import { OfflineToast } from './features/pwa/components/OfflineToast';
import { ScrollToTop } from './components/shared/ScrollToTop';
import { MantenimientoGuard } from './components/shared/MantenimientoGuard';

export default function App() {
  return (
    <AuthProvider>
      <TurnoProvider>
        <OfflineToast />
        <ScrollToTop />
        <Routes>
          {/* 1. RUTAS PÚBLICAS (Clientes) */}
          <Route
            element={
              <MantenimientoGuard>
                <Layout />
              </MantenimientoGuard>
            }
          >
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/pedir-turno" element={<PedirTurnoPage />} />

          {/* Rutas para clientes autenticados */}
          <Route
            path="/mis-turnos"
            element={
              <ClientProtectedRoute>
                <MisTurnosPage />
              </ClientProtectedRoute>
            }
          />
          <Route
            path="/mi-perfil"
            element={
              <ClientProtectedRoute>
                <PerfilPage />
              </ClientProtectedRoute>
            }
          />
        </Route>

        {/* 2. LOGIN ADMIN (Sin Layout de Tienda) */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={null}>
              <AdminLogin />
            </Suspense>
          }
        />

        {/* 3. RUTAS PROTEGIDAS DEL PANEL ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Suspense
                fallback={
                  <div className="flex h-screen w-full items-center justify-center bg-surface-lowest text-secondary text-sm font-semibold">
                    Cargando panel de administración...
                  </div>
                }
              >
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/agenda" replace />} />
          <Route path="agenda" element={<AgendaAdminPage />} />
          <Route path="servicios" element={<AdminPanel />} />
          <Route path="horarios" element={<ConfiguracionHorarios />} />
        </Route>

        {/* 4. REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </TurnoProvider>
    </AuthProvider>
  );
}
