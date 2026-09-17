import { Phone } from 'lucide-react';
import { useAuth } from '../../../../auth/context/AuthProvider';

interface CarritoContactoFormProps {
  clienteTelefono: string;
  setClienteTelefono: (value: string) => void;
}

export function CarritoContactoForm({
  clienteTelefono,
  setClienteTelefono,
}: CarritoContactoFormProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-3.5 space-y-2.5 shadow-xs">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
          <Phone className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-primary">
            ¿Cuál es tu WhatsApp de contacto?
          </h4>
          <p className="text-[11px] text-primary/70 leading-tight">
            Lo necesitamos para enviarte la confirmación y avisos de tu turno.
          </p>
        </div>
      </div>

      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/70 pointer-events-none" />
        <input
          type="tel"
          placeholder="Ej: 11 2345-6789"
          value={clienteTelefono}
          onChange={(e) => setClienteTelefono(e.target.value)}
          className="w-full rounded-xl border border-camel/40 bg-surface-lowest pl-9 pr-3 py-2 text-xs font-medium text-primary placeholder:text-primary/40 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
          required
        />
      </div>
    </div>
  );
}
