import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';

// Este componente agora aceita uma prop `allowedRoles`
function ProtectedRoute({ children, allowedRoles }) {
  const { profile, loading, isPasswordRecovery } = useUser();

  // Enquanto o perfil está a ser carregado, mostramos uma mensagem
  if (loading) {
    return <div>A verificar permissões...</div>;
  }

  // Se o utilizador está no meio de uma recuperação de senha, ele não deve
  // aceder a nenhuma rota protegida. Redireciona-o para a página correta.
  if (isPasswordRecovery) {
    return <Navigate to="/update-password" replace />;
  }

  // Se não houver perfil (e não estamos em recuperação), o utilizador não está logado.
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota exige papéis específicos e o papel do utilizador não está na lista,
  // redireciona para a página inicial e mostra um aviso.
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    toast.error('Acesso Negado', {
      description: 'Você não tem permissão para aceder a esta página.',
    });
    return <Navigate to="/" replace />;
  }

  // Se todas as verificações passarem, renderiza a página protegida.
  return children;
}

export default ProtectedRoute;