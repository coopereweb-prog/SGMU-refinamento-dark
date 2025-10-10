import { Outlet } from 'react-router-dom';
import { AdminNav } from './AdminNav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        {/* --- Barra Lateral para Desktop --- */}
        <div className="hidden border-r bg-card md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-lg">Painel Administrativo</span>
              </div>
            </div>
            <div className="flex-1">
              <AdminNav />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col">
          {/* --- Cabeçalho para Mobile --- */}
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-[300px] p-0">
                <div className="flex h-14 items-center border-b px-4">
                  <span className="text-lg font-semibold">Menu Admin</span>
                </div>
                <div className="pt-2">
                  <AdminNav />
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="flex-1 text-lg font-semibold text-center">Painel Admin</h1>
          </header>

          {/* --- Conteúdo Principal --- */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}