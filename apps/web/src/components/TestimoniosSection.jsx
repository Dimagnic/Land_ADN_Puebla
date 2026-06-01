import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Quote } from 'lucide-react';
import { getTestimonios } from '@/lib/supabaseClient.js';

const TestimoniosSection = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonios = async () => {
      const { data, error } = await getTestimonios();
      if (!error && data && data.length > 0) {
        setTestimonios(data);
      } else {
        // Fallback data if Supabase is empty or fails
        setTestimonios([
          { id: 1, nombre: "Lucia Torres", cargo: "Emprendedora", contenido: "ADN Puebla me dio la claridad que necesitaba para organizar mis finanzas y empezar a invertir en mi negocio con seguridad." },
          { id: 2, nombre: "Raj Patel", cargo: "Profesional Independiente", contenido: "La comunidad es increíble. No solo aprendes teoría, sino que te rodeas de personas que te impulsan a ser mejor cada día." },
          { id: 3, nombre: "Maya Chen", cargo: "Estudiante Universitaria", contenido: "Ojalá hubiera aprendido esto antes. Las herramientas prácticas me han ayudado a crear un fondo de ahorro mientras estudio." }
        ]);
      }
      setLoading(false);
    };

    fetchTestimonios();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="community" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Lo que dice nuestra comunidad</h2>
          <p className="text-lg text-muted-foreground">Historias reales de personas que han transformado sus hábitos con nosotros.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full border-none shadow-md">
                <CardContent className="p-8">
                  <Skeleton className="h-4 w-24 mb-6" />
                  <Skeleton className="h-20 w-full mb-8" />
                  <div className="flex items-center mt-auto">
                    <Skeleton className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonios.map((testimonial) => (
              <motion.div key={testimonial.id} variants={itemVariants}>
                <Card className="h-full border-t-4 border-t-primary shadow-md hover:shadow-xl hover:border-t-[hsl(var(--accent))] transition-all duration-300 bg-white group">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex space-x-1">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" />)}
                      </div>
                      <Quote className="w-8 h-8 text-primary/10 group-hover:text-[hsl(var(--accent))]/20 transition-colors" />
                    </div>
                    <p className="text-foreground/80 italic mb-8 leading-relaxed flex-grow">"{testimonial.contenido}"</p>
                    <div className="flex items-center mt-auto">
                      {testimonial.imagen_url ? (
                        <img src={testimonial.imagen_url} alt={testimonial.nombre} className="w-12 h-12 rounded-full object-cover mr-4" />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4 bg-primary/10 text-primary">
                          {testimonial.nombre.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-foreground">{testimonial.nombre}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.cargo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TestimoniosSection;