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
        return data;
      }
    } catch {}
    return null;
  }

  useEffect(() => {
    // Listen to auth changes FIRST before checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateLastLesson = async (moduleId, lessonId) => {
    if (!user) return;
    localStorage.setItem(`adnStreak_${user.id}`, JSON.stringify({ moduleId, lessonId }));
  };

  const getStreak = () => {
    if (!user) return 0;
    return parseInt(localStorage.getItem(`adnStreak_count_${user.id}`) || '0');
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
      codigoDistribuidor: profile?.codigo_distribuidor,
      nombrePatrocinador: profile?.nombre_patrocinador,
      tipoUsuario: profile?.role,
    }}>
      {children}
    </AuthContext.Provider>
  );
};