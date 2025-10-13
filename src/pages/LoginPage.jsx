import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // O redirecionamento é tratado pelo GuestRoute ao detectar a mudança de sessão.
      // Apenas navegamos para a home se não houver um 'from' específico.
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error('Falha no Login', { description: 'E-mail ou senha inválidos.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <img src="/logo.png" alt="SGMU Logo" className="w-32 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Área Restrita</h1>
          <p className="text-balance text-muted-foreground">
            Insira suas credenciais para acessar
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
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
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
    </div>
  );
}

export default LoginPage;