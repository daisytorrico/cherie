import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Check } from 'lucide-react';
import {
  fetchDisponibilidad,
  guardarDisponibilidad,
} from '../../api/disponibilidadApi';
import {
  DIAS_ORDEN,
  type DisponibilidadSemanal,
  type DiaSemana,
  type FranjaHoraria,
} from '../../types';
import { ConfiguracionHorariosSkeleton } from '../../../admin/components/AdminSkeletons';

const NOMBRE_DIA: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export function ConfiguracionHorarios() {
  const [disponibilidad, setDisponibilidad] =
    useState<DisponibilidadSemanal | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [modificado, setModificado] = useState(false);

  useEffect(() => {
    void fetchDisponibilidad().then(setDisponibilidad);
  }, []);

  if (!disponibilidad) {
    return <ConfiguracionHorariosSkeleton />;
  }

  const agregarFranja = (dia: DiaSemana) => {
    setDisponibilidad({
      ...disponibilidad,
      [dia]: [...disponibilidad[dia], { inicio: '09:00', fin: '13:00' }],
    });
    setGuardado(false);
    setModificado(true);
  };

  const quitarFranja = (dia: DiaSemana, index: number) => {
    setDisponibilidad({
      ...disponibilidad,
      [dia]: disponibilidad[dia].filter((_, i) => i !== index),
    });
    setGuardado(false);
    setModificado(true);
  };

  const actualizarFranja = (
    dia: DiaSemana,
    index: number,
    campo: keyof FranjaHoraria,
    valor: string
  ) => {
    const franjasActualizadas = disponibilidad[dia].map((f, i) =>
      i === index ? { ...f, [campo]: valor } : f
    );
    setDisponibilidad({ ...disponibilidad, [dia]: franjasActualizadas });
    setGuardado(false);
    setModificado(true);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await guardarDisponibilidad(disponibilidad);
      setGuardado(true);
      setModificado(false);
    } catch (err) {
      console.error('Error guardando disponibilidad:', err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4 lg:p-6 w-full max-w-5xl mx-auto">
      {/* Header del módulo con botón de guardado adaptativo */}
      <div className="flex items-center justify-between border-b border-camel/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div>
            <h2 className="font-serif text-xl font-bold text-secondary">
              Horarios de atención
            </h2>
            <p className="text-xs text-primary/60">
              Definí las franjas de atención por día.
            </p>
          </div>
        </div>

        {/* Acciones de Guardar Superior (Mobile vs Desktop) */}
        <div className="flex items-center gap-2">
          {/* Botón discreto en Mobile (solo ícono con indicador si hay cambios) */}
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || (!modificado && !guardado)}
            className={`sm:hidden relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
              modificado
                ? 'bg-secondary text-white border-secondary shadow-xs animate-pulse'
                : guardado
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-surface-low text-primary/40 border-camel/20 opacity-50'
            }`}
            aria-label="Guardar cambios"
            title={modificado ? 'Tienes cambios sin guardar' : 'Guardar'}
          >
            {guardando ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : guardado ? (
              <Check className="h-4.5 w-4.5" />
            ) : (
              <Save className="h-4.5 w-4.5" />
            )}
            {modificado && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-surface-lowest" />
            )}
          </button>

          {/* Botón completo en Desktop (con texto claro) */}
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || (!modificado && !guardado)}
            className={`hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              modificado
                ? 'bg-secondary text-surface-lowest shadow-md hover:scale-105'
                : guardado
                  ? 'bg-emerald-600 text-white'
                  : 'bg-surface-low text-primary/50 border border-camel/30 opacity-60'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            <span>
              {guardando
                ? 'Guardando...'
                : guardado
                  ? 'Guardado ✓'
                  : modificado
                    ? 'Guardar Cambios'
                    : 'Sin cambios'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {DIAS_ORDEN.map((dia) => (
          <div
            key={dia}
            className="rounded-2xl border-none bg-surface-lowest p-2.5 sm:p-3.5 shadow-sm"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-camel/20">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base text-secondary">
                  {NOMBRE_DIA[dia]}
                </span>
                {disponibilidad[dia].length > 0 ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                    {disponibilidad[dia].length} franja
                    {disponibilidad[dia].length > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/40 bg-surface-low px-2 py-0.5 rounded-full">
                    Cerrado
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => agregarFranja(dia)}
                className="inline-flex items-center gap-1 rounded-full bg-surface-low border border-camel/30 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-secondary hover:text-white transition-colors cursor-pointer"
                title="Agregar franja horaria"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Agregar franja</span>
                <span className="sm:hidden">Franja</span>
              </button>
            </div>

            {disponibilidad[dia].length === 0 ? (
              <p className="text-xs text-primary/40 italic py-1 px-1">
                Sin franjas de atención habilitadas.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {disponibilidad[dia].map((franja, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-surface-low/30 p-1.5 sm:p-2 rounded-xl border-none"
                  >
                    <input
                      type="time"
                      step="900"
                      value={franja.inicio}
                      onChange={(e) =>
                        actualizarFranja(dia, index, 'inicio', e.target.value)
                      }
                      className="rounded-lg border-none bg-surface-lowest px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium transition-all"
                    />
                    <span className="text-primary/60 text-xs font-medium">
                      a
                    </span>
                    <input
                      type="time"
                      step="900"
                      value={franja.fin}
                      onChange={(e) =>
                        actualizarFranja(dia, index, 'fin', e.target.value)
                      }
                      className="rounded-lg border-none bg-surface-lowest px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => quitarFranja(dia, index)}
                      className="ml-auto text-error-main/80 hover:text-error-main hover:bg-error-bg p-1.5 rounded-lg transition-colors cursor-pointer"
                      aria-label="Quitar franja"
                      title="Quitar franja"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
