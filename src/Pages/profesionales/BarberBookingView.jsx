import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiMapPin, FiClock, FiCalendar, FiScissors, FiCheckCircle, FiArrowRight, FiAward, FiUser, FiPhone, FiHome, FiInfo, FiX, FiPackage, FiCheck, FiMail } from 'react-icons/fi';
import { RiMotorbikeLine } from 'react-icons/ri';
import { db } from '../../components/firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const BarberBookingView = ({ onBookingComplete }) => {
  const { barberoId } = useParams();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const todayStr = new Date().toISOString().split('T')[0];
  const [showFullBio, setShowFullBio] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [detalleCita, setDetalleCita] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', referencia: '', torreApto: '', parqueaderoMoto: false });

  const generate24Hours = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      const hour24 = i;
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      const formattedHour = `${hour12.toString().padStart(2, '0')}:00 ${ampm}`;
      times.push(formattedHour);
    }
    return times;
  };

  const all24Hours = generate24Hours();

  useEffect(() => {
    if (!barberoId) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [docSnap, servSnap] = await Promise.all([
          getDoc(doc(db, "profesionales", barberoId)),
          getDocs(query(collection(db, "servicios"), where("barberoId", "==", barberoId)))
        ]);
        if (!docSnap.exists()) return setError("No se encontró el perfil profesional.");
        const data = docSnap.data();
        let listaServicios = [];
        
        servSnap.forEach(s => {
          const sData = s.data();
          const duracionStr = String(sData.duracion || sData.duration || '').toLowerCase();
          
          if (duracionStr.includes('interno')) {
            return;
          }

          let rawPrecio = sData.precioNum !== undefined ? sData.precioNum : (sData.precio !== undefined ? sData.precio : sData.price);
          let calculatedPriceNum = 35000;
          
          if (typeof rawPrecio === 'number') {
            calculatedPriceNum = rawPrecio;
          } else if (typeof rawPrecio === 'string') {
            const parsed = parseInt(rawPrecio.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(parsed)) calculatedPriceNum = parsed;
          }
          
          listaServicios.push({ 
            id: s.id, 
            name: sData.nombre || sData.name || 'Servicio', 
            descripcion: sData.descripcion || sData.description || '',
            priceNum: calculatedPriceNum,
            priceFormatted: sData.precioText || (typeof sData.precio === 'string' && sData.precio.includes('$') ? sData.precio : `$${calculatedPriceNum.toLocaleString('es-CO')} COP`), 
            categoria: sData.categoria || 'servicio',
            color: sData.color || '#3b82f6'
          });
        });
     
        setBarber({
          id: docSnap.id, name: data.nombre || "Profesional", email: data.email || "", location: data.ciudad || "Bogotá D.C.", rating: "4.9", reviewsCount: 28,
          image: data.foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
          bio: data.descripcion || data.biografia || "Experto en visagismo y tendencias.", services: listaServicios,
          availableTimes: all24Hours
        });
        
        setSelectedServices([]);
      } catch (err) { 
        console.error(err);
        setError("Error al conectar con la base de datos."); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAll();
  }, [barberoId]);

useEffect(() => {
    if (!barberoId || !selectedDate) return;

    const unsubscribe = onSnapshot(query(collection(db, "citas"), where("barberoId", "==", barberoId)), (snap) => {
      const bookedSet = new Set();
      const timesList = barber?.availableTimes || all24Hours;

      const parseToMin = (str) => {
        if (!str) return null;
        let clean = str.toString().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
        let isPM = clean.includes('pm') || clean.includes('p m');
        let isAM = clean.includes('am') || clean.includes('a m');

        let timePart = clean.replace(/pm|am|p m|a m/g, '').trim();
        let parts = timePart.split(':');
        let hours = parseInt(parts[0], 10) || 0;
        let minutes = parseInt(parts[1], 10) || 0;
        
        if (isPM) {
          if (hours < 12) hours += 12;
        } else if (isAM) {
          if (hours === 12) hours = 0;
        } else {
          if (hours >= 1 && hours <= 7) hours += 12;
        }
        return hours * 60 + minutes;
      };

      snap.forEach(d => {
        const c = d.data();
        if (c.fecha && c.fecha.trim() === selectedDate.trim()) {
          const estado = (c.estado || '').toLowerCase().trim();
          
          // Verificamos si es un bloqueo o una cita activa (que no esté cancelada)
          const esBloqueo = estado === 'bloqueo' || estado === 'bloqueado' || c.tipo === 'bloqueo';
          const esCitaActiva = estado !== 'cancelada' && estado !== 'cancelado';

          if (esBloqueo || esCitaActiva) {
            const startMin = parseToMin(c.hora);
            let duracionMinutos = c.duracionTotal ? parseInt(c.duracionTotal, 10) || 45 : 45;
            const endMin = c.horaFin ? parseToMin(c.horaFin) : (startMin !== null ? startMin + duracionMinutos : null);

            if (startMin !== null) {
              timesList.forEach(t => {
                const tMin = parseToMin(t);
                let estaEnRango = (endMin !== null && endMin > startMin) ? (tMin >= startMin && tMin < endMin) : (tMin === startMin);
                if (estaEnRango) bookedSet.add(t);
              });
            }
          }
        }
      });
      setHorasOcupadas(Array.from(bookedSet));
    });

    return () => unsubscribe();
  }, [barberoId, selectedDate, barber]);

  const toggleServiceSelection = (service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id || s.name === service.name);
      if (exists) {
        return prev.filter(s => s.id !== service.id && s.name !== service.name);
      } else {
        return [...prev, service];
      }
    });
  };

  const removeServiceTag = (id, name, e) => {
    e.stopPropagation();
    setSelectedServices(prev => prev.filter(s => s.id !== id && s.name !== name));
  };

  const totalPrecioNum = selectedServices.reduce((acc, curr) => acc + (Number(curr.priceNum) || 0), 0);
  const formatCOP = (num) => `$${num.toLocaleString('es-CO')} COP`;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (selectedServices.length === 0) return alert("Selecciona al menos un servicio o paquete.");
    if (!form.nombre || !form.apellido || !form.email || !form.telefono || !form.direccion) return alert("Completa los campos obligatorios (*).");
    try {
      const bookingData = {
        barberoId, 
        barberoName: barber.name, 
        fecha: selectedDate, 
        hora: selectedTime,
        servicios: selectedServices.map(s => ({
          nombre: s.name,
          precio: s.priceFormatted,
          precioNum: s.priceNum
        })),
        precioTotal: formatCOP(totalPrecioNum),
        clienteNombre: `${form.nombre} ${form.apellido}`,
        email: form.email,
        ...form, 
        referencia: form.referencia || 'N/A', 
        torreApto: form.torreApto || 'N/A', 
        estado: 'confirmada', 
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "citas"), bookingData);

      const serviciosTexto = selectedServices.map(s => s.name).join(', ');
      const templateParamsClient = { to_name: bookingData.clienteNombre, to_email: form.email, barbero_nombre: barber.name, fecha_cita: selectedDate, hora_cita: selectedTime, servicios: serviciosTexto, total: bookingData.precioTotal };
      const templateParamsBarber = { to_name: barber.name, to_email: barber.email || "yohaldryquintero1995@gmail.com", cliente_nombre: bookingData.clienteNombre, cliente_telefono: form.telefono, fecha_cita: selectedDate, hora_cita: selectedTime, direccion: form.direccion, torre_apto: form.torreApto || 'N/A', referencia: form.referencia || 'N/A', servicios: serviciosTexto, total: bookingData.precioTotal };

      await Promise.all([
        emailjs.send("service_z91pc3e", 'template_qqht1ab', templateParamsClient, "JkBxr3kN07cKntGLN"),
        emailjs.send("service_z91pc3e", 'template_reteht9', templateParamsBarber, "JkBxr3kN07cKntGLN")
      ]);

      setDetalleCita(bookingData);
      setModalType('success');
      if (onBookingComplete) onBookingComplete(bookingData);
    } catch (err) { 
      console.error(err);
      alert("La cita se guardó pero hubo un error al enviar los correos."); 
    }
  };

  if (loading) return <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex items-center justify-center text-xs">Cargando perfil...</div>;
  if (error || !barber) return <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex items-center justify-center p-6 text-center text-xs text-red-400">{error}</div>;

  const listaSoloServicios = barber.services.filter(s => s.categoria !== 'paquete');
  const listaSoloPaquetes = barber.services.filter(s => s.categoria === 'paquete');

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex flex-col justify-between overflow-hidden relative shadow-2xl border border-neutral-900">
      <div className="absolute inset-0 z-0">
        <img src={barber.image} alt={barber.name} className="w-full h-full object-cover object-top filter brightness-100 contrast-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/60 to-neutral-950/10" />
      </div>

      <div className="relative z-10 px-5 pt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-neutral-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide uppercase text-neutral-300">Agenda 24h Activa</span>
        </div>
        <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-400 text-xs font-semibold">
          <FiStar className="fill-amber-400" /><span>{barber.rating} ({barber.reviewsCount})</span>
        </div>
      </div>

      <div className="relative z-10 px-5 flex flex-col justify-end pb-3 space-y-2 mt-auto">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-[10px] font-medium tracking-wider uppercase mb-0.5"><FiAward /><span>Profesional Certificado</span></div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">{barber.name}</h1>
          <p className="text-neutral-300 text-[11px] flex items-center mt-0.5 mb-1"><FiMapPin className="text-indigo-400 mr-1 shrink-0" /><span className="truncate">{barber.location}</span></p>
          <div className="relative">
            <p className={`text-neutral-300 text-[10px] leading-relaxed bg-neutral-900/50 backdrop-blur-sm p-2 rounded-xl border border-neutral-800/80 transition-all ${showFullBio ? '' : 'line-clamp-2'}`}>
              {barber.bio}
            </p>
            {barber.bio && barber.bio.length > 80 && (
              <button onClick={() => setShowFullBio(!showFullBio)} className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 mt-1 cursor-pointer">
                {showFullBio ? 'Ver menos' : 'Ver más...'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setModalType('servicios')} className="bg-neutral-900/80 border border-neutral-800 hover:border-indigo-500/60 p-2 rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer">
              <div className="flex items-center justify-between w-full mb-0.5">
                <span className="text-[11px] font-bold text-indigo-300 uppercase flex items-center"><FiScissors className="mr-1.5" /> Servicios</span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold">Ver</span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">Cortes y barba</p>
            </button>

            <button onClick={() => setModalType('paquetes')} className="bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/60 p-2 rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer">
              <div className="flex items-center justify-between w-full mb-0.5">
                <span className="text-[11px] font-bold text-emerald-300 uppercase flex items-center"><FiPackage className="mr-1.5" /> Paquetes</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-semibold">Ver</span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">Combos especiales</p>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-12 overflow-y-auto scrollbar-none">
            {selectedServices && selectedServices.length > 0 ? (
              selectedServices.map(s => {
                const serviceColor = s.color || '#3b82f6';
                return (
                  <span 
                    key={s.id || s.name} 
                    style={{ backgroundColor: `${serviceColor}33`, borderColor: `${serviceColor}`, color: '#f8fafc' }}
                    className="inline-flex items-center text-[10px] px-2.5 py-1 rounded-lg border font-medium shadow-sm"
                  >
                    <span className="w-2.5 h-2.5 rounded-full mr-1.5 inline-block shrink-0 shadow-sm" style={{ backgroundColor: serviceColor }}></span>
                    <span className="font-bold mr-1">{s.name}</span>
                    <span className="opacity-75 mr-1.5">({s.priceFormatted})</span>
                    <button type="button" onClick={(e) => removeServiceTag(s.id, s.name, e)} className="hover:text-red-400 opacity-75 hover:opacity-100 transition-opacity ml-1 cursor-pointer">
                      <FiX size={12} />
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="text-[10px] text-neutral-400 italic bg-neutral-900/60 px-2.5 py-1 rounded-lg border border-neutral-800">Selecciona al menos un servicio o paquete arriba</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-300 flex items-center px-0.5"><FiCalendar className="mr-1 text-indigo-400" /> Fecha</span>
            <input type="date" value={selectedDate} min={todayStr} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }} className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer" />
          </div>

          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-300 flex items-center px-0.5"><FiClock className="mr-1 text-indigo-400" /> Hora</span>
            <button type="button" onClick={() => setModalType('horas')} className="w-full bg-neutral-900/90 border border-neutral-800 hover:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-left flex items-center justify-between cursor-pointer transition-all">
              <span className={selectedTime ? "text-emerald-400 font-bold truncate" : "text-neutral-400 truncate"}>{selectedTime || "Seleccionar..."}</span>
              <FiArrowRight className="text-indigo-400 shrink-0 ml-1" />
            </button>
          </div>
        </div>

        <div className="pt-0.5">
          <motion.button whileTap={{ scale: 0.98 }} disabled={!selectedTime || selectedServices.length === 0} onClick={() => setModalType('form')} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl shadow-xl flex items-center justify-between cursor-pointer">
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-wider opacity-80 font-semibold">
                {selectedServices.length} {selectedServices.length === 1 ? 'servicio seleccionado' : 'servicios seleccionados'}
              </span>
              <span className="text-sm font-extrabold">{formatCOP(totalPrecioNum)}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-black/20 px-3 py-1.5 rounded-lg text-xs">
              <span className="uppercase tracking-wider">Continuar</span><FiArrowRight />
            </div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {modalType && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
            <motion.div initial={{ opacity: 0, y: 300 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 300 }} className="w-full max-h-[85vh] bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-5 flex flex-col overflow-y-auto shadow-2xl text-white">
              
              {modalType === 'horas' && (
                <>
                  <div className="flex justify-between items-center mb-3 border-b border-neutral-800 pb-2.5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center"><FiClock className="mr-1.5" /> Disponibilidad de Horas</h3>
                      <p className="text-[10px] text-neutral-400">Fecha: {selectedDate}</p>
                    </div>
                    <button onClick={() => setModalType(null)} className="bg-neutral-800 p-1.5 rounded-full hover:bg-neutral-700 text-neutral-300"><FiX size={16} /></button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[50vh] pr-1 py-1">
                    {all24Hours.map((time) => {
                      const isOccupied = horasOcupadas.includes(time.toUpperCase());
                      const isSelected = selectedTime === time;

                      if (isOccupied) {
                        return (
                          <div key={time} className="bg-red-950/40 border border-red-900/60 text-red-400 py-2.5 px-2 rounded-xl text-[11px] font-bold text-center opacity-80 cursor-not-allowed select-none flex flex-col items-center justify-center">
                            <span className="line-through text-red-400">{time}</span>
                            <span className="text-[8px] text-red-400 uppercase tracking-wider mt-0.5">Ocupado</span>
                          </div>
                        );
                      }

                      return (
                        <button key={time} type="button" onClick={() => { setSelectedTime(time); setModalType(null); }} className={`py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex flex-col items-center justify-center ${isSelected ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40 scale-[1.02]' : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-600'}`}>
                          <span>{time}</span>
                          <span className="text-[8px] text-emerald-400 uppercase tracking-wider mt-0.5">Disponible</span>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setModalType(null)} className="w-full mt-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer">Cerrar</button>
                </>
              )}

              {modalType === 'servicios' && (
                <>
                  <div className="flex justify-between items-center mb-3 border-b border-neutral-800 pb-2.5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center"><FiScissors className="mr-1.5" /> Selecciona Servicios</h3>
                      <p className="text-[10px] text-neutral-400">Puedes elegir uno o varios servicios.</p>
                    </div>
                    <button onClick={() => setModalType(null)} className="bg-neutral-800 p-1.5 rounded-full hover:bg-neutral-700 text-neutral-300"><FiX size={16} /></button>
                  </div>
                  <div className="space-y-2.5 overflow-y-auto max-h-[50vh] pr-1">
                    {listaSoloServicios.map(s => {
                      const isSelected = selectedServices.some(item => item.id === s.id || item.name === s.name);
                      return (
                        <div key={s.id} onClick={() => toggleServiceSelection(s)} className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-950/30 border-indigo-500 text-white shadow-md shadow-indigo-950/50' : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2.5">
                              {s.imagen || s.image ? (
                                <img src={s.imagen || s.image} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0 mt-0.5" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-indigo-400 font-bold shrink-0 mt-0.5"><FiScissors size={18} /></div>
                              )}
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800/50 mb-0.5">Servicio</span>
                                <h4 className="text-xs font-bold text-white">{s.name}</h4>
                                {s.descripcion && <p className="text-[10px] text-neutral-400 font-light mt-1 line-clamp-2 leading-relaxed">{s.descripcion}</p>}
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors mt-1 shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-neutral-700 bg-neutral-900'}`}>
                              {isSelected && <FiCheck size={10} />}
                            </div>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-end">
                            <span className="text-xs font-extrabold text-indigo-300">{s.priceFormatted}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setModalType(null)} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-900/30">Listo y Continuar</button>
                </>
              )}

              {modalType === 'paquetes' && (
                <>
                  <div className="flex justify-between items-center mb-3 border-b border-neutral-800 pb-2.5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center"><FiPackage className="mr-1.5" /> Selecciona Paquetes</h3>
                      <p className="text-[10px] text-neutral-400">Combos especiales con descuento</p>
                    </div>
                    <button onClick={() => setModalType(null)} className="bg-neutral-800 p-1.5 rounded-full hover:bg-neutral-700 text-neutral-300"><FiX size={16} /></button>
                  </div>
                  <div className="space-y-2.5 overflow-y-auto max-h-[50vh] pr-1">
                    {listaSoloPaquetes.length === 0 ? (
                      <p className="text-center text-xs text-neutral-500 py-6">No hay paquetes disponibles por el momento.</p>
                    ) : (
                      listaSoloPaquetes.map(p => {
                        const isSelected = selectedServices.some(item => item.id === p.id || item.name === p.name);
                        return (
                          <div key={p.id} onClick={() => toggleServiceSelection(p)} className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-md shadow-emerald-950/50' : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-2.5">
                                {p.imagen || p.image ? (
                                  <img src={p.imagen || p.image} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0 mt-0.5" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-emerald-400 font-bold shrink-0 mt-0.5"><FiPackage size={18} /></div>
                                )}
                                <div>
                                  <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/50 mb-0.5">Paquete Especial</span>
                                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                                  {p.descripcion && <p className="text-[10px] text-neutral-400 font-light mt-1 line-clamp-2 leading-relaxed">{p.descripcion}</p>}
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors mt-1 shrink-0 ${isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-neutral-700 bg-neutral-900'}`}>
                                {isSelected && <FiCheck size={10} />}
                              </div>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-end">
                              <span className="text-xs font-extrabold text-emerald-300">{p.priceFormatted}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <button onClick={() => setModalType(null)} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-900/30">Listo y Continuar</button>
                </>
              )}

              {modalType === 'form' && (
                <>
                  <div className="flex justify-between items-center mb-3 border-b border-neutral-800 pb-2.5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Completa tus datos</h3>
                      <p className="text-[10px] text-neutral-400">{selectedDate} - {selectedTime}</p>
                    </div>
                    <button onClick={() => setModalType(null)} className="bg-neutral-800 p-1.5 rounded-full hover:bg-neutral-700 text-neutral-300"><FiX size={16} /></button>
                  </div>
                  <form onSubmit={handleBooking} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[9px] uppercase font-semibold text-neutral-400 flex items-center"><FiUser className="mr-1 text-indigo-400" /> Nombre *</label><input type="text" name="nombre" required value={form.nombre} onChange={handleChange} placeholder="Tu nombre" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" /></div>
                      <div className="space-y-1"><label className="text-[9px] uppercase font-semibold text-neutral-400">Apellido *</label><input type="text" name="apellido" required value={form.apellido} onChange={handleChange} placeholder="Tu apellido" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" /></div>
                    </div>
                    <div className="space-y-1"><label className="text-[9px] uppercase font-semibold text-neutral-400 flex items-center"><FiMail className="mr-1 text-indigo-400" /> Correo Electrónico *</label><input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="tucorreo@email.com" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" /></div>
                    <div className="space-y-1"><label className="text-[9px] uppercase font-semibold text-neutral-400 flex items-center"><FiPhone className="mr-1 text-indigo-400" /> Teléfono / WhatsApp *</label><input type="tel" name="telefono" required value={form.telefono} onChange={handleChange} placeholder="Ej: 3001234567" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" /></div>
                    <div className="space-y-1"><label className="text-[9px] uppercase font-semibold text-neutral-400 flex items-center"><FiHome className="mr-1 text-indigo-400" /> Dirección Exacta *</label><input type="text" name="direccion" required value={form.direccion} onChange={handleChange} placeholder="Calle, Carrera, etc." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[9px] uppercase font-semibold text-neutral-400 flex items-center"><FiInfo className="mr-1 text-indigo-400" /> Torre y Apto</label><input type="text" name="torreApto" value={form.torreApto} onChange={handleChange} placeholder="Ej: Torre 2, Apto 504" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" /></div>
                      <div className="space-y-1"><label className="text-[9px] uppercase font-semibold text-neutral-400">Referencia</label><input type="text" name="referencia" value={form.referencia} onChange={handleChange} placeholder="Ej: Cerca al parque" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" /></div>
                    </div>
                    <div className="flex items-center space-x-2.5 bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl cursor-pointer">
                      <input type="checkbox" id="parqueaderoMoto" name="parqueaderoMoto" checked={form.parqueaderoMoto} onChange={handleChange} className="w-4 h-4 accent-indigo-600 rounded cursor-pointer" />
                      <label htmlFor="parqueaderoMoto" className="text-xs text-neutral-300 flex items-center space-x-2 cursor-pointer select-none"><RiMotorbikeLine className="text-indigo-400 text-base" /><span>¿Parqueadero disponible para moto?</span></label>
                    </div>
                    <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all mt-1 cursor-pointer text-xs uppercase tracking-wider"><FiCheckCircle className="text-base" /><span>Confirmar y Agendar Cita</span></motion.button>
                  </form>
                </>
              )}

              {modalType === 'success' && detalleCita && (
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-col items-center text-center pb-2 border-b border-neutral-800">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-1.5"><FiCheckCircle size={20} /></div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">¡Cita Agendada con Éxito!</h3>
                    <p className="text-[10px] text-neutral-400">Detalles de tu confirmación de servicios</p>
                  </div>
                  <div className="space-y-1.5 bg-neutral-950 border border-neutral-800/80 p-3 rounded-xl text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Profesional:</span><span className="font-semibold text-white">{detalleCita.barberoName}</span></div>
                    <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Servicios:</span><span className="font-semibold text-indigo-400 text-right">{detalleCita.servicios.map(s => s.nombre).join(', ')}</span></div>
                    <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Fecha y Hora:</span><span className="font-semibold text-white">{detalleCita.fecha} - {detalleCita.hora}</span></div>
                    <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Cliente:</span><span className="font-semibold text-white">{detalleCita.clienteNombre}</span></div>
                    <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Correo:</span><span className="font-semibold text-white">{detalleCita.email}</span></div>
                    <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Teléfono:</span><span className="font-semibold text-white">{detalleCita.telefono}</span></div>
                    <div className="flex justify-between py-1"><span className="text-neutral-400">Total a Pagar:</span><span className="font-bold text-emerald-400">{detalleCita.precioTotal}</span></div>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <button onClick={() => { setModalType(null); setDetalleCita(null); setForm({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', referencia: '', torreApto: '', parqueaderoMoto: false }); }} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">Volver a Agendar</button>
                    <button onClick={() => window.location.reload()} className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">Finalizar</button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BarberBookingView;