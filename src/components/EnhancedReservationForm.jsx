import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../lib/supabase.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const [showLoginOption, setShowLoginOption] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [key, setKey] = useState(0);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [showLoginOption]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (loginError) throw loginError;

      const orderData = await createOrder(customerData, cartItems);
      setSuccess(true);
      onReservationSuccess();
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      const friendlyMessage = 'Não foi possível realizar o login. Por favor, verifique suas credenciais.';
      setError(friendlyMessage);
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
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: customerData.email,
        password: customerData.password,
        options: {
          data: {
            name: customerData.name,
          }
        }
      });

      if (signUpError) throw signUpError;

      const orderData = await createOrder(customerData, cartItems);
      setSuccess(true);
      onReservationSuccess();
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      if (err.message && err.message.includes('User already registered')) {
        setError('Este e-mail já está cadastrado. Por favor, faça login para continuar a reserva.');
        setShowLoginOption(true);
        setLoginData(prev => ({ ...prev, email: customerData.email }));
      } else {
        const friendlyMessage = err?.message ?? 'Não foi possível completar sua reserva. Por favor, tente novamente.';
        setError(friendlyMessage);
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
      const data = await createOrder(customerData, cartItems);
      setSuccess(true);
      onReservationSuccess();
    } catch (err) {
      const friendlyMessage = err?.context?.error ?? err?.message ?? err?.error ?? 'Não foi possível completar sua reserva. Por favor, tente novamente.';
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Reserva Realizada com Sucesso!</AlertTitle>
        <AlertDescription>
          Sua reserva foi confirmada. Em breve você será redirecionado.
        </AlertDescription>
        <Button onClick={onClose} className="mt-4 w-full">Fechar</Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {showLoginOption ? (
        <div key={key} className="space-y-4">
          <h3 className="text-lg font-semibold">Já tem uma conta?</h3>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">E-mail</Label>
              <Input
                id="login-email" 
                name="email"
                type="email" 
                placeholder="seu@email.com" 
                required 
                value={loginData.email} 
                onChange={handleLoginInputChange} 
                disabled={loading}
                className={error ? 'border-destructive' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <div className="relative">
                <Input
                  id="login-password" 
                  name="password"
                  type={showLoginPassword ? 'text' : 'password'} 
                  required 
                  value={loginData.password} 
                  onChange={handleLoginInputChange} 
                  disabled={loading}
                  className={`pr-10 ${error ? 'border-destructive' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  disabled={loading}
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ocorreu um Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Entrar e Reservar'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowLoginOption(false); setError(null); }}
                disabled={loading}
              >
                Criar Conta ou Continuar como Convidado
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex space-x-2 mb-4">
            <Button 
              variant={isCreatingAccount ? "default" : "outline"} 
              onClick={() => setIsCreatingAccount(true)}
              className="flex-1"
            >
              Criar Conta
            </Button>
            <Button 
              variant={!isCreatingAccount ? "default" : "outline"} 
              onClick={() => setIsCreatingAccount(false)}
              className="flex-1"
            >
              Sem Conta
            </Button>
          </div>

          {isCreatingAccount ? (
            <form onSubmit={handleCreateAccountAndReserve} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" type="text" placeholder="Seu nome" required value={customerData.name} onChange={handleInputChange} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required value={customerData.email} onChange={handleInputChange} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" type="tel" placeholder="(19) 99999-9999" required value={customerData.phone} onChange={handleInputChange} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showCreatePassword ? 'text' : 'password'} placeholder="Crie uma senha" required value={customerData.password} onChange={handleInputChange} disabled={loading} className="pr-10" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500" onClick={() => setShowCreatePassword(!showCreatePassword)} disabled={loading}>
                    {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirme sua senha" required value={customerData.confirmPassword} onChange={handleInputChange} disabled={loading} className="pr-10" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ocorreu um Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowLoginOption(true)} disabled={loading}>Já tenho conta</Button>
                <Button type="submit" className="w-40" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Criar Conta e Reservar'}</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReserveAsGuest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" type="text" placeholder="Seu nome" required value={customerData.name} onChange={handleInputChange} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required value={customerData.email} onChange={handleInputChange} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" type="tel" placeholder="(19) 99999-9999" required value={customerData.phone} onChange={handleInputChange} disabled={loading} />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ocorreu um Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowLoginOption(true)} disabled={loading}>Já tenho conta</Button>
                <Button type="submit" className="w-40" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Reservar como Convidado'}</Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}