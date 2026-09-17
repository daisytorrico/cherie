import { describe, it, expect } from 'vitest';
import { puedeCancelarEnApp } from './cancelacion';

describe('Regla de Cancelación de 48 horas', () => {
  const fechaSimuladaAhora = new Date('2026-08-01T10:00:00');

  it('debe PERMITIR la cancelación si faltan más de 48 horas (ej. 72hs antes)', () => {
    const fechaTurno = '2026-08-04';
    const horaTurno = '10:00';

    const resultado = puedeCancelarEnApp(
      fechaTurno,
      horaTurno,
      fechaSimuladaAhora
    );
    expect(resultado).toBe(true);
  });

  it('debe PERMITIR la cancelación si faltan EXACTAMENTE 48 horas', () => {
    const fechaTurno = '2026-08-03';
    const horaTurno = '10:00';

    const resultado = puedeCancelarEnApp(
      fechaTurno,
      horaTurno,
      fechaSimuladaAhora
    );
    expect(resultado).toBe(true);
  });

  it('debe BLOQUEAR la cancelación si faltan menos de 48 horas (ej. 24hs antes)', () => {
    const fechaTurno = '2026-08-02';
    const horaTurno = '10:00';

    const resultado = puedeCancelarEnApp(
      fechaTurno,
      horaTurno,
      fechaSimuladaAhora
    );
    expect(resultado).toBe(false);
  });

  it('debe BLOQUEAR la cancelación si el turno es el mismo día u horas pasadas', () => {
    const fechaTurno = '2026-08-01';
    const horaTurno = '09:00';

    const resultado = puedeCancelarEnApp(
      fechaTurno,
      horaTurno,
      fechaSimuladaAhora
    );
    expect(resultado).toBe(false);
  });
});
