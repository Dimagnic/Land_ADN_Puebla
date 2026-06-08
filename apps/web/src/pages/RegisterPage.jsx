import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { UserPlus, CheckCircle2, Users } from 'lucide-react';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const refToken = searchParams.get('ref');

  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [sponsorInfo, setSponsorInfo] = useState(null);
  const [form, setForm]             = useState({ nombre: '', email: '', telefono: '', interes: '' });

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  // Buscar info del patrocinador si viene con ?ref=
  useEffect(() => {
    if (!refToken) return;
    supabase
      .from('sponsor_links')
      .select('sponsor_id, profiles:sponsor_id(nombre_completo)')
      .eq('token', refToken)
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSponsorInfo({
          sponsorId: data.sponsor_id,
          nombre: data.profiles?.nombre_completo,
        });
      });
  }, [refToken]);

  // Notificar al admin via Edge Function
  const notifyAdmin = async (nombre, email, telefono, interes) => {
    try {
      await fetch('https://riqlkzzqkkiytoonnysj.supabase.co/functions/v1/notify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'nuevo_prospecto',
          data: { nombre, email, telefono, interes },
        }),
      });
    } catch {} // No bloquear el flujo si falla el email
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.telefono) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    setLoading(true);
    try {
      // Insertar en prospects primero
      const { error } = await supabase.from('prospects').insert([{
        nombre:   form.nombre,
        email:    form.email,
        telefono: form.telefono,
        interes:  form.interes || 'Curso ADN Puebla',
        estado:   'nuevo',
        fuente:   refToken ? `enlace_patrocinador_${refToken}` : 'landing_page',
      }]);

      if (error) {
        if (error.code === '23505') toast.error('Este correo ya está registrado');
        else throw error;
        return;
      }

      // Si viene de enlace de patrocinador, incrementar el contador de usos
      if (refToken && sponsorInfo) {
        await supabase.rpc('generate_sponsor_token', { p_sponsor_id: sponsorInfo.sponsorId });
        await supabase
          .from('sponsor_links')
          .update({ uses: supabase.raw('uses + 1') })
          .eq('token', refToken);
      }

      // Notificar al admin (no bloqueante)
      notifyAdmin(form.nombre, form.email, form.telefono, form.interes);
      setSuccess(true);
    } catch {
      toast.error('Error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <>
      <Helmet><title>Registro exitoso | ADN Puebla</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-3">¡Solicitud enviada!</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {sponsorInfo?.nombre
              ? `Tu patrocinador ${sponsorInfo.nombre} revisará tu solicitud.`
              : 'Un asesor revisará tu solicitud.'
            }
            {' '}Cuando sea aprobada recibirás un correo para establecer tu contraseña y acceder.
          </p>
          <Button asChild className="w-full">
            <Link to="/">Volver al inicio</Link>
          </Button>
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
            <Link to="/">
              <img
                src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png"
                alt="ADN Puebla"
                className="w-[150px] mx-auto mb-6 object-contain"
              />
            </Link>
            <h1 className="text-3xl font-bold mb-2">Solicitar acceso</h1>
            <p className="text-muted-foreground">Completa el formulario y un asesor te contactará</p>
          </div>

          {/* Banner de patrocinador si viene con enlace */}
          {sponsorInfo && (
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6">
              <Users className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm">
                Fuiste invitado por <span className="font-semibold text-primary">{sponsorInfo.nombre}</span>.
                Tu registro quedará vinculado a tu patrocinador.
              </p>
            </div>
          )}

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Formulario de registro
              </CardTitle>
              <CardDescription>
                Al aprobar tu solicitud recibirás un correo para acceder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nombre completo *</Label>
                  <Input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={form.nombre}
                    onChange={set('nombre')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Correo electrónico *</Label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={set('email')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Teléfono *</Label>
                  <Input
                    type="tel"
                    placeholder="(222) 123-4567"
                    value={form.telefono}
                    onChange={set('telefono')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>¿Qué te interesa aprender? <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                  <Input
                    type="text"
                    placeholder="Ej: Educación financiera..."
                    value={form.interes}
                    onChange={set('interes')}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
