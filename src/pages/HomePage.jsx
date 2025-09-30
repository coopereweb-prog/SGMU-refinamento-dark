import { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { toast } from 'sonner';
import Header from '../components/Header.jsx';
import { PointInfoWindow } from '../components/PointInfoWindow.jsx';
import { Cart } from '../components/Cart.jsx';
import { InfoPanel } from '../components/InfoPanel.jsx';
import { TagFilter } from '../components/TagFilter.jsx';
import { getPoints } from '../lib/supabase.js';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { EnhancedReservationForm } from '../components/EnhancedReservationForm.jsx';

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
      return;
    }
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
    // Show notification
    if (typeof window.showOrderCreatedNotification === 'function') {
      // In a real implementation, we would pass the actual order ID
      window.showOrderCreatedNotification('ORDER_ID');
    }
    
    setCartItems([]);
    loadPoints(); // Recarrega os pontos para atualizar o mapa
    setShowReservationForm(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <main className="flex-grow p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-[350px_1fr_350px] gap-6">
        <div className="space-y-6">
          {loading ? <Skeleton className="h-48 w-full" /> : <InfoPanel points={points} />}
          <TagFilter onFilterChange={setSelectedTags} />
        </div>

        <div className="flex flex-col h-full">
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
                
                {selectedPoint && (
                  <PointInfoWindow
                    point={selectedPoint}
                    onAddToCart={handleAddToCart}
                    onClose={() => setSelectedPoint(null)}
                  />
                )}
              </GoogleMap>
            ) : (
              <Skeleton className="w-full h-full" />
            )}
          </div>
        </div>

        <div>
          {showReservationForm ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Finalizar Reserva</h3>
                    <button 
                      onClick={() => setShowReservationForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <EnhancedReservationForm
                    cartItems={cartItems}
                    onClose={() => setShowReservationForm(false)}
                    onReservationSuccess={handleReservationSuccess}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Cart
              items={cartItems}
              onRemove={handleRemoveFromCart}
              onClear={handleClearCart}
              onUpdatePeriod={handleUpdateCartItemPeriod}
              onReservationSuccess={handleReservationSuccess}
              onShowReservationForm={() => setShowReservationForm(true)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default HomePage;