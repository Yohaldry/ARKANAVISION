import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, FiMapPin, FiClock, FiCalendar, FiScissors, 
  FiCheckCircle, FiArrowRight, FiAward, FiUser, FiPhone, FiHome, FiInfo, FiX
} from 'react-icons/fi';
import { RiMotorbikeLine } from 'react-icons/ri';
import { db } from '../../components/firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';

const BarberBookingView = ({ onBookingComplete }) => {
  const { barberoId } = useParams();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isBooked, setIsBooked] = useState(false);
  const [detalleCitaCreada, setDetalleCitaCreada] = useState(null);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [clientForm, setClientForm] = useState({
    nombre: '', apellido: '', telefono: '', direccion: '', referencia: '', torreApto: '', parqueaderoMoto: false
  });

  // Consulta en Firestore del Perfil y Servicios Independientes del Barbero
  useEffect(() => {
    const fetchBarberAndServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const docSnap = await getDoc(doc(db, "profesionales", barberoId));
        if (!docSnap.exists()) {
          setError("No se encontró el perfil de este profesional en la base de datos.");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        
        // Obtener servicios creados por este barbero específico
        const servSnap = await getDocs(query(collection(db, "servicios"), where("barberoId", "==", barberoId)));
        let listaServicios = [];
        servSnap.forEach(s => listaServicios.push({ id: s.id, name: s.data().nombre, duration: s.data().duracion || '45 min', price: s.data().precio }));
        
        // Respaldo por defecto si el barbero aún no registra servicios
        if (listaServicios.length === 0) {
          listaServicios = [{ id: 1, name: "Corte Mid Fade", duration: "45 min", price: "$35.000 COP" }];
        }

        setBarber({
          id: docSnap.id,
          name: data.nombre || "Profesional",
          location: data.ciudad || "Bogotá D.C.",
          rating: "4.9",
          reviewsCount: 28,
          image: data.foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
          bio: data.descripcion || data.biografia || "Experto en visagismo y tendencias modernas.",
          services: listaServicios,
          availableTimes: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"]
        });

        setSelectedService(listaServicios[0]);
      } catch (err) {
        console.error(err);
        setError("Hubo un error al conectar con la base de datos.");
      } finally {
        setLoading(false);
      }
    };
    if (barberoId) fetchBarberAndServices();
  }, [barberoId]);

  // Sincronizar horas ocupadas en tiempo real
  useEffect(() => {
    if (!barberoId) return;
    const unsub = onSnapshot(query(collection(db, "citas"), where("barberoId", "==", barberoId)), (snapshot) => {
      const booked = [];
      snapshot.forEach(d => {
        const c = d.data();
        if (c.fecha === selectedDate && !['cancelada', 'cancelado'].includes(c.estado?.toLowerCase()) && c.hora) {
          booked.push(c.hora.trim().toUpperCase());
        }
      });
      setHorasOcupadas(booked);
    });
    return () => unsub();
  }, [barberoId, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClientForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!clientForm.nombre || !clientForm.apellido || !clientForm.telefono || !clientForm.direccion) {
      alert("Por favor completa los campos obligatorios (*).");
      return;
    }
    try {
      const bookingData = {
        barberoId, barberoName: barber.name, fecha: selectedDate, hora: selectedTime,
        servicio: selectedService.name, precio: selectedService.price,
        clienteNombre: `${clientForm.nombre} ${clientForm.apellido}`,
        telefono: clientForm.telefono, direccion: clientForm.direccion,
        referencia: clientForm.referencia || 'N/A', torreApto: clientForm.torreApto || 'N/A',
        parqueaderoMoto: clientForm.parqueaderoMoto, estado: 'pendiente', createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "citas"), bookingData);
      setIsModalOpen(false);
      setDetalleCitaCreada(bookingData);
      setIsBooked(true);
      if (onBookingComplete) onBookingComplete(bookingData);
    } catch (err) {
      alert("No se pudo completar la reserva.");
    }
  };

  if (loading) return <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex items-center justify-center font-['Poppins'] text-xs">Cargando perfil...</div>;
  if (error || !barber) return <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex items-center justify-center p-6 text-center font-['Poppins'] text-xs text-red-400">{error}</div>;

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex flex-col justify-between overflow-hidden relative font-['Poppins'] shadow-2xl border border-neutral-900">
      <div className="absolute inset-0 z-0">
        <img src={barber.image} alt={barber.name} className="w-full h-full object-cover object-top filter brightness-95 contrast-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 px-5 pt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-neutral-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide uppercase text-neutral-300">Agenda Activa</span>
        </div>
        <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-400 text-xs font-semibold">
          <FiStar className="fill-amber-400" />
          <span>{barber.rating} ({barber.reviewsCount})</span>
        </div>
      </div>

      <div className="relative z-10 px-5 flex flex-col justify-end pb-4 space-y-3 mt-auto">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-medium tracking-wider uppercase mb-0.5">
            <FiAward /><span>Profesional Certificado</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">{barber.name}</h1>
          <p className="text-neutral-300 text-[11px] flex items-center mt-0.5 mb-1.5">
            <FiMapPin className="text-indigo-400 mr-1 shrink-0" /><span className="truncate">{barber.location}</span>
          </p>
          <p className="text-neutral-400 text-[11px] leading-relaxed line-clamp-2 bg-neutral-900/60 backdrop-blur-sm p-2 rounded-xl border border-neutral-800/80">
            {barber.bio}
          </p>
        </div>

        <div className="space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 flex items-center px-0.5">
            <FiCalendar className="mr-1 text-indigo-400" /> Selecciona la Fecha
          </span>
          <input type="date" value={selectedDate} min={todayStr} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }} className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer" />
        </div>

        <div className="space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 flex items-center px-0.5">
            <FiScissors className="mr-1 text-indigo-400" /> Selecciona el Servicio
          </span>
          <div className="grid grid-cols-3 gap-1.5 max-h-28 overflow-y-auto scrollbar-none">
            {barber.services?.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-2 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                  selectedService?.id === service.id ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-neutral-900/60 backdrop-blur-md border-neutral-800 text-neutral-300'
                }`}
              >
                <span className="text-[10px] font-semibold truncate">{service.name}</span>
                <span className="text-[9px] text-neutral-400 flex items-center mt-1"><FiClock className="mr-1" /> {service.duration}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 flex items-center px-0.5">
            <FiClock className="mr-1 text-indigo-400" /> Horarios Disponibles
          </span>
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {barber.availableTimes?.map((time, idx) => {
              const isOcupado = horasOcupadas.includes(time.toUpperCase());
              return (
                <button
                  key={idx}
                  disabled={isOcupado}
                  onClick={() => !isOcupado && setSelectedTime(time)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium shrink-0 border transition-all flex flex-col items-center justify-center ${
                    isOcupado ? 'bg-red-500/15 border-red-500/60 text-red-400 cursor-not-allowed opacity-90' : selectedTime === time ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-md' : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <span>{time}</span>
                  <span className={`text-[8px] font-bold mt-0.5 uppercase ${isOcupado ? 'text-red-400' : 'text-transparent'}`}>{isOcupado ? 'Ocupado' : '.'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-1">
          <AnimatePresence mode="wait">
            {!isBooked ? (
              <motion.button
                key="book-btn"
                whileTap={{ scale: 0.98 }}
                disabled={!selectedTime || !selectedService}
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-xl flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">{selectedService?.name}</span>
                  <span className="text-base font-extrabold">{selectedService?.price}</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/20 px-4 py-2 rounded-lg">
                  <span className="text-xs uppercase tracking-wider">Reservar Cita</span>
                  <FiArrowRight className="text-base" />
                </div>
              </motion.button>
            ) : (
              <motion.div key="success-state" className="w-full bg-emerald-500/20 border border-emerald-500/50 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-emerald-400 font-semibold text-sm backdrop-blur-md">
                <FiCheckCircle className="text-lg" />
                <span>¡Cita reservada con éxito!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
            <motion.div initial={{ opacity: 0, y: 300 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 300 }} className="w-full max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-5 flex flex-col overflow-y-auto shadow-2xl text-white">
              <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">Completa tus datos</h3>
                  <p className="text-[11px] text-neutral-400">Reserva con {barber.name} ({selectedDate} - {selectedTime})</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-neutral-800 p-2 rounded-full hover:bg-neutral-700 text-neutral-300"><FiX size={16} /></button>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-neutral-400 flex items-center"><FiUser className="mr-1 text-indigo-400" /> Nombre *</label>
                    <input type="text" name="nombre" required value={clientForm.nombre} onChange={handleInputChange} placeholder="Tu nombre" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-neutral-400">Apellido *</label>
                    <input type="text" name="apellido" required value={clientForm.apellido} onChange={handleInputChange} placeholder="Tu apellido" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-neutral-400 flex items-center"><FiPhone className="mr-1 text-indigo-400" /> Teléfono / WhatsApp *</label>
                  <input type="tel" name="telefono" required value={clientForm.telefono} onChange={handleInputChange} placeholder="Ej: 3001234567" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-neutral-400 flex items-center"><FiHome className="mr-1 text-indigo-400" /> Dirección Exacta *</label>
                  <input type="text" name="direccion" required value={clientForm.direccion} onChange={handleInputChange} placeholder="Calle, Carrera, etc." className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-neutral-400 flex items-center"><FiInfo className="mr-1 text-indigo-400" /> Torre y Apto</label>
                    <input type="text" name="torreApto" value={clientForm.torreApto} onChange={handleInputChange} placeholder="Ej: Torre 2, Apto 504" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-neutral-400">Referencia</label>
                    <input type="text" name="referencia" value={clientForm.referencia} onChange={handleInputChange} placeholder="Ej: Cerca al parque" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-neutral-950 border border-neutral-800 p-3 rounded-xl cursor-pointer">
                  <input type="checkbox" id="parqueaderoMoto" name="parqueaderoMoto" checked={clientForm.parqueaderoMoto} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600 rounded cursor-pointer" />
                  <label htmlFor="parqueaderoMoto" className="text-xs text-neutral-300 flex items-center space-x-2 cursor-pointer select-none">
                    <RiMotorbikeLine className="text-indigo-400 text-base" />
                    <span>¿Hay parqueadero disponible para moto?</span>
                  </label>
                </div>
                <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all mt-2 cursor-pointer text-xs uppercase tracking-wider">
                  <FiCheckCircle className="text-base" />
                  <span>Confirmar y Agendar Cita</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBooked && detalleCitaCreada && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950/95 backdrop-blur-md p-5">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col space-y-4 shadow-2xl text-white">
              <div className="flex flex-col items-center text-center pb-3 border-b border-neutral-800">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                  <FiCheckCircle size={24} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">¡Cita Agendada con Éxito!</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">Detalles de tu confirmación de servicio</p>
              </div>

              <div className="space-y-2 bg-neutral-950 border border-neutral-800/80 p-3.5 rounded-xl text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Profesional:</span><span className="font-semibold text-white">{detalleCitaCreada.barberoName}</span></div>
                <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Servicio:</span><span className="font-semibold text-indigo-400">{detalleCitaCreada.servicio}</span></div>
                <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Fecha y Hora:</span><span className="font-semibold text-white">{detalleCitaCreada.fecha} - {detalleCitaCreada.hora}</span></div>
                <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Cliente:</span><span className="font-semibold text-white">{detalleCitaCreada.clienteNombre}</span></div>
                <div className="flex justify-evenly py-1 border-b border-neutral-900"><span className="text-neutral-400">Teléfono:</span><span className="font-semibold text-white">{detalleCitaCreada.telefono}</span></div>
                <div className="flex justify-between py-1 border-b border-neutral-900"><span className="text-neutral-400">Dirección:</span><span className="font-semibold text-white truncate max-w-[180px]">{detalleCitaCreada.direccion}</span></div>
                <div className="flex justify-between py-1"><span className="text-neutral-400">Total a Pagar:</span><span className="font-bold text-emerald-400">{detalleCitaCreada.precio}</span></div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button onClick={() => { setIsBooked(false); setDetalleCitaCreada(null); setClientForm({ nombre: '', apellido: '', telefono: '', direccion: '', referencia: '', torreApto: '', parqueaderoMoto: false }); }} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
                  Volver a Agendar
                </button>
                <button onClick={() => window.location.reload()} className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
                  Salir / Finalizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BarberBookingView;