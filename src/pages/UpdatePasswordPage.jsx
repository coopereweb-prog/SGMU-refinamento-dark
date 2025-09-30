import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isValidSession, setIsValidSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificação direta e imediata da sessão
        const { data: { session } } = await supabase.auth.getSession();
        
        // Verifica se há uma sessão válida
        if (session) {
          // Obtém informações detalhadas do usuário
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Erro ao obter usuário:', userError);
            setIsValidSession(false);
            return;
          }
          
          // Verifica se o usuário está autenticado (o que acontece após clicar no link de recuperação)
          if (user && session.user) {
            setIsValidSession(true);
            return;
          }
        }
        setIsValidSession(false);
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        setIsValidSession(false);
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      toast.error('Erro', { description: 'As senhas não coincidem.' });
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      toast.error('Senha Fraca', { description: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setLoading(true);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) throw updateError;

      toast.success('Senha Atualizada!', {
        description: 'A sua senha foi alterada com sucesso. Você será redirecionado para fazer login.',
      });

      // Desloga o usuário após atualizar a senha
      await supabase.auth.signOut();
      
      // Aguarda um pouco antes de redirecionar para o login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Não foi possível atualizar a senha.');
      toast.error('Falha na Atualização', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Enquanto verifica a sessão
  if (isValidSession === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-600">Verificando sua sessão...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Definir Nova Senha</CardTitle>
          <CardDescription>
            {isValidSession 
              ? "Insira e confirme a sua nova senha abaixo."
              : "Link de recuperação inválido ou expirado. Não foi possível validar a sua sessão."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isValidSession ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={loading} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  disabled={loading} 
                />
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Salvar Nova Senha'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Não foi possível validar sua sessão de recuperação. Isso pode acontecer se:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>O link de recuperação expirou</li>
                <li>O link já foi utilizado</li>
                <li>Houve um problema com o processo de autenticação</li>
              </ul>
              <Button className="w-full" onClick={() => navigate('/login')}>
                Voltar para o Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UpdatePasswordPage;