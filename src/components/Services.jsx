import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Palette, Camera, Smartphone, ArrowRight, X, MessageSquare, Bot } from 'lucide-react';

const services = [
  {
    id: "01",
    title: "Pagina Web",
    desc: "Prototipos funcionales desde lo básico a lo avanzado y mejoras en páginas ya existentes.",
    icon: <Layout size={18} />,
    color: "from-blue-500/20",
    textGlow: "group-hover:text-blue-500/40"
  },
  {
    id: "02",
    title: "Creacion de Logos",
    desc: "Diseño de marcas nuevas o renovación de identidades ya establecidas con estándares modernos.",
    icon: <Palette size={18} />,
    color: "from-purple-500/20",
    textGlow: "group-hover:text-purple-500/40"
  },
  {
    id: "03",
    title: "Fotografia Profesional",
    desc: "Fotografía profesional corporativa y de producto. Servicio disponible únicamente en Bogotá.",
    icon: <Camera size={18} />,
    color: "from-cyan-500/20",
    textGlow: "group-hover:text-cyan-500/40"
  },
  {
    id: "04",
    title: "Aplicaciones moviles",
    desc: "Aplicaciones móviles nativas con enfoque en alto rendimiento, escalabilidad y UX.",
    icon: <Smartphone size={18} />,
    color: "from-indigo-500/20",
    textGlow: "group-hover:text-indigo-500/40"
  }
];

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const WHATSAPP_NUMBER = "573332548430"; // Cambia esto por tu número real

  const handleConsultar = (service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  const sendToWhatsApp = () => {
    const text = `Hola, vengo de www.arkanavision.com y quiero información sobre el servicio de ${selectedService.title}: ${selectedService.desc}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="services" className="relative py-16 md:py-32 bg-[#020202] overflow-hidden">
      
      {/* Animación de luces de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header Seccion */}
        <div className="mb-12 md:mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[1px] w-10 bg-blue-600"></div>
            <span className="text-blue-500 font-black text-[9px] md:text-[11px] uppercase tracking-[0.5em]">Expertise</span>
          </div>
          <h2 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase">
            Nuestros <br />
            <span className="text-white/20 italic">Servicios.</span>
          </h2>
        </div>

        {/* Grid de 2 Columnas */}
        <div className="grid grid-cols-2 gap-3 md:gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleConsultar(service)}
              className="group relative cursor-pointer overflow-hidden bg-white/[0.02] border border-white/5 p-5 md:p-12 rounded-[1.5rem] md:rounded-[3rem] backdrop-blur-xl flex flex-col justify-between min-h-[220px] md:min-h-[400px] transition-all duration-500 hover:border-blue-500/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

              <div className="relative z-10">
                <div className="mb-4 md:mb-8 w-10 h-10 md:w-16 md:h-16 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500">
                  {service.icon}
                </div>
                
                <h3 className="text-sm md:text-3xl font-black text-white uppercase italic mb-2 md:mb-4 tracking-tight">
                  {service.title}
                </h3>
                
                <p className="text-white/40 text-[10px] md:text-base leading-snug md:leading-relaxed font-medium max-w-[450px]">
                  {service.desc}
                </p>
              </div>

              <div className="relative z-10 mt-6 flex items-center gap-2 text-[8px] md:text-xs font-black uppercase tracking-widest text-blue-500 group-hover:text-white transition-colors">
                Consultar <ArrowRight size={12} className="md:w-5 md:h-5" />
              </div>

              <span className={`absolute -bottom-4 -right-2 md:-bottom-8 md:-right-4 text-7xl md:text-[12rem] font-black italic select-none pointer-events-none transition-all duration-700 opacity-[0.03] group-hover:opacity-[0.08] ${service.textGlow}`}>
                {service.id}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MODAL DE CONSULTA */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Contenido del Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-blue-600/20 p-3 rounded-2xl">
                    <Bot className="text-blue-500" size={32} />
                  </div>
                  <button onClick={closeModal} className="text-white/40 hover:text-white p-2">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="text-2xl font-black text-white italic uppercase tracking-tight">
                    ARKA Assistant
                  </h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    "¡Excelente elección! He recibido tu interés por <span className="text-blue-500 font-bold">{selectedService.title}</span>. Te pondré en contacto con nuestro asesor experto para continuar con tu proyecto."
                  </p>
                </div>

                <button 
                  onClick={sendToWhatsApp}
                  className="w-full py-4 bg-green-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] active:scale-95"
                >
                  <MessageSquare size={18} />
                  Continuar por WhatsApp
                </button>
              </div>
              
              {/* Decoración del modal */}
              <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;