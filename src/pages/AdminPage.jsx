import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Tag, ShoppingCart } from 'lucide-react';
import { OrderList } from '@/components/OrderList';

export function AdminPage() {
  const [stats, setStats] = useState({
    users: 0,
    points: 0,
    tags: 0,
    orders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch counts
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: pointCount } = await supabase.from('points').select('*', { count: 'exact', head: true });
      const { count: tagCount } = await supabase.from('tags').select('*', { count: 'exact', head: true });
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

      setStats({
        users: userCount,
        points: pointCount,
        tags: tagCount,
        orders: orderCount,
      });

      // Fetch recent orders
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          points ( name ),
          users ( email, user_metadata )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent orders:', error);
      } else {
        setRecentOrders(ordersData);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Painel do Administrador</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users />} title="Usuários" value={stats.users} />
        <StatCard icon={<MapPin />} title="Pontos" value={stats.points} />
        <StatCard icon={<Tag />} title="Tags" value={stats.tags} />
        <StatCard icon={<ShoppingCart />} title="Pedidos" value={stats.orders} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Carregando pedidos...</p> : <OrderList orders={recentOrders} />}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}