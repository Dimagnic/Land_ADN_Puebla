import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Users, TrendingUp, Wrench, PlayCircle, CheckCircle2, MessageCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import WhatsAppButton from '@/components/WhatsAppButton.jsx';
import InfoRequestModal from '@/components/InfoRequestModal.jsx';
import TestimoniosSection from '@/components/TestimoniosSection.jsx';
import { getCMSSection } from '@/lib/supabaseClient.js';

const ICON_MAP = { BookOpen, TrendingUp, Users, Wrench };

const fadeInUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };

const DEFAULT_HERO = {
  title: 'Aprende a fortalecer tus hábitos financieros y construir un mejor futuro',
  subtitle: 'Descubre estrategias prácticas, desarrolla tu liderazgo y únete a una comunidad comprometida.',
  btn_primary: 'Solicitar Información',
  btn_secondary: 'Contactar por WhatsApp',
  bg_image: 'https://images.unsplash.com/photo-1695173583133-c19731e2df44?q=80&w=2070&auto=format&fit=crop',
  logo_url: 'https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/5aa1b7bbf925833bae29155d3c3acdb9.png',
};
const DEFAULT_HEADER = null;
const DEFAULT_BENEFITS = {
  title: 'Todo lo que necesitas para crecer',
  subtitle: 'Nuestro programa está diseñado para brindarte herramientas integrales.',
  items: [
    { icon: 'BookOpen', title: 'Educación Financiera', desc: 'Aprende a administrar, ahorrar e invertir tus recursos de manera inteligente.' },
    { icon: 'TrendingUp', title: 'Desarrollo Personal', desc: 'Potencia tus habilidades de liderazgo, comunicación y mentalidad de éxito.' },
    { icon: 'Users', title: 'Comunidad de Apoyo', desc: 'Rodéate de personas con tus mismos objetivos y comparte experiencias.' },
    { icon: 'Wrench', title: 'Herramientas Prácticas', desc: 'Recibe plantillas, guías y recursos aplicables a tu día a día.' },
  ],
};
const DEFAULT_FAQ = {
  title: 'Preguntas Frecuentes',
  items: [
    { q: '¿Tiene costo solicitar información?', a: 'No, es completamente gratuito y sin compromiso.' },
    { q: '¿Necesito experiencia previa?', a: 'No. El programa va paso a paso desde conceptos básicos.' },
    { q: '¿Cómo recibo más detalles?', a: 'Llena el formulario o contáctanos por WhatsApp.' },
    { q: '¿Puedo participar desde cualquier lugar?', a: 'Sí, tenemos modalidades virtuales y presenciales.' },
  ],
};

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hero, setHero]         = useState(DEFAULT_HERO);
  const [headerCMS, setHeaderCMS] = useState(DEFAULT_HEADER);
  const [benefits, setBenefits] = useState(DEFAULT_BENEFITS);
  const [faq, setFaq]           = useState(DEFAULT_FAQ);
  const [seo, setSeo]           = useState(null);

  useEffect(() => {
    getCMSSection('hero').then(d => d && setHero(d));
    getCMSSection('header').then(d => d && setHeaderCMS(d));
    getCMSSection('benefits').then(d => d && setBenefits(d));
    getCMSSection('faq').then(d => d && setFaq(d));
    getCMSSection('seo').then(d => d && setSeo(d));
  }, []);

  const openWhatsApp = () => window.open('https://wa.me/5212221234567?text=Hola,%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20ADN%20Puebla', '_blank');

  return (
    <>
      <Helmet>
        <title>{seo?.title || 'ADN Puebla - Educación Financiera y Desarrollo Personal'}</title>
        <meta name="description" content={seo?.description || 'Aprende a fortalecer tus hábitos financieros.'} />
      </Helmet>
      <Header cmsData={headerCMS} />
      <main className="pt-[130px] md:pt-[180px]">
        {/* Hero */}
        <section id="hero" className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-primary to-[hsl(var(--primary-bright))]">
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
            <img src={hero.bg_image} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
            <motion.div className="flex flex-col items-center text-center max-w-4xl mx-auto" initial="hidden" animate="visible" variants={stagger}>
              <motion.img variants={fadeInUp} src={hero.logo_url} alt="ADN Puebla" className="h-[180px] md:h-[260px] w-auto object-contain mb-8 brightness-0 invert drop-shadow-2xl" />
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-balance drop-shadow-md" style={{ letterSpacing: '-0.02em' }}>
                {hero.title}
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
                {hero.subtitle}
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button size="lg" onClick={() => setIsModalOpen(true)} className="text-base h-14 px-8 rounded-full btn-primary w-full sm:w-auto">
                  {hero.btn_primary}
                </Button>
                <Button size="lg" onClick={openWhatsApp} className="text-base h-14 px-8 rounded-full btn-secondary w-full sm:w-auto">
                  <MessageCircle className="w-5 h-5 mr-2" />{hero.btn_secondary}
                </Button>
                <Button size="lg" asChild className="text-base h-14 px-8 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold w-full sm:w-auto">
                  <a href="/registro">🎓 Únete ahora</a>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{benefits.title}</h2>
              <p className="text-lg text-muted-foreground">{benefits.subtitle}</p>
            </motion.div>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              {benefits.items.map((b, idx) => {
                const Icon = ICON_MAP[b.icon] || BookOpen;
                return (
                  <motion.div key={idx} variants={fadeInUp}>
                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow bg-card">
                      <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                          <Icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{b.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Video */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Conoce más sobre ADN Puebla</h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Descubre cómo nuestra metodología ha ayudado a cientos de personas a transformar su relación con el dinero.
                </p>
                <ul className="space-y-4 mb-8">
                  {['Metodología probada', 'Acompañamiento continuo', 'Resultados medibles'].map((item, i) => (
                    <li key={i} className="flex items-center text-foreground font-medium">
                      <CheckCircle2 className="w-5 h-5 text-primary mr-3" />{item}
                    </li>
                  ))}
                </ul>
                <Button size="lg" onClick={openWhatsApp} className="rounded-full btn-secondary">
                  <MessageCircle className="w-5 h-5 mr-2" />Contáctanos hoy
                </Button>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-slate-900 group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                  alt="Video" className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tu camino hacia el éxito</h2>
              <p className="text-lg text-muted-foreground">Un proceso simple y transparente.</p>
            </motion.div>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-border z-0"></div>
                {[
                  { step: '01', title: 'Mira contenido gratuito', desc: 'Explora nuestros recursos iniciales sin compromiso.' },
                  { step: '02', title: 'Solicita información', desc: 'Contáctanos para conocer los detalles del programa.' },
                  { step: '03', title: 'Recibe orientación', desc: 'Habla con un asesor para resolver tus dudas.' },
                  { step: '04', title: 'Decide si es adecuado', desc: 'Toma una decisión informada sobre tu participación.' },
                ].map((item, idx) => (
                  <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xl font-bold text-primary mb-6 shadow-sm">{item.step}</div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TestimoniosSection />

        {/* FAQ */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{faq.title}</h2>
            </motion.div>
            <Accordion type="single" collapsible className="w-full">
              {faq.items.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-lg font-medium">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Final */}
        <section id="contact" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Da el siguiente paso</h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 leading-relaxed">
                No dejes tu futuro financiero al azar. Únete a ADN Puebla y comienza a construir la vida que deseas.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" onClick={() => setIsModalOpen(true)} className="text-base h-14 px-8 rounded-full btn-primary">
                  Solicitar Información
                </Button>
                <Button size="lg" asChild className="text-base h-14 px-8 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                  <a href="/registro">🎓 Únete ahora</a>
                </Button>
                <Button size="lg" variant="outline" onClick={openWhatsApp} className="text-base h-14 px-8 rounded-full bg-transparent border-white text-white hover:bg-white/10">
                  <MessageCircle className="w-5 h-5 mr-2" />Escríbenos por WhatsApp
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <InfoRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default HomePage;
