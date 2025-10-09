import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

function Header() {
  const { session, signOut } = useAuth();
  const { profile } = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!profile) return '/login';
    switch (profile.role) {
      case 'admin':
      case 'operations_manager':
        return '/admin';
      case 'field_technician':
        return '/technician-panel';
      case 'client':
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-4 md:px-6 bg-black/75 backdrop-blur-sm text-white">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="SGMU Logo" className="h-12" />
        <span className="text-xl font-bold hidden sm:inline">SGMU</span>
      </Link>
      
      <div className="flex-1 flex justify-center">
        <nav className="hidden md:flex items-center space-x-6 text-lg">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-primary font-semibold" : "hover:text-primary transition-colors"}>
            Mapa Interativo
          </NavLink>
          {session && (
            <NavLink to={getDashboardPath()} className={({ isActive }) => isActive ? "text-primary font-semibold" : "hover:text-primary transition-colors"}>
              Meu Painel
            </NavLink>
          )}
        </nav>
      </div>

      <div className="flex items-center space-x-2">
        {session ? (
          <>
            <span className="hidden lg:inline text-sm text-gray-300">
              Olá, {profile?.name?.split(' ')[0] || 'Usuário'}
            </span>
            <Button onClick={() => navigate(getDashboardPath())} variant="ghost" size="icon" className="hover:bg-white/20" aria-label="Painel">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="icon" className="hover:bg-white/20" aria-label="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button onClick={() => navigate('/login')} variant="outline" className="bg-transparent border-primary text-primary hover:bg-primary hover:text-black">
            <User className="mr-2 h-4 w-4" />
            Área Restrita
          </Button>
        )}
      </div>
    </header>
  );
}

export default Header;