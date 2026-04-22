import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronUp, ChevronDown } from 'lucide-react';

const ProgressWidget = () => {
  const [expanded, setExpanded] = useState(false);

  const projectsInProgress = [
    { name: "E-commerce Lux", progress: 75 },
    { name: "SaaS Dashboard", progress: 40 },
    { name: "App Fitness", progress: 90 }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[100] font-sans">
      <motion.div 
        layout
        className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-64 md:w-72"
      >
        {/* Cabecera del Widget */}
        <div 
          onClick={() => setExpanded(!expanded)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity size={18} className="text-blue-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-300">
              Live Builds
            </span>
          </div>
          {expanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronUp size={14} className="text-gray-500" />}
        </div>

        {/* Lista de Proyectos Expandible */}
        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 space-y-4"
            >
              {projectsInProgress.map((project, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-200 font-medium">{project.name}</span>
                    <span className="text-[10px] font-mono text-blue-400">{project.progress}%</span>
                  </div>
                  
                  {/* Barra de Progreso Estilizada */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-600 to-emerald-400"
                    />
                  </div>
                </div>
              ))}
              <p className="text-[9px] text-gray-500 text-center pt-2 italic">
                Actualizado en tiempo real
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProgressWidget;