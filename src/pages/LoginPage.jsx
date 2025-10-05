import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
        description: err.message || 'Verifique suas credenciais e tente novamente.',
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
              Insira suas credenciais para acessar o painel
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="text-center text-base">
            Ainda não tem uma conta?{" "}
            <Link to="/" className="underline font-bold">
              Cadastre-se
            </Link>
          </div>
        </div>
      <WhatsAppButton />
    </div>
  );
}

export default LoginPage;