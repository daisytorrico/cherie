import { motion } from 'motion/react';
import {
  X,
  MessageCircle,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Ban,
  Pencil,
  Save,
  RotateCcw,
  AlertCircle,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  History,
} from 'lucide-react';
import type { TurnoAdmin } from '../types/agenda';
import {
  formatearFechaLegible,
  obtenerEtiquetaEstado,
  obtenerEstiloEstado,
  formatearDuracion,
} from '../utils/agendaFormato';
import type { Servicio } from '../../servicios/types';
import { HorarioSlotsSkeleton } from '../../turnero/components/cliente/HorarioSlotsSkeleton';
import { useDetalleTurno } from '../hooks/useDetalleTurno';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { useClienteHistorial } from '../hooks/useClienteHistorial';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { HistorialClienteModal } from './HistorialClienteModal';

interface DetalleTurnoDrawerProps {
  turno: TurnoAdmin | null;
  onClose: () => void;
  onCambiarEstado: (id: string, nuevoEstado: TurnoAdmin['estado']) => void;
  serviciosDisponibles?: Servicio[];
}

export function DetalleTurnoDrawer({
  turno,
  onClose,
  onCambiarEstado,
  serviciosDisponibles: serviciosProp,
}: DetalleTurnoDrawerProps) {
  const { categorias } = useCategorias();
  const {
    cliente,
    historialTurnos,
    cargando: cargandoHistorial,
    guardandoNotas,
    guardarNotas,
  } = useClienteHistorial(turno?.clienteAuthUid, turno?.clienteTelefono);

  const getNombreCategoria = (id: string) => {
    const cat = categorias.find((c: any) => c.id === id);
    return cat ? cat.nombre : id.replace(/-/g, ' ');
  };

  const {
    actualizando,
    editando,
    setEditando,
    listaServicios,
    editNombre,
    setEditNombre,
    editTelefono,
    setEditTelefono,
    editFecha,
    setEditFecha,
    editHora,
    setEditHora,
    editServiciosIds,
    setEditServiciosIds,
    editTiempoDescanso,
    setEditTiempoDescanso,
    errorEdit,
    modoHoraManual,
    setModoHoraManual,
    slotsVisibles,
    cargandoSlots,
    horaFinEditCalculada,
    duracionTotalEditCalculada,
    handleIniciarEdicion,
    handleActualizarEstadoFirestore,
    handleGuardarCambios,
    mensajeWhatsApp,
    mensajeWhatsAppCancelacion,
    esBloqueoManual,
  } = useDetalleTurno({ turno, onCambiarEstado, serviciosProp });

  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [notificarPorWhatsApp, setNotificarPorWhatsApp] = useState(true);
  const [cancelacionExitosa, setCancelacionExitosa] = useState(false);
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);

  if (!turno) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[1400] bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 350 }}
        className="fixed z-[1500] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl flex flex-col bg-surface-lowest sm:rounded-3xl border-0 sm:border sm:border-camel p-0 sm:p-2 shadow-2xl overflow-hidden"
      >
        {/* Header con botón de edición */}
        <div className="flex items-center justify-between border-b border-camel/20 px-5 py-4 bg-surface-low/30 gap-3">
          <h3 className="font-serif text-lg font-bold text-secondary truncate">
            {editando ? 'Editar Turno' : 'Detalle del Turno'}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {!editando && (
              <button
                type="button"
                onClick={handleIniciarEdicion}
                className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary hover:bg-secondary/20 transition-colors cursor-pointer"
                title="Editar datos del turno"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Editar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-primary/60 hover:bg-black/5 hover:text-primary transition-colors cursor-pointer"
              aria-label="Cerrar detalle"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {editando ? (
            /* VISTA EDICIÓN */
            <form onSubmit={handleGuardarCambios} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider ml-1 mb-1 block">
                    Nombre del Cliente
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none" />
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider ml-1 mb-1 block">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none" />
                    <input
                      type="tel"
                      value={editTelefono}
                      onChange={(e) => setEditTelefono(e.target.value)}
                      className="w-full rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider ml-1 mb-1 block">
                    Servicio
                  </label>
                  <div className="max-h-[50vh] overflow-y-auto w-full rounded-2xl border-none bg-surface-low/50 p-2 space-y-1">
                    {Object.entries(
                      listaServicios.reduce(
                        (acc, s) => {
                          const cat = s.categoria || 'otros';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(s);
                          return acc;
                        },
                        {} as Record<string, typeof listaServicios>
                      )
                    ).map(([categoriaId, servicios]) => (
                      <div key={categoriaId} className="mb-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 ml-1">
                          {getNombreCategoria(categoriaId)}
                        </h4>
                        {servicios.map((s) => (
                          <label
                            key={s.id}
                            className="flex items-center gap-3 p-2 hover:bg-surface-low rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={editServiciosIds.includes(s.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditServiciosIds([
                                    ...editServiciosIds,
                                    s.id,
                                  ]);
                                } else {
                                  setEditServiciosIds(
                                    editServiciosIds.filter((id) => id !== s.id)
                                  );
                                }
                              }}
                              className="w-4 h-4 text-secondary rounded border-camel/40 focus:ring-secondary/40"
                            />
                            <span className="text-sm text-primary flex-1">
                              {s.nombre}
                            </span>
                            <span className="text-xs font-bold text-primary/60">
                              {s.duracion || 30} min
                            </span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider ml-1 mb-1 block">
                    Tiempo de Descanso
                  </label>
                  <select
                    value={editTiempoDescanso}
                    onChange={(e) => setEditTiempoDescanso(e.target.value)}
                    className="w-full rounded-2xl border-none bg-surface-low/50 px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="0">Sin descanso posterior (0 min)</option>
                    <option value="10">+10 min de descanso</option>
                    <option value="15">+15 min de descanso</option>
                    <option value="20">+20 min de descanso</option>
                    <option value="30">+30 min de descanso</option>
                    <option value="45">+45 min de descanso</option>
                    <option value="60">+60 min de descanso</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider ml-1 mb-1 block">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                    className="w-full rounded-2xl border-none bg-surface-low/50 px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider ml-1 mb-1 block">
                    Horarios Disponibles
                  </label>
                  {editHora && (
                    <span className="text-[11px] font-bold text-secondary">
                      Seleccionado: {editHora} hs
                    </span>
                  )}
                </div>

                {cargandoSlots ? (
                  <HorarioSlotsSkeleton />
                ) : slotsVisibles.length === 0 ? (
                  <p className="text-xs text-primary/60 py-2">
                    No hay horarios disponibles para esta fecha.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {!modoHoraManual && slotsVisibles.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                        {slotsVisibles.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setEditHora(slot)}
                            className={`rounded-xl py-2 text-xs font-semibold transition-all border cursor-pointer ${
                              editHora === slot
                                ? 'border-secondary bg-secondary text-white shadow-xs'
                                : 'border-camel/30 bg-surface-lowest text-primary hover:border-secondary/60'
                            }`}
                          >
                            {slot} hs
                          </button>
                        ))}
                      </div>
                    )}

                    {!modoHoraManual ? (
                      <button
                        type="button"
                        onClick={() => setModoHoraManual(true)}
                        className="w-full text-xs underline text-primary/70 hover:text-secondary cursor-pointer"
                      >
                        ¿El horario que buscas no está en la lista? Ingresar
                        hora exacta
                      </button>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <input
                          type="time"
                          value={editHora}
                          onChange={(e) => setEditHora(e.target.value)}
                          className="flex-1 w-full rounded-2xl border-none bg-surface-low/50 px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                          required
                        />
                        {slotsVisibles.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setModoHoraManual(false)}
                            className="text-xs underline text-primary/70 hover:text-secondary cursor-pointer shrink-0"
                          >
                            Volver a la lista
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Resumen Minimalista */}
              <div className="flex items-center justify-between bg-surface-low/30 rounded-2xl p-4 border border-camel/30">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-0.5">
                    Finalización Estimada
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-2xl font-black text-secondary">
                      {horaFinEditCalculada || '--:--'}
                    </span>
                    <span className="text-sm font-bold text-primary/60">
                      hs
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-0.5">
                    Tiempo Total
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    {formatearDuracion(duracionTotalEditCalculada)}
                  </span>
                </div>
              </div>
              {errorEdit && (
                <div className="flex items-center gap-2 rounded-xl bg-error-bg p-2.5 text-xs font-medium text-error-main border border-error-main/30">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorEdit}</span>
                </div>
              )}

              <div className="pt-3 border-t border-camel/20 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={actualizando}
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {actualizando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  disabled={actualizando}
                  onClick={() => setEditando(false)}
                  className="w-full rounded-xl border border-camel/40 py-2.5 text-xs font-semibold text-primary/70 hover:bg-surface-low transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Cancelar Edición
                </button>
              </div>
            </form>
          ) : (
            /* VISTA DETALLE Y ACCIONES */
            <>
              {/* Badge con texto legible del estado */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                    obtenerEstiloEstado(turno.estado, esBloqueoManual).badge
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current shrink-0" />
                  {esBloqueoManual ? (
                    <span className="inline-flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Horario Ocupado
                    </span>
                  ) : (
                    `Estado: ${obtenerEtiquetaEstado(turno.estado)}`
                  )}
                </span>
              </div>

              {/* Datos de cliente */}
              <div className="rounded-2xl border border-camel/25 bg-surface-low/30 p-4 space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-primary">
                    <User className="h-4 w-4 text-secondary shrink-0" />
                    <span className="break-words">{turno.clienteNombre}</span>
                  </div>
                  {turno.clienteTelefono !== '-' && (
                    <div className="flex items-center gap-2.5 text-xs text-primary/80">
                      <Phone className="h-4 w-4 text-secondary/70 shrink-0" />
                      <span>{turno.clienteTelefono}</span>
                    </div>
                  )}
                </div>

                {/* Historial Integrado */}
                {(turno.clienteAuthUid ||
                  (turno.clienteTelefono && turno.clienteTelefono !== '-')) && (
                  <div className="pt-3 border-t border-camel/20 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5 text-secondary" />
                      <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">
                        Historial de citas
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMostrarModalHistorial(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline cursor-pointer bg-secondary/10 hover:bg-secondary/20 px-3 py-1 rounded-full transition-colors"
                    >
                      <span>Ver historial ({historialTurnos.length})</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Servicios Agendados */}
              <div className="rounded-2xl border border-camel/25 bg-surface-low/30 p-4 space-y-3">
                <div className="flex items-center gap-2.5 text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                  <span>Servicios Agendados</span>
                </div>

                {turno.servicios && turno.servicios.length > 0 ? (
                  <>
                    <div className="space-y-2.5">
                      {turno.servicios.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="text-primary font-bold">
                              {s.nombre}
                            </span>
                            <span className="text-primary/60 font-medium text-[11px]">
                              {s.duracion || 30} min de atención
                            </span>
                          </div>
                          {s.precio !== undefined && (
                            <span className="text-secondary font-black text-sm whitespace-nowrap">
                              ${s.precio}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {turno.precioTotal > 0 && (
                      <div className="pt-3 mt-1 border-t border-camel/20 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary/70">
                          Total del Turno
                        </span>
                        <span className="font-serif text-xl font-black text-secondary">
                          ${turno.precioTotal}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-primary">
                      {turno.servicioNombre}
                    </div>
                    {turno.precioTotal > 0 && (
                      <span className="font-serif text-lg font-black text-secondary whitespace-nowrap">
                        ${turno.precioTotal}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Datos de Horario Minimalista */}
              <div className="rounded-2xl border border-camel/25 bg-surface-low/30 p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-0.5">
                    <Calendar className="h-3 w-3" />
                    <span>{formatearFechaLegible(turno.fecha)}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 font-serif text-xl sm:text-2xl font-black text-secondary">
                    <span>{turno.horaInicio}</span>
                    <ArrowRight className="h-4 w-4 text-primary/40" />
                    <span>{turno.horaFin || '--:--'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-0.5">
                    Tiempo Ocupado
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    {formatearDuracion(turno.duracionMinutos)}
                  </span>
                </div>
              </div>

              {turno.clienteTelefono !== '-' && (
                <a
                  href={`https://wa.me/${turno.clienteTelefono.replace(/[^0-9]/g, '')}?text=${turno.estado === 'cancelado' ? mensajeWhatsAppCancelacion : mensajeWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  {turno.estado === 'cancelado'
                    ? 'Avisar cancelación por WhatsApp'
                    : 'Contactar por WhatsApp'}
                </a>
              )}

              {/* Botones de acción manuales */}
              <div className="space-y-2 pt-3 border-t border-camel/20">
                <span className="block text-xs font-bold text-primary/70 uppercase tracking-wider">
                  Acciones de Agenda
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {turno.estado === 'cancelado' && (
                    <button
                      type="button"
                      disabled={actualizando}
                      onClick={() =>
                        handleActualizarEstadoFirestore('confirmado')
                      }
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Reactivar Turno
                    </button>
                  )}
                  {turno.estado !== 'cancelado' && (
                    <button
                      type="button"
                      disabled={actualizando}
                      onClick={() => {
                        setNotificarPorWhatsApp(true);
                        setCancelacionExitosa(false);
                        setModalCancelarOpen(true);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      <Ban className="h-4 w-4" /> Cancelar Turno
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Modal de confirmación de cancelación y aviso por WhatsApp */}
      {modalCancelarOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 p-4"
            style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' }}
          >
            <div className="w-full max-w-sm rounded-2xl border border-camel/30 bg-surface-lowest p-5 sm:p-6 shadow-2xl space-y-4">
              {!cancelacionExitosa ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-secondary">
                      ¿Cancelar este turno?
                    </h3>
                  </div>

                  <p className="text-xs text-primary/75 leading-relaxed">
                    ¿Confirmás la cancelación del turno de{' '}
                    <strong className="font-semibold text-primary">{turno.clienteNombre}</strong> del{' '}
                    <strong className="font-semibold text-primary">{formatearFechaLegible(turno.fecha)} a las {turno.horaInicio} hs</strong>? Se liberará el horario en la agenda.
                  </p>

                  {turno.clienteTelefono && turno.clienteTelefono !== '-' && (
                    <label className="flex items-center gap-2.5 py-1 text-xs text-primary/80 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notificarPorWhatsApp}
                        onChange={(e) => setNotificarPorWhatsApp(e.target.checked)}
                        className="h-4 w-4 rounded border-camel/40 text-secondary focus:ring-0 cursor-pointer"
                      />
                      <span>Avisar por WhatsApp</span>
                    </label>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={actualizando}
                      onClick={() => setModalCancelarOpen(false)}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-primary/70 hover:text-primary hover:bg-surface-low transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Mantener
                    </button>
                    <button
                      type="button"
                      disabled={actualizando}
                      onClick={async () => {
                        const ok = await handleActualizarEstadoFirestore('cancelado');
                        if (ok) {
                          if (
                            notificarPorWhatsApp &&
                            turno.clienteTelefono &&
                            turno.clienteTelefono !== '-'
                          ) {
                            setCancelacionExitosa(true);
                          } else {
                            setModalCancelarOpen(false);
                          }
                        }
                      }}
                      className="rounded-full bg-rose-700 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-800 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {actualizando ? 'Cancelando...' : 'Cancelar turno'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-secondary">
                      Turno cancelado
                    </h3>
                  </div>

                  <p className="text-xs text-primary/75 leading-relaxed">
                    El horario quedó liberado. Podés enviar el mensaje de aviso por WhatsApp a <strong className="font-semibold text-primary">{turno.clienteNombre}</strong>:
                  </p>

                  <a
                    href={`https://wa.me/${turno.clienteTelefono.replace(/[^0-9]/g, '')}?text=${mensajeWhatsAppCancelacion}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setModalCancelarOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    Enviar mensaje por WhatsApp
                  </a>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalCancelarOpen(false)}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-primary/70 hover:text-primary hover:bg-surface-low transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Modal dedicado de Historial del Cliente */}
      <HistorialClienteModal
        open={mostrarModalHistorial}
        onClose={() => setMostrarModalHistorial(false)}
        clienteNombre={turno.clienteNombre}
        clienteTelefono={turno.clienteTelefono}
        historialTurnos={historialTurnos}
        cargando={cargandoHistorial}
        turnoActualId={turno.id}
        clienteNotas={cliente?.notasInternas}
        onGuardarNotas={(notas) => guardarNotas(notas, turno.clienteNombre)}
        guardandoNotas={guardandoNotas}
      />
    </>
  );
}
