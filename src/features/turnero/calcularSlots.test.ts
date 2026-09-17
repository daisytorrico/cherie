import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calcularSlots } from './calcularSlots';
import type { FranjaHoraria, TurnoOcupado } from './calcularSlots';

describe('calcularSlots', () => {
  // Franja estándar de prueba: de 09:00 a 18:00
  const franjas: FranjaHoraria[] = [{ inicio: '09:00', fin: '18:00' }];

  // Mockeamos la fecha actual para testear restricciones de "hoy"
  beforeEach(() => {
    vi.useFakeTimers();
    // Seteamos el día actual a 2024-01-10 a las 10:00 AM
    vi.setSystemTime(new Date(2024, 0, 10, 10, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debería retornar vacío si la duración es 0 o negativa', () => {
    const slots = calcularSlots(franjas, [], 0);
    expect(slots).toEqual([]);
  });

  it('debería retornar vacío si la fecha es en el pasado', () => {
    const slots = calcularSlots(franjas, [], 30, 30, '2024-01-09');
    expect(slots).toEqual([]);
  });

  it('debería retornar slots correctos para un día completamente libre', () => {
    // Pedimos turnos de 60 mins cada 60 mins, un día en el futuro para evitar la regla de "hoy"
    const slots = calcularSlots(franjas, [], 60, 60, '2024-01-11');
    expect(slots).toEqual([
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ]);
  });

  it('debería omitir slots ocupados correctamente', () => {
    const ocupados: TurnoOcupado[] = [
      { horaInicio: '10:00', horaFin: '11:00' },
      { horaInicio: '14:00', horaFin: '15:30' },
    ];

    // Pedimos turnos de 60 mins cada 60 mins
    const slots = calcularSlots(franjas, ocupados, 60, 60, '2024-01-11');

    // El algoritmo optimiza tiempo (Opción A), así que arranca a contar a las 15:30 exactas.
    expect(slots).toEqual([
      '09:00',
      '11:00',
      '12:00',
      '13:00',
      '15:30',
      '16:30',
    ]);
  });

  it('debería soportar múltiples franjas horarias (corte de mediodía)', () => {
    const franjasCortadas: FranjaHoraria[] = [
      { inicio: '09:00', fin: '13:00' },
      { inicio: '15:00', fin: '19:00' },
    ];

    // Turno de 90 min (1:30h).
    const slots = calcularSlots(franjasCortadas, [], 90, 60, '2024-01-11');

    // Franja 1: 09:00 (termina 10:30), 10:00 (termina 11:30), 11:00 (termina 12:30).
    // 12:00 no entra (termina 13:30, fuera de franja).
    // Franja 2: 15:00, 16:00, 17:00.
    // 18:00 no entra (termina 19:30).
    expect(slots).toEqual([
      '09:00',
      '10:00',
      '11:00',
      '15:00',
      '16:00',
      '17:00',
    ]);
  });

  it('no debería permitir turnos que caen sobre el borde de un turno ocupado', () => {
    const ocupados: TurnoOcupado[] = [
      { horaInicio: '11:15', horaFin: '12:00' },
    ];

    // Pedimos turno de 60 mins con intervalo de 30 mins
    const slots = calcularSlots(franjas, ocupados, 60, 30, '2024-01-11');

    // 10:00 entra (termina 11:00)
    // 10:30 NO entra (termina 11:30, choca)
    // 11:00 NO entra
    // 12:00 entra (termina 13:00)
    expect(slots).toContain('10:00');
    expect(slots).not.toContain('10:30');
    expect(slots).not.toContain('11:00');
    expect(slots).toContain('12:00');
  });

  it('debería filtrar turnos del pasado en el día de hoy (margen de 15 min)', () => {
    // Hoy es 10:00 AM (fijado en el beforeEach)
    const slots = calcularSlots(franjas, [], 60, 30, '2024-01-10');

    // No deberíamos ver nada antes de las 10:15
    expect(slots).not.toContain('09:00');
    expect(slots).not.toContain('09:30');
    expect(slots).not.toContain('10:00');
    expect(slots).toContain('10:30');
    expect(slots).toContain('11:00');
  });

  it('debería calcular correctamente cuando el hueco libre es EXACTAMENTE del tamaño del turno pedido', () => {
    const ocupados: TurnoOcupado[] = [
      { horaInicio: '09:00', horaFin: '10:00' },
      { horaInicio: '11:00', horaFin: '12:00' },
    ];

    // Queda libre solo de 10:00 a 11:00 (exactamente 60 mins)
    // Pedimos turno de 60 mins
    const slots = calcularSlots(franjas, ocupados, 60, 30, '2024-01-11');

    expect(slots).toContain('10:00');
    expect(slots).not.toContain('10:30');
  });
});
