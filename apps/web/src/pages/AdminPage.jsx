// ── USERS ADMIN ────────────────────────────────────────────────
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
  const ROLE_COLOR = { admin: 'bg-red-100 text-red-800', patrocinador: 'bg-yellow-100 text-yellow-800', alumno: 'bg-blue-100 text-blue-800' };
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
          <Button size="sm" onClick={() => setFilter('pendiente')} className="ml-auto bg-yellow-500 hover:bg-yellow-400 text-black">
            Ver pendientes
          </Button>
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
              <tr>
                {['Nombre', 'Teléfono', 'Código', 'Rol', 'Estado', 'Registro', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.nombre_completo || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.telefono || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.codigo_distribuidor || '—'}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-background">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[u.status || 'activo'] || ''}`}>
                      {u.status || 'activo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.status === 'pendiente' && (
                        <>
                          <button onClick={() => changeStatus(u.id, 'activo')}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-medium">
                            ✅ Aprobar
                          </button>
                          <button onClick={() => changeStatus(u.id, 'rechazado')}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-medium">
                            ❌ Rechazar
                          </button>
                        </>
                      )}
                      {u.status === 'rechazado' && (
                        <button onClick={() => changeStatus(u.id, 'activo')}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-medium">
                          ✅ Aprobar
                        </button>
                      )}
                      {(u.status === 'activo' || !u.status) && u.role !== 'admin' && (
                        <button onClick={() => changeStatus(u.id, 'rechazado')}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded font-medium">
                          Bloquear
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
    </div>
  );
}