import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { actualizarServicio } from '../../servicios/api/serviciosApi';
import { actualizarCategoria } from '../../categorias/api/categoriasApi';
import type { Categoria, Servicio } from '../../servicios/types';

export function useReordenamiento(
  serviciosLocales: Servicio[],
  setServiciosLocales: React.Dispatch<React.SetStateAction<Servicio[]>>,
  categoriasLocales: Categoria[],
  setCategoriasLocales: React.Dispatch<React.SetStateAction<Categoria[]>>
) {
  const handleReorderServicios = (catId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const serviciosDeCat = serviciosLocales
      .filter((s) => s.categoria === catId)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

    const oldIndex = serviciosDeCat.findIndex((s) => s.id === active.id);
    const newIndex = serviciosDeCat.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordenados = arrayMove(serviciosDeCat, oldIndex, newIndex).map(
      (s, idx) => ({ ...s, orden: idx })
    );
    const restoServicios = serviciosLocales.filter(
      (s) => s.categoria !== catId
    );

    setServiciosLocales([...restoServicios, ...reordenados]);
    Promise.all(
      reordenados.map((s, idx) => actualizarServicio(s.id, { orden: idx }))
    ).catch(console.error);
  };

  const handleReorderCategorias = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const catsOrdenadas = [...categoriasLocales].sort(
      (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
    );
    const oldIndex = catsOrdenadas.findIndex((c) => c.id === active.id);
    const newIndex = catsOrdenadas.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordenadas = arrayMove(catsOrdenadas, oldIndex, newIndex).map(
      (c, idx) => ({ ...c, orden: idx })
    );
    setCategoriasLocales(reordenadas);
    Promise.all(
      reordenadas.map((c, idx) => actualizarCategoria(c.id, { orden: idx }))
    ).catch(console.error);
  };

  return { handleReorderServicios, handleReorderCategorias };
}
