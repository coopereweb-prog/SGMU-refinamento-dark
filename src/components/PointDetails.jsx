import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PointDetails({ point, onAddToCart }) {
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  if (!point) return null;

  const priceOptions = [
    { years: 1, price: point.price_1y },
    { years: 2, price: point.price_2y },
    { years: 3, price: point.price_3y },
    { years: 4, price: point.price_4y },
    { years: 5, price: point.price_5y },
  ].filter(option => option.price != null && option.price > 0);

  const selectedPrice = priceOptions.find(p => p.years === selectedPeriod)?.price ?? 0;

  const handleAddToCartClick = () => {
    onAddToCart(point, selectedPeriod);
  };

  const renderContentByStatus = () => {
    switch (point.status) {
      case 'sold':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-700">Ponto Contratado</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Contratante:</strong> {point.company_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm"><strong>Período:</strong> {point.sold_until ? `Até ${new Date(point.sold_until).toLocaleDateString('pt-BR')}` : 'N/A'}</span>
              </div>
              {point.installation_photo_url && (
                <div>
                  <p className="text-sm font-medium mb-2">Foto da Instalação:</p>
                  <img src={point.installation_photo_url} alt="Instalação" className="w-full h-48 object-cover rounded-lg"/>
                </div>
              )}
            </div>
          </div>
        );
      case 'reserved':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-700">Ponto Reservado</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Reservado até:</strong> {point.reserved_until ? new Date(point.reserved_until).toLocaleString('pt-BR') : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-600">Este ponto está temporariamente reservado.</p>
            </div>
          </div>
        );
      case 'available':
      default:
        return (
          <div className="space-y-4">
            {priceOptions.length > 0 ? (
              <>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Selecione o Período:</h4>
                  <Select value={String(selectedPeriod)} onValueChange={(value) => setSelectedPeriod(Number(value))}>
                    <SelectTrigger className="w-full">
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
                    <span className="font-medium">Valor: </span>
                    <span className="font-bold text-green-600">
                      {Number(selectedPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <Button onClick={handleAddToCartClick} className="w-full sm:w-auto">
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Sem preços disponíveis.</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="p-1 space-y-4">
      {point.tags && point.tags.length > 0 && (
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-2 text-sm">Características:</h4>
          <div className="flex flex-wrap gap-2">
            {point.tags.map(tag => (
              <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
            ))}
          </div>
        </div>
      )}
      {renderContentByStatus()}
    </div>
  );
}