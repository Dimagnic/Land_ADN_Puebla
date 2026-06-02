import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const REDIRECT_URL = `${window.location.origin}/reset-password`;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update');
      }
    });

    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const isRecovery =
      url.searchParams.get('type') === 'recovery' ||
      hashParams.get('type') === 'recovery' ||
      hashParams.get('access_token');

    if (isRecovery) setMode('update');

    return () => subscription.unsubscribe();
  }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Ingresa tu correo'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: REDIRECT_URL,
      });
      if (error) throw error;
      setMode('done');
    } catch (err) {
      toast.error('Error al enviar el correo. Verifica la dirección.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) { toast.error('Mínimo 6 caracteres'); return; }
    if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('¡Contraseña actualizada correctamente!');
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      toast.error('Error al actualizar. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'done') return (
    <>
      <Helmet><title>Correo enviado | ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-3">Revisa tu correo</h1>
          <p className="text-muted-foreground mb-2">Te enviamos un enlace de recuperación a:</p>
          <p className="font-medium mb-6">{email}</p>
          <p className="text-sm text-muted-foreground mb-8">
            Si no lo ves en tu bandeja principal, revisa la carpeta de spam. El enlace expira en 1 hora.
          </p>
          <Button asChild className="w-full">
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </div>
    </>
  );

  if (mode === 'update') return (
    <>
      <Helmet><title>Nueva contraseña | ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Establecer contraseña
              </CardTitle>
              <CardDescription>Ingresa tu nueva contraseña para acceder.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label>Nueva contraseña *</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Confirmar contraseña *</Label>
                  <Input
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="mt-1"
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar contraseña'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Helmet><title>Recuperar contraseña | ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img
                src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png"
                alt="ADN Puebla"
                className="w-[150px] mx-auto mb-6 object-contain"
              />
            </Link>
            <h1 className="text-3xl font-bold mb-2">Recuperar contraseña</h1>
            <p className="text-muted-foreground">Te enviaremos un enlace para restablecer tu contraseña</p>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Restablecer contraseña
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <Label>Correo electrónico *</Label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mt-1"
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="hover:text-primary transition-colors">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
