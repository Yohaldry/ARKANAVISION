import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiMapPin, FiClock, FiCalendar, FiScissors, FiCheckCircle, FiArrowRight, FiAward, FiUser, FiPhone, FiHome, FiInfo, FiX, FiPackage, FiCheck } from 'react-icons/fi';
import { RiMotorbikeLine } from 'react-icons/ri';
import { db } from '../../components/firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';

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
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', direccion: '', referencia: '', torreApto: '', parqueaderoMoto: false });

  // Generar automáticamente las 24 horas del día en formato de 12 horas (AM/PM)
  const generate24Hours = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      const hour24 = i;
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
      const ampm = hour24 < 12 ? 'AM' : 'PM';
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
          listaServicios.push({ 
            id: s.id, 
            name: sData.nombre, 
            descripcion: sData.descripcion || sData.description || '',
            duration: parseInt(sData.duracion) || 45, 
            priceNum: typeof sData.precio === 'number' ? sData.precio : parseInt(String(sData.precio || '35000').replace(/[^0-9]/g, '')) || 35000,
            priceFormatted: sData.precioText || sData.precio || '$35.000 COP', 
            categoria: sData.categoria || 'servicio' 
          });
        });
        if (!listaServicios.length) {
          listaServicios = [
            { id: '1', name: "Corte Mid Fade", duration: 45, priceNum: 35000, priceFormatted: "$35.000 COP", categoria: 'servicio' },
            { id: 'p1', name: "Paquete VIP (Corte + Barba)", duration: 60, priceNum: 55000, priceFormatted: "$55.000 COP", categoria: 'paquete' }
          ];
        }
        
        setBarber({
          id: docSnap.id, name: data.nombre || "Profesional", location: data.ciudad || "Bogotá D.C.", rating: "4.9", reviewsCount: 28,
          image: data.foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
          bio: data.descripcion || data.biografia || "Experto en visagismo y tendencias.", services: listaServicios,
          availableTimes: all24Hours
        });
        setSelectedServices([listaServicios[0]]);
      } catch (err) { setError("Error al conectar con la base de datos."); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [barberoId]);

  // Convierte texto de hora a minutos exactos del día (0 a 1439)
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toUpperCase().replace(/\./g, '').replace('A M', 'AM').replace('P M', 'PM');
    const [time, modifier] = clean.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + (minutes || 0);
  };

  useEffect(() => {
    if (!barberoId) return;
    return onSnapshot(query(collection(db, "citas"), where("barberoId", "==", barberoId)), (snap) => {
      const booked = [];
      const timesList = barber?.availableTimes || all24Hours;

      snap.forEach(d => {
        const c = d.data();
        if (c.fecha === selectedDate) {
          const estado = c.estado?.toLowerCase() || '';
          if (!['cancelada', 'cancelado'].includes(estado)) {
            // Si el bloqueo o cita tiene un rango de horas (inicio y fin)
            if (c.hora && c.horaFin) {
              const startMin = timeToMinutes(c.hora);
              const endMin = timeToMinutes(c.horaFin);

              timesList.forEach(t => {
                const tMin = timeToMinutes(t);
                // Si la hora se encuentra dentro del rango bloqueado
                if (tMin >= startMin && tMin <= endMin) {
                  booked.push(t.toUpperCase());
                }
              });
            } else if (c.hora) {
              // Cita o bloqueo de una sola hora exacta
              let horaLimpia = c.hora.trim().toUpperCase()
                .replace(/\./g, '')
                .replace('A M', 'AM')
                .replace('P M', 'PM');
              booked.push(horaLimpia);
            }
          }
        }
      });
      setHorasOcupadas([...new Set(booked)]);
    });
  }, [barberoId, selectedDate, barber]);

  const toggleServiceSelection = (service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const removeServiceTag = (id, e) => {
    e.stopPropagation();
    if (selectedServices.length === 1) return;
    setSelectedServices(prev => prev.filter(s => s.id !== id));
  };

  const totalPrecioNum = selectedServices.reduce((acc, curr) => acc + (curr.priceNum || 0), 0);
  const totalDuracion = selectedServices.reduce((acc, curr) => acc + (curr.duration || 45), 0);
  const formatCOP = (num) => `$${num.toLocaleString('es-CO')} COP`;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.telefono || !form.direccion) return alert("Completa los campos obligatorios (*).");
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
        duracionTotal: `${totalDuracion} min`,
        clienteNombre: `${form.nombre} ${form.apellido}`,
        ...form, 
        referencia: form.referencia || 'N/A', 
        torreApto: form.torreApto || 'N/A', 
        estado: 'pendiente', 
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "citas"), bookingData);
      setDetalleCita(bookingData);
      setModalType('success');
      if (onBookingComplete) onBookingComplete(bookingData);
    } catch (err) { alert("No se pudo completar la reserva."); }
  };

  if (loading) return <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex items-center justify-center text-xs">Cargando perfil...</div>;
  if (error || !barber) return <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex items-center justify-center p-6 text-center text-xs text-red-400">{error}</div>;

  const listaSoloServicios = barber.services.filter(s => s.categoria !== 'paquete');
  const listaSoloPaquetes = barber.services.filter(s => s.categoria === 'paquete');

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex flex-col justify-between overflow-hidden relative shadow-2xl border border-neutral-900">
      <div className="absolute inset-0 z-0">
        <img src={barber.image} alt={barber.name} className="w-full h-full object-cover object-top filter brightness-95 contrast-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-neutral-950/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-transparent" />
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
            <p className={`text-neutral-400 text-[10px] leading-relaxed bg-neutral-900/60 backdrop-blur-sm p-2 rounded-xl border border-neutral-800/80 transition-all ${showFullBio ? '' : 'line-clamp-2'}`}>
              {barber.bio}
            </p>
            {barber.bio && barber.bio.length > 80 && (
              <button onClick={() => setShowFullBio(!showFullBio)} className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 mt-1 cursor-pointer focus:outline-none">
                {showFullBio ? 'Ver menos' : 'Ver más...'}
              </button>
            )}
          </div>
        </div>

        {/* Recuadros Servicios y Paquetes */}
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setModalType('servicios')} className="bg-neutral-900/80 border border-neutral-800 hover:border-indigo-500/60 p-2 rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer">
              <div className="flex items-center justify-between w-full mb-0.5">
                <span className="text-[11px] font-bold text-indigo-300 uppercase flex items-center"><FiScissors className="mr-1.5" /> Servicios</span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold">Ver</span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">Cortes y barba</p>
            </button>

            <button onClick={() => setModalType('paquetes')} className="bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/60 p-2 rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer">
              <div className="flex items-center justify-between w-full mb-0.5">
                <span className="text-[11px] font-bold text-emerald-300 uppercase flex items-center"><FiPackage className="mr-1.5" /> Paquetes</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-semibold">Ver</span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">Combos especiales</p>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-12 overflow-y-auto scrollbar-none">
            {selectedServices.map(s => {
              const isPaq = s.categoria === 'paquete';
              return (
                <span key={s.id} className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-lg border ${isPaq ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300' : 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300'}`}>
                  <span className="font-semibold mr-1">{s.name}</span>
                  <span className="opacity-75 mr-1.5">({s.priceFormatted})</span>
                  {selectedServices.length > 1 && (
                    <button onClick={(e) => removeServiceTag(s.id, e)} className="hover:text-red-400 transition-colors"><FiX size={12} /></button>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Selector de Fecha */}
        <div className="space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 flex items-center px-0.5"><FiCalendar className="mr-1 text-indigo-400" /> Fecha de la Cita</span>
          <input type="date" value={selectedDate} min={todayStr} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }} className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer" />
        </div>

        {/* Listado de 24 Horas (Disponibles y Ocupadas/Bloqueadas) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center px-0.5">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 flex items-center"><FiClock className="mr-1 text-indigo-400" /> Horarios 24h Disponibles</span>
            {selectedTime && <span className="text-[9px] text-emerald-400 font-bold">Seleccionado: {selectedTime}</span>}
          </div>
          
          <div className="grid grid-cols-4 gap-1 max-h-24 overflow-y-auto pr-1">
            {all24Hours.map((time) => {
              const isOccupied = horasOcupadas.includes(time.toUpperCase());
              const isSelected = selectedTime === time;

              if (isOccupied) {
                return (
                  <div
                    key={time}
                    className="bg-red-950/40 border border-red-900/50 text-red-400 py-1 px-1 rounded-lg text-[9px] font-bold text-center opacity-70 cursor-not-allowed select-none flex flex-col items-center justify-center"
                  >
                    <span>{time}</span>
                    <span className="text-[7px] text-red-300">Ocupado</span>
                  </div>
                );
              }

              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-1.5 px-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40 scale-[1.02]'
                      : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-600'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón de Confirmación Principal */}
        <div className="pt-0.5">
          <motion.button whileTap={{ scale: 0.98 }} disabled={!selectedTime} onClick={() => setModalType('form')} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl shadow-xl flex items-center justify-between cursor-pointer">
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-wider opacity-80 font-semibold">{selectedServices.length} {selectedServices.length === 1 ? 'servicio' : 'servicios'}</span>
              <span className="text-sm font-extrabold">{formatCOP(totalPrecioNum)} <span className="text-[10px] font-normal opacity-80">({totalDuracion} min)</span></span>
            </div>
            <div className="flex items-center space-x-1.5 bg-black/20 px-3 py-1.5 rounded-lg text-xs">
              <span className="uppercase tracking-wider">Continuar</span><FiArrowRight />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Modales Genéricos */}
      <AnimatePresence>
        {modalType && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
            <motion.div initial={{ opacity: 0, y: 300 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 300 }} className="w-full max-h-[85vh] bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-5 flex flex-col overflow-y-auto shadow-2xl text-white">
              
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
                      const isSelected = selectedServices.some(item => item.id === s.id);
                      return (
                        <div key={s.id} onClick={() => toggleServiceSelection(s)} className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-950/30 border-indigo-500 text-white shadow-md shadow-indigo-950/50' : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2.5">
                              {s.imagen || s.image ? (
                                <img src={s.imagen || s.image} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0 mt-0.5" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-indigo-400 font-bold shrink-0 mt-0.5">
                                  <FiScissors size={18} />
                                </div>
                              )}
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800/50 mb-0.5">Servicio</span>
                                <h4 className="text-xs font-bold text-white">{s.name}</h4>
                                {(s.descripcion || s.description) && (
                                  <p className="text-[10px] text-neutral-400 font-light mt-1 line-clamp-2 leading-relaxed">
                                    {s.descripcion || s.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors mt-1 shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-neutral-700 bg-neutral-900'}`}>
                              {isSelected && <FiCheck size={10} />}
                            </div>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                            <div className="flex items-center text-[10px] text-neutral-400">
                              <FiClock className="mr-1" size={11} /> {s.duration} minutos
                            </div>
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
                        const isSelected = selectedServices.some(item => item.id === p.id);
                        return (
                          <div key={p.id} onClick={() => toggleServiceSelection(p)} className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-md shadow-emerald-950/50' : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-2.5">
                                {p.imagen || p.image ? (
                                  <img src={p.imagen || p.image} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0 mt-0.5" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-emerald-400 font-bold shrink-0 mt-0.5">
                                    <FiPackage size={18} />
                                  </div>
                                )}
                                <div>
                                  <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/50 mb-0.5">Paquete Especial</span>
                                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                                  {(p.descripcion || p.description) && (
                                    <p className="text-[10px] text-neutral-400 font-light mt-1 line-clamp-2 leading-relaxed">
                                      {p.descripcion || p.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors mt-1 shrink-0 ${isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-neutral-700 bg-neutral-900'}`}>
                                {isSelected && <FiCheck size={10} />}
                              </div>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                              <div className="flex items-center text-[10px] text-neutral-400">
                                <FiClock className="mr-1" size={11} /> {p.duration} minutos
                              </div>
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
                    <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Teléfono:</span><span className="font-semibold text-white">{detalleCita.telefono}</span></div>
                    <div className="flex justify-between py-1"><span className="text-neutral-400">Total a Pagar:</span><span className="font-bold text-emerald-400">{detalleCita.precioTotal}</span></div>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <button onClick={() => { setModalType(null); setDetalleCita(null); setForm({ nombre: '', apellido: '', telefono: '', direccion: '', referencia: '', torreApto: '', parqueaderoMoto: false }); }} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">Volver a Agendar</button>
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