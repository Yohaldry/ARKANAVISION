import React, { useState, useEffect } from 'react';
import { Search, MapPin, Award, Star, Calendar, ArrowRight, ShieldCheck, RefreshCw, Scissors, CheckCircle2, Sparkles, Info, X, UserCheck, Clock, Check } from 'lucide-react';
import { collection, getDocs, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function ListaBarberos({ onCitaAgendada }) {
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCiudad, setFiltroCiudad] = useState('Todas');
  
  // Modales
  const [barberoSeleccionadoModal, setBarberoSeleccionadoModal] = useState(null);
  const [barberoAgendamiento, setBarberoAgendamiento] = useState(null);

  // Estados del formulario de reserva
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [servicioCita, setServicioCita] = useState('Corte Clásico & Visagismo');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [guardandoCita, setGuardandoCita] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  // Horas ocupadas obtenidas de Firestore para el barbero y fecha seleccionados
  const [citasOcupadasDia, setCitasOcupadasDia] = useState([]);

  // Cargar lista de profesionales registrados en Firestore
  useEffect(() => {
    const fetchBarberos = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'profesionales'));
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre || 'Barbero Profesional',
          ciudad: doc.data().ciudad || 'Bogotá D.C.',
          experiencia: doc.data().experiencia || '2+ años',
          especialidad: doc.data().especialidad || 'Fade & Visagismo',
          calificacion: doc.data().calificacion || '4.9',
          imagen: doc.data().imagen || '',
          bio: doc.data().bio || 'Especialista en cortes modernos, degradados precisos y análisis de visagismo facial adaptado a cada tipo de rostro.',
          activo: doc.data().activo ?? true
        }));
        
        setBarberos(lista.length === 0 ? [
          { id: 'default-1', nombre: 'Yohaldry Quintero', ciudad: 'Bogotá D.C.', experiencia: '5+ años', especialidad: 'Fade & Visagismo', calificacion: '5.0', activo: true, imagen: '', bio: 'Fundador y maestro barbero experto en técnicas avanzadas de visagismo y fade de alta precisión.' }
        ] : lista);
      } catch (error) {
        console.error('Error al cargar barberos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBarberos();
  }, []);

  // Escuchar en tiempo real las citas del barbero seleccionado en la fecha elegida
  useEffect(() => {
    if (!barberoAgendamiento || !fechaCita) {
      setCitasOcupadasDia([]);
      return;
    }

    const q = query(
      collection(db, 'citas'),
      where('barberoId', '==', barberoAgendamiento.id),
      where('fecha', '==', fechaCita)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ocupadas = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const estado = (data.estado || 'pendiente').toLowerCase();
        if (estado !== 'cancelada' && estado !== 'finalizada') {
          if (data.hora) ocupadas.push(data.hora.trim());
        }
      });
      setCitasOcupadasDia(ocupadas);
    });

    return () => unsubscribe();
  }, [barberoAgendamiento, fechaCita]);

  const handleConfirmarReserva = async (e) => {
    e.preventDefault();
    if (!fechaCita || !horaCita || !nombreCliente || !telefonoCliente) {
      alert('Por favor completa todos los campos y selecciona una hora.');
      return;
    }

    // Verificar si la hora exacta ya está ocupada
    if (citasOcupadasDia.includes(horaCita)) {
      alert('Esta hora ya se encuentra ocupada. Por favor selecciona otra.');
      return;
    }

    setGuardandoCita(true);
    try {
      const nuevaCita = {
        barberoId: barberoAgendamiento.id,
        barberoNombre: barberoAgendamiento.nombre,
        clienteNombre: nombreCliente,
        clienteTelefono: telefonoCliente,
        fecha: fechaCita,
        hora: horaCita,
        servicio: servicioCita,
        estado: 'Confirmada',
        creadoEn: serverTimestamp()
      };

      await addDoc(collection(db, 'citas'), nuevaCita);

      setMensajeExito(true);
      setTimeout(() => {
        setMensajeExito(false);
        setBarberoAgendamiento(null);
        setNombreCliente('');
        setTelefonoCliente('');
        setHoraCita('');
        setFechaCita('');
        if (onCitaAgendada) onCitaAgendada(nuevaCita);
      }, 2000);

    } catch (error) {
      console.error('Error al guardar la cita:', error);
      alert('Hubo un error al registrar la cita. Inténtalo de nuevo.');
    } finally {
      setGuardandoCita(false);
    }
  };

  const barberosFiltrados = barberos.filter(barbero => {
    const coincideNombre = barbero.nombre.toLowerCase().includes(busqueda.toLowerCase()) || barbero.especialidad.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCiudad = filtroCiudad === 'Todas' || barbero.ciudad.toLowerCase().includes(filtroCiudad.toLowerCase());
    return coincideNombre && coincideCiudad;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center font-mono gap-3 text-slate-400 bg-slate-950">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-cyan-300 font-bold">Cargando Red de Maestros...</p>
      </div>
    );
  }

  const horaYaOcupada = horaCita && citasOcupadasDia.includes(horaCita);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 font-mono space-y-4 pb-28 text-slate-100">
      
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] uppercase font-bold">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Arkana Masters
            </div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-white mt-1">
              Selecciona tu <span className="text-cyan-400">Barbero</span>
            </h1>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-black text-white">
            {barberosFiltrados.length} Disponibles
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="relative sm:col-span-8">
            <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-cyan-400/70" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o estilo..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4">
            <select 
              value={filtroCiudad} 
              onChange={(e) => setFiltroCiudad(e.target.value)} 
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="Todas">🏙️ Todas las ciudades</option>
              <option value="Bogotá">Bogotá D.C.</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {barberosFiltrados.length === 0 ? (
          <div className="col-span-full bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <p className="text-xs font-black uppercase text-slate-300">No se encontraron profesionales</p>
          </div>
        ) : (
          barberosFiltrados.map((barbero) => (
            <div key={barbero.id} className="group bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all rounded-xl p-2.5 sm:p-3 flex flex-col justify-between space-y-2.5 shadow-md">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-2">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-300 text-sm uppercase overflow-hidden shadow-sm">
                    {barbero.imagen ? <img src={barbero.imagen} alt={barbero.nombre} className="w-full h-full object-cover" /> : barbero.nombre.charAt(0)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center text-[7px] text-white">✓</span>
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="text-[11px] sm:text-xs font-black uppercase text-white truncate">{barbero.nombre}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                    <span className="flex items-center gap-0.5 text-[9px] font-black text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/30">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {barbero.calificacion}
                    </span>
                  </div>
                  <p className="text-[9px] text-cyan-400 font-bold truncate mt-0.5 hidden sm:block">{barbero.especialidad}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1.5 border-t border-slate-800">
                <button onClick={() => setBarberoSeleccionadoModal(barbero)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-1 px-1 rounded-lg text-[9px] sm:text-[10px] uppercase flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-700">
                  <Info className="w-2.5 h-2.5 text-cyan-400" /> <span className="hidden sm:inline">Ver </span>más
                </button>
                <button onClick={() => setBarberoAgendamiento(barbero)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-1 rounded-lg text-[9px] sm:text-[10px] uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm">
                  <Calendar className="w-2.5 h-2.5" /> Agendar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {barberoSeleccionadoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button onClick={() => setBarberoSeleccionadoModal(null)} className="absolute top-4 right-4 w-7 h-7 bg-slate-800 text-slate-400 hover:text-white rounded-full flex items-center justify-center cursor-pointer border border-slate-700"><X className="w-4 h-4" /></button>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-black text-cyan-300 text-xl overflow-hidden">
                {barberoSeleccionadoModal.imagen ? <img src={barberoSeleccionadoModal.imagen} alt={barberoSeleccionadoModal.nombre} className="w-full h-full object-cover" /> : barberoSeleccionadoModal.nombre.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white">{barberoSeleccionadoModal.nombre}</h3>
                <p className="text-[10px] text-cyan-400 font-bold">{barberoSeleccionadoModal.especialidad}</p>
                <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold"><Star className="w-3 h-3 fill-amber-400" /> {barberoSeleccionadoModal.calificacion}</span>
                  <span>•</span>
                  <span>{barberoSeleccionadoModal.experiencia} exp.</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-[10px] font-black uppercase text-slate-300 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Biografía y Estilo</h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{barberoSeleccionadoModal.bio}</p>
            </div>
            <div className="pt-2">
              <button onClick={() => { const b = barberoSeleccionadoModal; setBarberoSeleccionadoModal(null); setBarberoAgendamiento(b); }} className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-black py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                <Calendar className="w-4 h-4" /> Reservar Cita con {barberoSeleccionadoModal.nombre.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}

      {barberoAgendamiento && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setBarberoAgendamiento(null)} className="absolute top-4 right-4 w-7 h-7 bg-slate-800 text-slate-400 hover:text-white rounded-full flex items-center justify-center cursor-pointer border border-slate-700"><X className="w-4 h-4" /></button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-300 text-base uppercase overflow-hidden">
                {barberoAgendamiento.imagen ? <img src={barberoAgendamiento.imagen} alt={barberoAgendamiento.nombre} className="w-full h-full object-cover" /> : barberoAgendamiento.nombre.charAt(0)}
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold">Agendando cita con</span>
                <h3 className="text-sm font-black uppercase text-white">{barberoAgendamiento.nombre}</h3>
              </div>
            </div>

            {mensajeExito ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md"><Check className="w-6 h-6" /></div>
                <h4 className="text-xs font-black uppercase text-emerald-400">¡Cita Agendada con Éxito!</h4>
                <p className="text-[11px] text-slate-300 font-sans">Asignada correctamente al calendario del profesional.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmarReserva} className="space-y-3 font-mono">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Tu Nombre Completo</label>
                  <input type="text" required placeholder="Ej. Carlos Mendoza" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Teléfono / WhatsApp</label>
                  <input type="tel" required placeholder="Ej. 3001234567" value={telefonoCliente} onChange={(e) => setTelefonoCliente(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Fecha</label>
                    <input type="date" required value={fechaCita} onChange={(e) => { setFechaCita(e.target.value); setHoraCita(''); }} className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Hora y Minutos</label>
                    <input 
                      type="time" 
                      required 
                      disabled={!fechaCita}
                      value={horaCita} 
                      onChange={(e) => setHoraCita(e.target.value)} 
                      className={`w-full bg-slate-950 border rounded-xl py-2 px-3 text-xs text-white focus:outline-none ${
                        !fechaCita 
                          ? 'opacity-50 cursor-not-allowed border-slate-800' 
                          : horaYaOcupada 
                            ? 'border-red-500 text-red-400 bg-red-500/10' 
                            : horaCita 
                              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                              : 'border-slate-800 focus:border-cyan-500'
                      }`} 
                    />
                  </div>
                </div>

                {/* Indicador visual en tiempo real de disponibilidad */}
                {fechaCita && horaCita && (
                  <div className={`p-2.5 rounded-xl border text-[10px] flex items-center gap-2 ${horaYaOcupada ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                    {horaYaOcupada ? (
                      <>
                        <Clock className="w-4 h-4 shrink-0 text-red-400" />
                        <span><strong>Hora Ocupada:</strong> Ya hay una cita programada a las {horaCita} en este día. Selecciona otra hora.</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span><strong>¡Hora Disponible!</strong> Puedes reservar a las {horaCita} sin inconvenientes.</span>
                      </>
                    )}
                  </div>
                )}

                {/* Listado rápido de horas ya ocupadas en el día seleccionado */}
                {fechaCita && citasOcupadasDia.length > 0 && (
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-[9px] text-slate-400 space-y-1">
                    <span className="font-bold text-amber-400 uppercase block">Horas ya ocupadas este día:</span>
                    <div className="flex flex-wrap gap-1">
                      {citasOcupadasDia.map((h, i) => (
                        <span key={i} className="bg-red-500/10 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-md font-bold">{h}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Servicio</label>
                  <select value={servicioCita} onChange={(e) => setServicioCita(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer">
                    <option value="Corte Clásico & Visagismo">Corte Clásico & Visagismo</option>
                    <option value="Fade Pro + Barba">Fade Pro + Barba Esculpida</option>
                    <option value="Facial Spa & Corte">Facial Spa & Corte Completo</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={guardandoCita || !horaCita || horaYaOcupada} className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-black py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50">
                    {guardandoCita ? <><RefreshCw className="w-4 h-4 animate-spin" /> Registrando Cita...</> : <><Calendar className="w-4 h-4" /> Confirmar Cita con {barberoAgendamiento.nombre.split(' ')[0]}</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}