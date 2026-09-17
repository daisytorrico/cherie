import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type {
  SensorDescriptor,
  SensorOptions,
  DragEndEvent,
} from '@dnd-kit/core';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Trash2, X } from 'lucide-react';
import { SortableRow } from './SortableRow';
import { AdminServicioRow } from '../../servicios/components/AdminServicioRow';
import { TabServiciosSkeleton } from './AdminSkeletons';
import type { Categoria, Servicio } from '../../servicios/types';
import { AdminFilterBar } from './AdminFilterBar';
import { Search } from 'lucide-react';

interface TabServiciosProps {
  serviciosLocales: Servicio[];
  categoriasLocales: Categoria[];
  loadingServicios: boolean;
  sensors: SensorDescriptor<SensorOptions>[];
  onReorder: (catId: string, event: DragEndEvent) => void;
  onAgregarServicio: (catId?: string) => void;
  onEditarServicio: (servicio: Servicio) => void;
  onDesactivarServicio: (servicio: Servicio) => void;
  onReactivarServicio: (servicio: Servicio) => void;
  onEliminarDefinitivoServicio: (servicio: Servicio) => void;
  onVaciarDesactivados: (ids: string[]) => void;
}

export function TabServicios({
  serviciosLocales,
  categoriasLocales,
  loadingServicios,
  sensors,
  onReorder,
  onAgregarServicio,
  onEditarServicio,
  onDesactivarServicio,
  onReactivarServicio,
  onEliminarDefinitivoServicio,
  onVaciarDesactivados,
}: TabServiciosProps) {
  const [filtro, setFiltro] = useState<'activos' | 'desactivados'>('activos');
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [isBuscando, setIsBuscando] = useState(false);

  const serviciosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return serviciosLocales;
    const queryStr = busqueda.toLowerCase();
    return serviciosLocales.filter(
      (s) =>
        s.nombre.toLowerCase().includes(queryStr) ||
        s.descripcion?.toLowerCase().includes(queryStr)
    );
  }, [serviciosLocales, busqueda]);

  const inactivos = serviciosLocales.filter((s) => !s.activo);
  const activos = serviciosLocales.filter((s) => s.activo);

  const serviciosParaMostrar = serviciosFiltrados.filter((s) => {
    if (filtro === 'activos') return s.activo;
    if (filtro === 'desactivados') return !s.activo;
    return true;
  });

  const isDnDEnabled = filtro === 'activos' && !busqueda.trim();

  return (
    <div className="flex flex-col gap-4 w-full">
      <AdminFilterBar<'activos' | 'desactivados'>
        filtroActual={filtro}
        onFiltroChange={setFiltro}
        layoutId="activeFiltroServicioPill"
        cantidadActivos={activos.length}
        cantidadDesactivados={inactivos.length}
        onVaciarDesactivados={() =>
          onVaciarDesactivados(inactivos.map((s) => s.id))
        }
        tituloVaciar="Eliminar permanentemente todos los servicios desactivados"
      >
        <div className="relative min-w-[160px]">
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="w-full appearance-none rounded-xl border border-camel/40 bg-surface-lowest px-3 py-2 pr-8 text-xs font-semibold text-primary shadow-xs outline-none focus:border-secondary transition-all cursor-pointer truncate"
          >
            <option value="">Todas las categorías</option>
            {categoriasLocales.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-primary/50">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsBuscando((prev) => {
              if (prev) setBusqueda('');
              return !prev;
            });
          }}
          className={`p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
            isBuscando
              ? 'bg-camel/20 text-primary'
              : 'text-primary/60 hover:text-primary hover:bg-surface-low'
          }`}
          title="Buscar servicio"
        >
          <Search className="h-4 w-4" />
        </button>
      </AdminFilterBar>

      <AnimatePresence>
        {isBuscando && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="relative w-full bg-surface-lowest border border-camel/30 rounded-xl p-2 shadow-xs flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar servicio por nombre o descripción..."
                className="input input-icon text-sm py-2 pl-10 pr-10 w-full bg-transparent border-none focus:ring-0"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary/40 hover:text-primary cursor-pointer rounded-full"
                  title="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loadingServicios ? (
        <TabServiciosSkeleton />
      ) : serviciosLocales.length === 0 ? (
        <p className="text-sm text-primary/60 py-6 text-center">
          Todavía no cargaste ningún servicio.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {categoriasLocales
            .filter((cat) => (filtro === 'activos' ? cat.activa : true))
            .filter((cat) =>
              categoriaSeleccionada ? cat.id === categoriaSeleccionada : true
            )
            .map((cat) => {
              const totalServiciosCat = serviciosLocales.filter(
                (s) => s.categoria === cat.id
              ).length;
              const serviciosDeCategoria = serviciosParaMostrar
                .filter((s) => s.categoria === cat.id)
                .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

              if (busqueda.trim() && serviciosDeCategoria.length === 0)
                return null;
              if (
                filtro === 'desactivados' &&
                serviciosDeCategoria.length === 0
              )
                return null;

              return (
                <div key={cat.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between pl-2 pb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary/50">
                        {cat.nombre}
                      </h3>
                      {!cat.activa && (
                        <span className="rounded-md bg-on-surface-variant/10 text-on-surface-variant px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          Inactiva
                        </span>
                      )}
                      {totalServiciosCat > 0 && (
                        <span className="rounded-full bg-surface-low px-2.5 py-0.5 text-[10px] font-semibold text-secondary uppercase tracking-wider">
                          {totalServiciosCat} servicio
                          {totalServiciosCat > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onAgregarServicio(cat.id)}
                      className="flex items-center gap-1 rounded-full bg-surface-low border border-camel/40 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-secondary hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Agregar servicio</span>
                    </button>
                  </div>

                  {serviciosDeCategoria.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-[13px] text-primary/40">
                        Sin servicios
                      </p>
                    </div>
                  ) : isDnDEnabled ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => onReorder(cat.id, event)}
                    >
                      <SortableContext
                        items={serviciosDeCategoria.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col bg-surface-lowest rounded-2xl border border-camel/30 overflow-hidden shadow-xs divide-y divide-camel/20">
                          {serviciosDeCategoria.map((servicio) => (
                            <SortableRow key={servicio.id} id={servicio.id}>
                              {(dragHandleProps) => (
                                <AdminServicioRow
                                  servicio={servicio}
                                  esVistaDesactivados={false}
                                  onEditar={() => onEditarServicio(servicio)}
                                  onDesactivar={() =>
                                    onDesactivarServicio(servicio)
                                  }
                                  onReactivar={() =>
                                    onReactivarServicio(servicio)
                                  }
                                  onEliminarDefinitivo={() =>
                                    onEliminarDefinitivoServicio(servicio)
                                  }
                                  dragHandleProps={dragHandleProps}
                                />
                              )}
                            </SortableRow>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="flex flex-col bg-surface-lowest rounded-2xl border border-camel/30 overflow-hidden shadow-xs divide-y divide-camel/20">
                      {serviciosDeCategoria.map((servicio) => (
                        <AdminServicioRow
                          key={servicio.id}
                          servicio={servicio}
                          esVistaDesactivados={filtro === 'desactivados'}
                          onEditar={() => onEditarServicio(servicio)}
                          onDesactivar={() => onDesactivarServicio(servicio)}
                          onReactivar={() => onReactivarServicio(servicio)}
                          onEliminarDefinitivo={() =>
                            onEliminarDefinitivoServicio(servicio)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
