import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet';
import { User, Award, Flame, TrendingUp, Trophy } from 'lucide-react';
import { modulesData } from '@/components/LessonContent.jsx';

const ProfilePage = () => {
  const { user, getStreak } = useAuth();
  const [stats, setStats] = useState({
    overallProgress: 0,
    level: 'Semilla',
    badges: [],
  });
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const progress = JSON.parse(localStorage.getItem('adnPueblaProgress') || '{}');
    const badges = JSON.parse(localStorage.getItem('adnPueblaBadges') || '[]');

    let totalLessons = 0;
    let completedLessons = 0;

    modulesData.forEach((module) => {
      totalLessons += module.lessons.length;
      const moduleProgress = progress[module.id] || {};
      completedLessons += Object.values(moduleProgress).filter(Boolean).length;
    });

    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    let level = 'Semilla';
    if (overallProgress >= 80) level = 'Diamante ADN';
    else if (overallProgress >= 60) level = 'Árbol';
    else if (overallProgress >= 40) level = 'Raíz';
    else if (overallProgress >= 20) level = 'Brote';

    setStats({ overallProgress, level, badges });

    const mockRanking = [
      { name: 'Carlos Ramírez', progress: 94 },
      { name: 'Ana Martínez', progress: 87 },
      { name: 'Luis Hernández', progress: 83 },
      { name: user.nombreCompleto, progress: overallProgress },
      { name: 'Patricia Gómez', progress: 71 },
    ].sort((a, b) => b.progress - a.progress);

    setRanking(mockRanking.slice(0, 5));
  }, [user]);

  const levelColors = {
    'Semilla': 'bg-gray-500',
    'Brote': 'bg-green-500',
    'Raíz': 'bg-blue-500',
    'Árbol': 'bg-purple-500',
    'Diamante ADN': 'bg-primary',
  };

  return (
    <>
      <Helmet>
        <title>{`Perfil de ${user.nombreCompleto} | ADN Puebla`}</title>
        <meta name="description" content="Tu perfil, progreso y logros en ADN Puebla" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              Mi perfil
            </h1>
            <p className="text-muted-foreground text-lg">
              Tu progreso y logros en ADN Puebla
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Información personal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{user.nombreCompleto}</p>
                      <p className="text-sm text-muted-foreground">Código: {user.codigoDistribuidor}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Patrocinador</p>
                      <p className="font-medium">{user.nombrePatrocinador}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tipo de usuario</p>
                      <Badge>{user.tipoUsuario === 'patrocinador' ? 'Patrocinador' : 'Alumno'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Nivel actual</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${levelColors[stats.level]}`}></div>
                        <p className="font-medium">{stats.level}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Racha de días</p>
                      <div className="flex items-center space-x-2">
                        <Flame className="w-5 h-5 text-primary streak-flame" />
                        <p className="font-medium">{getStreak()} días consecutivos</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Progreso general</p>
                      <p className="text-2xl font-bold text-primary">{stats.overallProgress}%</p>
                    </div>
                    <Progress value={stats.overallProgress} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Insignias ganadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.badges.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Completa módulos para ganar insignias
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {stats.badges.map((moduleId) => (
                      <div
                        key={moduleId}
                        className="aspect-square bg-primary/10 rounded-xl flex flex-col items-center justify-center badge-celebration"
                      >
                        <Trophy className="w-8 h-8 text-primary mb-1" />
                        <p className="text-xs font-medium text-primary">Módulo {moduleId}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Ranking del equipo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ranking.map((member, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      member.name === user.nombreCompleto
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-muted-foreground/20'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {member.name === user.nombreCompleto && (
                          <Badge variant="outline" className="mt-1">Tú</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{member.progress}%</p>
                      <p className="text-xs text-muted-foreground">progreso</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;