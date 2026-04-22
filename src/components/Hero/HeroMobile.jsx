import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const HeroMobile = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-[#030712] px-4 text-center overflow-hidden">
      
      {/* 1. Fondo con imagen nítida y sutil */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img 
          src={'https://res.cloudinary.com/dtkirmtfq/image/upload/v1772470626/uhc1rxb6pw0jtvebsyds.png'} 
          className="w-full h-full object-cover scale-125 translate-y-10" 
          alt="Visual Background" 
        />
        {/* Capa de degradado para que no se corte la imagen */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="z-10 flex flex-col items-center gap-6 w-full"
      >
        {/* Tag Superior Estilo Tech */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono tracking-widest uppercase mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Innovación Digital 2026
        </div>

        {/* Título con Degradado (Exacto a la foto) */}
        <h1 className="text-[35px] md:text-5xl font-black leading-[1.1] text-white tracking-tight">
          Ingeniería de <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Software de Clase Mundial
          </span>
        </h1>
        
        <p className="text-gray-400 text-sm px-6 leading-relaxed max-w-sm">
          Creamos, remodelamos y escalamos plataformas digitales con estándares corporativos y precisión absoluta.
        </p>
        
        {/* Botones uno al lado del otro */}
        <div className="flex flex-row justify-center items-center gap-3 w-full px-2 mt-4">
          <button className="flex-1 bg-gradient-to-r from-[#E1702F] to-[#f17a35] text-white py-4 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 shadow-lg shadow-orange-900/40 active:scale-95 transition-transform">
            Consultoría
            <ArrowUpRight size={14} />
          </button>
          
          <button className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold text-[12px] backdrop-blur-md active:scale-95 transition-transform">
            Ver Portafolio
          </button>
        </div>

        {/* Widget Inferior de Construcciones */}
        <div className="mt-10 flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
           <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold">JS</div>
              <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold">RE</div>
           </div>
           <span className="text-[11px] text-gray-300 font-medium">Construcciones en vivo</span>
           <ArrowUpRight size={12} className="text-gray-500" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroMobile;