import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../core/firebase';
import type { Servicio } from '../types';
import { fetchCategorias } from '../../categorias/api/categoriasApi';

const SERVICIOS_COLLECTION = 'servicios';

let cachedServicios: Servicio[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos

export function invalidarCacheServicios() {
  cachedServicios = null;
  lastFetchTime = 0;
}

function mapServicios(snapshot: any): Servicio[] {
  return snapshot.docs
    .map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as Omit<Servicio, 'id'>),
    }))
    .sort((a: Servicio, b: Servicio) => (a.orden ?? 0) - (b.orden ?? 0));
}

/**
 * Trae solo los servicios ACTIVOS cuyas categorías también estén ACTIVAS.
 * Previene que servicios de categorías desactivadas aparezcan en el sitio público.
 */
export async function fetchServicios(
  forceRefresh = false
): Promise<Servicio[]> {
  const ahora = Date.now();
  if (
    !forceRefresh &&
    cachedServicios &&
    ahora - lastFetchTime < CACHE_TTL_MS
  ) {
    return cachedServicios;
  }

  const categoriasActivas = await fetchCategorias(forceRefresh);
  const idsCategoriasActivas = new Set(categoriasActivas.map((c) => c.id));

  const q = query(
    collection(db, SERVICIOS_COLLECTION),
    where('activo', '==', true)
  );

  const snapshot = await getDocs(q);
  const todosLosActivos = mapServicios(snapshot);

  cachedServicios = todosLosActivos.filter(
    (s) => !s.categoria || idsCategoriasActivas.has(s.categoria)
  );
  lastFetchTime = ahora;

  return cachedServicios;
}

export async function fetchServiciosPorCategoria(
  categoriaId: string
): Promise<Servicio[]> {
  const categoriasActivas = await fetchCategorias();
  if (!categoriasActivas.some((c) => c.id === categoriaId)) {
    return [];
  }

  const q = query(
    collection(db, SERVICIOS_COLLECTION),
    where('activo', '==', true),
    where('categoria', '==', categoriaId)
  );

  const snapshot = await getDocs(q);

  return mapServicios(snapshot);
}

/**
 * Trae TODOS los servicios (activos e inactivos), para el panel de admin.
 */
export async function fetchServiciosAdmin(): Promise<Servicio[]> {
  const snapshot = await getDocs(collection(db, SERVICIOS_COLLECTION));
  return mapServicios(snapshot);
}

export async function crearServicio(
  data: Omit<Servicio, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, SERVICIOS_COLLECTION), data);
  invalidarCacheServicios();
  return ref.id;
}

export async function actualizarServicio(
  id: string,
  data: Partial<Omit<Servicio, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, SERVICIOS_COLLECTION, id), data);
  invalidarCacheServicios();
}

/**
 * Desactiva o reactiva un servicio (activo: boolean).
 */
export async function setServicioActivo(
  id: string,
  activo: boolean
): Promise<void> {
  await updateDoc(doc(db, SERVICIOS_COLLECTION, id), { activo });
  invalidarCacheServicios();
}

/**
 * Elimina definitivamente un servicio de Firestore.
 */
export async function eliminarServicioDefinitivo(id: string): Promise<void> {
  await deleteDoc(doc(db, SERVICIOS_COLLECTION, id));
  invalidarCacheServicios();
}

/**
 * Elimina definitivamente un lote de servicios desactivados de Firestore usando un solo batch.
 */
export async function vaciarServiciosDesactivados(
  ids: string[]
): Promise<void> {
  if (ids.length === 0) return;
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(doc(db, SERVICIOS_COLLECTION, id)));
  await batch.commit();
  invalidarCacheServicios();
}
