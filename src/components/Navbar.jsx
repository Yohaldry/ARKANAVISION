import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ businessName = "ARKA", accentColor = "#3b82f6", onStartProject }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Imágenes proporcionadas
  const isotipoUrl = 'https://res.cloudinary.com/dtkirmtfq/image/upload/v1772576128/ARKA/hl570ndgdnizwe7tkezb.png';
  const esloganUrl = 'https://res.cloudinary.com/dtkirmtfq/image/upload/v1772576194/ARKA/uqj59q9gu6fcxm4uhlsl.png';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Servicios', href: '#' },
    { name: 'Proyectos', href: '#' },
    { name: 'Contacto', href: '#' },
  ];

  const handleAction = (e) => {
    if (onStartProject) {
      e.preventDefault();
      onStartProject();
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        /* Padding reducido en móvil (px-4) y mayor en escritorio (lg:px-10) */
        isScrolled 
          ? 'py-3 px-4 lg:px-10 bg-[#050914]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' 
          : 'py-5 px-4 lg:px-10 bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* --- CONTENEDOR DE MARCA --- */}
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
          <a href="/" className="flex items-center gap-3 md:gap-4">
            {/* Isotipo: Ajustado para no chocar con el eslogan grande */}
            <img 
              src={isotipoUrl} 
              alt="Logo Icon" 
              className={`transition-all duration-500 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] ${
                isScrolled ? 'h-8 lg:h-12' : 'h-10 lg:h-14'
              }`}
            />
            
            {/* Eslogan: TAMAÑO AUMENTADO EN MÓVIL */}
            <div className="flex flex-col justify-center">
              <img 
                src={esloganUrl} 
                alt="Brand Text" 
                className={`transition-all duration-500 object-contain brightness-200 ${
                  isScrolled 
                    ? 'h-10 lg:h-20 w-auto' // Antes h-6
                    : 'h-12 lg:h-28 w-auto' // Antes h-8
                }`}
              />
            </div>
          </a>
        </div>

        {/* --- LINKS DE ESCRITORIO --- */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all hover:translate-y-[-1px]"
            >
              {link.name}
            </a>
          ))}
          
          <a 
            href="/iniciar-proyecto"
            onClick={handleAction}
            className="px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2"
            style={{ 
              backgroundColor: accentColor,
              boxShadow: `0 10px 20px -10px ${accentColor}66`
            }}
          >
            Iniciar Proyecto <ArrowRight size={12} />
          </a>
        </div>

        {/* --- BOTÓN MENÚ MÓVIL --- */}
        <button 
          className="md:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10 active:scale-90 transition-transform"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MENÚ MÓVIL CON TRANSICIÓN SUAVE --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 bg-[#050914]/fb backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-5 md:hidden shadow-2xl"
          >
            {navLinks.map((link, i) => (
              <motion.a 
                key={link.name} 
                href={link.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300 border-b border-white/5 pb-4 hover:text-blue-500 transition-colors"
              >
                {link.name}
              </motion.a>
            ))}
            <motion.a 
              href="/iniciar-proyecto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={handleAction}
              className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg text-center"
              style={{ backgroundColor: accentColor }}
            >
              Iniciar Proyecto
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;