import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const location = useLocation();

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a rota exige papéis específicos e o perfil do usuário não está na lista,
  // nega o acesso.
  // Adicionamos a verificação `profile` para garantir que o toast só seja exibido
  // se o perfil estiver carregado e a função for realmente negada.
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    toast.error('Acesso Negado', {
      description: 'Você não tem permissão para acessar esta página.',
    });
    // Redireciona para a página inicial ou para o dashboard do cliente se ele tiver um.
    return <Navigate to={profile.role === 'client' ? '/dashboard' : '/'} replace />;
  }

  return children;
}