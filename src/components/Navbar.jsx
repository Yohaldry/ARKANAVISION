import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Menu, X, Zap } from 'lucide-react';
import ArkanaProjectModal from './ArkanaProjectModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Servicios', href: '#services' },
    { name: 'Proyectos', href: '#proyectos' },
    { name: 'Desarrollo', href: '#desarrollo' },
    { name: 'Novedades', href: '#novedades' },
  ];

  return (
    <>
      <nav 
        className={`fixed w-full z-[100] transition-all duration-500 ${
          isScrolled 
            ? 'py-4 bg-black/80 backdrop-blur-lg border-b border-white/5' 
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
        {/* Contenedor del Logo y Nombre */}
<motion.div 
  className="flex items-center gap-3 group cursor-pointer"
  whileHover={{ scale: 1.02 }}
>
  {/* 1. El Isotipo / Logo (Sustituye al cuadro azul con el icono) */}
  <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden group-hover:rotate-12 transition-transform duration-300">
    <img 
      src={'https://res.cloudinary.com/dtkirmtfq/image/upload/v1776979708/ARKA/vjg0qu0zutvr7mdbjnit.png'} // Ruta de tu isotipo
      alt="Arka Vision Logo"
      className="w-full h-full object-contain"
    />
  </div>

  {/* 2. El Nombre / Tipografía (Sustituye al span de texto) */}
  <div className="h-6 md:h-8">
    <img 
      src={'https://res.cloudinary.com/dtkirmtfq/image/upload/v1776979716/ARKA/t8gnvxfyucr0aiz7rqni.png'} // Ruta de la imagen del nombre
      alt="ARKA VISION"
      className="h-full w-auto object-contain brightness-100" 
    />
  </div>
</motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-8 bg-white/5 border border-white/10 px-8 py-2.5 rounded-full backdrop-blur-md">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="text-[11px] font-bold text-white/50 hover:text-white uppercase tracking-[0.2em] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase italic flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Zap size={14} className="fill-current" />
              Iniciar Proyecto
            </motion.button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

       
       {/* Mobile Menu - Tipografía elegante y pequeña como en PC */}
<AnimatePresence>
  {isMobileMenuOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="md:hidden absolute top-full left-0 w-full bg-black/570 backdrop-blur-xl border-b border-white/10 overflow-hidden"
    >
      <div className="p-9 flex flex-col gap-1"> {/* Gap reducido para mayor limpieza */}
        {navLinks.map((link) => (
          <motion.a 
            key={link.name}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            // Ajustado: text-xs (12px), font-black, italic, uppercase y tracking amplio
            className="py-3 px-2 text-xs font-black italic text-white/70 hover:text-blue-500 uppercase tracking-[0.2em] transition-all border-b border-white/[0.03]"
            whileTap={{ x: 5, color: "#3b82f6" }}
          >
            {link.name}
          </motion.a>
        ))}
        
        <div className="pt-4">
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsProjectModalOpen(true);
            }}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-black uppercase italic text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Zap size={12} className="fill-current" />
            Iniciar Proyecto
          </button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      </nav>

      <ArkanaProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;