import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext'; // Importa o hook do contexto

function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Usa o estado global do UserContext como fonte da verdade
  const { session, loading: sessionLoading } = useUser();

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
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) throw updateError;

      toast.success('Senha Atualizada!', {
        description: 'A sua senha foi alterada com sucesso. Você será redirecionado para fazer login.',
      });

      // Desloga o utilizador após atualizar a senha para forçar um novo login
      await supabase.auth.signOut();
      
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

  // Enquanto o contexto verifica a sessão
  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-600">A verificar a sua sessão...</p>
      </div>
    );
  }

  // Se não houver sessão após o carregamento, o link é inválido/expirado
  const isValidSession = !!session;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Definir Nova Senha</CardTitle>
          <CardDescription>
            {isValidSession 
              ? "Insira e confirme a sua nova senha abaixo."
              : "Link de recuperação inválido ou expirado. Por favor, solicite um novo."
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
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600">
                Não foi possível validar a sua sessão de recuperação.
              </p>
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