import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, updateOrderItemPeriod } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Loader2, ShoppingBag, ExternalLink } from 'lucide-react';
import { EditOrderDialog } from './EditOrderDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useUser } from '../contexts/UserContext';

export function ClientOrdersSummary({ onOrderActionSuccess }) {
  const { profile, loading: userLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    if (!profile?.email) {
      setOrders([]);
      setLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, created_at, updated_at, total_amount, reserved_until, status,
        order_items (
          id, price, period_years,
          points (id, name, price_1y, price_2y, price_3y, price_4y, price_5y) 
        )
      `)
      .eq('customer_email', profile.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching client orders:", error);
      toast.error("Erro ao carregar seus pedidos.");
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userLoading) {
      fetchOrders();
    }
  }, [userLoading, profile]);

  const openEditModal = (order) => {
    if (order.status !== 'pending') {
      toast.warning('Apenas pedidos pendentes podem ser modificados.');
      return;
    }
    setSelectedOrderForEdit(order);
    setIsEditModalOpen(true);
  };

  const handleSaveOrder = () => {
    setIsEditModalOpen(false);
    setSelectedOrderForEdit(null);
    fetchOrders(); // Recarrega os pedidos para refletir as alterações
    if (onOrderActionSuccess) onOrderActionSuccess();
    toast.success('Pedido modificado com sucesso!');
  };

  const handlePeriodChange = async (orderId, itemId, newPeriod) => {
    setUpdatingItemId(itemId);
    try {
      await updateOrderItemPeriod(orderId, itemId, newPeriod);
      toast.success('Período do item atualizado com sucesso!');
      await fetchOrders(); // Recarrega os dados para mostrar o novo total
      if (onOrderActionSuccess) onOrderActionSuccess();
    } catch (error) {
      console.error("Error updating item period:", error);
      toast.error('Falha ao atualizar o item', { description: error.message });
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (userLoading || loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader><CardTitle>Meus Pedidos</CardTitle></CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader><CardTitle>Meus Pedidos</CardTitle></CardHeader>
        <CardContent className="flex-1 text-center py-8 flex flex-col items-center justify-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Você ainda não possui nenhum pedido.</p>
          <Button className="mt-4" onClick={() => navigate('/my-account')}>Ver Minha Conta</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Meus Pedidos</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/my-account')}>
          <ExternalLink className="h-4 w-4 mr-2" /> Ver Todos
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {orders.map(order => (
          <Card key={order.id} className="shadow-sm">
            <CardHeader className="p-3 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">Pedido #{order.id.substring(0, 8)}</CardTitle>
                  <CardDescription className="text-xs">
                    {order.status === 'pending' && `Reservado até: ${order.reserved_until ? new Date(order.reserved_until).toLocaleDateString('pt-BR') : 'N/A'}`}
                    {order.status === 'completed' && `Concluído em: ${new Date(order.updated_at).toLocaleDateString('pt-BR')}`}
                    {order.status === 'cancelled' && `Cancelado em: ${new Date(order.updated_at).toLocaleDateString('pt-BR')}`}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-xs">R$ {parseFloat(order.total_amount).toFixed(2)}</Badge>
                  <Badge variant={
                    order.status === 'pending' ? 'default' : 
                    order.status === 'completed' ? 'success' : 'destructive'
                  } className="text-xs">
                    {order.status === 'pending' ? 'Pendente' : 
                     order.status === 'completed' ? 'Concluído' : 'Cancelado'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {order.order_items.map(item => (
                <div key={item.id} className="text-xs flex flex-col justify-between items-start bg-gray-50 p-2 rounded-md">
                  <span className="flex items-center font-medium mb-1"><MapPin className="h-3 w-3 mr-1 text-gray-500" /> {item.points.name}</span>
                  <div className="flex items-center gap-2 w-full">
                    {updatingItemId === item.id && <Loader2 className="h-3 w-3 animate-spin" />}
                    {order.status === 'pending' ? (
                      <Select
                        value={String(item.period_years)}
                        onValueChange={(value) => handlePeriodChange(order.id, item.id, parseInt(value))}
                        disabled={updatingItemId === item.id}
                      >
                        <SelectTrigger className="h-7 text-xs w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(years => {
                            const price = item.points[`price_${years}y`];
                            const isAvailable = typeof price === 'number' && price > 0;
                            return (
                              <SelectItem key={years} value={String(years)} disabled={!isAvailable}>
                                {isAvailable ? `${years} ano(s) - R$ ${price.toFixed(2)}` : `${years} ano(s) - (Indisponível)`}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="flex items-center font-medium"><Calendar className="h-3 w-3 mr-1 text-gray-500" /> {item.period_years} ano(s)</span>
                    )}
                  </div>
                </div>
              ))}
              {order.status === 'pending' && (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => openEditModal(order)}>
                  Remover Itens
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
      
      {selectedOrderForEdit && (
        <EditOrderDialog
          order={selectedOrderForEdit}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveOrder}
        />
      )}
    </Card>
  );
}