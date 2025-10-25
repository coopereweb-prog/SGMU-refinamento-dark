import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner'; // Importar toast

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/quem-somos', label: 'Quem Somos' },
  { to: '/nossos-servicos', label: 'Nossos Serviços' },
  { to: '/como-adquirir', label: 'Como Adquirir' },
  { to: '/trabalhe-conosco', label: 'Trabalhe Conosco' },
  { to: '/fale-conosco', label: 'Fale Conosco' },
];

export function Header() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      // Limpa o localStorage do carrinho pendente, se houver
      localStorage.removeItem('pendingReservationCart');
      
      toast.success('Sessão encerrada com sucesso.');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Falha ao sair', { description: 'Não foi possível encerrar a sessão. Tente novamente.' });
    }
  };

  const getDashboardPath = () => {
    if (!profile) return '/';
    const role = profile.role;
    if (role === 'admin' || role === 'operations_manager') return '/admin';
    if (role === 'client') return '/dashboard';
    if (role === 'field_technician') return '/technician-panel';
    return '/';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`;
    return name.substring(0, 2);
  };

  return (
    <header className="bg-black/40 shadow-lg sticky top-0 z-50 h-16 sm:h-20 flex-shrink-0 print:hidden">
      <div className="container mx-auto px-4 h-full">
        <div className="grid grid-cols-3 items-center h-full">
          {/* Coluna Esquerda: Menu */}
          <div className="justify-self-start">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 w-10 p-0 flex items-center justify-center">
                  <Menu className="h-8 w-8" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 border-none flex flex-col bg-card">
                <SheetHeader className="p-4 pb-2 border-b">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-4 space-y-2">
                  {navLinks.map(({ to, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-lg ${isActive ? 'bg-accent text-primary font-semibold' : 'text-muted-foreground hover:bg-accent'}`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Coluna Central: Logo e Título */}
          <Link to={user && profile ? getDashboardPath() : '/'} className="flex items-center space-x-3 justify-self-center">
            <img 
              className="h-12 w-auto" 
              src="/logo.png" 
              alt="SGMU Logo" 
            />
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground leading-tight">
                <span className="font-semibold">Sistema Gestor</span><br />de Mobiliário Urbano
              </p>
            </div>
          </Link>

          {/* Coluna Direita: Ações do Usuário */}
          <nav className="flex items-center justify-self-end">
            {authLoading ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full sm:h-9 sm:w-9">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.name || 'User'} />
                      <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" className="h-10 w-10 p-0 flex items-center justify-center overflow-hidden">
                <Link to="/login" aria-label="Área Restrita">
                  <UserIcon className="h-12 w-12" />
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}