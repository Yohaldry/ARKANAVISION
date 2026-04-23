import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Bot, Code, BarChart, Smartphone, Zap, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';

const FloatingBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: '¡Hola! Bienvenido a ARKA. ⚡ ¿En qué servicio estás interesado hoy?' }
  ]);
  const chatEndRef = useRef(null);

  const WHATSAPP_NUMBER = "573123456789"; // Reemplaza con tu número real

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const services = [
    { label: 'Desarrollo Web Pro', icon: <Code size={14} /> },
    { label: 'Bots de Trading (MQL5)', icon: <BarChart size={14} /> },
    { label: 'Aplicaciones Móviles', icon: <Smartphone size={14} /> },
    { label: 'E-commerce & Dropshipping', icon: <Zap size={14} /> },
    { label: 'Diseño de Marca / Logo', icon: <Zap size={14} /> },
    { label: 'Consultoría Tech', icon: <MessageSquare size={14} /> },
  ];

  const handleServiceSelection = (service) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: service.label }]);
    setShowOptions(false); // Minimizamos las opciones al elegir
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: `¡Excelente! El servicio de ${service.label} es clave para escalar. Te pondré en contacto con nuestro asesor experto ahora mismo.`,
        showWhatsapp: true,
        selectedService: service.label
      }]);
    }, 1200);
  };

  const openWhatsApp = (serviceName) => {
    const text = `Hola, vengo de www.arkanavision.com y quiero más información de este servicio: ${serviceName}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[320px] md:w-[360px] h-[550px] bg-[#050505] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <Bot size={22} className="animate-pulse" />
                <div>
                  <span className="block font-black text-xs uppercase tracking-widest leading-none">ARKA Assistant</span>
                  <span className="text-[9px] font-bold opacity-70">CONCIERGE DIGITAL</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
              {messages.map((m) => (
                <div key={m.id} className="space-y-3">
                  <div className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`max-w-[85%] p-3.5 rounded-2xl text-[11px] md:text-xs leading-relaxed ${
                        m.type === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white/5 text-gray-300 border border-white/10 rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </motion.div>
                  </div>
                  
                  {m.showWhatsapp && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => openWhatsApp(m.selectedService)}
                      className="w-full mt-2 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageSquare size={14} /> Contactar Asesor
                    </motion.button>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl flex gap-1.5">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: d }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Selector de Servicios con Scroll y Toggle */}
            <div className="bg-white/[0.03] border-t border-white/5 transition-all duration-300">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="w-full p-3 flex items-center justify-between text-[9px] text-white/40 uppercase font-black tracking-widest hover:text-white transition-colors"
              >
                <span>{showOptions ? 'Ocultar Servicios' : 'Ver todos los servicios'}</span>
                {showOptions ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>

              <AnimatePresence>
                {showOptions && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '180px', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-y-auto px-5 pb-5 space-y-2 no-scrollbar"
                  >
                    {services.map((service, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        onClick={() => handleServiceSelection(service)}
                        className="w-full p-3 rounded-xl border border-white/10 text-left text-[11px] font-bold text-white flex items-center gap-3 transition-all"
                      >
                        <span className="text-blue-500">{service.icon}</span>
                        {service.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 w-16 h-16 rounded-full shadow-lg text-white flex items-center justify-center border border-white/10"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>
    </div>
  );
};

export default FloatingBot;