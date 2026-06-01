import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Completa todos los campos'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar sesión - ADN Puebla</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img
                src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png"
                alt="ADN Puebla"
                className="w-[150px] sm:w-[200px] mx-auto mb-6 object-contain"
              />
            </Link>
            <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>ADN Puebla</h1>
            <p className="text-lg text-muted-foreground">Tu camino hacia la libertad financiera</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Iniciar sesión</span>
              </CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email" type="email" placeholder="correo@ejemplo.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="mt-1 bg-background text-foreground"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="bg-background text-foreground pr-10"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
            <Link to="/" className="hover:text-primary transition-colors">← Volver al inicio</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
