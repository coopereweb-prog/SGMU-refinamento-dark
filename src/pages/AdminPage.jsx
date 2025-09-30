import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Mail, Phone, MapPin, Calendar as CalendarIcon, CheckCircle, XCircle, LogOut, Paperclip, UploadCloud, Edit, AlertCircle } from 'lucide-react';
import { EditOrderDialog } from '../components/EditOrderDialog.jsx';

function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [user, setUser] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async (status) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, created_at, updated_at, customer_name, customer_email, customer_phone, total_amount, payment_receipt_url, reserved_until,
        order_items (
          id, price, period_years,
          points (id, name, installation_photo_url) 
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching orders:", error);
      alert("Não foi possível carregar os pedidos.");
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkUserAndFetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      fetchOrders(activeTab);
    };
    checkUserAndFetchOrders();
  }, [navigate, activeTab]);

  const handleFileChange = (id, file) => {
    setSelectedFiles(prev => ({ ...prev, [id]: file }));
  };

  const handleUpload = async (orderId, pointId, bucket, column, file) => {
    if (!file) {
      alert('Por favor, selecione um arquivo primeiro.');
      return;
    }
    setUploading(prev => ({ ...prev, [pointId || orderId]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pointId || orderId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      let table, updateData, matchCriteria;
      if (bucket === 'order-receipts') {
        table = 'orders';
        updateData = { payment_receipt_url: publicUrl };
        matchCriteria = { id: orderId };
      } else {
        table = 'points';
        updateData = { [column]: publicUrl };
        matchCriteria = { id: pointId };
      }

      const { error: updateError } = await supabase.from(table).update(updateData).match(matchCriteria);
      if (updateError) throw updateError;

      alert('Arquivo enviado com sucesso!');
      fetchOrders(activeTab);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Falha no upload: ${error.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [pointId || orderId]: false }));
    }
  };

  const handleConfirmSale = async (orderId) => {
    if (!window.confirm(`Confirmar a venda para este pedido?`)) return;
    const { error } = await supabase.rpc('confirm_order_and_update_points', { p_order_id: orderId });
    if (error) {
      alert(`Erro ao confirmar venda: ${error.message}`);
    } else {
      alert('Venda confirmada com sucesso!');
      fetchOrders(activeTab);
    }
  };

  const handleCancelReservation = async (orderId) => {
    if (!window.confirm(`Cancelar esta reserva? Os pontos voltarão a ficar disponíveis.`)) return;
    const { error } = await supabase.rpc('cancel_order_and_release_points', { p_order_id: orderId });
    if (error) {
      alert(`Erro ao cancelar reserva: ${error.message}`);
    } else {
      alert('Reserva cancelada com sucesso!');
      fetchOrders(activeTab);
    }
  };

  const handleUpdateExpiration = async (orderId) => {
    if (!expirationDate) {
      alert("Por favor, selecione uma data.");
      return;
    }
    const { error } = await supabase
      .from('orders')
      .update({ reserved_until: expirationDate.toISOString() })
      .eq('id', orderId);
    
    if (error) {
      alert(`Erro ao atualizar data: ${error.message}`);
    } else {
      alert("Data de expiração atualizada com sucesso!");
      setExpirationDate(null);
      fetchOrders(activeTab);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const openEditModal = (order) => {
    setSelectedOrderForEdit(order);
    setIsEditModalOpen(true);
  };

  const handleSaveOrder = () => {
    setIsEditModalOpen(false);
    setSelectedOrderForEdit(null);
    fetchOrders(activeTab); // Recarrega os pedidos para refletir as alterações
    alert('Pedido modificado com sucesso!');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="text-gray-600">Gerenciamento de Pedidos e Pontos</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/users">
            <Button variant="outline">Gerenciar Usuários</Button>
          </Link>
          <Link to="/admin/points">
            <Button variant="outline">Gerenciar Pontos</Button>
          </Link>
          <Link to="/admin/tags">
            <Button variant="outline">Gerenciar Tags</Button>
          </Link>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main>
        <Tabs defaultValue="pending" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          </TabsList>

          {['pending', 'completed', 'cancelled'].map(status => (
            <TabsContent key={status} value={status}>
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 mt-16">Nenhum pedido com status '{status}'.</p>
              ) : (
                <div className="space-y-6 mt-6">
                  {orders.map(order => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Pedido #{order.id.substring(0, 8)}</CardTitle>
                            <CardDescription>
                              {status === 'pending' && `Recebido em: ${new Date(order.created_at).toLocaleString('pt-BR')}`}
                              {status === 'completed' && `Concluído em: ${new Date(order.updated_at).toLocaleString('pt-BR')}`}
                              {status === 'cancelled' && `Cancelado em: ${new Date(order.updated_at).toLocaleString('pt-BR')}`}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">Total: R$ {parseFloat(order.total_amount).toFixed(2)}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Dados do Cliente</h4>
                          <p className="text-sm flex items-center"><User className="h-4 w-4 mr-2 text-gray-500" /> {order.customer_name}</p>
                          <p className="text-sm flex items-center"><Mail className="h-4 w-4 mr-2 text-gray-500" /> {order.customer_email}</p>
                          <p className="text-sm flex items-center"><Phone className="h-4 w-4 mr-2 text-gray-500" /> {order.customer_phone}</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Itens do Pedido</h4>
                          {order.order_items.map(item => (
                            <div key={item.id} className="text-sm flex justify-between items-center bg-gray-50 p-2 rounded-md">
                              <span className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-500" /> {item.points.name}</span>
                              <span className="flex items-center font-medium"><CalendarIcon className="h-4 w-4 mr-2 text-gray-500" /> {item.period_years} ano(s)</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>

                      {status === 'pending' && (
                        <CardContent className="border-t pt-4 space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Comprovante de Pagamento</h4>
                            {order.payment_receipt_url ? (
                              <a href={order.payment_receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                                <Paperclip className="h-4 w-4 mr-2" /> Ver Comprovante
                              </a>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input type="file" className="flex-1" onChange={(e) => handleFileChange(order.id, e.target.files[0])} disabled={uploading[order.id]} />
                                <Button onClick={() => handleUpload(order.id, null, 'order-receipts', 'payment_receipt_url', selectedFiles[order.id])} disabled={!selectedFiles[order.id] || uploading[order.id]}>
                                  <UploadCloud className="h-4 w-4 mr-2" /> {uploading[order.id] ? 'Enviando...' : 'Anexar'}
                                </Button>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Gestão da Reserva</h4>
                            <div className="flex items-center gap-4">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {order.reserved_until ? format(new Date(order.reserved_until), "PPP", { locale: ptBR }) : <span>Definir expiração</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar mode="single" selected={expirationDate} onSelect={setExpirationDate} initialFocus />
                                </PopoverContent>
                              </Popover>
                              <Button onClick={() => handleUpdateExpiration(order.id)}>Salvar Data</Button>
                            </div>
                          </div>
                        </CardContent>
                      )}

                      {status === 'completed' && (
                        <CardContent className="border-t pt-4">
                          <h4 className="font-semibold mb-3">Fotos da Instalação</h4>
                          <div className="space-y-4">
                            {order.order_items.map(item => (
                              <div key={item.points.id} className="space-y-2">
                                <p className="font-medium text-sm">{item.points.name}</p>
                                {item.points.installation_photo_url ? (
                                  <a href={item.points.installation_photo_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                                    <Paperclip className="h-4 w-4 mr-2" /> Ver Foto Instalada
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Input type="file" className="flex-1" onChange={(e) => handleFileChange(item.points.id, e.target.files[0])} disabled={uploading[item.points.id]} />
                                    <Button onClick={() => handleUpload(order.id, item.points.id, 'installation-photos', 'installation_photo_url', selectedFiles[item.points.id])} disabled={!selectedFiles[item.points.id] || uploading[item.points.id]}>
                                      <UploadCloud className="h-4 w-4 mr-2" /> {uploading[item.points.id] ? 'Enviando...' : 'Anexar'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}

                      {status === 'pending' && (
                        <div className="p-6 pt-4 flex gap-4">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleConfirmSale(order.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Confirmar Venda
                          </Button>
                          <Button className="flex-1" variant="destructive" onClick={() => handleCancelReservation(order.id)}>
                            <XCircle className="h-4 w-4 mr-2" /> Cancelar Reserva
                          </Button>
                          <Button variant="outline" onClick={() => openEditModal(order)}>
                            <Edit className="h-4 w-4 mr-2" /> Modificar
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
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

export default AdminPage;