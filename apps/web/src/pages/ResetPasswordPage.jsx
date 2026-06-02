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
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) setMode('update');
  }, []);
  const handleRequest = async e => {
    e.preventDefault();
    if (!email) { toast.error('Ingresa tu correo'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://adnpuebla.site/reset-password' });
      if (error) throw error;
      setMode('done');
    } catch { toast.error('Error al enviar el correo.'); }
    finally { setLoading(false); }
  };
  const handleUpdate = async e => {
    e.preventDefault();
    if (!password || password.length < 6) { toast.error('Minimo 6 caracteres'); return; }
    if (password !== confirm) { toast.error('Las contrasenas no coinciden'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Contrasena actualizada');
      setTimeout(() => navigate('/login'), 1500);
    } catch { toast.error('Error al actualizar. El enlace puede haber expirado.'); }
    finally { setLoading(false); }
  };
  if (mode === 'done') return (<><Helmet><title>Correo enviado | ADN Puebla</title></Helmet><div className="min-h-screen flex items-center justify-center bg-background px-4 py-12"><div className="w-full max-w-md text-center"><CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6"/><h1 className="text-2xl font-bold mb-3">Revisa tu correo</h1><p className="text-muted-foreground mb-6">Te enviamos un enlace. Revisa bandeja de entrada y spam.</p><Button asChild className="w-full"><Link to="/login">Volver al inicio de sesion</Link></Button></div></div></>);
  if (mode === 'update') return (<><Helmet><title>Nueva contrasena | ADN Puebla</title></Helmet><div className="min-h-screen flex items-center justify-center bg-background px-4 py-12"><div className="w-full max-w-md"><Card className="shadow-lg"><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary"/>Establecer contrasena</CardTitle><CardDescription>Ingresa tu nueva contrasena para acceder.</CardDescription></CardHeader><CardContent><form onSubmit={handleUpdate} className="space-y-4"><div><Label>Nueva contrasena *</Label><div className="relative mt-1"><Input type={showPass?'text':'password'} placeholder="Minimo 6 caracteres" value={password} onChange={e=>setPassword(e.target.value)} className="pr-10"/><button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div><div><Label>Confirmar contrasena *</Label><Input type="password" placeholder="Repite tu contrasena" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-1"/></div><Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>{loading?'Guardando...':'Guardar contrasena'}</Button></form></CardContent></Card></div></div></>);
  return (<><Helmet><title>Recuperar contrasena | ADN Puebla</title></Helmet><div className="min-h-screen flex items-center justify-center bg-background px-4 py-12"><div className="w-full max-w-md"><div className="text-center mb-8"><Link to="/"><img src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png" alt="ADN Puebla" className="w-[150px] mx-auto mb-6 object-contain"/></Link><h1 className="text-3xl font-bold mb-2">Recuperar contrasena</h1><p className="text-muted-foreground">Te enviaremos un enlace para restablecer tu contrasena</p></div><Card className="shadow-lg"><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary"/>Restablecer contrasena</CardTitle></CardHeader><CardContent><form onSubmit={handleRequest} className="space-y-4"><div><Label>Correo electronico *</Label><Input type="email" placeholder="correo@ejemplo.com" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1"/></div><Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>{loading?'Enviando...':'Enviar enlace de recuperacion'}</Button></form></CardContent></Card><p className="text-center text-sm text-muted-foreground mt-6"><Link to="/login" className="hover:text-primary transition-colors">Volver al inicio de sesion</Link></p></div></div></>);
};
export default ResetPasswordPage;
