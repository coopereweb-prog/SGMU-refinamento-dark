import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, X, Info } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

export function Cart({ items, onRemove, onClear, onUpdatePeriod, onShowReservationForm }) {
  const { points } = useCart();

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const totalItems = items.length;

  const handleShowReservationForm = () => {
    if (totalItems > 0) {
      onShowReservationForm();
    }
  };

  const getPriceOptionsForItem = (item) => {
    const point = points.find(p => p.id === item.point_id);
    return point?.pricing_tiers?.tier_prices?.sort((a, b) => a.period_days - b.period_days) || [];
  };
  
  const getInfoLink = (mediaType) => {
    switch (mediaType) {
      case 'outdoor':
        return { to: '/outdoors', label: 'Condições do Outdoor' };
      case 'led_panel':
        return { to: '/led-panels', label: 'Condições do Painel de LED' };
      case 'static_panel':
      default:
        return { to: '/nossos-servicos', label: 'Condições do Painel Estático' };
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
            {items.map((item, index) => {
              const priceOptions = getPriceOptionsForItem(item);
              const infoLink = getInfoLink(item.media_type);
              
              return (
                <li key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-grow">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-status-available font-bold">
                      {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    
                    {/* Link de Informação */}
                    <Link to={infoLink.to} className="flex items-center text-xs text-blue-500 hover:underline mt-1">
                      <Info className="h-3 w-3 mr-1" /> {infoLink.label}
                    </Link>

                    {item.media_type !== 'led_panel' && priceOptions.length > 0 && (
                      <div className="mt-2">
                        <Select
                          value={String(item.details.days)}
                          onValueChange={(value) => onUpdatePeriod(index, Number(value))}
                        >
                          <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Período" />
                          </SelectTrigger>
                          <SelectContent>
                            {priceOptions.map(opt => (
                              <SelectItem key={opt.period_days} value={String(opt.period_days)}>
                                {opt.period_label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="text-muted-foreground hover:text-destructive ml-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
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