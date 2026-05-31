-- ============================================================
-- ADN PUEBLA — ESQUEMA COMPLETO SUPABASE
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES (usuarios con roles) ─────────────────────────
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'alumno' CHECK (role IN ('admin', 'patrocinador', 'alumno')),
  nombre_completo TEXT,
  codigo_distribuidor TEXT,
  nombre_patrocinador TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, nombre_completo)
  VALUES (NEW.id, 'alumno', COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 2. CMS CONTENT (sitio público) ────────────────────────────
CREATE TABLE cms_content (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section    TEXT NOT NULL UNIQUE,
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cms_updated_at
  BEFORE UPDATE ON cms_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO cms_content (section, data) VALUES
('hero', '{
  "title": "Aprende a fortalecer tus hábitos financieros y construir un mejor futuro",
  "subtitle": "Descubre estrategias prácticas, desarrolla tu liderazgo y únete a una comunidad comprometida con el crecimiento personal.",
  "btn_primary": "Solicitar Información",
  "btn_secondary": "Contactar por WhatsApp",
  "bg_image": "https://images.unsplash.com/photo-1695173583133-c19731e2df44?q=80&w=2070&auto=format&fit=crop",
  "logo_url": "https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/5aa1b7bbf925833bae29155d3c3acdb9.png"
}'),
('header', '{
  "logo_url": "https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/5aa1b7bbf925833bae29155d3c3acdb9.png",
  "brand_name": "ADN Puebla",
  "nav_links": [
    {"label": "Inicio", "id": "hero"},
    {"label": "Beneficios", "id": "benefits"},
    {"label": "Comunidad", "id": "community"},
    {"label": "Contacto", "id": "contact"}
  ],
  "cta_text": "Solicitar Información"
}'),
('footer', '{
  "brand_name": "ADN Puebla",
  "description": "ADN Puebla es una iniciativa independiente de educación y desarrollo personal.",
  "email": "contacto@adnpuebla.com",
  "whatsapp": "5212221234567",
  "copyright": "© 2025 ADN Puebla. Todos los derechos reservados.",
  "links": [
    {"label": "Aviso de Privacidad", "href": "#"},
    {"label": "Términos y Condiciones", "href": "#"}
  ]
}'),
('benefits', '{
  "title": "Todo lo que necesitas para crecer",
  "subtitle": "Nuestro programa está diseñado para brindarte herramientas integrales.",
  "items": [
    {"icon": "BookOpen", "title": "Educación Financiera", "desc": "Aprende a administrar, ahorrar e invertir tus recursos de manera inteligente."},
    {"icon": "TrendingUp", "title": "Desarrollo Personal", "desc": "Potencia tus habilidades de liderazgo, comunicación y mentalidad de éxito."},
    {"icon": "Users", "title": "Comunidad de Apoyo", "desc": "Rodéate de personas con tus mismos objetivos y comparte experiencias."},
    {"icon": "Wrench", "title": "Herramientas Prácticas", "desc": "Recibe plantillas, guías y recursos aplicables a tu día a día."}
  ]
}'),
('faq', '{
  "title": "Preguntas Frecuentes",
  "items": [
    {"q": "¿Tiene costo solicitar información?", "a": "No, solicitar información es completamente gratuito y sin compromiso."},
    {"q": "¿Necesito experiencia previa?", "a": "No se requiere experiencia previa. El programa va paso a paso."},
    {"q": "¿Cómo recibo más detalles?", "a": "Llena el formulario o contáctanos por WhatsApp."},
    {"q": "¿Puedo participar desde cualquier lugar?", "a": "Sí, contamos con modalidades virtuales y presenciales."}
  ]
}'),
('seo', '{
  "title": "ADN Puebla - Educación Financiera y Desarrollo Personal",
  "description": "Aprende a fortalecer tus hábitos financieros y construir un mejor futuro con ADN Puebla.",
  "keywords": "educación financiera, desarrollo personal, liderazgo, Puebla"
}');

-- ── 3. SOCIALS ─────────────────────────────────────────────────
CREATE TABLE socials (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform   TEXT NOT NULL UNIQUE CHECK (platform IN ('facebook','instagram','linkedin','whatsapp','youtube','tiktok')),
  url        TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO socials (platform, url, sort_order) VALUES
('facebook',  '#', 1),
('instagram', '#', 2),
('linkedin',  '#', 3),
('whatsapp',  'https://wa.me/5212221234567', 4);

-- ── 4. MEDIA (imágenes y videos) ───────────────────────────────
CREATE TABLE media (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('image','video')),
  url        TEXT NOT NULL,
  section    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- ── 5. PROSPECTS (leads del sitio público) ────────────────────
CREATE TABLE prospects (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  telefono   TEXT,
  interes    TEXT,
  fuente     TEXT DEFAULT 'landing_page',
  estado     TEXT DEFAULT 'nuevo' CHECK (estado IN ('nuevo','contactado','convertido','descartado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. TESTIMONIOS ─────────────────────────────────────────────
CREATE TABLE testimonios (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre         TEXT NOT NULL,
  cargo          TEXT,
  contenido      TEXT NOT NULL,
  imagen_url     TEXT,
  activo         BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO testimonios (nombre, cargo, contenido) VALUES
('Lucia Torres',  'Emprendedora',             'ADN Puebla me dio la claridad que necesitaba para organizar mis finanzas y empezar a invertir en mi negocio con seguridad.'),
('Raj Patel',     'Profesional Independiente', 'La comunidad es increíble. No solo aprendes teoría, sino que te rodeas de personas que te impulsan a ser mejor.'),
('Maya Chen',     'Estudiante Universitaria',  'Ojalá hubiera aprendido esto antes. Las herramientas prácticas me han ayudado a crear un fondo de ahorro mientras estudio.');

-- ── 7. MODULES (sistema educativo) ────────────────────────────
CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_num   INT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. LESSONS ─────────────────────────────────────────────────
CREATE TABLE lessons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id   UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  order_num   INT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  video_url   TEXT,
  content     TEXT,
  active      BOOLEAN DEFAULT TRUE,
  UNIQUE(module_id, order_num)
);

-- ── 9. USER PROGRESS ───────────────────────────────────────────
CREATE TABLE user_progress (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed  BOOLEAN DEFAULT FALSE,
  viewed_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ── 10. EVALUATIONS ────────────────────────────────────────────
CREATE TABLE evaluations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id   UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  score       INT NOT NULL,
  passed      BOOLEAN NOT NULL,
  answers     JSONB,
  taken_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. EVENTS ─────────────────────────────────────────────────
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  time        TEXT,
  location    TEXT,
  type        TEXT DEFAULT 'presencial' CHECK (type IN ('presencial','virtual')),
  image_url   TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 12. RESOURCES ──────────────────────────────────────────────
CREATE TABLE resources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  type        TEXT CHECK (type IN ('document','image','link','video')),
  url         TEXT NOT NULL,
  category    TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 13. ANNOUNCEMENTS ──────────────────────────────────────────
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  author_id   UUID REFERENCES profiles(id),
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 14. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content   ENABLE ROW LEVEL SECURITY;
ALTER TABLE socials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE media         ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonios   ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources     ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "public read cms"         ON cms_content   FOR SELECT USING (true);
CREATE POLICY "public read socials"     ON socials       FOR SELECT USING (true);
CREATE POLICY "public read testimonios" ON testimonios   FOR SELECT USING (activo = true);
CREATE POLICY "public read modules"     ON modules       FOR SELECT USING (active = true);
CREATE POLICY "public read lessons"     ON lessons       FOR SELECT USING (active = true);
CREATE POLICY "public read events"      ON events        FOR SELECT USING (active = true);
CREATE POLICY "public read resources"   ON resources     FOR SELECT USING (active = true);
CREATE POLICY "public read announce"    ON announcements FOR SELECT USING (active = true);

-- Escritura pública (prospects desde landing)
CREATE POLICY "public insert prospects" ON prospects FOR INSERT WITH CHECK (true);

-- Perfil propio
CREATE POLICY "user read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Progreso y evaluaciones propias
CREATE POLICY "user own progress"    ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user own evaluations" ON evaluations   FOR ALL USING (auth.uid() = user_id);

-- Solo admin puede escribir en tablas de contenido
CREATE POLICY "admin write cms" ON cms_content
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin write socials" ON socials
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin write media" ON media
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin write prospects" ON prospects
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','patrocinador')));
CREATE POLICY "admin write testimonios" ON testimonios
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin write modules" ON modules
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin write lessons" ON lessons
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin write events" ON events
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin write resources" ON resources
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin write announcements" ON announcements
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','patrocinador')));
CREATE POLICY "admin read profiles" ON profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','patrocinador')));

-- ── CREAR USUARIO ADMIN ────────────────────────────────────────
-- 1. Ve a Supabase → Authentication → Users → Add User
-- 2. Crea tu usuario admin
-- 3. Ejecuta esto con el UUID que obtengas:
--
-- UPDATE profiles SET role = 'admin' WHERE id = 'TU-UUID-AQUI';
