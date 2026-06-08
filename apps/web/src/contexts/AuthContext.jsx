import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile(data);
        // Update last_seen silently — no await, no blocking
        supabase.from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', userId)
          .then(() => {});
        return data;
      }
    } catch {}
    return null;
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      const prof = await loadProfile(data.user.id);
      return { user: data.user, profile: prof };
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const getStreak = () => {
    if (!user) return 0;
    const key = `adn_streak_${user.id}`;
    const stored = localStorage.getItem(key);
    if (!stored) return 1;
    const { count, lastDate } = JSON.parse(stored);
    const today = new Date().toDateString();
    const last = new Date(lastDate).toDateString();
    if (today === last) return count;
    const diff = Math.floor((new Date() - new Date(lastDate)) / 86400000);
    if (diff === 1) {
      const newCount = (count || 1) + 1;
      localStorage.setItem(key, JSON.stringify({ count: newCount, lastDate: new Date().toISOString() }));
      return newCount;
    }
    localStorage.setItem(key, JSON.stringify({ count: 1, lastDate: new Date().toISOString() }));
    return 1;
  };

  const updateLastLesson = async (moduleId, lessonId) => {
    if (!user) return;
    localStorage.setItem(`adnLastLesson_${user.id}`, JSON.stringify({ moduleId, lessonId }));
  };

  const isAdmin   = profile?.role === 'admin';
  const isSponsor = profile?.role === 'patrocinador' || isAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isSponsor,
      login,
      logout,
      updateLastLesson,
      getStreak,
      nombreCompleto: profile?.nombre_completo,
      codigoDistribuidor: profile?.codigo_adn || profile?.codigo_distribuidor,
      nombrePatrocinador: profile?.nombre_patrocinador,
      tipoUsuario: profile?.role,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
