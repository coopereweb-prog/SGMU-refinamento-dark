import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../lib/supabase.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, User } from 'lucide-react';
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
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLoginInputChange = (e) => {
    const { id, value } = e.target;
    console.log(`Input de Login alterado: id=${id}, valor=${value}`); // Adicionado para depuração
    setLoginData((prev) => ({ ...prev, [id]: value }));
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

      // If login is successful, fetch profile to determine redirection
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        // Redireciona com base no papel do usuário
        switch (profile.role) {
          case 'admin':
          case 'operations_manager':
            navigate('/admin');
            break;
          case 'field_technician':
            navigate('/technician-panel');
            break;
          case 'client':
            navigate('/my-account');
            break;
          default:
            navigate('/');
        }
      }

    } catch (err) {
      const friendlyMessage =
        err?.message ??
        'Não foi possível realizar o login. Por favor, verifique suas credenciais.';
      setError(friendlyMessage);
      console.error('Erro ao fazer login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccountAndReserve = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password match
    if (customerData.password !== customerData.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      // Create account first
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

      // If account created successfully, create the order
      const orderData = await createOrder(customerData, cartItems);
      console.log('Pedido criado com sucesso! ID:', orderData.orderId);
      setSuccess(true);
      onReservationSuccess();
      
      // Show success message and redirect to client dashboard
      setTimeout(() => {
        navigate('/my-account');
      }, 3000);
    } catch (err) {
      const friendlyMessage =
        err?.message ??
        'Não foi possível completar sua reserva. Por favor, tente novamente.';
      setError(friendlyMessage);
      console.error('Erro ao criar conta e reserva:', err);
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
      console.log('Pedido criado com sucesso! ID:', data.orderId);
      setSuccess(true);
      onReservationSuccess();
    } catch (err) {
      const friendlyMessage =
        err?.context?.error ??
        err?.message ??
        err?.error ??
        'Não foi possível completar sua reserva. Por favor, tente novamente.';
      setError(friendlyMessage);
      console.error('Erro ao criar reserva:', err);
    } finally {
      setLoading(false);
    }
  };

  // If reservation was successful, show success message
  if (success) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Reserva Realizada com Sucesso!</AlertTitle>
        <AlertDescription>
          Sua reserva foi confirmada. Você será redirecionado para sua área de cliente.
        </AlertDescription>
        <Button onClick={onClose} className="mt-4 w-full">Fechar</Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {showLoginOption ? (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Já tem uma conta?</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-mail</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  required 
                  value={loginData.email} 
                  onChange={handleLoginInputChange} 
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input 
                  id="login-password" 
                  type="password" 
                  required 
                  value={loginData.password} 
                  onChange={handleLoginInputChange} 
                  disabled={loading}
                />
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
                  onClick={() => setShowLoginOption(false)}
                  disabled={loading}
                >
                  Criar Conta ou Continuar como Convidado
                </Button>
              </div>
            </form>
          </div>
        </>
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
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Seu nome" 
                  required 
                  value={customerData.name} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  required 
                  value={customerData.email} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="(19) 99999-9999" 
                  required 
                  value={customerData.phone} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Crie uma senha" 
                  required 
                  value={customerData.password} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirme sua senha" 
                  required 
                  value={customerData.confirmPassword} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ocorreu um Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLoginOption(true)} 
                  disabled={loading}
                >
                  Já tenho conta
                </Button>
                <Button type="submit" className="w-40" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Criar Conta e Reservar'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReserveAsGuest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Seu nome" 
                  required 
                  value={customerData.name} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  required 
                  value={customerData.email} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="(19) 99999-9999" 
                  required 
                  value={customerData.phone} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ocorreu um Erhro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLoginOption(true)} 
                  disabled={loading}
                >
                  Já tenho conta
                </Button>
                <Button type="submit" className="w-40" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Reservar como Convidado'}
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}