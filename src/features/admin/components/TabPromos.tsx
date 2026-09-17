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
import { Trash2 } from 'lucide-react';
import { SortableRow } from './SortableRow';
import { TabCategoriasSkeleton as TabPromosSkeleton } from './AdminSkeletons'; // reusing skeleton
import type { Promo } from '../../promos/types';
import { AdminPromoRow } from '../../promos/components/AdminPromoRow';
import { AdminFilterBar } from './AdminFilterBar';

interface TabPromosProps {
  promosLocales: Promo[];
  loadingPromos: boolean;
  sensors: SensorDescriptor<SensorOptions>[];
  onReorder: (event: DragEndEvent) => void;
  onEditarPromo: (promo: Promo) => void;
  onDesactivarPromo: (promo: Promo) => void;
  onReactivarPromo: (promo: Promo) => void;
  onEliminarDefinitivaPromo: (promo: Promo) => void;
  onVaciarDesactivadas: (ids: string[]) => void;
  onRestaurarDefault?: () => void;
}

export function TabPromos({
  promosLocales,
  loadingPromos,
  sensors,
  onReorder,
  onEditarPromo,
  onDesactivarPromo,
  onReactivarPromo,
  onEliminarDefinitivaPromo,
  onVaciarDesactivadas,
  onRestaurarDefault,
}: TabPromosProps) {
  const [filtro, setFiltro] = useState<'activas' | 'desactivadas'>('activas');

  const defaultHero = promosLocales.find((c) => c.id === 'default-hero');
  const otrasPromos = promosLocales.filter((c) => c.id !== 'default-hero');

  const inactivas = otrasPromos.filter((c) => !c.activa);
  const activas = otrasPromos.filter((c) => c.activa);

  const opcionesFiltro = [
    { value: 'activas' as const, label: 'Activos', badge: activas.length },
    {
      value: 'desactivadas' as const,
      label: 'Desactivados',
      badge: inactivas.length,
    },
  ];

  const promosVisibles = [...otrasPromos]
    .filter((c) => (filtro === 'activas' ? c.activa : !c.activa))
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <div className="flex flex-col gap-4 w-full">
      <AdminFilterBar<'activas' | 'desactivadas'>
        filtroActual={filtro}
        onFiltroChange={setFiltro}
        layoutId="activeFiltroPromoPill"
        cantidadActivos={activas.length}
        cantidadDesactivados={inactivas.length}
        onVaciarDesactivados={() =>
          onVaciarDesactivadas(inactivas.map((p) => p.id))
        }
        tituloVaciar="Eliminar permanentemente todas las promos desactivadas"
        etiquetaActivos="Activas"
        etiquetaDesactivados="Desactivadas"
        valorActivos="activas"
        valorDesactivados="desactivadas"
      />

      {defaultHero && (
        <div className="bg-surface-lowest p-0 rounded-2xl border border-secondary/30 shadow-xs flex flex-col mb-2">
          <div className="bg-secondary/5 px-4 py-3 border-b border-secondary/10 flex items-center justify-between rounded-t-2xl">
            <div>
              <h3 className="font-serif font-bold text-secondary text-base">
                Promo Principal (Fija)
              </h3>
              <span className="text-xs text-primary/60">Siempre primero</span>
            </div>
            {onRestaurarDefault && (
              <button
                type="button"
                onClick={onRestaurarDefault}
                className="text-xs font-semibold px-3 py-1.5 bg-surface-lowest border border-camel/40 rounded-lg text-primary hover:bg-camel/20 transition-colors shadow-xs flex items-center gap-1.5"
                title="Volver al texto y foto locales por defecto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Restaurar Local
              </button>
            )}
          </div>
          <div className="rounded-b-2xl">
            <AdminPromoRow
              promo={defaultHero}
              esVistaDesactivados={!defaultHero.activa}
              onEditar={() => onEditarPromo(defaultHero)}
              onDesactivar={() => onDesactivarPromo(defaultHero)}
              onReactivar={() => onReactivarPromo(defaultHero)}
              onEliminarDefinitivo={() =>
                onEliminarDefinitivaPromo(defaultHero)
              }
            />
          </div>
        </div>
      )}

      {loadingPromos ? (
        <TabPromosSkeleton />
      ) : promosVisibles.length === 0 ? (
        <p className="text-sm text-primary/60 py-6 text-center">
          {filtro === 'desactivadas'
            ? 'No hay promociones desactivadas.'
            : 'Todavía no cargaste ninguna promoción.'}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onReorder}
        >
          <SortableContext
            items={promosVisibles.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col bg-surface-lowest rounded-2xl border border-camel/30 shadow-xs divide-y divide-camel/20">
              {promosVisibles.map((promo) => (
                <SortableRow key={promo.id} id={promo.id}>
                  {(dragHandleProps) => (
                    <AdminPromoRow
                      promo={promo}
                      esVistaDesactivados={filtro === 'desactivadas'}
                      onEditar={() => onEditarPromo(promo)}
                      onDesactivar={() => onDesactivarPromo(promo)}
                      onReactivar={() => onReactivarPromo(promo)}
                      onEliminarDefinitivo={() =>
                        onEliminarDefinitivaPromo(promo)
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
