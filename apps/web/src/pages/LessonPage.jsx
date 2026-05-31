import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { modulesData } from '@/components/LessonContent.jsx';

const LessonPage = () => {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { updateLastLesson } = useAuth();
  const [module, setModule] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [lessonIndex, setLessonIndex] = useState(0);

  useEffect(() => {
    const foundModule = modulesData.find((m) => m.id === parseInt(moduleId));
    if (!foundModule) {
      navigate('/modules');
      return;
    }

    const foundLesson = foundModule.lessons.find((l) => l.id === parseInt(lessonId));
    if (!foundLesson) {
      navigate(`/module/${moduleId}`);
      return;
    }

    setModule(foundModule);
    setLesson(foundLesson);
    setLessonIndex(foundModule.lessons.findIndex((l) => l.id === parseInt(lessonId)));

    const progress = JSON.parse(localStorage.getItem('adnPueblaProgress') || '{}');
    const moduleProgress = progress[foundModule.id] || {};
    setCompleted(moduleProgress[foundLesson.id] === true);

    updateLastLesson(foundModule.id, foundLesson.id);
  }, [moduleId, lessonId]);

  const handleComplete = (checked) => {
    const progress = JSON.parse(localStorage.getItem('adnPueblaProgress') || '{}');
    if (!progress[module.id]) {
      progress[module.id] = {};
    }
    progress[module.id][lesson.id] = checked;
    localStorage.setItem('adnPueblaProgress', JSON.stringify(progress));
    setCompleted(checked);

    if (checked) {
      toast.success('Estás un paso más cerca de tu libertad financiera');
    }
  };

  const goToNextLesson = () => {
    if (lessonIndex < module.lessons.length - 1) {
      const nextLesson = module.lessons[lessonIndex + 1];
      navigate(`/lesson/${module.id}/${nextLesson.id}`);
    } else {
      navigate(`/evaluation/${module.id}`);
    }
  };

  const goToPreviousLesson = () => {
    if (lessonIndex > 0) {
      const prevLesson = module.lessons[lessonIndex - 1];
      navigate(`/lesson/${module.id}/${prevLesson.id}`);
    }
  };

  if (!module || !lesson) return null;

  const progressPercentage = Math.round(((lessonIndex + 1) / module.lessons.length) * 100);
  const isLastLesson = lessonIndex === module.lessons.length - 1;

  return (
    <>
      <Helmet>
        <title>{`${lesson.title} - Módulo ${module.id} | ADN Puebla`}</title>
        <meta name="description" content={lesson.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link to={`/module/${module.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al módulo
            </Link>
          </Button>

          <div className="mb-6">
            <Badge className="mb-3">
              Módulo {module.id} - Lección {lesson.id}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{letterSpacing: '-0.02em'}}>
              {lesson.title}
            </h1>
            <div className="flex items-center space-x-4">
              <Progress value={progressPercentage} className="flex-1 h-2" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {lessonIndex + 1} de {module.lessons.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                    <iframe
                      width="100%"
                      height="100%"
                      src={lesson.videoUrl}
                      title={lesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{lesson.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contenido de la lección</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">{lesson.content}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progreso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="completed"
                      checked={completed}
                      onCheckedChange={handleComplete}
                    />
                    <label
                      htmlFor="completed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Marcar como completada
                    </label>
                  </div>
                  {completed && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-start space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-primary font-medium">
                        ¡Excelente! Estás un paso más cerca de tu libertad financiera
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Navegación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={goToPreviousLesson}
                    disabled={lessonIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Lección anterior
                  </Button>
                  {isLastLesson ? (
                    <Button className="w-full justify-start" onClick={goToNextLesson}>
                      Ir a evaluación del módulo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="w-full justify-start" onClick={goToNextLesson}>
                      Siguiente lección
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonPage;