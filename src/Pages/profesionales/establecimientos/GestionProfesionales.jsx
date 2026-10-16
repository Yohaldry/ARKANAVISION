import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Percent, Shield, CheckCircle2, AlertTriangle, X, Edit3, Heart, Award, GripVertical, Play, Clock, Calendar, Eye, EyeOff } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../../components/firebase';

export default function GestionProfesionales({ establecimientoId }) {
  const targetId = establecimientoId || auth.currentUser?.uid;

  const [profesionalesVinculados, setProfesionalesVinculados] = useState([]);
  const [citasEstablecimiento, setCitasEstablecimiento] = useState([]);
  const [serviciosEstablecimiento, setServiciosEstablecimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [precioManual, setPrecioManual] = useState('');
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr);
const [estadoCita, setEstadoCita] = useState('pendiente');
  // Drag & Drop States
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Modales
  const [modalVincularOpen, setModalVincularOpen] = useState(false);
  const [emailBusqueda, setEmailBusqueda] = useState('');
  const [comisionDefault, setComisionDefault] = useState('35');
  const [buscando, setBuscando] = useState(false);
  const [profesionalEncontrado, setProfesionalEncontrado] = useState(null);
  const [busquedaServicio, setBusquedaServicio] = useState('');
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [nuevoPorcentaje, setNuevoPorcentaje] = useState('');
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');

  const [modalDesvincularOpen, setModalDesvincularOpen] = useState(false);
  const [profesionalADesvincular, setProfesionalADesvincular] = useState(null);

  // Modal Alerta Eliminación Cita
  const [modalEliminarCitaOpen, setModalEliminarCitaOpen] = useState(false);
  const [citaAEliminarId, setCitaAEliminarId] = useState(null);

  // Modal Cita
  const [modalCitaOpen, setModalCitaOpen] = useState(false);
  const [editandoCitaId, setEditandoCitaId] = useState(null);
  const [profesionalParaCita, setProfesionalParaCita] = useState(null);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteCodigo, setClienteCodigo] = useState('');
  const [serviciosSeleccionadosIndices, setServiciosSeleccionadosIndices] = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [esCorazon, setEsCorazon] = useState(false);
  const [guardandoCita, setGuardandoCita] = useState(false);

  // Modal Detalle Cita
  const [modalDetalleCitaOpen, setModalDetalleCitaOpen] = useState(false);
  const [citaDetalle, setCitaDetalle] = useState(null);

  // Función para cambiar el estado de la cita únicamente a "pagado" (ya no regresa a pendiente)
  const marcarComoPagado = async (e, cita) => {
    e.stopPropagation(); // Evita que se abra el modal de detalle al hacer clic en el botón
    if (cita.estado === 'pagado') return; // Si ya está pagado, no hace nada

    try {
      await updateDoc(doc(db, 'citas', cita.id), { estado: 'pagado' });
      setSuccessMsg('✅ Servicio marcado como pagado.');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      setErrorMsg('No se pudo actualizar el estado de pago.');
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  const toggleEstadoPago = async (e, cita) => {
    e.stopPropagation(); // Evita que se abra el modal de detalle al hacer clic en el botón
    const nuevoEstado = cita.estado === 'pagado' ? 'pendiente' : 'pagado';
    try {
      await updateDoc(doc(db, 'citas', cita.id), { estado: nuevoEstado });
      setSuccessMsg(nuevoEstado === 'pagado' ? '✅ Servicio marcado como pagado.' : '⚠️ Servicio marcado como pendiente.');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      setErrorMsg('No se pudo actualizar el estado de pago.');
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  useEffect(() => {
    if (!targetId) return;
    cargarDatos();
    const unsubCitas = onSnapshot(query(collection(db, 'citas'), where('establecimientoId', '==', targetId)), (snap) => {
      setCitasEstablecimiento(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubCitas();
  }, [targetId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const qProf = query(collection(db, 'profesionales'), where('establecimientoId', '==', targetId));
      const snapProf = await getDocs(qProf);
      
      let listaProf = snapProf.docs.map(d => ({ id: d.id, ...d.data() }));
      listaProf.sort((a, b) => (a.ordenLlegada ?? 99) - (b.ordenLlegada ?? 99));
      setProfesionalesVinculados(listaProf);

      const estSnap = await getDoc(doc(db, 'usuarios', targetId));
      if (estSnap.exists() && estSnap.data().servicios) {
        setServiciosEstablecimiento(estSnap.data().servicios);
      } else {
        const estAlt = await getDoc(doc(db, 'establecimientos', targetId));
        if (estAlt.exists() && estAlt.data().servicios) setServiciosEstablecimiento(estAlt.data().servicios);
      }
    } catch (err) {
      setErrorMsg('Error al cargar datos del establecimiento.');
    } finally {
      setLoading(false);
    }
  };

  const parsearPrecio = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(String(val).replace(/[^0-9]/g, '')) || 0;
  };

  const toggleDormido = async (prof) => {
    try {
      const nuevoEstadoDormido = !prof.dormido;
      const ref = doc(db, 'profesionales', prof.id);
      await updateDoc(ref, { dormido: nuevoEstadoDormido });
      
      setProfesionalesVinculados(prev => 
        prev.map(p => p.id === prof.id ? { ...p, dormido: nuevoEstadoDormido } : p)
      );
      setSuccessMsg(nuevoEstadoDormido ? `💤 ${prof.nombre.split(' ')[0]} en pausa.` : `⚡ ${prof.nombre.split(' ')[0]} activo.`);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      setErrorMsg('No se pudo actualizar el estado.');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const listaReordenada = [...profesionalesVinculados];
    const [itemArrastrado] = listaReordenada.splice(draggedIndex, 1);
    listaReordenada.splice(dropIndex, 0, itemArrastrado);

    setProfesionalesVinculados(listaReordenada);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      const promesas = listaReordenada.map((prof, idx) => {
        const ref = doc(db, 'profesionales', prof.id);
        return updateDoc(ref, { ordenLlegada: idx + 1 });
      });
      await Promise.all(promesas);
    } catch (err) {
      setErrorMsg('No se pudo guardar el orden.');
    }
  };

  const toggleServicioSeleccionado = (idx) => {
    setServiciosSeleccionadosIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const guardarCitaProfesional = async (e) => {
    e.preventDefault();
    if (!profesionalParaCita || serviciosSeleccionadosIndices.length === 0 || !clienteNombre.trim()) {
      setErrorMsg('Complete cliente y servicios.');
      return;
    }

    try {
      setGuardandoCita(true);
      const ahora = new Date();
      const horaStr = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      
      const serviciosObjList = serviciosSeleccionadosIndices.map(i => serviciosEstablecimiento[i]);
      const precioBaseSuma = serviciosObjList.reduce((acc, s) => acc + parsearPrecio(s?.precio || s?.costo), 0);
      const precioTotal = precioManual !== '' ? parsearPrecio(precioManual) : precioBaseSuma;
      const nombresServicios = serviciosObjList.map(s => s?.nombre || s?.titulo || 'Servicio').join(', ');
      
      const porc = Number(profesionalParaCita.porcentaje ?? profesionalParaCita.comisionBarbero ?? 35);
      const valorComision = (precioTotal * porc) / 100;

      const citaData = {
        establecimientoId: targetId,
        barberoId: profesionalParaCita.id,
        barberoNombre: profesionalParaCita.nombre,
        clienteNombre: clienteNombre.trim(),
        clienteCodigo: clienteCodigo.trim() || 'N/A',
        servicio: nombresServicios,
        serviciosIndices: serviciosSeleccionadosIndices,
        precioTotal,
        comisionPorcentaje: porc,
        valorComision,
        metodoPago,
        esCorazon: Boolean(esCorazon),
        fecha: fechaSeleccionada,
        estado: estadoCita || 'pendiente',
        hora: horaStr,
        updatedAt: ahora.toISOString(),
        estado: 'completada'
      };

      if (editandoCitaId) {
        await updateDoc(doc(db, 'citas', editandoCitaId), citaData);
        setSuccessMsg('¡Actualizado!');
      } else {
        citaData.createdAt = ahora.toISOString();
        await addDoc(collection(db, 'citas'), citaData);
        setSuccessMsg('¡Registrado!');
      }

      setModalCitaOpen(false);
      setEditandoCitaId(null);
      setClienteNombre('');
      setClienteCodigo('');
      setServiciosSeleccionadosIndices([]);
      setPrecioManual('');
      setEsCorazon(false);
      setProfesionalParaCita(null);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      setErrorMsg('Error al guardar.');
    } finally {
      setGuardandoCita(false);
    }
  };

  const eliminarCita = async () => {
    if (!citaAEliminarId) return;
    try {
      await deleteDoc(doc(db, 'citas', citaAEliminarId));
      setSuccessMsg('Eliminado.');
      setModalEliminarCitaOpen(false);
      setCitaAEliminarId(null);
      if (modalDetalleCitaOpen) setModalDetalleCitaOpen(false);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      setErrorMsg('Error al eliminar.');
    }
  };

  const profesionalesActivos = profesionalesVinculados.filter(p => !p.dormido);

  const profesionalesConMetricas = profesionalesActivos.map(prof => {
    const porcentaje = prof.porcentaje ?? prof.comisionBarbero ?? 35;
    
    const citasProfRaw = citasEstablecimiento
      .filter(c => String(c.barberoId || c.barberId || '') === String(prof.id) && (c.fecha || c.createdAt?.split('T')[0]) === fechaSeleccionada)
      .sort((a, b) => new Date(a.createdAt || a.fecha || 0) - new Date(b.createdAt || b.fecha || 0));

    let contadorNormal = 0;
    const citasProf = citasProfRaw.map(cita => {
      if (cita.esCorazon) {
        return { ...cita, numeroTurnoNormal: null };
      } else {
        contadorNormal += 1;
        return { ...cita, numeroTurnoNormal: contadorNormal };
      }
    });

    const totalVentasHoy = citasProf.reduce((acc, c) => acc + parsearPrecio(c.precioTotal || c.precio), 0);
    const totalComisionHoy = citasProf.reduce((acc, c) => acc + (c.valorComision ? Number(c.valorComision) : (parsearPrecio(c.precioTotal) * porcentaje) / 100), 0);
    const turnosNormales = citasProf.filter(c => !c.esCorazon);
    
    return { ...prof, porcentaje, citasProf, totalVentasHoy, totalComisionHoy, turnosNormalesCount: turnosNormales.length };
  });

  const profesionalesPorVentas = [...profesionalesConMetricas].sort((a, b) => b.totalVentasHoy - a.totalVentasHoy);

  let siguienteTurno = null;
  if (profesionalesActivos.length > 0) {
    const colaTurnos = [...profesionalesConMetricas].sort((a, b) => {
      if (a.turnosNormalesCount !== b.turnosNormalesCount) return a.turnosNormalesCount - b.turnosNormalesCount;
      return (a.ordenLlegada ?? 99) - (b.ordenLlegada ?? 99);
    });
    siguienteTurno = colaTurnos[0];
  }

  if (loading) {
    return <div className="p-6 text-center text-xs text-blue-600 animate-pulse" style={{ fontFamily: 'Arial, sans-serif' }}>Cargando profesionales...</div>;
  }

  return (
    <div className="space-y-3 text-[11px] text-slate-800 pb-8 px-2 sm:px-4 bg-slate-50 min-h-screen" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Estilo CSS inyectado para el destello suave verde */}
      <style>{`
        @keyframes destelloVerde {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); border-color: rgba(16, 185, 129, 0.6); }
          50% { box-shadow: 0 0 15px 4px rgba(16, 185, 129, 0.35); border-color: rgba(16, 185, 129, 1); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); border-color: rgba(16, 185, 129, 0.6); }
        }
        .card-en-turno {
          animation: destelloVerde 2.5s infinite ease-in-out;
        }
      `}</style>

      {successMsg && <div className="p-2 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-950 text-[10px] flex gap-1.5 items-center shadow-2xs"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /><span className="font-bold">{successMsg}</span></div>}
      {errorMsg && <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 text-[10px] flex gap-1.5 items-center shadow-2xs"><AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" /><span className="font-bold">{errorMsg}</span></div>}

      {/* 1. GESTIÓN DE TURNOS Y PRODUCCIÓN (CABECERA SUPERIOR) */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xs">
        <div>
          <h3 className="text-xs font-bold uppercase text-blue-950">Gestión de Turnos y Producción</h3>
          <p className="text-[10px] text-slate-600">Fecha seleccionada: <strong className="text-blue-700">{fechaSeleccionada}</strong></p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <input 
              type="date" 
              value={fechaSeleccionada} 
              onChange={(e) => setFechaSeleccionada(e.target.value)} 
              className="bg-transparent text-[10px] font-bold text-blue-950 outline-none cursor-pointer"
            />
          </div>

          <button onClick={() => { setModalVincularOpen(true); setProfesionalEncontrado(null); setEmailBusqueda(''); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase shadow-2xs flex items-center gap-1.5 cursor-pointer">
            <UserPlus className="w-3.5 h-3.5" /> Vincular
          </button>
        </div>
      </div>

      {/* 2. NÓMINA ACTIVA (PRIMERO) */}
    <div className="bg-gradient-to-b from-sky-50 via-white to-sky-50 border border-blue-200 rounded-xl shadow-2xs overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="px-3.5 py-2 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white flex items-center justify-between">
        <h4 className="font-bold uppercase text-xs tracking-wide">Nómina Activa ({profesionalesPorVentas.length})</h4>
        <span className="text-[9px] text-sky-100 font-bold">🏆 Ventas del día</span>
      </div>

      {profesionalesPorVentas.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-[10px]">No hay profesionales activos en nómina.</div>
      ) : (
        <div className="p-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {profesionalesPorVentas.map((prof, idx) => {
              const esProximoTurno = siguienteTurno && String(siguienteTurno.id) === String(prof.id);

              return (
                <div 
                  key={prof.id} 
                  className={`bg-white border rounded-xl p-2.5 flex flex-col justify-between transition-all relative shadow-2xs ${
                    esProximoTurno 
                      ? 'card-en-turno ring-2 ring-emerald-400/20' 
                      : 'border-blue-200 hover:border-blue-400'
                  }`}
                >
                  {esProximoTurno ? (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-[8px] px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1 border border-white uppercase tracking-wider">
                      <Play className="w-2.5 h-2.5 fill-white" /> En Turno
                    </div>
                  ) : (
                    <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">
                      #{idx + 1}
                    </div>
                  )}

                  <div>
                    {/* Cabecera Tarjeta */}
                    <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-sky-100 mt-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                          esProximoTurno ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-gradient-to-tr from-sky-400 to-blue-600 text-white border-blue-300'
                        }`}>
                          {prof.foto ? <img src={prof.foto} alt="" className="w-full h-full object-cover rounded-lg" /> : prof.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-blue-950 text-xs truncate uppercase">{prof.nombre}</h5>
                          <span className="text-[8px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold border border-blue-100">Comisión: {prof.porcentaje}%</span>
                        </div>
                      </div>

                      {/* Botón Registrar Cita */}
                      <button 
                        onClick={() => { setProfesionalParaCita(prof); setEditandoCitaId(null); setClienteNombre(''); setClienteCodigo(''); setServiciosSeleccionadosIndices([]); setPrecioManual(''); setEsCorazon(false); setModalCitaOpen(true); }}
                        className="w-7 h-7 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg font-bold text-sm flex items-center justify-center shadow-2xs transition-all cursor-pointer shrink-0"
                        title="Registrar cita"
                      >
                        +
                      </button>
                    </div>

                    {/* Ventas y Comisión */}
                    <div className="grid grid-cols-2 gap-1.5 my-2 bg-sky-50/60 p-1.5 rounded-lg border border-sky-100 text-center">
                      <div><p className="text-[8px] font-bold text-slate-500 uppercase">Ventas</p><p className="text-[11px] font-bold text-blue-950">${prof.totalVentasHoy.toLocaleString()}</p></div>
                      <div><p className="text-[8px] font-bold text-slate-500 uppercase">Comisión</p><p className="text-[11px] font-bold text-emerald-700">${prof.totalComisionHoy.toLocaleString()}</p></div>
                    </div>

                    {/* Lista Citas Corta con Estado de Pago (Amarillo/Verde) */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Servicios ({prof.citasProf.length})</span>
                      <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-thin" onClick={e => e.stopPropagation()}>
                        {prof.citasProf.length > 0 ? prof.citasProf.map(cita => {
                          const esPagado = cita.estado === 'pagado';

                          return (
                            <div 
                              key={cita.id} 
                              onClick={() => { setCitaDetalle({ ...cita, profesionalNombre: prof.nombre, porcentajeProf: prof.porcentaje }); setModalDetalleCitaOpen(true); }} 
                              className={`border rounded-md px-2 py-1 text-[9px] flex items-center justify-between cursor-pointer shadow-3xs transition-all ${
                                esPagado 
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                                  : 'bg-amber-50 border-amber-300 text-amber-950'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {cita.esCorazon ? (
                                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" title="Corazón" />
                                ) : (
                                  <span className="bg-blue-600 text-white font-bold text-[8px] px-1 py-0.2 rounded shrink-0">#{cita.numeroTurnoNormal}</span>
                                )}
                                <span className="font-bold truncate max-w-[45px]" title={cita.servicio}>{cita.servicio}</span>
                                
                                <span className="text-[8px] bg-white/80 px-1 py-0.2 rounded font-bold border border-slate-200 shrink-0" title={`Pago: ${cita.metodoPago || 'efectivo'}`}>
                                  {cita.metodoPago === 'tarjeta' ? '💳' : '💵'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                <span className="font-bold text-[10px]">${parsearPrecio(cita.precioTotal).toLocaleString()}</span>
                                
                                {/* 🟡/🟢 Botón de estado (Chulito interactivo que solo marca como pagado) */}
                                <button
                                  type="button"
                                  onClick={(e) => marcarComoPagado(e, cita)}
                                  title={esPagado ? "Ya está pagado" : "Pendiente (clic para marcar como pagado)"}
                                  disabled={esPagado}
                                  className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] transition-all ${
                                    esPagado 
                                      ? 'bg-emerald-600 text-white cursor-default shadow-2xs' 
                                      : 'bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-2xs animate-pulse cursor-pointer'
                                  }`}
                                >
                                  ✓
                                </button>

                                <button onClick={(e) => { e.stopPropagation(); setProfesionalParaCita(prof); setEditandoCitaId(cita.id); setClienteNombre(cita.clienteNombre); setClienteCodigo(cita.clienteCodigo || ''); setMetodoPago(cita.metodoPago || 'efectivo'); setEsCorazon(Boolean(cita.esCorazon)); setServiciosSeleccionadosIndices(cita.serviciosIndices || []); setPrecioManual(cita.precioTotal ? String(cita.precioTotal) : ''); setModalCitaOpen(true); }} className="text-blue-600 hover:text-blue-800 p-0.5">✏️</button>
                                <button onClick={(e) => { e.stopPropagation(); setCitaAEliminarId(cita.id); setModalEliminarCitaOpen(true); }} className="text-rose-600 hover:text-rose-800 p-0.5">🗑️</button>
                              </div>
                            </div>
                          );
                        }) : <div className="text-center py-2 text-slate-400 text-[9px] italic border border-dashed border-sky-200 rounded-lg">Sin registros hoy</div>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-sky-100 flex gap-1.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setProfesionalSeleccionado(prof); setNuevoPorcentaje(String(prof.porcentaje)); setNuevaEspecialidad(prof.especialidad || ''); setModalEditarOpen(true); }} className="flex-1 bg-sky-50 hover:bg-sky-100 text-blue-900 py-1 rounded-md text-[9px] font-bold flex items-center justify-center gap-1 border border-sky-200"><Edit3 className="w-3 h-3" /> Config</button>
                    <button onClick={() => { setProfesionalADesvincular(prof); setModalDesvincularOpen(true); }} className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-1 rounded-md border border-rose-200"><UserMinus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

      {/* 3. ORDEN DE LLEGADA Y PRÓXIMO TURNO EN LA FILA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        
        {/* Orden de Llegada (Bidireccional) */}
        <div className="lg:col-span-2 bg-white border border-blue-200 rounded-xl shadow-2xs p-2.5 space-y-1.5">
          <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
            <h4 className="font-bold uppercase text-[10px] text-blue-950 flex items-center gap-1">
              📋 Orden de Llegada & Pausa (Ojos)
            </h4>
            <span className="text-[9px] text-blue-700">Arrastra para ordenar</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {profesionalesVinculados.map((prof, index) => {
              const esPrimero = index === 0 && !prof.dormido;
              const esArrastrado = draggedIndex === index;
              const estaDormido = Boolean(prof.dormido);

              return (
                <div
                  key={prof.id}
                  draggable={!estaDormido}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                  className={`transition-all flex items-center gap-1.5 rounded-lg px-2.5 py-1 select-none border text-[10px] ${
                    estaDormido 
                      ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60' 
                      : esPrimero 
                        ? 'bg-emerald-500 border-emerald-400 text-white font-bold shadow-2xs' 
                        : 'bg-white hover:bg-sky-50 border-blue-200 text-blue-950 font-bold'
                  } ${esArrastrado ? 'opacity-30' : ''}`}
                >
                  {!estaDormido && <GripVertical className={`w-3.5 h-3.5 ${esPrimero ? 'text-emerald-100' : 'text-blue-400'} shrink-0 cursor-grab`} />}
                  <span className={`w-4 h-4 rounded-full font-bold text-[8px] flex items-center justify-center shrink-0 ${
                    estaDormido ? 'bg-slate-300 text-white' : esPrimero ? 'bg-white text-emerald-700' : 'bg-blue-600 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="truncate max-w-[90px] uppercase">{prof.nombre}</span>
                  
                  {/* Botón Ojito */}
                  <button
                    type="button"
                    onClick={() => toggleDormido(prof)}
                    title={estaDormido ? "Activar" : "Pausar"}
                    className={`p-0.5 rounded-md transition-colors cursor-pointer ml-1 ${
                      estaDormido ? 'bg-slate-200 text-slate-600' : esPrimero ? 'bg-emerald-600 text-white' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {estaDormido ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximo Turno en la Fila */}
        <div className="bg-white border border-blue-200 rounded-xl shadow-2xs p-2.5 flex flex-col justify-center gap-2">
          {siguienteTurno ? (
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-2.5 rounded-lg shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[8px] text-sky-100 uppercase font-bold">Próximo Turno en Fila</p>
                <h5 className="text-[11px] font-bold uppercase truncate max-w-[130px]">{siguienteTurno.nombre}</h5>
              </div>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-bold">⚡ Activo</span>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-[9px] italic">Sin cola activa</div>
          )}
        </div>

      </div>

      {/* MODAL DETALLE CITA */}
      {modalDetalleCitaOpen && citaDetalle && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-gradient-to-b from-sky-50 via-white to-blue-50 border border-blue-300 rounded-xl w-full max-w-xs p-3.5 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b pb-1.5"><h3 className="font-bold text-blue-900 text-xs">Detalle del Servicio</h3><button onClick={() => setModalDetalleCitaOpen(false)} className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button></div>
            <div className="bg-white border border-sky-200 p-2.5 rounded-lg space-y-1.5 text-[10px]">
              <div className="flex justify-between"><span>Profesional:</span><strong className="text-blue-950">{citaDetalle.profesionalNombre}</strong></div>
              <div className="flex justify-between"><span>Servicios:</span><strong className="text-blue-700">{citaDetalle.servicio}</strong></div>
              <div className="flex justify-between items-center">
                <span>Cliente:</span>
                <strong>{citaDetalle.clienteNombre} {(citaDetalle.clienteCodigo || citaDetalle.codigo) && `(${citaDetalle.clienteCodigo || citaDetalle.codigo})`}</strong>
              </div>
              <div className="flex justify-between"><span>Fecha / Hora:</span><strong className="text-blue-900">{citaDetalle.fecha} ({citaDetalle.hora || 'N/A'})</strong></div>
              <div className="flex justify-between"><span>Turno:</span><strong className={citaDetalle.esCorazon ? 'text-rose-600' : 'text-blue-700'}>{citaDetalle.esCorazon ? '💖 Corazón' : `#${citaDetalle.numeroTurnoNormal}`}</strong></div>
            </div>
            <div className="bg-blue-600 text-white rounded-lg p-2.5 space-y-0.5">
              <div className="flex justify-between text-[10px]"><span>Total:</span><strong>${parsearPrecio(citaDetalle.precioTotal).toLocaleString()}</strong></div>
              <div className="flex justify-between text-[10px]"><span>Comisión ({citaDetalle.porcentajeProf}%):</span><strong className="text-sky-200">${(citaDetalle.valorComision || (parsearPrecio(citaDetalle.precioTotal) * citaDetalle.porcentajeProf) / 100).toLocaleString()}</strong></div>
            </div>
            <div className="flex gap-2 pt-1"><button onClick={() => setModalDetalleCitaOpen(false)} className="flex-1 bg-slate-200 py-1.5 rounded-lg text-[10px] font-bold">Cerrar</button><button onClick={() => { setCitaAEliminarId(citaDetalle.id); setModalEliminarCitaOpen(true); }} className="bg-rose-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold">Eliminar</button></div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR CITA */}
      {modalEliminarCitaOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-blue-200 rounded-xl w-full max-w-xs p-3.5 text-center space-y-2 shadow-lg">
            <h3 className="font-bold text-xs uppercase text-rose-600">Eliminar Registro</h3>
            <p className="text-[10px] text-slate-600">¿Deseas eliminar este servicio?</p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setModalEliminarCitaOpen(false); setCitaAEliminarId(null); }} className="flex-1 bg-slate-200 py-1.5 rounded-lg text-[10px] font-bold">Cancelar</button>
              <button onClick={eliminarCita} className="flex-1 bg-rose-600 text-white py-1.5 rounded-lg text-[10px] font-bold">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR / EDITAR CITA */}
      {modalCitaOpen && profesionalParaCita && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-blue-300 rounded-xl w-full max-w-md p-4 space-y-3 shadow-xl" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-bold text-blue-900 uppercase text-xs">{editandoCitaId ? 'Modificar Registro' : 'Asignar Servicio'}</h3>
                <p className="text-[9px] text-slate-500">Colaborador: <strong className="text-blue-900">{profesionalParaCita.nombre}</strong></p>
              </div>
              <button onClick={() => setModalCitaOpen(false)} className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>

            <form onSubmit={guardarCitaProfesional} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-0.5">Cliente</label>
                  <input type="text" required placeholder="Nombre" value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} className="w-full bg-white border border-sky-300 rounded-lg px-2 py-1.5 text-[11px]" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-0.5">Cédula / ID</label>
                  <input type="text" placeholder="Código" value={clienteCodigo} onChange={e => setClienteCodigo(e.target.value)} className="w-full bg-white border border-sky-300 rounded-lg px-2 py-1.5 text-[11px]" />
                </div>
              </div>

              {/* Selección de Servicios */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 text-[9px] uppercase">Servicios</label>
                <input 
                  type="text" 
                  placeholder="🔍 Buscar servicio..." 
                  value={busquedaServicio} 
                  onChange={e => setBusquedaServicio(e.target.value)} 
                  className="w-full bg-white border border-sky-300 rounded-lg px-2 py-1.5 text-[11px]"
                />

                <div className="max-h-28 overflow-y-auto space-y-1 border border-sky-200 rounded-lg p-1.5 bg-slate-50">
                  {serviciosEstablecimiento.length > 0 ? (
                    serviciosEstablecimiento
                      .map((srv, idx) => ({ srv, idx }))
                      .filter(({ srv }) => (srv.nombre || srv.titulo || '').toLowerCase().includes(busquedaServicio.toLowerCase()))
                      .map(({ srv, idx }) => {
                        const sel = serviciosSeleccionadosIndices.includes(idx);
                        return (
                          <div 
                            key={idx} 
                            onClick={() => { toggleServicioSeleccionado(idx); setBusquedaServicio(''); }} 
                            className={`p-1.5 rounded-md border flex items-center justify-between cursor-pointer text-[10px] ${
                              sel ? 'bg-blue-100 border-blue-400 text-blue-950 font-bold' : 'bg-white hover:bg-sky-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{srv.nombre || srv.titulo}</span>
                            <span className="font-bold text-blue-700">${parsearPrecio(srv.precio || srv.costo).toLocaleString()}</span>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-2 text-slate-400 text-[10px]">Sin servicios registrados.</div>
                  )}
                </div>

                {serviciosSeleccionadosIndices.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {serviciosSeleccionadosIndices.map(idx => {
                      const srv = serviciosEstablecimiento[idx];
                      return (
                        <div key={idx} className="bg-blue-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                          <span>{srv?.nombre || srv?.titulo}</span>
                          <button type="button" onClick={() => toggleServicioSeleccionado(idx)} className="cursor-pointer">✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* OPCIONES DE PAGO, ESTADO Y CORAZÓN */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-0.5">Pago</label>
                  <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="w-full bg-white border border-sky-300 rounded-lg px-2 py-1.5 text-[11px] font-bold">
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-0.5">Estado</label>
                  <select value={estadoCita} onChange={e => setEstadoCita(e.target.value)} className="w-full bg-white border border-sky-300 rounded-lg px-2 py-1.5 text-[11px] font-bold text-amber-700">
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-1.5 cursor-pointer bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg w-full text-[10px]">
                  <input type="checkbox" checked={esCorazon} onChange={e => setEsCorazon(e.target.checked)} className="accent-rose-600 w-3.5 h-3.5" />
                  <span className="font-bold text-slate-800">💖 Turno de Corazón</span>
                </label>
              </div>

              {/* Total modificable y cálculo automático */}
              {serviciosSeleccionadosIndices.length > 0 && (
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 text-[10px] space-y-1.5">
                  {(() => {
                    const totalBase = serviciosSeleccionadosIndices.reduce((acc, i) => acc + parsearPrecio(serviciosEstablecimiento[i]?.precio || serviciosEstablecimiento[i]?.costo), 0);
                    const totalFinal = precioManual !== '' ? parsearPrecio(precioManual) : totalBase;
                    const com = (totalFinal * Number(profesionalParaCita.porcentaje || 0)) / 100;

                    return (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold uppercase text-slate-700">Total ($):</span>
                          <input 
                            type="number" 
                            value={precioManual !== '' ? precioManual : totalBase} 
                            onChange={(e) => setPrecioManual(e.target.value)}
                            className="w-32 bg-white border border-sky-400 rounded px-2 py-1 text-[11px] font-bold text-blue-950 text-right outline-none"
                            placeholder={totalBase}
                          />
                        </div>
                        <div className="flex justify-between border-t border-sky-200 pt-1">
                          <span className="font-bold text-slate-700">Comisión ({profesionalParaCita.porcentaje}%):</span>
                          <strong className="text-blue-700">${isNaN(com) ? 0 : com.toLocaleString()}</strong>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setModalCitaOpen(false)} className="flex-1 bg-slate-200 py-2 rounded-lg text-[10px] font-bold">Cancelar</button>
                <button type="submit" disabled={guardandoCita || serviciosSeleccionadosIndices.length === 0} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg text-[10px] disabled:opacity-50">
                  {guardandoCita ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VINCULAR */}
      {modalVincularOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border rounded-xl w-full max-w-xs p-3.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b pb-1.5"><h3 className="font-bold text-xs">Vincular Profesional</h3><button onClick={() => setModalVincularOpen(false)} className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button></div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!emailBusqueda) return;
              setBuscando(true);
              try {
                const snap = await getDocs(query(collection(db, 'profesionales'), where('email', '==', emailBusqueda.trim().toLowerCase())));
                if (!snap.empty) setProfesionalEncontrado({ id: snap.docs[0].id, ...snap.docs[0].data() });
                else setErrorMsg('No encontrado.');
              } catch (err) { setErrorMsg('Error'); } finally { setBuscando(false); }
            }} className="space-y-2">
              <div><label className="block text-[9px] font-bold uppercase mb-0.5">Correo</label><div className="flex gap-1.5"><input type="email" required placeholder="correo@ejemplo.com" value={emailBusqueda} onChange={e => setEmailBusqueda(e.target.value)} className="flex-1 bg-white border rounded-lg px-2 py-1.5 text-[11px]" /><button type="submit" className="bg-blue-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px]">Buscar</button></div></div>
            </form>
            {profesionalEncontrado && (
              <div className="bg-sky-50 p-2.5 rounded-lg space-y-2 border border-sky-200">
                <p className="font-bold text-[11px]">{profesionalEncontrado.nombre}</p>
                <div><label className="block text-[9px] font-bold uppercase mb-0.5">Comisión (%)</label><input type="number" value={comisionDefault} onChange={e => setComisionDefault(e.target.value)} className="w-full bg-white border rounded-lg p-1.5 text-[11px]" /></div>
                <button onClick={async () => {
                  const nuevoOrden = profesionalesVinculados.length + 1;
                  await setDoc(doc(db, 'profesionales', profesionalEncontrado.id), { establecimientoId: targetId, porcentaje: Number(comisionDefault) || 35, comisionBarbero: Number(comisionDefault) || 35, ordenLlegada: nuevoOrden, vinculadoEn: new Date().toISOString() }, { merge: true });
                  setSuccessMsg('¡Vinculado!'); setModalVincularOpen(false); cargarDatos(); setTimeout(() => setSuccessMsg(''), 2000);
                }} className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg text-[10px] uppercase">Confirmar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL EDITAR COMISIÓN */}
      {modalEditarOpen && profesionalSeleccionado && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border rounded-xl w-full max-w-xs p-3.5 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b pb-1.5"><h3 className="font-bold text-xs">Configurar</h3><button onClick={() => setModalEditarOpen(false)} className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button></div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await updateDoc(doc(db, 'profesionales', profesionalSeleccionado.id), { porcentaje: Number(nuevoPorcentaje) || 35, comisionBarbero: Number(nuevoPorcentaje) || 35, especialidad: nuevaEspecialidad.trim() || 'Barbero' });
              setSuccessMsg('Actualizado.'); setModalEditarOpen(false); cargarDatos(); setTimeout(() => setSuccessMsg(''), 2000);
            }} className="space-y-2">
              <div><label className="block text-[9px] font-bold uppercase mb-0.5">Comisión (%)</label><input type="number" value={nuevoPorcentaje} onChange={e => setNuevoPorcentaje(e.target.value)} className="w-full bg-white border rounded-lg p-1.5 text-[11px]" required /></div>
              <div><label className="block text-[9px] font-bold uppercase mb-0.5">Especialidad</label><input type="text" value={nuevaEspecialidad} onChange={e => setNuevaEspecialidad(e.target.value)} className="w-full bg-white border rounded-lg p-1.5 text-[11px]" /></div>
              <div className="flex gap-2"><button type="button" onClick={() => setModalEditarOpen(false)} className="flex-1 bg-slate-200 py-1.5 rounded-lg text-[10px] font-bold">Cancelar</button><button type="submit" className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-[10px] font-bold">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DESVINCULAR */}
      {modalDesvincularOpen && profesionalADesvincular && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border rounded-xl w-full max-w-xs p-3.5 text-center space-y-2.5 shadow-lg">
            <h3 className="font-bold text-xs uppercase text-rose-600">Desvincular</h3>
            <p className="text-[10px]">¿Deseas desvincular a <strong>{profesionalADesvincular.nombre}</strong>?</p>
            <div className="flex gap-2"><button onClick={() => setModalDesvincularOpen(false)} className="flex-1 bg-slate-100 py-1.5 rounded-lg text-[10px] font-bold">Cancelar</button><button onClick={async () => {
              await updateDoc(doc(db, 'profesionales', profesionalADesvincular.id), { establecimientoId: null, ordenLlegada: null });
              setSuccessMsg('Desvinculado.'); setModalDesvincularOpen(false); cargarDatos(); setTimeout(() => setSuccessMsg(''), 2000);
            }} className="flex-1 bg-rose-600 text-white py-1.5 rounded-lg text-[10px] font-bold">Desvincular</button></div>
          </div>
        </div>
      )}

    </div>
  );
}