import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet-async';
import { Users, MessageCircle, AlertCircle, Trophy, TrendingUp, Link2, Copy, Check, RefreshCw, CheckCircle2, XCircle, UserMinus, UserCheck, Edit2, X, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { toast } from 'sonner';

const STATUS_LABEL = { activo: 'Activo', pendiente: 'Pendiente', rechazado: 'Rechazado', pendiente_update: 'En revisión' };
const STATUS_COLOR = { activo: 'bg-green-100 text-green-800', pendiente: 'bg-yellow-100 text-yellow-800', rechazado: 'bg-red-100 text-red-800', pendiente_update: 'bg-blue-100 text-blue-800' };

export default function SponsorPanelPage() {
  const { user, profile } = useAuth();
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('todos');
  const [token, setToken]         = useState('');
  const [copied, setCopied]       = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);

  // ── Cargar alumnos del patrocinador ──────────────────────────
  const loadStudents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre_completo, telefono, status, role, last_seen_at, created_at, codigo_distribuidor')
      .eq('sponsor_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setStudents(data || []);
    setLoading(false);
  }, [user]);

  // ── Cargar / generar token de enlace ─────────────────────────
  const loadToken = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sponsor_links')
      .select('token')
      .eq('sponsor_id', user.id)
      .eq('active', true)
      .single();
    if (data?.token) {
      setToken(data.token);
    } else {
      const { data: newToken } = await supabase
        .rpc('generate_sponsor_token', { p_sponsor_id: user.id });
      if (newToken) setToken(newToken);
    }
  }, [user]);

  useEffect(() => {
    loadStudents();
    loadToken();
  }, [loadStudents, loadToken]);

  const registroUrl = token
    ? `https://adnpuebla.site/registro?ref=${token}`
    : '';

  const copyLink = async () => {
    if (!registroUrl) return;
    await navigator.clipboard.writeText(registroUrl);
    setCopied(true);
    toast.success('Enlace copiado al portapapeles');
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Aprobar alumno (pendiente → activo) ──────────────────────
  const aprobar = async (id, nombre) => {
    const { error } = await supabase
      .from('profiles').update({ status: 'activo' }).eq('id', id);
    if (error) { toast.error('Error al aprobar'); return; }
    toast.success(`${nombre} aprobado`);
    loadStudents();
  };

  // ── Rechazar alumno ──────────────────────────────────────────
  const rechazar = async (id, nombre) => {
    const { error } = await supabase
      .from('profiles').update({ status: 'rechazado' }).eq('id', id);
    if (error) { toast.error('Error al rechazar'); return; }
    toast.success(`${nombre} rechazado`);
    loadStudents();
  };

  // ── Dar de baja ──────────────────────────────────────────────
  const darDeBaja = async (id, nombre) => {
    if (!confirm(`¿Dar de baja a ${nombre}? Perderá acceso a la plataforma.`)) return;
    const { error } = await supabase
      .from('profiles').update({ status: 'rechazado' }).eq('id', id);
    if (error) { toast.error('Error'); return; }
    toast.success(`${nombre} dado de baja`);
    loadStudents();
  };

  // ── Reactivar ────────────────────────────────────────────────
  const reactivar = async (id, nombre) => {
    const { error } = await supabase
      .from('profiles').update({ status: 'pendiente' }).eq('id', id);
    if (error) { toast.error('Error'); return; }
    toast.success(`Solicitud de reactivación enviada. El admin revisará.`);
    loadStudents();
  };

  // ── Editar alumno (pone en pendiente_update) ─────────────────
  const startEdit = (student) => {
    setEditingId(student.id);
    setEditForm({ nombre_completo: student.nombre_completo || '', telefono: student.telefono || '' });
  };

  const saveEdit = async (student) => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        nombre_completo: editForm.nombre_completo,
        telefono: editForm.telefono,
        status: 'pendiente_update',
      })
      .eq('id', student.id);
    setSaving(false);
    if (error) { toast.error('Error al guardar'); return; }
    toast.success('Cambios enviados. El administrador los revisará antes de aplicarlos.');
    setEditingId(null);
    loadStudents();
  };

  // ── Filtros ───────────────────────────────────────────────────
  const filtered = students.filter(s => {
    if (filter === 'todos') return true;
    if (filter === 'pendiente') return s.status === 'pendiente';
    if (filter === 'activo') return s.status === 'activo';
    if (filter === 'baja') return s.status === 'rechazado';
    return true;
  });

  const daysSince = (date) => {
    if (!date) return null;
    return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  };

  const stats = {
    total:     students.length,
    pendiente: students.filter(s => s.status === 'pendiente').length,
    activo:    students.filter(s => s.status === 'activo').length,
    baja:      students.filter(s => s.status === 'rechazado').length,
  };

  return (
    <>
      <Helmet>
        <title>Panel de patrocinador | ADN Puebla</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing:'-0.02em'}}>
              Panel de patrocinador
            </h1>
            <p className="text-muted-foreground text-lg">
              Bienvenido, {profile?.nombre_completo?.split(' ')[0] || 'Patrocinador'}
            </p>
          </div>

          {/* Enlace de registro */}
          <Card className="mb-8 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="w-5 h-5 text-primary" />
                Mi enlace de registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Comparte este enlace con tus prospectos. Tu código se asignará automáticamente al registrarse.
              </p>
              {token ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={registroUrl}
                    readOnly
                    className="font-mono text-sm bg-muted"
                  />
                  <Button onClick={copyLink} variant="outline" className="flex-shrink-0 gap-2">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generando tu enlace...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, icon: Users, color: 'text-primary' },
              { label: 'Pendientes', value: stats.pendiente, icon: AlertCircle, color: 'text-yellow-600' },
              { label: 'Activos', value: stats.activo, icon: TrendingUp, color: 'text-green-600' },
              { label: 'De baja', value: stats.baja, icon: Trophy, color: 'text-muted-foreground' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{label}</p>
                      <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    </div>
                    <Icon className={`w-9 h-9 ${color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Alerta de pendientes */}
          {stats.pendiente > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-800">
                  {stats.pendiente} alumno{stats.pendiente > 1 ? 's' : ''} esperando tu aprobación
                </p>
                <p className="text-sm text-yellow-700">Revisa y aprueba o rechaza las solicitudes.</p>
              </div>
              <Button size="sm" onClick={() => setFilter('pendiente')} className="bg-yellow-500 hover:bg-yellow-400 text-black">
                Ver pendientes
              </Button>
            </div>
          )}

          {/* Tabla */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle>Mis alumnos</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  {['todos','pendiente','activo','baja'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                        filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}>
                      {f === 'baja' ? 'De baja' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cargando alumnos...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'todos'
                      ? 'Aún no tienes alumnos. Comparte tu enlace de registro.'
                      : 'No hay alumnos en esta categoría.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(student => {
                    const dias = daysSince(student.last_seen_at);
                    const isEditing = editingId === student.id;
                    return (
                      <div key={student.id}
                        className={`border rounded-xl p-4 transition-colors ${
                          student.status === 'pendiente' ? 'border-yellow-200 bg-yellow-50/50' :
                          student.status === 'rechazado' ? 'border-muted bg-muted/20' : 'hover:bg-muted/30'
                        }`}>
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Nombre + badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {isEditing ? (
                                <Input
                                  value={editForm.nombre_completo}
                                  onChange={e => setEditForm(p => ({...p, nombre_completo: e.target.value}))}
                                  className="h-8 text-sm font-semibold max-w-[220px]"
                                />
                              ) : (
                                <h3 className="font-semibold text-lg">{student.nombre_completo || '—'}</h3>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[student.status] || ''}`}>
                                {STATUS_LABEL[student.status] || student.status}
                              </span>
                            </div>

                            {/* Datos */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs mb-0.5">Teléfono</p>
                                {isEditing ? (
                                  <Input
                                    value={editForm.telefono}
                                    onChange={e => setEditForm(p => ({...p, telefono: e.target.value}))}
                                    className="h-7 text-sm"
                                    placeholder="10 dígitos"
                                  />
                                ) : (
                                  <p className="font-medium">{student.telefono || '—'}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-0.5">Última actividad</p>
                                <p className="font-medium">
                                  {dias === null ? '—' : dias === 0 ? 'Hoy' : dias === 1 ? 'Ayer' : `Hace ${dias} días`}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-0.5">Registro</p>
                                <p className="font-medium">{new Date(student.created_at).toLocaleDateString('es-MX')}</p>
                              </div>
                            </div>

                            {/* Nota si edición pendiente */}
                            {student.status === 'pendiente_update' && !isEditing && (
                              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                                Cambios enviados — el administrador los revisará pronto.
                              </p>
                            )}
                          </div>

                          {/* Acciones */}
                          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                            {student.status === 'pendiente' && (
                              <>
                                <Button size="sm" onClick={() => aprobar(student.id, student.nombre_completo)}
                                  className="bg-green-600 hover:bg-green-700 gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Aprobar
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => rechazar(student.id, student.nombre_completo)} className="gap-1">
                                  <XCircle className="w-4 h-4" /> Rechazar
                                </Button>
                              </>
                            )}

                            {student.status === 'activo' && !isEditing && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => startEdit(student)} className="gap-1">
                                  <Edit2 className="w-4 h-4" /> Editar
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => darDeBaja(student.id, student.nombre_completo)}
                                  className="gap-1 text-destructive hover:text-destructive">
                                  <UserMinus className="w-4 h-4" /> Dar de baja
                                </Button>
                                {student.telefono && (
                                  <Button size="sm" asChild>
                                    <a href={`https://wa.me/52${student.telefono.replace(/\D/g,'')}?text=Hola ${student.nombre_completo?.split(' ')[0]}, soy tu patrocinador`}
                                      target="_blank" rel="noopener noreferrer" className="gap-1">
                                      <MessageCircle className="w-4 h-4" /> WhatsApp
                                    </a>
                                  </Button>
                                )}
                              </>
                            )}

                            {isEditing && (
                              <>
                                <Button size="sm" onClick={() => saveEdit(student)} disabled={saving} className="gap-1">
                                  <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="gap-1">
                                  <X className="w-4 h-4" /> Cancelar
                                </Button>
                              </>
                            )}

                            {student.status === 'rechazado' && (
                              <Button size="sm" variant="outline" onClick={() => reactivar(student.id, student.nombre_completo)} className="gap-1">
                                <UserCheck className="w-4 h-4" /> Solicitar reactivación
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
