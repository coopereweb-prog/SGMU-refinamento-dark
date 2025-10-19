/**
 * Calcula a distância haversiana entre duas coordenadas geográficas.
 * @param {{latitude: number, longitude: number}} coords1 - As primeiras coordenadas.
 * @param {{latitude: number, longitude: number}} coords2 - As segundas coordenadas.
 * @returns {number} A distância em quilômetros.
 */
function haversineDistance(coords1, coords2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Raio da Terra em km

  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Ordena uma lista de pontos por proximidade usando o algoritmo do vizinho mais próximo.
 * @param {Array<{id: string, latitude: number, longitude: number}>} points - Lista de pontos a serem ordenados.
 * @param {{latitude: number, longitude: number}} startCoords - As coordenadas de partida.
 * @returns {Array<{id: string, latitude: number, longitude: number}>} A lista de pontos ordenada.
 */
function sortPointsByProximity(points, startCoords) {
  if (!points || points.length === 0) {
    return [];
  }

  let remainingPoints = [...points];
  let sortedPoints = [];
  let currentLocation = startCoords;

  while (remainingPoints.length > 0) {
    let closestPoint = null;
    let minDistance = Infinity;
    let closestIndex = -1;

    remainingPoints.forEach((point, index) => {
      const distance = haversineDistance(currentLocation, point);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
        closestIndex = index;
      }
    });

    if (closestPoint) {
      sortedPoints.push(closestPoint);
      currentLocation = closestPoint;
      remainingPoints.splice(closestIndex, 1);
    } else {
      // Fallback para evitar loop infinito
      break;
    }
  }

  return sortedPoints;
}


/**
 * Gera uma URL do Google Maps para uma rota com múltiplos pontos, agora otimizada.
 * @param {Array<{latitude: number, longitude: number}>} points - Uma lista de objetos de ponto.
 * @param {Object|null} startCoords - As coordenadas de partida {latitude, longitude}. Se nulo, usa a localização atual do usuário.
 * @returns {string|null} A URL do Google Maps ou null se não houver pontos.
 */
export function generateOptimizedRouteUrl(points, startCoords = null) {
  if (!points || points.length === 0) {
    return null;
  }

  // Se não houver ponto de partida, a otimização não é possível da mesma forma.
  // Nesse caso, o Google Maps usará a localização atual e otimizará a partir dela.
  const originCoords = startCoords || { latitude: 0, longitude: 0 }; // Usamos 0,0 como placeholder se não houver startCoords
  
  const sortedPoints = startCoords ? sortPointsByProximity(points, originCoords) : points;

  const destination = sortedPoints[sortedPoints.length - 1];
  const destinationStr = `${destination.latitude},${destination.longitude}`;

  const waypoints = sortedPoints.slice(0, -1);
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