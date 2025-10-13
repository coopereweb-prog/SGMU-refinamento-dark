import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, X } from 'lucide-react';

export function Cart({ items, onRemove, onClear, onUpdatePeriod, onShowReservationForm }) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const totalItems = items.length;

  const handleShowReservationForm = () => {
    if (totalItems > 0) {
      onShowReservationForm();
    }
  };

  return (
    <div className="flex flex-col flex-grow h-full bg-background">
      <div className="p-4">
        <h3 className="text-lg font-semibold">Seu Carrinho</h3>
        <p className="text-sm text-muted-foreground">
          {totalItems > 0 ? `Você tem ${totalItems} item(ns) no carrinho.` : 'Adicione pontos do mapa para reservá-los.'}
        </p>
      </div>

      <div className="flex-grow p-4 pt-0 overflow-y-auto">
        {totalItems > 0 ? (
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-grow">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-status-available font-bold">
                    {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <div className="mt-2">
                    <Select
                      value={String(item.period_years)}
                      onValueChange={(value) => onUpdatePeriod(index, Number(value))}
                    >
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Ano</SelectItem>
                        <SelectItem value="2">2 Anos</SelectItem>
                        <SelectItem value="3">3 Anos</SelectItem>
                        <SelectItem value="4">4 Anos</SelectItem>
                        <SelectItem value="5">5 Anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="text-muted-foreground hover:text-destructive ml-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center h-full">
             <p className="text-muted-foreground">Seu carrinho está vazio.</p>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="p-4 border-t mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold">
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onClear} className="flex-1">
              <X className="mr-2 h-4 w-4" /> Limpar Carrinho
            </Button>
            <Button variant="default" onClick={handleShowReservationForm} className="flex-1">
              Finalizar Reserva
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}