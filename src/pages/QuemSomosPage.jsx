import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Eye, Award } from 'lucide-react';

function QuemSomosPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Quem Somos</h1>
        <p className="text-xl text-muted-foreground">
          Conheça nossa história e compromisso com a gestão de mobiliário urbano
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              Nossa Missão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Facilitar a gestão e comercialização de espaços publicitários em mobiliário urbano,
              conectando anunciantes com pontos estratégicos de visibilidade na cidade.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Nossa Visão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Ser a plataforma líder em gestão de mobiliário urbano, promovendo publicidade
              responsável e contribuindo para o desenvolvimento urbano sustentável.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Nossa História
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Fundada em 2024, a SGMU (Sistema de Gestão de Mobiliário Urbano) nasceu da necessidade
            de modernizar e otimizar a gestão de espaços publicitários em mobiliário urbano.
          </p>
          <p className="text-muted-foreground mb-4">
            Com o crescimento das cidades e a demanda por publicidade eficaz, identificamos a
            oportunidade de criar uma plataforma digital que conectasse proprietários de mobiliário
            urbano com anunciantes interessados em pontos estratégicos de visibilidade.
          </p>
          <p className="text-muted-foreground">
            Nossa equipe é composta por profissionais experientes em tecnologia, marketing e
            gestão urbana, comprometidos em oferecer soluções inovadoras e sustentáveis.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            Nossos Valores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Transparência</Badge>
              <p className="text-sm text-muted-foreground">Operações claras e honestas</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Inovação</Badge>
              <p className="text-sm text-muted-foreground">Tecnologia de ponta para soluções modernas</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Sustentabilidade</Badge>
              <p className="text-sm text-muted-foreground">Práticas responsáveis com o meio ambiente</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Colaboração</Badge>
              <p className="text-sm text-muted-foreground">Parceria com comunidades locais</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Excelência</Badge>
              <p className="text-sm text-muted-foreground">Compromisso com a qualidade</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Ética</Badge>
              <p className="text-sm text-muted-foreground">Princípios éticos em todas as ações</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuemSomosPage;