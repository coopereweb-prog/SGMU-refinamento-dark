import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, ShoppingCart, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

function ComoAdquirirPage() {
  const steps = [
    {
      icon: Search,
      title: 'Explore o Mapa',
      description: 'Navegue pelo mapa interativo e encontre pontos de mobiliário urbano disponíveis para publicidade.',
      details: 'Use filtros para encontrar pontos por localização, tipo ou características específicas.'
    },
    {
      icon: MapPin,
      title: 'Selecione os Pontos',
      description: 'Clique nos pontos de interesse e visualize detalhes como localização, preços e disponibilidade.',
      details: 'Compare opções e escolha os pontos que melhor atendem às suas necessidades de campanha.'
    },
    {
      icon: ShoppingCart,
      title: 'Adicione ao Carrinho',
      description: 'Selecione o período desejado e adicione os pontos ao seu carrinho de compras.',
      details: 'Você pode escolher períodos de 1 a 5 anos para cada ponto selecionado.'
    },
    {
      icon: CreditCard,
      title: 'Finalize a Reserva',
      description: 'Preencha seus dados e confirme a reserva. Você terá 48 horas para efetuar o pagamento.',
      details: 'Após a confirmação, nossa equipe entrará em contato para dar continuidade ao processo.'
    },
    {
      icon: CheckCircle,
      title: 'Instalação e Ativação',
      description: 'Após o pagamento, agendamos a instalação da sua publicidade nos pontos contratados.',
      details: 'Acompanhe o processo através do seu painel e receba relatórios fotográficos da instalação.'
    }
  ];

  const pricingInfo = [
    { tier: 'Bronze', description: 'Pontos de entrada com boa visibilidade', price: 'A partir de R$ 500/ano' },
    { tier: 'Prata', description: 'Pontos estratégicos com alto fluxo', price: 'A partir de R$ 800/ano' },
    { tier: 'Ouro', description: 'Pontos premium com máxima exposição', price: 'A partir de R$ 1.200/ano' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Como Adquirir</h1>
        <p className="text-xl text-muted-foreground">
          Processo simples e transparente para adquirir espaços publicitários
        </p>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Passos para Adquirir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground mb-2">{step.description}</p>
                    <p className="text-sm text-muted-foreground">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Níveis de Preço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingInfo.map((tier, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{tier.tier}</h4>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                    <Badge variant="secondary">{tier.price}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Prazo de Reserva</h4>
                  <p className="text-sm text-muted-foreground">
                    Suas reservas têm validade de 48 horas. Após esse período, os pontos voltam a ficar disponíveis.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Garantia de Qualidade</h4>
                  <p className="text-sm text-muted-foreground">
                    Todos os pontos são verificados e mantidos em perfeitas condições para máxima visibilidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/">
                <MapPin className="mr-2 h-5 w-5" />
                Explorar Pontos Disponíveis
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dúvidas Frequentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Posso cancelar uma reserva?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Sim, você pode cancelar uma reserva antes do pagamento. Após o pagamento, entre em contato conosco.
              </p>

              <h4 className="font-semibold mb-2">Como funciona a instalação?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Nossa equipe especializada cuida de toda a instalação, garantindo qualidade e segurança.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Há taxas adicionais?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Os preços exibidos incluem instalação e manutenção básica. Taxas extras podem aplicar para customizações.
              </p>

              <h4 className="font-semibold mb-2">Como acompanho minha campanha?</h4>
              <p className="text-sm text-muted-foreground">
                Através do seu painel, você pode acompanhar o status da instalação e receber relatórios periódicos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComoAdquirirPage;