import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

export function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for auth events
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case 'SIGNED_IN':
          toast.success('Bem-vindo!', {
            description: 'Você foi autenticado com sucesso no sistema.'
          });
          break;
        case 'SIGNED_OUT':
          toast.info('Até logo!', {
            description: 'Você saiu da sua conta com sucesso.'
          });
          break;
        case 'PASSWORD_RECOVERY':
          toast.info('Recuperação de senha', {
            description: 'Siga as instruções enviadas para seu e-mail.'
          });
          break;
      }
    });

    // Listen for order changes (this would require setting up realtime subscriptions)
    // For now, we'll just show static notifications
    const showOrderNotifications = () => {
      // These would be triggered by actual order events in a real implementation
      // For now, we'll just define the notification functions
    };

    showOrderNotifications();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Function to show order creation notification
  const showOrderCreatedNotification = (orderId) => {
    toast.success('Pedido criado com sucesso!', {
      description: `Seu pedido #${orderId.substring(0, 8)} foi registrado. Verifique seu e-mail para mais detalhes.`,
      duration: 10000
    });
  };

  // Function to show order modification notification
  const showOrderModifiedNotification = (orderId) => {
    toast.success('Pedido modificado!', {
      description: `Seu pedido #${orderId.substring(0, 8)} foi atualizado com sucesso.`,
      duration: 8000
    });
  };

  // Function to show account creation notification
  const showAccountCreatedNotification = () => {
    toast.success('Conta criada com sucesso!', {
      description: 'Sua conta foi criada. Um e-mail de confirmação foi enviado.',
      duration: 10000
    });
  };

  // Expose functions to be used by other components
  window.showOrderCreatedNotification = showOrderCreatedNotification;
  window.showOrderModifiedNotification = showOrderModifiedNotification;
  window.showAccountCreatedNotification = showAccountCreatedNotification;

  return null; // This component doesn't render anything
}