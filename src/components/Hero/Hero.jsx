import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Zap } from 'lucide-react';
import PrioritySlotModal from '../PrioritySlotModal';

const Hero = () => {
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-[#030712] px-4 md:px-6 text-center overflow-hidden pt-20 md:pt-32">
        
        {/* --- FONDO --- */}
        <div className="absolute inset-0 z-0">
          {/* Grid Tecnológico (Solo PC) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] hidden md:block" />
          
          {/* Imagen de Fondo (Tu configuración móvil) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img 
              src={'https://res.cloudinary.com/dtkirmtfq/image/upload/v1772470626/uhc1rxb6pw0jtvebsyds.png'} 
              className="w-full h-full object-cover scale-125 md:scale-100 translate-y-10 md:translate-y-0" 
              alt="Visual Background" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]" />
          </div>
          {/* Brillo superior de PC */}
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 hidden md:block" />
        </div>

        {/* --- CONTENIDO --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="z-10 flex flex-col items-center gap-6 w-full max-w-7xl mx-auto"
        >
          {/* Tag Superior (Configuración móvil) */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] md:text-sm font-mono tracking-widest uppercase mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Innovación Digital 2026
          </div>

          {/* Título (Responsivo) */}
          <h1 className="text-[35px] sm:text-6xl md:text-8xl font-black leading-[1.1] text-white tracking-tight italic uppercase md:not-italic md:normal-case">
            Ingeniería de <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Software de Clase Mundial
            </span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-gray-400 text-sm md:text-xl px-6 md:px-0 leading-relaxed max-w-sm md:max-w-2xl font-medium md:font-normal">
            Creamos, remodelamos y escalamos plataformas digitales con estándares corporativos y precisión absoluta.
          </p>
          
          {/* Botones */}
          <div className="flex flex-row justify-center items-center gap-3 w-full md:w-auto px-2 mt-4">
            <button 
              onClick={() => setIsPriorityModalOpen(true)}
              className="flex-1 md:flex-none bg-gradient-to-r from-[#E1702F] to-[#f17a35] text-white px-8 py-4 rounded-xl font-bold text-[12px] md:text-sm flex items-center justify-center gap-1 shadow-lg shadow-orange-900/40 active:scale-95 transition-all"
            >
              Consultoría
              <ArrowUpRight size={14} />
            </button>
            
            <button className="flex-1 md:flex-none bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold text-[12px] md:text-sm backdrop-blur-md active:scale-95 transition-all">
              Ver Portafolio
            </button>
          </div>

          {/* Widget Móvil: JS/RE (Solo visible en móviles) */}
          <div className="mt-10 md:hidden flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
             <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold text-white uppercase italic">JS</div>
                <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold text-white uppercase italic">RE</div>
             </div>
             <span className="text-[11px] text-gray-300 font-medium">Construcciones en vivo</span>
             <ArrowUpRight size={12} className="text-gray-500" />
          </div>

          {/* Stats PC (Solo visible en pantallas medianas/grandes) */}
          <div className="mt-20 hidden md:grid grid-cols-3 gap-16 border-t border-white/5 pt-10 w-full">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white italic">99.9%</span>
              <span className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-mono">Uptime</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white italic">+50</span>
              <span className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-mono">Sistemas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white italic">24/7</span>
              <span className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-mono">Soporte Tech</span>
            </div>
          </div>

        </motion.div>
      </section>

      <PrioritySlotModal 
        isOpen={isPriorityModalOpen} 
        onClose={() => setIsPriorityModalOpen(false)} 
      />
    </>
  );
};

export default Hero;