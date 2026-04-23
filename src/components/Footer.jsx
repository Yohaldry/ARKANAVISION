import React from 'react';
import { 
  Instagram, 
  Youtube, 
  Facebook, 
  Code2, 
  ArrowUpRight, 
  Globe, 
  Zap 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Configuración de redes sociales con el SVG de TikTok inyectado manualmente
  const socialLinks = [
    { 
      Icon: Instagram, 
      href: "https://www.instagram.com/arkanavision?igsh=N3o4OTRuZ2RubW1j&utm_source=qr", 
      label: "Instagram",
      color: "hover:text-pink-500" 
    },
    { 
      Icon: ({size, className}) => (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={className}
        >
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      ), 
      href: "https://www.tiktok.com/@arkanavision?_r=1&_t=ZS-95myabE3fgS", 
      label: "TikTok",
      color: "hover:text-cyan-400"
    },
    { 
      Icon: Facebook, 
      href: "https://www.facebook.com/share/1CqwCd6GJm/?mibextid=wwXIfr", 
      label: "Facebook",
      color: "hover:text-blue-600" 
    },
  ];

  const quickLinks = [
    { name: 'Servicios', href: '#services' },
    { name: 'Portfolio', href: '#proyectos' },
    { name: 'Contacto', href: '#contacto' }
  ];

  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-16 pb-8 px-6">
      <div id="contacto" className="max-w-7xl mx-auto">
        
        {/* Layout Principal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* 1. Branding y Redes */}
          <div className="col-span-2 md:col-span-1 border-b md:border-none border-white/5 pb-8 md:pb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Code2 className="text-white w-5 h-5" />
              </div>
              <span className="text-white font-bold text-xl tracking-tighter italic">
                ARKA<span className="text-blue-500 not-italic">VISION</span>
              </span>
            </div>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6 max-w-xs">
              Ingeniería de software con estética minimalista y rendimiento extremo.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, label, color }, i) => (
                <a 
                  key={i} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-2.5 bg-white/5 rounded-xl border border-white/10 transition-all group ${color} hover:border-current hover:bg-white/10`}
                >
                  <Icon size={16} className="text-gray-400 transition-colors group-hover:text-inherit" />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Links Rápidos */}
          <div className="col-span-1">
            <h4 className="text-blue-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-4">Explorar</h4>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-gray-400 hover:text-white text-xs transition-colors flex items-center group">
                    {item.name} <ArrowUpRight size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Tech Stack */}
          <div className="col-span-1">
            <h4 className="text-blue-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-4">Stack</h4>
            <ul className="space-y-3 text-gray-400 text-xs">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"/> React / Next.js</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"/> Tailwind v4</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"/> MQL5 / AI</li>
            </ul>
          </div>

          {/* 4. Contact Card */}
          <div className="col-span-2 md:col-span-1">
            <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                <span className="text-white text-[10px] font-bold uppercase">¿Listo para empezar?</span>
              </div>
              <a href="mailto:arkanavison26@gmail.com" className="text-gray-300 text-xs break-all hover:text-blue-400 transition-colors block mb-1">
                arkanavison26@gmail.com
              </a>
              <p className="text-[9px] text-gray-600 font-mono mt-2 flex items-center gap-1">
                <Globe size={10} /> DISPONIBLE NIVEL GLOBAL
              </p>
            </div>
          </div>
        </div>

        {/* Línea Final */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 text-[9px] text-gray-600 font-mono uppercase tracking-widest">
            <span>© {currentYear}</span>
            <span className="text-white/20">|</span>
            <span>Hecho con <span className="text-blue-500">passion</span> en Bogotá</span>
          </div>
          <div className="flex gap-6 text-[9px] text-gray-600 font-mono uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;