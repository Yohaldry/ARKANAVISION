import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, MessageSquare } from 'lucide-react';

const ChatContact = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: '¡Hola! Soy tu asistente de DEVSTUDIO. ¿En qué proyecto tienes en mente hoy?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Mensaje del Usuario
    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Respuesta Simulada del Bot
    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: '¡Excelente elección! Me encantaría ayudarte con eso. Déjanos tu correo y nos pondremos en contacto de inmediato para una consultoría técnica.' 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <section className="py-24 px-6 bg-[#080808]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Hablemos de <span className="text-blue-500 font-mono italic">Código.</span></h2>
          <p className="text-gray-500">Nuestro asistente inteligente está listo para cotizar tu proyecto.</p>
        </div>

        {/* Ventana de Chat Estilo Apple/Sleek */}
        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[500px]">
          
          {/* Header del Chat */}
          <div className="bg-white/5 p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-mono text-sm text-gray-300 font-bold uppercase tracking-widest">Soporte Técnico Live</span>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${
                    m.type === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/10'
                  }`}>
                    {m.type === 'bot' && <Bot size={18} className="shrink-0 text-blue-400" />}
                    <p className="text-sm leading-relaxed">{m.text}</p>
                    {m.type === 'user' && <User size={18} className="shrink-0 opacity-50" />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input de Texto */}
          <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
            <button className="bg-blue-600 p-3 rounded-full hover:bg-blue-500 transition-all">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChatContact;