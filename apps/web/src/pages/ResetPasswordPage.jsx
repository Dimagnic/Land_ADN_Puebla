import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Supabase intercepts the token from the URL and sets a session automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      else {
        toast.error('El enlace no es valido o ya expiro. Solicita uno nuevo.');
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) { toast.error('Completa todos los campos'); return; }
    if (password.length < 6) { toast.error('La contrasena debe tener al menos 6 caracteres'); return; }
    if (password !== confirm) { toast.error('Las contrasenas no coinciden'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error('No se pudo actualizar la contrasena. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <>
      <Helmet><title>Contrasena actualizada - ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Contrasena actualizada</h1>
          <p className="text-muted-foreground mb-6">Tu contrasena fue cambiada exitosamente. Redirigiendo al inicio de sesion...</p>
          <Button asChild className="w-full"><Link to="/login">Ir a iniciar sesion</Link></Button>
        </div>
      </div>
    </>
  );

  if (!validSession) return (
    <>
      <Helmet><title>Enlace invalido - ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Enlace invalido o expirado</h1>
          <p className="text-muted-foreground mb-6">Solicita un nuevo enlace desde la pantalla de inicio de sesion.</p>
          <Button asChild className="w-full"><Link to="/login">Volver al login</Link></Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Helmet><title>Nueva contrasena - ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/"><img src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png" alt="ADN Puebla" className="w-[150px] mx-auto mb-6 object-contain" /></Link>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" />Crear nueva contrasena</CardTitle>
              <CardDescription>Elige una contrasena segura para tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nueva contrasena</Label>
                  <div className="relative mt-1">
                    <Input type={showPass ? 'text' : 'password'} placeholder="Minimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Confirmar contrasena</Label>
                  <div className="relative mt-1">
                    <Input type={showConf ? 'text' : 'password'} placeholder="Repite tu contrasena" value={confirm} onChange={e => setConfirm(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowConf(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar nueva contrasena'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
