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
    return [
      { label: '12:00 a. m.', val24: '00:00' }, { label: '1:00 a. m.', val24: '01:00' },
      { label: '2:00 a. m.', val24: '02:00' }, { label: '3:00 a. m.', val24: '03:00' },
      { label: '4:00 a. m.', val24: '04:00' }, { label: '5:00 a. m.', val24: '05:00' },
      { label: '6:00 a. m.', val24: '06:00' }, { label: '7:00 a. m.', val24: '07:00' },
      { label: '8:00 a. m.', val24: '08:00' }, { label: '9:00 a. m.', val24: '09:00' },
      { label: '10:00 a. m.', val24: '10:00' }, { label: '11:00 a. m.', val24: '11:00' },
      { label: '12:00 p. m.', val24: '12:00' }, { label: '1:00 p. m.', val24: '13:00' },
      { label: '2:00 p. m.', val24: '14:00' }, { label: '3:00 p. m.', val24: '15:00' },
      { label: '4:00 p. m.', val24: '16:00' }, { label: '5:00 p. m.', val24: '17:00' },
      { label: '6:00 p. m.', val24: '18:00' }, { label: '7:00 p. m.', val24: '19:00' },
      { label: '8:00 p. m.', val24: '20:00' }, { label: '9:00 p. m.', val24: '21:00' },
      { label: '10:00 p. m.', val24: '22:00' }, { label: '11:00 p. m.', val24: '23:00' }
    ];
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
            color: sData.color || '#0284c7'
          });
        });
     
        setBarber({
          id: docSnap.id, 
          name: data.nombre || "Profesional", 
          email: data.email || "", 
          location: data.ciudad || "Bogotá D.C.", 
          rating: "4.9", 
          reviewsCount: 231,
          image: data.foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
          bio: data.descripcion || data.biografia || "Experto en visagismo y tendencias.", 
          horarioSemanal: data.horarioSemanal || {},
          services: listaServicios,
          availableTimes: all24Hours.map(h => h.label)
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
        let clean = str.toString().toLowerCase().trim();
        
        let isPM = clean.includes('p. m.') || clean.includes('pm') || clean.includes('p.m.');
        let isAM = clean.includes('a. m.') || clean.includes('am') || clean.includes('a.m.');

        let timePart = clean.replace(/[^0-9:]/g, '').trim();
        let parts = timePart.split(':');
        let hours = parseInt(parts[0], 10) || 0;
        let minutes = parseInt(parts[1], 10) || 0;
        
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        if (!isPM && !isAM && hours >= 1 && hours <= 7) hours += 12;

        return hours * 60 + minutes;
      };

      snap.forEach(d => {
        const c = d.data();
        if (c.fecha && c.fecha.trim() === selectedDate.trim()) {
          const estado = (c.estado || '').toLowerCase().trim();
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

  if (loading) return <div className="w-full h-screen max-w-md mx-auto bg-slate-50 text-slate-800 flex items-center justify-center text-xs font-mono">Cargando perfil...</div>;
  if (error || !barber) return <div className="w-full h-screen max-w-md mx-auto bg-slate-50 text-slate-800 flex items-center justify-center p-6 text-center text-xs text-red-500 font-mono">{error}</div>;

  const listaSoloServicios = barber.services.filter(s => s.categoria !== 'paquete');
  const listaSoloPaquetes = barber.services.filter(s => s.categoria === 'paquete');

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white text-slate-900 flex flex-col justify-between overflow-y-auto relative shadow-2xl border border-slate-200 font-mono">
      
      {/* Cabecera Distribuida: Logo Grande Izquierda, Perfil Centro, Calificación Derecha */}
      <div className="relative w-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 pt-4 pb-12 px-4 shrink-0 overflow-hidden shadow-md">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-sky-400/35 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-400/35 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          
          {/* Izquierda: Logo Grande en formato insignia */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/25 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shrink-0">
              <img 
                src="https://res.cloudinary.com/dtkirmtfq/image/upload/v1791241981/Visarka/mxmsobksbvrii384mlja.png" 
                alt="Logo Visarka" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black tracking-widest text-white leading-none">VISARKA</span>
              <span className="text-[8px] font-bold text-sky-200 uppercase mt-0.5">Domicilios</span>
            </div>
          </div>

          {/* Derecha: Calificación y Estrellas */}
          <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-amber-500 text-xs font-black shadow-md border border-sky-100">
            <FiStar className="fill-amber-400 text-amber-400 text-sm" /><span>{barber.rating}</span>
            <span className="text-slate-400 text-[10px] font-medium">({barber.reviewsCount})</span>
          </div>

        </div>

        {/* Mensaje destacado en el centro */}
        <div className="relative z-10 text-center mt-3">
          <span className="text-[10px] font-black tracking-wider uppercase text-sky-100 bg-black/20 px-3.5 py-1 rounded-full border border-sky-400/30 shadow-xs inline-block">
            ✨ Tu profesional favorito a Domicilio
          </span>
        </div>
      </div>

      {/* Foto de Perfil Central Circular sobrepuesta y Datos Principales */}
      <div className="px-5 relative pb-3 border-b border-slate-100 bg-white shrink-0">
        <div className="flex justify-center -mt-14 mb-2">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-sky-400 to-blue-600 shadow-xl">
            <img src={barber.image} alt={barber.name} className="w-full h-full rounded-full object-cover object-top bg-white" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">{barber.name}</h1>
          <p className="text-slate-500 text-[10px] flex items-center justify-center font-bold">
            <FiMapPin className="text-blue-600 mr-1 shrink-0" /><span>{barber.location}</span>
          </p>
          <div className="relative pt-1">
            <p className={`text-slate-600 text-[10px] leading-relaxed bg-sky-50/50 p-2 rounded-xl border border-sky-100 transition-all ${showFullBio ? '' : 'line-clamp-2'}`}>
              {barber.bio}
            </p>
            {barber.bio && barber.bio.length > 80 && (
              <button onClick={() => setShowFullBio(!showFullBio)} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 mt-1 cursor-pointer">
                {showFullBio ? 'Ver menos' : 'Ver más...'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Central: Servicios y Horarios */}
      <div className="px-5 py-3 space-y-3 flex-1 bg-slate-50/50">
        
        {/* Botones de Servicios y Paquetes */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setModalType('servicios')} className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 hover:border-blue-400 p-2.5 rounded-2xl text-left transition-all flex flex-col justify-between cursor-pointer shadow-2xs">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[10px] font-black text-blue-900 uppercase flex items-center"><FiScissors className="mr-1.5 text-blue-600" /> Servicios</span>
              <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold shadow-2xs">Ver</span>
            </div>
            <p className="text-[9px] text-slate-500 truncate font-medium">Cortes y estilos profesionales</p>
          </button>

          <button onClick={() => setModalType('paquetes')} className="bg-gradient-to-br from-sky-50 to-emerald-50 border border-emerald-200 hover:border-emerald-400 p-2.5 rounded-2xl text-left transition-all flex flex-col justify-between cursor-pointer shadow-2xs">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[10px] font-black text-emerald-900 uppercase flex items-center"><FiPackage className="mr-1.5 text-emerald-600" /> Paquetes</span>
              <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold shadow-2xs">Ver</span>
            </div>
            <p className="text-[9px] text-slate-500 truncate font-medium">Combos especiales</p>
          </button>
        </div>

        {/* Resumen de Servicios Seleccionados */}
        <div className="space-y-1">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Servicios Seleccionados:</span>
          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
            {selectedServices && selectedServices.length > 0 ? (
              selectedServices.map(s => {
                const serviceColor = s.color || '#0284c7';
                return (
                  <span 
                    key={s.id || s.name} 
                    style={{ backgroundColor: `${serviceColor}15`, borderColor: `${serviceColor}40`, color: '#0f172a' }}
                    className="inline-flex items-center text-[10px] px-2.5 py-1 rounded-lg border font-bold shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full mr-1.5 inline-block shrink-0" style={{ backgroundColor: serviceColor }}></span>
                    <span className="mr-1">{s.name}</span>
                    <span className="text-blue-600 mr-1.5">({s.priceFormatted})</span>
                    <button type="button" onClick={(e) => removeServiceTag(s.id, s.name, e)} className="hover:text-rose-600 transition-colors ml-1 cursor-pointer">
                      <FiX size={12} />
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="text-[10px] text-slate-400 italic">Ningún servicio seleccionado todavía. Toca "Servicios" o "Paquetes".</span>
            )}
          </div>
        </div>

        {/* Selección de Fecha y Hora */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[9px] text-slate-600 flex items-center"><FiCalendar className="mr-1 text-blue-600" /> Fecha</span>
            <input type="date" value={selectedDate} min={todayStr} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs" />
          </div>

          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[9px] text-slate-600 flex items-center"><FiClock className="mr-1 text-blue-600" /> Hora Disponible</span>
            <button type="button" onClick={() => setModalType('horas')} className="w-full bg-white border border-slate-200 hover:border-blue-600 rounded-xl px-3 py-2 text-xs text-left flex items-center justify-between cursor-pointer transition-all shadow-2xs">
              <span className={selectedTime ? "text-emerald-600 font-black truncate" : "text-slate-400 truncate font-medium"}>{selectedTime || "Seleccionar..."}</span>
              <FiArrowRight className="text-blue-600 shrink-0 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Botón de Continuar / Reserva */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <motion.button whileTap={{ scale: 0.98 }} disabled={!selectedTime || selectedServices.length === 0} onClick={() => setModalType('form')} className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 disabled:opacity-40 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-between cursor-pointer transition-all">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider opacity-90 font-bold">
              {selectedServices.length} {selectedServices.length === 1 ? 'servicio' : 'servicios'}
            </span>
            <span className="text-sm font-black">{formatCOP(totalPrecioNum)}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-xs font-black">
            <span className="uppercase tracking-wider">Continuar</span><FiArrowRight />
          </div>
        </motion.button>
      </div>

      {/* Modales Interactivos */}
      <AnimatePresence>
        {modalType && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4">
            <motion.div initial={{ opacity: 0, y: 300 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 300 }} className="w-full max-h-[85vh] bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl p-5 flex flex-col overflow-y-auto shadow-2xl text-slate-800 font-mono">
              
              {/* Modal de Horas */}
             {modalType === 'horas' && (() => {
  const fechaObj = new Date(selectedDate + 'T00:00:00');
  const diasSemanaNombres = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const nombreDia = diasSemanaNombres[fechaObj.getDay()];

  const horarioSemanal = barber?.horarioSemanal || {};
  const configDia = horarioSemanal[nombreDia];

  const tieneHorario = configDia && typeof configDia.abierto === 'boolean';
  const estaCerrado = tieneHorario ? !configDia.abierto : false;

  const parseToMin = (str) => {
    if (!str) return 0;
    let clean = str.toString().toLowerCase().trim();
    let isPM = clean.includes('p. m.') || clean.includes('pm') || clean.includes('p.m.');
    let isAM = clean.includes('a. m.') || clean.includes('am') || clean.includes('a.m.');
    let timePart = clean.replace(/[^0-9:]/g, '').trim();
    let parts = timePart.split(':');
    let hours = parseInt(parts[0], 10) || 0;
    let minutes = parseInt(parts[1], 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const minApertura = tieneHorario && configDia.apertura ? parseToMin(configDia.apertura) : null;
  const minCierre = tieneHorario && configDia.cierre ? parseToMin(configDia.cierre) : null;

  const horasFiltradas = all24Hours.filter((item) => {
    if (!tieneHorario) return true;
    if (estaCerrado) return false;
    
    const minHoraItem = parseToMin(item.label);
    if (minApertura !== null && minCierre !== null) {
      return minHoraItem >= minApertura && minHoraItem < minCierre;
    }
    return true;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center">
            <FiClock className="mr-1.5 text-blue-600" /> Horas Disponibles
          </h3>
          <p className="text-[9px] text-slate-500">Fecha: {selectedDate}</p>
        </div>
        <button onClick={() => setModalType(null)} className="bg-slate-100 p-1.5 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer">
          <FiX size={16} />
        </button>
      </div>
      
      {estaCerrado ? (
        <div className="py-8 text-center bg-rose-50 border border-rose-100 rounded-2xl p-4">
          <p className="text-xs font-black text-rose-600 uppercase">🚫 No hay servicio este día</p>
          <p className="text-[10px] text-slate-500 mt-1">El profesional no labora los días {nombreDia}s.</p>
        </div>
      ) : horasFiltradas.length === 0 ? (
        <div className="py-8 text-center bg-sky-50 border border-sky-100 rounded-2xl p-4">
          <p className="text-xs font-black text-blue-900 uppercase">No hay horarios configurados</p>
          <p className="text-[10px] text-slate-500 mt-1">Por favor selecciona otra fecha.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[50vh] pr-1 py-1">
          {horasFiltradas.map((itemTime) => {
            const time = itemTime.label;
            const isOccupied = horasOcupadas.includes(time.toLowerCase());
            const isSelected = selectedTime === time;

            if (isOccupied) {
              return (
                <div key={time} className="bg-rose-50 border border-rose-200 text-rose-500 py-2.5 px-2 rounded-xl text-[10px] font-bold text-center opacity-70 select-none flex flex-col items-center justify-center shadow-2xs">
                  <span className="line-through">{time}</span>
                  <span className="text-[8px] uppercase tracking-wider mt-0.5">Ocupado</span>
                </div>
              );
            }

            return (
              <button 
                key={time} 
                type="button" 
                onClick={() => { setSelectedTime(time); setModalType(null); }} 
                className={`py-2.5 px-2 rounded-xl text-[10px] font-black transition-all cursor-pointer border flex flex-col items-center justify-center ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]' 
                    : 'bg-sky-50/80 border-sky-200 text-blue-900 hover:bg-sky-100'
                }`}
              >
                <span>{time}</span>
                <span className="text-[8px] text-blue-600 uppercase tracking-wider mt-0.5 font-bold">Disponible</span>
              </button>
            );
          })}
        </div>
      )}

      <button onClick={() => setModalType(null)} className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer">
        Cerrar
      </button>
    </>
  );
})()}

              {/* Modal de Servicios */}
              {modalType === 'servicios' && (
                <>
                  <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center"><FiScissors className="mr-1.5 text-blue-600" /> Todos los Servicios</h3>
                      <p className="text-[9px] text-slate-500">Selecciona uno o varios servicios.</p>
                    </div>
                    <button onClick={() => setModalType(null)} className="bg-slate-100 p-1.5 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"><FiX size={16} /></button>
                  </div>
                  <div className="space-y-2.5 overflow-y-auto max-h-[50vh] pr-1">
                    {listaSoloServicios.map(s => {
                      const isSelected = selectedServices.some(item => item.id === s.id || item.name === s.name);
                      return (
                        <div key={s.id} onClick={() => toggleServiceSelection(s)} className={`p-3 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-sky-50/80 border-blue-500 text-slate-900 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2.5">
                              <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center border border-sky-200 text-blue-600 font-bold shrink-0 mt-0.5"><FiScissors size={16} /></div>
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 mb-0.5">Servicio</span>
                                <h4 className="text-xs font-black text-slate-900">{s.name}</h4>
                                {s.descripcion && <p className="text-[9px] text-slate-500 font-medium mt-0.5 line-clamp-2">{s.descripcion}</p>}
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors mt-1 shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                              {isSelected && <FiCheck size={10} />}
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end">
                            <span className="text-xs font-black text-blue-600">{s.priceFormatted}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setModalType(null)} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md">Listo y Continuar</button>
                </>
              )}

              {/* Modal de Paquetes */}
              {modalType === 'paquetes' && (
                <>
                  <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center"><FiPackage className="mr-1.5 text-emerald-600" /> Paquetes Especiales</h3>
                      <p className="text-[9px] text-slate-500">Combos exclusivos con beneficios</p>
                    </div>
                    <button onClick={() => setModalType(null)} className="bg-slate-100 p-1.5 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"><FiX size={16} /></button>
                  </div>
                  <div className="space-y-2.5 overflow-y-auto max-h-[50vh] pr-1">
                    {listaSoloPaquetes.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">No hay paquetes disponibles por el momento.</p>
                    ) : (
                      listaSoloPaquetes.map(p => {
                        const isSelected = selectedServices.some(item => item.id === p.id || item.name === p.name);
                        return (
                          <div key={p.id} onClick={() => toggleServiceSelection(p)} className={`p-3 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-emerald-50/80 border-emerald-500 text-slate-900 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200 text-emerald-600 font-bold shrink-0 mt-0.5"><FiPackage size={16} /></div>
                                <div>
                                  <span className="inline-block px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-0.5">Paquete</span>
                                  <h4 className="text-xs font-black text-slate-900">{p.name}</h4>
                                  {p.descripcion && <p className="text-[9px] text-slate-500 font-medium mt-0.5 line-clamp-2">{p.descripcion}</p>}
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors mt-1 shrink-0 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                                {isSelected && <FiCheck size={10} />}
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end">
                              <span className="text-xs font-black text-emerald-600">{p.priceFormatted}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <button onClick={() => setModalType(null)} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md">Listo y Continuar</button>
                </>
              )}

              {/* Formulario de Datos del Cliente */}
              {modalType === 'form' && (
                <>
                  <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-blue-900">Completa tus datos</h3>
                      <p className="text-[9px] text-slate-500">{selectedDate} - {selectedTime}</p>
                    </div>
                    <button onClick={() => setModalType(null)} className="bg-slate-100 p-1.5 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"><FiX size={16} /></button>
                  </div>
                  <form onSubmit={handleBooking} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-600 flex items-center"><FiUser className="mr-1 text-blue-600" /> Nombre *</label><input type="text" name="nombre" required value={form.nombre} onChange={handleChange} placeholder="Tu nombre" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600" /></div>
                      <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-600">Apellido *</label><input type="text" name="apellido" required value={form.apellido} onChange={handleChange} placeholder="Tu apellido" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600" /></div>
                    </div>
                    <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-600 flex items-center"><FiMail className="mr-1 text-blue-600" /> Correo Electrónico *</label><input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="tucorreo@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600" /></div>
                    <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-600 flex items-center"><FiPhone className="mr-1 text-blue-600" /> Teléfono / WhatsApp *</label><input type="tel" name="telefono" required value={form.telefono} onChange={handleChange} placeholder="Ej: 3001234567" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600" /></div>
                    <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-600 flex items-center"><FiHome className="mr-1 text-blue-600" /> Dirección Exacta *</label><input type="text" name="direccion" required value={form.direccion} onChange={handleChange} placeholder="Calle, Carrera, etc." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-600 flex items-center"><FiInfo className="mr-1 text-blue-600" /> Torre y Apto</label><input type="text" name="torreApto" value={form.torreApto} onChange={handleChange} placeholder="Ej: Torre 2, Apto 504" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600" /></div>
                      <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-600">Referencia</label><input type="text" name="referencia" value={form.referencia} onChange={handleChange} placeholder="Ej: Cerca al parque" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600" /></div>
                    </div>
                    <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 p-2.5 rounded-xl cursor-pointer">
                      <input type="checkbox" id="parqueaderoMoto" name="parqueaderoMoto" checked={form.parqueaderoMoto} onChange={handleChange} className="w-4 h-4 accent-blue-600 rounded cursor-pointer" />
                      <label htmlFor="parqueaderoMoto" className="text-xs text-slate-700 font-bold flex items-center space-x-2 cursor-pointer select-none"><RiMotorbikeLine className="text-blue-600 text-base" /><span>¿Parqueadero disponible para moto?</span></label>
                    </div>
                    <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 text-white font-black py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all mt-2 cursor-pointer text-xs uppercase tracking-wider"><FiCheckCircle className="text-base" /><span>Confirmar y Agendar Cita</span></motion.button>
                  </form>
                </>
              )}

              {/* Modal de Éxito */}
              {modalType === 'success' && detalleCita && (
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-col items-center text-center pb-2 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-1.5"><FiCheckCircle size={20} /></div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700">¡Cita Agendada con Éxito!</h3>
                    <p className="text-[9px] text-slate-500">Te hemos enviado los detalles a tu correo electrónico.</p>
                  </div>
                  <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-medium">
                    <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">Profesional:</span><span className="font-bold text-slate-900">{detalleCita.barberoName}</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">Servicios:</span><span className="font-bold text-blue-600 text-right">{detalleCita.servicios.map(s => s.nombre).join(', ')}</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">Fecha y Hora:</span><span className="font-bold text-slate-900">{detalleCita.fecha} - {detalleCita.hora}</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">Cliente:</span><span className="font-bold text-slate-900">{detalleCita.clienteNombre}</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">Correo:</span><span className="font-bold text-slate-900">{detalleCita.email}</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">Teléfono:</span><span className="font-bold text-slate-900">{detalleCita.telefono}</span></div>
                    <div className="flex justify-between py-1"><span className="text-slate-500">Total a Pagar:</span><span className="font-black text-emerald-600">{detalleCita.precioTotal}</span></div>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <button onClick={() => { setModalType(null); setDetalleCita(null); setForm({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', referencia: '', torreApto: '', parqueaderoMoto: false }); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md">Volver a Agendar</button>
                    <button onClick={() => window.location.reload()} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">Finalizar</button>
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