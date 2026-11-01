import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';

const AuthContext = createContext<{
  session: Session | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}>({
  session: null,
  user: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    try {
      const keys = Object.keys(localStorage).filter(k =>
        k.includes('supabase') || k.includes('sb-') || k.includes('auth')
      );
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
  };

  useEffect(() => {
    // Baca session yang sudah ada (termasuk dari OAuth callback yang sudah diproses Supabase)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Dengarkan perubahan session dari Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
