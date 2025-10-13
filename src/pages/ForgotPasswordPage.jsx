import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const redirectToUrl = `${import.meta.env.VITE_SITE_URL}/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      toast.error('Erro ao enviar e-mail', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4 text-center">
          <CardHeader>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <CardTitle>Verifique seu E-mail</CardTitle>
            <CardDescription>
              Um link para redefinir sua senha foi enviado para {email}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Voltar para o Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <img src="/logo.png" alt="SGMU Logo" className="w-32 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Redefinir Senha</h1>
          <p className="text-balance text-muted-foreground">
            Insira seu e-mail para receber o link de redefinição.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recuperação de Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          </CardContent>
        </Card>
         <div className="text-center text-base">
          Lembrou a senha?{" "}
          <Link to="/login" className="underline font-bold">
            Faça Login
          </Link>
        </div>
      </div>
      <WhatsAppButton />
    </div>
  );
}

export default ForgotPasswordPage;