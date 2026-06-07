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
  const [streak, setStreak]   = useState(0);

  async function loadProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile(data);
        // Update last_seen_at on every login/session
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', userId);
        // Calculate streak from last_seen_at
        calculateStreak(data.last_seen_at);
        return data;
      }
    } catch {}
    return null;
  }

  function calculateStreak(lastSeenAt) {
    if (!lastSeenAt) { setStreak(1); return; }
    const last = new Date(lastSeenAt);
    const now = new Date();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      // Same day or yesterday — increment streak from localStorage
      const key = `adn_streak_${profile?.id || 'user'}`;
      const stored = parseInt(localStorage.getItem(key) || '1');
      if (diffDays === 0) {
        setStreak(stored); // same day, keep
      } else {
        const newStreak = stored + 1;
        localStorage.setItem(key, newStreak.toString());
        setStreak(newStreak);
      }
    } else {
      // More than 1 day gap — reset streak
      const key = `adn_streak_${profile?.id || 'user'}`;
      localStorage.setItem(key, '1');
      setStreak(1);
    }
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
        setStreak(0);
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
    setStreak(0);
  };

  const updateLastLesson = async (moduleId, lessonId) => {
    if (!user) return;
    localStorage.setItem(`adnStreak_${user.id}`, JSON.stringify({ moduleId, lessonId }));
  };

  const getStreak = () => streak;

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
      streak,
      nombreCompleto: profile?.nombre_completo,
      codigoDistribuidor: profile?.codigo_adn || profile?.codigo_distribuidor,
      nombrePatrocinador: profile?.nombre_patrocinador,
      tipoUsuario: profile?.role,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
