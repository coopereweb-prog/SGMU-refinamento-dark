import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PointList({ points, onPointSelect, onAddToCart, cartItems }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pontos Disponíveis</h2>
      {points.length > 0 ? (
        points.map(point => {
          const isInCart = cartItems.some(item => item.point_id === point.id);
          return (
            <Card key={point.id} onMouseEnter={() => onPointSelect(point)} onMouseLeave={() => onPointSelect(null)}>
              <CardHeader>
                <CardTitle>{point.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{point.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {point.tags && point.tags.map(tag => (
                    <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-lg font-bold">R$ {(point.price || 0).toFixed(2)} / ano</span>
                <Button onClick={() => onAddToCart(point, 1)} disabled={isInCart}>
                  {isInCart ? 'No Carrinho' : 'Adicionar'}
                </Button>
              </CardFooter>
            </Card>
          );
        })
      ) : (
        <p>Nenhum ponto encontrado com os filtros selecionados.</p>
      )}
    </div>
  );
}