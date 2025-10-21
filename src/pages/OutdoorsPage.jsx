import React from 'react';
import { Wind } from 'lucide-react';

function OutdoorsPage() {
  return (
    <div className="p-8 bg-card text-foreground rounded-lg shadow-md space-y-6">
      <h1 className="text-4xl font-bold mb-4 flex items-center">
        <Wind className="h-8 w-8 mr-3 text-primary" /> Outdoors
      </h1>
      <p className="text-lg">
        Os Outdoors são a mídia de maior impacto visual e alcance em áreas urbanas. Eles garantem que sua mensagem seja vista por milhares de pessoas diariamente.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Características Principais</h2>
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li><strong>Alta Visibilidade:</strong> Posicionamento estratégico em vias de grande fluxo.</li>
          <li><strong>Impacto 24h:</strong> Exposição contínua, dia e noite.</li>
          <li><strong>Flexibilidade de Período:</strong> Contrate por 1, 2, 3, 4 ou 5 anos.</li>
          <li><strong>Material:</strong> Placa estática de alta durabilidade.</li>
        </ul>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Para mais detalhes sobre a contratação e instalação, entre em contato com nossa equipe.
      </p>
    </div>
  );
}

export default OutdoorsPage;