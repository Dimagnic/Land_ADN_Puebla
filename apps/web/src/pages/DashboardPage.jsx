import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AnnouncementBoard from '@/components/AnnouncementBoard.jsx';
import { Helmet } from 'react-helmet';
import { BookOpen, CheckCircle2, Trophy, Flame, ArrowRight, MessageCircle, Award } from 'lucide-react';
import { modulesData } from '@/components/LessonContent.jsx';

const DashboardPage = () => {
  const { user, getStreak } = useAuth();
  const [stats, setStats] = useState({
    modulesCompleted: 0,
    lessonsViewed: 0,
    evaluationsPassed: 0,
    overallProgress: 0,
  });
  const [lastLesson, setLastLesson] = useState(null);
  const [nextModule, setNextModule] = useState(null);

  useEffect(() => {
    const progress = JSON.parse(localStorage.getItem('adnPueblaProgress') || '{}');
    const evaluations = JSON.parse(localStorage.getItem('adnPueblaEvaluations') || '[]');

    let modulesCompleted = 0;
    let lessonsViewed = 0;
    let totalLessons = 0;

    modulesData.forEach((module) => {
      totalLessons += module.lessons.length;
      const moduleProgress = progress[module.id] || {};
      const completedLessons = Object.values(moduleProgress).filter(Boolean).length;
      lessonsViewed += completedLessons;
      
      if (completedLessons === module.lessons.length) {
        modulesCompleted++;
      }
    });

    const evaluationsPassed = evaluations.filter((e) => e.passed).length;
    const overallProgress = totalLessons > 0 ? Math.round((lessonsViewed / totalLessons) * 100) : 0;

    setStats({
      modulesCompleted,
      lessonsViewed,
      evaluationsPassed,
      overallProgress,
    });

    if (user.lastLesson) {
      const module = modulesData.find((m) => m.id === user.lastLesson.moduleId);
      const lesson = module?.lessons.find((l) => l.id === user.lastLesson.lessonId);
      if (module && lesson) {
        setLastLesson({ module, lesson });
      }
    }

    const firstIncompleteModule = modulesData.find((module) => {
      const moduleProgress = progress[module.id] || {};
      const completedLessons = Object.values(moduleProgress).filter(Boolean).length;
      return completedLessons < module.lessons.length;
    });

    setNextModule(firstIncompleteModule || modulesData[0]);
  }, [user]);

  const motivationalMessages = [
    'Cada lección te acerca más a tus metas',
    'Tu esfuerzo de hoy es tu éxito de mañana',
    'La constancia es la clave del éxito',
    'Estás construyendo tu libertad financiera',
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <>
      <Helmet>
        <title>{`Dashboard - ${user.nombreCompleto} | ADN Puebla`}</title>
        <meta name="description" content="Panel de control de tu capacitación en ADN Puebla" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <img 
                src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png" 
                alt="ADN Puebla Logo" 
                className="w-[60px] md:w-[80px] object-contain mb-4"
              />
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
                Bienvenido, {user.nombreCompleto.split(' ')[0]}
              </h1>
              <p className="text-muted-foreground text-lg">{randomMessage}</p>
            </div>
            
            {stats.overallProgress >= 100 && (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                <Link to="/certificate">
                  <Award className="w-5 h-5 mr-2" />
                  Ver mi Certificado
                </Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Tu progreso general</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progreso total</span>
                    <span className="text-2xl font-bold text-primary">{stats.overallProgress}%</span>
                  </div>
                  <Progress value={stats.overallProgress} className="h-3 progress-bar-animated" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.modulesCompleted}</p>
                    <p className="text-sm text-muted-foreground">Módulos completados</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.lessonsViewed}</p>
                    <p className="text-sm text-muted-foreground">Lecciones vistas</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.evaluationsPassed}</p>
                    <p className="text-sm text-muted-foreground">Evaluaciones aprobadas</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Flame className="w-8 h-8 text-primary mx-auto mb-2 streak-flame" />
                    <p className="text-2xl font-bold">{getStreak()}</p>
                    <p className="text-sm text-muted-foreground">Días activo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tu patrocinador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-semibold">{user.nombrePatrocinador}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tu código</p>
                    <p className="font-semibold">{user.codigoDistribuidor}</p>
                  </div>
                  <Button className="w-full" asChild>
                    <a
                      href={`https://wa.me/5212221234567?text=Hola ${user.nombrePatrocinador}, soy ${user.nombreCompleto}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contactar por WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {lastLesson && (
              <Card>
                <CardHeader>
                  <CardTitle>Continuar donde lo dejaste</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Módulo {lastLesson.module.id} - Lección {lastLesson.lesson.id}
                      </p>
                      <p className="font-semibold text-lg">{lastLesson.lesson.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{lastLesson.lesson.description}</p>
                    </div>
                    <Button asChild className="w-full">
                      <Link to={`/lesson/${lastLesson.module.id}/${lastLesson.lesson.id}`}>
                        Continuar lección
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {nextModule && (
              <Card>
                <CardHeader>
                  <CardTitle>Próximo módulo recomendado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Módulo {nextModule.id}</p>
                      <p className="font-semibold text-lg">{nextModule.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {nextModule.lessons.length} lecciones
                      </p>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/module/${nextModule.id}`}>
                        Ver módulo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnnouncementBoard />

            <Card>
              <CardHeader>
                <CardTitle>Recursos descargables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/resources">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ver todos los recursos
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Accede a catálogos, scripts de ventas, imágenes para redes sociales y más
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;