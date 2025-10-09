import { Outlet } from 'react-router-dom';
import Header from './Header';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20"> {/* Adiciona padding no topo igual à altura do header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}