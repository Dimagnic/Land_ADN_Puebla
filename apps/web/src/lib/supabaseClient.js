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

// Obtener intentos previos del alumno para un módulo
export const getModuleAttempts = async (userId, moduleId) => {
  const { data } = await supabase
    .from('evaluations')
    .select('id, score, passed, attempt_num, question_ids, taken_at, auto_submitted')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .order('attempt_num', { ascending: true });
  return data || [];
};

// Guardar evaluación con todos los campos nuevos
export const saveEvaluation = async (userId, moduleId, score, passed, answers, opts = {}) => {
  const { attemptNum = 1, questionIds = [], timeUsedSec = 0, autoSubmitted = false } = opts;
  const { data, error } = await supabase.from('evaluations')
    .insert([{
      user_id: userId,
      module_id: moduleId,
      score,
      passed,
      answers,
      attempt_num: attemptNum,
      question_ids: questionIds,
      time_used_sec: timeUsedSec,
      auto_submitted: autoSubmitted,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getUserEvaluations = async (userId) => {
  const { data } = await supabase
    .from('evaluations').select('*, modules(title)').eq('user_id', userId).order('taken_at', { ascending: false });
  return data || [];
};

// Obtener preguntas aleatorias únicas para un intento
// Usa userId + moduleId + attemptNum como semilla para garantizar
// que diferentes alumnos y diferentes intentos tengan preguntas distintas
export const getShuffledQuestions = async (moduleId, userId, attemptNum, total = 10) => {
  const { data: allQs } = await supabase
    .from('questions')
    .select('*')
    .eq('module_id', moduleId)
    .eq('active', true);

  if (!allQs || allQs.length === 0) return [];

  // Semilla determinística: userId + moduleId + attemptNum
  // Diferente por alumno Y por intento
  const seed = `${userId}-${moduleId}-${attemptNum}`;
  const shuffled = seededShuffle([...allQs], seed);
  return shuffled.slice(0, Math.min(total, shuffled.length));
};

// Shuffle determinístico con semilla (Fisher-Yates + LCG)
function seededShuffle(arr, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  let state = Math.abs(hash) || 1;
  const rand = () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
