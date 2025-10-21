import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { createOrder } from '../lib/supabase.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

// Esquemas de validação para cada passo
const emailSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
});

const loginSchema = z.object({
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

const signUpSchema = z.object({
  name: z.string().min(2, { message: 'O nome é obrigatório.' }),
  phone: z.string().min(10, { message: 'O telefone é obrigatório.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

export function EnhancedReservationForm({ cartItems, onReservationSuccess }) {
  const [step, setStep] = useState('loading'); // loading, logged_in, email, login, signup
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(
      step === 'email' ? emailSchema : step === 'login' ? loginSchema : signUpSchema
    ),
    defaultValues: { email: '', password: '', name: '', phone: '', confirmPassword: '' },
  });

  // Salva o carrinho como uma reserva pendente ao iniciar o formulário
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      localStorage.setItem('pendingReservationCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // 1. Checa se o usuário já está logado ao iniciar
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUserData({
          name: profile?.name || session.user.user_metadata?.name,
          email: profile?.email || session.user.email,
          phone: profile?.phone || '', // Garante que o telefone está presente
        });
        setStep('logged_in');
      } else {
        setStep('email');
      }
    };
    checkSession();
  }, []);

  // 2. Handler para o passo de e-mail
  const onEmailSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = values.email.toLowerCase();
      const { data: userExists, error } = await supabase.rpc('user_exists', { user_email: normalizedEmail });
      if (error) throw error;
      
      setUserEmail(normalizedEmail);
      if (userExists) {
        setStep('login');
      } else {
        setStep('signup');
      }
    } catch (err) {
      setError('Não foi possível verificar o e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handler para o passo de Login
  const onLoginAndReserve = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: values.password,
      });
      if (signInError) throw new Error('E-mail ou senha inválidos.');
      
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('email', userEmail).single();
      if (profileError || !profile) throw new Error('Não foi possível carregar seu perfil após o login.');

      const customerDataForOrder = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '', // Garante que o telefone está presente
      };
      await createOrder(customerDataForOrder, cartItems);
      
      toast.success('Reserva confirmada!', { description: 'Você será redirecionado para seu painel.' });
      localStorage.removeItem('pendingReservationCart');
      onReservationSuccess();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
      setLoading(false);
    }
  };

  // 4. Handler para o passo de Cadastro
  const onSignUpAndReserve = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: userEmail,
        password: values.password,
        options: {
          data: { name: values.name, phone: values.phone },
        },
      });
      if (signUpError) throw signUpError;
      
      await createOrder({ name: values.name, email: userEmail, phone: values.phone }, cartItems);

      toast.success('Conta criada e reserva confirmada!', { description: 'Verifique seu e-mail para ativar a conta. Você será redirecionado.' });
      localStorage.removeItem('pendingReservationCart');
      onReservationSuccess();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Ocorreu um erro no cadastro.');
      setLoading(false);
    }
  };
  
  // 5. Handler para usuário que já está logado
  const onLoggedInReserve = async () => {
     setLoading(true);
     setError(null);
     try {
       // O userData já deve ter sido populado com o telefone no useEffect inicial
       await createOrder(userData, cartItems);
       toast.success('Reserva confirmada!', { description: 'Você será redirecionado para seu painel.' });
       localStorage.removeItem('pendingReservationCart');
       onReservationSuccess();
       navigate('/dashboard');
     } catch (err) {
        setError(err.message || 'Ocorreu um erro ao criar sua reserva.');
        setLoading(false);
     }
  };

  const getSubmitHandler = () => {
    switch (step) {
      case 'email': return onEmailSubmit;
      case 'login': return onLoginAndReserve;
      case 'signup': return onSignUpAndReserve;
      default: return () => {};
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      form.handleSubmit(getSubmitHandler())();
    }
  };

  const renderContent = () => {
    if (step === 'loading') {
      return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin" /></div>;
    }
    
    if (step === 'logged_in') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Confirmar Reserva</h3>
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p>Você está reservando como:</p>
            <p className="font-bold">{userData.name}</p>
            <p>{userData.email}</p>
            {userData.phone && <p>Telefone: {userData.phone}</p>}
          </div>
          {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          <Button onClick={onLoggedInReserve} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Reserva'}
          </Button>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(getSubmitHandler())} 
          className="space-y-4"
        >
          {step === 'email' && (
            <FormField
              control={form.control} name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="seu@email.com" {...field} onKeyDown={handleKeyDown} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(step === 'login' || step === 'signup') && (
            <div className='text-sm'>
              <p>Email: <span className="font-bold">{userEmail}</span></p>
              <Button variant="link" className="p-0 h-auto" onClick={() => { setStep('email'); form.reset(); setError(null); }}>Trocar e-mail</Button>
            </div>
          )}

          {step === 'login' && (
            <>
              <FormField
                control={form.control} name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                      <Link 
                        to="/forgot-password" 
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                        state={{ email: userEmail }}
                      >
                        Esqueceu sua senha?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Sua senha" {...field} className="pr-10" onKeyDown={handleKeyDown} />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-center text-sm text-muted-foreground">
                Ainda não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStep('signup');
                    setError(null);
                    form.reset();
                  }}
                  className="font-bold text-yellow-500 hover:underline"
                >
                  Cadastre-se
                </button>
              </p>
            </>
          )}

          {step === 'signup' && (
            <>
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Seu nome" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone / WhatsApp</FormLabel><FormControl><Input placeholder="(19) 99999-9999" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField
                control={form.control} name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crie uma Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} {...field} className="pr-10" />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirme a Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirmPassword ? 'text' : 'password'} {...field} className="pr-10" onKeyDown={handleKeyDown} />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 
              step === 'email' ? 'Continuar' :
              step === 'login' ? 'Entrar e Reservar' :
              'Criar Conta e Reservar'
            }
          </Button>
        </form>
      </Form>
    );
  };

  return <div className="space-y-4">{renderContent()}</div>;
}