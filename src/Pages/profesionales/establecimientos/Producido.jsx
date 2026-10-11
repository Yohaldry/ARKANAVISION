import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, BarChart3, AlertTriangle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../components/firebase';

export default function Producido({ establecimientoId }) {
  const targetId = establecimientoId || auth.currentUser?.uid;

  const [citas, setCitas] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTiempo, setFiltroTiempo] = useState('mes');

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

      if (filtroTiempo === 'dia') {
        return fechaCita.toDateString() === ahora.toDateString();
      } else if (filtroTiempo === 'semana') {
        const unDiaMs = 24 * 60 * 60 * 1000;
        return Math.abs((ahora - fechaCita) / unDiaMs) <= 7;
      } else if (filtroTiempo === 'quincena') {
        const unDiaMs = 24 * 60 * 60 * 1000;
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

  const producidoTotal = citasFiltradas.reduce((acc, curr) => acc + Number(curr.precioTotal || curr.precio || 0), 0);

  const reporteProfesionales = profesionales.map(prof => {
    const citasProf = citasFiltradas.filter(c => 
      String(c.barberoId) === String(prof.id) || 
      (c.barberoName && prof.nombre && c.barberoName.toLowerCase().trim() === prof.nombre.toLowerCase().trim())
    );
    const brutoProf = citasProf.reduce((acc, curr) => acc + Number(curr.precioTotal || curr.precio || 0), 0);
    
    const porcentajeBarbero = Number(prof.comisionBarbero ?? prof.porcentaje ?? 60);
    const porcentajeTienda = 100 - porcentajeBarbero;

    const pagoBarbero = (brutoProf * porcentajeBarbero) / 100;
    const netoTiendaPorBarbero = (brutoProf * porcentajeTienda) / 100;

    return {
      ...prof,
      totalCitas: citasProf.length,
      bruto: brutoProf,
      porcentajeBarbero,
      pagoBarbero,
      netoTienda: netoTiendaPorBarbero
    };
  });

  const totalPagoBarberos = reporteProfesionales.reduce((acc, curr) => acc + curr.pagoBarbero, 0);
  const netoTiendaTotal = producidoTotal - totalPagoBarberos;

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-[11px] text-blue-600 flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Calculando métricas...
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono text-[11px] text-slate-800 animate-in fade-in duration-200 pb-12">
      
      {/* HEADER DE FILTROS DE TIEMPO */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-[10px]">Producido Financiero</h3>
            <p className="text-[9px] text-slate-500">Métricas en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 bg-blue-50/70 p-1 rounded-lg border border-blue-200 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'dia', label: 'Día' },
            { id: 'semana', label: 'Sem.' },
            { id: 'quincena', label: 'Quinc.' },
            { id: 'mes', label: 'Mes' },
            { id: 'anio', label: 'Año' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFiltroTiempo(tab.id)}
              className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md font-black uppercase text-[9px] transition-all cursor-pointer whitespace-nowrap ${
                filtroTiempo === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-2xs' 
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 RECUADROS EN COLUMNA DE 3 (UNO AL LADO DE OTRO) */}
      <div className="grid grid-cols-3 gap-2">
        
        {/* Recuadro 1 */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 text-white border border-blue-500 p-2.5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-sky-200 uppercase tracking-wider">Bruto</p>
            <div className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <DollarSign className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs sm:text-base font-black truncate">${producidoTotal.toLocaleString()}</p>
            <p className="text-[7px] text-sky-100">{citasFiltradas.length} serv.</p>
          </div>
        </div>

        {/* Recuadro 2 */}
        <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white border border-blue-200/80 p-2.5 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Neto Tienda</p>
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs sm:text-base font-black text-blue-950 truncate">${netoTiendaTotal.toLocaleString()}</p>
            <p className="text-[7px] text-emerald-600 font-bold">● Local</p>
          </div>
        </div>

        {/* Recuadro 3 */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 p-2.5 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Barberos</p>
            <div className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0">
              <Users className="w-3 h-3 text-sky-400" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs sm:text-base font-black text-sky-400 truncate">${totalPagoBarberos.toLocaleString()}</p>
            <p className="text-[7px] text-slate-400">Comis.</p>
          </div>
        </div>

      </div>

      {/* ANÁLISIS DE DISTRIBUCIÓN COMPACTO */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between border-b border-blue-100 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
              <TrendingUp className="w-3 h-3" />
            </div>
            <h4 className="font-black text-slate-900 uppercase text-[10px]">Distribución de Ingresos</h4>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[9px] font-bold">
            <span className="text-blue-900">Neto Tienda ({producidoTotal > 0 ? Math.round((netoTiendaTotal / producidoTotal) * 100) : 0}%)</span>
            <span className="text-slate-600">Comisiones ({producidoTotal > 0 ? Math.round((totalPagoBarberos / producidoTotal) * 100) : 0}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-blue-200/60 shadow-inner">
            <div 
              style={{ width: `${producidoTotal > 0 ? (netoTiendaTotal / producidoTotal) * 100 : 0}%` }}
              className="bg-gradient-to-r from-blue-600 to-sky-500 h-full transition-all duration-500"
            />
            <div 
              style={{ width: `${producidoTotal > 0 ? (totalPagoBarberos / producidoTotal) * 100 : 0}%` }}
              className="bg-gradient-to-r from-slate-800 to-blue-900 h-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* REPORTE POR PROFESIONAL */}
      <div className="bg-white border border-blue-200/80 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-3.5 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 uppercase text-[10px]">Rendimiento por Profesional ({reporteProfesionales.length})</h4>
        </div>

        {reporteProfesionales.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1.5">
            <Users className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
            <p className="font-bold text-slate-600 text-[10px]">No hay profesionales vinculados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-blue-50/40 border-b border-blue-200 text-blue-950 font-black text-[9px] uppercase tracking-wider">
                  <th className="p-3">Profesional</th>
                  <th className="p-3 text-center">Serv.</th>
                  <th className="p-3">Bruto</th>
                  <th className="p-3 text-center">Com.</th>
                  <th className="p-3 text-blue-700">Pago Barbero</th>
                  <th className="p-3 text-right text-emerald-700">Neto Tienda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 text-[10px]">
                {reporteProfesionales.map((prof) => (
                  <tr key={prof.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        {prof.foto ? (
                          <img src={prof.foto} alt={prof.nombre} className="w-full h-full object-cover" />
                        ) : (
                          (prof.nombre || 'P').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="truncate max-w-[110px]">
                        <p className="font-black text-slate-900 truncate">{prof.nombre}</p>
                        <p className="text-[8px] text-slate-500 truncate">{prof.especialidad || 'Barbero'}</p>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-700">{prof.totalCitas}</td>
                    <td className="p-3 font-black text-slate-900">${prof.bruto.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className="bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded-md font-bold text-[9px]">
                        {prof.porcentajeBarbero}%
                      </span>
                    </td>
                    <td className="p-3 font-bold text-blue-700">${prof.pagoBarbero.toLocaleString()}</td>
                    <td className="p-3 text-right font-black text-emerald-700">${prof.netoTienda.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}