import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AnnouncementBoard from '@/components/AnnouncementBoard.jsx';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, Clock, Users, RefreshCw , ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient.js';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('active', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Eventos | ADN Puebla</title>
        <meta name="description" content="Próximos eventos, capacitaciones y anuncios importantes de ADN Puebla" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm font-medium transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>
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

              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cargando eventos...</span>
                </div>
              ) : events.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay eventos próximos por el momento.</p>
                    <p className="text-sm text-muted-foreground mt-1">El administrador publicará los próximos eventos aquí.</p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl leading-snug">{event.title}</CardTitle>
                        <Badge variant={event.type === 'virtual' ? 'secondary' : 'default'}>
                          {event.type === 'virtual' ? 'Virtual' : 'Presencial'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {event.description && (
                        <p className="text-muted-foreground mb-4 leading-relaxed">{event.description}</p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{new Date(event.date + 'T12:00:00').toLocaleDateString('es-MX', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                          })}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                      <Button className="w-full sm:w-auto">
                        Confirmar asistencia
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
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
