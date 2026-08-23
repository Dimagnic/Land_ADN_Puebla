import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';
import { Users, GraduationCap, CheckCircle2, XCircle, UserMinus, UserCheck, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { toast } from 'sonner';

const STATUS_LABEL = { activo: 'Activo', pendiente: 'Pendiente', rechazado: 'Rechazado', bloqueado: 'Bloqueado', pendiente_update: 'En revisión' };
const STATUS_COLOR = { activo: 'bg-green-100 text-green-800', pendiente: 'bg-yellow-100 text-yellow-800', rechazado: 'bg-red-100 text-red-800', bloqueado: 'bg-gray-200 text-gray-700', pendiente_update: 'bg-blue-100 text-blue-800' };

export default function TeacherPanelPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');

  // ── Cargar los grupos a cargo de este profesor ─────────────────
  const loadGroups = useCallback(async () => {
    if (!user) return;
    const query = supabase.from('groups').select('id, name, active').order('created_at', { ascending: false });
    const { data } = isAdmin ? await query : await query.eq('teacher_id', user.id);
    setGroups(data || []);
    if (data && data.length > 0 && !activeGroupId) setActiveGroupId(data[0].id);
  }, [user, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadGroups(); }, [loadGroups]);

  // ── Cargar alumnos del grupo seleccionado ───────────────────────
  const loadStudents = useCallback(async () => {
    if (!activeGroupId) { setStudents([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre_completo, telefono, status, last_seen_at, created_at')
      .eq('group_id', activeGroupId)
      .order('created_at', { ascending: false });
    if (!error) setStudents(data || []);
    setLoading(false);
  }, [activeGroupId]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // ── Acciones sobre un alumno (todas quedan auditadas) ───────────
  const changeStatus = async (student, newStatus) => {
    const oldStatus = student.status;
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', student.id);
    if (error) { toast.error('Error al actualizar'); return; }
    await supabase.rpc('log_action', {
      p_action: 'teacher_change_student_status',
      p_table_name: 'profiles',
      p_record_id: student.id,
      p_old_data: { status: oldStatus },
      p_new_data: { status: newStatus },
    });
    toast.success(
      newStatus === 'activo' ? '✅ Alumno aprobado' :
      newStatus === 'rechazado' ? '❌ Alumno rechazado' :
      newStatus === 'bloqueado' ? '🔒 Alumno dado de baja' : 'Estatus actualizado'
    );
    loadStudents();
  };

  const filtered = students.filter(s => {
    const matchSearch = (s.nombre_completo || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'todos' || s.status === filter || (!s.status && filter === 'activo');
    return matchSearch && matchFilter;
  });

  const activeGroup = groups.find(g => g.id === activeGroupId);

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet><title>Panel del Profesor - ADN Puebla</title></Helmet>

      <header className="bg-primary text-primary-foreground py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground gap-1">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Panel del Profesor</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {groups.length === 0 && !loading ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            Todavía no tienes ningún grupo asignado. Pide a un administrador que te asigne uno.
          </CardContent></Card>
        ) : (
          <>
            {groups.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {groups.map(g => (
                  <Button key={g.id} size="sm" variant={activeGroupId === g.id ? 'default' : 'outline'} onClick={() => setActiveGroupId(g.id)}>
                    {g.name}
                  </Button>
                ))}
              </div>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-5 h-5 text-primary" /> {activeGroup?.name || 'Grupo'} — {students.length} alumno{students.length !== 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar alumno..." className="pl-9" />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {['todos', 'pendiente', 'activo', 'rechazado', 'bloqueado'].map(f => (
                      <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
                        {f === 'todos' ? 'Todos' : STATUS_LABEL[f]}
                      </Button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Cargando...</p>
                ) : filtered.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No hay alumnos que coincidan.</p>
                ) : (
                  <div className="space-y-2">
                    {filtered.map(s => (
                      <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-background">
                        <div>
                          <p className="font-medium text-sm">{s.nombre_completo || 'Sin nombre'}</p>
                          <p className="text-xs text-muted-foreground">{s.telefono || 'Sin teléfono'}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={STATUS_COLOR[s.status] || STATUS_COLOR.activo}>{STATUS_LABEL[s.status] || s.status || 'Activo'}</Badge>
                          {s.status === 'pendiente' && (
                            <>
                              <Button size="sm" variant="outline" className="gap-1 text-green-700 border-green-300" onClick={() => changeStatus(s, 'activo')}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1 text-red-700 border-red-300" onClick={() => changeStatus(s, 'rechazado')}>
                                <XCircle className="w-3.5 h-3.5" /> Rechazar
                              </Button>
                            </>
                          )}
                          {s.status === 'activo' && (
                            <Button size="sm" variant="outline" className="gap-1 text-gray-700" onClick={() => changeStatus(s, 'bloqueado')}>
                              <UserMinus className="w-3.5 h-3.5" /> Dar de baja
                            </Button>
                          )}
                          {s.status === 'bloqueado' && (
                            <Button size="sm" variant="outline" className="gap-1 text-green-700" onClick={() => changeStatus(s, 'activo')}>
                              <UserCheck className="w-3.5 h-3.5" /> Reactivar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
