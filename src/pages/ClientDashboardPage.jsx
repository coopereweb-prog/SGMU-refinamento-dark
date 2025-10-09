import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, updateOrderItemPeriod } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Loader2, ShoppingCart, Edit } from 'lucide-react';
import { EditOrderDialog } from '../components/EditOrderDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useUser } from '../contexts/UserContext';
import { ClientProfileForm } from '../components/ClientProfileForm';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { RouteGenerator } from '@/components/RouteGenerator';
import { ContractedPointsView } from '../components/ContractedPointsView';

function ClientDashboardPage() {
  const { profile, loading: userProfileLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditModalOpen, setIsEditModal] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoadingOrders(true);
    
    if (!profile) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, created_at, updated_at, customer_name, customer_email, customer_phone, total_amount, payment_receipt_url, reserved_until, status,
        order_items (
          id, price, period_years,
          points (id, name, installation_photo_url, price_1y, price_2y, price_3y, price_4y, price_5y, latitude, longitude) 
        )
      `)
      .or(`user_id.eq.${profile.id},and(customer_email.eq.${profile.email},user_id.is.null)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Erro ao carregar pedidos.");
    } else {
      setOrders(data);
    }
    setLoadingOrders(false);
  };

  useEffect(() => {
    if (!userProfileLoading) {
      fetchOrders();
    }
  }, [userProfileLoading, profile]);

  const openEditModal = (order) => {
    if (order.status !== 'pending') {
      toast.warning('Apenas pedidos pendentes podem ser modificados.');
      return;
    }
    setSelectedOrderForEdit(order);
    setIsEditModal(true);
  };

  const handleSaveOrder = () => {
    setIsEditModal(false);
    setSelectedOrderForEdit(null);
    fetchOrders();
    toast.success('Pedido modificado com sucesso!');
  };

  const handlePeriodChange = async (orderId, itemId, newPeriod) => {
    setUpdatingItemId(itemId);
    try {
      await updateOrderItemPeriod(orderId, itemId, newPeriod);
      toast.success('Período do item atualizado com sucesso!');
      await fetchOrders();
    } catch (error) {
      console.error("Error updating item period:", error);
      toast.error('Falha ao atualizar o item', { description: error.message });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleProfileSave = async () => {
    // O UserContext já lida com a atualização do perfil.
  };

  const completedOrders = useMemo(() => {
    return orders.filter(order => order.status === 'completed');
  }, [orders]);

  if (userProfileLoading || loadingOrders) return <div className="flex items-center justify-center h-full">Carregando...</div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {profile?.name ? `Olá, ${profile.name}!` : 'Minha Conta'}
        </h1>
        <p className="text-gray-600">Gerencie seus pedidos e informações</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Meus Pedidos</TabsTrigger>
          <TabsTrigger value="points">Meus Pontos Contratados</TabsTrigger>
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {orders.length === 0 ? (
            <Card className="mt-6">
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Você ainda não possui nenhum pedido.</p>
                <Button className="mt-4" onClick={() => navigate('/')}>Fazer um pedido</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 mt-6">
              {orders.map(order => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Pedido #{order.id.substring(0, 8)}</CardTitle>
                        <CardDescription>
                          {order.status === 'pending' && `Recebido em: ${new Date(order.created_at).toLocaleString('pt-BR')}`}
                          {order.status === 'completed' && `Concluído em: ${new Date(order.updated_at).toLocaleString('pt-BR')}`}
                          {order.status === 'cancelled' && `Cancelado em: ${new Date(order.updated_at).toLocaleString('pt-BR')}`}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary">Total: R$ {parseFloat(order.total_amount).toFixed(2)}</Badge>
                        <Badge variant={
                          order.status === 'pending' ? 'default' : 
                          order.status === 'completed' ? 'success' : 'destructive'
                        }>
                          {order.status === 'pending' ? 'Pendente' : 
                           order.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                      {order.order_items.map(item => (
                        <div key={item.id} className="text-sm flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-3 rounded-md mb-2">
                          <span className="flex items-center font-medium mb-2 md:mb-0"><MapPin className="h-4 w-4 mr-2 text-gray-500" /> {item.points.name}</span>
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            {updatingItemId === item.id && <Loader2 className="h-4 w-4 animate-spin" />}
                            {order.status === 'pending' ? (
                              <Select
                                value={String(item.period_years)}
                                onValueChange={(value) => handlePeriodChange(order.id, item.id, parseInt(value))}
                                disabled={updatingItemId === item.id}
                              >
                                <SelectTrigger className="w-full md:w-[200px]">
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
                              <span className="flex items-center font-medium"><Calendar className="h-4 w-4 mr-2 text-gray-500" /> {item.period_years} ano(s)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <RouteGenerator points={order.order_items.map(item => item.points).filter(p => p.latitude && p.longitude)} />
                  </CardContent>

                  {order.status === 'pending' && (
                    <div className="p-6 pt-0 flex flex-col sm:flex-row gap-2">
                      <Button className="flex-1" onClick={() => openEditModal(order)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Remover Itens
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Continuar Comprando
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="points">
          <ContractedPointsView orders={completedOrders} profile={profile} />
        </TabsContent>

        <TabsContent value="profile">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Gerencie suas informações pessoais e de contato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <ClientProfileForm profile={profile} onSave={handleProfileSave} />
              ) : (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {selectedOrderForEdit && (
        <EditOrderDialog
          order={selectedOrderForEdit}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModal(false)}
          onSave={handleSaveOrder}
        />
      )}
      <WhatsAppButton />
    </>
  );
}

export default ClientDashboardPage;