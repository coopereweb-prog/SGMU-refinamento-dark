import { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, MarkerClustererF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { PointDetailsSheet } from '@/components/PointDetailsSheet';
import { MapFilter } from '@/components/MapFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { useMapConfig } from '@/contexts/MapConfigContext';
import { Cart } from '@/components/Cart';
import { Modal } from '@/components/Modal';
import { EnhancedReservationForm } from '@/components/EnhancedReservationForm';
import { toast } from 'sonner';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: -22.78,
  lng: -47.3,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

function HomePage() {
  const [points, setPoints] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [map, setMap] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(12);
  const [cartItems, setCartItems] = useState([]);
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);

  const { rules, settings, loading: loadingConfig } = useMapConfig();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-main',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['marker'],
  });

  useEffect(() => {
    const fetchPoints = async () => {
      setLoadingPoints(true);
      const { data, error } = await supabase
        .from('points')
        .select(`*, tags(id, name)`);

      if (error) {
        console.error('Error fetching points:', error);
      } else {
        const validPoints = data.filter(p => p.latitude && p.longitude);
        setPoints(validPoints);
        setFilteredPoints(validPoints);
      }
      setLoadingPoints(false);
    };

    fetchPoints();
  }, []);

  const handleMarkerClick = (point) => {
    setSelectedPoint(point);
    setIsSheetOpen(true);
  };

  const handleAddToCart = (point, period) => {
    const isAlreadyInCart = cartItems.some(item => item.point_id === point.id);
    if (isAlreadyInCart) {
      toast.warning("Este ponto já está no seu carrinho.");
      return;
    }

    const priceKey = `price_${period}y`;
    const price = point[priceKey];

    if (typeof price !== 'number' || price <= 0) {
      toast.error("Preço inválido para o período selecionado.");
      return;
    }

    const newItem = {
      point_id: point.id,
      name: point.name,
      price: price,
      period_years: period,
    };

    setCartItems(prevItems => [...prevItems, newItem]);
    toast.success(`${point.name} adicionado ao carrinho!`);
    setIsSheetOpen(false);
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleUpdateCartItemPeriod = (index, newPeriod) => {
    const itemToUpdate = cartItems[index];
    const point = points.find(p => p.id === itemToUpdate.point_id);
    if (!point) return;

    const priceKey = `price_${newPeriod}y`;
    const newPrice = point[priceKey];

    if (typeof newPrice !== 'number' || newPrice <= 0) {
      toast.error("Período indisponível para este ponto.");
      return;
    }

    setCartItems(prevItems =>
      prevItems.map((item, i) =>
        i === index ? { ...item, period_years: newPeriod, price: newPrice } : item
      )
    );
  };

  const handleReservationSuccess = () => {
    setIsReservationFormOpen(false);
    setCartItems([]);
  };

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onZoomChanged = useCallback(() => {
    if (map) setCurrentZoom(map.getZoom());
  }, [map]);

  const activeRule = useMemo(() => {
    if (loadingConfig || !rules.length) {
      return { display_mode: currentZoom > 14 ? 'individual' : 'cluster', cluster_radius: 60, min_cluster_size: 2 };
    }
    return rules.find(r => r.zoom_level === currentZoom) || rules[rules.length - 1];
  }, [currentZoom, rules, loadingConfig]);

  const clustererCalculator = useCallback((markers) => {
    if (!settings) return { text: String(markers.length), index: 1, title: '' };
    const count = settings.cluster_count_logic === 'available_only'
      ? markers.filter(m => m.point_status === 'available').length
      : markers.length;
    const index = Math.min(String(count).length, 5);
    return { text: String(count), index, title: `${count} pontos` };
  }, [settings]);

  if (!isLoaded || loadingPoints || loadingConfig) {
    return (
      <div className="relative h-screen w-screen">
        <Skeleton className="h-full w-full" />
        <div className="absolute top-4 left-4 z-10"><Skeleton className="h-12 w-64" /></div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen">
      <div className="absolute top-4 right-4 z-20">
        <Button asChild variant="secondary">
          <Link to="/admin">Admin</Link>
        </Button>
      </div>
      <MapFilter onFilterChange={setFilteredPoints} allPoints={points} />
      <div className="absolute top-4 right-4 z-10 w-full max-w-sm h-[calc(100%-2rem)] pt-14">
        <Cart
          items={cartItems}
          onRemove={handleRemoveFromCart}
          onClear={handleClearCart}
          onUpdatePeriod={handleUpdateCartItemPeriod}
          onShowReservationForm={() => setIsReservationFormOpen(true)}
        />
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={currentZoom}
        options={mapOptions}
        onLoad={onMapLoad}
        onZoomChanged={onZoomChanged}
      >
        {activeRule.display_mode === 'cluster' ? (
          <MarkerClustererF options={{ gridSize: activeRule.cluster_radius, minimumClusterSize: activeRule.min_cluster_size }} calculator={clustererCalculator}>
            {(clusterer) =>
              filteredPoints.map((point) => (
                <Marker
                  key={point.id}
                  position={{ lat: point.latitude, lng: point.longitude }}
                  onClick={() => handleMarkerClick(point)}
                  clusterer={clusterer}
                  // @ts-ignore
                  point_status={point.status}
                />
              ))
            }
          </MarkerClustererF>
        ) : (
          filteredPoints.map((point) => (
            <Marker
              key={point.id}
              position={{ lat: point.latitude, lng: point.longitude }}
              onClick={() => handleMarkerClick(point)}
            />
          ))
        )}
      </GoogleMap>
      <PointDetailsSheet
        point={selectedPoint}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onAddToCart={handleAddToCart}
      />
      <Modal
        isOpen={isReservationFormOpen}
        onClose={() => setIsReservationFormOpen(false)}
        title="Finalizar Reserva"
        description="Preencha seus dados para concluir a reserva dos pontos."
      >
        <EnhancedReservationForm
          cartItems={cartItems}
          onClose={() => setIsReservationFormOpen(false)}
          onReservationSuccess={handleReservationSuccess}
        />
      </Modal>
      <WhatsAppButton />
    </div>
  );
}

export default HomePage;