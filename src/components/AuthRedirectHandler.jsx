import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function AuthRedirectHandler() {
  const { user, authEvent } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authEvent === 'SIGNED_IN' && user) {
      // Lógica para detectar se o usuário acabou de ser convidado
      // Um usuário convidado geralmente tem o created_at igual ao last_sign_in_at
      // e não tem senha definida (embora não possamos verificar a senha diretamente).
      const isInvitedUser = user.app_metadata.provider === 'email' && 
                            user.last_sign_in_at === user.created_at;

      // Se for um usuário convidado, forçamos a definição da senha
      if (isInvitedUser) {
        toast.info('Bem-vindo! Por favor, defina sua senha para completar o acesso.', { duration: 5000 });
        // Redireciona para a página de atualização de senha
        navigate('/update-password', { state: { from: 'INVITE_FLOW' }, replace: true });
      }
    }
  }, [authEvent, user, navigate]);

  return null;
}