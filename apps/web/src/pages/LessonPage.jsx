import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase, markLessonComplete, getUserProgress } from '@/lib/supabaseClient.js';
import { toast } from 'sonner';



const LessonPage = () => {
  const { moduleId, lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [module, setModule] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: mod } = await supabase
        .from('modules').select('*, lessons(*)').eq('id', moduleId).single();
      if (mod) {
        setModule(mod);
        const sorted = (mod.lessons || []).sort((a, b) => a.order_num - b.order_num);
        setAllLessons(sorted);
        const les = sorted.find(l => l.id === lessonId);
        setLesson(les || null);
      }
      const progress = await getUserProgress(user.id);
      setIsCompleted(progress.some(p => p.lesson_id === lessonId && p.completed));
      setLoading(false);
    }
    load();
  }, [user, moduleId, lessonId]);

  const handleComplete = async () => {
    await markLessonComplete(user.id, lessonId);
    setIsCompleted(true);
    toast.success('¡Lección completada!');
  };


  const currentIdx = allLessons.findIndex(l => l.id === lessonId);
  const nextLesson = allLessons[currentIdx + 1];
  const prevLesson = allLessons[currentIdx - 1];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );

  if (!lesson) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Lección no encontrada</p>
    </div>
  );

  const progress = allLessons.length > 0 ? Math.round(((currentIdx + 1) / allLessons.length) * 100) : 0;

  return (
    <>
      <Helmet><title>{lesson.title} | ADN Puebla</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Link to={`/module/${moduleId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al módulo
            </Link>
            <span className="text-sm text-muted-foreground">Lección {currentIdx + 1} de {allLessons.length}</span>
          </div>

          <Progress value={progress} className="h-1.5 mb-6" />

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">{module?.title}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{letterSpacing:'-0.02em'}}>{lesson.title}</h1>
            {lesson.description && <p className="text-muted-foreground mt-2 leading-relaxed">{lesson.description}</p>}
          </div>

          {lesson.video_url && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-6 shadow-lg">
              <iframe src={lesson.video_url} className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen title={lesson.title} />
            </div>
          )}

          {lesson.content && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">Material de la lección</h2>
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                  {lesson.content}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {prevLesson && (
              <Button variant="outline" asChild className="flex-1">
                <Link to={`/lesson/${moduleId}/${prevLesson.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
                </Link>
              </Button>
            )}
            {!isCompleted && (
              <Button onClick={handleComplete} className="flex-1">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como completada
              </Button>
            )}
            {isCompleted && nextLesson && (
              <Button asChild className="flex-1">
                <Link to={`/lesson/${moduleId}/${nextLesson.id}`}>
                  Siguiente lección <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
            {isCompleted && !nextLesson && (
              <Button asChild className="flex-1" variant="outline">
                <Link to={`/module/${moduleId}`}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Ver módulo completo
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonPage;
