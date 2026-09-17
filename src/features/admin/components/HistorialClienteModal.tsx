import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  History,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageCircle,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import type { TurnoAdmin } from '../types/agenda';
import {
  formatearFechaLegible,
  obtenerEtiquetaEstado,
  obtenerEstiloEstado,
  formatearDuracion,
} from '../utils/agendaFormato';

interface HistorialClienteModalProps {
  open: boolean;
  onClose: () => void;
  clienteNombre: string;
  clienteTelefono?: string;
  historialTurnos: TurnoAdmin[];
  cargando?: boolean;
  turnoActualId?: string;
  clienteNotas?: string;
  onGuardarNotas?: (notas: string) => Promise<void>;
  guardandoNotas?: boolean;
}

export function HistorialClienteModal({
  open,
  onClose,
  clienteNombre,
  clienteTelefono,
  historialTurnos,
  cargando = false,
  turnoActualId,
  clienteNotas,
  onGuardarNotas,
  guardandoNotas = false,
}: HistorialClienteModalProps) {
  const [editandoNotas, setEditandoNotas] = useState(false);
  const [draftNotas, setDraftNotas] = useState('');

  if (!open) return null;

  const telefonoLimpio = clienteTelefono && clienteTelefono !== '-'
    ? clienteTelefono.replace(/[^0-9]/g, '')
    : null;

  const turnosNoCancelados = historialTurnos.filter(
    (t) => t.estado !== 'cancelado'
  );
  const totalInvertido = turnosNoCancelados.reduce(
    (acc, t) => acc + (t.precioTotal || 0),
    0
  );
  const canceladosCount = historialTurnos.filter(
    (t) => t.estado === 'cancelado'
  ).length;

  return createPortal(
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-camel/30 bg-surface-lowest shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-camel/20 px-5 py-4 bg-surface-low/30 gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
              <History className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-secondary truncate">
                  {clienteNombre}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-low text-primary/70 px-2 py-0.5 rounded-full border border-camel/20 shrink-0">
                  {historialTurnos.length}{' '}
                  {historialTurnos.length === 1 ? 'visita' : 'visitas'}
                </span>
              </div>
              {clienteTelefono && clienteTelefono !== '-' && (
                <div className="flex items-center gap-3 text-xs text-primary/70 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {clienteTelefono}
                  </span>
                  {telefonoLimpio && (
                    <a
                      href={`https://wa.me/${telefonoLimpio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline"
                    >
                      <MessageCircle className="h-3 w-3" />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-primary/60 hover:text-primary hover:bg-surface-low transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar historial"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resumen de Métricas */}
        <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-camel/15 bg-surface-lowest shrink-0">
          <div className="rounded-2xl border border-camel/20 bg-surface-low/40 p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-primary/60">
              Total Citas
            </span>
            <span className="font-serif text-lg font-black text-secondary">
              {historialTurnos.length}
            </span>
          </div>

          <div className="rounded-2xl border border-camel/20 bg-surface-low/40 p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-primary/60">
              Canceladas
            </span>
            <span
              className={`font-serif text-lg font-black ${
                canceladosCount > 0 ? 'text-rose-600' : 'text-primary/70'
              }`}
            >
              {canceladosCount}
            </span>
          </div>

          <div className="rounded-2xl border border-camel/20 bg-surface-low/40 p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-primary/60">
              Total Invertido
            </span>
            <span className="font-serif text-lg font-black text-secondary">
              ${totalInvertido}
            </span>
          </div>
        </div>

        {/* Sección de Notas del Cliente */}
        {onGuardarNotas && (
          <div className="px-5 py-2.5 border-b border-camel/15 bg-surface-low/20 shrink-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[11px] uppercase tracking-wider text-primary/70 flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-secondary" />
                Notas de la clienta
              </span>
              {!editandoNotas && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftNotas(clienteNotas || '');
                    setEditandoNotas(true);
                  }}
                  className="text-[11px] font-semibold text-secondary hover:underline cursor-pointer"
                >
                  {clienteNotas ? 'Editar' : '+ Agregar nota'}
                </button>
              )}
            </div>

            {editandoNotas ? (
              <div className="space-y-2 mt-1.5">
                <textarea
                  value={draftNotas}
                  onChange={(e) => setDraftNotas(e.target.value)}
                  placeholder="Ej: Prefiere esmaltes nude, alérgica al látex, café con leche..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-camel/40 bg-surface-lowest outline-none focus:border-secondary transition-all resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditandoNotas(false)}
                    className="text-xs px-2.5 py-1 text-primary/60 hover:text-primary cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={guardandoNotas}
                    onClick={async () => {
                      await onGuardarNotas(draftNotas);
                      setEditandoNotas(false);
                    }}
                    className="text-xs font-semibold bg-secondary text-white px-3 py-1 rounded-full cursor-pointer disabled:opacity-50"
                  >
                    {guardandoNotas ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-primary/80 italic line-clamp-2">
                {clienteNotas || 'Sin notas registradas para esta clienta.'}
              </p>
            )}
          </div>
        )}

        {/* Lista de Turnos Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary/60">
              Historial cronológico de turnos
            </span>
            <span className="text-[10px] text-primary/50">
              (Más recientes primero)
            </span>
          </div>

          {cargando ? (
            <div className="py-12 text-center text-xs text-primary/60 space-y-2">
              <div className="h-6 w-6 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Cargando historial...</p>
            </div>
          ) : historialTurnos.length === 0 ? (
            <div className="py-12 text-center text-xs text-primary/60 space-y-1">
              <p className="font-semibold text-primary">
                No hay turnos registrados para esta clienta.
              </p>
              <p className="text-[11px]">
                Cuando agende o complete turnos, aparecerán detallados acá.
              </p>
            </div>
          ) : (
            historialTurnos.map((t) => {
              const esActual = t.id === turnoActualId;
              const estilo = obtenerEstiloEstado(t.estado);
              const etiqueta = obtenerEtiquetaEstado(t.estado);

              return (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-3.5 transition-all space-y-2 ${
                    esActual
                      ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/30'
                      : 'border-camel/25 bg-surface-low/30 hover:bg-surface-low/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-primary flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-secondary" />
                        {formatearFechaLegible(t.fecha)}
                      </span>
                      <span className="text-camel/60">•</span>
                      <span className="text-primary/80 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-secondary" />
                        {t.horaInicio} a {t.horaFin || '--:--'} hs
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {esActual && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary text-white px-2 py-0.5 rounded-full">
                          Turno actual
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${estilo.badge}`}
                      >
                        {etiqueta}
                      </span>
                    </div>
                  </div>

                  {/* Servicios incluidos en esa cita */}
                  <div className="flex items-start justify-between gap-3 pt-1 border-t border-camel/15">
                    <div className="space-y-1 flex-1">
                      {t.servicios && t.servicios.length > 0 ? (
                        t.servicios.map((s, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-primary flex items-center justify-between"
                          >
                            <span className="font-medium flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 text-secondary/70 shrink-0" />
                              {s.nombre}
                            </span>
                            <span className="text-primary/50 text-[11px]">
                              {s.duracion ? `${s.duracion} min` : ''}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs font-medium text-primary flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-secondary/70 shrink-0" />
                          {t.servicioNombre}
                        </div>
                      )}
                    </div>

                    {t.precioTotal > 0 && (
                      <div className="text-right shrink-0">
                        <span className="font-serif text-sm font-black text-secondary">
                          ${t.precioTotal}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-camel/20 px-5 py-3 bg-surface-low/30 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-camel/40 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-primary/80 hover:bg-surface-low transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
