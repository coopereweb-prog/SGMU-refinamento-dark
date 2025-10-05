import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          price,
          period_years,
          points (id, name)
        )
      `)
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error("Erro ao buscar pedidos", { description: error.message });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'default',
      completed: 'success',
      cancelled: 'destructive',
    };
    const labels = {
      pending: 'Pendente',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const handleViewOrder = (orderId) => {
    // Navegar para uma página de detalhes do pedido (pode ser implementada depois)
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por cliente ou email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-gray-500">Nenhum pedido encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.order_items?.length || 0} item(ns)
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {order.order_items.slice(0, 2).map(item => item.points?.name).filter(Boolean).join(', ')}
                            {order.order_items.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewOrder(order.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}