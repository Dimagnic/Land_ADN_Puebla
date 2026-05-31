import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { modulesData, quizData } from '@/components/LessonContent.jsx';

const EvaluationPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    const foundModule = modulesData.find((m) => m.id === parseInt(moduleId));
    if (!foundModule) {
      navigate('/modules');
      return;
    }

    const moduleQuestions = quizData[parseInt(moduleId)] || [];
    if (moduleQuestions.length === 0) {
      toast.error('No hay evaluación disponible para este módulo');
      navigate(`/module/${moduleId}`);
      return;
    }

    setModule(foundModule);
    setQuestions(moduleQuestions);
  }, [moduleId, navigate]);

  const handleAnswer = (questionIndex, answerIndex) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleSubmit = () => {
    let correct = 0;
    const newFeedback = {};

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correct;
      if (isCorrect) correct++;
      newFeedback[index] = {
        correct: isCorrect,
        explanation: question.explanation,
      };
    });

    const percentage = Math.round((correct / questions.length) * 100);
    setScore(percentage);
    setFeedback(newFeedback);
    setShowResults(true);

    const passed = percentage >= 70;
    const evaluations = JSON.parse(localStorage.getItem('adnPueblaEvaluations') || '[]');
    evaluations.push({
      moduleId: parseInt(moduleId),
      moduleName: module.title,
      score: percentage,
      passed,
      date: new Date().toISOString(),
    });
    localStorage.setItem('adnPueblaEvaluations', JSON.stringify(evaluations));

    if (passed) {
      const badges = JSON.parse(localStorage.getItem('adnPueblaBadges') || '[]');
      if (!badges.includes(parseInt(moduleId))) {
        badges.push(parseInt(moduleId));
        localStorage.setItem('adnPueblaBadges', JSON.stringify(badges));
      }
      toast.success('¡Felicidades! Has aprobado el módulo');
    } else {
      toast.error('No alcanzaste el 70% requerido. Puedes intentarlo de nuevo');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setShowResults(false);
    setCurrentQuestion(0);
    setScore(0);
    setFeedback({});
  };

  if (!module || questions.length === 0) return null;

  const currentQ = questions[currentQuestion];
  const allAnswered = Object.keys(answers).length === questions.length;
  const passed = score >= 70;

  if (showResults) {
    return (
      <>
        <Helmet>
          <title>{`Resultados - ${module.title} | ADN Puebla`}</title>
        </Helmet>

        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto">
              <Card className={`mb-8 ${passed ? 'border-primary' : 'border-destructive'}`}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {passed ? (
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center badge-celebration">
                        <Trophy className="w-10 h-10 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-destructive" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-3xl mb-2">
                    {passed ? '¡Felicidades!' : 'Sigue intentando'}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {passed
                      ? 'Has completado exitosamente este módulo'
                      : 'Necesitas 70% para aprobar. Revisa las lecciones y vuelve a intentarlo'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-6xl font-bold text-primary mb-2">{score}%</p>
                    <p className="text-muted-foreground">
                      {Object.values(feedback).filter((f) => f.correct).length} de {questions.length} respuestas correctas
                    </p>
                  </div>

                  <div className="space-y-4">
                    {questions.map((question, index) => {
                      const userAnswer = answers[index];
                      const isCorrect = feedback[index]?.correct;

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            isCorrect ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'
                          }`}
                        >
                          <div className="flex items-start space-x-3 mb-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium mb-1">Pregunta {index + 1}</p>
                              <p className="text-sm text-muted-foreground mb-2">{question.question}</p>
                              <p className="text-sm">
                                <span className="font-medium">Tu respuesta: </span>
                                {question.options[userAnswer]}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Respuesta correcta: </span>
                                  {question.options[question.correct]}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                {feedback[index]?.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    {passed ? (
                      <>
                        <Button asChild className="flex-1">
                          <Link to="/modules">Ver todos los módulos</Link>
                        </Button>
                        {parseInt(moduleId) < modulesData.length && (
                          <Button asChild variant="outline" className="flex-1">
                            <Link to={`/module/${parseInt(moduleId) + 1}`}>
                              Continuar al siguiente módulo
                            </Link>
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <Button onClick={handleRetry} className="flex-1">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reintentar evaluación
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                          <Link to={`/module/${moduleId}`}>
                            Revisar lecciones
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Evaluación - ${module.title} | ADN Puebla`}</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link to={`/module/${moduleId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al módulo
            </Link>
          </Button>

          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <Badge className="mb-3">Evaluación del Módulo {module.id}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
                {module.title}
              </h1>
              <p className="text-muted-foreground">
                Responde todas las preguntas. Necesitas 70% para aprobar.
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pregunta {currentQuestion + 1} de {questions.length}</CardTitle>
                  <Badge variant="outline">
                    {Object.keys(answers).length} / {questions.length} respondidas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium mb-6">{currentQ.question}</p>

                <RadioGroup
                  value={answers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswer(currentQuestion, parseInt(value))}
                >
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted transition-colors duration-200">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Anterior
                  </Button>
                  {currentQuestion < questions.length - 1 ? (
                    <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                      Siguiente
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={!allAnswered}>
                      Enviar evaluación
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`aspect-square rounded-lg border-2 font-medium transition-all duration-200 ${
                    currentQuestion === index
                      ? 'border-primary bg-primary text-primary-foreground'
                      : answers[index] !== undefined
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EvaluationPage;