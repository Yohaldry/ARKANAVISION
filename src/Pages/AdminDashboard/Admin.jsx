import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FolderKanban, Settings, Bell, Search, 
  ShieldCheck, Sparkles, LogOut, Menu, X, Power, CheckCircle, AlertCircle, 
  Trash2, Edit3, Wallet, Bike, Lock, KeyRound, ArrowLeft, Calendar, DollarSign
} from 'lucide-react';
import { db } from '../../components/firebase';
import { collection, doc, updateDoc, onSnapshot, query, where, deleteDoc } from 'firebase/firestore';
import Proyectos from './Proyectos';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorPin, setErrorPin] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [profesionales, setProfesionales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProfs, setLoadingProfs] = useState(true);

  // Estados de vista detallada del profesional
  const [barberSeleccionado, setBarberSeleccionado] = useState(null);
  const [vistaBarberTab, setVistaBarberTab] = useState('wallet');
  const [serviciosBarber, setServiciosBarber] = useState([]);
  const [billeteraBarber, setBilleteraBarber] = useState(null);
  const [domiciliosBarber, setDomiciliosBarber] = useState([]);

  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleLoginAdmin = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorPin(false);

    setTimeout(() => {
      if (pinInput === '280595') {
        setIsAuthenticated(true);
      } else {
        setErrorPin(true);
        setIsAuthenticated(false);
      }
      setIsAuthenticating(false);
    }, 1200);
  };

  // Mapeo general de profesionales desde Firestore
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = onSnapshot(collection(db, "profesionales"), (snap) => {
      const listaProfs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProfesionales(listaProfs);
      setLoadingProfs(false);
    }, () => setLoadingProfs(false));
    return () => unsub();
  }, [isAuthenticated]);

  // Sincronización y mapeo de datos específicos del profesional seleccionado
  useEffect(() => {
    if (!barberSeleccionado) return;
    
    const qServicios = query(collection(db, 'servicios'), where('barberoId', '==', barberSeleccionado.id));
    const unsubServicios = onSnapshot(qServicios, (snap) => {
      setServiciosBarber(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Mapeo unificado de billetera (ya sea embebida o relacional)
    setBilleteraBarber(barberSeleccionado.billetera || {
      saldoActual: barberSeleccionado.saldoActual || barberSeleccionado.saldo || 0,
      totalManual: barberSeleccionado.totalManual || barberSeleccionado.gestionManual || 0,
      ingresosTotales: barberSeleccionado.ingresosTotales || barberSeleccionado.total || 0,
      movimientos: barberSeleccionado.movimientos || []
    });

    const qBilletera = query(collection(db, 'billeteras'), where('barberoId', '==', barberSeleccionado.id));
    const unsubBilletera = onSnapshot(qBilletera, (snap) => {
      if (!snap.empty) {
        const dataB = snap.docs[0].data();
        setBilleteraBarber({
          saldoActual: dataB.saldoActual || dataB.saldo || 0,
          totalManual: dataB.totalManual || dataB.gestionManual || 0,
          ingresosTotales: dataB.ingresosTotales || dataB.total || 0,
          movimientos: dataB.movimientos || []
        });
      }
    });

    const qDomicilios = query(collection(db, 'domicilios'), where('barberoId', '==', barberSeleccionado.id));
    const unsubDomicilios = onSnapshot(qDomicilios, (snap) => {
      setDomiciliosBarber(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubServicios();
      unsubBilletera();
      unsubDomicilios();
    };
  }, [barberSeleccionado]);

  const filteredBarbers = profesionales.filter(p => 
    (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculo de métricas globales del sistema basadas en los profesionales mapeados
  const totalIngresosSistema = profesionales.reduce((acc, p) => acc + (p.ingresosTotales || p.billetera?.ingresosTotales || 0), 0);

  const movimientosFiltrados = (billeteraBarber?.movimientos || []).filter(mov => {
    if (!fechaInicio && !fechaFin) return true;
    const fechaMov = mov.fecha || mov.createdAt;
    if (!fechaMov) return true;
    if (fechaInicio && fechaMov < fechaInicio) return false;
    if (fechaFin && fechaMov > fechaFin) return false;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Sparkles size={30} className="animate-pulse" />
          </div>
          <div className="text-center flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Arkana Vision Security</span>
            <h1 className="text-lg font-black tracking-wider text-white uppercase">Acceso Master Administrativo</h1>
          </div>
          <form onSubmit={handleLoginAdmin} className="w-full flex flex-col gap-4">
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input 
                type="password" 
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••" 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-center tracking-[0.5em] font-mono text-lg text-white outline-none"
                required
              />
            </div>
            {errorPin && (
              <span className="text-[11px] font-mono text-red-400 text-center bg-red-950/20 border border-red-900/50 py-1.5 rounded-xl">
                ✕ Clave incorrecta. Acceso denegado.
              </span>
            )}
            <button type="submit" disabled={isAuthenticating} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black uppercase text-xs tracking-widest cursor-pointer flex items-center justify-center gap-2">
              <ShieldCheck size={16} /> Desbloquear Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-100 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between p-4">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-widest text-white">ARKANAVISION</h1>
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">Admin Dashboard</span>
            </div>
          </div>
          <nav className="flex flex-col gap-1 mt-1">
            <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs cursor-pointer ${activeTab === 'overview' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>
              <LayoutDashboard size={15} /> Resumen General
            </button>
            <button onClick={() => setActiveTab('professionals')} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs cursor-pointer ${activeTab === 'professionals' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Users size={15} /> Control Profesionales
            </button>
            <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs cursor-pointer ${activeTab === 'projects' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}>
              <FolderKanban size={15} /> Proyectos Activos
            </button>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
        <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between z-10 shrink-0">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o correo electrónico..." 
            className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
          />
        </header>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Total Profesionales Registrados</span>
                  <h3 className="text-2xl font-black text-white">{profesionales.length}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Ingresos Globales Acumulados</span>
                  <h3 className="text-2xl font-black text-emerald-400">${totalIngresosSistema.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'professionals' && (
            <div className="h-full overflow-y-auto p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredBarbers.map((barber) => (
                  <div key={barber.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-cyan-400 text-sm">
                        {(barber.nombre || "U").charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{barber.nombre}</h4>
                        <span className="text-[10px] text-slate-400 truncate block">{barber.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setBarberSeleccionado(barber); setVistaBarberTab('wallet'); }}
                      className="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Wallet size={13} /> Ver Métricas de Billetera
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && <div className="p-6"><Proyectos /></div>}
        </div>
      </main>

      {/* VISTA DETALLADA DE MÉTRICAS DEL PROFESIONAL */}
      {barberSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 md:p-6 overflow-y-auto font-sans text-slate-100">
          <div className="max-w-5xl mx-auto w-full flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setBarberSeleccionado(null)} className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-sm font-black uppercase text-white">{barberSeleccionado.nombre}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{barberSeleccionado.email}</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-[10px] font-bold rounded-lg">
              Métricas Detalladas
            </span>
          </div>

          <div className="max-w-5xl mx-auto w-full flex-1 overflow-y-auto flex flex-col gap-4 pb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-cyan-400" />
                  <h4 className="text-sm font-black uppercase text-white">Billetera & Métricas Financieras</h4>
                </div>
                
                {/* Selector de Rango de Fechas */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Calendar size={14} className="text-cyan-400" />
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Desde:</span>
                  <input 
                    type="date" 
                    value={fechaInicio} 
                    onChange={(e) => setFechaInicio(e.target.value)} 
                    className="bg-transparent text-xs text-white outline-none font-mono" 
                  />
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Hasta:</span>
                  <input 
                    type="date" 
                    value={fechaFin} 
                    onChange={(e) => setFechaFin(e.target.value)} 
                    className="bg-transparent text-xs text-white outline-none font-mono" 
                  />
                  {(fechaInicio || fechaFin) && (
                    <button onClick={() => { setFechaInicio(''); setFechaFin(''); }} className="text-[10px] text-cyan-400 underline cursor-pointer ml-1">Limpiar</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Saldo Actual</span>
                  <span className="text-xl font-black text-white">${billeteraBarber?.saldoActual || 0}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Gestión Manual</span>
                  <span className="text-xl font-black text-purple-400">${billeteraBarber?.totalManual || 0}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Ingresos Totales</span>
                  <span className="text-xl font-black text-emerald-400">${billeteraBarber?.ingresosTotales || 0}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <h5 className="text-xs font-bold uppercase text-cyan-400">Historial Financiero / Movimientos</h5>
                {movimientosFiltrados.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No se registran movimientos para el rango de fechas seleccionado.</p>
                ) : (
                  movimientosFiltrados.map((mov, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-white">{mov.descripcion || mov.tipo || 'Movimiento'}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{mov.fecha || mov.createdAt || 'Fecha no registrada'}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">+${mov.monto || mov.valor || 0}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}