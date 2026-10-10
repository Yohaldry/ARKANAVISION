import React, { useState, useEffect } from 'react';
import { Scissors, MapPin, Clock, Star, ChevronRight, ArrowLeft, CheckCircle2, User, Calendar, AlertCircle } from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db, auth } from '../../../components/firebase';

export default function AgendaEstablecimiento({ establecimientoId, onVolver }) {
  const queryParams = new URLSearchParams(window.location.search);
  const idDesdeUrl = queryParams.get('id');
  const targetId = establecimientoId || idDesdeUrl || auth.currentUser?.uid;

  const [establecimiento, setEstablecimiento] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [profesionalesVinculados, setProfesionalesVinculados] = useState([]);
  
  const [paso, setPaso] = useState('servicios');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteCorreo, setClienteCorreo] = useState('');
  const [fechaCita, setFechaCita] = useState(new Date().toISOString().split('T')[0]);
  const [horaCita, setHoraCita] = useState('09:00');

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorId, setErrorId] = useState(false);

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      setErrorId(true);
      return;
    }

    const cargarDatosEstablecimiento = async () => {
      try {
        setLoading(true);
        setErrorId(false);

        const estabRef = doc(db, 'establecimientos', targetId);
        const estabSnap = await getDoc(estabRef);

        if (estabSnap.exists()) {
          const data = estabSnap.data();
          setEstablecimiento(data);
          if (data.servicios && Array.isArray(data.servicios)) {
            setServicios(data.servicios);
          }
        } else {
          setErrorId(true);
        }

        const qProf = query(
          collection(db, 'profesionales'),
          where('establecimientoId', '==', targetId)
        );
        const profSnap = await getDocs(qProf);
        const listaProf = [];
        profSnap.forEach(docSnap => {
          const pData = docSnap.data();
          if (pData.estadoVinculacion === 'aceptado' || !pData.estadoVinculacion) {
            listaProf.push({ id: docSnap.id, ...pData });
          }
        });
        setProfesionalesVinculados(listaProf);

      } catch (err) {
        console.error("Error al cargar datos públicos del establecimiento:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosEstablecimiento();
  }, [targetId]);

  const toggleServicio = (serv) => {
    const existe = serviciosSeleccionados.some(s => (s.id || s.nombre) === (serv.id || serv.nombre));
    if (existe) {
      setServiciosSeleccionados(serviciosSeleccionados.filter(s => (s.id || s.nombre) !== (serv.id || serv.nombre)));
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, serv]);
    }
  };

  const totalPrecio = serviciosSeleccionados.reduce((acc, curr) => acc + (Number(curr.precio || curr.total) || 0), 0);
  const totalDuracion = serviciosSeleccionados.reduce((acc, curr) => acc + (Number(curr.duracion) || 30), 0);

  const guardarReserva = async (e) => {
    e.preventDefault();
    if (!clienteNombre || !clienteTelefono || !clienteCorreo || serviciosSeleccionados.length === 0 || !profesionalSeleccionado) return;

    setGuardando(true);
    try {
      const nombresServicios = serviciosSeleccionados.map(s => s.nombre || s.servicio).join(' + ');

      const nuevaCita = {
        establecimientoId: targetId,
        establecimientoNombre: establecimiento?.nombre || 'Establecimiento',
        barberoId: profesionalSeleccionado.id,
        barberoName: profesionalSeleccionado.nombre,
        clienteNombre: clienteNombre.trim(),
        telefono: clienteTelefono.trim(),
        correo: clienteCorreo.trim().toLowerCase(),
        servicio: nombresServicios,
        precioTotal: totalPrecio,
        duracionTotal: totalDuracion,
        fecha: fechaCita,
        fechaStr: fechaCita,
        hora: horaCita,
        estado: 'pendiente',
        tipo: 'establecimiento',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'citas'), nuevaCita);

      alert('¡Cita agendada con éxito en el establecimiento!');
      setServiciosSeleccionados([]);
      setProfesionalSeleccionado(null);
      setClienteNombre('');
      setClienteTelefono('');
      setClienteCorreo('');
      setPaso('servicios');
    } catch (err) {
      console.error("Error al guardar la cita:", err);
      alert('Hubo un error al registrar la cita. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-mono text-xs text-blue-600 gap-2">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Cargando establecimiento...
      </div>
    );
  }

  if (errorId || !establecimiento) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-mono text-xs text-slate-800 space-y-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="font-black text-slate-900 uppercase tracking-wider">Establecimiento no encontrado</p>
        <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">Verifica que el enlace sea correcto o que el establecimiento esté activo en la plataforma.</p>
        {onVolver && (
          <button
            onClick={onVolver}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Regresar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-mono text-xs text-slate-800 pb-16">
      
      {/* CABECERA VISARKA */}
      <div className="relative w-full bg-slate-900 shadow-md">
        <div className="h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-sky-950 relative">
          {establecimiento?.portada ? (
            <img src={establecimiento.portada} alt="Portada" className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
          )}

          {onVolver && (
            <button
              onClick={onVolver}
              className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md hover:bg-slate-950 text-white px-3 py-2 rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> <span className="text-[10px] uppercase font-bold">Volver</span>
            </button>
          )}
        </div>

        <div className="max-w-3xl mx-auto px-4 relative pb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-16 mb-2 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden shrink-0 bg-blue-600 text-white flex items-center justify-center font-black text-2xl">
              {establecimiento?.foto ? (
                <img src={establecimiento.foto} alt={establecimiento?.nombre} className="w-full h-full object-cover" />
              ) : (
                (establecimiento?.nombre || 'E').charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-1 pb-1">
              <h1 className="text-base sm:text-xl font-black text-white uppercase tracking-wider drop-shadow-sm">
                {establecimiento?.nombre || 'Establecimiento Socio'}
              </h1>
              <p className="text-slate-300 text-[10px] flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" /> {establecimiento?.direccion || 'Ubicación principal'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">

        {/* PASO 1: SELECCIONAR SERVICIOS */}
        {paso === 'servicios' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-200/60">
              <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-blue-600" /> Selecciona tus Servicios
              </h3>
              <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                {serviciosSeleccionados.length} elegidos
              </span>
            </div>

            {servicios.length === 0 ? (
              <div className="bg-white border border-blue-200/80 rounded-2xl p-12 text-center text-slate-400 space-y-2 shadow-xs">
                <Scissors className="w-10 h-10 mx-auto opacity-30 text-blue-500" />
                <p className="font-bold text-slate-600 text-xs">Este establecimiento aún no tiene servicios registrados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">
                {servicios.map((serv, index) => {
                  const seleccionado = serviciosSeleccionados.some(s => (s.id || s.nombre) === (serv.id || serv.nombre));
                  return (
                    <div
                      key={serv.id || index}
                      onClick={() => toggleServicio(serv)}
                      className={`bg-white border rounded-2xl p-3.5 shadow-2xs transition-all cursor-pointer relative overflow-hidden flex items-center justify-between group active:scale-[0.99] ${
                        seleccionado ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm' : 'border-blue-200/80 hover:border-blue-400 hover:shadow-xs'
                      }`}
                    >
                      <div style={{ backgroundColor: serv.color || '#3b82f6' }} className="absolute left-0 top-0 bottom-0 w-2" />

                      <div className="pl-3 space-y-1 flex-1 truncate">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-900 text-xs group-hover:text-blue-600 transition-colors truncate">
                            {serv.nombre}
                          </p>
                          {seleccionado && <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shrink-0">✓</span>}
                        </div>
                        {serv.descripcion && (
                          <p className="text-[10px] text-slate-500 leading-relaxed truncate">{serv.descripcion}</p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-blue-700 font-bold pt-0.5">
                          <span>💵 ${Number(serv.precio || serv.total)?.toLocaleString()}</span>
                          <span>⏱️ {serv.duracion || 30} min</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* BARRA INFERIOR FLOTANTE DE RESUMEN */}
            {serviciosSeleccionados.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-blue-200 p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-200">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold">Total: <strong className="text-blue-900 text-xs">${totalPrecio.toLocaleString()} COP</strong></p>
                    <p className="text-[9px] text-slate-400">Duración: {totalDuracion} min aprox.</p>
                  </div>
                  <button
                    onClick={() => setPaso('profesionales')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 text-xs flex items-center gap-1.5"
                  >
                    Elegir Profesional <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 2: SELECCIONAR PROFESIONAL */}
        {paso === 'profesionales' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-200/60">
              <div className="space-y-0.5">
                <button
                  onClick={() => setPaso('servicios')}
                  className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1 mb-1"
                >
                  ← Cambiar servicios ({serviciosSeleccionados.length} elegidos)
                </button>
                <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" /> Elige a tu Profesional
                </h3>
              </div>
            </div>

            {profesionalesVinculados.length === 0 ? (
              <div className="bg-white border border-blue-200/80 rounded-2xl p-12 text-center text-slate-400 space-y-2 shadow-xs">
                <User className="w-10 h-10 mx-auto opacity-30 text-blue-500" />
                <p className="font-bold text-slate-600 text-xs">No hay profesionales disponibles en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profesionalesVinculados.map((prof) => (
                  <div
                    key={prof.id}
                    onClick={() => {
                      setProfesionalSeleccionado(prof);
                      setPaso('datos');
                    }}
                    className="bg-white border border-blue-200/80 hover:border-blue-500 rounded-2xl p-4 shadow-2xs transition-all cursor-pointer flex items-center justify-between group hover:shadow-xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                        {prof.foto ? (
                          <img src={prof.foto} alt={prof.nombre} className="w-full h-full object-cover" />
                        ) : (
                          (prof.nombre || 'P').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                          {prof.nombre || 'Especialista'}
                        </p>
                        <p className="text-[10px] text-slate-500">{prof.especialidad || 'Barbero Profesional'}</p>
                        <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md inline-block border border-emerald-200">
                          🟢 Disponible
                        </span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 3: DATOS Y CONFIRMACIÓN */}
        {paso === 'datos' && (
          <form onSubmit={guardarReserva} className="bg-white border border-blue-200/80 rounded-2xl p-5 sm:p-6 shadow-xs max-w-lg mx-auto space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Paso Final</span>
                <h3 className="text-sm font-black uppercase text-blue-950">Datos de Contacto y Fecha</h3>
              </div>
              <button
                type="button"
                onClick={() => setPaso('profesionales')}
                className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Cambiar profesional
              </button>
            </div>

            <div className="space-y-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Establecimiento:</span>
                <span className="font-bold text-slate-900">{establecimiento?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Profesional:</span>
                <span className="font-bold text-emerald-700">{profesionalSeleccionado?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Servicios:</span>
                <span className="font-bold text-blue-700 text-right truncate max-w-[200px]">{serviciosSeleccionados.map(s => s.nombre).join(', ')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200/60 font-black text-xs">
                <span>Total a Pagar:</span>
                <span className="text-blue-900">${totalPrecio.toLocaleString()} COP ({totalDuracion} min)</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Pérez"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 3001234567"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={clienteCorreo}
                  onChange={(e) => setClienteCorreo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha de Cita</label>
                  <input
                    type="date"
                    required
                    value={fechaCita}
                    onChange={(e) => setFechaCita(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-600 cursor-pointer text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={horaCita}
                    onChange={(e) => setHoraCita(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-600 cursor-pointer text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setPaso('profesionales')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl uppercase transition-all cursor-pointer border border-slate-200 text-xs"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 text-xs"
              >
                {guardando ? 'Guardando...' : 'Confirmar Cita'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}