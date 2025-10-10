import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 pt-16 sm:pt-20">
        <Outlet />
      </main>
    </div>
  );
}