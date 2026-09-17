import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CarritoFooter } from './CarritoFooter';

describe('Componente CarritoFooter', () => {
  it('deshabilita el botón "Solicitar Turno" cuando el formulario NO es válido', () => {
    render(
      <CarritoFooter
        duracionTotal={45}
        total={15000}
        formularioValido={false}
        enviando={false}
        onEnviarSolicitud={vi.fn()}
      />
    );

    const boton = screen.getByRole('button', { name: /solicitar turno/i });
    expect(boton).toBeDisabled();
  });

  it('habilita el botón "Solicitar Turno" cuando el formulario SÍ es válido', () => {
    const mockEnviar = vi.fn();
    render(
      <CarritoFooter
        duracionTotal={45}
        total={15000}
        formularioValido={true}
        enviando={false}
        onEnviarSolicitud={mockEnviar}
      />
    );

    const boton = screen.getByRole('button', { name: /solicitar turno/i });
    expect(boton).not.toBeDisabled();

    fireEvent.click(boton);
    expect(mockEnviar).toHaveBeenCalledTimes(1);
  });
});
