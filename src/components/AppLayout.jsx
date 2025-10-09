import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      {/* 
        A classe `pt-16 sm:pt-20` adiciona um espaçamento no topo do conteúdo 
        equivalente à altura do cabeçalho, para que o conteúdo não comece escondido atrás dele.
      */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 pt-16 sm:pt-20">
        <Outlet />
      </main>
    </div>
  );
}