import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';

export function Cart({ items, onRemove, onClear, onUpdatePeriod, onShowReservationForm, isExpanded, setIsExpanded }) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const totalItems = items.length;

  const handleShowReservationForm = () => {
    if (totalItems > 0) {
      onShowReservationForm();
    }
  };

  // Visão Recolhida para mobile
  if (!isExpanded && totalItems > 0) {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <Card 
          className="rounded-t-lg border-t border-gray-200 shadow-lg cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Ver Carrinho ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
              </CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <ChevronUp className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Visão Padrão (Desktop) ou Expandida (Mobile)
  // Oculta o componente se estiver no modo mobile e o carrinho estiver vazio e recolhido
  if (totalItems === 0 && !isExpanded) {
    // No desktop, ainda mostra o card vazio. No mobile, não mostra nada.
    return (
      <div className="hidden lg:flex lg:flex-col lg:flex-grow">
        <Card className="flex flex-col flex-grow h-full">
          <CardHeader>
            <CardTitle>Seu Carrinho</CardTitle>
            <CardDescription>Adicione pontos do mapa para reservá-los.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
            <p className="text-gray-500">Seu carrinho está vazio.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`
      ${isExpanded ? 'fixed inset-0 z-50 bg-white' : 'hidden'}
      lg:static lg:z-auto lg:bg-transparent lg:flex lg:flex-col lg:flex-grow
    `}>
      <Card className="flex flex-col h-full shadow-none lg:shadow-md border-0 lg:border">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Seu Carrinho</CardTitle>
            <button onClick={() => setIsExpanded(false)} className="lg:hidden p-2">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <CardDescription>
            {totalItems > 0 ? `Você tem ${totalItems} item(ns) no carrinho.` : 'Seu carrinho está vazio.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow p-4 overflow-y-auto">
          {totalItems > 0 ? (
            <ul className="space-y-4">
              {items.map((item, index) => (
                <li key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-grow">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-green-600 font-bold">
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
                  <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="text-gray-500 hover:text-red-500 ml-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center h-full">
               <p className="text-gray-500">Seu carrinho está vazio.</p>
            </div>
          )}
        </CardContent>

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
              <Button onClick={handleShowReservationForm} className="flex-1">
                Finalizar Reserva
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}