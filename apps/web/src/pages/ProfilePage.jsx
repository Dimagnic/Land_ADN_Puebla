import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet-async';
import { User, Award, Flame, TrendingUp, Trophy, RefreshCw , ArrowLeft } from 'lucide-react';
import { getModules, getUserProgress, getUserEvaluations } from '@/lib/supabaseClient.js';

const LEVELS = [
  { name: 'Semilla',     min: 0,   color: 'bg-gray-500' },
  { name: 'Brote',       min: 20,  color: 'bg-green-500' },
  { name: 'Raíz',        min: 40,  color: 'bg-blue-500' },
  { name: 'Árbol',       min: 60,  color: 'bg-purple-500' },
  { name: 'Diamante ADN',min: 80,  color: 'bg-primary' },
];

function getLevel(pct) {
  return [...LEVELS].reverse().find(l => pct >= l.min) || LEVELS[0];
}

const ProfilePage = () => {
  const { user, profile, getStreak } = useAuth();
  const [stats, setStats] = useState({ overallProgress: 0, badges: [] });
  const [loading, setLoading] = useState(true);

  const nombreCompleto = profile?.nombre_completo || user?.email || 'Usuario';

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const [mods, progress, evals] = await Promise.all([
        getModules(),
        getUserProgress(user.id),
        getUserEvaluations(user.id),
      ]);
      const completedIds = new Set(progress.filter(p => p.completed).map(p => p.lesson_id));
      let total = 0, completed = 0;
      const badges = [];
      mods.forEach(mod => {
        const lessons = mod.lessons || [];
        total += lessons.length;
        const done = lessons.filter(l => completedIds.has(l.id)).length;
        completed += done;
        const passed = evals.some(e => e.module_id === mod.id && e.passed);
        if (passed) badges.push(mod.id);
      });
      const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
      setStats({ overallProgress, badges });
      setLoading(false);
    }
    loadData();
  }, [user]);

  const level = getLevel(stats.overallProgress);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-muted-foreground">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Cargando perfil...</span>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{`Perfil de ${nombreCompleto} | ADN Puebla`}</title>
        <meta name="description" content="Tu perfil, progreso y logros en ADN Puebla" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm font-medium transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              Mi perfil
            </h1>
            <p className="text-muted-foreground text-lg">Tu progreso y logros en ADN Puebla</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Información personal</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{nombreCompleto}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-4 border-t">
                    {profile?.codigo_adn && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Código ADN</p>
                        <p className="font-medium font-mono">{profile.codigo_adn}</p>
                      </div>
                    )}
                    {profile?.nombre_patrocinador && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Patrocinador</p>
                        <p className="font-medium">{profile.nombre_patrocinador}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tipo de usuario</p>
                      <Badge>{profile?.role === 'patrocinador' ? 'Patrocinador' : profile?.role === 'admin' ? 'Admin' : 'Alumno'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Nivel actual</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                        <p className="font-medium">{level.name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Racha de días</p>
                      <div className="flex items-center space-x-2">
                        <Flame className="w-5 h-5 text-primary" />
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
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Completa y aprueba módulos para ganar insignias
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {stats.badges.map((moduleId) => (
                      <div key={moduleId}
                        className="aspect-square bg-primary/10 rounded-xl flex flex-col items-center justify-center">
                        <Trophy className="w-8 h-8 text-primary mb-1" />
                        <p className="text-xs font-medium text-primary">Aprobado</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
