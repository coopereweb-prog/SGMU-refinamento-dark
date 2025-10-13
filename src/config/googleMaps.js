// src/config/googleMaps.js
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  throw new Error(
    'A chave da API do Google Maps não foi encontrada. ' +
    'Por favor, adicione VITE_GOOGLE_MAPS_API_KEY ao seu arquivo .env.local e reconstrua a aplicação.'
  );
}

export const GOOGLE_MAPS_API_KEY = googleMapsApiKey;
export const GOOGLE_MAPS_LIBRARIES = ['marker'];