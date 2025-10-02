import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderList } from '@/components/OrderList';

export function ClientOrdersSummary() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          points ( name ),
          users ( email, user_metadata )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching client orders:', error);
      } else {
        setOrders(data);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando seus pedidos...</p>
        ) : (
          <OrderList orders={orders} />
        )}
      </CardContent>
    </Card>
  );
}