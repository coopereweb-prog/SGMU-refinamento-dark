import { NavLink } from 'react-router-dom';
import { Package, ShoppingCart, Users, Tag, DollarSign, Map, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/points', label: 'Pontos', icon: Package },
  { to: '/admin/users', label: 'Usuários', icon: Users },
  { to: '/admin/tags', label: 'Tags', icon: Tag },
  { to: '/admin/pricing', label: 'Níveis de Preço', icon: DollarSign },
  { to: '/admin/map-settings', label: 'Ajustes do Mapa', icon: Map },
];

export function AdminNav() {
  return (
    <nav className="grid items-start gap-2 text-sm font-medium">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive && 'bg-muted text-primary'
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}