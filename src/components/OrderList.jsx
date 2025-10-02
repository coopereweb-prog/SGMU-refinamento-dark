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

const statusVariant = {
  pending: "yellow",
  active: "green",
  completed: "blue",
  cancelled: "red",
  default: "gray"
};

export function OrderList({ orders }) {
  if (!orders || orders.length === 0) {
    return <p className="text-center text-gray-500 py-4">Nenhum pedido encontrado.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ponto</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.points?.name || 'N/A'}</TableCell>
            <TableCell>{order.users?.user_metadata?.full_name || order.users?.email || 'N/A'}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[order.status] || statusVariant.default}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {format(new Date(order.created_at), 'dd/MM/yyyy')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}