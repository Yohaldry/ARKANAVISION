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

  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr);

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

  // Modal Alerta Eliminación Cita (Visarka Style)
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

  // Función para alternar estado dormido / activo del profesional
  const toggleDormido = async (prof) => {
    try {
      const nuevoEstadoDormido = !prof.dormido;
      const ref = doc(db, 'profesionales', prof.id);
      await updateDoc(ref, { dormido: nuevoEstadoDormido });
      
      setProfesionalesVinculados(prev => 
        prev.map(p => p.id === prof.id ? { ...p, dormido: nuevoEstadoDormido } : p)
      );
      setSuccessMsg(nuevoEstadoDormido ? `💤 ${profesionalNombreCorto(prof.nombre)} puesto a dormir.` : `⚡ ${profesionalNombreCorto(prof.nombre)} activado.`);
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg('No se pudo actualizar el estado del profesional.');
    }
  };

  const profesionalNombreCorto = (nombre) => nombre ? nombre.split(' ')[0] : '';

  // HANDLERS DRAG AND DROP BIDIRECCIONAL
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
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
      setSuccessMsg('Nuevo orden de llegada guardado.');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg('No se pudo guardar el nuevo orden.');
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
      setErrorMsg('Complete el cliente y seleccione al menos un servicio.');
      return;
    }

    try {
      setGuardandoCita(true);
      const ahora = new Date();
      const horaStr = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      
      const serviciosObjList = serviciosSeleccionadosIndices.map(i => serviciosEstablecimiento[i]);
      const precioTotal = serviciosObjList.reduce((acc, s) => acc + parsearPrecio(s?.precio || s?.costo), 0);
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
        hora: horaStr,
        updatedAt: ahora.toISOString(),
        estado: 'completada'
      };

      if (editandoCitaId) {
        await updateDoc(doc(db, 'citas', editandoCitaId), citaData);
        setSuccessMsg('¡Servicio actualizado exitosamente!');
      } else {
        citaData.createdAt = ahora.toISOString();
        await addDoc(collection(db, 'citas'), citaData);
        setSuccessMsg(`¡Servicio registrado para ${profesionalParaCita.nombre}!`);
      }

      setModalCitaOpen(false);
      setEditandoCitaId(null);
      setClienteNombre('');
      setClienteCodigo('');
      setServiciosSeleccionadosIndices([]);
      setEsCorazon(false);
      setProfesionalParaCita(null);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg('No se pudo guardar el registro.');
    } finally {
      setGuardandoCita(false);
    }
  };

  const eliminarCita = async () => {
    if (!citaAEliminarId) return;
    try {
      await deleteDoc(doc(db, 'citas', citaAEliminarId));
      setSuccessMsg('Registro eliminado.');
      setModalEliminarCitaOpen(false);
      setCitaAEliminarId(null);
      if (modalDetalleCitaOpen) setModalDetalleCitaOpen(false);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg('No se pudo eliminar.');
    }
  };

  // Filtrar solo profesionales activos (no dormidos) para nómina y turnos
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
      if (a.turnosNormalesCount !== b.turnosNormalesCount) {
        return a.turnosNormalesCount - b.turnosNormalesCount;
      }
      return (a.ordenLlegada ?? 99) - (b.ordenLlegada ?? 99);
    });
    siguienteTurno = colaTurnos[0];
  }

  const comisionPromedio = profesionalesVinculados.length > 0 ? Math.round(profesionalesVinculados.reduce((acc, c) => acc + (Number(c.porcentaje || c.comisionBarbero) || 35), 0) / profesionalesVinculados.length) : 0;

  if (loading) {
    return <div className="p-12 text-center font-mono text-xs text-blue-600 animate-pulse">Cargando módulo corporativo...</div>;
  }

  return (
    <div className="space-y-4 font-mono text-[11px] text-slate-800 pb-12 px-2 sm:px-6 bg-slate-50 min-h-screen">
      
      {successMsg && <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-[10px] flex gap-2 items-center shadow-xs"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /><span className="font-bold">{successMsg}</span></div>}
      {errorMsg && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[10px] flex gap-2 items-center shadow-xs"><AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" /><span className="font-bold">{errorMsg}</span></div>}

      {/* 3 TARJETAS RESUMEN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 border border-blue-200/80 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div><p className="text-[9px] font-bold text-blue-600 uppercase">Personal Vinculado</p><p className="text-base font-black text-blue-950 mt-0.5">{profesionalesActivos.length} Activos</p></div>
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20"><Users className="w-4 h-4" /></div>
        </div>
        <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 border border-blue-200/80 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
          <div><p className="text-[9px] font-bold text-blue-600 uppercase">Comisión Promedio</p><p className="text-base font-black text-blue-950 mt-0.5">{comisionPromedio}%</p></div>
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-400/20"><Percent className="w-4 h-4" /></div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 via-sky-500 to-blue-700 text-white border border-blue-400/30 p-3.5 rounded-2xl flex items-center justify-between shadow-md shadow-blue-600/20">
          <div><p className="text-[9px] font-bold text-sky-100 uppercase">Sistema Cloud</p><p className="text-base font-black text-white mt-0.5">Sincronizado</p></div>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30"><Shield className="w-4 h-4 text-white" /></div>
        </div>
      </div>

      {/* BARRA SIGUIENTE TURNO */}
      {siguienteTurno && (
        <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 text-white p-3.5 rounded-2xl shadow-md border border-sky-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 text-white"><Award className="w-5 h-5 text-sky-100 animate-pulse" /></div>
            <div>
              <p className="text-[9px] text-sky-100 font-bold uppercase">Próximo Turno en Fila (Según Orden de Llegada)</p>
              <h4 className="text-sm font-black uppercase text-white">{siguienteTurno.nombre} <span className="text-[9px] bg-blue-900/60 text-sky-200 px-2 py-0.5 rounded ml-1">{siguienteTurno.turnosNormalesCount} turnos normales</span></h4>
            </div>
          </div>
          <span className="text-[9px] bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 font-bold text-white">⚡ Cola Activa</span>
        </div>
      )}

      {/* APARTADO ORDEN DE LLEGADA CON BOTÓN DE OJITO PARA DORMIR / ACTIVAR */}
      <div className="bg-gradient-to-br from-sky-100 via-blue-50 to-sky-100 border border-blue-200/90 rounded-2xl shadow-sm p-3.5 space-y-2">
        <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
          <h4 className="font-black uppercase text-xs text-blue-950 flex items-center gap-1.5">
            📋 Orden de Llegada
          </h4>
          <span className="text-[9px] text-blue-700 font-bold">
            🖐️ Arrastra para ordenar | 👁️ Presiona el ojo para dormir/activar profesional
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {profesionalesVinculados.map((prof, index) => {
            const esPrimero = index === 0 && !prof.dormido;
            const esArrastrado = draggedIndex === index;
            const esTargetDrag = dragOverIndex === index && !esArrastrado;
            const estaDormido = Boolean(prof.dormido);

            return (
              <div
                key={prof.id}
                draggable={!estaDormido}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                className={`transition-all duration-200 ease-out flex items-center gap-2 rounded-xl px-3 py-1.5 shadow-xs select-none border ${
                  estaDormido 
                    ? 'bg-slate-200 border-slate-300 text-slate-500 opacity-60' 
                    : esPrimero 
                      ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white font-black shadow-md shadow-emerald-500/20 ring-2 ring-emerald-300/50' 
                      : 'bg-white hover:bg-sky-50 border-sky-300 text-blue-950 font-bold'
                } ${esArrastrado ? 'opacity-30 scale-95 border-blue-500' : ''} ${
                  esTargetDrag ? 'scale-105 border-blue-600 ring-2 ring-blue-400/50 translate-x-1' : ''
                }`}
              >
                {!estaDormido && <GripVertical className={`w-3.5 h-3.5 ${esPrimero ? 'text-emerald-100' : 'text-blue-500'} shrink-0 cursor-grab active:cursor-grabbing`} />}
                <span className={`w-4 h-4 rounded-full font-black text-[8px] flex items-center justify-center shrink-0 ${
                  estaDormido ? 'bg-slate-400 text-white' : esPrimero ? 'bg-white text-emerald-700' : 'bg-blue-600 text-white'
                }`}>
                  {index + 1}
                </span>
                <span className="text-[10px] truncate max-w-[100px] uppercase">{prof.nombre}</span>
                
                {/* 👁️ Botón del Ojito para Dormir / Activar */}
                <button
                  type="button"
                  onClick={() => toggleDormido(prof)}
                  title={estaDormido ? "Activar profesional" : "Poner a dormir"}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ml-1 ${
                    estaDormido 
                      ? 'bg-slate-300 text-slate-700 hover:bg-slate-400' 
                      : esPrimero 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {estaDormido ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CABECERA GENERAL CON SELECTOR DE FECHA */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-blue-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div>
          <h3 className="text-xs font-black uppercase text-blue-950">Gestión de Turnos y Producción</h3>
          <p className="text-[10px] text-slate-600">Visualizando registros del día: <strong className="text-blue-700">{fechaSeleccionada}</strong></p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-white border border-blue-300 rounded-xl px-3 py-1.5 shadow-xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <input 
              type="date" 
              value={fechaSeleccionada} 
              onChange={(e) => setFechaSeleccionada(e.target.value)} 
              className="bg-transparent text-xs font-bold text-blue-950 outline-none cursor-pointer"
            />
          </div>

          <button onClick={() => { setModalVincularOpen(true); setProfesionalEncontrado(null); setEmailBusqueda(''); }} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer">
            <UserPlus className="w-4 h-4" /> Vincular
          </button>
        </div>
      </div>

      {/* TARJETAS DE NÓMINA ACTIVA (SOLO PROFESIONALES ACTIVOS) */}
      <div className="bg-gradient-to-b from-sky-100/70 via-blue-50/50 to-sky-100/70 border border-blue-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white flex items-center justify-between">
          <h4 className="font-black uppercase text-[11px]">Nómina Activa ({profesionalesPorVentas.length})</h4>
          <span className="text-[9px] text-sky-100 font-bold">🏆 Ordenado por volumen de ventas ({fechaSeleccionada})</span>
        </div>

        {profesionalesPorVentas.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No hay profesionales activos en nómina (todos están dormidos o sin turnos).</div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {profesionalesPorVentas.map((prof, idx) => {
                const esProximoTurno = siguienteTurno && String(siguienteTurno.id) === String(prof.id);

                return (
                  <div 
                    key={prof.id} 
                    className={`bg-white border-2 rounded-2xl p-4 flex flex-col justify-between transition-all relative shadow-md ${
                      esProximoTurno 
                        ? 'border-emerald-500 ring-4 ring-emerald-400/30 shadow-emerald-500/20 scale-[1.02]' 
                        : 'border-blue-500 ring-4 ring-blue-400/15 hover:border-blue-600'
                    }`}
                  >
                    {esProximoTurno ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-black text-[8px] px-3 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white uppercase tracking-wider animate-bounce">
                        <Play className="w-2.5 h-2.5 fill-white" /> En Turno Actual
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full">
                        #{idx + 1}
                      </div>
                    )}

                    <div>
                      {/* CABECERA DE LA TARJETA CON EL BOTÓN VERDE GRANDE DE NUEVA CITA */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-sky-200/80 mt-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-11 h-11 rounded-xl font-black text-sm flex items-center justify-center shrink-0 border ${
                            esProximoTurno ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white ring-2 ring-emerald-400/30' : 'bg-gradient-to-tr from-sky-400 to-blue-600 text-white'
                          }`}>
                            {prof.foto ? <img src={prof.foto} alt="" className="w-full h-full object-cover rounded-xl" /> : prof.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-black text-blue-950 text-xs truncate uppercase">{prof.nombre}</h5>
                            <p className="text-[9px] text-blue-700 font-bold">{prof.especialidad || 'Barbero'}</p>
                            <span className={`inline-block mt-1 text-white px-2 py-0.5 rounded text-[8px] ${esProximoTurno ? 'bg-emerald-600' : 'bg-blue-600'}`}>Comisión: {prof.porcentaje}%</span>
                          </div>
                        </div>

                        {/* 🟢 BOTÓN VERDE GRANDE PARA AGREGAR CITA */}
                        <button 
                          onClick={() => { setProfesionalParaCita(prof); setEditandoCitaId(null); setClienteNombre(''); setClienteCodigo(''); setServiciosSeleccionadosIndices([]); setEsCorazon(false); setModalCitaOpen(true); }}
                          className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-black text-lg flex items-center justify-center shadow-md shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
                          title="Registrar nueva cita"
                        >
                          +
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 bg-sky-50/80 p-2 rounded-xl border border-sky-200 text-center">
                        <div><p className="text-[8px] font-bold text-slate-500 uppercase">Ventas</p><p className="text-[11px] font-black text-blue-950">${prof.totalVentasHoy.toLocaleString()}</p></div>
                        <div><p className="text-[8px] font-bold text-slate-500 uppercase">Comisión</p><p className="text-[11px] font-black text-emerald-700">${prof.totalComisionHoy.toLocaleString()}</p></div>
                      </div>

                      {/* LISTA DE CITAS */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-600 uppercase">Servicios Realizados ({prof.citasProf.length})</span>
                        <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin" onClick={e => e.stopPropagation()}>
                          {prof.citasProf.length > 0 ? prof.citasProf.map(cita => (
                            <div key={cita.id} onClick={() => { setCitaDetalle({ ...cita, profesionalNombre: prof.nombre, porcentajeProf: prof.porcentaje }); setModalDetalleCitaOpen(true); }} className="bg-white border border-sky-200 hover:border-blue-500 rounded-lg px-2 py-1.5 text-[9px] flex items-center justify-between shadow-3xs cursor-pointer">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {cita.esCorazon ? (
                                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" title="Turno de Corazón" />
                                ) : (
                                  <span className="bg-blue-600 text-white font-black text-[8px] px-1.5 py-0.2 rounded shrink-0">
                                    #{cita.numeroTurnoNormal}
                                  </span>
                                )}
                                <span className="font-bold text-slate-900 truncate max-w-[70px]" title={cita.servicio}>{cita.servicio}</span>
                                <span className="text-[8px] text-slate-400 truncate max-w-[40px]">({cita.clienteNombre})</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                <span className="font-black text-blue-800 text-[10px]">${parsearPrecio(cita.precioTotal).toLocaleString()}</span>
                                <button onClick={(e) => { e.stopPropagation(); setProfesionalParaCita(prof); setEditandoCitaId(cita.id); setClienteNombre(cita.clienteNombre); setClienteCodigo(cita.clienteCodigo || ''); setMetodoPago(cita.metodoPago || 'efectivo'); setEsCorazon(Boolean(cita.esCorazon)); setServiciosSeleccionadosIndices(cita.serviciosIndices || []); setModalCitaOpen(true); }} className="text-blue-600 hover:text-blue-800 p-0.5">✏️</button>
                                <button onClick={(e) => { e.stopPropagation(); setCitaAEliminarId(cita.id); setModalEliminarCitaOpen(true); }} className="text-rose-600 hover:text-rose-800 p-0.5">🗑️</button>
                              </div>
                            </div>
                          )) : <div className="text-center py-4 text-slate-400 text-[9px] italic border border-dashed border-sky-300 rounded-xl">Sin registros en esta fecha</div>}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-sky-200 flex gap-1.5" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setProfesionalSeleccionado(prof); setNuevoPorcentaje(String(prof.porcentaje)); setNuevaEspecialidad(prof.especialidad || ''); setModalEditarOpen(true); }} className="flex-1 bg-sky-100 hover:bg-sky-200 text-blue-900 py-1.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1"><Edit3 className="w-3 h-3" /> Configurar</button>
                      <button onClick={() => { setProfesionalADesvincular(prof); setModalDesvincularOpen(true); }} className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-1.5 rounded-lg border border-rose-200"><UserMinus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: DETALLE CITA CON HORA Y FECHA */}
      {modalDetalleCitaOpen && citaDetalle && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-sky-50 via-white to-blue-50 border border-blue-300 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2"><h3 className="font-black text-blue-900 text-xs">Detalle del Servicio</h3><button onClick={() => setModalDetalleCitaOpen(false)} className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button></div>
            <div className="bg-white border border-sky-200 p-3 rounded-xl space-y-2 text-[10px]">
              <div className="flex justify-between"><span>Profesional:</span><strong className="text-blue-950">{citaDetalle.profesionalNombre}</strong></div>
              <div className="flex justify-between"><span>Servicios:</span><strong className="text-blue-700">{citaDetalle.servicio}</strong></div>
              
              <div className="flex justify-between items-center">
                <span>Cliente:</span>
                <strong className="text-right">
                  {citaDetalle.clienteNombre}
                  {(citaDetalle.clienteCodigo || citaDetalle.codigo) && (citaDetalle.clienteCodigo || citaDetalle.codigo) !== 'N/A' && (
                    <span className="text-slate-500 font-mono font-normal ml-1">
                      ({citaDetalle.clienteCodigo || citaDetalle.codigo})
                    </span>
                  )}
                </strong>
              </div>

              <div className="flex justify-between"><span>Fecha / Hora:</span><strong className="text-blue-900 flex items-center gap-1"><Clock className="w-3 h-3 text-sky-600" /> {citaDetalle.fecha} ({citaDetalle.hora || 'N/A'})</strong></div>
              <div className="flex justify-between"><span>Turno:</span><strong className={citaDetalle.esCorazon ? 'text-rose-600' : 'text-blue-700'}>{citaDetalle.esCorazon ? '💖 Corazón' : `#${citaDetalle.numeroTurnoNormal}`}</strong></div>
              <div className="flex justify-between"><span>Pago:</span><span className="uppercase font-bold">{citaDetalle.metodoPago}</span></div>
            </div>
            <div className="bg-blue-600 text-white rounded-xl p-3 space-y-1 shadow-sm">
              <div className="flex justify-between text-[10px]"><span>Total:</span><strong className="text-white">${parsearPrecio(citaDetalle.precioTotal).toLocaleString()}</strong></div>
              <div className="flex justify-between text-[10px]"><span>Comisión ({citaDetalle.porcentajeProf}%):</span><strong className="text-sky-200">${(citaDetalle.valorComision || (parsearPrecio(citaDetalle.precioTotal) * citaDetalle.porcentajeProf) / 100).toLocaleString()}</strong></div>
            </div>
            <div className="flex gap-2"><button onClick={() => setModalDetalleCitaOpen(false)} className="flex-1 bg-slate-200 py-2 rounded-xl text-[10px] font-bold">Cerrar</button><button onClick={() => { setCitaAEliminarId(citaDetalle.id); setModalEliminarCitaOpen(true); }} className="bg-rose-600 text-white px-3 py-2 rounded-xl text-[10px] font-bold">Eliminar</button></div>
          </div>
        </div>
      )}

      {/* MODAL ALERTA ESTILO VISARKA PARA ELIMINAR CITA */}
      {modalEliminarCitaOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-sky-50 via-white to-blue-50 border border-blue-300 rounded-2xl w-full max-w-xs p-5 text-center space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-1">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-black text-xs uppercase text-rose-600">Eliminar Registro</h3>
            <p className="text-[10px] text-slate-600">¿Estás seguro de que deseas eliminar este servicio del sistema? Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setModalEliminarCitaOpen(false); setCitaAEliminarId(null); }} className="flex-1 bg-slate-200 hover:bg-slate-300 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-all">Cancelar</button>
              <button onClick={eliminarCita} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-[10px] font-black cursor-pointer shadow-sm transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR / EDITAR CITA */}
      {modalCitaOpen && profesionalParaCita && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-sky-50 via-white to-blue-50 border border-blue-300 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-blue-900 uppercase text-xs">{editandoCitaId ? 'Modificar Registro' : 'Asignar Servicios a Profesional'}</h3>
                <p className="text-[10px] text-slate-600">Colaborador: <strong className="text-blue-950">{profesionalParaCita.nombre}</strong></p>
              </div>
              <button onClick={() => setModalCitaOpen(false)} className="w-7 h-7 rounded bg-slate-200 flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={guardarCitaProfesional} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Cliente</label>
                  <input type="text" required placeholder="Nombre cliente" value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Cédula / ID (Opcional)</label>
                  <input type="text" placeholder="Código" value={clienteCodigo} onChange={e => setClienteCodigo(e.target.value)} className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>

              {/* SECCIÓN DE BÚSQUEDA Y SELECCIÓN DE SERVICIOS CON BURBUJAS */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 text-[9px] uppercase">Seleccionar Servicios</label>
                
                {/* Input de Búsqueda rápida */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="🔍 Buscar servicio para agregar..." 
                    value={busquedaServicio} 
                    onChange={e => setBusquedaServicio(e.target.value)} 
                    className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs shadow-3xs outline-none focus:border-blue-500"
                  />
                </div>

                {/* Lista filtrada de servicios */}
                <div className="max-h-36 overflow-y-auto space-y-1 border border-sky-200 rounded-xl p-2 bg-white scrollbar-thin shadow-inner">
                  {serviciosEstablecimiento.length > 0 ? (
                    serviciosEstablecimiento
                      .map((srv, idx) => ({ srv, idx }))
                      .filter(({ srv }) => {
                        const nombreServicio = (srv.nombre || srv.titulo || '').toLowerCase();
                        return nombreServicio.includes(busquedaServicio.toLowerCase());
                      })
                      .map(({ srv, idx }) => {
                        const sel = serviciosSeleccionadosIndices.includes(idx);
                        const precio = parsearPrecio(srv.precio || srv.costo);
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              toggleServicioSeleccionado(idx);
                              setBusquedaServicio('');
                            }} 
                            className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              sel ? 'bg-blue-100 border-blue-400 text-blue-950 font-bold' : 'bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-[11px]">{srv.nombre || srv.titulo}</span>
                            <span className="font-black text-xs text-blue-700">${precio.toLocaleString()}</span>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-3 text-slate-400 text-xs">No hay servicios registrados.</div>
                  )}
                </div>

                {/* Burbujas de servicios seleccionados con sus colores personalizados */}
                {serviciosSeleccionadosIndices.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {serviciosSeleccionadosIndices.map(idx => {
                      const srv = serviciosEstablecimiento[idx];
                      const precio = parsearPrecio(srv?.precio || srv?.costo);
                      
                      const colorServicio = srv?.color || srv?.background || '#2563eb';
                      const esColorHex = colorServicio.startsWith('#');

                      return (
                        <div 
                          key={idx} 
                          style={esColorHex ? { backgroundColor: colorServicio } : undefined}
                          className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs animate-fadeIn ${
                            !esColorHex ? colorServicio : ''
                          }`}
                        >
                          <span>{srv?.nombre || srv?.titulo} (${precio.toLocaleString()})</span>
                          <button 
                            type="button" 
                            onClick={() => toggleServicioSeleccionado(idx)}
                            className="w-4 h-4 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white text-[9px] cursor-pointer"
                            title="Quitar servicio"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Método de Pago</label>
                  <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs font-bold">
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta">💳 Tarjeta / POS</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl w-full">
                    <input type="checkbox" checked={esCorazon} onChange={e => setEsCorazon(e.target.checked)} className="w-4 h-4 accent-rose-600" />
                    <span className="font-bold text-slate-800 text-[10px] flex items-center gap-1">
                      <Heart className={`w-3.5 h-3.5 ${esCorazon ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} /> Turno de Corazón
                    </span>
                  </label>
                </div>
              </div>

              {serviciosSeleccionadosIndices.length > 0 && (
                <div className="bg-sky-100 border border-sky-300 rounded-xl p-3 text-[10px] space-y-1">
                  {(() => {
                    const total = serviciosSeleccionadosIndices.reduce((acc, i) => acc + parsearPrecio(serviciosEstablecimiento[i]?.precio || serviciosEstablecimiento[i]?.costo), 0);
                    const com = (total * profesionalParaCita.porcentaje) / 100;
                    return (
                      <>
                        <div className="flex justify-between"><span>Total Servicios:</span><strong>${total.toLocaleString()}</strong></div>
                        <div className="flex justify-between border-t border-sky-200 pt-1"><span>Comisión ({profesionalParaCita.porcentaje}%):</span><strong className="text-blue-700">${com.toLocaleString()}</strong></div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setModalCitaOpen(false)} className="flex-1 bg-slate-200 py-2.5 rounded-xl uppercase text-[10px] font-bold cursor-pointer">Cancelar</button>
                <button type="submit" disabled={guardandoCita || serviciosSeleccionadosIndices.length === 0} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl uppercase text-[10px] shadow-sm cursor-pointer disabled:opacity-50">
                  {guardandoCita ? 'Procesando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VINCULAR */}
      {modalVincularOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-sky-50 via-white to-blue-50 border border-blue-300 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2"><h3 className="font-black text-blue-900 text-xs">Vincular Profesional</h3><button onClick={() => setModalVincularOpen(false)} className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button></div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!emailBusqueda) return;
              setBuscando(true);
              try {
                const snap = await getDocs(query(collection(db, 'profesionales'), where('email', '==', emailBusqueda.trim().toLowerCase())));
                if (!snap.empty) {
                  setProfesionalEncontrado({ id: snap.docs[0].id, ...snap.docs[0].data() });
                } else {
                  setErrorMsg('No se encontró profesional con ese correo.');
                }
              } catch (err) { setErrorMsg('Error al buscar.'); } finally { setBuscando(false); }
            }} className="space-y-3">
              <div><label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Correo Electrónico</label><div className="flex gap-2"><input type="email" required placeholder="correo@ejemplo.com" value={emailBusqueda} onChange={e => setEmailBusqueda(e.target.value)} className="flex-1 bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs" /><button type="submit" className="bg-blue-600 text-white font-black px-3 py-2 rounded-xl text-[10px]">Buscar</button></div></div>
            </form>
            {profesionalEncontrado && (
              <div className="bg-sky-100 p-3 rounded-xl space-y-2 border border-sky-300">
                <p className="font-black text-xs">{profesionalEncontrado.nombre}</p>
                <div><label className="block text-[9px] font-bold uppercase mb-1">Comisión (%)</label><input type="number" value={comisionDefault} onChange={e => setComisionDefault(e.target.value)} className="w-full bg-white border rounded-lg p-2 text-xs" /></div>
                <button onClick={async () => {
                  const nuevoOrden = profesionalesVinculados.length + 1;
                  await setDoc(doc(db, 'profesionales', profesionalEncontrado.id), { establecimientoId: targetId, porcentaje: Number(comisionDefault) || 35, comisionBarbero: Number(comisionDefault) || 35, ordenLlegada: nuevoOrden, vinculadoEn: new Date().toISOString() }, { merge: true });
                  setSuccessMsg('¡Vinculado con éxito!'); setModalVincularOpen(false); cargarDatos(); setTimeout(() => setSuccessMsg(''), 3500);
                }} className="w-full bg-emerald-600 text-white font-black py-2 rounded-xl text-[10px] uppercase">Confirmar Vinculación</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL EDITAR COMISIÓN */}
      {modalEditarOpen && profesionalSeleccionado && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-sky-50 via-white to-blue-50 border border-blue-300 rounded-2xl w-full max-w-xs p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2"><h3 className="font-black text-blue-900 text-xs">Configurar</h3><button onClick={() => setModalEditarOpen(false)} className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button></div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await updateDoc(doc(db, 'profesionales', profesionalSeleccionado.id), { porcentaje: Number(nuevoPorcentaje) || 35, comisionBarbero: Number(nuevoPorcentaje) || 35, especialidad: nuevaEspecialidad.trim() || 'Barbero' });
              setSuccessMsg('Actualizado correctamente.'); setModalEditarOpen(false); cargarDatos(); setTimeout(() => setSuccessMsg(''), 3500);
            }} className="space-y-3">
              <div><label className="block text-[9px] font-bold uppercase mb-1">Comisión (%)</label><input type="number" value={nuevoPorcentaje} onChange={e => setNuevoPorcentaje(e.target.value)} className="w-full bg-white border rounded-xl p-2 text-xs" required /></div>
              <div><label className="block text-[9px] font-bold uppercase mb-1">Especialidad</label><input type="text" value={nuevaEspecialidad} onChange={e => setNuevaEspecialidad(e.target.value)} className="w-full bg-white border rounded-xl p-2 text-xs" /></div>
              <div className="flex gap-2"><button type="button" onClick={() => setModalEditarOpen(false)} className="flex-1 bg-slate-200 py-2 rounded-xl text-[10px] font-bold">Cancelar</button><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-[10px] font-bold">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DESVINCULAR */}
      {modalDesvincularOpen && profesionalADesvincular && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl w-full max-w-xs p-5 text-center space-y-3 shadow-xl">
            <h3 className="font-black text-xs uppercase text-rose-600">Desvincular Profesional</h3>
            <p className="text-[10px]">¿Desea desvincular a <strong>{profesionalADesvincular.nombre}</strong>?</p>
            <div className="flex gap-2"><button onClick={() => setModalDesvincularOpen(false)} className="flex-1 bg-slate-100 py-2 rounded-xl text-[10px] font-bold">Cancelar</button><button onClick={async () => {
              await updateDoc(doc(db, 'profesionales', profesionalADesvincular.id), { establecimientoId: null, ordenLlegada: null });
              setSuccessMsg('Desvinculado.'); setModalDesvincularOpen(false); cargarDatos(); setTimeout(() => setSuccessMsg(''), 3500);
            }} className="flex-1 bg-rose-600 text-white py-2 rounded-xl text-[10px] font-bold">Desvincular</button></div>
          </div>
        </div>
      )}

    </div>
  );
}