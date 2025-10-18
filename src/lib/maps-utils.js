/**
 * Gera uma URL do Google Maps para uma rota com múltiplos pontos.
 * @param {Array<{latitude: number, longitude: number}>} points - Uma lista de objetos de ponto.
 * @param {Object|null} startCoords - As coordenadas de partida {latitude, longitude}. Se nulo, usa a localização atual do usuário.
 * @returns {string|null} A URL do Google Maps ou null se não houver pontos.
 */
export function generateOptimizedRouteUrl(points, startCoords = null) {
  if (!points || points.length === 0) {
    return null;
  }

  const destination = points[points.length - 1];
  const destinationStr = `${destination.latitude},${destination.longitude}`;

  const waypoints = points.slice(0, -1);
  const waypointsStr = waypoints
    .map(p => `${p.latitude},${p.longitude}`)
    .join('|');
  const encodedWaypoints = encodeURIComponent(waypointsStr);

  let url = `https://www.google.com/maps/dir/?api=1&destination=${destinationStr}&travelmode=driving`;

  if (startCoords) {
    url += `&origin=${startCoords.latitude},${startCoords.longitude}`;
  }
  // Se startCoords for nulo, o Google Maps usará a localização atual como origem.

  if (waypoints.length > 0) {
    url += `&waypoints=${encodedWaypoints}`;
  }

  return url;
}