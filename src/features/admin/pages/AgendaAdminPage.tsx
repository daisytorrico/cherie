import { getLocalISO } from '../../../utils/dateUtils';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Check,
  Search,
  RotateCcw,
} from 'lucide-react';
import { useAgendaTurnos } from '../hooks/useAgendaTurnos';
import type { TurnoAdmin, VistaAgenda } from '../types/agenda';
import { DetalleTurnoDrawer } from '../components/DetalleTurnoDrawer';
import { NuevoTurnoManualModal } from '../components/NuevoTurnoManualModal';
import { fetchServicios } from '../../servicios/api/serviciosApi';
import { fetchDisponibilidad } from '../../turnero/api/disponibilidadApi';
import type { Servicio } from '../../servicios/types';
import type { DisponibilidadSemanal } from '../../turnero/types';
import {
  formatearFechaLegible,
  obtenerProximaHoraSugerida,
} from '../utils/agendaFormato';

import { AgendaGrid } from '../components/AgendaGrid';
import { AgendaMonthGrid } from '../components/AgendaMonthGrid';

import { SegmentedControl } from '../../../components/ui/SegmentedControl';

const HORARIOS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

const OPCIONES_VISTA = [
  { value: 'dia' as const, label: 'Día' },
  { value: 'semana' as const, label: 'Semana' },
  { value: 'mes' as const, label: 'Mes' },
];

export function AgendaAdminPage() {
  const [vista, setVista] = useState<VistaAgenda>('dia');
  const [fechaBase, setFechaBase] = useState<string>(
    getLocalISO()
  );
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<TurnoAdmin | null>(
    null
  );

  // Estados de filtros completos de agenda
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [filtroServicio, setFiltroServicio] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<
    'todos' | 'confirmado' | 'en_proceso' | 'completado'
  >('todos');
  const [incluirCancelados, setIncluirCancelados] = useState(false);
  const [filtroMenuAbierto, setFiltroMenuAbierto] = useState(false);

  // Estados para el Modal de Nuevo Turno Manual
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<Servicio[]>(
    []
  );
  const [disponibilidad, setDisponibilidad] =
    useState<DisponibilidadSemanal | null>(null);
  const [fechaManual, setFechaManual] = useState(fechaBase);
  const [horaManual, setHoraManual] = useState('10:00');

  // Estado para saber si es mobile (para week-bar y layouts)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [activeMobileDay, setActiveMobileDay] = useState(fechaBase);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sincronizar activeMobileDay con fechaBase si cambia la semana
  useEffect(() => {
    setActiveMobileDay(fechaBase);
  }, [fechaBase]);

  const obtenerDiasAMostrar = (): string[] => {
    if (vista === 'dia') return [fechaBase];
    if (vista === 'mes') {
      const base = new Date(`${fechaBase}T00:00:00`);
      const year = base.getFullYear();
      const month = base.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      let startDayOfWeek = firstDayOfMonth.getDay();
      if (startDayOfWeek === 0) startDayOfWeek = 7;
      const daysFromPrevMonth = startDayOfWeek - 1;

      const startDate = new Date(year, month, 1 - daysFromPrevMonth);
      const resultado: string[] = [];
      let current = new Date(startDate);
      for (let i = 0; i < 42; i++) {
        resultado.push(getLocalISO(current));
        current.setDate(current.getDate() + 1);
      }
      return resultado;
    }

    // Vista semana: Lunes a Domingo
    const diasCount = 7;
    const resultado: string[] = [];
    const base = new Date(`${fechaBase}T00:00:00`);

    let dayOfWeek = base.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7;

    const startOfWeek = new Date(base);
    startOfWeek.setDate(base.getDate() - (dayOfWeek - 1));

    for (let i = 0; i < diasCount; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      resultado.push(getLocalISO(d));
    }
    return resultado;
  };

  const diasVisibles = obtenerDiasAMostrar();
  const fechaDesde = diasVisibles[0];
  const fechaHasta = diasVisibles[diasVisibles.length - 1];

  const { turnos, loading, setTurnos } = useAgendaTurnos(
    fechaDesde,
    fechaHasta
  );

  const turnosFiltrados = turnos.filter((t) => {
    if (!incluirCancelados && t.estado === 'cancelado') return false;
    if (filtroEstado !== 'todos' && t.estado !== filtroEstado) return false;
    if (filtroServicio !== 'todos') {
      const servicioObj = serviciosDisponibles.find(
        (s) => s.id === filtroServicio
      );
      const nombreBusqueda = servicioObj
        ? servicioObj.nombre.toLowerCase()
        : filtroServicio.toLowerCase();
      if (!t.servicioNombre.toLowerCase().includes(nombreBusqueda))
        return false;
    }
    if (busquedaCliente.trim()) {
      const q = busquedaCliente.toLowerCase().trim();
      const coincideNombre = t.clienteNombre.toLowerCase().includes(q);
      const coincideTel = t.clienteTelefono.includes(q);
      if (!coincideNombre && !coincideTel) return false;
    }
    return true;
  });

  const cantidadFiltrosActivos =
    (filtroEstado !== 'todos' ? 1 : 0) +
    (filtroServicio !== 'todos' ? 1 : 0) +
    (busquedaCliente.trim() ? 1 : 0) +
    (incluirCancelados ? 1 : 0);

  const resetFiltros = () => {
    setBusquedaCliente('');
    setFiltroServicio('todos');
    setFiltroEstado('todos');
    setIncluirCancelados(false);
  };

  useEffect(() => {
    fetchServicios().then(setServiciosDisponibles).catch(console.error);
    fetchDisponibilidad().then(setDisponibilidad).catch(console.error);
  }, []);

  const abrirModalManualSlot = (dia: string, hora: string) => {
    setFechaManual(dia);
    setHoraManual(hora);
    setModalNuevoAbierto(true);
  };

  const handleCambiarEstado = (
    id: string,
    nuevoEstado: TurnoAdmin['estado']
  ) => {
    setTurnos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t))
    );
    if (turnoSeleccionado?.id === id) {
      setTurnoSeleccionado((prev) =>
        prev ? { ...prev, estado: nuevoEstado } : null
      );
    }
  };

  const diasASumar = vista === 'dia' ? 1 : vista === 'semana' ? 7 : 0;

  const tituloFecha =
    vista === 'mes'
      ? new Date(`${fechaBase}T00:00:00`).toLocaleDateString('es-AR', {
          month: 'long',
          year: 'numeric',
        })
      : formatearFechaLegible(fechaBase);

  return (
    <div className="flex flex-col text-primary p-1 sm:p-4 lg:p-6 space-y-2 sm:space-y-4 w-full h-full mx-auto overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:gap-4 border-b border-camel/20 pb-3 sm:pb-4 w-full">
        {/* Fila 1 en Mobile / Fila Única en Desktop */}
        <div className="flex items-center justify-between w-full">
          {/* Oculto en mobile, visible en desktop: Navegador izquierdo */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const d = new Date(`${fechaBase}T00:00:00`);
                if (vista === 'mes') d.setMonth(d.getMonth() - 1);
                else d.setDate(d.getDate() - diasASumar);
                setFechaBase(getLocalISO(d));
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-primary/60 hover:text-primary hover:bg-surface-low transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <span className="text-lg font-bold text-primary capitalize tracking-tight select-none min-w-[130px] text-center">
              {tituloFecha}
            </span>

            <button
              type="button"
              onClick={() => {
                const d = new Date(`${fechaBase}T00:00:00`);
                if (vista === 'mes') d.setMonth(d.getMonth() + 1);
                else d.setDate(d.getDate() + diasASumar);
                setFechaBase(getLocalISO(d));
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-primary/60 hover:text-primary hover:bg-surface-low transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() =>
                setFechaBase(getLocalISO())
              }
              className="ml-2 rounded-md px-2 py-1 text-[11px] font-bold text-primary/70 border border-camel/40 hover:bg-camel/10 hover:text-primary transition-colors cursor-pointer shadow-xs"
            >
              HOY
            </button>
          </div>

          {/* LADO DERECHO: Vistas, Filtros y Botón Nuevo */}
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto relative">
            {/* Controles: Vistas y Filtros */}
            <div className="grid grid-cols-3 items-center w-full sm:flex sm:w-auto">
              {/* Botón HOY (Solo Mobile, columna izquierda) */}
              <div className="flex justify-start sm:hidden pl-1">
                <button
                  type="button"
                  onClick={() =>
                    setFechaBase(getLocalISO())
                  }
                  className="rounded-xl px-3 py-2 text-[10px] font-bold text-primary/80 border border-camel/30 bg-surface-low hover:bg-camel/20 hover:text-primary transition-colors cursor-pointer shadow-xs tracking-wider"
                >
                  HOY
                </button>
              </div>

              {/* Selector de Vista (Centro) */}
              <div className="flex justify-center">
                <SegmentedControl
                  options={OPCIONES_VISTA}
                  value={vista}
                  onChange={(v) => setVista(v as VistaAgenda)}
                  layoutId="activeVistaPill"
                />
              </div>

              {/* Botón de Filtros Unificado (Columna derecha) */}
              <div className="flex justify-end relative sm:ml-2 pr-1">
                <button
                  type="button"
                  onClick={() => setFiltroMenuAbierto(!filtroMenuAbierto)}
                  className={`relative flex items-center justify-center rounded-xl border p-2 transition-all cursor-pointer ${
                    cantidadFiltrosActivos > 0
                      ? 'border-secondary bg-secondary/15 text-secondary shadow-xs'
                      : 'border-camel/30 bg-surface-low text-primary/70 hover:text-primary hover:border-camel/60'
                  }`}
                  title="Filtros"
                >
                  <Filter className="h-4.5 w-4.5" />
                  {cantidadFiltrosActivos > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white shadow-xs">
                      {cantidadFiltrosActivos}
                    </span>
                  )}
                </button>

                {filtroMenuAbierto && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setFiltroMenuAbierto(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-30 w-72 sm:w-80 rounded-2xl border border-camel/30 bg-surface-lowest p-3.5 shadow-xl space-y-3.5 animate-fadeSlideIn">
                      <div className="flex items-center justify-between border-b border-camel/20 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Filtros de Agenda
                        </span>
                        {cantidadFiltrosActivos > 0 && (
                          <button
                            type="button"
                            onClick={resetFiltros}
                            className="text-[11px] font-semibold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Limpiar
                          </button>
                        )}
                      </div>

                      {/* Búsqueda por cliente/teléfono */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-primary/60 block mb-1">
                          Buscar Cliente
                        </label>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/50 pointer-events-none" />
                          <input
                            type="text"
                            value={busquedaCliente}
                            onChange={(e) => setBusquedaCliente(e.target.value)}
                            placeholder="Nombre o teléfono..."
                            className="w-full text-xs rounded-xl border border-camel/30 bg-surface-low/50 pl-8 pr-2.5 py-1.5 text-primary placeholder:text-primary/40 outline-none focus:border-secondary transition-colors"
                          />
                        </div>
                      </div>

                      {/* Filtrar por servicio */}
                      {serviciosDisponibles.length > 0 && (
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-primary/60 block mb-1">
                            Servicio
                          </label>
                          <select
                            value={filtroServicio}
                            onChange={(e) => setFiltroServicio(e.target.value)}
                            className="w-full text-xs rounded-xl border border-camel/30 bg-surface-low/50 px-2.5 py-1.5 text-primary outline-none focus:border-secondary transition-colors cursor-pointer"
                          >
                            <option value="todos">Todos los servicios</option>
                            {serviciosDisponibles.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Filtrar por Estado */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-primary/60 block mb-1">
                          Estado del Turno
                        </label>
                        <div className="grid grid-cols-2 gap-1 text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => setFiltroEstado('todos')}
                            className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                              filtroEstado === 'todos'
                                ? 'border-secondary bg-secondary/10 text-secondary font-bold'
                                : 'border-camel/20 hover:bg-surface-low text-primary/80'
                            }`}
                          >
                            <span>Todos</span>
                            {filtroEstado === 'todos' && (
                              <Check className="h-3 w-3 text-secondary" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setFiltroEstado('confirmado')}
                            className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                              filtroEstado === 'confirmado'
                                ? 'border-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                                : 'border-camel/20 hover:bg-surface-low text-primary/80'
                            }`}
                          >
                            <span>Confirmados</span>
                            {filtroEstado === 'confirmado' && (
                              <Check className="h-3 w-3 text-emerald-800 dark:text-emerald-200" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFiltroEstado('en_proceso')}
                            className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                              filtroEstado === 'en_proceso'
                                ? 'border-sky-400 bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 font-bold'
                                : 'border-camel/20 hover:bg-surface-low text-primary/80'
                            }`}
                          >
                            <span>En atención</span>
                            {filtroEstado === 'en_proceso' && (
                              <Check className="h-3 w-3 text-sky-800 dark:text-sky-200" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Opción cancelados */}
                      <div className="pt-2 border-t border-camel/20">
                        <label className="flex items-center gap-2 text-xs font-medium text-primary cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={incluirCancelados}
                            onChange={(e) =>
                              setIncluirCancelados(e.target.checked)
                            }
                            className="rounded text-secondary focus:ring-secondary cursor-pointer"
                          />
                          <span>Mostrar turnos cancelados</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botón Nuevo (Solo Desktop, el de mobile será un FAB abajo) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setFechaManual(fechaBase);
                setHoraManual(obtenerProximaHoraSugerida(fechaBase));
                setModalNuevoAbierto(true);
              }}
              className="btn-primary hidden sm:flex py-2 px-3.5 items-center justify-center gap-1.5 text-xs cursor-pointer shadow-xs whitespace-nowrap"
              title="Nuevo Turno"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo</span>
            </motion.button>
          </div>
        </div>

        {/* Fila 2 en Mobile: Navegador de Fecha (Limpio y centrado) */}
        <div className="flex sm:hidden items-center justify-between w-full px-2 relative">
          <button
            type="button"
            onClick={() => {
              const d = new Date(`${fechaBase}T00:00:00`);
              if (vista === 'mes') d.setMonth(d.getMonth() - 1);
              else d.setDate(d.getDate() - diasASumar);
              setFechaBase(getLocalISO(d));
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary/60 hover:text-primary hover:bg-surface-low transition-colors cursor-pointer z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-max">
            <span className="text-[16px] font-bold text-primary capitalize tracking-tight select-none">
              {tituloFecha}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const d = new Date(`${fechaBase}T00:00:00`);
              if (vista === 'mes') d.setMonth(d.getMonth() + 1);
              else d.setDate(d.getDate() + diasASumar);
              setFechaBase(getLocalISO(d));
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary/60 hover:text-primary hover:bg-surface-low transition-colors cursor-pointer z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Grilla Adaptativa con animación de transición */}
      <AnimatePresence mode="wait">
        <motion.div
          key={vista + fechaBase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full"
        >
          {vista === 'mes' ? (
            <AgendaMonthGrid
              fechaBase={fechaBase}
              turnos={turnosFiltrados}
              onDayNumberClick={(fecha) => {
                setFechaBase(fecha);
                setVista('dia');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSeleccionarTurno={setTurnoSeleccionado}
            />
          ) : vista === 'semana' && isMobile ? (
            <div className="flex flex-col gap-3 w-full">
              {/* Week-Bar Mobile */}
              <div className="flex w-full justify-between gap-1.5 overflow-x-auto pb-1 no-scrollbar px-1">
                {diasVisibles.map((dia) => {
                  const dObj = new Date(`${dia}T00:00:00`);
                  const nombreDia = dObj.toLocaleDateString('es-AR', {
                    weekday: 'short',
                  });
                  const numeroDia = dObj.getDate();
                  const isActive = dia === activeMobileDay;
                  const esHoyStr = getLocalISO();
                  const isHoy = dia === esHoyStr;

                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => setActiveMobileDay(dia)}
                      className={`flex flex-col items-center py-2 px-1 min-w-[3rem] transition-all cursor-pointer rounded-xl ${
                        isActive
                          ? 'text-secondary'
                          : isHoy
                            ? 'text-primary'
                            : 'text-primary/50 hover:bg-surface-low'
                      }`}
                    >
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isActive ? 'text-secondary' : ''}`}
                      >
                        {nombreDia}
                      </span>
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${isActive ? 'bg-secondary text-white shadow-md' : isHoy ? 'bg-surface-low text-primary' : 'text-primary'}`}
                      >
                        <span className="text-lg font-black leading-none">
                          {numeroDia}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Grilla de 1 solo día (el seleccionado en la Week-Bar) */}
              <AgendaGrid
                diasVisibles={[activeMobileDay]}
                HORARIOS={HORARIOS}
                turnos={turnosFiltrados}
                disponibilidad={disponibilidad}
                loading={loading}
                onSeleccionarTurno={setTurnoSeleccionado}
                onSlotVacio={abrirModalManualSlot}
              />
            </div>
          ) : (
            <AgendaGrid
              diasVisibles={diasVisibles}
              HORARIOS={HORARIOS}
              turnos={turnosFiltrados}
              disponibilidad={disponibilidad}
              loading={loading}
              onSeleccionarTurno={setTurnoSeleccionado}
              onSlotVacio={abrirModalManualSlot}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button (FAB) para +Nuevo en Mobile */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setFechaManual(fechaBase);
            setHoraManual(obtenerProximaHoraSugerida(fechaBase));
            setModalNuevoAbierto(true);
          }}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-xl shadow-secondary/30 active:shadow-md transition-shadow cursor-pointer"
          aria-label="Nuevo Turno"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      {/* Drawer Flotante de Acciones con animación suave */}
      <AnimatePresence>
        {turnoSeleccionado && (
          <DetalleTurnoDrawer
            turno={turnoSeleccionado}
            onClose={() => setTurnoSeleccionado(null)}
            onCambiarEstado={handleCambiarEstado}
            serviciosDisponibles={serviciosDisponibles}
          />
        )}
      </AnimatePresence>

      {/* Modal de Nuevo Turno Manual con animación suave */}
      <AnimatePresence>
        {modalNuevoAbierto && (
          <NuevoTurnoManualModal
            open={modalNuevoAbierto}
            onClose={() => setModalNuevoAbierto(false)}
            fechaInicial={fechaManual}
            horaInicial={horaManual}
            serviciosDisponibles={serviciosDisponibles}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
