import type { ServicioEnTurno } from '../../turnero/types';

export type VistaAgenda = 'dia' | 'semana' | 'mes';

export type EstadoTurnoAdmin =
  'confirmado' | 'en_proceso' | 'completado' | 'cancelado';

export interface TurnoAdmin {
  id: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteAuthUid?: string;
  clienteEmail?: string;
  servicioNombre: string;
  servicios?: ServicioEnTurno[];
  fecha: string; // "YYYY-MM-DD"
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  duracionMinutos: number;
  tiempoDescanso?: number;
  precioTotal: number;
  estado: EstadoTurnoAdmin;
  notas?: string;
}
