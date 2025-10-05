import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Users, ShoppingCart } from 'lucide-react';

export function InfoPanel({ points }) {
  const stats = useMemo(() => {
    const available = points.filter(p => p.status === 'available' && p.is_available).length;
    const reserved = points.filter(p => p.status === 'reserved').length;
    const sold = points.filter(p => p.status === 'sold').length;
    const total = points.length;

    return {
      total,
      available,
      reserved,
      sold,
      occupationRate: total > 0 ? ((reserved + sold) / total * 100).toFixed(1) : 0
    };
  }, [points]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Estatísticas dos Pontos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <div className="text-xs text-gray-600">Disponíveis</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
              <div className="text-xs text-gray-600">Reservados</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.sold}</div>
              <div className="text-xs text-gray-600">Vendidos</div>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa de Ocupação</span>
              <Badge variant={stats.occupationRate > 80 ? "destructive" : stats.occupationRate > 50 ? "default" : "secondary"}>
                {stats.occupationRate}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Status Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Disponíveis
              </span>
              <span className="font-medium">{stats.available}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                Reservados
              </span>
              <span className="font-medium">{stats.reserved}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Vendidos
              </span>
              <span className="font-medium">{stats.sold}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}