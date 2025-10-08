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
import { LayoutDashboard, LogOut, User as UserIcon, LogIn } from 'lucide-react';
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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-16 md:h-20 lg:h-20">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0">
            <img 
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto transition-all duration-200 ease-in-out self-center mt-1" 
              src="/logo.png" 
              alt="SGMU Logo" 
            />
            <div className="min-w-0 self-center">
              <span className="font-bold text-lg sm:text-xl md:text-2xl text-gray-800 tracking-tight block">
                SGMU
              </span>
              <p className="text-xs sm:text-sm text-gray-500 leading-tight whitespace-normal">
                Sistema de Gestão de <br className="sm:hidden" /> Mobiliário Urbano
              </p>
            </div>
          </Link>
          <nav className="flex items-center flex-shrink-0 ml-2 self-center">
            {authLoading ? (
              <Skeleton className="h-8 w-20 rounded-md" />
            ) : user ? (
              <>
                <p className="text-sm text-muted-foreground mr-4 hidden sm:block truncate" title={user.email}>
                  {user.email}
                </p>
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
              </>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
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