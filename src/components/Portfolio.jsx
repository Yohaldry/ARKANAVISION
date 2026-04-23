import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Eye, Rocket, ArrowUpRight, Sparkles, 
  Layout, Palette, Camera, Smartphone, X, Bot, MessageSquare 
} from 'lucide-react';

const technologies = [
  { name: "React", icon: "⚛️" }, { name: "Next.js", icon: "▲" },
  { name: "Tailwind", icon: "🌊" }, { name: "MQL5", icon: "📈" },
  { name: "Node.js", icon: "🟢" }, { name: "Shopify", icon: "🛍️" },
  { name: "Python", icon: "🐍" }, { name: "Firebase", icon: "🔥" }
];

const Portfolio = () => {
  const [hoveredTech, setHoveredTech] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForWhatsApp, setSelectedForWhatsApp] = useState(null);

  const WHATSAPP_NUMBER = "573123456789"; // Tu número real

  // Servicios comerciales para el modal
  const comercialServices = [
    { title: "Pagina Web", desc: "Prototipos funcionales y desarrollo de sistemas a medida.", icon: Layout, detail: "DEV" },
    { title: "Creacion de Logos", desc: "Branding y renovación de identidad corporativa.", icon: Palette, detail: "BRAND" },
    { title: "Fotografia Profesional", desc: "Sesiones de alta gama para productos y marcas.", icon: Camera, detail: "PHOTO" },
    { title: "Aplicaciones moviles", desc: "Apps nativas e híbridas para iOS y Android.", icon: Smartphone, detail: "APPS" }
  ];

  const sendToWhatsApp = (service) => {
    const message = `*SOLICITUD DE PROYECTO - ARKA* ⚡\n\nHola, vengo de la sección de Portfolio en *www.arkanavision.com* 🌐\n\nMe interesa iniciar un proyecto de:\n📌 *${service.title}*\n\nSolicito un asesor para coordinar los detalles. 🚀`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div id="proyectos" className="min-h-screen bg-[#030303] text-white py-12 md:py-24 px-4 md:px-10 font-sans overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-10 md:mb-20 border-l-[3px] md:border-l-8 border-blue-600 pl-4 md:pl-8">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter leading-none"
          >
            OUR <span className="text-blue-500">CORE</span>
          </motion.h2>
          <p className="text-white/40 tracking-[0.15em] md:tracking-[0.4em] text-[9px] md:text-xs uppercase mt-2">
            Engineering the future of digital assets
          </p>
        </div>

        {/* --- BENTO GRID PRINCIPAL --- */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-6 auto-rows-[minmax(120px,_auto)] md:auto-rows-[220px]">
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-2 md:col-span-8 md:row-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-[2.5rem] p-5 md:p-12 relative overflow-hidden group min-h-[180px] md:min-h-0"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <Target className="text-blue-500 group-hover:rotate-12 transition-transform" size={28} />
              <div>
                <h3 className="text-xs md:text-2xl font-black italic uppercase mb-1 md:mb-4 text-blue-500">Objetivo</h3>
                <p className="text-[11px] md:text-xl text-white/60 max-w-xl leading-snug md:leading-relaxed">
                  Fusionar el <span className="text-white font-bold">trading de alta precisión</span> con desarrollo web de vanguardia, dominando el mercado digital.
                </p>
              </div>
            </div>
            <div className="absolute top-[-5%] right-[-5%] text-[6rem] md:text-[18rem] font-black italic text-white/[0.01] select-none pointer-events-none">
              GOAL
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-1 md:col-span-4 md:row-span-1 bg-blue-600 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 relative overflow-hidden flex flex-col justify-center"
          >
            <Rocket className="text-white mb-2 md:mb-4" size={24} />
            <h3 className="text-xs md:text-3xl font-black italic uppercase mb-1 leading-none">Misión</h3>
            <p className="text-[10px] md:text-base text-blue-100 leading-tight">Digitalizar marcas de lujo con estética impecable.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-1 md:col-span-4 md:row-span-1 bg-[#111] border border-white/10 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 relative overflow-hidden flex flex-col justify-center"
          >
            <Eye className="text-blue-500 mb-2 md:mb-4" size={24} />
            <h3 className="text-xs md:text-3xl font-black italic uppercase mb-1 leading-none">Visión</h3>
            <p className="text-[10px] md:text-base text-white/50 leading-tight">Referente #1 en soluciones híbridas FinTech.</p>
          </motion.div>

          {/* --- STACK TECNOLÓGICO --- */}
          <div className="col-span-2 md:col-span-12 bg-[#0a0a0a] border border-white/5 rounded-xl md:rounded-[2rem] overflow-hidden flex items-center relative h-[50px] md:h-[80px]">
            <div className="flex whitespace-nowrap animate-infinite-scroll">
              {[...technologies, ...technologies].map((tech, i) => (
                <div key={i} className="mx-5 md:mx-12 flex items-center gap-2 md:gap-4 text-xs md:text-3xl font-black italic uppercase text-white/20 hover:text-blue-500 transition-colors">
                  <span className="text-sm md:text-4xl">{tech.icon}</span>
                  {tech.name}
                </div>
              ))}
            </div>
          </div>

          {/* --- PROYECTO LORDS --- */}
          <motion.div 
            className="col-span-2 md:col-span-6 md:row-span-2 relative rounded-2xl md:rounded-[2.5rem] overflow-hidden group border border-white/5 min-h-[220px] md:min-h-0 cursor-pointer"
            onClick={() => setHoveredTech(hoveredTech === 1 ? null : 1)}
          >
            <img 
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800" 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 transition-all duration-700 group-hover:scale-110"
              alt="Barber Project"
            />
            <AnimatePresence>
              {hoveredTech === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="h-full aspect-[9/16] bg-black rounded-lg overflow-hidden border border-blue-500/30">
                    <video autoPlay muted loop playsInline src="https://assets.mixkit.co/videos/preview/mixkit-man-getting-a-haircut-in-a-barbershop-41527-large.mp4" className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-30 pointer-events-none">
              <h4 className="text-2xl md:text-5xl font-black italic uppercase leading-[0.9]">Lords <br /> <span className="text-blue-500 text-lg md:text-4xl">Barber</span></h4>
            </div>
          </motion.div>

          {/* --- ESTADÍSTICAS Y CTA --- */}
          <div className="col-span-2 md:col-span-6 md:row-span-2 grid grid-cols-2 gap-3 md:gap-6">
            <div className="bg-[#111] rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex flex-col justify-center border border-white/5">
              <span className="text-3xl md:text-7xl font-black text-blue-500 italic leading-none">21+</span>
              <p className="text-[9px] md:text-sm uppercase font-bold tracking-tighter text-white/40 mt-1">Proyectos en Bogotá</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-2xl md:rounded-[2rem] p-5 flex items-center justify-center border border-dashed border-white/10">
              <Sparkles size={28} className="text-white/10" />
            </div>

            {/* BOTÓN FINAL CON MODAL INTEGRADO */}
            <motion.div 
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 flex items-center justify-between group cursor-pointer shadow-xl shadow-blue-500/20"
            >
              <div className="flex flex-col">
                <span className="text-[8px] md:text-xs font-bold text-blue-200 uppercase tracking-[0.2em] mb-1">PROYECTO ARKA</span>
                <span className="text-sm md:text-4xl font-black italic uppercase leading-none">¿Subimos de nivel?</span>
              </div>
              <div className="w-10 h-10 md:w-20 md:h-20 bg-white rounded-full flex-shrink-0 flex items-center justify-center text-black group-hover:rotate-45 transition-transform duration-500">
                <ArrowUpRight size={24} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE SERVICIOS (IDÉNTICO AL DE DESARROLLO) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 50 }} 
              className="relative w-full max-w-2xl bg-[#0a1122] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-3xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg text-white"><Bot size={20} /></div>
                  <h4 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-white">Inicia tu Transformación</h4>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
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
                  <button 
                    onClick={() => sendToWhatsApp(selectedForWhatsApp)} 
                    className="w-full py-4 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all hover:bg-blue-700"
                  >
                    <MessageSquare size={18} /> Confirmar con Asesor
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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