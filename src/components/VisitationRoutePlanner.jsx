import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MapPin, Check, ChevronDown, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';

// Função para calcular a distância Haversine entre duas coordenadas
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Raio da Terra em km

  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d;
};

export function VisitationRoutePlanner({ points }) {
  const [unvisitedPoints, setUnvisitedPoints] = useState([]);
  const [visitedPoints, setVisitedPoints] = useState([]);
  const [isRouteGenerated, setIsRouteGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateRoute = () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        const sortedPoints = [...points]
          .map(point => ({
            ...point,
            distance: haversineDistance(userLocation, point),
          }))
          .sort((a, b) => a.distance - b.distance);

        setUnvisitedPoints(sortedPoints);
        setVisitedPoints([]);
        setIsRouteGenerated(true);
        setIsLoading(false);
        toast.success('Rota de visitação gerada com base na sua localização!');
      },
      () => {
        toast.error('Não foi possível obter sua localização.', {
          description: 'Por favor, habilite a permissão de localização no seu navegador.',
        });
        setIsLoading(false);
      }
    );
  };

  const handleMarkAsVisited = (pointToVisit) => {
    setUnvisitedPoints(prev => prev.filter(p => p.uniqueId !== pointToVisit.uniqueId));
    setVisitedPoints(prev => [...prev, pointToVisit]);
  };

  const handleViewOnMap = (point) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`, '_blank');
  };

  if (!points || points.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planejador de Rota de Visitação</CardTitle>
      </CardHeader>
      <CardContent>
        {!isRouteGenerated ? (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              Crie uma rota otimizada para visitar seus pontos contratados, começando pelos mais próximos de você.
            </p>
            <Button onClick={handleGenerateRoute} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
              Gerar Rota de Visitação
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Próximos Pontos a Visitar</h3>
              {unvisitedPoints.length > 0 ? (
                <ul className="space-y-3">
                  {unvisitedPoints.slice(0, 5).map((point) => (
                    <li key={point.uniqueId} className="p-3 bg-muted/50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{point.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Aprox. {point.distance.toFixed(2)} km de distância
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewOnMap(point)}>
                          <MapPin className="h-4 w-4 mr-2" /> Ver no Mapa
                        </Button>
                        <Button size="sm" onClick={() => handleMarkAsVisited(point)}>
                          <Check className="h-4 w-4 mr-2" /> Marcar como Visitado
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-green-600 font-semibold p-4 bg-green-50 rounded-md">
                  Parabéns! Você visitou todos os seus pontos.
                </p>
              )}
            </div>

            {visitedPoints.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full">
                    Ver Pontos Visitados ({visitedPoints.length})
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-2 space-y-2">
                    {visitedPoints.map((point) => (
                      <li key={point.uniqueId} className="p-2 bg-muted/30 rounded-md flex items-center text-sm text-muted-foreground">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        {point.name}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}