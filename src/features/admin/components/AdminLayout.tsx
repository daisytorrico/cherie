import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthProvider';
import { useSistemaConfig } from '../../../hooks/useSistemaConfig';
import Header from '../../../components/header';
import {
  Calendar,
  Wrench,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ConfirmDialog } from '../../../components/shared';

export const AdminLayout: React.FC = () => {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuCollapsed, setDesktopMenuCollapsed] = useState(true);
  const [confirmLogoutAbierto, setConfirmLogoutAbierto] = useState(false);
  const [confirmToggleWebAbierto, setConfirmToggleWebAbierto] = useState(false);
  const {
    mantenimientoActivo,
    toggleMantenimiento,
    loading: cargandoSistema,
  } = useSistemaConfig();

  const handleLogout = async () => {
    await cerrarSesion();
    navigate('/admin/login', { replace: true });
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setDesktopMenuCollapsed(true);
  };
  const toggleDesktopMenu = () =>
    setDesktopMenuCollapsed(!desktopMenuCollapsed);

  const confirmarToggleMantenimiento = async () => {
    await toggleMantenimiento(!mantenimientoActivo);
    setConfirmToggleWebAbierto(false);
  };

  return (
    <div className="min-h-screen bg-surface text-primary flex flex-col pt-[var(--header-h)]">
      {/* Header oficial del proyecto con botón toggle integrado */}
      <Header
        onToggleAdminMenu={() => setMobileMenuOpen((prev) => !prev)}
        adminMenuOpen={mobileMenuOpen}
      />

      <div className="flex flex-1 relative w-full">
        {/* Sidebar Lateral de Administración */}
        <aside
          className={`fixed top-[var(--header-h)] bottom-0 left-0 z-40 bg-surface-lowest border-r border-camel/30 text-primary flex flex-col justify-between p-4 shadow-xl md:shadow-none transition-all duration-300 ease-in-out ${
            mobileMenuOpen
              ? 'translate-x-0 w-64'
              : '-translate-x-full md:translate-x-0'
          } ${desktopMenuCollapsed ? 'md:w-20' : 'md:w-64 shadow-2xl'}`}
        >
          <div>
            {/* Botón para colapsar en desktop */}
            <div
              className={`hidden md:flex mb-4 transition-all ${
                desktopMenuCollapsed ? 'justify-center' : 'justify-end'
              }`}
            >
              <button
                onClick={toggleDesktopMenu}
                className="p-1.5 rounded-xl border border-camel/30 text-primary/50 hover:bg-surface-low hover:text-primary transition-colors cursor-pointer"
                title={desktopMenuCollapsed ? 'Expandir menú' : 'Contraer menú'}
              >
                {desktopMenuCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>

            <nav className="space-y-1.5 mt-2">
              <NavLink
                to="/admin/agenda"
                onClick={closeMenu}
                title="Agenda"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-secondary text-surface-lowest shadow-sm font-bold'
                      : 'text-primary/70 hover:bg-surface-low hover:text-primary'
                  } ${desktopMenuCollapsed ? 'md:justify-center md:px-0' : ''}`
                }
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${desktopMenuCollapsed ? 'md:hidden' : 'block'}`}
                >
                  Agenda
                </span>
              </NavLink>

              <NavLink
                to="/admin/servicios"
                onClick={closeMenu}
                title="Servicios y Categorías"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-secondary text-surface-lowest shadow-sm font-bold'
                      : 'text-primary/70 hover:bg-surface-low hover:text-primary'
                  } ${desktopMenuCollapsed ? 'md:justify-center md:px-0' : ''}`
                }
              >
                <Wrench className="h-4 w-4 shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${desktopMenuCollapsed ? 'md:hidden' : 'block'}`}
                >
                  Servicios y Categorías
                </span>
              </NavLink>

              <NavLink
                to="/admin/horarios"
                onClick={closeMenu}
                title="Horarios de Atención"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-secondary text-surface-lowest shadow-sm font-bold'
                      : 'text-primary/70 hover:bg-surface-low hover:text-primary'
                  } ${desktopMenuCollapsed ? 'md:justify-center md:px-0' : ''}`
                }
              >
                <Clock className="h-4 w-4 shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${desktopMenuCollapsed ? 'md:hidden' : 'block'}`}
                >
                  Horarios de Atención
                </span>
              </NavLink>
            </nav>
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-camel/20 pt-4">
            {/* Estado de la Web */}
            <button
              type="button"
              disabled={cargandoSistema}
              onClick={() => setConfirmToggleWebAbierto(true)}
              title="Configurar estado de la web"
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                mantenimientoActivo
                  ? 'text-error-main hover:bg-error-bg'
                  : 'text-emerald-500 hover:bg-emerald-500/10'
              } ${desktopMenuCollapsed ? 'md:justify-center md:px-0' : ''}`}
            >
              <div className="shrink-0 relative flex items-center justify-center w-4 h-4">
                {cargandoSistema ? (
                  <div className="h-2 w-2 rounded-full animate-pulse bg-current/30" />
                ) : (
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${mantenimientoActivo ? 'bg-error-main' : 'bg-emerald-500'}`}
                  />
                )}
              </div>
              <span
                className={`transition-opacity duration-200 ${desktopMenuCollapsed ? 'md:hidden' : 'block'}`}
              >
                {cargandoSistema
                  ? 'Cargando...'
                  : mantenimientoActivo
                    ? 'Web Desactivada'
                    : 'Web Activa'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmLogoutAbierto(true)}
              title="Cerrar Sesión"
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider text-error-main hover:bg-error-bg transition-colors ${
                desktopMenuCollapsed ? 'md:justify-center md:px-0' : ''
              }`}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span
                className={`transition-opacity duration-200 ${desktopMenuCollapsed ? 'md:hidden' : 'block'}`}
              >
                Cerrar Sesión
              </span>
            </button>
          </div>
        </aside>

        {/* Backdrop para mobile y desktop expandido */}
        {(mobileMenuOpen || !desktopMenuCollapsed) && (
          <div
            onClick={closeMenu}
            className="fixed inset-x-0 bottom-0 top-[var(--header-h)] bg-black/40 z-30 transition-opacity duration-300"
          />
        )}

        {/* Contenedor Principal con margen fijo para no reflowear */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full transition-all duration-300 relative md:ml-20">
          <Outlet
            context={{
              mobileMenuOpen,
              toggleMobileMenu: () => setMobileMenuOpen((prev) => !prev),
            }}
          />
        </main>
      </div>

      <ConfirmDialog
        open={confirmLogoutAbierto}
        titulo="Cerrar Sesión"
        mensaje="¿Estás seguro de que deseas cerrar tu sesión actual?"
        confirmarTexto="Sí"
        destructivo={true}
        onConfirm={() => {
          setConfirmLogoutAbierto(false);
          handleLogout();
        }}
        onCancel={() => setConfirmLogoutAbierto(false)}
      />

      <ConfirmDialog
        open={confirmToggleWebAbierto}
        titulo={
          mantenimientoActivo ? 'Activar Web Pública' : 'Desactivar Web Pública'
        }
        mensaje={
          mantenimientoActivo
            ? '¿Estás seguro que deseas ACTIVAR la web pública?'
            : '¿Estás seguro que deseas DESACTIVAR la web pública? Los clientes verán una pantalla de mantenimiento.'
        }
        confirmarTexto="Sí"
        destructivo={!mantenimientoActivo}
        palabraConfirmacion={mantenimientoActivo ? undefined : 'desactivar'}
        onConfirm={confirmarToggleMantenimiento}
        onCancel={() => setConfirmToggleWebAbierto(false)}
      />
    </div>
  );
};
