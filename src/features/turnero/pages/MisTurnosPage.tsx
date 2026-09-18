import { getLocalISO } from '../../../utils/dateUtils';
import { useState } from 'react';
import { SITE_CONFIG } from '../../../core/config';
import { useTurnoFeature } from '../hooks/useTurnoFeature';
import { useMisTurnos } from '../hooks/useMisTurnos';
import { TurnoGridSkeleton } from '../components/cliente/TurnoSkeleton';
import {
  Calendar,
  Clock,
  MessageCircle,
  CalendarCheck,
  Hourglass,
  CheckCircle2,
  XCircle,
  Sparkles,
  LogIn,
  Ban,
} from 'lucide-react';
import { formatearFechaLegible } from '../../admin/utils/agendaFormato';
import { puedeCancelarEnApp } from '../utils/cancelacion';
import { cancelarTurno } from '../api/turnoApi';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import type { Turno } from '../types';

type TabFiltro = 'activos' | 'historial';

export function MisTurnosPage() {
  const {
    clienteAuthUid,
    clienteTelefono,
    iniciarSesionConGoogle,
    abrirCarrito,
  } = useTurnoFeature();

  const { turnos, loading } = useMisTurnos(clienteAuthUid);
  const [tab, setTab] = useState<TabFiltro>('activos');
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const hoyISO = getLocalISO();

  const turnosActivos = turnos.filter(
    (t) => t.estado !== 'cancelado' && t.fecha >= hoyISO
  );
  const turnosHistorial = turnos.filter(
    (t) => t.estado === 'cancelado' || t.fecha < hoyISO
  );
  const turnosAMostrar = tab === 'activos' ? turnosActivos : turnosHistorial;

  if (!clienteAuthUid && !clienteTelefono) {
    return (
      <div className="page-container px-4 py-12 text-primary flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-camel/30 bg-surface-lowest p-8 shadow-sm flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-xl font-bold text-secondary text-center">
              Mis Reservas
            </h1>
            <p className="text-xs text-primary/70 leading-relaxed">
              Iniciá sesión para ver tus reservas.
            </p>
          </div>
          <button
            type="button"
            onClick={iniciarSesionConGoogle}
            className="flex items-center justify-center gap-2.5 w-full rounded-full bg-secondary px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-surface-lowest shadow-md transition-all hover:scale-[1.02] hover:opacity-90"
          >
            <LogIn className="h-4 w-4" />
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container px-4 py-8 text-primary max-w-3xl mx-auto">
      {/* Título y Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-secondary">
            Mis Reservas
          </h1>
          <p className="text-xs text-primary/60 mt-0.5">
            Estado de tus solicitudes de reserva
          </p>
        </div>
        <div className="inline-flex rounded-full bg-surface-low p-1 border border-camel/30 text-xs font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setTab('activos')}
            className={`rounded-full px-4 py-2 transition-all ${
              tab === 'activos'
                ? 'bg-secondary text-surface-lowest shadow-xs'
                : 'text-primary/70 hover:text-primary'
            }`}
          >
            Próximos ({turnosActivos.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('historial')}
            className={`rounded-full px-4 py-2 transition-all ${
              tab === 'historial'
                ? 'bg-secondary text-surface-lowest shadow-xs'
                : 'text-primary/70 hover:text-primary'
            }`}
          >
            Historial ({turnosHistorial.length})
          </button>
        </div>
      </div>

      {loading ? (
        <TurnoGridSkeleton count={3} />
      ) : turnosAMostrar.length === 0 ? (
        <div className="rounded-3xl border border-camel/30 bg-surface-lowest p-10 text-center flex flex-col items-center gap-4">
          <CalendarCheck className="h-12 w-12 text-secondary/40" />
          <p className="text-sm font-medium text-primary/80">
            {tab === 'activos'
              ? 'No tenés reservas activas en este momento.'
              : 'No hay registros en tu historial.'}
          </p>
          <button
            type="button"
            onClick={abrirCarrito}
            className="rounded-full bg-secondary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-surface-lowest shadow-xs hover:opacity-90 transition-transform hover:scale-105"
          >
            Pedir un turno
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {turnosAMostrar.map((turno) => {
            const esConfirmado = turno.estado === 'confirmado';
            const esCancelado = turno.estado === 'cancelado';
            const puedeCancelar = puedeCancelarEnApp(turno.fecha, turno.horaInicio);
            const msgWhatsApp = encodeURIComponent(
              `¡Hola! Quería consultar por mi turno de ${turno.servicios.map((s) => s.nombre).join(' + ')} del día ${turno.fecha} a las ${turno.horaInicio} hs.`
            );
            const msgCancelacionUrgente = encodeURIComponent(
              `¡Hola! Necesito cancelar o cambiar mi turno de ${turno.servicios.map((s) => s.nombre).join(' + ')} del día ${turno.fecha} a las ${turno.horaInicio} hs. (Faltan menos de 48 hs para la cita).`
            );

            return (
              <div
                key={turno.id}
                className="rounded-3xl border border-camel/30 bg-surface-lowest p-5 shadow-xs flex flex-col gap-4 transition-all hover:border-secondary/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-camel/20 pb-3">
                  <div className="space-y-1 flex-1 min-w-[200px]">
                    <h3 className="font-serif text-base font-bold text-secondary break-words">
                      {turno.servicios.map((s) => s.nombre).join(' + ')}
                    </h3>
                    {(() => {
                      const total = turno.servicios.reduce(
                        (sum, s) => sum + (s.precio ?? 0),
                        0
                      );
                      return total > 0 ? (
                        <p className="text-xs font-bold text-secondary">
                          ${total.toLocaleString('es-AR')}
                        </p>
                      ) : null;
                    })()}
                  </div>
                  {esConfirmado && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 self-start">
                      <CheckCircle2 className="h-3 w-3" />
                      Confirmado
                    </span>
                  )}
                  {esCancelado && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-error-bg text-error-main border border-error-main/30 shrink-0 self-start">
                      <XCircle className="h-3 w-3" />
                      Cancelado
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-primary/80">
                  <div className="flex items-center gap-2 rounded-2xl bg-surface-low/80 px-3.5 py-2 text-xs font-semibold text-primary">
                    <Calendar className="h-4 w-4 text-secondary shrink-0" />
                    <span>{formatearFechaLegible(turno.fecha)}</span>
                    <span className="text-camel/60">•</span>
                    <Clock className="h-4 w-4 text-secondary shrink-0" />
                    <span>
                      {turno.horaInicio} a {turno.horaFin} hs
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${msgWhatsApp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-camel/30 bg-surface-low px-3.5 py-2 text-[11px] font-semibold text-primary transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600 group-hover:text-white" />
                      Consultar por WhatsApp
                    </a>
                    {esConfirmado && (
                      <>
                        <a
                          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Turno en ${SITE_CONFIG.name} - ${turno.servicios.map((s) => s.nombre).join(' + ')}`)}&dates=${turno.fecha.replace(/-/g, '')}T${turno.horaInicio.replace(':', '')}00/${turno.fecha.replace(/-/g, '')}T${turno.horaFin.replace(':', '')}00&details=${encodeURIComponent(SITE_CONFIG.calendarMessage)}&location=${encodeURIComponent(SITE_CONFIG.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-camel/30 bg-surface-low px-3.5 py-2 text-[11px] font-semibold text-primary transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600"
                        >
                          <CalendarCheck className="h-3.5 w-3.5 text-blue-600 group-hover:text-white" />
                          Google Calendar
                        </a>

                        {puedeCancelar ? (
                          <button
                            type="button"
                            onClick={() => setTurnoACancelar(turno)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/70 dark:bg-rose-950/30 px-3.5 py-2 text-[11px] font-semibold text-rose-700 dark:text-rose-300 transition-all hover:bg-rose-600 hover:text-white hover:border-rose-600 cursor-pointer"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Cancelar turno
                          </button>
                        ) : (
                          <a
                            href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${msgCancelacionUrgente}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/70 dark:bg-amber-950/30 px-3.5 py-2 text-[11px] font-semibold text-amber-800 dark:text-amber-300 transition-all hover:bg-amber-600 hover:text-white hover:border-amber-600"
                            title="Faltan menos de 48 hs. Para cancelar o reprogramar, comunicate por WhatsApp."
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-amber-600 group-hover:text-white" />
                            Cancelar por WhatsApp (&lt;48h)
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(turnoACancelar)}
        titulo="¿Cancelar este turno?"
        mensaje={
          turnoACancelar
            ? `¿Confirmás la cancelación de tu turno de ${turnoACancelar.servicios.map((s) => s.nombre).join(' + ')} del ${formatearFechaLegible(turnoACancelar.fecha)} a las ${turnoACancelar.horaInicio} hs? El horario quedará disponible en la agenda.`
            : ''
        }
        confirmarTexto={cancelando ? 'Cancelando...' : 'Sí, cancelar turno'}
        cancelarTexto="No, mantener turno"
        destructivo={true}
        onConfirm={async () => {
          if (!turnoACancelar) return;
          setCancelando(true);
          try {
            await cancelarTurno(turnoACancelar.id);
          } catch (err) {
            console.error('Error cancelando turno:', err);
          } finally {
            setCancelando(false);
            setTurnoACancelar(null);
          }
        }}
        onCancel={() => setTurnoACancelar(null)}
      />
    </div>
  );
}
