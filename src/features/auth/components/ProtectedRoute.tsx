import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = '/admin/login',
}: ProtectedRouteProps) {
  const { user, esAdmin, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center p-6 bg-puntitos animate-pulse"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-camel/20 bg-surface-lowest p-8 shadow-sm">
          <div className="h-6 w-1/2 mx-auto rounded-md bg-surface-low" />
          <div className="h-4 w-3/4 mx-auto rounded-md bg-surface-low/70" />
          <div className="h-10 w-full rounded-xl bg-surface-low pt-4" />
        </div>
      </div>
    );
  }

  // Si no hay usuario o la cuenta autenticada NO es admin
  if (!user || !esAdmin) {
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
}
