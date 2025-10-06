import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Mail } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (from) {
          navigate(from, { replace: true });
          return;
        }

        switch (profile.role) {
          case 'admin':
          case 'operations_manager':
            navigate('/admin');
            break;
          case 'client':
            navigate('/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      toast.error('Falha no Login', {
        description: 'E-mail ou senha inválidos. Por favor, verifique seus dados e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      toast.success('Verifique seu e-mail', {
        description: `Se o e-mail ${email} estiver cadastrado, você receberá um link para redefinir sua senha.`,
      });
      setIsForgotPassword(false); // Volta para a tela de login
    } catch (error) {
      toast.error('Erro ao enviar e-mail', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <img 
            src="/logo.png" 
            alt="SGMU Logo" 
            className="w-32 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold">Área Restrita</h1>
          <p className="text-balance text-muted-foreground">
            {isForgotPassword ? 'Insira seu e-mail para redefinir a senha' : 'Insira suas credenciais para acessar o painel'}
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isForgotPassword ? 'Redefinir Senha' : 'Login'}</CardTitle>
          </CardHeader>
          <CardContent>
            {isForgotPassword ? (
              <form onSubmit={handlePasswordReset} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Enviar Link de Redefinição'}
                </Button>
                <Button variant="link" onClick={() => setIsForgotPassword(false)}>
                  Voltar para o Login
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Senha</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="ml-auto h-auto p-0 text-sm underline"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      Esqueceu sua senha?
                    </Button>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        {!isForgotPassword && (
          <div className="text-center text-base">
            Ainda não tem uma conta?{" "}
            <Link to="/" className="underline font-bold">
              Cadastre-se
            </Link>
          </div>
        )}
      </div>
      <WhatsAppButton />
    </div>
  );
}

export default LoginPage;