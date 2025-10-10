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
import { FilterPanel } from '@/components/FilterPanel';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, User } from 'lucide-react';
import { CartModal } from '@/components/CartModal';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { GOOGLE_MAPS_LIBRARIES } from '@/config/googleMaps';

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

const createClusterSvg = (size, fillColor, strokeColor = 'oklch(1 0 0 / 25%)') => `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad-${fillColor.replace(/[^a-zA-Z0-9]/g, '')}" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style="stop-color:${fillColor};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:oklch(0.205 0 0);stop-opacity:0.95" />
      </radialGradient>
    </defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${(size / 2) - 2}" fill="url(#grad-${fillColor.replace(/[^a-zA-Z0-9]/g, '')})" stroke="${strokeColor}" stroke-width="2"/>
  </svg>
`;

const clusterColors = {
  available: 'oklch(0.75 0.25 145)', // Verde
  reserved: 'oklch(0.85 0.2 90)',   // Amarelo
  sold: 'oklch(0.65 0.22 25)',      // Vermelho
  mixed: 'oklch(0.145 0 0)',        // Preto
};

const clusterStyles = [
  // Available (Green)
  { size: 50, color: clusterColors.available }, { size: 60, color: clusterColors.available }, { size: 70, color: clusterColors.available },
  // Reserved (Yellow)
  { size: 50, color: clusterColors.reserved }, { size: 60, color: clusterColors.reserved }, { size: 70, color: clusterColors.reserved },
  // Sold (Red)
  { size: 50, color: clusterColors.sold }, { size: 60, color: clusterColors.sold }, { size: 70, color: clusterColors.sold },
  // Mixed (Black)
  { size: 50, color: clusterColors.mixed }, { size: 60, color: clusterColors.mixed }, { size: 70, color: clusterColors.mixed },
].map(config => ({
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createClusterSvg(config.size, config.color))}`,
  height: config.size,
  width: config.size,
  textColor: 'oklch(0.985 0 0)',
  textSize: config.size > 60 ? 18 : (config.size > 50 ? 16 : 15),
  fontFamily: 'sans-serif',
  fontWeight: 'bold',
}));

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
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCartMinimized, setIsCartMinimized] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ statuses: ['available'], tags: [], tiers: [] });

  const { rules, settings, loading: loadingConfig } = useMapConfig();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-main',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    const fetchPoints = async () => {
      setLoadingPoints(true);
      try {
        const { data, error } = await supabase
          .from('points')
          .select(`*, tags(id, name), pricing_tiers(id, name)`);
        if (error) throw error;
        const validPoints = data.filter(p => p.latitude && p.longitude);
        setPoints(validPoints);
      } catch (error) {
        console.error('Error fetching points:', error);
        toast.error("Falha ao carregar os pontos do mapa.", { description: error.message });
      } finally {
        setLoadingPoints(false);
      }
    };
    fetchPoints();
  }, []);

  useEffect(() => {
    if (points.length > 0 && window.google?.maps?.Animation) {
      setMarkerAnimation(window.google.maps.Animation.BOUNCE);
      const timer = setTimeout(() => setMarkerAnimation(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [points]);

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

  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    let newFilteredPoints = points;
    if (filters.statuses.length > 0) newFilteredPoints = newFilteredPoints.filter(point => filters.statuses.includes(point.status));
    if (filters.tags.length > 0) newFilteredPoints = newFilteredPoints.filter(point => point.tags && point.tags.some(tag => filters.tags.includes(tag.id)));
    if (filters.tiers.length > 0) newFilteredPoints = newFilteredPoints.filter(point => point.pricing_tiers && filters.tiers.includes(point.pricing_tiers.id));
    setFilteredPoints(newFilteredPoints);
  }, [points]);

  const handleMarkerClick = (point) => {
    setSelectedPoint(point);
    setIsSheetOpen(true);
  };

  const handleAddToCart = (point, period) => {
    if (cartItems.some(item => item.point_id === point.id)) {
      toast.warning("Este ponto já está no seu carrinho.");
      return;
    }
    const price = point[`price_${period}y`];
    if (typeof price !== 'number' || price <= 0) {
      toast.error("Preço inválido para o período selecionado.");
      return;
    }
    const newItem = { point_id: point.id, name: point.name, price, period_years: period };
    setCartItems(prevItems => {
      if (prevItems.length === 0) {
        setIsCartMinimized(true);
        setIsCartModalOpen(false);
      }
      return [...prevItems, newItem];
    });
    toast.success(`${point.name} adicionado ao carrinho!`);
    setIsSheetOpen(false);
  };

  const handleRemoveFromCart = (index) => setCartItems(prev => prev.filter((_, i) => i !== index));
  const handleClearCart = () => {
    setCartItems([]);
    setIsCartModalOpen(false);
    setIsCartMinimized(false);
  };

  const handleUpdateCartItemPeriod = (index, newPeriod) => {
    const itemToUpdate = cartItems[index];
    const point = points.find(p => p.id === itemToUpdate.point_id);
    if (!point) return;
    const newPrice = point[`price_${newPeriod}y`];
    if (typeof newPrice !== 'number' || newPrice <= 0) {
      toast.error("Período indisponível para este ponto.");
      return;
    }
    setCartItems(prev => prev.map((item, i) => i === index ? { ...item, period_years: newPeriod, price: newPrice } : item));
  };

  const handleReservationSuccess = () => {
    setIsReservationFormOpen(false);
    setCartItems([]);
    setIsCartMinimized(false);
  };

  const handleCloseCartModal = () => {
    setIsCartModalOpen(false);
    if (cartItems.length > 0) setIsCartMinimized(true);
  };

  const handleOpenCartModal = () => {
    setIsCartMinimized(false);
    setIsCartModalOpen(true);
  };

  const handleShowReservationForm = () => {
    setIsCartModalOpen(false);
    setIsReservationFormOpen(true);
  };

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onZoomChanged = useCallback(() => { if (map) setCurrentZoom(map.getZoom()); }, [map]);

  const activeRule = useMemo(() => {
    if (loadingConfig || !rules.length) return { display_mode: currentZoom > 14 ? 'individual' : 'cluster', cluster_radius: 60, min_cluster_size: 2 };
    return rules.find(r => r.zoom_level === currentZoom) || rules[rules.length - 1];
  }, [currentZoom, rules, loadingConfig]);

  const clustererCalculator = useMemo(() => {
    return (markers) => {
      const count = markers.length;
      let statusType;
      let baseIndex;

      if (activeFilters.statuses.length === 1) {
        statusType = activeFilters.statuses[0];
      } else {
        const statusesInCluster = new Set(markers.map(m => m.point_status));
        statusType = statusesInCluster.size === 1 ? statusesInCluster.values().next().value : 'mixed';
      }

      switch (statusType) {
        case 'available': baseIndex = 0; break;
        case 'reserved': baseIndex = 3; break;
        case 'sold': baseIndex = 6; break;
        case 'mixed': default: baseIndex = 9; break;
      }

      const sizeIndex = count < 10 ? 0 : (count < 100 ? 1 : 2);
      const finalIndex = baseIndex + sizeIndex + 1;

      return {
        text: String(count),
        index: finalIndex,
        title: `${count} pontos (${statusType})`,
      };
    };
  }, [activeFilters.statuses]);

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
      <header className="h-auto sm:h-20 bg-black/30 backdrop-blur-sm z-20 flex-shrink-0 py-2">
        <div className="container mx-auto px-4 h-full grid grid-cols-3 items-center">
          {/* Botão de Menu para Mobile */}
          <div className="justify-self-start md:hidden">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 w-10 p-0 flex items-center justify-center">
                  <Menu className="h-8 w-8" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[380px] p-0 border-none flex flex-col">
                <SheetHeader className="p-4 pb-2 border-b">
                  <SheetTitle>Filtrar Pontos</SheetTitle>
                  <SheetDescription>Selecione um ou mais filtros para refinar a busca no mapa.</SheetDescription>
                </SheetHeader>
                <FilterPanel points={points} onFilterChange={handleFilterChange} />
              </SheetContent>
            </Sheet>
          </div>
          
          <Link to="/" className="flex items-center gap-2 justify-self-center col-start-2 flex-col sm:flex-row">
            <img src="/logo.png" alt="SGMU Logo" className="h-10 sm:h-12 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight"><span className="font-semibold">Sistema Gestor</span> de Mobiliário Urbano</p>
            </div>
          </Link>

          <div className="justify-self-end col-start-3">
            <Button asChild variant="outline" className="h-10 w-10 p-0 flex items-center justify-center overflow-hidden">
              <Link to="/login" aria-label="Área Restrita">
                <User className="h-12 w-12" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow relative">
        {/* Painel de Filtro Flutuante para Desktop */}
        <div className="hidden md:block absolute top-4 left-4 z-10 w-full max-w-[300px]">
          <Card className="bg-background/80 backdrop-blur-sm max-h-[calc(100vh-6rem)] flex flex-col gap-2 py-2">
            <CardHeader className="px-4 py-0">
              <CardTitle className="text-base">Filtrar Pontos</CardTitle>
            </CardHeader>
            <FilterPanel points={points} onFilterChange={handleFilterChange} />
          </Card>
        </div>

        <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={currentZoom} options={mapOptions} onLoad={onMapLoad} onZoomChanged={onZoomChanged}>
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
      </main>

      <PointDetailsSheet point={selectedPoint} isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} onAddToCart={handleAddToCart} />
      
      <CartModal isOpen={isCartModalOpen} onClose={handleCloseCartModal} cartItems={cartItems} onRemoveFromCart={handleRemoveFromCart} onClearCart={handleClearCart} onUpdateCartItemPeriod={handleUpdateCartItemPeriod} onShowReservationForm={handleShowReservationForm} />

      {isCartMinimized && (<FloatingCartButton itemCount={cartItems.length} onClick={handleOpenCartModal} />)}

      <Modal isOpen={isReservationFormOpen} onClose={() => setIsReservationFormOpen(false)} title="Finalizar Reserva" description="Preencha seus dados para concluir a reserva dos pontos.">
        <EnhancedReservationForm cartItems={cartItems} onClose={() => setIsReservationFormOpen(false)} onReservationSuccess={handleReservationSuccess} />
      </Modal>
      
      <WhatsAppButton />
    </div>
  );
}

export default HomePage;