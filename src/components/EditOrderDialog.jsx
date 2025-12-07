import { useState, useMemo, useEffect, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { modifyOrder } from '../lib/supabase';

export function EditOrderDialog({ order, isOpen, onClose, onSave }) {
  // Inicializa o estado com os IDs de todos os itens do pedido
  const [itemsToKeep, setItemsToKeep] = useState(order?.order_items.map(item => item.id) || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const descId = useId();

  // Reseta o estado quando o pedido muda (ao abrir o diálogo para um novo pedido)
  useEffect(() => {
    if (order) {
      setItemsToKeep(order.order_items.map(item => item.id));
    }
  }, [order]);

  // Função para adicionar/remover um item da lista de itens a serem mantidos
  const handleToggleItem = (itemId) => {
    setItemsToKeep(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Calcula o novo total em tempo real com base nos itens selecionados
  const newTotal = useMemo(() => {
    if (!order) return 0;
    return order.order_items
      .filter(item => itemsToKeep.includes(item.id))
      .reduce((sum, item) => sum + parseFloat(item.price), 0);
  }, [itemsToKeep, order]);

  const handleSaveChanges = async () => {
    if (itemsToKeep.length === 0) {
      setError('Você não pode remover todos os itens. Se desejar, cancele o pedido inteiro.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await modifyOrder(order.id, itemsToKeep);
      onSave(); // Chama a função onSave passada como prop, que irá fechar o modal e recarregar os dados
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao salvar as alterações.');
      console.error('Erro ao modificar pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]" ariaDescribedBy={descId}>
        <DialogHeader>
          <DialogTitle>Editar Pedido #{order.id.substring(0, 8)}</DialogTitle>
          <DialogDescription id={descId}>
            Selecione os pontos que devem permanecer no pedido. Os itens desmarcados serão removidos e os pontos voltarão a ficar disponíveis.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            {order.order_items.map(item => (
              <div key={item.id} className="flex items-center space-x-3 p-2 rounded-md border">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={itemsToKeep.includes(item.id)}
                  onCheckedChange={() => handleToggleItem(item.id)}
                />
                <Label htmlFor={`item-${item.id}`} className="flex-1 cursor-pointer min-w-0">
                  <div className="flex justify-between items-center gap-4">
                    <span className="truncate" title={item.points.name}>{item.points.name}</span>
                    <span className="font-mono flex-shrink-0">R$ {parseFloat(item.price).toFixed(2)}</span>
                  </div>
                </Label>
              </div>
            ))}
          </div>
          <div className="text-right font-bold text-lg">
            Novo Total: R$ {newTotal.toFixed(2)}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSaveChanges} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}