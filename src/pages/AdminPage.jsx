import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Tag, ShoppingCart, Loader2 } from 'lucide-react';
import { OrderList } from '@/components/OrderList';
import { toast } from 'sonner';

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
      try {
        // Fetch counts
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        const { count: pointCount, error: pointError } = await supabase.from('points').select('*', { count: 'exact', head: true });
        if (pointError) throw pointError;

        const { count: tagCount, error: tagError } = await supabase.from('tags').select('*', { count: 'exact', head: true });
        if (tagError) throw tagError;

        const { count: orderCount, error: orderError } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        if (orderError) throw orderError;

        setStats({
          users: users.length,
          points: pointCount,
          tags: tagCount,
          orders: orderCount,
        });

        // Fetch recent orders
        const { data: ordersData, error: recentOrdersError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            customer_name,
            order_items(points(name)),
            profiles(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentOrdersError) throw recentOrdersError;
        
        setRecentOrders(ordersData);

      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error("Erro ao carregar dados", { description: "Não foi possível buscar os dados do painel." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Painel do Administrador</h1>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Card key={i}><CardHeader><CardTitle className="text-sm font-medium text-gray-500">Carregando...</CardTitle></CardHeader><CardContent><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin/users">
            <StatCard icon={<Users className="text-gray-500" />} title="Usuários" value={stats.users} />
          </Link>
          <Link to="/admin/points">
            <StatCard icon={<MapPin className="text-gray-500" />} title="Pontos" value={stats.points} />
          </Link>
          <Link to="/admin/tags">
            <StatCard icon={<Tag className="text-gray-500" />} title="Tags" value={stats.tags} />
          </Link>
          <StatCard icon={<ShoppingCart className="text-gray-500" />} title="Pedidos" value={stats.orders} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div> : <OrderList orders={recentOrders} />}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <Card className="hover:bg-gray-50 transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
      </CardContent>
    </Card>
  );
}