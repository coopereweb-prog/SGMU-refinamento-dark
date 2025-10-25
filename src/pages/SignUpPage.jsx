import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';

const signUpSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Erro no Cadastro', {
            description: 'Este e-mail já está em uso. Tente fazer login.',
          });
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      toast.error('Falha no Cadastro', {
        description: err.message || 'Ocorreu um erro inesperado. Tente novamente.',
      });
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
            <CardTitle>Cadastro realizado!</CardTitle>
            <CardDescription>
              Enviamos um e-mail de confirmação para você. Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Ir para o Login
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
          <img 
            src="/logo.png" 
            alt="SGMU Logo" 
            className="w-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold">Crie sua Conta</h1>
          <p className="text-balance text-muted-foreground">
            Preencha os campos abaixo para se cadastrar
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? 'text' : 'password'} {...field} disabled={loading} className="pr-10" />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showConfirmPassword ? 'text' : 'password'} {...field} disabled={loading} className="pr-10" />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Cadastrar'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="text-center text-base">
          Já tem uma conta?{" "}
          <Link to="/login" className="underline font-bold">
            Faça Login
          </Link>
        </div>
      </div>
      <WhatsAppButton />
    </div>
  );
}

export default SignUpPage;