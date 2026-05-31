import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet';
import { CheckCircle2, Circle, ArrowLeft, PlayCircle, Lock } from 'lucide-react';
import { modulesData } from '@/components/LessonContent.jsx';

const ModuleDetailPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});

  useEffect(() => {
    const foundModule = modulesData.find((m) => m.id === parseInt(moduleId));
    if (!foundModule) {
      navigate('/modules');
      return;
    }
    setModule(foundModule);

    const progress = JSON.parse(localStorage.getItem('adnPueblaProgress') || '{}');
    setLessonProgress(progress[foundModule.id] || {});
  }, [moduleId, navigate]);

  const isLessonUnlocked = (lessonId) => {
    if (lessonId === 1) return true;
    return lessonProgress[lessonId - 1] === true;
  };

  if (!module) return null;

  return (
    <>
      <Helmet>
        <title>{`${module.title} | ADN Puebla`}</title>
        <meta name="description" content={`Lecciones del módulo: ${module.title}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/modules">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a módulos
            </Link>
          </Button>

          <div className="mb-8">
            <Badge className="mb-3">Módulo {module.id}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              {module.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {module.lessons.length} lecciones en este módulo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {module.lessons.map((lesson, index) => {
              const completed = lessonProgress[lesson.id] === true;
              const unlocked = isLessonUnlocked(lesson.id);

              return (
                <Card
                  key={lesson.id}
                  className={`transition-all duration-200 ${
                    unlocked ? 'hover:shadow-lg' : 'opacity-60'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">
                            Lección {module.id}.{lesson.id}
                          </Badge>
                          {completed && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                          {!unlocked && (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <CardTitle className="text-lg leading-snug">{lesson.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {lesson.description}
                    </p>
                    {unlocked ? (
                      <Button asChild className="w-full">
                        <Link to={`/lesson/${module.id}/${lesson.id}`}>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {completed ? 'Revisar lección' : 'Ver lección'}
                        </Link>
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        <Lock className="w-4 h-4 mr-2" />
                        Completa la lección anterior
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-8 bg-accent/50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div>
                  <h3 className="font-semibold text-lg mb-1">¿Completaste todas las lecciones?</h3>
                  <p className="text-sm text-muted-foreground">
                    Realiza la evaluación del módulo para desbloquear el siguiente
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link to={`/evaluation/${module.id}`}>
                    Ir a evaluación
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ModuleDetailPage;