import { WifiOff } from 'lucide-react';
import useNetworkStatus from '../hooks/useNetworkStatus';

export function OfflineToast() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 inset-x-4 z-[1000] mx-auto max-w-sm animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex items-center gap-2.5 rounded-full bg-slate-900/90 text-slate-100 px-4 py-2 text-xs font-semibold shadow-xl border border-slate-700/80 backdrop-blur-md">
        <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
        <span>Estás sin conexión. Navegás con datos guardados.</span>
      </div>
    </div>
  );
}
