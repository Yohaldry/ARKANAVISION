import React, { useState } from 'react';
import { Sparkles, Crown, Scissors, MessageCircle, Instagram, ShieldCheck, Clock, MapPin, Zap, Home } from 'lucide-react';
import AgendaPro from './AgendaPro'; // Importas el modal creado

const BarberoKintero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#030712] text-white font-sans flex flex-col justify-between p-3 sm:p-6 selection:bg-cyan-500 selection:text-black relative">
      
      {/* EFECTOS DE LUZ AMBIENTAL */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* =========================================================
          VISTA DE COMPUTADORA / TABLET (hidden md:flex)
          ========================================================= */}
      <div className="hidden md:flex flex-col justify-between h-full w-full max-w-6xl mx-auto relative z-10">
        
        <header className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/30 text-lg">
              K
            </div>
            <div>
              <span className="text-sm font-black tracking-widest block text-white uppercase">KINTERO STUDIO</span>
              <span className="text-[10px] tracking-[0.2em] text-cyan-400 font-semibold uppercase block -mt-1">Master Barber & Visagismo</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-cyan-500/30 backdrop-blur-md text-cyan-400 text-xs font-bold tracking-wider uppercase shadow-xl">
            <Crown className="w-4 h-4 text-cyan-400 animate-pulse" /> VIP Elite a Domicilio
          </div>
        </header>

        <main className="grid grid-cols-12 gap-8 items-center my-auto">
          <div className="col-span-7 flex flex-col space-y-5">
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
              <Home className="w-4 h-4" /> Servicio de Barbería Profesional a Domicilio
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white">
              EXCELENCIA Y PRESTIGIO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-200">
                HASTA LA PUERTA DE TU HOGAR
              </span>
            </h1>
            <p className="text-gray-400 text-sm max-w-lg font-light leading-relaxed">
              Atención de alto nivel con estándares de estudio exclusivo. Visagismo facial, cortes impecables y barbería de máxima categoría donde lo necesites.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-[#0b1329]/90 border border-cyan-500/20 p-3 rounded-xl backdrop-blur-md text-center shadow-lg">
                <Sparkles className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-xs text-gray-300 font-bold block">Visagismo Pro</span>
              </div>
              <div className="bg-[#0b1329]/90 border border-cyan-500/20 p-3 rounded-xl backdrop-blur-md text-center shadow-lg">
                <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-xs text-gray-300 font-bold block">Fades & Barba</span>
              </div>
              <div className="bg-[#0b1329]/90 border border-cyan-500/20 p-3 rounded-xl backdrop-blur-md text-center shadow-lg">
                <ShieldCheck className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-xs text-gray-300 font-bold block">Kit Estéril VIP</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-400 text-black font-black px-8 py-4 rounded-xl text-sm shadow-2xl shadow-cyan-500/30 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <Scissors className="w-4 h-4 transition-transform group-hover:rotate-45" /> AGENDAR CITA A DOMICILIO
              </button>
            </div>
          </div>

          <div className="col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-[#080e1a] group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-black/40 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/5 border border-cyan-500/40 flex items-center justify-center mb-4 text-cyan-400 shadow-2xl">
                  <Crown className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-lg font-black tracking-wider text-white mb-1">YOHALDRY KINTERO</h3>
                <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mb-3">Master Barber Profesional</p>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-cyan-500/20 text-xs text-gray-300 font-light">
                  Bogotá, Colombia • Norte
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-between items-center px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-cyan-500/20 text-xs">
                <span className="text-gray-400">Estatus:</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span> Disponible a Domicilio
                </span>
              </div>
            </div>
          </div>
        </main>

        <footer className="pt-3 border-t border-cyan-500/20 flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <span>WhatsApp Directo: <strong className="text-white tracking-wider">+57 333 254 8430</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
            <Instagram className="w-4 h-4 text-pink-400" />
            <span className="font-semibold">@kintero.oficial</span>
          </div>
        </footer>
      </div>


      {/* =========================================================
          VISTA DE TELÉFONO MÓVIL (flex md:hidden)
          ========================================================= */}
      <div className="flex md:hidden flex-col justify-between h-full w-full relative z-10 py-1">
        
        {/* HEADER MÓVIL */}
        <div className="flex justify-between items-center w-full border-b border-cyan-500/15 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-black font-black text-sm shadow-md shadow-cyan-500/30">
              K
            </div>
            <div>
              <span className="text-xs font-black tracking-widest uppercase block text-white leading-tight">KINTERO STUDIO</span>
              <span className="text-[10px] tracking-wider text-cyan-400 font-bold uppercase">MAESTRO BARBERO VIP</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-extrabold uppercase tracking-wide shadow-lg">
            <Home className="w-3.5 h-3.5 text-cyan-400" /> A DOMICILIO
          </div>
        </div>

        {/* CUERPO MÓVIL */}
        <div className="flex flex-col justify-center space-y-3.5 w-full my-auto">
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-cyan-400 text-[11px] font-extrabold tracking-widest uppercase">
              <Crown className="w-4 h-4" /> BARBERÍA PROFESIONAL DE ALTO NIVEL
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
              EXPERIENCIA VIP <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-200">
                A DOMICILIO U OFICINA
              </span>
            </h1>
          </div>

          <p className="text-gray-300 text-xs sm:text-sm font-light leading-relaxed">
            Precisión milimétrica, visagismo y máxima profesionalidad para quienes exigen excelencia e imagen impecable sin salir de casa.
          </p>

          {/* TARJETAS DE COBERTURA Y HORARIOS */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <div className="bg-[#0b1329]/95 border border-cyan-500/30 p-3 rounded-xl backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-black mb-1">
                <MapPin className="w-4 h-4" /> Cobertura Norte
              </div>
              <p className="text-[11px] text-gray-200 leading-tight font-bold">
                Bogotá <span className="text-cyan-300 block text-[10px] font-medium">(Norte Exclusivo)</span>
              </p>
            </div>

            <div className="bg-[#0b1329]/95 border border-cyan-500/30 p-3 rounded-xl backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-black mb-1">
                <Clock className="w-4 h-4" /> Horarios VIP
              </div>
              <p className="text-[11px] text-gray-200 leading-tight font-bold">
                Mañanas y Noches <span className="text-cyan-300 block text-[10px] font-medium">(Flexibilidad total)</span>
              </p>
            </div>
          </div>

          {/* HIGHLIGHTS / SERVICIOS (3 CELDAS) */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="bg-black/60 border border-cyan-500/20 py-3 px-1 rounded-xl text-center shadow-md">
              <Scissors className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="text-[11px] text-gray-100 font-bold block">Fades Pro</span>
            </div>
            <div className="bg-black/60 border border-cyan-500/20 py-3 px-1 rounded-xl text-center shadow-md">
              <Sparkles className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="text-[11px] text-gray-100 font-bold block">Visagismo</span>
            </div>
            <div className="bg-black/60 border border-cyan-500/20 py-3 px-1 rounded-xl text-center shadow-md">
              <ShieldCheck className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="text-[11px] text-gray-100 font-bold block">Kit Estéril</span>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN WHATSAPP */}
          <div className="w-full pt-1">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-400 text-black font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              <Scissors className="w-4 h-4" /> AGENDAR CITA A DOMICILIO
            </button>
          </div>

        </div>

        {/* FOOTER MÓVIL */}
        <div className="flex justify-between items-center w-full text-xs border-t border-cyan-500/20 pt-2.5">
          <div className="flex items-center gap-2 text-cyan-400 font-bold cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <MessageCircle className="w-4 h-4" />
            <span>+57 333 254 8430</span>
          </div>
          <div className="flex items-center gap-2 text-gray-200">
            <Instagram className="w-4 h-4 text-pink-400" />
            <span className="font-bold">@kintero.oficial</span>
          </div>
        </div>

      </div>

      {/* MODAL DE AGENDA PRO */}
      <AgendaPro isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
};

export default BarberoKintero;