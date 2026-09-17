import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Phone,
  LayoutDashboard,
  User,
  LogOut,
  CalendarCheck,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import styles from './style.module.css';
import logo from '../../assets/logo.svg';
import useTheme from '../../hooks/useTheme';
import { useTurnoContext } from '../../features/turnero/context/TurnoProvider';
import { useAuth } from '../../features/auth/context/AuthProvider';
import { useSistemaConfig } from '../../hooks/useSistemaConfig';
import { ConfirmDialog } from '../shared';
import { ThemeToggle } from './ThemeToggle';
import { SITE_CONFIG } from '../../core/config';

interface HeaderProps {
  onToggleAdminMenu?: () => void;
  adminMenuOpen?: boolean;
}

export default function Header({
  onToggleAdminMenu,
  adminMenuOpen,
}: HeaderProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const {
    seleccionados,
    abrirCarrito,
    clienteAuthUid,
    clienteFotoUrl,
    clienteEmail,
    clienteNombre,
  } = useTurnoContext();
  const { esAdmin, abrirAuthModal, cerrarSesion, user } = useAuth();
  const navigate = useNavigate();
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
  const perfilRef = useRef<HTMLDivElement>(null);
  const cantidadTotal = seleccionados.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        perfilRef.current &&
        !perfilRef.current.contains(event.target as Node)
      ) {
        setMenuPerfilAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuPerfilAbierto(false);
    await cerrarSesion();
    navigate('/');
  };

  const primerNombre =
    clienteNombre.trim().split(' ')[0] ||
    user?.displayName?.split(' ')[0] ||
    'Mi Cuenta';

  return (
    <header className={styles.header}>
      <div className="flex items-center gap-2 h-full">
        {onToggleAdminMenu && (
          <button
            type="button"
            onClick={onToggleAdminMenu}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-surface-low border border-camel/40 text-primary hover:bg-secondary hover:text-white transition-colors cursor-pointer ml-3 shrink-0"
            aria-label={adminMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            title={adminMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {adminMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        )}
        <Link to="/" className={styles.logo} aria-label="Ir a Inicio">
          <img src={logo} alt={SITE_CONFIG.name} />
        </Link>
      </div>

      <nav className={styles.navGroup}>
        {/* Enlaces de Cliente: Solo visibles cuando NO es Admin */}
        {!esAdmin && (
          <>
            <div className={styles.desktopLinks}>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navPill} ${styles.active}`
                    : styles.navPill
                }
              >
                Inicio
              </NavLink>
              <NavLink
                to="/servicios"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navPill} ${styles.active}`
                    : styles.navPill
                }
              >
                Servicios
              </NavLink>
              <NavLink
                to="/wishlist"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navPill} ${styles.active}`
                    : styles.navPill
                }
              >
                Favoritos
              </NavLink>
            </div>

            <Link
              to="/contact"
              className={styles.contactBtn}
              aria-label="Contacto"
              title="Contacto"
            >
              <Phone className={styles.contactIcon} strokeWidth={2} />
              <span className={styles.contactLabel}>Contacto</span>
            </Link>
          </>
        )}

        {/* SI ES ADMIN: Muestra botón directo al Panel en Desktop o si no está en panel */}
        {esAdmin && (
          <div className="flex items-center gap-2">
            <Link
              to="/admin/agenda"
              className={`${styles.adminBtn} ${onToggleAdminMenu ? 'hidden md:flex' : ''}`}
              aria-label="Panel Admin"
              title="Panel Admin"
            >
              <LayoutDashboard className={styles.contactIcon} strokeWidth={2} />
              <span className={styles.contactLabel}>Panel Admin</span>
            </Link>
          </div>
        )}

        <ThemeToggle theme={theme} onToggle={toggleTheme} />

        {/* PERFIL / LOGIN */}
        {clienteAuthUid ? (
          <div className="relative" ref={perfilRef}>
            <button
              type="button"
              onClick={() => setMenuPerfilAbierto((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-camel/40 bg-surface-lowest px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:border-secondary hover:shadow-sm"
              aria-expanded={menuPerfilAbierto}
              aria-label="Menú de usuario"
            >
              {clienteFotoUrl ? (
                <img
                  src={clienteFotoUrl}
                  alt={primerNombre}
                  className="h-6 w-6 rounded-full object-cover border border-secondary/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/15 text-[11px] font-bold text-secondary">
                  {clienteEmail ? (
                    clienteEmail.charAt(0).toUpperCase()
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
              )}
              <span className="hidden sm:inline max-w-[100px] truncate">
                {primerNombre}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-primary/60 transition-transform ${menuPerfilAbierto ? 'rotate-180' : ''}`}
              />
            </button>

            {menuPerfilAbierto && (
              <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-camel/30 bg-surface-lowest p-1.5 shadow-xl z-[1100] animate-fadeSlideIn">
                <div className="px-3 py-2 border-b border-camel/20">
                  <p className="font-serif font-bold text-sm text-secondary truncate">
                    {clienteNombre || 'Mi Cuenta'}
                  </p>
                  <p className="text-[10px] text-primary/60 truncate">
                    {clienteEmail}
                  </p>
                </div>
                <div className="py-1">
                  {/* SI NO ES ADMIN: Muestra Mis Turnos */}
                  {!esAdmin && (
                    <Link
                      to="/mis-turnos"
                      onClick={() => setMenuPerfilAbierto(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-primary hover:bg-surface-low transition-colors"
                    >
                      <CalendarCheck className="h-4 w-4 text-secondary" />
                      Mis Turnos
                    </Link>
                  )}
                  {/* TODOS PUEDEN VER SU PERFIL */}
                  <Link
                    to="/mi-perfil"
                    onClick={() => setMenuPerfilAbierto(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-primary hover:bg-surface-low transition-colors"
                  >
                    <User className="h-4 w-4 text-secondary" />
                    Mi Perfil
                  </Link>
                </div>
                <div className="border-t border-camel/20 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-error-main hover:bg-error-bg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => abrirAuthModal('login')}
            className="flex items-center justify-center gap-1.5 rounded-full h-8 w-8 text-primary hover:bg-primary/10 sm:h-auto sm:w-auto sm:px-4 sm:py-1.5 sm:bg-secondary sm:text-surface-lowest sm:hover:bg-secondary/90 sm:shadow-sm transition-all shrink-0 text-xs font-semibold"
            title="Iniciar sesión / Registrarse"
          >
            <User className="h-5 w-5 sm:h-3.5 sm:w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Ingresar</span>
          </button>
        )}

        {/* CARRITO: Se oculta para el Admin */}
        {!esAdmin && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={abrirCarrito}
            className={styles.cartBtn}
            aria-label="Ver reserva"
            title="Ver reserva"
          >
            <CalendarCheck className="h-5 w-5" strokeWidth={2} />
            <AnimatePresence>
              {cantidadTotal > 0 && (
                <motion.span
                  key={cantidadTotal}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className={styles.cartBadge}
                >
                  {cantidadTotal}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </nav>
    </header>
  );
}
