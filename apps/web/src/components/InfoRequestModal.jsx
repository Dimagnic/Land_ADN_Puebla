import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';
import { checkEmailExists, createProspect } from '@/lib/supabaseClient.js';

const InfoRequestModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    interes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, interes: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if email exists
      const { exists, error: checkError } = await checkEmailExists(formData.email);
      
      if (checkError) {
        throw new Error('Error al verificar el correo');
      }

      if (exists) {
        toast.error('Este email ya está registrado');
        setIsSubmitting(false);
        return;
      }

      // Create prospect
      const { success, error: createError } = await createProspect(
        formData.nombre,
        formData.email,
        formData.telefono,
        formData.interes
      );

      if (!success || createError) {
        throw new Error('Error al guardar la información');
      }

      toast.success('Información registrada correctamente. Nos contactaremos pronto.');
      setFormData({ nombre: '', email: '', telefono: '', interes: '' });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const interestText = formData.interes ? formData.interes.replace('_', ' ') : 'sus programas';
    const message = `Hola ADN Puebla, me interesa saber más sobre ${interestText}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5212221234567?text=${encodedMessage}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Solicitar Información</DialogTitle>
          <DialogDescription>
            Déjanos tus datos y un asesor se pondrá en contacto contigo para brindarte más detalles.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input 
              id="nombre" 
              name="nombre" 
              required 
              value={formData.nombre} 
              onChange={handleChange} 
              placeholder="Ej. Juan Pérez"
              className="bg-background text-foreground"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="correo@ejemplo.com"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input 
                id="telefono" 
                name="telefono" 
                type="tel" 
                required 
                value={formData.telefono} 
                onChange={handleChange} 
                placeholder="10 dígitos"
                className="bg-background text-foreground"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interes">Área de interés *</Label>
            <Select required value={formData.interes} onValueChange={handleSelectChange}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue placeholder="Selecciona un área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educacion_financiera">Educación Financiera</SelectItem>
                <SelectItem value="liderazgo">Liderazgo</SelectItem>
                <SelectItem value="bienestar">Bienestar</SelectItem>
                <SelectItem value="todos">Todos los programas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">O contáctanos por</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InfoRequestModal;