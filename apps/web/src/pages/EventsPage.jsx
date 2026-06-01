import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AnnouncementBoard from '@/components/AnnouncementBoard.jsx';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const EventsPage = () => {
  const events = [
    {
      id: 1,
      title: 'Capacitación presencial Puebla',
      date: '2026-06-15',
      time: '10:00 AM',
      location: 'Centro de Convenciones, Puebla',
      description: 'Capacitación intensiva sobre técnicas de ventas y construcción de equipo',
      attendees: 47,
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Evento regional CDMX',
      date: '2026-06-28',
      time: '9:00 AM',
      location: 'World Trade Center, Ciudad de México',
      description: 'Evento regional con líderes nacionales y presentación de nuevos productos',
      attendees: 183,
      status: 'upcoming',
    },
    {
      id: 3,
      title: 'Webinar: Marketing digital',
      date: '2026-07-05',
      time: '7:00 PM',
      location: 'Online (Zoom)',
      description: 'Estrategias avanzadas de marketing digital para distribuidores',
      attendees: 92,
      status: 'upcoming',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Eventos | ADN Puebla</title>
        <meta name="description" content="Próximos eventos, capacitaciones y anuncios importantes de ADN Puebla" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              Eventos
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Próximas capacitaciones y eventos de la red
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-semibold">Próximos eventos</h2>
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl leading-snug">{event.title}</CardTitle>
                      <Badge>Próximamente</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{event.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{new Date(event.date).toLocaleDateString('es-MX', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{event.attendees} asistentes confirmados</span>
                      </div>
                    </div>

                    <Button className="w-full sm:w-auto">
                      Confirmar asistencia
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <AnnouncementBoard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventsPage;
