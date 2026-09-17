import { GripVertical, Trash2, Image as ImageIcon } from 'lucide-react';
import { RowActionsMenu } from '../../../components/shared/RowActionsMenu';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Promo } from '../../promos/types';
import heroThumb from '../../../assets/hero1.opt.webp';
import { SITE_CONFIG } from '../../../core/config';

interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
}

interface AdminPromoRowProps {
  promo: Promo;
  esVistaDesactivados?: boolean;
  onEditar: () => void;
  onDesactivar: () => void;
  onReactivar: () => void;
  onEliminarDefinitivo: () => void;
  dragHandleProps?: DragHandleProps;
}

export function AdminPromoRow({
  promo,
  esVistaDesactivados = false,
  onEditar,
  onDesactivar,
  onReactivar,
  onEliminarDefinitivo,
  dragHandleProps,
}: AdminPromoRowProps) {
  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 bg-transparent transition-colors hover:bg-surface-low/30 relative ${
        promo.activa ? '' : 'opacity-60 bg-surface-low/50'
      }`}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
          style={{ touchAction: 'none' }}
          className="flex items-center justify-center h-8 w-6 shrink-0 text-primary/30 hover:text-primary cursor-grab active:cursor-grabbing -ml-1 sm:ml-0"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}

      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="relative h-12 w-20 sm:h-14 sm:w-24 shrink-0 rounded-xl overflow-hidden bg-surface-low border border-camel/20">
          {!promo.imagenUrl || promo.imagenUrl === 'default' ? (
            <img
              src={heroThumb}
              alt={promo.titulo || 'Promo Hero'}
              className="h-full w-full object-cover"
            />
          ) : promo.imagenUrl ? (
            <img
              src={promo.imagenUrl}
              alt={promo.titulo || 'Promo Hero'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full text-primary/40">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif font-bold capitalize text-secondary text-sm sm:text-base truncate">
            {promo.titulo ||
              (promo.id === 'default-hero'
                ? 'Tu belleza, nuestra pasión'
                : 'Sin título')}
          </p>
          <p className="text-xs sm:text-sm text-primary/60 truncate mt-0.5 sm:mt-1 font-light">
            {promo.id === 'default-hero' && !promo.subtitulo
              ? SITE_CONFIG.name
              : promo.subtitulo || 'Sin descripción'}
          </p>
          {!promo.activa && (
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-low/50 px-2 py-0.5 rounded-md border border-on-surface-variant/30">
              Desactivada
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEditar}
          className="rounded-full border border-camel/40 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-surface-low transition-colors cursor-pointer"
        >
          Editar
        </button>
        {promo.activa ? (
          <button
            type="button"
            onClick={onDesactivar}
            className="rounded-full border border-on-surface-variant/40 text-on-surface-variant hover:bg-surface-low/50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Desactivar
          </button>
        ) : esVistaDesactivados ? (
          <>
            <button
              type="button"
              onClick={onReactivar}
              className="rounded-full border border-emerald-500/40 text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reactivar
            </button>
            <button
              type="button"
              onClick={onEliminarDefinitivo}
              className="rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 p-2 text-xs font-semibold uppercase transition-colors cursor-pointer flex items-center gap-1"
              title="Eliminar definitivamente"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onReactivar}
            className="rounded-full border border-emerald-500/40 text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Reactivar
          </button>
        )}
      </div>

      <div className="sm:hidden shrink-0">
        <RowActionsMenu
          activo={Boolean(promo.activa)}
          esVistaDesactivados={esVistaDesactivados}
          onEditar={onEditar}
          onDesactivar={onDesactivar}
          onReactivar={onReactivar}
          onEliminarDefinitivo={onEliminarDefinitivo}
        />
      </div>
    </div>
  );
}
