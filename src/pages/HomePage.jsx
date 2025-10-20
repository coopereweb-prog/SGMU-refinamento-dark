import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleMap, MarkerClustererF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { PointDetailsSheet } from '@/components/PointDetailsSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useMapConfig } from '@/contexts/MapConfigContext';
import { useCart } from '@/contexts/CartContext';
import { useGoogleMapsLoader } from '@/contexts/GoogleMapsLoaderContext';
import { toast } from 'sonner';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { FilterPanel } from '@/components/FilterPanel';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { MobileFilterButton } from '@/components/MobileFilterButton';
import { FilterSheet } from '@/components/FilterSheet';

// Componente AdvancedMarkerElement (simulado, pois não podemos importar diretamente)
const AdvancedMarkerElement = (props) => {
  const { position, map, content, onClick, ...rest } = props;
  const markerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    // Cria o elemento de conteúdo (se não existir)
    if (!contentRef.current) {
      contentRef.current = document.createElement('div');
      contentRef.current.innerHTML = content;
      if (onClick) {
        contentRef.current.style.cursor = 'pointer';
        contentRef.current.addEventListener('click', onClick);
      }
    }

    // Cria o marcador avançado
    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: contentRef.current,
      ...rest,
    });

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        if (onClick && contentRef.current) {
          contentRef.current.removeEventListener('click', onClick);
        }
      }
    };
  }, [map, position, content, onClick]);

  return null;
};

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

const getMarkerHtml = (status, isInCart) => {
  const colors = {
    available: 'oklch(0.75 0.25 145)',
    reserved: 'oklch(0.85 0.2 90)',
    sold: 'oklch(0.65 0.22 25)',
  };
  const color = colors[status] || 'oklch(0.708 0 0)';
  const iconFill = 'oklch(0.85 0.2 90)'; // Yellow (Primary color)

  if (isInCart) {
    return `
      <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -50%);">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" style="filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.6));">
          <circle cx="18" cy="18" r="16" fill="oklch(0.145 0 0)" stroke="oklch(0.85 0.2 90 / 50%)" stroke-width="2"/>
          <g transform="translate(18, 18) scale(0.8) translate(-12, -12)" fill="none" stroke="${iconFill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/>
          </g>
        </svg>
      </div>
    `;
  }

  return `
    <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -100%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));">
        <path 
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
          fill="${color}" 
          stroke="oklch(0.145 0 0)" 
          stroke-width="0.5"
        />
        <circle cx="12" cy="9" r="2.5" fill="oklch(0.145 0 0 / 50%)"/>
      </svg>
    </div>
  `;
};

const getDynamicMarkerContent = (point, cartItems) => {
  const isInCart = cartItems.some(item => item.point_id === point.id);
  return getMarkerHtml(point.status, isInCart);
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
  const [activeFilters, setActiveFilters] = useState({ statuses: ['available'], tags: [], tiers: [] });
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const initialLoadDoneRef = useRef(false);

  const { rules, loading: loadingConfig } = useMapConfig();
  const { cartItems, addToCart } = useCart();
  const { isLoaded } = useGoogleMapsLoader();

  useEffect(() => {
    const fetchPoints = async () => {
      setLoadingPoints(true);
      try {
        const { data, error } = await supabase
          .from('points')
          .select(`
            *,
            tags (id, name),
            pricing_tiers (*)
          `);
        if (error) throw error;
        
        const validPoints = data.filter(p => p.latitude && p.longitude);
        setPoints(validPoints);
        setFilteredPoints(validPoints.filter(p => activeFilters.statuses.includes(p.status)));
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
    if (map && points.length > 0 && !initialLoadDoneRef.current) {
      if (points.length === 1) {
        map.setCenter({ lat: points[0].latitude, lng: points[0].longitude });
        map.setZoom(15);
        initialLoadDoneRef.current = true;
      } else {
        const bounds = new window.google.maps.LatLngBounds();
        points.forEach(point => {
          bounds.extend({ lat: point.latitude, lng: point.longitude });
        });
        map.fitBounds(bounds);
        
        window.google.maps.event.addListenerOnce(map, 'idle', () => {
          const newZoom = map.getZoom();
          if (newZoom !== currentZoom) {
            setCurrentZoom(newZoom);
          }
          initialLoadDoneRef.current = true;
        });
      }
    }
  }, [map, points, currentZoom]);

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
    addToCart(point, period);
    setIsSheetOpen(false);
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
      <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
        <Header />
        <main className="flex-grow relative">
          <Skeleton className="h-full w-full" />
          <div className="absolute top-4 left-4 z-10"><Skeleton className="h-16 w-full" /></div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      <Header />

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

        {/* Botão e Sheet para Mobile */}
        <MobileFilterButton onClick={() => setIsFilterSheetOpen(true)} />
        <FilterSheet
          isOpen={isFilterSheetOpen}
          onOpenChange={setIsFilterSheetOpen}
          points={points}
          onFilterChange={handleFilterChange}
        />

        <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={currentZoom} options={mapOptions} onLoad={onMapLoad} onZoomChanged={onZoomChanged}>
          {activeRule.display_mode === 'cluster' ? (
            <MarkerClustererF key={currentZoom} options={{ gridSize: activeRule.cluster_radius, minimumClusterSize: activeRule.min_cluster_size, styles: clusterStyles }} calculator={clustererCalculator}>
              {(clusterer) => filteredPoints.map((point) => (
                <AdvancedMarkerElement 
                  key={point.id} 
                  position={{ lat: point.latitude, lng: point.longitude }} 
                  map={map} 
                  content={getDynamicMarkerContent(point, cartItems)} 
                  onClick={() => handleMarkerClick(point)} 
                  clusterer={clusterer} 
                  // @ts-ignore
                  point_status={point.status} 
                />
              ))}
            </MarkerClustererF>
          ) : (
            filteredPoints.map((point) => (
              <AdvancedMarkerElement 
                key={point.id} 
                position={{ lat: point.latitude, lng: point.longitude }} 
                map={map} 
                content={getDynamicMarkerContent(point, cartItems)} 
                onClick={() => handleMarkerClick(point)} 
              />
            ))
          )}
        </GoogleMap>
      </main>

      <PointDetailsSheet point={selectedPoint} isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} onAddToCart={handleAddToCart} />
      
      <WhatsAppButton />
    </div>
  );
}

export default HomePage;