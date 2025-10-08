import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

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
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total de Pontos</span>
          <Badge variant="secondary">{stats.total}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Disponíveis</span>
          <Badge className="bg-green-100 text-green-800">{stats.available}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Reservados</span>
          <Badge className="bg-yellow-100 text-yellow-800">{stats.reserved}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Contratados</span>
          <Badge variant="destructive">{stats.sold}</Badge>
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">Taxa de Ocupação</span>
            <Badge variant={stats.occupationRate > 80 ? "destructive" : "default"}>
              {stats.occupationRate}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}