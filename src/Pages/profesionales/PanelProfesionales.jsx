import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Sparkles, CheckCircle2, Edit3, Save, RefreshCw, AlertCircle, 
  Plus, LayoutGrid, Tag, Smile, ArrowRight, AlertTriangle, 
  Loader2, HelpCircle, ChevronLeft, ChevronRight, LogOut, X, User, Scissors, BellRing
} from 'lucide-react';
import { signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
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
  const [authUser, setAuthUser] = useState(null), [authLoading, setAuthLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false), [loginLoading, setLoginLoading] = useState(false);
  const [errorMsgLogin, setErrorMsgLogin] = useState(''), [successMsgLogin, setSuccessMsgLogin] = useState('');
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirmPassword, setConfirmPassword] = useState(''), [nombreRegistro, setNombreRegistro] = useState('');

  const [activeTab, setActiveTab] = useState('agenda'), [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(''), [errorMsg, setErrorMsg] = useState(''), [vistaCalendario, setVistaCalendario] = useState('semanal');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date()), [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);

  // Estados para notificación visual y sonora de nueva cita
  const [nuevaCitaNotificacion, setNuevaCitaNotificacion] = useState(null);
  const primerCargaRef = useRef(true);

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [editServicioCita, setEditServicioCita] = useState(''), [editFechaCita, setEditFechaCita] = useState(''), [editHoraCita, setEditHoraCita] = useState(''), [modalLoading, setModalLoading] = useState(false);

  const [nombre, setNombre] = useState(''), [experiencia, setExperiencia] = useState('1 a 3 años');
  const [ciudad, setCiudad] = useState('Bogotá D.C.'), [especialidad, setEspecialidad] = useState('Fade & Visagismo');
  const [citasFirestore, setCitasFirestore] = useState([]);
  const [serviciosFirebase, setServiciosFirebase] = useState([
    { id: 1, nombre: 'Corte Mid Fade', precio: '$35.000 COP', duracion: '45 min' },
    { id: 2, nombre: 'Visagismo y Estética Facial', precio: '$50.000 COP', duracion: '60 min' },
    { id: 3, nombre: 'Perfilado de Barba', precio: '$25.000 COP', duracion: '30 min' },
  ]);

  // Función para reproducir sonido de alerta mediante Web Audio API
  const reproducirSonidoAlerta = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nota D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // Nota A5
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio no soportado o bloqueado por el navegador', e);
    }
  };

  const y = fechaSeleccionada.getFullYear(), m = fechaSeleccionada.getMonth();
  const diasDelMes = Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => {
    const d = new Date(y, m, i + 1);
    return { fechaObj: d, num: i + 1, nombre: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()] };
  });

  const cambiarMes = (dir) => { const nueva = new Date(fechaSeleccionada); nueva.setMonth(nueva.getMonth() + dir); nueva.setDate(1); setFechaSeleccionada(nueva); };
  
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
          setNombre(d.nombre || 'Profesional'); setCiudad(d.ciudad || 'Bogotá D.C.');
          setExperiencia(d.experiencia || '1 a 3 años'); setEspecialidad(d.especialidad || 'Fade & Visagismo');
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
              
              // Detectar si es una cita nueva en tiempo real (excluyendo la carga inicial)
              if (!primerCargaRef.current && !idsActuales.includes(docSnap.id) && estado !== 'cancelada') {
                setNuevaCitaNotificacion({
                  cliente: data.clienteNombre || 'Cliente',
                  servicio: data.servicio || 'Corte General',
                  fecha: data.fecha || '',
                  hora: horaBD
                });
                reproducirSonidoAlerta();
                setTimeout(() => setNuevaCitaNotificacion(null), 6000); // Ocultar notificación a los 6s
              }

              citasServer.push({
                id: docSnap.id, cliente: data.clienteNombre || 'Cliente', clienteTelefono: data.clienteTelefono || 'No registrado',
                clienteEmail: data.clienteEmail || 'No registrado', servicio: data.servicio || 'Corte General',
                hora: horaBD, fechaStr: data.fecha || '', estado,
                color: estado === 'finalizada' ? 'bg-slate-100 border-slate-300 text-slate-500 font-normal' : 'bg-purple-100 border-purple-300 text-purple-950 font-semibold'
              });
            }
          });

          primerCargaRef.current = false;
          setCitasFirestore(citasServer.filter(c => c.estado !== 'cancelada'));
        });
        return () => unsubCitas();
      } else { setAuthUser(null); setCitasFirestore([]); }
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
      } else { await signInWithEmailAndPassword(auth, email, password); }
      setSuccessMsgLogin('¡Éxito!');
    } catch { setErrorMsgLogin('Verifica tus datos.'); setLoginLoading(false); }
  };

  const abrirModalCita = (cita) => {
    setCitaSeleccionada(cita); setEditServicioCita(cita.servicio); setEditFechaCita(cita.fechaStr);
    const match = horasCalendario.find(h => h.label.toLowerCase() === cita.hora.toLowerCase());
    setEditHoraCita(match ? match.val24 : '10:00');
  };

  const actualizarCitaCampo = async (campos, msg) => {
    setModalLoading(true);
    try {
      await updateDoc(doc(db, 'citas', citaSeleccionada.id), campos);
      setSuccessMsg(msg); setCitaSeleccionada(null); setTimeout(() => setSuccessMsg(''), 3000);
    } catch { setErrorMsg('Error en la operación'); setTimeout(() => setErrorMsg(''), 3000); }
    setModalLoading(false);
  };

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono"><RefreshCw className="w-6 h-6 text-cyan-600 animate-spin" /></div>;

  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-sm bg-white border border-slate-200 shadow-xl rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black text-xs">AV</div>
            <div><h3 className="text-xs font-black uppercase text-slate-900">{isRegistering ? 'Nuevo Registro' : 'Portal Profesionales'}</h3><p className="text-[10px] text-slate-500">Arkana Vision</p></div>
          </div>
          {errorMsgLogin && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[10px] flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{errorMsgLogin}</div>}
          <form onSubmit={handleAuth} className="space-y-3">
            {isRegistering && <input type="text" required placeholder="Nombre Completo" value={nombreRegistro} onChange={e => setNombreRegistro(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900 outline-none focus:border-cyan-600" />}
            <input type="email" required placeholder="correo@dominio.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900 outline-none focus:border-cyan-600" />
            <input type="password" required placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900 outline-none focus:border-cyan-600" />
            {isRegistering && <input type="password" required placeholder="Confirmar Contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[16px] text-slate-900 outline-none focus:border-cyan-600" />}
            <button type="submit" disabled={loginLoading} className="w-full bg-cyan-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer">{loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isRegistering ? 'Registrarse' : 'Acceder'} <ArrowRight className="w-4 h-4" /></>}</button>
          </form>
          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setErrorMsgLogin(''); }} className="w-full text-center text-[11px] font-bold text-cyan-700 cursor-pointer">{isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}</button>
        </div>
      </div>
    );
  }

  const diasVisibles = getDiasVisibles();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-mono flex flex-col justify-between pb-36 relative select-none">
      
      <header className="w-full bg-white border-b border-slate-300 px-3 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center font-black text-xs">AV</div>
          <div className="flex flex-col"><span className="text-[11px] font-black uppercase">Hola, {nombre.split(' ')[0]}</span><span className="text-[8px] text-slate-600 font-bold">{ciudad} • {especialidad}</span></div>
        </div>
        <button onClick={() => setActiveTab('estadisticas')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 cursor-pointer"><Sparkles className="w-3.5 h-3.5" /></button>
      </header>

      {activeTab === 'agenda' && (
        <div className="bg-white border-b border-slate-300 px-3 py-2 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <button onClick={() => cambiarMes(-1)} className="p-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="text-[10px] font-black uppercase">{fechaSeleccionada.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => cambiarMes(1)} className="p-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex gap-1 overflow-x-auto py-1">
            {diasDelMes.map((d, i) => (
              <button key={i} onClick={() => setFechaSeleccionada(d.fechaObj)} className={`flex flex-col items-center px-2 py-1 rounded-lg border shrink-0 cursor-pointer ${d.fechaObj.toDateString() === fechaSeleccionada.toDateString() ? 'bg-cyan-700 text-white border-cyan-800 font-bold' : 'bg-slate-50 border-slate-300'}`}>
                <span className="text-[7px] uppercase">{d.nombre}</span><span className="text-[10px] font-black">{d.num}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Vista:</span>
            <div className="flex gap-1 bg-slate-200 p-0.5 rounded-lg border border-slate-300">
              {['diario', '3dias', 'semanal'].map(v => (
                <button key={v} onClick={() => setVistaCalendario(v)} className={`px-2 py-0.5 rounded-md text-[9px] font-bold cursor-pointer ${vistaCalendario === v ? 'bg-white text-cyan-800 shadow-sm border border-slate-300' : 'text-slate-600'}`}>{v.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-2 w-full max-w-lg mx-auto overflow-x-hidden">
        {successMsg && <div className="mb-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{successMsg}</div>}
        {errorMsg && <div className="mb-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-900 text-[10px] flex gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{errorMsg}</div>}

        {activeTab === 'agenda' && (
          <div className="bg-white border-2 border-slate-300 rounded-xl shadow-md p-1 relative overflow-hidden w-full">
            <div className="grid bg-slate-200 border-b-2 border-slate-300 text-center text-[9px] font-black uppercase" style={{ gridTemplateColumns: `50px repeat(${diasVisibles.length}, minmax(0, 1fr))` }}>
              <div className="text-left pl-1.5 py-1.5 text-slate-600 font-bold text-[8px] border-r border-slate-300">Hora</div>
              {diasVisibles.map((d, i) => (
                <div key={i} className={`py-1.5 px-0.5 border-r border-slate-300 last:border-r-0 truncate ${d.fechaObj.toDateString() === fechaSeleccionada.toDateString() ? 'bg-cyan-100 text-cyan-950 font-black' : 'bg-slate-100 text-slate-800'}`}>{d.nombre.toUpperCase()} {d.num}</div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute left-0 right-0 z-30 flex items-center pointer-events-none" style={{ top: `${currentTimeMinutes}%` }}>
                <div className="w-[50px] bg-red-600 text-white text-[7px] font-black text-center py-0.5">HOY</div>
                <div className="flex-1 border-t-2 border-red-600"></div>
              </div>
              {horasCalendario.map((itemHora, idx) => (
                <div key={idx} className="grid items-stretch min-h-[46px] border-b border-slate-300 text-[9px] bg-white" style={{ gridTemplateColumns: `50px repeat(${diasVisibles.length}, minmax(0, 1fr))` }}>
                  <div className="bg-slate-100 border-r border-slate-300 p-0.5 text-slate-700 font-bold text-[7px] flex items-center justify-center text-center">{itemHora.label}</div>
                  {diasVisibles.map((dia, dIdx) => {
                    const cita = citasFirestore.find(c => (c.hora.toLowerCase() === itemHora.label.toLowerCase() || c.hora === itemHora.val24) && c.fechaStr === dia.fechaObj.toISOString().split('T')[0]);
                    return (
                      <div key={dIdx} className="border-r border-slate-200 last:border-r-0 p-0.5 flex flex-col justify-center overflow-hidden">
                        {cita ? <div onClick={() => abrirModalCita(cita)} className={`p-1 rounded-md border shadow-xs cursor-pointer truncate ${cita.color}`}><span className="font-black truncate text-[8px] block">{cita.cliente}</span><span className="text-[7px] opacity-90 truncate font-bold block">{cita.servicio}</span></div> : <div className="text-center text-slate-300 text-[9px]">·</div>}
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
              <div key={serv.id} className="bg-white border border-slate-300 p-3 rounded-xl flex justify-between shadow-sm">
                <div><p className="text-[11px] font-bold">{serv.nombre}</p><p className="text-[9px] text-cyan-700 font-semibold">Duración: {serv.duracion}</p></div>
                <div className="text-right"><p className="text-[11px] font-bold text-fuchsia-700">{serv.precio}</p><span className="text-[8px] bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-bold">Activo</span></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm"><p className="text-[9px] font-bold text-slate-500 uppercase">Calificación</p><p className="text-2xl font-black text-cyan-700 mt-1">4.9 ★</p></div>
            <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm"><p className="text-[9px] font-bold text-slate-500 uppercase">Ingresos Semana</p><p className="text-xl font-black text-fuchsia-700 mt-1">$680.000</p></div>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="bg-white border border-slate-300 rounded-xl p-4 space-y-3 shadow-md">
            <h3 className="text-[11px] font-black uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2.5"><Edit3 className="w-3.5 h-3.5 text-cyan-700" /> Perfil Profesional</h3>
            <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await updateDoc(doc(db, 'profesionales', authUser.uid), { nombre, experiencia, ciudad, especialidad }); setSuccessMsg('¡Perfil actualizado!'); setLoading(false); setTimeout(() => setSuccessMsg(''), 3000); }} className="space-y-2.5">
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-[16px]" required />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-[16px]" />
                <input type="text" value={experiencia} onChange={e => setExperiencia(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-[16px]" />
              </div>
              <input type="text" value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-[16px]" />
              <button type="submit" disabled={loading} className="w-full bg-cyan-700 text-white font-bold py-2 rounded-lg text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer">{loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Guardar</>}</button>
            </form>
            <button onClick={() => setShowLogoutModal(true)} className="w-full bg-red-50 border border-red-300 text-red-700 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"><LogOut className="w-3.5 h-3.5" /> Cerrar Sesión</button>
          </div>
        )}
      </main>

      {/* Notificación Visual Rectangular Verde Pro (Ubicada en la parte inferior sobre la barra) */}
      {nuevaCitaNotificacion && (
        <div className="fixed bottom-20 left-3 right-3 max-w-lg mx-auto z-50 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 animate-pulse flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-emerald-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-200">¡Nueva Cita Registrada!</p>
              </div>
              <p className="text-[10px] font-medium text-slate-200 mt-0.5">
                <strong className="text-white">{nuevaCitaNotificacion.cliente}</strong> • {nuevaCitaNotificacion.servicio} ({nuevaCitaNotificacion.fecha} a las {nuevaCitaNotificacion.hora})
              </p>
            </div>
          </div>
          <button onClick={() => setNuevaCitaNotificacion(null)} className="p-1.5 bg-emerald-950/60 hover:bg-emerald-950 rounded-xl border border-emerald-500/40 text-emerald-300 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-300 py-2 px-6 flex justify-between z-50 shadow-lg">
        {[
          { tab: 'agenda', icon: Calendar, label: 'Agenda' }, { tab: 'servicios', icon: Tag, label: 'Servicios' },
          { tab: 'agenda', icon: Plus, label: '', main: true }, { tab: 'estadisticas', icon: Smile, label: 'Estadísticas' },
          { tab: 'perfil', icon: LayoutGrid, label: 'Perfil' }
        ].map((item, idx) => {
          const Icon = item.icon;
          if (item.main) return <button key={idx} onClick={() => setActiveTab('agenda')} className="w-10 h-10 rounded-full bg-cyan-700 text-white flex items-center justify-center shadow-md -translate-y-3 border-2 border-white cursor-pointer"><Icon className="w-5 h-5 stroke-[3]" /></button>;
          return <button key={idx} onClick={() => setActiveTab(item.tab)} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === item.tab ? 'text-cyan-800 font-black' : 'text-slate-500'}`}><Icon className="w-4 h-4" /><span className="text-[8px]">{item.label}</span></button>;
        })}
      </nav>

      {citaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4 font-mono">
          <div className="w-full max-w-sm bg-white border border-slate-300 shadow-2xl rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs"><Scissors className="w-4 h-4" /></div><h4 className="text-[11px] font-black uppercase">Detalles de la Cita</h4></div>
              <button onClick={() => setCitaSeleccionada(null)} className="p-1 rounded-lg bg-slate-100 text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 text-[10px]">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-500 uppercase text-[8px]">Cliente</p>
                <p className="font-black text-slate-900 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-cyan-700" /> {citaSeleccionada.cliente}</p>
                <p className="text-slate-600">Tel: {citaSeleccionada.clienteTelefono} | Correo: {citaSeleccionada.clienteEmail}</p>
              </div>
              {citaSeleccionada.estado === 'finalizada' ? (
                <div className="bg-slate-100 p-2 rounded-xl border border-slate-300 text-center"><span className="text-emerald-700 font-bold block">✓ Servicio finalizado</span></div>
              ) : (
                <div className="space-y-2">
                  <select value={editServicioCita} onChange={e => setEditServicioCita(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-1.5 px-2.5 text-[10px] font-bold outline-none">
                    {serviciosFirebase.map(s => <option key={s.id} value={s.nombre}>{s.nombre} - {s.precio}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={editFechaCita} onChange={e => setEditFechaCita(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-1 px-2 text-[10px] outline-none" />
                    <select value={editHoraCita} onChange={e => setEditHoraCita(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-1.5 px-2 text-[10px] outline-none">
                      {horasCalendario.map(h => <option key={h.val24} value={h.val24}>{h.label}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-2 flex flex-col gap-1.5">
              {citaSeleccionada.estado !== 'finalizada' && (
                <>
                  <button onClick={() => actualizarCitaCampo({ servicio: editServicioCita, fecha: editFechaCita, hora: editHoraCita }, 'Cita actualizada')} disabled={modalLoading} className="w-full bg-cyan-700 text-white font-bold py-2 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer">{modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Guardar Cambios</>}</button>
                  <button onClick={() => actualizarCitaCampo({ estado: 'finalizada' }, 'Cita finalizada')} disabled={modalLoading} className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" /> Finalizar</button>
                  <button onClick={() => { if(window.confirm('¿Cancelar cita?')) actualizarCitaCampo({ estado: 'cancelada' }, 'Cita cancelada'); }} disabled={modalLoading} className="w-full bg-red-50 border border-red-300 text-red-700 font-bold py-1.5 rounded-xl text-[10px] uppercase cursor-pointer">Cancelar Cita</button>
                </>
              )}
              <button onClick={() => setCitaSeleccionada(null)} className="w-full bg-slate-200 text-slate-800 font-bold py-1.5 rounded-xl text-[10px] uppercase cursor-pointer">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4 font-mono">
          <div className="w-full max-w-xs bg-white border border-slate-300 shadow-2xl rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200"><div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center"><HelpCircle className="w-4 h-4" /></div><div><h4 className="text-[11px] font-black uppercase">Cerrar Sesión</h4></div></div>
            <p className="text-[10px] text-slate-700 font-medium">¿Deseas salir?</p>
            <div className="flex gap-2 pt-1"><button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-[10px] uppercase cursor-pointer">Cancelar</button><button onClick={async () => { setShowLogoutModal(false); await signOut(auth); }} className="flex-1 bg-red-600 text-white font-bold py-2 rounded-xl text-[10px] uppercase cursor-pointer">Sí, salir</button></div>
          </div>
        </div>
      )}
    </div>
  );
}