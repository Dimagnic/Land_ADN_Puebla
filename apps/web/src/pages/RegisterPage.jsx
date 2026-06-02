import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { UserPlus, CheckCircle2 } from 'lucide-react';
const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ nombre:'',email:'',telefono:'',interes:'' });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre||!form.email||!form.telefono){toast.error('Completa todos los campos');return;}
    setLoading(true);
    try {
      const {error} = await supabase.from('prospects').insert([{nombre:form.nombre,email:form.email,telefono:form.telefono,interes:form.interes||'Curso ADN Puebla',estado:'nuevo'}]);
      if(error){if(error.code==='23505')toast.error('Correo ya registrado');else throw error;return;}
      setSuccess(true);
    } catch{toast.error('Error al enviar. Intenta de nuevo.');}
    finally{setLoading(false);}
  };
  if(success)return(<><Helmet><title>Registro exitoso | ADN Puebla</title></Helmet><div className="min-h-screen flex items-center justify-center bg-background px-4 py-12"><div className="w-full max-w-md text-center"><CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6"/><h1 className="text-2xl font-bold mb-3">Solicitud enviada</h1><p className="text-muted-foreground mb-6">Cuando tu solicitud sea aprobada recibiras un correo para establecer tu contrasena y acceder.</p><Button asChild className="w-full"><Link to="/">Volver al inicio</Link></Button></div></div></>);
  return(<><Helmet><title>Registro | ADN Puebla</title></Helmet><div className="min-h-screen flex items-center justify-center bg-background px-4 py-12"><div className="w-full max-w-md"><div className="text-center mb-8"><Link to="/"><img src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png" alt="ADN Puebla" className="w-[150px] mx-auto mb-6 object-contain"/></Link><h1 className="text-3xl font-bold mb-2">Solicitar acceso</h1><p className="text-muted-foreground">Completa el formulario y un asesor te contactara</p></div><Card className="shadow-lg"><CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary"/>Formulario de registro</CardTitle><CardDescription>Al aprobar tu solicitud recibiras un correo para acceder.</CardDescription></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4"><div><Label>Nombre completo *</Label><Input type="text" placeholder="Tu nombre completo" value={form.nombre} onChange={set('nombre')} className="mt-1"/></div><div><Label>Correo electronico *</Label><Input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')} className="mt-1"/></div><div><Label>Telefono *</Label><Input type="tel" placeholder="(222) 123-4567" value={form.telefono} onChange={set('telefono')} className="mt-1"/></div><div><Label>Que te interesa aprender? <span className="text-xs text-muted-foreground">(opcional)</span></Label><Input type="text" placeholder="Ej: Educacion financiera..." value={form.interes} onChange={set('interes')} className="mt-1"/></div><Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>{loading?'Enviando...':'Enviar solicitud'}</Button></form></CardContent></Card><p className="text-center text-sm text-muted-foreground mt-6">Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline font-medium">Iniciar sesion</Link></p></div></div></>);
};
export default RegisterPage;
