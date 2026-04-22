import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Layout, Target, Component, 
  Layers, Smartphone, RefreshCcw, Sparkles, ArrowRight 
} from 'lucide-react';

const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const services = [
    { title: "Identidad Visual", desc: "Creación de la imagen gráfica de la marca, incluyendo logotipo, paleta de colores y tipografías para lograr una identidad coherente y profesional.", icon: Palette, detail: "BRANDING" },
    { title: "Diseño de Interfaz Web (UI)", desc: "Diseño visual de páginas web, cuidando la estructura, los elementos gráficos y la estética para ofrecer una experiencia atractiva y moderna.", icon: Layout, detail: "USER INTERFACE" },
    { title: "Diseño de Landing Pages", desc: "Creación de diseños visuales enfocados en páginas de promoción, ventas o captación de clientes.", icon: Target, detail: "MARKETING" },
    { title: "Elementos Gráficos para Web", desc: "Diseño de banners, iconos, botones y otros recursos visuales necesarios para mejorar la apariencia del sitio.", icon: Component, detail: "ASSETS" },
    { title: "Prototipos y Mockups Web", desc: "Desarrollo de prototipos visuales que permiten visualizar cómo se verá el sitio antes de su desarrollo.", icon: Layers, detail: "PREVIEW" },
    { title: "Diseño Responsive", desc: "Adaptación del diseño visual para que el sitio se vea correctamente en computadoras, tablets y dispositivos móviles.", icon: Smartphone, detail: "MOBILE" },
    { title: "Rediseño Visual de Sitios Web", desc: "Actualización de la apariencia gráfica de páginas existentes para lograr un estilo más moderno y atractivo.", icon: RefreshCcw, detail: "EVOLUTION" }
  ];

  return (
    <div className=" bg-[#050914] text-white  flex-col items-center mt-[20] justify-center p-10 md:p-12  relative overflow-hidden">
      {/* Luces de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>

      <div className="max-w-7xl w-full grid grid-cols-12 gap-2 md:gap-12 items-center relative z-10">
        {/* LADO IZQUIERDO: Menú (Ocupa 5 columnas en móvil, 4 en PC) */}
        <div className="col-span-5 lg:col-span-4 space-y-2 md:space-y-4 border-r border-white/5 pr-2 md:pr-0">
          <div className="flex items-center gap-2 text-blue-500 mb-4 md:mb-8">
            <Sparkles size={14} className="animate-spin-slow" />
            <span className="text-[7px] md:text-[20px] font-black uppercase tracking-[0.2em]">
              SERVICIOS ARKA{" "}
            </span>
          </div>

          <div className="space-y-1 md:space-y-2">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`group cursor-pointer p-2 md:p-4 rounded-lg md:rounded-2xl transition-all duration-300 flex items-center justify-between ${
                  activeIndex === idx
                    ? "bg-blue-500/10 border-l-2 md:border-l-4 border-blue-500 pl-3 md:pl-8"
                    : "opacity-30 hover:opacity-100 pl-1 md:hover:pl-6"
                }`}
              >
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                  <span
                    className={`text-[8px] md:text-xs font-black ${activeIndex === idx ? "text-blue-500" : "text-white/20"}`}
                  >
                    {idx + 1}
                  </span>
                  <h3
                    className={`text-[8px] md:text-1xl font-black italic uppercase truncate tracking-tighter ${
                      activeIndex === idx ? "text-white" : "text-white/50"
                    }`}
                  >
                    {service.title}
                  </h3>
                </div>
                <service.icon
                  size={20}
                  className={`hidden md:block ${activeIndex === idx ? "text-blue-500" : "text-white/10"}`}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: Visualizador (Ocupa 7 columnas en móvil, 8 en PC) */}
        <div className="col-span-7 lg:col-span-8 relative flex items-center justify-center min-h-[350px] md:min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full aspect-square md:aspect-auto md:h-full bg-gradient-to-br from-blue-600/15 to-transparent border border-white/10 rounded-[1.5rem] md:rounded-[3rem] p-4 md:p-12 backdrop-blur-xl flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6 md:space-y-2">
                <div className="w-10 h-10  md:w-20 md:h-20 bg-blue-600 rounded-xl md:rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  {React.createElement(services[activeIndex].icon, {
                    
                    className: "w-5 h-5 md:w-10 md:h-10 text-white",
                  })}
                </div>

                <div className="flex flex-col items-center text-center">
                  {" "}
                 
                  <span className="text-blue-500 text-[6px] md:text-[10px] font-black tracking-[0.2em] uppercase">
                    {services[activeIndex].detail}
                  </span>
                  <h2 className="text-sm md:text-5xl  font-black italic uppercase leading-none mt-1">
                    {services[activeIndex].title}
                  </h2>
                </div>

                <p className="text-white/60 text-[9px] md:text-lg leading-relaxed italic  line-clamp-4 md:line-clamp-none">
                  "{services[activeIndex].desc}"
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Anillos orbitales (Más pequeños para móvil) */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 scale-75 md:scale-100">
            <div className="w-full h-full border border-white/5 rounded-full animate-spin-slow"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Services;