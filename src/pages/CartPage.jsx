import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function CartPage() {
  const { cart, removeFromCart, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateReservation = async () => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Acesso negado", { description: "Você precisa estar logado para fazer uma reserva." });
        navigate('/login');
        return;
      }

      // Garante que o usuário tenha um perfil. Se não tiver, cria um.
      let { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            // O nome pode ser preenchido depois pelo usuário/admin
            full_name: user.email.split('@')[0] 
          })
          .select('id')
          .single();
        
        if (profileError) throw profileError;
        profile = newProfile;
        toast.info("Perfil criado", { description: "Um perfil de usuário básico foi criado para você." });
      }

      // 1. Criar a reserva principal
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          user_id: profile.id,
          total_price: totalPrice,
          status: 'pending',
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      // 2. Criar os itens da reserva
      const reservationItems = cart.map(item => ({
        reservation_id: reservation.id,
        point_id: item.id,
        price: item.price,
        period_years: item.period,
      }));

      const { error: itemsError } = await supabase
        .from('reservation_items')
        .insert(reservationItems);

      if (itemsError) {
        // Tenta reverter a reserva se os itens falharem
        await supabase.from('reservations').delete().eq('id', reservation.id);
        throw itemsError;
      }

      toast.success("Reserva criada com sucesso!", {
        description: "Você pode acompanhar sua reserva no seu painel.",
      });

      clearCart();
      navigate('/dashboard');

    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      toast.error("Falha ao criar reserva", { description: error.message });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Seu Carrinho</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-center text-gray-500">Seu carrinho está vazio.</p>
          ) : (
            <ul className="divide-y">
              {cart.map(item => (
                <li key={item.id} className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Período: {item.period} ano(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        {cart.length > 0 && (
          <CardFooter className="flex flex-col items-stretch gap-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <Button onClick={handleCreateReservation} disabled={isCreating}>
              {isCreating ? 'Finalizando...' : 'Finalizar Reserva'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}