import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { useLocation } from 'react-router-dom';
import logoText from '../../../assets/logo-text.svg';
import { SITE_CONFIG } from '../../../core/config';

interface AuthModalProps {
  esAdminFlow?: boolean;
}

export function AuthModal({ esAdminFlow: propAdminFlow }: AuthModalProps) {
  const {
    modalAuthAbierto,
    modoInicialModal,
    cerrarAuthModal,
    iniciarSesionConGoogle,
    iniciarSesionConEmail,
    registrarConEmail,
    enviarLinkRecuperacion,
  } = useAuth();

  const location = useLocation();
  const esAdminFlow = propAdminFlow ?? location.pathname.startsWith('/admin');

  const [modo, setModo] = useState<'login' | 'registro' | 'olvide'>(
    modoInicialModal
  );
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    if (modalAuthAbierto) {
      setModo(modoInicialModal);
      setError(null);
      setMensajeExito(null);
      setPassword('');
      setConfirmPassword('');
      setMostrarPassword(false);
      setMostrarConfirmPassword(false);
    }
  }, [modalAuthAbierto, modoInicialModal]);

  const handleSubmitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await iniciarSesionConEmail(email, password);
    } catch (err: any) {
      if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/wrong-password'
      ) {
        setError('El email o la contraseña son incorrectos.');
      } else {
        setError('No se pudo iniciar sesión. Verificá tus datos.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleSubmitRegistro = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setCargando(true);
    try {
      await registrarConEmail(nombre.trim(), email.trim(), password);
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado. Intentá iniciar sesión.');
      } else {
        setError('No se pudo crear la cuenta. Probá con otro email.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleEnviarRecuperacion = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    setCargando(true);
    try {
      await enviarLinkRecuperacion(email.trim());
      setMensajeExito(
        'Te enviamos un enlace a tu casilla de correo para restablecer tu clave.'
      );
    } catch {
      setError(
        'No pudimos enviar el correo. Verificá que el email esté bien escrito.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <AnimatePresence>
      {modalAuthAbierto && (
        <motion.div
          key="auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={cerrarAuthModal}
          style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' }}
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/65 p-4 sm:p-6"
        >
          <motion.div
            key="auth-card"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[460px] sm:max-w-[520px] lg:max-w-[560px] overflow-hidden rounded-3xl border border-camel/40 bg-surface-lowest p-6 sm:p-9 lg:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.45)]"
          >
        <button
          type="button"
          onClick={cerrarAuthModal}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-low"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-1.5 text-center mb-6">
          {/* Logo Chérie: más grande que el saludo, con contraste óptimo en modo claro y oscuro */}
          <svg
            viewBox="0 0 130 46"
            className="h-14 sm:h-18 w-auto text-secondary transition-colors drop-shadow-sm mb-1"
            fill="currentColor"
            aria-label={SITE_CONFIG.name}
          >
            <text
              x="65"
              y="35"
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize="38"
            >
              Chérie
            </text>
          </svg>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-primary tracking-wide">
            {modo === 'login'
              ? '¡Hola de nuevo!'
              : modo === 'registro'
                ? 'Crear mi cuenta'
                : 'Recuperar clave'}
          </h2>
          {!esAdminFlow && (
            <p className="text-xs sm:text-sm text-primary/70 max-w-sm">
              {modo === 'login'
                ? 'Ingresá a tu cuenta para consultar tus reservas.'
                : modo === 'registro'
                  ? 'Registrate para guardar tus turnos y datos de contacto.'
                  : 'Escribí tu email para recibir las instrucciones.'}
            </p>
          )}
        </div>

        {/* Solo mostramos la solapa de Registro si NO es flujo de Administrador */}
        {!esAdminFlow && modo !== 'olvide' && (
          <div className="mb-6 flex rounded-full bg-surface-low p-1.5 border border-camel/30">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setError(null);
              }}
              className={`flex-1 rounded-full py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all ${
                modo === 'login'
                  ? 'bg-secondary text-surface-lowest shadow-sm'
                  : 'text-primary/70 hover:text-primary'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('registro');
                setError(null);
              }}
              className={`flex-1 rounded-full py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all ${
                modo === 'registro'
                  ? 'bg-secondary text-surface-lowest shadow-sm'
                  : 'text-primary/70 hover:text-primary'
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Solo mostramos inicio con Google si NO es flujo Admin */}
        {!esAdminFlow && modo !== 'olvide' && (
          <>
            <button
              type="button"
              onClick={iniciarSesionConGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-camel/40 bg-surface-lowest dark:bg-surface-low px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-primary shadow-sm transition-all hover:scale-[1.01] hover:border-secondary dark:hover:bg-surface-low/80"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-camel/30" />
              <span className="text-[10px] uppercase tracking-wider text-primary/60 font-semibold">
                o con tu email
              </span>
              <div className="h-px flex-1 bg-camel/30" />
            </div>
          </>
        )}

        {/* MODO LOGIN */}
        {modo === 'login' && (
          <form onSubmit={handleSubmitLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-[0.82rem] font-semibold text-primary/80">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-2xl border border-camel/40 bg-surface-lowest px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-primary outline-none focus:border-secondary"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-[0.82rem] font-semibold text-primary/80">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setModo('olvide');
                    setError(null);
                  }}
                  className="text-[11px] sm:text-xs font-semibold text-secondary hover:underline"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full rounded-2xl border border-camel/40 bg-surface-lowest px-4 sm:px-5 py-2.5 sm:py-3 pr-10 text-xs sm:text-sm text-primary outline-none focus:border-secondary"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary transition-colors"
                  aria-label={
                    mostrarPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  {mostrarPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-error-bg p-2.5 sm:p-3 text-xs sm:text-sm font-medium text-error-main border border-error-main/30">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-surface-lowest shadow-md transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {/* MODO REGISTRO (Solo para clientes) */}
        {!esAdminFlow && modo === 'registro' && (
          <form onSubmit={handleSubmitRegistro} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-[0.82rem] font-semibold text-primary/80">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Sofía Pérez"
                className="w-full rounded-2xl border border-camel/40 bg-surface-lowest px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-primary outline-none focus:border-secondary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs sm:text-[0.82rem] font-semibold text-primary/80">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-2xl border border-camel/40 bg-surface-lowest px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-primary outline-none focus:border-secondary"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-[0.82rem] font-semibold text-primary/80">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full rounded-2xl border border-camel/40 bg-surface-lowest px-4 py-2.5 sm:py-3 pr-10 text-xs sm:text-sm text-primary outline-none focus:border-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary transition-colors"
                  >
                    {mostrarPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs sm:text-[0.82rem] font-semibold text-primary/80">
                  Confirmar
                </label>
                <div className="relative">
                  <input
                    type={mostrarConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetir"
                    className="w-full rounded-2xl border border-camel/40 bg-surface-lowest px-4 py-2.5 sm:py-3 pr-10 text-xs sm:text-sm text-primary outline-none focus:border-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary transition-colors"
                  >
                    {mostrarConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-error-bg p-2.5 sm:p-3 text-xs sm:text-sm font-medium text-error-main border border-error-main/30">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={cargando}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-surface-lowest shadow-md transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {cargando ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
        )}

        {/* MODO RECUPERAR CLAVE */}
        {modo === 'olvide' && (
          <form onSubmit={handleEnviarRecuperacion} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-[0.82rem] font-semibold text-primary/80">
                Email registrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-2xl border border-camel/40 bg-surface-lowest px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-primary outline-none focus:border-secondary"
              />
            </div>
            {mensajeExito && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs sm:text-sm font-medium text-emerald-800 border border-emerald-200">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{mensajeExito}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-error-bg p-2.5 sm:p-3 text-xs sm:text-sm font-medium text-error-main border border-error-main/30">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-surface-lowest shadow-md transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setError(null);
                setMensajeExito(null);
              }}
              className="w-full text-center text-xs sm:text-sm font-semibold text-primary/60 hover:text-primary pt-2"
            >
              Volver a Iniciar Sesión
            </button>
          </form>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
