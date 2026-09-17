import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase';
import { DISPONIBILIDAD_DEFAULT, type DisponibilidadSemanal } from '../types';

const DOC_REF = doc(db, 'configuracion', 'disponibilidad');

let cachedDisponibilidad: DisponibilidadSemanal | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // Cache en memoria por 1 minuto

export async function fetchDisponibilidad(
  forceRefresh = false
): Promise<DisponibilidadSemanal> {
  const ahora = Date.now();
  if (
    !forceRefresh &&
    cachedDisponibilidad &&
    ahora - lastFetchTime < CACHE_TTL_MS
  ) {
    return cachedDisponibilidad;
  }

  const snap = await getDoc(DOC_REF);
  if (!snap.exists()) {
    cachedDisponibilidad = DISPONIBILIDAD_DEFAULT;
  } else {
    cachedDisponibilidad = snap.data() as DisponibilidadSemanal;
  }
  lastFetchTime = ahora;
  return cachedDisponibilidad;
}

export async function guardarDisponibilidad(
  data: DisponibilidadSemanal
): Promise<void> {
  await setDoc(DOC_REF, data);
  cachedDisponibilidad = data;
  lastFetchTime = Date.now();
}
