import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const MapConfigContext = createContext();

export function useMapConfig() {
  return useContext(MapConfigContext);
}

export function MapConfigProvider({ children }) {
  const [rules, setRules] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const [rulesRes, settingsRes] = await Promise.all([
          supabase.from('map_zoom_rules').select('*').order('zoom_level'),
          supabase.from('map_settings').select('*').eq('id', 1).single(),
        ]);

        if (rulesRes.error) throw rulesRes.error;
        if (settingsRes.error) throw settingsRes.error;

        setRules(rulesRes.data);
        setSettings(settingsRes.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load map configuration:", err);
        setError(err);
        // Set default values on failure
        setRules(Array.from({ length: 22 }, (_, i) => ({
          zoom_level: i + 1,
          display_mode: i + 1 > 14 ? 'individual' : 'cluster',
          cluster_radius: 60,
          min_cluster_size: 2,
        })));
        setSettings({ cluster_count_logic: 'available_only' });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const value = {
    rules,
    settings,
    loading,
    error,
  };

  return (
    <MapConfigContext.Provider value={value}>
      {children}
    </MapConfigContext.Provider>
  );
}