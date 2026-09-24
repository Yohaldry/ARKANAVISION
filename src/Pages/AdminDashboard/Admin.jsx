import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Settings, 
  Bell, 
  Search, 
  ShieldCheck, 
  DollarSign, 
  Plus, 
  Sparkles,
  LogOut
} from 'lucide-react';

// Importa tu componente Proyectos desde su archivo correspondiente
import Proyectos from './Proyectos';
// Importa tu componente Clientes si lo tienes separado (opcional)
// import Clientes from './Clientes';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Proyectos Activos', value: '12', change: '+2 este mes', icon: FolderKanban, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'Clientes Registrados', value: '28', change: '+15% vs mes ant.', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Ingresos Estimados', value: '$48.5M COP', change: '85% cobrado', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Eficiencia IA (Visarka)', value: '99.4%', change: 'Optimizado', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="w-full h-screen bg-slate-100 flex font-sans text-slate-800 overflow-hidden selection:bg-cyan-500 selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5 shadow-sm z-20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-slate-900">ARKANAVISION</h1>
              <span className="text-[10px] font-mono text-cyan-600 uppercase tracking-wider">Admin Dashboard</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 mt-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard size={16} /> Resumen General
            </button>

            <button 
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'clients' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users size={16} /> Gestión de Clientes
            </button>

            <button 
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'projects' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FolderKanban size={16} /> Proyectos Activos
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings size={16} /> Configuración
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-cyan-400 font-bold flex items-center justify-center text-xs">
              YQ
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900">Yohaldry Quintero</span>
              <span className="text-[10px] text-slate-400">Lead Full-Stack</span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 cursor-pointer">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL DINÁMICO */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10 shadow-sm shrink-0">
          <div className="relative w-96">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar clientes, módulos o proyectos..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500"></span>
            </button>

            <span className="px-3 py-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono text-[10px] font-bold rounded-lg flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-cyan-600" /> Modo Admin Activo
            </span>
          </div>
        </header>

        {/* RENDERIZADO DINÁMICO SEGÚN LA PESTAÑA ACTIVA */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto p-8 flex flex-col gap-8">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white flex justify-between items-center shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col gap-1.5 relative z-10">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Panel de Control General</span>
                  <h2 className="text-xl font-black uppercase tracking-wide">Bienvenido de nuevo, Yohaldry</h2>
                  <p className="text-slate-300 text-xs max-w-xl">Todos los servicios de Firebase y módulos de ingeniería están sincronizados y funcionando óptimamente.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('projects')}
                  className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer relative z-10"
                >
                  <Plus size={16} /> Ver Proyectos
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((st, idx) => {
                  const Icon = st.icon;
                  return (
                    <div key={idx} className={`bg-white border rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all ${st.bg}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">{st.label}</span>
                        <div className={`w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm ${st.color}`}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-xl font-black text-slate-900">{st.value}</h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">{st.change}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AQUÍ SE INTEGRA DIRECTAMENTE TU COMPONENTE Proyectos.jsx */}
          {activeTab === 'projects' && <Proyectos />}

          {activeTab === 'clients' && (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-xs">
              Vista de Gestión de Clientes (Integrar Clientes.jsx aquí)
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-xs">
              Configuración general del sistema Arkana Vision.
            </div>
          )}
        </div>

      </main>

    </div>
  );
}