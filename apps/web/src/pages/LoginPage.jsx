import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Sparkles, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [view, setView]         = useState('login'); // 'login' | 'forgot' | 'forgot-sent'
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Completa todos los campos'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bienvenido!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Correo o contrasena incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!resetEmail) { toast.error('Ingresa tu correo'); return; }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setView('forgot-sent');
    } catch (err) {
      toast.error('No se pudo enviar el correo. Verifica la direccion.');
    } finally {
      setResetLoading(false);
    }
  };

  if (view === 'forgot') return (
    <>
      <Helmet><title>Recuperar contrasena - ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/"><img src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png" alt="ADN Puebla" className="w-[150px] mx-auto mb-6 object-contain" /></Link>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-primary" />Recuperar contrasena</CardTitle>
              <CardDescription>Te enviaremos un enlace para restablecer tu contrasena.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email">Correo electronico</Label>
                  <Input id="reset-email" type="email" placeholder="correo@ejemplo.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="mt-1" autoComplete="email" />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={resetLoading}>
                  {resetLoading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
                </Button>
              </form>
              <button onClick={() => setView('login')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mt-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesion
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  if (view === 'forgot-sent') return (
    <>
      <Helmet><title>Correo enviado - ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Revisa tu correo</h1>
          <p className="text-muted-foreground mb-2">Enviamos un enlace de recuperacion a:</p>
          <p className="font-medium mb-6">{resetEmail}</p>
          <p className="text-sm text-muted-foreground mb-8">Si no lo ves en tu bandeja, revisa la carpeta de spam. El enlace expira en 1 hora.</p>
          <Button variant="outline" className="w-full" onClick={() => { setView('login'); setResetEmail(''); }}>
            Volver al inicio de sesion
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Helmet><title>Iniciar sesion - ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/"><img src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png" alt="ADN Puebla" className="w-[150px] sm:w-[200px] mx-auto mb-6 object-contain" /></Link>
            <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>ADN Puebla</h1>
            <p className="text-lg text-muted-foreground">Tu camino hacia la libertad financiera</p>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Iniciar sesion</span>
              </CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo electronico</Label>
                  <Input id="email" type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 bg-background text-foreground" autoComplete="email" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="password">Contrasena</Label>
                    <button type="button" onClick={() => { setResetEmail(email); setView('forgot'); }} className="text-xs text-primary hover:underline">
                      Olvide mi contrasena
                    </button>
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="bg-background text-foreground pr-10" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Ingresar a la plataforma'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/" className="hover:text-primary transition-colors">Volver al inicio</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
