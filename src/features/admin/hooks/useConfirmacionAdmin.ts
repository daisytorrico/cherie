import { useState } from 'react';
import {
  setServicioActivo,
  eliminarServicioDefinitivo,
  vaciarServiciosDesactivados,
} from '../../servicios/api/serviciosApi';
import {
  setCategoriaActiva,
  eliminarCategoriaDefinitiva,
  vaciarCategoriasDesactivadas,
} from '../../categorias/api/categoriasApi';
import type { Categoria, Servicio } from '../../servicios/types';

export type AccionAdmin =
  'desactivar' | 'reactivar' | 'eliminarDefinitivo' | 'vaciarDesactivados';

export interface ConfirmacionPendiente {
  tipo: 'servicio' | 'categoria' | 'promo';
  accion: AccionAdmin;
  id?: string;
  nombre?: string;
  idsAVaciar?: string[];
  cantidadServiciosAfectados?: number;
}

export function useConfirmacionAdmin(
  serviciosLocales: Servicio[],
  refetchServicios: () => Promise<void> | void,
  refetchCategorias: () => Promise<void> | void,
  togglePromoFn?: (
    id: string,
    activo: boolean
  ) => Promise<{ success: boolean; error?: string }>,
  deletePromoFn?: (id: string) => Promise<{ success: boolean; error?: string }>
) {
  const [confirmacion, setConfirmacion] =
    useState<ConfirmacionPendiente | null>(null);

  // Acciones para servicios
  const pedirDesactivarServicio = (servicio: Servicio) => {
    setConfirmacion({
      tipo: 'servicio',
      accion: 'desactivar',
      id: servicio.id,
      nombre: servicio.nombre,
    });
  };

  const pedirReactivarServicio = (servicio: Servicio) => {
    setConfirmacion({
      tipo: 'servicio',
      accion: 'reactivar',
      id: servicio.id,
      nombre: servicio.nombre,
    });
  };

  const pedirEliminarDefinitivoServicio = (servicio: Servicio) => {
    setConfirmacion({
      tipo: 'servicio',
      accion: 'eliminarDefinitivo',
      id: servicio.id,
      nombre: servicio.nombre,
    });
  };

  // Acciones para categorías
  const pedirDesactivarCategoria = (categoria: Categoria) => {
    const cantidadServiciosAfectados = serviciosLocales.filter(
      (s) => s.categoria === categoria.id && s.activo
    ).length;
    setConfirmacion({
      tipo: 'categoria',
      accion: 'desactivar',
      id: categoria.id,
      nombre: categoria.nombre,
      cantidadServiciosAfectados,
    });
  };

  const pedirReactivarCategoria = (categoria: Categoria) => {
    setConfirmacion({
      tipo: 'categoria',
      accion: 'reactivar',
      id: categoria.id,
      nombre: categoria.nombre,
    });
  };

  const pedirEliminarDefinitivaCategoria = (categoria: Categoria) => {
    const cantidadServiciosAfectados = serviciosLocales.filter(
      (s) => s.categoria === categoria.id
    ).length;
    setConfirmacion({
      tipo: 'categoria',
      accion: 'eliminarDefinitivo',
      id: categoria.id,
      nombre: categoria.nombre,
      cantidadServiciosAfectados,
    });
  };

  // Vaciar desactivados
  const pedirVaciarDesactivados = (
    tipo: 'servicio' | 'categoria' | 'promo',
    ids: string[]
  ) => {
    if (ids.length === 0) return;
    setConfirmacion({ tipo, accion: 'vaciarDesactivados', idsAVaciar: ids });
  };

  // Acciones para promos
  const pedirDesactivarPromo = (promo: any) => {
    setConfirmacion({
      tipo: 'promo',
      accion: 'desactivar',
      id: promo.id,
      nombre: promo.titulo || 'Promo',
    });
  };

  const pedirReactivarPromo = (promo: any) => {
    setConfirmacion({
      tipo: 'promo',
      accion: 'reactivar',
      id: promo.id,
      nombre: promo.titulo || 'Promo',
    });
  };

  const pedirEliminarDefinitivaPromo = (promo: any) => {
    setConfirmacion({
      tipo: 'promo',
      accion: 'eliminarDefinitivo',
      id: promo.id,
      nombre: promo.titulo || 'Promo',
    });
  };

  const ejecutarConfirmacion = async () => {
    if (!confirmacion) return;

    try {
      if (confirmacion.accion === 'desactivar' && confirmacion.id) {
        if (confirmacion.tipo === 'servicio') {
          await setServicioActivo(confirmacion.id, false);
        } else if (confirmacion.tipo === 'categoria') {
          await setCategoriaActiva(confirmacion.id, false);
        } else if (confirmacion.tipo === 'promo' && togglePromoFn) {
          await togglePromoFn(confirmacion.id, false);
        }
      } else if (confirmacion.accion === 'reactivar' && confirmacion.id) {
        if (confirmacion.tipo === 'servicio') {
          await setServicioActivo(confirmacion.id, true);
        } else if (confirmacion.tipo === 'categoria') {
          await setCategoriaActiva(confirmacion.id, true);
        } else if (confirmacion.tipo === 'promo' && togglePromoFn) {
          await togglePromoFn(confirmacion.id, true);
        }
      } else if (
        confirmacion.accion === 'eliminarDefinitivo' &&
        confirmacion.id
      ) {
        if (confirmacion.tipo === 'servicio') {
          await eliminarServicioDefinitivo(confirmacion.id);
        } else if (confirmacion.tipo === 'categoria') {
          await eliminarCategoriaDefinitiva(confirmacion.id);
        } else if (confirmacion.tipo === 'promo' && deletePromoFn) {
          await deletePromoFn(confirmacion.id);
        }
      } else if (
        confirmacion.accion === 'vaciarDesactivados' &&
        confirmacion.idsAVaciar
      ) {
        if (confirmacion.tipo === 'servicio') {
          await vaciarServiciosDesactivados(confirmacion.idsAVaciar);
        } else if (confirmacion.tipo === 'categoria') {
          await vaciarCategoriasDesactivadas(confirmacion.idsAVaciar);
        } else if (confirmacion.tipo === 'promo' && deletePromoFn) {
          for (const id of confirmacion.idsAVaciar) {
            await deletePromoFn(id);
          }
        }
      }

      if (confirmacion.tipo !== 'promo') {
        await Promise.all([refetchServicios(), refetchCategorias()]);
      }
    } catch (err) {
      console.error('Error ejecutando accion de confirmacion:', err);
    } finally {
      setConfirmacion(null);
    }
  };

  const cancelar = () => {
    setConfirmacion(null);
  };

  const mensajeConfirmacion = (() => {
    if (!confirmacion) return '';

    if (confirmacion.accion === 'desactivar') {
      if (
        confirmacion.tipo === 'categoria' &&
        confirmacion.cantidadServiciosAfectados
      ) {
        return `Esta categoría tiene ${confirmacion.cantidadServiciosAfectados} servicio(s) activo(s). Se ocultarán del catálogo.`;
      }
      return `¿Desactivar "${confirmacion.nombre || 'este elemento'}"? Se ocultará del catálogo público.`;
    }

    if (confirmacion.accion === 'reactivar') {
      return `¿Reactivar "${confirmacion.nombre || 'este elemento'}"? Volverá a estar visible en el catálogo.`;
    }

    if (confirmacion.accion === 'eliminarDefinitivo') {
      if (
        confirmacion.tipo === 'categoria' &&
        confirmacion.cantidadServiciosAfectados
      ) {
        return `¿Eliminar la categoría "${confirmacion.nombre}"? Sus ${confirmacion.cantidadServiciosAfectados} servicio(s) quedarán sin categoría.`;
      }
      return `¿Eliminar "${confirmacion.nombre || 'este elemento'}"? Esta acción no se puede deshacer.`;
    }

    if (confirmacion.accion === 'vaciarDesactivados') {
      const count = confirmacion.idsAVaciar?.length || 0;
      return `¿Eliminar los ${count} elementos desactivados? Se borrarán de forma permanente.`;
    }

    return '';
  })();

  return {
    confirmacion,
    mensajeConfirmacion,
    pedirDesactivarServicio,
    pedirReactivarServicio,
    pedirEliminarDefinitivoServicio,
    pedirDesactivarCategoria,
    pedirReactivarCategoria,
    pedirEliminarDefinitivaCategoria,
    pedirDesactivarPromo,
    pedirReactivarPromo,
    pedirEliminarDefinitivaPromo,
    pedirVaciarDesactivados,
    ejecutarConfirmacion,
    cancelar,
  };
}
