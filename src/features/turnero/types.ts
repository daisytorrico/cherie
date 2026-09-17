export interface FranjaHoraria {
  inicio: string;
  fin: string;
}

export type DiaSemana =
  | 'domingo'
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado';

export interface DisponibilidadSemanal {
  domingo: FranjaHoraria[];
  lunes: FranjaHoraria[];
  martes: FranjaHoraria[];
  miercoles: FranjaHoraria[];
  jueves: FranjaHoraria[];
  viernes: FranjaHoraria[];
  sabado: FranjaHoraria[];
}

export interface ServicioEnTurno {
  id: string;
  nombre: string;
  duracion: number;
  precio?: number;
}

export interface Turno {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteAuthUid?: string;
  servicios: ServicioEnTurno[];
  tiempoDescanso?: number;
  estado: 'confirmado' | 'cancelado';
  creadoEn: string;
  canceladoEn?: string;
}

export const DISPONIBILIDAD_DEFAULT: DisponibilidadSemanal = {
  domingo: [],
  lunes: [{ inicio: '09:00', fin: '19:00' }],
  martes: [{ inicio: '09:00', fin: '19:00' }],
  miercoles: [{ inicio: '09:00', fin: '19:00' }],
  jueves: [{ inicio: '09:00', fin: '19:00' }],
  viernes: [{ inicio: '09:00', fin: '19:00' }],
  sabado: [{ inicio: '09:00', fin: '14:00' }],
};

export const DIAS_ORDEN: DiaSemana[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

export function fechaADiaSemana(fechaStr: string): DiaSemana {
  const [year, month, day] = fechaStr.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  const dias: DiaSemana[] = [
    'domingo',
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
  ];
  return dias[fecha.getDay()];
}
