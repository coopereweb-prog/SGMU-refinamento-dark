import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Importa o cliente Supabase

function Header() {
  const { profile, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut(); // Adiciona a chamada para encerrar a sessão
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Lado esquerdo: Logo e Título */}
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img 
                src="/logo.png" // Usando o logo da pasta public
                alt="Logomarca do SGUM" 
                className="h-12 w-auto"
              />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">SGUM</h1>
              <p className="text-xs text-gray-500">Sistema de Gestão de mobiliário Urbano</p>
            </div>
          </div>
          
          {/* Lado direito: Botão de Login/Logout */}
          <div>
            {loading ? (
              <span className="text-sm text-gray-500">Carregando...</span>
            ) : profile ? (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Área Restrita
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;