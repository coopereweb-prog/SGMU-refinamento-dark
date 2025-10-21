import React from 'react';
import { LayoutGrid, Tv, Wind, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

function MobiliarioUrbanoPage() {
  return (
    <div className="p-8 bg-card text-foreground rounded-lg shadow-md space-y-8">
      <h1 className="text-4xl font-bold mb-4 flex items-center">
        <LayoutGrid className="h-8 w-8 mr-3 text-primary" /> Nosso Mobiliário Urbano
      </h1>
      <p className="text-lg text-muted-foreground">
        Oferecemos uma variedade de soluções de publicidade em mobiliário urbano, garantindo alta visibilidade e impacto para sua marca nas áreas de maior fluxo da cidade.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <MapPin className="h-6 w-6 mr-2 text-primary" /> Painéis Estáticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Placas tradicionais de alta durabilidade, ideais para campanhas de longo prazo e consolidação de marca.
            </p>
            <Link to="/nossos-servicos" className="text-sm font-semibold text-blue-500 hover:underline">
              Ver mais detalhes
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Wind className="h-6 w-6 mr-2 text-primary" /> Outdoors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              A mídia de maior formato e impacto, posicionada estrategicamente em vias de grande circulação.
            </p>
            <Link to="/outdoors" className="text-sm font-semibold text-blue-500 hover:underline">
              Ver condições de contratação
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Tv className="h-6 w-6 mr-2 text-primary" /> Painéis de LED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Soluções digitais dinâmicas para vídeos e animações, vendidas por cotas de tempo de exibição.
            </p>
            <Link to="/led-panels" className="text-sm font-semibold text-blue-500 hover:underline">
              Consultar cotas
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <p className="text-sm text-muted-foreground pt-4">
        Para iniciar sua campanha, explore nosso mapa interativo na página inicial.
      </p>
    </div>
  );
}

export default MobiliarioUrbanoPage;