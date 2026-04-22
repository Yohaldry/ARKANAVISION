import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sparkles, Ticket, Loader2, Check, X } from 'lucide-react';

const ConsultingMobile = () => {
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
      if (code.toUpperCase() === 'FREE2026') { setIsApplied(true); } 
      else { setIsError(true); setTimeout(() => setIsError(false), 1500); }
    }, 1000);
  };

  return (
    <section className="py-12 px-4 bg-[#030712]">
      <div className="bg-[#0B0F1A] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-8 shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono tracking-widest uppercase mb-4">
            <Sparkles size={12} /> ACCESO VIP
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Asesoría <span className="text-blue-500">Estratégica</span>
          </h2>
          <p className="text-gray-400 text-xs px-4">Planes de escalabilidad y viabilidad para empresas tecnológicas.</p>
        </div>

        <div className="bg-black/30 border border-white/5 p-6 rounded-2xl relative">
          <div className="flex items-center justify-center gap-3 mb-6 h-8">
            <span className={`text-2xl font-bold transition-all ${isApplied ? 'text-gray-600 line-through' : 'text-white'}`}>$20</span>
            {isApplied && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl font-black text-emerald-400">$0</motion.span>}
          </div>

          <motion.div animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}} className="flex gap-2 mb-4">
            <input 
              type="text" placeholder="CÓDIGO" value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isApplied}
              className={`flex-1 bg-black/60 border rounded-xl py-3 px-4 text-center font-mono text-xs text-white outline-none ${isError ? 'border-red-500' : 'border-white/10'}`}
            />
            <button 
              onClick={handleApplyCode} 
              className={`px-4 rounded-xl transition-colors min-w-[50px] flex items-center justify-center ${isApplied ? 'bg-emerald-500' : isError ? 'bg-red-500' : 'bg-blue-600'}`}
            >
              {isVerifying ? <Loader2 size={18} className="animate-spin"/> : isApplied ? <Check size={18}/> : isError ? <X size={18}/> : <Ticket size={18}/>}
            </button>
          </motion.div>

          <button className="w-full bg-white text-black font-bold py-4 rounded-xl text-[11px] flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 transition-transform">
            <Calendar size={14} /> {isApplied ? "Agendar Gratis" : "Continuar"}
          </button>
          
          <p className={`text-[9px] text-center mt-4 font-mono tracking-widest transition-colors ${isError ? 'text-red-500' : 'text-gray-600'}`}>
            {isError ? "CÓDIGO NO VÁLIDO" : isApplied ? "DESCUENTO APLICADO" : "CONEXIÓN SEGURA SSL"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConsultingMobile;