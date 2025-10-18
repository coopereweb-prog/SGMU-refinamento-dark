import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Check, ChevronDown, Loader2, Navigation, RotateCcw, Search } from 'lucide-react';
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
  const [cep, setCep] = useState('');
  const [unvisitedPoints, setUnvisitedPoints] = useState([]);
  const [visitedPoints, setVisitedPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input', 'confirm', 'generated'
  const [startLocationInfo, setStartLocationInfo] = useState(null);

  const handleCepSearch = () => {
    if (!cep.replace(/\D/g, '')) {
      toast.warning('Por favor, insira um CEP de partida.');
      return;
    }
    setIsLoading(true);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: `${cep}, Brasil` }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const address = results[0].formatted_address;
        setStartLocationInfo({
          address: address,
          coords: {
            latitude: location.lat(),
            longitude: location.lng(),
          }
        });
        setStep('confirm');
      } else {
        toast.error('CEP não encontrado.', {
          description: 'Não foi possível encontrar a localização para o CEP informado. Verifique e tente novamente.',
        });
      }
      setIsLoading(false);
    });
  };

  const handleConfirmAndGenerate = () => {
    if (!startLocationInfo) return;

    const sortedPoints = [...points]
      .map(point => ({
        ...point,
        distance: haversineDistance(startLocationInfo.coords, point),
      }))
      .sort((a, b) => a.distance - b.distance);

    setUnvisitedPoints(sortedPoints);
    setVisitedPoints([]);
    setStep('generated');
    toast.success('Rota de visitação gerada!');
  };

  const handleReset = () => {
    setStep('input');
    setStartLocationInfo(null);
    setUnvisitedPoints([]);
    setVisitedPoints([]);
    setCep('');
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

  const renderContent = () => {
    switch (step) {
      case 'input':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Insira um CEP de partida para criar uma rota otimizada e visitar seus pontos contratados.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow">
                <Label htmlFor="cep-start" className="sr-only">CEP de Partida</Label>
                <Input
                  id="cep-start"
                  placeholder="Digite o CEP de partida"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleCepSearch} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Buscar Endereço
              </Button>
            </div>
          </div>
        );
      case 'confirm':
        return (
          <div className="space-y-4">
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertTitle>Confirme o Endereço de Partida</AlertTitle>
              <AlertDescription>
                O endereço encontrado para o CEP informado é: <br />
                <strong className="font-semibold">{startLocationInfo?.address}</strong>
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleConfirmAndGenerate} className="w-full sm:w-auto flex-1">
                <Navigation className="mr-2 h-4 w-4" /> Confirmar e Gerar Rota
              </Button>
              <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                Alterar CEP
              </Button>
            </div>
          </div>
        );
      case 'generated':
        return (
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
                  <Button variant="ghost" className="w-full text-muted-foreground">
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
            <div className="pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" /> Gerar Nova Rota
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planejador de Rota de Visitação</CardTitle>
        {step === 'generated' && (
          <CardDescription>
            Esta é a ordem de visitação mais eficiente a partir do local informado.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}