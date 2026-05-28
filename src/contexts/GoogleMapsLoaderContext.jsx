import { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES } from '@/config/googleMaps';

const GoogleMapsLoaderContext = createContext({
  isLoaded: false,
  loadError: undefined,
});

export function GoogleMapsLoaderProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-global', // ID único para toda a aplicação
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const value = { isLoaded, loadError };

  return (
    <GoogleMapsLoaderContext.Provider value={value}>
      {children}
    </GoogleMapsLoaderContext.Provider>
  );
}

export function useGoogleMapsLoader() {
  const context = useContext(GoogleMapsLoaderContext);
  if (context === undefined) {
    throw new Error('useGoogleMapsLoader must be used within a GoogleMapsLoaderProvider');
  }
  return context;
}