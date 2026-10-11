import React, { useState, useEffect } from 'react';
import { Scissors, X, CheckCircle2, AlertCircle, Edit3, Trash2, Palette, Plus, CheckSquare, Square } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../components/firebase';

const coloresDisponibles = [
  { nombre: 'Azul', hex: '#3b82f6' },
  { nombre: 'Esmeralda', hex: '#10b981' },
  { nombre: 'Violeta', hex: '#8b5cf6' },
  { nombre: 'Ámbar', hex: '#f59e0b' },
  { nombre: 'Rosa', hex: '#f43f5e' },
  { nombre: 'Cian', hex: '#06b6d4' },
  { nombre: 'Índigo', hex: '#6366f1' },
  { nombre: 'Gris', hex: '#475569' }
];

export default function Servicios({ authUser }) {
  const [servicios, setServicios] = useState([]);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreServicio, setNombreServicio] = useState('');
  const [descripcionServicio, setDescripcionServicio] = useState('');
  const [precioServicio, setPrecioServicio] = useState('');
  const [duracionServicio, setDuracionServicio] = useState('30');
  const [colorServicio, setColorServicio] = useState('#3b82f6');
  const [editandoIndex, setEditandoIndex] = useState(null);

  const [seleccionados, setSeleccionados] = useState([]);
  const [modalConfirmacionMultiple, setModalConfirmacionMultiple] = useState(false);
  const [modalConfirmacionIndividual, setModalConfirmacionIndividual] = useState(null);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = authUser?.uid || auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    cargarServiciosEstablecimiento();
  }, [userId]);

  const cargarServiciosEstablecimiento = async () => {
    try {
      const docRef = doc(db, 'establecimientos', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.servicios && Array.isArray(data.servicios)) {
          setServicios(data.servicios);
        }
      }
    } catch (err) {
      console.error("Error al cargar servicios:", err);
    }
  };

  const guardarEnFirestore = async (nuevaListaServicios) => {
    if (!userId) {
      throw new Error("No hay usuario autenticado.");
    }
    const docRef = doc(db, 'establecimientos', userId);
    await setDoc(docRef, {
      servicios: nuevaListaServicios
    }, { merge: true });
    
    setServicios(nuevaListaServicios);
  };

  const abrirModalCrear = () => {
    setNombreServicio('');
    setDescripcionServicio('');
    setPrecioServicio('');
    setDuracionServicio('30');
    setColorServicio('#3b82f6');
    setEditandoIndex(null);
    setModalAbierto(true);
  };

  const iniciarEdicion = (index) => {
    const serv = servicios[index];
    setNombreServicio(serv.nombre || '');
    setDescripcionServicio(serv.descripcion || '');
    setPrecioServicio(serv.precio || '');
    setDuracionServicio(String(serv.duracion || 30));
    setColorServicio(serv.color || '#3b82f6');
    setEditandoIndex(index);
    setModalAbierto(true);
  };

  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    if (!nombreServicio || !precioServicio) return;

    setLoading(true);
    setErrorMsg('');
    try {
      let nuevaLista = [...servicios];
      const objetoServicio = {
        id: editandoIndex !== null && servicios[editandoIndex]?.id ? servicios[editandoIndex].id : Date.now().toString(),
        nombre: nombreServicio.trim(),
        descripcion: descripcionServicio.trim(),
        precio: Number(precioServicio),
        duracion: Number(duracionServicio) || 30,
        color: colorServicio || '#3b82f6'
      };

      if (editandoIndex !== null) {
        nuevaLista[editandoIndex] = objetoServicio;
        setSuccessMsg('¡Servicio actualizado exitosamente!');
      } else {
        nuevaLista.push(objetoServicio);
        setSuccessMsg('¡Servicio guardado exitosamente!');
      }

      await guardarEnFirestore(nuevaLista);
      
      setModalAbierto(false);
      setNombreServicio('');
      setDescripcionServicio('');
      setPrecioServicio('');
      setDuracionServicio('30');
      setColorServicio('#3b82f6');
      setEditandoIndex(null);

      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo guardar el servicio. Revisa tu conexión.');
      setTimeout(() => setErrorMsg(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  const ejecutarEliminarUno = async () => {
    if (modalConfirmacionIndividual === null) return;
    try {
      const nuevaLista = servicios.filter((_, i) => i !== modalConfirmacionIndividual);
      await guardarEnFirestore(nuevaLista);
      setSeleccionados(seleccionados.filter(i => i !== modalConfirmacionIndividual));
      setSuccessMsg('Servicio eliminado correctamente.');
      setModalConfirmacionIndividual(null);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg('No se pudo eliminar el servicio.');
      setTimeout(() => setErrorMsg(''), 3500);
    }
  };

  const toggleSeleccion = (index) => {
    if (seleccionados.includes(index)) {
      setSeleccionados(seleccionados.filter(i => i !== index));
    } else {
      setSeleccionados([...seleccionados, index]);
    }
  };

  const seleccionarTodos = () => {
    if (seleccionados.length === servicios.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(servicios.map((_, i) => i));
    }
  };

  const ejecutarEliminarSeleccionados = async () => {
    try {
      const nuevaLista = servicios.filter((_, index) => !seleccionados.includes(index));
      await guardarEnFirestore(nuevaLista);
      setSeleccionados([]);
      setModalConfirmacionMultiple(false);
      setSuccessMsg('Servicios seleccionados eliminados correctamente.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg('No se pudieron eliminar los servicios seleccionados.');
      setTimeout(() => setErrorMsg(''), 3500);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200 max-w-7xl mx-auto font-mono text-xs px-2 sm:px-4">
      
      {successMsg && <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] flex gap-2 items-center shadow-xs"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{successMsg}</div>}
      {errorMsg && <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[10px] flex gap-2 items-center shadow-xs"><AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />{errorMsg}</div>}

      {/* Cabecera de la Sección */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider">Gestión de Servicios</h3>
          <p className="text-[9px] text-slate-500 mt-0.5">Administra los servicios, tarifas y tiempos de tu establecimiento.</p>
        </div>

        <div className="flex items-center gap-2">
          {seleccionados.length > 0 && (
            <button
              onClick={() => setModalConfirmacionMultiple(true)}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
            >
              <Trash2 className="w-3 h-3" /> Eliminar ({seleccionados.length})
            </button>
          )}

          <button
            onClick={abrirModalCrear}
            className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black px-3.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar Servicio
          </button>
        </div>
      </div>

      {/* Listado de Servicios Existentes */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-3 sm:p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
          <div className="flex items-center gap-2">
            {servicios.length > 0 && (
              <button 
                onClick={seleccionarTodos}
                className="text-[9px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1"
              >
                {seleccionados.length === servicios.length ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                <span>Seleccionar Todos</span>
              </button>
            )}
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total: {servicios.length}</span>
        </div>
        
        {servicios.length === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-1">
            <Scissors className="w-6 h-6 mx-auto opacity-30 text-blue-500" />
            <p className="font-bold text-slate-600 text-[10px]">No hay servicios registrados todavía.</p>
          </div>
        ) : (
          /* GRID ULTRA COMPACTO: 2 COLUMNAS EN TLFN, 5 EN PC */
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {servicios.map((serv, index) => {
              const seleccionado = seleccionados.includes(index);
              return (
                <div 
                  key={serv.id || index} 
                  className={`p-2 rounded-lg border transition-all flex flex-col justify-between gap-1.5 relative overflow-hidden shadow-2xs ${
                    seleccionado ? 'bg-blue-50/70 border-blue-300' : 'bg-gradient-to-br from-blue-50/20 to-white border-blue-100 hover:border-blue-200'
                  }`}
                >
                  <div 
                    style={{ backgroundColor: serv.color || '#3b82f6' }} 
                    className="absolute left-0 top-0 bottom-0 w-1" 
                  />

                  <div className="space-y-0.5 pl-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-black text-slate-900 text-[11px] leading-tight truncate">{serv.nombre}</p>
                      <button 
                        type="button" 
                        onClick={() => toggleSeleccion(index)}
                        className="text-blue-600 cursor-pointer shrink-0"
                      >
                        {seleccionado ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500" />}
                      </button>
                    </div>

                    {serv.descripcion && (
                      <p className="text-[8px] text-slate-500 leading-tight line-clamp-1">{serv.descripcion}</p>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100/80 flex items-center justify-between pl-1 gap-1">
                    <div className="flex flex-col text-[9px] font-black leading-tight text-blue-700">
                      <span>${Number(serv.precio)?.toLocaleString()}</span>
                      <span className="text-[7.5px] font-normal text-slate-400">⏱️ {serv.duracion}m</span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => iniciarEdicion(index)}
                        className="bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 p-1 rounded-md cursor-pointer transition-all"
                        title="Editar"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => setModalConfirmacionIndividual(index)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-1 rounded-md cursor-pointer transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: GUARDAR / EDITAR SERVICIO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-3 border-b border-blue-100 bg-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-wide text-xs">
                  {editandoIndex !== null ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h3>
              </div>
              <button 
                onClick={() => setModalAbierto(false)}
                className="w-6 h-6 rounded-lg bg-white border border-blue-200 text-slate-500 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleGuardarServicio} className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-600 uppercase">Nombre</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Corte Clásico & Barba"
                  value={nombreServicio}
                  onChange={(e) => setNombreServicio(e.target.value)}
                  className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-600 uppercase">Precio ($)</label>
                  <input 
                    type="number"
                    required
                    placeholder="Ej. 35000"
                    value={precioServicio}
                    onChange={(e) => setPrecioServicio(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-600 uppercase">Duración</label>
                  <select
                    value={duracionServicio}
                    onChange={(e) => setDuracionServicio(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="15">15 Min</option>
                    <option value="30">30 Min</option>
                    <option value="45">45 Min</option>
                    <option value="60">60 Min</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-600 uppercase">Descripción</label>
                <textarea 
                  rows="2"
                  placeholder="Ej. Incluye lavado, corte y perfilado."
                  value={descripcionServicio}
                  onChange={(e) => setDescripcionServicio(e.target.value)}
                  className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-600 uppercase flex items-center gap-1">
                  <Palette className="w-3 h-3 text-blue-600" /> Color Distintivo
                </label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {coloresDisponibles.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setColorServicio(col.hex)}
                      style={{ backgroundColor: col.hex }}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer shadow-xs ${
                        colorServicio === col.hex ? 'ring-2 ring-offset-2 ring-blue-600 scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={col.nombre}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs uppercase cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black px-4 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALERTA CONFIRMACIÓN INDIVIDUAL */}
      {modalConfirmacionIndividual !== null && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-red-200 rounded-xl w-full max-w-xs overflow-hidden shadow-2xl p-4 text-center space-y-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 uppercase text-xs">Eliminar Servicio</h3>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                ¿Eliminar <strong className="text-slate-900">{servicios[modalConfirmacionIndividual]?.nombre}</strong>?
              </p>
            </div>

            <div className="flex gap-1.5 pt-1">
              <button 
                onClick={() => setModalConfirmacionIndividual(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded-lg text-[9px] uppercase transition-all cursor-pointer border border-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarEliminarUno}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-1.5 rounded-lg text-[9px] uppercase transition-all cursor-pointer shadow-md active:scale-95"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA CONFIRMACIÓN MÚLTIPLE */}
      {modalConfirmacionMultiple && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-red-200 rounded-xl w-full max-w-xs overflow-hidden shadow-2xl p-4 text-center space-y-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 uppercase text-xs">Eliminar Selección</h3>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                ¿Eliminar los <strong className="text-slate-900">{seleccionados.length} servicios</strong> seleccionados?
              </p>
            </div>

            <div className="flex gap-1.5 pt-1">
              <button 
                onClick={() => setModalConfirmacionMultiple(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded-lg text-[9px] uppercase transition-all cursor-pointer border border-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarEliminarSeleccionados}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-1.5 rounded-lg text-[9px] uppercase transition-all cursor-pointer shadow-md active:scale-95"
              >
                Eliminar Todo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}