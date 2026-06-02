import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { UserPlus, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', interes: '', password: '', confirmPassword: '',
  });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.telefono || !form.password) {
      toast.error('Completa todos los campos obligatorios'); return;
    }
    if (form.password.length < 6) {
      toast.error('La contrasena debe tener al menos 6 caracteres'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Las contrasenas no coinciden'); return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('prospects').insert([{
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        interes: form.interes || 'Curso ADN Puebla',
        estado: 'nuevo',
        password_hash: form.password,
      }]);
      if (error) {
        if (error.code === '23505') {
          toast.error('Este correo ya fue registrado. Contacta a un asesor.');
        } else {
          throw error;
        }
        return;
      }
      setSuccess(true);
    } catch (err) {
      toast.error('Error al enviar solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <>
      <Helmet><title>Registro exitoso | ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Solicitud enviada!</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Tu solicitud ha sido recibida. Un asesor revisara tu informacion y te dara acceso a la plataforma en breve.
          </p>
          <Button asChild className="w-full"><Link to="/">Volver al inicio</Link></Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Helmet><title>Registro | ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/"><img src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png" alt="ADN Puebla" className="w-[150px] mx-auto mb-6 object-contain" /></Link>
            <h1 className="text-3xl font-bold mb-2">Solicitar acceso</h1>
            <p className="text-muted-foreground">Completa el formulario y un asesor te contactara</p>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" />Formulario de registro</CardTitle>
              <CardDescription>Un asesor revisara tu solicitud y te dara acceso a la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nombre completo *</Label>
                  <Input type="text" placeholder="Tu nombre completo" value={form.nombre} onChange={set('nombre')} className="mt-1" />
                </div>
                <div>
                  <Label>Correo electronico *</Label>
                  <Input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')} className="mt-1" />
                </div>
                <div>
                  <Label>Telefono *</Label>
                  <Input type="tel" placeholder="(222) 123-4567" value={form.telefono} onChange={set('telefono')} className="mt-1" />
                </div>
                <div>
                  <Label>Que te interesa aprender? <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                  <Input type="text" placeholder="Ej: Educacion financiera, inversiones..." value={form.interes} onChange={set('interes')} className="mt-1" />
                </div>
                <div>
                  <Label>Contrasena *</Label>
                  <div className="relative mt-1">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Minimo 6 caracteres" value={form.password} onChange={set('password')} className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Confirmar contrasena *</Label>
                  <div className="relative mt-1">
                    <Input type={showConfirm ? 'text' : 'password'} placeholder="Repite tu contrasena" value={form.confirmPassword} onChange={set('confirmPassword')} className="pr-10" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline font-medium">Iniciar sesion</Link>
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            <Link to="/" className="hover:text-primary transition-colors">Volver al inicio</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
