import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusMap = {
  pending: { label: 'Pendente', variant: 'yellow' },
  completed: { label: 'Concluído', variant: 'green' },
  cancelled: { label: 'Cancelado', variant: 'red' },
};

export function OrderList({ orders }) {
  if (!orders || orders.length === 0) {
    return <p className="text-center text-gray-500 py-4">Nenhum pedido encontrado.</p>;
  }

  const getOrderDetails = (order) => {
    const customerName = order.profiles?.name || order.customer_name || 'Convidado';
    const pointNames = order.order_items.map(item => item.points?.name).filter(Boolean).join(', ');
    return { customerName, pointNames };
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Pontos</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const { customerName, pointNames } = getOrderDetails(order);
          const statusInfo = statusMap[order.status] || { label: order.status, variant: 'gray' };
          
          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{customerName}</TableCell>
              <TableCell className="text-sm text-gray-600">{pointNames || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}