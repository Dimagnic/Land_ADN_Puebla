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
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: prospect.email,
          password: prospect.password_temp || 'ADNPuebla2024!',
        });
        if (signupError) throw signupError;
        const userId = signupData.user?.id;
        if (userId) {
          await supabase.from('profiles').upsert({
            id: userId,
            nombre_completo: prospect.nombre,
            telefono: prospect.telefono,
            role: 'alumno',
            status: 'pendiente',
          });
          await supabase.from('prospects').update({ estado: 'convertido', user_id: userId }).eq('id', id);
          setItems(p => p.map(x => x.id === id ? { ...x, estado: 'convertido', user_id: userId } : x));
          toast.dismiss();
          toast.success(`✅ Usuario creado: ${prospect.email} — pendiente de aprobación`);
          return;
        }
      } catch (err) {
        toast.dismiss();
        toast.error(`Error al crear usuario: ${err.message}`);
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
              <tr>{['Nombre', 'Email', 'Teléfono', 'Interés', 'Estado', 'Fecha', 'Acción'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.telefono || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.interes || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATE_COLOR[p.estado] || ''}`}>{p.estado}</span>
                    {p.user_id && <span className="ml-2 text-xs text-green-600">👤</span>}
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