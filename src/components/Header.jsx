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
      <Link to="/" className="text-2xl font-bold">
        Publicidade em <span className="text-primary">Saquinhos de Pão</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-4">
        <NavLink to="/" className={({ isActive }) => isActive ? "text-primary" : "hover:text-primary"}>Início</NavLink>
        {session && (
          <NavLink to={getDashboardPath()} className={({ isActive }) => isActive ? "text-primary" : "hover:text-primary"}>
            Meu Painel
          </NavLink>
        )}
      </nav>
      <div className="flex items-center space-x-2">
        {session ? (
          <>
            <Button onClick={() => navigate(getDashboardPath())} variant="ghost" size="icon" className="hover:bg-white/20">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="icon" className="hover:bg-white/20">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button onClick={() => navigate('/login')} variant="ghost" className="hover:bg-white/20">
            <User className="mr-2 h-4 w-4" />
            Entrar
          </Button>
        )}
      </div>
    </header>
  );
}

export default Header;