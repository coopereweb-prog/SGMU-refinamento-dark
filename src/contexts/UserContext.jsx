import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Define o estado de recuperação de senha APENAS para esse evento.
      // Reseta em qualquer outro estado de sessão.
      setIsPasswordRecovery(_event === 'PASSWORD_RECOVERY');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // A CONDIÇÃO MAIS IMPORTANTE:
    // Só busca o perfil se houver uma sessão E NÃO ESTIVER no fluxo de recuperação de senha.
    if (session?.user && !isPasswordRecovery) {
      const fetchProfile = async () => {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile || null);
      };
      fetchProfile();
    } else {
      // Garante que o perfil seja nulo se não houver sessão ou se estiver em recuperação.
      setProfile(null);
    }
  }, [session, isPasswordRecovery]); // Adiciona isPasswordRecovery como dependência

  const value = {
    session,
    profile,
    loading,
    isPasswordRecovery,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};