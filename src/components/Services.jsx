import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Layout, Target, Component, 
  Layers, Smartphone, RefreshCcw, Sparkles 
} from 'lucide-react';

const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const services = [
    { title: "Identidad Visual", desc: "Creación de la imagen gráfica de la marca, incluyendo logotipo, paleta de colores y tipografías para lograr una identidad coherente y profesional.", icon: Palette, detail: "BRANDING" },
    { title: "Interfaz Web (UI)", desc: "Diseño visual de páginas web, cuidando la estructura, los elementos gráficos y la estética para ofrecer una experiencia atractiva y moderna.", icon: Layout, detail: "USER INTERFACE" },
    { title: "Landing Pages", desc: "Creación de diseños visuales enfocados en páginas de promoción, ventas o captación de clientes de alto impacto.", icon: Target, detail: "MARKETING" },
    { title: "Recursos Web", desc: "Diseño de banners, iconos, botones y otros recursos visuales necesarios para mejorar la apariencia del sitio.", icon: Component, detail: "ASSETS" },
    { title: "Mockups Web", desc: "Desarrollo de prototipos visuales que permiten visualizar cómo se verá el sitio antes de su desarrollo final.", icon: Layers, detail: "PREVIEW" },
    { title: "Diseño Responsive", desc: "Adaptación del diseño visual para que el sitio se vea correctamente en computadoras, tablets y dispositivos móviles.", icon: Smartphone, detail: "MOBILE" },
    { title: "Rediseño Visual", desc: "Actualización de la apariencia gráfica de páginas existentes para lograr un estilo más moderno y atractivo.", icon: RefreshCcw, detail: "EVOLUTION" }
  ];

  return (
    <div className="bg-[#050914] text-white flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden min-h-screen">
      {/* Luces de fondo optimizadas */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full animate-pulse"></div>

      <div className="max-w-7xl w-full grid grid-cols-12 gap-4 md:gap-12 items-center relative z-10">
        
        {/* LADO IZQUIERDO: Menú */}
        <div className="col-span-5 lg:col-span-4 space-y-4 border-r border-white/10 pr-3 md:pr-0">
          <div className="flex items-center gap-2 text-blue-500 mb-6 md:mb-10">
            <Sparkles size={16} className="animate-spin-slow" />
            <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.25em]">
              SERVICIOS
            </span>
          </div>

          <div className="space-y-2">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`group cursor-pointer p-2 md:p-5 rounded-lg md:rounded-2xl transition-all duration-300 flex items-center justify-between ${
                  activeIndex === idx
                    ? "bg-blue-500/10 border-l-[3px] border-blue-500 pl-4 md:pl-10"
                    : "opacity-40 hover:opacity-100 pl-2 md:hover:pl-8"
                }`}
              >
                <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                  <span className={`text-[10px] md:text-sm font-black ${activeIndex === idx ? "text-blue-500" : "text-white/20"}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className={`text-[11px] md:text-xl font-bold italic uppercase truncate tracking-tight ${
                      activeIndex === idx ? "text-white" : "text-white/60"
                    }`}
                  >
                    {service.title}
                  </h3>
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
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full bg-gradient-to-br from-blue-600/10 via-[#0a1122] to-transparent border border-white/10 rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 backdrop-blur-2xl flex flex-col justify-center items-center text-center shadow-2xl"
            >
              {/* Icono Flotante */}
              <div className="w-12 h-12 md:w-24 md:h-24 bg-blue-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-6 md:mb-10">
                {React.createElement(services[activeIndex].icon, {
                  className: "w-6 h-6 md:w-12 md:h-12 text-white",
                })}
              </div>

              <div className="space-y-3 md:space-y-6">
                <span className="text-blue-400 text-[8px] md:text-xs font-black tracking-[0.3em] uppercase">
                  {services[activeIndex].detail}
                </span>
                <h2 className="text-xl md:text-6xl font-black italic uppercase leading-tight">
                  {services[activeIndex].title}
                </h2>
                <p className="text-white/50 text-[10px] md:text-xl leading-relaxed italic max-w-2xl mx-auto line-clamp-5 md:line-clamp-none">
                  "{services[activeIndex].desc}"
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Anillo de fondo */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-30 md:opacity-100">
            <div className="w-[120%] h-[120%] border border-white/5 rounded-full animate-spin-slow"></div>
          </div>
        </div>
      </div>

      {/* Botón Centrado */}
      <div className="mt-12 md:mt-20 relative z-10">
         <button className="px-8 py-3 md:px-12 md:py-4 bg-white text-black font-black italic uppercase text-xs md:text-lg hover:bg-blue-500 hover:text-white transition-all duration-300 rounded-full">
            Empezar Proyecto
         </button>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Services;