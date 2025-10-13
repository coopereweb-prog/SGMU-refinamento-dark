import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';

// Componente interno para o formulário de atualização de senha
function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      // Força o logout para limpar a sessão de recuperação
      await supabase.auth.signOut();

      toast.success('Senha atualizada com sucesso!', {
        description: 'Você já pode fazer login com sua nova senha.',
      });
      
      // Navega para a página de login, limpando o hash da URL
      navigate('/login', { replace: true });

    } catch (error) {
      toast.error('Falha ao atualizar a senha.', {
        description: 'O link de recuperação pode ter expirado. Por favor, tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Definir Nova Senha</CardTitle>
        <CardDescription>Insira e confirme sua nova senha abaixo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Salvar Nova Senha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); // 'login', 'forgot_password', 'update_password'
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('update_password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
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
          case 'field_technician':
            navigate('/technician-panel');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      toast.error('Falha no Login', { description: 'E-mail ou senha inválidos.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_SITE_URL}/login`,
      });
      if (error) throw error;
      toast.success('Verifique seu e-mail', { description: `Um link para redefinir sua senha foi enviado para ${email}.` });
      setView('login');
    } catch (error) {
      toast.error('Erro ao enviar e-mail', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'update_password':
        return <UpdatePasswordForm />;
      case 'forgot_password':
        return (
          <Card>
            <CardHeader><CardTitle>Redefinir Senha</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Enviar Link'}</Button>
                <Button variant="link" onClick={() => setView('login')}>Voltar para o Login</Button>
              </form>
            </CardContent>
          </Card>
        );
      case 'login':
      default:
        return (
          <>
            <Card>
              <CardHeader><CardTitle>Login</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Senha</Label>
                      <Button type="button" variant="link" className="ml-auto h-auto p-0 text-sm underline" onClick={() => setView('forgot_password')}>Esqueceu sua senha?</Button>
                    </div>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="pr-10" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Entrar'}</Button>
                </form>
              </CardContent>
            </Card>
            <div className="text-center text-base">
              Ainda não tem uma conta?{" "}
              <Link to="/signup" className="underline font-bold">Cadastre-se</Link>
            </div>
          </>
        );
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <img src="/logo.png" alt="SGMU Logo" className="w-32 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Área Restrita</h1>
          <p className="text-balance text-muted-foreground">
            {view === 'forgot_password' ? 'Insira seu e-mail para redefinir a senha' : view === 'update_password' ? 'Crie uma nova senha para sua conta' : 'Insira suas credenciais para acessar o painel'}
          </p>
        </div>
        {renderContent()}
      </div>
      <WhatsAppButton />
    </div>
  );
}

export default LoginPage;