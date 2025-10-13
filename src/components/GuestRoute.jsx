import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

export function GuestRoute({ children }) {
  const { user, authEvent, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const location = useLocation();

  const isLoading = authLoading || (user && profileLoading);
  
  // O fluxo de recuperação de senha é identificado pelo evento do Supabase ou pela URL
  const isPasswordRecovery = authEvent === 'PASSWORD_RECOVERY' || 
    location.pathname === '/update-password' ||
    new URLSearchParams(location.search).get('type') === 'recovery';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Se o usuário estiver logado E não for um fluxo de recuperação de senha, redirecione.
  if (user && profile && !isPasswordRecovery) {
    const role = profile.role;
    let dashboardPath = '/';
    if (role === 'admin' || role === 'operations_manager') {
      dashboardPath = '/admin';
    } else if (role === 'client') {
      dashboardPath = '/dashboard';
    } else if (role === 'field_technician') {
      dashboardPath = '/technician-panel';
    }
    return <Navigate to={dashboardPath} replace />;
  }

  // Caso contrário, mostre a página de convidado (Login, Cadastro, etc.).
  return children;
}