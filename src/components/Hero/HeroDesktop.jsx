import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, Rocket, ChevronRight } from 'lucide-react';

const HeroDesktop = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden bg-dark">
      {/* Fondo con Grid Tecnológico y Gradiente */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-accent/10 blur-[120px] rounded-full -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Badge de disponibilidad - Mobile Friendly */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 mb-8 mt-5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs  md:text-sm font-mono text-accent tracking-wider uppercase">
              Disponible para nuevos proyectos
            </span>
          </motion.div>

          {/* Título Principal - Ajuste de tamaño responsivo */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl md:text-8xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]"
          >
            Ingeniería de Software <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-emerald-400">
              de Clase Mundial.
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl text-gray-400 text-base md:text-xl mb-10 leading-relaxed"
          >
            Creamos, remodelamos y escalamos plataformas digitales con estándares corporativos. 
            Tu visión, programada con precisión absoluta.
          </motion.p>

          {/* Botones de Acción - Stacked en móvil, Row en desktop */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button className="group flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-black rounded-xl font-bold transition-all hover:bg-accent hover:text-white shadow-xl shadow-accent/10">
              Agendar ConsultoríaHH
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-surface border border-white/10 text-white rounded-xl font-semibold hover:bg-white/5 transition-all">
              Ver Portafolio
            </button>
          </motion.div>

          {/* Stats Rápidos (Solo visibles en tablets/desktop para no saturar móvil) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 border-t border-white/5 pt-10"
          >
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-bold text-white">99.9%</span>
              <span className="text-gray-500 text-xs md:text-sm uppercase tracking-widest">Uptime</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-bold text-white">+50</span>
              <span className="text-gray-500 text-xs md:text-sm uppercase tracking-widest">Sistemas Creados</span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-2xl md:text-3xl font-bold text-white">24/7</span>
              <span className="text-gray-500 text-xs md:text-sm uppercase tracking-widest">Soporte Tech</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroDesktop;