import { useState, useEffect } from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, Clock } from 'lucide-react';
import { getStatusBadge } from '../lib/utils.js';

export function PointInfoWindow({ point, onAddToCart, onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // Efeito para definir o período padrão como a primeira opção disponível
  useEffect(() => {
    const periodOptions = [
      { value: "1", price: point.price_1y },
      { value: "2", price: point.price_2y },
      { value: "3", price: point.price_3y },
      { value: "4", price: point.price_4y },
      { value: "5", price: point.price_5y },
    ];
    const firstAvailable = periodOptions.find(opt => typeof opt.price === 'number' && opt.price > 0);
    if (firstAvailable) {
      setSelectedPeriod(firstAvailable.value);
    }
  }, [point]);

  const handleAddToCartClick = () => {
    if (selectedPeriod) {
      onAddToCart(point, parseInt(selectedPeriod));
    }
  };

  const handleStreetViewClick = () => {
    const streetViewUrl = `http://maps.google.com/maps?q=&layer=c&cbll=${point.latitude},${point.longitude}`;
    window.open(streetViewUrl, '_blank');
  };

  const statusInfo = getStatusBadge(point.status);

  const periodOptions = [
    { value: "1", label: "1 Ano", price: point.price_1y },
    { value: "2", label: "2 Anos", price: point.price_2y },
    { value: "3", label: "3 Anos", price: point.price_3y },
    { value: "4", label: "4 Anos", price: point.price_4y },
    { value: "5", label: "5 Anos", price: point.price_5y },
  ];

  return (
    <InfoWindow position={{ lat: point.latitude, lng: point.longitude }} onCloseClick={onClose}>
      <div className="p-2 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">{point.name}</h3>
          <Badge className={`${statusInfo.className} text-white`}>{statusInfo.label}</Badge>
        </div>
        <div className="space-y-2 mb-4">
          <p className="text-sm"><strong>Descrição:</strong> {point.description}</p>
        </div>

        {point.status === 'available' && (
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Período de Veiculação:</Label>
              <RadioGroup value={selectedPeriod} onValueChange={setSelectedPeriod} className="mt-2 space-y-1">
                {periodOptions.map(option => {
                  const isAvailable = typeof option.price === 'number' && option.price > 0;
                  return (
                    <div key={option.value} className={`flex items-center space-x-2 ${!isAvailable ? 'opacity-50' : ''}`}>
                      <RadioGroupItem value={option.value} id={`p${point.id}-${option.value}y`} disabled={!isAvailable} />
                      <Label htmlFor={`p${point.id}-${option.value}y`} className={!isAvailable ? 'cursor-not-allowed' : 'cursor-pointer'}>
                        {isAvailable
                          ? `${option.label} - R$ ${option.price.toFixed(2)}`
                          : `${option.label} - (Indisponível)`
                        }
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Button onClick={handleAddToCartClick} className="w-full bg-green-600 hover:bg-green-700" disabled={!selectedPeriod}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={handleStreetViewClick}>
                <Eye className="h-4 w-4 mr-2" />Ver Street View
              </Button>
            </div>
          </div>
        )}
        {point.status === 'reserved' && (<div className="text-center"><p className="text-sm text-yellow-600 mb-2"><Clock className="h-4 w-4 inline mr-1" />Reservado</p></div>)}
        {point.status === 'sold' && (<div className="text-center"><p className="text-sm text-red-600 mb-2">Contratado até: {point.sold_until ? new Date(point.sold_until).toLocaleDateString('pt-BR') : 'Indisponível'}</p></div>)}
      </div>
    </InfoWindow>
  );
}