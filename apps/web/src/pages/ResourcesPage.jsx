import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { Download, ExternalLink, FileText, Image as ImageIcon, Link as LinkIcon, Video, RefreshCw , ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient.js';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = {
  document: FileText,
  image: ImageIcon,
  link: LinkIcon,
  video: Video,
};

const ResourcesPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('resources')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setResources(data || []);
        setLoading(false);
      });
  }, []);

  const byCategory = resources.reduce((acc, r) => {
    const cat = r.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>Recursos | ADN Puebla</title>
        <meta name="description" content="Accede a catálogos, scripts de ventas, imágenes para redes sociales y enlaces importantes" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm font-medium transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              Recursos
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Herramientas y materiales para impulsar tu negocio
            </p>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-20 justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Cargando recursos...</span>
            </div>
          ) : resources.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay recursos disponibles aún.</p>
                <p className="text-sm text-muted-foreground mt-1">El administrador publicará recursos aquí pronto.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-10">
              {Object.entries(byCategory).map(([category, items]) => (
                <section key={category}>
                  <h2 className="text-2xl font-semibold mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((resource) => {
                      const Icon = ICON_MAP[resource.type] || FileText;
                      const isLink = resource.type === 'link';
                      return (
                        <Card key={resource.id} className="hover:shadow-lg transition-all duration-200">
                          <CardHeader>
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-base leading-snug">{resource.title}</CardTitle>
                                {resource.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {isLink ? (
                              <Button asChild variant="outline" className="w-full">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Abrir enlace
                                </a>
                              </Button>
                            ) : (
                              <Button asChild className="w-full">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" download>
                                  <Download className="w-4 h-4 mr-2" />
                                  Descargar
                                </a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResourcesPage;
