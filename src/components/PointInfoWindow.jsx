import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from './Modal';

export function PointInfoWindow({ point, onAddToCart, onClose, isOpen }) {
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  if (!point) return null;

  // Verifica se o ponto tem tier ou preços diretos
  const hasTier = point.tier && typeof point.tier === 'object';
  
  const priceOptions = [
    { years: 1, price: hasTier ? point.tier.price_1y : point.price_1y },
    { years: 2, price: hasTier ? point.tier.price_2y : point.price_2y },
    { years: 3, price: hasTier ? point.tier.price_3y : point.price_3y },
    { years: 4, price: hasTier ? point.tier.price_4y : point.price_4y },
    { years: 5, price: hasTier ? point.tier.price_5y : point.price_5y },
  ].filter(option => option.price != null && option.price > 0);

  const selectedPrice = priceOptions.find(p => p.years === selectedPeriod)?.price ?? 0;

  const handleAddToCartClick = () => {
    onAddToCart(point, selectedPeriod);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={point.name} 
      description={point.description}
    >
      <div className="space-y-4">
        {priceOptions.length > 0 ? (
          <>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Selecione o Período de Contrato:</h4>
              <Select value={String(selectedPeriod)} onValueChange={(value) => setSelectedPeriod(Number(value))}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {priceOptions.map(option => (
                    <SelectItem key={option.years} value={String(option.years)}>
                      {option.years} Ano(s) - {Number(option.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
               <div className="text-lg text-center sm:text-left">
                <span className="font-medium">Valor Total: </span>
                <span className="font-bold text-green-600">
                  {Number(selectedPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <Button onClick={handleAddToCartClick} className="w-full sm:w-auto" size="lg">
                Adicionar ao Carrinho
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">Este ponto não possui preços disponíveis no momento.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}