import { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Lock,
  Calendar,
} from 'lucide-react';
import type { Servicio } from '../../servicios/types';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { formatearDuracion } from '../utils/agendaFormato';
import { useNuevoTurnoManual } from '../hooks/useNuevoTurnoManual';

interface Props {
  open: boolean;
  onClose: () => void;
  fechaInicial: string;
  horaInicial: string;
  serviciosDisponibles: Servicio[];
}

export function NuevoTurnoManualModal({
  open,
  onClose,
  fechaInicial,
  horaInicial,
  serviciosDisponibles,
}: Props) {
  const { categorias } = useCategorias();
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const getNombreCategoria = (id: string) => {
    const cat = categorias.find((c: any) => c.id === id);
    return cat ? cat.nombre : id.replace(/-/g, ' ');
  };

  const {
    tipoRegistro,
    setTipoRegistro,
    clienteNombre,
    setClienteNombre,
    clienteTelefono,
    setClienteTelefono,
    serviciosIds,
    setServiciosIds,
    tiempoDescanso,
    setTiempoDescanso,
    motivoBloqueo,
    setMotivoBloqueo,
    duracionBloqueo,
    setDuracionBloqueo,
    fechaManual,
    setFechaManual,
    horaManual,
    setHoraManual,
    guardandoManual,
    errorManual,
    turnoCreadoExito,
    modoHoraManual,
    setModoHoraManual,
    serviciosSeleccionados,
    duracionTotalCalculada,
    slotsDisponibles,
    horaFinCalculada,
    handleCrearTurnoManual,
    handleCerrarYLimpiar,
    msgWhatsApp,
    clienteAuthUid,
    setClienteAuthUid,
    clientesDisponibles,
    modoIngresoCliente,
    setModoIngresoCliente,
    busquedaCliente,
    setBusquedaCliente,
    esHoraInvalida,
    sinSlotsEnFecha,
    mananaISO,
    hoyISO,
  } = useNuevoTurnoManual({
    open,
    onClose,
    fechaInicial,
    horaInicial,
    serviciosDisponibles,
  });

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-surface-lowest sm:bg-black/50 sm:backdrop-blur-sm sm:p-4 md:p-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 350 }}
        className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl flex flex-col bg-surface-lowest sm:rounded-3xl border-0 sm:border sm:border-camel p-4 sm:p-8 shadow-2xl overflow-y-auto"
        style={{
          paddingTop: '1.5rem',
          paddingBottom: 'calc(var(--navbar-h) + 1.5rem)',
        }}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-camel/20 pb-4 mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
            {turnoCreadoExito
              ? tipoRegistro === 'bloqueo'
                ? '¡Horario Bloqueado!'
                : '¡Turno Agendado!'
              : 'Nuevo Registro'}
          </h2>
          <button
            type="button"
            onClick={handleCerrarYLimpiar}
            className="rounded-full p-1.5 text-primary/60 hover:bg-black/5 hover:text-primary transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* VISTA DE ÉXITO */}
        {turnoCreadoExito ? (
          <div className="py-4 space-y-6 text-center flex-1 flex flex-col justify-center items-center">
            <div className="flex justify-center">
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center shadow-sm ${
                  tipoRegistro === 'bloqueo'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {tipoRegistro === 'bloqueo' ? (
                  <Lock className="h-8 w-8" />
                ) : (
                  <CheckCircle2 className="h-9 w-9" />
                )}
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-secondary">
                {tipoRegistro === 'bloqueo'
                  ? 'Horario reservado como Ocupado'
                  : 'Turno guardado correctamente'}
              </h3>
              <p className="text-sm text-primary/70 leading-relaxed">
                {tipoRegistro === 'bloqueo' ? (
                  <>
                    El horario del <strong>{fechaManual}</strong> a las{' '}
                    <strong>{horaManual} hs</strong> ({duracionBloqueo} min)
                    quedó marcado como <strong>"{motivoBloqueo}"</strong>.
                  </>
                ) : (
                  <>
                    El turno para <strong>{clienteNombre}</strong> (
                    {serviciosSeleccionados.map((s) => s.nombre).join(' + ')})
                    quedó registrado para el <strong>{fechaManual}</strong> a
                    las <strong>{horaManual} hs</strong> hasta las{' '}
                    <strong>{horaFinCalculada} hs</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3 pt-4">
              {tipoRegistro === 'turno' && clienteTelefono !== '-' && (
                <a
                  href={`https://wa.me/${clienteTelefono.replace(/[^0-9]/g, '')}?text=${msgWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-emerald-700 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Avisar a la clienta por WhatsApp
                </a>
              )}

              <button
                type="button"
                onClick={handleCerrarYLimpiar}
                className="w-full rounded-full border border-camel/40 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-primary transition-opacity hover:opacity-80 cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE CREACIÓN */
          <form
            onSubmit={handleCrearTurnoManual}
            className="flex-1 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-6">
              {/* Selector de Tipo de Registro */}
              <div className="flex rounded-2xl border border-camel/30 bg-surface-low p-1.5 text-xs font-semibold shadow-xs">
                <button
                  type="button"
                  onClick={() => setTipoRegistro('turno')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 transition-all cursor-pointer ${
                    tipoRegistro === 'turno'
                      ? 'bg-secondary text-surface-lowest font-bold shadow-xs'
                      : 'text-primary/70 hover:text-primary'
                  }`}
                >
                  <User className="h-4 w-4" /> Turno Clienta
                </button>
                <button
                  type="button"
                  onClick={() => setTipoRegistro('bloqueo')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 transition-all cursor-pointer ${
                    tipoRegistro === 'bloqueo'
                      ? 'bg-secondary text-surface-lowest font-bold shadow-xs'
                      : 'text-primary/70 hover:text-primary'
                  }`}
                >
                  <Lock className="h-4 w-4" /> Bloquear Horario
                </button>
              </div>

              {tipoRegistro === 'turno' ? (
                /* FORMULARIO TURNO CLIENTA */
                <div className="space-y-4">
                  <div className="w-full">
                    {modoIngresoCliente === 'buscar' && (
                      <div className="flex flex-col gap-1.5 relative">
                        <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                          Buscar Cliente
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={busquedaCliente}
                            onChange={(e) => {
                              setBusquedaCliente(e.target.value);
                              setMostrarSugerencias(true);
                            }}
                            onFocus={() => setMostrarSugerencias(true)}
                            className="w-full rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                          />
                          {mostrarSugerencias && busquedaCliente.length >= 2 && (
                            <div className="absolute z-20 w-full mt-2 bg-surface-lowest border border-camel/30 rounded-xl shadow-xl max-h-72 overflow-y-auto overflow-hidden">
                              {clientesDisponibles.length > 0 ? (
                                <>
                                  {clientesDisponibles.map((c) => (
                                    <button
                                      key={c.uid}
                                      type="button"
                                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-low transition-colors cursor-pointer border-b border-camel/10 last:border-0"
                                      onClick={() => {
                                        setClienteNombre(c.nombre || '');
                                        setClienteTelefono(c.telefono || '');
                                        setClienteAuthUid(c.uid);
                                        setModoIngresoCliente('seleccionado');
                                        setMostrarSugerencias(false);
                                      }}
                                    >
                                      <div className="h-10 w-10 shrink-0 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                                        {(c.nombre || c.telefono || '?').charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex flex-col overflow-hidden">
                                        <span className="font-semibold text-primary truncate">{c.nombre || 'Sin Nombre'}</span>
                                        <span className="text-[11px] text-primary/60 flex items-center gap-1">
                                          <Phone className="w-3 h-3" /> {c.telefono || 'Sin teléfono'}
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                  <div className="p-2 border-t border-camel/10 bg-surface-low/30">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClienteNombre(busquedaCliente);
                                        setClienteTelefono('');
                                        setModoIngresoCliente('nuevo');
                                        setMostrarSugerencias(false);
                                      }}
                                      className="w-full text-center text-xs font-bold text-secondary p-2 hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer"
                                    >
                                      + No está en la lista. Crear cliente nuevo
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="p-4 text-center">
                                  <p className="text-sm text-primary/60 mb-3">No se encontraron clientes con ese nombre.</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setClienteNombre(busquedaCliente);
                                      setClienteTelefono('');
                                      setModoIngresoCliente('nuevo');
                                      setMostrarSugerencias(false);
                                    }}
                                    className="w-full rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-surface-lowest shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                                  >
                                    + Agregar como nuevo
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {modoIngresoCliente === 'seleccionado' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                          Cliente Seleccionado
                        </label>
                        <div className="flex items-center justify-between bg-surface-low/50 border border-camel/30 rounded-2xl p-3">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                              {clienteNombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-bold text-primary truncate">{clienteNombre}</span>
                              <span className="text-xs text-primary/70 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {clienteTelefono}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setClienteNombre('');
                              setClienteTelefono('');
                              setClienteAuthUid(undefined);
                              setModoIngresoCliente('buscar');
                              setBusquedaCliente('');
                            }}
                            className="p-2 rounded-full text-primary/50 hover:text-error-main hover:bg-error-bg transition-colors cursor-pointer"
                            title="Cambiar cliente"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {modoIngresoCliente === 'nuevo' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-secondary uppercase tracking-wider ml-1 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> Agregar Nuevo Cliente
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setClienteNombre('');
                              setClienteTelefono('');
                              setModoIngresoCliente('buscar');
                              setBusquedaCliente('');
                            }}
                            className="text-[10px] uppercase font-bold text-primary/50 hover:text-primary transition-colors cursor-pointer"
                          >
                            Volver al buscador
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/5 border border-secondary/20 rounded-2xl p-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider ml-1">
                              Nombre y Apellido
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary/70 pointer-events-none" />
                              <input
                                type="text"
                                placeholder="Ej: María Gómez"
                                value={clienteNombre}
                                onChange={(e) => setClienteNombre(e.target.value)}
                                className="w-full rounded-xl border-none bg-surface-lowest pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider ml-1">
                              WhatsApp / Teléfono
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary/70 pointer-events-none" />
                              <input
                                type="tel"
                                placeholder="Ej: 1123456789"
                                value={clienteTelefono}
                                onChange={(e) => setClienteTelefono(e.target.value)}
                                className="w-full rounded-xl border-none bg-surface-lowest pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                        Servicio
                      </label>
                      <div className="max-h-40 overflow-y-auto w-full rounded-2xl border-none bg-surface-low/50 p-2 space-y-1">
                        {Object.entries(
                          serviciosDisponibles.reduce(
                            (acc, s) => {
                              const cat = s.categoria || 'otros';
                              if (!acc[cat]) acc[cat] = [];
                              acc[cat].push(s);
                              return acc;
                            },
                            {} as Record<string, typeof serviciosDisponibles>
                          )
                        ).map(([categoriaId, servicios]) => (
                          <div key={categoriaId} className="mb-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 ml-1">
                              {getNombreCategoria(categoriaId)}
                            </h4>
                            {servicios.map((s) => (
                              <label
                                key={s.id}
                                className="flex items-center gap-3 p-2 hover:bg-surface-lowest rounded-xl cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={serviciosIds.includes(s.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setServiciosIds([...serviciosIds, s.id]);
                                    } else {
                                      setServiciosIds(
                                        serviciosIds.filter((id) => id !== s.id)
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

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                        Descanso / Limpieza posterior
                      </label>
                      <select
                        value={tiempoDescanso}
                        onChange={(e) => setTiempoDescanso(e.target.value)}
                        className="w-full rounded-2xl border-none bg-surface-low/50 px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option value="0">Sin descanso (0 min)</option>
                        <option value="10">+10 min de descanso</option>
                        <option value="15">+15 min de descanso</option>
                        <option value="20">+20 min de descanso</option>
                        <option value="30">+30 min de descanso</option>
                        <option value="45">+45 min de descanso</option>
                        <option value="60">+60 min de descanso</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                        Fecha
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none" />
                        <input
                          type="date"
                          value={fechaManual}
                          min={hoyISO}
                          onChange={(e) => setFechaManual(e.target.value)}
                          className="w-full rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                        Hora Inicio
                      </label>
                      <div className="relative">
                        <div className="flex w-full gap-2 relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none z-10" />
                          {!modoHoraManual && slotsDisponibles.length > 0 ? (
                            <select
                              value={
                                slotsDisponibles.includes(horaManual)
                                  ? horaManual
                                  : ''
                              }
                              onChange={(e) => {
                                if (e.target.value === 'custom') {
                                  setModoHoraManual(true);
                                } else {
                                  setHoraManual(e.target.value);
                                }
                              }}
                              className="flex-1 rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm font-semibold text-primary appearance-none cursor-pointer"
                              required
                            >
                              {slotsDisponibles.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot} hs (Disponible)
                                </option>
                              ))}
                              <option value="custom">
                                Otro horario puntual...
                              </option>
                            </select>
                          ) : (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="time"
                                value={horaManual}
                                onChange={(e) => setHoraManual(e.target.value)}
                                className="flex-1 rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                                required
                              />
                              {slotsDisponibles.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setModoHoraManual(false)}
                                  className="shrink-0 text-xs text-primary/70 underline px-2 cursor-pointer hover:text-secondary"
                                >
                                  Volver a lista
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* FORMULARIO BLOQUEO DE HORARIO */
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                      Motivo / Descripción
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Ej: Almuerzo, Asunto personal, Mantenimiento"
                        value={motivoBloqueo}
                        onChange={(e) => setMotivoBloqueo(e.target.value)}
                        className="w-full rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                      Duración del Bloqueo
                    </label>
                    <select
                      value={duracionBloqueo}
                      onChange={(e) => setDuracionBloqueo(e.target.value)}
                      className="w-full rounded-2xl border-none bg-surface-low/50 px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm appearance-none cursor-pointer"
                      required
                    >
                      <option value="30">30 minutos</option>
                      <option value="60">1 hora (60 min)</option>
                      <option value="90">1 hora y media (90 min)</option>
                      <option value="120">2 horas (120 min)</option>
                      <option value="180">3 horas (180 min)</option>
                      <option value="240">4 horas (240 min)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                        Fecha
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none" />
                        <input
                          type="date"
                          value={fechaManual}
                          min={hoyISO}
                          onChange={(e) => setFechaManual(e.target.value)}
                          className="w-full rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-primary/70 uppercase tracking-wider ml-1">
                        Hora Inicio
                      </label>
                      <div className="relative">
                        <div className="flex w-full gap-2 relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none z-10" />
                          {!modoHoraManual && slotsDisponibles.length > 0 ? (
                            <select
                              value={
                                slotsDisponibles.includes(horaManual)
                                  ? horaManual
                                  : ''
                              }
                              onChange={(e) => {
                                if (e.target.value === 'custom') {
                                  setModoHoraManual(true);
                                } else {
                                  setHoraManual(e.target.value);
                                }
                              }}
                              className="flex-1 rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm font-semibold text-primary appearance-none cursor-pointer"
                              required
                            >
                              {slotsDisponibles.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot} hs (Disponible)
                                </option>
                              ))}
                              <option value="custom">
                                Otro horario puntual...
                              </option>
                            </select>
                          ) : (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="time"
                                value={horaManual}
                                onChange={(e) => setHoraManual(e.target.value)}
                                className="flex-1 rounded-2xl border-none bg-surface-low/50 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm"
                                required
                              />
                              {slotsDisponibles.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setModoHoraManual(false)}
                                  className="shrink-0 text-xs text-primary/70 underline px-2 cursor-pointer hover:text-secondary"
                                >
                                  Volver a lista
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerta de Cero Slots en la Fecha Elegida */}
              {sinSlotsEnFecha && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
                  <div className="flex items-start sm:items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <span className="font-bold block">
                        No quedan horarios disponibles para agendar en esta
                        fecha ({fechaManual}).
                      </span>
                      <span className="text-[11px] text-amber-800">
                        El salón ya cerró por hoy o la agenda está completa.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFechaManual(mananaISO)}
                    className="rounded-full bg-amber-800 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:bg-amber-900 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Ver Mañana</span>
                  </button>
                </div>
              )}

              {/* Resumen Minimalista */}
              <div className="flex items-center justify-between bg-surface-low/30 rounded-2xl p-4 border border-camel/30">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-0.5">
                    Finalización Estimada
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-2xl font-black text-secondary">
                      {horaFinCalculada}
                    </span>
                    <span className="text-sm font-bold text-primary/60">
                      hs
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-0.5">
                    Tiempo Ocupado
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    {formatearDuracion(duracionTotalCalculada)}
                  </span>
                </div>
              </div>
            </div>

            {/* Mensaje de error visible */}
            {errorManual && (
              <div className="flex items-center gap-2 rounded-2xl bg-error-bg p-3 text-xs font-medium text-error-main border border-error-main/30">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorManual}</span>
              </div>
            )}

            {/* Barra de Botones idéntica a ServicioFormModal / CategoriaFormModal */}
            <div className="mt-8 pt-6 border-t border-camel/20 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={handleCerrarYLimpiar}
                className="w-full sm:w-auto rounded-full border border-camel/40 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary transition-opacity hover:opacity-80 text-center cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoManual || esHoraInvalida || sinSlotsEnFecha}
                className="w-full sm:w-auto rounded-full bg-secondary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-surface-lowest transition-opacity hover:opacity-90 disabled:opacity-50 shadow-md text-center cursor-pointer"
              >
                {guardandoManual
                  ? 'Guardando...'
                  : sinSlotsEnFecha
                    ? 'Sin horarios en esta fecha'
                    : esHoraInvalida
                      ? 'Horario en el pasado'
                      : tipoRegistro === 'bloqueo'
                        ? 'Bloquear Horario'
                        : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
