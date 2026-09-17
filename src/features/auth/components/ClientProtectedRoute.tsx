import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

interface ClientProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ClientProtectedRoute({
  children,
  redirectTo = '/',
}: ClientProtectedRouteProps) {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
      </div>
    );
  }

  // Si no hay usuario logueado, lo devolvemos al inicio (o donde se defina)
  if (!user) {
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
}
