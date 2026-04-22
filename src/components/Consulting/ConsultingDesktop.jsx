import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Ticket, CheckCircle2, Sparkles, Loader2, Check, X } from 'lucide-react';

const ConsultingDesktop = () => {
  const [code, setCode] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleApplyCode = () => {
    if (!code || isApplied) return;
    setIsVerifying(true);
    setIsError(false);

    setTimeout(() => {
      setIsVerifying(false);
      if (code.toUpperCase() === 'FREE2026') {
        setIsApplied(true);
      } else {
        setIsError(true);
        setTimeout(() => setIsError(false), 1500);
      }
    }, 1200);
  };

  return (
    <section className="py-20 px-6 bg-[#030712]">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#0B0F1A] border border-white/5 rounded-[2rem] p-12 flex items-center gap-16 shadow-2xl relative overflow-hidden">
          
          {/* Lado Izquierdo: Información */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono mb-6 uppercase tracking-[0.2em]">
              <Sparkles size={12} /> <span>Acceso Estratégico</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight text-white text-left">
              Asesoría <span className="text-blue-500 font-medium italic">High-End</span> <br />
              Para tu Negocio.
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm text-left">Optimización de procesos y escalabilidad tecnológica de nivel corporativo.</p>
            <div className="grid grid-cols-2 gap-3">
              {['Viabilidad técnica', 'Plan de desarrollo', 'Escalabilidad', 'Branding'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-500" />
                  <span className="text-xs text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lado Derecho: El Ticket Interactivo */}
          <div className="w-[340px] bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-inner relative">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-4">Tarifa de Consultoría</p>
            
            <div className="flex items-center justify-center gap-2 mb-8 h-10">
              <span className={`text-3xl font-bold transition-all duration-500 ${isApplied ? 'text-gray-600 line-through text-xl' : 'text-white'}`}>$20</span>
              <AnimatePresence>
                {isApplied && (
                  <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl font-black text-emerald-400"> $0 </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <motion.div 
                animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
                className="flex gap-2"
              >
                <input 
                  type="text" placeholder="CÓDIGO" value={code}
                  disabled={isApplied || isVerifying}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full bg-black/60 border rounded-xl py-3 px-4 text-center font-mono text-xs outline-none transition-all uppercase ${
                    isError ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/10 focus:border-blue-500 text-white'
                  }`}
                />
                <button 
                  onClick={handleApplyCode}
                  disabled={isApplied || isVerifying}
                  className={`px-4 rounded-xl transition-all duration-300 min-w-[54px] flex items-center justify-center ${
                    isApplied ? 'bg-emerald-500' : isError ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isVerifying ? (
                      <motion.div key="l" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={18}/></motion.div>
                    ) : isApplied ? (
                      <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={18}/></motion.div>
                    ) : isError ? (
                      <motion.div key="e" initial={{ scale: 0 }} animate={{ scale: 1 }}><X size={18}/></motion.div>
                    ) : (
                      <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Ticket size={18}/></motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>

              <button className="w-full bg-white text-black font-bold py-4 rounded-xl text-[11px] tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                <Calendar size={14} /> {isApplied ? "AGENDAR GRATIS" : "AGENDAR AHORA"}
              </button>
            </div>
            
            <p className={`text-[10px] mt-4 uppercase tracking-[0.2em] font-mono transition-colors duration-300 ${isError ? 'text-red-500' : isApplied ? 'text-emerald-500' : 'text-gray-600'}`}>
              {isError ? "Código Inválido" : isApplied ? "✓ Cupón Aplicado" : "Verificación en tiempo real"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultingDesktop;