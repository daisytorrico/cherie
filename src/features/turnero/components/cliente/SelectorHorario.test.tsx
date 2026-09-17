import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SelectorDeHorario } from './SelectorHorario';

describe('Componente SelectorDeHorario', () => {
  const propsBase = {
    fecha: '2026-08-10',
    onFechaChange: vi.fn(),
    slots: ['10:00', '11:00', '15:00'],
    loadingSlots: false,
    horaSeleccionada: null,
    onHoraChange: vi.fn(),
    duracionTotal: 60,
  };

  it('muestra los botones de horarios cuando aún NO hay hora seleccionada', () => {
    render(<SelectorDeHorario {...propsBase} />);

    expect(screen.getByText('Horarios Disponibles')).toBeInTheDocument();
    expect(screen.getByText('10:00 hs')).toBeInTheDocument();
    expect(screen.getByText('15:00 hs')).toBeInTheDocument();
  });

  it('manda llamar a onHoraChange al seleccionar un horario', () => {
    render(<SelectorDeHorario {...propsBase} />);

    const botonHora = screen.getByText('15:00 hs');
    fireEvent.click(botonHora);

    expect(propsBase.onHoraChange).toHaveBeenCalledWith('15:00');
  });

  it('muestra la tarjeta resumida con el botón "Cambiar" cuando YA hay una hora seleccionada', () => {
    render(<SelectorDeHorario {...propsBase} horaSeleccionada="15:00" />);

    expect(screen.queryByText('Horarios Disponibles')).not.toBeInTheDocument();
    expect(screen.getByText(/15:00 hs/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cambiar/i })
    ).toBeInTheDocument();
  });
});
