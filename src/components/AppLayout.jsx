import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User, Shield, Map, Tag, Users } from 'lucide-react';

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { profile } = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isAdmin = profile?.role === 'admin';

  const navLinks = [
    { to: "/", text: "Home", icon: Map },
    ...(isAdmin ? [{ to: "/admin", text: "Admin", icon: Shield }] : []),
    ...(user ? [{ to: "/dashboard", text: "Dashboard", icon: User }] : []),
  ];

  const adminLinks = [
    { to: "/admin/points", text: "Gerenciar Pontos", icon: Map },
    { to: "/admin/tags", text: "Gerenciar Tags", icon: Tag },
    { to: "/admin/users", text: "Gerenciar Usuários", icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="text-xl font-bold">SGMU</Link>
          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map(link => (
              <Button key={link.to} asChild variant="ghost">
                <Link to={link.to}>{link.text}</Link>
              </Button>
            ))}
            {user ? (
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            ) : (
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </nav>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4">
                  {navLinks.map(link => (
                    <Button key={link.to} asChild variant="ghost" className="justify-start">
                      <Link to={link.to}><link.icon className="mr-2 h-4 w-4" />{link.text}</Link>
                    </Button>
                  ))}
                  {isAdmin && (
                    <>
                      <hr/>
                      <h3 className="font-semibold px-4">Admin</h3>
                      {adminLinks.map(link => (
                         <Button key={link.to} asChild variant="ghost" className="justify-start">
                           <Link to={link.to}><link.icon className="mr-2 h-4 w-4" />{link.text}</Link>
                         </Button>
                      ))}
                    </>
                  )}
                  <hr/>
                  {user ? (
                    <Button onClick={handleSignOut} variant="outline" className="justify-start">
                      <LogOut className="mr-2 h-4 w-4" /> Sair
                    </Button>
                  ) : (
                    <Button asChild className="justify-start">
                      <Link to="/login"><User className="mr-2 h-4 w-4" />Login</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}