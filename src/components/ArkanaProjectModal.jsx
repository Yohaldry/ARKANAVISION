import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Layout, Palette, Camera, Smartphone, 
  MessageSquare, ChevronRight, Sparkles, Target, Zap
} from 'lucide-react';

const ArkanaProjectModal = ({ isOpen, onClose }) => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { 
      id: 'web',
      title: "Arquitectura Web", 
      icon: Layout, 
      color: "blue",
      details: "Sistemas de alto rendimiento con Next.js 15, animaciones de nivel 1 y optimización SEO extrema.",
      tag: "FRONTEND / BACKEND"
    },
    { 
      id: 'brand',
      title: "Identidad Visual", 
      icon: Palette, 
      color: "purple",
      details: "Diseño de logotipos y branding con enfoque en lujo y minimalismo digital.",
      tag: "BRANDING"
    },
    { 
      id: 'photo',
      title: "Visagismo Digital", 
      icon: Camera, 
      color: "emerald",
      details: "Retoque de alta gama y producción audiovisual para marcas que buscan la perfección visual.",
      tag: "MEDIA"
    },
    { 
      id: 'app',
      title: "Soluciones Híbridas", 
      icon: Smartphone, 
      color: "orange",
      details: "Desarrollo de aplicaciones móviles y bots de trading personalizados (MQL5/Python).",
      tag: "MOBILE / TRADING"
    }
  ];

  const handleWhatsApp = (service) => {
    const message = `*INICIO DE PROYECTO - ARKANA VISION*\n\nEstoy listo para subir de nivel. Me interesa el servicio de: *${service.title}*.\n\nQuedo a la espera de un consultor técnico para iniciar la fase de descubrimiento. 🚀`;
    window.open(`https://wa.me/573123456789?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Fondo desenfocado */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Contenedor del Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-500/10"
          >
            <div className="grid md:grid-cols-5 h-full min-h-[500px]">
              
              {/* Lateral Izquierdo: Selección */}
              <div className="md:col-span-2 p-6 md:p-10 border-r border-white/5 bg-[#0d0d0d]">
                <div className="flex items-center gap-2 mb-8">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Target size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Project Launcher</h2>
                </div>

                <div className="space-y-3">
                  {services.map((service) => (
                    <motion.div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      whileHover={{ x: 5 }}
                      className={`group p-4 rounded-2xl cursor-pointer transition-all border ${
                        selectedService?.id === service.id 
                        ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/20" 
                        : "bg-white/5 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <service.icon size={18} className={selectedService?.id === service.id ? "text-white" : "text-blue-500"} />
                          <span className={`text-sm font-bold uppercase italic tracking-wider ${selectedService?.id === service.id ? "text-white" : "text-white/70"}`}>
                            {service.title}
                          </span>
                        </div>
                        <ChevronRight size={14} className={selectedService?.id === service.id ? "text-white" : "text-white/20"} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button 
                  onClick={onClose}
                  className="mt-10 text-[10px] font-mono text-white/30 hover:text-white transition-colors uppercase tracking-[0.3em] flex items-center gap-2"
                >
                  <X size={12} /> Abortar Misión
                </button>
              </div>

              {/* Panel Derecho: Detalles y Acción */}
              <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {selectedService ? (
                    <motion.div
                      key={selectedService.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="relative z-10"
                    >
                      <span className="text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-4 block">
                        Fase de Ejecución: {selectedService.tag}
                      </span>
                      <h3 className="text-4xl md:text-6xl font-black italic uppercase leading-none text-white mb-6">
                        {selectedService.title.split(' ')[0]} <br />
                        <span className="text-blue-600">{selectedService.title.split(' ')[1]}</span>
                      </h3>
                      <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
                        {selectedService.details}
                      </p>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWhatsApp(selectedService)}
                        className="group bg-white text-black px-8 py-4 rounded-full font-black uppercase italic text-sm flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5"
                      >
                        <MessageSquare size={18} /> Confirmar en WhatsApp
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <Sparkles size={40} className="text-blue-500/20 mx-auto mb-4" />
                      <p className="text-white/20 font-mono text-xs uppercase tracking-widest">Selecciona un servicio para visualizar el despliegue</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Decoración de fondo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ArkanaProjectModal;