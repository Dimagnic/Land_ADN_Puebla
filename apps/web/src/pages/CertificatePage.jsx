import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { Printer, Download, ArrowLeft, Award } from 'lucide-react';

const CertificatePage = () => {
  const { user, profile, nombreCompleto, codigoDistribuidor, nombrePatrocinador } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date().toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    setCurrentDate(date);
  }, []);

  const handlePrint = () => window.print();

  const nombre = nombreCompleto || profile?.nombre_completo || user?.email || 'Participante';
  const codigo = codigoDistribuidor || profile?.codigo_distribuidor || '—';
  const patrocinador = nombrePatrocinador || profile?.nombre_patrocinador || 'ADN Puebla';

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Certificado de Completación | ADN Puebla</title>
        <meta name="description" content="Certificado oficial de completación de capacitación ADN Puebla" />
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-8 print:bg-white print:py-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 print:hidden gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-12 md:p-16 rounded-2xl shadow-2xl print:shadow-none print:p-0 relative overflow-hidden border-8 border-double border-primary/10 print:border-primary/20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-br-full -z-10 print:bg-primary/10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-tl-full -z-10 print:bg-primary/10"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <img
                src="https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/cc2ce7bfd135fd33083b232d71ee36cb.png"
                alt="ADN Puebla Logo"
                className="w-[120px] h-auto object-contain mb-8"
              />
              <div className="space-y-2 mb-12">
                <h1 className="text-sm md:text-base font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  Grupo Elyón México
                </h1>
                <h2 className="text-3xl md:text-5xl font-extrabold text-foreground" style={{letterSpacing: '-0.02em'}}>
                  CERTIFICADO DE COMPLETACIÓN
                </h2>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground mb-4">
                Se otorga el presente certificado a:
              </p>
              <h3 className="text-4xl md:text-5xl font-bold text-primary mb-8 border-b-2 border-primary/20 pb-4 px-12 inline-block">
                {nombre}
              </h3>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-16">
                Por haber completado satisfactoriamente el programa integral de capacitación
                <strong className="text-foreground font-semibold"> ADN Puebla</strong>,
                demostrando compromiso, liderazgo y dedicación hacia su desarrollo profesional
                y libertad financiera.
              </p>
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-end mt-8">
                <div className="flex flex-col items-center">
                  <div className="w-48 border-b border-foreground/20 mb-3"></div>
                  <p className="font-semibold text-foreground">{patrocinador}</p>
                  <p className="text-sm text-muted-foreground">Patrocinador Oficial</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2 border-4 border-primary/20">
                    <Award className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-xs font-bold tracking-widest text-primary uppercase">Sello Oficial</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-48 border-b border-foreground/20 mb-3 text-center pb-1">
                    <span className="font-medium text-foreground">{currentDate}</span>
                  </div>
                  <p className="font-semibold text-foreground">Fecha de Emisión</p>
                  <p className="text-sm text-muted-foreground">Puebla, México</p>
                </div>
              </div>
              <div className="mt-16 text-sm text-muted-foreground font-mono">
                ID de Distribuidor: {codigo}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CertificatePage;
