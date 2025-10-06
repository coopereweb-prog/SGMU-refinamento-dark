import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, User, Mail, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items(*, points(name))`)
        .eq('id', orderId)
        .single();

      if (error) {
        toast.error('Erro ao buscar pedido', { description: error.message });
        navigate('/admin/orders');
      } else {
        setOrder(data);
        setCurrentStatus(data.status);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, navigate]);

  const handleStatusChange = async () => {
    setIsSaving(true);
    try {
      let rpcName = '';
      if (currentStatus === 'completed') {
        rpcName = 'confirm_order_and_update_points';
      } else if (currentStatus === 'cancelled') {
        rpcName = 'cancel_order_and_release_points';
      }

      if (rpcName) {
        const { error } = await supabase.rpc(rpcName, { p_order_id: orderId });
        if (error) throw error;
      } else {
        // For 'pending' or other statuses, just update the table
        const { error } = await supabase.from('orders').update({ status: currentStatus }).eq('id', orderId);
        if (error) throw error;
      }
      
      toast.success('Status do pedido atualizado com sucesso!');
      setOrder(prev => ({ ...prev, status: currentStatus }));
    } catch (error) {
      toast.error('Falha ao atualizar status', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = { pending: 'default', completed: 'success', cancelled: 'destructive' };
    const labels = { pending: 'Pendente', completed: 'Concluído', cancelled: 'Cancelado' };
    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!order) {
    return <p>Pedido não encontrado.</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Button variant="outline" onClick={() => navigate('/admin/orders')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Pedidos
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Pedido #{order.id.substring(0, 8)}</CardTitle>
              <CardDescription>
                Data: {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </CardDescription>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Detalhes do Cliente</h3>
            <div className="text-sm space-y-2">
              <p className="flex items-center"><User className="h-4 w-4 mr-2 text-gray-500" /> {order.customer_name}</p>
              <p className="flex items-center"><Mail className="h-4 w-4 mr-2 text-gray-500" /> {order.customer_email}</p>
              <p className="flex items-center"><Phone className="h-4 w-4 mr-2 text-gray-500" /> {order.customer_phone}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Itens do Pedido</h3>
            <ul className="text-sm space-y-2">
              {order.order_items.map(item => (
                <li key={item.id} className="flex justify-between items-center">
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-500" /> {item.points.name} ({item.period_years} ano(s))</span>
                  <span>{Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Pedido</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-grow w-full sm:w-auto">
            <label className="text-sm font-medium">Alterar Status</label>
            <Select value={currentStatus} onValueChange={setCurrentStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleStatusChange} disabled={isSaving || currentStatus === order.status} className="w-full sm:w-auto self-end">
            {isSaving ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}