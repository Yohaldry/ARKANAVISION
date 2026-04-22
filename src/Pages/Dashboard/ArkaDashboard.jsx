import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FolderCanvas, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Bell, 
  Search, 
  Plus, 
  Cpu, 
  Globe, 
  ChevronRight, 
  MoreVertical,
  Clock,
  CheckCircle2,
  FileText,
  Terminal,
  LogOut,
  Smartphone,
  Monitor,
  User,
  Lock,
  ArrowRight
} from 'lucide-react';

const ArkaDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null); // 'client' o 'advisor'
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // URL del Robot personalizado
  const robotImageUrl = 'https://res.cloudinary.com/dtkirmtfq/image/upload/v1741300976/ARKA/j9536i97fuzk10i0moxq.png';

  // Manejador de Login simulado
  const handleLogin = (selectedRole) => {
    setLoading(true);
    // Simulación de delay de red neural
    setTimeout(() => {
      setRole(selectedRole);
      setIsLoggedIn(true);
      setLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole(null);
    setActiveTab('overview');
  };

  const stats = role === 'client' ? [
    { label: 'Progreso Total', value: '74%', icon: Zap, color: 'text-blue-500' },
    { label: 'Fase Actual', value: 'Despliegue', icon: Globe, color: 'text-cyan-400' },
    { label: 'Días para Entrega', value: '12', icon: Clock, color: 'text-amber-400' },
    { label: 'Seguridad', value: 'SSL-On', icon: ShieldCheck, color: 'text-emerald-400' }
  ] : [
    { label: 'Servidores Activos', value: '12/12', icon: Cpu, color: 'text-purple-500' },
    { label: 'Tickets Pendientes', value: '05', icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Carga de CPU', value: '28%', icon: Zap, color: 'text-emerald-400' },
    { label: 'Uptime Global', value: '99.9%', icon: Globe, color: 'text-cyan-400' }
  ];

  const projects = [
    { id: 1, name: 'Nexus Architecture', status: 'In Progress', progress: 85, lead: 'Client A' },
    { id: 2, name: 'Global Logistics UI', status: 'Testing', progress: 95, lead: 'Client B' },
    { id: 3, name: 'E-commerce Neural', status: 'Design', progress: 40, lead: 'Client C' },
  ];

  // VISTA DE LOGIN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Decoración de fondo */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
            <div className="flex flex-col items-center mb-10">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                  <Cpu size={32} className="text-white" />
               </div>
               <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Arka System</h1>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-2">Acceso a la Red Neural</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Identificador de Usuario</label>
                <div className="relative group">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                   <input 
                    type="text" 
                    placeholder="arka_user_01" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all text-sm font-medium"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Código de Acceso</label>
                <div className="relative group">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                   <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all text-sm font-medium"
                   />
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleLogin('client')}
                  disabled={loading}
                  className="py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10 hover:border-blue-500/30 transition-all flex flex-col items-center gap-2 group"
                >
                  <Smartphone size={16} className="text-gray-500 group-hover:text-blue-500" />
                  Soy Cliente
                </button>
                <button 
                  onClick={() => handleLogin('advisor')}
                  disabled={loading}
                  className="py-4 bg-blue-600 rounded-2xl font-black text-[9px] uppercase tracking-widest text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all flex flex-col items-center gap-2"
                >
                  <Terminal size={16} />
                  Soy Asesor
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-3 py-2">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                   <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Autenticando...</span>
                </div>
              )}
            </div>

            <p className="text-center mt-10 text-[9px] font-medium text-gray-600 uppercase tracking-widest">
              Protegido por Arka Security Protocol v.4.0
            </p>
          </div>
        </div>
      </div>
    );
  }

  // VISTA DE DASHBOARD (Una vez logueado)
  return (
    <div className="min-h-screen bg-[#020617] text-white flex font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className={`transition-all duration-500 border-r border-white/5 bg-[#050914] flex flex-col z-50 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap size={18} className="fill-white" />
          </div>
          {isSidebarOpen && <span className="font-black italic tracking-tighter text-xl">ARKA LAB.</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
            { id: 'projects', label: role === 'client' ? 'Mi Proyecto' : 'Proyectos', icon: FolderCanvas },
            { id: 'messages', label: 'Mensajes', icon: MessageSquare, badge: '2' },
            { id: 'documents', label: 'Archivos', icon: FileText },
            role === 'advisor' && { id: 'users', label: 'Clientes', icon: Users },
            { id: 'settings', label: 'Ajustes', icon: Settings },
          ].filter(Boolean).map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={18} />
              {isSidebarOpen && (
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  {item.badge && <span className="bg-red-500 text-[8px] px-1.5 py-0.5 rounded-full text-white">{item.badge}</span>}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
             <LogOut size={18} />
             {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Cerrar Sesión</span>}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        
        {/* HEADER */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-gray-500">
               <MoreVertical size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
               <Search size={14} className="text-gray-500" />
               <input type="text" placeholder="Buscar en Arka..." className="bg-transparent outline-none text-[10px] font-bold uppercase tracking-widest w-48 placeholder:text-gray-600" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-500 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#050914]" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest">{role === 'client' ? 'Carlos Client' : 'Ing. Arka Senior'}</p>
                <p className="text-[8px] text-blue-500 font-bold uppercase">{role === 'client' ? 'Nivel Platino' : 'Supervisor'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-[1px]">
                 <div className="w-full h-full bg-[#050914] rounded-xl flex items-center justify-center">
                   <User size={20} className="text-blue-500" />
                 </div>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          
          {/* Welcome Card con Arka Bot */}
          <div className="relative p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-[400px] h-full opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50"></div>
             </div>
             
             <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative group">
                   <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                   <img 
                    src={robotImageUrl} 
                    alt="Bot" 
                    className="w-24 h-24 object-contain animate-bounce" 
                    style={{ animationDuration: '3s', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                   />
                </div>
                <div className="space-y-2 text-center md:text-left">
                   <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">
                     {role === 'client' ? '¡Tu imperio está tomando forma!' : 'Estado del Nodo ArkaLab'}
                   </h1>
                   <p className="text-sm font-medium opacity-80 italic max-w-xl">
                     {role === 'client' 
                       ? "Arka Bot: He optimizado 3 componentes de tu UI hoy. El despliegue a producción está programado para el viernes." 
                       : "Arka Bot: Se detectaron 2 nuevos requerimientos de clientes. La latencia de los servidores está en niveles óptimos."}
                   </p>
                </div>
                <div className="md:ml-auto">
                   <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                      {role === 'client' ? 'Ver Último Preview' : 'Abrir Terminal Técnico'}
                   </button>
                </div>
             </div>
          </div>

          {/* Grid de Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <span className="text-[8px] font-black text-emerald-500 uppercase">+12%</span>
                </div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black italic">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Contenido Secundario */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Lista de Proyectos / Actividad */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                   <FolderCanvas size={14} className="text-blue-500" /> {role === 'client' ? 'Hitos del Proyecto' : 'Proyectos en Curso'}
                 </h2>
                 <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline">Ver todo</button>
              </div>

              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                       <Monitor size={20} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-black italic uppercase tracking-tighter truncate">{project.name}</p>
                       <p className="text-[10px] text-gray-500 font-bold">{role === 'client' ? 'Fase de Desarrollo' : project.lead}</p>
                    </div>
                    <div className="hidden sm:block w-32">
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }}></div>
                       </div>
                       <p className="text-[8px] font-black text-right mt-1 opacity-40">{project.progress}% COMPLETO</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase">
                       {project.status}
                    </div>
                    <button className="p-2 text-gray-600 hover:text-white"><ChevronRight size={18} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar de Actividad / Chat */}
            <div className="space-y-6">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                 <Terminal size={14} className="text-blue-500" /> Registro de Logs
               </h2>
               
               <div className="rounded-3xl bg-black border border-white/5 p-6 space-y-4 font-mono">
                  {[
                    { time: '14:20', msg: 'System backup completed.', type: 'info' },
                    { time: '13:05', msg: 'SSL Certificate renewed.', type: 'success' },
                    { time: '11:45', msg: 'User login: Arka_Session_X', type: 'info' },
                    { time: '09:00', msg: 'Neural build v.2.4 deployed.', type: 'success' }
                  ].map((log, i) => (
                    <div key={i} className="flex gap-3 text-[9px] leading-tight">
                       <span className="text-blue-500/50 shrink-0">[{log.time}]</span>
                       <span className={log.type === 'success' ? 'text-emerald-400' : 'text-gray-400'}>{log.msg}</span>
                    </div>
                  ))}
               </div>

               <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0a0f1e] to-[#050914] border border-white/5 space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">¿Necesitas soporte?</p>
                  <div className="flex items-center gap-4">
                     <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full border-2 border-[#050914] bg-blue-500 flex items-center justify-center text-[10px] font-bold">AS</div>
                        <div className="w-8 h-8 rounded-full border-2 border-[#050914] bg-purple-500 flex items-center justify-center text-[10px] font-bold">JB</div>
                     </div>
                     <p className="text-[10px] font-bold">2 Asesores Online</p>
                  </div>
                  <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <MessageSquare size={14} /> Abrir Chat de Soporte
                  </button>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ArkaDashboard;