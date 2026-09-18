import { describe, it, expect } from 'vitest';
import {
  formatearDuracion,
  calcularHoraFin,
  obtenerEtiquetaEstado,
  formatearFechaLegible,
  obtenerEstiloEstado,
  esSlotEnPasado,
  esTurnoActual,
  esTurnoPasado,
} from './agendaFormato';

describe('agendaFormato Utils - Clean Architecture & TDD', () => {
  describe('formatearDuracion', () => {
    it('debe formatear minutos menores a una hora', () => {
      expect(formatearDuracion(15)).toBe('15 min');
      expect(formatearDuracion(45)).toBe('45 min');
      expect(formatearDuracion(59)).toBe('59 min');
    });

    it('debe formatear horas exactas', () => {
      expect(formatearDuracion(60)).toBe('1 hs');
      expect(formatearDuracion(120)).toBe('2 hs');
      expect(formatearDuracion(180)).toBe('3 hs');
    });

    it('debe formatear horas y minutos combinados', () => {
      expect(formatearDuracion(90)).toBe('1 h 30 min');
      expect(formatearDuracion(140)).toBe('2 h 20 min');
      expect(formatearDuracion(75)).toBe('1 h 15 min');
    });

    it('debe manejar valores nulos o negativos', () => {
      expect(formatearDuracion(0)).toBe('0 min');
      expect(formatearDuracion(-10)).toBe('0 min');
    });
  });

  describe('calcularHoraFin', () => {
    it('debe sumar duración a la hora de inicio correctamente', () => {
      expect(calcularHoraFin('10:00', 45)).toBe('10:45');
      expect(calcularHoraFin('10:30', 60)).toBe('11:30');
      expect(calcularHoraFin('11:45', 30)).toBe('12:15');
    });

    it('debe manejar saltos de hora', () => {
      expect(calcularHoraFin('09:45', 90)).toBe('11:15');
      expect(calcularHoraFin('18:00', 120)).toBe('20:00');
    });

    it('debe retornar vacío si la hora de inicio es inválida', () => {
      expect(calcularHoraFin('', 45)).toBe('');
      expect(calcularHoraFin('invalido', 45)).toBe('');
    });
  });

  describe('obtenerEtiquetaEstado', () => {
    it('debe retornar las etiquetas correctas para cada estado', () => {
      expect(obtenerEtiquetaEstado('confirmado')).toBe('Confirmado');
      expect(obtenerEtiquetaEstado('en_proceso')).toBe('En Atención');
      expect(obtenerEtiquetaEstado('completado')).toBe('Atendido');
      expect(obtenerEtiquetaEstado('cancelado')).toBe('Cancelado');
    });
  });

  describe('obtenerEstiloEstado', () => {
    it('debe retornar estilos para cada estado', () => {
      const estiloConfirmado = obtenerEstiloEstado('confirmado');
      expect(estiloConfirmado.dot).toContain('emerald');

      const estiloEnProceso = obtenerEstiloEstado('en_proceso');
      expect(estiloEnProceso.dot).toContain('sky');

      const estiloCompletado = obtenerEstiloEstado('completado');
      expect(estiloCompletado.dot).toContain('slate');

      const estiloCancelado = obtenerEstiloEstado('cancelado');
      expect(estiloCancelado.dot).toContain('rose');
    });

    it('debe retornar estilos de bloqueo independientemente del estado', () => {
      const estiloBloqueo = obtenerEstiloEstado('confirmado', true);
      expect(estiloBloqueo.dot).toContain('slate');
    });
  });

  describe('formatearFechaLegible', () => {
    it('debe formatear una fecha ISO completa', () => {
      const fecha = '2026-08-19';
      const resultado = formatearFechaLegible(fecha);
      expect(resultado).toContain('19');
      expect(resultado).toContain('ago');
      expect(resultado).toContain('2026');
    });

    it('debe formatear una fecha corta', () => {
      const fecha = '2026-08-19';
      const resultado = formatearFechaLegible(fecha, true);
      expect(resultado).toContain('19/8');
    });

    it('debe manejar string vacío', () => {
      expect(formatearFechaLegible('')).toBe('');
    });
  });

  describe('esSlotEnPasado', () => {
    it('debe identificar fechas pasadas', () => {
      expect(esSlotEnPasado('2020-01-01', '10:00')).toBe(true);
    });

    it('debe identificar fechas futuras', () => {
      expect(esSlotEnPasado('2030-01-01', '10:00')).toBe(false);
    });
  });

  describe('esTurnoActual y esTurnoPasado', () => {
    const ahoraFija = new Date(2026, 4, 15, 14, 30); // 2026-05-15 14:30

    it('debe identificar un turno en curso actual', () => {
      // Turno de 14:00 a 15:00 (60 min)
      expect(esTurnoActual('2026-05-15', '14:00', 60, ahoraFija)).toBe(true);
      expect(esTurnoPasado('2026-05-15', '14:00', 60, ahoraFija)).toBe(false);
    });

    it('debe identificar un turno que ya pasó hoy', () => {
      // Turno de 10:00 a 11:00 (terminó a las 11:00)
      expect(esTurnoActual('2026-05-15', '10:00', 60, ahoraFija)).toBe(false);
      expect(esTurnoPasado('2026-05-15', '10:00', 60, ahoraFija)).toBe(true);
    });

    it('debe identificar un turno futuro hoy', () => {
      // Turno de 16:00 a 17:00
      expect(esTurnoActual('2026-05-15', '16:00', 60, ahoraFija)).toBe(false);
      expect(esTurnoPasado('2026-05-15', '16:00', 60, ahoraFija)).toBe(false);
    });

    it('debe identificar días anteriores como pasados', () => {
      expect(esTurnoActual('2026-05-14', '14:00', 60, ahoraFija)).toBe(false);
      expect(esTurnoPasado('2026-05-14', '14:00', 60, ahoraFija)).toBe(true);
    });

    it('debe identificar días posteriores como no pasados', () => {
      expect(esTurnoActual('2026-05-16', '14:00', 60, ahoraFija)).toBe(false);
      expect(esTurnoPasado('2026-05-16', '14:00', 60, ahoraFija)).toBe(false);
    });
  });
});