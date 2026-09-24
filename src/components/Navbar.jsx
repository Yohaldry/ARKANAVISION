import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Menu, X, Zap, Shield } from 'lucide-react'; // Cambiamos Scan por Shield para el panel de Admin
import { useNavigate } from 'react-router-dom';
import ArkanaProjectModal from './ArkanaProjectModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const navigate = useNavigate();

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
          <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden group-hover:rotate-12 transition-transform duration-300">
            <img 
              src={'https://res.cloudinary.com/dtkirmtfq/image/upload/v1776979708/ARKA/vjg0qu0zutvr7mdbjnit.png'} 
              alt="Arka Vision Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="h-6 md:h-8">
            <img 
              src={'https://res.cloudinary.com/dtkirmtfq/image/upload/v1776979716/ARKA/t8gnvxfyucr0aiz7rqni.png'} 
              alt="ARKA VISION"
              className="h-full w-auto object-contain brightness-100" 
            />
          </div>
        </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4">
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
            
            {/* BOTÓN ADMIN (DESKTOP) */}
            <motion.button
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="relative overflow-hidden bg-gradient-to-r from-[#00E5FF] to-[#1677FF] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase italic flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all border border-[#00E5FF]/20 group"
            >
              <motion.div
                variants={{
                  hover: { x: 4, scale: 1.1 }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Shield size={14} className="stroke-[2.5]" />
              </motion.div>
              <span>Admin</span>
            </motion.button>

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

       {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-full left-0 w-full bg-black/70 backdrop-blur-xl border-b border-white/10 overflow-hidden"
            >
              <div className="p-9 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <motion.a 
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 px-2 text-xs font-black italic text-white/70 hover:text-blue-500 uppercase tracking-[0.2em] transition-all border-b border-white/[0.03]"
                    whileTap={{ x: 5, color: "#3b82f6" }}
                  >
                    {link.name}
                  </motion.a>
                ))}
                
                {/* BOTÓN ADMIN (MOBILE) */}
                <div className="pt-4 flex flex-col gap-3">
                  <motion.button 
                    whileHover="hover"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full bg-gradient-to-r from-[#00E5FF] to-[#1677FF] text-white py-3.5 rounded-xl font-black uppercase italic text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 border border-[#00E5FF]/20"
                  >
                    <motion.div
                      variants={{
                        hover: { x: 5 }
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex items-center justify-center"
                    >
                      <Shield size={14} className="stroke-[2.5]" />
                    </motion.div>
                    Admin
                  </motion.button>

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