import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, updateOrderItemPeriod, confirmOrder, cancelOrder, markOrderAsEditedByAdmin } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Loader2, ArrowLeft, User, Mail, Phone, Calendar, Printer, CheckCircle, XCircle, Edit, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getOrderStatusProps } from '@/lib/utils';
import { EditOrderDialog } from '@/components/EditOrderDialog';
import { PrintableOrder } from '@/components/PrintableOrder';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RouteGenerator } from '@/components/RouteGenerator'; // Importação

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*, points(*))`)
      .eq('id', orderId)
      .single();

    if (error) {
      toast.error("Pedido não encontrado", { description: "Não foi possível carregar os detalhes do pedido." });
      navigate('/admin/orders');
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handlePeriodChange = async (itemId, newPeriod) => {
    setUpdatingItemId(itemId);
    try {
      await updateOrderItemPeriod(order.id, itemId, newPeriod);
      await markOrderAsEditedByAdmin(order.id);
      toast.success('Período do item atualizado com sucesso!');
      fetchOrder();
    } catch (error) {
      toast.error('Falha ao atualizar o item', { description: error.message });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      await confirmOrder(order.id);
      toast.success("Pedido confirmado!", { description: "Os pontos agora estão marcados como vendidos." });
      fetchOrder();
    } catch (error) {
      toast.error("Erro ao confirmar pedido", { description: error.message });
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(order.id);
      toast.success("Pedido cancelado!", { description: "Os pontos foram liberados e estão disponíveis novamente." });
      fetchOrder();
    } catch (error) {
      toast.error("Erro ao cancelar pedido", { description: error.message });
    }
  };
  
  const handleSaveEdits = async () => {
    await markOrderAsEditedByAdmin(order.id);
    fetchOrder();
    setIsEditDialogOpen(false);
    toast.success("Pedido modificado com sucesso!");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /> Carregando detalhes...</div>;
  }

  if (!order) return null;

  const statusProps = getOrderStatusProps(order.status);
  const orderPoints = order.order_items.map(item => item.points).filter(p => p.latitude && p.longitude);

  return (
    <div className="container mx-auto p-4 space-y-6 print:p-0">
      <div className="print:hidden">
        <Button variant="outline" onClick={() => navigate('/admin/orders')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Pedidos
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <CardTitle className="text-2xl">Detalhes do Pedido #{order.id.substring(0, 8)}</CardTitle>
                <CardDescription>
                  Criado em: {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusProps.variant} className="text-base px-3 py-1">{statusProps.label}</Badge>
                {order.edited_by_admin && <Badge variant="outline"><Info className="h-3 w-3 mr-1.5" />Editado pelo Admin</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button><CheckCircle className="h-4 w-4 mr-2" />Confirmar Pagamento</Button></AlertDialogTrigger>
                    <AlertDialogContent aria-describedby={undefined}>
                      <AlertDialogHeader><AlertDialogTitle>Confirmar Pagamento?</AlertDialogTitle><AlertDialogDescription>Esta ação marcará o pedido como 'Concluído' e os pontos como 'Vendidos'. Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleConfirmOrder}>Confirmar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive"><XCircle className="h-4 w-4 mr-2" />Cancelar Pedido</Button></AlertDialogTrigger>
                    <AlertDialogContent aria-describedby={undefined}>
                      <AlertDialogHeader><AlertDialogTitle>Cancelar Pedido?</AlertDialogTitle><AlertDialogDescription>Esta ação marcará o pedido como 'Cancelado' e liberará os pontos. Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={handleCancelOrder}>Sim, Cancelar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button variant="secondary" onClick={() => setIsEditDialogOpen(true)}><Edit className="h-4 w-4 mr-2" />Editar Itens</Button>
                </>
              )}
              <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Gerar PDF / Imprimir</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Informações do Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center"><User className="h-4 w-4 mr-3 text-gray-500" /><strong>Nome:</strong><span className="ml-2">{order.customer_name}</span></div>
              <div className="flex items-center"><Mail className="h-4 w-4 mr-3 text-gray-500" /><strong>Email:</strong><span className="ml-2">{order.customer_email}</span></div>
              <div className="flex items-center"><Phone className="h-4 w-4 mr-3 text-gray-500" /><strong>Telefone:</strong><span className="ml-2">{order.customer_phone}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Resumo Financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center"><span>Total de Itens:</span><strong>{order.order_items.length}</strong></div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-3 mt-2"><span>Valor Total:</span><span>{Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Itens do Pedido</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Ponto</TableHead><TableHead>Período</TableHead><TableHead className="text-right">Preço</TableHead></TableRow></TableHeader>
              <TableBody>
                {order.order_items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.points.name}</TableCell>
                    <TableCell>
                      {order.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          {updatingItemId === item.id && <Loader2 className="h-4 w-4 animate-spin" />}
                          <Select
                            value={String(item.period_years)}
                            onValueChange={(value) => handlePeriodChange(item.id, parseInt(value))}
                            disabled={updatingItemId === item.id}
                          >
                            <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(years => {
                                const price = item.points[`price_${years}y`];
                                return <SelectItem key={years} value={String(years)}>{`${years} ano(s)`}</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        `${item.period_years} ano(s)`
                      )}
                    </TableCell>
                    <TableCell className="text-right">{Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <RouteGenerator points={orderPoints} />
          </CardContent>
        </Card>
      </div>

      <div className="hidden print:block">
        <PrintableOrder order={order} />
      </div>

      <EditOrderDialog
        order={order}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdits}
      />
    </div>
  );
}

export default OrderDetailPage;