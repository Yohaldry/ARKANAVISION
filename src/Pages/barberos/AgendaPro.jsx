import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, Scissors, CheckCircle, ChevronRight, ArrowLeft, ChevronLeft, Sparkles, Building2, Home, CreditCard, Loader2, MessageSquare } from 'lucide-react';
import { ref, push } from "firebase/database";
import { rtdb } from "../../components/firebase"; // Asegúrate de ajustar esta ruta según la ubicación real de tu archivo firebase.js

const servicesList = [
  { id: 1, nombre: 'Corte', precio: '70.000 COP' },
  { id: 2, nombre: 'Barba', precio: '40.000 COP' },
  { id: 3, nombre: 'Corte y Barba', precio: '120.000 COP' },
  { id: 4, nombre: 'Combo VIP Total', precio: '200.000 COP' },
  { id: 5, nombre: 'Cejas', precio: '30.000 COP', f: true },
];

export default function AgendaPro({ isOpen, onClose }) {
  const [rnd, setRnd] = useState(false);
  const [sho, setSho] = useState(false);
  const [ld, setLd] = useState(false);
  const [st, setSt] = useState(1);
  const [sM, setSM] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cdt, setCdt] = useState(new Date(2026, 8, 25));
  const [sDt, setSDt] = useState('2026-09-25');
  const [sTm, setSTm] = useState('10:00 AM');
  const [fd, setFd] = useState({ nombre: '', apellido: '', whatsapp: '', direccion: '', torre: '', apto: '', metodoPago: 'Efectivo', servicio: servicesList[2] });

  useEffect(() => {
    if (isOpen) { setRnd(true); setTimeout(() => setSho(true), 15); }
    else { setSho(false); setTimeout(() => setRnd(false), 300); }
  }, [isOpen]);

  if (!rnd) return null;

  const mN = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const y = cdt.getFullYear();
  const m = cdt.getMonth();
  
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDayIndex = new Date(y, m, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(y, m, i + 1);
    return { n: i + 1, full: `${y}-${String(m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`, av: d.getDay() !== 0 };
  });
  
  const cDays = [...Array(firstDayIndex).fill({ empty: true }), ...days];

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (ld) return;
    setLd(true);

    try {
      const datosCita = {
        nombre: String(fd?.nombre || "").trim(),
        apellido: String(fd?.apellido || "").trim(),
        whatsapp: String(fd?.whatsapp || "").trim(),
        direccion: String(fd?.direccion || "").trim(),
        torre: String(fd?.torre || "").trim(),
        apto: String(fd?.apto || "").trim(),
        metodop: String(fd?.metodoPago || "Efectivo"),
        servicio: String(fd?.servicio?.nombre || fd?.servicio || "Corte"),
        precio: String(fd?.servicio?.precio || "0"),
        fecha: String(sDt || ""),
        hora: String(sTm || ""),
        createdAt: new Date().toISOString()
      };

      console.log("Intentando escribir en la ruta: servicios");

      const nuevaCitaRef = ref(rtdb, "servicios");
      await push(nuevaCitaRef, datosCita);

      console.log("¡Cita guardada con éxito!");
      setSuccessModal(true); // Activa el modal con estilo Arkana
    } catch (err) {
      console.error("Error detallado de permisos:", err);
      alert("Error al guardar: " + err.message);
    } finally {
      setLd(false);
    }
  };

  const finishAndOpenWhatsApp = () => {
    window.open(`https://wa.me/573332548430?text=¡Hola Kintero! Cita:%0A📅 ${sDt} - ${sTm}%0A✂️ ${fd.servicio.nombre} (${fd.servicio.precio})%0A👤 ${fd.nombre} ${fd.apellido}%0A📱 ${fd.whatsapp}%0A📍 ${fd.direccion} ${fd.torre ? `(Torre ${fd.torre})` : ''} ${fd.apto ? `(Apto ${fd.apto})` : ''}%0A💳 ${fd.metodoPago}`, '_blank');
    setSuccessModal(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${sho ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`relative w-full max-w-lg bg-[#060a14] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${sho ? 'scale-100 translate-y-0' : 'scale-95 translate-y-6'}`}>
        
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-[#030712]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-lime-400 flex items-center justify-center text-black font-black text-xs">K</div>
            <div>
              <h3 className="text-xs font-black uppercase text-white flex items-center gap-1.5">Agenda VIP <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" /></h3>
              <p className="text-[10px] text-cyan-400 font-semibold">Bogotá Norte • Kintero Studio</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 relative min-h-[440px] flex flex-col justify-between">
          
          {/* PASO 1 */}
          <div className={`space-y-4 ${st === 1 ? 'block' : 'hidden'}`}>
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> 1. Día</label>
                <div className="flex items-center gap-2 bg-[#0b1329] border border-cyan-500/30 px-3 py-1 rounded-xl">
                  <button type="button" onClick={() => setCdt(new Date(y, m - 1, 1))} className="text-cyan-400 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-xs font-black text-white uppercase">{mN[m]} {y}</span>
                  <button type="button" onClick={() => setCdt(new Date(y, m + 1, 1))} className="text-cyan-400 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d, i) => <span key={i} className="text-[10px] font-extrabold text-cyan-400">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {cDays.map((it, idx) => it.empty ? (
                  <div key={`e-${idx}`} />
                ) : (
                  <button type="button" key={`d-${it.n}`} disabled={!it.av} onClick={() => setSDt(it.full)} className={`py-2 rounded-xl text-center cursor-pointer ${!it.av ? 'opacity-20 bg-red-500/10' : sDt === it.full ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-black font-black scale-105' : 'bg-[#0b1329] border border-cyan-500/20 text-gray-200'}`}>
                    <span className="text-xs font-bold">{it.n}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5 mb-2.5"><Clock className="w-4 h-4" /> 2. Hora</label>
              <div className="grid grid-cols-4 gap-2">
                {['08:00 AM', '10:00 AM', '12:00 PM', '02:30 PM', '04:30 PM', '06:00 PM', '08:00 PM'].map((t, i) => (
                  <button type="button" key={i} onClick={() => setSTm(t)} className={`py-2 px-2 rounded-xl text-xs font-bold flex justify-between cursor-pointer ${sTm === t ? 'bg-cyan-400 text-black scale-105' : 'bg-[#0b1329] border border-cyan-500/20 text-gray-300'}`}>
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => setSt(2)} className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 text-black">
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* PASO 2 */}
          <div className={`space-y-3.5 ${st === 2 ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/20">
              <button type="button" onClick={() => setSt(1)} className="flex items-center gap-1 text-xs text-cyan-400 cursor-pointer font-semibold"><ArrowLeft className="w-4 h-4" /> Volver</button>
              <span className="text-[11px] bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-xl text-cyan-300 font-mono">{sDt} • {sTm}</span>
            </div>

            <div onClick={() => setSM(true)} className="w-full bg-[#0b1329] border border-fuchsia-500/50 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#0e1730]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400"><Scissors className="w-4 h-4" /></div>
                <div>
                  <h4 className="text-xs font-bold text-white">{fd.servicio.nombre}</h4>
                  <p className="text-[10px] text-fuchsia-400 font-mono">{fd.servicio.precio}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-black bg-fuchsia-400 px-3 py-1.5 rounded-xl">Cambiar</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative"><User className="absolute left-3.5 top-2.5 w-4 h-4 text-cyan-400" /><input type="text" placeholder="Nombre" value={fd.nombre} onChange={e => setFd({...fd, nombre: e.target.value})} className="w-full bg-[#0b1329] border border-cyan-500/30 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white" /></div>
              <input type="text" placeholder="Apellido" value={fd.apellido} onChange={e => setFd({...fd, apellido: e.target.value})} className="w-full bg-[#0b1329] border border-cyan-500/30 rounded-xl py-2.5 px-3 text-xs text-white" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative"><Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-lime-400" /><input type="tel" placeholder="WhatsApp" value={fd.whatsapp} onChange={e => setFd({...fd, whatsapp: e.target.value})} className="w-full bg-[#0b1329] border border-lime-500/30 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white" /></div>
              <div className="relative"><MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-lime-400" /><input type="text" placeholder="Dirección" value={fd.direccion} onChange={e => setFd({...fd, direccion: e.target.value})} className="w-full bg-[#0b1329] border border-lime-500/30 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white" /></div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="relative"><Building2 className="absolute left-3 top-2.5 w-3.5 h-3.5 text-amber-400" /><input type="text" placeholder="Torre" value={fd.torre} onChange={e => setFd({...fd, torre: e.target.value})} className="w-full bg-[#0b1329] border border-amber-500/30 rounded-xl py-2.5 pl-8 pr-2 text-xs text-white" /></div>
              <div className="relative"><Home className="absolute left-3 top-2.5 w-3.5 h-3.5 text-amber-400" /><input type="text" placeholder="Apto" value={fd.apto} onChange={e => setFd({...fd, apto: e.target.value})} className="w-full bg-[#0b1329] border border-amber-500/30 rounded-xl py-2.5 pl-8 pr-2 text-xs text-white" /></div>
              <div className="relative"><CreditCard className="absolute left-3 top-2.5 w-3.5 h-3.5 text-amber-400" />
                <select value={fd.metodoPago} onChange={e => setFd({...fd, metodoPago: e.target.value})} className="w-full bg-[#0b1329] border border-amber-500/30 rounded-xl py-2.5 pl-8 pr-1 text-[11px] text-white appearance-none cursor-pointer">
                  {['Efectivo', 'Nequi / Daviplata', 'Transferencia'].map((m, i) => <option key={i} value={m} className="bg-[#0b1329]">{m}</option>)}
                </select>
              </div>
            </div>

            <button type="button" disabled={ld} onClick={handleSubmit} className="w-full bg-gradient-to-r from-lime-400 via-cyan-400 to-fuchsia-500 text-black font-black py-3.5 rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-2">
              {ld ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Confirmar Cita
            </button>
          </div>

        </div>
      </div>

      {/* SUBMODAL SERVICIOS */}
      {sM && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#060a14] border border-fuchsia-500/50 rounded-2xl p-4 flex flex-col space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-fuchsia-500/20">
              <h3 className="text-xs font-black uppercase text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-fuchsia-400" /> Elige Servicio</h3>
              <button type="button" onClick={() => setSM(false)} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {servicesList.map((s) => (
                <div key={s.id} onClick={() => { setFd({...fd, servicio: s}); setSM(false); }} className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${s.f ? 'col-span-2' : ''} ${fd.servicio.id === s.id ? 'border-fuchsia-400 bg-fuchsia-500/20' : 'border-cyan-500/30 bg-[#0b1329]'}`}>
                  <span className="text-xs font-black text-white">{s.nombre}</span>
                  <span className="text-[10px] font-mono text-fuchsia-300">{s.precio}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALERTA DE ÉXITO ESTILO ARKANA */}
      {successModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-sm bg-[#060a14] border-2 border-cyan-400/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_0_30px_rgba(34,211,238,0.3)] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-lime-400 flex items-center justify-center text-black shadow-lg animate-bounce">
              <CheckCircle className="w-8 h-8 text-black" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center justify-center gap-1.5">
                ¡Cita Registrada! <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              </h3>
              <p className="text-xs text-cyan-300 mt-1 font-mono">Arkana Vision • Kintero Studio</p>
            </div>
            <div className="w-full bg-[#0b1329] border border-cyan-500/30 rounded-xl p-3 text-left space-y-1 text-xs text-gray-300 font-mono">
              <p><strong className="text-cyan-400">Cliente:</strong> {fd.nombre} {fd.apellido}</p>
              <p><strong className="text-fuchsia-400">Servicio:</strong> {fd.servicio.nombre}</p>
              <p><strong className="text-lime-400">Fecha:</strong> {sDt} ({sTm})</p>
            </div>
            <button type="button" onClick={finishAndOpenWhatsApp} className="w-full py-3.5 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-lime-400 text-black font-black uppercase rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] transition-transform">
              <MessageSquare className="w-4 h-4" /> Enviar Comprobante a WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}