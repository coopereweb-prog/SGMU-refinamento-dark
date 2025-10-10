import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, BarChart3, Users, Shield, Clock, CheckCircle } from 'lucide-react';

function NossosServicosPage() {
  const services = [
    {
      icon: MapPin,
      title: 'Mapeamento de Pontos',
      description: 'Identificação e catalogação completa de todos os pontos de mobiliário urbano disponíveis para publicidade.',
      features: ['Geolocalização precisa', 'Fotos de alta qualidade', 'Informações detalhadas']
    },
    {
      icon: BarChart3,
      title: 'Gestão de Reservas',
      description: 'Sistema completo para reserva e gestão de pontos publicitários com controle de disponibilidade em tempo real.',
      features: ['Reserva online', 'Controle de expiração', 'Notificações automáticas']
    },
    {
      icon: Users,
      title: 'Painel Administrativo',
      description: 'Ferramentas completas para administradores gerenciarem pontos, usuários e pedidos de forma eficiente.',
      features: ['Dashboard intuitivo', 'Relatórios detalhados', 'Controle de usuários']
    },
    {
      icon: Shield,
      title: 'Segurança e Privacidade',
      description: 'Proteção total dos dados dos usuários e garantia de transações seguras.',
      features: ['Criptografia de dados', 'Autenticação segura', 'Conformidade com LGPD']
    },
    {
      icon: Clock,
      title: 'Suporte Especializado',
      description: 'Equipe dedicada para auxiliar clientes e administradores em todas as etapas do processo.',
      features: ['Suporte técnico', 'Consultoria especializada', 'Treinamento personalizado']
    },
    {
      icon: CheckCircle,
      title: 'Instalação e Manutenção',
      description: 'Serviços completos de instalação e manutenção de placas publicitárias nos pontos contratados.',
      features: ['Instalação profissional', 'Manutenção preventiva', 'Relatórios fotográficos']
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nossos Serviços</h1>
        <p className="text-xl text-muted-foreground">
          Soluções completas para gestão e comercialização de mobiliário urbano
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {services.map((service, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <service.icon className="h-8 w-8 text-primary" />
                {service.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{service.description}</p>
              <div className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Por que escolher nossos serviços?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Para Anunciantes</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Acesso a pontos estratégicos de alta visibilidade</li>
                <li>• Processo de reserva simples e rápido</li>
                <li>• Controle total sobre campanhas publicitárias</li>
                <li>• Relatórios de performance e impacto</li>
                <li>• Suporte dedicado durante toda a campanha</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Para Administradores</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Gestão centralizada de todos os pontos</li>
                <li>• Controle de usuários e permissões</li>
                <li>• Relatórios financeiros e operacionais</li>
                <li>• Automação de processos administrativos</li>
                <li>• Suporte técnico especializado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NossosServicosPage;