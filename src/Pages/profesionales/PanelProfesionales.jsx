import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Sparkles, CheckCircle2, Edit3, Save, RefreshCw, AlertCircle, 
  Plus, Tag, ArrowRight, AlertTriangle, 
  Loader2, Eye, EyeOff, LogOut, X, Share2, Copy, Image as ImageIcon, Trash2, ChevronDown, FileText, Check
} from 'lucide-react';
import { signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc, collection, setDoc, onSnapshot, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';
import Wallet from './Wallet'

// Horario completo de las 24 horas del día
const horasCalendario = [
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dragOverInfo, setDragOverInfo] = useState({ diaStr: null, horaTexto: null, x: 0, y: 0 });
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

  const [nuevaFechaCita, setNuevaFechaCita] = useState('');
  const [nuevaHoraCita, setNuevaHoraCita] = useState('');
  const [nuevaHoraFinCita, setNuevaHoraFinCita] = useState('1:00 a. m.');
  const [nuevoMotivoBloqueo, setNuevoMotivoBloqueo] = useState('');
  const [nuevoServicioCita, setNuevoServicioCita] = useState('');

  const [menuAgendaAbierto, setMenuAgendaAbierto] = useState(false);
  const [modalBloqueoAbierto, setModalBloqueoAbierto] = useState(false);
  const [modalNuevaCitaAbierto, setModalNuevaCitaAbierto] = useState(false);
  const [datosBloqueo, setDatosBloqueo] = useState({ 
    fechaStr: new Date().toISOString().split('T')[0], 
    horaInicio: '12:00 a. m.', 
    horaFin: '7:00 a. m.', 
    motivo: 'No disponible' 
  });

  const [datosNuevaCita, setDatosNuevaCita] = useState({
    clienteNombre: '',
    telefono: '',
    servicio: '',
    fechaStr: new Date().toISOString().split('T')[0],
    hora: '12:00 a. m.'
  });

  const handleCerrarSesion = () => {
    if (document.getElementById('modal-salir-arkana')) return;

    const overlay = document.createElement('div');
    overlay.id = 'modal-salir-arkana';
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200';
    
    overlay.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 text-slate-100 space-y-4 scale-100 animate-in zoom-in-95 duration-150">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 text-lg shadow-inner">
            🚪
          </div>
          <div>
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-200">Cerrar Sesión</h3>
            <p class="text-[10px] text-slate-400">¿Estás seguro de que deseas salir del sistema?</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          <button
            id="btn-cancelar-salir"
            type="button"
            class="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer active:scale-95"
          >
            Cancelar
          </button>
          <button
            id="btn-confirmar-salir"
            type="button"
            class="bg-red-600 hover:bg-red-500 text-white border border-red-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all duration-200 cursor-pointer shadow-lg shadow-red-900/30 active:scale-95"
          >
            Sí, Salir
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-cancelar-salir').onclick = () => {
      overlay.remove();
    };

    document.getElementById('btn-confirmar-salir').onclick = async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        await signOut(auth);
        window.location.href = '/panelprofesionales';
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        overlay.remove();
      }
    };
  };

  const [serviciosFirebase, setServiciosFirebase] = useState([]);
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [formServicio, setFormServicio] = useState({ nombre: '', descripcion: '', precio: '', duracion: '45 min', categoria: 'servicio' });

  const [, setBarberData] = useState(null);
  
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

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const horaAMinutos = (horaStr) => {
    if (!horaStr) return 0;
    const limpio = horaStr.trim().toUpperCase().replace(/\./g, '');
    const partesHora = limpio.split(':');
    const h = parseInt(partesHora[0], 10) || 0;
    const m = parseInt(partesHora[1], 10) || 0;
    
    const esPM = limpio.includes('P');
    const esAM = limpio.includes('A');

    let realH = h;
    if (esPM && realH < 12) realH += 12;
    if (esAM && realH === 12) realH = 0;
    return realH * 60 + m;
  };

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
    } catch (e) {
      // Ignorar restricciones de audio automático
    }
  };

  const y = fechaSeleccionada.getFullYear();
  const m = fechaSeleccionada.getMonth();
  const diasDelMes = Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => {
    const d = new Date(y, m, i + 1);
    return { fechaObj: d, num: i + 1, nombre: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()] };
  });

  const getDiasVisibles = () => {
    const idx = Math.max(0, diasDelMes.findIndex(d => d.fechaObj.toDateString() === fechaSeleccionada.toDateString()));
    if (vistaCalendario === 'diario') return [diasDelMes[idx] || diasDelMes[0]];
    if (vistaCalendario === '3dias') return diasDelMes.slice(Math.max(0, idx - 1), Math.min(diasDelMes.length, Math.max(0, idx - 1) + 3));
    return diasDelMes.slice(Math.max(0, Math.min(idx - 3, diasDelMes.length - 7)), Math.max(0, Math.min(idx - 3, diasDelMes.length - 7)) + 7);
  };

  useEffect(() => {
    const calcTime = () => {
      const now = new Date();
      setCurrentTimeMinutes(Math.max(0, Math.min(100, ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100)));
    };
    calcTime();
    const t = setInterval(calcTime, 30000);

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      let unsubFirestoreStatus = () => {};
      let unsubServicios = () => {};
      let unsubCitas = () => {};

      if (user) {
        setAuthUser(user);

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
        }, (error) => {
          console.error("Error al verificar estado del profesional:", error);
        });

        const nombreBarberoActual = nombre;
        
        const qServicios = query(collection(db, 'servicios'), where('barberoId', '==', user.uid));
        unsubServicios = onSnapshot(qServicios, (servSnap) => {
          const listaServicios = [];
          servSnap.forEach(docServ => {
            listaServicios.push({ id: docServ.id, ...docServ.data() });
          });
          setServiciosFirebase(listaServicios);
        });

        unsubCitas = onSnapshot(collection(db, 'citas'), (snapshot) => {
          const citasServer = [];
          let idsActuales = citasFirestore.map(c => c.id);

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const coincideId = data.barberoId === user.uid;
            const coincideNombre = (nombreBarberoActual && data.barberoName && data.barberoName.toLowerCase().trim() === nombreBarberoActual.toLowerCase().trim());

            if (coincideId || coincideNombre || !data.barberoId) {
              let horaBD = (data.hora || '').trim();
              
              const matchHora = horasCalendario.find(h => 
                h.val24 === horaBD || 
                h.label.toLowerCase() === horaBD.toLowerCase() ||
                horaBD.toLowerCase().includes(h.val24) ||
                horaBD.toLowerCase().replace(/\s+/g, '').includes(h.label.toLowerCase().replace(/\s+/g, ''))
              );

              const horaNormalizada = matchHora ? matchHora.label : (horaBD || '12:00 a. m.');
              const estado = (data.estado || 'pendiente').toLowerCase();
              
              if (!primerCargaRef.current && !idsActuales.includes(docSnap.id) && estado !== 'cancelada' && estado !== 'cancelado' && estado !== 'bloqueado') {
                reproducirSonidoAlerta();
              }

              let colorClase = 'bg-indigo-50 border-indigo-200 text-indigo-950 font-semibold shadow-xs';
              if (estado === 'confirmada' || estado === 'confirmado') colorClase = 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold shadow-xs';
              if (estado === 'finalizada' || estado === 'finalizado') colorClase = 'bg-slate-100 border-slate-200 text-slate-400 font-normal';
              if (estado === 'bloqueado') colorClase = 'bg-rose-100 border-rose-300 text-rose-800 font-bold';

              citasServer.push({
                ...data,
                id: docSnap.id, 
                cliente: data.clienteNombre || 'BLOQUEADO', 
                clienteTelefono: data.telefono || data.clienteTelefono || '',
                clienteEmail: data.clienteEmail || '', 
                servicio: data.servicio || 'Servicio General',
                hora: horaNormalizada, 
                horaFin: data.horaFin || '',
                duracionTotal: data.duracionTotal || 45,
                fechaStr: data.fecha || '', 
                estado, 
                color: colorClase, 
                esBloqueo: estado === 'bloqueado',
                motivo: data.motivo || ''
              });
            }
          });

          primerCargaRef.current = false;
          setCitasFirestore(citasServer);
        });

      } else { 
        setAuthUser(null); 
        setCitasFirestore([]); 
        setServiciosFirebase([]);
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
    setNuevaFechaCita(cita.fechaStr || cita.fecha || '');
    setNuevaHoraCita(cita.hora || '');
    setNuevaHoraFinCita(cita.horaFin || 'No disponible');
    setNuevoMotivoBloqueo(cita.motivo || 'No disponible');
    
    const nombreServicio = cita.servicios?.[0]?.nombre || cita.servicio || '';
    setNuevoServicioCita(nombreServicio);
  };

  const actualizarCitaArrastrada = async (cita, nuevaFechaStr, nuevaHoraExacta) => {
    try {
      const citaId = cita.id || cita.uid;
      if (!citaId) return;

      const citaRef = doc(db, "citas", citaId);
      const datosActualizados = {
        fecha: nuevaFechaStr,
        hora: nuevaHoraExacta,
      };

      await updateDoc(citaRef, datosActualizados);

      setCitasFirestore(prevCitas => 
        prevCitas.map(c => (c.id || c.uid) === citaId ? { ...c, ...datosActualizados } : c)
      );
    } catch (error) {
      console.error("Error al actualizar la cita arrastrada:", error);
      alert("Hubo un error al mover la cita. Inténtalo de nuevo.");
    }
  };

  const actualizarCitaFirestore = async (nuevoEstado) => {
    if (!citaSeleccionada) return;
    setModalLoading(true);
    try {
      const citaRef = doc(db, 'citas', citaSeleccionada.id);
      let datosActualizacion = {
        fecha: nuevaFechaCita,
        hora: nuevaHoraCita
      };

      if (citaSeleccionada.esBloqueo) {
        const minInicio = horaAMinutos(nuevaHoraCita);
        const minFin = horaAMinutos(nuevaHoraFinCita);
        if (minFin <= minInicio) {
          alert('La hora fin debe ser posterior a la hora de inicio.');
          setModalLoading(false);
          return;
        }
        datosActualizacion.horaFin = nuevaHoraFinCita;
        datosActualizacion.duracionTotal = minFin - minInicio;
        datosActualizacion.motivo = nuevoMotivoBloqueo;
      } else {
        datosActualizacion.estado = nuevoEstado;
        if (nuevoServicioCita) {
          datosActualizacion.servicio = nuevoServicioCita;
        }
      }

      await updateDoc(citaRef, datosActualizacion);
      setSuccessMsg(citaSeleccionada.esBloqueo ? 'Bloqueo actualizado correctamente' : `Cita actualizada a: ${nuevoEstado}`);
      setCitaSeleccionada(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Error al actualizar el elemento');
      setTimeout(() => setErrorMsg(''), 3000);
    }
    setModalLoading(false);
  };

  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    if (!formServicio.nombre || !formServicio.precio) return alert('Nombre y precio son obligatorios');

    try {
      const colorSeleccionado = formServicio.color || (formServicio.categoria === 'paquete' ? '#3b82f6' : '#eab308');

      if (servicioEditando) {
        await updateDoc(doc(db, 'servicios', servicioEditando.id), {
          nombre: formServicio.nombre,
          descripcion: formServicio.descripcion,
          precio: formServicio.precio,
          duracion: formServicio.duracion,
          categoria: formServicio.categoria || 'servicio',
          color: colorSeleccionado
        });
        setSuccessMsg('Elemento actualizado con éxito');
      } else {
        await addDoc(collection(db, 'servicios'), {
          barberoId: authUser.uid,
          nombre: formServicio.nombre,
          descripcion: formServicio.descripcion,
          precio: formServicio.precio,
          duracion: formServicio.duracion,
          categoria: formServicio.categoria || 'servicio',
          color: colorSeleccionado
        });
        setSuccessMsg('Elemento agregado con éxito');
      }
      setShowServicioModal(false);
      setServicioEditando(null);
      setFormServicio({ nombre: '', descripcion: '', precio: '', duracion: '45 min', categoria: 'servicio', color: '#eab308' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
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
      } catch {
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

          {errorMsgLogin && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[10px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsgLogin}</span>
            </div>
          )}

          {successMsgLogin && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-bold">{successMsgLogin}</span>
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
            </div>

            {isRegistering && (
              <div className="space-y-1">
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    placeholder="Confirmar Contraseña" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    className="w-full bg-white border rounded-xl py-2 pl-3 pr-9 text-xs text-slate-800 outline-none transition-all placeholder-slate-400 shadow-sm border-slate-200 focus:border-indigo-600" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
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

      <main className="flex-1 p-2 w-full max-w-lg mx-auto overflow-x-hidden">
        {successMsg && <div className="mb-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{successMsg}</div>}
        {errorMsg && <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[10px] flex gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-red-600" />{errorMsg}</div>}

        {activeTab === 'agenda' && (
          <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100vh-5rem)] space-y-2 overflow-hidden text-blue-950 pb-1">
            <div className="shrink-0 space-y-1.5">
              <div className="bg-gradient-to-b from-blue-50 to-blue-100/70 border border-blue-300/80 rounded-2xl p-2.5 shadow-[0_4px_12px_rgba(37,99,235,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase text-blue-800">📅 Mes / Día:</span>
                    <input 
                      type="date" 
                      value={fechaSeleccionada.toISOString().split('T')[0]} 
                      onChange={(e) => {
                        if (e.target.value) {
                          setFechaSeleccionada(new Date(e.target.value + 'T00:00:00'));
                        }
                      }}
                      className="bg-blue-50/80 border border-blue-300 rounded-xl px-2.5 py-1 text-[10px] font-bold text-blue-950 outline-none focus:border-blue-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-blue-200/60 p-1 rounded-xl border border-blue-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                    <button 
                      type="button"
                      onClick={() => setVistaCalendario('diario')}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${vistaCalendario === 'diario' ? 'bg-blue-600 text-white shadow-[0_2px_6px_rgba(37,99,235,0.4)] scale-105' : 'text-blue-800 hover:text-blue-950'}`}
                    >
                      1 Día
                    </button>
                    <button 
                      type="button"
                      onClick={() => setVistaCalendario('3dias')}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${vistaCalendario === '3dias' ? 'bg-blue-600 text-white shadow-[0_2px_6px_rgba(37,99,235,0.4)] scale-105' : 'text-blue-800 hover:text-blue-950'}`}
                    >
                      3 Días
                    </button>
                    <button 
                      type="button"
                      onClick={() => setVistaCalendario('semanal')}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${vistaCalendario === 'semanal' ? 'bg-blue-600 text-white shadow-[0_2px_6px_rgba(37,99,235,0.4)] scale-105' : 'text-blue-800 hover:text-blue-950'}`}
                    >
                      7 Días
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative flex justify-end items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFechaSeleccionada(new Date())}
                  className="bg-gradient-to-b from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-400/80 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all duration-200 cursor-pointer shadow-[0_2px_5px_rgba(37,99,235,0.2)] active:scale-95 flex items-center gap-1"
                >
                  📍 Hoy
                </button>

                <button 
                  onClick={() => setMenuAgendaAbierto(!menuAgendaAbierto)}
                  className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border border-blue-800 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] uppercase flex items-center gap-1.5 shadow-[0_3px_8px_rgba(37,99,235,0.35)] transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-100" /> Opciones de Agenda <ChevronDown className="w-3 h-3 text-blue-100" />
                </button>

                {menuAgendaAbierto && (
                  <div className="absolute right-0 top-10 z-50 bg-blue-50 border border-blue-300 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.12)] p-1.5 w-56 text-blue-950 animate-in fade-in zoom-in-95 duration-150">
                    <button 
                      onClick={() => {
                        setMenuAgendaAbierto(false);
                        setModalNuevaCitaAbierto(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-blue-100 hover:text-blue-900 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      ✨ Cita nueva
                    </button>
                    <button 
                      onClick={() => {
                        setMenuAgendaAbierto(false);
                        setModalBloqueoAbierto(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center gap-2 text-rose-600 cursor-pointer"
                    >
                      🚫 Horario no disponible
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div 
              className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full select-none rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] border border-blue-300 bg-white [perspective:1400px] mb-2"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                e.currentTarget.dataset.touchStartX = touch.clientX;
              }}
              onTouchMove={(e) => {
                const startX = parseFloat(e.currentTarget.dataset.touchStartX || '0');
                const currentX = e.touches[0].clientX;
                const diff = currentX - startX;
                const hojaActual = e.currentTarget.querySelector('.libro-pagina-actual');
                const hojaFondo = e.currentTarget.querySelector('.libro-pagina-fondo');

                if (hojaActual) {
                  const rotacion = (diff / window.innerWidth) * 20;
                  hojaActual.style.transform = `translateX(${diff * 0.5}px) rotateY(${rotacion}deg)`;
                  hojaActual.style.transition = 'none';
                }

                if (hojaFondo) {
                  hojaFondo.style.opacity = Math.min(1, Math.abs(diff) / 80);
                }
              }}
              onTouchEnd={(e) => {
                const startX = parseFloat(e.currentTarget.dataset.touchStartX || '0');
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                const minSwipeDistance = 50;
                const hojaActual = e.currentTarget.querySelector('.libro-pagina-actual');

                if (Math.abs(diff) > minSwipeDistance) {
                  if (hojaActual) {
                    hojaActual.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';
                    hojaActual.style.transform = `translateX(${diff > 0 ? '-100%' : '100%'}) rotateY(${diff > 0 ? '-15deg' : '15deg'})`;
                    hojaActual.style.opacity = '0';
                  }

                  setTimeout(() => {
                    const nuevaFecha = new Date(fechaSeleccionada);
                    let diasASaltar = 7;
                    if (vistaCalendario === 'diario') diasASaltar = 1;
                    if (vistaCalendario === '3dias') diasASaltar = 3;

                    if (diff > 0) {
                      nuevaFecha.setDate(nuevaFecha.getDate() + diasASaltar);
                    } else {
                      nuevaFecha.setDate(nuevaFecha.getDate() - diasASaltar);
                    }
                    setFechaSeleccionada(nuevaFecha);
                  }, 300);
                } else {
                  if (hojaActual) {
                    hojaActual.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                    hojaActual.style.transform = 'translateX(0px) rotateY(0deg)';
                    hojaActual.style.opacity = '1';
                  }
                }
              }}
            >
              <div className="libro-pagina-fondo absolute inset-0 bg-white p-1 opacity-0 transition-opacity duration-150 pointer-events-none">
                <div className="grid sticky top-0 z-20 bg-gradient-to-b from-blue-100 to-blue-200 border-b border-blue-300 text-center text-[9px] font-black uppercase text-blue-900 shadow-sm" style={{ gridTemplateColumns: `50px repeat(${diasVisibles.length}, minmax(0, 1fr))` }}>
                  <div className="text-left pl-2 py-2 text-blue-800 font-bold text-[8px] border-r border-blue-300/60">Hora</div>
                  {diasVisibles.map((d, i) => {
                    const esHoy = d.fechaObj.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} className={`py-2 px-0.5 border-r border-blue-300/60 last:border-r-0 truncate ${esHoy ? 'bg-blue-600 text-white font-black' : 'text-blue-800'}`}>
                        {d.nombre.toUpperCase()} {d.num}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="libro-pagina-actual bg-white relative w-full text-blue-950 [transform-style:preserve-3d] origin-left shadow-sm rounded-2xl overflow-hidden">
                <div className="grid sticky top-0 z-20 bg-gradient-to-b from-blue-100 to-blue-200 border-b border-blue-300 text-center text-[9px] font-black uppercase text-blue-900 shadow-[0_2px_4px_rgba(0,0,0,0.04)]" style={{ gridTemplateColumns: `50px repeat(${diasVisibles.length}, minmax(0, 1fr))` }}>
                  <div className="text-left pl-2 py-2 text-blue-800 font-bold text-[8px] border-r border-blue-300/60 bg-blue-100">Hora</div>
                  {diasVisibles.map((d, i) => {
                    const esHoy = d.fechaObj.toDateString() === new Date().toDateString();
                    const esSeleccionado = d.fechaObj.toDateString() === fechaSeleccionada.toDateString();

                    let estiloDia = 'text-blue-900';
                    if (esHoy) {
                      estiloDia = 'bg-blue-600 text-white font-black border-b-2 border-blue-800 shadow-inner';
                    } else if (esSeleccionado) {
                      estiloDia = 'bg-blue-200/70 text-blue-950 font-black shadow-inner';
                    }

                    return (
                      <div key={i} className={`py-2 px-0.5 border-r border-blue-300/60 last:border-r-0 truncate transition-colors ${estiloDia}`}>
                        {d.nombre.toUpperCase()} {d.num} {esHoy && '📍'}
                      </div>
                    );
                  })}
                </div>

                <div className="relative" onClick={() => menuAgendaAbierto && setMenuAgendaAbierto(false)}>
                  {dragOverInfo.horaTexto && (
                    <div className="absolute z-40 pointer-events-none bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-[0_4px_12px_rgba(37,99,235,0.4)] border border-blue-400 backdrop-blur-sm"
                         style={{ top: `${Math.max(10, dragOverInfo.y - 40)}px`, left: '50%', transform: 'translateX(-50%)' }}>
                      📍 Mover a: <span className="underline">{dragOverInfo.horaTexto}</span>
                    </div>
                  )}

                  {diasVisibles.some(d => d.fechaObj.toDateString() === new Date().toDateString()) && (
                    <div 
                      className="absolute right-0 z-50 flex items-center pointer-events-none transition-all duration-300" 
                      style={{ 
                        top: `${currentTimeMinutes}%`,
                        left: `${(diasVisibles.findIndex(d => d.fechaObj.toDateString() === new Date().toDateString()) + 1) * (100 / (diasVisibles.length + 1))}%`,
                        width: `${100 / (diasVisibles.length + 1)}%`
                      }}
                    >
                      <div className="w-[40px] bg-blue-600 text-white text-[7px] font-black text-center py-0.5 rounded-r shadow-md">HOY</div>
                      <div className="flex-1 border-t-2 border-blue-600 shadow-[0_1px_3px_rgba(37,99,235,0.4)]"></div>
                    </div>
                  )}

                  {horasCalendario.map((itemHora, idx) => {
                    const [fH, fM] = itemHora.val24.split(':').map(Number);
                    const minutosFilaInicio = fH * 60 + fM;
                    const minutosFilaFin = minutosFilaInicio + 60;

                    const esHorarioLaboral = fH >= 9 && fH <= 21;

                    const convertirHoraAMinutos = (horaStr, esBloqueo = false) => {
                      if (!horaStr) return 0;
                      let clean = horaStr.toString().toUpperCase().trim();
                      
                      let isPM = clean.includes('PM') || clean.includes('P.M.') || clean.includes('P. M.');
                      let isAM = clean.includes('AM') || clean.includes('A.M.') || clean.includes('A. M.');

                      let timePart = clean.replace(/[^0-9:]/g, '').trim();
                      let parts = timePart.split(':');
                      let hours = parseInt(parts[0], 10) || 0;
                      let minutes = parseInt(parts[1], 10) || 0;
                      
                      if (esBloqueo) {
                        if (isPM && hours < 12) hours += 12;
                        if (isAM && hours === 12) hours = 0;
                      } else {
                        if (isPM && hours < 12) {
                          hours += 12;
                        } else if (isAM && hours === 12) {
                          hours = 0;
                        } else if (!isPM && !isAM && hours >= 1 && hours <= 7) {
                          hours += 12;
                        }
                      }

                      if (!esBloqueo && isAM && (hours === 1 || hours === 2)) {
                        hours += 12;
                      }
                      
                      return hours * 60 + minutes;
                    };

                    const minutosAHoraTexto = (totalMinutos) => {
                      const minutosNorm = ((totalMinutos % 1440) + 1440) % 1440;
                      const h24 = Math.floor(minutosNorm / 60);
                      const min = minutosNorm % 60;
                      const ampm = h24 >= 12 ? 'PM' : 'AM';
                      const h12 = h24 % 12 || 12;
                      return `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`;
                    };

                    return (
                      <div key={idx} className="grid items-stretch min-h-[50px] border-b border-blue-300/45 text-[9px] relative" style={{ gridTemplateColumns: `50px repeat(${diasVisibles.length}, minmax(0, 1fr))` }}>
                        <div className={`border-r border-blue-300/65 p-0.5 font-bold text-[7px] flex items-center justify-center text-center transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] ${esHorarioLaboral ? 'bg-blue-100/50 text-blue-900' : 'bg-blue-100/20 text-blue-700'}`}>
                          {itemHora.label}
                        </div>

                        {diasVisibles.map((dia, dIdx) => {
                          const fechaStr = dia.fechaObj.toISOString().split('T')[0];

                          const citasEnEstaHora = citasFirestore.filter(c => {
                            if (c.fechaStr !== fechaStr || !c.hora || c.esBloqueo) return false;
                            const minutosCitaInicio = convertirHoraAMinutos(c.hora, false);
                            return minutosCitaInicio >= minutosFilaInicio && minutosCitaInicio < minutosFilaFin;
                          });

                          const bloqueosEnEstaHora = citasFirestore.filter(c => {
                            if (c.fechaStr !== fechaStr || !c.hora || !c.esBloqueo) return false;
                            const minutosBloqueoInicio = convertirHoraAMinutos(c.hora, true);
                            return minutosBloqueoInicio >= minutosFilaInicio && minutosBloqueoInicio < minutosFilaFin;
                          });

                          const elementosEnEstaHora = [...bloqueosEnEstaHora, ...citasEnEstaHora];

                          return (
                            <div 
                              key={dIdx} 
                              className={`border-r border-blue-300/35 last:border-r-0 p-1 relative flex flex-row gap-1 items-stretch overflow-visible transition-colors ${
                                dragOverInfo.diaStr === fechaStr ? 'bg-blue-200/50' : (esHorarioLaboral ? 'bg-blue-50/20 hover:bg-blue-100/30' : 'bg-white hover:bg-blue-50/40')
                              }`}
                              onDragOver={(e) => {
                                e.preventDefault();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const offsetY = e.clientY - rect.top;
                                const porcentajeY = Math.max(0, Math.min(1, offsetY / rect.height));
                                const minutosRelativos = Math.round((porcentajeY * 60) / 5) * 5;
                                const totalMinutosNuevos = minutosFilaInicio + minutosRelativos;

                                const horaFormateada = minutosAHoraTexto(totalMinutosNuevos);

                                setDragOverInfo({
                                  diaStr: fechaStr,
                                  horaTexto: `${dia.nombre.toUpperCase()} ${dia.num} a las ${horaFormateada}`,
                                  y: e.clientY
                                });
                              }}
                              onDragLeave={() => setDragOverInfo({ diaStr: null, horaTexto: null, y: 0 })}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragOverInfo({ diaStr: null, horaTexto: null, y: 0 });
                                const citaId = e.dataTransfer.getData("text/plain");
                                if (!citaId) return;
                                const citaArrastrada = citasFirestore.find(c => (c.id || c.uid) === citaId);
                                if (!citaArrastrada || citaArrastrada.esBloqueo) return;

                                const estadoCita = (citaArrastrada.estado || '').toLowerCase();
                                if (estadoCita === 'finalizada' || estadoCita === 'finalizado') return;

                                const rect = e.currentTarget.getBoundingClientRect();
                                const offsetY = e.clientY - rect.top;
                                const porcentajeY = Math.max(0, Math.min(1, offsetY / rect.height));
                                const minutosRelativos = Math.round((porcentajeY * 60) / 5) * 5;
                                const totalMinutosNuevos = minutosFilaInicio + minutosRelativos;

                                const nuevaHoraFormateada = minutosAHoraTexto(totalMinutosNuevos);
                                actualizarCitaArrastrada(citaArrastrada, fechaStr, nuevaHoraFormateada);
                              }}
                            >
                              {elementosEnEstaHora.length > 0 ? (
                                elementosEnEstaHora.map((itemCita, cIdx) => {
                                  const minutosItemInicio = convertirHoraAMinutos(itemCita.hora, itemCita.esBloqueo);
                                  const citaKey = itemCita.id || itemCita.uid;
                                  
                                  const estadoCita = (itemCita.estado || '').toLowerCase();
                                  const esFinalizada = estadoCita === 'finalizada' || estadoCita === 'finalizado';

                                  let duracionMin = parseInt(itemCita.duracionTotal || itemCita.duracion || 45, 10);
                                  if (itemCita.esBloqueo && itemCita.horaFin) {
                                    const minFin = convertirHoraAMinutos(itemCita.horaFin, true);
                                    if (minFin > minutosItemInicio) {
                                      duracionMin = minFin - minutosItemInicio;
                                    } else if (minFin < minutosItemInicio) {
                                      duracionMin = (1440 - minutosItemInicio) + minFin;
                                    }
                                  }

                                  const offsetMinutosEnHora = minutosItemInicio - minutosFilaInicio;
                                  const topPercent = Math.max(0, (offsetMinutosEnHora / 60) * 100);
                                  const alturaTotalPixeles = (duracionMin / 60) * 50;

                                  const totalCol = elementosEnEstaHora.length;
                                  const widthPercent = totalCol > 1 ? `${100 / totalCol}%` : '100%';
                                  const leftPercent = totalCol > 1 ? `${(cIdx * (100 / totalCol))}%` : '0px';

                                  return (
                                    <div 
                                      key={cIdx}
                                      draggable={!itemCita.esBloqueo && !esFinalizada}
                                      onDragStart={(e) => {
                                        if (esFinalizada) {
                                          e.preventDefault();
                                          return;
                                        }
                                        e.dataTransfer.setData("text/plain", citaKey);
                                      }}
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        abrirModalCita(itemCita); 
                                      }} 
                                      style={{ 
                                        top: `${topPercent}%`, 
                                        height: itemCita.esBloqueo ? `${Math.max(alturaTotalPixeles, 38)}px` : `${Math.max((duracionMin / 60) * 100, 38)}%`, 
                                        minHeight: '38px', 
                                        zIndex: itemCita.esBloqueo ? 30 : 40,
                                        width: `calc(${widthPercent} - 4px)`,
                                        left: `calc(${leftPercent} + 2px)`
                                      }}
                                      className={`absolute p-1.5 border transition-all duration-200 shadow-[0_3px_8px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.7)] flex flex-col justify-between overflow-hidden rounded-lg ${
                                        itemCita.esBloqueo 
                                          ? 'bg-gradient-to-b from-rose-100 to-rose-200 text-rose-900 border-rose-300 font-bold cursor-pointer hover:shadow-[0_4px_12px_rgba(244,63,94,0.2)] select-none' 
                                          : esFinalizada
                                            ? 'bg-slate-200 text-slate-500 border-slate-300 font-normal cursor-pointer select-none shadow-none opacity-80'
                                            : `cursor-grab active:cursor-grabbing hover:shadow-[0_6px_16px_rgba(37,99,235,0.15)] hover:scale-[1.02] ${itemCita.color || 'bg-gradient-to-b from-blue-100 to-blue-200 border-blue-400 text-blue-950'}`
                                      }`}
                                    >
                                      <div className="flex justify-between items-center pointer-events-none">
                                        <span className="font-black truncate text-[8px] block drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                                          {itemCita.esBloqueo ? `🚫 ${itemCita.motivo || 'NO DISPONIBLE'}` : (itemCita.cliente || itemCita.clienteNombre)}
                                        </span>
                                        <span className="text-[7px] font-bold opacity-80">{itemCita.hora} {itemCita.horaFin ? `- ${itemCita.horaFin}` : ''}</span>
                                      </div>

                                      {!itemCita.esBloqueo && (
                                        <span className="text-[7px] truncate font-bold block pointer-events-none opacity-90">
                                          {itemCita.servicio} ({duracionMin}m)
                                        </span>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center text-blue-800/30 text-[9px] h-full flex items-center justify-center"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {modalBloqueoAbierto && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  🚫 Agregar Horario No Disponible
                </h3>
                <button onClick={() => setModalBloqueoAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
              </div>

              <div className="space-y-3 text-[11px]">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Tipo de Bloqueo:</label>
                  <select 
                    value={datosBloqueo.tipoRepeticion || 'unico'} 
                    onChange={(e) => setDatosBloqueo({...datosBloqueo, tipoRepeticion: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50 text-[10px]"
                  >
                    <option value="unico">Día único</option>
                    <option value="rango">Rango de fechas (Continuo)</option>
                    <option value="semanal">Días específicos de la semana (Recurrente)</option>
                  </select>
                </div>

                {datosBloqueo.tipoRepeticion === 'rango' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Fecha Inicio:</label>
                      <input 
                        type="date" 
                        value={datosBloqueo.fechaStr} 
                        onChange={(e) => setDatosBloqueo({...datosBloqueo, fechaStr: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Fecha Fin:</label>
                      <input 
                        type="date" 
                        value={datosBloqueo.fechaFinRango || ''} 
                        onChange={(e) => setDatosBloqueo({...datosBloqueo, fechaFinRango: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Fecha:</label>
                    <input 
                      type="date" 
                      value={datosBloqueo.fechaStr} 
                      onChange={(e) => setDatosBloqueo({...datosBloqueo, fechaStr: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
                    />
                  </div>
                )}

                {datosBloqueo.tipoRepeticion === 'semanal' && (
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Repetir durante (semanas/meses):</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="52"
                      value={datosBloqueo.cantidadSemanas || 1} 
                      onChange={(e) => setDatosBloqueo({...datosBloqueo, cantidadSemanas: parseInt(e.target.value) || 1})}
                      placeholder="Ej: 4 semanas"
                      className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Hora Inicio:</label>
                    <select 
                      value={datosBloqueo.horaInicio} 
                      onChange={(e) => setDatosBloqueo({...datosBloqueo, horaInicio: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50 text-[10px]"
                    >
                      {horasCalendario.map((h, i) => (
                        <option key={i} value={h.label}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Hora Fin:</label>
                    <select 
                      value={datosBloqueo.horaFin} 
                      onChange={(e) => setDatosBloqueo({...datosBloqueo, horaFin: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50 text-[10px]"
                    >
                      {horasCalendario.map((h, i) => (
                        <option key={i} value={h.label}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Motivo del bloqueo:</label>
                  <input 
                    type="text" 
                    value={datosBloqueo.motivo} 
                    onChange={(e) => setDatosBloqueo({...datosBloqueo, motivo: e.target.value})}
                    placeholder="Ej: Madrugada, Descanso, Vacaciones..."
                    className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setModalBloqueoAbierto(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition text-[10px] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    const minInicio = horaAMinutos(datosBloqueo.horaInicio);
                    const minFin = horaAMinutos(datosBloqueo.horaFin);
                    if (minFin <= minInicio) {
                      alert('La hora fin debe ser posterior a la hora de inicio.');
                      return;
                    }
                    const duracionTotalMinutos = minFin - minInicio;
                    const tipo = datosBloqueo.tipoRepeticion || 'unico';

                    let fechasAGenerar = [];

                    if (tipo === 'unico') {
                      if (!datosBloqueo.fechaStr) {
                        alert('Por favor selecciona una fecha.');
                        return;
                      }
                      fechasAGenerar.push(datosBloqueo.fechaStr);
                    } else if (tipo === 'rango') {
                      if (!datosBloqueo.fechaStr || !datosBloqueo.fechaFinRango) {
                        alert('Por favor selecciona la fecha de inicio y fin.');
                        return;
                      }
                      let curr = new Date(datosBloqueo.fechaStr + 'T00:00:00');
                      let end = new Date(datosBloqueo.fechaFinRango + 'T00:00:00');
                      
                      if (curr > end) {
                        alert('La fecha de inicio no puede ser posterior a la fecha fin.');
                        return;
                      }

                      while (curr <= end) {
                        fechasAGenerar.push(curr.toISOString().split('T')[0]);
                        curr.setDate(curr.getDate() + 1);
                      }
                    } else if (tipo === 'semanal') {
                      if (!datosBloqueo.fechaStr) {
                        alert('Por favor selecciona una fecha base.');
                        return;
                      }
                      const semanas = datosBloqueo.cantidadSemanas || 1;
                      let baseDate = new Date(datosBloqueo.fechaStr + 'T00:00:00');

                      for (let i = 0; i < semanas; i++) {
                        let d = new Date(baseDate);
                        d.setDate(d.getDate() + (i * 7));
                        fechasAGenerar.push(d.toISOString().split('T')[0]);
                      }
                    }

                    try {
                      const batchPromises = fechasAGenerar.map(async (fecha) => {
                        const nuevoBloqueo = {
                          barberoId: authUser.uid,
                          estado: 'bloqueado',
                          fecha: fecha,
                          hora: datosBloqueo.horaInicio,
                          horaFin: datosBloqueo.horaFin,
                          duracionTotal: duracionTotalMinutos,
                          motivo: datosBloqueo.motivo,
                          clienteNombre: 'BLOQUEADO'
                        };
                        return addDoc(collection(db, 'citas'), nuevoBloqueo);
                      });

                      await Promise.all(batchPromises);

                      setSuccessMsg(`Se han registrado ${fechasAGenerar.length} bloqueos correctamente.`);
                      setModalBloqueoAbierto(false);
                      setTimeout(() => setSuccessMsg(''), 3000);
                    } catch (error) {
                      console.error(error);
                      setErrorMsg('Error al guardar los bloqueos en la base de datos.');
                    }
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition text-[10px] shadow-sm cursor-pointer"
                >
                  Guardar Bloqueo(s)
                </button>
              </div>
            </div>
          </div>
        )}

        {modalNuevaCitaAbierto && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 border border-slate-100 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  ✨ Registrar Cita Nueva
                </h3>
                <button onClick={() => setModalNuevaCitaAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
              </div>

              <div className="space-y-3 text-[11px]">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Nombre del Cliente:</label>
                  <input 
                    type="text" 
                    value={datosNuevaCita.clienteNombre} 
                    onChange={(e) => setDatosNuevaCita({...datosNuevaCita, clienteNombre: e.target.value})}
                    placeholder="Ej: Carlos Pérez"
                    className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Teléfono:</label>
                  <input 
                    type="tel" 
                    value={datosNuevaCita.telefono} 
                    onChange={(e) => setDatosNuevaCita({...datosNuevaCita, telefono: e.target.value})}
                    placeholder="+57 300 0000000"
                    className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Servicio:</label>
                  <input 
                    type="text" 
                    value={datosNuevaCita.servicio} 
                    onChange={(e) => setDatosNuevaCita({...datosNuevaCita, servicio: e.target.value})}
                    placeholder="Ej: Corte Nocturno / VIP"
                    className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Fecha:</label>
                    <input 
                      type="date" 
                      value={datosNuevaCita.fechaStr} 
                      onChange={(e) => setDatosNuevaCita({...datosNuevaCita, fechaStr: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Hora (24h):</label>
                    <select 
                      value={datosNuevaCita.hora} 
                      onChange={(e) => setDatosNuevaCita({...datosNuevaCita, hora: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl p-2 font-medium text-slate-700 bg-slate-50 text-[10px]"
                    >
                      {horasCalendario.map((h, i) => (
                        <option key={i} value={h.label}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setModalNuevaCitaAbierto(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition text-[10px] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    if (!datosNuevaCita.clienteNombre || !datosNuevaCita.servicio) {
                      alert('El nombre del cliente y el servicio son obligatorios.');
                      return;
                    }

                    const nuevaCitaDoc = {
                      barberoId: authUser.uid,
                      barberoName: nombre,
                      clienteNombre: datosNuevaCita.clienteNombre,
                      telefono: datosNuevaCita.telefono,
                      servicio: datosNuevaCita.servicio,
                      fecha: datosNuevaCita.fechaStr,
                      hora: datosNuevaCita.hora,
                      duracionTotal: 45,
                      estado: 'confirmada'
                    };

                    try {
                      await addDoc(collection(db, 'citas'), nuevaCitaDoc);
                      setSuccessMsg('Cita creada correctamente.');
                      setModalNuevaCitaAbierto(false);
                      setDatosNuevaCita({ clienteNombre: '', telefono: '', servicio: '', fechaStr: new Date().toISOString().split('T')[0], hora: '12:00 a. m.' });
                      setTimeout(() => setSuccessMsg(''), 3000);
                    } catch {
                      setErrorMsg('Error al registrar la cita.');
                    }
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition text-[10px] shadow-sm cursor-pointer"
                >
                  Crear Cita
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'servicios' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-100">Mis Servicios y Paquetes</h3>
                <p className="text-[9px] text-neutral-400">Configura los servicios y paquetes que ofreces a tus clientes</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={() => {
                    setServicioEditando(null);
                    setFormServicio({ nombre: '', descripcion: '', precio: '', duracion: '45 min', categoria: 'servicio', color: '#eab308' });
                    setShowServicioModal(true);
                  }}
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3 h-3" /> Servicio
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setServicioEditando(null);
                    setFormServicio({ nombre: '', descripcion: '', precio: '', duracion: '60 min', categoria: 'paquete', color: '#3b82f6' });
                    setShowServicioModal(true);
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-slate-200 border border-neutral-700 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3 h-3" /> Paquete
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {serviciosFirebase.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center text-neutral-400 text-[10px]">
                  No tienes servicios ni paquetes creados. Agrega tu primer elemento personalizado.
                </div>
              ) : (
                serviciosFirebase.map(serv => {
                  const esPaquete = serv.categoria === 'paquete';
                  const colorServicio = serv.color || (esPaquete ? '#3b82f6' : '#eab308');

                  return (
                    <div key={serv.id} className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex justify-between items-start shadow-xs gap-3">
                      <div className="flex items-start gap-2.5">
                        <div 
                          className="w-3 h-3 rounded-full mt-1 shrink-0 border border-white/20 shadow-xs" 
                          style={{ backgroundColor: colorServicio }} 
                          title={`Color: ${colorServicio}`}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[8px] px-2 py-0.5 rounded-lg font-bold uppercase border ${esPaquete ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                              {esPaquete ? 'Paquete' : 'Servicio'}
                            </span>
                            <p className="text-[11px] font-bold text-white">{serv.nombre}</p>
                            <span className="text-[8px] bg-neutral-800 border border-neutral-700 text-neutral-300 px-2 py-0.5 rounded-lg font-bold">Duración: {serv.duracion}</span>
                          </div>
                          <p className="text-[9px] text-neutral-400 leading-snug">{serv.descripcion || 'Sin descripción detallada.'}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1 shrink-0">
                        <p className="text-[11px] font-bold text-yellow-400">{serv.precio}</p>
                        <div className="flex items-center gap-1">
                          <button 
                            type="button"
                            onClick={() => {
                              setServicioEditando(serv);
                              setFormServicio({ 
                                nombre: serv.nombre, 
                                descripcion: serv.descripcion || '', 
                                precio: serv.precio, 
                                duracion: serv.duracion || '45 min',
                                categoria: serv.categoria || 'servicio',
                                color: serv.color || (serv.categoria === 'paquete' ? '#3b82f6' : '#eab308')
                              });
                              setShowServicioModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-yellow-400 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => eliminarServicioFirestore(serv.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/60 cursor-pointer transition-colors"
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

            {showServicioModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-slate-100">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h3 className="text-xs font-black uppercase text-white">
                      {servicioEditando ? '✏️ Editar Servicio / Paquete' : '✨ Nuevo Servicio o Paquete'}
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setShowServicioModal(false)} 
                      className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleGuardarServicio} className="space-y-3 text-[10px]">
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-400 uppercase text-[9px]">Tipo</label>
                      <select 
                        value={formServicio.categoria} 
                        onChange={e => setFormServicio({...formServicio, categoria: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-slate-100 outline-none focus:border-yellow-500 font-medium"
                      >
                        <option value="servicio">Servicio</option>
                        <option value="paquete">Paquete</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-neutral-400 uppercase text-[9px]">Nombre del Servicio / Paquete *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej: Corte Fade + Barba VIP" 
                        value={formServicio.nombre} 
                        onChange={e => setFormServicio({...formServicio, nombre: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-[11px] text-slate-100 outline-none focus:border-yellow-500" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-neutral-400 uppercase text-[9px]">Descripción</label>
                      <textarea 
                        rows="2" 
                        placeholder="Detalles de lo que incluye..." 
                        value={formServicio.descripcion} 
                        onChange={e => setFormServicio({...formServicio, descripcion: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-[11px] text-slate-100 outline-none focus:border-yellow-500 resize-none" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-neutral-400 uppercase text-[9px]">Color del Servicio</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5">
                          <input 
                            type="color" 
                            value={formServicio.color || '#eab308'} 
                            onChange={e => setFormServicio({...formServicio, color: e.target.value})}
                            className="w-7 h-6 rounded border-0 bg-transparent cursor-pointer outline-none"
                          />
                          <span className="ml-2 text-xs font-mono uppercase text-neutral-300">
                            {formServicio.color || '#eab308'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {['#eab308', '#f59e0b', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#06b6d4', '#f43f5e', '#64748b'].map((colorHex) => (
                          <button
                            key={colorHex}
                            type="button"
                            onClick={() => setFormServicio({ ...formServicio, color: colorHex })}
                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: colorHex }}
                            title={colorHex}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-neutral-400 uppercase text-[9px]">Precio *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ej: $45.000" 
                          value={formServicio.precio} 
                          onChange={e => setFormServicio({...formServicio, precio: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-[11px] text-slate-100 outline-none focus:border-yellow-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-neutral-400 uppercase text-[9px]">Duración</label>
                        <input 
                          type="text" 
                          placeholder="Ej: 45 min" 
                          value={formServicio.duracion} 
                          onChange={e => setFormServicio({...formServicio, duracion: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-[11px] text-slate-100 outline-none focus:border-yellow-500" 
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-neutral-800">
                      <button 
                        type="button" 
                        onClick={() => setShowServicioModal(false)}
                        className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2 rounded-xl text-[10px] transition-colors cursor-pointer border border-neutral-700"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase transition-colors cursor-pointer shadow-sm"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'facturacion' && (
          <Wallet />
        )}

        {activeTab === 'estadisticas' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs"><p className="text-[9px] font-bold text-slate-400 uppercase">Calificación</p><p className="text-2xl font-black text-indigo-600 mt-1">4.9 ★</p></div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs"><p className="text-[9px] font-bold text-slate-400 uppercase">Ingresos Semana</p><p className="text-xl font-black text-fuchsia-600 mt-1">$680.000</p></div>
          </div>
        )}

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

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex items-center justify-around z-40 shadow-lg">
        <button 
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer ${activeTab === 'agenda' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Calendar className="w-4 h-4" />
          Agenda
        </button>
        <button 
          onClick={() => setActiveTab('servicios')}
          className={`flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer ${activeTab === 'servicios' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Tag className="w-4 h-4" />
          Servicios
        </button>
        <button 
          onClick={() => setActiveTab('facturacion')}
          className={`flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer ${activeTab === 'facturacion' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <FileText className="w-4 h-4" />
          Finanzas
        </button>
        <button 
          onClick={() => setActiveTab('estadisticas')}
          className={`flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer ${activeTab === 'estadisticas' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Sparkles className="w-4 h-4" />
          Stats
        </button>
        <button 
          onClick={() => setActiveTab('perfil')}
          className={`flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer ${activeTab === 'perfil' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Edit3 className="w-4 h-4" />
          Perfil
        </button>
        <button 
          onClick={handleCerrarSesion}
          className="flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-colors cursor-pointer text-red-600 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          Salir
        </button>
      </nav>

      {citaSeleccionada && (() => {
        const estadoActual = (citaSeleccionada.estado || '').toLowerCase();
        const esFinalizada = estadoActual === 'finalizada' || estadoActual === 'finalizado';

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-900">
                    {citaSeleccionada.esBloqueo ? '🚫 Gestionar Horario No Disponible' : esFinalizada ? '📋 Detalle de Cita Finalizada' : 'Gestionar Cita / Servicio'}
                  </h3>
                  <p className="text-[9px] text-indigo-600 font-bold">{citaSeleccionada.esBloqueo ? citaSeleccionada.motivo : citaSeleccionada.servicio}</p>
                </div>
                <button onClick={() => setCitaSeleccionada(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                  {citaSeleccionada.esBloqueo ? (
                    <>
                      <p><strong className="text-slate-500">Motivo:</strong> <span className="text-rose-700 font-bold">{citaSeleccionada.motivo || 'No disponible'}</span></p>
                      <p><strong className="text-slate-500">Fecha:</strong> <span className="text-slate-900">{citaSeleccionada.fechaStr}</span></p>
                      <p><strong className="text-slate-500">Rango:</strong> <span className="text-slate-900">{citaSeleccionada.hora} - {citaSeleccionada.horaFin || 'N/A'}</span></p>
                    </>
                  ) : (
                    <>
                      <p><strong className="text-slate-500">Cliente:</strong> <span className="text-slate-900 font-bold">{citaSeleccionada.clienteNombre || citaSeleccionada.cliente}</span></p>
                      {citaSeleccionada.clienteTelefono && <p><strong className="text-slate-500">Teléfono:</strong> <span className="text-slate-900">{citaSeleccionada.clienteTelefono}</span></p>}
                      
                      <p><strong className="text-slate-500">Dirección:</strong> <span className="text-slate-900">{citaSeleccionada.direccion || 'No especificada'}</span></p>
                      <p><strong className="text-slate-500">Servicio:</strong> <span className="text-slate-900 font-medium">{citaSeleccionada.servicio || 'Servicio General'}</span></p>
                      <p><strong className="text-slate-500">Monto:</strong> <span className="text-indigo-600 font-bold">{citaSeleccionada.precioTotal || citaSeleccionada.monto || '$0'}</span></p>

                      <p><strong className="text-slate-500">Fecha actual:</strong> <span className="text-slate-900">{citaSeleccionada.fecha}</span></p>
                      <p><strong className="text-slate-500">Hora actual:</strong> <span className="text-slate-900">{citaSeleccionada.hora}</span></p>
                      <p><strong className="text-slate-500">Estado:</strong> <span className="uppercase text-emerald-600 font-bold">{citaSeleccionada.estado}</span></p>
                    </>
                  )}
                </div>

                {!citaSeleccionada.esBloqueo && !esFinalizada && (
                  <div className="space-y-2 pt-1">
                    <label className="text-[8px] text-slate-400 font-bold block mb-0.5 uppercase">Cambiar / Actualizar Servicio</label>
                    <select 
                      value={nuevoServicioCita} 
                      onChange={e => setNuevoServicioCita(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium"
                    >
                      <option value={citaSeleccionada.servicio}>{citaSeleccionada.servicio} (Actual)</option>
                      {serviciosFirebase.map((serv) => (
                        <option key={serv.id} value={serv.nombre}>{serv.nombre} - {serv.precio}</option>
                      ))}
                    </select>
                  </div>
                )}

                {!citaSeleccionada.esBloqueo && !esFinalizada && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="font-bold text-slate-700 uppercase text-[9px]">Reprogramar Fecha y Hora:</p>
                    <input 
                      type="date" 
                      value={nuevaFechaCita} 
                      onChange={e => setNuevaFechaCita(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 outline-none focus:border-indigo-600 font-medium" 
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-slate-100">
                {esFinalizada ? (
                  <button
                    type="button"
                    onClick={() => setCitaSeleccionada(null)}
                    className="w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-slate-800 text-white hover:bg-slate-900 border border-slate-700 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Cerrar Detalle
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => actualizarCitaFirestore('cancelada')}
                      disabled={modalLoading}
                      className="px-3 py-2 rounded-xl text-[10px] font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                    >
                      ❌ Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={() => actualizarCitaFirestore('finalizada')}
                      disabled={modalLoading}
                      className="px-3 py-2 rounded-xl text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-800 transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1"
                    >
                      ✅ Finalizar
                    </button>

                    <button
                      type="button"
                      onClick={() => actualizarCitaFirestore('confirmada')}
                      disabled={modalLoading}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-blue-600 text-white hover:bg-blue-700 border border-blue-800 transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1"
                    >
                      {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Guardar</>}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}