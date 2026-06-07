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
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);

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
      // Cargar mini-quiz de Supabase (si existe para este módulo)
      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .eq('module_id', moduleId)
        .eq('active', true)
        .order('order_num')
        .limit(3);
      setQuizQuestions(qs || []);
      setLoading(false);
    }
    load();
  }, [user, moduleId, lessonId]);

  const handleComplete = async () => {
    await markLessonComplete(user.id, lessonId);
    setIsCompleted(true);
    setShowQuiz(true);
    toast.success('¡Lección completada!');
  };

  const handleQuizSubmit = () => {
    const correct = quizQuestions.filter((q, i) => quizAnswers[i] === q.correct).length;
    const passed = correct >= Math.ceil(quizQuestions.length * 0.6);
    setQuizPassed(passed);
    setQuizSubmitted(true);
    if (passed) toast.success(`¡Mini-examen aprobado! ${correct}/${quizQuestions.length} correctas`);
    else toast.error(`${correct}/${quizQuestions.length} correctas. ¡Inténtalo de nuevo!`);
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

          {showQuiz && quizQuestions.length > 0 && (
            <Card className="mb-6 border-primary/50">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-primary">Mini examen de la lección</h2>
                {quizQuestions.map((q, qi) => (
                  <div key={qi} className="mb-5">
                    <p className="font-medium mb-3">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          quizSubmitted
                            ? oi === q.correct ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : quizAnswers[qi] === oi ? 'border-red-500 bg-red-50 dark:bg-red-950'
                            : 'border-border'
                            : quizAnswers[qi] === oi ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}>
                          <input type="radio" name={`q${qi}`} disabled={quizSubmitted}
                            checked={quizAnswers[qi] === oi}
                            onChange={() => setQuizAnswers(p => ({...p, [qi]: oi}))}
                            className="text-primary" />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {!quizSubmitted ? (
                  <Button onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < quizQuestions.length} className="w-full">
                    Enviar respuestas
                  </Button>
                ) : (
                  <div className={`p-4 rounded-lg text-center ${quizPassed ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200'}`}>
                    <p className="font-semibold text-lg">{quizPassed ? '¡Excelente!' : 'Sigue practicando'}</p>
                    <p className="text-sm">{quizPassed ? '¡Continúa con la siguiente lección!' : 'Repasa el contenido e inténtalo de nuevo.'}</p>
                    {!quizPassed && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}>
                        Intentar de nuevo
                      </Button>
                    )}
                  </div>
                )}
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
