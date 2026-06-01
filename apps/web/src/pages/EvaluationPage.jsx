import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Trophy, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase, saveEvaluation } from '@/lib/supabaseClient.js';
import { toast } from 'sonner';

const QUESTIONS = [
  { q: '¿Cuál es el primer paso para mejorar tu situación financiera?', options: ['Invertir inmediatamente', 'Conocer tu situación actual', 'Pedir un préstamo', 'Esperar el momento correcto'], correct: 1 },
  { q: '¿Qué porcentaje de progreso se requiere para avanzar al siguiente módulo?', options: ['50%', '60%', '70%', '80%'], correct: 2 },
  { q: '¿Cuál es la diferencia entre un activo y un pasivo?', options: ['No hay diferencia', 'Un activo genera dinero; un pasivo lo consume', 'Un pasivo genera dinero; un activo lo consume', 'Ambos generan dinero'], correct: 1 },
  { q: '¿Qué es la mentalidad de abundancia?', options: ['Creer que los recursos son ilimitados para todos', 'Acaparar recursos para uno mismo', 'Pensar que el éxito de otros te afecta', 'Gastar sin límites'], correct: 0 },
  { q: '¿Cuál es el propósito de un fondo de emergencia?', options: ['Invertir en negocios', 'Cubrir gastos inesperados sin endeudarse', 'Pagar deudas existentes', 'Financiar vacaciones'], correct: 1 },
  { q: '¿Qué significa diversificar inversiones?', options: ['Concentrar todo en un solo activo', 'Distribuir el dinero en diferentes activos', 'Invertir solo en acciones', 'Guardar dinero en efectivo'], correct: 1 },
  { q: '¿Cuál es la regla básica del ahorro inteligente?', options: ['Ahorrar lo que sobra', 'Gastar todo y no ahorrar', 'Ahorrar antes de gastar', 'Ahorrar solo en diciembre'], correct: 2 },
  { q: '¿Qué caracteriza a un líder transformacional?', options: ['Controla y ordena sin escuchar', 'Inspira y desarrolla a su equipo', 'Trabaja solo sin delegar', 'Evita tomar decisiones difíciles'], correct: 1 },
  { q: '¿Qué es el interés compuesto?', options: ['Pagar intereses simples', 'Ganar intereses sobre tus intereses', 'Un tipo de préstamo bancario', 'Una penalización por deuda'], correct: 1 },
  { q: '¿Cuál es el objetivo final de la educación financiera?', options: ['Acumular riqueza sin compartir', 'Alcanzar la libertad financiera y crear legado', 'Trabajar más horas', 'Depender del gobierno'], correct: 1 },
];

const EvaluationPage = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const [module, setModule] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    supabase.from('modules').select('id, order_num, title').eq('id', moduleId).single()
      .then(({ data }) => { setModule(data); setLoading(false); });
  }, [moduleId]);

  const handleSubmit = async () => {
    const correct = QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
    const score = Math.round((correct / QUESTIONS.length) * 100);
    const passed = score >= 70;
    await saveEvaluation(user.id, moduleId, score, passed, answers);
    setResult({ correct, score, passed });
    setSubmitted(true);
    if (passed) toast.success(`¡Examen aprobado con ${score}%!`);
    else toast.error(`Obtuviste ${score}%. Necesitas 70% para aprobar.`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );

  return (
    <>
      <Helmet><title>Examen final - {module?.title} | ADN Puebla</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
          <Link to={`/module/${moduleId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al módulo
          </Link>

          {!submitted ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">{module?.title}</span>
                </div>
                <h1 className="text-2xl font-bold mb-1">Examen final del módulo</h1>
                <p className="text-muted-foreground">Necesitas 70% para aprobar. Pregunta {currentQ + 1} de {QUESTIONS.length}</p>
                <Progress value={((currentQ + 1) / QUESTIONS.length) * 100} className="h-2 mt-3" />
              </div>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">{currentQ + 1}. {QUESTIONS[currentQ].q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {QUESTIONS[currentQ].options.map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        answers[currentQ] === oi ? 'border-primary bg-primary/5 font-medium' : 'border-border hover:border-primary/40'
                      }`}>
                        <input type="radio" name={`q${currentQ}`} checked={answers[currentQ] === oi}
                          onChange={() => setAnswers(p => ({...p, [currentQ]: oi}))} className="text-primary" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                {currentQ > 0 && (
                  <Button variant="outline" onClick={() => setCurrentQ(q => q - 1)} className="flex-1">Anterior</Button>
                )}
                {currentQ < QUESTIONS.length - 1 ? (
                  <Button onClick={() => setCurrentQ(q => q + 1)} disabled={answers[currentQ] === undefined} className="flex-1">
                    Siguiente pregunta
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={Object.keys(answers).length < QUESTIONS.length}
                    className="flex-1 bg-green-600 hover:bg-green-700">
                    <Trophy className="w-4 h-4 mr-2" /> Enviar examen
                  </Button>
                )}
              </div>

              <div className="flex gap-1.5 justify-center mt-4 flex-wrap">
                {QUESTIONS.map((_, i) => (
                  <button key={i} onClick={() => setCurrentQ(i)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                      i === currentQ ? 'bg-primary text-primary-foreground' :
                      answers[i] !== undefined ? 'bg-primary/20 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>{i + 1}</button>
                ))}
              </div>
            </>
          ) : (
            <Card className={`border-2 ${result.passed ? 'border-green-500' : 'border-red-500'}`}>
              <CardContent className="p-8 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${result.passed ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950'}`}>
                  {result.passed ? <Trophy className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
                </div>
                <h2 className="text-2xl font-bold mb-2">{result.passed ? '¡Módulo completado!' : 'No aprobado'}</h2>
                <p className={`text-4xl font-bold mb-4 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>{result.score}%</p>
                <p className="text-muted-foreground mb-2">{result.correct} de {QUESTIONS.length} respuestas correctas</p>
                <p className="text-sm text-muted-foreground mb-6">{result.passed ? '¡Felicidades! Has desbloqueado el siguiente módulo.' : 'Necesitas 70% para aprobar. Repasa el contenido e inténtalo de nuevo.'}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {!result.passed && (
                    <Button onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); setResult(null); }} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" /> Intentar de nuevo
                    </Button>
                  )}
                  <Button asChild>
                    <Link to={result.passed ? '/modules' : `/module/${moduleId}`}>
                      {result.passed ? '→ Ver todos los módulos' : '← Volver al módulo'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default EvaluationPage;