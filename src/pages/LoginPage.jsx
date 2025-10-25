import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase, createOrder } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';

// Função para processar uma reserva pendente após o login
const processPendingReservation = async (userId) => {
  const pendingCartRaw = localStorage.getItem('pendingReservationCart');
  if (!pendingCartRaw) return false;

  try {
    const pendingCartItems = JSON.parse(pendingCartRaw);
    if (!Array.isArray(pendingCartItems) || pendingCartItems.length === 0) {
      localStorage.removeItem('pendingReservationCart');
      return false;
    }

    // Busca o perfil do usuário para obter os dados completos
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error('Perfil do usuário não encontrado.');

    await createOrder(profile, pendingCartItems);

    // Limpa os carrinhos pendentes e o principal
    localStorage.removeItem('pendingReservationCart');
    localStorage.removeItem('sgmu-cart');

    toast.success('Reserva confirmada!', { description: 'Seu carrinho pendente foi processado com sucesso.' });
    return true;
  } catch (error) {
    console.error('Erro ao processar reserva pendente:', error);
    toast.error('Falha ao processar reserva pendente', { description: error.message });
    localStorage.removeItem('pendingReservationCart'); // Limpa para evitar loops de erro
    return false;
  }
};

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Autenticação
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        toast.error('Confirmação de E-mail Pendente', {
          description: 'Por favor, verifique sua caixa de entrada e confirme seu e-mail para continuar.',
        });
      } else {
        toast.error('Falha no Login', {
          description: 'E-mail ou senha inválidos. Por favor, verifique suas credenciais.',
        });
      }
      setLoading(false);
      return;
    }

    // 2. Lógica pós-login
    if (data.user) {
      try {
        const reservationProcessed = await processPendingReservation(data.user.id);
        if (reservationProcessed) {
          navigate('/dashboard', { replace: true });
          return; // A navegação já acontece, não precisa de setLoading(false)
        }

        const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (profileError) {
          // Lança um erro específico para o catch abaixo
          throw new Error('Não foi possível carregar os dados do seu perfil.');
        }

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
      } catch (err) {
        // Este catch agora lida com erros que acontecem *depois* do login
        toast.error('Erro ao carregar sua sessão', { description: err.message });
        setLoading(false);
      }
    } else {
      // Fallback, caso 'data.user' seja nulo mesmo sem erro de autenticação (improvável)
      toast.error('Falha no Login', { description: 'Ocorreu um erro inesperado.' });
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <img src="/logo.png" alt="SGMU Logo" className="w-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Área Restrita</h1>
          <p className="text-balance text-muted-foreground">
            Insira suas credenciais para acessar o painel
          </p>
        </div>
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
                  <Link to="/forgot-password" className="ml-auto inline-block text-sm underline">
                    Esqueceu sua senha?
                  </Link>
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
      </div>
      <WhatsAppButton />
    </div>
  );
}

export default LoginPage;