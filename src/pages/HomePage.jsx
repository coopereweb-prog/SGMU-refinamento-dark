import { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TagFilter } from '@/components/TagFilter';
import { Cart } from '@/components/Cart';
import { PointInfoWindow } from '@/components/PointInfoWindow';
import { InfoPanel } from '@/components/InfoPanel';
import { EnhancedReservationForm } from '@/components/EnhancedReservationForm';
import { Modal } from '@/components/Modal';
import { getStatusBadge } from '@/lib/utils';
import { getPoints } from '@/lib/supabase';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { MapPin, ShoppingCart, Menu, X, Loader2 } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const center = {
  lat: -22.78,
  lng: -47.30
};

export function HomePage() {
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // MOVER PARA CIMA - Definir cartPointIds antes de usá-lo
  const cartPointIds = useMemo(() => new Set(cartItems.map(item => item.point_id)), [cartItems]);

  const loadPoints = async () => {
    try {
      const pointsData = await getPoints();
      console.log('Pontos carregados:', pointsData); // Debug
      
      // Filtrar apenas pontos com coordenadas válidas - REMOVENDO filtro de status
      const validPoints = pointsData.filter(p => 
        typeof p.latitude === 'number' && 
        typeof p.longitude === 'number' &&
        p.latitude !== 0 && 
        p.longitude !== 0
        // REMOVIDO: p.is_available === true && p.status === 'available'
      );
      console.log('Pontos válidos:', validPoints); // Debug
      setPoints(validPoints);
    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
      toast.error('Erro ao carregar pontos', { description: error.message });
    }
  };

  useEffect(() => {
    loadPoints();
  }, []);

  const handleMarkerClick = useCallback((point) => {
    console.log('Marker clicked:', point); // Debug
    
    // Verificar o status do ponto
    if (point.status === 'sold') {
      toast.info('Este ponto já foi contratado.');
      setSelectedPoint(point); // Ainda mostrar informações
      return;
    }
    
    if (point.status === 'reserved') {
      toast.info('Este ponto está reservado temporariamente.');
      setSelectedPoint(point); // Ainda mostrar informações
      return;
    }
    
    // Verificação adicional para disponibilidade
    if (point.status !== 'available' || point.is_available !== true) {
      toast.error('Este ponto não está disponível para reserva.');
      return;
    }
    
    if (cartPointIds.has(point.id)) {
      toast.info('Este ponto já está no seu carrinho');
      return;
    }
    setSelectedPoint(point);
  }, [cartPointIds]); // Agora cartPointIds já existe

  const handleAddToCart = useCallback((point, periodYears) => {
    // Verificação rigorosa antes de adicionar ao carrinho
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

  // REMOVER DUPLICATA - cartPointIds já foi definido acima
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
    loadPoints(); // Recarregar pontos para atualizar status
  }, []);

  const totalCartItems = cartItems.length;

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando mapa...</p>
        </div>
      </div>
    );
  }

  const mapContent = (
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
        const status = getStatusBadge(point.status);
        
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
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Header para Mobile */}
      <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">SGMU - Placas Nova Odessa</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-80 h-full shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <TagFilter onFilterChange={setSelectedTags} />
              <InfoPanel points={filteredPoints} />
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="text-center">
            <img 
              src="/logo.png" 
              alt="SGMU Logo" 
              className="w-24 h-24 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800">SGMU</h1>
            <p className="text-sm text-gray-600">Sistema de Gestão de Mobiliário Urbano</p>
          </div>
          
          <TagFilter onFilterChange={setSelectedTags} />
          <InfoPanel points={filteredPoints} />
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {mapContent}
        
        {/* Cart Button - Mobile */}
        {isMobile && (
          <Button
            className="absolute bottom-4 right-4 z-10 shadow-lg"
            size="lg"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Carrinho ({totalCartItems})
          </Button>
        )}

        {/* Cart - Desktop */}
        {!isMobile && (
          <div className="absolute top-4 right-4 w-96 max-h-[80vh] overflow-hidden">
            <Cart
              items={cartItems}
              onRemove={handleRemoveFromCart}
              onClear={handleClearCart}
              onUpdatePeriod={handleUpdatePeriod}
              onShowReservationForm={() => setIsReservationModalOpen(true)}
            />
          </div>
        )}
      </div>

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

      {/* Mobile Cart Modal */}
      {isMobile && (
        <Modal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          title="Seu Carrinho"
          description={totalCartItems > 0 ? `Você tem ${totalCartItems} item(ns) no carrinho.` : 'Seu carrinho está vazio.'}
        >
          <Cart
            items={cartItems}
            onRemove={handleRemoveFromCart}
            onClear={handleClearCart}
            onUpdatePeriod={handleUpdatePeriod}
            onShowReservationForm={() => {
              setIsCartOpen(false);
              setIsReservationModalOpen(true);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default HomePage;