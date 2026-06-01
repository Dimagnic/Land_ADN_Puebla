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
import {
  Shield, Home, Users, BookOpen, Star, Calendar,
  Download, Megaphone, Settings, LogOut, Search,
  Plus, Trash2, Save, ExternalLink, RefreshCw, Eye
} from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const load = useCallback(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const changeRole = async (id, role) => {
    await supabase.from('profiles').update({ role }).eq('id', id);
    toast.success('Rol actualizado');
    load();
  };

  const changeStatus = async (id, status) => {
    await supabase.from('profiles').update({ status }).eq('id', id);
    toast.success(status === 'activo' ? '✅ Usuario aprobado' : status === 'rechazado' ? '❌ Usuario rechazado' : 'Estado actualizado');
    load();
  };

  const filtered = users.filter(u => {
    const matchSearch = (u.nombre_completo || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.codigo_distribuidor || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'todos' || u.status === filter || (!u.status && filter === 'activo');
    return matchSearch && matchFilter;
  });

  const pendientes = users.filter(u => u.status === 'pendiente').length;
  const ROLES = ['alumno', 'patrocinador', 'admin'];
  const STATUS_COLOR = { activo: 'bg-green-100 text-green-800', pendiente: 'bg-yellow-100 text-yellow-800', rechazado: 'bg-red-100 text-red-800' };

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
        <div className="flex gap-1">
          {['todos', 'pendiente', 'activo', 'rechazado'].map(f => (
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
                    <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="text-xs border rounded px-2 py-1 bg-background">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
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
                      {u.status === 'rechazado' && (
                        <button onClick={() => changeStatus(u.id, 'activo')} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-medium">✅ Aprobar</button>
                      )}
                      {(u.status === 'activo' || !u.status) && u.role !== 'admin' && (
                        <button onClick={() => changeStatus(u.id, 'rechazado')} className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded font-medium">Bloquear</button>
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
    </div>
  );
}

function ProspectsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    supabase.from('prospects').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const updateEstado = async (id, estado) => {
    const prospect = items.find(x => x.id === id);
    if (!prospect) return;

    if (estado === 'convertido' && !prospect.user_id) {
      try {
        toast.loading('Creando cuenta de usuario...');
        // Generate a secure random temporary password
        const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16) + 'Aa1!';
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: prospect.email,
          password: tempPassword,
        });
        if (signupError) throw signupError;
        const userId = signupData.user?.id;
        if (userId) {
          await supabase.from('profiles').upsert({
            id: userId,
            nombre_completo: prospect.nombre,
            telefono: prospect.telefono,
            role: 'alumno',
            status: 'activo',
          });
          await supabase.from('prospects').update({ estado: 'convertido', user_id: userId }).eq('id', id);
          setItems(p => p.map(x => x.id === id ? { ...x, estado: 'convertido', user_id: userId } : x));
          toast.dismiss();
          toast.success(`Usuario creado: ${prospect.email}. Se enviará email de confirmación para que establezca su contraseña.`);
          return;
        }
      } catch (err) {
        toast.dismiss();
        toast.error('Error al crear usuario: ' + err.message);
        return;
      }
    }

    await supabase.from('prospects').update({ estado }).eq('id', id);
    setItems(p => p.map(x => x.id === id ? { ...x, estado } : x));
    toast.success('Estado actualizado');
  };

  const filtered = items.filter(u =>
    (u.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const ESTADOS = ['nuevo', 'contactado', 'convertido', 'descartado'];
  const STATE_COLOR = { nuevo: 'bg-blue-100 text-blue-800', contactado: 'bg-yellow-100 text-yellow-800', convertido: 'bg-green-100 text-green-800', descartado: 'bg-gray-100 text-gray-600' };

  return (
    <div>
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
                    {p.user_id && <span className="ml-2 text-xs text-green-600">user</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-3">
                    <select value={p.estado} onChange={e => updateEstado(p.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-background"
                      disabled={p.estado === 'convertido'}>
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
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
  { id: 'modulos',      label: 'Módulos/Lecciones', icon: BookOpen,    section: 'Educativo' },
  { id: 'eventos',      label: 'Eventos',           icon: Calendar },
  { id: 'recursos',     label: 'Recursos',          icon: Download },
  { id: 'anuncios',     label: 'Anuncios',          icon: Megaphone },
];

const TITLES = { dashboard:'Dashboard', 'cms-hero':'Hero', 'cms-header':'Header', 'cms-footer':'Footer', 'cms-benefits':'Beneficios', 'cms-seo':'SEO', socials:'Redes Sociales', testimonios:'Testimonios', usuarios:'Usuarios', prospectos:'Prospectos', modulos:'Módulos y Lecciones', eventos:'Eventos', recursos:'Recursos', anuncios:'Anuncios' };

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

