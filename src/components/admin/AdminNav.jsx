import { NavLink } from 'react-router-dom';
import { Package, ShoppingCart, Users, Tag, DollarSign, Map, Settings, FileText, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const links = [
  {
    section: 'Pedidos',
    items: [
      { to: '/admin/orders', label: 'Gerenciar Pedidos', icon: ShoppingCart },
      { to: '/admin/pipeline', label: 'Pipeline de Instalação', icon: LayoutGrid },
    ]
  },
  {
    section: 'Pontos',
    items: [
      { to: '/admin/points', label: 'Gerenciar Pontos', icon: Package },
      { to: '/admin/tags', label: 'Gerenciar Tags', icon: Tag },
      { to: '/admin/pricing', label: 'Níveis de Preço', icon: DollarSign },
    ]
  },
  {
    section: 'Usuários',
    items: [
      { to: '/admin/users', label: 'Gerenciar Usuários', icon: Users },
    ]
  },
  {
    section: 'Configurações',
    items: [
      { to: '/admin/map-settings', label: 'Ajustes do Mapa', icon: Map },
    ]
  },
];

export function AdminNav() {
  return (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
      {links.map((section, sectionIndex) => (
        <div key={section.section} className="space-y-2">
          <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {section.section}
          </h3>
          {section.items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent',
                  isActive && 'bg-accent text-primary'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          {sectionIndex < links.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </nav>
  );
}