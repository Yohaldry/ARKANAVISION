import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Sparkles, CheckCircle2, Edit3, Save, RefreshCw, AlertCircle, 
  Plus, LayoutGrid, Tag, Smile, ArrowRight, AlertTriangle, 
  Loader2, ChevronLeft, ChevronRight, Eye, EyeOff, LogOut, X, BellRing, Ban, Share2, Copy, Image as ImageIcon, Trash2, Clock
} from 'lucide-react';
import { signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs, setDoc, onSnapshot, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';



const horasCalendario = [
  { label: '9:00 a. m.', val24: '09:00' }, { label: '10:00 a. m.', val24: '10:00' },
  { label: '11:00 a. m.', val24: '11:00' }, { label: '12:00 p. m.', val24: '12:00' },
  { label: '1:00 p. m.', val24: '13:00' }, { label: '2:00 p. m.', val24: '14:00' },
  { label: '3:00 p. m.', val24: '15:00' }, { label: '4:00 p. m.', val24: '16:00' },
  { label: '5:00 p. m.', val24: '17:00' }, { label: '6:00 p. m.', val24: '18:00' },
  { label: '7:00 p. m.', val24: '19:00' }, { label: '8:00 p. m.', val24: '20:00' }
];

const zonasBogotaDisponibles = [
  'Chapinero', 'Usaquén', 'Suba', 'Teusaquillo', 'Chicó', 
  'Zona T', 'Rosales', 'Cedritos', 'Unicentro', 'Santa Bárbara'
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

  // Estados para mostrar u ocultar las contraseñas
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const [activeTab, setActiveTab] = useState('agenda');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [vistaCalendario, setVistaCalendario] = useState('semanal');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);

  const primerCargaRef = useRef(true);
  const fileInputRef = useRef(null);

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Estados para reprogramación dentro del modal
  const [nuevaFechaCita, setNuevaFechaCita] = useState('');
  const [nuevaHoraCita, setNuevaHoraCita] = useState('');
// modal para editar info
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para gestión de Servicios personalizados
  const [serviciosFirebase, setServiciosFirebase] = useState([]);
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [formServicio, setFormServicio] = useState({ nombre: '', descripcion: '', precio: '', duracion: '45 min' });

  const [barberData, setBarberData] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  // Estados del perfil
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correoPerfil, setCorreoPerfil] = useState('');
  const [zonasTrabajo, setZonasTrabajo] = useState([]);
  
  const [experiencia, setExperiencia] = useState('1 a 3 años');
  const [ciudad, setCiudad] = useState('Bogotá D.C.');
  const [especialidad, setEspecialidad] = useState('Fade & Visagismo');
  const [citasFirestore, setCitasFirestore] = useState([]);

  
  const [errorMessage, setErrorMessage] = useState('');



const [showLogoutModal, setShowLogoutModal] = useState(false);

const renderFieldView = (label, value) => {
    const isEmpty = !value || (Array.isArray(value) && value.length === 0) || String(value).trim() === '';
    return (
      <div className={`p-2.5 rounded-xl border transition-all ${isEmpty ? 'bg-red-50 border-red-300 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
        <div className="flex items-center justify-between mb-0.5">
          <span className={`font-bold uppercase text-[9px] ${isEmpty ? 'text-red-600' : 'text-slate-500'}`}>{label}</span>
          {isEmpty && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
        </div>
        <div className="text-[12px] font-medium truncate">
          {isEmpty ? <span className="text-red-500 italic text-[10px]">⚠️ Campo obligatorio sin llenar</span> : Array.isArray(value) ? value.join(', ') : value}
        </div>
      </div>
    );
  };

const handleLogout = async () => {
  try {
    setLoginLoading(false); 
    setEmail('');           
    setPassword('');
    await signOut(auth);    
    setShowLogoutModal(false); 
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    setShowLogoutModal(false);
  }
};

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
    const calcTime = () => {
      const now = new Date();
      setCurrentTimeMinutes(Math.max(0, Math.min(100, (((now.getHours() * 60 + now.getMinutes()) - 540) / 660) * 100)));
    };
    calcTime();
    const t = setInterval(calcTime, 30000);

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      let unsubFirestoreStatus = () => {};
      let unsubServicios = () => {};
      let unsubCitas = () => {};

      if (user) {
        setAuthUser(user);

        // Escucha en tiempo real el documento del profesional para verificar si está activo o bloqueado
        unsubFirestoreStatus = onSnapshot(doc(db, 'profesionales', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const d = docSnap.data();
            setBarberData(d);
            setNombre(d.nombre || 'Profesional'); 
            setCiudad(d.ciudad || 'Bogotá D.C.');
            setExperiencia(d.experiencia || '1 a 3 años'); 
            setEspecialidad(d.especialidad || 'Fade & Visagismo');
            setDescripcion(d.descripcion || '');
            setFoto(d.foto || '');
            setTelefono(d.telefono || '');
            setCorreoPerfil(d.correo || user.email || '');
            setZonasTrabajo(d.zonasTrabajo || []);
          } else {
            setCorreoPerfil(user.email || '');
          }
          setCheckingStatus(false);
        }, (error) => {
          console.error("Error al verificar estado del profesional:", error);
          setCheckingStatus(false);
        });

        let nombreBarberoActual = nombre;
        
        // Sincronizar servicios propios del barbero en tiempo real
        const qServicios = query(collection(db, 'servicios'), where('barberoId', '==', user.uid));
        unsubServicios = onSnapshot(qServicios, (servSnap) => {
          const listaServicios = [];
          servSnap.forEach(docServ => {
            listaServicios.push({ id: docServ.id, ...docServ.data() });
          });
          setServiciosFirebase(listaServicios);
        });

        // Sincronización en tiempo real de citas filtradas por barberoId o barberoName
        unsubCitas = onSnapshot(collection(db, 'citas'), (snapshot) => {
          const citasServer = [];
          let idsActuales = citasFirestore.map(c => c.id);

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            const coincideId = data.barberoId === user.uid;
            const coincideNombre = (nombreBarberoActual && data.barberoName && data.barberoName.toLowerCase().trim() === nombreBarberoActual.toLowerCase().trim()) ||
                                   (nombreBarberoActual && data.barberoNombre && data.barberoNombre.toLowerCase().trim() === nombreBarberoActual.toLowerCase().trim());

            if (coincideId || coincideNombre || !data.barberoId) {
              let horaBD = (data.hora || '').trim();
              
              const matchHora = horasCalendario.find(h => 
                h.val24 === horaBD || 
                h.label.toLowerCase() === horaBD.toLowerCase() ||
                horaBD.toLowerCase().includes(h.val24) ||
                horaBD.toLowerCase().replace(/\s+/g, '').includes(h.label.toLowerCase().replace(/\s+/g, ''))
              );

              const horaNormalizada = matchHora ? matchHora.label : (horaBD || '10:00 a. m.');
              const estado = (data.estado || 'pendiente').toLowerCase();
              
              if (!primerCargaRef.current && !idsActuales.includes(docSnap.id) && estado !== 'cancelada' && estado !== 'cancelado' && estado !== 'bloqueado') {
                reproducirSonidoAlerta();
              }

              let colorClase = 'bg-indigo-50 border-indigo-200 text-indigo-950 font-semibold shadow-xs';
              if (estado === 'confirmada' || estado === 'confirmado') colorClase = 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold shadow-xs';
              if (estado === 'finalizada' || estado === 'finalizado') colorClase = 'bg-slate-100 border-slate-200 text-slate-400 font-normal';
              if (estado === 'bloqueado') colorClase = 'bg-rose-50 border-rose-200 text-rose-700 font-bold';

              citasServer.push({
                id: docSnap.id, 
                cliente: data.clienteNombre || 'BLOQUEADO', 
                clienteTelefono: data.telefono || data.clienteTelefono || '',
                clienteEmail: data.clienteEmail || '', 
                servicio: data.servicio || 'Servicio General',
                hora: horaNormalizada, 
                fechaStr: data.fecha || '', 
                estado, 
                color: colorClase, 
                esBloqueo: estado === 'bloqueado'
              });
            }
          });

          primerCargaRef.current = false;
          setCitasFirestore(citasServer.filter(c => c.estado !== 'cancelada' && c.estado !== 'cancelado'));
        });

      } else { 
        setAuthUser(null); 
        setCitasFirestore([]); 
        setServiciosFirebase([]);
        setCheckingStatus(false);
      }
      setAuthLoading(false);

      return () => {
        unsubFirestoreStatus();
        unsubServicios();
        unsubCitas();
      };
    });

    const safety = setTimeout(() => setAuthLoading(false), 2000);
    return () => { unsubAuth(); clearTimeout(safety); clearInterval(t); };
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

  const abrirModalCita = (cita) => {
    setCitaSeleccionada(cita);
    setNuevaFechaCita(cita.fechaStr || '');
    setNuevaHoraCita(cita.hora || '');
  };

  const actualizarCitaFirestore = async (nuevoEstado) => {
    if (!citaSeleccionada) return;
    setModalLoading(true);
    try {
      const citaRef = doc(db, 'citas', citaSeleccionada.id);
      await updateDoc(citaRef, {
        estado: nuevoEstado,
        fecha: nuevaFechaCita,
        hora: nuevaHoraCita
      });
      setSuccessMsg('Cita actualizada correctamente');
      setCitaSeleccionada(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Error al actualizar la cita');
      setTimeout(() => setErrorMsg(''), 3000);
    }
    setModalLoading(false);
  };

  const eliminarCitaFirestore = async () => {
    if (!citaSeleccionada) return;
    setModalLoading(true);
    try {
      await deleteDoc(doc(db, 'citas', citaSeleccionada.id));
      setSuccessMsg('Cita eliminada de la agenda');
      setCitaSeleccionada(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Error al eliminar la cita');
      setTimeout(() => setErrorMsg(''), 3000);
    }
    setModalLoading(false);
  };

  // Guardar o Actualizar Servicio Personalizado
 const handleGuardarServicio = async (e) => {
    e.preventDefault();
    if (!formServicio.nombre || !formServicio.precio) return alert('Nombre y precio son obligatorios');

    try {
      if (servicioEditando) {
        await updateDoc(doc(db, 'servicios', servicioEditando.id), {
          nombre: formServicio.nombre,
          descripcion: formServicio.descripcion,
          precio: formServicio.precio,
          duracion: formServicio.duracion,
          categoria: formServicio.categoria || 'servicio' // <-- Actualiza la categoría
        });
        setSuccessMsg('Elemento actualizado con éxito');
      } else {
        await addDoc(collection(db, 'servicios'), {
          barberoId: authUser.uid,
          nombre: formServicio.nombre,
          descripcion: formServicio.descripcion,
          precio: formServicio.precio,
          duracion: formServicio.duracion,
          categoria: formServicio.categoria || 'servicio' // <-- Guarda la categoría seleccionada
        });
        setSuccessMsg('Elemento agregado con éxito');
      }
      setShowServicioModal(false);
      setServicioEditando(null);
      setFormServicio({ nombre: '', descripcion: '', precio: '', duracion: '45 min', categoria: 'servicio' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Error al guardar el elemento');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const eliminarServicioFirestore = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await deleteDoc(doc(db, 'servicios', id));
        setSuccessMsg('Servicio eliminado');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setErrorMsg('Error al eliminar');
      }
    }
  };

  const toggleZona = (zona) => {
    if (zonasTrabajo.includes(zona)) {
      setZonasTrabajo(zonasTrabajo.filter(z => z !== zona));
    } else {
      setZonasTrabajo([...zonasTrabajo, zona]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono"><RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" /></div>;

  if (!authUser) {
    return (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
  <div className={`w-full max-w-sm border shadow-xl rounded-2xl p-5 space-y-4 transition-all duration-300 ease-in-out ${
    isRegistering 
      ? 'bg-slate-50 border-indigo-100 shadow-indigo-100/50' 
      : 'bg-white border-slate-200 shadow-slate-200/50'
  }`}>
    
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
      <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-black text-xs shadow-md transition-colors duration-300 ${
        isRegistering ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-slate-900 shadow-slate-900/20'
      }`}>AV</div>
      <div>
        <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
          {isRegistering ? 'Nuevo Registro' : 'Portal Profesionales'}
        </h3>
        <p className={`text-[10px] font-mono tracking-widest transition-colors duration-300 ${
          isRegistering ? 'text-indigo-600' : 'text-slate-500'
        }`}>Arkana Vision</p>
      </div>
    </div>

    {/* Alerta de Error */}
    {errorMsgLogin && (
      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[10px] flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>{errorMsgLogin}</span>
      </div>
    )}

    {/* Alerta de Éxito con Estilos de Arkana */}
    {successMsg && (
      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] flex items-center gap-2 animate-fadeIn">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
        <span className="font-bold">{successMsg}</span>
      </div>
    )}

   

    <form onSubmit={handleAuth} className="space-y-3">
      {isRegistering && (
        <input 
          type="text" 
          required 
          placeholder="Nombre Completo" 
          value={nombreRegistro} 
          onChange={e => setNombreRegistro(e.target.value)} 
          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 outline-none focus:border-indigo-600 transition-all placeholder-slate-400 shadow-sm" 
        />
      )}

      <input 
        type="email" 
        required 
        placeholder="correo@dominio.com" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 outline-none focus:border-indigo-600 transition-all placeholder-slate-400 shadow-sm" 
      />

      {/* Campo Contraseña con Ojito y Validación de 8 caracteres */}
      <div className="space-y-1">
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            required 
            placeholder="Contraseña (mínimo 8 caracteres)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-3 pr-9 text-xs text-slate-800 outline-none focus:border-indigo-600 transition-all placeholder-slate-400 shadow-sm" 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {password && password.length < 8 && (
          <p className="text-[9px] text-amber-600 font-mono pl-1">⚠️ Debe tener al menos 8 caracteres</p>
        )}
      </div>

      {/* Campo Confirmar Contraseña (Solo en Registro) */}
      {isRegistering && (
        <div className="space-y-1">
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              required 
              placeholder="Confirmar Contraseña" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className={`w-full bg-white border rounded-xl py-2 pl-3 pr-9 text-xs text-slate-800 outline-none transition-all placeholder-slate-400 shadow-sm ${
                confirmPassword 
                  ? password === confirmPassword 
                    ? 'border-emerald-500 focus:border-emerald-600' 
                    : 'border-red-300 focus:border-red-500' 
                  : 'border-slate-200 focus:border-indigo-600'
              }`} 
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {confirmPassword && (
            <p className={`text-[9px] font-mono pl-1 ${password === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
              {password === confirmPassword ? '✓ Las contraseñas coinciden' : '✕ Las contraseñas no coinciden'}
            </p>
          )}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loginLoading} 
        className={`w-full font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
          isRegistering 
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20' 
            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
        }`}
      >
        {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isRegistering ? 'Registrarse' : 'Acceder'} <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>

    <button 
      type="button" 
      onClick={() => { setIsRegistering(!isRegistering); setErrorMsgLogin(''); setSuccessMsg(''); }} 
      className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer pt-1"
    >
      {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
    </button>
  </div>
</div>
    );
  }
  

  const diasVisibles = getDiasVisibles();
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
                    const cita = citasFirestore.find(c => 
                      c.fechaStr === fechaStr && 
                      (c.hora.toLowerCase() === itemHora.label.toLowerCase() || c.hora.toLowerCase() === itemHora.val24)
                    );
                    return (
                      <div key={dIdx} className="border-r border-slate-100 last:border-r-0 p-1 flex flex-col justify-center overflow-hidden cursor-pointer">
                        {cita ? (
                          <div onClick={(e) => { e.stopPropagation(); abrirModalCita(cita); }} className={`p-1.5 rounded-xl border transition hover:scale-[1.02] cursor-pointer ${cita.color}`}>
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
        {/* ... el resto de tu interfaz ... */}

      {/* MODAL DE CIERRE DE SESIÓN (Debe estar dentro del return) */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="w-full max-w-xs bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 space-y-4 text-center">
            
            <div className="w-10 h-10 mx-auto rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-sm">
              <LogOut className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Cerrar Sesión</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ¿Estás seguro de que deseas salir del portal de profesionales de <span className="font-semibold text-slate-700">Arkana Vision</span>?
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs shadow-md shadow-red-600/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                Sí, Salir
              </button>
            </div>

          </div>
        </div>
      )}



        {/* MODAL DE GESTIÓN DE CITA */}
        {citaSeleccionada && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-900">Gestionar Cita / Servicio</h3>
                  <p className="text-[9px] text-indigo-600 font-bold">{citaSeleccionada.servicio}</p>
                </div>
                <button onClick={() => setCitaSeleccionada(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                  <p><strong className="text-slate-500">Cliente:</strong> <span className="text-slate-900 font-bold">{citaSeleccionada.cliente}</span></p>
                  {citaSeleccionada.clienteTelefono && <p><strong className="text-slate-500">Teléfono:</strong> <span className="text-slate-900">{citaSeleccionada.clienteTelefono}</span></p>}
                  <p><strong className="text-slate-500">Fecha actual:</strong> <span className="text-slate-900">{citaSeleccionada.fechaStr}</span></p>
                  <p><strong className="text-slate-500">Hora actual:</strong> <span className="text-slate-900">{citaSeleccionada.hora}</span></p>
                  <p><strong className="text-slate-500">Estado:</strong> <span className="uppercase text-emerald-600 font-bold">{citaSeleccionada.estado}</span></p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="font-bold text-slate-700 uppercase text-[9px]">Reprogramar Fecha y Hora:</p>
                  <input type="date" value={nuevaFechaCita} onChange={e => setNuevaFechaCita(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600" />
                  <select value={nuevaHoraCita} onChange={e => setNuevaHoraCita(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600">
                    {horasCalendario.map((h, i) => (
                      <option key={i} value={h.label}>{h.label} ({h.val24})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button disabled={modalLoading} onClick={() => actualizarCitaFirestore('Confirmada')} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-700 transition">
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-3.5 h-3.5" /> Guardar / Reprogramar</>}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button disabled={modalLoading} onClick={() => actualizarCitaFirestore('Cancelada')} className="bg-amber-50 border border-amber-200 text-amber-700 font-bold py-2 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer hover:bg-amber-100">
                    Cancelar Cita
                  </button>
                  <button disabled={modalLoading} onClick={() => eliminarCitaFirestore()} className="bg-red-50 border border-red-200 text-red-700 font-bold py-2 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer hover:bg-red-100">
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN DE GESTIÓN DE SERVICIOS */}
        {activeTab === 'servicios' && (
         <div className="space-y-3">
 <div className="flex justify-between items-center">
  <div>
    <h3 className="text-xs font-black uppercase text-slate-900">Mis Servicios y Paquetes</h3>
    <p className="text-[9px] text-slate-400">Configura los servicios y paquetes que ofreces a tus clientes</p>
  </div>
  <div className="flex items-center gap-1.5">
    <button 
      onClick={() => {
        setServicioEditando(null);
        setFormServicio({ nombre: '', descripcion: '', precio: '', duracion: '45 min', categoria: 'servicio' });
        setShowServicioModal(true);
      }}
      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition"
    >
      <Plus className="w-3 h-3" /> Servicio
    </button>
    <button 
      onClick={() => {
        setServicioEditando(null);
        setFormServicio({ nombre: '', descripcion: '', precio: '', duracion: '60 min', categoria: 'paquete' });
        setShowServicioModal(true);
      }}
      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition"
    >
      <Plus className="w-3 h-3" /> Paquete
    </button>
  </div>
</div>

  <div className="space-y-2">
    {serviciosFirebase.length === 0 ? (
      <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center text-slate-400 text-[10px]">
        No tienes servicios ni paquetes creados. Agrega tu primer elemento personalizado.
      </div>
    ) : (
      serviciosFirebase.map(serv => {
        const esPaquete = serv.categoria === 'paquete';
        return (
          <div key={serv.id} className="bg-white border border-slate-200 p-3.5 rounded-2xl flex justify-between items-start shadow-xs gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[8px] px-2 py-0.5 rounded-lg font-bold uppercase border ${esPaquete ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
                  {esPaquete ? 'Paquete' : 'Servicio'}
                </span>
                <p className="text-[11px] font-bold text-slate-900">{serv.nombre}</p>
                <span className="text-[8px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-bold">Duración: {serv.duracion}</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-snug">{serv.descripcion || 'Sin descripción detallada.'}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1 shrink-0">
              <p className={`text-[11px] font-bold ${esPaquete ? 'text-emerald-600' : 'text-fuchsia-600'}`}>{serv.precio}</p>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    setServicioEditando(serv);
                    setFormServicio({ 
                      nombre: serv.nombre, 
                      descripcion: serv.descripcion || '', 
                      precio: serv.precio, 
                      duracion: serv.duracion || '45 min',
                      categoria: serv.categoria || 'servicio'
                    });
                    setShowServicioModal(true);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => eliminarServicioFirestore(serv.id)}
                  className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>

  {/* Modal de Creación / Edición con el Selector de Categoría incluido */}
  {showServicioModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h4 className={`text-xs font-black uppercase ${formServicio.categoria === 'paquete' ? 'text-emerald-600' : 'text-indigo-600'}`}>
          {servicioEditando 
            ? 'Editar Elemento' 
            : (formServicio.categoria === 'paquete' ? '📦 Nuevo Paquete / Combo' : '✂️ Nuevo Servicio Individual')}
        </h4>
        <button onClick={() => setShowServicioModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleGuardarServicio} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-slate-500">
            {formServicio.categoria === 'paquete' ? 'Nombre del Paquete *' : 'Nombre del Servicio *'}
          </label>
          <input 
            type="text" 
            name="nombre" 
            required 
            value={formServicio.nombre} 
            onChange={(e) => setFormServicio(prev => ({ ...prev, nombre: e.target.value }))} 
            placeholder={formServicio.categoria === 'paquete' ? "Ej: Combo VIP (Corte + Barba + Mascarilla)" : "Ej: Corte Mid Fade + Barba"} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-slate-500">Descripción</label>
          <textarea 
            name="descripcion" 
            rows="2" 
            value={formServicio.descripcion} 
            onChange={(e) => setFormServicio(prev => ({ ...prev, descripcion: e.target.value }))} 
            placeholder="Detalles de lo que incluye..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 resize-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-500">Precio *</label>
            <input 
              type="text" 
              name="precio" 
              required 
              value={formServicio.precio} 
              onChange={(e) => setFormServicio(prev => ({ ...prev, precio: e.target.value }))} 
              placeholder="Ej: $45.000 COP" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-500">Duración *</label>
            <input 
              type="text" 
              name="duracion" 
              required
              value={formServicio.duracion} 
              onChange={(e) => setFormServicio(prev => ({ ...prev, duracion: e.target.value }))} 
              placeholder="Ej: 45 min" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500" 
            />
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button 
            type="button" 
            onClick={() => setShowServicioModal(false)}
            className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className={`w-1/2 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md ${
              formServicio.categoria === 'paquete' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {servicioEditando 
              ? 'Actualizar' 
              : (formServicio.categoria === 'paquete' ? 'Guardar Paquete' : 'Guardar Servicio')}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
</div>
        )}

        {/* MODAL CREAR / EDITAR SERVICIO */}
        {showServicioModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase text-slate-900">{servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                <button onClick={() => setShowServicioModal(false)} className="p-1 rounded-lg bg-slate-100 text-slate-500 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleGuardarServicio} className="space-y-3 text-[10px]">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Nombre del Servicio *</label>
                  <input type="text" required placeholder="Ej: Corte Degradado + Barba" value={formServicio.nombre} onChange={e => setFormServicio({ ...formServicio, nombre: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Descripción</label>
                  <textarea rows="2" placeholder="Detalles de lo que incluye el servicio..." value={formServicio.descripcion} onChange={e => setFormServicio({ ...formServicio, descripcion: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[9px]">Precio *</label>
                    <input type="text" required placeholder="$40.000 COP" value={formServicio.precio} onChange={e => setFormServicio({ ...formServicio, precio: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[9px]">Duración *</label>
                    <input type="text" required placeholder="45 min" value={formServicio.duracion} onChange={e => setFormServicio({ ...formServicio, duracion: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-700 transition mt-2">
                  <Save className="w-3.5 h-3.5" /> Guardar Servicio
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs"><p className="text-[9px] font-bold text-slate-400 uppercase">Calificación</p><p className="text-2xl font-black text-indigo-600 mt-1">4.9 ★</p></div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs"><p className="text-[9px] font-bold text-slate-400 uppercase">Ingresos Semana</p><p className="text-xl font-black text-fuchsia-600 mt-1">$680.000</p></div>
          </div>
        )}

<div className="space-y-3">
      {/* Alertas de estilo Arkana */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-[11px] font-bold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          {successMsg}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-300 text-red-900 px-4 py-3 rounded-2xl text-[11px] font-bold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
          {errorMessage}
        </div>
      )}
      </div>
        {activeTab === 'perfil' && (
        <div className="space-y-3">
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-2 shadow-xs">
        <h3 className="text-[11px] font-black uppercase text-indigo-950 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-indigo-600" /> Link de Reserva para Clientes</h3>
        <p className="text-[9px] text-indigo-800">Comparte este enlace para que tus clientes reserven directamente contigo:</p>
        <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl p-2">
          <input type="text" readOnly value={linkReserva} className="w-full bg-transparent text-[10px] text-slate-700 outline-none truncate" />
          <button onClick={() => { navigator.clipboard.writeText(linkReserva); setSuccessMsg('¡Enlace copiado al portapapeles!'); setTimeout(() => setSuccessMsg(''), 3000); }} className="bg-indigo-600 text-white p-2 rounded-lg cursor-pointer hover:bg-indigo-700 shrink-0"><Copy className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Perfil Profesional
          </h3>
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 cursor-pointer transition">
            <Edit3 className="w-3 h-3" /> Editar
          </button>
        </div>

        <div className="space-y-2 text-[10px]">
          {renderFieldView("Nombre Completo", nombre)}
          {renderFieldView("Descripción / Biografía", descripcion)}
          <div className="grid grid-cols-2 gap-2">
            {renderFieldView("Teléfono / WhatsApp", telefono)}
            {renderFieldView("Correo Electrónico", correoPerfil)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {renderFieldView("Ciudad", ciudad)}
            {renderFieldView("Experiencia", experiencia)}
          </div>
          {renderFieldView("Especialidad", especialidad)}

          <div className={`p-2.5 rounded-xl border transition-all ${!zonasTrabajo || zonasTrabajo.length === 0 ? 'bg-red-50 border-red-300 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`font-bold uppercase text-[9px] ${!zonasTrabajo || zonasTrabajo.length === 0 ? 'text-red-600' : 'text-slate-500'}`}>Zonas de Bogotá donde trabajas</span>
              {(!zonasTrabajo || zonasTrabajo.length === 0) && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
            </div>
            {(!zonasTrabajo || zonasTrabajo.length === 0) ? (
              <span className="text-red-500 italic text-[10px]">⚠️ Debes seleccionar al menos una zona</span>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {zonasTrabajo.map(z => (
                  <span key={z} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold text-[9px]">{z}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Editar Perfil Profesional
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-200/80 hover:bg-slate-300 p-1.5 rounded-full text-slate-700 cursor-pointer transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              setLoading(true); 
              await updateDoc(doc(db, 'profesionales', authUser.uid), { 
                nombre, descripcion, foto, telefono, correo: correoPerfil, zonasTrabajo, experiencia, ciudad, especialidad 
              }); 
              setSuccessMsg('¡Perfil actualizado con éxito!'); 
              setLoading(false); 
              setIsModalOpen(false);
              setTimeout(() => setSuccessMsg(''), 3000); 
            }} className="p-5 space-y-3 overflow-y-auto text-[10px]">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase text-[9px]">Nombre Completo</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-900 outline-none focus:border-indigo-600" required />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase text-[9px]">Descripción / Biografía</label>
                <textarea rows="3" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Cuéntale a tus clientes sobre tu experiencia y estilo..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-900 outline-none focus:border-indigo-600 resize-none" />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase text-[9px]">Foto de Perfil</label>
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current.click()} className="flex-1 bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-200 transition">
                    <ImageIcon className="w-4 h-4 text-indigo-600" /> Seleccionar de Galería
                  </button>
                  {foto && <span className="text-[9px] text-emerald-600 font-bold truncate max-w-[120px]">Imagen cargada</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Teléfono / WhatsApp</label>
                  <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+57 300 0000000" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-900 outline-none focus:border-indigo-600" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Correo Electrónico</label>
                  <input type="email" value={correoPerfil} onChange={e => setCorreoPerfil(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-900 outline-none focus:border-indigo-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Ciudad</label>
                  <input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-900 outline-none focus:border-indigo-600" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[9px]">Experiencia</label>
                  <input type="text" value={experiencia} onChange={e => setExperiencia(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-900 outline-none focus:border-indigo-600" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase text-[9px]">Especialidad</label>
                <input type="text" value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[12px] text-slate-900 outline-none focus:border-indigo-600" />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-500 uppercase text-[9px]">Zonas de Bogotá donde trabajas</label>
                <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-xl max-h-32 overflow-y-auto">
                  {zonasBogotaDisponibles.map((zona) => {
                    const seleccionada = zonasTrabajo?.includes(zona);
                    return (
                      <button
                        key={zona}
                        type="button"
                        onClick={() => toggleZona(zona)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer transition ${
                          seleccionada ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {zona}
                      </button>
                    );
                  })}
                </div>
              </div>

             <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-700 transition mt-3">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Guardar Cambios</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2.5 flex justify-around items-center z-40 max-w-lg mx-auto shadow-lg">
        <button onClick={() => setActiveTab('agenda')} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'agenda' ? 'text-indigo-600 font-black' : 'text-slate-400 font-bold'}`}>
          <Calendar className="w-4 h-4" />
          <span className="text-[8px] uppercase">Agenda</span>
        </button>
        <button onClick={() => setActiveTab('servicios')} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'servicios' ? 'text-indigo-600 font-black' : 'text-slate-400 font-bold'}`}>
          <Tag className="w-4 h-4" />
          <span className="text-[8px] uppercase">Servicios</span>
        </button>
        <button onClick={() => setActiveTab('estadisticas')} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'estadisticas' ? 'text-indigo-600 font-black' : 'text-slate-400 font-bold'}`}>
          <Sparkles className="w-4 h-4" />
          <span className="text-[8px] uppercase">Panel</span>
        </button>
        <button onClick={() => setActiveTab('perfil')} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'perfil' ? 'text-indigo-600 font-black' : 'text-slate-400 font-bold'}`}>
          <Edit3 className="w-4 h-4" />
          <span className="text-[8px] uppercase">Perfil</span>
        </button>
        
   <button 
  type="button"
  onClick={() => setShowLogoutModal(true)} 
  className="flex flex-col items-center gap-0.5 text-slate-400 font-bold cursor-pointer hover:text-red-600 transition-colors"
>
  <LogOut className="w-4 h-4 text-red-600" />
  <span className="text-[8px] text-red-600 uppercase">Salir</span>
</button>
      </nav>
    </div>
  );
}