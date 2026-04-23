import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Layout, Target, Component, 
  Layers, Smartphone, RefreshCcw, Sparkles, X, MessageSquare, Bot, Camera 
} from 'lucide-react';

const Desarrollo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForWhatsApp, setSelectedForWhatsApp] = useState(null);

  const WHATSAPP_NUMBER = "573123456789"; // Tu número real

  // 1. LISTA COMPLETA PARA EL MENÚ INTERACTIVO (7 CONCEPTOS)
  const concepts = [
    { title: "Identidad Visual", desc: "Creación de la imagen gráfica de la marca, incluyendo logotipo, paleta de colores y tipografías para lograr una identidad coherente y profesional.", icon: Palette, detail: "BRANDING" },
    { title: "Interfaz Web (UI)", desc: "Diseño visual de páginas web, cuidando la estructura, los elementos gráficos y la estética para ofrecer una experiencia atractiva y moderna.", icon: Layout, detail: "USER INTERFACE" },
    { title: "Landing Pages", desc: "Creación de diseños visuales enfocados en páginas de promoción, ventas o captación de clientes de alto impacto.", icon: Target, detail: "MARKETING" },
    { title: "Recursos Web", desc: "Diseño de banners, iconos, botones y otros recursos visuales necesarios para mejorar la apariencia del sitio.", icon: Component, detail: "ASSETS" },
    { title: "Mockups Web", desc: "Desarrollo de prototipos visuales que permiten visualizar cómo se verá el sitio antes de su desarrollo final.", icon: Layers, detail: "PREVIEW" },
    { title: "Diseño Responsive", desc: "Adaptación del diseño visual para que el sitio se vea correctamente en computadoras, tablets y dispositivos móviles.", icon: Smartphone, detail: "MOBILE" },
    { title: "Rediseño Visual", desc: "Actualización de la apariencia gráfica de páginas existentes para lograr un estilo más moderno y atractivo.", icon: RefreshCcw, detail: "EVOLUTION" }
  ];

  // 2. SERVICIOS COMERCIALES PARA EL MODAL (4 SERVICIOS)
  const comercialServices = [
    { title: "Pagina Web", desc: "Prototipos funcionales y desarrollo de sistemas a medida.", icon: Layout, detail: "DEV" },
    { title: "Creacion de Logos", desc: "Branding y renovación de identidad corporativa.", icon: Palette, detail: "BRAND" },
    { title: "Fotografia Profesional", desc: "Sesiones de alta gama para productos y marcas.", icon: Camera, detail: "PHOTO" },
    { title: "Aplicaciones moviles", desc: "Apps nativas e híbridas para iOS y Android.", icon: Smartphone, detail: "APPS" }
  ];

  const sendToWhatsApp = (service) => {
    const message = `*SOLICITUD DE PROYECTO - ARKA* ⚡\n\nHola, vengo de la sección de Desarrollo en *www.arkanavision.com* 🌐\n\nMe interesa iniciar un proyecto de:\n📌 *${service.title}*\n\nSolicito un asesor para coordinar los detalles. 🚀`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div id="desarrollo" className="bg-[#050914] text-white flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden min-h-screen">
      
      {/* Luces de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full animate-pulse"></div>

      <div className="max-w-7xl w-full grid grid-cols-12 gap-4 md:gap-12 items-center relative z-10">
        
        {/* LADO IZQUIERDO: Menú (RESTAURADO A 7 CONCEPTOS) */}
        <div className="col-span-5 lg:col-span-4 space-y-4 border-r border-white/10 pr-3 md:pr-0">
          <div className="flex items-center gap-2 text-blue-500 mb-6 md:mb-10">
            <Sparkles size={16} className="animate-spin-slow" />
            <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.25em]">EXPERTOS</span>
          </div>

          <div className="space-y-2">
            {concepts.map((service, idx) => (
              <motion.div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`group cursor-pointer p-2 md:p-5 rounded-lg md:rounded-2xl transition-all duration-300 flex items-center justify-between ${
                  activeIndex === idx ? "bg-blue-500/10 border-l-[3px] border-blue-500 pl-4 md:pl-10" : "opacity-40 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                  <span className={`text-[10px] md:text-sm font-black ${activeIndex === idx ? "text-blue-500" : "text-white/20"}`}>{String(idx + 1).padStart(2, '0')}</span>
                  <h3 className={`text-[11px] md:text-xl font-bold italic uppercase truncate tracking-tight ${activeIndex === idx ? "text-white" : "text-white/60"}`}>{service.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: Visualizador */}
        <div className="col-span-7 lg:col-span-8 relative flex items-center justify-center min-h-[300px] md:min-h-[550px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="relative w-full bg-gradient-to-br from-blue-600/10 via-[#0a1122] to-transparent border border-white/10 rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 backdrop-blur-2xl flex flex-col justify-center items-center text-center shadow-2xl"
            >
              <div className="w-12 h-12 md:w-24 md:h-24 bg-blue-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-10 text-white shadow-2xl shadow-blue-500/20">
                {React.createElement(concepts[activeIndex].icon, { size: 40 })}
              </div>
              <div className="space-y-3 md:space-y-6">
                <span className="text-blue-400 text-[8px] md:text-xs font-black tracking-[0.3em] uppercase">{concepts[activeIndex].detail}</span>
                <h2 className="text-xl md:text-6xl font-black italic uppercase leading-tight">{concepts[activeIndex].title}</h2>
                <p className="text-white/50 text-[10px] md:text-xl italic max-w-2xl mx-auto line-clamp-5 md:line-clamp-none">"{concepts[activeIndex].desc}"</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Botón Principal */}
      <div className="mt-12 md:mt-20 relative z-10">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 md:px-12 md:py-4 bg-white text-black font-black italic uppercase text-xs md:text-lg hover:bg-blue-600 hover:text-white transition-all rounded-full"
        >
          Empezar Proyecto
        </motion.button>
      </div>

      {/* MODAL CON LOS 4 SERVICIOS CLAVE */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative w-full max-w-2xl bg-[#0a1122] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-3xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg text-white"><Bot size={20} /></div>
                  <h4 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-white">Selecciona tu Servicio</h4>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {comercialServices.map((service, i) => (
                  <motion.div
                    key={i}
                    onClick={() => setSelectedForWhatsApp(service)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer h-[120px] flex flex-col justify-between ${
                      selectedForWhatsApp?.title === service.title ? "border-blue-500 bg-blue-500/10 scale-105" : "border-white/5 bg-white/5"
                    }`}
                  >
                    <div className="flex justify-between text-blue-500">
                      {React.createElement(service.icon, { size: 20 })}
                      <span className="text-[8px] font-bold opacity-30 tracking-widest">{service.detail}</span>
                    </div>
                    <h5 className="font-black italic uppercase text-xs md:text-sm text-white mt-2">{service.title}</h5>
                  </motion.div>
                ))}
              </div>

              {selectedForWhatsApp && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pt-6 border-t border-white/10">
                  <button onClick={() => sendToWhatsApp(selectedForWhatsApp)} className="w-full py-4 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all">
                    <MessageSquare size={18} /> Confirmar con Asesor
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{` .animate-spin-slow { animation: spin-slow 25s linear infinite; } @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } `}</style>
    </div>
  );
};

export default Desarrollo;