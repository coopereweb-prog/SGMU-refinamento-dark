import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const auth = useAuth();
  const user = auth?.user; // Acesso seguro ao usuário
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    // Apenas busca o perfil se o usuário existir
    if (user) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          throw error;
        }
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Se não há usuário, limpa o perfil e finaliza o carregamento.
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  // O useEffect agora depende da função memoizada
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const value = useMemo(() => ({
    profile,
    loading,
    refreshProfile: fetchProfile,
  }), [profile, loading, fetchProfile]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}