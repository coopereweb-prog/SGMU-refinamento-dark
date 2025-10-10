import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, MapPin, Briefcase, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

function TrabalheConoscoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    message: ''
  });

  const positions = [
    {
      title: 'Técnico de Campo',
      type: 'Presencial',
      location: 'Nova Odessa - SP',
      description: 'Responsável pela instalação e manutenção de placas publicitárias em pontos de mobiliário urbano.',
      requirements: ['Experiência em instalação', 'CNH categoria B', 'Disponibilidade para trabalho externo']
    },
    {
      title: 'Desenvolvedor Frontend',
      type: 'Remoto/Híbrido',
      location: 'Nova Odessa - SP',
      description: 'Desenvolvimento de interfaces web modernas usando React e tecnologias relacionadas.',
      requirements: ['React.js', 'JavaScript/TypeScript', 'CSS/Tailwind', 'Git']
    },
    {
      title: 'Analista de Marketing Digital',
      type: 'Remoto',
      location: 'Remoto',
      description: 'Gestão de campanhas publicitárias e análise de performance de pontos de exposição.',
      requirements: ['Google Analytics', 'SEO/SEM', 'Redes sociais', 'Análise de dados']
    },
    {
      title: 'Suporte ao Cliente',
      type: 'Remoto/Híbrido',
      location: 'Nova Odessa - SP',
      description: 'Atendimento e suporte aos clientes que utilizam nossa plataforma.',
      requirements: ['Excelente comunicação', 'Experiência em atendimento', 'Conhecimento em vendas']
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você implementaria o envio do formulário
    toast.success('Candidatura enviada com sucesso!', {
      description: 'Entraremos em contato em breve.'
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      message: ''
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Trabalhe Conosco</h1>
        <p className="text-xl text-muted-foreground">
          Faça parte da nossa equipe e ajude a transformar a publicidade urbana
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Por que trabalhar conosco?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Ambiente de trabalho inovador e dinâmico
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Oportunidades de crescimento profissional
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Trabalho com tecnologias de ponta
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Contribuição para o desenvolvimento urbano sustentável
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Benefícios competitivos e remuneração atrativa
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nossa Cultura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Valorizamos a inovação, a colaboração e o compromisso com resultados.
                Buscamos profissionais apaixonados por tecnologia e pelo impacto positivo
                que nossas soluções podem gerar nas cidades.
              </p>
              <p className="text-muted-foreground">
                Oferecemos um ambiente de trabalho flexível, com oportunidades de aprendizado
                contínuo e desenvolvimento de carreira.
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Vagas Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{position.title}</h4>
                      <Badge variant="outline">{position.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      {position.location}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{position.description}</p>
                    <div>
                      <h5 className="text-sm font-medium mb-1">Requisitos:</h5>
                      <ul className="text-sm text-muted-foreground">
                        {position.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-current rounded-full flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-6 w-6" />
            Envie sua Candidatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Não encontrou a vaga ideal? Envie seu currículo e nos conte um pouco sobre você.
            Estamos sempre em busca de talentos para nossa equipe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Vaga de Interesse</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Ex: Desenvolvedor Frontend"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Conte-nos um pouco sobre você, sua experiência e por que gostaria de trabalhar conosco..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Enviar Candidatura
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default TrabalheConoscoPage;