import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── CMS ──────────────────────────────────────────────────────
export const getCMSSection = async (section) => {
  const { data, error } = await supabase
    .from('cms_content').select('data').eq('section', section).single();
  if (error) return null;
  return data.data;
};

export const saveCMSSection = async (section, data) => {
  const { error } = await supabase
    .from('cms_content')
    .update({ data, updated_at: new Date().toISOString() })
    .eq('section', section);
  if (error) throw error;
};

// ── PROSPECTS ────────────────────────────────────────────────
export const checkEmailExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from('prospects').select('email').eq('email', email).limit(1);
    if (error) throw error;
    return { exists: data.length > 0, error: null };
  } catch (error) {
    return { exists: false, error };
  }
};

export const createProspect = async (nombre, email, telefono, interes) => {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .insert([{ nombre, email, telefono, interes, fuente: 'landing_page', estado: 'nuevo' }])
      .select();
    if (error) throw error;
    return { success: true, data, error: null };
  } catch (error) {
    return { success: false, data: null, error };
  }
};

// ── TESTIMONIOS ──────────────────────────────────────────────
export const getTestimonios = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonios').select('*').eq('activo', true).order('fecha_creacion', { ascending: false });
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error };
  }
};

// ── SOCIALS ──────────────────────────────────────────────────
export const getSocials = async () => {
  const { data } = await supabase.from('socials').select('*').order('sort_order');
  return data || [];
};

// ── MODULES & LESSONS ────────────────────────────────────────
export const getModules = async () => {
  const { data } = await supabase
    .from('modules').select('*, lessons(*)').eq('active', true).order('order_num');
  return data || [];
};

// ── PROGRESS ─────────────────────────────────────────────────
export const markLessonComplete = async (userId, lessonId) => {
  await supabase.from('user_progress')
    .upsert({ user_id: userId, lesson_id: lessonId, completed: true, viewed_at: new Date().toISOString() });
};

export const getUserProgress = async (userId) => {
  const { data } = await supabase
    .from('user_progress').select('lesson_id, completed').eq('user_id', userId);
  return data || [];
};

// ── EVALUATIONS ──────────────────────────────────────────────
export const saveEvaluation = async (userId, moduleId, score, passed, answers) => {
  await supabase.from('evaluations')
    .insert([{ user_id: userId, module_id: moduleId, score, passed, answers }]);
};

export const getUserEvaluations = async (userId) => {
  const { data } = await supabase
    .from('evaluations').select('*, modules(title)').eq('user_id', userId).order('taken_at', { ascending: false });
  return data || [];
};
