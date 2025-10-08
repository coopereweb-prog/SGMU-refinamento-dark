import { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, MarkerClustererF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { PointDetailsSheet } from '@/components/PointDetailsSheet';
import { MapFilter } from '@/components/MapFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { useMapConfig } from '@/contexts/MapConfigContext';

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
        .select(`
          *,
          tags (id, name),
          pricing (id, name, color)
        `);

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

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onZoomChanged = useCallback(() => {
    if (map) {
      const newZoom = map.getZoom();
      if (newZoom !== currentZoom) {
        setCurrentZoom(newZoom);
      }
    }
  }, [map, currentZoom]);

  const activeRule = useMemo(() => {
    if (loadingConfig || rules.length === 0) {
      return {
        zoom_level: currentZoom,
        display_mode: currentZoom > 14 ? 'individual' : 'cluster',
        cluster_radius: 60,
        min_cluster_size: 2,
      };
    }
    return rules.find(r => r.zoom_level === currentZoom) || rules[rules.length - 1];
  }, [currentZoom, rules, loadingConfig]);

  const clustererCalculator = useCallback((markers, numStyles) => {
    if (!settings) return { text: String(markers.length), index: 1, title: '' };

    const count = settings.cluster_count_logic === 'available_only'
      ? markers.filter(m => m.point_status === 'available').length
      : markers.length;
    
    const index = Math.min(String(count).length, numStyles);
    return {
      text: String(count),
      index,
      title: `${count} pontos ${settings.cluster_count_logic === 'available_only' ? 'disponíveis' : 'totais'}`,
    };
  }, [settings]);

  const getMarkerIcon = (point) => {
    const color = point.pricing?.color || '#4285F4'; // Default Google Maps blue
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: 'white',
      strokeWeight: 1.5,
      scale: 8,
    };
  };

  if (!isLoaded || loadingPoints || loadingConfig) {
    return (
      <div className="relative h-screen w-screen">
        <Skeleton className="h-full w-full" />
        <div className="absolute top-4 left-4">
          <Skeleton className="h-12 w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen">
      <MapFilter onFilterChange={setFilteredPoints} allPoints={points} />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={currentZoom}
        options={mapOptions}
        onLoad={onMapLoad}
        onZoomChanged={onZoomChanged}
      >
        {activeRule.display_mode === 'cluster' ? (
          <MarkerClustererF
            options={{
              gridSize: activeRule.cluster_radius,
              minimumClusterSize: activeRule.min_cluster_size,
            }}
            calculator={clustererCalculator}
          >
            {(clusterer) =>
              filteredPoints.map((point) => (
                <Marker
                  key={point.id}
                  position={{ lat: point.latitude, lng: point.longitude }}
                  onClick={() => handleMarkerClick(point)}
                  clusterer={clusterer}
                  icon={getMarkerIcon(point)}
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
              icon={getMarkerIcon(point)}
            />
          ))
        )}
      </GoogleMap>
      {selectedPoint && (
        <PointDetailsSheet
          point={selectedPoint}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </div>
  );
}

export default HomePage;