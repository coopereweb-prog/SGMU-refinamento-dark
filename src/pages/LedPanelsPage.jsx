import React from 'react';
import { Tv } from 'lucide-react';

function LedPanelsPage() {
  return (
    <div className="p-8 bg-card text-foreground rounded-lg shadow-md space-y-6">
      <h1 className="text-4xl font-bold mb-4 flex items-center">
        <Tv className="h-8 w-8 mr-3 text-primary" /> Painéis de LED
      </h1>
      <p className="text-lg">
        Os Painéis de LED oferecem dinamismo e modernidade, permitindo a exibição de vídeos, animações e mensagens que mudam em tempo real.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Características Principais</h2>
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li><strong>Conteúdo Dinâmico:</strong> Ideal para campanhas que exigem movimento e atualização.</li>
          <li><strong>Brilho Intenso:</strong> Excelente visibilidade mesmo sob luz solar direta.</li>
          <li><strong>Venda por Cota:</strong> A contratação é feita por cotas de tempo de exibição.</li>
          <li><strong>Localização Premium:</strong> Instalados nos pontos mais movimentados da cidade.</li>
        </ul>
      </div>
      
      <p className="text-sm text-muted-foreground">
        A contratação de cotas para Painéis de LED é personalizada. Por favor, entre em contato para receber uma proposta detalhada.
      </p>
    </div>
  );
}

export default LedPanelsPage;