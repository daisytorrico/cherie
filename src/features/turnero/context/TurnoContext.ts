import { createContext, useContext } from 'react';
import type { Servicio } from '../../servicios/types';

export interface ServicioSeleccionado {
  servicio: Servicio;
  cantidad: number;
}

export interface TurnoContextValue {
  seleccionados: ServicioSeleccionado[];
  agregarServicio: (servicio: Servicio) => void;
  quitarServicio: (id: string) => void;
  clienteNombre: string;
  setClienteNombre: (nombre: string) => void;
  clienteTelefono: string;
  setClienteTelefono: (telefono: string) => void;
  fecha: string;
  setFecha: (fecha: string) => void;
  horaSeleccionada: string | null;
  setHoraSeleccionada: (hora: string | null) => void;
  duracionTotal: number;
  slots: string[];
  loadingSlots: boolean;
  enviado: boolean;
  enviando: boolean;
  error: string | null;
  enviarSolicitud: () => Promise<void>;
  reiniciarProceso: () => void;
  carritoAbierto: boolean;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
  clienteAuthUid: string | null;
  clienteEmail: string | null;
  clienteFotoUrl: string | null;
  loadingAuth: boolean;
  iniciarSesionConGoogle: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

export const TurnoContext = createContext<TurnoContextValue | undefined>(
  undefined
);

export function useTurnoContext() {
  const context = useContext(TurnoContext);
  if (!context) {
    throw new Error('useTurnoContext must be used within a TurnoProvider');
  }
  return context;
}
