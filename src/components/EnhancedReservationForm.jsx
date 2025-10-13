import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../lib/supabase.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function EnhancedReservationForm({ cartItems, onClose, onReservationSuccess }) {
  const [customerData, setCustomerData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [view, setView] = useState('login'); // 'login', 'create', 'guest', 'forgot_password'
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Verificar se usuário já está logado
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Se usuário está logado, preencher dados automaticamente
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setCustomerData(prev => ({
            ...prev,
            name: profile.name || session.user.user_metadata?.name || '',
            email: profile.email || session.user.email,
            phone: profile.phone || ''
          }));
        }
        // Direcionar para a view de usuário logado
        setView('logged_in');
      }
    };
    
    checkUserSession();
  }, []);

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (loginError) throw loginError;

      // Após login, obter dados do perfil
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('id', user.id)
        .single();

      // Atualizar dados do cliente com informações do perfil
      setCustomerData({
        name: profile?.name || user.user_metadata?.name || '',
        email: profile?.email || user.email,
        phone: profile?.phone || '',
        password: '',
        confirmPassword: ''
      });

      // Criar pedido
      await createOrder({
        name: profile?.name || user.user_metadata?.name || '',
        email: profile?.email || user.email,
        phone: profile?.phone || ''
      }, cartItems);

      setSuccess(true);
      onReservationSuccess();
      
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError('E-mail ou senha inválidos. Por favor, verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
        redirectTo: `${import.meta.env.VITE_SITE_URL}/update-password`,
      });
      if (error) throw error;
      toast.success('Verifique seu e-mail', {
        description: `Se o e-mail ${loginData.email} estiver cadastrado, você receberá um link para redefinir sua senha.`,
      });
      setView('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccountAndReserve = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (customerData.password !== customerData.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: customerData.email,
        password: customerData.password,
        options: { data: { name: customerData.name } }
      });
      if (signUpError) throw signUpError;

      await createOrder(customerData, cartItems);
      setSuccess(true);
      onReservationSuccess();
      
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      if (err.message?.includes('User already registered')) {
        setError('Este e-mail já está cadastrado. Por favor, faça login.');
        setView('login');
        setLoginData(prev => ({ ...prev, email: customerData.email }));
      } else {
        setError(err.message ?? 'Não foi possível completar sua reserva.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReserveAsGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createOrder(customerData, cartItems);
      setSuccess(true);
      onReservationSuccess();
    } catch (err) {
      setError(err.message ?? 'Não foi possível completar sua reserva.');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveWithLoggedInUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createOrder(customerData, cartItems);
      setSuccess(true);
      onReservationSuccess();
    } catch (err) {
      setError(err.message ?? 'Não foi possível completar sua reserva.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Reserva Realizada com Sucesso!</AlertTitle>
        <AlertDescription>Sua reserva foi confirmada. Em breve você será redirecionado.</AlertDescription>
        <Button onClick={onClose} className="mt-4 w-full">Fechar</Button>
      </Alert>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'forgot_password':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Redefinir Senha</h3>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-mail</Label>
                <Input id="login-email" name="email" type="email" placeholder="seu@email.com" required value={loginData.email} onChange={handleLoginInputChange} disabled={loading} />
              </div>
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
              <div className="flex flex-col space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Enviar Link'}</Button>
                <Button type="button" variant="link" onClick={() => { setView('login'); setError(null); }}>Voltar para o Login</Button>
              </div>
            </form>
          </div>
        );
      case 'login':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Já tem uma conta?</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-mail</Label>
                <Input id="login-email" name="email" type="email" placeholder="seu@email.com" required value={loginData.email} onChange={handleLoginInputChange} disabled={loading} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Senha</Label>
                  <Button type="button" variant="link" className="h-auto p-0 text-sm underline" onClick={() => setView('forgot_password')}>Esqueceu sua senha?</Button>
                </div>
                <div className="relative">
                  <Input id="login-password" name="password" type={showLoginPassword ? 'text' : 'password'} required value={loginData.password} onChange={handleLoginInputChange} disabled={loading} className="pr-10" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500" onClick={() => setShowLoginPassword(!showLoginPassword)} disabled={loading}>
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
              <div className="flex flex-col space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Entrar e Reservar'}</Button>
                <Button type="button" variant="outline" onClick={() => { setView('guest'); setError(null); }}>Criar Conta ou Continuar como Convidado</Button>
              </div>
            </form>
          </div>
        );
      case 'logged_in':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Confirmar Reserva</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">Dados do Cliente:</p>
              <p>Nome: {customerData.name}</p>
              <p>Email: {customerData.email}</p>
              <p>Telefone: {customerData.phone}</p>
            </div>
            <form onSubmit={handleReserveWithLoggedInUser} className="space-y-4">
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setView('guest')} disabled={loading}>Alterar Dados</Button>
                <Button type="submit" className="w-40" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Confirmar Reserva'}</Button>
              </div>
            </form>
          </div>
        );
      default: // 'create' or 'guest'
        const isCreatingAccount = view === 'create';
        return (
          <>
            <div className="flex space-x-2 mb-4">
              <Button variant={isCreatingAccount ? "default" : "outline"} onClick={() => setView('create')} className="flex-1">Criar Conta</Button>
              <Button variant={!isCreatingAccount ? "default" : "outline"} onClick={() => setView('guest')} className="flex-1">Sem Conta</Button>
            </div>
            <form onSubmit={isCreatingAccount ? handleCreateAccountAndReserve : handleReserveAsGuest} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Nome Completo</Label><Input id="name" type="text" placeholder="Seu nome" required value={customerData.name} onChange={(e) => setCustomerData(p => ({...p, name: e.target.value}))} disabled={loading} /></div>
              <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" placeholder="seu@email.com" required value={customerData.email} onChange={(e) => setCustomerData(p => ({...p, email: e.target.value}))} disabled={loading} /></div>
              <div className="space-y-2"><Label htmlFor="phone">Telefone / WhatsApp</Label><Input id="phone" type="tel" placeholder="(19) 99999-9999" required value={customerData.phone} onChange={(e) => setCustomerData(p => ({...p, phone: e.target.value}))} disabled={loading} /></div>
              {isCreatingAccount && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input id="password" type={showCreatePassword ? 'text' : 'password'} placeholder="Crie uma senha" required value={customerData.password} onChange={(e) => setCustomerData(p => ({...p, password: e.target.value}))} disabled={loading} className="pr-10" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500" onClick={() => setShowCreatePassword(!showCreatePassword)} disabled={loading}>{showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirme sua senha" required value={customerData.confirmPassword} onChange={(e) => setCustomerData(p => ({...p, confirmPassword: e.target.value}))} disabled={loading} className="pr-10" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                    </div>
                  </div>
                </>
              )}
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setView('login')} disabled={loading}>Já tenho conta</Button>
                <Button type="submit" className="w-40" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : isCreatingAccount ? 'Criar e Reservar' : 'Reservar'}</Button>
              </div>
            </form>
          </>
        );
    }
  };

  return <div className="space-y-4">{renderContent()}</div>;
}