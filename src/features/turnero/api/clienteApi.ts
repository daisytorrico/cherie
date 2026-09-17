import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '../../../core/firebase';

export interface ClienteRecord {
  uid: string;
  telefono?: string;
  nombre?: string;
  notasInternas?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

const COLECCION = 'clientes';

export async function obtenerClientePorUid(
  uid: string
): Promise<ClienteRecord | null> {
  if (!uid) return null;
  try {
    const docRef = doc(db, COLECCION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as ClienteRecord;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    return null;
  }
}

let cacheClientes: ClienteRecord[] | null = null;
let lastCacheTime = 0;

export async function buscarClientesPorNombre(
  texto: string
): Promise<ClienteRecord[]> {
  if (!texto || texto.length < 2) return [];

  const now = Date.now();
  // Cachear por 10 segundos para evitar spam al escribir, pero mantener la lista fresca
  if (!cacheClientes || now - lastCacheTime > 1000 * 10) {
    try {
      const q = query(collection(db, COLECCION));
      const querySnapshot = await getDocs(q);
      cacheClientes = querySnapshot.docs.map(
        (doc) => ({ uid: doc.id, ...doc.data() }) as ClienteRecord
      );
      lastCacheTime = now;
    } catch (error) {
      console.error('Error buscando clientes:', error);
      return [];
    }
  }

  const queryLower = texto.toLowerCase();
  return cacheClientes
    .filter(
      (c) =>
        c.nombre?.toLowerCase().includes(queryLower) ||
        c.telefono?.includes(queryLower)
    )
    .slice(0, 10);
}

export async function buscarClientePorTelefono(
  telefono: string
): Promise<ClienteRecord | null> {
  if (!telefono) return null;
  try {
    const q = query(
      collection(db, COLECCION),
      where('telefono', '==', telefono),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { uid: docSnap.id, ...docSnap.data() } as ClienteRecord;
    }
    return null;
  } catch (error) {
    console.error('Error buscando cliente por telefono:', error);
    return null;
  }
}

export async function guardarNotasCliente(
  uid: string,
  notas: string,
  datosBasicos?: { telefono?: string; nombre?: string }
): Promise<void> {
  if (!uid) return;
  try {
    const docRef = doc(db, COLECCION, uid);
    const docSnap = await getDoc(docRef);

    const now = new Date().toISOString();
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        notasInternas: notas,
        actualizadoEn: now,
      });
    } else {
      await setDoc(docRef, {
        uid,
        notasInternas: notas,
        creadoEn: now,
        actualizadoEn: now,
        telefono: datosBasicos?.telefono || '',
        nombre: datosBasicos?.nombre || '',
      });
    }
  } catch (error) {
    console.error('Error guardando notas del cliente:', error);
    throw error;
  }
}
