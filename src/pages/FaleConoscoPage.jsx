import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

function FaleConoscoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefone',
      details: ['(19) 99999-9999', '(19) 99999-9998'],
      description: 'Segunda a Sexta, 8h às 18h'
    },
    {
      icon: Mail,
      title: 'E-mail',
      details: ['contato@sgmu.com.br', 'suporte@sgmu.com.br'],
      description: 'Respondemos em até 24 horas'
    },
    {
      icon: MapPin,
      title: 'Endereço',
      details: ['Rua Treze de Maio, 712', 'Nova Odessa - SP', 'CEP: 13380-000'],
      description: 'Visitas mediante agendamento'
    },
    {
      icon: Clock,
      title: 'Horário de Atendimento',
      details: ['Segunda a Sexta: 8h às 18h', 'Sábado: 8h às 12h', 'Domingo: Fechado'],
      description: 'Atendimento presencial e remoto'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, subject: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você implementaria o envio do formulário
    toast.success('Mensagem enviada com sucesso!', {
      description: 'Entraremos em contato em breve.'
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Fale Conosco</h1>
        <p className="text-xl text-muted-foreground">
          Estamos aqui para ajudar. Entre em contato conosco!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{info.title}</h4>
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-muted-foreground">{detail}</p>
                      ))}
                      <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Siga-nos nas redes sociais para ficar por dentro das novidades e atualizações.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="sm">
                  Facebook
                </Button>
                <Button variant="outline" size="sm">
                  Instagram
                </Button>
                <Button variant="outline" size="sm">
                  LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Envie sua Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Select value={formData.subject} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um assunto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suporte">Suporte Técnico</SelectItem>
                      <SelectItem value="vendas">Informações de Vendas</SelectItem>
                      <SelectItem value="parceria">Parcerias</SelectItem>
                      <SelectItem value="reclamacao">Reclamações</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Digite sua mensagem aqui..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Como posso acompanhar meu pedido?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Acesse sua conta no painel do cliente para acompanhar o status do seu pedido em tempo real.
              </p>

              <h4 className="font-semibold mb-2">Preciso de ajuda técnica?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Nossa equipe de suporte está disponível por telefone, e-mail ou chat online durante o horário comercial.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Como alterar meus dados cadastrais?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Acesse seu perfil no painel do cliente e atualize suas informações a qualquer momento.
              </p>

              <h4 className="font-semibold mb-2">Posso visitar as instalações?</h4>
              <p className="text-sm text-muted-foreground">
                Agende uma visita através do nosso telefone ou e-mail. Adoramos receber visitantes!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FaleConoscoPage;