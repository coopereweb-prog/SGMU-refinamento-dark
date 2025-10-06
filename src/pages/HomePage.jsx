import { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { TagFilter } from '@/components/TagFilter';
import { Cart } from '@/components/Cart';
import { PointInfoWindow } from '@/components/PointInfoWindow';
import { InfoPanel } from '@/components/InfoPanel';
import { EnhancedReservationForm } from '@/components/EnhancedReservationForm';
import { Modal } from '@/components/Modal';
import { getPoints } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: -22.78,
  lng: -47.30
};

function HomePage() {
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const cartPointIds = useMemo(() => new Set(cartItems.map(item => item.point_id)), [cartItems]);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const pointsData = await getPoints();
      const validPoints = pointsData.filter(p => 
        typeof p.latitude === 'number' && 
        typeof p.longitude === 'number' &&
        p.latitude !== 0 && 
        p.longitude !== 0
      );
      setPoints(validPoints);
    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
      toast.error('Erro ao carregar pontos', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, []);

  const handleMarkerClick = useCallback((point) => {
    if (point.status === 'sold') {
      toast.info('Este ponto já foi contratado.');
      setSelectedPoint(point);
      return;
    }
    if (point.status === 'reserved') {
      toast.info('Este ponto está reservado temporariamente.');
      setSelectedPoint(point);
      return;
    }
    if (point.status !== 'available' || point.is_available !== true) {
      toast.error('Este ponto não está disponível para reserva.');
      return;
    }
    if (cartPointIds.has(point.id)) {
      toast.info('Este ponto já está no seu carrinho');
      return;
    }
    setSelectedPoint(point);
  }, [cartPointIds]);

  const handleAddToCart = useCallback((point, periodYears) => {
    if (point.status !== 'available' || point.is_available !== true) {
      toast.error('Este ponto não está mais disponível para reserva.');
      return;
    }
    
    let price;
    switch (periodYears) {
      case 1: price = point.price_1y; break;
      case 2: price = point.price_2y; break;
      case 3: price = point.price_3y; break;
      case 4: price = point.price_4y; break;
      case 5: price = point.price_5y; break;
      default: price = 0;
    }

    const cartItem = {
      point: point,
      point_id: point.id,
      name: point.name,
      period_years: periodYears,
      price: price
    };
    
    setCartItems(prev => [...prev, cartItem]);
    toast.success('Ponto adicionado ao carrinho!');
  }, []);

  const handleRemoveFromCart = useCallback((index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const handleUpdatePeriod = useCallback((index, newPeriod) => {
    setCartItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      let price;
      switch (newPeriod) {
        case 1: price = item.point.price_1y; break;
        case 2: price = item.point.price_2y; break;
        case 3: price = item.point.price_3y; break;
        case 4: price = item.point.price_4y; break;
        case 5: price = item.point.price_5y; break;
        default: price = 0;
      }
      updated[index] = { ...item, period_years: newPeriod, price };
      return updated;
    });
  }, []);

  const filteredPoints = useMemo(() => {
    if (selectedTags.length === 0) return points;
    
    return points.filter(point => {
      if (!point.tags || point.tags.length === 0) return false;
      const pointTagIds = point.tags.map(tag => tag.id);
      return selectedTags.some(tagId => pointTagIds.includes(tagId));
    });
  }, [points, selectedTags]);

  const handleReservationSuccess = useCallback(() => {
    setIsReservationModalOpen(false);
    setSelectedPoint(null);
    setCartItems([]);
    loadPoints();
  }, []);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando mapa e pontos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-96 bg-white shadow-lg p-6 space-y-6 overflow-y-auto">
        <div className="text-center">
          <img 
            className="h-24 w-auto mx-auto transition-all duration-200 ease-in-out" 
            src="/logo.png" 
            alt="SGMU Logo" 
          />
          <h1 className="text-2xl font-bold text-gray-800 mt-4">SGMU</h1>
          <p className="text-sm text-gray-600">Sistema de Gestão de Mobiliário Urbano</p>
        </div>
        <TagFilter onFilterChange={setSelectedTags} />
        <InfoPanel points={filteredPoints} />
      </aside>

      {/* Main Content (Map) */}
      <main className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            gestureHandling: 'cooperative',
          }}
        >
          {filteredPoints.map(point => {
            const isInCart = cartPointIds.has(point.id);
            
            let iconUrl = '/marker-available.png';
            if (point.status === 'sold') {
              iconUrl = '/marker-sold.png';
            } else if (point.status === 'reserved') {
              iconUrl = '/marker-reserved.png';
            } else if (isInCart) {
              iconUrl = '/marker-in-cart.png';
            }

            return (
              <Marker
                key={point.id}
                position={{ lat: point.latitude, lng: point.longitude }}
                icon={{
                  url: iconUrl,
                  scaledSize: new window.google.maps.Size(40, 40),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(20, 40),
                }}
                onClick={() => handleMarkerClick(point)}
              />
            );
          })}
        </GoogleMap>

        {/* Cart Overlay */}
        <div className="absolute top-4 right-4 w-96 max-h-[calc(100vh-2rem)]">
          <Cart
            items={cartItems}
            onRemove={handleRemoveFromCart}
            onClear={handleClearCart}
            onUpdatePeriod={handleUpdatePeriod}
            onShowReservationForm={() => setIsReservationModalOpen(true)}
          />
        </div>
      </main>

      {/* Modals */}
      <PointInfoWindow
        point={selectedPoint}
        onAddToCart={handleAddToCart}
        onClose={() => setSelectedPoint(null)}
        isOpen={!!selectedPoint}
      />

      <Modal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        title="Finalizar Reserva"
        description="Preencha seus dados para confirmar a reserva dos pontos selecionados."
      >
        <EnhancedReservationForm
          cartItems={cartItems}
          onClose={() => setIsReservationModalOpen(false)}
          onReservationSuccess={handleReservationSuccess}
        />
      </Modal>
    </div>
  );
}

export default HomePage;