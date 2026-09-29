import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FolderKanban, Settings, Bell, Search, 
  ShieldCheck, Sparkles, LogOut, Menu, X, Power, CheckCircle, AlertCircle, Trash2, Edit3
} from 'lucide-react';
import { db } from '../../components/firebase';
import { collection, doc, updateDoc, onSnapshot, query, where, deleteDoc } from 'firebase/firestore';
import Proyectos from './Proyectos';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profesionales, setProfesionales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProfs, setLoadingProfs] = useState(true);

  // Estados para gestión de servicios del profesional seleccionado
  const [barberSeleccionado, setBarberSeleccionado] = useState(null);
  const [serviciosBarber, setServiciosBarber] = useState([]);
  const [formServicio, setFormServicio] = useState({ nombre: '', descripcion: '', precio: '', duracion: '45 min' });
  const [servicioEditando, setServicioEditando] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "profesionales"), (snap) => {
      setProfesionales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingProfs(false);
    }, () => setLoadingProfs(false));
    return () => unsub();
  }, []);

  // Cargar servicios en tiempo real del barbero seleccionado
  useEffect(() => {
    if (!barberSeleccionado) return;
    const q = query(collection(db, 'servicios'), where('barberoId', '==', barberSeleccionado.id));
    const unsub = onSnapshot(q, (snap) => {
      setServiciosBarber(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [barberSeleccionado]);

  const toggleBarberStatus = async (id, current) => {
    try { await updateDoc(doc(db, "profesionales", id), { activo: current === false ? true : false }); } 
    catch (e) { console.error(e); }
  };

  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    if (!servicioEditando || !formServicio.nombre || !formServicio.precio) return;
    try {
      await updateDoc(doc(db, 'servicios', servicioEditando.id), formServicio);
      setFormServicio({ nombre: '', descripcion: '', precio: '', duracion: '45 min' });
      setServicioEditando(null);
    } catch (e) { console.error(e); }
  };

  const eliminarServicio = async (id) => {
    if (window.confirm('¿Eliminar servicio?')) await deleteDoc(doc(db, 'servicios', id));
  };

  const filteredBarbers = profesionales.filter(p => 
    (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.ciudad || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-100 overflow-hidden selection:bg-cyan-500 selection:text-white">
      
      {/* HEADER MÓVIL SUPERIOR */}
      <header className="md:hidden h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider text-white">ARKANAVISION</h1>
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Admin Móvil</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-[9px] font-bold rounded flex items-center gap-1">
            <ShieldCheck size={12} /> Admin
          </span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* MENÚ DESPLEGABLE MÓVIL Y SIDEBAR ESCRITORIO */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 
        flex flex-col justify-between p-4 shadow-xl transition-transform duration-300 ease-in-out
        md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 pt-16 md:pt-4' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-5">
          <div className="hidden md:flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-widest text-white">ARKANAVISION</h1>
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">Admin Dashboard</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1 mt-1">
            <button 
              onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard size={15} /> Resumen General
            </button>

            <button 
              onClick={() => { setActiveTab('professionals'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'professionals' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users size={15} /> Control Profesionales
            </button>

            <button 
              onClick={() => { setActiveTab('projects'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'projects' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FolderKanban size={15} /> Proyectos Activos
            </button>

            <button 
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings size={15} /> Configuración
            </button>
          </nav>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
              YQ
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white">Yohaldry Quintero</span>
              <span className="text-[9px] text-slate-400">Master Admin</span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
        
        <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between z-10 shrink-0">
          <div className="relative w-full max-w-xs md:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar profesional, ciudad..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500"></span>
            </button>
            <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-[10px] font-bold rounded-lg flex items-center gap-1">
              <ShieldCheck size={13} /> Sistema Sincronizado
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          
          {/* 1. RESUMEN GENERAL (Restaurado con todas las estadísticas completas) */}
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto p-4 md:p-6 flex flex-col gap-5">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 md:p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col gap-1 relative z-10">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Panel de Control Total</span>
                  <h2 className="text-base md:text-xl font-black uppercase tracking-wide">Control de Profesionales</h2>
                  <p className="text-slate-400 text-xs max-w-lg">Activa o desactiva accesos de barberos en tiempo real. Bloquea agendas instantáneamente sin necesidad de cerrar sus sesiones.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('professionals')}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase text-[10px] tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer relative z-10 shrink-0"
                >
                  <Users size={14} /> Gestionar Barberos
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Total Profesionales</span>
                    <Users size={15} className="text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-black text-white">{profesionales.length}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Activos en Línea</span>
                    <CheckCircle size={15} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-black text-emerald-400">
                    {profesionales.filter(p => p.activo !== false).length}
                  </h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Desactivados</span>
                    <AlertCircle size={15} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-black text-red-400">
                    {profesionales.filter(p => p.activo === false).length}
                  </h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Estado Firebase</span>
                    <Sparkles size={15} className="text-purple-400" />
                  </div>
                  <h3 className="text-xs font-bold text-purple-400 uppercase">Sincronizado</h3>
                </div>
              </div>
            </div>
          )}

          {/* 2. CONTROL TOTAL DE PROFESIONALES */}
          {activeTab === 'professionals' && (
            <div className="h-full overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Directorio de Profesionales</h3>
                <p className="text-[11px] text-slate-400">Apaga el interruptor para desactivar un barbero o ingresa a sus servicios para editarlos o eliminarlos.</p>
              </div>

              {loadingProfs ? (
                <div className="text-center py-10 text-xs font-mono text-slate-500">Cargando profesionales...</div>
              ) : filteredBarbers.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 border border-slate-800 rounded-2xl">No se encontraron profesionales registrados.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredBarbers.map((barber) => {
                    const isActivo = barber.activo !== false;
                    return (
                      <div 
                        key={barber.id} 
                        className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md transition-all ${
                          isActivo ? 'border-slate-800' : 'border-red-900/50 bg-red-950/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={barber.foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"} 
                            alt={barber.nombre} 
                            className={`w-12 h-12 rounded-xl object-cover border ${isActivo ? 'border-slate-700' : 'border-red-800 opacity-60 grayscale'}`} 
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{barber.nombre || "Profesional"}</h4>
                            <span className="text-[10px] text-slate-400 truncate">{barber.ciudad || "Bogotá D.C."}</span>
                            <span className={`text-[9px] font-mono mt-1 px-2 py-0.5 rounded-md inline-block w-max ${
                              isActivo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {isActivo ? '● Activo (Operativo)' : '✖ Inactivo (Bloqueado)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setBarberSeleccionado(barber)}
                            className="flex-1 py-2 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            Servicios
                          </button>
                          <button
                            onClick={() => toggleBarberStatus(barber.id, isActivo)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                              isActivo 
                                ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30' 
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                            }`}
                            title={isActivo ? 'Desactivar Barbero' : 'Activar Barbero'}
                          >
                            <Power size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. PROYECTOS */}
          {activeTab === 'projects' && (
            <div className="h-full overflow-y-auto p-4 md:p-6">
              <Proyectos />
            </div>
          )}

          {/* 4. CONFIGURACIÓN */}
          {activeTab === 'settings' && (
            <div className="h-full flex items-center justify-center text-slate-500 italic text-xs p-4 text-center">
              Configuración general del sistema Arkana Vision.
            </div>
          )}
        </div>

      </main>

      {/* MODAL PARA GESTIONAR SERVICIOS (SIN CREAR NUEVOS) */}
      {barberSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex flex-col">
                <h3 className="text-xs font-black uppercase text-cyan-400">Servicios de {barberSeleccionado.nombre}</h3>
                <span className="text-[10px] text-slate-400">Edita o elimina los servicios existentes</span>
              </div>
              <button onClick={() => { setBarberSeleccionado(null); setServicioEditando(null); }} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            {/* Formulario solo visible al editar un servicio existente */}
            {servicioEditando && (
              <form onSubmit={handleGuardarServicio} className="flex flex-col gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-cyan-400">Editando Servicio</span>
                  <button type="button" onClick={() => setServicioEditando(null)} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">Cancelar</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Nombre" value={formServicio.nombre} onChange={e => setFormServicio({...formServicio, nombre: e.target.value})} className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white outline-none focus:border-cyan-500" required />
                  <input type="text" placeholder="Precio ($)" value={formServicio.precio} onChange={e => setFormServicio({...formServicio, precio: e.target.value})} className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white outline-none focus:border-cyan-500" required />
                </div>
                <input type="text" placeholder="Descripción breve" value={formServicio.descripcion} onChange={e => setFormServicio({...formServicio, descripcion: e.target.value})} className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white outline-none focus:border-cyan-500" />
                <button type="submit" className="py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer mt-1">Guardar Cambios</button>
              </form>
            )}

            <div className="flex flex-col gap-2">
              {serviciosBarber.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">Este profesional no tiene servicios registrados.</p>
              ) : (
                serviciosBarber.map(s => (
                  <div key={s.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{s.nombre} - <span className="text-cyan-400">${s.precio}</span></h4>
                      <p className="text-[10px] text-slate-400 truncate">{s.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button 
                        onClick={() => { setServicioEditando(s); setFormServicio({ nombre: s.nombre, descripcion: s.descripcion || '', precio: s.precio, duracion: s.duracion || '45 min' }); }} 
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                        title="Editar servicio"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => eliminarServicio(s.id)} 
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"
                        title="Eliminar servicio"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}