import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { Download, ExternalLink, FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

const ResourcesPage = () => {
  const resources = {
    documents: [
      {
        title: 'Catálogo PDF Elyón',
        description: 'Catálogo completo de productos con descripciones y precios',
        icon: FileText,
        downloadUrl: '#',
      },
      {
        title: 'Scripts de ventas',
        description: 'Guiones probados para presentaciones efectivas',
        icon: FileText,
        downloadUrl: '#',
      },
    ],
    images: [
      {
        title: 'Imágenes para Facebook',
        description: 'Pack de imágenes optimizadas para publicaciones',
        icon: ImageIcon,
        downloadUrl: '#',
      },
      {
        title: 'Imágenes para Instagram',
        description: 'Stories y posts listos para compartir',
        icon: ImageIcon,
        downloadUrl: '#',
      },
      {
        title: 'Plantillas de WhatsApp',
        description: 'Imágenes para estados y mensajes',
        icon: ImageIcon,
        downloadUrl: '#',
      },
    ],
    links: [
      {
        title: 'Back Office',
        description: 'Accede a tu panel de distribuidor',
        url: 'https://app.grupoelyonmexico.com',
        icon: LinkIcon,
      },
      {
        title: 'Tienda Elyón',
        description: 'Catálogo en línea de productos',
        url: 'https://elyonnetwork.com/tienda/',
        icon: LinkIcon,
      },
      {
        title: 'Facebook GEM',
        description: 'Página oficial de Grupo Elyón México',
        url: 'https://www.facebook.com/GrupoElyonMexico',
        icon: LinkIcon,
      },
      {
        title: 'Instagram GEM',
        description: 'Síguenos en Instagram',
        url: 'https://www.instagram.com/gemgrupoelyonmexico/',
        icon: LinkIcon,
      },
      {
        title: 'YouTube GEM',
        description: 'Canal oficial con capacitaciones',
        url: 'https://www.youtube.com/channel/UCcVc1bKlRsCDdKm87B6nwjw',
        icon: LinkIcon,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Recursos | ADN Puebla</title>
        <meta name="description" content="Accede a catálogos, scripts de ventas, imágenes para redes sociales y enlaces importantes" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>
              Recursos
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Herramientas y materiales para impulsar tu negocio
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Documentos descargables</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.documents.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-all duration-200">
                      <CardHeader>
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Imágenes para redes sociales</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resources.images.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="pt-6">
                        <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                          <Icon className="w-16 h-16 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold mb-1">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                        <Button variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Enlaces importantes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.links.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3 mb-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{link.title}</h3>
                            <p className="text-sm text-muted-foreground">{link.description}</p>
                          </div>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir enlace
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResourcesPage;
