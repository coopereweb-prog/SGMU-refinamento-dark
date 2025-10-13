import { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, MarkerClustererF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Save, Loader2 } from 'lucide-react';
import { ZoomTimeline } from '@/components/ZoomTimeline';
import { MapSettingsForm } from '@/components/MapSettingsForm';
import { Skeleton } from '@/components/ui/skeleton';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '@/config/googleMaps';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const center = { lat: -22.78, lng: -47.3 };

export function ManageMapSettingsPage() {
  const [points, setPoints] = useState([]);
  const [rules, setRules] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({ cluster_count_logic: 'available_only' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedZoom, setSelectedZoom] = useState(12);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-admin',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [pointsRes, rulesRes, settingsRes] = await Promise.all([
        supabase.from('points').select('id, latitude, longitude, status'),
        supabase.from('map_zoom_rules').select('*').order('zoom_level'),
        supabase.from('map_settings').select('*').eq('id', 1).single(),
      ]);

      if (pointsRes.error) throw pointsRes.error;
      if (rulesRes.error) throw rulesRes.error;
      if (settingsRes.error) throw settingsRes.error;

      setPoints(pointsRes.data.filter(p => p.latitude && p.longitude));
      setRules(rulesRes.data);
      setGlobalSettings(settingsRes.data);
    } catch (error) {
      toast.error("Falha ao carregar dados", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const activeRule = useMemo(() => {
    return rules.find(r => r.zoom_level === selectedZoom) || {
      zoom_level: selectedZoom,
      display_mode: 'cluster',
      cluster_radius: 60,
      min_cluster_size: 2,
    };
  }, [rules, selectedZoom]);

  const handleRuleChange = (key, value) => {
    setRules(currentRules => {
      const newRules = [...currentRules];
      const ruleIndex = newRules.findIndex(r => r.zoom_level === selectedZoom);
      if (ruleIndex > -1) {
        newRules[ruleIndex] = { ...newRules[ruleIndex], [key]: value };
      } else {
        newRules.push({ ...activeRule, [key]: value });
      }
      return newRules.sort((a, b) => a.zoom_level - b.zoom_level);
    });
  };

  const handleGlobalSettingsChange = (key, value) => {
    setGlobalSettings(currentSettings => ({ ...currentSettings, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: settingsError } = await supabase
        .from('map_settings')
        .update({ cluster_count_logic: globalSettings.cluster_count_logic })
        .eq('id', 1);
      if (settingsError) throw settingsError;

      const { error: rulesError } = await supabase.from('map_zoom_rules').upsert(rules);
      if (rulesError) throw rulesError;

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Falha ao salvar configurações", { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onZoomChanged = () => {
    if (map) {
      setSelectedZoom(map.getZoom());
    }
  };

  const clustererCalculator = (markers, numStyles) => {
    const count = globalSettings.cluster_count_logic === 'available_only'
      ? markers.filter(m => m.point_status === 'available').length
      : markers.length;
    
    const index = Math.min(String(count).length, numStyles);
    return { text: String(count), index, title: `${count} pontos` };
  };

  if (loading) {
    return <div className="p-8"><Skeleton className="w-full h-64" /></div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ajustes do Mapa Interativo</h1>
          <p className="text-muted-foreground">Configure o comportamento dos clusters em cada nível de zoom.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Configurações
        </Button>
      </div>

      <ZoomTimeline currentZoom={selectedZoom} onZoomSelect={setSelectedZoom} rules={rules} />

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <MapSettingsForm
          globalSettings={globalSettings}
          onGlobalSettingsChange={handleGlobalSettingsChange}
          activeRule={activeRule}
          onRuleChange={handleRuleChange}
          isRuleActive={!loading}
        />
        <div className="h-[70vh] sticky top-24">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={selectedZoom}
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
                    points.map((point) => (
                      <Marker
                        key={point.id}
                        position={{ lat: point.latitude, lng: point.longitude }}
                        clusterer={clusterer}
                        // @ts-ignore
                        point_status={point.status}
                      />
                    ))
                  }
                </MarkerClustererF>
              ) : (
                points.map((point) => (
                  <Marker
                    key={point.id}
                    position={{ lat: point.latitude, lng: point.longitude }}
                  />
                ))
              )}
            </GoogleMap>
          ) : <Skeleton className="w-full h-full" />}
        </div>
      </div>
    </div>
  );
}