-- ============================================================
-- ADN PUEBLA — MIGRACIÓN 002: profesores, grupos y auditoría
-- Ejecutar en: Supabase → SQL Editor → New Query
-- (Requiere haber corrido antes supabase-schema.sql y
--  supabase-migration-001-fixes.sql)
--
-- Qué agrega:
--   - Rol 'profesor'
--   - Tabla groups (grupos/cohortes) con un profesor asignado
--   - profiles.group_id (a qué grupo pertenece cada alumno)
--   - Tabla audit_log: registro inmutable de quién hizo qué,
--     cuándo y con qué valores — el admin ve TODO, sin excepción,
--     incluidas las acciones de otros admins.
--   - El admin conserva acceso total (lectura/escritura) a
--     absolutamente todo lo nuevo, sin excepciones.
-- ============================================================

-- ── 1. NUEVO ROL 'profesor' ─────────────────────────────────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'patrocinador', 'alumno', 'profesor'));

-- ── 2. TABLA GROUPS (grupos/cohortes) ───────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. A QUÉ GRUPO PERTENECE CADA ALUMNO ────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;

-- ── 4. TABLA AUDIT_LOG (bitácora de auditoría, para TODOS los roles) ─
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES profiles(id),
  actor_role  TEXT,
  action      TEXT NOT NULL,          -- ej: 'update_status', 'grade_evaluation', 'create_group'
  table_name  TEXT NOT NULL,          -- ej: 'profiles', 'evaluations', 'groups'
  record_id   UUID,                   -- id de la fila afectada
  old_data    JSONB,
  new_data    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Función que cualquier parte del código puede llamar (vía rpc)
-- para dejar constancia de una acción sensible. actor_id/actor_role
-- se toman del usuario autenticado, no se pueden falsear desde el
-- cliente.
CREATE OR REPLACE FUNCTION log_action(
  p_action     TEXT,
  p_table_name TEXT,
  p_record_id  UUID,
  p_old_data   JSONB DEFAULT NULL,
  p_new_data   JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_role TEXT;
  v_id   UUID;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();

  INSERT INTO audit_log (actor_id, actor_role, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), v_role, p_action, p_table_name, p_record_id, p_old_data, p_new_data)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger automático: cualquier cambio de role o status en profiles
-- queda auditado SIEMPRE, aunque se haga directo en la base de
-- datos y no a través del código del frontend.
CREATE OR REPLACE FUNCTION audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role) OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO audit_log (actor_id, actor_role, action, table_name, record_id, old_data, new_data)
    VALUES (
      auth.uid(),
      (SELECT role FROM profiles WHERE id = auth.uid()),
      'profile_role_status_change',
      'profiles',
      NEW.id,
      jsonb_build_object('role', OLD.role, 'status', OLD.status),
      jsonb_build_object('role', NEW.role, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_audit_profile_changes ON profiles;
CREATE TRIGGER trg_audit_profile_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_profile_changes();

-- ── 5. ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE groups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admin: acceso total a groups y audit_log, sin excepción.
DROP POLICY IF EXISTS "admin full access groups" ON groups;
CREATE POLICY "admin full access groups" ON groups
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin read audit_log" ON audit_log;
CREATE POLICY "admin read audit_log" ON audit_log
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Nadie puede editar/borrar el audit_log directamente (ni el admin):
-- es de solo lectura una vez escrito, para que sea confiable como
-- evidencia. Solo se inserta a través de log_action() o el trigger
-- (ambos SECURITY DEFINER, no sujetos a RLS de INSERT).

-- Profesor: puede ver y editar sus propios grupos.
DROP POLICY IF EXISTS "profesor read own groups" ON groups;
CREATE POLICY "profesor read own groups" ON groups
  FOR SELECT USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "profesor update own groups" ON groups;
CREATE POLICY "profesor update own groups" ON groups
  FOR UPDATE USING (teacher_id = auth.uid());

-- Cualquier usuario autenticado puede ver el nombre de su propio grupo
DROP POLICY IF EXISTS "read own group" ON groups;
CREATE POLICY "read own group" ON groups
  FOR SELECT USING (id = (SELECT group_id FROM profiles WHERE id = auth.uid()));

-- Profesor: puede leer/actualizar el perfil de los alumnos de SU grupo
-- (para poner status, revisar avance, etc.) — igual que ya existe para
-- 'patrocinador' con sponsor_id, pero ahora vía group_id.
DROP POLICY IF EXISTS "profesor write own group students" ON profiles;
CREATE POLICY "profesor write own group students" ON profiles
  FOR UPDATE USING (
    group_id IN (SELECT id FROM groups WHERE teacher_id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'profesor')
  );

-- ============================================================
-- FIN DE LA MIGRACIÓN 002
-- ============================================================