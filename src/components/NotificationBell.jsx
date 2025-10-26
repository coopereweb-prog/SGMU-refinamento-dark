import { useState } from 'react';
import { Bell, Loader2, CheckCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { user } = useAuth();
  const { profile } = useUser();
  const { notifications, loading, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user || profile?.role === 'admin' || profile?.role === 'operations_manager' || profile?.role === 'field_technician') {
    // Apenas clientes (ou usuários sem perfil carregado) recebem notificações por enquanto
    return null;
  }

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setIsMenuOpen(false);
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
          <Bell className="h-5 w-5 text-primary" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background bg-destructive" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-bold flex justify-between items-center">
          Notificações
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount} não lida(s)</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
        ) : notifications.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center">Nenhuma notificação.</p>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                className={cn(
                  "flex flex-col items-start space-y-1 p-3 h-auto cursor-pointer",
                  !n.is_read && "bg-accent/50 hover:bg-accent"
                )}
                onSelect={() => handleNotificationClick(n)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {n.title}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{n.message}</p>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}