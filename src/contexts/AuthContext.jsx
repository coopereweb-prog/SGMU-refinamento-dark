import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authEvent, setAuthEvent] = useState(null); // State to track the auth event
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // When the user signs in via a recovery link, the URL hash contains `type=recovery`.
        // We can use this to distinguish it from a normal login.
        if (event === 'SIGNED_IN' && window.location.hash.includes('type=recovery')) {
          // By setting a specific event type, we can prevent GuestRoute from redirecting.
          setAuthEvent('PASSWORD_RECOVERY');
        } else {
          setAuthEvent(event);
        }
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    authEvent, // Expose the event
    signOut,
    loading,
  }), [session, authEvent, signOut, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}