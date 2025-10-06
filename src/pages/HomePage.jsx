import { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { toast } from 'sonner';
import { Modal } from '../components/Modal.jsx';
import { PointDetails } from '../components/PointDetails.jsx';
import { Cart } from '../components/Cart.jsx';
import { InfoPanel } from '../components/InfoPanel.jsx';
import { TagFilter } from '../components/TagFilter.jsx';
import { getPoints } from '../lib/supabase.js';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { EnhancedReservationForm } from '../components/EnhancedReservationForm.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WhatsAppButton } from '../components/WhatsAppButton.jsx';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const center = {
  lat: -22.78,
  lng: -47.30
};

const initialZoom = 14;

const ICONS = {
  available: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  reserved: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  sold: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  inCart: '/shopping-cart-icon.svg', 
};

function HomePage() {
  const { profile, loading: userLoading } = useUser();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [map, setMap] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const loadPoints = async () => {
    const pointsData = await getPoints();
    const validPoints = pointsData.filter(p => 
      typeof p.latitude === 'number' && typeof p.longitude === 'number'
    );
    setPoints(validPoints);
  };

  useEffect(() => {
    setLoading(true);
    loadPoints().finally(() => setLoading(false));
  }, []);

  const filteredPoints = useMemo(() => {
    if (selectedTags.length === 0) {
      return points;
    }
    return points.filter(point =>
      point.tags && point.tags.some(tag => selectedTags.includes(tag.id))
    );
  }, [points, selectedTags]);

  useEffect(() => {
    if (!map || !isLoaded || points.length === 0) return;

    if (filteredPoints.length === 0) {
      map.setCenter(center);
      map.setZoom(initialZoom);
      return;
    }

    if (filteredPoints.length === 1) {
      map.setCenter({ lat: filteredPoints[0].latitude, lng: filteredPoints[0].longitude });
      map.setZoom(16);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    filteredPoints.forEach(point => {
      bounds.extend({ lat: point.latitude, lng: point.longitude });
    });
    map.fitBounds(bounds);

  }, [map, filteredPoints, points, isLoaded]);

  const cartPointIds = useMemo(() => new Set(cartItems.map(item => item.point_id)), [cartItems]);

  useEffect(() => {
    if (selectedPoint && cartPointIds.has(selectedPoint.id)) {
      setSelectedPoint(null);
    }
  }, [cartItems, selectedPoint, cartPointIds]);

  const handleMarkerClick = (point) => {
    if (cartPointIds.has(point.id)) {
      toast.info("Este ponto já está no seu carrinho.");
      return;
    }
    // Abre o modal para qualquer status, pois o componente PointDetails lida com a exibição
    setSelectedPoint(point);
  };

  const handleAddToCart = (point, periodYears) => {
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
    setSelectedPoint(null); // Fecha o modal
    toast.success(`${point.name} foi adicionado ao carrinho!`);
  };

  const handleUpdateCartItemPeriod = (itemIndex, newPeriod) => {
    setCartItems(prevCartItems => {
      const newCartItems = [...prevCartItems];
      const itemToUpdate = newCartItems[itemIndex];
      const point = itemToUpdate.point;

      let newPrice;
      switch (newPeriod) {
        case 1: newPrice = point.price_1y; break;
        case 2: newPrice = point.price_2y; break;
        case 3: newPrice = point.price_3y; break;
        case 4: newPrice = point.price_4y; break;
        case 5: newPrice = point.price_5y; break;
        default: newPrice = 0;
      }

      newCartItems[itemIndex] = {
        ...itemToUpdate,
        period_years: newPeriod,
        price: newPrice,
      };

      return newCartItems;
    });
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleReservationSuccess = () => {
    toast.success("Reserva criada com sucesso!", {
      description: "Em breve nossa equipe entrará em contato.",
    });
    
    setCartItems([]);
    loadPoints();
    setShowReservationForm(false);
  };

  return (
    <div className="flex flex-col flex-grow">
      <main className="flex-grow p-4 lg:p-6 flex flex-col lg:grid lg:grid-cols-[350px_1fr_350px] gap-6 h-full">
        
        <div className="space-y-6 order-2 lg:order-1 lg:overflow-y-auto">
          {loading ? <Skeleton className="h-48 w-full" /> : <InfoPanel points={points} />}
          <TagFilter onFilterChange={setSelectedTags} />
        </div>

        <div className="order-1 lg:order-2 flex flex-col h-96 lg:h-auto">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-gray-700">Mapa Interativo - Pontos de Instalação</h2>
            <p className="text-sm text-gray-500">Clique nos marcadores para ver detalhes e adicionar ao carrinho</p>
          </div>
          <div className="flex-grow rounded-lg shadow-md overflow-hidden">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={initialZoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {filteredPoints.map((point) => {
                  const isInCart = cartPointIds.has(point.id);
                  const iconUrl = isInCart ? ICONS.inCart : ICONS[point.status] || ICONS.available;

                  return (
                    <Marker
                      key={point.id}
                      position={{ lat: point.latitude, lng: point.longitude }}
                      onClick={() => handleMarkerClick(point)}
                      icon={{
                        url: iconUrl,
                        scaledSize: new window.google.maps.Size(32, 32),
                      }}
                    />
                  );
                })}
              </GoogleMap>
            ) : (
              <Skeleton className="w-full h-full" />
            )}
          </div>
        </div>

        <div className="order-3 lg:order-3 lg:overflow-y-auto">
          <Cart
            items={cartItems}
            onRemove={handleRemoveFromCart}
            onClear={handleClearCart}
            onUpdatePeriod={handleUpdateCartItemPeriod}
            onShowReservationForm={() => setShowReservationForm(true)}
          />
        </div>
      </main>

      {showReservationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Finalizar Reserva</CardTitle>
                <button 
                  onClick={() => setShowReservationForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <CardDescription>Preencha seus dados para confirmar a reserva</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedReservationForm
                cartItems={cartItems}
                onClose={() => setShowReservationForm(false)}
                onReservationSuccess={handleReservationSuccess}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {selectedPoint && (
        <Modal
          isOpen={!!selectedPoint}
          onClose={() => setSelectedPoint(null)}
          title={selectedPoint.name}
          description={selectedPoint.description}
          className="border-4 border-yellow-400 shadow-lg"
        >
          <PointDetails
            point={selectedPoint}
            onAddToCart={handleAddToCart}
          />
        </Modal>
      )}

      <WhatsAppButton />
    </div>
  );
}

export default HomePage;