import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // 1. Importar useParams
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, 
  FiMapPin, 
  FiClock, 
  FiCalendar, 
  FiScissors, 
  FiCheckCircle, 
  FiArrowRight, 
  FiAward 
} from 'react-icons/fi';

const BarberBookingView = ({ barber = defaultBarber, onBookingComplete }) => {
  const [selectedService, setSelectedService] = useState(barber.services[0]);
  const [selectedTime, setSelectedTime] = useState(barber.availableTimes[0]);
  const [isBooked, setIsBooked] = useState(false);
  
  // 2. Extraer el barberoId correctamente dentro del componente
  const { barberoId } = useParams();

  const handleBooking = () => {
    setIsBooked(true);
    // Aquí puedes usar barberoId para enviar la reserva a tu base de datos si lo necesitas
    console.log("Reservando con el barbero ID:", barberoId);
    
    if (onBookingComplete) onBookingComplete({ service: selectedService, time: selectedTime, barberoId });
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-neutral-950 text-white flex flex-col justify-between overflow-hidden relative font-sans shadow-2xl border border-neutral-900">
      
      {/* Background Hero Image with Deep Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={barber.image} 
          alt={barber.name} 
          className="w-full h-full object-cover object-top filter brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-transparent" />
      </div>

      {/* Top Header / Status Bar */}
      <div className="relative z-10 px-5 pt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-neutral-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide uppercase text-neutral-300">Disponible Hoy</span>
        </div>
        <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-400 text-xs font-semibold">
          <FiStar className="fill-amber-400" />
          <span>{barber.rating} ({barber.reviewsCount})</span>
        </div>
      </div>

      {/* Middle Content Space - Pinned above footer */}
      <div className="relative z-10 px-5 flex flex-col justify-end pb-3 space-y-3 mt-auto">
        
        {/* Barber Info Profile */}
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-medium tracking-wider uppercase mb-1">
            <FiAward />
            <span>Master Barber & Visagism Expert</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
            {barber.name}
          </h1>
          <p className="text-neutral-300 text-xs flex items-center mt-1">
            <FiMapPin className="text-amber-400 mr-1 shrink-0" />
            <span className="truncate">{barber.location}</span>
          </p>
        </div>

        {/* Services Horizontal Scroll Selector */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-neutral-400 px-0.5">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 flex items-center">
              <FiScissors className="mr-1 text-amber-400" /> Selecciona el Servicio
            </span>
            <span className="text-amber-400 font-medium">{selectedService.price}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {barber.services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-2.5 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                  selectedService.id === service.id 
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10' 
                    : 'bg-neutral-900/60 backdrop-blur-md border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span className="text-xs font-semibold truncate">{service.name}</span>
                <span className="text-[10px] text-neutral-400 flex items-center mt-1">
                  <FiClock className="mr-1" /> {service.duration}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots Selector */}
        <div className="space-y-1.5">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400 flex items-center px-0.5">
            <FiCalendar className="mr-1 text-amber-400" /> Horarios Disponibles Hoy
          </span>
          
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {barber.availableTimes.map((time, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTime(time)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 border transition-all ${
                  selectedTime === time
                    ? 'bg-amber-500 border-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-neutral-900/60 backdrop-blur-md border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Action Footer */}
        <div className="pt-1">
          <AnimatePresence mode="wait">
            {!isBooked ? (
              <motion.button
                key="book-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBooking}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold py-3.5 px-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-between transition-all"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">Total a pagar</span>
                  <span className="text-base font-extrabold">{selectedService.price}</span>
                </div>
                <div className="flex items-center space-x-2 bg-neutral-950/10 px-4 py-2 rounded-lg">
                  <span className="text-xs uppercase tracking-wider">Reservar Cita</span>
                  <FiArrowRight className="text-base" />
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-emerald-500/20 border border-emerald-500/50 py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-emerald-400 font-semibold text-sm backdrop-blur-md"
              >
                <FiCheckCircle className="text-lg" />
                <span>¡Cita reservada con éxito a las {selectedTime}!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

// Default Mock Data for immediate usage / testing
const defaultBarber = {
  name: "Yohaldry Quintero",
  location: "Barber Studio, Zona Rosa, Bogotá",
  rating: 4.9,
  reviewsCount: 142,
  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  services: [
    { id: 1, name: "Corte Fade + Visagismo", duration: "45 min", price: "$45.000 COP" },
    { id: 2, name: "Barba VIP + Toalla Caliente", duration: "30 min", price: "$30.000 COP" }
  ],
  availableTimes: ["03:30 PM", "04:30 PM", "05:15 PM", "06:00 PM"]
};

export default BarberBookingView;