/**
 * Gera uma URL do Google Maps para uma rota com múltiplos pontos,
 * garantindo que o primeiro ponto seja o início da rota e que cada
 * ponto seja exibido como um marcador (pin) no mapa.
 * @param {Array<{latitude: number, longitude: number}>} points - Uma lista de objetos de ponto, cada um com latitude e longitude.
 * @returns {string|null} A URL do Google Maps ou null se não houver pontos.
 */
export function generateOptimizedRouteUrl(points) {
  // Se não houver pontos ou a lista for inválida, retorna nulo.
  if (!points || points.length === 0) {
    return null;
  }

  // Se houver apenas um ponto, o ideal é usar o modo de "pesquisa", que coloca um pino grande no local.
  if (points.length === 1) {
    const { latitude, longitude } = points[0];
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  // Para múltiplos pontos, usamos a URL de direções padrão.
  // O primeiro ponto é a origem, o último é o destino, e os do meio são waypoints (pontos de parada).
  // Isso garante que todos os pontos sejam exibidos no mapa.
  const origin = points[0];
  const destination = points[points.length - 1];
  const waypoints = points.slice(1, -1);

  const originStr = `${origin.latitude},${origin.longitude}`;
  const destinationStr = `${destination.latitude},${destination.longitude}`;
  
  const waypointsStr = waypoints
    .map(p => `${p.latitude},${p.longitude}`)
    .join('|');

  // Codifica os parâmetros para garantir que a URL seja válida
  const encodedWaypoints = encodeURIComponent(waypointsStr);

  return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}&waypoints=${encodedWaypoints}&travelmode=driving`;
}