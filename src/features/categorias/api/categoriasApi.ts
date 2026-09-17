import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '../../../core/firebase';
import type { Categoria } from '../../servicios/types';

import { invalidarCacheServicios } from '../../servicios/api/serviciosApi';

const CATEGORIAS_COLLECTION = 'categorias';

let cachedCategorias: Categoria[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos

export function invalidarCacheCategorias() {
  cachedCategorias = null;
  lastFetchTime = 0;
}

export async function fetchCategorias(
  forceRefresh = false
): Promise<Categoria[]> {
  const ahora = Date.now();
  if (
    !forceRefresh &&
    cachedCategorias &&
    ahora - lastFetchTime < CACHE_TTL_MS
  ) {
    return cachedCategorias;
  }

  const q = query(
    collection(db, CATEGORIAS_COLLECTION),
    where('activa', '==', true),
    orderBy('orden')
  );

  const snapshot = await getDocs(q);

  cachedCategorias = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Categoria[];
  lastFetchTime = ahora;

  return cachedCategorias;
}

/**
 * Trae TODAS las categorías (activas e inactivas), para el panel de admin.
 * El público (fetchCategorias) solo ve las activas.
 */
export async function fetchCategoriasAdmin(): Promise<Categoria[]> {
  const q = query(collection(db, CATEGORIAS_COLLECTION), orderBy('orden'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Categoria[];
}

export async function crearCategoria(
  data: Omit<Categoria, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, CATEGORIAS_COLLECTION), data);
  invalidarCacheCategorias();
  return ref.id;
}

export async function actualizarCategoria(
  id: string,
  data: Partial<Omit<Categoria, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, CATEGORIAS_COLLECTION, id), data);
  invalidarCacheCategorias();
}

/**
 * Desactiva o reactiva una categoría (activa: boolean).
 */
export async function setCategoriaActiva(
  id: string,
  activa: boolean
): Promise<void> {
  await updateDoc(doc(db, CATEGORIAS_COLLECTION, id), { activa });
  invalidarCacheCategorias();
}

export async function eliminarCategoriaDefinitiva(id: string): Promise<void> {
  const batch = writeBatch(db);

  // Desvincular servicios pertenecientes a esta categoría
  const qServicios = query(
    collection(db, 'servicios'),
    where('categoria', '==', id)
  );
  const snapServicios = await getDocs(qServicios);
  snapServicios.docs.forEach((d) => {
    batch.update(d.ref, { categoria: '' });
  });

  batch.delete(doc(db, CATEGORIAS_COLLECTION, id));
  await batch.commit();

  invalidarCacheCategorias();
  invalidarCacheServicios();
}

/**
 * Elimina definitivamente un lote de categorías desactivadas y desvincula atómicamente sus servicios en un solo batch.
 */
export async function vaciarCategoriasDesactivadas(
  ids: string[]
): Promise<void> {
  if (ids.length === 0) return;
  const batch = writeBatch(db);

  for (const catId of ids) {
    const qServicios = query(
      collection(db, 'servicios'),
      where('categoria', '==', catId)
    );
    const snapServicios = await getDocs(qServicios);
    snapServicios.docs.forEach((d) => {
      batch.update(d.ref, { categoria: '' });
    });
    batch.delete(doc(db, CATEGORIAS_COLLECTION, catId));
  }

  await batch.commit();

  invalidarCacheCategorias();
  invalidarCacheServicios();
}
