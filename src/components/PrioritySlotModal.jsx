import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, ChevronRight, ShieldCheck, Zap, X } from 'lucide-react';

const PrioritySlotModal = ({ isOpen, onClose }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Simulamos slots disponibles (puedes automatizar esto luego)
  const availableSlots = [
    { id: 1, day: 'Hoy', time: '16:00', zone: 'GMT-5' },
    { id: 2, day: 'Mañana', time: '09:30', zone: 'GMT-5' },
    { id: 3, day: 'Mañana', time: '14:00', zone: 'GMT-5' },
  ];

  const handleConfirm = () => {
    if (!selectedSlot) return;
    const msg = `*SOLICITUD DE CONSULTORÍA PRIORITARIA*\n\nHe reservado el slot de las *${selectedSlot.time}* (${selectedSlot.day}).\n\nRequiero análisis técnico para mi proyecto. Por favor, confirmar disponibilidad para iniciar fase de arquitectura.`;
    window.open(`https://wa.me/573123456789?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header con Radar Animation */}
            <div className="relative p-8 text-center border-b border-white/5 bg-gradient-to-b from-blue-600/10 to-transparent">
              <div className="absolute top-4 right-8">
                <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ping" />
                <div className="absolute inset-0 border border-blue-500 rounded-full flex items-center justify-center bg-black">
                  <Clock className="text-blue-500 animate-pulse" size={32} />
                </div>
              </div>

              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                Consultoría <span className="text-blue-600">Prioritaria</span>
              </h2>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] mt-2">
                Scanning available windows...
              </p>
            </div>

            {/* Lista de Slots */}
            <div className="p-8 space-y-4">
              {availableSlots.map((slot) => (
                <motion.div
                  key={slot.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSlot(slot)}
                  className={`relative p-5 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${
                    selectedSlot?.id === slot.id 
                    ? "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
                    : "bg-white/5 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Calendar size={18} className={selectedSlot?.id === slot.id ? "text-blue-400" : "text-gray-600"} />
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase">{slot.day}</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">{slot.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono text-blue-500/50 mb-1">{slot.zone}</p>
                      {selectedSlot?.id === slot.id && (
                        <motion.div layoutId="check" className="bg-blue-500 rounded-full p-1">
                          <ShieldCheck size={14} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer con Botón de Acción */}
            <div className="p-8 pt-0 text-center">
              <button 
                onClick={handleConfirm}
                disabled={!selectedSlot}
                className={`w-full py-4 rounded-xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${
                  selectedSlot 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" 
                  : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                <Zap size={16} className={selectedSlot ? "animate-bounce" : ""} />
                Confirmar Reservación
              </button>
              <p className="text-[9px] text-gray-600 font-mono mt-4 flex items-center justify-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> 
                ENCRIPTACIÓN SSL PUNTO A PUNTO ACTIVA
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PrioritySlotModal;