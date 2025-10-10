import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Search, Calendar, CheckCircle, XCircle, Printer, Truck, Map, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getOrderStatusProps } from '@/lib/utils';
import { generateOptimizedRouteUrl } from '@/lib/maps-utils';
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

function generatePrintableHTML(order) {
  if (!order) return '';

  const orderItemsHTML = order.order_items.map(item => `
    <tr>
      <td style="padding: 6px; border: 1px solid #ddd; font-size: 12px;">${item.points.name}</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 12px;">${item.period_years} ano(s)</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-family: monospace; font-size: 12px;">${Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
    </tr>
  `).join('');

  // Split items: first 5 on page 1, rest on subsequent pages (aiming for 12+ per page)
  const firstPageItems = order.order_items.slice(0, 5);
  const remainingItems = order.order_items.slice(5);
  const itemsPerPage = 12;
  const pages = [];
  for (let i = 0; i < remainingItems.length; i += itemsPerPage) {
    pages.push(remainingItems.slice(i, i + itemsPerPage));
  }

  const firstPageHTML = firstPageItems.map(item => `
    <tr>
      <td style="padding: 6px; border: 1px solid #ddd; font-size: 12px;">${item.points.name}</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 12px;">${item.period_years} ano(s)</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-family: monospace; font-size: 12px;">${Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
    </tr>
  `).join('');

  const subsequentPagesHTML = pages.map(page => `
    <div style="page-break-before: always;">
      <table style="width: 100%; border-collapse: collapse; margin-top: 0; font-size: 12px;">
        <thead>
          <tr class="bg-gray-100">
            <th style="padding: 6px; border: 1px solid #ddd; text-align: left; font-size: 12px;">Ponto de Instalação</th>
            <th style="padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 12px;">Período Contratado</th>
            <th style="padding: 6px; border: 1px solid #ddd; text-align: right; font-size: 12px;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${page.map(item => `
            <tr>
              <td style="padding: 6px; border: 1px solid #ddd; font-size: 12px;">${item.points.name}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 12px;">${item.period_years} ano(s)</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-family: monospace; font-size: 12px;">${Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Anexo de Contrato - Pedido ${order.id.substring(0, 8)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 12px; color: #333; font-size: 14px; line-height: 1.3; }
        .container { max-width: 800px; margin: 0 auto; }
        header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
        .logo-section { display: flex; align-items: center; gap: 10px; }
        .logo { height: 50px; }
        .title-section { text-align: right; }
        h1 { font-size: 22px; font-weight: bold; margin: 0; }
        h2 { font-size: 20px; font-weight: 600; margin: 0; }
        h3 { font-size: 16px; font-weight: 600; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th, td { padding: 6px; border: 1px solid #ddd; }
        th { background-color: #f5f5f5; text-align: left; font-size: 12px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }
        .font-bold { font-weight: bold; }
        .bg-gray-100 { background-color: #f5f5f5; }
        footer { margin-top: 25px; text-align: center; color: #666; font-size: 12px; }
        @media print { 
          @page {
            margin: 20mm;
            @top-left { content: none; }
            @top-right { content: none; }
            @bottom-left { content: none; }
            @bottom-right { content: none; }
          }
          body { margin: 0; }
          .page-break { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="logo-section">
            <img src="/logo.png" alt="SGMU Logo" class="logo" />
            <div>
              <h1>SGMU</h1>
              <p style="color: #666; font-size: 12px; margin: 0;">Sistema de Gestão de Mobiliário Urbano</p>
            </div>
          </div>
          <div class="title-section">
            <h2>Anexo de Contrato</h2>
            <p style="color: #666; font-size: 12px;">Pedido #${order.id.substring(0, 8)}</p>
          </div>
        </header>

        <main>
          <section style="margin-bottom: 20px;">
            <h3>Informações do Cliente</h3>
            <div class="info-grid">
              <p><strong>Nome:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email}</p>
              <p><strong>Telefone:</strong> ${order.customer_phone}</p>
              <p><strong>Data do Pedido:</strong> ${format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          </section>

          <section>
            <h3>Lista de Pontos Contratados</h3>
            <table>
              <thead>
                <tr class="bg-gray-100">
                  <th>Ponto de Instalação</th>
                  <th class="text-center">Período Contratado</th>
                  <th class="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${firstPageHTML}
              </tbody>
              <tfoot>
                <tr class="bg-gray-100 font-bold">
                  <td colspan="2" class="text-right">Total</td>
                  <td class="text-right font-mono">${Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              </tfoot>
            </table>
            ${subsequentPagesHTML}
          </section>
        </main>

        <footer>
          <p>Este documento é um anexo e parte integrante do contrato de prestação de serviços.</p>
          <p>Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </footer>
      </div>
    </body>
    </html>
  `;
}

export function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoints, setSelectedPoints] = useState(new Set());
  const [extendingOrder, setExtendingOrder] = useState(null);
  const [newReservedUntil, setNewReservedUntil] = useState('');
  const [kitType, setKitType] = useState({});

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
          points (id, name, latitude, longitude)
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

  const handleExtendReservation = async (orderId) => {
    if (!newReservedUntil) {
      toast.error("Selecione uma nova data de expiração.");
      return;
    }
    try {
      const { error } = await supabase
        .from('orders')
        .update({ reserved_until: new Date(newReservedUntil).toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      toast.success("Reserva prorrogada com sucesso!");
      fetchOrders();
      setExtendingOrder(null);
      setNewReservedUntil('');
    } catch (error) {
      toast.error("Erro ao prorrogar reserva", { description: error.message });
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      const { error } = await supabase.rpc('confirm_order_and_update_points', { p_order_id: orderId });
      if (error) throw error;
      toast.success("Pedido aprovado e pontos marcados como vendidos!");
      fetchOrders();
    } catch (error) {
      toast.error("Erro ao aprovar pedido", { description: error.message });
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const { error } = await supabase.rpc('cancel_order_and_release_points', { p_order_id: orderId });
      if (error) throw error;
      toast.success("Pedido cancelado e pontos liberados!");
      fetchOrders();
    } catch (error) {
      toast.error("Erro ao cancelar pedido", { description: error.message });
    }
  };

  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank');
    const printableHTML = generatePrintableHTML(order);
    printWindow.document.write(printableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSendToInstallation = async (orderId, selectedKitType) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ kit_type: selectedKitType, installation_sent: true })
        .eq('id', orderId);
      if (error) throw error;
      toast.success("Pedido enviado para instalação!");
      fetchOrders();
    } catch (error) {
      toast.error("Erro ao enviar para instalação", { description: error.message });
    }
  };

  const handlePointSelection = (pointId, checked) => {
    const newSelected = new Set(selectedPoints);
    if (checked) {
      newSelected.add(pointId);
    } else {
      newSelected.delete(pointId);
    }
    setSelectedPoints(newSelected);
  };

  const handleGenerateRoute = () => {
    const selectedPointsData = orders.flatMap(order =>
      order.order_items
        .filter(item => selectedPoints.has(item.points.id))
        .map(item => item.points)
    );
    const routeUrl = generateOptimizedRouteUrl(selectedPointsData);
    if (routeUrl) {
      window.open(routeUrl, '_blank');
    } else {
      toast.error("Selecione pelo menos um ponto para gerar a rota.");
    }
  };

  const handleSelectAllPoints = (orderId, checked) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const pointIds = order.order_items.map(item => item.points.id);
    const newSelected = new Set(selectedPoints);
    pointIds.forEach(id => {
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
    });
    setSelectedPoints(newSelected);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleGenerateRoute} disabled={selectedPoints.size === 0} className="flex-grow sm:flex-grow-0">
            <Map className="h-4 w-4 mr-2" /> Rota ({selectedPoints.size})
          </Button>
          <div className="relative flex-grow sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por cliente..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhum pedido encontrado.</p>
          ) : (
            orders.map((order) => {
              const statusProps = getOrderStatusProps(order.status);
              const allPointsSelected = order.order_items.every(item => selectedPoints.has(item.points.id));
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">Pedido #{order.id.substring(0, 8)}</CardTitle>
                        <CardDescription className="break-words">
                          Cliente: {order.customer_name} - {order.customer_email}
                        </CardDescription>
                        <CardDescription>
                          Criado em: {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center flex-wrap gap-2">
                        <Badge variant={statusProps.variant}>{statusProps.label}</Badge>
                        {order.reserved_until && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Expira: {format(new Date(order.reserved_until), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`select-all-${order.id}`}
                        checked={allPointsSelected}
                        onCheckedChange={(checked) => handleSelectAllPoints(order.id, checked)}
                      />
                      <Label htmlFor={`select-all-${order.id}`} className="font-semibold">Selecionar Todos os Pontos</Label>
                    </div>
                    <div className="grid gap-2">
                      {order.order_items.map(item => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 border rounded">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Checkbox
                              id={`point-${item.points.id}`}
                              checked={selectedPoints.has(item.points.id)}
                              onCheckedChange={(checked) => handlePointSelection(item.points.id, checked)}
                            />
                            <Label htmlFor={`point-${item.points.id}`} className="font-medium break-words">{item.points.name}</Label>
                            <span className="text-sm text-muted-foreground">({item.period_years} ano(s))</span>
                          </div>
                          <span className="font-mono text-right w-full sm:w-auto">{Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-right font-bold">
                      Total: {Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button variant="outline" onClick={() => setExtendingOrder(order.id)}>
                            <Calendar className="h-4 w-4 mr-2" /> Prorrogar Reserva
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button><CheckCircle className="h-4 w-4 mr-2" />Aprovar Compra</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Aprovar Compra?</AlertDialogTitle><AlertDialogDescription>Esta ação marcará o pedido como 'Concluído' e os pontos como 'Vendidos'. Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleApproveOrder(order.id)}>Aprovar</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive"><XCircle className="h-4 w-4 mr-2" />Excluir Reserva</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Excluir Reserva?</AlertDialogTitle><AlertDialogDescription>Esta ação cancelará o pedido e liberará os pontos. Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleCancelOrder(order.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      <Button variant="outline" onClick={() => handlePrintOrder(order)}>
                        <Printer className="h-4 w-4 mr-2" />Imprimir Pedido
                      </Button>
                      {!order.installation_sent && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Select value={kitType[order.id] || ''} onValueChange={(value) => setKitType(prev => ({ ...prev, [order.id]: value }))}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                              <SelectValue placeholder="Tipo de Kit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kit_completo">Kit Completo</SelectItem>
                              <SelectItem value="kit_placas">Kit Placas</SelectItem>
                              <SelectItem value="troca_propaganda">Troca de Propaganda</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" onClick={() => handleSendToInstallation(order.id, kitType[order.id])} disabled={!kitType[order.id]} className="w-full sm:w-auto">
                            <Truck className="h-4 w-4 mr-2" />Enviar para Instalação
                          </Button>
                        </div>
                      )}
                      {order.installation_sent && (
                        <Badge variant="secondary">Enviado para Instalação ({order.kit_type})</Badge>
                      )}
                    </div>
                    {extendingOrder === order.id && (
                      <div className="flex flex-col sm:flex-row items-center gap-2 p-2 border rounded">
                        <Label className="flex-shrink-0">Nova data de expiração:</Label>
                        <Input
                          type="datetime-local"
                          value={newReservedUntil}
                          onChange={(e) => setNewReservedUntil(e.target.value)}
                          className="flex-grow"
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button onClick={() => handleExtendReservation(order.id)} className="flex-1">Salvar</Button>
                          <Button variant="outline" onClick={() => setExtendingOrder(null)} className="flex-1">Cancelar</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}