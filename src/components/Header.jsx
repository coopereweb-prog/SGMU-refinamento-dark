import { Link, useNavigate } from 'react-router-dom';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, LogOut, User as UserIcon, LogIn, Menu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile } = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!profile) return '/';
    const role = profile.role;
    if (role === 'admin' || role === 'operations_manager') {
      return '/admin';
    }
    if (role === 'client') {
      return '/dashboard';
    }
    if (role === 'field_technician') {
      return '/technician-panel';
    }
    return '/';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const menuItems = [
    { to: '/', label: 'Início' },
    { to: '/quem-somos', label: 'Quem Somos' },
    { to: '/nossos-servicos', label: 'Nossos Serviços' },
    { to: '/como-adquirir', label: 'Como Adquirir' },
    { to: '/trabalhe-conosco', label: 'Trabalhe conosco' },
    { to: '/fale-conosco', label: 'Fale conosco' },
  ];

  return (
    <header className="bg-black/40 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-16 sm:h-20">
          {/* Coluna Esquerda: Menu Principal e E-mail do usuário */}
          <div className="justify-self-start flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 w-10 p-0 flex items-center justify-center">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {menuItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            {authLoading ? (
              <Skeleton className="h-6 w-32 rounded-md hidden sm:block" />
            ) : user ? (
              <p className="text-sm text-muted-foreground hidden sm:block truncate" title={user.email}>
                {user.email}
              </p>
            ) : null}
          </div>

          {/* Coluna Central: Logo e Título */}
          <Link to={user && profile ? getDashboardPath() : '/'} className="flex items-center space-x-2 sm:space-x-3 justify-self-center">
            <img 
              className="h-10 sm:h-12 md:h-14 w-auto" 
              src="/logo.png" 
              alt="SGMU Logo" 
            />
            <div className="hidden sm:block">
              <span className="font-bold text-lg sm:text-xl md:text-2xl text-foreground tracking-tight block">
                SGMU
              </span>
              <p className="text-xs text-muted-foreground leading-tight">
                <span className="font-semibold">Sistema Gestor</span> de Mobiliário Urbano
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
                    <LayoutDashboard className="mr-2 h-6 w-6" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                    <UserIcon className="mr-2 h-6 w-6" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-6 w-6" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-6 w-6" />
                  Área Restrita
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}