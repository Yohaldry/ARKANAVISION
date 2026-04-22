import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Target, Rocket, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();

  const steps = [
    { icon: <Target className="text-blue-400" />, title: "Análisis de ADN", desc: "Entenderemos el núcleo de tu negocio para que la web no sea solo estética, sino funcional." },
    { icon: <Zap className="text-yellow-400" />, title: "Arquitectura de Alto Nivel", desc: "Definiremos un stack tecnológico que soporte miles de usuarios sin despeinarse." },
    { icon: <Rocket className="text-emerald-400" />, title: "Escalabilidad Digital", desc: "Diseñaremos el camino para que tu presencia digital eleve el valor de tu marca." }
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Luces de fondo estilo estudio */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full relative z-10"
      >
        {/* Cabecera */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-blue-400 text-xs font-mono mb-6"
          >
            <ShieldCheck size={14} /> FASE DE PRE-CONSULTORÍA ACTIVADA
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Estás a un paso de la <span className="text-blue-500">Transformación.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Para que nuestra sesión de 45 minutos sea letal para tu competencia, necesito que realices este breve análisis. No son preguntas al azar, es la base de tu nueva infraestructura digital.
          </p>
        </div>

        {/* Detalles del proceso */}
        <div className="grid grid-cols-1 gap-4 mb-12">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-start gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-sm"
            >
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                {step.icon}
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">{step.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Botón de Acción Final */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/#formulario-asesoria')} // Aquí puedes redirigir al form o a una página de preguntas
          className="w-full bg-white text-black font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 text-lg hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] group"
        >
          INICIAR ANÁLISIS ESTRATÉGICO <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </motion.button>
        
        <p className="text-center text-gray-600 text-[10px] mt-6 font-mono uppercase tracking-widest">
          Tiempo estimado: 3 minutos • Confidencialidad 100% garantizada
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;