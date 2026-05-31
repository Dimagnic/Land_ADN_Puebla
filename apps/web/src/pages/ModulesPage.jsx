import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet';
import { Lock, CheckCircle2, PlayCircle } from 'lucide-react';
import { modulesData } from '@/components/LessonContent.jsx';

const ModulesPage = () => {
  const [moduleProgress, setModuleProgress] = useState({});

  useEffect(() => {
    const progress = JSON.parse(localStorage.getItem('adnPueblaProgress') || '{}');
    const evaluations = JSON.parse(localStorage.getItem('adnPueblaEvaluations') || '[]');

    const calculated = {};
    modulesData.forEach((module) => {
      const moduleData = progress[module.id] || {};
      const completedLessons = Object.values(moduleData).filter(Boolean).length;
      const percentage = Math.round((completedLessons / module.lessons.length) * 100);
      const evaluation = evaluations.find((e) => e.moduleId === module.id && e.passed);
      
      calculated[module.id] = {
        percentage,
        completed: completedLessons,
        total: module.lessons.length,
        passed: !!evaluation,
      };
    });

    setModuleProgress(calculated);
  }, []);

  const isModuleUnlocked = (moduleId) => {
    if (moduleId === 1) return true;
    const previousModule = moduleProgress[moduleId - 1];
    return previousModule && previousModule.percentage >= 70;
  };

  const getModuleStatus = (moduleId) => {
    const progress = moduleProgress[moduleId];
    if (!progress) return { label: 'Comenzar', variant: 'default' };
    if (progress.passed) return { label: 'Completado', variant: 'secondary' };
    if (progress.percentage > 0) return { label: 'Continuar', variant: 'default' };
    return { label: 'Comenzar', variant: 'default' };
  };

  return (
    <>
      <Helmet>
        <title>Módulos de capacitación | ADN Puebla</title>
        <meta name="description" content="Explora los 7 módulos de capacitación de ADN Puebla y avanza en tu camino hacia la libertad financiera" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              Módulos de capacitación
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Completa cada módulo para desbloquear el siguiente. Se requiere 70% de progreso para avanzar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulesData.map((module) => {
              const unlocked = isModuleUnlocked(module.id);
              const progress = moduleProgress[module.id] || { percentage: 0, completed: 0, total: module.lessons.length };
              const status = getModuleStatus(module.id);

              return (
                <Card
                  key={module.id}
                  className={`transition-all duration-200 ${
                    unlocked ? 'hover:shadow-lg hover:-translate-y-1' : 'opacity-60'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={progress.passed ? 'default' : 'secondary'}>
                        Módulo {module.id}
                      </Badge>
                      {!unlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                      {progress.passed && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <CardTitle className="text-xl leading-snug">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            {progress.completed} de {progress.total} lecciones
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {progress.percentage}%
                          </span>
                        </div>
                        <Progress value={progress.percentage} className="h-2" />
                      </div>

                      {unlocked ? (
                        <Button asChild className="w-full" variant={status.variant}>
                          <Link to={`/module/${module.id}`}>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {status.label}
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          <Lock className="w-4 h-4 mr-2" />
                          Bloqueado
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