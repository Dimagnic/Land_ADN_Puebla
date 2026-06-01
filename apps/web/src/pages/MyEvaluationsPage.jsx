import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';
import { Trophy, RotateCcw, TrendingUp } from 'lucide-react';

const MyEvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('adnPueblaEvaluations') || '[]');
    setEvaluations(stored.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const filteredEvaluations = evaluations.filter((e) => {
    if (filter === 'passed') return e.passed;
    if (filter === 'failed') return !e.passed;
    return true;
  });

  const stats = {
    total: evaluations.length,
    passed: evaluations.filter((e) => e.passed).length,
    average: evaluations.length > 0
      ? Math.round(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length)
      : 0,
  };

  return (
    <>
      <Helmet>
        <title>Mis evaluaciones | ADN Puebla</title>
        <meta name="description" content="Historial de evaluaciones y resultados de tus módulos completados" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              Mis evaluaciones
            </h1>
            <p className="text-muted-foreground text-lg">
              Revisa tu historial de evaluaciones y resultados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total evaluaciones</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Módulos aprobados</p>
                    <p className="text-3xl font-bold text-primary">{stats.passed}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Promedio general</p>
                    <p className="text-3xl font-bold">{stats.average}%</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historial de evaluaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="passed">Aprobadas</TabsTrigger>
                  <TabsTrigger value="failed">No aprobadas</TabsTrigger>
                </TabsList>

                <TabsContent value={filter}>
                  {filteredEvaluations.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {filter === 'all'
                          ? 'Aún no has realizado ninguna evaluación'
                          : filter === 'passed'
                          ? 'No tienes evaluaciones aprobadas'
                          : 'No tienes evaluaciones no aprobadas'}
                      </p>
                      <Button asChild className="mt-4">
                        <Link to="/modules">Ir a módulos</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvaluations.map((evaluation, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors duration-200"
                        >
                          <div className="flex-1 mb-3 sm:mb-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold">{evaluation.moduleName}</h3>
                              <Badge variant={evaluation.passed ? 'default' : 'destructive'}>
                                {evaluation.passed ? 'Aprobado' : 'No aprobado'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Calificación: {evaluation.score}%</span>
                              <span>•</span>
                              <span>{new Date(evaluation.date).toLocaleDateString('es-MX')}</span>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/evaluation/${evaluation.moduleId}`}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Retomar
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MyEvaluationsPage;
