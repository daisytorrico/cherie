import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Lock,
} from 'lucide-react';
import { useTurnoContext } from '../../context/TurnoProvider';
import { useAuth } from '../../../auth/context/AuthProvider';
import { SelectorDeHorario } from './SelectorHorario';
import { CarritoHeader } from './cart/CarritoHeader';
import { CarritoListaItems } from './cart/CarritoListaItems';
import { CarritoContactoForm } from './cart/CarritoContactoForm';
import { CarritoFooter } from './cart/CarritoFooter';
import { SITE_CONFIG } from '../../../../core/config';

function sumarMinutos(hora: string, minutos: number): string {
  if (!hora) return '';
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60).toString().padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function ReservaFlotante() {
  const navigate = useNavigate();
  const {
    seleccionados: servicios,
    quitarServicio: onQuitar,
    agregarServicio: onAgregar,
    clienteTelefono,
    setClienteTelefono,
    fecha,
    setFecha,
    horaSeleccionada,
    setHoraSeleccionada,
    duracionTotal,
    slots,
    loadingSlots,
    carritoAbierto: abierto,
    cerrarCarrito,
    enviarSolicitud,
    reiniciarProceso,
    enviando,
    enviado,
    error,
  } = useTurnoContext();

  const { user, abrirAuthModal, clienteData } = useAuth();
  
  let googleCalendarUrl = '#';
  if (enviado && horaSeleccionada && fecha) {
    const horaFin = sumarMinutos(horaSeleccionada, duracionTotal);
    const nombresServicios = servicios.map(s => s.servicio.nombre).join(' + ');
    googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Turno en ${SITE_CONFIG.name} - ${nombresServicios}`)}&dates=${fecha.replace(/-/g, '')}T${horaSeleccionada.replace(':', '')}00/${fecha.replace(/-/g, '')}T${horaFin.replace(':', '')}00&details=${encodeURIComponent(SITE_CONFIG.calendarMessage)}&location=${encodeURIComponent(SITE_CONFIG.address)}`;
  }

  const estaLogueado = Boolean(user);
  const cantidadTotal = servicios.reduce(
    (acc: number, item) => acc + item.cantidad,
    0
  );
  const total = servicios.reduce(
    (acc: number, item) => acc + (item.servicio.precio ?? 0) * item.cantidad,
    0
  );

  const tieneTelefonoEnFirestore = Boolean(
    clienteData?.telefono && clienteData.telefono.trim().length >= 8
  );
  const telefonoEfectivo = clienteTelefono.trim() || clienteData?.telefono?.trim() || '';

  const formularioValido =
    estaLogueado &&
    telefonoEfectivo.length >= 8 &&
    !!fecha &&
    !!horaSeleccionada &&
    !enviando;

  return (
    <>
      {/* Backdrop */}
      {abierto && (
        <div
          className="fixed inset-0 z-1020 bg-black/40 transition-opacity"
          onClick={cerrarCarrito}
          aria-hidden="true"
        />
      )}

      {/* Panel Flotante: Ancho max-w-md en Mobile / max-w-3xl en Desktop */}
      <aside
        className={`fixed inset-y-0 right-0 z-1030 flex w-full max-w-md lg:max-w-3xl flex-col overflow-hidden border-l border-camel bg-surface-lowest shadow-2xl transition-transform duration-300 ease-out ${
          abierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 justify-center pt-2.5 lg:hidden">
          <div className="drag-handle" />
        </div>

        <CarritoHeader cantidadTotal={cantidadTotal} onClose={cerrarCarrito} />

        <div className="relative overflow-y-auto px-5 py-3 flex-1">
          {enviado ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center max-w-md mx-auto">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              <h4 className="font-serif text-2xl font-bold text-secondary">
                ¡Solicitud recibida!
              </h4>
              <div className="rounded-2xl border border-camel/40 bg-surface-low/50 p-4 text-sm text-primary/80 w-full space-y-1">
                <p>
                  Día: <strong>{fecha}</strong>
                </p>
                <p>
                  Horario: <strong>{horaSeleccionada} hs</strong>
                </p>
                <p className="text-xs font-semibold text-emerald-600 pt-1">
                  Estado: Confirmado
                </p>
              </div>
              <div className="rounded-2xl border border-camel/30 bg-surface-lowest p-3.5 text-xs text-primary/80 text-center w-full">
                <p>
                  ¡Tu turno ya está agendado! Podés ver los detalles o
                  cancelarlo si lo necesitás desde <strong>Mis Turnos</strong>.
                </p>
              </div>

              {horaSeleccionada && (
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-blue-600 bg-blue-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white cursor-pointer"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Agendar en Google Calendar
                </a>
              )}

              <div className="w-full space-y-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    cerrarCarrito();
                    navigate('/mis-turnos');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-secondary bg-surface-lowest px-5 py-3 text-xs font-semibold uppercase tracking-wider text-secondary shadow-sm transition-all hover:bg-secondary hover:text-surface-lowest cursor-pointer"
                >
                  Ver mis turnos
                </button>
                <button
                  type="button"
                  onClick={reiniciarProceso}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-lowest shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  + Pedir otro turno
                </button>
              </div>
            </div>
          ) : servicios.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <CalendarCheck
                className="h-12 w-12 text-primary/30"
                strokeWidth={1.5}
              />
              <p className="text-base text-primary/70 font-medium">
                Todavía no seleccionaste ningún servicio.
              </p>
              <button
                type="button"
                onClick={() => {
                  cerrarCarrito();
                  navigate('/servicios');
                }}
                className="mt-2 rounded-full bg-secondary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-surface-lowest shadow-sm hover:opacity-90 transition-transform hover:scale-105 cursor-pointer"
              >
                Ver todos los servicios
              </button>
            </div>
          ) : (
            /* LAYOUT EN 2 COLUMNAS PARA DESKTOP (lg:grid lg:grid-cols-2) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full items-start">
              {/* Columna Izquierda: Servicios seleccionados */}
              <div className="space-y-4">
                <CarritoListaItems
                  servicios={servicios}
                  onQuitar={onQuitar}
                  onAgregar={onAgregar}
                />
              </div>

              {/* Columna Derecha: Selector de horarios + Formulario */}
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-secondary/30 bg-surface-lowest p-4 space-y-3 shadow-xs">
                  <span className="block text-xs font-bold uppercase tracking-wider text-secondary">
                    Elegir Día y Horario
                  </span>
                  <SelectorDeHorario
                    fecha={fecha}
                    onFechaChange={setFecha}
                    slots={slots}
                    loadingSlots={loadingSlots}
                    horaSeleccionada={horaSeleccionada}
                    onHoraChange={setHoraSeleccionada}
                    duracionTotal={duracionTotal}
                  />
                </div>

                {!estaLogueado ? (
                  <div className="rounded-2xl border border-secondary/40 bg-secondary/10 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <Lock className="h-5 w-5 text-secondary shrink-0" />
                      <div>
                        <span className="block text-xs font-bold text-primary">
                          Iniciá sesión para solicitar
                        </span>
                        <span className="block text-[11px] text-primary/70">
                          Para guardar y confirmar tu turno.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => abrirAuthModal('login')}
                      className="shrink-0 flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-white hover:opacity-90 shadow-xs transition-transform hover:scale-105 cursor-pointer"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Ingresar
                    </button>
                  </div>
                ) : !tieneTelefonoEnFirestore ? (
                  <CarritoContactoForm
                    clienteTelefono={clienteTelefono}
                    setClienteTelefono={setClienteTelefono}
                  />
                ) : null}

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-error-bg p-2.5 text-xs font-medium text-error-main border border-error-main/30">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer constante abajo */}
        {servicios.length > 0 && !enviado ? (
          <CarritoFooter
            duracionTotal={duracionTotal}
            total={total}
            formularioValido={formularioValido}
            enviando={enviando}
            onEnviarSolicitud={enviarSolicitud}
          />
        ) : null}
      </aside>
    </>
  );
}
