import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

function Header() {
  const { session } = useAuth();
  const { profile } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-sm text-white h-16">
      {/* Menu (à esquerda em telas pequenas) */}
      <div className="flex items-center">
        <button 
          onClick={toggleMenu}
          className="md:hidden mr-3 p-1 rounded-md hover:bg-white/10"
          aria-label="Abrir menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Menu de navegação para mobile */}
        {isMenuOpen && (
          <nav className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md p-4 md:hidden">
            <ul className="space-y-3">
              <li><Link to="/" className="block py-2 hover:text-primary" onClick={toggleMenu}>Mapa Interativo</Link></li>
              {session && (
                <li><Link to="/dashboard" className="block py-2 hover:text-primary" onClick={toggleMenu}>Meu Painel</Link></li>
              )}
            </ul>
          </nav>
        )}
        
        {/* Menu de navegação para desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-primary transition-colors">Mapa Interativo</Link>
          {session && (
            <Link to="/dashboard" className="hover:text-primary transition-colors">Meu Painel</Link>
          )}
        </nav>
      </div>

      {/* Logo e Frase (centro) */}
      <div className="flex flex-col items-center absolute left-1/2 transform -translate-x-1/2">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="SGMU Logo" className="h-10" />
          <span className="text-lg font-bold hidden sm:inline">SGMU</span>
        </Link>
        <p className="text-xs text-gray-300 mt-1 hidden sm:block">Publicidade em Saquinhos de Pão</p>
      </div>

      {/* Botão de Área Restrita (à direita) */}
      <div className="flex items-center">
        {session ? (
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-sm text-gray-300">
              Olá, {profile?.name?.split(' ')[0] || 'Usuário'}
            </span>
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline" 
              size="sm"
              className="bg-transparent border-primary text-primary hover:bg-primary hover:text-black text-xs h-8"
            >
              <User className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Painel</span>
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => navigate('/login')} 
            variant="outline" 
            size="sm"
            className="bg-transparent border-primary text-primary hover:bg-primary hover:text-black text-xs h-8"
          >
            <User className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Área Restrita</span>
          </Button>
        )}
      </div>
    </header>
  );
}

export default Header;