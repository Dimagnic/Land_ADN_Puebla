import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Linkedin, Mail, MessageCircle, Youtube } from 'lucide-react';
import { getCMSSection, getSocials } from '@/lib/supabaseClient.js';

const ICON_MAP = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, whatsapp: MessageCircle, youtube: Youtube };

const DEFAULT_FOOTER = {
  brand_name: 'ADN Puebla',
  description: 'ADN Puebla es una iniciativa independiente de educación y desarrollo personal.',
  email: 'contacto@adnpuebla.com',
  whatsapp: '5212221234567',
  copyright: '© 2025 ADN Puebla. Todos los derechos reservados.',
};

const Footer = () => {
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    getCMSSection('footer').then(d => d && setFooter(d));
    getSocials().then(d => setSocials(d.filter(s => s.url)));
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground py-16 border-t border-primary-foreground/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <p className="font-bold text-2xl mb-4">{footer.brand_name}</p>
            <p className="text-sm leading-relaxed max-w-md mb-8 text-primary-foreground/80">{footer.description}</p>
            <div className="flex space-x-5">
              {socials.map(s => {
                const Icon = ICON_MAP[s.platform] || MessageCircle;
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="text-primary-foreground/80 hover:text-[hsl(var(--accent))] transition-colors">
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">Enlaces</h3>
            <ul className="space-y-3 text-sm">
              {['#hero', '#benefits', '#community', '#contact'].map((href, i) => (
                <li key={href}><a href={href} className="text-primary-foreground/80 hover:text-[hsl(var(--accent))] transition-colors">
                  {['Inicio', 'Beneficios', 'Comunidad', 'Contacto'][i]}
                </a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-primary-foreground/80">
                <Mail className="w-5 h-5 mr-3" />
                <a href={`mailto:${footer.email}`} className="hover:text-[hsl(var(--accent))] transition-colors">{footer.email}</a>
              </li>
              <li className="flex items-center text-primary-foreground/80">
                <MessageCircle className="w-5 h-5 mr-3" />
                <a href={`https://wa.me/${footer.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--accent))] transition-colors">WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-primary-foreground/20 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center text-primary-foreground/60">
          <p>{footer.copyright}</p>
          <div className="mt-4 md:mt-0 space-x-6">
            {(footer.links || [{ label: 'Aviso de Privacidad', href: '#' }, { label: 'Términos y Condiciones', href: '#' }]).map(l => (
              <a key={l.label} href={l.href} className="hover:text-[hsl(var(--accent))] transition-colors">{l.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
