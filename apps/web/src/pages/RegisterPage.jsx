import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { UserPlus, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    codigo_patrocinador: '',
    password: '',
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre_completo || !form.email || !form.telefono || !form.password) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { nombre_completo: form.nombre_completo } }
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          nombre_completo: form.nombre_completo,
          telefono: form.telefono,
          codigo_distribuidor: form.codigo_patrocinador || null,
          role: 'alumno',
          status: 'pendiente',
        });
        await supabase.auth.signOut();
        setSuccess(true);
      }
    } catch (err) {
      if (err.message?.includes('already registered')) {
        toast.error('Este correo ya está registrado');
      } else {
        toast.error('Error al registrarse. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Helmet><title>Registro exitoso | ADN Puebla</title></Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-3">¡Solicitud enviada!</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Tu solicitud de registro ha sido recibida. Un administrador revisará tu información y te notificará cuando tu cuenta esté activa.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Recibirás acceso a la plataforma una vez que tu solicitud sea aprobada.
            </p>
            <Button asChild className="w-full">
              <Link to="/">← Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Registro | ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png"
                alt="ADN Puebla" className="w-[150px] sm:w-[180px] mx-auto mb-6 object-contain" />
            </Link>
            <h1 className="text-3xl font-bold mb-2">Solicitar acceso</h1>
            <p className="text-muted-foreground">Completa el formulario para solicitar tu registro en ADN Puebla</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Formulario de registro
              </CardTitle>
              <CardDescription>Tu solicitud será revisada por un administrador antes de activar tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent>