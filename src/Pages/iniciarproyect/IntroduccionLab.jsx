import React from 'react';
import { 
  Play, 
  Sparkles, 
  Rocket, 
  ShieldCheck, 
  Zap, 
  ArrowRight 
} from 'lucide-react';

const IntroduccionLab = ({ onStart }) => {
  return (
    <div className="h-screen w-full bg-[#050914] text-white flex flex-col font-sans overflow-hidden relative">
      {/* Estilos locales para el grid de fondo y animaciones */}
      <style>{`
        .bg-grid { 
          background-image: radial-gradient(circle, #3b82f6 1px, transparent 1px); 
          background-size: 40px 40px; 
          opacity: 0.05; 
        }
        .glow-effect {
          box-shadow: 0 0 40px rgba(34, 197, 94, 0.3);
        }
      `}</style>

      {/* Malla de fondo futurista */}
      <div className="absolute inset-0 bg-grid"></div>

      {/* Contenido Principal */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full text-center space-y-10 animate-in fade-in zoom-in duration-700">
          
          {/* Badge Superior */}
          <div className="flex items-center gap-4 text-blue-500 bg-blue-500/10 px-6 py-2 rounded-full border border-blue-500/20 mx-auto w-fit">
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Engineering Excellence</span>
          </div>
          
          {/* Título Principal */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              Project <span className="text-blue-500">Lab</span>
            </h1>
            <p className="text-white/40 text-sm md:text-lg font-medium max-w-xl mx-auto leading-relaxed uppercase tracking-widest">
              Bienvenido a la fase de diagnóstico. Vamos a definir la estructura de tu próximo activo digital de alto rendimiento.
            </p>
          </div>

          {/* Botón de Inicio Verde */}
          <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto pt-4">
            <a 
            href="/formulario"
              onClick={onStart}
              className="group relative w-full py-6 bg-green-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-green-400 transition-all active:scale-95 glow-effect"
            >
              <Play size={18} fill="currentColor" />
              Iniciar Formulario
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-[9px] text-white/20 uppercase tracking-widest">Tiempo estimado: 3 minutos</p>
          </div>

          {/* Footer de la Intro con Features */}
          <div className="grid grid-cols-3 gap-8 pt-12 opacity-30 border-t border-white/5 w-full max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <Rocket size={20} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Alta Velocidad</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck size={20} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Seguridad Total</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap size={20} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Smart Design</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decoración lateral (opcional) */}
      <div className="absolute bottom-10 left-10 opacity-10 hidden lg:block">
        <div className="text-[100px] font-black italic select-none">ARKA</div>
      </div>
    </div>
  );
};

export default IntroduccionLab;