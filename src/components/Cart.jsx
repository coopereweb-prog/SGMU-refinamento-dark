import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag } from 'lucide-react';
import { EnhancedReservationForm } from './EnhancedReservationForm.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Cart({ items, onRemove, onClear, onUpdatePeriod, onReservationSuccess, onShowReservationForm }) {
  const [showReservationForm, setShowReservationForm] = useState(false);

  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleReservationSuccess = () => {
    // Chama a função passada da HomePage para atualizar o mapa e limpar o carrinho
    if (onReservationSuccess) {
      onReservationSuccess();
    }
    setShowReservationForm(false);
  };

  if (showReservationForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Finalizar Reserva</CardTitle>
            <CardDescription>Preencha seus dados para confirmar a reserva</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedReservationForm
              cartItems={items}
              onClose={() => setShowReservationForm(false)}
              onReservationSuccess={handleReservationSuccess}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Carrinho de Reservas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8 flex flex-col items-center justify-center h-full">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-2">
                      <h3 className="font-medium text-sm mb-2">{item.name}</h3>
                      <Select
                        value={String(item.period_years)}
                        onValueChange={(value) => onUpdatePeriod(index, parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(years => {
                            const price = item.point[`price_${years}y`];
                            const isAvailable = typeof price === 'number' && price > 0;
                            return (
                              <SelectItem key={years} value={String(years)} disabled={!isAvailable}>
                                {isAvailable
                                  ? `${years} ano(s) - R$ ${price.toFixed(2)}`
                                  : `${years} ano(s) - (Indisponível)`
                                }
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(index)}
                      className="text-red-500 hover:text-red-700 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {items.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold">R$ {total.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <Button className="w-full" onClick={onShowReservationForm || (() => setShowReservationForm(true))}>
              Finalizar Reserva
            </Button>
            <Button variant="outline" className="w-full" onClick={onClear}>
              Limpar Carrinho
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}