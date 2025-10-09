import { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, MarkerClustererF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { PointDetailsSheet } from '@/components/PointDetailsSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useMapConfig } from '@/contexts/MapConfigContext';
import { Modal } from '@/components/Modal';
import { EnhancedReservationForm } from '@/components/EnhancedReservationForm';
import { toast } from 'sonner';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';

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

const getMarkerIcon = (status) => {
  const colors = {
    available: 'oklch(0.75 0.25 145)',
    reserved: 'oklch(0.85 0.2 90)',
    sold: 'oklch(0.65 0.22 25)',
  };
  const color = colors[status] || 'oklch(0.708 0 0)';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="black" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path 
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
        fill="${color}" 
        stroke="oklch(0.145 0 0)" 
        stroke-width="0.5"
        filter="url(#shadow)"
      />
      <circle cx="12" cy="9" r="2.5" fill="oklch(0.145 0 0 / 50%)"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(36, 36),
    anchor: new window.google.maps.Point(18, 36),
  };
};

const createClusterSvg = (size) => `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style="stop-color:oklch(0.269 0 0);stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:oklch(0.205 0 0);stop-opacity:0.95" />
      </radialGradient>
    </defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${(size / 2) - 2}" fill="url(#grad1)" stroke="oklch(1 0 0 / 25%)" stroke-width="2"/>
  </svg>
`;

const clusterStyles = [
  { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createClusterSvg(50))}`, height: 50, width: 50, textColor: 'oklch(0.985 0 0)', textSize: 15, fontFamily: 'sans-serif', fontWeight: 'bold' },
  { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createClusterSvg(60))}`, height: 60, width: 60, textColor: 'oklch(0.985 0 0)', textSize: 16, fontFamily: 'sans-serif', fontWeight: 'bold' },
  { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createClusterSvg(70))}`, height: 70, width: 70, textColor: 'oklch(0.985 0 0)', textSize: 18, fontFamily: 'sans-serif', fontWeight: 'bold' },
];

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [markerAnimation, setMarkerAnimation] = useState(null);

  const { rules, settings, loading: loadingConfig } = useMapConfig();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-main',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['marker'],
  });

  useEffect(() => {
    const fetchPoints = async () => {
      setLoadingPoints(true);
      const { data, error } = await supabase.from('points').select(`*, tags(id, name)`);
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

  useEffect(() => {
    if (points.length > 0 && window.google?.maps?.Animation) {
      setMarkerAnimation(window.google.maps.Animation.BOUNCE);
      const timer = setTimeout(() => setMarkerAnimation(null), 2000); // Animação por 2 segundos
      return () => clearTimeout(timer);
    }
  }, [points]);

  // Efeito para ajustar o mapa aos pontos carregados
  useEffect(() => {
    if (map && points.length > 0) {
      if (points.length === 1) {
        map.setCenter({ lat: points[0].latitude, lng: points[0].longitude });
        map.setZoom(15);
      } else {
        const bounds = new window.google.maps.LatLngBounds();
        points.forEach(point => {
          bounds.extend({ lat: point.latitude, lng: point.longitude });
        });
        map.fitBounds(bounds);
      }
    }
  }, [map, points]);

  const handleFilterChange = (selectedTagIds) => {
    if (selectedTagIds.length === 0) {
      setFilteredPoints(points);
    } else {
      const newFilteredPoints = points.filter(point =>
        point.tags.some(tag => selectedTagIds.includes(tag.id))
      );
      setFilteredPoints(newFilteredPoints);
    }
  };

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
    const newItem = { point_id: point.id, name: point.name, price: price, period_years: period };
    setCartItems(prevItems => [...prevItems, newItem]);
    toast.success(`${point.name} adicionado ao carrinho!`);
    setIsSheetOpen(false);
  };

  const handleRemoveFromCart = (index) => setCartItems(prev => prev.filter((_, i) => i !== index));
  const handleClearCart = () => setCartItems([]);

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
    setCartItems(prev => prev.map((item, i) => i === index ? { ...item, period_years: newPeriod, price: newPrice } : item));
  };

  const handleReservationSuccess = () => {
    setIsReservationFormOpen(false);
    setCartItems([]);
  };

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onZoomChanged = useCallback(() => { if (map) setCurrentZoom(map.getZoom()); }, [map]);

  const activeRule = useMemo(() => {
    if (loadingConfig || !rules.length) return { display_mode: currentZoom > 14 ? 'individual' : 'cluster', cluster_radius: 60, min_cluster_size: 2 };
    return rules.find(r => r.zoom_level === currentZoom) || rules[rules.length - 1];
  }, [currentZoom, rules, loadingConfig]);

  const clustererCalculator = useCallback((markers) => {
    if (!settings) return { text: String(markers.length), index: 1, title: '' };
    const count = settings.cluster_count_logic === 'available_only' ? markers.filter(m => m.point_status === 'available').length : markers.length;
    const index = Math.min(String(count).length, 5);
    return { text: String(count), index, title: `${count} pontos` };
  }, [settings]);

  if (!isLoaded || loadingPoints || loadingConfig) {
    return (
      <div className="relative h-screen w-screen">
        <Skeleton className="h-full w-full" />
        <div className="absolute top-4 left-4 z-10"><Skeleton className="h-16 w-full" /></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      <header className="h-auto sm:h-20 bg-black/60 z-20 flex-shrink-0 py-2">
        <div className="container mx-auto px-4 h-full grid grid-cols-3 lg:grid-cols-4 items-center">
          {/* Coluna Esquerda: Menu */}
          <div className="justify-self-start">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 w-10 sm:h-12 sm:w-12 p-0 flex items-center justify-center">
                  <Menu className="h-8 w-8 sm:h-10 sm:w-10" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[380px] p-0 border-none">
                <Sidebar
                  points={filteredPoints}
                  onFilterChange={handleFilterChange}
                  cartItems={cartItems}
                  onRemoveFromCart={handleRemoveFromCart}
                  onClearCart={handleClearCart}
                  onUpdateCartItemPeriod={handleUpdateCartItemPeriod}
                  onShowReservationForm={() => {
                    setIsSidebarOpen(false);
                    setTimeout(() => setIsReservationFormOpen(true), 150);
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Coluna Central: Logo */}
          <Link to="/" className="flex items-center gap-2 justify-self-center col-start-2 lg:col-span-2 flex-col sm:flex-row">
            <img src="/logo.png" alt="SGMU Logo" className="h-10 sm:h-12 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                <span className="font-semibold">Sistema Gestor</span> de Mobiliário Urbano
              </p>
            </div>
          </Link>

          {/* Coluna Direita: Botão de Acesso */}
          <div className="justify-self-end col-start-3 lg:col-start-4">
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" className="h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm">
                <Link to="/login">Área Restrita</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1">
        <div className="h-full w-full relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-lg text-sm text-muted-foreground pointer-events-none">
            Clique nos marcadores para ver detalhes e adicionar ao carrinho.
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
              <MarkerClustererF options={{ gridSize: activeRule.cluster_radius, minimumClusterSize: activeRule.min_cluster_size, styles: clusterStyles }} calculator={clustererCalculator}>
                {(clusterer) => filteredPoints.map((point) => (
                  <Marker key={point.id} position={{ lat: point.latitude, lng: point.longitude }} onClick={() => handleMarkerClick(point)} clusterer={clusterer} icon={getMarkerIcon(point.status)} animation={markerAnimation} {...{point_status: point.status}} />
                ))}
              </MarkerClustererF>
            ) : (
              filteredPoints.map((point) => (
                <Marker key={point.id} position={{ lat: point.latitude, lng: point.longitude }} onClick={() => handleMarkerClick(point)} icon={getMarkerIcon(point.status)} animation={markerAnimation} />
              ))
            )}
          </GoogleMap>
        </div>
      </main>

      <PointDetailsSheet point={selectedPoint} isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} onAddToCart={handleAddToCart} />
      <Modal isOpen={isReservationFormOpen} onClose={() => setIsReservationFormOpen(false)} title="Finalizar Reserva" description="Preencha seus dados para concluir a reserva dos pontos.">
        <EnhancedReservationForm cartItems={cartItems} onClose={() => setIsReservationFormOpen(false)} onReservationSuccess={handleReservationSuccess} />
      </Modal>
      <WhatsAppButton />
    </div>
  );
}

export default HomePage;