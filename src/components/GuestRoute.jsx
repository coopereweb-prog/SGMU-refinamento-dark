import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

export function GuestRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();

  const isLoading = authLoading || (user && profileLoading);
  
  // Verifica diretamente na URL se é um fluxo de recuperação de senha.
  // Isso é mais robusto do que depender do estado do AuthContext.
  const isPasswordRecovery = window.location.hash.includes('type=recovery');

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