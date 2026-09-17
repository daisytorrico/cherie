import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useCategoriasAdmin } from '../../categorias/hooks/useCategoriasAdmin';
import { useServiciosAdmin } from '../../servicios/hooks/useServiciosAdmin';
import { useReordenamiento } from '../hooks/useReordenamiento';
import { useConfirmacionAdmin } from '../hooks/useConfirmacionAdmin';
import { ServicioFormModal } from '../../servicios/components/ServFormModal';
import { CategoriaFormModal } from '../../categorias/components/CategFormModal';
import { ConfirmDialog } from '../../../components/shared';
import type { Categoria, Servicio } from '../../servicios/types';

type Pestania = 'servicios' | 'categorias' | 'promos';

import { ArrowUpDown } from 'lucide-react';
import { TabServicios } from './TabServicios';
import { TabCategorias } from './TabCategorias';
import { TabPromos } from './TabPromos';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { usePromosAdmin } from '../../promos/hooks/usePromosAdmin';
import { PromoFormModal } from './PromoFormModal';
import type { Promo } from '../../promos/types';
const OPCIONES_PESTANIAS = [
  { value: 'servicios' as const, label: 'Servicios' },
  { value: 'categorias' as const, label: 'Categorías' },
  { value: 'promos' as const, label: 'Promos' },
];

export function AdminPanel() {
  const [pestania, setPestania] = useState<Pestania>('servicios');
  const {
    servicios,
    loading: loadingServicios,
    refetch: refetchServicios,
  } = useServiciosAdmin();
  const {
    categorias,
    loading: loadingCategorias,
    refetch: refetchCategorias,
  } = useCategoriasAdmin();
  const {
    promos,
    loading: loadingPromos,
    reorderPromos,
    togglePromo,
    deletePromo,
    savePromo,
  } = usePromosAdmin();
  const [serviciosLocales, setServiciosLocales] = useState<Servicio[]>([]);
  const [categoriasLocales, setCategoriasLocales] = useState<Categoria[]>([]);
  const [promosLocales, setPromosLocales] = useState<Promo[]>([]);

  useEffect(() => {
    setServiciosLocales(servicios);
  }, [servicios]);

  useEffect(() => {
    setCategoriasLocales(categorias);
  }, [categorias]);

  useEffect(() => {
    setPromosLocales(promos);
  }, [promos]);

  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(
    null
  );
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [categoriaPorDefectoModal, setCategoriaPorDefectoModal] = useState<
    string | undefined
  >(undefined);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(
    null
  );
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);

  const [promoEditando, setPromoEditando] = useState<Promo | null>(null);
  const [modalPromoAbierto, setModalPromoAbierto] = useState(false);
  const [confirmRestaurarHero, setConfirmRestaurarHero] = useState(false);

  const categoriasActivas = categoriasLocales.filter((c) => c.activa);
  const siguienteOrdenServicio =
    serviciosLocales.length > 0
      ? Math.max(...serviciosLocales.map((s) => s.orden ?? 0)) + 1
      : 0;
  const siguienteOrdenCategoria =
    categoriasLocales.length > 0
      ? Math.max(...categoriasLocales.map((c) => c.orden ?? 0)) + 1
      : 0;

  const abrirNuevoServicio = (catId?: string) => {
    setServicioEditando(null);
    setCategoriaPorDefectoModal(catId ?? categoriasActivas[0]?.id);
    setModalServicioAbierto(true);
  };

  const abrirEditarServicio = (servicio: Servicio) => {
    setServicioEditando(servicio);
    setCategoriaPorDefectoModal(servicio.categoria);
    setModalServicioAbierto(true);
  };

  const abrirNuevaCategoria = () => {
    setCategoriaEditando(null);
    setModalCategoriaAbierto(true);
  };

  const abrirEditarCategoria = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setModalCategoriaAbierto(true);
  };

  const abrirNuevaPromo = () => {
    setPromoEditando(null);
    setModalPromoAbierto(true);
  };

  const abrirEditarPromo = (promo: Promo) => {
    setPromoEditando(promo);
    setModalPromoAbierto(true);
  };

  const handleReorderPromos = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = promosLocales.findIndex((c) => c.id === active.id);
      const newIndex = promosLocales.findIndex((c) => c.id === over.id);
      const newArray = [...promosLocales];
      const [movedItem] = newArray.splice(oldIndex, 1);
      newArray.splice(newIndex, 0, movedItem);
      // Actualizar local optimista
      setPromosLocales(newArray);
      // Guardar en backend
      reorderPromos(newArray);
    }
  };

  const handleRestaurarHeroDefecto = () => {
    setConfirmRestaurarHero(true);
  };

  const ejecutarRestaurarHero = async () => {
    setConfirmRestaurarHero(false);
    try {
      await savePromo({
        id: 'default-hero',
        titulo: '',
        subtitulo: '',
        imagenUrl: 'default',
        activa: true,
        esSistema: true,
        orden: -1,
      });
    } catch (error) {
      console.error('Error restaurando hero', error);
    }
  };

  const { handleReorderServicios, handleReorderCategorias } = useReordenamiento(
    serviciosLocales,
    setServiciosLocales,
    categoriasLocales,
    setCategoriasLocales
  );

  const {
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
    cancelar: cancelarConfirmacion,
  } = useConfirmacionAdmin(
    serviciosLocales,
    refetchServicios,
    refetchCategorias,
    togglePromo,
    deletePromo
  );

  const pedirVaciarDesactivadasPromos = (ids: string[]) =>
    pedirVaciarDesactivados('promo', ids);

  const [modoOrden, setModoOrden] = useState(false);

  // Sensores de arrastre solo activos si modoOrden === true
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const sensorsActive = useSensors(pointerSensor);
  const emptySensors = useSensors();
  const sensorsToUse = modoOrden ? sensorsActive : emptySensors;

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 lg:p-6 space-y-4">
      {/* Barra de herramientas unificada y compacta */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-surface-lowest border border-camel/30 p-2.5 sm:p-3 rounded-2xl shadow-xs">
        {/* Izquierda: Pestañas + Toggle Menú Móvil + Toggle Reordenar */}
        <div className="flex items-center gap-2 justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <SegmentedControl
              options={OPCIONES_PESTANIAS}
              value={pestania}
              onChange={(p) => setPestania(p as Pestania)}
              layoutId="activePestaniaPill"
            />
          </div>

          {/* Botón Reordenar (Mobile: Ícono compacto / Desktop: Texto) */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setModoOrden((prev) => !prev)}
            className={`rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
              modoOrden
                ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-xs px-2.5 sm:px-3 py-1.5 text-xs'
                : 'bg-surface-low text-primary/40 border-camel/20 opacity-75 hover:opacity-100 hover:text-primary px-2.5 sm:px-3 py-1.5 text-xs'
            }`}
            title={
              modoOrden
                ? 'Reordenar activo (haz click para bloquear)'
                : 'Reordenar bloqueado (haz click para activar)'
            }
          >
            <ArrowUpDown className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Reordenar</span>
          </motion.button>
        </div>

        {/* Acciones e Insumos según la pestaña activa */}
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {pestania === 'servicios' ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => abrirNuevoServicio()}
              className="btn-primary whitespace-nowrap text-xs py-2 px-4 w-full sm:w-auto text-center cursor-pointer shadow-xs"
            >
              + Nuevo Servicio
            </motion.button>
          ) : pestania === 'categorias' ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={abrirNuevaCategoria}
              className="btn-primary whitespace-nowrap text-xs py-2 px-4 w-full sm:w-auto text-center cursor-pointer shadow-xs"
            >
              + Nueva Categoría
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!promosLocales.some((p) => p.id === 'default-hero') && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleRestaurarHeroDefecto}
                  className="bg-surface-low border border-camel/30 text-primary hover:bg-camel/10 whitespace-nowrap text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors shadow-xs"
                >
                  Restaurar Original
                </motion.button>
              )}
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.02 }}
                onClick={abrirNuevaPromo}
                className="btn-primary whitespace-nowrap text-xs py-2 px-4 w-full sm:w-auto text-center cursor-pointer shadow-xs"
              >
                + Nueva Promo
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* RENDERIZADO SEGÚN PESTAÑA CON ANIMACIÓN SUAVE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pestania}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full"
        >
          {pestania === 'servicios' ? (
            <TabServicios
              serviciosLocales={serviciosLocales}
              categoriasLocales={categoriasLocales}
              loadingServicios={loadingServicios}
              sensors={sensorsToUse}
              onReorder={handleReorderServicios}
              onAgregarServicio={abrirNuevoServicio}
              onEditarServicio={abrirEditarServicio}
              onDesactivarServicio={pedirDesactivarServicio}
              onReactivarServicio={pedirReactivarServicio}
              onEliminarDefinitivoServicio={pedirEliminarDefinitivoServicio}
              onVaciarDesactivados={(ids) =>
                pedirVaciarDesactivados('servicio', ids)
              }
            />
          ) : pestania === 'categorias' ? (
            <TabCategorias
              categoriasLocales={categoriasLocales}
              serviciosLocales={serviciosLocales}
              loadingCategorias={loadingCategorias}
              sensors={sensorsToUse}
              onReorder={handleReorderCategorias}
              onAgregarCategoria={abrirNuevaCategoria}
              onEditarCategoria={abrirEditarCategoria}
              onDesactivarCategoria={pedirDesactivarCategoria}
              onReactivarCategoria={pedirReactivarCategoria}
              onEliminarDefinitivaCategoria={pedirEliminarDefinitivaCategoria}
              onVaciarDesactivadas={(ids) =>
                pedirVaciarDesactivados('categoria', ids)
              }
            />
          ) : pestania === 'promos' ? (
            <TabPromos
              promosLocales={promosLocales}
              loadingPromos={loadingPromos}
              sensors={sensorsToUse}
              onReorder={handleReorderPromos}
              onEditarPromo={abrirEditarPromo}
              onDesactivarPromo={pedirDesactivarPromo}
              onReactivarPromo={pedirReactivarPromo}
              onEliminarDefinitivaPromo={pedirEliminarDefinitivaPromo}
              onVaciarDesactivadas={pedirVaciarDesactivadasPromos}
              onRestaurarDefault={handleRestaurarHeroDefecto}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Modales */}
      <ServicioFormModal
        open={modalServicioAbierto}
        servicioEditando={servicioEditando}
        categorias={categoriasActivas}
        categoriaPorDefecto={categoriaPorDefectoModal}
        siguienteOrden={siguienteOrdenServicio}
        onClose={() => setModalServicioAbierto(false)}
        onGuardado={refetchServicios}
      />
      <CategoriaFormModal
        open={modalCategoriaAbierto}
        categoriaEditando={categoriaEditando}
        siguienteOrden={siguienteOrdenCategoria}
        onClose={() => setModalCategoriaAbierto(false)}
        onGuardado={refetchCategorias}
      />
      <PromoFormModal
        open={modalPromoAbierto}
        promoEditando={promoEditando}
        siguienteOrden={
          promosLocales.length > 0
            ? Math.max(...promosLocales.map((p) => p.orden ?? 0)) + 1
            : 0
        }
        onClose={() => setModalPromoAbierto(false)}
        onGuardado={async (payload) => {
          // Use a dynamic import or the hook function to save
          // We need usePromosAdmin to save... wait! `savePromo` is returned by usePromosAdmin.
          // We forgot to destructure it! Let me destructure it above.
          return await savePromo(payload);
        }}
      />
      <ConfirmDialog
        open={confirmacion !== null}
        titulo={
          confirmacion?.accion === 'desactivar'
            ? 'Desactivar'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar'
              : confirmacion?.accion === 'vaciarDesactivados'
                ? 'Vaciar Desactivados'
                : 'Eliminar Definitivamente'
        }
        mensaje={mensajeConfirmacion}
        confirmarTexto={
          confirmacion?.accion === 'desactivar'
            ? 'Desactivar'
            : confirmacion?.accion === 'reactivar'
              ? 'Reactivar'
              : 'Eliminar Definitivamente'
        }
        destructivo={
          confirmacion?.accion === 'eliminarDefinitivo' ||
          confirmacion?.accion === 'vaciarDesactivados'
        }
        onConfirm={ejecutarConfirmacion}
        onCancel={cancelarConfirmacion}
      />
      <ConfirmDialog
        open={confirmRestaurarHero}
        titulo="Restaurar Diseño Original"
        mensaje="¿Estás seguro de que deseas borrar la foto y frase actuales para volver al diseño local original?"
        confirmarTexto="Restaurar"
        destructivo={true}
        palabraConfirmacion="restaurar"
        onConfirm={ejecutarRestaurarHero}
        onCancel={() => setConfirmRestaurarHero(false)}
      />
    </div>
  );
}
