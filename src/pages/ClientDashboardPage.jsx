import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, updateOrderItemPeriod } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Calendar, LogOut, Loader2 } from 'lucide-react';
import { EditOrderDialog } from '../components/EditOrderDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

function ClientDashboardPage() {
  console.log("ClientDashboardPage rendered."); // NOVO LOG AQUI
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null); // Para feedback de loading
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser(); // Adicionado error para depuração
    
    if (userError) {
      console.error("Error getting user session:", userError); // Log de erro
      navigate('/login');
      return;
    }

    if (!user) {
      console.log("No user found, redirecting to login."); // Log de depuração
      navigate('/login');
      return;
    }
    
    setUser(user);
    console.log("Logged in user email:", user.email); // Log de depuração
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, created_at, updated_at, customer_name, customer_email, customer_phone, total_amount, payment_receipt_url, reserved_until, status,
        order_items (
          id, price, period_years,
          points (id, name, installation_photo_url, price_1y, price_2y, price_3y, price_4y, price_5y) 
        )
      `)
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Erro ao carregar pedidos.");
    } else {
      console.log("Fetched orders:", data); // Log de depuração
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

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
    fetchOrders();
    toast.success('Pedido modificado com sucesso!');
  };

  const handlePeriodChange = async (orderId, itemId, newPeriod) => {
    setUpdatingItemId(itemId);
    try {
      await updateOrderItemPeriod(orderId, itemId, newPeriod);
      toast.success('Período do item atualizado com sucesso!');
      await fetchOrders(); // Recarrega os dados para mostrar o novo total
    } catch (error) {
      console.error("Error updating item period:", error);
      toast.error('Falha ao atualizar o item', { description: error.message });
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Minha Conta</h1>
          <p className="text-gray-600">Gerencie seus pedidos e informações</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </Button>
      </header>

      <main>
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Meus Pedidos</TabsTrigger>
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
                    </CardContent>

                    {order.status === 'pending' && (
                      <div className="p-6 pt-0">
                        <Button className="w-full" onClick={() => openEditModal(order)}>
                          Remover Itens do Pedido
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Gerencie suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{user.user_metadata?.name || 'Nome não informado'}</h3>
                        <p className="text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" onClick={() => navigate('/update-password')}>
                        Alterar Senha
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {selectedOrderForEdit && (
        <EditOrderDialog
          order={selectedOrderForEdit}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveOrder}
        />
      )}
    </div>
  );
}

export default ClientDashboardPage;