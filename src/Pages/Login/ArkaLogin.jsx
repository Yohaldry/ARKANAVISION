import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  ArrowRight, 
  LayoutDashboard, 
  Sparkles, 
  Headphones, 
  Eye, 
  EyeOff,
  Zap,
  Globe
} from 'lucide-react';

const ArkaLogin = () => {
  const [role, setRole] = useState('client'); // 'client' o 'advisor'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const robotImageUrl = 'https://res.cloudinary.com/dtkirmtfq/image/upload/v1772833786/ARKA/v1h6fepjfmgtydfx8cid.png';

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulación de autenticación
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Logueado como ${role}:`, formData);
    }, 2000);
  };

  const botMessage = role === 'client' 
    ? "¡Hola! Ingresa para ver el progreso de tu imperio digital."
    : "Identifícate, Senior Advisor. Tenemos proyectos esperando tu toque.";

  return (
    <div className="min-h-screen w-full bg-[#050914] text-white flex items-center justify-center p-4 font-sans overflow-hidden relative">
      
      {/* Elementos de fondo decorativos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-700 ${role === 'client' ? 'bg-blue-600/10' : 'bg-purple-600/10'}`}></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] transition-colors duration-700 ${role === 'client' ? 'bg-cyan-600/10' : 'bg-indigo-600/10'}`}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
      </div>

      <div className="max-w-5xl w-full grid lg:grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10">
        
        {/* LADO IZQUIERDO: Branding y Arka Bot */}
        <div className={`hidden lg:flex flex-col p-12 justify-between relative transition-colors duration-700 ${role === 'client' ? 'bg-blue-600/5' : 'bg-purple-600/5'}`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap size={18} className="fill-white" />
              </div>
              <span className="font-black italic tracking-tighter text-2xl">ARKA LAB<span className="text-blue-500">.</span></span>
            </div>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">Next Gen Architecture</p>
          </div>

          <div className="relative flex flex-col items-center py-10">
            <div className="relative group">
              <div className={`absolute -inset-10 rounded-full blur-3xl transition-colors duration-700 animate-pulse ${role === 'client' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}></div>
              <img 
                src={robotImageUrl} 
                alt="Arka Bot" 
                className="w-48 h-48 object-contain relative z-10 animate-bounce transition-transform hover:scale-110" 
                style={{ animationDuration: '4s', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
              />
            </div>
            
            <div className="mt-8 bg-[#0a0f1e] border border-white/10 p-6 rounded-3xl rounded-bl-none relative max-w-xs shadow-xl">
              <p className="text-sm font-medium italic opacity-90 leading-relaxed text-center">
                "{botMessage}"
              </p>
              <div className="absolute -bottom-3 left-0 w-6 h-6 bg-[#0a0f1e] border-l border-b border-white/10 transform -rotate-45 translate-x-4"></div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white/20 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><Globe size={12}/> Global Network</span>
            <span className="flex items-center gap-1"><ShieldCheck size={12}/> Encrypted Access</span>
          </div>
        </div>

        {/* LADO DERECHO: Formulario */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          
          {/* Selector de Rol */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl mb-12 border border-white/5 relative">
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-500 ease-out shadow-lg ${role === 'client' ? 'left-1.5 bg-blue-600' : 'left-[calc(50%+3px)] bg-purple-600'}`}
            />
            <button 
              onClick={() => setRole('client')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 text-[10px] font-black uppercase tracking-widest ${role === 'client' ? 'text-white' : 'text-white/40'}`}
            >
              <User size={14} /> Cliente
            </button>
            <button 
              onClick={() => setRole('advisor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 text-[10px] font-black uppercase tracking-widest ${role === 'advisor' ? 'text-white' : 'text-white/40'}`}
            >
              <Headphones size={14} /> Asesor
            </button>
          </div>

          <div className="space-y-2 mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              {role === 'client' ? 'Acceso Cliente' : 'Panel de Control'}
            </h2>
            <p className="text-white/40 text-xs font-medium">Ingresa tus credenciales autorizadas.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-2">Correo Electrónico</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-all text-sm font-medium"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Contraseña</label>
                <button type="button" className="text-[9px] font-black uppercase text-blue-500/70 hover:text-blue-400">¿Olvidaste la clave?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-blue-500 transition-all text-sm font-medium"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                role === 'client' 
                  ? 'bg-blue-600 shadow-blue-600/20 hover:bg-blue-500' 
                  : 'bg-purple-600 shadow-purple-600/20 hover:bg-purple-500'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Acceder al Sistema <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {role === 'client' && (
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-xs text-white/40">
                ¿Aún no tienes un proyecto? 
                <button className="ml-2 text-blue-500 font-bold hover:underline">Inicia aquí</button>
              </p>
            </div>
          )}

          {/* Información de Soporte para Asesores */}
          {role === 'advisor' && (
            <div className="mt-8 flex items-center justify-center gap-4 grayscale opacity-40">
               <div className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center bg-white/5"><LayoutDashboard size={18}/></div>
               <div className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center bg-white/5"><Sparkles size={18}/></div>
               <div className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center bg-white/5"><ShieldCheck size={18}/></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Versión móvil del robot (flotante pequeño) */}
      <div className="lg:hidden absolute bottom-6 right-6 z-50 animate-bounce">
         <img src={robotImageUrl} alt="Bot Mobile" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
      </div>
    </div>
  );
};

export default ArkaLogin;