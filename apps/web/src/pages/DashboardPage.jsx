import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AnnouncementBoard from '@/components/AnnouncementBoard.jsx';
import { Helmet } from 'react-helmet-async';
import { BookOpen, CheckCircle2, Trophy, Flame, ArrowRight, MessageCircle, Award, Shield, LogOut, BookMarked, Calendar, Download, User } from 'lucide-react';
import { getUserProgress, getUserEvaluations, getModules } from '@/lib/supabaseClient.js';
import ThemeToggle from '@/components/ThemeToggle.jsx';

const DashboardPage = () => {
  const { user, profile, isAdmin, logout, getStreak } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [stats, setStats] = useState({ modulesCompleted: 0, lessonsViewed: 0, evaluationsPassed: 0, overallProgress: 0 });
  const [nextModule, setNextModule] = useState(null);

  const nombreCompleto = profile?.nombre_completo || user?.email || 'Usuario';
  const primerNombre = nombreCompleto.split(' ')[0];

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const [mods, progress, evals] = await Promise.all([getModules(), getUserProgress(user.id), getUserEvaluations(user.id)]);
      const completedLessonIds = new Set(progress.filter(p => p.completed).map(p => p.lesson_id));
      let modulesCompleted = 0, totalLessons = 0;
      mods.forEach(mod => {
        const lessons = mod.lessons || [];
        totalLessons += lessons.length;
        const completedInModule = lessons.filter(l => completedLessonIds.has(l.id)).length;
        if (lessons.length > 0 && completedInModule === lessons.length) modulesCompleted++;
      });
      const evaluationsPassed = evals.filter(e => e.passed).length;
      const overallProgress = totalLessons > 0 ? Math.round((completedLessonIds.size / totalLessons) * 100) : 0;
      setStats({ modulesCompleted, lessonsViewed: completedLessonIds.size, evaluationsPassed, overallProgress });
      const firstIncomplete = mods.find(mod => (mod.lessons || []).some(l => !completedLessonIds.has(l.id)));
      setNextModule(firstIncomplete || mods[0]);
    }
    loadData();
  }, [user]);

  const motivationalMessages = ['Cada lección te acerca más a tus metas', 'Tu esfuerzo de hoy es tu éxito de mañana', 'La constancia es la clave del éxito', 'Estás construyendo tu libertad financiera'];
  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <>
      <Helmet>
        <title>{`Dashboard - ${primerNombre} | ADN Puebla`}</title>
      </Helmet>

      {/* Header de la plataforma */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <img src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png"
                  alt="ADN Puebla" className="h-8 md:h-10 object-contain brightness-0 invert" />
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link to="/modules" className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
                  <BookMarked className="w-4 h-4" /> Módulos
                </Link>
                <Link to="/events" className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
                  <Calendar className="w-4 h-4" /> Eventos
                </Link>
                <Link to="/resources" className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
                  <Download className="w-4 h-4" /> Recursos
                </Link>
                <Link to="/profile" className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
                  <User className="w-4 h-4" /> Perfil
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <Button onClick={() => navigate('/admin')} size="sm"
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold gap-1 text-xs md:text-sm px-2 md:px-3">
                  <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              <ThemeToggle className="text-primary-foreground/70 hover:bg-primary-foreground/10" />
              <Button onClick={handleLogout} variant="ghost" size="sm"
                className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1 px-2">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
              </Button>
              {/* Hamburger mobile */}
              <button className="md:hidden p-1.5 rounded-md hover:bg-primary-foreground/10 ml-1"
                onClick={() => setMobileMenu(p => !p)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenu && (
          <div className="md:hidden bg-primary border-t border-primary-foreground/20 px-4 pb-3">
            {[
              { to: '/modules', icon: BookMarked, label: 'Módulos' },
              { to: '/events', icon: Calendar, label: 'Eventos' },
              { to: '/resources', icon: Download, label: 'Recursos' },
              { to: '/profile', icon: User, label: 'Perfil' },

            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} onClick={() => setMobileMenu(false)}
                className="flex items-center gap-3 py-2.5 text-sm text-primary-foreground/80 hover:text-primary-foreground border-b border-primary-foreground/10 last:border-0">
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              Bienvenido, {primerNombre}
            </h1>
            <p className="text-muted-foreground text-lg">{randomMessage}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Tu progreso general</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progreso total</span>
                    <span className="text-2xl font-bold text-primary">{stats.overallProgress}%</span>
                  </div>
                  <Progress value={stats.overallProgress} className="h-3" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { icon: BookOpen, value: stats.modulesCompleted, label: 'Módulos completados' },
                    { icon: CheckCircle2, value: stats.lessonsViewed, label: 'Lecciones vistas' },
                    { icon: Trophy, value: stats.evaluationsPassed, label: 'Evaluaciones aprobadas' },
                    { icon: Flame, value: getStreak(), label: 'Días activo' },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-4 bg-muted rounded-lg">
                      <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold">{item.value}</p>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Tu cuenta</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div><p className="text-sm text-muted-foreground">Nombre</p><p className="font-semibold">{nombreCompleto}</p></div>
                  <div><p className="text-sm text-muted-foreground">Email</p><p className="font-semibold text-sm">{user?.email}</p></div>
                  <div><p className="text-sm text-muted-foreground">Rol</p><p className="font-semibold capitalize">{profile?.role || 'alumno'}</p></div>
                  <Button className="w-full" asChild>
                    <a href="https://wa.me/5212221234567" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-2" /> Contactar por WhatsApp
                    </a>
                  </Button>
                  {stats.overallProgress >= 100 && (
                    <Button asChild size="lg" className="w-full">
                      <Link to="/certificate"><Award className="w-5 h-5 mr-2" />Ver mi Certificado</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {nextModule && (
              <Card>
                <CardHeader><CardTitle>Próximo módulo recomendado</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Módulo {nextModule.order_num}</p>
                      <p className="font-semibold text-lg">{nextModule.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{(nextModule.lessons || []).length} lecciones</p>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/module/${nextModule.id}`}>Ver módulo <ArrowRight className="w-4 h-4 ml-2" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Recursos descargables</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/resources"><BookOpen className="w-4 h-4 mr-2" />Ver todos los recursos</Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">Accede a catálogos, scripts de ventas, imágenes para redes sociales y más</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <AnnouncementBoard />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
