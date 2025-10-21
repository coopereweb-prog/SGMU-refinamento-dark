import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, AlertCircle, Tv, Wind } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PointDetails({ point, onAddToCart }) {
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  if (!point) return null;

  const priceOptions = point.pricing_tiers?.tier_prices
    ?.sort((a, b) => a.period_days - b.period_days)
    .map(p => ({
      label: p.period_label,
      price: p.price,
      days: p.period_days,
    })) || [];

  // Define o período padrão se ainda não estiver definido
  if (selectedPeriod === null && priceOptions.length > 0) {
    setSelectedPeriod(priceOptions[0].days);
  }

  const selectedPrice = priceOptions.find(p => p.days === selectedPeriod)?.price ?? 0;

  const handleAddToCartClick = () => {
    if (point.media_type === 'static_panel' || point.media_type === 'outdoor') {
      if (selectedPeriod) {
        onAddToCart(point, { type: 'period', days: selectedPeriod, price: selectedPrice });
      }
    }
    // Lógica para LED pode ser adicionada aqui
  };

  const renderMediaTypeInfo = () => {
    let Icon, text;
    switch (point.media_type) {
      case 'outdoor':
        Icon = Wind;
        text = 'Outdoor';
        break;
      case 'led_panel':
        Icon = Tv;
        text = 'Painel de LED';
        break;
      case 'static_panel':
      default:
        return null;
    }
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>Tipo de Mídia: {text}</span>
      </div>
    );
  };

  const renderPurchaseControls = () => {
    switch (point.media_type) {
      case 'led_panel':
        return (
          <div className="text-center py-4 bg-muted rounded-lg">
            <p className="font-semibold">Painel de LED</p>
            <p className="text-sm text-muted-foreground">A compra de cotas para este produto é feita sob consulta.</p>
            <Button className="mt-3" onClick={() => window.open('https://wa.me/' + import.meta.env.VITE_WHATSAPP_NUMBER, '_blank')}>
              Consultar via WhatsApp
            </Button>
          </div>
        );
      case 'static_panel':
      case 'outdoor':
      default:
        return (
          <>
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
                        <SelectItem key={option.days} value={String(option.days)}>
                          {option.label} - {Number(option.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                  <Button variant="default" onClick={handleAddToCartClick} className="w-full sm:w-auto">
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Sem preços disponíveis.</p>
              </div>
            )}
          </>
        );
    }
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
            {renderPurchaseControls()}
          </div>
        );
    }
  };

  return (
    <div className="p-1 space-y-4">
      {renderMediaTypeInfo()}
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