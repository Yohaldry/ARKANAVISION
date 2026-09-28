import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Sparkles, CheckCircle2, Edit3, Save, RefreshCw, AlertCircle, 
  Plus, LayoutGrid, Tag, Smile, ArrowRight, AlertTriangle, 
  Loader2, ChevronLeft, ChevronRight, LogOut, X, BellRing, Ban, Share2, Copy
} from 'lucide-react';
import { signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs, setDoc, onSnapshot, addDoc } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';

const horasCalendario = [
  { label: '9:00 a. m.', val24: '09:00' }, { label: '10:00 a. m.', val24: '10:00' },
  { label: '11:00 a. m.', val24: '11:00' }, { label: '12:00 p. m.', val24: '12:00' },
  { label: '1:00 p. m.', val24: '13:00' }, { label: '2:00 p. m.', val24: '14:00' },
  { label: '3:00 p. m.', val24: '15:00' }, { label: '4:00 p. m.', val24: '16:00' },
  { label: '5:00 p. m.', val24: '17:00' }, { label: '6:00 p. m.', val24: '18:00' },
  { label: '7:00 p. m.', val24: '19:00' }, { label: '8:00 p. m.', val24: '20:00' }
];

export default function PanelProfesionales() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsgLogin, setErrorMsgLogin] = useState('');
  const [successMsgLogin, setSuccessMsgLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombreRegistro, setNombreRegistro] = useState('');

  const [activeTab, setActiveTab] = useState('agenda');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [vistaCalendario, setVistaCalendario] = useState('semanal');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);

  const [nuevaCitaNotificacion, setNuevaCitaNotificacion] = useState(null);
  const [showBloqueoModal, setShowBloqueoModal] = useState(false);
  const [fechaBloqueo, setFechaBloqueo] = useState('');
  const [horaInicioBloqueo, setHoraInicioBloqueo] = useState('09:00');
  const [horaFinBloqueo, setHoraFinBloqueo] = useState('11:00');
  const primerCargaRef = useRef(true);

  const [arrastrando, setArrastrando] = useState(false);
  const [celdaInicio, setCeldaInicio] = useState(null);
  const [fechaArrastre, setFechaArrastre] = useState('');
  const [showConfirmarBloqueoModal, setShowConfirmarBloqueoModal] = useState(false);
  const [rangoBloqueoPendiente, setRangoBloqueoPendiente] = useState(null);

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [nombre, setNombre] = useState('');
  const [experiencia, setExperiencia] = useState('1 a 3 años');
  const [ciudad, setCiudad] = useState('Bogotá D.C.');
  const [especialidad, setEspecialidad] = useState('Fade & Visagismo');
  const [citasFirestore, setCitasFirestore] = useState([]);
  const [serviciosFirebase, setServiciosFirebase] = useState([
    { id: 1, nombre: 'Corte Mid Fade', precio: '$35.000 COP', duracion: '45 min' },
    { id: 2, nombre: 'Visagismo y Estética Facial', precio: '$50.000 COP', duracion: '60 min' },
    { id: 3, nombre: 'Perfilado de Barba', precio: '$25.000 COP', duracion: '30 min' },
  ]);

  const reproducirSonidoAlerta = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator(); 
      const gain = audioCtx.createGain();
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      osc.connect(gain); 
      gain.connect(audioCtx.destination);
      osc.start(); 
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  const y = fechaSeleccionada.getFullYear();
  const m = fechaSeleccionada.getMonth();
  const diasDelMes = Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => {
    const d = new Date(y, m, i + 1);
    return { fechaObj: d, num: i + 1, nombre: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()] };
  });

  const cambiarMes = (dir) => { 
    const nueva = new Date(fechaSeleccionada); 
    nueva.setMonth(nueva.getMonth() + dir); 
    nueva.setDate(1); 
    setFechaSeleccionada(nueva); 
  };
  
  const getDiasVisibles = () => {
    const idx = Math.max(0, diasDelMes.findIndex(d => d.fechaObj.toDateString() === fechaSeleccionada.toDateString()));
    if (vistaCalendario === 'diario') return [diasDelMes[idx] || diasDelMes[0]];
    if (vistaCalendario === '3dias') return diasDelMes.slice(Math.max(0, idx - 1), Math.max(0, idx - 1) + 3);
    return diasDelMes.slice(Math.max(0, Math.min(idx - 3, diasDelMes.length - 7)), Math.max(0, Math.min(idx - 3, diasDelMes.length - 7)) + 7);
  };

  useEffect(() => {
    const calcTime = () => {
      const now = new Date();
      setCurrentTimeMinutes(Math.max(0, Math.min(100, (((now.getHours() * 60 + now.getMinutes()) - 540) / 660) * 100)));
    };
    calcTime();
    const t = setInterval(calcTime, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        const snap = await getDoc(doc(db, 'profesionales', user.uid));
        let nombreBarberoActual = 'José quintero';
        if (snap.exists()) {
          const d = snap.data();
          setNombre(d.nombre || 'Profesional'); 
          setCiudad(d.ciudad || 'Bogotá D.C.');
          setExperiencia(d.experiencia || '1 a 3 años'); 
          setEspecialidad(d.especialidad || 'Fade & Visagismo');
          nombreBarberoActual = d.nombre || 'José quintero';
        }
        getDocs(collection(db, 'servicios')).then(servSnap => {
          if (!servSnap.empty) setServiciosFirebase(servSnap.docs.map(i => ({ id: i.id, ...i.data() })));
        }).catch(() => {});

        const unsubCitas = onSnapshot(collection(db, 'citas'), (snapshot) => {
          const citasServer = [];
          let idsActuales = citasFirestore.map(c => c.id);

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.barberoId === user.uid || (data.barberoNombre && data.barberoNombre.toLowerCase().trim() === nombreBarberoActual.toLowerCase().trim()) || !data.barberoId) {
              let horaBD = data.hora || '10:00';
              if (horaBD.length === 5 && horaBD.includes(':')) {
                const matchHora = horasCalendario.find(h => h.val24 === horaBD);
                if (matchHora) horaBD = matchHora.label;
              }
              const estado = (data.estado || 'pendiente').toLowerCase();
              
              if (!primerCargaRef.current && !idsActuales.includes(docSnap.id) && estado !== 'cancelada' && estado !== 'bloqueado') {
                setNuevaCitaNotificacion({ cliente: data.clienteNombre || 'Cliente', servicio: data.servicio || 'Corte General', fecha: data.fecha || '', hora: horaBD });
                reproducirSonidoAlerta();
                setTimeout(() => setNuevaCitaNotificacion(null), 6000);
              }

              let colorClase = 'bg-indigo-50 border-indigo-200 text-indigo-950 font-semibold shadow-xs';
              if (estado === 'finalizada') colorClase = 'bg-slate-100 border-slate-200 text-slate-400 font-normal';
              if (estado === 'bloqueado') colorClase = 'bg-rose-50 border-rose-200 text-rose-700 font-bold';

              citasServer.push({
                id: docSnap.id, cliente: data.clienteNombre || 'BLOQUEADO', clienteTelefono: data.clienteTelefono || '',
                clienteEmail: data.clienteEmail || '', servicio: data.servicio || 'Horario no disponible',
                hora: horaBD, fechaStr: data.fecha || '', estado, color: colorClase, esBloqueo: estado === 'bloqueado'
              });
            }
          });

          primerCargaRef.current = false;
          setCitasFirestore(citasServer.filter(c => c.estado !== 'cancelada'));
        });
        return () => unsubCitas();
      } else { 
        setAuthUser(null); 
        setCitasFirestore([]); 
      }
      setAuthLoading(false);
    });
    const safety = setTimeout(() => setAuthLoading(false), 2000);
    return () => { unsubAuth(); clearTimeout(safety); };
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isRegistering && password !== confirmPassword) return setErrorMsgLogin('Las contraseñas no coinciden.');
    setLoginLoading(true);
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'profesionales', cred.user.uid), { uid: cred.user.uid, nombre: nombreRegistro || 'Socio', email: cred.user.email });
      } else { 
        await signInWithEmailAndPassword(auth, email, password); 
      }
      setSuccessMsgLogin('¡Éxito!');
    } catch { 
      setErrorMsgLogin('Verifica tus datos.'); 
      setLoginLoading(false); 
    }
  };

  const abrirModalCita = (cita) => setCitaSeleccionada(cita);

  const guardarBloqueoHorario = async (e) => {
    e.preventDefault();
    const idxInicio = horasCalendario.findIndex(h => h.val24 === horaInicioBloqueo);
    const idxFin = horasCalendario.findIndex(h => h.val24 === horaFinBloqueo);
    if (idxInicio > idxFin) return alert('La hora de inicio no puede ser posterior a la hora final.');

    setModalLoading(true);
    try {
      for (let i = idxInicio; i <= idxFin; i++) {
        await addDoc(collection(db, 'citas'), { 
          barberoId: authUser.uid, barberoNombre: nombre, clienteNombre: 'BLOQUEADO', clienteTelefono: '', 
          fecha: fechaBloqueo, hora: horasCalendario[i].val24, servicio: 'Horario No Disponible', estado: 'bloqueado' 
        });
      }
      setSuccessMsg('Rango bloqueado exitosamente'); 
      setShowBloqueoModal(false); 
      setFechaBloqueo('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { 
      setErrorMsg('Error al bloquear'); 
      setTimeout(() => setErrorMsg(''), 3000); 
    }
    setModalLoading(false);
  };

  const iniciarArrastre = (fechaStr, horaVal) => { setArrastrando(true); setCeldaInicio(horaVal); setFechaArrastre(fechaStr); };

  const finalizarArrastre = (fechaStr, horaFinVal) => {
    if (!arrastrando || fechaArrastre !== fechaStr) { setArrastrando(false); setCeldaInicio(null); return; }
    const idxInicio = horasCalendario.findIndex(h => h.val24 === celdaInicio);
    const idxFin = horasCalendario.findIndex(h => h.val24 === horaFinVal);
    if (idxInicio === -1 || idxFin === -1) { setArrastrando(false); return; }
    
    setRangoBloqueoPendiente({ 
      fecha: fechaStr, horaInicio: horasCalendario[Math.min(idxInicio, idxFin)].label, 
      horaFin: horasCalendario[Math.max(idxInicio, idxFin)].label, idxMin: Math.min(idxInicio, idxFin), idxMax: Math.max(idxInicio, idxFin) 
    });
    setShowConfirmarBloqueoModal(true); setArrastrando(false); setCeldaInicio(null);
  };

  const confirmarBloqueoArrastre = async () => {
    if (!rangoBloqueoPendiente) return;
    setModalLoading(true);
    try {
      for (let i = rangoBloqueoPendiente.idxMin; i <= rangoBloqueoPendiente.idxMax; i++) {
        await addDoc(collection(db, 'citas'), { 
          barberoId: authUser.uid, barberoNombre: nombre, clienteNombre: 'BLOQUEADO', clienteTelefono: '', 
          fecha: rangoBloqueoPendiente.fecha, hora: horasCalendario[i].val24, servicio: 'Horario No Disponible', estado: 'bloqueado' 
        });
      }
      setSuccessMsg('Bloqueo confirmado'); setShowConfirmarBloqueoModal(false); setRangoBloqueoPendiente(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { 
      setErrorMsg('Error al confirmar'); 
      setTimeout(() => setErrorMsg(''), 3000); 
    }
    setModalLoading(false);
  };

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono"><RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" /></div>;

  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-sm bg-white border border-slate-200 shadow-xl rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">AV</div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-900">{isRegistering ? 'Nuevo Registro' : 'Portal Profesionales'}</h3>
              <p className="text-[10px] text-slate-400">Arkana Vision</p>
            </div>
          </div>
          {errorMsgLogin && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[10px] flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{errorMsgLogin}</div>}
          <form onSubmit={handleAuth} className="space-y-3">
            {isRegistering && <input type="text" required placeholder="Nombre Completo" value={nombreRegistro} onChange={e => setNombreRegistro(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900 outline-none focus:border-indigo-600" />}
            <input type="email" required placeholder="correo@dominio.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900 outline-none focus:border-indigo-600" />
            <input type="password" required placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900 outline-none focus:border-indigo-600" />
            {isRegistering && <input type="password" required placeholder="Confirmar Contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900 outline-none focus:border-indigo-600" />}
            <button type="submit" disabled={loginLoading} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer">
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isRegistering ? 'Registrarse' : 'Acceder'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setErrorMsgLogin(''); }} className="w-full text-center text-[11px] font-bold text-indigo-600 cursor-pointer">
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    );
  }

  const diasVisibles = getDiasVisibles();
  
  // Enlace corregido para que coincida con la ruta limpia /reservar/:barberoId definida en App.jsx
  const linkReserva = `${window.location.origin}/reservar/${authUser.uid}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-mono flex flex-col justify-between pb-36 relative select-none">
      <header className="w-full bg-white border-b border-slate-200 px-3 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">AV</div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase text-slate-900">Hola, {nombre.split(' ')[0]}</span>
            <span className="text-[8px] text-slate-400 font-bold">{ciudad} • {especialidad}</span>
          </div>
        </div>
        <button onClick={() => setActiveTab('estadisticas')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"><Sparkles className="w-3.5 h-3.5" /></button>
      </header>

      {activeTab === 'agenda' && (
        <div className="bg-white border-b border-slate-200 px-3 py-2 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <button onClick={() => cambiarMes(-1)} className="p-1 bg-slate-50 border border-slate-200 rounded text-slate-600 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="text-[10px] font-black uppercase tracking-wide text-slate-700">{fechaSeleccionada.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => cambiarMes(1)} className="p-1 bg-slate-50 border border-slate-200 rounded text-slate-600 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex gap-1 overflow-x-auto py-1">
            {diasDelMes.map((d, i) => (
              <button key={i} onClick={() => setFechaSeleccionada(d.fechaObj)} className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl border shrink-0 cursor-pointer ${d.fechaObj.toDateString() === fechaSeleccionada.toDateString() ? 'bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <span className="text-[7px] uppercase opacity-80">{d.nombre}</span>
                <span className="text-[11px] font-black">{d.num}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Vista:</span>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {['diario', '3dias', 'semanal'].map(v => (
                <button key={v} onClick={() => setVistaCalendario(v)} className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold cursor-pointer transition ${vistaCalendario === v ? 'bg-white text-indigo-600 shadow-xs border border-slate-200' : 'text-slate-500'}`}>{v.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-2 w-full max-w-lg mx-auto overflow-x-hidden">
        {successMsg && <div className="mb-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{successMsg}</div>}
        {errorMsg && <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[10px] flex gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-red-600" />{errorMsg}</div>}

        {activeTab === 'agenda' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-1 relative overflow-hidden w-full">
            <div className="grid bg-slate-100 border-b border-slate-200 text-center text-[9px] font-black uppercase text-slate-500" style={{ gridTemplateColumns: `50px repeat(${diasVisibles.length}, minmax(0, 1fr))` }}>
              <div className="text-left pl-2 py-2 text-slate-400 font-bold text-[8px] border-r border-slate-200">Hora</div>
              {diasVisibles.map((d, i) => (
                <div key={i} className={`py-2 px-0.5 border-r border-slate-200 last:border-r-0 truncate ${d.fechaObj.toDateString() === fechaSeleccionada.toDateString() ? 'bg-indigo-50 text-indigo-900 font-black' : 'text-slate-600'}`}>{d.nombre.toUpperCase()} {d.num}</div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute left-0 right-0 z-30 flex items-center pointer-events-none" style={{ top: `${currentTimeMinutes}%` }}>
                <div className="w-[50px] bg-rose-500 text-white text-[7px] font-black text-center py-0.5 rounded-r">HOY</div>
                <div className="flex-1 border-t-2 border-rose-500"></div>
              </div>
              {horasCalendario.map((itemHora, idx) => (
                <div key={idx} className="grid items-stretch min-h-[50px] border-b border-slate-100 text-[9px] bg-white hover:bg-slate-50/50 transition" style={{ gridTemplateColumns: `50px repeat(${diasVisibles.length}, minmax(0, 1fr))` }}>
                  <div className="bg-slate-50 border-r border-slate-200 p-0.5 text-slate-400 font-bold text-[7px] flex items-center justify-center text-center">{itemHora.label}</div>
                  {diasVisibles.map((dia, dIdx) => {
                    const fechaStr = dia.fechaObj.toISOString().split('T')[0];
                    const cita = citasFirestore.find(c => (c.hora.toLowerCase() === itemHora.label.toLowerCase() || c.hora === itemHora.val24) && c.fechaStr === fechaStr);
                    return (
                      <div key={dIdx} onMouseDown={() => !cita && iniciarArrastre(fechaStr, itemHora.val24)} onMouseUp={() => !cita && finalizarArrastre(fechaStr, itemHora.val24)} className="border-r border-slate-100 last:border-r-0 p-1 flex flex-col justify-center overflow-hidden cursor-pointer">
                        {cita ? (
                          <div onClick={(e) => { e.stopPropagation(); abrirModalCita(cita); }} className={`p-1.5 rounded-xl border transition hover:scale-[1.02] ${cita.color}`}>
                            <span className="font-black truncate text-[8px] block">{cita.esBloqueo ? '🚫 BLOQUEADO' : cita.cliente}</span>
                            <span className="text-[7px] opacity-75 truncate font-bold block">{cita.servicio}</span>
                          </div>
                        ) : <div className="text-center text-slate-200 text-[9px]">+</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'servicios' && (
          <div className="space-y-2">
            {serviciosFirebase.map(serv => (
              <div key={serv.id} className="bg-white border border-slate-200 p-3.5 rounded-2xl flex justify-between shadow-xs">
                <div>
                  <p className="text-[11px] font-bold text-slate-900">{serv.nombre}</p>
                  <p className="text-[9px] text-indigo-600 font-semibold mt-0.5">Duración: {serv.duracion}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-fuchsia-600">{serv.precio}</p>
                  <span className="text-[8px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-bold">Activo</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs"><p className="text-[9px] font-bold text-slate-400 uppercase">Calificación</p><p className="text-2xl font-black text-indigo-600 mt-1">4.9 ★</p></div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs"><p className="text-[9px] font-bold text-slate-400 uppercase">Ingresos Semana</p><p className="text-xl font-black text-fuchsia-600 mt-1">$680.000</p></div>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="space-y-3">
            {/* ENLACE PARA COMPARTIR */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-2 shadow-xs">
              <h3 className="text-[11px] font-black uppercase text-indigo-950 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-indigo-600" /> Link de Reserva para Clientes</h3>
              <p className="text-[9px] text-indigo-800">Comparte este enlace para que tus clientes reserven directamente contigo:</p>
              <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl p-2">
                <input type="text" readOnly value={linkReserva} className="w-full bg-transparent text-[10px] text-slate-700 outline-none truncate" />
                <button onClick={() => { navigator.clipboard.writeText(linkReserva); setSuccessMsg('¡Enlace copiado al portapapeles!'); setTimeout(() => setSuccessMsg(''), 3000); }} className="bg-indigo-600 text-white p-2 rounded-lg cursor-pointer hover:bg-indigo-700 shrink-0"><Copy className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <h3 className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5"><Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Perfil Profesional</h3>
              <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await updateDoc(doc(db, 'profesionales', authUser.uid), { nombre, experiencia, ciudad, especialidad }); setSuccessMsg('¡Perfil actualizado!'); setLoading(false); setTimeout(() => setSuccessMsg(''), 3000); }} className="space-y-2.5">
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900 outline-none focus:border-indigo-600" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900" />
                  <input type="text" value={experiencia} onChange={e => setExperiencia(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900" />
                </div>
                <input type="text" value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900" />
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Guardar</>}
                </button>
              </form>
              <button onClick={() => setShowLogoutModal(true)} className="w-full bg-red-50 border border-red-200 text-red-600 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </main>

      {nuevaCitaNotificacion && (
        <div className="fixed bottom-20 left-3 right-3 max-w-lg mx-auto z-50 bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-4 py-3 rounded-2xl shadow-xl border border-indigo-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0"><BellRing className="w-4 h-4 text-indigo-400 animate-bounce" /></div>
            <div>
              <p className="text-[11px] font-black uppercase text-indigo-300">¡Nueva Cita!</p>
              <p className="text-[10px] text-slate-300"><strong className="text-white">{nuevaCitaNotificacion.cliente}</strong> • {nuevaCitaNotificacion.servicio}</p>
            </div>
          </div>
          <button onClick={() => setNuevaCitaNotificacion(null)} className="p-1.5 bg-white/10 rounded-xl text-slate-300 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-6 flex justify-between z-50 shadow-lg">
        {[
          { tab: 'agenda', icon: Calendar, label: 'Agenda' }, { tab: 'servicios', icon: Tag, label: 'Servicios' },
          { action: () => setShowBloqueoModal(true), icon: Plus, label: '', main: true }, { tab: 'estadisticas', icon: Smile, label: 'Estadísticas' },
          { tab: 'perfil', icon: LayoutGrid, label: 'Perfil' }
        ].map((item, idx) => {
          const Icon = item.icon;
          if (item.main) return <button key={idx} onClick={item.action} className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md -translate-y-4 border-2 border-white cursor-pointer hover:bg-indigo-700 transition"><Icon className="w-5 h-5 stroke-[3]" /></button>;
          return <button key={idx} onClick={() => setActiveTab(item.tab)} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === item.tab ? 'text-indigo-600 font-black' : 'text-slate-400'}`}><Icon className="w-4 h-4" /><span className="text-[8px]">{item.label}</span></button>;
        })}
      </nav>

      {showBloqueoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono">
          <div className="w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs"><Ban className="w-4 h-4" /></div><h4 className="text-[11px] font-black uppercase text-slate-900">Bloquear Horario</h4></div>
              <button onClick={() => setShowBloqueoModal(false)} className="p-1 rounded-lg bg-slate-100 text-slate-500 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={guardarBloqueoHorario} className="space-y-3 text-[10px]">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase text-[9px]">Fecha</label>
                <input type="date" required value={fechaBloqueo} onChange={e => setFechaBloqueo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[10px] outline-none text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Inicio</label>
                  <select value={horaInicioBloqueo} onChange={e => setHoraInicioBloqueo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-[10px] font-bold outline-none text-slate-900">
                    {horasCalendario.map(h => <option key={h.val24} value={h.val24}>{h.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Fin</label>
                  <select value={horaFinBloqueo} onChange={e => setHoraFinBloqueo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-[10px] font-bold outline-none text-slate-900">
                    {horasCalendario.map(h => <option key={h.val24} value={h.val24}>{h.label}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={modalLoading} className="w-full bg-rose-600 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer">
                {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmar Bloqueo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono">
          <div className="w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 space-y-3">
            <h4 className="text-[11px] font-black uppercase text-slate-900">Cerrar Sesión</h4>
            <p className="text-[10px] text-slate-500">¿Estás seguro de que deseas salir del portal?</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowLogoutModal(false)} className="w-1/2 bg-slate-100 text-slate-700 py-2 rounded-xl text-[10px] font-bold cursor-pointer">Cancelar</button>
              <button onClick={() => { signOut(auth); setShowLogoutModal(false); }} className="w-1/2 bg-red-600 text-white py-2 rounded-xl text-[10px] font-bold cursor-pointer">Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}