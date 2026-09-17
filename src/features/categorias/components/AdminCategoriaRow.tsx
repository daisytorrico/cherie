import placeholderImg from '../../../assets/placeholder.png';
import { GripVertical, Trash2 } from 'lucide-react';
import { RowActionsMenu } from '../../../components/shared/RowActionsMenu';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Categoria } from '../../servicios/types';

interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
}

interface AdminCategoriaRowProps {
  categoria: Categoria;
  cantidadServicios: number;
  esVistaDesactivados?: boolean;
  onEditar: () => void;
  onDesactivar: () => void;
  onReactivar: () => void;
  onEliminarDefinitivo: () => void;
  dragHandleProps?: DragHandleProps;
}

export function AdminCategoriaRow({
  categoria,
  cantidadServicios,
  esVistaDesactivados = false,
  onEditar,
  onDesactivar,
  onReactivar,
  onEliminarDefinitivo,
  dragHandleProps,
}: AdminCategoriaRowProps) {
  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 bg-transparent transition-colors hover:bg-surface-low/30 relative ${
        categoria.activa ? '' : 'opacity-60 bg-surface-low/50'
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
        <img
          src={categoria.imagenUrl || placeholderImg}
          alt={categoria.nombre}
          className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-serif font-bold capitalize text-secondary text-sm sm:text-base truncate">
            {categoria.nombre}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-primary/60">
            <span className="bg-surface-low px-2.5 py-0.5 rounded-full">
              {cantidadServicios} servicio{cantidadServicios === 1 ? '' : 's'}
            </span>
          </div>
          {!categoria.activa && (
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
        {categoria.activa ? (
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
          activo={Boolean(categoria.activa)}
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
