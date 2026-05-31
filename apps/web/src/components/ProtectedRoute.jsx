import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ProtectedRoute = ({ children, sponsorOnly = false, adminOnly = false }) => {
  const { user, profile, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(t);
  }, []);

  if (loading && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (profile?.status === 'pendiente') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">Cuenta pendiente de aprobación</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Tu solicitud está siendo revisada por un administrador. Te notificaremos cuando tu cuenta esté activa.
          </p>
          <button onClick={() => { window.location.href = '/'; }}
            className="text-sm text-primary hover:underline">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (profile?.status === 'rechazado') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">Solicitud no aprobada</h2>
          <p className="text-muted-foreground mb-6">Tu solicitud de registro no fue aprobada. Contacta al administrador para más información.</p>
          <a href="/" className="text-sm text-primary hover:underline">Volver al inicio</a>
        </div>
      </div>
    );
  }

  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (sponsorOnly && !['patrocinador', 'admin'].includes(profile?.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;