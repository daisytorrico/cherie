import type { ServicioSeleccionado } from '../../context/TurnoProvider';
import { SelectorDeHorario } from './SelectorHorario';
import { useCategorias } from '../../../categorias/hooks/useCategorias';
import { CalendarCheck } from 'lucide-react';
import { SITE_CONFIG } from '../../../../core/config';

function sumarMinutos(hora: string, minutos: number): string {
  if (!hora) return '';
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60).toString().padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

interface Props {
  seleccionados: ServicioSeleccionado[];
  clienteNombre: string;
  setClienteNombre: (nombre: string) => void;
  clienteTelefono: string;
  setClienteTelefono: (telefono: string) => void;
  fecha: string;
  setFecha: (fecha: string) => void;
  duracionTotal: number;
  slots: string[];
  loadingSlots: boolean;
  enviado: boolean;
  enviando: boolean;
  error: string | null;
  onQuitar: (id: string) => void;
  onAgregar: (servicio: ServicioSeleccionado['servicio']) => void;
  onEnviar: () => void;
  clienteAuthUid: string | null;
  iniciarSesionConGoogle: () => Promise<void>;
  horaSeleccionada: string | null;
  setHoraSeleccionada: (hora: string | null) => void;
}

export function TurnoSummary({
  seleccionados,
  clienteNombre,
  setClienteNombre,
  clienteTelefono,
  setClienteTelefono,
  fecha,
  setFecha,
  horaSeleccionada,
  setHoraSeleccionada,
  duracionTotal,
  slots,
  loadingSlots,
  enviado,
  enviando,
  error,
  onQuitar,
  onAgregar,
  onEnviar,
  clienteAuthUid,
  iniciarSesionConGoogle,
}: Props) {
  const { categorias } = useCategorias();

  const getNombreCategoria = (id: string) => {
    const cat = categorias.find((c) => c.id === id);
    return cat ? cat.nombre : id.replace(/-/g, ' ');
  };

  if (enviado) {
    const horaFin = horaSeleccionada ? sumarMinutos(horaSeleccionada, duracionTotal) : '';
    const googleCalendarUrl = horaSeleccionada ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Turno en ${SITE_CONFIG.name} - ${seleccionados.map((s) => s.servicio.nombre).join(' + ')}`)}&dates=${fecha.replace(/-/g, '')}T${horaSeleccionada.replace(':', '')}00/${fecha.replace(/-/g, '')}T${horaFin.replace(':', '')}00&details=${encodeURIComponent(SITE_CONFIG.calendarMessage)}&location=${encodeURIComponent(SITE_CONFIG.address)}` : '#';

    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-camel bg-surface-lowest/80 p-6 shadow-sm text-center flex flex-col gap-4">
        <div>
          <h2 className="mb-3 text-2xl font-bold text-secondary">
            ¡Reserva confirmada!
          </h2>
          <p className="text-primary mb-5 font-medium">
            Tu turno para el {fecha} a las {horaSeleccionada} está confirmado. ¡Te esperamos!
          </p>
          {horaSeleccionada && (
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-blue-50 text-blue-700 px-6 py-3 text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all group mx-auto border border-blue-200 hover:border-blue-600 hover:shadow-md"
            >
              <CalendarCheck className="h-5 w-5" />
              Añadir a Google Calendar
            </a>
          )}
        </div>
        {!clienteAuthUid && (
          <div className="rounded-2xl bg-surface-low p-4 flex flex-col items-center gap-2">
            <p className="text-sm text-primary/70">
              ¿Querés ver tus turnos desde cualquier dispositivo?
            </p>
            <button
              type="button"
              onClick={iniciarSesionConGoogle}
              className="rounded-full border border-camel/40 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-secondary hover:text-white transition-colors"
            >
              Iniciar sesión con Google
            </button>
          </div>
        )}
      </div>
    );
  }

  const puedeEnviar =
    seleccionados.length > 0 &&
    !!fecha &&
    !!horaSeleccionada &&
    clienteNombre.trim() !== '' &&
    clienteTelefono.trim() !== '' &&
    !enviando;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-camel bg-surface-lowest/80 p-5 shadow-sm flex flex-col gap-5">
      <div>
        <h2 className="mb-3 text-xl font-semibold text-secondary">
          Servicios seleccionados
        </h2>
        {seleccionados.length === 0 ? (
          <p className="text-primary">No hay servicios seleccionados aún.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(
              seleccionados.reduce(
                (acc, curr) => {
                  const cat = curr.servicio.categoria || 'otros';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(curr);
                  return acc;
                },
                {} as Record<string, typeof seleccionados>
              )
            ).map(([categoriaId, items]) => (
              <div key={categoriaId} className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary ml-1">
                  {getNombreCategoria(categoriaId)}
                </h3>
                <ul className="space-y-2">
                  {items.map(({ servicio, cantidad }) => (
                    <li
                      key={servicio.id}
                      className="flex items-center justify-between rounded-2xl bg-surface-low px-3 py-2"
                    >
                      <span className="text-primary">{servicio.nombre}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onQuitar(servicio.id)}
                          aria-label={`Quitar una unidad de ${servicio.nombre}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-lowest text-sm font-semibold text-secondary"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm text-primary">
                          {cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAgregar(servicio)}
                          aria-label={`Agregar una unidad más de ${servicio.nombre}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-lowest text-sm font-semibold text-secondary"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Tu nombre</label>
          <input
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            placeholder="Nombre y apellido"
            className="rounded-2xl border border-camel px-4 py-3 outline-none focus:border-secondary bg-surface-lowest text-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">
            Tu teléfono
          </label>
          <input
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
            placeholder="11 1234 5678"
            className="rounded-2xl border border-camel px-4 py-3 outline-none focus:border-secondary bg-surface-lowest text-primary"
          />
        </div>
      </div>

      <SelectorDeHorario
        fecha={fecha}
        onFechaChange={setFecha}
        slots={slots}
        loadingSlots={loadingSlots}
        horaSeleccionada={horaSeleccionada}
        onHoraChange={setHoraSeleccionada}
        duracionTotal={duracionTotal}
      />

      {error && <p className="text-sm text-error-main font-medium">{error}</p>}

      <button
        type="button"
        onClick={onEnviar}
        disabled={!puedeEnviar}
        className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-surface-lowest disabled:opacity-60"
      >
        {enviando ? 'Reservando...' : 'Reservar turno'}
      </button>
    </div>
  );
}
