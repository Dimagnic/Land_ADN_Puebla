import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import InfoRequestModal from './InfoRequestModal.jsx';

const Header = ({ cmsData }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const logoUrl = cmsData?.logo_url || 'https://horizons-cdn.hostinger.com/1060bfed-4778-45d1-8346-df361739fa1c/5aa1b7bbf925833bae29155d3c3acdb9.png';
  const navLinks = cmsData?.nav_links || [
    { label: 'Inicio', id: 'hero' },
    { label: 'Beneficios', id: 'benefits' },
    { label: 'Comunidad', id: 'community' },
    { label: 'Contacto', id: 'contact' },
  ];
  const ctaText = cmsData?.cta_text || 'Solicitar Información';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-primary text-primary-foreground ${isScrolled ? 'shadow-lg py-2' : 'py-4'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center space-x-2">
              <img src={logoUrl} alt="ADN Puebla Logo" className="h-[80px] md:h-[120px] w-auto object-contain brightness-0 invert transition-all duration-300" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-primary-foreground/90 hover:text-[hsl(var(--accent))] transition-colors">
                  {item.label}
                </button>
              ))}

              {user ? (
                <div className="flex items-center gap-2">
                  <Button onClick={() => navigate('/dashboard')} variant="secondary" size="sm" className="rounded-full">
                    Mi plataforma
                  </Button>
                  {isAdmin && (
                    <Button onClick={() => navigate('/admin')} size="sm"
                      className="rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold gap-1">
                      <Shield className="w-4 h-4" /> Admin
                    </Button>
                  )}
                  <Button onClick={logout} variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground gap-1">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button onClick={() => navigate('/login')} variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Ingresar
                  </Button>
                  <Button onClick={() => setIsModalOpen(true)} className="rounded-full px-6 btn-primary">
                    {ctaText}
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                  <Menu className="h-8 w-8" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background text-foreground">
                <div className="flex flex-col space-y-4 mt-10">
                  {navLinks.map((item) => (
                    <button key={item.id} onClick={() => scrollToSection(item.id)}
                      className="text-lg font-medium text-left text-foreground hover:text-primary transition-colors">
                      {item.label}
                    </button>
                  ))}
                  <div className="pt-4 border-t space-y-2">
                    {user ? (
                      <>
                        <Button onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }} className="w-full">Mi plataforma</Button>
                        {isAdmin && (
                          <Button onClick={() => { setIsMobileMenuOpen(false); navigate('/admin'); }}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                            <Shield className="w-4 h-4 mr-2" /> Panel Admin
                          </Button>
                        )}
                        <Button onClick={logout} variant="outline" className="w-full">Cerrar sesión</Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} variant="outline" className="w-full">Ingresar</Button>
                        <Button onClick={() => { setIsMobileMenuOpen(false); setIsModalOpen(true); }} className="w-full btn-primary">{ctaText}</Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <InfoRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;
