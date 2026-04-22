import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Eye, Rocket, Cpu, 
  Code2, Database, Layout, 
  ArrowUpRight, Sparkles 
} from 'lucide-react';

const technologies = [
  { name: "React", icon: "⚛️" }, { name: "Next.js", icon: "▲" },
  { name: "Tailwind", icon: "🌊" }, { name: "MQL5", icon: "📈" },
  { name: "Node.js", icon: "🟢" }, { name: "Shopify", icon: "🛍️" },
  { name: "Python", icon: "🐍" }, { name: "Firebase", icon: "🔥" }
];

const Portfolio = () => {
  const [hoveredTech, setHoveredTech] = useState(null);

  return (
    <div className="min-h-screen bg-[#030303] text-white py-20 px-6 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-16 border-l-4 border-blue-600 pl-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter"
          >
            Our <span className="text-blue-500">Core</span>
          </motion.h2>
          <p className="text-white/40 tracking-[0.3em] text-xs uppercase mt-2">Engineering the future of digital assets</p>
        </div>

        {/* --- BENTO GRID PRINCIPAL --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[200px]">
          
          {/* TARJETA: OBJETIVO (Grande) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-8 md:row-span-2 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 relative overflow-hidden group"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <Target className="text-blue-500 group-hover:rotate-12 transition-transform" size={40} />
              <div>
                <h3 className="text-1xl font-black italic uppercase mb-4 text-blue-500">Objetivo</h3>
                <p className="text-m  text-white/60 max-w-xl leading-relaxed">
                  Fusionar el mundo del <span className="text-white font-bold">trading de alta precisión</span> con el desarrollo web de vanguardia, creando herramientas que no solo funcionen, sino que dominen el mercado.
                </p>
              </div>
            </div>
            {/* Decoración de fondo */}
            <div className="absolute top-[-20%] right-[-10%] text-[20rem] font-black italic text-white/[0.02] select-none pointer-events-none">
              GOAL
            </div>
          </motion.div>

          {/* TARJETA: MISIÓN */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 md:row-span-1 bg-blue-600 rounded-3xl p-6 relative overflow-hidden"
          >
            <Rocket className="text-white mb-4" size={30} />
            <h3 className="text-2xl font-black italic uppercase mb-2">Misión</h3>
            <p className="text-sm text-blue-100">Digitalizar marcas de lujo y optimizar algoritmos financieros con estética impecable.</p>
          </motion.div>

          {/* TARJETA: VISIÓN */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 md:row-span-1 bg-[#111] border border-white/10 rounded-3xl p-6 relative overflow-hidden"
          >
            <Eye className="text-blue-500 mb-4" size={30} />
            <h3 className="text-2xl font-black italic uppercase mb-2">Visión</h3>
            <p className="text-sm text-white/50">Ser el referente #1 en Colombia para soluciones híbridas entre FinTech y Web Experience.</p>
          </motion.div>

          {/* --- SECCIÓN TECNOLOGÍAS (Full Width Interactivo) --- */}
          <div className="md:col-span-12 md:row-span-1 bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden flex items-center relative">
            <div className="absolute left-8 z-20 bg-[#0a0a0a] pr-4">
              <div className="flex items-center gap-2">
                <Cpu className="text-blue-500" size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Stack</span>
              </div>
            </div>
            
            {/* Cinta infinita de tecnologías */}
            <div className="flex whitespace-nowrap animate-infinite-scroll hover:[animation-play-state:paused] ml-32">
              {[...technologies, ...technologies].map((tech, i) => (
                <div 
                  key={i}
                  className="mx-8 flex items-center gap-3 text-2xl font-black italic uppercase text-white/20 hover:text-blue-500 transition-colors cursor-default"
                >
                  <span className="text-3xl">{tech.icon}</span>
                  {tech.name}
                </div>
              ))}
            </div>
          </div>

          {/* --- MINIATURA PROYECTO EJEMPLO (Con tu video vertical) --- */}
          <motion.div 
            className="md:col-span-6 md:row-span-2 relative rounded-3xl overflow-hidden group border border-white/5"
            onMouseEnter={() => setHoveredTech(1)}
            onMouseLeave={() => setHoveredTech(null)}
          >
            <img 
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800" 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700"
            />
            {/* Video Vertical centrado al hacer hover */}
            <AnimatePresence>
              {hoveredTech === 1 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 z-20 flex items-center justify-center p-6"
                >
                  <div className="h-full aspect-[9/16] bg-black rounded-xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/20">
                    <video 
                      autoPlay muted loop playsInline
                      src="https://assets.mixkit.co/videos/preview/mixkit-man-getting-a-haircut-in-a-barbershop-41527-large.mp4"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-8 left-8 z-30">
              <h4 className="text-4xl font-black italic uppercase leading-none">Lords <br /> <span className="text-blue-500">Barber</span></h4>
            </div>
          </motion.div>

          {/* TARJETA DE ESTADÍSTICA O FRASES (Entretenida) */}
          <div className="md:col-span-6 md:row-span-2 grid grid-cols-2 gap-4">
             <div className="bg-[#111] rounded-3xl p-6 flex flex-col justify-between border border-white/5">
                <span className="text-5xl font-black text-blue-500 italic">21+</span>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Proyectos desplegados en Bogotá</p>
             </div>
             <div className="bg-[#0a0a0a] rounded-3xl p-6 flex items-center justify-center border border-dashed border-white/20 hover:border-blue-500 transition-colors group">
                <Sparkles size={40} className="text-white/20 group-hover:text-blue-500 group-hover:animate-spin transition-all" />
             </div>
             <div className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 flex items-center justify-between">
                <span className="text-xl font-black italic uppercase">¿Listo para el siguiente nivel?</span>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
                    <ArrowUpRight size={24} />
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Estilos para la animación de scroll infinito */}
      <style jsx>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Portfolio;