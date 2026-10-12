import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Percent, Scissors, Mail, Shield, CheckCircle2, AlertTriangle, X, Trash2, Edit3, DollarSign, Award } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../components/firebase';

export default function GestionProfesionales({ establecimientoId }) {
  const targetId = establecimientoId || auth.currentUser?.uid;

  const [profesionalesVinculados, setProfesionalesVinculados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estados para Modal de Vincular Profesional
  const [modalVincularOpen, setModalVincularOpen] = useState(false);
  const [emailBusqueda, setEmailBusqueda] = useState('');
  const [comisionDefault, setComisionDefault] = useState('60');
  const [buscando, setBuscando] = useState(false);
  const [profesionalEncontrado, setProfesionalEncontrado] = useState(null);

  // Estados para Modal de Editar Comisión / Especialidad
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [nuevoPorcentaje, setNuevoPorcentaje] = useState('');
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');

  // Modal de Desvincular / Eliminar
  const [modalDesvincularOpen, setModalDesvincularOpen] = useState(false);
  const [profesionalADesvincular, setProfesionalADesvincular] = useState(null);

  useEffect(() => {
    if (!targetId) return;
    cargarProfesionales();
  }, [targetId]);

  const cargarProfesionales = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'profesionales'), where('establecimientoId', '==', targetId));
      const querySnapshot = await getDocs(q);
      const lista = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProfesionalesVinculados(lista);
    } catch (err) {
      console.error("Error al cargar profesionales:", err);
      setErrorMsg('No se pudieron cargar los profesionales vinculados.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar profesional por email en la colección general de usuarios o profesionales
  const buscarProfesionalPorEmail = async (e) => {
    e.preventDefault();
    if (!emailBusqueda) return;

    try {
      setBuscando(true);
      setProfesionalEncontrado(null);
      setErrorMsg('');

      // Buscamos en la colección 'usuarios' o 'profesionales' donde el email coincida
      const q = query(collection(db, 'usuarios'), where('email', '==', emailBusqueda.trim().toLowerCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        // Intentar buscar directamente en la colección de profesionales si ya existen sueltos
        const qProf = query(collection(db, 'profesionales'), where('email', '==', emailBusqueda.trim().toLowerCase()));
        const snapProf = await getDocs(qProf);
        
        if (snapProf.empty) {
          setErrorMsg('No se encontró ningun usuario registrado con ese correo.');
          setBuscando(false);
          return;
        } else {
          const docData = snapProf.docs[0];
          setProfesionalEncontrado({ id: docData.id, ...docData.data() });
        }
      } else {
        const docData = snap.docs[0];
        setProfesionalEncontrado({ id: docData.id, ...docData.data() });
      }
    } catch (err) {
      console.error("Error buscando profesional:", err);
      setErrorMsg('Error al buscar el profesional.');
    } finally {
      setBuscando(false);
    }
  };

  // Vincular profesional al establecimiento
  const vincularProfesional = async () => {
    if (!profesionalEncontrado) return;

    try {
      const profRef = doc(db, 'profesionales', profesionalEncontrado.id);
      const datosVinculacion = {
        establecimientoId: targetId,
        porcentaje: Number(comisionDefault) || 60,
        comisionBarbero: Number(comisionDefault) || 60,
        nombre: profesionalEncontrado.nombre || profesionalEncontrado.displayName || 'Profesional',
        email: profesionalEncontrado.email || emailBusqueda,
        especialidad: profesionalEncontrado.especialidad || 'Barbero / Estilista',
        vinculadoEn: new Date().toISOString()
      };

      // Guardamos o actualizamos en la colección 'profesionales' con su propio UID
      await setDoc(profRef, datosVinculacion, { merge: true });

      setSuccessMsg(`¡${datosVinculacion.nombre} vinculado exitosamente!`);
      setModalVincularOpen(false);
      setEmailBusqueda('');
      setProfesionalEncontrado(null);
      cargarProfesionales();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error("Error al vincular:", err);
      setErrorMsg('No se pudo vincular al profesional.');
    }
  };

  // Guardar cambios de porcentaje y especialidad
  const guardarEdicionProfesional = async (e) => {
    e.preventDefault();
    if (!profesionalSeleccionado) return;

    try {
      const profRef = doc(db, 'profesionales', profesionalSeleccionado.id);
      const porc = Number(nuevoPorcentaje) || 60;

      await updateDoc(profRef, {
        porcentaje: porc,
        comisionBarbero: porc,
        especialidad: nuevaEspecialidad.trim() || 'Barbero'
      });

      setSuccessMsg('Información de comisión actualizada.');
      setModalEditarOpen(false);
      setProfesionalSeleccionado(null);
      cargarProfesionales();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error("Error al actualizar profesional:", err);
      setErrorMsg('No se pudo actualizar la comisión.');
    }
  };

  // Desvincular profesional
  const ejecutarDesvincular = async () => {
    if (!profesionalADesvincular) return;

    try {
      const profRef = doc(db, 'profesionales', profesionalADesvincular.id);
      // Removemos el establecimientoId para desvincularlo
      await updateDoc(profRef, {
        establecimientoId: null
      });

      setSuccessMsg('Profesional desvinculado correctamente.');
      setModalDesvincularOpen(false);
      setProfesionalADesvincular(null);
      cargarProfesionales();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error("Error al desvincular:", err);
      setErrorMsg('No se pudo desvincular al profesional.');
    }
  };

  const totalComisionPromedio = profesionalesVinculados.length > 0 
    ? Math.round(profesionalesVinculados.reduce((acc, curr) => acc + (Number(curr.porcentaje || curr.comisionBarbero) || 60), 0) / profesionalesVinculados.length)
    : 0;

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-[11px] text-blue-600 flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Cargando equipo de profesionales...
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono text-[11px] text-slate-800 animate-in fade-in duration-200 pb-12 px-2 sm:px-4">
      
      {/* ALERTAS */}
      {successMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] flex gap-2 items-center shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[10px] flex gap-2 items-center shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* 3 RECUADROS EN COLUMNA DE 3 (UNO AL LADO DE OTRO) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white border border-blue-200/80 p-2.5 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Vinculados</p>
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Users className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[11px] sm:text-sm font-black text-blue-950 truncate">{profesionalesVinculados.length}</p>
            <p className="text-[7px] text-slate-500">Activos</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white border border-blue-200/80 p-2.5 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Comisión Prom.</p>
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Percent className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[11px] sm:text-sm font-black text-blue-950 truncate">{totalComisionPromedio}%</p>
            <p className="text-[7px] text-emerald-600 font-bold">Promedio local</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 p-2.5 rounded-xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Estado</p>
            <div className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0">
              <Shield className="w-3 h-3 text-sky-400" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[11px] sm:text-sm font-black text-sky-400 truncate">Sincronizado</p>
            <p className="text-[7px] text-slate-400">Firebase DB</p>
          </div>
        </div>
      </div>

      {/* CABECERA Y BOTÓN VINCULAR */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div>
          <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider">Gestión de Profesionales</h3>
          <p className="text-[9px] text-slate-500">Vincula barberos y configura sus porcentajes de ganancia.</p>
        </div>

        <button
          onClick={() => {
            setModalVincularOpen(true);
            setProfesionalEncontrado(null);
            setEmailBusqueda('');
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-black px-3.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" /> Vincualar Profesional
        </button>
      </div>

      {/* LISTADO DE PROFESIONALES */}
      <div className="bg-white border border-blue-200/80 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-3.5 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 uppercase text-[10px]">Profesionales Vinculados ({profesionalesVinculados.length})</h4>
        </div>

        {profesionalesVinculados.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-1.5">
            <Users className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
            <p className="font-bold text-slate-600 text-[10px]">No hay profesionales vinculados a este establecimiento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-blue-50/40 border-b border-blue-200 text-blue-950 font-black text-[9px] uppercase tracking-wider">
                  <th className="p-3">Profesional</th>
                  <th className="p-3">Especialidad</th>
                  <th className="p-3 text-center">Correo</th>
                  <th className="p-3 text-center">% Comisión</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 text-[10px]">
                {profesionalesVinculados.map((prof) => {
                  const porcentaje = prof.porcentaje ?? prof.comisionBarbero ?? 60;
                  return (
                    <tr key={prof.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {prof.foto ? (
                            <img src={prof.foto} alt={prof.nombre} className="w-full h-full object-cover" />
                          ) : (
                            (prof.nombre || 'P').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="truncate max-w-[120px]">
                          <p className="font-black text-slate-900 truncate">{prof.nombre}</p>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 font-bold">{prof.especialidad || 'Barbero'}</td>
                      <td className="p-3 text-center text-slate-500 truncate max-w-[140px]">{prof.email || 'N/A'}</td>
                      <td className="p-3 text-center">
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-black text-[10px]">
                          {porcentaje}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setProfesionalSeleccionado(prof);
                              setNuevoPorcentaje(String(porcentaje));
                              setNuevaEspecialidad(prof.especialidad || '');
                              setModalEditarOpen(true);
                            }}
                            className="bg-sky-50 hover:bg-sky-100 text-sky-600 p-1.5 rounded-lg border border-sky-200 cursor-pointer transition-all"
                            title="Editar Comisión y Especialidad"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setProfesionalADesvincular(prof);
                              setModalDesvincularOpen(true);
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg border border-rose-200 cursor-pointer transition-all"
                            title="Desvincular Profesional"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: VINCULAR PROFESIONAL */}
      {modalVincularOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <h3 className="font-black text-slate-900 uppercase text-xs">Vincular Profesional</h3>
              <button onClick={() => setModalVincularOpen(false)} className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={buscarProfesionalPorEmail} className="space-y-2.5">
              <div>
                <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Correo Electrónico del Profesional</label>
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={emailBusqueda}
                    onChange={(e) => setEmailBusqueda(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={buscando}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase cursor-pointer"
                  >
                    {buscando ? '...' : 'Buscar'}
                  </button>
                </div>
              </div>
            </form>

            {profesionalEncontrado && (
              <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div>
                  <p className="font-black text-blue-950 text-xs">{profesionalEncontrado.nombre || profesionalEncontrado.displayName}</p>
                  <p className="text-[9px] text-slate-500">{profesionalEncontrado.email}</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Porcentaje de Comisión (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={comisionDefault}
                    onChange={(e) => setComisionDefault(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={vincularProfesional}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-2 rounded-lg text-[10px] uppercase tracking-wider shadow-md cursor-pointer active:scale-95"
                >
                  Confirmar y Vincular
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDITAR COMISIÓN / ESPECIALIDAD */}
      {modalEditarOpen && profesionalSeleccionado && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <h3 className="font-black text-slate-900 uppercase text-xs">Editar Profesional</h3>
              <button onClick={() => setModalEditarOpen(false)} className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
              <p className="font-black text-blue-950 text-xs">{profesionalSeleccionado.nombre}</p>
            </div>

            <form onSubmit={guardarEdicionProfesional} className="space-y-2.5">
              <div>
                <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Porcentaje Comisión (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={nuevoPorcentaje}
                  onChange={(e) => setNuevoPorcentaje(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[9px] uppercase mb-1">Especialidad</label>
                <input
                  type="text"
                  value={nuevaEspecialidad}
                  onChange={(e) => setNuevaEspecialidad(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalEditarOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-lg uppercase text-[10px] border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2 rounded-lg uppercase text-[10px] shadow-md cursor-pointer active:scale-95"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DESVINCULAR */}
      {modalDesvincularOpen && profesionalADesvincular && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl p-4 text-center space-y-3">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto shadow-inner">
              <UserMinus className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 uppercase text-xs">Desvincular Profesional</h3>
              <p className="text-[10px] text-slate-600">
                ¿Deseas desvincular a <strong className="text-slate-900">{profesionalADesvincular.nombre}</strong> de tu establecimiento?
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => setModalDesvincularOpen(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-1.5 rounded-lg uppercase text-[9px] border border-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarDesvincular}
                className="flex-1 bg-rose-600 text-white font-black py-1.5 rounded-lg uppercase text-[9px] shadow-md cursor-pointer active:scale-95"
              >
                Desvincular
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}