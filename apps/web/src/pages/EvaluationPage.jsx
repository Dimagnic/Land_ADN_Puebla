import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Trophy, XCircle, RefreshCw, AlertCircle,
  Clock, ShieldAlert, CheckCircle2, Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase, saveEvaluation, getModuleAttempts, getShuffledQuestions } from '@/lib/supabaseClient.js';
import { toast } from 'sonner';

const EXAM_SECONDS   = 25 * 60; // 25 minutos
const MAX_ATTEMPTS   = 3;
const PASS_SCORE     = 70;
const TOTAL_QUESTIONS = 10;

const fmt = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const EvaluationPage = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase]       = useState('loading'); // loading | no-questions | max-attempts | passed | briefing | exam | result
  const [module, setModule]     = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]   = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult]     = useState(null);
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [autoSaved, setAutoSaved] = useState(false);
  const timerRef = useRef(null);
  const answersRef = useRef({});
  const startTimeRef = useRef(null);

  // Keep ref in sync with state (for use inside timer callback)
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // ── Load initial data ─────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    async function load() {
      const [{ data: mod }, prevAttempts, qs] = await Promise.all([
        supabase.from('modules').select('id, order_num, title').eq('id', moduleId).single(),
        getModuleAttempts(user.id, moduleId),
        // Questions existence check
        supabase.from('questions').select('id').eq('module_id', moduleId).eq('active', true).limit(1),
      ]);
      setModule(mod);
      setAttempts(prevAttempts);

      if (!qs.data || qs.data.length === 0) { setPhase('no-questions'); return; }
      const bestPassed = prevAttempts.some(a => a.passed);
      if (bestPassed) { setPhase('passed'); return; }
      if (prevAttempts.length >= MAX_ATTEMPTS) { setPhase('max-attempts'); return; }
      setPhase('briefing');
    }
    load();
  }, [user, moduleId]);

  // ── Auto-submit on page unload / session close ────────────
  const submitExam = useCallback(async (autoSubmitted = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const currentAnswers = answersRef.current;
    const attemptNum = attempts.length + 1;
    const correct = questions.filter((q, i) => currentAnswers[i] === q.correct).length;
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = score >= PASS_SCORE;
    const timeUsed = EXAM_SECONDS - timeLeft;
    const questionIds = questions.map(q => q.id);

    try {
      await saveEvaluation(user.id, moduleId, score, passed, currentAnswers, {
        attemptNum,
        questionIds,
        timeUsedSec: timeUsed,
        autoSubmitted,
      });
      if (!autoSubmitted) {
        setResult({ score, passed, correct, total: questions.length, attemptNum });
        setPhase('result');
        if (passed) toast.success(`¡Examen aprobado con ${score}%! Siguiente módulo desbloqueado.`);
        else toast.error(`Obtuviste ${score}%. Necesitas ${PASS_SCORE}% para aprobar.`);
      }
    } catch {
      toast.error('Error al guardar el examen');
    }
  }, [questions, attempts, user, moduleId, timeLeft]);

  // Auto-submit on visibility change (tab close / session end)
  useEffect(() => {
    if (phase !== 'exam') return;
    const handler = () => {
      if (document.visibilityState === 'hidden' && !autoSaved) {
        setAutoSaved(true);
        submitExam(true);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [phase, autoSaved, submitExam]);

  // ── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitExam(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, submitExam]);

  // ── Start exam ────────────────────────────────────────────
  const startExam = async () => {
    const attemptNum = attempts.length + 1;
    const qs = await getShuffledQuestions(moduleId, user.id, attemptNum, TOTAL_QUESTIONS);
    if (qs.length === 0) { setPhase('no-questions'); return; }
    setQuestions(qs);
    setAnswers({});
    answersRef.current = {};
    setCurrentQ(0);
    setTimeLeft(EXAM_SECONDS);
    setAutoSaved(false);
    setPhase('exam');
  };

  // ── Screens ───────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (phase === 'no-questions') return (
    <Screen moduleId={moduleId} module={module}>
      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Examen no disponible</h2>
      <p className="text-muted-foreground">El administrador aún no ha cargado las preguntas para este módulo.</p>
      <Button asChild className="mt-6" variant="outline">
        <Link to={`/module/${moduleId}`}>← Volver al módulo</Link>
      </Button>
    </Screen>
  );

  if (phase === 'passed') return (
    <Screen moduleId={moduleId} module={module}>
      <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">¡Módulo completado!</h2>
      <p className="text-muted-foreground mb-2">Ya aprobaste el examen de este módulo.</p>
      <p className="text-sm text-muted-foreground mb-6">
        Mejor puntaje: <strong className="text-primary">
          {Math.max(...attempts.map(a => a.score))}%
        </strong>
      </p>
      <Button asChild><Link to="/modules">Ver todos los módulos</Link></Button>
    </Screen>
  );

  if (phase === 'max-attempts') return (
    <Screen moduleId={moduleId} module={module}>
      <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Límite de intentos alcanzado</h2>
      <p className="text-muted-foreground mb-4">Has usado los {MAX_ATTEMPTS} intentos disponibles para este módulo.</p>
      <div className="space-y-2 text-sm text-left max-w-xs mx-auto mb-6">
        {attempts.map((a, i) => (
          <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-muted">
            <span>Intento {a.attempt_num}</span>
            <Badge variant={a.passed ? 'default' : 'secondary'}>{a.score}%</Badge>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Contacta a tu patrocinador o al administrador para solicitar un reintento.</p>
      <Button asChild className="mt-4" variant="outline"><Link to="/modules">← Mis módulos</Link></Button>
    </Screen>
  );

  // ── BRIEFING ─────────────────────────────────────────────
  if (phase === 'briefing') {
    const attemptNum = attempts.length + 1;
    const attemptsLeft = MAX_ATTEMPTS - attempts.length;
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link to={`/module/${moduleId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al módulo
          </Link>
          <Card className="border-primary/30">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Examen final — {module?.title}</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">Intento {attemptNum} de {MAX_ATTEMPTS}</p>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Reglas */}
              <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Instrucciones importantes
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span><strong>{TOTAL_QUESTIONS} preguntas</strong> de opción múltiple, cada una con 4 opciones.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>Tienes <strong>25 minutos</strong> para completar el examen. El tiempo corre desde que presionas "Comenzar".</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>Necesitas <strong>{PASS_SCORE}% o más</strong> ({Math.ceil(TOTAL_QUESTIONS * PASS_SCORE / 100)} respuestas correctas) para aprobar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>Cuentas con <strong>{attemptsLeft} intento{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''}</strong>. Cada intento tiene preguntas diferentes.</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-600">
                    <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Si cierras esta ventana o tu sesión expira</strong>, el examen se enviará automáticamente con las respuestas que hayas marcado hasta ese momento.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>Una vez que apruebes, se desbloqueará el siguiente módulo automáticamente.</span>
                  </li>
                </ul>
              </div>

              {/* Intentos previos */}
              {attempts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Intentos anteriores:</p>
                  {attempts.map((a) => (
                    <div key={a.id} className="flex justify-between items-center p-3 rounded-lg border text-sm">
                      <span className="text-muted-foreground">Intento {a.attempt_num}</span>
                      <div className="flex items-center gap-2">
                        {a.auto_submitted && <Badge variant="outline" className="text-xs">Auto-enviado</Badge>}
                        <Badge variant={a.passed ? 'default' : 'secondary'}>{a.score}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={startExam} size="lg" className="w-full text-base font-semibold">
                <Trophy className="w-5 h-5 mr-2" /> Comenzar examen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── EXAM ─────────────────────────────────────────────────
  if (phase === 'exam') {
    const urgent = timeLeft <= 300; // últimos 5 min
    const q = questions[currentQ];
    return (
      <>
        <Helmet><title>Examen — {module?.title} | ADN Puebla</title></Helmet>
        <div className="min-h-screen bg-background">
          {/* Barra superior sticky */}
          <div className={`sticky top-0 z-10 border-b px-4 py-3 flex items-center justify-between ${
            urgent ? 'bg-red-50 border-red-200' : 'bg-background'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">{module?.title}</span>
              <span className="text-xs text-muted-foreground">
                Pregunta {currentQ + 1} de {questions.length}
              </span>
            </div>
            <div className={`flex items-center gap-2 font-mono font-bold text-lg ${
              urgent ? 'text-red-600' : 'text-foreground'
            }`}>
              <Clock className="w-5 h-5" />
              {fmt(timeLeft)}
            </div>
          </div>

          <div className="container mx-auto px-4 py-6 max-w-3xl">
            <Progress value={((currentQ + 1) / questions.length) * 100} className="h-1.5 mb-6" />

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  {currentQ + 1}. {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      answers[currentQ] === oi
                        ? 'border-primary bg-primary/5 font-medium'
                        : 'border-border hover:border-primary/40'
                    }`}>
                      <input type="radio" name={`q${currentQ}`}
                        checked={answers[currentQ] === oi}
                        onChange={() => setAnswers(p => ({ ...p, [currentQ]: oi }))}
                        className="text-primary" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navegación */}
            <div className="flex gap-3 mb-4">
              {currentQ > 0 && (
                <Button variant="outline" onClick={() => setCurrentQ(q => q - 1)} className="flex-1">
                  Anterior
                </Button>
              )}
              {currentQ < questions.length - 1 ? (
                <Button onClick={() => setCurrentQ(q => q + 1)}
                  disabled={answers[currentQ] === undefined} className="flex-1">
                  Siguiente
                </Button>
              ) : (
                <Button onClick={() => submitExam(false)}
                  disabled={Object.keys(answers).length < questions.length}
                  className="flex-1 bg-green-600 hover:bg-green-700">
                  <Trophy className="w-4 h-4 mr-2" />
                  Enviar examen ({Object.keys(answers).length}/{questions.length})
                </Button>
              )}
            </div>

            {/* Mapa de preguntas */}
            <div className="flex gap-1.5 justify-center flex-wrap">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    i === currentQ ? 'bg-primary text-primary-foreground' :
                    answers[i] !== undefined ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>{i + 1}</button>
              ))}
            </div>

            {urgent && (
              <p className="text-center text-sm text-red-600 font-medium mt-4 animate-pulse">
                ⚠️ Menos de 5 minutos — el examen se enviará automáticamente al llegar a 0:00
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── RESULT ────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const attemptsLeft = MAX_ATTEMPTS - (attempts.length + 1);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className={`border-2 ${result.passed ? 'border-green-500' : 'border-red-400'}`}>
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                result.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {result.passed
                  ? <Trophy className="w-10 h-10 text-green-600" />
                  : <XCircle className="w-10 h-10 text-red-600" />}
              </div>

              <h2 className="text-2xl font-bold mb-1">
                {result.passed ? '¡Módulo aprobado!' : 'No aprobado'}
              </h2>
              <p className={`text-5xl font-bold mb-3 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                {result.score}%
              </p>
              <p className="text-muted-foreground mb-1">
                {result.correct} de {result.total} respuestas correctas
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Intento {result.attemptNum} de {MAX_ATTEMPTS}
              </p>

              {result.passed ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-2" />
                  <p className="font-semibold">¡El siguiente módulo se ha desbloqueado!</p>
                  <p>Continúa tu camino hacia la libertad financiera.</p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800">
                  <p className="font-semibold mb-1">
                    {attemptsLeft > 0
                      ? `Te quedan ${attemptsLeft} intento${attemptsLeft !== 1 ? 's' : ''}. Las preguntas serán diferentes.`
                      : 'Has usado todos tus intentos. Contacta a tu patrocinador.'}
                  </p>
                  <p>Necesitas {PASS_SCORE}% para aprobar. Repasa el contenido del módulo.</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!result.passed && attemptsLeft > 0 && (
                  <Button variant="outline" onClick={() => {
                    setAttempts(prev => [...prev, { attempt_num: result.attemptNum, score: result.score, passed: false }]);
                    setPhase('briefing');
                  }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Intentar de nuevo
                  </Button>
                )}
                <Button asChild>
                  <Link to={result.passed ? '/modules' : `/module/${moduleId}`}>
                    {result.passed ? '→ Ver todos los módulos' : '← Repasar el módulo'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

// Helper component para pantallas de estado
const Screen = ({ moduleId, module, children }) => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to={`/module/${moduleId}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al módulo
      </Link>
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4 font-medium">{module?.title}</p>
          {children}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default EvaluationPage;
