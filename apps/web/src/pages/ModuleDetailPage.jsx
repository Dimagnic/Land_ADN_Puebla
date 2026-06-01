import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CheckCircle2, PlayCircle, Lock, Trophy, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase, getUserProgress, getUserEvaluations } from '@/lib/supabaseClient.js';

const ModuleDetailPage = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: mod } = await supabase
        .from('modules').select('*, lessons(*)').eq('id', moduleId).single();
      if (mod) {
        setModule(mod);
        setLessons((mod.lessons || []).sort((a, b) => a.order_num - b.order_num));
      }
      const progress = await getUserProgress(user.id);
      setCompletedIds(new Set(progress.filter(p => p.completed).map(p => p.lesson_id)));
      const evals = await getUserEvaluations(user.id);
      const passed = evals.find(e => e.module_id === moduleId && e.passed);
      setEvaluation(passed || null);
      setLoading(false);
    }
    load();
  }, [user, moduleId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );

  if (!module) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Módulo no encontrado</p>
    </div>
  );

  const completed = lessons.filter(l => completedIds.has(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
  const canTakeExam = pct >= 70;

  return (
    <>
      <Helmet><title>{module.title} | ADN Puebla</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <Link to="/modules" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a módulos
          </Link>

          <div className="bg-card border rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <Badge>Módulo {module.order_num}</Badge>
              {evaluation && <Badge className="bg-green-500 text-white">✓ Aprobado</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{letterSpacing:'-0.02em'}}>{module.title}</h1>
            {module.description && <p className="text-muted-foreground leading-relaxed mb-4">{module.description}</p>}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{completed} de {lessons.length} lecciones completadas</span>
              <span className="text-lg font-bold text-primary">{pct}%</span>
            </div>
            <Progress value={pct} className="h-3" />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Lecciones</h2>
            <div className="space-y-3">
              {lessons.map((lesson, idx) => {
                const isCompleted = completedIds.has(lesson.id);
                const isUnlocked = idx === 0 || completedIds.has(lessons[idx - 1]?.id);
                return (
                  <Card key={lesson.id} className={`transition-all ${isUnlocked ? 'hover:shadow-md' : 'opacity-60'}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-primary text-primary-foreground' :
                        isUnlocked ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                         !isUnlocked ? <Lock className="w-4 h-4" /> :
                         <span className="text-sm font-bold">{lesson.order_num}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lesson.title}</p>
                        {lesson.description && <p className="text-sm text-muted-foreground truncate">{lesson.description}</p>}
                      </div>
                      {isUnlocked ? (
                        <Button asChild size="sm" variant={isCompleted ? 'outline' : 'default'}>
                          <Link to={`/lesson/${module.id}/${lesson.id}`}>
                            <PlayCircle className="w-4 h-4 mr-1" />
                            {isCompleted ? 'Revisar' : 'Ver lección'}
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled size="sm" variant="outline">
                          <Lock className="w-4 h-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className={`border-2 ${canTakeExam ? 'border-primary' : 'border-border opacity-60'}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${canTakeExam ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {evaluation ? <Trophy className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>
                <div>
                  <CardTitle>Examen final del módulo</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {evaluation ? '¡Examen aprobado! Puedes repetirlo para mejorar tu calificación.' :
                     canTakeExam ? 'Ya puedes tomar el examen final de este módulo.' :
                     `Completa al menos el 70% de las lecciones para desbloquear el examen (${pct}% actual).`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {canTakeExam ? (
                <Button asChild className="w-full" variant={evaluation ? 'outline' : 'default'}>
                  <Link to={`/evaluation/${module.id}`}>
                    <Trophy className="w-4 h-4 mr-2" />
                    {evaluation ? `Repetir examen (última nota: ${evaluation.score}%)` : 'Tomar examen final'}
                  </Link>
                </Button>
              ) : (
                <Button disabled className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Requiere 70% de progreso
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ModuleDetailPage;
