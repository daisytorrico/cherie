import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { crearTurno } from './turnoApi';

vi.mock('../../../core/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn().mockResolvedValue({ docs: [] }),
    doc: vi.fn().mockReturnValue({ id: 'turno-id-123' }),
    runTransaction: vi.fn(async (_db, callback) => {
      const mockTransaction = {
        set: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
      };
      return callback(mockTransaction);
    }),
    orderBy: vi.fn(),
    updateDoc: vi.fn(),
  };
});

describe('crearTurno', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-05T08:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe crear un turno correctamente para la fecha actual a las 09:00 hs sin lanzar excepciones', async () => {
    const params = {
      fecha: '2026-08-05',
      horaInicio: '09:00',
      clienteNombre: 'Juan Pérez',
      clienteTelefono: '1122334455',
      servicios: [{ id: 'serv-1', nombre: 'Corte de pelo', duracion: 30 }],
      franjasDelDia: [{ inicio: '09:00', fin: '19:00' }],
    };

    const id = await crearTurno(params);

    expect(id).toBe('turno-id-123');
  });

  it('debe lanzar error SLOT_NO_DISPONIBLE si el horario solicitado no está dentro de las franjas', async () => {
    const params = {
      fecha: '2026-08-05',
      horaInicio: '08:00',
      clienteNombre: 'María López',
      clienteTelefono: '1199887766',
      servicios: [{ id: 'serv-1', nombre: 'Corte de pelo', duracion: 30 }],
      franjasDelDia: [{ inicio: '09:00', fin: '19:00' }],
    };

    await expect(crearTurno(params)).rejects.toThrow('SLOT_NO_DISPONIBLE');
  });

  it('debe prevenir sobreventa ante reservas concurrentes simuladas para el mismo slot', async () => {
    const params = {
      fecha: '2026-08-05',
      horaInicio: '09:00',
      clienteNombre: 'Cliente Concurrente',
      clienteTelefono: '1234567890',
      servicios: [{ id: 'serv-1', nombre: 'Test', duracion: 30 }],
      franjasDelDia: [{ inicio: '09:00', fin: '19:00' }],
    };

    // Simulamos que getDocs() devuelve vacío la primera vez, y ocupado la segunda vez.
    // Esto simula que la base de datos se actualizó entre los dos intentos (gracias al reintento de la transacción).
    const getDocsMock = (await import('firebase/firestore'))
      .getDocs as ReturnType<typeof vi.fn>;

    getDocsMock
      .mockResolvedValueOnce({ docs: [] }) // Intento 1: libre
      .mockResolvedValueOnce({
        // Intento 2 (concurrente fallido): ya está ocupado
        docs: [
          {
            data: () => ({ horaInicio: '09:00', horaFin: '09:30' }),
            id: 'turno-ya-creado',
          },
        ],
      });

    // Simulamos la primera creación exitosa
    const idExitoso = await crearTurno(params);
    expect(idExitoso).toBe('turno-id-123');

    // La segunda creación falla por estar ocupado
    await expect(crearTurno(params)).rejects.toThrow('SLOT_NO_DISPONIBLE');

    // Además verificamos que se esté aplicando el lock
    const docMock = (await import('firebase/firestore')).doc as ReturnType<
      typeof vi.fn
    >;
    expect(docMock).toHaveBeenCalledWith(
      expect.anything(),
      'locks',
      '2026-08-05'
    );
  });
});
