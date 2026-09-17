import { useState, useEffect } from 'react';
import { useTurnoFeature } from '../hooks/useTurnoFeature';
import { useAuth } from '../../auth/context/AuthProvider';
import {
  LogOut,
  LogIn,
  Sparkles,
  User,
  Phone,
  Mail,
  Save,
  Check,
  CalendarCheck,
  Heart,
  ShieldCheck,
  Pencil,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PwaInstallPrompt } from '../../pwa/components/PwaInstallPrompt';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase';

export function PerfilPage() {
  const { esAdmin, user } = useAuth();
  const {
    clienteAuthUid,
    clienteEmail,
    clienteFotoUrl,
    iniciarSesionConGoogle,
    cerrarSesion,
    abrirCarrito,
    clienteNombre,
    setClienteNombre,
    clienteTelefono,
    setClienteTelefono,
  } = useTurnoFeature();

  const nombreMostrar = clienteNombre || user?.displayName || '';

  const [nombreForm, setNombreForm] = useState(nombreMostrar);
  const [telefonoForm, setTelefonoForm] = useState(clienteTelefono);
  const [datosGuardados, setDatosGuardados] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setNombreForm(nombreMostrar);
      setTelefonoForm(clienteTelefono);
    }
  }, [nombreMostrar, clienteTelefono, isEditing]);

  const guardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setClienteNombre(nombreForm);
    setClienteTelefono(telefonoForm);
    setDatosGuardados(true);
    setIsEditing(false);

    if (clienteAuthUid) {
      try {
        await setDoc(
          doc(db, 'clientes', clienteAuthUid),
          {
            nombre: nombreForm,
            telefono: telefonoForm,
            email: clienteEmail,
            actualizadoEn: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error guardando perfil en Firestore:', err);
      }
    }

    setTimeout(() => setDatosGuardados(false), 2500);
  };

  return (
    <div className="page-container px-4 sm:px-8 pb-12 text-primary max-w-4xl mx-auto">
      <div className="pt-6 sm:pt-8 pb-4">
        <p className="text-xs text-primary/60 font-medium uppercase tracking-wider">
          Gestión de Cuenta
        </p>
      </div>

      {/* Layout de 2 columnas en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Columna izquierda: Identidad y navegación */}
        <div className="flex flex-col gap-4">
          {/* Tarjeta de identidad */}
          <div className="rounded-3xl border border-camel/30 bg-surface-lowest p-5 shadow-xs flex flex-col items-center text-center gap-3">
            {clienteFotoUrl ? (
              <img
                src={clienteFotoUrl}
                alt="Perfil"
                className="h-16 w-16 rounded-full border-2 border-secondary/30 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15 font-serif text-2xl font-bold text-secondary">
                {clienteEmail?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-0.5 min-w-0 w-full">
              <h1 className="font-serif text-base font-bold text-secondary truncate">
                {nombreForm.trim() || 'Mi Cuenta'}
              </h1>
              <div className="flex items-center justify-center gap-1 text-[11px] text-primary/50">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{clienteEmail}</span>
              </div>
            </div>
            <div className="w-full pt-2 border-t border-camel/15">
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="h-3 w-3" />
                Cuenta verificada con Google
              </div>
            </div>
          </div>

          {/* Links rápidos */}
          {!esAdmin && (
            <div className="flex flex-col gap-2">
              <Link
                to="/mis-turnos"
                className="flex items-center gap-3 rounded-2xl border border-camel/30 bg-surface-lowest px-4 py-3 hover:border-secondary/50 transition-colors shadow-xs"
              >
                <CalendarCheck className="h-4.5 w-4.5 text-secondary shrink-0" />
                <div className="min-w-0">
                  <span className="font-serif font-bold text-sm text-secondary block">
                    Mis Turnos
                  </span>
                  <span className="text-[10px] text-primary/50">
                    Solicitudes y confirmados
                  </span>
                </div>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-3 rounded-2xl border border-camel/30 bg-surface-lowest px-4 py-3 hover:border-secondary/50 transition-colors shadow-xs"
              >
                <Heart className="h-4.5 w-4.5 text-secondary shrink-0" />
                <div className="min-w-0">
                  <span className="font-serif font-bold text-sm text-secondary block">
                    Favoritos
                  </span>
                  <span className="text-[10px] text-primary/50">
                    Servicios guardados
                  </span>
                </div>
              </Link>
            </div>
          )}

          <PwaInstallPrompt />

          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex items-center justify-center gap-2 rounded-2xl border border-camel/30 bg-surface-lowest px-4 py-3 text-xs font-semibold text-primary/60 hover:bg-error-bg hover:text-error-main hover:border-error-main/30 transition-colors shadow-xs cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>

        {/* Columna derecha: Formulario de datos */}
        <form
          onSubmit={guardarDatos}
          className="rounded-3xl border border-camel/30 bg-surface-lowest shadow-xs overflow-hidden self-start"
        >
          <div className="px-6 pt-6 pb-2 flex justify-between items-center">
            <div>
              <h2 className="font-serif text-lg font-bold text-secondary">
                Datos de Contacto
              </h2>
              <p className="text-[11px] text-primary/50 mt-0.5 leading-relaxed">
                {esAdmin 
                  ? 'Información de administrador.'
                  : 'Se usarán en tus próximas reservas.'}
              </p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-secondary/20 transition-colors cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
                Editar
              </button>
            )}
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-primary/80 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-secondary" />
                Nombre completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={nombreForm}
                  onChange={(e) => setNombreForm(e.target.value)}
                  placeholder="Ej: Sofía Pérez"
                  className="rounded-2xl border border-camel/40 bg-surface-lowest px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors"
                  required
                />
              ) : (
                <p className="text-sm text-primary font-medium px-1 py-1">{nombreMostrar || 'No especificado'}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-primary/80 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-secondary" />
                WhatsApp
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={telefonoForm}
                  onChange={(e) => setTelefonoForm(e.target.value)}
                  placeholder="Ej: 1123456789"
                  className="rounded-2xl border border-camel/40 bg-surface-lowest px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors"
                  required
                />
              ) : (
                <p className="text-sm text-primary font-medium px-1 py-1">{clienteTelefono || 'No especificado'}</p>
              )}
            </div>

            {datosGuardados && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Datos actualizados correctamente.</span>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNombreForm(nombreMostrar);
                  setTelefonoForm(clienteTelefono);
                }}
                className="flex-1 rounded-full bg-camel/10 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-camel/20 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-[2] flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-surface-lowest hover:opacity-90 transition-all shadow-sm cursor-pointer"
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
