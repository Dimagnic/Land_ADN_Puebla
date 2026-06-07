import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { Lock, CheckCircle2, PlayCircle, BookOpen, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { getModules, getUserProgress, getUserEvaluations } from '@/lib/supabaseClient.js';

const ModulesPage = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [moduleProgress, setModuleProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [mods, progress, evals] = await Promise.all([
        getModules(),
        getUserProgress(user.id),
        getUserEvaluations(user.id),
      ]);
      setModules(mods);
      const completedIds = new Set(progress.filter(p => p.completed).map(p => p.lesson_id));
      const calculated = {};
      let totalLessons = 0;
      let totalCompleted = 0;
      mods.forEach(mod => {
        const lessons = mod.lessons || [];
        const completed = lessons.filter(l => completedIds.has(l.id)).length;
        const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
        const passed = evals.some(e => e.module_id === mod.id && e.passed);
        calculated[mod.id] = { percentage: pct, completed, total: lessons.length, passed };
        totalLessons += lessons.length;
        totalCompleted += completed;
      });
      setModuleProgress(calculated);
      setOverallProgress(totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0);
      setLoading(false);
    }
    load();
  }, [user]);

  const isUnlocked = (mod, idx) => {
    if (idx === 0) return true;
    const prev = modules[idx - 1];
    if (!prev) return false;
    const prevProgress = moduleProgress[prev.id];
    // Desbloquea solo si el alumno aprobó el examen final del módulo anterior
    return prevProgress && prevProgress.passed === true;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-muted-foreground">Cargando módulos...</p>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Módulos de capacitación | ADN Puebla</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing:'-0.02em'}}>
              Módulos de capacitación
            </h1>
            <p className="text-muted-foreground text-lg">
              Completa cada módulo para desbloquear el siguiente. Se requiere 70% de progreso para avanzar.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tu línea de tiempo</h2>
              <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3 mb-6" />
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {modules.map((mod, idx) => {
                const prog = moduleProgress[mod.id] || { percentage: 0, passed: false };
                const unlocked = isUnlocked(mod, idx);
                return (
                  <React.Fragment key={mod.id}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        prog.passed ? 'bg-primary border-primary text-primary-foreground' :
                        prog.percentage > 0 ? 'bg-primary/20 border-primary text-primary' :
                        unlocked ? 'bg-background border-border text-muted-foreground' :
                        'bg-muted border-muted text-muted-foreground opacity-50'
                      }`}>
                        {prog.passed ? <CheckCircle2 className="w-5 h-5" /> : !unlocked ? <Lock className="w-4 h-4" /> : mod.order_num}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 text-center max-w-[60px] leading-tight">
                        M{mod.order_num}
                      </span>
                      {prog.percentage > 0 && !prog.passed && (
                        <span className="text-xs font-semibold text-primary">{prog.percentage}%</span>
                      )}
                    </div>
                    {idx < modules.length - 1 && (
                      <div className={`h-0.5 flex-1 min-w-[20px] ${
                        moduleProgress[mod.id]?.percentage >= 70 ? 'bg-primary' : 'bg-border'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, idx) => {
              const unlocked = isUnlocked(mod, idx);
              const prog = moduleProgress[mod.id] || { percentage: 0, completed: 0, total: (mod.lessons||[]).length, passed: false };
              return (
                <Card key={mod.id} className={`transition-all duration-200 ${unlocked ? 'hover:shadow-lg hover:-translate-y-1' : 'opacity-60'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={prog.passed ? 'default' : 'secondary'}>
                        Módulo {mod.order_num}
                      </Badge>
                      {!unlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                      {prog.passed && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <CardTitle className="text-lg leading-snug">{mod.title}</CardTitle>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1 line-clamp-2">{mod.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {prog.completed} de {prog.total} lecciones
                          </span>
                          <span className="text-sm font-semibold text-primary">{prog.percentage}%</span>
                        </div>
                        <Progress value={prog.percentage} className="h-2" />
                      </div>
                      {prog.passed && (
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                          <Trophy className="w-4 h-4" />
                          Examen aprobado
                        </div>
                      )}
                      {unlocked ? (
                        <Button asChild className="w-full">
                          <Link to={`/module/${mod.id}`}>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {prog.passed ? 'Revisar' : prog.percentage > 0 ? 'Continuar' : 'Comenzar'}
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          <Lock className="w-4 h-4 mr-2" />
                          Requiere 70% del módulo anterior
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModulesPage;
