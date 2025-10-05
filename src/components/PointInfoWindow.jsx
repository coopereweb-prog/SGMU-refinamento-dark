import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export function PointInfoWindow({ point, onAddToCart, onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  const priceOptions = [
    { years: 1, price: point.price_1y },
    { years: 2, price: point.price_2y },
    { years: 3, price: point.price_3y },
    { years: 4, price: point.price_4y },
    { years: 5, price: point.price_5y },
  ].filter(option => option.price != null);

  const selectedPrice = priceOptions.find(p => p.years === selectedPeriod)?.price ?? 0;

  const handleAddToCartClick = () => {
    onAddToCart(point, selectedPeriod);
    onClose();
  };

  // O div externo agora é transparente, mas ainda captura cliques para fechar.
  return (
    <div 
      className="fixed inset-0 z-40 flex items-end justify-center p-4"
      onClick={onClose} // Fecha ao clicar no "fundo" transparente
    >
      <Card 
        className="relative w-full max-w-4xl flex flex-col animate-in slide-in-from-bottom-10 duration-300"
        onClick={(e) => e.stopPropagation()} // Impede que o clique no card feche o modal
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          <X className="h-5 w-5" />
        </Button>

        <CardHeader className="pb-4 pr-12">
          <div>
            <CardTitle>{point.name}</CardTitle>
            <CardDescription>{point.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Selecione o Período de Contrato:</h4>
              <Select value={String(selectedPeriod)} onValueChange={(value) => setSelectedPeriod(Number(value))}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {priceOptions.map(option => (
                    <SelectItem key={option.years} value={String(option.years)}>
                      {option.years} Ano(s) - {option.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
               <div className="text-lg text-center sm:text-left">
                <span className="font-medium">Valor Total: </span>
                <span className="font-bold text-green-600">
                  {selectedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <Button onClick={handleAddToCartClick} className="w-full sm:w-auto" size="lg">
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}