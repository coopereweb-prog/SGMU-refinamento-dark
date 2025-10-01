import { useState } from 'react';
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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      const errorMessage = 'As senhas não coincidem.';
      setError(errorMessage);
      toast.error('Erro', { description: errorMessage });
      return;
    }

    if (password.length < 6) {
      const errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      setError(errorMessage);
      toast.error('Senha Fraca', { description: errorMessage });
      return;
    }

    setLoading(true);

    try {
      // Tenta atualizar o utilizador. O Supabase usará o token da URL para autenticar.
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) throw updateError;

      toast.success('Senha Atualizada!', {
        description: 'A sua senha foi alterada com sucesso. Agora pode fazer login com as novas credenciais.',
      });

      // Após o sucesso, desloga o utilizador da sessão de recuperação e envia-o para o login.
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      // Se o token for inválido/expirado, o erro será capturado aqui.
      const errorMessage = 'Não foi possível atualizar a senha. O link pode ter expirado.';
      setError(errorMessage);
      toast.error('Falha na Atualização', { description: err.message || errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Definir Nova Senha</CardTitle>
          <CardDescription>
            Insira e confirme a sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                placeholder="Pelo menos 6 caracteres"
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
        </CardContent>
      </Card>
    </div>
  );
}

export default UpdatePasswordPage;