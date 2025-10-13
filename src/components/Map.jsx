import React from 'react';

// Este é um componente de mapa de espaço reservado.
// A funcionalidade real do mapa (por exemplo, com Leaflet ou Google Maps) pode ser adicionada aqui.
export function Map({ points, selectedPoint }) {
  return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <h2 className="text-2xl font-bold">Mapa</h2>
        <p>O componente do mapa será renderizado aqui.</p>
        {selectedPoint && (
          <div className="mt-4 p-2 bg-white rounded-lg shadow">
            <p className="font-bold">Ponto Selecionado: {selectedPoint.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}