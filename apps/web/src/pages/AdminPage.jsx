import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase, getCMSSection, saveCMSSection } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ── Función global para notificaciones email ──────────────────
const notifyEmail = async (type, data) => {
  try {
    await fetch('https://riqlkzzqkkiytoonnysj.supabase.co/functions/v1/notify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ type, data }),
    });
  } catch (e) { console.warn('notify-email error:', e); }
};


import {
  Shield, Home, Users, BookOpen, Star, Calendar,
  Download, Megaphone, Settings, LogOut, Search,
  Plus, Trash2, Save, ExternalLink, RefreshCw, Eye, ClipboardCheck, CheckCircle2, XCircle, AlertTriangle,
  HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const SUPABASE_FUNCTIONS_URL = 'https://riqlkzzqkkiytoonnysj.functions.supabase.co';
const inputCls = 'w-full bg-background border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary';

function Field({ label, value, onChange, textarea, type = 'text', placeholder }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
      <Tag type={type} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls + (textarea ? ' min-h-[80px] resize-y' : '')} />
    </div>
  );
}

function SaveBtn({ onClick, loading, label = 'Guardar' }) {
  return (
    <Button onClick={onClick} disabled={loading} size="sm" className="gap-1">
      <Save className="w-4 h-4" />{loading ? 'Guardando...' : label}
    </Button>
  );
}

function AdminCard({ title, children, action }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Spinner() {
  return <div className="flex items-center gap-2 text-muted-foreground text-sm py-4"><RefreshCw className="w-4 h-4 animate-spin" /> Cargando...</div>;
}

function Dashboard() {
  const [stats, setStats] = useState({});
  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('prospects').select('id', { count: 'exact' }),
      supabase.from('modules').select('id', { count: 'exact' }),
      supabase.from('evaluations').select('id', { count: 'exact' }),
    ]).then(([profiles, prospects, modules, evals]) => {
      setStats({ users: profiles.count || 0, prospects: prospects.count || 0, modules: modules.count || 0, evaluations: evals.count || 0 });
    });
  }, []);
  const cards = [
    { label: 'Usuarios registrados', value: stats.users, icon: Users },
    { label: 'Prospectos (leads)', value: stats.prospects, icon: Star },
    { label: 'Módulos educativos', value: stats.modules, icon: BookOpen },
    { label: 'Evaluaciones tomadas', value: stats.evaluations, icon: Shield },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-5 flex flex-col gap-2">
              <c.icon className="w-6 h-6 text-primary" />
              <p className="text-3xl font-bold">{c.value ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <AdminCard title="Sistema">
        <p className="text-sm text-muted-foreground">Todos los cambios se guardan directamente en Supabase y se reflejan en el sitio en tiempo real.</p>
      </AdminCard>
    </div>
  );
}

function CMSHero() {
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { getCMSSection('hero').then(d => d && setData(d)); }, []);
  const set = k => v => setData(p => ({ ...p, [k]: v }));
  const save = async () => {
    setSaving(true);
    try { await saveCMSSection('hero', data); toast.success('Hero guardado'); }
    catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };
  return (
    <AdminCard title="Hero principal" action={<SaveBtn onClick={save} loading={saving} />}>
      <Field label="Título principal" value={data.title} onChange={set('title')} />
      <Field label="Subtítulo" value={data.subtitle} onChange={set('subtitle')} textarea />
      <Field label="Botón primario" value={data.btn_primary} onChange={set('btn_primary')} />
      <Field label="Botón secundario" value={data.btn_secondary} onChange={set('btn_secondary')} />
      <Field label="URL logo hero" value={data.logo_url} onChange={set('logo_url')} />
      <Field label="URL imagen de fondo" value={data.bg_image} onChange={set('bg_image')} />
      {data.logo_url && <img src={data.logo_url} alt="preview" className="h-16 mt-2 rounded object-contain border" />}
    </AdminCard>
  );
}

function CMSHeader() {
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { getCMSSection('header').then(d => d && setData(d)); }, []);
  const set = k => v => setData(p => ({ ...p, [k]: v }));
  const save = async () => {
    setSaving(true);
    try { await saveCMSSection('header', data); toast.success('Header guardado'); }
    catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };
  return (
    <AdminCard title="Header / Navegación" action={<SaveBtn onClick={save} loading={saving} />}>
      <Field label="URL del logo" value={data.logo_url} onChange={set('logo_url')} />
      <Field label="Nombre de la marca" value={data.brand_name} onChange={set('brand_name')} />
      <Field label="Texto botón CTA" value={data.cta_text} onChange={set('cta_text')} />
      {data.logo_url && <img src={data.logo_url} alt="preview" className="h-12 mt-2 rounded object-contain border" />}
      <p className="text-xs text-muted-foreground mt-3">Los links del nav se editan directamente en el código.</p>
    </AdminCard>
  );
}

function CMSFooter() {
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { getCMSSection('footer').then(d => d && setData(d)); }, []);
  const set = k => v => setData(p => ({ ...p, [k]: v }));
  const save = async () => {
    setSaving(true);
    try { await saveCMSSection('footer', data); toast.success('Footer guardado'); }
    catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };
  return (
    <AdminCard title="Footer" action={<SaveBtn onClick={save} loading={saving} />}>
      <Field label="Nombre de la marca" value={data.brand_name} onChange={set('brand_name')} />
      <Field label="Descripción" value={data.description} onChange={set('description')} textarea />
      <Field label="Email de contacto" value={data.email} onChange={set('email')} type="email" />
      <Field label="WhatsApp (solo dígitos)" value={data.whatsapp} onChange={set('whatsapp')} />
      <Field label="Copyright" value={data.copyright} onChange={set('copyright')} />
    </AdminCard>
  );
}

function CMSBenefits() {
  const [data, setData] = useState({ title: '', subtitle: '', items: [] });
  const [saving, setSaving] = useState(false);
  useEffect(() => { getCMSSection('benefits').then(d => d && setData(d)); }, []);
  const save = async () => {
    setSaving(true);
    try { await saveCMSSection('benefits', data); toast.success('Beneficios guardados'); }
    catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };
  const updateItem = (idx, field, val) => setData(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));
  const addItem = () => setData(p => ({ ...p, items: [...p.items, { icon: 'BookOpen', title: '', desc: '' }] }));
  const removeItem = idx => setData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  return (
    <AdminCard title="Sección Beneficios" action={<SaveBtn onClick={save} loading={saving} />}>
      <Field label="Título" value={data.title} onChange={v => setData(p => ({ ...p, title: v }))} />
      <Field label="Subtítulo" value={data.subtitle} onChange={v => setData(p => ({ ...p, subtitle: v }))} />
      <div className="mt-4 space-y-3">
        {(data.items || []).map((item, idx) => (
          <div key={idx} className="border rounded-lg p-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div><label className="text-xs text-muted-foreground">Ícono</label><input value={item.icon} onChange={e => updateItem(idx, 'icon', e.target.value)} className={inputCls} /></div>
              <div><label className="text-xs text-muted-foreground">Título</label><input value={item.title} onChange={e => updateItem(idx, 'title', e.target.value)} className={inputCls} /></div>
            </div>
            <label className="text-xs text-muted-foreground">Descripción</label>
            <input value={item.desc} onChange={e => updateItem(idx, 'desc', e.target.value)} className={inputCls + ' mb-2'} />
            <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="text-destructive h-7 px-2"><Trash2 className="w-3 h-3 mr-1" /> Eliminar</Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="w-4 h-4" />Agregar beneficio</Button>
      </div>
    </AdminCard>
  );
}

function SocialsAdmin() {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { supabase.from('socials').select('*').order('sort_order').then(({ data }) => data && setItems(data)); }, []);
  const update = (id, field, val) => setItems(p => p.map(s => s.id === id ? { ...s, [field]: val } : s));
  const save = async () => {
    setSaving(true);
    try { await Promise.all(items.map(s => supabase.from('socials').update({ url: s.url }).eq('id', s.id))); toast.success('Redes sociales guardadas'); }
    catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };
  return (
    <AdminCard title="Redes Sociales" action={<SaveBtn onClick={save} loading={saving} />}>
      {items.map(s => (
        <div key={s.id} className="flex items-center gap-3 mb-3">
          <span className="w-24 text-sm font-medium capitalize">{s.platform}</span>
          <input value={s.url} onChange={e => update(s.id, 'url', e.target.value)} className={inputCls} placeholder="https://..." />
        </div>
      ))}
    </AdminCard>
  );
}

function SEOAdmin() {
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { getCMSSection('seo').then(d => d && setData(d)); }, []);
  const set = k => v => setData(p => ({ ...p, [k]: v }));
  const save = async () => {
    setSaving(true);
    try { await saveCMSSection('seo', data); toast.success('SEO guardado'); }
    catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };
  return (
    <AdminCard title="SEO" action={<SaveBtn onClick={save} loading={saving} />}>
      <Field label="Meta título" value={data.title} onChange={set('title')} />
      <Field label="Meta descripción" value={data.description} onChange={set('description')} textarea />
      <Field label="Keywords" value={data.keywords} onChange={set('keywords')} />
    </AdminCard>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ nombre: '', email: '', telefono: '', role: 'alumno' });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const load = useCallback(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const changeRole = async (id, role) => {
    // Protect: admin cannot change their own role
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === id) {
      toast.error('⚠️ No puedes cambiar tu propio rol');
      return;
    }
    await supabase.from('profiles').update({ role }).eq('id', id);
    toast.success('Rol actualizado');
    load();
  };

  const changeStatus = async (id, status) => {
    await supabase.from('profiles').update({ status }).eq('id', id);
    if (status === 'activo') {
      const u = users.find(x => x.id === id);
      if (u) notifyEmail('alumno_aprobado', { nombre: u.nombre_completo, email: u.email });
    }
    toast.success(status === 'activo' ? '✅ Usuario aprobado' : status === 'rechazado' ? '❌ Usuario rechazado' : status === 'bloqueado' ? '🔒 Usuario bloqueado' : 'Estado actualizado');
    load();
  };

  const filtered = users.filter(u => {
    const matchSearch = (u.nombre_completo || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.codigo_distribuidor || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'todos' || u.status === filter || (!u.status && filter === 'activo');
    return matchSearch && matchFilter;
  });

  const deleteUser = async (id, nombre, email) => {
    if (!confirm(`⚠️ ¿Eliminar permanentemente a "${nombre}"?

Esto eliminará:
• Su perfil de la plataforma
• Su acceso a Supabase Auth
• Todo su progreso y evaluaciones

Esta acción NO se puede deshacer.`)) return;
    try {
      // 1. Delete from profiles (cascades to progress, evaluations)
      await supabase.from('profiles').delete().eq('id', id);
      // 2. Delete from Supabase Auth via admin API
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${SUPABASE_FUNCTIONS_URL}/invite-user`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: id }),
      }).catch(() => {}); // Best effort - may not be supported
      // Fallback: just remove from local state
      setUsers(p => p.filter(x => x.id !== id));
      toast.success(`Usuario "${nombre}" eliminado de la plataforma`);
    } catch (err) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  const pendientes = users.filter(u => u.status === 'pendiente').length;
  const ROLES = ['alumno', 'patrocinador', 'admin'];
  const STATUS_COLOR = { activo: 'bg-green-100 text-green-800', pendiente: 'bg-yellow-100 text-yellow-800', rechazado: 'bg-red-100 text-red-800', bloqueado: 'bg-gray-200 text-gray-700', pendiente_update: 'bg-blue-100 text-blue-800' };

  const createUser = async () => {
    if (!createForm.nombre || !createForm.email) { toast.error('Nombre y email son requeridos'); return; }
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/invite-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          email: createForm.email,
          nombre: createForm.nombre,
          telefono: createForm.telefono,
          role: createForm.role,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al crear usuario');
      toast.success(`✅ Usuario creado. ${createForm.nombre} recibirá un correo para establecer su contraseña.`);
      setShowCreateModal(false);
      setCreateForm({ nombre: '', email: '', telefono: '', role: 'alumno' });
      load();
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
    setCreating(false);
  };

  return (
    <div>
      {pendientes > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-semibold text-yellow-800">{pendientes} solicitud{pendientes > 1 ? 'es' : ''} pendiente{pendientes > 1 ? 's' : ''} de aprobación</p>
            <p className="text-sm text-yellow-700">Revisa y aprueba o rechaza las solicitudes de registro.</p>
          </div>
          <Button size="sm" onClick={() => setFilter('pendiente')} className="ml-auto bg-yellow-500 hover:bg-yellow-400 text-black">Ver pendientes</Button>
        </div>
      )}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código..."
            className="flex-1 bg-background border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm" className="gap-1 flex-shrink-0">
          <Plus className="w-4 h-4" /> Crear usuario
        </Button>
        <div className="flex gap-1">
          {['todos', 'pendiente', 'activo', 'rechazado', 'bloqueado'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {loading ? <Spinner /> : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>{['Nombre', 'Teléfono', 'Código', 'Rol', 'Estado', 'Registro', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.nombre_completo || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.telefono || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.codigo_distribuidor || '—'}</td>
                  <td className="px-4 py-3">
                    {currentUserId === u.id ? (
                      <span className="text-xs font-bold text-primary px-2 py-1 border rounded bg-primary/5">{u.role} <span className="text-muted-foreground">(tú)</span></span>
                    ) : (
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="text-xs border rounded px-2 py-1 bg-background">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[u.status || 'activo'] || ''}`}>{u.status || 'activo'}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.status === 'pendiente' && (<>
                        <button onClick={() => changeStatus(u.id, 'activo')} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-medium">✅ Aprobar</button>
                        <button onClick={() => changeStatus(u.id, 'rechazado')} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-medium">❌ Rechazar</button>
                      </>)}
                      {u.status === 'bloqueado' && (
                        <button onClick={() => changeStatus(u.id, 'activo')} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-medium">🔓 Desbloquear</button>
                      )}
                      {u.status === 'rechazado' && (
                        <button onClick={() => changeStatus(u.id, 'activo')} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-medium">✅ Aprobar</button>
                      )}
                      {(u.status === 'activo' || !u.status) && u.role !== 'admin' && (
                        <button onClick={() => changeStatus(u.id, 'bloqueado')} className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded font-medium">🔒 Bloquear</button>
                      )}
                      {currentUserId !== u.id && (
                        <button onClick={() => deleteUser(u.id, u.nombre_completo, u.email)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded font-medium border border-red-200"
                          title="Eliminar usuario permanentemente">
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Sin resultados</p>}
        </div>
      )}

      {/* Modal crear usuario directo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-md border">
            <h2 className="text-lg font-bold mb-1">Crear usuario directo</h2>
            <p className="text-sm text-muted-foreground mb-4">
              El usuario recibirá un correo para establecer su contraseña y quedará activo de inmediato en la tabla de Usuarios.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre completo *</label>
                <input value={createForm.nombre}
                  onChange={e => setCreateForm(p => ({...p, nombre: e.target.value}))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nombre completo" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Email *</label>
                <input type="email" value={createForm.email}
                  onChange={e => setCreateForm(p => ({...p, email: e.target.value}))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                  placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Teléfono</label>
                <input type="tel" value={createForm.telefono}
                  onChange={e => setCreateForm(p => ({...p, telefono: e.target.value}))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                  placeholder="10 dígitos" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Rol</label>
                <select value={createForm.role}
                  onChange={e => setCreateForm(p => ({...p, role: e.target.value}))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary">
                  <option value="alumno">🎓 Alumno</option>
                  <option value="patrocinador">🤝 Patrocinador</option>
                  <option value="admin">🛡️ Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={createUser} disabled={creating} className="flex-1">
                {creating ? 'Creando...' : '✅ Crear y enviar invitación'}
              </Button>
              <Button variant="outline" onClick={() => { setShowCreateModal(false); setCreateForm({ nombre: '', email: '', telefono: '', role: 'alumno' }); }} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProspectsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleModal, setRoleModal] = useState(null); // { prospect }

  const load = () => {
    supabase.from('prospects').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  // ✅ FIX: Usar Edge Function invite-user en lugar de signUp
  const convertirProspecto = async (prospect, role = 'alumno') => {
    try {
      toast.loading('Enviando invitación...');
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/invite-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email: prospect.email,
          nombre: prospect.nombre,
          telefono: prospect.telefono,
          role,
          prospectId: prospect.id,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al invitar');
      setItems(p => p.map(x => x.id === prospect.id ? { ...x, estado: 'convertido', user_id: result.userId } : x));
      toast.dismiss();
      // Notificar al alumno que fue aprobado
      notifyEmail('alumno_aprobado', { nombre: prospect.nombre, email: prospect.email });
      toast.success(`✅ Invitación enviada a ${prospect.email}. Recibirá un correo para establecer su contraseña.`);
    } catch (err) {
      toast.dismiss();
      toast.error('Error: ' + err.message);
    }
    setRoleModal(null);
  };

  const updateEstado = async (id, estado) => {
    const prospect = items.find(x => x.id === id);
    if (!prospect) return;

    // Si se marca como convertido y no tiene usuario, mostrar modal de rol
    if (estado === 'convertido' && !prospect.user_id) {
      setRoleModal({ prospect });
      return;
    }

    await supabase.from('prospects').update({ estado }).eq('id', id);
    setItems(p => p.map(x => x.id === id ? { ...x, estado } : x));
    toast.success('Estado actualizado');
  };

  const deleteProspect = async (id, nombre) => {
    if (!confirm(`¿Eliminar el prospecto "${nombre}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('prospects').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    setItems(p => p.filter(x => x.id !== id));
    toast.success(`Prospecto "${nombre}" eliminado`);
  };

  const filtered = items.filter(u =>
    (u.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const ESTADOS = ['nuevo', 'contactado', 'convertido', 'descartado'];
  const STATE_COLOR = { nuevo: 'bg-blue-100 text-blue-800', contactado: 'bg-yellow-100 text-yellow-800', convertido: 'bg-green-100 text-green-800', descartado: 'bg-gray-100 text-gray-600' };

  return (
    <div>
      {/* ✅ Modal para seleccionar rol antes de invitar */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-1">Convertir a usuario</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Se enviará una invitación a <strong>{roleModal.prospect.email}</strong>.<br />
              Selecciona el rol que tendrá en la plataforma:
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {['alumno', 'patrocinador', 'admin'].map(r => (
                <button key={r} onClick={() => convertirProspecto(roleModal.prospect, r)}
                  className="w-full px-4 py-2 rounded-lg border hover:bg-primary hover:text-primary-foreground text-sm font-medium capitalize transition-colors">
                  {r === 'alumno' ? '🎓 Alumno' : r === 'patrocinador' ? '🤝 Patrocinador' : '🛡️ Administrador'}
                </button>
              ))}
            </div>
            <button onClick={() => setRoleModal(null)} className="w-full text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar prospecto..."
          className="flex-1 bg-background border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
      </div>
      {loading ? <Spinner /> : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>{['Nombre', 'Email', 'Telefono', 'Interes', 'Estado', 'Fecha', 'Accion'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.telefono || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.interes || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATE_COLOR[p.estado] || ''}`}>{p.estado}</span>
                    {p.user_id && <span className="ml-2 text-xs text-green-600">✓ usuario</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-3">
                    <select value={p.estado} onChange={e => updateEstado(p.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-background"
                      disabled={p.estado === 'convertido'}>
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm"
                      onClick={() => deleteProspect(p.id, p.nombre)}
                      className="text-destructive hover:text-destructive h-7 px-2 gap-1"
                      title="Eliminar prospecto">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Sin prospectos</p>}
        </div>
      )}
    </div>
  );
}

function TestimoniosAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const load = () => { supabase.from('testimonios').select('*').order('fecha_creacion', { ascending: false }).then(({ data }) => { setItems(data || []); setLoading(false); }); };
  useEffect(() => { load(); }, []);
  const add = () => setItems(p => [{ id: 'new_' + Date.now(), nombre: '', cargo: '', contenido: '', activo: true, _new: true }, ...p]);
  const upd = (id, f, v) => setItems(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));
  const save = async (item) => {
    setSaving(item.id);
    try {
      if (item._new) { const { data } = await supabase.from('testimonios').insert([{ nombre: item.nombre, cargo: item.cargo, contenido: item.contenido, activo: item.activo }]).select().single(); setItems(p => p.map(x => x.id === item.id ? data : x)); }
      else { await supabase.from('testimonios').update({ nombre: item.nombre, cargo: item.cargo, contenido: item.contenido, activo: item.activo }).eq('id', item.id); }
      toast.success('Guardado');
    } catch { toast.error('Error'); } finally { setSaving(null); }
  };
  const del = async (id) => { if (!confirm('¿Eliminar?')) return; await supabase.from('testimonios').delete().eq('id', id); setItems(p => p.filter(x => x.id !== id)); toast.success('Eliminado'); };
  return (
    <div>
      <div className="flex justify-end mb-4"><Button size="sm" onClick={add} className="gap-1"><Plus className="w-4 h-4" />Agregar</Button></div>
      {loading ? <Spinner /> : items.map(item => (
        <div key={item.id} className="border rounded-lg p-4 mb-3 bg-muted/20">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div><label className="text-xs text-muted-foreground">Nombre</label><input value={item.nombre} onChange={e => upd(item.id, 'nombre', e.target.value)} className={inputCls} /></div>
            <div><label className="text-xs text-muted-foreground">Cargo</label><input value={item.cargo || ''} onChange={e => upd(item.id, 'cargo', e.target.value)} className={inputCls} /></div>
          </div>
          <label className="text-xs text-muted-foreground">Contenido</label>
          <textarea value={item.contenido} onChange={e => upd(item.id, 'contenido', e.target.value)} className={inputCls + ' min-h-[60px] mb-3'} />
          <div className="flex items-center gap-3">
            <SaveBtn onClick={() => save(item)} loading={saving === item.id} />
            <Button variant="ghost" size="sm" onClick={() => del(item.id)} className="text-destructive gap-1"><Trash2 className="w-4 h-4" />Eliminar</Button>
            <label className="flex items-center gap-2 text-sm ml-auto cursor-pointer"><input type="checkbox" checked={item.activo} onChange={e => upd(item.id, 'activo', e.target.checked)} />Activo</label>
          </div>
        </div>
      ))}
    </div>
  );
}


function QuestionsAdmin({ moduleId, moduleName }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const load = () => {
    supabase.from('questions').select('*')
      .eq('module_id', moduleId).order('order_num')
      .then(({ data }) => { setQuestions(data || []); setLoading(false); });
  };

  useEffect(() => { if (expanded) load(); }, [expanded, moduleId]);

  const addQuestion = async () => {
    const maxOrder = Math.max(0, ...questions.map(q => q.order_num));
    const { data } = await supabase.from('questions').insert([{
      module_id: moduleId,
      order_num: maxOrder + 1,
      question: 'Nueva pregunta',
      options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
      correct: 0,
      active: true,
    }]).select().single();
    if (data) setQuestions(p => [...p, data]);
    toast.success('Pregunta agregada');
  };

  const updateQ = (id, field, value) => {
    setQuestions(p => p.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId, optIdx, value) => {
    setQuestions(p => p.map(q => {
      if (q.id !== qId) return q;
      const opts = [...q.options];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const saveQuestion = async (q) => {
    setSaving(q.id);
    await supabase.from('questions').update({
      question: q.question,
      options: q.options,
      correct: q.correct,
      active: q.active,
      order_num: q.order_num,
    }).eq('id', q.id);
    setSaving(null);
    toast.success('Pregunta guardada');
  };

  const delQuestion = async (id) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await supabase.from('questions').delete().eq('id', id);
    setQuestions(p => p.filter(q => q.id !== id));
    toast.success('Pregunta eliminada');
  };

  return (
    <div className="mt-3 border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          Preguntas del examen ({questions.length > 0 ? questions.length : '...'})
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando preguntas...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay preguntas aún. Agrega la primera.</p>
          ) : (
            questions.map((q, qi) => (
              <div key={q.id} className="border rounded-lg p-4 bg-background space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Pregunta {qi + 1}</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input type="checkbox" checked={q.active}
                        onChange={e => updateQ(q.id, 'active', e.target.checked)} />
                      Activa
                    </label>
                    <Button variant="ghost" size="sm" onClick={() => delQuestion(q.id)}
                      className="text-destructive h-6 text-xs gap-1 px-2">
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Texto de la pregunta</label>
                  <textarea
                    value={q.question}
                    onChange={e => updateQ(q.id, 'question', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {(q.options || ['', '', '', '']).map((opt, oi) => (
                    <div key={oi} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                      q.correct === oi ? 'border-green-500 bg-green-50' : 'border-border'
                    }`}>
                      <input type="radio" name={`correct-${q.id}`}
                        checked={q.correct === oi}
                        onChange={() => updateQ(q.id, 'correct', oi)}
                        title="Marcar como respuesta correcta"
                        className="text-green-600 flex-shrink-0" />
                      <input
                        value={opt}
                        onChange={e => updateOption(q.id, oi, e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none"
                        placeholder={`Opción ${String.fromCharCode(65 + oi)}`}
                      />
                      {q.correct === oi && (
                        <span className="text-xs text-green-600 font-medium flex-shrink-0">✓ Correcta</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Haz clic en el radio button para marcar cuál es la respuesta correcta.
                </p>

                <SaveBtn onClick={() => saveQuestion(q)} loading={saving === q.id} label="Guardar pregunta" />
              </div>
            ))
          )}

          <Button size="sm" onClick={addQuestion} className="gap-1 w-full" variant="outline">
            <Plus className="w-4 h-4" /> Agregar pregunta
          </Button>
        </div>
      )}
    </div>
  );
}

function ModulesAdmin() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const load = () => { supabase.from('modules').select('*, lessons(*)').order('order_num').then(({ data }) => { setModules(data || []); setLoading(false); }); };
  useEffect(() => { load(); }, []);
  const addModule = async () => {
    const maxOrder = Math.max(0, ...modules.map(m => m.order_num));
    const { data } = await supabase.from('modules').insert([{ order_num: maxOrder + 1, title: 'Nuevo módulo', description: '' }]).select().single();
    setModules(p => [...p, { ...data, lessons: [] }]); toast.success('Módulo agregado');
  };
  const saveModule = async (mod) => {
    setSaving(mod.id);
    try { await supabase.from('modules').update({ title: mod.title, description: mod.description, active: mod.active }).eq('id', mod.id); toast.success('Módulo guardado'); }
    catch { toast.error('Error'); } finally { setSaving(null); }
  };
  const delModule = async (id) => {
    if (!confirm('¿Eliminar módulo y todas sus lecciones?')) return;
    await supabase.from('modules').delete().eq('id', id);
    setModules(p => p.filter(m => m.id !== id)); toast.success('Módulo eliminado');
  };
  const addLesson = async (moduleId, lessons) => {
    const maxOrder = Math.max(0, ...(lessons || []).map(l => l.order_num));
    const { data } = await supabase.from('lessons').insert([{ module_id: moduleId, order_num: maxOrder + 1, title: 'Nueva lección', description: '', video_url: '', content: '' }]).select().single();
    setModules(p => p.map(m => m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), data] } : m));
  };
  const saveLesson = async (lesson) => {
    setSaving(lesson.id);
    try { await supabase.from('lessons').update({ title: lesson.title, description: lesson.description, video_url: lesson.video_url, content: lesson.content, active: lesson.active }).eq('id', lesson.id); toast.success('Lección guardada'); }
    catch { toast.error('Error'); } finally { setSaving(null); }
  };
  const delLesson = async (lessonId, moduleId) => {
    if (!confirm('¿Eliminar lección?')) return;
    await supabase.from('lessons').delete().eq('id', lessonId);
    setModules(p => p.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
  };
  const updModule = (id, f, v) => setModules(p => p.map(m => m.id === id ? { ...m, [f]: v } : m));
  const updLesson = (moduleId, lessonId, f, v) => setModules(p => p.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [f]: v } : l) } : m));
  if (loading) return <Spinner />;
  return (
    <div>
      <div className="flex justify-end mb-4"><Button size="sm" onClick={addModule} className="gap-1"><Plus className="w-4 h-4" />Agregar módulo</Button></div>
      {modules.map(mod => (
        <div key={mod.id} className="border rounded-lg mb-4 overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === mod.id ? null : mod.id)}>
            <span className="font-semibold text-sm flex-1">M{mod.order_num}: {mod.title}</span>
            <Badge variant="outline">{(mod.lessons || []).length} lecciones</Badge>
            <label className="flex items-center gap-1 text-xs cursor-pointer" onClick={e => e.stopPropagation()}>
              <input type="checkbox" checked={mod.active} onChange={e => updModule(mod.id, 'active', e.target.checked)} />Activo
            </label>
          </div>
          {expanded === mod.id && (
            <div className="p-4">
              <Field label="Título del módulo" value={mod.title} onChange={v => updModule(mod.id, 'title', v)} />
              <Field label="Descripción" value={mod.description} onChange={v => updModule(mod.id, 'description', v)} textarea />
              <div className="flex gap-2 mb-4">
                <SaveBtn onClick={() => saveModule(mod)} loading={saving === mod.id} />
                <Button variant="ghost" size="sm" onClick={() => delModule(mod.id)} className="text-destructive gap-1"><Trash2 className="w-4 h-4" />Eliminar módulo</Button>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">Lecciones</h4>
                  <Button size="sm" variant="outline" onClick={() => addLesson(mod.id, mod.lessons)} className="gap-1 h-7 text-xs"><Plus className="w-3 h-3" />Agregar lección</Button>
                </div>
                {(mod.lessons || []).map(lesson => (
                  <div key={lesson.id} className="border rounded-lg p-3 mb-3 bg-background">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div><label className="text-xs text-muted-foreground">Título</label><input value={lesson.title} onChange={e => updLesson(mod.id, lesson.id, 'title', e.target.value)} className={inputCls} /></div>
                      <div><label className="text-xs text-muted-foreground">URL Video</label><input value={lesson.video_url || ''} onChange={e => updLesson(mod.id, lesson.id, 'video_url', e.target.value)} className={inputCls} placeholder="https://youtube.com/embed/..." /></div>
                    </div>
                    <label className="text-xs text-muted-foreground">Descripción</label>
                    <input value={lesson.description || ''} onChange={e => updLesson(mod.id, lesson.id, 'description', e.target.value)} className={inputCls + ' mb-2'} />
                    <label className="text-xs text-muted-foreground">Contenido</label>
                    <textarea value={lesson.content || ''} onChange={e => updLesson(mod.id, lesson.id, 'content', e.target.value)} className={inputCls + ' min-h-[60px] mb-3'} />
                    <div className="flex items-center gap-3">
                      <SaveBtn onClick={() => saveLesson(lesson)} loading={saving === lesson.id} label="Guardar lección" />
                      <Button variant="ghost" size="sm" onClick={() => delLesson(lesson.id, mod.id)} className="text-destructive gap-1 h-7 text-xs"><Trash2 className="w-3 h-3" />Eliminar</Button>
                      <label className="flex items-center gap-1 text-xs ml-auto cursor-pointer"><input type="checkbox" checked={lesson.active} onChange={e => updLesson(mod.id, lesson.id, 'active', e.target.checked)} />Activa</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EventsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const load = () => { supabase.from('events').select('*').order('date', { ascending: false }).then(({ data }) => { setItems(data || []); setLoading(false); }); };
  useEffect(() => { load(); }, []);
  const add = () => setItems(p => [{ id: 'new_' + Date.now(), title: '', description: '', date: '', time: '', location: '', type: 'presencial', active: true, _new: true }, ...p]);
  const upd = (id, f, v) => setItems(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));
  const save = async (item) => {
    setSaving(item.id);
    try {
      const payload = { title: item.title, description: item.description, date: item.date, time: item.time, location: item.location, type: item.type, active: item.active };
      if (item._new) { const { data } = await supabase.from('events').insert([payload]).select().single(); setItems(p => p.map(x => x.id === item.id ? data : x)); }
      else { await supabase.from('events').update(payload).eq('id', item.id); }
      toast.success('Evento guardado');
    } catch { toast.error('Error'); } finally { setSaving(null); }
  };
  const del = async (id) => { if (!confirm('¿Eliminar evento?')) return; await supabase.from('events').delete().eq('id', id); setItems(p => p.filter(x => x.id !== id)); toast.success('Eliminado'); };
  return (
    <div>
      <div className="flex justify-end mb-4"><Button size="sm" onClick={add} className="gap-1"><Plus className="w-4 h-4" />Agregar evento</Button></div>
      {loading ? <Spinner /> : items.map(item => (
        <div key={item.id} className="border rounded-lg p-4 mb-3">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div><label className="text-xs text-muted-foreground">Título</label><input value={item.title} onChange={e => upd(item.id, 'title', e.target.value)} className={inputCls} /></div>
            <div><label className="text-xs text-muted-foreground">Tipo</label><select value={item.type} onChange={e => upd(item.id, 'type', e.target.value)} className={inputCls}><option value="presencial">Presencial</option><option value="virtual">Virtual</option></select></div>
            <div><label className="text-xs text-muted-foreground">Fecha</label><input type="date" value={item.date || ''} onChange={e => upd(item.id, 'date', e.target.value)} className={inputCls} /></div>
            <div><label className="text-xs text-muted-foreground">Hora</label><input value={item.time || ''} onChange={e => upd(item.id, 'time', e.target.value)} className={inputCls} placeholder="19:00" /></div>
            <div className="col-span-2"><label className="text-xs text-muted-foreground">Lugar</label><input value={item.location || ''} onChange={e => upd(item.id, 'location', e.target.value)} className={inputCls} /></div>
            <div className="col-span-2"><label className="text-xs text-muted-foreground">Descripción</label><textarea value={item.description || ''} onChange={e => upd(item.id, 'description', e.target.value)} className={inputCls + ' min-h-[60px]'} /></div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <SaveBtn onClick={() => save(item)} loading={saving === item.id} />
            <Button variant="ghost" size="sm" onClick={() => del(item.id)} className="text-destructive gap-1"><Trash2 className="w-4 h-4" />Eliminar</Button>
            <label className="flex items-center gap-1 text-xs ml-auto cursor-pointer"><input type="checkbox" checked={item.active} onChange={e => upd(item.id, 'active', e.target.checked)} />Activo</label>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResourcesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const load = () => { supabase.from('resources').select('*').order('created_at', { ascending: false }).then(({ data }) => { setItems(data || []); setLoading(false); }); };
  useEffect(() => { load(); }, []);
  const add = () => setItems(p => [{ id: 'new_' + Date.now(), title: '', description: '', type: 'document', url: '', category: '', active: true, _new: true }, ...p]);
  const upd = (id, f, v) => setItems(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));
  const save = async (item) => {
    setSaving(item.id);
    try {
      const payload = { title: item.title, description: item.description, type: item.type, url: item.url, category: item.category, active: item.active };
      if (item._new) { const { data } = await supabase.from('resources').insert([payload]).select().single(); setItems(p => p.map(x => x.id === item.id ? data : x)); }
      else { await supabase.from('resources').update(payload).eq('id', item.id); }
      toast.success('Recurso guardado');
    } catch { toast.error('Error'); } finally { setSaving(null); }
  };
  const del = async (id) => { if (!confirm('¿Eliminar recurso?')) return; await supabase.from('resources').delete().eq('id', id); setItems(p => p.filter(x => x.id !== id)); toast.success('Eliminado'); };
  return (
    <div>
      <div className="flex justify-end mb-4"><Button size="sm" onClick={add} className="gap-1"><Plus className="w-4 h-4" />Agregar recurso</Button></div>
      {loading ? <Spinner /> : items.map(item => (
        <div key={item.id} className="border rounded-lg p-4 mb-3">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div><label className="text-xs text-muted-foreground">Título</label><input value={item.title} onChange={e => upd(item.id, 'title', e.target.value)} className={inputCls} /></div>
            <div><label className="text-xs text-muted-foreground">Tipo</label><select value={item.type} onChange={e => upd(item.id, 'type', e.target.value)} className={inputCls}>{['document','image','link','video'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="col-span-2"><label className="text-xs text-muted-foreground">URL</label><input value={item.url} onChange={e => upd(item.id, 'url', e.target.value)} className={inputCls} /></div>
            <div><label className="text-xs text-muted-foreground">Categoría</label><input value={item.category || ''} onChange={e => upd(item.id, 'category', e.target.value)} className={inputCls} /></div>
            <div><label className="text-xs text-muted-foreground">Descripción</label><input value={item.description || ''} onChange={e => upd(item.id, 'description', e.target.value)} className={inputCls} /></div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <SaveBtn onClick={() => save(item)} loading={saving === item.id} />
            <Button variant="ghost" size="sm" onClick={() => del(item.id)} className="text-destructive gap-1"><Trash2 className="w-4 h-4" />Eliminar</Button>
            <label className="flex items-center gap-1 text-xs ml-auto cursor-pointer"><input type="checkbox" checked={item.active} onChange={e => upd(item.id, 'active', e.target.checked)} />Activo</label>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnnouncementsAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const load = () => { supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => { setItems(data || []); setLoading(false); }); };
  useEffect(() => { load(); }, []);
  const add = () => setItems(p => [{ id: 'new_' + Date.now(), title: '', content: '', active: true, _new: true }, ...p]);
  const upd = (id, f, v) => setItems(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));
  const save = async (item) => {
    setSaving(item.id);
    try {
      const payload = { title: item.title, content: item.content, active: item.active, author_id: user?.id };
      if (item._new) { const { data } = await supabase.from('announcements').insert([payload]).select().single(); setItems(p => p.map(x => x.id === item.id ? data : x)); }
      else { await supabase.from('announcements').update(payload).eq('id', item.id); }
      toast.success('Anuncio guardado');
    } catch { toast.error('Error'); } finally { setSaving(null); }
  };
  const del = async (id) => { if (!confirm('¿Eliminar anuncio?')) return; await supabase.from('announcements').delete().eq('id', id); setItems(p => p.filter(x => x.id !== id)); toast.success('Eliminado'); };
  return (
    <div>
      <div className="flex justify-end mb-4"><Button size="sm" onClick={add} className="gap-1"><Plus className="w-4 h-4" />Nuevo anuncio</Button></div>
      {loading ? <Spinner /> : items.map(item => (
        <div key={item.id} className="border rounded-lg p-4 mb-3">
          <Field label="Título" value={item.title} onChange={v => upd(item.id, 'title', v)} />
          <Field label="Contenido" value={item.content} onChange={v => upd(item.id, 'content', v)} textarea />
          <div className="flex items-center gap-3">
            <SaveBtn onClick={() => save(item)} loading={saving === item.id} />
            <Button variant="ghost" size="sm" onClick={() => del(item.id)} className="text-destructive gap-1"><Trash2 className="w-4 h-4" />Eliminar</Button>
            <label className="flex items-center gap-1 text-xs ml-auto cursor-pointer"><input type="checkbox" checked={item.active} onChange={e => upd(item.id, 'active', e.target.checked)} />Activo</label>
          </div>
        </div>
      ))}
    </div>
  );
}


function PendingChangesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase
      .from('profile_change_log')
      .select('*, profile:profile_id(nombre_completo, telefono), sponsor:changed_by(nombre_completo)')
      .eq('status', 'pendiente')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const aprobar = async (item) => {
    // Aplicar el cambio al perfil
    await supabase.from('profiles').update({ [item.field_name]: item.new_value }).eq('id', item.profile_id);
    // Si ya no hay más cambios pendientes para este perfil, volver a activo
    const { data: pending } = await supabase
      .from('profile_change_log')
      .select('id')
      .eq('profile_id', item.profile_id)
      .eq('status', 'pendiente')
      .neq('id', item.id);
    if (!pending || pending.length === 0) {
      await supabase.from('profiles').update({ status: 'activo' }).eq('id', item.profile_id);
    }
    await supabase.from('profile_change_log').update({ status: 'aprobado', reviewed_at: new Date().toISOString() }).eq('id', item.id);
    toast.success('Cambio aprobado y aplicado');
    load();
  };

  const rechazar = async (item) => {
    await supabase.from('profile_change_log').update({ status: 'rechazado', reviewed_at: new Date().toISOString() }).eq('id', item.id);
    // Revisar si quedan pendientes
    const { data: pending } = await supabase
      .from('profile_change_log').select('id').eq('profile_id', item.profile_id).eq('status', 'pendiente').neq('id', item.id);
    if (!pending || pending.length === 0) {
      await supabase.from('profiles').update({ status: 'activo' }).eq('id', item.profile_id);
    }
    toast.success('Cambio rechazado');
    load();
  };

  const FIELD_LABEL = { nombre_completo: 'Nombre', telefono: 'Teléfono', email: 'Email' };

  return (
    <div>
      {loading ? <Spinner /> : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p className="font-medium">No hay cambios pendientes de revisión</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="border rounded-xl p-4 bg-yellow-50/50 border-yellow-200">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <p className="font-semibold">{item.profile?.nombre_completo || 'Alumno'}</p>
                  <p className="text-sm text-muted-foreground">
                    Cambio solicitado por <span className="font-medium">{item.sponsor?.nombre_completo || 'Patrocinador'}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="bg-muted px-2 py-1 rounded font-medium">{FIELD_LABEL[item.field_name] || item.field_name}</span>
                    <span className="text-muted-foreground line-through">{item.old_value || '—'}</span>
                    <span>→</span>
                    <span className="text-foreground font-medium">{item.new_value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleString('es-MX')}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => aprobar(item)} className="bg-green-600 hover:bg-green-700 gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Aprobar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => rechazar(item)} className="gap-1">
                    <XCircle className="w-4 h-4" /> Rechazar
                  </Button>
                </div>
              </div>
              <QuestionsAdmin moduleId={mod.id} moduleName={mod.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',        icon: Home,        section: 'General' },
  { id: 'cms-hero',     label: 'Hero',              icon: Eye,         section: 'Sitio Público' },
  { id: 'cms-header',   label: 'Header',            icon: Settings },
  { id: 'cms-footer',   label: 'Footer',            icon: Settings },
  { id: 'cms-benefits', label: 'Beneficios',        icon: Star },
  { id: 'cms-seo',      label: 'SEO',               icon: ExternalLink },
  { id: 'socials',      label: 'Redes Sociales',    icon: ExternalLink },
  { id: 'testimonios',  label: 'Testimonios',       icon: Star },
  { id: 'usuarios',     label: 'Usuarios',          icon: Users,       section: 'Gestión' },
  { id: 'prospectos',   label: 'Prospectos',        icon: Users },
  { id: 'cambios',      label: 'Cambios pendientes', icon: ClipboardCheck },
  { id: 'modulos',      label: 'Módulos/Lecciones', icon: BookOpen,    section: 'Educativo' },
  { id: 'eventos',      label: 'Eventos',           icon: Calendar },
  { id: 'recursos',     label: 'Recursos',          icon: Download },
  { id: 'anuncios',     label: 'Anuncios',          icon: Megaphone },
];

const TITLES = { dashboard:'Dashboard', cambios:'Cambios pendientes de revisión', 'cms-hero':'Hero', 'cms-header':'Header', 'cms-footer':'Footer', 'cms-benefits':'Beneficios', 'cms-seo':'SEO', socials:'Redes Sociales', testimonios:'Testimonios', usuarios:'Usuarios', prospectos:'Prospectos', modulos:'Módulos y Lecciones', eventos:'Eventos', recursos:'Recursos', anuncios:'Anuncios' };

export default function AdminPage() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');

  const renderSection = () => {
    switch (active) {
      case 'dashboard':    return <Dashboard />;
      case 'cms-hero':     return <CMSHero />;
      case 'cms-header':   return <CMSHeader />;
      case 'cms-footer':   return <CMSFooter />;
      case 'cms-benefits': return <CMSBenefits />;
      case 'cms-seo':      return <SEOAdmin />;
      case 'socials':      return <SocialsAdmin />;
      case 'testimonios':  return <TestimoniosAdmin />;
      case 'usuarios':     return <UsersAdmin />;
      case 'prospectos':   return <ProspectsAdmin />;
      case 'cambios':      return <PendingChangesAdmin />;
      case 'modulos':      return <ModulesAdmin />;
      case 'eventos':      return <EventsAdmin />;
      case 'recursos':     return <ResourcesAdmin />;
      case 'anuncios':     return <AnnouncementsAdmin />;
      default:             return <Dashboard />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-background">
      <aside className="w-56 bg-card border-r flex flex-col overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm">Panel Admin</span>
        </div>
        <nav className="p-2 flex-1">
          {NAV.map(item => (
            <div key={item.id}>
              {item.section && <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 pt-4 pb-1">{item.section}</p>}
              <button onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-0.5 ${active === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />{item.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="p-2 border-t space-y-1">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="w-full justify-start gap-2 text-muted-foreground"><ExternalLink className="w-4 h-4" />Ver sitio</Button>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start gap-2 text-muted-foreground"><LogOut className="w-4 h-4" />Cerrar sesión</Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b px-6 py-4 flex items-center justify-between bg-card flex-shrink-0">
          <h1 className="text-lg font-semibold">{TITLES[active]}</h1>
          <Badge variant="outline" className="gap-1"><Shield className="w-3 h-3" />Admin</Badge>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{renderSection()}</main>
      </div>
    </div>
  );
}