import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, BarChart3, Activity, Zap } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../components/firebase';

export default function Producido({ establecimientoId }) {
  const targetId = establecimientoId || auth.currentUser?.uid;

  const [citas, setCitas] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTiempo, setFiltroTiempo] = useState('quincena');

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }
    cargarDatosProducido();
  }, [targetId]);

  const cargarDatosProducido = async () => {
    try {
      setLoading(true);

      const qProf = query(collection(db, 'profesionales'), where('establecimientoId', '==', targetId));
      const profSnap = await getDocs(qProf);
      const listaProf = [];
      profSnap.forEach(docSnap => {
        listaProf.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProfesionales(listaProf);

      const qCitas = query(collection(db, 'citas'), where('establecimientoId', '==', targetId));
      const citasSnap = await getDocs(qCitas);
      const listaCitas = [];
      citasSnap.forEach(docSnap => {
        listaCitas.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCitas(listaCitas);

    } catch (err) {
      console.error("Error al cargar datos de producido:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtrarCitasPorTiempo = (lista) => {
    const ahora = new Date();
    return lista.filter(cita => {
      if (!cita.fecha && !cita.fechaStr) return false;
      const fechaCita = new Date(cita.fecha || cita.fechaStr);
      if (isNaN(fechaCita)) return false;

      const estado = (cita.estado || '').toLowerCase();
      if (estado === 'cancelada' || estado === 'bloqueado') return false;

      const unDiaMs = 24 * 60 * 60 * 1000;

      if (filtroTiempo === 'dia') {
        return fechaCita.toDateString() === ahora.toDateString();
      } else if (filtroTiempo === 'semana') {
        return Math.abs((ahora - fechaCita) / unDiaMs) <= 7;
      } else if (filtroTiempo === 'quincena') {
        return Math.abs((ahora - fechaCita) / unDiaMs) <= 15;
      } else if (filtroTiempo === 'mes') {
        return fechaCita.getMonth() === ahora.getMonth() && fechaCita.getFullYear() === ahora.getFullYear();
      } else if (filtroTiempo === 'anio') {
        return fechaCita.getFullYear() === ahora.getFullYear();
      }
      return true;
    });
  };

  const citasFiltradas = filtrarCitasPorTiempo(citas);
  const producidoTotal = citasFiltradas.reduce((acc, curr) => acc + (Number(curr.precioTotal || curr.precio) || 0), 0);

  const reporteProfesionales = profesionales.map(prof => {
    const citasProf = citasFiltradas.filter(c => 
      String(c.barberoId) === String(prof.id) || 
      (c.barberoName && prof.nombre && c.barberoName.toLowerCase().trim() === prof.nombre.toLowerCase().trim())
    );
    const brutoProf = citasProf.reduce((acc, curr) => acc + (Number(curr.precioTotal || curr.precio) || 0), 0);
    
    const porcentajeBarbero = Number(prof.comisionBarbero ?? prof.porcentaje ?? 60);
    const porcentajeTienda = 100 - porcentajeBarbero;

    const pagoBarbero = (brutoProf * porcentajeBarbero) / 100;
    const netoTiendaPorBarbero = (brutoProf * porcentajeTienda) / 100;

    return {
      ...prof,
      totalCitas: citasProf.length,
      bruto: isNaN(brutoProf) ? 0 : brutoProf,
      porcentajeBarbero: isNaN(porcentajeBarbero) ? 0 : porcentajeBarbero,
      pagoBarbero: isNaN(pagoBarbero) ? 0 : pagoBarbero,
      netoTienda: isNaN(netoTiendaPorBarbero) ? 0 : netoTiendaPorBarbero
    };
  }).sort((a, b) => b.bruto - a.bruto);

  const totalPagoBarberos = reporteProfesionales.reduce((acc, curr) => acc + (curr.pagoBarbero || 0), 0);
  const netoTiendaTotal = producidoTotal - totalPagoBarberos;

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-[11px] text-blue-600 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-50 via-white to-blue-50 min-h-screen">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Cargando terminal de trading y métricas quincenales...
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono text-[11px] text-slate-800 bg-slate-50/50 min-h-screen p-3 sm:p-6 pb-16">
      
      {/* HEADER DE TERMINAL FINANCIERO */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-blue-950 uppercase tracking-wider text-xs">Terminal Quincenal Pro</h3>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Live Feed</span>
            </div>
            <p className="text-[9px] text-slate-500">Rendimiento bursátil y métricas de producción del personal</p>
          </div>
        </div>

        {/* SELECTOR DE FILTRO DE TIEMPO */}
        <div className="flex items-center gap-1 bg-blue-50/70 p-1 rounded-xl border border-blue-200/80 w-full lg:w-auto overflow-x-auto">
          {[
            { id: 'dia', label: 'Día' },
            { id: 'semana', label: 'Sem.' },
            { id: 'quincena', label: 'Quincena' },
            { id: 'mes', label: 'Mes' },
            { id: 'anio', label: 'Año' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFiltroTiempo(tab.id)}
              className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg font-black uppercase text-[9px] transition-all cursor-pointer whitespace-nowrap ${
                filtroTiempo === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/25' 
                  : 'text-slate-600 hover:text-blue-900 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TARJETAS PRINCIPALES DE CAPITAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-sky-500 text-white border border-blue-500 p-4 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between z-10">
            <p className="text-[9px] font-bold text-sky-100 uppercase tracking-widest">Volumen Bruto Total</p>
            <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 z-10">
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight">${(producidoTotal || 0).toLocaleString()}</p>
            <p className="text-[9px] text-sky-100 font-bold mt-0.5">↑ {citasFiltradas.length} transacciones ejecutadas</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-sky-50/50 to-blue-50/80 border border-blue-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-400/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between z-10">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Neto Establecimiento</p>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 z-10">
            <p className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight">${(netoTiendaTotal || 0).toLocaleString()}</p>
            <p className="text-[9px] text-emerald-600 font-bold mt-0.5">Rentabilidad operativa neta</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-blue-50/40 to-sky-50/60 border border-blue-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between z-10">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Comisiones Personal</p>
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 z-10">
            <p className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight">${(totalPagoBarberos || 0).toLocaleString()}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Pagos acumulados a comisiones</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE TARJETAS DE TRADING MÁS PEQUEÑAS Y COMPACTAS POR PROFESIONAL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-black uppercase text-xs text-blue-950 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" /> Rendimiento Quincenal por Operador (Trading Style)
          </h4>
          <span className="text-[9px] text-slate-500 font-bold">{reporteProfesionales.length} activos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reporteProfesionales.length === 0 ? (
            <div className="col-span-full bg-white border border-blue-200 rounded-2xl p-8 text-center text-slate-400">
              No hay profesionales registrados para mostrar gráficos de rendimiento.
            </div>
          ) : (
            reporteProfesionales.map((prof, index) => {
              const porcentajeParticipacion = producidoTotal > 0 ? Math.round((prof.bruto / producidoTotal) * 100) : 0;
              const esTop1 = index === 0 && prof.bruto > 0;

              return (
                <div 
                  key={prof.id} 
                  className={`bg-white border rounded-xl p-3 space-y-2 shadow-xs transition-all relative overflow-hidden ${
                    esTop1 ? 'border-blue-500 ring-2 ring-blue-400/20' : 'border-blue-200/80 hover:border-blue-300'
                  }`}
                >
                  {/* Etiqueta Top Trader */}
                  {esTop1 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-sky-400 text-white font-black text-[7px] px-2.5 py-0.5 rounded-bl-lg uppercase tracking-widest shadow-2xs">
                      👑 Top
                    </div>
                  )}

                  {/* Cabecera Compacta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-black text-[10px] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {prof.foto ? (
                          <img src={prof.foto} alt={prof.nombre} className="w-full h-full object-cover" />
                        ) : (
                          (prof.nombre || 'P').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 font-black text-[9px]">#{index + 1}</span>
                          <h5 className="font-black text-blue-950 text-[10px] uppercase tracking-wide truncate max-w-[110px]">{prof.nombre}</h5>
                        </div>
                        <p className="text-[8px] text-slate-400 uppercase truncate">{prof.especialidad || 'Barbero'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[8px] text-slate-400 block uppercase font-bold">Participación</span>
                      <span className="text-[10px] font-black text-blue-600">{isNaN(porcentajeParticipacion) ? 0 : porcentajeParticipacion}%</span>
                    </div>
                  </div>

                  {/* Gráfico Estilo Trading Compacto */}
                  <div className="space-y-1 bg-gradient-to-b from-sky-50/60 to-blue-50/40 p-2 rounded-lg border border-blue-200/50">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-600 font-bold">Volumen</span>
                      <strong className="text-blue-950 font-black">${(prof.bruto || 0).toLocaleString()}</strong>
                    </div>

                    <div className="w-full h-2 bg-white rounded-md overflow-hidden flex border border-blue-200 p-0.2 shadow-inner">
                      <div 
                        style={{ width: `${isNaN(porcentajeParticipacion) ? 0 : porcentajeParticipacion}%` }}
                        className="bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-400 h-full rounded-sm transition-all duration-700 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Métricas Compactas en Grid */}
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="bg-blue-50/40 border border-blue-100 p-1 rounded-lg">
                      <p className="text-[7px] text-slate-500 uppercase font-bold">Serv.</p>
                      <p className="text-[10px] font-black text-blue-950">{prof.totalCitas || 0}</p>
                    </div>
                    <div className="bg-blue-50/40 border border-blue-100 p-1 rounded-lg">
                      <p className="text-[7px] text-slate-500 uppercase font-bold">Com. ({prof.porcentajeBarbero}%)</p>
                      <p className="text-[10px] font-black text-blue-700">${(prof.pagoBarbero || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-200/60 p-1 rounded-lg">
                      <p className="text-[7px] text-emerald-700 uppercase font-bold">Neto</p>
                      <p className="text-[10px] font-black text-emerald-700">${(prof.netoTienda || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}