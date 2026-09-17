import { useState } from 'react';
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
import { SortableRow } from './SortableRow';
import { AdminCategoriaRow } from '../../categorias/components/AdminCategoriaRow';
import { TabCategoriasSkeleton } from './AdminSkeletons';
import type { Categoria, Servicio } from '../../servicios/types';
import { AdminFilterBar } from './AdminFilterBar';

interface TabCategoriasProps {
  categoriasLocales: Categoria[];
  serviciosLocales: Servicio[];
  loadingCategorias: boolean;
  sensors: SensorDescriptor<SensorOptions>[];
  onReorder: (event: DragEndEvent) => void;
  onAgregarCategoria: () => void;
  onEditarCategoria: (categoria: Categoria) => void;
  onDesactivarCategoria: (categoria: Categoria) => void;
  onReactivarCategoria: (categoria: Categoria) => void;
  onEliminarDefinitivaCategoria: (categoria: Categoria) => void;
  onVaciarDesactivadas: (ids: string[]) => void;
}

export function TabCategorias({
  categoriasLocales,
  serviciosLocales,
  loadingCategorias,
  sensors,
  onReorder,
  onEditarCategoria,
  onDesactivarCategoria,
  onReactivarCategoria,
  onEliminarDefinitivaCategoria,
  onVaciarDesactivadas,
}: TabCategoriasProps) {
  const [filtro, setFiltro] = useState<'activas' | 'desactivadas'>('activas');

  const inactivas = categoriasLocales.filter((c) => !c.activa);
  const activas = categoriasLocales.filter((c) => c.activa);

  const categoriasVisibles = [...categoriasLocales]
    .filter((c) => (filtro === 'activas' ? c.activa : !c.activa))
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <div className="flex flex-col gap-4 w-full">
      <AdminFilterBar<'activas' | 'desactivadas'>
        filtroActual={filtro}
        onFiltroChange={setFiltro}
        layoutId="activeFiltroCategoriaPill"
        cantidadActivos={activas.length}
        cantidadDesactivados={inactivas.length}
        onVaciarDesactivados={() =>
          onVaciarDesactivadas(inactivas.map((c) => c.id))
        }
        tituloVaciar="Eliminar permanentemente todas las categorías desactivadas"
        etiquetaActivos="Activas"
        etiquetaDesactivados="Desactivadas"
        valorActivos="activas"
        valorDesactivados="desactivadas"
      />

      {loadingCategorias ? (
        <TabCategoriasSkeleton />
      ) : categoriasVisibles.length === 0 ? (
        <p className="text-sm text-primary/60 py-6 text-center">
          {filtro === 'desactivadas'
            ? 'No hay categorías desactivadas.'
            : 'Todavía no cargaste ninguna categoría.'}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onReorder}
        >
          <SortableContext
            items={categoriasVisibles.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col bg-surface-lowest rounded-2xl border border-camel/30 overflow-hidden shadow-xs divide-y divide-camel/20">
              {categoriasVisibles.map((categoria) => (
                <SortableRow key={categoria.id} id={categoria.id}>
                  {(dragHandleProps) => (
                    <AdminCategoriaRow
                      categoria={categoria}
                      cantidadServicios={
                        serviciosLocales.filter(
                          (s) => s.categoria === categoria.id
                        ).length
                      }
                      esVistaDesactivados={filtro === 'desactivadas'}
                      onEditar={() => onEditarCategoria(categoria)}
                      onDesactivar={() => onDesactivarCategoria(categoria)}
                      onReactivar={() => onReactivarCategoria(categoria)}
                      onEliminarDefinitivo={() =>
                        onEliminarDefinitivaCategoria(categoria)
                      }
                      dragHandleProps={dragHandleProps}
                    />
                  )}
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
