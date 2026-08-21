-- ============================================================
-- ADN PUEBLA — MIGRACIÓN 001: completar esquema faltante
-- Ejecutar DESPUÉS de supabase-schema.sql, en:
-- Supabase → SQL Editor → New Query
--
-- Esta migración es idempotente (se puede correr varias veces
-- sin romper nada) y agrega todo lo que el código del frontend
-- necesita pero que no existía en el esquema original:
--   - columnas faltantes en profiles / prospects / evaluations
--   - tablas faltantes: questions, sponsor_links, profile_change_log
--   - funciones RPC: generate_sponsor_token, increment_sponsor_link_uses
--   - políticas RLS de escritura para admin/patrocinador
-- ============================================================

-- ── 1. COLUMNAS FALTANTES EN PROFILES ──────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'activo'
  CHECK (status IN ('pendiente', 'activo', 'rechazado', 'bloqueado', 'pendiente_update'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Los usuarios nuevos que se registran a través del flujo normal
-- (signUp) deben quedar 'pendiente' hasta que un admin/patrocinador
-- los apruebe. El trigger handle_new_user() original los dejaba en
-- 'activo' implícito porque la columna no existía; lo corregimos:
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, nombre_completo, status)
  VALUES (NEW.id, 'alumno', COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email), 'pendiente')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ── 2. COLUMNAS FALTANTES EN PROSPECTS ─────────────────────────
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS password_temp TEXT;

-- ── 3. COLUMNAS FALTANTES EN EVALUATIONS ───────────────────────
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS attempt_num INT NOT NULL DEFAULT 1;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS question_ids JSONB;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS time_used_sec INT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS auto_submitted BOOLEAN DEFAULT FALSE;

-- ── 4. TABLA QUESTIONS (banco de preguntas por módulo) ─────────
CREATE TABLE IF NOT EXISTS questions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id  UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  order_num  INT NOT NULL DEFAULT 0,
  question   TEXT NOT NULL,
  options    JSONB NOT NULL DEFAULT '[]',
  correct    INT NOT NULL DEFAULT 0,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. TABLA SPONSOR_LINKS (enlaces de referido) ────────────────
CREATE TABLE IF NOT EXISTS sponsor_links (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  uses       INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. TABLA PROFILE_CHANGE_LOG (cambios pendientes de aprobar) ─
CREATE TABLE IF NOT EXISTS profile_change_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by  UUID REFERENCES profiles(id),
  field_name  TEXT NOT NULL,
  old_value   TEXT,
  new_value   TEXT,
  status      TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','aprobado','rechazado')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ── 7. FUNCIONES RPC ─────────────────────────────────────────────

-- Devuelve el token activo del patrocinador, o crea uno nuevo si no existe.
CREATE OR REPLACE FUNCTION generate_sponsor_token(p_sponsor_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  SELECT token INTO v_token FROM sponsor_links
    WHERE sponsor_id = p_sponsor_id AND active = TRUE LIMIT 1;

  IF v_token IS NOT NULL THEN
    RETURN v_token;
  END IF;

  v_token := substr(md5(random()::text || clock_timestamp()::text), 1, 10);

  INSERT INTO sponsor_links (sponsor_id, token, active)
  VALUES (p_sponsor_id, v_token, TRUE);

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Incrementa el contador de usos de un enlace de patrocinador.
-- Reemplaza el uso inválido de `supabase.raw('uses + 1')` en el frontend.
CREATE OR REPLACE FUNCTION increment_sponsor_link_uses(p_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE sponsor_links SET uses = uses + 1 WHERE token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ── 8. ROW LEVEL SECURITY EN TABLAS NUEVAS ──────────────────────
ALTER TABLE questions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_links      ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read active questions" ON questions;
CREATE POLICY "read active questions" ON questions
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "admin write questions" ON questions;
CREATE POLICY "admin write questions" ON questions
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "sponsor read own link" ON sponsor_links;
CREATE POLICY "sponsor read own link" ON sponsor_links
  FOR SELECT USING (sponsor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "public read active links" ON sponsor_links;
CREATE POLICY "public read active links" ON sponsor_links
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "sponsor manage own link" ON sponsor_links;
CREATE POLICY "sponsor manage own link" ON sponsor_links
  FOR UPDATE USING (sponsor_id = auth.uid());

DROP POLICY IF EXISTS "involved read change log" ON profile_change_log;
CREATE POLICY "involved read change log" ON profile_change_log
  FOR SELECT USING (
    profile_id = auth.uid() OR changed_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','patrocinador'))
  );

DROP POLICY IF EXISTS "sponsor insert change log" ON profile_change_log;
CREATE POLICY "sponsor insert change log" ON profile_change_log
  FOR INSERT WITH CHECK (
    changed_by = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','patrocinador'))
  );

DROP POLICY IF EXISTS "admin update change log" ON profile_change_log;
CREATE POLICY "admin update change log" ON profile_change_log
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── 9. POLÍTICAS DE ESCRITURA FALTANTES EN PROFILES/PROSPECTS ──

-- El admin necesita poder actualizar/crear cualquier perfil
-- (aprobar, cambiar rol, bloquear, crear perfil de un prospecto convertido, etc.)
DROP POLICY IF EXISTS "admin write profiles" ON profiles;
CREATE POLICY "admin write profiles" ON profiles
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- El patrocinador necesita poder actualizar (aprobar/rechazar/dar de baja/
-- editar) el perfil de sus propios alumnos, es decir donde sponsor_id = su id.
DROP POLICY IF EXISTS "sponsor write own students" ON profiles;
CREATE POLICY "sponsor write own students" ON profiles
  FOR UPDATE USING (
    sponsor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'patrocinador')
  );

-- El admin/patrocinador que convierte un prospecto en usuario necesita
-- poder leer/actualizar la fila de prospects que no es suya.
DROP POLICY IF EXISTS "admin write prospects" ON prospects;
CREATE POLICY "admin write prospects" ON prospects
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','patrocinador')));

-- ============================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================
