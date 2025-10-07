/**
 * Gera uma URL otimizada do Google Maps para uma rota com múltiplos pontos.
 * @param {Array<{latitude: number, longitude: number}>} points - Uma lista de objetos de ponto, cada um com latitude e longitude.
 * @returns {string|null} A URL do Google Maps ou null se não houver pontos.
 */
export function generateOptimizedRouteUrl(points) {
  if (!points || points.length === 0) {
    return null;
  }

  // Se houver apenas um ponto, a rota é simplesmente para aquele destino.
  if (points.length === 1) {
    const { latitude, longitude } = points[0];
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  // Para múltiplos pontos, o último é o destino e os outros são waypoints.
  // O Google Maps otimiza a ordem dos waypoints.
  const destination = points[points.length - 1];
  const waypoints = points
    .slice(0, -1)
    .map(p => `${p.latitude},${p.longitude}`)
    .join('|');
  
  const destinationStr = `${destination.latitude},${destination.longitude}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${destinationStr}&waypoints=${waypoints}&travelmode=driving`;
}