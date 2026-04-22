import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Send, Palette, MapPin, Briefcase, Info, Lightbulb } from 'lucide-react';

const ConsultingForm = () => {
  const [formData, setFormData] = useState({
    projectName: '',
    services: '',
    cities: '',
    colors: '',
    summary: '',
    ideas: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Configura tu número de WhatsApp aquí (sin el signo +)
    const phone = "573000000000"; 
    
    // Creamos el mensaje pre-llenado
    const message = `*Nueva Solicitud de Asesoría*%0A` +
      `*Proyecto:* ${formData.projectName}%0A` +
      `*Servicios:* ${formData.services}%0A` +
      `*Ciudades:* ${formData.cities}%0A` +
      `*Colores:* ${formData.colors}%0A` +
      `*Resumen:* ${formData.summary}%0A` +
      `*Ideas:* ${formData.ideas}`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <section id="formulario-asesoria"  className="py-24 px-6 bg-[#050505] scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-blue-500 font-mono text-sm uppercase tracking-widest mb-2">Fase de Análisis</h2>
          <h3 className="text-4xl md:text-5xl font-bold">Cuéntame sobre tu <span className="text-gray-500">Visión.</span></h3>
          <p className="text-gray-400 mt-4">Estos datos me permiten estudiar tu caso antes de nuestra reunión.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Nombre del Proyecto */}
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl">
            <label className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-3 uppercase">
              <Briefcase size={14} className="text-blue-500" /> Nombre del Proyecto
            </label>
            <input 
              required
              name="projectName"
              onChange={handleChange}
              type="text" 
              placeholder="Ej: Innova SaaS"
              className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-blue-500 text-white transition-all"
            />
          </div>

          {/* Ciudades */}
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl">
            <label className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-3 uppercase">
              <MapPin size={14} className="text-emerald-500" /> Ciudades / Alcance
            </label>
            <input 
              name="cities"
              onChange={handleChange}
              type="text" 
              placeholder="Ej: Bogotá, Global"
              className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 text-white transition-all"
            />
          </div>

          {/* Servicios */}
          <div className="md:col-span-2 bg-white/[0.02] border border-white/10 p-6 rounded-2xl">
            <label className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-3 uppercase">
              <Info size={14} className="text-purple-500" /> Servicios que ofrecen
            </label>
            <input 
              name="services"
              onChange={handleChange}
              type="text" 
              placeholder="¿Qué vendes o qué servicio prestas?"
              className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-purple-500 text-white transition-all"
            />
          </div>

          {/* Resumen */}
          <div className="md:col-span-2 bg-white/[0.02] border border-white/10 p-6 rounded-2xl">
            <label className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-3 uppercase">
              <Lightbulb size={14} className="text-yellow-500" /> Resumen del Negocio e Ideas
            </label>
            <textarea 
              name="summary"
              onChange={handleChange}
              rows="3"
              placeholder="Cuéntame brevemente tu idea..."
              className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-yellow-500 text-white transition-all resize-none"
            />
          </div>

          {/* Colores */}
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl">
            <label className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-3 uppercase">
              <Palette size={14} className="text-pink-500" /> Colores (Opcional)
            </label>
            <input 
              name="colors"
              onChange={handleChange}
              type="text" 
              placeholder="Ej: Azul y Negro"
              className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-pink-500 text-white transition-all"
            />
          </div>

          {/* Botón Envío */}
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all mt-4"
          >
            Enviar y Agendar en WhatsApp <Send size={18} />
          </motion.button>
        </form>
      </div>
    </section>
  );
};

export default ConsultingForm;