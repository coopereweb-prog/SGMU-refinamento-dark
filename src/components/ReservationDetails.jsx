import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'paid', label: 'Paga' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'completed', label: 'Concluída' },
];

const getStatusVariant = (status) => {
  switch (status) {
    case 'pending': return 'secondary';
    case 'confirmed': return 'default';
    case 'paid': return 'success';
    case 'cancelled': return 'destructive';
    case 'completed': return 'outline';
    default: return 'secondary';
  }
};

export function ReservationDetails({ reservation, onSave, onCancel }) {
  const [currentStatus, setCurrentStatus] = useState(reservation.status);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(reservation.id, currentStatus);
    setIsSaving(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Nome:</strong> {reservation.profiles?.full_name || 'N/A'}</p>
          <p><strong>Email:</strong> {reservation.profiles?.email || 'N/A'}</p>
          <p><strong>Telefone:</strong> {reservation.profiles?.phone || 'N/A'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens da Reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {reservation.reservation_items.map(item => (
              <li key={item.id} className="flex justify-between border-b pb-2">
                <span>{item.points.name} ({item.period_years} ano(s))</span>
                <span className="font-medium">{Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </li>
            ))}
          </ul>
          <div className="text-right font-bold text-lg mt-4">
            Total: {Number(reservation.total_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status da Reserva</CardTitle>
          <CardDescription>Criada em: {formatDate(reservation.created_at)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">Status Atual:</span>
            <Badge variant={getStatusVariant(reservation.status)}>{reservation.status}</Badge>
          </div>
          <div>
            <label htmlFor="status-select" className="block text-sm font-medium mb-2">Alterar Status para:</label>
            <Select id="status-select" value={currentStatus} onValueChange={setCurrentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um novo status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSave} disabled={isSaving || currentStatus === reservation.status}>
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}