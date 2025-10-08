import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Tag, ShoppingCart, ArrowRight, DollarSign, SlidersHorizontal } from 'lucide-react';

export function AdminPage() {
  const navItems = [
    {
      title: 'Gerenciar Pedidos',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-6 w-6 text-gray-500" />,
      description: 'Visualize e gerencie todos os pedidos dos clientes.'
    },
    {
      title: 'Gerenciar Pontos',
      href: '/admin/points',
      icon: <MapPin className="h-6 w-6 text-gray-500" />,
      description: 'Adicione, edite ou remova pontos de instalação no mapa.'
    },
    {
      title: 'Gerenciar Níveis de Preço',
      href: '/admin/pricing',
      icon: <DollarSign className="h-6 w-6 text-gray-500" />,
      description: 'Defina as classificações e preços (Ouro, Prata, Bronze).'
    },
    {
      title: 'Gerenciar Tags',
      href: '/admin/tags',
      icon: <Tag className="h-6 w-6 text-gray-500" />,
      description: 'Crie e edite tags para categorizar os pontos.'
    },
    {
      title: 'Gerenciar Usuários',
      href: '/admin/users',
      icon: <Users className="h-6 w-6 text-gray-500" />,
      description: 'Convide, edite e remova usuários do sistema.'
    },
    {
      title: 'Ajustes do Mapa',
      href: '/admin/map-settings',
      icon: <SlidersHorizontal className="h-6 w-6 text-gray-500" />,
      description: 'Configure o agrupamento de pontos e o comportamento do zoom.'
    }
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Painel do Administrador</h1>
      <p className="text-gray-600">Selecione uma das opções abaixo para começar.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {navItems.map((item) => (
          <Link to={item.href} key={item.title} className="group">
            <Card className="hover:border-primary transition-all duration-200 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">{item.title}</CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-500">{item.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                <div className="text-sm font-medium text-primary flex items-center group-hover:gap-2 transition-all duration-200">
                  Acessar <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}