import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Loader2, Navigation, RotateCcw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { generateOptimizedRouteUrl } from '@/lib/maps-utils';

export function RoutePlannerModal({ isOpen, onClose, points }) {
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input', 'confirm'
  const [startLocationInfo, setStartLocationInfo] = useState(null);

  // Reseta o estado interno quando o modal é fechado
  const handleClose = () => {
    setStep('input');
    setStartLocationInfo(null);
    setCep('');
    setIsLoading(false);
    onClose();
  };

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
          description: 'Não foi possível encontrar a localização para o CEP informado.',
        });
      }
      setIsLoading(false);
    });
  };

  const handleUseCurrentLocation = () => {
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
        const routeUrl = generateOptimizedRouteUrl(points, userLocation);
        if (routeUrl) {
          window.open(routeUrl, '_blank');
          toast.success('Rota gerada a partir da sua localização atual!');
          handleClose();
        }
        setIsLoading(false);
      },
      () => {
        toast.error('Não foi possível obter sua localização.', {
          description: 'Por favor, habilite a permissão de localização no seu navegador.',
        });
        setIsLoading(false);
      }
    );
  };

  const handleConfirmAndGenerate = () => {
    if (!startLocationInfo) return;
    const routeUrl = generateOptimizedRouteUrl(points, startLocationInfo.coords);
    if (routeUrl) {
      window.open(routeUrl, '_blank');
      toast.success('Rota gerada com sucesso!');
      handleClose();
    }
  };

  const renderContent = () => {
    if (step === 'confirm') {
      return (
        <div className="space-y-4">
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertTitle>Confirme o Endereço de Partida</AlertTitle>
            <AlertDescription>
              O endereço encontrado é: <br />
              <strong className="font-semibold">{startLocationInfo?.address}</strong>
            </AlertDescription>
          </Alert>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleConfirmAndGenerate} className="w-full sm:w-auto flex-1">
              <Navigation className="mr-2 h-4 w-4" /> Confirmar e Gerar Rota
            </Button>
            <Button variant="outline" onClick={() => setStep('input')} className="w-full sm:w-auto">
              Alterar CEP
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Insira um CEP ou use sua localização para definir o ponto de partida da rota.
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
            {isLoading && cep ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Buscar por CEP
          </Button>
        </div>
        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t"></div>
          <span className="flex-shrink mx-4 text-xs uppercase">OU</span>
          <div className="flex-grow border-t"></div>
        </div>
        <Button onClick={handleUseCurrentLocation} variant="outline" className="w-full" disabled={isLoading}>
          {isLoading && !cep ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
          Usar Minha Localização Atual
        </Button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Definir Ponto de Partida da Rota"
    >
      {renderContent()}
    </Modal>
  );
}