import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet';
import { Users, MessageCircle, AlertCircle, Trophy, TrendingUp } from 'lucide-react';

const SponsorPanelPage = () => {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const mockStudents = [
      {
        id: 1,
        name: 'María González',
        code: 'GEM2847',
        progress: 83,
        modulesCompleted: 5,
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      },
      {
        id: 2,
        name: 'Juan Pérez',
        code: 'GEM2891',
        progress: 47,
        modulesCompleted: 3,
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      },
      {
        id: 3,
        name: 'Ana Martínez',
        code: 'GEM2923',
        progress: 100,
        modulesCompleted: 7,
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 4,
        name: 'Carlos López',
        code: 'GEM2956',
        progress: 21,
        modulesCompleted: 1,
        lastLogin: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'inactive',
      },
      {
        id: 5,
        name: 'Laura Sánchez',
        code: 'GEM2978',
        progress: 64,
        modulesCompleted: 4,
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      },
    ];

    setStudents(mockStudents);
  }, []);

  const filteredStudents = students.filter((s) => {
    if (filter === 'active') return s.status === 'active';
    if (filter === 'inactive') return s.status === 'inactive';
    if (filter === 'completed') return s.status === 'completed';
    return true;
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === 'active').length,
    inactive: students.filter((s) => s.status === 'inactive').length,
    completed: students.filter((s) => s.status === 'completed').length,
  };

  const getDaysSinceLogin = (lastLogin) => {
    const days = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <>
      <Helmet>
        <title>Panel de patrocinador | ADN Puebla</title>
        <meta name="description" content="Gestiona y monitorea el progreso de tus distribuidores" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              Panel de patrocinador
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitorea el progreso de tu equipo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total alumnos</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="w-10 h-10 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Activos</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Inactivos</p>
                    <p className="text-3xl font-bold text-destructive">{stats.inactive}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Certificados</p>
                    <p className="text-3xl font-bold text-primary">{stats.completed}</p>
                  </div>
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuidores</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="active">Activos</TabsTrigger>
                  <TabsTrigger value="inactive">Inactivos</TabsTrigger>
                  <TabsTrigger value="completed">Completados</TabsTrigger>
                </TabsList>

                <TabsContent value={filter}>
                  <div className="space-y-4">
                    {filteredStudents.map((student) => {
                      const daysSinceLogin = getDaysSinceLogin(student.lastLogin);
                      const isInactive = daysSinceLogin >= 7;

                      return (
                        <div
                          key={student.id}
                          className={`p-4 rounded-lg border ${
                            isInactive ? 'border-destructive/50 bg-destructive/5' : 'hover:bg-muted'
                          } transition-colors duration-200`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-lg">{student.name}</h3>
                                <Badge variant="outline">{student.code}</Badge>
                                {student.status === 'completed' && (
                                  <Badge variant="default">Certificado</Badge>
                                )}
                                {isInactive && (
                                  <Badge variant="destructive" className="flex items-center space-x-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Inactivo</span>
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Progreso</p>
                                  <p className="font-semibold text-primary">{student.progress}%</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Módulos</p>
                                  <p className="font-semibold">{student.modulesCompleted} / 7</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Última conexión</p>
                                  <p className="font-semibold">
                                    {daysSinceLogin === 0
                                      ? 'Hoy'
                                      : daysSinceLogin === 1
                                      ? 'Ayer'
                                      : `Hace ${daysSinceLogin} días`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Estado</p>
                                  <p className={`font-semibold ${
                                    student.status === 'completed' ? 'text-primary' :
                                    student.status === 'active' ? 'text-green-600' :
                                    'text-destructive'
                                  }`}>
                                    {student.status === 'completed' ? 'Completado' :
                                     student.status === 'active' ? 'Activo' :
                                     'Inactivo'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button asChild size="sm" className="lg:ml-4">
                              <a
                                href={`https://wa.me/5212221234567?text=Hola ${student.name}, soy tu patrocinador`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contactar
                              </a>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SponsorPanelPage;