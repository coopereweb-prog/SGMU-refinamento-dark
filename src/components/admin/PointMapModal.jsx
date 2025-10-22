import { GoogleMap, Marker } from '@react-google-maps/api';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';
import { useGoogleMapsLoader } from '@/contexts/GoogleMapsLoaderContext';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

export function PointMapModal({ isOpen, onClose, point }) {
  const { isLoaded } = useGoogleMapsLoader();

  if (!point || !point.latitude || !point.longitude) return null;

  const center = {
    lat: point.latitude,
    lng: point.longitude,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Localização: ${point.name || 'Ponto Sem Nome'}`}
      description="Visualização do ponto no mapa para confirmação de localização."
      className="max-w-xl"
    >
      <div className="space-y-4">
        {!isLoaded ? (
          <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando mapa...</span>
          </div>
        ) : (
          <div className="relative w-full h-[400px]">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={18} // Zoom alto para ver o ponto claramente
              options={{ disableDefaultUI: true, zoomControl: true }}
            >
              <Marker 
                position={center} 
                icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
              />
            </GoogleMap>
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={onClose}>
            <MapPin className="h-4 w-4 mr-2" /> Fechar Visualização
          </Button>
        </div>
      </div>
    </Modal>
  );
}