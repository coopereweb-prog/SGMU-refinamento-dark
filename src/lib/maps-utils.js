/**
 * Gera uma URL do Google Maps para uma rota com múltiplos pontos,
 * usando a localização atual do usuário como ponto de partida.
 * @param {Array<{latitude: number, longitude: number}>} points - Uma lista de objetos de ponto.
 * @returns {string|null} A URL do Google Maps ou null se não houver pontos.
 */
export function generateOptimizedRouteUrl(points) {
  if (!points || points.length === 0) {
    return null;
  }

  // O destino é sempre o último ponto da lista.
  const destination = points[points.length - 1];
  const destinationStr = `${destination.latitude},${destination.longitude}`;

  // Todos os outros pontos (se houver) são paradas intermediárias (waypoints).
  const waypoints = points.slice(0, -1);
  
  const waypointsStr = waypoints
    .map(p => `${p.latitude},${p.longitude}`)
    .join('|');

  const encodedWaypoints = encodeURIComponent(waypointsStr);

  // Ao omitir o parâmetro 'origin', o Google Maps usa a localização atual do usuário.
  // Isso faz com que o botão "Iniciar" da navegação apareça.
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destinationStr}&travelmode=driving`;

  if (waypoints.length > 0) {
    url += `&waypoints=${encodedWaypoints}`;
  }

  return url;
}