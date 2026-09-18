import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthProvider';
import { AuthModal } from '../../auth/components/AuthModal';

export const AdminLogin: React.FC = () => {
  const { user, esAdmin, loadingAuth, abrirAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingAuth) return;
    // Si ya está logueado y es admin, va directo a la agenda
    if (user && esAdmin) {
      navigate('/admin/agenda', { replace: true });
    } else {
      // Abre el modal de inicio de sesión con el layout simplificado
      abrirAuthModal('login');
    }
  }, [user, esAdmin, loadingAuth, navigate, abrirAuthModal]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <AuthModal esAdminFlow={true} />
    </div>
  );
};
